import { BUILD_VERSION } from "./config.js";
import { initAdmin } from "./admin-events.js";
import { tr } from "./i18n.js";

registerServiceWorker();

initAdmin().catch(error => {
  console.error(error);
  document.body.innerHTML = `<main class="container section"><h1>${tr("adminError")}</h1><p>${error.message}</p></main>`;
});

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  let refreshing = false;
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing || !hadController) return;
    refreshing = true;
    window.location.reload();
  });

  try {
    const registration = await navigator.serviceWorker.register(`./sw.js?v=${BUILD_VERSION}`);
    await registration.update();
    if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING", version: BUILD_VERSION });
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed") worker.postMessage({ type: "SKIP_WAITING", version: BUILD_VERSION });
      });
    });
  } catch (error) {
    console.warn("Service Worker update failed", error);
  }
}
