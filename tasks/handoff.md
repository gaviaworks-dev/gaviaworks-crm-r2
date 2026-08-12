# Handoff — 13 Ağustos 2026 · **DİLİM 7 KAPANDI · FAZ 6 KAPANIŞI**

> `claude --continue` sonrası **ilk iş** bunu okumaktır. Hafıza context değil,
> diskteki defterlerdir.
>
> Repo: `gaviaworks-dev/gaviaworks-crm-r2` · `main`
> Yerel: `~/Developer/Projects/gaviaworks-crm-r2` · Eski repo `gaviaworks-crm`
> **DONDURULMUŞTUR**.
>
> Bu dosya bir ÖZET değil ÖLÇÜMDÜR; sayı yazmadan önce ölç.
>
> 📄 **Kapanış raporu: `raporlar/faz-6.md`** — bu turun tam ölçümü,
> dürüst kapanış beyanı ve Beyar'ın karar listesi orada.

---

## 0. KESİT — ölçüldü

| | |
|---|---|
| Ekran | **48 + index** |
| Rota | **129/148 yayında · kalan 19** |
| Kalanın dağılımı | **18 bloke** · **1 kapsam dışı** (66) · **0 gerçek iş** |
| Eksen | **15 eksen TEMİZ** (+ `beyan-tarama.js` — kapı değil, tarama) |
| Tarayıcı | **95 ekran × 6 = 570 ölçüm · 570/570 geçerli · 0 bulgu · 166,1 sn** |
| Sızıntı ekseni | **60 vaka · 0 sızan yüzey** · iki yönlü sınandı |
| ADR | **43 yazılı** (41·42·43·44 numaraları hâlâ boş) |
| v2-borç | **106 madde · 11 kapalı · 95 AÇIK** |

**Bu turda:** rota **62** ve **63** kapandı · **V2-100** kapandı ·
**ADR-R2-47** yazıldı · **V2-104…V2-109** açıldı · yeni eksen
`tasks/qa/musteri-kapisi.js`.

---

## 1. ⛳ ROTA DEFTERİNDE AÇIK GERÇEK İŞ KALMADI

129 satır yayında. Kalan 19'un **hiçbiri yazılabilir durumda değildir**:

* **18 bloke** — o defterlere kayıt EKLEYEN yordam ortak katmanda YOK.
  Ölçüldü, ajan açılmadan önce, iki yönlü. Kaydetmesi olmayan bir form
  basmak §14.6 "sahte buton" yasağıdır. Borç: **V2-98** (6 araç satırı) ·
  **V2-99** (12 gömme satırı).
* **1 kapsam dışı** — 66 `app-sohbet.html` (ADR-R2-03).

**18 satırın 18'i artık TEK BİÇİMDE işaretli** (Beyar kararı 1): aynı
`⛔ BLOKE` işareti · aynı ölçüm cümlesi · aynı `**Beyar kararı**` satırı ·
aynı `**Yüzey:**` alanı · aynı `Satır KAPATILMADI` · aynı borç numarası.
Aralarındaki tek fark gerçektir ve o alanda yazılıdır — **6'sında** salt
okunur çekmece açıldı, **12'sinde** hiçbir yüzey açılmadı.

---

## 2. 🔴 TURUN EN AĞIR İŞİ — V2-100 VERİ SIZINTISI KAPANDI

### Yayılım panelden ÇOK daha genişti

Devralınan not "panelde" diyordu. Müşteri kimliğiyle **60 ölçüm vakası**
koşuldu:

| | |
|---|---:|
| Kabuğun 403 bastığı yüzey | **46** |
| Müşterinin ulaşabildiği yüzey | **14** |
| **Sızdıran yüzey** | **5** |
| Görünen kişi adı | **50** |
| Görünen iç/yabancı kayıt | **130** |

`app-panel.html` yanında **`app-gorev-form.html`** (16 personel adıyla ·
14 proje) · **`app-proje-form.html`** (15 personel · bütün hesaplar) ·
**`app-destek-form.html`** (16 personel · 14 proje · 20 hesap · bütün
firmaların yetkilileri) ve **`app-proje-detay.html`** (kapı reddederken
yabancı projenin ADINI basıyordu).

⚠️ Sızıntının bir kısmı `display:none` bir sekmedeydi. **CSS kapı değildir.**

### Neden hiçbir eksen yakalamadı

İki kapı vardı ve **ikisi de aynı soruyu soruyordu**: `GV.guardRecord` →
"bu KAYIT kime ait", `GV.list scopeField` → "bu SATIR kime ait". Toplayan
yüzey (panel kartı · KPI · `<option>` listesi) kayıt açmaz, defterin
tamamını okur — sorulacak sahip yok. İki form ekranı **yeni kayıt**
kipindeydi, ortada kayıt bile yoktu.

