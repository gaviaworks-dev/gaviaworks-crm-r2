# Tarayıcı Ölçümü — üç ekran × altı genişlik

> **Koşum:** `node tasks/qa/tarayici.js` · gerçek Chromium (Playwright 1.62.1,
> headless) · yerel sunucu `127.0.0.1:8792` · her ölçüm temiz bağlamda.
> **Taramalar seri koşuldu, paralel değil.** Repo dosyası tarama sırasında
> değiştirilmedi.
>
> Şartname §12: *"1600, 1440, 1280, 1024, 768 ve 390 px genişliklerde sayfa
> yatay taşmaz."*

---

## 1. Sonuç

> **11 Ağustos ikinci güncellemesi:** Operasyon ve beş ödeme ekranı yazıldıktan
> sonra tarama **9 ekran × 6 genişlik = 54 ölçüme** genişletildi ve yine
> sıfır bulguyla kapandı. Aşağıdaki tablo ilk üç ekranın ölçümüdür; genişletilmiş
> koşumun özeti §7'dedir.

| | |
|---|---:|
| Ekran | 3 |
| Genişlik | 6 |
| Ölçüm | **18** |
| **Yatay taşma** | **0** |
| **Konsol hatası (kendi kaynağımız)** | **0** |
| **Eksik sprite ikonu** | **0** |
| **Odak tuzağı (0×0)** | **0** |
| Dış kaynak isteği başarısız | 2 (Google Fonts CDN — depo kusuru değil) |

**Düzeltilmesi gereken ürün bulgusu: 0.** Bu yüzden bu turda taşma düzeltme
commit'i yok — düzeltilecek bir şey çıkmadı.

---

## 2. Ölçüm tablosu

`sprite` sütunu: *çizilen ikon / gizli kapsayıcıdaki ikon*.
`odak` sütunu: *Tab ile yürünen adım / render ağacındaki odaklanabilir düğüm*.

| Ekran | Genişlik | Taşma | Sprite | Odak | Konsol |
|---|---:|---|---|---|---|
| Giriş | 1600 | yok | 8 / 21 | 8 / 8 | temiz |
| Giriş | 1440 | yok | 8 / 21 | 8 / 8 | temiz |
| Giriş | 1280 | yok | 8 / 21 | 8 / 8 | temiz |
| Giriş | 1024 | yok | 3 / 26 | 8 / 8 | temiz |
| Giriş | 768 | yok | 3 / 26 | 8 / 8 | temiz |
| Giriş | 390 | yok | 3 / 26 | 8 / 8 | temiz |
| Gündem | 1600 | yok | 33 / 2 | 12 / 21 | temiz |
| Gündem | 1440 | yok | 33 / 2 | 12 / 21 | temiz |
| Gündem | 1280 | yok | 33 / 2 | 12 / 21 | temiz |
| Gündem | 1024 | yok | 33 / 2 | 12 / 21 | temiz |
| Gündem | 768 | yok | 33 / 2 | 12 / 21 | temiz¹ |
| Gündem | 390 | yok | 32 / 3 | 12 / 21 | temiz |
| Müşteriler | 1600 | yok | 54 / 33 | 12 / 72 | temiz |
| Müşteriler | 1440 | yok | 54 / 33 | 12 / 72 | temiz |
| Müşteriler | 1280 | yok | 54 / 33 | 12 / 72 | temiz |
| Müşteriler | 1024 | yok | 54 / 33 | 12 / 72 | temiz |
| Müşteriler | 768 | yok | 55 / 32 | 12 / 73 | temiz |
| Müşteriler | 390 | yok | 70 / 17 | 12 / 62 | temiz |

¹ Bu ölçümde `fonts.gstatic.com` iki woff2 isteği 404 döndü. **Bu deponun
kusuru değildir** — sayfalar Google Fonts'u CDN'den çekiyor ve ağ tarafında
oluşan bir aksaklık. Ayrı kovada sayılır; aynı koşumun diğer 17 ölçümünde
tekrarlamadı. Not: ağ engelli ortamda her sayfa bu hatayı verir ve tipografi
sistem yazı tipine düşer. Kalıcı çözüm yazı tipini repoya gömmektir — borç
olarak yazıldı (Y-09).

---

## 3. Eksen eksen ne ölçüldü

### 3.1 Taşma

