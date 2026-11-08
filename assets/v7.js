/* v7 (Nov 3 2026): offer bar offset on home, founding-offer prefill on Contact, "See your business with us" preview.
   The preview runs entirely in the browser: nothing typed or uploaded is sent anywhere. */
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // ---- home: the fixed header rides just below the offer bar until the bar has scrolled away ----
  const bar = document.querySelector('.offer-bar');
  if (bar && document.body.classList.contains('is-home')) {
    const root = document.documentElement; let raf = 0;
    const set = () => { raf = 0; root.style.setProperty('--ob', Math.max(0, bar.offsetHeight - scrollY) + 'px'); };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(set); }, { passive: true });
    addEventListener('resize', set); set();
  }
  // ---- contact: arriving from the offer bar fills the message ----
  const f = document.getElementById('cform');
  if (f && /[?&]offer=founding/.test(location.search)) {
    const m = f.querySelector('textarea[name=msg]');
    if (m && !m.value) m.value = 'I’d like the founding client offer (30% off the first month).';
  }

  // ---- the preview ----
  const WA = 'https://wa.me/18455403982?text=';
  const CATS = [
    [/dental|dentist|ortho|smile/i, 'Dentist', 'Gentle, modern care for the whole family.', 'A brighter smile starts here.', 'New patients welcome', '3 tips for healthy teeth'],
    [/realt|real estate|homes?\b|propert|mortgage/i, 'Real estate', 'Homes in our community. Let’s find yours.', 'The right home changes everything.', 'Just listed', '3 tips before you buy'],
    [/kosher|pizza|grill|cafe|café|bakery|bake|deli|sushi|catering|restaurant|kitchen|food|corner|bagel/i, 'Restaurant', 'Fresh, kosher and made with care, every day.', 'Good food brings people together.', 'New on the menu', '3 picks for this week'],
    [/law|legal|attorney|cpa|account|tax|finance|insur|capital|fund/i, 'Professional services', 'Clear advice from people you can trust.', 'Peace of mind is our job.', 'Now taking new clients', '3 things to check this year'],
    [/salon|beauty|wig|spa|nails|makeup|sheitel|bridal/i, 'Beauty', 'Look your best for every simcha.', 'Made to make you feel like you.', 'New season, new looks', '3 tips for simcha season'],
    [/construct|renov|plumb|electric|hvac|roof|contract|restor|clean|glass|kitchens/i, 'Home services', 'Done right, on time, every time.', 'Quality you can see.', 'Now booking', '3 signs it’s time to call'],
    [/clinic|medical|health|therapy|pharm|doctor|pediatr|optic/i, 'Health', 'Caring for our community, every day.', 'Your health, in good hands.', 'Now open late', '3 habits for better health'],
    [/school|tutor|learn|academy|camp|yeshiva/i, 'Education', 'Helping every child grow.', 'Every child can shine.', 'Registration now open', '3 tips for the new term'],
    [/./, 'Local business', 'Quality and service you can count on.', 'Done with care, every time.', 'Now open', '3 things to know']
  ];
  const SVG = {
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.1"/>', star: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>',
    img: '<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="m3.5 16 5-5 4 4 3-3 5 5"/>', tag: '<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3-8.7 8.7z"/><circle cx="8" cy="8" r="1.4"/>',
    chat: '<path d="M20 12a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4A8 8 0 1 1 20 12z"/>', grid: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M9.3 4v16M14.7 4v16M4 9.3h16M4 14.7h16"/>',
    reel: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M4 9h16M9 4l2 5M14 4l2 5M10.5 12.2v4.6l4-2.3z"/>', user: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="10.5" r="2.6"/><path d="M7.5 19c.8-2.6 2.5-3.8 4.5-3.8s3.7 1.2 4.5 3.8"/>',
    car: '<rect x="7" y="7" width="13" height="13" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>', back: '<path d="M15 5l-7 7 7 7"/>', dots: '<circle cx="5.5" cy="12" r=".9"/><circle cx="12" cy="12" r=".9"/><circle cx="18.5" cy="12" r=".9"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>', wa: '<path d="M20 12a8 8 0 0 1-11.8 7l-4.2 1.1 1.1-4A8 8 0 1 1 20 12z"/><path d="M9.3 8.4c.6-.5 1.2-.3 1.4.2l.6 1.4c.1.3 0 .5-.2.7l-.4.5c.5 1.2 1.4 2.1 2.6 2.6l.5-.4c.2-.2.4-.3.7-.2l1.4.6c.5.2.7.8.2 1.4-.6.7-1.6.9-2.5.6a7.4 7.4 0 0 1-4.6-4.6c-.3-.9-.1-1.9.3-2.8z"/>'
  };
  const sv = (k, c = '') => `<svg viewBox="0 0 24 24"${c ? ` class="${c}"` : ''} aria-hidden="true">${SVG[k]}</svg>`;
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const STOP = /^(the|and|of|&|a|an|llc|inc|co|ltd)$/i;
  const words = n => n.split(/[\s\-_/.,]+/).filter(Boolean);
  const initials = n => { const w = words(n).filter(x => !STOP.test(x)); const s = (w.length ? w : words(n)).slice(0, 2).map(x => x[0]).join(''); return (s || 'Y').toUpperCase(); };
  const handle = n => { const h = n.normalize('NFKD').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ''); return (h || 'yourbusiness').slice(0, 30); };
  const hex2rgb = h => { const m = h.replace('#', ''); const v = parseInt(m.length === 3 ? m.replace(/./g, '$&$&') : m, 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; };
  const lum = h => { const [r, g, b] = hex2rgb(h).map(x => { x /= 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
  const shade = (h, k) => '#' + hex2rgb(h).map(x => Math.round(x * k).toString(16).padStart(2, '0')).join('');

  const status = '<div class="mx-st"><span>9:41</span><i><b style="width:3px;height:5px"></b><b style="width:3px;height:7px"></b><b style="width:3px;height:9px"></b><b style="width:3px;height:11px"></b><b style="width:21px;height:10px;border-radius:3px;margin-left:5px"></b></i></div>';

  function after(st) {
    const { name, cat, logo } = st, n = esc(name), ini = esc(initials(name)), h = esc(handle(name));
    const av = logo ? `<img src="${logo}" alt="">` : ini;
    const hl = [['About', 'info'], ['Reviews', 'star'], ['Work', 'img'], ['Offers', 'tag'], ['Contact', 'chat']].map(([t, k]) => `<span><i><em>${sv(k)}</em></i>${t}</span>`).join('');
    const posts = [
      `<div class="tp tp-new"><span class="k">${esc(cat[4])}</span><span class="t">Now<br>open.</span><span class="s">${n}</span></div>`,
      `<div class="tp tp-quote"><span class="q">“</span><span class="t">${esc(cat[3])}</span><span class="bar"></span></div>`,
      `<div class="tp tp-brand"><span class="mk">${av}</span><span class="s">${n}</span></div>`,
      `<div class="tp tp-rev">${sv('car', 'ov')}<span class="stars">${sv('star').repeat(5)}</span><span class="ln"><i></i><i></i><i></i></span><span class="who"><b></b>Client review</span></div>`,
      `<div class="tp tp-team">${sv('reel', 'ov')}<span class="ppl"><i></i><i></i><i></i></span><span class="k">Behind the scenes</span><span class="t">Meet the team</span></div>`,
      `<div class="tp tp-offer"><span class="k">This week</span><span class="t">Ask about our <em>offer.</em></span><span class="pill">Message us</span></div>`,
      `<div class="tp tp-tips">${sv('car', 'ov')}<span class="k">Swipe</span><span class="t">3<small>${esc(cat[5].replace(/^3 /, ''))}</small></span><span class="s">${n}</span></div>`,
      `<div class="tp tp-shab"><span class="sp"><i></i><i></i></span><span class="t">Good Shabbos</span><span class="s">from all of us at ${n}</span></div>`,
      `<div class="tp tp-cta"><span class="k">Let’s talk</span><span class="t">Questions? We’re one message away.</span><span class="btn">${sv('wa')}WhatsApp</span></div>`
    ].map(p => `<div>${p}</div>`).join('');
    return `${status}<div class="mx-nav">${sv('back')}<span class="h">${h}</span>${sv('bell')}${sv('dots')}</div>
      <div class="mx-pro"><span class="mx-av"><span>${av}</span></span><div class="mx-pn"><p class="n">${n}</p><div class="mx-nums"><span><b>9</b>posts</span></div></div></div>
      <p class="mx-bio"><span class="cat">${esc(cat[1])}</span><br>${esc(cat[2])}<br>Message us to get started ↓</p>
      <div class="mx-btns"><span class="p">Follow</span><span>Message</span><span>WhatsApp</span></div>
      <div class="mx-hl">${hl}</div>
      <div class="mx-tabs"><span>${sv('grid')}</span><span>${sv('reel')}</span><span>${sv('user')}</span></div>
      <div class="mx-grid">${posts}</div>`;
  }
  function before(st) {
    const n = esc(st.name), h = esc(handle(st.name).slice(0, 22) + '_official1');
    const t = ['', 'SALE!!!', '', '', 'Thank u all!!', '', 'Call us for info!! 845-XXX', 'Closed Monday', ''];
    const posts = t.map((x, i) => `<div><div class="bf bf${i + 1}">${i === 2 ? '<i></i><i></i><i></i><i></i><i></i>' : esc(x)}</div></div>`).join('');
    return `${status}<div class="mx-nav">${sv('back')}<span class="h">${h}</span>${sv('dots')}</div>
      <div class="mx-pro"><span class="mx-av"><span>?</span></span><div class="mx-pn"><p class="n">${n}</p><div class="mx-nums"><span><b>9</b>posts</span></div></div></div>
      <p class="mx-bio">Welcome to our page!!! 🙂🙂<br>dm for info</p>
      <div class="mx-btns"><span class="p">Follow</span><span>Message</span></div>
      <div class="mx-hl"><span><i><em>${sv('img')}</em></i>New</span><span><i><em>${sv('img')}</em></i>Highlights</span></div>
      <div class="mx-tabs"><span>${sv('grid')}</span><span>${sv('reel')}</span><span>${sv('user')}</span></div>
      <div class="mx-grid">${posts}</div>
      <p class="mx-old"><b>Before:</b> no clear bio, no easy way to reach you, and posts that don’t look like one brand.</p>`;
  }

  $$('[data-mx]').forEach(root => {
    const inp = root.querySelector('.mx-in'), A = root.querySelector('.mx-after'), B = root.querySelector('.mx-before');
    const cta = root.querySelector('.mx-wa'), file = root.querySelector('.mx-file'), rm = root.querySelector('.mx-rm');
    const pick = root.querySelector('.mx-pick'), pickIn = pick && pick.querySelector('input');
    const st = { name: 'Your Business', color: '#2E5FC2', logo: '', view: 'after' };
    let t = 0;
    const paint = () => {
      const raw = inp.value.trim().replace(/\s+/g, ' ');
      st.name = raw || 'Your Business';
      st.cat = CATS.find(c => c[0].test(raw || 'x'));
      root.style.setProperty('--c', st.color);
      root.style.setProperty('--c2', shade(st.color, .62));
      root.style.setProperty('--ct', lum(st.color) > .45 ? '#141415' : '#ffffff');
      A.innerHTML = after(st); B.innerHTML = before(st);
      const msg = `Hi Marksixx, I just previewed ${raw || 'my business'} on your site and I want this for real.`;
      cta.href = WA + encodeURIComponent(msg);
    };
    inp.addEventListener('input', () => { cancelAnimationFrame(t); t = requestAnimationFrame(paint); });
    const sws = $$('.mx-sw button', root);
    const choose = (c, btn) => { st.color = c; sws.forEach(b => b.setAttribute('aria-pressed', b === btn)); if (pick) pick.classList.toggle('on', !btn); paint(); };
    sws.forEach(b => b.addEventListener('click', () => choose(b.dataset.c, b)));
    if (pickIn) pickIn.addEventListener('input', () => { pick.style.setProperty('--s', pickIn.value); choose(pickIn.value, null); });
    file.addEventListener('change', () => {
      const f = file.files && file.files[0]; if (!f) return;
      if (!/^image\//.test(f.type) || f.size > 10e6) { file.value = ''; return; }
      const r = new FileReader();
      r.onload = () => { st.logo = r.result; rm.hidden = false; paint(); };
      r.readAsDataURL(f); // stays in this browser tab; never uploaded
    });
    rm.addEventListener('click', () => { st.logo = ''; file.value = ''; rm.hidden = true; paint(); });
    // before / after drag slider
    const ph = root.querySelector('.mx-phone'), hdl = root.querySelector('.mx-hdl');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let pos = 50, pulsed = false, swept = false, drag = false, raf2 = 0;
    const setPos = p => {
      pos = Math.max(0, Math.min(100, p)); ph.style.setProperty('--pos', pos + '%'); hdl.setAttribute('aria-valuenow', Math.round(pos));
      ph.classList.toggle('lo', pos < 14); ph.classList.toggle('hi', pos > 86);
      if (!pulsed && pos < 22) { pulsed = true; cta.classList.remove('pulse'); void cta.offsetWidth; cta.classList.add('pulse'); }
    };
    const fromX = x => { const r = ph.getBoundingClientRect(); return (x - r.left) / r.width * 100; };
    ph.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button) return; drag = true; cancelAnimationFrame(raf2); swept = true; if (e.target === hdl || e.pointerType === 'mouse') { ph.setPointerCapture(e.pointerId); setPos(fromX(e.clientX)); } else { drag = 'touch'; ph._x = e.clientX; ph._y = e.clientY; } });
    ph.addEventListener('pointermove', e => {
      if (!drag) return;
      if (drag === 'touch') { if (Math.abs(e.clientX - ph._x) > 6 && Math.abs(e.clientX - ph._x) > Math.abs(e.clientY - ph._y)) { drag = true; try { ph.setPointerCapture(e.pointerId); } catch (_) {} } else return; }
      setPos(fromX(e.clientX));
    });
    const end = () => { drag = false; };
    ph.addEventListener('pointerup', end); ph.addEventListener('pointercancel', end);
    hdl.addEventListener('keydown', e => { const d = { ArrowLeft: -5, ArrowRight: 5, Home: -100, End: 100 }[e.key]; if (d) { e.preventDefault(); swept = true; cancelAnimationFrame(raf2); setPos(pos + d); } });
    // one gentle sweep the first time it is seen, so people know they can drag it
    const sweep = () => {
      if (swept) return; swept = true;
      if (reduce) { setPos(18); return; }
      const keys = [[0, 50], [700, 82], [1600, 14], [2300, 30]], T = 2300; let t0 = 0;
      const ease = x => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
      const step = ts => { if (!t0) t0 = ts; const t = Math.min(T, ts - t0); let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
        const [ta, pa] = keys[i], [tb, pb] = keys[i + 1]; setPos(pa + (pb - pa) * ease(Math.min(1, (t - ta) / (tb - ta)))); if (t < T) raf2 = requestAnimationFrame(step); };
      raf2 = requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); setTimeout(sweep, 350); } }, { threshold: 0.6 }); io.observe(ph); }
    setPos(50);
    paint();
  });
})();
