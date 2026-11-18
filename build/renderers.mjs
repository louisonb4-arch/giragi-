// Rendus HTML générés à partir de /data — appelés depuis les templates avec {{@ nom}}
import { readFileSync } from 'node:fs';
const LOGO = JSON.parse(readFileSync(new URL('./logo.json', import.meta.url), 'utf8'));

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const h = t => t.replace(/^0/, '').replace(':00', 'h').replace(':', 'h');
const creneau = ([a, b]) => `${h(a)}–${h(b)}`;
const midiOf = j => j.creneaux.find(([a]) => a < '16:00');
const soirOf = j => j.creneaux.find(([a]) => a >= '16:00');

/* ---------- Logo peint au pinceau (SVG + masque de traits) ---------- */
let logoId = 0;
export function logoPaint() {
  const id = `brush${++logoId}`;
  const strokes = LOGO.strokes.flatMap((letter, li) => letter.map(d => `<path pathLength="1" style="--l:${li}" d="${d}"/>`)).join('');
  const fill = LOGO.fill.map(d => `<path d="${d}"/>`).join('');
  return `<svg class="paint" viewBox="-12 -12 ${LOGO.w + 24} ${LOGO.h + 24}" role="img" aria-label="Giragi">
  <defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-30" y="-30" width="${LOGO.w + 60}" height="${LOGO.h + 60}"><g class="paint__brush">${strokes}</g></mask></defs>
  <g mask="url(#${id})" fill="currentColor" fill-rule="evenodd">${fill}</g></svg>`;
}

/* ---------- Résumé des horaires (haut de page) ---------- */
const ABR = { Mo: 'lun', Tu: 'mar', We: 'mer', Th: 'jeu', Fr: 'ven', Sa: 'sam', Su: 'dim' };
function plage(jours, pick) {
  const on = jours.filter(j => pick(j));
  if (!on.length) return null;
  const c = pick(on[0]);
  return { jours: on.length > 1 ? `${ABR[on[0].code]} → ${ABR[on[on.length - 1].code]}` : ABR[on[0].code], h: creneau(c).replace('–', ' – ') };
}
export function heroHours({ infos }) {
  const m = plage(infos.horaires.jours, midiOf), s = plage(infos.horaires.jours, soirOf);
  const cell = (t, x) => x ? `<div><span class="k">${t} · ${x.jours}</span><b>${x.h}</b></div>` : '';
  return cell('Le midi', m) + cell('Le soir', s);
}

/* ---------- Horaires (tableau de la semaine) ---------- */
export function semaine({ infos }) {
  return `<table class="week"><caption class="sr-only">Horaires d'ouverture</caption><tbody>${infos.horaires.jours.map(j => {
    const t = j.creneaux.length ? j.creneaux.map(creneau).join(' · ') : 'Fermé';
    return `<tr${j.creneaux.length ? '' : ' class="off"'} data-day="${j.code}"><th scope="row">${j.jour}</th><td>${t}</td></tr>`;
  }).join('')}</tbody></table>`;
}
// Données horaires pour la carte « Aujourd'hui » (lue par le JS)
export const horairesJson = ({ infos }) => `<script type="application/json" id="hours-data">${JSON.stringify(infos.horaires.jours.map(j => ({ c: j.code, j: j.jour, s: j.creneaux })))}</script>`;

/* ---------- L'ardoise ---------- */
const plat = p => `<li class="dish"><p>${esc(p.nom)}${p.vg ? ' <abbr class="vg" title="Végétarien">VG</abbr>' : ''}${p.prix ? ` <b>${esc(p.prix)}</b>` : ''}</p>${p.detail ? `<small>${esc(p.detail)}</small>` : ''}</li>`;
export function ardoise({ carte }) {
  const m = carte.midi, s = carte.soir;
  const formules = m.formules.map(f => `<li class="line"><span>${esc(f.nom)}${f.detail ? ` <small>${esc(f.detail)}</small>` : ''}</span><i aria-hidden="true"></i><b>${esc(f.prix)}</b></li>`).join('');
  return `<div class="menu__block">
      <h3>Le midi</h3><p class="menu__days">${esc(m.jours)}</p>
      <ul class="lines">${formules}</ul>
      <p class="menu__ex">${esc(m.exemple)}</p>
      <ul class="dishes">${m.plats.map(plat).join('')}</ul>
    </div>
    <div class="menu__orn" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="menu__block">
      <h3>Le soir</h3><p class="menu__days">${esc(s.jours)}</p>
      <p class="menu__ex">${esc(s.exemple)}</p>
      <ul class="dishes">${s.plats.map(plat).join('')}</ul>
      <p class="menu__sig">Tous les soirs : ${esc(s.signature.nom.toLowerCase())} maison</p>
    </div>`;
}
export const majCarte = ({ carte }) => new Date(carte.miseAJour).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/* ---------- Avis à la une ---------- */
export function avisUne({ avis }) {
  return avis.avis.filter(a => a.une).slice(0, 3).map(a => `<figure class="quote" data-reveal>
    <blockquote><p>« ${esc(a.texte)} »</p></blockquote>
    <figcaption>${esc(a.auteur)} · ${esc(a.date)}</figcaption>
  </figure>`).join('<div class="orn" aria-hidden="true"><i></i><i></i><i></i></div>');
}

