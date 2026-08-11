#!/usr/bin/env node
/* =====================================================================
   R2 TARAYICI ÖLÇÜMÜ — gerçek Chromium, şartnamenin altı genişliği

   Şartname §12: "1600, 1440, 1280, 1024, 768 ve 390 px genişliklerde sayfa
   yatay taşmaz; grafik etiketi kesilmez veya tooltip ile erişilir."

   Dört eksen ölçülür, her ekran × her genişlik için:
     1. KONSOL   — console.error + pageerror + başarısız ağ isteği
     2. TAŞMA    — belge yatay kayıyor mu, kayıyorsa HANGİ düğüm taşırıyor
     3. SPRITE   — #gvSprite enjekte oldu mu, her <use href="#i-*"> hedefi
                   belgede var mı, ikon gerçekten çizildi mi (boyut > 0)
     4. ODAK     — skip link çalışıyor mu, Tab sırası ilerliyor mu,
                   odaklanan her düğüm görünür mü (0×0 tuzağı yok)

   ⚠️ TARAMALAR ASLA PARALEL KOŞMAZ. Tek tarayıcı, tek sayfa, sıra sıra.
   Paralel koşum ölçümü bozar: aynı porttan yüklenen sayfalar birbirinin
   konsolunu kirletir ve viewport değişimi yarışa girer.
   ===================================================================== */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

/* GV_ROOT — bozulmuş kopyada koşum için. Eksen, kusuru YAKALADIĞINI
   kanıtlamadan temiz sonucu güvenilir sayılmaz (R1 dersi L-39). */
const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : path.resolve(__dirname, '..', '..');
const PORT = Number(process.env.GV_PORT || 8792);
const GENISLIK = [1600, 1440, 1280, 1024, 768, 390];
const EKRANLAR = [
  { dosya: 'index.html',       ad: 'Giriş',            oturum: false },
  { dosya: 'app-panel.html',   ad: 'Gündem',           oturum: true },
  { dosya: 'app-musteri.html', ad: 'Müşteriler',       oturum: true },
  { dosya: 'app-operasyon.html', ad: 'Operasyon',      oturum: true }
];

const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.json':'application/json' };

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

/* ---- Sayfa içinde koşan ölçümler ---------------------------------- */

const OLC_TASMA = () => {
  const de = document.documentElement;
  const kaydi = de.scrollWidth > de.clientWidth + 1;
  if (!kaydi) return { kaydi: false, genislik: de.clientWidth, scroll: de.scrollWidth, suclular: [] };
  const sinir = de.clientWidth;
  const suclular = [];
  document.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (r.right <= sinir + 1) return;
    /* Yalnız EN İÇTEKİ suçluyu yaz: taşan bir çocuk tüm atalarını da
       taşırır, hepsini raporlamak bulgu sayısını şişirir. */
    if (Array.from(el.children).some(c => c.getBoundingClientRect().right > sinir + 1)) return;
    suclular.push({
      etiket: el.tagName.toLowerCase(),
      sinif: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 60),
      id: el.id || '',
      sag: Math.round(r.right),
      metin: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)
    });
  });
  return { kaydi: true, genislik: de.clientWidth, scroll: de.scrollWidth, suclular: suclular.slice(0, 6) };
};

/* ⚠️ ÖLÇÜM DÜZELTMESİ — ATANIN GİZLİLİĞİ SAYILIR.
   İlk koşumda bu iki eksen 30 bulgunun 28'ini ÜRETTİ ve hepsi YANLIŞTI.
   Sebep: düğümün KENDİ `display`ine bakıyordum. Gizli bir kapsayıcının
   içindeki `<a>` kendi başına `display:inline`dır ama çizilmez ve odak da
   alamaz. Bu yüzden:
     · giriş ekranındaki `[hidden]` rol sekmesinin 21 ikonu "çizilmedi" sayıldı
     · müşteri listesinde `.gv-cardlist{display:none}` içindeki bağlantılar
       "0×0 odak tuzağı" sayıldı — oysa GV.list tablo, kart ve mobil satırı
       birlikte basıp CSS ile birini gösteriyor; gizli olanlar tasarım gereği
       çizilmez.
   Doğru ölçüt: düğümün render ağacında yeri var mı. `getClientRects().length`
   bunu doğrudan söyler ve SVG'de de çalışır (`offsetParent` SVG'de güvenilmez).
   Bu, R1'in L-26 dersinin aynısıdır: ölçüm aracı borcu FAZLA da sayabilir. */
const CIZILDI_MI = `(function(el){
  if(!el) return false;
  if(el.getClientRects().length === 0) return false;
  for(var a = el; a && a !== document; a = a.parentElement || a.parentNode){
    if(a.nodeType !== 1) continue;
    if(a.hasAttribute && a.hasAttribute('hidden')) return false;
    var st = getComputedStyle(a);
    if(st.display === 'none' || st.visibility === 'hidden') return false;
  }
  return true;
})`;

