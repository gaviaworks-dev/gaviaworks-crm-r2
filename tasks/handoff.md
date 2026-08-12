# Handoff — 13 Ağustos 2026 · Dilim 6 KAPANDI + tarayıcı kapısı onarıldı

> `claude --continue` sonrası **ilk iş** bunu okumaktır. Hafıza context değil,
> diskteki defterlerdir.
>
> Repo: `gaviaworks-dev/gaviaworks-crm-r2` · `main`
> Yerel: `~/Developer/Projects/gaviaworks-crm-r2` · Eski repo `gaviaworks-crm`
> **DONDURULMUŞTUR**.
>
> Bu dosya bir ÖZET değil ÖLÇÜMDÜR; sayı yazmadan önce ölç.

---

## 0. KESİT — ölçüldü

| | |
|---|---|
| HEAD | `ac1dc30` · **182 commit** (bu oturumda **14**) |
| Ekran | **48 + index** (BUILT 49 = diskteki 49, birebir) |
| Rota | **117/148 yayında · kalan 31** |
| Dağılım | KARŞILIĞI VAR **41** · GÖMÜLÜYOR **94** · YÖNLENDİRİLİYOR **12** · KAPSAM DIŞI **1** |
| **Kendi ekranını almış olup yazılmamış satır** | **SIFIR** (dilim 6 açılışında 11, geçen turda 1) |
| Eksen | **14 eksen TEMİZ** + tarayıcı ekseni TEMİZ |
| Tarayıcı koşumu | **93 girdi × 6 genişlik = 558 ölçüm · 0 bulgu · 165,0 sn** (kapanış koşumu) |
| v2-borç | V2-47 ve V2-92 kapandı · V2-77 satırı düzeltildi · V2-96 açıldı |

---

## 1. TARAYICI KAPISI — 8 SAATTEN 2,7 DAKİKAYA

Devredilen hız 1,1 ölçüm/dakikaydı: 540 ölçüm ~8 saat, yani kapı fiilen
koşturulamıyordu. **Ölçüldü, tahmin edilmedi** — faz faz zamanlandı:

| faz | önce | sonra |
|---|---|---|
| `goto` | 549 ms (`networkidle`in zorunlu 500 ms sessizliği) | 22 ms |
| iskelet/bekleme | 370 ms (sabit `waitForTimeout(350)`) | ~220 ms (durulma + ürün işareti) |
| ölçüm + odak + bağlam | 31 ms | 45 ms |
| **ölçüm başına** | **1366 ms** | **292 ms** |

**Asıl kusur ağdaydı ve `goto`nun `.catch`i yoktu.** Aynı sayfa, gerçek Chromium:
dış yazı tipi erişilebilir → 1050 ms · **cevapsız → 30003 ms ve `goto` FIRLATIYOR** ·
istek kesilirse → 527 ms. Yani ağ engelli bir ortamda 540 ölçümlük kapı ilk
ölçümde ÇÖKÜYORDU. Devredilen "55 sn/ölçüm" tam olarak budur — eksenin
ağırlığı değil, koşum ortamının engellenmiş CDN'i.

**Üç değişiklik:** (1) dış kaynak bir kez alınır, sonrası bellekten aynı bayt
(yazı tipi metrikleri değişmediği için TAŞMA ölçümü de değişmez; alınamazsa
kip `YEDEK` diye basılır) · (2) `networkidle` → `domcontentloaded` + `.gv-app`
+ `document.fonts.ready` · (3) sabit 350 ms → DURULMA + **ürünün kendi yükleme
işareti** (`[aria-busy]` · `.sk`).

⚠️ **SAF SESSİZLİK YETMEDİ VE BU ÖLÇÜLEREK BULUNDU.** `GV.list` gerçek
satırlardan önce **260 ms** iskelet basıyor (`ui.js` `load()`), o aralıkta DOM
hiç değişmiyor. Yalnız sessizliğe bakan ilk sürüm üç liste ekranını **416
düğümle "temiz"** ilan etti (gerçeği 989). Ürünün kendi işareti beklenince
düğüm sayısı birebir geri geldi. **Ders: bir sayfanın sessizliği, bitmişliği
değil BEKLEDİĞİNİ gösterebilir.**

