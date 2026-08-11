#!/usr/bin/env node
/* K-31 + K-32 ölçümü: kapı hâlâ doğru işi engelliyor mu, geri dönüş açıldı mı.
   Her kapı için İKİ vaka: engellemesi GEREKEN kenar + engellememesi gereken kenar. */
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : process.cwd();

global.window = {};
global.DB = {};
for (const f of ['org','crm','work','misc','ops','hr','lifecycle','firsat','odeme','notes']) {
  eval(fs.readFileSync(path.join(ROOT, 'assets/data/' + f + '.js'), 'utf8'));
}
window.DB = global.DB;
let ROL = 'sahip';
global.GV = window.GV = {
  session: { emp: 'EMP-001', dep: 'DEP-01' },
  perm: { role: () => ROL, can: () => true, scope: () => 'tum' }
};
eval(fs.readFileSync(path.join(ROOT, 'assets/js/domain.js'), 'utf8'));

let gecti = 0, kaldi = 0;
function ol(ad, kosul, detay) {
  if (kosul) { gecti++; console.log('  ✓ ' + ad + (detay ? ' · ' + detay : '')); }
  else { kaldi++; console.log('  ✗ ' + ad + (detay ? ' · ' + detay : '')); }
}

/* --- kapıların hangi kenara bağlandığını çöz ------------------------- */
console.log('\n[1] KAPI BAĞLAMA — hangi kenar, hangi taraf');
const beklenen = [
  ['project', 'Test/Kabul', 'Teslim', 'projeTeslim', 'kenar'],
  ['project', 'Test/Kabul', 'Aktif', null, null],
  ['project', 'Başlatma Onayı', 'Aktif', 'projeAktif', 'kenar'],
  ['contract', 'İmza', 'Aktif', 'sozlesmeAktif', 'kenar'],
  ['contract', 'Askıda', 'Aktif', null, null],
  ['project', 'Kapanış', 'Tamamlandı', 'projeKapanis', 'hedef'],
  ['project', 'Kapanış', 'Teslim', null, null],
  ['ticket', 'Müşteri Onayı', 'Kapandı', 'destekKota', 'kenar'],
  ['ticket', 'Müşteri Onayı', 'Devam ediyor', null, null],
  ['ticket', 'Yeni', 'Kapandı', null, null],
  ['delivery', 'İç Kontrol', 'Müşteriye Gönderildi', 'teslimKritikHata', 'hedef'],
  ['delivery', 'İç Kontrol', 'Taslak', null, null],
  ['employee', 'Offboarding', 'Ayrıldı', 'personelZimmet', 'hedef'],
  ['employee', 'Offboarding', 'Aktif', null, null]
];
for (const [tur, kaynak, hedef, kapi, nere] of beklenen) {
  const kural = DB.transitions[tur][kaynak];
  const hk = DB.transitions[tur][hedef] || {};
  const c = GV.flow.kapiCoz(kural, hk, hedef);
  ol(`${tur}: ${kaynak} → ${hedef}  kapı=${c.ad || '(yok)'} taraf=${c.nere || '—'}`,
    c.ad === kapi && (c.nere || null) === nere,
    c.ad === kapi ? '' : `beklenen ${kapi}`);
}

/* --- kaynak taraflı kapı KALDI MI (birden çok hedefi olan durumlarda) --- */
console.log('\n[2] KAYNAK TARAFLI KAPI — birden çok hedefi olan durumda kaç tane kaldı');
const suclu = [];
for (const tur of Object.keys(DB.transitions)) {
  for (const [durum, kural] of Object.entries(DB.transitions[tur])) {
    if (kural && kural.kapi && kural.next && kural.next.length > 1)
      suclu.push(`${tur}.${durum} → ${kural.next.join('/')} (kapi:${kural.kapi})`);
  }
}
ol('birden çok hedefli durumda kaynak taraflı kapı kalmadı', suclu.length === 0,
  suclu.length ? suclu.join(' | ') : '0');

