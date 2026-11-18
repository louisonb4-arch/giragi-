// Plan du lieu : chaque pastille affiche l'espace correspondant
export function initTour() {
  const root = document.querySelector('[data-tour]');
  if (!root) return;
  const spots = [...root.querySelectorAll('[data-spot]')];
  const rooms = [...root.querySelectorAll('[data-room]')];
  const zones = [...root.querySelectorAll('[data-zone]')];
  const show = id => {
    spots.forEach(s => s.setAttribute('aria-pressed', s.dataset.spot === id));
    rooms.forEach(r => r.classList.toggle('is-on', r.dataset.room === id));
    zones.forEach(z => z.classList.toggle('on', z.dataset.zone === id));
  };
  spots.forEach(s => s.addEventListener('click', () => show(s.dataset.spot)));
  show('terrasse');
}
