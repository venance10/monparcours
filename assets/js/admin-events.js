import { ADMIN_LOCAL_HASH_KEY, ADMIN_PASS_HASH, ADMIN_SESSION_KEY } from "./config.js";
import { D, addActivity, loadData, setData } from "./data.js";
import { saveDataToGitHub, setGitHubConfig } from "./github.js";
import { getFormSchema, renderAdmin, renderEditModal } from "./admin-render.js";
import { $, $$, downloadJson, slugify, toast, uid } from "./utils.js";

let currentTab = "dashboard";

export async function initAdmin() {
  await loadData({ preferLocal: true });
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
      toast("Mot de passe incorrect.");
    }
  });
}

async function saveLocalPassword() {
  const pass = $("#newAdminPass").value;
  const confirm = $("#confirmAdminPass").value;
  if (pass.length < 8) {
    toast("Choisissez au moins 8 caractères.");
    return;
  }
  if (pass !== confirm) {
    toast("Les deux mots de passe ne correspondent pas.");
    return;
  }
  localStorage.setItem(ADMIN_LOCAL_HASH_KEY, await sha256(pass));
  $("#newAdminPass").value = "";
  $("#confirmAdminPass").value = "";
  $("#passwordSetup").hidden = true;
  toast("Mot de passe local enregistré. Vous pouvez vous connecter.");
}

function showShell() {
  $("#loginScreen").hidden = true;
  $("#adminShell").hidden = false;
  render();
  bindShell();
}

function bindShell() {
  $$(".admin-tab").forEach(btn => btn.addEventListener("click", () => { currentTab = btn.dataset.tab; render(); }));
  $("#exportBtn").addEventListener("click", () => downloadJson("data.json", D));
  $("#importInput").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    setData(JSON.parse(text));
    addActivity("Import data.json", "import");
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
    const saveItem = event.target.closest("[data-save-item]");
    const close = event.target.closest("[data-modal-close]");
    const ghConfig = event.target.closest("[data-gh-config]");
    const ghSave = event.target.closest("[data-gh-save]");
    if (add) return openItem(add.dataset.add);
    if (edit) return openItem(currentTab, D[currentTab].find(x => x.id === edit.dataset.edit));
    if (del) return deleteItem(del.dataset.delete);
    if (saveInfo) return saveInfoBlock();
    if (saveJson) return saveJsonBlock(saveJson.dataset.saveJson);
    if (saveItem) return saveItemBlock(saveItem.dataset.saveItem, saveItem.dataset.itemId);
    if (close) $("#modalRoot").innerHTML = "";
    if (ghConfig) return saveGithubConfig();
    if (ghSave) return saveGithub();
  };
}

function openItem(collection, item = {}) {
  $("#modalRoot").innerHTML = renderEditModal(collection, item.id ? item : { id: uid(collection) });
  $("#modalRoot").onclick = event => {
    const close = event.target.closest("[data-modal-close]");
    const save = event.target.closest("[data-save-item]");
    if (close) $("#modalRoot").innerHTML = "";
    if (save) saveItemBlock(save.dataset.saveItem, save.dataset.itemId);
  };
}

function deleteItem(id) {
  D[currentTab] = D[currentTab].filter(item => item.id !== id);
  addActivity(`Suppression ${currentTab}: ${id}`, "delete");
  setData(D);
  render();
}

function saveJsonBlock(key) {
  D[key] = JSON.parse($("#jsonEditor").value);
  addActivity(`Mise a jour ${key}`, "edit");
  setData(D);
  render();
}

function saveInfoBlock() {
  const form = $("#infoForm");
  const next = { ...D.infos };
  getFormSchema("infos").forEach(([name]) => {
    const field = form.elements[name];
    if (field) next[name] = field.value.trim();
  });
  D.infos = next;
  addActivity("Mise a jour des infos principales", "edit");
  setData(D);
  toast("Infos principales enregistrées.");
  render();
}

async function saveItemBlock(collection, id) {
  const value = readItemValue(collection);
  if (value.image && value.image.startsWith("file:")) toast("Utilisez le champ upload dans une prochaine version pour embarquer l'image.");
  value.id = value.id || id || uid(collection);
  applyDefaults(collection, value);
  const index = D[collection].findIndex(item => item.id === (id || value.id));
  if (index >= 0) D[collection][index] = value; else D[collection].push(value);
  addActivity(`Enregistrement ${collection}: ${value.id}`, "edit");
  setData(D);
  $("#modalRoot").innerHTML = "";
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
    value.titreEn = value.titreEn || value.titre;
    value.resumeEn = value.resumeEn || value.resume;
    value.contenuEn = value.contenuEn || value.contenu;
    value.auteur = value.auteur || D.infos.name;
    value.date = value.date || new Date().toISOString().slice(0, 10);
    value.slug = value.slug || slugify(value.titre || value.id);
  }
  if (collection === "gallery") value.date = value.date || new Date().toISOString().slice(0, 10);
  if (collection === "articles") value.date = value.date || new Date().toISOString().slice(0, 10);
  if (collection === "projects") {
    value.titleEn = value.titleEn || value.title;
    value.bulletsEn = value.bulletsEn || value.bullets || [];
    value.link = value.link || "#";
    value.repo = value.repo || "#";
  }
}

function saveGithubConfig() {
  setGitHubConfig({ owner: $("#ghOwner").value, repo: $("#ghRepo").value, branch: $("#ghBranch").value, token: $("#ghToken").value });
  toast("Configuration GitHub enregistree.");
}

async function saveGithub() {
  try {
    await saveDataToGitHub(D);
    addActivity("Sauvegarde GitHub data.json", "github");
    toast("Sauvegarde GitHub terminee.");
  } catch (error) {
    toast(error.message);
  }
}

async function sha256(text) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
