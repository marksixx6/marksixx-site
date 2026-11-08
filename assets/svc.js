(() => {
  // back goes to where you were on the clock (instant, no reload, no intro) when you came from it
  document.querySelectorAll('[data-back]').forEach(a => a.addEventListener('click', e => {
    try { if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); } } catch (_) {}
  }));
  const lb = document.getElementById('lb'), img = document.getElementById('lbImg'), cap = document.getElementById('lbCap');
  document.querySelectorAll('.w-btn').forEach(b => b.addEventListener('click', () => { img.src = b.dataset.full; img.alt = b.dataset.cap; cap.textContent = b.dataset.cap; lb.hidden = false; document.body.classList.add('lock'); }));
  lb.addEventListener('click', e => { if (e.target !== img) { lb.hidden = true; document.body.classList.remove('lock'); } });
  addEventListener('keydown', e => { if (e.key === 'Escape') { lb.hidden = true; document.body.classList.remove('lock'); } });
})();
