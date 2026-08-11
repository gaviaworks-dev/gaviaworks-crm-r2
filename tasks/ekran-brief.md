# Ekran Brief — bir ajanın ortak katmanı KEŞFETMEDEN ekran yazabilmesi için

> **Bu dosya sözleşmedir, özet değildir.** Buradaki her API imzası yayındaki
> gerçek dosyadan alındı ve `dosya:satır` ile işaretlendi. Bir şey burada
> yazmıyorsa **yoktur** — uydurma. Bu depoda sözlük daha önce birkaç kez hayalet
> API yazdı: dört bileşen adı beş oturum boyunca sözlükte listelendi, hiçbiri
> yoktu (`ui.js:1866-1880`).
> <!-- brief-dogrula:yoksay-basla -->
> Hayalet adlar (yalnız örnek, çağırma): `GV.filters()` · `GV.export()` · `GV.kanban()`.
> <!-- brief-dogrula:yoksay-bitir -->
>
> **Ajan kuralı:** ortak katmanı keşfetme, `assets/` altındaki hiçbir `.css` /
> `.js` dosyasına dokunma, canon eksen ekleme, commit atma. Eksik bir bileşen
> bulursan **yazma, rapor et**. Ortak katmanın tek sahibi ana oturumdur.
>
> Sürüm: 11 Ağustos 2026 · Dilim 1 (Müşteri ve Satış)

---

## 0. Otuz saniyelik özet

| Soru | Cevap |
|---|---|
| Ekran nedir? | Tek bir `.html` dosyası: `<head>` link'leri + boş bir `<div id="…">` + veri/kabuk script'leri + tek `<script>` bloğu |
| Kod nerede başlar? | `document.addEventListener('gv:ready', function(){ … })` |
| Liste mi çiziyorum? | `GV.list(cfg)` — kendi tablonu yazma |
| Form mu? | `GV.form(cfg)` + `GV.afterSave(cfg)` |
| Durum mu değiştiriyorum? | `GV.flow.gec(...)` — `kayit.durum = 'X'` **yasak** |
| Para mı gösteriyorum? | `GV.fin.balance(...)` — ikinci bakiye formülü **yasak** |
| Sayfayı tazeleyecek miyim? | `GV.refresh()` — `location.reload()` **yasak** |
| Veri yoksa? | "0" yazma, "—" yaz ve **neden boş olduğunu** söyle |
| CSS mi lazım? | `assets/css/*.css` içindeki sınıfları kullan; ekrana `<style>` **yazma** |

---

## 1. Sayfa iskeleti — birebir kopyalanacak

Yayındaki gerçek örnek: **`app-musteri.html:1-29`** ve **`app-odeme-linki-detay.html:1-30`**.
İkisi de aynı iskeleti kullanıyor; fark yalnız `data-sec` / `data-screen` ve
mount `id`'sinde.

```html
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Müşteriler — GaviaWorks CRM</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/shell.css">
<link rel="stylesheet" href="assets/css/ui.css">
<link rel="stylesheet" href="assets/css/r2.css">
</head>
<body data-sec="satis" data-screen="musteri">
<div id="liste"></div>

<script src="assets/data/org.js"></script>
<script src="assets/data/crm.js"></script>
<script src="assets/data/work.js"></script>
<script src="assets/data/misc.js"></script>
<script src="assets/data/ops.js"></script>
<script src="assets/data/lifecycle.js"></script>
<script src="assets/js/shell.js"></script>
<script src="assets/js/ui.js"></script>
<script src="assets/js/domain.js"></script>
<script src="assets/js/quicknote.js"></script>
<script>
document.addEventListener('gv:ready', function(){
  /* ekran kodu buraya */
});
</script>
</body>
</html>
```

### 1.1 Yükleme sırası — pazarlığa kapalı

```
veri (assets/data/*.js) → shell.js → ui.js → domain.js → quicknote.js → ekran
```

Gerekçesi kodda yazılı (`domain.js:22-23`): `ui.js` **alana kör** bileşen
katmanıdır, `domain.js` GaviaWorks iş kuralını bilir ve yüklenirken `DB`'ye
dokunur — örneğin `domain.js:1692` yüklenme anında bütün fatura durumlarını
tahsis defterinden yeniden türetir (`Fin.sonSapma = Fin.tazeleHepsi()`),
`domain.js:781` onay sayaçlarını zincirden türetir. `domain.js` veriden önce
yüklenirse bu türetmeler boş koleksiyon üstünde koşar ve **sessizce yanlış**
sonuç verir.

### 1.2 Hangi veri dosyası ne getirir

| Dosya | İçindekiler (bu dilimde kullanacakların) |
|---|---|
| `assets/data/org.js` | `DB.today` (`'2026-08-03'`) · `DB.formulaVersion` · `DB.employees` (16) · `DB.emp()` · `DB.empName()` · `DB.permMatrix` · `DB.roles` · `DB.reasonCodes` (16) · `DB.flowEntities` (15) · `DB.transitions` (11 varlık) · `DB.statusMigration` |
| `assets/data/crm.js` | `DB.customers` (12) · `DB.leads` (12) · `DB.contacts` (14) · `DB.quotes` (8) · `DB.quoteItems` · `DB.analyses` · `DB.interactions` (8) · `DB.pipelineStages` (15) · `DB.sectors` · `DB.services` · `DB.lostReasons` · `DB.referrers` (8) · `DB.commissions` |
| `assets/data/work.js` | `DB.tasks` · `DB.taskTransitions` · `DB.projects` · `DB.activities` · `DB.milestones` · `DB.deliveries` · `DB.bugs` … |
| `assets/data/misc.js` | `DB.invoices` · `DB.payments` · `DB.paymentAllocations` · `DB.contracts` · `DB.documents` · `DB.logs` · `DB.notifications` … |
| `assets/data/ops.js` | `DB.tickets` · `DB.supportPackages` · `DB.approvals` · `DB.approvalTypes` · `DB.purchases` … |
| `assets/data/lifecycle.js` | **`DB.accounts` (20)** · **`DB.opportunities` (12)** · `DB.lifecycleStages` · `DB.lifecycleOrder` · `DB.accountsByStage()` |
| `assets/data/firsat.js` | Fırsat geçiş tablosu — bkz. §7.3. **Fırsat/teklif ekranlarında zorunlu.** |
| `assets/data/odeme.js` | Yalnız ödeme ekranlarında. Bu dilimde **yükleme.** |

Kural: **kullanmadığın veri dosyasını yükleme.** Notlar (`notes.js`) hiçbir
sayfada `<script>` ile yüklenmez — `quicknote.js` onu kullanıcı çekmeceyi
açtığında `fetch` ile çeker (`quicknote.js:38-60`, karar K-11).

### 1.3 `data-sec` ve `data-screen` — kabuğun okuduğu iki öznitelik

`shell.js:971-972` bu iki değeri okur; menüde hangi girdinin `aria-current`
olacağını, breadcrumb'ı ve **yetki kapısını** buradan kurar (`shell.js:809`).

Bu dilimde kullanılacak değerler (`shell.js:57-61`):

| Ekran | `data-sec` | `data-screen` |
|---|---|---|
| `app-musteri-detay.html` · `app-musteri-form.html` | `satis` | `musteri` |
| `app-satis-akisi.html` | `satis` | `satisakisi` |
| `app-firsat-detay.html` · `app-firsat-form.html` | `satis` | `satisakisi` |
| `app-teklif.html` · `app-teklif-detay.html` · `app-teklif-form.html` | `satis` | `teklif` |

⚠️ `satisakisi` ekranı `musteri` rolüne **kapalıdır** (`shell.js:141-143`,
`SCREEN_DENY`). Ekran bunu ayrıca kontrol etmez; kabuk 403 basar.

---

## 2. shell.js'in beklediği sözleşme

### 2.1 `gv:ready` — tek giriş noktası

`shell.js:999` yetki verildiyse `gv:ready`, verilmediyse `gv:denied` atar.
Ekran kodu **yalnız** `gv:ready` içinde koşar. `DOMContentLoaded` kullanma:
o an `DB` hazır ama oturum, yetki ve sprite hazır değildir.

```js
document.addEventListener('gv:ready', function(){ … });   // app-musteri.html:46
```

⚠️ **`gv:ready` birden çok kez atılır.** `GV.refresh()` sonunda yeniden atılır
(`shell.js:923`). Yani handler'ın **idempotent** olması gerekir: her çağrıda
mount'u baştan çizmeli, kalıcı düğümlere (window, document) doğrudan
`addEventListener` **eklememeli** (bkz. §2.6 `GV.on`).

