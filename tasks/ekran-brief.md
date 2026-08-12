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

Yayındaki tam örnek: **`app-musteri.html:77-255`**. Alanlar:

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
GV.cols.money('toplam','Tutar', { signed:true, cur:'₺', perm:'finans', sub:function(x){…},
                                  deger:function(x){ return GV.fin.balance(x).acik; } })  // türetilmiş tutar
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
GV.cell.num(12, { basamak:1, tone:'ok', signed:true })   // signed → +/− ve renk
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
  { key:'tutar',  label:'En az tutar', type:'money', currency:'₺' },   // 'percent' de var
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

⚠️ **Hedef AYNI DOSYA ise sayfa yeniden YÜKLENMEZ.** Yalnız `?id=` değişiyorsa
adres `history.replaceState` ile güncellenir ve `GV.refresh()` ekranı taze
veriyle çizer; dönüş değeri `'detay-yumusak'` olur. Gerekçesi ölçüldü: tam
sayfa yüklemesi veri dosyalarını yeniden koşturur ve **az önce üretilen kaydı
siler** — kullanıcı yeşil "oluşturuldu" şeridiyle birlikte "kayıt bulunamadı"
görüyordu. Farklı dosyaya giden yönlendirmede kayıp sürüyor; orada sebep
prototipin kendisidir ve ekran bunu backend payında beyan eder.
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
GV.errorState({ title:'…', desc:'…',
                action:'<a class="btn btn-acc" href="…">Listeye dön</a>',  // BASILIR (eskiden yutuluyordu)
                retry:function(){ … } })   // işlev verilirse düğme ona bağlanır
// action da retry de yoksa düğme HİÇ basılmaz — ölü buton bırakılmaz
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
| `'kilit'` | **Kaydın tamamı donmuş** (ör. revize edilmiş teklif sürümü). `kapi`dan farkı: tek bir geçiş değil, hiçbir geçiş mümkün değil | mesajın kendisi |
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
| `quote` | `DB.quotes` | `durum` | `org.js:509-521` — 10 durum · **kayıt kilidi var**, bkz. §17.1 |
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

## 17. Dilim 2 — Finans zinciri (yeni ortak katman)

Bu bölüm dilim 2'de eklenen yordamları taşır. Öncekiler geçerliliğini korur.

### 17.1 `GV.teklif` — teklif sürümleme (K-17 · `domain.js:2870-3060`)

R1'de üç tur boyunca sahteydi: `versiyon` sayacı artıyor, önceki sürümün
kaydı hiçbir yerde durmuyordu. Artık gerçek.

```js
GV.teklif.zincir(kod)        // { kok, surum:[], adet, sira, guncel, sonuncuMu,
                             //   kilit, devralinan, devralinanSayi }
GV.teklif.surumler(kod)      // eskiden yeniye tüm sürümler
GV.teklif.sonSurum(kod)      // zincirin güncel kaydı
GV.teklif.kilitli(kod)       // null · ya da { why, ardil }
GV.teklif.revizyonIzni(kod)  // { ok } · { ok:false, why:'kilit'|'terminal'|'yetki', mesaj }
GV.teklif.revizyonAc(kod, { not })
      // → { ok:true, yeni, eski, versiyon, kalem, kok }   YENİ KAYIT üretir
GV.teklif.fark(kodA, kodB)   // { alan:[{alan,etiket,eski,yeni}], kalem:[{sira,tur,...}],
                             //   tutarFarki, degisiklikSayisi }
```

**Kayıt kilidi.** Ardılı olan teklif **donar**: `GV.flow.adimlar('quote', kod)`
boş döner ve `GV.flow.gec` `why:'kilit'` ile reddeder. Kilit bir alan değil,
zincirden türetilir. Ekran sebebini `GV.flow.kilit('quote', kod)` ile okur:

```js
var kl = GV.flow.kilit('quote', q.kod);
if(kl) mount.innerHTML += GV.notice({ tone:'warn', icon:'i-lock',
         title:'Bu sürüm kilitli', text:kl.why });
```

⚠️ **Devralınan sayaç.** 8 teklifin dördü `versiyon > 1` taşıyor ama zincirde
tek kayıt var — bu sayılar R1'den geldi ve karşılığı **yok**. `zincir()`
bunu `devralinan:true` ile söyler; ekran iki farklı güvenilirlikteki sayıyı
aynı biçimde basamaz (`GV.test.sayac` ile aynı disiplin).

### 17.2 `GV.fin.tutar` — bağımsız çapa (`domain.js:1152-1215`)

**ÇAPA = NET.** Brüt her yerde `net + kdv` olarak yeniden hesaplanır;
kayıttaki brüt otoriter değil, **doğrulanandır**.

```js
GV.fin.tutar(kayit, tur)   // tur: 'quote' | 'contract' | 'invoice' | 'milestone'
// → { net, oran, kdv, brut, kayitliBrut, kayitliKdv, sapma:[], tutarli, kaynak }
```

`tur` verilmezse alan imzasından çıkarılır. `sapma` doluysa kayıt **kendi
içinde çelişiyordur** ve ekran bunu söyler — sessizce birini seçmek, hangi
sayının doğru olduğuna kod adına karar vermektir.

