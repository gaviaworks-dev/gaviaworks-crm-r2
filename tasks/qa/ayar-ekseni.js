#!/usr/bin/env node
/* =====================================================================
   R2 AYAR EKSENİ — şartname §3.1 · §3.3 · §8.7 · §8.6

   Tarayıcı ekseni (tasks/qa/tarayici.js) sayfanın TAŞMADIĞINI söyler; bu
   eksen ayar kabuğunun DOĞRU ŞEYİ SÖYLEDİĞİNİ söyler. Yedi eksen:

     A1 MENÜ SAYIMI  — standart kullanıcının görünür günlük girdisi ≤18 ve
                       yönetim girdileri AYRI blokta; dört ayar hedefi diskte.
     A2 SEKME ÜRETİMİ— sekmeler YETKİDEN üretilir ve ekran kendi listesini
                       YAZMAZ (§3.3). Yetkisiz sekme BASILMAZ, kilitli değil.
     A3 TEK DEFTER   — Sistem Kayıtları `GV.audit` okur; ikinci defter yok.
                       Birleşik defterin satır kimliği KARARLI ve benzersiz.
     A4 ANAHTAR YOK  — hiçbir ayar ekranı parola/anahtar/token girdisi açmaz
                       (§8.7 "canlı anahtarlar istemci paketinde bulunmaz").
     A5 SAHTE BAĞLANTI— katalog iddiası ölçüm gibi basılmaz (K-34).
     A6 KAPI İKİ YÖNLÜ— modül anahtarını açma ile kapatma AYNI yetki kümesini
                       ve AYNI gerekçe koşulunu ister; geri almak daha ağır değil.
     A7 KİŞİSEL VERİ — özlük/maaş alanı kapı KURULMADAN basılmaz; yetkisizde
                       boş değil MASKE döner.
     A8 TEK KAPI     — menü gizlemesi ile DOĞRUDAN ADRES kapısı aynı yordamdan
                       beslenir. Menüde gizlenen bir ekran adresi elle
                       yazılarak AÇILAMAZ (R1 REVİZE 13 · ADR-R2-36).
     A9 DEFTER SAYIMI— rota haritasının §1 özet tablosu, KENDİ karar
                       satırlarıyla tutuyor mu. Özet elle tutulduğu için
                       defterden bağımsız yaşamaya başlamıştı.

   ⚠️ ÖLÇÜM ONARIMDAN ÖNCE KOŞAR. Bu betiğin ilk yazımı `ik-ekseni`nin
   düştüğü tuzağa düşmemek için ölçtüğü şeye hiç dokunmaz: modül anahtarını
   sınayan bölüm kendi kopyasını kurar ve ölçümden SONRA geri alır.

   Koşum: node tasks/qa/ayar-ekseni.js   (depo kökünden)
   ===================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.env.GV_ROOT ? path.resolve(process.env.GV_ROOT) : path.resolve(__dirname, '..', '..');

let hata = 0, kontrol = 0;
const de = (m) => { console.log('  ✗ ' + m); hata++; };
const ok = (m) => { console.log('  ✓ ' + m); };
const say = () => { kontrol++; };

/* Ölçülen ayar ekranları — menü kaydından TÜRETİLİR, elle yazılmaz. */
const AYAR_EKRAN = { profil:null, sirket:null, entegrasyon:null, log:null };

/* ---- ortak katmanı Node'da kur ------------------------------------- */
function kurulum(){
  const ctx = { console:{ log(){}, warn(){}, error(){} } };
  vm.createContext(ctx);
  vm.runInContext(`
    var window=globalThis; var self=globalThis;
    var localStorage={getItem(){return null;},setItem(){},removeItem(){}};
    var sessionStorage={getItem(){return null;},setItem(){},removeItem(){}};
    var location={search:'',pathname:'/app-ayar-profil.html',hash:''};
    var history={replaceState(){},pushState(){}};
    var document={readyState:'complete',addEventListener(){},body:{dataset:{}},
      getElementById(){return null;},querySelector(){return null;},querySelectorAll(){return [];},
      createElement(){return {style:{},setAttribute(){},classList:{add(){},remove(){},toggle(){},contains(){return false;}},appendChild(){},addEventListener(){}};},
      dispatchEvent(){}};
    var CustomEvent=function(){};
    var fetch=function(){var c={then:function(){return c;},catch:function(){return c;}};return c;};
    var MutationObserver=function(){this.observe=function(){};};
  `, ctx);
  for(const f of ['org','crm','work','misc','ops','hr','notes','reports','lifecycle','odeme'])
    vm.runInContext(fs.readFileSync(path.join(ROOT,'assets/data',f+'.js'),'utf8'), ctx, { filename:f+'.js' });
  for(const f of ['assets/js/shell.js','assets/js/ui.js','assets/js/domain.js'])
    vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'), ctx, { filename:f });
  return ctx;
}

const ctx = kurulum();
const DB = ctx.DB, GV = ctx.GV;

/* Ayar ekranı dosyası — diskte varsa kaynağı okunur, yoksa ölçüm atlanır
   ve ATLANDIĞI YAZILIR (sessiz atlama, kapsamı küçük göstermenin yolu). */
