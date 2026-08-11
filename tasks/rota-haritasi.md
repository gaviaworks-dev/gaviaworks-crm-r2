# Rota Haritası — R1'deki 148 ekranın her biri için hedef karar

> **Kaynak repo (dondurulmuş):** `gaviaworks-dev/gaviaworks-crm` · `main` · `36ad104`
> **Hedef repo:** `gaviaworks-dev/gaviaworks-crm-r2`
> **Şartname:** `tasks/sadelestirme-talimati.md`
>
> **Kural:** boş satır yok. 148 uygulama ekranının **her biri** bir karar taşır.
> Karar veremediğim ekran `KARAR BEKLİYOR` işaretlidir ve **sebebi yazılıdır**.
>
> Bu defter **plan değildir** — hedef karar tablosudur. Göç Beyar onayına bağlıdır.

---

## 0. Karar sözlüğü

| İşaret | Anlamı |
|---|---|
| **KARŞILIĞI VAR** | R2'de kendi ekranı olacak |
| **GÖMÜLÜYOR** | R2'de bir kaydın sekmesi / drawer'ı olacak, ayrı ekran değil |
| **YÖNLENDİRİLİYOR** | Eski adres R2'de yeni hedefe gider (hedef yazılı) |
| **YENİ** | R1'de yok, R2'de yazılacak |
| **KARAR BEKLİYOR** | Şartname sessiz ya da çelişik — Beyar kararına kadar donduruldu |
| ✅ | **bugün R2'de yayında** (dikey dilim) |

---

## 1. Sayım özeti

| Karar | Ekran | Pay |
|---|---:|---:|
| KARŞILIĞI VAR | **44** | %29,7 |
| GÖMÜLÜYOR | **84** | %56,8 |
| YÖNLENDİRİLİYOR | **11** | %7,4 |
| KARAR BEKLİYOR | **9** | %6,1 |
| **Toplam** | **148** | %100 |
| YENİ yazılacak | **6** (+2 karar bekliyor) | — |
| **Bugün R2'de yayında** | **3** | dikey dilim |

**Kapsam dışı: 0.** R1'in hiçbir ekranı "ele alınmıyor" diye bırakılmadı;
her birinin bir hedefi var. Boş bir kova için satır uydurulmadı.

R1 ölçümü (grep ile, `tasks/omurga-kaynak.md` §4.1): 148 ekran ·
16 bölüm · 86 tıklanabilir menü girdisi · 8 rapor yüzeyi · 105 rapor tanımı.

---

## 2. Gündem — Ana Panel (6 ekran)

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 1 | `app-panel.html` | **KARŞILIĞI VAR** ✅ | R2'de `app-panel.html` — Gündem. §4.1 yerleşimiyle **yeniden yazıldı**: 4 sayaç + altı kart (ajanda · iş kuyruğu · hızlı notlar · bildirimler + iki rol özeti). |
| 2 | `app-panel-ozet.html` | **GÖMÜLÜYOR** | `app-panel.html` widget'ı. §3.3: "Tam ekranı yalnız derin geçmiş gerektiğinde aç." |
| 3 | `app-panel-onaylar.html` | **GÖMÜLÜYOR** ✅ | Üst çubuk onay çekmecesi — R2'de **çalışıyor** (`gvApprove`). §3.2: "onay için ayrıca üst düzey bölüm açılmamalıdır." |
| 4 | `app-panel-bildirimler.html` | **GÖMÜLÜYOR** ✅ | Üst çubuk bildirim çekmecesi — R2'de **çalışıyor** (`gvBell`). |
| 5 | `app-panel-duyurular.html` | **GÖMÜLÜYOR** | Panel duyuru widget'ı. |
| 6 | `app-panel-yonetici.html` | **KARAR BEKLİYOR** | **Şartname bu ekranı hiç anmıyor.** §4.1 "kartlar rol bazlı varsayılan gelir" diyor — bu okumaya göre yönetici paneli ayrı ekran değil `app-panel.html`'in rol varyantıdır. R2'de rol bazlı iki özet kartı zaten bu işi yapıyor. Ayrı yönetici yüzeyi gerekiyor mu? |

---

## 3. Müşteri ve Satış (22 ekran)