/* --- girisKapi ama hedefe BİRDEN ÇOK kenar giriyor mu ----------------- */
console.log('\n[3] girisKapi — hedefe kaç kenar giriyor (1 olmalı, yoksa fazla kenar keser)');
for (const tur of Object.keys(DB.transitions)) {
  for (const [durum, kural] of Object.entries(DB.transitions[tur])) {
    if (!kural || !kural.girisKapi) continue;
    let kenar = 0;
    for (const [k, r] of Object.entries(DB.transitions[tur]))
      if (r && r.next && r.next.indexOf(durum) !== -1) kenar++;
    ol(`${tur}.${durum} girisKapi:${kural.girisKapi} · giren kenar=${kenar}`, kenar === 1,
      kenar === 1 ? '' : 'FAZLA KENAR KESİLİYOR');
  }
}

/* --- K-31: iki yönlü sınama ------------------------------------------ */
console.log('\n[4] K-31 — Offboarding çift yön');
const emp = DB.employees.find(e => e.durum === 'Offboarding') || DB.employees[0];
const eskiDurum = emp.durum;
emp.durum = 'Offboarding';
ROL = 'ik';

let r = GV.flow.gec('employee', emp.kod, 'Aktif', null, {});
ol('gerekçesiz geri dönüş REDDEDİLİR (olumsuz vaka)', r.ok === false && r.why === 'gerekce', r.why);

r = GV.flow.gec('employee', emp.kod, 'Aktif', null, { neden: 'HATALI_KAYIT', not: 'yanlışlıkla çıkış sürecine alındı' });
ol('gerekçeli geri dönüş KABUL EDİLİR (olumlu vaka)', r.ok === true && emp.durum === 'Aktif',
  r.ok ? 'durum=' + emp.durum : r.why + ' ' + (r.mesaj || JSON.stringify(r.eksik || '')));

emp.durum = 'Offboarding';
r = GV.flow.gec('employee', emp.kod, 'Aktif', null, { neden: 'X', not: 'y' });
ol('geri dönüş çıkış tarihi/nedeni İSTEMEZ (girisZorunlu hedefte)', r.ok === true,
  r.ok ? '' : r.why + ' ' + JSON.stringify(r.eksik || ''));

ROL = 'pm';
emp.durum = 'Offboarding';
r = GV.flow.gec('employee', emp.kod, 'Aktif', null, { neden: 'X', not: 'y' });
ol('yetkisiz rol (pm) geri dönemez', r.ok === false && r.why === 'yetki', r.why);
ROL = 'ik';

/* İleri yön: alanlar BOŞKEN reddedilmeli. Kayıtta doluysa geçici olarak
   boşaltılır — ölçüm, ölçtüğü koşulu kendisi kurar. */
emp.durum = 'Offboarding';
const yedek = { t: emp.cikisTarihi, n: emp.cikisNedenKodu };
emp.cikisTarihi = null; emp.cikisNedenKodu = null;
r = GV.flow.gec('employee', emp.kod, 'Ayrıldı', null, { neden: 'ISTIFA', not: 'istifa' });
ol('ileri gitmek çıkış tarihi + neden kodu ister (girisZorunlu)', r.ok === false && r.why === 'zorunlu',
  r.why + ' ' + JSON.stringify(r.eksik || ''));

emp.durum = 'Offboarding';
r = GV.flow.gec('employee', emp.kod, 'Aktif', null, { neden: 'HATA', not: 'geri al' });
ol('AYNI boş kayıtta geri dönüş YİNE açık — geri almak ileri gitmekten ağır değil',
  r.ok === true, r.ok ? '' : r.why + ' ' + JSON.stringify(r.eksik || ''));

emp.durum = 'Offboarding';
r = GV.flow.gec('employee', emp.kod, 'Ayrıldı',
  { cikisTarihi: '2026-08-12', cikisNedenKodu: 'ISTIFA' }, { neden: 'ISTIFA', not: 'istifa' });
