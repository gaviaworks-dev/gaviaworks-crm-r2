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
  /* ---- Dilim 1: Müşteri ve Satış zinciri ----------------------------
     Kayıt taşıyan ekranlar GERÇEK bir kodla ölçülür; boş `?id=` yalnız
     hata durumunu ölçer ve asıl yerleşimi hiç çizmez. Seçilen kayıtlar
     veri ölçümünden geldi: MUS-2026-008 hem fırsat hem teklif taşıyor,
     FRS-2026-001 ön analiz + teklif + aktivite taşıyan tek fırsat,
     TKL-2026-014 kalem dökümü OLAN tek teklif. */
  { dosya: 'app-musteri-detay.html?id=MUS-2026-008', ad: 'Müşteri Detayı', oturum: true },
  { dosya: 'app-musteri-form.html',                  ad: 'Müşteri Formu',  oturum: true },
  { dosya: 'app-musteri-form.html?id=MUS-2024-001',  ad: 'Müşteri Düzenle',oturum: true },
  { dosya: 'app-satis-akisi.html',                   ad: 'Satış Akışı',    oturum: true },
  { dosya: 'app-firsat-detay.html?id=FRS-2026-001',  ad: 'Fırsat Detayı',  oturum: true },
  { dosya: 'app-firsat-form.html',                   ad: 'Fırsat Formu',   oturum: true },
  { dosya: 'app-teklif.html',                        ad: 'Teklifler',      oturum: true },
  { dosya: 'app-teklif-detay.html?id=TKL-2026-014',  ad: 'Teklif Detayı',  oturum: true },
  { dosya: 'app-teklif-form.html',                   ad: 'Teklif Formu',   oturum: true },
  /* ---- Dilim 2: Finans zinciri ----------------------------------
     Kayıt seçimi ölçümden geldi: FTR-2026-025 zincirin 4 halkasını da
     taşıyan fatura, THS-2026-041 tahsil EDİLMEMİŞ (nakit olayı yok) kayıt,
     MS-004 faturası olmayan dört taksitten biri. */
  { dosya: 'app-fatura.html',                        ad: 'Faturalar',      oturum: true },
  { dosya: 'app-fatura-detay.html?id=FTR-2026-025',  ad: 'Fatura Detayı',  oturum: true },
  { dosya: 'app-fatura-form.html?taksit=MS-004',     ad: 'Fatura Formu',   oturum: true },
  { dosya: 'app-tahsilat.html',                      ad: 'Tahsilatlar',    oturum: true },
  { dosya: 'app-tahsilat-form.html?id=THS-2026-041', ad: 'Tahsilat Formu', oturum: true },
  { dosya: 'app-satinalma.html',                     ad: 'Satın Alma',     oturum: true },
  { dosya: 'app-teklif-detay.html?id=TKL-2026-011',  ad: 'Teklif Sürümü',  oturum: true },
  { dosya: 'app-operasyon.html', ad: 'Operasyon',      oturum: true },
  { dosya: 'app-odeme-linki.html',       ad: 'Ödeme Linkleri', oturum: true },
  { dosya: 'app-odeme-linki-form.html',  ad: 'Yeni Link',      oturum: true },
  { dosya: 'app-odeme-linki-detay.html?id=ODL-2026-102', ad: 'Link Detayı', oturum: true },
  /* Dış ekranlar kabuk YÜKLEMEZ — `oturum:false` ve `.gv-app` beklenmez. */
  { dosya: 'app-odeme.html?link=ODL-2026-102',       ad: 'Dış Ödeme',   oturum: false },
  { dosya: 'app-odeme-sonuc.html?link=ODL-2026-102&sonuc=beklemede', ad: 'Ödeme Sonucu', oturum: false },
  { dosya: 'app-rapor.html', ad: 'Raporlar', oturum: true },
  /* ---- Dilim 3: Proje ve Operasyon -------------------------------
     Kayıt seçimi ÖLÇÜMDEN geldi (brief §18.1 tablosu):
     PRJ-2026-003 en kalabalık proje (4 görev · 2 sprint · 5 milestone ·
     5 fatura · 51 timelog), PRJ-2026-001 test defteri OLAN tek proje
     (5 senaryo · 3 hata), PRJ-2024-011 hiçbir alt kayıt taşımayan altı
     projeden biri — boş sekme yerleşimi ancak orada ölçülür.
     GRV-2026-113 onay zinciri olan tek görev; DST-2026-120 SLA'sı
     ihlal edilmiş talep, DST-2026-117 projesiz tek talep. */
  { dosya: 'app-proje-detay.html?id=PRJ-2026-003', ad: 'Proje Detayı',  oturum: true },
  { dosya: 'app-proje-detay.html?id=PRJ-2026-001#test', ad: 'Proje Kalite', oturum: true },
  { dosya: 'app-proje-detay.html?id=PRJ-2024-011', ad: 'Proje Boş',     oturum: true },
  { dosya: 'app-gorev.html',                       ad: 'Görevler',      oturum: true },
  { dosya: 'app-gorev-detay.html?id=GRV-2026-113', ad: 'Görev Detayı',  oturum: true },
  { dosya: 'app-destek-detay.html?id=DST-2026-120',ad: 'Destek Detayı', oturum: true },
  { dosya: 'app-destek-detay.html?id=DST-2026-117',ad: 'Destek Projesiz', oturum: true },
  { dosya: 'app-proje.html',   ad: 'Projeler', oturum: true },
  { dosya: 'app-destek.html',  ad: 'Destek',   oturum: true },
  { dosya: 'app-gorev-form.html',                    ad: 'Görev Formu',    oturum: true },
  { dosya: 'app-gorev-form.html?id=GRV-2026-113',    ad: 'Görev Düzenle',  oturum: true },
  { dosya: 'app-destek-form.html',                   ad: 'Destek Formu',   oturum: true },
  { dosya: 'app-destek-form.html?id=DST-2026-120',   ad: 'Destek Düzenle', oturum: true },
  /* ---- Dilim 4: Ekip ve Kaynaklar ----------------------------------
     `?t=cikis` çıkış sürecindeki tek personeli (EMP-015) taşıyan sekme;
     `#izin` ikinci yüzeyin derin bağlantısı. */
  { dosya: 'app-personel.html',           ad: 'Personel',   oturum: true },
  { dosya: 'app-personel.html?t=cikis',   ad: 'Personel Çıkış', oturum: true },
  { dosya: 'app-zaman.html',              ad: 'Zaman',      oturum: true },
  { dosya: 'app-zaman.html#izin',         ad: 'İzin',       oturum: true },
  /* Varlıklar — ÜÇ YÜZEY DE ölçülür. Tek `?t=` ile açılan üç ayrı kaynak,
     kolon ve KPI kümesi var; yalnız varsayılanı ölçmek diğer ikisinin
     yerleşimini hiç çizmemek olurdu. `DMB-2025-007` K-30'da iddiası
     düşürülen demirbaştır — düşen iddia satırı ancak orada çizilir. */
  { dosya: 'app-varlik.html',             ad: 'Varlık · Demirbaş', oturum: true },
  { dosya: 'app-varlik.html?t=zimmet',    ad: 'Varlık · Zimmet',   oturum: true },
  { dosya: 'app-varlik.html?t=filo',      ad: 'Varlık · Filo',     oturum: true },
  /* İzin detayı — İKİ kayıt. `IZN-2026-038` normal akış; `IZN-2026-039`
     bakiyesi YETMEYEN talep: onay kapısı kapalı, ret/iptal açık. Kapının
     iki yönü ancak o kayıtta çizilir. */
  { dosya: 'app-izin-detay.html?id=IZN-2026-038', ad: 'İzin Detayı',      oturum: true },
  { dosya: 'app-izin-detay.html?id=IZN-2026-039', ad: 'İzin · Bakiyesiz', oturum: true },
  /* ---- Dilim 5: Ayarlar ---------------------------------------------
     HER SEKME AYRI ÖLÇÜLÜR. Ayar kabuğu tembel çizer: bir sekmenin gövdesi
     ancak `gv:tab` ile doğar, yani yalnız varsayılanı ölçmek kalan 13
     sekmenin yerleşimini HİÇ çizmemek olurdu.

     İKİ ROL VARYANTI da ölçülür (`rol` alanı): sekmeler yetkiden üretilir
     (§3.3) ve yerleşim role göre DEĞİŞİR —
       · `frontend` profilde ücret satırını MASKELİ görür (`••••••`),
       · `musteri` oturumunda personel kaydı yoktur, özlük ve ücret blokları
         hiç basılmaz (4 kart, 7 değil),
       · `devops` entegrasyonda `odeme` sekmesini görmez (4 → 3 sekme).
     Bu üç yerleşim `sahip` rolüyle ölçülemez. */
  { dosya: 'app-ayar-profil.html',                ad: 'Profil · Hesabım',    oturum: true },
  { dosya: 'app-ayar-profil.html#bildirim',       ad: 'Profil · Bildirim',   oturum: true },
  { dosya: 'app-ayar-profil.html',                ad: 'Profil · Maskeli',    oturum: true, rol: 'frontend' },
  { dosya: 'app-ayar-profil.html',                ad: 'Profil · Müşteri',    oturum: true, rol: 'musteri' },
  { dosya: 'app-ayar-sirket.html',                ad: 'Şirket',              oturum: true },
  { dosya: 'app-ayar-sirket.html#departman',      ad: 'Şirket · Departman',  oturum: true },
  { dosya: 'app-ayar-sirket.html#kullanici',      ad: 'Şirket · Kullanıcı',  oturum: true },
  { dosya: 'app-ayar-sirket.html#rol',            ad: 'Şirket · Rol',        oturum: true },
  { dosya: 'app-ayar-sirket.html#yetki',          ad: 'Şirket · Yetki',      oturum: true },
  { dosya: 'app-ayar-sirket.html#onay',           ad: 'Şirket · Onay',       oturum: true },
  { dosya: 'app-ayar-entegrasyon.html',           ad: 'Entegrasyon',         oturum: true },
  { dosya: 'app-ayar-entegrasyon.html#odeme',     ad: 'Entegrasyon · Ödeme', oturum: true },
  { dosya: 'app-ayar-entegrasyon.html#otomasyon', ad: 'Entegrasyon · Otom.', oturum: true },
  { dosya: 'app-ayar-entegrasyon.html#hata',      ad: 'Entegrasyon · Hata',  oturum: true },
  { dosya: 'app-ayar-entegrasyon.html',           ad: 'Entegrasyon · DevOps',oturum: true, rol: 'devops' },
  { dosya: 'app-ayar-log.html',                   ad: 'Sistem Kayıtları',    oturum: true },
  { dosya: 'app-ayar-log.html#arsiv',             ad: 'Kayıtlar · Arşiv',    oturum: true },
  { dosya: 'app-ayar-log.html#kalite',            ad: 'Kayıtlar · Kalite',   oturum: true }
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

