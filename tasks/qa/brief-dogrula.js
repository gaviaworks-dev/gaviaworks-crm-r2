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
  for(const f of ['assets/js/ui.js','assets/js/shell.js','assets/js/quicknote.js'])
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

console.log(`\n${hata ? '✗ ' + hata + ' BULGU' : '✓ BRIEF KODLA UYUMLU'}\n`);
process.exit(hata ? 1 : 0);
