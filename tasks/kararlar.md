# R2 Karar Defteri (ADR)

> Beyar'ın 11 Ağustos 2026'da verdiği on bir karar. Hepsi **uygulandı**;
> tartışma kapandı. Karar kodları `tasks/riskler-ve-kapsam.md` §3'teki
> K-numaralarına karşılıktır.
>
> Bir karar geri alınabilir — ama geri alınırken **gerekçesi okunmalıdır**.
> Bu defter o gerekçeyi taşır.

---

## Özet

| # | Karar | Durum | Nerede uygulandı |
|---|---|---|---|
| ADR-R2-01 | Kişisel not verisi tembel yüklenir | ✅ | `quicknote.js` · `tasks/qa/not-izolasyon.js` |
| ADR-R2-02 | 20 girdilik model doğru, 3'ü yönetici-özel | ✅ | `shell.js` · `kontrol.js` §5 |
| ADR-R2-03 | Sohbet modülü kapsam dışı | ✅ | rota haritası |
| ADR-R2-04 | Referans ve komisyon gömülür | ✅ | rota haritası |
| ADR-R2-05 | Filo raporları yedinci şablon olmaz | ✅ | rota haritası |
| ADR-R2-06 | Doküman: bağlama gömülür + yönetim girdisi | ✅ | rota haritası |
| ADR-R2-07 | Yönetici paneli ayrı ekran değildir | ✅ | `app-panel.html` rol özetleri |
| ADR-R2-08 | Fırsat kendi detay ve form ekranını alır | ✅ | rota haritası (yazım sonraki dilim) |
| ADR-R2-09 | Ödeme sağlayıcısı: TEST mock ile devam | ✅ | `odeme.js` · beş ödeme ekranı |
| ADR-R2-10 | Ödeme linki `GV.flow`'un 16. varlığıdır | ✅ | `odeme.js` |
| ADR-R2-11 | Teklif sürümleme ve İK ekranı sonraki dilim | ✅ | planlandı, bu dilimde yapılmadı |

---

## ADR-R2-01 · Kişisel not verisi TEMBEL YÜKLENİR

**Karar (K-11).** Not verisi sayfa açılışında belleğe girmez. Kullanıcı açık
bir eylemle isteyene kadar `notes.js` hiç çekilmez. Çekildiği anda sahiplik
süzgeci uygulanır ve yabancı kayıtlar **bellekten atılır** — ekranda
gizlenmez.

### Bağlam

R1'de bu güvence **fizikseldi** (ADR-21): `notes.js` 148 ekranın yalnız
**2'sinde** yüklüydü. Kurumsal bir ekran kişisel not verisini hiç görmüyordu;
sızıntı yolu kodda değil, **dosya yükleme grafiğinde** kapalıydı.

Şartname §4.2 bunu tehdit etti:

> "Tüm sayfalarda sağ kenarda **Not Al** düğmesi"

Düğüm her sayfada olacaksa veri de her sayfada olmalıydı — ve ADR-21'in
fiziksel garantisi düşerdi. Geriye yalnız `GV.notes`'un istemcideki mantıksal
kapısı kalırdı.

### Neden düz bırakılmadı

Fark ince ama önemlidir:

| | R1 (ADR-21) | Düz taşıma | **ADR-R2-01** |
|---|---|---|---|
| Veri ne zaman yüklenir | 2 ekranda, sayfa açılışında | **her** ekranda, açılışta | yalnız kullanıcı isteyince |
| Yabancı kayıt bellekte mi | o iki ekranda **evet** | **evet** | **hayır** |
| Süzgeç ne zaman çalışır | okuma anında | okuma anında | **yükleme anında** |

Düz taşıma, R1'e göre **geriye gitmek** olurdu: veri iki ekran yerine dokuz
ekrana yayılacak, üstelik hâlâ okuma anında süzülecekti.

### Uygulama

