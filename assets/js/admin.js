import { initAdmin } from "./admin-events.js";
initAdmin().catch(error => {
  console.error(error);
  document.body.innerHTML = `<main class="container section"><h1>Erreur admin</h1><p>${error.message}</p></main>`;
});
