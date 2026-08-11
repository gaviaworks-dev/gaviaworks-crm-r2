/* =====================================================================
   GAVIAWORKS CRM — PROJE VE İŞ VERİSİ
   Projeler · Modüller · Milestone · Sprint · Görevler · Alt görevler ·
   Departmanlar arası iş talepleri · Hatalar · Testler · Teslimler ·
   Değişiklik talepleri · Onaylar · Aktivite kayıtları
   ===================================================================== */
window.DB = window.DB || {};

/* ---- Görev sözlükleri (PROMPT.md §12 · REVİZE 01) --------------------
   Sözlük 19 değerliydi ve 8'i hiçbir kayıtta geçmiyordu. Üç değer
   (`Bilgi bekliyor` · `Müşteri bekleniyor` · `Departman bekleniyor`) durum
   değil BEKLEME NEDENİ anlatıyordu: bir görev "devam ediyor" olmayı sürdürür,
   yalnız bir şeyi bekler. İkisini tek eksene sıkıştırmak, kullanıcıyı görevin
   nerede olduğu ile neyi beklediği arasında seçim yapmaya zorluyordu.
   Ayrıca dört değer ikizini taşıyordu (`Atama bekliyor`≈`Havuzda`,
   `Başlanmadı`/`Planlandı`/`Kabul bekliyor`≈`Atandı`).
   Sözlük 10 değere indi; bekleme ayrı eksene çıktı. Taşınan dört kaydın
   dördü de `DB.activities`'e eski→yeni ile yazıldı. */
DB.taskStatuses = ['Havuzda','Atandı','Devam ediyor','Kontrolde','Revizede',
  'Onay bekliyor','Tamamlandı','Engellendi','İptal edildi','Arşivlendi'];

/* Bekleme nedeni DURUMDAN BAĞIMSIZ ikinci eksendir (REVİZE 01).
   `null` = beklemiyor. Bir görev aynı anda hem "Devam ediyor" hem
   "Müşteri bekleniyor" olabilir — eski sözlükte olamıyordu. */
DB.taskWaitReasons = ['Müşteri','Departman','Bilgi','Dosya','Teknik Karar',
  'Yönetici Onayı','Diğer'];

DB.taskTypes = ['Genel görev','Müşteri görevi','Proje görevi','Satış görevi','Ön analiz görevi',
  'Tasarım görevi','Yazılım geliştirme görevi','Test görevi','Hata','Revizyon','Destek talebi',
  'Satın alma görevi','Personel görevi','Demirbaş görevi','Araç görevi','Toplantı aksiyonu',
  'Onay görevi','Tekrarlayan görev'];

DB.priorities = ['Kritik','Yüksek','Orta','Düşük'];
DB.impacts = ['Çok yüksek','Yüksek','Orta','Düşük'];

/* ---- Proje · hata · test sözlükleri (VB-22) ----------------------------
   Altı eksenin `DB.*` karşılığı yoktu; üç form ekranı kümeleri liste
   ekranlarının süzgecinden ve mevcut kayıtlardan TÜRETMEK zorunda kalmıştı.
   Sonuç: veride hiç kullanılmayan değer forma girmiyor (proje 'Askıda'),
   tek değerli eksende select tek seçenekli kalıyordu (VB-17 ile aynı sınıf).
   Kümeler ekranlarda zaten yazılı olan değerlerden alındı — uydurulmadı. */
/* REVİZE 05 — DURUM ile FAZ iki ayrı eksendir; sözlükler artık karışmıyor.
   ─────────────────────────────────────────────────────────────────────────
   DURUM  = proje şu an hangi *iş halinde* (yürüyor mu, askıda mı, bitti mi).
   FAZ    = projenin *hangi bölümünde* olduğu; müşteriden müşteriye değişir.
   Eskiden `durum` iki faz kelimesi (`Geliştirme` · `Test`) taşıyordu ve
   `faz` bir durum kelimesi (`Tamamlandı`) taşıyordu — iki eksen birbirinin
   içine akıyordu (VB-20). Taşıma haritası:
     durum 'Geliştirme' (4 kayıt) → 'Aktif'          · faz DEĞİŞMEDİ
     durum 'Test'       (1 kayıt) → 'Kontrol / Test' · faz DEĞİŞMEDİ
     durum 'Teslim' + arsiv       → 'Tamamlandı'     · faz null (kanıt yok)
     durum 'Teslim' + arşivsiz    → 'Teslim Sürecinde'
   Faz alanına uydurma değer YAZILMADI (L-13): kapanmış 7 projenin ne modülü
   ne görevi ne sprinti var, yani hangi fazda bittikleri türetilebilir bir
   bilgi değil. `faz:null` "faz kaydı yok" demektir, ekranlar öyle basar. */
/* CLOUD TURU · ADR-01 — sözlük şartname [5.2.1]'e hizalandı.
   `Planlama`→`Plan` · `Kontrol / Test`→`Test/Kabul` · `Teslim Sürecinde`→`Teslim`
   · `Askıda`→`Beklemede`; `Başlatma Onayı` ve `Kapanış` eklendi. Taşınan üç
   kayıt `DB.statusMigration.project` haritasında eski adıyla durur.
   Geçiş kuralı `DB.transitions.project` — durum artık serbest seçilmez. */
DB.projectStatuses = ['Plan','Başlatma Onayı','Aktif','Beklemede','Test/Kabul',
  'Teslim','Kapanış','Tamamlandı','İptal Edildi','Arşivlendi'];
DB.healthLevels    = ['İyi','Dikkat','Riskli'];
/* Faz ekseni İKİ AİLEDİR ve ikisi de meşrudur (talimat REVİZE 05): iş
   kırılımı fazı (`Analiz · Tasarım · Geliştirme · Test`) ya da numaralı faz
   (`Faz 1/2/3`). Bir projede bir aile kullanılır. 'Tamamlandı' burada
   **yoktur** — o bir durumdur. */
DB.projectPhases   = ['Analiz','Tasarım','Geliştirme','Test','Faz 1','Faz 2','Faz 3'];
/* ---- Proje KAYNAĞI (REVİZE 11) ---------------------------------------
   Projenin nasıl DOĞDUĞU — durumu, fazı ya da türü değil. `DB.refTypes`
   ile KARIŞTIRILMAZ: o SATIŞ kaynağı eksenidir (adayın nereden geldiği,
   18 değer) ve müşteri/aday kartında yaşar. Proje kaynağı bir projenin
   ticari dayanağını söyler ve formda ilk alandır, çünkü diğer alanların
   zorunluluğunu o belirler (sözleşme seçici yalnız 'Müşteri Sözleşmesi'
   iken görünür ve zorunludur). */
DB.projectSources  = ['Müşteri Sözleşmesi','İç Proje','Satış Öncesi / PoC',
  'Bakım / Destek','Diğer'];
/* ⚠️ Modül durumu proje durumundan AYRI bir eksendir ve kelimeleri proje
   durum sözlüğünden çıkarılınca da yaşamayı sürdürür (L-33: bir durum adını
   silmeden önce o adı kullanan HER koleksiyon aranır). 15 modülün 15'i bu
   dört değerden birini taşıyor; sözlüğü yoktu, açıldı. */
DB.moduleStatuses  = ['Planlama','Geliştirme','Test','Tamamlandı'];
/* CLOUD TURU — şartname [9.2.1]/[9.2.2]. `Açık`→`Yeni`; ara ve yan
   durumlar eklendi. Geçiş kuralı `DB.transitions.bug`. */
DB.bugStatuses     = ['Yeni','Triage','Atandı','Devam ediyor','Düzeltildi',
  'Yeniden Test','Kapandı','Yeniden Açıldı','Reddedildi','Mükerrer'];
DB.reproLevels     = ['Her zaman','Bazen','Nadiren','Tekrarlanamadı'];
/* CLOUD TURU — şartname [9.1.3] `Passed/Failed/Blocked/Not Run` istiyor.
   Türkçe karşılıkları alındı; `Kısmi` şartnamede yok ama veride kullanılan
   bir sonuç değildi (0 kayıt) — çıkarıldı, `Engellendi` ve `Koşulmadı` geldi. */
DB.testResults     = ['Başarılı','Başarısız','Engellendi','Koşulmadı'];

/* Durum geçiş kuralları — yetki + zorunlu alan + bildirim (REVİZE 02)
   ─────────────────────────────────────────────────────────────────────
   `next`     : bu durumdan gidilebilecek durumlar. Listede olmayan hedef REDDEDİLİR.
   `yetki`    : geçişi yapabilecek kişiler. **Rol anahtarı DEĞİL, İLİŞKİ anahtarı**
                olabilir (`sorumlu` · `kontrolEden` · `onaylayan` · `veren`) — bu,
                "bu görevin sorumlusu" demektir, "sorumlu rolündeki herkes" değil.
                `GV.task.transition` ikisini de çözer.
   `zorunlu`  : geçiş öncesi DOLU olması gereken görev alanları.
   `etiket`   : aksiyon butonunun yazısı. Kullanıcıya uzun statü dropdown'ı
                gösterilmez; yapılabilecek işlem butondur (REVİZE 02).
   `tone`     : buton sınıfı.

   Sözlük 19'dan 10'a inince geçiş tablosu da yeniden yazıldı. Üç düzeltme:
   · `Kontrolde` için zorunlu alan `ciktiLink`ti — **hiçbir görevde böyle bir alan
     yok**, yani kural hiç uygulanamazdı. Gerçek alan `teslimEdilenCikti`.
   · `Kontrolde → Onay bekliyor` mu yoksa doğrudan `Tamamlandı` mı olacağı artık
     görevin `onayGerekli` bayrağından okunur; ikisi de listede duruyor ama
     `GV.task.nextSteps` yalnız geçerli olanı buton yapar.
   · Her durumdan `İptal edildi` çıkışı var; eskiden yalnız ikisinden vardı ve
     kullanıcı iptal etmek için dropdown'a düşüyordu.                          */
DB.taskTransitions = {
  'Havuzda':      { next:['Atandı','İptal edildi'],                  yetki:['pm','takimlideri','depmudur','sahip','operasyon'], zorunlu:['sorumlu'],              bildirim:['sorumlu'],            etiket:'Ata',              tone:'btn-acc' },
  'Atandı':       { next:['Devam ediyor','Engellendi','İptal edildi'], yetki:['sorumlu','pm'],                                  zorunlu:[],                       bildirim:['veren'],              etiket:'Çalışmaya Başla',  tone:'btn-acc' },
  'Devam ediyor': { next:['Kontrolde','Engellendi','İptal edildi'],   yetki:['sorumlu'],                                        zorunlu:[],                       bildirim:['veren','kontrolEden'], etiket:'Kontrole Gönder',  tone:'btn-acc' },
  'Kontrolde':    { next:['Revizede','Onay bekliyor','Tamamlandı'],   yetki:['kontrolEden','pm'],                               zorunlu:['teslimEdilenCikti'],    bildirim:['sorumlu'],            etiket:'Onayla',           tone:'btn-ok' },
  'Revizede':     { next:['Kontrolde','İptal edildi'],                yetki:['sorumlu'],                                        zorunlu:[],                       bildirim:['kontrolEden'],        etiket:'Kontrole Gönder',  tone:'btn-acc' },
  'Onay bekliyor':{ next:['Tamamlandı','Revizede'],                   yetki:['onaylayan','pm','sahip'],                         zorunlu:[],                       bildirim:['sorumlu','veren'],    etiket:'Tamamla',          tone:'btn-ok' },
  'Engellendi':   { next:['Devam ediyor','İptal edildi'],             yetki:['sorumlu','pm'],                                   zorunlu:['engelNedeni'],          bildirim:['veren','pm'],         etiket:'Engeli Kaldır',    tone:'btn-acc' },
  'Tamamlandı':   { next:['Arşivlendi','Revizede'],                   yetki:['pm','sahip'],                                     zorunlu:[],                       bildirim:['veren','izleyiciler'], etiket:'Arşivle',         tone:'btn-line' },
  'İptal edildi': { next:['Arşivlendi'],                              yetki:['pm','sahip','operasyon'],                         zorunlu:[],                       bildirim:['veren'],              etiket:'Arşivle',          tone:'btn-line' },
  'Arşivlendi':   { next:[],                                          yetki:[],                                                 zorunlu:[],                       bildirim:[],                     etiket:null,               tone:null }
};

/* Hedef durum başına buton yazısı — kaynak durumdan bağımsız okunur.
   `taskTransitions[x].etiket` "bu durumdan çıkışın ANA yolu" içindir;
   ikincil çıkışlar (Engelle · Revizeye Gönder · İptal Et) buradan gelir. */
DB.taskActionLabels = {
  'Atandı':        'Ata',
  'Devam ediyor':  'Çalışmaya Başla',
  'Kontrolde':     'Kontrole Gönder',
  'Revizede':      'Revizeye Gönder',
  'Onay bekliyor': 'Onaya Gönder',
  'Tamamlandı':    'Tamamla',
  'Engellendi':    'Engellendi İşaretle',
  'İptal edildi':  'İptal Et',
  'Arşivlendi':    'Arşivle'
};

/* ---- Projeler (PROMPT.md §11) -----------------------------------------
   ⚠️ `harcananSure` ALANI KALDIRILDI (REVİZE 03 · 2026-08-07).
   On dört kayıtta elle yazılı bir sayıydı, toplamı 9.125 saat; zaman
   defterinde karşılığı 308 saatti. Türetilebilen sayaç veriye yazılmaz
   (L-08) ve doküman zaten "manuel veri olmamalıdır" diyor. Yerine
   `GV.proje.sure(kod)` geçti: `{ planlanan, gerceklesen, faturalanabilir,
   tum, kayit, kapsam }`. Zaman defteri bir projeyi kapsamıyorsa yordam
   `kapsam:false` döndürür ve ekran **sıfır basmaz** — "defterde kayıt yok"
   der (V-45). `tahminiSure` KALIR: o bir plan değeri, sayaç değil.

   ⚠️ `gerceklesenMaliyet` ALANI DA KALDIRILDI (REVİZE 04 · 2026-08-07).
   On dört kayıtta elle yazılı TEK bir rakamdı; hangi kalemden oluştuğu
   hiçbir yerde yazılı değildi ve `app-proje-detay.html` bunu iki sekmede
   "türetilmiş / örtüşmeyebilir" uyarısıyla itiraf ediyordu. Yerine
   `GV.proje.maliyet(kod)` geçti: personel · dış kaynak · satın alma · diğer
   kalemlerini ayrı ayrı türetir, toplamı ve kârlılığı ondan hesaplar.
   `butce` KALIR: onaylı bütçe bir plan değeridir, sayaç değil.

   ⚠️ `kaynak` ALANI AÇILDI (REVİZE 11 · 2026-08-07) — 14/14 dolu, UYDURULMADAN.
   Türetme kuralı ve kanıtı kayıt kayıt şudur:
     · Sözleşme kaydı onu gösteren 6 proje → 'Müşteri Sözleşmesi'. Kanıt
       `DB.contracts[].proje` (SZL-2026-019/020/021/023/024 · SZL-2025-018) ve
       altısında da `sozlesmeTutari` sözleşmenin netiyle birebir.
     · PRJ-2026-007 → 'Satış Öncesi / PoC'. Kanıt: sözleşmesi yok, `Planlama`
       durumunda ve 336.000 ₺ bedeli **TKL-2026-008** teklifinin toplamıyla
       birebir aynı (aynı müşteri MUS-2025-004, teklif hâlâ "Teklif
       hazırlanıyor"). Yani bedel sözleşme bedeli değil TEKLİF bedelidir —
       VB-20'nin "sözleşmesiz sözleşme bedeli" bulgusunun bu kayıttaki karşılığı.
     · PRJ-2026-008 → 'Satış Öncesi / PoC'. Kanıt: kaydın kendi adı
       ("Risk Raporlama **Pilotu**"), sözleşmesi/teklifi/faturası yok ve aynı
       müşteri (MUS-2026-011) sonradan 600.000 ₺'lik TKL-2026-012 → SZL-2026-021
       zinciriyle asıl projeyi (PRJ-2026-002) imzalamış.
     · Kalan 6 arşivli proje → 'Müşteri Sözleşmesi'. Kanıt: hepsinin müşterisi
       ve sözleşme bedeli var, hepsi teslim edilip kapanmış ve hepsinde müşteri
       memnuniyet anketi (`DB.surveys[].ilgili`) var. **Sözleşme kaydı
       UYDURULMADI** (→ V-54): bu depodaki `DB.contracts` defteri 2025-06'da
       başlıyor, daha eski işlerin sözleşmesi hiç girilmemiş. Eksik olan kayıt
       yazılsaydı yedi sahte SZL numarası, tarihi ve ödeme planı doğardı (L-13).
       `canon.js` eksen 35d bu yüzden sözleşme zorunluluğunu **arşivsiz**
       projelerde arar: yeni bir kayıt aynı boşluğu bir daha açamaz.
   `kaynak` `DB.refTypes` ile KARIŞTIRILMAZ — o satış kaynağıdır (müşteri/aday
   kartında), bu proje kaynağıdır. */
