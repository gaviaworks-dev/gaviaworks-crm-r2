# Handoff — 12 Ağustos 2026 · Dilim 5 (AYARLAR) **BİTTİ**

> `claude --continue` sonrası **ilk iş** bunu okumaktır. Hafıza context değil,
> diskteki defterlerdir.
>
> Repo: `gaviaworks-dev/gaviaworks-crm-r2` · `main`
> Yerel: `~/Developer/Projects/gaviaworks-crm-r2` · Eski repo `gaviaworks-crm` **DONDURULMUŞTUR**.
>
> ⚠️ Bir önceki handoff (11.08) **altı commit geride kalmıştı** ve dört sayısı
> yanlıştı: kuyruk 37/6 diyordu (gerçek 39/4), 33 ekran diyordu (gerçek 35),
> rota 79 diyordu (gerçek 84), 12 eksen diyordu (gerçek 14). Bu dosya bir
> ÖZET değil ÖLÇÜMDÜR; sayı yazmadan önce ölç.

---

## 0. Bu dilimde ne bitti

**AYARLAR ZİNCİRİ TAMAM.** Menüde hedefi olup diskte olmayan ekran **SIFIR**.

| Ekran | Satır | Sekme | Rota |
|---|---:|---|---|
| `app-ayar-profil.html` | 556 | `hesap` · `bildirim` | 134 · 135 |
| `app-ayar-sirket.html` | 1122 | `sirket` · `departman` · `kullanici` · `rol` · `yetki` · `onay` | 136–141 |
| `app-ayar-entegrasyon.html` | 819 | `saglayici` · `odeme` · `otomasyon` · `hata` | 142 · 143 |
| `app-ayar-log.html` | 772 | `kayit` · `arsiv` · `kalite` | 144 · 145 · 146 |

**39 ekran + index · BUILT 40 = diskteki 40, birebir · rota 97/148.**

---

## 1. SIRADAKİ OTURUMUN İLK İŞİ

Rota defterinde **KARŞILIĞI VAR olup yayında olmayan 11 satır** kaldı
(ölçüldü, `ayar-ekseni [A9]` her koşumda doğruluyor):

| Rota | Dosya | Not |
|---|---|---|
| 81 | `app-personel-detay.html` | **SEKMELİ** — `ozet · performans · egitim · yasamdongusu · zaman · zimmet · aktivite` (§20.5) |
| 82 | `app-personel-form.html` | maaş/saatlikÜcret **XOR** sözleşmesi (`org.js`) |
| 89 | `app-izin-form.html` | — |
| 94 · 95 | `app-demirbas-detay/form.html` | — |
| 99 · 100 | `app-arac-detay/form.html` | Bakım · yakıt · ceza · muayene · kaza · gider defterleri **buraya** (§20.7) |
| 32 | `app-proje-form.html` | V2-39 — `GV.sales.firsatKazan` önerisi buraya bağlanıyor |
| 115 | `app-satinalma-form.html` | V2-40 — "Yeni Talep" düğmesi buraya bağlanıyor |
| 123 · 124 | `app-dokuman.html` / `-detay` | ⚠️ **V2-68 — ÖNCE BEYAR KARARI.** `app-ayar-log.html › arsiv` sekmesi aynı yüzeyi kapsadı |

⚠️ **AJAN AÇMADAN ÖNCE:** o ekranların ihtiyacı olan HER imza
`tasks/ekran-brief.md`e yazılır. Dilim 5'te bu kural bir kez çiğnendi ve
**dört ajanın dördü de** ortak katmanı kazdı (ajan başına ~80 araç çağrısı).
Kazının ilacı §21.11'de: eksik bulunan imzalar oraya yazıldı.

---

## 2. Ortak katmanda BU OTURUMDA değişen HER imza

| İmza | Değişiklik |
|---|---|
| `GV.shell.ayarSekmeleri(ekran)` · `.ayarSekmeHam` | **YENİ** — §3.3, sekmeler yetkiden üretilir, kural TEK yerde |
| `GV.entegrasyon.*` (11 yordam) | **YENİ** — K-34, bağlantı durumu türetilir |
| `GV.ayar.modulAnahtarlari/Acik/Yetkisi/Ayarla` | **YENİ** — modül anahtarı, kapı iki yönde de aynı |
| `GV.audit.oku()[].id` · `[].kod` | **YENİ ALAN** — birleşik deftere kararlı satır kimliği (`GV.list` `key:`) |
| `shell.js` `dosyaIzinli()` | **YENİDEN YAZILDI** — K-36, menü kaydını okur (ADR-R2-36) |
| `ui.js` `GV.tabs` · `wireChipbar` | **DÜZELTİLDİ** — K-37, çizim anında `scrollIntoView` yok (ADR-R2-37) |
| `shell.js` `BUILT` | 36 → **40** |

---

## 3. Ortak katmanda bulunan ve kapatılan kusurlar

