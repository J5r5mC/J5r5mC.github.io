/* =========================================================
   Carte des voyages
   ---------------------------------------------------------
   POUR AJOUTER UN LIEU : copie une ligne dans la liste
   ci-dessous, sépare-la par une virgule et change les valeurs.

   - ville  : nom affiché en gras
   - region : région, état ou département (peut rester "")
   - pays   : pays
   - lat    : latitude  (nombre avec un point, ex. 43.6047)
   - lon    : longitude (nombre avec un point, ex. 1.4442)
   - note   : texte facultatif affiché quand on clique (ex. "Été 2023")

   Les lieux ci-dessous sont des EXEMPLES : remplace-les par les tiens.
   ========================================================= */
var VOYAGES = [
  { ville: "Londres", pays: "Angleterre", lat: 51.5050, lon: -0.1287 },
  { region: "Asturies", pays: "Espagne", lat: 43.3633, lon: -5.848760 },
  { ville: "Naples", pays: "Italie", lat: 40.8489, lon: 14.262309 },
  { ville: "Florence", pays: "Italie", lat: 43.7695, lon: 11.2558 },
  { ville: "Budapest", pays: "Hongrie", lat: 47.4933, lon: 19.0542},
  { ville: "Prague", pays: "Tchéquie", lat: 50.074604, lon: 14.437187 },
  { ville: "Istanbul", pays: "Turquie", lat: 41.011890, lon:  28.968144},
  { ville: "Dubaï", pays: "Émirats arabes unis", lat: 25.200009, lon: 55.300078 }
];


/* =========================================================
   Code de la carte : normalement, rien à modifier ci-dessous
   ========================================================= */
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

  // Éléments renseignés d'un lieu : ville, région, pays (ceux qui sont vides sont ignorés)
  function parties(v) {
    return [v.ville, v.region, v.pays].filter(Boolean);
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
    if (avecNote && v.note) {
      var n = document.createElement("div");
      n.className = "note";
      n.textContent = v.note;
      bloc.appendChild(n);
    }
    return bloc;
  }

  var bornes = [];
  var liste = document.getElementById("liste-voyage");

  VOYAGES.forEach(function (v) {
    var position = [v.lat, v.lon];
    bornes.push(position);

    var marqueur = L.marker(position, { icon: icone, riseOnHover: true }).addTo(carte);
    marqueur.bindTooltip(contenu(v, false), { direction: "top", className: "etiquette" });
    marqueur.bindPopup(contenu(v, true), { closeButton: true });

    var p = parties(v);
    var libelle = p.length > 1 ? p[0] + ", " + p[p.length - 1] : (p[0] || "");
    var el = marqueur.getElement();
    if (el) {
      el.setAttribute("aria-label", libelle);
      el.setAttribute("role", "button");
    }

    // Liste cliquable sous la carte (utile au clavier et sur mobile)
    if (liste) {
      var li = document.createElement("li");
      var bouton = document.createElement("button");
      bouton.type = "button";
      bouton.textContent = libelle;
      bouton.addEventListener("click", function () {
        carte.setView(position, Math.max(carte.getZoom(), 6), { animate: !sansAnimation });
        marqueur.openPopup();
      });
      li.appendChild(bouton);
      liste.appendChild(li);
    }
  });

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