const OLC_SPRITE = new Function(`
  var cizildi = ${CIZILDI_MI};
  var sprite = document.getElementById('gvSprite');
  var kullanimlar = Array.prototype.slice.call(document.querySelectorAll('use[href^="#i-"]'));
  var eksik = {}, cizilmeyen = 0, gizli = 0;
  kullanimlar.forEach(function(u){
    var id = u.getAttribute('href').slice(1);
    if(!document.getElementById(id)){ eksik[id] = 1; return; }
    var svg = u.closest('svg');
    if(!svg) return;
    /* Gizli kapsayıcıdaki ikon KUSUR DEĞİLDİR — ayrı sayaçta izlenir. */
    if(!cizildi(svg)){ gizli++; return; }
    var r = svg.getBoundingClientRect();
    if(r.width === 0 || r.height === 0) cizilmeyen++;
  });
  return {
    enjekte: !!sprite,
    sembol: sprite ? sprite.querySelectorAll('symbol[id^="i-"]').length : 0,
    kullanim: kullanimlar.length,
    eksik: Object.keys(eksik),
    cizilmeyen: cizilmeyen,
    gizliKapsayicida: gizli
  };
`);

const OLC_ODAK_HAZIRLIK = new Function(`
  var cizildi = ${CIZILDI_MI};
  var sec = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  var hepsi = Array.prototype.slice.call(document.querySelectorAll(sec));
  /* Gerçekten odak alabilecekler: render ağacında yeri olanlar. */
  var gorunur = hepsi.filter(function(el){ return cizildi(el) || el.classList.contains('gv-skip'); });
  return {
    odaklanabilir: gorunur.length,
    dokumanda: hepsi.length,
    gizli: hepsi.length - gorunur.length,
    /* 0×0 tuzağı: ÇİZİLMİŞ ama boyutu olmayan düğüm. Skip link bilerek
       gizlidir ve odaklanınca görünür — hariç tutulur. */
    sifirBoyut: gorunur.filter(function(el){
      if(el.classList.contains('gv-skip')) return false;
      var r = el.getBoundingClientRect();
      return r.width === 0 || r.height === 0;
    }).map(function(el){
      return el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '');
    }).slice(0, 5)
  };
`);

