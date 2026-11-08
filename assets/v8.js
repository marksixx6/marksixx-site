/* v8 (Nov 3 2026): Real results — videos load only when scrolled into view, play muted + inline + looping; tap for sound. */
(() => {
  const cards = [...document.querySelectorAll('.rr-card[data-rr]')];
  if (!cards.length) return;
  const vids = new Map(), inView = new Set();
  const load = (c, v) => { if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); } };
  const silenceOthers = me => cards.forEach(c => { if (c !== me) { const v = vids.get(c); if (v) { v.muted = true; } c.classList.remove('is-sound'); if (c.dataset.rr === 'click' && v && !v.paused) { v.pause(); c.classList.remove('is-playing'); } } });
  cards.forEach(c => {
    const v = c.querySelector('video'); if (!v) return; vids.set(c, v);
    v.muted = true; v.playsInline = true;
    const btn = c.querySelector('.rr-tap');
    if (c.dataset.rr === 'click') {
      // podcast: the thumbnail stays until tapped, then the 60 s preview plays inline with sound
      btn.addEventListener('click', () => {
        if (c.classList.contains('is-playing') && !v.paused) { v.pause(); c.classList.remove('is-playing', 'is-sound'); return; }
        load(c, v); silenceOthers(c); v.muted = false; c.classList.add('is-playing', 'is-sound');
        const p = v.play(); if (p && p.catch) p.catch(() => { v.muted = true; c.classList.remove('is-sound'); v.play().catch(() => {}); });
      });
      v.addEventListener('ended', () => c.classList.remove('is-playing', 'is-sound'));
      return;
    }
    btn.addEventListener('click', () => {
      load(c, v);
      if (v.muted) { silenceOthers(c); v.muted = false; c.classList.add('is-sound'); if (v.paused) v.play().catch(() => {}); }
      else { v.muted = true; c.classList.remove('is-sound'); }
    });
    v.addEventListener('playing', () => c.classList.add('is-playing'));
  });
  const auto = cards.filter(c => c.dataset.rr === 'auto' && vids.get(c));
  const click = cards.filter(c => c.dataset.rr === 'click' && vids.get(c));
  if (!('IntersectionObserver' in window)) { auto.forEach(c => { const v = vids.get(c); load(c, v); v.play().catch(() => {}); }); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    const c = e.target, v = vids.get(c);
    if (c.dataset.rr === 'click') { // the podcast preview only plays when tapped; it stops once it leaves the screen
      if (e.intersectionRatio < 0.3 && !v.paused) { v.pause(); c.classList.remove('is-playing', 'is-sound'); }
      return;
    }
    if (e.isIntersecting && e.intersectionRatio >= 0.55) { inView.add(c); load(c, v); const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    else { inView.delete(c); if (!v.paused) v.pause(); if (!v.muted) { v.muted = true; c.classList.remove('is-sound'); } }
  }), { threshold: [0, 0.3, 0.55, 0.9] });
  auto.concat(click).forEach(c => io.observe(c));
  document.addEventListener('visibilitychange', () => { if (document.hidden) vids.forEach(v => { if (!v.paused) v.pause(); }); else inView.forEach(c => vids.get(c).play().catch(() => {})); });
})();
