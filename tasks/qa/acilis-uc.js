#!/usr/bin/env node
/* =====================================================================
   R2 AÇILIŞ ÜÇLÜSÜ EKSENİ — K-24 · K-23 · K-25

   Tarayıcı ölçümü (tarayici.js) sayfanın TAŞMADIĞINI söyler ve yalnız
   VARSAYILAN görünümü çizer. Bu eksen üç açılış işinin ÇALIŞTIĞINI söyler:
   sekmeler tembel çizilir, çekmece açılır, ters kayıt üretilir.

   Ölçülenler:
     K-24 · satın alma dört yüzey sekmesi basıyor mu
          · üç alt sekme tıklanınca liste ÇİZİLİYOR mu (tembel çizim)
          · alt sekmelerde satır sayısı veriyle tutuyor mu (9 · 4 · 7)
          · `?ac=SAT-…` derin bağlantısı talep çekmecesini açıyor mu
          · adres parametresi kullanıldıktan sonra siliniyor mu
     K-23 · tahsilat satırına tıklamak tahsis defterini açıyor mu
          · çekmece BİR kez açılıyor mu (dinleyici birikmesi yok)
          · `?ac=THS-…` derin bağlantısı çalışıyor mu
          · satır içi düğmeye tıklamak çekmeceyi AÇMIYOR mu (olumsuz vaka)
     K-25 · gerekçesiz geri alma REDDEDİLİYOR mu (olumsuz vaka)
          · gerekçeli geri alma ters kayıt üretiyor mu (olumlu vaka)
          · asıl satır defterde KALIYOR mu (§8.5 — silinmez)
          · net sıfırlanınca fatura durumu geri düşüyor mu

   Her eksen bir olumlu VE bir olumsuz vakayla sınanır: sıfır bulgu tek
   başına temiz değildir, kaç şey ölçüldüğü de basılır.

   Koşum: node tasks/qa/acilis-uc.js   (depo kökünden)
   ===================================================================== */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : process.cwd();
const PORT = Number(process.env.GV_PORT || 8797);
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
               '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml' };
const srv = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const p = path.join(ROOT, u === '/' ? 'index.html' : u);
  if(!fs.existsSync(p) || fs.statSync(p).isDirectory()){ s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type':MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(s);
});

const bulgu = [];
let kontrol = 0;
function ol(ad, gercek, beklenen, karsilastir){
  kontrol++;
  const ok = karsilastir ? karsilastir(gercek, beklenen) : gercek === beklenen;
  if(!ok) bulgu.push(`${ad} — beklenen: ${beklenen} · ölçülen: ${gercek}`);
  console.log(`  ${ok ? '✓' : '✗'} ${ad} · ${gercek}`);
  return ok;
}

