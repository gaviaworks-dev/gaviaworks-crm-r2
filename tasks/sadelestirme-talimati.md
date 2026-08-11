# GaviaWorks CRM Sadeleştirme, Operasyon ve Ödeme Linkleri Revizyon Dokümanı

**Cloud geliştirme ortamına verilecek ürün, UX, veri ve iş akışı şartnamesi**  
**Tarih:** 10 Ağustos 2026  
**İncelenen sürüm:** `gaviaworks-dev/gaviaworks-crm` — `main` / `36ad104e01572d1e19d68a10194495a7c485ca90`

## Yönetici kararı

Mevcut sistem işlev bakımından güçlü, ancak günlük kullanım için gereğinden fazla yüzeye bölünmüş durumda. Revizyonun amacı özellikleri silmek değil; kullanıcının karar vermek ve işlem yapmak için geçtiği ekran sayısını azaltmaktır.

Hedef yapı:

- Ana navigasyonu **16 bölüm ve 99 menü girdisinden**, rol bazında en fazla **7 çalışma alanı ve yaklaşık 18 görünür menü girdisine** indirmek.
- Kişisel çalışma alanını ve ayrı not sayfalarını kaldırarak notları **Gündem içindeki Hızlı Notlar bileşenine** dönüştürmek.
- Müşteri adayı ile müşteriyi aynı kayıt ve liste yapısında birleştirmek; adaylığı ayrı modül değil **müşteri yaşam evresi** olarak yönetmek.
- Proje, görev, destek, onay ve tahsilat işlerini tek noktadan yürütebilen **çift bölmeli Operasyon ekranı** oluşturmak.
- Yedi rapor sayfası ve 105 rapor tanımını son kullanıcı açısından **tek rapor yüzeyi ve altı ana rapor şablonuna** indirmek; ayrıntılı veriyi drill-down ve dışa aktarıma taşımak.
- Müşteri, tutar ve son kullanma bilgisiyle güvenli dış bağlantı üreten **Ödeme Linkleri** modülünü eklemek.
- Eski veriyi, kayıt kimliklerini ve denetim izini korumak; kaldırılan adresleri yeni hedeflere yönlendirmek.

## 1. İnceleme dayanağı ve ölçülmüş mevcut durum

İnceleme, paylaşılan canlı uygulamanın güncel GitHub Pages kaynağı ile aynı depodaki `main` dalının 10 Ağustos 2026 tarihli sürümü üzerinden yapılmıştır.

| Ölçüt | Mevcut değer | Kullanım etkisi |
| --- | ---: | --- |
| Üst düzey çalışma bölümü | 16 | Kullanıcı işi değil modül adını düşünmek zorunda kalıyor. |
| Sol menü girdisi | 99 | Sık kullanılan işlem ile nadir yönetim işlemi aynı ağırlıkta görünüyor. |
| HTML ekranı | 149 | Bakım, tutarlılık, yetki ve yönlendirme maliyeti büyüyor. |
| Ayrı form ekranı | 39 | Basit kayıtlar için dahi bağlam değişiyor. |
| Ayrı detay ekranı | 27 | Aynı nesnenin alt bilgileri farklı sayfalara dağılıyor. |
| Rapor yüzeyi | 8 | Rapor merkezi ve yedi kategori ekranı arasında tekrar oluşuyor. |
| Tanımlı rapor | 105 | Günlük karar için gereken özet, ayrıntı kataloğunun içinde kayboluyor. |
| Müşteri raporu | 14 | Aynı müşteri verisi farklı raporlarda tekrar işleniyor. |
| Kişisel not yüzeyi | 2 sayfa, 4 form sekmesi, 6 liste sekmesi | Hızlı not ihtiyacı mini görev yönetim sistemine dönüşmüş. |

### 1.1 Temel sorunlar

1. **Navigasyon nesne merkezli değil modül merkezli.** Müşteri, yetkili, iletişim, aday, teklif, ön analiz ve raporlar arasında sık geçiş gerekiyor.
2. **Aynı iş farklı kabuklarda tekrarlanıyor.** Ajanda, günlük özet, bildirim, onay, görev ve toplantı ekranları kullanıcının günlük iş listesini parçalıyor.
3. **Basit kayıtlar aşırı modellenmiş.** Kişisel notta kategori, renk, öncelik, durum, tarih, hatırlatma, sabitleme, kontrol listesi, arşiv ve toplu işlemler günlük ihtiyacın önüne geçiyor.
4. **Rapor kataloğu karar desteğinden daha baskın.** 105 raporun aynı erişilebilirlik düzeyinde görünmesi, kullanıcıya “hangi raporu açmalıyım?” yükü getiriyor.
5. **Rapor ekranında ikinci sol menü var.** Uygulama menüsü açıkken rapor içi yapışkan menü içerik alanını daraltıyor. Grafiklerin uzun etiketleri ve geniş SVG içeriği bu dar alanda okunabilirliği bozuyor.
6. **Müşteri adayı ayrı veri ve sayfa ailesi.** Kazanıldığında müşteriyle bağ kurulması, iki kayıt ailesi arasında tutarlılık ve mükerrerlik riski yaratıyor.
7. **Müşteriye güvenli ödeme bağlantısı üretme akışı yok.** Fatura, tahsilat ve ödeme planı mevcut olsa da dış ödeme sayfası ve ödeme sağlayıcısı geri bildirim akışı tanımlı değil.

## 2. Revizyon ilkeleri

- **Az sayfa, tam bağlam:** Liste, kayıt detayı ve hızlı işlem aynı çalışma yüzeyinde mümkün olduğunca birlikte çalışmalı.
- **İleri ayrıntı isteğe bağlı:** Nadir alanlar “Daha fazla seçenek” altında kapalı gelmeli.
- **Durum, ayrı modül değildir:** Aday müşteri, geciken görev veya bekleyen ödeme ayrı kayıt ailesi değil, ana kaydın filtrelenebilir durumudur.
- **Tek kayıt, tek kimlik:** Müşteri adayı müşteriye dönüştüğünde yeni müşteri kopyası üretilmemeli.
- **Birincil eylem tek olmalı:** Her ekranda yalnız bir baskın çağrı butonu bulunmalı.
- **Bağlamsal işlemler:** Yetkili, iletişim, belge, teklif, destek ve ödeme gibi alt kayıtlar ilgili müşteri veya proje detayında açılmalı.
- **Rol bazlı görünürlük:** Kullanıcı yalnız yapabileceği işi görmeli; yetkisiz öğe gri veya kilitli gösterilmek yerine menüden kaldırılmalı.
- **Veriyi silmeden sadeleştirme:** Mevcut rapor tanımları ve eski sayfalar ilk geçişte korunmalı, yeni kabuğa eşlenmeli.
- **Masaüstü üretkenliği:** Ana yoğun iş ekranları 1280–1920 piksel aralığında verimli; mobil ekranlar temel onay ve hızlı işlem için kullanılabilir olmalı.
- **Ölçülebilir kabul:** Menü sayısı, tıklama sayısı, taşma testi, işlem süresi ve hata oranı teslim kriteri olmalı.

