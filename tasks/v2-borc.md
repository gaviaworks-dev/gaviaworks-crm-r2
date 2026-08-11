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

## Dilim 3 kapanışında açılan borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-31** | `GV.list` `filters[]` sözleşmesinde `perm` kapısı yok | Proje listesi para süzgecini kendi `if(canFinans)` kapısıyla kurmak zorunda kaldı |
| **V2-32** | `GV.form` `select` dalında çoklu seçim yok | `multiple` yalnız `type:'file'` dalında; `read()` tek düğüm okuyor. Görev formunda `yardimci`/`izleyiciler` çok kişilik alanlar — mevcut kayıtlarda iki kişilik listeler var. Tek seçimlik alan onları sessizce silerdi → düzenlemede **salt okunur** bilgi olarak gösterildi |
| **V2-33** | `GV.destek.guncelle` yok | Yalnız `olustur` var; destek formu düzenleme kipinde alanları doğrudan yazıyor ve kategori/öncelik değişince `sla`yı yeniden türetiyor. `pol.etiket → sla` yazımı artık iki yerde (`domain.js` + form) |
| **V2-34** | Görev tarafında atama/öncelik GERİ ALMA yordamı yok | `GV.task.ata` `emp` zorunlu; sorumluyu boşaltmak mümkün değil. Form reddediyor ve sebebini söylüyor. Aynı sınıf: öncelik silme |
| **V2-35** | **VERİ ÇELİŞKİSİ — bakım paketi seviyesi üç ayrı biçimde** | Ölçüldü: `DB.supportPackageTypes` = `['Standart Bakım','Kurumsal Bakım']` · `DB.supportPackages[].ad` = aynı uzun biçim · `DB.supportPackages[].tip` = **7/7 `'Bakım'`** (hizmetin cinsi, seviye değil) · `DB.tickets[].bakimPaketi` = **kısa biçim** (`'Standart'`/`'Kurumsal'`). `GV.destek.paketOf` `tip` ile karşılaştırıyordu ve **hiç tutmuyordu** — bu turda `ad` önekiyle düzeltildi (5/5 talep artık doğru pakete bağlanıyor), ama sözlük ile veri hâlâ iki biçimde |
| **V2-36** | `slaDurum` için sözlük yok | `DB.slaStatuses` diye bir koleksiyon yok; üç değerin kuralı `ops.js` içinde düzyazı. İki ekran bunu kayıttaki değerlerden türetmek zorunda kaldı ve sebebini yazdı |
| **V2-37** | `GV.fmt.dakika` yok | Dakika→saat okunurluk biçimi iki ekranda kopya (`app-destek-detay.html` + `app-destek-form.html`) |
| **V2-38** | `DB.impacts` brief'te yazılı değildi | `work.js` içinde 4 değerlik gerçek sözlük; destek formu kural gereği kullanmadı ve `etki` seçeneklerini kayıtlardan türetti. Brief'e eklenmeli |

## Dilim 4 açılışında KAPANAN borç

| Borç | Kapatan karar | Ölçüm |
|---|---|---|
| **K-18** İK ekran tarafı / `aktif` paralel ekseni | ADR-R2-28 | `aktif` tuzağa çevrildi · 7 çağrı yeri `GV.hr.atanabilirler()`e geçti · `ik-ekseni.js` 39 kontrol |
| **V2-35** bakım paketi seviyesi üç biçimde | K-27 · ADR-R2-26 | Kanon kısa biçim · 7 paket + 2 talep hizalandı · veri kaybı sıfır |
| **V2-28** `firsatKazan` üç ölü hedef | K-28 · ADR-R2-27 | Üçü de müşteri detayı › Finans sekmesine bağlandı |
| **zimmet kabulü çelişkisi** | ADR-R2-29 | Envanter zimmet defterinden türüyor · yüklemede 4 kayıt düzeltildi |

