(() => {
  const D = window.MX_DATA || { services: {} };
  const $ = id => document.getElementById(id);
  const sheet = $('sheet'), bg = $('sheetBg');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverMode = () => matchMedia('(hover: hover) and (pointer: fine)').matches;
  let openH = null, openTimer = 0;

  // ---------- bottom sheet ----------
  function fill(h) {
    const s = D.services[h]; if (!s) return;
    $('sheetK').innerHTML = h === 6 ? '<img src="/assets/six.png" alt="">The full team' : h + ' o’clock';
    $('sheetTitle').textContent = s.name;
    $('sheetD').textContent = s.line;
    const tiles = (s.tiles || []).slice(0, 3);
    let html = tiles.map(t => '<div class="st"><img src="/assets/work/' + t.file + '" alt="' + t.alt.replace(/"/g, '&quot;') + '" loading="lazy"></div>').join('');
    for (let i = tiles.length; i < 3; i++) html += '<div class="st st-ph">Example<br>coming</div>';
    $('sheetTiles').innerHTML = html;
    $('sheetGo').href = '/' + s.slug + '/';
    $('sheetWa').href = s.wa;
  }
  function open(h, delay) {
    clearTimeout(openTimer);
    fill(h); openH = h;
    sheet.hidden = false; bg.hidden = false;
    sheet.style.setProperty('--drag', '0px');
    openTimer = setTimeout(() => {
      requestAnimationFrame(() => { sheet.classList.add('on'); bg.classList.add('on'); });
    }, delay || 0);
  }
  function close() {
    if (openH === null) return;
    clearTimeout(openTimer);
    openH = null;
    sheet.classList.remove('on'); bg.classList.remove('on');
    setTimeout(() => { if (openH === null) { sheet.hidden = true; bg.hidden = true; } }, reduce ? 0 : 420);
    if (window.MXClock) window.MXClock.release();
  }
  window.MXSheet = { open, close, isOpen: () => openH !== null };
  bg.addEventListener('click', close);
  $('sheetX').addEventListener('click', close);
  addEventListener('keydown', e => { if (e.key === 'Escape') { close(); closeLb(); } });
  // drag the sheet down to dismiss
  let y0 = null, dy = 0;
  sheet.addEventListener('touchstart', e => { if (e.target.closest('a,button')) return; y0 = e.touches[0].clientY; dy = 0; sheet.classList.add('dragging'); }, { passive: true });
  sheet.addEventListener('touchmove', e => { if (y0 === null) return; dy = Math.max(0, e.touches[0].clientY - y0); sheet.style.setProperty('--drag', dy + 'px'); }, { passive: true });
  sheet.addEventListener('touchend', () => { if (y0 === null) return; sheet.classList.remove('dragging'); y0 = null; if (dy > 70) close(); else sheet.style.setProperty('--drag', '0px'); });

  // the services list: phone = same sheet (and the shadow points at it), desktop = straight to the page
  document.querySelectorAll('.svc').forEach(a => a.addEventListener('click', e => {
    if (hoverMode()) return;
    e.preventDefault();
    const h = +a.dataset.h;
    if (window.MXClock) window.MXClock.point(h);
    open(h, 0);
  }));

  // ---------- work lightbox ----------
  const lb = $('lb'), lbImg = $('lbImg'), lbCap = $('lbCap');
  function closeLb() { if (lb.hidden) return; lb.hidden = true; document.body.classList.remove('lock'); }
  document.querySelectorAll('.w-btn').forEach(b => b.addEventListener('click', () => {
    lbImg.src = b.dataset.full; lbImg.alt = b.dataset.cap; lbCap.textContent = b.dataset.cap;
    lb.hidden = false; document.body.classList.add('lock');
  }));
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });

  // ---------- header backing + bottom bar state ----------
  const top = document.querySelector('.top'), hero = $('home');
  const onScroll = () => top.classList.toggle('solid', scrollY > hero.offsetHeight - 90);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const tabs = [...document.querySelectorAll('.tabbar a[data-sec]')];
  const secs = tabs.map(t => document.getElementById(t.dataset.sec)).filter(Boolean);
  const setOn = id => tabs.forEach(t => { const on = t.dataset.sec === id; t.classList.toggle('on', on); on ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current'); });
  const spy = () => {
    const mid = innerHeight * 0.45; let cur = 'home', best = -Infinity;
    for (const s of secs) { const t = s.getBoundingClientRect().top; if (t <= mid && t > best) { best = t; cur = s.id; } }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = secs[secs.length - 1].id;
    setOn(cur);
  };
  addEventListener('scroll', spy, { passive: true }); spy();
  tabs.forEach(t => t.addEventListener('click', e => {
    const el = document.getElementById(t.dataset.sec); if (!el) return;
    e.preventDefault(); close();
    const go = () => {
      const y = t.dataset.sec === 'home' ? 0 : Math.round(el.getBoundingClientRect().top + scrollY - (innerWidth >= 900 ? 80 : 72));
      if (Math.abs(y - scrollY) > 3) scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    };
    go();
    // a smooth scroll can land a little short while images settle above; correct once it stops
    let done = false; const fix = () => { if (done) return; done = true; go(); };
    addEventListener('scrollend', fix, { once: true }); setTimeout(fix, 1600);
    history.replaceState(null, '', t.dataset.sec === 'home' ? location.pathname : '#' + t.dataset.sec);
  }));

  // ---------- coming back: keep the place you were ----------
  addEventListener('pagehide', () => { try { sessionStorage.setItem('mx-scroll', String(scrollY)); } catch (_) {} });
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    const y = +sessionStorage.getItem('mx-scroll');
    if (nav && nav.type === 'back_forward' && y > 0) addEventListener('load', () => { if (scrollY < 10) scrollTo(0, y); });
  } catch (_) {}
})();