## 3. Hedef bilgi mimarisi

### 3.1 Ana navigasyon

| Çalışma alanı | Görünen ana sayfalar | Birleştirilen mevcut içerik |
| --- | --- | --- |
| Gündem | Ana Panel | Dashboard, günlük özet, ajanda özeti, onay özeti, bildirim özeti, hızlı notlar |
| Müşteri ve Satış | Müşteriler, Satış Akışı, Teklifler | Müşteri adayları, müşteriler, yetkililer, iletişim geçmişi, ön analiz, pipeline |
| Proje ve Operasyon | Projeler, Görevler, Operasyon, Destek | Milestone, sprint, test, hata, değişiklik, teslim, toplantı ve kararların bağlamsal görünümleri |
| Finans | Faturalar, Tahsilatlar, Ödeme Linkleri, Satın Alma | Sözleşme ve ödeme planı sekmeleri, tedarik/sipariş akışları |
| Ekip ve Kaynaklar | Personel, Zaman ve İzin, Varlıklar | Kapasite, performans, eğitim, işe giriş/çıkış, demirbaş, zimmet, filo |
| Raporlar | Raporlar | Mevcut rapor merkezi ve yedi kategori sayfası |
| Ayarlar | Profil, Şirket ve Erişim, Entegrasyonlar, Sistem Kayıtları | Mevcut ayar sayfaları rol bazlı sekmeler |

Standart kullanıcıda en fazla 18 menü girdisi görünmelidir. Sistem yöneticisi, ayar sekmeleri nedeniyle daha fazla öğeye erişebilir; ancak bunlar günlük menüyle aynı görsel ağırlıkta olmamalıdır.

### 3.2 Üst çubukta kalacak küresel araçlar

- Genel arama
- “Yeni” hızlı oluşturma menüsü
- Takvim çekmecesi
- Bekleyen onay sayacı
- Bildirimler
- Hızlı Not düğmesi
- Profil ve şirket bağlamı

Takvim, bildirim, kişisel not ve onay için ayrıca üst düzey uygulama bölümü açılmamalıdır.

### 3.3 Sayfa birleştirme matrisi

| Mevcut sayfa ailesi | Hedef yüzey | Uygulama kararı |
| --- | --- | --- |
| `app-notlarim.html`, `app-not-form.html` | `/panel` içindeki Hızlı Notlar | Menüden kaldır; eski URL’leri `/panel?drawer=notlar` adresine yönlendir. |
| `app-lead*.html` | `/musteriler?evre=aday` ve müşteri detayı | Lead verisini müşteri yaşam evresine taşı; fırsat bilgisini ayrı fırsat kaydında koru. |
| `app-musteri-yetkili*.html`, `app-musteri-iletisim*.html` | `/musteriler/:id` sekmeleri | Yetkili ve iletişim işlemlerini müşteri bağlamında drawer/modal ile aç. |
| `app-panel-ozet`, onay, bildirim ve duyuru sayfaları | `/panel` widget ve drawer’ları | Tam ekranı yalnız derin geçmiş gerektiğinde aç; günlük kullanım panelde kalsın. |
| Proje milestone/sprint/test/hata/değişiklik/teslim sayfaları | `/projeler/:id` sekmeleri | Liste erişimini proje bağlamına taşı; küresel çapraz listeyi Operasyon filtresi olarak koru. |
| Görev sekme varyasyonları | `/gorevler?gorunum=…` | Tek liste bileşeni ve kayıtlı görünüm kullan. |
| Toplantı, ajanda ve kararlar | Panel takvimi + ilgili müşteri/proje detayı | Toplantıyı bağlamsal aktivite yap; kararları görevle ilişkilendir. |
| Doküman merkezi alt sayfaları | Kayıt detayındaki Belgeler sekmesi + yönetici arşivi | Günlük belge eklemeyi bağlama taşı; merkezi arşivi arama/yönetim için tut. |
| `app-rapor*.html` | `/raporlar` | Tek kabuk, üst seçim ve ortak filtre. Rapor içi sol menüyü kaldır. |
| `app-ayar-*.html` | `/ayarlar/:sekme` | Aynı ayar kabuğunda sekmeli yönetim; yetkiye göre sekme üret. |
| Yeni ödeme bağlantıları | `/finans/odeme-linkleri` ve `/odeme/:token` | İç yönetim ve dış müşteri ödeme ekranını ayrı güvenlik bağlamında kur. |

## 4. Gündem ve Hızlı Notlar revizyonu

### 4.1 Gündem yerleşimi

Ana panel, kullanıcının “bugün ne yapmalıyım?” sorusuna cevap vermelidir. Önerilen sıra:

1. Üst satır: Bugünkü iş, geciken iş, bekleyen onay, beklenen tahsilat.
2. Sol ana kolon: Günün ajandası ve öncelikli iş kuyruğu.
3. Sağ kolon: Hızlı Notlar ve son bildirimler.
4. Alt satır: Rol bazlı iki özet; örneğin satış kullanıcısında fırsat, finans kullanıcısında nakit özeti.

Her kullanıcı panelde en fazla altı kart görmelidir. Kartlar rol bazlı varsayılan gelir; kullanıcı yalnız sıralamayı değiştirebilir.

### 4.2 Hızlı Notlar

Mevcut ayrı “Kişisel Çalışma Alanı” ve “Notlarım” bölümü menüden kaldırılmalıdır. Yerine iki erişim noktası eklenmelidir:

- Panelde **Hızlı Notlar** kartı
- Tüm sayfalarda sağ kenarda **Not Al** düğmesi; 360–400 piksel genişliğinde drawer açar

Minimum veri alanları:

| Alan | Zorunluluk | Davranış |
| --- | --- | --- |
| Not metni | Zorunlu | Tek alan; ilk satır otomatik başlık kabul edilir. |
| Yapıldı | Sistem alanı | Checkbox ile açılır/tamamlandı arasında geçiş. |
| Tarih | İsteğe bağlı | Takvim ikonundan açılır; varsayılan boş. |
| Sahip | Otomatik | Oturum kullanıcısı; başka kullanıcı seçilemez. |

Kaldırılacak günlük karmaşıklık: ayrı kategori, renk, öncelik, durum sekmesi, KPI şeridi, toplu işlem, ayrı arşiv sayfası ve zorunlu kontrol listesi yönetimi. Eski not verileri kaybolmamalıdır; kategori/renk/öncelik alanları geçmiş kayıt metadatası olarak korunabilir ancak yeni hızlı not formunda gösterilmez.

Davranış kuralları:

