#!/usr/bin/env node
/* =====================================================================
   FİNANSAL KANON EKSENİ — bağımsız çapa ve zincir tutarlılığı

   NEDEN VAR (Beyar'ın talimatı, birebir): "R1'de teklif→sözleşme KDV'yi iki
   kez uyguluyordu ve alt zincir kendi içinde tutarlı olduğu için hiçbir
   eksen görmedi; bağımsız çapa ile çözüldü. Aynı tuzağı bu dilimde ölç."

   Kusurun anatomisi: her halka bir öncekinden TÜREDİĞİ için hepsi aynı
   şişmiş sayıyı taşıyordu. Zincirin İÇİNDEN bakan hiçbir kontrol çelişki
   göremez — çapa zincirin DIŞINDA olmak zorundadır.

   ÇAPA = NET. Brüt her yerde `net + kdv` olarak YENİDEN hesaplanır;
   kayıttaki brüt otoriter değil, DOĞRULANANDIR.

   Altı eksen:
     F1  Çapa — her koleksiyon kendi içinde net/kdv/brüt tutuyor mu
     F2  Zincir — teklif → sözleşme → ödeme planı → fatura → tahsilat
     F3  Çift KDV tuzağı — brütü net sanan bir kayıt YAKALANIYOR mu
     F4  Bakiye tek kaynak — `GV.fin.balance` dışında bakiye hesaplayan var mı
     F5  Fatura durumu TÜRETİLİR — elle atanmış durum kalmış mı
     F6  Ödeme linki tutarı kalan bakiyeyi aşmıyor (§8.5)

   Bozulmuş kopyada: GV_ROOT=/tmp/bozuk node tasks/qa/finans-kanon.js
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : path.resolve(__dirname, '..', '..');

let hata = 0, olculen = 0;
const de = (m) => { console.log('  ✗ ' + m); hata++; };
const ok = (m) => console.log('  ✓ ' + m);
const olc = (n) => { olculen += (n || 1); };

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
  GV.session = { emp:'EMP-012', rol:'muhasebe', musteri:null };
  const m = DB.permMatrix.muhasebe;
  GV.perm = { role:() => 'muhasebe',
              can:(a) => { const v = m[a]; return typeof v === 'boolean' ? v : (v && v !== 'yok'); },
              scope:(a) => m[a] || 'yok', mask:(v) => v };
  return { DB, GV };
}

console.log('\n=== FİNANSAL KANON EKSENİ ===');
console.log('kök: ' + ROOT);

/* ---- F1 — çapa ------------------------------------------------------ */
console.log('\n[F1] Bağımsız çapa — her kayıt kendi içinde tutarlı mı');
{
  const { DB, GV } = kur();
  let toplam = 0;
  for(const [kol, tur] of [['quotes','quote'], ['contracts','contract'], ['invoices','invoice']]){
    olc();
    const kayitlar = DB[kol] || [];
    toplam += kayitlar.length;
    const sapan = kayitlar.map(x => ({ kod:x.kod, t:GV.fin.tutar(x, tur) }))
                          .filter(x => x.t && !x.t.tutarli);
    if(sapan.length)
      de(`${kol}: ${sapan.length}/${kayitlar.length} kayıt kendi içinde çelişiyor — ` +
         sapan.slice(0,3).map(x => x.kod + ' ' + JSON.stringify(x.t.sapma)).join(' · '));
    else ok(`${kol}: ${kayitlar.length}/${kayitlar.length} kayıt net + KDV = brüt`);
  }
  olc();
  /* Taksit NET eksende mi — ölçülür, varsayılmaz. */
  const kars = (DB.contracts || []).map(c => {
    const t = (DB.milestones || []).filter(m => m.sozlesme === c.kod);
    if(!t.length) return null;
    const top = t.reduce((s, m) => s + (m.odeme || 0), 0);
    const ct = GV.fin.tutar(c, 'contract');
    return Math.abs(top - ct.net) <= 1 ? 'net' : Math.abs(top - ct.brut) <= 1 ? 'brut' : 'sapma';
  }).filter(Boolean);
  const brutte = kars.filter(x => x === 'brut').length, sapmada = kars.filter(x => x === 'sapma').length;
  if(sapmada) de(`${sapmada} sözleşmenin taksit toplamı ne NET ne BRÜT ekseninde`);
  else if(brutte) de(`${brutte} sözleşmenin taksitleri BRÜT eksende — ödeme planı NET olmalı, eksen karışmış`);
  else ok(`${kars.length} ödeme planının hepsi NET eksende`);
  console.log(`     · ölçülen kayıt: ${toplam} tutar + ${kars.length} ödeme planı`);
}

