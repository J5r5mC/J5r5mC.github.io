/* ==================
   Carte des voyages
   ------------------
   Pour chaque lieu : ville, region, pays (en français) et leurs versions
   anglaises ville_en, region_en, pays_en. Tout ce qui est vide est ignoré.
   Si une version anglaise manque, la version française est utilisée
   (pratique pour Naples, Florence, Prague, Istanbul, Delhi...).
   Une note facultative : note: "...", note_en: "..."
   ================== */
var VOYAGES = [
  { ville: "Londres", ville_en: "London", pays: "Angleterre", pays_en: "England", lat: 51.5050, lon: -0.1287 },
  { region: "Asturies", region_en: "Asturias", pays: "Espagne", pays_en: "Spain", lat: 43.3633, lon: -5.848760 },
  { ville: "Naples", pays: "Italie", pays_en: "Italy", lat: 40.8489, lon: 14.262309 },
  { ville: "Florence", pays: "Italie", pays_en: "Italy", lat: 43.7695, lon: 11.2558 },
  { ville: "Budapest", pays: "Hongrie", pays_en: "Hungary", lat: 47.4933, lon: 19.0542 },
  { ville: "Prague", pays: "Tchéquie", pays_en: "Czechia", lat: 50.074604, lon: 14.437187 },
  { ville: "Istanbul", pays: "Turquie", pays_en: "Turkey", lat: 41.011890, lon: 28.968144 },
  { ville: "Dubaï", ville_en: "Dubai", pays: "Émirats arabes unis", pays_en: "United Arab Emirates", lat: 25.200009, lon: 55.300078 },
  { ville: "New York", pays: "États-Unis", pays_en: "United States", lat: 40.677319, lon: -73.955300 },
  { region: "Ladakh", pays: "Inde", pays_en: "India", lat: 34.150531, lon: 77.564416 },
  { ville: "Delhi", pays: "Inde", pays_en: "India", lat: 28.665679, lon: 77.199624 },
  { ville: "Marrakech", pays: "Maroc", pays_en: "Morocco", lat: 31.634595, lon: -7.993438 },
  { ville: "Agadir", pays: "Maroc", pays_en: "Morocco", lat: 30.423274, lon: -9.581526 },
  { ville: "Taroudant", pays: "Maroc", pays_en: "Morocco", lat: 30.472262, lon: -8.877501 },
  { ville: "Essaouira", pays: "Maroc", pays_en: "Morocco", lat: 31.510083, lon: -9.760460 },
  { ville: "Lisbonne", ville_en: "Lisbon", pays: "Portugal", lat: 38.726643, lon: -9.139141 },
  { pays: "Seychelles", lat: -4.674400, lon: 55.469314 }
];



/* =================
   Code de la carte
   ================= */