- `Enter` kaydeder, `Shift+Enter` yeni satır açar.
- Son yedi açık not gösterilir; “Tümünü gör” drawer içinde geçmişi açar, yeni tam sayfa oluşturmaz.
- Checkbox işaretlenince not tamamlanır ve 5 saniyelik geri alma imkânı verir.
- Tamamlanan not 24 saat sonra varsayılan listeden gizlenir; arama ile bulunabilir.
- Not yalnız sahibine görünür. API her okumada ve yazmada `owner_user_id` kontrolü yapar; yalnız arayüzde filtrelemek yeterli değildir.
- Not metni kurumsal kayıtlarla otomatik paylaşılmaz ve raporlara girmez.

## 5. Müşteri ve aday müşteri birleştirmesi

### 5.1 Hedef model

“Aday müşteri” ayrı modül ve ayrı şirket kaydı olmamalıdır. Tek `customer_account` kaydı aşağıdaki yaşam evrelerinden birini taşır:

| Yaşam evresi | Anlamı | İzin verilen sonraki evre |
| --- | --- | --- |
| Aday | İlk kayıt, henüz doğrulanmamış ihtiyaç | Nitelikli, Kayıp |
| Nitelikli | İhtiyaç ve karar süreci doğrulanmış | Müşteri, Kayıp, Aday |
| Müşteri | Kazanılmış, aktif ticari ilişki | Pasif |
| Pasif | Aktif iş/sözleşme yok | Müşteri |
| Kayıp | Satış süreci sonuçsuz | Aday |

Müşteri listesinde evre bir kolon ve filtre olmalıdır. “Aday” için yalnız küçük, nötr bir durum etiketi kullanılmalı; ayrı renk teması, ayrı kart tasarımı veya ayrı menü oluşturulmamalıdır.

### 5.2 Tek müşteri formu

İlk görünümde yalnız şu alanlar bulunmalıdır:

- Firma/unvan veya kişi adı
- Müşteri tipi
- Yaşam evresi; varsayılan `Aday`
- Telefon veya e-posta
- Sorumlu
- Kısa ihtiyaç/not

Vergi, adres, fatura, sektör, kaynak, puanlama ve sözleşme alanları “Daha fazla bilgi” bölümünde açılmalıdır. Kayıt müşteri evresine geçirilirken eksik olan yasal/fatura alanları doğrulanmalıdır; ilk aday kaydında bunların tamamı zorunlu olmamalıdır.

### 5.3 Fırsat ayrımı

Müşteri hesabı ile satış fırsatı aynı şey değildir. Bir müşteri hesabının birden fazla fırsatı olabilir. Mevcut lead alanlarından bütçe, sıcaklık, tahmini kapanış, hizmet ve sonraki aksiyon `opportunity` kaydına taşınmalıdır.

Kazanma işlemi:

1. Fırsatta “Kazanıldı” seçilir.
2. Sistem zorunlu müşteri bilgilerini kontrol eder.
3. Aynı müşteri hesabının yaşam evresi `Müşteri` yapılır; yeni müşteri kopyası oluşturulmaz.
4. Onaylı teklif, sözleşme veya proje oluşturma seçenekleri gösterilir.
5. Dönüşüm olayı denetim izine yazılır.

Mükerrer kontrolü vergi numarası, normalize telefon, e-posta ve unvan benzerliği üzerinden yapılmalı; otomatik birleştirme yerine kullanıcıya eşleşme önerisi verilmelidir.

### 5.4 Müşteri detay sekmeleri

Özet, Yetkililer, Fırsatlar ve Teklifler, Projeler, Finans, Destek, Belgeler, Aktivite. Sekmeler boşsa sayaç `0` gösterilebilir; ayrı menü açılmaz.

## 6. Çift bölmeli Operasyon ekranı

### 6.1 Amaç

Operasyon ekranı, yoğun çalışan kullanıcının listeden kayda, kayıttan işleme geçerken yeni sekme ve sayfa açma ihtiyacını azaltır. Tam ekran masaüstü çalışma yüzeyi olmalıdır.

### 6.2 Yerleşim

| Bölge | Varsayılan genişlik | İçerik |
| --- | ---: | --- |
| Sol iş kuyruğu | %35 | Arama, kayıtlı görünüm, filtre çipleri ve satır listesi |
| Sağ işlem paneli | %65 | Seçili kaydın özeti, ilişki bilgisi, geçmişi ve izinli hızlı eylemleri |

Ayırıcı sürüklenebilir olmalı ve kullanıcı tercihi saklanmalıdır. Sol panel %30’un altına, sağ panel %50’nin altına inmemelidir.

Kuyrukta destek talepleri, görevler, bekleyen onaylar, takip zamanı gelen müşteri aksiyonları ve geciken tahsilatlar ortak tipte gösterilebilir. Her satırda yalnız başlık, ilişki, durum, sorumlu ve son tarih bulunmalıdır.

### 6.3 Hızlı işlemler

- Ata / üstlen
- Durumu ilerlet
- Onayla
- Reddet — gerekçe zorunlu
- Revizyona gönder — açıklama ve sorumlu zorunlu
- İptal et — yalnız izinli durumlarda, gerekçe zorunlu
- Not veya aktivite ekle
- İlgili tam kaydı aç

Her eylem sunucu tarafında mevcut durum, rol ve kayıt sürümüyle tekrar doğrulanmalıdır. Arayüzde butonu gizlemek tek başına yetki kontrolü sayılmaz.

### 6.4 İkinci ekran kullanımı

Sağ panelde “Odak penceresinde aç” eylemi bulunmalıdır. Bu eylem seçili kaydı yeni pencerede yalnız içerik ve eylem çubuğuyla açar. Ana pencere ve odak penceresi URL/kayıt kimliği ile senkron kalır. Aynı tarayıcıda `BroadcastChannel`, farklı cihazlarda sunucu olayı/WebSocket kullanılabilir. İkinci ekran desteği zorunlu tarayıcı iznine veya ekran algılama API’sine bağımlı olmamalıdır.

## 7. Raporlama sadeleştirmesi

### 7.1 Tek rapor yüzeyi

Rapor içi sol menü kaldırılmalıdır. `/raporlar` sayfası şu sırayı kullanır:

1. Sayfa başlığı ve çıktı eylemleri
2. Tek satır ortak filtre: dönem, kapsam, sorumlu, temizle
3. Üst yatay rapor seçimi veya açılır liste
4. En fazla dört KPI
5. En fazla iki grafik
6. Bir detay tablosu

Altı varsayılan rapor:

