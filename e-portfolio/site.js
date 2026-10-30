// Année du pied de page
(function () {
  var an = document.getElementById("annee");
  if (an) an.textContent = new Date().getFullYear();
})();

// Onglets (accessibles au clavier : flèches, Début, Fin)
// Sans JavaScript, tous les contenus restent affichés les uns sous les autres.
(function () {
  document.documentElement.classList.add("js");
  var onglets = [].slice.call(document.querySelectorAll('[role="tab"]'));
  if (!onglets.length) return;

  function choisir(onglet, focus) {
    onglets.forEach(function (o) {
      var actif = o === onglet;
      o.setAttribute("aria-selected", actif ? "true" : "false");
      o.tabIndex = actif ? 0 : -1;
      document.getElementById(o.getAttribute("aria-controls")).hidden = !actif;
    });
    if (focus) onglet.focus();
  }

  onglets.forEach(function (o, i) {
    o.addEventListener("click", function () {
      choisir(o);
      if (history.replaceState) history.replaceState(null, "", "#" + o.getAttribute("aria-controls"));
    });
    o.addEventListener("keydown", function (e) {
      var cible = null;
      if (e.key === "ArrowRight") cible = onglets[(i + 1) % onglets.length];
      if (e.key === "ArrowLeft") cible = onglets[(i - 1 + onglets.length) % onglets.length];
      if (e.key === "Home") cible = onglets[0];
      if (e.key === "End") cible = onglets[onglets.length - 1];
      if (cible) { e.preventDefault(); choisir(cible, true); }
    });
  });

  // Ouvre directement l'onglet indiqué dans l'adresse (ex. ingenierie.html#productions)
  var cle = location.hash.slice(1);
  var depart = onglets.filter(function (o) { return o.getAttribute("aria-controls") === cle; })[0] || onglets[0];
  choisir(depart);
})();
