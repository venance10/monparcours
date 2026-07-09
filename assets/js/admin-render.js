import { D } from "./data.js";
import { metrics } from "./admin-dashboard.js";
import { DEFAULT_BRANCH, DEFAULT_OWNER, DEFAULT_REPO } from "./config.js";
import { getGitHubConfig } from "./github.js";
import { escapeHtml, icon } from "./utils.js";

const collections = {
  services: ["title", "description"],
  projects: ["title", "description"],
  skills: ["name", "category"],
  experience: ["role", "company"],
  edu: ["degree", "school"],
  certs: ["title", "issuer"],
  knowledge: ["titre", "categorie"],
  gallery: ["titre", "categorie"],
  articles: ["title", "category"],
  contacts: ["label", "value"]
};

const formSchemas = {
  infos: [
    ["name", "Nom complet", "text"],
    ["shortName", "Nom court affiché", "text"],
    ["role", "Titre / positionnement", "text"],
    ["tagline", "Phrase d'accroche", "textarea"],
    ["location", "Localisation", "text"],
    ["email", "Email", "text"],
    ["phone", "Téléphone", "text"],
    ["availability", "Disponibilité", "text"],
    ["speciality", "Spécialité", "text"],
    ["languages", "Langues", "text"],
    ["cv", "CV PDF", "pdf"],
    ["github", "GitHub", "url"],
    ["linkedin", "LinkedIn", "url"],
    ["about", "À propos", "textarea"]
  ],
  services: [
    ["title", "Nom du service", "text"],
    ["description", "Description", "textarea"],
    ["icon", "Icône", "select", ["shield", "search", "file", "check", "map", "book", "layout", "bolt"]]
  ],
  projects: [
    ["title", "Titre du projet", "text"],
    ["organization", "Organisation / client", "text"],
    ["date", "Date ou période", "text"],
    ["badge", "Badge", "text"],
    ["badgeStyle", "Style du badge", "select", ["grc", "pentest", "hack"]],
    ["category", "Catégorie", "text"],
    ["description", "Résumé", "textarea"],
    ["bullets", "Points clés (une ligne par point)", "lines"],
    ["tags", "Tags (séparés par des virgules)", "tags"]
  ],
  skills: [
    ["name", "Compétence", "text"],
    ["category", "Groupe", "select", ["Sécurité Offensive", "Gouvernance & Conformité", "Cybersécurité Défensive", "Développement"]],
    ["level", "Niveau (%)", "number"]
  ],
  experience: [
    ["role", "Rôle", "text"],
    ["company", "Organisation", "text"],
    ["period", "Période", "text"],
    ["description", "Description", "textarea"]
  ],
  edu: [
    ["degree", "Formation", "text"],
    ["school", "École / organisme", "text"],
    ["period", "Période", "text"],
    ["description", "Description", "textarea"]
  ],
  certs: [
    ["title", "Certification", "text"],
    ["issuer", "Organisme", "text"],
    ["date", "Date", "text"],
    ["description", "Description", "textarea"],
    ["link", "Lien", "url"]
  ],
  knowledge: [
    ["titre", "Titre", "text"],
    ["resume", "Résumé", "textarea"],
    ["categorie", "Catégorie", "text"],
    ["tags", "Tags (séparés par des virgules)", "tags"],
    ["statut", "Statut", "select", ["publie", "brouillon"]],
    ["image", "Image", "image"],
    ["contenu", "Contenu HTML", "textarea"]
  ],
  gallery: [
    ["titre", "Titre", "text"],
    ["categorie", "Catégorie", "text"],
    ["tags", "Tags (séparés par des virgules)", "tags"],
    ["image", "Image", "image"],
    ["telechargeable", "Téléchargeable", "checkbox"]
  ],
  articles: [
    ["title", "Titre", "text"],
    ["summary", "Résumé", "textarea"],
    ["category", "Catégorie", "text"],
    ["source", "Source", "text"],
    ["url", "Lien", "url"],
    ["tags", "Tags (séparés par des virgules)", "tags"],
    ["status", "Statut", "select", ["publie", "brouillon"]]
  ],
  contacts: [
    ["label", "Libellé", "text"],
    ["value", "Valeur affichée", "text"],
    ["url", "Lien", "url"],
    ["icon", "Icône", "select", ["mail", "phone", "linkedin", "github"]]
  ]
};

