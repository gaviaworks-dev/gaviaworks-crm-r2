#!/usr/bin/env node
/* =====================================================================
   MÜŞTERİ KAPISI EKSENİ — portal kimliği iç veri görüyor mu?

   NEDEN VAR (V2-100 · ADR-R2-47). On dört eksenin hiçbiri bu soruyu
   sormuyordu. Var olan kapılar KAYIT düzeyindeydi:
     · `GV.guardRecord`  → detay ekranında ?id= ile açılan YABANCI kayıt
     · `GV.list` scopeField → liste satırlarının kapsamı
   İkisi de bir kaydın SAHİBİNİ sorar. Panelin kartları ise kayıt açmaz,
   defterin TAMAMINI toplar (`DB.approvals` sayısı, `DB.projects` ilk üçü,
   `DB.leaves` isimleri). Toplayan yüzeyin sahibi yoktur; iki kapı da onu
   görmez. Bu eksen üçüncü soruyu sorar: **ekranın BASTIĞI metinde,
   müşteri oturumunun görmemesi gereken bir iç ad ya da kod var mı.**

   ÖLÇÜM YÖNTEMİ — üç sınıf, hepsi veriden türetilir, elle liste yok:
     S1 PERSONEL KİMLİĞİ  `DB.employees[].ad` · `EMP-\d+`
     S2 YABANCI KAYIT     `musteri` ekseni OLAN defterlerde, oturumun
                          müşterisine ait OLMAYAN kayıt kodu
     S3 İÇ DEFTER         müşteri ekseni HİÇ olmayan defterlerin kodları
                          (bildirim · onay · izin · satın alma · duyuru ·
                          demirbaş · araç · personel)

   Ölçülen metin: `.gv-main` içindeki GÖRÜNÜR metin (üst çubuk ve rail
   ayrı sayılır — sayaç rozeti de bir yüzeydir). Gizli düğüm sayılmaz;
   `hidden`/`display:none` bir sızıntı değildir, ama `<details>` içindeki
   kapalı metin SAYILIR — açması bir tıklama uzaktadır.

   İKİ YÖNLÜ SINAMA: `GV_BOZ=1` ile koşarsa eksen kendi dedektörünü
   sağır olup olmadığına karşı sınar (bkz. §SAĞIRLIK).
   ===================================================================== */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : path.resolve(__dirname, '..', '..');
const PORT = Number(process.env.GV_PORT || 8794);
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8',
               '.js':'text/javascript; charset=utf-8', '.json':'application/json',
               '.svg':'image/svg+xml', '.woff2':'font/woff2' };

function sunucu(){
  return http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const p = path.join(ROOT, u === '/' ? 'index.html' : u);
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
      res.writeHead(404); return res.end('yok');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
}

/* Ölçülen ekranlar — `GV.built` diskteki gerçek listedir, elle kopya
   tutulmaz. Kabuk yüklemeyen iki dış ödeme ekranı ile giriş ekranının
   oturumu yoktur, kapsam dışıdır. */
const HARIC = new Set(['index.html', 'app-odeme.html', 'app-odeme-sonuc.html']);

/* ---- KARARA AÇIK, SESSİZE ALINMAMIŞ MARUZİYET ----------------------
   Bir bulguyu "bu normaldir" diye susturmak, eksenin kendi ölçümünü
   ekranın yorumuyla ezmesidir. Onun yerine karar BURADA yazılıdır ve
   HER KOŞUMDA basılır: eksen yeşil yanar ama maruziyet görünür kalır.
   Kaldırılması ya da genişletilmesi Beyar kararıdır (V2-105).

   Vaka: müşterinin KENDİ talebinde, talebi üstlenen destek uzmanının adı
   ve talebin denetim izindeki iç aktörler basılıyor. Ölçüldü: DST-2026-120
   (`musteri:MUS-2024-001` = oturumun kendi hesabı) → `Ayşe Kaplan`,
   1 künye satırı + 2 aktivite satırı. Başka bir firmanın verisi DEĞİL,
   toplayan bir iç defter DE değil — müşterinin kendi kaydının tarafları.
   Portal ürünlerinde bu genelde İSTENEN davranıştır; ama bir karardır ve
   verilmemiştir, o yüzden kapatılmadı da susturulmadı da. */
