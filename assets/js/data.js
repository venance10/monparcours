import { DATA_URL, STORAGE_KEY } from "./config.js";

export let D = null;

export async function loadData(options = {}) {
  const preferLocal = Boolean(options.preferLocal);
  const local = localStorage.getItem(STORAGE_KEY);
  const res = await fetch(DATA_URL, { cache: "no-cache" });
  const remoteData = normalizeData(await res.json());
  if (preferLocal && local) {
    const localData = normalizeData(JSON.parse(local));
    D = isNewer(localData, remoteData) ? localData : remoteData;
  } else {
    D = remoteData;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(D));
  return D;
}

export function setData(next) {
  D = normalizeData({ ...next, _updated: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(D));
  return D;
}

export function resetLocalData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function addActivity(message, type = "edit") {
  D.activity = [{ date: new Date().toISOString(), type, message }, ...(D.activity || [])].slice(0, 30);
  setData(D);
}

export function normalizeData(raw = {}) {
  const infos = raw.infos || {};
  const legacySettings = raw.settings || {};
  const hero = raw.hero || {};
  const about = raw.about || {};
  const normalized = {
    _v: raw._v || 2,
    _updated: raw._updated || new Date().toISOString(),
    infos: {
      name: infos.name || infos.nom || legacySettings.site_name || "Venance Houndete",
      shortName: infos.shortName || infos.short_name || infos.name || infos.nom || "Venance Houndété",
      role: infos.role || hero.status || "Developpeur web et cybersécurité",
      roleEn: infos.roleEn || infos.role || hero.status || "Web developer and cybersecurity",
      tagline: infos.tagline || infos.hero || hero.desc || "Portfolio professionnel.",
      taglineEn: infos.taglineEn || infos.tagline || infos.hero || hero.desc || "Professional portfolio.",
      location: infos.location || infos.ville || "",
      email: infos.email || "",
      phone: infos.phone || infos.tel || "",
      avatar: infos.avatar || infos.photo || "./assets/images/profile.svg",
      cv: infos.cv || infos.cvUrl || legacySettings.cv_link || "./cv.pdf",
      github: infos.github || "",
      linkedin: infos.linkedin || "",
      availability: infos.availability || infos.avail || "",
      speciality: infos.speciality || infos.spec || "",
      languages: infos.languages || infos.langs || "",
      stats: normalizeStats(Array.isArray(infos.stats) ? infos.stats : Array.isArray(hero.stats) ? hero.stats : []),
      about: infos.about || (Array.isArray(about.paragraphs) ? about.paragraphs.join(" ") : ""),
      aboutEn: infos.aboutEn || infos.about || (Array.isArray(about.paragraphs) ? about.paragraphs.join(" ") : "")
    },
    services: mapItems(raw.services, item => ({
      id: item.id,
      title: item.title || item.nom || item.name || "Service",
      titleEn: item.titleEn || item.title || item.nome || item.name || item.nom || "Service",
      description: item.description || item.desc || item.desce || "",
      icon: item.icon || item.ico || "layout"
    })),
    projects: mapItems(raw.projects, item => ({
      id: item.id,
      title: item.title || item.tit || item.name || "Projet",
      titleEn: item.titleEn || item.tite || item.title || item.tit || item.name || "Project",
      organization: item.organization || item.org || "",
      date: item.date || "",
      badge: item.badge || item.category || item.cat || "",
      badgeStyle: item.badgeStyle || "",
      description: item.description || item.desc || (Array.isArray(item.bul) ? item.bul.join(" ") : ""),
      bullets: item.bullets || item.bul || [],
      bulletsEn: item.bulletsEn || item.bule || item.bullets || item.bul || [],
      category: item.category || item.cat || "Web",
      tags: item.tags || [],
      image: item.image || "./assets/images/project-portfolio.svg",
      link: item.link || item.url || "#",
      repo: item.repo || "#",
      featured: Boolean(item.featured)
    })),
    skills: mapItems(raw.skills, item => ({
      id: item.id,
      name: item.name || item.n || "Competence",
      level: Number(item.level || item.pct || item.l || 70),
      category: item.category || item.group || item.c || "General"
    })),
    tools: raw.tools || [],
    toolsOffensive: raw.toolsOffensive || [],
    experience: mapItems(raw.experience, item => ({
      id: item.id,
      role: item.role || item.poste || "Experience",
      company: item.company || item.lieu || item.location || "",
      period: item.period || item.periode || "",
      description: item.description || item.desc || ""
    })),
    edu: mapItems(raw.edu || raw.education, item => ({
      id: item.id,
      degree: item.degree || item.diplome || item.title || "Formation",
      school: item.school || item.ecole || item.location || "",
      period: item.period || item.periode || "",
      description: item.description || item.desc || ""
    })),
    certs: mapItems(raw.certs || raw.certifications, item => ({
      id: item.id,
      title: item.title || item.nom || "Certification",
      issuer: item.issuer || item.organisme || "",
      date: item.date || "",
      description: item.description || item.desc || "",
      logo: item.logo || "",
      pdf: item.pdf || "",
      link: item.link || item.url || "#"
    })),
    knowledge: mapItems(raw.knowledge, item => ({
      id: item.id,
      titre: item.titre || item.title || "Article",
      titreEn: item.titreEn || item.titleEn || item.titre || item.title || "Article",
      resume: item.resume || item.summary || "",
      resumeEn: item.resumeEn || item.summaryEn || item.resume || item.summary || "",
      contenu: item.contenu || item.content || "",
      contenuEn: item.contenuEn || item.contentEn || item.contenu || item.content || "",
      image: item.image || "./assets/images/article-architecture.svg",
      categorie: item.categorie || item.category || "General",
      tags: item.tags || [],
      auteur: item.auteur || item.author || "Venance Houndete",
      date: item.date || new Date().toISOString().slice(0, 10),
      statut: item.statut || item.status || "publie",
      slug: item.slug || item.id || "article"
    })),
    gallery: mapItems(raw.gallery, item => ({
      id: item.id,
      titre: item.titre || item.title || "Affiche",
      categorie: item.categorie || item.category || "General",
      tags: item.tags || [],
      image: item.image || "./assets/images/poster-cyber.svg",
      date: item.date || new Date().toISOString().slice(0, 10),
      telechargeable: item.telechargeable !== false
    })),
    articles: mapItems(raw.articles || raw.watch, item => ({
      id: item.id,
      title: item.title || item.titre || "Article",
      summary: item.summary || item.resume || "",
      category: item.category || item.categorie || "Veille",
      source: item.source || "",
      url: item.url || item.link || "#",
      tags: item.tags || [],
      date: item.date || "",
      status: item.status || item.statut || "publie"
    })),
    contacts: mapItems(raw.contacts || raw.contact, item => ({
      id: item.id,
      label: item.label || item.lbl || "Contact",
      value: item.value || item.val || item.label || item.lbl || "",
      url: item.url || item.lnk || item.link || "#",
      icon: item.icon || item.ico || "mail"
    })),
    activity: raw.activity || []
  };
  return normalized;
}

function mapItems(items, mapper) {
  return Array.isArray(items) ? items.map((item, index) => ({ ...mapper(item || {}), id: (item && item.id) || `item-${index + 1}` })) : [];
}

function normalizeStats(stats) {
  return stats.map((stat, index) => ({
    label: stat.label || stat.name || `Stat ${index + 1}`,
    labelEn: stat.labelEn || stat.label || stat.name || `Stat ${index + 1}`,
    value: stat.value || stat.val || "0"
  }));
}

function isNewer(a, b) {
  const at = Date.parse(a?._updated || "");
  const bt = Date.parse(b?._updated || "");
  if (Number.isNaN(at)) return false;
  if (Number.isNaN(bt)) return true;
  return at > bt;
}
