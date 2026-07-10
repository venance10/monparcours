import { D } from "./data.js";
import { lang, pick, tr } from "./i18n.js";
import { $, escapeHtml, formatDate, icon } from "./utils.js";

function chips(tags = []) {
  return tags.map(tag => {
    const danger = /owasp|rgpd|gdpr|debug|sqlmap|nikto|whatweb|critique|api security/i.test(tag);
    return `<span class="chip ${danger ? "danger" : ""}">${escapeHtml(tag)}</span>`;
  }).join("");
}

function sectionHead(kicker, title, text = "") {
  return `<div class="section-head"><div><span class="eyebrow">${escapeHtml(kicker)}</span><h2>${escapeHtml(title)}</h2></div>${text ? `<p class="muted">${escapeHtml(text)}</p>` : ""}</div>`;
}

function local(obj, key) {
  return escapeHtml(pick(obj, key));
}

function listValue(obj, key) {
  if (!obj) return [];
  if (lang === "en") return obj[`${key}En`] || obj[`${key}EN`] || obj[key] || [];
  return obj[key] || [];
}

export function renderPublic() {
  document.documentElement.lang = lang;
  document.title = `${pick(D.infos, "shortName") || D.infos.name} | ${tr("projects")}`;
  renderNav();
  renderHero();
  renderAbout();
  renderServices();
  renderProjects();
  renderSkills();
  renderTimeline("experience", tr("experienceTitle"), D.experience, "role", "company");
  renderTimeline("education", tr("educationTitle"), D.edu, "degree", "school");
  renderCerts();
  renderKnowledge();
  renderGalleryPreview();
  renderWatch();
  renderContact();
  $("#year").textContent = new Date().getFullYear();
  const footerLine = document.querySelector(".footer-inner span:last-child");
  if (footerLine) footerLine.innerHTML = `<em class="gold">${escapeHtml(tr("footerLine"))}</em>`;
}

function renderNav() {
  const links = [
    ["about", tr("about")],
    ["services", tr("services")],
    ["projects", tr("projects")],
    ["skills", tr("skills")],
    ["experience", tr("experience")],
    ["contact", tr("contact")]
  ];
  if (D.knowledge.length) links.splice(4, 0, ["knowledge", tr("knowledge")]);
  if (D.gallery.length) links.splice(5, 0, ["gallery", tr("gallery")]);
  if (D.articles.length) links.splice(6, 0, ["watch", tr("watch")]);
  $("#navLinks").innerHTML = links.map(([id, label]) => `<a href="#${id}">${escapeHtml(label)}</a>`).join("");
}

function renderHero() {
  const name = escapeHtml(D.infos.shortName || D.infos.name);
  const parts = name.split(" ");
  const heroName = parts.length > 1 ? `${parts[0]}<br><span class="gold">${parts.slice(1).join(" ")}</span>` : name;
  $("#hero").innerHTML = `<div class="container hero-grid">
    <div class="hero-copy">
      <span class="eyebrow">${escapeHtml(pick(D.infos, "availability") || tr("available"))}</span>
      <h1>${heroName}</h1>
      <p class="hero-title-line">${local(D.infos, "role")}</p>
      <p>${local(D.infos, "tagline")}</p>
      <div class="toolbar"><a class="btn primary" href="#projects">${icon("arrow")} ${escapeHtml(tr("heroWork"))}</a><a class="btn" href="${D.infos.cv}">${icon("download")} ${escapeHtml(tr("cv"))}</a></div>
    </div>
    <div class="hero-visual stat-row">${D.infos.stats.map(s => `<div class="stat card"><strong>${escapeHtml(s.value)}</strong><span>${escapeHtml(pick(s, "label"))}</span></div>`).join("")}</div>
  </div>`;
}

