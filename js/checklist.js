(function (app) {
  "use strict";
  const $ = id => document.getElementById(id);
  const copy = {
    en: { library:"Library", edit:"Edit Markdown", view:"View checklist", reset:"Uncheck all", save:"Save now", refresh:"Refresh", share:"Copy read-only link", readonly:"read only", owner:"owner · Gist sync", loading:"Loading Gist…", loaded:"Gist loaded.", saving:"Saving…", saved:"Saved.", copied:"Sharing link copied.", noId:"No Gist ID was provided.", none:"no items to check", done:"done", progress:"steps done" },
    fr: { library:"Bibliothèque", edit:"Modifier le Markdown", view:"Voir la checklist", reset:"Tout décocher", save:"Sauvegarder", refresh:"Rafraîchir", share:"Copier le lien en lecture seule", readonly:"lecture seule", owner:"propriétaire · synchro Gist", loading:"Chargement du Gist…", loaded:"Gist chargé.", saving:"Sauvegarde…", saved:"Sauvegardé.", copied:"Lien de partage copié.", noId:"Aucun identifiant Gist fourni.", none:"aucune case à cocher", done:"terminé", progress:"étapes faites" }
  };
  const text = key => copy[app.language][key];
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  const gistId = params.get("gist");
  let readonly = params.get("mode") === "read" || !app.store.get(app.keys.token);
  let lines = [], editing = false, timer = null, busy = false, lastPayload = null;

  function status(message, error) { $("status").textContent = message || ""; $("status").classList.toggle("error", !!error); }
  function markdown() { return lines.join("\n"); }
  function render() {
    const sheet = $("sheet"); sheet.innerHTML = ""; let done = 0, total = 0, number = 0, title = null;
    lines.forEach((raw, index) => {
      let match;
      if ((match = raw.match(app.RE_TASK))) {
        total++; const checked = match[2].toLowerCase() === "x"; if (checked) done++;
        const nested = match[1].length >= 2; if (!nested) number++;
        const button = document.createElement("button"); button.type = "button"; button.className = "task" + (nested ? " sub" : ""); button.disabled = readonly; button.setAttribute("aria-pressed", String(checked));
        button.innerHTML = '<span class="idx">' + (nested ? "" : number) + '</span><span class="tick"><svg viewBox="0 0 12 12"><path d="M2 6.3 4.6 9 10 3"/></svg></span><span class="txt">' + app.inline(match[3]) + "</span>";
        button.addEventListener("click", () => { lines[index] = raw.replace(app.RE_TASK, (_, space, mark, value) => space + "- [" + (mark.toLowerCase() === "x" ? " " : "x") + "] " + value); render(); scheduleSave(); });
        sheet.appendChild(button); return;
      }
      if ((match = raw.match(app.RE_HEAD))) { if (title === null && match[1].length === 1) { title = match[2]; return; } const node = document.createElement("div"); node.className = "head"; node.innerHTML = app.inline(match[2]); sheet.appendChild(node); return; }
      if ((match = raw.match(app.RE_NOTE))) { const node = document.createElement("div"); node.className = "note"; node.innerHTML = app.inline(match[2]); sheet.appendChild(node); return; }
      if (raw.trim()) { const node = document.createElement("div"); node.className = "note"; node.innerHTML = app.inline(raw.trim()); sheet.appendChild(node); }
    });
    $("title").textContent = title || "Checklist"; document.title = (title || "Checklist") + " — " + done + "/" + total;
    $("count").textContent = done + " / " + total; $("countLabel").textContent = total === 0 ? text("none") : done === total ? text("done") : text("progress"); $("fill").style.transform = "scaleX(" + (total ? done / total : 0) + ")";
  }
  async function save(force) {
    if (readonly || !gistId || busy) return;
    const current = markdown(); if (!force && current === lastPayload) return;
    busy = true; status(text("saving"), false);
    try { await app.gist.update(gistId, current, app.store.get(app.keys.token)); lastPayload = current; status(text("saved"), false); app.rememberGist({ id: gistId, title: app.stats(current).title }); }
    catch (error) {
      if (error.auth) { app.store.del(app.keys.token); readonly = true; applyLanguage(); render(); }
      status(error.message, true);
    }
    finally { busy = false; }
  }
  function scheduleSave() { clearTimeout(timer); timer = setTimeout(() => save(false), 2000); }
  async function loadRemote() {
    if (!gistId || busy) return; busy = true; status(text("loading"), false);
    try { const remote = await app.gist.read(gistId, readonly ? null : app.store.get(app.keys.token)); lines = remote.snapshot.md.replace(/\r\n?/g, "\n").split("\n"); lastPayload = markdown(); render(); app.rememberGist({ id: gistId, title: app.stats(lastPayload).title }); status(text("loaded"), false); }
    catch (error) { status(error.message, true); }
    finally { busy = false; }
  }
  function applyLanguage() {
    document.documentElement.lang = app.language; $("homeButton").textContent = text("library"); $("editButton").textContent = editing ? text("view") : text("edit"); $("resetButton").textContent = text("reset"); $("saveButton").textContent = text("save"); $("refreshButton").textContent = text("refresh"); $("shareButton").textContent = text("share"); $("modeLabel").textContent = readonly ? text("readonly") : text("owner"); $("langButton").textContent = app.t("lang");
    $("editButton").disabled = readonly || !gistId; $("resetButton").disabled = readonly || !gistId; $("saveButton").classList.toggle("hidden", readonly || !gistId); $("refreshButton").disabled = !gistId; $("shareButton").disabled = !gistId;
  }
  $("homeButton").addEventListener("click", () => { location.href = "index.html"; });
  $("langButton").addEventListener("click", app.toggleLanguage);
  $("editButton").addEventListener("click", () => { if (readonly) return; editing = !editing; if (editing) { $("editor").value = markdown(); } else { lines = $("editor").value.replace(/\r\n?/g, "\n").split("\n"); render(); scheduleSave(); } $("sheet").classList.toggle("hidden", editing); $("editor").classList.toggle("hidden", !editing); applyLanguage(); if (editing) $("editor").focus(); });
  $("resetButton").addEventListener("click", () => { if (readonly) return; lines = lines.map(line => line.replace(app.RE_TASK, (_, space, mark, value) => space + "- [ ] " + value)); render(); scheduleSave(); });
  $("saveButton").addEventListener("click", () => save(true)); $("refreshButton").addEventListener("click", loadRemote);
  $("shareButton").addEventListener("click", async () => { const url = location.href.replace(/#.*$/, "") + "#gist=" + encodeURIComponent(gistId) + "&mode=read"; try { await navigator.clipboard.writeText(url); status(text("copied"), false); } catch (_) { window.prompt(text("share"), url); } });
  applyLanguage();
  if (!gistId) status(text("noId"), true); else loadRemote();
  setInterval(() => { if (readonly && document.visibilityState !== "hidden") loadRemote(); }, 30000);
})(window.MdChecklist);
