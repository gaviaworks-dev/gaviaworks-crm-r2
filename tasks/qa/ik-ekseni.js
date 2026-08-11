#!/usr/bin/env node
/* =====================================================================
   R2 İK EKSENİ — K-18 (R1'den devreden borç) + zimmet tek kaynak

   R1'in açık borcu: `employee` `GV.flow`un 15. geçiş varlığıydı ve yedi
   durumu tanımlıydı, ama HİÇBİR ekran `durum` alanını okumuyordu. Yedi
   ekran bunun yerine `aktif` boolean'ına bakıyordu — ve o alan 16 kaydın
   16'sında `true` idi, yani hiçbir şey ayırt etmiyordu.

   Ölçülen eksenler:
     [I1] BAYAT ALAN — `DB.employees[].aktif` tuzağı kurulu mu, okuyan var mı
     [I2] TÜRETİM    — `GV.hr.istihdamda` / `.atanabilir` durumdan türüyor mu
     [I3] EKRAN      — atama listeleri ortak yordamı çağırıyor mu, ham süzgeç kaldı mı
     [I4] GEÇİŞ      — `employee` tablosu tutarlı mı, kayıtlardaki durum sözlükte mi
     [I5] KAPI YÖNÜ  — bir geçişi yapan rol onu geri de alabiliyor mu
     [I6] ZİMMET     — envanter zimmet defterinden mi türüyor, çelişki kaldı mı
     [I7] KABUL KAPISI — kabul ile kabul geri almanın yetki kümesi AYNI mı

   Sıfır bulgu tek başına temiz değildir: kaç şey ölçüldüğü de basılır.

   Koşum: node tasks/qa/ik-ekseni.js   (depo kökünden)
          GV_ROOT=<kopya> node tasks/qa/ik-ekseni.js   (bozulmuş kopyada)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : process.cwd();

const bulgu = [];
let kontrol = 0;
function ol(ad, gercek, beklenen, karsilastir){
  kontrol++;
  const ok = karsilastir ? karsilastir(gercek, beklenen) : gercek === beklenen;
  if(!ok) bulgu.push(`${ad} — beklenen: ${beklenen} · ölçülen: ${gercek}`);
  console.log(`  ${ok ? '✓' : '✗'} ${ad} · ${gercek}`);
  return ok;
}

/* ---- Ortamı kur ---------------------------------------------------- */
global.window = {};
global.DB = {};
for(const f of ['org','crm','work','misc','ops','hr','lifecycle','firsat']){
  eval(fs.readFileSync(path.join(ROOT, 'assets/data/' + f + '.js'), 'utf8'));
}
window.DB = global.DB;
let ROL = 'ik';
global.GV = window.GV = {
  session:{ emp:'EMP-001', dep:'DEP-01' },
  perm:{ role:() => ROL, can:() => true, scope:() => 'tum' }
};
eval(fs.readFileSync(path.join(ROOT, 'assets/js/domain.js'), 'utf8'));
/* ⚠️ `const GV`/`const DB` YAZILMAZ. Modül kapsamında bildirilen bir sabit,
   yukarıdaki `eval` çağrılarında TDZ'ye düşer ve veri dosyaları `DB.today = …`
   yazarken "Cannot access 'DB' before initialization" ile patlar. İkisi de
   zaten `global` üzerinde duruyor; bildirmeden kullanılır. */

/* =====================================================================
   [I1] BAYAT ALAN — `aktif` tuzağı
   ===================================================================== */
console.log('\n[I1] Bayat eksen — DB.employees[].aktif');
ol('tuzak sayacı kurulu', typeof DB.ikBayat === 'object' && DB.ikBayat !== null, true);
const sayacBasi = DB.ikBayat.sayac;
const okundu = DB.employees[0].aktif;
ol('alan okununca undefined döner', okundu === undefined, true);
ol('okuma sayaca yazıldı', DB.ikBayat.sayac, sayacBasi + 1);
DB.ikBayat.okuma.length = 0; DB.ikBayat.yazma.length = 0; DB.ikBayat.sayac = 0;

/* Kaynak taraması — hiçbir ekran/ortak katman alanı OKUMAMALI.
   Yorum kod değildir; ayıklanır (kontrol.js ile aynı disiplin). */
