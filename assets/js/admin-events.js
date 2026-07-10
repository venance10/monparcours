import { ADMIN_LOCAL_HASH_KEY, ADMIN_PASS_HASH, ADMIN_SESSION_KEY } from "./config.js";
import { D, addActivity, loadData, setData } from "./data.js";
import { getGitHubConfig, saveDataToGitHub, setGitHubConfig } from "./github.js";
import { tr } from "./i18n.js";
import { getFormSchema, renderAdmin, renderEditModal } from "./admin-render.js";
import { $, $$, downloadJson, formatBytes, IMAGE_UPLOAD, isAllowedImageFile, readFileAsDataUrl, readImageAsOptimizedDataUrl, slugify, toast, uid } from "./utils.js";

let currentTab = "dashboard";

export async function initAdmin() {
  document.documentElement.lang = tr("all") === "All" ? "en" : "fr";
  await loadData({ preferLocal: true });
  translateShell();
  if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok") showShell();
  bindLogin();
}

function bindLogin() {
  $("#toggleSetupPass").addEventListener("click", () => {
    $("#passwordSetup").hidden = !$("#passwordSetup").hidden;
  });
  $("#saveLocalPass").addEventListener("click", saveLocalPassword);
  $("#loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const error = $("#loginError");
    if (error) error.hidden = true;
    const pass = $("#adminPass").value;
    const hash = await sha256(pass);
    const expectedHash = localStorage.getItem(ADMIN_LOCAL_HASH_KEY) || ADMIN_PASS_HASH;
    if (hash === expectedHash) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "ok");
      showShell();
    } else {
      if (error) error.hidden = false;
      toast(tr("wrongPassword"));
    }
  });
}

async function saveLocalPassword() {
  const pass = $("#newAdminPass").value;
  const confirm = $("#confirmAdminPass").value;
  if (pass.length < 8) {
    toast(tr("choosePassword"));
    return;
  }
  if (pass !== confirm) {
    toast(tr("passwordMismatch"));
    return;
  }
  localStorage.setItem(ADMIN_LOCAL_HASH_KEY, await sha256(pass));
  $("#newAdminPass").value = "";
  $("#confirmAdminPass").value = "";
  $("#passwordSetup").hidden = true;
  toast(tr("passwordSaved"));
}

function showShell() {
  $("#loginScreen").hidden = true;
  $("#adminShell").hidden = false;
  translateShell();
  render();
  bindShell();
}

function bindShell() {
  $$(".admin-tab").forEach(btn => btn.addEventListener("click", () => { currentTab = btn.dataset.tab; render(); }));
  $("#exportBtn").addEventListener("click", () => downloadJson("data.json", cleanData(D)));
  $("#importInput").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    setData(JSON.parse(text));
    addActivity("Import data.json", "import");
    await syncIfConfigured(tr("importSaved"));
    render();
  });
  $("#logoutBtn").addEventListener("click", () => { sessionStorage.removeItem(ADMIN_SESSION_KEY); location.reload(); });
}

function render() {
  $$(".admin-tab").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === currentTab));
  $("#adminContent").innerHTML = renderAdmin(currentTab);
  bindContent();
}

function bindContent() {
  $("#adminContent").onclick = async event => {
    const add = event.target.closest("[data-add]");
    const edit = event.target.closest("[data-edit]");
    const del = event.target.closest("[data-delete]");
    const saveJson = event.target.closest("[data-save-json]");
    const saveInfo = event.target.closest("[data-save-info]");
    const saveCv = event.target.closest("[data-save-cv]");
    const saveItem = event.target.closest("[data-save-item]");
    const close = event.target.closest("[data-modal-close]");
    const ghConfig = event.target.closest("[data-gh-config]");
    const ghSave = event.target.closest("[data-gh-save]");
    if (add) return openItem(add.dataset.add);
    if (edit) return openItem(currentTab, D[currentTab].find(x => x.id === edit.dataset.edit));
    if (del) return deleteItem(del.dataset.delete);
    if (saveInfo) return saveInfoBlock();
    if (saveCv) return saveCvBlock();
    if (saveJson) return saveJsonBlock(saveJson.dataset.saveJson);
    if (saveItem) return saveItemBlock(saveItem.dataset.saveItem, saveItem.dataset.itemId);
    if (close) $("#modalRoot").innerHTML = "";
    if (ghConfig) return saveGithubConfig();
    if (ghSave) return saveGithub();
  };
  $("#adminContent").onchange = handleFileInput;
}

