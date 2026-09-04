(function (app) {
  "use strict";
  const memory = new Map();
  let persistent = true;
  try { localStorage.setItem("mdck!probe", "1"); localStorage.removeItem("mdck!probe"); }
  catch (_) { persistent = false; }
  app.store = {
    persistent,
    get(key) { try { return persistent ? localStorage.getItem(key) : (memory.get(key) || null); } catch (_) { return null; } },
    set(key, value) { try { persistent ? localStorage.setItem(key, value) : memory.set(key, value); } catch (_) {} },
    del(key) { try { persistent ? localStorage.removeItem(key) : memory.delete(key); } catch (_) {} }
  };
  app.keys = { token: "mdck!gist-token", legacyId: "mdck!gist-id", library: "mdck!library", lang: "mdck!lang" };
  app.readLibrary = function () {
    try {
      const value = JSON.parse(app.store.get(app.keys.library) || "[]");
      return Array.isArray(value) ? value.filter(x => x && typeof x.id === "string") : [];
    } catch (_) { return []; }
  };
  app.writeLibrary = items => app.store.set(app.keys.library, JSON.stringify(items));
  app.rememberGist = function (record) {
    const items = app.readLibrary().filter(x => x.id !== record.id);
    items.unshift({ id: record.id, title: record.title || "Untitled checklist", addedAt: record.addedAt || Date.now() });
    app.writeLibrary(items);
  };
})(window.MdChecklist = window.MdChecklist || {});
