/* =====================================================================
   GAVIAWORKS CRM — ORGANİZASYON VERİSİ
   Departmanlar · Roller · Yetki matrisi · Personel
   Canonical: buradaki kod (EMP-xxx / DEP-xx / rol anahtarı) tüm ekranlarda aynıdır.
   Tarih ekseni: BUGÜN = 2026-08-03 (tasks/assumptions.md V-07)
   ===================================================================== */
window.DB = window.DB || {};

DB.today = '2026-08-03';

/* FORMÜL SÜRÜMÜ — şartname [14.4.2] · [14.5.1].
   Dışa aktarılan her dosyanın künyesine yazılır ve rapor kaydında
   (`DB.reportRegistry[].formula_version`) tekrar edilir. Amacı tek:
   elindeki dosyanın HANGİ hesap kuralıyla üretildiğini söylemek. Bir
   ölçünün formülü değiştiğinde (bakiye net→brüt, SLA takvim→iş günü)
   bu sürüm ARTIRILIR; artırılmazsa iki farklı kuralla üretilmiş iki
   dosya ayırt edilemez ve eski çıktı sessizce yanlış okunur.
   Sürüm tek ve genel: prototipte hesap katmanı (`domain.js`) tek parça. */
DB.formulaVersion = 'f-2026.08-1';

DB.company = {
  ad:'Gavia Works', unvan:'Gavia Works Yazılım ve Danışmanlık Ltd. Şti.',
  vergiDairesi:'Çankaya', vergiNo:'3720654891', kurulus:'2021-03-15',
  adres:'Mustafa Kemal Mah. Dumlupınar Blv. No:274, Çankaya / Ankara',
  telefon:'+90 312 000 00 00', eposta:'info@gaviaworks.com', web:'gaviaworks.com',
  calisanSayisi:16, paket:'Kurumsal', tenant:'gaviaworks',

  /* ---- İç maliyet sabitleri (REVİZE 04) --------------------------------
     Proje personel maliyeti = onaylı saat × personelin saatlik İÇ MALİYETİ.
     İç maliyet TÜRETİLİR, personel kaydında saklanmaz (L-08):
        maas > 0          → maas × isverenMaliyetKatsayisi / aylikCalismaSaati
        saatlikUcret > 0  → saatlikUcret (dışarıya fatura edilen tutar =
                            şirketin maliyeti)
     İkisi `app-personel-form.html:146`'daki **XOR** sözleşmesiyle korunur;
     iki alandan yalnız biri dolu olur ve o sözleşme bozulmadı.

     Katsayı ve aylık saat BURAYA YAZILI SABİTTİR (VB-19 dersi): hesabın
     girdisi koda gömülürse maliyet sessizce değişir ve kimse fark etmez.
     · isverenMaliyetKatsayisi — brüt maaş üstüne işveren SGK + işsizlik payı
     · aylikCalismaSaati — 22 iş günü × 8 saat (çalışma düzeni: 5 gün, 8 saat) */
  isverenMaliyetKatsayisi:1.225,
  aylikCalismaSaati:176,

  /* REVİZE 07 — proje kapanışında hangi dokümanın ZORUNLU olduğu.
     Bu tanım olmadan "eksik doküman var mı?" sorusu ÖLÇÜLEMEZ: eksikliğin
     kendisi ancak bir beklenti listesine göre tanımlanabilir. Liste
     `DB.documents[].tur` kümesinden seçildi — uydurma tür yazılmadı. */
  zorunluProjeDokuman:['Sözleşme','Teknik doküman','Test raporu'],

  /* ---- Aktif modüller (REVİZE 18) --------------------------------------
     Şirketin aracı yoksa yedi filo menüsü gereksiz kalabalıktır — ama
     **modül kapatmak veri silmek DEĞİLDİR** (talimat: "modül kapatıldığında
     veri silinmemeli, sadece ilgili menü kullanıcıdan gizlenmelidir").
     Kapalı modülün ekranı menüden düşer ve doğrudan adresle de açılmaz
     (`Perm.modul` → `guard`), dosyası ve kaydı yerinde kalır; anahtar geri
     açılınca her şey aynen döner.
     Sekiz anahtar dokümanın listesidir. Varsayılan HEPSİ AÇIK: bu depoda
     dört araç, 12 demirbaş ve gerçek satın alma kayıtları var — kapalı
     başlatmak var olan veriyi görünmez kılardı. */
  aktifModuller:{
    satis:true, proje:true, destek:true, personel:true,
    finans:true, satinalma:true, demirbas:true, filo:true
  }
};

/* ---- Departmanlar (PROMPT.md §4 — 21 departman) ---------------------- */
/* ---- Ana departman kümesi (REVİZE 15) ---------------------------------
   Şirket 16 kişilik; her teknik uzmanlığı ayrı departman yapmak 21 departman
   üretmişti ve **altısı boştu**. Doküman sekiz ana departman öneriyor.
   `DB.departments` SİLİNMEDİ (talimat: "mevcut departman verilerini silme") —
   her kayda `ustDepartman` geldi ve menü/süzgeç ana departmanı gösterebiliyor,
   detay alt kırılımı koruyor.
   İki kayıt istisnadır ve `ustDepartman:null` taşır: **DEP-20 Dış Kaynak
   Ekipler** ve **DEP-21 Freelancer ve Çözüm Ortakları** departman değil
   **çalışma tipidir** (REVİZE 16). İkisi de `aktif:false` yapıldı — silinmedi,
   kayıtları taşındı: tek kadrolu EMP-015 gerçek departmanına (DEP-06 Tasarım;
   yöneticisi zaten EMP-004, pozisyonu "Freelance Grafik Tasarımcı") gitti ve
   `calismaTipi:'Freelancer'` aldı. */
DB.departmentGroups = ['Yönetim & Operasyon','Satış & Müşteri','Proje / Ürün','Yazılım',
  'Yapay Zekâ & Data','Tasarım','Destek','Finans / Kurumsal'];

/* ---- Uzmanlık (REVİZE 15) --------------------------------------------
   Uzmanlık DEPARTMAN DEĞİLDİR: beş departman (Front-end · Back-end · Mobil ·
   Test · DevOps) aslında `Yazılım` altındaki birer uzmanlıktı. Küme ana
   departman ekseninde tanımlıdır; dokümanın Yazılım (6) ve Yapay Zekâ (5)
   listeleri birebir alınmış, Tasarım'ın iki değeri VERİDEKİ iki pozisyondan
   türetilmiştir (uydurma değer eklenmedi). Uzmanlık kümesi olmayan ana
   departmanlarda alan boş kalır — orada pozisyon zaten işi anlatıyor (V-60). */
DB.specialities = {
  'Yazılım':          ['Frontend','Backend','Full-stack','Mobile','DevOps','QA'],
  'Yapay Zekâ & Data':['AI Development','Automation','Machine Learning','AI Integration','Prompt / Agent'],
  'Tasarım':          ['UI/UX Tasarım','Grafik Tasarım']
};

DB.departments = [
  { kod:'DEP-01', ustDepartman:'Yönetim & Operasyon', ad:'Yönetim',                     kisa:'Yönetim',   yonetici:'EMP-001', aktif:true,  personel:1 },
  { kod:'DEP-02', ustDepartman:'Satış & Müşteri', ad:'Satış ve İş Geliştirme',      kisa:'Satış',     yonetici:'EMP-002', aktif:true,  personel:2 },
  { kod:'DEP-03', ustDepartman:'Satış & Müşteri', ad:'Müşteri İlişkileri',          kisa:'Müşteri İl.',yonetici:'EMP-013',aktif:true,  personel:0 },
  { kod:'DEP-04', ustDepartman:'Proje / Ürün', ad:'İş Analizi',                  kisa:'Analiz',    yonetici:'EMP-003', aktif:true,  personel:0 },
  { kod:'DEP-05', ustDepartman:'Proje / Ürün', ad:'Proje Yönetimi',              kisa:'Proje Y.',  yonetici:'EMP-003', aktif:true,  personel:1 },
  { kod:'DEP-06', ustDepartman:'Tasarım', ad:'UI/UX Tasarım',               kisa:'Tasarım',   yonetici:'EMP-004', aktif:true,  personel:2 },
  { kod:'DEP-07', ustDepartman:'Yazılım', ad:'Front-end Geliştirme',        kisa:'Front-end', yonetici:'EMP-006', aktif:true,  personel:2 },
  { kod:'DEP-08', ustDepartman:'Yazılım', ad:'Back-end Geliştirme',         kisa:'Back-end',  yonetici:'EMP-005', aktif:true,  personel:1 },
  { kod:'DEP-09', ustDepartman:'Yazılım', ad:'Mobil Uygulama Geliştirme',   kisa:'Mobil',     yonetici:'EMP-008', aktif:true,  personel:1 },
  { kod:'DEP-10', ustDepartman:'Yapay Zekâ & Data', ad:'Yapay Zekâ ve Veri',          kisa:'AI & Veri', yonetici:'EMP-007', aktif:true,  personel:1 },
  { kod:'DEP-11', ustDepartman:'Yazılım', ad:'Test ve Kalite',              kisa:'QA',        yonetici:'EMP-009', aktif:true,  personel:1 },
  { kod:'DEP-12', ustDepartman:'Yazılım', ad:'DevOps ve Sistem Yönetimi',   kisa:'DevOps',    yonetici:'EMP-010', aktif:true,  personel:1 },
  { kod:'DEP-13', ustDepartman:'Destek', ad:'Teknik Destek',               kisa:'Destek',    yonetici:'EMP-013', aktif:true,  personel:1 },
  { kod:'DEP-14', ustDepartman:'Finans / Kurumsal', ad:'İnsan Kaynakları',            kisa:'İK',        yonetici:'EMP-011', aktif:true,  personel:1 },
  { kod:'DEP-15', ustDepartman:'Finans / Kurumsal', ad:'Muhasebe ve Finans',          kisa:'Finans',    yonetici:'EMP-012', aktif:true,  personel:1 },
  { kod:'DEP-16', ustDepartman:'Finans / Kurumsal', ad:'Satın Alma',                  kisa:'Satın Alma',yonetici:'EMP-012', aktif:true,  personel:0 },
  { kod:'DEP-17', ustDepartman:'Yönetim & Operasyon', ad:'İdari İşler',                 kisa:'İdari',     yonetici:'EMP-011', aktif:true,  personel:0 },
  { kod:'DEP-18', ustDepartman:'Satış & Müşteri', ad:'Pazarlama',                   kisa:'Pazarlama', yonetici:'EMP-002', aktif:true,  personel:0 },
  { kod:'DEP-19', ustDepartman:'Satış & Müşteri', ad:'İçerik Üretimi',              kisa:'İçerik',    yonetici:'EMP-002', aktif:false, personel:0 },
  { kod:'DEP-20', ustDepartman:null, ad:'Dış Kaynak Ekipler',          kisa:'Dış Kaynak',yonetici:'EMP-003', aktif:false,  personel:0 },
  { kod:'DEP-21', ustDepartman:null, ad:'Freelancer ve Çözüm Ortakları',kisa:'Freelancer',yonetici:'EMP-003',aktif:false,  personel:0 }
];

/* ---- Roller (PROMPT.md §5 — 27 rol; §5 listesi sayıldığında 27 madde) ------
   dash : hangi dashboard varyantını kullanır (PROMPT.md §7 — 6 varyant)
   kademe: 1 yönetim · 2 orta kademe · 3 uzman · 4 dış/kısıtlı
------------------------------------------------------------------------ */
DB.roles = [
  { key:'sahip',        ad:'Şirket Sahibi',            dash:'sahip',    kademe:1 },
  { key:'genelmudur',   ad:'Genel Müdür',              dash:'sahip',    kademe:1 },
  { key:'operasyon',    ad:'Operasyon Yöneticisi',     dash:'pm',       kademe:1 },
  { key:'depmudur',     ad:'Departman Yöneticisi',     dash:'pm',       kademe:2 },
  { key:'satismudur',   ad:'Satış Yöneticisi',         dash:'satis',    kademe:2 },
  { key:'satistemsilci',ad:'Satış Temsilcisi',         dash:'satis',    kademe:3 },
  { key:'musteritems',  ad:'Müşteri Temsilcisi',       dash:'personel', kademe:3 },
  { key:'analist',      ad:'İş Analisti',              dash:'pm',       kademe:3 },
  { key:'pm',           ad:'Proje Yöneticisi',         dash:'pm',       kademe:2 },
  { key:'takimlideri',  ad:'Takım Lideri',             dash:'pm',       kademe:2 },
  { key:'tasarimci',    ad:'UI/UX Tasarımcı',          dash:'personel', kademe:3 },
  { key:'frontend',     ad:'Front-end Geliştirici',    dash:'personel', kademe:3 },
  { key:'backend',      ad:'Back-end Geliştirici',     dash:'personel', kademe:3 },
  { key:'mobil',        ad:'Mobil Geliştirici',        dash:'personel', kademe:3 },
  { key:'ai',           ad:'Yapay Zekâ Geliştiricisi', dash:'personel', kademe:3 },
  { key:'qa',           ad:'Test ve Kalite Uzmanı',    dash:'personel', kademe:3 },
  { key:'devops',       ad:'DevOps Personeli',         dash:'personel', kademe:3 },
  { key:'destek',       ad:'Teknik Destek Personeli',  dash:'personel', kademe:3 },
  { key:'ik',           ad:'İnsan Kaynakları',         dash:'ik',       kademe:2 },
  { key:'muhasebe',     ad:'Muhasebe',                 dash:'satinalma',kademe:2 },
  { key:'satinalma',    ad:'Satın Alma Sorumlusu',     dash:'satinalma',kademe:2 },
  { key:'idari',        ad:'İdari İşler Sorumlusu',    dash:'satinalma',kademe:2 },
  { key:'freelancer',   ad:'Freelancer',               dash:'personel', kademe:4 },
  { key:'diskaynak',    ad:'Dış Kaynak Ekip',          dash:'personel', kademe:4 },
  { key:'stajyer',      ad:'Stajyer',                  dash:'personel', kademe:4 },
  { key:'musteri',      ad:'Müşteri Kullanıcısı',      dash:'musteri',  kademe:4 },
  { key:'sistem',       ad:'Sistem Yöneticisi',        dash:'sahip',    kademe:1 }
];