export function renderAdmin(tab = "dashboard") {
  if (tab === "dashboard") return renderDashboard();
  if (tab === "infos") return renderInfos();
  if (tab === "github") return renderGithub();
  return renderCollection(tab);
}

function renderDashboard() {
  return `<div class="admin-grid">${metrics().map(([label, value]) => `<div class="card metric"><span class="muted">${label}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>
  <section class="card" style="padding:18px"><div class="admin-top"><div><h3>Sauvegarde en ligne</h3><p class="muted">Après configuration GitHub, chaque enregistrement peut être publié pour tous les appareils.</p></div><button class="btn primary" data-gh-save>${icon("save")} Sauvegarder maintenant sur GitHub</button></div></section>
  <section class="card" style="padding:18px"><h3>Activite recente</h3><div class="admin-list">${(D.activity || []).slice(0, 10).map(a => `<div class="admin-row"><span>${escapeHtml(a.message)}</span><span class="badge">${new Date(a.date).toLocaleString("fr-FR")}</span></div>`).join("")}</div></section>`;
}

function renderCollection(name) {
  const rows = (D[name] || []).map(item => {
    const keys = collections[name] || Object.keys(item).slice(0, 2);
    return `<div class="card admin-row" draggable="true" data-id="${item.id}" data-collection="${name}"><div><strong>${escapeHtml(item[keys[0]] || item.id)}</strong><p class="muted">${escapeHtml(item[keys[1]] || "")}</p></div><div class="admin-row-actions"><button class="icon-btn" data-edit="${item.id}" title="Modifier">${icon("edit")}</button><button class="icon-btn" data-delete="${item.id}" title="Supprimer">${icon("trash")}</button></div></div>`;
  }).join("");
  return `<div class="admin-top"><div><h2>${labelFor(name)}</h2><p class="muted">Ajoutez, modifiez ou supprimez les contenus avec un formulaire simple.</p></div><button class="btn primary" data-add="${name}">${icon("plus")} Ajouter</button></div><div class="admin-list">${rows || `<div class="card admin-row"><span class="muted">Aucun contenu pour le moment.</span></div>`}</div>`;
}

function renderJsonEditor(name, value) {
  return `<div class="admin-top"><h2>${name}</h2><button class="btn primary" data-save-json="${name}">${icon("save")} Appliquer</button></div><textarea class="field json-panel" id="jsonEditor">${escapeHtml(JSON.stringify(value, null, 2))}</textarea>`;
}

function renderInfos() {
  return `<div class="admin-top"><div><h2>Infos principales</h2><p class="muted">Modifiez l'identité, le hero, le contact et la bio du portfolio.</p></div><button class="btn primary" data-save-info>${icon("save")} Enregistrer</button></div>
  <form id="infoForm" class="card" style="padding:18px"><div class="form-grid">${formSchemas.infos.map(field => renderField(field, D.infos)).join("")}</div></form>`;
}

function renderGithub() {
  const cfg = getGitHubConfig();
  const configured = Boolean(cfg.token);
  return `<div class="card" style="padding:18px"><h2>Sauvegarde GitHub</h2><p class="muted">À configurer une seule fois. Ensuite, les boutons Enregistrer synchronisent automatiquement les changements en ligne.</p><div class="form-grid" style="margin-top:16px">
    <label class="field"><span>Owner</span><input id="ghOwner" value="${escapeHtml(cfg.owner || DEFAULT_OWNER)}" placeholder="venance10"></label>
    <label class="field"><span>Repo</span><input id="ghRepo" value="${escapeHtml(cfg.repo || DEFAULT_REPO)}" placeholder="monparcours"></label>
    <label class="field"><span>Branch</span><input id="ghBranch" value="${escapeHtml(cfg.branch || DEFAULT_BRANCH)}" placeholder="main"></label>
    <label class="field"><span>Token</span><input id="ghToken" type="password"></label>
  </div><div class="toolbar" style="margin-top:14px"><button class="btn" data-gh-config>${icon("save")} Enregistrer la configuration</button><button class="btn primary" data-gh-save>Sauvegarder maintenant sur GitHub</button><span class="badge ${configured ? "" : "danger"}">${configured ? "GitHub configuré" : "Token à ajouter"}</span></div></div>`;
}

export function renderEditModal(collection, item = {}) {
  const schema = formSchemas[collection];
  if (!schema) {
    return `<div class="modal-backdrop open"><div class="modal"><div class="admin-top"><h2>${item.id ? "Modifier" : "Ajouter"}</h2><button class="icon-btn" data-modal-close>x</button></div><textarea class="field json-panel" id="itemEditor">${escapeHtml(JSON.stringify(item, null, 2))}</textarea><button class="btn primary" data-save-item="${collection}" data-item-id="${item.id || ""}" style="margin-top:14px">${icon("save")} Enregistrer</button></div></div>`;
  }
  return `<div class="modal-backdrop open"><form class="modal" id="itemForm"><div class="admin-top"><h2>${item.id ? "Modifier" : "Ajouter"} ${labelFor(collection)}</h2><button class="icon-btn" type="button" data-modal-close>x</button></div>
    <input type="hidden" name="id" value="${escapeHtml(item.id || "")}">
    <div class="form-grid">${schema.map(field => renderField(field, item)).join("")}</div>
    <div class="toolbar" style="margin-top:16px"><button class="btn primary" data-save-item="${collection}" data-item-id="${item.id || ""}" type="button">${icon("save")} Enregistrer</button><button class="btn" type="button" data-modal-close>Annuler</button></div>
  </form></div>`;
}

export function getFormSchema(collection) {
  return formSchemas[collection] || null;
}

function renderField([name, label, type, options = []], item) {
  const value = item[name];
  const common = `name="${name}" id="field-${name}"`;
  if (type === "image" || type === "pdf") {
    const accept = type === "pdf" ? "application/pdf" : "image/*";
    const help = type === "pdf" ? "Choisir un PDF depuis l'ordinateur" : "Choisir une image depuis l'ordinateur";
    return `<label class="field full"><span>${escapeHtml(label)}</span><input type="file" accept="${accept}" data-file-target="field-${name}"><textarea ${common} placeholder="URL, ou fichier converti automatiquement en base64">${escapeHtml(value || "")}</textarea><small class="muted">${help}. Le fichier sera intégré en base64 dans les données.</small></label>`;
  }
  if (type === "textarea" || type === "lines") {
    const text = Array.isArray(value) ? value.join("\n") : value || "";
    return `<label class="field full"><span>${escapeHtml(label)}</span><textarea ${common}>${escapeHtml(text)}</textarea></label>`;
  }
  if (type === "tags") {
    return `<label class="field full"><span>${escapeHtml(label)}</span><input ${common} value="${escapeHtml(Array.isArray(value) ? value.join(", ") : value || "")}"></label>`;
  }
  if (type === "select") {
    return `<label class="field"><span>${escapeHtml(label)}</span><select ${common}>${options.map(opt => `<option value="${escapeHtml(opt)}" ${opt === value ? "selected" : ""}>${escapeHtml(opt)}</option>`).join("")}</select></label>`;
  }
  if (type === "checkbox") {
    return `<label class="field"><span>${escapeHtml(label)}</span><select ${common}><option value="true" ${value !== false ? "selected" : ""}>Oui</option><option value="false" ${value === false ? "selected" : ""}>Non</option></select></label>`;
  }
  return `<label class="field"><span>${escapeHtml(label)}</span><input ${common} type="${type}" value="${escapeHtml(value ?? "")}"></label>`;
}

function labelFor(name) {
  return ({
    services: "Services",
    projects: "Projets",
    skills: "Compétences",
    experience: "Expériences",
    edu: "Formations",
    certs: "Certifications",
    knowledge: "Connaissances",
    gallery: "Affiches",
    articles: "Veille",
    contacts: "Contacts",
    infos: "Infos"
  })[name] || name;
}
