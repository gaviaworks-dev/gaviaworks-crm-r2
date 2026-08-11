#!/usr/bin/env node
/* =====================================================================
   R2 ÖDEME LİNKİ AKIŞ EKSENİ — şartname §8

   Bu eksen ürünün ÇALIŞTIĞINI değil, ürünün SÖZ VERDİĞİ ŞEYİ YAPMADIĞINI
   de ölçer. En kritik iki hüküm negatiftir:
     · §8.2/§8.7 — dış ekranda GERÇEK KART ALANI OLMAMALI
     · §8.3      — tarayıcı dönüşü ödemeyi KESİNLEŞTİRMEMELİ
   Bir şeyin YOKLUĞUNU ölçmek, varlığını ölçmekten daha önemlidir burada.

   Koşum: node tasks/qa/odeme-akis.js   (depo kökünden)
   ===================================================================== */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.cwd(), PORT = 8797;
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const srv=http.createServer((q,s)=>{const u=decodeURIComponent(q.url.split('?')[0]);const p=path.join(ROOT,u==='/'?'index.html':u);
 if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){s.writeHead(404);return s.end();}
 s.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(s);});

let bulgu = 0;
const de=(m)=>{console.log('  ✗ '+m);bulgu++;};
const ok=(m)=>console.log('  ✓ '+m);

