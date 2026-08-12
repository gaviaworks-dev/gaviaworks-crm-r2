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
| ADR-R2-12 | Bütçe, proje detayının sekmesidir | ✅ | rota haritası |
| ADR-R2-13 | Bakım paketi ve SLA, müşteri detayının Destek sekmesindedir | ✅ | rota haritası |
| ADR-R2-14 | Departman talebi Operasyon kuyruğunun **altıncı** tipidir | ✅ | `kuyruk.js` · ekranda beyan |
| ADR-R2-15 | İki geri almanın dili ayrılır | ✅ | `quicknote.js` sözlüğü |

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


---

## ADR-R2-12 · Bütçe, proje detayının sekmesidir

**Karar (K-08).** `app-butce.html` ayrı ekran olarak açılmaz; proje
detayının **Bütçe sekmesi** olur.

**Gerekçe.** Bütçe bir projenin niteliğidir, bağımsız bir varlık değil.
`GV.proje.maliyet` zaten proje detayında okunuyor ve dört kalemi
(personel · dış kaynak · satın alma · diğer) oradan türetiyor. Ayrı bir
ekran, aynı hesabı ikinci bir yüzeyde tekrarlayıp iki sayının ayrışma
riskini doğururdu — R1'de `gerçeklesenMaliyet` alanının başına gelen tam
olarak buydu ve alan bu yüzden kaldırılmıştı.

**Sonuç.** Rota haritasında GÖMÜLÜYOR; hedef netleşti, varsayım kalktı.

---

## ADR-R2-13 · Bakım paketi ve SLA, müşteri detayının Destek sekmesindedir

**Karar (K-09).** Ayrı bir sözleşme yüzeyi açılmaz. `app-destek-paket*.html`
ve `app-destek-sla.html` müşteri detayının **Destek sekmesi** altına düşer.

**Gerekçe.** §2'nin bağlamsal işlem ilkesi: *"Yetkili, iletişim, belge,
teklif, destek ve ödeme gibi alt kayıtlar ilgili müşteri veya proje
detayında açılmalı."* Bakım paketi bir müşteriye satılmış hizmet
taahhüdüdür; SLA o taahhüdün ölçütüdür. İkisi de müşteri bağlamının
dışında anlamsızdır.

**Sonuç.** Rota haritasında GÖMÜLÜYOR; varsayım kalktı. SLA'nın rapor
tarafı ayrıca "Hizmet ve Destek" şablonunda ölçülüyor.

---

## ADR-R2-14 · Departman talebi, Operasyon kuyruğunun ALTINCI tipidir

**Karar (K-10).** Departman talepleri Operasyon kuyruğuna girer.
**Bu, şartnameden bilinçli bir sapmadır.**

### Sapmanın kendisi

Şartname §6.2 kuyruk tiplerini **beş** olarak sayıyor:

> "Kuyrukta **destek talepleri, görevler, bekleyen onaylar, takip zamanı
> gelen müşteri aksiyonları ve geciken tahsilatlar** ortak tipte
> gösterilebilir."

Departman talebi bu listede **yok**. R2 onu yine de ekliyor. Sapma
budur ve gizlenmiyor.

### Gerekçe

*"Eylem bekleyen iş tek kuyrukta toplanır."* Departman talebi tanımı
gereği birinden bir şey bekleyen bir kayıttır; Operasyon ekranının varlık
sebebi de (§6.1) "listeden kayda, kayıttan işleme geçerken yeni sekme ve
sayfa açma ihtiyacını azaltmak"tır. Bekleyen bir iş türünü kuyruğun
dışında bırakmak, kullanıcıyı o iş için ayrı bir ekrana göndermek
demektir — yani ekranın kendi amacını deler.

Şartnamenin beş tipi bir **liste** olarak yazılmış, bir **tavan** olarak
değil; §6.2'nin cümlesi "gösterilebilir" diyor, "yalnız bunlar
gösterilir" demiyor. Yine de sayı değiştiği için bu bir sapmadır ve
sapma olarak kaydedilir.

### Sapma nerede yazılı — üç yerde, sessiz değil

1. `assets/js/kuyruk.js` — `TIPLER` tablosunda, altıncı satırın üstünde
2. Bu ADR
3. **Ekranda**: Operasyon panelinin altında `.ops-sapma` şeridi, kullanıcının
   göreceği yerde

### Ölçülen etki

| | Önce | Sonra |
|---|---:|---:|
| Kuyruk tipi | 5 | **6** |
| Kuyruk satırı | 39 | **43** |

İkinci bir durum ekseni doğmadı: `request` zaten `GV.flow`'un varlığı
olarak tanımlıydı, kuyruk onu çağırıyor.

---

## ADR-R2-15 · İki geri almanın DİLİ ayrılır

**Karar (K-12).** İki geri alma süresi de kalır, ama aynı kelime iki yerde
kullanılmaz.

| Geri alınan | Süre | Arayüzdeki adı |
|---|---|---|
| Not **tamamlama** | 5 saniye | **"Geri al"** (tost şeridi) |
| Not **silme** | 7 gün (ADR-14) | **"Çöp kutusu"** → "Geri yükle" |

**Gerekçe.** İkisi ayrı eksendir ve ikisinin de yaşaması doğrudur: biri
yanlış tıklamayı, diğeri pişmanlığı kurtarır. Sorun sürelerde değil
**kelimede**ydi — tek bir "geri al" iki farklı süre vaat ederse kullanıcı
hangisinin geçerli olduğunu bilemez.

**Uygulama.** Dil sözlüğü `GV.quickNote.dil` içinde **tek yerde** durur.
Silme yüzeyi henüz yazılmadı; yazıldığında kelimesini bu sözlükten
okuyacak, kendisi uydurmayacak (R1 dersi L-40).

---

## ADR-R2-16 · Müşteri tipi sözlüğü açıldı, teyit tek bayrakta

**Karar (K-19).** `DB.customerTypes = ['Kurumsal','Bireysel','Kamu','İş Ortağı']`
veri katmanında tanımlandı; müşteri formundaki alan serbest metinden **seçim
listesine** döndü.

**Neden gerekti.** Dilim 1'de ölçüldü: sözlük hiçbir dosyada tanımlı değildi ve
20 hesabın 20'sinde `tip` alanı boştu. Şartname §5.2 "müşteri tipi"ni ilk
görünüm alanı sayıyor. Ekran ajanı iki değer uydurmayı reddetti ve eksikliği
bildirdi — doğru davranış, ama alan o hâlde kullanılamıyordu.

**Teyit ekseni.** Sözlük Yasin Bey teyidini bekliyor. Bu, `DB.customerTypesTeyit`
**tek bayrağıyla** taşınır: `false` iken ekran alanın altına "teyit bekliyor"
notunu basar, `true` olduğunda not kendiliğinden düşer. Ekranlar kendi
bayrağını tutmaz (L-40) ve sözlüğü kendi listelemez.

**Geriye dönük doldurma YAPILMADI.** Hangi müşterinin hangi tipte olduğu
ölçülemez; 12 kayda tip yazmak yanlış beyan olurdu (L-13). Alan yeni
kayıtlarda dolar, eskilerde "—" kalır ve sebebi ekranda yazılıdır.

---

## ADR-R2-17 · Teklif revizyonu yeni kayıttır, eski sürüm kilitlenir

**Karar (K-17).** R1'in üç tur açık kalan borcu kapatıldı. Üç hüküm:

