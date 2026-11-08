/* v9 (Nov 3 2026): Work as project stacks. Tap a tile -> a viewer you can swipe / arrow through, with "2 / 5". */
(() => {
  const el = document.getElementById('w9data'), lb = document.getElementById('lb9');
  if (!el || !lb) return;
  const P = JSON.parse(el.textContent);
  const track = lb.querySelector('.lb9-track'), ct = lb.querySelector('.lb9-ct'), dots = lb.querySelector('.lb9-dots');
  const prev = lb.querySelector('.lb9-prev'), next = lb.querySelector('.lb9-next');
  const T = { c: lb.querySelector('.lb9-c'), t: lb.querySelector('.lb9-t'), d: lb.querySelector('.lb9-d'), dt: lb.querySelector('.lb9-dt') };
  const fmt = s => { if (!s) return ''; const d = new Date(s + 'T12:00:00'); return isNaN(d) ? s : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); };
  let cur = null, at = 0, last = null, raf = 0;
  const show = i => {
    const n = cur.i.length; at = Math.max(0, Math.min(n - 1, i));
    ct.textContent = n > 1 ? `${at + 1} / ${n}` : '';
    prev.hidden = next.hidden = n < 2; prev.disabled = at === 0; next.disabled = at === n - 1;
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k === at));
    const im = track.children[at]; if (im) { const img = im.querySelector('img'); if (img && !img.src) img.src = img.dataset.src; const nb = track.children[at + 1]; if (nb) { const x = nb.querySelector('img'); if (!x.src) x.src = x.dataset.src; } }
  };
  const go = i => { const s = track.children[Math.max(0, Math.min(cur.i.length - 1, i))]; if (s) track.scrollTo({ left: s.offsetLeft, behavior: 'smooth' }); };
  const open = (k, btn) => {
    cur = P[k]; last = btn;
    track.innerHTML = cur.i.map((x, j) => `<figure class="lb9-s"><img data-src="${x.s}" alt="${(cur.c + ': ' + (x.cap || cur.t)).replace(/"/g, '&quot;')}" ${x.w ? `width="${x.w}" height="${x.h}"` : ''} decoding="async"></figure>`).join('');
    dots.innerHTML = cur.i.length > 1 ? cur.i.map(() => '<i></i>').join('') : '';
    T.c.textContent = cur.c.includes(' · ') ? cur.c : [cur.c, cur.k].filter(Boolean).join(' · ');
    T.t.textContent = cur.t; T.d.textContent = cur.d || ''; T.dt.textContent = fmt(cur.dt);
    lb.hidden = false; document.body.classList.add('lock'); track.scrollLeft = 0; show(0);
    setTimeout(() => lb.querySelector('.lb9-x').focus(), 30);
  };
  const close = () => { lb.hidden = true; document.body.classList.remove('lock'); track.innerHTML = ''; if (last) last.focus(); };
  document.querySelectorAll('.w9-btn').forEach(b => b.addEventListener('click', () => open(+b.dataset.p, b)));
  lb.querySelector('.lb9-x').addEventListener('click', close);
  prev.addEventListener('click', () => go(at - 1)); next.addEventListener('click', () => go(at + 1));
  track.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const w = track.clientWidth || 1; show(Math.round(track.scrollLeft / w)); }); }, { passive: true });
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb9-s')) close(); });
  addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') go(at + 1); if (e.key === 'ArrowLeft') go(at - 1); });
})();