ol('alanlar dolunca ayrılış tamamlanır', r.ok === true, r.ok ? 'durum=' + emp.durum : r.why + ' ' + (r.mesaj || ''));
emp.cikisTarihi = yedek.t; emp.cikisNedenKodu = yedek.n;
emp.durum = eskiDurum;

/* --- K-32: her kapı hâlâ doğru işi engelliyor mu ---------------------- */
console.log('\n[5] K-32 — kapı hâlâ doğru işi engelliyor mu (ileri) · geri açıldı mı');
ROL = 'pm';
function dene(tur, kod, hedef, ek, opts) {
  const rec = GV.flow.kayit(tur, kod);
  if (!rec) return { ok: false, why: 'kayıt yok' };
  const alan = GV.flow.alan(tur), eski = rec[alan];
  const r = GV.flow.gec(tur, kod, hedef, ek, opts || {});
  rec[alan] = eski;
  return r;
}
// projeTeslim: kritik hatası olan bir proje bul
const gates = [];
for (const p of DB.projects) {
  const eski = p.durum; p.durum = 'Test/Kabul';
  const ileri = dene('project', p.kod, 'Teslim', null, {});
  const geri = dene('project', p.kod, 'Aktif', null, {});
  p.durum = eski;
  if (ileri.why === 'kapi') gates.push({ kod: p.kod, ileri, geri });
}
ol('projeTeslim kapısı en az bir projede hâlâ İLERİYİ engelliyor', gates.length > 0,
  gates.length ? gates[0].kod + ': ' + (gates[0].ileri.mesaj || '') : 'hiç engellemiyor — kapı ölü');
if (gates.length) ol('aynı projede GERİ dönüş (Test/Kabul→Aktif) açık', gates[0].geri.ok === true,
  gates[0].geri.ok ? '' : gates[0].geri.why);

// projeKapanis
const g2 = [];
for (const p of DB.projects) {
  const eski = p.durum; p.durum = 'Kapanış';
  const ileri = dene('project', p.kod, 'Tamamlandı', null, {});
  const geri = dene('project', p.kod, 'Teslim', null, {});
  p.durum = eski;
  if (ileri.why === 'kapi') g2.push({ kod: p.kod, ileri, geri });
}
ol('projeKapanis kapısı hâlâ İLERİYİ engelliyor', g2.length > 0,
  g2.length ? g2[0].kod : 'hiç engellemiyor — kapı ölü');
if (g2.length) ol('aynı projede GERİ dönüş (Kapanış→Teslim) açık', g2[0].geri.ok === true,
  g2[0].geri.ok ? '' : g2[0].geri.why);

// destekKota
ROL = 'destek';
const g3 = [];
for (const t of DB.tickets) {
  const eski = t.durum; t.durum = 'Müşteri Onayı';
  const ileri = dene('ticket', t.kod, 'Kapandı', null, {});
  const geri = dene('ticket', t.kod, 'Devam ediyor', null, {});
  t.durum = eski;
  if (ileri.why === 'kapi') g3.push({ kod: t.kod, ileri, geri });
}
/* Veride kotayı aşan talep YOK — kapı bugünkü veriyle hiç ateşlenmiyor.
   "Ateşlenmiyor" ile "çalışmıyor" farkını ölçmek için koşul ENJEKTE edilir:
   talebin paketinin kotası geçici olarak 0'a çekilir. Veri dosyası
   değişmez, enjeksiyon bellekte kalır ve geri alınır. */
