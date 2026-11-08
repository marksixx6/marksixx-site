/* v9 (Nov 3 2026): v7 behaviour + the rebuilt preview (Generate button, build sequence, logo fit + watermark, custom slogans).
   v7 (Nov 3 2026): offer bar offset on home, founding-offer prefill on Contact, "See your business with us" preview.
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

  // ---- the preview (v9) ----
  const WA = 'https://wa.me/18455403982?text=';
  // keyword map: [test, category label, bio line, slogans[], "new" kicker, tips title, offer line]
  const CATS = [
    [/dental|dentist|ortho|smile|teeth/i, 'Dentist', 'Gentle, modern dental care for the whole family.', ['A brighter smile starts here.', 'Smiles made with care.', 'Your family’s smile, in good hands.'], 'New patients welcome', '3 tips for healthy teeth', 'Book your checkup'],
    [/realt|real estate|homes?\b|propert|mortgage|apartments?|estates?\b/i, 'Real estate', 'Helping families find the right home in our community.', ['The right home changes everything.', 'Your next home starts here.', 'Where your next chapter begins.'], 'Just listed', '3 tips before you buy', 'Book a viewing'],
    [/bakery|bake|bagel|cake|pastr|challah|donut|cookie/i, 'Bakery', 'Baked fresh every morning, from our ovens to your table.', ['Baked fresh. Every single day.', 'Life is better with fresh bread.', 'Fresh from our oven to your table.'], 'Fresh out of the oven', '3 treats for this week', 'Order for Shabbos'],
    [/kosher|glatt|chalav|heimish/i, 'Kosher food', 'Fresh, kosher and made with care, every day.', ['Fresh. Kosher. Made with love.', 'Kosher food the way it should be.', 'Your neighborhood kosher spot.'], 'New on the menu', '3 picks for this week', 'Order for Shabbos'],
    [/pizza|grill|cafe|café|deli|sushi|catering|restaurant|kitchen|food|bistro|burger|steak|shawarma|eatery/i, 'Restaurant', 'Good food, good people, made fresh every day.', ['Good food brings people together.', 'Made fresh. Served with a smile.', 'Come hungry, leave happy.'], 'New on the menu', '3 picks for this week', 'Reserve a table'],
    [/law|legal|attorney|lawyer|esq/i, 'Law firm', 'Clear legal advice from people you can trust.', ['Clear answers. Strong advocates.', 'On your side, every step.', 'Peace of mind starts here.'], 'Now taking new clients', '3 things to know this year', 'Book a consultation'],
    [/cpa|account|tax|financ|insur|capital|fund|wealth|bank|invest/i, 'Financial services', 'Clear, honest advice for your money and your business.', ['Your numbers, in good hands.', 'Clarity for every decision.', 'Plan today. Grow tomorrow.'], 'Now taking new clients', '3 things to check this year', 'Book a call'],
    [/fit|gym|train|yoga|pilates|crossfit|boxing|martial|quad/i, 'Fitness', 'Real training, real results, real accountability.', ['Stronger every week.', 'Your strongest self starts here.', 'Show up. We’ll do the rest.'], 'New classes', '3 moves to try this week', 'Book a free class'],
    [/salon|beauty|wig|spa|nails|makeup|sheitel|bridal|hair|lash|brow/i, 'Beauty', 'Look and feel your best for every simcha.', ['Made to make you feel like you.', 'Beauty, done with care.', 'Your look, perfected.'], 'New season, new looks', '3 tips for simcha season', 'Book your spot'],
    [/construct|contract|build|renov|plumb|electric|hvac|roof|restor|clean|glass|paint|floor|landscap|handyman|remodel/i, 'Contractor', 'Quality work, done right and on time.', ['Built right. Built to last.', 'Quality you can see.', 'Done right, on time, every time.'], 'Now booking', '3 signs it’s time to call', 'Get a free estimate'],
    [/clinic|medical|health|therapy|pharm|doctor|pediatr|optic|care\b|physio/i, 'Health', 'Caring for our community, every day.', ['Your health, in good hands.', 'Care you can count on.', 'Feel better, live better.'], 'Now open late', '3 habits for better health', 'Book a visit'],
    [/school|tutor|learn|academy|camp|yeshiva|seminary|preschool/i, 'Education', 'Helping every child learn, grow and shine.', ['Every child can shine.', 'Where great minds grow.', 'Learning that lasts.'], 'Registration now open', '3 tips for the new term', 'Register today'],
    [/shop|store|boutique|gift|judaica|furniture|jewel|toys|clothing|fashion|market/i, 'Shop', 'Hand-picked quality for you and your family.', ['Something special for everyone.', 'Quality you’ll love.', 'Find your favorite.'], 'New arrivals', '3 picks for this week', 'Shop now'],
    [/./, 'Local business', 'Quality and service you can count on.', ['Done with care, every time.', 'Quality you can count on.', 'Here for our community.'], 'Now open', '3 things to know', 'Message us']
  ];
  const hash = s => [...s.toLowerCase()].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
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

  const STEPS = ['Reading your business name…', 'Designing your profile…', 'Adding your brand colors…', 'Placing your logo…', 'Writing your bio…', 'Creating your posts…', 'Final touches…'];

  // logo -> trimmed, padded, centered square (contain, never cropped), on white or brand color
  function fitLogo(src, color) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => {
        try {
          const W = Math.min(im.naturalWidth, 1200), H = Math.round(im.naturalHeight * W / im.naturalWidth) || 1;
          const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true });
          x.drawImage(im, 0, 0, W, H); const d = x.getImageData(0, 0, W, H).data;
          const px = (i, j) => { const k = (j * W + i) * 4; return [d[k], d[k + 1], d[k + 2], d[k + 3]]; };
          const cs = [px(0, 0), px(W - 1, 0), px(0, H - 1), px(W - 1, H - 1)];
          const opaque = cs.every(p => p[3] > 240), near = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 40;
          const solid = opaque && cs.every(p => near(p, cs[0])); const bgc = cs[0];
          let x0 = W, y0 = H, x1 = -1, y1 = -1, lumSum = 0, n = 0;
          for (let j = 0; j < H; j += 1) for (let i = 0; i < W; i += 1) {
            const k = (j * W + i) * 4, a = d[k + 3];
            const ink = solid ? (a > 40 && !near([d[k], d[k + 1], d[k + 2]], bgc)) : a > 40;
            if (ink) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (j < y0) y0 = j; if (j > y1) y1 = j; if ((i + j) % 3 === 0) { lumSum += (.2126 * d[k] + .7152 * d[k + 1] + .0722 * d[k + 2]) / 255; n++; } }
          }
          if (x1 < 0) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
          const bw = x1 - x0 + 1, bh = y1 - y0 + 1, light = n ? lumSum / n : 0;
          // background: the logo's own solid background, else white, else (a white/light logo) the brand color
          const bg = solid ? `rgb(${bgc[0]},${bgc[1]},${bgc[2]})` : (light > .8 ? (lum(color) > .6 ? '#141415' : color) : '#ffffff');
          const S = 480, o = document.createElement('canvas'); o.width = o.height = S; const y = o.getContext('2d');
          y.fillStyle = bg; y.fillRect(0, 0, S, S);
          // the whole box fits inside the circle with breathing room: its diagonal stays within 80% of the diameter
          const k = Math.min(S * .80 / Math.hypot(bw, bh), S * .62 / Math.max(bw, bh) * (bw === bh ? 1.1 : 1.3));
          const dw = bw * k, dh = bh * k; y.imageSmoothingQuality = 'high';
          y.drawImage(c, x0, y0, bw, bh, (S - dw) / 2, (S - dh) / 2, dw, dh);
          res({ url: o.toDataURL('image/png'), bg });
        } catch (e) { rej(e); }
      };
      im.onerror = rej; im.src = src;
    });
  }
  function profile(name) {
    const raw = name.trim().replace(/\s+/g, ' ');
    const cat = CATS.find(c => c[0].test(raw || 'x'));
    const h = hash(raw || 'x'), slogan = cat[3][h % cat[3].length];
    return { cat, slogan, bio: cat[2] };
  }

  function after(st) {
    const { name, cat, slogan, logo } = st, n = esc(name), ini = esc(initials(name)), h = esc(handle(name)), sl = esc(slogan);
    const av = logo ? `<img src="${logo}" alt="">` : ini;
    const wm = `<span class="wm${logo ? ' wm-img' : ''}" aria-hidden="true">${logo ? `<img src="${logo}" alt="">` : ini}</span>`;
    const hl = [['About', 'info'], ['Reviews', 'star'], ['Work', 'img'], ['Offers', 'tag'], ['Contact', 'chat']].map(([t, k]) => `<span><i><em>${sv(k)}</em></i>${t}</span>`).join('');
    const posts = [
      `<div class="tp tp-new"><span class="k">${esc(cat[4])}</span><span class="t">Now<br>open.</span><span class="s">${n}</span></div>`,
      `<div class="tp tp-quote"><span class="q">“</span><span class="t">${sl}</span><span class="bar"></span></div>`,
      `<div class="tp tp-brand"><span class="mk${logo ? ' mk-img' : ''}">${av}</span><span class="s">${n}</span><span class="sl">${sl}</span></div>`,
      `<div class="tp tp-rev">${sv('car', 'ov')}<span class="stars">${sv('star').repeat(5)}</span><span class="ln"><i></i><i></i><i></i></span><span class="who"><b></b>Client review</span></div>`,
      `<div class="tp tp-team">${sv('reel', 'ov')}<span class="ppl"><i></i><i></i><i></i></span><span class="k">Behind the scenes</span><span class="t">Meet the team</span></div>`,
      `<div class="tp tp-offer"><span class="k">This week</span><span class="t">${esc(cat[6])}.</span><span class="pill">Message us</span></div>`,
      `<div class="tp tp-tips">${sv('car', 'ov')}<span class="k">Swipe</span><span class="t">3<small>${esc(cat[5].replace(/^3 /, ''))}</small></span><span class="s">${n}</span></div>`,
      `<div class="tp tp-shab"><span class="sp"><i></i><i></i></span><span class="t">Good Shabbos</span><span class="s">from all of us at ${n}</span></div>`,
      `<div class="tp tp-cta"><span class="k">Let’s talk</span><span class="t">Questions? We’re one message away.</span><span class="btn">${sv('wa')}WhatsApp</span></div>`
    ].map(p => `<div>${p.replace(/<\/div>$/, wm + '</div>')}</div>`).join('');
    return `${status}<div class="mx-nav">${sv('back')}<span class="h">${h}</span>${sv('bell')}${sv('dots')}</div>
      <div class="mx-pro"><span class="mx-av${logo ? ' has-logo' : ''}"><span${logo ? ` style="background:${st.logoBg}"` : ''}>${av}</span></span><div class="mx-pn"><p class="n">${n}</p><div class="mx-nums"><span><b>9</b>posts</span></div></div></div>
      <p class="mx-bio"><span class="cat">${esc(cat[1])}</span><br><b class="sl">${sl}</b><br>${esc(st.bio)}<br>${esc(cat[6])}, message us ↓</p>
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
    const up = root.querySelector('.mx-up'), got = root.querySelector('.mx-got'), th = got.querySelector('img'), chg = root.querySelector('.mx-chg');
    const gen = root.querySelector('.mx-gen'), err = root.querySelector('.mx-err'), load = root.querySelector('.mx-load');
    const bar = load.querySelector('.mx-bar i'), pc = load.querySelector('.mx-pc'), ol = load.querySelector('.mx-steps'), ready = load.querySelector('.mx-ready'), lt = load.querySelector('.mx-lt-t');
    const pick = root.querySelector('.mx-pick'), pickIn = pick && pick.querySelector('input');
    const ph = root.querySelector('.mx-phone'), hdl = root.querySelector('.mx-hdl'), stage = root.querySelector('.mx-stage');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const form = { color: '#2E5FC2', color2: '', logoRaw: '' };   // what the visitor has entered (not shown until Generate)
    const st = { name: 'Your Business', color: '#2E5FC2', color2: '', logo: '', logoBg: '#fff' };
    const paint = () => {
      const p = profile(st.name === 'Your Business' ? '' : st.name);
      Object.assign(st, p);
      root.style.setProperty('--c', st.color);
      root.style.setProperty('--c2', shade(st.color, .62));
      root.style.setProperty('--ct', lum(st.color) > .45 ? '#141415' : '#ffffff');
      const ac = st.color2 || st.color; root.classList.toggle('two', !!st.color2);
      root.style.setProperty('--a', ac); root.style.setProperty('--a2', shade(ac, .62)); root.style.setProperty('--at', lum(ac) > .45 ? '#141415' : '#ffffff');
      A.innerHTML = after(st); B.innerHTML = before(st);
      const nm = st.name === 'Your Business' ? 'my business' : st.name;
      cta.href = WA + encodeURIComponent(`Hi Marksixx, I just previewed ${nm} on your site and I want this for real.`);
    };
    const sws = $$('.mx-sw button', root);
    const choose = (c, btn) => { form.color = c; sws.forEach(b => b.setAttribute('aria-pressed', b === btn)); if (pick) pick.classList.toggle('on', !btn); dirty(); };
    sws.forEach(b => b.addEventListener('click', () => choose(b.dataset.c, b)));
    if (pickIn) pickIn.addEventListener('input', () => { pick.style.setProperty('--s', pickIn.value); choose(pickIn.value, null); });
    // v11: optional second brand colour (accent). One colour = exactly as before.
    const sw1 = root.querySelector('.mx-sw');
    if (sw1) {
      const add2 = document.createElement('button'); add2.type = 'button'; add2.className = 'mx-add2'; add2.textContent = '+ Add second color';
      const box2 = document.createElement('div'); box2.className = 'mx-c2'; box2.hidden = true;
      box2.innerHTML = '<div class="mx-c2-h"><span class="mx-lab" id="' + (sw1.getAttribute('aria-labelledby') || 'see-cl') + '-2">Second color</span><button type="button" class="mx-c2-x" aria-label="Remove second color">Remove &times;</button></div>'
        + '<div class="mx-sw mx-sw2" role="group" aria-label="Second color">' + [...sw1.querySelectorAll('button')].map(b => `<button type="button" style="--s:${b.dataset.c}" data-c="${b.dataset.c}" aria-label="${b.getAttribute('aria-label')}" aria-pressed="false"></button>`).join('')
        + '<label class="mx-pick" style="--s:#141415" title="Pick any color"><input type="color" value="#141415" aria-label="Pick any second color"></label></div>';
      sw1.insertAdjacentElement('afterend', add2); add2.insertAdjacentElement('afterend', box2);
      const sws2 = $$('button', box2.querySelector('.mx-sw2')), pick2 = box2.querySelector('.mx-pick'), pick2In = pick2.querySelector('input');
      const choose2 = (c, btn) => { form.color2 = c; sws2.forEach(b => b.setAttribute('aria-pressed', b === btn)); pick2.classList.toggle('on', !!c && !btn); dirty(); };
      sws2.forEach(b => b.addEventListener('click', () => choose2(b.dataset.c, b)));
      pick2In.addEventListener('input', () => { pick2.style.setProperty('--s', pick2In.value); choose2(pick2In.value, null); });
      add2.addEventListener('click', () => { box2.hidden = false; add2.hidden = true; const d = sws2.find(b => b.dataset.c !== form.color && b.dataset.c === '#1B2A41') || sws2.find(b => b.dataset.c !== form.color); choose2(d.dataset.c, d); });
      box2.querySelector('.mx-c2-x').addEventListener('click', () => { box2.hidden = true; add2.hidden = false; choose2('', null); pick2.classList.remove('on'); add2.focus(); });
    }
    let done = false;
    const dirty = () => { if (done && !busy) gen.firstChild.nodeValue = 'Update my preview '; err.hidden = true; };
    inp.addEventListener('input', dirty);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); gen.click(); } });
    const showLogo = on => { up.hidden = on; got.hidden = !on; if (on) th.src = form.logoRaw; };
    file.addEventListener('change', () => {
      const f = file.files && file.files[0]; if (!f) return;
      if (!/^image\//.test(f.type) || f.size > 10e6) { file.value = ''; return; }
      const r = new FileReader();
      r.onload = () => { form.logoRaw = r.result; showLogo(true); dirty(); };
      r.readAsDataURL(f); // stays in this browser tab; never uploaded
    });
    chg.addEventListener('click', () => file.click());
    rm.addEventListener('click', () => { form.logoRaw = ''; file.value = ''; showLogo(false); dirty(); });

    // ---- Generate: a ~10 s build sequence, then "Ready", then the phone ----
    let busy = false;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    gen.addEventListener('click', async () => {
      if (busy) return;
      const raw = inp.value.trim().replace(/\s+/g, ' ');
      if (!raw) { err.hidden = false; inp.focus(); inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake'); return; }
      busy = true; err.hidden = true; gen.disabled = true; gen.classList.add('is-busy');
      const steps = STEPS.map(s => s === 'Placing your logo…' && !form.logoRaw ? 'Making your profile picture…' : s);
      ol.innerHTML = steps.map(s => `<li><i aria-hidden="true"></i><span>${s}</span></li>`).join('');
      const lis = [...ol.children];
      load.style.setProperty('--c', form.color); load.hidden = false; ready.hidden = true; lt.textContent = `Building ${raw}…`; root.classList.add('is-building');
      // prepare the real result while the sequence plays
      const prep = (async () => {
        let logo = '', logoBg = '#fff';
        if (form.logoRaw) { try { const f = await fitLogo(form.logoRaw, form.color); logo = f.url; logoBg = f.bg; } catch (_) {} }
        return { logo, logoBg };
      })();
      const T = reduce ? 2500 : 10000, t0 = performance.now();
      await new Promise(resolve => {
        const tick = now => {
          const p = Math.min(1, (now - t0) / T), e = p < 1 ? 1 - Math.pow(1 - p, 1.6) * (1 - p * .15) : 1;
          bar.style.transform = `scaleX(${e.toFixed(4)})`; pc.textContent = Math.round(e * 100) + '%';
          const k = Math.min(lis.length, Math.floor(p * lis.length + .0001));
          lis.forEach((li, i) => { li.className = i < k ? 'ok' : (i === k ? 'on' : ''); });
          if (p < 1) requestAnimationFrame(tick); else resolve();
        };
        requestAnimationFrame(tick);
      });
      const f = await prep;
      st.name = raw; st.color = form.color; st.color2 = form.color2; st.logo = f.logo; st.logoBg = f.logoBg;
      paint();
      lis.forEach(li => li.className = 'ok'); lt.textContent = `${raw} is ready`;
      ready.hidden = false; root.classList.remove('is-building'); root.classList.add('is-ready');
      gen.disabled = false; gen.classList.remove('is-busy'); gen.firstChild.nodeValue = 'Generate again '; busy = false; done = true;
      await sleep(900);
      reveal();
    });
    const reveal = () => {
      const r = ph.getBoundingClientRect(), vh = innerHeight;
      if (r.top < 60 || r.bottom > vh - 20) {
        const top = r.top + scrollY - Math.max(70, (vh - r.height) / 2 - 40);
        scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
      }
      ph.classList.remove('pop'); void ph.offsetWidth; ph.classList.add('pop');
      swept = false; setTimeout(() => sweep(8), 700);
    };
    ready.addEventListener('click', reveal);

    // before / after drag slider
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
    const sweep = (endAt = 30) => {
      if (swept) return; swept = true; cancelAnimationFrame(raf2);
      if (reduce) { setPos(endAt < 30 ? endAt : 18); return; }
      const keys = [[0, pos], [700, 82], [1600, 14], [2300, endAt]], T = 2300; let t0 = 0;
      const ease = x => x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
      const step = ts => { if (!t0) t0 = ts; const t = Math.min(T, ts - t0); let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
        const [ta, pa] = keys[i], [tb, pb] = keys[i + 1]; setPos(pa + (pb - pa) * ease(Math.min(1, (t - ta) / (tb - ta)))); if (t < T) raf2 = requestAnimationFrame(step); };
      raf2 = requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); setTimeout(() => sweep(), 350); } }, { threshold: 0.6 }); io.observe(ph); }
    setPos(50);
    paint();
  });
})();
