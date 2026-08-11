# Handoff — 11 Ağustos 2026 · Dilim 3 (Proje ve Operasyon) **KAPANDI**

> `claude --continue` sonrası **ilk iş** bunu okumaktır. Hafıza context değil, diskteki defterlerdir.
>
> Repo: `gaviaworks-dev/gaviaworks-crm-r2` · `main` · HEAD `50c5625`
> Yerel: `~/Developer/Projects/gaviaworks-crm-r2` · çalışma ağacı **temiz**, uzak ile **eşit**
> Eski repo `gaviaworks-crm` **dondurulmuştur** — oradan çalışılmaz, oraya yazılmaz.

---

## 1. Dilim 3 kapandı — sekiz ekranın sekizi yayında

| Dosya | Satır | Rota |
|---|--:|---|
| `app-proje.html` | 799 | 30 |
| `app-proje-detay.html` | 1472 | 31 · 33 · 34 · 36 · 37 · 39 · 40 · 42 · 43 · 45 · 46 (**11 satır**) |
| `app-gorev.html` | 1069 | 48 |
| `app-gorev-detay.html` | 660 | 49 |
| `app-gorev-form.html` | 770 | 50 |
| `app-destek.html` | 966 | 54 · 57 |
| `app-destek-detay.html` | 707 | 55 |
| `app-destek-form.html` | 888 | 56 |

Ayrıca açılış üçlüsü: K-24 satın alma sekmeleri · K-23 tahsilat çekmecesi ·
K-25 tahsis geri alma. ADR-R2-22 … ADR-R2-25 `tasks/kararlar.md`'de.

**Sayılar:** yayında **31 ekran + index** · `BUILT` **32 = diskteki 32, birebir** ·
rota **74 / 148** (oturum başı 48) · bu oturumda **36 commit**.

---

## 2. SIRADAKİ DİLİM — Beyar kararı bekliyor

Kalan iki alan: **Ekip ve Kaynaklar** (`app-personel.html` · `app-zaman.html` ·
`app-varlik.html`) ve **Ayarlar** (`app-ayar-profil` · `-sirket` ·
`-entegrasyon` · `-log`). Yedisi de menüde **kilitli** (`markWip`) ve
`BUILT`te değil — ölü bağlantı yok.

Ekip ve Kaynaklar dilimi kuyruğun kalan **3 ölü hedefini** de kapatır
(`app-izin-detay` 2 · `app-zaman-onay` 1).

Ajan sözleşmesi hazır: `tasks/ekran-brief.md` **§18 · §19** dilim 3'ün
sözleşmesi; yeni dilim için §20 yazılmalı ve `brief-dogrula.js` koşturulmalı.

---

## 3. Ortak katmanda BU OTURUMDA değişen HER imza

| İmza | Değişiklik |
|---|---|
| `GV.list` `cfg.rowOpen(kayit, render)` | **YENİ** — satır tıklaması; iç etkileşimli düğüm tetiklemez, dinleyici bir kez bağlanır |
| `GV.list` `cfg.urlSync:false` | **İKİ YÖNLÜ OLDU** — yazmayan liste okumaz da |
| `GV.cols.date` `bosSub(x)` | **YENİ** — boş değerde de alt satır basar |
| `GV.fin.tahsisYetkisi()` | **YENİ** — tahsis defteri kapısı, kurma ve geri alma için AYNI |
| `GV.fin.ciftNet` · `.dagitimNet` · `.canliTahsisler` | **YENİ** — net okuma (ters kayıt defteri) |
| `GV.fin.tahsisKaldir(t, f, gerekce)` | **3. ARGÜMAN ZORUNLU** · kayıt silmez, ters kayıt üretir |
| `GV.fin.tahsisEt` · `.tahsilGeriAl` | Ölçüt **satır değil NET** |
| `GV.task.olustur(v)` | **YENİ** — `faturalanabilir` SAAT alanıdır, 0 yazılır |
| `GV.destek.olustur(v)` · `.slaPolitikasi(k, o)` | **YENİ** — `sla` politikanın `etiket`inden, joker `'Tümü'` desteği |
| `GV.destek.paketOf` | **DÜZELTİLDİ** — seviye `ad` önekinden, `tip`ten değil |
| `GV.flow.yanEtki` ticket dalı | Kapanış damgası artık **motorda** |
| `DB.tahsisYetkiRolleri` · `DB.tahsisYetkiNot` | **YENİ** — `['muhasebe','sahip','genelmudur']` |
| `DB.supplierQuotes[].id` | **YENİ** türetilmiş satır kimliği |
| `DB.approvals[].link` | 6 satır R2 hedeflerine çevrildi |

---

## 4. Ortak katmanda bulunan ve kapatılan DOKUZ kusur

