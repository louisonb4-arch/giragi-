// Point d'entrée : chaque composant est un module indépendant
import { initIntro } from './components/intro.js';
import { initHeader } from './components/header.js';
import { initReveal } from './components/reveal.js';
import { initWobble } from './components/wobble.js';
import { initEphemeride } from './components/ephemeride.js';
import { initRoll } from './components/roll.js';
import { initRails } from './components/rails.js';
import { initBar } from './components/bar.js';
import { initWalk } from './components/walk.js';
import { initPrinter } from './components/printer.js';
import { initPostcard } from './components/postcard.js';
import { initStack } from './components/stack.js';
import { initHours } from './components/hours.js';
import { paintOnView } from './components/paint.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

initWobble();
initHeader();
initReveal();
initEphemeride({ reduce });
initRoll({ reduce });
initRails({ reduce });
initBar();
initWalk({ reduce });
initPrinter({ reduce });
initPostcard();
initStack();
initHours();
paintOnView();
initIntro({ reduce });