const KARARA_ACIK = [
  { ekran:/^app-destek-detay\.html/, sinif:'S1 personel kimliği',
    sebep:'müşterinin KENDİ talebinde talebi üstlenen uzmanın adı ve denetim izindeki iç aktörler (V2-105 · karar bekliyor)' }
];

/* Detay/form ekranları bir kayıt ister. Müşteri oturumunun KENDİ kaydı ile
   YABANCI kayıt AYRI ölçülür: kapıyı yalnız reddettiği yönde ölçmek,
   kabul ettiği yönü hiç çizmemektir (L-39). Kod seçimi ölçümden gelir —
   `?id=` verilmeyen detay ekranı zaten `DB.<kol>[0]`a düşer ve o da bir
   ölçüm vakasıdır (kendi seçmediği kayda düşmek de bir yüzeydir). */
const EK_VAKA = [
  'app-musteri-detay.html?id=MUS-2026-008',
  'app-proje-detay.html?id=PRJ-2026-003',
  'app-destek-detay.html?id=DST-2026-120',
  'app-fatura-detay.html?id=FTR-2026-025',
  'app-teklif-detay.html?id=TKL-2026-014',
  'app-gorev-detay.html?id=GRV-2026-113',
  'app-personel-detay.html?id=EMP-006',
  'app-izin-detay.html?id=IZN-2026-038',
  'app-demirbas-detay.html?id=DMB-2025-007',
  'app-arac-detay.html?id=ARC-001',
  'app-varlik.html?t=filo',
  'app-zaman.html#izin',
  'app-ayar-log.html#arsiv',
  'app-rapor.html'
];

/* Sayfa İÇİNDE koşar. Sızıntı sözlüğünü DB'den kurar — betik kendi
   listesini taşımaz, taşısa veri değişince sessizce sağırlaşırdı. */
