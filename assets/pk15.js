(function(){var t=document.querySelectorAll('.pk-tabs a');if(!t.length)return;
var d=document.documentElement;d.classList.add('pk15');
function show(id,scroll){var p=document.getElementById(id);if(!p||!p.classList.contains('pk-panel'))return false;
document.querySelectorAll('.pk-panel').forEach(function(x){x.classList.toggle('on',x===p)});
t.forEach(function(a){var on=a.getAttribute('href')==='#'+id;a.classList.toggle('on',on);a.setAttribute('aria-selected',on?'true':'false')});
p.querySelectorAll('.fx').forEach(function(x){x.classList.add('in')});
if(scroll){var s=document.getElementById('pk-tabs');if(s)s.scrollIntoView({block:'start'})}return true}
t.forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href').slice(1);if(show(id,false)){e.preventDefault();history.replaceState(null,'','#'+id)}})});
function fromHash(){var h=location.hash.slice(1);if(h==='branding'||h==='marketing')show(h,true)}
fromHash();window.addEventListener('hashchange',fromHash);
document.querySelectorAll('a[href="#branding"],a[href="#marketing"]').forEach(function(a){if(a.closest('.pk-tabs'))return;a.addEventListener('click',function(e){e.preventDefault();var id=a.getAttribute('href').slice(1);show(id,true);history.replaceState(null,'','#'+id)})});
})();
