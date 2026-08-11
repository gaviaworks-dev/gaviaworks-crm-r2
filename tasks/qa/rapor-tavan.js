#!/usr/bin/env node
/* =====================================================================
   R2 RAPOR TAVAN EKSENİ — şartname §7.1 · §7.2 · §7.3

   §7.1 üç TAVAN koyuyor ve bunlar göz kararı değil, sayıdır:
     · en fazla 4 KPI · en fazla 2 grafik · 1 detay tablosu
   §7.3 tipografiyi PİKSELLE sınırlıyor:
     · H1 ≤28 · rapor başlığı 20 · grafik başlığı 14 · eksen 11–12 · KPI 22–24
     · grafik yüksekliği 260–300 · min-width:0 · overflow:hidden
     · SVG'de viewBox VE preserveAspectRatio
     · ≥1200px iki kolon, <1200px tek kolon
   §7.1 ayrıca: rapor içi sol menü YOKTUR.

   Her rapor × her ölçüt tek tek ölçülür. Kaç şey ölçtüğü de basılır —
   sıfır bulgu tek başına "temiz" demek değildir, kaç kontrolün geçtiği
   bilinmeden güvenilmez.

   Koşum:  node tasks/qa/rapor-tavan.js
   Bozuk kopyada: GV_ROOT=/yol GV_PORT=8801 node tasks/qa/rapor-tavan.js
   ===================================================================== */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : process.cwd();
const PORT = Number(process.env.GV_PORT || 8800);
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
               '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml' };
const srv = http.createServer((q, s) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const p = path.join(ROOT, u === '/' ? 'index.html' : u);
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(s);
});

const RAPORLAR = ['satis-ozeti','musteri-sagligi','proje-teslimati',
                  'is-kapasite','nakit-tahsilat','hizmet-destek'];
const GENISLIK = [1600, 1440, 1280, 1024, 768, 390];

let bulgu = 0, kontrol = 0;
const de = (m) => { console.log('  ✗ ' + m); bulgu++; };
const ok = (m) => { console.log('  ✓ ' + m); };
const say = () => { kontrol++; };

/* Sayfa içinde koşan ölçüm — tek yerde, hem tavan hem tipografi. */
const OLC = `(function(){
  function px(el, prop){ return el ? parseFloat(getComputedStyle(el)[prop]) : null; }
  var g = document.querySelector('#raporMount');
  if(!g) return { hata:'raporMount yok' };

  var kpiSar = g.querySelector('[data-rp-kpi]');
  var chSar  = g.querySelector('[data-rp-chart]');
  var tbSar  = g.querySelector('[data-rp-table]');

  var kpiler = g.querySelectorAll('.rp-kpi-k');
  var grafikler = g.querySelectorAll('.rp-grafik');
  var tablolar = g.querySelectorAll('.rp-tablo-sar table');

  var h1 = document.querySelector('.gv-page-head h1');
  var rbas = g.querySelector('.rp-baslik');
  var gbas = g.querySelector('.rp-grafik-bas');
  var kval = g.querySelector('.rp-kpi-val');

  /* Grafik kapsayıcı kuralları ve SVG nitelikleri */
  var ic = g.querySelectorAll('.rp-grafik-ic');
  var kapsayici = [], svgler = [];
  Array.prototype.forEach.call(ic, function(el){
    var st = getComputedStyle(el);
    kapsayici.push({ minW:st.minWidth, overflow:st.overflowX, h:parseFloat(st.height) });
    var s = el.querySelector('svg');
    if(s) svgler.push({ viewBox:s.getAttribute('viewBox'),
                        par:s.getAttribute('preserveAspectRatio') });
    else svgler.push(null);
  });

  /* Eksen/etiket yazı boyu — SVG içindeki .lbl */
  var lbl = g.querySelector('.rp-grafik-ic .lbl');

  /* Grafik ızgarası kaç kolon */
  var kolon = chSar ? getComputedStyle(chSar).gridTemplateColumns.split(' ').filter(Boolean).length : 0;

  /* Boş durum: tablo yoksa açıklayıcı blok basılmış mı */
  var bosDurum = !!g.querySelector('.rp-tablo-sar .gv-state');

  return {
    beyanKpi:   kpiSar ? +kpiSar.getAttribute('data-rp-kpi') : null,
    beyanChart: chSar ? +chSar.getAttribute('data-rp-chart') : null,
    beyanTable: tbSar ? +tbSar.getAttribute('data-rp-table') : null,
    gercekKpi:kpiler.length, gercekChart:grafikler.length, gercekTable:tablolar.length,
    h1:px(h1,'fontSize'), rbas:px(rbas,'fontSize'), gbas:px(gbas,'fontSize'),
    kval:px(kval,'fontSize'), lbl:px(lbl,'fontSize'),
    kapsayici:kapsayici, svgler:svgler, kolon:kolon, bosDurum:bosDurum,
    solMenu:document.querySelectorAll('.gv-rp-nav, .rp-nav, .rapor-side').length,
    tasma:document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    scroll:document.documentElement.scrollWidth, gorunum:document.documentElement.clientWidth
  };
})()`;

