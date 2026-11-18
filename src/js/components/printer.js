// Le ticket de caisse sort de l'imprimante au rythme du scroll
export function initPrinter({ reduce }) {
  const root = document.querySelector('[data-printer]');
  if (!root || reduce) return;
  const receipt = root.querySelector('.receipt');
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = root.getBoundingClientRect();
    const span = Math.max(1, receipt.offsetHeight * 0.75);
    const p = Math.min(1, Math.max(0, (innerHeight * 0.9 - r.top) / span));
    receipt.style.setProperty('--feed', (0.06 + p * 0.94).toFixed(3));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update);
  update();
}
