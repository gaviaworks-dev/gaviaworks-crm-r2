#!/usr/bin/env node
/* =====================================================================
   R2 OPERASYON AKIŞ EKSENİ — şartname §6

   Tarayıcı ölçümü (tasks/qa/tarayici.js) sayfanın TAŞMADIĞINI söyler;
   bu eksen sayfanın ÇALIŞTIĞINI söyler. İkisi ayrı sorudur.

   Ölçülenler:
     · kuyruk beş tipi de dolduruyor mu, sayaç satır sayısıyla tutuyor mu
     · satır seçilince sağ panel özet + eylem + geçmiş basıyor mu
     · onay satırında Onayla/Reddet çıkıyor mu
     · ayırıcı §6.2 sınırlarında kilitleniyor mu (sol %30..%50)
     · bölme tercihi saklanıyor mu
     · gerekçe zorunluluğu boş gönderimi REDDEDİYOR mu
     · backend payı beyanı ekranda duruyor mu

   Koşum: node tasks/qa/ops-akis.js   (depo kökünden)
   ===================================================================== */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.cwd(), PORT = 8796;
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);const p=path.join(ROOT,u==='/'?'index.html':u);
 if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){s.writeHead(404);return s.end();}
 s.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(s);});
(async()=>{
 await new Promise(r=>srv.listen(PORT,'127.0.0.1',r));
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}});
 const pg=await ctx.newPage(); const hata=[];
 pg.on('pageerror',e=>hata.push('pageerror: '+e.message));
 pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))hata.push('console: '+m.text());});
 await pg.goto(`http://127.0.0.1:${PORT}/app-operasyon.html?role=sahip`,{waitUntil:'networkidle'});
 await pg.waitForSelector('.ops-split',{timeout:5000});
 await pg.waitForTimeout(300);

 const satir=await pg.locator('.ops-satir').count();
 console.log('kuyruk satiri:',satir);
 const cip=await pg.locator('.ops-cip[data-tip]').count();
 console.log('tip cipi:',cip);
 const sayac=await pg.locator('.ops-sayac').innerText();
 console.log('sayac:',sayac.trim());

 // Ilk satiri sec
 await pg.locator('.ops-satir').first().click();
 await pg.waitForTimeout(200);
 const panelVar=await pg.locator('.ops-panel-ic').count();
 const baslik=await pg.locator('.ops-panel-head h2').innerText().catch(()=>'(yok)');
 const eylem=await pg.locator('.ops-eylemler .btn').count();
 const alan=await pg.locator('.ops-dl dt').count();
 console.log('panel:',panelVar,'| baslik:',baslik.slice(0,50),'| eylem:',eylem,'| ozet alani:',alan);

 // Backend beyani var mi
 const backend=await pg.locator('.ops-backend').count();
 console.log('backend beyani:',backend);

 // Tip filtresi
 await pg.locator('.ops-cip[data-tip="onay"]').click();
 await pg.waitForTimeout(200);
 const onaySatir=await pg.locator('.ops-satir').count();
 console.log('onay filtresi sonrasi satir:',onaySatir);
 // Onay satirinda Onayla/Reddet var mi
 await pg.locator('.ops-satir').first().click(); await pg.waitForTimeout(200);
 const btnlar=await pg.locator('.ops-eylemler .btn').allInnerTexts();
 console.log('onay satiri eylemleri:',btnlar.map(x=>x.trim()).join(' | '));

 // Ayirici: klavye ile daralt, sinir tutuyor mu
 await pg.locator('.ops-cip[data-tip="onay"]').click(); await pg.waitForTimeout(150);
 const ay=pg.locator('.ops-ayrac'); await ay.focus();
 for(let i=0;i<20;i++) await pg.keyboard.press('ArrowLeft');
 const alt=await pg.locator('.ops-split').evaluate(e=>e.style.getPropertyValue('--ops-sol'));
 for(let i=0;i<40;i++) await pg.keyboard.press('ArrowRight');
 const ust=await pg.locator('.ops-split').evaluate(e=>e.style.getPropertyValue('--ops-sol'));
 console.log('ayirici alt sinir:',alt,'| ust sinir:',ust,'(30%..50% olmali)');

 // Tercih saklandi mi
 const ls=await pg.evaluate(()=>localStorage.getItem('gv.ops.bolme'));
 console.log('saklanan bolme tercihi:',ls);

 // Gerekce zorunlulugu: Aktivite ekle -> bos gonder
 await pg.locator('.ops-satir').first().click(); await pg.waitForTimeout(200);
 const aktBtn=pg.locator('.ops-eylemler [data-act="aktivite"]');
 if(await aktBtn.count()){
   await aktBtn.click(); await pg.waitForTimeout(300);
   const modalVar=await pg.locator('.gv-modal, [class*=modal]').count();
   console.log('aktivite penceresi acildi:',modalVar>0);
   // bos gonder
   const onayBtn=pg.locator('button:has-text("Aktivite ekle")').last();
   await onayBtn.click().catch(()=>{});
   await pg.waitForTimeout(300);
   const hala=await pg.locator('.gv-modal, [class*=modal]').count();
   console.log('bos aciklama ile kapandi mi (kapanmamali):', hala===0 ? 'KAPANDI (KUSUR)' : 'kapanmadi (dogru)');
 }
 console.log('\nHATA:',hata.length?hata.join('\n'):'yok');
 await b.close(); srv.close();
})();
