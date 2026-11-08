(function(){var b=document.querySelector('.wa6');if(!b)return;
/* hide over the home hero (first screen) and while the page's own WhatsApp CTA / footer is on screen */
var home=document.body.classList.contains('is-home'),seen=0,top=false;
function f(){top=home&&window.scrollY<window.innerHeight*.6;b.classList.toggle('wa6-off',top||seen>0)}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){seen+=e.isIntersecting?1:(e.target._in?-1:0);e.target._in=e.isIntersecting});seen=Math.max(seen,0);f()},{rootMargin:'0px 0px -90px 0px'});
document.querySelectorAll('.sec-cta,.foot,.nf-btns').forEach(function(el){io.observe(el)})}
f();window.addEventListener('scroll',f,{passive:true});})();
