// Carte postale : on la retourne, et le tampon porte la date du jour
export function initPostcard() {
  const root = document.querySelector('[data-postcard]');
  if (!root) return;
  const mark = root.querySelector('[data-postmark]');
  if (mark) mark.textContent = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  const btn = root.querySelector('[data-flip]');
  const front = root.querySelector('.postcard__front'), back = root.querySelector('.postcard__back');
  const flip = () => {
    const on = !root.classList.contains('flipped');
    root.classList.toggle('flipped', on);
    btn.setAttribute('aria-pressed', on);
    front.setAttribute('aria-hidden', !on);
    back.setAttribute('aria-hidden', on);
  };
  btn?.addEventListener('click', flip);
  root.querySelector('.postcard__inner').addEventListener('click', flip);
}