**Eksik olan üçüncü soruydu: "bu KİMLİK iç veriyi görebilir mi?"**

### Onarım — ortak katmanda TEK yerde

```
GV.perm.icVeri()      · icVeriNeden()  · icKume()
GV.perm.kapsa()       ← GV.list afterScope'unun çağrılabilir hâli;
                        kural artık TEK uygulamada (ui.js kopyasını bıraktı)
GV.guardIcEkran()     ← iç kayıt ekranının kimlik kapısı
GV.guardRecord()      ← reddederken artık yabancı kaydın ADINI basmıyor
```

`app-destek-form.html` **bilerek AÇIK** kaldı (portalın işi kendi talebini
açmaktır — ölçüldü: 7 talebin 7'si "Müşteri portalı", açan 7/7 bir `YTK-*`);
ekran kapatılmadı, **seçenek kaynakları kapsandı**.

### Ölçüm — üç koşum

| | ÖNCE (`HEAD` kopyası) | SONRA |
|---|---:|---:|
| Sızan yüzey | **5** | **0** |
| Bulgu | **12** | **0** |
| Kişi adı | **50** | **0** |
| İç/yabancı kayıt | **130** | **0** |

* **Sağırlık sınaması:** `GV_BOZ=1` sayfaya bilerek sızıntı enjekte eder →
  **üç sınıfın üçü de yakalandı**.
* **Personel tarafı:** panel **10 rolde** önce/sonra karşılaştırıldı;
  dokuz personel rolünde çıktı **birebir aynı**.

**Kayda geçti: `ADR-R2-47`.**

### Kapatılmayan ama SUSTURULMAYAN tek şey

Müşteri **kendi** talebinde, talebi üstlenen uzmanın adını görüyor. Başka
firmanın verisi değil, toplayan iç defter de değil — kendi kaydının
tarafıdır ve portal ürünlerinde genelde İSTENEN davranıştır. Karar
verilmediği için eksenin `KARARA_AÇIK` listesinde **sebebiyle yazılı** ve
her koşumda basılıyor. **V2-105 · Beyar kararı.**

---

## 3. ROTA 62 · 63 — TOPLANTI BAĞLAMI KAPANDI

Brief §23.7: toplantı AYRI EKRAN değil, kaydın kendi geçmiş yüzeyinde
bağlamsal satırdır. Panel ayağı ("Günün ajandası") zaten yayındaydı ve
**dokunulmadı**. İki ayak eklendi:

* `app-musteri-detay.html` › Aktivite › **Toplantılar** (tablo + mobil ikizi)
* `app-proje-detay.html` › Aktivite › **Toplantılar** (zaman çizgisi)

Ölçüldü: `DB.meetings` **9 kayıt**, **5'inde `musteri` ve AYNI 5'inde
`proje` dolu**; kalan 4'ü departman/satış toplantısıdır, hiçbir bağlama
düşmez ve **bu ekranda yazılıdır**. Boş yerleşim de gerçek bir kayıtla
ölçüldü (`PRJ-2024-011` · `MUS-2026-008`).

* **Rozet YOK** — `tur` ve `durum` için sözlük koleksiyonu ölçülmedi;
  sözlüksüz alana rozet §22.17.12 ihlalidir (V2-91'de tam bu kusur kapandı).
* **"Toplantı ekle" düğmesi YOK** ve sebebi ekranda yazılı (rota 64 bloke).
* Dış katılımcı satırı boş dizide **basılmaz**.
* `i-map-pin` sprite'ta yok (113 ikon tarandı) → `i-calendar`.

Tarayıcı eksenine **iki ölçüm vakası** eklendi: sekme TEMBEL çizilir,
yalnız varsayılanı ölçmek bu yerleşimi hiç çizmemek olurdu. 93 → **95 ekran**.

---

## 4. BEYAR'IN ALTI KARARI — hepsi uygulandı

| # | karar | ne yapıldı |
|---|---|---|
| 1 | V2-99 uzatılmasın, kapsam dondurulsun; 18 satır AYNI biçimde işaretlensin | Uygulandı. 12 satıra "V2-98 kararı UZATILMADI" ve `Yüzey: açılmadı` eklendi; 6 araç satırı aynı alan adıyla `Yüzey: salt okunur çekmece` aldı |
| 2 | Ceza defteri çekmecesi onaylandı, v2-borç'a "rota dışı eklenti" olarak yazılsın | **V2-108** açıldı. Rota 111 Kaza ve Cezayı birlikte sayar, ceza formunun satırı yok — yüzey hiçbir rota satırını kapatmaz ve kapanış sayımına girmez |
| 3 | Rota 27 — kolon, satırın karşılığı SAYILIR | Uygulandı, satır ✅ olarak duruyor |
| 4 | Rota 28 — hücre içi `<details>` KALSIN, yordam borcu yazılsın | **V2-109** açıldı |
| 5 | Rota 79 — `sozlesmeTutari` TEK ADA indirilsin | Uygulandı. "Gelir (sözleşme tutarı)" → **"Sözleşme tutarı"**; alanın ROLÜ alt satırda yazılı, ada karışmıyor |
| 6 | (handoff §8.5) müşteri portalı sızıntısı | **Kapatıldı** — §2 |

---

## 5. BEYAN TARAMASI — mekanikleşti

`tasks/qa/beyan-tarama.js` yazıldı. **Kapı DEĞİL, tarama**: çıkış kodu
bilerek 0, çünkü bir sayının bugün doğru olması onun türetilmiş olduğu
anlamına gelmez. Yalnız EKRANDA BASILAN dize sabitlerini tarar, yorumları
hariç tutar.

| | ÖNCE | SONRA |
|---|---:|---:|
| Elle yazılmış sayı taşıyan ekran cümlesi | **41** | **36** |
| **Bugün YANLIŞ olan (bayat)** | **0** | **0** |

**Sıfır bayat beyan.** 41'in 41'i veriye karşı tek tek sınandı ve hepsi
doğru çıktı. **4 cümle** yine de türetilmiş hâle getirildi — çünkü aynı
anda **V2-100 sınıfı sızıntıydılar**: müşteri kimliğine şirketin tüm
defterinin sayılarını basıyorlardı. Ayrıca bir `placeholder`, gerçek bir
müşteri talebinin başlığından alınmıştı; değiştirildi.

Kalan 36'sı doğru ama türetilmemiş — **V2-107**.

---

## 6. AÇIK BORÇ

**95 madde açık** (106 tanımlı · 11 kapalı). Bu turda açılanlar:

| # | konu |
|---|---|
| **V2-104** | `app-destek-form.html` proje seçeneği YANLIŞ yordamla etiketleniyor (`paketAdi` bir bakım paketini adlandırır, projede `null` döner) — 14 seçeneğin 14'ü `null · <hesap>` basıyor. Kapsam donduruldu, kapatılmadı |
| **V2-105** | Müşteri kendi kaydında iç aktör adlarını görüyor — **KARAR BEKLİYOR** |
| **V2-106** | Panel ve destek formu satır kapsamında `kendi`/`departman` eşlemesi yok. Bilerek: doğru eşleme bir YORDAMDIR (`app-proje.html`), ikinci ve dar bir kopyasını yazmak L-40 olurdu. Eşlenmemiş kapsamın notu ekranda BASILIYOR |
| **V2-107** | 36 ekran cümlesi sayıyı elle taşıyor |
| **V2-108** | Ceza defteri çekmecesi rota dışı eklenti |
| **V2-109** | `GV.rapor` satır derinleşme yordamı yok |

**Devreden:** `ADR-R2-41·42·43·44` numaraları ayrılmış, metinleri **hâlâ
yazılmamış** — dört turdur devrediyor.

---

## 7. SIRADA NE VAR — Faz 7'ye GEÇİLMEDİ

Bu tur bir **kapanış turudur**; yeni iş açılmadı, Faz 7'ye geçilmedi.
Sıradaki iş bir ekran turu değildir:

1. **Beyar'ın karar listesi** — `raporlar/faz-6.md` §8, 12 madde.
2. **Backend payı** — gerçek not izolasyonu · gerçek XLSX/PDF · webhook ·
   idempotency · kalıcı denetim defteri · ödeme sağlayıcısı. **Bu altısı
   tamamlanmadan canlıya çıkılamaz.** Arayüzdeki yetki kapıları sunucu
   doğrulamasının yerine geçmez.
3. **18 bloke satır** ancak yazma tarafı gerçek bir sunucuyla yazıldığında
   kapanabilir.

---

## 8. İlk üç komut

```bash
cd ~/Developer/Projects/gaviaworks-crm-r2 && git pull
for e in tasks/qa/*.js; do case "$e" in *tarayici.js|*beyan-tarama.js) continue;; esac; \
  node $e >/dev/null 2>&1 && echo "TEMİZ $e" || echo "BULGU $e"; done
node tasks/qa/tarayici.js    # 95 ekran · 570 ölçüm · ~2,8 dakika
```

Sızıntı ekseni ayrıca **iki yönlü** koşulur — tek yönlü yeşil güvenilmez:

```bash
node tasks/qa/musteri-kapisi.js          # temiz ağaç  → 0 bulgu beklenir
GV_BOZ=1 node tasks/qa/musteri-kapisi.js # bozuk kopya → 3/3 sınıf yakalanmalı
node tasks/qa/beyan-tarama.js            # kapı değil, tarama (çıkış 0)
```
