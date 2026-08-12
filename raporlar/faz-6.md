# FAZ 6 KAPANIŞ RAPORU — GaviaWorks CRM R2

> **Tarih:** 13 Ağustos 2026 · **Depo:** `gaviaworks-dev/gaviaworks-crm-r2` · `main`
> **Kesit:** `ea10cd2` · **206 commit**
>
> Bu rapor bir özet değil bir ÖLÇÜMDÜR. İçindeki her sayı bu turda ölçüldü;
> hiçbiri devralınan bir belgeden kopyalanmadı. Ölçülemeyen şey rapora
> "ölçülemedi" diye girdi.
>
> **Adlandırma.** Şartnamenin göç planı altı **faz** tanımlar (§11). Prototipin
> yapımı yedi **dilim** hâlinde yürüdü; ikisi ayrı eksendir. Bu rapor prototip
> yapımının kapanışıdır ve şartname fazlarının hangisinin gerçekten bittiğini
> §7'de tek tek söyler.

---

## 1. KESİT — bugün elde ne var

| | |
|---|---|
| Ekran | **48 uygulama ekranı + giriş** |
| Rota defteri | **148 karar satırı · 129 yayında · 18 bloke · 1 kapsam dışı · 0 açık iş** |
| Ölçüm ekseni | **15 eksen + 1 tarayıcı koşumu**, hepsi TEMİZ (+ 1 kapı olmayan tarama) |
| Tarayıcı ölçümü | **95 ekran × 6 genişlik = 570 ölçüm · 570/570 geçerli · 0 bulgu · 166,1 sn** |
| Mimari karar (ADR) | **43 yazılı** |
| V2 borç defteri | **106 madde · 11 kapandı · 95 AÇIK** |
| Kod | ortak katman **10.951** satır · ekranlar **41.041** · mock veri **7.060** · ölçüm ekseni **4.912** |

**Bu tur (Faz 6 kapanışı) neyi değiştirdi:**

| | |
|---|---|
| Kapanan rota satırı | **2** (62 · 63 — toplantı bağlamı) |
| Kapanan borç | **1** (V2-100 — veri sızıntısı) |
| Açılan borç | **6** (V2-104 … V2-109) |
| Yeni ADR | **1** (ADR-R2-47) |
| Yeni ölçüm ekseni | **1** (`tasks/qa/musteri-kapisi.js`) |
| Commit | **5** |

---

## 2. TURUN EN AĞIR BULGUSU — V2-100 VERİ SIZINTISI

### 2.1 Neydi

Müşteri portalı kimliği (`emp:null`, bir müşteri yetkilisi hesabı) uygulamada
**şirket içi veri görüyordu**. Devralınan not bunu "panelde" diye tarif
ediyordu. Ölçüm yapıldı ve **yayılım panelden çok daha genişti**.

### 2.2 Yayılım — ölçüldü, tahmin edilmedi

Müşteri kimliğiyle **60 ölçüm vakası** koşuldu (yayındaki 46 ekran dosyası +
14 kayıtlı/sekmeli vaka). Sonuç:

| | |
|---|---|
| Kabuğun **403** bastığı yüzey | **46** |
| Müşterinin gerçekten **ulaşabildiği** yüzey | **14** |
| Bu 14 yüzeyden **sızdıranı** | **5** |
| Görünen **kişi adı** | **50** |
| Görünen **iç ya da yabancı kayıt** | **130** |

**Sızdıran beş yüzey ve ne bastıkları:**

