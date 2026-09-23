(function (app) {
  "use strict";
  const $ = id => document.getElementById(id);
  const DEFAULT = "# Chat checklist\n\n- [ ] Read the latest messages\n- [ ] Reply to open questions\n  - Keep the answer short and clear\n- [ ] Mark the conversation as resolved";
  let busy = false;

  function setStatus(message, error) {
    const el = $("actionStatus"); el.textContent = message || ""; el.classList.toggle("error", !!error);
  }
  function checklistUrl(id, readonly) {
    return "checklist.html#gist=" + encodeURIComponent(id) + (readonly ? "&mode=read" : "");
  }
  function migrateLegacy() {
    const id = app.store.get(app.keys.legacyId);
    if (id && !app.readLibrary().some(item => item.id === id)) app.rememberGist({ id, title: "Checklist" });
    app.store.del(app.keys.legacyId);
  }
  async function hydrate(item, nameEl, metaEl) {
    try {
      const remote = await app.gist.read(item.id, app.store.get(app.keys.token));
      const stats = app.stats(remote.snapshot.md);
      nameEl.textContent = stats.title;
      metaEl.textContent = stats.done + "/" + stats.total + " · " + item.id.slice(0, 8) + "…";
      app.rememberGist({ id: item.id, title: stats.title, addedAt: item.addedAt });
    } catch (error) { metaEl.textContent = item.id.slice(0, 8) + "… · " + error.message; }
  }
  function renderLibrary() {
    const list = $("libraryList"), items = app.readLibrary();
    list.innerHTML = ""; $("libraryCount").textContent = String(items.length);
    if (!items.length) { const empty = document.createElement("div"); empty.className = "empty"; empty.textContent = app.t("empty"); list.appendChild(empty); return; }
    items.forEach(item => {
      const row = document.createElement("div"); row.className = "library-item";
      const open = document.createElement("button"); open.className = "library-open"; open.type = "button";
      const name = document.createElement("span"); name.className = "library-name"; name.textContent = item.title;
      const meta = document.createElement("span"); meta.className = "meta"; meta.textContent = app.t("loading");
      open.append(name, meta); open.addEventListener("click", () => { location.href = checklistUrl(item.id, false); });
      const actions = document.createElement("div"); actions.className = "actions";
      const share = document.createElement("button"); share.className = "btn"; share.textContent = app.t("share");
      share.addEventListener("click", async () => {
        const url = new URL(checklistUrl(item.id, true), location.href).href;
        try { await navigator.clipboard.writeText(url); setStatus(app.t("copied"), false); }
        catch (_) { window.prompt(app.t("share"), url); }
      });
      const remove = document.createElement("button"); remove.className = "btn danger"; remove.textContent = app.t("remove");
      remove.addEventListener("click", () => { app.writeLibrary(app.readLibrary().filter(x => x.id !== item.id)); renderLibrary(); });
      actions.append(share, remove); row.append(open, actions); list.appendChild(row); hydrate(item, name, meta);
    });
  }
  function applyLanguage() {
    document.documentElement.lang = app.language;
    const map = { pageTitle:"library", pageMeta:"localIndex", tokenTitle:"tokenTitle", tokenHelp:"tokenHelp", saveToken:"saveToken", createTitle:"createTitle", createHelp:"createHelp", createButton:"create", addTitle:"addTitle", addHelp:"addHelp", addButton:"add", libraryTitle:"library" };
    Object.keys(map).forEach(id => { $(id).textContent = app.t(map[id]); });
    $("tokenInput").placeholder = app.t("tokenPlaceholder"); $("gistInput").placeholder = app.t("addPlaceholder"); $("langButton").textContent = app.t("lang");
  }
  $("saveToken").addEventListener("click", () => { const token = $("tokenInput").value.trim(); if (!token) { $("tokenStatus").textContent = app.t("tokenEmpty"); return; } app.store.set(app.keys.token, token); $("tokenInput").value = ""; $("tokenStatus").textContent = app.t("tokenSaved"); });
  $("createButton").addEventListener("click", async () => {
    const token = app.store.get(app.keys.token); if (!token) { setStatus(app.t("tokenNeeded"), true); return; }
    if (busy) return; busy = true; $("createButton").disabled = true; setStatus(app.t("loading"), false);
    try { const id = await app.gist.create(DEFAULT, token); app.rememberGist({ id, title: "New checklist" }); setStatus(app.t("created"), false); location.href = checklistUrl(id, false); }
    catch (error) { if (error.auth) app.store.del(app.keys.token); setStatus(error.message, true); }
    finally { busy = false; $("createButton").disabled = false; }
  });
  $("addButton").addEventListener("click", async () => {
    const id = app.extractGistId($("gistInput").value); if (!id) { setStatus(app.t("badId"), true); return; }
    if (busy) return; busy = true; $("addButton").disabled = true; setStatus(app.t("loading"), false);
    try { const remote = await app.gist.read(id, app.store.get(app.keys.token)); app.rememberGist({ id, title: app.stats(remote.snapshot.md).title }); $("gistInput").value = ""; setStatus(app.t("added"), false); renderLibrary(); }
    catch (error) { setStatus(error.message, true); }
    finally { busy = false; $("addButton").disabled = false; }
  });
  $("langButton").addEventListener("click", app.toggleLanguage);
  migrateLegacy(); applyLanguage(); renderLibrary();
})(window.MdChecklist);
