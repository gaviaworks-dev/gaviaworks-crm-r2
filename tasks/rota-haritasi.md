# Rota Haritası — R1'deki 148 ekranın her biri için hedef karar

> **Kaynak repo (dondurulmuş):** `gaviaworks-dev/gaviaworks-crm` · `main` · `36ad104`
> **Hedef repo:** `gaviaworks-dev/gaviaworks-crm-r2`
> **Şartname:** `tasks/sadelestirme-talimati.md`
>
> **Kural:** boş satır yok. 148 uygulama ekranının **her biri** bir karar taşır.
> Karar veremediğim ekran `KARAR BEKLİYOR` işaretlidir ve **sebebi yazılıdır**.
>
> Bu defter **plan değildir** — hedef karar tablosudur. Göç Beyar onayına bağlıdır.
>
> **11 Ağustos güncellemesi:** Beyar on bir kararı verdi (`tasks/kararlar.md`).
> Dokuz "KARAR BEKLİYOR" satırı kapandı, Operasyon ve beş ödeme ekranı yazıldı.
> Değişen satırlar aşağıda **✔ karar** ya da **✅ yayında** ile işaretli.

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

| Karar | Ekran | Pay | Dilim 5 kapanışı |
|---|---:|---:|---:|
| KARŞILIĞI VAR | **41** | %27,7 | 43 |
| GÖMÜLÜYOR | **94** | %63,5 | 92 |
| YÖNLENDİRİLİYOR | **12** | %8,1 | 12 |
| KAPSAM DIŞI | **1** | %0,7 | 1 |
| KARAR BEKLİYOR | **0** | %0,0 | 0 |
| **Toplam** | **148** | %100 | 148 |
| YENİ yazılacak | **8** — altısı (Y1–Y6) **yayında**, ikisi kaldı | — | 8 |
| **Bugün R2'de yayında** | **105** | %70,9 | 97 |
| **Kalan** | **43** | %29,1 | 51 |

> **12 Ağustos · Dilim 6 — iki satır karar DEĞİŞTİRDİ, dokuzu yazılıyor.**
> `KARŞILIĞI VAR` 43 → 41: rota **123** ve **124** (`app-dokuman.html` ve
> `-detay`) V2-68 kararıyla **GÖMÜLÜYOR**'a çevrildi ve hedefleri
> `app-ayar-log.html › arsiv` sekmesi oldu (ADR-R2-06 revizyonu). İki yüzey
> aynı defteri göstermez (K-21) ve beşinci bir ayar girdisi menüyü 17'den
> çıkarırdı. Kalan dokuz `KARŞILIĞI VAR` satırı bu dilimde yazılıyor; bundan
> sonra **kendi ekranını almış olup yazılmamış satır kalmıyor** ve `Kalan`
> yalnız GÖMÜLÜYOR satırlarından oluşacak.

> ⚠️ **12 Ağustos — SAYIM DÜZELTİLDİ. Bu tablo kendi satırlarıyla
> ÇELİŞİYORDU.** Önceki sürüm `KARŞILIĞI VAR 44 · GÖMÜLÜYOR 91` diyordu;
> defterin §2–§12 arasındaki karar satırları sayıldığında gerçek dağılım
> `42 · 93`'tü. "Bugün yayında **17**" satırı ise beş dilim boyunca hiç
> güncellenmemişti — gerçek sayı **84**'tü. Yani özet tablo, altındaki
> defterden bağımsız yaşamaya başlamıştı (ADR-R2-36'daki defter–kod
> ayrışmasının defter–defter hâli).
>
> **Ham satır 153, gerçek ekran 148.** Fark, bu dosyanın SONUNDAKİ özet
> tablosunun beş satırı ikinci kez listelemesidir: **6 · 66 · 79 · 123 · 133**.
> O beş satır bir karar tekrarı değil, aynı kararın ikinci kez yazılmış
> hâlidir; sayım artık **benzersiz numara** üzerinden yapılır.
>
> Sayım artık elle tutulmuyor — `tasks/qa/ayar-ekseni.js` [A9] her koşumda
> defteri okuyup bu tabloyla karşılaştırıyor; ayrışırlarsa kırmızı yanıyor.

> **Bu tablo ölçüldü, yazılmadı.** Defterin §2–§12 arasındaki numaralı karar
> satırları taranarak sayıldı: 148 satır, eksik numara yok, tekrar yok.
> İlk yazdığım özet (90 / 11 / 2) **yanlıştı** ve ölçüm onu düzeltti — kendi
> defterime güvenmek yerine saydırdığım için yakalandı (R1 dersi L-28:
> borç kaydının kendi kapsamı da ölçülmeden güvenilmez).

**Değişimin kaynağı — kararlar:**

| Karar | Etki |
|---|---|
| ADR-R2-03 Sohbet kapsam dışı | 1 ekran KARAR BEKLİYOR → **KAPSAM DIŞI** |
| ADR-R2-04 Referans + komisyon gömülür | 6 ekran KARAR BEKLİYOR → **GÖMÜLÜYOR** |
| ADR-R2-05 Filo raporu katalogda kalır | 1 ekran KARAR BEKLİYOR → **YÖNLENDİRİLİYOR** |
| ADR-R2-07 Yönetici paneli rol varyantı | 1 ekran KARAR BEKLİYOR → **GÖMÜLÜYOR** |
| ADR-R2-08 Fırsat kendi ekranını alır | Y7/Y8 karar bekliyordu → **kesin** |
| ADR-R2-06 Doküman arşivi yönetim bloğunda | konum belirsizliği kapandı |

⚠️ **Filo raporu için düzeltme:** ADR-R2-05 kararından sonra
`app-rapor-filo.html` da diğer altı rapor ekranı gibi **YÖNLENDİRİLİYOR**
oldu — hedefi `app-rapor.html?rapor=ayrintili&kategori=filo` (Ayrıntılı
analiz kataloğu). Yönlendirilen rapor ekranı 6 → **7** oldu, ama toplam
YÖNLENDİRİLİYOR sayısı 11'de kaldı çünkü karar bekleyen satırdan geldi.