| yüzey | ne görünüyordu |
|---|---|
| `app-panel.html` | 5 iç bildirim · 6 iç proje (3'ü adıyla) · 15 personel sayısı · 2 izin talebi **isim isim** · "Bekleyen onay 10" · 186.000 ₺'lik bir satın alma talebi |
| `app-gorev-form.html` | **16 personelin tamamı adıyla** · 14 projenin tamamı — başka firmaların projeleri dahil |
| `app-proje-form.html` | 15 personel adıyla · şirketin bütün hesapları |
| `app-destek-form.html` | 16 personel · 14 proje · 20 hesap · **bütün firmaların yetkilileri** |
| `app-proje-detay.html` | Kapı reddediyordu **ama** sayfa başlığına yabancı projenin adını basıyordu |

⚠️ Sızıntının bir kısmı `display:none` bir sekme panelinde duruyordu. **CSS
görünürlüğü bir kapı değildir**: sayfaya yazılan veri kullanıcının bilgisayarına
zaten gitmiştir ve bir tıklama uzaktadır.

### 2.3 Neden hiçbir eksen yakalamadı

Uygulamada iki kapı vardı ve **ikisi de aynı soruyu soruyordu**:

* `GV.guardRecord` → "bu **kayıt** bu kullanıcıya ait mi?"
* `GV.list` satır kapsamı → "bu **satır** bu kullanıcıya ait mi?"

Sızdıran yüzeylerin hiçbiri bir kayıt açmıyordu. Panel kartı bir defterin
**tamamını** sayar, bir `<select>` bir defterin **tamamını** listeler. Sahibi
sorulacak bir kayıt yok, dolayısıyla iki kapı da devreye girmiyor. Üstelik
`app-gorev-form.html` ve `app-proje-form.html` **yeni kayıt** kipindeydi —
ortada henüz bir kayıt bile yoktu.

**Eksik olan üçüncü soruydu: "bu KİMLİK şirket içi veriyi görebilir mi?"**

### 2.4 Ne yapıldı

Üçüncü kapı ortak katmana, **tek yere** yazıldı:

```
GV.perm.icVeri()      →  personel oturumu mu, portal kimliği mi
GV.perm.icVeriNeden() →  kapalıysa GEREKÇE cümlesi
GV.perm.icKume()      →  şirket içi bir defterden gelen liste; portalda BOŞ
GV.perm.kapsa()       →  satır kapsamı süzgeci — artık tek uygulama
GV.guardIcEkran()     →  şirket içi bir kayıt ekranının kimlik kapısı
```

Ayrıca `GV.guardRecord` kendi sözünü tutar hâle getirildi: reddettiğinde artık
yabancı kaydın adını basmıyor, yalnız ziyaretçinin adres çubuğuna kendi
yazdığı kodu yankılıyor.

`app-destek-form.html` **bilerek açık bırakıldı** — müşteri yetkilisinin kendi
destek talebini açması portalın işidir (ölçüldü: yayındaki 7 talebin 7'si
"Müşteri portalı" kanalından ve açan 7/7 bir müşteri yetkilisi). Ekran
kapatılmadı, seçenek listeleri kapsandı.

### 2.5 Önce / sonra — aynı eksen, aynı 60 vaka

| | ÖNCE | SONRA |
|---|---:|---:|
| Sızdıran yüzey | **5** | **0** |
| Bulgu | **12** | **0** |
| Görünen kişi adı | **50** | **0** |
| Görünen iç/yabancı kayıt | **130** | **0** |

### 2.6 Yakalayacak kontrol — yeni eksen

`tasks/qa/musteri-kapisi.js` yazıldı. Üç sınıf ölçer ve sözlüğünü verinin
kendisinden kurar (elle liste tutmaz, tutsa veri değişince sessizce körleşirdi):

* **S1** personel kimliği — personel kodu ve **adı**
* **S2** yabancı kayıt — başka bir müşteriye ait kaydın kodu **ya da adı**
* **S3** iç defter — müşteri ekseni hiç olmayan defterlerin kayıtları

**İki yönlü sınandı.** Bir kontrol, kusuru bulmadığını değil **bulabildiğini**
kanıtlamalıdır:

* Sayfaya bilerek sızıntı enjekte edildi → **üç sınıfın üçü de yakalandı**.
* Onarım öncesi ağaç (aynı depo, `HEAD` kopyası) ölçüldü → **12 bulgu**.
* Onarılmış ağaç ölçüldü → **0 bulgu**.

**Personel tarafı bozulmadı.** Panel 10 farklı rolde önce/sonra
karşılaştırıldı; dokuz personel rolünde çıktı **birebir aynı**, tek fark
müşteri rolündedir.

**Kayda geçti:** `ADR-R2-47 · Kapı üç düzeyde sorulur: KAYIT · SATIR · KİMLİK`.

### 2.7 Kapatılmayan, ama susturulmayan tek şey

Müşteri **kendi** destek talebinde, talebi üstlenen uzmanın adını görüyor.
Bu başka bir firmanın verisi değil, toplayan bir iç defter de değil —
müşterinin kendi kaydının tarafıdır ve portal ürünlerinde genellikle **istenen**
davranıştır. Karar verilmediği için ne kapatıldı ne saklandı: eksenin
"karara açık" listesinde gerekçesiyle yazılı ve her koşumda ekrana basılıyor
(**V2-105 · Yasin Bey kararı bekliyor**).

---

## 3. ROTA DEFTERİ — kapanış sayımı

R1'in 148 ekranının her biri bir karar taşır. Benzersiz numara üzerinden
sayıldı (defterde 5 satır iki kez geçiyor, mükerrer sayılmadı):

| | sayı |
|---|---:|
| **Yayında** | **129** |
| **Bloke** — yazma yordamı yok | **18** |
| **Kapsam dışı** | **1** |
| **Açık gerçek iş** | **0** |
| Toplam | **148** |

Bu turda kapanan iki satır: **62** ve **63** — toplantı. Toplantı R2'de ayrı
bir ekran değil; müşteri kartının ve proje kartının kendi geçmiş yüzeyinde
bağlamsal bir kayıt olarak yaşıyor. Ölçüldü: defterdeki 9 toplantının 5'i bir
müşteriye ve aynı 5'i bir projeye bağlı; kalan 4'ü departman/satış
toplantısıdır, hiçbir bağlama düşmez ve **bu ekranda yazılıdır**.

**18 bloke satırın tamamı artık aynı biçimde işaretli**: aynı işaret, aynı
ölçüm cümlesi, aynı karar satırı, aynı "Yüzey:" alanı, aynı borç numarası.
Aralarındaki tek fark gerçektir ve yazılıdır — altısında salt okunur bir
çekmece açıldı, on ikisinde hiçbir yüzey açılmadı.

---

## 4. ÖLÇÜM EKSENLERİ — 15 eksen, hepsi temiz

| eksen | ne ölçer | sonuç |
|---|---|---|
| `acilis-uc.js` | açılış/dönüşüm uçları | ✓ 59 kontrol · 4 eksen |
| `aktif-ekseni.js` | `aktif` tuzak alanı | ✓ 21 kontrol · 6 eksen |
| `ayar-ekseni.js` | ayar kabuğu · menü=adres kapısı · rota defteri | ✓ 40 kontrol · 9 eksen |
| `bayat-alan.js` | bayat alan okuması | ✓ 11 kontrol · 3 eksen |
| `brief-dogrula.js` | brief ile kod uyumu | ✓ brief kodla uyumlu |
| `finans-kanon.js` | para çapası | ✓ 22 kontrol · 6 eksen |
| `ik-ekseni.js` | İK zinciri | ✓ 42 kontrol · 7 eksen |
| `kapi-yonu.js` | kapıların reddettiği ve kabul ettiği yön | ✓ 50 kontrol |
| `kontrol.js` | genel bütünlük | ✓ |
| **`musteri-kapisi.js`** | **portal kimliği iç veri görüyor mu** | **✓ 60 vaka · 0 sızıntı** |
| `not-izolasyon.js` | kişisel not sahipliği | ✓ |
| `odeme-akis.js` | ödeme akışı | ✓ |
| `ops-akis.js` | operasyon akışı | ✓ |
| `rapor-tavan.js` | rapor tavanı (4 KPI · 2 grafik · 1 tablo) | ✓ 6 rapor × 6 genişlik |
| `satis-akis.js` | satış zinciri | ✓ 42 kontrol · 10 eksen |

**Kapı ölçümü** (`ayar-ekseni` [A8]): 27 rol × 20 menü hedefi = **540 çift**
ölçüldü. Menüde gizli olup adresle açılabilen ekran **yok**; menüde görünüp
adresle açılamayan ekran da **yok**. Adres kapısı **254 rol-hedef çiftinde
gerçekten reddediyor** — yani kapı ölü değil, çalışıyor.

---

## 5. TARAYICI ÖLÇÜMÜ — gerçek Chromium

Şartnamenin altı genişliğinde (§12), her ekran için dört eksen: konsol hatası ·
yatay taşma · ikon çizimi · klavye odağı.

| | |
|---|---:|
| Ölçülen ekran | **95** |
| Genişlik | **6** (1600 · 1440 · 1280 · 1024 · 768 · 390) |
| Toplam ölçüm | **570** |
| Geçerli ölçüm | **570 / 570** |
| Bulgu | **0** |
| Yatay taşma | **0** |
| Ölçülen DOM düğümü | **449.292** (en az 36 · en çok 1.698) |
| Süre | **166,1 sn** (ölçüm başına 291 ms) |

---

## 6. BAYAT BEYAN TARAMASI

Bir kuralın hâlini anlatan ekran cümlesi, kuralın **kendisinden** türetilmelidir.
Elle yazılmış bir cümle, defter değiştiği an sessizce yalana döner. Önceki turda
bu kusur dört kez yakalandığı için kapanıştan önce tam tarama yapıldı.

Tarama `tasks/qa/beyan-tarama.js` ile mekanikleştirildi (kapı değil, tarama —
çıkış kodu bilerek 0; bir sayının bugün doğru olması onun türetilmiş olduğu
anlamına gelmez). Hem onarım öncesi ağaç hem bugünkü ağaç koşuldu:

| | ÖNCE | SONRA |
|---|---:|---:|
| Taranan ekran dosyası | 48 | 48 |
| Sayı taşıyan elle yazılmış ekran cümlesi | **41** | **36** |
| Veriye karşı tek tek sınandı | 41 | 36 |
| **Bugün YANLIŞ olan (bayat)** | **0** | **0** |

Bu turda **4 cümle** türetilmiş hâle getirildi (biri iki kaynak satırına
yayıldığı için tarama 5 parça düşürdü), ayrıca gerçek bir müşteri talebinin
başlığından alınmış bir **örnek metin** değiştirildi. Kalan **36 cümle**
doğrudur ama türetilmemiştir.

Türetilmiş hâle getirilen dördü, aynı anda **veri sızıntısıydı**: müşteri
kimliğine şirketin tüm defterinin sayılarını basıyorlardı.

Kalan 36 cümlenin hepsi bugün doğrudur — veriye karşı tek tek sınandı
(`DB.tickets` 7 · SLA politikası 7/7 · proje 14/14 · fatura 17/17 · görev 26 ·
izin 7 · personel 16 · satın alma 2/7 · zimmet 7/7 · poliçe 14 alan · aylık
çalışma saati 176 = 22×8). Ama **hiçbiri türetilmemiştir**: defter bir kayıt
büyüdüğünde sessizce yanlışa dönerler ve bunu **kapı olarak** ölçen bir eksen
yoktur (**V2-107**).

---

## 7. DÜRÜST KAPANIŞ BEYANI

> Bu bölüm rapor süslemek için değil, **prototip bitti** ile **ürün hazır**
> arasındaki farkı açıkça söylemek için yazıldı.

### 7.1 Elde ne var — bir PROTOTİP

R2 çalışan, gezilebilir, ölçülmüş bir prototiptir. 48 ekran gerçek bir tarayıcıda
altı genişlikte taşmadan açılıyor, yetki kapıları ölçülerek çalıştığı
kanıtlanmış durumda, para hesapları tek bir çapadan besleniyor, iş akışları
durum makinesinden doğuyor. Kararlar 43 mimari karar kaydında gerekçesiyle
yazılı. Bu az bir şey değil — ama **ürün değildir**.

### 7.2 Kapanmayan 18 satır ve TEK sebebi

Rota defterinin 18 satırı kapanmadı. Sebebi tek ve teknik: **o defterlere kayıt
ekleyen bir yordam yok.** Ön analiz, komisyon, sprint, test senaryosu, hata,
değişiklik talebi, teslim, departman talebi, toplantı, performans, sipariş,
tedarikçi ve altı araç alt defteri — hiçbirine yeni kayıt açılamıyor.

Bu bir unutma değil, **ölçülmüş bir sınırdır**. Kaydetmeyen bir "Kaydet"
düğmesi basmak, çalışmayan bir şeyi çalışıyormuş gibi göstermek olurdu; o
yüzden hiç basılmadı. Bu 18 satır ancak yazma tarafı gerçek bir sunucuyla
yazıldığında kapanabilir.

### 7.3 BACKEND PAYI — canlıya çıkmadan ÖNCE zorunlu

Aşağıdakiler prototipte **yoktur** ve prototipte olamaz. Hiçbiri "sonra
bakarız" kalemi değildir; canlı kullanımın önkoşuludur.

| | neden zorunlu |
|---|---|
| **Gerçek not izolasyonu** | Bugün kişisel notlar tarayıcının belleğindedir. Bir kullanıcının notunu başka bir kullanıcının okuyamaması **sunucuda** garanti edilmelidir; ekranda gizlemek yeterli değildir |
| **Gerçek XLSX ve PDF çıktısı** | Bugün çıktı yüzeyi vardır, dosyanın kendisi yoktur. Rapor ve fatura çıktısı olmadan muhasebe ve müşteri yazışması yürümez |
| **Webhook** | Ödeme sağlayıcısının "ödeme gerçekleşti" bildirimini alan uç yoktur. Bu olmadan tahsilat **hiçbir zaman** güvenilir biçimde kaydedilemez — tarayıcının geri dönmesi ödeme yapıldığı anlamına gelmez |
| **Idempotency** | Aynı bildirimin iki kez gelmesi hâlinde tek kayıt üretmeyi garanti eden mekanizma yoktur. Yoksa aynı ödeme iki kez tahsilat yazar |
| **Kalıcı denetim defteri** | Bugün "kim ne zaman ne yaptı" kaydı sayfa yenilenince **sıfırlanır**. Yasal ve iç denetim için kalıcı olmalıdır |
| **Ödeme sağlayıcısı** | Sözleşmeli bir sağlayıcı seçilmemiştir. Seçilmeden gerçek kart verisi toplanamaz |

**Bu altı kalem tamamlanmadan sistem canlıya alınamaz.** Bunlar prototipin
eksiği değil, prototipin **tanımı gereği kapsamı dışıdır**.

### 7.4 Şartname fazları — hangisi gerçekten bitti

| faz | durum |
|---|---|
| Faz 1–4 (navigasyon · müşteri göçü · operasyon · tek rapor yüzeyi) | **Ekran tarafı tamam.** Çıktı dosyası (PDF/Excel) üretilmiyor |
| Faz 5 (ödeme linkleri) | **Yalnız ekran tarafı.** Sağlayıcı, webhook, idempotency ve mutabakat **YOK** — bu fazın asıl işi budur |
| Faz 6 (temizlik) | **Bu turla kapandı** — rota defterinde açık gerçek iş kalmadı |

### 7.5 Açık borç

**V2 borç defterinde 95 madde açık.** Bunların çoğu küçük değildir; ortak
katmanın form sözleşmesindeki beş boşluk, kayıt bazlı düzenleme yetkisinin
olmayışı ve veri defterlerindeki çelişkiler bu listede duruyor.

### 7.6 Devreden ve hâlâ yazılmamış

`ADR-R2-41`, `42`, `43` ve `44` numaraları ayrılmış ama karar metinleri
**hiç yazılmamış** — dört turdur devrediyor. Karar defteri 47'ye kadar
numaralı, gerçekte 43 karar yazılı.

---

## 8. YASİN BEY ONAYI BEKLEYEN KARARLAR

| # | soru |
|---|---|
| **V2-105** 🆕 | Müşteri kendi kaydında iç aktörlerin **adını** görsün mü, yoksa yalnız "Destek ekibi" gibi bir kurum adı mı? |
| **V2-41** | Envanterde zimmetli görünüp tutanağı olmayan üç demirbaş: **tutanak mı eksikti, envanter mi yanlıştı?** |
| **V2-42** | Aynı sınıftaki ikinci veri sorusu |
| **V2-45** | "İleri gidemiyorsan geri de gidemezsin" — dört tabloda geri dönüşü de engelleyen kapı. İş kuralı tercihidir, onaylanıyor mu? |
| **V2-69** | Üstü olmayan kurucunun izin talebinde onay zinciri ne yapsın: adımı **atla** · **İK'ya düşür** · **reddet**? |
| **V2-71** | `aktif` tuzağı `durum`suz üç koleksiyona da yayılsın mı, yoksa liste resmîleştirilsin mi? |
| **V2-72** | Maaş defteri bir **geçmiş değil**, tek bir anı taşıyor. Gerçek dönem kaydı istenirse veri genişletilmeli |
| **V2-80** | İki satın alma talebinde **örnek ile tanım çelişiyor**: eşik mi yanlış, örnek mi fazla adım taşıyor? |
| **V2-89** | Zimmet tarih alanları da envanterden türetilsin mi, yoksa tutanağın alanı sayılıp envanterden düşürülsün mü? |
| **V2-96** | Ek giriş şablonları süreç açılırken **uygulansın mı**, yoksa bir öneri listesi mi? |
| **EMP-016** | Bir personel bugün `Aktif` ama zorunlu evrak kapısı onu reddediyor. Tohum veri mi düzeltilsin, personel mi geri alınsın? |
| **ADR-R2-41…44** | Dört karar numarası ayrılmış, metni hiç yazılmamış. Yazılsın mı, numaralar boşa mı çıkarılsın? |

