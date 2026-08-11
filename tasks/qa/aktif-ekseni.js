#!/usr/bin/env node
/* =====================================================================
   R2 AKTİF EKSENİ — K-33 (K-18'in bütün varlıklara genişletilmiş hâli)

   K-18'de `DB.employees[].aktif` tuzağa çevrildi. Bu tur ölçüldü ki aynı
   tuzak 53 koleksiyonda daha kuruluydu: 54 koleksiyon · 566 kayıtta alan
   var · yalnız 8'i `false`. Yani alan neredeyse hiçbir yerde bir şey ayırt
   etmiyordu ama `durum` ile yan yana okununca ikinci bir eksen gibi
   davranıyordu — `ik-ekseni` bunu YALNIZ personelde arıyordu.

   Ölçülen eksenler:
     [A1] TUZAK    — `durum` kanonlu her koleksiyonda alan tuzağa çevrildi mi
     [A2] KANON    — `durum` ekseni olmayan koleksiyonlarda alan KALDI mı
     [A3] OKUMA    — kodda `.aktif` okuyan yer, kanon koleksiyonlar dışında kaldı mı
     [A4] ARŞİV    — arşiv kararı tek yerden mi veriliyor (`GV.arsivli`)
     [A5] DAVRANIŞ — tuzak kurulmadan önce arşivli olan kayıtlar arşivli kaldı mı
     [A6] ÇALIŞMA  — tuzak gerçekten ateşliyor mu (enjekte edilmiş okuma)

   Sıfır bulgu tek başına temiz değildir: kaç şey ölçüldüğü de basılır.

   Koşum: node tasks/qa/aktif-ekseni.js
          GV_ROOT=<kopya> node tasks/qa/aktif-ekseni.js   (bozulmuş kopyada)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : process.cwd();

const bulgu = [];
let kontrol = 0;
function ol(ad, kosul, detay){
  kontrol++;
  if(!kosul) bulgu.push(ad + (detay ? ' — ' + detay : ''));
  console.log(`  ${kosul ? '✓' : '✗'} ${ad}${detay ? ' · ' + detay : ''}`);
  return kosul;
}

/* ---- Ortam ---------------------------------------------------------- */
global.window = {};
global.DB = {};
const VERI = ['org','crm','work','misc','ops','hr','lifecycle','firsat','odeme','notes'];
for(const f of VERI) eval(fs.readFileSync(path.join(ROOT, 'assets/data/' + f + '.js'), 'utf8'));
window.DB = global.DB;

/* ⚠️ ÖLÇÜM, TUZAK KURULMADAN ÖNCEKİ HÂLİ SAPTAR. Aksi hâlde eksen kendi
   ölçtüğü şeyi onarır — `ik-ekseni`nin ilk yazımı tam bu yüzden enjekte
   edilen kusuru yakalayamamıştı (handoff §4.6). */
const oncesi = {};
for(const ad of Object.keys(DB)){
  const v = DB[ad];
  if(!Array.isArray(v) || !v.length) continue;
  const kay = v.filter(x => x && typeof x === 'object');
  if(!kay.length) continue;
  const alanli = kay.filter(x => Object.getOwnPropertyDescriptor(x, 'aktif'));
  if(!alanli.length) continue;
  oncesi[ad] = {
    kayit: kay.length,
    alanli: alanli.length,
    yanlis: alanli.filter(x => x.aktif === false).map(x => x.kod || null),
    /* Alanı OKUMADAN sınıfla — `customers[].durum` tuzaktır ve okumak
       `bayat-alan` eksenini yanlış alarma düşürür (ölçüldü). */
    durumlu: kay.some(x => {
      const t = Object.getOwnPropertyDescriptor(x, 'durum');
      return !!t && !t.get && typeof t.value === 'string';
    }),
    tuzakliZaten: alanli.filter(x => Object.getOwnPropertyDescriptor(x, 'aktif').get).length
  };
}

global.GV = window.GV = {
  session:{ emp:'EMP-001', dep:'DEP-01' },
  perm:{ role:() => 'ik', can:() => true, scope:() => 'tum' }
};
eval(fs.readFileSync(path.join(ROOT, 'assets/js/domain.js'), 'utf8'));

/* =====================================================================
   [A1] TUZAK — `durum` kanonlu koleksiyonlarda alan kapatıldı mı
   ===================================================================== */
console.log('\n[A1] Tuzak — `durum` kanonlu koleksiyonlar');
ol('tuzak sayacı kurulu', !!DB.bayatAktif && typeof DB.bayatAktif.sayac === 'number');