DB.projects = [
  { kod:'PRJ-2026-001', ad:'Vitalis Hasta Randevu Mobil Uygulaması', musteri:'MUS-2024-002', musteriAd:'Vitalis Sağlık Grubu',
    pm:'EMP-003', ekip:['EMP-004','EMP-008','EMP-005','EMP-009'], durum:'Test/Kabul', saglik:'Riskli',
    baslangic:'2026-03-02', planlananBitis:'2026-08-14', gercekBitis:null, ilerleme:82,
    sozlesmeTutari:880000, butce:540000, tahminiSure:1240,
    kaynak:'Müşteri Sözleşmesi', tur:'Mobil Uygulama', oncelik:'Yüksek', faz:'Faz 1',
    repo:'github.com/gaviaworks/vitalis-mobile', canli:'—', test:'test.vitalis-app.com',
    tasarim:'figma.com/vitalis', sunucu:'AWS eu-central-1', teknoloji:['React Native','NestJS','PostgreSQL'],
    ucuncuTaraf:['Twilio SMS','Firebase Push'], teknikSorumlu:'EMP-005', musteriSorumlu:'EMP-013',
    riskler:['App Store onay süresi belirsiz','Test ortamı verisi eksik'],
    gecikmeNedeni:'Müşteri içerik onayı 9 gün gecikti', sonGuncelleme:'2026-08-02' },
  { kod:'PRJ-2026-002', ad:'Anka Finans AI Kredi Skorlama Paneli', musteri:'MUS-2026-011', musteriAd:'Anka Finans Teknolojileri',
    pm:'EMP-003', ekip:['EMP-007','EMP-005','EMP-006'], durum:'Aktif', saglik:'İyi',
    baslangic:'2026-06-24', planlananBitis:'2026-09-04', gercekBitis:null, ilerleme:48,
    sozlesmeTutari:500000, butce:380000, tahminiSure:820,
    kaynak:'Müşteri Sözleşmesi', tur:'Yapay Zekâ Çözümü', oncelik:'Yüksek', faz:'Faz 1',
    repo:'github.com/gaviaworks/anka-scoring', canli:'—', test:'staging.anka-score.com',
    tasarim:'figma.com/anka', sunucu:'Müşteri VPC', teknoloji:['Python','FastAPI','React','pgvector'],
    ucuncuTaraf:['OpenAI API','Findeks servisi'], teknikSorumlu:'EMP-007', musteriSorumlu:'EMP-002',
    riskler:['Model doğruluğu regülasyon eşiğinin üstünde tutulmalı'],
    gecikmeNedeni:null, sonGuncelleme:'2026-08-02' },
  { kod:'PRJ-2026-003', ad:'Marmara Enerji Mobil Operasyon ERP — Faz 1', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri',
    pm:'EMP-003', ekip:['EMP-005','EMP-006','EMP-004','EMP-009','EMP-010'], durum:'Aktif', saglik:'Dikkat',
    baslangic:'2025-09-15', planlananBitis:'2026-09-30', gercekBitis:null, ilerleme:64,
    sozlesmeTutari:920000, butce:720000, tahminiSure:2100,
    kaynak:'Müşteri Sözleşmesi', tur:'CRM / ERP', oncelik:'Yüksek', faz:'Faz 1',
    repo:'github.com/gaviaworks/marmara-erp', canli:'erp.marmaraenerji.com', test:'test-erp.marmaraenerji.com',
    tasarim:'figma.com/marmara-erp', sunucu:'Müşteri on-premise', teknoloji:['Node.js','React','PostgreSQL','Redis'],
    ucuncuTaraf:['Logo ERP','e-Fatura'], teknikSorumlu:'EMP-005', musteriSorumlu:'EMP-002',
    riskler:['Kapsam büyümesi','Logo entegrasyon dokümantasyonu yetersiz'],
    gecikmeNedeni:'Faz 2 kapsam tartışması Faz 1 testini yavaşlattı', sonGuncelleme:'2026-08-01' },
  { kod:'PRJ-2026-004', ad:'Öz Gıda Üretim Takip ve Fire Raporlama', musteri:'MUS-2026-009', musteriAd:'Öz Gıda Üretim A.Ş.',
    pm:'EMP-003', ekip:['EMP-006','EMP-005'], durum:'Teslim', saglik:'İyi',
    baslangic:'2026-05-18', planlananBitis:'2026-07-24', gercekBitis:'2026-07-22', ilerleme:100,
    sozlesmeTutari:295000, butce:210000, tahminiSure:460,
    kaynak:'Müşteri Sözleşmesi', tur:'Süreç Otomasyonu', oncelik:'Orta', faz:'Faz 1',
    repo:'github.com/gaviaworks/ozgida-uretim', canli:'uretim.ozgida.com.tr', test:'—',
    tasarim:'figma.com/ozgida', sunucu:'Gavia yönetimli VPS', teknoloji:['Node.js','Vue','MySQL'],
    ucuncuTaraf:[], teknikSorumlu:'EMP-005', musteriSorumlu:'EMP-002',
    riskler:[], gecikmeNedeni:null, sonGuncelleme:'2026-07-25' },
  { kod:'PRJ-2026-005', ad:'Nova Turizm Rezervasyon Portalı', musteri:'MUS-2026-007', musteriAd:'Nova Turizm Yatırımları',
    pm:'EMP-003', ekip:['EMP-004','EMP-006','EMP-016'], durum:'Aktif', saglik:'İyi',
    baslangic:'2026-06-08', planlananBitis:'2026-09-18', gercekBitis:null, ilerleme:37,
    sozlesmeTutari:420000, butce:260000, tahminiSure:600,
    kaynak:'Müşteri Sözleşmesi', tur:'Web Uygulaması', oncelik:'Orta', faz:'Faz 1',
    repo:'github.com/gaviaworks/nova-rezervasyon', canli:'—', test:'demo.novaturizm.com',
    tasarim:'figma.com/nova', sunucu:'Gavia yönetimli VPS', teknoloji:['Next.js','PostgreSQL'],
    ucuncuTaraf:['iyzico','Google Maps'], teknikSorumlu:'EMP-006', musteriSorumlu:'EMP-014',
    riskler:['Ödeme sağlayıcı entegrasyon testi bekliyor'], gecikmeNedeni:null, sonGuncelleme:'2026-07-31' },
  { kod:'PRJ-2026-006', ad:'Trakya Otomotiv Servis Randevu Sistemi', musteri:'MUS-2026-010', musteriAd:'Trakya Otomotiv Servis',
    pm:'EMP-003', ekip:['EMP-006','EMP-009'], durum:'Aktif', saglik:'Riskli',
    baslangic:'2026-03-16', planlananBitis:'2026-06-26', gercekBitis:null, ilerleme:71,
    sozlesmeTutari:185000, butce:120000, tahminiSure:280,
    kaynak:'Müşteri Sözleşmesi', tur:'Web Uygulaması', oncelik:'Kritik', faz:'Faz 1',
    repo:'github.com/gaviaworks/trakya-randevu', canli:'—', test:'test.trakyaotomotiv.com',
    tasarim:'figma.com/trakya', sunucu:'Gavia yönetimli VPS', teknoloji:['Laravel','Vue','MySQL'],
    ucuncuTaraf:['Netgsm SMS'], teknikSorumlu:'EMP-006', musteriSorumlu:'EMP-013',
    riskler:['Bütçe %16 aşıldı','Müşteri memnuniyeti düşük','7 revizyon turu'],
    gecikmeNedeni:'Kapsam dışı revizyon talepleri kabul edildi', sonGuncelleme:'2026-07-29' },
  { kod:'PRJ-2026-007', ad:'Ege Eğitim Veli Portalı', musteri:'MUS-2025-004', musteriAd:'Ege Eğitim Kurumları',
    pm:'EMP-003', ekip:['EMP-006','EMP-004'], durum:'Plan', saglik:'İyi',
    baslangic:'2026-08-18', planlananBitis:'2026-10-16', gercekBitis:null, ilerleme:6,
    sozlesmeTutari:336000, butce:200000, tahminiSure:420,
    kaynak:'Satış Öncesi / PoC', tur:'Web Uygulaması', oncelik:'Orta', faz:'Faz 1',
    repo:'—', canli:'—', test:'—', tasarim:'figma.com/ege-veli', sunucu:'Mevcut okul sunucusu',
    teknoloji:['Next.js','PostgreSQL'], ucuncuTaraf:['Netgsm SMS'],
    teknikSorumlu:'EMP-006', musteriSorumlu:'EMP-002',
    riskler:['Mevcut okul yönetim sisteminin API desteği sınırlı'], gecikmeNedeni:null, sonGuncelleme:'2026-08-01' },
  { kod:'PRJ-2025-008', ad:'Deniz Lojistik Sevkiyat Takip Paneli', musteri:'MUS-2024-001', musteriAd:'Deniz Lojistik A.Ş.',
    pm:'EMP-003', ekip:['EMP-005','EMP-006'], durum:'Tamamlandı', saglik:'İyi',
    baslangic:'2025-02-10', planlananBitis:'2025-07-30', gercekBitis:'2025-07-28', ilerleme:100,
    sozlesmeTutari:960000, butce:600000, tahminiSure:1400,
    kaynak:'Müşteri Sözleşmesi', tur:'Web Uygulaması', oncelik:'Yüksek', faz:null, arsiv:true,
    repo:'github.com/gaviaworks/deniz-sevkiyat', canli:'panel.denizlojistik.com', test:'—',
    tasarim:'figma.com/deniz', sunucu:'Müşteri bulut', teknoloji:['Node.js','React','PostgreSQL'],
    ucuncuTaraf:['Google Maps','e-İrsaliye'], teknikSorumlu:'EMP-005', musteriSorumlu:'EMP-002',
    riskler:[], gecikmeNedeni:null, sonGuncelleme:'2025-08-04' },

  /* ---- Sistem öncesi teslim edilen projeler (VB-27) ---------------------
     `DB.surveys[].ilgili` altı anket için var olmayan proje kodu taşıyordu;
     anketler 2025-2026 aralığına yayılmış "Proje teslimi" anketleriydi ve
     müşterilerin `projeSayisi` ömür boyu sayacı da bu projeleri zaten
     sayıyordu (örn. MUS-2024-001 → 3 proje, veride 1 kayıt vardı).
     Karar (assumptions V-37): anketler değil VERİ tamamlandı — altı proje
     geçmiş teslim olarak yazıldı, hepsi `arsiv:true` olduğu için aktif
     listeleri ve KPI'ları etkilemez. `sozlesmeTutari` her müşterinin
     `toplamCiro` boşluğunun içinde kalır; sözleşme kaydı sistemde yoktur
     (sistem öncesi iş), bu yüzden `DB.contracts`'ta karşılığı aranmaz. */
  { kod:'PRJ-2024-011', ad:'Deniz Lojistik Araç Takip Entegrasyonu', musteri:'MUS-2024-001',
    musteriAd:'Deniz Lojistik A.Ş.', pm:'EMP-003', ekip:['EMP-005','EMP-006'],
    durum:'Tamamlandı', saglik:'İyi',
    baslangic:'2024-08-05', planlananBitis:'2025-10-17', gercekBitis:'2025-10-31', ilerleme:100,
    sozlesmeTutari:620000, butce:400000, tahminiSure:940,
    kaynak:'Müşteri Sözleşmesi', tur:'Entegrasyon', oncelik:'Orta', faz:null, arsiv:true,
    repo:'github.com/gaviaworks/deniz-arac-takip', canli:'—', test:'—',
    tasarim:'—', sunucu:'Müşteri bulut', teknoloji:['Node.js','PostgreSQL'],
    ucuncuTaraf:['Arvento'], teknikSorumlu:'EMP-005', musteriSorumlu:'EMP-002',
    riskler:[], gecikmeNedeni:null, sonGuncelleme:'2025-11-03' },

  { kod:'PRJ-2025-009', ad:'Vitalis Laboratuvar Sonuç Portalı', musteri:'MUS-2024-002',
    musteriAd:'Vitalis Sağlık Grubu', pm:'EMP-003', ekip:['EMP-004','EMP-009'],
    durum:'Tamamlandı', saglik:'İyi',
    baslangic:'2025-06-02', planlananBitis:'2026-03-27', gercekBitis:'2026-04-03', ilerleme:100,
    sozlesmeTutari:420000, butce:280000, tahminiSure:720,
    kaynak:'Müşteri Sözleşmesi', tur:'Web Uygulaması', oncelik:'Orta', faz:null, arsiv:true,
    repo:'github.com/gaviaworks/vitalis-lab', canli:'lab.vitalis.com.tr', test:'—',
    tasarim:'figma.com/vitalis-lab', sunucu:'Müşteri bulut', teknoloji:['React','Node.js'],
    ucuncuTaraf:['HL7 arayüzü'], teknikSorumlu:'EMP-004', musteriSorumlu:'EMP-002',
    riskler:[], gecikmeNedeni:null, sonGuncelleme:'2026-04-06' },

  { kod:'PRJ-2025-010', ad:'Anadolu Perakende Stok Sayım Uygulaması', musteri:'MUS-2025-003',
    musteriAd:'Anadolu Perakende Ticaret Ltd.', pm:'EMP-003', ekip:['EMP-006','EMP-009'],
    durum:'Tamamlandı', saglik:'Dikkat',
    baslangic:'2025-04-14', planlananBitis:'2025-11-14', gercekBitis:'2025-11-28', ilerleme:100,
    sozlesmeTutari:480000, butce:320000, tahminiSure:820,
    kaynak:'Müşteri Sözleşmesi', tur:'Mobil Uygulama', oncelik:'Orta', faz:null, arsiv:true,
    repo:'github.com/gaviaworks/anadolu-stok', canli:'—', test:'—',
    tasarim:'figma.com/anadolu-stok', sunucu:'Şirket bulut', teknoloji:['React Native','Node.js'],
    ucuncuTaraf:['Barkod SDK'], teknikSorumlu:'EMP-006', musteriSorumlu:'EMP-013',
    riskler:[], gecikmeNedeni:'Devreye alma sonrası kullanıcı eğitimi planlanandan uzun sürdü',
    sonGuncelleme:'2025-12-08' },

  { kod:'PRJ-2025-012', ad:'Kılıç Tekstil Üretim Takip Paneli', musteri:'MUS-2025-006',
    musteriAd:'Kılıç Tekstil San. Tic.', pm:'EMP-003', ekip:['EMP-005'],
    durum:'Tamamlandı', saglik:'İyi',
    baslangic:'2025-07-07', planlananBitis:'2026-01-23', gercekBitis:'2026-01-30', ilerleme:100,
    sozlesmeTutari:340000, butce:220000, tahminiSure:610,
    kaynak:'Müşteri Sözleşmesi', tur:'Web Uygulaması', oncelik:'Orta', faz:null, arsiv:true,
    repo:'github.com/gaviaworks/kilic-uretim', canli:'panel.kilictekstil.com', test:'—',
    tasarim:'—', sunucu:'Müşteri sunucusu', teknoloji:['Vue','Node.js','MySQL'],
    ucuncuTaraf:[], teknikSorumlu:'EMP-005', musteriSorumlu:'EMP-002',
    riskler:[], gecikmeNedeni:null, sonGuncelleme:'2026-02-02' },

  { kod:'PRJ-2026-008', ad:'Anka Finans Risk Raporlama Pilotu', musteri:'MUS-2026-011',
    musteriAd:'Anka Finans Teknolojileri', pm:'EMP-003', ekip:['EMP-007'],
    durum:'Tamamlandı', saglik:'İyi',
    baslangic:'2026-02-16', planlananBitis:'2026-05-22', gercekBitis:'2026-05-29', ilerleme:100,
    sozlesmeTutari:190000, butce:130000, tahminiSure:340,
    kaynak:'Satış Öncesi / PoC', tur:'Veri ve Raporlama', oncelik:'Orta', faz:null, arsiv:true,
    repo:'github.com/gaviaworks/anka-risk-pilot', canli:'—', test:'—',
    tasarim:'—', sunucu:'Müşteri bulut', teknoloji:['Python','PostgreSQL'],
    ucuncuTaraf:[], teknikSorumlu:'EMP-007', musteriSorumlu:'EMP-014',
    riskler:[], gecikmeNedeni:null, sonGuncelleme:'2026-06-01' },

  { kod:'PRJ-2023-014', ad:'Karadeniz Tarım Ürün Alım Kayıt Sistemi', musteri:'MUS-2023-012',
    musteriAd:'Karadeniz Tarım Kooperatifi', pm:'EMP-003', ekip:['EMP-006'],
    durum:'Tamamlandı', saglik:'İyi',
    baslangic:'2023-11-06', planlananBitis:'2025-03-31', gercekBitis:'2025-04-18', ilerleme:100,
    sozlesmeTutari:120000, butce:82000, tahminiSure:280,
    kaynak:'Müşteri Sözleşmesi', tur:'Web Uygulaması', oncelik:'Düşük', faz:null, arsiv:true,
    repo:'github.com/gaviaworks/karadeniz-alim', canli:'—', test:'—',
    tasarim:'—', sunucu:'Şirket bulut', teknoloji:['PHP','MySQL'],
    ucuncuTaraf:[], teknikSorumlu:'EMP-006', musteriSorumlu:'EMP-002',
    riskler:[], gecikmeNedeni:null, sonGuncelleme:'2025-04-22' }
];

/* ---- Proje modülleri --------------------------------------------------- */
DB.projectModules = [
  { kod:'MOD-001', proje:'PRJ-2026-001', ad:'Randevu oluşturma akışı', durum:'Tamamlandı', ilerleme:100, sorumlu:'EMP-008', efor:180 },
  { kod:'MOD-002', proje:'PRJ-2026-001', ad:'Tahlil sonuç görüntüleme', durum:'Test', ilerleme:88, sorumlu:'EMP-008', efor:220 },
  { kod:'MOD-003', proje:'PRJ-2026-001', ad:'Bildirim ve hatırlatma', durum:'Test', ilerleme:75, sorumlu:'EMP-005', efor:140 },
  { kod:'MOD-004', proje:'PRJ-2026-001', ad:'Yönetim paneli', durum:'Geliştirme', ilerleme:62, sorumlu:'EMP-006', efor:260 },
  { kod:'MOD-005', proje:'PRJ-2026-002', ad:'Veri hazırlama hattı', durum:'Tamamlandı', ilerleme:100, sorumlu:'EMP-007', efor:160 },
  { kod:'MOD-006', proje:'PRJ-2026-002', ad:'Skorlama modeli', durum:'Geliştirme', ilerleme:70, sorumlu:'EMP-007', efor:240 },
  { kod:'MOD-007', proje:'PRJ-2026-002', ad:'Başvuru inceleme paneli', durum:'Geliştirme', ilerleme:35, sorumlu:'EMP-006', efor:200 },
  { kod:'MOD-008', proje:'PRJ-2026-002', ad:'Karar raporlama', durum:'Planlama', ilerleme:0, sorumlu:'EMP-005', efor:120 },
  { kod:'MOD-009', proje:'PRJ-2026-003', ad:'Mobil ekip yönetimi', durum:'Tamamlandı', ilerleme:100, sorumlu:'EMP-005', efor:340 },
  { kod:'MOD-010', proje:'PRJ-2026-003', ad:'İş emri takibi', durum:'Test', ilerleme:92, sorumlu:'EMP-006', efor:420 },
  { kod:'MOD-011', proje:'PRJ-2026-003', ad:'Logo ERP entegrasyonu', durum:'Geliştirme', ilerleme:44, sorumlu:'EMP-005', efor:380 },
  { kod:'MOD-012', proje:'PRJ-2026-003', ad:'Rapor merkezi', durum:'Planlama', ilerleme:10, sorumlu:'EMP-006', efor:300 },
  { kod:'MOD-013', proje:'PRJ-2026-005', ad:'Rezervasyon motoru', durum:'Geliştirme', ilerleme:52, sorumlu:'EMP-006', efor:280 },
  { kod:'MOD-014', proje:'PRJ-2026-005', ad:'Ödeme entegrasyonu', durum:'Planlama', ilerleme:12, sorumlu:'EMP-006', efor:160 },
  { kod:'MOD-015', proje:'PRJ-2026-006', ad:'Servis randevu takvimi', durum:'Test', ilerleme:90, sorumlu:'EMP-006', efor:180 }
];

/* ---- Milestone --------------------------------------------------------- */
/* Milestone = sözleşmenin ödeme planındaki taksit.
   Canonical (para konvansiyonu: misc.js → DB.contracts başlığı):
   · `odeme`   = taksitin **NET** tutarı (KDV hariç) = bağlı faturanın `tutar`ı.
   · Bir sözleşmenin taksitlerinin `odeme` toplamı = sözleşmenin `tutar`ı (net) —
     TAM SET burada tutulur, eksik taksit bırakılmaz.
   · `taksit`  = ödeme planındaki sıra (1 tabanlı) · `sozlesme` = bağlı sözleşme.
   · Bir milestone'a en fazla BİR fatura bağlanır; `odemeDurum` o faturanın
     tahsilat kaydındaki durumu yansıtır.
   SZL-2026-022 (aylık bakım) proje bazlı değildir — taksitleri milestone olarak
   değil, aylık fatura olarak yürür. */
DB.milestones = [
  /* PRJ-2026-001 · SZL-2026-019 · %30 · %30 · %40 → 264.000 + 264.000 + 352.000 = 880.000 */
  { kod:'MS-001', proje:'PRJ-2026-001', sozlesme:'SZL-2026-019', taksit:1, ad:'Beta sürüm teslimi', tarih:'2026-07-10', durum:'Tamamlandı', odeme:264000, odemeDurum:'Ödendi', ilerleme:100, milestone:'PMS-001' },
  { kod:'MS-002', proje:'PRJ-2026-001', sozlesme:'SZL-2026-019', taksit:2, ad:'Store yayın onayı', tarih:'2026-08-14', durum:'Yaklaşıyor', odeme:264000, odemeDurum:'Bekliyor', ilerleme:82 },
  { kod:'MS-019', proje:'PRJ-2026-001', sozlesme:'SZL-2026-019', taksit:3, ad:'Yayın sonrası kabul ve devir', tarih:'2026-08-28', durum:'Planlandı', odeme:352000, odemeDurum:'Bekliyor', ilerleme:0 },
  /* PRJ-2026-002 · SZL-2026-021 · %50 peşin · %50 teslimde → 300.000 + 300.000 = 600.000 */
  { kod:'MS-003', proje:'PRJ-2026-002', sozlesme:'SZL-2026-021', taksit:1, ad:'POC kabul', tarih:'2026-07-25', durum:'Tamamlandı', odeme:250000, odemeDurum:'Ödendi', ilerleme:100, milestone:'PMS-002' },
  { kod:'MS-004', proje:'PRJ-2026-002', sozlesme:'SZL-2026-021', taksit:2, ad:'Canlıya alma', tarih:'2026-09-04', durum:'Planlandı', odeme:250000, odemeDurum:'Bekliyor', ilerleme:48 },
  /* PRJ-2026-003 · SZL-2025-018 · 6 eşit milestone → 184.000 × 6 = 1.104.000 */
  { kod:'MS-010', proje:'PRJ-2026-003', sozlesme:'SZL-2025-018', taksit:1, ad:'Analiz ve altyapı kurulumu', tarih:'2025-11-28', durum:'Tamamlandı', odeme:153333, odemeDurum:'Ödendi', ilerleme:100, milestone:'PMS-003' },
  { kod:'MS-011', proje:'PRJ-2026-003', sozlesme:'SZL-2025-018', taksit:2, ad:'Çekirdek modül teslimi', tarih:'2026-01-30', durum:'Tamamlandı', odeme:153333, odemeDurum:'Ödendi', ilerleme:100, milestone:'PMS-004' },
  { kod:'MS-012', proje:'PRJ-2026-003', sozlesme:'SZL-2025-018', taksit:3, ad:'Mobil ekip uygulaması', tarih:'2026-03-27', durum:'Tamamlandı', odeme:153333, odemeDurum:'Ödendi', ilerleme:100, milestone:'PMS-005' },
  { kod:'MS-013', proje:'PRJ-2026-003', sozlesme:'SZL-2025-018', taksit:4, ad:'Logo ERP entegrasyonu', tarih:'2026-05-29', durum:'Tamamlandı', odeme:153333, odemeDurum:'Ödendi', ilerleme:100, milestone:'PMS-006' },
  { kod:'MS-005', proje:'PRJ-2026-003', sozlesme:'SZL-2025-018', taksit:5, ad:'Faz 1 modül teslimi', tarih:'2026-08-29', durum:'Yaklaşıyor', odeme:153333, odemeDurum:'Bekliyor', ilerleme:64, milestone:'PMS-007' },
  { kod:'MS-006', proje:'PRJ-2026-003', sozlesme:'SZL-2025-018', taksit:6, ad:'Entegrasyon testi ve Faz 1 kapanışı', tarih:'2026-09-30', durum:'Planlandı', odeme:153335, odemeDurum:'Bekliyor', ilerleme:20 },
  /* PRJ-2026-004 · SZL-2026-020 · %40 · %30 · %30 → 141.600 + 106.200 + 106.200 = 354.000 */
  { kod:'MS-014', proje:'PRJ-2026-004', sozlesme:'SZL-2026-020', taksit:1, ad:'Analiz ve prototip onayı', tarih:'2026-06-05', durum:'Tamamlandı', odeme:118000, odemeDurum:'Ödendi', ilerleme:100, milestone:'PMS-008' },
  { kod:'MS-015', proje:'PRJ-2026-004', sozlesme:'SZL-2026-020', taksit:2, ad:'Üretim takip modülü teslimi', tarih:'2026-06-30', durum:'Tamamlandı', odeme:88500, odemeDurum:'Ödendi', ilerleme:100, milestone:'PMS-009' },
  { kod:'MS-009', proje:'PRJ-2026-004', sozlesme:'SZL-2026-020', taksit:3, ad:'Nihai teslim', tarih:'2026-07-24', durum:'Tamamlandı', odeme:88500, odemeDurum:'Bekliyor', ilerleme:100, milestone:'PMS-010' },
  /* PRJ-2026-005 · SZL-2026-023 · %30 · %30 · %40 → 126.000 + 126.000 + 168.000 = 420.000 */
  { kod:'MS-016', proje:'PRJ-2026-005', sozlesme:'SZL-2026-023', taksit:1, ad:'Kapsam ve tasarım onayı', tarih:'2026-06-26', durum:'Tamamlandı', odeme:126000, odemeDurum:'Ödendi', ilerleme:100, milestone:'PMS-011' },
  { kod:'MS-007', proje:'PRJ-2026-005', sozlesme:'SZL-2026-023', taksit:2, ad:'Rezervasyon motoru demo', tarih:'2026-08-22', durum:'Yaklaşıyor', odeme:126000, odemeDurum:'Bekliyor', ilerleme:52 },
  { kod:'MS-017', proje:'PRJ-2026-005', sozlesme:'SZL-2026-023', taksit:3, ad:'Portalın canlıya alınması', tarih:'2026-09-18', durum:'Planlandı', odeme:168000, odemeDurum:'Bekliyor', ilerleme:0 },
  /* PRJ-2026-006 · SZL-2026-024 · %50 peşin · %50 teslimde → 92.500 + 92.500 = 185.000 */
  { kod:'MS-018', proje:'PRJ-2026-006', sozlesme:'SZL-2026-024', taksit:1, ad:'Sözleşme peşinatı', tarih:'2026-03-16', durum:'Tamamlandı', odeme:92500, odemeDurum:'Ödendi', ilerleme:100 },
  { kod:'MS-008', proje:'PRJ-2026-006', sozlesme:'SZL-2026-024', taksit:2, ad:'Canlıya alma', tarih:'2026-06-26', durum:'Gecikti', odeme:92500, odemeDurum:'Bekliyor', ilerleme:71, milestone:'PMS-012' }
];

/* ---- Sprintler --------------------------------------------------------- */
/* `planlanan` / `tamamlanan` SAAT cinsindendir.
   `gorevSayisi` = sprintin GERÇEK görev sayısıdır. `DB.tasks` prototipte yalnız
   25 temsili görev tutar (sprintli olan 12'si), yani sprintin tüm görevleri modellenmiş
   değildir — `projeSayisi` gibi bilinçli bir "ömür boyu / gerçek sayaç" istisnasıdır
   (lessons L-08 istisnası, assumptions V-27).
   KURAL: `gorevSayisi` >= o sprinte bağlı `DB.tasks` kaydı sayısı. Ekranlar bu iki sayıyı
   aynı kolonda göstermez; modellenmiş kayıt sayısı "kayıtlı görev" diye ayrı etiketlenir. */