**KARAR BEKLİYOR satırı kalmadı.** İki ekranın (`app-butce.html` ve
`app-destek-paket*.html`) **kaderi** kesindir — ikisi de gömülüyor — ama
**hangi kaydın sekmesi** olacakları şartnamede yazılı değil ve bir varsayımla
işaretlendiler. Varsayım uygulanmadı; ikisi de henüz yazılmamış ekranlara ait.
Ayrıntı §13.

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
| 6 | `app-panel-yonetici.html` | **GÖMÜLÜYOR** ✔ ✅ | **ADR-R2-07:** ayrı ekran değil, Ana Panel'in rol varyantı. R2'de `OZET_BY_ROLE` tablosu rol başına iki özet kartı seçiyor; `sahip` ve `genelmudur` fırsat + nakit görüyor. **Çalışıyor.** |

---

## 3. Müşteri ve Satış (22 ekran)

### 3.1 Müşteri çekirdeği

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 7 | `app-musteri.html` | **KARŞILIĞI VAR** ✅ | R2'de yayında. Kaynak artık `DB.accounts` (20 hesap); evre kolonu + filtre + evre sekmeleri var. Aday **nötr etiket**, ayrı renk teması yok (§5.1). |
| 8 | `app-musteri-detay.html` | **KARŞILIĞI VAR** ✅ | §5.4 sekmeleri **yayında**: Özet · Yetkililer · Fırsatlar ve Teklifler · Projeler · Finans · Destek · Belgeler · Aktivite. Yetkili ve iletişim ekleme drawer'da; evre geçişi `GV.lifecycle.gec` üzerinden ve **kapı reddediyor** (vergi no eksikse Müşteri düğmesi kilitli). |
| 9 | `app-musteri-form.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** İlk görünüm ölçüldü: §5.2'nin altı maddesi, yedi girdi (telefon ve e-posta ayrı doğrulama). Kalan dokuz alan “Daha fazla bilgi” sekmesinde kapalı. Evre `ADAY` varsayılan; `MUSTERI` doğumu rol kapısına takılıyor. |

### 3.2 Lead ailesi — müşteriye katlandı

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 10 | `app-lead.html` | **YÖNLENDİRİLİYOR** ✅ | → `app-musteri.html?t=aday` — R2'de bu sekme **çalışıyor** |
| 11 | `app-lead-detay.html` | **YÖNLENDİRİLİYOR** ✅ | → `app-musteri-detay.html?id=<eşlenen hesap>` · **yayında**, Fırsatlar ve Teklifler sekmesiyle |
| 12 | `app-lead-form.html` | **YÖNLENDİRİLİYOR** ✅ | → `app-musteri-form.html?evre=ADAY` — **yayında** |

> ⚠️ **Ölçülmüş göç kuralı** — `assets/data/lifecycle.js` bunu uyguluyor:
> `LEAD-2026-001/002/005/008` mevcut müşteriyle **aynı firma adını** taşıyor
> ve `musteri` alanı doludur. Bu dördü için yeni hesap **açılmaz**.
> Doğru sonuç **20 hesap + 12 fırsat** (naif göçün ürettiği 24 değil).
> Her hesap `legacy_id` + `legacy_kaynak` taşır; müşteri listesinde iki gizli
> kolon (`Kaynak kayıt`, `Evre türetmesi`) bunu görünür kılar.

### 3.3 Müşteri alt kayıtları

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 13 | `app-musteri-yetkili.html` | **GÖMÜLÜYOR** ✅ | → müşteri detayı › Yetkililer sekmesi — **çalışıyor** (aday kaynaklı hesapta boş ve nedeni yazılı) |
| 14 | `app-musteri-yetkili-form.html` | **GÖMÜLÜYOR** ✅ | → aynı sekmede drawer — `GV.drawer` + `GV.form`, `DB.contacts`a gerçek kayıt yazıyor |
| 15 | `app-musteri-iletisim.html` | **GÖMÜLÜYOR** ✅ | → müşteri detayı › Aktivite sekmesi — `DB.interactions` + denetim izi tek zaman çizelgesinde |
| 16 | `app-musteri-iletisim-form.html` | **GÖMÜLÜYOR** ✅ | → aynı sekmede drawer — iletişim kaydı ekleme çalışıyor |

### 3.4 Satış akışı

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 17 | `app-pipeline.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** `app-satis-akisi.html` — 12 fırsat, pano kolonu `DB.pipelineGroups` (6 grup), 15 aşamanın hiçbiri silinmedi. Aşama atlanamıyor; kazanma `GV.sales.firsatKazan` zinciriyle. |
| 18 | `app-teklif.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** 8 teklif; hesap bağı iki yoldan da çözülüyor (5 doğrudan, 3 fırsat üzerinden). Kazanma oranı paydası 0 iken `—` basıyor. |
| 19 | `app-teklif-detay.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** Kalem dökümü 8 teklifin **1'inde** var (TKL-2026-014, 6 satır); kalanında satır uydurulmadı. ⚠️ **Teklif sürümleme borcu K-17 ile KAPATILDI** (ADR-R2-17): revizyon yeni kayıt üretiyor, eski sürüm kilitli, iki sürüm fark ekranında karşılaştırılıyor. |
| 20 | `app-teklif-form.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** İlk görünüm 6 alan; ara toplam kalem satırlarından TÜRETİLİR ve o hâlde salt okunur olur. Yeni teklif tablonun ilk durumunda (`Taslak`) doğar. |
| 21 | `app-onanaliz.html` | **GÖMÜLÜYOR** ✅ | → fırsat detayı › Ön analiz bloğu — **çalışıyor**; 12 fırsatın 4'ünde analiz kaydı var, kalanında boş durum yazılı |
| 22 | `app-onanaliz-detay.html` | **GÖMÜLÜYOR** ✅ | → aynı blokta kayıt görünümü + `GV.flow.adimlar('analysis')` ile durum ilerletme |
| 23 | `app-onanaliz-form.html` | **GÖMÜLÜYOR** | → drawer · ⚠️ **YAZILMADI**: ön analiz OLUŞTURMA yüzeyi bu dilimde açılmadı, okuma ve durum ilerletme var. V2 borcu (`tasks/v2-borc.md` V2-04) |

### 3.5 Referans ve komisyon — şartname sessiz

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 24 | `app-referans.html` | **GÖMÜLÜYOR** ✔ ✅ | → müşteri detayı › Özet (yönlendiren alanı) — **çalışıyor**, `DB.referrers` okunuyor |
| 25 | `app-referans-detay.html` | **GÖMÜLÜYOR** ✔ ✅ | → müşteri detayı › Özet (yönlendiren alanı) |
| 26 | `app-referans-form.html` | **GÖMÜLÜYOR** ✔ ✅ | → aynı alan; ayrı form açılmadı |
| 27 | `app-komisyon.html` | **GÖMÜLÜYOR** ✔ | **ADR-R2-04:** komisyon Finans raporunda **satır** olur. Finans'ın dört girdisi dolu; beşinci girdi 18 sınırını zorlardı. |
| 28 | `app-komisyon-detay.html` | **GÖMÜLÜYOR** ✔ | → Nakit ve Tahsilat raporu drill-down |
| 29 | `app-komisyon-form.html` | **GÖMÜLÜYOR** ✔ | → drawer |

---

## 4. Proje ve Operasyon (24 ekran + 1 yeni)

### 4.1 Proje çekirdeği

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 30 | `app-proje.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** 6 sekme, hepsi `DB.projectStatuses` ve `GV.proje.*` yordamlarından TÜRETİLDİ. ⚠️ "Kapanan" varsayılan görünümde **0** satır: kapanan 7 projenin 7'si de `arsiv:true`, şerit bunu söylüyor. `GV.proje.sure` 7/14 projede `kapsam:false` → "0 sa" değil "defterde kayıt yok" |
| 31 | `app-proje-detay.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** Dokuz sekme, tembel çizim. `#<sekme>` derin bağlantısı çalışıyor ve SÖZLEŞMEDİR — kuyruk ve `GV.proje.kapanisKontrol` buraya bağlandı. |
| 32 | `app-proje-form.html` | **KARŞILIĞI VAR** ✅ | Doğum durumu `Plan`; `?hesap=` tohumu `GV.sales.firsatKazan`dan gelir (V2-39 kapandı). Aktivasyon kapısı `GV.gates.projeAktif` ile ÇAĞRILIR, aynası kurulmaz. **Çalışıyor.** |

