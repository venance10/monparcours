import { initAdmin } from "./admin-events.js";
import { tr } from "./i18n.js";

initAdmin().catch(error => {
  console.error(error);
  document.body.innerHTML = `<main class="container section"><h1>${tr("adminError")}</h1><p>${error.message}</p></main>`;
});
