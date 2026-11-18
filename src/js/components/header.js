// En-tête : fond au scroll, se cache en descendant, menu en feuille, barre de réservation mobile
export function initHeader() {
  const body = document.body;
  const top = document.getElementById('top');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const dock = document.getElementById('dock');
  const hero = document.getElementById('accueil');
  const foot = document.querySelector('.foot');
  if (!top) return;

  const toggle = open => {
    body.classList.toggle('menu-open', open);
    body.classList.toggle('locked', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.setAttribute('aria-hidden', !open);
    if (open) { top.classList.remove('hide'); setTimeout(() => menu.querySelector('a')?.focus({ preventScroll: true }), 400); }
  };
  burger?.addEventListener('click', () => toggle(!body.classList.contains('menu-open')));
  menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
  menu?.addEventListener('click', e => { if (e.target === menu) toggle(false); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) { toggle(false); burger.focus(); }
  });

  let lastY = scrollY, ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY, heroH = hero?.offsetHeight ?? 600;
    const footTop = foot ? foot.getBoundingClientRect().top : Infinity;
    top.classList.toggle('solid', y > 30);
    if (!body.classList.contains('menu-open')) {
      if (y > heroH * 0.6 && y > lastY + 6) top.classList.add('hide');
      else if (y < lastY - 6) top.classList.remove('hide');
    }
    dock?.classList.toggle('show', y > heroH * 0.8 && footTop > innerHeight * 0.9);
    lastY = y;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();
}
