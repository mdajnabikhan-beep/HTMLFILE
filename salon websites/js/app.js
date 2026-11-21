/* Aurum Luxe Salon: public site script. Loads data/data.json, sends bookings to the server. */
fetch('data/data.json',{cache:'no-store'}).then(function(r){return r.ok?r.json():{}}).catch(function(){return {}}).then(function(D){
function api(body){var EP=['api','api.php'];function go(k){if(k>=EP.length)return Promise.reject({});return fetch(EP[k],{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){if(r.ok)return r.json();if(r.status===400||r.status===429)throw {code:r.status};return go(k+1);}).catch(function(e){if(e&&e.code)throw e;return go(k+1);});}return go(0);}
var SRC='<!DOCTYPE html>\n'+document.documentElement.outerHTML;
D=D||{};
var S=Object.assign({name:'Aurum',tag:'Where luxury meets your best look.',about:'An unhurried, private salon experience with master stylists, premium products and a calm, golden-lit space made for you.',phone:'+91 00000 00000',wa:'',address:'Civil Lines, Meerut, Uttar Pradesh',hours:'10:00 am to 8:00 pm, every day'},D.s||{});
var V=D.v||[
 ['Signature Haircut & Styling','Consultation, wash, precision cut and blow-dry',1200,'60 min','✂️'],
 ['Hair Colour & Balayage','Premium colour with bond protection',4500,'3 hr','🎨'],
 ['Keratin & Smoothing','Frizz-free shine that lasts for months',5500,'2.5 hr','✨'],
 ['Signature Facial','Deep cleanse, glow and hydration',2200,'75 min','🌸'],
 ['Bridal Makeover','Hair, makeup and draping, trial included',18000,'Full day','👑'],
 ['Manicure & Pedicure','Spa finish with a gel option',1800,'90 min','💅']];
var G=D.g||[{src:'',cap:'Golden balayage'},{src:'',cap:'Bridal updo'},{src:'',cap:'Glass-skin facial'},{src:'',cap:'Velvet colour'},{src:'',cap:'Classic cut'},{src:'',cap:'Nail art'}];
var PH=['linear-gradient(135deg,#d9b877,#7a4a2a)','linear-gradient(135deg,#e9c6c0,#8a3a64)','linear-gradient(135deg,#f3dfae,#b07a8c)','linear-gradient(135deg,#8a3a64,#2a1230)','linear-gradient(135deg,#c9a05a,#3b2330)','linear-gradient(135deg,#e9c6c0,#d9b877)'],PI=['💇','👰','🌸','🎨','✂️','💅'];
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function toast(t){var el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){el.classList.remove('show')},2400);}
function applyS(){document.querySelectorAll('[data-s]').forEach(function(e){e.textContent=S[e.dataset.s]||''});}
function rServices(){
  $('sgrid').innerHTML=V.map(function(r){return '<article class="card glass"><span class="ico">'+esc(r[4])+'</span><h3>'+esc(r[0])+'</h3><p>'+esc(r[1])+'</p><div class="row"><span class="price">from ₹'+(Number(r[2])||0)+'</span><span class="dur">'+esc(r[3])+'</span></div></article>'}).join('');
  $('sv').innerHTML=V.map(function(r){return '<option>'+esc(r[0])+'</option>'}).join('');
}
var cur=0,belt=$('belt'),step=60,R=300;
function rCar(){
  belt.innerHTML=G.map(function(g,i){return '<div class="slide">'+(/^data:image\//.test(g.src||'')?'<img alt="'+esc(g.cap)+'" src="'+g.src+'">':'<div class="ph" style="background:'+PH[i%6]+'">'+PI[i%6]+'</div>')+(g.cap?'<b>'+esc(g.cap)+'</b>':'')+'</div>'}).join('');
  lay();
}
function lay(){
  var n=Math.max(G.length,3);step=360/n;R=Math.round(($('car').querySelector('.belt').offsetWidth/2+16)/Math.tan(Math.PI/n));
  var s=belt.children;for(var i=0;i<s.length;i++)s[i].style.transform='rotateY('+i*step+'deg) translateZ('+R+'px)';
  belt.style.transform='translateZ('+(-R)+'px) rotateY('+(-cur*step)+'deg)';
}
function go(d){cur+=d;belt.style.transform='translateZ('+(-R)+'px) rotateY('+(-cur*step)+'deg)';}
$('prev').onclick=function(){go(-1)};$('next').onclick=function(){go(1)};
var auto=setInterval(function(){if(!matchMedia('(prefers-reduced-motion:reduce)').matches&&!document.hidden)go(1)},3500);
$('car').addEventListener('pointerenter',function(){clearInterval(auto)});
addEventListener('resize',lay);
var st=$('stage');
st.addEventListener('pointermove',function(e){var r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;$('orb').style.transform='rotateX('+(-y*40)+'deg) rotateY('+(x*50)+'deg)';});
st.addEventListener('pointerleave',function(){$('orb').style.transform='';});
$('sgrid').addEventListener('pointermove',function(e){var c=e.target.closest('.card');if(!c)return;var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='rotateX('+(-y*12)+'deg) rotateY('+(x*14)+'deg)';});
$('sgrid').addEventListener('pointerout',function(e){var c=e.target.closest('.card');if(c)c.style.transform='';});
var tm=[];for(var h=10;h<=19;h++){tm.push('<option>'+(h>12?h-12:h)+':00 '+(h>=12?'pm':'am')+'</option>');}$('t').innerHTML=tm.join('');
$('d').min=new Date().toISOString().slice(0,10);
$('form').addEventListener('submit',function(e){e.preventDefault();var f=this,ok=$('ok'),w=String(S.wa||'').replace(/\D/g,''),b={op:'book',name:$('n').value,phone:$('p').value,service:$('sv').value,date:$('d').value,time:$('t').value,note:$('m').value};
  ok.textContent='Sending…';
  api(b).then(function(){ok.textContent='Thank you, '+b.name+'. Your request is received and we will confirm your slot shortly.';f.reset();})
  .catch(function(){var msg='Booking request: '+b.service+' on '+b.date+' at '+b.time+'. Name: '+b.name+', phone: '+b.phone+'. '+b.note;
    if(w){window.open('https://wa.me/'+w+'?text='+encodeURIComponent(msg),'_blank','noopener');ok.textContent='Press send in WhatsApp to finish your request.';}
    else ok.textContent='Could not send online. Please call '+S.phone+' to book.';});});
var nv=$('nav'),bg=$('burger');
bg.addEventListener('click',function(){var o=nv.classList.toggle('open');bg.setAttribute('aria-expanded',o);});
nv.addEventListener('click',function(e){if(e.target.closest('ul a')){nv.classList.remove('open');bg.setAttribute('aria-expanded','false');}});
applyS();rServices();rCar();


});
