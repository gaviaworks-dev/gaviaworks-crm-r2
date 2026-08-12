# Handoff — 13 Ağustos 2026 · Dilim 7 (GÖMME) AÇILDI · **on satır kapandı**

> `claude --continue` sonrası **ilk iş** bunu okumaktır. Hafıza context değil,
> diskteki defterlerdir.
>
> Repo: `gaviaworks-dev/gaviaworks-crm-r2` · `main`
> Yerel: `~/Developer/Projects/gaviaworks-crm-r2` · Eski repo `gaviaworks-crm`
> **DONDURULMUŞTUR** (bu turda SALT OKUNUR olarak bir kez okundu — §5).
>
> Bu dosya bir ÖZET değil ÖLÇÜMDÜR; sayı yazmadan önce ölç.

---

## 0. KESİT — ölçüldü

| | |
|---|---|
| HEAD | `3e34efd` · **200 commit** (bu oturumda **12**) |
| Ekran | **48 + index** (yeni ekran YAZILMADI — gömme dilimi) |
| Rota | **127/148 yayında · kalan 21** (girişte 117/31) |
| Kalanın dağılımı | **1** kapsam dışı (66) · **18** bloke · **2** gerçek iş (62 · 63) |
| Eksen | **14 eksen TEMİZ** · `[A9]` özet denetimi yeşil |
| Tarayıcı | **93 girdi × 6 = 558 ölçüm · 558/558 geçerli · 0 bulgu · 164,2 sn** |
| Menü tavanı | en yüksek günlük girdi **17** — DEĞİŞMEDİ (yeni girdi açılmadı) |
| v2-borç | **V2-98** ve **V2-99** açıldı |

**Kapanan on satır:** 2 · 5 (panel) · 27 · 28 (komisyon) · 51 · 52
(departman talebi) · 60 (anket) · 65 (toplantı kararı) · 79 (bütçe) ·
125 (süresi dolanlar).

---

## 1. EN ÖNEMLİ ÖLÇÜM — 12 AJAN BOŞA AÇILMADI

Dilim 6'nın GRUP 1 blokajı ajan **açıldıktan sonra** bulunmuştu. Bu turda
aynı soru diğer 12 drawer satırına **ajan açılmadan ÖNCE** soruldu.

**Yöntem:** bir deftere kayıt EKLEYEN yordam ortak katmanda
`push`/`unshift`/`splice` ile görünür. **İki yönlü sınandı** — yordamı
olduğu bilinen altı defterde ölçüm pozitif döndü (`DB.tasks` 2 ·
`DB.tickets` 1 · `DB.quotes` 1 · `DB.personalNotes` 3 · `DB.contracts` 1 ·
`DB.projects` 1), yani dedektör sağır değil.

**Sonuç: 12 defterin 12'sinde yordam YOK** — `analyses` · `commissions` ·
`sprints` · `testCases` · `bugs` · `changeRequests` · `deliveries` ·
`deptRequests` · `meetings` · `performance` · `orders` · `suppliers`.

Rota 23·29·35·38·41·44·47·53·64·85·119·122 **bloke** işaretlendi,
kapatılmadı. Borç **V2-99**. Araç altı satırı (102…112) Beyar kararı 2 ile
işaretlendi, borç **V2-98**.

⚠️ **GRUP 3'ün beş drawer'ı ve GRUP 8'in dördü bu yüzden hiç açılmadı.**
Gömme dilimi 39 satırla planlanmıştı; **18'i yazma yordamı yokluğundan
bloke**, yani planın yarısı ölçümle kapandı.

---

## 2. BEYAR'IN ÜÇ KARARI

**1 · Rota 125'in hedefi ONAYLANDI** → `app-ayar-log.html › Belge Arşivi`.
Uygulandı ve **satır kapandı** — ama önce bir ölçüm hatam düzeldi (§4).

