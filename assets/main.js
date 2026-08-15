/* ============================================================
   Lucas Maciel — personal page
   Theme switch, EN/PT-BR switch, and small niceties.
   No dependencies, no external requests.
   ============================================================ */

(function () {
  "use strict";

  var root = document.documentElement;
  var store = {
    get: function (key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
    }
  };

  /* ---------- theme ----------
     The pre-paint snippet in <head> already resolved the initial theme,
     so here we only handle the switch itself. */

  var themeToggle = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#fbf8f3" : "#0b0f14");
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "Switch to dark theme" : "Switch to light theme"
      );
    }
  }

  /* If nothing stamped the root (JS-only entry points, embedded previews),
     fall back to the OS preference rather than assuming dark. */
  applyTheme(
    root.dataset.theme ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
  );

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
      store.set("theme", next);
    });
  }

  /* ---------- language ----------
     Every translatable node carries the PT-BR copy in data-pt.
     The English original is captured once, on first switch. */

  var langToggle = document.getElementById("lang-toggle");
  var langLabel = document.querySelector("[data-lang-label]");
  var translatable = document.querySelectorAll("[data-pt]");

  function applyLang(lang) {
    translatable.forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === "pt" ? el.dataset.pt : el.dataset.en;
    });

    root.lang = lang === "pt" ? "pt-BR" : "en";

    /* The label names the language you are reading, not the one you would
       switch to. The aria-label repeats it and adds the action, so the
       accessible name contains the visible text. */
    if (langLabel) langLabel.textContent = lang === "pt" ? "PT" : "EN";
    if (langToggle) {
      langToggle.setAttribute(
        "aria-label",
        lang === "pt" ? "Português — mudar para inglês" : "English — switch to Portuguese"
      );
    }
  }

  var savedLang = store.get("lang");
  var prefersPt = (navigator.language || "en").toLowerCase().indexOf("pt") === 0;
  var initialLang = savedLang || (prefersPt ? "pt" : "en");
  if (initialLang === "pt") applyLang("pt");

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      var next = root.lang === "pt-BR" ? "en" : "pt";
      applyLang(next);
      store.set("lang", next);
      chartFromDataset();   /* month labels and tooltips follow the language */
    });
  }

  /* ---------- sticky header hairline ---------- */

  var topbar = document.querySelector(".topbar");

  if (topbar && "IntersectionObserver" in window) {
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px;";
    document.body.prepend(sentinel);

    new IntersectionObserver(function (entries) {
      topbar.classList.toggle("is-stuck", !entries[0].isIntersecting);
    }).observe(sentinel);
  }


  /* ---------- contribution chart ----------
     The last year of activity is baked into data-levels / data-counts so the
     chart paints instantly and still works offline. Once drawn, we ask the
     public contributions API for fresh numbers and redraw if it answers;
     if it does not, the snapshot simply stands. */

  var grid = document.getElementById("chart-grid");

  var MONTHS = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    pt: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  };

  function drawChart(startISO, levels, counts) {
    if (!grid) return;

    var months = document.getElementById("chart-months");
    var start = new Date(startISO + "T00:00:00");
    var lang = root.lang === "pt-BR" ? "pt" : "en";
    var names = MONTHS[lang];
    var gridFrag = document.createDocumentFragment();
    var monthFrag = document.createDocumentFragment();
    var seen = -1;

    for (var i = 0; i < levels.length; i++) {
      var day = new Date(start.getTime() + i * 86400000);
      var cell = document.createElement("i");
      cell.dataset.level = levels[i];

      var n = counts && counts[i] !== undefined ? counts[i] : null;
      var date = names[day.getMonth()] + " " + day.getDate() + ", " + day.getFullYear();
      cell.title = n === null ? date
        : (n === 1 ? "1 contribution on " : n + " contributions on ") + date;

      gridFrag.appendChild(cell);

      /* one label per month, placed on the week where it starts */
      if (i % 7 === 0 && day.getMonth() !== seen) {
        seen = day.getMonth();
        var label = document.createElement("span");
        label.textContent = names[seen];
        label.style.gridColumn = (i / 7) + 1;
        monthFrag.appendChild(label);
      }
    }

    grid.textContent = "";
    grid.appendChild(gridFrag);
    if (months) {
      /* the API may return 53 or 54 weeks depending on the day it is asked */
      months.style.gridTemplateColumns = "repeat(" + Math.ceil(levels.length / 7) + ", 1fr)";
      months.textContent = "";
      months.appendChild(monthFrag);
    }
  }

  function chartFromDataset() {
    if (!grid) return;
    drawChart(
      grid.dataset.start,
      grid.dataset.levels,
      (grid.dataset.counts || "").split(",")
    );
  }

  chartFromDataset();

  if (grid && window.fetch) {
    fetch("https://github-contributions-api.jogruber.de/v4/1ucas?y=last")
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        var days = data.contributions;
        if (!days || !days.length) return;

        grid.dataset.start = days[0].date;
        grid.dataset.levels = days.map(function (d) { return d.level; }).join("");
        grid.dataset.counts = days.map(function (d) { return d.count; }).join(",");
        chartFromDataset();

        var total = document.getElementById("stat-total");
        if (total && data.total && data.total.lastYear) {
          total.textContent = data.total.lastYear;
        }
      })
      .catch(function () { /* snapshot stands */ });
  }

  /* ---------- footer year ---------- */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