function renderAbout() {
  const infos = [
    [tr("location"), pick(D.infos, "location")],
    [tr("availability"), pick(D.infos, "availability")],
    [tr("speciality"), pick(D.infos, "speciality")],
    [tr("languages"), pick(D.infos, "languages")]
  ];
  $("#about").innerHTML = `<div class="container about-grid">
    <div class="about-photo">
      ${infos.map(([label, value]) => `<div class="card info-item"><span>${escapeHtml(label)}</span>${escapeHtml(value || "")}</div>`).join("")}
    </div>
    <div>${sectionHead(tr("profile"), tr("whoAmI"))}<div class="about-body">${escapeHtml(pick(D.infos, "about")).split("\n\n").map(p => `<p>${p}</p>`).join("")}</div></div>
  </div>`;
}

function renderServices() {
  $("#services").innerHTML = `<div class="container">${sectionHead(tr("offer"), tr("servicesTitle"))}<div class="grid service-grid">${D.services.map(s => `<article class="card service-card">${icon(s.icon)}<h3>${local(s, "title")}</h3><p class="muted">${local(s, "description")}</p></article>`).join("")}</div></div>`;
}

function renderProjects() {
  const categories = [tr("all"), ...new Set(D.projects.map(p => pick(p, "category")))];
  $("#projects").innerHTML = `<div class="container">${sectionHead(tr("selection"), tr("projectsTitle"), tr("projectsSub"))}
    <div class="filters" data-filter-target="projects">${categories.map((c, i) => `<button class="btn filter ${i ? "" : "active"}" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}</div>
    <div class="grid project-grid" id="projectGrid">${projectCards(D.projects)}</div></div>`;
}

export function projectCards(items) {
  return items.map(p => {
    const badgeClass = p.badgeStyle === "pentest" ? "pentest" : p.badgeStyle === "hack" ? "hack" : "";
    const category = pick(p, "category");
    const bullets = listValue(p, "bullets").map(b => `<li class="${/critique|critical/i.test(b) ? "critical" : ""}">${escapeHtml(b)}</li>`).join("");
    return `<article class="card project-card" data-category="${escapeHtml(category)}">
      <div class="project-meta"><span class="badge ${badgeClass}">${local(p, "badge") || escapeHtml(category)}</span><span class="badge">${local(p, "date")}</span></div>
      <h3>${local(p, "title")}</h3>
      <p class="project-org">${local(p, "organization")}</p>
      <p class="muted">${local(p, "description")}</p>
      ${bullets ? `<ul class="project-list">${bullets}</ul>` : ""}
      <div class="article-meta">${chips(p.tags)}</div>
    </article>`;
  }).join("");
}

function renderSkills() {
  const groups = [...new Set(D.skills.map(skill => pick(skill, "category")))];
  $("#skills").innerHTML = `<div class="container">${sectionHead(tr("stack"), tr("skillsTitle"))}
    <div class="skill-groups">${groups.map(group => `<div class="card skill-group ${group.includes("Offensive") ? "offensive" : ""}">
      <div class="skill-group-title">${escapeHtml(group)}</div>
      <div class="skill-list">${D.skills.filter(s => pick(s, "category") === group).map(s => `<div class="skill-row"><div class="skill-meta"><span>${local(s, "name")}</span><span>${s.level}%</span></div><div class="bar"><span style="width:${s.level}%"></span></div></div>`).join("")}</div>
    </div>`).join("")}</div>
    <div class="toolbar" style="margin-top:28px">${chips(D.tools)}</div>
  </div>`;
}

function renderTimeline(id, title, items, main, sub) {
  $(`#${id}`).innerHTML = `<div class="container">${sectionHead(tr("path"), title)}<div class="timeline">${items.map(item => `<article class="card timeline-item"><span class="badge">${local(item, "period")}</span><h3>${local(item, main)}</h3><p class="muted">${local(item, sub)}</p><p>${local(item, "description")}</p></article>`).join("")}</div></div>`;
}

function renderCerts() {
  $("#certifications").innerHTML = `<div class="container">${sectionHead(tr("proof"), tr("certificationsTitle"))}<div class="grid cert-grid">${D.certs.map(c => `<article class="card cert-card"><span class="badge">${local(c, "date")}</span><h3>${local(c, "title")}</h3><p class="muted">${local(c, "issuer")}</p><p>${local(c, "description")}</p><a class="btn" href="${c.link}">${icon("arrow")} ${escapeHtml(tr("view"))}</a></article>`).join("")}</div></div>`;
}