| Ana rapor | Birleştirdiği içerik | Varsayılan çıktı |
| --- | --- | --- |
| Satış Özeti | Aday/fırsat kaynağı, dönüşüm, teklif sonucu | 4 KPI + huni + aylık trend |
| Müşteri Sağlığı | Aktivite, destek, risk, yenileme | 4 KPI + segment + riskli müşteri tablosu |
| Proje Teslimatı | Sağlık, ilerleme, süre, kalite | 4 KPI + plan/gerçekleşen + geciken proje tablosu |
| İş ve Kapasite | Görev, zaman, kapasite, gecikme | 4 KPI + iş yükü + geciken işler tablosu |
| Nakit ve Tahsilat | Fatura, tahsilat, açık bakiye, gecikme | 4 KPI + tek karşılaştırma grafiği + müşteri bakiye tablosu |
| Hizmet ve Destek | Talep, SLA, çözüm süresi, memnuniyet | 4 KPI + trend + açık kritik talepler |

Mevcut 105 rapor tanımı ilk aşamada silinmemelidir. Her biri bu altı şablondan birinin drill-down filtresi veya dışa aktarma görünümü olarak eşlenmelidir. Yönetici için “Ayrıntılı analiz” seçeneği açılabilir; standart kullanıcıya katalog gösterilmemelidir.

### 7.2 Fatura ve tahsilat karşılaştırması

Müşteri raporundaki mevcut geniş metin ve çoklu grafik yapısı şu modele indirilmelidir:

- KPI: Toplam fatura
- KPI: Tahsil edilen
- KPI: Açık bakiye
- KPI: Tahsilat oranı
- Tek grafik: Son 12 ay için fatura ve tahsilat; iki seri, ortak eksen
- Tek tablo: Müşteri, fatura, tahsilat, açık bakiye, son vade

Grafikte müşteri isimleri yerine aylık eksen kullanılmalı; müşteri karşılaştırması tabloda yapılmalıdır. Değerin tamamı tooltip içinde, eksende kısaltılmış biçimde gösterilmelidir.

### 7.3 Görsel ve responsive kurallar

- Rapor H1: en fazla 28 px; rapor başlığı 20 px; grafik başlığı 14 px; eksen/etiket 11–12 px; KPI değeri 22–24 px.
- Grafik yüksekliği masaüstünde 260–300 px; içerik nedeniyle kontrolsüz büyümemeli.
- Grafik kapsayıcılarında `min-width:0`, `overflow:hidden`; SVG’de `viewBox` ve `preserveAspectRatio` kullanılmalı.
- 1200 px ve üzeri iki kolon; altında tek kolon.
- Uzun etiketler kısaltılmalı, tooltip tam metni göstermeli.
- Sayfa içinde yatay kaydırma oluşmamalı. Tablo gerektiğinde kendi kapsayıcısında kayabilir.
- Boş veri, `0` çizmek yerine açıklayıcı boş durum göstermeli.

### 7.4 Çıktı ve yazdırma

Her ana raporda `PDF`, `Excel/CSV` ve `Yazdır` eylemleri bulunmalıdır. PDF/yazdırma çıktısı:

- GaviaWorks başlığı ve rapor adı
- Uygulanan filtreler
- Oluşturulma tarihi ve oluşturan kullanıcı
- KPI, grafik ve tablo
- Sayfa numarası

içermelidir. Baskıda uygulama navigasyonu, filtre kontrolleri ve butonlar görünmemelidir. CSV/Excel dışa aktarımı uygulanan yetki ve filtreleri aşmamalı, işlem denetim kaydına yazılmalıdır.

## 8. Ödeme Linkleri modülü

### 8.1 İç kullanıcı sayfaları

| Sayfa | Yol | Amaç |
| --- | --- | --- |
| Ödeme linkleri listesi | `/finans/odeme-linkleri` | Link, müşteri, tutar, kalan, durum, son kullanma ve son işlem |
| Yeni ödeme linki | `/finans/odeme-linkleri/yeni` | Müşteri ve tutarla hızlı link oluşturma |
| Ödeme linki detayı | `/finans/odeme-linkleri/:id` | Paylaşım, açılma, deneme, ödeme, iptal ve iade geçmişi |
| Dış ödeme ekranı | `/odeme/:token` | Müşterinin güvenli ödeme yapması |
| Sonuç ekranları | `/odeme/:token/sonuc` | Başarılı, başarısız, beklemede, süresi dolmuş veya iptal |

### 8.2 Yeni ödeme linki formu

İlk görünümde yalnız şu alanlar yer almalıdır:

- Müşteri — zorunlu, aranabilir
- Fatura — isteğe bağlı; seçilirse kalan bakiye gösterilir
- Tutar — zorunlu, sıfırdan büyük
- Para birimi — zorunlu, şirket varsayılanı
- Açıklama — müşterinin göreceği kısa açıklama
- Son kullanma tarihi — şirket varsayılanı, değiştirilebilir
- Link Oluştur — tek birincil eylem

E-posta/SMS gönderimi, taksit, tek kullanımlı/çok kullanımlı, kısmi ödeme ve dil ayarları “Gelişmiş seçenekler” altında kapalı gelmelidir.

Link oluşturulduğunda kopyalama, e-posta/SMS ile gönderme ve QR kod eylemleri görünür. Kart bilgisi CRM formuna girilmemeli ve CRM sunucusunda ham kart verisi saklanmamalıdır.

### 8.3 Dış müşteri ödeme ekranı

Dış sayfa uygulama menüsü veya CRM bilgisi göstermemelidir. Mobil öncelikli tek kolon düzen:

- Tahsilat yapan şirketin logo ve unvanı
- Maskeli müşteri bilgisi
- Ödeme açıklaması ve varsa fatura numarası
- Tutar ve para birimi
- Güvenli ödeme sağlayıcısı bileşeni veya sağlayıcıya yönlendirme
- Aydınlatma/koşul bağlantıları
- “Güvenli Öde” butonu
- Destek iletişim bilgisi

Müşteri tarayıcıdaki başarı dönüşüyle ödenmiş kabul edilmemelidir. Kesin sonuç, ödeme sağlayıcısından gelen imzası doğrulanmış sunucu bildirimiyle belirlenmelidir.

### 8.4 Durum modeli

| Durum | Anlamı | Sonraki durum |
| --- | --- | --- |
| Taslak | Henüz paylaşıma açık değil | Aktif, İptal |
| Aktif | Ödeme kabul ediyor | Açıldı, İşlemde, Kısmi Ödendi, Ödendi, Süresi Doldu, İptal |
| Açıldı | Müşteri linki görüntüledi | İşlemde, Kısmi Ödendi, Ödendi, Süresi Doldu, İptal |
| İşlemde | Sağlayıcı sonucu bekleniyor | Aktif, Kısmi Ödendi, Ödendi, Hata |
| Kısmi Ödendi | Kalan bakiye var | İşlemde, Ödendi, Süresi Doldu, İptal |
| Ödendi | Kalan sıfır | İade Sürecinde, Kısmen İade, İade Edildi |
| Süresi Doldu | Yeni işlem kabul etmez | Yeniden Aktifleştir veya yeni link |
| İptal | Kullanıcı tarafından kapatıldı | Yeni link |
| Hata | Teknik/sağlayıcı hatası | Aktif, İptal |