function openItem(collection, item = {}) {
  $("#modalRoot").innerHTML = renderEditModal(collection, item.id ? item : { id: uid(collection) });
  $("#modalRoot").onclick = event => {
    const close = event.target.closest("[data-modal-close]");
    const save = event.target.closest("[data-save-item]");
    if (close) $("#modalRoot").innerHTML = "";
    if (save) saveItemBlock(save.dataset.saveItem, save.dataset.itemId);
  };
  $("#modalRoot").onchange = handleFileInput;
}

async function handleFileInput(event) {
  const input = event.target.closest("[data-file-target]");
  if (!input || !input.files?.length) return;
  const target = document.getElementById(input.dataset.fileTarget);
  if (!target) return;
  const file = input.files[0];
  try {
    if (isImageInput(input)) {
      if (!isAllowedImageFile(file)) throw new Error("unsupported-image");
      target.value = await readImageAsOptimizedDataUrl(file);
      toast(tr("imageEmbedded"));
      return;
    }
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) throw new Error("file-too-large");
    target.value = await readFileAsDataUrl(file);
    toast(tr("fileEmbedded"));
  } catch (error) {
    input.value = "";
    target.value = "";
    toast(uploadErrorMessage(error));
  }
}

function isImageInput(input) {
  return String(input.getAttribute("accept") || "").includes("image");
}

function uploadErrorMessage(error) {
  if (error.message === "unsupported-image") return tr("unsupportedImage");
  if (error.message === "original-image-too-large") return `${tr("imageOriginalTooLarge")} ${formatBytes(IMAGE_UPLOAD.maxOriginalBytes)}.`;
  if (error.message === "embedded-image-too-large") return `${tr("imageStillTooLarge")} ${formatBytes(IMAGE_UPLOAD.maxEmbeddedBytes)}.`;
  if (error.message === "file-too-large") return tr("fileTooLarge");
  return tr("uploadFailed");
}

function deleteItem(id) {
  D[currentTab] = D[currentTab].filter(item => item.id !== id);
  addActivity(`Delete ${currentTab}: ${id}`, "delete");
  setData(D);
  syncIfConfigured(tr("deleteSaved"));
  render();
}

function saveJsonBlock(key) {
  D[key] = JSON.parse($("#jsonEditor").value);
  addActivity(`Update ${key}`, "edit");
  setData(D);
  syncIfConfigured(tr("changeSaved"));
  render();
}

function saveInfoBlock() {
  const form = $("#infoForm");
  const next = { ...D.infos };
  getFormSchema("infos").forEach(([name]) => {
    const field = form.elements[name];
    if (field) next[name] = field.value.trim();
  });
  ensureEnglishFallbacks("infos", next);
  D.infos = next;
  addActivity("Update main information", "edit");
  setData(D);
  toast(tr("infoSaved"));
  syncIfConfigured(tr("infoOnlineSaved"));
  render();
}

function saveCvBlock() {
  const field = $("#field-cv");
  if (!field || !field.value.trim()) {
    toast(tr("chooseCv"));
    return;
  }
  D.infos.cv = field.value.trim();
  addActivity("Update resume", "edit");
  setData(D);
  toast(tr("cvSaved"));
  syncIfConfigured(tr("cvOnlineSaved"));
  render();
}

async function saveItemBlock(collection, id) {
  const value = readItemValue(collection);
  value.id = value.id || id || uid(collection);
  applyDefaults(collection, value);
  ensureEnglishFallbacks(collection, value);
  const index = D[collection].findIndex(item => item.id === (id || value.id));
  if (index >= 0) D[collection][index] = value; else D[collection].push(value);
  addActivity(`Save ${collection}: ${value.id}`, "edit");
  setData(D);
  $("#modalRoot").innerHTML = "";
  syncIfConfigured(tr("contentOnlineSaved"));
  render();
}

function readItemValue(collection) {
  const schema = getFormSchema(collection);
  if (!schema) return JSON.parse($("#itemEditor").value);
  const form = $("#itemForm");
  const value = { id: form.elements.id.value || "" };
  schema.forEach(([name, label, type]) => {
    const field = form.elements[name];
    if (!field) return;
    if (type === "number") value[name] = Number(field.value || 0);
    else if (type === "tags") value[name] = field.value.split(",").map(x => x.trim()).filter(Boolean);
    else if (type === "lines") value[name] = field.value.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
    else if (type === "checkbox") value[name] = field.value === "true";
    else value[name] = field.value.trim();
  });
  return value;
}

