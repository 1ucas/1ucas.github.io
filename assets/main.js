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

  applyTheme(root.dataset.theme === "light" ? "light" : "dark");

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
    if (langLabel) langLabel.textContent = lang === "pt" ? "EN" : "PT";
    if (langToggle) {
      langToggle.setAttribute(
        "aria-label",
        lang === "pt" ? "Switch language to English" : "Switch language to Portuguese"
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

  /* ---------- footer year ---------- */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