### 8.5 Finansal iş kuralları

- Faturaya bağlı link tutarı varsayılan olarak kalan bakiyeyi aşamaz. Fazla tahsilat yetkisi ayrı şirket ayarı ve rol gerektirir.
- Tek faturaya bağlı ödeme yalnız o faturaya işlenir. Cari bakiye linkinde dağıtım politikası `en eski vade önce` olabilir; kullanıcı link oluşturmadan önce dağıtım önizlemesini görür.
- Başarılı sağlayıcı bildirimi tek bir `payment_transaction` kaydı oluşturur. Aynı bildirim tekrar gelirse idempotency anahtarı nedeniyle ikinci tahsilat oluşmaz.
- Fatura `Ödendi` durumu, doğrulanmış tahsilat toplamı kalan bakiyeyi sıfırladığında hesaplanır. Tarayıcıdan gelen tutar veya durum kabul edilmez.
- Kısmi ödeme açıksa ödenen tutar ve kalan ayrı gösterilir. Link tek kullanımlıysa ilk başarılı ödemeden sonra kapanır.
- İptal veya süre bitimi yeni ödeme oturumu başlatmayı engeller. Önceden başlamış sağlayıcı işlemi sonuçlanırsa mutabakat kuyruğuna düşer.
- İade ayrı yetki ve gerekiyorsa onay ister; tahsilat kaydı silinmez, ters işlem üretilir.
- Kur ve komisyon etkisi işlem anındaki değerlerle saklanır; sonradan hesaplanmaz.

### 8.6 Güvenlik ve uyum

- Dış token sıralı kimlik içermeyen, en az 128 bit entropili, tahmin edilemez değerdir; veritabanında hash olarak saklanır.
- Linkte müşteri adı, e-posta, telefon, fatura tutarı veya veritabanı kimliği açık URL parametresi olarak taşınmaz.
- Tüm uçlar HTTPS kullanır. Genel uçlara hız sınırı, başarısız deneme kontrolü ve güvenlik günlüğü uygulanır.
- Sağlayıcı webhook imzası ve zaman damgası doğrulanır; replay koruması ve idempotency zorunludur.
- Kart alanları için mümkünse sağlayıcının barındırılan ödeme sayfası veya tokenize edilmiş bileşeni kullanılır. PCI DSS kapsamı, seçilen sağlayıcı ve entegrasyon modeli için yetkili uzmanla ayrıca doğrulanmalıdır.
- 3-D Secure desteği sağlayıcı, kart ve risk politikasına göre devreye alınır.
- Tutar, para birimi, müşteri ve fatura ilişkisi her işlemde sunucudan tekrar okunur; istemci değerine güvenilmez.
- Ödeme linki oluşturma, iptal, yeniden gönderme, görüntüleme, deneme, başarı, hata, iade ve webhook olayları değişmez denetim izine yazılır.

### 8.7 Sağlayıcı bağımsız entegrasyon

Cloud uygulaması belirli bir ödeme kuruluşunu varsaymamalıdır. `PaymentProviderAdapter` sözleşmesi oluşturulmalı:

- `createCheckoutSession`
- `verifyWebhook`
- `getPaymentStatus`
- `refundPayment`
- `cancelSession` — sağlayıcı destekliyorsa

Sağlayıcı seçilmemişse gerçek kart formu taklit edilmemeli; sandbox/mock adaptörü, açıkça “test” etiketiyle kurulmalıdır. Canlı anahtarlar kodda veya istemci paketinde bulunmamalıdır.

## 9. Veri modeli ve servis sözleşmeleri

| Varlık | Temel alanlar | Kritik kural |
| --- | --- | --- |
| `customer_account` | id, lifecycle_stage, name, tax_id, owner_id, contacts | Aday ve müşteri aynı kimliği kullanır. |
| `opportunity` | customer_id, stage, value, service, next_action, close_date | Bir müşteri hesabında çoklu fırsat olabilir. |
| `quick_note` | id, owner_user_id, body, due_at, completed_at | Yalnız sahibi okuyabilir/değiştirebilir. |
| `payment_link` | id, customer_id, invoice_id, amount, currency, status, expires_at, token_hash | URL tokeni veritabanında düz metin tutulmaz. |
| `payment_attempt` | link_id, provider, session_id, requested_amount, status | Her deneme ayrı izlenir. |
| `payment_transaction` | attempt_id, provider_tx_id, amount, currency, status, paid_at | `provider_tx_id` benzersizdir. |
| `webhook_event` | provider, event_id, payload_hash, received_at, processed_at, result | `provider + event_id` benzersiz ve idempotenttir. |
| `audit_event` | actor, action, entity, before, after, ip, user_agent, time | Finansal olaylar silinemez. |

Önerilen servis uçları:

- `GET /api/customers?lifecycle_stage=ADAY`
- `POST /api/customers`
- `PATCH /api/customers/:id/lifecycle-stage`
- `GET /api/quick-notes`
- `POST /api/quick-notes`
- `PATCH /api/quick-notes/:id/toggle`
- `POST /api/payment-links`
- `GET /api/payment-links`
- `GET /api/payment-links/:id`
- `POST /api/payment-links/:id/cancel`
- `POST /api/payment-links/:id/resend`
- `GET /api/public/payment-links/:token`
- `POST /api/public/payment-links/:token/checkout-session`
- `POST /api/webhooks/payments/:provider`
- `POST /api/payment-transactions/:id/refund`
- `GET /api/reports/:reportKey/export?format=pdf|xlsx|csv`

## 10. Yetki matrisi özeti

| İşlem | Varsayılan rol | Ek kontrol |
| --- | --- | --- |
| Kendi hızlı notunu gör/yaz | Tüm iç kullanıcılar | `owner_user_id` zorunlu |
| Müşteri adayı ekle | Satış, yönetici | Atanan portföy kapsamı |
| Müşteri evresini “Müşteri” yap | Satış yöneticisi veya tanımlı rol | Zorunlu alan ve mükerrer kontrolü |
| Operasyon kuyruğu | Rolün eriştiği kayıtlar | Satır ve eylem düzeyi yetki |
| Ödeme linki oluştur | Finans, yetkili satış | Tutar limiti ve müşteri kapsamı |
| Ödeme linki iptal | Finans | İşlemde ödeme kontrolü |
| İade başlat | Finans yöneticisi | Tutar eşiğine göre ikinci onay |
| Rapor görüntüle | Rapor bazlı | Satır bazlı veri kapsamı |
| Rapor dışa aktar | Ayrı export yetkisi | Denetim kaydı ve maskeleme |

## 11. Geçiş planı

### Faz 0 — Ölçüm ve güvence

