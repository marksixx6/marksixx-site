/* nov9c (Nov 9 2026): desktop top nav: Services menu (mouse + keyboard), active page, slim on scroll */
(function(){
var top=document.querySelector('.top'),nav=document.querySelector('.dnav');if(!top||!nav)return;
var home=document.body.classList.contains('is-home');
var path=location.pathname.replace(/index\.html$/,'');if(path.slice(-1)!=='/')path+='/';
// active page
[].forEach.call(nav.querySelectorAll('a[href^="/"]'),function(a){var h=a.getAttribute('href');if(!home&&h===path&&h!=='/'){a.classList.add('on');a.setAttribute('aria-current','page')}});
var dd=nav.querySelector('.dn-dd'),btn=dd&&dd.querySelector('.dn-btn'),menu=dd&&dd.querySelector('.dn-menu');
if(dd&&dd.querySelector('.dn-menu a.on'))btn.classList.add('on');
function items(){return [].slice.call(menu.querySelectorAll('a'))}
function setOpen(v){if(!dd)return;dd.classList.toggle('open',v);btn.setAttribute('aria-expanded',v?'true':'false')}
if(dd){
  var t=0;
  dd.addEventListener('mouseenter',function(){clearTimeout(t);setOpen(true)});
  dd.addEventListener('mouseleave',function(){clearTimeout(t);t=setTimeout(function(){setOpen(false)},160)});
  btn.addEventListener('click',function(e){e.preventDefault();setOpen(!dd.classList.contains('open'))});
  btn.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);items()[0].focus()}});
  menu.addEventListener('keydown',function(e){var l=items(),k=l.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();l[(k+1)%l.length].focus()}
    else if(e.key==='ArrowUp'){e.preventDefault();l[(k-1+l.length)%l.length].focus()}});
  dd.addEventListener('keydown',function(e){if(e.key==='Escape'&&dd.classList.contains('open')){e.stopPropagation();setOpen(false);btn.focus()}});
  dd.addEventListener('focusout',function(e){if(!dd.contains(e.relatedTarget))setOpen(false)});
  document.addEventListener('click',function(e){if(!dd.contains(e.target))setOpen(false)});
}
// slim when scrolled
var raf=0;function sc(){raf=0;top.classList.toggle('dn-compact',scrollY>40)}
addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(sc)},{passive:true});sc();
// home: in-page links scroll smoothly + show where you are
if(home){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var links=[].slice.call(nav.querySelectorAll('a[data-sec]'));
  var secs=links.map(function(a){return document.getElementById(a.dataset.sec)}).filter(Boolean);
  links.forEach(function(a){a.addEventListener('click',function(e){var el=document.getElementById(a.dataset.sec);if(!el)return;e.preventDefault();setOpen(false);
    var go=function(){var y=a.dataset.sec==='home'?0:Math.round(el.getBoundingClientRect().top+scrollY-80);if(Math.abs(y-scrollY)>3)scrollTo({top:y,behavior:reduce?'auto':'smooth'})};
    go();var done=false,fix=function(){if(done)return;done=true;go()};addEventListener('scrollend',fix,{once:true});setTimeout(fix,1600);
    history.replaceState(null,'',a.dataset.sec==='home'?location.pathname:'#'+a.dataset.sec)})});
  var spy=function(){var mid=innerHeight*.45,cur='home',best=-1e9;secs.forEach(function(s){var t=s.getBoundingClientRect().top;if(t<=mid&&t>best){best=t;cur=s.id}});
    if(innerHeight+scrollY>=document.documentElement.scrollHeight-4&&secs.length)cur=secs[secs.length-1].id;
    links.forEach(function(a){var on=a.dataset.sec===cur&&cur!=='home';a.classList.toggle('on',on);on?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current')})};
  var r2=0;addEventListener('scroll',function(){if(!r2)r2=requestAnimationFrame(function(){r2=0;spy()})},{passive:true});spy();
}
})();
