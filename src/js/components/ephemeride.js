// Éphéméride : la page du jour en premier, on arrache pour passer au lendemain
const CODES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function initEphemeride({ reduce }) {
  const root = document.querySelector('[data-ephem]');
  if (!root) return;
  const list = root.querySelector('.ephem__pages');
  const btn = root.querySelector('[data-tear]');

  // Jour courant à Paris
  const now = new Date();
  let todayIdx = now.getDay();
  try {
    const wd = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/Paris' }).format(now).slice(0, 2);
    todayIdx = CODES.indexOf(wd);
  } catch { /* fuseau indisponible */ }

  // Remet les pages dans l'ordre à partir d'aujourd'hui et écrit les dates
  const pages = Object.fromEntries([...list.children].map(li => [li.dataset.day, li]));
  for (let k = 0; k < 7; k++) {
    const code = CODES[(todayIdx + k) % 7];
    const li = pages[code];
    if (!li) continue;
    const d = new Date(now); d.setDate(now.getDate() + k);
    li.querySelector('[data-num]').textContent = d.getDate();
    const label = li.querySelector('[data-label]');
    if (k === 0) { label.textContent = "Aujourd'hui"; label.classList.add('is-today'); }
    else if (k === 1) label.textContent = 'Demain';
    else label.textContent = d.toLocaleDateString('fr-FR', { month: 'long' });
    list.append(li);
  }

  let busy = false;
  const tear = () => {
    if (busy) return; busy = true;
    const page = list.firstElementChild;
    const done = () => {
      page.classList.remove('is-tearing');
      list.append(page);
      busy = false;
    };
    if (reduce) { done(); return; }
    page.classList.add('is-tearing');
    navigator.vibrate?.(8);
    page.addEventListener('animationend', done, { once: true });
  };
  btn?.addEventListener('click', tear);

  // Glisser la page vers le haut ou sur le côté pour l'arracher
  let sx = 0, sy = 0, active = false;
  list.addEventListener('pointerdown', e => { active = true; sx = e.clientX; sy = e.clientY; });
  addEventListener('pointerup', e => {
    if (!active) return; active = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 40 || dy < -40) tear();
  });
  list.addEventListener('click', () => tear());

  // Petit coin qui se soulève pour montrer que ça s'arrache
  if (!reduce) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setTimeout(() => { root.classList.add('hint'); setTimeout(() => root.classList.remove('hint'), 1500); }, 2200);
      io.disconnect();
    }, { threshold: .6 });
    io.observe(root);
  }
}