function kaynak(ekran){
  const p = path.join(ROOT, 'app-ayar-' + ekran + '.html');
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}
/* Yalnız satır içi <script> gövdesi — yorumlar ÇIKARILIR. Bir yasağı
   ANLATAN yorum, yasağı İHLAL eden kod sayılamaz (ölçüm aracının borcu
   fazla sayması, L-26). */
function betik(src){
  const blocks = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join('\n');
  return blocks
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
}

console.log('\n=== AYAR EKSENİ ===');

/* ===================================================================
   A1 — MENÜ SAYIMI VE YÖNETİM BLOĞU
   =================================================================== */
console.log('\n[A1] Menü sayımı ve yönetim bloğu (§3.1)');
{
  const shellSrc = fs.readFileSync(path.join(ROOT,'assets/js/shell.js'),'utf8');

  /* Menüdeki her hedef diskte var mı — "hedefi olup diskte olmayan ekran" */
  const hrefler = [...shellSrc.matchAll(/href:'([^']+)'/g)].map(m => m[1]);
  const eksik = [...new Set(hrefler)].filter(h => !fs.existsSync(path.join(ROOT, h.split('?')[0])));
  say();
  if(eksik.length) de(`menüde hedefi olup DİSKTE OLMAYAN ekran ${eksik.length}: ${eksik.join(', ')}`);
  else ok(`menüdeki ${new Set(hrefler).size} hedefin hepsi diskte`);

  /* BUILT listesi diskle birebir mi
     ⚠️ YORUM AYIKLANIR. İlk yazım ham diziyi tarıyordu; dizinin içindeki
     Türkçe blok yorumda bir KESME İŞARETİ vardı (`§3.3'ün`) ve `'([^']+)'`
     eşleşmesi oradan kayarak yorum metnini bir dosya adı sandı. Bulgu
     olarak "BUILT'te olup diskte olmayan: ün AYNI ayar…" basıyordu —
     ölçüm aracı, ölçtüğü şeyin dilbilgisini bilmek zorundadır. */
  const builtHam = (shellSrc.match(/var BUILT = \[([\s\S]*?)\];/)||[])[1]
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
  const built = [...builtHam.matchAll(/'([^']+)'/g)].map(m => m[1]);
  const disk = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
  say();
  const builtEksik = built.filter(b => !disk.includes(b));
  const diskEksik  = disk.filter(d => !built.includes(d));
  if(builtEksik.length) de(`BUILT'te olup diskte olmayan: ${builtEksik.join(', ')}`);
  else if(diskEksik.length) de(`diskte olup BUILT'te olmayan: ${diskEksik.join(', ')} — kabuk kendi ekranını kilitler`);
  else ok(`BUILT ${built.length} = diskteki ${disk.length} html, birebir`);

  /* Rol başına görünür girdi — kural TEK yerden okunur (shell.visibleItems) */
  const roller = Object.keys(DB.permMatrix || {});
  let enYuksekGunluk = 0, enYuksekAlan = 0;
  const yonetimTasiyan = [];
  for(const r of roller){
    const emp = (DB.employees||[]).find(e => (e.roller||[]).includes(r)) || DB.employees[0];
    const s = (r === 'musteri') ? GV.shell.setSession(null,'musteri') : GV.shell.setSession(emp.kod, r);
    if(!s) continue;
    const items = GV.shell.visibleItems();
    const gunluk = items.filter(i => !i.yonetim).length;
    const yonetim = items.filter(i => i.yonetim).length;
    enYuksekGunluk = Math.max(enYuksekGunluk, gunluk);
    enYuksekAlan = Math.max(enYuksekAlan, new Set(items.map(i=>i.alan)).size);
    if(yonetim) yonetimTasiyan.push(r + '=' + yonetim);
  }
  say();
  if(enYuksekGunluk > 18) de(`standart kullanıcının günlük girdisi ${enYuksekGunluk} — §3.1 sınırı 18`);
  else ok(`en yüksek GÜNLÜK menü girdisi ${enYuksekGunluk} (≤18) · en yüksek alan ${enYuksekAlan} (≤7)`);
  say();
  if(!yonetimTasiyan.length) de('hiçbir rolde yönetim girdisi yok — yönetim bloğu ölçülemedi');
  else ok(`yönetim girdisi taşıyan rol: ${yonetimTasiyan.join(' · ')}`);

  /* Yönetim girdisi AYRI ve SOLUK blokta mı — kabuk işaretlemesi */
  say();
  const ayriBlok = /gv-menu-admin/.test(shellSrc) && /is-admin/.test(shellSrc);
  /* ⚠️ CSS TEK DOSYADA DEĞİL. İlk yazım yalnız `shell.css`e baktı ve
     sınıflar `r2.css`te olduğu için OLMAYAN bir kusur bildirdi — ölçüm
     aracının kapsamı, ölçtüğü şeyin kapsamından dar olamaz (L-26). */
  const solukCss = fs.readdirSync(path.join(ROOT,'assets/css'))
    .filter(f => f.endsWith('.css'))
    .map(f => fs.readFileSync(path.join(ROOT,'assets/css',f),'utf8')).join('\n');
  const solukVar = /\.gv-menu-admin\s*\{/.test(solukCss) &&
                   /\.gv-menu-item\.is-admin\s*\{/.test(solukCss) &&
                   /\.gv-menu-item\.is-admin[^{]*\{[^}]*opacity/.test(solukCss);
  if(!ayriBlok) de('kabuk yönetim girdilerini ayrı blokta basmıyor (.gv-menu-admin / .is-admin yok)');
  else if(!solukVar) de('.gv-menu-admin / .is-admin sınıfı CSS\'te tanımlı değil — blok ayrı ama SOLUK değil');
  else ok('yönetim girdileri ayrı `.gv-menu-admin` bloğunda ve `.is-admin` ile soluk');

  /* Profil girdisi yönetim OLMAMALI — herkes kendi profilini yönetir */
  say();
  const profilKaydi = /lbl:'Profil'[^}]*}/.exec(shellSrc);
  if(!profilKaydi) de('menüde Profil girdisi bulunamadı');
  else if(/yonetim:true/.test(profilKaydi[0])) de('Profil girdisi `yonetim:true` — herkese açık girdi yönetim bloğuna düşmemeli');
  else ok('Profil girdisi yönetim bloğunda DEĞİL (herkese açık, günlük sayının içinde)');
}

/* ===================================================================
   A2 — SEKME ÜRETİMİ YETKİDEN (§3.3)
   =================================================================== */
console.log('\n[A2] Sekme üretimi yetkiden (§3.3)');
{
  say();
  if(typeof GV.shell.ayarSekmeleri !== 'function') de('GV.shell.ayarSekmeleri yok — sekme kuralı tek yerde yaşamıyor');
  else ok('GV.shell.ayarSekmeleri tanımlı — sekme kuralı TEK yerde');

  /* Ham kayıt ile süzülmüş küme farklı olmak ZORUNDA: en az bir sekme
     en az bir rolde düşmeli, yoksa "yetkiye göre üret" hükmü ölçülemez. */
  const ham = GV.shell.ayarSekmeHam || {};
  say();
  let farkVar = false, ornek = [];
  for(const ekran of Object.keys(AYAR_EKRAN)){
    const hamN = (ham[ekran]||[]).length;
    const roller = Object.keys(DB.permMatrix||{});
    const gorulen = new Set();
    for(const r of roller){
      const emp = (DB.employees||[]).find(e => (e.roller||[]).includes(r)) || DB.employees[0];
      if(!((r === 'musteri') ? GV.shell.setSession(null,'musteri') : GV.shell.setSession(emp.kod, r))) continue;
      const n = GV.shell.ayarSekmeleri(ekran).length;
      gorulen.add(n);
      if(n < hamN){ farkVar = true; if(ornek.length < 3) ornek.push(`${ekran}/${r}=${n}<${hamN}`); }
      if(n > hamN) de(`${ekran}/${r} süzülmüş sekme sayısı ham kayıttan FAZLA (${n}>${hamN})`);
    }
  }
  if(!farkVar) de('hiçbir rolde sekme düşmüyor — "yetkiye göre sekme üret" ölçülemez, kapı ölü olabilir');
  else ok(`sekme kapısı en az bir rolde kesiyor: ${ornek.join(' · ')}`);

  /* Yetkisiz sekme BASILMAZ (kilitli/gri gösterilmez) — ölçülen: devops
     `odeme` sekmesini görmemeli (perm:'finans', devops finans:false). */
  say();
  const devopsEmp = (DB.employees||[]).find(e => (e.roller||[]).includes('devops')) || DB.employees[0];
  GV.shell.setSession(devopsEmp.kod, 'devops');
  const devops = GV.shell.ayarSekmeleri('entegrasyon').map(t => t.key);
  if(devops.includes('odeme')) de('devops `odeme` sekmesini görüyor — perm:\'finans\' kapısı kesmiyor');
  else ok(`devops entegrasyon sekmeleri: ${devops.join(', ')} — \`odeme\` kesildi`);

  /* Ekran kendi sekme listesini YAZMAMALI */
  for(const ekran of Object.keys(AYAR_EKRAN)){
    const src = kaynak(ekran);
    say();
    if(!src){ console.log(`  · app-ayar-${ekran}.html diskte YOK — sekme kaynağı ölçümü ATLANDI`); continue; }
    const b = betik(src);
    if(!/ayarSekmeleri\s*\(/.test(b)) de(`app-ayar-${ekran}.html \`GV.shell.ayarSekmeleri\` çağırmıyor — sekme listesini kendisi yazıyor olabilir`);
    else ok(`app-ayar-${ekran}.html sekmeleri ortak katmandan alıyor`);
  }
}

/* ===================================================================
   A3 — TEK DEFTER (§9.1)
   =================================================================== */
console.log('\n[A3] Denetim izi — TEK defter');
{
  const satirlar = GV.audit.oku(null, 0);
  const d = GV.audit.denetle();
  say();
  if(satirlar.length !== d.toplam) {
    /* Tekilleştirme çift kaydı düşürür; birleşik sayı toplamdan KÜÇÜK
       olabilir, ASLA büyük olamaz. */
    if(satirlar.length > d.toplam) de(`birleşik defter ${satirlar.length} satır ama iki defter toplamı ${d.toplam} — kayıt ÜRETİLMİŞ`);
    else ok(`birleşik defter ${satirlar.length} satır (iki defter ${d.olay}+${d.sistem}=${d.toplam}, ${d.toplam-satirlar.length} çift düştü)`);
  } else ok(`birleşik defter ${satirlar.length} satır = ${d.olay} olay + ${d.sistem} sistem`);

  /* GV.list `key:` için kararlı ve benzersiz kimlik */
  say();
  const kimliksiz = satirlar.filter(x => x.id == null || x.id === '').length;
  const benzersiz = new Set(satirlar.map(x => x.id)).size;
  if(kimliksiz) de(`${kimliksiz} defter satırında \`id\` yok — GV.list \`key:\` bağlanamaz`);
  else if(benzersiz !== satirlar.length) de(`defter kimlikleri benzersiz değil: ${benzersiz}/${satirlar.length}`);
  else ok(`defter satır kimliği ${benzersiz}/${satirlar.length} benzersiz`);

  /* Kimlik KARARLI olmalı: defter unshift ile büyüyünce eski satırın
     kimliği DEĞİŞMEMELİ (dizi indeksi kimlik olamaz). */
  say();
  const oncekiId = satirlar[satirlar.length-1].id;
  const oncekiMetin = satirlar[satirlar.length-1].metin;
  GV.audit.yaz({ kayit:'AYAR-EKSEN-SINAMA', islem:'eksen kararlılık sınaması', tone:'info', icon:'i-flask' });
  const yeni = GV.audit.oku(null, 0);
  const ayni = yeni.filter(x => x.metin === oncekiMetin && x.id === oncekiId).length;
  if(!ayni) de('defter büyüdüğünde eski satırın kimliği DEĞİŞTİ — kimlik indeks tabanlı, kararlı değil');
  else ok('defter büyüdü, eski satırın kimliği değişmedi — kimlik içerikten türetilmiş');
  /* sınama kaydı geri alınır — ölçüm ölçtüğü şeyi kirletmez */
  DB.activities.shift();

  /* Ekran ikinci defter kurmamalı */
  const src = kaynak('log');
  say();
  if(!src){ console.log('  · app-ayar-log.html diskte YOK — ikinci defter ölçümü ATLANDI'); }
  else {
    const b = betik(src);
    const ihlal = [];
    if(/DB\.logs\s*\.\s*(unshift|push|splice)/.test(b))       ihlal.push('DB.logs\'a doğrudan yazıyor');
    if(/DB\.activities\s*\.\s*(unshift|push|splice)/.test(b)) ihlal.push('DB.activities\'e doğrudan yazıyor');
    if(!/GV\.audit\.oku/.test(b))                             ihlal.push('GV.audit.oku çağırmıyor');
    if(ihlal.length) de('app-ayar-log.html — ' + ihlal.join(' · '));
    else ok('app-ayar-log.html yalnız GV.audit okuyor, ikinci defter kurmuyor');
  }
}

/* ===================================================================
   A4 — ANAHTAR/PAROLA GİRDİSİ YOK (§8.7)
   =================================================================== */
console.log('\n[A4] Canlı anahtar girdisi yok (§8.7)');
{
  const yasakli = /type\s*=\s*["']?password|apiKey|api_key|secretKey|secret_key|clientSecret|accessToken|access_token|Bearer\s/i;
  for(const ekran of Object.keys(AYAR_EKRAN)){
    const src = kaynak(ekran);
    say();
    if(!src){ console.log(`  · app-ayar-${ekran}.html diskte YOK — anahtar ölçümü ATLANDI`); continue; }
    /* Burada YORUM DA taranır: bir anahtar adını yorumda anmak bile
       gerekmez ve tarama bilerek katıdır. Yorumda gerekçe yazmak için
       "anahtar" kelimesi yeterlidir. */
    if(yasakli.test(src)) de(`app-ayar-${ekran}.html canlı anahtar/parola alanı ya da gömülü sır taşıyor`);
    else ok(`app-ayar-${ekran}.html anahtar/parola girdisi açmıyor`);
  }
}

/* ===================================================================
   A5 — SAHTE BAĞLANTI DURUMU (K-34)
   =================================================================== */
console.log('\n[A5] Sahte bağlantı durumu basılmıyor (K-34)');
{
  say();
  if(!GV.entegrasyon) de('GV.entegrasyon yok — bağlantı durumu türetimi ortak katmanda değil');
  else {
    const k = GV.entegrasyon.kanit();
    const kosum = GV.entegrasyon.kosumVar();
    const olculen = GV.entegrasyon.olculenDurum();
    const celisen = GV.entegrasyon.celisenler();
    if(kosum && olculen === 'Bağlanmadı')
      de('koşum kanıtı VAR ama ölçülen durum hâlâ `Bağlanmadı` — yordam kanıtı okumuyor');
    else if(!kosum && olculen !== 'Bağlanmadı')
      de(`koşum kanıtı yok ama ölçülen durum \`${olculen}\` — bağlanmamış sağlayıcı bağlı gösteriliyor`);
    else ok(`koşum kanıtı: defter=${k.kosumDefteri} hata=${k.hataKuyrugu} webhook=${k.webhookOlayi} → ölçülen durum \`${olculen}\``);
    say();
    if(!celisen.length) console.log('  · katalog iddiası ile ölçüm çelişmiyor — çelişki ölçümü boş geçti');
    else ok(`katalog iddiası ölçümle çelişen ${celisen.length} kayıt raporlanabilir: ${celisen.map(e=>e.kod).join(', ')}`);
  }

  const src = kaynak('entegrasyon');
  say();
  if(!src){ console.log('  · app-ayar-entegrasyon.html diskte YOK — sahte durum ölçümü ATLANDI'); }
  else {
    const b = betik(src);
    const ihlal = [];
    /* `durum` alanını doğrudan rozete vermek = yeşil "Bağlı" basmak */
    if(/GV\.badge\s*\(\s*[a-z_$][\w$]*\.durum/i.test(b)) ihlal.push('katalog `durum` alanını doğrudan GV.badge\'e veriyor');
    if(!/GV\.entegrasyon\./.test(b)) ihlal.push('GV.entegrasyon çağırmıyor — durumu kendisi yorumluyor olabilir');
    if(!/olculenDurum|kosumVar|kanit/.test(b)) ihlal.push('ölçülen durumu okumuyor');
    if(ihlal.length) de('app-ayar-entegrasyon.html — ' + ihlal.join(' · '));
    else ok('app-ayar-entegrasyon.html bağlantı durumunu ortak katmandan türetiyor, katalog iddiasını rozet yapmıyor');
    /* "Bağlan" düğmesi vaadi */
    say();
    if(/(Bağlan|Bağlantıyı kes|Yeniden bağla)\s*<\/button>|label\s*:\s*'Bağlan/i.test(b))
      de('app-ayar-entegrasyon.html yapılamayan bir işi düğme olarak vaat ediyor (Bağlan/Bağlantıyı kes)');
    else ok('yapılamayan bağlantı eylemi düğme olarak vaat edilmiyor');
  }
}

/* ===================================================================
   A6 — MODÜL KAPISI İKİ YÖNLÜ
   =================================================================== */
console.log('\n[A6] Modül anahtarı — kapı iki yönde de aynı');
{
  say();
  if(!GV.ayar || typeof GV.ayar.modulAyarla !== 'function'){
    de('GV.ayar.modulAyarla yok — modül ayarının tek mutasyon noktası tanımlı değil');
  } else {
    const anahtar = GV.ayar.modulAnahtarlari()[0];
    const roller = Object.keys(DB.permMatrix||{});
    const kapatan = [], acan = [];
    for(const r of roller){
      const emp = (DB.employees||[]).find(e => (e.roller||[]).includes(r)) || DB.employees[0];
      if(!((r === 'musteri') ? GV.shell.setSession(null,'musteri') : GV.shell.setSession(emp.kod, r))) continue;
      /* Yetki kümesi ölçülür, mutasyon YAPILMADAN — yordam yetkiyi
         gerekçeden ÖNCE denetler, o yüzden geçerli gerekçe ile sorulur. */
      const acikMi = GV.ayar.modulAcik(anahtar);
      const kapat = GV.ayar.modulAyarla(anahtar, false, 'eksen yetki sınaması');
      if(kapat.ok){ kapatan.push(r); GV.ayar.modulAyarla(anahtar, true, 'eksen sınaması geri alındı'); }
      else if(kapat.why !== 'yetki') kapatan.push(r);
      const ac = GV.ayar.modulAyarla(anahtar, true, 'eksen yetki sınaması');
      if(ac.ok){ acan.push(r); GV.ayar.modulAyarla(anahtar, false, 'eksen sınaması geri alındı'); GV.ayar.modulAyarla(anahtar, true, 'eksen sınaması geri alındı'); }
      else if(ac.why !== 'yetki') acan.push(r);
      if(GV.ayar.modulAcik(anahtar) !== acikMi) GV.ayar.modulAyarla(anahtar, acikMi, 'eksen sınaması geri alındı');
    }
    const kSet = kapatan.slice().sort().join(','), aSet = acan.slice().sort().join(',');
    if(kSet !== aSet)
      de(`kapatma kümesi ile açma kümesi AYNI DEĞİL — kapatan: [${kSet}] · açan: [${aSet}]. Bir işi geri almak onu yapmaktan ağır olamaz.`);
    else ok(`kapatma ve açma yetki kümesi birebir aynı (${kapatan.length} rol): ${kSet || '(boş)'}`);

    /* Gerekçe koşulu iki yönde de aynı mı */
    say();
    const yetkili = (DB.employees||[]).find(e => (e.roller||[]).includes('sahip')) || DB.employees[0];
    GV.shell.setSession(yetkili.kod, 'sahip');
    const anah = GV.ayar.modulAnahtarlari()[0];
    const bas = GV.ayar.modulAcik(anah);
    const kapatBos = GV.ayar.modulAyarla(anah, false, '');
    if(kapatBos.ok) GV.ayar.modulAyarla(anah, bas, 'eksen sınaması geri alındı');
    GV.ayar.modulAyarla(anah, false, 'eksen gerekçe sınaması');
    const acBos = GV.ayar.modulAyarla(anah, true, '');
    if(acBos.ok) GV.ayar.modulAyarla(anah, false, 'eksen sınaması geri alındı');
    GV.ayar.modulAyarla(anah, bas, 'eksen sınaması geri alındı');
    if(kapatBos.why !== acBos.why)
      de(`gerekçe koşulu iki yönde FARKLI — kapatma: ${kapatBos.why} · açma: ${acBos.why}`);
    else if(kapatBos.why !== 'gerekce')
      de(`gerekçe boş bırakıldığında geçiş reddedilmedi (why=${kapatBos.why}) — kapı uyarıyor, engellemiyor`);
    else ok('gerekçe zorunluluğu iki yönde de aynı ve boş gerekçe REDDEDİLİYOR');

    /* Anahtar ölçümden sonra başlangıç durumunda mı */
    say();
    const son = GV.ayar.modulAnahtarlari().filter(k => !GV.ayar.modulAcik(k));
    if(son.length) de(`eksen kendi kurduğu modül anahtarını geri almadı: kapalı kalan ${son.join(', ')}`);
    else ok('sınama sonrası sekiz modül anahtarı da açık — ölçüm ölçtüğü şeyi kirletmedi');
  }
}

/* ===================================================================
   A7 — KİŞİSEL VERİ KAPISI
   =================================================================== */
console.log('\n[A7] Kişisel veri kapısı (§20.1)');
{
  const ozlukAlan = ['dogum','kanGrubu','acilKisi','tel','eposta','egitim','sozlesme','calismaTuru'];
  const maasAlan  = ['maas','saatlikUcret'];

  /* Yetkisiz rolde özlük MASKE dönmeli — boş DEĞİL */
  say();
  const yabanci = (DB.employees||[]).find(e => (e.roller||[]).includes('frontend')) || DB.employees[1];
  const hedef   = (DB.employees||[]).find(e => e.kod !== yabanci.kod && e.dep !== yabanci.dep);
  GV.shell.setSession(yabanci.kod, 'frontend');
  const gorur = GV.hr.ozlukGorebilir(hedef);
  const deger = GV.hr.ozluk(hedef, 'kanGrubu');
  if(gorur) de(`frontend rolü başka departmandaki ${hedef.kod} özlüğünü görüyor — kapı kesmiyor`);
  else if(deger === '' || deger == null) de('yetkisizde özlük alanı BOŞ döndü — boş "veri yok" der, oysa veri var ve görülemiyor (UID-11)');
  else if(!/•/.test(String(deger))) de(`yetkisizde özlük alanı maskelenmedi: ${JSON.stringify(deger)}`);
  else ok(`yetkisiz rolde özlük maskeli döndü (${deger}) — boş değil`);

  /* Kendi kaydını her zaman görür */
  say();
  if(!GV.hr.ozlukGorebilir(yabanci)) de('personel kendi özlüğünü göremiyor');
  else ok('personel kendi özlüğünü görüyor');

  /* Maaş kapısı — permMatrix.maas taşıyan rol sayısı ölçülür */
  say();
  const maasli = Object.keys(DB.permMatrix).filter(r => DB.permMatrix[r].maas === true);
  const olculen = [];
  for(const r of Object.keys(DB.permMatrix)){
    const emp = (DB.employees||[]).find(e => (e.roller||[]).includes(r)) || DB.employees[0];
    if(!((r === 'musteri') ? GV.shell.setSession(null,'musteri') : GV.shell.setSession(emp.kod, r))) continue;
    if(GV.hr.maasGorebilir()) olculen.push(r);
  }
  if(olculen.slice().sort().join(',') !== maasli.slice().sort().join(','))
    de(`maaş kapısı matrisle tutmuyor — matris: [${maasli.join(',')}] · ölçülen: [${olculen.join(',')}]`);
  else ok(`maaş kapısı ${olculen.length} rolde açık ve matrisle birebir: ${olculen.join(', ')}`);

  /* Ekran kapı KURMADAN özlük/maaş alanı basıyor mu */
  for(const ekran of ['profil','sirket']){
    const src = kaynak(ekran);
    say();
    if(!src){ console.log(`  · app-ayar-${ekran}.html diskte YOK — kişisel veri ölçümü ATLANDI`); continue; }
    const b = betik(src);
    const basilan = ozlukAlan.filter(a => new RegExp('[\\.\\[][\'"]?' + a + '\\b').test(b));
    const basilanMaas = maasAlan.filter(a => new RegExp('[\\.\\[][\'"]?' + a + '\\b').test(b));
    const ozlukKapi = /ozlukGorebilir|GV\.hr\.ozluk\s*\(/.test(b);
    const maasKapi  = /maasGorebilir|GV\.perm\.mask\s*\(|GV\.perm\.can\s*\(\s*'maas'/.test(b);
    const ihlal = [];
    if(basilan.length && !ozlukKapi)     ihlal.push(`özlük alanı basıyor (${basilan.join(',')}) ama özlük kapısı KURULMAMIŞ`);
    if(basilanMaas.length && !maasKapi)  ihlal.push(`maaş alanı basıyor (${basilanMaas.join(',')}) ama maaş kapısı KURULMAMIŞ`);
    if(ihlal.length) de(`app-ayar-${ekran}.html — ` + ihlal.join(' · '));
    else ok(`app-ayar-${ekran}.html — özlük ${basilan.length} · maaş ${basilanMaas.length} alan, kapılar kurulu (özlük:${ozlukKapi} maaş:${maasKapi})`);
  }
}

/* ===================================================================
   A8 — MENÜ KAPISI İLE ADRES KAPISI TEK KAYNAKTAN (ADR-R2-36)
   -------------------------------------------------------------------
   `shell.js` bunu KENDİ YORUMUNDA söz veriyordu ("menü gizlemesi ile
   doğrudan adres kapısı TEK kaynaktan beslenir — biri kapanıp diğeri açık
   kalamaz") ama kod sözü İKİ yerde birden bozuyordu. Defter doğruydu, kod
   ayrışmıştı ve HİÇBİR EKSEN bunu ölçmüyordu: menü sayımı yalnız GÖRÜNÜRLÜĞÜ
   ölçüyordu, kapı yönü ekseni yalnız DURUM GEÇİŞİ kapılarını.

   Ölçülen değişmez: her rol × her MENÜ HEDEFİ için
       menüde görünür  ⟺  adresle açılabilir
   İki taraf da shell.js'in KENDİ dışa verdiği yordamlarından okunur
   (`visibleItems` · `ekranAcilabilir`); guard'ın ikinci bir kopyası
   YAZILMAZ — kopya yazsaydım kusuru kopyaya da taşırdım ve eksen kendi
   ölçtüğü şeyle birlikte yanılırdı.
   =================================================================== */
console.log('\n[A8] Menü kapısı = adres kapısı (ADR-R2-36)');
{
  /* ⚠️ MENÜ HEDEFİ ≠ `shell.js`teki her `href:`. İlk yazım kaynağı regex ile
     tarıyordu ve üst çubuğun "Yeni" hızlı oluşturma listesini de (form
     ekranları) menü girdisi sandı: o beş hedef HİÇBİR rolde menüde
     GÖRÜNMEZ ama adresle açılmaları DOĞRUDUR — bir form, girdisi olan
     listenin çocuğudur. Eksen 135 sahte çift bildirdi. Hedefler artık
     kabuğun KENDİ dışa verdiği menü kaydından okunur, kaynak metninden
     değil: ölçüm aracı, ölçtüğü şeyin şemasını tahmin etmez. */
  const hedefler = [...new Set(
    GV.shell.railOrder.flatMap(k => ((GV.shell.sections[k] || {}).menu || []))
      .map(it => it.href).filter(Boolean)
  )];
  const roller = Object.keys(DB.permMatrix || {});
  const gizliAmaAcik = [], gorunurAmaKapali = [];
  let cift = 0;

  for(const r of roller){
    const emp = (DB.employees||[]).find(e => (e.roller||[]).includes(r)) || DB.employees[0];
    if(!((r === 'musteri') ? GV.shell.setSession(null,'musteri') : GV.shell.setSession(emp.kod, r))) continue;
    const gorunur = new Set(GV.shell.visibleItems().map(i => i.href));
    for(const h of hedefler){
      cift++;
      const menude = gorunur.has(h);
      const acilabilir = GV.shell.ekranAcilabilir(h);
      if(menude && !acilabilir) gorunurAmaKapali.push(r + ' → ' + h);
      else if(!menude && acilabilir) gizliAmaAcik.push(r + ' → ' + h);
    }
  }
  say();
  if(gizliAmaAcik.length)
    de(`menüde GİZLİ olup adresle AÇILABİLEN ${gizliAmaAcik.length} ekran-rol çifti — ` +
       `menü gizlemesi bir kapı değil, yalnız bir görünürlük: ${gizliAmaAcik.slice(0,6).join(' · ')}` +
       (gizliAmaAcik.length > 6 ? ` … (+${gizliAmaAcik.length-6})` : ''));
  else ok(`${cift} çift ölçüldü (${roller.length} rol × ${hedefler.length} menü hedefi) — gizli olup adresle açılabilen ekran YOK`);

  say();
  if(gorunurAmaKapali.length)
    de(`menüde GÖRÜNÜR olup adres kapısı REDDEDEN ${gorunurAmaKapali.length} çift — ` +
       `kullanıcıya tıklayınca 403 veren bir girdi gösteriliyor: ${gorunurAmaKapali.slice(0,6).join(' · ')}`);
  else ok('menüde görünen her girdi adresle de açılabiliyor — ölü menü girdisi yok');

  /* Kapı ölü olmasın: en az bir rolde en az bir hedefin GERÇEKTEN kapanması
     gerekir, yoksa "her şey herkese açık" da bu eksenden yeşil geçerdi. */
  say();
  let kapananCift = 0;
  for(const r of roller){
    const emp = (DB.employees||[]).find(e => (e.roller||[]).includes(r)) || DB.employees[0];
    if(!((r === 'musteri') ? GV.shell.setSession(null,'musteri') : GV.shell.setSession(emp.kod, r))) continue;
    for(const h of hedefler) if(!GV.shell.ekranAcilabilir(h)) kapananCift++;
  }
  if(!kapananCift) de('hiçbir rol-hedef çifti kapanmıyor — kapı ölü olabilir, değişmez ölçülemez');
  else ok(`adres kapısı ${kapananCift} rol-hedef çiftinde gerçekten REDDEDİYOR — kapı ölü değil`);
}

/* ===================================================================
   A9 — ROTA DEFTERİNİN ÖZET TABLOSU KENDİ SATIRLARIYLA TUTUYOR MU
   -------------------------------------------------------------------
   Ölçülen: §1 özet tablosu `KARŞILIĞI VAR 44 · GÖMÜLÜYOR 91` diyordu,
   defterin kendi karar satırları `42 · 93`'tü; "bugün yayında 17" satırı
   beş dilim boyunca hiç güncellenmemişti (gerçek 84). Özet, altındaki
   defterden bağımsız yaşamaya başlamıştı — ADR-R2-36'daki defter–kod
   ayrışmasının defter–defter hâli.

   ⚠️ SAYIM BENZERSİZ NUMARA ÜZERİNDEN. Ham numaralı satır 153, gerçek
   ekran 148: dosyanın sonundaki özet tablosu beş satırı (6 · 66 · 79 ·
   123 · 133) ikinci kez listeliyor. Ham satırı saymak, aynı kararı iki
   ekran sanmaktır.
   =================================================================== */
console.log('\n[A9] Rota defteri — özet tablo satırlarla tutuyor mu');
{
  const rotaYol = path.join(ROOT,'tasks','rota-haritasi.md');
  say();
  if(!fs.existsSync(rotaYol)) de('tasks/rota-haritasi.md yok — rota sayımı ölçülemedi');
  else {
    const satirlar = fs.readFileSync(rotaYol,'utf8').split('\n');
    const ilk = new Map();
    for(const l of satirlar){
      const m = l.match(/^\| *(\d+) *\|/);
      if(m && !ilk.has(+m[1])) ilk.set(+m[1], l);
    }
    const rows = [...ilk.values()];
    const ham = satirlar.filter(l => /^\| *\d+ *\|/.test(l)).length;
    const yayinda = rows.filter(l => l.includes('✅')).length;
    const kirilim = {};
    for(const l of rows){
      const m = l.match(/\*\*(KARŞILIĞI VAR|GÖMÜLÜYOR|YÖNLENDİRİLİYOR|KAPSAM DIŞI|KARAR BEKLİYOR)\*\*/);
      const k = m ? m[1] : '(işaretsiz)';
      kirilim[k] = (kirilim[k] || 0) + 1;
    }
    /* Eksik ya da tekrar eden numara — defterin kendi bütünlüğü */
    const eksik = [];
    for(let i = 1; i <= rows.length; i++) if(!ilk.has(i)) eksik.push(i);
    if(eksik.length) de(`rota defterinde eksik karar numarası: ${eksik.join(', ')}`);
    else ok(`rota defteri ${rows.length} benzersiz karar satırı (ham ${ham}, ${ham-rows.length} mükerrer) · boşluk yok`);

    /* Özet tablonun İDDİASI ile satırların ÖLÇÜMÜ */
    const iddia = {};
    for(const l of satirlar){
      const m = l.match(/^\| (KARŞILIĞI VAR|GÖMÜLÜYOR|YÖNLENDİRİLİYOR|KAPSAM DIŞI|KARAR BEKLİYOR) \| \*\*(\d+)\*\*/);
      if(m && iddia[m[1]] === undefined) iddia[m[1]] = +m[2];
    }
    const yayIddia = (satirlar.find(l => /Bugün R2'de yayında/.test(l)) || '').match(/\*\*(\d+)\*\*/);
    say();
    const ayrisan = Object.keys(iddia).filter(k => iddia[k] !== (kirilim[k] || 0))
      .map(k => `${k}: özet ${iddia[k]} ≠ satır ${kirilim[k] || 0}`);
    if(!Object.keys(iddia).length) de('§1 özet tablosu okunamadı — sayım karşılaştırılamadı');
    else if(ayrisan.length) de('§1 özet tablosu karar satırlarıyla AYRIŞIYOR — ' + ayrisan.join(' · '));
    else ok(`§1 özet tablosu ${Object.keys(iddia).length} kararın hepsinde satırlarla birebir tutuyor`);

    say();
    if(!yayIddia) de('§1 "Bugün R2\'de yayında" satırı okunamadı');
    else if(+yayIddia[1] !== yayinda) de(`§1 "bugün yayında" ${yayIddia[1]} diyor, defterde ✅ işaretli ${yayinda} satır var`);
    else ok(`yayında ${yayinda}/${rows.length} · kalan ${rows.length - yayinda} — özet tabloyla birebir`);

    /* Menüde girdisi olan her hedef defterde ✅ mi */
    say();
    const menuHedef = [...new Set(GV.shell.railOrder
      .flatMap(k => ((GV.shell.sections[k] || {}).menu || [])).map(i => i.href).filter(Boolean))];
    const isaretsiz = menuHedef.filter(h => {
      const r = rows.find(l => l.includes('`' + h + '`'));
      return r && !r.includes('✅');
    });
    if(isaretsiz.length) de(`menüde yayında olup rotada ✅ İŞARETLENMEMİŞ: ${isaretsiz.join(', ')}`);
    else ok(`${menuHedef.length} menü hedefinin defterdeki satırı da ✅ işaretli`);
  }
}

console.log(`\n${hata ? '✗ BULGU: ' + hata : '✓ TEMİZ'} · ${kontrol} kontrol koşuldu · 9 eksen\n`);
process.exit(hata ? 1 : 0);
