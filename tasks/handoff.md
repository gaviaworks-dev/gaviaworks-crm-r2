# Handoff — 11 Ağustos 2026

> Bu dosya context'in yerine geçer. `claude --continue` sonrası **ilk iş** bunu okumaktır.
> Hafıza context değil, diskteki defterlerdir.
>
> Repo: `gaviaworks-dev/gaviaworks-crm-r2` · `main` · HEAD `438cf9c`
> Yerel: `~/Developer/Projects/gaviaworks-crm-r2` · çalışma ağacı **temiz**, uzak ile **eşit**
> Eski repo `gaviaworks-crm` **dondurulmuştur** — oradan çalışılmaz, oraya yazılmaz.

---

## 1. Bugün ne kapandı

| Dilim | Durum | Ekran |
|---|---|---|
| **Dilim 1 — Müşteri ve Satış** | **KAPANDI** | müşteri detay · müşteri form · Satış Akışı · fırsat detay · fırsat form · teklif liste · teklif detay · teklif form |
| **Dilim 2 — Finans** | **KAPANDI** | fatura liste · fatura detay · fatura form · tahsilat liste · tahsilat form · satın alma |
| **K-17 teklif sürümleme** | **KAPANDI** | motor + `app-teklif-detay.html` ekran tarafı |
| **K-21 bayat alan** | **KAPANDI** | `lifecycle.js` tuzağı + `bayat-alan.js` ekseni |
| **K-19 müşteri tipi sözlüğü** | **KAPANDI** | `DB.customerTypes`, teyit tek bayrakta |

**Sayılar (grep ile ölçüldü, damgadan okunmadı):**

| | |
|---|---:|
| Yayında ekran (`ls app-*.html`) | **23** (+ `index.html`) |
| `shell.js` BUILT listesi | **24** — diskle **birebir**, ne fazla ne eksik |
| Rota haritası numaralı satır | **48 / 148** işaretli · **100** kalan |
| Rota YENİ satır | **8 / 8** |
| Bu oturumdaki commit | **39** |
| Ortak katmanda değişen satır | **+1287 / −47**, 8 dosya |

---

## 2. Ortak katmanda bu oturumda değişen HER imza

### 2.1 Yeni yordamlar

| İmza | Nerede | Kullanan ekran |
|---|---|---|
| `GV.lifecycle.gec(kod, hedef, opts)` | `domain.js` | müşteri detay |
| `GV.lifecycle.adimlar(hesap)` | `domain.js` | müşteri detay |
| `GV.lifecycle.eksikAlanlar(h, hedef)` | `domain.js` | müşteri detay · müşteri form · `Gates.firsatKazanma` |
| `GV.lifecycle.rozet(evre)` · `.ad(evre)` · `.sonraki(evre)` · `.hesap(x)` | `domain.js` | müşteri listesi · müşteri detay · müşteri form · fırsat detay/form · fatura detay/form · tahsilat form · teklif form |
| `GV.lifecycle.dogumIzni(evre)` | `domain.js` | müşteri form |
| `GV.sales.hesapMukerrer(aday)` | `domain.js` | müşteri form |
| `GV.sales.firsatKazan(kod, opts)` | `domain.js` | Satış Akışı · fırsat detay · teklif detay |
| `GV.flow.kilit(tur, kodYaKayit)` | `domain.js` | teklif detay |
| `GV.teklif.zincir · surumler · sonSurum · kilitli · revizyonIzni · revizyonAc · fark` | `domain.js` | teklif detay |
| `GV.fin.tutar(kayit, tur)` | `domain.js` | fatura liste · fatura detay · fatura form |
| `GV.fin.zincirDenetim(sozlesmeKod)` | `domain.js` | fatura detay |
| `Gates.firsatKazanma` · `Gates.teklifSurumKilidi` | `domain.js` | motor üzerinden (ekran doğrudan çağırmaz) |

### 2.2 Değişen davranışlar — sözleşme kaydı

