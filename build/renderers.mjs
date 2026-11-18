// Rendus HTML générés à partir de /data — appelés depuis les templates avec {{@ nom}}
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const h = t => t.replace(/^0/, '').replace(':00', 'h').replace(':', 'h');
const creneau = ([a, b]) => `${h(a)}–${h(b)}`;

/* ---------- Horaires ---------- */
export function horaires({ infos }) {
  const rows = infos.horaires.jours.map(j => {
    const ferme = !j.creneaux.length;
    const midi = j.creneaux.find(([a]) => a < '16:00');
    const soir = j.creneaux.find(([a]) => a >= '16:00');
    return `<tr${ferme ? ' class="is-closed"' : ''} data-day="${j.code}">
      <th scope="row">${j.jour}</th>
      ${ferme ? '<td colspan="2">Fermé</td>' : `<td>${midi ? creneau(midi) : '<span aria-label="pas de service">·</span>'}</td><td>${soir ? creneau(soir) : '<span aria-label="pas de service">·</span>'}</td>`}
    </tr>`;
  }).join('');
  return `<table class="hours"><thead><tr><td></td><th scope="col">Midi</th><th scope="col">Soir</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* ---------- Ardoise ---------- */
const plat = p => `<li class="dish${p.dessert ? ' dish--dessert' : ''}">
  <p class="dish__name">${esc(p.nom)}${p.vg ? ' <abbr class="vg" title="Végétarien">VG</abbr>' : ''}</p>
  ${p.detail ? `<p class="dish__detail">${esc(p.detail)}</p>` : ''}
  ${p.prix ? `<p class="dish__price">${esc(p.prix)}</p>` : ''}
</li>`;

export function ardoiseMidi({ carte }) {
  const m = carte.midi;
  const formules = m.formules.map(f => `<li class="formula">
    <span class="formula__name">${esc(f.nom)}${f.detail ? `<small>${esc(f.detail)}</small>` : ''}</span>
    <span class="formula__dots" aria-hidden="true"></span>
    <span class="formula__price">${esc(f.prix)}</span></li>`).join('');
  return `<ul class="formulas">${formules}</ul>
  <p class="board__example">${esc(m.exemple)}</p>
  <ul class="dishes">${m.plats.map(plat).join('')}</ul>`;
}

export function ardoiseSoir({ carte }) {
  const s = carte.soir;
  return `<div class="signature"><span class="signature__tag">Tous les soirs</span><p class="dish__name">${esc(s.signature.nom)}</p><p class="dish__detail">${esc(s.signature.detail)}</p></div>
  <p class="board__example">${esc(s.exemple)}</p>
  <ul class="dishes">${s.plats.map(plat).join('')}</ul>`;
}

export const majCarte = ({ carte }) => new Date(carte.miseAJour).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/* ---------- Avis ---------- */
export function avis({ avis }) {
  return avis.avis.map((a, i) => `<figure class="review" data-reveal style="--i:${i}">
    <blockquote><p>${esc(a.texte)}</p></blockquote>
    <figcaption><span class="review__stars" aria-label="5 étoiles sur 5">★★★★★</span>${esc(a.auteur)} · ${esc(a.date)}</figcaption>
  </figure>`).join('');
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
