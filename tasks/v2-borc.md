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
| **V2-07** | **Müşteri tipi sözlüğü YOK** | `DB.customerTypes` hiçbir dosyada tanımlı değil **ve** `DB.customers`ın 12 kaydının hiçbirinde `tip` alanı dolu değil → 20 hesabın 20'sinde `null` | Şartname §5.2 "müşteri tipi"ni ilk görünüm alanı sayıyor. Form alanı **serbest metne** düştü. Sözlük gelince tek satırda `select`e döner. **Beyar kararı gerekiyor** |
| **V2-08** | Sıcaklık sözlüğü yok | `Sıcak/Ilık/Soğuk` yalnız `DB.leads[].sicaklik` içinde veri olarak var; fırsat formu listeyi defterden türetiyor | Düşük risk; `DB.leadTemperatures` eklenirse iki ekran tek satırda ona döner |
| **V2-09** | `DB.company.paraBirimi` yok | Ölçüldü; `odeme.js:131` de aynı düşüşü `\|\| 'TRY'` ile karşılıyor. Teklif formu dövizi teklif defterindeki tek değerden (`TRY`, 8/8) türetti | Çok dövizli teklif gerektiğinde açılır |
| **V2-10** | `risk` ve `buyukluk` için sözlük yok | Değerleri var, sözlükleri yok; formlar seçenekleri defterden türetiyor ve kaynağını yazıyor | Kabul edilebilir; sözlük gelirse türetme düşer |

## 3. Kapsam dışı bırakılan iş

| # | Madde | Karar |
|---|---|---|
| **V2-11** | **Teklif sürümleme (K-17)** — revizyon yeni kayıt üretmiyor, eski sürüm kilitlenmiyor, `versiyon` düzenlemede artmıyor | Görev tanımında açıkça kapsam dışı. Teklif detayı ve formu bunu **ekranda beyan ediyor** (BE-S3) |
| **V2-12** | **Ön analiz oluşturma yüzeyi** (rota satır 23) | Fırsat detayında ön analiz **okunuyor ve durumu ilerletiliyor**; yeni analiz açan drawer yazılmadı. Rota satırı bu notla işaretli |
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