`document.documentElement.scrollWidth > clientWidth + 1` ise taşma var
sayılır. Taşma varsa **en içteki** suçlu düğüm raporlanır — taşan bir çocuk
bütün atalarını da taşırır, hepsini yazmak bulgu sayısını şişirirdi.

**Sonuç: 18 ölçümün 18'inde taşma yok.** En dar kırılımda (390px) bile
üst çubuk, kart ızgarası ve liste kendi kapsayıcısında kalıyor.

### 3.2 Sprite

`#gvSprite` enjeksiyonu, her `<use href="#i-*">` hedefinin belgede
bulunması ve ikonun gerçekten çizilmesi ölçülür.

- `#gvSprite` **18 ölçümün 18'inde** enjekte edildi, **113 sembol** taşıyor
- **Belgede karşılığı olmayan ikon: 0**
- Görünür olduğu hâlde 0×0 çizilen ikon: **0**

"Gizli kapsayıcıdaki ikon" sayısı kusur değildir: giriş ekranındaki rol
sekmesi `[hidden]`, müşteri listesinde `GV.list` tablo + kart + mobil satırı
birlikte basıp CSS ile birini gösteriyor. 390px'e inildikçe gizli sayısının
düşmesi (33 → 17) mobil satırın devreye girmesidir — beklenen davranış.

### 3.3 Odak

Skip link, Tab zinciri ve 0×0 odak tuzağı ölçülür.

- Her ölçümde ilk Tab **`.gv-skip` ("İçeriğe atla")** düğümüne düşüyor
- Tab zinciri kesintisiz ilerliyor
- **Çizilmiş olduğu hâlde 0×0 olan odaklanabilir düğüm: 0**

⚠️ **Bu eksenin sınırı:** Tab zinciri **12 adımla** sınırlandı
(`Math.min(12, …)`). Müşteri listesinde 72 odaklanabilir düğüm var; ilk
12'si yürünüyor, kalan 60'ı **ölçülmedi**. Tablodaki `12 / 72` bunu söylüyor,
"60 düğüm başarısız" demiyor. Tam zincir ölçümü ayrı bir borçtur (Y-10).

Ayrıca ölçülmeyenler: odak halkasının görünürlüğü (kontrast), `aria-*`
doğruluğu, ekran okuyucu duyurusu, WCAG 2.2 AA kontrast oranı.

### 3.4 Konsol

`console.error`, `pageerror`, başarısız istek ve 4xx/5xx yanıt yakalanır.
Kendi kaynağımız ile üçüncü taraf **ayrı kovalarda** sayılır.

**Kendi kaynağımızda 0 hata.**

---

## 4. Ölçüm katmanında bulunan iki kusur

> R1'in L-17 / L-24 / L-26 ailesi bu turda da tekrarladı: *araç sessizce
> yanlış yere bakabilir* — ve bu kez **fazla** saydı.

İlk koşum **30 bulgu** bastı. Yirmi sekizi **yanlıştı** ve ikisi ölçüm
betiğimin kusuruydu:

| Kusur | Sonucu | Düzeltme |
|---|---|---|
| Sprite ekseni düğümün **kendi** `display`ine bakıyordu | `[hidden]` rol sekmesindeki 21 ikonu "çizilmedi" sanıyordu | ata zinciri taranıyor; `getClientRects().length` esas ölçüt |
| Odak ekseni aynı hatayı yapıyordu | `.gv-cardlist{display:none}` içindeki bağlantıları "0×0 odak tuzağı" sanıyordu | aynı yordam (`CIZILDI_MI`) iki eksende de paylaşılıyor |

Kalan iki bulgu (Google Fonts 404) gerçekti ama **bu deponun kusuru
değildi**; ayrı kovaya alındı.

### 4.1 Düzeltilmiş eksen bozulmuş kopyada sınandı (L-39)

Sıfır bulgu, eksenin kör olduğu anlamına gelebilirdi. Bu yüzden depo
dışında bozulmuş bir kopya kuruldu ve üç kusur enjekte edildi:

| Enjekte edilen kusur | Yakalandı mı |
|---|---|
| 2400px genişliğinde blok (yatay taşma) | ✅ **altı genişliğin altısında** — suçlu düğüm doğru gösterildi |
| Tanımsız değişken çağrısı (`pageerror`) | ✅ altı genişliğin altısında |
| Olmayan ikon (`#i-BOZUK-YOK`) | ✅ altı genişliğin altısında |