/* ---- Yetki matrisi (PROMPT.md §5 / §26-D) ---------------------------
   Değerler: 'tum' | 'departman' | 'proje' | 'kendi' | 'yok'
   Onay/finans/maas/log alanları boolean.
------------------------------------------------------------------------ */
DB.permMatrix = {
  /* rol          gor        ekle       duzenle    sil        onay   rapor      finans maas  personelVeri log  disaAktar */
  sahip:        { gor:'tum', ekle:'tum', duzenle:'tum', sil:'tum', onay:true,  rapor:'tum', finans:true,  maas:true,  personel:'tum',       log:true,  disaAktar:true },
  genelmudur:   { gor:'tum', ekle:'tum', duzenle:'tum', sil:'tum', onay:true,  rapor:'tum', finans:true,  maas:true,  personel:'tum',       log:true,  disaAktar:true },
  sistem:       { gor:'tum', ekle:'tum', duzenle:'tum', sil:'tum', onay:true,  rapor:'tum', finans:true,  maas:false, personel:'tum',       log:true,  disaAktar:true },
  operasyon:    { gor:'tum', ekle:'tum', duzenle:'tum', sil:'yok', onay:true,  rapor:'tum', finans:true,  maas:false, personel:'departman', log:true,  disaAktar:true },
  depmudur:     { gor:'departman', ekle:'departman', duzenle:'departman', sil:'yok', onay:true, rapor:'departman', finans:false, maas:false, personel:'departman', log:false, disaAktar:true },
  satismudur:   { gor:'tum', ekle:'tum', duzenle:'tum', sil:'yok', onay:true,  rapor:'tum', finans:true,  maas:false, personel:'departman', log:false, disaAktar:true },
  satistemsilci:{ gor:'kendi', ekle:'kendi', duzenle:'kendi', sil:'yok', onay:false, rapor:'kendi', finans:false, maas:false, personel:'yok', log:false, disaAktar:true },
  musteritems:  { gor:'departman', ekle:'departman', duzenle:'kendi', sil:'yok', onay:false, rapor:'departman', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  analist:      { gor:'proje', ekle:'proje', duzenle:'proje', sil:'yok', onay:false, rapor:'proje', finans:false, maas:false, personel:'yok', log:false, disaAktar:true },
  pm:           { gor:'proje', ekle:'proje', duzenle:'proje', sil:'yok', onay:true,  rapor:'proje', finans:true,  maas:false, personel:'proje', log:false, disaAktar:true },
  takimlideri:  { gor:'departman', ekle:'departman', duzenle:'departman', sil:'yok', onay:true, rapor:'departman', finans:false, maas:false, personel:'departman', log:false, disaAktar:true },
  tasarimci:    { gor:'kendi', ekle:'kendi', duzenle:'kendi', sil:'yok', onay:false, rapor:'kendi', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  frontend:     { gor:'kendi', ekle:'kendi', duzenle:'kendi', sil:'yok', onay:false, rapor:'kendi', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  backend:      { gor:'kendi', ekle:'kendi', duzenle:'kendi', sil:'yok', onay:false, rapor:'kendi', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  mobil:        { gor:'kendi', ekle:'kendi', duzenle:'kendi', sil:'yok', onay:false, rapor:'kendi', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  ai:           { gor:'kendi', ekle:'kendi', duzenle:'kendi', sil:'yok', onay:false, rapor:'kendi', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  qa:           { gor:'proje', ekle:'proje', duzenle:'proje', sil:'yok', onay:false, rapor:'proje', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  devops:       { gor:'proje', ekle:'proje', duzenle:'proje', sil:'yok', onay:false, rapor:'proje', finans:false, maas:false, personel:'yok', log:true,  disaAktar:false },
  destek:       { gor:'departman', ekle:'departman', duzenle:'departman', sil:'yok', onay:false, rapor:'departman', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  ik:           { gor:'tum', ekle:'departman', duzenle:'departman', sil:'yok', onay:true, rapor:'tum', finans:false, maas:true, personel:'tum', log:false, disaAktar:true },
  muhasebe:     { gor:'tum', ekle:'departman', duzenle:'departman', sil:'yok', onay:true, rapor:'tum', finans:true, maas:true, personel:'departman', log:false, disaAktar:true },
  satinalma:    { gor:'departman', ekle:'departman', duzenle:'departman', sil:'yok', onay:true, rapor:'departman', finans:true, maas:false, personel:'yok', log:false, disaAktar:true },
  idari:        { gor:'departman', ekle:'departman', duzenle:'departman', sil:'yok', onay:false, rapor:'departman', finans:false, maas:false, personel:'yok', log:false, disaAktar:true },
  freelancer:   { gor:'kendi', ekle:'yok', duzenle:'kendi', sil:'yok', onay:false, rapor:'yok', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  diskaynak:    { gor:'kendi', ekle:'yok', duzenle:'kendi', sil:'yok', onay:false, rapor:'yok', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  stajyer:      { gor:'kendi', ekle:'yok', duzenle:'kendi', sil:'yok', onay:false, rapor:'yok', finans:false, maas:false, personel:'yok', log:false, disaAktar:false },
  /* REVİZE 13 — müşteri rolünün kapsamı `kendi` DEĞİL `musteri`dir.
     `kendi` bir PERSONEL ekseniydi (`GV.session.emp` ile eşleşir) ve müşteri
     oturumunda `emp` yoktur; sonuç: `GV.list`in `musteri` dalı (ui.js
     `afterScope`) beş oturum boyunca ÖLÜ KODDU ve ekranlar koleksiyonun
     tamamını basıyordu. `rapor` da aynı eksene çekildi. */
  musteri:      { gor:'musteri', ekle:'musteri', duzenle:'yok', sil:'yok', onay:true,  rapor:'musteri', finans:false, maas:false, personel:'yok', log:false, disaAktar:false }
};

/* ---- TAHSİS DEFTERİ YETKİSİ (K-25) ------------------------------------
   Tahsis defterine yazma yetkisi, `permMatrix.finans` bayrağından AYRI ve
   ondan DAR bir kümedir. Gerekçesi ölçüldü: `finans:true` sekiz rolde açık
   (`sahip · genelmudur · sistem · operasyon · satismudur · pm · muhasebe ·
   satinalma`) ama o bayrak "parayı GÖREBİLİR" demektir — maskeleme kuralı
   (UID-11) onu bu anlamda kullanır. Tahsilatı bir faturaya YAZMAK ayrı bir
   iştir ve muhasebe işidir.

   ⚠️ KÜME İKİ YÖNDE DE AYNIDIR — tahsis KURMA ile GERİ ALMA aynı kapıdan
   geçer. Geri almayı kurmaktan dar bir role bağlamak, tahsisi kuran
   kullanıcıyı kendi kaydının içine hapsederdi: bir işi geri almak, onu
   yapmaktan daha ağır koşula bağlanamaz. Bu yüzden K-25'in getirdiği
   daraltma her iki yordama BİRLİKTE uygulandı.

   Rol anahtarları `DB.roles` sözlüğünden doğrulandı (27 rol): üçü de var. */
DB.tahsisYetkiRolleri = ['muhasebe', 'sahip', 'genelmudur'];
DB.tahsisYetkiNot = 'Tahsis defterine yazma ve geri alma yetkisi Muhasebe, ' +
  'Şirket Sahibi ve Genel Müdür rollerindedir. Kurma ve geri alma AYNI kapıdan geçer.';

/* ---- Personel (PROMPT.md §14 — personel kartı) ----------------------- */
/* ---- Çalışma tipi (REVİZE 16) ----------------------------------------
   Freelancer ve dış kaynak DEPARTMAN DEĞİL, **istihdam ilişkisidir**.
   ⚠️ Var olan `calismaTuru` alanı BAŞKA BİR EKSENDİR ve korunur: o MESAİ
   eksenidir (`Tam zamanlı · Yarı zamanlı · Proje bazlı`). Bir freelancer tam
   zamanlı da çalışabilir; iki ekseni tek alana sıkıştırmak VB-20'nin tam
   olarak düştüğü hatadır. Yeni alan yanına gelir, yerine geçmez.
   Değer TÜRETİLDİ: `sozlesme:'Hizmet sözleşmesi'` + DEP-21 → `Freelancer`
   (EMP-015); kalan 15 kayıt → `Kadrolu` (staj sözleşmesi de kadroludur —
   stajyer şirketin içindedir, dış kaynak değil).
   `GV.hr.disKaynak` artık bu eksenden okur; ekranlar kendi kuralını yazmaz. */
DB.workTypes = ['Kadrolu','Freelancer','Ajans','Danışman','Dış Kaynak'];

/* ---- Yaşam döngüsü alanı (`durum`) -----------------------------------
   Şartname [4.1.4] altı durum istiyor; veride tek `aktif` boolean'ı vardı.
   `durum` o eksenin yerini alır, `aktif` ise KORUNUR — ekranlar hâlâ onu
   okuyor ve iki eksen bir süre paralel yaşar (geriye uyumluluk). Taşıma
   haritası `DB.statusMigration.employee`; 16 kaydın 15'i `aktif:true` →
   `Aktif` kuralıyla dolduruldu.

   ⚠️ TEK SAPMA — EMP-015 (`Offboarding`). Sebebi ölçülebilir: `tur:'Çıkış'`
   kaydı veride SIFIRDI ve bu kapatılması istenen boşluktu; bir çıkış kaydı
   ise sahibi olmadan yazılamaz. Süreci YÜRÜYEN bir çıkış seçildi
   (IGC-2026-004), çünkü tamamlanmış bir ayrılış `aktif:false` ister ve o an
   personelin projeleri, zaman kayıtları ve kapasitesi de yeniden yazılırdı —
   ölçülmemiş bir zincir. Yürüyen çıkışta `aktif` HÂLÂ true'dur (ihbar süresi
   sürüyor, kişi çalışıyor), yani hiçbir mevcut ekranın davranışı değişmez;
   değişen tek şey yaşam döngüsünün artık okunabilir olmasıdır.
   Seçim keyfî değil: EMP-015 veride tek `Hizmet sözleşmesi` / `Proje bazlı`
   kaydıdır, yani süresi biten bir sözleşme (`SOZLESME_BITIS`) onda doğaldır;
   ayrıca üzerindeki tek zimmet (ZMT-2025-005) 2026-05-14'te iade edilmiştir,
   yani `personelZimmet` kapısı bu kayıtta gerçekten açıktır. */

DB.employees = [
  { kod:'EMP-001', uzmanlik:null, calismaTipi:'Kadrolu', ad:'Kerem Aydın', ini:'KA', rol:'sahip', roller:['sahip','genelmudur'], dep:'DEP-01', depAd:'Yönetim',
    pozisyon:'Kurucu Ortak / Genel Müdür', yonetici:null, calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2021-03-15', tel:'+90 532 000 00 01', eposta:'kerem@gaviaworks.com', dogum:'1986-04-12',
    acilKisi:'Nuray Aydın · +90 532 000 10 01', egitim:'Bilgisayar Mühendisliği — ODTÜ',
    yetkinlik:['Strateji','Ürün Yönetimi','Satış'], teknoloji:['Node.js','PostgreSQL'], sertifika:['PMP'],
    maas:185000, izinBakiye:14, doluluk:64, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'A Rh+' },
  { kod:'EMP-002', uzmanlik:null, calismaTipi:'Kadrolu', ad:'Selin Dağdeviren', ini:'SD', rol:'satismudur', roller:['satismudur'], dep:'DEP-02', depAd:'Satış ve İş Geliştirme',
    pozisyon:'Satış ve İş Geliştirme Yöneticisi', yonetici:'EMP-001', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2021-09-01', tel:'+90 532 000 00 02', eposta:'selin@gaviaworks.com', dogum:'1990-11-02',
    acilKisi:'Murat Dağdeviren · +90 532 000 10 02', egitim:'İşletme — Bilkent',
    yetkinlik:['Satış','Teklif Yönetimi','Müzakere'], teknoloji:['HubSpot'], sertifika:['SPIN Selling'],
    maas:112000, izinBakiye:9, doluluk:78, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'0 Rh+' },
  { kod:'EMP-003', uzmanlik:null, calismaTipi:'Kadrolu', ad:'Barış Yalçın', ini:'BY', rol:'pm', roller:['pm','analist','operasyon'], dep:'DEP-05', depAd:'Proje Yönetimi',
    pozisyon:'Proje Yöneticisi / İş Analisti', yonetici:'EMP-001', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2021-06-14', tel:'+90 532 000 00 03', eposta:'baris@gaviaworks.com', dogum:'1988-07-21',
    acilKisi:'Elif Yalçın · +90 532 000 10 03', egitim:'Endüstri Mühendisliği — Hacettepe',
    yetkinlik:['Scrum','İş Analizi','Risk Yönetimi'], teknoloji:['Jira','Figma'], sertifika:['PSM I','PMI-ACP'],
    maas:124000, izinBakiye:6, doluluk:92, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'B Rh+' },
  { kod:'EMP-004', uzmanlik:'UI/UX Tasarım', calismaTipi:'Kadrolu', ad:'Ece Turan', ini:'ET', rol:'tasarimci', roller:['tasarimci','takimlideri'], dep:'DEP-06', depAd:'UI/UX Tasarım',
    pozisyon:'Kıdemli UI/UX Tasarımcı', yonetici:'EMP-003', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2022-02-07', tel:'+90 532 000 00 04', eposta:'ece@gaviaworks.com', dogum:'1993-01-30',
    acilKisi:'Sinem Turan · +90 532 000 10 04', egitim:'Görsel İletişim Tasarımı — Bilkent',
    yetkinlik:['UI','UX Araştırma','Design System','Erişilebilirlik'], teknoloji:['Figma','Framer'], sertifika:['NN/g UX'],
    maas:96000, izinBakiye:11, doluluk:86, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'A Rh-' },
  { kod:'EMP-005', uzmanlik:'Backend', calismaTipi:'Kadrolu', ad:'Mert Özkan', ini:'MÖ', rol:'backend', roller:['backend','takimlideri'], dep:'DEP-08', depAd:'Back-end Geliştirme',
    pozisyon:'Kıdemli Back-end Geliştirici', yonetici:'EMP-003', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2021-11-22', tel:'+90 532 000 00 05', eposta:'mert@gaviaworks.com', dogum:'1991-05-18',
    acilKisi:'Hakan Özkan · +90 532 000 10 05', egitim:'Bilgisayar Mühendisliği — Gazi',
    yetkinlik:['API Tasarımı','Mimari','Performans'], teknoloji:['Node.js','NestJS','PostgreSQL','Redis'], sertifika:['AWS SAA'],
    maas:118000, izinBakiye:4, doluluk:97, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'0 Rh-' },
  { kod:'EMP-006', uzmanlik:'Frontend', calismaTipi:'Kadrolu', ad:'Deniz Korkmaz', ini:'DK', rol:'frontend', roller:['frontend'], dep:'DEP-07', depAd:'Front-end Geliştirme',
    pozisyon:'Front-end Geliştirici', yonetici:'EMP-003', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2022-08-15', tel:'+90 532 000 00 06', eposta:'deniz@gaviaworks.com', dogum:'1995-09-09',
    acilKisi:'Aylin Korkmaz · +90 532 000 10 06', egitim:'Yazılım Mühendisliği — Atılım',
    yetkinlik:['Erişilebilirlik','Performans'], teknoloji:['React','TypeScript','Vite'], sertifika:[],
    maas:88000, izinBakiye:13, doluluk:81, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'A Rh+' },
  { kod:'EMP-007', uzmanlik:'AI Development', calismaTipi:'Kadrolu', ad:'Zeynep Aksoy', ini:'ZA', rol:'ai', roller:['ai'], dep:'DEP-10', depAd:'Yapay Zekâ ve Veri',
    pozisyon:'Yapay Zekâ Geliştiricisi', yonetici:'EMP-003', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2023-01-09', tel:'+90 532 000 00 07', eposta:'zeynep@gaviaworks.com', dogum:'1994-03-25',
    acilKisi:'Ceren Aksoy · +90 532 000 10 07', egitim:'Yapay Zekâ Yüksek Lisans — ODTÜ',
    yetkinlik:['LLM Entegrasyonu','RAG','Veri İşleme'], teknoloji:['Python','LangChain','pgvector'], sertifika:['TensorFlow Dev'],
    maas:108000, izinBakiye:8, doluluk:74, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'B Rh-' },
  { kod:'EMP-008', uzmanlik:'Mobile', calismaTipi:'Kadrolu', ad:'Onur Şahin', ini:'OŞ', rol:'mobil', roller:['mobil'], dep:'DEP-09', depAd:'Mobil Uygulama Geliştirme',
    pozisyon:'Mobil Uygulama Geliştirici', yonetici:'EMP-003', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2022-11-01', tel:'+90 532 000 00 08', eposta:'onur@gaviaworks.com', dogum:'1992-12-14',
    acilKisi:'Merve Şahin · +90 532 000 10 08', egitim:'Bilgisayar Mühendisliği — Başkent',
    yetkinlik:['Mobil Mimari','Store Süreçleri'], teknoloji:['React Native','Swift','Kotlin'], sertifika:[],
    maas:94000, izinBakiye:10, doluluk:88, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'AB Rh+' },
  { kod:'EMP-009', uzmanlik:'QA', calismaTipi:'Kadrolu', ad:'Gamze Erdem', ini:'GE', rol:'qa', roller:['qa'], dep:'DEP-11', depAd:'Test ve Kalite',
    pozisyon:'Test ve Kalite Uzmanı', yonetici:'EMP-003', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2023-04-17', tel:'+90 532 000 00 09', eposta:'gamze@gaviaworks.com', dogum:'1996-06-05',
    acilKisi:'Tarık Erdem · +90 532 000 10 09', egitim:'Yazılım Mühendisliği — TOBB',
    yetkinlik:['Test Otomasyonu','Regresyon'], teknoloji:['Playwright','Postman'], sertifika:['ISTQB Foundation'],
    maas:82000, izinBakiye:12, doluluk:69, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'0 Rh+' },
  { kod:'EMP-010', uzmanlik:'DevOps', calismaTipi:'Kadrolu', ad:'Tolga Bayrak', ini:'TB', rol:'devops', roller:['devops'], dep:'DEP-12', depAd:'DevOps ve Sistem Yönetimi',
    pozisyon:'DevOps Mühendisi', yonetici:'EMP-005', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2023-07-03', tel:'+90 532 000 00 10', eposta:'tolga@gaviaworks.com', dogum:'1990-02-28',
    acilKisi:'Serap Bayrak · +90 532 000 10 10', egitim:'Elektrik-Elektronik Mühendisliği — Yıldız',
    yetkinlik:['CI/CD','İzleme','Güvenlik','AWS','Altyapı'], teknoloji:['Docker','Kubernetes','Terraform','GitHub Actions'], sertifika:['CKA'],
    maas:106000, izinBakiye:7, doluluk:71, durum:'Aktif', aktif:true, lokasyon:'Uzaktan · İstanbul', kanGrubu:'A Rh+' },
  { kod:'EMP-011', uzmanlik:null, calismaTipi:'Kadrolu', ad:'Pınar Uçar', ini:'PU', rol:'ik', roller:['ik','idari'], dep:'DEP-14', depAd:'İnsan Kaynakları',
    pozisyon:'İK ve İdari İşler Sorumlusu', yonetici:'EMP-001', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2022-05-16', tel:'+90 532 000 00 11', eposta:'pinar@gaviaworks.com', dogum:'1989-08-11',
    acilKisi:'Kaan Uçar · +90 532 000 10 11', egitim:'İnsan Kaynakları Yönetimi — Ankara Üni.',
    yetkinlik:['Bordro','İşe Alım','Özlük'], teknoloji:['Logo İK'], sertifika:['İSG Uzmanı C'],
    maas:86000, izinBakiye:15, doluluk:58, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'B Rh+' },
  { kod:'EMP-012', uzmanlik:null, calismaTipi:'Kadrolu', ad:'Serkan Yılmaz', ini:'SY', rol:'muhasebe', roller:['muhasebe','satinalma'], dep:'DEP-15', depAd:'Muhasebe ve Finans',
    pozisyon:'Mali İşler ve Satın Alma Sorumlusu', yonetici:'EMP-001', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2021-10-11', tel:'+90 532 000 00 12', eposta:'serkan@gaviaworks.com', dogum:'1985-10-19',
    acilKisi:'Fatma Yılmaz · +90 532 000 10 12', egitim:'İşletme — Anadolu',
    yetkinlik:['Ön Muhasebe','Tahsilat','Tedarik'], teknoloji:['Logo Tiger','Paraşüt'], sertifika:['SMMM Stajyer'],
    maas:92000, izinBakiye:5, doluluk:66, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'0 Rh+' },
  { kod:'EMP-013', uzmanlik:null, calismaTipi:'Kadrolu', ad:'Ayşe Kaplan', ini:'AK', rol:'destek', roller:['destek','musteritems'], dep:'DEP-13', depAd:'Teknik Destek',
    pozisyon:'Müşteri İlişkileri ve Destek Uzmanı', yonetici:'EMP-002', calismaTuru:'Tam zamanlı', sozlesme:'Belirsiz süreli',
    girisTarihi:'2023-09-25', tel:'+90 532 000 00 13', eposta:'ayse@gaviaworks.com', dogum:'1997-04-08',
    acilKisi:'Hüseyin Kaplan · +90 532 000 10 13', egitim:'Yönetim Bilişim Sistemleri — Gazi',
    yetkinlik:['Destek Süreçleri','SLA','Müşteri İletişimi'], teknoloji:['Zendesk'], sertifika:[],
    maas:74000, izinBakiye:16, doluluk:83, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'A Rh+' },
  { kod:'EMP-014', uzmanlik:null, calismaTipi:'Kadrolu', ad:'Emre Bulut', ini:'EB', rol:'satistemsilci', roller:['satistemsilci'], dep:'DEP-02', depAd:'Satış ve İş Geliştirme',
    pozisyon:'Satış Temsilcisi', yonetici:'EMP-002', calismaTuru:'Tam zamanlı', sozlesme:'Belirli süreli',
    girisTarihi:'2025-02-03', tel:'+90 532 000 00 14', eposta:'emre@gaviaworks.com', dogum:'1998-11-27',
    acilKisi:'Derya Bulut · +90 532 000 10 14', egitim:'Pazarlama — Hacettepe',
    yetkinlik:['Lead Takibi','Demo Sunumu'], teknoloji:[], sertifika:[],
    maas:64000, izinBakiye:8, doluluk:72, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'B Rh+' },
  { kod:'EMP-015', uzmanlik:'Grafik Tasarım', calismaTipi:'Freelancer', ad:'Nihan Arslan', ini:'NA', rol:'freelancer', roller:['freelancer'], dep:'DEP-06', depAd:'UI/UX Tasarım',
    pozisyon:'Freelance Grafik Tasarımcı', yonetici:'EMP-004', calismaTuru:'Proje bazlı', sozlesme:'Hizmet sözleşmesi',
    girisTarihi:'2025-06-01', tel:'+90 532 000 00 15', eposta:'nihan@dis.gaviaworks.com', dogum:'1994-07-16',
    acilKisi:'—', egitim:'Grafik Tasarım — Marmara',
    yetkinlik:['Marka Kimliği','İllüstrasyon'], teknoloji:['Illustrator','After Effects'], sertifika:[],
    maas:0, saatlikUcret:1450, izinBakiye:0, doluluk:35, durum:'Offboarding', aktif:true,
    cikisTarihi:'2026-08-31', cikisNedenKodu:'SOZLESME_BITIS', lokasyon:'Uzaktan · İzmir', kanGrubu:'—' },
  { kod:'EMP-016', uzmanlik:'Frontend', calismaTipi:'Kadrolu', ad:'Can Özdemir', ini:'CÖ', rol:'stajyer', roller:['stajyer'], dep:'DEP-07', depAd:'Front-end Geliştirme',
    pozisyon:'Front-end Stajyeri', yonetici:'EMP-006', calismaTuru:'Yarı zamanlı', sozlesme:'Staj sözleşmesi',
    girisTarihi:'2026-06-15', tel:'+90 532 000 00 16', eposta:'can@gaviaworks.com', dogum:'2003-02-19',
    acilKisi:'Neslihan Özdemir · +90 532 000 10 16', egitim:'Bilgisayar Mühendisliği (3. sınıf) — Hacettepe',
    yetkinlik:['HTML/CSS'], teknoloji:['JavaScript'], sertifika:[],
    maas:22000, izinBakiye:0, doluluk:44, durum:'Aktif', aktif:true, lokasyon:'Ankara', kanGrubu:'0 Rh+' }
];

/* ---- Hızlı erişim yardımcıları -------------------------------------- */
DB.emp = function(kod){ return DB.employees.filter(function(e){ return e.kod === kod; })[0] || null; };
DB.empName = function(kod){ var e = DB.emp(kod); return e ? e.ad : '—'; };
DB.dep = function(kod){ return DB.departments.filter(function(d){ return d.kod === kod; })[0] || null; };
DB.depName = function(kod){ var d = DB.dep(kod); return d ? d.ad : '—'; };
DB.roleName = function(key){ var r = DB.roles.filter(function(x){ return x.key === key; })[0]; return r ? r.ad : key; };

/* =====================================================================
   ORTAK DURUM GEÇİŞ SÖZLEŞMESİ — şartname §6.1 (CLOUD TURU)
   ---------------------------------------------------------------------
   Ölçüm (docs/P-cloud-gap-analizi.md [6.1.1]): geçiş motoru tek varlıkta
   yaşıyordu — `DB.taskTransitions` yalnız görev içindi. Kalan 11 modül
   durumu 28 form ekranındaki serbest `<select>` ile yazıyordu. Sonucu
   ölçüldü: ön analiz herhangi bir durumdan `Onaylandı`ya atlayabiliyor,
   destek `Yeni`den doğrudan `Kapatıldı`ya geçebiliyor, sözleşme `Aktif`
   serbest seçilebiliyordu.

   Bu tablo o boşluğun tek kaynağıdır. Ekran durum yazmaz; `GV.flow.gec()`
   çağırır. Sözleşme şartname [6.1.2]–[6.1.9]'un dokuz alanını taşır:

     next      : gidilebilecek durumlar. Listede olmayan hedef REDDEDİLİR.
     yetki     : rol anahtarı VEYA ilişki anahtarı (`sorumlu`,`pm`,`veren`…).
                 İlişki anahtarı "bu kaydın sorumlusu" demektir, "sorumlu
                 rolündeki herkes" değil — `GV.flow` ikisini ayrı çözer.
     zorunlu   : geçiş öncesi dolu olması gereken alanlar.
     gerekce   : true ise neden kodu + açıklama zorunlu (şartname [2.0.6]).
     kapi      : ek engel yordamının adı (`GV.gates[...]`). Kapı `{ok:false,
                 why:…}` dönerse geçiş reddedilir. İstisna `istisnaRol`
                 listesindeki roller gerekçeyle geçebilir (ADR-04 · ADR-05).
     bildirim  : olay alıcıları.
     etiket    : aksiyon butonunun yazısı. Kullanıcıya statü dropdown'ı
                 gösterilmez; yapılabilecek işlem butondur.
     tone      : buton sınıfı.
     terminal  : true ise çıkış yoktur.

   ⚠️ Durum adları şartnameye hizalandı (ADR-01 · ADR-02 · ADR-18 · ADR-19).
   Taşınan her kayıt `DB.statusMigration` haritasında eski adıyla durur;
   hiçbir eski değer sessizce kaybolmadı (L-13).
   ===================================================================== */

/* Hangi koleksiyon, hangi anahtar, hangi durum alanı. `GV.flow` yalnız
   buradan okur; koleksiyon adını hiçbir yordam gömülü tutmaz. */
DB.flowEntities = {
  task:     { koleksiyon:'tasks',          alan:'durum',      ad:'Görev' },
  project:  { koleksiyon:'projects',       alan:'durum',      ad:'Proje' },
  contract: { koleksiyon:'contracts',      alan:'durum',      ad:'Sözleşme' },
  /* `kilit` — VARLIK düzeyinde dondurma (K-17). Ardılı olan teklif sürümü
     hiçbir geçiş yapamaz; kural her duruma ayrı ayrı yazılmaz. */
  quote:    { koleksiyon:'quotes',         alan:'durum',      ad:'Teklif', kilit:'teklifSurumKilidi' },
  analysis: { koleksiyon:'analyses',       alan:'durum',      ad:'Ön analiz' },
  invoice:  { koleksiyon:'invoices',       alan:'belgeDurum', ad:'Fatura' },
  bug:      { koleksiyon:'bugs',           alan:'durum',      ad:'Hata' },
  ticket:   { koleksiyon:'tickets',        alan:'durum',      ad:'Destek talebi' },
  purchase: { koleksiyon:'purchases',      alan:'durum',      ad:'Satın alma talebi' },
  leave:    { koleksiyon:'leaves',         alan:'durum',      ad:'İzin' },
  delivery: { koleksiyon:'deliveries',     alan:'durum',      ad:'Teslim' },
  change:   { koleksiyon:'changeRequests', alan:'durum',      ad:'Değişiklik talebi' },
  request:  { koleksiyon:'deptRequests',   alan:'durum',      ad:'Departman talebi' },
  order:    { koleksiyon:'orders',         alan:'durum',      ad:'Satın alma siparişi' },
  employee: { koleksiyon:'employees',      alan:'durum',      ad:'Personel' }
};

/* Eski → yeni durum adı. Ekranlar ve raporlar geçmiş değeri buradan okur. */
DB.statusMigration = {
  project:  { 'Planlama':'Plan', 'Kontrol / Test':'Test/Kabul', 'Teslim Sürecinde':'Teslim', 'Askıda':'Beklemede' },
  contract: { 'Gecikti':'Aktif', 'İptal':'İptal Edildi' },
  quote:    { 'Teklif hazırlanıyor':'Taslak', 'İletildi':'Gönderildi', 'Müşteri değerlendirmesinde':'Müşteri İncelemesi', 'Revize teklif':'Müzakere/Revizyon' },
  invoice:  { 'Gecikti':'Ödenmedi + gecikti:true' },
  bug:      { 'Açık':'Yeni' },
  ticket:   { 'Çalışılıyor':'Devam ediyor', 'Kapatıldı':'Kapandı', 'Müşteri bekleniyor':'Devam ediyor' },
  purchase: { 'Onay bekliyor':'Onaya Gönderildi', 'Sipariş verildi':'Sipariş', 'Teslim alındı':'Tam Teslim' },
  delivery: { 'Planlandı':'Taslak', 'Onaylandı':'Kabul', 'Gecikti':'Müşteriye Gönderildi' },
  change:   { 'Değerlendiriliyor':'Etki Analizi', 'Onay bekliyor':'İç Onay', 'Onaylandı':'Onaylandı', 'Reddedildi':'Reddedildi' },
  request:  { 'Bekliyor':'Gönderildi', 'Devam ediyor':'Göreve Dönüştürüldü', 'Tamamlandı':'Kabul' },
  /* Sipariş, satın alma zincirinin devamıdır ve aynı sözlüğü paylaşır —
     ayrı kelime kümesi tutmak zincirin iki ucunda iki dil üretirdi. */
  order:    { 'Sipariş verildi':'Sipariş', 'Teslim alındı':'Tam Teslim' },
  /* Personelde taşınan şey bir durum ADI değil, bir EKSEN: yaşam döngüsü tek
     `aktif` boolean'ıydı ve şartname [4.1.4]'ün altı durumundan yalnız ikisini
     ifade edebiliyordu. Anahtar bu yüzden eski durum adı değil eski alanın
     DEĞERİDİR — haritanın biçimi (eski → yeni) korunur, okunuşu değişir.
     ⚠️ `aktif` alanı SİLİNMEDİ: ekranlar hâlâ onu okuyor, iki eksen bir süre
     paralel yaşar. Yön tek yönlüdür — doğru olan `durum`, `aktif` ondan
     türetilebilir (`Ayrıldı`/`Pasif` → false), tersi değil. */
  employee: { 'aktif:true':'Aktif', 'aktif:false':'Pasif' }
};

/* ---- Şartnameye hizalanmış durum sözlükleri --------------------------- */
DB.contractStatuses = ['Taslak','İç İnceleme','Müşteri İncelemesi','İmza','Aktif',
  'Askıda','Yenileme/Zeyil','Tamamlandı','Feshedildi','İptal Edildi'];
DB.quoteStatuses    = ['Taslak','İç Onay','Onaylandı','Gönderildi','Müşteri İncelemesi',
  'Müzakere/Revizyon','Kazanıldı','Kaybedildi','İptal Edildi','Süresi Doldu'];
DB.analysisStatuses = ['Taslak','Hazırlanıyor','Teknik İnceleme','Onay bekliyor','Onaylandı',
  'İade/Revizyon','Reddedildi','İptal Edildi'];
/* Fatura İKİ eksendir (şartname [10.4.5] · ADR P1-05): `belgeDurum` belge
   yaşam döngüsüdür ve geçiş motorundan yazılır; `durum` ÖDEME durumudur ve
   tahsis toplamından TÜRETİLİR — kullanıcı elle yazamaz. */
DB.invoiceDocStatuses = ['Taslak','Onaylandı','Gönderildi','Kabul','Ret','İptal','İade'];
/* Ödeme durumu ÜÇ değerlidir; gecikme AYRI eksendir (`fatura.gecikti`).
   Şartname [10.4.3] `Vadesi Geçti`yi "süreçsel durum" diye ayırıyor —
   ödeme durumuyla aynı alanda tutmak kısmi ödeme bilgisini yutuyordu. */
DB.invoicePayStatuses = ['Ödenmedi','Kısmi Ödendi','Ödendi'];
DB.purchaseStatuses = ['Taslak','Onaya Gönderildi','İnceleme','Onaylandı','RFQ/Satın Alma',
  'Sipariş','Kısmi Teslim','Tam Teslim','Kapandı','İade','Reddedildi','İptal Edildi'];
DB.deliveryStatuses = ['Taslak','İç Kontrol','Müşteriye Gönderildi','Kabul','Kısmi Kabul',
  'Ret','Revizyon','Kapandı','Geri Çekildi'];
DB.changeStatuses   = ['Taslak','Etki Analizi','İç Onay','Müşteri Onayı','Ticari Onay',
  'Onaylandı','Uygulama','Teslim','Kapandı','Reddedildi','İptal Edildi'];
DB.requestStatuses  = ['Taslak','Gönderildi','İnceleme','Ek Bilgi/Revizyon','Kabul',
  'Reddedildi','İptal','Göreve Dönüştürüldü'];
DB.leaveStatuses    = ['Taslak','Onay bekliyor','Onaylandı','Reddedildi','İptal edildi'];
DB.orderStatuses    = ['Taslak','Sipariş','Kısmi Teslim','Tam Teslim','Kapandı','İade','İptal Edildi'];
/* Personel yaşam döngüsü — şartname [4.1.4]. `İzinli` ve `Pasif` AYNI KADEMEDE
   iki farklı sebeptir ve birleştirilmedi: `İzinli` süresi belli ve dönüşü
   planlı bir yokluktur (izin kaydından doğar), `Pasif` süresi belirsiz bir
   askıya almadır (ücretsiz izin, askerlik, uzun rapor). İkisini tek "çalışmıyor"
   durumuna sıkıştırmak kapasite planlamasında dönüş tarihini yok ederdi. */
DB.employeeStatuses = ['Taslak','Onboarding','Aktif','İzinli','Pasif','Offboarding','Ayrıldı'];

/* Neden kodu sözlüğü — şartname [2.0.6] gerekçeyi neden KODU + açıklama
   olarak istiyor. Serbest metin tek başına yeterli değil; kod raporlanabilir. */
DB.reasonCodes = [
  { kod:'EKSIK_BILGI',   ad:'Eksik bilgi',                 tur:['iade','revizyon'] },
  { kod:'BUTCE',         ad:'Bütçe uygun değil',           tur:['ret','iptal'] },
  { kod:'KAPSAM',        ad:'Kapsam dışı',                 tur:['ret','revizyon'] },
  { kod:'ONCELIK',       ad:'Öncelik değişti',             tur:['iptal','geri'] },
  { kod:'MUSTERI',       ad:'Müşteri talebi',              tur:['iptal','revizyon','geri'] },
  { kod:'TEKNIK',        ad:'Teknik uygun değil',          tur:['ret'] },
  { kod:'MUKERRER',      ad:'Mükerrer kayıt',              tur:['ret','iptal'] },
  { kod:'SURE',          ad:'Süre yetersiz',               tur:['ret','revizyon'] },
  { kod:'YONETICI_IST',  ad:'Yönetici istisnası',          tur:['istisna'] },
  /* ÇIKIŞ NEDENLERİ — şartname [4.1.4]. Ayrı bir sözlük AÇILMADI: neden kodu
     sözlüğü burasıdır ve `tur` ekseni zaten ayırıcıdır. Paralel bir
     `DB.exitReasons` kurmak, aynı işi iki yerde tutmak olurdu.
     `tur:'cikis'` yalnız personel Offboarding geçişinde daralır. */
  { kod:'ISTIFA',        ad:'İstifa',                      tur:['cikis'] },
  { kod:'SOZLESME_BITIS',ad:'Sözleşme süresi doldu',       tur:['cikis'] },
  { kod:'KARSILIKLI',    ad:'Karşılıklı fesih',            tur:['cikis'] },
  { kod:'ISVEREN_FESIH', ad:'İşveren feshi',               tur:['cikis'] },
  { kod:'EMEKLILIK',     ad:'Emeklilik',                   tur:['cikis'] },
  { kod:'STAJ_BITIS',    ad:'Staj süresi tamamlandı',      tur:['cikis'] },
  { kod:'DIGER',         ad:'Diğer (açıklama zorunlu)',    tur:['ret','iade','revizyon','iptal','geri','istisna','cikis'] }
];

/* ---- Geçiş tabloları ------------------------------------------------
   Görev tablosu (`DB.taskTransitions`, work.js) beş oturumdur çalışıyordu
   ve buraya TAŞINMADI — `GV.flow` onu olduğu yerden okur. Kalan 11 varlığın
   tablosu şartname §5.2 · §7.2 · §7.3 · §8.1 · §8.4 · §9.2 · §9.3 · §9.4 ·
   §9.5 · §10.1 · §11.1 metinlerinden kuruldu.                            */
DB.transitions = {

  /* Proje — şartname [5.2.1]/[5.2.2] · kapanış kapısı ADR-04 */
  project:{
    'Plan':            { next:['Başlatma Onayı','İptal Edildi'], yetki:['pm','sahip','genelmudur'], zorunlu:['pm','baslangic','planlananBitis'], etiket:'Başlatma Onayına Gönder', tone:'btn-acc' },
    /* ⚠️ `projeAktif` kapısı HEDEFE bağlıdır. Kaynakta dururken `Başlatma
       Onayı`ndan çıkan ÜÇ hedefi birden engelliyordu — `Plan`a geri dönmeyi
       ve `İptal Edildi`ye gitmeyi de. Yani başlatma koşulunu sağlamayan bir
       proje İPTAL DE EDİLEMİYORDU. Bir işi iptal etmek, onu başlatmaktan
       daha ağır koşula bağlanamaz (aynı sınıf düzeltme: `leave`, `quote`). */
    /* K-32 eki — `projeAktif` HEDEFTEN KENARA indi. Hedefe bağlıyken ölçüldü:
       `Aktif` durumuna ÜÇ kenar giriyor (`Başlatma Onayı` ileri · `Beklemede`
       devam · `Test/Kabul` geri). Kapı "başlatmak için pm/tarih/müşteri/
       sözleşme eksik olmasın" der ve yalnız İLK aktivasyonu ilgilendirir;
       öbür iki kenar zaten bir kez aktif olmuş projenin geri dönüşüdür ve
       kapıya takılıyordu — beklemeye alınmış proje devam ettirilemiyor,
       testten geliştirmeye dönülemiyordu. Kapı doğruydu, bağı geniş kalmıştı. */
    'Başlatma Onayı':  { next:['Aktif','Plan','İptal Edildi'],   yetki:['sahip','genelmudur'],      zorunlu:[], etiket:'Projeyi Başlat', tone:'btn-ok',
                         kenarKapi:{ 'Aktif':{ kapi:'projeAktif', istisnaRol:[] } } },
    'Aktif':           { next:['Test/Kabul','Beklemede','İptal Edildi'], yetki:['pm','sahip'], zorunlu:[], anaHedef:'Test/Kabul', etiket:'Teste Al', tone:'btn-acc' },
    'Beklemede':       { next:['Aktif','İptal Edildi'],          yetki:['pm','sahip'],      zorunlu:[], girisGerekce:true, etiket:'Devam Ettir', tone:'btn-acc' },
    /* K-32 · 1/4 — `projeTeslim` kapısı KAYNAKTAN KENARA taşındı.
       Kapı "açık kritik hata varken teslime alma" der. Kaynağa bağlıyken
       `Test/Kabul → Aktif` kenarını da kesiyordu: testte kritik hata bulunan
       proje geliştirmeye GERİ ALINAMIYORDU — kapının engellemesi gereken şeyin
       tam tersi.
       `girisKapi` ile `Teslim` hedefine taşımak YETMEZ, ölçüldü: `Teslim`e iki
       kenar giriyor (`Test/Kabul` ileri · `Kapanış` geri) ve o zaman kapanıştan
       teslime GERİ DÖNÜŞ kritik hata kapısına takılırdı. Bu yüzden kenara
       bağlandı — engellenen tek iş kaldı: kritik hatayla teslime İLERLEMEK. */
    'Test/Kabul':      { next:['Teslim','Aktif'],                yetki:['pm','sahip'],      zorunlu:[], etiket:'Teslime Al', tone:'btn-acc',
                         kenarKapi:{ 'Teslim':{ kapi:'projeTeslim', istisnaRol:['sahip','genelmudur'] } } },
    'Teslim':          { next:['Kapanış','Test/Kabul'],          yetki:['pm','sahip'],      zorunlu:[], etiket:'Kapanışa Al', tone:'btn-acc' },
    /* K-32 · 2/4 — `projeKapanis` kapısı hedefe taşındı. Kaynağa bağlıyken
       `Kapanış → Teslim` kenarını da kesiyordu: kapanış koşulunu sağlamayan
       proje teslim aşamasına geri döndürülemiyordu, yani eksiği tamamlamak
       için gereken yol kapalıydı.
       Ölçüldü: `Tamamlandı` hedefine TEK kenar giriyor, o yüzden `girisKapi`
       kenarı tam bağlar; `kenarKapi`ye gerek yok. */
    'Kapanış':         { next:['Tamamlandı','Teslim'],           yetki:['pm','sahip','genelmudur'], zorunlu:[], anaHedef:'Tamamlandı', etiket:'Projeyi Tamamla', tone:'btn-ok' },
    'Tamamlandı':      { next:['Arşivlendi'],                    yetki:['sahip','genelmudur'],      zorunlu:[], etiket:'Arşivle', tone:'btn-line',
                         girisKapi:'projeKapanis', istisnaRol:['sahip','genelmudur'] },
    'İptal Edildi':    { next:['Arşivlendi'],                    yetki:['sahip','genelmudur'],      zorunlu:[], gerekce:true, etiket:'Arşivle', tone:'btn-line' },
    'Arşivlendi':      { next:[], terminal:true }
  },

  /* Sözleşme — şartname [8.1.2]/[8.1.3] · aktivasyon kapısı [8.1.6] */
  contract:{
    'Taslak':            { next:['İç İnceleme','İptal Edildi'],            yetki:['satismudur','satistemsilci','sahip','genelmudur'], zorunlu:['musteri','tutar'], etiket:'İç İncelemeye Gönder', tone:'btn-acc' },
    'İç İnceleme':       { next:['Müşteri İncelemesi','Taslak','İptal Edildi'], yetki:['sahip','genelmudur'],    zorunlu:[], etiket:'Müşteriye Gönder', tone:'btn-acc' },
    'Müşteri İncelemesi':{ next:['İmza','İç İnceleme','İptal Edildi'],     yetki:['satismudur','satistemsilci','sahip','genelmudur'], zorunlu:[], etiket:'İmzaya Al', tone:'btn-acc' },
    /* ⚠️ `sozlesmeAktif` kapısı önce KAYNAKTAN HEDEFE, K-32 ekiyle HEDEFTEN
       KENARA taşındı — iki adımlı bir düzeltmenin ikinci adımı.
       Kaynakta dururken `İmza`dan çıkan üç hedefi birden engelliyordu: ödeme
       planı dengesiz bir sözleşme ne aktive edilebiliyor, ne müşteri
       incelemesine geri gönderilebiliyor, NE DE İPTAL EDİLEBİLİYORDU.
       Hedefe taşındıktan sonra ölçüldü: `Aktif` durumuna ÜÇ kenar giriyor ve
       `Askıda → Aktif` kenarı da kapıya takılıyordu — askıya alınmış bir
       sözleşme, bir kez aktive edilmişken, askıdan İNDİRİLEMİYORDU.
       Kapı şimdi İKİ İLERİ KENARA bağlı: ilk aktivasyon (`İmza`) ve zeylin
       yürürlüğe girmesi (`Yenileme/Zeyil`) — ikisi de ödeme planını
       değiştiren kararlardır. Askıdan dönüş serbesttir: geri almak,
       başlatmaktan ağır olamaz. */
    'İmza':              { next:['Aktif','Müşteri İncelemesi','İptal Edildi'], yetki:['sahip','genelmudur'],     zorunlu:['imzaTarihi'], etiket:'Sözleşmeyi Aktive Et', tone:'btn-ok',
                           kenarKapi:{ 'Aktif':{ kapi:'sozlesmeAktif', istisnaRol:[] } } },
    'Aktif':             { next:['Tamamlandı','Askıda','Yenileme/Zeyil','Feshedildi'], yetki:['sahip','genelmudur'], zorunlu:[], anaHedef:'Tamamlandı', etiket:'Tamamlandı İşaretle', tone:'btn-ok' },
    'Askıda':            { next:['Aktif','Feshedildi'],                    yetki:['sahip','genelmudur'],         zorunlu:[], girisGerekce:true, etiket:'Askıyı Kaldır', tone:'btn-acc' },
    'Yenileme/Zeyil':    { next:['Aktif','İptal Edildi'],                  yetki:['sahip','genelmudur'],         zorunlu:[], etiket:'Zeyili Yürürlüğe Al', tone:'btn-ok',
                           kenarKapi:{ 'Aktif':{ kapi:'sozlesmeAktif', istisnaRol:[] } } },
    'Tamamlandı':        { next:[], terminal:true },
    'Feshedildi':        { next:[], terminal:true },
    'İptal Edildi':      { next:[], terminal:true }
  },

  /* Teklif — şartname [7.3.1]/[7.3.2]/[7.3.3] · ADR-18 (icOnay eritildi) */
    /* ⚠️ KAPI HEDEFE TAŞINDI. Eskiden `Taslak` üzerinde `kapi` olarak
       duruyordu ve motor kaynak taraflı kapıyı o durumdan çıkan HER hedefe
       uyguluyordu: bir taslağı İPTAL ETMEK için de onaylı ön analiz
       gerekiyordu. Ölçüldü ve `firsat.js`teki aynı sınıf kusurla birlikte
       kapatıldı; `girisKapi` yalnız `İç Onay` hedefinde çalışır. */
  quote:{
    'Taslak':            { next:['İç Onay','İptal Edildi'],                yetki:['satismudur','satistemsilci','sahip','genelmudur'], zorunlu:['musteri','toplam'], etiket:'İç Onaya Gönder', tone:'btn-acc' },
    'İç Onay':           { next:['Onaylandı','Taslak','İptal Edildi'],     yetki:['sahip','genelmudur'],         zorunlu:[], girisKapi:'teklifOnAnaliz', istisnaRol:['sahip','genelmudur'], etiket:'Onayla', tone:'btn-ok' },
    'Onaylandı':         { next:['Gönderildi','Taslak'],                   yetki:['satismudur','satistemsilci','sahip','genelmudur'], zorunlu:[], etiket:'Müşteriye Gönder', tone:'btn-acc' },
    'Gönderildi':        { next:['Müşteri İncelemesi','Süresi Doldu','İptal Edildi'], yetki:['satismudur','satistemsilci','sahip','genelmudur'], zorunlu:[], anaHedef:'Müşteri İncelemesi', etiket:'İncelemede İşaretle', tone:'btn-line' },
    'Müşteri İncelemesi':{ next:['Kazanıldı','Kaybedildi','Müzakere/Revizyon','Süresi Doldu'], yetki:['satismudur','satistemsilci','sahip','genelmudur'], zorunlu:[], anaHedef:'Kazanıldı', etiket:'Kazanıldı', tone:'btn-ok' },
    /* ⚠️ `Taslak` KENARI KALDIRILDI (K-17). Eskiden revizyon, AYNI kaydı
       taslağa geri çekmekti: içerik üzerine yazılıyor, eski sürüm yok
       oluyordu — `versiyon` sayacı bir geçmiş ANLATIYOR ama karşılığı
       yoktu. Revizyon artık bir geçiş değil, `GV.teklif.revizyonAc`
       ile YENİ KAYITTIR; bu kayıt olduğu yerde kilitlenir. */
    'Müzakere/Revizyon': { next:['Kazanıldı','Kaybedildi'],                yetki:['satismudur','satistemsilci','sahip','genelmudur'], zorunlu:[], anaHedef:'Kazanıldı', etiket:'Kazanıldı', tone:'btn-ok' },
    'Kazanıldı':         { next:[], terminal:true },
    'Kaybedildi':        { next:[], terminal:true, girisGerekce:true },
    'Süresi Doldu':      { next:['Taslak'],                                yetki:['satismudur','satistemsilci','sahip','genelmudur'], zorunlu:[], etiket:'Yeniden Aç', tone:'btn-line' },
    'İptal Edildi':      { next:[], terminal:true }
  },

  /* Ön analiz — şartname [7.2.1]/[7.2.2] */
  analysis:{
    'Taslak':          { next:['Hazırlanıyor','İptal Edildi'],           yetki:['satismudur','satistemsilci','pm','sahip','genelmudur'], zorunlu:['lead','hizmet'], etiket:'Hazırlamaya Başla', tone:'btn-acc' },
    'Hazırlanıyor':    { next:['Teknik İnceleme','İptal Edildi'],        yetki:['satismudur','satistemsilci','pm','sahip','genelmudur'], zorunlu:[], etiket:'Teknik İncelemeye Gönder', tone:'btn-acc' },
    'Teknik İnceleme': { next:['Onay bekliyor','İade/Revizyon','Reddedildi'], yetki:['pm','takimlideri','sahip','genelmudur'], zorunlu:[], etiket:'Onaya Gönder', tone:'btn-acc' },
    'Onay bekliyor':   { next:['Onaylandı','İade/Revizyon','Reddedildi'], yetki:['sahip','genelmudur'],             zorunlu:[], etiket:'Onayla', tone:'btn-ok' },
    'Onaylandı':       { next:['İade/Revizyon'],                          yetki:['sahip','genelmudur'],             zorunlu:[], gerekce:true, etiket:'Revizyona Aç', tone:'btn-line' },
    'İade/Revizyon':   { next:['Hazırlanıyor','İptal Edildi'],            yetki:['satismudur','satistemsilci','pm','sahip','genelmudur'], zorunlu:[], girisGerekce:true, etiket:'Yeniden Hazırla', tone:'btn-acc' },
    'Reddedildi':      { next:[], terminal:true, girisGerekce:true },
    'İptal Edildi':    { next:[], terminal:true, girisGerekce:true }
  },

  /* Fatura BELGE ekseni — ödeme durumu ayrı ve türetilir ([10.4.5]) */
  invoice:{
    'Taslak':    { next:['Onaylandı','İptal'],            yetki:['muhasebe','sahip','genelmudur'], zorunlu:['musteri','toplam'], etiket:'Onayla', tone:'btn-ok' },
    'Onaylandı': { next:['Gönderildi','Taslak','İptal'],  yetki:['muhasebe','sahip','genelmudur'], zorunlu:[], etiket:'Müşteriye Gönder', tone:'btn-acc' },
    'Gönderildi':{ next:['Kabul','Ret','İptal','İade'],   yetki:['muhasebe','sahip','genelmudur'], zorunlu:[], etiket:'Kabul İşaretle', tone:'btn-ok' },
    'Kabul':     { next:['İade'],                          yetki:['muhasebe','sahip','genelmudur'], zorunlu:[], gerekce:true, etiket:'İade Et', tone:'btn-danger-line' },
    'Ret':       { next:['Taslak','İptal'],                yetki:['muhasebe','sahip','genelmudur'], zorunlu:[], girisGerekce:true, etiket:'Taslağa Al', tone:'btn-line' },
    'İptal':     { next:[], terminal:true, girisGerekce:true },
    'İade':      { next:[], terminal:true, girisGerekce:true }
  },

  /* Hata — şartname [9.2.1]/[9.2.2] */
  bug:{
    'Yeni':          { next:['Triage','Reddedildi','Mükerrer'],           yetki:['pm','takimlideri','sahip'], zorunlu:[], etiket:'Triage Et', tone:'btn-acc' },
    'Triage':        { next:['Atandı','Reddedildi','Mükerrer'],           yetki:['pm','takimlideri','sahip'], zorunlu:['sorumlu','siddet','oncelik'], etiket:'Ata', tone:'btn-acc' },
    'Atandı':        { next:['Devam ediyor','Triage'],                    yetki:['sorumlu','pm'],             zorunlu:[], etiket:'Çalışmaya Başla', tone:'btn-acc' },
    'Devam ediyor':  { next:['Düzeltildi','Triage'],                      yetki:['sorumlu','pm'],             zorunlu:[], etiket:'Düzeltildi İşaretle', tone:'btn-ok' },
    'Düzeltildi':    { next:['Yeniden Test'],                             yetki:['sorumlu','pm','takimlideri'], zorunlu:[], etiket:'Yeniden Teste Gönder', tone:'btn-acc' },
    'Yeniden Test':  { next:['Kapandı','Yeniden Açıldı'],                 yetki:['pm','takimlideri','sahip'], zorunlu:[], etiket:'Kapat', tone:'btn-ok' },
    'Yeniden Açıldı':{ next:['Triage'],                                    yetki:['pm','takimlideri','sahip'], zorunlu:[], gerekce:true, etiket:'Triage Et', tone:'btn-acc' },
    'Kapandı':       { next:['Yeniden Açıldı'],                            yetki:['pm','takimlideri','sahip'], zorunlu:[], gerekce:true, etiket:'Yeniden Aç', tone:'btn-line' },
    'Reddedildi':    { next:['Yeniden Açıldı'], girisGerekce:true,              yetki:['pm','sahip'],               zorunlu:[], etiket:'Yeniden Aç', tone:'btn-line' },
    'Mükerrer':      { next:[], terminal:true, girisGerekce:true }
  },

  /* Destek talebi — şartname [9.5.1]/[9.5.2] · ADR-19 (bekleme ayrı eksen) */
  ticket:{
    'Yeni':          { next:['Triage','Kapandı'],                yetki:['destek','pm','sahip'], zorunlu:[], etiket:'Triage Et', tone:'btn-acc' },
    'Triage':        { next:['Atandı'],                          yetki:['destek','pm','sahip'], zorunlu:['sorumlu','oncelik'], etiket:'Ata', tone:'btn-acc' },
    'Atandı':        { next:['Devam ediyor','Triage'],           yetki:['sorumlu','destek','pm'], zorunlu:[], etiket:'Çalışmaya Başla', tone:'btn-acc' },
    'Devam ediyor':  { next:['Çözüldü','Triage'],                yetki:['sorumlu','destek','pm'], zorunlu:['cozumAciklama'], etiket:'Çözüldü İşaretle', tone:'btn-ok' },
    'Çözüldü':       { next:['Müşteri Onayı','Devam ediyor'],    yetki:['sorumlu','destek','pm'], zorunlu:[], etiket:'Müşteri Onayına Gönder', tone:'btn-acc' },
    /* K-32 · 3/4 — `destekKota` kapısı KAYNAKTAN KENARA taşındı.
       Kapı kota düşümünü denetler. Kaynağa bağlıyken `Müşteri Onayı → Devam
       ediyor` kenarını da kesiyordu: müşteri onaylamayıp talebi geri
       gönderdiğinde kota yüzünden talep çalışmaya GERİ ALINAMIYORDU — hiç
       kota harcamayan bir kenar kota kapısına takılıyordu.
       Ölçüldü: `Kapandı` hedefine iki kenar giriyor (`Müşteri Onayı` ·
       `Yeni`); `girisKapi` yeni açılan bir talebi doğrudan kapatmayı da
       kotaya bağlardı. Bu yüzden kenara bağlandı. */
    'Müşteri Onayı': { next:['Kapandı','Devam ediyor'],          yetki:['destek','pm','sahip','musteri'], zorunlu:[], etiket:'Kapat', tone:'btn-ok',
                       kenarKapi:{ 'Kapandı':{ kapi:'destekKota', istisnaRol:[] } } },
    'Kapandı':       { next:['Yeniden Açıldı'],                  yetki:['destek','pm','sahip'], zorunlu:[], gerekce:true, etiket:'Yeniden Aç', tone:'btn-line' },
    'Yeniden Açıldı':{ next:['Triage'],                          yetki:['destek','pm','sahip'], zorunlu:[], etiket:'Triage Et', tone:'btn-acc' }
  },

  /* Satın alma talebi — şartname [10.1.1]–[10.1.4] */
  purchase:{
    'Taslak':          { next:['Onaya Gönderildi','İptal Edildi'],       yetki:['veren','depmudur','operasyon','sahip','genelmudur'], zorunlu:['urun','tahminiMaliyet'], etiket:'Onaya Gönder', tone:'btn-acc' },
    'Onaya Gönderildi':{ next:['İnceleme','Onaylandı','İade','Reddedildi','İptal Edildi'], yetki:['depmudur','operasyon','sahip','genelmudur'], zorunlu:[], etiket:'İncelemeye Al', tone:'btn-acc' },
    'İnceleme':        { next:['Onaylandı','İade','Reddedildi'],         yetki:['depmudur','operasyon','sahip','genelmudur'], zorunlu:[], etiket:'Onayla', tone:'btn-ok' },
    'Onaylandı':       { next:['RFQ/Satın Alma','İptal Edildi'],         yetki:['operasyon','sahip','genelmudur'],  zorunlu:[], etiket:'Teklif Toplamaya Al', tone:'btn-acc' },
    'RFQ/Satın Alma':  { next:['Sipariş','İptal Edildi'],                yetki:['operasyon','sahip','genelmudur'],  zorunlu:[], etiket:'Sipariş Oluştur', tone:'btn-acc' },
    'Sipariş':         { next:['Kısmi Teslim','Tam Teslim','İptal Edildi'], yetki:['operasyon','sahip','genelmudur'], zorunlu:[], etiket:'Teslim Al', tone:'btn-acc' },
    'Kısmi Teslim':    { next:['Tam Teslim','Kapandı'],                  yetki:['operasyon','sahip','genelmudur'],  zorunlu:[], etiket:'Tam Teslim İşaretle', tone:'btn-ok' },
    'Tam Teslim':      { next:['Kapandı'],                                yetki:['operasyon','sahip','genelmudur'],  zorunlu:[], etiket:'Kapat', tone:'btn-ok' },
    'Kapandı':         { next:[], terminal:true },
    'İade':            { next:['Taslak'],                                 yetki:['veren','operasyon','sahip'], zorunlu:[], girisGerekce:true, etiket:'Revize Et', tone:'btn-acc' },
    'Reddedildi':      { next:['Taslak'],                                 yetki:['veren','operasyon','sahip'], zorunlu:[], gerekce:true, girisGerekce:true, etiket:'Revize Et', tone:'btn-line' },
    'İptal Edildi':    { next:[], terminal:true, girisGerekce:true }
  },

  /* İzin — şartname [11.1.1]/[11.1.2] · bakiye kapısı ADR-06 */
  leave:{
    'Taslak':        { next:['Onay bekliyor','İptal edildi'],  yetki:['veren'],            zorunlu:['baslangic','bitis','tur'], etiket:'Onaya Gönder', tone:'btn-acc' },
    /* ⚠️ BAKİYE KAPISI HEDEFE BAĞLIDIR, KAYNAĞA DEĞİL (ölçüldü ve düzeltildi).
       Eskiden `kapi:'izinBakiye'` BURADA, yani `Onay bekliyor` durumundan
       ÇIKAN her hedefte koşuyordu. Sonuç: bakiyesi yetmeyen bir talep ne
       onaylanabiliyor NE REDDEDİLEBİLİYOR NE İPTAL EDİLEBİLİYORDU —
       `IZN-2026-039` (1 gün isteniyor, bakiye 0) üç hedefte de `why:'kapi'`
       alıyor ve defterde sonsuza dek asılı kalıyordu.
       Bakiye yalnız ONAYLAMAYI ilgilendirir: bir talebi reddetmek ya da
       iptal etmek bakiye harcamaz, bakiye İADE eder. Bir işi geri almak ya
       da kaybetmek, onu tamamlamaktan daha ağır koşula bağlanamaz. Kapı
       `girisKapi` ile `Onaylandı` hedefine taşındı (motor bunu destekliyor,
       aynı sınıf düzeltme `quote` tablosunda da yapılmıştı). */
    'Onay bekliyor': { next:['Onaylandı','Reddedildi','İptal edildi'], yetki:['onaylayan','ik','sahip','genelmudur'], zorunlu:[], etiket:'Onayla', tone:'btn-ok' },
    'Onaylandı':     { next:['İptal edildi'],                   yetki:['ik','sahip','genelmudur'],  zorunlu:[], gerekce:true, girisKapi:'izinBakiye', etiket:'İptal Et', tone:'btn-danger-line' },
    'Reddedildi':    { next:[], terminal:true, girisGerekce:true },
    'İptal edildi':  { next:[], terminal:true, girisGerekce:true }
  },

  /* Teslim — şartname [9.4.2]/[9.4.3] · kritik hata kapısı ADR-05 */
  delivery:{
    'Taslak':               { next:['İç Kontrol','Geri Çekildi'],           yetki:['pm','sahip'],  zorunlu:['ad','tarih'], etiket:'İç Kontrole Gönder', tone:'btn-acc' },
    /* K-32 · 4/4 — `teslimKritikHata` kapısı hedefe taşındı. Kaynağa
       bağlıyken `İç Kontrol → Taslak` kenarını da kesiyordu: iç kontrolde
       kritik hata bulunan teslim taslağa GERİ ALINAMIYORDU, yani hatayı
       düzeltmek için gereken yol kapının kendisi tarafından kapatılıyordu.
       Ölçüldü: `Müşteriye Gönderildi` hedefine TEK kenar giriyor (`İç
       Kontrol`), o yüzden `girisKapi` kenarı tam bağlar. */
    'İç Kontrol':           { next:['Müşteriye Gönderildi','Taslak'],       yetki:['pm','sahip'],  zorunlu:[], etiket:'Müşteriye Gönder', tone:'btn-acc' },
    'Müşteriye Gönderildi': { next:['Kabul','Kısmi Kabul','Ret','Geri Çekildi'], yetki:['pm','sahip','musteri'], zorunlu:[], anaHedef:'Kabul', etiket:'Kabul İşaretle', tone:'btn-ok',
                              girisKapi:'teslimKritikHata', istisnaRol:['sahip','genelmudur'] },
    'Kabul':                { next:['Kapandı'],                              yetki:['pm','sahip'],  zorunlu:[], etiket:'Kapat', tone:'btn-ok' },
    'Kısmi Kabul':          { next:['Revizyon','Kapandı'],                   yetki:['pm','sahip'],  zorunlu:[], etiket:'Revizyona Al', tone:'btn-acc' },
    'Ret':                  { next:['Revizyon'],                             yetki:['pm','sahip'],  zorunlu:[], gerekce:true, girisGerekce:true, etiket:'Revizyona Al', tone:'btn-acc' },
    'Revizyon':             { next:['İç Kontrol','Geri Çekildi'],            yetki:['pm','sahip'],  zorunlu:[], etiket:'İç Kontrole Gönder', tone:'btn-acc' },
    'Kapandı':              { next:[], terminal:true },
    'Geri Çekildi':         { next:['Taslak'],                               yetki:['pm','sahip'],  zorunlu:[], girisGerekce:true, etiket:'Taslağa Al', tone:'btn-line' }
  },

  /* Değişiklik talebi — şartname [9.3.2]/[9.3.3] · zeyil ADR-09 */
  change:{
    'Taslak':        { next:['Etki Analizi','İptal Edildi'],       yetki:['pm','sahip','genelmudur'], zorunlu:['baslik'], etiket:'Etki Analizine Al', tone:'btn-acc' },
    'Etki Analizi':  { next:['İç Onay','Reddedildi','İptal Edildi'], yetki:['pm','sahip','genelmudur'], zorunlu:['etkiSure','etkiMaliyet'], etiket:'İç Onaya Gönder', tone:'btn-acc' },
    'İç Onay':       { next:['Müşteri Onayı','Reddedildi','Etki Analizi'], yetki:['pm','sahip','genelmudur'], zorunlu:[], etiket:'Müşteri Onayına Gönder', tone:'btn-acc' },
    'Müşteri Onayı': { next:['Ticari Onay','Reddedildi'],          yetki:['pm','sahip','genelmudur','musteri'], zorunlu:[], etiket:'Ticari Onaya Gönder', tone:'btn-acc' },
    'Ticari Onay':   { next:['Onaylandı','Reddedildi'],            yetki:['sahip','genelmudur','muhasebe'], zorunlu:[], etiket:'Onayla', tone:'btn-ok' },
    'Onaylandı':     { next:['Uygulama'],                           yetki:['pm','sahip','genelmudur'], zorunlu:[], etiket:'Uygulamaya Al', tone:'btn-acc' },
    'Uygulama':      { next:['Teslim'],                             yetki:['pm','sahip'],      zorunlu:[], etiket:'Teslime Al', tone:'btn-acc' },
    'Teslim':        { next:['Kapandı'],                            yetki:['pm','sahip'],      zorunlu:[], etiket:'Kapat', tone:'btn-ok' },
    'Kapandı':       { next:[], terminal:true },
    'Reddedildi':    { next:[], terminal:true, girisGerekce:true },
    'İptal Edildi':  { next:[], terminal:true, girisGerekce:true }
  },

  /* Satın alma siparişi — şartname [10.3.2] satır bazlı kabul */
  order:{
    'Taslak':       { next:['Sipariş','İptal Edildi'],           yetki:['operasyon','sahip','genelmudur'], zorunlu:['tedarikci','toplam'], etiket:'Siparişi Ver', tone:'btn-acc' },
    'Sipariş':      { next:['Kısmi Teslim','Tam Teslim','İptal Edildi'], yetki:['operasyon','sahip','genelmudur'], zorunlu:[], etiket:'Teslim Al', tone:'btn-acc' },
    'Kısmi Teslim': { next:['Tam Teslim','İade','Kapandı'],      yetki:['operasyon','sahip','genelmudur'], zorunlu:[], etiket:'Tam Teslim İşaretle', tone:'btn-ok' },
    'Tam Teslim':   { next:['Kapandı','İade'],                    yetki:['operasyon','sahip','genelmudur'], zorunlu:[], etiket:'Kapat', tone:'btn-ok' },
    'Kapandı':      { next:[], terminal:true },
    'İade':         { next:['Kapandı'],                           yetki:['operasyon','sahip','genelmudur'], zorunlu:[], gerekce:true, girisGerekce:true, etiket:'Kapat', tone:'btn-line' },
    'İptal Edildi': { next:[], terminal:true, girisGerekce:true }
  },

  /* Departman talebi — şartname [8.4.9] · ADR-03 (görevden türer) */
  request:{
    'Taslak':               { next:['Gönderildi','İptal'],                    yetki:['veren'],                    zorunlu:['baslik','talepEdilenDep'], etiket:'Gönder', tone:'btn-acc' },
    'Gönderildi':           { next:['İnceleme','Reddedildi','İptal'],         yetki:['depmudur','pm','sahip','genelmudur'], zorunlu:[], etiket:'İncelemeye Al', tone:'btn-acc' },
    'İnceleme':             { next:['Kabul','Ek Bilgi/Revizyon','Reddedildi'], yetki:['depmudur','pm','sahip','genelmudur'], zorunlu:[], etiket:'Kabul Et', tone:'btn-ok' },
    'Ek Bilgi/Revizyon':    { next:['Gönderildi','İptal'],                    yetki:['veren'],                    zorunlu:[], girisGerekce:true, etiket:'Yeniden Gönder', tone:'btn-acc' },
    'Kabul':                { next:['Göreve Dönüştürüldü'],                   yetki:['depmudur','pm','sahip','genelmudur'], zorunlu:[], etiket:'Göreve Dönüştür', tone:'btn-acc' },
    'Göreve Dönüştürüldü':  { next:[], terminal:true, turetilmis:true },
    'Reddedildi':           { next:['Gönderildi'],                            yetki:['veren'],                    zorunlu:[], gerekce:true, girisGerekce:true, etiket:'Revize Et', tone:'btn-line' },
    'İptal':                { next:[], terminal:true, girisGerekce:true }
  },

  /* PERSONEL YAŞAM DÖNGÜSÜ — şartname [4.1.4] · evrak kapısı [4.2.3]
     -------------------------------------------------------------------
     Ölçülen kusur: personelin tüm yaşam döngüsü TEK `aktif` boolean'ıydı.
     Altı durumdan yalnız ikisi ifade edilebiliyordu; işe alım süreci, izinli
     olma, askıya alınma ve çıkış süreci aynı `false` değerinin içinde
     kayboluyordu. `DB.onboarding` bir SÜREÇ defteri tutuyordu ama personelin
     durumuna hiç dokunmuyordu — iki kayıt yan yana yaşıyor, biri diğerini
     doğrulamıyordu.

     ⚠️ İKİ KAPI HENÜZ YAZILMADI. `personelEvrak` ve `personelZimmet` adları
     burada SÖZLEŞME olarak duruyor; yordamları `GV.gates` içinde (domain.js)
     tanımlanana kadar motor `if(kural.kapi && Gates[kural.kapi])` koşuluyla
     onları SESSİZCE ATLAR. Yani kural yazılıdır ama henüz uygulanmıyor;
     bunu bilerek ve yazılı bırakmak, uygulanmadığını gizlemekten iyidir.

     ✅ GERİ DÖNÜŞ YOLU AÇILDI — K-31 (V2-42). Buradaki eski not "geri dönüş
     yolu yok, bilerek" diyordu ve gerekçesi motorun eksikliğiydi: `kapi` ve
     `zorunlu` yalnız KAYNAK tarafa bağlanabildiği için `Offboarding` üzerine
     konan zimmet kapısı ile çıkış evrakı zorunluluğu, oradan çıkan HER hedefe
     uygulanıyordu. Yani yanlışlıkla çıkış sürecine alınmış bir personeli geri
     döndürmek için ona zimmetli cihazı iade ettirmek ve çıkış tarihini
     doldurmak gerekiyordu. Bu, bir eksikliği iş kuralı gibi sunmaktı.

     Motora `girisKapi` (zaten vardı) ve `girisZorunlu` (K-31'de eklendi)
     bağlandı; ikisi de HEDEFE bağlanır. Artık:
       · `Offboarding → Ayrıldı`  zimmet kapısı + çıkış evrakı ister
       · `Offboarding → Aktif`    yalnız GEREKÇE ister — geri almak, ayrılışı
                                  tamamlamaktan daha ağır koşula bağlı değildir
     `Onboarding` üzerindeki `personelEvrak` kapısı KAYNAKTA KALIR ve bu
     doğrudur: tek hedefi vardır, ayrıca hedef `Aktif`e `İzinli` ve `Pasif`
     durumlarından da gelinir — kapıyı oraya taşımak izinden dönen personelden
     işe giriş evrakı istemek olurdu. Kapı reddeder, ama doğru tarafa konur.

     `İzinli` girişinde gerekçe İSTENMEZ: sebebi izin kaydında (`DB.leaves`)
     zaten yazılıdır, ikinci kez sorulması aynı bilgiyi iki yere yazardı. */
  employee:{
    'Taslak':      { next:['Onboarding'],                       yetki:['ik','sahip','genelmudur'], zorunlu:['girisTarihi','dep','pozisyon'], etiket:'İşe Alım Sürecini Başlat', tone:'btn-acc' },
    'Onboarding':  { next:['Aktif'],                            yetki:['ik','sahip','genelmudur'], zorunlu:[], kapi:'personelEvrak', etiket:'Göreve Başlat', tone:'btn-ok' },
    'Aktif':       { next:['İzinli','Pasif','Offboarding'],     yetki:['ik','sahip','genelmudur'], zorunlu:[], anaHedef:'İzinli', etiket:'İzne Ayır', tone:'btn-line' },
    'İzinli':      { next:['Aktif','Pasif','Offboarding'],      yetki:['ik','sahip','genelmudur'], zorunlu:[], anaHedef:'Aktif', etiket:'İşe Dönüşünü İşle', tone:'btn-ok' },
    'Pasif':       { next:['Aktif','Offboarding'],              yetki:['ik','sahip','genelmudur'], zorunlu:[], girisGerekce:true, anaHedef:'Aktif', etiket:'Yeniden Aktive Et', tone:'btn-ok' },
    /* Çıkış tarihi ve neden kodu personel kartında KALICI alandır (rapor
       edilebilir olsun diye), gerekçe metni ise geçiş kaydında durur.
       `girisGerekce` bu duruma GİRERKEN neden kodu + açıklama ister;
       `zorunlu` ise ayrılışı TAMAMLAMADAN önce iki alanın dolu olmasını. */
    /* K-31: iki hedef. Zimmet kapısı ve çıkış evrakı `Ayrıldı` HEDEFİNE
       bağlıdır, kaynağa değil.
       Gerekçe kaynak tarafta (`gerekce:true`) durur — çünkü `Offboarding`
       durumundan çıkmanın her iki yönü de gerekçe ister ve `Aktif` kuralına
       `girisGerekce` konamaz: `Aktif`e izinden de dönülüyor, orası gerekçe
       istemez. Böylece geri alma (`Aktif`) ile ilerletme (`Ayrıldı`) aynı
       gerekçe koşulunu paylaşır, geri alma daha ağır DEĞİLDİR. */
    'Offboarding': { next:['Ayrıldı','Aktif'],                  yetki:['ik','sahip','genelmudur'], zorunlu:[], gerekce:true, anaHedef:'Ayrıldı', etiket:'Ayrılışı Tamamla', tone:'btn-ok' },
    'Ayrıldı':     { next:[], terminal:true, girisGerekce:true, girisZorunlu:['cikisTarihi','cikisNedenKodu'], girisKapi:'personelZimmet' }
  }
};


/* =====================================================================
   SÜRÜMLENMİŞ ONAY MOTORU — şartname §6.3 (CLOUD TURU)
   ---------------------------------------------------------------------
   Ölçüm (docs/P-cloud-gap-analizi.md [6.3.9]/[6.3.10]): onay tanımı
   `app-ayar-onay.html:155` içinde SAYFA İÇİ bir dizide yaşıyordu, `DB`'ye
   çıkmıyordu, başka modül okuyamıyordu. Daha ağırı: onay kuyruğundaki
   "Onayla" düğmesi yalnız `DB.approvals` satırının durumunu değiştiriyor,
   KAYNAK KAYDA hiç dokunmuyor, adım ilerletmiyor, log yazmıyordu —
   kullanıcı onayladığını sanıyor, talep hâlâ "Onay bekliyor" duruyordu.

   `DB.approvalTypes` onay türünü kaynak varlığa ve hedef duruma bağlar.
   `GV.approval.karar()` ikisini TEK işlemde yürütür.
   ===================================================================== */
DB.approvalTypes = {
  'Satın alma talebi': { entity:'purchase', onay:'Onaylandı',    ret:'Reddedildi', iade:'İade',
                         zincir:'purchaseApprovals', zincirAlan:'talep' },
  'İzin talebi':       { entity:'leave',    onay:'Onaylandı',    ret:'Reddedildi', iade:null },
  'Teklif iç onayı':   { entity:'quote',    onay:'Onaylandı',    ret:'Taslak',     iade:'Taslak' },
  'Görev onayı':       { entity:'task',     onay:'Tamamlandı',   ret:'Revizede',   iade:'Revizede' },
  'Değişiklik talebi': { entity:'change',   onay:'Müşteri Onayı',ret:'Reddedildi', iade:'Etki Analizi' },
  'Ön analiz onayı':   { entity:'analysis', onay:'Onaylandı',    ret:'Reddedildi', iade:'İade/Revizyon' },
  /* Bu ikisinin kaynak varlığı geçiş motorunda YOK: komisyon bir hesap
     kalemidir, timesheet onayı `GV.zaman` içinde satır bazlı yürür. Onay
     kaydı sonuçlanır ama kaynak kayda geçiş uygulanmaz — bu bir eksik değil,
     kayıt tipinin durum makinesi olmadığının dürüst ifadesidir. */
  'Komisyon kazancı':  { entity:null, onay:'Onaylandı', ret:'Reddedildi', iade:null,
                         not:'Komisyon kaydının durum makinesi yok; onay yalnız kuyruk kaydını sonuçlandırır.' },
  'Timesheet onayı':   { entity:null, onay:'Onaylandı', ret:'Reddedildi', iade:null,
                         not:'Zaman çizelgesi onayı satır bazlıdır ve GV.zaman üzerinden yürür.' }
};

/* Onay akış TANIMI — sürümlü. Şartname [6.3.1]: `Taslak → Yayında →
   Kullanımdan Kaldırıldı`. Süreç başlatıldığında sürüm örneğe sabitlenir,
   yönetici şablonu sonradan değiştirse bile çalışan zincir değişmez.

   ⚠️ ADIMIN MUHATABI İKİ EKSENDEDİR — `rol` ile `iliski` AYRI ALANLARDIR
   (K-38 · ADR-R2-38). Ölçülen kusur: iki adım `rol:` alanında 27'lik rol
   sözlüğünde OLMAYAN bir anahtar taşıyordu (`finans` · `yonetici`) ve
   `DB.roleName()` ikisini de çözemiyordu.
     · `finans`   → adımın kendi `ad` alanı 'Muhasebe' yazıyordu ve sözlükteki
                    `muhasebe` rolünün adı da 'Muhasebe'dir; anahtar YANLIŞ
                    yazılmış bir ROL adıydı → `muhasebe` olarak düzeltildi.
     · `yonetici` → adımın `ad` alanı 'Bağlı Yönetici' yazıyor; sözlükte böyle
                    bir rol YOK ve olmamalı. Bu bir rol değil bir İLİŞKİDİR:
                    talebi açan personelin `DB.employees[].yonetici` alanı.
                    `genelmudur`a eşlemek her izin talebini kişinin kendi
                    yöneticisi yerine Genel Müdür'e göndermek olurdu.
   Motorda emsali var: `Flow.yetkili` `sorumlu`/`onaylayan`/`veren`
   anahtarlarını rol değil ilişki olarak çözer ve kendi yorumunda "karıştırmak
   her kullanıcıyı her kaydın sorumlusu yapardı" der. Aynı ayrım burada da
   ALAN ADIYLA yazılıdır: bir adım ya `rol` taşır ya `iliski`, ikisini birden
   taşımaz. Çözen tek yordam `GV.approval.adimMuhatap(adim, kayit)`. */
DB.approvalFlowStatuses = ['Taslak','Yayında','Kullanımdan Kaldırıldı'];
DB.approvalFlows = [
  { kod:'AKS-SAT-1', ad:'Satın alma onay zinciri', tur:'Satın alma talebi', surum:1,
    durum:'Yayında', yururluk:'2026-01-01',
    adimlar:[
      { sira:1, rol:'depmudur',  ad:'Departman Yöneticisi', kosul:'hep',        esik:null,    sla:1 },
      { sira:2, rol:'muhasebe',  ad:'Muhasebe',             kosul:'tutar',      esik:25000,   sla:1 },
      { sira:3, rol:'sahip',     ad:'Şirket Sahibi',        kosul:'tutar',      esik:100000,  sla:2 }
    ] },
  { kod:'AKS-IZN-1', ad:'İzin onay zinciri', tur:'İzin talebi', surum:1,
    durum:'Yayında', yururluk:'2026-01-01',
    adimlar:[
      { sira:1, iliski:'yonetici', ad:'Bağlı Yönetici', kosul:'hep', esik:null, sla:1 },
      { sira:2, rol:'ik',       ad:'İnsan Kaynakları', kosul:'gun',  esik:10,   sla:1 }
    ] },
  { kod:'AKS-TKL-1', ad:'Teklif iç onay zinciri', tur:'Teklif iç onayı', surum:1,
    durum:'Yayında', yururluk:'2026-01-01',
    adimlar:[
      { sira:1, rol:'sahip', ad:'Şirket Sahibi', kosul:'hep', esik:null, sla:1 }
    ] }
];

/* CLOUD TURU · ADR-07 — MAAŞ GEÇMİŞİ.
   Şartname [10.5.2] geçmiş zaman kayıtlarına bugünkü maaşın uygulanmasını
   yasaklıyor ve "oran anlık görüntüsü veya geçerlilik aralığı" istiyor.

   ⚠️ GEÇMİŞ MAAŞ VERİDE YOKTU VE UYDURULMADI. Aşağıdaki satırlar yalnızca
   BUGÜN GÖZLENEN oranı kaydeder (baslangic = DB.today, kaynak = 'gozlem');
   daha erken bir dönem için kayıt YOKTUR. Bu bilerek böyledir: geçmişe
   doğru uydurma maaş yazmak, ölçüm gibi görünen bir kurgu olurdu (L-13).

   Sonuç: Hr.icMaliyet(kod, gecmisTarih) kapsayan kayıt bulamaz, bugünkü
   orana düşer ve guvenilir:false işaretler — ekran bunu söyleyebilir.
   Sessizce bugünü kullanmak, kapatılan hatanın ta kendisiydi.

   İleriye dönük gerçek çözüm oranSnapshot'tır: zaman çizelgesi satırı
   onaylanırken o günün oranı donar ve bir daha değişmez. */
DB.salaryHistory = [
  { personel:'EMP-001', maas:185000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-002', maas:112000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-003', maas:124000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-004', maas:96000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-005', maas:118000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-006', maas:88000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-007', maas:108000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-008', maas:94000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-009', maas:82000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-010', maas:106000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-011', maas:86000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-012', maas:92000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-013', maas:74000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-014', maas:64000, baslangic:DB.today, bitis:null, kaynak:'gozlem' },
  { personel:'EMP-016', maas:22000, baslangic:DB.today, bitis:null, kaynak:'gozlem' }
];


/* =====================================================================
   İŞ TAKVİMİ — şartname [9.5.3] · [11.1.3] · ADR-12 (CLOUD TURU)
   ---------------------------------------------------------------------
   Ölçülen kusur üç yerde aynıydı: hiçbir hesapta tarih bilinci yoktu.
     · SLA `app-destek-detay.html` düz DUVAR SAATİ farkı alıyordu; bir
       talebin `calismaSaati` alanı ("Mesai içi" / "7/24") yalnız etiket
       olarak basılıyor, hesabı hiç yönlendirmiyordu. Cuma 17:00'de açılan
       "mesai içi" bir talep hafta sonu boyunca ihlale düşüyordu.
     · İzin süresi TAKVİM GÜNÜ sayıyordu; hafta sonu ve tatil düşülmüyordu.
     · Tatil listesi kalıcı veri değildi — `app-ayar-sirket.html:82` bunu
       "veri modelinde YOK … varsayımdır" diye yazıyordu.

   ⚠️ DİNİ BAYRAM TARİHLERİ YAZILMADI. Ramazan ve Kurban bayramı hicri
   takvime bağlıdır ve yıldan yıla kayar; kesin olmadığım bir tarihi resmî
   tatil diye yazmak, ölçüm gibi görünen bir kurgu olurdu (L-13). Aşağıda
   yalnız TARİHİ SABİT ulusal bayramlar var. Dini bayramlar ve şirkete özel
   kapanışlar `app-ayar-sirket.html` üzerinden eklenir; `kaynak` alanı
   hangisinin nereden geldiğini söyler. */
DB.holidays = [
  { tarih:'2025-01-01', ad:'Yılbaşı',                                  kaynak:'ulusal' },
  { tarih:'2025-04-23', ad:'Ulusal Egemenlik ve Çocuk Bayramı',        kaynak:'ulusal' },
  { tarih:'2025-05-01', ad:'Emek ve Dayanışma Günü',                   kaynak:'ulusal' },
  { tarih:'2025-05-19', ad:'Atatürk’ü Anma, Gençlik ve Spor Bayramı',  kaynak:'ulusal' },
  { tarih:'2025-07-15', ad:'Demokrasi ve Millî Birlik Günü',           kaynak:'ulusal' },
  { tarih:'2025-08-30', ad:'Zafer Bayramı',                            kaynak:'ulusal' },
  { tarih:'2025-10-29', ad:'Cumhuriyet Bayramı',                       kaynak:'ulusal' },
  { tarih:'2026-01-01', ad:'Yılbaşı',                                  kaynak:'ulusal' },
  { tarih:'2026-04-23', ad:'Ulusal Egemenlik ve Çocuk Bayramı',        kaynak:'ulusal' },
  { tarih:'2026-05-01', ad:'Emek ve Dayanışma Günü',                   kaynak:'ulusal' },
  { tarih:'2026-05-19', ad:'Atatürk’ü Anma, Gençlik ve Spor Bayramı',  kaynak:'ulusal' },
  { tarih:'2026-07-15', ad:'Demokrasi ve Millî Birlik Günü',           kaynak:'ulusal' },
  { tarih:'2026-08-30', ad:'Zafer Bayramı',                            kaynak:'ulusal' },
  { tarih:'2026-10-29', ad:'Cumhuriyet Bayramı',                       kaynak:'ulusal' }
];

/* Mesai penceresi — `DB.company` içindeki gün/saat tanımının makine okunur
   hâli. SLA ve izin hesabı bunu okur; ekranlar artık kendi saatini saymaz. */
DB.workCalendar = {
  gunler:[1,2,3,4,5],              /* Pzt–Cum · 0 = Pazar */
  baslangic:'09:00', bitis:'18:00',
  ogleBaslangic:'12:30', ogleBitis:'13:30',
  saatDilimi:'Europe/Istanbul'
};

/* SLA bekleme politikası — ADR-11. Bekleme SLA'yı hangi durumda durdurur?
   `Müşteri bekleniyor` müşterinin kendi gecikmesidir, sayaç durur.
   `Üçüncü Taraf` gecikmesinde tedarikçi seçimi bizim sorumluluğumuzdadır,
   sayaç DURMAZ — müşteriye karşı muhafazakâr taraf budur.
   Aralıklar her hâlde saklanır ki politika değişirse geçmiş yeniden
   hesaplanabilsin. */
DB.slaWaitPolicy = {
  'Müşteri':          { durdurur:true  },
  'Üçüncü Taraf':     { durdurur:false },
  'Departman':        { durdurur:false },
  'Bilgi':            { durdurur:false },
  'Dosya':            { durdurur:false },
  'Teknik Karar':     { durdurur:false },
  'Yönetici Onayı':   { durdurur:false },
  'Diğer':            { durdurur:false }
};
