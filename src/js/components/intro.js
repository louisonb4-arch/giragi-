// Ouverture : l'enseigne se peint, le lettrage apparaît, puis le mur se lève
export function initIntro({ reduce }) {
  const intro = document.getElementById('intro');
  const body = document.body;
  const ready = () => body.classList.add('ready');
  if (!intro || reduce || sessionStorageGet('giragi-intro')) {
    intro?.classList.add('gone');
    ready();
    return;
  }
  body.classList.add('locked');
  const timers = [];
  let done = false;
  const open = () => {
    if (done) return; done = true;
    timers.forEach(clearTimeout);
    intro.classList.add('paint', 'letter', 'open');
    setTimeout(ready, 250);
    setTimeout(() => {
      intro.classList.add('gone');
      if (!body.classList.contains('menu-open')) body.classList.remove('locked');
    }, 1000);
    sessionStorageSet('giragi-intro', '1');
  };
  const start = () => {
    timers.push(setTimeout(() => intro.classList.add('paint'), 150));
    timers.push(setTimeout(() => intro.classList.add('letter'), 1050));
    timers.push(setTimeout(open, 2350));
  };
  (document.fonts?.ready ?? Promise.resolve()).then(start);
  setTimeout(open, 4500);                // filet de sécurité
  intro.addEventListener('click', open);  // tap pour passer
  addEventListener('keydown', open, { once: true });
}

// Une seule ouverture par visite (stockage parfois indisponible : on ignore)
function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch { /* rien */ } }
