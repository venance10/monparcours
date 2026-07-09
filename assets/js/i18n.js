import { LANG_KEY } from "./config.js";

export let lang = localStorage.getItem(LANG_KEY) || "fr";
export const t = {
  fr: { projects: "Projets", skills: "Competences", contact: "Contact", view: "Voir", read: "Lire", download: "Telecharger", all: "Tout", admin: "Admin" },
  en: { projects: "Projects", skills: "Skills", contact: "Contact", view: "View", read: "Read", download: "Download", all: "All", admin: "Admin" }
};
export function setLang(next) {
  lang = next;
  localStorage.setItem(LANG_KEY, lang);
}
export function pick(obj, key) {
  if (lang === "en" && obj[`${key}En`]) return obj[`${key}En`];
  return obj[key] || "";
}
