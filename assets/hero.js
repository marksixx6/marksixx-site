(() => {
  const page = document.getElementById('page');
  const shadow = document.getElementById('shadow');
  const figure = document.getElementById('figure');
  const guy = document.getElementById('guy');
  const light = document.getElementById('light');
  const marks = [...document.querySelectorAll('.mark')];
  const helpDesk = document.querySelector('.helper-desk');
  const hlLabel = helpDesk && helpDesk.querySelector('.hl-label');
  const hlDesc = helpDesk && helpDesk.querySelector('.hl-desc');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverMode = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

  const SPEED = 360 / 50;            // degrees per second: one turn every 50 s
  const REST = 0;                    // css rotation 0 = shadow points at 6
  const toRot = h => h * 30 - 180;   // clock hour -> css rotation of the shadow
  let rot = REST, mode = 'intro';    // intro | spin | seek | hold
  let tween = null, resumeTimer = null, spinStart = 0, last = performance.now();

  const setRot = a => { rot = a; shadow.style.setProperty('--rot', a.toFixed(3) + 'deg'); };
  const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  const easeSine = t => -(Math.cos(Math.PI * t) - 1) / 2;
  const clamp01 = t => Math.max(0, Math.min(1, t));
  const lerp = (a, b, t) => a + (b - a) * t;

  function seek(h, done) {
    const target = toRot(h);
    let d = ((target - rot) % 360 + 540) % 360 - 180;    // shortest way round
    if (reduce) { setRot(rot + d); mode = 'hold'; done && done(); return; }
    const from = rot, dur = Math.min(900, 380 + Math.abs(d) * 2.4), t0 = performance.now();
    mode = 'seek';
    tween = { from, d, dur, t0, done };
  }

  function frame(now) {
    const dt = Math.min(64, now - last) / 1000; last = now;
    if (mode === 'spin') {
      const ramp = clamp01((now - spinStart) / 1400);         // soft start
      setRot(rot + SPEED * dt * ramp);
    } else if (mode === 'seek' && tween) {
      const t = clamp01((now - tween.t0) / tween.dur);
      setRot(tween.from + tween.d * ease(t));
      if (t >= 1) { const cb = tween.done; tween = null; mode = 'hold'; cb && cb(); }
    }
    requestAnimationFrame(frame);
  }

  function startSpin() {
    if (reduce) { mode = 'hold'; return; }
    spinStart = performance.now(); mode = 'spin';
  }

  // ---------- service markers ----------
  function activate(m) {
    marks.forEach(x => x.classList.toggle('is-active', x === m));
    if (helpDesk) {
      if (m) { hlLabel.textContent = m.dataset.label; hlDesc.textContent = m.dataset.desc; helpDesk.classList.add('on'); }
      else { hlLabel.textContent = 'Hover to explore'; hlDesc.textContent = ''; helpDesk.classList.remove('on'); }
    }
  }
  function preview(m) {
    if (mode === 'intro') finishIntro();
    clearTimeout(resumeTimer);
    activate(m);
    seek(+m.dataset.h);
  }
  function release() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { activate(null); startSpin(); }, 900);
  }
  marks.forEach(m => {
    m.addEventListener('mouseenter', () => { if (hoverMode()) preview(m); });
    m.addEventListener('mouseleave', () => { if (hoverMode()) release(); });
    m.addEventListener('focus', () => preview(m));
    m.addEventListener('blur', () => { if (window.MXSheet && window.MXSheet.isOpen()) return; release(); });
    m.addEventListener('click', e => {
      if (hoverMode()) return;                 // desktop: click goes straight to the page
      e.preventDefault();                      // phone: the shadow swings there, then a sheet opens on this page
      if (mode === 'intro') finishIntro();
      clearTimeout(resumeTimer);
      activate(m);
      seek(+m.dataset.h);
      if (window.MXSheet) window.MXSheet.open(+m.dataset.h, reduce ? 0 : 380);
    });
  });

  // coming back with the back button (bfcache): reset
  addEventListener('pageshow', e => {
    if (e.persisted) { activate(null); if (mode !== 'intro') startSpin(); }
  });
  // the sheet hands the clock back when it closes
  window.MXClock = { release: () => { clearTimeout(resumeTimer); resumeTimer = setTimeout(() => { activate(null); startSpin(); }, 500); },
                     point: h => { if (mode === 'intro') finishIntro(); clearTimeout(resumeTimer); const m = marks.find(x => +x.dataset.h === h); if (m) activate(m); seek(h); } };

  // ---------- entrance ----------
  const lis = [...document.querySelectorAll('.marks li')];
  let introRaf = 0, introDone = false;
  const WALK = () => Math.max(30, Math.min(50, (figure.parentElement.clientWidth || 400) * 0.06));

  function finishIntro() {
    if (introDone) return; introDone = true;
    cancelAnimationFrame(introRaf);
    figure.style.setProperty('--walk', '0px');
    guy.style.setProperty('--sway', '0deg');
    shadow.style.setProperty('--slen', '1'); shadow.style.setProperty('--sop', '');
    setRot(REST);
    page.classList.add('s-eyebrow', 's-head', 's-help');
    lis.forEach(li => li.classList.add('in'));
    page.classList.remove('intro');
    light.style.opacity = '';
    if (mode === 'intro') mode = 'hold';
  }

  function intro() {
    const t0 = performance.now(), walk = WALK();
    const fired = {};
    const at = (key, t, fn, el) => { if (!fired[key] && el >= t) { fired[key] = 1; fn(); } };
    function step(now) {
      const t = (now - t0) / 1000;
      // spotlight: from the upper right into the centre, opening up, then the veil lifts
      const p = easeSine(clamp01((t - 0.3) / 1.5));
      light.style.setProperty('--lx', lerp(92, 58, p) + '%');
      light.style.setProperty('--ly', lerp(4, 40, p) + '%');
      light.style.setProperty('--lr0', lerp(0, 16, p) + '%');
      light.style.setProperty('--lr1', lerp(9, 46, p) + '%');
      light.style.opacity = String(1 - easeSine(clamp01((t - 1.55) / 0.8)));
      // two slow steps forward, then he stops for good
      const s1 = easeSine(clamp01((t - 0.5) / 0.45)), s2 = easeSine(clamp01((t - 1.02) / 0.48));
      const prog = (s1 + s2) / 2;
      figure.style.setProperty('--walk', (walk * (1 - prog)).toFixed(2) + 'px');
      const sway = (t > 0.5 && t < 0.95) ? Math.sin(s1 * Math.PI) * 1.2 : (t > 1.02 && t < 1.5) ? -Math.sin(s2 * Math.PI) * 1.2 : 0;
      guy.style.setProperty('--sway', sway.toFixed(2) + 'deg');
      // the shadow appears with the light, lengthens and settles on 6
      const sp = easeSine(clamp01((t - 0.75) / 0.85));
      shadow.style.setProperty('--sop', (0.9 * sp).toFixed(3));
      shadow.style.setProperty('--slen', (0.55 + 0.45 * sp).toFixed(3));
      setRot(REST - 16 * (1 - sp));
      at('e', 1.2, () => page.classList.add('s-eyebrow'), t);
      at('h', 1.65, () => page.classList.add('s-head'), t);
      lis.forEach((li, i) => at('m' + i, 1.9 + i * 0.06, () => li.classList.add('in'), t));
      at('help', 2.3, () => page.classList.add('s-help'), t);
      if (t < 2.45) introRaf = requestAnimationFrame(step);
      else { finishIntro(); startSpin(); }
    }
    introRaf = requestAnimationFrame(step);
  }

  // coming back from a page of this site (back button, or a link home) skips the entrance:
  // it plays once per visit, not every time you return to the clock
  let returning = false;
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    const sameSite = document.referrer && new URL(document.referrer).origin === location.origin;
    returning = sessionStorage.getItem('mx-intro-seen') === '1' && ((nav && nav.type === 'back_forward') || sameSite);
  } catch (_) {}
  const markSeen = () => { try { sessionStorage.setItem('mx-intro-seen', '1'); } catch (_) {} };
  if (reduce) { finishIntro(); mode = 'hold'; markSeen(); }
  else if (returning) { page.classList.add('snap'); finishIntro(); startSpin(); requestAnimationFrame(() => requestAnimationFrame(() => page.classList.remove('snap'))); }
  else { intro(); setTimeout(markSeen, 2500); }
  requestAnimationFrame(frame);
})();
