// La visite : un chemin relie l'église aux trois espaces et se trace au fil du scroll
export function initWalk({ reduce }) {
  const root = document.querySelector('[data-walk]');
  if (!root) return;
  const svg = root.querySelector('.walk__path');
  const trail = svg.querySelector('.walk__trail');
  const line = svg.querySelector('.walk__line');
  const dot = svg.querySelector('.walk__dot');
  let len = 0;

  const build = () => {
    const box = root.getBoundingClientRect();
    const pts = [];
    const start = root.querySelector('.walk__start svg').getBoundingClientRect();
    pts.push([start.left + start.width / 2 - box.left, start.bottom - box.top + 6]);
    root.querySelectorAll('.stop').forEach((s, i) => {
      const ph = s.querySelector('.stop__photo').getBoundingClientRect();
      const tx = s.querySelector('.stop__text').getBoundingClientRect();
      pts.push([ph.left + ph.width * (i % 2 ? .3 : .7) - box.left, ph.top - box.top + ph.height * .2]);
      pts.push([tx.left + tx.width * (i % 2 ? .15 : .85) - box.left, tx.bottom - box.top + 30]);
    });
    // Courbe lissée (Catmull-Rom → Bézier)
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    trail.setAttribute('d', d); line.setAttribute('d', d);
    len = line.getTotalLength();
    line.style.strokeDasharray = `${len} ${len}`;
    update();
  };

  const update = () => {
    if (!len) return;
    const r = root.getBoundingClientRect();
    const p = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.62 - r.top) / r.height));
    line.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
    const pt = line.getPointAtLength(len * p);
    dot.setAttribute('cx', pt.x.toFixed(1)); dot.setAttribute('cy', pt.y.toFixed(1));
    dot.style.opacity = p > 0.002 && p < 0.998 ? 1 : 0;
  };

  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } }, { passive: true });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
  root.querySelectorAll('img').forEach(img => img.complete || img.addEventListener('load', build, { once: true }));
  (document.fonts?.ready ?? Promise.resolve()).then(build);
  build();
}
