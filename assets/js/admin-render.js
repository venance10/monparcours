import { D } from "./data.js";
import { metrics } from "./admin-dashboard.js";
import { DEFAULT_BRANCH, DEFAULT_OWNER, DEFAULT_REPO } from "./config.js";
import { getGitHubConfig } from "./github.js";
import { pick, tr } from "./i18n.js";
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
    ["shortName", "Nom court affiche", "text"],
    ["role", "Titre / positionnement", "text"],
    ["roleEn", "Titre / positionnement EN", "text"],
    ["tagline", "Phrase d'accroche", "textarea"],
    ["taglineEn", "Phrase d'accroche EN", "textarea"],
    ["location", "Localisation", "text"],
    ["locationEn", "Localisation EN", "text"],
    ["email", "Email", "text"],
    ["phone", "Telephone", "text"],
    ["availability", "Disponibilite", "text"],
    ["availabilityEn", "Disponibilite EN", "text"],
    ["speciality", "Specialite", "text"],
    ["specialityEn", "Specialite EN", "text"],
    ["languages", "Langues", "text"],
    ["languagesEn", "Langues EN", "text"],
    ["avatar", "Photo de profil", "avatar"],
    ["cv", "CV PDF", "pdf"],
    ["github", "GitHub", "url"],
    ["linkedin", "LinkedIn", "url"],
    ["about", "A propos", "textarea"],
    ["aboutEn", "A propos EN", "textarea"]
  ],
  services: [
    ["title", "Nom du service", "text"],
    ["titleEn", "Nom du service EN", "text"],
    ["description", "Description", "textarea"],
    ["descriptionEn", "Description EN", "textarea"],
    ["icon", "Icone", "select", ["shield", "search", "file", "check", "map", "book", "layout", "bolt"]]
  ],
  projects: [
    ["title", "Titre du projet", "text"],
    ["titleEn", "Titre du projet EN", "text"],
    ["organization", "Organisation / client", "text"],
    ["organizationEn", "Organisation / client EN", "text"],
    ["date", "Date ou periode", "text"],
    ["dateEn", "Date ou periode EN", "text"],
    ["badge", "Badge", "text"],
    ["badgeEn", "Badge EN", "text"],
    ["badgeStyle", "Style du badge", "select", ["grc", "pentest", "hack"]],
    ["category", "Categorie", "text"],
    ["categoryEn", "Categorie EN", "text"],
    ["description", "Resume", "textarea"],
    ["descriptionEn", "Resume EN", "textarea"],
    ["bullets", "Points cles (une ligne par point)", "lines"],
    ["bulletsEn", "Points cles EN (une ligne par point)", "lines"],
    ["tags", "Tags (separes par des virgules)", "tags"]
  ],
  skills: [
    ["name", "Competence", "text"],
    ["nameEn", "Competence EN", "text"],
    ["category", "Groupe", "text"],
    ["categoryEn", "Groupe EN", "text"],
    ["level", "Niveau (%)", "number"]
  ],
  experience: [
    ["role", "Role", "text"],
    ["roleEn", "Role EN", "text"],
    ["company", "Organisation", "text"],
    ["companyEn", "Organisation EN", "text"],
    ["period", "Periode", "text"],
    ["periodEn", "Periode EN", "text"],
    ["description", "Description", "textarea"],
    ["descriptionEn", "Description EN", "textarea"]
  ],
  edu: [
    ["degree", "Formation", "text"],
    ["degreeEn", "Formation EN", "text"],
    ["school", "Ecole / organisme", "text"],
    ["schoolEn", "Ecole / organisme EN", "text"],
    ["period", "Periode", "text"],
    ["periodEn", "Periode EN", "text"],
    ["description", "Description", "textarea"],
    ["descriptionEn", "Description EN", "textarea"]
  ],
  certs: [
    ["title", "Certification", "text"],
    ["titleEn", "Certification EN", "text"],
    ["issuer", "Organisme", "text"],
    ["issuerEn", "Organisme EN", "text"],
    ["date", "Date", "text"],
    ["dateEn", "Date EN", "text"],
    ["description", "Description", "textarea"],
    ["descriptionEn", "Description EN", "textarea"],
    ["link", "Lien", "url"]
  ],
  knowledge: [
    ["titre", "Titre", "text"],
    ["titreEn", "Titre EN", "text"],
    ["resume", "Resume", "textarea"],
    ["resumeEn", "Resume EN", "textarea"],
    ["categorie", "Categorie", "text"],
    ["categorieEn", "Categorie EN", "text"],
    ["tags", "Tags (separes par des virgules)", "tags"],
    ["statut", "Statut", "select", ["publie", "brouillon"]],
    ["image", "Image", "image"],
    ["contenu", "Contenu HTML", "textarea"],
    ["contenuEn", "Contenu HTML EN", "textarea"]
  ],
  gallery: [
    ["titre", "Titre", "text"],
    ["titreEn", "Titre EN", "text"],
    ["categorie", "Categorie", "text"],
    ["categorieEn", "Categorie EN", "text"],
    ["tags", "Tags (separes par des virgules)", "tags"],
    ["image", "Image", "image"],
    ["telechargeable", "Telechargeable", "checkbox"]
  ],
  articles: [
    ["title", "Titre", "text"],
    ["titleEn", "Titre EN", "text"],
    ["summary", "Resume", "textarea"],
    ["summaryEn", "Resume EN", "textarea"],
    ["category", "Categorie", "text"],
    ["categoryEn", "Categorie EN", "text"],
    ["source", "Source", "text"],
    ["url", "Lien", "url"],
    ["tags", "Tags (separes par des virgules)", "tags"],
    ["status", "Statut", "select", ["publie", "brouillon"]]
  ],
  contacts: [
    ["label", "Libelle", "text"],
    ["labelEn", "Libelle EN", "text"],
    ["value", "Valeur affichee", "text"],
    ["url", "Lien", "url"],
    ["icon", "Icone", "select", ["mail", "phone", "linkedin", "github"]]
  ]
};