## Dilim 4'te açılan yeni borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-39** | `app-proje-form.html` yazılmadı ama `GV.sales.firsatKazan` "Proje oluştur" önerisi oraya bağlanıyor | Rota 32 `KARŞILIĞI VAR`. Kabuk `markWip` ile kilitliyor (sahte buton yok) ama hedef yazılmamış |
| **V2-40** | `app-satinalma-form.html` yazılmadı ama `app-satinalma.html` "Yeni Talep" düğmesi oraya bağlanıyor | Rota 115 `KARŞILIĞI VAR`. Aynı sınıf |
| **V2-41 ✅ KAPANDI (K-30 · ADR-R2-31)** | **VERİ BULGUSU — üç demirbaşta sahipsiz zimmet iddiası** | `DMB-2025-007` (EMP-009) · `DMB-2026-013` (EMP-011) · `DMB-2026-014` (EMP-012) envanterde zimmetli yazıyordu ama **hiç tutanak kaydı yok**. Tek kaynak kararı gereği envanter temizlendi; atılan iddia `GV.varlik.sonTazeleme.degisen` içinde saklı. Tutanak mı eksik, envanter mi yanlıştı — Beyar kararı |
| **V2-42 ✅ KAPANDI (K-31 · ADR-R2-32)** | `Offboarding → Aktif` kenarı yok**tu** | Yanlışlıkla çıkış sürecine alınan personel geri döndürülemez. "Geri almak yapmaktan ağır olamaz" kuralına aykırı görünüyor; kenar EKLENMEDİ, karar Beyar'ın |
| **V2-43** | Dört sözlük eksik | `vehicleStatuses` · `contractTypes` · `performanceStatuses` · `trainingStatuses` yok; ekranlar değerleri kayıtlardan türetmek ve kaynağını yazmak zorunda |
| **V2-44** | `DB.salaryHistory[].bitis` 15/15 boş | Tüm maaş kayıtları açık uçlu; "şu an geçerli maaş" hangi satır olduğu tarihten türetiliyor, alandan değil |