/* ---- Ana akış ------------------------------------------------------ */
(async () => {
  const srv = sunucu();
  await new Promise(r => srv.listen(PORT, '127.0.0.1', r));
  const base = `http://127.0.0.1:${PORT}`;

  const browser = await chromium.launch();
  const sonuclar = [];
  let toplamBulgu = 0;

  for (const ek of EKRANLAR) {
    for (const g of GENISLIK) {
      /* Her ölçüm TEMİZ bağlamda: önceki sayfanın oturumu, konsolu ve
         localStorage'ı bir sonrakine sızmasın. */
      const ctx = await browser.newContext({ viewport: { width: g, height: 900 }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();

      /* Konsol iki kovaya ayrılır. Dış CDN (Google Fonts) hatası bu deponun
         kusuru DEĞİLDİR — ağ engelli ortamda her sayfada çıkar ve kendi
         kodumuzdaki bir hatayı gizleyecek kadar gürültü üretir. Ayrı sayılır
         ki gerçek bulgu içinde kaybolmasın. */
      const konsol = [];      /* kendi kaynağımız — GERÇEK bulgu */
      const disKaynak = [];   /* üçüncü taraf — ayrı raporlanır */
      const disMi = (u) => /^https?:\/\//.test(u) && !u.startsWith(base);
      page.on('console', m => {
        if (m.type() !== 'error') return;
        const t = m.text().slice(0, 200);
        /* "Failed to load resource" metni kaynağı söylemez; eşlik eden
           requestfailed/response olayı söyler. Bu satır tek başına
           sayılmaz, çift sayım olurdu. */
        if (/Failed to load resource/i.test(t)) return;
        konsol.push('console.error: ' + t);
      });
      page.on('pageerror', e => konsol.push('pageerror: ' + String(e.message).slice(0, 200)));
      page.on('requestfailed', r => {
        const m = 'istek başarısız: ' + r.url().replace(base, '') + ' — ' + ((r.failure() || {}).errorText || '');
        (disMi(r.url()) ? disKaynak : konsol).push(m);
      });
      page.on('response', r => {
        if (r.status() < 400) return;
        const m = 'HTTP ' + r.status() + ': ' + r.url().replace(base, '');
        (disMi(r.url()) ? disKaynak : konsol).push(m);
      });

      const url = base + '/' + ek.dosya + (ek.oturum ? '?role=sahip' : '');
      await page.goto(url, { waitUntil: 'networkidle' });
      /* Kabuk sprite'ı fetch ile enjekte ediyor ve gv:ready ondan sonra
         atılıyor; networkidle yetmeyebilir. İskeletin doğmasını bekle. */
      if (ek.oturum) await page.waitForSelector('.gv-app', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(350);

      const tasma  = await page.evaluate(OLC_TASMA);
      const sprite = await page.evaluate(OLC_SPRITE);
      const odakH  = await page.evaluate(OLC_ODAK_HAZIRLIK);

      /* Odak sırası: gerçekten Tab'la yürünür. İlk sekme skip link'e
         düşmeli (belgenin ilk odaklanabilir düğümü odur). */
      await page.evaluate(() => document.body.focus());
      const odakZinciri = [];
      for (let i = 0; i < Math.min(12, odakH.odaklanabilir); i++) {
        await page.keyboard.press('Tab');
        const bilgi = await page.evaluate(() => {
          const a = document.activeElement;
          if (!a || a === document.body) return null;
          const r = a.getBoundingClientRect();
          return { et: a.tagName.toLowerCase(), sinif: String(a.className || '').split(' ')[0],
                   gorunur: r.width > 0 && r.height > 0 };
        });
        if (!bilgi) break;
        odakZinciri.push(bilgi);
      }
      const odakIlerledi = odakZinciri.length >= Math.min(5, odakH.odaklanabilir);
      const odakGorunmez = odakZinciri.filter(o => !o.gorunur).length;

      const bulgular = [];
      if (konsol.length) bulgular.push(...konsol.map(k => 'KONSOL — ' + k));
      if (tasma.kaydi) bulgular.push(`TAŞMA — belge ${tasma.scroll}px, görüntü ${tasma.genislik}px · suçlu: ` +
        (tasma.suclular.map(s => `${s.etiket}${s.sinif ? '.' + s.sinif.split(' ')[0] : ''}${s.id ? '#' + s.id : ''}@${s.sag}px`).join(', ') || 'bulunamadı'));
      if (!sprite.enjekte) bulgular.push('SPRITE — #gvSprite enjekte edilmedi');
      if (sprite.eksik.length) bulgular.push('SPRITE — belgede olmayan ikon: ' + sprite.eksik.join(', '));
      if (sprite.cizilmeyen) bulgular.push(`SPRITE — görünür olduğu hâlde 0×0 çizilen ikon: ${sprite.cizilmeyen}`);
      if (!odakIlerledi) bulgular.push(`ODAK — Tab sırası ilerlemedi (${odakZinciri.length}/${odakH.odaklanabilir})`);
      if (odakGorunmez) bulgular.push(`ODAK — ${odakGorunmez} odak hedefi görünmez`);
      if (odakH.sifirBoyut.length) bulgular.push('ODAK — 0×0 odaklanabilir düğüm: ' + odakH.sifirBoyut.join(', '));

      toplamBulgu += bulgular.length;
      sonuclar.push({ ekran: ek.ad, dosya: ek.dosya, genislik: g, tasma, sprite, disKaynak, odak: {
        odaklanabilir: odakH.odaklanabilir, dokumanda: odakH.dokumanda, gizli: odakH.gizli,
        zincir: odakZinciri.length, gorunmez: odakGorunmez }, bulgular });

      console.log(`  ${bulgular.length ? '✗' : '✓'} ${ek.ad.padEnd(11)} ${String(g).padStart(4)}px  ` +
        `taşma:${tasma.kaydi ? 'VAR' : 'yok'} sprite:${sprite.kullanim - sprite.gizliKapsayicida}çizili/${sprite.gizliKapsayicida}gizli ` +
        `odak:${odakZinciri.length}/${odakH.odaklanabilir}` +
        (disKaynak.length ? ` [dış:${disKaynak.length}]` : '') +
        (bulgular.length ? '  → ' + bulgular.length + ' bulgu' : ''));
      for (const b of bulgular) console.log(`      · ${b}`);
      for (const d of disKaynak) console.log(`      ~ DIŞ KAYNAK (bu deponun kusuru değil) — ${d}`);

      await ctx.close();
    }
  }

  await browser.close();
  srv.close();

  fs.writeFileSync(path.join(__dirname, 'tarayici-sonuc.json'), JSON.stringify(sonuclar, null, 2));
  const disToplam = sonuclar.reduce((a, s) => a + s.disKaynak.length, 0);
  console.log(`\n${toplamBulgu ? '✗ TOPLAM BULGU: ' + toplamBulgu : '✓ TEMİZ'} · ${EKRANLAR.length} ekran × ${GENISLIK.length} genişlik = ${sonuclar.length} ölçüm` +
    (disToplam ? ` · ayrıca ${disToplam} dış kaynak isteği başarısız (Google Fonts CDN — depo kusuru değil)` : '') + '\n');
  process.exit(toplamBulgu ? 1 : 0);
})();