- Hiçbir HTML `notes.js`'i `<script>` ile yüklemez — ölçüldü: **9 dosyanın 9'u temiz**
- `GV.quickNote.yukle()` betiği dinamik enjekte eder, tek sefer çalışır
- Yükleme biter bitmez `sahipSuz()` koşar ve `DB.personalNotes` ile
  `DB.personalNoteChecklistItems` **yıkıcı biçimde** süzülür
- Oturum yoksa iki koleksiyon da **boş** bırakılır — "oturum yoksa hepsini
  göster" yedeği tam olarak kapatılan açıktır
- Panel kartı veriyi kendiliğinden çekmez; bir kapak basar ve kullanıcı
  "Notlarımı göster" derse yükler
- Yükleme başarısız olursa ekran **"okunamadı"** der, "notunuz yok" demez

### Ölçüm

`node tasks/qa/not-izolasyon.js` — dört negatif hüküm sınanır:

```
[N2] 9 HTML dosyasının hiçbiri notes.js yüklemiyor
[N1] dört ekranda açılışta not yok, notes.js hiç istenmedi
[N3] EMP-001 → 2 not / 3 madde · yabancı: 0
     EMP-004 → 2 not / 4 madde · yabancı: 0
     EMP-007 → 2 not / 1 madde · yabancı: 0
[N4] çekmece açılınca veri yüklendi ve not alanı çizildi
```

Kaynak dosyada 14 sahiplik kaydı var (`EMP-001`:5, `EMP-004`:6, `EMP-007`:3).
Hiçbir oturumda başkasınınki bellekte kalmıyor.

### Sınırı — gizlenmiyor

**Bu, backend izolasyonunun yerini TUTMAZ.** Şartname §4.2'nin hükmü hâlâ
karşılanmamıştır:

> "API her okumada ve yazmada `owner_user_id` kontrolü yapar; yalnız
> arayüzde filtrelemek yeterli değildir."

Veri istemciye ulaşıyor; ulaştıktan sonra süzülüyor. Kararlı bir saldırgan ağ
katmanında dosyanın tamamını görebilir. Çekmece bunu ekranda söylemeye devam
ediyor ve madde **B/backend listesinde açık kalıyor**.

Yapılan şey şudur: *istemcide yapılabilecek en güçlü önlem*, sunucu gelene
kadar.

---

## ADR-R2-02 · Menü 20 girdilik modeldir, üçü yönetici-özeldir

**Karar (K-01).** Şartname §3.1 tablosunun ürettiği 20 girdi doğrudur. Üç
ayar girdisi (Şirket ve Erişim · Entegrasyonlar · Sistem Kayıtları) yalnız
yönetim rollerine açılır; standart kullanıcı **17** girdi görür.

**Gerekçe.** §3.1 metni ve §12 kabul kriteri "en fazla 18" diyor ama aynı
bölümün tablosu 20 üretiyordu. §3.1'in kendi cümlesi çıkışı gösteriyordu:
*"Sistem yöneticisi, ayar sekmeleri nedeniyle daha fazla öğeye erişebilir;
ancak bunlar günlük menüyle aynı görsel ağırlıkta olmamalıdır."*

**Uygulama.** Üç girdi `roles:` kapısıyla kapanır (erişim) **ve**
`yonetim:true` bayrağıyla ayrı, soluk bir "Yönetim" bloğuna düşer (görsel
ağırlık). İki eksen ayrıdır: bayrak yetki vermez, kapı görünüm değiştirmez.

**Ölçüm.** 27 rolün tamamı koşuldu: en yüksek günlük girdi **17**, en yüksek
çalışma alanı **7**. `node tasks/qa/kontrol.js` §5.

---

## ADR-R2-03 · Sohbet modülü kapsam dışıdır

**Karar (K-02).** `app-sohbet.html` R2'ye taşınmaz.

**Gerekçe.** Şartnamenin yedi çalışma alanının hiçbirinde iletişim/sohbet
yok; §3.2'nin yedi küresel aracında da yok. Belge bu modülü hiç anmıyor.
Adressiz bir modülü sekizinci alan açarak taşımak, revizyonun tek cümlelik
amacına (*"kullanıcının geçtiği ekran sayısını azaltmak"*) aykırıdır.

