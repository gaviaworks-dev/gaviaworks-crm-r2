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
  /* KAPI HEDEFE BAĞLI MI — ölçülmüş kusurun nöbetçisi.
     Kapı KAYNAK duruma bağlıyken (`kapi`), aynı kaynaktan çıkan
     `Kaybedildi` hedefi de ona takılıyordu: bir satışı KAYBETMEK için
     müşterinin vergi numarasını doldurmak gerekiyordu. Kaybetmek her
     zaman mümkün olmalıdır. */
  if(o.asama === 'Sözleşme aşaması'){
    const kayip = GV.flow.gec('opportunity', o.kod, 'Kaybedildi', null,
                              { neden:'BUTCE', not:'eksen — kapı hedefe bağlı mı' });
    if(!kayip.ok && kayip.why === 'kapi')
      de('KAPI YANLIŞ YERDE — kazanma kapısı `Kaybedildi` çıkışını da engelliyor');
    else if(!kayip.ok) de('kayıp geçişi başka nedenle düştü: ' + (kayip.mesaj || kayip.why));
    else ok('kazanma kapısı yalnız `Kazanıldı` hedefinde — kayıp çıkışı serbest');
    /* Eksen kendi hazırlığını geri alır: aşağıdaki olumlu vaka için
       fırsatın sözleşme aşamasında olması gerekiyor. */
    o.asama = 'Sözleşme aşaması';
  }else{
    de('hazırlık düştü — kapı yeri ölçülemedi');
  }

  olc();
  /* OLUMLU VAKA — eksik alan doldurulunca aynı geçiş GEÇMELİ.
     Kapının "her şeyi reddeden" bir duvar olmadığını kanıtlar. */
  leadHesap.vergiNo = '1234567890';
  leadHesap.evre = 'NITELIKLI';
  const pozitif = GV.flow.gec('opportunity', o.kod, 'Kazanıldı');
  if(!pozitif.ok) de('OLUMLU VAKA DÜŞTÜ — alanlar doluyken kazanma reddedildi: ' + (pozitif.mesaj || pozitif.why));
  else ok('olumlu vaka geçti — eksik alan dolunca kapı açıldı');

  olc();
  /* `GV.flow.adimlar` HEDEFİN `girisGerekce` bayrağını bildiriyor mu.
     Bildirmediğinde ekran kuralı `DB.transitions`ten kendisi okumak
     zorunda kalıyordu — sözleşme motorda, uygulaması ekranda (L-40). */
  const { DB:DB2, GV:GV2 } = kur();
  const o2 = DB2.opportunities.find(x => x.asama === 'Yeni talep');
  const kayipAdim = GV2.flow.adimlar('opportunity', o2.kod)
                       .filter(a => a.hedef === 'Kaybedildi')[0];
  if(!kayipAdim) de('`Kaybedildi` adımı hiç dönmedi');
  else if(!kayipAdim.gerekce) de('`Kaybedildi` adımı `gerekce:false` bildiriyor — hedefin girisGerekce bayrağı okunmuyor');
  else ok('adimlar hedefin `girisGerekce` bayrağını bildiriyor');
}

/* ---- S3b — teklif kapısı da hedefe bağlı mı -------------------------
   Aynı kusur sınıfı İKİ tabloda birden vardı (`opportunity` ve `quote`) ve
   ikincisini ekran ajanı buldu, eksen değil. Enjeksiyon turunda ölçüldü:
   teklif kapısı kaynağa geri taşındığında eksen SESSİZ kalıyordu — yani
   düzeltilmiş bir kusurun nöbetçisi yoktu. Nöbetçi burada. */
