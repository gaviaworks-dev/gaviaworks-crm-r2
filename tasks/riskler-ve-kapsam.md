# Riskler ve Kapsam — şartnamenin her maddesi üç kovada

> **Şartname:** `tasks/sadelestirme-talimati.md` (10 Ağustos 2026)
> **Mimari karar (verildi, tartışılmaz):** R2 de **buildless statik**.
> Saf HTML + CSS + vanilla JS, GitHub Pages. Build adımı yok, npm yok,
> framework yok.
>
> **Kapsam kararı:** şartnamenin backend gerektiren maddeleri **uygulanmaz**.
> Deftere yazılır ve ekranda **dürüst mesajla** işaretlenir. Ödeme sağlayıcısı
> seçilmediği için gerçek kart formu **taklit edilmez** — açıkça **TEST**
> etiketli mock adapter kullanılır (§8.7 bunu zaten emrediyor).

---

## 1. Sayım — üç kova

| Kova | Madde | Pay | Önceki |
|---|---:|---:|---:|
| **YAPILABİLİR** (buildless prototipte) | **183** | %74,7 | 169 |
| **BACKEND ŞART** (uygulanmaz, işaretlenir) | **58** | %23,7 | 58 |
| **KARAR BEKLİYOR** (Beyar'a soruluyor) | **4** | %1,6 | 18 |
| **Toplam** | **245** | %100 | 245 |

### 1.0 Ne değişti — 11 Ağustos kararları

Beyar on bir kararı verdi (`tasks/kararlar.md`). On sekiz "karar bekliyor"
maddesi şöyle dağıldı:

| Sonuç | Madde | Hangileri |
|---|---:|---|
| **Karar verildi → YAPILABİLİR'e geçti** | 9 | K-01 · K-02 · K-03 · K-04 · K-05 · K-06 · K-07 · K-11 · K-16 |
| **Planlandı, sonraki dilime** | 2 | K-17 teklif sürümleme · K-18 İK ekran tarafı |
| **Zaten teyitti, kova hatasıydı** | 3 | K-13 · K-14 · K-15 — bunlar şartnameyi mevcut ADR'lerle **doğruluyordu**, çelişki değildi; ilk sayımda yanlış kovaya konmuşlardı |
| **Hâlâ karar bekliyor** | 4 | K-08 · K-09 · K-10 · K-12 |

`18 − 9 − 2 − 3 = 4`. Karar verilen dokuz madde ve teyit olan üçü artık
YAPILABİLİR kovasında: `169 + 9 + 3 + 2 = 183`.

⚠️ **Kendi hatamı kaydediyorum:** K-13/14/15 ilk turda "karar bekliyor" diye
sayılmıştı ama üçü de şartnamenin mevcut kararla **uyumlu olduğunu** söyleyen
teyit satırlarıydı. Kova sayısını üç madde şişirmişler. R1 dersi L-26'nın
defter tarafındaki karşılığı: *ölçüm borcu fazla da sayabilir.*

### 1.1 Sayım yöntemi — açıkça

Bir "madde" = şartnamedeki **tek, sınanabilir hüküm**. Ayrıştırma bölüm
bölüm yapıldı; bir maddenin kovası **birincil teslimatına** göre seçildi.
Örnek: §10 yetki matrisinin dokuz satırı "BACKEND ŞART" sayıldı, çünkü o
tablonun normatif gücü **uygulamadadır**, ekranda göstermek değil.

| Bölüm | Madde | Bölüm | Madde |
|---|---:|---|---:|
| §3.1 navigasyon | 9 | §7.4 çıktı | 10 |
| §3.2 üst çubuk | 8 | §8.1 sayfalar | 5 |
| §3.3 birleştirme matrisi | 12 | §8.2 form | 10 |
| §4.1 gündem yerleşimi | 6 | §8.3 dış ekran | 9 |
| §4.2 hızlı notlar | 13 | §8.4 durum modeli | 12 |
| §5.1 yaşam evresi | 8 | §8.5 finansal kural | 8 |
| §5.2 tek form | 3 | §8.6 güvenlik | 8 |
| §5.3 fırsat ayrımı | 8 | §8.7 sağlayıcı adapter | 7 |
| §5.4 detay sekmeleri | 2 | §9 veri modeli + uçlar | 25 |
| §6.1–6.2 operasyon yerleşimi | 8 | §10 yetki matrisi | 9 |
| §6.3 hızlı işlemler | 9 | §11 geçiş planı | 7 |
| §6.4 ikinci ekran | 4 | §12 kabul kriterleri | 15 |
| §7.1 tek rapor yüzeyi | 15 | | |
| §7.2 fatura/tahsilat | 8 | | |
| §7.3 görsel kurallar | 7 | **Toplam** | **245** |

---

## 2. BACKEND ŞART — 58 madde, uygulanmaz

Bunlar prototipte **taklit edilemez**. Taklit etmek, olmayan bir yeteneği
varmış gibi göstermektir ve bu projede yasaktır. Her biri ekranda dürüst
mesajla işaretlenir.

| Kaynak | Madde | Neden backend |
|---|---:|---|
| §4.2 not sahipliği API kapısı | 1 | "yalnız arayüzde filtrelemek yeterli değildir" — şartnamenin kendi cümlesi |
| §6.3 sunucu tarafı yeniden doğrulama | 1 | "Arayüzde butonu gizlemek tek başına yetki kontrolü sayılmaz" |
| §6.4 cihazlar arası senkron | 1 | WebSocket/sunucu olayı. `BroadcastChannel` (aynı tarayıcı) **yapılabilir** kovasında |
| §7.4 gerçek XLSX + gerçek PDF | 2 | R1'de de kısmiydi: "Excel" tab ayraçlı `.xls` metni, "PDF" yazdırma penceresi |
| §7.4 export denetim kaydı (kalıcı) | 1 | append-only defter |
| §8.3 ödeme kesinliği | 1 | "Müşteri tarayıcıdaki başarı dönüşüyle ödenmiş kabul edilmemelidir" |
| §8.5 finansal kurallar | 7 | idempotency anahtarı · webhook · sunucudan yeniden okuma · mutabakat kuyruğu |
| §8.6 güvenlik | 8 | token hash · HTTPS · rate limit · replay koruması · webhook imzası · PCI · 3-DS · denetim izi |
| §8.7 gerçek sağlayıcı + anahtar yönetimi | 2 | canlı anahtar sunucu gizli deposunda |
| §9 servis uçları | 17 | on yedi REST ucu |
| §10 yetki uygulaması | 9 | satır düzeyi kapsam, tutar limiti, ikinci onay |
| §11 veri göç doğrulaması + CI sayım kontrolü | 3 | — |
| §12 kabul kriterleri (API izolasyon testi, webhook idempotency, ödeme kesinliği, `legacy_id`, güvenlik) | 5 | — |
| **Toplam** | **58** | |

### 2.1 Dürüst işaretleme — bugün nerede yapılmış

R2'de bugün yayında olan tek backend payı **not sahipliğidir** ve
işaretlenmiştir:

- `assets/js/quicknote.js` başında `BACKEND_NOTU` sabiti
- Çekmecenin altında `.qn-backend` sınıfıyla, **gizlenmeden**:
  > "Sahiplik süzgeci bu prototipte istemcide çalışır. Gerçek sistemde her
  > okuma ve yazma sunucuda `owner_user_id` ile doğrulanır."
- Gündem panelindeki Hızlı Notlar kartının altında aynı metin

Kalan 57 madde henüz **yazılmamış ekranlara** ait; o ekranlar doğduğunda
aynı disiplinle işaretlenecek.

---

## 3. KARAR DURUMU — 18 madde sorulmuştu, 4'ü açık

> 11 Ağustos'ta on bir karar verildi (`tasks/kararlar.md`). Aşağıdaki
> §3.2–§3.4 bölümleri **soruların ilk hâlini** korur — bir kararın neden
> sorulduğu, kararın kendisi kadar önemlidir ve geri alınırken okunmalıdır.

### 3.0 Kapanan on dört madde — özet

| # | Madde | Karar | ADR |
|---|---|---|---|
| K-01 | Menü 18 mi 20 mi | 20 model, 3'ü yönetici-özel, standart 17 | ADR-R2-02 |
| K-02 | Sohbet modülünün yeri | Kapsam dışı | ADR-R2-03 |
| K-03 | Referans + komisyon | Gömülüyor | ADR-R2-04 |
| K-04 | 19 filo raporu | Yedinci şablon olmaz, katalogda kalır | ADR-R2-05 |
| K-05 | Doküman merkezi | Bağlama gömülür + yönetim girdisi | ADR-R2-06 |
| K-06 | Yönetici paneli | Ana Panel'in rol varyantı | ADR-R2-07 |
| K-07 | Fırsat ekranı | Kendi detay ve formunu alır | ADR-R2-08 |
| K-11 | Not izolasyonu | Tembel yükleme + yükleme anında süzgeç | ADR-R2-01 |
| K-13 | ADR-13 kişisel not raporlara girmez | teyit — çelişki yoktu | — |
| K-14 | ADR-20 sahiplik kapısı | teyit — çelişki yoktu | — |
| K-15 | ADR-16 "ERP" kaldırıldı | teyit — çelişki yoktu | — |
| K-16 | Ödeme sağlayıcısı | TEST mock ile devam | ADR-R2-09 |
| K-17 | Teklif sürümleme | R2'de yapılacak, bu dilimde değil | ADR-R2-11 |
| K-18 | İK ekran tarafı | R2'de yapılacak, bu dilimde değil | ADR-R2-11 |
| R-02 | Ödeme linki motoru | `GV.flow`'un 16. varlığı | ADR-R2-10 |

### 3.1 Hâlâ karar bekleyen dört madde

| # | Madde | Ne belirsiz |
|---|---|---|
| **K-08** | Bütçe ekranının yeri | Proje detayı sekmesi mi, Nakit raporu görünümü mü? Varsayım: proje detayı |
| **K-09** | Bakım paketi ve SLA ekranlarının yeri | Müşteri detayı sekmesi mi, ayrı sözleşme yüzeyi mi? Varsayım: müşteri detayı |
| **K-10** | Departman taleplerinin Operasyon kuyruğuna girmesi | §6.2 kuyruk tiplerinde adı geçmiyor. **Bu turda kuyruğa alınmadı** — beş tip şartnamede birebir yazılı olanlarla sınırlı tutuldu |
| **K-12** | İki farklı geri alma süresi | ADR-14 silme için 7 gün, §4.2 tamamlama için 5 saniye. İkisi ayrı eksen ve ikisi de yaşıyor; kullanıcıya karışık gelir mi? |

### 3.2 (eski) Şartnamenin kendi içindeki çelişkiler

| # | Madde | Çelişki |
|---|---|---|
| **K-01** | Menü hedefi 18 mi 20 mi | §3.1 tablosundaki "Görünen ana sayfalar" sütunu sayıldığında **20** çıkıyor (1+3+4+4+3+1+4). §3.1 metni ve §12 kabul kriteri **"en fazla 18"** diyor. **R2'de çözüldü**: üç ayar girdisi yönetici-özel yapıldı → standart kullanıcı **17** görüyor. Bu okuma onaylanmalı. |
| **K-04** | 19 filo raporunun yeri | §7.1 altı şablon tanımlıyor; filo hiçbirine düşmüyor. 105 raporun **%18'i** karşılıksız. Yedinci şablon mu, yalnız "Ayrıntılı analiz" katalogunda mı? |

### 3.2 Şartnamenin sessiz kaldığı yerler

| # | Madde | Boşluk |
|---|---|---|
| **K-02** | Sohbet modülünün yeri | Yedi çalışma alanında da, §3.2 üst çubuk araçlarında da yok. 1 ekran, 1 menü girdisi. |
| **K-03** | Referans + komisyon modülünün yeri | 6 ekran, 2 menü girdisi, 10 rapor kaydı. Yedi alanda karşılığı yok; Finans'ın dört girdisi dolu. |
| **K-05** | Doküman merkezinin menü konumu | §3.3 ekranı koruyor ("merkezi arşivi arama/yönetim için tut") ama §3.1 menüsünde "Belgeler" yok. |
| **K-06** | Yönetici paneli kalıyor mu | §4.1 "kartlar rol bazlı varsayılan gelir" diyor; ayrı yönetici ekranı anılmıyor. |
| **K-07** | Fırsat kendi ekranını hak ediyor mu | §5.3 `opportunity`yi ayrı varlık yapıyor, §3.1'de menü girdisi yok, §5.4'te yalnız sekme. Satış Akışı kartından nereye tıklanacak? |
| **K-08** | Bütçe ekranının yeri | §3.1'de yok; proje detayı sekmesi olarak **varsayıldı**. |
| **K-09** | Bakım paketi ve SLA ekranlarının yeri | §3.1'de yok; müşteri detayı ve rapor olarak **varsayıldı**. |
| **K-10** | Departman taleplerinin Operasyon kuyruğuna girmesi | §6.2 kuyruk tipleri arasında adı geçmiyor; "ortak tipte gösterilebilir"den **çıkarım**. |

### 3.3 Mevcut kararları tersine çeviren hükümler

| # | Madde | Çakışma |
|---|---|---|
| **K-11** | **ADR-21 ↔ §4.2** | ADR-21: kişisel not verisi **ayrı dosyada**, kurumsal ekranlar `notes.js`'i yüklemez — "sızıntı yolu fiziksel olarak kapalı" (R1'de ölçüldü: 148 ekranın yalnız **2'si** yüklüyordu). §4.2: "**Tüm sayfalarda** sağ kenarda Not Al düğmesi". R2'de her sayfa `notes.js` yüklemek zorunda → **ADR-21'in fiziksel garantisi kalkıyor**, geriye yalnız `GV.notes` sahiplik kapısı kalıyor. |
| **K-12** | **ADR-14 ↔ §4.2** | ADR-14: silinen not **7 gün** geri alınabilir. §4.2: tamamlanan not **5 saniye** geri alınabilir. İkisi **farklı eksen** (silme ↔ tamamlama) ve R2'de ikisi de yaşıyor; ama kullanıcıya iki farklı geri alma süresi anlatmak karışıklık yaratır mı? |
| **K-13** | **ADR-13 ↔ §4.2** | ADR-13: kişisel not içeriği genel arama ve rapor yüzeyine **hiç** girmez. §4.2 bunu doğruluyor ("raporlara girmez") — çelişki **yok**, teyit var. Kayda geçirildi. |
| **K-14** | **ADR-20 ↔ §10** | ADR-20: erişim kapısı rol matrisinde değil **sahiplikte**; `sahip` ve `sistem` dahil kimse başkasının notunu göremez. §10: "Kendi hızlı notunu gör/yaz · Tüm iç kullanıcılar · `owner_user_id` zorunlu" — **uyumlu**. Teyit. |
| **K-15** | **ADR-16 ↔ yeni belge** | ADR-16 ürün adından "ERP" kaldırdı. Yeni şartname "CRM / operasyon" diyor — **uyumlu**. Teyit. |
| **K-16** | Ödeme sağlayıcısı seçimi | Şartname §8.7 ve §14 açıkça sağlayıcı **seçmiyor**. Mock adapter TEST etiketiyle kurulacak; canlıya çıkış kararı ayrı. |

### 3.4 R1'den devralınan açık borçlar — R2'de kapatılacak mı

| # | Madde | Durum |
|---|---|---|
| **K-17** | Teklif sürümleme | R1'de **yapılmadı**: revizyon yeni kayıt üretmiyor, eski sürüm kilitlenmiyor. Ekran bunu kullanıcıya itiraf ediyor. R2'de kapatılsın mı? |
| **K-18** | İK ekran tarafı | R1'de veri ve iki kapı hazır (`employee` 15. geçiş varlığı), ama `durum` alanı **hiçbir ekranda okunmuyor** ve `aktif` boolean'ı paralel duruyor. |

---

## 4. YAPILABİLİR — 169 madde

Bunlar buildless statik prototipte **tam olarak** yapılabilir. Bugün
üçü yayında; kalanı sonraki fazlarda.

### 4.1 Bugün yayında — dokuz ekran

| Madde | Nerede | Kanıt |
|---|---|---|
| §3.1 yedi çalışma alanı | `assets/js/shell.js` | ölçüldü: 7 alan |
| §3.1 ≤18 görünür girdi | aynı | ölçüldü: **17** (27 rol tarandı) |
| §3.1 yönetici girdisi farklı görsel ağırlıkta | `.gv-menu-admin` bloğu | 3 girdi ayrı blokta, soluk |
| §3.2 yedi küresel araç | `renderTop()` | arama · Yeni · takvim · onay · bildirim · Hızlı Not · profil |
| §3.2 takvim/bildirim/onay/not için ayrı bölüm YOK | `RAIL_ORDER` | 7 alanın hiçbiri bunlar değil |
| §4.1 gündem yerleşimi | `app-panel.html` | 4 sayaç + 6 kart |
| §4.1 en fazla altı kart | aynı | ajanda · kuyruk · not · bildirim + 2 rol özeti |
| §4.1 rol bazlı iki özet | `OZET_BY_ROLE` | 12 rol eşlendi |
| §4.2 tek metin alanı, ilk satır başlık | `quicknote.js` | `basligiCikar()` |
| §4.2 Enter kaydeder, Shift+Enter satır açar | aynı | `keydown` |
| §4.2 checkbox tamamlar + 5 sn geri alma | aynı | `geriAlmaSerit()` |
| §4.2 tamamlanan 24 saat sonra gizlenir | aynı | `GIZLEME_SAAT` |
| §4.2 kategori/renk/öncelik/KPI/toplu işlem/arşiv YOK | aynı | form dört alan |
| §4.2 eski alanlar metadata olarak korunur | `notes.js` taşındı | `GV.notes` hâlâ okuyor |
| §5.1 beş yaşam evresi + geçiş tablosu | `lifecycle.js` | `DB.lifecycleStages` |
| §5.1 evre kolonu + filtre | `app-musteri.html` | kolon · filtre · 5 sekme |
| §5.1 aday nötr etiket, ayrı tema yok | aynı | `tone:''` |
| §5.3 fırsat ayrımı | `lifecycle.js` | `DB.opportunities` 12 kayıt |
| §5.3 yeni müşteri kopyası üretilmez | aynı | 4 lead katlandı, 20 hesap |
| §12 `legacy_id` izlenebilirliği | aynı | her hesapta `legacy_id` + `legacy_kaynak` |
| §4.2 not verisi tembel yüklenir | `quicknote.js` | 9 HTML'in 0'ı notes.js yüklüyor |
| §6.2 çift bölme %35/%65 | `app-operasyon.html` | ayırıcı %30–%50'de kilitli, tercih saklanıyor |
| §6.2 beş kuyruk tipi ortak satır | `kuyruk.js` | 39 satır · 22 görev · 4 destek · 10 onay · 1 takip · 2 tahsilat |
| §6.3 sekiz hızlı eylem | `app-operasyon.html` | `GV.flow`/`GV.approval` üzerinden, `GV.audit`e yazıyor |
| §6.3 ret/revizyon/iptal gerekçesiz tamamlanmaz | `GV.action` | boş açıklama pencereyi kapatmıyor (ölçüldü) |
| §6.4 odak penceresi + `BroadcastChannel` | `app-operasyon.html` | ekran algılama izni kullanılmıyor |
| §8.1 beş ödeme ekranı | 5 dosya | liste · form · detay · dış ödeme · sonuç |
| §8.2 ilk görünüm 6 alan + tek eylem | `app-odeme-linki-form.html` | gelişmiş seçenekler kapalı; kart alanı yok |
| §8.3 dış ekran CRM göstermez | `app-odeme.html` | 0 kabuk düğümü, 0 girdi alanı, TEST 4 kez |
| §8.3 tarayıcı dönüşü ödeme yaratmaz | `app-odeme-sonuc.html` | 5 sonuçun 5'i linki ODENDI yapmıyor |
| §8.4 durum makinesi | `odeme.js` | 12 durum · 31 kenar · yetim hedef yok |
| §8.5 tutar kalan bakiyeyi aşamaz | form | fazla tutar reddediliyor, kayıt oluşmuyor |
| §8.7 TEST mock adapter | `odeme.js` | gerçek kart formu taklit edilmedi |
| §12 altı genişlikte taşma yok | tarama | 9 ekran × 6 genişlik = **54 ölçüm, 0 taşma** |

### 4.2 Sonraki fazlarda

§7.1 tek rapor yüzeyi ve altı şablon · §7.2 fatura/tahsilat sadeleştirmesi ·
§5.2 sade müşteri formu · §5.4 sekiz sekmeli müşteri detayı · §5.3 fırsat
detay ve form ekranı (ADR-R2-08) · 148 ekranın toplu göçü · K-17 teklif
sürümleme · K-18 İK ekran tarafı.

---

## 5. RİSKLER — bu revizyon neyi kırar

### R-01 · `shell.js` tek ortak menü kaynağı, tüm sayfalarda yüklü

**Ölçüm:** R1'de `shell.js` **149 sayfada** yüklüydü (`grep -l` ile ölçüldü).
Menü yeniden yapılandırması tek dosyada tüm sayfaları **aynı anda** etkiler.

**R2'de neden düşük risk:** yeni repo üç ekranla başladı. Menü değişikliği
bugün üç sayfayı etkiliyor, 149'u değil. R1'de aynı işi yapmak 148 sayfayı
tek commit'te riske atardı — **ayrı repo kararının asıl kazancı budur.**

**Kalan risk:** göç ilerledikçe bu risk geri gelir. Her yeni ekran
`shell.js`'e bağlanır. Menü modeli değişecekse **erken** değişmeli.

### R-02 · `GV.flow` ile ödeme linki state machine'inin ilişkisi

**Ölçüm:** `DB.flowEntities` **15 varlık** taşıyor (`task · project ·
contract · quote · analysis · invoice · bug · ticket · purchase · leave ·
delivery · change · request · order · employee`).

§8.4 on iki durumlu tam bir state machine tanımlıyor
(`TASLAK · AKTIF · ACILDI · ISLEMDE · KISMI_ODENDI · ODENDI · SURESI_DOLDU ·
IPTAL · HATA` + üç iade durumu).

**Karar gereken yer:** ödeme linki `GV.flow`'un **16. varlığı** mı olacak,
yoksa ayrı bir motor mu? Lehine: geçiş doğrulaması, yetki kapısı ve aktivite
yazımı zaten `GV.flow`'da ve ölçülmüş. Aleyhine: §8.5 finansal kuralların
çoğu (idempotency, webhook) backend payıdır ve `GV.flow` onları taşıyamaz —
yarı uygulanmış bir durum makinesi, tam sanılabilir.

**Öneri (karar değil):** `GV.flow`'a 16. varlık olarak eklensin, backend
payı olan geçişler ekranda **TEST/mock** etiketiyle işaretlensin.

### R-03 · `GV.notes` sahiplik kapısı istemcide, şartname sunucu istiyor

**Ölçüm:** R1'de `notes.js` **148 ekranın yalnız 2'sinde** yüklüydü (ADR-21).
Sızıntı yolu fiziksel olarak kapalıydı — kurumsal ekran veriyi hiç görmüyordu.

**Şartname §4.2 bunu tersine çeviriyor:** "Tüm sayfalarda sağ kenarda Not Al
düğmesi." R2'de her sayfa `notes.js` yüklemek zorunda.

**Kırılan şey:** ADR-21'in *fiziksel* garantisi. Geriye yalnız `GV.notes`'un
*mantıksal* kapısı kalıyor — ve o kapı istemcide.

**Bugün ne yapıldı:** çekmece bunu ekranda **açıkça yazıyor**. Gizlenmedi.

**Kalan risk:** modül canlıya çıkarsa bu bir **veri gizliliği açığıdır**.
R1 kapanış raporu bunu zaten "modül canlıya çıkmadan kapatılması **zorunlu**
bir açık" diye kaydetmişti. Karar değişmedi, yüzeyi büyüdü.

### R-04 · 105 raporun altı şablona eşlenmesi — ne kadarı veri, ne kadarı ekran

**Ölçüm:** `DB.reportRegistry` 105 kayıt, yedi ekrandan **üretilmiş**
(`node tasks/qa/reg.js --uret`). Kategori dağılımı `rota-haritasi.md` §9.1'de.

**Ayrışma:**

| Pay | İş | Tahmin |
|---|---|---|
| **Veri işi** | 105 kaydın her birine `sablon` + `drillFilter` alanı eklemek | ~86 kayıt mekanik olarak eşlenir |
| **Ekran işi** | Altı şablonun kendisi: ≤4 KPI, ≤2 grafik, 1 tablo | 6 şablon × (KPI + grafik + tablo) |
| **KARARSIZ** | 19 filo kaydı — hedef şablon yok | K-04 |

Yani **%82'si veri işi, %18'i karar bekliyor.** Ekran işi altı şablonla
sınırlı ve şartname §7.1'de birebir tarif edilmiş.

⚠️ **Registry üretilen bir dosyadır** (`reports.js` başında yazılı: "BU DOSYA
ÜRETİLİR, ELLE DÜZENLENMEZ"). Eşleme alanları elle eklenirse **ilk yeniden
üretimde silinir**. Üreteç (`reg.js`) R2'ye taşınmadı — göç fazında ya
taşınmalı ya da eşleme ayrı dosyada tutulmalı.

### R-05 · Yaşam evresi türetmesi bir VARSAYIM taşıyor

`lifecycle.js` on lead aşamasını beş evreye eşliyor. Dokuzu tartışmasız.
Biri değil:

> `'Beklemeye alındı'` → **NITELIKLI** seçildi. İhtiyaç doğrulanmış ama süreç
> durmuş. ADAY'a düşürmek doğrulanmış bilgiyi çöpe atmak olurdu.

Bu tek kayıtta (`LEAD-2026-012` Yıldız Lojistik Depolama) etkili. Beyar
farklı düşünürse tek satır değişir.

### R-06 · `app-proje-detay.html` sekme yükü

R1'de bu ekran **111 KB**. §3.3 ona altı liste daha sekme olarak ekliyor
(milestone · sprint · test · hata · değişiklik · teslim). Tembel sekme
yüklemesi olmadan ekran ağırlaşır.

### R-07 · Dış ödeme ekranı `shell.js` yüklememeli

§8.3: "Dış sayfa uygulama menüsü veya CRM bilgisi göstermemelidir."
`app-odeme.html` **kabuğu hiç yüklememeli** — `buildSkeleton()` çağrılırsa
rail ve menü doğar. Bu, R2'deki tek "kabuksuz" sayfa olacak ve `index.html`
gibi ayrı bir yükleme profili ister.

---

## 6. Bu turda ölçülen ve eski paydaya karışmayan yeni borç

> R1'in kapanmış defterleri (`plan.md`, `revize-plan.md`, `cloud-plan.md`)
> **yeniden açılmadı**. Aşağıdakiler R2'nin kendi borcudur.

| # | Yeni borç | Kaynak |
|---|---|---|
| Y-01 | 19 filo raporunun altı şablonda karşılığı yok | rota §9.1 |
| Y-02 | 13 ekran / 8 menü girdisi hedef mimaride adressiz | rota §13 |
| Y-03 | Göç aritmetiği 24 değil **20** — 4 lead↔müşteri çifti aynı adı taşıyor | `lifecycle.js` |
| Y-04 | §3.1 tablosu 20 girdi üretiyor, §12 "en fazla 18" diyor | K-01 |
| Y-05 | ADR-21'in fiziksel not izolasyonu kalkıyor | R-03 |
| Y-06 | `reports.js` üretilen dosya; eşleme alanı elle eklenirse silinir | R-04 |
| Y-07 | `reg.js` üreteci R2'ye taşınmadı | R-04 |
| Y-08 | ~~Playwright tarama seti yok~~ → **kapandı**: 5 eksen kuruldu (`tarayici` · `kontrol` · `ops-akis` · `odeme-akis` · `not-izolasyon`) | §7 |
| Y-09 | Yazı tipi Google Fonts CDN'inden geliyor; ağ engelli ortamda her sayfa konsol hatası verir ve tipografi sisteme düşer | tarayıcı ölçümü |
| Y-10 | Tab zinciri ölçümü 12 adımla sınırlı; müşteri listesinde 72 odaklanabilir düğümün 60'ı ölçülmedi | tarayıcı ölçümü |
| Y-11 | Ödeme linki adresi gerçek token taşımıyor; kayıt kodu kullanılıyor (B-03) | `odeme.js` |
| Y-12 | QR üretimi yok — dış kütüphane gerektiriyor, buildless kısıtı gereği kurulmadı | `app-odeme-linki-form.html` |
| Y-13 | ADR-R2-06'nın menü etkisi (doküman arşivi yönetim girdisi) henüz uygulanmadı | rota §14 |

---

## 7. Bugün ölçülmeyen — dürüstlük notu

⚠️ **Tarayıcı çalıştırılmadı.** Bu turun kısıtı buydu. Dolayısıyla:

- "Konsol hatası yok" **iddia edilmiyor**
- CSS taşması, responsive kırılım (1600/1440/1280/1024/768/390) **ölçülmedi**
- İkon sprite yüklemesi, olay dinleyicileri, drawer animasyonu **ölçülmedi**
- Erişilebilirlik (WCAG 2.2 AA, klavye odağı) **ölçülmedi**

**11 Ağustos güncellemesi — bunların bir kısmı artık ölçülüyor.** Beş eksen
kuruldu ve hepsi temiz:

| Eksen | Ne ölçüyor | Sonuç |
|---|---|---|
| `kontrol.js` | sözdizimi · referans · veri bağımlılığı · menü · durum makinesi | temiz |
| `tarayici.js` | 9 ekran × 6 genişlik: konsol · taşma · sprite · odak | 54 ölçüm, 0 bulgu |
| `ops-akis.js` | operasyon kuyruğu, ayırıcı sınırı, gerekçe zorunluluğu | temiz |
| `odeme-akis.js` | kart alanı yokluğu, süresi dolmuş link, ödeme kesinliği | temiz |
| `not-izolasyon.js` | tembel yükleme, sahiplik süzgeci (dört negatif hüküm) | temiz |

**Hâlâ ölçülmeyenler:** WCAG 2.2 AA kontrast · ARIA doğruluğu · ekran okuyucu
duyurusu · tam Tab zinciri (12 adımla sınırlı, Y-10) · rol bazlı tarayıcı
taraması (yalnız `sahip` ile koşuldu) · ekran görüntüsü.

R1'in 24 eksenli setinden `canon · dep · dbref · esc · mut · listen · tabs ·
gate · act · xport · reg · formtab` **hâlâ taşınmadı**; taşınması ayrı bir
iştir ve Y-08'in kalan payıdır.