**Sonuç.** Rota haritasında **KAPSAM DIŞI**. Veri (`DB.channels`) R1'de
duruyor; R2'ye kopyalanmadı.

---

## ADR-R2-04 · Referans ve komisyon gömülür

**Karar (K-03).** Yönlendiren kişi müşteri detayında **alan** olur; komisyon
Finans raporunda **satır** olur. Ayrı menü girdisi açılmaz.

**Gerekçe.** Altı ekran ve iki menü girdisi, ikisi de nadir kullanılan bir
gelir kanalı için. §2'nin "durum ayrı modül değildir" ilkesinin aynısı burada
da geçerli: yönlendirme bir **müşteri niteliğidir**, komisyon bir **finansal
satırdır**. Finans'ın dört girdisi zaten dolu; beşincisi 18 sınırını zorlardı.

**Etkilenen:** `app-referans*.html` (3) · `app-komisyon*.html` (3) → altısı da
GÖMÜLÜYOR. `DB.referrers` verisi korunur.

---

## ADR-R2-05 · Filo raporları yedinci şablon olmaz

**Karar (K-04).** Altı ana rapor şablonu korunur. 19 filo rapor tanımı
"Ayrıntılı analiz" kataloğunda kalır.

**Gerekçe.** 105 rapor tanımının 19'u (**%18**) altı şablonun hiçbirine
düşmüyordu. İki yol vardı: yedinci şablon açmak, ya da o kümeyi katalogda
bırakmak. Yedinci şablon §7.1'in "altı varsayılan rapor" hükmünü bozardı ve
sadeleştirmenin sayısal hedefini delerdi.

**Sonuç.** §7.1'in kendi çıkışı kullanılıyor: *"Yönetici için 'Ayrıntılı
analiz' seçeneği açılabilir; standart kullanıcıya katalog gösterilmemelidir."*
Filo raporları oraya düşer — silinmez, standart kullanıcıya da gösterilmez.

---

## ADR-R2-06 · Doküman: günlük ekleme gömülür, arşiv yönetimde kalır

**Karar (K-05).** Günlük belge ekleme ilgili kaydın **Belgeler sekmesine**
gömülür. Merkezî arşiv, Ayarlar'ın **yönetim bloğunda** ayrı girdi olur.

**Gerekçe.** §3.3 ikisini birden istiyordu: *"Günlük belge eklemeyi bağlama
taşı; merkezi arşivi arama/yönetim için tut."* Ama §3.1 menüsünde "Belgeler"
yoktu. Arşiv bir **yönetim yüzeyidir**, günlük iş değil — dolayısıyla yeri
yönetim bloğudur.

**Kritik sonuç:** yönetim bloğu standart kullanıcıya görünmediği için
**17 girdi değişmez**. Yönetici 20 → 21 görür; §3.1 buna zaten izin veriyor.

---

## ADR-R2-07 · Yönetici paneli ayrı ekran değildir

**Karar (K-06).** `app-panel-yonetici.html` R2'de ayrı ekran olmaz; Ana
Panel'in **rol varyantıdır**.

**Gerekçe.** §4.1: *"Kartlar rol bazlı varsayılan gelir; kullanıcı yalnız
sıralamayı değiştirebilir."* Yönetici için ayrı bir yüzey açmak, aynı soruya
("bugün ne yapmalıyım?") ikinci bir cevap yeri açmak olurdu.

**Uygulama.** `app-panel.html` içindeki `OZET_BY_ROLE` tablosu rol başına iki
özet kartı seçiyor; `sahip` ve `genelmudur` fırsat + nakit görüyor, `pm` proje
+ ekip görüyor. Ayrı ekran yok, rol varyantı var.

---

## ADR-R2-08 · Fırsat kendi detay ve form ekranını alır

**Karar (K-07).** `app-firsat-detay.html` ve `app-firsat-form.html` yazılır.
Satış Akışı kartından fırsat detayına gidilir.