### 4.2 Proje alt kayıtları — §3.3 birebir hüküm

> §3.3: "Liste erişimini proje bağlamına taşı; **küresel çapraz listeyi
> Operasyon filtresi olarak koru.**"

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 33 | `app-proje-milestone.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — proje detayı › Milestone sekmesi. `DB.projectMilestones` (12) · `DB.milestones` ödeme taksitidir, sekmede ayrıca uyarılıyor |
| 34 | `app-proje-sprint.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — proje detayı › Sprint sekmesi · `DB.sprints` (6) |
| 35 | `app-proje-sprint-form.html` | **GÖMÜLÜYOR** | drawer |
| 36 | `app-proje-test.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — proje detayı › Kalite sekmesi · `DB.testCases` (5, hepsi PRJ-2026-001) |
| 37 | `app-proje-test-detay.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — aynı sekmede kayıt görünümü |
| 38 | `app-proje-test-form.html` | **GÖMÜLÜYOR** | drawer |
| 39 | `app-proje-hata.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — proje detayı › Hatalar sekmesi · `DB.bugs` (6) |
| 40 | `app-proje-hata-detay.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — aynı sekme |
| 41 | `app-proje-hata-form.html` | **GÖMÜLÜYOR** | drawer |
| 42 | `app-proje-degisiklik.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — proje detayı › Değişiklik sekmesi · `DB.changeRequests` (5). Kuyruğun onay satırı `#degisiklik` çapasına bağlandı |
| 43 | `app-proje-degisiklik-detay.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — aynı sekme |
| 44 | `app-proje-degisiklik-form.html` | **GÖMÜLÜYOR** | drawer |
| 45 | `app-proje-teslim.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — proje detayı › Teslim sekmesi · `DB.deliveries` (5) |
| 46 | `app-proje-teslim-detay.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — aynı sekme |
| 47 | `app-proje-teslim-form.html` | **GÖMÜLÜYOR** | drawer |

### 4.3 Görev — 9 menü girdisi 1'e indi

> R1 ölçümü: `?t=` taşıyan 10 menü girdisinin **9'u** `app-gorev.html`'e
> gidiyordu. §3.3: "Görev sekme varyasyonları → `/gorevler?gorunum=…`"

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 48 | `app-gorev.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** Tek liste, 8 sekme kayıtlı görünüm. 26 görev · `urlSync` açık, eski `?t=` bağlantı biçimi çalışıyor |
| 49 | `app-gorev-detay.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** Operasyon kuyruğunun **23 satırı** bu ekrana bağlandı ve açılıyor |
| 50 | `app-gorev-form.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** 4 sekme · 25 alan · tek `required` (`baslik`). Kayıt `GV.task.olustur` ile: sorumlulu → **Atandı**, sorumlusuz → **Havuzda**; atama GEÇİŞTEN geçer. `durum` forma KONMADI, salt okunur. `faturalanabilir` SAAT alanıdır, sorulmuyor |

### 4.4 Departman talepleri

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 51 | `app-istalebi.html` | **GÖMÜLÜYOR** | → `/operasyon?tip=istalebi`. §6.2 kuyruk tipleri arasında adı geçmiyor ama "ortak tipte gösterilebilir" hükmüne düşer. **Çıkarım** — şartnamede birebir yazmıyor. |
| 52 | `app-istalebi-detay.html` | **GÖMÜLÜYOR** | Operasyon sağ paneli + tam kayıt |
| 53 | `app-istalebi-form.html` | **GÖMÜLÜYOR** | drawer |

### 4.5 Destek

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 54 | `app-destek.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** Kuyrukla **aynı satır modeli** (`GV.kuyruk.tipler.destek`); kaynak `DB.tickets` çünkü kuyruk yalnız açık 4 talebi taşıyor, liste 7'sini de gösterir. 4 talebin 13 alanı kuyrukla karşılaştırıldı: **0 fark** |
| 55 | `app-destek-detay.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** Kuyruğun **4 satırı** bu ekrana bağlandı. SLA bir SÜRE taahhüdüdür, tarihe çevrilmedi |
| 56 | `app-destek-form.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** 2 sekme · 12 alan · 2 `required` (`baslik` · `musteri`). Kayıt `GV.destek.olustur` ile; `sla` politikadan TÜRETİLİR (20 kombinasyonun 19'unda politika var, 1'inde yok ve boş bırakılıyor), `slaDurum` `null` kalır (BE-D1) |
| 57 | `app-destek-sla.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — destek listesinin "SLA riskli/ihlal" kayıtlı görünümü (3 satır). SLA bir SÜRE taahhüdüdür, tarihe çevrilmedi |
| 58 | `app-destek-paket.html` | **GÖMÜLÜYOR** ✅ | → müşteri detayı › Destek sekmesi — **çalışıyor** (ADR-R2-13) |
| 59 | `app-destek-paket-form.html` | **GÖMÜLÜYOR** ✅ | → aynı sekmede paket kartı |
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
| 66 | `app-sohbet.html` | **KAPSAM DIŞI** ✔ | **ADR-R2-03:** R2'ye taşınmaz. Şartname bu modülü hiç anmıyor — ne yedi çalışma alanında ne §3.2 üst çubuk araçlarında yeri var. Adressiz bir modül için sekizinci alan açmak, revizyonun tek cümlelik amacına aykırı. `DB.channels` R1'de duruyor, R2'ye kopyalanmadı. |