/* ---- PROJE MILESTONE'U (REVİZE 06) --------------------------------------
   `DB.milestones` ile bu koleksiyon AYNI ŞEY DEĞİLDİR ve karıştırılmaz:

     DB.milestones        → ÖDEME PLANI TAKSİTİ. Sözleşmeye bağlıdır, tutarı
                            vardır, faturaya ve tahsilata bağlanır.
     DB.projectMilestones → PROJE OLAYI. Tutarı YOKTUR; "ne zaman ne teslim
                            edildi/onaylandı" sorusunun cevabıdır.

   Koleksiyonu bölmek yerine ikinci bir küçük koleksiyon açıldı: `DB.milestones`
   19 kayıtla 25+ ekranın, `GV.fin.settleInvoice` zincirinin ve üç canon
   ekseninin (10 · 13 · 18) dayandığı ödeme defteridir; onu ikiye bölmek
   çalışan bir modülü kaldırmak olurdu. Bağ ÖDEME kaydında durur
   (`DB.milestones[].milestone`), milestone'da ayna alan doğmaz (§9d).

   KAYITLAR UYDURULMADI (L-13) — ikisi de var olan bir olaydan türetildi:
     · 5 kayıt `DB.deliveries`ten (gerçek teslim olayı, sorumlusu teslim eden)
     · 7 kayıt TAMAMLANMIŞ ödeme taksitinden (adı bir proje olayını anlatan;
       sorumlusu projenin PM'i). Kaynağı her kaydın `aciklama` alanında yazılı.
   `MS-018 'Sözleşme peşinatı'` bilerek DIŞARIDA bırakıldı: peşinat bir ÖDEME
   olayıdır, proje olayı değil — onu almak ayırdığımız iki ekseni ilk kayıtta
   yeniden karıştırmak olurdu.
   14 projenin 6'sında milestone var; kalan 8'de ne teslim ne tamamlanmış
   taksit var, o yüzden kayıt da yok — ekran bunu yazıyla söyler.

   `durum` kümesi `DB.milestoneStatuses`tir; ödeme taksiti de aynı kümeyi
   kullanır (aynı kelime, iki eksen — L-33'ün bilinen kalıbı). */
DB.milestoneStatuses = ['Planlandı','Yaklaşıyor','Gecikti','Tamamlandı'];

DB.projectMilestones = [
  /* PRJ-2026-001 */
  { kod:'PMS-001', proje:'PRJ-2026-001', baslik:'Beta sürüm (v0.9)', tarih:'2026-07-10',
    sorumlu:'EMP-003', durum:'Tamamlandı', teslimat:'TSL-2026-031',
    aciklama:'Teslim kaydından türetildi (TSL-2026-031): Test cihazlarına dağıtıldı' },
  /* PRJ-2026-002 */
  { kod:'PMS-002', proje:'PRJ-2026-002', baslik:'POC sonuç paketi', tarih:'2026-07-25',
    sorumlu:'EMP-007', durum:'Tamamlandı', teslimat:'TSL-2026-033',
    aciklama:'Teslim kaydından türetildi (TSL-2026-033): Doğruluk %87' },
  /* PRJ-2026-003 */
  { kod:'PMS-003', proje:'PRJ-2026-003', baslik:'Analiz ve altyapı kurulumu', tarih:'2025-11-28',
    sorumlu:'EMP-003', durum:'Tamamlandı', teslimat:null,
    aciklama:'Tamamlanmış ödeme planı taksitinden türetildi (MS-010 · %100)' },
  { kod:'PMS-004', proje:'PRJ-2026-003', baslik:'Çekirdek modül teslimi', tarih:'2026-01-30',
    sorumlu:'EMP-003', durum:'Tamamlandı', teslimat:null,
    aciklama:'Tamamlanmış ödeme planı taksitinden türetildi (MS-011 · %100)' },
  { kod:'PMS-005', proje:'PRJ-2026-003', baslik:'Mobil ekip uygulaması', tarih:'2026-03-27',
    sorumlu:'EMP-003', durum:'Tamamlandı', teslimat:null,
    aciklama:'Tamamlanmış ödeme planı taksitinden türetildi (MS-012 · %100)' },
  { kod:'PMS-006', proje:'PRJ-2026-003', baslik:'Logo ERP entegrasyonu', tarih:'2026-05-29',
    sorumlu:'EMP-003', durum:'Tamamlandı', teslimat:null,
    aciklama:'Tamamlanmış ödeme planı taksitinden türetildi (MS-013 · %100)' },
  { kod:'PMS-007', proje:'PRJ-2026-003', baslik:'Faz 1 modül paketi', tarih:'2026-08-29',
    sorumlu:'EMP-003', durum:'Planlandı', teslimat:'TSL-2026-034',
    aciklama:'Teslim kaydından türetildi (TSL-2026-034): Kabul testi sonrası' },
  /* PRJ-2026-004 */
  { kod:'PMS-008', proje:'PRJ-2026-004', baslik:'Analiz ve prototip onayı', tarih:'2026-06-05',
    sorumlu:'EMP-003', durum:'Tamamlandı', teslimat:null,
    aciklama:'Tamamlanmış ödeme planı taksitinden türetildi (MS-014 · %100)' },
  { kod:'PMS-009', proje:'PRJ-2026-004', baslik:'Üretim takip modülü teslimi', tarih:'2026-06-30',
    sorumlu:'EMP-003', durum:'Tamamlandı', teslimat:null,
    aciklama:'Tamamlanmış ödeme planı taksitinden türetildi (MS-015 · %100)' },
  { kod:'PMS-010', proje:'PRJ-2026-004', baslik:'Üretim takip v1.0 canlı', tarih:'2026-07-22',
    sorumlu:'EMP-003', durum:'Tamamlandı', teslimat:'TSL-2026-032',
    aciklama:'Teslim kaydından türetildi (TSL-2026-032): Sorunsuz geçiş' },
  /* PRJ-2026-005 */
  { kod:'PMS-011', proje:'PRJ-2026-005', baslik:'Kapsam ve tasarım onayı', tarih:'2026-06-26',
    sorumlu:'EMP-003', durum:'Tamamlandı', teslimat:null,
    aciklama:'Tamamlanmış ödeme planı taksitinden türetildi (MS-016 · %100)' },
  /* PRJ-2026-006 */
  { kod:'PMS-012', proje:'PRJ-2026-006', baslik:'Randevu sistemi canlı', tarih:'2026-06-26',
    sorumlu:'EMP-003', durum:'Gecikti', teslimat:'TSL-2026-035',
    aciklama:'Teslim kaydından türetildi (TSL-2026-035): Revizyon turu devam ediyor' }
];

DB.sprints = [
  { kod:'SPR-2026-018', proje:'PRJ-2026-001', ad:'Sprint 18 — Test düzeltmeleri', baslangic:'2026-07-27', bitis:'2026-08-09', durum:'Devam ediyor', planlanan:64, tamamlanan:41, gorevSayisi:11 },
  { kod:'SPR-2026-019', proje:'PRJ-2026-002', ad:'Sprint 6 — Skorlama modeli', baslangic:'2026-07-27', bitis:'2026-08-09', durum:'Devam ediyor', planlanan:72, tamamlanan:38, gorevSayisi:9 },
  { kod:'SPR-2026-020', proje:'PRJ-2026-003', ad:'Sprint 22 — Logo entegrasyonu', baslangic:'2026-07-20', bitis:'2026-08-02', durum:'Tamamlandı', planlanan:80, tamamlanan:68, gorevSayisi:14 },
  { kod:'SPR-2026-021', proje:'PRJ-2026-003', ad:'Sprint 23 — Rapor merkezi', baslangic:'2026-08-03', bitis:'2026-08-16', durum:'Planlandı', planlanan:76, tamamlanan:0, gorevSayisi:12 },
  { kod:'SPR-2026-022', proje:'PRJ-2026-005', ad:'Sprint 4 — Rezervasyon akışı', baslangic:'2026-07-27', bitis:'2026-08-09', durum:'Devam ediyor', planlanan:56, tamamlanan:29, gorevSayisi:8 },
  { kod:'SPR-2026-023', proje:'PRJ-2026-006', ad:'Sprint 9 — Revizyon turu', baslangic:'2026-07-27', bitis:'2026-08-09', durum:'Devam ediyor', planlanan:40, tamamlanan:14, gorevSayisi:6 }
];

/* ---- Görevler (PROMPT.md §12) ------------------------------------------ */
/* BAĞ ALANI (lessons L-13): `destek` = görevi doğuran destek talebi (DST-*).
   PROMPT.md §18 "destek → görev" dönüşümünün veri karşılığıdır; `app-destek-detay.html`
   göreve dönüştürme mutasyonu bu alanı yazar. null = görev destek talebinden doğmadı.
   Hata bağı burada DEĞİL, `DB.bugs[].gorev` tarafında tutulur — tek yön, ayna alan yok.
   `etki` ekseni: hatadan doğan görevin etkisi hatanın şiddetinden gelir
   (şiddet 'Kritik' → etki 'Çok yüksek', diğer üçü birebir — components.md §9). */
