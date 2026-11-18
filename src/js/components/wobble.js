// Titres « peints à la main » : chaque lettre reçoit un petit décalage, toujours le même
export function initWobble() {
  document.querySelectorAll('[data-wobble]').forEach((el, n) => {
    let seed = 7 + n * 13;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    let k = 0;
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(word => {
            if (!word) return;
            if (/^\s+$/.test(word)) { frag.append(word); return; }
            const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            [...word].forEach(c => {
              const s = document.createElement('span'); s.className = 'ch'; s.textContent = c;
              s.style.cssText = `--y:${((rnd() - .5) * .08).toFixed(3)}em;--r:${((rnd() - .5) * 5).toFixed(2)}deg;--k:${k++}`;
              w.append(s);
            });
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && !child.classList.contains('sr-only')) walk(child);
      });
    };
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    walk(el);
    el.setAttribute('aria-label', label);
  });
}