| İmza | Ne değişti | Neden |
|---|---|---|
| `GV.flow.adimlar` | `gerekce` artık **hedefin** `girisGerekce` bayrağını okuyor (`hk.gerekce` yazılıydı); kilitli kayıtta `[]` döner; `kapi` alanı `girisKapi`yi de bildirir | ekran kuralı `DB.transitions`ten kendi okumak zorunda kalıyordu |
| `GV.flow.gec` | `girisKapi` desteği (kapı **hedefe** bağlanabilir); `kilit` kontrolü en başta, `why:'kilit'` döner | kaynak taraflı kapı, aynı durumdan çıkan **her** hedefi engelliyordu |
| `GV.flowHata(r)` | `why:'kilit'` çevirisi eklendi | — |
| `GV.afterSave(cfg)` | Hedef **aynı dosya** ise sayfa yeniden yüklenmez: `history.replaceState` + `GV.refresh()`; dönüş `'detay-yumusak'` | tam sayfa yüklemesi az önce üretilen kaydı siliyordu |
| `GV.errorState(c)` | `c.action` artık onurlandırılıyor; `c.retry` işlev alabiliyor; ikisi de yoksa düğme **hiç basılmaz** | ölü "Tekrar dene" düğmesi basıyor, `action`ı sessizce yutuyordu |
| `GV.form` alan `type:'url'` | Şemasız adres kabul edilir (`denizlojistik.com`) | 12 müşteri kaydının 12'si düzenlenemez hâldeydi |
| `GV.form` `readonly` | `money` ve `percent` dallarında da uygulanıyor | sözleşme yazılıydı, iki dalda hiç çalışmıyordu |
| `GV.modal` · `GV.drawer` | Mount sonrası `GV.markWip` çağırıyor | overlay içindeki bağlantılar kilitlenmiyordu |
| `GV.list` filtre `type:'money'` / `'percent'` | Kendi koşuluna çıkarıldı — **ölü koddu**, `select` dalına düşüp patlıyordu | bir ekran maliyet filtresini serbest metinle kurmak zorunda kalmıştı |
| `GV.cols.money(key, label, o)` | `o.deger(x)` kapısı eklendi (`GV.cols.durum` ile aynı sözleşme) | türetilmiş tutarlar fabrikadan geçemiyordu |
| `GV.cell.num(v, o)` | `o.signed` eklendi (`GV.cell.mny` ile hizalı) | fark hücresi `+/−` biçimini elde kuruyordu |
| `GV.action` `EYLEM_IKON` | `i-help` · `i-corner-up-left` · `i-rotate` **sprite'ta yoktu** → sprite'ta var olanlarla eşlendi | sessiz boş ikon üretiyordu |
| `.gc-meta` (ui.css) | Sınıf **yazıldı** | beş oturumdur kullanılıyor, tanımı yoktu |

### 2.3 Veri katmanı

| Değişiklik | Dosya | Kullanan |
|---|---|---|
| `DB.flowEntities.opportunity` + `DB.transitions.opportunity` (15 aşama) | **yeni** `assets/data/firsat.js` | Satış Akışı · fırsat detay/form |
| `DB.pipelineGroups` · `DB.pipelineGroupOf` · `DB.pipelineStage` | `firsat.js` | Satış Akışı |
| `DB.quoteAccount` · `DB.quoteOpportunity` · `DB.accountQuotes` · `DB.accountOpportunities` · `DB.opportunityQuotes` · `DB.opportunityOfLead` | `firsat.js` | müşteri detay · teklif liste/detay/form · fırsat detay |
| `DB.flowEntities.quote.kilit = 'teklifSurumKilidi'` | `org.js` | teklif detay |
| `quote` tablosu: `Müzakere/Revizyon → Taslak` kenarı **kaldırıldı**; ön analiz kapısı `Taslak.kapi` → `İç Onay.girisKapi` | `org.js` | teklif detay |
| `DB.customerTypes` (4 değer) · `DB.customerTypesTeyit` · `DB.customerTypesNot` | `crm.js` | müşteri form |
| `DB.accounts[].durum` **kaldırıldı** · `DB.customers[].durum` **tuzağa** çevrildi · `DB.bayat` sayacı | `lifecycle.js` | hiçbiri (okuyan kalmadı — ölçüldü) |

---

## 3. Koşulan eksenler

