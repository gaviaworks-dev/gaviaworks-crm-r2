#!/usr/bin/env node
/* =====================================================================
   BEYAN TARAMASI — ekran cümlesi sayıyı ELLE mi taşıyor?

   ⚠️ BU BİR EKSEN DEĞİL, BİR TARAMADIR. Çıkış kodu her zaman 0'dır ve
   kapı koşumunu kırmaz. Sebebi: elle yazılmış bir sayı bugün DOĞRU
   olabilir; kusur "yanlış" olması değil, **türetilmemiş** olmasıdır ve
   ne zaman yanlışa döneceğini bu betik bilemez. Bulduğu her satır insan
   tarafından veriye karşı sınanmak üzere LİSTELENİR (V2-107).

   NEDEN VAR. Dilim 6'da bir, dilim 7'de dört kez aynı kusur ölçüldü:
   bir kuralın hâlini anlatan ekran cümlesi kuralın KENDİSİNDEN
   türetilmemişti ve kural değiştiği an cümle sessizce yalana döndü.
   O kusurlar tek tek, gözle bulundu. Bu betik aramayı mekanikleştirir.

   YÖNTEM. Yalnız EKRANDA BASILAN metin taranır: `app-*.html` içindeki JS
   dize sabitleri. Yorum satırları HARİÇTİR — yorum ekranda basılmaz, onun
   bayatlaması ayrı bir kusur sınıfıdır (defter–kod ayrışması) ve ayrı
   ölçülür. Kalıp, Türkçe bir ölçüm cümlesinde sayının aldığı biçimlerdir:
   "7 talebin", "14/14 kayıtta", "Ölçüldü: … 6", "6’sı".

   ⚠️ EKSİK YÖNÜ YAZILIDIR: betik sayının DOĞRU olup olmadığını ölçmez,
   yalnız ELLE YAZILDIĞINI ölçer. Doğruluk sınaması veriye karşı elle
   yapılır ve sonucu `raporlar/`a yazılır.
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : path.resolve(__dirname, '..', '..');

const KALIP = [
  /(\d+)\s*(kaydın|talebin|projenin|personelin|aracın|faturanın|teklifin|hesabın|satırın|politikanın|kayıttan|sözleşmenin|görevin|demirbaşın|izin|toplantının)/i,
  /(\d+)\s*\/\s*(\d+)\s*(kayıt|dolu|tam|geçti)/i,
  /(?:ölçüldü|Ölçüldü)[^'"]{0,60}?\b(\d{1,3})\b/,
  /\b(\d{1,3})\s*(?:’|')?(?:sı|si|su|sü|ı|i|u|ü|inde|ında|ünde|unda|ünün|ının)\b/
];

const dosyalar = fs.readdirSync(ROOT).filter(f => /^app-.*\.html$/.test(f)).sort();
const bulgu = [];

for (const f of dosyalar) {
  const satir = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n');
  let blokYorum = false;
  satir.forEach((ham, i) => {
    const t = ham.trim();
    if (blokYorum) { if (t.includes('*/')) blokYorum = false; return; }
    if (t.startsWith('/*')) { if (!t.includes('*/')) blokYorum = true; return; }
    if (t.startsWith('//')) return;
    const line = ham.replace(/\/\*.*?\*\//g, '');
    for (const m of line.matchAll(/'((?:[^'\\]|\\.)*)'/g)) {
      const d = m[1];
      if (d.length < 12) continue;
      if (!/[a-zçğıöşü]{4}/i.test(d)) continue;   /* saf işaretleme değil, cümle */
      if (KALIP.some(k => k.test(d))) { bulgu.push({ f, satir: i + 1, metin: d.slice(0, 150) }); break; }
    }
  });
}

const dosyaBasi = bulgu.reduce((a, b) => { a[b.f] = (a[b.f] || 0) + 1; return a; }, {});
console.log('\n=== BEYAN TARAMASI (kapı DEĞİL, tarama) ===');
console.log('  taranan ekran dosyası : ' + dosyalar.length);
console.log('  elle yazılmış sayı taşıyan ekran cümlesi : ' + bulgu.length);
console.log('  dosya sayısı : ' + Object.keys(dosyaBasi).length);
console.log('');
bulgu.forEach(b => console.log('   · ' + b.f + ':' + b.satir + '  ' + b.metin));
console.log('\n  ⚠️ Bu liste "yanlış" demez, "türetilmemiş" der. Her satır veriye');
console.log('     karşı elle sınanmalıdır (V2-107). Çıkış kodu bilerek 0.');
process.exit(0);
