import { D } from "./data.js";
import { lang, pick, t } from "./i18n.js";
import { $, escapeHtml, formatDate, icon, toArray } from "./utils.js";

function chips(tags = []) {
  return tags.map(tag => {
    const danger = /owasp|rgpd|gdpr|debug|sqlmap|nikto|whatweb|critique|api security/i.test(tag);
    return `<span class="chip ${danger ? "danger" : ""}">${escapeHtml(tag)}</span>`;
  }).join("");
}
function sectionHead(kicker, title, text = "") {
  return `<div class="section-head"><div><span class="eyebrow">${kicker}</span><h2>${title}</h2></div>${text ? `<p class="muted">${text}</p>` : ""}</div>`;
}

export function renderPublic() {
  document.title = `${D.infos.name} | Portfolio`;
  renderNav();
  renderHero();
  renderAbout();
  renderServices();
  renderProjects();
  renderSkills();
  renderTimeline("experience", "Experience", D.experience, "role", "company");
  renderTimeline("education", "Formations", D.edu, "degree", "school");
  renderCerts();
  renderKnowledge();
  renderGalleryPreview();
  renderWatch();
  renderContact();
  $("#year").textContent = new Date().getFullYear();
}

function renderNav() {
  const links = [
    ["about", "À propos"],
    ["services", "Services"],
    ["projects", "Projets"],
    ["skills", "Compétences"],
    ["experience", "Parcours"],
    ["contact", "Contact"]
  ];
  if (D.knowledge.length) links.splice(4, 0, ["knowledge", "Connaissances"]);
  if (D.gallery.length) links.splice(5, 0, ["gallery", "Affiches"]);
  if (D.articles.length) links.splice(6, 0, ["watch", "Veille"]);
  $("#navLinks").innerHTML = links.map(([id, label]) => `<a href="#${id}">${label}</a>`).join("");
}

function renderHero() {
  const name = escapeHtml(D.infos.shortName || D.infos.name);
  const parts = name.split(" ");
  const heroName = parts.length > 1 ? `${parts[0]}<br><span class="gold">${parts.slice(1).join(" ")}</span>` : name;
  $("#hero").innerHTML = `<div class="container hero-grid">
    <div class="hero-copy">
      <span class="eyebrow">${escapeHtml(D.infos.availability || "Disponible pour des missions")}</span>
      <h1>${heroName}</h1>
      <p class="hero-title-line">${escapeHtml(pick(D.infos, "role"))}</p>
      <p>${escapeHtml(pick(D.infos, "tagline"))}</p>
      <div class="toolbar"><a class="btn primary" href="#projects">${icon("arrow")} ${t[lang].projects}</a><a class="btn" href="${D.infos.cv}">${icon("download")} CV</a></div>
    </div>
    <div class="hero-visual stat-row">${D.infos.stats.map(s => `<div class="stat card"><strong>${escapeHtml(s.value)}</strong><span>${escapeHtml(lang === "en" ? s.labelEn : s.label)}</span></div>`).join("")}</div>
  </div>`;
}

function renderAbout() {
  $("#about").innerHTML = `<div class="container about-grid">
    <div class="about-photo">
      ${[
        ["Localisation", D.infos.location],
        ["Disponibilité", D.infos.availability],
        ["Spécialité", D.infos.speciality],
        ["Langues", D.infos.languages]
      ].map(([label, value]) => `<div class="card info-item"><span>${escapeHtml(label)}</span>${escapeHtml(value || "")}</div>`).join("")}
    </div>
    <div>${sectionHead("Profil", "Qui suis-je ?")}<div class="about-body">${escapeHtml(pick(D.infos, "about")).split("\n\n").map(p => `<p>${p}</p>`).join("")}</div></div>
  </div>`;
}

function renderServices() {
  $("#services").innerHTML = `<div class="container">${sectionHead("Offre", "Services")}<div class="grid service-grid">${D.services.map(s => `<article class="card service-card">${icon(s.icon)}<h3>${escapeHtml(pick(s, "title"))}</h3><p class="muted">${escapeHtml(s.description)}</p></article>`).join("")}</div></div>`;
}

