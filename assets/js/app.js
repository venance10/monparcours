import { LANG_KEY, STORAGE_KEY, THEME_KEY } from "./config.js";
import { loadData } from "./data.js";
import { closeLightbox, openLightbox } from "./gallery.js";
import { lang, setLang, tr } from "./i18n.js";
import { renderPublic, openArticle, projectCards } from "./render.js";
import { $, $$, icon, toast } from "./utils.js";
import { initAnimations } from "./animations.js";

async function init() {
  document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) || "dark";
  await loadData();
  hydrateIcons();
  renderPublic();
  bindEvents();
  initAnimations();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function hydrateIcons() {
  $("#themeBtn").innerHTML = icon("sun");
  $("#langBtn").innerHTML = icon("globe");
  $("#menuBtn").innerHTML = icon("menu");
  translateStaticShell();
}

function bindEvents() {
  $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("menu-open"));
  $("#themeBtn").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
  });
  $("#langBtn").addEventListener("click", () => {
    setLang(lang === "fr" ? "en" : "fr");
    localStorage.setItem(LANG_KEY, lang);
    translateStaticShell();
    renderPublic();
    bindDynamicEvents();
    toast(`${tr("languageChanged")}: ${lang.toUpperCase()}`);
  });
  document.addEventListener("click", event => {
    const article = event.target.closest("[data-article]");
    const poster = event.target.closest("[data-lightbox]");
    const close = event.target.closest("[data-close]");
    const lightboxClose = event.target.closest("[data-lightbox-close]");
    if (article) openArticle(article.dataset.article);
    if (poster) openLightbox(poster.dataset.lightbox);
    if (close) $("#modalRoot").innerHTML = "";
    if (lightboxClose || event.target.id === "lightbox") closeLightbox();
  });
  window.addEventListener("storage", async event => {
    if (event.key === STORAGE_KEY) {
      await loadData();
      renderPublic();
      bindDynamicEvents();
    }
  });
  bindDynamicEvents();
}

function translateStaticShell() {
  const skip = document.querySelector(".skip-link");
  const brand = document.querySelector(".brand");
  const nav = $("#navLinks");
  if (skip) skip.textContent = tr("skipContent");
  if (brand) brand.setAttribute("aria-label", tr("home"));
  if (nav) nav.setAttribute("aria-label", tr("mainNavigation"));
  $("#themeBtn").setAttribute("aria-label", tr("changeTheme"));
  $("#langBtn").setAttribute("aria-label", tr("changeLanguage"));
  $("#menuBtn").setAttribute("aria-label", tr("menu"));
  const adminLink = document.querySelector(".nav-actions a.btn");
  if (adminLink) adminLink.textContent = tr("admin");
}

function bindDynamicEvents() {
  $$("[data-filter-target='projects'] .filter").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".filter").forEach(item => item.classList.remove("active"));
      btn.classList.add("active");
      const value = btn.dataset.filter;
      const cards = $$("#projectGrid .project-card");
      cards.forEach(card => card.hidden = value !== tr("all") && value !== "Tout" && value !== "All" && card.dataset.category !== value);
    });
  });
}

init().catch(error => {
  console.error(error);
  document.body.innerHTML = `<main class="container section"><h1>${tr("loadError")}</h1><p>${error.message}</p></main>`;
});
