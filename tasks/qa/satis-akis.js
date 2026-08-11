#!/usr/bin/env node
/* =====================================================================
   R2 SATIŞ ZİNCİRİ EKSENİ — müşteri · fırsat · teklif

   Ne ölçer:
     S1  Fırsat geçiş sözleşmesi kayıtlı ve tutarlı (yetim hedef yok)
     S2  Aşama ATLANAMAZ; sıralı ilerleme geçer          (negatif + pozitif)
     S3  Kazanma kapısı eksik müşteri bilgisinde REDDEDER (negatif + pozitif)
     S4  Yaşam evresi §5.1 tablosunun dışına çıkamaz      (negatif + pozitif)
     S5  Kazanma YENİ MÜŞTERİ KOPYASI ÜRETMEZ — §5.3 adım 3
     S6  Kazanma denetim izine yazılır — §5.3 adım 5
     S7  Mükerrer kontrolü beş eksende çalışır; vergi no KESİN, diğerleri işaret
     S8  Teklif ↔ hesap bağı iki yönde de çözülüyor
     S9  Ekranlar durum/aşama/evre alanını ELLE YAZMIYOR (grep, dar kapsam)

   ⚠️ SIFIR BULGU TEK BAŞINA TEMİZ DEĞİLDİR. Her eksende hem OLUMLU hem
   OLUMSUZ vaka koşulur; eksen kusuru yakalayamıyorsa "TEMİZ" demesi
   değersizdir (R1 dersi L-39). Bozulmuş kopyada koşmak için:
       GV_ROOT=/tmp/bozuk node tasks/qa/satis-akis.js
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : path.resolve(__dirname, '..', '..');

let hata = 0, olculen = 0;
const de = (m) => { console.log('  ✗ ' + m); hata++; };
const ok = (m) => { console.log('  ✓ ' + m); };
const olc = () => { olculen++; };

/* ---- Katmanı Node'da kur ------------------------------------------- */
function kur(){
  const ctx = { console: { log(){}, warn(){}, error(){} } };
  vm.createContext(ctx);
  vm.runInContext(`
    var window = globalThis; var self = globalThis;
    var localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
    var sessionStorage = localStorage;
  `, ctx);
  const sira = ['assets/data/org.js','assets/data/crm.js','assets/data/work.js',
                'assets/data/misc.js','assets/data/ops.js','assets/data/lifecycle.js',
                'assets/data/firsat.js','assets/js/domain.js'];
  for(const f of sira) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename:f });
  /* Kabuk yok — oturum ve yetki taklit edilir. Taklit MATRİSTEN okur,
     uydurulmaz: gerçek rol anahtarları kullanılır. */
  const DB = ctx.DB, GV = ctx.GV;
  GV.session = { emp:'EMP-002', rol:'satismudur', musteri:null };
  const m = DB.permMatrix.satismudur;
  GV.perm = {
    role:() => 'satismudur',
    can:(a) => { const v = m[a]; return typeof v === 'boolean' ? v : (v && v !== 'yok'); },
    scope:(a) => m[a] || 'yok',
    mask:(v) => v
  };
  return { DB, GV };
}

console.log('\n=== SATIŞ ZİNCİRİ EKSENİ ===');
console.log('kök: ' + ROOT);

