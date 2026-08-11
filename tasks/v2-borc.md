# V2 Borç Defteri — Dilim 1'de bulunan, kapsam dondurulduğu için ertelenen iş

> **Kural:** bu dilimde bulunan yeni borç mevcut paydaya karıştırılmaz.
> Her madde ölçülmüş bir gözlemdir; "olabilir" yok, "ölçüldü" var.
> Kaynağı: sekiz ekran ajanının raporları + ana oturumun onarım turu.
>
> Kapatılanlar burada DEĞİL — onlar commit'lerde. Bu defter yalnız **açık** borcu taşır.
> Açılış: 11 Ağustos 2026 · Dilim 1 (Müşteri ve Satış)

---

## 1. Ortak katman — bileşen boşlukları

| # | Madde | Ölçüm | Neden ertelendi |
|---|---|---|---|
| **V2-01** | `GV.action` alan yuvası yok | Üç ekran (satış akışı · fırsat detayı · teklif detayı) kayıp nedeni seçicisini pencereye `insertAdjacentHTML` ile enjekte etmek zorunda kaldı — aynı kaçamak üç yerde | Kanca eklemek kolay, ama üç biten ekranı ona taşımak yeniden ölçüm ister. Önerilen sözleşme: `cfg.alanlar:[{key,label,type,options,required}]` → `run(veri)` içinde `veri.alanlar[key]` |
| **V2-02** | `GV.list` kart ve pano görünümünde `rowActions` şeridi basmıyor | `ui.js` `renderCards` `.gv-rcard`a `data-id` bile koymuyor; satış akışı ilerletme düğmesini `onRender` içinde kendi kancasıyla bağladı | Tablo görünümünde şerit çalışıyor; düzeltme bileşenin üç görünümünü birden etkiler |
| **V2-03** | `GV.notice` yalnız `<a href>` aksiyonu basabiliyor | Müşteri formu "Yine de yeni kayıt oluştur" düğmesini notice'ın dışına almak zorunda kaldı (`ui.js:704`) | `run` desteği eklemek notice'ı etkileşimli bir bileşene çevirir; sözleşme kararı gerekir |
| **V2-04** | `.gv-tabs` için kaydırma göstergesi yok | `.chipbar`ın `.cb-prev/.cb-next` okları var, sekme şeridinin yok; ≤1280 px'te gizli sekme sessizce kayboluyor. Müşteri detayı bu yüzden sekme ikonlarını **düşürdü** (ikonlu şerit 1.139 px, içerik sütunu 1.058 px) | Bileşen tasarımı kararı; 8 sekmeli tek ekran var, ikincisi doğduğunda ölçülür |
| **V2-05** | Backend payı listesi için genel sınıf yok | Üç ekran `.odl-gap` / `.odl-gap-kod` / `.odl-gap-bolum` kullanıyor; ad ödeme linki modülüne ait | Yeniden adlandırma (`gv-gap`) beş dosyaya dokunur |
| **V2-06** | Aşama zaman çizelgesi bileşeni yok | Fırsat detayı `.gv-checklist` ile kurdu. `GV.chain` bir ONAY zinciridir (`Onaylandı/Reddedildi/Bekliyor` sözlüğü), aşama geçmişi için semantik olarak yanlış | İkinci bir kullanıcı doğmadan bileşenleştirmek erken |

## 2. Veri katmanı — eksik sözlükler

