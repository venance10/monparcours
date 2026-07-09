import { D } from "./data.js";
import { $, escapeHtml, icon } from "./utils.js";

export function openLightbox(id) {
  const item = D.gallery.find(g => g.id === id);
  if (!item) return;
  $("#lightbox").innerHTML = `<button class="icon-btn lightbox-close" data-lightbox-close aria-label="Fermer">x</button><div><img src="${item.image}" alt="${escapeHtml(item.titre)}"><div class="toolbar" style="margin-top:12px"><span class="badge">${escapeHtml(item.titre)}</span>${item.telechargeable ? `<a class="btn" download href="${item.image}">${icon("download")} Telecharger</a>` : ""}</div></div>`;
  $("#lightbox").classList.add("open");
}

export function closeLightbox() {
  $("#lightbox").classList.remove("open");
}