## Dilim 4 — ekran turlarında bulunan ek borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-45 ✅ KAPANDI (K-32 · ADR-R2-33)** | **Kaynak taraflı kapı — dört tabloda daha** | `ik-ekseni.js` genel taraması: `project.Test/Kabul` (`projeTeslim`) · `project.Kapanış` (`projeKapanis`) · `ticket.Müşteri Onayı` (`destekKota`) · `delivery.İç Kontrol` (`teslimKritikHata`). Dördü de yalnız GERİ DÖNÜŞ hedefini engelliyor (iptal/ret engellenmiyor), o yüzden kusur ilan edilmedi — ama "ileri gidemiyorsan geri de gidemezsin" bir iş kuralı tercihidir ve Beyar kararı bekliyor. Eksen her koşumda listeliyor, sessiz istisna yok |
| **V2-46** | `ui.js` ton sözlüğünde 4 personel durumu yok | `Onboarding · İzinli · Offboarding · Ayrıldı` → 7 durumun 4'ü nötr rozet basıyor, yani rozet hiçbir şey söylemiyor (`GV.pri` sorununun ikizi) |
| **V2-47** | `Gates.personelEvrak` fiilen hiç kapanmıyor | Yordam `adim.zorunlu && adim.durum !== 'Tamamlandı'` okuyor; `DB.onboarding[].adimlar` yalnız `{ad, tamam, sorumlu}` taşıyor. `Onboarding → Aktif` her zaman geçiyor — L-31 "uygulanmayan kural" |
| **V2-48** | `GV.varlik.zimmetliler` ile `Gates.personelZimmet` farklı küme ölçüyor | Biri `durum !== 'İade edildi'` (K-33'te `aktif` okuması kaldırıldı), diğeri `durum === 'Aktif' && !iadeTarihi`. Bugün aynı sonucu veriyorlar, er geç ayrışırlar |
| **V2-49** | Kabuk 403 sayfasında sprite enjekte edilmiyor | Yetkisiz rolde 22-24 `<use>` hedefi boş çiziliyor. Ekrana özgü değil, tüm ekranlarda |
| **V2-50** | `mevcut()` / seçenek türetme yardımcısı üç ekranda kopya | `app-proje` · `app-gorev` · `app-personel`. `GV.list` `filters[].optionsFromData` gibi bir yuvaya ait (L-40) |
| **V2-51** | `timelogStatuses` / `timesheetStatuses` sözlükleri yok | `DB.timelogs[].onay` ve `DB.timesheets[].durum` değerleri kayıtlardan türetilmek zorunda |
| **V2-52** | `GV.notice` `actions[]` yalnız `href` üretiyor | Çekmece açan aksiyon verilemiyor; zaman ekranı o düğümü elle kurdu |
| **V2-53** | Brief boşluğu: `GV.zaman.*` · `GV.fmt.hours/pct/days` imzasız | Beşi de gerçek; brief §9.5 / §4.3'e eklenmeli |

## Dilim 4 — Varlıklar turunda doğan borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-54** | `sozlesmeAktif` kapısı `Yenileme/Zeyil → Aktif` kenarına da bağlandı — **doğrulanmadı** | K-32 taşımasında `Aktif` hedefine üç kenar girdiği ölçüldü. `Askıda → Aktif` (geri alma) serbest bırakıldı, `İmza → Aktif` (ilk aktivasyon) kapıya bağlı kaldı. Üçüncüsü — zeylin yürürlüğe girmesi — **ödeme planını değiştirdiği için** kapıya bağlandı, ama bu bir varsayımdır: şartname [8.1.6] yalnız *aktivasyondan* söz ediyor. Zeyil onayı ayrı bir kapı mı istiyor, Beyar kararı |
| **V2-55** | `destekKota` kapısı bugünkü veriyle **hiç ateşlenmiyor** | Kotayı aşan tek talep yok. Kapı çalışıyor (enjekte edilmiş koşulla ölçüldü, `kapi-yonu.js`) ama gerçek veride hiçbir şeyi engellemiyor — yani ekranda görünmeyen bir kural. Kotayı aşan bir örnek kayıt istenirse veri genişletilmeli |
| **V2-56** | `aktif` alanı 39 koleksiyonda **veri dosyalarında hâlâ yazılı** | K-33 alanı yüklemede tuzağa çeviriyor, ama literaller `aktif:true` taşımaya devam ediyor (298 kayıt + employees). Zararsız — tuzak her açılışta kapatıyor — ama veri dosyasını okuyan biri alanın canlı olduğunu sanabilir. Literalden temizlemek 300+ satır dokunuşu demek; kapsam donduruldu |
| **V2-57** | `GV.arsivli`'nin `passive` listesi **çağrı yerinde** yaşıyor | Hangi durumun "pasif" saydığı varlığa göre değişiyor (`Hurda` demirbaşta emeklilik, `Pasif` personelde değil), o yüzden liste `cfg.passive` ile ekrandan veriliyor. Doğru ama dağınık: aynı koleksiyonu listeleyen iki ekran iki farklı liste verebilir ve kimse fark etmez. Koleksiyon başına tek tablo daha iyi olurdu; kayıt kendi koleksiyonunu bilmediği için yazılmadı |
| **V2-58** | `girisZorunlu` ve `kenarKapi` yalnız `employee` · `project` · `contract` · `ticket` tablolarında kullanıldı | Motor üç bağlama noktasını da destekliyor (`kenar → kaynak → hedef`), ama kalan 7 geçiş varlığı hiç taranmadı: orada da kaynak taraflı `zorunlu` yanlış kenarı kesiyor olabilir. `kapi-yonu.js` kapıyı ölçüyor, **`zorunlu`yu ölçmüyor** |