| # | Madde | Ölçüm | Etki |
|---|---|---|---|
| ~~**V2-07**~~ **KAPANDI** (K-19 · ADR-R2-16) | ~~Müşteri tipi sözlüğü YOK~~ | `DB.customerTypes` hiçbir dosyada tanımlı değil **ve** `DB.customers`ın 12 kaydının hiçbirinde `tip` alanı dolu değil → 20 hesabın 20'sinde `null` | Şartname §5.2 "müşteri tipi"ni ilk görünüm alanı sayıyor. Form alanı **serbest metne** düştü. Sözlük gelince tek satırda `select`e döner. **Beyar kararı gerekiyor** |
| **V2-08** | Sıcaklık sözlüğü yok | `Sıcak/Ilık/Soğuk` yalnız `DB.leads[].sicaklik` içinde veri olarak var; fırsat formu listeyi defterden türetiyor | Düşük risk; `DB.leadTemperatures` eklenirse iki ekran tek satırda ona döner |
| **V2-09** | `DB.company.paraBirimi` yok | Ölçüldü; `odeme.js:131` de aynı düşüşü `\|\| 'TRY'` ile karşılıyor. Teklif formu dövizi teklif defterindeki tek değerden (`TRY`, 8/8) türetti | Çok dövizli teklif gerektiğinde açılır |
| **V2-10** | `risk` ve `buyukluk` için sözlük yok | Değerleri var, sözlükleri yok; formlar seçenekleri defterden türetiyor ve kaynağını yazıyor | Kabul edilebilir; sözlük gelirse türetme düşer |

## 3. Kapsam dışı bırakılan iş

| # | Madde | Karar |
|---|---|---|
| ~~**V2-11**~~ **KAPANDI** (K-17 · ADR-R2-17) | ~~Teklif sürümleme~~ — revizyon yeni kayıt üretmiyor, eski sürüm kilitlenmiyor, `versiyon` düzenlemede artmıyor | Görev tanımında açıkça kapsam dışı. Teklif detayı ve formu bunu **ekranda beyan ediyor** (BE-S3) |
| **V2-12** | **Ön analiz oluşturma yüzeyi** (rota satır 23) — K-20 ile KAPSAMA ALINDI (ADR-R2-20) | Fırsat detayında ön analiz **okunuyor ve durumu ilerletiliyor**; yeni analiz açan drawer yazılmadı. Rota satırı bu notla işaretli |
| **V2-13** | Komisyon satırları (rota 27-29) | Nakit ve Tahsilat raporunun drill-down'ına ait; bu dilimde değil |
| **V2-14** | Müşteri portalı kapısının sınanması | `GV.guardRecord` müşteri detayında kurulu ama `musteri` rolü `satis` alanına kabuk tarafından zaten 403 alıyor — kapı bugün **ulaşılamaz bir savunma katmanı**. Portal açıldığında tek testi o zaman yapılabilir |

## 4. Ölçüm araçlarının kendi borcu

| # | Madde | Ölçüm |
|---|---|---|
| **V2-15** | `satis-akis.js` S9 dizeleri tarıyor | Yorumlar söküldü (L-26 düzeltmesi), ama bir dize içine `x.durum = …` yazmak hâlâ bulgu üretir. Bilinçli: dizede durum ataması kurmak da kaçamaktır |
| **V2-16** | Tarayıcı ekseni odak zincirini 12 adımla sınırlıyor | `tarayici.js:217` — 74 odaklanabilir düğümü olan ekranda ilk 12'si ölçülüyor. Tam tarama koşum süresini ~6 katına çıkarır |

---

## Kapatılanlar (bu dilimde onarıldı — kayıt için)

Ortak katmanda **9 kusur** kapatıldı; hepsi ekran ajanları tarafından bulundu ve
ana oturum tarafından onarıldı:

1. Kazanma kapısı kaynak duruma bağlıydı → bir satışı **kaybetmek** için müşterinin vergi numarası gerekiyordu (`girisKapi` eklendi)
2. Aynı sınıf kusur `DB.transitions.quote`ta da vardı → bir taslağı **iptal etmek** için onaylı ön analiz gerekiyordu
3. `GV.flow.adimlar` hedefin `girisGerekce` bayrağını okumuyordu (`hk.gerekce` yazılmıştı)
4. `firsat.js` asla sonuç veremeyecek bir yönetici istisnası vaat ediyordu → vaat kaldırıldı
5. `GV.action` ikon haritasında **sprite'ta olmayan üç ad** vardı (`i-help` · `i-corner-up-left` · `i-rotate`)
6. `GV.form` `type:'url'` doğrulaması mevcut 12 kaydın 12'sini düzenlenemez yapıyordu
7. `GV.form` `readonly` sözleşmesi `money` ve `percent` dallarında hiç uygulanmıyordu
8. `GV.audit.oku` çift deftere yazılan olayı zaman çizelgesinde iki kez basıyordu
9. `GV.errorState` ölü "Tekrar dene" düğmesi basıyor ve `action` parametresini sessizce yutuyordu

