export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const uid = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
export const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
export const slugify = (value = "") => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export const formatDate = value => new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(value));
export const toArray = value => Array.isArray(value) ? value : [];

export function icon(name) {
  const icons = {
    menu: "M4 7h16M4 12h16M4 17h16",
    sun: "M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-5.7 1.4-1.4M4.9 19.1l1.4-1.4m0-11.4L4.9 4.9m14.2 14.2-1.4-1.4M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z",
    globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 0c3 3 3 17 0 20m0-20c-3 3-3 17 0 20M2 12h20",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    layout: "M4 5h16v14H4zM4 10h16M10 10v9",
    shield: "M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z",
    search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4",
    file: "M6 3h9l3 3v15H6zM14 3v4h4M9 13h6M9 17h6M9 9h2",
    check: "M20 6 9 17l-5-5",
    map: "M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3ZM9 3v15M15 6v15",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V5H6.5A2.5 2.5 0 0 0 4 7.5z",
    bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
    mail: "M4 6h16v12H4zM4 7l8 6 8-6",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.6 1.9Z",
    github: "M12 2a10 10 0 0 0-3 19c.5.1.7-.2.7-.5v-2c-3 .7-3.7-1.3-3.7-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.5 1.1 3 .9.1-.7.4-1.1.7-1.4-2.4-.3-5-1.2-5-5.3 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10 10 0 0 1 5.4 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.1-2.6 5-5 5.3.4.4.8 1 .8 2v2.8c0 .3.2.6.8.5A10 10 0 0 0 12 2Z",
    linkedin: "M6 9h3v10H6zM7.5 5.5A1.7 1.7 0 1 1 7.5 9a1.7 1.7 0 0 1 0-3.5ZM11 9h3v1.4c.4-.8 1.3-1.6 2.8-1.6 3 0 3.6 2 3.6 4.6V19h-3v-5c0-1.2 0-2.7-1.7-2.7S14 12.6 14 14v5h-3z",
    trash: "M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13",
    edit: "M4 20h4L19 9l-4-4L4 16v4Z",
    plus: "M12 5v14M5 12h14",
    download: "M12 3v12m-5-5 5 5 5-5M5 21h14",
    save: "M5 4h12l2 2v14H5zM8 4v6h8M8 20v-6h8"
  };
  return `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[name] || icons.arrow}"/></svg>`;
}

export function toast(message) {
  let wrap = $(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.append(wrap);
  }
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  wrap.append(item);
  setTimeout(() => item.remove(), 3200);
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