/* ---- S1 — geçiş sözleşmesi ----------------------------------------- */
console.log('\n[S1] Fırsat geçiş sözleşmesi');
{
  const { DB, GV } = kur();
  olc();
  if(!DB.flowEntities || !DB.flowEntities.opportunity) de('DB.flowEntities.opportunity kayıtlı değil');
  else if(DB.flowEntities.opportunity.alan !== 'asama') de('fırsat durum alanı `asama` olmalı');
  else ok('varlık kayıtlı — koleksiyon `opportunities`, alan `asama`');

  olc();
  const d = GV.flow.denetle('opportunity');
  if(!d) de('GV.flow.denetle(\'opportunity\') null döndü');
  else if(d.bilinmeyenDurum.length) de('sözlükte olmayan aşama taşıyan kayıt: ' + d.bilinmeyenDurum.join(', '));
  else if(d.tablodaOlmayanHedef.length) de('tabloda karşılığı olmayan hedef: ' + d.tablodaOlmayanHedef.join(', '));
  else ok(`${d.kayit} fırsat · yetim hedef yok · bilinmeyen aşama yok`);

  olc();
  const tabloAdet = Object.keys(DB.transitions.opportunity).length;
  if(tabloAdet !== DB.pipelineStages.length)
    de(`tablo ${tabloAdet} aşama taşıyor, sözlükte ${DB.pipelineStages.length} var — aşama silinmiş olabilir`);
  else ok(`15 aşamanın 15'i tabloda — hiçbiri silinmedi`);
}

/* ---- S2 — aşama atlama ---------------------------------------------- */
console.log('\n[S2] Aşama atlanamaz');
{
  const { DB, GV } = kur();
  const o = DB.opportunities.find(x => x.asama === 'Yeni talep');

  olc();
  const negatif = GV.flow.gec('opportunity', o.kod, 'Sözleşme aşaması');
  if(negatif.ok) de('OLUMSUZ VAKA GEÇTİ — "Yeni talep"ten "Sözleşme aşaması"na atlanabildi');
  else ok('olumsuz vaka reddedildi — ' + negatif.why);

  olc();
  const pozitif = GV.flow.gec('opportunity', o.kod, 'İlk iletişim');
  if(!pozitif.ok) de('OLUMLU VAKA DÜŞTÜ — sıralı ilerleme reddedildi: ' + (pozitif.mesaj || pozitif.why));
  else ok('olumlu vaka geçti — ' + pozitif.eski + ' → ' + pozitif.yeni);

  olc();
  const geriye = GV.flow.gec('opportunity', o.kod, 'Yeni talep');
  if(geriye.ok) de('OLUMSUZ VAKA GEÇTİ — aşama geriye alınabildi');
  else ok('geriye dönüş reddedildi (tabloda kenar yok)');
}

/* ---- S3 — kazanma kapısı -------------------------------------------- */
console.log('\n[S3] Kazanma kapısı — eksik müşteri bilgisi REDDEDİLİR');
{
  const { DB, GV } = kur();

  /* Aday kaydından türemiş hesap: vergi no YOK (ölçüldü: 20 hesabın 8'i).
     Fırsatını sözleşme aşamasına kadar taşı, sonra kazanmayı dene. */
  const leadHesap = DB.accounts.find(h => h.legacy_kaynak === 'DB.leads' && !h.vergiNo);
  const o = DB.opportunities.find(x => x.hesap === leadHesap.kod);
  /* Aşamaları sırayla yürüt — atlamak zaten yasak, eksen de kurala uyar. */
  const yol = DB.pipelineStages.slice().sort((a,b) => a.sira - b.sira).map(s => s.key);
  o.butce = o.butce || 100000;
  o.kapanisTahmini = o.kapanisTahmini || DB.today;
  let i = yol.indexOf(o.asama);
  while(i < 11){ const r = GV.flow.gec('opportunity', o.kod, yol[i+1]); if(!r.ok) break; i++; }

  olc();
  if(o.asama !== 'Sözleşme aşaması'){
    de('hazırlık düştü — fırsat sözleşme aşamasına taşınamadı (' + o.asama + ')');
  }else{
    const negatif = GV.flow.gec('opportunity', o.kod, 'Kazanıldı');
    if(negatif.ok) de('OLUMSUZ VAKA GEÇTİ — vergi numarası olmayan hesapta kazanma uygulandı');
    else if(negatif.why !== 'kapi') de('kapı yerine başka nedenle düştü: ' + negatif.why);
    else ok('olumsuz vaka reddedildi — kapı: ' + String(negatif.mesaj).slice(0, 70) + '…');
  }

  olc();
  /* OLUMLU VAKA — eksik alan doldurulunca aynı geçiş GEÇMELİ.
     Kapının "her şeyi reddeden" bir duvar olmadığını kanıtlar. */
  leadHesap.vergiNo = '1234567890';
  leadHesap.evre = 'NITELIKLI';
  const pozitif = GV.flow.gec('opportunity', o.kod, 'Kazanıldı');
  if(!pozitif.ok) de('OLUMLU VAKA DÜŞTÜ — alanlar doluyken kazanma reddedildi: ' + (pozitif.mesaj || pozitif.why));
  else ok('olumlu vaka geçti — eksik alan dolunca kapı açıldı');
}

