(function (app) {
  "use strict";
  app.RE_TASK = /^(\s*)[-*+]\s+\[([ xX])\]\s*(.*)$/;
  app.RE_HEAD = /^(#{1,6})\s+(.*)$/;
  app.RE_NOTE = /^(\s*)[-*+]\s+(.*)$/;
  app.escapeHtml = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  app.inline = function (s) {
    return app.escapeHtml(s).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  };
  app.stats = function (md) {
    let done = 0, total = 0, title = null;
    md.split("\n").forEach(line => {
      let match;
      if ((match = line.match(app.RE_TASK))) { total++; if (match[2].toLowerCase() === "x") done++; }
      else if (title === null && (match = line.match(/^#\s+(.*)$/))) title = match[1].trim();
    });
    return { done, total, title: title || "Untitled checklist" };
  };
})(window.MdChecklist = window.MdChecklist || {});