**EŞDEĞERLİK KANITI** — aynı 12 ekran × 6 genişlik = 72 ölçüm, eski ve yeni
eksen: düğüm toplamı **51192 = 51192** · bulgu **0 = 0** · `gv:ready` 66/72 =
66/72 · satır satır **8 alan** (düğüm·ready·denied·başlık·taşma·sprite·odak·
bulgu) karşılaştırıldı → **FARK 0**.
**İKİ YÖNLÜ:** bozulmuş kopyada (taşma·konsol·sprite·odak dört kusur enjekte)
eski **24 bulgu**, yeni **24 bulgu**, satır satır fark 0, dört sınıf da yakalandı.
**AĞ ENGELLİ:** eski eksen 30 sn'de `TimeoutError` ile çöküyor, yeni eksen
koşumu bitiriyor ve kipi `YEDEK` diye basıyor.

Kapı artık kendi hızını da basıyor (`HIZ` · `FAZ` satırları). `GV_ALT=<n>`
alt küme filtresi eşdeğerlik ölçümü içindir, kapı koşumu filtresiz koşar.

### 1.1 Üç satır YANLIŞ ROLDEYDİ — 54 bulgunun tamamı oradan

Devredilen "koşum tamamlanmadı" notu BAYATTI: koşum tamamlandı ve **54 bulgu**
bastı. Hepsi aynı üç satırdan geliyordu (`Personel · Kapalı Form` ·
`Öz-erişim` · `Maskeli`, üçü de `rol:'frontend'`) ve hepsi "GEÇERSİZ ÖLÇÜM:
kabuk `gv:denied` attı" idi.

Kusur kapıda değil, **ölçümün konduğu yerdeydi**: `SEC_BY_ROLE.frontend`
= gundem · operasyon · ayarlar; personel ekranları `data-sec="ekip"`. Kabuk
üç ekranı da DOĞRU biçimde 403 basıyordu; eksen 18 ölçüm boyunca 15 düğümlük
boş kabuğa bakıyordu. Rol `takimlideri` oldu (ekip açık, `permMatrix.maas`
kapalı) ve K-39'un iki yönü artık gerçekten çiziliyor:
`EMP-004` (kendi) → `{acik:true, kaynak:'ozErisim'}` · `EMP-005` (başkası) →
`{acik:false, kaynak:'permMatrix.maas'}` · küme sorusu ikisinde de false.

**DERS (yeni): bir ölçüm satırının ROLÜ de ölçümdür.** Ekranı hiç
göremeyen bir rolle yazılan satır, ekranı değil yetkisiz sayfayı ölçer ve
"kusur" diye rapor eder.

### 1.2 KAPANIŞ KOŞUMU — geçerliliğiyle birlikte

```
✓ TEMİZ · 93 ekran × 6 genişlik = 558 ölçüm · 161,8 sn (ölçüm başına 290 ms)
  geçerli ölçüm 558/558 · geçersiz 0 · taşma 0 · dış kaynak hatası 0
  gv:ready atan 540/558 (18'i kabuk YÜKLEMEYEN dış ödeme ekranları — §8.3)
  ölçülen düğüm toplamı 443.538 (en az 36, en çok 1698, eşik 25)
  yazı tipi kipi: CDN
```
**Rol başına** (ekran / ölçüm): `sahip` 83/498 · `takimlideri` 3/18 ·
oturumsuz 3/18 · `frontend` 1/6 · `musteri` 1/6 · `devops` 1/6.
`403 veya boş kabuk ölçen koşum geçersizdir` — bu koşumda **geçersiz ölçüm
sıfırdır**, yani 558 ölçümün 558'i gerçekten ekranı çizmiştir.

---

## 2. `app-arac-detay.html` YAZILDI — rota 99, son satır

