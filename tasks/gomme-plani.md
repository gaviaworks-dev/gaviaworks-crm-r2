# Gömme dilimi — 39 satırın HEDEF EKRANA göre gruplanması

> 13 Ağustos 2026 · ölçülerek yazıldı. Sayılar rota defterinden ve **gerçek
> Chromium'da hedef ekranların sekme şeritlerinden** okundu, brief'ten değil.
>
> **KURAL: aynı ekrana gömülecek satırlar TEK PARÇADA ele alınır; iki ajan
> asla aynı ekrana dokunmaz.** Gruplar bu yüzden hedef ekrana göre kurulu.

## 0. ÖNCE ÖLÇÜLEN ŞEY — dokuz satırın yüzeyi ZATEN VAR

Hedef ekranların sekme şeritleri ölçüldü (`role="tab"` düğümleri):

| ekran | bugünkü sekmeler |
|---|---|
| araç detayı | Özet · **Bakım** · **Yakıt** · **Ceza** · **Muayene** · **Kaza** · **Gider** |
| personel detayı | Özet · **Performans** · **Eğitim** · **Yaşam döngüsü** · Zaman · Zimmet · Aktivite |
| proje detayı | Özet · Milestone · Sprint · Kalite · Hatalar · Değişiklik · Teslim · Belgeler · Aktivite |
| rapor | Satış Özeti · Müşteri Sağlığı · Proje Teslimatı · İş ve Kapasite · Nakit ve Tahsilat · **Hizmet ve Destek** |
| görevler | 9 kayıtlı görünüm (Tümü · Açık · Bana atanan · Geciken · Havuzda · Çalışmada · Kontrolde · Beklemede · Kapanan) |
| ayar-log | Sistem Kayıtları · **Belge Arşivi** · Veri Kalitesi |