1. **Revizyon yeni kayıt üretir.** `GV.teklif.revizyonAc` alanları ve kalemleri
   kopyalar, `kokTeklif` + `oncekiSurum` ile zinciri kurar, yeni sürüm `Taslak`
   doğar. Eski kayıt **değişmez**.
2. **Eski sürüm kilitlenir.** Kilit bir ALAN DEĞİL, zincirden türetilir: ardılı
   olan kayıt kilitlidir (`Gates.teklifSurumKilidi`). `kilitli:true` bayrağı
   tutmak, bir sonraki turda zincirle çelişecek ikinci bir defter açardı (L-08).
3. **İki sürüm karşılaştırılabilir.** `GV.teklif.fark` alan ve kalem farkını
   birlikte verir; kalemler `sira` üzerinden eşlenir.

**Motor değişikliği — varlık düzeyinde kilit.** `kapi` ve `girisKapi` tek bir
GEÇİŞİ engeller; revize edilmiş bir teklif ise **hiçbir yöne** gidemez. Bunu her
duruma ayrı `kapi` yazarak kurmak aynı kuralı on yerde tekrarlamak olurdu ve bir
durum eklendiğinde sessizce açık kalırdı. Yeni sözleşme:
`DB.flowEntities[tur].kilit = '<GV.gates yordamı>'`. `GV.flow.adimlar` kilitli
kayıtta **boş** döner (ölü buton basılmaz), `GV.flow.gec` `why:'kilit'` ile
reddeder.

**Geçiş tablosu değişti.** `quote` tablosunda `Müzakere/Revizyon → Taslak`
kenarı **kaldırıldı**: o kenar revizyonu aynı kaydı taslağa geri çekmek diye
tanımlıyordu, yani içeriğin üzerine yazıyordu. Revizyon artık bir geçiş değil,
ayrı bir yordamdır.

**Kilit simetriktir.** Beyar kısıtı: "bir işi geri almak ya da kaybetmek, onu
tamamlamaktan daha ağır koşula bağlanamaz." Kilit kaydın tamamını dondurur;
kazanmayı da kaybetmeyi de **aynı** koşulda reddeder. Eksen bunu ayrıca ölçer
(`satis-akis.js` S10).

**Devralınan sayaç dürüstçe işaretlenir.** 8 teklifin dördü `versiyon > 1`
taşıyor ama zincirde tek kayıt var — bu sayılar R1'den geldi ve karşılığı yok.
`GV.teklif.zincir` bunu `devralinan:true` ile söyler; sahte sürüm satırı
üretilmez (L-13).

---

## ADR-R2-18 · Yaşam evresi tek defterde; bayat alan tuzağa çevrildi

**Karar (K-21).** BE-S2 onaylandı: yaşam evresi `DB.accounts[].evre` üzerinde
yaşar. Yarım bırakılmadı — bayat kaynak alan **ölçülebilir** hâle getirildi.

**Üç iş yapıldı:**

1. `DB.accounts[].durum` **kaldırıldı.** Bu alan hesap kaydına ölü doğuyordu:
   `GV.lifecycle.gec` evreyi değiştirdiğinde `durum` olduğu gibi kalıyor, yani
   kaydın kendi içinde iki cevabı oluyordu. Göç izi kaybolmadı — `evreKaynak`
   ham değeri metin olarak taşıyor, `legacy_id` kaynağa bağlıyor.
2. `DB.customers[].durum` bir **tuzağa** çevrildi: okunduğunda `DB.bayat.sayac`
   artar ve `undefined` döner; yazıldığında değer tutulmaz. `enumerable:false`
   kuruldu ki `JSON.stringify` / `Object.keys` yanlış alarm üretmesin (L-26).
3. Göçün kendisi ham alanı **bir kez** okur ve o satır
   `/* bayat-alan:goc-kaynagi */` ile **açıkça** işaretlidir. Sessiz beyaz liste
   yok; işaret kaldırılırsa eksen o satırı yeniden yakalar.

**Ölçüm.** `tasks/qa/bayat-alan.js` üç eksende ölçer: tuzak kurulu mu · yükleme
ve iş akışlarında sıfır okuma · kaynak taraması. Tek bir okuma kalırsa kırmızı
yanar.

**Gerekçe (Beyar).** R1'de çift KDV hatası tam bu sınıftandı: alt zincir yanlış
çapaya göre kendi içinde tutarlıydı ve hiçbir eksen çelişki göremiyordu. Bayat
çapayı ölçülebilir kılmak o hatanın tek panzehiri.

---

## ADR-R2-19 · Finansal çapa NET'tir, brüt her yerde yeniden hesaplanır

**Karar (Beyar talimatı C).** Teklif → sözleşme → ödeme planı → fatura →
tahsilat zincirinde tutar ekseni **NET** olarak sabitlendi. `GV.fin.tutar`
her koleksiyonu bu eksene çevirir; brüt **her zaman** `net + kdv` olarak
yeniden hesaplanır ve kayıttaki brüt değer otoriter değil, **doğrulanandır**.

**Neden zincirin dışında.** R1'de KDV iki kez uygulanıyordu ve kusur
görünmüyordu: her halka bir öncekinden türediği için hepsi aynı şişmiş sayıyı
taşıyordu, yani zincirin İÇİNDEN bakan hiçbir kontrol çelişki göremiyordu.
Çapa zincirin dışında olmak zorundadır.