### 3.1 Müşteri çekirdeği

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 7 | `app-musteri.html` | **KARŞILIĞI VAR** ✅ | R2'de yayında. Kaynak artık `DB.accounts` (20 hesap); evre kolonu + filtre + evre sekmeleri var. Aday **nötr etiket**, ayrı renk teması yok (§5.1). |
| 8 | `app-musteri-detay.html` | **KARŞILIĞI VAR** | §5.4 sekmeleri: Özet · Yetkililer · **Fırsatlar ve Teklifler** · Projeler · Finans · Destek · Belgeler · Aktivite. |
| 9 | `app-musteri-form.html` | **KARŞILIĞI VAR** | §5.2: ilk görünüm **6 alan** (ad · tip · yaşam evresi · telefon/e-posta · sorumlu · kısa ihtiyaç). Kalanı "Daha fazla bilgi" altında kapalı. Evre `ADAY` varsayılan. |

### 3.2 Lead ailesi — müşteriye katlandı

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 10 | `app-lead.html` | **YÖNLENDİRİLİYOR** | → `app-musteri.html?t=aday` — R2'de bu sekme **çalışıyor** |
| 11 | `app-lead-detay.html` | **YÖNLENDİRİLİYOR** | → `app-musteri-detay.html?id=<eşlenen hesap>` · Fırsatlar sekmesi |
| 12 | `app-lead-form.html` | **YÖNLENDİRİLİYOR** | → `app-musteri-form.html?evre=ADAY` |

> ⚠️ **Ölçülmüş göç kuralı** — `assets/data/lifecycle.js` bunu uyguluyor:
> `LEAD-2026-001/002/005/008` mevcut müşteriyle **aynı firma adını** taşıyor
> ve `musteri` alanı doludur. Bu dördü için yeni hesap **açılmaz**.
> Doğru sonuç **20 hesap + 12 fırsat** (naif göçün ürettiği 24 değil).
> Her hesap `legacy_id` + `legacy_kaynak` taşır; müşteri listesinde iki gizli
> kolon (`Kaynak kayıt`, `Evre türetmesi`) bunu görünür kılar.

### 3.3 Müşteri alt kayıtları

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 13 | `app-musteri-yetkili.html` | **GÖMÜLÜYOR** | → müşteri detayı › Yetkililer sekmesi (§3.3) |
| 14 | `app-musteri-yetkili-form.html` | **GÖMÜLÜYOR** | → aynı sekmede drawer/modal |
| 15 | `app-musteri-iletisim.html` | **GÖMÜLÜYOR** | → müşteri detayı › Aktivite sekmesi |
| 16 | `app-musteri-iletisim-form.html` | **GÖMÜLÜYOR** | → aynı sekmede drawer/modal |

### 3.4 Satış akışı

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 17 | `app-pipeline.html` | **KARŞILIĞI VAR** | R2'de `app-satis-akisi.html` — §3.1'deki "Satış Akışı". Ekseni lead'den **fırsata** döner: kart artık `DB.opportunities` kaydıdır (12 kayıt türetildi). |
| 18 | `app-teklif.html` | **KARŞILIĞI VAR** | §3.1'de kendi menü girdisi var |
| 19 | `app-teklif-detay.html` | **KARŞILIĞI VAR** | ⚠️ R1'in **teklif sürümleme borcu** açık geldi: revizyon yeni kayıt üretmiyor. R2'de kapatılacak mı? → `tasks/riskler-ve-kapsam.md` K-17 |
| 20 | `app-teklif-form.html` | **KARŞILIĞI VAR** | — |
| 21 | `app-onanaliz.html` | **GÖMÜLÜYOR** | §3.1: ön analiz "Müşteri ve Satış" altında birleştirilen içerik → müşteri/fırsat detayı sekmesi |
| 22 | `app-onanaliz-detay.html` | **GÖMÜLÜYOR** | → aynı sekme |
| 23 | `app-onanaliz-form.html` | **GÖMÜLÜYOR** | → drawer |

### 3.5 Referans ve komisyon — şartname sessiz

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 24 | `app-referans.html` | **KARAR BEKLİYOR** | Yedi çalışma alanının hiçbirinde karşılığı yok. 10 rapor kaydı var (`Yönlendirme` kategorisi). Müşteri ve Satış altına mı, müşteri detayı sekmesine mi? |
| 25 | `app-referans-detay.html` | **KARAR BEKLİYOR** | Aynı sebep |
| 26 | `app-referans-form.html` | **KARAR BEKLİYOR** | Aynı sebep |
| 27 | `app-komisyon.html` | **KARAR BEKLİYOR** | Komisyon bir finansal yükümlülük; Finans'ın §3.1'deki dört girdisi **dolu** (Faturalar · Tahsilatlar · Ödeme Linkleri · Satın Alma). Beşinci girdi 18 sınırını zorlar. |
| 28 | `app-komisyon-detay.html` | **KARAR BEKLİYOR** | Aynı sebep |
| 29 | `app-komisyon-form.html` | **KARAR BEKLİYOR** | Aynı sebep |