| Eksen | Ne ölçer | Kontrol | Bozulmuş kopyada sınandı mı |
|---|---|---:|---|
| `kontrol.js` | sözdizimi · referans edilen dosya · veri bağımlılığı · menü tavanı | — | hayır (önceki turlardan devralındı) |
| `satis-akis.js` | fırsat geçişi · kazanma kapısı · yaşam evresi · kopya üretmeme · denetim izi · mükerrer · teklif↔hesap bağı · elle durum ataması · **S10 teklif sürümleme** | **42** | **EVET** — 4 kusur enjekte, 4'ü yakalandı |
| `finans-kanon.js` | **yeni** — bağımsız çapa · zincir · **çift KDV tuzağı** · bakiye tek kaynak · durum türetimi · ödeme linki tutarı | **22** | **EVET** — 2 kusur enjekte, ikisi de yakalandı (15 bulgu) |
| `bayat-alan.js` | **yeni** — tuzak kurulu mu · sıfır okuma · kaynak taraması | **11** | **EVET** — 2 kusur enjekte, ikisi de yakalandı (4 bulgu) |
| `brief-dogrula.js` | brief'teki her `dosya:satır` · `GV.<ad>` · `DB.<ad>` · ikon adı gerçek mi | 4 eksen | hayır |
| `tarayici.js` | 26 ekran × 6 genişlik · taşma · konsol · sprite · odak | **156 ölçüm** | **EVET** — taşma + eksik ikon enjekte, ikisi de yakalandı |
| `not-izolasyon.js` · `odeme-akis.js` · `ops-akis.js` · `rapor-tavan.js` | önceki dilimlerden devralındı | — | hayır |

**Son koşumda sekizinin sekizi TEMİZ.**

---

## 4. Yarım kalan hiçbir şey

Kod tarafında **yarım kalan iş yok**: çalışma ağacı temiz, uzak ile eşit, tüm eksenler yeşil, BUILT listesi diskle birebir.

Kapsam tarafında **bilerek yapılmayanlar** (hepsi `tasks/v2-borc.md`'de numaralı):

- **V2-24** — satın alma alt kayıtları (rota 116-122: teklif toplama · siparişler · tedarikçiler) satın alma ekranının sekmeleri olacak, yazılmadı.
- **V2-25** — tahsilat detay ekranı (rota 71) yok; liste kod kolonu bu yüzden bağlantısız.
- **V2-22** — `GV.fin.tahsisKaldir` yordamı **var**, hiçbir ekranda yüzeye çıkmadı (yetki + gerekçe kararı bekliyor).
- **V2-12** — ön analiz oluşturma drawer'ı K-20 ile kapsama alındı ama **yazılmadı**; rota 23 bu notla işaretli.
- **V2-17 · V2-18** — `GV.form`'da `option disabled` ve `datalist` yuvası yok; iki ekran bunu dolanarak çözdü.
- **V2-19** — detay ekranı tablo + mobil-ikiz yardımcısı iki ekranda **kopya**; üçüncüde `ui.js`'e taşınmalı.

**Beyar'ın cevaplamadığı beş soru** (önceki turun kapanışından):
`DB.customerTypesTeyit` onayı · tahsilat detayı ayrı ekran mı · satın alma alt kayıtları hangi dilimde · tahsis geri alma yetki kuralı · sıradaki dilim.

---

## 5. Menüde hedefi olan ama diskte karşılığı olmayan ekranlar

`shell.js` `SECTIONS` içindeki 25 `href` hedefinin **13'ü diskte var, 12'si yok**.
Bu 12'si bugün menüde `markWip` ile kilitli görünüyor.

| Eksik hedef | Alan | Sıradaki dilim |
|---|---|---|
| `app-proje.html` | Proje ve Operasyon | **evet** |
| `app-gorev.html` | Proje ve Operasyon | **evet** |
| `app-gorev-form.html` | Proje ve Operasyon | **evet** |
| `app-destek.html` | Proje ve Operasyon | **evet** |
| `app-destek-form.html` | Proje ve Operasyon | **evet** |
| `app-personel.html` | Ekip ve Kaynaklar | sonraki |
| `app-zaman.html` | Ekip ve Kaynaklar | sonraki |
| `app-varlik.html` | Ekip ve Kaynaklar | sonraki |
| `app-ayar-profil.html` | Ayarlar | sonraki |
| `app-ayar-sirket.html` | Ayarlar (yönetim) | sonraki |
| `app-ayar-entegrasyon.html` | Ayarlar (yönetim) | sonraki |
| `app-ayar-log.html` | Ayarlar (yönetim) | sonraki |

---

## 6. Operasyon kuyruğunun "Tam kaydı aç" hedefleri

Kuyruk **43 satır** taşıyor (`gorev` 22 · `onay` 10 · `destek` 4 · `istalebi` 4 · `tahsilat` 2 · `takip` 1).
Her satırın bir `tam` hedefi **var** (hedefsiz satır 0), ama hedeflerin çoğu diskte yok:
`app-operasyon.html:255` sahte buton yasağı gereği bu düğmeyi **basmıyor**.

| Hedef | Kaç kuyruk satırı | Diskte |
|---|---:|---|
| `app-gorev-detay.html` | **23** | ✗ |
| `app-destek-detay.html` | **4** | ✗ |
| `app-istalebi-detay.html` | **4** | ✗ |
| `app-satinalma-detay.html` | 2 | ✗ |
| `app-izin-detay.html` | 2 | ✗ |
| `app-tahsilat-detay.html` | 2 | ✗ |
| `app-proje-degisiklik.html` | 1 | ✗ |
| `app-onanaliz-detay.html` | 1 | ✗ |
| `app-komisyon-detay.html` | 1 | ✗ |
| `app-zaman-onay.html` | 1 | ✗ |
| `app-teklif-detay.html` | 1 | ✓ |
| `app-musteri-detay.html` | 1 | ✓ |

**43 satırın 41'i** bugün "Tam kaydı aç" düğmesi göremiyor. En ağır ikisi
`app-gorev-detay.html` (23 satır) ve `app-destek-detay.html` (4 satır) — ikisi de
sıradaki dilimin içinde.

---

## 7. Sıradaki dilim: **Proje ve Operasyon**

**Neden bu:**

1. **Kuyruğun 41 satırı hedefsiz.** Operasyon ekranı yayında ve çalışıyor ama
   satırların %95'i tam kayda açılamıyor. `app-gorev-detay.html` tek başına
   23 satırı, `app-destek-detay.html` 4 satırı kurtarıyor — en yüksek getirili
   iki dosya bu dilimde.
2. **Menüde kilitli 12 hedefin 5'i bu alanda** (proje · görev · görev formu ·
   destek · destek formu). Bir alanın menü girdileri kilitliyken o alan
   kullanıcı için yok demektir.
