#!/usr/bin/env node
/* =====================================================================
   BRIEF DOĞRULAMASI — tasks/ekran-brief.md yayındaki koda uyuyor mu

   NEDEN VAR: bu depoda sözlük daha önce HAYALET API yazdı — `GV.cols()`,
   `GV.filters()`, `GV.export()`, `GV.kanban()` beş oturum boyunca "bileşen"
   diye listelendi ve hiçbiri yoktu (ui.js:1866-1880). Brief bir ajana
   "keşfetme, buradan oku" diyorsa, brief'in kendisi ÖLÇÜLMEK zorundadır.

   Üç eksen:
     B1  Brief'teki her `dosya:satır` işareti — dosya var mı, satır var mı
     B2  Brief'te geçen her `GV.<ad>` — ortak katmanda tanımlı mı
     B3  Brief'te geçen her `DB.<ad>` — veri katmanında tanımlı mı
     B4  Brief'te geçen her ikon adı — sprite'ta var mı

   Bulgu sayısı kadar ÖLÇÜM SAYISI da basılır: sıfır bulgu tek başına
   temiz değildir, kaç şey ölçüldüğü de yazılır.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : path.resolve(__dirname, '..', '..');
const BRIEF = path.join(ROOT, 'tasks', 'ekran-brief.md');

let hata = 0;
const de = (m) => { console.log('  ✗ ' + m); hata++; };
const ok = (m) => console.log('  ✓ ' + m);

if(!fs.existsSync(BRIEF)){ console.log('✗ tasks/ekran-brief.md yok'); process.exit(1); }
/* `yoksay` blokları ölçüm dışıdır: brief HAYALET API'leri örnek olarak
   anıyor ("bunlar yoktu") ve o cümleyi ad taraması "eksik ad" sayardı —
   ölçüm aracının borcu FAZLA sayması (R1 dersi L-26). Blok açıkça
   işaretlidir; sessiz bir istisna listesi tutulmaz. */
const brief = fs.readFileSync(BRIEF, 'utf8')
  .replace(/<!--\s*brief-dogrula:yoksay-basla\s*-->[\s\S]*?<!--\s*brief-dogrula:yoksay-bitir\s*-->/g, '');

console.log('\n=== BRIEF DOĞRULAMASI ===');

/* ---- B1 — dosya:satır işaretleri ------------------------------------ */
console.log('\n[B1] `dosya:satır` referansları');
{
  /* Biçim: `app-musteri.html:46` · `ui.js:737-1895` · `assets/js/shell.js:869`
     Yalnız BU depoya ait dosya adları sayılır; `§5.3` gibi şartname
     referansları ve `[7.3.1]` gibi madde numaraları dışarıda kalır. */
  const desen = /`?((?:assets\/[\w\/-]+\/)?[\w.-]+\.(?:js|html|css|md|svg)):(\d+)(?:-(\d+))?`?/g;
  const gorulen = new Map();
  let m;
  while((m = desen.exec(brief))){
    const [, dosya, bas, bit] = m;
    const anahtar = dosya + ':' + bas + (bit ? '-' + bit : '');
    if(!gorulen.has(anahtar)) gorulen.set(anahtar, { dosya, bas:+bas, bit:bit ? +bit : null });
  }

  const aday = ['', 'assets/js/', 'assets/data/', 'assets/css/', 'tasks/', 'tasks/qa/'];
  let cozulen = 0;
  for(const [anahtar, r] of gorulen){
    let yol = null;
    for(const on of aday){
      const p = path.join(ROOT, on + r.dosya);
      if(fs.existsSync(p) && fs.statSync(p).isFile()){ yol = p; break; }
    }
    if(!yol){ de(`${anahtar} — dosya bulunamadı`); continue; }
    const satirSayisi = fs.readFileSync(yol, 'utf8').split('\n').length;
    const son = r.bit || r.bas;
    if(son > satirSayisi) de(`${anahtar} — dosyada ${satirSayisi} satır var, referans ${son}. satırı gösteriyor`);
    else cozulen++;
  }
  if(cozulen === gorulen.size) ok(`${gorulen.size} referansın ${gorulen.size}'i yayındaki dosyada doğrulandı`);
  else ok(`${cozulen}/${gorulen.size} referans doğrulandı`);
  console.log(`     · ölçülen benzersiz referans: ${gorulen.size}`);
}

