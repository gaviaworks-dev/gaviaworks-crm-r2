#!/usr/bin/env node
/* =====================================================================
   BAYAT ALAN EKSENİ — K-21 · ADR-R2-18

   NEDEN VAR (Beyar'ın gerekçesi, birebir): R1'de çift KDV hatası tam böyle
   doğdu — alt zincir YANLIŞ ÇAPAYA GÖRE TUTARLIYDI ve hiçbir eksen çelişki
   göremiyordu. Bir olgu iki yerde yaşarsa, ikisi ayrıştığı anda kod hâlâ
   "çalışır" ve yanlış cevabı kendinden emin verir.

   Bu eksen tek bir soruyu sorar: **bayat alanı okuyan bir yer kaldı mı?**

   Üç eksende ölçer:
     B1  Tuzak KURULU mu — `DB.customers[].durum` gerçekten kapatıldı mı,
         okunduğunda sayaca yazıyor mu, yazma da yakalanıyor mu
     B2  Yükleme ve tipik iş akışları sırasında SIFIR okuma — veri katmanı,
         domain yordamları ve zincirler bayat alana hiç dokunmuyor mu
     B3  Kaynak taraması — `.durum` okumasının hesap/müşteri nesnesi
         üzerinde kaldığı bir yer var mı (dar kapsam, yorumlar sökülür)

   ⚠️ Tuzak `enumerable:false` kurulur; `JSON.stringify` ve `Object.keys`
   ona basmaz. Bu bilerekdir: serileştirmeyi ihlal saymak, ölçüm aracının
   borcu FAZLA sayması olurdu (R1 dersi L-26). Eksen bunu ayrıca sınar.

   Bozulmuş kopyada koşum:  GV_ROOT=/tmp/bozuk node tasks/qa/bayat-alan.js
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : path.resolve(__dirname, '..', '..');

let hata = 0, olculen = 0;
const de = (m) => { console.log('  ✗ ' + m); hata++; };
const ok = (m) => console.log('  ✓ ' + m);
const olc = () => { olculen++; };

function kur(){
  const ctx = { console:{ log(){}, warn(){}, error(){} } };
  vm.createContext(ctx);
  vm.runInContext(`
    var window = globalThis; var self = globalThis;
    var localStorage = { getItem(){ return null; }, setItem(){}, removeItem(){} };
    var sessionStorage = localStorage;
  `, ctx);
  for(const f of ['assets/data/org.js','assets/data/crm.js','assets/data/work.js',
                  'assets/data/misc.js','assets/data/ops.js','assets/data/lifecycle.js',
                  'assets/data/firsat.js','assets/data/odeme.js','assets/js/domain.js']){
    const p = path.join(ROOT, f);
    if(fs.existsSync(p)) vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename:f });
  }
  const DB = ctx.DB, GV = ctx.GV;
  GV.session = { emp:'EMP-002', rol:'satismudur', musteri:null };
  const m = DB.permMatrix.satismudur;
  GV.perm = { role:() => 'satismudur',
              can:(a) => { const v = m[a]; return typeof v === 'boolean' ? v : (v && v !== 'yok'); },
              scope:(a) => m[a] || 'yok', mask:(v) => v };
  return { DB, GV };
}

console.log('\n=== BAYAT ALAN EKSENİ ===');
console.log('kök: ' + ROOT);

/* ---- B1 — tuzak kurulu mu ------------------------------------------ */
console.log('\n[B1] Tuzak kurulu mu');
{
  const { DB } = kur();

  olc();
  if(!DB.bayat) de('`DB.bayat` sayacı yok — tuzak hiç kurulmamış');
  else ok('sayaç kurulu (`DB.bayat`)');

  olc();
  const tanim = Object.getOwnPropertyDescriptor(DB.customers[0], 'durum');
  if(!tanim) de('`DB.customers[].durum` tanımsız — tuzak yerine alan tamamen silinmiş, okuma SESSİZ kalır');
  else if(typeof tanim.get !== 'function') de('`durum` hâlâ düz veri alanı — tuzak kurulmamış');
  else ok('`DB.customers[].durum` tuzağa çevrilmiş (getter)');

  olc();
  const once = DB.bayat.sayac;
  const deger = DB.customers[0].durum;
  if(DB.bayat.sayac === once) de('okuma sayaca YAZILMADI — tuzak sessiz');
  else if(deger !== undefined) de('tuzak bayat DEĞER döndürüyor: ' + deger);
  else ok('okuma yakalandı ve `undefined` döndü');

  olc();
  const once2 = DB.bayat.sayac;
  DB.customers[0].durum = 'Aktif';
  if(DB.bayat.sayac === once2) de('YAZMA yakalanmadı — bayat alana yazılabiliyor');
  else if(DB.customers[0].durum !== undefined) de('yazılan değer TUTULDU — alan diriltilmiş');
  else ok('yazma yakalandı, değer tutulmadı');

  olc();
  /* Serileştirme yanlış alarm üretmemeli (L-26). */
  const { DB:DB2 } = kur();
  JSON.stringify(DB2.customers);
  Object.keys(DB2.customers[0]);
  DB2.customers.map(c => Object.assign({}, c));
  if(DB2.bayat.sayac !== 0)
    de(`serileştirme tuzağa bastı — ${DB2.bayat.sayac} yanlış alarm (enumerable:false olmalı)`);
  else ok('JSON.stringify · Object.keys · Object.assign tuzağa basmıyor');
}