/* ---- S4 — yaşam evresi tablosu -------------------------------------- */
console.log('\n[S4] Yaşam evresi §5.1 tablosunun dışına çıkamaz');
{
  const { DB, GV } = kur();

  olc();
  const aday = DB.accounts.find(h => h.evre === 'ADAY');
  const negatif = GV.lifecycle.gec(aday.kod, 'MUSTERI');
  if(negatif.ok) de('OLUMSUZ VAKA GEÇTİ — Aday doğrudan Müşteri yapılabildi');
  else if(negatif.why !== 'gecis') de('beklenen `gecis` yerine: ' + negatif.why);
  else ok('olumsuz vaka reddedildi — Aday → Müşteri kenarı yok');

  olc();
  const pozitif = GV.lifecycle.gec(aday.kod, 'NITELIKLI');
  if(!pozitif.ok) de('OLUMLU VAKA DÜŞTÜ — Aday → Nitelikli reddedildi: ' + (pozitif.mesaj || pozitif.why));
  else ok('olumlu vaka geçti — Aday → Nitelikli');

  olc();
  /* Yetki ekseni: satış TEMSİLCİSİ hesabı Müşteri yapamaz (§10 tablosu). */
  const nit = DB.accounts.find(h => h.evre === 'NITELIKLI' && h.vergiNo);
  GV.perm.role = () => 'satistemsilci';
  const yetkisiz = GV.lifecycle.gec(nit.kod, 'MUSTERI');
  GV.perm.role = () => 'satismudur';
  if(yetkisiz.ok) de('OLUMSUZ VAKA GEÇTİ — satış temsilcisi hesabı Müşteri yaptı');
  else if(yetkisiz.why !== 'yetki') de('beklenen `yetki` yerine: ' + yetkisiz.why);
  else ok('olumsuz vaka reddedildi — yetki kapısı');

  olc();
  const yetkili = GV.lifecycle.gec(nit.kod, 'MUSTERI');
  if(!yetkili.ok) de('OLUMLU VAKA DÜŞTÜ — satış müdürü geçişi reddedildi: ' + (yetkili.mesaj || yetkili.why));
  else ok('olumlu vaka geçti — satış müdürü Nitelikli → Müşteri');
}

