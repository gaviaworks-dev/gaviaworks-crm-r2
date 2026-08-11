# Omurga Kaynak Kaydı — R1'den R2'ye ne taşındı

> **Kural:** bu repoda hiçbir dosya "sıfırdan yazıldı" diye anılmaz eğer
> kaynağı varsa. Aşağıdaki tablo taşınan her dosyanın **kaynağını, boyutunu
> ve değiştirilip değiştirilmediğini** kayda geçirir.
>
> **Kaynak repo:** `gaviaworks-dev/gaviaworks-crm` · `main` · `36ad104`
> Yerel: `~/Developer/Projects/gaviaworks-crm` — **DONDURULDU**, bu turda
> tek satır yazılmadı, commit atılmadı.

---

## 1. Taşınan dosyalar — değiştirilmeden

Bunlar R1'de üç tur boyunca ölçülmüş, taranmış ve kapanmış katmanlardır.
Yeniden yazmak, ölçülmüş davranışı kaybetmek olurdu.

| R2 yolu | Kaynak (R1) | Değişiklik |
|---|---|---|
| `assets/css/tokens.css` | `assets/css/tokens.css` | **yok** — 113 tasarım tokenı |
| `assets/css/shell.css` | `assets/css/shell.css` | **yok** |
| `assets/css/ui.css` | `assets/css/ui.css` | **yok** |
| `assets/css/login.css` | `assets/css/login.css` | **yok** |
| `assets/js/ui.js` | `assets/js/ui.js` | **yok** — `GV.list` · `GV.form` · `GV.drawer` · `GV.modal` · `GV.fmt` · `GV.badge` … |
| `assets/js/domain.js` | `assets/js/domain.js` | **yok** — `GV.flow` (15 varlık) · `GV.approval` · `GV.fin` · `GV.notes` · `GV.sales` · `GV.calendar` · `GV.audit` … |
| `assets/js/login.js` | `assets/js/login.js` | **yok** |
| `assets/img/icons.svg` | `assets/img/icons.svg` | **yok** — 113 ikon |
| `assets/data/org.js` | aynı | **yok** |
| `assets/data/crm.js` | aynı | **yok** |
| `assets/data/work.js` | aynı | **yok** |
| `assets/data/misc.js` | aynı | **yok** |
| `assets/data/ops.js` | aynı | **yok** |
| `assets/data/hr.js` | aynı | **yok** |
| `assets/data/notes.js` | aynı | **yok** |
| `assets/data/reports.js` | aynı | **yok** — 105 rapor kaydı |

**Toplam taşınan: 16 dosya.**

---

## 2. TAŞINMAYAN — bilerek

| Dosya | Neden |
|---|---|
| `assets/js/shell.js` | **Yeniden yazıldı.** R1'in kabuğu 16 bölüm ve 86 tıklanabilir menü girdisi taşıyordu; şartname §3.1 yedi çalışma alanı ve ≤18 görünür girdi istiyor. Menü modeli baştan kuruldu. Ayrıntı §4. |
| `assets/js/dashboard.js` | R1'in eski panel yardımcısı. Yeni Gündem yerleşimi (§4.1) farklı; `app-panel.html` kendi türetmelerini yapıyor. |
| 148 `app-*.html` ekranı | R2 dikey dilimle başlıyor: üç ekran. Kalanların kaderi `tasks/rota-haritasi.md`'de karar olarak yazılı; göç ayrı fazdır. |
| `PROMPT.md` · `KICKOFF.md` · `CLAUDE.md` | R1'in şartname ailesi. R2'nin tek doğruluk kaynağı `tasks/sadelestirme-talimati.md`. |
| `docs/` (17 belge) | R1 turlarının kapanış raporları. R2'nin geçmişi değil, R1'in. |

---

## 3. R2'de YENİ yazılan dosyalar

| Dosya | Ne yapar | Neden yeni |
|---|---|---|
| `assets/js/shell.js` | Yedi çalışma alanlı kabuk, üst çubuk, yetki kapısı, iskelet | Menü modeli değişti (§4) |
| `assets/js/quicknote.js` | Hızlı Notlar çekmecesi (§4.2) | R1'de bu iş iki tam ekrandı; çekmeceye indi |
| `assets/data/lifecycle.js` | `DB.accounts` + `DB.opportunities` **türetmesi** (§5) | Aday ile müşterinin tek kayıtta birleşmesi |
| `assets/css/r2.css` | Üst çubuk çekmeceleri, panel kartları, hızlı not | R1'de karşılığı olmayan bileşenler |
| `index.html` | Giriş | R1'den uyarlandı — §5'e bak |
| `app-panel.html` | Gündem (§4.1) | Yeni yerleşim |
| `app-musteri.html` | Müşteri listesi, yaşam evresi kolonuyla (§5.1) | Yeni kaynak (`DB.accounts`) |
| `tasks/qa/kontrol.js` | Ön uçuş doğrulaması | Tarayıcısız kanıt katmanı |

---

## 4. `shell.js` neden yeniden yazıldı — ve nesi korundu

### 4.1 Değişen: menü modeli

| | R1 | R2 |
|---|---:|---:|
| Üst düzey bölüm | 16 | **7** |
| Tıklanabilir menü girdisi | 86 | **20** (17 standart + 3 yönetim) |
| Menü ayracı (`seclbl`) | 13 | **0** |
| Ölçülen en yüksek görünür girdi (rol bazında) | — | **17** |

