// Zero-dependency Node server. Run: ADMIN_PASSWORD=yourpassword node server.js
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=__dirname,PORT=process.env.PORT||3000,PASS=process.env.ADMIN_PASSWORD||'change-me';
const DATA=path.join(ROOT,'data','data.json'),BK=path.join(ROOT,'data','bookings.json');
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json'};
const ALLOW=/^\/(index\.html|admin\.html|css\/[\w.-]+|js\/[\w.-]+|data\/data\.json)$/;
const same=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
const send=(res,code,obj)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(obj))};
const rl={};const limited=(k,n,ms)=>{const t=Date.now();rl[k]=(rl[k]||[]).filter(x=>t-x<ms);if(rl[k].length>=n)return true;rl[k].push(t);return false};
const rd=(f,d)=>{try{return JSON.parse(fs.readFileSync(f,'utf8'))}catch(e){return d}};
const wr=(f,o)=>{fs.writeFileSync(f+'.tmp',JSON.stringify(o,null,1));fs.renameSync(f+'.tmp',f)};
const s=(v,n)=>String(v||'').trim().slice(0,n);
http.createServer((req,res)=>{
  if(req.method==='POST'&&req.url==='/api'){
    const ip=req.socket.remoteAddress;let b='';req.on('data',c=>{b+=c;if(b.length>8e6)req.destroy()});
    req.on('end',()=>{try{
      const j=JSON.parse(b),op=j.op;
      if(op==='book'){
        if(limited(ip+':book',8,3600000))return send(res,429,{ok:false});
        const k={id:crypto.randomBytes(6).toString('hex'),ts:Date.now(),name:s(j.name,80),phone:s(j.phone,20),service:s(j.service,120),date:s(j.date,10),time:s(j.time,10),note:s(j.note,300),status:'new'};
        const list=rd(BK,[]);
        if(!k.name||!/^[\d +()-]{7,20}$/.test(k.phone)||!/^\d{4}-\d\d-\d\d$/.test(k.date)||list.length>=1000)return send(res,400,{ok:false});
        list.push(k);wr(BK,list);return send(res,200,{ok:true});
      }
      if(!same(j.password,PASS)){return send(res,limited(ip+':auth',10,600000)?429:401,{ok:false})}
      if(op==='check')return send(res,200,{ok:true});
      if(op==='list')return send(res,200,{ok:true,list:rd(BK,[])});
      if(op==='setstatus'&&['new','confirmed','done'].includes(j.status)){const l=rd(BK,[]);l.forEach(x=>{if(x.id===j.id)x.status=j.status});wr(BK,l);return send(res,200,{ok:true})}
      if(op==='delbook'){wr(BK,rd(BK,[]).filter(x=>x.id!==j.id));return send(res,200,{ok:true})}
      if(op==='save'){const d=j.data||{};
        if(!Array.isArray(d.v)||!Array.isArray(d.g))return send(res,400,{ok:false});
        const g=d.g.filter(x=>x&&typeof x.src==='string'&&(x.src===''||(x.src.startsWith('data:image/')&&x.src.length<2e6))).map(x=>({src:x.src,cap:s(x.cap,80)}));
        wr(DATA,{s:d.s&&typeof d.s==='object'?d.s:{},v:d.v,g});return send(res,200,{ok:true});}
      send(res,400,{ok:false});
    }catch(e){send(res,400,{ok:false})}});
    return;
  }
  let u=req.url.split('?')[0];if(u==='/')u='/index.html';if(u==='/admin')u='/admin.html';
  if(!ALLOW.test(u)){res.writeHead(404);return res.end('Not found')}
  fs.readFile(path.join(ROOT,u),(e,d)=>{
    if(e){res.writeHead(404);return res.end('Not found')}
    res.writeHead(200,{'Content-Type':MIME[path.extname(u)]||'application/octet-stream','Cache-Control':u.endsWith('data.json')?'no-store':'public, max-age=300'});res.end(d);});
}).listen(PORT,()=>console.log('Salon running at http://localhost:'+PORT+'  (owner login: /admin.html)'));