**2 · Araç alt defterleri: yazma yordamı YAZILMADI, çekmece AÇILDI.**
`app-arac-detay.html`in altı listesi (`bakim`·`yakit`·`ceza`·`muayene`·
`kaza`·`gider`) `GV.list` `rowOpen` yuvasını kullanıyor; satıra tıklamak
kaydın tamamını **salt okunur** bir çekmecede açıyor. Hiçbir `<input>`
basılmadı. Kaydetme düğmesi **gizlenmedi, `disabled` basıldı ve sebebi
ekranda yazılı**. Gerçek Chromium'da ölçüldü (`BKM-2026-019`: 0 input ·
disabled Kaydet · sebep metni tam).
· **Poliçe (rota 106) çekmece ALMADI** ve sebebi ölçüldü: poliçenin tamamı
  Özet'teki blokta zaten satır satır basılı, ikinci yüzey K-21 ihlali
  olurdu. Karardan uygulanan kısım yalnız devre dışı düğme + sebep.
· **Ceza defterinin ayrı rota satırı yok** ama aynı mekanizmayı paylaştığı
  için aynı kural uygulandı — altıdan birinin açılmaması tutarsız yüzey
  bırakırdı. (Kapsam genişletme kararı; Beyar'a bildiriliyor.)
· "Yeni … ekle" düğmesi **HİÇ basılmadı**: olmayan bir kaydı DOĞURACAK
  yüzey devre dışı bile olsa açılmıyor.

**3 · `depoDoldu`** — geçen turda uygulanmıştı, bu turda dokunulmadı.

---

## 3. ÜÇ BAYAT BEYAN YAKALANDI — DERS SABİTLENİYOR

Geçen tur bu bir kez yakalanmıştı (`EMP-016` kartı). Bu turda **üç kez**:

| nerede | ne diyordu | ölçüm |
|---|---|---|
| `app-arac-detay.html` `salt()` | *"devre dışı bir düğme bile vaat sayılır"* | Beyar kararı 2 tam tersini istedi; karar uygulandığı AN cümle ekranda yanlışa döndü |
| `app-operasyon.html` sayfa alt beyanı | *"beş tip tek yüzeyde"* | çip şeridi **altı** çip basıyordu; aynı ekranın §6.2 paragrafı zaten "altı" diyordu — **iki cümle birbiriyle çelişiyordu** |
| `tasks/ekran-brief.md` §23.4 | *"`ui.js:278` NPS gruplamasını zaten tanımlıyor"* | o satırlar yalnız bir **rozet TON sözlüğü**; eşikleri hesaplayan yordam YOK |
| `assets/css/r2.css:56` | *"En fazla altı kart: …"* | panel çekmece şeridi alınca yorum eksiği anlatır oldu; güncellendi (ajan `assets/`e dokunamaz) |

**DERS: bir kuralın hâlini anlatan cümle, kuralın KENDİSİNDEN türetilmeli.**
Operasyon'un tip sayısı artık `Object.keys(K.tipler).length`ten geliyor;
görev listesinin karar beyanı `KARAR_GOREV` kenar sayısından; araç
çekmecesinin sebebi tek `kaydetmeYok()` yordamından.

---

## 4. İKİ "YÜZEY ZATEN VAR" ÖLÇÜMÜM YARIM ÇIKTI

Geçen tur dokuz satır "yüzeyi zaten yayında" diye ekran yazılmadan
kapatılmıştı ve **doğruydu** — ölçüt sekme şeridindeki `role="tab"`
düğümüydü, adıyla arandı. Bu turda aynı yöntemi iki satıra uyguladım ve
**ikisinde de yanıldım**:

* **Rota 125** — "süresi geçmiş" bir **KPI sayacı** ve bir **süzgeç
  seçeneği** olarak vardı; listede **`tabs:` HİÇ YOKTU**, yani kayıtlı
  görünüm yoktu. Rota satırının istediği tam olarak kayıtlı görünümdü.
* **Rota 2** — dondurulmuş R1 deposundaki `app-panel-ozet.html` blok blok
  okundu: yedi bloğun **dördü** R2'de var, **üçü yok** (Duyurular ·
  Dikkat Gerektirenler · Dünden Bugüne).

**DERS: "yüzey var mı" sorusu, yüzeyin ADIYLA sorulmalı.** "Süresi geçmiş
bir yerde geçiyor mu" diye bakmak üç farklı yüzeyi aynı sayar.

---

## 5. ORTAK KATMANDA ONARILAN ÜÇ ŞEY