DB.tasks = [
  { kod:'GRV-2026-101', baslik:'Tahlil sonuç ekranında PDF indirme hatası düzeltilecek', tur:'Hata',
    proje:'PRJ-2026-001', modul:'MOD-002', sprint:'SPR-2026-018', musteri:'MUS-2024-002', dep:'DEP-09',
    olusturan:'EMP-009', veren:'EMP-003', sorumlu:'EMP-008', yardimci:['EMP-005'], izleyiciler:['EMP-003','EMP-013'],
    kontrolEden:'EMP-009', onaylayan:'EMP-003', oncelik:'Kritik', etki:'Çok yüksek', aciliyet:'Yüksek', destek:null,
    durum:'Devam ediyor', baslangic:'2026-07-30', termin:'2026-08-01', tamamlanma:null,
    tahminiSure:8, gercekSure:41, faturalanabilir:6.5, ilerleme:70, revizyon:0, yenidenAcilma:1,
    aciklama:'iOS 17 cihazlarda PDF indirme akışı sessizce başarısız oluyor. Android etkilenmiyor.',
    amac:'Store yayın onayı öncesi kritik hata giderilmeli',
    kabulKriteri:'iOS 16/17/18 cihazlarda PDF indirilebilmeli, hata log kaydı temiz olmalı',
    beklenenCikti:'Düzeltme PR + test raporu', etiketler:['iOS','Kritik','Store engeli'], aktif:true },
  { kod:'GRV-2026-102', baslik:'App Store yayın notları ve ekran görüntüleri hazırlanacak', tur:'Proje görevi',
    proje:'PRJ-2026-001', modul:null, sprint:'SPR-2026-018', musteri:'MUS-2024-002', dep:'DEP-06',
    olusturan:'EMP-003', veren:'EMP-003', sorumlu:'EMP-004', yardimci:[], izleyiciler:['EMP-008'],
    kontrolEden:'EMP-003', onaylayan:'EMP-003', oncelik:'Yüksek', etki:'Orta', aciliyet:'Yüksek', destek:null,
    durum:'Kontrolde', baslangic:'2026-07-29', termin:'2026-08-02', tamamlanma:null,
    tahminiSure:6, gercekSure:34, faturalanabilir:5, ilerleme:100, revizyon:1, yenidenAcilma:0,
    aciklama:'6.7" ve 6.1" ekran görüntüleri, TR ve EN yayın notları.',
    amac:'Store başvurusunun eksiksiz gönderilmesi', kabulKriteri:'Apple ölçü şartlarına uygun 8 görsel',
    beklenenCikti:'Figma dosyası + dışa aktarılmış PNG seti', etiketler:['Store','Tasarım'], aktif:true },
  { kod:'GRV-2026-103', baslik:'Skorlama modeli doğruluk raporu çıkarılacak', tur:'Yazılım geliştirme görevi',
    proje:'PRJ-2026-002', modul:'MOD-006', sprint:'SPR-2026-019', musteri:'MUS-2026-011', dep:'DEP-10',
    olusturan:'EMP-003', veren:'EMP-003', sorumlu:'EMP-007', yardimci:[], izleyiciler:['EMP-002'],
    kontrolEden:'EMP-003', onaylayan:'EMP-001', oncelik:'Yüksek', etki:'Yüksek', aciliyet:'Orta', destek:null,
    durum:'Devam ediyor', baslangic:'2026-07-28', termin:'2026-08-07', tamamlanma:null,
    tahminiSure:16, gercekSure:33, faturalanabilir:9, ilerleme:55, revizyon:0, yenidenAcilma:0,
    aciklama:'Test kümesi üzerinde precision/recall ve karışıklık matrisi.',
    amac:'Regülasyon eşiğinin sağlandığının belgelenmesi', kabulKriteri:'Doğruluk ≥ %85, rapor PDF',
    beklenenCikti:'Doğruluk raporu', etiketler:['AI','Rapor'], aktif:true },
  { kod:'GRV-2026-104', baslik:'Başvuru inceleme paneli liste ekranı', tur:'Yazılım geliştirme görevi',
    proje:'PRJ-2026-002', modul:'MOD-007', sprint:'SPR-2026-019', musteri:'MUS-2026-011', dep:'DEP-07',
    olusturan:'EMP-003', veren:'EMP-003', sorumlu:'EMP-006', yardimci:['EMP-016'], izleyiciler:[],
    kontrolEden:'EMP-005', onaylayan:'EMP-003', oncelik:'Orta', etki:'Orta', aciliyet:'Orta', destek:null,
    durum:'Devam ediyor', baslangic:'2026-07-31', termin:'2026-08-08', tamamlanma:null,
    tahminiSure:20, gercekSure:19, faturalanabilir:7, ilerleme:40, revizyon:0, yenidenAcilma:0,
    aciklama:'Filtre, sayfalama ve skor bazlı sıralama içeren başvuru listesi.',
    amac:'Kredi uzmanının başvuruları hızlı taraması', kabulKriteri:'1000 kayıtta 300ms altı render',
    beklenenCikti:'React bileşeni + Storybook', etiketler:['Frontend'], aktif:true },
  { kod:'GRV-2026-105', baslik:'Logo ERP stok senkronizasyon servisi', tur:'Yazılım geliştirme görevi',
    proje:'PRJ-2026-003', modul:'MOD-011', sprint:'SPR-2026-021', musteri:'MUS-2025-005', dep:'DEP-08',
    olusturan:'EMP-003', veren:'EMP-003', sorumlu:'EMP-005', yardimci:[], izleyiciler:['EMP-010'],
    kontrolEden:'EMP-003', onaylayan:'EMP-003', oncelik:'Yüksek', etki:'Yüksek', aciliyet:'Orta', destek:null,
    durum:'Engellendi', baslangic:'2026-07-22', termin:'2026-08-05', tamamlanma:null,
    tahminiSure:24, gercekSure:38, faturalanabilir:11, ilerleme:45, revizyon:0, yenidenAcilma:0,
    aciklama:'Logo tarafındaki stok hareketlerinin 15 dakikada bir çekilmesi.',
    amac:'Stok verisinin tek kaynaktan yönetilmesi', kabulKriteri:'Fark raporu sıfır olmalı',
    beklenenCikti:'Servis + izleme paneli', engelNedeni:'Müşteri Logo API test hesabını hâlâ açmadı',
    beklemeNedeni:'Müşteri', beklemeNotu:'Logo API test hesabı talebi 22 Temmuz\'da iletildi',
    etiketler:['Entegrasyon','Engelli'], aktif:true },
  { kod:'GRV-2026-106', baslik:'Rapor merkezi ekran tasarımları', tur:'Tasarım görevi',
    proje:'PRJ-2026-003', modul:'MOD-012', sprint:'SPR-2026-021', musteri:'MUS-2025-005', dep:'DEP-06',
    olusturan:'EMP-003', veren:'EMP-003', sorumlu:'EMP-004', yardimci:['EMP-015'], izleyiciler:[],
    kontrolEden:'EMP-003', onaylayan:'EMP-003', oncelik:'Orta', etki:'Orta', aciliyet:'Düşük', destek:null,
    durum:'Atandı', baslangic:'2026-08-03', termin:'2026-08-16', tamamlanma:null,
    tahminiSure:28, gercekSure:0, faturalanabilir:0, ilerleme:0, revizyon:0, yenidenAcilma:0,
    aciklama:'8 rapor ekranı için tasarım ve etkileşim akışları.',
    amac:'Faz 1 rapor modülünün geliştirmeye hazır hale gelmesi', kabulKriteri:'Tüm ekranlar 1440/768/390',
    beklenenCikti:'Figma dosyası', etiketler:['Tasarım'], aktif:true },
  { kod:'GRV-2026-107', baslik:'Trakya randevu ekranı 8. revizyon talebi', tur:'Revizyon',
    proje:'PRJ-2026-006', modul:'MOD-015', sprint:'SPR-2026-023', musteri:'MUS-2026-010', dep:'DEP-07',
    olusturan:'EMP-013', veren:'EMP-003', sorumlu:'EMP-006', yardimci:[], izleyiciler:['EMP-001','EMP-002'],
    kontrolEden:'EMP-003', onaylayan:'EMP-001', oncelik:'Kritik', etki:'Yüksek', aciliyet:'Yüksek', destek:null,
    durum:'Revizede', baslangic:'2026-07-25', termin:'2026-07-30', tamamlanma:null,
    tahminiSure:12, gercekSure:18, faturalanabilir:0, ilerleme:60, revizyon:7, yenidenAcilma:3,
    aciklama:'Müşteri randevu adımlarının sırasını yeniden değiştirmek istiyor.',
    amac:'Müşteri onayının alınması', kabulKriteri:'Müşteri yazılı onayı',
    beklenenCikti:'Güncellenmiş akış', revizeNot:'Kapsam dışı — ek teklif gerekiyor',
    beklemeNedeni:'Müşteri', beklemeNotu:'Ek teklif kararı müşteride',
    gecikmeNedeni:'Kapsam dışı revizyon zinciri', etiketler:['Revizyon','Kapsam dışı','Eskalasyon'], aktif:true },
  { kod:'GRV-2026-108', baslik:'Nova rezervasyon takvimi bileşeni', tur:'Yazılım geliştirme görevi',
    proje:'PRJ-2026-005', modul:'MOD-013', sprint:'SPR-2026-022', musteri:'MUS-2026-007', dep:'DEP-07',
    olusturan:'EMP-003', veren:'EMP-003', sorumlu:'EMP-006', yardimci:['EMP-016'], izleyiciler:[],
    kontrolEden:'EMP-009', onaylayan:'EMP-003', oncelik:'Orta', etki:'Orta', aciliyet:'Orta', destek:null,
    durum:'Devam ediyor', baslangic:'2026-07-29', termin:'2026-08-09', tamamlanma:null,
    tahminiSure:22, gercekSure:17, faturalanabilir:12, ilerleme:50, revizyon:0, yenidenAcilma:0,
    aciklama:'Müsaitlik takvimi, çoklu oda seçimi ve fiyat gösterimi.',
    amac:'Rezervasyon akışının tamamlanması', kabulKriteri:'Mobilde dokunmatik kaydırma çalışmalı',
    beklenenCikti:'Bileşen + testler', etiketler:['Frontend'], aktif:true },
  { kod:'GRV-2026-109', baslik:'Ege Eğitim veli portalı bilgi mimarisi', tur:'Ön analiz görevi',
    proje:'PRJ-2026-007', modul:null, sprint:null, musteri:'MUS-2025-004', dep:'DEP-04',
    olusturan:'EMP-002', veren:'EMP-003', sorumlu:'EMP-003', yardimci:[], izleyiciler:['EMP-004'],
    kontrolEden:'EMP-001', onaylayan:'EMP-001', oncelik:'Orta', etki:'Orta', aciliyet:'Orta', destek:null,
    durum:'Devam ediyor', baslangic:'2026-08-01', termin:'2026-08-12', tamamlanma:null,
    tahminiSure:14, gercekSure:3, faturalanabilir:3, ilerleme:22, revizyon:0, yenidenAcilma:0,
    aciklama:'Veli, öğretmen ve idare rolleri için sayfa haritası.',
    amac:'Geliştirme öncesi kapsamın netleşmesi', kabulKriteri:'Onaylı sayfa haritası',
    beklenenCikti:'Bilgi mimarisi dokümanı', etiketler:['Analiz'], aktif:true },
  { kod:'GRV-2026-110', baslik:'Aylık sunucu maliyet raporu hazırlanacak', tur:'Tekrarlayan görev',
    proje:null, modul:null, sprint:null, musteri:null, dep:'DEP-12',
    olusturan:'EMP-001', veren:'EMP-001', sorumlu:'EMP-010', yardimci:[], izleyiciler:['EMP-012'],
    kontrolEden:'EMP-012', onaylayan:'EMP-001', oncelik:'Düşük', etki:'Düşük', aciliyet:'Düşük', destek:null,
    durum:'Devam ediyor', baslangic:'2026-08-01', termin:'2026-08-05', tamamlanma:null,
    tahminiSure:4, gercekSure:1, faturalanabilir:0, ilerleme:25, revizyon:0, yenidenAcilma:0,
    aciklama:'Tüm projelerin bulut maliyetleri proje bazında ayrıştırılacak.',
    amac:'Proje kârlılığının doğru hesaplanması', kabulKriteri:'Proje bazlı dağıtım tablosu',
    beklenenCikti:'Excel raporu', tekrar:'Aylık', etiketler:['DevOps','Tekrarlayan'], aktif:true },
  { kod:'GRV-2026-111', baslik:'Yeni geliştirici için ekipman zimmet hazırlığı', tur:'Demirbaş görevi',
    proje:null, modul:null, sprint:null, musteri:null, dep:'DEP-17',
    olusturan:'EMP-011', veren:'EMP-011', sorumlu:'EMP-012', yardimci:[], izleyiciler:['EMP-010'],
    kontrolEden:'EMP-011', onaylayan:'EMP-011', oncelik:'Orta', etki:'Orta', aciliyet:'Orta', destek:null,
    durum:'Havuzda', baslangic:null, termin:'2026-08-18', tamamlanma:null,
    tahminiSure:5, gercekSure:0, faturalanabilir:0, ilerleme:0, revizyon:0, yenidenAcilma:0,
    aciklama:'Dizüstü, monitör, klavye ve lisans hazırlığı.',
    amac:'İşe giriş gününde ekipmanın hazır olması', kabulKriteri:'İmzalı zimmet tutanağı',
    beklenenCikti:'Zimmet kaydı', etiketler:['İK','Zimmet'], aktif:true },
  { kod:'GRV-2026-112', baslik:'Anadolu Perakende geciken tahsilat takibi', tur:'Müşteri görevi',
    proje:null, modul:null, sprint:null, musteri:'MUS-2025-003', dep:'DEP-15',
    olusturan:'EMP-001', veren:'EMP-001', sorumlu:'EMP-012', yardimci:[], izleyiciler:['EMP-002'],
    kontrolEden:'EMP-001', onaylayan:'EMP-001', oncelik:'Kritik', etki:'Yüksek', aciliyet:'Yüksek', destek:null,
    durum:'Devam ediyor', baslangic:'2026-07-20', termin:'2026-07-31', tamamlanma:null,
    tahminiSure:6, gercekSure:2, faturalanabilir:0, ilerleme:60, revizyon:0, yenidenAcilma:0,
    aciklama:'FTR-2026-018 numaralı fatura 41 gündür ödenmedi.',
    amac:'Tahsilatın yapılması', kabulKriteri:'Ödeme planı yazılı teyidi',
    beklenenCikti:'Ödeme planı', etiketler:['Tahsilat','Riskli müşteri'], aktif:true },
  { kod:'GRV-2026-113', baslik:'Vitalis mobil regresyon test seti', tur:'Test görevi',
    proje:'PRJ-2026-001', modul:'MOD-002', sprint:'SPR-2026-018', musteri:'MUS-2024-002', dep:'DEP-11',
    olusturan:'EMP-003', veren:'EMP-003', sorumlu:'EMP-009', yardimci:[], izleyiciler:['EMP-008'],
    /* REVİZE 02 — bu kayıt kendi durumuyla çelişiyordu: `Onay bekliyor`daydı ama
       kontrol eden ile onaylayan aynı kişiydi, yani beklediği onay adımı yoktu.
       Yayın kapısı olan bir regresyon setinin onayı kurucuya gider — aynı projede
       GRV-2026-107'de de `onaylayan:'EMP-001'` yazılı, kalıp uydurulmadı. */
    kontrolEden:'EMP-003', onaylayan:'EMP-001', oncelik:'Yüksek', etki:'Yüksek', aciliyet:'Yüksek', destek:null,
    durum:'Onay bekliyor', baslangic:'2026-07-26', termin:'2026-08-03', tamamlanma:null,
    tahminiSure:18, gercekSure:37, faturalanabilir:17, ilerleme:100, revizyon:0, yenidenAcilma:0,
    aciklama:'62 senaryoluk regresyon seti koşuldu, 3 hata bulundu.',
    amac:'Yayın öncesi kalite güvencesi', kabulKriteri:'Kritik hata sıfır olmalı',
    beklenenCikti:'Test raporu', teslimEdilenCikti:'test-raporu-v18.pdf', etiketler:['QA'], aktif:true },
  { kod:'GRV-2026-114', baslik:'Marmara Faz 1 kabul testi senaryoları', tur:'Test görevi',
    proje:'PRJ-2026-003', modul:'MOD-010', sprint:'SPR-2026-021', musteri:'MUS-2025-005', dep:'DEP-11',
    olusturan:'EMP-003', veren:'EMP-003', sorumlu:'EMP-009', yardimci:[], izleyiciler:['EMP-005'],
    kontrolEden:'EMP-003', onaylayan:'EMP-003', oncelik:'Orta', etki:'Orta', aciliyet:'Orta', destek:null,
    durum:'Havuzda', baslangic:null, termin:'2026-08-20', tamamlanma:null,
    tahminiSure:20, gercekSure:0, faturalanabilir:0, ilerleme:0, revizyon:0, yenidenAcilma:0,
    aciklama:'Müşteri kabul testi için senaryo seti hazırlanacak.',
    amac:'Kabul testinin sorunsuz geçmesi', kabulKriteri:'Tüm ana akışlar kapsanmalı',
    beklenenCikti:'Senaryo dokümanı', etiketler:['QA'], aktif:true },
  { kod:'GRV-2026-115', baslik:'Ofis yedekleme politikası gözden geçirilecek', tur:'Genel görev',
    proje:null, modul:null, sprint:null, musteri:null, dep:'DEP-12',
    olusturan:'EMP-010', veren:'EMP-001', sorumlu:'EMP-010', yardimci:[], izleyiciler:['EMP-001'],
    kontrolEden:'EMP-001', onaylayan:'EMP-001', oncelik:'Düşük', etki:'Orta', aciliyet:'Düşük', destek:null,
    durum:'Havuzda', baslangic:null, termin:'2026-08-28', tamamlanma:null,
    tahminiSure:8, gercekSure:0, faturalanabilir:0, ilerleme:0, revizyon:0, yenidenAcilma:0,
    aciklama:'Müşteri verisi barındıran sistemlerin yedekleme sıklığı gözden geçirilecek.',
    amac:'KVKK uyumu', kabulKriteri:'Yazılı politika dokümanı', beklenenCikti:'Politika dokümanı',
    etiketler:['Güvenlik','KVKK'], aktif:true },
  { kod:'GRV-2026-116', baslik:'Zirve Market teknik değerlendirme notu', tur:'Satış görevi',
    proje:null, modul:null, sprint:null, musteri:null, dep:'DEP-04',
    olusturan:'EMP-014', veren:'EMP-002', sorumlu:'EMP-003', yardimci:['EMP-008'], izleyiciler:['EMP-014'],
    kontrolEden:'EMP-002', onaylayan:'EMP-002', oncelik:'Yüksek', etki:'Yüksek', aciliyet:'Yüksek', destek:null,
    durum:'Devam ediyor', baslangic:'2026-08-01', termin:'2026-08-04', tamamlanma:null,
    tahminiSure:6, gercekSure:2, faturalanabilir:0, ilerleme:35, revizyon:0, yenidenAcilma:0,
    aciklama:'POS entegrasyonunun teknik yapılabilirliği değerlendirilecek.',
    amac:'Teklif öncesi risk tespiti', kabulKriteri:'Yazılı fizibilite notu',
    beklenenCikti:'Teknik not', etiketler:['Satış','Ön analiz'], aktif:true },
  { kod:'GRV-2026-117', baslik:'Kurumsal site blog bölümü içerik güncellemesi', tur:'Genel görev',
    proje:null, modul:null, sprint:null, musteri:null, dep:'DEP-18',
    olusturan:'EMP-002', veren:'EMP-002', sorumlu:'EMP-015', yardimci:[], izleyiciler:[],
    kontrolEden:'EMP-002', onaylayan:'EMP-002', oncelik:'Düşük', etki:'Düşük', aciliyet:'Düşük', destek:null,
    durum:'Atandı', baslangic:null, termin:'2026-08-15', tamamlanma:null,
    tahminiSure:10, gercekSure:0, faturalanabilir:0, ilerleme:0, revizyon:0, yenidenAcilma:0,
    aciklama:'4 yeni vaka çalışması görseli ve düzeni.',
    amac:'Web sitesi dönüşüm oranının artırılması', kabulKriteri:'4 görsel + düzen',
    beklenenCikti:'Görsel seti', etiketler:['Pazarlama','Freelancer'], aktif:true },
  { kod:'GRV-2026-118', baslik:'Vitalis push bildirim şablonları', tur:'Yazılım geliştirme görevi',
    proje:'PRJ-2026-001', modul:'MOD-003', sprint:'SPR-2026-018', musteri:'MUS-2024-002', dep:'DEP-08',
    olusturan:'EMP-003', veren:'EMP-003', sorumlu:'EMP-005', yardimci:[], izleyiciler:['EMP-008'],
    kontrolEden:'EMP-009', onaylayan:'EMP-003', oncelik:'Orta', etki:'Orta', aciliyet:'Orta', destek:null,
    durum:'Tamamlandı', baslangic:'2026-07-20', termin:'2026-07-28', tamamlanma:'2026-07-27',
    tahminiSure:10, gercekSure:9, faturalanabilir:9, ilerleme:100, revizyon:1, yenidenAcilma:0,
    aciklama:'Randevu hatırlatma ve sonuç bildirimi şablonları.',
    amac:'Bildirim modülünün tamamlanması', kabulKriteri:'TR/EN şablonlar test edildi',
    beklenenCikti:'Şablon seti', teslimEdilenCikti:'push-templates PR #142', etiketler:['Backend'], aktif:true },
  { kod:'GRV-2026-119', baslik:'Öz Gıda devreye alma sonrası kontrol', tur:'Proje görevi',
    proje:'PRJ-2026-004', modul:null, sprint:null, musteri:'MUS-2026-009', dep:'DEP-12',
    olusturan:'EMP-003', veren:'EMP-003', sorumlu:'EMP-010', yardimci:[], izleyiciler:['EMP-005'],
    kontrolEden:'EMP-003', onaylayan:'EMP-003', oncelik:'Orta', etki:'Orta', aciliyet:'Düşük', destek:null,
    durum:'Tamamlandı', baslangic:'2026-07-22', termin:'2026-07-26', tamamlanma:'2026-07-25',
    tahminiSure:6, gercekSure:5, faturalanabilir:5, ilerleme:100, revizyon:0, yenidenAcilma:0,
    aciklama:'Canlı ortam izleme, yedekleme ve uyarı kurulumları.',
    amac:'Sorunsuz canlı geçiş', kabulKriteri:'İzleme panosu aktif',
    beklenenCikti:'Kurulum notu', teslimEdilenCikti:'runbook-ozgida.md', etiketler:['DevOps'], aktif:true },
  { kod:'GRV-2026-120', baslik:'Deniz Lojistik bakım paketi yenileme teklifi', tur:'Satış görevi',
    proje:null, modul:null, sprint:null, musteri:'MUS-2024-001', dep:'DEP-02',
    olusturan:'EMP-002', veren:'EMP-001', sorumlu:'EMP-002', yardimci:[], izleyiciler:['EMP-001'],
    kontrolEden:'EMP-001', onaylayan:'EMP-001', oncelik:'Yüksek', etki:'Yüksek', aciliyet:'Orta', destek:null,
    durum:'Devam ediyor', baslangic:'2026-07-31', termin:'2026-08-12', tamamlanma:null,
    tahminiSure:8, gercekSure:2, faturalanabilir:0, ilerleme:20, revizyon:0, yenidenAcilma:0,
    aciklama:'Mevcut paketin kapsamı genişletilerek yenileme teklifi hazırlanacak.',
    amac:'Yıllık tekrarlayan gelirin korunması', kabulKriteri:'Onaylı teklif',
    beklenenCikti:'Teklif dokümanı', etiketler:['Satış','Yenileme'], aktif:true },
  { kod:'GRV-2026-121', baslik:'Marmara iş emri ekranı erişilebilirlik düzeltmeleri', tur:'Revizyon',
    proje:'PRJ-2026-003', modul:'MOD-010', sprint:'SPR-2026-020', musteri:'MUS-2025-005', dep:'DEP-07',
    olusturan:'EMP-009', veren:'EMP-003', sorumlu:'EMP-006', yardimci:[], izleyiciler:[],
    kontrolEden:'EMP-009', onaylayan:'EMP-003', oncelik:'Orta', etki:'Orta', aciliyet:'Orta', destek:null,
    durum:'Tamamlandı', baslangic:'2026-07-21', termin:'2026-07-29', tamamlanma:'2026-07-28',
    tahminiSure:12, gercekSure:13, faturalanabilir:13, ilerleme:100, revizyon:1, yenidenAcilma:0,
    aciklama:'Klavye navigasyonu ve kontrast düzeltmeleri.',
    amac:'WCAG AA uyumu', kabulKriteri:'Axe taramasında kritik bulgu sıfır',
    beklenenCikti:'Düzeltme PR', teslimEdilenCikti:'PR #318', etiketler:['Erişilebilirlik'], aktif:true },
  { kod:'GRV-2026-122', baslik:'Araç muayene randevusu alınacak — 34 GW 1907', tur:'Araç görevi',
    proje:null, modul:null, sprint:null, musteri:null, dep:'DEP-17',
    olusturan:'EMP-011', veren:'EMP-011', sorumlu:'EMP-012', yardimci:[], izleyiciler:['EMP-001'],
    kontrolEden:'EMP-011', onaylayan:'EMP-011', oncelik:'Yüksek', etki:'Orta', aciliyet:'Yüksek', destek:null,
    durum:'Atandı', baslangic:'2026-08-03', termin:'2026-08-10', tamamlanma:null,
    tahminiSure:2, gercekSure:0, faturalanabilir:0, ilerleme:0, revizyon:0, yenidenAcilma:0,
    aciklama:'Muayene geçerlilik tarihi 28 Ağustos, randevu alınmalı.',
    amac:'Yasal yükümlülük', kabulKriteri:'Randevu teyidi', beklenenCikti:'Randevu kaydı',
    etiketler:['Filo','Yasal'], aktif:true },
  { kod:'GRV-2026-123', baslik:'Q3 personel performans dönemi açılışı', tur:'Personel görevi',
    proje:null, modul:null, sprint:null, musteri:null, dep:'DEP-14',
    olusturan:'EMP-011', veren:'EMP-001', sorumlu:'EMP-011', yardimci:[], izleyiciler:['EMP-001'],
    kontrolEden:'EMP-001', onaylayan:'EMP-001', oncelik:'Orta', etki:'Orta', aciliyet:'Orta', destek:null,
    durum:'Atandı', baslangic:'2026-08-10', termin:'2026-08-24', tamamlanma:null,
    tahminiSure:12, gercekSure:0, faturalanabilir:0, ilerleme:0, revizyon:0, yenidenAcilma:0,
    aciklama:'Hedef belirleme ve öz değerlendirme formlarının açılması.',
    amac:'Performans döneminin zamanında başlaması', kabulKriteri:'Tüm personel formu açık',
    beklenenCikti:'Açık performans dönemi', etiketler:['İK'], aktif:true },
  { kod:'GRV-2026-124', baslik:'Eski proje arşiv temizliği', tur:'Genel görev',
    proje:null, modul:null, sprint:null, musteri:null, dep:'DEP-12',
    olusturan:'EMP-010', veren:'EMP-010', sorumlu:'EMP-010', yardimci:[], izleyiciler:[],
    kontrolEden:'EMP-001', onaylayan:'EMP-001', oncelik:'Düşük', etki:'Düşük', aciliyet:'Düşük', destek:null,
    durum:'Arşivlendi', baslangic:'2026-01-12', termin:'2026-02-28', tamamlanma:'2026-02-26',
    tahminiSure:10, gercekSure:9, faturalanabilir:0, ilerleme:100, revizyon:0, yenidenAcilma:0,
    aciklama:'2023 öncesi proje dosyaları soğuk depolamaya taşındı.',
    amac:'Depolama maliyeti', kabulKriteri:'—', beklenenCikti:'—', arsiv:true,
    etiketler:['Arşiv'], aktif:true },
  { kod:'GRV-2026-125', baslik:'Trakya Otomotiv müşteri memnuniyet eskalasyonu', tur:'Müşteri görevi',
    proje:'PRJ-2026-006', modul:null, sprint:null, musteri:'MUS-2026-010', dep:'DEP-03',
    olusturan:'EMP-013', veren:'EMP-001', sorumlu:'EMP-002', yardimci:['EMP-003'], izleyiciler:['EMP-001'],
    kontrolEden:'EMP-001', onaylayan:'EMP-001', oncelik:'Kritik', etki:'Çok yüksek', aciliyet:'Yüksek', destek:null,
    durum:'Devam ediyor', baslangic:'2026-07-28', termin:'2026-08-04', tamamlanma:null,
    tahminiSure:6, gercekSure:3, faturalanabilir:0, ilerleme:45, revizyon:0, yenidenAcilma:0,
    aciklama:'Memnuniyet puanı 2,4. Kapsam ve beklenti yeniden hizalanacak.',
    amac:'Müşteri kaybının önlenmesi', kabulKriteri:'Yazılı mutabakat',
    beklenenCikti:'Mutabakat notu', etiketler:['Eskalasyon','Riskli müşteri'], aktif:true },
  /* Destek talebinden doğan görev (§18 · §22 madde 16). Zincir uçtan uca yazılı:
     DST-2026-118 → HTA-2026-074 (`bugs.destek`) → GRV-2026-126 (`bugs.gorev`),
     görev de kaynağını `destek` alanında taşır. `etki` **Çok yüksek** çünkü bağlı
     hatanın şiddeti `Kritik` (components.md §9 şiddet→etki eşlemesi). */
  { kod:'GRV-2026-126', baslik:'Randevu formu tarih seçici mobil düzeltmesi', tur:'Hata',
    proje:'PRJ-2026-006', modul:'MOD-015', sprint:'SPR-2026-023', musteri:'MUS-2026-010', dep:'DEP-07',
    olusturan:'EMP-013', veren:'EMP-003', sorumlu:'EMP-006', yardimci:[], izleyiciler:['EMP-013','EMP-003'],
    kontrolEden:'EMP-009', onaylayan:'EMP-003', oncelik:'Kritik', etki:'Çok yüksek', aciliyet:'Yüksek',
    destek:'DST-2026-118',
    durum:'Devam ediyor', baslangic:'2026-08-03', termin:'2026-08-05', tamamlanma:null,
    tahminiSure:6, gercekSure:2, faturalanabilir:0, ilerleme:30, revizyon:0, yenidenAcilma:0,
    aciklama:'Safari iOS üzerinde randevu formundaki tarih seçici açılmıyor. Destek talebinden doğdu.',
    amac:'Kritik destek talebinin kapatılması', kabulKriteri:'iOS Safari ve Chrome üzerinde tarih seçici açılmalı',
    beklenenCikti:'Düzeltme PR + müşteri doğrulaması',
    etiketler:['Destek kaynaklı','Mobil','Kritik'], aktif:true }
];

/* ---- Alt görevler ve kontrol listeleri --------------------------------- */
DB.subtasks = [
  { kod:'ALT-001', ustGorev:'GRV-2026-101', baslik:'iOS 17 cihazda hata yeniden üretildi', tamam:true, sorumlu:'EMP-008' },
  { kod:'ALT-002', ustGorev:'GRV-2026-101', baslik:'Dosya izinleri incelendi', tamam:true, sorumlu:'EMP-008' },
  { kod:'ALT-003', ustGorev:'GRV-2026-101', baslik:'Düzeltme uygulandı', tamam:false, sorumlu:'EMP-008' },
  { kod:'ALT-004', ustGorev:'GRV-2026-101', baslik:'3 cihazda doğrulandı', tamam:false, sorumlu:'EMP-009' },
  { kod:'ALT-005', ustGorev:'GRV-2026-103', baslik:'Test kümesi hazırlandı', tamam:true, sorumlu:'EMP-007' },
  { kod:'ALT-006', ustGorev:'GRV-2026-103', baslik:'Metrikler hesaplandı', tamam:true, sorumlu:'EMP-007' },
  { kod:'ALT-007', ustGorev:'GRV-2026-103', baslik:'Rapor yazıldı', tamam:false, sorumlu:'EMP-007' },
  { kod:'ALT-008', ustGorev:'GRV-2026-105', baslik:'API sözleşmesi çıkarıldı', tamam:true, sorumlu:'EMP-005' },
  { kod:'ALT-009', ustGorev:'GRV-2026-105', baslik:'Test hesabı bekleniyor', tamam:false, sorumlu:'EMP-005' }
];

/* ---- Kontrol listesi maddeleri (PROMPT.md §12 — "Kontrol listesi") ------
   §12'nin görev kartında **"Kontrol listesi"** ve **"Alt görevler"** AYRI iki
   alandır; bu yüzden ayrı koleksiyondur, `DB.subtasks`'ın kopyası değildir:

     alt görev (`DB.subtasks`)   → atanabilir İŞ. Sorumlusu vardır, kendi
                                   kodu vardır, iş yüküne girer.
     kontrol maddesi (burası)    → görevin KABUL koşulu. Sorumlusu yoktur;
                                   `kontrolEden` görevi onaylamadan önce tek
                                   tek işaretler. İş yükü doğurmaz.

   `madde` metni görevin kendi `kabulKriteri` alanından türetilmiştir —
   uydurulmamıştır (L-13). `tamam` değerleri görevin `durum`/`ilerleme`
   alanıyla çelişmez: Tamamlandı ve kontrol/onay bekleyen görevlerde maddeler
   işaretli, havuzdaki görevlerde işaretsizdir.
   İlerleme yüzdesi YAZILMAZ, maddelerden türetilir (L-08). */
DB.checklists = [
  /* GRV-2026-101 · Devam ediyor · %70 — kabul: iOS 16/17/18 + temiz log */
  { kod:'KNT-001', gorev:'GRV-2026-101', sira:1, madde:'iOS 16 cihazda PDF indiriliyor', tamam:true },
  { kod:'KNT-002', gorev:'GRV-2026-101', sira:2, madde:'iOS 17 cihazda PDF indiriliyor', tamam:true },
  { kod:'KNT-003', gorev:'GRV-2026-101', sira:3, madde:'iOS 18 cihazda PDF indiriliyor', tamam:false },
  { kod:'KNT-004', gorev:'GRV-2026-101', sira:4, madde:'Hata log kaydı temiz', tamam:false },
  /* GRV-2026-102 · Kontrol bekliyor · %100 — kabul: Apple ölçüsünde 8 görsel */
  { kod:'KNT-005', gorev:'GRV-2026-102', sira:1, madde:'6.7" ekran görüntüleri Apple ölçüsünde', tamam:true },
  { kod:'KNT-006', gorev:'GRV-2026-102', sira:2, madde:'6.1" ekran görüntüleri Apple ölçüsünde', tamam:true },
  { kod:'KNT-007', gorev:'GRV-2026-102', sira:3, madde:'TR yayın notu yazıldı', tamam:true },
  { kod:'KNT-008', gorev:'GRV-2026-102', sira:4, madde:'EN yayın notu yazıldı', tamam:true },
  /* GRV-2026-103 · Devam ediyor · %55 — kabul: doğruluk ≥ %85, rapor PDF */
  { kod:'KNT-009', gorev:'GRV-2026-103', sira:1, madde:'Test kümesi ayrıldı ve donduruldu', tamam:true },
  { kod:'KNT-010', gorev:'GRV-2026-103', sira:2, madde:'Doğruluk ≥ %85 ölçüldü', tamam:true },
  { kod:'KNT-011', gorev:'GRV-2026-103', sira:3, madde:'Karışıklık matrisi rapora eklendi', tamam:false },
  { kod:'KNT-012', gorev:'GRV-2026-103', sira:4, madde:'Rapor PDF olarak dışa aktarıldı', tamam:false },
  /* GRV-2026-104 · Devam ediyor · %40 — kabul: 1000 kayıtta 300 ms altı render */
  { kod:'KNT-013', gorev:'GRV-2026-104', sira:1, madde:'Filtre ve sayfalama çalışıyor', tamam:true },
  { kod:'KNT-014', gorev:'GRV-2026-104', sira:2, madde:'Skor bazlı sıralama çalışıyor', tamam:false },
  { kod:'KNT-015', gorev:'GRV-2026-104', sira:3, madde:'1000 kayıtta render 300 ms altında', tamam:false },
  { kod:'KNT-016', gorev:'GRV-2026-104', sira:4, madde:'Storybook kaydı yazıldı', tamam:false },
  /* GRV-2026-113 · Onay bekliyor — kabul: kritik hata sıfır */
  { kod:'KNT-017', gorev:'GRV-2026-113', sira:1, madde:'Regresyon seti koşuldu', tamam:true },
  { kod:'KNT-018', gorev:'GRV-2026-113', sira:2, madde:'Kritik hata sıfır', tamam:true },
  { kod:'KNT-019', gorev:'GRV-2026-113', sira:3, madde:'Sonuçlar test koşumuna işlendi', tamam:true },
  /* GRV-2026-118 · Tamamlandı — kabul: TR/EN şablonlar test edildi */
  { kod:'KNT-020', gorev:'GRV-2026-118', sira:1, madde:'TR şablonlar test edildi', tamam:true },
  { kod:'KNT-021', gorev:'GRV-2026-118', sira:2, madde:'EN şablonlar test edildi', tamam:true },
  { kod:'KNT-022', gorev:'GRV-2026-118', sira:3, madde:'Bildirim tipleri tercih matrisine eklendi', tamam:true },
  /* GRV-2026-121 · Tamamlandı — kabul: Axe taramasında kritik bulgu sıfır */
  { kod:'KNT-023', gorev:'GRV-2026-121', sira:1, madde:'Klavye ile tüm akış gezilebiliyor', tamam:true },
  { kod:'KNT-024', gorev:'GRV-2026-121', sira:2, madde:'Kontrast AA eşiğini geçiyor', tamam:true },
  { kod:'KNT-025', gorev:'GRV-2026-121', sira:3, madde:'Axe taramasında kritik bulgu sıfır', tamam:true },
  /* GRV-2026-126 · Devam ediyor · %30 — kabul: iOS Safari ve Chrome */
  { kod:'KNT-026', gorev:'GRV-2026-126', sira:1, madde:'Hata iOS Safari üzerinde yeniden üretildi', tamam:true },
  { kod:'KNT-027', gorev:'GRV-2026-126', sira:2, madde:'iOS Safari üzerinde tarih seçici açılıyor', tamam:false },
  { kod:'KNT-028', gorev:'GRV-2026-126', sira:3, madde:'Chrome üzerinde tarih seçici açılıyor', tamam:false },
  { kod:'KNT-029', gorev:'GRV-2026-126', sira:4, madde:'Müşteri doğrulaması alındı', tamam:false }
];

