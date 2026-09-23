(function (app) {
  "use strict";
  const strings = {
    en: {
      library: "My checklists", localIndex: "local Gist index", tokenTitle: "GitHub access", tokenHelp: "One token is used for every checklist on this browser.", tokenPlaceholder: "GitHub token with Gists permission", saveToken: "Save token", tokenSaved: "Token saved on this browser.", tokenEmpty: "Paste a token first.", createTitle: "Create a checklist", createHelp: "A new secret Gist will be created from a small Markdown template.", create: "Create checklist", addTitle: "Add an existing Gist", addHelp: "Paste a Gist ID, a GitHub Gist URL, or an md-checklist sharing link.", addPlaceholder: "Gist ID or URL", add: "Add to library", empty: "No checklists yet. Create one or add an existing Gist.", open: "Open", share: "Copy read-only link", remove: "Remove", copied: "Sharing link copied.", loading: "Loading…", added: "Checklist added.", created: "Checklist created.", tokenNeeded: "Save a GitHub token before creating a checklist.", badId: "No valid Gist ID was found.", build: "version", lang: "FR"
    },
    fr: {
      library: "Mes checklists", localIndex: "index Gist local", tokenTitle: "Accès GitHub", tokenHelp: "Un seul token est utilisé pour toutes les checklists de ce navigateur.", tokenPlaceholder: "Token GitHub autorisé à gérer les Gists", saveToken: "Enregistrer le token", tokenSaved: "Token enregistré sur ce navigateur.", tokenEmpty: "Colle d'abord un token.", createTitle: "Créer une checklist", createHelp: "Un nouveau Gist secret sera créé avec un petit modèle Markdown.", create: "Créer la checklist", addTitle: "Ajouter un Gist existant", addHelp: "Colle un identifiant Gist, une URL GitHub Gist ou un lien de partage md-checklist.", addPlaceholder: "Identifiant ou URL du Gist", add: "Ajouter à la bibliothèque", empty: "Aucune checklist. Crée-en une ou ajoute un Gist existant.", open: "Ouvrir", share: "Copier le lien en lecture seule", remove: "Retirer", copied: "Lien de partage copié.", loading: "Chargement…", added: "Checklist ajoutée.", created: "Checklist créée.", tokenNeeded: "Enregistre un token GitHub avant de créer une checklist.", badId: "Aucun identifiant Gist valide trouvé.", build: "version", lang: "EN"
    }
  };
  app.language = app.store.get(app.keys.lang) === "fr" ? "fr" : "en";
  app.t = key => strings[app.language][key] || key;
  app.toggleLanguage = function () { app.language = app.language === "en" ? "fr" : "en"; app.store.set(app.keys.lang, app.language); location.reload(); };
})(window.MdChecklist = window.MdChecklist || {});