/* ---------- Données structurées ---------- */
export function jsonld({ infos, site }) {
  const days = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' };
  const spec = infos.horaires.jours.flatMap(j => j.creneaux.map(([o, c]) => ({
    '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${days[j.code]}`, opens: o, closes: c
  })));
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${site.url}/#restaurant`,
    name: 'Giragi',
    alternateName: 'Giragi, bistrot et cave à manger de quartier',
    description: 'Bistrot le midi, cave à manger le soir : cuisine contemporaine aux accents levantins, de saison, avec beaucoup d’assiettes végétariennes. Place Saint-Clair, Nantes.',
    url: `${site.url}/`,
    image: [`${site.url}/og.jpg`, `${site.url}/img/hero.webp`],
    logo: `${site.url}/icons/icon-512.png`,
    telephone: infos.telephone.lien,
    email: infos.email.adresse,
    priceRange: '€€',
    servesCuisine: ['Cuisine contemporaine', 'Cuisine levantine', 'Bistrot', 'Végétarien'],
    acceptsReservations: infos.reservation.url,
    menu: `${site.url}/#ardoise`,
    address: { '@type': 'PostalAddress', streetAddress: infos.adresse.rue, postalCode: infos.adresse.cp, addressLocality: infos.adresse.ville, addressCountry: 'FR' },
    geo: { '@type': 'GeoCoordinates', latitude: infos.adresse.lat, longitude: infos.adresse.lng },
    hasMap: infos.google.url,
    openingHoursSpecification: spec,
    sameAs: [infos.instagram.url]
  };
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

/* ---------- Fichiers texte ---------- */
export const robots = ({ site }) => `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`;

export const sitemap = ({ site, carte }) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${site.url}/</loc><lastmod>${carte.miseAJour}</lastmod></url>
  <url><loc>${site.url}/mentions-legales</loc><lastmod>${carte.miseAJour}</lastmod></url>
</urlset>
`;

export function llms({ site, infos, carte }) {
  const hrs = infos.horaires.jours.map(j => `- ${j.jour} : ${j.creneaux.length ? j.creneaux.map(creneau).join(' et ') : 'fermé'}`).join('\n');
  return `# Giragi — Bistrot & cave à manger de quartier (Nantes)

> Bistrot de quartier au 1 place Saint-Clair, 44100 Nantes (quartier Zola, face à l'église Saint-Clair). Le midi : formule courte de saison (entrée-plat-dessert). Le soir : assiettes à partager, vins de vignerons (nature et bio), bières locales. Cuisine contemporaine aux accents levantins de la cheffe Tessy Baddy, beaucoup d'options végétariennes. Deux terrasses : sur la place et dans la cour.

## Infos pratiques
- Adresse : ${infos.adresse.rue}, ${infos.adresse.cp} ${infos.adresse.ville}
- Téléphone : ${infos.telephone.affiche}
- Réservation : ${infos.reservation.url}
- Instagram : ${infos.instagram.url}
- Groupes et privatisation : ${infos.groupes.capacite}, ${infos.groupes.jours}

## Horaires
${hrs}

## Carte
- ${carte.midi.titre} (${carte.midi.jours}) : ${carte.midi.formules.map(f => `${f.nom} ${f.prix}`).join(' · ')}
- ${carte.soir.titre} (${carte.soir.jours}) : la carte change chaque semaine.

## Pages
- [Accueil, carte et infos](${site.url}/)
- [Mentions légales](${site.url}/mentions-legales)
`;
}
