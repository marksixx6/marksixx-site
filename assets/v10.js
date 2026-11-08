/* v10: Why every day matters — scroll timeline + count-up (additions only) */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-ed]').forEach(tl => {
    const steps = [...tl.querySelectorAll('.ed-step')], line = tl.querySelector('.ed-line'), fill = line && line.querySelector('i');
    if (reduce || !fill) { steps.forEach(s => s.classList.add('on')); if (fill) fill.style.setProperty('--p', 1); return; }
    let tick = false, vis = false;
    const upd = () => {
      tick = false;
      const vh = innerHeight, r = tl.getBoundingClientRect(), horiz = innerWidth >= 900;
      const a = horiz ? r.top - vh * 0.85 : r.top - vh * 0.78;
      const span = horiz ? vh * 0.42 : Math.max(1, r.height - vh * 0.42);
      const p = Math.min(1, Math.max(0, -a / span));
      fill.style.setProperty('--p', p.toFixed(4));
      const n = steps.length - 1;
      steps.forEach((s, i) => { if (p >= (n ? i / n : 0) - 0.02) s.classList.add('on'); else s.classList.remove('on'); });
    };
    const req = () => { if (!tick && vis) { tick = true; requestAnimationFrame(upd); } };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; if (vis) req(); }), { rootMargin: '20% 0px 20% 0px' }).observe(tl);
    } else vis = true;
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', req);
    vis = true; upd(); vis = false;
  });
  const cnts = document.querySelectorAll('.ed-cnt');
  if (reduce || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const el = e.target, raw = el.dataset.to, m = raw.match(/^([\d.]+)(\D*)$/); if (!m) return;
    const to = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, suf = m[2], t0 = performance.now(), D = 1300;
    const step = t => { const k = Math.min(1, (t - t0) / D), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec) + suf; if (k < 1) requestAnimationFrame(step); else el.textContent = raw; };
    el.textContent = (0).toFixed(dec) + suf; requestAnimationFrame(step);
  }), { threshold: 0.6 });
  cnts.forEach(c => io.observe(c));
})();