Bozulmuş kopya ölçümden sonra silindi; depo dosyaları hiç değişmedi.

---

## 5. Bu ölçümün SÖYLEMEDİĞİ

Dürüstlük gereği — koşulmayan hiçbir kontrol "geçti" sayılmaz:

- **Etkileşim akışı ölçülmedi.** Çekmeceler (takvim, onay, bildirim, Hızlı
  Not) açılmadı; liste filtresi, sekme geçişi, sıralama ve sayfalama
  tıklanmadı. Ölçülen şey **ilk yüklemedir**.
- **Hızlı Not davranışı ölçülmedi** — Enter kaydı, Shift+Enter satırı,
  checkbox tamamlaması, 5 saniyelik geri alma ve 24 saatlik gizlenme
  tarayıcıda sınanmadı.
- **Rol bazlı görünüm ölçülmedi.** Tarama yalnız `?role=sahip` ile koştu;
  menü sayımı 27 rol için ayrıca `tasks/qa/kontrol.js` §5'te ölçülüyor ama
  o **tarayıcısızdır**.
- **Erişilebilirlik ölçülmedi** (WCAG 2.2 AA kontrast, ARIA, ekran okuyucu).
- **Ekran görüntüsü alınmadı.**

Bunların hepsi borç olarak `tasks/riskler-ve-kapsam.md` §6'da yazılı.

---

## 6. Yeniden koşum

```bash
cd ~/Developer/Projects/gaviaworks-crm-r2
npm install --no-save playwright@1.62.1      # node_modules gitignored
node tasks/qa/tarayici.js                     # çıkış 0 = temiz

# Bozulmuş kopyada sınamak için:
GV_ROOT=/yol/bozuk-kopya GV_PORT=8795 node tasks/qa/tarayici.js
```

Ayrıntılı çıktı `tasks/qa/tarayici-sonuc.json` dosyasına yazılır (gitignored).


---

## 7. Genişletilmiş koşum — dokuz ekran

Operasyon ve ödeme ekranları eklendikten sonraki tam tarama:

| | |
|---|---:|
| Ekran | **9** |
| Genişlik | 6 |
| Ölçüm | **54** |
| **Yatay taşma** | **0** |
| **Konsol hatası (kendi kaynağımız)** | **0** |
| **Eksik sprite ikonu** | **0** |
| **Odak tuzağı** | **0** |
| Dış kaynak isteği başarısız | 8 (Google Fonts CDN) |

| Ekran | 1600 | 1440 | 1280 | 1024 | 768 | 390 |
|---|---|---|---|---|---|---|
| Giriş | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gündem | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Müşteriler | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Operasyon | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ödeme Linkleri | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Yeni Link | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Link Detayı | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dış Ödeme | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Ödeme Sonucu | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

### 7.1 Ölçüm katmanında bulunan ÜÇÜNCÜ kusur

Dış ödeme ekranları eklendiğinde tarama **12 bulgu** bastı ve on ikisi de
aynıydı: *"#gvSprite enjekte edilmedi"*. Doğruydu ama **kusur değildi** —
o iki ekran şartname §8.3 gereği kabuğu hiç yüklemez ve tek bir ikon bile
kullanmaz (`sprite:0çizili/0gizli`).

Eksen düzeltildi: sprite yokluğu ancak sayfa **ikon kullanıyorsa** kusurdur.

Bu, bu oturumda ölçüm katmanında bulunan **üçüncü** kusur sınıfıdır ve
üçü de aynı aileden: *araç doğru şeye bakmıyor.* İki tanesi daha ödeme akış
ekseninde çıktı — iddiaları ürünün **cümlesine** bağlamıştım ve tek harf
farkla ("kalan bakiye**sini**" ≠ "kalan bakiye**yi**") yanlış bulgu bastılar.
İkisi de artık **cümleye değil sonuca** bakıyor: kayıt oluştu mu, durum
değişti mi.

**Ders:** bir ölçüt ürünün metnine bağlanırsa, ürünün metni değiştiğinde
sessizce yalan söyler. Ölçüt gözlemlenebilir **sonuca** bağlanmalıdır.

### 7.2 Diğer üç eksen