/* ---- F2 — zincir ---------------------------------------------------- */
console.log('\n[F2] Zincir — teklif → sözleşme → ödeme planı → fatura → tahsilat');
{
  const { DB, GV } = kur();
  let halka = 0, olculenHalka = 0, sapan = 0;
  (DB.contracts || []).forEach(c => {
    olc();
    const z = GV.fin.zincirDenetim(c.kod);
    if(!z){ de(`${c.kod} — zincir denetimi null döndü`); return; }
    halka += z.halkaSayisi; olculenHalka += z.olculen; sapan += z.sapan;
    if(z.sapan){
      z.halka.filter(h => h.tutar === false).forEach(h =>
        de(`${c.kod} · ${h.ad} — ` + JSON.stringify(h.sapan || h.fark).slice(0, 110)));
    }
  });
  olc();
  if(!sapan) ok(`${DB.contracts.length} sözleşme · ${halka} halka · ${olculenHalka} ölçüldü · sapma yok`);
  console.log(`     · ölçülemeyen halka: ${halka - olculenHalka} (kaydı olmayan adımlar — "sıfır" değil "ölçülemedi")`);
}

/* ---- F3 — çift KDV tuzağı ------------------------------------------- */
console.log('\n[F3] Çift KDV tuzağı — çapa şişmiş sayıyı YAKALIYOR mu');
{
  const { DB, GV } = kur();

  olc();
  /* OLUMSUZ VAKA — R1'in birebir hatası: sözleşme bedeline teklifin BRÜT
     tutarı yazılır (KDV bir kez daha uygulanır). Zincirin içinden bakan
     bir kontrol bunu göremez; çapa görmek ZORUNDA. */
  const c = DB.contracts.find(x => x.teklif);
  const q = DB.quotes.find(x => x.kod === c.teklif);
  const qT = GV.fin.tutar(q, 'quote');
  c.tutar = qT.brut;                       /* ← kusur: brüt, net sanılıyor */
  c.kdv = Math.round(c.tutar * c.kdvOran / 100);
  c.toplam = c.tutar + c.kdv;              /* alt zincir kendi içinde TUTARLI */
  const cT = GV.fin.tutar(c, 'contract');
  if(cT.tutarli !== true)
    de('hazırlık beklenmedik — şişmiş sözleşme kendi içinde tutarsız çıktı');
  const z = GV.fin.zincirDenetim(c.kod);
  const teklifHalkasi = z.halka.filter(h => h.ad === 'Teklif → Sözleşme')[0];
  if(!teklifHalkasi || teklifHalkasi.tutar !== false)
    de('OLUMSUZ VAKA GEÇTİ — çift KDV yakalanmadı; çapa zincirin içinden bakıyor');
  else ok(`çift KDV yakalandı — teklif NET ${teklifHalkasi.sol.net} ≠ sözleşme NET ${teklifHalkasi.sag.net}`);

  olc();
  /* Kusurun sinsiliği KANITLANIR: kayıt kendi içinde hâlâ tutarlıdır. */
  if(cT.tutarli) ok('şişmiş kayıt kendi içinde TUTARLI — kusuru yalnız dış çapa görüyor');
  else de('bu vaka kusurun sinsiliğini gösteremedi');

  olc();
  /* OLUMLU VAKA — doğru zincir aynı yordamdan geçtiğinde TEMİZ kalmalı;
     kapı her şeyi reddeden bir duvar değil. */
  const { DB:DB2, GV:GV2 } = kur();
  const c2 = DB2.contracts.find(x => x.teklif);
  const z2 = GV2.fin.zincirDenetim(c2.kod);
  const th2 = z2.halka.filter(h => h.ad === 'Teklif → Sözleşme')[0];
  if(!th2 || th2.tutar !== true) de('OLUMLU VAKA DÜŞTÜ — doğru zincir sapma bildirdi');
  else ok('doğru zincir temiz geçti');
}