/* ---- Ortak katmanı Node'da kur -------------------------------------- */
function katman(){
  const ctx = { console:{ log(){}, warn(){}, error(){} } };
  vm.createContext(ctx);
  vm.runInContext(`
    var window = globalThis; var self = globalThis;
    var localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
    var sessionStorage = localStorage;
  `, ctx);
  for(const f of ['assets/data/org.js','assets/data/crm.js','assets/data/work.js',
                  'assets/data/misc.js','assets/data/ops.js','assets/data/lifecycle.js',
                  'assets/data/firsat.js','assets/data/odeme.js','assets/data/notes.js',
                  'assets/data/hr.js','assets/data/reports.js','assets/js/domain.js']){
    const p = path.join(ROOT, f);
    if(fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename:f });
  }
  return ctx;
}
const ctx = katman();

/* `ui.js` ve `shell.js` DOM ister — Node'da koşturulamaz. Onların dışa
   verdiği adlar KAYNAK METİNDEN okunur; bu bir tahmin değil, atama
   satırının kendisidir. */
function metindenGV(dosya){
  const src = fs.readFileSync(path.join(ROOT, dosya), 'utf8');
  const out = new Set();
  const d1 = /GV\.([a-zA-Z_$][\w$]*)\s*=/g;              /* GV.list = … */
  const d2 = /GV\.([a-zA-Z_$][\w$]*)\s*=\s*\{[\s\S]{0,400}?\}/g;
  let m;
  while((m = d1.exec(src))) out.add(m[1]);
  while((m = d2.exec(src))) out.add(m[1]);
  return out;
}

/* ---- B2 — GV.* adları ----------------------------------------------- */
console.log('\n[B2] Brief\'te geçen `GV.<ad>` adları');
{
  const tanimli = new Set(Object.keys(ctx.GV || {}));
  /* ⚠️ `kuyruk.js` bu listede YOKTU ve `GV.kuyruk` brief'e girince eksen
     "kodda yok" dedi — oysa yordam yayında ve `app-operasyon.html` onu beş
     oturumdur çağırıyor. Eksenin kendi kapsamı eksikti: DOM isteyen her
     ortak katman dosyası burada sayılmalı, yoksa doğrulayıcı gerçek bir
     imzayı hayalet ilan eder ve brief'i yanlış yere düzelttirir. */
  /* ⚠️ AYNI TUZAK İKİNCİ KEZ: `assets/js/rapor.js` de bu listede YOKTU ve
     `GV.rapor` brief'e girince eksen onu "kodda yok" ilan etti — oysa yordam
     `rapor.js:43`te tanımlı ve `app-rapor.html` beş oturumdur çağırıyor.
     Ders aynı: DOM isteyen HER ortak katman dosyası burada sayılır. */
  for(const f of ['assets/js/ui.js','assets/js/shell.js','assets/js/quicknote.js',
                  'assets/js/kuyruk.js','assets/js/rapor.js'])
    for(const a of metindenGV(f)) tanimli.add(a);
  /* Alt yordamlar: GV.list dönüş yüzeyi, GV.shell.*, GV.cell.*, GV.cols.* … */
  const altYuzey = new Set([
    'refresh','setTab','setFilter','setView','openCols','openFilters','openExport',
    'exportRows','exportCell','state','validate','read','el','sync','isDirty','submit',
    'setDirty','tab','aside','close','activate','html','onizle','yazdir','bolumSayisi',
    'files','clear','render'
  ]);

  const desen = /GV\.([a-zA-Z_$][\w$]*)/g;
  const gorulen = new Set();
  let m;
  while((m = desen.exec(brief))) gorulen.add(m[1]);

  let eksik = [];
  for(const a of gorulen) if(!tanimli.has(a) && !altYuzey.has(a)) eksik.push(a);
  if(eksik.length) de('brief\'te var, kodda YOK: ' + eksik.map(x => 'GV.' + x).join(', '));
  else ok(`${gorulen.size} `+'`GV.<ad>` adının hepsi ortak katmanda tanımlı');
  console.log(`     · ölçülen benzersiz ad: ${gorulen.size}`);
}

