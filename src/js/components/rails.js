// Rail du passe : les bons se balancent selon la vitesse du défilement (ressort amorti)
export function initRails({ reduce }) {
  document.querySelectorAll('[data-rail]').forEach(rail => {
    // Glisser à la souris (le doigt fait déjà défiler)
    let down = false, sx = 0, sl = 0;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointerup', () => { down = false; });
    addEventListener('pointermove', e => { if (down) rail.scrollLeft = sl - (e.clientX - sx); });
    if (reduce) return;

    const tickets = [...rail.querySelectorAll('.ticket')];
    let angle = 0, vel = 0, last = rail.scrollLeft, lastT = performance.now(), running = false;
    const step = t => {
      const dt = Math.min(48, t - lastT) / 16.67; lastT = t;
      const x = rail.scrollLeft, speed = (x - last) / dt; last = x;
      const target = Math.max(-10, Math.min(10, -speed * 0.6));
      vel += ((target - angle) * 0.12 - vel * 0.18) * dt;   // ressort + amortissement
      angle += vel * dt;
      tickets.forEach((tk, i) => tk.style.setProperty('--swing', (angle * (1 - (i % 3) * 0.12)).toFixed(2)));
      if (Math.abs(angle) > 0.05 || Math.abs(vel) > 0.05 || Math.abs(speed) > 0.1) requestAnimationFrame(step);
      else { running = false; tickets.forEach(tk => tk.style.setProperty('--swing', 0)); }
    };
    rail.addEventListener('scroll', () => { if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(step); } }, { passive: true });

    // À l'arrivée, les bons sont « accrochés » un par un
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      tickets.forEach((tk, i) => tk.animate(
        [{ transform: 'translateY(-40px) rotate(-12deg)', opacity: 0 }, { transform: 'rotate(4deg)', opacity: 1, offset: .6 }, { transform: 'none', opacity: 1 }],
        { duration: 800, delay: Math.min(i, 5) * 90, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' }));
      io.disconnect();
    }, { threshold: .3 });
    io.observe(rail);
  });
}
