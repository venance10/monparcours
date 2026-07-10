import { BUILD_VERSION, LANG_KEY, STORAGE_KEY, THEME_KEY } from "./config.js";
import { loadData } from "./data.js";
import { closeLightbox, openLightbox } from "./gallery.js";
import { lang, setLang, tr } from "./i18n.js";
import { renderPublic, openArticle } from "./render.js";
import { $, $$, icon, toast } from "./utils.js";
import { initAnimations } from "./animations.js";

async function init() {
  document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) || "dark";
  await loadData();
  hydrateIcons();
  renderPublic();
  bindEvents();
  initAnimations();
  registerServiceWorker();
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
    bindSecretAdminAccess();
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
      bindSecretAdminAccess();
    }
  });
  bindDynamicEvents();
  bindSecretAdminAccess();
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
}

function bindDynamicEvents() {
  $$("[data-smart-filter]").forEach(tool => applySmartFilter(tool.dataset.smartFilter));
}

document.addEventListener("input", event => {
  const input = event.target.closest("[data-filter-search]");
  if (input) applySmartFilter(input.dataset.filterSearch);
});

document.addEventListener("change", event => {
  const select = event.target.closest("[data-filter-sort]");
  if (select) applySmartFilter(select.dataset.filterSort);
});

document.addEventListener("click", event => {
  const filter = event.target.closest("[data-filter-scope]");
  if (!filter) return;
  const scope = filter.dataset.filterScope;
  $$(`[data-filter-scope="${scope}"]`).forEach(item => item.classList.remove("active"));
  filter.classList.add("active");
  applySmartFilter(scope);
});

function applySmartFilter(scope) {
  const items = $$(`[data-filter-item="${scope}"]`);
  if (!items.length) return;
  const active = $(`[data-filter-scope="${scope}"].active`);
  const search = ($(`[data-filter-search="${scope}"]`)?.value || "").trim().toLowerCase();
  const sort = $(`[data-filter-sort="${scope}"]`)?.value || "default";
  const allLabel = tr("all").toLowerCase();
  const category = (active?.dataset.filter || tr("all")).toLowerCase();
  let visible = 0;

  items.forEach((item, index) => {
    item.dataset.originalIndex = item.dataset.originalIndex || String(index);
    const itemCategory = String(item.dataset.category || "").toLowerCase();
    const matchesCategory = category === allLabel || category === "tout" || category === "all" || itemCategory === category;
    const matchesSearch = !search || String(item.dataset.search || "").includes(search);
    const show = matchesCategory && matchesSearch;
    item.hidden = !show;
    if (show) visible += 1;
  });

  const sorted = [...items].sort((a, b) => compareFilterItems(a, b, sort));
  const parent = items[0].parentElement;
  sorted.forEach(item => parent.append(item));

  const counter = $(`[data-filter-count="${scope}"]`);
  if (counter) counter.textContent = `${visible} ${visible > 1 ? tr("results") : tr("result")}`;
}

function compareFilterItems(a, b, sort) {
  if (sort === "az") return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""));
  if (sort === "za") return String(b.dataset.title || "").localeCompare(String(a.dataset.title || ""));
  if (sort === "newest") return dateValue(b) - dateValue(a);
  if (sort === "oldest") return dateValue(a) - dateValue(b);
  return Number(a.dataset.originalIndex || 0) - Number(b.dataset.originalIndex || 0);
}

function dateValue(item) {
  const raw = item.dataset.date || "";
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function bindSecretAdminAccess() {
  const portal = $("#profilePortal");
  if (!portal) return;
  let taps = [];
  portal.addEventListener("click", () => {
    const now = Date.now();
    taps = [...taps.filter(time => now - time <= 5000), now];
    portal.classList.add("secret-tap");
    setTimeout(() => portal.classList.remove("secret-tap"), 260);
    if (taps.length >= 3) {
      taps = [];
      portal.classList.add("secret-open");
      window.location.href = ["./", "admin", ".html"].join("");
    }
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  let refreshing = false;
  const hadController = Boolean(navigator.serviceWorker.controller);
  const reloadKey = `venanceportfolio:sw-reloaded:${BUILD_VERSION}`;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing || !hadController || sessionStorage.getItem(reloadKey) === "1") return;
    refreshing = true;
    sessionStorage.setItem(reloadKey, "1");
    window.location.reload();
  });

  try {
    const registration = await navigator.serviceWorker.register(`./sw.js?v=${BUILD_VERSION}`);
    await registration.update();

    if (registration.waiting) {
      activateWaitingWorker(registration.waiting);
    }

    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed") activateWaitingWorker(worker);
      });
    });
  } catch (error) {
    console.warn("Service Worker update failed", error);
  }
}

function activateWaitingWorker(worker) {
  worker.postMessage({ type: "SKIP_WAITING", version: BUILD_VERSION });
}

init().catch(error => {
  console.error(error);
  document.body.innerHTML = `<main class="container section"><h1>${tr("loadError")}</h1><p>${error.message}</p></main>`;
});