/* ---- Görev bağımlılıkları ---------------------------------------------- */
DB.taskDeps = [
  { gorev:'GRV-2026-102', bagimli:'GRV-2026-101', tur:'Engelliyor' },
  { gorev:'GRV-2026-104', bagimli:'GRV-2026-103', tur:'Bekliyor' },
  { gorev:'GRV-2026-112', bagimli:null, tur:'—' }
];

/* ---- Departmanlar arası iş talepleri (PROMPT.md §13) -------------------- */
DB.deptRequests = [
  { kod:'TLP-2026-041', talepEdenDep:'DEP-02', talepEdilenDep:'DEP-04', talepEden:'EMP-014', sorumlu:'EMP-003',
    tur:'Ön analiz talebi', musteri:null, proje:null, baslik:'Zirve Market POS entegrasyon fizibilitesi',
    aciklama:'Mevcut POS sağlayıcısının API kısıtları değerlendirilsin.', oncelik:'Yüksek',
    termin:'2026-08-04', beklenenCikti:'Yazılı fizibilite notu', kabulKriteri:'Risk ve efor tahmini içermeli',
    durum:'Göreve Dönüştürüldü', onay:'Onaylandı', olusturma:'2026-07-31', tamamlanma:null, aktif:true },
  { kod:'TLP-2026-042', talepEdenDep:'DEP-05', talepEdilenDep:'DEP-06', talepEden:'EMP-003', sorumlu:'EMP-004',
    tur:'Ekran tasarım talebi', musteri:'MUS-2025-005', proje:'PRJ-2026-003',
    baslik:'Rapor merkezi 8 ekran tasarımı', aciklama:'Faz 1 rapor modülü ekranları.', oncelik:'Orta',
    termin:'2026-08-16', beklenenCikti:'Figma dosyası', kabulKriteri:'3 kırılımda tasarım',
    durum:'Gönderildi', onay:'Onaylandı', olusturma:'2026-08-01', tamamlanma:null, aktif:true },
  { kod:'TLP-2026-043', talepEdenDep:'DEP-08', talepEdilenDep:'DEP-11', talepEden:'EMP-005', sorumlu:'EMP-009',
    tur:'Test talebi', musteri:'MUS-2025-005', proje:'PRJ-2026-003',
    baslik:'Faz 1 kabul testi senaryoları', aciklama:'Müşteri kabul testi öncesi senaryo seti.', oncelik:'Orta',
    termin:'2026-08-20', beklenenCikti:'Senaryo dokümanı', kabulKriteri:'Ana akışların tamamı',
    durum:'Gönderildi', onay:'Bekliyor', olusturma:'2026-08-02', tamamlanma:null, aktif:true },
  { kod:'TLP-2026-044', talepEdenDep:'DEP-13', talepEdilenDep:'DEP-07', talepEden:'EMP-013', sorumlu:'EMP-006',
    tur:'Hata çözüm talebi', musteri:'MUS-2026-010', proje:'PRJ-2026-006',
    baslik:'Randevu formunda tarih seçici mobilde açılmıyor', aciklama:'Müşteri destek kaydından geldi.',
    oncelik:'Kritik', termin:'2026-08-05', beklenenCikti:'Düzeltme', kabulKriteri:'iOS ve Android doğrulama',
    durum:'Göreve Dönüştürüldü', onay:'Onaylandı', olusturma:'2026-07-30', tamamlanma:null, aktif:true },
  { kod:'TLP-2026-045', talepEdenDep:'DEP-07', talepEdilenDep:'DEP-16', talepEden:'EMP-006', sorumlu:'EMP-012',
    tur:'Ekipman talebi', musteri:null, proje:null, baslik:'Test için ikinci monitör',
    aciklama:'Çift ekran çalışma ihtiyacı.', oncelik:'Düşük', termin:'2026-08-22',
    beklenenCikti:'Zimmetli monitör', kabulKriteri:'27 inç, USB-C',
    durum:'Gönderildi', onay:'Bekliyor', olusturma:'2026-07-29', tamamlanma:null, aktif:true },
  { kod:'TLP-2026-040', talepEdenDep:'DEP-15', talepEdilenDep:'DEP-02', talepEden:'EMP-012', sorumlu:'EMP-002',
    tur:'Eksik bilgi talebi', musteri:'MUS-2025-003', proje:null,
    baslik:'Anadolu Perakende fatura adresi güncellenmeli', aciklama:'e-Fatura reddedildi.',
    oncelik:'Yüksek', termin:'2026-07-28', beklenenCikti:'Güncel adres', kabulKriteri:'Yazılı teyit',
    durum:'Kabul', onay:'Onaylandı', olusturma:'2026-07-24', tamamlanma:'2026-07-27', aktif:true }
];

/* ---- Hatalar ----------------------------------------------------------- */
/* BAĞ ALANLARI (lessons L-13 — bağ tahmin edilmez, burada YAZILIDIR):
   `gorev`  = hatayı düzelten görev. **Hata ↔ görev bağının tek yönü budur**;
              `DB.tasks[].hata` diye bir ayna alan YOKTUR (iki yönlü bağ ayrışır).
              Bağ yazılıysa görevin `etki` değeri şiddet eşlemesine uyar:
              şiddet 'Kritik' → etki 'Çok yüksek', diğer üçü birebir (components.md §9).
   `test`   = hatayı ortaya çıkaran test koşumu. Bir hata **en fazla bir** koşuma bağlanır.
              null = hata bir koşumdan değil, başka bir kanaldan (destek, kullanıcı) geldi.
   `destek` = hatayı doğuran destek talebi (DST-*). PROMPT.md §18 destek → hata dönüşümü.
   `sprint` = hatanın **ele alındığı** sprint (açıldığı değil). Kapanmış hatada düzeltmenin
              yapıldığı sprint, açık hatada içinde bulunulan sprint. */
DB.bugs = [
  { kod:'HTA-2026-071', proje:'PRJ-2026-001', baslik:'iOS PDF indirme sessizce başarısız', modul:'MOD-002',
    siddet:'Kritik', oncelik:'Kritik', durum:'Devam ediyor', bulan:'EMP-009', sorumlu:'EMP-008',
    bulunma:'2026-07-30', cozum:null, ortam:'iOS 17.4', tekrarlanabilir:'Her zaman', gorev:'GRV-2026-101',
    test:'TST-2026-018', sprint:'SPR-2026-018', destek:null, aktif:true },
  { kod:'HTA-2026-072', proje:'PRJ-2026-001', baslik:'Randevu listesi 50+ kayıtta yavaşlıyor', modul:'MOD-001',
    siddet:'Orta', oncelik:'Orta', durum:'Yeni', bulan:'EMP-009', sorumlu:'EMP-008',
    bulunma:'2026-07-30', cozum:null, ortam:'Android 14', tekrarlanabilir:'Bazen', gorev:null,
    test:'TST-2026-018', sprint:'SPR-2026-018', destek:null, aktif:true },
  { kod:'HTA-2026-073', proje:'PRJ-2026-001', baslik:'Bildirim zamanı yanlış saat diliminde', modul:'MOD-003',
    siddet:'Yüksek', oncelik:'Yüksek', durum:'Yeni', bulan:'EMP-009', sorumlu:'EMP-005',
    bulunma:'2026-07-31', cozum:null, ortam:'Tümü', tekrarlanabilir:'Her zaman', gorev:null,
    test:'TST-2026-018', sprint:'SPR-2026-018', destek:null, aktif:true },
  { kod:'HTA-2026-074', proje:'PRJ-2026-006', baslik:'Tarih seçici mobilde açılmıyor', modul:'MOD-015',
    siddet:'Kritik', oncelik:'Kritik', durum:'Devam ediyor', bulan:'EMP-013', sorumlu:'EMP-006',
    bulunma:'2026-07-30', cozum:null, ortam:'Safari iOS', tekrarlanabilir:'Her zaman', gorev:'GRV-2026-126',
    test:null, sprint:'SPR-2026-023', destek:'DST-2026-118', aktif:true },
  { kod:'HTA-2026-075', proje:'PRJ-2026-003', baslik:'İş emri filtresi tarih aralığını yok sayıyor', modul:'MOD-010',
    siddet:'Orta', oncelik:'Orta', durum:'Kapandı', bulan:'EMP-009', sorumlu:'EMP-006',
    bulunma:'2026-07-18', cozum:'2026-07-24', ortam:'Web', tekrarlanabilir:'Her zaman', gorev:null,
    test:null, sprint:'SPR-2026-020', destek:'DST-2026-122', aktif:true },
  { kod:'HTA-2026-076', proje:'PRJ-2026-005', baslik:'Takvimde geçmiş tarihler seçilebiliyor', modul:'MOD-013',
    siddet:'Düşük', oncelik:'Düşük', durum:'Yeni', bulan:'EMP-016', sorumlu:'EMP-006',
    bulunma:'2026-08-01', cozum:null, ortam:'Web', tekrarlanabilir:'Her zaman', gorev:null,
    test:null, sprint:'SPR-2026-022', destek:null, aktif:true }
];

/* ---- Testler ----------------------------------------------------------- */
/* KAPSAM ALANLARI (lessons L-13):
   `moduller` = koşumun kapsadığı proje modülleri (**dizi** — bir koşum birden çok modülü
                tarayabilir). Boş dizi = projenin modül kırılımı veride yok, kapsam proje ekseninde.
   `sprint`   = koşumun düştüğü sprint. null = koşum tarihi hiçbir sprint aralığına girmiyor
                (veride o dönemin sprinti yok) — tarih yakınlığıyla UYDURULMAZ.
   `basarisiz` ile bağlı hata sayısı **eşit olmak zorunda değildir**: her düşen senaryo
   ayrı bir hata kaydı doğurmaz. Kural yalnız şudur: bağlı hata sayısı ≤ `basarisiz`.

   SENARYO SAYIM EKSENİ (5 koşumun 5'inde ölçüldü, durumdan bağımsız):
   `basarili + basarisiz = senaryo` — HER durumda geçerlidir, yalnız `Tamamlandı`da değil.
   `Planlandı` koşumda üçü de 0'dır (henüz senaryo yazılmamıştır), `Devam ediyor` koşumda
   koşulmuş senaryolar sayılır ve toplam o ana kadarki senaryo sayısıdır.
   `app-proje-test-detay.html` bu eşitliği her kayıtta "Sayım tutmuyor" rozetiyle denetler;
   form ekranı da aynı kuralı uygular — iki ekran ayrışmaz. */
DB.tests = [
  { kod:'TST-2026-018', proje:'PRJ-2026-001', ad:'Mobil regresyon — Sprint 18', tur:'Regresyon', senaryo:62,
    basarili:59, basarisiz:3, sorumlu:'EMP-009', tarih:'2026-07-31', durum:'Tamamlandı',
    moduller:['MOD-001','MOD-002','MOD-003'], sprint:'SPR-2026-018', senaryoDetayi:false, aktif:true },
  { kod:'TST-2026-019', proje:'PRJ-2026-003', ad:'İş emri modülü fonksiyonel test', tur:'Fonksiyonel', senaryo:44,
    basarili:42, basarisiz:2, sorumlu:'EMP-009', tarih:'2026-07-28', durum:'Tamamlandı',
    moduller:['MOD-010'], sprint:'SPR-2026-020', senaryoDetayi:false, aktif:true },
  { kod:'TST-2026-020', proje:'PRJ-2026-002', ad:'Skorlama API yük testi', tur:'Performans', senaryo:12,
    basarili:12, basarisiz:0, sorumlu:'EMP-010', tarih:'2026-07-26', durum:'Tamamlandı',
    moduller:['MOD-006'], sprint:null, senaryoDetayi:false, aktif:true },
  { kod:'TST-2026-021', proje:'PRJ-2026-005', ad:'Rezervasyon akışı duman testi', tur:'Duman', senaryo:18,
    basarili:15, basarisiz:3, sorumlu:'EMP-009', tarih:'2026-08-01', durum:'Devam ediyor',
    moduller:['MOD-013'], sprint:'SPR-2026-022', senaryoDetayi:false, aktif:true },
  { kod:'TST-2026-022', proje:'PRJ-2026-003', ad:'Faz 1 kabul testi', tur:'Kabul', senaryo:0,
    basarili:0, basarisiz:0, sorumlu:'EMP-009', tarih:'2026-08-20', durum:'Planlandı',
    moduller:['MOD-009','MOD-010','MOD-011'], sprint:null, senaryoDetayi:false, aktif:true }
];

/* =====================================================================
   TEST VARLIK MODELİ — şartname [9.1.1] · paket P3-03
   ---------------------------------------------------------------------
   ÖLÇÜLEN DURUM: test tarafı tümüyle SAYAÇTI. `DB.tests` senaryoyu üç sayı
   olarak tutuyordu (`senaryo`/`basarili`/`basarisiz`) ve ekran bunu itiraf
   ediyordu: "başarısız senaryoların hangileri olduğu bu ekrandan okunamaz."
   Sayı bir raporun sonucudur, kaydın kendisi değil.

   ⚠️ ESKİ BEŞ KOŞUM İÇİN SENARYO ÜRETİLMEDİ (ders L-13).
   TST-2026-018 "62 senaryo, 3 başarısız" diyor ama HANGİ üçü olduğu veride
   YOK. 62 senaryo adı uydurmak, olmayan bir bilgiyi varmış gibi göstermek
   olurdu. Bu yüzden o beş kayıt `senaryoDetayi:false` ile işaretlendi:
   sayaçları KORUNUR ve ekranda "bu koşumun senaryo dökümü yok" denir.
   Yeni model yalnız `senaryoDetayi:true` olan koşumlarda sayaç TÜRETİR.

   Yani bu paket modeli kurar ve İLERİYE dönük doğru çalıştırır; geçmişi
   yeniden yazmaz. Kısmi tamamlanma açıkça kısmi yazılır ([22.0.11]).
   ===================================================================== */

/* [9.2.4] · [16.2.10] — Build/Release ve Ortam: hata ve test koşumu "hangi
   sürümde, nerede" sorusuna cevap veremiyordu; ikisi de kavram olarak YOKTU. */
DB.environments = [
  { kod:'ENV-DEV',   ad:'Geliştirme',   tur:'Geliştirme', url:'dev.vitalis-app.com',  aktif:true },
  { kod:'ENV-TEST',  ad:'Test',         tur:'Test',       url:'test.vitalis-app.com', aktif:true },
  { kod:'ENV-STAGE', ad:'Ön Yayın',     tur:'Ön Yayın',   url:'stage.anka-fin.com',   aktif:true },
  { kod:'ENV-PROD',  ad:'Canlı',        tur:'Canlı',      url:'app.vitalis.com.tr',   aktif:true }
];

DB.builds = [
  { kod:'BLD-2026-041', proje:'PRJ-2026-001', surum:'1.8.0-rc2', ortam:'ENV-TEST',
    tarih:'2026-07-31', commit:'a3f9c21', sorumlu:'EMP-005', durum:'Test edildi', aktif:true },
  { kod:'BLD-2026-042', proje:'PRJ-2026-001', surum:'1.8.0-rc3', ortam:'ENV-TEST',
    tarih:'2026-08-02', commit:'b71d004', sorumlu:'EMP-005', durum:'Test ediliyor', aktif:true },
  { kod:'BLD-2026-043', proje:'PRJ-2026-002', surum:'0.9.4',     ortam:'ENV-STAGE',
    tarih:'2026-08-01', commit:'c02e5aa', sorumlu:'EMP-010', durum:'Test edildi', aktif:true }
];

/* [9.1.1] — Test Planı. Koşumlar bir plana bağlanır; plan kapsamı ve çıkış
   ölçütünü taşır. Plansız koşum da olabilir (`plan:null`) — mevcut beş kayıt
   öyle doğdu ve bu geriye dönük zorlanmadı. */
DB.testPlans = [
  { kod:'TPL-2026-004', proje:'PRJ-2026-001', ad:'Sprint 18 regresyon planı',
    kapsam:['MOD-001','MOD-002','MOD-003'], sorumlu:'EMP-009',
    baslangic:'2026-07-29', bitis:'2026-08-05',
    cikisOlcutu:'Kritik ve yüksek şiddetli hata kalmayacak', durum:'Aktif', aktif:true }
];

/* Test Senaryosu — koşumdan BAĞIMSIZ tanımdır: aynı senaryo birden çok
   koşumda çalıştırılır. Sonuç senaryoda değil KOŞUMDA (`testResults`) tutulur;
   yoksa "geçen sefer geçmişti" bilgisi kaybolurdu. */
DB.testCases = [
  { kod:'TC-001', plan:'TPL-2026-004', proje:'PRJ-2026-001', modul:'MOD-001',
    ad:'Randevu oluşturma — uygun slot', oncelik:'Yüksek', tur:'Fonksiyonel',
    onKosul:'Hasta girişi yapılmış, hekimin boş slotu var', aktif:true },
  { kod:'TC-002', plan:'TPL-2026-004', proje:'PRJ-2026-001', modul:'MOD-001',
    ad:'Randevu oluşturma — dolu slot reddi', oncelik:'Yüksek', tur:'Fonksiyonel',
    onKosul:'Seçilen slot başka hastaya ayrılmış', aktif:true },
  { kod:'TC-003', plan:'TPL-2026-004', proje:'PRJ-2026-001', modul:'MOD-002',
    ad:'Randevu iptali — 24 saat kuralı', oncelik:'Orta', tur:'Fonksiyonel',
    onKosul:'Randevuya 24 saatten az kalmış', aktif:true },
  { kod:'TC-004', plan:'TPL-2026-004', proje:'PRJ-2026-001', modul:'MOD-003',
    ad:'Bildirim — randevu hatırlatması', oncelik:'Orta', tur:'Entegrasyon',
    onKosul:'Firebase Push yapılandırılmış', aktif:true },
  { kod:'TC-005', plan:'TPL-2026-004', proje:'PRJ-2026-001', modul:'MOD-002',
    ad:'Çevrimdışı kuyruk — bağlantı geri gelince gönderim', oncelik:'Yüksek', tur:'Dayanıklılık',
    onKosul:'Uygulama çevrimdışı moda alınmış', aktif:true }
];

/* Test Adımı — senaryonun içi. Beklenen sonuç ADIMDA yazılır: "beklenen"i
   koşum anında yazmak, sonucu gördükten sonra beklentiyi uydurmak olurdu. */
DB.testSteps = [
  { kod:'TS-001', senaryo:'TC-001', sira:1, adim:'Hekim ve tarih seç', beklenen:'Boş slotlar listelenir' },
  { kod:'TS-002', senaryo:'TC-001', sira:2, adim:'Uygun slotu seç ve onayla', beklenen:'Randevu oluşur, özet ekranı açılır' },
  { kod:'TS-003', senaryo:'TC-002', sira:1, adim:'Dolu bir slotu seçmeyi dene', beklenen:'Slot seçilemez, uyarı görünür' },
  { kod:'TS-004', senaryo:'TC-003', sira:1, adim:'24 saatten yakın randevuda iptali dene', beklenen:'İptal reddedilir, gerekçe yazılır' },
  { kod:'TS-005', senaryo:'TC-004', sira:1, adim:'Randevudan 24 saat önceyi simüle et', beklenen:'Push bildirimi düşer' },
  { kod:'TS-006', senaryo:'TC-005', sira:1, adim:'Çevrimdışı modda randevu oluştur', beklenen:'Kuyruğa alınır, kullanıcıya bildirilir' },
  { kod:'TS-007', senaryo:'TC-005', sira:2, adim:'Bağlantıyı geri aç', beklenen:'Kuyruk gönderilir, çakışma varsa uyarı' }
];

/* Test Koşumu — "hangi senaryo kümesi, hangi build, hangi ortamda". */
DB.testRuns = [
  { kod:'TR-2026-011', test:'TST-2026-018', plan:'TPL-2026-004', proje:'PRJ-2026-001',
    build:'BLD-2026-042', ortam:'ENV-TEST', sorumlu:'EMP-009',
    baslangic:'2026-08-02', bitis:'2026-08-02', durum:'Tamamlandı', aktif:true }
];

/* Sonuç — TEK kanonik yer. `DB.testResults` sözlüğü (Başarılı · Başarısız ·
   Engellendi · Koşulmadı) şartnameye bu turdan önce hizalanmıştı ama HİÇBİR
   ekranda kullanılmıyordu; artık bu koleksiyon onu kullanıyor.
   [9.1.4] — Başarısız sonuç hatayla bağlanır; bağ SONUÇTA tutulur. */