function koduSuz(s){
  return s.replace(/\/\*[\s\S]*?\*\//g, ' ')
          .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
          .replace(/'(?:\\.|[^'\\])*'/g, "''")
          .replace(/"(?:\\.|[^"\\])*"/g, '""');
}
const taranan = fs.readdirSync(ROOT).filter(f => /^app-.*\.html$/.test(f))
  .concat(['assets/js/domain.js','assets/js/ui.js','assets/js/shell.js','assets/js/kuyruk.js']);
const hamOkuyan = [];
for(const f of taranan){
  const kodu = koduSuz(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  /* `e.aktif` / `emp.aktif` / `personel.aktif` — personel kaydı üzerindeki okuma.
     Diğer koleksiyonların kendi `aktif` alanı BU EKSENİN KONUSU DEĞİLDİR. */
  if(/\b(e|emp|kisi|personel|calisan)\.aktif\b/.test(kodu)) hamOkuyan.push(f);
  if(/DB\.employees[^;]{0,120}\.aktif\b/.test(kodu)) hamOkuyan.push(f);
}
ol('personel `aktif` alanını okuyan dosya', [...new Set(hamOkuyan)].join(', ') || 'yok', 'yok');
console.log(`     · taranan dosya: ${taranan.length}`);

/* =====================================================================
   [I2] TÜRETİM — durumdan
   ===================================================================== */
console.log('\n[I2] Türetilmiş yordamlar');
ol('GV.hr.istihdamda var', typeof GV.hr.istihdamda, 'function');
ol('GV.hr.atanabilir var', typeof GV.hr.atanabilir, 'function');
ol('GV.hr.atanabilirler var', typeof GV.hr.atanabilirler, 'function');

const beklenen = {
  'Taslak':      { istihdamda:false, atanabilir:false },
  'Onboarding':  { istihdamda:true,  atanabilir:false },
  'Aktif':       { istihdamda:true,  atanabilir:true  },
  'İzinli':      { istihdamda:true,  atanabilir:false },
  'Pasif':       { istihdamda:true,  atanabilir:false },
  'Offboarding': { istihdamda:true,  atanabilir:false },
  'Ayrıldı':     { istihdamda:false, atanabilir:false }
};
let tablo = 0;
for(const d of DB.employeeStatuses){
  const sahte = { kod:'TEST', durum:d };
  const b = beklenen[d];
  if(!b){ bulgu.push(`[I2] sözlükte beklenen tanımı olmayan durum: ${d}`); continue; }
  tablo++;
  if(GV.hr.istihdamda(sahte) !== b.istihdamda)
    bulgu.push(`[I2] ${d} — istihdamda beklenen ${b.istihdamda}, ölçülen ${GV.hr.istihdamda(sahte)}`);
  if(GV.hr.atanabilir(sahte) !== b.atanabilir)
    bulgu.push(`[I2] ${d} — atanabilir beklenen ${b.atanabilir}, ölçülen ${GV.hr.atanabilir(sahte)}`);
}
kontrol += tablo * 2;
console.log(`  ✓ ${tablo} durumun her biri iki eksende ölçüldü (${tablo * 2} kontrol)`);

/* OLUMLU/OLUMSUZ VAKA — Offboarding personel atama listesinde OLMAMALI */
const off = DB.employees.filter(e => e.durum === 'Offboarding');
const atanabilirler = GV.hr.atanabilirler();
ol('Offboarding durumunda personel var (vaka ölçülebilir)', off.length > 0, true);
ol('Offboarding personel atama listesinde YOK (olumsuz vaka)',
   off.filter(e => atanabilirler.some(x => x.kod === e.kod)).length, 0);
ol('Aktif personel atama listesinde VAR (olumlu vaka)',
   DB.employees.filter(e => e.durum === 'Aktif').every(e => atanabilirler.some(x => x.kod === e.kod)), true);
console.log(`     · 16 personelin ${atanabilirler.length}'i atanabilir, ${16 - atanabilirler.length}'i değil`);

/* =====================================================================
   [I3] EKRAN — ortak yordam çağrılıyor mu
   ===================================================================== */
console.log('\n[I3] Ekranlar ortak yordamı çağırıyor mu');
const ekranlar = fs.readdirSync(ROOT).filter(f => /^app-.*\.html$/.test(f));
let cagiran = 0;
const hamSuzgec = [];
for(const f of ekranlar){
  const kodu = koduSuz(fs.readFileSync(path.join(ROOT, f), 'utf8'));
  if(/GV\.hr\.(atanabilirler|atanabilir|istihdamda)\b/.test(kodu)) cagiran++;
  if(/DB\.employees[\s\S]{0,80}\.filter[\s\S]{0,120}aktif/.test(kodu)) hamSuzgec.push(f);
}
ol('ham `aktif` süzgeci kalan ekran', hamSuzgec.join(', ') || 'yok', 'yok');
console.log(`     · ${cagiran} ekran GV.hr türetilmiş yordamını çağırıyor`);

/* =====================================================================
   [I4] GEÇİŞ TABLOSU
   ===================================================================== */
console.log('\n[I4] employee geçiş tablosu');
const T = DB.transitions.employee || {};
ol('tablodaki durum sayısı sözlükle eşit',
   Object.keys(T).length, DB.employeeStatuses.length);
const yetim = Object.keys(T).filter(k => DB.employeeStatuses.indexOf(k) === -1);
ol('sözlükte olmayan tablo durumu', yetim.join(', ') || 'yok', 'yok');
const kayitDisi = [...new Set(DB.employees.map(e => e.durum))].filter(d => !T[d]);
ol('tabloda olmayan kayıt durumu', kayitDisi.join(', ') || 'yok', 'yok');
const yetimHedef = [];
Object.keys(T).forEach(k => (T[k].next || []).forEach(h => { if(!T[h]) yetimHedef.push(k + '→' + h); }));
ol('yetim geçiş hedefi', yetimHedef.join(', ') || 'yok', 'yok');

/* =====================================================================
   [I5] KAPI YÖNÜ — geri almak, yapmaktan ağır olamaz
   ===================================================================== */
console.log('\n[I5] Kapı yönü — geri alma yapmaktan ağır olamaz');
const kume = k => (T[k] && T[k].yetki ? T[k].yetki.slice().sort().join('/') : '');
const agir = [];
Object.keys(T).forEach(k => {
  (T[k].next || []).forEach(h => {
    if(!T[h]) return;
    const geri = (T[h].next || []).indexOf(k) !== -1;
    if(!geri) return;                                  /* dönüş kenarı yok — ayrı ölçüm */
    if(kume(h) && kume(k) && kume(h) !== kume(k))
      agir.push(`${k}→${h} yetki [${kume(k)}] ama ${h}→${k} yetki [${kume(h)}]`);
  });
});
ol('dönüşü olan kenarlarda yetki kümesi aynı', agir.join(' · ') || 'evet', 'evet');

/* Dönüşü OLMAYAN kenarlar — bilgi olarak basılır, kusur sayılmaz:
   `Ayrıldı` gerçek dünyada geri alınmaz, yeni bir istihdam kaydı açılır. */
const tekYon = [];
Object.keys(T).forEach(k => (T[k].next || []).forEach(h => {
  if(T[h] && (T[h].next || []).indexOf(k) === -1) tekYon.push(k + '→' + h);
}));
console.log(`     · tek yönlü kenar (bilgi): ${tekYon.join(' · ') || 'yok'}`);

/* =====================================================================
   [I6] ZİMMET — envanter zimmet defterinden türüyor mu
   ===================================================================== */
console.log('\n[I6] Zimmet tek kaynak');
ol('GV.varlik.tazeleHepsi var', typeof GV.varlik.tazeleHepsi, 'function');
/* ⚠️ ÇELİŞKİ **YÜKLENDİĞİ HÂLİYLE** ÖLÇÜLÜR. İlk yazımda eksen ölçümden
   önce `tazeleHepsi()` çağırıyordu ve böylece ölçeceği şeyi ONARIYORDU:
   yükleme anındaki türetim kapatıldığında bile yeşil yanıyordu (bozulmuş
   kopyada kanıtlandı — enjekte edilen kusur yakalanmadı). Ekranın gördüğü
   durum, yüklemeden sonraki durumdur; eksen de onu ölçer. */
ol('yüklemede türetim koştu (sonTazeleme yazıldı)',
   !!(GV.varlik.sonTazeleme && typeof GV.varlik.sonTazeleme.olculen === 'number'), true);
const celiski = [];
DB.assets.forEach(a => {
  if(a.durum === 'Hurda') return;
  const z = GV.varlik.zimmetOf(a.kod);
  const kabul = GV.varlik.kabulEdildi(z);
  if(kabul && a.zimmetli !== z.personel)
    celiski.push(`${a.kod} kabul edilmiş zimmet var ama envanter zimmetli=${a.zimmetli}`);
  if(!kabul && a.zimmetli)
    celiski.push(`${a.kod} kabul edilmiş zimmet YOK ama envanter zimmetli=${a.zimmetli}`);
  if(z && !kabul && a.durum !== 'Zimmet bekliyor')
    celiski.push(`${a.kod} kabul bekliyor ama envanter durumu ${a.durum}`);
});
ol('envanter ile zimmet defteri çelişkisi', celiski.length, 0);
if(celiski.length) celiski.slice(0, 5).forEach(c => console.log('       · ' + c));
const sozlukDisi = [...new Set(DB.assets.map(a => a.durum))].filter(d => DB.assetStatuses.indexOf(d) === -1);
ol('sözlük dışı demirbaş durumu', sozlukDisi.join(', ') || 'yok', 'yok');
console.log(`     · ${DB.assets.length} demirbaş · ${DB.assignments.length} zimmet kaydı · ` +
            `yüklemede düzeltilen ${(GV.varlik.sonTazeleme || {}).degisen ? GV.varlik.sonTazeleme.degisen.length : '?'}`);
/* Türetim İDEMPOTENT olmalı: ikinci koşum hiçbir şeyi değiştirmemeli.
   Değiştiriyorsa türetim kendi çıktısını girdi sayıyor demektir. */
ol('türetim idempotent (ikinci koşumda değişen yok)',
   GV.varlik.tazeleHepsi().degisen.length, 0);

/* =====================================================================
   [I7] KABUL KAPISI — kurma ve geri alma kümesi aynı mı
   ===================================================================== */
console.log('\n[I7] Zimmet kabul kapısı — yön');
const bekleyen = DB.assignments.filter(z => z.personelOnay !== 'Onaylandı')[0];
if(!bekleyen){
  console.log('  ! kabul bekleyen zimmet kaydı yok — kapı ölçülemedi');
}else{
  const dene = (rol, emp) => {
    ROL = rol; GV.session.emp = emp;
    const k = GV.varlik.kabulEt(bekleyen.kod);
    if(k.ok) GV.varlik.kabulGeriAl(bekleyen.kod, 'eksen sınaması');
    const g0 = GV.varlik.kabulEt(bekleyen.kod);           /* geri alma için önce kabul */
    const g = GV.varlik.kabulGeriAl(bekleyen.kod, 'eksen sınaması');
    if(g0.ok && !g.ok) GV.varlik.kabulGeriAl(bekleyen.kod, 'temizlik');
    return { kur:k.ok === true ? 'gecti' : k.why, geri:g.ok === true ? 'gecti' : g.why };
  };
  const icerde = dene('ik', 'EMP-001');
  ol('İK — kabul edebilir', icerde.kur !== 'yetki', true);
  ol('İK — kabul geri alabilir', icerde.geri !== 'yetki', true);
  /* Gerekçe kapısı kabul tarafında YOK, geri alma tarafında VAR — bu bir
     yetki farkı değil KAYIT koşuludur ve kimseyi kilitlemez; ayrıca ölçülür. */
  ROL = 'ik'; GV.session.emp = 'EMP-001';
  GV.varlik.kabulEt(bekleyen.kod);
  ol('gerekçesiz geri alma reddedilir (olumsuz vaka)',
     (GV.varlik.kabulGeriAl(bekleyen.kod) || {}).why, 'gerekce');
  ol('gerekçeli geri alma kabul edilir (olumlu vaka)',
     GV.varlik.kabulGeriAl(bekleyen.kod, 'eksen sınaması').ok, true);
}
ROL = 'ik'; GV.session.emp = 'EMP-001';

/* =====================================================================
   SONUÇ
   ===================================================================== */
console.log('');
if(bulgu.length){
  console.log('✗ BULGU: ' + bulgu.length);
  bulgu.forEach(b => console.log('   · ' + b));
}else{
  console.log(`✓ TEMİZ · ${kontrol} kontrol koşuldu · 7 eksen ` +
              `(bayat alan · türetim · ekran · geçiş tablosu · kapı yönü · zimmet · kabul kapısı)`);
}
process.exit(bulgu.length ? 1 : 0);