1565 satır. Yedi sekme (`ozet · bakim · yakit · ceza · muayene · kaza · gider`),
`DB.policies` ayrı sekme DEĞİL (`ozet` içinde blok), şeritte ikon yok.
Yedi listenin hepsi tek `liste()` sarmalayıcısından `urlSync:false` +
`archive:false` + `countTarget` alıyor. Alt defterler SALT OKUNUR: ekleyen
yordam olmadığı için hiçbir düğme basılmadı, yokluk BEYANLA kapatıldı.

**BAĞIMSIZ DOĞRULAMA** (ajanın raporuna değil kendi ölçümüme): gerçek
Chromium, altı genişlik → `Araç Detayı` 922 düğüm · `#yakit` 543 · `#kaza` 568 ·
**hiçbir genişlikte taşma, konsol hatası ya da sprite eksiği yok.**

**BÜTÜNLEYEN TARAFIN İŞİ (ajan `assets/` altına dokunmaz):** `shell.js` BUILT
48 → **49** ve `tarayici.js`in kapalı üç girdisi açıldı (90 → **93** girdi).

### 2.1 §22.13'ün BİR SATIRI YANLIŞTI — ajan açılmadan önce ölçülüp düzeltildi

Brief ve V2-77 *"hiçbir araçta ardışık iki dolum yok, KPI BASILMAZ"* diyordu.
Ölçüm: `ARC-001` iki dolum taşıyor (`YKT-2026-092` km 67380 → `YKT-2026-088`
km 68120 · Δ740 km · 52,4 L → **7,08 L/100km**). Satır olduğu gibi
uygulansaydı **türetilebilen tek sayı da basılmayacaktı**.
Sözleşme ölçüme göre yeniden yazıldı: KPI'ın adı "ortalama" DEĞİL **"iki dolum
arası tüketim"** (tek aralığa ortalama demek ölçümü eğilim gibi göstermektir),
türetilebilende sayı + DAYANAK, türetilemeyende `—` + gerçek sebep, ve her iki
dolumun depoyu doldurduğu **VARSAYIMI ekranda yazılı** (`DB.fuelLogs` bunu
söyleyen alan taşımıyor).

Bir yanlış OKUMA da brief'e yazıldı: `inspections.sonTarih` bir vade değil
**son muayene tarihidir** (dördü de geçmişte olduğu için "hepsi geçmiş"
sanıldı; vade `sonrakiTarih`). Üç defterde bayat alan arandı, **üçü de temiz**:
`inspections` 4/4 · `policies` 6/6 · `maintenance` 5/5 türetilenle birebir.

---

## 3. İKİ SAHTE GÜVENCE KAPANDI — ADR-R2-45 · ADR-R2-46

### 3.1 `Gates.personelEvrak` (defterde **V2-47**, handoff §3.1 yanlışlıkla V2-94 dedi)

Yordam `a.zorunlu && a.durum !== 'Tamamlandı'` okuyordu; iki alan da ÖRNEKTE
yok (`{ad, tamam, sorumlu}`), ŞABLONDA var. Süzgeç hiçbir adımı seçemiyor,
kapı süreç kaydı olan **herkesi geçiriyordu**.
Onarım: zorunluluk ŞABLONDAN, tamamlanma ÖRNEKTEN; şablon
`tur+tip+aktif+calismaTipi` ile çözülüyor (3/3 süreç çözüldü, adım adları
birebir tuttu) ve **çözülemezse kapı AÇILMIYOR**.
İki yönlü: `EMP-016` REDDEDİLDİ (Ekipman zimmeti · Oryantasyon eğitimi) ·
`EMP-014`/`EMP-015` GEÇTİ · bozulmuş kopyada dört senaryo da doğru tarafa düştü.
⚠️ `EMP-016` bugün `Aktif` ama kapı reddediyor — tohum veri, kapı ölçmeye
başlamadan önce yapılmış bir geçiş taşıyor.
⚠️ **V2-94 AÇIK KALDI**: `adimlar[].tamam` alanını YAZAN yordam hâlâ yok.

