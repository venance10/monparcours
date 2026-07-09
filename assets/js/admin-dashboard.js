import { D } from "./data.js";

export function metrics() {
  return [
    ["Projets", D.projects.length],
    ["Competences", D.skills.length],
    ["Connaissances", D.knowledge.length],
    ["Affiches", D.gallery.length],
    ["Certifications", D.certs.length],
    ["Derniere sauvegarde", new Date(D._updated).toLocaleString("fr-FR")]
  ];
}