---

## 4. Proje ve Operasyon (24 ekran + 1 yeni)

### 4.1 Proje çekirdeği

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 30 | `app-proje.html` | **KARŞILIĞI VAR** | §3.1 menü girdisi |
| 31 | `app-proje-detay.html` | **KARŞILIĞI VAR** | §3.3: milestone/sprint/test/hata/değişiklik/teslim **sekmeleri** buraya gelir. R1'de 111 KB'lık ekran daha da büyür → tembel sekme yüklemesi gerekir (risk R-04). |
| 32 | `app-proje-form.html` | **KARŞILIĞI VAR** | — |

### 4.2 Proje alt kayıtları — §3.3 birebir hüküm

> §3.3: "Liste erişimini proje bağlamına taşı; **küresel çapraz listeyi
> Operasyon filtresi olarak koru.**"

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 33 | `app-proje-milestone.html` | **GÖMÜLÜYOR** | proje detayı › Milestone sekmesi + `/operasyon?tip=milestone` |
| 34 | `app-proje-sprint.html` | **GÖMÜLÜYOR** | proje detayı › Sprint sekmesi |
| 35 | `app-proje-sprint-form.html` | **GÖMÜLÜYOR** | drawer |
| 36 | `app-proje-test.html` | **GÖMÜLÜYOR** | proje detayı › Kalite sekmesi |
| 37 | `app-proje-test-detay.html` | **GÖMÜLÜYOR** | aynı sekmede kayıt görünümü |
| 38 | `app-proje-test-form.html` | **GÖMÜLÜYOR** | drawer |
| 39 | `app-proje-hata.html` | **GÖMÜLÜYOR** | proje detayı › Hatalar + `/operasyon?tip=hata` |
| 40 | `app-proje-hata-detay.html` | **GÖMÜLÜYOR** | aynı sekme |
| 41 | `app-proje-hata-form.html` | **GÖMÜLÜYOR** | drawer |
| 42 | `app-proje-degisiklik.html` | **GÖMÜLÜYOR** | proje detayı › Değişiklik sekmesi |
| 43 | `app-proje-degisiklik-detay.html` | **GÖMÜLÜYOR** | aynı sekme |
| 44 | `app-proje-degisiklik-form.html` | **GÖMÜLÜYOR** | drawer |
| 45 | `app-proje-teslim.html` | **GÖMÜLÜYOR** | proje detayı › Teslim sekmesi |
| 46 | `app-proje-teslim-detay.html` | **GÖMÜLÜYOR** | aynı sekme |
| 47 | `app-proje-teslim-form.html` | **GÖMÜLÜYOR** | drawer |

### 4.3 Görev — 9 menü girdisi 1'e indi

> R1 ölçümü: `?t=` taşıyan 10 menü girdisinin **9'u** `app-gorev.html`'e
> gidiyordu. §3.3: "Görev sekme varyasyonları → `/gorevler?gorunum=…`"

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 48 | `app-gorev.html` | **KARŞILIĞI VAR** | Tek liste. R2 menüsünde **tek girdi**: "Görevler". 9 sekme kayıtlı görünüme indi. |
| 49 | `app-gorev-detay.html` | **KARŞILIĞI VAR** | — |
| 50 | `app-gorev-form.html` | **KARŞILIĞI VAR** | — |

### 4.4 Departman talepleri

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 51 | `app-istalebi.html` | **GÖMÜLÜYOR** | → `/operasyon?tip=istalebi`. §6.2 kuyruk tipleri arasında adı geçmiyor ama "ortak tipte gösterilebilir" hükmüne düşer. **Çıkarım** — şartnamede birebir yazmıyor. |
| 52 | `app-istalebi-detay.html` | **GÖMÜLÜYOR** | Operasyon sağ paneli + tam kayıt |
| 53 | `app-istalebi-form.html` | **GÖMÜLÜYOR** | drawer |

