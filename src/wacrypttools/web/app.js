(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var PALETTE = ["#00a884", "#53bdeb", "#e26ab6", "#d9822b", "#7f66ff", "#e0445a", "#4c9a2a", "#c2a000", "#5b8def", "#b5651d"];
  var PAGE = 120;

  // ---------- i18n ----------
  var STRINGS = {
    "pt-BR": {
      noData: "Pasta 'data' não encontrada. Mantenha index.html e a pasta data juntos.",
      emptyInfo: function(chats, messages) { return chats + " conversas e " + messages + " mensagens. Selecione uma conversa à esquerda."; },
      noChats: "Nenhuma conversa encontrada.",
      loading: "Carregando...",
      loadError: function(id) { return "Não foi possível carregar data/chat_" + id + ".js."; },
      fulltextLoading: "Carregando índice de mensagens...",
      fulltextError: "Não foi possível carregar data/fulltext.js.",
      fulltextMin: "Digite ao menos 2 caracteres para pesquisar nas mensagens.",
      resultsHead: function(n, capped) { return n + " resultado(s)" + (capped ? " (mostrando 500)" : ""); },
      youPrefix: "Você: ",
      you: "Você",
      mediaMissing: function(label) { return label + " não disponível (arquivo não encontrado na pasta Media)"; },
      unavailable: "Arquivo não disponível neste backup",
      docOpen: "Abrir",
      locationLabel: "Localização",
      adLabel: "Conversa iniciada por anúncio",
      adLink: "Ver anúncio (requer internet)",
      callVideo: "Chamada de vídeo",
      callVoice: "Chamada de voz",
      callNoAnswer: " sem resposta",
      callMissed: " perdida",
      pollLabel: "Enquete",
      votes: function(n) { return n + " voto(s)"; },
      contactLabel: "Contato: ",
      deleted: "Esta mensagem foi apagada",
      sysDefault: "Aviso do sistema",
      mediaLabel: "Mídia",
      edited: "editada",
      quotedMedia: "Mídia",
      chatSub: function(isGroup, phone, count) { return (isGroup ? "Grupo · " : (phone ? "+" + phone + " · " : "")) + count + " mensagens"; },
      exportPdfTitle: "Exportar conversas em PDF",
      exportTxtTitle: "Exportar conversas em Texto",
      exportPdfNotice: "Áudio não é exportado. Imagens são incluídas se disponíveis na pasta Media.",
      exportTxtNotice: "Áudio e imagens não são exportados. Apenas texto.",
      exportCount: function(n) { return n + " selecionada(s)"; },
      exportLoadError: function(title) { return "Conversa: " + title + "\n[Erro ao carregar mensagens]"; },
      popupBlocked: "Por favor, permita popups para este site para gerar o PDF.",
      txtConversation: "Conversa: ",
      txtPhone: "Telefone: ",
      txtTotal: "Total de mensagens: ",
      txtExported: function(d) { return "Exportado em: " + d; },
      txtSystem: "[Sistema] ",
      txtImgNA: "[Imagem - arquivo não disponível]",
      txtImg: "[Imagem]",
      txtVideo: "[Vídeo]",
      txtAudio: "[Áudio - não exportado]",
      txtSticker: "[Figurinha]",
      txtDoc: function(n) { return "[Documento: " + n + "]"; },
      txtLocation: function(pl) { return "[Localização" + (pl ? ": " + pl : "") + "]"; },
      txtCallVideo: "[Chamada de vídeo]",
      txtCallVoice: "[Chamada de voz]",
      txtPoll: function(x) { return "[Enquete: " + x + "]"; },
      txtContact: function(x) { return "[Contato: " + x + "]"; },
      txtDeleted: "[Mensagem apagada]",
      txtReply: function(x) { return "[Respondendo: " + x + "]"; },
      kindImg: "Imagem", kindVideo: "Vídeo", kindAudio: "Áudio", kindDoc: "Documento",
      kindGif: "GIF", kindSticker: "Figurinha",
      pdfLang: "pt-BR",
      pdfTitle: "Backup WhatsApp Business",
      pdfDocLabel: "Documento: ",
      pdfLocationLabel: "Localização",
      pdfCallVideo: "Chamada de vídeo",
      pdfCallVoice: "Chamada de voz",
      pdfPoll: "<b>Enquete:</b> ",
      pdfContact: "Contato: ",
      pdfAudioNote: "[Áudio — não exportado]",
      matchCount: function(pos, total) { return (pos + 1) + " de " + total; },
      noMatches: "0 resultados",
      dateLocale: "pt-BR",
    },
    "en": {
      noData: "Folder 'data' not found. Keep index.html and the data folder together.",
      emptyInfo: function(chats, messages) { return chats + " chats and " + messages + " messages. Select a chat on the left."; },
      noChats: "No chats found.",
      loading: "Loading...",
      loadError: function(id) { return "Could not load data/chat_" + id + ".js."; },
      fulltextLoading: "Loading message index...",
      fulltextError: "Could not load data/fulltext.js.",
      fulltextMin: "Type at least 2 characters to search messages.",
      resultsHead: function(n, capped) { return n + " result(s)" + (capped ? " (showing 500)" : ""); },
      youPrefix: "You: ",
      you: "You",
      mediaMissing: function(label) { return label + " unavailable (file not found in Media folder)"; },
      unavailable: "File not available in this backup",
      docOpen: "Open",
      locationLabel: "Location",
      adLabel: "Conversation started from ad",
      adLink: "View ad (requires internet)",
      callVideo: "Video call",
      callVoice: "Voice call",
      callNoAnswer: " no answer",
      callMissed: " missed",
      pollLabel: "Poll",
      votes: function(n) { return n + " vote(s)"; },
      contactLabel: "Contact: ",
      deleted: "This message was deleted",
      sysDefault: "System notice",
      mediaLabel: "Media",
      edited: "edited",
      quotedMedia: "Media",
      chatSub: function(isGroup, phone, count) { return (isGroup ? "Group · " : (phone ? "+" + phone + " · " : "")) + count + " messages"; },
      exportPdfTitle: "Export chats as PDF",
      exportTxtTitle: "Export chats as Text",
      exportPdfNotice: "Audio is not exported. Images are included if available in the Media folder.",
      exportTxtNotice: "Audio and images are not exported. Text only.",
      exportCount: function(n) { return n + " selected"; },
      exportLoadError: function(title) { return "Chat: " + title + "\n[Error loading messages]"; },
      popupBlocked: "Please allow pop-ups for this site to generate the PDF.",
      txtConversation: "Chat: ",
      txtPhone: "Phone: ",
      txtTotal: "Total messages: ",
      txtExported: function(d) { return "Exported at: " + d; },
      txtSystem: "[System] ",
      txtImgNA: "[Image - file not available]",
      txtImg: "[Image]",
      txtVideo: "[Video]",
      txtAudio: "[Audio - not exported]",
      txtSticker: "[Sticker]",
      txtDoc: function(n) { return "[Document: " + n + "]"; },
      txtLocation: function(pl) { return "[Location" + (pl ? ": " + pl : "") + "]"; },
      txtCallVideo: "[Video call]",
      txtCallVoice: "[Voice call]",
      txtPoll: function(x) { return "[Poll: " + x + "]"; },
      txtContact: function(x) { return "[Contact: " + x + "]"; },
      txtDeleted: "[Message deleted]",
      txtReply: function(x) { return "[Replying to: " + x + "]"; },
      kindImg: "Image", kindVideo: "Video", kindAudio: "Audio", kindDoc: "Document",
      kindGif: "GIF", kindSticker: "Sticker",
      pdfLang: "en",
      pdfTitle: "WhatsApp Backup",
      pdfDocLabel: "Document: ",
      pdfLocationLabel: "Location",
      pdfCallVideo: "Video call",
      pdfCallVoice: "Voice call",
      pdfPoll: "<b>Poll:</b> ",
      pdfContact: "Contact: ",
      pdfAudioNote: "[Audio — not exported]",
      matchCount: function(pos, total) { return (pos + 1) + " of " + total; },
      noMatches: "0 results",
      dateLocale: "en-US",
    }
  };
  var L = STRINGS[window.LANG] || STRINGS["pt-BR"];

  // ---------- apply HTML i18n ----------
  (function applyI18nHtml() {
    if ((window.LANG || "pt-BR") === "pt-BR") return;
    var EN_HTML = {
      "themeBtn":       { title: "Toggle theme", "aria-label": "Toggle theme" },
      "menuBtn":        { title: "Menu", "aria-label": "Menu" },
      "menuExportPdf":  { text: "Export chats as PDF" },
      "menuExportTxt":  { text: "Export chats as Text" },
      "menuInstall":    { text: "Install on computer" },
      "q":              { placeholder: "Search by name, phone or text" },
      "searchBtn":      { title: "Search in chat", "aria-label": "Search in chat" },
      "exportModalClose": { "aria-label": "Close" },
      "exportSelectAll":  { text: "Select all" },
      "exportClearAll":   { text: "Clear selection" },
      "exportCancel":     { text: "Cancel" },
      "exportConfirm":    { text: "Export" },
      "exportQ":          { placeholder: "Filter chats..." },
      "installModalClose":{ "aria-label": "Close" },
      "installCancel":    { text: "Close" },
      "lbClose":          { "aria-label": "Close" },
      "lbPrev":           { "aria-label": "Previous" },
      "lbNext":           { "aria-label": "Next" },
      "cqUp":             { "aria-label": "Previous" },
      "cqDown":           { "aria-label": "Next" },
      "cqClose":          { "aria-label": "Close" },
      "backBtn":          { "aria-label": "Back" },
    };
    Object.keys(EN_HTML).forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      var cfg = EN_HTML[id];
      if (cfg.text !== undefined) {
        var svg = el.querySelector("svg");
        el.childNodes.forEach(function(n) { if (n.nodeType === 3) n.textContent = ""; });
        if (svg) el.insertBefore(document.createTextNode(" " + cfg.text), svg.nextSibling);
        else el.textContent = cfg.text;
      }
      if (cfg.title) el.title = cfg.title;
      if (cfg["aria-label"]) el.setAttribute("aria-label", cfg["aria-label"]);
      if (cfg.placeholder) el.placeholder = cfg.placeholder;
    });
    // tabs
    var tabBtns = document.querySelectorAll("#tabs button");
    var tabLabels = ["Chats", "Messages"];
    tabBtns.forEach(function(b, i) { if (tabLabels[i]) b.textContent = tabLabels[i]; });
    // filters
    var filterBtns = document.querySelectorAll("#filters button");
    var filterLabels = ["All", "Groups", "Direct", "With media"];
    filterBtns.forEach(function(b, i) { if (filterLabels[i]) b.textContent = filterLabels[i]; });
    // sort bar
    var sortLabel = document.querySelector("#sortBar .sort-label");
    if (sortLabel) sortLabel.textContent = "Sort: ";
    var sortBtns = document.querySelectorAll("#sortBar button");
    var sortData = [
      { title: "Newest first", text: "Date ↓" },
      { title: "Oldest first", text: "Date ↑" },
      { title: "Name A→Z",    text: "Name" }
    ];
    sortBtns.forEach(function(b, i) {
      if (sortData[i]) { b.title = sortData[i].title; b.textContent = sortData[i].text; }
    });
    // empty panel
    var h2 = document.querySelector("#empty h2");
    if (h2) h2.textContent = "WhatsApp Backup";
    var emptyInfo = document.getElementById("emptyInfo");
    // emptyInfo text is set later by JS after CHATS loads
    var muted = document.querySelector("#empty .muted");
    if (muted) muted.textContent = "Read-only. Works offline.";
    // chat footer
    var footer = document.querySelector("#chat footer");
    if (footer) footer.textContent = "Read-only backup";
    // search in chat placeholder
    var cq = document.getElementById("cq");
    if (cq) cq.placeholder = "Search in this chat";
    // install modal title
    var installTitle = document.querySelector("#installModal .modal-head span");
    if (installTitle) installTitle.textContent = "Install on computer";
    // date btn aria
    var dateBtn = document.querySelector(".date-btn");
    if (dateBtn) { dateBtn.title = "Go to date"; dateBtn.setAttribute("aria-label", "Go to date"); }
    // brand
    var brand = document.querySelector(".brand");
    if (brand) brand.textContent = "WhatsApp Backup";
    document.title = "WhatsApp Backup";
    // install OS tabs
    var osTabs = document.querySelectorAll(".install-os-tab");
    // labels stay (Windows/macOS/Linux are the same in English)
    // install advanced summaries
    document.querySelectorAll(".install-advanced summary").forEach(function(s) {
      s.textContent = "Advanced: install automatically with a script";
    });
    // install tips and steps are in pt-BR but are detailed OS instructions —
    // the full English install guide is in README.md
  })();

  // ---------- util ----------
  function fold(str) {
    return String(str).toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  }
  function foldMap(str) {
    var folded = "", map = [];
    for (var i = 0; i < str.length; i++) {
      var f = str[i].toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
      for (var j = 0; j < f.length; j++) { folded += f[j]; map.push(i); }
    }
    return { folded: folded, map: map };
  }
  function h(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  }
  function colorFor(key) {
    var n = 0, s = String(key);
    for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
    return PALETTE[n % PALETTE.length];
  }
  function initial(title) {
    var m = String(title).replace(/^[^\p{L}\p{N}]+/u, "");
    return (m[0] || "#").toUpperCase();
  }
  function avatar(el, chat) {
    el.style.background = colorFor(chat.id);
    el.textContent = chat.isGroup ? "G" : (chat.phone ? "#" : initial(chat.title));
    if (!chat.isGroup && !/^\+|^Contato/.test(chat.title)) el.textContent = initial(chat.title);
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function fmtTime(ts) { var d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function fmtShortDate(ts) { var d = new Date(ts); return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear(); }
  function fmtLongDate(ts) {
    return new Date(ts).toLocaleDateString(L.dateLocale, { day: "numeric", month: "long", year: "numeric" });
  }
  function dayKey(ts) { var d = new Date(ts); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
  function fmtSize(n) {
    if (!n) return "";
    if (n < 1024) return n + " B";
    if (n < 1048576) return (n / 1024).toFixed(0) + " KB";
    return (n / 1048576).toFixed(1) + " MB";
  }
  function fmtDur(s) {
    s = Math.round(s || 0);
    return Math.floor(s / 60) + ":" + pad(s % 60);
  }
  function mediaUrl(path) { return path.split("/").map(encodeURIComponent).join("/"); }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = function () { s.remove(); resolve(); };
      s.onerror = function () { s.remove(); reject(new Error(src)); };
      document.head.appendChild(s);
    });
  }
  function tokensOf(q) { return fold(q).split(/\s+/).filter(function (t) { return t.length > 0; }); }

  // ---------- highlight / text formatting ----------
  function appendHighlighted(parent, str, tokens) {
    if (!tokens || !tokens.length || !str) { parent.appendChild(document.createTextNode(str)); return; }
    var fm = foldMap(str), ranges = [];
    tokens.forEach(function (t) {
      var from = 0, idx;
      while ((idx = fm.folded.indexOf(t, from)) !== -1) {
        ranges.push([fm.map[idx], fm.map[idx + t.length - 1] + 1]);
        from = idx + t.length;
      }
    });
    if (!ranges.length) { parent.appendChild(document.createTextNode(str)); return; }
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [ranges[0]];
    for (var i = 1; i < ranges.length; i++) {
      var last = merged[merged.length - 1];
      if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
      else merged.push(ranges[i]);
    }
    var pos = 0;
    merged.forEach(function (r) {
      if (r[0] > pos) parent.appendChild(document.createTextNode(str.slice(pos, r[0])));
      parent.appendChild(h("mark", null, str.slice(r[0], r[1])));
      pos = r[1];
    });
    if (pos < str.length) parent.appendChild(document.createTextNode(str.slice(pos)));
  }

  var URL_RE = /(https?:\/\/[^\s<>"]+)/g;
  var FMT_RE = /(```[\s\S]+?```|\*[^*\n]+\*|_[^_\n]+_|~[^~\n]+~)/g;
  function formatText(text, tokens) {
    var frag = document.createDocumentFragment();
    text.split(URL_RE).forEach(function (part, i) {
      if (i % 2 === 1) {
        var a = h("a");
        a.href = part; a.target = "_blank"; a.rel = "noopener noreferrer";
        appendHighlighted(a, part, tokens);
        frag.appendChild(a);
        return;
      }
      part.split(FMT_RE).forEach(function (seg, j) {
        if (!seg) return;
        if (j % 2 === 1) {
          var tag = seg[0] === "*" ? "strong" : seg[0] === "_" ? "em" : seg[0] === "~" ? "s" : "code";
          var inner = tag === "code" ? seg.slice(3, -3) : seg.slice(1, -1);
          var el = h(tag);
          appendHighlighted(el, inner, tokens);
          frag.appendChild(el);
        } else {
          appendHighlighted(frag, seg, tokens);
        }
      });
    });
    return frag;
  }

  // ---------- state ----------
  var CHATS = window.CHATS;
  if (!CHATS) {
    $("emptyInfo").textContent = L.noData;
    return;
  }
  var META = window.META || {};
  var chatById = {};
  CHATS.forEach(function (c) { c.lastNorm = null; chatById[c.id] = c; });
  $("emptyInfo").textContent = L.emptyInfo(META.chats || CHATS.length, META.messages || "");

  var state = { tab: "chats", filter: "all", sort: "date-desc", query: "", current: null };
  var cache = {}, cacheOrder = [];
  var cur = null; // {chat, msgs, start, end, tokens, matches, matchPos, stick}
  var fulltext = null, fulltextFolded = null;

  window.__chat = function (id, recs) {
    cache[id] = recs;
    cacheOrder.push(id);
    while (cacheOrder.length > 8) delete cache[cacheOrder.shift()];
  };
  window.__fulltext = function (arr) { fulltext = arr; };

  // ---------- theme ----------
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute("data-theme", t);
  }
  try { applyTheme(localStorage.getItem("theme")); } catch (e) { /* storage indisponível */ }
  $("themeBtn").addEventListener("click", function () {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    var next = isDark ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignora */ }
  });

  // ---------- chat list ----------
  var listEl = $("list"), listShown = 0, listData = [];

  function matchesChat(c, tokens, digits) {
    if (state.filter === "groups" && !c.isGroup) return false;
    if (state.filter === "single" && c.isGroup) return false;
    if (state.filter === "media" && !c.hasMedia) return false;
    if (!tokens.length) return true;
    if (c.lastNorm === null) c.lastNorm = fold(c.lastText || "");
    return tokens.every(function (t) {
      return c.search.indexOf(t) !== -1 || c.lastNorm.indexOf(t) !== -1 ||
        (digits.length >= 3 && c.phone.indexOf(digits) !== -1);
    });
  }

  function renderListBatch() {
    var end = Math.min(listShown + 60, listData.length);
    var frag = document.createDocumentFragment();
    var tokens = tokensOf(state.query);
    for (var i = listShown; i < end; i++) {
      var c = listData[i];
      var item = h("div", "item" + (state.current === c.id ? " on" : ""));
      item.dataset.id = c.id;
      var av = h("div", "avatar");
      avatar(av, c);
      var body = h("div", "item-body");
      var top = h("div", "item-top");
      var title = h("div", "item-title");
      appendHighlighted(title, c.title, tokens);
      top.appendChild(title);
      top.appendChild(h("div", "item-time", fmtShortDate(c.lastTs)));
      body.appendChild(top);
      body.appendChild(h("div", "item-prev", (c.lastMe ? L.youPrefix : "") + c.lastText));
      item.appendChild(av);
      item.appendChild(body);
      frag.appendChild(item);
    }
    listShown = end;
    listEl.appendChild(frag);
  }

  function renderList() {
    var tokens = tokensOf(state.query);
    var digits = state.query.replace(/\D/g, "");
    listData = CHATS.filter(function (c) { return matchesChat(c, tokens, digits); });
    if (state.sort === "date-asc") {
      listData.sort(function (a, b) { return a.lastTs - b.lastTs; });
    } else if (state.sort === "name-asc") {
      listData.sort(function (a, b) { return a.title.localeCompare(b.title, L.dateLocale, { sensitivity: "base" }); });
    }
    // date-desc: ordem original do CHATS (já ordenado por lastTs desc no builder)
    listEl.innerHTML = "";
    listShown = 0;
    if (!listData.length) { listEl.appendChild(h("div", "note", L.noChats)); return; }
    renderListBatch();
  }
  $("sortBar").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.sort = b.dataset.s;
    Array.prototype.forEach.call($("sortBar").querySelectorAll("button"), function (x) { x.classList.toggle("on", x === b); });
    renderList();
  });
  listEl.addEventListener("scroll", function () {
    if (listShown < listData.length && listEl.scrollTop + listEl.clientHeight > listEl.scrollHeight - 300) renderListBatch();
  });
  listEl.addEventListener("click", function (e) {
    var item = e.target.closest(".item");
    if (item) openChat(Number(item.dataset.id));
  });

  // ---------- global message search ----------
  var resultsEl = $("results");
  function ensureFulltext() {
    if (fulltext) return Promise.resolve();
    resultsEl.innerHTML = "";
    resultsEl.appendChild(h("div", "note", L.fulltextLoading));
    return loadScript("data/fulltext.js").then(function () {
      fulltextFolded = new Array(fulltext.length);
      for (var i = 0; i < fulltext.length; i++) fulltextFolded[i] = fold(fulltext[i][3]);
    });
  }
  var searchSeq = 0;
  function renderResults() {
    var tokens = tokensOf(state.query);
    var seq = ++searchSeq;
    if (state.query.trim().length < 2) {
      resultsEl.innerHTML = "";
      resultsEl.appendChild(h("div", "note", L.fulltextMin));
      return;
    }
    ensureFulltext().then(function () {
      if (seq !== searchSeq) return;
      var hits = [];
      for (var i = 0; i < fulltext.length; i++) {
        var f = fulltextFolded[i], ok = true;
        for (var t = 0; t < tokens.length; t++) { if (f.indexOf(tokens[t]) === -1) { ok = false; break; } }
        if (ok) hits.push(i);
      }
      hits.sort(function (a, b) { return fulltext[b][2] - fulltext[a][2]; });
      resultsEl.innerHTML = "";
      resultsEl.appendChild(h("div", "res-head", L.resultsHead(hits.length, hits.length > 500)));
      var frag = document.createDocumentFragment();
      hits.slice(0, 500).forEach(function (idx) {
        var entry = fulltext[idx], chat = chatById[entry[0]];
        if (!chat) return;
        var item = h("div", "item");
        item.dataset.id = entry[0];
        item.dataset.msg = entry[1];
        var av = h("div", "avatar");
        avatar(av, chat);
        var body = h("div", "item-body");
        var top = h("div", "item-top");
        top.appendChild(h("div", "item-title", chat.title));
        top.appendChild(h("div", "item-time", fmtShortDate(entry[2])));
        var prev = h("div", "item-prev snippet");
        var text = entry[3], fm = foldMap(text), pos = fm.folded.indexOf(tokens[0]);
        var from = pos === -1 ? 0 : Math.max(0, fm.map[pos] - 40);
        appendHighlighted(prev, (from > 0 ? "..." : "") + text.slice(from, from + 160), tokens);
        body.appendChild(top);
        body.appendChild(prev);
        item.appendChild(av);
        item.appendChild(body);
        frag.appendChild(item);
      });
      resultsEl.appendChild(frag);
    }).catch(function () {
      resultsEl.innerHTML = "";
      resultsEl.appendChild(h("div", "note", L.fulltextError));
    });
  }
  resultsEl.addEventListener("click", function (e) {
    var item = e.target.closest(".item");
    if (item) openChat(Number(item.dataset.id), Number(item.dataset.msg), state.query);
  });

  // ---------- tabs / filters / search box ----------
  function refreshSide() {
    var msgs = state.tab === "msgs";
    listEl.hidden = msgs;
    resultsEl.hidden = !msgs;
    $("filters").hidden = msgs;
    if (msgs) renderResults(); else renderList();
  }
  $("tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.tab = b.dataset.tab;
    Array.prototype.forEach.call($("tabs").children, function (x) { x.classList.toggle("on", x === b); });
    refreshSide();
  });
  $("filters").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.filter = b.dataset.f;
    Array.prototype.forEach.call($("filters").children, function (x) { x.classList.toggle("on", x === b); });
    renderList();
  });
  var qTimer = null;
  $("q").addEventListener("input", function () {
    clearTimeout(qTimer);
    qTimer = setTimeout(function () { state.query = $("q").value; refreshSide(); }, 180);
  });

  // ---------- chat view ----------
  var msgsEl = $("messages");

  function mediaMissing(label) { return h("div", "missing", L.mediaMissing(label)); }

  var MEDIA_KINDS = ["i", "v", "a", "d", "g", "s"];
  var KIND_LABEL = { i: L.kindImg, v: L.kindVideo, a: L.kindAudio, d: L.kindDoc, g: L.kindGif, s: L.kindSticker };

  function unavailable(m) {
    var card = h("div", "na");
    card.appendChild(h("div", "na-kind", KIND_LABEL[m.y] || "Mídia"));
    var name = m.n || (m.f ? m.f.split("/").pop() : "");
    if (name) card.appendChild(h("div", "na-name", name));
    var details = [];
    if (m.sz) details.push(fmtSize(m.sz));
    if (m.d) details.push(fmtDur(m.d));
    if (details.length) card.appendChild(h("div", "na-meta", details.join(" · ")));
    card.appendChild(h("div", "na-why", L.unavailable));
    return card;
  }

  function buildAd(m, index) {
    var row = h("div", "row");
    row.dataset.idx = index;
    var bubble = h("div", "bubble ad-card");
    bubble.appendChild(h("div", "ad-label", L.adLabel));
    if (m.ad.th) {
      var th = h("img", "ad-thumb");
      th.src = m.ad.th; th.alt = "";
      th.addEventListener("error", function () { th.remove(); });
      bubble.appendChild(th);
    }
    if (m.ad.t) bubble.appendChild(h("div", "ad-title", m.ad.t));
    if (m.ad.b) {
      var body = h("div", "text ad-body");
      body.appendChild(formatText(m.ad.b, cur ? cur.tokens : []));
      bubble.appendChild(body);
    }
    if (/^https?:\/\//.test(m.ad.u || "")) {
      var link = h("a", "ad-link", L.adLink);
      link.href = m.ad.u; link.target = "_blank"; link.rel = "noopener noreferrer";
      bubble.appendChild(link);
    }
    var meta = h("div", "meta");
    meta.appendChild(h("span", null, fmtTime(m.t)));
    bubble.appendChild(meta);
    row.appendChild(bubble);
    return row;
  }

  function buildBody(m, tokens) {
    var wrap = document.createDocumentFragment();
    var url = m.f ? mediaUrl(m.f) : null;
    if (MEDIA_KINDS.indexOf(m.y) !== -1 && (m.nf || !m.f)) {
      wrap.appendChild(unavailable(m));
    } else if (m.y === "i" && url) {
      var img = h("img", "media-img");
      img.loading = "lazy"; img.src = url; img.alt = "";
      if (m.w && m.h) { img.width = m.w; img.height = m.h; img.style.aspectRatio = m.w + "/" + m.h; img.style.width = Math.min(m.w, 330) + "px"; img.style.height = "auto"; }
      img.addEventListener("click", function () { openLightbox(m.i); });
      img.addEventListener("error", function () { img.replaceWith(mediaMissing("Imagem")); });
      img.addEventListener("load", stickBottom);
      wrap.appendChild(img);
    } else if ((m.y === "v" || m.y === "g") && url) {
      var v = h("video", "media-vid");
      v.controls = true; v.preload = "metadata"; v.src = url;
      if (m.y === "g") { v.loop = true; v.muted = true; }
      v.addEventListener("error", function () { v.replaceWith(mediaMissing("Vídeo")); });
      v.addEventListener("loadedmetadata", stickBottom);
      wrap.appendChild(v);
    } else if (m.y === "a" && url) {
      var a = h("audio", "media-aud");
      a.controls = true; a.preload = "none"; a.src = url;
      a.addEventListener("error", function () { a.replaceWith(mediaMissing("Áudio")); });
      wrap.appendChild(a);
    } else if (m.y === "s" && url) {
      var st = h("img", "sticker");
      st.loading = "lazy"; st.src = url; st.alt = "Figurinha";
      st.addEventListener("error", function () { st.replaceWith(mediaMissing("Figurinha")); });
      wrap.appendChild(st);
    } else if (m.y === "d" && url) {
      var doc = h("div", "doc");
      var name = m.n || m.f.split("/").pop();
      var ext = (name.split(".").pop() || "").slice(0, 4);
      var info = h("div", "info");
      info.appendChild(h("div", "name", name));
      info.appendChild(h("div", "size", fmtSize(m.sz)));
      var link = h("a", null, L.docOpen);
      link.href = url; link.target = "_blank"; link.rel = "noopener";
      info.appendChild(link);
      doc.appendChild(h("div", "ext", ext));
      doc.appendChild(info);
      wrap.appendChild(doc);
    } else if (m.f && m.y !== "t") {
      wrap.appendChild(mediaMissing("Mídia"));
    }
    if (m.y === "l") {
      var loc = h("div", "loc");
      loc.appendChild(h("div", null, L.locationLabel + (m.pl ? ": " + m.pl : "")));
      if (m.lat != null) {
        var ml = h("a", null, m.lat + ", " + m.lng);
        ml.href = "https://www.openstreetmap.org/?mlat=" + m.lat + "&mlon=" + m.lng + "#map=16/" + m.lat + "/" + m.lng;
        ml.target = "_blank"; ml.rel = "noopener";
        loc.appendChild(ml);
      }
      wrap.appendChild(loc);
    }
    if (m.y === "k") {
      var label = (m.cv ? L.callVideo : L.callVoice) + (m.cd ? " (" + fmtDur(m.cd) + ")" : (m.m ? L.callNoAnswer : L.callMissed));
      wrap.appendChild(h("div", null, label));
    }
    if (m.y === "p") {
      wrap.appendChild(h("div", "sender", L.pollLabel + (m.x ? ": " + m.x : "")));
      (m.o || []).forEach(function (o) {
        var row = h("div", "poll-opt");
        row.appendChild(h("span", null, o[0]));
        row.appendChild(h("span", "muted", L.votes(o[1])));
        wrap.appendChild(row);
      });
    } else if (m.y === "c") {
      wrap.appendChild(h("div", null, L.contactLabel + (m.x || "")));
    } else if (m.y === "del") {
      wrap.appendChild(h("div", "deleted", L.deleted));
    } else if (m.x && m.y !== "l" && m.y !== "k") {
      var t = h("div", "text");
      t.appendChild(formatText(m.x, tokens));
      wrap.appendChild(t);
    }
    return wrap;
  }

  function buildMessage(m, index) {
    if (m.y === "x" && m.ad) return buildAd(m, index);
    if (m.y === "x") {
      var sys = h("div", "sys");
      sys.dataset.idx = index;
      sys.appendChild(h("span", null, m.x || L.sysDefault));
      return sys;
    }
    var row = h("div", "row" + (m.m ? " me" : "") + (m.y === "s" ? " stk" : ""));
    row.dataset.idx = index;
    var bubble = h("div", "bubble");
    if (m.s) {
      var s = h("div", "sender", m.s);
      s.style.color = colorFor(m.s);
      bubble.appendChild(s);
    }
    if (m.q) {
      var q = h("div", "quote");
      q.appendChild(h("div", "qs", m.q.m ? L.you : (m.q.s || "")));
      q.appendChild(h("div", "qt", m.q.x || L.quotedMedia));
      bubble.appendChild(q);
    }
    bubble.appendChild(buildBody(m, cur ? cur.tokens : []));
    var meta = h("div", "meta");
    if (m.st) meta.appendChild(h("span", null, "★"));
    if (m.e) meta.appendChild(h("span", null, L.edited));
    meta.appendChild(h("span", null, fmtTime(m.t)));
    bubble.appendChild(meta);
    row.appendChild(bubble);
    return row;
  }

  function buildRange(a, b, forceFirstSep) {
    var frag = document.createDocumentFragment(), prevDay = null;
    if (!forceFirstSep && a > 0) prevDay = dayKey(cur.msgs[a - 1].t);
    for (var i = a; i < b; i++) {
      var m = cur.msgs[i], dk = dayKey(m.t);
      if (dk !== prevDay) {
        var d = h("div", "day");
        d.dataset.day = dk;
        d.appendChild(h("span", null, fmtLongDate(m.t)));
        frag.appendChild(d);
        prevDay = dk;
      }
      frag.appendChild(buildMessage(m, i));
    }
    return frag;
  }

  function renderWindow(a, b) {
    cur.start = Math.max(0, a);
    cur.end = Math.min(cur.msgs.length, b);
    msgsEl.innerHTML = "";
    msgsEl.appendChild(buildRange(cur.start, cur.end, true));
  }

  function prependMore() {
    if (!cur || cur.start === 0) return;
    var newStart = Math.max(0, cur.start - PAGE), oldStart = cur.start;
    var prevH = msgsEl.scrollHeight;
    var firstDay = msgsEl.querySelector(".day");
    var frag = buildRange(newStart, oldStart, true);
    if (firstDay && dayKey(cur.msgs[oldStart - 1].t) === dayKey(cur.msgs[oldStart].t)) firstDay.remove();
    msgsEl.insertBefore(frag, msgsEl.firstChild);
    cur.start = newStart;
    msgsEl.scrollTop += msgsEl.scrollHeight - prevH;
  }

  function appendMore() {
    if (!cur || cur.end >= cur.msgs.length) return;
    var newEnd = Math.min(cur.msgs.length, cur.end + PAGE);
    msgsEl.appendChild(buildRange(cur.end, newEnd, false));
    cur.end = newEnd;
  }

  msgsEl.addEventListener("scroll", function () {
    if (!cur) return;
    if (msgsEl.scrollTop < 300) prependMore();
    if (msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight < 300) appendMore();
  });
  ["wheel", "touchmove", "keydown", "mousedown"].forEach(function (ev) {
    msgsEl.addEventListener(ev, function () { if (cur) cur.stick = false; }, { passive: true });
  });
  function stickBottom() { if (cur && cur.stick) msgsEl.scrollTop = msgsEl.scrollHeight; }

  function indexOfMsg(id) {
    for (var i = 0; i < cur.msgs.length; i++) if (cur.msgs[i].i === id) return i;
    return -1;
  }

  function gotoIndex(idx, flash) {
    if (idx < cur.start || idx >= cur.end) renderWindow(idx - PAGE / 2, idx + PAGE / 2);
    var el = msgsEl.querySelector('[data-idx="' + idx + '"]');
    if (!el) return;
    cur.stick = false;
    el.scrollIntoView({ block: "center" });
    if (flash) {
      el.classList.add("flash");
      setTimeout(function () { el.classList.remove("flash"); }, 2200);
    }
  }

  function openChat(id, targetMsg, query) {
    var chat = chatById[id];
    if (!chat) return;
    state.current = id;
    document.body.classList.add("chat-open");
    $("empty").hidden = true;
    $("chat").hidden = false;
    $("chatTitle").textContent = chat.title;
    $("chatSub").textContent = L.chatSub(chat.isGroup, chat.phone, chat.count);
    avatar($("chatAvatar"), chat);
    Array.prototype.forEach.call(listEl.querySelectorAll(".item"), function (el) {
      el.classList.toggle("on", Number(el.dataset.id) === id);
    });
    closeChatSearch();
    msgsEl.innerHTML = "";
    msgsEl.appendChild(h("div", "note", L.loading));
    var ready = cache[id] ? Promise.resolve() : loadScript("data/chat_" + id + ".js");
    ready.then(function () {
      if (state.current !== id) return;
      cur = { chat: chat, msgs: cache[id], start: 0, end: 0, tokens: [], matches: [], matchPos: -1, stick: !targetMsg };
      if (targetMsg) {
        if (query) { cur.tokens = tokensOf(query); }
        var idx = indexOfMsg(targetMsg);
        renderWindow(idx - PAGE / 2, idx + PAGE / 2);
        gotoIndex(Math.max(idx, 0), true);
        if (query) {
          $("chatSearch").hidden = false;
          $("cq").value = query;
          runChatSearch(query, targetMsg);
        }
      } else {
        renderWindow(cur.msgs.length - 150, cur.msgs.length);
        msgsEl.scrollTop = msgsEl.scrollHeight;
        setTimeout(function () { if (cur) cur.stick = false; }, 2500);
      }
    }).catch(function () {
      msgsEl.innerHTML = "";
      msgsEl.appendChild(h("div", "note", L.loadError(id)));
    });
  }

  $("backBtn").addEventListener("click", function () { document.body.classList.remove("chat-open"); });

  // ---------- in-chat search ----------
  function closeChatSearch() {
    $("chatSearch").hidden = true;
    $("cq").value = "";
    $("cqCount").textContent = "";
    if (cur) { cur.tokens = []; cur.matches = []; cur.matchPos = -1; }
  }
  function rerenderKeepingPosition(idx) {
    var a = cur.start, b = cur.end;
    renderWindow(a, b);
    if (idx != null) gotoIndex(idx, false);
  }
  function markCurrent(idx) {
    var prev = msgsEl.querySelector(".row.cur");
    if (prev) prev.classList.remove("cur");
    var el = msgsEl.querySelector('[data-idx="' + idx + '"]');
    if (el) el.classList.add("cur");
  }
  function runChatSearch(query, preferMsg) {
    if (!cur) return;
    cur.tokens = tokensOf(query);
    cur.matches = [];
    if (cur.tokens.length) {
      for (var i = 0; i < cur.msgs.length; i++) {
        var m = cur.msgs[i];
        if (!m.x) continue;
        if (m._f === undefined) m._f = fold(m.x);
        var ok = cur.tokens.every(function (t) { return m._f.indexOf(t) !== -1; });
        if (ok) cur.matches.push(i);
      }
    }
    var total = cur.matches.length;
    cur.matchPos = -1;
    if (total) {
      var start = total - 1;
      if (preferMsg) {
        var pi = indexOfMsg(preferMsg);
        var f = cur.matches.indexOf(pi);
        if (f !== -1) start = f;
      }
      cur.matchPos = start;
    }
    $("cqCount").textContent = cur.tokens.length ? (total ? L.matchCount(cur.matchPos, total) : L.noMatches) : "";
    var idx = cur.matchPos >= 0 ? cur.matches[cur.matchPos] : null;
    if (idx != null) {
      if (idx < cur.start || idx >= cur.end) renderWindow(idx - PAGE / 2, idx + PAGE / 2);
      else rerenderKeepingPosition(null);
      gotoIndex(idx, false);
      markCurrent(idx);
    } else {
      rerenderKeepingPosition(null);
    }
  }
  function stepMatch(dir) {
    if (!cur || !cur.matches.length) return;
    cur.matchPos = (cur.matchPos + dir + cur.matches.length) % cur.matches.length;
    var idx = cur.matches[cur.matchPos];
    gotoIndex(idx, false);
    markCurrent(idx);
    $("cqCount").textContent = L.matchCount(cur.matchPos, cur.matches.length);
  }
  $("searchBtn").addEventListener("click", function () {
    var bar = $("chatSearch");
    if (bar.hidden) { bar.hidden = false; $("cq").focus(); }
    else { closeChatSearch(); if (cur) rerenderKeepingPosition(null); }
  });
  $("cqClose").addEventListener("click", function () { closeChatSearch(); if (cur) rerenderKeepingPosition(null); });
  var cqTimer = null;
  $("cq").addEventListener("input", function () {
    clearTimeout(cqTimer);
    cqTimer = setTimeout(function () { runChatSearch($("cq").value); }, 200);
  });
  $("cq").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); stepMatch(e.shiftKey ? 1 : -1); }
  });
  $("cqUp").addEventListener("click", function () { stepMatch(-1); });
  $("cqDown").addEventListener("click", function () { stepMatch(1); });

  // ---------- go to date ----------
  $("dateInput").addEventListener("change", function () {
    if (!cur || !this.value) return;
    var p = this.value.split("-");
    var start = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).getTime();
    var idx = -1;
    for (var i = 0; i < cur.msgs.length; i++) { if (cur.msgs[i].t >= start) { idx = i; break; } }
    if (idx === -1) idx = cur.msgs.length - 1;
    gotoIndex(idx, true);
    this.value = "";
  });

  // ---------- lightbox ----------
  var lb = { list: [], pos: 0 };
  function openLightbox(msgId) {
    lb.list = cur.msgs.filter(function (m) { return m.y === "i" && m.f; });
    lb.pos = lb.list.findIndex(function (m) { return m.i === msgId; });
    if (lb.pos < 0) return;
    showLightbox();
    $("lightbox").hidden = false;
  }
  function showLightbox() {
    var m = lb.list[lb.pos];
    $("lbImg").src = mediaUrl(m.f);
    $("lbCap").textContent = (m.x ? m.x + " — " : "") + fmtLongDate(m.t) + " " + fmtTime(m.t) + "  (" + (lb.pos + 1) + "/" + lb.list.length + ")";
  }
  function stepLightbox(d) {
    lb.pos = (lb.pos + d + lb.list.length) % lb.list.length;
    showLightbox();
  }
  $("lbClose").addEventListener("click", function () { $("lightbox").hidden = true; $("lbImg").removeAttribute("src"); });
  $("lbPrev").addEventListener("click", function () { stepLightbox(-1); });
  $("lbNext").addEventListener("click", function () { stepLightbox(1); });
  $("lightbox").addEventListener("click", function (e) { if (e.target === this) $("lbClose").click(); });
  document.addEventListener("keydown", function (e) {
    if ($("lightbox").hidden) return;
    if (e.key === "Escape") $("lbClose").click();
    else if (e.key === "ArrowLeft") stepLightbox(-1);
    else if (e.key === "ArrowRight") stepLightbox(1);
  });

  renderList();

  // ---------- menu hambúrguer ----------
  var menuBtn = $("menuBtn"), menuDropdown = $("menuDropdown");
  function closeMenu() {
    menuDropdown.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }
  menuBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var open = !menuDropdown.hidden;
    if (open) { closeMenu(); return; }
    menuDropdown.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
  });
  document.addEventListener("click", function (e) {
    if (!menuDropdown.hidden && !menuDropdown.contains(e.target)) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  // ---------- exportação: seleção de conversas ----------
  var exportMode = null; // "pdf" | "txt"
  var exportSelected = {};

  function openExportModal(mode) {
    closeMenu();
    exportMode = mode;
    exportSelected = {};
    var title = mode === "pdf" ? L.exportPdfTitle : L.exportTxtTitle;
    $("exportModalTitle").textContent = title;
    var notice = $("exportNotice");
    if (mode === "pdf") {
      notice.textContent = L.exportPdfNotice;
    } else {
      notice.textContent = L.exportTxtNotice;
    }
    notice.classList.add("visible");
    $("exportQ").value = "";
    renderExportList("");
    updateExportCount();
    $("exportModal").hidden = false;
    $("exportQ").focus();
  }

  function renderExportList(q) {
    var tokens = tokensOf(q);
    var listEl = $("exportList");
    listEl.innerHTML = "";
    var frag = document.createDocumentFragment();
    CHATS.forEach(function (c) {
      if (tokens.length && !tokens.every(function (t) { return c.search.indexOf(t) !== -1; })) return;
      var row = document.createElement("label");
      row.className = "modal-list-item";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!exportSelected[c.id];
      cb.dataset.id = c.id;
      cb.addEventListener("change", function () {
        if (this.checked) exportSelected[c.id] = true; else delete exportSelected[c.id];
        updateExportCount();
      });
      var av = h("div", "avatar");
      avatar(av, c);
      av.style.width = "32px"; av.style.height = "32px"; av.style.fontSize = "13px";
      var info = h("div", null);
      info.style.minWidth = "0"; info.style.flex = "1";
      info.appendChild(h("div", "item-title", c.title));
      info.appendChild(h("div", "item-sub", L.chatSub(c.isGroup, c.phone, c.count)));
      row.appendChild(cb);
      row.appendChild(av);
      row.appendChild(info);
      frag.appendChild(row);
    });
    listEl.appendChild(frag);
  }

  function updateExportCount() {
    var n = Object.keys(exportSelected).length;
    $("exportCount").textContent = n ? L.exportCount(n) : "";
    $("exportConfirm").disabled = n === 0;
  }

  $("menuExportPdf").addEventListener("click", function () { openExportModal("pdf"); });
  $("menuExportTxt").addEventListener("click", function () { openExportModal("txt"); });
  $("exportModalClose").addEventListener("click", function () { $("exportModal").hidden = true; });
  $("exportCancel").addEventListener("click", function () { $("exportModal").hidden = true; });

  var exportQTimer = null;
  $("exportQ").addEventListener("input", function () {
    clearTimeout(exportQTimer);
    exportQTimer = setTimeout(function () { renderExportList($("exportQ").value); }, 180);
  });

  $("exportSelectAll").addEventListener("click", function () {
    $("exportList").querySelectorAll("input[type=checkbox]").forEach(function (cb) {
      cb.checked = true;
      exportSelected[Number(cb.dataset.id)] = true;
    });
    updateExportCount();
  });
  $("exportClearAll").addEventListener("click", function () {
    $("exportList").querySelectorAll("input[type=checkbox]").forEach(function (cb) { cb.checked = false; });
    exportSelected = {};
    updateExportCount();
  });

  $("exportConfirm").addEventListener("click", function () {
    var ids = Object.keys(exportSelected).map(Number);
    if (!ids.length) return;
    $("exportModal").hidden = true;
    if (exportMode === "pdf") runExportPdf(ids);
    else runExportTxt(ids);
  });

  // ---------- exportar TXT ----------
  function chatMsgsText(chat, msgs) {
    var lines = [L.txtConversation + chat.title];
    if (chat.phone) lines.push(L.txtPhone + "+" + chat.phone);
    lines.push(L.txtTotal + chat.count);
    lines.push(L.txtExported(new Date().toLocaleString(L.dateLocale)));
    lines.push("---");
    var prevDay = null;
    msgs.forEach(function (m) {
      if (m.y === "x") { if (m.x) lines.push(L.txtSystem + m.x); return; }
      var dk = dayKey(m.t);
      if (dk !== prevDay) { lines.push(""); lines.push("=== " + fmtLongDate(m.t) + " ==="); prevDay = dk; }
      var who = m.m ? L.you : (m.s || chat.title);
      var time = fmtTime(m.t);
      var content = "";
      if (m.y === "i") content = m.nf ? L.txtImgNA : L.txtImg;
      else if (m.y === "v" || m.y === "g") content = L.txtVideo;
      else if (m.y === "a") content = L.txtAudio;
      else if (m.y === "s") content = L.txtSticker;
      else if (m.y === "d") content = L.txtDoc(m.n || (m.f ? m.f.split("/").pop() : ""));
      else if (m.y === "l") content = L.txtLocation(m.pl);
      else if (m.y === "k") content = (m.cv ? L.txtCallVideo : L.txtCallVoice);
      else if (m.y === "p") content = L.txtPoll(m.x || "");
      else if (m.y === "c") content = L.txtContact(m.x || "");
      else if (m.y === "del") content = L.txtDeleted;
      else content = m.x || "";
      if (m.q) content = L.txtReply(m.q.x || L.quotedMedia) + "\n" + content;
      lines.push("[" + time + "] " + who + ": " + content);
    });
    return lines.join("\n");
  }

  function runExportTxt(ids) {
    var pending = ids.slice();
    var parts = [];

    function processNext() {
      if (!pending.length) {
        var blob = new Blob([parts.join("\n\n" + "=".repeat(60) + "\n\n")], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "backup-whatsapp-" + new Date().toISOString().slice(0, 10) + ".txt";
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
        return;
      }
      var id = pending.shift();
      var chat = chatById[id];
      if (!chat) { processNext(); return; }
      function go() {
        parts.push(chatMsgsText(chat, cache[id]));
        processNext();
      }
      if (cache[id]) { go(); return; }
      loadScript("data/chat_" + id + ".js").then(go).catch(function () {
        parts.push(L.exportLoadError(chat.title));
        processNext();
      });
    }
    processNext();
  }

  // ---------- exportar PDF ----------
  function runExportPdf(ids) {
    var pending = ids.slice();
    var allData = [];

    function processNext() {
      if (!pending.length) { generatePdf(allData); return; }
      var id = pending.shift();
      var chat = chatById[id];
      if (!chat) { processNext(); return; }
      function go() { allData.push({ chat: chat, msgs: cache[id] }); processNext(); }
      if (cache[id]) { go(); return; }
      loadScript("data/chat_" + id + ".js").then(go).catch(function () {
        allData.push({ chat: chat, msgs: [] });
        processNext();
      });
    }
    processNext();
  }

  function generatePdf(allData) {
    var win = window.open("", "_blank");
    if (!win) { alert(L.popupBlocked); return; }
    var html = buildPdfHtml(allData);
    win.document.write(html);
    win.document.close();
    win.addEventListener("load", function () {
      setTimeout(function () { win.print(); }, 400);
    });
  }

  function buildPdfHtml(allData) {
    var parts = ['<!doctype html><html lang="' + L.pdfLang + '"><head><meta charset="utf-8">',
      '<title>' + L.pdfTitle + '</title>',
      '<style>',
      'body{font:13px/1.5 "Segoe UI",Arial,sans-serif;color:#111;margin:0;padding:0}',
      '.chat-section{page-break-after:always;padding:24px 32px}',
      '.chat-section:last-child{page-break-after:auto}',
      'h1{font-size:18px;margin:0 0 4px}',
      '.sub{color:#666;font-size:12px;margin-bottom:16px}',
      '.day-sep{text-align:center;color:#999;font-size:12px;margin:12px 0}',
      '.row{margin:3px 0;display:flex}',
      '.row.me{justify-content:flex-end}',
      '.bubble{max-width:68%;padding:6px 10px 4px;border-radius:8px;background:#fff;border:1px solid #e0e0e0;word-wrap:break-word}',
      '.row.me .bubble{background:#d9fdd3;border-color:#b2e5b0}',
      '.sender{font-size:11px;font-weight:600;color:#00a884;margin-bottom:2px}',
      '.meta{font-size:10px;color:#999;text-align:right;margin-top:3px}',
      '.sys-msg{text-align:center;color:#888;font-size:12px;margin:6px 0}',
      '.img-thumb{max-width:240px;max-height:200px;display:block;border-radius:6px;margin:4px 0}',
      '.media-note{color:#888;font-style:italic;font-size:12px}',
      '.doc-box{background:#f5f5f5;border-radius:6px;padding:6px 10px;font-size:12px}',
      '.quote{border-left:3px solid #00a884;padding:3px 8px;margin-bottom:4px;font-size:12px;color:#555;background:#f5f5f5;border-radius:4px}',
      '@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}',
      '</style></head><body>'];

    allData.forEach(function (item) {
      var chat = item.chat, msgs = item.msgs;
      parts.push('<div class="chat-section">');
      parts.push('<h1>' + esc(chat.title) + '</h1>');
      var sub = L.chatSub(chat.isGroup, chat.phone, chat.count);
      parts.push('<div class="sub">' + esc(sub) + '</div>');
      var prevDay = null;
      msgs.forEach(function (m) {
        if (m.y === "x") {
          if (m.x) parts.push('<div class="sys-msg">' + esc(m.x) + '</div>');
          return;
        }
        var dk = dayKey(m.t);
        if (dk !== prevDay) { parts.push('<div class="day-sep">' + fmtLongDate(m.t) + '</div>'); prevDay = dk; }
        parts.push('<div class="row' + (m.m ? ' me' : '') + '"><div class="bubble">');
        if (m.s) parts.push('<div class="sender">' + esc(m.s) + '</div>');
        if (m.q) parts.push('<div class="quote"><b>' + esc(m.q.m ? L.you : (m.q.s || "")) + '</b><br>' + esc(m.q.x || L.quotedMedia) + '</div>');
        if (m.y === "i" && m.f && !m.nf) {
          parts.push('<img class="img-thumb" src="' + mediaUrl(m.f) + '" alt="" onerror="this.style.display=\'none\'">');
        } else if (m.y === "a") {
          parts.push('<div class="media-note">' + L.pdfAudioNote + '</div>');
        } else if (m.y === "v" || m.y === "g") {
          parts.push('<div class="media-note">[' + L.kindVideo + ']</div>');
        } else if (m.y === "s") {
          parts.push('<div class="media-note">[' + L.kindSticker + ']</div>');
        } else if (m.y === "d") {
          parts.push('<div class="doc-box">' + L.pdfDocLabel + esc(m.n || (m.f ? m.f.split("/").pop() : "")) + '</div>');
        } else if (m.y === "l") {
          parts.push('<div class="media-note">' + L.pdfLocationLabel + (m.pl ? ': ' + esc(m.pl) : '') + '</div>');
        } else if (m.y === "k") {
          parts.push('<div class="media-note">' + (m.cv ? L.pdfCallVideo : L.pdfCallVoice) + '</div>');
        } else if (m.y === "del") {
          parts.push('<div class="media-note">' + L.txtDeleted + '</div>');
        } else if (m.y === "p") {
          parts.push('<div>' + L.pdfPoll + esc(m.x || "") + '</div>');
        } else if (m.y === "c") {
          parts.push('<div>' + L.pdfContact + esc(m.x || "") + '</div>');
        }
        if (m.x && ["t", "i", "v", "a", "g", "d", "s"].indexOf(m.y) !== -1) {
          parts.push('<div>' + esc(m.x) + '</div>');
        } else if (m.y === "t" && m.x) {
          parts.push('<div>' + esc(m.x) + '</div>');
        }
        parts.push('<div class="meta">' + fmtTime(m.t) + '</div>');
        parts.push('</div></div>');
      });
      parts.push('</div>');
    });
    parts.push('</body></html>');
    return parts.join("");
  }

  function esc(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---------- instalar ----------
  $("menuInstall").addEventListener("click", function () {
    closeMenu();
    $("installModal").hidden = false;
  });
  $("installModalClose").addEventListener("click", function () { $("installModal").hidden = true; });
  $("installCancel").addEventListener("click", function () { $("installModal").hidden = true; });

  // abas de SO
  document.querySelectorAll(".install-os-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var os = this.dataset.os;
      document.querySelectorAll(".install-os-tab").forEach(function (t) { t.classList.toggle("on", t === tab); });
      document.querySelectorAll(".install-panel").forEach(function (p) { p.hidden = p.dataset.os !== os; });
    });
  });

  $("installWin").addEventListener("click", function () { downloadInstaller("win"); });
  $("installMac").addEventListener("click", function () { downloadInstaller("mac"); });
  $("installLinux").addEventListener("click", function () { downloadInstaller("linux"); });

  function downloadInstaller(os) {
    var content, filename, type;

    if (os === "win") {
      filename = "instalar-backup-whatsapp.bat";
      type = "text/plain";
      content = [
        "@echo off",
        "chcp 65001 >nul",
        "echo ============================================",
        "echo  Instalador - Backup WhatsApp Business",
        "echo ============================================",
        "echo.",
        "",
        "rem --- pasta de origem: apenas os arquivos do backup (a pasta onde este .bat esta) ---",
        "set SRC=%~dp0",
        "rem remove barra final",
        "if \"%SRC:~-1%\"==\"\\\" set SRC=%SRC:~0,-1%",
        "",
        "rem --- pasta de destino: Documentos\\Backup WhatsApp ---",
        "set DEST=%USERPROFILE%\\Documents\\Backup WhatsApp",
        "if exist \"%USERPROFILE%\\Documentos\" set DEST=%USERPROFILE%\\Documentos\\Backup WhatsApp",
        "",
        "rem --- verificar espaco disponivel em disco (via PowerShell) ---",
        "echo Verificando espaco em disco...",
        "for /f \"usebackq\" %%S in (`powershell -NoProfile -Command \"(Get-ChildItem -Path '%SRC%' -Recurse -File | Measure-Object -Property Length -Sum).Sum\"`) do set NEEDED=%%S",
        "for /f \"usebackq\" %%F in (`powershell -NoProfile -Command \"(Get-PSDrive -Name (Split-Path -Qualifier '%DEST%').TrimEnd(':')).Free\"`) do set FREE=%%F",
        "powershell -NoProfile -Command \"if ([long]'%NEEDED%' -gt [long]'%FREE%') { Write-Host 'SEMESPACO' }\" > \"%TEMP%\\wabkp_check.txt\" 2>nul",
        "findstr /C:\"SEMESPACO\" \"%TEMP%\\wabkp_check.txt\" >nul 2>&1",
        "if not errorlevel 1 (",
        "  echo.",
        "  echo ERRO: Espaco insuficiente no disco.",
        "  echo Necessario: aproximadamente %NEEDED% bytes",
        "  echo Disponivel: aproximadamente %FREE% bytes",
        "  echo Libere espaco e tente novamente.",
        "  pause",
        "  exit /b 1",
        ")",
        "",
        "rem --- avisar se ja existe instalacao anterior e pedir confirmacao ---",
        "if exist \"%DEST%\" (",
        "  echo.",
        "  echo Atencao: ja existe uma instalacao em:",
        "  echo   %DEST%",
        "  echo.",
        "  echo A pasta sera APAGADA e substituida pela versao do pendrive.",
        "  echo Isso garante que nao sobrem arquivos antigos.",
        "  echo.",
        "  set /p CONFIRMA=Digite S e pressione Enter para continuar, ou N para cancelar: ",
        "  if /i not \"%CONFIRMA%\"==\"S\" (",
        "    echo Instalacao cancelada.",
        "    pause",
        "    exit /b 0",
        "  )",
        "  echo.",
        "  echo Removendo instalacao anterior...",
        "  rmdir /S /Q \"%DEST%\"",
        ")",
        "",
        "echo Copiando arquivos para:",
        "echo   %DEST%",
        "echo (pode demorar alguns minutos se houver muitas midias)",
        "echo.",
        "",
        "rem --- copiar apenas os arquivos do backup, nao o pendrive inteiro ---",
        "mkdir \"%DEST%\"",
        "for %%F in (index.html style.css app.js) do (",
        "  if exist \"%SRC%\\%%F\" xcopy /Y \"%SRC%\\%%F\" \"%DEST%\\\"",
        ")",
        "if exist \"%SRC%\\data\" xcopy /E /I /Y \"%SRC%\\data\" \"%DEST%\\data\"",
        "if exist \"%SRC%\\Media\" xcopy /E /I /Y \"%SRC%\\Media\" \"%DEST%\\Media\"",
        "",
        "rem --- criar atalho na area de trabalho (usa PowerShell para resolver o caminho correto) ---",
        "echo Criando atalho na area de trabalho...",
        "set INDEX=%DEST%\\index.html",
        "powershell -NoProfile -Command \"$desktop = [Environment]::GetFolderPath('Desktop'); $ws = New-Object -ComObject WScript.Shell; $sc = $ws.CreateShortcut(\\\"$desktop\\\\Backup WhatsApp.lnk\\\"); $sc.TargetPath = '%INDEX%'; $sc.IconLocation = 'shell32.dll,13'; $sc.Description = 'Backup WhatsApp Business'; $sc.Save(); Write-Host \\\"Atalho criado em: $desktop\\\"\"",
        "",
        "echo.",
        "echo ============================================",
        "echo  Instalacao concluida com sucesso!",
        "echo ============================================",
        "echo.",
        "echo Arquivos copiados para:",
        "echo   %DEST%",
        "echo.",
        "echo Um atalho foi criado na area de trabalho.",
        "echo ATENCAO: so remova o pendrive apos fechar esta janela.",
        "echo.",
        "pause"
      ].join("\r\n");

    } else if (os === "mac") {
      filename = "instalar-backup-whatsapp.sh";
      type = "text/x-sh";
      content = [
        "#!/bin/bash",
        "# Instalador - Backup WhatsApp Business (macOS)",
        "",
        "# pasta onde este script esta (apenas os arquivos do backup)",
        "SRC=\"$(cd \"$(dirname \"$0\")\" && pwd)\"",
        "",
        "# destino: Documentos/Backup WhatsApp",
        "DEST=\"$HOME/Documents/Backup WhatsApp\"",
        "[ -d \"$HOME/Documentos\" ] && DEST=\"$HOME/Documentos/Backup WhatsApp\"",
        "",
        "echo '============================================'",
        "echo ' Instalador - Backup WhatsApp Business'",
        "echo '============================================'",
        "echo",
        "",
        "# verificar espaco disponivel",
        "NEEDED=$(du -sk \"$SRC\" 2>/dev/null | awk '{print $1 * 1024}')",
        "FREE=$(df -k \"$HOME\" | awk 'NR==2 {print $4 * 1024}')",
        "if [ -n \"$NEEDED\" ] && [ -n \"$FREE\" ] && [ \"$NEEDED\" -gt \"$FREE\" ]; then",
        "  echo 'ERRO: Espaço insuficiente no disco.'",
        "  echo \"Necessário: ~$(du -sh \"$SRC\" | awk '{print $1}')\"",
        "  echo 'Libere espaço e tente novamente.'",
        "  exit 1",
        "fi",
        "",
        "if [ -d \"$DEST\" ]; then",
        "  echo 'Atenção: já existe uma instalação em:'",
        "  echo \"  $DEST\"",
        "  echo",
        "  echo 'A pasta será APAGADA e substituída pela versão do pendrive.'",
        "  echo 'Isso garante que não sobrem arquivos antigos.'",
        "  echo",
        "  read -r -p 'Digite S e pressione Enter para continuar, ou N para cancelar: ' CONFIRMA",
        "  case \"$CONFIRMA\" in",
        "    [Ss]*) ;;",
        "    *) echo 'Instalação cancelada.'; exit 0 ;;",
        "  esac",
        "  echo",
        "  echo 'Removendo instalação anterior...'",
        "  rm -rf \"$DEST\"",
        "fi",
        "",
        "echo \"Copiando arquivos para: $DEST\"",
        "echo '(pode demorar alguns minutos se houver muitas mídias)'",
        "echo",
        "",
        "mkdir -p \"$DEST\"",
        "cp -R \"$SRC/\" \"$DEST/\"",
        "",
        "# criar atalho na area de trabalho como .webloc",
        "DESKTOP=\"$HOME/Desktop\"",
        "[ ! -d \"$DESKTOP\" ] && DESKTOP=\"$HOME/Documentos\"",
        "WBLOC=\"$DESKTOP/Backup WhatsApp.webloc\"",
        "cat > \"$WBLOC\" << EOF",
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">",
        "<plist version=\"1.0\"><dict><key>URL</key><string>file://${DEST// /%20}/index.html</string></dict></plist>",
        "EOF",
        "",
        "echo '============================================'",
        "echo ' Instalação concluída com sucesso!'",
        "echo '============================================'",
        "echo",
        "echo \"Arquivos em: $DEST\"",
        "echo 'Um atalho .webloc foi criado na área de trabalho.'",
        "echo 'Pode remover o pendrive com segurança.'"
      ].join("\n");

    } else {
      filename = "instalar-backup-whatsapp.sh";
      type = "text/x-sh";
      content = [
        "#!/bin/bash",
        "# Instalador - Backup WhatsApp Business (Linux)",
        "",
        "# pasta onde este script esta (apenas os arquivos do backup)",
        "SRC=\"$(cd \"$(dirname \"$0\")\" && pwd)\"",
        "",
        "# destino: tenta Documentos, senão cria em ~",
        "DEST=\"$HOME/Backup WhatsApp\"",
        "for D in \"$HOME/Documentos\" \"$HOME/Documents\"; do",
        "  if [ -d \"$D\" ]; then DEST=\"$D/Backup WhatsApp\"; break; fi",
        "done",
        "",
        "echo '============================================'",
        "echo ' Instalador - Backup WhatsApp Business'",
        "echo '============================================'",
        "echo",
        "",
        "# verificar espaco disponivel",
        "NEEDED=$(du -sk \"$SRC\" 2>/dev/null | awk '{print $1 * 1024}')",
        "FREE=$(df -k \"$HOME\" | awk 'NR==2 {print $4 * 1024}')",
        "if [ -n \"$NEEDED\" ] && [ -n \"$FREE\" ] && [ \"$NEEDED\" -gt \"$FREE\" ]; then",
        "  echo 'ERRO: Espaço insuficiente no disco.'",
        "  echo \"Necessário: ~$(du -sh \"$SRC\" | awk '{print $1}')\"",
        "  echo 'Libere espaço e tente novamente.'",
        "  exit 1",
        "fi",
        "",
        "if [ -d \"$DEST\" ]; then",
        "  echo 'Atenção: já existe uma instalação em:'",
        "  echo \"  $DEST\"",
        "  echo",
        "  echo 'A pasta será APAGADA e substituída pela versão do pendrive.'",
        "  echo 'Isso garante que não sobrem arquivos antigos.'",
        "  echo",
        "  read -r -p 'Digite S e pressione Enter para continuar, ou N para cancelar: ' CONFIRMA",
        "  case \"$CONFIRMA\" in",
        "    [Ss]*) ;;",
        "    *) echo 'Instalação cancelada.'; exit 0 ;;",
        "  esac",
        "  echo",
        "  echo 'Removendo instalação anterior...'",
        "  rm -rf \"$DEST\"",
        "fi",
        "",
        "echo \"Copiando arquivos para: $DEST\"",
        "echo '(pode demorar alguns minutos se houver muitas mídias)'",
        "echo",
        "",
        "mkdir -p \"$DEST\"",
        "cp -R \"$SRC/\" \"$DEST/\"",
        "",
        "# criar arquivo .desktop",
        "DFILE=\"$DEST/Backup WhatsApp.desktop\"",
        "INDEX_URL=\"file://$(printf '%s' \"$DEST/index.html\" | sed 's/ /%20/g')\"",
        "cat > \"$DFILE\" << EOF",
        "[Desktop Entry]",
        "Version=1.0",
        "Type=Application",
        "Name=Backup WhatsApp",
        "Exec=xdg-open \"$DEST/index.html\"",
        "Icon=text-html",
        "Terminal=false",
        "EOF",
        "chmod +x \"$DFILE\"",
        "",
        "# copiar .desktop para area de trabalho, se existir",
        "for D in \"$HOME/Desktop\" \"$HOME/Área de Trabalho\" \"$HOME/Escritório\"; do",
        "  if [ -d \"$D\" ]; then",
        "    cp \"$DFILE\" \"$D/\"",
        "    chmod +x \"$D/Backup WhatsApp.desktop\"",
        "    break",
        "  fi",
        "done",
        "",
        "echo '============================================'",
        "echo ' Instalação concluída com sucesso!'",
        "echo '============================================'",
        "echo",
        "echo \"Arquivos em: $DEST\"",
        "echo 'Um atalho foi criado na área de trabalho (se disponível).'",
        "echo 'Pode remover o pendrive com segurança.'"
      ].join("\n");
    }

    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  }

})();
