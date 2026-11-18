// Horaires : jour courant (heure de Paris) dans le tableau et dans la carte « Aujourd'hui »
const CODES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const h = t => t.replace(/^0/, '').replace(':00', 'h').replace(':', 'h');

export function initHours() {
  let day;
  try { day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/Paris' }).format(new Date()).slice(0, 2); }
  catch { day = CODES[new Date().getDay()]; }
  document.querySelector(`.week tr[data-day="${day}"]`)?.classList.add('is-today');

  const card = document.querySelector('[data-today]');
  const src = document.getElementById('hours-data');
  if (!card || !src) return;
  let jours;
  try { jours = JSON.parse(src.textContent); } catch { return; }
  const j = jours.find(x => x.c === day);
  if (!j) return;
  card.querySelector('[data-today-label]').textContent = `Aujourd'hui · ${j.j.toLowerCase()}`;
  const title = card.querySelector('[data-today-title]');
  const sv = card.querySelector('[data-today-sv]');
  const midi = j.s.find(([a]) => a < '16:00'), soir = j.s.find(([a]) => a >= '16:00');
  if (!j.s.length) {
    // Prochain jour ouvert
    const i = CODES.indexOf(day);
    let next = null;
    for (let k = 1; k <= 7 && !next; k++) { const c = CODES[(i + k) % 7]; const n = jours.find(x => x.c === c); if (n?.s.length) next = n; }
    title.textContent = next ? `Fermé. On se retrouve ${next.j.toLowerCase()} !` : 'Fermé aujourd\'hui';
    return;
  }
  title.textContent = midi && soir ? 'Ouvert midi et soir !' : midi ? 'Ouvert ce midi !' : 'Ouvert ce soir !';
  sv.innerHTML = [['Midi', midi], ['Soir', soir]].map(([n, c]) =>
    `<span><small>${n}</small>${c ? `${h(c[0])} – ${h(c[1])}` : 'pas de service'}</span>`).join('');
  sv.hidden = false;
}
