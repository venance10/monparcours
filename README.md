# Venance Houndete Portfolio

Application web statique, modulaire et compatible GitHub Pages.

## Structure

- `index.html` : portfolio public
- `admin.html` : tableau de bord local
- `data.json` : contenu centralise
- `assets/css` : design system et styles par domaine
- `assets/js` : modules ES6 par responsabilite
- `sw.js`, `manifest.json`, `robots.txt`, `sitemap.xml` : base PWA et SEO

## Administration

Le tableau de bord fonctionne cote client. Les changements peuvent etre exportes/importes en JSON ou sauvegardes via GitHub Contents API apres configuration d'un token personnel.

Le mot de passe admin n'est pas stocke en clair. Seul son hash SHA-256 est present dans `assets/js/config.js`.
