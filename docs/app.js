(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Header : ombre au scroll
  ------------------------------------------------------------------ */
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
     Navigation mobile
  ------------------------------------------------------------------ */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("nav-toggle");
  if (nav && toggle) {
    var closeNav = function () {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Ouvrir le menu");
    };
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ------------------------------------------------------------------
     Lien actif dans la nav selon la section visible
  ------------------------------------------------------------------ */
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------------------------------
     Apparition au scroll (sans JS, tout reste visible)
  ------------------------------------------------------------------ */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealables = document.querySelectorAll("[data-reveal]");
  if (!reduceMotion && "IntersectionObserver" in window && revealables.length) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    revealables.forEach(function (el) {
      el.classList.add("reveal");
      revealer.observe(el);
    });
  }

  /* ------------------------------------------------------------------
     Année du footer
  ------------------------------------------------------------------ */
  var year = document.getElementById("footer-year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------
     Devis en ligne
  ------------------------------------------------------------------ */
  var form = document.getElementById("quote-form");
  if (!form) return;

  var preview = document.getElementById("quote-preview");
  var mailBtn = document.getElementById("quote-mail");
  var waBtn = document.getElementById("quote-wa");
  var smsBtn = document.getElementById("quote-sms");
  var copyBtn = document.getElementById("quote-copy");
  var placeholder = preview.textContent;

  function val(id) {
    return document.getElementById(id).value.trim();
  }

  function services() {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[type="checkbox"]:checked'))
      .map(function (c) { return c.value; });
  }

  function buildMessage() {
    var marque = val("q-marque");
    var modele = val("q-modele");
    var lines = ["Demande de devis TPL Autos", ""];

    var vehicule = [marque, modele].filter(Boolean).join(" ");
    if (vehicule) lines.push("Véhicule : " + vehicule);
    if (val("q-annee")) lines.push("Année : " + val("q-annee"));
    if (val("q-km")) lines.push("Kilométrage : " + val("q-km") + " km");

    var s = services();
    if (s.length) lines.push("Intervention : " + s.join(", "));
    if (val("q-desc")) lines.push("", "Symptômes / demande :", val("q-desc"));

    var contact = [];
    if (val("q-nom")) contact.push(val("q-nom"));
    if (val("q-tel")) contact.push(val("q-tel"));
    if (contact.length) lines.push("", "Contact : " + contact.join(" - "));

    return { text: lines.join("\n"), vehicule: vehicule, empty: lines.length <= 2 };
  }

  function update() {
    var m = buildMessage();
    preview.textContent = m.empty ? placeholder : m.text;

    var subject = "Demande de devis" + (m.vehicule ? " - " + m.vehicule : "");
    var body = encodeURIComponent(m.text);
    mailBtn.href = "mailto:tplauto@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + body;
    waBtn.href = "https://wa.me/33651243479?text=" + body;
    smsBtn.href = "sms:+33651243479?&body=" + body;

    [mailBtn, waBtn, smsBtn].forEach(function (btn) {
      btn.setAttribute("aria-disabled", String(m.empty));
    });
    if (copyBtn) copyBtn.hidden = m.empty || !navigator.clipboard;
  }

  if (copyBtn && navigator.clipboard) {
    var copyLabel = copyBtn.textContent;
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(buildMessage().text).then(function () {
        copyBtn.textContent = "Copié !";
        setTimeout(function () { copyBtn.textContent = copyLabel; }, 1800);
      });
    });
  }

  form.addEventListener("input", update);
  update();
})();
