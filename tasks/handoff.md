# Handoff — 12 Ağustos 2026 · Dilim 6 (KALAN DOKUZ EKRAN) **SEKİZİ BİTTİ**

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
| HEAD | `c6a3406` · **168 commit** (bu oturumda **33**) |
| Ekran | **47 + index** (BUILT 48 = diskteki 48, birebir) |
| Rota | **107/148 yayında · kalan 41** |
| Dağılım | KARŞILIĞI VAR **41** · GÖMÜLÜYOR **94** · YÖNLENDİRİLİYOR **12** · KAPSAM DIŞI **1** |
| Kalanın dağılımı | **39** GÖMÜLÜYOR satırı + **1** KARŞILIĞI VAR (`app-arac-detay.html`) + **1** KAPSAM DIŞI (`app-sohbet.html`, ADR-R2-03) |
| Eksen | **14 eksen TEMİZ** · `tasks/qa/` altında 15 dosya |
| v2-borç | 102 madde satırı · bu dilimde **13 açıldı, 6 kapandı** |
| Tarayıcı koşumu | ⚠️ **BU DİLİMİN EKRANLARI TARAYICIDA ÖLÇÜLMEDİ** — bkz. §1 |

**Kendi ekranını almış olup yazılmamış satır: BİR** (`app-arac-detay.html`).
Dilim 6 açılışında ON BİRDİ; ikisi V2-68 kararıyla GÖMÜLÜYOR'a çevrildi,
sekizi yazıldı.

---

## 1. ⚠️ TARAYICI ÖLÇÜMÜ YAPILMADI — ölçülmemiş işi ölçülmüş sayma