### 2.2 `GV.session` — oturum

`shell.js:967`. İki biçim vardır (`shell.js:148-150`):

```js
// personel: { emp:'EMP-001', ad:'Kerem Aydın', ini:'KA', dep:'DEP-01', depAd:'Yönetim',
//             musteri:null, kontak:null, rol:'sahip', rolAd:'Şirket Sahibi', eposta:… }
// müşteri  : { emp:null, kontak:'YTK-001', musteri:'MUS-2024-001', musteriAd:'…', rol:'musteri' }
var me = GV.session.emp;              // personel kodu ya da null
```

`emp` null olduğunda kişisel bloklar basılmaz (Hızlı Not dahil).

### 2.3 `GV.perm` — yetki

`shell.js:220-265`.

```js
GV.perm.role()            // 'sahip' | 'satismudur' | … (27 rol)
GV.perm.can('finans')     // boolean — matris anahtarları aşağıda
GV.perm.can('duzenle')    // 'yok' ise false
GV.perm.scope('gor')      // 'tum' | 'departman' | 'proje' | 'kendi' | 'musteri' | 'yok'
GV.perm.mask(deger,'maas')// yetkisizse '••••••'
```

Matris anahtarları (`org.js:157`, `DB.permMatrix`):
`gor` · `ekle` · `duzenle` · `sil` (kapsam dizesi) ·
`onay` · `finans` · `maas` · `log` · `disaAktar` (boolean) ·
`rapor` · `personel` (kapsam dizesi).

Gerçek kullanım: `app-musteri.html:48` → `var canFinans = GV.perm.can('finans');`

**Maskeleme kuralı (UID-11):** yetkisiz rolde para alanına `0` **basılmaz** —
`0` bir DEĞERDİR, "göremezsin" demek değildir. `••••••` basılır ve o hücre
çıktıya da girmez (`ui.js:1789`).

### 2.4 `GV.pageHead(cfg)` — sayfa başlığı

`shell.js:869-895`. **Liste bileşeninden ÖNCE çağrılır** — gerekçesi
`app-musteri.html:69-73`'te yazılı: `GV.list` satır sayısını
`[data-listcount]` düğümüne yazar, o düğümü `GV.pageHead` doğurur.

```js
GV.pageHead({
  eyebrow:'Müşteri ve Satış',
  title:'Müşteriler',
  sub:(DB.accounts || []).length + ' hesap · aday ve müşteri tek listede',
  actions:[
    { label:'Yeni Müşteri', icon:'i-plus', cls:'btn-acc', href:'app-musteri-form.html' },
    { label:'Kaydet', icon:'i-check', cls:'btn-acc', run:function(ev, btn){ … } }
  ]
});
```

`actions[]`: `href` verirsen `<a>`, `run` verirsen `<button>` basar. İkisi de
yoksa buton ölür — **yapma**. `cls` varsayılanı `btn-line`.

### 2.5 `GV.refresh()` — tazeleme

`shell.js:900-924`. Yaptıkları, sırayla:
1. `#rec` id'li mount düğümünü **taze kopyayla değiştirir** (dinleyici birikmesin, L-16),
2. Açık modal/çekmeceyi kapatır (`__gvClose`),
3. Açık dropdown'ları kapatır,
4. Menü/sayaçları tazeler,
5. `gv:ready` atar → ekranın kendisi yeniden çizilir.

⚠️ 1. madde **yalnız `id="rec"`** için çalışır. Mount'una başka bir ad
verdiysen (`#detayMount` gibi) düğüm yerinde kalır; ekran `gv:ready`
handler'ında `mount.innerHTML = …` ile baştan yazdığı için sonuç yine doğrudur
— ama mount'un İÇİNDEKİ düğümlere bağladığın dinleyiciler `innerHTML` ile
silinir, dışarıdakiler silinmez. Gerçek örnek: `app-odeme-linki-detay.html:209`
→ `GV.refresh()` çağırıyor, `ciz()` yeniden koşuyor.

**`location.reload()` YASAK** (L-15): mock veri bellekte durur, sayfa yeniden
yüklenince bütün mutasyon silinir. Bu yasak `ui.js:2368`'de de yazılı.

### 2.6 `GV.on(el, type, fn, key)` — kalıcı düğüme dinleyici

`shell.js:926-933`. Aynı `key` ikinci kez gelince öncekini **söker**.
`window` · `document` · kabuk düğümleri gibi `GV.refresh()`'te ölmeyen her
düğüm için zorunludur (L-16).

```js
GV.on(window, 'resize', function(){ … }, 'firsatPano-resize');
```

Mount'un içindeki düğümler için gerek yok — `innerHTML` onları zaten siliyor.

### 2.7 `GV.isBuilt(href)` · `GV.markWip(root)` · `GV.shell.ekranAcilabilir(href)`

`shell.js:736-758`, `shell.js:777-792`, `shell.js:1019`.

`BUILT` dizisi (`shell.js:736`) **yayında olan ekranların tek doğru listesidir**.
Bu listede olmayan her `href`, `markWip` tarafından otomatik `data-wip`'e
çevrilir: `href` sökülür, `role="link"`, `aria-disabled="true"` konur ve tıklanınca
"henüz yayında değil" toast'u çıkar (`ui.js:3249-3257`).

Bir `MutationObserver` (`shell.js:794-804`) `.gv-main` içine sonradan basılan
markup'ı da tarar — yani ekranın `innerHTML` ile bastığı bağlantılar da
otomatik korunur.

> **Ajan bunu bilmek zorunda ama DOKUNMAZ.** `BUILT` listesine ekran eklemek
> ana oturumun işidir. Sen hedef ekran yokmuş gibi normal `href` yaz; kabuk
> gerekirse kilitler. Sahte buton bırakmak, `href="#"` yazmak yasaktır.

### 2.8 `GV.esc(s)` · `GV.ico(name, cls)`

`shell.js:330` ve `shell.js:325`.

```js
GV.esc(h.unvan)                    // & < > " kaçışlar
GV.ico('i-plus')                   // <svg class="ic"><use href="#i-plus"></use></svg>
GV.ico('i-chev-left','ic-sm')      // ic-sm | ic-lg | ic-xl
```

**Kullanıcı verisinden gelen her şey `GV.esc`'ten geçer.** Bileşenlerin çoğu
kendi içinde escape eder (`GV.badge` · `GV.notice` · `GV.empty`), ama
`GV.dl` **etmez** (`ui.js:2488` sözleşmesi: `dt` ve `dd` çağıranın kurduğu
işaretlemedir), `GV.cell.sub` de etmez.

---

## 3. İkon sprite

`shell.js:938-951` `assets/img/icons.svg`'yi `fetch` ile belgeye enjekte eder.
**113 sembol vardır ve listede olmayan bir ad yazmak sessiz bir boşluk üretir**
(tarayıcı ekseni bunu `SPRITE — belgede olmayan ikon` diye yakalar,
`tasks/qa/tarayici.js:243`).

Tam liste:

```
i-activity i-alert i-alert-circle i-archive i-arrow-left i-arrow-right i-award
i-bell i-briefcase i-bug i-building i-calendar i-calendar-check i-car i-cart
i-chart-bar i-chart-pie i-chat i-check i-check-circle i-chev-down i-chev-left
i-chev-right i-chev-up i-clipboard i-clipboard-check i-clock i-code i-columns
i-copy i-cpu i-dot i-download i-drag i-edit i-external i-eye i-eye-off i-file
i-file-check i-filter i-filter-x i-flag i-flask i-folder i-fuel i-funnel
i-gauge i-gavia i-git i-graduation i-grid i-home i-hourglass i-image i-inbox
i-info i-kanban i-key i-layers i-link i-list i-lock i-logout i-mail i-megaphone
i-menu i-milestone i-minus i-more i-package i-palette i-paperclip i-pause
i-percent i-phone i-play i-plus i-printer i-quote i-receipt i-refresh i-search
i-send i-server i-settings i-sheet i-shield i-shield-check i-sliders i-sprint
i-stamp i-star i-sun i-support i-table i-tag i-target i-tasks i-timer i-trash
i-trend-down i-trend-up i-truck i-upload i-user i-user-check i-user-plus
i-users i-wallet i-wrench i-x i-x-circle
```

