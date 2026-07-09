import { DEFAULT_BRANCH, DEFAULT_OWNER, DEFAULT_REPO, GITHUB_CONFIG_KEY } from "./config.js";

export function getGitHubConfig() {
  return JSON.parse(localStorage.getItem(GITHUB_CONFIG_KEY) || "{}");
}

export function setGitHubConfig(config) {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify({
    owner: config.owner || DEFAULT_OWNER,
    repo: config.repo || DEFAULT_REPO,
    branch: config.branch || DEFAULT_BRANCH,
    token: config.token || ""
  }));
}

export async function saveDataToGitHub(data) {
  const cfg = getGitHubConfig();
  if (!cfg.token) throw new Error("Token GitHub manquant.");
  const path = "data.json";
  const endpoint = `https://api.github.com/repos/${cfg.owner || DEFAULT_OWNER}/${cfg.repo || DEFAULT_REPO}/contents/${path}`;
  const current = await fetch(`${endpoint}?ref=${cfg.branch || DEFAULT_BRANCH}`, { headers: { Authorization: `Bearer ${cfg.token}` } });
  const currentJson = current.ok ? await current.json() : {};
  const body = {
    message: `Update portfolio data ${new Date().toISOString()}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
    branch: cfg.branch || DEFAULT_BRANCH,
    sha: currentJson.sha
  };
  const res = await fetch(endpoint, {
    method: "PUT",
    headers: { Authorization: `Bearer ${cfg.token}`, Accept: "application/vnd.github+json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`Erreur GitHub ${res.status}`);
  return res.json();
}
