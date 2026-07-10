import { BUILD_VERSION } from "./config.js";
import { D } from "./data.js";
import { getGitHubConfig } from "./github.js";
import { tr } from "./i18n.js";

export function metrics() {
  const dataSize = new Blob([JSON.stringify(D)]).size;
  const githubReady = Boolean(getGitHubConfig().token);
  return [
    [tr("projects"), D.projects.length],
    [tr("skills"), D.skills.length],
    [tr("certifications"), D.certs.length],
    [tr("watch"), D.articles.length],
    [tr("gallery"), D.gallery.length],
    ["Derniere modification", new Date(D._updated).toLocaleString(tr("all") === "All" ? "en-US" : "fr-FR")],
    ["GitHub", githubReady ? tr("githubConfigured") : tr("tokenRequired")],
    ["data.json", formatBytes(dataSize)],
    ["Version", BUILD_VERSION]
  ];
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