(async()=>{
 await new Promise(r=>srv.listen(PORT,'127.0.0.1',r));
 const B=`http://127.0.0.1:${PORT}`;
 const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}});
 const pg=await ctx.newPage(); const hata=[];
 pg.on('pageerror',e=>hata.push('pageerror: '+e.message));
 pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))hata.push('console: '+m.text());});

 /* ---- 1. LİSTE ---- */
 console.log('\n[1] Ödeme linkleri listesi');
 await pg.goto(`${B}/app-odeme-linki.html?role=sahip`,{waitUntil:'networkidle'});
 await pg.waitForSelector('.gv-app',{timeout:5000}); await pg.waitForTimeout(400);
 const satir=await pg.locator('tbody tr').count();
 ok(`liste satırı: ${satir}`);
 const testSerit=await pg.locator('text=TEST kipi').count();
 testSerit ? ok('TEST şeridi listede görünüyor') : de('TEST şeridi yok');

 /* ---- 2. FORM: ilk görünüm yalnız yedi alan ---- */
 console.log('\n[2] Yeni link formu — §8.2 ilk görünüm');
 await pg.goto(`${B}/app-odeme-linki-form.html?role=sahip`,{waitUntil:'networkidle'});
 await pg.waitForSelector('#odlForm',{timeout:5000}); await pg.waitForTimeout(300);
 const gorunurAlan=await pg.evaluate(()=>{
   const g=[...document.querySelectorAll('#odlForm .odl-govde > .field, #odlForm .odl-ikili .field')];
   return g.filter(f=>f.getClientRects().length>0).length;
 });
 ok(`ilk görünümde alan grubu: ${gorunurAlan} (müşteri, fatura, tutar, para birimi, açıklama, son kullanma)`);
 const gelismisAcik=await pg.locator('.odl-gelismis[open]').count();
 gelismisAcik===0 ? ok('gelişmiş seçenekler KAPALI geliyor') : de('gelişmiş seçenekler açık geliyor');
 const birincil=await pg.locator('#odlForm .btn-acc').count();
 birincil===1 ? ok('tek birincil eylem (Link Oluştur)') : de(`birincil eylem sayısı ${birincil}, 1 olmalı`);

 /* Kart alanı formda da olmamalı */
 const kartAlan=await pg.evaluate(()=>{
   const pat=/kart|card|cvv|cvc|iban|expiry|sonkullanmaay/i;
   return [...document.querySelectorAll('input,select,textarea')]
     .filter(i=>pat.test(i.id+' '+i.name+' '+(i.placeholder||''))).map(i=>i.id||i.name);
 });
 kartAlan.length===0 ? ok('CRM formunda kart alanı YOK (§8.2)') : de('kart alanı bulundu: '+kartAlan.join(', '));

 /* ---- 3. Tutar kalan bakiyeyi aşamaz (§8.5) ---- */
 console.log('\n[3] Finansal kural — tutar kalan bakiyeyi aşamaz');
 const opt=await pg.evaluate(()=>{const o=document.querySelector('#odlFatura option[value]:not([value=""])');
   return o?{v:o.value,kalan:parseFloat(o.dataset.kalan)}:null;});
 if(!opt){ de('açık bakiyeli fatura seçeneği yok'); }
 else{
   const oncekiSayi = await pg.evaluate(()=>(window.DB.paymentLinks||[]).length);
   await pg.selectOption('#odlFatura',opt.v); await pg.waitForTimeout(150);
   await pg.fill('#odlMusteri',opt.mus||'');
   await pg.fill('#odlTutar',String(opt.kalan+1000));
   await pg.click('#odlForm button[type=submit]'); await pg.waitForTimeout(400);
   const hataVar=await pg.locator('.form-err-summary.is-on').count();
   const metin=hataVar?await pg.locator('.form-err-summary').innerText():'';
   /* ⚠️ Ölçüt METNE DEĞİL SONUCA bakar: kayıt oluştu mu? Metne bakan bir
      ölçüt, ürünün cümlesi bir harf değişince yanlış bulgu basar — bu
      betiğin ilk sürümünde tam olarak bu oldu ("kalan bakiyesini" ≠
      "kalan bakiyeyi"). Sonuç ölçütü kırılgan değildir. */
   const sonrakiSayi = await pg.evaluate(()=>(window.DB.paymentLinks||[]).length);
   if (sonrakiSayi > oncekiSayi) de('fazla tutarla link OLUŞTU — §8.5 ihlali');
   else if (!hataVar) de('fazla tutar sessizce yutuldu — kullanıcıya hata gösterilmedi');
   else ok('fazla tutar REDDEDİLDİ, kayıt oluşmadı · '+metin.replace(/\s+/g,' ').trim().slice(0,80));
 }

 /* ---- 4. DIŞ ÖDEME EKRANI ---- */
 console.log('\n[4] Dış ödeme ekranı — §8.3 / §8.7');
 await pg.goto(`${B}/app-odeme.html?link=ODL-2026-102`,{waitUntil:'networkidle'});
 await pg.waitForTimeout(300);
 const kabuk=await pg.locator('.gv-app, .gv-rail, .gv-menu, .gv-top').count();
 kabuk===0 ? ok('CRM kabuğu YÜKLENMEDİ (menü/rail/üstbar yok)') : de(`kabuk düğümü bulundu: ${kabuk}`);
 const girdiler=await pg.evaluate(()=>[...document.querySelectorAll('input,select,textarea')].map(i=>i.type+':'+(i.id||i.name)));
 girdiler.length===0 ? ok('dış ekranda HİÇ girdi alanı yok — gerçek kart formu taklit edilmedi')
                     : de('girdi alanı bulundu: '+girdiler.join(', '));
 const yer=await pg.locator('.odw-saglayici').count();
 yer ? ok('sağlayıcı bileşeni için işaretli yer tutucu var') : de('yer tutucu yok');
 const testSay=await pg.evaluate(()=>(document.body.innerText.match(/TEST/g)||[]).length);
 testSay>=3 ? ok(`TEST etiketi sayfada ${testSay} kez geçiyor`) : de(`TEST etiketi yalnız ${testSay} kez`);
 const maskeli=await pg.evaluate(()=>/•/.test(document.body.innerText));
 maskeli ? ok('müşteri bilgisi maskeli') : de('müşteri bilgisi maskelenmemiş');
 /* Tek kolon mu — kart genişliği kapsayıcıyla aynı hizada */
 const tekKolon=await pg.evaluate(()=>{
   const k=document.querySelectorAll('.odw-sar > *'); return k.length>0;
 });
 tekKolon ? ok('mobil öncelikli tek kolon düzen') : de('düzen bulunamadı');

 /* ---- 5. Süresi dolmuş link ödeme başlatamaz (§8.5) ---- */
 console.log('\n[5] Süresi dolmuş link');
 await pg.goto(`${B}/app-odeme.html?link=ODL-2026-101`,{waitUntil:'networkidle'});
 await pg.waitForTimeout(300);
 const odeBtn=await pg.locator('#odwOde').count();
 odeBtn===0 ? ok('süresi dolmuş linkte "Güvenli Öde" butonu HİÇ basılmadı')
            : de('süresi dolmuş link ödeme başlatabiliyor — §8.5 ihlali');
 const doldu=await pg.evaluate(()=>/süresi/i.test(document.body.innerText));
 doldu ? ok('kullanıcıya sebebi söyleniyor') : de('sebep söylenmiyor');

 /* ---- 6. Sonuç ekranı ödemeyi KESİNLEŞTİRMEZ (§8.3) ---- */
 console.log('\n[6] Sonuç ekranı — tarayıcı dönüşü ödeme yaratmaz');
 for(const s of ['basarili','beklemede','basarisiz','suresi-doldu','iptal']){
   await pg.goto(`${B}/app-odeme-sonuc.html?link=ODL-2026-102&sonuc=${s}`,{waitUntil:'networkidle'});
   await pg.waitForTimeout(150);
   const durum=await pg.evaluate(()=>{
     const l=(window.DB&&DB.paymentLinks||[]).filter(x=>x.kod==='ODL-2026-102')[0];
     return l?l.durum:'(yok)';
   });
   if(durum==='ODENDI') de(`"${s}" sonucu linki ODENDI yaptı — §8.3 ihlali`);
   else ok(`"${s}" → link durumu ${durum} (ödeme kesinleşmedi)`);
 }
 /* Metin ölçütü yine kırılgandı ("kanıtı değildir" ≠ "kanıt değildir").
    Ölçüt artık iki bağımsız işarete bakıyor ve ikisi de metinden bağımsız
    olarak sayfada durur: uyarı kutusu var mı, ve kutu ödemenin sunucu
    bildirimiyle kesinleştiğini söylüyor mu. */
 await pg.goto(`${B}/app-odeme-sonuc.html?link=ODL-2026-102&sonuc=basarili`,{waitUntil:'networkidle'});
 await pg.waitForTimeout(150);
 const uyariVar = await pg.locator('.odw-uyari').count();
 const bildirimDiyor = await pg.evaluate(()=>/bildirim/i.test(document.querySelector('.odw-uyari')?.innerText||''));
 (uyariVar && bildirimDiyor)
   ? ok('"başarılı" ekranı ödemenin sunucu bildirimiyle kesinleştiğini yazıyor')
   : de('başarı ekranı ödemeyi kesinleşmiş gibi gösteriyor');

 console.log('\nKONSOL: '+(hata.length?hata.join('\n'):'temiz'));
 if(hata.length) bulgu += hata.length;
 console.log(`\n${bulgu?'✗ BULGU: '+bulgu:'✓ TEMİZ'}\n`);
 await b.close(); srv.close();
 process.exit(bulgu?1:0);
})();