/* =====================================================================
   NÖBETÇİ — ÖLÇÜLEN SAYFA GERÇEKTEN YÜKLENDİ Mİ

   Bu eksen dört şey ölçüyordu: konsol · taşma · sprite · odak. Dördü de
   "sayfa ne gösteriyor" sorusunu soruyor, hiçbiri "sayfa doğru sayfa mı"
   sorusunu sormuyordu. Ölçüldü ve yakalandı: harness oturum parametresini
   hash'in SONUNA ekliyordu, `…?id=X#test` hedefi `…?id=X#test&role=sahip`
   oluyordu; kabuk `role`u okuyamıyor, 403 basıyor ve eksen o hata sayfasını
   ölçüp **YEŞİL yanıyordu**. Taşma yok, ikon yok, konsol temiz — çünkü
   ekran hiç çizilmemişti.

   403 sayfası da bir `.gv-app` iskeleti kurar, yani iskeletin varlığı
   yüklenme kanıtı DEĞİLDİR. Üç bağımsız işaret ölçülür:
     1. `gv:ready` atıldı mı — kabuğun yetki verdiğinin TEK doğru kanıtı
        (`shell.js:1020` yetkisizde `gv:denied` atar). Sayfa yüklenmeden
        önce enjekte edilen dinleyiciyle sayılır.
     2. Belge başlığı 'Yetkisiz erişim' ile başlıyor mu (`shell.js:849`).
     3. `.gv-page` içinde kaç element var — 403 durumu ~10 düğüm basar,
        gerçek ekran yüzlerce. Eşik düşük tutulur (25): amaç boş kabuğu
        yakalamak, ince ekranı kusurlu ilan etmek değil.

   Kabuğu YÜKLEMEYEN dış ödeme ekranlarında (`oturum:false`, şartname §8.3)
   `gv:ready` beklenmez; orada yalnız gövdenin dolu olması aranır.
   ===================================================================== */
