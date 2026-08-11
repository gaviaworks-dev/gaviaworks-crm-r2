# Handoff — 11 Ağustos 2026 · Dilim 4 (Ekip ve Kaynaklar) **YARIDA**

> `claude --continue` sonrası **ilk iş** bunu okumaktır. Hafıza context değil, diskteki defterlerdir.
>
> Repo: `gaviaworks-dev/gaviaworks-crm-r2` · `main` · HEAD `769e408` + 1 commit
> Yerel: `~/Developer/Projects/gaviaworks-crm-r2` · çalışma ağacı **temiz**
> Eski repo `gaviaworks-crm` **dondurulmuştur**.

---

## 0. Neden yarıda — ve yarım kalan dosya YOK

Dilim 4'ün üç menü girdisinden **ikisi yazıldı** (`Personel` · `Zaman ve İzin`),
**biri kaldı** (`Varlıklar`). Bağlam bütçesi tükendiği için durduruldu; iki
ajanın ikisi de bitirdi, hiçbiri düşmedi. **Diskte yarım dosya yok**, 12
eksenin 12'si yeşil, çalışma ağacı temiz ve push edilmiş.

---

## 1. SIRADAKİ OTURUMUN İLK İŞİ — beş ekran

Ajan sözleşmesi hazır: `tasks/ekran-brief.md` **§20** dilim 4'ün sözleşmesidir
ve doğrulanmıştır (`brief-dogrula.js` yeşil). Ajana **olduğu gibi** verilir.

| Sıra | Dosya | Rota | Not |
|---|---|---|---|
| 1 | **`app-varlik.html`** | 93 · 96 · 98 | Üç yüzey sekmesi: **Demirbaş** (`DB.assets` 15) · **Zimmet** (`DB.assignments` 7) · **Filo** (`DB.vehicles` 4). Menü girdisi VAR ve bugün kilitli. `app-satinalma.html` deseni birebir örnektir |
| 2 | **`app-izin-detay.html`** | 88 | **Kuyruğun 2 ölü hedefini kapatır**. `app-zaman.html` › İzin yüzeyi satır kodları buraya bağlanıyor |
| 3 | `app-personel-detay.html` | 81 · 83 · 84 · 86 | **SEKMELİ**: `ozet · performans · egitim · yasamdongusu · zaman · zimmet · aktivite`. Tembel çizim + `#hash` (§18.7 deseni) |
| 4 | `app-personel-form.html` | 82 | — |
| 5 | `app-izin-form.html` | 89 | — |

Sonra `app-demirbas-detay/form` (94-95) ve `app-arac-detay/form` (99-100).

⚠️ Yazılan ekran `shell.js` `BUILT` listesine **ve** `tasks/qa/tarayici.js`
`EKRANLAR` listesine eklenir, sonra rota işaretlenir.

**Sonra DUR.** Ayarlar alanına geçme (Beyar talimatı H).

---

## 2. Bu oturumda kapanan

| Karar | Sonuç |
|---|---|
| **K-27** bakım paketi seviyesi | Kanon **kısa biçim**. 7 paket `ad`→`seviye`, 2 talep `'—'`→`null`, sözlük kısaldı. **Veri kaybı sıfır** — uzun ad `seviye + ' ' + tip` ile 7/7 yeniden kuruluyor (`GV.destek.paketAdi`) |
| **K-28** üç ölü hedef | Üçü de `app-musteri-detay.html?id=…#finans`. Tarama: ortak katman + 33 ekranda bu üç ad yok |
| **K-18** İK borcu | `aktif` tuzağa çevrildi · 7 çağrı yeri `GV.hr.atanabilirler()`e geçti · `ik-ekseni.js` **42 kontrol / 7 eksen** |
| **zimmet çelişkisi** | Envanter `DB.assignments`ten türüyor; yüklemede **4 kayıt** düzeltildi |
| **K-29** | Dilim Ekip ve Kaynaklar — ADR-R2-30 |

ADR'ler: `tasks/kararlar.md` **ADR-R2-26 … ADR-R2-30**.

Yazılan ekranlar: `app-personel.html` (1034) · `app-zaman.html` (1289).
**33 ekran + index · BUILT 34 = diskteki 34, birebir · rota 79/148.**

---

## 3. Ortak katmanda bu oturumda değişen HER imza

| İmza | Değişiklik |
|---|---|
| `GV.hr.istihdamda(e)` · `.atanabilir(e)` · `.atanabilirler()` · `.durum(e)` · `.kayit(e)` | **YENİ** — yaşam döngüsünden türetilir |
| `GV.hr.ozlukGorebilir(e)` · `.maasGorebilir()` · `.ozluk(e, alan)` | **YENİ** — kişisel veri kapısı, `personel` kapsamından türetilir |
| `GV.varlik.*` (12 yordam) | **YENİ** — zimmet tek kaynak; `kabulEt` / `kabulGeriAl` aynı yetki kümesi |
| `GV.destek.paketAdi(p)` | **YENİ** — uzun ad `seviye + tip` birleşimi, tek yerde |
| `GV.destek.paketOf` | Seviye eşleşmesi **düz eşitlik** (K-27 sonrası biçim farkı yok) |
| `DB.supportPackageTypes` | `['Standart','Kurumsal']` (kısaldı) |
| `DB.supportPackages[].ad` | **KALDIRILDI** → `[].seviye` |
| `DB.assetStatuses` | **YENİ** — `Depoda · Zimmet bekliyor · Zimmetli · Aktif · Hurda` |
| `DB.employees[].aktif` | **TUZAK** — okuyan `undefined` alır, `DB.ikBayat.sayac` artar |
| `DB.transitions.leave` | `kapi:'izinBakiye'` → `girisKapi` (`Onaylandı` hedefine) |
| `DB.transitions.project` | `kapi:'projeAktif'` → `girisKapi` (`Aktif` hedefine) |
| `DB.transitions.contract` | `kapi:'sozlesmeAktif'` → `girisKapi` (`Aktif` hedefine) |