const OLC = (bozBayrak) => {
  const D = window.DB || {};
  const S = window.GV && GV.session ? GV.session : {};
  const benim = S.musteri || null;
  if (!benim) return { atla: 'oturum müşteri değil' };

  /* --- BASILAN metin ------------------------------------------------
     ⚠️ CSS GÖRÜNÜRLÜĞÜ ÖLÇÜLMEZ ve bu bilinçlidir. İlk yazımda
     `display:none` düğümler ölçümden düşülüyordu; ölçüldü ve o karar
     YANLIŞTI: `app-destek-form.html`in "Yönlendirme" sekmesi 16 personeli
     ADIYLA ve bütün müşterilerin yetkililerini `<option>` olarak basıyor,
     sekme paneli yalnız `display:none` ile duruyor. Bir tıklama uzaklıktaki
     veri gizli değildir — DOM'a yazılmış veri zaten istemciye gitmiştir.
     Kapı CSS'te olmaz. Ölçülen şey bu yüzden BASILAN metindir.
     Yalnız hiç metin olmayan düğümler (script/style/template) düşülür. */
  function gorunur(kok){
    if (!kok) return '';
    const par = [];
    const yur = (el) => {
      if (el.nodeType === 3) { par.push(el.nodeValue); return; }
      if (el.nodeType !== 1) return;
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'TEMPLATE') return;
      /* başlık, etiket ve DEĞER öznitelikleri de basılan veridir */
      ['title','aria-label','data-wip','placeholder','value','data-kod'].forEach(a => {
        if (el.hasAttribute(a)) par.push(' ' + el.getAttribute(a) + ' ');
      });
      for (const c of el.childNodes) yur(c);
    };
    yur(kok);
    return par.join(' ').replace(/\s+/g, ' ');
  }

  const main = document.querySelector('.gv-main');
  const kabuk = document.querySelector('.gv-top');
  const rail  = document.querySelector('.gv-rail');
  const metin = {
    ana:   gorunur(main),
    ustcubuk: gorunur(kabuk) + ' ' + gorunur(rail)
  };
  const hepsi = metin.ana + ' ' + metin.ustcubuk;

  /* --- S1 PERSONEL KİMLİĞİ ---------------------------------------- */
  const s1 = [];
  const empKod = hepsi.match(/EMP-\d+/g) || [];
  empKod.forEach(k => s1.push({ tur:'kod', deger:k }));
  (D.employees || []).forEach(e => {
    if (!e.ad || String(e.ad).length < 5) return;
    if (hepsi.indexOf(e.ad) !== -1) s1.push({ tur:'ad', deger:e.ad });
  });

  /* --- S2 YABANCI KAYIT -------------------------------------------- */
  /* `musteri` ekseni OLAN defterler. Kayıt hem KODUYLA hem ADIYLA aranır:
     ilk koşumda `app-proje-detay.html` yetkisiz sayfası yabancı projenin
     KODUNU basmıyordu ama ADINI (`p.ad`) sayfa başlığına basıyordu — yalnız
     kod arayan bir dedektör o sızıntıyı GÖRMEZ. Ad ekseni bu yüzden var.

     ⚠️ Ziyaretçinin KENDİ adres çubuğuna yazdığı kod sızıntı DEĞİLDİR
     (`GV.guardRecord` onu bilerek yankılar: ne aradığını söylemek, başka
     bir kaydı söylemek değildir). O kod ölçümden düşülür. */
  const MUS_EKSENLI = ['projects','tickets','quotes','invoices','payments',
                       'opportunities','contracts','paymentLinks','customers'];
  let urlId = '';
  try { urlId = new URLSearchParams(location.search).get('id') || ''; } catch(e){}
  const s2 = [];
  const kelime = (deger) => {
    if (!deger || String(deger).length < 5) return false;
    const re = new RegExp('(^|[^A-Za-zÇĞİÖŞÜçğıöşü0-9-])' +
      String(deger).replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '([^A-Za-zÇĞİÖŞÜçğıöşü0-9-]|$)');
    return re.test(hepsi);
  };
  MUS_EKSENLI.forEach(kol => {
    (D[kol] || []).forEach(r => {
      if (!r.kod) return;
      const sahip = kol === 'customers' ? r.kod : (r.musteri || r.hesap || null);
      if (sahip && String(sahip) === String(benim)) return;   /* kendi kaydı */
      if (String(r.kod) !== String(urlId) && kelime(r.kod))
        s2.push({ kol, tur:'kod', deger:r.kod, sahibi: sahip || '(sahipsiz)' });
      /* Bir kaydın OKUNUR ADI birden çok alanda yaşayabilir — müşteri
         defterinde hem `unvan` hem `kisa` var ve ekranlar ikisini de
         basar. Yalnız birini aramak diğerini görmemek olurdu. */
      [r.unvan, r.kisa, r.ad, r.baslik].forEach(ad => {
        if (ad && kelime(ad)) s2.push({ kol, tur:'ad', deger:ad, sahibi: sahip || '(sahipsiz)' });
      });
    });
  });

  /* --- S3 İÇ DEFTER ------------------------------------------------- */
  /* Müşteri ekseni HİÇ olmayan defterler: kaydın sahibi sorulamaz, defterin
     tamamı iç veridir. */
  const IC_DEFTER = ['notifications','approvals','leaves','purchases','announcements',
                     'assets','vehicles','employees','onboarding','performance',
                     'assetHandovers','maintenance','fines','logs'];
  const s3 = [];
  IC_DEFTER.forEach(kol => {
    (D[kol] || []).forEach(r => {
      if (!r.kod) return;
      const re = new RegExp('(^|[^A-Za-z0-9-])' + r.kod.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '([^A-Za-z0-9-]|$)');
      if (re.test(hepsi)) s3.push({ kol, kod:r.kod });
    });
  });

  return {
    musteri: benim,
    denied: (window.__gvOlcum || {}).denied || 0,
    s1, s2, s3,
    /* ham sayaçlar — rapor "kaç kayıt · kaç isim" der */
    isim: s1.filter(x => x.tur === 'ad').length,
    kayit: s2.length + s3.length
  };
};

