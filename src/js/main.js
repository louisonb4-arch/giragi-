// Point d'entrée : chaque composant est un module indépendant
import { initIntro } from './components/intro.js';
import { initHeader } from './components/header.js';
import { initReveal } from './components/reveal.js';
import { initTone } from './components/tone.js';
import { initTour } from './components/tour.js';
import { initHours } from './components/hours.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

initHeader();
initReveal();
initTone();
initTour();
initHours();
initIntro({ reduce });
