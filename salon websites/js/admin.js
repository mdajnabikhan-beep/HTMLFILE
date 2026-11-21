(function(){
var pw='',S={},V=[],G=[],BK=[],dirty=false,offline=false,poll=null,lastNew=-1;
var $=function(i){return document.getElementById(i)},adb=$('admbody');
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');}
function toast(t){var el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){el.classList.remove('show')},2600);}
function api(body){body.password=pw;var EP=['api','api.php'];
  function go(k){if(k>=EP.length)return Promise.reject({code:'nobackend'});
    return fetch(EP[k],{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){if(r.status===401||r.status===429)throw {code:r.status===401?'auth':'limit'};if(r.ok)return r.json();return go(k+1);})
      .catch(function(e){if(e&&(e.code==='auth'||e.code==='limit'))throw e;return go(k+1);});}
  return go(0);}
function load(){return fetch('data/data.json',{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return {}}).then(function(D){S=D.s||{};V=D.v||[];G=D.g||[];});}
function rBk(){var el=$('bk');
  if(offline){el.innerHTML='<p class="sub">Bookings need the Node or PHP save service.</p>';return;}
  var n=BK.filter(function(b){return b.status==='new'}).length;$('bkn').textContent=n?'('+n+' new)':'';
  el.innerHTML=BK.length?BK.map(function(b){return '<div class="prow glass" data-id="'+esc(b.id)+'"><div><b>'+esc(b.name)+'</b><br><a href="tel:'+esc(b.phone)+'">'+esc(b.phone)+'</a></div><div>'+esc(b.service)+'<br>'+esc(b.date)+' at '+esc(b.time)+'</div><div>'+esc(b.note||'')+'</div><div><span class="tag '+esc(b.status)+'">'+esc(b.status)+'</span></div><button class="btn" data-st="confirmed" type="button">Confirm</button><button class="btn" data-st="done" type="button">Done</button><button class="del" data-db="1" type="button">Delete</button></div>'}).join(''):'<p class="sub">No booking requests yet.</p>';}
function loadBk(){if(offline)return;api({op:'list'}).then(function(r){BK=(r.list||[]).slice().reverse();var n=BK.filter(function(b){return b.status==='new'}).length;if(lastNew>=0&&n>lastNew)toast('New booking request received.');lastNew=n;rBk();}).catch(function(){});}
function rAdm(){
  var h='<h3>Salon details</h3><div class="prow glass">'+[['name','Short name (logo)'],['tag','Headline'],['about','Intro text'],['phone','Phone'],['wa','WhatsApp number with country code'],['address','Address'],['hours','Opening hours']].map(function(f){return '<input data-sf="'+f[0]+'" value="'+esc(S[f[0]]||'')+'" placeholder="'+f[1]+'" aria-label="'+f[1]+'">'}).join('')+'</div>';
  h+='<h3>Services</h3>'+V.map(function(r,k){return '<div class="prow glass" data-k="'+k+'"><input data-f="4" value="'+esc(r[4])+'" aria-label="Icon"><input data-f="0" value="'+esc(r[0])+'" aria-label="Name"><input data-f="1" value="'+esc(r[1])+'" aria-label="Description"><input data-f="2" type="number" min="0" value="'+(Number(r[2])||0)+'" aria-label="Price in rupees"><input data-f="3" value="'+esc(r[3])+'" aria-label="Duration"><button class="del" type="button" data-dv="'+k+'">Delete</button></div>'}).join('')+'<button class="btn" id="addv" type="button">Add a service</button>';
  h+='<h3>Gallery photos</h3><p class="sub">Photos are resized automatically. About 12 photos keeps the site fast.</p>'+G.map(function(g,k){return '<div class="prow glass" data-k="'+k+'">'+(/^data:image\//.test(g.src||'')?'<img alt="" src="'+g.src+'">':'<span>No photo yet</span>')+'<input data-gc="'+k+'" value="'+esc(g.cap)+'" placeholder="Caption" aria-label="Caption"><button class="del" type="button" data-dg="'+k+'">Remove</button></div>'}).join('')+'<p><label class="btn" for="up">Upload photos</label><input id="up" type="file" accept="image/*" multiple hidden></p>';
  adb.innerHTML=h;}
function show(){$('login').hidden=true;$('panel').hidden=false;load().then(function(){rAdm();rBk();loadBk();poll=setInterval(loadBk,20000);});}
adb.addEventListener('input',function(e){var t=e.target,row=t.closest('.prow');dirty=true;
  if(t.dataset.sf){S[t.dataset.sf]=t.value;return;}
  if(t.dataset.gc!==undefined){G[+t.dataset.gc].cap=t.value;return;}
  if(t.dataset.f!==undefined&&row){var f=+t.dataset.f;V[row.dataset.k][f]=f===2?(Number(t.value)||0):t.value;}});
adb.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  if(b.dataset.dv!==undefined){V.splice(+b.dataset.dv,1);dirty=true;rAdm();}
  if(b.dataset.dg!==undefined){G.splice(+b.dataset.dg,1);dirty=true;rAdm();}
  if(b.id==='addv'){V.push(['New service','Short description',1000,'60 min','✨']);dirty=true;rAdm();}});
adb.addEventListener('change',function(e){if(e.target.id!=='up')return;var fs=[].slice.call(e.target.files);
  Promise.all(fs.map(function(f){return new Promise(function(res){var im=new Image(),u=URL.createObjectURL(f);im.onload=function(){var k=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.78));};im.onerror=function(){res(null)};im.src=u;});}))
  .then(function(a){a.forEach(function(s){if(s)G.push({src:s,cap:''})});dirty=true;rAdm();toast('Photos added. Press Save to keep them.');});});
$('bk').addEventListener('click',function(e){var b=e.target.closest('button'),row=e.target.closest('.prow');if(!b||!row)return;var id=row.dataset.id;
  if(b.dataset.st)api({op:'setstatus',id:id,status:b.dataset.st}).then(loadBk).catch(function(){toast('Could not update.')});
  if(b.dataset.db&&confirm('Delete this booking request?'))api({op:'delbook',id:id}).then(loadBk).catch(function(){toast('Could not delete.')});});
function download(){var b=new Blob([JSON.stringify({s:S,v:V,g:G},null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='data.json';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},1000);}
$('lf').addEventListener('submit',function(e){e.preventDefault();pw=$('pw').value;$('lmsg').textContent='Checking…';
  api({op:'check'}).then(function(){offline=false;show();}).catch(function(err){
    if(err&&err.code==='auth'){$('lmsg').textContent='Wrong password. Try again.';return;}
    if(err&&err.code==='limit'){$('lmsg').textContent='Too many attempts. Wait a few minutes.';return;}
    offline=true;show();toast('No save service found. Edit here, then download data.json and upload it to your site.');});});
$('save').addEventListener('click',function(){if(offline){download();return;}
  api({op:'save',data:{s:S,v:V,g:G}}).then(function(){dirty=false;toast('Saved. Your salon site is updated.');}).catch(function(err){toast(err&&err.code==='auth'?'Wrong password. Log in again.':'Could not save. Download data.json instead.');});});
$('dl').addEventListener('click',download);
$('out').addEventListener('click',function(){if(dirty&&!confirm('You have unsaved changes. Log out anyway?'))return;clearInterval(poll);pw='';location.reload();});
addEventListener('beforeunload',function(e){if(dirty){e.preventDefault();e.returnValue='';}});
})();
