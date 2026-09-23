(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---- navigation ---- */
  function showView(id) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === id));
    $$(".nav button[data-view]").forEach((b) =>
      b.classList.toggle("active", b.getAttribute("data-view") === id)
    );
    const view = document.getElementById(id);
    const title = view && view.getAttribute("data-title");
    const heading = $("#viewTitle");
    if (heading && title) heading.textContent = title;
  }
  $$(".nav button[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.getAttribute("data-view")));
  });
  const first = $(".view");
  if (first) showView(first.id);

  /* ---- sample data ---- */
  const sites = [
    { id: "s1", name: "Lusona", url: "https://lusona.org", domains: "lusona.org", profile: "desktop-chrome-en", recording: "on", status: "active" },
    { id: "s2", name: "Docs", url: "https://docs.example.com", domains: "docs.example.com", profile: "desktop-firefox-en", recording: "off", status: "paused" }
  ];
  const profiles = [
    { name: "desktop-chrome-en", browser: "Chrome", lang: "en-US", tz: "UTC", viewport: "1440×900", device: "Desktop" },
    { name: "desktop-firefox-en", browser: "Firefox", lang: "en-US", tz: "America/New_York", viewport: "1366×768", device: "Desktop" },
    { name: "mobile-safari-en", browser: "Safari", lang: "en-GB", tz: "Europe/London", viewport: "390×844", device: "iPhone" }
  ];
  const workflows = [
    { name: "Event check-in", site: "Lusona", steps: 6, mode: "assisted" },
    { name: "Content QA pass", site: "Docs", steps: 4, mode: "headless" }
  ];
  const palette = [
    "Navigate URL", "Click selector", "Type text", "Wait for element",
    "Extract text", "Screenshot", "Assert visible", "Branch / condition"
  ];

  function fillTable(table, rows, cols) {
    if (!table) return;
    const tb = table.tBodies[0] || table.createTBody();
    tb.innerHTML = "";
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      cols.forEach((c) => {
        const td = document.createElement("td");
        if (typeof c === "function") c(td, row);
        else td.textContent = row[c] != null ? row[c] : "";
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
  }

  fillTable($("#siteRegTable"), sites, ["id", "name", "url", "domains", "profile", "recording", "status"]);
  fillTable($("#profTable"), profiles, ["name", "browser", "lang", "tz", "viewport", "device"]);
  fillTable($("#wfTable"), workflows, [
    "name", "site", "steps", "mode",
    (td) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.textContent = "Run";
      b.addEventListener("click", () => toast("Queued workflow: " + td.parentElement.cells[0].textContent));
      td.appendChild(b);
    }
  ]);

  /* ---- workflow builder ---- */
  const draft = [];
  const paletteEl = $("#wfPalette");
  const draftEl = $("#wfDraft");
  function renderDraft() {
    if (!draftEl) return;
    draftEl.innerHTML = "";
    draft.forEach((step, i) => {
      const li = document.createElement("li");
      li.textContent = (i + 1) + ". " + step;
      draftEl.appendChild(li);
    });
  }
  if (paletteEl) {
    palette.forEach((label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn";
      b.textContent = label;
      b.addEventListener("click", () => {
        draft.push(label);
        renderDraft();
      });
      paletteEl.appendChild(b);
    });
  }
  $("#btnClearWf") && $("#btnClearWf").addEventListener("click", () => {
    draft.length = 0;
    renderDraft();
  });
  $("#btnSaveWf") && $("#btnSaveWf").addEventListener("click", () => {
    if (!draft.length) {
      toast("Add at least one step before saving.");
      return;
    }
    workflows.push({
      name: "Custom workflow " + (workflows.length + 1),
      site: sites[0] ? sites[0].name : "—",
      steps: draft.length,
      mode: "assisted"
    });
    fillTable($("#wfTable"), workflows, [
      "name", "site", "steps", "mode",
      (td) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn";
        b.textContent = "Run";
        td.appendChild(b);
      }
    ]);
    draft.length = 0;
    renderDraft();
    toast("Workflow saved.");
  });

  /* ---- plan approve / reject ---- */
  const reportBox = $("#reportBox");
  $("#btnApprove") && $("#btnApprove").addEventListener("click", () => {
    if (reportBox) {
      reportBox.innerHTML =
        "<strong>Run report</strong><br/>Status: approved<br/>Events captured: 37<br/>" +
        "Learning signals: navigation patterns, form completion, error recovery<br/>" +
        "Exported for JARVIS: structured JSON + screenshots index.";
    }
    toast("Plan approved — report generated.");
  });
  $("#btnReject") && $("#btnReject").addEventListener("click", () => {
    if (reportBox) {
      reportBox.textContent = "Plan rejected. No report produced. Adjust steps and resubmit.";
    }
    toast("Plan rejected.");
  });

  /* ---- settings ---- */
  $("#btnSaveSettings") && $("#btnSaveSettings").addEventListener("click", () => {
    toast("Settings saved.");
  });

  /* ---- toast helper ---- */
  function toast(msg) {
    let t = $("#toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.setAttribute("role", "status");
      t.style.cssText =
        "position:fixed;bottom:20px;right:20px;background:#1a1f2e;color:#e8ecf4;" +
        "padding:10px 14px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.35);" +
        "z-index:9999;font-size:.9rem;opacity:0;transition:opacity .2s";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    clearTimeout(t._h);
    t._h = setTimeout(() => {
      t.style.opacity = "0";
    }, 2200);
  }
})();
