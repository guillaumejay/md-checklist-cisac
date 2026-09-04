(function (app) {
  "use strict";
  const API = "https://api.github.com/gists";
  const FILE = "md-checklist.json";
  function headers(token) {
    const value = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (token) value.Authorization = "Bearer " + token;
    return value;
  }
  async function request(url, options) {
    let response;
    try { response = await fetch(url, options); }
    catch (_) { throw new Error("GitHub is unreachable"); }
    if (!response.ok) {
      const error = new Error(response.status === 404 ? "Gist not found" : response.status === 401 || response.status === 403 ? "Invalid token or access denied" : "GitHub error (" + response.status + ")");
      error.auth = response.status === 401 || response.status === 403;
      throw error;
    }
    try { return await response.json(); } catch (_) { throw new Error("GitHub returned an unreadable response"); }
  }
  function parse(gist) {
    const file = gist.files && gist.files[FILE];
    if (!file) throw new Error(FILE + " is missing from this Gist");
    let snapshot;
    try { snapshot = JSON.parse(file.content); } catch (_) { throw new Error("The Gist contains invalid JSON"); }
    if (!snapshot || snapshot.version !== 2 || typeof snapshot.md !== "string") throw new Error("This is not a valid md-checklist Gist");
    return snapshot;
  }
  app.gist = {
    async read(id) { const gist = await request(API + "/" + encodeURIComponent(id), { headers: headers() }); return { snapshot: parse(gist), updatedAt: gist.updated_at }; },
    async create(md, token) {
      const content = JSON.stringify({ version: 2, md, updatedAt: new Date().toISOString() });
      const body = { description: "md-checklist", public: false, files: { [FILE]: { content } } };
      const gist = await request(API, { method: "POST", headers: Object.assign(headers(token), { "Content-Type": "application/json" }), body: JSON.stringify(body) });
      return gist.id;
    },
    async update(id, md, token) {
      const content = JSON.stringify({ version: 2, md, updatedAt: new Date().toISOString() });
      await request(API + "/" + encodeURIComponent(id), { method: "PATCH", headers: Object.assign(headers(token), { "Content-Type": "application/json" }), body: JSON.stringify({ files: { [FILE]: { content } } }) });
      return content;
    }
  };
  app.extractGistId = function (value) {
    const trimmed = value.trim();
    if (/^[a-f0-9]+$/i.test(trimmed)) return trimmed;
    const hash = trimmed.match(/[#&]gist=([a-f0-9]+)/i);
    if (hash) return hash[1];
    const url = trimmed.match(/gist\.github\.com\/(?:[^/]+\/)?([a-f0-9]+)/i);
    return url ? url[1] : null;
  };
})(window.MdChecklist = window.MdChecklist || {});
