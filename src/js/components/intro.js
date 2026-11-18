// Ouverture : le logo se peint au pinceau, le lettrage apparaît, puis le rideau se lève
import { paint } from './paint.js';

export function initIntro({ reduce }) {
  const intro = document.getElementById('intro');
  const body = document.body;
  const ready = () => body.classList.add('ready');
  if (!intro || reduce || seen()) { intro?.classList.add('gone'); ready(); return; }

  intro.querySelectorAll('.intro__lettering span').forEach((s, i) => s.style.setProperty('--n', i));
  body.classList.add('locked');
  const timers = [];
  let done = false;
  const open = () => {
    if (done) return; done = true;
    timers.forEach(clearTimeout);
    intro.classList.add('letter', 'open');
    setTimeout(ready, 300);
    setTimeout(() => {
      intro.classList.add('gone');
      if (!body.classList.contains('menu-open')) body.classList.remove('locked');
    }, 1050);
    remember();
  };
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    timers.push(setTimeout(() => paint(intro.querySelector('.paint'), 1.45), 120));
    timers.push(setTimeout(() => intro.classList.add('letter'), 1500));
    timers.push(setTimeout(open, 2700));
  });
  setTimeout(open, 5000);                 // filet de sécurité
  intro.addEventListener('click', open);  // tap pour passer
  addEventListener('keydown', open, { once: true });
}

const seen = () => { try { return sessionStorage.getItem('giragi-intro'); } catch { return null; } };
const remember = () => { try { sessionStorage.setItem('giragi-intro', '1'); } catch { /* rien */ } };
