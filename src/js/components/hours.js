// Met en avant le jour courant dans le tableau des horaires (heure de Paris)
export function initHours() {
  const codes = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  let day;
  try { day = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/Paris' }).format(new Date()).slice(0, 2); }
  catch { day = codes[new Date().getDay()]; }
  document.querySelector(`.hours tr[data-day="${day}"]`)?.classList.add('is-today');
}
