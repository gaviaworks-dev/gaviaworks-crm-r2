#!/usr/bin/env node
/* =====================================================================
   R2 ÖN UÇUŞ KONTROLÜ — tarayıcı olmadan yapılabilecek dürüst doğrulama

   Bu betik "konsol hatası yok" demez; TARAYICI ÇALIŞTIRILMADI. Söylediği şu:
     1. Her .js dosyası ve her satır içi <script> SÖZDİZİMİ GEÇERLİ.
     2. HTML'den referans verilen her dosya DİSKTE VAR.
     3. Bir sayfanın betiği `DB.x` okuyorsa, `x`i tanımlayan veri dosyası
        O SAYFADA YÜKLÜ (R1 dersi L-34: eksik veri hata vermez, EKSİK SAYI
        üretir — sessiz kusurun en pahalı sınıfı).
     4. Veri + domain katmanı Node'da yüklendiğinde İSTİSNA ATMIYOR.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
let hata = 0, uyari = 0;
const de = (m) => { console.log('  ✗ ' + m); hata++; };
const uy = (m) => { console.log('  ! ' + m); uyari++; };
const ok = (m) => console.log('  ✓ ' + m);

const htmls = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();
const jsFiles = [];
(function walk(d){
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { if (f !== 'qa' && f !== '.git') walk(p); }
    else if (f.endsWith('.js')) jsFiles.push(path.relative(ROOT, p));
  }
})(path.join(ROOT, 'assets'));

/* ---- 1. SÖZDİZİMİ ------------------------------------------------ */
console.log('\n[1] Sözdizimi');
for (const f of jsFiles) {
  try { cp.execSync(`node --check "${path.join(ROOT, f)}"`, { stdio: 'pipe' }); }
  catch (e) { de(`${f} — ${String(e.stderr).split('\n').slice(0,3).join(' ')}`); }
}
let inlineSayi = 0;
for (const h of htmls) {
  const src = fs.readFileSync(path.join(ROOT, h), 'utf8');
  const blocks = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [i, b] of blocks.entries()) {
    inlineSayi++;
    const tmp = path.join(require('os').tmpdir(), `r2-inline-${h}-${i}.js`);
    fs.writeFileSync(tmp, b[1]);
    try { cp.execSync(`node --check "${tmp}"`, { stdio: 'pipe' }); }
    catch (e) { de(`${h} satır içi #${i+1} — ${String(e.stderr).split('\n').slice(1,3).join(' ').trim()}`); }
    fs.unlinkSync(tmp);
  }
}
if (!hata) ok(`${jsFiles.length} js dosyası + ${inlineSayi} satır içi blok — sözdizimi temiz`);

