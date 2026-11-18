# Giragi — site vitrine

Bistrot & cave à manger de quartier, 1 place Saint-Clair, 44100 Nantes.
Site statique, mobile d'abord, sans dépendance. Conception : Vokum.

## Mettre à jour l'ardoise (chaque semaine)

1. Modifier `data/carte.json` (plats du midi et du soir, formules, prix).
   `prix: null` = prix non affiché · `vg: true` = pastille végétarien.
2. Pousser sur `main` : Vercel reconstruit le site tout seul.
   En local : `npm run build` puis `npm run dev`.

Horaires, téléphone, lien de réservation, groupes : `data/infos.json`.
Avis Google affichés : `data/avis.json` (copier le texte exact, ne jamais reformuler).

## Structure

```
data/            contenu (carte, infos pratiques, avis)
src/pages/       pages (index, mentions-legales, 404)
src/partials/    une section = un fichier (hero, concept, ardoise, cave, lieu…)
src/css/         un fichier CSS par composant, assemblés dans l'ordre de _order.txt
src/js/          modules ES : main.js + components/ (intro, header, tone, tour…)
build/           rendus générés depuis /data (ardoise, horaires, JSON-LD, sitemap, llms.txt)
public/          images, polices, icônes (copiés tels quels)
build.mjs        assemble tout dans dist/
```

## Domaine

Le build prend `SITE_URL`, sinon l'URL de production Vercel. Pour `giragi.com` :
ajouter le domaine dans Vercel puis définir `SITE_URL=https://giragi.com` dans les variables d'environnement du projet.

## Sécurité

En-têtes dans `vercel.json` (CSP stricte, HSTS, nosniff…). Si le petit script inline
de `src/pages/index.html` change, mettre à jour son empreinte sha256 dans la CSP.