- Mevcut 149 ekran, 99 menü girdisi, 105 rapor ve kritik URL envanterini test fikstürü olarak dondur.
- Müşteri, lead, teklif, fatura, tahsilat, not ve yetki verileri için yedek/migrasyon doğrulama raporu üret.
- Eski ve yeni sayım değerlerini CI içinde kontrol et.

### Faz 1 — Yeni kabuk ve navigasyon

- Yedi çalışma alanlı menüyü feature flag altında kur.
- Küresel arama, hızlı oluşturma, takvim, onay, bildirim ve hızlı not araçlarını üst çubuğa taşı.
- Rol bazlı görünür menü testlerini ekle.

### Faz 2 — Hızlı not ve müşteri birleşimi

- Eski not verisini yeni `quick_note` görünümüne uyarlayan adapter yaz; veri silme.
- Lead kayıtlarını müşteri hesabı + fırsat yapısına idempotent göç ettir.
- Eski lead ve not URL’lerine güvenli yönlendirme ekle.

### Faz 3 — Operasyon çalışma alanı

- Ortak kuyruk sorgusunu ve split-view bileşenini kur.
- Onay, ret, revizyon ve iptal işlemlerini durum makinesi ve audit ile bağla.
- Odak penceresi senkronizasyonunu ekle.

### Faz 4 — Tek rapor yüzeyi

- Altı ana rapor şablonunu kur.
- Mevcut 105 raporu şablon filtresi/drill-down eşleme tablosuna bağla.
- PDF, Excel/CSV ve yazdırma çıktısını doğrula.

### Faz 5 — Ödeme linkleri

- Provider adapter, sandbox, token, webhook, idempotency ve mutabakat altyapısını kur.
- İç link yönetimi ve dış ödeme sayfasını ayrı güvenlik bağlamında yayınla.
- Canlı sağlayıcı seçilmeden gerçek kart verisi toplamaya başlama.

### Faz 6 — Temizlik

- Kullanım analitiğinde eski sayfalara erişim kalmadığını doğrula.
- Eski rotaları en az bir sürüm yönlendirmeyle koru.
- Yeni yapıda karşılığı doğrulanan eski menü girdilerini ve yinelenen bileşenleri kaldır.

## 12. Kabul kriterleri

| Alan | Kabul ölçütü |
| --- | --- |
| Navigasyon | Standart kullanıcı en fazla 7 alan ve 18 menü girdisi görür; günlük beş ana işe en fazla iki tıklamayla ulaşır. |
| Hızlı not | Sayfa değiştirmeden not eklenir; checkbox ile tamamlanır; başka kullanıcı API üzerinden okuyamaz. |
| Müşteri | Aday ve müşteri aynı listede filtrelenir; dönüşüm yeni müşteri kopyası üretmez. |
| Operasyon | Liste ve detay aynı ekranda çalışır; seçim, filtre ve panel genişliği korunur; odak penceresi seçili kayıtla senkron kalır. |
| Rapor | Rapor içi sol menü yoktur; her raporda en fazla 4 KPI, 2 grafik ve 1 tablo bulunur. |
| Responsive rapor | 1600, 1440, 1280, 1024, 768 ve 390 px genişliklerde sayfa yatay taşmaz; grafik etiketi kesilmez veya tooltip ile erişilir. |
| Fatura/tahsilat | Tek aylık karşılaştırma grafiği, dört KPI ve beş kolonlu müşteri bakiye tablosu görünür. |
| Çıktı | PDF, yazdırma ve CSV/Excel aynı filtreli veri kümesini verir; navigasyon çıktıya girmez. |
| Ödeme linki | Müşteri + tutar ile link oluşturulur; token tahmin edilemez; süresi dolmuş/iptal link ödeme başlatamaz. |
| Ödeme kesinliği | Tarayıcı dönüşü ödeme yaratmaz; yalnız doğrulanmış ve idempotent webhook tahsilat oluşturur. |
| Finans bağlantısı | Başarılı ödeme fatura/cari bakiyeyi tek kez günceller; kısmi ödeme ve iade ters kayıtla izlenir. |
| Veri göçü | Lead, not ve rapor sayımları öncesi/sonrası eşleşir; `legacy_id` ile izlenebilirlik korunur. |
| Güvenlik | Kart verisi CRM sunucusunda tutulmaz; sırlar sunucu gizli deposundadır; finansal işlemler audit log’a yazılır. |
| Erişilebilirlik | Klavye kullanımı, odak sırası, semantik etiketler, grafik veri alternatifi ve WCAG 2.2 AA kontrast sağlanır. |

## 13. Cloud geliştirme ortamına verilecek tek parça revizyon promptu

Aşağıdaki metin doğrudan Cloud geliştirme oturumuna verilebilir.

~~~text
GAVIAWORKS CRM — SADELEŞTİRME, OPERASYON VE ÖDEME LİNKLERİ UYGULAMA TALİMATI

Rolün:
Kıdemli ürün mimarı, UX mühendisi, backend geliştirici ve QA sorumlusu olarak çalış. Mevcut GaviaWorks CRM deposunu yerinde revize et. Sıfırdan bağımsız bir demo üretme. Mevcut tasarım tokenlarını, ortak bileşenleri, veri ilişkilerini, yetki sistemini ve kayıt kimliklerini yeniden kullan.

Ana hedef:
Mevcut sistem güçlü ancak aşırı sayfalanmış. Özellik ve veri kaybetmeden günlük kullanımı sadeleştir. 16 ana bölüm, 99 menü girdisi, 149 HTML ekranı ve 105 rapor tanımından oluşan mevcut yapıyı son kullanıcı açısından 7 çalışma alanı ve yaklaşık 18 görünür menü girdisine indir. Eski rotaları ilk aşamada silme; yeni hedeflere yönlendir ve göç doğrulaması tamamlanmadan veri kaldırma.

Zorunlu çalışma yöntemi:
1. Önce repository, mevcut menü, route, veri modeli, ortak component, role/permission ve testleri incele.
2. Bir route mapping, data migration ve risk listesi çıkar.
3. Değişiklikleri feature flag ve küçük teslimatlar halinde yap.
4. Her fazdan sonra otomatik test, responsive test, erişilebilirlik ve veri sayımı çalıştır.
5. Sadece görsel prototip bırakma; form, durum geçişi, API, yetki, audit ve hata durumlarını bağla.
6. Mevcut kullanıcı değişikliklerini ve ilgisiz dosyaları bozma.

HEDEF NAVİGASYON

Yedi çalışma alanı oluştur:
1. Gündem: Ana Panel.
2. Müşteri ve Satış: Müşteriler, Satış Akışı, Teklifler.
3. Proje ve Operasyon: Projeler, Görevler, Operasyon, Destek.
4. Finans: Faturalar, Tahsilatlar, Ödeme Linkleri, Satın Alma.
5. Ekip ve Kaynaklar: Personel, Zaman ve İzin, Varlıklar.
6. Raporlar: Tek Raporlar sayfası.
7. Ayarlar: Profil, Şirket ve Erişim, Entegrasyonlar, Sistem Kayıtları; sekmeleri role göre üret.

