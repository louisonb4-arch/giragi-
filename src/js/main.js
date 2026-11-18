// Point d'entrée : chaque composant est un module indépendant
import { initHeader } from './components/header.js';
import { initReveal } from './components/reveal.js';
import { initHours } from './components/hours.js';
import { paint } from './components/paint.js';

initHeader();
initReveal();
initHours();

// Le logo se peint sur l'enseigne au chargement (une seule fois)
const sign = document.querySelector('[data-paint]');
if (sign) (document.fonts?.ready ?? Promise.resolve()).then(() => paint(sign.querySelector('svg'), 1.5));