**Eksen ayrımı ölçüldü, varsayılmadı:** ödeme planı taksitleri **NET**
eksende (19 taksitin 19'u sözleşmenin net bedelini bölüyor), tahsis ve bakiye
**BRÜT** eksende (`GV.fin.balance` fatura `toplam` alanı üzerinden çalışır).
Faturada KDV oranı alanı **yoktur**; oran tutardan türetilir — ters yönde
okumak (oranı varsayıp KDV'yi hesaplamak) çift KDV'yi doğuran hamleydi.

**Ölçüm.** `tasks/qa/finans-kanon.js` altı eksende ölçer ve çift KDV tuzağını
**enjekte ederek** sınar: şişmiş bir sözleşme kendi içinde tutarlı kalır ama
dış çapa onu yakalar. Bu, kusurun sinsiliğinin kanıtıdır.

---

## ADR-R2-20 · Ön analiz oluşturma, fırsat detayının drawer'ı

**Karar (K-20).** Ön analiz oluşturma yüzeyi ayrı ekran değildir; fırsat
detayında drawer olarak açılır. Rota haritasındaki 23 numaralı satır bununla
kapanır. Dilim 1'de okuma ve durum ilerletme yazılmıştı, oluşturma eksikti
(V2-12 olarak kayıtlıydı) — bu ADR o borcu kapsam içine alır.

---

## ADR-R2-21 · Sıradaki dilim Finans

**Karar (K-22).** Müşteri ve satış zincirinden sonra Finans gelir: fatura
listesi/detay/form, tahsilat listesi/form, satın alma. Sözleşme ve ödeme planı
**ayrı ekran değildir** — şartname §3.3 gereği ilgili kaydın sekmesidir ve
dilim 1'de müşteri detayının Finans sekmesine yerleşti.

---

## ADR-R2-22 · Tahsilat detayı ayrı ekran değildir, tahsis defteri drawer'dır

**Karar (K-23).** `app-tahsilat-detay.html` **yazılmaz**. Tahsilat listesinde
satıra tıklanınca tahsis defteri ve kayıt geçmişi drawer olarak açılır.
Operasyon kuyruğunun tahsilat hedefi de buraya bağlandı.

**Ne değişti.** `kuyruk.js` iki satırda `app-tahsilat-detay.html?id=` yazıyordu
ve o dosya hiç doğmadı; hedef `app-tahsilat.html?ac=<kod>` oldu. Ekran açılışta
parametreyi okur, çekmeceyi açar ve **parametreyi adresten siler** — silmeseydi
`GV.refresh()` her tazelemede pencereyi yeniden açar, kullanıcı kapattığı
pencereyi kapatamazdı.

**Ortak katmana düşen pay.** `GV.list` satır tıklamasını desteklemiyordu ve iki
ekran bunu kendi `addEventListener`'ıyla kurmak üzereydi. `cfg.rowOpen(kayit)`
bileşene eklendi; satır işaretlemesi (`data-id`) tabloda, mobil satırda, kartta
ve kanban kartında zaten vardı, tek delege dinleyici dördünü de karşılar. Satır
İÇİNDEKİ etkileşimli düğüme (aksiyon, seçim kutusu, bağlantı) yapılan tıklama
çekmeceyi **açmaz** — açsaydı kullanıcı her satır aksiyonunda istemediği bir
pencere de alırdı.

**Rota haritası 71** bu ADR ile kapandı; **V2-25** borcu kalktı.

---

## ADR-R2-23 · Satın alma alt kayıtları dört yüzey sekmesidir

**Karar (K-24).** Teklif toplama, siparişler ve tedarikçiler **ayrı ekran
ailesi açmaz**; satın alma ekranının yüzey sekmeleri olur. Rota haritası
116-122 bununla kapanır, **V2-24** borcu kalkar.

**Yapı.** Dört yüzey (`Talepler · Teklif Toplama · Siparişler · Tedarikçiler`)
`GV.tabs` ile kurulur, her biri kendi `GV.list`ini taşır. Alt listeler **tembel
çizilir**: sekmeye ilk basıldığında kurulurlar. Dördünü birden kurmak,
kullanıcının hiç açmayacağı üç listeyi de her sayfa yüklemesinde çizmek olurdu.

**URL senkronu yalnız ANA listede açık.** `GV.list` sayfa/sekme/filtre/sıralama
durumunu adres çubuğunda saklar; dört liste bunu birden yaparsa aynı anahtarları
yazar ve birbirini ezer. Rota 113'ün eski `app-satinalma.html?t=onay` bağlantısı
ana listenin senkronu üzerinden çalışmaya devam ediyor. Yüzey sekmesi `#hash`te
durur, iki mekanizma çakışmaz.

**Ortak katmanda kapatılan kusur.** `urlSync:false` yalnız YAZMAYI
susturuyordu, OKUMA her listede koşuyordu. Tek listeli sayfada bu fark etmezdi;
dört listeli sayfada ana listenin `?t=onay` adresi üç alt listeye de sızıyordu
ve hiçbirinde `onay` diye sekme olmadığı için üçü de sekmesiz açılıyordu.
Bayrak artık iki yönlü: **yazmayan liste okumaz da.**

**Satır kimliği türetildi, uydurulmadı.** `DB.supplierQuotes` bir birleşim
kaydıdır (talep × tedarikçi) ve kaynak veride kodu yoktur; `GV.list` satır
kimliğini bir alan adından okur. `id = talep · tedarikçi` tek yerde yazıldı —
yeni bir `TKF-` kod dizisi uydurmak, karşılığı olmayan kayıt numarası üretmek
olurdu. 9 satırın 9'unda benzersiz olduğu ölçüldü.

**İki puan ekseni ayrı kaldı** (ops.js:259-268): teklif satırındaki `puan`
"Teklif puanı", tedarikçi kartındakiler "Genel puan" etiketiyle basılır.
**Ömür boyu sayaç kuralı** korundu: `toplamTutar` ve `siparisSayisi` kart
değeri ile sistemden hesaplanan ayrı satırda verilir, biri diğerinin yerine
yazılmaz.

---

## ADR-R2-24 · Tahsis geri alma ters kayıt üretir; kapı yapmakla aynı ağırlıkta

**Karar (K-25).** Tahsis geri alma yüzeye çıktı. Şartname §8.5'in iade kuralı
birebir uygulandı: **gerekçe zorunlu · kayıt SİLİNMEZ · ters işlem üretilir ·
audit'e yazılır.**

**Kapatılan kusur.** `GV.fin.tahsisKaldir` kaydı `splice` ile defterden
**çıkarıyordu**. Bu §8.5'i doğrudan çiğniyordu; geri alınan tutar hiçbir yerde
okunamıyordu ve denetim izi "bir şey geri alındı" derken defter onu hiç
görmemiş gibi duruyordu. Artık asıl satır yerinde kalır, yanına eksi tutarlı,
gerekçeli ve aktörlü bir ters satır yazılır; net sıfırlanır.

**Ölçüt satır değil NET oldu — üç yerde.** Ters kayıttan sonra defterde iki
satır durur. Satır sayısına bakan her kontrol geri alınmış bir tahsisi hâlâ
duruyor sanardı: `tahsisEt` aynı çifte yeni tahsisi sonsuza dek reddederdi
(geri alma işlemini geri alınamaz yapardı), `tahsilGeriAl` nakit olayını hiç
serbest bırakmazdı. `GV.fin.ciftNet` ve `GV.fin.dagitimNet` bu soruyu tek
yerden cevaplar.

**YETKİ — bilerek `can('finans')`, yani tahsis KURMAKLA AYNI KAPI.**
K-25 "Finans yöneticisi" diyor; 27 rollük sözlükte o adda bir rol **yok** ve
`finans` yetkisi 8 rolde açık (`sahip · genelmudur · sistem · operasyon ·
satismudur · pm · muhasebe · satinalma`). Geri almayı bu kümeden dar bir role
bağlamak, tahsisi kuran kullanıcının kendi hatasını düzeltememesi demekti:
**bir işi geri almak, onu yapmaktan daha ağır koşula bağlanamaz.** Kapı şu an
eşit tutuluyor; daraltma kararı Beyar'a soruldu ve daraltılacaksa değişecek tek
yer `domain.js` `tahsisKaldir` içindeki tek `can()` satırıdır. Gerekçe
zorunluluğu yetki değil kayıt koşuludur — kimseyi kilitlemez, yalnız işlemi
defterde adlandırır.

**Ölçüm.** `tasks/qa/acilis-uc.js` üç ekseni de bir olumlu ve bir olumsuz
vakayla sınar; 40 kontrol koşuyor.

---

## ADR-R2-25 · Sıradaki dilim Proje ve Operasyon

**Karar (K-26).** Finanstan sonra Proje ve Operasyon gelir: proje listesi ve
sekmeli detayı, görev listesi/detay/form, destek listesi/detay/form.

**Neden bu.** Operasyon kuyruğunun 43 satırının 41'i hedefsizdi ve en ağır iki
dosya bu dilimin içinde: `app-gorev-detay.html` tek başına 23 satırı,
`app-destek-detay.html` 4 satırı kurtarıyor. Menüde kilitli 12 hedefin 5'i bu
alanda. Proje alt kayıtları (rota 33-47, 15 satır) tek bir sekmeli detay
ekranıyla kapanıyor — kalan rota satırlarının en yoğun bloğu.

---

## ADR-R2-26 · Bakım paketi seviyesinin kanonu KISA biçimdir

**Karar (K-27).** Veride yalnız **seviye** tutulur (`Standart` · `Kurumsal`).
Cins adı (`Bakım`) zaten `tip` alanındadır ve seviyeye **yapıştırılmaz**.
Sözlük ile kayıt aynı kısa değeri konuşur; uzun adı gerektiğinde **ekran**
birleştirir, veri değil.

**Ölçülen çelişki — üç ayrı biçim:**

| Yer | Önce | Sonra |
|---|---|---|
| `DB.supportPackageTypes` | `['Standart Bakım','Kurumsal Bakım']` | `['Standart','Kurumsal']` |
| `DB.supportPackages[].ad` | `'Kurumsal Bakım'` (7 kayıt) | alan **kaldırıldı** → `[].seviye` = `'Kurumsal'` |
| `DB.supportPackages[].tip` | `'Bakım'` (7/7) | değişmedi — cins, seviye değil |
| `DB.tickets[].bakimPaketi` | `'Standart'`/`'Kurumsal'`/`'—'` | `'—'` (2 kayıt) → `null` |

**Veri kaybı sıfır.** Uzun ad `seviye + ' ' + tip` ile birebir yeniden
kurulur ve 7/7 kayıtta doğrulandı. Birleştirme **tek yerde**:
`GV.destek.paketAdi(p)`. `'—'` bir seviye değil "yazılmamış" demekti;
`null` olarak yazılması sözlük dışı değeri de temizledi.

**Kapatılan kusur.** `GV.destek.paketOf` seviyeyi `tip` ile
karşılaştırıyordu (`'Bakım'` vs `'Kurumsal'`) ve **hiç tutmuyordu** — yordam
sessizce `aday[0]`a düşüyor, müşterinin birden çok paketi varsa yanlış paketi
döndürüyordu. Bir önceki turda `ad` önekiyle yamanmıştı; biçim farkı ortadan
kalktığı için karşılaştırma artık **düz eşitlik**. 5/5 talep doğru pakete
bağlanıyor.

---

## ADR-R2-27 · `firsatKazan`ın üç hedefi müşteri detayının Finans sekmesine gider

**Karar (K-28).** `app-sozlesme-detay.html` · `app-odemeplani-detay.html` ·
`app-sozlesme-form.html` **yeni ekrana çevrilmez**. Rota haritasının
GÖMÜLÜYOR kararına uyulur: üçü de `app-musteri-detay.html?id=<hesap>#finans`
adresine bağlandı.

Sözleşme oluşturma yüzeyi sekmede henüz yok; bu yüzden öneri etiketi
"Sözleşme oluştur" değil **"Finans sekmesini aç — sözleşme"** oldu ve
`yeni:false` işaretlendi. Yapılamayan işi düğme olarak vaat etmemek
kuralının doğrudan uygulaması.

**Tarama sonucu:** ortak katman + 31 ekran üzerinde yapılan ölü hedef
taramasında bu üç ad artık geçmiyor. Kalan ölü hedefler ya bu dilimde
yazılıyor (`app-personel` · `app-zaman` · `app-varlik` · `app-izin-detay` ·
`app-zaman-onay`) ya da Ayarlar dilimine ait (4 ekran) — hepsi menüde
`markWip` ile kilitli, sahte buton yok. İki yeni borç bulundu ve deftere
yazıldı: `app-proje-form.html` (V2-39) ve `app-satinalma-form.html` (V2-40).

---

## ADR-R2-28 · Personel yaşam döngüsü tek eksende; `aktif` tuzağa çevrildi

**Karar (K-18 — R1'den devreden borç KAPANDI).**

**Ölçülen kusur.** `employee` `GV.flow`un 15. geçiş varlığıydı, yedi durumu
ve yedi geçiş kuralı tanımlıydı — ama **hiçbir ekran `durum` alanını
okumuyordu**. Yedi ekran bunun yerine `e.aktif !== false` yazıyordu ve o alan
**16 kaydın 16'sında `true`** idi: hiçbir şey ayırt etmiyordu. Somut sonuç —
`EMP-015` (Nihan Arslan) `Offboarding` durumunda, çıkış tarihi 2026-08-31
yazılı, ve yedi ekranın yedisinde de "görev atanabilir personel" listesinde
görünüyordu.

**Yapılan.**
1. `DB.employees[].aktif` **tuzağa** çevrildi (`hr.js`): okuyan `undefined`
   alır, `DB.ikBayat.sayac` artar. K-21'in `DB.customers[].durum` tuzağıyla
   aynı disiplin.
2. İki **ayrı soru**, iki ayrı yordam: `GV.hr.istihdamda(e)` (bordroda mı) ·
   `GV.hr.atanabilir(e)` (YENİ iş verilebilir mi). İkisini tek "aktif"
   bayrağına sıkıştırmak, izinli çalışanı bordrodan düşürmek ya da
   ayrılmakta olana iş atamak demekti; ikisi de oluyordu.
3. Yedi çağrı yeri `GV.hr.atanabilirler()` ile değiştirildi.
4. `tasks/qa/ik-ekseni.js` yazıldı: **39 kontrol, 7 eksen.**

**Kişisel veri kapısı** (kararın parçası değil ama aynı dilimde zorunluydu):
özlük ve sağlık alanları için kapı **yoktu** — kan grubu ve acil kişi bilgisi
kontrolsüz basılabilirdi. Yeni matris anahtarı **açılmadı**; kapı var olan
`personel` kapsamından türetildi (`GV.hr.ozlukGorebilir`). Maaş kapısı zaten
`permMatrix.maas`taydı (4 rol).

**Beyar'a sorulan:** `Offboarding → Aktif` kenarı yok — yanlışlıkla çıkış
sürecine alınan personel geri döndürülemez. Bu, "geri almak yapmaktan ağır
olamaz" kuralına aykırı görünüyor ama `Ayrıldı` gerçek dünyada geri alınmaz.
Kenar **eklenmedi**; karar Beyar'ındır.

---

## ADR-R2-29 · Zimmet kabulü envanterin tek kaynağıdır

**Karar (K-18 eki).** `DB.assets[].zimmetli` ve `[].durum` **türetilmiş
görünümdür**; otorite `DB.assignments`tir. Envanter yükleme anında zimmet
defterinden yeniden hesaplanır (`GV.varlik.tazeleHepsi`, `Fin.tazeleHepsi`
ile aynı desen) ve elle yazılmış değer hayatta kalmaz.

**Ölçülen çelişki.** Envanter zimmet TUTANAĞI YAZILDIĞI AN güncelleniyordu,
personelin kabulü beklenmiyordu. `ZMT-2026-007`: tutanak `Aktif`,
`personelOnay:'Bekliyor'`, ama envanter `zimmetli:'EMP-006'` ·
`durum:'Zimmetli'` diyordu. İki defter aynı soruya iki cevap veriyordu.

**Kabul kuralı.** Zimmet ancak **personel onayladığında** envanteri
`Zimmetli` yapar. Onay beklerken demirbaş **`Zimmet bekliyor`**
durumundadır — ne depoda ne teslim edilmiş. Ara durumu yok saymak, kabul
edilmemiş bir teslimi teslim edilmiş göstermekti.
`DB.assetStatuses` yazıldı (sözlük **yoktu**): `Depoda · Zimmet bekliyor ·
Zimmetli · Aktif · Hurda`.

**Yüklemede 4 kayıt düzeltildi** ve düzeltme `sonTazeleme.degisen` içinde
saklandı — bilgi silinmedi, ekran gösterebiliyor:

| Demirbaş | Envanter diyordu | Zimmet defteri | Sonuç |
|---|---|---|---|
| `DMB-2025-004` | `EMP-006` · Zimmetli | tutanak var, **kabul bekliyor** | `Zimmet bekliyor` |
| `DMB-2025-007` | `EMP-009` · Zimmetli | **tutanak YOK** | `Depoda` |
| `DMB-2026-013` | `EMP-011` · Zimmetli | **tutanak YOK** | `Depoda` |
| `DMB-2026-014` | `EMP-012` · Zimmetli | **tutanak YOK** | `Depoda` |

⚠️ **BEKLENMEDİK BULGU:** üç demirbaşta envanter bir sahip yazıyordu ama
**hiç zimmet kaydı yoktu**. Tek kaynak kararı gereği tutanak otorite kabul
edildi ve envanter temizlendi; atılan iddia korunuyor ve raporlanıyor.
Beyar'a soruldu: üç tutanak mı eksik, yoksa envanter mi yanlıştı?

**Kapı yönü ölçüldü.** `GV.varlik.kabulEt` ve `.kabulGeriAl` **aynı yetki
kümesinden** geçer (zimmetli personel · ik · sahip · genelmudur). Geri
almada gerekçe zorunludur — bu yetki değil KAYIT koşuludur ve kimseyi
kilitlemez.

---

## ADR-R2-30 · Sıradaki dilim Ekip ve Kaynaklar

**Karar (K-29).** Şartname §3.1'in üç ana sayfası: **Personel · Zaman ve
İzin · Varlıklar**. Kapasite, performans, eğitim, işe giriş/çıkış, demirbaş,
zimmet ve filo bu üçünün **bağlamsal görünümleridir** — ayrı ekran ailesi
açılmaz. Kapasite "İş ve Kapasite" raporudur (yayında).

---

## ADR-R2-31 · Zimmet defteri kanoniktir; kaynağı olmayan iddia düşürülür

**Karar (K-30 · V2-41).** Tutanak defteri (`DB.assignments`) kanoniktir,
envanter ondan türer. Üç demirbaşın envanterdeki "zimmetli" iddiası
yanlıştı; temizlenmesi doğrudur. **Eksik tutanak ÜRETİLMEDİ.**

**Neden uydurulmadı.** Üç tutanak yazmak, envanterin iddiasını "doğrulanmış"
gösterirdi — oysa doğrulayan hiçbir şey yok. Bir iddianın kaynağı yoksa
kaynak uydurulmaz; iddia düşer ve **neden düştüğü yazılı kalır**.

**Defter: `DB.assetClaimDrops`** (`assets/data/ops.js`). Her satırda iddianın
kendisi, **ölçülmüş kaynağı** ve düşme sebebi durur:

| Demirbaş | İddia | Ölçülen kaynak | Düşme sebebi |
|---|---|---|---|
| `DMB-2025-007` | `EMP-009` · 2025-04-05 | envanter alanı | tutanak yok |
| `DMB-2026-013` | `EMP-011` · 2026-07-31 | envanter alanı **+ aktivite kaydı** (`work.js` · 2026-07-31T09:50 · EMP-011 · "Zimmet teslimi yapıldı") | tutanak yok; envanteri değiştiren olay tutanağın yazılması değil **kabulüdür** |
| `DMB-2026-014` | `EMP-012` · 2026-07-31 | envanter alanı | tutanak yok |

`DMB-2026-013` beklenmedik bulgudur: bu iddianın envanter dışında bir
dayanağı daha vardı. Yine de düşürüldü — aktivite kaydı bir teslimin
*anlatısıdır*, tutanağı değildir. Kayıt **silinmedi**, kaynak olarak yazıldı.

**Sahte aktivite yazılmadı.** Düşürmenin zaman çizelgesinde görünmesi
gerekiyordu ama veriye yeni bir aktivite satırı eklemek, olmayan bir aktörle
olmayan bir olay uydurmak olurdu. Satır `GV.varlik.dusenIddiaSatiri(kod)` ile
**görüntü anında defterden türetilir**.

**Envanter literali defterle hizalandı.** `DMB-2025-004` de düzeltildi:
tutanağı var (`ZMT-2026-007`) ama `personelOnay:'Bekliyor'`, yani türetilmiş
hâli `Zimmet bekliyor`. Literal `Zimmetli` diyordu ve yükleyici bunu **her
açılışta sessizce onarıyordu**. Ölçüldü: yükleme tazelemesinde değişen kayıt
**4 → 0**. Bir onarımın her seferinde tekrar çalışması, onarılmamış demektir.

---

## ADR-R2-32 · Çıkış sürecinden dönüş kenarı — ve motorun üçüncü ekseni

**Karar (K-31 · V2-42).** `Offboarding → Aktif` kenarı **eklendi**. Gerekçe
zorunlu; yetki `ik · sahip · genelmudur`. Yanlışlıkla çıkış sürecine alınan
personelin geri dönememesi kabul edilemez.

**Eski gerekçe bir eksikliği iş kuralı gibi sunuyordu.** Tabloda "geri dönüş
yolu yok — bilerek" yazıyordu ve sebebi şuydu: `kapi` ve `zorunlu` yalnız
**kaynak** tarafa bağlanabiliyordu, dolayısıyla `Offboarding` üzerindeki
zimmet kapısı ile çıkış evrakı zorunluluğu oradan çıkan **her** hedefe
uygulanırdı. Yani geri dönmek için personele cihazı iade ettirmek ve çıkış
tarihini doldurmak gerekiyordu — ayrılmadığını söylemek için ayrılış
evrakını tamamlamak.

**Motora `girisZorunlu` eklendi** — `kapi`/`girisKapi` ve
`gerekce`/`girisGerekce` ayrımının **üçüncü ekseni**. `Flow.eksikAlanlar`
artık hedefin kuralını da okur ve `Flow.adimlar` eksik alanı **hedef başına**
hesaplar (eskiden tek liste bütün hedeflere basılıyordu).

**Sonuç — iki yönlü ölçüldü.** Zimmet kapısı ve çıkış evrakı `Ayrıldı`
hedefine taşındı; geri dönüş yalnız gerekçe ister. Aynı boş kayıtta ileri
gitmek `cikisTarihi` + `cikisNedenKodu` isterken geri dönüş açık kaldı:
**geri almak, ileri gitmekten ağır koşula bağlı değildir.**

`Onboarding` üzerindeki `personelEvrak` kapısı **kaynakta bırakıldı** ve bu
doğrudur: tek hedefi var, ayrıca `Aktif`e `İzinli` ve `Pasif` durumlarından
da gelinir — kapıyı oraya taşımak izinden dönen personelden **işe giriş
evrakı** istemek olurdu.

---

## ADR-R2-33 · Kapı kenara bağlanır; hedef her zaman yeterince dar değildir

**Karar (K-32 · V2-45).** Dört kaynak taraflı kapının **dördü de** ileri
hedefe taşındı. Taşımadan sonra her biri iki vakayla ölçüldü: engellemesi
gereken kenarı hâlâ engelliyor mu, engellememesi gereken kenarı bıraktı mı.

**Taşıma sırasında ölçülen yeni kusur.** `girisKapi` hedefe bağlanır ve o
duruma giren **her** kenarı keser. Hedefe birden çok kenar giriyorsa bu da
fazla keser — kaynak taraflı kapının aynası. Bu yüzden motora üçüncü ve en
dar bağ eklendi: **`kenarKapi:{ hedef:{ kapi, istisnaRol } }`**, yalnız o
kenarı bağlar. `Flow.kapiCoz` tek karar noktasıdır; öncelik
**kenar → kaynak → hedef**.

Seçim ölçülerek yapılır: **hedefe kaç kenar giriyor?**

| # | Kapı | Eskiden kestiği yanlış kenar | Yeni bağ | Hedefe giren kenar |
|---|---|---|---|---|
| 1 | `projeTeslim` | `Test/Kabul → Aktif` — kritik hatalı proje geliştirmeye **geri alınamıyordu** | `kenarKapi` · `Test/Kabul→Teslim` | 2 (`Test/Kabul` · `Kapanış`) → hedef bağı yetmez |
| 2 | `projeKapanis` | `Kapanış → Teslim` — eksiği tamamlamak için gereken yol kapalıydı | `girisKapi` · `Tamamlandı` | 1 |
| 3 | `destekKota` | `Müşteri Onayı → Devam ediyor` — hiç kota harcamayan kenar kotaya takılıyordu | `kenarKapi` · `Müşteri Onayı→Kapandı` | 2 (`Müşteri Onayı` · `Yeni`) → hedef bağı yeni talebi de kotaya bağlardı |
| 4 | `teslimKritikHata` | `İç Kontrol → Taslak` — hatayı düzeltmek için gereken yol kapının kendisi tarafından kapatılıyordu | `girisKapi` · `Müşteriye Gönderildi` | 1 |

**Bonus: geçen turda "düzeltilmiş" iki kapı hâlâ fazla kesiyordu.** Ölçüm
`girisKapi`li her hedefe giren kenarı saydı ve ikisini yakaladı:

- `projeAktif` → `Aktif` hedefine **3 kenar** giriyor. `Beklemede → Aktif`
  (beklemedeki proje devam ettirilemiyor) ve `Test/Kabul → Aktif` (1 no'lu
  düzeltmenin açtığı kenar) kapıya takılıyordu. `Başlatma Onayı → Aktif`
  kenarına indirildi — kapı yalnız **ilk aktivasyonu** ilgilendirir.
- `sozlesmeAktif` → `Aktif` hedefine **3 kenar** giriyor. `Askıda → Aktif`
  kenarı takılıyordu: bir kez aktive edilmiş sözleşme **askıdan
  indirilemiyordu**. Kapı iki **ileri** kenara bağlandı (`İmza` ilk
  aktivasyon · `Yenileme/Zeyil` zeyil yürürlüğü — ikisi de ödeme planını
  değiştirir); askıdan dönüş serbest.

**Ölü kapı ile çalışan kapı ayrımı.** `destekKota` bugünkü veride hiç
ateşlenmiyor — kotayı aşan talep yok. "Ateşlenmiyor" ile "çalışmıyor" farkını
ölçmek için koşul **enjekte edildi** (bellekte paket kalanı 0, harcanan 4);
kapı engelledi, geri dönüş açık kaldı. Veri dosyası değişmedi.

**Nöbetçi: `tasks/qa/kapi-yonu.js` · 48 kontrol / 6 eksen.** Yeni bir kapı
kaynağa bağlanırsa ya da `girisKapi`nin hedefine ikinci bir kenar girerse
kırmızı yanar.

---

## ADR-R2-34 · Entegrasyon katalogu bir NİYETTİR; bağlantı durumu ölçümden türer

**Karar (K-34).** `DB.integrations[].durum` alanı **ölçüm değildir**, katalogun
niyetidir. Bağlantının bağlı olup olmadığı ortak katmanda **kanıttan türetilir**
ve tek yordamdan okunur: `GV.entegrasyon.olculenDurum()`.

**Ölçülen çelişki.** `DB.integrations` on kayıt taşıyor ve **dördü
`durum:'Bağlı'`** diyor: `ENT-001` GitHub · `ENT-003` Google Calendar ·
`ENT-007` Paraşüt · `ENT-009` OpenAI API. Aynı veri dosyası, 60 satır altında,
`DB.integrationErrors` başlığında şunu yazıyor:

> "Bu prototipte GERÇEK BİR ENTEGRASYON KOŞUMU YOK — `DB.integrations` yalnız
> bağlantı tanımlarını taşıyor, hiçbiri çalışmıyor."

İkisi aynı anda doğru olamaz. Depo kendi içinde çelişiyordu ve çelişkinin
görünür tarafı — yeşil bir "Bağlı" rozeti — kullanıcıya kurulmamış bir
bağlantıyı kurulmuş gösterecekti.

**Çözüm K-30'un aynısıdır: kayıt silinmez, iddia ile ölçüm AYRIŞTIRILIR.**

| Yordam | Ne söyler | Bugünkü değer |
|---|---|---|
| `GV.entegrasyon.kanit()` | bağlantının ölçülebilir kanıtı | koşum defteri **yok** · hata kuyruğu **0** · webhook olayı **0** · ödeme sağlayıcısı `TEST-MOCK` |
| `.kosumVar()` | üç kanıttan biri dolu mu | **false** |
| `.olculenDurum()` | ölçülen durum | **`Bağlanmadı`** — 10 kaydın 10'unda |
| `.olculemedi()` | koşum defteri koleksiyonu var mı | **true** — "hata yok" ile "ölçülemedi" ayrı şeydir |
| `.katalogIddiasi(e)` | katalogun ne dediği, AYRI ad altında | `Bağlı` / `Bağlı değil` / `Planlandı` |
| `.celisenler()` | iddia ile ölçümün çeliştiği kayıtlar | **4** |

**Alan tuzağa çevrilmedi.** `aktif` (K-33) ve `customers.durum` (K-21) tuzağa
çevrilmişti çünkü onları okuyan **yanlış cevap** alıyordu. Burada durum farklı:
`durum` alanı bir soruya doğru cevap veriyor — "hangi sağlayıcıyla entegre
olunması planlandı". Yanlış olan alan değil, **alanın bağlantı durumu sanılması**.
Tuzak, doğru bilgiyi de yok ederdi. Bunun yerine yordam adı ayrıştı:
`katalogIddiasi()` ile `olculenDurum()` aynı ekranda yan yana durur.

**Ekran sözleşmesi.** `app-ayar-entegrasyon.html` katalog `durum` alanını
`GV.badge`'e **doğrudan vermez** (yeşil rozet = sahte bağlantı), "Bağlan" /
"Bağlantıyı kes" düğmesi **basmaz** (yapılamayan iş düğme olarak vaat edilmez) ve
**hiçbir anahtar/parola girdisi açmaz** (§8.7: canlı anahtarlar istemci paketinde
bulunmaz). Üçü de `tasks/qa/ayar-ekseni.js` [A4] ve [A5] tarafından ölçülür.

---

## ADR-R2-35 · Ayar kabuğu tek yerden sekme üretir; modül anahtarı tek gerçek mutasyondur

**Karar (K-35).** Şartname §3.3 "aynı ayar kabuğunda sekmeli yönetim; **yetkiye
göre sekme üret**" hükmü, dört ayar ekranının **tek bir sekme kaydından**
beslenmesiyle karşılanır: `shell.js` `AYAR_SEKME` → `GV.shell.ayarSekmeleri(ekran)`.
Ekran kendi sekme listesini yazmaz; ne gelirse basar — `GV.flow.adimlar` düğme
üretiminin aynı ilkesi (L-40: kural N yerde yaşamaz).

**Dört ekran, on beş sekme, on üç rota satırı.** Sekme kaydı `rota` alanı taşır;
hangi R1 ekranını kapattığı defterle karşılıklı ölçülebilir, süs değildir.

| Ekran | Sekmeler | Rota |
|---|---|---|
| `profil` | `hesap` · `bildirim` | 134 · 135 |
| `sirket` | `sirket` · `departman` · `kullanici` · `rol` · `yetki` · `onay` | 136–141 |
| `entegrasyon` | `saglayici` · `odeme` · `otomasyon` · `hata` | 142 · 143 |
| `log` | `kayit` · `arsiv` · `kalite` | 144 · 145 · 146 |

**Menü sayımı değişmedi ve bu ölçüldü.** Dört ayar girdisi `SECTIONS.ayarlar`
içinde zaten kayıtlıydı; bu turda yalnız **dosyaları doğdu**. Standart
kullanıcının görünür günlük girdisi **17** (kabul kriteri ≤18), üç yönetim
girdisi `yonetim:true` ile ayrı ve soluk blokta (`.gv-menu-admin` ·
`.gv-menu-item.is-admin`, `opacity:.72`) ve günlük sayıya girmez. `Profil`
girdisi yönetim **değildir** — herkes kendi profilini yönetir.

**Sekme kapısı ölü değildir, kestiği ölçüldü.** `devops` rolü
`entegrasyon` ekranına girer ama `odeme` sekmesini **görmez**
(`perm:'finans'`, matriste `devops.finans:false`) → 4 sekme yerine 3. Yetkisiz
sekme **basılmaz**; gri ya da kilitli gösterilmez (§2).

**Modül anahtarı — bu dilimin TEK gerçek mutasyonu.**
`DB.company.aktifModuller` kabuğun **gerçekten okuduğu** tek ayardır
(`Perm.modul` → menü + `guard`): kapatılan modülün girdisi menüden düşer,
doğrudan adres de 403 verir, **veri silinmez**. Tek mutasyon noktası
`GV.ayar.modulAyarla(anahtar, acik, gerekce)`.

⚠️ **KAPI İKİ YÖNDE DE AYNIDIR — ölçüldü.** Açma ve kapatma **aynı yetki
kümesini** ister (`sahip · genelmudur · sistem`; ölçülen küme birebir aynı) ve
**aynı gerekçe koşulunu** taşır (≥8 karakter; boş gerekçe iki yönde de
`why:'gerekce'` ile REDDEDİLİR). Bir işi geri almak onu yapmaktan ağır değildir.
`tasks/qa/ayar-ekseni.js` [A6] iki kümeyi karşılaştırır ve ayrışırlarsa kırmızı
yanar.

**Sistem Kayıtları ikinci defter üretmez.** Tek yüzey `GV.audit`tir ve o iki
defteri (`DB.activities` 207 + `DB.logs` 7) birleştirip **tekilleştirir** →
**214 satır**. Ekranın `DB.logs`a ya da `DB.activities`e doğrudan yazması
[A3] tarafından yasaklanır ve ölçülür.

**Birleşik deftere kararlı satır kimliği eklendi.** `GV.list` `key:` ile zorunlu
bir alan ister; olay defterinin kaydında `kod` **yoktu**. Dizi indeksi kimlik
olamaz — iki defter de `unshift` ile büyür ve indeks her yazmada kayar, seçili
satır başka bir kayda kayardı. Kimlik, tekilleştirmenin zaten kullandığı
**içerik anahtarıdır**; benzersizliğini tekilleştirmenin kendisi garanti eder
(ölçüldü: **214/214 benzersiz**, defter büyüdüğünde eski kimlik değişmiyor).

---

## ADR-R2-36 · Menü kapısı ile adres kapısı TEK yordamdan beslenir

**Karar (K-36).** Bir ekranın menüde görünmesi ile adresle açılabilmesi **aynı
yordamın** iki sonucudur. `dosyaIzinli()` artık menü kaydını bulur ve
`Perm.item()` çağırır — menü çizimi de aynı yordamı çağırdığı için iki kapı
tek kaynaktan beslenir.

> **Bu bir DEFTER–KOD AYRIŞMASIDIR ve kaydı bu yüzden tutuluyor.**
> Değişmez `shell.js`in **kendi yorumunda** yazılıydı:
> *"Ekran düzeyinde yasak — menü gizlemesi ile doğrudan adres kapısı TEK
> kaynaktan beslenir (R1 REVİZE 13 dersi: biri kapanıp diğeri açık kalamaz)."*
> Yorum doğruydu. Kod onu **iki yerde birden** ihlal ediyordu ve hiçbir eksen
> ölçmüyordu. Doğru yazılmış bir defter, kendini uygulamaz.

### İki kusur

| # | Kusur | Yer | Neden görünmedi |
|---|---|---|---|
| **A** | Menü kaydının `roles:` listesi doğrudan adrese **hiç uygulanmıyordu**. `guard()` yalnız `Perm.sec()` (alan) ve `SCREEN_DENY` (ekran) bakıyordu; girdi düzeyindeki `roles:` kapısı yalnız **menü çiziminde** yaşıyordu | `shell.js` · `dosyaIzinli()` | `roles:` taşıyan tek girdi kümesi üç **yönetim ayar girdisiydi** ve o üç ekranın dosyası bu dilime kadar **yoktu**. Kapı, arkasında bir şey olmadığı için hiç sınanmamıştı |
| **B** | `SCREEN_DENY[f]` — `f` bir **dosya adı** (`app-operasyon.html`), `SCREEN_DENY` ise **ekran adıyla** anahtarlı (`operasyon`). Arama hiçbir zaman tutmuyordu; yordam üç yasağın **hiçbirini** uygulamıyordu | `shell.js` · `dosyaIzinli()` | `guard()` `SCREEN_DENY`i **ayrıca ve doğru anahtarla** kontrol ediyordu, o yüzden 403 doğru basılıyordu. Kusur yalnız `dosyaIzinli`nin **öteki iki çağıranında** görünürdü: `GV.shell.ekranAcilabilir()` ve üst çubuğun "Yeni" listesi süzgeci |

### Etki alanı — ölçüldü, tahmin edilmedi

Gerçek Chromium'da, gerçek `guard()` ile, **27 rol × 20 menü hedefi** matrisi
düzeltmeden önce ve sonra koşuldu (`guard`ın ikinci bir kopyası yazılmadı —
kopya yazsaydım kusuru kopyaya da taşırdım).

| Ölçüm | ÖNCE | SONRA |
|---|---:|---:|
| Menüde **gizli** olup adresle **açılabilen** ekran-rol çifti (403 kapısı) | **69** | **0** |
| Etkilenen ekran | **3** | 0 |
| `ekranAcilabilir()` yanlış `true` dönen çift (bağlantı/"Yeni" süzgeci) | **254** | 0 |
| Menüde görünür olup adres kapısı reddeden çift (ölü menü girdisi) | 0 | 0 |

**39 ekranın hepsini DEĞİL, üçünü etkiliyordu — ve bu bir şans eseriydi.**
403 kapısı yalnız `roles:` taşıyan girdilerde delikti; `roles:` taşıyan tek
girdi kümesi üç yönetim ayar girdisidir:

| Ekran | Menüde gizli olduğu rol | Adresle açılabiliyordu |
|---|---:|---:|
| `app-ayar-sirket.html` | 24 | **24** |
| `app-ayar-entegrasyon.html` | 23 | **23** |
| `app-ayar-log.html` | 22 | **22** |

Kalan 17 menü hedefi **alan** (`Perm.sec`) kapısıyla korunuyordu ve o kapı
sağlamdı. Yani kusur "yalnız ayarları etkiliyordu" ama **sebebi** ayarlara
özgü değildi: girdi düzeyinde kapı kuran ilk özellik ayarlar olduğu için ilk
orada göründü. `roles:` taşıyan **ikinci** bir girdi eklenseydi aynı delik
sessizce onunla birlikte doğardı.

Kusur **B**'nin yarıçapı daha genişti ama sonucu daha sessizdi: `403`
bozulmadığı için kullanıcı hiçbir şey görmüyordu; bozulan, ekranların
"bu ekrana bağlantı verebilir miyim" sorusuna aldığı cevaptı (254 çift).
Müşteri rolünde `app-operasyon.html` · `app-satis-akisi.html` ·
`app-odeme-linki.html` **açılabilir** görünüyordu; açılmıyordu, ama bir ekran
ona bağlantı basmayı seçebilirdi.

### Neden hiçbir eksen yakalamadı

Ölçüldü: on dört eksenin **hiçbiri** bu değişmezi ölçmüyordu.

- `kontrol.js` [5] menü sayımını ölçüyordu — **yalnız görünürlüğü**. "17 girdi
  görünüyor" doğruydu; görünmeyen 3'ün açılıp açılmadığı sorulmuyordu.
- `kapi-yonu.js` kapı ölçüyordu ama **durum geçişi** kapılarını (`GV.flow`),
  navigasyon kapısını değil. Ad benzerliği bir kapsam garantisi değildir.
- `tarayici.js` her ekranı **yalnız `sahip` rolüyle** açıyordu — yetkisiz rolde
  ne olduğu hiç ölçülmüyordu. (Bu turda `rol` alanı eklendi.)

Boşluğun ortak sebebi: eksenler **bir tarafı** ölçüyordu (menü ya da geçiş),
değişmez ise **iki taraf arasındaki eşitliktir**. Bir eşitliği ölçmek için iki
tarafı da aynı anda okumak gerekir.

### Eklenen kontrol — `tasks/qa/ayar-ekseni.js` [A8]

Her rol × her menü hedefi için `menüde görünür ⟺ adresle açılabilir`
eşitliğini ölçer (**540 çift**). İki taraf da kabuğun kendi dışa verdiği
yordamlarından okunur (`GV.shell.visibleItems` · `GV.shell.ekranAcilabilir`);
guard'ın ikinci bir kopyası **yazılmaz**. Üçüncü kontrol kapının **ölü
olmadığını** ölçer: en az bir çiftte gerçekten reddetmesi gerekir (254 çiftte
reddediyor), yoksa "her şey herkese açık" da bu eksenden yeşil geçerdi.

**Bozulmuş kopyada sınandı — bir olumlu, iki olumsuz vaka:**

| Vaka | Enjekte edilen | Sonuç |
|---|---|---|
| 1 (olumlu) | yok — temiz kopya | **GEÇTİ** · 540 çift, bulgu 0 |
| 2 (olumsuz) | Kusur **A**: `Perm.item()` çağrısı söküldü | **YAKALADI** · 70 çift, üç ayar ekranı adıyla listelendi |
| 3 (olumsuz) | Kusur **B**: `dosyaIzinli` eski hâline döndürüldü | **YAKALADI** · 254 çift + "kapı ölü olabilir" mandalı da ateşledi |

### Hedef listesi kaynaktan değil kabuktan okunur

⚠️ Eksenin ilk yazımı menü hedeflerini `shell.js` metninden regex ile
(`href:'…'`) çıkarıyordu ve üst çubuğun **"Yeni" hızlı oluşturma listesini**
(beş form ekranı) menü girdisi sandı. O beş hedef hiçbir rolde menüde
görünmez ama adresle açılmaları **doğrudur** — bir form, girdisi olan listenin
çocuğudur. Eksen **135 sahte çift** bildirdi. Hedefler artık
`GV.shell.sections` kaydından okunur. Ölçüm aracı, ölçtüğü şeyin şemasını
tahmin etmez (L-26).

---

## ADR-R2-37 · Çizim anında `scrollIntoView` odak sırasını bozar — iki bileşende birden

**Karar (K-37).** Bir bileşen **çizim anında** (kullanıcı eylemi olmadan)
`element.scrollIntoView()` çağırmaz. Kayan bir şeritte etkin öğeyi görünür
kılmak gerekiyorsa **şeridin kendi `scrollLeft`i** ayarlanır.

**Ölçülen kusur.** `scrollIntoView()` tarayıcının **sıralı odak başlangıç
noktasını** (sequential focus navigation starting point) hedef düğüme taşıyor.
Sonuç: sayfa açıldıktan sonra kullanıcının ilk `Tab` tuşu belgenin başına
değil **sayfanın ortasına** düşüyor. Erişilemez hâle gelenler: **"İçeriğe atla"
skip link'i · rail · bölüm menüsü · üst çubuğun yedi küresel aracı** (arama,
Yeni, takvim, onay, bildirim, Hızlı Not, profil). Şartname §12 bunu kabul
kriteri sayıyor: *"Klavye kullanımı, odak sırası, semantik etiketler … WCAG
2.2 AA."*

**İki bileşende birden vardı ve ikincisi daha genişti:**

| Bileşen | Satır | Yayılım |
|---|---|---|
| `GV.tabs` — sekme şeridi | `ui.js` `activate()` | `GV.tabs` kullanan **8 ekran** |
| `wireChipbar` — çip şeridi | `ui.js` `wireChipbar()` | `GV.list` `cfg.tabs` üreten **her ekran** |

**Deney — sebep tahmin edilmedi, ölçüldü.** `ui.js` akışta değiştirilerek
(çalışma ağacına dokunmadan) `scrollIntoView` sökülmüş bir kopya sunuldu ve
aynı sayfalar iki kipte ölçüldü:

| Ekran | `scrollIntoView` VAR | SÖKÜLÜ |
|---|---|---|
| `app-ayar-profil.html` | zincir 1, ilk `button.gv-tab` | zincir 8, ilk **`a.gv-skip`** |
| `app-ayar-sirket.html#onay` | zincir **0** | zincir 8, ilk **`a.gv-skip`** |
| `app-musteri-detay.html` | zincir 8, ilk `button.gv-tab` | zincir 8, ilk **`a.gv-skip`** |

`app-musteri-detay.html` satırı önemlidir: **kusur oradaydı ama eksen yeşil
yanıyordu.** Sekme şeridinden sonra bol odaklanabilir düğüm olduğu için zincir
yine 5'i geçiyordu. Yani kusur ölçülmüyor değildi — **eşiğin altında
saklanıyordu.**

### Eksen neden yakalamadı — ve ne değişti

`tasks/qa/tarayici.js` odak ölçüyordu ama **yanlış soruyu** soruyordu:
*"Tab ilerledi mi?"* (zincir ≥5). Doğru soru ikisi birden:
*"Tab ilerledi mi **ve baştan mı başladı?**"*

Eklenen kontrol: ilk odak hedefi belgenin **ilk odaklanabilir düğümü**
(`a.gv-skip`) olmak zorunda. Bir eşik, altında saklanabilen bir kusur sınıfı
üretir; değişmez eşikle değil **eşitlikle** ölçülür.

**Bozulmuş kopyada iki yönlü sınandı:**

| Vaka | Kod | İlk odak | Eksen |
|---|---|---|---|
| olumlu | temiz | `gv-skip` · `gv-skip` · `gv-skip` | **bulgu 0/3** |
| olumsuz | `scrollIntoView` geri kondu | `gv-tab` · `gv-tab` · **null** | **bulgu 3/3** |

**Kullanıcı eylemiyle çağrılan `scrollIntoView` KALDI** (`ui.js` form hata
özeti ve rapor paneli): orada odak başlangıç noktasını zaten kullanıcının
kendi tıklaması taşımıştır, kusur o dalda doğmaz. Yasak "bu API kullanılmaz"
değil, **"çizim anında kullanılmaz"**dır.