/* ---- B3 — DB.* adları ------------------------------------------------ */
console.log('\n[B3] Brief\'te geçen `DB.<ad>` adları');
{
  const DB = ctx.DB || {};
  const desen = /DB\.([a-zA-Z_$][\w$]*)/g;
  const gorulen = new Set();
  let m;
  while((m = desen.exec(brief))) gorulen.add(m[1]);
  const eksik = [...gorulen].filter(a => !(a in DB));
  if(eksik.length) de('brief\'te var, veride YOK: ' + eksik.map(x => 'DB.' + x).join(', '));
  else ok(`${gorulen.size} `+'`DB.<ad>` adının hepsi veri katmanında tanımlı');
  console.log(`     · ölçülen benzersiz ad: ${gorulen.size}`);
}

/* ---- B4 — ikon adları ------------------------------------------------ */
console.log('\n[B4] Brief\'te listelenen ikon adları');
{
  const sprite = fs.readFileSync(path.join(ROOT, 'assets/img/icons.svg'), 'utf8');
  const spriteIds = new Set([...sprite.matchAll(/id="(i-[\w-]+)"/g)].map(m => m[1]));
  const gorulen = new Set([...brief.matchAll(/\bi-[a-z][a-z0-9-]*\b/g)].map(m => m[0]));
  const eksik = [...gorulen].filter(a => !spriteIds.has(a));
  if(eksik.length) de('brief\'te var, sprite\'ta YOK: ' + eksik.join(', '));
  else ok(`${gorulen.size} ikon adının hepsi sprite'ta var (sprite toplam ${spriteIds.size} sembol)`);
  console.log(`     · ölçülen benzersiz ikon: ${gorulen.size}`);
}

/* ---- B5 — İDDİA KOŞUMU (V2-81) --------------------------------------
   NEDEN VAR: B2-B4 tek yön ölçüyor — brief'te GEÇEN adın kodda VAR olduğunu.
   Brief'in bir adı YANLIŞ ANLATMASINI hiç ölçmüyordu ve dilim 6'da bunun
   bedeli üç kez ödendi:

     · §20.2 çıkış neden kodlarını `tur:'cikis'` diye okutuyordu — alan bir
       DİZİDİR ve o okuma SIFIR kod bulur. `Ayrıldı` geçişinde boş bir neden
       listesi basılır ve geçiş hiç tamamlanamaz.
     · §21.11 `GV.fmt.days(3)` yazıyordu — yordam `days(iso, today)`dır ve
       o çağrı DOM'a `NaN` basar.
     · §22.8 `maasGorebilir(rec || {})` öneriyordu — boş nesne kayıt sayılıp
       "Bu kayıt sizin değil" cümlesi basılıyordu.

   Üçü de B2'den GEÇİYORDU: `GV.fmt` tanımlı, `DB.reasonCodes` tanımlı, ad
   doğru. Yanlış olan İDDİAYDI. Bu eksen iddiayı GERÇEK VERİ üstünde koşturur.

   Üç iddia ailesi ölçülür — üçü de KESKİN, yani yanlış pozitif üretmez
   (R1 dersi L-26: ölçüm aracının borcu FAZLA saymasıdır):
     B5.1  `DB.<kol>[].<alan>` — alan o koleksiyonun HİÇBİR kaydında yok mu
     B5.2  DİZİ/SKALER tip tutarlılığı — dizi alana `===`, skaler alana
           `indexOf` yazmak
     B5.3  §21.11'in "dizi alanı olan kayıtlar" listesi gerçekten dizi mi
   -------------------------------------------------------------------- */