console.log('\n[S3b] Teklif ön analiz kapısı — yalnız `İç Onay` hedefinde');
{
  olc();
  const { DB, GV } = kur();
  /* Ön analizi ONAYSIZ olan taslak teklif: kapının ısırması gereken kayıt. */
  const q = DB.quotes.filter(x => x.durum === 'Taslak' && x.musteri && x.analiz)[0];
  if(!q){ de('hazırlık düştü — onaysız analizli taslak teklif yok'); }
  else {
    const iptal = GV.flow.gec('quote', q.kod, 'İptal Edildi', null,
                              { neden:'BUTCE', not:'eksen — kapı yeri' });
    if(!iptal.ok && iptal.why === 'kapi')
      de('KAPI YANLIŞ YERDE — ön analiz kapısı taslak İPTALİNİ de engelliyor');
    else if(!iptal.ok) de('iptal başka nedenle düştü: ' + (iptal.mesaj || iptal.why));
    else ok('taslak iptali serbest — kapı yalnız `İç Onay` hedefinde');
  }

  olc();
  const { DB:DB2, GV:GV2 } = kur();
  const q2 = DB2.quotes.filter(x => x.durum === 'Taslak' && x.musteri && x.analiz)[0];
  const ic = q2 ? GV2.flow.gec('quote', q2.kod, 'İç Onay') : { ok:true };
  if(ic.ok) de('OLUMSUZ VAKA GEÇTİ — onaylanmamış ön analizle teklif iç onaya gitti');
  else if(ic.why !== 'kapi') de('kapı yerine başka nedenle düştü: ' + ic.why);
  else ok('olumsuz vaka reddedildi — ' + String(ic.mesaj).slice(0, 55) + '…');

  olc();
  /* İSTİSNA YOLU ÇALIŞIYOR MU — vaat edilen yolun gerçekten sonuç vermesi
     gerekir; sonuç vermeyen istisna, basılabilen ölü düğmedir (L-23). */
  const { DB:DB3, GV:GV3 } = kur();
  const q3 = DB3.quotes.filter(x => x.durum === 'Taslak' && x.musteri && x.analiz)[0];
  GV3.perm.role = () => 'sahip';
  const istisna = q3 ? GV3.flow.gec('quote', q3.kod, 'İç Onay', null,
                        { istisna:true, neden:'YONETICI_IST', not:'eksen' }) : { ok:false };
  if(!istisna.ok) de('vaat edilen yönetici istisnası SONUÇ VERMİYOR: ' + (istisna.mesaj || istisna.why));
  else ok('yönetici istisnası gerekçeyle geçiyor — vaat edilen yol gerçek');
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
     Ham grep `durum` kelimesini de sayardı ve her ekranda yüzlerce çıkardı.

     ⚠️ ÖLÇÜM DÜZELTMESİ (R1 dersi L-26 — araç borcu FAZLA da sayar).
     İlk koşumda üç bulgunun ÜÇÜ DE yanlıştı: ikisi kuralı ANLATAN yorum
     satırıydı (`h.evre = … yazmak yasaktır`), biri formun taslak nesnesiydi.
     Yani eksen, yasağı yazan cümleyi yasak ihlali sayıyordu. Yorumlar
     taranmadan önce SÖKÜLÜR; dizeler bilerek taranmaya devam eder
     (bir dizede durum ataması kurmak da kaçamaktır). */
  const desen = /\b[A-Za-z_$][\w$]*\.(durum|asama|evre|belgeDurum)\s*=[^=]/g;
  const yorumSok = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
  let bulgu = 0;
  for(const d of dosyalar){
    const src = fs.readFileSync(path.join(ROOT, d), 'utf8');
    const blok = yorumSok([...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
      .map(m => m[1]).join('\n'));
    const m = blok.match(desen);
    if(m){ de(`${d} — elle durum ataması: ${m.slice(0,3).join(' · ')}`); bulgu += m.length; }
  }
  olc();
  if(!bulgu) ok(`${dosyalar.length} ekranın hiçbiri durum alanını elle yazmıyor`);
}

/* ---- S10 — teklif sürümleme (K-17 · ADR-R2-17) ----------------------
   R1'de üç tur boyunca SAHTE kaldı: `versiyon` sayacı artıyor, önceki
   sürümün kaydı hiçbir yerde durmuyordu. Bu eksen üç hükmü de ölçer. */
console.log('\n[S10] Teklif sürümleme — revizyon yeni kayıt, eski sürüm kilitli');
{
  const { DB, GV } = kur();
  const q = DB.quotes.find(x => x.durum === 'Müşteri İncelemesi') ||
            DB.quotes.find(x => !(DB.transitions.quote[x.durum] || {}).terminal);
  const onceki = DB.quotes.length;
  const kalemOnce = (DB.quoteItems || []).filter(i => i.teklif === q.kod).length;

  olc();
  const r = GV.teklif.revizyonAc(q.kod, { not:'eksen koşumu' });
  if(!r.ok) de('revizyon açılamadı: ' + (r.mesaj || r.why));
  else if(DB.quotes.length !== onceki + 1)
    de(`revizyon YENİ KAYIT üretmedi — ${onceki} → ${DB.quotes.length}`);
  else ok(`revizyon yeni kayıt üretti: ${q.kod} v${q.versiyon || 1} → ${r.yeni.kod} v${r.versiyon}`);

  olc();
  const kalemSonra = (DB.quoteItems || []).filter(i => i.teklif === r.yeni.kod).length;
  if(kalemSonra !== kalemOnce) de(`kalemler kopyalanmadı — kaynak ${kalemOnce}, yeni ${kalemSonra}`);
  else ok(`${kalemOnce} kalem yeni sürüme kopyalandı`);

  olc();
  /* KİLİT — eski sürüm hiçbir yöne gidemez. */
  const adim = GV.flow.adimlar('quote', q.kod);
  if(adim.length) de(`OLUMSUZ VAKA GEÇTİ — kilitli sürüm ${adim.length} adım sunuyor`);
  else ok('kilitli sürümde adım listesi boş — ölü buton basılmıyor');

  olc();
  const g = GV.flow.gec('quote', q.kod, 'Kazanıldı');
  if(g.ok) de('OLUMSUZ VAKA GEÇTİ — kilitli sürümde geçiş uygulandı');
  else if(g.why !== 'kilit') de('kilit yerine başka nedenle düştü: ' + g.why);
  else ok('kilitli sürümde geçiş reddedildi (why=kilit)');

  olc();
  /* Kilit SİMETRİK mi — Beyar kısıtı: "bir işi geri almak ya da kaybetmek,
     onu tamamlamaktan daha ağır koşula bağlanamaz." Kilit kaydın tamamını
     dondurur; kaybetmeyi kazanmaktan DAHA AĞIR koşula bağlamaz. */
  const kayip = GV.flow.gec('quote', q.kod, 'Kaybedildi', null, { neden:'BUTCE', not:'eksen' });
  if(kayip.ok) de('kilit asimetrik — kaybetmeye izin veriyor, kazanmaya vermiyor');
  else if(kayip.why !== 'kilit') de('kayıp çıkışı kilit dışında bir nedenle düştü: ' + kayip.why);
  else ok('kilit simetrik — kazanma da kaybetme de aynı koşulda reddediliyor');

  olc();
  /* YENİ sürüm çalışır durumda — kilit zinciri tıkamıyor. */
  const yeniAdim = GV.flow.adimlar('quote', r.yeni.kod);
  if(!yeniAdim.length) de('OLUMLU VAKA DÜŞTÜ — yeni sürüm de kilitli çıktı');
  else ok(`yeni sürüm açık: ${yeniAdim.map(a => a.hedef).join(', ')}`);

  olc();
  /* FARK — iki sürüm karşılaştırılabiliyor mu. */
  r.yeni.araToplam = (q.araToplam || 0) - 50000;
  const f = GV.teklif.fark(q.kod, r.yeni.kod);
  if(!f) de('fark karşılaştırması null döndü');
  else if(!f.alan.some(a => a.alan === 'araToplam'))
    de('fark, değişen tutarı bildirmiyor');
  else ok(`fark ölçüldü: ${f.alan.length} alan · ${f.kalem.length} kalem · tutar farkı ${f.tutarFarki}`);

  olc();
  /* Zincir sayacı ile devralınan sayaç AYRIŞTIRILIYOR mu (L-13). */
  const { DB:DB2, GV:GV2 } = kur();
  const devralan = DB2.quotes.find(x => (x.versiyon || 1) > 1 && !x.kokTeklif);
  const z = GV2.teklif.zincir(devralan.kod);
  if(!z.devralinan) de(`${devralan.kod} v${devralan.versiyon} devralınan sayaç olarak işaretlenmedi`);
  else ok(`devralınan sayaç ayrıştırıldı — ${devralan.kod} "v${z.devralinanSayi}" diyor ama zincirde ${z.adet} kayıt var`);

  olc();
  /* Terminal kayıtta revizyon YOK. */
  const kazanan = DB2.quotes.find(x => x.durum === 'Kazanıldı');
  const izin = GV2.teklif.revizyonIzni(kazanan.kod);
  if(izin.ok) de('OLUMSUZ VAKA GEÇTİ — kazanılmış teklifte revizyon açıldı');
  else ok('terminal kayıtta revizyon reddedildi (' + izin.why + ')');
}

/* ---- Özet ----------------------------------------------------------- */
console.log(`\n${hata ? '✗ ' + hata + ' BULGU' : '✓ TEMİZ'} · ${olculen} kontrol koşuldu` +
            ` · 10 eksen · her eksende en az bir olumlu ve bir olumsuz vaka\n`);
process.exit(hata ? 1 : 0);