| Eksen | Ne ölçtü | Sonuç |
|---|---|---|
| `ops-akis.js` | 39 kuyruk satırı · ayırıcı %30–%50 kilidi · tercih saklama · boş gerekçe reddi | temiz |
| `odeme-akis.js` | kart alanı yokluğu · süresi dolmuş link · beş sonuç ekranı ödeme yaratmıyor | temiz |
| `not-izolasyon.js` | 4 negatif hüküm: statik referans · açılışta bellek · sahiplik süzgeci · çekmece yüklemesi | temiz |


---

## 8. Rapor yüzeyi eklendikten sonra — on ekran

| | |
|---|---:|
| Ekran | **10** |
| Genişlik | 6 |
| Ölçüm | **60** |
| **Yatay taşma** | **0** |
| Konsol hatası (kendi kaynağımız) | **0** |
| Düzeltme | **0** — düzeltilecek taşma çıkmadı |

| Ekran | 1600 | 1440 | 1280 | 1024 | 768 | 390 |
|---|---|---|---|---|---|---|
| Raporlar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Önceki dokuz ekranın tamamı yeniden koşuldu ve temiz kaldı.

### 8.1 Ayrı bir eksen: rapor tavanları

Taşma ölçümü sayfanın **kaymadığını** söyler; §7.1 ve §7.3'ün tavanlarını
söylemez. Onun için ayrı bir eksen yazıldı: `tasks/qa/rapor-tavan.js`.

| Ölçtüğü | Sonuç |
|---|---|
| ≤4 KPI · ≤2 grafik · 1 tablo (6 rapor) | 4 · ≤2 · 1 — altısında da |
| Tipografi (H1 · rapor · grafik · KPI · eksen) | 28 · 20 · 14 · 23 · 11 px |
| Grafik yüksekliği 260–300 | 280 px |
| `min-width:0` · `overflow:hidden` | ikisi de |
| SVG `viewBox` + `preserveAspectRatio` | ikisi de yazılı |
| ≥1200px iki kolon, altında tek | 1600/1440/1280 → 2 · 1024/768/390 → 1 |
| Rapor içi sol menü | **0 düğüm** |
| 105 tanımın eşlemesi + iki yönlü denetim | 84 eşlendi · 21 şablonsuz · yetim 0 |
| Katalog yalnız yöneticiye | analist görmüyor · sahip görüyor |
| **Ölçülen kontrol** | **74** |

### 8.2 Eksenin kendisi sınandı — ve iki boşluk çıktı

Temiz depoda 74 kontrol, 0 bulgu (**olumlu vaka**). Sonra depo dışında
bozulmuş bir kopyaya **dokuz kusur** enjekte edildi (**olumsuz vaka**).

İlk koşumda **ikisi kaçtı** ve ikisi de eksenin kendi kusuruydu:

| Kaçan kusur | Sebep | Düzeltme |
|---|---|---|
| Beşinci KPI, üçüncü grafik | `GV.rapor` fazlasını çizimde **kesiyor**; DOM tavanı hiç aşmıyor, DOM'u sayan eksen ihlali göremiyor | Eksen artık kabuğun kırpma **uyarısını** okuyor — ihlalin tek izi odur |
| Katalog standart kullanıcıya açık | Ölçüm `stajyer` rolüyle koşuyordu; o rol rapor alanını **hiç göremiyor**, 403 alıyordu. Katalog yoktu ama sebebi yetki kapısıydı, kararın kendisi değil | `analist` rolüne geçildi: rapor görür, yönetici değildir |

Düzeltmeden sonra **dokuz kusurun dokuzu da yakalandı** (12 bulgu satırı —
bazı kusurlar iki grafikte birden çıkıyor).

**Ders:** bir tavan koda uygulanırsa, o tavanın ihlali sonuçta görünmez
olur. Ölçüm o zaman sonucu değil, **kararın izini** aramalıdır.

---

## Dilim 1 — Müşteri ve Satış zinciri (11 Ağustos 2026)

Koşum: `node tasks/qa/tarayici.js` · gerçek Chromium · seri (paralel değil).