### 3.2 `guvenilir` bayrağı (V2-92)

`icMaliyet('EMP-006')` → `guvenilir:TRUE` · `icMaliyet('EMP-006','2025-01-01')`
→ `false`. Aynı sayı, aynı kaynak, ZIT bayrak; ikisi de bugünkü orana düşüyor.
Tarihsiz çağrı artık `guvenilir:false` + **`donemsiz:true`**; gerekçe `neden`
alanında ve ekran onu artık yordamdan okuyor (L-40). Beş kaynak iki yönlü ölçüldü.

---

## 4. `GV.form` (K-44) — YEDİ EKRANIN YEDİSİNDE DE YAMA KALKTI

| ekran | kalkan yama | gelen yuva | ölçüm |
|---|---|---|---|
| `gorev-form` | iki varyant: salt okunur metin / TEK kişilik select | `multiple:true` | dokunmadan kaydet → birebir · 3. izleyici eklenince dizi yazıldı |
| `tahsilat-form` | çizimden SONRA iliştirilen `<datalist>` | `list:[]` | serbest metin korundu · belgede tek datalist |
| `satinalma-form` | iki alan + `showIf` · elle çıkarılan tutar alanı | `list:[]` · `mask()` | muhasebe: alan var · idari: alan yok, tutar KORUNDU |
| `fatura-form` | faturalı taksiti listeden SİLME | `options[].disabled` | MS-003 görünür+seçilemez · korunan seçenek MS-004 seçilebilir |
| `firsat-form` | dört yerde kapı + maskeli ikiz `<input>` | `perm:'finans'` | **gizli veri kaybı yakalandı** (aşağıda) |
| `teklif-form` | `araEl.value =` DOM yazması | `setValue` | miktar 1→2 · 428000 → 506000 |
| `personel-form` | sekme+bölüm atlama ×2 · kaydetme dalları ×2 | `sections[].mask` | takimlideri'de İKİ SEKME düştü, kayıt birebir korundu |

⚠️ **YAMA KALKINCA GİZLİ BİR KAZA AÇIĞA ÇIKTI (firsat-form).** Güncelleme
döngüsü anahtarın VARLIĞINI sormadan yazıyordu; kapı listeyi süzdüğü sürece
görünmüyordu. Kapı alana taşınınca `satistemsilci` rolünde kaydetmek
`FRS-2026-001`in **450.000 ₺ bütçesini null yapıyordu**. Onarım `if(!(k in v)) return;`
(emsal `app-proje-form.html`). Aynı koruma `personel-form`un üç döngüsüne de kondu.
**DERS: eski koruma kapının kendisinde değil, listenin kuruluşundaydı —
kaldırılması kolay, farkına varılması zor bir koruma.**

⚠️ `teklif-form`un iki `<datalist>`i UYGULANMADI ve sebebi ölçüldü: onlar
`GV.form` alanlarına değil ELLE ÇİZİLEN kalem tablosunun `<td><input list>`
hücrelerine ait; `fields[].list` bileşenin çizdiği alanlar içindir.

---

## 5. Bu oturumda ortak katmanda DEĞİŞEN her imza

| İmza | Değişiklik |
|---|---|
| `GV.gates.personelEvrak(e)` | **ONARILDI** — V2-47 · ADR-R2-46. Zorunluluk şablondan, tamamlanma örnekten; şablon çözülemezse kapı açılmaz |
| `GV.hr.icMaliyet(kod, tarih)` | **DEĞİŞTİ** — V2-92 · ADR-R2-45. Tarihsiz çağrı `guvenilir:false` + `donemsiz:true` + `neden` |
| `GV.hr.kayitOrani(l)` | `donemsiz` alanı eklendi (dönemden bağımsız kaynaklarda `false`) |
| `shell.js` `BUILT` | 48 → **49** (`app-arac-detay.html`) |
| `tarayici.js` | dış kaynak önbelleği · `domcontentloaded`+`fonts.ready` · durulma+ürün işareti · `GV_ALT` filtresi · `HIZ`/`FAZ` satırları · `goto` artık çökmez |

