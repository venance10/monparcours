import { D } from "./data.js";
import { pick, tr } from "./i18n.js";
import { $, escapeHtml, icon } from "./utils.js";

export function openLightbox(id) {
  const item = D.gallery.find(g => g.id === id);
  if (!item) return;
  const title = pick(item, "titre");
  $("#lightbox").innerHTML = `<button class="icon-btn lightbox-close" data-lightbox-close aria-label="${escapeHtml(tr("close"))}">x</button><div><img src="${item.image}" alt="${escapeHtml(title)}"><div class="toolbar" style="margin-top:12px"><span class="badge">${escapeHtml(title)}</span>${item.telechargeable ? `<a class="btn" download href="${item.image}">${icon("download")} ${escapeHtml(tr("download"))}</a>` : ""}</div></div>`;
  $("#lightbox").classList.add("open");
}

export function closeLightbox() {
  $("#lightbox").classList.remove("open");
}