Bu dilim için kullanışlı eşlemeler: müşteri → `i-building`, yetkili → `i-users`,
fırsat → `i-funnel`, teklif → `i-quote`, proje → `i-briefcase`, finans →
`i-wallet`, destek → `i-support`, belge → `i-file`, aktivite → `i-activity`,
özet → `i-list`.

---

## 4. `GV.list` — liste bileşeni

`ui.js:737-1895`. **PROMPT.md §6'nın tamamını tek yerden karşılar:** arama,
gelişmiş filtre, kolon yönetimi, sekmeler, toplu işlem, sayfalama, çıktı,
arşiv toggle, tablo/kart/kanban/takvim görünümü, URL senkronu, satır kapsamı,
maskeleme, iskelet yükleme, boş durum, hata durumu.

### 4.1 Yapılandırma sözleşmesi

Yayındaki tam örnek: **`app-musteri.html:83-261`**. Alanlar:

```js
var api = GV.list({
  mount:'#liste',            // seçici ya da düğüm — ZORUNLU
  id:'musteri',              // localStorage anahtarı (kolon + kayıtlı görünüm)
  key:'kod',                 // satır kimliği alanı — ZORUNLU
  source:function(){ return DB.accounts; },   // dizi ya da dizi dönen işlev

  exportName:'musteriler', exportTitle:'Müşteri Listesi',
  pageSize:10,                                // varsayılan 10
  views:['table','card'],                     // 'table'|'card'|'kanban'|'calendar'
  archive:false,                              // arşiv toggle'ını kapatır
  export:false,                               // çıktı düğmesini kapatır
  urlSync:false,                              // adres çubuğu senkronunu kapatır
  delay:0,                                    // iskelet süresi (ms), varsayılan 260

  search:{ placeholder:'…', fields:['kod','unvan'], extra:function(r){ return …; } },
  defaultSort:'unvan', defaultDir:'asc',

  kpis:[ … ],  tabs:[ … ],  columns:[ … ],  filters:[ … ],
  rowClass:function(r){ return 'is-passive'; },
  card:function(r,i){ return '…'; },          // views:['card'] için
  mobile:function(r,i){ return '…'; },        // 980px altı satır markup'ı
  kanban:{ groupBy:'asama', columns:[…], groupOf:function(r){…}, card:function(r){…} },
  calendar:{ dateField:'tarih', title:function(r){…}, tone:function(r){…}, href:function(r){…} },
  rowActions:[ … ], bulk:[ … ],
  scopeField:{ kendi:'sorumlu', departman:'dep', musteri:'musteri' },
  countTarget:'#birSayacDugumu',
  emptyState:{ icon:'i-building', title:'…', desc:'…' },
  onRender:function(tumSatirlar, state){ … }
});
```

Dönüş yüzeyi (`ui.js:1881-1894`) — ekran dışarıdan çağırabilir:
`api.refresh()` · `api.setTab(k)` · `api.setFilter(k,v)` · `api.setView(v)` ·
`api.openCols()` · `api.openFilters()` · `api.openExport(rows)` ·
`api.exportRows(list, fmt)` · `api.exportCell(c,r,i)` · `api.state`.

### 4.2 `columns[]`

```js
{ key:'unvan', label:'Firma',
  width:'26%',                 // th genişliği
  cellClass:'cell-wrap',       // 'num' | 'center' | 'cell-wrap' | …
  locked:true,                 // kolon yöneticisinde kapatılamaz
  visible:false,               // varsayılan gizli
  sortable:false,              // sıralanamaz
  sortValue:function(r){ … },  // sıralama anahtarı (görünenden farklıysa)
  exportValue:function(r){ … },// çıktı değeri (ham değer, rozet değil)
  perm:'finans',               // yetkisizde hücre maskelenir
  mask:function(r){ … },       // SATIR bazlı maskeleme
  render:function(r,i){ return '…HTML…'; } }
```