DB.testCaseResults = [
  { kod:'TCR-001', kosum:'TR-2026-011', senaryo:'TC-001', sonuc:'Başarılı',
    kosan:'EMP-009', tarih:'2026-08-02T10:15', not:null, hata:null, kanit:null },
  { kod:'TCR-002', kosum:'TR-2026-011', senaryo:'TC-002', sonuc:'Başarılı',
    kosan:'EMP-009', tarih:'2026-08-02T10:22', not:null, hata:null, kanit:null },
  { kod:'TCR-003', kosum:'TR-2026-011', senaryo:'TC-003', sonuc:'Başarısız',
    kosan:'EMP-009', tarih:'2026-08-02T10:40',
    not:'24 saat kuralı uygulanmıyor; iptal kabul edildi', hata:'HTA-2026-071', kanit:'KNT-001' },
  { kod:'TCR-004', kosum:'TR-2026-011', senaryo:'TC-004', sonuc:'Engellendi',
    kosan:'EMP-009', tarih:'2026-08-02T10:52',
    not:'Test ortamında Firebase anahtarı yok', hata:null, kanit:null },
  { kod:'TCR-005', kosum:'TR-2026-011', senaryo:'TC-005', sonuc:'Koşulmadı',
    kosan:null, tarih:null, not:'Süre yetmedi, sonraki koşuma bırakıldı', hata:null, kanit:null }
];

/* Kanıt — ekran görüntüsü / log. Dosya YÜKLENMİYOR (prototipte dosya
   depolama yok); kayıt dosyanın ADINI ve türünü tutar, bu açıkça yazılıdır. */
DB.testEvidence = [
  { kod:'KNT-001', sonuc:'TCR-003', tur:'Ekran görüntüsü',
    ad:'iptal-24saat-hata.png', not:'İptal onay ekranı — uyarı çıkmadı', tarih:'2026-08-02T10:41' }
];


/* ---- Teslimler --------------------------------------------------------- */
/* `milestone` = teslimin karşılık geldiği ödeme planı taksiti (tekil bağ, lessons L-13).
   Türetme/tarih yakınlığı ile TAHMİN EDİLMEZ, burada yazılıdır.
   `musteriOnay` durum değeridir: 'Onaylandı' | 'Bekliyor' | 'Revizyon istendi'.
   Sentinel '—' kullanılmaz.
   `moduller` = teslimin kapsadığı proje modülleri (**dizi**). Boş dizi = projenin modül
   kırılımı veride yok (PRJ-2026-004), teslim proje ekseninde okunur.
   `test` = teslimi kabule bağlayan test koşumu; null = teslim bir kabul koşumuna bağlı değil. */
DB.deliveries = [
  { kod:'TSL-2026-031', proje:'PRJ-2026-001', milestone:'MS-001', ad:'Beta sürüm (v0.9)', tarih:'2026-07-10', durum:'Kabul',
    teslimEden:'EMP-003', musteriOnay:'Onaylandı', onayTarihi:'2026-07-14', not:'Test cihazlarına dağıtıldı',
    moduller:['MOD-001','MOD-002','MOD-003'], test:null, aktif:true },
  { kod:'TSL-2026-032', proje:'PRJ-2026-004', milestone:'MS-009', ad:'Üretim takip v1.0 canlı', tarih:'2026-07-22', durum:'Kabul',
    teslimEden:'EMP-003', musteriOnay:'Onaylandı', onayTarihi:'2026-07-25', not:'Sorunsuz geçiş',
    moduller:[], test:null, aktif:true },
  { kod:'TSL-2026-033', proje:'PRJ-2026-002', milestone:'MS-003', ad:'POC sonuç paketi', tarih:'2026-07-25', durum:'Kabul',
    teslimEden:'EMP-007', musteriOnay:'Onaylandı', onayTarihi:'2026-07-29', not:'Doğruluk %87',
    moduller:['MOD-005','MOD-006'], test:null, aktif:true },
  { kod:'TSL-2026-034', proje:'PRJ-2026-003', milestone:'MS-005', ad:'Faz 1 modül paketi', tarih:'2026-08-29', durum:'Taslak',
    teslimEden:'EMP-003', musteriOnay:'Bekliyor', onayTarihi:null, not:'Kabul testi sonrası',
    moduller:['MOD-009','MOD-010','MOD-011'], test:'TST-2026-022', aktif:true },
  { kod:'TSL-2026-035', proje:'PRJ-2026-006', milestone:'MS-008', ad:'Randevu sistemi canlı', tarih:'2026-06-26', durum:'Müşteriye Gönderildi',
    teslimEden:'EMP-003', musteriOnay:'Bekliyor', onayTarihi:null, not:'Revizyon turu devam ediyor',
    moduller:['MOD-015'], test:null, aktif:true }
];

/* ---- Değişiklik talepleri ---------------------------------------------- */
/* EKSEN UYARISI:
   `etkiSure` **SAAT**tir, gün değil (`app-proje-degisiklik.html` `F.hours` ile basar,
   filtresi "8 saatten fazla" der). Gün karşılığı gösterilecekse **türetilmiş** olduğu
   yazılır — dönüşüm 8 sa/gün varsayımıdır, veride yazılı değil.
   `etkiMaliyet` **NET** (KDV hariç), müşteriye yansıyan bedel — sözleşme netiyle
   (`contracts.tutar`) aynı eksende. `projects.butce` / `.gerceklesenMaliyet` **iç maliyet**
   eksenidir, bu alanla aynı satırda toplanmaz.
   `etki` diye bir alan **YOKTUR** — etki düzeyi süre/bedel sapmasından hesaplanır.
   AD ÇAKIŞMASI UYARISI: `talep` bu koleksiyonda **talebi açan taraf**tır
   ('Müşteri' | 'İç ekip'), destek talebi kodu DEĞİLDİR. Destek talebi bağı için
   projenin her yerinde olduğu gibi **`destek`** alanı kullanılır (DST-*).
   `destek` null = değişiklik talebi bir destek talebinden doğmadı. */
DB.changeRequests = [
  { kod:'DGS-2026-012', proje:'PRJ-2026-006', baslik:'Randevu adımlarının sırası değiştirilsin',
    talep:'Müşteri', tarih:'2026-07-25', etkiSure:12, etkiMaliyet:38000, durum:'İç Onay',
    kapsamIci:false, karar:'Ek teklif gerekiyor', sorumlu:'EMP-003', destek:null, aktif:true },
  { kod:'DGS-2026-013', proje:'PRJ-2026-003', baslik:'Rapor merkezine 3 yeni rapor eklensin',
    talep:'Müşteri', tarih:'2026-07-18', etkiSure:60, etkiMaliyet:145000, durum:'Onaylandı',
    kapsamIci:false, karar:'Faz 2 kapsamına alındı', sorumlu:'EMP-003', destek:null, aktif:true },
  { kod:'DGS-2026-014', proje:'PRJ-2026-001', baslik:'Bildirim sesleri özelleştirilsin',
    talep:'Müşteri', tarih:'2026-07-12', etkiSure:6, etkiMaliyet:0, durum:'Reddedildi',
    kapsamIci:false, karar:'Store yayını sonrası değerlendirilecek', sorumlu:'EMP-003', destek:null, aktif:true },
  { kod:'DGS-2026-015', proje:'PRJ-2026-005', baslik:'Ödeme sağlayıcı iyzico yerine PayTR olsun',
    talep:'Müşteri', tarih:'2026-07-28', etkiSure:16, etkiMaliyet:22000, durum:'Etki Analizi',
    kapsamIci:false, karar:'—', sorumlu:'EMP-003', destek:null, aktif:true },
  /* Destek talebinden doğan değişiklik talebi (§18 · §22 madde 17).
     DST-2026-120 kapsam dışı ve ücretli bir "Geliştirme talebi"ydi; değerlendirme
     ek teklif yoluna girdi. `etkiMaliyet` NET eksende (KDV hariç). */
  { kod:'DGS-2026-016', proje:'PRJ-2025-008', baslik:'Sevkiyat raporuna araç filtresi eklensin',
    talep:'Müşteri', tarih:'2026-07-30', etkiSure:10, etkiMaliyet:18000, durum:'İç Onay',
    kapsamIci:false, karar:'Ek teklif gerekiyor', sorumlu:'EMP-003', destek:'DST-2026-120', aktif:true }
];

/* ---- Onay kuyruğu (tüm modüllerden) ------------------------------------ */
DB.approvals = [
  { kod:'ONY-2026-051', tur:'Satın alma talebi', kayit:'SAT-2026-014', baslik:'2 adet geliştirici dizüstü bilgisayar',
    talepEden:'EMP-010', onaylayan:'EMP-001', tutar:186000, tarih:'2026-07-30', durum:'Bekliyor',
    aciliyet:'Yüksek', link:'app-satinalma.html?ac=SAT-2026-014' },
  { kod:'ONY-2026-052', tur:'İzin talebi', kayit:'IZN-2026-038', baslik:'Yıllık izin — 10-14 Ağustos',
    talepEden:'EMP-006', onaylayan:'EMP-003', tutar:null, tarih:'2026-07-31', durum:'Bekliyor',
    aciliyet:'Orta', link:'app-izin-detay.html?id=IZN-2026-038' },
  { kod:'ONY-2026-053', tur:'Teklif iç onayı', kayit:'TKL-2026-013', baslik:'Poyraz İnşaat ERP teklifi',
    talepEden:'EMP-002', onaylayan:'EMP-001', tutar:734400, tarih:'2026-07-30', durum:'Bekliyor',
    aciliyet:'Yüksek', link:'app-teklif-detay.html?id=TKL-2026-013' },
  { kod:'ONY-2026-054', tur:'Görev onayı', kayit:'GRV-2026-113', baslik:'Vitalis regresyon test raporu',
    talepEden:'EMP-009', onaylayan:'EMP-003', tutar:null, tarih:'2026-08-02', durum:'Bekliyor',
    aciliyet:'Yüksek', link:'app-gorev-detay.html?id=GRV-2026-113' },
  { kod:'ONY-2026-055', tur:'Değişiklik talebi', kayit:'DGS-2026-012', baslik:'Trakya randevu adım sırası',
    talepEden:'EMP-003', onaylayan:'EMP-001', tutar:38000, tarih:'2026-07-26', durum:'Bekliyor',
    aciliyet:'Kritik', link:'app-proje-degisiklik.html?id=DGS-2026-012' },
  { kod:'ONY-2026-056', tur:'Ön analiz onayı', kayit:'ANL-2026-001', baslik:'Poyraz İnşaat ön analizi',
    talepEden:'EMP-003', onaylayan:'EMP-001', tutar:null, tarih:'2026-07-21', durum:'Bekliyor',
    aciliyet:'Orta', link:'app-onanaliz-detay.html?id=ANL-2026-001' },
  { kod:'ONY-2026-057', tur:'Komisyon kazancı', kayit:'KOM-2026-003', baslik:'Murat Sezer — Marmara Enerji komisyonu',
    talepEden:'EMP-012', onaylayan:'EMP-001', tutar:47600, tarih:'2026-07-09', durum:'Bekliyor',
    aciliyet:'Orta', link:'app-komisyon-detay.html?id=KOM-2026-003' },
  { kod:'ONY-2026-058', tur:'Timesheet onayı', kayit:'TSH-2026-030', baslik:'30. hafta zaman kayıtları — 6 personel',
    talepEden:'EMP-011', onaylayan:'EMP-003', tutar:null, tarih:'2026-08-01', durum:'Bekliyor',
    aciliyet:'Orta', link:'app-zaman-onay.html' },
  { kod:'ONY-2026-059', tur:'Satın alma talebi', kayit:'SAT-2026-015', baslik:'Figma yıllık lisans yenileme',
    talepEden:'EMP-004', onaylayan:'EMP-012', tutar:42000, tarih:'2026-08-01', durum:'Bekliyor',
    aciliyet:'Orta', link:'app-satinalma.html?ac=SAT-2026-015' },
  { kod:'ONY-2026-060', tur:'İzin talebi', kayit:'IZN-2026-039', baslik:'Mazeret izni — 5 Ağustos',
    talepEden:'EMP-016', onaylayan:'EMP-006', tutar:null, tarih:'2026-08-02', durum:'Bekliyor',
    aciliyet:'Düşük', link:'app-izin-detay.html?id=IZN-2026-039' },
  { kod:'ONY-2026-048', tur:'Satın alma talebi', kayit:'SAT-2026-012', baslik:'Ofis sandalyesi 3 adet',
    talepEden:'EMP-011', onaylayan:'EMP-001', tutar:28500, tarih:'2026-07-14', durum:'Onaylandı',
    aciliyet:'Düşük', link:'app-satinalma.html?ac=SAT-2026-012' },
  { kod:'ONY-2026-049', tur:'İzin talebi', kayit:'IZN-2026-035', baslik:'Yıllık izin — 20-24 Temmuz',
    talepEden:'EMP-009', onaylayan:'EMP-003', tutar:null, tarih:'2026-07-10', durum:'Onaylandı',
    aciliyet:'Orta', link:'app-izin-detay.html?id=IZN-2026-035' }
];