/* ---- SAĞIRLIK SINAMASI ---------------------------------------------
   Dedektör, olmayan kusuru bulmadığını değil, VAR OLAN kusuru bulduğunu
   kanıtlamalı. `GV_BOZ=1` sayfaya bilerek bir sızıntı enjekte eder:
   panelin ana bölgesine bir personel adı, bir iç defter kodu ve bir
   yabancı proje kodu basılır. Üç sınıf da yakalamazsa eksen SAĞIRDIR. */
const BOZ = () => {
  const D = window.DB || {};
  const main = document.querySelector('.gv-main');
  if (!main) return;
  const e = (D.employees || [])[0];
  const b = (D.notifications || [])[0];
  const p = (D.projects || []).filter(x => x.musteri !== (GV.session||{}).musteri)[0];
  const d = document.createElement('div');
  d.className = 'gv-boz';
  d.textContent = [e && e.ad, e && e.kod, b && b.kod, p && p.kod].filter(Boolean).join(' · ');
  main.appendChild(d);
};

(async () => {
  const basladi = Date.now();
  const srv = sunucu();
  await new Promise(r => srv.listen(PORT, '127.0.0.1', r));
  const base = `http://127.0.0.1:${PORT}`;
  const boz = process.env.GV_BOZ === '1';
  const browser = await chromium.launch();

  /* Ekran listesi diskteki `GV.built`ten okunur. */
  const ctx0 = await browser.newContext();
  const p0 = await ctx0.newPage();
  await p0.route(u => /^https?:/.test(u.toString()) && !u.toString().startsWith(base), r => r.abort());
  await p0.goto(base + '/app-panel.html?role=sahip', { waitUntil:'domcontentloaded', timeout:20000 }).catch(()=>{});
  await p0.waitForSelector('.gv-app', { timeout:5000 }).catch(()=>{});
  const built = await p0.evaluate(() => (window.GV && GV.built) ? GV.built.slice() : []);
  await ctx0.close();
  if (!built.length) { console.error('EKSEN KOŞAMADI — GV.built okunamadı'); process.exit(2); }

  const vakalar = built.filter(f => !HARIC.has(f)).concat(EK_VAKA);

  const bulgular = [];
  const kabuller = [];
  let olculen = 0, atlanan = 0, denied = 0;
  const acik = [], kapali = [];
  let toplamIsim = 0, toplamKayit = 0;

  for (const v of vakalar) {
    const [yol, parca] = v.split('#');
    const url = base + '/' + yol + (yol.indexOf('?') === -1 ? '?role=musteri' : '&role=musteri') +
                (parca ? '#' + parca : '');
    const ctx = await browser.newContext({ viewport:{ width:1440, height:900 } });
    const page = await ctx.newPage();
    await page.route(u => /^https?:/.test(u.toString()) && !u.toString().startsWith(base), r => r.abort());
    await page.addInitScript(() => {
      window.__gvOlcum = { ready:0, denied:0 };
      document.addEventListener('gv:ready',  () => { window.__gvOlcum.ready++; });
      document.addEventListener('gv:denied', () => { window.__gvOlcum.denied++; });
    });
    await page.goto(url, { waitUntil:'domcontentloaded', timeout:20000 }).catch(()=>{});
    await page.waitForSelector('.gv-app', { timeout:5000 }).catch(()=>{});
    await page.waitForFunction(() => (window.__gvOlcum||{}).ready || (window.__gvOlcum||{}).denied, null, { timeout:5000 }).catch(()=>{});
    if (boz) await page.evaluate(BOZ).catch(()=>{});
    const r = await page.evaluate(OLC).catch(e => ({ hata:String(e.message).slice(0,160) }));
    await ctx.close();

    if (!r || r.hata) { atlanan++; bulgular.push({ ekran:v, sinif:'ÖLÇÜLEMEDİ', ayrinti:(r&&r.hata)||'boş' }); continue; }
    if (r.atla) { atlanan++; continue; }
    olculen++;
    if (r.denied) { denied++; kapali.push(v); } else { acik.push(v); }
    toplamIsim += r.isim; toplamKayit += r.kayit;
    /* Bozuk kopya kipinde kabul listesi UYGULANMAZ: ölçülen şey dedektörün
       sağırlığıdır, kararların doğruluğu değil. */
    const kabulMu = (sinif) => boz ? null : KARARA_ACIK.find(k => k.ekran.test(v) && k.sinif === sinif);
    const yaz = (sinif, liste, ornek) => {
      if (!liste.length) return;
      const k = kabulMu(sinif);
      (k ? kabuller : bulgular).push({ ekran:v, sinif, adet:liste.length, ornek, sebep:k && k.sebep });
    };
    yaz('S1 personel kimliği', r.s1, [...new Set(r.s1.map(x=>x.deger))].slice(0,6));
    yaz('S2 yabancı kayıt', r.s2, [...new Set(r.s2.map(x=>x.kol+':'+x.deger))].slice(0,6));
    yaz('S3 iç defter', r.s3, [...new Set(r.s3.map(x=>x.kol+':'+x.kod))].slice(0,6));
  }

  await browser.close();
  srv.close();

  const sn = ((Date.now()-basladi)/1000).toFixed(1);
  const sizanEkran = new Set(bulgular.filter(b=>b.sinif!=='ÖLÇÜLEMEDİ').map(b=>b.ekran)).size;
  console.log('\n=== MÜŞTERİ KAPISI EKSENİ ' + (boz ? '· BOZUK KOPYA KİPİ' : '') + ' ===');
  console.log('  ölçülen yüzey : ' + olculen + ' (atlanan ' + atlanan + ')');
  console.log('  müşterinin ULAŞABİLDİĞİ yüzey: ' + acik.length + ' · kabuk 403 basan: ' + denied);
  console.log('  sızan yüzey   : ' + sizanEkran);
  console.log('  görünen isim  : ' + toplamIsim + ' · görünen iç/yabancı kayıt: ' + toplamKayit);
  console.log('  süre          : ' + sn + ' sn');
  if (kabuller.length){
    console.log('\n  KARARA AÇIK (bulgu sayılmaz, susturulmaz):');
    kabuller.forEach(b => console.log('   · ' + b.ekran + ' — ' + b.sinif + ' ×' + b.adet +
      ' → ' + (b.ornek||[]).join(', ') + '\n       sebep: ' + b.sebep));
  }
  if (bulgular.length){
    console.log('\n  BULGULAR:');
    bulgular.forEach(b => console.log('   · ' + b.ekran + ' — ' + b.sinif +
      (b.adet ? ' ×' + b.adet : '') + (b.ornek ? ' → ' + b.ornek.join(', ') : '') + (b.ayrinti ? ' → ' + b.ayrinti : '')));
  }
  fs.writeFileSync(path.join(__dirname, 'musteri-kapisi-sonuc.json'),
    JSON.stringify({ boz, olculen, atlanan, denied, acik, kapali, sizanEkran, toplamIsim, toplamKayit, sn:+sn, bulgular, kabuller }, null, 2));

  if (boz){
    /* Bozuk kopyada üç sınıfın ÜÇÜ de yakalanmalı. */
    const siniflar = new Set(bulgular.map(b=>b.sinif));
    const eksik = ['S1 personel kimliği','S2 yabancı kayıt','S3 iç defter'].filter(s=>!siniflar.has(s));
    if (eksik.length){ console.log('\n  ✖ SAĞIR — yakalanamayan sınıf: ' + eksik.join(', ')); process.exit(1); }
    console.log('\n  ✔ DEDEKTÖR SAĞIR DEĞİL — üç sınıfın üçü de yakalandı');
    process.exit(0);
  }
  if (bulgular.length){ console.log('\n  ✖ ' + bulgular.length + ' BULGU'); process.exit(1); }
  console.log('\n  ✔ TEMİZ');
})();