**ADR yazıldı:** ADR-R2-45 · ADR-R2-46.
⚠️ **ADR-R2-41 · 42 · 43 · 44 NUMARALARI REZERVE** — dilim 6'nın K-41…K-44
kararlarına ait, gerekçeleri o turun commit mesajlarında tam, `kararlar.md`e
hâlâ taşınmadı. `kararlar.md`e bu uyarı bir blok olarak yazıldı ki numaralar
boş göründüğü için yeniden kullanılmasın.

---

## 6. AÇIK KALAN İŞ — ölçülmüş, abartılmamış

1. **ADR-R2-41 · 42 · 43 · 44 `kararlar.md`e taşınmalı** (geçen turdan devir).
2. **V2-94** — `DB.onboarding[].adimlar[].tamam` yazan yordam yok; adım
   tamamlanamıyor. Kapı artık ölçüyor ama defteri ilerleten yordam yok.
3. **V2-96 (yeni)** — `tip:'ek'` üç giriş şablonu (`YAZILIM · SATIS · STAJYER`)
   hiçbir örnek sürece uygulanmamış; kapı yalnız `temel` şablonu ölçer.
4. **Ajanın raporladığı ortak katman eksikleri** (hiçbirine yazılmadı,
   borç defterine taşınacak): araç ekseninde `GV.*` ad alanı yok · tek kayıt
   için KPI basan ortak yordam yok · `GV.tone` "sözlükte var ama nötr" ile
   "sözlükte yok"u ayırt edemiyor · poliçe yenileme eşiği yordamı yok ·
   `vehicles.kmSiniri`nin dönemi kayıtta yok.
5. **Gömme dilimi BAŞLAMADI** — 40 kalan satırın 39'u GÖMÜLÜYOR.

---

## 7. Beyar'dan beklenen kararlar

Önceki açıklar: **V2-41 · V2-42 · V2-45** (dilim 4) · **V2-69 · V2-80 · V2-89 ·
V2-71 · V2-72** (dilim 6).

Bu turda eklenen:
1. **V2-96** — `ek` şablonlar süreç açılırken mi uygulanmalı, yoksa bir öneri
   listesi mi? Bugün hiçbir sürece uygulanmamışlar.
2. **`EMP-016` çelişkisi** — kayıt `Aktif` ama onarılan kapı onu reddediyor
   (iki zorunlu adım açık). Tohum veri düzeltilsin mi, yoksa "kapı ölçmeye
   sonra başladı" diye bırakılsın mı?
3. **Yakıt tüketiminin tam-depo varsayımı** — `DB.fuelLogs`a "depo doldu"
   alanı eklenirse varsayım ölçüme döner. Eklensin mi?

---

## 8. İlk üç komut

```bash
cd ~/Developer/Projects/gaviaworks-crm-r2 && git pull
for e in tasks/qa/*.js; do [ "$e" = tasks/qa/tarayici.js ] && continue; node $e >/dev/null 2>&1 && echo "TEMİZ $e" || echo "BULGU $e"; done
node tasks/qa/tarayici.js    # 93 girdi · 558 ölçüm · ~2,7 dakika (eskiden ~8 saat)
```
Sonra: `sed -n '/^### 22.13/,/^### 22.14/p' tasks/ekran-brief.md` — araç
detayının ölçülmüş sözleşmesi ve düzeltilmiş yakıt satırı.

---

## 9. BEYAR'IN ÜÇ KARARI UYGULANDI (13 Ağustos, ikinci yarı)

**1 · V2-96 — kapsam donduruldu ama SESSİZ GEÇİLMEDİ.** `app-personel-detay`
artık ölçüp basıyor: defterde kaç etkin `ek` giriş şablonu var, kaçı BU kişiye
uyuyor, kaçı sürece uygulanmış (bugün 3 / 0 / 0). Kapının yalnız `temel`
şablonu ölçtüğü ve ek şablonun zorunlu adımını arayamadığı ekranda yazılı.