/* ---- Aktivite kayıtları (log — eski/yeni değer) ------------------------ */
DB.activities = [
  /* REVİZE 11 — proje kaynağı alanı açıldı (2026-08-07). Sözleşme kaydıyla
     doğrudan kanıtlanan 6 projeye satır yazılmadı (bağ zaten `DB.contracts`'te
     görünür); kaynağı TÜRETİLEN 8 kayda gerekçesi yazıldı. */
  { kayit:'PRJ-2026-007', tarih:'2026-08-03T10:00', kisi:'EMP-001', metin:'Proje kaynağı belirlendi — sözleşme kaydı yok, bedel TKL-2026-008 teklifinin toplamıyla birebir aynı', eski:null, yeni:'Satış Öncesi / PoC', tone:'info', icon:'i-briefcase' },
  { kayit:'PRJ-2026-008', tarih:'2026-08-03T10:00', kisi:'EMP-001', metin:'Proje kaynağı belirlendi — kaydın adı pilot çalışma diyor, sözleşmesi ve teklifi yok; müşteri asıl projeyi (PRJ-2026-002) sonradan imzaladı', eski:null, yeni:'Satış Öncesi / PoC', tone:'info', icon:'i-briefcase' },
  { kayit:'PRJ-2025-008', tarih:'2026-08-03T10:00', kisi:'EMP-001', metin:'Proje kaynağı belirlendi — müşteriye teslim edilip kapanmış iş; sözleşme kaydı bu depoda yok, uydurulmadı', eski:null, yeni:'Müşteri Sözleşmesi', tone:'info', icon:'i-briefcase' },
  { kayit:'PRJ-2024-011', tarih:'2026-08-03T10:00', kisi:'EMP-001', metin:'Proje kaynağı belirlendi — müşteriye teslim edilip kapanmış iş; sözleşme kaydı bu depoda yok, uydurulmadı', eski:null, yeni:'Müşteri Sözleşmesi', tone:'info', icon:'i-briefcase' },
  { kayit:'PRJ-2025-009', tarih:'2026-08-03T10:00', kisi:'EMP-001', metin:'Proje kaynağı belirlendi — müşteriye teslim edilip kapanmış iş; sözleşme kaydı bu depoda yok, uydurulmadı', eski:null, yeni:'Müşteri Sözleşmesi', tone:'info', icon:'i-briefcase' },
  { kayit:'PRJ-2025-010', tarih:'2026-08-03T10:00', kisi:'EMP-001', metin:'Proje kaynağı belirlendi — müşteriye teslim edilip kapanmış iş; sözleşme kaydı bu depoda yok, uydurulmadı', eski:null, yeni:'Müşteri Sözleşmesi', tone:'info', icon:'i-briefcase' },
  { kayit:'PRJ-2025-012', tarih:'2026-08-03T10:00', kisi:'EMP-001', metin:'Proje kaynağı belirlendi — müşteriye teslim edilip kapanmış iş; sözleşme kaydı bu depoda yok, uydurulmadı', eski:null, yeni:'Müşteri Sözleşmesi', tone:'info', icon:'i-briefcase' },
  { kayit:'PRJ-2023-014', tarih:'2026-08-03T10:00', kisi:'EMP-001', metin:'Proje kaynağı belirlendi — müşteriye teslim edilip kapanmış iş; sözleşme kaydı bu depoda yok, uydurulmadı', eski:null, yeni:'Müşteri Sözleşmesi', tone:'info', icon:'i-briefcase' },
  /* REVİZE 01 — durum sözlüğü 19'dan 10'a indi (2026-08-07).
     Dört kaydın durumu taşındı; taşıma bir işlemdir, sessizce yapılmaz. */
  { kayit:'GRV-2026-102', tarih:'2026-08-03T09:00', kisi:'EMP-001', metin:'Durum sözlüğü sadeleştirildi — durum karşılığına taşındı', eski:'Kontrol bekliyor', yeni:'Kontrolde', tone:'info', icon:'i-refresh' },
  { kayit:'GRV-2026-107', tarih:'2026-08-03T09:00', kisi:'EMP-001', metin:'Durum sözlüğü sadeleştirildi — "Revize bekliyor" ile "Revizede" tek durumda birleşti', eski:'Revize bekliyor', yeni:'Revizede', tone:'info', icon:'i-refresh' },
  { kayit:'GRV-2026-107', tarih:'2026-08-03T09:01', kisi:'EMP-001', metin:'Bekleme nedeni ayrı eksene taşındı (revizyon notundan)', eski:null, yeni:'Müşteri', tone:'warn', icon:'i-clock' },
  { kayit:'GRV-2026-117', tarih:'2026-08-03T09:00', kisi:'EMP-001', metin:'Durum sözlüğü sadeleştirildi — "Kabul bekliyor" ayrı durum olmaktan çıktı', eski:'Kabul bekliyor', yeni:'Atandı', tone:'info', icon:'i-refresh' },
  { kayit:'GRV-2026-123', tarih:'2026-08-03T09:00', kisi:'EMP-001', metin:'Durum sözlüğü sadeleştirildi — "Planlandı" ayrı durum olmaktan çıktı', eski:'Planlandı', yeni:'Atandı', tone:'info', icon:'i-refresh' },
  { kayit:'GRV-2026-105', tarih:'2026-08-03T09:01', kisi:'EMP-001', metin:'Bekleme nedeni ayrı eksene taşındı (engel nedeninden)', eski:null, yeni:'Müşteri', tone:'warn', icon:'i-clock' },
  /* Arşivleme hareketi yazılı DEĞİLDİ; tek arşivli görev bu yüzden arşivden
     geri alınamıyordu (`GV.task.arsivGeriAl` gideceği yeri tahmin etmez, kayıttan
     okur). Kaynak durum uydurulmadı: kayıt `ilerleme:100` ve `tamamlanma:'2026-02-26'`
     taşıyor, yani arşivlenmeden önce `Tamamlandı`ydı. Tarih tamamlanma gününün
     ertesidir. */
  { kayit:'GRV-2026-124', tarih:'2026-02-27T17:30', kisi:'EMP-010', metin:'Görev arşivlendi', eski:'Tamamlandı', yeni:'Arşivlendi', tone:'neutral', icon:'i-archive' },
  { kayit:'GRV-2026-101', tarih:'2026-08-02T16:20', kisi:'EMP-008', metin:'İlerleme güncellendi', eski:'%45', yeni:'%70', tone:'accent', icon:'i-activity' },
  { kayit:'GRV-2026-101', tarih:'2026-08-01T09:05', kisi:'EMP-009', metin:'Hata yeniden açıldı — düzeltme doğrulanamadı', eski:'Kontrol bekliyor', yeni:'Devam ediyor', tone:'danger', icon:'i-refresh' },
  { kayit:'GRV-2026-101', tarih:'2026-07-30T11:40', kisi:'EMP-003', metin:'Görev atandı', eski:'Havuzda', yeni:'Atandı', tone:'info', icon:'i-user-check' },
  { kayit:'GRV-2026-101', tarih:'2026-07-30T11:38', kisi:'EMP-009', metin:'Görev oluşturuldu (HTA-2026-071 hatasından)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'LEAD-2026-001', tarih:'2026-07-27T17:10', kisi:'EMP-014', metin:'Aşama değiştirildi', eski:'Teklif hazırlanıyor', yeni:'Teklif iletildi', tone:'ok', icon:'i-funnel' },
  { kayit:'LEAD-2026-001', tarih:'2026-07-22T10:00', kisi:'EMP-002', metin:'Teklif TKL-2026-014 oluşturuldu', eski:null, yeni:null, tone:'accent', icon:'i-quote' },
  { kayit:'PRJ-2026-006', tarih:'2026-07-29T14:15', kisi:'EMP-003', metin:'Proje sağlık durumu değişti', eski:'Dikkat', yeni:'Riskli', tone:'danger', icon:'i-alert' },
  { kayit:'MUS-2026-010', tarih:'2026-05-30T16:50', kisi:'EMP-013', metin:'Risk seviyesi yükseltildi', eski:'Orta', yeni:'Yüksek', tone:'danger', icon:'i-alert' },
  /* ---------------------------------------------------------------------
     UID-16 — detay ekranı kod öneki kapsamı (11. oturum).
     Yukarıdaki 8 kayıt yalnız 4 kod öneki taşıyordu (GRV · LEAD · PRJ · MUS);
     26 detay ekranının 22'sinde "Aktivite Geçmişi" sekmesi HER kayıtta boş
     durum basıyordu — ekran doğru davranıyordu, eksik olan veriydi.
     Aşağıdaki kayıtlar kalan 22 koleksiyonu kapsar.

     Sözleşme:
       · `kayit`  — gerçekten var olan bir kayıt kodu (canon eksen 22b)
       · `kisi`   — gerçek bir personel **ADI**, kod değil. Bu, VB-12'nin
                    ("kişi bağı kodla değil adla kuruluyor") üçüncü vakasıdır;
                    kişi kimliği turunda `EMP-*` koduna çevrilecek. 16 personel
                    adının 16'sı benzersiz olduğu için çevrim mekaniktir.
       · `tarih`  — `YYYY-MM-DDTHH:MM`, `DB.today`'i aşmaz, kaydın kendi yaşam
                    döngüsü içinde kalır; aynı kayıt + aynı dakika iki kez olamaz
       · `eski`/`yeni` — kaydın kendi sözlüğünden gerçek değerler; oluşturma
                    olaylarında ikisi de `null`
     Hepsi `canon.js` eksen 22 ve `tasks/qa/akt.js` ile her turda ölçülür.
     -------------------------------------------------------------------- */
/* ---- Müşteriler (MUS-*) ----
     `canon.js` eksen 22 koleksiyonu "kapsanmış" sayıyordu çünkü MUS-2026-010'da
     bir hareket vardı; ama `akt.js` hedef kaydı MUS-2024-001'i açtığında sekme
     boştu. İki eksenin farkı burada görünür oldu: koleksiyon kapsamı ile
     KAYDIN kapsamı aynı şey değildir. */
  { kayit:'MUS-2024-001', tarih:'2024-02-12T10:20', kisi:'EMP-002', metin:'Müşteri kaydı oluşturuldu (REF-003 yönlendirmesi)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'MUS-2024-001', tarih:'2025-12-20T15:40', kisi:'EMP-002', metin:'Yıllık kurumsal bakım sözleşmesi imzalandı (SZL-2026-022)', eski:null, yeni:null, tone:'ok', icon:'i-file-check' },
  { kayit:'MUS-2024-001', tarih:'2026-06-11T09:25', kisi:'EMP-013', metin:'Memnuniyet ortalaması güncellendi', eski:'4.3', yeni:'4.6', tone:'ok', icon:'i-star' },
  { kayit:'MUS-2024-001', tarih:'2026-07-30T13:05', kisi:'EMP-002', metin:'Sonraki aksiyon belirlendi: Q4 bakım yenilemesi görüşmesi', eski:null, yeni:null, tone:'info', icon:'i-calendar-check' },
  { kayit:'MUS-2025-003', tarih:'2025-01-20T11:00', kisi:'EMP-014', metin:'Müşteri kaydı oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'MUS-2025-003', tarih:'2026-06-24T16:30', kisi:'EMP-014', metin:'Risk seviyesi yükseltildi — geciken tahsilat', eski:'Orta', yeni:'Yüksek', tone:'danger', icon:'i-alert' },
  { kayit:'MUS-2026-011', tarih:'2026-05-18T14:10', kisi:'EMP-002', metin:'Aday kazanıldı, müşteri kaydına dönüştürüldü (LEAD-2026-005)', eski:null, yeni:null, tone:'ok', icon:'i-user-plus' },
  { kayit:'MUS-2026-011', tarih:'2026-06-20T10:45', kisi:'EMP-002', metin:'Geliştirme sözleşmesi imzalandı (SZL-2026-021)', eski:null, yeni:null, tone:'ok', icon:'i-file-check' },
/* ---- Teklifler (TKL-*) ---- */
  { kayit:'TKL-2026-014', tarih:'2026-07-22T10:00', kisi:'EMP-002', metin:'Teklif oluşturuldu (ANL-2026-003 ön analizinden)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'TKL-2026-014', tarih:'2026-07-23T16:40', kisi:'EMP-002', metin:'Kapsam düzeltmesi sonrası versiyon yükseltildi', eski:'1', yeni:'2', tone:'accent', icon:'i-copy' },
  { kayit:'TKL-2026-014', tarih:'2026-07-24T11:15', kisi:'EMP-002', metin:'İç onay verildi', eski:'Bekliyor', yeni:'Onaylandı', tone:'ok', icon:'i-stamp' },
  { kayit:'TKL-2026-014', tarih:'2026-07-27T11:30', kisi:'EMP-014', metin:'Teklif müşteriye iletildi', eski:'Taslak', yeni:'İletildi', tone:'ok', icon:'i-send' },
  { kayit:'TKL-2026-012', tarih:'2026-06-12T09:30', kisi:'EMP-002', metin:'Teklif oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'TKL-2026-012', tarih:'2026-06-19T14:00', kisi:'EMP-002', metin:'Müşteri onayı alındı, teklif kazanıldı', eski:'Müşteri değerlendirmesinde', yeni:'Kazanıldı', tone:'ok', icon:'i-check-circle' },
  { kayit:'TKL-2026-011', tarih:'2026-07-05T11:00', kisi:'EMP-014', metin:'Teklif oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'TKL-2026-011', tarih:'2026-07-15T16:10', kisi:'EMP-014', metin:'Teklif müşteri değerlendirmesine geçti', eski:'İletildi', yeni:'Müşteri değerlendirmesinde', tone:'info', icon:'i-clock' },
/* ---- Ön analizler (ANL-*) ---- */
  { kayit:'ANL-2026-001', tarih:'2026-07-20T09:40', kisi:'EMP-003', metin:'Ön analiz oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'ANL-2026-001', tarih:'2026-07-24T15:30', kisi:'EMP-003', metin:'Kapsam dışı maddeler eklendi: mobil uygulama Faz 2ye alındı', eski:null, yeni:null, tone:'info', icon:'i-list' },
  { kayit:'ANL-2026-001', tarih:'2026-07-28T11:10', kisi:'EMP-003', metin:'Tahmini bedel güncellendi (KDV hariç teklif ara toplamı)', eski:'560.000 ₺', yeni:'612.000 ₺', tone:'accent', icon:'i-wallet' },
  { kayit:'ANL-2026-001', tarih:'2026-07-30T17:00', kisi:'EMP-003', metin:'Ön analiz onaya gönderildi', eski:'Hazırlanıyor', yeni:'Onay bekliyor', tone:'info', icon:'i-stamp' },
  { kayit:'ANL-2026-003', tarih:'2026-07-08T10:15', kisi:'EMP-003', metin:'Ön analiz oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'ANL-2026-003', tarih:'2026-07-17T14:20', kisi:'EMP-003', metin:'Ön analiz onaylandı, teklife dönüştürülebilir', eski:'Onay bekliyor', yeni:'Onaylandı', tone:'ok', icon:'i-check-circle' },
  { kayit:'ANL-2026-004', tarih:'2026-07-30T09:00', kisi:'EMP-003', metin:'Ön analiz oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'ANL-2026-004', tarih:'2026-08-01T11:45', kisi:'EMP-003', metin:'Süre tahmini güncellendi', eski:'10 hafta', yeni:'8 hafta', tone:'accent', icon:'i-clock' },
/* ---- Yönlendiren kişiler (REF-*) ---- */
  { kayit:'REF-001', tarih:'2026-04-15T10:20', kisi:'EMP-002', metin:'Komisyon kazancı eklendi (KOM-2026-001)', eski:'0 ₺', yeni:'32.000 ₺', tone:'accent', icon:'i-percent' },
  { kayit:'REF-001', tarih:'2026-05-02T15:40', kisi:'EMP-002', metin:'Ödenen komisyon toplamı güncellendi (KOM-2026-001 ödendi)', eski:'0 ₺', yeni:'32.000 ₺', tone:'ok', icon:'i-wallet' },
  { kayit:'REF-001', tarih:'2026-07-18T11:30', kisi:'EMP-002', metin:'Yönlendirme sayacı güncellendi', eski:'5', yeni:'6', tone:'info', icon:'i-user-plus' },
  { kayit:'REF-001', tarih:'2026-07-18T11:35', kisi:'EMP-002', metin:'Toplam komisyon kazancı güncellendi (KOM-2026-004)', eski:'32.000 ₺', yeni:'49.700 ₺', tone:'accent', icon:'i-percent' },
  { kayit:'REF-007', tarih:'2026-07-08T14:00', kisi:'EMP-002', metin:'Komisyon kazancı eklendi (KOM-2026-003)', eski:'0 ₺', yeni:'47.600 ₺', tone:'accent', icon:'i-percent' },
  { kayit:'REF-007', tarih:'2026-07-08T14:05', kisi:'EMP-002', metin:'Yönlendirme kazanıma dönüştü', eski:'0', yeni:'1', tone:'ok', icon:'i-trend-up' },
  { kayit:'REF-008', tarih:'2026-04-11T18:00', kisi:'EMP-002', metin:'Etkinlikten gelen son yönlendirme kaydedildi', eski:null, yeni:null, tone:'info', icon:'i-user-plus' },
  { kayit:'REF-008', tarih:'2026-06-30T16:00', kisi:'EMP-002', metin:'Kaynak pasife alındı', eski:'Aktif', yeni:'Pasif', tone:'warn', icon:'i-archive' },
/* ---- Komisyon kazançları (KOM-*) ---- */
  { kayit:'KOM-2026-001', tarih:'2026-04-15T09:30', kisi:'EMP-002', metin:'Komisyon kaydı oluşturuldu (%5 oran)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'KOM-2026-001', tarih:'2026-04-20T11:00', kisi:'EMP-002', metin:'Onaya gönderildi', eski:'Bekliyor', yeni:'Onay bekliyor', tone:'info', icon:'i-stamp' },
  { kayit:'KOM-2026-001', tarih:'2026-04-24T15:10', kisi:'EMP-012', metin:'Komisyon onaylandı, ödeme kuyruğuna alındı', eski:'Onay bekliyor', yeni:'Onaylandı', tone:'ok', icon:'i-check-circle' },
  { kayit:'KOM-2026-001', tarih:'2026-05-02T14:30', kisi:'EMP-012', metin:'Komisyon ödemesi yapıldı', eski:'Onaylandı', yeni:'Ödendi', tone:'ok', icon:'i-wallet' },
  { kayit:'KOM-2026-003', tarih:'2026-07-08T10:40', kisi:'EMP-002', metin:'Komisyon kaydı oluşturuldu (%7 oran)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'KOM-2026-003', tarih:'2026-07-09T09:20', kisi:'EMP-002', metin:'Onaya gönderildi', eski:'Bekliyor', yeni:'Onay bekliyor', tone:'info', icon:'i-stamp' },
  { kayit:'KOM-2026-004', tarih:'2026-07-18T11:20', kisi:'EMP-002', metin:'Komisyon kaydı oluşturuldu (%5 oran)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'KOM-2026-004', tarih:'2026-07-22T16:00', kisi:'EMP-012', metin:'Komisyon onaylandı, ödeme kuyruğuna alındı', eski:'Onay bekliyor', yeni:'Onaylandı', tone:'ok', icon:'i-check-circle' },
/* ---- Sözleşmeler (SZL-*) ---- */
  { kayit:'SZL-2026-021', tarih:'2026-06-20T14:30', kisi:'EMP-002', metin:'Sözleşme kaydı oluşturuldu (TKL-2026-012 teklifinden · 500.000 ₺ net)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'SZL-2026-021', tarih:'2026-06-24T10:00', kisi:'EMP-012', metin:'İlk taksit faturası kesildi (FTR-2026-026 · 250.000 ₺ net · 300.000 ₺ brüt)', eski:null, yeni:null, tone:'accent', icon:'i-receipt' },
  { kayit:'SZL-2026-021', tarih:'2026-07-04T15:20', kisi:'EMP-012', metin:'Taksit tahsilatı tamamlandı (FTR-2026-026)', eski:'Ödenmedi', yeni:'Ödendi', tone:'ok', icon:'i-wallet' },
  { kayit:'SZL-2026-021', tarih:'2026-07-25T17:00', kisi:'EMP-003', metin:'Birinci ödeme adımı tamamlandı (MS-003 POC kabul)', eski:'Planlandı', yeni:'Tamamlandı', tone:'ok', icon:'i-milestone' },
  { kayit:'SZL-2026-020', tarih:'2026-05-14T11:00', kisi:'EMP-002', metin:'Sözleşme kaydı oluşturuldu (TKL-2026-009 teklifinden · 295.000 ₺ net)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'SZL-2026-020', tarih:'2026-07-24T16:30', kisi:'EMP-003', metin:'Teslim tamamlandı, sözleşme kapatıldı', eski:'Aktif', yeni:'Tamamlandı', tone:'ok', icon:'i-file-check' },
  { kayit:'SZL-2026-024', tarih:'2026-03-10T10:20', kisi:'EMP-003', metin:'Sözleşme kaydı oluşturuldu (185.000 ₺ net · 222.000 ₺ brüt)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'SZL-2026-024', tarih:'2026-06-29T09:40', kisi:'EMP-003', metin:'Bitiş tarihi geçti, sözleşme gecikmeye düştü', eski:'Aktif', yeni:'Gecikti', tone:'danger', icon:'i-alert' },
/* ---- Hatalar (HTA-*) ---- */
  { kayit:'HTA-2026-071', tarih:'2026-08-01T09:10', kisi:'EMP-009', metin:'Düzeltme doğrulanamadı, hata açık kaldı', eski:null, yeni:null, tone:'danger', icon:'i-refresh' },
  { kayit:'HTA-2026-071', tarih:'2026-07-30T11:45', kisi:'EMP-008', metin:'Durum değiştirildi', eski:'Açık', yeni:'Devam ediyor', tone:'warn', icon:'i-play' },
  { kayit:'HTA-2026-071', tarih:'2026-07-30T11:40', kisi:'EMP-009', metin:'Düzeltme görevi GRV-2026-101 bağlandı', eski:null, yeni:null, tone:'info', icon:'i-link' },
  { kayit:'HTA-2026-071', tarih:'2026-07-30T10:15', kisi:'EMP-009', metin:'Hata kaydı açıldı (TST-2026-018 koşumundan)', eski:null, yeni:null, tone:'danger', icon:'i-bug' },
  { kayit:'HTA-2026-074', tarih:'2026-08-03T09:40', kisi:'EMP-006', metin:'Düzeltme görevi GRV-2026-126 bağlandı; şiddet Kritik olduğu için görev etkisi Çok yüksek belirlendi', eski:null, yeni:null, tone:'accent', icon:'i-link' },
  { kayit:'HTA-2026-074', tarih:'2026-07-30T15:10', kisi:'EMP-013', metin:'Hata kaydı açıldı (DST-2026-118 destek talebinden)', eski:null, yeni:null, tone:'danger', icon:'i-bug' },
  { kayit:'HTA-2026-075', tarih:'2026-07-24T16:30', kisi:'EMP-006', metin:'Durum değiştirildi', eski:'Devam ediyor', yeni:'Kapandı', tone:'ok', icon:'i-check-circle' },
  { kayit:'HTA-2026-075', tarih:'2026-07-18T11:05', kisi:'EMP-009', metin:'Hata kaydı açıldı (DST-2026-122 destek talebinden)', eski:null, yeni:null, tone:'danger', icon:'i-bug' },
/* ---- Testler (TST-*) ---- */
  { kayit:'TST-2026-018', tarih:'2026-07-31T17:45', kisi:'EMP-009', metin:'Koşum tamamlandı — 62 senaryonun 3 tanesi başarısız', eski:'Devam ediyor', yeni:'Tamamlandı', tone:'ok', icon:'i-clipboard-check' },
  { kayit:'TST-2026-018', tarih:'2026-07-31T17:20', kisi:'EMP-009', metin:'Başarısız senaryolar hata kayıtlarına bağlandı (HTA-2026-071, HTA-2026-072, HTA-2026-073)', eski:null, yeni:null, tone:'danger', icon:'i-bug' },
  { kayit:'TST-2026-018', tarih:'2026-07-31T09:15', kisi:'EMP-009', metin:'Koşum başlatıldı', eski:'Planlandı', yeni:'Devam ediyor', tone:'info', icon:'i-play' },
  { kayit:'TST-2026-018', tarih:'2026-07-31T08:50', kisi:'EMP-009', metin:'Test koşumu oluşturuldu — kapsam MOD-001, MOD-002, MOD-003', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'TST-2026-021', tarih:'2026-08-02T11:30', kisi:'EMP-009', metin:'3 senaryo başarısız olarak kaydedildi', eski:null, yeni:null, tone:'warn', icon:'i-x-circle' },
  { kayit:'TST-2026-021', tarih:'2026-08-01T09:30', kisi:'EMP-009', metin:'Koşum başlatıldı', eski:'Planlandı', yeni:'Devam ediyor', tone:'info', icon:'i-play' },
  { kayit:'TST-2026-020', tarih:'2026-07-26T15:40', kisi:'EMP-010', metin:'Koşum tamamlandı — 12 senaryonun tamamı başarılı', eski:'Devam ediyor', yeni:'Tamamlandı', tone:'ok', icon:'i-clipboard-check' },
  { kayit:'TST-2026-020', tarih:'2026-07-26T10:00', kisi:'EMP-010', metin:'Yük testi koşumu başlatıldı', eski:'Planlandı', yeni:'Devam ediyor', tone:'info', icon:'i-play' },
/* ---- Teslimler (TSL-*) ---- */
  { kayit:'TSL-2026-031', tarih:'2026-07-14T15:25', kisi:'EMP-003', metin:'Teslim durumu güncellendi', eski:'Planlandı', yeni:'Onaylandı', tone:'ok', icon:'i-check-circle' },
  { kayit:'TSL-2026-031', tarih:'2026-07-14T15:20', kisi:'EMP-003', metin:'Müşteri onayı alındı', eski:'Bekliyor', yeni:'Onaylandı', tone:'ok', icon:'i-stamp' },
  { kayit:'TSL-2026-031', tarih:'2026-07-10T17:30', kisi:'EMP-003', metin:'Beta paketi test cihazlarına dağıtıldı', eski:null, yeni:null, tone:'accent', icon:'i-package' },
  { kayit:'TSL-2026-031', tarih:'2026-07-10T09:00', kisi:'EMP-003', metin:'Teslim kaydı oluşturuldu — MS-001 taksitine bağlandı', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'TSL-2026-035', tarih:'2026-07-29T11:15', kisi:'EMP-003', metin:'Teslim durumu güncellendi', eski:'Planlandı', yeni:'Gecikti', tone:'danger', icon:'i-alert' },
  { kayit:'TSL-2026-035', tarih:'2026-06-26T16:40', kisi:'EMP-003', metin:'Teslim tarihi geçti, revizyon turu sürüyor', eski:null, yeni:null, tone:'warn', icon:'i-clock' },
  { kayit:'TSL-2026-033', tarih:'2026-07-29T14:10', kisi:'EMP-007', metin:'Müşteri onayı alındı', eski:'Bekliyor', yeni:'Onaylandı', tone:'ok', icon:'i-stamp' },
  { kayit:'TSL-2026-033', tarih:'2026-07-25T17:00', kisi:'EMP-007', metin:'POC sonuç paketi teslim edildi', eski:null, yeni:null, tone:'accent', icon:'i-package' },
/* ---- Değişiklik talepleri (DGS-*) ---- */
  { kayit:'DGS-2026-012', tarih:'2026-07-26T10:30', kisi:'EMP-003', metin:'İç onaya gönderildi (ONY-2026-055)', eski:'Değerlendiriliyor', yeni:'Onay bekliyor', tone:'warn', icon:'i-send' },
  { kayit:'DGS-2026-012', tarih:'2026-07-25T16:20', kisi:'EMP-003', metin:'Etki analizi tamamlandı — 12 saat efor, 38.000 ₺ net bedel', eski:null, yeni:null, tone:'info', icon:'i-clock' },
  { kayit:'DGS-2026-012', tarih:'2026-07-25T15:40', kisi:'EMP-003', metin:'Talep kapsam dışı olarak işaretlendi', eski:null, yeni:null, tone:'warn', icon:'i-flag' },
  { kayit:'DGS-2026-012', tarih:'2026-07-25T09:10', kisi:'EMP-003', metin:'Değişiklik talebi oluşturuldu — talebi açan taraf Müşteri', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'DGS-2026-016', tarih:'2026-08-01T10:20', kisi:'EMP-003', metin:'İç onaya gönderildi, ek teklif hazırlanacak', eski:'Değerlendiriliyor', yeni:'Onay bekliyor', tone:'warn', icon:'i-send' },
  { kayit:'DGS-2026-016', tarih:'2026-07-30T14:05', kisi:'EMP-003', metin:'Değişiklik talebi oluşturuldu (DST-2026-120 destek talebinden)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'DGS-2026-013', tarih:'2026-07-22T11:45', kisi:'EMP-003', metin:'Talep onaylandı, Faz 2 kapsamına alındı', eski:'Onay bekliyor', yeni:'Onaylandı', tone:'ok', icon:'i-check-circle' },
  { kayit:'DGS-2026-013', tarih:'2026-07-18T09:30', kisi:'EMP-003', metin:'Değişiklik talebi oluşturuldu — talebi açan taraf Müşteri', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
/* ---- Departmanlar arası iş talepleri (TLP-*) ---- */
  { kayit:'TLP-2026-041', tarih:'2026-08-03T09:50', kisi:'EMP-003', metin:'Durum değiştirildi', eski:'Bekliyor', yeni:'Devam ediyor', tone:'accent', icon:'i-play' },
  { kayit:'TLP-2026-041', tarih:'2026-08-01T14:15', kisi:'EMP-003', metin:'Talep onaylandı', eski:'Bekliyor', yeni:'Onaylandı', tone:'ok', icon:'i-check-circle' },
  { kayit:'TLP-2026-041', tarih:'2026-07-31T16:40', kisi:'EMP-014', metin:'Öncelik yükseltildi', eski:'Orta', yeni:'Yüksek', tone:'warn', icon:'i-alert' },
  { kayit:'TLP-2026-041', tarih:'2026-07-31T10:05', kisi:'EMP-014', metin:'İş talebi oluşturuldu (Satış ve İş Geliştirme → İş Analizi)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'TLP-2026-044', tarih:'2026-08-02T11:10', kisi:'EMP-006', metin:'Durum değiştirildi', eski:'Bekliyor', yeni:'Devam ediyor', tone:'accent', icon:'i-play' },
  { kayit:'TLP-2026-044', tarih:'2026-07-30T13:25', kisi:'EMP-013', metin:'İş talebi oluşturuldu (Teknik Destek → Front-end Geliştirme)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'TLP-2026-040', tarih:'2026-07-27T15:30', kisi:'EMP-002', metin:'Talep tamamlandı, güncel fatura adresi iletildi', eski:'Devam ediyor', yeni:'Tamamlandı', tone:'ok', icon:'i-check-circle' },
  { kayit:'TLP-2026-040', tarih:'2026-07-24T09:20', kisi:'EMP-012', metin:'İş talebi oluşturuldu (Muhasebe ve Finans → Satış ve İş Geliştirme)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
/* ---- Toplantılar (TOP-*) ---- */
  { kayit:'TOP-2026-064', tarih:'2026-08-03T10:20', kisi:'EMP-003', metin:'Gündeme eğitim takvimi maddesi eklendi', eski:null, yeni:null, tone:'info', icon:'i-list' },
  { kayit:'TOP-2026-064', tarih:'2026-08-01T15:05', kisi:'EMP-013', metin:'Müşteri tarafı katılımcıları teyit edildi', eski:null, yeni:null, tone:'ok', icon:'i-users' },
  { kayit:'TOP-2026-064', tarih:'2026-07-30T11:00', kisi:'EMP-008', metin:'Toplantı davetleri gönderildi', eski:null, yeni:null, tone:'info', icon:'i-send' },
  { kayit:'TOP-2026-064', tarih:'2026-07-29T16:30', kisi:'EMP-003', metin:'Toplantı oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-calendar' },
  { kayit:'TOP-2026-063', tarih:'2026-08-02T14:40', kisi:'EMP-003', metin:'Toplantı tamamlandı, karar notları kaydedildi', eski:'Planlandı', yeni:'Tamamlandı', tone:'ok', icon:'i-calendar-check' },
  { kayit:'TOP-2026-063', tarih:'2026-07-29T10:15', kisi:'EMP-002', metin:'Toplantı oluşturuldu ve davetler gönderildi', eski:null, yeni:null, tone:'neutral', icon:'i-calendar' },
  { kayit:'TOP-2026-060', tarih:'2026-07-22T15:10', kisi:'EMP-013', metin:'Toplantı tamamlandı, fire raporu revizyonu kararlaştırıldı', eski:'Planlandı', yeni:'Tamamlandı', tone:'ok', icon:'i-calendar-check' },
  { kayit:'TOP-2026-060', tarih:'2026-07-17T09:40', kisi:'EMP-003', metin:'Toplantı oluşturuldu ve gündem paylaşıldı', eski:null, yeni:null, tone:'neutral', icon:'i-calendar' },
/* ---- Faturalar (FTR-*) ---- */
  { kayit:'FTR-2025-011', tarih:'2025-12-24T11:05', kisi:'EMP-012', metin:'Ödeme tahsil edildi — 184.000 ₺ (KDV dahil)', eski:'Ödenmedi', yeni:'Ödendi', tone:'ok', icon:'i-wallet' },
  { kayit:'FTR-2025-011', tarih:'2025-12-18T10:20', kisi:'EMP-012', metin:'Vade hatırlatması gönderildi', eski:null, yeni:null, tone:'info', icon:'i-bell' },
  { kayit:'FTR-2025-011', tarih:'2025-12-01T10:30', kisi:'EMP-012', metin:'Fatura oluşturuldu — 153.333 ₺ net (KDV hariç), 184.000 ₺ brüt', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'FTR-2025-011', tarih:'2025-12-01T09:45', kisi:'EMP-003', metin:'MS-010 teslimi onaylandı, faturalama başlatıldı', eski:null, yeni:null, tone:'neutral', icon:'i-milestone' },
  { kayit:'FTR-2026-018', tarih:'2026-06-22T09:00', kisi:'EMP-012', metin:'Vade geçti, durum güncellendi', eski:'Ödenmedi', yeni:'Gecikti', tone:'danger', icon:'i-alert' },
  { kayit:'FTR-2026-018', tarih:'2026-05-22T09:40', kisi:'EMP-012', metin:'Fatura oluşturuldu — 237.500 ₺ net (KDV hariç), 285.000 ₺ brüt', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'FTR-2026-027', tarih:'2026-07-27T10:10', kisi:'EMP-012', metin:'Vade aşıldı, durum güncellendi', eski:'Ödenmedi', yeni:'Gecikti', tone:'danger', icon:'i-alert' },
  { kayit:'FTR-2026-027', tarih:'2026-06-26T15:20', kisi:'EMP-012', metin:'Fatura oluşturuldu — 92.500 ₺ net (KDV hariç), 111.000 ₺ brüt', eski:null, yeni:null, tone:'neutral', icon:'i-receipt' },
/* ---- Tahsilatlar (THS-*) ---- */
  { kayit:'THS-2025-032', tarih:'2025-12-24T11:12', kisi:'EMP-012', metin:'Son aksiyon güncellendi', eski:'Vade takibi', yeni:'Tahsil edildi', tone:'info', icon:'i-edit' },
  { kayit:'THS-2025-032', tarih:'2025-12-24T11:10', kisi:'EMP-012', metin:'Tahsilat tamamlandı — 184.000 ₺ (KDV dahil)', eski:'Bekliyor', yeni:'Ödendi', tone:'ok', icon:'i-wallet' },
  { kayit:'THS-2025-032', tarih:'2025-12-15T11:20', kisi:'EMP-012', metin:'Vade takibi yapıldı, müşteri finans birimiyle görüşüldü', eski:null, yeni:null, tone:'info', icon:'i-phone' },
  { kayit:'THS-2025-032', tarih:'2025-12-01T14:35', kisi:'EMP-012', metin:'Tahsilat kaydı açıldı — FTR-2025-011', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'THS-2026-041', tarih:'2026-06-24T10:30', kisi:'EMP-012', metin:'Son aksiyon güncellendi', eski:'Vade takibi', yeni:'2. hatırlatma gönderildi', tone:'warn', icon:'i-mail' },
  { kayit:'THS-2026-041', tarih:'2026-06-22T09:15', kisi:'EMP-012', metin:'Vade geçti, durum güncellendi', eski:'Bekliyor', yeni:'Gecikti', tone:'danger', icon:'i-alert' },
  { kayit:'THS-2026-042', tarih:'2026-07-29T14:05', kisi:'EMP-012', metin:'Son aksiyon güncellendi', eski:'Vade takibi', yeni:'Teslim tamamlanmadığı için beklemede', tone:'warn', icon:'i-clock' },
  { kayit:'THS-2026-042', tarih:'2026-07-27T09:40', kisi:'EMP-012', metin:'Vade aşıldı, durum güncellendi', eski:'Bekliyor', yeni:'Gecikti', tone:'danger', icon:'i-alert' },
/* ---- Dokümanlar (DOK-*) ---- */
  { kayit:'DOK-2026-201', tarih:'2026-06-23T15:10', kisi:'EMP-001', metin:'Onay durumu değişti', eski:'Bekliyor', yeni:'Onaylandı', tone:'ok', icon:'i-file-check' },
  { kayit:'DOK-2026-201', tarih:'2026-06-22T09:20', kisi:'EMP-001', metin:'Doküman onaya gönderildi', eski:null, yeni:null, tone:'info', icon:'i-send' },
  { kayit:'DOK-2026-201', tarih:'2026-06-20T11:45', kisi:'EMP-001', metin:'Gizlilik seviyesi değiştirildi', eski:'İç kullanım', yeni:'Gizli', tone:'warn', icon:'i-lock' },
  { kayit:'DOK-2026-201', tarih:'2026-06-20T11:30', kisi:'EMP-001', metin:'Doküman yüklendi — imzalı sözleşme, PDF', eski:null, yeni:null, tone:'neutral', icon:'i-paperclip' },
  { kayit:'DOK-2026-206', tarih:'2026-07-31T17:45', kisi:'EMP-009', metin:'Doküman onaya gönderildi', eski:null, yeni:null, tone:'info', icon:'i-send' },
  { kayit:'DOK-2026-206', tarih:'2026-07-31T17:40', kisi:'EMP-009', metin:'Yeni versiyon yüklendi', eski:'17', yeni:'18', tone:'accent', icon:'i-file' },
  { kayit:'DOK-2026-211', tarih:'2026-07-21T09:00', kisi:'EMP-015', metin:'Son kullanma tarihi doldu, belge yenilemesi bekleniyor', eski:null, yeni:null, tone:'danger', icon:'i-alert-circle' },
  { kayit:'DOK-2026-211', tarih:'2025-07-10T10:20', kisi:'EMP-015', metin:'Doküman yüklendi — 34 GVA 118 ruhsat fotokopisi', eski:null, yeni:null, tone:'neutral', icon:'i-paperclip' },
/* ---- Satın alma talepleri (SAT-*) ---- */
  { kayit:'SAT-2026-014', tarih:'2026-08-01T09:30', kisi:'EMP-010', metin:'Tedarikçi teklifleri karşılaştırıldı, TDR-002 tercih edildi — 186.000 ₺ net (KDV hariç)', eski:null, yeni:null, tone:'accent', icon:'i-quote' },
  { kayit:'SAT-2026-014', tarih:'2026-07-30T14:20', kisi:'EMP-005', metin:'Departman Yöneticisi adımı onaylandı, süreç Muhasebe adımına geçti', eski:'1', yeni:'2', tone:'ok', icon:'i-check-circle' },
  { kayit:'SAT-2026-014', tarih:'2026-07-30T13:50', kisi:'EMP-010', metin:'Talep onaya gönderildi', eski:'Taslak', yeni:'Onay bekliyor', tone:'info', icon:'i-send' },
  { kayit:'SAT-2026-014', tarih:'2026-07-30T10:05', kisi:'EMP-010', metin:'Satın alma talebi oluşturuldu — 2 adet dizüstü bilgisayar', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'SAT-2026-012', tarih:'2026-07-30T16:10', kisi:'EMP-011', metin:'Sipariş teslim alındı, talep kapatıldı', eski:'Sipariş verildi', yeni:'Teslim alındı', tone:'ok', icon:'i-package' },
  { kayit:'SAT-2026-012', tarih:'2026-07-14T09:20', kisi:'EMP-011', metin:'Satın alma talebi oluşturuldu — 28.500 ₺ net (KDV hariç)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'SAT-2025-010', tarih:'2025-03-04T15:30', kisi:'EMP-001', metin:'Şirket Sahibi adımı onaylandı, üç makamlı onay süreci tamamlandı', eski:'2', yeni:'3', tone:'ok', icon:'i-check-circle' },
  { kayit:'SAT-2025-010', tarih:'2025-02-24T10:40', kisi:'EMP-011', metin:'Araç satın alma talebi oluşturuldu — 1.680.000 ₺ net (KDV hariç)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
/* ---- Siparişler (SIP-*) ---- */
  { kayit:'SIP-2026-009', tarih:'2026-08-03T09:25', kisi:'EMP-012', metin:'Planlanan teslim yaklaşıyor, tedarikçi takibi yapıldı', eski:null, yeni:null, tone:'info', icon:'i-clock' },
  { kayit:'SIP-2026-009', tarih:'2026-07-27T09:10', kisi:'EMP-012', metin:'Planlanan teslim tarihi tedarikçiyle teyit edildi — 08.08.2026', eski:null, yeni:null, tone:'info', icon:'i-calendar-check' },
  { kayit:'SIP-2026-009', tarih:'2026-07-26T11:30', kisi:'EMP-012', metin:'Sipariş tedarikçiye iletildi — 8.400 ₺ net (KDV hariç), 10.080 ₺ brüt', eski:null, yeni:null, tone:'info', icon:'i-send' },
  { kayit:'SIP-2026-009', tarih:'2026-07-26T11:15', kisi:'EMP-012', metin:'Sipariş oluşturuldu — SAT-2026-013 talebinden, TDR-005', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'SIP-2026-008', tarih:'2026-07-30T15:50', kisi:'EMP-011', metin:'Teslim alındı, kontrol tam — IRS-4471 irsaliyesi kaydedildi', eski:'Sipariş verildi', yeni:'Teslim alındı', tone:'ok', icon:'i-truck' },
  { kayit:'SIP-2026-008', tarih:'2026-07-16T10:05', kisi:'EMP-012', metin:'Sipariş oluşturuldu — TDR-005, 28.500 ₺ net (KDV hariç)', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'SIP-2025-006', tarih:'2025-03-20T14:30', kisi:'EMP-011', metin:'Araç teslim alındı, kontrol tam — ARC-004 filo kaydı açıldı', eski:'Sipariş verildi', yeni:'Teslim alındı', tone:'ok', icon:'i-car' },
  { kayit:'SIP-2025-006', tarih:'2025-03-06T11:00', kisi:'EMP-012', metin:'Sipariş oluşturuldu — TDR-007, 1.680.000 ₺ net (KDV hariç), 2.016.000 ₺ brüt', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
/* ---- Tedarikçiler (TDR-*) ---- */
  { kayit:'TDR-001', tarih:'2026-08-01T09:15', kisi:'EMP-012', metin:'Tedarikçi genel puanı güncellendi', eski:'4,2', yeni:'4,4', tone:'ok', icon:'i-star' },
  { kayit:'TDR-001', tarih:'2026-07-30T12:40', kisi:'EMP-012', metin:'Dizüstü bilgisayar teklifi alındı — SAT-2026-014, 179.000 ₺ net (KDV hariç)', eski:null, yeni:null, tone:'info', icon:'i-quote' },
  { kayit:'TDR-001', tarih:'2026-07-25T14:10', kisi:'EMP-012', metin:'Ofis sarf malzemesi teklifi alındı — SAT-2026-013', eski:null, yeni:null, tone:'info', icon:'i-quote' },
  { kayit:'TDR-001', tarih:'2026-06-15T10:30', kisi:'EMP-012', metin:'Ödeme vadesi yeniden görüşüldü', eski:'Peşin', yeni:'30 gün', tone:'ok', icon:'i-wallet' },
  { kayit:'TDR-007', tarih:'2025-03-20T15:05', kisi:'EMP-012', metin:'Sipariş sayısı güncellendi — SIP-2025-006 teslim alındı', eski:'0', yeni:'1', tone:'ok', icon:'i-cart' },
  { kayit:'TDR-007', tarih:'2025-02-28T14:00', kisi:'EMP-012', metin:'Tedarikçi kaydı açıldı — Araç kategorisi', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'TDR-005', tarih:'2026-07-31T11:25', kisi:'EMP-012', metin:'Teklif teknik uygunluk sağlamadı, tedarikçi genel puanı düşürüldü', eski:'3,9', yeni:'3,6', tone:'warn', icon:'i-trend-down' },
  { kayit:'TDR-005', tarih:'2026-07-16T10:10', kisi:'EMP-012', metin:'Ofis mobilyası siparişi verildi — SIP-2026-008', eski:null, yeni:null, tone:'accent', icon:'i-cart' },
/* ---- Personel (EMP-*) ---- */
  { kayit:'EMP-001', tarih:'2021-03-15T09:00', kisi:'EMP-001', metin:'Personel kaydı oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-user-plus' },
  { kayit:'EMP-001', tarih:'2022-01-10T11:00', kisi:'EMP-001', metin:'Unvan değiştirildi', eski:'Kurucu Ortak', yeni:'Kurucu Ortak / Genel Müdür', tone:'accent', icon:'i-briefcase' },
  { kayit:'EMP-001', tarih:'2023-11-14T15:30', kisi:'EMP-001', metin:'PMP sertifikası özlük dosyasına eklendi', eski:null, yeni:null, tone:'ok', icon:'i-award' },
  { kayit:'EMP-001', tarih:'2026-07-31T18:00', kisi:'EMP-001', metin:'Kapasite doluluğu güncellendi', eski:'%58', yeni:'%64', tone:'info', icon:'i-gauge' },
  { kayit:'EMP-006', tarih:'2022-08-15T09:00', kisi:'EMP-003', metin:'Personel kaydı oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-user-plus' },
  { kayit:'EMP-006', tarih:'2026-06-16T17:20', kisi:'EMP-003', metin:'WCAG 2.2 Erişilebilirlik eğitimi tamamlandı (EGT-2026-010)', eski:null, yeni:null, tone:'ok', icon:'i-graduation' },
  { kayit:'EMP-016', tarih:'2026-06-15T09:30', kisi:'EMP-006', metin:'Staj kaydı oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-user-plus' },
  { kayit:'EMP-016', tarih:'2026-07-13T10:15', kisi:'EMP-006', metin:'Eğitim planına EGT-2026-011 eklendi', eski:null, yeni:null, tone:'info', icon:'i-graduation' },
/* ---- İzin talepleri (IZN-*) ---- */
  { kayit:'IZN-2026-038', tarih:'2026-07-31T09:40', kisi:'EMP-006', metin:'İzin talebi oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'IZN-2026-038', tarih:'2026-07-31T10:05', kisi:'EMP-006', metin:'İzin türü düzeltildi', eski:'Mazeret izni', yeni:'Yıllık izin', tone:'info', icon:'i-edit' },
  { kayit:'IZN-2026-038', tarih:'2026-08-01T11:30', kisi:'EMP-003', metin:'Proje takvimi çakışma kontrolü yapıldı, çakışma bulunmadı', eski:null, yeni:null, tone:'ok', icon:'i-calendar-check' },
  { kayit:'IZN-2026-038', tarih:'2026-08-03T09:15', kisi:'EMP-003', metin:'Onay hatırlatması gönderildi', eski:null, yeni:null, tone:'warn', icon:'i-bell' },
  { kayit:'IZN-2026-033', tarih:'2026-07-15T14:00', kisi:'EMP-005', metin:'İzin talebi oluşturuldu', eski:null, yeni:null, tone:'neutral', icon:'i-plus' },
  { kayit:'IZN-2026-033', tarih:'2026-07-17T10:25', kisi:'EMP-003', metin:'Talep reddedildi — Marmara Faz 1 teslim haftasıyla çakışıyor', eski:'Onay bekliyor', yeni:'Reddedildi', tone:'danger', icon:'i-x-circle' },
  { kayit:'IZN-2026-034', tarih:'2026-07-06T08:30', kisi:'EMP-013', metin:'İzin talebi oluşturuldu, rapor belgesi eklendi', eski:null, yeni:null, tone:'neutral', icon:'i-paperclip' },
  { kayit:'IZN-2026-034', tarih:'2026-07-06T09:15', kisi:'EMP-002', metin:'Talep onaylandı', eski:'Onay bekliyor', yeni:'Onaylandı', tone:'ok', icon:'i-check-circle' },
/* ---- Araçlar (ARC-*) ---- */
  { kayit:'ARC-001', tarih:'2023-05-12T10:00', kisi:'EMP-001', metin:'Araç kaydı oluşturuldu, filoya alındı', eski:null, yeni:null, tone:'neutral', icon:'i-car' },
  { kayit:'ARC-001', tarih:'2026-04-18T16:30', kisi:'EMP-001', metin:'Periyodik bakım tamamlandı (BKM-2026-017)', eski:'Serviste', yeni:'Aktif', tone:'ok', icon:'i-wrench' },
  { kayit:'ARC-001', tarih:'2026-07-26T13:05', kisi:'EMP-001', metin:'Park ihlali cezası kaydedildi (CEZ-2026-005)', eski:null, yeni:null, tone:'warn', icon:'i-receipt' },
  { kayit:'ARC-001', tarih:'2026-08-01T08:45', kisi:'EMP-001', metin:'Kilometre güncellendi', eski:'68.120 km', yeni:'68.400 km', tone:'info', icon:'i-gauge' },
  { kayit:'ARC-004', tarih:'2025-03-20T11:00', kisi:'EMP-002', metin:'SIP-2025-006 siparişiyle filoya alındı', eski:null, yeni:null, tone:'neutral', icon:'i-car' },
  { kayit:'ARC-004', tarih:'2026-06-18T17:40', kisi:'EMP-002', metin:'Hız limiti aşımı cezası kaydedildi (CEZ-2026-004)', eski:null, yeni:null, tone:'warn', icon:'i-receipt' },
  { kayit:'ARC-003', tarih:'2026-05-22T15:10', kisi:'EMP-012', metin:'Kaza kaydı açıldı (KZA-2026-002), karşı taraf tam kusurlu', eski:null, yeni:null, tone:'danger', icon:'i-alert' },
  { kayit:'ARC-003', tarih:'2026-07-28T09:30', kisi:'EMP-012', metin:'Ağır bakım için servise bırakıldı (BKM-2026-020)', eski:'Aktif', yeni:'Serviste', tone:'warn', icon:'i-wrench' },
/* ---- Demirbaşlar (DMB-*) ---- */
  { kayit:'DMB-2024-001', tarih:'2024-01-18T14:00', kisi:'EMP-005', metin:'Demirbaş envantere alındı', eski:null, yeni:null, tone:'neutral', icon:'i-package' },
  { kayit:'DMB-2024-001', tarih:'2024-01-22T10:30', kisi:'EMP-005', metin:'Zimmet tutanağı imzalandı (ZMT-2024-001)', eski:'Depoda', yeni:'Zimmetli', tone:'ok', icon:'i-clipboard-check' },
  { kayit:'DMB-2024-001', tarih:'2026-06-30T16:00', kisi:'EMP-005', metin:'Envanter sayımında doğrulandı', eski:null, yeni:null, tone:'ok', icon:'i-clipboard-check' },
  { kayit:'DMB-2024-001', tarih:'2026-07-15T10:00', kisi:'EMP-005', metin:'Garanti bitiş tarihi kontrol edildi, garanti sürüyor', eski:null, yeni:null, tone:'info', icon:'i-shield-check' },
  { kayit:'DMB-2026-013', tarih:'2026-07-30T15:20', kisi:'EMP-011', metin:'SIP-2026-008 siparişinden envantere alındı', eski:null, yeni:null, tone:'neutral', icon:'i-package' },
  { kayit:'DMB-2026-013', tarih:'2026-07-31T09:50', kisi:'EMP-011', metin:'Zimmet teslimi yapıldı', eski:'Depoda', yeni:'Zimmetli', tone:'ok', icon:'i-clipboard-check' },
  { kayit:'DMB-2025-006', tarih:'2025-04-02T14:30', kisi:'EMP-008', metin:'Test cihazı envantere alındı', eski:null, yeni:null, tone:'neutral', icon:'i-package' },
  { kayit:'DMB-2025-006', tarih:'2025-04-05T10:10', kisi:'EMP-008', metin:'Zimmet teslimi yapıldı (ZMT-2025-004)', eski:'Depoda', yeni:'Zimmetli', tone:'ok', icon:'i-clipboard-check' },
/* ---- Destek talepleri (DST-*) ---- */
  { kayit:'DST-2026-118', tarih:'2026-08-02T20:15', kisi:'EMP-013', metin:'Destek talebi açıldı', eski:null, yeni:null, tone:'neutral', icon:'i-support' },
  { kayit:'DST-2026-118', tarih:'2026-08-02T20:51', kisi:'EMP-013', metin:'İlk yanıt verildi', eski:'Yeni', yeni:'Çalışılıyor', tone:'info', icon:'i-chat' },
  { kayit:'DST-2026-118', tarih:'2026-08-02T21:40', kisi:'EMP-013', metin:'Talep hata kaydına dönüştürüldü (HTA-2026-074)', eski:null, yeni:null, tone:'accent', icon:'i-bug' },
  { kayit:'DST-2026-118', tarih:'2026-08-03T08:30', kisi:'EMP-013', metin:'SLA durumu değişti', eski:'Zamanında', yeni:'Risk altında', tone:'warn', icon:'i-timer' },
  { kayit:'DST-2026-122', tarih:'2026-07-18T09:22', kisi:'EMP-013', metin:'İlk yanıt verildi', eski:'Yeni', yeni:'Çalışılıyor', tone:'info', icon:'i-chat' },
  { kayit:'DST-2026-122', tarih:'2026-07-18T14:00', kisi:'EMP-013', metin:'Çözüm doğrulandı, talep kapatıldı', eski:'Çözüldü', yeni:'Kapatıldı', tone:'ok', icon:'i-check-circle' },
  { kayit:'DST-2026-120', tarih:'2026-07-30T15:30', kisi:'EMP-013', metin:'İlk yanıt verildi, ek geliştirme teklifi iletildi', eski:'Yeni', yeni:'Müşteri bekleniyor', tone:'info', icon:'i-chat' },
  { kayit:'DST-2026-120', tarih:'2026-08-02T09:10', kisi:'EMP-013', metin:'SLA durumu değişti', eski:'Risk altında', yeni:'İhlal edildi', tone:'danger', icon:'i-timer' }
];

/* ---- Arama yardımcıları (org.js'teki DB.emp / DB.empName ile aynı desen) ---- */
DB.proj     = function(kod){ return DB.projects.filter(function(p){ return p.kod === kod; })[0] || null; };
DB.projName = function(kod){ var p = DB.proj(kod); return p ? p.ad : '—'; };
DB.mod      = function(kod){ return DB.projectModules.filter(function(m){ return m.kod === kod; })[0] || null; };
DB.modName  = function(kod){ var m = DB.mod(kod); return m ? m.ad : '—'; };
DB.task     = function(kod){ return DB.tasks.filter(function(t){ return t.kod === kod; })[0] || null; };