Alan adları koleksiyondan koleksiyona değişir ve bu **bilerek** korunur:
`quotes` → `araToplam`/`indirim`/`vergiOran`/`vergi`/`toplam` ·
`contracts` → `tutar`/`kdvOran`/`kdv`/`toplam` ·
`invoices` → `tutar`/`vergi`/`toplam` (oran alanı **yok**, tutardan türer) ·
`milestones` → `odeme` (**NET** eksende, ölçüldü: 19 taksitin 19'u).

### 17.3 `GV.fin.zincirDenetim` — halka tutarlılığı (`domain.js:1217-1320`)

```js
GV.fin.zincirDenetim(sozlesmeKod)
// → { sozlesme, halka:[{ ad, kapsam, sol, sag, fark, tutar, sapan, not }],
//     olculen, halkaSayisi, sapan, tutarli }
```

Dört halka: **Teklif → Sözleşme** (NET) · **Sözleşme → Ödeme planı** (NET) ·
**Ödeme planı → Fatura** (NET, taksit başına) · **Fatura → Tahsilat** (BRÜT).

`kapsam:false` = **ölçülemedi**, "sıfır" değil. Sözleşmesi olmayan teklifi
sapma saymak, henüz yapılmamış işi hata saymaktır.

### 17.4 `GV.lifecycle` eklentileri

```js
GV.lifecycle.rozet(evre)      // evre rozeti — üç ekranın kopyası buraya alındı
GV.lifecycle.ad(evre)         // sözlükten ad
GV.lifecycle.adimlar(hesap)   // yapılabilir evre geçişleri (buton üretimi)
GV.lifecycle.dogumIzni(evre)  // yeni kayıt doğrudan MUSTERI evresinde açılabilir mi
```

### 17.5 Yeni veri sözleşmeleri

```js
DB.customerTypes       // ['Kurumsal','Bireysel','Kamu','İş Ortağı']  (K-19)
DB.customerTypesTeyit  // false — Yasin Bey teyidi bekliyor, TEK bayrak
DB.customerTypesNot    // ekranda basılacak not metni
```

⚠️ **BAYAT ALAN — `DB.customers[].durum` OKUNMAZ (K-21).** Yaşam evresi
`DB.accounts[].evre` üzerinde yaşar. Alan bir **tuzağa** çevrildi: okunduğunda
`DB.bayat.sayac` artar ve `undefined` döner. `tasks/qa/bayat-alan.js` tek bir
okuma kalırsa kırmızı yanar. Müşteri durumu gerektiğinde `GV.lifecycle` kullan.

### 17.6 Finans veri gerçekleri — ölçüldü

| Koleksiyon | Adet | Not |
|---|---:|---|
| `DB.contracts` | 7 | 3'ü bir teklife bağlı; net/KDV/brüt 7/7 tutarlı |
| `DB.milestones` | 19 | 6 sözleşmeye dağılmış · **NET** eksende · 1 sözleşmede taksit yok |
| `DB.invoices` | 17 | 15'i bir taksite bağlı · brüt = tutar + vergi, 17/17 tutarlı |
| `DB.payments` | 17 | 10'u tahsil edilmiş, **7'si edilmemiş** (alacak kaydı) |
| `DB.paymentAllocations` | 10 | tahsis defteri — bakiyenin **tek** kaynağı |
| `DB.purchases` | 7 | 4 durum · `DB.purchaseApprovals` 16 adım |
| `DB.orders` · `DB.suppliers` | 4 · 7 | satın alma zincirinin devamı |
| Açık bakiyeli fatura | 7 | 7'sinde de ödeme linki var |

**Tahsilat kaydı ≠ para geldi.** `DB.payments` bir **alacak defteridir**;
`tahsilEdildi` bayrağı nakit olayını söyler. Tahsis ancak nakit olayından
sonra yapılabilir (`GV.fin.tahsisEt` reddeder). 7 kayıt henüz tahsil edilmedi.

### 17.7 Finans zincirinin yazma yordamları

```js
GV.fin.tahsilEt(tahsilatKod, { tarih, yontem, hesap, dekont, valor })  // nakit olayı
GV.fin.tahsisEt(tahsilatKod, faturaKod, tutar, { tarih, yontem, dekont })
GV.fin.tahsisKaldir(tahsilatKod, faturaKod)
GV.fin.tahsilGeriAl(tahsilatKod, gerekce)
GV.fin.balance(fatura)      // TEK bakiye kaynağı — ikinci formül YASAK
GV.fin.durumTazele(fatura)  // durum türetilir; ekran `f.durum = …` YAZMAZ
```

Fatura belge ekseni ayrıdır: `GV.flow.gec('invoice', kod, hedef)` —
alan `belgeDurum`, ödeme durumu (`durum`) **türetilir**.

### 17.8 Değişen davranışlar — eski ekranlar bunu bilmeli

Aşağıdakiler **mevcut sözleşmeyi değiştirdi**; önceki dilimlerde yazılmış
ekranlar bu davranışlara güvenebilir, yeni ekranlar bunları varsaymalıdır.

| İmza | Yeni davranış |
|---|---|
| `GV.flow.adimlar` | `gerekce` artık **hedefin** `girisGerekce` bayrağını bildirir. Kuralı `DB.transitions`ten kendin okuma. Kilitli kayıtta `[]` döner |
| `GV.flow.gec` | Kilitli kayıtta `why:'kilit'`; kapı hedefe de bağlanabilir (`girisKapi`) |
| `GV.afterSave` | Hedef **aynı dosya** ise sayfa yeniden yüklenmez (`'detay-yumusak'`) |
| `GV.errorState` | `action` basılır, `retry` işlev alabilir, ikisi de yoksa düğme yok |
| `GV.form` `type:'url'` | Şemasız adres (`firma.com`) geçerli |
| `GV.form` `readonly` | `money` ve `percent` alanlarında da uygulanır |
| `GV.modal` · `GV.drawer` | İçlerindeki yayında olmayan bağlantıları kendileri kilitler |
| `GV.list` filtresi | `type:'money'` ve `type:'percent'` **çalışır** (ölü koddu); `currency` ile birim eki |
| `GV.cols.money` | `deger(x)` kapısı — türetilmiş tutar fabrikadan geçer |
| `GV.cell.num` | `signed:true` → `+/−` ve renk |
| `GV.action` | İkon haritası sprite ile hizalı; bilinmeyen eylemde `i-info` |

⚠️ **Hâlâ eksik olanlar** (`tasks/v2-borc.md`): `GV.action` alan yuvası (V2-01) ·
`GV.form` `option disabled` (V2-17) ve `datalist` (V2-18) · detay ekranı
tablo+mobil ikizi (V2-19). Bunlara ihtiyaç duyarsan **yazma, rapor et**.

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
Bilerek anılan hayalet adlar (§0 uyarısı) `brief-dogrula:yoksay` bloğundadır
ve ölçüm dışıdır — sessiz istisna listesi tutulmaz.

---

## 18. Dilim 3 — Proje ve Operasyon zinciri

Bu bölüm dilim 3'ün sözleşmesidir. §1-§16 aynen geçerlidir; burada yalnız
**bu dilime özgü** olanlar yazılıdır. Her sayı ölçüldü.

### 18.0 Bu dilimde yazılan ekranlar ve kabuk öznitelikleri

| Dosya | `data-sec` | `data-screen` | mount `id` |
|---|---|---|---|
| `app-proje.html` | `operasyon` | `proje` | `rec` |
| `app-proje-detay.html` | `operasyon` | `proje` | `rec` |
| `app-gorev.html` | `operasyon` | `gorev` | `rec` |
| `app-gorev-detay.html` | `operasyon` | `gorev` | `rec` |
| `app-gorev-form.html` | `operasyon` | `gorev` | `rec` |
| `app-destek.html` | `operasyon` | `destek` | `rec` |
| `app-destek-detay.html` | `operasyon` | `destek` | `rec` |
| `app-destek-form.html` | `operasyon` | `destek` | `rec` |

Mount `id`si **`rec` olmalıdır**: `GV.refresh()` yalnız `#rec`i taze kopyayla
değiştirir (§2.5). Başka ad verirsen dinleyiciler birikir.

`SCREEN_DENY` bu üç ekranı **kısıtlamaz** — `musteri` rolü proje, görev ve
destek ekranlarını görebilir; satır kapsamını `scopeField` süzer.

**Yüklenecek veri dosyaları:** `org.js` · `crm.js` · `work.js` · `misc.js` ·
`ops.js` · `hr.js` · `lifecycle.js`. `firsat.js` ve `odeme.js` **yükleme** —
bu dilimde kullanılmıyor.

⚠️ **`DB.timelogs` `work.js`te DEĞİL, `hr.js`tedir** (131 kayıt). Zaman
defterini okuyan her ekran `hr.js`yi yüklemek zorundadır — proje detayı
(`GV.proje.sure` · `GV.proje.maliyet`) ve görev detayı bunu okur. Yüklemeyen
ekranda `GV.proje.sure()` `kapsam:false` döner ve ekran "defter bu projeyi
kapsamıyor" der; oysa doğru cümle "defter bu ekranda hiç yüklü değil"dir.
İkisi ayrı şeydir (L-13) ve ilki **sessizce yanlış** beyandır. `kontrol.js`
[3] ekseni bunu yakalar — bu turda iki ekranda yakaladı.

### 18.1 Veri gerçekleri — ölçüldü, uydurma yok

| Koleksiyon | Adet | Not |
|---|---:|---|
| `DB.projects` | **14** | 7'si `Tamamlandı`, 4'ü `Aktif`, 1'er `Plan` · `Test/Kabul` · `Teslim`. Sağlık: 10 İyi · 2 Dikkat · 2 Riskli |
| `DB.tasks` | **26** | 16'sı bir projeye, 18'i bir müşteriye bağlı; **8'i ikisine de bağlı değil** — bu normaldir, iç görevlerdir |
| `DB.tickets` | **7** | 6'sı bir projeye bağlı; `DST-2026-117` hiçbir projeye bağlı değil |
| `DB.projectMilestones` | **12** | ⚠️ bkz. §18.2 — `DB.milestones` ile **AYNI ŞEY DEĞİL** |
| `DB.sprints` | 6 | yalnız 5 projede |
| `DB.bugs` | 6 | 4 projede |
| `DB.changeRequests` | 5 | 5 projede |
| `DB.deliveries` | 5 | 5 projede |
| `DB.testCases` | 5 | **hepsi `PRJ-2026-001`de** |
| `DB.subtasks` | 9 | `ustGorev` alanıyla göreve bağlı |
| `DB.taskDeps` | 3 | `gorev` · `bagimli` · `tur` |
| `DB.supportPackages` | 7 | **`proje` alanı 7/7 BOŞ** — bağı kullanıcı kurar (`GV.proje.bakimBagla`) |
| `DB.slaPolicies` | 7 | kategori × öncelik matrisi |
| `DB.timelogs` | 131 | `proje` alanı taşır |

**Proje başına alt kayıt dağılımı — ekran bunu bilerek yazar:**

| Proje | görev | sprint | milestone | teslim | hata | değişiklik | test | belge | fatura | timelog |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| `PRJ-2026-001` | 4 | 1 | 1 | 1 | **3** | 1 | **5** | 1 | 2 | 38 |
| `PRJ-2026-002` | 2 | 1 | 1 | 1 | 0 | 0 | 0 | 1 | 1 | 15 |
| `PRJ-2026-003` | 4 | **2** | **5** | 1 | 1 | 1 | 0 | 1 | **5** | **51** |
| `PRJ-2026-004` | 1 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 3 | 1 |
| `PRJ-2026-005` | 1 | 1 | 1 | 0 | 1 | 1 | 0 | 0 | 2 | 7 |
| `PRJ-2026-006` | 3 | 1 | 1 | 1 | 1 | 1 | 0 | 0 | 2 | 7 |
| `PRJ-2026-007` | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 |
| `PRJ-2025-008` | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| diğer **6** proje | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Altı proje hiçbir alt kayıt taşımıyor** ve bu bir eksiklik değil ölçümdür:
hepsi 2023-2025 yıllarında kapanmış kayıtlar, alt defterleri R1'e hiç
girmemiş. O projelerin sekmeleri **boş** açılır ve sekme "kayıt yok" değil
**"bu projede X kaydı defterde yok"** der (§10.1).

### 18.2 ⚠️ İKİ FARKLI "MILESTONE" — karıştırma

Bu depoda `milestone` kelimesi **iki ayrı koleksiyonu** adlandırıyor ve ikisi
farklı şeydir:

| Koleksiyon | Ne | Alanlar |
|---|---|---|
| **`DB.projectMilestones`** (12) | **PROJE kilometre taşı** — işin teslim adımı | `kod` `proje` `baslik` `tarih` `sorumlu` `durum` `teslimat` `aciklama` |
| **`DB.milestones`** (19) | **ÖDEME PLANI TAKSİTİ** — sözleşmenin para adımı | `odeme` (**NET**) `sozlesme` `proje` … |

Proje detayının **Milestone sekmesi `DB.projectMilestones` okur.**
`DB.milestones` finans zincirine aittir (§17.2 · `GV.fin.tutar(x,'milestone')`)
ve proje detayında **Finans/Bütçe** bağlamında anılırsa öyle etiketlenir.
İkisini aynı sekmede aynı adla basmak, iki farklı defteri tek sayı gibi
göstermek olurdu.

### 18.3 `GV.flow` varlıkları — bu dilimde kullanacakların

| `tur` | Koleksiyon | Durum alanı | Durum sayısı |
|---|---|---|---|
| `project` | `DB.projects` | `durum` | 10 |
| `ticket` | `DB.tickets` | `durum` | 8 |
| `bug` | `DB.bugs` | `durum` | 10 |
| `change` | `DB.changeRequests` | `durum` | 11 |
| `delivery` | `DB.deliveries` | `durum` | 9 |

⚠️ **`task` İSTİSNADIR.** `DB.flowEntities.task` tanımlı ama görev geçişinin
gerçek motoru **`GV.task.transition`**tır; `GV.flow.gec('task', …)` onu
çağırır (`domain.js:453`) ve `GV.flow.adimlar('task', …)` da
`GV.task.nextSteps`e düşer (`domain.js:405`). **İkisini de kullanabilirsin;
ikisi de aynı tek mutasyon noktasına gider.** Kendi geçişini yazma.

**Görev geçiş tablosu (`DB.taskTransitions`, 10 durum) — ELLE YAZMA, oku:**

```
Havuzda        → Atandı · İptal edildi        yetki: pm/takimlideri/depmudur/sahip/operasyon   zorunlu: sorumlu
Atandı         → Devam ediyor · Engellendi · İptal edildi     yetki: sorumlu/pm
Devam ediyor   → Kontrolde · Engellendi · İptal edildi        yetki: sorumlu
Kontrolde      → Revizede · Onay bekliyor · Tamamlandı        yetki: kontrolEden/pm   zorunlu: teslimEdilenCikti
Revizede       → Kontrolde · İptal edildi     yetki: sorumlu
Onay bekliyor  → Tamamlandı · Revizede        yetki: onaylayan/pm/sahip
Engellendi     → Devam ediyor · İptal edildi  yetki: sorumlu/pm   zorunlu: engelNedeni
Tamamlandı     → Arşivlendi · Revizede        yetki: pm/sahip
İptal edildi   → Arşivlendi                   yetki: pm/sahip/operasyon
Arşivlendi     → (yok)
```

`Kontrolde` çıkışında **iki yol tabloda yazılı ama yalnız BİRİ geçerlidir**:
`GV.task.onayGerekli(t)` (`onaylayan !== kontrolEden`) true ise
`Onay bekliyor`, değilse `Tamamlandı`. `nextSteps` bunu zaten süzer — ekran
tabloyu kendi okuyup ikisini birden basmaz.

**`Arşivlendi` son duraktır (`next:[]`).** Arşivden çıkış bir geçiş değil ayrı
işlemdir: `GV.task.arsivGeriAl(kod)` aktivite kaydından hangi duruma
döneceğini **okur**, tahmin etmez; kayıt yoksa işlem yapılmaz ve sebebi
söylenir.

### 18.4 `GV.task` — görev yordamları (`domain.js:1628-1841`)

```js
GV.task.nextSteps(kod)        // [{ hedef, etiket, tone, izin, eksik:[] }] — buton üretimi
GV.task.transition(kod, hedef, ek, not)
//   → { ok:true, gorev, eski, bildirim:[] }
//   → { ok:false, why:'yetki'|'zorunlu'|<düz metin>, roller:[], eksik:[] }
GV.task.onayGerekli(t)        // onaylayan !== kontrolEden
GV.task.yetkili(t, kural)     // oturum bu geçişi yapabilir mi
GV.task.eksikAlanlar(t, kural, ek)
GV.task.arsivGeriAl(kod)      // → { ok, gorev, eski, hedef } · { ok:false, why:'kaynak durum bilinmiyor', aciklama }
GV.task.ata(kod, emp, not)    // Havuzda ise GEÇİŞ, değilse alan değişimi — ayrım YORDAMDA
GV.task.oncelik(kod, deger)   // DB.priorities: Kritik · Yüksek · Orta · Düşük
GV.task.bekleme(kod, neden, notu, sessiz)   // DB.taskWaitReasons (7) — DURUMDAN BAĞIMSIZ ikinci eksen
```

⚠️ **Bekleme nedeni bir DURUM DEĞİLDİR.** Görev "Devam ediyor" kalır, yalnız
neyi beklediğini söyler. Eskiden bunun için üç ayrı durum vardı ve görev
ilerlemeyi bırakmış görünüyordu. Ekran bunu durum rozetinin **yanında** ayrı
bir işaret olarak basar, durumun yerine değil.

⚠️ **ARŞİV İKİ ALANLA ANLATILIYOR** (`durum:'Arşivlendi'` **ve** `arsiv:true`)
ve `GV.list` ikisini de arşiv sayar. `transition` ikisini birlikte yazar —
ekran hiçbirini elle yazmaz.

### 18.5 `GV.proje` — proje yordamları

```js
GV.proje.kayit(kodYaKayit)    // kod da kayıt da kabul eder
GV.proje.acik(p) / .kapali(p) / .bitti(p) / .arsivli(p) / .geciken(p)
GV.proje.kapaliDurumlar       // ['Tamamlandı','İptal Edildi']
GV.proje.teslimDurumlari      // ['Teslim','Kapanış','Tamamlandı']

GV.proje.sure(kod)
//  → { planlanan, gerceklesen, faturalanabilir, tum, kayit, kapsam }
//  ⚠️ `kapsam:false` → zaman defteri bu projeyi KAPSAMIYOR. Ekran "0 saat"
//     YAZMAZ, "defterde kayıt yok" yazar (L-13). `gerceklesen` yalnız
//     ONAYLI kayıtlardan; `tum` onaysızları da içerir, fark ekranda söylenir.

GV.proje.maliyet(kod)
//  → { personel, disKaynak, satinAlma, diger, toplam, gelir, brutKar,
//      karlilikYuzde, kapsam, saat, maliyetsizPersonel:[], oranGuvenilmez:[] }
//  ⚠️ `maliyetsizPersonel` dolu ise o kişilerin saatleri maliyete GİRMEDİ;
//     `oranGuvenilmez` dolu ise kârlılık yüzdesi güvenilmez. İkisi de
//     ekranda YAZILIR — tek bir toplam basıp güvenilirliği yutmak yasak.

GV.proje.kapanisKontrol(kod)
//  → [{ anahtar, etiket, olculdu, gecti, sayi, detay, href }]  · 8 madde
//  ⚠️ `olculdu:false` = ÖLÇÜLEMEDİ, "geçti" değil. Kaydı olmayan madde
//     kilit saymaz ama gerekçe ister.

GV.proje.kapat(kod, { neden, aciklama, istisna }, tarih)
//  → { ok:true, kod, tarih, gecmeyen, istisna }
//  → { ok:false, why:'kapali'|'istisna'|'gerekçe'|'yetki'|'zaten kapalı', eksik:[], mesaj }
//  KAPI REDDEDER: ölçülebilen ve geçmeyen madde varsa kapanış olmaz.
//  Yalnız `sahip`/`gm` neden kodu + açıklama + `istisna:true` ile geçer.

GV.proje.bakimPaketleri(kod)          // AYNI MÜŞTERİNİN paketleri (aday liste)
GV.proje.bakimBagla(projeKod, paketKod)
GV.proje.bakimAc(...)                 // bkz. domain.js — kapanışta yeni paket açar
```

⚠️ **`DB.supportPackages[].proje` 7/7 BOŞTUR ve türetilemez.** Tek dolaylı
zincir (`paket.sozlesme → contract.proje`) hiçe çıkıyor; tarih yakınlığı ve
müşteri eşleşmesi bağ **sayılmadı**. Bağı kullanıcı kurar. Proje detayının
bakım bloğu bunu böyle söyler.

### 18.6 `GV.destek` ve `GV.test`

```js
GV.destek.kayit(t)              // kod da kayıt da
GV.destek.acik(t) / .kapali(t)  // DB.ticketClosedStatuses = ['Çözüldü','Müşteri Onayı','Kapandı']
GV.destek.kapaliDurumlar()
GV.destek.paketOf(t)            // talebin bakım paketi kaydı — yoksa null
GV.destek.kotaDusum(t)          // pakete düşen saat
GV.destek.cozumTarihi(t)

GV.test.sayac(projeKod)         // { turetilmis, senaryo, basarili, basarisiz, engellendi, kosulmadi, kosum }
GV.test.kosumlar(...) · .sonuclar(...) · .senaryolar(...) · .adimlar(...)
GV.test.hataBaglami(...) · .hatasizBasarisiz(...)
```

⚠️ **`GV.test.sayac` `turetilmis` bayrağı taşır.** `false` ise sayılar kayıttaki
sabit alanlardan gelir ve koşum defterinden **türetilmemiştir**; `true` ise
gerçek koşumlardan sayılmıştır. İki farklı güvenilirlikteki sayı **aynı
biçimde basılamaz** (§17.1 devralınan sayaç ile aynı disiplin).

`DB.ticketStatuses` (8): `Yeni · Triage · Atandı · Devam ediyor · Çözüldü ·
Müşteri Onayı · Kapandı · Yeniden Açıldı`.
`DB.ticketChannels` (7) · `DB.ticketWaitReasons` (7) · `DB.slaPolicies` (7).

⚠️ **Destek talebinde TERMİN ALANI YOKTUR.** `sla` bir SÜRE taahhüdüdür
(`'4 saat'`, `'2 gün'`), bir tarih değildir; tarihe çevirmek uydurma olur.
Gecikme bilgisi `slaDurum` alanındadır (`Zamanında` · `Risk altında` ·
`İhlal edildi`) ve kaynak veride yazılıdır.

### 18.7 Proje detayı — SEKME SÖZLEŞMESİ (rota 33-47 · şartname §3.3)

`app-proje-detay.html` **sekmelidir** ve alt kayıtlar **ayrı ekran değildir**.
Sekme kümesi (`GV.tabs`, §6.1 işaretleme sözleşmesi):

| Sekme | `data-tab` | Kaynak | Dolu mu |
|---|---|---|---|
| Özet | `ozet` | proje kaydı + `GV.proje.sure` + `.maliyet` + `.kapanisKontrol` | her projede |
| Milestone | `milestone` | **`DB.projectMilestones`** | 6 projede |
| Sprint | `sprint` | `DB.sprints` | 5 projede |
| Kalite | `test` | `DB.testCases` + `GV.test.*` | **yalnız `PRJ-2026-001`** |
| Hatalar | `hata` | `DB.bugs` | 4 projede |
| Değişiklik | `degisiklik` | `DB.changeRequests` | 5 projede |
| Teslim | `teslim` | `DB.deliveries` | 5 projede |
| Belgeler | `belge` | `DB.documents` (`proje` alanı) | 3 projede |
| Aktivite | `aktivite` | `GV.audit.oku(p.kod, 30)` | her projede |

**Tembel yükleme zorunludur** (risk R-04: R1'de bu ekran 111 KB'tı). Sekme
gövdesi `gv:tab` olayında çizilir:

```js
GV.on(document, 'gv:tab', function(e){ … }, 'projeDetay-tab');   // §2.6 — KALICI düğüm
GV.tabs('#projeSekme');
```

`GV.tabs` aktif sekmeyi `location.hash`e yazar ve açılışta geri okur — yani
`app-proje-detay.html?id=PRJ-2026-006#degisiklik` doğrudan o sekmeyi açar.
**Bu adres biçimi sözleşmedir**; Operasyon kuyruğu ve `GV.proje.kapanisKontrol`
buraya bağlanıyor.

⚠️ `GV.tabs` panelleri **belge genelinde** arar — aynı sayfada ikinci bir
sekme kümesi kurma. Sekme içindeki listeler `GV.list`tir ve **`urlSync:false`
bildirmelidir** (ana ekranda URL senkronu kullanan başka bir liste varsa
çakışır; bayrak artık iki yönlüdür, §18.9).

**Küresel çapraz liste açma.** Bir alt kayıt tipini proje bağlamı dışında
görmek gerekiyorsa yeni ekran değil **Operasyon filtresi** kullanılır
(`app-operasyon.html?tip=…`). Rota haritası §4.2 bunu birebir yazıyor.

### 18.8 Görev listesi — TEK LİSTE, KAYITLI GÖRÜNÜM

`app-gorev.html` **tek bir `GV.list`tir**. R1'de 9 menü girdisi `?t=` ile
bu ekrana gidiyordu; R2'de tek girdi var ve varyasyonlar **sekme + kayıtlı
görünüm**. Sekme varyasyonu için **ayrı ekran açma** (şartname §3.3).

Sekmeler bir DURUM LİSTESİ DEĞİL, birer kuraldır ve `DB.taskStatuses`ten
türetilir — elle yazma. Eski `?t=<anahtar>` bağlantı biçimi `GV.list`in kendi
URL senkronu üzerinden çalışmalıdır, yani bu ekranda **`urlSync` açık kalır**.

**Toplantı ve kararlar bağlamsal aktivitedir**: karar göreve bağlanır
(`app-gorev.html` kayıtlı görünümü). Ayrı toplantı ekranı **açılmaz**.

### 18.9 Ortak katmanda BU OTURUMDA eklenen imzalar

| İmza | Nerede | Ne yapar |
|---|---|---|
| `GV.list` `cfg.rowOpen(kayit, render)` | `ui.js` | Satıra tıklayınca çağrılır. Tablo satırı, mobil satır, kart ve kanban kartı — dördü de. Satır İÇİNDEKİ `a/button/input/select/textarea/label` tıklaması **tetiklemez**. Dinleyici bir kez bağlanır |
| `GV.list` `cfg.urlSync:false` | `ui.js` | Artık **iki yönlü**: yazmayan liste **okumaz da**. Aynı sayfadaki ikinci/üçüncü liste bunu bildirmek ZORUNDADIR |
| `GV.fin.ciftNet(tahsilatKod, faturaKod)` | `domain.js` | Bir tahsilat–fatura çiftinin NET tahsisi (ters kayıtlar dahil) |
| `GV.fin.dagitimNet(tahsilatKod)` | `domain.js` | Bir tahsilatın tüm faturalara net dağıtımı |
| `GV.fin.canliTahsisler(faturaKod)` | `domain.js` | Neti sıfırlanmamış tahsis satırları |
| `GV.fin.tahsisKaldir(tahsilatKod, faturaKod, gerekce)` | `domain.js` | **Üçüncü argüman eklendi ve ZORUNLU.** Kayıt silmez, eksi tutarlı ters kayıt üretir (§8.5) |
| `DB.supplierQuotes[].id` | `ops.js` | `talep · tedarikçi`den türetilmiş satır kimliği |

### 18.10 Bu dilimde beyan edilecek backend payı maddeleri

Ajan bu tabloyu **kopyalar**, kendi maddesini uydurmaz (§10.2 (b) biçimi):

| Kod | Madde | Şartname |
|---|---|---|
| `BE-P1` | Görev/proje durum geçişi sunucuda yeniden doğrulanmaz; yetki ve zorunlu alan kontrolü istemcide koşar | §9 |
| `BE-P2` | Zaman kaydı ve onay zinciri gerçek bir timesheet servisine bağlı değil; süreler bellekte | §9 |
| `BE-S4` | Belge yükleme gerçek depoya yazmaz; dosya adı ve boyutu bellekte tutulur | §9 |
| `BE-S5` | Aktivite/denetim izi kalıcı değildir; sayfa yenilenince sıfırlanır | §9 `audit_event` |
| `BE-D1` | SLA sayacı gerçek zamanlı çalışmaz; `slaDurum` kaynak veride yazılı sabit değerdir | §9 |

`BE-D1` **yalnız destek ekranlarında**, `BE-P2` yalnız proje ve görev
ekranlarında yazılır — ilgisiz madde beyan etmek beyanı gürültüye çevirir.

---

## 19. Dilim 3 — kalan dört ekran (proje listesi · görev formu · destek listesi · destek formu)

§1-§18 aynen geçerlidir. Burada yalnız bu dört ekranın ihtiyacı olan **yeni**
imzalar var. Hepsi yayındaki koddan alındı ve ölçüldü.

### 19.0 Kabuk öznitelikleri ve veri dosyaları

| Dosya | `data-sec` | `data-screen` | mount |
|---|---|---|---|
| `app-proje.html` | `operasyon` | `proje` | `rec` |
| `app-gorev-form.html` | `operasyon` | `gorev` | `rec` |
| `app-destek.html` | `operasyon` | `destek` | `rec` |
| `app-destek-form.html` | `operasyon` | `destek` | `rec` |

**Veri dosyaları:** `org.js` · `crm.js` · `work.js` · `misc.js` · `ops.js` ·
`hr.js` · `lifecycle.js`.
`hr.js` **proje listesinde ZORUNLU** — `GV.proje.sure` ve `.maliyet`
`DB.timelogs`u okur ve o koleksiyon `hr.js`tedir (§18.0 uyarısı).
Görev ve destek formunda `hr.js` gerekmez; **yüklemeyin.**
`firsat.js` ve `odeme.js` dördünde de **yüklenmez**.

### 19.1 `GV.task.olustur(v)` — YENİ (`domain.js`)

Görev formu `DB.tasks.push(...)` **YAZMAZ**. Kod üretimi, başlangıç durumu,
zorunlu alan ve denetim izi tek yerdedir.

```js
GV.task.olustur({
  baslik:'…',                 // ZORUNLU
  sorumlu:'EMP-004',          // verilirse atama GEÇİŞTEN geçer (Havuzda → Atandı)
  tur, proje, modul, sprint, musteri, dep, veren, yardimci, izleyiciler,
  kontrolEden, onaylayan, oncelik, etki, aciliyet, destek,
  termin, tahminiSure, faturalanabilir,
  aciklama, amac, kabulKriteri, beklenenCikti, etiketler
})
// → { ok:true, gorev, atama }          atama: sorumlu verildiyse GV.task.ata sonucu
// → { ok:false, why:'zorunlu', eksik:['baslik'] } · { ok:false, why:'yetki', roller:['ekle'] }
```

Ölçüldü: `sorumlu` verilince durum **`Atandı`**, verilmeyince **`Havuzda`**.
Kod defterden türer (`GRV-2026-127` üretildi, son kayıt `GRV-2026-126` idi).
Başlangıç durumu `DB.taskStatuses[0]`tan okunur — **sabit dize yazma.**

### 19.2 `GV.destek.olustur(v)` ve `GV.destek.slaPolitikasi(...)` — YENİ

```js
GV.destek.slaPolitikasi(kategori, oncelik)   // → DB.slaPolicies kaydı ya da null
GV.destek.olustur({
  baslik:'…',                 // ZORUNLU
  musteri:'MUS-2024-001',     // ZORUNLU
  proje, kategori, oncelik, etki, sorumlu, acan, kanal, aciklama,
  ucretli, bakimPaketi
})
// → { ok:true, talep, politika }
// → { ok:false, why:'zorunlu', eksik:['baslik'|'musteri'] } · { why:'yetki' }
```

⚠️ **SLA İKİ AYRI ALANDIR, KARIŞTIRMA:**
`DB.slaPolicies[].ilkYanit` / `.cozum` **DAKİKADIR** (60 · 120 · 240 · 1440).
`DB.tickets[].sla` ise politikanın **`etiket`** dizesidir (`'4 saat'`,
`'2 gün'`). Ölçüldü: yayındaki **7 talebin 7'sinde** `sla`, politikanın
`etiket`iyle birebir eşleşiyor. Ekran süre gösterecekse hangi alanı
gösterdiğini yazar.

⚠️ Üç politika `oncelik:'Tümü'` taşır (SLA-05 · 06 · 07) — joker eşleşmeyi
`slaPolitikasi` kendi yapar, ekran ikinci bir eşleştirme kurmaz.

⚠️ **Yeni talepte `slaDurum` `null` kalır.** Sayaç canlı çalışmaz (BE-D1);
`'Zamanında'` yazmak ölçülmemişi ölçülmüş göstermek olurdu (L-13). Ekran bunu
"henüz ölçülmedi" diye basar, **boş bırakmaz ve sıfır yazmaz**.

### 19.3 `GV.kuyruk` — destek listesi ORTAK SATIR MODELİNİ kullanır

Destek listesi **ikinci bir satır modeli üretmez**. Operasyon kuyruğu destek
taleplerini zaten ortak modele çeviriyor (`assets/js/kuyruk.js`); liste ekranı
aynı yordamı çağırır.

```js
GV.kuyruk.tipler            // tip sözlüğü { destek:{ ad, ikon, flowTur, kaynak }, … }
GV.kuyruk.hepsi()           // tüm tiplerin ortak satırları
GV.kuyruk.kapsamli()        // rol kapsamı uygulanmış hâli
GV.kuyruk.suz(rows, f)      // f = { tip:[], durum:[], sorumlu, tarih:'geciken'|'bugun'|'tarihsiz', q }
GV.kuyruk.sirala(rows)      // gecikenler önce, sonra son tarihe göre, tarihsizler sonda
GV.kuyruk.bul(id)           // id = '<tip>:<kod>'
GV.kuyruk.kayit(satir)      // satırın arkasındaki GERÇEK kaydı döndürür
GV.kuyruk.sayac(rows)       // { gorev, destek, onay, takip, tahsilat, istalebi, geciken }
GV.kuyruk.empAd(kod)
```

Ortak satırın alanları (şartname §6.2'nin beşi + teknik alanlar):
`baslik · iliski · durum · sorumlu · sonTarih` + `id · tip · kod · flowTur ·
kaynak · tam · tone · gecikti`.

⚠️ **Kuyruk YALNIZ AÇIK talepleri taşır** (`DB.ticketClosedStatuses` dışındakiler
— ölçüldü: 7 talebin 4'ü). Destek listesi **kapalıları da göstermek zorundadır**;
o yüzden liste `DB.tickets`i kaynak alır ve kuyruk modelini **satır biçimi**
olarak kullanır — `GV.kuyruk.hepsi()`yi kaynak olarak kullanma, kapalı 3 talebi
kaybedersin. `sonTarih:null` kuralı (destekte termin alanı YOK) aynen geçerlidir.

### 19.4 `GV.fin.tahsisYetkisi()` ve `DB.tahsisYetkiRolleri` — YENİ (K-25)

```js
DB.tahsisYetkiRolleri   // ['muhasebe','sahip','genelmudur'] — rol adları DB.roles'ten doğrulandı
DB.tahsisYetkiNot       // ekranda basılacak açıklama
GV.fin.tahsisYetkisi()  // boolean — tahsis KURMA ve GERİ ALMA için AYNI kapı
```

`permMatrix.finans` bayrağı bu iş için **okunmaz**: o bayrak "parayı
görebilir" demektir (maskeleme kuralı UID-11) ve 8 rolde açıktır. Bu dilimin
dört ekranı tahsis yazmaz; imza burada **bilinsin diye** var.

### 19.5 `DB.projects` — proje listesinin alan envanteri (14 kayıt, 14/14 dolu)

`kod · ad · musteri · musteriAd · pm · ekip · durum · saglik · baslangic ·
planlananBitis · gercekBitis(8) · ilerleme · sozlesmeTutari · butce ·
tahminiSure · kaynak · tur · oncelik · faz(7) · repo · canli · test · tasarim ·
sunucu · teknoloji · ucuncuTaraf · teknikSorumlu · musteriSorumlu · riskler ·
gecikmeNedeni(4) · sonGuncelleme · arsiv(7)`

Sözlükler: `DB.projectStatuses` (10) · `DB.projectPhases` (7) ·
`DB.projectSources` (5) · `DB.projectModules` (15).

Ölçülen dağılım: durum → `Tamamlandı` 7 · `Aktif` 4 · `Test/Kabul` 1 ·
`Teslim` 1 · `Plan` 1. Sağlık → `İyi` 10 · `Dikkat` 2 · `Riskli` 2.

**Sekmeler `DB.projectStatuses`ten türetilir, elle yazılmaz.** Durum kümeleri
için `GV.proje.acik/kapali/bitti/arsivli/geciken` kullanılır (§18.5) — ekran
`p.durum !== 'Teslim'` gibi bir cümle **yazmaz**, o cümle yedi ekranda
kopyalanmıştı ve sözlük değişince yedisi birden sessizce yanlışa düşerdi.

⚠️ **`gercekBitis` 8/14, `faz` 7/14, `gecikmeNedeni` 4/14 dolu.** Boşta `—`
basılır ve sebebi yazılır; `0` ya da bugünün tarihi **yazılmaz**.

### 19.6 Bu dört ekranda beyan edilecek backend payı

§18.10 tablosu geçerli. Ek olarak:

| Kod | Madde | Nerede |
|---|---|---|
| `BE-P1` | Durum geçişi sunucuda yeniden doğrulanmaz | proje listesi · görev formu |
| `BE-P2` | Zaman kaydı gerçek bir timesheet servisine bağlı değil | proje listesi |
| `BE-D1` | SLA sayacı gerçek zamanlı çalışmaz; `slaDurum` kaynak veride yazılı sabittir, yeni kayıtta `null` | destek listesi · destek formu |
| `BE-S4` | Belge yükleme gerçek depoya yazmaz | görev formu · destek formu |
| `BE-S5` | Denetim izi kalıcı değildir | dördünde de |

### 19.7 Ortak katmanda VAR ama brief'te yazılı olmayan üç imza

Proje listesi ajanı bunları koda bakıp buldu; brief eksikti. Artık yazılı:

```js
GV.pri(v)     // ui.js:287 — ÖNCELİK rozeti. Türkçe harfleri sınıf adına çevirir
              //   ('Çok yüksek' → <span class="pri is-cok-yuksek">). CSS'te
              //   .pri.is-kritik/.is-yuksek/.is-orta/.is-dusuk tanımlı.
GV.tone(v)    // ui.js:276 — bir değerin ton anahtarını sözlükten türetir
              //   ('ok'|'warn'|'danger'|'info'|'neutral'|…). `GV.badge` bunu kullanır.
```

⚠️ **`GV.badge` ile `GV.pri` AYNI ŞEY DEĞİL.** `badge` tonu sözlükten türetir;
öncelik değerleri (`Kritik · Yüksek · Orta · Düşük`) o sözlükte **yoktur** ve
dördü de nötr rozet basar — yani rozet hiçbir şey söylemez. Öncelik için
`GV.pri` kullan ya da düz metin yaz; `GV.badge(p.oncelik)` **yazma**.

### 19.8 İki escape sözleşmesi — kardeş alanlar ayrışıyor

| Alan | Escape ediliyor mu |
|---|---|
| `GV.notice({ text })` · `GV.badge` · `GV.empty` | **EVET** — bileşen kaçırır |
| `GV.list` `kpis[].meta` çıktısı | **HAYIR** — HAM basılır (`ui.js:1006`) |
| `GV.dl` `dt`/`dd` · `GV.cell.sub` | **HAYIR** |

Kullanıcı verisini `meta` içine koyuyorsan `GV.esc`'ten **sen** geçir.

### 19.9 `GV.cols.date` — boş dalda da alt satır basar (bu turda düzeltildi)

```js
GV.cols.date('gercekBitis','Gerçek bitiş', {
  bosMetin:'—',
  bosSub:function(p){ return 'proje açık · teslim edilmedi'; },   // YENİ
  sub:function(p){ … }, plain:true, done:function(p){ … } })
```

Eskiden boş değerde yalnız `bosMetin` dönüyordu ve "neden boş" cümlesini
yazmak isteyen ekran fabrikayı bırakıp kolonu **elle** yazmak zorunda
kalıyordu — fabrika, en çok gerektiği yerde (boş değer, §10.1)
kullanılamıyordu. `bosSub` verilirse o, verilmezse `sub` çağrılır.

### 19.10 Hâlâ eksik olanlar — ihtiyaç duyarsan YAZMA, rapor et

| Borç | Ne eksik |
|---|---|
| **V2-31** | `GV.list` `filters[]` sözleşmesinde `perm` kapısı yok. Para süzgecini yetkisiz rolden gizlemek için ekran kendi `if(canFinans)` kapısını kurmak zorunda |
| V2-17 · V2-18 | `GV.form` `option disabled` ve `datalist` yuvası |
| V2-19 | Detay ekranı tablo + mobil-ikiz yardımcısı |
| V2-20 | Sarmalayan buton satırı sınıfı (`.gv-actrow`) |

---

## 20. Dilim 4 — Ekip ve Kaynaklar

§1-§19 aynen geçerlidir. Her sayı ölçüldü.

### 20.0 Ekranlar ve kabuk öznitelikleri

| Dosya | `data-sec` | `data-screen` | mount |
|---|---|---|---|
| `app-personel.html` | `ekip` | `personel` | `rec` |
| `app-personel-detay.html` | `ekip` | `personel` | `rec` |
| `app-personel-form.html` | `ekip` | `personel` | `rec` |
| `app-zaman.html` | `ekip` | `zaman` | `rec` |
| `app-izin-detay.html` | `ekip` | `zaman` | `rec` |
| `app-izin-form.html` | `ekip` | `zaman` | `rec` |
| `app-varlik.html` | `ekip` | `varlik` | `rec` |

**Veri dosyaları:** `org.js` · `crm.js` · `work.js` · `misc.js` · `ops.js` ·
**`hr.js`** · `lifecycle.js`. `firsat.js` ve `odeme.js` **yüklenmez**.

⚠️ **DÜZELTME — BU SATIR ON BİR KOLEKSİYONU `hr.js`E YAZIYORDU, BEŞİ ORADA.**
İki ajan bağımsız olarak yanlış buldu; ölçüldü ve tablo hâline getirildi.
Yanlış eşleme zararsız görünür (§22.0 her ekrana yedi dosyayı da yüklettiği
için ekranlar doğru koşuyor) ama §1.2'nin kuralı *"kullanmadığın veri
dosyasını yükleme"*dir — o kuralı uygulamaya çalışan biri yanlış dosyayı
düşürür ve koleksiyon sessizce kaybolur.

| Dosya | Bu dilimde kullanılan koleksiyonlar |
|---|---|
| `org.js` | **`DB.employees`** · **`DB.salaryHistory`** · `DB.departments` · `DB.roles` · `DB.permMatrix` · `DB.reasonCodes` · `DB.transitions` · `DB.flowEntities` · `DB.approvalTypes` · `DB.approvalFlows` · `DB.holidays` · `DB.workTypes` · `DB.employeeStatuses` · `DB.leaveStatuses` · `DB.purchaseStatuses` |
| `hr.js` | `DB.leaves` · `DB.timelogs` · `DB.timesheets` · `DB.performance` · `DB.trainings` · `DB.capacity` · `DB.onboarding` · `DB.onboardingTemplates` · `DB.leaveTypes` **(+ `aktif` tuzağını kurar)** |
| `ops.js` | **`DB.assets`** · **`DB.assignments`** · **`DB.assetClaimDrops`** · **`DB.assetCategories`** · **`DB.assetStatuses`** · **`DB.vehicles`** · **`DB.maintenance`** · **`DB.policies`** · **`DB.fuelLogs`** · **`DB.fines`** · **`DB.inspections`** · **`DB.accidents`** · **`DB.vehicleExpenses`** · **`DB.suppliers`** · **`DB.orders`** · `DB.purchases` · `DB.purchaseApprovals` · `DB.tickets` · `DB.approvals` |
| `work.js` | `DB.projects` · `DB.tasks` · `DB.activities` · `DB.milestones` · `DB.bugs` · `DB.projectStatuses` · `DB.projectSources` · `DB.projectPhases` · `DB.priorities` · `DB.healthLevels` |
| `misc.js` | `DB.contracts` · `DB.invoices` · `DB.documents` · `DB.notifications` · `DB.logs` |
| `crm.js` | `DB.customers` · `DB.contacts` · `DB.quotes` |
| `lifecycle.js` | `DB.accounts` · `DB.opportunities` · `DB.lifecycleStages` |

**Yani demirbaş ve filo tarafının TAMAMI `ops.js`tedir, `hr.js`te değil.**

### 20.1 ⚠️ KİŞİSEL VERİ KAPISI — ekrandan ÖNCE kurulur

Personel kaydı üç ayrı hassasiyette alan taşır ve üçü aynı kapıdan geçmez:

| Sınıf | Alanlar | Kapı |
|---|---|---|
| genel | `ad · ini · rol · dep · pozisyon · yonetici · girisTarihi · durum · lokasyon · uzmanlik · teknoloji · yetkinlik` | yok — herkes görür |
| **özlük / sağlık** | `dogum · kanGrubu · acilKisi · tel · eposta · egitim · sertifika · sozlesme · calismaTuru` | **`GV.hr.ozlukGorebilir(e)`** |
| **maaş** | `maas · saatlikUcret · DB.salaryHistory` | **`GV.hr.maasGorebilir()`** / `GV.perm.mask(v,'maas')` |

```js
GV.hr.ozlukGorebilir(e)   // kendi kaydı → her zaman true
                          // permMatrix.personel === 'tum' → true
                          // === 'departman' → yalnız kendi departmanı
                          // 'proje' / 'yok' → false
GV.hr.maasGorebilir()     // permMatrix.maas — 4 rol: sahip · genelmudur · ik · muhasebe
GV.hr.ozluk(e, 'kanGrubu')// yetkisizde '••••••' döner, BOŞ DEĞİL
```

**Kapı olmadan alan basma.** Yetkisizde `0` ya da boş bırakmak yasaktır:
boş "veri yok" demektir, oysa veri var ve görülemiyor — ikisi ayrı şeydir
(UID-11). `••••••` basılır ve o hücre çıktıya da girmez.

Ölçüldü: `ik`/`sahip` özlüğü görür, `muhasebe` maaşı görür ama özlüğü
**görmez**, `depmudur` yalnız kendi departmanının özlüğünü görür, `frontend`
yalnız kendi kaydını görür.

### 20.2 `GV.hr` — personel yaşam döngüsü (K-18, bu turda yazıldı)

```js
GV.hr.kayit(e)          // kod da kayıt da kabul eder
GV.hr.durum(e)          // DB.employeeStatuses değeri
GV.hr.istihdamda(e)     // bordroda mı — Taslak ve Ayrıldı hariç hepsi
GV.hr.atanabilir(e)     // YENİ iş verilebilir mi — yalnız 'Aktif'
GV.hr.atanabilirler()   // hazır, ada göre sıralı atama listesi
GV.hr.icMaliyet(kod, tarih) · GV.hr.kayitOrani(l) · GV.hr.disKaynak(kod)
```

⚠️ **`aktif` ALANI TUZAKTIR — HİÇBİR VARLIKTA OKUNMAZ (K-18 → K-33).**
K-18'de yalnız personelde kapatılmıştı; ölçüldü ki aynı tuzak **53
koleksiyonda daha** kuruluydu (54 koleksiyon · 566 kayıt · yalnız 8'i
`false`). Artık `durum` ekseni olan **her** koleksiyonda tuzaklıdır: okuyan
`undefined` alır, `DB.bayatAktif.sayac` artar (personelde `DB.ikBayat`).
`tasks/qa/aktif-ekseni.js` **tek bir beyansız okuma** kalırsa kırmızı yanar.

**Ekran `aktif` yazmaz, okumaz, süzmez.** Pasiflik sorusu tek yordamdan
geçer:

```js
GV.arsivli(r)                 // arsiv:true → arşiv; durum varsa KANON odur;
                              // durum yoksa aktif kanondur (3 koleksiyon)
GV.arsivli(r, ['Hurda'])      // bu listede hangi durumlar pasif sayılıyor
GV.list({ …, passive:['Hurda'] })   // aynı listeyi bileşene bildirmenin yolu
```

`aktif` yalnız `durum` ekseni **olmayan** üç koleksiyonda kanondur ve orada
okunması doğrudur: `departments` (3 pasif) · `contacts` (1) · `customers`
(`durum` K-21'de tuzaklandı). Bu dilimde ikisine de dokunmuyorsun.

**`employee` geçiş tablosu (`DB.transitions.employee`, 7 durum):**
```
Taslak      → Onboarding            zorunlu: girisTarihi · dep · pozisyon
Onboarding  → Aktif                 kapı: personelEvrak (KAYNAKTA, doğru)
Aktif       → İzinli · Pasif · Offboarding
İzinli      → Aktif · Pasif · Offboarding
Pasif       → Aktif · Offboarding                    GİRİŞ GEREKÇESİ
Offboarding → Ayrıldı · **Aktif**   ÇIKIŞ GEREKÇESİ (iki yön de)
Ayrıldı     → (yok, TERMINAL)       girisZorunlu: cikisTarihi · cikisNedenKodu
                                    girisKapi: personelZimmet
```
Yetki **yedi geçişte de** `ik / sahip / genelmudur`.

⚠️ **DÜZELTME — `DB.reasonCodes[].tur` BİR DİZİDİR.**
<!-- brief-dogrula:yoksay-basla -->
Bu satır önce "`tur:'cikis'` taşıyanlar" diyordu ve o okuma **SIFIR kod
bulur**: `c.tur === 'cikis'` → **0**, `c.tur.indexOf('cikis') !== -1` → **7**.
`[B5.2]` ekseni artık bu sınıfı yakalıyor; bu blok ölçüm dışında çünkü yanlış
yazımı ÖRNEK olarak anıyor.
<!-- brief-dogrula:yoksay-bitir -->
Alan `['iade','revizyon']` gibi bir dizidir — bir kod birden çok türe hizmet
eder — ve dizi alan `indexOf` ile okunur:

```js
var CIKIS = (DB.reasonCodes || []).filter(function(c){
  return (c.tur || []).indexOf('cikis') !== -1;      /* dizi — === YAZMA */
});
/* 7 kod: ISTIFA · SOZLESME_BITIS · KARSILIKLI · ISVEREN_FESIH ·
          EMEKLILIK · STAJ_BITIS · DIGER */
```
Yayındaki iki tüketici bunu **doğru** yapıyor (`app-ayar-sirket.html:331`
`indexOf('istisna')`); yanlış olan brief'in kendisiydi. Bu okumayı `===` ile
yazan bir ekran `Ayrıldı` geçişinde **boş bir neden kodu listesi** basar ve
geçiş hiç tamamlanamaz. Geçiş **yalnız `GV.flow.gec('employee', …)`** ile
yapılır; `e.durum = …` yasaktır.

✅ **`Offboarding → Aktif` kenarı VARDIR (K-31).** Yanlışlıkla çıkış
sürecine alınan personel, **gerekçe ile** geri döndürülür. Ekran bu düğmeyi
basar; etiketi `GV.flow.adimlar('employee', kod)` üretir.

⚠️ İki yönün koşulu FARKLIDIR ve fark hedefte durur, kaynakta değil:
`Ayrıldı` hedefi çıkış tarihi + neden kodu + zimmet kapısı ister; `Aktif`
hedefi yalnız gerekçe ister. **Geri almak, ileri gitmekten ağır değildir.**
Ekran `eksik` listesini `adimlar()`ın döndürdüğü **hedef başına** okur —
tek liste bütün hedeflere basılmaz.

### 20.3 `GV.varlik` — zimmet TEK KAYNAK (K-18 eki, bu turda yazıldı)

```js
GV.varlik.kayit(a) · .zimmetOf(demirbasKod) · .kabulEdildi(z)
GV.varlik.zimmetliler(personelKod)     // kişinin üzerindeki açık zimmetler
GV.varlik.kabulEt(zimmetKod)           // → { ok, zimmet, demirbas }
GV.varlik.kabulGeriAl(zimmetKod, gerekce)   // gerekçe ZORUNLU
GV.varlik.tazele(a) · .tazeleHepsi()
GV.varlik.sonTazeleme                  // { olculen, degisen:[…] } — yükleme ölçümü
```

⚠️ **`DB.assets[].zimmetli` ve `[].durum` TÜRETİLMİŞ görünümdür; EKRAN
YAZMAZ.** Otorite `DB.assignments`tir. Envanter zimmet TUTANAĞI YAZILDIĞI AN
güncelleniyordu, personelin kabulü beklenmiyordu — `ZMT-2026-007` tutanağı
"Bekliyor" derken envanter "EMP-006'da" diyordu.

Kural: zimmet ancak **personel onayladığında** envanteri `Zimmetli` yapar.
Onay beklerken demirbaş **`Zimmet bekliyor`** durumundadır.
`DB.assetStatuses` = `['Depoda','Zimmet bekliyor','Zimmetli','Aktif','Hurda']`.

**Yüklemede düzeltilen kayıt artık 0'dır (K-30).** Eskiden 4 kayıt her
açılışta sessizce onarılıyordu; envanter literalleri defterin söylediğine
çekildi. Bir onarımın her seferinde tekrar koşması, onarılmamış demektir —
`GV.varlik.sonTazeleme.degisen.length === 0` bunu ölçer ve **öyle kalmalıdır**.

Üç demirbaşta envanter bir sahip yazıyordu ama **hiç tutanak yoktu**. Defter
kanonik olduğu için iddia DÜŞÜRÜLDÜ; **eksik tutanak üretilmedi**. İddianın
kendisi, ölçülmüş kaynağı ve düşme sebebi `DB.assetClaimDrops` (3 kayıt)
içinde durur:

```js
GV.varlik.dusenIddia(demirbasKod)       // → { iddiaPersonel, kaynak[], neden, karar } | null
GV.varlik.dusenIddiaSatiri(demirbasKod) // → zaman çizelgesine basılacak TÜRETİLMİŞ satır | null
```

⚠️ Bu satır **veriye yazılmaz**, görüntü anında defterden türetilir — sahte
bir aktivite kaydı, olmayan bir aktörle olmayan bir olay uydurmak olurdu.
Demirbaş detayında ve zimmet çekmecesinde **basılması zorunludur**: envanterin
bir zamanlar başka bir şey söylediği bilgisi kaybolmamalıdır.

### 20.4 Veri gerçekleri — ölçüldü

| Koleksiyon | Adet | Not |
|---|---:|---|
| `DB.employees` | **16** | durum: `Aktif` 15 · `Offboarding` 1. `saatlikUcret` yalnız 1'inde (EMP-015, freelancer) |
| `DB.leaves` | **7** | tür 4 çeşit · durum: `Onay bekliyor` · `Onaylandı` · `Reddedildi`. `vekil` 5/7, `ret` 1/7 |
| `DB.timelogs` | **131** | `onay`: `Bekliyor` · `Onaylandı`. `gorev` 47/131, `proje` 120/131, `modul` 78/131 |
| `DB.timesheets` | **6** | haftalık defter; yalnız `2026-W31` kapsamlı |
| `DB.assets` | **15** | 8 kategori (sözlük 20). durum: `Zimmetli` 5 · `Depoda` 5 · `Aktif` 3 · `Zimmet bekliyor` 1 · `Hurda` 1. `zimmetli` 5/15 ve `durum` **TÜRETİLİR**. `siparis` 3/15 · `dep` 15/15 · `garantiBit` 15/15. Lokasyon 4 çeşit: `Ofis · Ankara` / `Depo · Ankara` / `Ofis · Sistem odası` / `Bulut` |
| `DB.assignments` | **7** | 6 `Aktif` · 1 `İade edildi`; `personelOnay` 6 `Onaylandı` · 1 `Bekliyor`. `tutanak` 7/7 (dosya adı) · `hasar` 1/7 |
| `DB.assetClaimDrops` | **3** | K-30 düşen zimmet iddiası — tutanak DEĞİLDİR, düşme kaydıdır |
| `DB.vehicles` | **4** | durum `Aktif` (3) · `Serviste` (1). `proje` **4/4 boş** · `anaSurucu` 2/4. 28 alan: plaka · marka · model · modelYili · tip · yakit · vites · motorHacmi · motorNo · sasi · renk · mulkiyet · alisTarihi · alisBedeli · satici · siparis · kullanim · anaSurucu · yedekSurucu · dep · proje · durum · guncelKm · sonBakimTarihi · sonBakimKm · sonrakiBakimTarihi · sonrakiBakimKm |
| `DB.vehicleExpenses` | 8 | araca bağlı gider — 8 tür, **her türden 1 kayıt** (Bakım · Yakıt · HGS · Kira · Ceza · Sigorta · Kasko · Lastik) |
| `DB.maintenance` | **5** | araç bakımı · `durum` (`Yaklaşıyor` vb.) · `islemler` dizi · `maliyet` planlıda `null` |
| `DB.fuelLogs` | 5 | yakıt · `DB.fines` 2 · `DB.inspections` 4 · `DB.accidents` 1 |
| `DB.performance` | **5** | `Tamamlandı` 4 · `Açık` 1. Açık olanda 12 ölçüt alanı **boş** |
| `DB.trainings` | **4** | `katilimci` dizi alanıdır |
| `DB.salaryHistory` | **15** | `bitis` **0/15 dolu** — hepsi açık uçlu kayıt |
| `DB.departments` | 21 | `ustDepartman` 19/21 |

Sözlükler: `DB.employeeStatuses` (7) · `DB.leaveTypes` (6) ·
`DB.leaveStatuses` (5) · `DB.assetStatuses` (5) · `DB.assetCategories` (20) ·
`DB.workTypes` (5) · `DB.timeUnits` (4).
⚠️ `vehicleStatuses` · `contractTypes` · `performanceStatuses` ·
`trainingStatuses` sözlükleri **YOKTUR** — değerleri kayıtlardan türet ve
nereden türettiğini ekranda yaz.

### 20.5 Sekme ve kayıtlı görünüm sözleşmesi (şartname §3.1)

Kapasite · performans · eğitim · işe giriş/çıkış · demirbaş · zimmet · filo
**AYRI EKRAN AİLESİ AÇMAZ**; üç ana sayfanın bağlamsal görünümleridir.

- **`app-personel-detay.html` SEKMELİDİR**: `ozet` · `performans` · `egitim` ·
  `yasamdongusu` · `zaman` · `zimmet` · `aktivite`. Tembel çizim zorunlu
  (`GV.on(document,'gv:tab',…)` + `GV.tabs`), `#hash` derin bağlantısı
  sözleşmedir (§18.7 ile aynı desen).
- **`app-zaman.html`** iki yüzey sekmesi taşır: **Zaman** (`DB.timelogs` +
  `DB.timesheets`) ve **İzin** (`DB.leaves`). `app-zaman-onay.html` ayrı ekran
  DEĞİLDİR — Zaman sekmesinin onay kayıtlı görünümüdür.
- **`app-varlik.html`** üç yüzey sekmesi taşır: **Demirbaş** (`DB.assets`) ·
  **Zimmet** (`DB.assignments`) · **Filo** (`DB.vehicles`).
- **Kapasite** ayrı ekran değildir → "İş ve Kapasite" raporu
  (`app-rapor.html?r=is-kapasite`, yayında).

⚠️ Aynı sayfada birden çok `GV.list` varsa **yalnız BİRİ** `urlSync` tutar;
kalanı `urlSync:false` bildirir (§18.9 · iki yönlüdür).

### 20.6 Bu dilimde beyan edilecek backend payı

| Kod | Madde | Nerede |
|---|---|---|
| `BE-P1` | Durum geçişi sunucuda yeniden doğrulanmaz | üçünde de |
| `BE-P2` | Zaman kaydı gerçek bir timesheet servisine bağlı değil | zaman |
| `BE-K1` | Kişisel veri kapısı yalnız arayüzdedir; gerçek sistemde özlük ve maaş alanları **sunucuda** yetkiye göre filtrelenmelidir — maskelenmiş alan istemciye hiç gitmemelidir | personel |
| `BE-K2` | Zimmet tutanağı ıslak/e-imza taşımaz; kabul yalnız bir bayraktır | varlık |
| `BE-S4` | Belge yükleme gerçek depoya yazmaz | personel · varlık |
| `BE-S5` | Denetim izi kalıcı değildir | üçünde de |

### 20.7 `app-varlik.html` — TEK LİSTE, KAYITLI GÖRÜNÜM (şartname §3.1)

**Demirbaş · Zimmet · Filo AYRI EKRAN AİLESİ DEĞİLDİR.** Üçü de *tek* bir
`GV.list` örneğinde, **kayıtlı görünüm** olarak taşınır — §18.8'deki görev
listesi deseninin aynısı. Üç ayrı `GV.list` kurmak yasaktır: üç arama kutusu,
üç kolon yöneticisi, üç sayfalama durumu doğar ve §6'nın liste standardı
üçe bölünür.

Yüzey değişince değişenler: `source` · `columns` · `kpis` · `filters` ·
`rowActions` · `emptyState` · `exportName`. Değişmeyen: bileşenin kendisi.

| Yüzey | `?t=` | source | Birincil kolon |
|---|---|---|---|
| Demirbaş | `demirbas` (varsayılan) | `DB.assets` (15) | `kod` · kategori · marka/model · durum · zimmetli · lokasyon |
| Zimmet | `zimmet` | `DB.assignments` (7) | `kod` · demirbaş · personel · teslimTarihi · durum · personelOnay |
| Filo | `filo` | `DB.vehicles` (4) | `kod` · plaka · marka/model · kullanım · anaSurucu · durum · guncelKm |

`urlSync` **yalnız bu tek listede** açıktır (§20.5 kuralı gereği sayfada
ikinci bir `GV.list` kurulmayacak).

**`passive` sözleşmesi.** Demirbaş yüzeyinde `passive:['Hurda']` verilir —
hurdaya ayrılmış demirbaş arşiv toggle'ı açılmadan listede görünmez. Zimmet
yüzeyinde `passive:['İade edildi']`, filo yüzeyinde **verilmez** (`Serviste`
bir araç emekliliği değildir, geçici bir durumdur ve listede görünmelidir).

**Zimmet tutanağı DRAWER'dır, ekran değildir.** Bir demirbaş satırından ya da
zimmet satırından `GV.action`/drawer ile açılır (§8.1); ayrı bir
`app-zimmet-detay.html` **açılmaz**. Çekmecede bulunması zorunlu olanlar:
- tutanak dosya adı (`z.tutanak`) — indirilemez, `BE-K2` beyanı yanında durur
- `personelOnay` ve `onayTarihi`
- **kabul / kabul geri alma** düğmeleri — `GV.varlik.kabulEt(kod)` ve
  `GV.varlik.kabulGeriAl(kod, gerekce)`. İkisinin yetki kümesi AYNIDIR;
  geri almada gerekçe **kayıt koşuludur**, yetki değil.
- `hasar` alanı doluysa (1/7) basılır.
- Demirbaşın `GV.varlik.dusenIddiaSatiri(kod)` satırı — **varsa zorunlu**.

**Ekran envanter YAZMAZ.** `a.durum` ve `a.zimmetli` türetilmiştir; tek
mutasyon noktası `GV.varlik.kabulEt` / `.kabulGeriAl`'dir. `DB.assets`
üstünde doğrudan atama yasaktır.

**Sözlüğü olmayan alanlar.** `vehicleStatuses` sözlüğü **YOKTUR**; filo
durum süzgecinin seçenekleri kayıtlardan türetilir ve ekranda "seçenekler
mevcut 4 kayıttan türetildi" diye **yazılır** (§10.1). Aynısı `mulkiyet` ·
`kullanim` · `tip` · `yakit` için de geçerlidir.

**Bakım/yakıt/ceza defterleri bu ekranda liste değildir.** `DB.maintenance`
(5) · `DB.fuelLogs` (5) · `DB.fines` (2) · `DB.inspections` (4) ·
`DB.accidents` (1) · `DB.vehicleExpenses` (8) araç **detayına** aittir
(`app-arac-detay.html`, bu dilimin sonunda). Filo yüzeyinde yalnız
`sonrakiBakimTarihi` türevi bir KPI ("bakımı yaklaşan araç") basılır ve
sayının nereden geldiği yazılır.

**KPI'lar ölçümdür, süs değildir.** Her KPI'ın altında hangi kayıttan
türediği yazılır; türetilemeyen KPI **basılmaz** (§10.1 — boş ≠ sıfır).

---

## 21. Dilim 5 — AYARLAR (dört ekran)

§1–§20 aynen geçerlidir. Bu bölüm yalnız **farkları** yazar. Her sayı
`node tasks/qa/ayar-ekseni.js` ile ölçüldü; hiçbiri elle yazılmadı.

### 21.0 Ekranlar, kabuk öznitelikleri ve veri dosyaları

| Dosya | `data-sec` | `data-screen` | mount | menü kapısı (`shell.js`) |
|---|---|---|---|---|
| `app-ayar-profil.html` | `ayarlar` | `profil` | `rec` | **yok** — her role açık |
| `app-ayar-sirket.html` | `ayarlar` | `sirket` | `rec` | `sahip · genelmudur · sistem` |
| `app-ayar-entegrasyon.html` | `ayarlar` | `entegrasyon` | `rec` | `sahip · genelmudur · sistem · devops` |
| `app-ayar-log.html` | `ayarlar` | `log` | `rec` | `sahip · genelmudur · sistem · operasyon · devops` |

⚠️ **Ekran menü kapısını KENDİ KONTROL ETMEZ.** `roles:` kaydı `shell.js`
`SECTIONS.ayarlar` içindedir ve yetkisiz rol ekrana hiç giremez — kabuk 403
basar (`shell.js` `guard`). Ekran içinde ikinci bir rol listesi yazmak
kuralı iki yerde tanımlamak olurdu (§14.11).

**Yüklenecek veri dosyaları — ekran başına, kullanılmayan YÜKLENMEZ (§1.2):**

| Ekran | Veri dosyaları |
|---|---|
| `app-ayar-profil.html` | `org.js` · `crm.js` · `work.js` · `misc.js` · `ops.js` · `hr.js` · `lifecycle.js` |
| `app-ayar-sirket.html` | `org.js` · `crm.js` · `work.js` · `misc.js` · `ops.js` · `hr.js` · `lifecycle.js` |
| `app-ayar-entegrasyon.html` | `org.js` · `crm.js` · `work.js` · `misc.js` · `ops.js` · `lifecycle.js` · **`odeme.js`** |
| `app-ayar-log.html` | `org.js` · `crm.js` · `work.js` · `misc.js` · `ops.js` · `hr.js` · `lifecycle.js` · **`odeme.js`** |

`odeme.js` iki ekranda zorunludur: entegrasyonda `DB.paymentLinkDefaults` ve
`DB.paymentBackendGaps`, sistem kayıtlarında veri kalitesi sekmesi
`DB.paymentLinks` sayımını okur. `firsat.js` hiçbirinde yüklenmez.
`crm.js` profil ekranında **zorunludur**: müşteri oturumunda `DB.contacts`
okunur (bkz. §21.3).

### 21.1 AYAR KABUĞU — sekmeler YETKİDEN üretilir (şartname §3.3)

§3.3 birebir: "`app-ayar-*.html` → `/ayarlar/:sekme` · Aynı ayar kabuğunda
sekmeli yönetim; **yetkiye göre sekme üret**."

Sekme kümesi **`shell.js`te TEK yerde** tanımlıdır. Ekran kendi sekme
listesini **YAZMAZ**; yordamı çağırır ve ne gelirse onu basar — `GV.flow`
düğme üretiminin (§7.1) aynı ilkesidir.

```js
GV.shell.ayarSekmeleri('sirket')
// → [{ key:'sirket', lbl:'Şirket', ic:'i-building', rota:136 }, …]
//   yetkiden SÜZÜLMÜŞ kümedir; `roles:` ve `perm:` kapıları uygulanmıştır
GV.shell.ayarSekmeHam                 // süzülmemiş ham kayıt — YALNIZ ölçüm içindir
```

Ölçülen sekme sayıları (rol → sekme):

| Ekran | rol | sekme |
|---|---|---|
| `profil` | her rol (27/27) | `hesap` · `bildirim` |
| `sirket` | `sahip` · `genelmudur` · `sistem` | `sirket` · `departman` · `kullanici` · `rol` · `yetki` · `onay` |
| `entegrasyon` | `sahip` · `genelmudur` · `sistem` | `saglayici` · `odeme` · `otomasyon` · `hata` |
| `entegrasyon` | **`devops`** | `saglayici` · `otomasyon` · `hata` — **`odeme` YOK** (`perm:'finans'`, devops'ta `finans:false`) |
| `log` | beş rolün hepsi | `kayit` · `arsiv` · `kalite` |

**Kabuk iskeleti — dört ekranda da birebir aynı.** `GV.tabs` işaretleme
sözleşmesi §6.1'dir; derin bağlantı `app-ayar-sirket.html#departman`
biçimindedir ve **sözleşmedir**.

```js
var SEKME = GV.shell.ayarSekmeleri('sirket');
if(!SEKME.length){
  mount.innerHTML = GV.empty({ icon:'i-lock', title:'Görebileceğiniz ayar sekmesi yok',
    desc:'Bu ekrana girebiliyorsunuz ama rolünüz hiçbir sekmeyi açmıyor. …' });
  return;                                   /* ölü sekme şeridi basma */
}
mount.innerHTML =
  '<div class="gv-tabs" role="tablist" id="ayarSekme">' +
    SEKME.map(function(t){
      return '<button type="button" class="gv-tab" role="tab" data-tab="' + t.key + '"' +
             ' aria-selected="false">' + GV.ico(t.ic,'ic-sm') + GV.esc(t.lbl) + '</button>';
    }).join('') +
  '</div>' +
  SEKME.map(function(t){
    return '<div role="tabpanel" data-panel="' + t.key + '" id="panel-' + t.key + '" hidden></div>';
  }).join('') +
  '<div id="ayarBackend" class="u-mt-8"></div>';

/* ⚠️ SIRA: dinleyici GV.tabs'ten ÖNCE bağlanır — GV.tabs kurulurken ilk
   sekmeyi hemen etkinleştirir ve `gv:tab` atar (ui.js). Sonra bağlarsan
   AÇILIŞTAKİ sekme hiç çizilmez. */
var cizildi = {};
GV.on(document, 'gv:tab', function(e){ ciz(e.detail.key); }, 'ayarSirket-tab');
GV.tabs('#ayarSekme');

function ciz(key){
  if(cizildi[key]) return;                  /* tembel çizim — bir kez */
  cizildi[key] = true;
  var p = document.getElementById('panel-' + key);
  if(!p) return;
  …
}
```

⚠️ `GV.tabs` panelleri **belge genelinde** arar (§6.1) — sayfada **ikinci
sekme kümesi kurma**.

⚠️ **Sekme panelindeki her `GV.list` `urlSync:false` bildirir** (§18.9,
iki yönlüdür). Bu ekranlarda `urlSync:true` tutan liste **yoktur**: sekme
anahtarı `#hash`tedir, listenin sorgu anahtarları onunla çakışmaz ama iki
liste birbiriyle çakışır.

### 21.2 Menü sayımı — DEĞİŞMEZ, ölçüm kapısı

Bu dilimde `shell.js` `SECTIONS` **değişmedi**: dört ayar girdisi zaten
kayıtlıydı, yalnız dosyaları yoktu. Ölçülen (kaynağı `tasks/qa/kontrol.js`
[5] ve `GV.shell.visibleItems()`):

- standart kullanıcının **görünür günlük menü girdisi en fazla 17** —
  kabul kriteri ≤18 (§12), `pm` ve `operasyon` rollerinde 17.
- üç yönetim girdisi (`Şirket ve Erişim` · `Entegrasyonlar` ·
  `Sistem Kayıtları`) `yonetim:true` taşır, **ayrı ve soluk blokta** basılır
  (`.gv-menu-admin` · `.gv-menu-item.is-admin`) ve **günlük sayıya girmez**.
- `Profil` girdisi `yonetim` **değildir** — herkes kendi profilini yönetir,
  o yüzden 17'nin içindedir.

**Ajan bu sayıyı değiştirecek hiçbir şey yapmaz**: menüye girdi eklemez,
`shell.js`e dokunmaz. Ekranın içinden başka bir ayar ekranına bağlantı
vermek serbesttir (kabuk `markWip` ile korur).

### 21.3 `app-ayar-profil.html` — HESABIM · BİLDİRİM (rota 134 · 135)

**İki oturum biçimi vardır ve ikisi ayrı kayıt okur (§2.2):**

```js
var me = GV.session.emp;            // 'EMP-001' → personel oturumu
                                    // null      → müşteri oturumu
```

- **Personel oturumu** → kayıt `DB.emp(me)` (16 kayıt).
- **Müşteri oturumu** (`emp === null`) → kayıt
  `DB.contacts.filter(c => c.kod === GV.session.kontak)[0]` (14 kayıt) ve
  bağlı hesap `GV.session.musteri` / `GV.session.musteriAd`.
  **Özlük ve maaş blokları müşteri oturumunda HİÇ BASILMAZ** — personel
  kaydı yoktur, maskelenecek bir alan da yoktur. `GV.hr.*` çağrılmaz.

**Kişisel veri kapısı — §20.1 aynen geçerlidir, gevşetilmez:**

```js
GV.hr.ozlukGorebilir(e)   // kendi kaydı → her zaman true
GV.hr.maasGorebilir()     // permMatrix.maas — YALNIZ 4 rol: sahip · genelmudur · ik · muhasebe
GV.hr.ozluk(e, 'kanGrubu')// yetkisizde '••••••' döner, BOŞ DEĞİL
```

⚠️ **Kendi profilinde bile maaş kapısı `maasGorebilir()`tir.** Ölçüldü:
`frontend` rolü kendi kaydını açtığında `maas` alanını **göremez** ve
`••••••` görür. Bu bir kusur değil, kanonun bilinen sonucudur — ekran
kapıyı kendi lehine gevşetmez, maskenin **altına sebebini yazar**
("maaş alanı `permMatrix.maas` kapısındadır; kendi kaydınız bu kapıyı
açmaz"). Kapıyı değiştirmek ana oturumun kararıdır (V2-47).

**`hesap` sekmesinde basılacaklar** (hepsi `GV.dl` + `skipEmpty:true`):

| Blok | Alanlar | Kapı |
|---|---|---|
| Kimlik | `ad · ini · kod · pozisyon · rol`(→`DB.roleName`) · `dep`/`depAd` · `yonetici`(→`GV.user`) · `lokasyon` · `girisTarihi` · `durum`(→`GV.badge`) | yok |
| Yetkinlik | `uzmanlik · yetkinlik[] · teknoloji[] · sertifika[]` | yok |
| İletişim ve özlük | `tel · eposta · dogum · kanGrubu · acilKisi · egitim · sozlesme · calismaTuru` | **`GV.hr.ozlukGorebilir(e)`** |
| Ücret | `maas` **ya da** `saatlikUcret` (XOR — ikisi birden dolu değildir) | **`GV.hr.maasGorebilir()`** |
| Oturum | `GV.session.rolAd` · `GV.perm.role()` · `GV.perm.scope('gor')` · görünür menü girdisi sayısı (`GV.shell.visibleItems().length`) | yok |

`izinBakiye` ve `doluluk` **basılabilir** (genel alanlardır, §20.1
tablosunda özlük sınıfında değildir).

**Rol listesi:** `e.roller` bir DİZİDİR (`['sahip','genelmudur']`) ve
`e.rol` etkin roldür. İkisi de basılır; ad `DB.roleName(key)` ile çözülür,
elle yazılmaz. **Uydurma rol adı yasaktır** — 27 rolün tamamı
`DB.roles` içindedir.

**`bildirim` sekmesi — DÜRÜST BOŞLUK (rota 135).**

Ölçüldü: `DB.employees` kaydında **bildirim tercihi alanı YOKTUR**.
`DB.notificationChannels` yedi kanal adı taşıyan bir SÖZLÜKTÜR, kişiye
bağlı bir tercih kaydı değildir. Dolayısıyla:

- Yedi kanal **listelenir** (sözlükten, elle yazılmaz).
- Her kanalın anahtarı **devre dışı** basılır ve sebebi yazılır — çalışmayan
  bir anahtar kullanıcıya tutulmayacak bir söz verir (§14.6).
  `GV.form` `type:'switch'` alanı KULLANILMAZ; devre dışı gösterim
  `GV.dl` satırı + `GV.badge('Pasif')` ile kurulur.
- Kullanıcının GERÇEKTEN ölçülebilir bildirim yüzeyi **otomasyon
  kurallarıdır**: `DB.automations` (22 kayıt, 22'si `Aktif`) `kanal[]`
  alanı taşır. Ölçüldü: bu 22 kuralın kullandığı kanallar yalnız
  **`Sistem içi`** ve **`E-posta`** — kalan beş kanalı kullanan kural
  YOKTUR ve ekran bunu **yazar**.
- Okunmamış bildirim sayısı `GV.counters.bildirim`ten okunur; ikinci sayaç
  yazılmaz.

### 21.4 `app-ayar-sirket.html` — ŞİRKET VE ERİŞİM (rota 136–141)

| Sekme | Kaynak | Ölçülen adet |
|---|---|---|
| `sirket` | `DB.company` | 16 alan · `aktifModuller` 8 anahtar |
| `departman` | `DB.departments` | **21** (18 aktif · 3 pasif) · `ustDepartman` 19/21 · `DB.departmentGroups` 8 grup |
| `kullanici` | `DB.employees` | **16** · `durum`: `Aktif` 15 · `Offboarding` 1 |
| `rol` | `DB.roles` | **27** · `DB.permMatrix` 27 — birebir eşleşiyor, yetim yok |
| `yetki` | `DB.permMatrix` | 27 rol × **11 anahtar** |
| `onay` | `DB.approvalFlows` (**3**) + `DB.approvalTypes` (**8**) | — |

**`sirket` sekmesi.** `DB.company` alanları `GV.dl` ile basılır. İki nokta
zorunludur:

1. **İç maliyet sabitleri görünür olmalıdır**: `isverenMaliyetKatsayisi`
   (1.225) ve `aylikCalismaSaati` (176). Bunlar proje maliyetinin
   girdisidir ve `org.js` "hesabın girdisi koda gömülürse maliyet sessizce
   değişir" diye yazıyor — ayar ekranı onları görünür kılan yerdir.
   `perm:'finans'` kapısı uygulanır.
2. **Modül anahtarları — bu dilimin TEK gerçek mutasyonu.**

```js
GV.ayar.modulAnahtarlari()          // ['satis','proje','destek','personel',
                                    //  'finans','satinalma','demirbas','filo']  (8)
GV.ayar.modulAcik('filo')           // boolean
GV.ayar.modulYetkisi()              // boolean — sahip · genelmudur · sistem
GV.ayar.modulAyarla(anahtar, acik, gerekce)
//  → { ok:true,  anahtar, eski, yeni, gerekce }
//  → { ok:false, why:'yetki'|'gerekce'|'kayit'|'degisiklikyok', mesaj }
```

⚠️ **KAPI İKİ YÖNDE DE AYNIDIR ve bu ölçüldü.** Açmak ile kapatmak aynı
yetki kümesini ister (`sahip · genelmudur · sistem`) ve aynı gerekçe
koşulunu taşır (≥8 karakter). Geri almak, yapmaktan ağır değildir. Ekran
bu simetriyi **bozmaz**: iki yön için ayrı düğme koşulu yazma, ikisini de
`GV.ayar.modulYetkisi()` ile göster ve reddi `r.mesaj` ile bas.

Mutasyondan sonra **`GV.refresh()`** çağrılır — menü o anda yeniden çizilir
ve kapatılan modülün girdisi düşer. `location.reload()` yasaktır (§14.1).
Denetim izini `GV.ayar.modulAyarla` **kendi yazar**; ekran ikinci kez
`GV.audit.yaz` çağırmaz (§9.1).

**`departman` · `kullanici` · `rol` sekmeleri `GV.list`tir** (`urlSync:false`).

- `departman`: `DB.departments` `durum` ekseni **yoktur** → `aktif` orada
  **KANONDUR ve okunması doğrudur** (§20.2, `GV.arsivli` üç istisnadan
  biri). `GV.arsivli(d)` kullan; `d.aktif`i elle süzme.
  Yönetici alanı `GV.user(d.yonetici)`, `personel` sayısı sayıdır.
  `ustDepartman` 2 kayıtta boştur → `—` (§10.1).
- `kullanici`: `DB.employees`. **`aktif` alanı TUZAKTIR — okuma** (§20.2);
  pasiflik `GV.hr.durum(e)` / `GV.arsivli(e)` üzerinden sorulur.
  Kolonlar: `kod · ad · rol`(`DB.roleName`) · `dep` · `pozisyon` ·
  `durum`(badge) · `girisTarihi`. **Maaş kolonu YOKTUR** — kullanıcı
  yönetimi bir bordro yüzeyi değildir; maaş `app-personel-detay.html`
  yetkisine aittir. `eposta` özlük sınıfındadır → `GV.hr.ozluk(e,'eposta')`
  ile bas.
- `rol`: `DB.roles` (27) — `key · ad · kademe · dash`. Rolün kaç kişide
  etkin olduğu `DB.employees` `rol`/`roller` alanından **türetilir**;
  türetilemeyen sayı basılmaz.

**`yetki` sekmesi — YETKİ MATRİSİ.** 27 rol × 11 anahtar bir tablodur ve
`GV.list` kolon yöneticisiyle taşınamaz (kolonlar veri, satır da veri).
`GV.cols.tbl` rapor tablosu iskeletidir; burada **`GV.list`** kullanılır ve
11 anahtar 11 kolondur:
`gor · ekle · duzenle · sil` (kapsam dizesi: `tum|departman|proje|kendi|musteri|yok`) ·
`onay · finans · maas · log · disaAktar` (boolean) ·
`rapor · personel` (kapsam dizesi).
Boolean hücre `GV.badge` ile, kapsam hücresi düz metinle basılır; `'yok'`
değeri `GV.cell.faint` ile soluklaştırılır — **`0` basılmaz**.

**`onay` sekmesi.** `DB.approvalFlows` üç zincir taşır; her zincirin
`adimlar[]` dizisi `{ sira, rol, ad, kosul, esik, sla }` alanlıdır.
`GV.chain([...])` bileşeni bir onay zincirini basmak içindir (§6.2) ama
alan adları farklıdır (`{ rol, kisi, durum, tarih, not }`) — bu bir
**tanım**dır, bir **koşum** değildir. Bu yüzden `GV.chain` KULLANILMAZ;
adımlar `GV.dl` ile basılır ve `kosul:'tutar'` olan adımın eşiği
(`esik`) `GV.cell.mny` ile gösterilir. `esik:null` olan adım "her zaman
çalışır" diye yazılır — `0` yazmak eşik varmış gibi olurdu.
`DB.approvalTypes` 8 tipin **ikisinde `entity:null`** (`Komisyon kazancı`
ve timesheet onayı) — bu bir eksik değil, "kaynak kaydın durum makinesi
yok" beyanıdır ve ekran bunu **aynen yazar**.

### 21.5 `app-ayar-entegrasyon.html` — ENTEGRASYONLAR (rota 142 · 143)

> ⚠️ **BU EKRANDA GERÇEK ANAHTAR ALANI AÇILMAZ.** `<input>` bile yok.
> Şartname §8.7: "Canlı anahtarlar kodda veya istemci paketinde
> bulunmamalıdır." Bir anahtar kutusu basmak, anahtarın istemcide
> toplanabileceğini ima ederdi.

**SAHTE BAĞLANTI DURUMU BASILMAZ — bu bir veri çelişkisidir ve ölçüldü.**

`DB.integrations` 10 kayıt taşır ve **dördü `durum:'Bağlı'` der**
(`ENT-001` GitHub · `ENT-003` Google Calendar · `ENT-007` Paraşüt ·
`ENT-009` OpenAI API). Aynı veri dosyası bunun 60 satır altında şunu yazar:
"Bu prototipte GERÇEK BİR ENTEGRASYON KOŞUMU YOK — `DB.integrations`
yalnız bağlantı tanımlarını taşıyor, hiçbiri çalışmıyor."

İkisi aynı anda doğru olamaz. Karar **K-34**: kayıt silinmez, **iddia ile
ölçüm ayrıştırılır** (K-30'daki tutanaksız zimmet iddiasının aynı çözümü).
Yordam ortak katmandadır; ekran kuralı yeniden tanımlamaz:

```js
GV.entegrasyon.liste()             // DB.integrations (10)
GV.entegrasyon.kayit(kod)          // tek kayıt ya da null
GV.entegrasyon.kanit()             // { kosumDefteri:null, hataKuyrugu:0,
                                   //   webhookOlayi:0, odemeSaglayici:'TEST-MOCK' }
GV.entegrasyon.kosumVar()          // false — üç kanıt da boş
GV.entegrasyon.olculenDurum()      // 'Bağlanmadı'  (koşum varsa null döner)
GV.entegrasyon.olculemedi()        // true — koşum defteri koleksiyonu HİÇ YOK
GV.entegrasyon.katalogIddiasi(e)   // e.durum — KATALOGUN İDDİASI, ölçüm DEĞİL
GV.entegrasyon.celisir(e)          // iddia 'Bağlı' ama koşum yok
GV.entegrasyon.celisenler()        // 4 kayıt
GV.entegrasyon.kategoriler()       // 6: Doküman · Kaynak kod · Muhasebe ·
                                   //    Takvim · Yapay zekâ · İletişim
GV.entegrasyon.odemeAdaptoru()     // §8.7 — aşağıda
```

**`saglayici` sekmesinin sözleşmesi:**

1. Sayfa üstünde **`GV.notice({tone:'warn'})`** ile tek cümlelik beyan:
   hiçbir sağlayıcı bağlı değildir, koşum defteri yoktur, aşağıdaki
   "katalog iddiası" sütunu bir ölçüm değildir.
2. Listede **ölçülen durum** kolonu `GV.entegrasyon.olculenDurum()`
   değerini basar — 10 kaydın **10'unda** `Bağlanmadı`.
3. **Katalog iddiası ayrı bir kolondur** ve `GV.badge` ile **yeşil
   basılmaz**; düz metin + `GV.cell.faint` açıklamasıyla basılır.
   Çelişen 4 kayıtta `GV.cell.sub('ölçümle çelişiyor')` eklenir.
4. **Bağlan / Bağlantıyı kes düğmesi YOKTUR.** Yapılamayan iş düğme olarak
   vaat edilmez (§14.6). Bir düğme koyacaksan `run` yaz; yazamıyorsan
   aksiyonu hiç ekleme.

**`odeme` sekmesi (perm:`finans`).** Kart formu, anahtar kutusu, "test
kartı" YOKTUR. Basılacaklar:

```js
var a = GV.entegrasyon.odemeAdaptoru();
// a.saglayici  → 'TEST-MOCK'
// a.etiket     → 'TEST — sağlayıcı seçilmedi'
// a.secildi    → false
// a.yordamlar  → 5 ad: createCheckoutSession · verifyWebhook ·
//                getPaymentStatus · refundPayment · cancelSession   (§8.7)
// a.acikMadde  → DB.paymentBackendGaps'ten §8.5/§8.6/§8.7 maddeleri
```

Beş yordam **şartnameden alınmıştır**, uydurulmadı; hiçbiri uygulanmadı ve
ekran bunu madde madde yazar. `DB.paymentLinkDefaults.gecerlilikGun` (14) ve
`paraBirimi` (`'TRY'`) şirket varsayılanı olarak **okunur**, düzenlenmez.

**`otomasyon` sekmesi (rota 143).** `DB.automations` 22 kayıt, 22'si
`Aktif`. `GV.list` (`urlSync:false`), kolonlar:
`kod · ad · tetikleyici · islem · kullanici · kanal[]` (dizi — `join(' · ')`)
· `durum`. **Aç/kapa anahtarı YOKTUR** — otomasyon motoru yoktur, kural
kayıtları bir katalogdur ve ekran bunu yazar. Ölçüldü: 22 kuralın kullandığı
kanal kümesi yalnız `Sistem içi` ve `E-posta`.

**`hata` sekmesi.** `DB.integrationErrors` **boştur (0 kayıt)** ve bu
BİLEREK böyledir. Ekran **"hata yok" DEMEZ** — "koşum kaydı yok, kontrol
yapılamadı" der (§10.1: boş ≠ sıfır ≠ ölçülemedi). `GV.empty` kullanılır ve
şema alanları (`kod · entegrasyon · olayTipi · kayit · deneme · sonMesaj ·
payloadOzet · onerilenCozum · durum · ilkGorulme · sonGorulme · replaySonuc`)
"kayıt yazıldığında" beklenen biçim olarak listelenir.

### 21.6 `app-ayar-log.html` — SİSTEM KAYITLARI (rota 144 · 145 · 146)

> ⚠️ **BU EKRAN İKİNCİ BİR DEFTER ÜRETMEZ.** `DB.logs`a doğrudan yazmak,
> `DB.activities`e `unshift` etmek, ya da kendi olay dizisini kurmak
> YASAKTIR. Tek yüzey `GV.audit`tir (§9.1) ve o iki defteri zaten
> birleştirir, **tekilleştirir** ve tek zaman çizelgesi döndürür.

```js
GV.audit.oku(null, 0)   // kayıt kodu null → TÜM defter; limit 0/atlanırsa hepsi
GV.audit.denetle()      // { olay:207, sistem:7, toplam:214, kayitKodsuz:0, aktorsuz:0 }
```

**Ölçüldü:** `DB.activities` 207 · `DB.logs` 7 · birleşik ve tekilleştirilmiş
`GV.audit.oku(null,0)` → **214 satır**, kimlikler **214/214 benzersiz**.

Dönen satırın alanları — **bunlar dışında alan yoktur**:

| Alan | Not |
|---|---|
| `id` | **satır kimliği** — `GV.list` `key:'id'` bunu kullanır |
| `kod` | sistem defterinde `LOG-*` (7 satır), olay defterinde **`null`** |
| `tarih` · `kisi` · `metin` · `eski` · `yeni` · `tone` · `icon` · `kayit` | — |
| `modul` · `ip` | **yalnız sistem defterinden gelen 7 satırda dolu** |
| `defter` | `'olay'` (207) ya da `'sistem'` (7) |

⚠️ `id` bir dizi indeksi DEĞİLDİR (iki defter de `unshift` ile büyür, indeks
kayar); içerikten türetilmiş kaçışlı bir anahtardır. Ekran onu **basmaz**,
yalnız `key` olarak verir.

**`kayit` sekmesi (perm:`log`).** Tek `GV.list` (`urlSync:false`,
`key:'id'`, `pageSize:20`). Kolonlar: `tarih` · `kisi`(`GV.user`) ·
`metin` · `kayit` · `modul` · `defter`. Filtreler **sözlükten değil,
satırlardan türetilir** (modül sözlüğü YOKTUR) ve ekran "seçenekler mevcut
214 satırdan türetildi" diye **yazar** (§10.1). `eski`/`yeni` değişimi
`GV.cell.sub` ile alt satıra basılır; ikisi de boşsa satır atlanmaz —
"değer değişimi kaydedilmemiş" yazılır.
`modul` **7/214 satırda doludur**; kalan 207'de `—` basılır ve sebebi
yazılır (olay defteri modül taşımaz).

**`arsiv` sekmesi (rota 145).** `DB.documents` **11 kayıt** ·
`DB.documentVersions` 16 · `DB.documentApprovals` 15.
`DB.documents` `durum` ekseni **yoktur** → `aktif` orada **KANONDUR**
(`GV.arsivli(d)` — §20.2 üç istisnadan biri). Kolonlar:
`kod · ad · tur · klasor · versiyon · yukleyen`(`GV.user`) · `tarih` ·
`sonKullanma` · `kalanGun` · `gizlilik` · `onay`.
`kalanGun` negatifse `GV.cell.gun(n,'danger')`. **İndirme düğmesi YOKTUR** —
`BE-S4` gereği dosya gerçek depoda değildir; `boyut` ve `format` alanları
basılır ve indirilemezliği yazılır.
10 belge türü **kayıtlardan türetilir** (`contractTypes` sözlüğü yoktur).

**`kalite` sekmesi (rota 146).** ⚠️ **BU SEKME YENİ ÖLÇÜM ÜRETMEZ** — ortak
katmanın kendi nöbetçilerini **okur ve basar**. Hepsi yayındaki gerçek
yordamlardır:

| Kontrol | Kaynak | Bugünkü değer |
|---|---|---|
| Denetim izi bütünlüğü | `GV.audit.denetle()` | 207 + 7 = 214 · kayıt kodsuz 0 · aktörsüz 0 |
| Bayat `aktif` okuması | `DB.bayatAktif` | `sayac` **0** · 38 koleksiyon tuzaklı · 15 koleksiyonda `aktif` kanon |
| Bayat İK alanı | `DB.ikBayat.sayac` | **0** |
| Envanter türetimi | `GV.varlik.sonTazeleme` | `olculen` 15 · `degisen` **0** (K-30: sıfır KALMALIDIR) |
| Düşen zimmet iddiası | `DB.assetClaimDrops` | **3** kayıt — tutanak değil, düşme kaydıdır |
| Fatura durumu sapması | `GV.fin.sonSapma` | **0** |
| Onay sayacı sapması | `GV.approval.sonSapma` | **0** |
| Entegrasyon koşumu | `GV.entegrasyon.kanit()` | koşum defteri **YOK** → "ölçülemedi", "hata yok" DEĞİL |
| Ödeme sağlayıcısı | `DB.paymentLinkDefaults.saglayici` | `TEST-MOCK` — seçilmedi |

Her satır üç şeyi birden söyler: **ne ölçüldü · değer · ölçülemediyse
neden**. Sıfır değer `0` olarak basılır (kayıt var, değer sıfır);
ölçülemeyen `—` + sebep olarak basılır (§10.1).

### 21.7 Bu dilimde beyan edilecek backend payı

Ajan **yalnız kendi ekranıyla ilgili maddeleri** basar; ilgisiz madde
beyanı gürültüye çevirir. Biçim §10.2(b).

| Kod | Madde | Hangi ekran |
|---|---|---|
| `BE-A1` | Bildirim kanalı tercihi kullanıcı bazında saklanmaz; kaynak veride kişiye bağlı tercih kaydı yoktur | profil |
| `BE-A2` | Profil düzenleme sunucuya yazmaz; kişisel veri değişikliği bir onay/denetim akışına bağlanmalıdır | profil |
| `BE-K1` | Kişisel veri kapısı yalnız arayüzdedir; özlük ve maaş alanları **sunucuda** filtrelenmeli, maskelenmiş alan istemciye hiç gitmemelidir | profil · sirket |
| `BE-A3` | Rol ve yetki matrisi salt okunurdur; yetki değişikliği sunucuda sürüm ve yürürlük tarihi ile saklanmalıdır | sirket |
| `BE-A4` | Modül anahtarı bellekte tutulur; sayfa yenilenince şirket varsayılanına döner | sirket |
| `BE-A5` | Onay zincirleri bir tanımdır, koşum motoru değildir; eşik ve SLA sunucuda uygulanmalıdır | sirket |
| `BE-A6` | Hiçbir entegrasyon adaptörü uygulanmadı; katalog bir niyet kaydıdır, koşum defteri yoktur | entegrasyon |
| `BE-A7` | Otomasyon kuralları çalışmaz; tetikleyici ve kanal alanları bir katalogdur | entegrasyon |
| `BE-A8` | Denetim izi **değişmez (append-only)** değildir ve kalıcı değildir; §8.6 append-only defter ister | log |
| `BE-S4` | Belge yükleme gerçek depoya yazmaz; dosya adı ve boyutu bellekte tutulur, indirilemez | log |
| `BE-S5` | Aktivite/denetim izi kalıcı değildir; sayfa yenilenince sıfırlanır | profil · sirket · entegrasyon · log |
| `B-08` | Gerçek sağlayıcı adaptörü — bugün TEST/mock (`DB.paymentBackendGaps`) | entegrasyon |

### 21.8 Bu dilimde ortak katmana EKLENEN imzalar (ajan bunları ÇAĞIRIR, yazmaz)

| İmza | Nerede | Ne yapar |
|---|---|---|
| `GV.shell.ayarSekmeleri(ekran)` | `shell.js` | Ayar sekmelerini yetkiden süzerek üretir (§3.3) |
| `GV.shell.ayarSekmeHam` | `shell.js` | Süzülmemiş ham kayıt — yalnız ölçüm |
| `GV.audit.oku()[].id` · `[].kod` | `domain.js` | Birleşik defter satırına **kararlı kimlik** — `GV.list` `key:` için |
| `GV.entegrasyon.*` (11 yordam) | `domain.js` | K-34 — bağlantı durumu türetilir, katalogdan okunmaz |
| `GV.ayar.modulAnahtarlari/Acik/Yetkisi/Ayarla` | `domain.js` | Modül anahtarı — kapı iki yönde de aynı |

### 21.9 Yasaklar — bu dilime özel (§14'e EK)

1. `assets/` altında **hiçbir dosya** değiştirilmez — `.js` · `.css` · `.js` veri.
2. `shell.js` `SECTIONS`'a menü girdisi eklenmez; ekran menü sayımını değiştirmez.
3. Sekme listesi ekranda **yazılmaz** — `GV.shell.ayarSekmeleri()` çağrılır.
4. **Anahtar/parola/token `<input>`u açılmaz** (§8.7).
5. **Sahte bağlantı durumu basılmaz**; `e.durum` doğrudan `GV.badge`'e verilmez.
6. `DB.logs` / `DB.activities` üstüne **doğrudan yazılmaz**; tek kapı `GV.audit`.
7. Çalışmayan bir anahtar/`switch` basılmaz — devre dışı bas ve **sebebini yaz**.
8. `DB.company` alanları doğrudan atanmaz; tek mutasyon `GV.ayar.modulAyarla`.
9. `e.aktif` okunmaz (tuzak) — `departments` · `contacts` · `documents` **istisnadır**,
   orada `aktif` kanondur ve `GV.arsivli(r)` üzerinden sorulur.
10. Aynı sayfada ikinci `GV.tabs` kümesi kurulmaz.

### 21.10 Ajan raporunda ZORUNLU olanlar

Ekran dosyası ve satır sayısı · basılan sekmeler ve hangi rolde kaçı
göründüğü · çağırdığın her `GV.*` yordamı · türettiğin her sayının kaynağı ·
**boş bıraktığın alan ve sebebi** · beyan ettiğin backend maddeleri ·
eksik bulduğun bileşen (yazmadın, rapor ettin) · ölçemediğin şey.

### 21.11 Dört ajanın brief'te BULAMADIĞI imzalar (bu turda eklendi)

Bu bölüm ölçümdür, süs değildir: dilim 5'te dört ajanın **dördü de** aşağıdaki
imzalardan en az birini brief'te bulamadı ve ortak katmanı kazarak buldu.
Kazı pahalıdır ve keşif yasağını fiilen deler. Aşağıdakiler bundan sonra
**brief'ten okunur.**

**`GV.fmt` — biçimlendirici (`ui.js`). `GV.cell` HTML üretir, `GV.fmt` METİN.**

```js
GV.fmt.num(1234)          // '1.234'      · basamak seçeneği: GV.fmt.num(1.5, 1)
GV.fmt.date('2026-08-03') // '03.08.2026' · boş/None → '—'
GV.fmt.dt('2026-08-03T09:12')  // '03.08.2026 09:12'
GV.fmt.money(1500) · GV.fmt.moneyK(1500000)   // '1,5 Mn' — KPI için
GV.fmt.pct(72) · GV.fmt.hours(7.5)
GV.fmt.days('2026-08-25')      // ⚠️ SÜRE BİÇİMLENDİRİCİSİ DEĞİL
GV.fmt.rel('2026-08-25')       // 'bugün' · 'yarın' · 'dün' · '3 gün sonra'
```
⚠️ **DÜZELTME — `GV.fmt.days` yukarıda BİR SÜRE BİÇİMLENDİRİCİSİ GİBİ
yazılıydı ve yanlıştı.** Gerçek imza `days(iso, today)`: iki tarih arasındaki
**tam gün farkını** döndürür (`today` verilmezse `DB.today`), bir sayıyı
"3 gün" diye biçimlendirmez.
<!-- brief-dogrula:yoksay-basla -->
Yanlış yazım `GV.fmt.days(3)`tü: o çağrı `new Date('3T00:00:00')` üretip
**`NaN`** döndürür ve o `NaN` DOM'a basılır — dilim 6'da bir ajan bu satırı
brief'ten okuyup tam olarak bunu yaşadı. `[B5.4]` ekseni artık bu sınıfı
yakalıyor; bu blok ölçüm dışında çünkü hatayı ÖRNEK olarak anıyor.
<!-- brief-dogrula:yoksay-bitir -->
Gün SAYISI basacaksan `GV.fmt.num(n) + ' gün'` ya da hücre tarafında
`GV.cell.gun(n, tone)` kullan.
⚠️ `GV.fmt.mny` **YOKTUR** (§4.3). Para HTML'i `GV.cell.mny`dir.

**`GV.list` — brief'te yazılı olmayan üç bayrak (üçü de gerçek):**

| Bayrak | Ne yapar |
|---|---|
| `passive:['Hurda']` | Bu durumlar arşiv toggle'ı açılmadan listede görünmez (§20.7) |
| `urlKeep:['t']` | Sayfanın KENDİ url anahtarını `GV.list` ne okur ne siler (§20.7) |
| `rowOpen(kayit, render)` | Satıra tıklayınca çağrılır; satır içi `a/button/input` tıklaması tetiklemez (§18.9) |

**`GV.drawer(cfg)` — çekmece (`ui.js`).** Sözleşme:
`{ title, body, actions, side, onMount, onOpen }`. **`sub` alanı YOKTUR** —
alt başlık gövdenin ilk satırına basılır. Dönen nesnede `close()` vardır.
Desteklenmeyen anahtar **sessizce yutulur** (`shell.js` bu tuzağa düştü).

```js
var d = GV.drawer({ title:'Demirbaş DMB-2025-004', body:'',
  onMount:function(govde){ govde.innerHTML = html; bagla(govde); } });
d.close();
```

**`GV.chipbar(root)` · `GV.tabs(root)` — ikisi de ÇİZİMDEN SONRA çağrılır.**
⚠️ K-37: ikisi de artık şeridin `scrollLeft`ini ayarlar, `scrollIntoView`
**çağırmaz**. Bir ekran çizim anında `scrollIntoView` çağırırsa aynı kusuru
kendi eliyle geri getirir — **yasaktır** (§21.9'a ek).

**`GV.guardRecord(cfg)`** (`ui.js`) — müşteri oturumuna karşı kayıt kapısı.
`false` dönerse ekran yetkisiz durumunu **bastı**, çağıran hemen `return` eder.

**Sayaçlar ve oturum — ikinci sayaç yazma:**
```js
GV.counters.bildirim · .onay · .bana · .teklif · .destek · .izin · .tahsilat · .satinalma
GV.shell.visibleItems()   // [{ alan, lbl, href, yonetim }] — görünür menü girdisi
GV.shell.ekranAcilabilir(href)  // isBuilt + yetki kapısı (K-36 sonrası menü kaydını okur)
```
⚠️ **Müşteri oturumunda `GV.counters` kapsamlıdır**: `bildirim` · `onay` · `izin`
dalları `0` **sabiti** döner (`shell.js` müşteri dalı). O `0` bir ölçüm
DEĞİLDİR — ekran onu ölçüm gibi basmaz, `—` + sebep basar (§10.1).

**Dizi alanı olan kayıtlar** — `join(' · ')` ile basılır, tekil sanılmaz:
`DB.employees[].roller · .yetkinlik · .teknoloji · .sertifika` ·
`DB.automations[].kanal` · `DB.trainings[].katilimci` ·
`DB.approvalFlows[].adimlar` · `DB.maintenance[].islemler`.

**Sözlüğü OLMAYAN alanlar — değerleri kayıtlardan türet ve NEREDEN
türettiğini ekranda yaz** (§10.1). Ölçüldü, bu liste tamdır:
`vehicleStatuses` · `contractTypes` · `performanceStatuses` ·
`trainingStatuses` · `timelogStatuses` · `timesheetStatuses` ·
`integrationCategories` · `documentTypes` · `gizlilikSeviyeleri` ·
**`modulAdlari`** (modül anahtarının insan-okur adı yoktur — anahtar HAM basılır).

**`ui.js` ton sözlüğünde karşılığı OLMAYAN değerler** — `GV.badge` çağırma,
düz metin bas (rozet uydurmak, sözlükte olmayanı varmış gibi göstermektir):
`Gizli` · `İç kullanım` · `Kişisel veri` (belge gizliliği).

### 21.12 Ajan kazısını önleyen kural

Bir ekranın ihtiyacı olan imza **brief'te yoksa ajan açılmaz** — imza önce
buraya yazılır. Dilim 5'te bu kural bir kez çiğnendi ve dört ajanın dördü de
ortak katmanı kazdı. Kazının maliyeti ölçüldü: ajan başına ortalama **80
araç çağrısı**. Brief'e bir imza yazmanın maliyeti bir satırdır.

## 22. Dilim 6 — KALAN DOKUZ EKRAN (rota defterinin son KARŞILIĞI VAR satırları)

§1–§21 aynen geçerlidir. Bu bölümdeki her sayı **ölçüldü**; ajan hiçbirini
yeniden ölçmek zorunda değildir. Bir imza burada yoksa **ajan onu yazmaz,
rapor eder** (§21.12).

> **Bu dilim rota defterini kapatıyor.** Dilim 5 sonunda `KARŞILIĞI VAR` olup
> yayında olmayan 11 satır vardı; ikisi (`app-dokuman.html` · `-detay`) beyar
> kararıyla **GÖMÜLÜYOR**'a çevrildi (V2-68 · ADR-R2-06 revizyonu), kalan
> **dokuzu bu dilimde yazılıyor**. Bundan sonra kendi ekranını almış olup
> yazılmamış satır **kalmıyor**.

### 22.0 Ekranlar, kabuk öznitelikleri ve YAZIM SIRASI

**Form ekranları ÖNCE yazılır** — detay ekranları onlara bağlantı verir ve
`GV.afterSave` hedefi olarak onları kullanır.

| # | Rota | Dosya | `data-sec` | `data-screen` | mount |
|---|---|---|---|---|---|
| 1 | 32 | `app-proje-form.html` | `operasyon` | `proje` | `rec` |
| 2 | 115 | `app-satinalma-form.html` | `finans` | `satinalma` | `rec` |
| 3 | 82 | `app-personel-form.html` | `ekip` | `personel` | `rec` |
| 4 | 89 | `app-izin-form.html` | `ekip` | `zaman` | `rec` |
| 5 | 95 | `app-demirbas-form.html` | `ekip` | `varlik` | `rec` |
| 6 | 100 | `app-arac-form.html` | `ekip` | `varlik` | `rec` |
| 7 | 81 | `app-personel-detay.html` | `ekip` | `personel` | `rec` |
| 8 | 94 | `app-demirbas-detay.html` | `ekip` | `varlik` | `rec` |
| 9 | 99 | `app-arac-detay.html` | `ekip` | `varlik` | `rec` |

**Veri dosyaları** (§1.1 sırası pazarlığa kapalı):

| Ekran | Yüklenecek `assets/data/*.js` |
|---|---|
| yedi `ekip` ekranı (3-9) | `org` · `crm` · `work` · `misc` · `ops` · **`hr`** · `lifecycle` |
| `app-proje-form.html` | `org` · `crm` · `work` · `misc` · `ops` · **`hr`** · `lifecycle` |
| `app-satinalma-form.html` | `org` · `crm` · `work` · `misc` · `ops` · `lifecycle` |

`firsat.js` · `odeme.js` · `notes.js` · `reports.js` **hiçbirinde yüklenmez**.
`hr.js` satın alma formunda da gerekmez (`DB.purchases` `ops.js`tedir) —
kullanmadığın veri dosyasını yükleme.

⚠️ **`assets/` altına ajan DOKUNMAZ.** Bir ekran `BUILT` listesine ana oturum
tarafından, dosya diske düştükten sonra eklenir (`ayar-ekseni` `BUILT ==
disk` eşitliğini her koşumda ölçer). Ajan `shell.js`e ekran adı yazmaz.

### 22.1 Bu dilimde ortak katmana EKLENEN imzalar — ajan ÇAĞIRIR, yazmaz

Üçü de bu tur ana oturumda yazıldı ve ölçüldü. Ajan bunları **hazır bulur**.

```js
/* K-38 · ADR-R2-38 — onay zinciri adımının MUHATABI */
GV.approval.adimMuhatap(adim, kayit)
//  → { tur:'rol'|'iliski'|'celiski'|null, anahtar, ad, kisi, cozuldu, neden }
//  `tur:'rol'`    → bir KÜME ("muhasebe rolündeki herkes"). `kisi` HER ZAMAN null.
//  `tur:'iliski'` → bir KENAR ("BU kaydın kişisinin yöneticisi"). `kisi` dolu.
//  `cozuldu:false` → muhatap ÇÖZÜLEMEDİ; `neden` basılır, kişi UYDURULMAZ.
//  Kayıt verilmezse ilişki adımı `cozuldu:false` döner — bu bir kusur değil,
//  "zincir TANIMI gösteriliyor, koşumu değil" cevabıdır.
GV.approval.ILISKILER        // { yonetici:{ad,alan,kisiAlan,aciklama}, veren:{…} }

/* K-39 · ADR-R2-39 — maaş kapısı, ÖZ-ERİŞİM AÇIK */
GV.hr.maasGorebilir(e)   // KAYIT sorusu: kendi kaydı → true · başkası → permMatrix.maas
GV.hr.maasGorebilir()     // KÜME sorusu: "başkalarının ücreti" · öz-erişimden ETKİLENMEZ
GV.hr.maasKapi(e)         // → { acik, kaynak:'permMatrix.maas'|'ozErisim', neden }
GV.hr.maas(e, alan)       // yetkisizde '••••••' döner, BOŞ ya da 0 DEĞİL
                          // alan verilmezse 'maas'; 'saatlikUcret' de AYNI kapıda
```

⚠️ **KÜME ile KAYIT sorusunu karıştırmak yasak.** Bir kişinin kendi ücretini
görmesi 15 kişilik bir toplamı, bir para süzgecini ya da bir doluluk sayacını
**açmaz** (maskelenen değer süzgeçle dolaylı olarak geri hesaplanır — UID-11).
Kural: **tek kayıt basıyorsan argümanlı, küme sayıyorsan argümansız çağır.**
Liste kolonunda `perm:'maas'` DEĞİL satır bazlı `mask:function(e){ return
!GV.hr.maasGorebilir(e); }` kullanılır (`app-personel.html` bu turda öyle
düzeltildi).

**`Gates.projeAktif` bu turda onarıldı (K-40 · ADR-R2-40).** Eskiden `p.bitis`
ve `p.sozlesme` okuyordu; ikisi de `DB.projects` şemasında **yok**. Kapı 14
projenin 14'ünde reddediyordu ve `istisnaRol` boş olduğu için **hiçbir proje
Aktife alınamıyordu**. Artık `planlananBitis` okunuyor ve sözleşme bağı
otorite defterden (`DB.contracts[].proje`) geliyor: geçen **8/14**, reddeden
**6/14** (altısı da 2023-2025 kapanmış, sözleşme kaydı olmayan projeler).

### 22.1b Dilim 6'nın İLK AJANININ brief'te BULAMADIĞI imzalar

§21.11 ile aynı disiplin: bu bölüm ölçümdür. Aşağıdaki beş imza gerçektir,
yayındadır ve brief'te **yazılı değildi** — ilk ajan onları emsal ekranlardan
okumak zorunda kaldı. Bundan sonra **brief'ten okunur.**

**1 · `GV.gates` ORTAK KATMANDA AÇIKTIR (`domain.js:819`).** Brief bu ada
**hiç değinmiyordu** ve sonucu ölçüldü: ajan `Gates.projeAktif`in koşullarını
ekranda yeniden kurmak (bir AYNA yazmak) zorunda kaldı. Ayna eksik çıktı —
gerçek kapı sözleşme kaynaklı projede `musteri` alanını da soruyor, ayna
sormuyordu; 14 kaydın 14'ünde `musteri` dolu olduğu için ikisi **aynı
sonucu veriyordu**, yani kusur veri sayesinde görünmüyordu (V2-48 sınıfı).

```js
GV.gates.projeAktif(p) · .projeTeslim(p) · .projeKapanis(p) · .sozlesmeAktif(c)
GV.gates.teklifOnAnaliz(q) · .teslimKritikHata(d) · .izinBakiye(l)
GV.gates.personelEvrak(e) · .personelZimmet(e) · .firsatKazanma(o)
GV.gates.teklifSurumKilidi(q) · .destekKota(t)
//  → { ok:true } | { ok:false, why:'…' } | { ok:false, olculemedi:true, why:'…' }
//  bazıları ayrıca: { ok:true, uyari, gerekceZorunlu }
```
**Kural:** bir kapının bugünkü hâlini ekranda GÖSTERECEKSEN yordamı **çağır**;
koşullarını yeniden okuma. `GV.flow.adimlar` zaten `kapi` ADINI veriyor,
`GV.gates[ad]` de kararı verir. Yordam yoksa **"geçer" DEMEZ, "ölçülemedi"**
der (L-13).

**2 · `GV.hr.atanabilirler()` KAYIT DİZİSİ döndürür**, `{value,label}` değil.
`DB.employees` kayıtlarının kendisi, `ad`a göre `localeCompare(…, 'tr')` ile
sıralı. Çağıran yeniden sıralamaz; `select` seçeneklerini kendisi kurar
(`{ value:e.kod, label:e.ad }`). Bugün **15 kayıt** döner (16 personelin
`Aktif` olanları — `EMP-015` `Offboarding` olduğu için listede **yok**).

**3 · `GV.lifecycle.ad(evre)`** — evre anahtarının insan-okur adı
(`'MUSTERI'` → `'Müşteri'`). §9.2 bu yordamı listelemiyordu.
`GV.lifecycle.evreler` · `.sonraki(evre)` · `.hesap(kod)` · `.eksikAlanlar(h)` ·
`.gec(...)` · `.rozet(h)` ile aynı ad alanındadır.

**4 · DOĞUM LİTERALİ DESENİ ALTI FORM EKRANININ TAMAMINDA GEÇERLİDİR.**
§22.16 bunu yalnız personel ve izin için yazıyordu; proje · satın alma ·
demirbaş · araç için de aynıdır çünkü **hiçbirinin `olustur` yordamı yok**.
Desen: kod `kodUret()`ten, doğum durumu **nesne literalinde**, kayda sonradan
durum yazan satır yok, `list.push(yeni)`. Emsal: `app-teklif-form.html` ·
`app-fatura-form.html`. (`GV.task.olustur` ve `GV.destek.olustur` **vardır** —
görev ve destek formu onları çağırır; kalan altısında karşılığı yoktur.)

**5 · KORUNAN SEÇENEK — düzenlemede sözlükte olmayan değeri DÜŞÜRME.**
Sözlüksüz alanlarda seçenekler defterden türetilir; ama düzenlenen kaydın
kendi değeri o türetimin dışında kalabilir (silinmiş bir kategori, elle
girilmiş bir bütçe kodu). O değer listeye **eklenir**, yoksa `select` onu
sessizce başka bir değere çevirir ve kullanıcı kaydettiğinde **veri kaybolur**.

```js
function secenekler(defterDegerleri, mevcut){
  var l = defterDegerleri.slice();
  if(mevcut && l.indexOf(mevcut) === -1) l.push(mevcut);   /* korunan seçenek */
  return l;
}
```
Emsal: `app-destek-form.html`. Bu dilimde geçerli olduğu alanlar:
`altKategori` · `butceKodu` · `kategori` (satın alma) · `tur` (proje) ·
`lokasyon` · `mulkiyet` · `kullanim` · `tip` · `yakit` · `vites` · `renk` ·
`calismaTuru` · `sozlesme`.

### 22.1c İKİNCİ AJANIN brief'te BULAMADIĞI imzalar

Aynı disiplin (§21.11 · §22.1b). Dokuz madde; ilki bir brief **hatasıydı**,
kalanı **boşluk**.

**1 · `GV.fmt.days` §21.11'de YANLIŞ belgelenmişti — düzeltildi** (bkz. §21.11).
Ekranda `NaN` üretti. Süre değil TARİH FARKI yordamıdır.

**2 · `GV.approval.akisTanim(tur)` dönüş sözleşmesi:**
```js
GV.approval.akisTanim('Satın alma talebi')
//  → { kod:'AKS-SAT-1', ad, tur, surum:1, durum:'Yayında', yururluk, adimlar:[…] }
//  Yalnız `durum === 'Yayında'` olanı döner, en yüksek `surum` kazanır.
//  Yayında zincir yoksa null → ekran "yayında bir zincir tanımı yok" der.
```

**3 · `adim.kosul` DEĞER KÜMESİ — üç değer, ölçüldü:** `'hep'` · `'tutar'` ·
`'gun'`. ⚠️ Koşulsuz adım `kosul:null` DEĞİL **`kosul:'hep'`** taşır; ayırt
edici olan `esik == null`dır. `'tutar'` → `tahminiMaliyet >= esik`;
`'gun'` → `gun >= esik` (izin zincirinde).

**4 · `GV.approval.adim(tur, kayitKod)` — `tur` bir VARLIK ADI DEĞİL, onay
tipinin İNSAN-OKUR adıdır.** `'purchase'` değil **`'Satın alma talebi'`**;
anahtarlar `DB.approvalTypes` içindedir (8 tip). Dönüş:
`{ adim, toplam, siradaki, sonuclandi, reddedildi }` · zincir yoksa **`null`**
(ekran "zincir tanımlı değil" der, `0/0` basmaz).

**5 · `DB.purchases` — 18 alanın tam envanteri:**
`kod · talepEden · dep · proje · urun · kategori · aciklama · ozellik ·
miktar · tahminiMaliyet · ihtiyacTarihi · oncelik · gerekce · butceKodu ·
durum · olusturma · onayAdim · onayToplam`.

**6 · `olusturma` bir TARİHTİR, zaman damgası değil.** Ölçüldü: 7/7 kayıtta
`'2026-07-30'` biçiminde. §22.2'nin `DB.today + 'T' + HH:MM` damgası
`DB.activities`/`GV.audit` tarafı içindir; **kayıt alanlarında hangi biçim
kullanılıyorsa o korunur** — biçim değiştirmek defteri ikiye böler.
Bu dilimde tarih biçimi kullanan alanlar: `olusturma` (satın alma) ·
`talepTarihi`/`onayTarihi` (izin) · `alisTarihi`/`garantiBas`/`garantiBit`
(demirbaş) · `girisTarihi`/`cikisTarihi` (personel) · `teslimTarihi`
(zimmet). Saat taşıyan tek yer `DB.purchaseApprovals[].tarih`
(`'2026-07-30T14:20'`).

**7 · `app-satinalma.html` `?ac=<kod>` derin bağlantı sözleşmesi taşır** —
liste açılışında o kaydın çekmecesini açar. `GV.afterSave` `alt` düğmesi buna
bağlanır. Aynı sınıf: `app-varlik.html` `?t=<yuzey>` (§20.7) ·
`app-zaman.html#izin` · `app-personel.html?t=cikis`.

**8 · `GV.form` `options` DÜZ DİZE DİZİSİ de kabul eder** —
`options:['Yüksek','Orta']` ile `options:[{value,label}]` ikisi de geçerlidir
(`ui.js` select dalı). Sözlükten gelen listeler için birincisi yeterlidir.

**9 · §12'de yazılı OLMAYAN ama yayında olan sınıflar:** `u-mt-8` ·
`u-mt-4` (`ui.css` boşluk yardımcıları) · `.odl-gap` · `.odl-gap-kod` ·
`.odl-gap-bolum` (backend payı listesi — adı ödeme linki modülüne ait, V2-05).
Backend payı bloğunu bu üç sınıfla bas; `<style>` yazma.

### 22.1d ÜÇÜNCÜ AJANIN brief'te BULAMADIĞI imzalar

**1 · `GV.form` TÜRETİLMİŞ ALANI TAZELEYECEK BİR YOL SUNMUYOR.** Bileşen alan
değişiminde yalnız `aside`ı yeniden çiziyor; `form.sync()` sadece `showIf`i
değerlendiriyor. Bir alanın DEĞERİ türetilmişse (izin formunda `gun`) o değer
bayat kalır. Bugünkü tek yol, alanın DOM sözleşmesine dokunmaktır:

```js
/* Alanlar `<form>` içinde `input[name="<key>"]` olarak yaşar; bileşen
   `input` ve `change` olaylarını `<form>` üstünde dinler (delegasyon). */
var el = form.el.querySelector('[name="gun"]');
if(el && el.value !== String(v)) el.value = v;   /* değer yaz */
```
⚠️ Bu bir **kaçamaktır**, sözleşme değil: `GV.form` `setValue(key, deger)`
taşımıyor (borç **V2-83**). Kullanırsan ekranda beyan et.

**2 · `Gates.izinBakiye` EKSİK GİRDİDE `{ok:true}` DÖNER**, `olculemedi`
DEĞİL. §22.1b bazı kapıların "ölçülemedi" döndüğünü yazıyor; bunun
**dönmediğini** yazmıyordu. Personel/tür/tarih eksikken kapı "geçer" der.
**Ekran onu "geçer" diye BASMAZ**: kendi ölçülebilirlik sorusunu sorar ve
ölçemediğinde `—` + sebep basar (§10.1 · borç **V2-82**).

**3 · ONAY ZİNCİRİ ÖRNEĞİ YALNIZ SATIN ALMADA VAR.** Ölçüldü: 8 onay tipinin
**1'inde** `zincir` alanı tanımlı (`Satın alma talebi` → `purchaseApprovals`).
Yani `GV.approval.adim('İzin talebi', kod)` **7/7 kayıtta `null`** döner ve
bu doğru cevaptır. Ekran `0/0` BASMAZ, "bu tip için zincir örneği defteri
tanımlı değil" der. `DB.approvals` (12 kayıt) kuyruk kaydıdır, zincir örneği
değildir — izinde 3/7 talepte var ve salt okunur gösterilir.

**4 · `DB.leaves` — 13 alanın tam envanteri:**
`kod · personel · tur · baslangic · bitis · gun · vekil · gerekce · durum ·
onaylayan · talepTarihi · onayTarihi · cakisma` (+ `ret` 1/7 · `aktif`
**tuzaklı**). `onayTarihi` 5/7 · `vekil` 5/7.

**5 · `DB.holidays` — şekil ve KAPSAM:** `{ tarih, ad, kaynak }` · **14
kayıt** ve yalnız **iki yıl**: 2025 (7) · 2026 (7). Bu aralığın dışındaki bir
tarih için `GV.calendar.isGunu` tatilleri **eksik** sayar — hafta sonunu
bilir, resmî tatili bilmez. Bu aralığın dışına taşan bir hesap yapan ekran
**bunu beyan eder**.

**6 · `GV.flow.durumBilgi(tur, kod)`** (`domain.js:597`) — §7 listelemiyordu.
Kaydın durumu HAKKINDA tek başvuru noktası (`adimlar()` yapılabilir geçişleri
verir, bu durumun KENDİSİNİ anlatır):
```js
GV.flow.durumBilgi('leave', 'IZN-2026-038')
//  → { durum, terminal, yetki:[…], kilit:null|{…} }
```
`terminal:true` → bu durumdan çıkış yok. İkisini ayrı ayrı `DB.transitions`
okuyarak öğrenmek aynı kuralın ikinci okuyucusunu doğurur.

**7 · `GV.fmt` — §21.11 listesinde olmayan üç yordam:**
`GV.fmt.dateShort(iso)` · `GV.fmt.dateLong(iso)` · `GV.fmt.initials(ad)`.

### 22.1e DÖRDÜNCÜ AJANIN brief'te BULAMADIĞI imzalar

**1 · `GV.form` `radio` DALININ SÖZLEŞMESİ.** §5.2 `radio`yu tip listesinde
anıyor ama nasıl çalıştığını yazmıyordu — XOR mekanizmasının tamamı buna
dayanıyor:
```js
{ key:'ucretEkseni', label:'Ücret ekseni', type:'radio',
  options:[{ value:'aylik', label:'Aylık brüt maaş' },
           { value:'saatlik', label:'Saatlik ücret' }] }
//  `read()` seçili düğmeyi `[name="<key>"]:checked` ile çözer;
//  hiçbiri seçili değilse '' döner (yani `required` çalışır).
//  `showIf` başka alanları bu değere bağlar (§5.2) ve görünmeyen alan
//  DOĞRULANMAZ + `read()`te BOŞ döner — XOR'un mekanizması budur.
```

**2 · KAYIT BAZLI DÜZENLEME KAPSAMI YORDAMI YOK.** `permMatrix.duzenle`
`'tum'`/`'departman'`/`'proje'`/`'kendi'`/`'yok'` değerlerini taşıyor, ama
bunu BİR KAYIT üstünde ölçen bir yordam **yoktur**: `GV.guardRecord` yalnız
müşteri oturumuna karşı kayıt kapısıdır, `GV.list` `scopeField` yalnız liste
süzgecidir. Yani "bu kullanıcı BU kaydı düzenleyebilir mi" sorusunun ortak
bir cevabı yok. **Ekran kendi kuralını UYDURMAZ** — `GV.perm.can('duzenle')`
ile yetiniyor ve kapsam eksiğini backend payında **beyan ediyor**
(borç **V2-85**). `GV.hr.ozlukGorebilir` bu deseni özlük için kuruyor
(`personel` kapsamından türetiyor); `duzenle` için karşılığı yazılmamış.

**3 · `GV.gates.personelEvrak` BUGÜNKÜ VERİDE ULAŞILAMAZ ama ÖLÜ DEĞİL.**
16 personelin durumu: `Aktif` 15 · `Offboarding` 1 — **hiç kimse
`Onboarding` durumunda değil**, yani kapının çalıştığı kenar
(`Onboarding → Aktif`) bugün hiçbir kayıtta görünmüyor. Ayrıca V2-47: yordam
`adim.zorunlu && adim.durum` okuyor, ÖRNEK adımları bu iki alanı taşımıyor
(yalnız ŞABLON adımları `zorunlu` taşır — §22.4), yani kapı **hiç
kapanmıyor**. Ekran ikisini birden beyan eder: kenar ulaşılamaz **ve** kapı
uygulanmıyor. İkisini karıştırmak "kapı çalışıyor" izlenimi verirdi.

**4 · `ini` · `depAd` · `roller` TÜRETİLEBİLİR ve türetimleri ÖLÇÜLDÜ.**
Üçü de kayıtta yazılı ama üçü de başka alanlardan türer; formun onları
kullanıcıya sorması gereksiz, sessizce ezmesi ise veri kaybıdır:
- `ini` = `ad`ın ilk ve son kelimesinin baş harfi, `tr` büyük. **16/16 kayıt**
  bu türetimle birebir. Kullanıcı elle yazdıysa **onun değeri korunur**.
- `depAd` = `DB.departments[].ad`. **16/16** eşit.
- `roller` birincil `rol`ü **içerir** (16/16). Düzenlemede yalnız **eksikse
  eklenir**, hiçbir değer **silinmez** — dizi alanı tek seçimlik bir alandan
  yazmak listeyi budardı (V2-32 ile aynı gerekçe).

**5 · `rol` seçeneklerinde `musteri` BASILMAZ.** 27 rolün 26'sı listelenir:
müşteri kimliği bir personel kaydı değil bir **kontak kaydıdır**
(`DB.contacts` · `GV.session.kontak` — §2.2). Bir personele `musteri` rolü
vermek, oturum modelinin iki tarafını karıştırmaktır.

### 22.1f BEŞİNCİ AJANIN brief'te BULAMADIĞI imzalar

**1 · `GV.form` SEKME ŞERİDİ, `GV.tabs`TAN FARKLI BİR DİL KONUŞUR.** İkisi
karıştırılamaz ve `ui.js`in kendi yorumu bu konuda **yanlış** ("birebir aynı
dil; ikinci bir sekme dili yok" diyor — değil):

| | `GV.tabs` (detay ekranı) | `GV.form` `cfg.tabs` |
|---|---|---|
| Tetikleyici | `role="tab"` + **`data-tab="<key>"`** | `role="tab"` + **`data-ftab="<key>"`** |
| Panel | `role="tabpanel"` + **`data-panel="<key>"`** | `.gv-tabpanel` + **`id="fpanel_<key>"`** |
| Olay | `document`'a **`gv:tab`** atar | olay **atmaz** |

Fark **bilinçlidir**: `GV.tabs` panelleri **belge genelinde** arar
(`ui.js:1943`), yani aynı sayfada bir form sekmesi ile bir detay sekmesi aynı
dili konuşsaydı biri diğerinin panelini gizlerdi. Yanlış olan yorumdur, kod
değil (borç **V2-88**). Ölçüm betiği yazan biri bunu bilmezse "her alan gizli"
ölçer — bir ajan tam bunu yaşadı.

**2 · KABUĞUN DOSYA KAPISI FORM EKRANLARINI DA SÜZER.** §1.3 ve §2.3 yalnız
`SCREEN_DENY`den söz ediyordu; oysa `dosyaIzinli()` menüde girdisi olmayan
ekranda **modül kapısını** da uyguluyor (`Perm.modul(modulOf(sec, screen))`).
Ölçüldü: `app-arac-form.html`de **27 rolün 15'i** kabuk 403'ü görüyor —
`GV.perm.can('duzenle')` o rollerde `true` olmasına rağmen. Sonuç: **bir form
ekranının kendi yetki boş-durumu bugün ULAŞILAMAZ olabilir.** Ekran onu yine
kurar (kapı ölü değil, ulaşılamaz — §22.1e.3 sınıfı) ve bunu ölçüm olarak
beyan eder; "kapı çalışıyor" demek yanlış olurdu.

**3 · ARAÇTA DOĞUM DURUMU KARARI — `required`, ÖN SEÇİM YOK.** Araç için ne
geçiş tablosu ne durum sözlüğü var (§22.3 · §22.12), yani doğum durumunu
söyleyen **hiçbir kaynak yok**. Üç yol vardı ve seçilen üçüncüsü:
- `'Aktif'` ön seçmek → **veri uydurmak**; defterde 4/4 dolu ama "yeni araç
  aktiftir" hükmü hiçbir yerde yazılı değil.
- Boş bırakmak → arşiv sorusunu tuzaklı `aktif` alanına düşürür (`GV.arsivli`
  `durum` yoksa `aktif`e düşer — §22.5) ve sessizce yanlış cevap verir.
- **`required:true` + ön seçim yok** → kullanıcı söyler, ekran uydurmaz.
  Seçenekler defterden türetilir ve kaynağı yazılır.

**4 · SÖZLEŞME TARİHİ DOĞRULAMASI — brief'in üç reddine DÖRDÜNCÜ eklendi.**
§22.12 üç ret sayıyordu (`sonrakiBakimKm` · `sonrakiBakimTarihi` ·
`anaSurucu === yedekSurucu`); kiralama bloğunda `sozlesmeBit > sozlesmeBas`
da aynı sınıftır ve eklendi. Aynı disiplin: **reddeder**, uyarmaz.

### 22.2 KOD ÜRETİMİ — sıra GLOBAL, yıl damgası kayıt yılıdır

⚠️ Ölçüldü ve §13.2'deki desen **bu koleksiyonlarda yetersizdir.** `domain.js`
içindeki yerel `yeniKod` yordamları sırayı **yalnız içinde bulunulan yılda**
tarar; oysa bu altı defterde numara **yıllar arasında GLOBAL** ilerliyor:

```
DMB-2023-011 · DMB-2024-001…003 · DMB-2025-004…010 · DMB-2026-012…015
PRJ-2023-014 · PRJ-2024-011 · PRJ-2025-008…012 · PRJ-2026-001…008
SAT-2025-010 · SAT-2026-011…016          IZN-2026-033…039
EMP-001…016 (YIL DAMGASI YOK)            ARC-001…004 (YIL DAMGASI YOK)
```

Somut sonuç: proje defterinde yıl-içi tarama `PRJ-2026-009` üretir, ama **009
numarası `PRJ-2025-009` olarak zaten kullanılmıştır** — kod çakışmaz ama
defterin sırası bozulur. Bu yüzden bu dilimde **max GLOBAL alınır**:

```js
/* YIL DAMGALI defterler — DMB · PRJ · SAT · IZN */
function kodUret(list, onek){
  var yil = String(DB.today).slice(0, 4), max = 0;
  (list || []).forEach(function(x){
    var m = new RegExp('^' + onek + '-\\d{4}-(\\d+)$').exec(x.kod || '');
    if(m) max = Math.max(max, +m[1]);          /* ← YIL SERBEST, sıra global */
  });
  return onek + '-' + yil + '-' + String(max + 1).padStart(3, '0');
}
/* YIL DAMGASI OLMAYAN defterler — EMP · ARC */
function kodUretYilsiz(list, onek){
  var max = 0;
  (list || []).forEach(function(x){
    var m = new RegExp('^' + onek + '-(\\d+)$').exec(x.kod || '');
    if(m) max = Math.max(max, +m[1]);
  });
  return onek + '-' + String(max + 1).padStart(3, '0');
}
```

Bugünkü veriyle üreteceği kodlar (ölçüldü): `PRJ-2026-015` · `SAT-2026-017` ·
`EMP-017` · `IZN-2026-040` · `DMB-2026-016` · `ARC-005`.

Zaman damgası: `DB.today + 'T' + new Date().toTimeString().slice(0,5)`.
**`new Date()` ile "bugün" alma** — `DB.today` sabittir (`'2026-08-03'`).

### 22.3 GEÇİŞ TABLOLARI — hangi varlıkta var, hangisinde YOK

| Varlık | `DB.transitions` | Doğum durumu | Not |
|---|---|---|---|
| `project` | **VAR** (10 durum) | `Plan` | `Plan` → çıkmak için `pm · baslangic · planlananBitis` |
| `purchase` | **VAR** (12 durum) | `Taslak` | `Taslak` → çıkmak için `urun · tahminiMaliyet` |
| `leave` | **VAR** (5 durum) | `Taslak` | `Taslak` → çıkmak için `baslangic · bitis · tur` |
| `employee` | **VAR** (7 durum) | `Taslak` | §20.2'de tam yazılı |
| **`asset`** | **YOKTUR** | — | `durum` **TÜRETİLİR** (`GV.varlik`) — §22.9 |
| **`vehicle`** | **YOKTUR** | — | `durum` DÜZ ALANDIR — §22.10 |

**`transitions.leave` — tam tablo (ölçüldü):**
```
Taslak        → Onay bekliyor · İptal edildi     yetki:['veren']
                zorunlu: baslangic · bitis · tur        etiket:'Onaya Gönder'
Onay bekliyor → Onaylandı · Reddedildi · İptal edildi
                yetki:['onaylayan','ik','sahip','genelmudur']   etiket:'Onayla'
Onaylandı     → İptal edildi   yetki:['ik','sahip','genelmudur'] · gerekce:true
                girisKapi:'izinBakiye'  ← BU KAPI *Onaylandı'ya GİRERKEN* çalışır
Reddedildi    → (terminal)     girisGerekce:true
İptal edildi  → (terminal)     girisGerekce:true
```
⚠️ `'veren'` bir rol DEĞİL ilişkidir: `Flow.yetkili` onu
`rec.veren === me || rec.talepEden === me || rec.personel === me` diye çözer.
İzinde bu **talebi açan personelin kendisi** demektir.

**`transitions.purchase` — eşiği olan kenarlar:** `Taslak` yetkisi
`['veren','depmudur','operasyon','sahip','genelmudur']`; `Onaya Gönderildi`
sonrası yetki `depmudur`/`operasyon`/`sahip`/`genelmudur`;
`Onaylandı`dan sonrası yalnız `operasyon`/`sahip`/`genelmudur`.
`İade` ve `Reddedildi` **`Taslak`a geri döner** ve `girisGerekce:true` ister —
geri dönüş kenarı VARDIR, ekran onu basar.

**`transitions.project` — kapılar:**
`Başlatma Onayı → Aktif` `kenarKapi: projeAktif` ·
`Test/Kabul → Teslim` `kenarKapi: projeTeslim` (`istisnaRol:['sahip','genelmudur']`) ·
`Tamamlandı → Arşivlendi` `girisKapi: projeKapanis`.
`anaHedef` yazılı: `Aktif → Test/Kabul`, `Kapanış → Tamamlandı`.

### 22.4 VERİ GERÇEKLERİ — ölçüldü, uydurma yok

§20.4 bu dilimde de geçerlidir; **aşağıdakiler oraya EKTİR ve düzeltmedir.**

⚠️ **`DB.vehicles` 34 alan taşır, §20.4'te 28 yazılıydı — eksik olan altısı
KİRALAMA bloğudur:** `kiralamaFirmasi` · `sozlesmeBas` · `sozlesmeBit` ·
`aylikKira` · `kmSiniri` · `depozito` (hepsi 1/4 — yalnız `ARC-002`).

| Koleksiyon | Adet | Ölçülen gerçek |
|---|---:|---|
| `DB.vehicles` | **4** | `mulkiyet`: `Satın alınan` 3 · `Kiralık` 1 (`ARC-002`). `durum`: `Aktif` 3 · `Serviste` 1 (`ARC-003`). `kullanim`: `Personele tahsisli` · `Ortak kullanım`. `tip`: `Otomobil` · `Ticari araç`. `yakit`: `Benzin` · `Dizel` · `Hibrit`. `vites`: `Otomatik` · `Manuel`. `anaSurucu` 2/4 · `yedekSurucu` 2/4 · **`proje` 0/4** · `siparis` 1/4 · `alisTarihi`/`alisBedeli`/`satici` 3/4 (kiralıkta boş) |
| `DB.policies` | **6** | **ARAÇ SİGORTA POLİÇESİ** — `arac` alanı taşır. `tur`: `Trafik Sigortası` · `Kasko`. Kasko kayıtlarında 5 ek alan dolu (`kaskoBedeli` · `muafiyet` · `ikameArac` · `miniOnarim` · `hasarsizlik` — 3/6). `yenileme` · `odeme` · `kalanGun` yazılı. **`durum` alanı YOKTUR** |
| `DB.maintenance` | 5 | `durum`: `Yaklaşıyor` · `Serviste` · `Planlandı` · `Tamam`. `tur`: `Periyodik bakım` · `Ağır bakım`. `gercekTarihi` 2/5 · `maliyet` 2/5 (planlıda `null`) · `islemler` DİZİ |
| `DB.fuelLogs` | 5 | `litre` · `birimFiyat` · `tutar` · `km` · `surucu` · `istasyon`. **`durum` alanı YOKTUR** |
| `DB.fines` | 2 | `durum`: `Ödendi` · `Ödenmedi`. `tur`: `Hız limiti aşımı` · `Park ihlali`. `belge` dosya adı |
| `DB.inspections` | 4 | `durum`: `Yaklaşıyor` · `Planlandı`. `sonuc`: `Geçti`. `kusur` 1/4 |
| `DB.accidents` | 1 | `KZA-2026-002` · `ARC-003` · `kusurOrani:0` · `onarimMaliyet:0` · `durum:'Kapandı'`. ⚠️ İki sıfır da **ölçülmüş değerdir** ("karşı taraf tam kusurlu, hasar sigortadan karşılandı") — `—` basılmaz, `0` basılır ve sebebi yazılır |
| `DB.vehicleExpenses` | 8 | `tur` 8 çeşit, **her türden 1 kayıt**: `Bakım` · `Yakıt` · `HGS` · `Kira` · `Ceza` · `Sigorta` · `Kasko` · `Lastik`. **`durum` alanı YOKTUR** |
| `DB.assets` | **15** | 21 alan. `arsiv:true` **1 kayıtta** (`DMB-2023-011`, `durum:'Hurda'`). `zimmetTarihi` 6/15 · `iadeTarihi` 2/15 · `siparis` 3/15 · `barkod` 15/15. `kategori` 8 çeşit (sözlük 20), `altKategori` 9 çeşit **sözlüksüz** |
| `DB.assignments` | 7 | 13 alan. §20.4'te yazılı olmayan dördü: `iadeKontrol` (1/7 · `'Eksikli'`) · `eksik` (1/7) · `iadeAlan` (1/7) · `hasar` (1/7) |
| `DB.suppliers` | 7 | `TDR-001…007` · `unvan` · `kategori` · `puan` · `odemeVadesi` · `durum`. Demirbaşın `tedarikci` alanı bu koda bağlanır (5 çeşit kullanılmış) |
| `DB.performance` | **5** | 18 alan · `PRF-2026-Q2-005` biçiminde kod (⚠️ `PREFIX-YIL-NNN` DEĞİL). `durum`: `Tamamlandı` 4 · `Açık` 1. **Açık kayıtta 12 ölçüt alanı `null`** · `egitimIhtiyaci` DİZİ (3/5) |
| `DB.trainings` | 4 | `durum`: `Planlandı` · `Tamamlandı`. `tur`: `Online kurs` · `Atölye` · `Seminer`. `katilimci` **DİZİ** · `kazanim` DİZİ · `sertifika` boolean (4/4 `false`) |
| `DB.onboarding` | **4** | **GİRİŞ VE ÇIKIŞ AYNI DEFTERDEDİR** — `tur`: `Giriş` / `Çıkış`. `adimlar[]` = `{ad, tamam, sorumlu}` · `durum` · `sorumlu` · `not`. Kod `IGC-YYYY-NNN` |
| `DB.onboardingTemplates` | 6 | `adimlar[]` = `{ad, tur, sorumluRol, gun, zorunlu}` — ⚠️ ŞABLON adımı `zorunlu` taşır, **ÖRNEK adımı taşımaz** (§22.7'deki V2-47 kusuru buradan doğuyor) |
| `DB.capacity` | 10 | `{personel, kapasite, planlanan, doluluk, izin}` — **16 personelin 10'unda**. Kaydı olmayan 6 kişide "defterde kayıt yok" yazılır, `0` basılmaz |
| `DB.salaryHistory` | **15** | ⚠️ **BU BİR GEÇMİŞ DEĞİLDİR.** `kod` alanı YOK (anahtar `personel`+`baslangic`). 15 kaydın **15'inde `baslangic` = `DB.today`** ve **15'inde `kaynak:'gozlem'`**, `bitis` **0/15**. Yani defterde tek bir AN vardır, bir zaman serisi yoktur. Ekran "maaş geçmişi" tablosu basmaz; "bugünkü gözlem, geçmiş kaydı yok" yazar (V2-44 eki) |
| `DB.purchases` | 7 | `kategori` 7 çeşit — ⚠️ **`DB.assetCategories` DEĞİL**: `'Araç'` değeri 20'lik demirbaş sözlüğünde yok. Seçenekler satın alma defterinden türetilir. `butceKodu` 5 çeşit **sözlüksüz** · `proje` 1/7 · `onayAdim`/`onayToplam` **TÜRETİLMİŞ** |
| `DB.purchaseApprovals` | 16 | `{talep, sira, rol, kisi, durum, tarih, not, turetilmis}` · `kisi` 5/16 · `turetilmis` 11/16 |
| `DB.projects` | 14 | 32 alan. ⚠️ **`bitis` ve `sozlesme` alanları YOKTUR** (K-40). `arsiv:true` 7/14 (hepsi `Tamamlandı`). `faz` 7/14 (tek değer `Faz 1`). `ekip` · `teknoloji` · `ucuncuTaraf` · `riskler` DİZİ |
| `DB.contracts` | 7 | Proje bağı **BURADADIR**: `c.proje` 6/7 dolu. `projects` tarafında ayna alan yok |
| `DB.employees` | 16 | 31 alan. §20.4'te yazılı olmayanlar: `izinBakiye` 16/16 · `doluluk` 16/16 · `roller` DİZİ · `depAd` · `calismaTipi` (`DB.workTypes` 5) · `calismaTuru` (`Tam zamanlı`·`Proje bazlı`·`Yarı zamanlı`, **sözlüksüz**) · `sozlesme` (4 çeşit, **sözlüksüz**) · `uzmanlik` 9/16 |

**Sözlüğü OLMAYAN alanlar — bu dilimde karşına çıkacak tam liste** (§10.1
gereği değerler kayıtlardan türetilir ve kaynağı ekranda **yazılır**):
`vehicleStatuses` · `contractTypes` · `performanceStatuses` ·
`trainingStatuses` · `timelogStatuses` · `timesheetStatuses` ·
**`altKategori`** (demirbaş) · **`butceKodu`** (satın alma) ·
**`calismaTuru`** (mesai) · **`mulkiyet`** · **`kullanim`** · **`tip`** ·
**`yakit`** · **`vites`** · **`renk`** (araç) · **bakım/muayene/ceza/poliçe
`tur` ve `durum` değerleri**.

### 22.5 ⚠️ `aktif` ALANI — bu dilimde ÜÇ KOLEKSİYONDA TUZAKSIZ

§20.2 "`aktif` yalnız üç koleksiyonda kanondur" diyor (`departments` ·
`contacts` · `customers`). Bu dilimde ölçüldü ki **üç koleksiyon daha** ne
tuzaklıdır ne o listededir — çünkü `durum` ekseni **yoktur** ve tuzak yalnız
`durum` taşıyan koleksiyonlara kuruluyor:

`DB.fuelLogs` (5/5 `true`) · `DB.vehicleExpenses` (8/8 `true`) ·
`DB.policies` (6/6 `true`).

**Kural değişmiyor: ekran `aktif` OKUMAZ.** Pasiflik sorusu her zaman
`GV.arsivli(r)`den geçer; o yordam `durum` yoksa `aktif`e düşer ve tuzağı
tetiklemez (ölçüldü: `DB.bayatAktif.sayac` artmıyor). Bu üç defterde bugün
**hiçbir kayıt arşivli değildir** ve ekran bunu şöyle söyler: *"arşiv ekseni
bu defterde `aktif` alanıdır ve 8 kaydın 8'i etkin — süzgeç bugün hiçbir
kaydı düşürmüyor."* `durum` taşıyan kalan her defterde (`assets` ·
`vehicles` · `maintenance` · `inspections` · `fines` · `accidents` ·
`trainings` · `performance` · `leaves` · `purchases` · `onboarding`) `aktif`
**tuzaklıdır**: okuyan `undefined` alır ve sayaç artar.

### 22.6 `app-proje-form.html` — rota 32 · V2-39 kapanıyor

**Tohum:** `?hesap=<hesapKodu>` — `GV.sales.firsatKazan`ın "Proje oluştur"
önerisi bu adresi üretiyor (`domain.js` · `oneriler`). Düzenleme kipi
`?id=PRJ-…`.

⚠️ **`?hesap=` bir HESAP kodudur, müşteri kodu DEĞİL.** `DB.accounts` 20
kayıttır: 12'si `MUS-*`, **8'i `LEAD-*`** (aday kaynaklı hesap). Ama
`DB.projects[].musteri` alanı `MUS-*` bekler. Aday kaynaklı hesapta MUS kodu
**yoktur**: form o durumda `musteri` alanını **boş bırakır**, sebebini yazar
ve kaynağı `İç Proje` / `Satış Öncesi / PoC` olarak önerir. Uydurma `MUS`
kodu üretmek yasaktır. (Pratikte `firsatKazan` bu öneriyi yalnız hesap
`MUSTERI` evresine geçtikten sonra verir, ama form tohumu doğrulamak
zorundadır — adres elle de yazılabilir.)

**Doğum durumu `'Plan'`** — nesne literalinde verilir, kayda sonradan durum
yazan satır **yoktur**. `Plan`dan çıkmak için `pm · baslangic ·
planlananBitis` zorunludur; form bu üçünü `required` yapar ki kayıt
doğduğu anda ilerletilebilir olsun.

**Alanlar** (`DB.projects` 32 alanının form tarafı):
`ad`(req) · `musteri`(select, `DB.accounts` MUS süzgeci) · `pm`(req,
`GV.hr.atanabilirler()`) · `teknikSorumlu` · `musteriSorumlu` ·
`kaynak`(`DB.projectSources` 5) · `tur`(7 çeşit, **sözlüksüz** → defterden) ·
`oncelik`(`DB.priorities` 4) · `faz`(`DB.projectPhases` 7) ·
`baslangic`(req) · `planlananBitis`(req) · `tahminiSure`(number, saat) ·
`sozlesmeTutari`(money) · `butce`(money) · `repo` · `test` · `canli` ·
`tasarim` · `sunucu` · `saglik`(`DB.healthLevels` 3) · `gecikmeNedeni`.

**Basılmayacak alanlar ve sebepleri — ekranda YAZILIR:**
- `durum` · `arsiv` — geçiş motorunun ve arşiv ekseninin işi (§14.5).
- `ilerleme` · `gercekBitis` · `sonGuncelleme` — türetilmiş/olay çıktısı.
- `ekip` · `teknoloji` · `ucuncuTaraf` · `riskler` — **DİZİ alanlar.**
  `GV.form` `select` dalında çoklu seçim **yoktur** (V2-32) ve tek seçimlik
  bir alan mevcut listeyi **sessizce silerdi**. Düzenleme kipinde bu dört
  alan **salt okunur bilgi** olarak basılır ve "bu turda düzenlenemiyor,
  sebebi V2-32" yazılır. Oluşturmada boş dizi ile doğar.
- `musteriAd` — `musteri` seçiminden türetilir, kullanıcı yazmaz.

**Kaydettikten sonra:** `GV.afterSave({ kod, liste:'app-proje.html',
detay:'app-proje-detay.html', yeni:!rec, mesaj:… })`. Sağ panelde (`aside`)
aktivasyon kapısının **canlı** hâli basılır: `kaynak === 'Müşteri
Sözleşmesi'` ise sözleşme bağı `DB.contracts[].proje` üzerinden aranır ve
"bu proje Aktife alınabilmek için bir sözleşme kaydına bağlanmalı" denir
(K-40 · ADR-R2-40). Kapı **formu reddetmez** — kapı aktivasyon kenarındadır,
kayıt doğuşunda değil; bu ayrım ekranda yazılır.

### 22.7 `app-satinalma-form.html` — rota 115 · V2-40 kapanıyor

**Tohum:** `app-satinalma.html` "Yeni Talep" düğmesi (`?` yok). Düzenleme
`?id=SAT-…`. `?proje=PRJ-…` desteklenir (talep bir projeye bağlanabilir).

**Doğum durumu `'Taslak'`.** `Taslak`tan çıkmak için `urun ·
tahminiMaliyet` zorunlu — form ikisini `required` yapar.

**Alanlar:** `urun`(req) · `kategori`(select, **`DB.purchases`ten
türetilir**, `DB.assetCategories` DEĞİL — `'Araç'` o sözlükte yok) ·
`aciklama`(textarea) · `ozellik` · `miktar`(number, min 1) ·
`tahminiMaliyet`(money, req) · `ihtiyacTarihi`(date) ·
`oncelik`(`DB.priorities`) · `gerekce`(textarea, req — zincirin okuduğu
alan) · `butceKodu`(**sözlüksüz**, defterden türetilir + serbest metin) ·
`dep`(`DB.departments` 21) · `proje`(opsiyonel, `DB.projects`) ·
`talepEden` (oturumdan; `GV.session.emp` — kullanıcı seçmez).

**ONAY ZİNCİRİ ÖNİZLEMESİ — bu ekranın asıl işi.** `aside` içinde tutar
değiştikçe canlı yeniden çizilir:

```js
var akis = GV.approval.akisTanim('Satın alma talebi');   // AKS-SAT-1
akis.adimlar.forEach(function(a){
  var m = GV.approval.adimMuhatap(a, veri);   // → { tur:'rol', ad:'Muhasebe', … }
  var calisir = a.esik == null || (a.kosul === 'tutar' && veri.tahminiMaliyet >= a.esik);
  …
});
```
Ölçülen eşikler: adım 1 `depmudur` **her zaman** · adım 2 `muhasebe`
**≥ 25.000 ₺** · adım 3 `sahip` **≥ 100.000 ₺**. Yani 30.000 ₺'lik bir talep
2 adım, 150.000 ₺'lik 3 adım görür. Bu sayı **türetilir**, yazılmaz.

⚠️ **`onayAdim` ve `onayToplam` alanlarına EKRAN YAZMAZ.** İkisi de yükleme
anında zincirden yeniden türetilir (`GV.approval.tazeleSayaclar()`); elle
yazılan değer hayatta kalmaz ([6.3.10]). Yeni kayıt literalinde de
verilmezler — zincir kaydı (`DB.purchaseApprovals`) doğmadığı için
`GV.approval.adim(...)` `null` döner ve ekran **"zincir örneği henüz
açılmadı"** der, `0/0` basmaz.

⚠️ **Zincir ÖRNEĞİ üretilmez.** `DB.purchaseApprovals`e satır yazmak bir
onay koşumu başlatmaktır ve bunun yordamı yoktur (`GV.approval.karar` var
olan satırı sonuçlandırır, satır AÇMAZ). Form yalnız TANIMI gösterir; bunu
ekranda beyan eder ve "onaya gönder" işini `GV.flow.adimlar('purchase', kod)`
düğmesine bırakır.

### 22.8 `app-personel-form.html` — rota 82 · maaş/saatlikÜcret XOR

**Doğum durumu `'Taslak'`** (`transitions.employee`). `Taslak`tan çıkmak
için `girisTarihi · dep · pozisyon` zorunlu.

⚠️ **XOR SÖZLEŞMESİ — bu ekranın çekirdek kuralı.** Ölçüldü: 16 personelin
**15'i `maas` ekseninde**, **1'i (`EMP-015`, freelancer) `saatlikUcret`
ekseninde**; ikisi birlikte dolu olan kayıt **yoktur**. Kural
`domain.js` `Hr.icMaliyet` yorumunda yazılıdır ve `GV.hr.icMaliyet` bu
varsayımla çalışır: `saatlikUcret > 0` ise onu kullanır, yoksa maaştan türetir.

```js
{ key:'maas', label:'Aylık brüt maaş', type:'money', currency:'₺',
  showIf:function(v){ return v.ucretEkseni !== 'saatlik'; },
  validate:function(deger, v){
    if(v.ucretEkseni === 'aylik' && !(Number(deger) > 0))
      return 'Aylık maaş ekseninde bir tutar zorunludur.';
    return ''; } }
```
Eksen bir **radio** ile seçilir (`ucretEkseni`: `aylik` | `saatlik`) ve
`showIf` görünmeyen alanı doğrulamadan da `read()`ten de düşürür
(§5.2) — yani ekseni değiştirmek diğer alanı **sessizce boşaltır**, iki alan
aynı kayıtta asla birlikte dolmaz. Düzenleme kipinde eksen mevcut kayıttan
türetilir. Kaydetmede son kontrol: ikisi birden > 0 ise kayıt **REDDEDİLİR**
ve sebebi söylenir ("uyar ama geçir" yasak — §14.12).

⚠️ **KAPININ ARKASINDAKİ ALAN FORMA HİÇ BASILMAZ.** Maskelenmiş bir
`<input>` kaydettiğinde gerçek değerin üstüne `••••••` yazar. Kural:

```js
/* ⚠️ DÜZELTME — burada `maasGorebilir(rec || {})` yazılıydı ve YANLIŞTI.
   Boş nesne bir kayıt değildir: yordam onu bir kayıt gibi ölçüyor ve
   `maasKapi({}).neden` "Bu kayıt sizin değil" diyordu — var olmayan bir
   kaydın sahipliği hakkında hüküm. `Hr.kayit` bu turda sertleştirildi
   (K-42: `kod` alanı olmayan nesne kayıt DEĞİLDİR), ama doğru çağrı
   biçimi de ayrıca yazılıyor: YENİ kayıtta soru KÜME sorusudur. */
var maasAcik  = rec ? GV.hr.maasGorebilir(rec) : GV.hr.maasGorebilir();
var maasKapi  = rec ? GV.hr.maasKapi(rec) : GV.hr.maasKapi(null);
var ozlukAcik = rec ? GV.hr.ozlukGorebilir(rec) : GV.perm.can('ekle');
```
- `maasAcik === false` → ücret bölümü **hiç çizilmez**; yerine
  `GV.hr.maasKapi(rec).neden` cümlesi basılır ve "bu alanlar bu oturumda
  düzenlenemiyor" denir. Kaydetmede o alanlar **okunmaz**, kayıttaki değer
  **korunur**.
- `ozlukAcik === false` → özlük bölümü (`dogum · kanGrubu · acilKisi · tel ·
  eposta · egitim · sertifika · sozlesme · calismaTuru`) aynı biçimde
  çizilmez.
- Yeni kayıtta oturumun kendi kaydı yoktur; `maasAcik` küme sorusuna düşer.

**Alanlar:** `ad`(req) · `ini`(2 harf, `ad`dan türetilebilir ama kullanıcı
düzeltebilir) · `rol`(req, `DB.roles` 27) · `dep`(req, `DB.departments`) ·
`pozisyon`(req) · `yonetici`(`GV.hr.atanabilirler()`) · `girisTarihi`(req) ·
`lokasyon` · `uzmanlik` · `calismaTipi`(`DB.workTypes` 5) ·
`izinBakiye`(number) · `doluluk`(number 0-100) · özlük bloğu (kapı arkası) ·
ücret bloğu (kapı arkası).

**Basılmayacaklar:** `durum` (geçiş motoru) · `aktif` (tuzak) ·
`roller`/`yetkinlik`/`teknoloji`/`sertifika` (**DİZİ**, V2-32 → düzenlemede
salt okunur, sebebi yazılı) · `depAd` (`dep`ten türetilir) ·
`cikisTarihi`/`cikisNedenKodu` (`Ayrıldı` geçişinin `girisZorunlu` alanları —
formun değil, yaşam döngüsü sekmesinin işi) · `maas`/`saatlikUcret` kapı
kapalıysa · `DB.salaryHistory` (form maaş geçmişine satır yazmaz; defterde
zaten geçmiş yok — §22.4).

### 22.9 `app-izin-form.html` — rota 89

**Tohum:** `app-zaman.html` "Yeni İzin Talebi". `?personel=EMP-…` ve
`?id=IZN-…` desteklenir. **Doğum durumu `'Taslak'`.**

**Alanlar:** `personel`(req — kendi adına açıyorsa oturumdan gelir ve
salt okunur; başkası adına açmak `GV.perm.can('ekle')` ister) ·
`tur`(req, `DB.leaveTypes` 6) · `baslangic`(req) · `bitis`(req) ·
`vekil`(`GV.hr.atanabilirler()`, talep sahibi hariç) · `gerekce`(req).

**`gun` TÜRETİLİR, KULLANICI YAZMAZ** — `GV.calendar.isGunu(bas, bit)` iş
günü sayar (`DB.holidays` 14 resmî tatil + hafta sonu). Alan `readonly`
basılır ve formülü altında yazılır. Ölçüldü: `2026-08-10 → 2026-08-14` = **5
iş günü**.

⚠️ **DÜZELTME — `DB.leaves[].cakisma` PERSONEL ÇAKIŞMASI DEĞİLDİR.** Bu
bölüm ilk yazımında öyle diyordu ve **yanlıştı**; bir ajan ölçtü ve
düzeltti. Alanın anlamı `assets/data/hr.js:10`da açıkça yazılı: *"`cakisma`
alanı **personel çakışmasını değil** proje takvimi çakışmasını işaretler"* —
ve `app-izin-detay.html:173` o alanı **"Proje takvimi çakışması"** etiketiyle
basıyor. Ölçülmüş kanıt: `IZN-2026-033`te `cakisma:true` ama sahibinin
departmanında başka kimse yok.

Sonuç iki kurallıdır:
- **Form `cakisma` alanına YAZMAZ** (`null` bırakır). Personel ölçümünü oraya
  yazmak, aynı alanı okuyan iki yayındaki ekranı yalan söyletirdi.
- **Personel çakışması AYRI türetilir** ve alana yazılmaz: aynı personelin
  terminal olmayan durumdaki (`Taslak` · `Onay bekliyor` · `Onaylandı` —
  küme `DB.transitions.leave`den türetilir) başka bir talebiyle tarih
  kesişmesi. Ekran çakışan kaydı **KODLA** gösterir; boolean'ı tek başına
  basmak "neyle çakıştı" sorusunu cevapsız bırakır.

⚠️ **BAKİYE KAPISI FORMUN KAPISI DEĞİLDİR — ve bu bir "uyar ama engelleme"
kaçamağı değildir.** `Gates.izinBakiye` `transitions.leave` içinde
`Onaylandı` durumunun **`girisKapi`**'sıdır: bakiyeyi aşan izin
**onaylanamaz**, ama *talep edilebilir* — çünkü çıkış yolu vardır
(`tur:'Ücretsiz izin'` kapıdan muaftır, kapı bunu kendi mesajında söylüyor).
Form bu yüzden:
1. bakiyeyi ve istenen iş günü sayısını **ölçüp yan yana** basar
   (`e.izinBakiye` — 16/16 dolu),
2. aşım varsa **onay adımının reddedeceğini** yazar ve `Ücretsiz izin`
   seçeneğini gösterir,
3. **kaydı reddetmez** — reddedecek olan kapı burada değil.
Ölçülen canlı vaka: `IZN-2026-039` bakiyesi yetmeyen taleptir; onay kapısı
kapalı, ret ve iptal açıktır.

**ONAY ZİNCİRİ — K-38'in görünür olduğu yer.** `AKS-IZN-1` iki adım:
```
adım 1  iliski:'yonetici'  ad:'Bağlı Yönetici'  koşul: hep
        → GV.approval.adimMuhatap(adim, izinKaydi).kisi
          = DB.emp(izin.personel).yonetici          (15/16 kayıtta dolu)
adım 2  rol:'ik'           ad:'İnsan Kaynakları'   koşul: gun ≥ 10
```
Ölçüldü: 7 izin talebinin 7'sinde muhatap çözülüyor ve **tek kişiye
toplanmıyor** (`EMP-003` ×5 · `EMP-002` · `EMP-006`). `yonetici` alanı boş
olan personelde (1/16) `cozuldu:false` döner; ekran adımın `ad` alanını basar
ve sebebini yazar — kişi **uydurmaz**.

### 22.10 `app-demirbas-form.html` — rota 95

⚠️ **`DB.transitions.asset` YOKTUR ve `durum` alanı TÜRETİLMİŞTİR.** Otorite
`DB.assignments`tir (ADR-R2-29 · K-30). Formun durum tarafındaki tüm
sözleşmesi şudur:

| Durum | Formda seçilebilir mi | Sebep |
|---|---|---|
| `Depoda` | **EVET — varsayılan** | Zimmetsiz demirbaşın türetilmiş hâli |
| `Aktif` | **EVET** | Zimmetten BAĞIMSIZ durum: sarf / ortak kullanım / bulut. `GV.varlik.tazele` bu değeri **ezmez**. Ölçüldü: 3 kayıt (`Sunucu` · `Yazılım lisansı` · `Kurumsal abonelik`) |
| `Zimmetli` | **HAYIR** | Yalnız personel kabulünden türer (`GV.varlik.kabulEt`) |
| `Zimmet bekliyor` | **HAYIR** | Tutanak yazılıp kabul beklenirken türer |
| `Hurda` | **HAYIR** | Bir emeklilik kararıdır, doğum durumu değil — ve yordamı YOKTUR (§22.16) |

Form iki seçeneği basar, kalan üçünü **listelemez** ve neden listelemediğini
yazar. `zimmetli` · `zimmetTarihi` · `iadeTarihi` alanlarına **ekran hiç
yazmaz** (`DB.assets` üstünde doğrudan atama yasaktır).

**Alanlar:** `kategori`(req, `DB.assetCategories` 20) ·
`altKategori`(**sözlüksüz** → `DB.assets`ten türet + serbest metin) ·
`marka`(req) · `model`(req) · `seri`(req) · `ozellik` · `barkod` ·
`alisTarihi` · `alisFiyati`(money) · `tedarikci`(`DB.suppliers` 7) ·
`siparis`(`DB.orders` 4, opsiyonel) · `garantiBas` · `garantiBit` ·
`lokasyon`(**sözlüksüz**, 4 çeşit → türet) · `dep`(`DB.departments`) ·
`durum`(yukarıdaki iki seçenek).

`garantiBit < garantiBas` ise `validate` **reddeder**. `arsiv` formda yoktur
(arşiv ekseni ayrıdır).

### 22.11 `app-demirbas-detay.html` — rota 94 · SEKME YOK

**Tek yüzey, sekmesiz.** Kayıt 21 alan taşır ve alt defteri yalnız BİRDİR
(zimmet) — yedi sekmeli bir şerit açmak, §20.5'in "ayrı ekran ailesi açma"
ilkesinin sekme hâli olurdu. Bloklar `GV.dl` + kart olarak akar.
Yayındaki desen örneği: `app-odeme-linki-detay.html`.

**Bloklar:**
1. **Künye** — `kod` · `kategori`/`altKategori` · `marka`/`model` · `seri` ·
   `ozellik` · `barkod`.
2. **Durum — TÜRETİLMİŞ olduğu YAZILIR.** `a.durum` ve `a.zimmetli`
   `DB.assignments`ten türer; ekran ikisini de OKUR, **yazmaz**. Blok
   `GV.varlik.tazele(a)` sonucunu ve otoritenin hangi defter olduğunu söyler.
3. **Zimmet defteri** — `GV.varlik.zimmetOf(a.kod)` (yaşayan tutanak) ve
   `DB.assignments` içindeki tüm geçmiş satırlar. Tutanak **DRAWER**'dır
   (§20.7 sözleşmesi birebir): `tutanak` dosya adı + `BE-K2` beyanı ·
   `personelOnay` · `onayTarihi` · **kabul / kabul geri alma** düğmeleri
   (`GV.varlik.kabulEt` · `.kabulGeriAl(kod, gerekce)`) · `hasar` ·
   `iadeKontrol`/`eksik`/`iadeAlan` (1/7 dolu). İki düğmenin yetki kümesi
   **AYNIDIR**; geri almada gerekçe **kayıt koşuludur, yetki değil**.
4. **DÜŞEN ZİMMET İDDİASI — varsa ZORUNLU.**
   `GV.varlik.dusenIddiaSatiri(a.kod)` üç demirbaşta satır döndürür
   (`DMB-2025-007` · `DMB-2026-013` · `DMB-2026-014`). Satır **veriye
   yazılmaz**, görüntü anında defterden türer. Basılmaması, envanterin bir
   zamanlar başka bir şey söylediği bilgisini kaybetmek olurdu (K-30).
   ⚠️ İkon `i-alert`tir.
   <!-- brief-dogrula:yoksay-basla -->
   Yakın adı olan `i-alert-triangle` sprite'ta **YOKTUR** ve boş bir `<use>`
   çizerdi; `GV.varlik.dusenIddiaSatiri` kendi yorumunda bu tuzağı anıyor.
   <!-- brief-dogrula:yoksay-bitir -->
5. **Satın alma ve tedarikçi** — `alisTarihi` · `alisFiyati` ·
   `tedarikci` → `DB.suppliers` kaydı (`unvan` · `puan` · `odemeVadesi`) ·
   `siparis` → `DB.orders`.
6. **Garanti** — `garantiBas`/`garantiBit` + `GV.cell.gun` ile kalan gün
   türevi. `DB.today`e göre geçmişse "garanti bitti" yazılır.
7. **Konum** — `lokasyon` · `dep`.
8. **Aktivite** — `GV.activity(GV.audit.oku(a.kod, 20))` + varsa düşen iddia
   satırı zaman çizelgesine karıştırılır (türetilmiş olduğu rozetle söylenir).

**Aksiyonlar:** `Düzenle` → `app-demirbas-form.html?id=…`.
**Hurdaya ayırma DÜĞMESİ BASILMAZ** — yordamı yok (§22.16); devre dışı bir
düğme bile vaat sayılır, o yüzden blokta bir cümleyle beyan edilir.

### 22.12 `app-arac-form.html` — rota 100

⚠️ **`DB.transitions.vehicle` YOKTUR.** Araç bir `GV.flow` varlığı değildir;
`durum` **düz alandır** ve seçenekleri `DB.vehicles`ten türetilir
(`Aktif` · `Serviste` — `vehicleStatuses` sözlüğü yok, V2-43). Ekran bunu
**yazar**: *"araç için geçiş tablosu tanımlı değil; durum düz alan olarak
düzenlenir ve bir geçiş kaydı üretmez."* `GV.flow.gec` **çağrılmaz** —
olmayan bir varlık için çağırmak sessizce `null` dönerdi.

**MÜLKİYET EKSENİ — `showIf` ile ikiye ayrılır.** Ölçüldü: `Satın alınan`
3 kayıt, `Kiralık` 1 kayıt (`ARC-002`) ve iki blok **aynı kayıtta birlikte
dolmuyor**:

```js
showIf:function(v){ return v.mulkiyet === 'Satın alınan'; }
//   alisTarihi · alisBedeli · satici · siparis        (3/4 dolu)
showIf:function(v){ return v.mulkiyet === 'Kiralık'; }
//   kiralamaFirmasi · sozlesmeBas · sozlesmeBit · aylikKira · kmSiniri · depozito
//                                                    (1/4 dolu)
```

**Alanlar:** `plaka`(req) · `marka`(req) · `model`(req) · `modelYili`(number) ·
`tip` · `yakit` · `vites` · `renk` · `motorHacmi`(number) · `motorNo` ·
`sasi` · `mulkiyet`(req) · mülkiyet blokları · `kullanim` ·
`anaSurucu`/`yedekSurucu`(`GV.hr.atanabilirler()`) · `dep` ·
`proje`(**0/4 dolu** — opsiyonel, "bugün hiçbir araç projeye bağlı değil"
yazılır) · `durum` · `guncelKm`(number) · `sonBakimTarihi` · `sonBakimKm` ·
`sonrakiBakimTarihi` · `sonrakiBakimKm`.

`sonrakiBakimKm <= sonBakimKm` ya da `sonrakiBakimTarihi <= sonBakimTarihi`
ise `validate` **reddeder**. `anaSurucu === yedekSurucu` da reddedilir.

### 22.13 `app-arac-detay.html` — rota 99 · YEDİ SEKME, ALTI ALT DEFTER

Rota defteri bu ekran için "altı alt kaydın sekmesini R1'de zaten taşıyor —
bu revizyonun istediği yapının **çalışan emsali**" diyor. Altı defter
sekmedir; yedincisi özettir.

| `key` | Etiket | Kaynak | Adet |
|---|---|---|---|
| `ozet` | Özet | künye · mülkiyet/kira · **`DB.policies`** · km ve bakım planı | 6 poliçe |
| `bakim` | Bakım | `DB.maintenance` | 5 |
| `yakit` | Yakıt | `DB.fuelLogs` | 5 |
| `ceza` | Ceza | `DB.fines` | 2 |
| `muayene` | Muayene | `DB.inspections` | 4 |
| `kaza` | Kaza | `DB.accidents` | 1 |
| `gider` | Gider | `DB.vehicleExpenses` | 8 |

**`DB.policies` NEDEN AYRI SEKME DEĞİL.** Altı defter birer **olay
kaydıdır** (bir bakım yapıldı, bir ceza kesildi); poliçe bir **mülkiyet
niteliğidir** — süresi olan bir sözleşme, olan bir olay değil. Yedinci olay
sekmesi açmak §20.5'in "ayrı ekran ailesi açma" ilkesini sekme düzeyinde
delerdi. O yüzden `ozet` sekmesinde "Sigorta ve poliçe" bloğu olarak durur ve
`kalanGun`/`bitis` üzerinden bir yenileme uyarısı üretir.

⚠️ **ŞERİTTE İKON YOK.** Ölçülen sebep `app-proje-detay.html:192-196`'da
yazılı: dokuz ikonlu sekme 1440 px'te içerik sütununa sığmıyor, `.gv-tabs`
yatay kayıyor ama scrollbar'ı gizli (V2-04) — kesilen sekme kullanıcıya
işaret bırakmadan kaybolur. İkonlar kart başlıklarında yaşar. Aynı kural
`app-personel-detay.html` için de geçerlidir.

**Sekme sözleşmesi** (`app-proje-detay.html` deseni birebir):
tetikleyici `role="tab"` + `data-tab="<key>"`, panel `role="tabpanel"` +
`data-panel="<key>"` + `hidden`; `GV.tabs('#aracSekme')` **çizimden sonra**
çağrılır; gövde yalnız `gv:tab` olayında ve yalnız **bir kez** çizilir;
`#hash` derin bağlantısı **sözleşmedir**. Her sekme başlığı ÖLÇÜLEN kayıt
sayısını taşır (`<span class="gv-tab-cnt">`).

⚠️ Sekme içindeki her `GV.list` **`urlSync:false`** bildirir — yedi panel
var, biri diğerinin adres durumunu üstlenemez (§18.9, iki yönlüdür).

**Boş sekme "kayıt yok" DEMEZ, hangi defterin boş olduğunu söyler** (§10.1).
Ölçüldü: `DB.accidents` 1 kayıt ve o da `ARC-003`e ait — kalan üç araçta kaza
sekmesi boş çıkar ve doğru cümle *"bu araç için kaza defterinde kayıt yok"*
tur, *"kaza olmadı"* değil.

**KPI'lar (türetilir, kaynağı yazılır):** bakımı yaklaşan (`kalanGun` ·
`sonrakiBakimTarihi` vs `DB.today`) · toplam gider (`DB.vehicleExpenses`
`tutar` toplamı) · ödenmemiş ceza (`fines.durum === 'Ödenmedi'`) · muayene
son tarihi · ortalama yakıt tüketimi — ⚠️ **son KPI TÜRETİLEMEZ ve
BASILMAZ**: 5 yakıt kaydı bir araca ait ardışık iki dolum içermiyor, iki km
farkı olmadan tüketim hesaplanamaz. `GV.empty`/`—` + sebep basılır.

⚠️ **`aktif` alanı `fuelLogs` · `vehicleExpenses` · `policies` defterlerinde
TUZAKSIZ ama OKUNMAZ** — §22.5. Pasiflik `GV.arsivli(r)`den geçer.

### 22.14 `app-personel-detay.html` — rota 81 · YEDİ SEKME

§20.5 sözleşmesi: `ozet` · `performans` · `egitim` · `yasamdongusu` ·
`zaman` · `zimmet` · `aktivite`. Tembel çizim zorunlu, `#hash` derin
bağlantısı sözleşme, **şeritte ikon yok** (§22.13).

**ÖNCE KAPI, SONRA ALAN** (§20.1 gevşetilmez):
```js
if(!GV.guardRecord({ mount:'#rec', kod:e.kod, eyebrow:'Ekip ve Kaynaklar',
                     title:e.ad, geriHref:'app-personel.html',
                     geriLabel:'Personel listesine dön' })) return;
var ozlukAcik = GV.hr.ozlukGorebilir(e);      /* kendi kaydı → true */
var maasKapi  = GV.hr.maasKapi(e);            /* { acik, kaynak, neden } */
```

**`ozet`** — künye (`kod` · `pozisyon` · `depAd` · `rol`→`DB.roleName` ·
`roller` DİZİ `join(' · ')` · `lokasyon` · `girisTarihi` · `calismaTipi` +
`GV.hr.disKaynak(e.kod)` · `uzmanlik` · `yetkinlik`/`teknoloji`/`sertifika`
DİZİ) · yönetici bağı (`e.yonetici` → `GV.user`) ve **astlar**
(`DB.employees` `yonetici === e.kod` süzgeci) · durum rozeti
(⚠️ `Onboarding`/`İzinli`/`Offboarding`/`Ayrıldı` `ui.js` ton sözlüğünde
**yoktur** — V2-46; `GV.badge` nötr basar ve ekran bunu telafi etmeye
çalışmaz, rozet uydurmaz) · `izinBakiye` · `doluluk` (**bir SAYAÇ DEĞİL**,
kayıtta yazılı plandır) · özlük bloğu (`GV.hr.ozluk(e, alan)` — yetkisizde
`••••••`, hücre çıktıya da girmez) · ücret bloğu (`GV.hr.maas(e)` +
`maasKapi.neden` + **XOR** beyanı + `GV.hr.icMaliyet(e.kod)`).

⚠️ **`GV.hr.icMaliyet` `guvenilir` bayrağı taşır** ve tarih verilmezse
bugünkü orana düşer. Ekran formülü (`formul` alanı) ve güvenilirliği
**basar**; tek bir "iç maliyet: X ₺/saat" satırı basıp güvenilirliği yutmak
yasaktır.

⚠️ **MAAŞ GEÇMİŞİ TABLOSU BASILMAZ.** `DB.salaryHistory` 15 kaydın 15'inde
`baslangic = DB.today` ve `kaynak:'gozlem'`, `bitis` 0/15 (§22.4). Bu bir
zaman serisi değil, tek bir gözlemdir. Doğru cümle: *"maaş defterinde bu
kişi için 1 gözlem kaydı var (2026-08-03, kaynak: gözlem); geçmiş dönem
kaydı yok, o yüzden bir değişim çizelgesi türetilemiyor."*

**`performans`** — `DB.performance` `personel` süzgeci. Ölçüldü: 5 kayıt, 15
personel → **çoğu kişide kayıt YOK** ve o zaman `0` değil "defterde kayıt
yok" yazılır. `Açık` durumdaki kayıtta **12 ölçüt alanı `null`** →
her biri **"ölçülemedi"**dir, `0` değil. `durum` sözlüğü yok
(`performanceStatuses`) → değerler defterden türetilir ve kaynağı yazılır.
`egitimIhtiyaci` DİZİdir. Kod biçimi `PRF-2026-Q2-005` (dönem taşır).

**`egitim`** — `DB.trainings` içinde `katilimci` DİZİsi bu kodu içeren
kayıtlar: `DB.trainings.filter(function(t){ return (t.katilimci||[])
.indexOf(e.kod) !== -1; })`. `kazanim` DİZİ. `sertifika` boolean (4/4
`false`) — "sertifika verilmiyor" diye yazılır, boş bırakılmaz.
`trainingStatuses` sözlüğü yok → türet.

**`yasamdongusu`** — bu sekmenin işi **`GV.flow`**:
```js
GV.flow.adimlar('employee', e.kod)   // → hedef başına { eksik, gerekce, kapi, izin, yetki }
GV.flow.gec('employee', e.kod, hedef, ek, { neden, not })
```
- Ekran **kendi durum listesini yazmaz**; ne gelirse onu basar.
- `eksik` listesi **hedef başına** okunur — tek liste bütün hedeflere
  basılmaz (K-31).
- ✅ **`Offboarding → Aktif` kenarı VARDIR** ve düğmesi basılır: yanlışlıkla
  çıkış sürecine alınan personel **gerekçe ile** geri döndürülür. `Ayrıldı`
  hedefi çıkış tarihi + neden kodu + zimmet kapısı ister; `Aktif` hedefi
  yalnız gerekçe. **Geri almak ileri gitmekten ağır değildir** ve ekran bu
  farkı yazar.
- Çıkış neden kodları: `DB.reasonCodes` içinde `tur === 'cikis'` olanlar
  (6 kod + `DIGER`).
- **Süreç defteri:** `DB.onboarding` — `personel` süzgeci, `tur` `Giriş`
  **ve** `Çıkış` aynı defterdedir. `adimlar[]` = `{ad, tamam, sorumlu}`;
  ekran `tamam` üzerinden ilerlemeyi basar.
- ⚠️ **`Gates.personelEvrak` FİİLEN HİÇ KAPANMIYOR (V2-47).** Yordam
  `adim.zorunlu && adim.durum !== 'Tamamlandı'` okuyor; **örnek** adımları
  bu iki alanı taşımıyor (yalnız `ŞABLON` adımları `zorunlu` taşır —
  §22.4). Sonuç: `Onboarding → Aktif` her zaman geçiyor. Ekran bunu
  **beyan eder** ve düzeltmeye çalışmaz (kapsam dondurulmuş). Bugünkü
  veride kimse `Onboarding` durumunda değil (`Aktif` 15 · `Offboarding` 1),
  yani kapı ulaşılamaz — bu da yazılır.
- `Gates.personelZimmet`: açık zimmet varken `Ayrıldı` olunamaz; ekran açık
  zimmet kodlarını `GV.varlik.zimmetliler(e.kod)` ile listeler.

**`zaman`** — `DB.timelogs` `personel` süzgeci (131 kaydın bu kişiye
düşeni) · `DB.timesheets` (6 kayıt, yalnız `2026-W31` kapsamlı) ·
`GV.zaman.timesheetOf(l)` / `.kayitlar(ts)` · `DB.capacity` (**16'nın
10'unda** — kaydı olmayanda "defterde kayıt yok") · izin özeti
(`DB.leaves`). Onay yordamları `GV.zaman.onayla` / `.iade` / `.onaylaKayit`
**burada tekrar edilmez** — sekme okuma yüzeyidir ve `app-zaman.html`e derin
bağlantı verir. Maliyet oranı `GV.hr.kayitOrani(l)` ve **kapı satır
bazlıdır** (`GV.hr.maasGorebilir(l.personel)` — K-39).

**`zimmet`** — `GV.varlik.zimmetliler(e.kod)` + tutanak drawer (§22.11
bloğu 3 ile **aynı** sözleşme; iki ekran aynı çekmeceyi kurar, kural tek
yerdedir: yordamlar `GV.varlik.*`) + `GV.varlik.dusenIddiaSatiri` varsa.

**`aktivite`** — `GV.activity(GV.audit.oku(e.kod, 20))`.

**Aksiyonlar:** `Düzenle` → `app-personel-form.html?id=…` ·
`İzin talebi aç` → `app-izin-form.html?personel=…`.

### 22.15 Bu dilimde beyan edilecek backend payı

§20.6'daki `BE-P1` · `BE-K1` · `BE-K2` · `BE-S4` · `BE-S5` aynen geçerlidir.
Eklenenler:

| Kod | Madde | Nerede |
|---|---|---|
| `BE-P3` | Onay zinciri örneği sunucuda açılmaz; ekran zincirin TANIMINI gösterir, bir koşumunu değil | satın alma · izin formu |
| `BE-P4` | Araç için durum makinesi yok; `durum` düz alan olarak yazılır ve geçiş kaydı üretmez | araç formu · araç detayı |
| `BE-K3` | Maaş öz-erişimi **istemcide** açıldı; gerçek sistemde kendi ücret kaydı da sunucuda kimliğe göre filtrelenmelidir | personel detayı · personel formu |
| `BE-S6` | Zimmet kabulü ıslak/e-imza taşımaz (`BE-K2` eki); kabul geri alma da yalnız bir bayrağı çevirir | demirbaş detayı · personel detayı |

### 22.16 YAZILMAYAN YORDAMLAR — ihtiyaç duyarsan YAZMA, RAPOR ET

Bu dilimde ölçüldü; ajan bunlardan birine ihtiyaç duyarsa **ekranı devre dışı
bir düğmeyle değil, bir BEYANLA kapatır** (§14.6 — yapılamayan iş düğme
olarak vaat edilmez) ve raporunda madde olarak yazar:

1. **`GV.varlik.hurdayaAyir(kod, gerekce)` YOK.** `DB.assetStatuses`
   `'Hurda'` içeriyor ve 1 kayıt o durumda, ama demirbaşı hurdaya ayıran bir
   yordam yazılmamış. `a.durum = 'Hurda'` yazmak **yasaktır**.
2. **`GV.varlik.zimmetAc(demirbas, personel)` YOK.** Yeni zimmet TUTANAĞI
   açan yordam yok; `GV.varlik.kabulEt` var olan tutanağı onaylar.
   `DB.assignments.push(...)` **yasaktır**.
3. **`GV.varlik.iadeAl(zimmetKod)` YOK.** `iadeTarihi`/`iadeKontrol`/`eksik`/
   `iadeAlan` alanları veride var (1/7), yazan yordam yok.
4. **`GV.hr.olustur(v)` / `.guncelle(...)` YOK.** Personel formu kaydı nesne
   literaliyle doğurur (teklif/fatura formlarındaki desen) ve doğum durumunu
   literalde verir.
<!-- brief-dogrula:yoksay-basla -->
5. **`GV.izin.olustur(v)` YOK** — aynı desen.
6. **`GV.arac.*` ve `GV.demirbas.*` diye bir ad alanı YOK.** Araç/demirbaş
   tarafında var olan tek ad alanı `GV.varlik`tır ve içeriği §20.3'te tam
   yazılıdır.
<!-- brief-dogrula:yoksay-bitir -->
7. **Alt defterlere (bakım · yakıt · ceza · muayene · kaza · gider · poliçe)
   KAYIT EKLEYEN yordam YOK.** Yedi defter de **salt okunurdur**; araç
   detayı "yeni bakım ekle" düğmesi basmaz.
8. **`GV.approval` zincir ÖRNEĞİ açmaz** — §22.7.

### 22.17 Yasaklar — bu dilime özel (§14'e EK)

1. `a.durum = …` / `a.zimmetli = …` (demirbaş) — **türetilmiş görünüm**.
2. `e.durum = …` (personel) — yalnız `GV.flow.gec('employee', …)`.
3. `l.durum = …` (izin) · `p.durum = …` (proje · satın alma) — aynı kural.
4. `aktif` okumak · yazmak · süzmek — her koleksiyonda (§22.5).
5. `onayAdim` / `onayToplam` yazmak — türetilmiş sayaç (§22.7).
6. Kapının arkasındaki alanı **forma basmak** — maskelenmiş `<input>`
   kaydettiğinde gerçek değeri `••••••` ile ezer (§22.8).
7. Küme sorusuna satır kapısı bağlamak (`maasGorebilir()` vs `(e)`) — §22.1.
8. Sekme şeridine ikon koymak (7 sekmeli iki ekranda) — §22.13.
9. Aynı sayfada iki `urlSync:true` liste (§18.9).
10. Çizim anında `scrollIntoView` çağırmak (K-37 · §21.11).
11. `DB.assignments.push(...)` · `DB.salaryHistory.push(...)` ·
    alt defterlere satır yazmak — §22.16.
12. Sözlüğü olmayan bir alan için `GV.badge` uydurmak — düz metin bas
    (§21.11 son madde).

### 22.18 Ajan raporunda ZORUNLU olanlar

§21.10 aynen geçerlidir. Ek olarak her ajan şunları **sayıyla** bildirir:

1. Yazdığı dosya · satır sayısı · `data-sec`/`data-screen`.
2. Çağırdığı `GV.*` yordamlarının listesi — ve **brief'te bulamadığı** her
   imza (bu bölüm eksikse ölçüm eksiktir).
3. Kurduğu her kapı ve **iki yöndeki** ölçümü.
4. Türettiği her değer ve **kaynağı**; boş bıraktığı her alan ve **sebebi**.
5. Basmadığı düğme ve sebebi (§22.16 maddelerinden hangisi).
6. Ortak katmanda bulduğu kusur — **düzeltmeden** rapor eder.