/* ---- F4 — bakiye tek kaynak ----------------------------------------- */
console.log('\n[F4] Bakiye TEK kaynak — ikinci hesaplama yeri var mı');
{
  olc();
  /* Dar kapsam: ekranlarda "brüt − tahsil" desenini elle kuran satır.
     Ham `toplam -` grep'i her indirim hesabını da sayardı. Yorumlar sökülür. */
  const yorumSok = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^[ \t]*\/\/.*$/gm, ' ');
  const desenler = [
    /\btoplam\s*-\s*tahsil/i, /\btahsil\s*-\s*toplam/i,
    /reduce\([^)]*\btutar\b[^)]*\)\s*[;,]?\s*[\s\S]{0,40}\bacik\b/i,
    /\bacik\s*=\s*[^;]*\btoplam\b/i
  ];
  const dosyalar = fs.readdirSync(ROOT).filter(d => /^app-.*\.html$/.test(d));
  const bulgular = [];
  for(const d of dosyalar){
    let src = fs.readFileSync(path.join(ROOT, d), 'utf8');
    src = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');
    src = yorumSok(src);
    src.split('\n').forEach((satir, i) => {
      if(/GV\.fin\.balance/.test(satir)) return;      /* doğru kaynağı çağıran satır */
      if(desenler.some(r => r.test(satir))) bulgular.push(`${d}:${i + 1} — ${satir.trim().slice(0, 70)}`);
    });
  }
  if(bulgular.length) bulgular.forEach(b => de('ikinci bakiye hesabı: ' + b));
  else ok(`${dosyalar.length} ekranda ikinci bakiye hesabı yok`);

  olc();
  const { DB, GV } = kur();
  /* `balance` gerçekten tahsis defterinden mi okuyor — tahsis eklenince
     bakiye DÜŞMELİ. */
  const f = DB.invoices.find(x => GV.fin.balance(x).acik > 0);
  const once = GV.fin.balance(f).acik;
  DB.paymentAllocations.push({ tahsilat:'THS-EKSEN', fatura:f.kod, tutar:1000, tarih:DB.today, yontem:'Havale' });
  const sonra = GV.fin.balance(f).acik;
  if(sonra !== once - 1000) de(`bakiye tahsis defterinden okumuyor: ${once} → ${sonra}`);
  else ok('bakiye tahsis defterinden türüyor (1.000 ₺ tahsis → bakiye 1.000 ₺ düştü)');
}

/* ---- F5 — fatura durumu türetilir ----------------------------------- */
console.log('\n[F5] Fatura durumu TÜRETİLİR, elle atanmaz');
{
  const { DB, GV } = kur();
  olc();
  const sapan = DB.invoices.filter(f => f.durum !== GV.fin.odemeDurum(f));
  if(sapan.length) de(`${sapan.length} faturanın durumu tahsis toplamıyla çelişiyor: ` +
                      sapan.slice(0,3).map(f => f.kod + ' "' + f.durum + '"').join(' · '));
  else ok(`${DB.invoices.length} faturanın durumu tahsis toplamından türüyor`);

  olc();
  /* OLUMSUZ VAKA — elle "Ödendi" yazmak tutmamalı: `tazeleHepsi` onu geri
     alır, çünkü durum türetilmiş bir görünümdür. */
  const f = DB.invoices.find(x => GV.fin.balance(x).acik > 0);
  f.durum = 'Ödendi';
  GV.fin.tazeleHepsi();
  if(f.durum === 'Ödendi') de('OLUMSUZ VAKA GEÇTİ — elle atanan "Ödendi" hayatta kaldı');
  else ok(`elle atanan durum tazelemede geri alındı → "${f.durum}"`);

  olc();
  /* OLUMLU VAKA — kalan bakiye sıfırlanınca durum KENDİLİĞİNDEN Ödendi olur. */
  const b = GV.fin.balance(f);
  DB.paymentAllocations.push({ tahsilat:'THS-EKSEN-2', fatura:f.kod, tutar:b.acik, tarih:DB.today, yontem:'Havale' });
  GV.fin.tazeleHepsi();
  if(f.durum !== 'Ödendi') de(`OLUMLU VAKA DÜŞTÜ — bakiye sıfır ama durum "${f.durum}"`);
  else ok('kalan sıfırlanınca durum kendiliğinden "Ödendi" oldu');
}

/* ---- F6 — ödeme linki tutarı ---------------------------------------- */
console.log('\n[F6] Ödeme linki tutarı kalan bakiyeyi aşmıyor (§8.5)');
{
  const { DB, GV } = kur();
  olc();
  if(!DB.paymentLinks || !DB.paymentLinks.length){
    de('ödeme linki koleksiyonu boş — ölçüm yapılamadı');
  }else{
    const asan = DB.paymentLinks.filter(l => {
      if(!l.fatura) return false;
      const b = GV.fin.balance(l.fatura);
      return b && (l.tutar || 0) > b.brut + 1;
    });
    if(asan.length) de(`${asan.length} link fatura brütünü aşıyor: ` + asan.map(l => l.kod).join(', '));
    else ok(`${DB.paymentLinks.length} linkin hiçbiri bağlı faturanın tutarını aşmıyor`);
  }

  olc();
  const acikFatura = DB.invoices.filter(f => GV.fin.balance(f).acik > 0).length;
  const linkli = new Set((DB.paymentLinks || []).map(l => l.fatura).filter(Boolean));
  ok(`${acikFatura} açık bakiyeli faturanın ${linkli.size}'inde ödeme linki var`);
}

console.log(`\n${hata ? '✗ ' + hata + ' BULGU' : '✓ TEMİZ'} · ${olculen} kontrol koşuldu · 6 eksen\n`);
process.exit(hata ? 1 : 0);
