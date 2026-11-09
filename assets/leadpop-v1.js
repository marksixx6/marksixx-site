/* leadpop-v1: "Free 2-min check" lead pop-up (Nov 9 2026). Shows once per visitor ~10 s after landing; submit opens WhatsApp to Marksixx. */
(function(){
  var KEY='mx_leadpop_v1',WA='18455403982',DELAY=10000;
  try{if(localStorage.getItem(KEY))return}catch(e){}
  if(/[?&]leadpop=off\b/.test(location.search))return;
  var lastScroll=0,shown=false,root,card,form,prevFocus;
  window.addEventListener('scroll',function(){lastScroll=Date.now()},{passive:true});
  window.addEventListener('touchmove',function(){lastScroll=Date.now()},{passive:true});
  function remember(v){try{localStorage.setItem(KEY,v||String(Date.now()))}catch(e){}}
  function busy(){
    // don't interrupt: mid-scroll, a lightbox / sheet open, or typing in a page form
    if(Date.now()-lastScroll<1200)return true;
    var ov=document.querySelectorAll('.lb9,.lb,.sheet-bg,.sheet');
    for(var i=0;i<ov.length;i++){var o=ov[i];if(o.hidden)continue;var cs=getComputedStyle(o);
      if(cs.display!=='none'&&cs.visibility!=='hidden'&&parseFloat(cs.opacity)>0.05&&o.getClientRects().length)return true}
    var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName))return true;
    if(document.hidden)return true;
    return false;
  }
  function el(h){var d=document.createElement('div');d.innerHTML=h;return d.firstChild}
  var waIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.3z"/></svg>';
  function build(){
    root=el('<div class="lp1" role="dialog" aria-modal="true" aria-labelledby="lp1-h" aria-hidden="true">'+
      '<div class="lp1-card" tabindex="-1">'+
        '<button type="button" class="lp1-x" aria-label="Close"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button>'+
        '<div class="lp1-form">'+
          '<p class="lp1-tag">Free marketing check</p>'+
          '<h2 class="lp1-h" id="lp1-h">Free 2-min check of your business online</h2>'+
          '<p class="lp1-s">We\u2019ll look at your business and show you what to fix.</p>'+
          '<form class="lp1-f" novalidate>'+
            '<label>Name<input name="name" type="text" autocomplete="name" required maxlength="80" placeholder="Your name"><span class="lp1-err">Please add your name.</span></label>'+
            '<label>Business name<input name="biz" type="text" autocomplete="organization" required maxlength="100" placeholder="Your business"><span class="lp1-err">Please add your business name.</span></label>'+
            '<label>Phone / WhatsApp<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required maxlength="24" placeholder="(555) 555-5555"><span class="lp1-err">Please add a phone number we can reach.</span></label>'+
            '<button type="submit" class="lp1-go">'+waIcon+'Get my free check</button>'+
          '</form>'+
          '<button type="button" class="lp1-no">No thanks</button>'+
        '</div>'+
        '<div class="lp1-ty" role="status">'+
          '<div class="lp1-ok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>'+
          '<h2 class="lp1-h">Got it!</h2>'+
          '<p class="lp1-s">We\u2019ll check your business and reach out.</p>'+
          '<button type="button" class="lp1-go lp1-close">Close</button>'+
          '<a class="lp1-again" href="#" target="_blank" rel="noopener">WhatsApp didn\u2019t open? Tap here</a>'+
        '</div>'+
      '</div></div>');
    document.body.appendChild(root);
    card=root.querySelector('.lp1-card');form=root.querySelector('form');
    root.querySelector('.lp1-x').addEventListener('click',close);
    root.querySelector('.lp1-no').addEventListener('click',close);
    root.querySelector('.lp1-close').addEventListener('click',close);
    root.addEventListener('click',function(e){if(e.target===root)close()});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&root.classList.contains('lp1-on'))close()});
    form.addEventListener('input',function(e){var l=e.target.closest('label');if(l&&valid(e.target))l.classList.remove('lp1-bad')});
    form.addEventListener('submit',submit);
  }
  function valid(i){var v=i.value.trim();if(i.name==='phone')return v.replace(/\D/g,'').length>=7;return v.length>=2||(i.name==='biz'&&v.length>=1)}
  function submit(e){
    e.preventDefault();
    var ins=form.querySelectorAll('input'),first=null;
    for(var k=0;k<ins.length;k++){var ok=valid(ins[k]);ins[k].closest('label').classList.toggle('lp1-bad',!ok);ins[k].setAttribute('aria-invalid',ok?'false':'true');if(!ok&&!first)first=ins[k]}
    if(first){first.focus();return}
    var f=function(n){return form.elements[n].value.trim().replace(/\s+/g,' ')};
    var page=location.origin+location.pathname;
    var msg='New free check request \u2014 Name: '+f('name')+' | Business: '+f('biz')+' | Phone: '+f('phone')+' | Page: '+page;
    var url='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);
    remember('sent');
    root.querySelector('.lp1-again').href=url;
    card.classList.add('lp1-done');card.scrollTop=0;
    if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
    window.__leadpopLast=url;
    var w=null;try{w=window.open(url,'_blank','noopener')}catch(err){}
  }
  function open(){
    if(shown)return;shown=true;remember();
    build();prevFocus=document.activeElement;
    document.documentElement.classList.add('lp1-lock');
    root.setAttribute('aria-hidden','false');
    requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('lp1-on');try{card.focus({preventScroll:true})}catch(e){}})});
  }
  function close(){
    if(!root)return;root.classList.remove('lp1-on');root.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('lp1-lock');
    setTimeout(function(){if(root&&root.parentNode)root.parentNode.removeChild(root)},350);
    try{if(prevFocus&&prevFocus.focus)prevFocus.focus({preventScroll:true})}catch(e){}
  }
  function tick(){if(shown)return;if(busy()){setTimeout(tick,700);return}open()}
  function start(){setTimeout(tick,DELAY)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.__leadpop={open:open,close:close};
})();
