import { D } from "./data.js";
import { tr } from "./i18n.js";

export function metrics() {
  return [
    [tr("projects"), D.projects.length],
    [tr("skills"), D.skills.length],
    [tr("knowledge"), D.knowledge.length],
    [tr("gallery"), D.gallery.length],
    [tr("certifications"), D.certs.length],
    [tr("recentActivity"), new Date(D._updated).toLocaleString(tr("all") === "All" ? "en-US" : "fr-FR")]
  ];
}
