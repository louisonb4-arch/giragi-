// Pile de photos : on balaie celle du dessus, elle repart sous la pile
export function initStack() {
  const root = document.querySelector('[data-stack]');
  if (!root) return;
  let cards = [...root.querySelectorAll('.stack__card')];
  const tilt = [-3, 4, -6, 2, 5, -2];
  const layout = () => cards.forEach((c, i) => {
    c.style.setProperty('--z', cards.length - i);
    c.style.setProperty('--rot', `${i === 0 ? 0 : tilt[i % tilt.length]}deg`);
    c.style.setProperty('--x', '0px'); c.style.setProperty('--y', `${Math.min(i, 3) * 6}px`);
    c.tabIndex = i === 0 ? 0 : -1;
    c.setAttribute('aria-hidden', i !== 0);
  });
  layout();

  const next = (dir = 1) => {
    const c = cards[0];
    c.style.setProperty('--x', `${dir * 130}%`); c.style.setProperty('--rot', `${dir * 24}deg`);
    c.style.opacity = '0';
    setTimeout(() => { cards.push(cards.shift()); c.style.opacity = ''; layout(); }, 320);
  };

  let sx = 0, sy = 0, dx = 0, drag = false, moved = false;
  root.addEventListener('pointerdown', e => {
    const c = cards[0]; if (!c.contains(e.target)) return;
    drag = true; moved = false; sx = e.clientX; sy = e.clientY; dx = 0; c.classList.add('dragging');
    c.setPointerCapture?.(e.pointerId);
  });
  root.addEventListener('pointermove', e => {
    if (!drag) return;
    dx = e.clientX - sx; const dy = e.clientY - sy;
    if (Math.abs(dx) > 6) moved = true;
    const c = cards[0];
    c.style.setProperty('--x', `${dx}px`); c.style.setProperty('--y', `${dy * .2}px`); c.style.setProperty('--rot', `${dx / 14}deg`);
  });
  const end = () => {
    if (!drag) return; drag = false;
    const c = cards[0]; c.classList.remove('dragging');
    if (Math.abs(dx) > 80) next(Math.sign(dx)); else layout();
  };
  root.addEventListener('pointerup', end); root.addEventListener('pointercancel', end);
  // Un vrai glissé ne doit pas ouvrir Instagram ; un simple tap, si
  root.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } }, true);
  root.addEventListener('dragstart', e => e.preventDefault());
}