| | |
|---|---:|
| Ölçülen ekran | **19** (önceki 10 + dilim 1'in 9 yüzeyi) |
| Genişlik | **6** — 1600 · 1440 · 1280 · 1024 · 768 · 390 |
| Toplam ölçüm | **114** |
| Yatay taşma | **0** |
| Konsol / sayfa hatası | **0** |
| Sprite'ta olmayan ikon | **0** |
| Odak bulgusu | **0** |
| Düzeltme gerektiren bulgu | **0** |
| Dış kaynak (Google Fonts CDN) başarısız isteği | 4 — depo kusuru değil, ayrı sayılıyor |

Dilim 1'de eklenen ekranlar ve ölçüm kaydı (hepsi 6 genişlikte temiz):
`app-musteri-detay.html?id=MUS-2026-008` · `app-musteri-form.html` (yeni ve
düzenleme kipi ayrı ayrı) · `app-satis-akisi.html` ·
`app-firsat-detay.html?id=FRS-2026-001` · `app-firsat-form.html` ·
`app-teklif.html` · `app-teklif-detay.html?id=TKL-2026-014` ·
`app-teklif-form.html`.

**Kayıt seçimi ölçümden geldi, rastgele değil:** `MUS-2026-008` hem fırsat hem
teklif taşıyan hesap, `FRS-2026-001` ön analiz + teklif + aktivite taşıyan tek
fırsat, `TKL-2026-014` kalem dökümü **olan tek** teklif. Boş bir `?id=` yalnız
hata durumunu ölçer ve asıl yerleşimi hiç çizmez.

### Eksenin kusur yakaladığı kanıtlandı

Sıfır bulgu tek başına temiz değildir. Bozulmuş kopyaya iki kusur enjekte edildi
(daraltılmış eksen: 1 ekran × 2 genişlik):

| Kusur | Sonuç |
|---|---|
| 3000 px genişliğinde sabit blok | **Yakalandı** — iki genişlikte de `TAŞMA`, en içteki suçlular listelendi |
| Sprite'ta olmayan ikon adı (`i-olmayan-ikon`) | **Yakalandı** — iki genişlikte de `SPRITE — belgede olmayan ikon` |

2 kusur → 4 bulgu (her genişlikte ayrı). Enjeksiyon kopyası silindi; depo
dosyası değiştirilmedi.

---

## Dilim 2 — Finans zinciri (11 Ağustos 2026)

| | |
|---|---:|
| Ölçülen ekran | **26** (önceki 19 + finans 6 + teklif sürüm yüzeyi) |
| Genişlik | **6** — 1600 · 1440 · 1280 · 1024 · 768 · 390 |
| Toplam ölçüm | **156** |
| Yatay taşma · konsol hatası · eksik ikon · odak bulgusu | **0 · 0 · 0 · 0** |
| Düzeltme gerektiren bulgu | **0** |
| Dış kaynak (Google Fonts CDN) | 8 — depo kusuru değil, ayrı sayılıyor |

Eklenen yüzeyler: `app-fatura.html` · `app-fatura-detay.html?id=FTR-2026-025` ·
`app-fatura-form.html?taksit=MS-004` · `app-tahsilat.html` ·
`app-tahsilat-form.html?id=THS-2026-041` · `app-satinalma.html` ·
`app-teklif-detay.html?id=TKL-2026-011` (sürüm zinciri yüzeyi).

**Kayıt seçimi ölçümden geldi:** `FTR-2026-025` zincirin dört halkasını da
taşıyan fatura · `THS-2026-041` tahsil **edilmemiş** kayıt (nakit olayı yok) ·
`MS-004` faturası olmayan dört taksitten biri · `TKL-2026-011` devralınan
sürüm sayacı taşıyan teklif.

### İki yeni eksenin kusur yakaladığı kanıtlandı

Bozulmuş kopyaya **dört kusur** enjekte edildi, **dördü de yakalandı**:

| Kusur | Yakalayan eksen | Bulgu |
|---|---|---|
| Bayat alan tuzağı söküldü | `bayat-alan.js` | tuzak kurulmamış · okuma sessiz · yazma yakalanmıyor |
| Hesap kaydına `durum` aynası geri kondu | `bayat-alan.js` | 12 hesap ayna taşıyor |
| Çapa brütü net sayıyor (çift KDV) | `finans-kanon.js` | 7/7 sözleşme çelişkili · 6 ödeme planı eksen dışı · 9 halka sapması |
| Fatura durumu tazelemede yazılmıyor | `finans-kanon.js` | elle atanan "Ödendi" hayatta kaldı |

4 kusur → **19 bulgu**. Enjeksiyon kopyası silindi; depo dosyası değişmedi.
