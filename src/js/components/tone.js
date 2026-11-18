// Du jour à la soirée : le fond change selon la partie de la page au centre de l'écran
export function initTone() {
  const zones = [...document.querySelectorAll('[data-tone]')];
  if (!zones.length) return;
  let current = null;
  const update = () => {
    const mid = innerHeight * 0.5;
    let tone = 'day';
    for (const z of zones) {
      const r = z.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) { tone = z.dataset.tone; }
    }
    if (tone !== current) {
      current = tone;
      document.body.classList.toggle('is-night', tone === 'night');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tone === 'night' ? '#833B00' : '#DED9C3');
    }
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } }, { passive: true });
  addEventListener('resize', update);
  update();
}
