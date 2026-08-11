# Handoff — 11 Ağustos 2026 (Dilim 3, yarıda kesildi)

> Bu dosya context'in yerine geçer. `claude --continue` sonrası **ilk iş** bunu okumaktır.
> Hafıza context değil, diskteki defterlerdir.
>
> Repo: `gaviaworks-dev/gaviaworks-crm-r2` · `main`
> Yerel: `~/Developer/Projects/gaviaworks-crm-r2` · çalışma ağacı **temiz**
> Eski repo `gaviaworks-crm` **dondurulmuştur** — oradan çalışılmaz, oraya yazılmaz.

---

## 0. NEDEN YARIDA KESİLDİ — okuma sırasında ilk bilmen gereken

Dilim 3 (Proje ve Operasyon) **sekiz ekran** planlanmıştı. Dört ajan aynı anda
açıldı. **Dördü de "monthly spend limit" API hatasıyla düştü** — ama dördü de
düşmeden ÖNCE dosyasını diske yazmıştı. Dosyalar ölçüldü, bütünlükleri
doğrulandı, düzeltildi ve yayına alındı.

**Kalan dört ekran hiç açılmadı** (ajan bile açılmadı):
`app-proje.html` · `app-gorev-form.html` · `app-destek.html` · `app-destek-form.html`

Yarım kalan **dosya yok**. Silinen dosya yok. Diskteki her `.html` tamdır ve
sekiz eksenin sekizinden geçiyor.

---

## 1. Bu oturumda kapanan

### 1.1 Açılış üçlüsü — Beyar'ın dört kararı

| Karar | Ne yapıldı | Ölçüm |
|---|---|---|
| **K-24** | Satın almaya dört yüzey sekmesi: Talepler · Teklif Toplama · Siparişler · Tedarikçiler. Alt listeler tembel çiziliyor, `urlSync:false` | 9 · 4 · 7 satır · 17 kontrol |
| **K-23** | Tahsilat listesinde satıra tıklayınca tahsis defteri + geçmiş drawer'ı. Kuyruk hedefi `app-tahsilat.html?ac=<kod>` | 11 kontrol |
| **K-25** | `GV.fin.tahsisKaldir` artık **silmiyor**: gerekçeli, aktörlü, eksi tutarlı ters kayıt üretiyor (§8.5) | 10 kontrol |
| **K-26** | Sıradaki dilim Proje ve Operasyon — ADR-R2-25 | — |

ADR'ler: `tasks/kararlar.md` → **ADR-R2-22 · 23 · 24 · 25**.

### 1.2 Yayına alınan ekranlar

| Dosya | Satır | Ne kapatıyor |
|---|--:|---|
| `app-proje-detay.html` | 1472 | Rota **11 satır** (31 · 33 · 34 · 36 · 37 · 39 · 40 · 42 · 43 · 45 · 46). Dokuz sekme, tembel çizim |
| `app-gorev.html` | 1069 | Rota 48. Tek liste, 8 kayıtlı görünüm sekmesi |
| `app-gorev-detay.html` | 660 | Rota 49. Kuyruğun **23 satırı** |
| `app-destek-detay.html` | 707 | Rota 55. Kuyruğun **4 satırı** |

Dördü de `shell.js` `BUILT` listesinde. **BUILT 28 = diskteki 28 dosya, birebir.**

---

## 2. SIRADAKİ OTURUMUN İLK İŞİ — dört ekran

Ajan brief'i (`tasks/ekran-brief.md` **§18**) hazır ve **doğrulanmış**; ajana
olduğu gibi verilebilir. Yazılacaklar:

| Dosya | Rota | Not |
|---|---|---|
| `app-proje.html` | 30 | Proje listesi. `data-sec="operasyon"` `data-screen="proje"`. Menüde girdisi VAR ve bugün kilitli |
| `app-destek.html` | 54 | Destek listesi. Menüde girdisi VAR ve bugün kilitli |
| `app-gorev-form.html` | 50 | Görev formu. Menüde girdisi VAR ve bugün kilitli |
| `app-destek-form.html` | 56 | Destek formu |

⚠️ **Bu dördü `BUILT` listesinde DEĞİL** ve bilerek değil: kabuk onları
`markWip` ile kilitli tutuyor, ölü bağlantı doğmuyor. Ekran yazılınca
`shell.js` `BUILT` listesine **ve** `tasks/qa/tarayici.js` `EKRANLAR`
listesine eklenmeli, sonra rota haritası işaretlenmeli.

**Sonra DUR.** Ekip ve Kaynaklar ile Ayarlar alanlarına geçme (Beyar talimatı G).