### 4.5 Destek

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 54 | `app-destek.html` | **KARŞILIĞI VAR** | §3.1'de kendi menü girdisi var |
| 55 | `app-destek-detay.html` | **KARŞILIĞI VAR** | — |
| 56 | `app-destek-form.html` | **KARŞILIĞI VAR** | — |
| 57 | `app-destek-sla.html` | **GÖMÜLÜYOR** | destek kayıtlı görünümü + "Hizmet ve Destek" raporu (§7.1: SLA o şablonun ölçütü) |
| 58 | `app-destek-paket.html` | **GÖMÜLÜYOR** | müşteri detayı › Destek sekmesi. §2 "bağlamsal işlemler" ilkesinden **çıkarım** |
| 59 | `app-destek-paket-form.html` | **GÖMÜLÜYOR** | drawer |
| 60 | `app-destek-memnuniyet.html` | **GÖMÜLÜYOR** | "Hizmet ve Destek" raporu (§7.1: memnuniyet o şablonun ölçütü) |

### 4.6 Toplantı ve ajanda

> §3.3: "Toplantı, ajanda ve kararlar → Panel takvimi + ilgili müşteri/proje
> detayı." §3.2: "Takvim… için ayrıca üst düzey bölüm açılmamalıdır."

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 61 | `app-ajanda.html` | **GÖMÜLÜYOR** ✅ | Üst çubuk takvim çekmecesi — R2'de **çalışıyor** (`gvCal`). R1'de menüde **iki kez** listeliydi (`panel › Ajanda`, `toplanti › Takvim`); ikisi de düştü. |
| 62 | `app-toplanti.html` | **GÖMÜLÜYOR** | panel takvimi + müşteri/proje detayı aktivitesi |
| 63 | `app-toplanti-detay.html` | **GÖMÜLÜYOR** | bağlamsal aktivite kaydı |
| 64 | `app-toplanti-form.html` | **GÖMÜLÜYOR** | drawer |
| 65 | `app-toplanti-karar.html` | **GÖMÜLÜYOR** | kararlar göreve bağlanır (`app-gorev.html` kayıtlı görünümü) |

### 4.7 Sohbet

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 66 | `app-sohbet.html` | **KARAR BEKLİYOR** | **Yedi çalışma alanının hiçbirinde iletişim/sohbet yok; §3.2 üst çubuk araçlarında da yok.** Modül kapanıyor mu, üst çubuğa mı taşınıyor, yoksa Proje ve Operasyon'a mı giriyor? Şartname tamamen sessiz. |

### 4.8 YENİ — Operasyon

| # | Dosya | Karar | Kaynak |
|---|---|---|---|
| **Y1** | `app-operasyon.html` | **YENİ** | §6 çift bölmeli ekran. Sol %35 kuyruk / sağ %65 işlem paneli, sürüklenebilir ayırıcı (sol ≥%30, sağ ≥%50), tercih saklanır. Kuyruk: destek · görev · bekleyen onay · takip zamanı gelen müşteri aksiyonu · geciken tahsilat. Sekiz hızlı eylem. "Odak penceresinde aç" + `BroadcastChannel`. |

---

## 5. Finans (13 ekran + 5 yeni)

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 67 | `app-fatura.html` | **KARŞILIĞI VAR** | §3.1 menü girdisi |
| 68 | `app-fatura-detay.html` | **KARŞILIĞI VAR** | Ödeme linki sekmesi eklenir (§8.5 faturaya bağlı link) |
| 69 | `app-fatura-form.html` | **KARŞILIĞI VAR** | — |
| 70 | `app-tahsilat.html` | **KARŞILIĞI VAR** | §3.1 menü girdisi |
| 71 | `app-tahsilat-detay.html` | **KARŞILIĞI VAR** | — |
| 72 | `app-tahsilat-form.html` | **KARŞILIĞI VAR** | — |
| 73 | `app-sozlesme.html` | **GÖMÜLÜYOR** | §3.1: "Sözleşme ve ödeme planı **sekmeleri**" → müşteri detayı › Finans |
| 74 | `app-sozlesme-detay.html` | **GÖMÜLÜYOR** | aynı sekme |
| 75 | `app-sozlesme-form.html` | **GÖMÜLÜYOR** | drawer |
| 76 | `app-odemeplani.html` | **GÖMÜLÜYOR** | §3.1 aynı hüküm → müşteri/sözleşme Finans sekmesi |
| 77 | `app-odemeplani-detay.html` | **GÖMÜLÜYOR** | aynı sekme |
| 78 | `app-odemeplani-form.html` | **GÖMÜLÜYOR** | drawer |
| 79 | `app-butce.html` | **GÖMÜLÜYOR** | proje detayı › Bütçe sekmesi (`GV.proje.maliyet` orada zaten okunuyor). Şartname anmıyor; §2'den **çıkarım** |