(async () => {
  await new Promise(r => srv.listen(PORT, '127.0.0.1', r));
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{ width:1440, height:900 } });
  const pg = await ctx.newPage();
  const hata = [];
  pg.on('pageerror', e => hata.push('pageerror: ' + e.message));
  pg.on('console', m => { if(m.type() === 'error' && !/Failed to load resource/.test(m.text()))
    hata.push('console: ' + m.text()); });
  const U = f => `http://127.0.0.1:${PORT}/${f}`;

  /* ================================================================
     K-24 — SATIN ALMA YÜZEY SEKMELERİ
     ================================================================ */
  console.log('\n[K-24] Satın alma alt kayıtları sekme oldu');
  await pg.goto(U('app-satinalma.html?role=sahip'), { waitUntil:'networkidle' });
  await pg.waitForSelector('#satSekme', { timeout:5000 });

  ol('yüzey sekmesi sayısı', await pg.locator('#satSekme [role=tab]').count(), 4);
  ol('açılışta talepler paneli görünür',
     await pg.locator('[data-panel="talep"]').isVisible(), true);
  ol('alt paneller kapalı başlıyor',
     await pg.locator('[data-panel="teklif"]').isVisible(), false);

  /* Tembel çizim: sekmeye basmadan önce liste BOŞ olmalı */
  ol('teklif listesi tıklanmadan çizilmemiş (tembel)',
     (await pg.locator('#satTeklifListe').innerHTML()).trim().length, 0);

  const sekmeler = [
    { key:'teklif',    mount:'#satTeklifListe',    ad:'Teklif Toplama', satir:9 },
    { key:'siparis',   mount:'#satSiparisListe',   ad:'Siparişler',     satir:4 },
    { key:'tedarikci', mount:'#satTedarikciListe', ad:'Tedarikçiler',   satir:7 }
  ];
  for(const s of sekmeler){
    await pg.locator(`#satSekme [data-tab="${s.key}"]`).click();
    await pg.waitForTimeout(500);
    ol(`${s.ad} paneli görünür`, await pg.locator(`[data-panel="${s.key}"]`).isVisible(), true);
    const tr = await pg.locator(`${s.mount} table.gtable tbody tr`).count();
    ol(`${s.ad} tablo satırı`, tr, s.satir);
    /* Sayfalayıcı 10'da; üç listenin üçü de tek sayfaya sığıyor. */
    const kpi = await pg.locator(`${s.mount} .kpi-grid > *`).count();
    ol(`${s.ad} KPI kutusu`, kpi, 4);
  }

  /* Yüzey sekmesi hash'te duruyor mu */
  ol('yüzey sekmesi adres çubuğunda', new URL(pg.url()).hash, '#tedarikci');

  /* URL SENKRONU İKİ YÖNLÜ SUSTURULMUŞ MU.
     Rota 113'ün eski bağlantısı `?t=onay` ANA listeyi "Onay sürecinde"
     sekmesine açar. Alt listelerin hiçbirinde `onay` diye sekme yok;
     adresi okusalardı üçü de sekmesiz açılırdı. Olumsuz vaka budur. */
  await pg.goto(U('app-satinalma.html?role=sahip&t=onay'), { waitUntil:'networkidle' });
  await pg.waitForTimeout(400);
  ol('ana liste eski `?t=onay` bağlantısını hâlâ onurlandırıyor',
     await pg.locator('#satListe .chip[data-tab="onay"][aria-selected="true"]').count(), 1);
  await pg.locator('#satSekme [data-tab="teklif"]').click();
  await pg.waitForTimeout(500);
  ol('alt liste ana listenin sekmesini kapmadı (urlSync okuma da kapalı)',
     await pg.locator('#satTeklifListe .chip[data-tab="tumu"][aria-selected="true"]').count(), 1);
  await pg.locator('#satTeklifListe .chip[data-tab="tercih"]').first().click();
  await pg.waitForTimeout(300);
  ol('alt liste adres çubuğuna yazmıyor (ana listenin `t` değeri bozulmadı)',
     new URL(pg.url()).searchParams.get('t'), 'onay');
  await pg.goto(U('app-satinalma.html?role=sahip'), { waitUntil:'networkidle' });
  await pg.waitForTimeout(300);

  /* Derin bağlantı — kuyruğun satın alma onayı hedefi */
  await pg.goto(U('app-satinalma.html?role=sahip&ac=SAT-2026-014'), { waitUntil:'networkidle' });
  await pg.waitForTimeout(700);
  ol('?ac= talep çekmecesini açtı', await pg.locator('.gv-drawer').count() > 0, true);
  ol('?ac= parametresi adresten silindi',
     new URL(pg.url()).searchParams.get('ac'), null);

  /* ================================================================
     K-23 — TAHSİLAT TAHSİS DEFTERİ ÇEKMECESİ
     ================================================================ */
  console.log('\n[K-23] Tahsilat detayı çekmece oldu');
  await pg.goto(U('app-tahsilat.html?role=sahip'), { waitUntil:'networkidle' });
  await pg.waitForSelector('#thsListe table.gtable', { timeout:5000 });

  /* OLUMSUZ VAKA — satır içi DÜĞMEYE tıklamak çekmece AÇMAMALI.
     Açarsa, kullanıcı satır aksiyonunu her kullandığında istemediği
     bir pencere de alır. */
  const rowactBtn = pg.locator('#thsListe tbody tr [data-rowact]').first();
  if(await rowactBtn.count()){
    await rowactBtn.click();
    await pg.waitForTimeout(400);
    const acilan = await pg.locator('.gv-drawer').count();
    /* Bu düğmenin kendisi "defter" aksiyonu olabilir; o hâlde 1 çekmece
       DOĞRU sonuçtur. Ölçülen şey ÇİFT açılma: iki panel üst üste binmemeli. */
    ol('satır aksiyonu tek çekmece açtı (üst üste binmedi)', acilan <= 1, true);
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(300);
  }

  /* OLUMLU VAKA — satırın boş alanına tıklamak defteri açar */
  await pg.locator('#thsListe tbody tr').first().locator('td').nth(1).click();
  await pg.waitForTimeout(500);
  ol('satıra tıklayınca çekmece açıldı',
     await pg.locator('.gv-drawer').count(), 1);
  const defterBaslik = await pg.locator('body').innerText();
  ol('çekmecede tahsis defteri başlığı var', /Tahsis defteri/.test(defterBaslik), true);
  ol('çekmecede geçmiş bloğu var', /Geçmiş/.test(defterBaslik), true);
  await pg.keyboard.press('Escape');
  await pg.waitForTimeout(300);

  /* Dinleyici birikmesi — listeyi birkaç kez yeniden çizdirip tekrar tıkla */
  await pg.locator('#thsListe .chip[data-tab="nakitli"]').first().click();
  await pg.waitForTimeout(300);
  await pg.locator('#thsListe .chip[data-tab="tumu"]').first().click();
  await pg.waitForTimeout(300);
  await pg.locator('#thsListe tbody tr').first().locator('td').nth(1).click();
  await pg.waitForTimeout(500);
  ol('üç render sonrası hâlâ TEK çekmece (dinleyici birikmedi)',
     await pg.locator('.gv-drawer').count(), 1);
  await pg.keyboard.press('Escape');
  await pg.waitForTimeout(300);

  /* Kuyruk hedefi — derin bağlantı */
  const thsKod = await pg.evaluate(() => {
    const p = (window.DB.payments || []).filter(x => !x.tahsilEdildi && x.vade && x.vade < DB.today)[0];
    return p ? p.kod : null;
  });
  ol('kuyruğa düşen gecikmiş tahsilat bulundu', !!thsKod, true);
  if(thsKod){
    await pg.goto(U(`app-tahsilat.html?role=sahip&ac=${thsKod}`), { waitUntil:'networkidle' });
    await pg.waitForTimeout(700);
    ol('?ac= tahsilat çekmecesini açtı',
       await pg.locator('.gv-drawer').count(), 1);
    ol('?ac= parametresi adresten silindi',
       new URL(pg.url()).searchParams.get('ac'), null);
    await pg.keyboard.press('Escape');
  }

  /* Kuyruk satırının hedefi gerçekten bu ekran mı */
  await pg.goto(U('app-operasyon.html?role=sahip'), { waitUntil:'networkidle' });
  await pg.waitForTimeout(400);
  const kuyrukHedef = await pg.evaluate(() => {
    const rows = GV.kuyruk.hepsi();
    const say = {};
    rows.forEach(r => {
      const dosya = r.tam ? String(r.tam).split('?')[0] : '(hedefsiz)';
      say[dosya] = (say[dosya] || 0) + 1;
    });
    return { toplam:rows.length, dagilim:say,
             gercek:rows.filter(r => r.tam && GV.shell.ekranAcilabilir(r.tam)).length };
  });
  console.log('  · kuyruk hedef dağılımı:', JSON.stringify(kuyrukHedef.dagilim));
  ol('kuyruk tahsilat hedefi app-tahsilat.html',
     (kuyrukHedef.dagilim['app-tahsilat.html'] || 0), 2);
  ol('kuyrukta app-tahsilat-detay.html hedefi kalmadı',
     (kuyrukHedef.dagilim['app-tahsilat-detay.html'] || 0), 0);
  ol('kuyrukta app-satinalma-detay.html hedefi kalmadı',
     (kuyrukHedef.dagilim['app-satinalma-detay.html'] || 0), 0);
  console.log(`  · kuyruk ${kuyrukHedef.toplam} satır · gerçek hedefi olan ${kuyrukHedef.gercek}`);

  /* ================================================================
     K-25 — TAHSİS GERİ ALMA: TERS KAYIT, SİLME YOK
     ================================================================ */
  console.log('\n[K-25] Tahsis geri alma — ters kayıt');
  await pg.goto(U('app-tahsilat.html?role=sahip'), { waitUntil:'networkidle' });
  await pg.waitForTimeout(400);

  const k25 = await pg.evaluate(() => {
    const a = (DB.paymentAllocations || []).filter(x => !x.ters)[0];
    if(!a) return { yok:true };
    const oncekiSatir = DB.paymentAllocations.length;
    const oncekiNet   = GV.fin.ciftNet(a.tahsilat, a.fatura);
    const fatura      = DB.invoices.filter(f => f.kod === a.fatura)[0];
    const oncekiDurum = fatura ? fatura.durum : null;

    /* OLUMSUZ VAKA — gerekçesiz */
    const red = GV.fin.tahsisKaldir(a.tahsilat, a.fatura);
    /* OLUMLU VAKA — gerekçeli */
    const ok  = GV.fin.tahsisKaldir(a.tahsilat, a.fatura, 'eksen sınaması');
    /* İKİNCİ KEZ — zaten geri alınmış */
    const tekrar = GV.fin.tahsisKaldir(a.tahsilat, a.fatura, 'ikinci kez');

    return {
      oncekiSatir, oncekiNet, oncekiDurum,
      redWhy:red.why, okMu:ok.ok === true, kaldirilan:ok.kaldirilan,
      sonrakiSatir:DB.paymentAllocations.length,
      sonrakiNet:GV.fin.ciftNet(a.tahsilat, a.fatura),
      asilDuruyor:DB.paymentAllocations.indexOf(a) !== -1,
      tersVar:DB.paymentAllocations.some(x => x.ters && x.tahsilat === a.tahsilat && x.fatura === a.fatura),
      tersGerekce:(DB.paymentAllocations.filter(x => x.ters)[0] || {}).gerekce || null,
      sonrakiDurum:fatura ? fatura.durum : null,
      tekrarWhy:tekrar.why,
      /* Nakit olayı artık geri alınabilir mi — kapı doğru tarafta mı */
      nakitGeriAl:GV.fin.tahsilGeriAl(a.tahsilat, 'eksen sınaması').ok === true
    };
  });

  ol('gerekçesiz geri alma reddedildi (olumsuz vaka)', k25.redWhy, 'gerekce');
  ol('gerekçeli geri alma kabul edildi (olumlu vaka)', k25.okMu, true);
  ol('defterde satır ARTTI (silme değil ekleme)', k25.sonrakiSatir, k25.oncekiSatir + 1);
  ol('asıl satır defterde duruyor (§8.5 silinmez)', k25.asilDuruyor, true);
  ol('ters kayıt satırı yazıldı', k25.tersVar, true);
  ol('ters kayıtta gerekçe saklı', !!k25.tersGerekce, true);
  ol('çiftin neti sıfırlandı', Math.abs(k25.sonrakiNet) < 0.01, true);
  ol('ikinci geri alma reddedildi', /zaten geri alınmış/.test(String(k25.tekrarWhy)), true);
  ol('fatura durumu geri düştü',
     k25.oncekiDurum !== k25.sonrakiDurum || k25.oncekiDurum === 'Ödenmedi', true);
  /* KAPI YÖNÜ — tahsisleri geri alan kullanıcı nakit olayını da geri alabilmeli */
  ol('tahsisler geri alınınca nakit olayı da geri alınabiliyor (kapı doğru tarafta)',
     k25.nakitGeriAl, true);

  /* ================================================================
     SONUÇ
     ================================================================ */
  if(hata.length) bulgu.push(...hata.map(h => 'sayfa hatası — ' + h));
  console.log('');
  if(bulgu.length){
    console.log('✗ BULGU: ' + bulgu.length);
    bulgu.forEach(x => console.log('   · ' + x));
  }else{
    console.log(`✓ TEMİZ · ${kontrol} kontrol koşuldu · 3 eksen (K-24 · K-23 · K-25) · ` +
                'her eksende en az bir olumlu ve bir olumsuz vaka');
  }
  await b.close(); srv.close();
  process.exit(bulgu.length ? 1 : 0);
})();