export function renderAdmin(tab = "dashboard") {
  if (tab === "dashboard") return renderDashboard();
  if (tab === "infos") return renderInfos();
  if (tab === "cv") return renderCv();
  if (tab === "settings") return renderSettings();
  return renderCollection(tab);
}

function renderDashboard() {
  return `<div class="admin-grid">${metrics().map(([label, value]) => `<div class="card metric"><span class="muted">${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>
  <section class="admin-panel"><div class="admin-top"><div><h3>${escapeHtml(tr("onlineSave"))}</h3><p class="muted">${escapeHtml(tr("onlineSaveHelp"))}</p></div><button class="btn primary" data-gh-save>${icon("save")} ${escapeHtml(tr("saveGithubNow"))}</button></div></section>
  <section class="admin-panel"><h3>${escapeHtml(tr("recentActivity"))}</h3><div class="admin-list">${(D.activity || []).slice(0, 10).map(a => `<div class="card admin-row"><span>${escapeHtml(a.message)}</span><span class="badge">${new Date(a.date).toLocaleString(tr("all") === "All" ? "en-US" : "fr-FR")}</span></div>`).join("") || `<p class="muted">${escapeHtml(tr("noContent"))}</p>`}</div></section>`;
}

function renderCollection(name) {
  const rows = (D[name] || []).map(item => {
    const keys = collections[name] || Object.keys(item).slice(0, 2);
    return `<div class="card admin-row" draggable="true" data-id="${item.id}" data-collection="${name}"><div><strong>${escapeHtml(pick(item, keys[0]) || item.id)}</strong><p class="muted">${escapeHtml(pick(item, keys[1]) || "")}</p></div><div class="admin-row-actions"><button class="icon-btn" data-edit="${item.id}" title="${escapeHtml(tr("edit"))}">${icon("edit")}</button><button class="icon-btn" data-delete="${item.id}" title="${escapeHtml(tr("delete"))}">${icon("trash")}</button></div></div>`;
  }).join("");
  return `<section class="admin-panel"><div class="admin-top"><div><h2>${escapeHtml(labelFor(name))}</h2><p class="muted">${escapeHtml(tr("addEditDelete"))}</p></div><button class="btn primary" data-add="${name}">${icon("plus")} ${escapeHtml(tr("add"))}</button></div><div class="admin-list">${rows || `<div class="card admin-row"><span class="muted">${escapeHtml(tr("noContent"))}</span></div>`}</div></section>`;
}

function renderInfos() {
  return `<section class="admin-panel"><div class="admin-top"><div><h2>${escapeHtml(tr("mainInfos"))}</h2><p class="muted">${escapeHtml(tr("mainInfosHelp"))}</p></div></div>
  <form id="infoForm" class="card form-card"><div class="form-grid">${formSchemas.infos.map(field => renderField(field, D.infos)).join("")}</div><div class="sticky-actions"><button class="btn primary" type="button" data-save-info>${icon("save")} ${escapeHtml(tr("save"))}</button></div></form></section>`;
}

function renderCv() {
  const isEmbedded = String(D.infos.cv || "").startsWith("data:application/pdf");
  const meta = cvMeta(D.infos.cv);
  return `<section class="admin-panel"><div class="admin-top"><div><h2>${escapeHtml(tr("cvTab"))}</h2><p class="muted">${escapeHtml(tr("cvHelp"))}</p></div></div>
  <form id="cvForm" class="card form-card">
    <div class="form-grid">${renderField(["cv", "Nouveau CV PDF", "pdf"], D.infos)}</div>
    <div class="toolbar" style="margin-top:16px">
      <a class="btn" href="${escapeHtml(D.infos.cv || "./cv.pdf")}" target="_blank" rel="noopener">${icon("download")} ${escapeHtml(tr("currentCv"))}</a>
      <span class="badge">${escapeHtml(isEmbedded ? tr("embeddedCv") : tr("linkedCv"))}</span>
    </div>
    <p class="file-meta" id="cvMeta">${escapeHtml(meta)}</p>
    <p class="muted" style="margin-top:14px">${escapeHtml(tr("githubHelp"))}</p>
    <div class="sticky-actions"><button class="btn primary" type="button" data-save-cv>${icon("save")} ${escapeHtml(tr("saveCv"))}</button></div>
  </form></section>`;
}

function renderSettings() {
  const cfg = getGitHubConfig();
  const configured = Boolean(cfg.token);
  return `<section class="admin-panel"><h2>${escapeHtml(tr("githubSave"))}</h2><p class="muted">${escapeHtml(tr("githubHelp"))}</p><div class="form-grid" style="margin-top:16px">
    <label class="field"><span>Owner</span><input id="ghOwner" value="${escapeHtml(cfg.owner || DEFAULT_OWNER)}" placeholder="venance10"></label>
    <label class="field"><span>Repo</span><input id="ghRepo" value="${escapeHtml(cfg.repo || DEFAULT_REPO)}" placeholder="monparcours"></label>
    <label class="field"><span>Branch</span><input id="ghBranch" value="${escapeHtml(cfg.branch || DEFAULT_BRANCH)}" placeholder="main"></label>
    <label class="field"><span>Token</span><input id="ghToken" type="password"></label>
  </div><div class="toolbar" style="margin-top:14px"><button class="btn" data-gh-config>${icon("save")} ${escapeHtml(tr("saveGithubConfig"))}</button><button class="btn primary" data-gh-save>${escapeHtml(tr("saveGithubNow"))}</button><span class="badge ${configured ? "" : "danger"}">${escapeHtml(configured ? tr("githubConfigured") : tr("tokenRequired"))}</span></div></section>`;
}

export function renderEditModal(collection, item = {}) {
  const schema = formSchemas[collection];
  if (!schema) {
    return `<div class="modal-backdrop open"><div class="modal"><div class="admin-top"><h2>${escapeHtml(item.id ? tr("edit") : tr("add"))}</h2><button class="icon-btn" data-modal-close>x</button></div><textarea class="field json-panel" id="itemEditor">${escapeHtml(JSON.stringify(item, null, 2))}</textarea><button class="btn primary" data-save-item="${collection}" data-item-id="${item.id || ""}" style="margin-top:14px">${icon("save")} ${escapeHtml(tr("save"))}</button></div></div>`;
  }
  return `<div class="modal-backdrop open"><form class="modal" id="itemForm"><div class="admin-top"><h2>${escapeHtml(item.id ? tr("edit") : tr("add"))} ${escapeHtml(labelFor(collection))}</h2><button class="icon-btn" type="button" data-modal-close>x</button></div>
    <input type="hidden" name="id" value="${escapeHtml(item.id || "")}">
    <div class="form-grid">${schema.map(field => renderField(field, item)).join("")}</div>
    <div class="sticky-actions"><button class="btn primary" data-save-item="${collection}" data-item-id="${item.id || ""}" type="button">${icon("save")} ${escapeHtml(tr("save"))}</button><button class="btn" type="button" data-modal-close>${escapeHtml(tr("cancel"))}</button></div>
  </form></div>`;
}

export function getFormSchema(collection) {
  return formSchemas[collection] || null;
}

function renderField([name, label, type, options = []], item) {
  const value = item[name];
  const required = ["name", "title", "titre", "role", "degree", "label", "category", "categorie"].includes(name) ? " required" : "";
  const common = `name="${name}" id="field-${name}"${required}`;
  if (type === "image" || type === "avatar" || type === "pdf") {
    const accept = type === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp,image/svg+xml,.jpg,.jpeg,.png,.webp,.svg";
    const help = type === "pdf" ? "Choisir un PDF depuis l'ordinateur" : "Choisir une image depuis l'ordinateur";
    const preview = type !== "pdf" && value ? `<img src="${escapeHtml(value)}" alt="">` : `<span class="muted">${escapeHtml(adminLabel(help))}</span>`;
    return `<label class="field full ${type}-control"><span>${escapeHtml(adminLabel(label))}</span>${type !== "pdf" ? `<div class="image-preview ${type === "avatar" ? "avatar-preview" : ""}" data-preview-for="field-${name}">${preview}</div>` : `<p class="file-meta" data-file-meta-for="field-${name}">${escapeHtml(cvMeta(value))}</p>`}<input type="file" accept="${accept}" data-file-target="field-${name}" data-file-kind="${type}"><div class="upload-progress" data-progress-for="field-${name}"><span></span></div><textarea ${common} placeholder="${escapeHtml(adminLabel("URL, ou fichier converti automatiquement en base64"))}">${escapeHtml(value || "")}</textarea><div class="toolbar"><button class="btn" type="button" data-clear-file="field-${name}">${escapeHtml(tr("delete"))}</button></div><small class="muted">${escapeHtml(adminLabel(help))}. ${escapeHtml(adminLabel("Le fichier sera integre en base64 dans les donnees."))}</small></label>`;
  }
  if (type === "textarea" || type === "lines") {
    const text = Array.isArray(value) ? value.join("\n") : value || "";
    return `<label class="field full"><span>${escapeHtml(adminLabel(label))}</span><textarea ${common}>${escapeHtml(text)}</textarea></label>`;
  }
  if (type === "tags") {
    return `<label class="field full"><span>${escapeHtml(adminLabel(label))}</span><input ${common} value="${escapeHtml(Array.isArray(value) ? value.join(", ") : value || "")}"></label>`;
  }
  if (type === "select") {
    return `<label class="field"><span>${escapeHtml(adminLabel(label))}</span><select ${common}>${options.map(opt => `<option value="${escapeHtml(opt)}" ${opt === value ? "selected" : ""}>${escapeHtml(adminLabel(opt))}</option>`).join("")}</select></label>`;
  }
  if (type === "checkbox") {
    return `<label class="field"><span>${escapeHtml(adminLabel(label))}</span><select ${common}><option value="true" ${value !== false ? "selected" : ""}>${escapeHtml(adminLabel("Oui"))}</option><option value="false" ${value === false ? "selected" : ""}>${escapeHtml(adminLabel("Non"))}</option></select></label>`;
  }
  return `<label class="field"><span>${escapeHtml(adminLabel(label))}</span><input ${common} type="${type}" value="${escapeHtml(value ?? "")}"></label>`;
}

function cvMeta(value = "") {
  if (!value) return "Aucun fichier selectionne.";
  if (String(value).startsWith("data:application/pdf")) return "PDF integre dans data.json.";
  return `Lien actuel : ${value}`;
}

function labelFor(name) {
  return ({
    services: tr("services"),
    projects: tr("projects"),
    skills: tr("skills"),
    experience: tr("experienceTitle"),
    edu: tr("educationTitle"),
    certs: tr("certificationsTitle"),
    knowledge: tr("knowledge"),
    gallery: tr("gallery"),
    articles: "Articles",
    contacts: tr("contact"),
    infos: tr("infos")
  })[name] || name;
}

function adminLabel(label) {
  const en = {
    "Nom complet": "Full name",
    "Nom court affiche": "Displayed short name",
    "Titre / positionnement": "Title / positioning",
    "Titre / positionnement EN": "Title / positioning EN",
    "Phrase d'accroche": "Tagline",
    "Phrase d'accroche EN": "Tagline EN",
    "Localisation": "Location",
    "Localisation EN": "Location EN",
    "Telephone": "Phone",
    "Disponibilite": "Availability",
    "Disponibilite EN": "Availability EN",
    "Specialite": "Speciality",
    "Specialite EN": "Speciality EN",
    "Langues": "Languages",
    "Langues EN": "Languages EN",
    "CV PDF": "Resume PDF",
    "A propos": "About",
    "A propos EN": "About EN",
    "Nom du service": "Service name",
    "Nom du service EN": "Service name EN",
    "Description": "Description",
    "Description EN": "Description EN",
    "Icone": "Icon",
    "Titre du projet": "Project title",
    "Titre du projet EN": "Project title EN",
    "Organisation / client": "Organization / client",
    "Organisation / client EN": "Organization / client EN",
    "Date ou periode": "Date or period",
    "Date ou periode EN": "Date or period EN",
    "Badge EN": "Badge EN",
    "Style du badge": "Badge style",
    "Categorie": "Category",
    "Categorie EN": "Category EN",
    "Resume": "Summary",
    "Resume EN": "Summary EN",
    "Points cles (une ligne par point)": "Key points (one line per item)",
    "Points cles EN (une ligne par point)": "Key points EN (one line per item)",
    "Tags (separes par des virgules)": "Tags (comma-separated)",
    "Competence": "Skill",
    "Competence EN": "Skill EN",
    "Groupe": "Group",
    "Groupe EN": "Group EN",
    "Niveau (%)": "Level (%)",
    "Role": "Role",
    "Role EN": "Role EN",
    "Organisation": "Organization",
    "Organisation EN": "Organization EN",
    "Periode": "Period",
    "Periode EN": "Period EN",
    "Formation": "Education",
    "Formation EN": "Education EN",
    "Ecole / organisme": "School / organization",
    "Ecole / organisme EN": "School / organization EN",
    "Certification": "Certification",
    "Certification EN": "Certification EN",
    "Organisme": "Issuer",
    "Organisme EN": "Issuer EN",
    "Date": "Date",
    "Date EN": "Date EN",
    "Lien": "Link",
    "Titre": "Title",
    "Titre EN": "Title EN",
    "Statut": "Status",
    "Image": "Image",
    "Contenu HTML": "HTML content",
    "Contenu HTML EN": "HTML content EN",
    "Telechargeable": "Downloadable",
    "Source": "Source",
    "Libelle": "Label",
    "Libelle EN": "Label EN",
    "Valeur affichee": "Displayed value",
    "Nouveau CV PDF": "New resume PDF",
    "Choisir un PDF depuis l'ordinateur": "Choose a PDF from your computer",
    "Choisir une image depuis l'ordinateur": "Choose an image from your computer",
    "URL, ou fichier converti automatiquement en base64": "URL, or file automatically converted to base64",
    "Le fichier sera integre en base64 dans les donnees.": "The file will be embedded as base64 in the data.",
    "Oui": "Yes",
    "Non": "No",
    "Securite Offensive": "Offensive Security",
    "Gouvernance & Conformite": "Governance & Compliance",
    "Cybersecurite Defensive": "Defensive Cybersecurity",
    "Developpement": "Development"
  };
  return tr("all") === "All" ? en[label] || label : label;
}
