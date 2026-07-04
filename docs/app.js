(function () {
  var form = document.getElementById("quote-form");
  if (!form) return;

  var preview = document.getElementById("quote-preview");
  var mailBtn = document.getElementById("quote-mail");
  var waBtn = document.getElementById("quote-wa");
  var smsBtn = document.getElementById("quote-sms");
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
  }

  form.addEventListener("input", update);
  update();
})();