function renderProjects() {
  const categories = [t[lang].all, ...new Set(D.projects.map(p => p.category))];
  $("#projects").innerHTML = `<div class="container">${sectionHead("Selection", "Projets", "Filtrez par domaine et ouvrez les liens utiles.")}
    <div class="filters" data-filter-target="projects">${categories.map((c, i) => `<button class="btn filter ${i ? "" : "active"}" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}</div>
    <div class="grid project-grid" id="projectGrid">${projectCards(D.projects)}</div></div>`;
}
export function projectCards(items) {
  return items.map(p => {
    const badgeClass = p.badgeStyle === "pentest" ? "pentest" : p.badgeStyle === "hack" ? "hack" : "";
    const bullets = (p.bullets || []).map(b => `<li class="${/critique|critical/i.test(b) ? "critical" : ""}">${escapeHtml(b)}</li>`).join("");
    return `<article class="card project-card" data-category="${escapeHtml(p.category)}">
      <div class="project-meta"><span class="badge ${badgeClass}">${escapeHtml(p.badge || p.category)}</span><span class="badge">${escapeHtml(p.date || "")}</span></div>
      <h3>${escapeHtml(p.title)}</h3>
      <p class="project-org">${escapeHtml(p.organization || "")}</p>
      <p class="muted">${escapeHtml(p.description)}</p>
      ${bullets ? `<ul class="project-list">${bullets}</ul>` : ""}
      <div class="article-meta">${chips(p.tags)}</div>
    </article>`;
  }).join("");
}

function renderSkills() {
  const groups = [...new Set(D.skills.map(skill => skill.category))];
  $("#skills").innerHTML = `<div class="container">${sectionHead("Compétences", "Ce que je maîtrise")}
    <div class="skill-groups">${groups.map(group => `<div class="card skill-group ${group.includes("Offensive") ? "offensive" : ""}">
      <div class="skill-group-title">${escapeHtml(group)}</div>
      <div class="skill-list">${D.skills.filter(s => s.category === group).map(s => `<div class="skill-row"><div class="skill-meta"><span>${escapeHtml(s.name)}</span><span>${s.level}%</span></div><div class="bar"><span style="width:${s.level}%"></span></div></div>`).join("")}</div>
    </div>`).join("")}</div>
    <div class="toolbar" style="margin-top:28px">${chips(D.tools)}</div>
  </div>`;
}

function renderTimeline(id, title, items, main, sub) {
  $(`#${id}`).innerHTML = `<div class="container">${sectionHead("Parcours", title)}<div class="timeline">${items.map(item => `<article class="card timeline-item"><span class="badge">${escapeHtml(item.period)}</span><h3>${escapeHtml(item[main])}</h3><p class="muted">${escapeHtml(item[sub])}</p><p>${escapeHtml(item.description)}</p></article>`).join("")}</div></div>`;
}

function renderCerts() {
  $("#certifications").innerHTML = `<div class="container">${sectionHead("Preuves", "Certifications")}<div class="grid cert-grid">${D.certs.map(c => `<article class="card cert-card"><span class="badge">${escapeHtml(c.date)}</span><h3>${escapeHtml(c.title)}</h3><p class="muted">${escapeHtml(c.issuer)}</p><p>${escapeHtml(c.description)}</p><a class="btn" href="${c.link}">${icon("arrow")} Ouvrir</a></article>`).join("")}</div></div>`;
}

function renderKnowledge() {
  if (!D.knowledge.length) { $("#knowledge").hidden = true; return; }
  $("#knowledge").hidden = false;
  const articles = D.knowledge.filter(a => a.statut === "publie");
  $("#knowledge").innerHTML = `<div class="container">${sectionHead("CMS", "Connaissances")}<div class="grid knowledge-grid">${articles.map(a => `<article class="card article-card"><img src="${a.image}" alt=""><div class="article-meta"><span class="badge">${escapeHtml(a.categorie)}</span>${chips(a.tags)}</div><h3>${escapeHtml(pick(a, "titre"))}</h3><p class="muted">${escapeHtml(pick(a, "resume"))}</p><button class="btn" data-article="${a.id}">${icon("arrow")} ${t[lang].read}</button></article>`).join("")}</div></div>`;
}

function renderGalleryPreview() {
  if (!D.gallery.length) { $("#gallery").hidden = true; return; }
  $("#gallery").hidden = false;
  $("#gallery").innerHTML = `<div class="container">${sectionHead("Creation", "Galerie d'affiches")}<div class="gallery-grid">${D.gallery.map(g => `<button class="poster" data-lightbox="${g.id}"><img src="${g.image}" alt=""><span class="poster-body"><strong>${escapeHtml(g.titre)}</strong><span class="muted">${escapeHtml(g.categorie)}</span></span></button>`).join("")}</div></div>`;
}

function renderWatch() {
  if (!D.articles.length) { $("#watch").hidden = true; return; }
  $("#watch").hidden = false;
  $("#watch").innerHTML = `<div class="container">${sectionHead("Veille", "Veille technologique")}<div class="grid watch-grid">${D.articles.map(a => `<article class="card article-card"><span class="badge">${escapeHtml(a.category)}</span><h3>${escapeHtml(a.title)}</h3><p class="muted">${escapeHtml(a.summary)}</p><div class="article-meta">${chips(a.tags)}</div><a class="btn" href="${a.url}">${escapeHtml(a.source)}</a></article>`).join("")}</div></div>`;
}

function renderContact() {
  $("#contact").innerHTML = `<div class="container">${sectionHead("Conversation", "Contact")}<div class="grid contact-grid">${D.contacts.map(c => `<a class="card contact-card" href="${c.url}">${icon(c.icon)}<strong>${escapeHtml(c.label)}</strong><span class="muted">${escapeHtml(c.value)}</span></a>`).join("")}</div><form class="card contact-form" action="mailto:${D.infos.email}" method="post" enctype="text/plain"><div class="form-grid"><label class="field"><span>Nom</span><input name="name" required></label><label class="field"><span>Email</span><input type="email" name="email" required></label><label class="field full"><span>Message</span><textarea name="message" required></textarea></label></div><button class="btn primary" style="margin-top:14px" type="submit">${icon("mail")} Envoyer</button></form></div>`;
}

export function openArticle(id) {
  const article = D.knowledge.find(item => item.id === id);
  if (!article) return;
  $("#modalRoot").innerHTML = `<div class="modal-backdrop open"><article class="modal article-content"><button class="icon-btn" data-close aria-label="Fermer">x</button><span class="badge">${escapeHtml(article.categorie)}</span><h2>${escapeHtml(pick(article, "titre"))}</h2><p class="muted">${escapeHtml(formatDate(article.date))} - ${escapeHtml(article.auteur)}</p><div>${lang === "en" ? article.contenuEn : article.contenu}</div></article></div>`;
}