### 5.1 YENİ — Ödeme Linkleri

> §8.7 kuralı **birebir uygulanır**: sağlayıcı seçilmediği için gerçek kart
> formu **taklit edilmez**. Açıkça **TEST** etiketli mock adapter kurulur.
> `PaymentProviderAdapter` sözleşmesi (`createCheckoutSession` · `verifyWebhook`
> · `getPaymentStatus` · `refundPayment` · `cancelSession`) arayüz olarak
> yazılır, gövdesi sandbox'tır.

| # | Dosya | Karar | Kaynak |
|---|---|---|---|
| **Y2** | `app-odeme-linki.html` | **YENİ** | §8.1 liste: link · müşteri · tutar · kalan · durum · son kullanma · son işlem |
| **Y3** | `app-odeme-linki-form.html` | **YENİ** | §8.2 ilk görünüm 6 alan + tek birincil eylem; gelişmiş seçenekler kapalı |
| **Y4** | `app-odeme-linki-detay.html` | **YENİ** | §8.1 paylaşım · açılma · deneme · ödeme · iptal · iade geçmişi |
| **Y5** | `app-odeme.html` | **YENİ** | §8.3 dış müşteri ekranı — **`shell.js` YÜKLENMEZ**, CRM menüsü yok, mobil öncelikli tek kolon, TEST etiketi zorunlu |
| **Y6** | `app-odeme-sonuc.html` | **YENİ** | §8.1 başarılı · başarısız · beklemede · süresi dolmuş · iptal |

---

## 6. Ekip ve Kaynaklar (25 ekran)

