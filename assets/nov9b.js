/* nov9b (Nov 9 2026): reels carousel (dots only, no counter) + packages switch + profile phone fit */
(function(){
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var chev=function(d){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(d<0?'M15 5l-7 7 7 7':'M9 5l7 7-7 7')+'"/></svg>'};
document.querySelectorAll('.rr-row.rr-reels').forEach(function(row){
  var cards=[].slice.call(row.querySelectorAll('.rr-card'));if(cards.length<2)return;
  var wrap=document.createElement('div');wrap.className='rl-wrap';row.parentNode.insertBefore(wrap,row);wrap.appendChild(row);
  var prev=document.createElement('button');prev.type='button';prev.className='rl-btn rl-prev';prev.setAttribute('aria-label','Previous reel');prev.innerHTML=chev(-1);
  var next=document.createElement('button');next.type='button';next.className='rl-btn rl-next';next.setAttribute('aria-label','Next reel');next.innerHTML=chev(1);
  wrap.appendChild(prev);wrap.appendChild(next);
  var ctl=document.createElement('div');ctl.className='rl-ctl';
  var dots=document.createElement('div');dots.className='rl-dots';
  cards.forEach(function(c,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Reel '+(i+1)+' of '+cards.length);b.addEventListener('click',function(){go(i)});dots.appendChild(b)});
  ctl.appendChild(dots);wrap.parentNode.insertBefore(ctl,wrap.nextSibling);
  function step(){return cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:row.clientWidth}
  function idx(){var s=step();return s>0?Math.max(0,Math.min(cards.length-1,Math.round(row.scrollLeft/s))):0}
  function go(i){i=Math.max(0,Math.min(cards.length-1,i));var max=row.scrollWidth-row.clientWidth;row.scrollTo({left:Math.min(max,i*step()),behavior:reduce?'auto':'smooth'})}
  function upd(){var on=row.scrollWidth>row.clientWidth+4;wrap.classList.toggle('rl-on',on);ctl.parentNode&&ctl.classList.toggle('rl-on',on);
    var m=cards[0].querySelector('.rr-media');if(m)wrap.style.setProperty('--rl-mid',(m.offsetTop+m.offsetHeight/2)+'px');
    var max=row.scrollWidth-row.clientWidth,i=idx();if(row.scrollLeft>=max-4)i=cards.length-1;
    prev.disabled=row.scrollLeft<=4;next.disabled=row.scrollLeft>=max-4;
    [].forEach.call(dots.children,function(d,j){d.classList.toggle('on',j===i)})}
  prev.addEventListener('click',function(){go(idx()-1)});
  next.addEventListener('click',function(){var max=row.scrollWidth-row.clientWidth;var i=idx()+1;if(i*step()>max&&row.scrollLeft<max-4){row.scrollTo({left:max,behavior:reduce?'auto':'smooth'})}else go(i)});
  var t=0;row.addEventListener('scroll',function(){cancelAnimationFrame(t);t=requestAnimationFrame(upd)},{passive:true});
  window.addEventListener('resize',upd);window.addEventListener('load',upd);upd();
  // one-time nudge so people see the row moves
  if(!reduce&&'IntersectionObserver' in window){var done=false;try{done=sessionStorage.getItem('rlNudge')==='1'}catch(e){}
    if(!done){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&wrap.classList.contains('rl-on')&&row.scrollLeft<4){io.disconnect();try{sessionStorage.setItem('rlNudge','1')}catch(x){}
      setTimeout(function(){row.classList.add('rl-nudge');setTimeout(function(){row.classList.remove('rl-nudge')},1400)},450)}})},{threshold:.6});io.observe(row)}}
});
// packages switch (Marketing | Branding)
var groups=document.querySelectorAll('[data-pk-tabs]');
if(groups.length){document.documentElement.classList.add('pk15');
  groups.forEach(function(g){var tabs=[].slice.call(g.querySelectorAll('[data-pk]'));var useHash=g.hasAttribute('data-pk-hash');
    function show(id,scroll){var p=document.getElementById(id);if(!p||!p.classList.contains('pk-panel'))return false;
      var scope=g.closest('section')||document;scope.querySelectorAll('.pk-panel').forEach(function(x){x.classList.toggle('on',x===p)});
      tabs.forEach(function(a){var on=a.getAttribute('data-pk')===id;a.classList.toggle('on',on);a.setAttribute('aria-selected',on?'true':'false')});
      p.querySelectorAll('.fx').forEach(function(x){x.classList.add('in')});
      if(scroll)g.scrollIntoView({block:'start'});return true}
    tabs.forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('data-pk');if(show(id,false)){e.preventDefault();if(useHash)history.replaceState(null,'','#'+id)}})});
    if(useHash){var fromHash=function(){var h=location.hash.slice(1);if(tabs.some(function(a){return a.getAttribute('data-pk')===h}))show(h,true)};fromHash();window.addEventListener('hashchange',fromHash);
      tabs.forEach(function(a){var id=a.getAttribute('data-pk');document.querySelectorAll('a[href="#'+id+'"]').forEach(function(l){if(g.contains(l))return;l.addEventListener('click',function(e){e.preventDefault();show(id,true);history.replaceState(null,'','#'+id)})})})}
  })}
// profile phone demo: scale the phone so the whole phone fits on a phone screen
(function(){var phs=[].slice.call(document.querySelectorAll('.mx-phone'));if(!phs.length)return;
  var fits=phs.map(function(ph){var w=document.createElement('div');w.className='mx-fit';ph.parentNode.insertBefore(w,ph);w.appendChild(ph);return w});
  function fit(){var vh=window.innerHeight||document.documentElement.clientHeight,vw=window.innerWidth;
    fits.forEach(function(w){var ph=w.firstChild;w.style.transform='';w.style.marginBottom='';
      if(vw>=900)return;var hh=ph.offsetHeight;if(!hh)return;
      var target=Math.min(vh*0.68,vh-170,580),s=Math.min(1,target/hh);
      if(s<1){w.style.transform='scale('+s.toFixed(4)+')';w.style.marginBottom=(-(1-s)*hh).toFixed(1)+'px'}})}
  var lastW=0;function onR(){if(window.innerWidth!==lastW||!lastW){lastW=window.innerWidth;fit()}}
  window.addEventListener('resize',onR);window.addEventListener('orientationchange',function(){lastW=0;setTimeout(onR,250)});window.addEventListener('load',fit);fit()})();
})();