`tasks/qa/tarayici.js` bu turda **90 girdiye** çıkarıldı (24 yeni girdi,
kayıt seçimi ölçümden geldi) → 6 genişlikte **540 ölçüm**. Koşum başlatıldı ve
**tamamlanmadı**: üç saatte **204/540** ölçümde (90 ekranın 34'ünde) kaldı,
hız ~1,1 ölçüm/dakika, tahmini bitiş ~5 saat daha.

**Kısmi sonuç bu dilim için SIFIR bilgi taşıyor.** Sebebi: dilim 6'nın 24
girdisi `EKRANLAR` listesinin **sonundadır**; koşum 34. ekranda
(`app-proje.html`) kaldı ve bu dilimin dokuz ekranından **hiçbirine
ulaşmadı**. Bu yüzden kısmi çıktı **GEÇERSİZ sayıldı** ve rapor edilmedi.

**Ne VAR:** sekiz ekran ajanının her biri kendi ekranını kendi Chromium
koşumunda ölçtü ve raporladı (altı genişlikte taşma · konsol · sprite · odak
zinciri · tuzak sayaçları). O ölçümler commit mesajlarında yazılı ve gerçektir.

**Ne YOK:** deponun kendi ekseninin tek, seri, karşılaştırılabilir koşumu —
yani "kaç sayfa, kaç düğüm, kaç geçerli ölçüm, kaç taşma, rol başına kaç"
sorusunun bu dilim için **cevabı yoktur.** Ajan ölçümü ile eksen koşumu aynı
şey değildir: ajan kendi yazdığı ekranı ölçer, eksen 90 girdiyi aynı koşumda
ve aynı ölçütlerle ölçer.

### Sonraki oturumun yapacağı
1. `app-arac-detay.html` yazıldıktan **sonra** `tasks/qa/tarayici.js` içindeki
   üç kapalı girdiyi aç (dosyada yorum bloğu hâlinde, kayıt seçimi gerekçesiyle
   yazılı) → 93 girdi · 558 ölçüm.
2. Koşumu **arka planda** başlat ve **ön planda bekleme** — 10 dakikalık kabuk
   sınırını aşıyor.
3. Koşum sürerken **hiçbir repo dosyasına dokunma.** (Bu turda `tasks/` altına
   yazıldı; `tarayici.js` yalnız `html/js/css/svg` sunuyor ve `tasks/**` ölçülen
   yüzeye girmiyor, ama disiplin korunmalı.)
4. Geçerliliği bas: kaç sayfa · kaç düğüm · kaç geçerli ölçüm · kaç taşma ·
   **rol başına kaç**. `403 veya boş kabuk ölçen koşum geçersizdir.`

---

## 2. YARIM KALAN İKİ İŞ — devam edilebilir hâlde

### 2.1 `app-arac-detay.html` (rota 99) — tek yazılmamış ekran

**Sözleşmesi brief'te TAM yazılı: §22.13.** Tasarım tartışılmış ve kapanmış:

- **YEDİ SEKME:** `ozet` · `bakim` · `yakit` · `ceza` · `muayene` · `kaza` ·
  `gider`. Altı olay defteri + özet.
- **`DB.policies` (6 poliçe) YEDİNCİ OLAY SEKMESİ OLMAZ** ve gerekçesi yazılı:
  poliçe bir **mülkiyet niteliğidir**, olan bir olay değil. `ozet` sekmesinde
  "Sigorta ve poliçe" bloğu olarak durur.
- **Şeritte İKON YOK** (§22.13 · V2-04 — dokuz ikonlu şerit 1440px'te taşıyor).
- Sekme mekaniği `app-proje-detay.html` deseninin birebiri; tembel çizim,
  `#hash` derin bağlantısı, her sekmede `urlSync:false`.
- **Ortalama yakıt tüketimi KPI'ı BASILMAZ** (V2-77): hiçbir araçta ardışık iki
  dolum yok, iki km farkı olmadan türetilemez. `—` + sebep.
- ⚠️ `aktif` alanı `fuelLogs` · `vehicleExpenses` · `policies` defterlerinde
  **tuzaksız** ama **okunmaz** (§22.5) — pasiflik `GV.arsivli(r)`den geçer.
- Alt defterlere kayıt EKLEYEN yordam **yok** (§22.16.7) → yedi defter salt
  okunur, "yeni bakım ekle" düğmesi basılmaz.
- Kayıt seçimi ölçüldü: `ARC-001` en kalabalık (2 bakım · 2 yakıt · 1 ceza ·
  4 gider · 2 poliçe) · `ARC-003` kaza kaydı OLAN tek araç ve `Serviste` ·
  `ARC-002` tek kiralık.

Emsal ekranlar: `app-proje-detay.html` (dokuz sekme) ·
`app-demirbas-detay.html` (bu turda yazıldı, kardeş yüzey) · `app-arac-form.html`.

### 2.2 `GV.form` (K-44) yaması kaldırılmamış YEDİ ekran

**Sözleşme YAZILDI, ölçüldü ve iki ekranda uygulandı.** Tasarım onaylıdır;
sonraki oturum onu yeniden tartışmasın — yalnız kalan yedi ekranı taşısın.

**Sözleşme (brief §5.2 · §5.3'te tam):**
`fields[].perm` · `.mask(rec)` · `.maskSebep` · `.list[]` · `.multiple` ·
`.options[].disabled` · `sections[].perm` · `.mask(rec)` ·
`form.setValue(key, deger)` · `form.kapaliAlanlar()`.

⚠️ **Çekirdek karar (ölçülmüş):** formda kapı **maskelemez, ÇIKARIR** — alan
çizilmez, doğrulanmaz ve `read()` çıktısında **anahtar olarak bulunmaz**.
`showIf` ile farkı gerçek Chromium'da ölçüldü ve §5.2'de tablo hâlinde:
`showIf` ile gizlenen alan `read()`te `''` döner ve kaydetmede gerçek değeri
**siler**. Bu yüzden §14'e iki yasak eklendi (15 · 16).

**Uygulanan iki ekran (emsal olarak okunmalı):**
- `app-proje-form.html` — 3 kapı yeri → 1 (`sections[].perm:'finans'`).
  Sekmeyi bileşen kendisi düşürüyor; kaydetme döngüsü `k in v` ile geçiyor;
  gerekçe `form.kapaliAlanlar()`tan okunuyor. Ölçüldü: kapı kapalıyken
  `sozlesmeTutari 880000` ve `butce 540000` **korundu**.
- `app-izin-form.html` — DOM yazma → `form.setValue('gun', n)`.

**Kalan yedi ekran ve her birinde ne yapılacak:**

| Ekran | Kalkacak yama | Gelecek yuva |
|---|---|---|
| `app-personel-form.html` | `maasAcik`/`ozlukAcik` bölüm atlama ×2 + kaydetme listesi ×2 (**39 koşul isabeti**) · 3 dizi alan salt okunur | `sections[].mask(rec)` (K-39 öz-erişimi tam bu desen: satır bazlı kapı rol bazlıyı gevşetir) · `multiple:true` |
| `app-firsat-form.html` | `TEMEL_ALANLAR`ın **iki varyantı** + maskeli ikiz alan (`GV.perm.mask('', 'finans')` değerli readonly alan) + aside dalı — **4 yer** | tek alan + `perm:'finans'`. ⚠️ Maskeli ikiz alan §14.16'nın tam tarifi; bugün `KAYIT_ALANLARI`ndan dışlandığı için veri kaybı YOK ama desen yasaklandı |
| `app-fatura-form.html` | `taksitSecenekleri` faturalı taksiti **listeden ÇIKARIYOR** (`!faturaliMi(m.kod) \|\| m.kod === seciliKod`) — etiket metni `'— faturası var: FTR-…'` hazır ama basılamıyor | `options[].disabled:true` — görünür, seçilemez. `validate` mevcut değeri tolere eder (KORUNAN SEÇENEK) |
| `app-tahsilat-form.html` | `datalist` çizimden **SONRA** DOM'a iliştiriliyor (`ui.js` satır numarası yorumda gömülü, bayatlar) · 1 DOM değer yazma | `list:[]` · `setValue` |
| `app-teklif-form.html` | kalem tablosunda elle `<datalist>` ×2 · `araEl.value =` (türetilmiş ara toplam) · `canFinans` dalları | `list:[]` · `setValue` · `perm:'finans'` |
| `app-gorev-form.html` | `yardimci`/`izleyiciler` salt okunura düşürülmüş (V2-32) | `multiple:true` |
| `app-satinalma-form.html` | `butceKodu` için `select` + `showIf` **metin çifti** · `canFinans` dalları | `list:[]` (tek alan) · `perm:'finans'` |

**Ölçüm yöntemi (kayıtlı, yeniden tasarlanmasın):** her ekranda yamayı
kaldırdıktan sonra **iki yön** ölçülür — kapı açık rolde alan var ve `read()`
anahtarı taşıyor; kapı kapalı rolde alan yok, anahtar yok ve
`Object.assign(rec, form.read())` **mevcut değeri korumuş**. Ölçüm gerçek
Chromium'da yapılır (`playwright` repo kökünden `require` edilebilir; betik
depoya bırakılmaz).

**Bu sözleşme turunda kapanan:** V2-17 · V2-18 · V2-32 · V2-79 · V2-83 ·
V2-86 · V2-87 · V2-88. **Kapanmayan (kapsam):** V2-85 (kayıt bazlı `duzenle`
kapsamı — sözleşme meselesi değil, kapsam meselesi).

---

## 3. SAHTE GÜVENCE — BİR SONRAKİ OTURUMUN İLK İŞİ

> Bu iki madde 102 satırlık borç defterinin içinde **sıradan borç gibi
> durmamalı.** İkisi de aynı sınıftır ve o sınıf bu deponun en pahalı hata
> türüdür: **görünen ama reddetmeyen yapı.** Bir kapı varmış gibi durur,
> ölçüm yeşil yanar, kural hiç uygulanmaz. L-31'in tarifi: *"uygulanmayan
> kural, yanlış kuralın en sinsi hâlidir."*

### 3.1 V2-94 · `Gates.personelEvrak` HİÇ EVRAK ÖLÇMÜYOR

Yordam `adim.zorunlu && adim.durum !== 'Tamamlandı'` okuyor. Ölçüldü:
**ÖRNEK** adımlar (`DB.onboarding[].adimlar`) yalnız `{ad, tamam, sorumlu}`
taşıyor — `zorunlu` ve `durum` alanları **yok**. O alanları taşıyan
`DB.onboardingTemplates[].adimlar`, yani **ŞABLON**.

Sonuç iki yönde de yanlış:
- Giriş süreci **OLAN** 3 personelde (`EMP-014` · `EMP-015` · `EMP-016`) kapı
  **her zaman geçiyor** — eksik evrak diye bir şey ölçmüyor.
- Süreci **olmayan** 13 personelde "onboarding açılmamış" diye reddediyor —
  yani reddettiği tek şey evrak eksikliği **değil**.

Üstelik kenar bugün **ulaşılamaz**: durum dağılımı `Aktif 15 · Offboarding 1`,
`Onboarding` **0**. Yani kapı ne ölçülüyor ne ateşleniyor. Şartname [4.2.3]
*"Zorunlu evrak eksikken personel Aktif olamaz"* diyor ve bu hüküm bugün
**hiç uygulanmıyor**.

Birlikte okunacak: **V2-94** (`adimlar[].tamam` yazan yordam yok — adım
tamamlanamıyor bile) ve **V2-47** (kapının kendisi).

### 3.2 V2-92 · `guvenilir` bayrağı ADR-07'nin kapattığı hatayı GÖRÜNMEZ KILIYOR

ADR-07 şu hatayı kapatmıştı: *"bugünkü personel maliyetini geçmiş zamanlara
uygulama"* — bir maaş zammı geçmiş projelerin kârlılığını geriye dönük
değiştiriyordu. Yordamın kendi yorumu bunu yazıyor: *"Sessizce bugünü
kullanmak tam da kapatılan hataydı."*

Ama ölçüldü:
```
GV.hr.icMaliyet('EMP-006')               → guvenilir: TRUE   (bugünkü orana düştü)
GV.hr.icMaliyet('EMP-006','2025-01-01')  → guvenilir: false
```
**Tarihsiz çağrıda bayrak `true` dönüyor** — yani "bugünkü orana düştüm"
bilgisi bayrakta **kayboluyor**. Bayrak yalnız `tarih` verildiğinde anlamlı.
Brief'i okuyup bayrağa güvenen bir ekran, güvenilmez bir sayıyı **güvenilir
diye basar** ve ADR-07'nin kapattığı hata sessizce geri döner.

Personel kartı bunu cümleyle telafi etti (`kaynak` + `formul` birlikte
basılıyor) ama **telafi ekranda, kusur yordamda**. Önerilen: tarihsiz dalda
ya `guvenilir:false` ya üçüncü bir kip (`donemsiz:true`).

---

## 4. `[B5]` EKSENİNİN BİLİNEN SINIRI

`brief-dogrula.js` `[B5] İDDİA KOŞUMU` bu turda yazıldı (V2-81 kapandı) ve
brief'in bir adı **yanlış anlatmasını** ölçüyor — B2-B4 yalnız adın kodda var
olduğunu ölçüyordu. Dört alt kontrol: alan varlığı · dizi/skaler tip
tutarlılığı · "dizi alanı" listesi · örnek çağrının argüman tipi. İki yönlü
sınandı: temiz kopyada **0 bulgu**, bozulmuş kopyada **5/5 kusur yakalandı**.

⚠️ **SINIRI: `yoksay` bloğu içindeki satırları GÖRMEZ.** Eksen brief'i
okurken `<!-- brief-dogrula:yoksay-basla/bitir -->` bloklarını **söküyor**
(gerekçesi doğru: brief hatalı yazımları ÖRNEK olarak anıyor ve eksen onları
gerçek iddia sayardı). Ama bu bir kör nokta üretiyor:

`reasonCodes[].tur === 'cikis'` hatası brief'in **iki yerinde** yaşıyordu.
`[B5.2]` §20.2'deki kopyasını **yakaladı**; §22.14'teki İKİNCİ kopyayı
`yoksay` bloğunun içinde kaldığı için **kaçırdı**. O kopyayı bir ajan buldu,
eksen değil.

**Kural:** bir hatalı yazımı brief'te ÖRNEK olarak anacaksan, mümkünse
`yoksay` bloğu kullanma — **çağrıyı/deseni KURMADAN anlat.** §21.13'ün
`GV.fmt.days` satırı bu turda tam bu yüzden yeniden yazıldı ve `yoksay`
bloğuna gerek kalmadı. `yoksay` son çaredir ve her kullanımı bir kör nokta
açar.

İkincil sınır: eksen **alan okuma** ve **yordam argümanı** sınıflarını
yakalar. Semantik hatalar (`maasGorebilir({})` — boş nesnenin kayıt sayılması)
bu sınıfta **değildir**; o, yanlış çağrının yanlış cümle üretmesini imkânsız
kılarak **kodda** kapatıldı (K-42).

---

## 5. BRIEF'İN ÜÇ YANLIŞ SATIRI — düzeltilmiş hâli · DOĞRULANDI

Dilim 6'da sekiz ajan brief'in **on satırını** yanlış/bayat/eksik buldu.
Tam liste ve bedelleri **§21.13'te tablo hâlinde** yazılı — bu turda eklendi
ve `brief-dogrula` yeşil.

Son turda bulunan üçünün düzeltilmiş hâli:

| # | Yanlış hâli | Düzeltilmiş hâli · nerede |
|---|---|---|
| 1 | §22.14 "4 personel durumu ton sözlüğünde YOK (V2-46)" | **BAYAT** — ölçüldü: `Onboarding→info` · `İzinli→warn` · `Offboarding→warn` var, `Taslak`/`Pasif` açıkça nötr, `Aktif→ok`; sözlükte olmayan tek durum `Ayrıldı` ve o **bilerek** nötr. **V2-46 kapandı.** Ekran artık `GV.tone(deger)` ile ÖLÇER, "dört durum nötr" demez |
| 2 | §22.14 "`sertifika` boolean (4/4 `false`)" | **YANLIŞ** — 2/4 `true` (`EGT-2026-010` · `EGT-2026-009`). Satır düzeltildi + "sayı ölçülür, brief'ten alınmaz" notu |
| 3 | §22.14 çıkış neden kodları `tur === 'cikis'` | §20.2 düzeltmesi bu satıra **propagate etmemişti**. `(c.tur \|\| []).indexOf('cikis') !== -1` → **7 kod**. Tür dağılımı da yazıldı + "pasife alma karşılığı bir tür YOKTUR" ölçümü |

**DERS §21.13'te YAZILI (doğrulandı):** *"Yanlış bir satır, eksik bir satırdan
pahalıdır — eksik olan aranır, yanlış olana GÜVENİLİR."* On satırlık tablo,
üç kural (iddia koşulur · kapanan borcun ATIFLARI da aranır · ajan brief ile
ölçüm çelişirse ÖLÇÜMÜ seçer ve çelişkiyi raporlar) ve `[B5]`'in kör noktası
orada yazılı.

---

## 6. Bu oturumda ortak katmanda DEĞİŞEN her imza

| İmza | Değişiklik |
|---|---|
| `GV.approval.adimMuhatap(adim, kayit)` · `.ILISKILER` | **YENİ** — K-38 · ADR-R2-38. Rol bir KÜME, ilişki bir KENAR |
| `GV.approval.adimCalisir(adim, {tutar, gun})` · `.calisanAdimlar` | **YENİ** — K-41 · ADR-R2-41. Eşik karşılaştırması TEK yerde, kanon `>=` |
| `GV.hr.maasGorebilir(e)` · `.maasKapi(e)` · `.maas(e, alan)` | **YENİ/DEĞİŞTİ** — K-39 · ADR-R2-39. Öz-erişim; argümansız çağrı KÜME sorusu |
| `GV.hr.kayit(e)` | **SERTLEŞTİ** — K-42. `kod` alanı olmayan nesne kayıt DEĞİL |
| `Gates.projeAktif` | **ONARILDI** — K-40 · ADR-R2-40. Olmayan iki alan okunuyordu; 0/14 → 8/14 |
| `Varlik.tazele` `degisti` | **DÜZELTİLDİ** — K-43. Şekil normalizasyonu değişiklik sayılmıyor |
| `GV.form` `fields[]` · `sections[]` · `setValue` · `kapaliAlanlar` | **YENİ SÖZLEŞME** — K-44. §2.2 |
| `shell.js` `BUILT` | 40 → **48** |
| `DB.approvalFlows` `AKS-SAT-1` adım 2 · `AKS-IZN-1` adım 1 | `finans` → `muhasebe` (rol) · `rol:'yonetici'` → `iliski:'yonetici'` |

**ADR yazıldı:** ADR-R2-38 · 39 · 40 · **ADR-R2-06 REVİZE** (V2-68).
⚠️ **ADR-R2-41 · 42 · 43 · 44 henüz `kararlar.md`e YAZILMADI** — gerekçeleri
commit mesajlarında tam, `kararlar.md`e taşınmalı. Sonraki oturumun işi.

---

## 7. Beyar'dan beklenen kararlar

Önceki açıklar: **V2-41 · V2-42 · V2-45** (dilim 4'ten).

Bu dilimde eklenenler:
1. **V2-69** — `AKS-IZN-1` adım 1 `EMP-001`de çözülemiyor (kurucu, üstü yok).
   Zincir o durumda adımı ATLASIN mı, İK'ya mı düşsün, talep mi reddedilsin?
2. **V2-80** — zincir ÖRNEĞİ ile TANIMI 2/7 kayıtta uyuşmuyor
   (`SAT-2026-016` 21.000 ₺ ve `SAT-2026-013` 8.400 ₺ örnekte 2 adım, tanım
   1 adım öngörüyor). "Eski sürümle başlatıldı" açıklaması TUTMUYOR: akış
   `surum:1`, yürürlük 2026-01-01, iki talep de Temmuz 2026. Eşik mi yanlış,
   örnek mi fazla adım taşıyor?
3. **V2-89** — ADR-R2-29'un "envanter zimmet defterinden türer" ilkesi üç
   alandan yalnız İKİSİNE uygulanmış. `zimmetTarihi`/`iadeTarihi` türetilmiyor
   ve `DMB-2025-004` kendi içinde çelişkili. Tarihleri de türetmek mi, yoksa
   onları tutanağın alanı sayıp envanterden düşürmek mi?
4. **V2-71** — `aktif` alanı üç koleksiyonda daha tuzaksız (`fuelLogs` ·
   `vehicleExpenses` · `policies` — `durum` ekseni yok). Tuzağı `durum`suz
   koleksiyonlara da yaymak mı, listeyi resmîleştirmek mi?
5. **V2-72** — `DB.salaryHistory` bir GEÇMİŞ DEĞİL (15/15 kayıt aynı günde,
   `kaynak:'gozlem'`). Gerçek dönem kaydı istenirse veri genişletilmeli.

---

## 8. İlk üç komut

```bash
cd ~/Developer/Projects/gaviaworks-crm-r2 && git pull
for e in tasks/qa/*.js; do node $e >/dev/null 2>&1 && echo "TEMİZ $e" || echo "BULGU $e"; done
sed -n '/^### 21.13/,/^## 22\./p' tasks/ekran-brief.md   # yanlış satır dersi + [B5] sınırı
```
Sonra: `sed -n '/^## 22\./,$p' tasks/ekran-brief.md` — dilim 6 sözleşmesi
(§22.13 araç detayı · §22.1b–i sekiz ajanın bulamadığı imzalar).