Ayrıca `.gc-meta` sınıfının CSS karşılığı yazıldı (beş oturumdur kullanılıyor,
tanımı yoktu) ve evre rozeti üç ekrandaki kopyasından ortak yordama alındı
(`GV.lifecycle.rozet`).


---

## Dilim 2 açılışında kapanan borçlar (11 Ağustos 2026, ikinci tur)

| Borç | Kapatan karar | Ölçüm |
|---|---|---|
| V2-07 müşteri tipi sözlüğü | K-19 · ADR-R2-16 | `DB.customerTypes` 4 değer · form seçim listesine döndü · teyit tek bayrakta |
| V2-11 teklif sürümleme | K-17 · ADR-R2-17 | revizyon yeni kayıt · eski sürüm kilitli · fark karşılaştırılabilir · `satis-akis.js` S10, 9 kontrol |
| V2-12 ön analiz drawer'ı | K-20 · ADR-R2-20 | kapsama alındı, fırsat detayında yazılacak |
| BE-S2 yaşam evresi çapası | K-21 · ADR-R2-18 | bayat alan tuzağa çevrildi · `bayat-alan.js` 11 kontrol |

**Açık kalanlar:** V2-01 · V2-02 · V2-03 · V2-04 · V2-05 · V2-06 · V2-08 ·
V2-09 · V2-10 · V2-13 · V2-14 · V2-15 · V2-16 — on üç madde.

---

## Dilim 2'de açılan yeni borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-17** | `GV.form` select seçeneklerinde `disabled` bayrağı yok (`ui.js` metin/select dalı) | Fatura formu "faturası olan taksiti göster ama seçtirme" desenini kuramadı; seçenekleri **listeden çıkarmak** zorunda kaldı ve sebebi ipucunda yazılı. `app-fatura-detay.html` aynı deseni ham `<option disabled>` ile kuruyor — form motorunda karşılığı yok |
| **V2-18** | `GV.form` alan sözleşmesinde `datalist` yuvası yok | Tahsilat formunda yöntem alanı sözlüksüz; ölçülmüş değerleri öneri olarak sunmak için `datalist` çizimden **sonra** iliştirildi. `list:[]` yuvası ortak katmana ait |
| **V2-19** | Detay ekranı için tablo + mobil-ikiz bileşeni yok | `GV.list` liste ekranının bileşeni; detayda ikisini birlikte basan yordam yok. `app-teklif-detay.html` ve `app-fatura-detay.html` aynı yerel `tablo()` yardımcısını taşıyor — **iki kopya**, üçüncüde `ui.js`'e taşınmalı |
| **V2-20** | Sarmalayan buton satırı için sınıf yok | `.gv-drawer-foot` sarmıyor ve `flex:1` uyguluyor; satın alma ekranı 5 geçiş düğmesi için `.lh-acts`ı ödünç aldı. Genel bir `.gv-actrow` gerekiyor |
| **V2-21** | Satır uyarı tonu tek eksende | `ui.css` satır için yalnız `is-late` / `is-passive` taşıyor; "vadesi geçmiş" ile "kendi içinde çelişkili" aynı şeridi paylaşmak zorunda |
| **V2-22** | Tahsis geri alma yüzeyi yok | `GV.fin.tahsisKaldir` yordamı **var**, hiçbir ekranda yüzeye çıkmadı — gerekçe ve yetki kararı gerektiriyor |
| **V2-23** | Ödeme yöntemi ve banka/kasa hesabı sözlüğü yok | Ölçüldü: `DB.payments` 17/17 kayıtta `yontem` alanı **yok**; `DB.paymentMethods` ve hesap planı tanımlı değil. İki form da serbest metin kullandı ve sebebini yazdı |
| **V2-24** | Satın alma alt kayıtları henüz gömülmedi | Rota 116-122 (teklif toplama · siparişler · tedarikçiler) satın alma ekranının sekmeleri olacak; bu dilimde yazılmadı |
| **V2-25** | Tahsilat detay ekranı yok | Rota 71 `KARŞILIĞI VAR` ama bu dilimin kapsamında değildi; liste kod kolonu bu yüzden bağlantı taşımıyor |
| **V2-26** | Veri bulgusu: EMP-011'in departman çelişkisi | Personel kaydında `dep:'DEP-14'`, açtığı 3 talepte `dep:'DEP-17'`. `departman` kapsamı oturum departmanını kayıt departmanına eşitlediği için bu kişi kendi taleplerini departman kapsamında göremiyor. Ekranda düzeltilmedi — kapsam eşleşmesi bileşenin sözleşmesi |

