const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function context(localStorage) {
  const window = {};
  const sandbox = { window, localStorage, Map, URLSearchParams, TextEncoder, TextDecoder, fetch: async () => { throw new Error("not mocked"); } };
  vm.createContext(sandbox);
  for (const file of ["js/storage.js", "js/markdown.js", "js/gist.js"]) {
    vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  }
  return { app: window.MdChecklist, sandbox };
}

const values = new Map();
const storage = { getItem: key => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
const { app } = context(storage);

assert.equal(app.extractGistId("abc123"), "abc123");
assert.equal(app.extractGistId("https://gist.github.com/alice/abc123"), "abc123");
assert.equal(app.extractGistId("https://example.test/checklist.html#gist=abc123&mode=read"), "abc123");
assert.equal(app.extractGistId("not a gist"), null);

app.rememberGist({ id: "abc123", title: "First" });
app.rememberGist({ id: "def456", title: "Second" });
assert.deepEqual(JSON.parse(JSON.stringify(app.readLibrary())).map(item => item.id), ["def456", "abc123"]);

assert.deepEqual(JSON.parse(JSON.stringify(app.stats("# Test\n- [x] One\n- [ ] Two"))), { done: 1, total: 2, title: "Test" });
assert.match(app.inline('[safe](https://example.test/"bad)'), /&quot;/);

const throwingStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
const fallback = context(throwingStorage).app;
fallback.store.set("key", "value");
assert.equal(fallback.store.get("key"), "value");

async function testGistBoundary() {
  const mocked = context(storage);
  mocked.sandbox.fetch = async () => ({
    ok: true,
    json: async () => ({ updated_at: "2026-01-01", files: { "md-checklist.json": { content: JSON.stringify({ version: 2, md: "# Remote" }) } } })
  });
  const remote = await mocked.app.gist.read("abc123");
  assert.equal(remote.snapshot.md, "# Remote");

  mocked.sandbox.fetch = async () => ({ ok: true, json: async () => ({ files: { "md-checklist.json": { content: "{}" } } }) });
  await assert.rejects(() => mocked.app.gist.read("abc123"), /valid md-checklist/);
}

testGistBoundary().then(() => console.log("core tests passed"));