3. **En kalabalık gömülü aile burada.** Rota §4: proje alt kayıtları (33-47,
   **15 satır**) proje detayının sekmeleri olacak; görev ailesi 9 menü
   girdisinden 1'e indi (48-50); destek 54-60. Tek bir `app-proje-detay.html`
   ekranı **15 rota satırını birden** kapatır — kalan 100 satırın en yoğun
   bloğu.
4. **Zincir buradan devam ediyor.** Finans dilimi teklif → sözleşme → ödeme
   planı → fatura → tahsilat halkasını kapattı; sözleşmeden **proje** doğuyor
   (`GV.sales.firsatKazan` zaten proje taslağı öneriyor) ve proje maliyeti
   `GV.proje.maliyet` ile zaten hesaplanıyor — ekranı olmayan tek halka.
5. Ekip ve Kaynaklar ile Ayarlar bekleyebilir: ikisi de zincire bağlı değil,
   kuyruk satırı beslemiyor ve kilitli menü girdileri günlük işi durdurmuyor.

**Giriş noktası önerisi:** `app-proje.html` → `app-proje-detay.html`
(15 gömülü satır) → `app-gorev.html` + `app-gorev-detay.html` (23 kuyruk
satırı) → `app-destek.html` + `app-destek-detay.html`.

**Dikkat:** `GV.proje.sure` · `GV.proje.maliyet` · `GV.proje.kapanisKontrol` ·
`GV.proje.kapat` · `GV.proje.bakimBagla` · `GV.proje.bakimAc` yordamları
`domain.js`'te **hazır ve ölçülü**; proje ekranları bunları kullanacak, yeniden
yazmayacak. Görev tarafında `GV.task.*` ve `DB.taskTransitions` aynı şekilde
hazır.

---

## 8. İlk üç komut

```bash
cd ~/Developer/Projects/gaviaworks-crm-r2 && git pull
node tasks/qa/kontrol.js && node tasks/qa/brief-dogrula.js
cat tasks/ekran-brief.md   # ajanlara verilecek sözleşme — §17 finans katmanı yeni
```