`render` verilmezse `esc(r[key])` basılır, boşsa `—`.
`exportValue` verilmezse çıktı **ekranın gösterdiği metni** alır
(`ui.js:1788-1794`: `render` HTML'i düz metne çevrilir) — "ekranda dolu,
çıktıda boş" sınıfı kökten kapalıdır.

**Hazır kolon fabrikaları** (`ui.js:2935-3022`) — tekrar yazma:

```js
GV.cols.money('toplam','Tutar', { signed:true, cur:'₺', perm:'finans', sub:function(x){…} })
GV.cols.num('adet','Adet', { basamak:1 })
GV.cols.pct('ilerleme','İlerleme', { bar:true, esik:50 })
GV.cols.date('tarih','Tarih', { plain:true, done:function(x){…}, bosMetin:'planlanmadı' })
GV.cols.durum('durum','Durum', { deger:function(x){…}, extra:function(x){…} })
GV.cols.kisi('sorumlu','Sorumlu', { sub:function(x){…} })
GV.cols.kod('kod','Kayıt', { href:function(x){ return 'app-…?id='+x.kod; }, sub:… })
GV.cols.tbl({ … })       // rapor tablosu iskeleti
GV.cols.bos('Başlık','Açıklama','i-inbox')   // emptyState üreticisi
```

Geçişli alanlar fabrikadan geçer (`ui.js:2929`):
`perm` · `mask` · `width` · `locked` · `sortable` · `sortValue` · `group` · `footer`.

### 4.3 Hücre yardımcıları — `GV.cell` (`ui.js:2880-2918`)

```js
GV.cell.faint('—')                       // <span class="u-faint">
GV.cell.sub(html)                        // <span class="cell-sub"> — HTML alır, escape ETMEZ
GV.cell.mny(1500, { signed:true })       // para; null ise '—'
GV.cell.num(12, { basamak:1, tone:'ok' })
GV.cell.gun(5, 'warn')
GV.cell.oran(72, 50)                     // eşiğe göre renkli %
GV.cell.link('app-x.html?id=1','KOD', altHtml)
GV.cell.mrow(main, kod, [meta…], badges) // mobil satır iskeleti
```

⚠️ `GV.fmt` **biçimlendirir**, `GV.cell` **HTML üretir**. `GV.fmt.mny` diye bir
şey **yoktur** (`ui.js:2876-2878` bu karışıklığı açıkça uyarıyor).

### 4.4 `kpis[]`

```js
{ label:'Toplam hesap', icon:'i-building', tone:'ok',
  perm:'finans',                       // yetkisizde MASKELENİR (0 basmaz!)
  mask:function(){ return …; },        // perm yerine işlev
  format:GV.fmt.moneyK,                // varsayılan GV.fmt.num
  href:'app-…',                        // verilirse KPI tıklanabilir
  meta:function(base){ return '…'; }, metaTone:'warn',
  calc:function(base, filtrelenmis){ return sayi; } }
```

`calc`'e iki argüman gelir: `base` = arşiv süzgecinden geçmiş **kapsamlı** tüm
kayıtlar, ikincisi = ekrandaki filtrelenmiş küme (`ui.js:945-950`).

### 4.5 `tabs[]` ve `filters[]`

```js
tabs:[{ key:'tumu', label:'Tüm Hesaplar', icon:'i-list', filter:null },
      { key:'aday', label:'Aday', icon:'i-user-plus', filter:function(h){ return h.evre === 'ADAY'; } }]
```
Sekme sayacı otomatik basılır (`ui.js:969`). **Sekme listesini elle yazma** —
sözlükten üret; gerçek örnek `app-musteri.html:103-115`
(`DB.lifecycleOrder.map(...)`).

```js
filters:[
  { key:'evre', label:'Yaşam evresi', type:'multi',
    options:[{ value:'ADAY', label:'Aday' }, …] },
  { key:'sorumlu', label:'Sorumlu', type:'select', options:[…] },
  { key:'tarih',  label:'Tarih', type:'daterange' },
  { key:'tutar',  label:'En az tutar', type:'text' },
  { key:'firsatVar', label:'Açık fırsatı olanlar', type:'select',
    options:[{ value:'var', label:'…' }],
    test:function(r, v){ return …; } }          // özel süzgeç yordamı
]
```

`options` elemanı ya düz metin ya `{value,label}` olur. `test` verilirse
alan adı eşleşmesi yerine o yordam kullanılır.
**Filtre değişince sayfa 1'e döner** — bileşen yapar (`ui.js:1360 reset()`).

### 4.6 `rowActions[]` ve `bulk[]` — ölü buton sözleşmesi

```js
rowActions:[
  { key:'ac', icon:'i-external', label:'Hesabı aç',
    href:function(r){ return 'app-musteri-detay.html?id=' + r.kod; } },
  { key:'sil', icon:'i-trash', label:'Sil', cls:'is-danger',
    show:function(r){ return GV.perm.can('sil'); },     // false ise HİÇ basılmaz
    run:function(rec, render){ … } }
]
bulk:[
  { key:'disa', label:'Dışa aktar', icon:'i-download', export:true },   // yordamı BİLEŞENDE
  { key:'ata',  label:'Sorumlu ata', icon:'i-user-check',
    perm:'duzenle',                                     // yetkisizde HİÇ basılmaz
    show:function(secilenIdler){ return …; },
    confirm:'{n} kayıt işlenecek. Onaylıyor musunuz?',
    tone:'danger',
    run:function(secilenIdler){ … } }
]
```

**Sözleşme (UID-27):** `run` de `href` de yoksa aksiyon **ölüdür** — bileşen onu
`disabled` + "bu sürümde yok" etiketiyle basar (`ui.js:1104`, `ui.js:1281`).
`run`suz aksiyona **asla başarı mesajı basılmaz**. `run` yazamıyorsan aksiyonu
hiç ekleme ya da raporla.

### 4.7 Satır kapsamı — `scopeField`

`ui.js:823-869`. `GV.perm.scope('gor')` `'kendi'`/`'departman'`/`'musteri'`
döndürdüğünde bileşen listeyi süzer; eşleme ekranın bildirdiği alandır:

```js
scopeField:{ kendi:'sorumlu', departman:'dep', musteri:'musteri' }
// değer bir ALAN ADI ya da bir YORDAM olabilir:
scopeField:{ musteri:function(r){ return (DB.projects.filter(…)[0]||{}).musteri; } }
```

Süzgeç uygulandığında ekranın üstüne bir `.gv-scopebar` şeridi basılır — kapsam
**sessiz çalışmaz**. Eşlenmemiş kapsam da söylenir. **Bu dilimdeki her liste
`scopeField` bildirmelidir** (satış temsilcisi `gor:'kendi'`).

### 4.8 Bilinmesi gereken davranışlar

- Kanban ve takvim görünümünde **sayfalayıcı basılmaz**, kayıtların tamamı gösterilir (`ui.js:1337`).
- Sayfa/sekme/filtre/sıralama/görünüm **URL'de saklanır** (`t` · `q` · `p` · `s` · `d` · `v` · `arsiv` · `f_<key>`) — `ui.js:786-818`.
- Kolon düzeni `localStorage`'da `gv.cols.<id>` anahtarında saklanır.
- Tablo **ve** mobil kart listesi aynı veriden birlikte basılır; CSS hangisinin görüneceğini seçer. İkinci markup yazma (`ui.js:1116-1133`).

---

## 5. `GV.form` — form bileşeni ve "CreateEditPage" deseni

`ui.js:1974-2361`. Bu depoda `CreateEditPage` **adında bir bileşen yoktur**;
"oluştur/düzenle sayfası" bir **desendir**: `GV.pageHead` + `GV.form` +
`GV.afterSave`. Aşağıdaki iskelet o desenin tamamıdır.

### 5.1 Yapılandırma

```js
var form = GV.form({
  mount:'#formMount',
  id:'musteriForm',                 // beforeunload anahtarı
  record:mevcutKayit || {},         // düzenlemede kayıt, oluşturmada {}
  tabs:[{ key:'temel', label:'Temel bilgiler', icon:'i-building' },
        { key:'ek',    label:'Daha fazla bilgi', icon:'i-list' }],   // OPSİYONEL
  aside:function(veri, api){ return '…HTML…'; },                     // OPSİYONEL, canlı sağ panel
  sections:[
    { title:'Kimlik', desc:'…', icon:'i-building', tab:'temel', fields:[ … ] }
  ]
});
```

`tabs` verilmezse form düz akar. Sekmesi belirtilmeyen bölüm **ilk panele**
düşer, kaybolmaz (`ui.js:2111-2127`). `aside` her alan değişiminde yeniden
çizilir (`ui.js:2145-2152`).

### 5.2 Alan sözleşmesi

```js
{ key:'unvan', label:'Firma / unvan', type:'text',
  cols:6,                    // 12'lik ızgara: f-col-1 … f-col-12, varsayılan 6
  required:true,             // ya da function(veri){ return …; }
  readonly:true,             // türetilmiş alan — [3.1.11]
  hint:'…', placeholder:'…',
  min:0, max:100, rows:4, options:[…], multiple:true,
  currency:'₺', onLabel:'Aktif', checkLabel:'…',
  showIf:function(veri){ return veri.tip === 'Kurumsal'; },
  validate:function(deger, veri){ return 'hata mesajı' || ''; } }
```

`type` değerleri (`ui.js:2000-2056`):
`text` (varsayılan) · `textarea` · `select` · `switch` · `checkbox` · `radio` ·
`file` · `money` · `percent` · `date` · `number` · `email` · `tel` · `url`.

Yerleşik doğrulama: `required` · `email` biçimi · `tel` ≥10 hane ·
`url` `http(s)://` ile başlar · `min`/`max`.

`showIf` sözleşmesi (`ui.js:2214-2222`): gizli alan **doğrulanmaz** ve
`read()`'te **boş döner** — görünmeyen alan formun parçası değildir.

### 5.3 Dönüş yüzeyi

```js
form.submit()      // doğrular; hata varsa toast + null döner, temizse veriyi döner
form.validate()    // hata dizisi
form.read()        // { key: değer } — anlık okuma
form.sync()        // showIf'i yeniden değerlendir
form.aside()       // sağ paneli yeniden çiz
form.tab('ek')     // sekme değiştir
form.isDirty() / form.setDirty(false)
form.el            // mount düğümü
```

Kaydetmeden çıkışta `beforeunload` uyarısı bileşende (`ui.js:2332-2337`),
`GV.on` ile tekil anahtar üzerinden bağlı — sen bağlama.

### 5.4 `GV.afterSave(cfg)` — kayıttan sonra nereye

`ui.js:2394-2418`. **Kaydettikten sonra `location.href` yazma, bunu çağır.**

```js
GV.afterSave({
  kod:'MUS-2026-012',
  liste:'app-musteri.html',
  detay:'app-musteri-detay.html',
  yeni:true,
  mesaj:'Hesap oluşturuldu; yaşam evresi Aday olarak başladı.',
  alt:[{ label:'Fırsat ekle', href:'app-firsat-form.html?hesap=MUS-2026-012', cls:'btn-acc' }],
  gecikme:700            // varsayılan 700 ms
});   // → 'detay' | 'liste' döner
```

Karar yordamda: hedef detay ekranı **yayında değilse** ya da kullanıcının
dosyaya yetkisi yoksa listeye döner (`GV.shell.ekranAcilabilir` ile ölçer).
Mesaj `sessionStorage`'a yazılır ve hedef sayfada `#gvFlash` şeridine **bir kez**
basılır (`ui.js:2421-2446`). Ekran hedefte ayrıca "az önce ne oldu" bloğu yazmaz.

### 5.5 Form ekranı iskeleti — tam desen

```js
document.addEventListener('gv:ready', function(){
  var q   = new URLSearchParams(location.search);
  var kod = q.get('id');
  var rec = kod ? (DB.accounts || []).filter(function(x){ return x.kod === kod; })[0] : null;
  if(kod && !rec){ /* §10 — kayıt yok durumu */ return; }

  GV.pageHead({
    eyebrow:'Müşteri ve Satış',
    title:rec ? rec.unvan : 'Yeni Müşteri',
    sub:rec ? rec.kod : 'Yeni hesap · yaşam evresi Aday olarak başlar',
    actions:[
      { label:'Vazgeç', icon:'i-arrow-left', href:'app-musteri.html' },
      { label:'Kaydet', icon:'i-check', cls:'btn-acc', run:kaydet }
    ]
  });

  var form = GV.form({ mount:'#formMount', id:'musteriForm', record:rec || {}, sections:[…] });

  function kaydet(){
    var v = form.submit();
    if(!v) return;                       // doğrulama düştü, bileşen zaten söyledi
    … mutasyon (ortak yordam üzerinden) …
    GV.afterSave({ kod:…, liste:'app-musteri.html', detay:'app-musteri-detay.html', yeni:!rec });
  }
});
```

---

## 6. Detay ekranı deseni

Yayındaki tam örnek: **`app-odeme-linki-detay.html:38-230`**.

1. `?id=` oku, kaydı bul. Yoksa `GV.pageHead` + `GV.errorState` bas ve **çık**
   (`app-odeme-linki-detay.html:46-53`).
2. Müşteri oturumuna karşı kapı: `GV.guardRecord(...)` (`ui.js:662-688`).
   `false` dönerse ekran yetkisiz durumunu **bastı**, çağıran hemen `return` eder.
3. `GV.pageHead` bas.
4. `mount.innerHTML = …` ile gövdeyi çiz.
5. Dinleyicileri mount içinden bağla.
6. Mutasyondan sonra `GV.refresh()`.

```js
if(!GV.guardRecord({ mount:'#detayMount', musteri:h.kod, kod:h.kod,
                     eyebrow:'Müşteri ve Satış', title:h.unvan,
                     geriHref:'app-musteri.html', geriLabel:'Müşteri listesine dön' })) return;
```

### 6.1 Sekmeler — `GV.tabs`

`ui.js:1939-1969`. İşaretleme sözleşmesi: tetikleyicilerde `role="tab"` +
`data-tab="<key>"`, panellerde `role="tabpanel"` + `data-panel="<key>"`.
Aktif sekme `location.hash`'e yazılır ve sayfa açılışında geri okunur.
Sekme değişince `document`'a `gv:tab` olayı atılır — **tembel yükleme** kancası:

```js
var tabs = GV.tabs('#musteriSekme');
document.addEventListener('gv:tab', function(e){
  if(e.detail.key === 'finans') finansSekmesiniCiz();
});
```

⚠️ `GV.tabs` panelleri **belge genelinde** arar (`ui.js:1943`) — aynı sayfada
iki sekme kümesi kurma.

### 6.2 Detayda kullanılacak diğer bileşenler

```js
GV.dl([['Sektör', GV.esc(h.sektor)], ['Vergi no', GV.esc(h.vergiNo)]], { skipEmpty:true })
GV.activity(GV.audit.oku(h.kod, 20))     // aktivite timeline'ı
GV.chain([{ rol:'Satış Müdürü', kisi:'Selin Dağdeviren', durum:'Onaylandı', tarih:'…', not:'…' }])
GV.badge('Aktif')                        // ton sözlükten
GV.user('EMP-002', { sm:true })          // avatar + ad
GV.progress(72)
GV.dateCell('2026-08-25')                // gecikme/yaklaşma renklendirmesi
GV.notice({ tone:'warn', icon:'i-alert', title:'…', text:'…', actions:[{label,href,cls}] })
GV.empty({ icon:'i-inbox', title:'…', desc:'…', action:'<a class="btn btn-acc" …>' })
GV.errorState({ title:'…', desc:'…' })
GV.skeleton('row', 6)                    // 'row' | 'card'
GV.doc({ baslik:…, altBilgi:…, bolumler:[…] })   // kayıttan yazdırılabilir belge
```

`GV.dl` **escape etmez** — değer tarafını sen `GV.esc`'ten geçir (`ui.js:2488`).
`GV.activity` kişi kodunu (`EMP-*` / `YTK-*`) ada kendisi çevirir (`ui.js:2460`).

---

## 7. Durum geçişi — `GV.flow`

`domain.js:269-468`. **Tek mutasyon noktasıdır.** Ekran `kayit.durum = 'X'`
**yazmaz**; bunu yapmak bu deponun beş oturum boyunca en pahalı hatasıydı
(`domain.js:113-127`).

### 7.1 Buton üretimi — `GV.flow.adimlar(tur, kod)`

`domain.js:321-349`. Dönen her adım:

```js
{ hedef:'Gönderildi', birincil:true, etiket:'Müşteriye Gönder',
  tone:'btn-acc', izin:true, eksik:[], gerekce:false, kapi:null, istisnaRol:[] }
```

Ekran **kendi durum listesini yazmaz** — ne gelirse onu basar. Yayındaki
gerçek örnek `app-odeme-linki-detay.html:151-160`:

```js
var adimlar = GV.flow.adimlar('quote', q.kod) || [];
adimlar.map(function(a){
  return '<button type="button" class="btn ' + (a.birincil ? 'btn-acc' : 'btn-line') + ' btn-sm" ' +
    'data-hedef="' + GV.esc(a.hedef) + '"' +
    (!a.izin ? ' disabled title="Bu geçiş için yetkiniz yok"' : '') +
    (a.eksik && a.eksik.length ? ' disabled title="Eksik alan: ' + GV.esc(a.eksik.join(', ')) + '"' : '') +
    '>' + GV.esc(a.etiket) + '</button>';
}).join('');
```

### 7.2 Geçişi uygulama — `GV.flow.gec(tur, kod, hedef, ek, opts)`

`domain.js:354-418`.

```js
var r = GV.flow.gec('quote', 'TKL-2026-014', 'Kazanıldı',
                    { musteriOnay:'Onaylandı' },              // ek: geçişle yazılacak alanlar
                    { neden:'MUSTERI', not:'…', istisna:false });
if(r.ok === false){ GV.toast(GV.flowHata(r), 'danger'); return; }
GV.refresh();
```

**Hata çevirisi tek yerdedir:** `GV.flowHata(r)` (`ui.js:571-581`).
Kendi hata metnini yazma. `why` değerleri ve karşılıkları:

| `r.why` | Anlamı | `GV.flowHata` çıktısı |
|---|---|---|
| `'yetki'` | Rol/ilişki yetmiyor (`r.roller`) | "Bu geçişi yapma yetkiniz yok — gereken: …" |
| `'zorunlu'` | Boş zorunlu alan (`r.eksik`) | "Önce şu alanlar doldurulmalı: …" |
| `'gerekce'` | Neden kodu + açıklama şart (`r.mesaj`) | mesajın kendisi |
| `'kapi'` | Ek engel yordamı reddetti (`r.mesaj`, `r.istisnaMumkun`, `r.roller`) | mesajın kendisi |
| `'tahsil'` / `'tahsis'` / `'kaynak'` | Finans/onay zinciri reddi | mesajın kendisi |
| başka metin | "kayıt yok", "… durumuna geçilemez" | ham metin |

Başarıda: `{ ok:true, kayit, eski, yeni, istisna:bool, bildirim:[] }`.

**Gerekçe gerektiren geçişte `GV.action` kullan** (§8), elle modal kurma.
Gerekli mi diye kurala bak — yayındaki örnek `app-odeme-linki-detay.html:203-205`:

```js
var kural = (DB.transitions.quote || {})[q.durum] || {};
var hk    = (DB.transitions.quote || {})[hedef] || {};
var gerekceli = kural.gerekce || hk.girisGerekce;
```

`gerekce` = **bu durumdan çıkmak** gerekçe ister; `girisGerekce` = **bu duruma
girmek** gerekçe ister (`domain.js:369-377`). İkisi ayrı şeydir.

### 7.3 Bu dilimde kullanacağın varlıklar

| `tur` | Koleksiyon | Durum alanı | Tablo |
|---|---|---|---|
| `quote` | `DB.quotes` | `durum` | `org.js:504-515` — 10 durum |
| `analysis` | `DB.analyses` | `durum` | `org.js:518-527` |
| `contract` | `DB.contracts` | `durum` | `org.js:492-502` |
| `opportunity` | `DB.opportunities` | `asama` | **`assets/data/firsat.js`** — 15 aşama |

Teklif tablosu (`org.js:504`) özet:
`Taslak → İç Onay → Onaylandı → Gönderildi → Müşteri İncelemesi →
{Kazanıldı | Kaybedildi | Müzakere/Revizyon | Süresi Doldu}`.
`Taslak → İç Onay` geçişinde **`teklifOnAnaliz` kapısı** vardır
(`domain.js:189-196`): teklif onaylı bir ön analize bağlı olmalıdır; istisna
rolleri `sahip` ve `genelmudur`. `Kaybedildi` girişinde gerekçe zorunludur.

Fırsat tablosu `assets/data/firsat.js` içindedir ve `DB.pipelineStages`'ten
(15 aşama, `crm.js:42-58`) türetilmiştir. Aşama atlanamaz; `Kazanıldı`
geçişinde **`firsatKazanma` kapısı** çalışır (§9.2).

### 7.4 Yasaklar

- `rec.durum = …` · `rec.asama = …` · `rec.evre = …` **yazma**.
- Kendi `next` listeni yazma; `GV.flow.adimlar` ne veriyorsa o.
- Uzun bir statü `<select>`i basma — yapılabilir işlem **butondur**.
- `GV.flow.gec` başarısızken başarı toast'u basma.

---

## 8. `GV.action` — ortak eylem penceresi

`ui.js:489-566`. Şartname §6.2'nin yedi bileşenini tek yerde toplar. Geçişi
**kendi yürütmez**; `run(veri)` çağırır — motor tek mutasyon noktası olmayı sürdürür.

```js
GV.action({
  eylem:'Reddet',                      // 'Onayla'|'Reddet'|'İade Et'|'Revizyon İste'|
                                       // 'İptal Et'|'Geri Çek'|'Devret'|'Yeniden Aç'
  kayit:{ kod:q.kod, baslik:q.firma },
  sonuc:'Bu teklif "Kaybedildi" durumuna geçecek.',
  gerekce:true,                        // neden kodu + açıklama ZORUNLU
  nedenTuru:'ret',                     // 'ret'|'iade'|'revizyon'|'iptal'|'geri'|'istisna'|'cikis'
  ek:true,                             // dosya/kanıt alanı
  onaycilar:[{ deger:'EMP-001', ad:'Kerem Aydın' }],
  etkilenen:['SZL-2026-004 sözleşme taslağı'],
  geriDonusYok:true,
  tone:'danger',
  run:function(v){                     // v = { neden, not, kisi, dosya }
    var r = GV.flow.gec('quote', q.kod, 'Kaybedildi', null, { neden:v.neden, not:v.not });
    if(r.ok === false) return { ok:false, mesaj:GV.flowHata(r) };
    GV.refresh();
    return { mesaj:q.kod + ' kaybedildi olarak işaretlendi', auditKod:r.kayit.kod };
  }
});
```

`eylem` adı ton ve ikonu belirler (`ui.js:479-487`). `nedenTuru` neden kodu
listesini daraltır (`DB.reasonCodes`, `org.js:445-467`, 16 kod).
`run` vermezsen pencere "bu eylem henüz bir yordama bağlı değil" der ve
**başarı varsaymaz** (`ui.js:553-556`, ders L-23).

Gerçek kullanım: `app-odeme-linki-detay.html:212-222`.

Diğer overlay'ler: `GV.modal(cfg)` (`ui.js:367`) · `GV.confirm(cfg)` → Promise
(`ui.js:424`) · `GV.result(cfg)` (`ui.js:442`) · `GV.drawer(cfg)` (`ui.js:583`) ·
`GV.toast(text, 'ok'|'danger'|'warn'|'info', ms)` (`ui.js:342`).

### 8.1 Drawer — yetkili ve iletişim işleri burada açılır

`ui.js:583-635`. **Yetkili ve iletişim ayrı ekran değildir** (rota haritası
§3.3, satır 13-16): müşteri detayında drawer/modal olarak açılır.

```js
GV.drawer({
  title:'Yetkili ekle',
  side:'right',                                   // 'left' de olur
  body:'<div id="yetkiliForm"></div>',
  onMount:function(govde, panel){                 // panel DOM'a girdikten SONRA
    GV.form({ mount:govde.querySelector('#yetkiliForm'), sections:[…] });
  },
  onOpen:function(panel, close){ … },
  actions:[
    { label:'Vazgeç', cls:'btn-line' },
    { label:'Kaydet', cls:'btn-acc', close:false, onClick:function(close, panel){
        … ; if(hata) return false;                // false döndürürsen kapanmaz
        close();
      } }
  ]
});
```

⚠️ **Modal ve drawer markup'ı `.gv-page` içine basılmaz** — bileşenler
`document.body`'ye basar (stacking context kuralı, L-18). Sen de kendi
overlay'ini kurma; bu bileşenleri kullan.

---

## 9. Alan yordamları — bu dilimde çağıracakların

### 9.1 `GV.audit` — denetim izi

`domain.js:58-110`.

```js
GV.audit.yaz({ kayit:'MUS-2026-008', islem:'Yaşam evresi ilerletildi',
               eski:'NITELIKLI', yeni:'MUSTERI',
               tone:'ok', icon:'i-check-circle',
               modul:'Müşteri' /* verilirse sistem günlüğüne de yazar */ });

GV.audit.oku('MUS-2026-008', 20)   // iki defteri birleştirip zaman sırasına dizer
GV.audit.denetle()                 // { olay, sistem, toplam, kayitKodsuz, aktorsuz }
```

`islem` ve `metin` aynı şeydir (`domain.js:64-67`). Kişi oturumdan alınır,
uydurulmaz. `GV.flow.gec` zaten kendi kaydını yazar — geçişten sonra **ikinci
kez** audit yazma.

### 9.2 `GV.lifecycle` — yaşam evresi (§5.1 · §5.3)

**`domain.js` içinde tanımlıdır.** Evre değiştirmenin tek kapısıdır; `h.evre = …`
yazmak yasaktır.

```js
GV.lifecycle.evreler()                 // DB.lifecycleOrder
GV.lifecycle.sonraki('NITELIKLI')      // ['MUSTERI','KAYIP','ADAY'] — DB.lifecycleStages'ten
GV.lifecycle.hesap('MUS-2026-008')     // DB.accounts kaydı ya da null
GV.lifecycle.eksikAlanlar(hesap)       // MUSTERI evresi için eksik zorunlu alanlar
GV.lifecycle.gec(hesapKod, 'MUSTERI', { neden:'…', not:'…' })
//   → { ok:true, hesap, eski, yeni }
//   → { ok:false, why:'gecis'|'zorunlu'|'yetki'|'kayit', mesaj, eksik:[] }
```

`MUSTERI` evresine geçişte **kapı REDDEDER**: §5.2 gereği vergi no, telefon
veya e-posta, sorumlu ve unvan dolu olmalıdır. Uyarı değil, ret.
Geçiş `GV.audit`e yazılır.

### 9.3 `GV.sales` — mükerrer kontrolü ve kazanma zinciri

`domain.js:2417-2634` (R1 zinciri) + R2 eklentileri.

```js
GV.sales.hesapMukerrer({ unvan:'…', vergiNo:'…', tel:'…', eposta:'…', web:'…', haric:'MUS-…' })
// → [{ hesap, nedenler:['aynı vergi numarası', …], kesin:true }]  — puana göre sıralı
```

Beş eksen: vergi no · unvan (normalize, `ltd/a.ş/şti/san/tic` ekleri atılır) ·
e-posta · normalize telefon (son 10 hane) · e-posta alan adı
(`domain.js:2419-2457`). **Vergi no tek başına kesin kanıttır** (`kesin:true`),
diğerleri işarettir.

**Otomatik birleştirme YOKTUR** (§5.3 son paragraf). Ekran eşleşmeyi gösterir,
kullanıcı seçer: "mevcut hesabı aç" · "yine de yeni kayıt" (yönetici istisnası,
gerekçeli).

```js
GV.sales.firsatKazan(firsatKod, { neden:…, not:…, teklif:'TKL-…' })
// 1) fırsat aşaması 'Kazanıldı' → GV.flow.gec('opportunity', …)
// 2) AYNI hesabın evresi MUSTERI → GV.lifecycle.gec(...)   ← yeni kopya ÜRETİLMEZ
// 3) dönüşüm GV.audit'e yazılır
// → { ok:true, hesap, firsat, evreDegisti:bool, oneriler:[{tur,label,href}] }
```

`oneriler` §5.3 adım 4'ün karşılığıdır: onaylı teklif / sözleşme / proje
oluşturma bağlantıları. **Ekran kendi zincirini kurmaz.**

⚠️ `GV.sales.kazanildi(teklif, opts)` (`domain.js:2514`) **R1 zinciridir** ve
yeni `MUS-` kaydı üretir. §5.3'e aykırıdır — **bu dilimde çağırma.**

### 9.4 `GV.fin` — para

`domain.js:806-1072`. **İkinci bakiye kaynağı yasaktır.**

```js
GV.fin.balance('FTR-2026-018')
// → { fatura, brut, tahsil, acik, oran, tamOdendi, kismi }  ya da null
GV.fin.odemeDurum(f)   // 'Ödendi' | 'Kısmi Ödendi' | 'Ödenmedi' — TÜRETİLİR
GV.fin.gecikti(f) / GV.fin.gecikmeGun(f)
```

Fatura `durum` alanı **türetilmiş bir görünümdür**; hiçbir ekran onu yazmaz.
Müşteri detayının Finans sekmesi bakiyeyi **yalnız** `GV.fin.balance`'tan okur.
`f.toplam` KDV **dahildir** (brüt eksen, `domain.js:814`).

### 9.5 Diğerleri

```js
GV.approval.bekleyen(kisi) / .adim(tur, kayitKod) / .karar(onayKod, karar, opts)   // domain.js:631-774
GV.proje.acik(p) / .kapali(p) / .geciken(p) / .sure(kod) / .maliyet(kod)           // domain.js:1509+
GV.destek.acik(t) / .kapali(t) / .paketOf(t)                                       // domain.js:1710+
GV.calendar.isGunu(bas, bit) / .mesaiDakika(bas, bit)                              // domain.js:480+
GV.notes.*                                                                          // domain.js:2218+ — yalnız Hızlı Not
```

**Bu tanımları ekranda yeniden yazma.** "Bu proje açık mı" sorusunun cevabı yedi
ekranda ayrı yazılıydı ve sözlük değişince yedisi birden sessizce yanlışa
düşerdi (`domain.js:1532-1547`).

---

## 10. Boş durum, hata durumu ve **backend payı beyanı**

### 10.1 Boş ≠ sıfır

Ders L-13: ölçülemeyen bir şeye `0` yazmak, ölçülmüşü ölçülmemiş göstermenin
en pahalı hâlidir. Gerçek örnek `app-musteri.html:154-161`: lead kaynaklı
hesapta proje sayacı **yoktur**, o yüzden `0` değil `—` basılır.

```js
if(h.aktifProje == null) return '<span class="u-faint">—</span>';
```

Üç ayrı cümle, üç ayrı biçim:

| Durum | Ne basılır |
|---|---|
| Kayıt var, değer sıfır | `0` |
| Değer yok / türetilemedi | `—` + gerekiyorsa `GV.cell.faint` açıklaması |
| Koleksiyon hiç yüklü değil | `GV.notice({tone:'warn', …})` — "bu ekranda ölçülemedi" |
| Süzgeç sonucu boş | `emptyState` / `GV.empty` — "filtreyi değiştirin" |
| Yükleme hatası | `GV.errorState` |

### 10.2 Backend payı beyanının biçimi

Prototipte karşılığı olmayan her yetenek **ekranda açıkça** yazılır; taklit
edilmez. Yayındaki iki biçim:

**(a) Sayfa üstü uyarı şeridi** — `app-odeme-linki-detay.html:77-79`:

```js
GV.notice({ tone:'warn', icon:'i-alert',
  title:'TEST kipi — ' + GV.esc(l.saglayici),
  text:'Ödeme sağlayıcısı seçilmedi. Gerçek kart formu yoktur, gerçek tahsilat yapılmaz.' })
```

**(b) Madde madde liste** — `app-odeme-linki-detay.html:167-180`: başlık
"Backend payı", sağda madde sayısı, her madde `kod` + `madde` + `bolum` ile,
altında tek cümlelik dürüst beyan:

> "Bu maddeler prototipte **uygulanmadı** ve **taklit edilmedi**.
> Canlıya çıkmadan önce karşılanması zorunludur."

Bu dilimde beyan edilmesi gereken maddeler (ekranın altına, `GV.notice` ya da
`gv-card` içinde bir liste olarak):

| Kod | Madde | Şartname |
|---|---|---|
| `BE-S1` | Mükerrer kontrolü istemcide koşar; sunucuda benzersizlik kısıtı (vergi no) yoktur | §5.3 |
| `BE-S2` | `PATCH /api/customers/:id/lifecycle-stage` yok; evre değişimi bellekte | §9 |
| `BE-S3` | Teklif sürümleme (revizyon = yeni kayıt) bu turda **kapsam dışı** — K-17 | riskler K-17 |
| `BE-S4` | Belge yükleme gerçek depoya yazmaz; dosya adı ve boyutu bellekte tutulur | §9 |
| `BE-S5` | Aktivite/denetim izi kalıcı değildir; sayfa yenilenince sıfırlanır | §9 `audit_event` |

Ajan bu tabloyu **kopyalar**, kendi maddesini uydurmaz; eksik gördüğünü rapor eder.

---

## 11. Hızlı not çekmecesi

`quicknote.js:366-386`. Üst çubuktaki `#gvNote` düğmesi kabuk tarafından
bağlanır (`shell.js:513-517`) — **ekran hiçbir şey yapmaz**, yalnız
`quicknote.js`'i `<script>` ile yükler.

```js
GV.quickNote.ac()          // çekmeceyi aç
GV.quickNote.gorunenler()  // panelin Hızlı Notlar kartı bunu çağırır
GV.quickNote.yukle()       // tembel veri yükleme sözü (Promise)
GV.quickNote.hazir()       // veri bellekte mi
GV.quickNote.backendNotu   // dürüst beyan metni
GV.quickNote.dil           // arayüz sözlüğü — kendi kelimeni uydurma
```

Notlar **hiçbir sayfada** `<script src="assets/data/notes.js">` ile
yüklenmez (karar K-11): veri ancak kullanıcı çekmeceyi açınca çekilir ve
çekilirken sahiplik süzgeci uygulanır. Müşteri oturumunda düğme hiç basılmaz.

---

## 12. tokens.css / ui.css — kullanılacak sınıflar

**Kural: ekrana `<style>` bloğu yazma, satır içi `style=` ile düzen kurma.**
Sıfır hardcode renk/boşluk. Gereken sınıf yoksa **yazma, rapor et** —
`assets/css/*` ana oturumun sorumluluğudur.

### 12.1 Düzen

| Sınıf | İş |
|---|---|
| `.gv-card` | Ana kart kabı |
| `.gc-head` / `.gc-title` / `.gc-meta` / `.gc-head-acts` | Kart başlığı |
| `.gc-body` · `.gc-body.flush` | Kart gövdesi |
| `.gv-grid` + `.gv-grid-2/-3/-4` | Eşit sütun ızgarası |
| `.gv-grid.gv-grid-main` | 2fr + 1fr — **detay ekranı ana/yan düzeni** |
| `.gv-grid.gv-grid-aside` | İçerik + sabit yan panel (form `aside`'ı bunu kurar) |
| `.gv-tabs` / `.gv-tab` / `.gv-tabpanel` | Sekme şeridi ve panelleri |
| `.gv-state` / `.gv-state-ico` / `.gv-state-acts` | Boş ve hata durumu |
| `.gv-notice` (+ `.is-warn` `.is-danger` `.is-ok`) | Uyarı şeridi |

### 12.2 Metin ve hücre

`.cell-main` · `.cell-sub` · `.cell-code` · `.cell-date` (+`.is-late` `.is-soon`
`.is-done`) · `.cell-money` · `.cell-mask` · `.cell-wrap` · `.cell-trunc` ·
`.u-faint` · `.u-muted` · `.u-num` · `.u-sm` · `.u-xs` · `.u-ok` · `.u-warn` ·
`.u-danger` · `.u-center` · `.u-desktop` · `.u-mt-4`

### 12.3 Rozet ve buton

`.badge` + `.is-ok|is-warn|is-danger|is-info|is-neutral|is-purple|is-accent`
(`GV.badge` üretir — elle yazma).

`.btn` + `.btn-acc` (birincil) · `.btn-line` · `.btn-ghost` · `.btn-ok` ·
`.btn-danger` · `.btn-danger-line` · `.btn-dark`; boyut `.btn-xs` `.btn-sm`
`.btn-lg`; `.btn-icon` · `.btn-block`. İkon düğmesi: `.ia`.

### 12.4 Mobil satır

`.gv-mrow` · `.gv-mrow-top` · `.gv-mrow-code` · `.gv-mrow-meta` ·
`.gv-mrow-bottom` · `.gv-mrow-badges` — `GV.cell.mrow` bunları üretir.

### 12.5 Token'lar

Renk `--ink --ink-2 --muted --faint --paper --paper-2 --bg --bg-sunk --line
--line-2 --acc --acc-ink --ok --warn --danger --info --purple` (+ her birinin
`-tint` / `-line` / `-ink` varyantı) · boşluk `--sp-0 … --sp-17` · yarıçap
`--r-xs … --r-xl --r-pill --r-circle` · tipografi `--fs-2xs … --fs-5xl`,
`--fw-400 … --fw-800` · gölge `--sh-xs … --sh-xl` · z `--z-base … --z-toast`.

**Kare görsel kuralı:** `<img>` değil, `div` + `background-image: cover/center`
(`.gv-thumb` sınıfı vardır, `ui.js:2812`).

---

## 13. Bu dilimin veri gerçekleri — uydurma yok

Her sayı ölçüldü. **Türetilemeyen alan boş bırakılır**; tarih yakınlığı bağ değildir.

| Koleksiyon | Adet | Not |
|---|---:|---|
| `DB.accounts` | **20** | 12 müşteri + 8 bağsız aday. Dört aday mevcut müşteriye katlandı (`lifecycle.js:17-28`) |
| `DB.opportunities` | **12** | Her lead bir fırsat. `kod` = `FRS-2026-0NN` |
| `DB.quotes` | **8** | 3'ü `Kazanıldı`, 1'i `Kaybedildi`, 2'si `Taslak`, 1'i `Gönderildi`, 1'i `Müşteri İncelemesi` |
| `DB.quoteItems` | 6 | **Yalnız `TKL-2026-014` için.** Diğer 7 teklifte kalem dökümü YOK — `kalemSayisi` alanı var, satırlar yok. Ekran bunu söyler, satır uydurmaz. |
| `DB.contacts` | 14 | Yalnız `MUS-*` hesaplara bağlı. Lead kaynaklı 8 hesapta yetkili **yoktur** |
| `DB.interactions` | 8 | `musteri` **veya** `lead` alanı dolu |
| `DB.analyses` | 4 | `lead` üzerinden bağlanır |

### 13.1 Bağ kurma kuralları

- **Hesap → fırsat:** `DB.opportunities.filter(o => o.hesap === h.kod)`
  (`app-musteri.html:65-67`).
- **Hesap → teklif:** teklif ya doğrudan `q.musteri === h.kod` taşır ya da
  `q.lead` üzerinden bağlanır: `q.lead`'in fırsatı `FRS-` kodludur ve o fırsatın
  `hesap`ı hedeftir. İki yolu da dene, ikisi de tutmuyorsa **bağ yoktur**.
- **Hesap → yetkili:** `DB.contacts.filter(c => c.musteri === h.kod)`.
  Lead kaynaklı hesapta boş çıkar → "Bu hesap aday kaydından türetildi; yetkili
  kaydı kaynak veride yok."
- **Hesap → aktivite:** `DB.interactions` `musteri === h.kod` **veya**
  `h.leadKodlari.indexOf(i.lead) !== -1`.
- **Hesap → proje / fatura / destek:** `DB.projects` · `DB.invoices` ·
  `DB.tickets` hepsi `musteri` alanı taşır ve o alan `MUS-*` kodudur. Lead
  kaynaklı hesapta eşleşme çıkmaz — **normaldir**, boş sekme öyle anlatılır.
- **Hesap → belge:** `DB.documents` `musteri` alanı taşır.

### 13.2 Kod üretimi

Yeni kayıt kodu **defterden** türetilir, sabit yazılmaz. Desen
`domain.js:2460-2468`:

```js
function yeniKod(list, onek, basamak){
  var yil = String(DB.today).slice(0,4), max = 0;
  (list || []).forEach(function(x){
    var m = new RegExp('^' + onek + '-' + yil + '-(\\d+)$').exec(x.kod || '');
    if(m) max = Math.max(max, +m[1]);
  });
  return onek + '-' + yil + '-' + String(max + 1).padStart(basamak || 3, '0');
}
```

Zaman damgası: `DB.today + 'T' + new Date().toTimeString().slice(0,5)`.
**`new Date()` ile "bugün" alma** — `DB.today` sabittir (`'2026-08-03'`) ve
bütün ekranlar onu esas alır (`ui.js:756`, `ui.js:1203`).

---

## 14. Yasaklar — tek listede

1. `location.reload()` → `GV.refresh()`.
2. İkinci bakiye kaynağı → yalnız `GV.fin.balance`.
3. Uydurma veri: her kayıt mevcut bir kayıttan türetilir, kaynağı yazılır, türetilemeyen dürüstçe boş bırakılır.
4. Ortak katmana dokunma: `assets/js/*.js`, `assets/css/*.css`, `assets/data/*.js` **ajan tarafından değiştirilmez**.
5. `kayit.durum = …` / `.asama = …` / `.evre = …` → `GV.flow.gec` / `GV.lifecycle.gec`.
6. `href="#"`, sahte buton, `run`suz aksiyona başarı mesajı.
7. Ekran içi `<style>` bloğu, hardcode renk/boşluk, satır içi düzen `style`'ı.
8. Modal/drawer markup'ını `.page-main` / `.gv-page` içine basmak.
9. İnşaat terminolojisi (şantiye, taşeron, hakediş, saha).
10. `GV.list`in yaptığı işi elle yazmak (tablo, sayfalama, filtre, çıktı, kolon yönetimi).
11. Aynı kuralı iki yerde tanımlamak — kural N yerde tekrarlanıyorsa ortak katmana aittir (L-40).
12. "Uyar ama engelleme" duruşu: kapı **REDDEDER**. Şartname bunu emrediyor.
13. `GV.sales.kazanildi` (R1 zinciri) — §5.3'e aykırı, yeni müşteri kopyası üretir.
14. `<img>` ile kare görsel.

---

## 15. Ajan teslim kontrol listesi

Ekranını bitirmeden önce **tek tek** doğrula:

- [ ] Dosya adı ve `data-sec` / `data-screen` doğru (§1.3)
- [ ] Script sırası birebir §1.1; kullanılmayan veri dosyası yüklenmiyor
- [ ] Tüm kod `gv:ready` içinde; `GV.refresh()` sonrası tekrar koşunca **aynı sonucu** veriyor
- [ ] `GV.pageHead` liste/form bileşeninden **önce** çağrılıyor
- [ ] Kullanıcı verisi `GV.esc`'ten geçiyor
- [ ] Kullandığın her ikon §3'teki 113 adın içinde
- [ ] Kullandığın her `GV.*` yordamı bu brief'te **imzasıyla** yazılı
- [ ] Durum değişimi yalnız `GV.flow.gec` / `GV.lifecycle.gec` üzerinden
- [ ] Hata metni `GV.flowHata(r)`'dan; kendi cümlen yok
- [ ] Para yalnız `GV.fin.balance`'tan; `perm:'finans'` maskesi kurulu
- [ ] Boş değerde `0` değil `—`; sebebi yazılı
- [ ] Backend payı §10.2 biçiminde beyan edilmiş
- [ ] Liste ekranıysa `scopeField` bildirilmiş
- [ ] `<style>` bloğu ve satır içi düzen `style`'ı yok
- [ ] 390 px'te yatay taşma yok (mobil satır markup'ı yazıldı)
- [ ] Ölü buton yok; hedefi olmayan bağlantı normal `href` olarak bırakıldı (kabuk kilitler)
- [ ] `assets/` altında **hiçbir dosya** değişmedi
- [ ] Commit atılmadı

**Raporunda şunları yaz:** ekran dosyası ve satır sayısı · kullandığın `GV.*`
yordamları · türettiğin her kaydın kaynağı · boş bıraktığın alanlar ve nedeni ·
eksik bulduğun bileşen (yazmadın, rapor ettin) · ölçemediğin şey.

---

## 16. Bu brief'in kendi ölçümü

Ölçüm: `node tasks/qa/brief-dogrula.js`

| | Sayı | Doğrulandı |
|---|---:|---|
| Madde (numaralı bölüm) | 16 | — |
| Kod / imza bloğu | 42 | — |
| `dosya:satır` referansı | 118 | **118 / 118** yayındaki dosyada |
| Anılan `GV.<ad>` | 48 | **48 / 48** ortak katmanda tanımlı |
| Anılan `DB.<ad>` | 48 | **48 / 48** veri katmanında tanımlı |
| Anılan ikon adı | 113 | **113 / 113** sprite'ta var |

Doğrulama betiği brief'teki her `dosya:satır` işaretini, her `GV.*` / `DB.*`
adını ve her ikon adını gerçek dosyada arar. Brief eskirse eksen kırmızı yanar.
`GV.filters` gibi bilerek anılan hayalet adlar `brief-dogrula:yoksay` bloğundadır
ve ölçüm dışıdır — sessiz istisna listesi tutulmaz.