**Kapanan:** V2-07 · V2-11 · V2-12 (kapsama alındı) · BE-S2.
**Açık toplam:** 13 (dilim 1'den) + 10 (dilim 2) = **23 madde**.

---

## Dilim 3 açılışında KAPANAN borç

| Borç | Kapatan karar | Ölçüm |
|---|---|---|
| **V2-22** tahsis geri alma yüzeyi | K-25 · ADR-R2-24 | Tahsilat çekmecesinde yüzeye çıktı · gerekçe zorunlu · kayıt silinmiyor, ters kayıt üretiliyor · `acilis-uc.js` 10 kontrol |
| **V2-24** satın alma alt kayıtları | K-24 · ADR-R2-23 | Rota 116-122 → dört yüzey sekmesi · teklif 9 · sipariş 4 · tedarikçi 7 satır · `acilis-uc.js` 17 kontrol |
| **V2-25** tahsilat detay ekranı | K-23 · ADR-R2-22 | Ekran **yazılmadı ve yazılmayacak** — tahsis defteri çekmece oldu. Rota 71 `KARŞILIĞI VAR` → `GÖMÜLÜYOR` olarak düzeltilmeli |

## Dilim 3'te açılan yeni borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-27** | Operasyon kuyruğunun **dokuz** satırı hâlâ hedefsiz | Ölçüldü: `app-istalebi-detay` 4 · `app-izin-detay` 2 · `app-onanaliz-detay` 1 · `app-komisyon-detay` 1 · `app-zaman-onay` 1. Beşi de bu dilimin kapsamı dışında (departman talebi Operasyon paneline, izin ve timesheet Ekip ve Kaynaklar dilimine, ön analiz fırsat detayına, komisyon müşteri detayına ait). Düğme **dürüstçe devre dışı** ve hedef dosya adı ipucunda yazılı — gizlenmedi |
| **V2-28** | `GV.sales.firsatKazan` önerileri yazılmamış üç ekrana bağlanıyor | `domain.js` `app-sozlesme-detay.html` · `app-odemeplani-detay.html` · `app-sozlesme-form.html` hedefleri üretiyor. Üçü de rota haritasında **GÖMÜLÜYOR** (müşteri detayı › Finans sekmesi) — hedefler oraya çevrilmeli. Kabuk bugün `markWip` ile kilitliyor, yani sahte buton yok ama hedef de yanlış |
| **V2-29** | `DB.supportPackages[].proje` 7/7 boş ve türetilemez | Tek dolaylı zincir (`paket.sozlesme → contract.proje`) hiçe çıkıyor. Bağı kullanıcı kurar (`GV.proje.bakimBagla`); prototipte hiçbir paket bir projeye bağlı **değil**, o yüzden proje detayının bakım bloğu 14 projenin 14'ünde boş |
| **V2-30** | Kalite sekmesi tek projede dolu | `DB.testCases` 5 kaydın 5'i `PRJ-2026-001`de. Kalan 13 projede test defteri **yok** — eksiklik değil ölçüm, ama tek projeyle sınanan bir sekme kapsamlı sınanmamış sayılır |