> R1'deki "99 menü girdisi" rakamı bir **ölçüm hatasıydı**: `grep -c "lbl:"`
> `seclbl:` satırlarını da yakalıyordu (`seclbl` dizesi `lbl` içerir).
> `86 href + 13 seclbl = 99`. R2'de ayraç hiç kullanılmadı — en kalabalık
> alan dört girdi taşıyor, gruplamaya gerek yok. Böylece kapsamlanmış
> `grep -c "href:"` doğrudan girdi sayısını verir.

### 4.2 Korunan: R1'de ölçülmüş dersler

Yeniden yazmak, öğrenilmiş davranışı çöpe atmak değildir. Şunlar birebir taşındı:

| Ders | R2'de nerede |
|---|---|
| **L-15** — `location.reload()` yasak; veri bellekte, yeniden yükleme mutasyonu siler | `GV.refresh()` — mount düğümünü taze kopyayla değiştirir |
| **L-16** — kalıcı düğüme dinleyici bağlarken `GV.on` kullanılır, yoksa birikir | `GV.on(el, type, fn, key)` aynen korundu; rail/top/nav hep bununla bağlanıyor |
| **L-18** — modal/çekmece `.gv-page` DIŞINA basılır | `GV.refresh` `.gv-scrim` · `.gv-drawer` · `.gv-modal-scrim` düğümlerini kapatır |
| **L-36** — menüyü tazelemek, menünün bağlı olduğu düğümleri tazelemek değildir | `wireNav()` **`syncNav` içinde çağrılmaz**; iskelet düğümlerine bir kez bağlanır |
| **L-08 · L-13** — türetilebilen sayaç veriye yazılmaz; karşılığı yoksa "yok" denir | `lifecycle.js`'te lead kaynaklı hesapta `aktifProje`/`toplamCiro` **null**, sıfır değil |
| **REVİZE 13** — menü gizlemesi ile doğrudan adres kapısı tek kaynaktan | `SCREEN_DENY` hem `Perm.item` hem `guard` tarafından okunur |
| **REVİZE 18** — modül anahtarı menü, rail ve adres kapısını birlikte kapatır | `Perm.modul` üç yerde de aynı yordamdan geçer |
| Sahte buton yasağı | `BUILT` listesi + `markWip` — yayında olmayan bağlantı `data-wip`e çevrilir |

### 4.3 Korunan: dışa verilen sözleşme

`ui.js` ve `domain.js` **değiştirilmeden** taşındığı için kabuğun onlara
verdiği yüzey aynen korunmak zorundaydı. Ölçüldü (`grep -o "GV\.[a-zA-Z]*"`):
`ui.js` 47, `domain.js` 22 ayrı `GV.*` adı kullanıyor. Kabuğun sağladıkları:

```
GV.esc · GV.ico · GV.perm · GV.session · GV.counters · GV.refresh ·
GV.on · GV.pageHead · GV.built · GV.isBuilt · GV.markWip · GV.shell
```

Olaylar: `gv:ready` (yetki verildi) · `gv:denied` (403)
Oturum: `sessionStorage('gv.session')` — alan adı **`rol`**, `role` değil
Gövde sözleşmesi: `<body data-sec="satis" data-screen="musteri">`

`GV.shell` API'sine R2'de **tek ekleme** yapıldı: `visibleItems()` — menü
sayımının tek kapısı. Ölçüm betiği kendi kopyasını yazmaz (L-40).

---

## 5. `index.html` — taşındı ve iki noktada değişti

| Değişiklik | Neden |
|---|---|
| Marka maddeleri yeniden yazıldı | R1'in on altı bölümlü listesi yerine R2'nin **yedi çalışma alanı** anlatılıyor |
| Üç veri dosyası eklendi (`crm.js` · `work.js` · `ops.js`) | R1'de bu ekran yalnız `org.js` yüklüyordu; `login.js` `DB.contacts`/`projects`/`tickets` okuduğu için **müşteri portalı personası sessizce hiç basılmıyordu**. R2'de basılıyor. |

Bu ikincisi R1'de var olan ve bu turda **ölçümle bulunan** bir kusurdur;
R1'e dokunulmadığı için orada açık kalmıştır.

---

## 6. Taşımanın çalıştığının kanıtı

⚠️ **Tarayıcı çalıştırılmadı** (bu turun kısıtı). "Konsol hatası yok" diye
bir iddia YOKTUR. Koşulan doğrulama `tasks/qa/kontrol.js`'tir ve şunları
söyler:

```
[1] Sözdizimi        14 js dosyası + 2 satır içi blok — temiz
[2] Referanslar      12 yerel referansın tamamı diskte var
[3] Veri bağımlılığı DB.x okuyan her sayfa x'i yüklüyor (L-34)
[4] Veri katmanı     9 dosya Node'da yüklendi, istisna yok
                     customers=12 leads=12 accounts=20 opportunities=12
                     evre dağılımı {ADAY:3, NITELIKLI:5, MUSTERI:9, PASIF:2, KAYIP:1}
                     mükerrer hesap kodu yok
[5] Menü             27 rol ölçüldü · en yüksek günlük girdi 17 (≤18 ✓)
                     en yüksek çalışma alanı 7 (≤7 ✓)
```

Koşum: `node tasks/qa/kontrol.js` — çıkış kodu 0.

**Bunun ölçmediği şey:** gerçek tarayıcıda render, CSS taşması, ikon
sprite yüklenmesi, olay dinleyicileri ve responsive kırılımlar. Bunlar
Playwright turunda ölçülecek ve o tur **henüz koşulmadı**.