⚠️ **Dokuz satırın hedef yüzeyi bugün YAYINDA** ve rotada işaretlenmemiş:
**101 · 103 · 105 · 107 · 109 · 111** (araç detayının altı defteri — bu turda
yazıldı) ve **83 · 84 · 86** (personel detayının Yaşam döngüsü · Performans ·
Eğitim sekmeleri — dilim 6'da yazıldı).
Bunlar için yapılacak iş **ekran yazmak değil, satırı ölçüp işaretlemektir** —
her biri açılıp gerçekten o defteri gösterdiği doğrulanmalı, sonra ✅.

---

## GRUP 1 · `app-arac-detay.html` — 12 satır (6 doğrulama + 6 BLOKE)

| satır | kaynak ekran | biçim | durum |
|---|---|---|---|
| 101 | `app-arac-bakim.html` | sekme | yüzey VAR → doğrula ve işaretle |
| 103 | `app-arac-muayene.html` | sekme | yüzey VAR |
| 105 | `app-arac-sigorta.html` | Özet › Sigorta ve poliçe bloğu | yüzey VAR |
| 107 | `app-arac-yakit.html` | sekme | yüzey VAR |
| 109 | `app-arac-gider.html` | sekme | yüzey VAR |
| 111 | `app-arac-kaza.html` | sekme (Kaza + Ceza) | yüzey VAR |
| 102 · 104 · 106 · 108 · 110 · 112 | bakım/muayene/sigorta/yakıt/gider/kaza **formları** | drawer | ⛔ **BLOKE** |

⛔ **BLOKAJ GEREKÇESİ (ölçüldü):** altı alt deftere kayıt EKLEYEN yordam
YOK (§22.16.7 · araç detayı bu yüzden salt okunur yazıldı). Drawer yazmak,
kaydetmesi olmayan bir form basmak olurdu — "sahte buton" yasağının (§14.6)
form ölçeğindeki hâli. **Önce ortak katmana yazma yordamları gerekir.**

## GRUP 2 · `app-personel-detay.html` — 4 satır (3 doğrulama + 1 drawer)

| satır | kaynak | biçim | durum |
|---|---|---|---|
| 83 | `app-personel-giris.html` | Yaşam döngüsü sekmesi | yüzey VAR → doğrula |
| 84 | `app-performans.html` | Performans sekmesi | yüzey VAR |
| 86 | `app-egitim.html` | Eğitim sekmesi | yüzey VAR |
| 85 | `app-performans-form.html` | drawer | yazılacak — yazma yordamı ölçülmeli |

## GRUP 3 · `app-proje-detay.html` — 6 satır

| satır | kaynak | biçim | not |
|---|---|---|---|
| 79 | `app-butce.html` | **Bütçe sekmesi** | sekme şeridinde YOK — gerçekten gömülecek. `GV.proje.maliyet` orada zaten okunuyor. Şartname anmıyor, §2'den ÇIKARIM |
| 35 | `app-proje-sprint-form.html` | drawer | Sprint sekmesi var, formu yok |
| 38 | `app-proje-test-form.html` | drawer | Kalite sekmesi var |
| 41 | `app-proje-hata-form.html` | drawer | Hatalar sekmesi var |
| 44 | `app-proje-degisiklik-form.html` | drawer | Değişiklik sekmesi var |
| 47 | `app-proje-teslim-form.html` | drawer | Teslim sekmesi var |

⚠️ Beş drawer için de yazma yordamının varlığı ajan açılmadan ÖNCE ölçülmeli
(Grup 1'in blokajı aynı sınıftandır).

## GRUP 4 · `app-operasyon.html` — 3 satır

| satır | kaynak | biçim | not |
|---|---|---|---|
| 51 | `app-istalebi.html` | `?tip=istalebi` kuyruk tipi | §6.2 tipleri arasında adı GEÇMİYOR; "ortak tipte gösterilebilir" hükmünden ÇIKARIM |
| 52 | `app-istalebi-detay.html` | sağ panel + tam kayıt | |
| 53 | `app-istalebi-form.html` | drawer | |

## GRUP 5 · `app-rapor.html` — 3 satır

| satır | kaynak | biçim | ADR |
|---|---|---|---|
| 27 | `app-komisyon.html` | Finans raporunda **satır** | **ADR-R2-04** (beşinci finans girdisi 18 sınırını zorlardı) |
| 28 | `app-komisyon-detay.html` | Nakit ve Tahsilat raporu drill-down | ADR-R2-04 |
| 60 | `app-destek-memnuniyet.html` | "Hizmet ve Destek" raporu ölçütü | §7.1 |

## GRUP 6 · `app-panel.html` — 2 satır

| satır | kaynak | biçim | not |
|---|---|---|---|
| 2 | `app-panel-ozet.html` | widget | §3.3 "tam ekranı yalnız derin geçmiş gerektiğinde aç" |
| 5 | `app-panel-duyurular.html` | duyuru widget'ı | |

## GRUP 7 · TOPLANTI — 4 satır, ÜÇ AYRI HEDEF ⚠️

| satır | kaynak | hedef | not |
|---|---|---|---|
| 62 | `app-toplanti.html` | panel takvimi **+** müşteri/proje detayı aktivitesi | iki ekrana birden dokunur |
| 63 | `app-toplanti-detay.html` | bağlamsal aktivite kaydı | |
| 64 | `app-toplanti-form.html` | drawer | |
| 65 | `app-toplanti-karar.html` | `app-gorev.html` kayıtlı görünümü | kararlar göreve bağlanır |

⚠️ **Bu grup "tek ekran = tek ajan" kuralını doğal olarak İHLAL EDER**: 62
panel + müşteri detayı + proje detayına dokunuyor. Grup 6 ile ÇAKIŞIR
(ikisi de panele yazar). **Sıralı ele alınmalı, paralel değil.**

## GRUP 8 · Tekil hedefler — 5 satır

| satır | kaynak | hedef | not |
|---|---|---|---|
| 23 | `app-onanaliz-form.html` | drawer | ⚠️ ön analiz OLUŞTURMA yüzeyi hiç açılmadı (V2-04) |
| 29 | `app-komisyon-form.html` | drawer | ADR-R2-04 |
| 119 | `app-siparis-form.html` | drawer | |
| 122 | `app-tedarikci-form.html` | drawer | |
| 125 | `app-dokuman-sure.html` | ⚠️ **HEDEFİ BAYAT** | satır `app-dokuman.html › Süresi Dolanlar` diyor ama `app-dokuman.html` V2-68 ile KENDİSİ gömüldü (ADR-R2-06 revizyonu → `app-ayar-log.html › Belge Arşivi`). Ölçüldü: ayar-log'da "Belge Arşivi" sekmesi VAR. En savunulabilir yorum: hedef **`app-ayar-log.html › Belge Arşivi › Süresi Dolanlar` kayıtlı görünümü**. Beyar onayına açık |

---

## DALGA SIRASI — çakışmasız, ikişerli

| dalga | ajan A | ajan B | gerekçe |
|---|---|---|---|
| 1 | GRUP 3 (proje detayı) | GRUP 5 (rapor) | farklı ekran, farklı defter |
| 2 | GRUP 4 (operasyon) | GRUP 8'in 119+122 (satın alma yüzeyi) | çakışmıyor |
| 3 | GRUP 6 (panel) | — | GRUP 7 panele de dokunduğu için TEK |
| 4 | GRUP 7 (toplantı) | — | üç hedefe birden dokunur, yalnız koşar |
| 5 | GRUP 2'nin 85'i | GRUP 8'in 23+29+125'i | |
| — | GRUP 1 · GRUP 2'nin 83·84·86 · GRUP 1'in 101–111'i | **AJAN GEREKMEZ** | yüzey zaten var; ölç ve işaretle |

**Her dalgadan sonra:** hedef ekranın ESKİ davranışı ölçülür (aynı kayıt,
aynı işlem, alan alan önce/sonra), menü girdisi **17**'de mi diye bakılır,
rota işaretlenir, `[A9]` özet denetimi koşar ve tam tarayıcı koşumu
(≈162 sn) yapılır. Ajan açıkken tarayıcı koşumu YAPILMAZ.