/* ---- B2 — sıfır okuma ---------------------------------------------- */
console.log('\n[B2] Yükleme ve iş akışlarında sıfır okuma');
{
  olc();
  const { DB, GV } = kur();
  if(DB.bayat.sayac !== 0){
    de(`YÜKLEMEDE ${DB.bayat.sayac} bayat okuma: ` +
       DB.bayat.okuma.slice(0, 3).map(x => x.alan + '@' + x.kod).join(', '));
  }else ok('veri katmanı + domain yüklenirken sıfır okuma');

  olc();
  /* Türetilmiş görünümler: hesap listesi, evre sayımı, mükerrer taraması */
  DB.accountsByStage();
  GV.sales.hesapMukerrer({ vergiNo:'2910384756', unvan:'Deniz Lojistik A.Ş.' });
  DB.accounts.forEach(h => { const x = h.evre; return x; });
  if(DB.bayat.sayac !== 0) de(`türetilmiş görünümlerde ${DB.bayat.sayac} okuma`);
  else ok('hesap listesi · evre sayımı · mükerrer taraması temiz');

  olc();
  /* Yaşam evresi zinciri — asıl riskli yol: evre değişince bayat alan
     eskimeye başlıyordu. */
  const nit = DB.accounts.find(h => h.evre === 'NITELIKLI' && h.vergiNo);
  const r = GV.lifecycle.gec(nit.kod, 'MUSTERI', { neden:'MUSTERI', not:'eksen' });
  if(!r.ok) de('hazırlık düştü — evre geçişi: ' + (r.mesaj || r.why));
  else if(DB.bayat.sayac !== 0) de(`evre geçişinde ${DB.bayat.sayac} bayat okuma`);
  else ok('evre geçişi bayat alana hiç dokunmuyor');

  olc();
  /* Hesap kaydında bayat AYNA kalmadı mı */
  const aynasi = DB.accounts.filter(h => Object.prototype.hasOwnProperty.call(h, 'durum'));
  if(aynasi.length)
    de(`${aynasi.length} hesap kaydı hâlâ \`durum\` aynası taşıyor: ` + aynasi.slice(0,3).map(h => h.kod).join(', '));
  else ok(`${DB.accounts.length} hesabın hiçbirinde bayat \`durum\` aynası yok`);

  olc();
  /* Fatura/tahsilat zinciri de müşteri kaydına dokunuyor (musteriOzet) */
  const f = DB.invoices.find(x => GV.fin.balance(x).acik > 0);
  if(f){ GV.fin.balance(f); GV.fin.odemeDurum(f); GV.fin.refreshCustomer(f.musteri); }
  if(DB.bayat.sayac !== 0) de(`finans zincirinde ${DB.bayat.sayac} bayat okuma`);
  else ok('finans zinciri (balance · odemeDurum · refreshCustomer) temiz');
}

/* ---- B3 — kaynak taraması ------------------------------------------- */
console.log('\n[B3] Kaynak taraması — hesap/müşteri nesnesinde `.durum`');
{
  olc();
  /* Dar kapsam: yalnız hesap/müşteri değişken adları. Ham `.durum` grep'i
     sözleşme, fatura, görev ve talep kayıtlarını da sayardı — onların
     `durum` alanı MEŞRU ve canlıdır. Yorumlar sökülür (L-26). */
  const yorumSok = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
  const desen = /\b(hesap|musteri|müşteri|account|acc|h|c)\.durum\b/g;
  const dosyalar = [];
  for(const d of fs.readdirSync(ROOT)) if(/^app-.*\.html$/.test(d)) dosyalar.push(d);
  for(const d of ['assets/js/domain.js','assets/js/shell.js','assets/js/ui.js',
                  'assets/data/lifecycle.js','assets/data/firsat.js']) dosyalar.push(d);

  const bulgular = [];
  let muafSayi = 0;
  for(const d of dosyalar){
    const p = path.join(ROOT, d);
    if(!fs.existsSync(p)) continue;
    let src = fs.readFileSync(p, 'utf8');
    if(d.endsWith('.html')){
      src = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');
    }
    /* AÇIK İSTİSNA — sessiz beyaz liste değil, kodun içinde görünen işaret.
       Göçün kendisi ham alanı BİR KEZ okumak zorunda: evre ondan türüyor ve
       o okuma tuzak kurulmadan önce koşuyor. İşaretli satır ölçüm dışıdır;
       işaret kaldırılırsa eksen o satırı yeniden yakalar. */
    const muaf = new Set();
    src.split('\n').forEach((satir, i) => {
      if(/bayat-alan:goc-kaynagi/.test(satir)) muaf.add(i + 1);
    });
    src = yorumSok(src);
    /* `c` çok genel bir addır: sözleşme döngülerinde de kullanılıyor.
       Yalnız AYNI SATIRDA müşteri/hesap bağlamı geçenler sayılır. */
    src.split('\n').forEach((satir, i) => {
      const m = satir.match(desen);
      if(!m) return;
      if(!/accounts|customers|hesap|musteri|müşteri/i.test(satir)) return;
      if(muaf.has(i + 1)) { muafSayi++; return; }
      bulgular.push(`${d}:${i + 1} — ${satir.trim().slice(0, 80)}`);
    });
  }
  if(bulgular.length){
    bulgular.forEach(b => de(b));
  }else ok(`${dosyalar.length} dosyada hesap/müşteri nesnesinde \`.durum\` okuması yok` +
             (muafSayi ? ` (${muafSayi} açık işaretli göç okuması muaf)` : ''));
}

console.log(`\n${hata ? '✗ ' + hata + ' BULGU' : '✓ TEMİZ'} · ${olculen} kontrol koşuldu · 3 eksen\n`);
process.exit(hata ? 1 : 0);
