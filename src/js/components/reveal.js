// Apparitions au scroll (ajoute .in une seule fois)
export function initReveal() {
  const els = document.querySelectorAll('[data-reveal],[data-wobble],[data-stop],[data-postcard]');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  els.forEach(el => io.observe(el));
}