### 6.1 Personel

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 80 | `app-personel.html` | **KARŞILIĞI VAR** | ⚠️ R1'in açık borcu geldi: `durum` alanı hiçbir ekranda okunmuyor, `aktif` boolean'ı paralel duruyor (P3-06). R2'de kapatılacak mı? → K-18 |
| 81 | `app-personel-detay.html` | **KARŞILIĞI VAR** | Performans · eğitim · yaşam döngüsü sekmeleri buraya gelir |
| 82 | `app-personel-form.html` | **KARŞILIĞI VAR** | — |
| 83 | `app-personel-giris.html` | **GÖMÜLÜYOR** | §3.1 "işe giriş/çıkış" birleştirilen içerik → personel detayı › Yaşam Döngüsü (`employee` 15. geçiş varlığı `domain.js`'te hazır) |
| 84 | `app-performans.html` | **GÖMÜLÜYOR** | §3.1 aynı hüküm → personel detayı › Performans |
| 85 | `app-performans-form.html` | **GÖMÜLÜYOR** | drawer |
| 86 | `app-egitim.html` | **GÖMÜLÜYOR** | §3.1 aynı hüküm → personel detayı › Eğitim |

### 6.2 Zaman ve İzin — tek menü girdisi

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 87 | `app-izin.html` | **KARŞILIĞI VAR** | "Zaman ve İzin" girdisinin bir sekmesi |
| 88 | `app-izin-detay.html` | **KARŞILIĞI VAR** | — |
| 89 | `app-izin-form.html` | **KARŞILIĞI VAR** | — |
| 90 | `app-zaman.html` | **KARŞILIĞI VAR** | "Zaman ve İzin" girdisinin diğer sekmesi |
| 91 | `app-zaman-onay.html` | **GÖMÜLÜYOR** | `app-zaman.html` sekmesi + `/operasyon?tip=onay` |
| 92 | `app-kapasite.html` | **GÖMÜLÜYOR** | §3.1 "kapasite" birleştirilen içerik → "İş ve Kapasite" raporu (§7.1 şablonu birebir bu) |

### 6.3 Varlıklar

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 93 | `app-demirbas.html` | **KARŞILIĞI VAR** | "Varlıklar" girdisinin bir sekmesi |
| 94 | `app-demirbas-detay.html` | **KARŞILIĞI VAR** | — |
| 95 | `app-demirbas-form.html` | **KARŞILIĞI VAR** | — |
| 96 | `app-zimmet.html` | **GÖMÜLÜYOR** | "Varlıklar" › Zimmet sekmesi. ⚠️ R1'in **zimmet kabulü çelişkisi** açık geldi → K-19 |
| 97 | `app-zimmet-form.html` | **GÖMÜLÜYOR** | drawer |
| 98 | `app-arac.html` | **GÖMÜLÜYOR** | "Varlıklar" › Filo sekmesi |
| 99 | `app-arac-detay.html` | **KARŞILIĞI VAR** | Altı alt kaydın sekmesini R1'de zaten taşıyor — bu revizyonun istediği yapının **çalışan emsali** |
| 100 | `app-arac-form.html` | **KARŞILIĞI VAR** | — |

### 6.4 Araç alt ekranları — R1'de zaten gömülü

> R1 REVİZE 19'da bu altı alan menüden kaldırıldı ve araç detayında **sekme**
> oldu; dosyalar `BUILT`'te kaldı, doğrudan adresle açılıyor. Şartnamenin
> istediği dönüşüm burada **bir tur önce yapılmış**. R2'de aynı biçimde
> araç detayının sekmesi olarak sürer.

| # | R1 ekranı | Karar |
|---|---|---|
| 101 | `app-arac-bakim.html` | **GÖMÜLÜYOR** → araç detayı › Bakım |
| 102 | `app-arac-bakim-form.html` | **GÖMÜLÜYOR** → drawer |
| 103 | `app-arac-muayene.html` | **GÖMÜLÜYOR** → araç detayı › Muayene |
| 104 | `app-arac-muayene-form.html` | **GÖMÜLÜYOR** → drawer |
| 105 | `app-arac-sigorta.html` | **GÖMÜLÜYOR** → araç detayı › Sigorta |
| 106 | `app-arac-sigorta-form.html` | **GÖMÜLÜYOR** → drawer |
| 107 | `app-arac-yakit.html` | **GÖMÜLÜYOR** → araç detayı › Yakıt |
| 108 | `app-arac-yakit-form.html` | **GÖMÜLÜYOR** → drawer |
| 109 | `app-arac-gider.html` | **GÖMÜLÜYOR** → araç detayı › Giderler |
| 110 | `app-arac-gider-form.html` | **GÖMÜLÜYOR** → drawer |
| 111 | `app-arac-kaza.html` | **GÖMÜLÜYOR** → araç detayı › Kaza ve Ceza |
| 112 | `app-arac-kaza-form.html` | **GÖMÜLÜYOR** → drawer |

---

## 7. Satın Alma (10 ekran)

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 113 | `app-satinalma.html` | **KARŞILIĞI VAR** | §3.1 Finans altında kendi girdisi. R1'in ayrı "Onay Bekleyenler" girdisi (`?t=onay`) kayıtlı görünüme indi. |
| 114 | `app-satinalma-detay.html` | **KARŞILIĞI VAR** | — |
| 115 | `app-satinalma-form.html` | **KARŞILIĞI VAR** | — |
| 116 | `app-satinalma-teklif.html` | **GÖMÜLÜYOR** | satın alma detayı › Teklif Toplama sekmesi |
| 117 | `app-siparis.html` | **GÖMÜLÜYOR** | §3.1 "tedarik/sipariş akışları" → Satın Alma › Siparişler |
| 118 | `app-siparis-detay.html` | **GÖMÜLÜYOR** | aynı sekme |
| 119 | `app-siparis-form.html` | **GÖMÜLÜYOR** | drawer |
| 120 | `app-tedarikci.html` | **GÖMÜLÜYOR** | §3.1 aynı hüküm → Satın Alma › Tedarikçiler |
| 121 | `app-tedarikci-detay.html` | **GÖMÜLÜYOR** | aynı sekme |
| 122 | `app-tedarikci-form.html` | **GÖMÜLÜYOR** | drawer |

---

## 8. Doküman (3 ekran)

> §3.3: "Doküman merkezi alt sayfaları → Kayıt detayındaki Belgeler sekmesi
> + yönetici arşivi. Günlük belge eklemeyi bağlama taşı; **merkezi arşivi
> arama/yönetim için tut.**"

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 123 | `app-dokuman.html` | **KARŞILIĞI VAR** | Yönetici arşivi olarak sürer. ⚠️ **Menü konumu belirsiz** — yedi çalışma alanının hiçbirinde "Belgeler" yok. Ekranın kaderi net, adresi değil → K-05 |
| 124 | `app-dokuman-detay.html` | **KARŞILIĞI VAR** | Arşiv kayıt görünümü |
| 125 | `app-dokuman-sure.html` | **GÖMÜLÜYOR** | `app-dokuman.html` › Süresi Dolanlar kayıtlı görünümü |

---

## 9. Raporlar (8 ekran)

> §7.1: "Rapor içi sol menü **kaldırılmalıdır**." Tek `/raporlar` kabuğu,
> en fazla 4 KPI + 2 grafik + 1 tablo. 105 rapor tanımı **silinmez**;
> altı şablonun drill-down filtresi / export görünümü olarak eşlenir.

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 126 | `app-rapor.html` | **KARŞILIĞI VAR** | Tek rapor yüzeyi — **içi baştan yazılır**. §7.1 sırası: başlık/çıktı → ortak filtre → yatay rapor seçimi → ≤4 KPI → ≤2 grafik → 1 tablo |
| 127 | `app-rapor-musteri.html` | **YÖNLENDİRİLİYOR** | → `app-rapor.html?rapor=musteri-sagligi` (14 kayıt) |
| 128 | `app-rapor-finans.html` | **YÖNLENDİRİLİYOR** | → `?rapor=nakit-tahsilat` + `?rapor=satis-ozeti` (18 kayıt ikiye bölünür) |
| 129 | `app-rapor-proje.html` | **YÖNLENDİRİLİYOR** | → `?rapor=proje-teslimati` (12 kayıt) |
| 130 | `app-rapor-gorev.html` | **YÖNLENDİRİLİYOR** | → `?rapor=is-kapasite` (19 kayıt) |
| 131 | `app-rapor-personel.html` | **YÖNLENDİRİLİYOR** | → `?rapor=is-kapasite` (13 kayıt) |
| 132 | `app-rapor-referans.html` | **YÖNLENDİRİLİYOR** | → `?rapor=satis-ozeti` (10 kayıt) |
| 133 | `app-rapor-filo.html` | **KARAR BEKLİYOR** | **19 rapor kaydının altı şablonda karşılığı yok.** Filo yedinci şablon mu olacak (o zaman "altı ana rapor" bozulur), yoksa 19 kayıt yalnız "Ayrıntılı analiz" katalogunda mı kalacak? Şartname filoyu rapor tarafında hiç anmıyor. → K-04 |

### 9.1 105 raporun ölçülmüş dağılımı

| Kategori | Kayıt | Hedef şablon |
|---|---:|---|
| Görev ve Zaman | 19 | İş ve Kapasite |
| **Filo** | **19** | **KARŞILIĞI YOK** |
| Satış ve Finans | 18 | Satış Özeti + Nakit ve Tahsilat |
| Müşteri | 14 | Müşteri Sağlığı |
| İnsan Kaynakları | 13 | İş ve Kapasite |
| Proje | 12 | Proje Teslimatı |
| Yönlendirme | 10 | Satış Özeti |
| **Toplam** | **105** | |

---

## 10. Ayarlar (13 ekran)

> §3.3: "`app-ayar-*.html` → `/ayarlar/:sekme` · Aynı ayar kabuğunda sekmeli
> yönetim; yetkiye göre sekme üret." §3.1 dört girdi: Profil · Şirket ve
> Erişim · Entegrasyonlar · Sistem Kayıtları.

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 134 | `app-ayar-profil.html` | **KARŞILIĞI VAR** | "Profil" girdisi — tüm rollere açık |
| 135 | `app-ayar-bildirim.html` | **GÖMÜLÜYOR** | Profil › Bildirim Tercihleri (kişisel ayar) |
| 136 | `app-ayar-sirket.html` | **GÖMÜLÜYOR** | "Şirket ve Erişim" › Şirket |
| 137 | `app-ayar-departman.html` | **GÖMÜLÜYOR** | "Şirket ve Erişim" › Departmanlar |
| 138 | `app-ayar-kullanici.html` | **GÖMÜLÜYOR** | "Şirket ve Erişim" › Kullanıcılar |
| 139 | `app-ayar-rol.html` | **GÖMÜLÜYOR** | "Şirket ve Erişim" › Roller |
| 140 | `app-ayar-yetki.html` | **GÖMÜLÜYOR** | "Şirket ve Erişim" › Yetki Matrisi |
| 141 | `app-ayar-onay.html` | **GÖMÜLÜYOR** | "Şirket ve Erişim" › Onay Akışları |
| 142 | `app-ayar-entegrasyon.html` | **KARŞILIĞI VAR** | "Entegrasyonlar" girdisi. **Ödeme sağlayıcısı ayarı buraya gelir** (§8.7) |
| 143 | `app-ayar-otomasyon.html` | **GÖMÜLÜYOR** | Entegrasyonlar › Otomasyonlar |
| 144 | `app-ayar-log.html` | **KARŞILIĞI VAR** | "Sistem Kayıtları" girdisi. §8.6 ödeme denetim izi buraya akar |
| 145 | `app-ayar-arsiv.html` | **GÖMÜLÜYOR** | Sistem Kayıtları › Arşiv |
| 146 | `app-veri-kalitesi.html` | **GÖMÜLÜYOR** | Sistem Kayıtları › Veri Kalitesi |

---

## 11. Kişisel not (2 ekran)

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 147 | `app-notlarim.html` | **YÖNLENDİRİLİYOR** ✅ | → `app-panel.html?drawer=notlar`. R2'de Hızlı Notlar **çekmece olarak çalışıyor**. R1'in `calisma` bölümü tamamen kapandı. |
| 148 | `app-not-form.html` | **YÖNLENDİRİLİYOR** ✅ | → `app-panel.html?drawer=notlar` |

> ⚠️ Bu iki ekran R1'de **iki tur önce açılmıştı** (P4-03). Şartname onları
> kapatıyor. Veri **silinmez**: `notes.js` (6 not · 8 madde) R2'ye taşındı ve
> `GV.notes` kategori/renk/öncelik alanlarını okumaya devam ediyor — yeni
> formda **gösterilmiyor** (§4.2 "geçmiş kayıt metadatası olarak korunabilir").

---

## 12. YENİ yazılacak ekranlar

| # | Dosya | Kaynak | Durum |
|---|---|---|---|
| Y1 | `app-operasyon.html` | §6 | kesin |
| Y2 | `app-odeme-linki.html` | §8.1 | kesin |
| Y3 | `app-odeme-linki-form.html` | §8.2 | kesin |
| Y4 | `app-odeme-linki-detay.html` | §8.1 | kesin |
| Y5 | `app-odeme.html` | §8.3 | kesin — TEST etiketli mock |
| Y6 | `app-odeme-sonuc.html` | §8.1 | kesin |
| Y7 | `app-firsat-detay.html` | §5.3 | **KARAR BEKLİYOR** |
| Y8 | `app-firsat-form.html` | §5.3 | **KARAR BEKLİYOR** |

**Y7/Y8 gerekçesi:** §5.3 `opportunity`yi ayrı varlık yapıyor ve R2'de
`DB.opportunities` **türetildi** (12 kayıt). Ama §3.1'de fırsatın menü
girdisi yok, §5.4'te yalnız müşteri detayının **sekmesi** olarak geçiyor.
Satış Akışı kanban kartından bir yere tıklanacak — o hedef belirsiz.

---

## 13. KARAR BEKLİYOR — dokuz ekranın toplu listesi

| # | Ekran | Sebep | Risk defteri |
|---|---|---|---|
| 6 | `app-panel-yonetici.html` | Şartname anmıyor; rol varyantı mı ayrı ekran mı | K-06 |
| 24 | `app-referans.html` | Yedi alanda karşılığı yok | K-03 |
| 25 | `app-referans-detay.html` | Aynı | K-03 |
| 26 | `app-referans-form.html` | Aynı | K-03 |
| 27 | `app-komisyon.html` | Yedi alanda karşılığı yok; Finans'ın 4 girdisi dolu | K-03 |
| 28 | `app-komisyon-detay.html` | Aynı | K-03 |
| 29 | `app-komisyon-form.html` | Aynı | K-03 |
| 66 | `app-sohbet.html` | Ne çalışma alanında ne üst çubukta yeri var | K-02 |
| 133 | `app-rapor-filo.html` | 19 rapor kaydı altı şablona düşmüyor | K-04 |

Ayrıca **konumu** karar bekleyen (kaderi net) bir ekran: `app-dokuman.html`
— kalıyor ama hangi çalışma alanında olduğu yazılı değil (K-05).

---

## 14. Menü aritmetiği — ölçülmüş

| | R1 | R2 (ölçüldü) |
|---|---:|---:|
| Çalışma alanı | 16 | **7** |
| Tıklanabilir menü girdisi (model) | 86 | **20** |
| Standart kullanıcıda görünür (en yüksek) | — | **17** |
| Yönetici rolde görünür (toplam) | — | **20** (3'ü ayrı "Yönetim" bloğunda, soluk) |
| Menü ayracı | 13 | **0** |

Ölçüm: `node tasks/qa/kontrol.js` §5 — 27 rolün tamamı tek tek koşuldu.
Kabul kriteri (§12) "en fazla 7 alan ve 18 menü girdisi" **sağlanıyor**.