function applyDefaults(collection, value) {
  if (collection === "knowledge") {
    value.auteur = value.auteur || D.infos.name;
    value.date = value.date || new Date().toISOString().slice(0, 10);
    value.slug = value.slug || slugify(value.titre || value.id);
  }
  if (collection === "gallery") value.date = value.date || new Date().toISOString().slice(0, 10);
  if (collection === "articles") value.date = value.date || new Date().toISOString().slice(0, 10);
  if (collection === "projects") {
    value.link = value.link || "#";
    value.repo = value.repo || "#";
  }
}

function ensureEnglishFallbacks(collection, value) {
  const fieldsByCollection = {
    infos: ["role", "tagline", "location", "availability", "speciality", "languages", "about"],
    services: ["title", "description"],
    projects: ["title", "organization", "date", "badge", "category", "description", "bullets"],
    skills: ["name", "category"],
    experience: ["role", "company", "period", "description"],
    edu: ["degree", "school", "period", "description"],
    certs: ["title", "issuer", "date", "description"],
    knowledge: ["titre", "resume", "categorie", "contenu"],
    gallery: ["titre", "categorie"],
    articles: ["title", "summary", "category"],
    contacts: ["label"]
  };
  (fieldsByCollection[collection] || []).forEach(key => {
    const enKey = `${key}En`;
    if ((value[enKey] === undefined || value[enKey] === "" || (Array.isArray(value[enKey]) && !value[enKey].length)) && value[key] !== undefined) {
      value[enKey] = Array.isArray(value[key]) ? [...value[key]] : value[key];
    }
  });
}

function saveGithubConfig() {
  setGitHubConfig({ owner: $("#ghOwner").value, repo: $("#ghRepo").value, branch: $("#ghBranch").value, token: $("#ghToken").value });
  toast(tr("githubConfigSaved"));
}

async function saveGithub(showSuccess = true) {
  try {
    await saveDataToGitHub(cleanData(D));
    addActivity("GitHub data.json save", "github");
    if (showSuccess) toast(tr("githubDone"));
  } catch (error) {
    toast(error.message);
  }
}

async function syncIfConfigured(message) {
  const cfg = getGitHubConfig();
  if (!cfg.token) {
    toast(tr("localOnly"));
    return;
  }
  try {
    await saveDataToGitHub(cleanData(D));
    addActivity("Automatic GitHub sync", "github");
    toast(message);
  } catch (error) {
    toast(`${tr("githubFailed")} : ${error.message}`);
  }
}

function cleanData(data) {
  const copy = JSON.parse(JSON.stringify(data));
  delete copy._localDraft;
  return copy;
}

function translateShell() {
  const set = (selector, text) => {
    const el = $(selector);
    if (el) el.textContent = text;
  };
  set("#loginForm h1", tr("loginTitle"));
  set("#loginForm label span", tr("password"));
  set("#loginForm button[type='submit']", tr("login"));
  set("#loginError", tr("wrongPassword"));
  set("#toggleSetupPass", tr("setupPassword"));
  set("#passwordSetup label:nth-of-type(1) span", tr("newPassword"));
  set("#passwordSetup label:nth-of-type(2) span", tr("confirmPassword"));
  set("#saveLocalPass", tr("savePassword"));
  set("#passwordSetup .muted", tr("passwordHelp"));
  const loginMuted = $("#loginForm > p.muted:last-child");
  if (loginMuted) loginMuted.textContent = tr("privateAccess");
  $$(".admin-tab").forEach(btn => {
    btn.textContent = ({
      dashboard: tr("dashboard"),
      infos: tr("infos"),
      cv: tr("cvTab"),
      services: tr("services"),
      projects: tr("projects"),
      skills: tr("skills"),
      experience: tr("experienceTitle"),
      edu: tr("educationTitle"),
      certs: tr("certificationsTitle"),
      knowledge: tr("knowledge"),
      gallery: tr("gallery"),
      articles: tr("watch"),
      contacts: tr("contact"),
      github: tr("github")
    })[btn.dataset.tab] || btn.textContent;
  });
  set("#exportBtn", tr("exportJson"));
  const importLabel = $("#importInput")?.closest("label.btn");
  if (importLabel) importLabel.childNodes[0].textContent = tr("importJson");
  set("#logoutBtn", tr("logout"));
  set(".admin-main .eyebrow", tr("localManagement"));
  set(".admin-main h1", tr("dashboard"));
  const siteLink = document.querySelector(".admin-main .admin-top a.btn");
  if (siteLink) siteLink.textContent = tr("viewSite");
}

async function sha256(text) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