const durumlular = Object.keys(oncesi).filter(a => oncesi[a].durumlu);
const acikKalan = [];
for(const ad of durumlular){
  const kay = DB[ad].filter(x => x && typeof x === 'object');
  const acik = kay.filter(x => {
    const t = Object.getOwnPropertyDescriptor(x, 'aktif');
    return t && !t.get;
  });
  if(acik.length) acikKalan.push(`${ad}(${acik.length})`);
}
ol(`${durumlular.length} durum kanonlu koleksiyonun hepsinde alan tuzaklı`,
  acikKalan.length === 0, acikKalan.length ? acikKalan.join(' · ') : '0 açık kayıt');

const toplamTuzak = (DB.bayatAktif.tuzakli || []).reduce((s, t) => s + t.kayit, 0);
ol('tuzağa çevrilen kayıt sayısı basılıyor', toplamTuzak > 0,
  `${DB.bayatAktif.tuzakli.length} koleksiyon · ${toplamTuzak} kayıt (+ employees hr.js'te)`);

/* =====================================================================
   [A2] KANON — `durum` ekseni olmayan koleksiyonlarda alan KALIR
   ===================================================================== */
console.log('\n[A2] Kanon — `durum` ekseni olmayan koleksiyonlar');
const kanonlar = Object.keys(oncesi).filter(a => !oncesi[a].durumlu);
ol('kanon listesi veriden türetiliyor, elle tutulmuyor',
  Array.isArray(DB.bayatAktif.kanon) &&
  kanonlar.every(a => DB.bayatAktif.kanon.indexOf(a) !== -1),
  DB.bayatAktif.kanon.length + ' koleksiyon');

for(const ad of ['departments','contacts','customers']){
  if(!oncesi[ad]) continue;
  const x = DB[ad].find(r => r && typeof r === 'object');
  const t = Object.getOwnPropertyDescriptor(x, 'aktif');
  ol(`${ad}: alan KANON, tuzaklanmadı (${oncesi[ad].yanlis.length} pasif kayıt)`,
    !!t && !t.get);
}
ol('customers ayrımı alan ADINA değil DEĞERİNE bakıyor (durum tuzaklı → aktif kanon)',
  DB.customers[0].durum === undefined && DB.bayatAktif.kanon.indexOf('customers') !== -1);

/* =====================================================================
   [A3] OKUMA — kodda kalan `.aktif` okuması yalnız kanon koleksiyonlarda mı
   ===================================================================== */
console.log('\n[A3] Okuma yerleri — kanon dışında `.aktif` okuyan kaldı mı');
const dosyalar = [];
for(const d of fs.readdirSync(ROOT)) if(d.endsWith('.html')) dosyalar.push(d);
for(const d of fs.readdirSync(path.join(ROOT, 'assets/js'))) dosyalar.push('assets/js/' + d);

/* Kanon okuması olduğu YAZILI olan satırlar sayılmaz — beyan, bir sonraki
   okuyucunun okumayı yanlışlıkla "temizlememesi" için oradadır. */
const KANON_IMZA = /K-33/;
const okumalar = [];
for(const d of dosyalar){
  const satirlar = fs.readFileSync(path.join(ROOT, d), 'utf8').split('\n');
  /* Blok yorumu GERÇEKTEN takip edilir. Yalnız satır başına bakan bir
     süzgeç, çok satırlı yorumun ortasındaki `e.aktif` cümlesini KOD sanır —
     ilk yazımda tam bu oldu ve eksen kendi belgesini bulgu diye bildirdi. */
  let yorumda = false;
  satirlar.forEach((s, i) => {
    const kodParcasi = (() => {
      let out = '', j = 0;
      while(j < s.length){
        if(yorumda){
          const k = s.indexOf('*/', j);
          if(k === -1) return out;
          yorumda = false; j = k + 2; continue;
        }
        const a = s.indexOf('/*', j), b = s.indexOf('//', j);
        if(a !== -1 && (b === -1 || a < b)){ out += s.slice(j, a); yorumda = true; j = a + 2; continue; }
        if(b !== -1){ out += s.slice(j, b); return out; }
        out += s.slice(j); return out;
      }
      return out;
    })();
    if(!/\.aktif\b/.test(kodParcasi)) return;
    /* Beyan satırın KENDİSİNDE de olabilir (`/* K-33 *​/` kuyruk yorumu),
       yalnız üstündeki beş satırda değil. */
    const pencere = satirlar.slice(Math.max(0, i - 5), i + 1).join('\n');
    if(KANON_IMZA.test(pencere)) return;                   /* beyan edilmiş */
    okumalar.push(`${d}:${i + 1}`);
  });
}
ol('beyan edilmemiş `.aktif` okuması kalmadı', okumalar.length === 0,
  okumalar.length ? okumalar.join(' · ') : '0');