Üst çubukta genel arama, Yeni menüsü, takvim çekmecesi, onay, bildirim, Hızlı Not ve profil/şirket bağlamı bulunmalı. Takvim, bildirim, onay ve kişisel not için ayrı üst düzey bölüm oluşturma. Standart kullanıcının görünür menüsü 18 öğeyi aşmasın.

GÜNDEM VE HIZLI NOTLAR

app-notlarim.html ve app-not-form.html sayfalarını ana menüden kaldır. Eski URL’leri /panel?drawer=notlar hedefine yönlendir. Veriyi silme.

Panelde Hızlı Notlar kartı ve tüm sayfalarda sağ kenarda Not Al düğmesi oluştur. Düğme 360–400 px drawer açsın. Yeni not formunda yalnız not metni, isteğe bağlı tarih ve otomatik sahip bulunsun. İlk satır başlık olarak kullanılabilir. Enter kaydetsin, Shift+Enter satır açsın. Checkbox açık/tamamlandı geçişi yapsın ve 5 saniye geri alma sunsun. Tamamlanan not 24 saat sonra varsayılan görünümden gizlensin.

Yeni formda kategori, renk, öncelik, durum sekmesi, KPI, toplu işlem ve ayrı arşiv ekranı gösterme. Eski alanları geçmiş kayıt metadatası olarak koru. Not sahipliği backend/API katmanında owner_user_id ile zorunlu olsun; başka kullanıcı notu doğrudan URL veya API ile okuyamasın.

MÜŞTERİ VE ADAY MÜŞTERİ

Aday müşteriyi ayrı modül olmaktan çıkar. customer_account tek kimliği şu lifecycle_stage değerleriyle kullansın: ADAY, NITELIKLI, MUSTERI, PASIF, KAYIP. Müşteri listesinde evre kolonu ve filtre olsun. Aday yalnız nötr küçük etiketle gösterilsin; ayrı renk teması veya sayfa ailesi kullanma.

Tek müşteri formunun ilk görünümünde firma/kişi adı, müşteri tipi, yaşam evresi, telefon veya e-posta, sorumlu ve kısa ihtiyaç/not bulunsun. Vergi, adres, fatura, sektör ve diğer alanları Daha fazla bilgi bölümüne taşı. ADAY varsayılan olsun; MUSTERI evresine geçerken gerekli yasal/fatura alanlarını doğrula.

Müşteri hesabı ile satış fırsatını ayır. Lead’in bütçe, sıcaklık, hizmet, tahmini kapanış ve sonraki aksiyon alanlarını opportunity varlığına taşı. Bir müşterinin birden fazla fırsatı olabilir. Fırsat kazanıldığında mevcut customer_account MUSTERI evresine geçsin; yeni müşteri kopyası oluşmasın. Mükerrer kontrolünde vergi no, normalize telefon, e-posta ve unvan benzerliği kullan; otomatik birleştirme yapmadan eşleşme öner.

Müşteri detayında Özet, Yetkililer, Fırsatlar ve Teklifler, Projeler, Finans, Destek, Belgeler ve Aktivite sekmeleri oluştur. app-musteri-yetkili ve app-musteri-iletisim işlerini bu bağlamda drawer/modal ile yürüt.

OPERASYON EKRANI

/operasyon tam genişlikli split-view olsun. Sol %35 iş kuyruğu, sağ %65 seçili kayıt ve işlem paneli. Ayırıcı sürüklenebilir, tercih kullanıcı bazında saklanmalı. Sol panel %30’un, sağ panel %50’nin altına düşmesin.

Kuyruk görev, destek, bekleyen onay, takip zamanı gelen müşteri aksiyonu ve geciken tahsilat türlerini ortak satır modeliyle gösterebilsin. Satırda başlık, ilişki, durum, sorumlu ve son tarih bulunsun. Tür, durum, sorumlu ve tarih filtreleri ile kayıtlı görünümleri destekle.

Sağ panelde Ata/Üstlen, Durumu ilerlet, Onayla, Reddet, Revizyona gönder, İptal et, Aktivite ekle ve Tam kaydı aç eylemleri yer alsın. Ret, revizyon ve iptal gerekçesiz tamamlanmasın. Her eylem backend’de rol, mevcut durum ve record version ile yeniden doğrulansın ve audit event oluştursun.

Odak penceresinde aç eylemi ekle. Yeni pencere yalnız kayıt içeriğini ve eylem çubuğunu göstersin. Aynı tarayıcıda BroadcastChannel, farklı cihazda sunucu olayı/WebSocket ile seçili kayıt ve güncelleme senkron olsun. Çözüm ekran algılama iznine bağımlı olmasın.

RAPORLAR

app-rapor.html ve yedi app-rapor-*.html deneyimini tek /raporlar kabuğunda birleştir. Rapor içi sol menüyü tamamen kaldır. Sayfa sırası: başlık/çıktı, ortak filtre satırı, yatay rapor seçimi, en fazla 4 KPI, en fazla 2 grafik, 1 detay tablosu.

Altı varsayılan rapor oluştur: Satış Özeti, Müşteri Sağlığı, Proje Teslimatı, İş ve Kapasite, Nakit ve Tahsilat, Hizmet ve Destek. Mevcut 105 rapor tanımını silme; bunları altı şablonun drill-down filtresi veya export görünümü olarak eşle. Ayrıntılı analiz yalnız yetkili yöneticiye açılabilir.

Müşteri finans raporunu özellikle sadeleştir: Toplam Fatura, Tahsil Edilen, Açık Bakiye ve Tahsilat Oranı KPI’ları; son 12 ay için tek iki-serili fatura/tahsilat grafiği; Müşteri, Fatura, Tahsilat, Açık Bakiye ve Son Vade kolonlu tek tablo. Aynı yüzeyde gereksiz ek grafik ve uzun açıklama gösterme.

Rapor tipografisi: H1 en fazla 28 px, rapor başlığı 20 px, grafik başlığı 14 px, eksen/etiket 11–12 px, KPI değeri 22–24 px. Grafik 260–300 px yüksekliğinde olsun. min-width:0, overflow:hidden, SVG viewBox/preserveAspectRatio kullan. 1200 px üzerinde iki kolon, altında tek kolon. Uzun etiketi kısalt, tam değeri tooltipte göster. Sayfa yatay taşmasın.

Her ana rapora PDF, Excel/CSV ve Yazdır ekle. Çıktıda rapor adı, filtreler, oluşturma zamanı/kullanıcı, KPI, grafik, tablo ve sayfa no olsun. Navigasyon/butonlar baskıya girmesin. Export yetki ve satır kapsamını aşmasın ve audit log yazsın.