const OLC_GECERLILIK = () => {
  const g = window.__gvOlcum || { ready: 0, denied: 0 };
  const sayfa = document.querySelector('.gv-page');
  return {
    ready: g.ready, denied: g.denied,
    baslik: document.title || '',
    yetkisizBaslik: /^Yetkisiz erişim/.test(document.title || ''),
    sayfaDugum: sayfa ? sayfa.querySelectorAll('*').length : 0,
    govdeDugum: document.body ? document.body.querySelectorAll('*').length : 0,
    kabuk: !!document.querySelector('.gv-app'),
    kilitDurumu: !!document.querySelector('.gv-state.is-danger')
  };
};
const GECERLILIK_ESIK = 25;   /* `.gv-page` içi en az element sayısı */

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

      /* ⚠️ `role=sahip` SORGUYA girer, HASH'E değil. Eski yazım parametreyi
         dizenin SONUNA ekliyordu; `…?id=X#test` gibi bir hedefte sonuç
         `…?id=X#test&role=sahip` oluyordu. İki şey birden bozuluyordu:
         kabuk `role`u okuyamadığı için sayfa 403 basıyor, sekme anahtarı da
         `test&role=sahip` olduğu için hiçbir sekmeye uymuyordu. Yani ölçüm
         ekranı değil hata sayfasını ölçüyor ve YEŞİL yanıyordu — sahte
         temizlik. Sorgu ile hash ayrı ayrı kurulur. */
      /* Nöbetçi sayaçları sayfa KODU KOŞMADAN ÖNCE kurulur; `gv:ready`
         `goto` sırasında atılır ve sonradan bağlanan dinleyici onu kaçırır. */
      await page.addInitScript(() => {
        window.__gvOlcum = { ready: 0, denied: 0 };
        document.addEventListener('gv:ready',  () => { window.__gvOlcum.ready++; });
        document.addEventListener('gv:denied', () => { window.__gvOlcum.denied++; });
      });

      const [yol, parca] = ek.dosya.split('#');
      /* `ek.rol` — VARSAYILAN `sahip`. Bir ekranın yerleşimi role göre
         DEĞİŞİYORSA (maskelenen alan, düşen sekme) yalnız `sahip` ölçmek o
         yerleşimi hiç çizmemek olurdu: ayar sekmeleri yetkiden üretilir
         (§3.3) ve `devops` rolünde bir sekme DÜŞER. Rol alanı bu yüzden
         var; ölçüm kapsamı ekranın kendi değişkenliğinden dar olamaz. */
      const rol = ek.rol || 'sahip';
      const url = base + '/' + yol +
        (ek.oturum ? (yol.indexOf('?') === -1 ? '?role=' + rol : '&role=' + rol) : '') +
        (parca ? '#' + parca : '');
      await page.goto(url, { waitUntil: 'networkidle' });
      /* Kabuk sprite'ı fetch ile enjekte ediyor ve gv:ready ondan sonra
         atılıyor; networkidle yetmeyebilir. İskeletin doğmasını bekle. */
      if (ek.oturum) await page.waitForSelector('.gv-app', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(350);

      const gecer  = await page.evaluate(OLC_GECERLILIK);
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

      /* ---- NÖBETÇİ — diğer dört eksenden ÖNCE ---------------------------
         Geçersiz ölçüm "kusursuz" değil ÖLÇÜLMEMİŞtir. Bu satırlar bulguya
         yazılır ki ✗ bassın; sessizce yeşil geçmek, ölçmediğini ölçtüm
         sanmaktır. */
      const gecersiz = [];
      if (ek.oturum && gecer.denied)          gecersiz.push('kabuk gv:denied attı — 403 yetki kapısı');
      if (ek.oturum && !gecer.ready)          gecersiz.push('gv:ready hiç atılmadı — ekran kodu koşmadı');
      if (gecer.yetkisizBaslik)               gecersiz.push(`belge başlığı "${gecer.baslik}"`);
      if (ek.oturum && gecer.sayfaDugum < GECERLILIK_ESIK)
        gecersiz.push(`.gv-page içinde yalnız ${gecer.sayfaDugum} element (eşik ${GECERLILIK_ESIK}) — boş kabuk`);
      if (!ek.oturum && gecer.govdeDugum < GECERLILIK_ESIK)
        gecersiz.push(`gövdede yalnız ${gecer.govdeDugum} element (eşik ${GECERLILIK_ESIK}) — sayfa çizilmedi`);
      if (gecersiz.length)
        bulgular.push('GEÇERSİZ ÖLÇÜM — sayfa yüklenmedi, diğer eksenler anlamsız: ' + gecersiz.join(' · '));

      if (konsol.length) bulgular.push(...konsol.map(k => 'KONSOL — ' + k));
      if (tasma.kaydi) bulgular.push(`TAŞMA — belge ${tasma.scroll}px, görüntü ${tasma.genislik}px · suçlu: ` +
        (tasma.suclular.map(s => `${s.etiket}${s.sinif ? '.' + s.sinif.split(' ')[0] : ''}${s.id ? '#' + s.id : ''}@${s.sag}px`).join(', ') || 'bulunamadı'));
      /* ⚠️ ÖLÇÜM DÜZELTMESİ (üçüncü kez aynı sınıf hata — R1 dersi L-26).
         Sprite yokluğu ancak sayfa İKON KULLANIYORSA kusurdur. Dış ödeme
         ekranları şartname §8.3 gereği kabuğu hiç yüklemez ve tek bir
         <use href="#i-*"> bile içermez; onlarda #gvSprite'ı şart koşmak
         tasarım kararını kusur diye raporlamaktı. */
      if (!sprite.enjekte && sprite.kullanim > 0)
        bulgular.push(`SPRITE — sayfa ${sprite.kullanim} ikon kullanıyor ama #gvSprite enjekte edilmedi`);
      if (sprite.eksik.length) bulgular.push('SPRITE — belgede olmayan ikon: ' + sprite.eksik.join(', '));
      if (sprite.cizilmeyen) bulgular.push(`SPRITE — görünür olduğu hâlde 0×0 çizilen ikon: ${sprite.cizilmeyen}`);
      if (!odakIlerledi) bulgular.push(`ODAK — Tab sırası ilerlemedi (${odakZinciri.length}/${odakH.odaklanabilir})`);
      /* ⚠️ "İLERLEDİ" YETMEZ, "BAŞTAN BAŞLADI" da ölçülür (K-37).
         Eski hâli yalnız zincirin UZUNLUĞUNA bakıyordu. Ölçüldü ki
         `GV.tabs` sıralı odak başlangıç noktasını sekme şeridine taşıyınca
         ilk `Tab` belgenin başına değil sayfanın ORTASINA düşüyordu: skip
         link, rail, bölüm menüsü ve üst çubuk klavyeyle erişilemez oluyordu.
         Sekme şeridinden sonra bol düğüm olan ekranlarda zincir yine 5'i
         geçiyor ve eksen YEŞİL yanıyordu — yani kusur ölçülüyor değil,
         eşiğin altında saklanıyordu. İlk odak hedefi artık belgenin İLK
         odaklanabilir düğümü olmak zorunda. */
      if (ek.oturum && odakZinciri.length && odakZinciri[0].sinif !== 'gv-skip')
        bulgular.push(`ODAK — ilk Tab belgenin başına düşmedi: "${odakZinciri[0].et}.${odakZinciri[0].sinif}" ` +
                      `(beklenen "a.gv-skip") — skip link ve kabuk gezinmesi klavyeyle atlanıyor`);
      if (odakGorunmez) bulgular.push(`ODAK — ${odakGorunmez} odak hedefi görünmez`);
      if (odakH.sifirBoyut.length) bulgular.push('ODAK — 0×0 odaklanabilir düğüm: ' + odakH.sifirBoyut.join(', '));

      toplamBulgu += bulgular.length;
      sonuclar.push({ ekran: ek.ad, dosya: ek.dosya, genislik: g, gecer, gecersiz, tasma, sprite, disKaynak, odak: {
        odaklanabilir: odakH.odaklanabilir, dokumanda: odakH.dokumanda, gizli: odakH.gizli,
        zincir: odakZinciri.length, gorunmez: odakGorunmez }, bulgular });

      console.log(`  ${bulgular.length ? '✗' : '✓'} ${ek.ad.padEnd(11)} ${String(g).padStart(4)}px  ` +
        `düğüm:${ek.oturum ? gecer.sayfaDugum : gecer.govdeDugum} ` +
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
  /* Sıfır bulgu TEK BAŞINA temiz değildir: kaç sayfanın gerçekten yüklendiği
     ve kaç düğüm bastığı da basılır. Bir eksen neyi ölçmediğini söylemiyorsa
     yeşil rengi bir şey ifade etmez. */
  const gecersizOlcum = sonuclar.filter(s => s.gecersiz && s.gecersiz.length).length;
  const gecerliOlcum  = sonuclar.length - gecersizOlcum;
  const dugumler = sonuclar.map(s => (s.gecer ? (s.gecer.sayfaDugum || s.gecer.govdeDugum) : 0));
  const dugumToplam = dugumler.reduce((a, b) => a + b, 0);
  const readySayisi = sonuclar.filter(s => s.gecer && s.gecer.ready > 0).length;
  console.log(`\n${toplamBulgu ? '✗ TOPLAM BULGU: ' + toplamBulgu : '✓ TEMİZ'} · ${EKRANLAR.length} ekran × ${GENISLIK.length} genişlik = ${sonuclar.length} ölçüm` +
    (disToplam ? ` · ayrıca ${disToplam} dış kaynak isteği başarısız (Google Fonts CDN — depo kusuru değil)` : ''));
  console.log(`  NÖBETÇİ · geçerli ölçüm ${gecerliOlcum}/${sonuclar.length} · geçersiz ${gecersizOlcum} · ` +
    `gv:ready atan ${readySayisi}/${sonuclar.length} · ölçülen düğüm toplamı ${dugumToplam} ` +
    `(en az ${Math.min(...dugumler)}, en çok ${Math.max(...dugumler)}, eşik ${GECERLILIK_ESIK})\n`);
  process.exit(toplamBulgu ? 1 : 0);
})();