| ne | ölçüm |
|---|---|
| `kuyruk.js` `iliski` | `d.hedefDep \|\| d.dep` okuyordu; `DB.deptRequests` bu iki alanın **hiçbirini** taşımıyor → altı talebin altısında boş. `d.proje \|\| d.musteri` yazıldı (diğer beş tiple aynı sözleşme). Departman kodu bu kolona KONMADI — bir kolona iki birim yazmak ölçümü bozar. Sonra 3/4 dolu, biri (`TLP-2026-045`) gerçekten bağsız |
| `rapor.js` `bagla()` | her `ciz()`te `mount`a YENİ dinleyici ekliyordu. **İki yönlü ölçüldü:** onarımdan önce 6 tıklamaya **63 çizim**, sonra **6**. `GV.on(el,type,fn,key)` kullanıldı. Ekranda görünür bozulma yoktu, beş oturum fark edilmedi |
| `brief-dogrula.js` `[B2]` | `assets/js/rapor.js`i taramıyordu ve `GV.rapor`ı "kodda yok" ilan etti — eksenin kendi yorumu aynı tuzağı `kuyruk.js` için anlatıyordu, **ikinci kez düştü**. Ölçüm seçildi, brief değil eksen düzeltildi |

---

## 6. AJAN RAPORU BİR NOKTADA YANLIŞTI

Rapor ajanı *"`DB.commissions[].aktif` 6/6 `undefined`"* dedi. **Bağımsız
ölçüm çürüttü:** altı kaydın altısında `aktif` anahtarı VAR ve `true`
(birinde ayrıca `arsiv:true`). Ajan buna göre davranmadığı için ekranda
kusur doğmadı, ama **ajan raporu ölçüm yerine geçmez** — bu turda iki
iddiası tek tek sınandı, biri doğru (NPS) biri yanlış (`aktif`) çıktı.

Ajanların brief dışına çıkması: **bir ajan depo köküne `__once_tmp.html`
(25 KB) bıraktı** ve `ayar-ekseni` bunu "BUILT'te olmayan ekran" diye
yakaladı. Silindi. Sonraki ajan yönergesine "depo köküne geçici dosya
bırakma" maddesi eklendi.

---

## 7. AÇIK KALAN İŞ — 23 satır

**Gerçek iş (2 satır):**
1. **Rota 62 · 63** → toplantı (GRUP 7). Panel ayağı ZATEN yayında
   ("Günün ajandası"); yazılacak olan `app-musteri-detay.html` ve
   `app-proje-detay.html` aktivite yüzeyindeki bağlamsal kayıt.
   **İKİ EKRANA dokunur — tek ajan kuralını doğal olarak ihlal eder,
   sıralı ele alınmalı.** `DB.meetings` 9 kayıt, 5'inde `musteri`,
   5'inde `proje` dolu.

**Bloke (18 satır)** — yazma yordamı yok, V2-98 · V2-99.
**Kapsam dışı (1):** 66 `app-sohbet.html` (ADR-R2-03).

**Devreden borç:** ADR-R2-41·42·43·44 `kararlar.md`e taşınmalı (üç turdur
devrediyor) · V2-94 · V2-96 · V2-97.

---

## 7b. PANELDE ŞARTNAMENİN KENDİ ÇELİŞKİSİ ÇÖZÜLDÜ

Ajan üç yeni **kart** yazdı ve panel personel kimliğinde **9 karta** çıktı.
§4.1 *"en fazla altı kart"* yazılı bir kabul kriteridir
(`riskler-ve-kapsam.md:210`). Aynı belgenin §3'ü ise bu sayfalar için
*"`/panel` widget **ve DRAWER'ları**"* diyor.

**Taraf seçilmedi — §3'ün kendisi ikinci biçimi adıyla veriyor.** Üç yüzey
çekmeceye alındı: tavan korunuyor **ve** rota satırları kapanıyor. Beş
rolde ölçüldü, hepsinde kart **6**.

⚠️ Aynı turda `aktif-ekseni` `[A3]` bir **tuzak alan okuması** yakaladı:
`DB.inspections` ve `DB.vehicles` `durum` taşır (durum kanonlu), `aktif`
orada tuzaktır — `GV.arsivli`ye çevrildi. Bugün 0 kayıt arşivli olduğu
için görünen sonuç değişmiyor, **ama okunan eksen değişiyor**. Tuzak tam
böyle sessiz kalır; eksen olmasa bu tur da fark edilmezdi.