console.log('\n[B5] Brief\'in İDDİALARI gerçek veri üstünde koşuyor mu');
{
  const DB = ctx.DB || {};
  const dizi = (k) => Array.isArray(DB[k]);
  /* Bir alanın koleksiyondaki gerçek tipi: hiç yoksa null. */
  function alanTipi(kol, alan){
    if(!dizi(kol)) return null;
    let varMi = false, diziMi = false, dolu = 0;
    for(const r of DB[kol]){
      if(!r || typeof r !== 'object') continue;
      if(!(alan in r)) continue;
      varMi = true;
      const v = r[alan];
      if(Array.isArray(v)) diziMi = true;
      if(!(v === null || v === undefined || v === '')) dolu++;
    }
    return varMi ? { diziMi, dolu, n:DB[kol].length } : null;
  }

  /* ---- B5.1 — `DB.<kol>[].<alan>` alan varlığı --------------------- */
  const alanDesen = /DB\.([a-zA-Z_$][\w$]*)\s*\[\s*\]\s*\.\s*([a-zA-Z_$][\w$]*)/g;
  const iddialar = new Map();
  let m;
  while((m = alanDesen.exec(brief))){
    if(!dizi(m[1])) continue;                 /* dizi olmayan koleksiyon atlanır */
    iddialar.set(m[1] + '[].' + m[2], { kol:m[1], alan:m[2] });
  }
  const yokOlan = [];
  for(const [ad, r] of iddialar) if(!alanTipi(r.kol, r.alan)) yokOlan.push(ad);
  if(yokOlan.length)
    de('brief bir ALAN İDDİA EDİYOR ama veride HİÇBİR KAYITTA yok: ' + yokOlan.join(', '));
  else ok(`${iddialar.size} alan iddiasının ${iddialar.size}'i veride doğrulandı`);
  console.log(`     · ölçülen benzersiz alan iddiası: ${iddialar.size}`);

  /* ---- B5.2 — DİZİ alana `===`, SKALER alana `indexOf` ------------- */
  /* ⚠️ İKİ YÖNLÜ SINAMADA ÖĞRENİLDİ — ilk yazım bu kusuru KAÇIRDI, iki
     sebepten:
       1. Karşılaştırmayı yalnız satır içi backtick'lerde arıyordu; gerçek
          hata ```js FENCE'İN içindeydi.
       2. Alan adını TÜM koleksiyonlarda arıyordu. `tur` alanı
          `DB.reasonCodes`ta DİZİ, `DB.maintenance`/`fines`/`trainings`te
          SKALER — yani "belirsiz" kovasına düşüp bulgu sayılmıyordu.
     Doğrusu KAPSAMLANDIRMAKtır: bir karşılaştırma hangi koleksiyonun
     kaydından okuyorsa o koleksiyona sorulur. Kapsam, karşılaştırmanın
     bulunduğu kod bloğunda (ya da yakın metin penceresinde) anılan
     `DB.<kol>` adlarından türetilir. Kapsam çözülemezse iddia ölçülür ama
     bulgu SAYILMAZ — eksen fazla saymaz (L-26). */
  function alanTipiKapsamli(kolListe, alan){
    const out = [];
    for(const k of kolListe){
      const t = alanTipi(k, alan);
      if(t) out.push({ kol:k, diziMi:t.diziMi });
    }
    return out;
  }

  /* Metni KAPSAM PARÇALARINA böl: her ```fence``` bir parça, fence dışındaki
     metin de paragraf paragraf parça. Her parçanın kendi `DB.<kol>` kümesi var. */
  const parcalar = [];
  {
    const fenceDesen = /```[\s\S]*?```/g;
    let son = 0, mm;
    while((mm = fenceDesen.exec(brief))){
      if(mm.index > son) parcalar.push(brief.slice(son, mm.index));
      parcalar.push(mm[0]);
      son = mm.index + mm[0].length;
    }
    if(son < brief.length) parcalar.push(brief.slice(son));
  }
  /* Fence dışı parçalar paragrafa bölünür: bir tablo satırı ya da paragraf,
     kendi koleksiyonunu anan en dar kapsamdır. */
  const kapsamlar = [];
  for(const par of parcalar){
    if(par.startsWith('```')) kapsamlar.push(par);
    else for(const p2 of par.split(/\n\s*\n|\n(?=\|)/)) if(p2.trim()) kapsamlar.push(p2);
  }

  const tipHatasi = [], kapsamsiz = [], belirsiz = [];
  let tipOlculen = 0;
  const esitDesen = /\b([a-zA-Z_$][\w$]*)\s*\.\s*([a-zA-Z_$][\w$]*)\s*(?:===|!==)\s*'[^']*'/g;
  const kolonDesen = /`\s*([a-zA-Z_$][\w$]*)\s*:\s*'([^']*)'\s*`/g;
  const idxDesen = /\b([a-zA-Z_$][\w$]*)\s*(?:\|\|\s*\[\s*\]\s*\))?\s*\.\s*indexOf\s*\(/g;

  for(const kap of kapsamlar){
    const koller = [...new Set([...kap.matchAll(/DB\.([a-zA-Z_$][\w$]*)/g)]
      .map(x => x[1]).filter(dizi))];
    let mm;

    /* a) `<x>.<alan> === '…'` — nesne yolu üzerinden okuma */
    esitDesen.lastIndex = 0;
    while((mm = esitDesen.exec(kap))){
      const alan = mm[2];
      if(!koller.length){ kapsamsiz.push('`.' + alan + " === …`"); continue; }
      const t = alanTipiKapsamli(koller, alan);
      if(!t.length) continue;
      tipOlculen++;
      if(t.every(x => x.diziMi))
        tipHatasi.push('`' + alan + '` DİZİdir (' + t.map(x => 'DB.' + x.kol).join(' · ') +
          ') ama brief `===` ile okutuyor — o okuma SIFIR kayıt bulur, `indexOf` yazılmalı');
      else if(t.some(x => x.diziMi))
        belirsiz.push('`' + alan + '` bu kapsamda hem dizi hem skaler');
    }

    /* b) `alan:'deger'` — düzyazıdaki kısa yazım */
    kolonDesen.lastIndex = 0;
    while((mm = kolonDesen.exec(kap))){
      const alan = mm[1];
      if(!koller.length) continue;
      const t = alanTipiKapsamli(koller, alan);
      if(!t.length) continue;
      tipOlculen++;
      if(t.every(x => x.diziMi))
        tipHatasi.push('`' + alan + ":'" + mm[2] + '`\'' + ' DİZİ alanı (' +
          t.map(x => 'DB.' + x.kol).join(' · ') + ') — `taşıyanlar` ifadesi `===` gibi ' +
          'okunur ve SIFIR kayıt bulur; `indexOf` yazılmalı');
      else if(t.some(x => x.diziMi))
        belirsiz.push('`' + alan + '` bu kapsamda hem dizi hem skaler');
    }

    /* c) `.indexOf(` — skaler alana dizi okuması */
    idxDesen.lastIndex = 0;
    while((mm = idxDesen.exec(kap))){
      const alan = mm[1];
      if(!koller.length) continue;
      const t = alanTipiKapsamli(koller, alan);
      if(!t.length) continue;
      tipOlculen++;
      if(t.every(x => !x.diziMi))
        tipHatasi.push('`' + alan + '` SKALERdir (' + t.map(x => 'DB.' + x.kol).join(' · ') +
          ') ama brief `indexOf` ile okutuyor');
    }
  }
  if(tipHatasi.length) de('brief bir alanı YANLIŞ TİPTE okutuyor — ' + [...new Set(tipHatasi)].join(' | '));
  else ok(`${tipOlculen} okuma iddiasının tipi veriyle tutuyor` +
          (belirsiz.length ? ` (${new Set(belirsiz).size} iddia kapsamda belirsiz, bulgu sayılmadı)` : ''));
  console.log(`     · ölçülen okuma iddiası: ${tipOlculen} · ${kapsamlar.length} kapsam parçası` +
              (kapsamsiz.length ? ` · ${new Set(kapsamsiz).size} iddia kapsamsız (koleksiyon anılmamış)` : ''));

  /* ---- B5.3 — "dizi alanı olan kayıtlar" listesi ------------------- */
  /* §21.11 bu listeyi AÇIKÇA veriyor: `DB.employees[].roller · .yetkinlik …`
     Nokta ile devam eden alanlar bir önceki koleksiyona aittir. */
  const blok = (brief.match(/\*\*Dizi alanı olan kayıtlar\*\*[\s\S]{0,700}?\n\n/) || [''])[0];
  const diziIddia = [];
  {
    const satirDesen = /DB\.([a-zA-Z_$][\w$]*)\s*\[\s*\]\s*((?:\.\s*[a-zA-Z_$][\w$]*\s*(?:·\s*)?)+)/g;
    let mm;
    while((mm = satirDesen.exec(blok))){
      const kol = mm[1];
      for(const a of mm[2].split('·')){
        const ad = a.replace(/[.\s]/g, '');
        if(ad) diziIddia.push({ kol, alan:ad });
      }
    }
  }
  if(!diziIddia.length){
    de('§21.11 "dizi alanı olan kayıtlar" bloğu okunamadı — iddia koşturulamadı');
  }else{
    const degil = [];
    for(const r of diziIddia){
      const t = alanTipi(r.kol, r.alan);
      if(!t) degil.push('DB.' + r.kol + '[].' + r.alan + ' (alan YOK)');
      else if(!t.diziMi) degil.push('DB.' + r.kol + '[].' + r.alan + ' (dizi DEĞİL)');
    }
    if(degil.length) de('brief "dizi alanı" diyor ama değil: ' + degil.join(', '));
    else ok(`${diziIddia.length} "dizi alanı" iddiasının ${diziIddia.length}'i gerçekten dizi`);
  }
  console.log(`     · ölçülen dizi alanı iddiası: ${diziIddia.length}`);

  /* ---- B5.4 — ÖRNEK ÇAĞRININ ARGÜMAN TİPİ ------------------------- */
  /* `GV.fmt.days(3)` hatası B5.1-5.3'ün sınıfında DEĞİL: alan okuma değil
     YORDAM İMZASI hatası. Brief `hours(7.5)` yanına `days(3)` koyunca yordam
     bir SÜRE biçimlendiricisi gibi görünüyordu; gerçek imza `days(iso, today)`
     ve `days(3)` DOM'a `NaN` basıyor.

     `ui.js` Node'da KOŞTURULAMAZ (DOM ister), o yüzden örnek çağrı gerçekten
     çalıştırılamıyor. Bunun yerine PARAMETRE ADI ile ARGÜMAN BİÇİMİ
     karşılaştırılır — kaynak metinden okunur, tahmin değil:
       `days:function(iso, today)` → ilk parametre bir TARİHTİR
       brief `GV.fmt.days(3)` yazıyor → çıplak sayı → BULGU
     Tarih ailesi bu sınıfın yaşadığı yer; kural o aileye dar tutuldu ki
     eksen fazla saymasın (L-26). */
  const uiSrc = fs.readFileSync(path.join(ROOT, 'assets/js/ui.js'), 'utf8');
  const imza = new Map();
  for(const mm of uiSrc.matchAll(/^\s{4}([a-zA-Z_$][\w$]*):function\(([^)]*)\)/gm)){
    if(!imza.has(mm[1])) imza.set(mm[1], mm[2].split(',').map(x => x.trim()).filter(Boolean));
  }
  const TARIH_PARAM = /^(iso|tarih|today|bugun|baslangic|bitis)$/i;
  const cagriHatasi = [];
  let cagriOlculen = 0;
  for(const mm of brief.matchAll(/GV\.fmt\.([a-zA-Z_$][\w$]*)\(\s*([^),]*?)\s*[,)]/g)){
    const fn = mm[1], arg = mm[2].trim();
    const par = imza.get(fn);
    if(!par || !par.length || arg === '') continue;
    cagriOlculen++;
    if(TARIH_PARAM.test(par[0]) && /^-?\d+(\.\d+)?$/.test(arg))
      cagriHatasi.push('`GV.fmt.' + fn + '(' + arg + ')` — ilk parametre `' + par[0] +
                       '` bir TARİHTİR, brief çıplak sayı geçiriyor; bu çağrı NaN döner');
  }
  if(cagriHatasi.length)
    de('brief bir örnek çağrıyı YANLIŞ ARGÜMANLA gösteriyor — ' + cagriHatasi.join(' | '));
  else ok(`${cagriOlculen} örnek çağrının argüman tipi imzayla tutuyor`);
  console.log(`     · ölçülen örnek çağrı: ${cagriOlculen} (${imza.size} imza kaynaktan okundu)`);
}

console.log(`\n${hata ? '✗ ' + hata + ' BULGU' : '✓ BRIEF KODLA UYUMLU'}\n`);
process.exit(hata ? 1 : 0);
