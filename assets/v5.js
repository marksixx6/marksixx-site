(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- scroll reveal (below the hero only) ----------
  if (document.body.classList.contains('is-home')) {
    $$('main > .sec:not(.hero)').forEach(sec => {
      $$(':scope > .sec-head, :scope > .about-in, :scope > .sec-note, :scope > .v5-more, :scope > h2, :scope > .big-cta, :scope > .cta-6', sec).forEach(el => el.classList.add('fx'));
      $$('.svc-list > li, .steps > li, .pk-list > li, .rv-list > li, .logos > li, .stats > .stat, .plats > *, .faq > details', sec).forEach((el, i) => { el.classList.add('fx'); el.style.setProperty('--d', (Math.min(i, 6) * 0.06) + 's'); });
    });
  } else {
    $$('.fx-kids').forEach(p => [...p.children].forEach((el, i) => { el.classList.add('fx'); el.style.setProperty('--d', (Math.min(i, 6) * 0.06) + 's'); }));
  }
  const fx = $$('.fx');
  if (reduce || !('IntersectionObserver' in window)) fx.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    fx.forEach(el => io.observe(el));
    // anything already above the viewport (e.g. restored scroll) shows at once
    requestAnimationFrame(() => fx.forEach(el => { if (el.getBoundingClientRect().bottom < 0) el.classList.add('in'); }));
  }

  // ---------- platform tabs ----------
  $$('[data-tabs]').forEach(root => {
    const tabs = $$('[role=tab]', root), panels = $$('[role=tabpanel]', root);
    const pick = (t, focus) => {
      tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
      panels.forEach(p => { const on = p.id === t.getAttribute('aria-controls'); p.hidden = !on; if (on) { p.classList.remove('swap'); void p.offsetWidth; p.classList.add('swap'); } });
      if (focus) t.focus();
      t.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    const want = location.hash && tabs.find(t => '#' + t.dataset.key === location.hash);
    if (want) pick(want);
  });

  // ---------- before / after switch (phone) ----------
  $$('[data-ba]').forEach(root => {
    const ba = root.querySelector('.ba');
    $$('.ba-sw button', root).forEach(b => b.addEventListener('click', () => {
      $$('.ba-sw button', root).forEach(x => x.setAttribute('aria-pressed', x === b));
      ba.dataset.show = b.dataset.v;
    }));
  });

  // ---------- sample content calendar ----------
  const cal = document.getElementById('cal');
  if (cal) {
    const P = { ig: 'Instagram', li: 'LinkedIn', wa: 'WhatsApp', fb: 'Facebook' };
    const T = { ig: 'IG', li: 'In', wa: 'WA', fb: 'FB' };
    // [day-of-month, [[platform, what], ...]] — an example month, Sunday first; Saturday is Shabbos
    const M = {
      1: [['wa', 'Status: week ahead'], ['ig', 'Story: behind the scenes']],
      2: [['ig', 'Post: new product'], ['li', 'Founder post: lesson learned'], ['fb', 'Share of the post']],
      3: [['ig', 'Reel: before & after'], ['wa', 'Status: the reel']],
      4: [['ig', 'Story: poll'], ['li', 'Company page: team spotlight']],
      5: [['ig', 'Post: client tip'], ['wa', 'Status: tip of the week'], ['fb', 'Share of the post']],
      6: [['ig', 'Story: Good Shabbos'], ['wa', 'Status: Good Shabbos']],
      8: [['wa', 'Status: offer'], ['ig', 'Story: offer']],
      9: [['ig', 'Carousel: 3 things to know'], ['li', 'Carousel: industry insight']],
      10: [['ig', 'Reel: day in the business'], ['wa', 'Status: the reel'], ['fb', 'Event post']],
      11: [['ig', 'Story: Q&A'], ['li', 'Founder post: a win this week']],
      12: [['ig', 'Post: testimonial design'], ['wa', 'Channel update']],
      13: [['ig', 'Story: Good Shabbos'], ['wa', 'Status: Good Shabbos']],
      15: [['wa', 'Status: new arrivals'], ['ig', 'Story: new arrivals']],
      16: [['ig', 'Post: meet the owner'], ['li', 'Founder post: why we started'], ['fb', 'Share of the post']],
      17: [['ig', 'Reel: how it\u2019s made'], ['wa', 'Status: the reel']],
      18: [['ig', 'Story: countdown'], ['li', 'Company page: milestone']],
      19: [['ig', 'Post: FAQ answered'], ['wa', 'Status: FAQ']],
      20: [['ig', 'Story: Good Shabbos'], ['wa', 'Status: Good Shabbos']],
      22: [['wa', 'Status: week ahead'], ['ig', 'Story: behind the scenes']],
      23: [['ig', 'Carousel: guide'], ['li', 'Founder post: advice'], ['fb', 'Share of the post']],
      24: [['ig', 'Reel: client story'], ['wa', 'Status: the reel']],
      25: [['ig', 'Story: poll results'], ['li', 'Company page: hiring']],
      26: [['ig', 'Post: month recap'], ['wa', 'Channel update'], ['fb', 'Share of the post']],
      27: [['ig', 'Story: Good Shabbos'], ['wa', 'Status: Good Shabbos']],
    };
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Shabbos'];
    const dt = document.getElementById('calDt');
    let filter = 'all', sel = 3;
    const html = ['<div class="cal-hd">' + days.map(d => '<span>' + (d === 'Shabbos' ? 'Shab' : d) + '</span>').join('') + '</div>'];
    for (let w = 0; w < 4; w++) {
      html.push('<div class="cal-wk">');
      for (let d = 0; d < 7; d++) {
        const n = w * 7 + d + 1;
        if (d === 6) { html.push('<div class="cal-d sh" aria-label="Shabbos, nothing posted"><span class="dn">' + n + '</span><span class="shl">Shabbos</span></div>'); continue; }
        const ev = (M[n] || []).map(([p, t]) => '<span class="ev ' + p + '" data-p="' + p + '" data-t="' + T[p] + '"></span>').join('');
        html.push('<button type="button" class="cal-d" data-n="' + n + '" aria-label="Day ' + n + '"><span class="dn">' + n + '</span>' + ev + '</button>');
      }
      html.push('</div>');
    }
    cal.innerHTML = html.join('');
    const show = n => {
      sel = n;
      $$('.cal-d', cal).forEach(b => b.classList.toggle('on', +b.dataset.n === n));
      const w = (n - 1) % 7, items = (M[n] || []).filter(([p]) => filter === 'all' || p === filter);
      dt.innerHTML = '<h4>' + days[w] + ' ' + n + '</h4><ul>' + (items.length ? items.map(([p, t]) => '<li><span class="ev ' + p + '"></span>' + P[p] + ' · ' + t + '</li>').join('') : '<li>Nothing planned here for this platform.</li>') + '</ul>';
    };
    $$('.cal-d[data-n]', cal).forEach(b => b.addEventListener('click', () => show(+b.dataset.n)));
    $$('.cal-f button').forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.f;
      $$('.cal-f button').forEach(x => x.setAttribute('aria-pressed', x === b));
      $$('.ev', cal).forEach(e => e.classList.toggle('off', filter !== 'all' && e.dataset.p !== filter));
      show(sel);
    }));
    show(sel);
  }

  // ---------- work filter ----------
  const wf = document.querySelector('.wf');
  if (wf) {
    const items = $$('.work-grid .w');
    $$('button', wf).forEach(b => b.addEventListener('click', () => {
      $$('button', wf).forEach(x => x.setAttribute('aria-pressed', x === b));
      const c = b.dataset.c;
      items.forEach(it => it.classList.toggle('hide', c !== 'all' && it.dataset.c !== c));
      history.replaceState(null, '', c === 'all' ? location.pathname : '#' + b.dataset.k);
    }));
    const k = location.hash.slice(1), b = k && wf.querySelector('[data-k="' + k + '"]');
    if (b) b.click();
  }

  // ---------- contact form -> WhatsApp with a prefilled message ----------
  const form = document.getElementById('cform');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const need = f.getAll('need');
    const lines = ['Hi Marksixx!'];
    if (f.get('name')) lines.push('My name is ' + f.get('name').trim() + (f.get('biz') ? ' from ' + f.get('biz').trim() : '') + '.');
    else if (f.get('biz')) lines.push('I\u2019m from ' + f.get('biz').trim() + '.');
    if (need.length) lines.push('I\u2019m interested in: ' + need.join(', ') + '.');
    if (f.get('msg')) lines.push(f.get('msg').trim());
    const url = 'https://wa.me/18455403982?text=' + encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank', 'noopener') || (location.href = url);
  });
})();