1. **KAPI KUSURU (K-36 · ADR-R2-36).** `dosyaIzinli()` iki yerden bozuktu:
   menü kaydının `roles:` kapısı doğrudan adrese **hiç uygulanmıyordu**, ve
   `SCREEN_DENY` **dosya adıyla** aranıyordu (sözlük **ekran adıyla**
   anahtarlı → arama hiç tutmuyordu). Değişmez `shell.js`in **kendi
   yorumunda** yazılıydı — defter–kod ayrışması.
   Ölçüldü (27 rol × 20 hedef, gerçek Chromium): menüde gizli olup adresle
   açılabilen çift **69 → 0**; `ekranAcilabilir()` yanlış `true` **254 → 0**.
2. **ERİŞİLEBİLİRLİK (K-37 · ADR-R2-37).** `GV.tabs` **ve** `wireChipbar`
   çizim anında `scrollIntoView` çağırıyordu; tarayıcının sıralı odak
   başlangıç noktası oraya kayıyor, ilk `Tab` skip link'i, rail'i, menüyü ve
   üst çubuğu **atlıyordu**. `wireChipbar` yayılımı daha genişti.
3. **VERİ ÇELİŞKİSİ (K-34 · ADR-R2-34).** `DB.integrations` dört kayıtta
   `durum:'Bağlı'` diyordu, aynı veri dosyası "hiçbiri çalışmıyor" yazıyordu.
   Kayıt silinmedi, **iddia ile ölçüm ayrıştırıldı**.
4. **`kontrol.js` kapsamı dardı** — `DB.*` adlarını yalnız `assets/data/`
   altında arıyordu; omurgada doğan `DB.bayatAktif` "tanımsız" uyarısı
   basıyordu. Omurga tanımları eklendi, uyarı **1 → 0**.
5. **Rota §1 özet tablosu satırlarıyla ayrışmıştı** (V2-67): `44 · 91`
   diyordu, gerçek `42 · 93`; "bugün yayında 17" beş dilim güncellenmemişti
   (gerçek 84). Düzeltildi, `[A9]` mandalı kondu.

---

## 4. Eksenler — ON ALTISI DA YEŞİL

`kontrol` · `brief-dogrula` · `aktif-ekseni` · `bayat-alan` · `finans-kanon` ·
`ik-ekseni` · `kapi-yonu` · `rapor-tavan` · `acilis-uc` · `satis-akis` ·
`odeme-akis` · `not-izolasyon` · `ops-akis` ·
**`ayar-ekseni` (40 kontrol / 9 eksen · YENİ)** ·
**`tarayici` — 66 ekran × 6 genişlik = 396 ölçüm · geçerli 396/396 ·
316 158 düğüm · taşma 0**

`ayar-ekseni` bozulmuş kopyada sınandı: **A8'de 2 kusur enjekte, 2'si de
yakalandı**; temiz vaka temiz kaldı. `tarayici` odak kontrolü de iki yönlü
sınandı (K-37: 3/3 yakalandı, temiz kopyada 0/3).

---

## 5. Kuyruk — 43 satır, DEĞİŞMEDİ

**Gerçek hedefi olan 39 · dürüstçe devre dışı 4 · kırık 0.**
Devre dışı 4'ün hepsi departman talebi: tam kaydı panelin kendisidir
(rota 51-52 GÖMÜLÜYOR). Bu dilim kuyruğa dokunmadı.

---

## 6. BEYAR'DAN BEKLENEN KARARLAR

Önceki üç karar (**V2-41 · V2-42 · V2-45**) hâlâ açık. Bu dilimde eklenenler:

1. **V2-68 — `app-dokuman.html` nereye?** ADR-R2-06 merkezî arşivi Ayarlar'ın
   yönetim bloğunda **ayrı girdi** yapıyordu (yönetici 20→21 girdi). Bu turda
   `app-ayar-log.html › arsiv` sekmesi **aynı yüzeyi** kapsadı. Rota 123-124
   bilerek ✅ işaretlenmedi. **Beşinci ayar girdisi mi açılsın, yoksa 123-125
   bu sekmeye mi gömülsün?**
2. **V2-61 — onay zincirinde iki tanımsız rol.** `AKS-SAT-1` adım 2
   `rol:'finans'`, `AKS-IZN-1` adım 1 `rol:'yonetici'`. İkisi de 27'lik rol
   sözlüğünde **yok**. Rol mü, rol SINIFI mı?
3. **V2-64 — kendi maaşını görme.** `frontend` kendi profilinde `maas`
   alanını göremiyor (`permMatrix.maas` kapısı). Kanonun bilinen sonucu.
   "Kendi maaşı" ayrı bir kapı mı olmalı?
4. **V2-62 · V2-63 · V2-65** — ortak katman boşlukları (KPI'da "ölçülemedi"
   kipi yok · `GV.hr.maas(e)` yok · `wireChipbar` `GV.on` kullanmıyor).

---

## 7. İlk üç komut

```bash
cd ~/Developer/Projects/gaviaworks-crm-r2 && git pull
node tasks/qa/kontrol.js && node tasks/qa/ayar-ekseni.js && node tasks/qa/brief-dogrula.js
sed -n '/## 21\./,$p' tasks/ekran-brief.md   # dilim 5 sözleşmesi + §21.11 imza boşlukları
```
