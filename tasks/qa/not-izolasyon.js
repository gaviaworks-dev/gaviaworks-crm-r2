#!/usr/bin/env node
/* =====================================================================
   R2 KİŞİSEL NOT İZOLASYON EKSENİ — karar K-11 / ADR-R2-01

   R1'de bu güvence FİZİKSELDİ: `notes.js` yalnız iki ekranda yüklüydü
   (ADR-21). Şartname §4.2 "tüm sayfalarda Not Al düğmesi" isteyince o
   garanti düşecekti. K-11 yerine TEMBEL YÜKLEME koydu.

   Bu eksen üç şeyi ölçer ve üçü de NEGATİF hükümdür — bir şeyin
   OLMADIĞINI kanıtlamak, olduğunu kanıtlamaktan zordur:

     N1  Sayfa açılışında HİÇBİR not bellekte olmamalı (dört ekranda).
     N2  Hiçbir HTML `notes.js`i <script> ile yüklememeli.
     N3  Yükleme sonrası bellekte YALNIZ oturum sahibinin kayıtları
         kalmalı — yabancı kayıt gizlenmeli değil, ATILMIŞ olmalı.

   Koşum: node tasks/qa/not-izolasyon.js   (depo kökünden)
   ===================================================================== */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.cwd(), PORT = 8799;
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);const p=path.join(ROOT,u==='/'?'index.html':u);
 if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){s.writeHead(404);return s.end();}
 s.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(s);});

let bulgu=0;
const de=(m)=>{console.log('  ✗ '+m);bulgu++;};
const ok=(m)=>console.log('  ✓ '+m);

const EKRANLAR=['app-panel.html','app-musteri.html','app-operasyon.html','app-odeme-linki.html'];

(async()=>{
 await new Promise(r=>srv.listen(PORT,'127.0.0.1',r));
 const B=`http://127.0.0.1:${PORT}`;
 const b=await chromium.launch();

 /* ---- N2: statik referans var mı ---- */
 console.log('\n[N2] Hiçbir HTML notes.js yüklemiyor mu');
 const suclu=fs.readdirSync(ROOT).filter(f=>f.endsWith('.html'))
   .filter(f=>/<script[^>]+assets\/data\/notes\.js/.test(fs.readFileSync(path.join(ROOT,f),'utf8')));
 suclu.length ? de('notes.js\'i <script> ile yükleyen sayfa: '+suclu.join(', '))
              : ok(`${fs.readdirSync(ROOT).filter(f=>f.endsWith('.html')).length} HTML dosyasının hiçbiri notes.js yüklemiyor`);

 /* ---- N1: açılışta bellekte not var mı ---- */
 console.log('\n[N1] Sayfa açılışında not belleğe girmiyor mu');
 for(const ek of EKRANLAR){
   const ctx=await b.newContext({viewport:{width:1440,height:900}});
   const pg=await ctx.newPage();
   const notIstek=[];
   pg.on('request',r=>{ if(/notes\.js/.test(r.url())) notIstek.push(r.url()); });
   await pg.goto(`${B}/${ek}?role=sahip`,{waitUntil:'networkidle'});
   await pg.waitForTimeout(400);
   const durum=await pg.evaluate(()=>({
     koleksiyonVar: !!(window.DB && window.DB.personalNotes),
     sayi: (window.DB && window.DB.personalNotes) ? window.DB.personalNotes.length : -1,
     madde: (window.DB && window.DB.personalNoteChecklistItems) ? window.DB.personalNoteChecklistItems.length : -1
   }));
   if(durum.koleksiyonVar) de(`${ek} — açılışta DB.personalNotes bellekte (${durum.sayi} kayıt)`);
   else if(notIstek.length) de(`${ek} — notes.js açılışta istendi: ${notIstek.length} istek`);
   else ok(`${ek} — açılışta not yok, notes.js hiç istenmedi`);
   await ctx.close();
 }

 /* ---- N3: yükleme sonrası yalnız sahibin kayıtları ---- */
 console.log('\n[N3] Yükleme sonrası yabancı kayıt bellekten atılıyor mu');
 /* Kaynak dosyadaki gerçek sahip dağılımı — beklenen sayı buradan ölçülür,
    varsayılmaz. */
 const ham=fs.readFileSync(path.join(ROOT,'assets/data/notes.js'),'utf8');
 const sahipler={};
 (ham.match(/owner:'[^']*'/g)||[]).forEach(m=>{const o=m.split("'")[1];sahipler[o]=(sahipler[o]||0)+1;});
 console.log('  kaynak dosyadaki sahip dağılımı: '+JSON.stringify(sahipler));

 for(const emp of Object.keys(sahipler)){
   const ctx=await b.newContext({viewport:{width:1440,height:900}});
   const pg=await ctx.newPage();
   await pg.goto(`${B}/app-panel.html?emp=${emp}`,{waitUntil:'networkidle'});
   await pg.waitForTimeout(300);
   const r=await pg.evaluate(async()=>{
     await window.GV.quickNote.yukle();
     const me=window.GV.session.emp;
     const n=window.DB.personalNotes||[];
     const m=window.DB.personalNoteChecklistItems||[];
     return { me:me, toplam:n.length, yabanci:n.filter(x=>x.owner!==me).length,
              maddeToplam:m.length, maddeYabanci:m.filter(x=>x.owner!==me).length };
   });
   if(r.yabanci>0 || r.maddeYabanci>0)
     de(`${emp} oturumunda ${r.yabanci} yabancı not + ${r.maddeYabanci} yabancı madde BELLEKTE`);
   else
     ok(`${emp} → bellekte ${r.toplam} not, ${r.maddeToplam} madde · yabancı kayıt: 0`);
   await ctx.close();
 }

 /* Çekmece açılınca gerçekten yükleniyor mu */
 console.log('\n[N4] Çekmece açılınca veri geliyor mu');
 {
   const ctx=await b.newContext({viewport:{width:1440,height:900}});
   const pg=await ctx.newPage();
   await pg.goto(`${B}/app-panel.html?role=sahip`,{waitUntil:'networkidle'});
   await pg.waitForTimeout(300);
   const oncesi=await pg.evaluate(()=>!!(window.DB&&window.DB.personalNotes));
   await pg.click('#gvNote');
   await pg.waitForTimeout(700);
   const sonrasi=await pg.evaluate(()=>!!(window.DB&&window.DB.personalNotes));
   const alanVar=await pg.locator('#qnText').count();
   (!oncesi && sonrasi && alanVar)
     ? ok('çekmece açılınca veri yüklendi ve not alanı çizildi')
     : de(`çekmece akışı: önce=${oncesi} sonra=${sonrasi} alan=${alanVar}`);
   await ctx.close();
 }

 await b.close(); srv.close();
 console.log(`\n${bulgu?'✗ BULGU: '+bulgu:'✓ TEMİZ'}\n`);
 process.exit(bulgu?1:0);
})();