---

## 3. Ortak katmanda BU OTURUMDA değişen HER imza

Brief §18.9 bunları taşıyor. Özet:

| İmza | Ne değişti |
|---|---|
| `GV.list` `cfg.rowOpen(kayit, render)` | **YENİ.** Satıra tıklayınca çağrılır — tablo satırı, mobil satır, kart, kanban kartı. Satır içindeki `a/button/input/select/textarea/label` tıklaması tetiklemez. Dinleyici bir kez bağlanır |
| `GV.list` `cfg.urlSync:false` | **DAVRANIŞ DEĞİŞTİ — iki yönlü oldu.** Eskiden yalnız yazmayı susturuyordu; artık okumayı da. Aynı sayfadaki ikinci/üçüncü liste bunu bildirmek ZORUNDA |
| `GV.fin.tahsisKaldir(t, f, gerekce)` | **ÜÇÜNCÜ ARGÜMAN EKLENDİ ve ZORUNLU.** Kayıt silmiyor, ters kayıt üretiyor |
| `GV.fin.ciftNet(t, f)` | **YENİ.** Bir tahsilat–fatura çiftinin net tahsisi |
| `GV.fin.dagitimNet(t)` | **YENİ.** Bir tahsilatın tüm faturalara net dağıtımı |
| `GV.fin.canliTahsisler(f)` | **YENİ.** Neti sıfırlanmamış tahsis satırları |
| `GV.fin.tahsisEt` | İdempotency ölçütü **satır değil NET** oldu |
| `GV.fin.tahsilGeriAl` | Tahsis kontrolü **satır değil NET** oldu |
| `GV.proje.kapanisKontrol` | Dört `href` proje detayının sekme çapalarına çevrildi; bakım maddesi müşteri detayına |
| `DB.supplierQuotes[].id` | **YENİ türetilmiş alan** — `talep · tedarikçi`. Uydurma kod değil |
| `DB.approvals[].link` | Dört satır R2 hedeflerine çevrildi (satın alma ×3, değişiklik ×1) |

---

## 4. Ortak katmanda bulunan ve kapatılan DÖRT kusur

Dördü de ekran yazarken çıktı, dördü de **ortak katmanda** düzeltildi — hiçbir
ekran etrafından dolanmadı.

1. **`GV.fin.tahsisKaldir` kaydı `splice` ile SİLİYORDU.** Şartname §8.5 "kayıt
   silinmez, ters işlem üretilir" diyor. Geri alınan tutar hiçbir yerde
   okunamıyordu.
2. **`urlSync:false` yalnız yazmayı susturuyordu, okumayı susturmuyordu.** Tek
   listeli sayfada fark etmezdi; K-24 dört liste koyunca ana listenin
   `?t=onay` adresi üç alt listeye sızdı.
3. **Satır–net ayrımı.** Ters kayıttan sonra defterde iki satır durur. Satır
   sayısına bakan kontroller geri alınmış tahsisi hâlâ duruyor sanıyordu:
   `tahsisEt` aynı çifte yeni tahsisi sonsuza dek reddederdi, `tahsilGeriAl`
   nakit olayını hiç serbest bırakmazdı.
4. **`tarayici.js` oturum parametresini HASH'İN SONUNA ekliyordu.**
   `…?id=X#test` hedefi `…?id=X#test&role=sahip` oluyordu: kabuk `role`u
   okuyamadığı için 403 basıyor, sekme anahtarı da hiçbir sekmeye uymuyordu.
   **Ölçüm ekranı değil hata sayfasını ölçüyor ve YEŞİL yanıyordu — sahte
   temizlik.** Sorgu ile hash artık ayrı kuruluyor.

---

## 5. Brief'te bulunan ve düzeltilen kusur

**`DB.timelogs` `work.js`te DEĞİL, `hr.js`tedir.** Brief §18.0 bu dilimin veri
kümesini `hr.js` olmadan sabitlemişti; iki ajan da zaman defterini okudu ve
`kontrol.js` [3] ekseni ikisini de yakaladı. Ajan **doğru davrandı**: `assets/`
altına dokunmadı, ekranda "defter bu ekranda hiç yüklü değil" diye dürüstçe
yazdı ve raporladı. Ana oturum `hr.js`yi iki ekrana ekledi ve brief'i düzeltti.

---

## 6. Koşulan eksenler — son durum