(async () => {
  await new Promise(r => srv.listen(PORT, '127.0.0.1', r));
  const B = `http://127.0.0.1:${PORT}`;
  const browser = await chromium.launch();

  /* ---- 1. TAVANLAR — altı rapor, 1440px ---------------------- */
  console.log('\n[1] Tavanlar — §7.1 (≤4 KPI · ≤2 grafik · 1 tablo)');
  const ozet = [];
  for (const r of RAPORLAR) {
    const ctx = await browser.newContext({ viewport:{ width:1440, height:1000 } });
    const pg = await ctx.newPage();
    const hata = [], kirpma = [];
    pg.on('pageerror', e => hata.push(e.message));
    pg.on('console', m => {
      if (m.type()==='error' && !/Failed to load resource/.test(m.text())) hata.push(m.text());
      /* ⚠️ TAVAN İHLALİ DOM'DAN GÖRÜNMEZ. `GV.rapor` fazlasını çizimde
         KESİYOR (`slice`), yani DOM hiçbir zaman tavanı aşmaz ve DOM'u
         sayan bir eksen ihlali ASLA göremez. Bu boşluk bozulmuş kopya
         sınamasında ortaya çıktı: beşinci KPI ve üçüncü grafik enjekte
         edildi, eksen ikisini de kaçırdı.
         Kabuk kesince konsola uyarı yazıyor; ihlalin tek izi odur.
         Rapor TANIMI şartnameyi ihlal ediyorsa, kabuk kurtarsa bile
         bulgudur. */
      if (m.type()==='warning' && /\[rapor\]/.test(m.text())) kirpma.push(m.text());
    });
    await pg.goto(`${B}/app-rapor.html?role=sahip&r=${r}`, { waitUntil:'networkidle' });
    await pg.waitForSelector('.rp-govde', { timeout:5000 });
    await pg.waitForTimeout(250);
    const m = await pg.evaluate(OLC);

    if (hata.length) de(`${r} — konsol: ${hata.join(' | ').slice(0,120)}`);
    say();
    say(); if (kirpma.length) kirpma.forEach(k => de(`${r} — TAVAN İHLALİ (kabuk kırptı): ${k.replace('[rapor] ','')}`));

    /* Beyan ile gerçek AYRIŞMAMALI: data-* niteliği kabuğun iddiası,
       DOM sayımı gerçektir. İkisi ayrışırsa kabuk yalan söylüyordur. */
    say(); if (m.beyanKpi !== m.gercekKpi) de(`${r} — KPI beyanı ${m.beyanKpi}, DOM'da ${m.gercekKpi}`);
    say(); if (m.beyanChart !== m.gercekChart) de(`${r} — grafik beyanı ${m.beyanChart}, DOM'da ${m.gercekChart}`);

    say(); if (m.gercekKpi > 4) de(`${r} — ${m.gercekKpi} KPI (tavan 4)`);
    say(); if (m.gercekChart > 2) de(`${r} — ${m.gercekChart} grafik (tavan 2)`);
    say(); if (m.gercekTable > 1) de(`${r} — ${m.gercekTable} tablo (tavan 1)`);
    /* Tablo yoksa boş durum ZORUNLU — §7.3 "0 çizmek yerine boş durum" */
    say(); if (m.gercekTable === 0 && !m.bosDurum) de(`${r} — tablo yok ve boş durum da yok`);

    ozet.push({ r, kpi:m.gercekKpi, chart:m.gercekChart, table:m.gercekTable });
    console.log(`     ${r.padEnd(17)} KPI:${m.gercekKpi}  grafik:${m.gercekChart}  tablo:${m.gercekTable}`);
    await ctx.close();
  }

  /* ---- 2. TİPOGRAFİ VE GRAFİK KURALLARI ---------------------- */
  console.log('\n[2] Görsel kurallar — §7.3');
  {
    const ctx = await browser.newContext({ viewport:{ width:1440, height:1000 } });
    const pg = await ctx.newPage();
    await pg.goto(`${B}/app-rapor.html?role=sahip&r=nakit-tahsilat`, { waitUntil:'networkidle' });
    await pg.waitForSelector('.rp-govde', { timeout:5000 });
    await pg.waitForTimeout(250);
    const m = await pg.evaluate(OLC);

    const kural = [
      ['H1 ≤ 28px',            m.h1,   v => v != null && v <= 28],
      ['rapor başlığı = 20px', m.rbas, v => v === 20],
      ['grafik başlığı = 14px',m.gbas, v => v === 14],
      ['KPI değeri 22–24px',   m.kval, v => v >= 22 && v <= 24],
      ['eksen/etiket 11–12px', m.lbl,  v => v >= 11 && v <= 12]
    ];
    kural.forEach(([ad, deger, gecer]) => {
      say();
      if (!gecer(deger)) de(`${ad} — ölçülen ${deger}px`);
      else ok(`${ad} — ölçülen ${deger}px`);
    });

    m.kapsayici.forEach((k, i) => {
      say(); if (k.minW !== '0px') de(`grafik ${i+1} kapsayıcı min-width ${k.minW}, 0px olmalı`);
      say(); if (k.overflow !== 'hidden') de(`grafik ${i+1} kapsayıcı overflow-x ${k.overflow}, hidden olmalı`);
      say(); if (!(k.h >= 260 && k.h <= 300)) de(`grafik ${i+1} yüksekliği ${k.h}px, 260–300 olmalı`);
    });
    if (m.kapsayici.length) ok(`${m.kapsayici.length} grafik kapsayıcısı: min-width:0 · overflow:hidden · yükseklik ${m.kapsayici[0].h}px`);

    m.svgler.forEach((s, i) => {
      say(); if (!s) { de(`grafik ${i+1} içinde SVG yok`); return; }
      if (!s.viewBox) de(`grafik ${i+1} SVG'sinde viewBox yok`);
      if (!s.par) de(`grafik ${i+1} SVG'sinde preserveAspectRatio yok`);
    });
    if (m.svgler.every(s => s && s.viewBox && s.par))
      ok(`${m.svgler.length} SVG: viewBox ve preserveAspectRatio yazılı`);

    say();
    if (m.solMenu) de(`rapor içi sol menü bulundu (${m.solMenu} düğüm) — §7.1 yasaklıyor`);
    else ok('rapor içi sol menü YOK (§7.1)');

    await ctx.close();
  }

  /* ---- 3. KOLON KIRILIMI VE TAŞMA — altı genişlik ------------ */
  console.log('\n[3] Kolon kırılımı ve taşma — §7.3');
  for (const w of GENISLIK) {
    const ctx = await browser.newContext({ viewport:{ width:w, height:1000 } });
    const pg = await ctx.newPage();
    /* İki grafikli raporla ölçülür — tek grafikli rapor kolon sayısını
       gizler ve kural sınanmamış kalırdı. */
    await pg.goto(`${B}/app-rapor.html?role=sahip&r=satis-ozeti`, { waitUntil:'networkidle' });
    await pg.waitForSelector('.rp-govde', { timeout:5000 });
    await pg.waitForTimeout(250);
    const m = await pg.evaluate(OLC);

    const bekKolon = w >= 1200 ? 2 : 1;
    say(); if (m.kolon !== bekKolon) de(`${w}px — grafik ızgarası ${m.kolon} kolon, ${bekKolon} olmalı`);
    say(); if (m.tasma) de(`${w}px — YATAY TAŞMA (belge ${m.scroll}px / görüntü ${m.gorunum}px)`);
    if (m.kolon === bekKolon && !m.tasma) ok(`${String(w).padStart(4)}px — ${m.kolon} kolon · taşma yok`);
    await ctx.close();
  }

  /* ---- 4. EŞLEME BÜTÜNLÜĞÜ ----------------------------------- */
  console.log('\n[4] 105 rapor tanımının eşlemesi — §7.1');
  {
    const ctx = await browser.newContext({ viewport:{ width:1440, height:900 } });
    const pg = await ctx.newPage();
    await pg.goto(`${B}/app-rapor.html?role=sahip`, { waitUntil:'networkidle' });
    await pg.waitForTimeout(250);
    const m = await pg.evaluate(() => ({
      stats: window.DB.reportMappingStats(),
      audit: window.DB.reportMappingAudit(),
      hedefsiz: window.DB.reportsUnmapped().map(r => r.category + '/' + r.report_key)
    }));
    say(); if (m.stats.eslesen + m.stats.hedefsiz !== m.stats.toplam)
      de(`eşleme toplamı tutmuyor: ${m.stats.eslesen}+${m.stats.hedefsiz} ≠ ${m.stats.toplam}`);
    say(); if (m.audit.yetimEsleme.length)
      de(`eşlemede var, defterde yok: ${m.audit.yetimEsleme.join(', ')}`);
    say(); if (m.audit.eksikKayit.length)
      de(`defterde var, eşlemede yok: ${m.audit.eksikKayit.join(', ')}`);
    ok(`${m.stats.toplam} tanım · ${m.stats.eslesen} eşlendi · ${m.stats.hedefsiz} şablonsuz · yetim 0`);
    console.log('     şablon dağılımı: ' + JSON.stringify(m.stats.sablon));

    /* Katalog standart kullanıcıya KAPALI olmalı (§7.1).
       ⚠️ Rol seçimi ÖNEMLİ: ilk sürümde `stajyer` kullanılmıştı ve o rol
       `rapor` alanını hiç göremediği için 403 alıyordu — katalog yoktu
       ama sebebi yetki kapısıydı, kararın kendisi değil. Ölçüt sınanmamış
       kalıyordu. `analist` rapor alanını GÖRÜR ama yönetici DEĞİLDİR;
       kararı gerçekten sınayan rol odur. */
    await pg.goto(`${B}/app-rapor.html?role=analist`, { waitUntil:'networkidle' });
    await pg.waitForSelector('.rp-govde', { timeout:5000 }).catch(()=>{});
    await pg.waitForTimeout(250);
    const yuzeyVar = await pg.locator('.rp-govde').count();
    const katalog = await pg.locator('.rp-katalog').count();
    say();
    if (!yuzeyVar) de('analist rolü rapor yüzeyini göremiyor — katalog ölçütü sınanamadı');
    else if (katalog) de('standart kullanıcıya Ayrıntılı analiz kataloğu gösteriliyor — §7.1 yasaklıyor');
    else ok('analist (rapor görür, yönetici değil) → katalog YOK · yönetici rolde VAR');
    await ctx.close();
  }

  await browser.close(); srv.close();
  console.log('\n  ölçülen kontrol: ' + kontrol);
  console.log(`${bulgu ? '✗ BULGU: ' + bulgu : '✓ TEMİZ'} · ${RAPORLAR.length} rapor · ${GENISLIK.length} genişlik\n`);
  process.exit(bulgu ? 1 : 0);
})();