**Gerekçe.** §5.3 `opportunity`yi ayrı varlık yapıyor ve R2'de **12 fırsat
türetildi**. Bir kanban kartının tıklanacak bir hedefi olmalı; müşteri
detayının sekmesine düşürmek, fırsatın kendi yaşam döngüsünü (bütçe,
sıcaklık, sonraki aksiyon, kazanma zinciri) müşteri kaydının içine gömerdi.

**Durum.** Karar verildi; **yazımı sonraki dilime** kaldı — bu dilim
Operasyon ve ödeme linkleriyle sınırlıydı.

---

## ADR-R2-09 · Ödeme sağlayıcısı seçilmedi, TEST mock ile devam

**Karar (K-16).** Sağlayıcı seçilmeden gerçek kart formu **taklit edilmez**.
Açıkça TEST etiketli mock adaptörle devam edilir.

**Gerekçe.** Şartname §8.7 bunu zaten emrediyor. Bir kart formunu "nasılsa
çalışmıyor" diye basmak, kullanıcının gerçek kart numarasını yazacağı bir
yüzey üretmektir — prototipte bile.

**Uygulama.**
- `app-odeme.html` içinde **tek bir girdi alanı yok** (ölçüldü)
- Sağlayıcı bileşeninin yerinde açıkça işaretli yer tutucu duruyor
- TEST etiketi sayfada **4 kez** geçiyor
- Süresi dolmuş linkte "Güvenli Öde" düğmesi **hiç basılmıyor**
- Hiçbir sonuç ekranı linki `ODENDI` yapmıyor — beşinin beşi ölçüldü

---

## ADR-R2-10 · Ödeme linki `GV.flow`'un on altıncı varlığıdır

**Karar (R-02).** Ayrı bir durum motoru yazılmaz; `GV.flow` tablosuna
`paymentLink` varlığı eklenir. Backend payı olan geçişler TEST etiketlenir.

**Gerekçe.** Geçiş doğrulaması, yetki kapısı, zorunlu alan denetimi, gerekçe
zorunluluğu ve aktivite yazımı `GV.flow`'da **zaten var ve ölçülmüş**. İkinci
bir motor yazmak, aynı kuralın iki yerde yaşaması demekti (R1 dersi L-40).

**Karşı argüman ve cevabı.** §8.5'in finansal kurallarının çoğu (idempotency,
webhook, sunucudan yeniden okuma) backend payıdır ve `GV.flow` onları
taşıyamaz — yarı uygulanmış bir durum makinesi **tam sanılabilir**. Çözüm:
o geçişler tabloda `backend:true` ile işaretlendi ve ekran onları **TEST**
rozetiyle basıyor. Bayrağı `GV.flow` okumaz; motor çatallanmadı.

**Ölçüm.** 15 → **16 varlık** · **12 durum** · **31 geçiş kenarı** · tabloda
karşılığı olmayan hedef **yok** · sözlükte karşılığı olmayan durum **yok**.

---

## ADR-R2-11 · Teklif sürümleme ve İK ekranı sonraki dilime

**Karar (K-17 · K-18).** İkisi de R2'de kapatılacak, ama **bu dilimde değil**.

**Gerekçe.** Bu dilim tarayıcı kapısı, Operasyon ve ödeme linkleriyle
tanımlıydı. R1'den devralınan iki borcu aynı dilime sıkıştırmak, ikisini de
yarım bırakma riskiydi.

**Devralınan borcun tanımı — unutulmasın:**
- **Teklif sürümleme:** revizyon **yeni kayıt** üretmeli, eski sürüm
  kilitlenmeli, fark karşılaştırılabilmeli. R1'de revizyon aynı kaydı
  yerinde değiştirip sayacı artırıyor ve ekran bunu itiraf ediyor.
- **İK ekran tarafı:** `employee` 15. geçiş varlığı ve iki kapı R1'de hazır,
  ama `durum` alanı **hiçbir ekranda okunmuyor** ve `aktif` boolean'ı paralel
  duruyor. Ekranlar duruma geçirilmeli, sonra `aktif` kaldırılmalı.