ÖDEME LİNKLERİ

İç yollar:
- /finans/odeme-linkleri
- /finans/odeme-linkleri/yeni
- /finans/odeme-linkleri/:id

Dış yollar:
- /odeme/:token
- /odeme/:token/sonuc

Yeni ödeme linki ilk görünümünde yalnız Müşteri, isteğe bağlı Fatura, Tutar, Para Birimi, Açıklama, Son Kullanma ve Link Oluştur bulunsun. E-posta/SMS, taksit, kısmi ödeme, tek/çok kullanım ve dil Gelişmiş seçeneklerde kapalı gelsin. Link oluşunca Kopyala, E-posta/SMS ve QR eylemleri göster.

Dış ödeme ekranı CRM menüsü göstermesin. Şirket logo/unvanı, maskeli müşteri, açıklama/fatura, tutar, sağlayıcının güvenli ödeme bileşeni veya yönlendirmesi, koşullar, Güvenli Öde ve destek bilgisi bulunsun. Ham kart verisini CRM sunucusunda saklama.

Payment link durumları: TASLAK, AKTIF, ACILDI, ISLEMDE, KISMI_ODENDI, ODENDI, SURESI_DOLDU, IPTAL, HATA; iade için IADE_SURECINDE, KISMEN_IADE, IADE_EDILDI. Geçişleri state machine ile uygula.

Finans kuralları:
- Faturaya bağlı tutar varsayılan olarak kalan bakiyeyi aşmasın.
- Tek faturaya bağlı ödeme yalnız o faturaya işlensin.
- Cari bakiye linkinde dağıtım politikasını link öncesi göster.
- Tarayıcı başarı dönüşü ödeme oluşturmasın.
- Yalnız imzası doğrulanmış provider webhook’u payment_transaction ve tahsilat oluştursun.
- provider_tx_id ve webhook event id benzersiz/idempotent olsun.
- Kısmi ödeme kalan bakiyeyi güncellesin.
- İade kayıt silmesin, ters işlem oluştursun ve role/onaya bağlı olsun.
- İptal/süre dolumu yeni oturumu engellesin; açık sağlayıcı işlemi dönerse mutabakat kuyruğuna alınsın.

Güvenlik:
- Dış token tahmin edilemez ve en az 128 bit entropili olsun; DB’de hash tut.
- URL’de PII, tutar, fatura veya sıralı DB id taşıma.
- HTTPS, rate limit, replay koruması, webhook imzası/zaman damgası ve audit zorunlu.
- İstemciden gelen müşteri, fatura, tutar, para birimi veya durum değerine güvenme; sunucudan yeniden oku.
- Sağlayıcının hosted checkout veya tokenized component çözümünü tercih et.
- 3-D Secure desteğini provider/risk politikasına göre kullan.
- API anahtarlarını server secret store’da tut; istemci paketine koyma.

PaymentProviderAdapter sözleşmesi oluştur: createCheckoutSession, verifyWebhook, getPaymentStatus, refundPayment, cancelSession. Sağlayıcı seçilmediyse gerçek kart formu taklit etme; açık TEST etiketli sandbox/mock adapter kullan.

VERİ MODELİ

En az şu varlıkları kur veya mevcut modele eşle: customer_account, opportunity, quick_note, payment_link, payment_attempt, payment_transaction, webhook_event, audit_event. payment_link içinde customer_id, invoice_id, amount, currency, status, expires_at ve token_hash; payment_transaction içinde benzersiz provider_tx_id bulunsun.

MİGRASYON

1. Mevcut menü/route/veri sayımlarını dondur.
2. Yeni kabuğu feature flag altında kur.
3. Eski notları veri kaybetmeden quick_note adapter’ına bağla.
4. Lead’leri idempotent biçimde customer_account + opportunity yapısına taşı, legacy_id tut.
5. 105 rapor için altı ana şablona eşleme üret.
6. Eski URL’leri en az bir sürüm yönlendir.
7. Analitik ve testler eski erişim kalmadığını doğrulamadan dosya/alan silme.

TEST VE KABUL

- Standart rol: en fazla 7 çalışma alanı ve 18 menü girdisi.
- Hızlı not: sayfa değiştirmeden ekleme/tamamlama; owner isolation API testi.
- Aday dönüşümü: yeni müşteri kopyası yok; müşteri kimliği korunur.
- Operasyon: split-view, klavye kullanımı, kayıt sürümü çakışması ve ikinci pencere senkron testi.
- Rapor: sol iç menü yok; en fazla 4 KPI, 2 grafik, 1 tablo.
- 1600, 1440, 1280, 1024, 768 ve 390 px’de yatay sayfa taşması yok.
- PDF, print ve CSV/XLSX aynı yetkili/filtreli veri kümesini verir.
- Süresi dolmuş/iptal payment link checkout açamaz.
- Tekrarlanan webhook ikinci tahsilat oluşturamaz.
- Başarılı ödeme fatura/cari bakiyeyi bir kez günceller; kısmi ödeme ve iade doğru izlenir.
- Kart verisi log, DB, analytics veya hata çıktısına düşmez.
- WCAG 2.2 AA, klavye odağı ve grafik veri alternatifi sağlanır.

TESLİM ÇIKTISI

Çalışma sonunda şunları bildir:
1. Değişen dosyalar ve amaçları.
2. Eski -> yeni route mapping.
3. Veri migrasyonu ve geri alma yöntemi.
4. Yetki ve güvenlik kararları.
5. Çalıştırılan testler ve sonuçları.
6. Ekran genişliği bazlı responsive sonuçları.
7. Açık kalan sağlayıcı/iş kararı ve canlıya çıkış engelleri.
~~~

## 14. Kaynaklar ve uygulama notu

- İncelenen uygulama: https://gaviaworks-dev.github.io/gaviaworks-crm/
- Kaynak depo: https://github.com/gaviaworks-dev/gaviaworks-crm
- PCI SSC, ödeme sayfası güvenliği ve e-skimming rehberi: https://blog.pcisecuritystandards.org/new-information-supplement-payment-page-security-and-preventing-e-skimming
- OWASP, üçüncü taraf ödeme geçidi entegrasyonu: https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Payment_Gateway_Integration_Cheat_Sheet.html
- OWASP, işlem yetkilendirme rehberi: https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html
- EMVCo, EMV 3-D Secure: https://www.emvco.com/emv-technologies/3-d-secure/

Bu doküman ödeme kuruluşu, acquirer, hukuki metin veya PCI doğrulama modeli seçmez. Canlı entegrasyon öncesinde sağlayıcı sözleşmesi, komisyon, taksit, iade, KVKK, mesafeli hizmet/ödeme koşulları ve PCI kapsamı ilgili uzmanlarla kesinleştirilmelidir.