/* Veri dosyalarında alanın hâlâ YAZILI olması sorun değil — tuzak onu
   yüklemede kapatır. Ölçülen şey KOD tarafıdır. */
ol('tuzak yüklemede kuruluyor (veri dosyası değişmeden)',
  DB.bayatAktif.tuzakli.length > 0);

/* =====================================================================
   [A4] ARŞİV — karar tek yerden mi veriliyor
   ===================================================================== */
console.log('\n[A4] Arşiv kararı tek yerde');
ol('`GV.arsivli` yayında', typeof GV.arsivli === 'function');
const ui = fs.readFileSync(path.join(ROOT, 'assets/js/ui.js'), 'utf8');
ol('`ui.js` arşiv eksenini kendisi TANIMLAMIYOR',
  !/arch\s*=\s*r\.arsiv[^\n]*r\.aktif/.test(ui));
ol('durumu OLAN kayıtta `aktif` okunmaz',
  GV.arsivli({ durum:'Aktif', aktif:false }) === false, 'durum kanon');
ol('durumu OLMAYAN kayıtta `aktif` okunur',
  GV.arsivli({ aktif:false }) === true, 'aktif kanon');
ol('`arsiv:true` her koşulda arşivdir', GV.arsivli({ durum:'Aktif', arsiv:true }) === true);
ol('pasif durum listesi listeye göre verilebiliyor',
  GV.arsivli({ durum:'Hurda' }) === false &&
  GV.arsivli({ durum:'Hurda' }, ['Hurda']) === true);

/* =====================================================================
   [A5] DAVRANIŞ — tuzak öncesi arşivli olan kayıtlar arşivli kaldı mı
   ===================================================================== */
console.log('\n[A5] Davranış korundu mu — 8 `false` kaydın akıbeti');
const PASIF = { assets:['Hurda'], referrers:['Pasif'] };
let korunan = 0, kayip = [];
for(const [ad, o] of Object.entries(oncesi)){
  for(const kod of o.yanlis){
    const r = DB[ad].find(x => x && x.kod === kod);
    if(!r) continue;
    const simdi = GV.arsivli(r, PASIF[ad]);
    if(simdi) korunan++; else kayip.push(`${ad}/${kod}`);
  }
}
const toplamYanlis = Object.values(oncesi).reduce((s, o) => s + o.yanlis.length, 0);
ol(`tuzak öncesi ${toplamYanlis} pasif kaydın hepsi hâlâ pasif`,
  kayip.length === 0, kayip.length ? 'KAYBOLDU: ' + kayip.join(' · ') : `${korunan}/${toplamYanlis}`);

/* =====================================================================
   [A6] ÇALIŞMA — tuzak gerçekten ateşliyor mu
   ===================================================================== */
console.log('\n[A6] Tuzak ateşliyor mu — enjekte edilmiş okuma');
const oncekiSayac = DB.bayatAktif.sayac;
const kurban = DB.tickets[0];
void kurban.aktif;                              /* kasıtlı bayat okuma */
ol('bayat okuma sayacı artırıyor', DB.bayatAktif.sayac === oncekiSayac + 1,
  `${oncekiSayac} → ${DB.bayatAktif.sayac}`);
ol('bayat okuma `undefined` döndürüyor', kurban.aktif === undefined);
ol('okuma nerede olduğunu kaydediyor',
  DB.bayatAktif.okuma.slice(-1)[0].koleksiyon === 'tickets',
  JSON.stringify(DB.bayatAktif.okuma.slice(-1)[0]));
const yazSayac = DB.bayatAktif.sayac;
kurban.aktif = true;                            /* kasıtlı bayat yazma */
ol('bayat yazma da yakalanıyor ve YUTULUYOR',
  DB.bayatAktif.sayac > yazSayac && kurban.aktif === undefined);

/* ---- Özet ----------------------------------------------------------- */
console.log('\n--- ölçülen dağılım ---');
console.log(`  koleksiyon (alanı olan) : ${Object.keys(oncesi).length}`);
console.log(`  durum kanonlu (tuzaklı) : ${durumlular.length}`);
console.log(`  aktif kanonlu (kalan)   : ${kanonlar.length} → ${kanonlar.join(' · ')}`);
console.log(`  alanı false olan kayıt  : ${toplamYanlis}`);

console.log(`\n${bulgu.length === 0 ? '✓ TEMİZ' : '✗ ' + bulgu.length + ' BULGU'} · ${kontrol} kontrol koşuldu · 6 eksen`);
if(bulgu.length) bulgu.forEach(b => console.log('  · ' + b));
process.exit(bulgu.length === 0 ? 0 : 1);