/* ---- S5 — kopya üretilmez ------------------------------------------- */
console.log('\n[S5] Kazanma yeni müşteri kopyası ÜRETMEZ (§5.3 adım 3)');
{
  const { DB, GV } = kur();
  const oncekiHesap = DB.accounts.length;
  const oncekiMusteri = DB.customers.length;

  const nit = DB.accounts.find(h => h.evre === 'NITELIKLI' && h.vergiNo);
  const o = DB.opportunities.find(x => x.hesap === nit.kod) || DB.opportunities[0];
  o.hesap = nit.kod; o.butce = o.butce || 100000; o.kapanisTahmini = o.kapanisTahmini || DB.today;
  const yol = DB.pipelineStages.slice().sort((a,b) => a.sira - b.sira).map(s => s.key);
  let i = yol.indexOf(o.asama);
  while(i < 11){ const r = GV.flow.gec('opportunity', o.kod, yol[i+1]); if(!r.ok) break; i++; }

  const sonuc = GV.sales.firsatKazan(o.kod, { neden:'MUSTERI', not:'eksen koşumu' });

  olc();
  if(!sonuc.ok) de('kazanma zinciri düştü: ' + (sonuc.mesaj || sonuc.why));
  else ok('zincir koştu — hesap ' + sonuc.hesap.kod + (sonuc.evreDegisti ? ' · evre ilerletildi' : ''));

  olc();
  if(DB.accounts.length !== oncekiHesap)
    de(`YENİ HESAP DOĞDU — ${oncekiHesap} → ${DB.accounts.length} (§5.3 adım 3 ihlali)`);
  else ok(`hesap sayısı değişmedi: ${oncekiHesap}`);

  olc();
  if(DB.customers.length !== oncekiMusteri)
    de(`YENİ MÜŞTERİ KAYDI DOĞDU — ${oncekiMusteri} → ${DB.customers.length}`);
  else ok(`müşteri defteri değişmedi: ${oncekiMusteri}`);

  olc();
  if(sonuc.ok && sonuc.hesap.evre !== 'MUSTERI') de('hesabın evresi MUSTERI olmadı: ' + sonuc.hesap.evre);
  else if(sonuc.ok) ok('aynı kaydın evresi MUSTERI oldu — kimlik korundu (' + sonuc.hesap.kod + ')');

  olc();
  if(sonuc.ok && (!sonuc.oneriler || sonuc.oneriler.length < 3))
    de('§5.3 adım 4 — teklif/sözleşme/proje seçenekleri dönmedi');
  else if(sonuc.ok) ok(`${sonuc.oneriler.length} dönüşüm seçeneği döndü`);
}

/* ---- S6 — denetim izi ----------------------------------------------- */
console.log('\n[S6] Dönüşüm denetim izine yazılır (§5.3 adım 5)');
{
  const { DB, GV } = kur();
  const nit = DB.accounts.find(h => h.evre === 'NITELIKLI' && h.vergiNo);
  const oncekiIz = GV.audit.oku(nit.kod).length;
  const r = GV.lifecycle.gec(nit.kod, 'MUSTERI', { neden:'MUSTERI', not:'eksen' });

  olc();
  const sonrakiIz = GV.audit.oku(nit.kod).length;
  if(!r.ok) de('evre geçişi düştü: ' + (r.mesaj || r.why));
  else if(sonrakiIz <= oncekiIz) de('evre değişti ama denetim izine satır yazılmadı');
  else ok(`denetim izi ${oncekiIz} → ${sonrakiIz} satır`);

  olc();
  const kayit = GV.audit.oku(nit.kod, 1)[0];
  if(!kayit) de('denetim satırı okunamadı');
  else if(!kayit.eski || !kayit.yeni) de('denetim satırında eski/yeni ekseni yok');
  else ok(`izde eksen var: ${kayit.eski} → ${kayit.yeni}`);
}