(function () {
  var conteneur = document.getElementById("carte-voyage");
  if (!conteneur || typeof L === "undefined") return;

  var sansAnimation = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var carte = L.map(conteneur, {
    minZoom: 2,
    maxBounds: [[-85, -180], [85, 180]],
    maxBoundsViscosity: 1,
    scrollWheelZoom: false,      // évite de zoomer par erreur en faisant défiler la page
    zoomAnimation: !sansAnimation
  }).setView([25, 10], 2);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
  }).addTo(carte);

  // Le zoom à la molette ne s'active qu'après un clic sur la carte
  carte.on("click", function () { carte.scrollWheelZoom.enable(); });
  conteneur.addEventListener("mouseleave", function () { carte.scrollWheelZoom.disable(); });

  // Punaise (dessinée en CSS, voir .epingle dans style.css)
  var icone = L.divIcon({
    className: "epingle",
    html: "<span></span>",
    iconSize: [26, 26],
    iconAnchor: [13, 31],        // la pointe de la punaise est sur le lieu
    tooltipAnchor: [0, -32],
    popupAnchor: [0, -32]
  });

  // Langue courante (posée par langue.js sur <html lang="...">)
  function langue() {
    return document.documentElement.getAttribute("lang") === "en" ? "en" : "fr";
  }

  // Valeur d'un champ dans la langue courante (retombe sur le français si la version anglaise manque)
  function champ(v, nom) {
    return (langue() === "en" && v[nom + "_en"]) || v[nom];
  }

  // Éléments renseignés d'un lieu : ville, région, pays (ceux qui sont vides sont ignorés)
  function parties(v) {
    return [champ(v, "ville"), champ(v, "region"), champ(v, "pays")].filter(Boolean);
  }

  // Contenu de l'infobulle (survol) et de la fenêtre (clic)
  // Titre = premier élément renseigné, le reste s'affiche en dessous
  function contenu(v, avecNote) {
    var p = parties(v);
    var bloc = document.createElement("div");
    bloc.className = "lieu";
    var nom = document.createElement("strong");
    nom.textContent = p[0] || "";
    bloc.appendChild(nom);
    if (p.length > 1) {
      var d = document.createElement("span");
      d.textContent = p.slice(1).join(", ");
      bloc.appendChild(d);
    }
    var note = champ(v, "note");
    if (avecNote && note) {
      var n = document.createElement("div");
      n.className = "note";
      n.textContent = note;
      bloc.appendChild(n);
    }
    return bloc;
  }

  // Libellé court : "Ville, Pays" (ou le seul élément renseigné)
  function libelle(v) {
    var p = parties(v);
    return p.length > 1 ? p[0] + ", " + p[p.length - 1] : (p[0] || "");
  }

  var bornes = [];
  var liste = document.getElementById("liste-voyage");
  var elements = [];   // pour chaque lieu : marqueur + bouton de la liste

  VOYAGES.forEach(function (v) {
    var position = [v.lat, v.lon];
    bornes.push(position);

    var marqueur = L.marker(position, { icon: icone, riseOnHover: true }).addTo(carte);
    marqueur.bindTooltip(contenu(v, false), { direction: "top", className: "etiquette" });
    marqueur.bindPopup(contenu(v, true), { closeButton: true });

    var el = marqueur.getElement();
    if (el) el.setAttribute("role", "button");

    // Liste cliquable sous la carte (utile au clavier et sur mobile)
    var bouton = null;
    if (liste) {
      var li = document.createElement("li");
      bouton = document.createElement("button");
      bouton.type = "button";
      bouton.addEventListener("click", function () {
        carte.setView(position, Math.max(carte.getZoom(), 6), { animate: !sansAnimation });
        marqueur.openPopup();
      });
      li.appendChild(bouton);
      liste.appendChild(li);
    }
    elements.push({ v: v, marqueur: marqueur, bouton: bouton });
  });

  // (Re)écrit tous les textes de la carte dans la langue courante
  function traduire() {
    elements.forEach(function (e) {
      e.marqueur.setTooltipContent(contenu(e.v, false));
      e.marqueur.setPopupContent(contenu(e.v, true));
      var texte = libelle(e.v);
      var el = e.marqueur.getElement();
      if (el) el.setAttribute("aria-label", texte);
      if (e.bouton) e.bouton.textContent = texte;
    });
  }
  traduire();
  document.addEventListener("changement-langue", traduire);

  // La carte est dans un onglet masqué au départ : on la recalcule dès qu'elle devient visible
  var ajustee = false;
  function rafraichir() {
    if (!conteneur.clientWidth) return;
    carte.invalidateSize();
    if (!ajustee && bornes.length) {
      ajustee = true;
      carte.fitBounds(bornes, { padding: [50, 50], maxZoom: 5 });
    }
  }
  if ("ResizeObserver" in window) new ResizeObserver(rafraichir).observe(conteneur);
  window.addEventListener("resize", rafraichir);
  var onglet = document.getElementById("onglet-voyage");
  if (onglet) onglet.addEventListener("click", function () { setTimeout(rafraichir, 0); });
  rafraichir();
})();
