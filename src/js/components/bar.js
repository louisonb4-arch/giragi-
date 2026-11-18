// La cave : on choisit une bouteille, elle se sert dans le verre
export function initBar() {
  const root = document.querySelector('[data-bar]');
  if (!root) return;
  const bottles = [...root.querySelectorAll('.bottle')];
  const pour = root.querySelector('.pour');
  const text = root.querySelector('[data-pour-text]');
  let timer;
  const serve = (b, first = false) => {
    bottles.forEach(x => x.setAttribute('aria-checked', x === b));
    clearTimeout(timer);
    pour.style.setProperty('--level', '100px');            // on vide le verre
    timer = setTimeout(() => {
      pour.style.setProperty('--drink', b.dataset.pour);
      pour.classList.toggle('foam', !!b.dataset.foam);
      pour.classList.add('pouring');
      pour.style.setProperty('--level', '44px');             // on remplit
      text.textContent = b.dataset.text;
      timer = setTimeout(() => pour.classList.remove('pouring'), 900);
    }, first ? 0 : 450);
  };
  bottles.forEach(b => b.addEventListener('click', () => serve(b)));
  // Clavier : flèches gauche / droite comme un groupe radio
  root.querySelector('.shelf').addEventListener('keydown', e => {
    const i = bottles.findIndex(b => b.getAttribute('aria-checked') === 'true');
    const n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!n) return; e.preventDefault();
    const b = bottles[(i + n + bottles.length) % bottles.length]; serve(b); b.focus();
  });
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { serve(bottles[0], true); io.disconnect(); }
  }, { threshold: .5 });
  io.observe(pour);
}
