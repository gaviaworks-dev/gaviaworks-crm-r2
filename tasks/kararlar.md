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