/* ---- 2. REFERANS EDİLEN DOSYA VAR MI ----------------------------- */
console.log('\n[2] Referans edilen yerel dosyalar');
let ref = 0;
for (const h of htmls) {
  const raw = fs.readFileSync(path.join(ROOT, h), 'utf8');
  /* Satır içi <script> gövdesi ÇIKARILIR: oradaki href'ler JS dize
     birleştirmesidir ('...?id=' + h.kod), diskte aranacak bir yol değil. */
  const src = raw.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  const urls = [...src.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1])
    .filter(u => !/^(https?:|mailto:|tel:|#|data:)/.test(u));
  for (const u of urls) {
    ref++;
    const p = path.join(ROOT, u.split('?')[0].split('#')[0]);
    if (!fs.existsSync(p)) de(`${h} → ${u} DİSKTE YOK`);
  }
}
ok(`${ref} yerel referans denetlendi`);

/* ---- 3. VERİ BAĞIMLILIĞI (L-34) ---------------------------------- */
console.log('\n[3] Veri bağımlılığı — DB.x okuyan sayfa x\'i yüklüyor mu');
/* Hangi veri dosyası hangi koleksiyonu tanımlıyor */
const tanim = {};
for (const f of fs.readdirSync(path.join(ROOT, 'assets/data'))) {
  const src = fs.readFileSync(path.join(ROOT, 'assets/data', f), 'utf8');
  for (const m of src.matchAll(/^DB\.([A-Za-z_$][\w$]*)\s*=/gm)) tanim[m[1]] = 'assets/data/' + f;
  for (const m of src.matchAll(/^\s*DB\.([A-Za-z_$][\w$]*)\s*=/gm)) if(!tanim[m[1]]) tanim[m[1]] = 'assets/data/' + f;
}
for (const h of htmls) {
  const src = fs.readFileSync(path.join(ROOT, h), 'utf8');
  const yuklu = new Set([...src.matchAll(/src="(assets\/[^"]+)"/g)].map(m => m[1]));  /* ham HTML'den */
  const inline = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(b => b[1]).join('\n');
  const okunan = new Set([...inline.matchAll(/\bDB\.([A-Za-z_$][\w$]*)/g)].map(m => m[1]));
  for (const k of okunan) {
    const kaynak = tanim[k];
    if (!kaynak) { uy(`${h} → DB.${k} hiçbir veri dosyasında tanımlı değil (yordam olabilir)`); continue; }
    if (!yuklu.has(kaynak)) de(`${h} → DB.${k} okuyor ama ${kaynak} YÜKLENMEMİŞ`);
  }
}
ok('veri bağımlılığı denetlendi');

/* ---- 4. VERİ + DOMAIN NODE'DA YÜKLENİYOR MU ---------------------- */
console.log('\n[4] Veri ve domain katmanı yükleniyor mu');
try {
  const ctx = { console: { log(){}, warn(){}, error(){} } };
  vm.createContext(ctx);
  vm.runInContext('var window=globalThis; var self=globalThis;', ctx);
  const sira = ['org','crm','work','misc','ops','hr','notes','reports','lifecycle']
    .map(n => `assets/data/${n}.js`).filter(p => fs.existsSync(path.join(ROOT, p)));
  for (const f of sira) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  const DB = ctx.DB;
  ok(`${sira.length} veri dosyası yüklendi · customers=${DB.customers.length} leads=${DB.leads.length} accounts=${DB.accounts.length} opportunities=${DB.opportunities.length}`);
  const bos = (DB.accounts || []).filter(a => !a.evre);
  if (bos.length) de(`${bos.length} hesabın yaşam evresi türetilemedi: ${bos.map(a=>a.kod).join(', ')}`);
  else ok('her hesabın yaşam evresi türetildi · ' + JSON.stringify(DB.accountsByStage()));
  const kodlar = (DB.accounts||[]).map(a=>a.kod);
  const mukerrer = kodlar.filter((k,i)=>kodlar.indexOf(k)!==i);
  if (mukerrer.length) de('mükerrer hesap kodu: ' + mukerrer.join(', '));
  else ok('mükerrer hesap kodu yok');
} catch (e) { de('veri katmanı istisna attı — ' + e.message); }

/* ---- 5. MENÜ SAYIMI ---------------------------------------------- */
console.log('\n[5] Görünür menü girdisi');
/* Şartname §3.1: "STANDART KULLANICIDA en fazla 18 menü girdisi görünmelidir.
   Sistem yöneticisi, ayar sekmeleri nedeniyle DAHA FAZLA öğeye erişebilir;
   ancak bunlar günlük menüyle aynı görsel ağırlıkta olmamalıdır."
   Bu yüzden iki ayrı sayı ölçülür:
     · günlük girdi  → her rol için, kabul kriteri ≤18
     · yönetim girdi → yalnız yönetici rollerde, ayrı blokta ve soluk       */
try {
  const ctx = { console: { log(){}, warn(){}, error(){} } };
  vm.createContext(ctx);
  vm.runInContext(`
    var window=globalThis; var self=globalThis;
    var localStorage={getItem(){return null;},setItem(){},removeItem(){}};
    var sessionStorage={getItem(){return null;},setItem(){},removeItem(){}};
    var location={search:'',pathname:'/app-panel.html',hash:''};
    var history={replaceState(){}};
    var document={readyState:'complete',addEventListener(){},body:{dataset:{}},
      getElementById(){return null;},querySelector(){return null;},
      querySelectorAll(){return [];},createElement(){return {style:{},setAttribute(){},classList:{add(){},remove(){},toggle(){},contains(){return false;}},appendChild(){},addEventListener(){}};}};
    var fetch=function(){ var chain={ then:function(){ return chain; }, catch:function(){ return chain; } }; return chain; };
    var MutationObserver=function(){this.observe=function(){};};
  `, ctx);
  for (const f of ['assets/data/org.js','assets/data/crm.js','assets/js/shell.js'])
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });

  const GV = ctx.GV;
  const roller = Object.keys(ctx.DB.permMatrix || {});
  const satirlar = [];
  for (const r of roller) {
    const emp = (ctx.DB.employees || []).find(e => (e.roller||[]).includes(r));
    const s = (r === 'musteri') ? GV.shell.setSession(null, 'musteri')
                                : GV.shell.setSession((emp || ctx.DB.employees[0]).kod, r);
    if (!s) { uy(`${r} — oturum kurulamadı, ölçülemedi`); continue; }
    const items = GV.shell.visibleItems();
    const gunluk  = items.filter(i => !i.yonetim).length;
    const yonetim = items.filter(i =>  i.yonetim).length;
    const alanlar = new Set(items.map(i => i.alan)).size;
    satirlar.push({ r, gunluk, yonetim, toplam: items.length, alanlar });
  }
  satirlar.sort((a,b) => b.toplam - a.toplam);
  console.log('  rol            alan  günlük  yönetim  toplam');
  for (const x of satirlar) {
    console.log(`  ${x.r.padEnd(14)} ${String(x.alanlar).padStart(3)} ${String(x.gunluk).padStart(7)} ${String(x.yonetim).padStart(8)} ${String(x.toplam).padStart(7)}`);
  }
  const asan = satirlar.filter(x => x.gunluk > 18);
  const alanAsan = satirlar.filter(x => x.alanlar > 7);
  if (asan.length) de(`günlük girdide 18 sınırını aşan rol: ${asan.map(x=>x.r+'='+x.gunluk).join(', ')}`);
  else ok(`en yüksek GÜNLÜK girdi ${Math.max(...satirlar.map(x=>x.gunluk))} — kabul kriteri ≤18 SAĞLANDI`);
  if (alanAsan.length) de(`7 çalışma alanını aşan rol: ${alanAsan.map(x=>x.r+'='+x.alanlar).join(', ')}`);
  else ok(`en yüksek çalışma alanı ${Math.max(...satirlar.map(x=>x.alanlar))} — kabul kriteri ≤7 SAĞLANDI`);
  const enCokToplam = Math.max(...satirlar.map(x=>x.toplam));
  console.log(`  · yönetici rolde toplam ${enCokToplam} girdi görünür; fazlası ayrı "Yönetim" bloğunda ve soluk basılır (§3.1).`);
} catch (e) { de('menü ölçümü koşamadı — ' + e.message); }

console.log(`\n${hata ? '✗ BULGU: ' + hata : '✓ TEMİZ'}${uyari ? ' · uyarı: ' + uyari : ''}\n`);
process.exit(hata ? 1 : 0);
