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
if (sign) paint(sign.querySelector('svg'), 1.5); // dessin SVG : pas besoin d'attendre les polices

// Une fois la page chargée, on précharge les photos restantes :
// plus de cadres vides quand on descend vite.
const warm = () => document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
const idle = window.requestIdleCallback || (cb => setTimeout(cb, 300));
if (document.readyState === 'complete') idle(warm); else addEventListener('load', () => idle(warm), { once: true });
