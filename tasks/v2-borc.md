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
| **V2-46 ✅ KAPANDI** (ölçümle doğrulandı, dilim 6) | `ui.js` ton sözlüğünde 4 personel durumu yok | `Onboarding · İzinli · Offboarding · Ayrıldı` → 7 durumun 4'ü nötr rozet basıyor, yani rozet hiçbir şey söylemiyor (`GV.pri` sorununun ikizi) |
| **V2-47** ✅ | `Gates.personelEvrak` fiilen hiç kapanmıyor | Yordam `adim.zorunlu && adim.durum !== 'Tamamlandı'` okuyor; `DB.onboarding[].adimlar` yalnız `{ad, tamam, sorumlu}` taşıyor. `Onboarding → Aktif` her zaman geçiyor — L-31 "uygulanmayan kural"  · **KAPANDI · ADR-R2-46.** Zorunluluk artık ŞABLONDAN (`DB.onboardingTemplates[].adimlar[].zorunlu`), tamamlanma ÖRNEKTEN (`adimlar[].tamam`) okunuyor; şablon `tur+tip+aktif+calismaTipi` ile çözülüyor (3/3 giriş süreci çözüldü, adım adları birebir tuttu) ve **çözülemezse kapı AÇILMIYOR**. İki yönlü ölçüldü: `EMP-016` REDDEDİLDİ (Ekipman zimmeti · Oryantasyon eğitimi), `EMP-014`/`EMP-015` GEÇTİ, `EMP-001` süreç yokluğundan ayrı gerekçeyle reddedildi; bozulmuş kopyada dört senaryo (tamam:false · adım silindi · yedek geri · şablon yok) dördü de doğru tarafa düştü. ⚠️ Ölçülen yan bulgu: `EMP-016` bugün `Aktif` ama kapı onu reddediyor — tohum veri, kapı ölçmeye başlamadan önce yapılmış bir geçiş taşıyor. |
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
| **V2-58** | **ÖLÇÜLDÜ — kaynak taraflı `zorunlu`, 17 durumda geri dönüşü daraltıyor** | Kapılar taşındı, `zorunlu` aynı kusur sınıfını taşımaya devam ediyor: kaynak durumda tanımlı, oradan çıkan HER hedefe uygulanıyor. Desen neredeyse hep aynı: `X.Taslak → [ileri · İptal Edildi]` + `zorunlu:[ileri gitmek için gereken alanlar]`. Yani **bir taslağı iptal etmek için onu göndermeye hazır hâle getirmek gerekiyor.** ⚠️ CANLI VAKA: `TKL-2026-013` müşterisi boş bir taslak teklif ve **iptal edilemiyor** (`eksik: musteri`). Motor `girisZorunlu` ile bunu çözebiliyor (K-31'de yazıldı) ama 17 durumu birden değiştirmek verilen üç kararın kapsamı dışı — **DÜZELTİLMEDİ, Beyar kararı.** `kapi-yonu.js` [7] mandalı: sayı bugünkü ölçümü (17 durum · 1 kilitli kayıt) aşarsa kırmızı yanar |

## Dilim 5 — Ayarlar turunda doğan borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-59 ✅ KAPANDI (K-36 · ADR-R2-36)** | **KAPI KUSURU — menü gizlemesi bir kapı değildi** | `dosyaIzinli()` iki yerden bozuktu: menü kaydının `roles:` listesi doğrudan adrese hiç uygulanmıyordu, `SCREEN_DENY` de **dosya adıyla** aranıyordu (sözlük **ekran adıyla** anahtarlı → arama hiç tutmuyordu). Ölçüldü (27 rol × 20 hedef, gerçek Chromium): menüde gizli olup adresle açılabilen çift **69 → 0**; `ekranAcilabilir()` yanlış `true` **254 → 0**. Üç ayar ekranını etkiliyordu; sebebi ayarlara özgü değildi |
| **V2-60 ✅ KAPANDI (K-37 · ADR-R2-37)** | **ERİŞİLEBİLİRLİK — çizim anında `scrollIntoView` odak sırasını bozuyordu** | `GV.tabs` ve `wireChipbar` etkin sekmeye/çipe çizim anında `scrollIntoView` çağırıyordu; tarayıcının sıralı odak başlangıç noktası oraya kayıyor, ilk `Tab` skip link'i, rail'i, menüyü ve üst çubuğu **atlıyordu**. `wireChipbar` yayılımı daha genişti (`GV.list` `cfg.tabs` üreten her ekran). Eksen "Tab ilerledi mi" soruyordu, "baştan mı başladı" sormuyordu — kusur eşiğin altında saklanıyordu |
| **V2-61** | Onay zinciri adımlarının 2'sinde rol anahtarı 27'lik sözlükte YOK | `DB.approvalFlows` → `AKS-SAT-1` adım 2 `rol:'finans'`, `AKS-IZN-1` adım 1 `rol:'yonetici'`. İkisi de `DB.roles`ta yok; `DB.roleName()` çözemiyor. Ekran adımın kendi `ad` alanını bastı ve uyardı — **rol adı uydurulmadı**. Bunlar bir rol mü, yoksa "bağlı yönetici" gibi bir ROL SINIFI mı? Beyar kararı |
| **V2-62** | `GV.list` KPI sözleşmesinde "**ölçülemedi**" kipi yok | `mask` `••••••` basar ("göremezsin"), oysa gereken `—` + sebep ("ölçülemedi"). §10.1 üç ayrı cümle tanımlıyor, fabrikada ikisi var. Entegrasyon ekranı `format` ile idare etti; doğru çözüm KPI'da `olculemedi` bayrağı |
| **V2-63** | `GV.hr.maas(e)` yok — maaşın maskeleyen okuyucusu yazılmamış | Özlüğün var (`GV.hr.ozluk(e, alan)` yetkisizde `••••••` döner), maaşın yok: değer `maasGorebilir()` kapısından sonra kayıttan **doğrudan** okunuyor. Kural iki ekranda tekrarlanıyor (L-40) |
| **V2-64** | Kendi kaydında bile maaş kapısı `permMatrix.maas` | Ölçüldü: `frontend` kendi profilinde `maas` alanını göremiyor (`••••••`). Kanonun bilinen sonucu, kusur değil — ama "kendi maaşını görmek" ayrı bir kapı mı olmalı? Profil ekranı maskenin altına sebebi yazdı. Beyar kararı |
| **V2-65** | `wireChipbar` `window` dinleyicisini `GV.on` ile bağlamıyor | `window.addEventListener('resize', upd)` — her `GV.refresh()` bir dinleyici daha bırakıyor (L-16). K-37 turunda görüldü, **kapsam dondurulduğu için düzeltilmedi**; ölçülmedi, gözlemlendi |
| **V2-66** | `DB.reasonCodes`ta ayar/modül kararına özgü neden türü yok | Modül anahtarı gerekçesi `tur:'istisna'` kodlarını kullanıyor (2 kod). Ayar kararları kendi neden kümesini hak ediyor olabilir |
| **V2-67** | Rota defterinin §1 özet tablosu satırlarıyla ayrışmıştı | `KARŞILIĞI VAR 44 · GÖMÜLÜYOR 91` yazıyordu, satırlar `42 · 93` diyordu; "bugün yayında 17" beş dilim boyunca güncellenmemişti (gerçek 84). **Düzeltildi** ve `ayar-ekseni [A9]` her koşumda karşılaştırıyor. Ham satır 153 / gerçek 148 farkı dosya sonundaki özet tablosunun beş kopyasıdır (6 · 66 · 79 · 123 · 133) |
| **V2-68** | ADR-R2-06 ile `arsiv` sekmesi çakışıyor | ADR-R2-06 merkezî belge arşivini **Ayarlar'ın yönetim bloğunda ayrı girdi** yapıyordu (rota 123-125, yönetici 20→21 girdi). Bu turda `app-ayar-log.html › arsiv` sekmesi **aynı yüzeyi** kapsadı (rota 145). Rota 123-124 bilerek ✅ İŞARETLENMEDİ. Beşinci ayar girdisi mi açılsın, yoksa 123-125 bu sekmeye mi gömülsün — Beyar kararı |

---

## Dilim 6 açılışında KAPANAN borç

| Borç | Kapatan karar | Ölçüm |
|---|---|---|
| **V2-68** ADR-R2-06 ile `arsiv` sekmesi çakışıyordu | beyar kararı · ADR-R2-06 **revize** | Rota 123-124 `KARŞILIĞI VAR` → **GÖMÜLÜYOR**, hedef `app-ayar-log.html › arsiv`. Beşinci ayar girdisi AÇILMADI: standart kullanıcı **17**, yönetici **20** girdi (21 olmadı). `KARŞILIĞI VAR` 43 → 41 · `GÖMÜLÜYOR` 92 → 94 · `[A9]` doğruluyor |
| **V2-61** onay zincirinde iki tanımsız rol | K-38 · ADR-R2-38 | `finans` → `muhasebe` (rol, `ad:'Muhasebe'` birebir tutuyor). `yonetici` → **rol DEĞİL ilişki**: `iliski:'yonetici'` → `DB.employees[].yonetici`. 6 adımın 6'sı çözülüyor (önce 4/6); 7 izin talebinde muhatap 3 farklı kişiye çıkıyor — `genelmudur` eşlemesinin yanlış olduğunun ölçümü bu. Sözlük genişletilmedi |
| **V2-64** kendi kaydında bile maaş kapısı `permMatrix.maas` | K-39 · ADR-R2-39 | Öz-erişim açıldı, kapı **iki yönde de ölçüldü**: kendi kaydı 3/3 açık · başkasının kaydı 3/3 reddedildi · küme sorusu (argümansız) **açılmadı** · `saatlikUcret` aynı kapıda · müşteri oturumu ayrı sebeple reddediliyor |
| **V2-63** `GV.hr.maas(e)` yok — maaşın maskeleyen okuyucusu | K-39 eki | `GV.hr.maas(e, alan)` ve `GV.hr.maasKapi(e)` yazıldı; maskenin altındaki cümle de ortak katmana taşındı (L-40). Kural iki ekranda kopyalanmıyor artık |

**Ayrıca kapatılan (ölçüm sırasında bulundu, yazılan ekranı doğrudan
bozuyordu — kapsam istisnası):**

| # | Kusur | Kapatan | Ölçüm |
|---|---|---|---|
| **V2-70** | `Gates.projeAktif` **olmayan iki alanı** okuyordu (`p.bitis` · `p.sozlesme`; `DB.projects` şemasında 14/14 kayıtta yok) → kapı 14/14 reddediyor, `istisnaRol` boş, **hiçbir proje Aktife alınamıyor** | K-40 · ADR-R2-40 | `planlananBitis` okunuyor · sözleşme bağı otorite defterden (`DB.contracts[].proje`, 6/7 dolu) · defter yüklü değilse `olculemedi:true`. Geçen **0/14 → 8/14**, reddeden 14/14 → 6/14 (altısı gerçekten sözleşmesiz kapanmış proje). Enjekte edilmiş boş kayıt hâlâ reddediliyor — kapı ölü değil. Rota 32 bu kapının arkasındaydı |

## Dilim 6'da açılan yeni borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-69** | **`AKS-IZN-1` adım 1'in muhatabı bir kayıtta ÇÖZÜLEMİYOR** | `DB.employees[].yonetici` 15/16 dolu; boş olan `EMP-001`dir (kurucu, üstü yok). O kişinin izin talebinde `adimMuhatap` `cozuldu:false` döner ve ekran sebebini basar — doğru cevap. Ama zincirin o durumda ne yapacağı (adımı ATLA · İK'ya DÜŞÜR · talebi reddet) bir **iş kuralı kararıdır** ve verilmedi. Beyar kararı |
| **V2-71** | **`aktif` alanı üç koleksiyonda daha TUZAKSIZ** | `DB.fuelLogs` (5/5 `true`) · `DB.vehicleExpenses` (8/8) · `DB.policies` (6/6). Sebebi ölçüldü: tuzak yalnız `durum` ekseni olan koleksiyonlara kuruluyor, bu üçünde `durum` alanı YOK. Zararsız — `GV.arsivli(r)` `durum` yokken `aktif`e düşüyor ve tuzağı tetiklemiyor (`DB.bayatAktif.sayac` artmıyor, ölçüldü) — ama §20.2'nin "`aktif` yalnız ÜÇ koleksiyonda kanondur" cümlesi **eksikti**; gerçek sayı altı. Brief §22.5 düzeltti. Tuzağı `durum`suz koleksiyonlara da yaymak mı, yoksa listeyi resmîleştirmek mi — karar verilmedi |
| **V2-72** | **`DB.salaryHistory` bir GEÇMİŞ DEĞİL** | 15 kaydın **15'inde** `baslangic` = `DB.today` (`2026-08-03`) ve **15'inde** `kaynak:'gozlem'`; `bitis` **0/15** (V2-44 yalnız `bitis`i ölçmüştü). Yani defter tek bir ANI taşıyor, bir zaman serisi yok. `GV.hr.icMaliyet`in üç kademeli çözümünün ikinci kademesi (`tarihi kapsayan maaş kaydı`) bugünkü veriyle **yalnız `DB.today` için** çalışıyor; geçmiş tarihli her zaman kaydı `guvenilir:false` ile bugünkü orana düşüyor. Personel detayı "maaş geçmişi" tablosu basmıyor, "1 gözlem, geçmiş kaydı yok" yazıyor. Gerçek dönem kaydı istenirse veri genişletilmeli |
| **V2-73** | **`DB.vehicles` şeması brief'te eksik yazılıydı** | 34 alan var, §20.4 "28 alan" diyordu; eksik olan altısı KİRALAMA bloğu (`kiralamaFirmasi` · `sozlesmeBas` · `sozlesmeBit` · `aylikKira` · `kmSiniri` · `depozito` — 1/4 kayıtta dolu). Brief §22.4 düzeltti. Şema sayısını ölçen bir eksen yok: brief'in alan envanteri elle yazılıyor ve kayabiliyor |
| **V2-74** | **Araç bir `GV.flow` varlığı DEĞİL** | `DB.transitions.vehicle` yok; `DB.vehicles[].durum` (`Aktif` · `Serviste`) düz alan olarak yazılıyor ve geçiş kaydı üretmiyor. Demirbaşta durum TÜRETİLMİŞ (otorite zimmet defteri), araçta ne türetilmiş ne motorlu — üçüncü bir kip. `Serviste` bir bakım kaydıyla (`DB.maintenance.durum === 'Serviste'`) çelişebilir ve kimse fark etmez. Ekranlar bunu `BE-P4` ile beyan ediyor |
| **V2-75** | **Demirbaş yaşam döngüsünün yazma tarafı YOK** | Üç yordam eksik: `hurdayaAyir` (durum sözlüğünde `Hurda` var, 1 kayıt o durumda, yordam yok) · `zimmetAc` (yeni tutanak açan yordam yok; `kabulEt` var olanı onaylar) · `iadeAl` (`iadeTarihi`/`iadeKontrol`/`eksik`/`iadeAlan` alanları veride var, 1/7 dolu, yazan yordam yok). Demirbaş detayı bu üç düğmeyi **basmıyor** ve sebebini beyan ediyor |
| **V2-76** | **Yedi araç alt defteri SALT OKUNUR** | `DB.maintenance` · `fuelLogs` · `fines` · `inspections` · `accidents` · `vehicleExpenses` · `policies` — hiçbirinin yazma yordamı yok. Araç detayı "yeni bakım ekle" düğmesi basmıyor. Filo yönetimi istenirse yedi yordam birden gerekiyor |
| **V2-77** ⚠️ **SATIRI DÜZELTİLDİ** | **Yakıt tüketimi 4 aracın 3'ünde türetilemiyor** | Eski hâli *"hiçbir araçta ardışık iki dolum yok"* diyordu ve **YANLIŞTI** — ölçüldü: `ARC-001` iki dolum taşıyor (`YKT-2026-092` km 67380 → `YKT-2026-088` km 68120, Δ740 km, 52,4 L → **7,08 L/100km**). Kalan üç araçta tek dolum var, iki `km` farkı yok. Sözleşme buna göre yazıldı (§22.13): türetilebilen araçta sayı + DAYANAK basılır, türetilemeyende `—` + gerçek sebep; KPI'ın adı "ortalama" değil **"iki dolum arası tüketim"**. ⚠️ Kalan gerçek borç: `DB.fuelLogs` **deponun dolduğunu söyleyen bir alan taşımıyor**, yani sayı "her iki dolum da tam depo" varsayımına dayanıyor ve varsayım ekranda yazılı. Alan eklenirse varsayım ölçüme döner. **Yanlış satırın bedeli:** bu satır olduğu gibi uygulansaydı türetilebilen tek sayı da basılmayacaktı — L-31'in "uygulanmayan kural" değil, "olmayan kusuru raporlayan kural" hâli |
| **V2-78** | **Kod üretimi 6 ekranda kopya ve `yeniKod` sözleşmesi yetersiz** | `domain.js` üç ayrı yerel `yeniKod` taşıyor (satır 3653 · 3869 · 4256) ve hiçbiri `GV`'ye açılmıyor; ayrıca ikisi sırayı **yalnız içinde bulunulan yılda** tarıyor, oysa altı defterde numara yıllar arasında GLOBAL ilerliyor (`DMB-2023-011` … `DMB-2026-015`). Proje defterinde yıl-içi tarama `PRJ-2026-009` üretir ama 009 numarası `PRJ-2025-009` olarak kullanılmıştır. Brief §22.2 global-max varyantını yazdı ama **her form ekranı kendi kopyasını taşıyor** — L-40. `GV.kodUret(list, onek, {yil})` ortak katmana ait |

## Dilim 6 — ekran turlarında doğan borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-79** | **`GV.form` alan sözleşmesinde `perm` / `mask` yuvası YOK** | `GV.list` `columns[]` ve `kpis[]` bunu taşıyor (`perm:` · `mask:`), `GV.form` `fields[]` ve `sections[]` **taşımıyor**. Sonuç ölçüldü: proje formu para kapısını **üç yerde birden** kurmak zorunda kaldı (`tabs` · `sections` · kaydetme listesi), satın alma formu ikide. V2-31'in (liste `filters[]` `perm` kapısı yok) form tarafındaki ikizi. Kapının arkasındaki alanı forma basmak **veri kaybıdır** (maskelenmiş `<input>` gerçek değeri ezer), yani bu yuva bir konfor değil güvenlik sözleşmesi |
| **V2-80** | **VERİ ÇELİŞKİSİ — zincir ÖRNEĞİ ile zincir TANIMI 2/7 kayıtta uyuşmuyor** | Bağımsız ölçüldü: `SAT-2026-016` (21.000 ₺) ve `SAT-2026-013` (8.400 ₺) `DB.purchaseApprovals`te **2 adım** taşıyor; yayındaki `AKS-SAT-1` tanımı o tutarlarda **1 adım** öngörüyor (2. adımın eşiği 25.000 ₺). Kalan 5 kayıtta örnek ile tanım birebir tutuyor. Hangisi kanon: şartname [6.3.2] "süreç başlatıldığında sürüm örneğe sabitlenir" diyor — yani ÖRNEK kanondur ve tanım sonradan değişmiş olabilir; ama `AKS-SAT-1` `surum:1` ve `yururluk:'2026-01-01'`, iki talep de Temmuz 2026 tarihli, yani "eski sürümle başlatıldı" açıklaması **tutmuyor**. Ekran ikisinden birini sessizce seçmiyor: uyuşmazlığı `warn` şeridiyle basıyor ve iki ölçümün kaynağını yazıyor. Eşik mi yanlış, örnek mi fazla adım taşıyor — **beyar kararı** |
| **V2-81 ✅ KAPANDI** (`[B5]` · iddia koşumu) | **Brief'in kendi imza envanterini ölçen eksen yok** | Dilim 6'da iki ajan **on dört** gerçek imzayı brief'te bulamadı; biri (`GV.fmt.days`) brief'te **yanlış** yazılıydı ve ekranda `NaN` üretti. `brief-dogrula.js` brief'te GEÇEN adların kodda var olduğunu ölçüyor — tersini, yani **kodda olup brief'te geçmeyen** ortak katman adını ölçmüyor. `GV.gates` (12 kapı yordamı) bu yüzden altı dilim boyunca brief'te hiç anılmadı ve bir ekran kapı kuralını elle kopyalamak zorunda kaldı. Eksik yön: `GV.*` yüzeyinin brief kapsamı yüzdesi |
| **V2-82** | **`Gates.izinBakiye` eksik girdide `{ok:true}` döndürüyor** | Personel/tür/tarih eksikken kapı "geçer" diyor — "ölçülemedi" demiyor (L-13). `Gates.sozlesmeAktif` ve (bu turda onarılan) `Gates.projeAktif` `olculemedi:true` bayrağını taşıyor, `izinBakiye` taşımıyor. Zararsız görünüyor çünkü geçiş anında alanlar zaten dolu olur; ama ekran kapının cevabını GÖSTERİYORSA "geçer" basmak yanlış olur. İzin formu bu yüzden kendi ölçülebilirlik sorusunu sormak zorunda kaldı — kural iki yerde |
| **V2-83** | **`GV.form` türetilmiş alanın DEĞERİNİ tazeleyemiyor** | Bileşen alan değişiminde yalnız `aside`ı yeniden çiziyor; `form.sync()` sadece `showIf`i değerlendiriyor. İzin formunda `gun` alanı `GV.calendar.isGunu`dan türüyor ve tarih değişince bayat kalıyordu; ekran alanın DOM sözleşmesine (`input[name="<key>"]`) dokunmak zorunda kaldı. Yuva: `form.setValue(key, deger)`. Aynı sınıf: V2-17 (`select` `disabled`) · V2-18 (`datalist`) · V2-32 (çoklu seçim) · V2-79 (`perm`) — `GV.form` alan sözleşmesinin beşinci boşluğu |
| **V2-84** | **`DB.holidays` yalnız İKİ YIL kapsıyor** | 14 kayıt: 2025 (7) · 2026 (7). `GV.calendar.isGunu` bu aralığın dışında hafta sonunu bilir, resmî tatili bilmez — yani 2027 tarihli bir izin talebinin iş günü sayısı sessizce FAZLA çıkar. Ekranlar beyan ediyor; takvim defteri genişletilmeli |
| **V2-85** | **`permMatrix.duzenle` kapsamının KAYIT BAZLI karşılığı yok** | Matris `'tum'`/`'departman'`/`'proje'`/`'kendi'`/`'yok'` taşıyor ama "bu kullanıcı BU kaydı düzenleyebilir mi" sorusunu ölçen bir yordam yok: `GV.guardRecord` yalnız müşteri oturumuna karşı, `GV.list` `scopeField` yalnız liste süzgeci. `GV.hr.ozlukGorebilir` bu deseni ÖZLÜK için kuruyor (`personel` kapsamından türetiyor); `duzenle` için karşılığı yazılmamış. Personel formu kendi kuralını UYDURMADI, `can('duzenle')` ile yetindi ve kapsam eksiğini beyan etti |
| **V2-86** | **`GV.form` alan sözleşmesinin BEŞ boşluğu artık bir sözleşme turunu hak ediyor** | Ölçüm: V2-17 (`select` `disabled`) · V2-18 (`datalist`/`list`) · V2-32 (çoklu seçim) · V2-79 (`perm`/`mask`) · V2-83 (`setValue`). Beşi de ayrı borç maddesi olarak açıldı ve beşi de aynı sözleşmenin (`fields[]`) eksiğidir; altı dilimde on bir ekran bunları tek tek yamaladı. Tek tek kapatmak on bir ekranı ayrı ayrı yeniden ölçmek demek — bir arada kapatılmalı |

## Dilim 6 kapanışında KAPANAN ölçüm borcu

| Borç | Kapatan | Ölçüm |
|---|---|---|
| **V2-81** brief'in bir adı YANLIŞ anlatmasını ölçen eksen yok | `brief-dogrula.js` **`[B5]` İDDİA KOŞUMU** | Dört alt kontrol: **B5.1** `DB.<kol>[].<alan>` alanı veride var mı (18 iddia) · **B5.2** dizi alana `===` / skaler alana `indexOf` — **kapsamlandırılmış**, karşılaştırma hangi koleksiyondan okuyorsa ona sorulur (8 iddia · 1058 kapsam parçası) · **B5.3** §21.11'in "dizi alanı" listesi gerçekten dizi mi (8 iddia) · **B5.4** `GV.fmt.*` örnek çağrısının argüman tipi kaynak imzasıyla tutuyor mu (14 çağrı · 29 imza kaynaktan okundu). İki yönlü sınandı: temiz kopyada **0 bulgu**, bozulmuş kopyada **5/5 kusur yakalandı**. ⚠️ **Kapsamı: alan okuma ve yordam argümanı sınıfları.** Dilim 6'nın üçüncü brief hatası (`maasGorebilir({})` — boş nesne kayıt sayılıyordu) bu eksenin sınıfında DEĞİLDİR; o, yanlış çağrının yanlış cümle üretmesini imkânsız kılarak KODDA kapatıldı (K-42) |

## Dilim 6 — son iki form turunda doğan borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-87** | **`GV.form` alan hatası, değer düzeltilince TEMİZLENMİYOR** | Ölçüldü (araç formu, gerçek Chromium): `sonrakiBakimKm` hatalı girilip mesaj basıldıktan sonra değer düzeltildi — mesaj alanda **kaldı**, yeni bir `submit()`e kadar silinmiyor. Kayıt doğru şekilde doğuyor, yani kural doğru; **görünen durum bir an için yalan söylüyor** ("bu alan hatalı" derken alan artık geçerli). `GV.form` sözleşme turunda (V2-86) kapatılacak: `input`/`change` dinleyicisi zaten var, o dalda alanın kendi hatası yeniden değerlendirilmeli |
| **V2-88** | **`GV.form` sekme dili `GV.tabs`tan FARKLI ve `ui.js`in kendi yorumu bunu YANLIŞ anlatıyor** | `GV.tabs` `data-tab` + `data-panel` kullanıyor, `GV.form` `data-ftab` + `id="fpanel_<key>"`. Fark **bilinçli ve doğru** (`GV.tabs` panelleri belge genelinde arıyor, aynı dil çakışırdı) ama `ui.js` sekme şeridinin üstündeki yorum *"GV.tabs ile aynı işaretleme … birebir aynı dil; ikinci bir sekme dili yok"* diyor — **defter–kod ayrışmasının yorum içindeki hâli** (ADR-R2-36'nın `shell.js` yorumunda bulduğu kusurun aynısı). Bir ajan ölçüm betiğini bu yoruma göre yazdı ve "her alan gizli" ölçtü. Yorum düzeltilecek, kod değil |

## Dilim 6 — detay turunda doğan borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-89** | **TÜRETİLMİŞ ÜÇLÜNÜN YALNIZ BİRİ TÜRETİLİYOR** | `GV.varlik.tazele` `zimmetli` ve `durum` yazıyor, **`zimmetTarihi` ve `iadeTarihi`ye HİÇ DOKUNMUYOR**. Bağımsız ölçüldü: `DMB-2025-004`te `zimmetTarihi:'2025-02-24'` **dolu** ama tutanak (`ZMT-2026-007`) kabul edilmediği için `zimmetli:null` ve durum `Zimmet bekliyor` — kayıt **kendi içinde çelişkili** (1/15 kayıt). Ekran alanı basıyor ve çelişkiyi **söylüyor**, düzeltmiyor (yazma yasağı doğru). ADR-R2-29'un "envanter zimmet defterinden türer" ilkesi üç alandan yalnız ikisine uygulanmış. Tarih alanlarını da türetmek mi, yoksa onları tutanağın alanı sayıp envanterden düşürmek mi — karar gerekiyor |
| **V2-90** | **`tazele` `Hurda` durumunda ERKEN DÖNÜYOR ve `zimmet:null` veriyor** | Hurda bir demirbaşın tutanağı olsa bile dönüş nesnesinden görünmez; çağıran tutanağı `zimmetOf` ile AYRICA okumak zorunda. Bugün hurda kayıtta tutanak yok, yani zararsız — ama "hurda demirbaşın geçmiş tutanağı" görüntülenmek istendiğinde iki yordam çağırmak gerekiyor ve bunu bilmeyen ekran boş sanır |
| **V2-91 ✅ KAPANDI** | ~~`app-varlik.html` bayat telafi + sözlüksüz alanda rozet~~ | İki kusur da bu turda kapatıldı: (a) ekran `dusenIddiaSatiri`nin `i-alert-triangle` döndürdüğünü söyleyip telafi ediyordu, oysa yordam artık `i-alert` döndürüyor — **defter–kod ayrışmasının yorum içindeki hâli**; (b) `GV.badge(z.iadeKontrol)` sözlüksüz bir alana rozet basıyordu (§22.17.12 ihlali) ve `app-demirbas-detay.html` aynı alanı kurala uyarak düz metin basıyordu — **iki ekran aynı alanı iki biçimde** (L-40) |

## Dilim 6 — personel kartı turunda doğan borç

| # | Madde | Ölçüm |
|---|---|---|
| **V2-92** ✅  | **`GV.hr.icMaliyet` `guvenilir` bayrağı TARİHSİZ çağrıda YANILTICI** | Ölçüldü: `icMaliyet('EMP-006')` → `guvenilir:true`, `icMaliyet('EMP-006','2025-01-01')` → `guvenilir:false`. Yani bayrak "bugünkü orana düştüm" bilgisini **taşımıyor**; yalnız `tarih` verildiğinde anlamlı. Yordamın kendi yorumu ADR-07'yi anlatıyor ("sessizce bugünü kullanmak tam da kapatılan hataydı") ama tarihsiz dalda bayrak o hatayı **görünmez kılıyor**. Ekran doğru cümleyi `kaynak` + `formul` ile kurdu; bayrağın kendisi düzeltilmeli — ya `guvenilir:false` ya üçüncü bir kip (`donemsiz:true`) | · **KAPANDI · ADR-R2-45.** Tarihsiz çağrı artık `guvenilir:false` + `donemsiz:true` dönüyor; gerekçe `neden` alanında ve ekran onu yordamdan okuyor. Beş kaynak iki yönlü ölçüldü.
| **V2-93** | **KİŞİ ekseninde düşen zimmet iddiası yordamı YOK** | `GV.varlik.dusenIddia`/`.dusenIddiaSatiri` yalnız DEMİRBAŞ ekseninde. Personel kartı "envanter bir zamanlar bu kişi için ne dedi" sorusunu cevaplamak için `DB.assetClaimDrops[].iddiaPersonel` süzgecini kendisi kurdu — kural iki yerde okunuyor (L-40). Ölçülen vaka: `EMP-009`ün hiç tutanağı yok ama envanter bir zamanlar onun için 1 iddia taşıyordu; o bilgi kaybolmamalı (K-30'un kişi tarafı) |
| **V2-94** | **`DB.onboarding[].adimlar[].tamam` yazan yordam YOK** | Giriş/çıkış sürecinin bir adımını tamamlanmış işaretlemek bir iş olayı; yordamı yazılmamış. Personel kartı adımları salt okunur basıp ilerlemeyi yalnız ölçüyor. V2-47 ile birlikte okunmalı: `Gates.personelEvrak` bu adımların `zorunlu`/`durum` alanlarını arıyor, örnek adımlar `{ad, tamam, sorumlu}` taşıyor — yani kapı hiç EVRAK ölçmüyor. Ölçüldü: giriş süreci OLAN 3 personelde (EMP-014·015·016) kapı her zaman geçiyor, olmayan 13'ünde "onboarding açılmamış" diye reddediyor | ⚠️ **AÇIK KALDI** — bu tur `Gates.personelEvrak` onarıldı (o **V2-47**'dir), `tamam` alanını YAZAN yordam hâlâ yok. Handoff §3.1 ikisini aynı numarayla andı; ölçüldü ve ayrıldı. |
| **V2-96** | **`tip:'ek'` giriş şablonları hiçbir sürece uygulanmamış** | Ölçüldü: `SBL-GIRIS-YAZILIM` (2/3 zorunlu) · `SBL-GIRIS-SATIS` (2/3) · `SBL-GIRIS-STAJYER` (2/2) üç `ek` şablonun adımlarından **hiçbiri** üç giriş sürecinin hiçbirinde yok; örneklerin adım listesi `temel` şablonla birebir. `Gates.personelEvrak` (ADR-R2-46) bu yüzden yalnız `temel` şablonu ölçer ve ek şablonun zorunlu adımını arayamaz — sınır kapının yorumunda YAZILI. Karar gerekir: ek şablon süreç açılırken mi uygulanmalı, yoksa `ek` şablonlar bir öneri listesi mi? |
| **V2-97** | **Araç ekseninde ortak yordam yok — beş eksik birden** | Araç detayı yazılırken ölçüldü ve hiçbirine yazılmadı: (1) `GV.arac.*`/`GV.filo.*` ad alanı YOK — `GV.varlik.kayit` yalnız `DB.assets` içinde arar, kayıt araması ekranda kurulmak zorunda kaldı; (2) TEK KAYIT için KPI basan ortak yordam yok — `.kpi-grid` CSS'te yayında ama JS karşılığı yalnız `GV.list`/`GV.report` İÇİNDE, işaretleme elle kuruldu; (3) `GV.tone` "sözlükte YOK" ile "sözlükte var ve BİLEREK nötr"ü ayırt edemiyor (`TONE` dışa açılmamış) — ekran temkinli tarafı seçti ve sınırı yazdı; (4) poliçe yenileme eşiği yordamı/alanı yok, 60 günlük eşik ekranın kendi kararı ve ekranda beyan edildi; (5) `vehicles.kmSiniri`nin DÖNEMİ kayıtta yok (yıllık mı, sözleşme boyu mu) — aşım hesabı türetilmedi, sebebi basıldı |
