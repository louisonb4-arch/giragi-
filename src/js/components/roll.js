// Les assiettes arrivent en roulant (rotation = distance / rayon : un vrai roulement)
export function initRoll({ reduce }) {
  const items = [...document.querySelectorAll('[data-roll]')];
  if (!items.length || reduce) return;
  const plates = items.map(el => ({ el, plate: el.querySelector('.plate'), dir: el.dataset.roll === 'left' ? -1 : 1 }));
  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = innerHeight, vw = innerWidth;
    plates.forEach(({ el, plate, dir }) => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
      const e = 1 - Math.pow(1 - p, 3);
      const radius = plate.offsetWidth / 2 || 1;
      const x = (1 - e) * dir * (vw * 0.9);
      const rot = (x / radius) * (180 / Math.PI);
      plate.style.transform = `translateX(${x.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame);
  frame();
}
