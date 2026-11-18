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

/* ---------- Éphéméride (hero) ---------- */
export function ephemeride({ infos }) {
  const pages = infos.horaires.jours.map(j => {
    const midi = midiOf(j), soir = soirOf(j);
    let body;
    if (j.code === 'Su') {
      body = `<p class="ephem__closed">Fermé. Mais c'est notre nom :</p><p class="ephem__note"><em>Giragi</em> veut dire « dimanche » en arménien.</p>`;
    } else if (!j.creneaux.length) {
      body = `<p class="ephem__closed">Fermé.</p><p class="ephem__note">On se retrouve mardi midi.</p>`;
    } else {
      body = `<dl class="ephem__services">
        <div${midi ? '' : ' class="off"'}><dt>Midi</dt><dd>${midi ? creneau(midi) : 'pas de service'}</dd></div>
        <div${soir ? '' : ' class="off"'}><dt>Soir</dt><dd>${soir ? creneau(soir) : 'pas de service'}</dd></div>
      </dl>`;
    }
    return `<li class="ephem__page${j.code === 'Su' ? ' ephem__page--sunday' : ''}" data-day="${j.code}">
      <p class="ephem__label"><span data-label>${esc(j.jour)}</span><b class="ephem__num" data-num></b></p>
      <p class="ephem__day">${esc(j.jour)}</p>
      ${body}
    </li>`;
  });
  // Ordre par défaut (sans JS) : du mardi au lundi
  const order = ['Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo'];
  const byCode = Object.fromEntries(infos.horaires.jours.map((j, i) => [j.code, pages[i]]));
  return order.map(c => byCode[c]).join('');
}

/* ---------- Horaires (tableau) ---------- */
export function horaires({ infos }) {
  const rows = infos.horaires.jours.map(j => {
    const ferme = !j.creneaux.length, midi = midiOf(j), soir = soirOf(j);
    return `<tr${ferme ? ' class="is-closed"' : ''} data-day="${j.code}">
      <th scope="row">${j.jour}</th>
      ${ferme ? '<td colspan="2">Fermé</td>' : `<td>${midi ? creneau(midi) : '<span aria-label="pas de service">—</span>'}</td><td>${soir ? creneau(soir) : '<span aria-label="pas de service">—</span>'}</td>`}
    </tr>`;
  }).join('');
  return `<table class="hours"><thead><tr><td></td><th scope="col">Midi</th><th scope="col">Soir</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* ---------- Ardoise : bons de cuisine sur le rail ---------- */
const ticket = (p, n, service) => `<li class="ticket" style="--n:${n}">
  <div class="ticket__paper">
    <p class="ticket__top"><span>${service}</span><span>N° ${String(n).padStart(2, '0')}</span></p>
    <p class="ticket__name">${esc(p.nom)}</p>
    ${p.detail ? `<p class="ticket__detail">${esc(p.detail)}</p>` : ''}
    <p class="ticket__foot">${p.vg ? '<abbr class="ticket__vg" title="Végétarien">VG</abbr>' : '<span></span>'}${p.prix ? `<b>${esc(p.prix)}</b>` : ''}</p>
  </div>
</li>`;

export function railMidi({ carte }) {
  const m = carte.midi;
  const formules = m.formules.map(f => `<li><span>${esc(f.nom)}${f.detail ? `<small>${esc(f.detail)}</small>` : ''}</span><b>${esc(f.prix)}</b></li>`).join('');
  const head = `<li class="ticket ticket--big" style="--n:0"><div class="ticket__paper">
    <p class="ticket__top"><span>Midi</span><span>${esc(m.jours)}</span></p>
    <p class="ticket__name">La formule</p>
    <ul class="ticket__formulas">${formules}</ul>
    <p class="ticket__detail">${esc(m.intro)}</p>
  </div></li>`;
  return head + m.plats.map((p, i) => ticket(p, i + 1, 'Midi')).join('');
}

export function railSoir({ carte }) {
  const s = carte.soir;
  const head = `<li class="ticket ticket--big" style="--n:0"><div class="ticket__paper">
    <p class="ticket__top"><span>Soir</span><span>${esc(s.jours)}</span></p>
    <p class="ticket__name">${esc(s.signature.nom)}</p>
    <p class="ticket__detail">${esc(s.signature.detail)}.</p>
    <p class="ticket__detail">${esc(s.intro)}</p>
    <p class="ticket__stamp">Tous les soirs</p>
  </div></li>`;
  return head + s.plats.map((p, i) => ticket(p, i + 1, p.dessert ? 'Dessert' : 'Soir')).join('');
}

export const exempleMidi = ({ carte }) => esc(carte.midi.exemple);
export const exempleSoir = ({ carte }) => esc(carte.soir.exemple);
export const majCarte = ({ carte }) => new Date(carte.miseAJour).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/* ---------- Avis : ticket de caisse ---------- */
export function receipt({ avis, infos }) {
  const lines = avis.avis.map((a, i) => `<li class="receipt__item">
    <p class="receipt__row"><span>${String(i + 1).padStart(2, '0')} x ${esc(a.auteur)}</span><span aria-label="5 étoiles sur 5">★★★★★</span></p>
    <blockquote><p>${esc(a.texte)}</p></blockquote>
    <p class="receipt__date">${esc(a.date)}</p>
  </li>`).join('');
  return `<ul class="receipt__items">${lines}</ul>
  <p class="receipt__sep" aria-hidden="true"></p>
  <p class="receipt__total"><span>Total</span><b>${esc(infos.google.note)} / 5</b></p>
  <p class="receipt__row"><span>Avis Google</span><span>${esc(infos.google.avis)}</span></p>
  <p class="receipt__row"><span>Relevé le</span><span>${esc(infos.google.date)}</span></p>`;
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