| Eksen | Kontrol | Sonuç |
|---|---:|---|
| `kontrol.js` | 5 blok | ✓ TEMİZ |
| `brief-dogrula.js` | 4 eksen | ✓ BRIEF KODLA UYUMLU |
| `acilis-uc.js` **(yeni)** | **40** | ✓ TEMİZ · K-24 · K-23 · K-25, her birinde olumlu + olumsuz vaka |
| `finans-kanon.js` | 22 | ✓ TEMİZ |
| `satis-akis.js` | 42 | ✓ TEMİZ |
| `odeme-akis.js` · `ops-akis.js` · `bayat-alan.js` · `not-izolasyon.js` · `rapor-tavan.js` | — | ✓ TEMİZ |
| `tarayici.js` | **33 ekran × 6 genişlik = 198 ölçüm** | ✓ TEMİZ · yatay taşma **sıfır** |

**Dokuz eksenin dokuzu yeşil.**

---

## 7. Operasyon kuyruğu — 43 satırın son hâli

| Hedef | Satır | Durum |
|---|--:|---|
| `app-gorev-detay.html` | **23** | ✅ gerçek |
| `app-destek-detay.html` | **4** | ✅ gerçek |
| `app-satinalma.html?ac=` | 2 | ✅ gerçek (K-24) |
| `app-tahsilat.html?ac=` | 2 | ✅ gerçek (K-23) |
| `app-teklif-detay.html` | 1 | ✅ gerçek |
| `app-proje-detay.html#degisiklik` | 1 | ✅ gerçek |
| `app-musteri-detay.html` | 1 | ✅ gerçek |
| `app-istalebi-detay.html` | 4 | ✗ dürüstçe devre dışı |
| `app-izin-detay.html` | 2 | ✗ dürüstçe devre dışı |
| `app-onanaliz-detay.html` | 1 | ✗ dürüstçe devre dışı |
| `app-komisyon-detay.html` | 1 | ✗ dürüstçe devre dışı |
| `app-zaman-onay.html` | 1 | ✗ dürüstçe devre dışı |

**Gerçek hedefi olan: 34 · dürüstçe devre dışı: 9.** (Oturum başında 2 / 41'di.)

Devre dışı dokuzu **gizlenmedi**: düğme `disabled` basılıyor ve ipucunda hedef
dosya adı yazılı (`app-operasyon.html:258-260`). Beşi de bu dilimin kapsamı
dışında — `tasks/v2-borc.md` **V2-27**.

---

## 8. Sayılar

| | |
|---|---:|
| Yayında ekran (`ls app-*.html` + index) | **28** |
| `shell.js` BUILT | **28** — diskle birebir |
| Rota haritası işaretli | **69 / 148** (oturum başında 48) |
| Bu oturumdaki commit | **19** |
| Kuyruk gerçek hedef | **34 / 43** |
| Kapanan borç | V2-22 · V2-24 · V2-25 |
| Açılan borç | V2-27 · V2-28 · V2-29 · V2-30 |

---

## 9. BEYAR'DAN BEKLENEN KARARLAR

1. **K-25 yetki daraltması.** K-25 "yetki Finans yöneticisi" diyor; 27 rollük
   sözlükte o adda rol **YOK** ve `finans` yetkisi **8 rolde** açık (`sahip ·
   genelmudur · sistem · operasyon · satismudur · pm · muhasebe · satinalma`).
   Geri almayı bu kümeden dar bir role bağlamak, tahsisi kuran kullanıcının
   kendi hatasını düzeltememesi demekti — geri alma, yapmaktan daha ağır
   koşula bağlanamaz. **Kapı şu an kurmakla EŞİT tutuluyor**, gerekçe zorunlu.
   Daraltılacaksa değişecek tek yer `domain.js` `tahsisKaldir` içindeki tek
   `can()` satırı. **Hangi rol?**
2. **V2-28.** `GV.sales.firsatKazan` önerileri `app-sozlesme-detay.html` ·
   `app-odemeplani-detay.html` · `app-sozlesme-form.html` üretiyor. Üçü de
   rota haritasında GÖMÜLÜYOR (müşteri detayı › Finans sekmesi). Hedefler
   oraya çevrilsin mi?
3. **Rota 71 kararı düzeltildi** (KARŞILIĞI VAR → GÖMÜLÜYOR, K-23 gereği).
   Aynı düzeltme **rota 114** (`app-satinalma-detay.html`) için de yapıldı.
   Onay bekliyor.

---

## 10. İlk üç komut

```bash
cd ~/Developer/Projects/gaviaworks-crm-r2 && git pull
node tasks/qa/kontrol.js && node tasks/qa/brief-dogrula.js && node tasks/qa/acilis-uc.js
cat tasks/ekran-brief.md   # §18 dilim 3 sözleşmesi — ajana OLDUĞU GİBİ verilir
```