1. `GV.fin.tahsisKaldir` kaydı **siliyordu** — §8.5 "kayıt silinmez" hükmü.
2. `urlSync:false` yalnız yazmayı susturuyordu, okumayı değil.
3. Satır–net ayrımı: ters kayıttan sonra `tahsisEt` ve `tahsilGeriAl` kilitlenirdi.
4. **`tarayici.js` oturum parametresini hash'in SONUNA ekliyordu** → 403 sayfası
   ölçülüp **yeşil yanıyordu**. Sahte temizlik.
5. `GV.cols.date` boş dalda `sub` basmıyordu — fabrika en çok gerektiği yerde
   kullanılamıyordu.
6. Destek **kapanış damgası iki ekranda kopya**ydı ve ikisi aynı değildi
   (biri sözlükten, biri `'Kapandı'` dizesinden).
7. **`GV.destek.paketOf` seviye eşleşmesi hiç tutmuyordu** (`tip` 7/7 `'Bakım'`),
   sessizce `aday[0]`a düşüyordu — yanlış paketi döndürebiliyordu.
8. **`kontrol.js` yorum metnini kod sanıyordu** → iki dürüst ekranı kusurlu
   ilan etti. Yorum ve dize artık ayıklanıyor.
9. **`brief-dogrula.js` `kuyruk.js`yi taramıyordu** → gerçek bir imzayı
   (`GV.kuyruk`) hayalet ilan etti.

---

## 5. Eksenler — ONU DA YEŞİL

| Eksen | Kontrol |
|---|---|
| `kontrol.js` | ✓ TEMİZ |
| `brief-dogrula.js` | ✓ BRIEF KODLA UYUMLU |
| `acilis-uc.js` | ✓ **59 kontrol** · 4 eksen (K-24 · K-23 · K-25 · **K-25b kapı**) |
| `finans-kanon.js` | ✓ 22 kontrol |
| `satis-akis.js` | ✓ 42 kontrol · 10 eksen |
| `odeme-akis` · `ops-akis` · `bayat-alan` · `not-izolasyon` · `rapor-tavan` | ✓ TEMİZ |
| `tarayici.js` | ✓ **39 ekran × 6 genişlik = 234 ölçüm** · nöbetçi 234/234 geçerli |

**NÖBETÇİ (yeni):** ölçülen sayfa 403 ya da boş kabuk ise ölçüm GEÇERSİZ sayılır.
`gv:ready` atıldı mı · belge başlığı · `.gv-page` element sayısı (eşik 25).
Bozulmuş kopyada 2 kusur enjekte, 2'si de yakalandı; temiz vaka temiz kaldı.

---

## 6. Operasyon kuyruğu — 43 satır

**Gerçek hedefi olan: 36 · dürüstçe devre dışı: 7.** (Oturum başında 2 / 41.)

Devre dışı 7'nin dağılımı:
- **3'ü yazılmamış ekran bekliyor** — `app-izin-detay` (2) · `app-zaman-onay` (1),
  ikisi de Ekip ve Kaynaklar diliminde.
- **4'ünün ayrı tam kaydı YOK** — departman talebinin tam kaydı Operasyon
  panelinin kendisidir (rota 51-52 GÖMÜLÜYOR). Düğme **gizlenmiyor**:
  "Bu sürümde ayrı tam kayıt yok" diye devre dışı basılıyor ve sebebi ipucunda.

---

## 7. BEYAR'DAN BEKLENEN KARARLAR

1. **V2-35 — bakım paketi seviyesi üç biçimde.** `DB.supportPackageTypes` uzun
   biçim (`'Standart Bakım'`), `DB.tickets[].bakimPaketi` kısa biçim
   (`'Standart'`), `DB.supportPackages[].tip` 7/7 `'Bakım'` (seviye değil,
   cins). `paketOf` düzeltildi ama **sözlük ile veri hâlâ ayrı biçimde**.
   Hangisi kanon: kısa mı uzun mu?
2. **V2-28 — `GV.sales.firsatKazan` üç yazılmamış ekrana bağlanıyor**
   (`app-sozlesme-detay` · `app-odemeplani-detay` · `app-sozlesme-form`).
   Üçü de rota haritasında GÖMÜLÜYOR (müşteri detayı › Finans sekmesi).
   Hedefler oraya çevrilsin mi?
3. **Sıradaki dilim hangisi:** Ekip ve Kaynaklar mı, Ayarlar mı?
   (Ekip ve Kaynaklar kuyruğun kalan 3 ölü hedefini de kapatır.)

---

## 8. İlk üç komut

```bash
cd ~/Developer/Projects/gaviaworks-crm-r2 && git pull
node tasks/qa/kontrol.js && node tasks/qa/brief-dogrula.js && node tasks/qa/acilis-uc.js
cat tasks/ekran-brief.md   # §18 · §19 dilim 3 sözleşmesi
```