### 4.8 YENİ — Operasyon

| # | Dosya | Karar | Kaynak |
|---|---|---|---|
| **Y1** | `app-operasyon.html` | **YENİ** ✅ | **YAZILDI.** Sol %35 kuyruk / sağ %65 işlem paneli; ayırıcı sürüklenir ve %30–%50 arasında kilitlenir, tercih saklanır. Kuyruk beş tipi ortak satır modeliyle taşıyor — ölçüldü: **39 satır** (22 görev · 4 destek · 10 onay · 1 takip · 2 tahsilat). Sekiz eylem `GV.flow`/`GV.approval` üzerinden yürüyor ve `GV.audit`e yazıyor; ret/revizyon/iptal gerekçesiz tamamlanmıyor. Odak penceresi `BroadcastChannel` ile senkron. |

---

## 5. Finans (13 ekran + 5 yeni)

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 67 | `app-fatura.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** 17 fatura · net/KDV/brüt `GV.fin.tutar` çapasından, bakiye `GV.fin.balance`tan. Çapa 17/17 tutarlı; 2 fatura gecikmiş (₺396.000). Ödeme durumu TÜRETİLİR, belge durumu ayrı eksendir. |
| 68 | `app-fatura-detay.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** Zincir denetimi ekranda: 17 faturanın 9'unda 4/4 halka ölçülebiliyor, 1 fatura sözleşmesiz ve halka çizilmiyor. Tahsis defteri + ödeme linki sekmesi (§8.5) var; tahsil edilmemiş tahsilat seçilemiyor. |
| 69 | `app-fatura-form.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** Dört kip: serbest · sözleşmeden · taksitten · düzenleme. 19 taksitin 15'inin faturası var, 4'ü listeleniyor. Tahsisli faturada tutar düşürme REDDEDİLİYOR. |
| 70 | `app-tahsilat.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** "Tahsilat kaydı ≠ para geldi" iki ayrı kolon: nakit olayı ve dağıtım. 17 kaydın 10'u tahsil edilmiş, 7'si edilmemiş; dağıtılmamış ₺1.172.200. |
| 71 | `app-tahsilat-detay.html` | **GÖMÜLÜYOR** ✅ | **K-23 · ADR-R2-22 — karar DEĞİŞTİ.** Ayrı ekran yazılmadı ve yazılmayacak: tahsilat listesinde satıra tıklanınca tahsis defteri ve geçmiş çekmece olarak açılır. Operasyon kuyruğunun iki satırı `app-tahsilat.html?ac=<kod>` hedefine bağlandı. |
| 72 | `app-tahsilat-form.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** Alacak kaydı ve nakit olayı İKİ AYRI ADIM: form bayrağı yazmaz, `GV.fin.tahsilEt` çağırır. Ölçüldü: nakit olayı faturayı KAPATMIYOR (bakiye 18.000 → 18.000) — dağıtım ayrı eksen. |
| 73 | `app-sozlesme.html` | **GÖMÜLÜYOR** ✅ | → müşteri detayı › Finans sekmesi — **çalışıyor** |
| 74 | `app-sozlesme-detay.html` | **GÖMÜLÜYOR** ✅ | → aynı sekme |
| 75 | `app-sozlesme-form.html` | **GÖMÜLÜYOR** ✅ | → aynı sekmede kayıt görünümü |
| 76 | `app-odemeplani.html` | **GÖMÜLÜYOR** ✅ | → müşteri detayı › Finans sekmesi (taksitler bağlı sözleşmeden okunuyor) |
| 77 | `app-odemeplani-detay.html` | **GÖMÜLÜYOR** ✅ | → aynı sekme |
| 78 | `app-odemeplani-form.html` | **GÖMÜLÜYOR** ✅ | → aynı sekme |
| 79 | `app-butce.html` | **GÖMÜLÜYOR** | proje detayı › Bütçe sekmesi (`GV.proje.maliyet` orada zaten okunuyor). Şartname anmıyor; §2'den **çıkarım** |

### 5.1 YENİ — Ödeme Linkleri

> §8.7 kuralı **birebir uygulanır**: sağlayıcı seçilmediği için gerçek kart
> formu **taklit edilmez**. Açıkça **TEST** etiketli mock adapter kurulur.
> `PaymentProviderAdapter` sözleşmesi (`createCheckoutSession` · `verifyWebhook`
> · `getPaymentStatus` · `refundPayment` · `cancelSession`) arayüz olarak
> yazılır, gövdesi sandbox'tır.

| # | Dosya | Karar | Kaynak |
|---|---|---|---|
| **Y2** | `app-odeme-linki.html` | **YENİ** ✅ | **YAZILDI.** 7 link, açık bakiyeli faturalardan türetildi |
| **Y3** | `app-odeme-linki-form.html` | **YENİ** ✅ | **YAZILDI.** İlk görünüm 6 alan + tek birincil eylem; gelişmiş seçenekler kapalı; kart alanı yok; fazla tutar reddediliyor |
| **Y4** | `app-odeme-linki-detay.html` | **YENİ** ✅ | **YAZILDI.** Geçiş düğmeleri `GV.flow`tan türetiliyor; 11 backend maddesi tek tek listeleniyor |
| **Y5** | `app-odeme.html` | **YENİ** ✅ | **YAZILDI.** Kabuk yüklenmiyor (ölçüldü: 0 kabuk düğümü), **hiç girdi alanı yok**, TEST etiketi 4 kez, müşteri maskeli, süresi dolmuş linkte ödeme düğmesi basılmıyor |
| **Y6** | `app-odeme-sonuc.html` | **YENİ** ✅ | **YAZILDI.** Beş sonuç ekranı; **hiçbiri linki ODENDI yapmıyor** — beşinin beşi ölçüldü |

---

## 6. Ekip ve Kaynaklar (25 ekran)

### 6.1 Personel

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 80 | `app-personel.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** 5 sekme, hepsi geçiş tablosundan ve `GV.hr.*`ten TÜRETİLDİ. **K-18 kapandı**: `aktif` tuzağa çevrildi, `DB.ikBayat.sayac` her rolde 0. Kişisel veri kapısı SATIRA bakar (`GV.hr.ozlukGorebilir`), role değil — `muhasebe` maaşı görür özlüğü görmez |
| 81 | `app-personel-detay.html` | **KARŞILIĞI VAR** | Performans · eğitim · yaşam döngüsü sekmeleri buraya gelir |
| 82 | `app-personel-form.html` | **KARŞILIĞI VAR** ✅ | Doğum durumu `Taslak`. `maas` XOR `saatlikUcret` radio + `showIf` ile; kapı kapalıysa alan HİÇ ÇİZİLMEZ (maskelenmiş input gerçek değeri ezer). K-39 öz-erişim iki yönde ölçüldü. **Çalışıyor.** |
| 83 | `app-personel-giris.html` | **GÖMÜLÜYOR** | §3.1 "işe giriş/çıkış" birleştirilen içerik → personel detayı › Yaşam Döngüsü (`employee` 15. geçiş varlığı `domain.js`'te hazır) |
| 84 | `app-performans.html` | **GÖMÜLÜYOR** | §3.1 aynı hüküm → personel detayı › Performans |
| 85 | `app-performans-form.html` | **GÖMÜLÜYOR** | drawer |
| 86 | `app-egitim.html` | **GÖMÜLÜYOR** | §3.1 aynı hüküm → personel detayı › Eğitim |

### 6.2 Zaman ve İzin — tek menü girdisi

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 87 | `app-izin.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI** — `app-zaman.html` › İzin yüzeyi. Sekmeler `DB.leaveStatuses`ten türetildi (7 talep). Bakiye kapısı hedefe taşındı: bakiyesi yetmeyen talep artık REDDEDİLEBİLİYOR |
| 88 | `app-izin-detay.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI** (383 satır). Kuyruğun **2 ölü hedefini kapattı**. Bakiye kapısı hedefe bağlı: `IZN-2026-039` onaylanamıyor ama **reddedilebiliyor ve iptal edilebiliyor**; düğme devre dışı ve sebebi yazılı. Geçiş tablosunu ekran okumaz — `GV.flow.durumBilgi` bu turda motora eklendi |
| 89 | `app-izin-form.html` | **KARŞILIĞI VAR** ✅ | Doğum durumu `Taslak`. Bakiye kapısı FORMUN kapısı değil (`Onaylandı`ın `girisKapi`sı): aşan talep onaylanamaz ama TALEP EDİLEBİLİR, `Ücretsiz izin` muaf. `gun` `GV.calendar.isGunu`dan türer. K-38'in ilişki adımı burada görünür. **Çalışıyor.** |
| 90 | `app-zaman.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** İki yüzey sekmesi (Zaman · İzin), tembel çizim, `#izin` derin bağlantısı. 131 zaman kaydı · 6 haftalık defter |
| 91 | `app-zaman-onay.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — `app-zaman.html` › Zaman yüzeyinin "Onay bekleyen" kayıtlı görünümü (43 satır, `?t=onay`). Haftalık defter satırın onay merciidir; 41 satır kapsanıyor, 90 kapsanmıyor |
| 92 | `app-kapasite.html` | **GÖMÜLÜYOR** ✅ | **GÖMÜLÜYOR** — kapasite ayrı ekran değil, "İş ve Kapasite" raporu (`app-rapor.html?r=is-kapasite`, yayında). Zaman ekranı oraya bağlanıyor |

### 6.3 Varlıklar

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 93 | `app-demirbas.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI** — `app-varlik.html` › Demirbaş yüzeyi (844 satır, üç yüzey TEK `GV.list` mount'unda). 15 demirbaş · `passive:['Hurda']` · K-30 düşen iddia satırı çekmecede basılıyor |
| 94 | `app-demirbas-detay.html` | **KARŞILIĞI VAR** | — |
| 95 | `app-demirbas-form.html` | **KARŞILIĞI VAR** ✅ | `durum` TÜRETİLMİŞ: formda yalnız `Depoda` ve `Aktif` seçilebilir (sonda ile ölçüldü, `Zimmetli`/`Zimmet bekliyor` ezilir), düzenlemede alan basılmaz. `zimmetli/zimmetTarihi/iadeTarihi` `null` şekliyle doğar — K-30'un ölçüm kapısı böyle korunur. **Çalışıyor.** |
| 96 | `app-zimmet.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — `app-varlik.html` › Zimmet yüzeyi. Tutanak **drawer**'dır, ayrı ekran açılmadı. Kabul / kabul geri alma aynı yetki kümesinden geçiyor |
| 97 | `app-zimmet-form.html` | **GÖMÜLÜYOR** ✅ | **KAPANDI** — zimmet çekmecesi (`app-varlik.html?t=zimmet`) |
| 98 | `app-arac.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — `app-varlik.html` › Filo yüzeyi. 4 araç · sözlüğü olmayan 5 alan kayıtlardan türetildi ve kaynağı ekranda yazılı (V2-43) |
| 99 | `app-arac-detay.html` | **KARŞILIĞI VAR** | Altı alt kaydın sekmesini R1'de zaten taşıyor — bu revizyonun istediği yapının **çalışan emsali** |
| 100 | `app-arac-form.html` | **KARŞILIĞI VAR** ✅ | Araç `GV.flow` varlığı DEĞİL: `durum` düz alan, `required` + ön seçim yok (doğum durumunu söyleyen kaynak yok). Mülkiyet ekseni `showIf` ile ayrılıyor ve düşen alanlar `read()` katmanında kayboluyor. Dört ret iki yönde ölçüldü. **Çalışıyor.** |

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
| 113 | `app-satinalma.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** R1'in ayrı "Onay Bekleyenler" girdisi sekmeye indi. 7 talebin 7'sinde onay zinciri var (16 adım); adım sayacı `GV.approval.adim`den TÜRETİLİR, `onayAdim` alanı hiçbir yerde okunmuyor. |
| 114 | `app-satinalma-detay.html` | **GÖMÜLÜYOR** ✅ | **Karar DEĞİŞTİ.** Talep detayı zaten çekmeceydi; artık `app-satinalma.html?ac=<kod>` ile derin bağlantı da alıyor. Kuyruğun iki satın alma onayı buraya geliyor. |
| 115 | `app-satinalma-form.html` | **KARŞILIĞI VAR** ✅ | Doğum durumu `Taslak` (V2-40 kapandı). Onay zincirinin adım sayısı tutardan TÜRETİLİR (10k→1/3 · 30k→2/3 · 150k→3/3); zincir örneği üretilmez, beyan edilir. **Çalışıyor.** |
| 116 | `app-satinalma-teklif.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** (K-24). Satın Alma › Teklif Toplama sekmesi · 9 satır · iki puan ekseni ayrı etiketli |
| 117 | `app-siparis.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** (K-24). Satın Alma › Siparişler sekmesi · 4 satır · net/KDV/brüt üç kolon |
| 118 | `app-siparis-detay.html` | **GÖMÜLÜYOR** ✅ | aynı sekmede satır görünümü; `teslimTarihi` çift anlamı (planlanan/gerçekleşen) hücrede yazılı |
| 119 | `app-siparis-form.html` | **GÖMÜLÜYOR** | drawer |
| 120 | `app-tedarikci.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** (K-24). Satın Alma › Tedarikçiler sekmesi · 7 satır · ömür boyu sayaç kart değeri ile sistemden hesaplanan AYRI satırda |
| 121 | `app-tedarikci-detay.html` | **GÖMÜLÜYOR** ✅ | aynı sekmede satır görünümü |
| 122 | `app-tedarikci-form.html` | **GÖMÜLÜYOR** | drawer |

---

## 8. Doküman (3 ekran)

> §3.3: "Doküman merkezi alt sayfaları → Kayıt detayındaki Belgeler sekmesi
> + yönetici arşivi. Günlük belge eklemeyi bağlama taşı; **merkezi arşivi
> arama/yönetim için tut.**"

| # | R1 ekranı | Karar | Hedef / gerekçe |
|---|---|---|---|
| 123 | `app-dokuman.html` | **GÖMÜLÜYOR** ✔ ✅ | **ADR-R2-06 REVİZE (V2-68).** Ayrı girdi kararı GERİ ALINDI: `app-ayar-log.html › arsiv` sekmesi (rota 145) aynı yüzeyi kapsadı — belge arama, sürüm defteri, süresi dolanlar ve onay zinciri orada. İki yüzey aynı defteri göstermez (K-21) ve beşinci ayar girdisi menüyü 17'den çıkarırdı. **Çalışıyor.** |
| 124 | `app-dokuman-detay.html` | **GÖMÜLÜYOR** ✔ ✅ | **ADR-R2-06 REVİZE (V2-68).** Arşiv kayıt görünümü → `app-ayar-log.html › arsiv` sekmesinin sürüm ve onay defteri. **Çalışıyor.** |
| 125 | `app-dokuman-sure.html` | **GÖMÜLÜYOR** | `app-dokuman.html` › Süresi Dolanlar kayıtlı görünümü |
| — | *(günlük belge ekleme)* | **GÖMÜLÜYOR** ✔ | **ADR-R2-06:** ilgili kaydın Belgeler sekmesine düşer — müşteri, proje ve destek detaylarında |

---

## 9. Raporlar (8 ekran)

> §7.1: "Rapor içi sol menü **kaldırılmalıdır**." Tek `/raporlar` kabuğu,
> en fazla 4 KPI + 2 grafik + 1 tablo. 105 rapor tanımı **silinmez**;
> altı şablonun drill-down filtresi / export görünümü olarak eşlenir.

| # | R1 ekranı | Karar | Hedef |
|---|---|---|---|
| 126 | `app-rapor.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI.** Tek yüzey, rapor içi sol menü yok. Altı rapor; ölçüldü: her birinde 4 KPI · ≤2 grafik · 1 tablo. Tipografi tavanları piksel olarak ölçülüyor (`tasks/qa/rapor-tavan.js`, 74 kontrol). |
| 127 | `app-rapor-musteri.html` | **YÖNLENDİRİLİYOR** ✅ | → `app-rapor.html?r=musteri-sagligi`. 14 kaydın 6'sı bu şablona, 3'ü nakit, 2'si satış, 2'si hizmet, 1'i projeye eşlendi |
| 128 | `app-rapor-finans.html` | **YÖNLENDİRİLİYOR** ✅ | → `?r=nakit-tahsilat` + `?r=satis-ozeti`. 18 kayıt ikiye bölündü: 10 nakit, 8 satış |
| 129 | `app-rapor-proje.html` | **YÖNLENDİRİLİYOR** ✅ | → `?r=proje-teslimati`. 11 kayıt bu şablona, 1'i (bütçe) nakde eşlendi |
| 130 | `app-rapor-gorev.html` | **YÖNLENDİRİLİYOR** ✅ | → `?r=is-kapasite`. 19 kaydın 19'u eşlendi |
| 131 | `app-rapor-personel.html` | **YÖNLENDİRİLİYOR** ✅ | → `?r=is-kapasite`. 11 kayıt eşlendi; `zimmet` ve `arac` varlık raporudur, **şablonsuz** kaldı ve katalogda |
| 132 | `app-rapor-referans.html` | **YÖNLENDİRİLİYOR** ✅ | → `?r=satis-ozeti` + `?r=nakit-tahsilat`. ADR-R2-04 gereği ikiye bölündü: 6 kanal → satış, 4 komisyon → nakit |
| 133 | `app-rapor-filo.html` | **YÖNLENDİRİLİYOR** ✔ ✅ | **ADR-R2-05 uygulandı.** → `app-rapor.html` › Ayrıntılı analiz kataloğu. 19 kayıt şablonsuz kaldı, **silinmedi**, katalogda listeleniyor ve ölçüldü: standart kullanıcıda katalog YOK, yönetici rolde VAR. |

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
| 134 | `app-ayar-profil.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI** (556 satır). "Profil" girdisi — tüm rollere açık, `yonetim` DEĞİL, 17'nin içinde. Ayar kabuğu `GV.shell.ayarSekmeleri('profil')`ten 2 sekme üretir. İKİ OTURUM BİÇİMİ: personel 7 kart · müşteri 4 kart (özlük ve ücret blokları müşteri oturumunda HİÇ basılmaz, `GV.hr.*` çağrılmaz). Özlük kapısı `GV.hr.ozluk(e,alan)`, maaş kapısı `GV.hr.maasGorebilir()` — `frontend`/`stajyer`de kendi kaydında bile 1 maske (`••••••`), sebebi maskenin altında yazılı |
| 135 | `app-ayar-bildirim.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — Profil › `bildirim` sekmesi. DÜRÜST BOŞLUK: kişiye bağlı tercih kaydı kaynak veride YOK, 7 kanal (`DB.notificationChannels`) listelenir ve 7'sinin de anahtarı DEVRE DIŞI + sebebi yazılı (çalışmayan anahtar basılmaz). Ölçülebilir gerçek yüzey `DB.automations` 22 kural: `Sistem içi` 20 · `E-posta` 8 · kalan 5 kanalı kullanan kural **0** — ekran bunu yazıyor (`BE-A1`) |
| 136 | `app-ayar-sirket.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI** (1.122 satır). Menü girdisinin kendisi ("Şirket ve Erişim"), yönetim bloğunda, `roles: sahip · genelmudur · sistem`. `sirket` sekmesi `DB.company` 16 alanı basar; iç maliyet sabitleri (`isverenMaliyetKatsayisi` 1.225 · `aylikCalismaSaati` 176) `perm:'finans'` kapısıyla, yetkisizde `••••••`. **MODÜL ANAHTARI — bu dilimin tek gerçek mutasyonu**: `GV.ayar.modulAyarla`, 8 anahtar; kapatınca menü 20→16, açınca 16→20 (gerçek tarayıcıda ölçüldü), denetim izi her değişimde **tek satır** artıyor (ekran ikinci kez `GV.audit.yaz` çağırmıyor). ⚠️ KAPI İKİ YÖNDE AYNI: aynı yetki kümesi, aynı gerekçe koşulu, boş gerekçe iki yönde de reddediliyor |
| 137 | `app-ayar-departman.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — `departman` sekmesi. `DB.departments` 21 kayıt (pasif 3), `DB.departmentGroups` 8 grup. `durum` ekseni YOK → `aktif` orada KANONDUR ve **yalnız `GV.arsivli(d)` üzerinden** sorulur (ekranda çıplak `.aktif` okuması **0**). `ustDepartman` 2 kayıtta boş → `—` + sebep. `personel` alanı 21/21 kayıtta personel defteriyle doğrulandı |
| 138 | `app-ayar-kullanici.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — `kullanici` sekmesi (`perm:'personel'` — 15 rolde DÜŞER). `DB.employees` 16 · `GV.hr.durum`: Aktif 15 · Offboarding 1. `aktif` alanı TUZAK, okunmuyor. **MAAŞ KOLONU YOK** — kullanıcı yönetimi bordro yüzeyi değildir, sebebi ekranda yazılı. `eposta` özlük sınıfında → satır bazlı `mask:` ile maskeli, maskeli hücre çıktıya da girmiyor |
| 139 | `app-ayar-rol.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — `rol` sekmesi. `DB.roles` 27 = `DB.permMatrix` 27, **yetim 0** (karşılaştırma ekranda koşuyor, sabit yazılmadı). Rolün kaç kişide etkin olduğu `DB.employees` `rol`/`roller` alanından türetilir. Rol adları `DB.roleName(key)` ile çözülür — uydurma rol adı yok |
| 140 | `app-ayar-yetki.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — `yetki` sekmesi (`roles:YONETIM` — yalnız 3 rolde görünür, 24 rolde DÜŞER). 27 rol × **11 anahtar**; anahtar listesi elle yazılmadı, matrisin ilk satırından türetildi. Boolean hücre `GV.badge`, kapsam hücresi düz metin, `'yok'` `GV.cell.faint` ile soluk — **panelde tek bir `0` yok** (ölçüldü) |
| 141 | `app-ayar-onay.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — `onay` sekmesi. `DB.approvalFlows` 3 zincir / 6 adım / 3 eşikli + `DB.approvalTypes` 8 tip. `GV.chain` KULLANILMADI (o bir KOŞUM bileşenidir, buradaki bir TANIM) → `GV.dl`. `esik:null` "her zaman çalışır" diye yazıldı, `0` yazılmadı. `entity:null` taşıyan 2 tip "kaynak kaydın durum makinesi yok" beyanıyla aynen basıldı. ⚠️ Zincir adımlarının 2'sinde rol anahtarı (`finans` · `yonetici`) 27'lik sözlükte YOK → adımın kendi `ad` alanı basıldı + uyarı, **rol adı uydurulmadı** (yeni borç V2-61) |
| 142 | `app-ayar-entegrasyon.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI** (819 satır). Yönetim bloğunda, `roles: sahip · genelmudur · sistem · devops`. Üç sekme buraya düşer: `saglayici` · `odeme` (§8.7, `perm:'finans'` — **`devops`ta DÜŞER**, 4→3 sekme) · `hata`. **K-34 uygulandı:** katalog iddiası ile ölçülen durum İKİ AYRI KOLON. Ölçülen durum 10/10 `Bağlanmadı` (kanıtı yanında: koşum defteri `—`, hata kuyruğu 0, webhook 0); katalog iddiası **rozet OLMADAN** düz metin, çelişen 4 kayıtta (`ENT-001·003·007·009`) "ölçümle çelişiyor" yazılı. Ölçüldü: yeşil rozet **0**, `<input>/<select>/<textarea>` **0**, anahtar/sır alanı **0**, Bağlan/kes düğmesi **0**. `hata` sekmesi "hata yok" DEMİYOR — "koşum kaydı yok, kontrol yapılamadı" (§10.1). `odeme`: kart formu/anahtar yok, 5 adaptör yordamı (§8.7) ve `DB.paymentBackendGaps` 10 maddesi beyan edildi |
| 143 | `app-ayar-otomasyon.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — Entegrasyonlar › `otomasyon` sekmesi. `DB.automations` 22 kural, `GV.list` (`urlSync:false`). **Aç/kapa anahtarı YOK** — otomasyon motoru yok, elde katalog var ve ekran bunu yazıyor (`BE-A7`). Aynı K-34 disiplini burada da uygulandı: `durum:'Aktif'` yeşil rozet DEĞİL, "kaydın iddiası · koşum ölçümü değil" notuyla düz metin. Ölçüldü: 22 kuralın kullandığı kanal yalnız `Sistem içi` 20 · `E-posta` 8; kalan **5 kanalı kullanan kural 0** ve bu yazılı |
| 144 | `app-ayar-log.html` | **KARŞILIĞI VAR** ✅ | **YAZILDI** (772 satır). Yönetim bloğunda, `roles: sahip · genelmudur · sistem · operasyon · devops`. **İKİNCİ DEFTER ÜRETİLMEDİ**: tek yüzey `GV.audit.oku(null,0)` → iki defter (`DB.activities` 207 + `DB.logs` 7) birleşir ve tekilleşir → **214 satır**, kimlik 214/214 benzersiz (`key:'id'`). `DB.logs`/`DB.activities` üstüne yazma **0** (`ayar-ekseni [A3]` ölçer). Filtre seçenekleri sözlükten değil 214 satırdan türetilir (modül sözlüğü yok) ve bu ekranda yazılı: `modul` yalnız **7/214** satırda dolu, kalanda `—` + sebep |
| 145 | `app-ayar-arsiv.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — Sistem Kayıtları › `arsiv` sekmesi. `DB.documents` 11 · `DB.documentVersions` 16 · `DB.documentApprovals` 15. `durum` ekseni YOK → `aktif` orada KANONDUR ve `GV.arsivli(d)` ile sorulur (K-33 üç istisnadan biri; beyansız `.aktif` okuması 0). İndirme düğmesi YOK (`BE-S4` — dosya gerçek depoda değil). `DOK-2026-206` sürüm zinciri 1/18 eksik: **17 satır uydurulmadı**, eksiklik yazıldı. ⚠️ ADR-R2-06 ile ilişkisi Beyar kararı bekliyor (aşağıda 123-125) |
| 146 | `app-veri-kalitesi.html` | **GÖMÜLÜYOR** ✅ | **YAZILDI** — Sistem Kayıtları › `kalite` sekmesi. **YENİ ÖLÇÜM ÜRETMEZ**; ortak katmanın dokuz nöbetçisini okur ve basar: `GV.audit.denetle()` 214/0/0 · `DB.bayatAktif.sayac` 0 (38 tuzaklı · 15 kanon) · `DB.ikBayat.sayac` 0 · `GV.varlik.sonTazeleme` 15 ölçüldü/**0** değişti (K-30 mandalı) · `DB.assetClaimDrops` 3 · `GV.fin.sonSapma` 0 · `GV.approval.sonSapma` 0 · `GV.entegrasyon.kanit()` koşum defteri **yok** → `—` "ölçülemedi", **"hata yok" DEĞİL** · `TEST-MOCK`. Her satır ne ölçüldüğünü, değeri ve ölçülemediyse nedenini birden söyler |

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
| Y7 | `app-firsat-detay.html` | §5.3 | **YAZILDI** ✅ |
| Y8 | `app-firsat-form.html` | §5.3 | **YAZILDI** ✅ |

**Y7/Y8 gerekçesi:** §5.3 `opportunity`yi ayrı varlık yapıyor ve R2'de
`DB.opportunities` **türetildi** (12 kayıt). Ama §3.1'de fırsatın menü
girdisi yok, §5.4'te yalnız müşteri detayının **sekmesi** olarak geçiyor.
Satış Akışı kanban kartından bir yere tıklanacak — o hedef belirsiz.

---

## 13. Karar durumu — dokuz satır kapandı, iki konum varsayım

11 Ağustos kararlarıyla dokuz "KARAR BEKLİYOR" satırının **dokuzu da**
kapandı (`tasks/kararlar.md`). Haritada karar bekleyen satır kalmadı.

**11 Ağustos ikinci turu:** kalan iki varsayım da karara bağlandı; haritada
varsayıma dayanan satır kalmadı.

| # | Ekran | Karar | ADR |
|---|---|---|---|
| 79 | `app-butce.html` | Proje detayının **Bütçe sekmesi** | ADR-R2-12 |
| 57–59 | `app-destek-sla.html` · `app-destek-paket*.html` | Müşteri detayı › **Destek sekmesi** | ADR-R2-13 |

Her ikisi de rota haritasında zaten GÖMÜLÜYOR işaretliydi; değişen şey
**hedefin varsayım olmaktan çıkması**.

### 13.1 Kapanan dokuz satır

| # | Ekran | Yeni karar | ADR |
|---|---|---|---|
| 6 | `app-panel-yonetici.html` | GÖMÜLÜYOR — rol varyantı | ADR-R2-07 |
| 24–26 | `app-referans*.html` | GÖMÜLÜYOR — müşteri detayında alan | ADR-R2-04 |
| 27–29 | `app-komisyon*.html` | GÖMÜLÜYOR — Finans raporunda satır | ADR-R2-04 |
| 66 | `app-sohbet.html` | **KAPSAM DIŞI** | ADR-R2-03 |
| 123 | `app-dokuman.html` | GÖMÜLÜYOR — `app-ayar-log.html › arsiv` | ADR-R2-06 **rev.** (V2-68) |
| 133 | `app-rapor-filo.html` | YÖNLENDİRİLİYOR — Ayrıntılı analiz | ADR-R2-05 |
| Y7/Y8 | `app-firsat-*.html` | YENİ — kesin | ADR-R2-08 |

---

## 14. Menü aritmetiği — ölçülmüş

| | R1 | R2 (ölçüldü) |
|---|---:|---:|
| Çalışma alanı | 16 | **7** |
| Tıklanabilir menü girdisi (model) | 86 | **20** |
| Standart kullanıcıda görünür (en yüksek) | — | **17** |
| Yönetici rolde görünür (toplam) | — | **20** (3'ü ayrı "Yönetim" bloğunda, soluk) |
| Menü ayracı | 13 | **0** |
| Yayında olan ekran | 148 | **17** |

⚠️ **ADR-R2-06'nın menüye etkisi henüz uygulanmadı.** Doküman arşivi yönetim
bloğuna dördüncü girdi olarak eklendiğinde yönetici rolde toplam 20 → 21,
yönetim bloğu 3 → 4 olacak. Standart kullanıcının 17'si **değişmeyecek**.
Bu, doküman ekranı yazıldığında yapılacak.

Ölçüm: `node tasks/qa/kontrol.js` §5 — 27 rolün tamamı tek tek koşuldu.
Kabul kriteri (§12) "en fazla 7 alan ve 18 menü girdisi" **sağlanıyor**.