function renderKnowledge() {
  if (!D.knowledge.length) { $("#knowledge").hidden = true; return; }
  $("#knowledge").hidden = false;
  const articles = D.knowledge.filter(a => a.statut === "publie" || a.status === "publie");
  $("#knowledge").innerHTML = `<div class="container">${sectionHead(tr("cms"), tr("knowledgeTitle"))}<div class="grid knowledge-grid">${articles.map(a => `<article class="card article-card"><img src="${a.image}" alt=""><div class="article-meta"><span class="badge">${local(a, "categorie") || local(a, "category")}</span>${chips(a.tags)}</div><h3>${local(a, "titre") || local(a, "title")}</h3><p class="muted">${local(a, "resume") || local(a, "summary")}</p><button class="btn" data-article="${a.id}">${icon("arrow")} ${escapeHtml(tr("read"))}</button></article>`).join("")}</div></div>`;
}

function renderGalleryPreview() {
  if (!D.gallery.length) { $("#gallery").hidden = true; return; }
  $("#gallery").hidden = false;
  $("#gallery").innerHTML = `<div class="container">${sectionHead(tr("creation"), tr("galleryTitle"))}<div class="gallery-grid">${D.gallery.map(g => `<button class="poster" data-lightbox="${g.id}"><img src="${g.image}" alt=""><span class="poster-body"><strong>${local(g, "titre") || local(g, "title")}</strong><span class="muted">${local(g, "categorie") || local(g, "category")}</span></span></button>`).join("")}</div></div>`;
}

function renderWatch() {
  if (!D.articles.length) { $("#watch").hidden = true; return; }
  $("#watch").hidden = false;
  $("#watch").innerHTML = `<div class="container">${sectionHead(tr("watch"), tr("watchTitle"))}<div class="grid watch-grid">${D.articles.map(a => `<article class="card article-card"><span class="badge">${local(a, "category")}</span><h3>${local(a, "title")}</h3><p class="muted">${local(a, "summary")}</p><div class="article-meta">${chips(a.tags)}</div><a class="btn" href="${a.url}">${escapeHtml(a.source)}</a></article>`).join("")}</div></div>`;
}

function renderContact() {
  $("#contact").innerHTML = `<div class="container">${sectionHead(tr("conversation"), tr("contactTitle"))}<div class="grid contact-grid">${D.contacts.map(c => `<a class="card contact-card" href="${c.url}">${icon(c.icon)}<strong>${local(c, "label")}</strong><span class="muted">${escapeHtml(c.value)}</span></a>`).join("")}</div><form class="card contact-form" action="mailto:${D.infos.email}" method="post" enctype="text/plain"><div class="form-grid"><label class="field"><span>${escapeHtml(tr("name"))}</span><input name="name" required></label><label class="field"><span>${escapeHtml(tr("email"))}</span><input type="email" name="email" required></label><label class="field full"><span>${escapeHtml(tr("message"))}</span><textarea name="message" required></textarea></label></div><button class="btn primary" style="margin-top:14px" type="submit">${icon("mail")} ${escapeHtml(tr("send"))}</button></form></div>`;
}

export function openArticle(id) {
  const article = D.knowledge.find(item => item.id === id);
  if (!article) return;
  const content = pick(article, "contenu") || pick(article, "content");
  $("#modalRoot").innerHTML = `<div class="modal-backdrop open"><article class="modal article-content"><button class="icon-btn" data-close aria-label="${escapeHtml(tr("close"))}">x</button><span class="badge">${local(article, "categorie") || local(article, "category")}</span><h2>${local(article, "titre") || local(article, "title")}</h2><p class="muted">${escapeHtml(formatDate(article.date))} - ${escapeHtml(article.auteur || article.author || "")}</p><div>${content}</div></article></div>`;
}