/* ---- S7 — mükerrer kontrolü ----------------------------------------- */
console.log('\n[S7] Mükerrer kontrolü — öneri üretir, birleştirmez');
{
  const { DB, GV } = kur();
  const h = DB.accounts.find(x => x.vergiNo && x.tel && x.eposta);

  olc();
  const vergi = GV.sales.hesapMukerrer({ vergiNo:h.vergiNo });
  if(!vergi.length) de('aynı vergi numarası eşleşmedi');
  else if(!vergi[0].kesin) de('vergi numarası eşleşmesi KESİN işaretlenmedi');
  else ok('vergi no → kesin eşleşme (' + vergi[0].hesap.kod + ')');

  olc();
  const unvan = GV.sales.hesapMukerrer({ unvan:h.unvan });
  if(!unvan.length) de('aynı unvan eşleşmedi');
  else if(unvan[0].kesin) de('unvan benzerliği KESİN sayıldı — işaret olmalı');
  else ok('unvan → işaret (kesin değil)');

  olc();
  const telefon = GV.sales.hesapMukerrer({ tel:h.tel.replace(/\D/g,'').slice(-10) });
  if(!telefon.length) de('normalize telefon eşleşmedi (biçim farkı yutulmalı)');
  else ok('normalize telefon eşleşti');

  olc();
  const yok = GV.sales.hesapMukerrer({ vergiNo:'0000000000', unvan:'Hiç Olmayan Firma Zzz', tel:'5550000000' });
  if(yok.length) de('OLUMSUZ VAKA GEÇTİ — olmayan firma eşleşti: ' + yok.map(x=>x.hesap.kod).join(','));
  else ok('olumsuz vaka temiz — eşleşmeyen aday eşleşmedi');

  olc();
  const oncekiHesap = DB.accounts.length;
  GV.sales.hesapMukerrer({ vergiNo:h.vergiNo });
  if(DB.accounts.length !== oncekiHesap) de('mükerrer kontrolü defteri DEĞİŞTİRDİ — okuma yordamı yazmamalı');
  else ok('kontrol yalnız okur — otomatik birleştirme yok');
}

/* ---- S8 — teklif ↔ hesap bağı --------------------------------------- */
console.log('\n[S8] Teklif ↔ hesap bağı');
{
  const { DB } = kur();
  olc();
  const bagsiz = DB.quotes.filter(q => !DB.quoteAccount(q));
  if(bagsiz.length) de(`${bagsiz.length} teklifin hesabı çözülemedi: ` + bagsiz.map(q => q.kod).join(', '));
  else ok(`${DB.quotes.length} teklifin ${DB.quotes.length}'i bir hesaba bağlandı`);

  olc();
  const toplam = DB.accounts.reduce((a, h) => a + DB.accountQuotes(h.kod).length, 0);
  if(toplam !== DB.quotes.length)
    de(`ters yön tutmuyor: hesaplardan ${toplam}, defterde ${DB.quotes.length} teklif`);
  else ok(`ters yön tutuyor — ${toplam} teklif`);

  olc();
  const firsatli = DB.quotes.filter(q => DB.quoteOpportunity(q)).length;
  ok(`${firsatli} teklif bir fırsata bağlı, ${DB.quotes.length - firsatli} teklif doğrudan hesaba bağlı`);
}

/* ---- S9 — ekranlar durumu elle yazmıyor ----------------------------- */
console.log('\n[S9] Ekran kodu durum/aşama/evre alanını ELLE yazmıyor');
{
  const dosyalar = fs.readdirSync(ROOT).filter(f => /^app-.*\.html$/.test(f));
  /* Dar kapsam: yalnız ATAMA deseni aranır (`x.durum =`), okuma değil.
     Ham grep `durum` kelimesini de sayardı ve her ekranda yüzlerce çıkardı. */
  const desen = /\b[A-Za-z_$][\w$]*\.(durum|asama|evre|belgeDurum)\s*=[^=]/g;
  let bulgu = 0;
  for(const d of dosyalar){
    const src = fs.readFileSync(path.join(ROOT, d), 'utf8');
    const blok = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
      .map(m => m[1]).join('\n');
    const m = blok.match(desen);
    if(m){ de(`${d} — elle durum ataması: ${m.slice(0,3).join(' · ')}`); bulgu += m.length; }
  }
  olc();
  if(!bulgu) ok(`${dosyalar.length} ekranın hiçbiri durum alanını elle yazmıyor`);
}

/* ---- Özet ----------------------------------------------------------- */
console.log(`\n${hata ? '✗ ' + hata + ' BULGU' : '✓ TEMİZ'} · ${olculen} kontrol koşuldu` +
            ` · 9 eksen · her eksende en az bir olumlu ve bir olumsuz vaka\n`);
process.exit(hata ? 1 : 0);