---

## 8. Beyar'dan beklenen kararlar

Önceki açıklar: **V2-41 · V2-42 · V2-45** · **V2-69 · V2-80 · V2-89 ·
V2-71 · V2-72** · **V2-96** · **EMP-016 çelişkisi**.

Bu turda eklenen:
1. **V2-99 — kararın uzatılması.** Beyar kararı 2 (salt okunur çekmece +
   devre dışı düğme + sebep) altı ARAÇ satırı için verildi. Aynı sınıftaki
   **12 satır daha** ölçüldü. Aynı muamele onlara da uygulansın mı?
   Uzatmak **sekiz ayrı ekrana** dokunmak demektir; bu turda kapsam
   donduruldu ve karara bırakıldı.
2. **Ceza defteri çekmecesi.** Rota 111 Kaza ve Cezayı birlikte sayıyor,
   ceza formunun ayrı satırı yok. Çekmece yine de açıldı (tutarlılık).
   Onaylanıyor mu, geri alınsın mı?
3. **Rota 27'nin "satır" yorumu.** ADR-R2-04 *"komisyon bir finansal
   **satırdır**"* diyor. Rapor tavanı ölçüldü: KPI 4/4 ve tablo 1/1 DOLU,
   yeni yuva YOK. En savunulabilir yorum uygulandı: komisyon var olan tek
   tablonun **iki kolonu** oldu (`DB.commissions[].musteri` 6/6 dolu).
   Kolon, "satır"ın karşılığı sayılıyor mu?
4. **Rota 28'in derinleşmesi.** `GV.rapor` satır tıklamasıyla derinleşme
   **yordamı taşımıyor**. Ortak katmana yordam yazmak yerine hücre içinde
   `<details>` kullanıldı. Ortak katmana gerçek bir derinleşme yordamı
   yazılsın mı, yoksa bu biçim kalsın mı?
5. 🔴 **Müşteri portalı kimliği (`emp:null`) panelde İÇ VERİ görüyor** —
   bu turun eklemesi DEĞİL, önceden de böyleydi ve ajan ölçtü:
   "Son bildirimler" 5 iç bildirim · "Proje özeti" 6 iç proje ·
   "Ekip özeti" 15 personel + izin talepleri İSİMLERİYLE · KPI
   "Bekleyen onay=10". Bu turda eklenen üç çekmece bu kimliğe KAPALI.
   Var olan davranışı bozmama yükümlülüğü gereği dokunulmadı —
   **turun en ağır bulgusu budur**, `v2-borc.md`ye yazılacak.
6. **Rota 79'un K-21 artığı.** `p.sozlesmeTutari` künyede
   `Sözleşme tutarı`, taşınan maliyet kartında `Gelir (sözleşme tutarı)`
   olarak geçiyor — artık iki ayrı sekmede. Künyeden de çekilsin mi?

---

## 9. İlk üç komut

```bash
cd ~/Developer/Projects/gaviaworks-crm-r2 && git pull
for e in tasks/qa/*.js; do [ "$e" = tasks/qa/tarayici.js ] && continue; node $e >/dev/null 2>&1 && echo "TEMİZ $e" || echo "BULGU $e"; done
node tasks/qa/tarayici.js    # 93 girdi · 558 ölçüm · ~2,8 dakika
```
Sonra: `sed -n '/^## 23\./,$p' tasks/ekran-brief.md` — gömme diliminin
ölçülmüş sözleşmesi (§23.1 blokaj tablosu · §23.2–23.7 satır sözleşmeleri ·
§23.9 yasaklar · §23.11–23.13 bu turun dersleri).

⚠️ **`tasks/gomme-plani.md`in dalga sırası BAYATLADI**: GRUP 3'ün beş
drawer'ı, GRUP 8'in dördü ve GRUP 2'nin 85'i **bloke** çıktı, GRUP 4'ün
ikisi ZATEN yayındaydı. Plan dosyası tarihsel kayıttır; **yürütülecek
sıra bu handoff'un §7'sidir.**