---

## 4. Ortak katmanda bulunan ve kapatılan kusurlar

1. **`GV.destek.paketOf` seviyeyi `tip` ile karşılaştırıyordu** — `'Bakım'` vs
   `'Kurumsal'`, hiç tutmuyordu; sessizce `aday[0]`a düşüyordu.
2. **`aktif` alanı 16/16 `true`** — hiçbir şey ayırt etmiyordu; `Offboarding`
   durumundaki EMP-015 yedi ekranda da atama listesindeydi.
3. **Özlük/sağlık alanları kapısızdı** — kan grubu, acil kişi kontrolsüz.
4. **Envanter tutanak yazıldığı an güncelleniyordu**, kabul beklenmiyordu.
5. **ÜÇ KAPI YANLIŞ TARAFTAYDI** — kaynak tarafında durdukları için ileri
   gitmeyi engellerken **iptal/ret yolunu da** kapatıyorlardı:
   - `leave`: bakiyesi 0 olan `IZN-2026-039` ne onaylanıyor **ne
     reddediliyor ne iptal edilebiliyordu** — defterde asılı kalıyordu.
   - `project.Başlatma Onayı`: başlatma koşulunu sağlamayan proje **iptal
     edilemiyordu**.
   - `contract.İmza`: ödeme planı dengesiz sözleşme **iptal edilemiyordu**.
   Üçü de `girisKapi` ile ileri hedefe taşındı. Ölçüldü: iptal/ret engelleyen
   kaynak kapı **0** kaldı.
6. **`ik-ekseni.js` ilk yazımı kendi ölçtüğü şeyi onarıyordu** — ölçümden önce
   `tazeleHepsi()` çağırıyordu ve enjekte edilen kusuru yakalayamadı.
   Ölçüm artık onarımdan önce.

---

## 5. Eksenler — ON İKİSİ DE YEŞİL

`kontrol` · `brief-dogrula` · **`ik-ekseni` (42 kontrol / 7 eksen · YENİ)** ·
`acilis-uc` (59) · `finans-kanon` (22) · `satis-akis` (42) · `odeme-akis` ·
`bayat-alan` (11) · `not-izolasyon` · `rapor-tavan` · `ops-akis` ·
**`tarayici` — 43 ekran × 6 genişlik = 258 ölçüm · nöbetçi 258/258 geçerli ·
204 786 düğüm · taşma 0**

`ik-ekseni` bozulmuş kopyada sınandı: **2 kusur enjekte, 2'si de yakalandı**
(5 bulgu); temiz vaka temiz kaldı.

---

## 6. Operasyon kuyruğu — 43 satır

**Gerçek hedefi olan 37 · dürüstçe devre dışı 6.**
- `app-izin-detay.html` **2** — sıradaki oturumda yazılıyor
- ayrı tam kaydı olmayan departman talebi **4** — panelin kendisi (rota 51-52)

`app-zaman-onay.html` bu turda kapandı → `app-zaman.html?t=onay`.

---

## 7. BEYAR'DAN BEKLENEN KARARLAR

1. **V2-41 — üç demirbaşta sahipsiz zimmet iddiası.** `DMB-2025-007`
   (EMP-009) · `DMB-2026-013` (EMP-011) · `DMB-2026-014` (EMP-012) envanterde
   zimmetli yazıyordu ama **hiç tutanak kaydı yok**. Tek kaynak kararı gereği
   envanter temizlendi; atılan iddia `GV.varlik.sonTazeleme.degisen` içinde
   duruyor. **Üç tutanak mı eksik, envanter mi yanlıştı?**
2. **V2-42 — `Offboarding → Aktif` kenarı yok.** Yanlışlıkla çıkış sürecine
   alınan personel geri döndürülemez. Kenar **eklenmedi**.
3. **V2-45 — dört kaynak taraflı kapı daha.** `project.Test/Kabul` ·
   `project.Kapanış` · `ticket.Müşteri Onayı` · `delivery.İç Kontrol`.
   Dördü de yalnız **geri dönüşü** engelliyor (iptal/ret engellenmiyor), o
   yüzden kusur ilan edilmedi. "İleri gidemiyorsan geri de gidemezsin" bir iş
   kuralı tercihi mi, yoksa bunlar da mı taşınsın?

---

## 8. İlk üç komut

```bash
cd ~/Developer/Projects/gaviaworks-crm-r2 && git pull
node tasks/qa/kontrol.js && node tasks/qa/ik-ekseni.js && node tasks/qa/brief-dogrula.js
cat tasks/ekran-brief.md   # §20 dilim 4 sözleşmesi — ajana OLDUĞU GİBİ verilir
```
