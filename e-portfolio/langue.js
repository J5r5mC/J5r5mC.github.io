/* =========================================================
   Bouton de langue FR / EN
   ---------------------------------------------------------
   - La langue choisie est mémorisée dans le navigateur.
   - Au premier passage : français si le navigateur est en
     français, anglais sinon.
   - On peut aussi forcer la langue dans l'adresse :
       index.html?lang=en   ou   index.html?lang=fr
   - Les textes sont écrits en double dans le HTML :
       <span lang="fr">Bonjour</span><span lang="en">Hello</span>
     (le CSS masque la langue qui n'est pas active).
   - Pour les attributs (alt, aria-label, title, href), on écrit
     la version française normalement et la version anglaise dans
     un attribut data-en-... :
       <img alt="Portrait" data-en-alt="Portrait">
       <a href="cv.pdf" data-en-href="cv-en.pdf">
   - Ce fichier se charge dans le <head>, SANS "defer", pour
     éviter un flash de la mauvaise langue au chargement.
   ========================================================= */
(function () {
  var racine = document.documentElement;
  var CLE = "langue";
  var ATTRIBUTS = ["alt", "aria-label", "title", "href"];

  function lire(cle) {
    try { return localStorage.getItem(cle); } catch (e) { return null; }
  }
  function ecrire(cle, valeur) {
    try { localStorage.setItem(cle, valeur); } catch (e) {}
  }
  function valide(l) { return l === "fr" || l === "en"; }

  function langueDepart() {
    var url = null;
    try { url = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    if (valide(url)) { ecrire(CLE, url); return url; }
    var memorisee = lire(CLE);
    if (valide(memorisee)) return memorisee;
    var nav = (navigator.language || "fr").toLowerCase();
    return nav.indexOf("fr") === 0 ? "fr" : "en";
  }

  // Titre et description : version française d'origine + version anglaise dans data-en
  function traduireTexteMeta(element, l) {
    if (!element) return;
    var attribut = element.tagName === "META" ? "content" : null;
    var actuel = attribut ? element.getAttribute(attribut) : element.textContent;
    if (!element.hasAttribute("data-fr")) element.setAttribute("data-fr", actuel);
    var nouveau = (l === "en" && element.getAttribute("data-en")) ? element.getAttribute("data-en") : element.getAttribute("data-fr");
    if (attribut) element.setAttribute(attribut, nouveau); else element.textContent = nouveau;
  }

  // Attributs traduisibles : alt, aria-label, title, href (via data-en-alt, data-en-aria-label, ...)
  function traduireAttributs(l) {
    ATTRIBUTS.forEach(function (nom) {
      var elements = document.querySelectorAll("[data-en-" + nom + "]");
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var memoire = "data-fr-" + nom;
        if (!el.hasAttribute(memoire)) el.setAttribute(memoire, el.getAttribute(nom) || "");
        el.setAttribute(nom, l === "en" ? el.getAttribute("data-en-" + nom) : el.getAttribute(memoire));
      }
    });
  }

  function appliquer(l) {
    racine.setAttribute("lang", l);
    traduireTexteMeta(document.querySelector("title"), l);
    traduireTexteMeta(document.querySelector('meta[name="description"]'), l);
    traduireAttributs(l);
    var bouton = document.querySelector(".langue");
    if (bouton) {
      bouton.setAttribute("aria-label", l === "fr" ? "Switch to English" : "Passer en français");
      bouton.setAttribute("aria-pressed", l === "en" ? "true" : "false");
    }
    // Les autres scripts (ex. la carte des voyages) écoutent ce signal
    document.dispatchEvent(new CustomEvent("changement-langue", { detail: { langue: l } }));
  }

  // Appliqué tout de suite : la page s'affiche directement dans la bonne langue
  var courante = langueDepart();
  racine.setAttribute("lang", courante);

  document.addEventListener("DOMContentLoaded", function () {
    appliquer(courante);
    var bouton = document.querySelector(".langue");
    if (!bouton) return;
    bouton.addEventListener("click", function () {
      courante = courante === "fr" ? "en" : "fr";
      ecrire(CLE, courante);
      appliquer(courante);
    });
  });
})();
