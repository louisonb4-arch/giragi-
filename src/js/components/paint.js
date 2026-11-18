// Pinceau : répartit la durée entre les traits du logo selon leur longueur, puis peint
export function paint(svg, total = 1.5) {
  if (!svg) return;
  const host = svg.closest('[data-paint]');
  const paths = [...svg.querySelectorAll('.paint__brush path')];
  const lens = paths.map(p => { try { return p.getTotalLength(); } catch { return 100; } });
  const sum = lens.reduce((a, b) => a + b, 0) || 1;
  let t = 0;
  paths.forEach((p, i) => {
    const d = total * lens[i] / sum;
    p.style.setProperty('--s', t.toFixed(3));
    p.style.setProperty('--d', `${d.toFixed(3)}s`);
    t += d * 0.92;
  });
  requestAnimationFrame(() => requestAnimationFrame(() => host?.classList.add('is-painted')));
}