if (!g3.length) {
  const t = DB.tickets.find(x => !x.ucretli && GV.destek.paketOf(x));
  if (t) {
    const p = GV.destek.paketOf(t);
    const yed = { kalan: p.kalan, sure: t.harcananSure, durum: t.durum };
    p.kalan = 0; t.harcananSure = 4;          // kotayı aşan bir talep KUR
    t.durum = 'Müşteri Onayı';
    const ileri = dene('ticket', t.kod, 'Kapandı', null, {});
    const geri = dene('ticket', t.kod, 'Devam ediyor', null, {});
    t.durum = yed.durum; p.kalan = yed.kalan; t.harcananSure = yed.sure;
    ol('destekKota kapısı ENJEKTE edilmiş kota aşımında İLERİYİ engelliyor',
      ileri.why === 'kapi', ileri.why + ' ' + (ileri.mesaj || ''));
    ol('aynı talepte GERİ dönüş (Müşteri Onayı→Devam ediyor) açık kaldı',
      geri.ok === true, geri.ok ? '' : geri.why);
  } else {
    ol('destekKota ölçülemedi — hiçbir talep bir pakete bağlanamadı', false, 'kaynak yok');
  }
} else {
  ol('destekKota kapısı hâlâ İLERİYİ engelliyor', true, g3[0].kod + ': ' + (g3[0].ileri.mesaj || ''));
  ol('aynı talepte GERİ dönüş (Müşteri Onayı→Devam ediyor) açık', g3[0].geri.ok === true,
    g3[0].geri.ok ? '' : g3[0].geri.why);
}

// teslimKritikHata
ROL = 'pm';
const g4 = [];
for (const d of DB.deliveries) {
  const eski = d.durum; d.durum = 'İç Kontrol';
  const ileri = dene('delivery', d.kod, 'Müşteriye Gönderildi', null, {});
  const geri = dene('delivery', d.kod, 'Taslak', null, {});
  d.durum = eski;
  if (ileri.why === 'kapi') g4.push({ kod: d.kod, ileri, geri });
}
ol('teslimKritikHata kapısı hâlâ İLERİYİ engelliyor', g4.length > 0,
  g4.length ? g4[0].kod + ': ' + (g4[0].ileri.mesaj || '') : 'hiç engellemiyor — kapı ölü');
if (g4.length) ol('aynı teslimde GERİ dönüş (İç Kontrol→Taslak) açık', g4[0].geri.ok === true,
  g4[0].geri.ok ? '' : g4[0].geri.why);

/* --- K-30 ------------------------------------------------------------- */
console.log('\n[6] K-30 — düşen zimmet iddiası');
ol('düşen iddia defteri kurulu', Array.isArray(DB.assetClaimDrops) && DB.assetClaimDrops.length === 3,
  DB.assetClaimDrops ? DB.assetClaimDrops.length + ' kayıt' : 'yok');
for (const d of (DB.assetClaimDrops || [])) {
  const a = DB.assets.find(x => x.kod === d.demirbas);
  ol(`${d.demirbas} envanterde artık zimmetli değil`, a && a.zimmetli === null && a.durum === 'Depoda',
    a ? a.durum + '/' + a.zimmetli : 'kayıt yok');
  ol(`${d.demirbas} iddiasının kaynağı yazılı`, Array.isArray(d.kaynak) && d.kaynak.length > 0 && !!d.neden,
    d.kaynak.length + ' kaynak');
  const z = (DB.assignments || []).filter(x => x.demirbas === d.demirbas);
  ol(`${d.demirbas} için uydurma tutanak ÜRETİLMEDİ`, z.length === 0, z.length + ' tutanak');
}
ol('türetilmiş çizelge satırı defterden okunuyor',
  !!GV.varlik.dusenIddiaSatiri('DMB-2025-007') && GV.varlik.dusenIddiaSatiri('DMB-2025-008') === null);
ol('yükleme tazelemesi artık çelişki DÜZELTMİYOR (literal defterle uyumlu)',
  GV.varlik.sonTazeleme.degisen.length === 0,
  GV.varlik.sonTazeleme.degisen.length + ' değişen');

console.log(`\n${kaldi === 0 ? '✓ TEMİZ' : '✗ ' + kaldi + ' BULGU'} · ${gecti + kaldi} kontrol koşuldu`);
process.exit(kaldi === 0 ? 0 : 1);