**2 · EMP-016 tohum verisi DÜZELTİLMEDİ.** Kayıt `Aktif`, kapı reddediyor
(Ekipman zimmeti · Oryantasyon eğitimi). Kartta "EKSİK EVRAK bulundu" +
şartname atfı [4.2.3] + "ÇELİŞKİ, BİLEREK DURUYOR" gerekçesi basılıyor.
Ölçüldü: `EMP-016` reddediliyor, `EMP-014` geçiyor.
⚠️ Bu blok BİR TUR BAYAT KALDI ve dersi handoff'a giriyor: kapı onarılınca
ekrandaki "kapı UYGULANMIYOR" cümlesi kendiliğinden yanlışa döndü.
**Kapının hâlini anlatan cümle kapının KENDİSİNDEN türetilmeli.**

**3 · `DB.fuelLogs[].depoDoldu` EKLENDİ** — varsayım ölçüme döndü.
`true` tam depo · `false` kısmi · **`null` BİLİNMİYOR** (ve `null` "kısmi"
değildir). **Beş kaydın beşi de `null`, çünkü defterde doluluğu söyleyen
hiçbir işaret yok** — ne kayıtta not, ne künyede depo hacmi.
Sonucu açıkça kabul edildi: bugün hiçbir araçta tüketim hesaplanmıyor ve
`ARC-001`in 7,08 L/100km değeri de basılmıyor; o sayı ölçüm değil VARSAYIMDI.
Üç yönlü ölçüldü (`ops.js` isteği yakalanıp değiştirilerek): `null` → sayı yok ·
`true` → 7,08 geri geliyor · `false` → sayı yok. **KPI, alan doldurulduğu an
kendiliğinden canlanıyor.**

---

## 10. GÖMME DİLİMİ — GRUPLANDI, DOKUZ SATIR KAPANDI, YÜRÜTME BAŞLAMADI

Gruplama ve dalga sırası: **`tasks/gomme-plani.md`** (8 grup, 5 dalga,
çakışmalar önceden işaretli).

**Ekran yazmadan kapanan dokuz satır** (117 yayında · kalan 31): ölçüldü ki
hedef yüzeyleri zaten yayındaydı — araç detayının altı defteri
(101·103·105·107·109·111) ve personel detayının üç sekmesi (83·84·86).
Her biri gerçek Chromium'da DOLU kayıtla açılıp doğrulandı
(`ARC-003#kaza` 181 düğüm · `EMP-016#yasamdongusu` 187 düğüm ·
`EMP-002#performans` §10.1'e uygun boş durum).

### Sonraki oturumun ilk kararları — plan dosyasında gerekçeleriyle

- ⛔ **ALTI SATIR BLOKE** (102·104·106·108·110·112, araç alt defter formları):
  o defterlere kayıt EKLEYEN yordam YOK (§22.16.7). Kaydetmesi olmayan drawer
  basmak "sahte buton" yasağının form ölçeğidir. **Önce ortak katman.**
  Aynı soru GRUP 3'ün beş drawer'ı için de ajan açılmadan ÖNCE sorulmalı.
- ⚠️ **GRUP 6 ile GRUP 7 ÇAKIŞIR** (ikisi de panele yazar) ve GRUP 7 üç ayrı
  hedefe dokunur → paralel koşamazlar.
- ⚠️ **Satır 125'in hedefi BAYAT**: `app-dokuman.html` V2-68 ile kendisi
  gömüldü. En savunulabilir yorum uygulandı ve yazıldı
  (`app-ayar-log.html › Belge Arşivi › Süresi Dolanlar`), Beyar onayına açık.

**Menü tavanı:** bu turda HİÇ menü girdisi eklenmedi — kapanan dokuz satırın
hepsi var olan ekranların içindeki sekme/blok. Ölçülen görünür girdi:
`frontend`/`stajyer`/`tasarimci` 6 · `musteri` 5 · `satistemsilci` 9 ·
`sahip` 20. `ayar-ekseni` [A9] ve menü/adres kapısı ekseni TEMİZ.
