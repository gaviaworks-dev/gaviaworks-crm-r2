/* =====================================================================
   GAVIAWORKS CRM — SATIŞ VE MÜŞTERİ VERİSİ
   Referans kaynakları · Yönlendiren kişiler · Müşteri adayları ·
   Müşteriler · Yetkililer · İletişim geçmişi · Ön analizler · Teklifler
   Canonical: LEAD-2026-004 her ekranda aynı değerleri gösterir.
   ===================================================================== */
window.DB = window.DB || {};

/* ---- Referans türleri (PROMPT.md §9 — 17 tür) ------------------------ */
DB.refTypes = ['Mevcut müşteri','Eski müşteri','Personel','Şirket ortağı','İş ortağı','Danışman',
  'Freelancer','Tedarikçi','Harici kişi','Kurumsal firma','Etkinlik','Dijital reklam',
  'Organik arama','Sosyal medya','Web formu','Telefon','E-posta',
  'Destek talebi'];

/* İletişim kanalı sözlüğü (VB-14) — aynı eksen üç yerde farklı tanımlıydı: veride
   üç değer, liste süzgecinde dört, müşteri detayı modalında beşinci bir 'Mesaj'
   vardı (hiçbir kayıtta ve hiçbir sözlükte geçmiyordu). Sözlük olmadığı için her
   ekran kendi listesini yazıyordu. `DB.refTypes` ile aynı desen. */
DB.interactionTypes = ['Toplantı','Telefon','E-posta','Ziyaret'];

/* Süre birimi sözlüğü (VB-17) — `DB.analyses[].sureBirim` için küme yoktu; dört
   kaydın dördü de 'hafta' olduğu için ön analiz formu TEK SEÇENEKLİ bir select
   basmak zorunda kalmıştı, kullanıcı gerçek bir seçim yapamıyordu. */
DB.timeUnits = ['saat','gün','hafta','ay'];

DB.sectors = ['Lojistik','Sağlık','Perakende','Eğitim','İnşaat','Turizm','Üretim','Finans',
  'Enerji','Gıda','Otomotiv','Tekstil','Kamu','Teknoloji','Hukuk','Tarım'];

DB.services = ['Özel Yazılım','Kurumsal Web Sitesi','Web Uygulaması','Mobil Uygulama',
  'Yapay Zekâ Çözümü','Süreç Otomasyonu','CRM / ERP','SaaS Ürünü','API Entegrasyonu',
  'E-ticaret Altyapısı','Dijital Danışmanlık','Bakım ve Destek'];

/* ---- Satış aşamaları (PROMPT.md §8.2 — 15 aşama + kural seti) -------- */
/* ---- Satış aşamaları ve GRUPLARI (REVİZE 14) --------------------------
   15 aşamanın hiçbiri silinmedi (talimat: "mevcut detaylı satış aşamalarını
   sistemden kaldırma"); pano kolonu artık `grup` alanından gelir. Bölüntü
   `sira` ekseninden, dokümanın altı grubuna birebir:
     1–3 Yeni / Kalifikasyon · 4–6 Analiz · 7–9 Teklif ·
     10–11 Pazarlık · 12 Sözleşme · 13–15 Sonuç
   Tablo sekmelerindeki üçlü bölüntü (`erken`/`analiz`/`kapanis`) de artık bu
   alandan besleniyor — iki yerde iki bölüntü yaşamaz. */
DB.pipelineStages = [
  { key:'Yeni talep',              sira:1, grup:'Yeni / Kalifikasyon',  olasilik:5,   maxGun:2,  sorumlu:'Satış temsilcisi', beklenen:'İlk temas kaydı',         belge:'—',                     onay:false, otoGorev:'İlk aramayı yap' },
  { key:'İlk iletişim',            sira:2, grup:'Yeni / Kalifikasyon',  olasilik:10,  maxGun:3,  sorumlu:'Satış temsilcisi', beklenen:'İhtiyaç özeti',           belge:'Görüşme notu',          onay:false, otoGorev:'Ön görüşme planla' },
  { key:'Ön görüşme',              sira:3, grup:'Yeni / Kalifikasyon',  olasilik:20,  maxGun:5,  sorumlu:'Satış temsilcisi', beklenen:'Kapsam taslağı',          belge:'Toplantı notu',         onay:false, otoGorev:'İhtiyaç analizi başlat' },
  { key:'İhtiyaç analizi',         sira:4, grup:'Analiz',  olasilik:30,  maxGun:7,  sorumlu:'İş analisti',      beklenen:'Gereksinim listesi',      belge:'İhtiyaç formu',         onay:false, otoGorev:'Teknik değerlendirme talebi' },
  { key:'Teknik değerlendirme',    sira:5, grup:'Analiz',  olasilik:40,  maxGun:5,  sorumlu:'Proje yöneticisi', beklenen:'Fizibilite kararı',       belge:'Teknik not',            onay:false, otoGorev:'Ön analiz görevi aç' },
  { key:'Ön analiz hazırlanıyor',  sira:6, grup:'Analiz',  olasilik:50,  maxGun:10, sorumlu:'İş analisti',      beklenen:'Ön analiz dokümanı',      belge:'Ön analiz',             onay:true,  otoGorev:'Efor tahmini çıkar' },
  { key:'Fiyatlandırma',           sira:7, grup:'Teklif',  olasilik:55,  maxGun:4,  sorumlu:'Satış yöneticisi', beklenen:'Maliyet ve fiyat',        belge:'Maliyet tablosu',       onay:true,  otoGorev:'Teklif taslağı hazırla' },
  { key:'Teklif hazırlanıyor',     sira:8, grup:'Teklif',  olasilik:60,  maxGun:3,  sorumlu:'Satış yöneticisi', beklenen:'Teklif dokümanı',         belge:'Teklif',                onay:true,  otoGorev:'İç onaya gönder' },
  { key:'Teklif iletildi',         sira:9, grup:'Teklif',  olasilik:65,  maxGun:7,  sorumlu:'Satış temsilcisi', beklenen:'Müşteri geri dönüşü',     belge:'Teklif PDF',            onay:false, otoGorev:'Takip araması planla' },
  { key:'Müşteri değerlendirmesinde',sira:10, grup:'Pazarlık',olasilik:70, maxGun:10, sorumlu:'Satış temsilcisi', beklenen:'Karar veya revizyon',     belge:'—',                     onay:false, otoGorev:'Hatırlatma gönder' },
  { key:'Revize teklif',           sira:11, grup:'Pazarlık', olasilik:75,  maxGun:5,  sorumlu:'Satış yöneticisi', beklenen:'Revize teklif',           belge:'Teklif v2',             onay:true,  otoGorev:'Revizyonu ilet' },
  { key:'Sözleşme aşaması',        sira:12, grup:'Sözleşme', olasilik:90,  maxGun:10, sorumlu:'Şirket sahibi',    beklenen:'İmzalı sözleşme',         belge:'Sözleşme',              onay:true,  otoGorev:'Proje başlatma hazırlığı' },
  { key:'Kazanıldı',               sira:13, grup:'Sonuç', olasilik:100, maxGun:0,  sorumlu:'Proje yöneticisi', beklenen:'Proje açılışı',           belge:'Sözleşme + ödeme planı',onay:false, otoGorev:'Proje kaydı oluştur' },
  { key:'Kaybedildi',              sira:14, grup:'Sonuç', olasilik:0,   maxGun:0,  sorumlu:'Satış yöneticisi', beklenen:'Kayıp nedeni',            belge:'—',                     onay:false, otoGorev:'Kayıp analizi yaz' },
  { key:'Beklemeye alındı',        sira:15, grup:'Sonuç', olasilik:15,  maxGun:60, sorumlu:'Satış temsilcisi', beklenen:'Yeniden aktifleştirme',   belge:'—',                     onay:false, otoGorev:'60 gün sonra hatırlat' }
];

DB.lostReasons = ['Bütçe yetersiz','Rakip tercih edildi','Proje ertelendi','İhtiyaç değişti',
  'İç kaynakla yapıldı','Zamanlama uymadı','İletişim kesildi','Kapsam uyuşmazlığı'];

/* ---- Yönlendiren kişiler (PROMPT.md §9) ------------------------------
   EKSENLER — üçü de ölçülerek doğrulandı (8 kaydın 8'i):
   · `komisyonToplam` = Σ DB.commissions[referans].tutar · `odenen` = Σ durum:'Ödendi'
     · `bekleyen` = komisyonToplam − odenen. Üçü de komisyon kayıtlarından TÜRETİLİR (L-08),
       burada yazılı olmaları ömür boyu kart sayacı olduklarındandır.
   · `donusum` = round(kazanilan / yonlendirme × 100).
   · `yonlendirme` · `kazanilan` · `kaybedilen` · `ciro` **ÖMÜR BOYU** sayaçlardır:
     CRM'deki bağlı kayıt sayısından küçük olamaz, büyük olabilir (sistem öncesi
     yönlendirmeler). Ölçüldü: Σ yonlendirme 45, `DB.leads[].referans` bağı olan
     aday 10; `ciro` 8 kaydın 4'ünde bağlı müşterilerin `toplamCiro` toplamından
     büyük, hiçbirinde küçük değil.
   · `ciro` **NET** eksendedir (KDV hariç) — `DB.customers[].toplamCiro` ile aynı.
     Doğrulama: REF-002 ciro 2.270.000 >= bağlı müşterilerin toplamCiro'su (2.170.000);
     KOM-2026-001 = 640.000 × %5 = 32.000. `sabitBedel` de NET. */
DB.referrers = [
  { kod:'REF-001', ad:'Hakan Demirtaş', tur:'Mevcut müşteri', firma:'Deniz Lojistik A.Ş.', pozisyon:'Bilgi İşlem Müdürü', kontak:'YTK-001',
    tel:'+90 533 100 00 01', eposta:'hakan@denizlojistik.com', sorumlu:'EMP-002',
    yonlendirme:6, kazanilan:3, kaybedilen:1, ciro:1740000, donusum:50, sonYonlendirme:'2026-08-02',
    komisyonModeli:'Ciro yüzdesi', komisyonOrani:5, sabitBedel:0, komisyonToplam:49700, odenen:32000, bekleyen:17700,
    durum:'Aktif', aktif:true, not:'Sektöründe geniş ağı var, düzenli yönlendirme yapıyor.' },
  { kod:'REF-002', ad:'Ayten Berk', tur:'İş ortağı', firma:'Berk Danışmanlık', kontak:null, pozisyon:'Kurucu',
    tel:'+90 533 100 00 02', eposta:'ayten@berkdanismanlik.com', sorumlu:'EMP-002',
    yonlendirme:5, kazanilan:3, kaybedilen:1, ciro:2270000, donusum:60, sonYonlendirme:'2026-07-29',
    komisyonModeli:'Sabit bedel', komisyonOrani:0, sabitBedel:25000, komisyonToplam:50000, odenen:25000, bekleyen:25000,
    durum:'Aktif', aktif:true, not:'Kurumsal dönüşüm projelerinde birlikte çalışıyoruz.' },
  { kod:'REF-003', ad:'Kerem Aydın', tur:'Personel', firma:'Gavia Works', kontak:null, pozisyon:'Genel Müdür',
    tel:'+90 532 000 00 01', eposta:'kerem@gaviaworks.com', sorumlu:'EMP-001',
    yonlendirme:5, kazanilan:4, kaybedilen:0, ciro:2450000, donusum:80, sonYonlendirme:'2026-06-30',
    komisyonModeli:'Yok', komisyonOrani:0, sabitBedel:0, komisyonToplam:0, odenen:0, bekleyen:0,
    durum:'Aktif', aktif:true, not:'Kişisel ağdan gelen talepler.' },
  { kod:'REF-004', ad:'Serdar Kılıç', tur:'Eski müşteri', firma:'Kılıç Tekstil', pozisyon:'Genel Müdür', kontak:'YTK-014',
    tel:'+90 533 100 00 04', eposta:'serdar@kilictekstil.com', sorumlu:'EMP-014',
    yonlendirme:3, kazanilan:2, kaybedilen:1, ciro:1140000, donusum:67, sonYonlendirme:'2026-05-14',
    komisyonModeli:'Ciro yüzdesi', komisyonOrani:3, sabitBedel:0, komisyonToplam:11400, odenen:11400, bekleyen:0,
    durum:'Aktif', aktif:true, not:'2024 e-ticaret projesi müşterimizdi.' },
  { kod:'REF-005', ad:'Web Formu', tur:'Web formu', firma:'gaviaworks.com', kontak:null, pozisyon:'—',
    tel:'—', eposta:'info@gaviaworks.com', sorumlu:'EMP-014',
    yonlendirme:11, kazanilan:2, kaybedilen:6, ciro:420000, donusum:18, sonYonlendirme:'2026-08-01',
    komisyonModeli:'Yok', komisyonOrani:0, sabitBedel:0, komisyonToplam:0, odenen:0, bekleyen:0,
    durum:'Aktif', aktif:true, not:'Site iletişim formu — dönüşüm oranı düşük, nitelik iyileştirilmeli.' },
  { kod:'REF-006', ad:'Linkedin Kampanyası', tur:'Dijital reklam', firma:'—', kontak:null, pozisyon:'—',
    tel:'—', eposta:'—', sorumlu:'EMP-002',
    yonlendirme:8, kazanilan:1, kaybedilen:5, ciro:420000, donusum:13, sonYonlendirme:'2026-07-26',
    komisyonModeli:'Yok', komisyonOrani:0, sabitBedel:0, komisyonToplam:0, odenen:0, bekleyen:0,
    durum:'Aktif', aktif:true, not:'Q3 kampanyası — maliyet/dönüşüm oranı izleniyor.' },
  { kod:'REF-007', ad:'Murat Sezer', tur:'Danışman', firma:'Sezer Yönetim Danışmanlığı', kontak:null, pozisyon:'Yönetici Ortak',
    tel:'+90 533 100 00 07', eposta:'murat@sezerdanismanlik.com', sorumlu:'EMP-002',
    yonlendirme:2, kazanilan:1, kaybedilen:0, ciro:1104000, donusum:50, sonYonlendirme:'2026-07-08',
    komisyonModeli:'Ciro yüzdesi', komisyonOrani:7, sabitBedel:0, komisyonToplam:47600, odenen:0, bekleyen:47600,
    durum:'Aktif', aktif:true, not:'Kurumsal müşterilere ERP dönüşümü öneriyor.' },
  { kod:'REF-008', ad:'Teknoloji Zirvesi 2026', tur:'Etkinlik', firma:'—', kontak:null, pozisyon:'—',
    tel:'—', eposta:'—', sorumlu:'EMP-002',
    yonlendirme:5, kazanilan:0, kaybedilen:2, ciro:0, donusum:0, sonYonlendirme:'2026-04-22',
    komisyonModeli:'Yok', komisyonOrani:0, sabitBedel:0, komisyonToplam:0, odenen:0, bekleyen:0,
    durum:'Pasif', aktif:false, not:'Nisan etkinliği — 3 fırsat hâlâ açık.' }
];

/* ---- Müşteriler ------------------------------------------------------- */
DB.customers = [
  { kod:'MUS-2024-001', unvan:'Deniz Lojistik A.Ş.', kisa:'Deniz Lojistik', sektor:'Lojistik', buyukluk:'250-500',
    durum:'Aktif', risk:'Düşük', sorumlu:'EMP-002', kaynak:'Personel', referans:'REF-003',
    tel:'+90 216 000 00 10', eposta:'info@denizlojistik.com', web:'denizlojistik.com',
    adres:'Ataşehir, İstanbul', vergiNo:'2910384756', vergiDairesi:'Ataşehir',
    ilkKayit:'2024-02-12', sonIletisim:'2026-07-30', sonrakiAksiyon:'Q4 bakım yenilemesi görüşmesi', sonrakiTarih:'2026-08-12',
    projeSayisi:3, aktifProje:0, toplamCiro:2180000, bekleyenTahsilat:18000, memnuniyet:4.6, aktif:true,
    etiketler:['Kurumsal','Bakım paketi','Referans veren'] },
  { kod:'MUS-2024-002', unvan:'Vitalis Sağlık Grubu', kisa:'Vitalis Sağlık', sektor:'Sağlık', buyukluk:'100-250',
    durum:'Aktif', risk:'Orta', sorumlu:'EMP-002', kaynak:'İş ortağı', referans:'REF-002',
    tel:'+90 312 000 00 11', eposta:'bt@vitalissaglik.com', web:'vitalissaglik.com',
    adres:'Çankaya, Ankara', vergiNo:'8471029364', vergiDairesi:'Çankaya',
    ilkKayit:'2024-06-03', sonIletisim:'2026-08-01', sonrakiAksiyon:'Mobil uygulama teslim toplantısı', sonrakiTarih:'2026-08-06',
    projeSayisi:2, aktifProje:1, toplamCiro:1480000, bekleyenTahsilat:316800, memnuniyet:4.1, aktif:true,
    etiketler:['Kurumsal','Mobil','KVKK hassas'] },
  { kod:'MUS-2025-003', unvan:'Anadolu Perakende Ticaret Ltd.', kisa:'Anadolu Perakende', sektor:'Perakende', buyukluk:'50-100',
    durum:'Aktif', risk:'Yüksek', sorumlu:'EMP-014', kaynak:'Eski müşteri', referans:'REF-004',
    tel:'+90 232 000 00 12', eposta:'destek@anadoluperakende.com', web:'anadoluperakende.com',
    adres:'Bornova, İzmir', vergiNo:'5628470193', vergiDairesi:'Bornova',
    ilkKayit:'2025-01-20', sonIletisim:'2026-06-24', sonrakiAksiyon:'Geciken tahsilat görüşmesi', sonrakiTarih:'2026-08-05',
    projeSayisi:2, aktifProje:0, toplamCiro:760000, bekleyenTahsilat:285000, memnuniyet:2.9, aktif:true,
    etiketler:['Riskli','Geciken ödeme'] },
  { kod:'MUS-2025-004', unvan:'Ege Eğitim Kurumları', kisa:'Ege Eğitim', sektor:'Eğitim', buyukluk:'100-250',
    durum:'Aktif', risk:'Düşük', sorumlu:'EMP-002', kaynak:'Mevcut müşteri', referans:'REF-001',
    tel:'+90 232 000 00 13', eposta:'bilgi@egeegitim.k12.tr', web:'egeegitim.k12.tr',
    adres:'Karşıyaka, İzmir', vergiNo:'7301948562', vergiDairesi:'Karşıyaka',
    ilkKayit:'2025-03-14', sonIletisim:'2026-07-28', sonrakiAksiyon:'Yeni dönem modül talebi', sonrakiTarih:'2026-08-14',
    projeSayisi:1, aktifProje:1, toplamCiro:640000, bekleyenTahsilat:0, memnuniyet:4.8, aktif:true,
    etiketler:['Eğitim','Yıllık bakım'] },
  { kod:'MUS-2025-005', unvan:'Marmara Enerji Sistemleri', kisa:'Marmara Enerji', sektor:'Enerji', buyukluk:'500+',
    durum:'Aktif', risk:'Düşük', sorumlu:'EMP-002', kaynak:'Danışman', referans:'REF-007',
    tel:'+90 212 000 00 14', eposta:'it@marmaraenerji.com', web:'marmaraenerji.com',
    adres:'Şişli, İstanbul', vergiNo:'6194837205', vergiDairesi:'Şişli',
    ilkKayit:'2025-07-02', sonIletisim:'2026-08-02', sonrakiAksiyon:'Faz 2 kapsam onayı', sonrakiTarih:'2026-08-07',
    projeSayisi:1, aktifProje:1, toplamCiro:920000, bekleyenTahsilat:184000, memnuniyet:4.4, aktif:true,
    etiketler:['Kurumsal','ERP','Çok fazlı'] },
  { kod:'MUS-2025-006', unvan:'Kılıç Tekstil San. Tic.', kisa:'Kılıç Tekstil', sektor:'Tekstil', buyukluk:'100-250',
    durum:'Pasif', risk:'Orta', sorumlu:'EMP-014', kaynak:'Eski müşteri', referans:'REF-004',
    tel:'+90 224 000 00 15', eposta:'info@kilictekstil.com', web:'kilictekstil.com',
    adres:'Nilüfer, Bursa', vergiNo:'4829103756', vergiDairesi:'Nilüfer',
    ilkKayit:'2024-09-11', sonIletisim:'2026-02-18', sonrakiAksiyon:'Yeniden aktifleştirme araması', sonrakiTarih:'2026-08-20',
    projeSayisi:1, aktifProje:0, toplamCiro:340000, bekleyenTahsilat:0, memnuniyet:3.8, aktif:false,
    etiketler:['E-ticaret','Uyuyan'] },
  { kod:'MUS-2026-007', unvan:'Nova Turizm Yatırımları', kisa:'Nova Turizm', sektor:'Turizm', buyukluk:'50-100',
    durum:'Aktif', risk:'Düşük', sorumlu:'EMP-014', kaynak:'Dijital reklam', referans:'REF-006',
    tel:'+90 242 000 00 16', eposta:'dijital@novaturizm.com', web:'novaturizm.com',
    adres:'Muratpaşa, Antalya', vergiNo:'3947261058', vergiDairesi:'Muratpaşa',
    ilkKayit:'2026-02-09', sonIletisim:'2026-07-31', sonrakiAksiyon:'Rezervasyon modülü demo', sonrakiTarih:'2026-08-08',
    projeSayisi:1, aktifProje:1, toplamCiro:420000, bekleyenTahsilat:151200, memnuniyet:4.2, aktif:true,
    etiketler:['Turizm','Rezervasyon'] },
  { kod:'MUS-2026-008', unvan:'Başkent Hukuk Bürosu', kisa:'Başkent Hukuk', sektor:'Hukuk', buyukluk:'10-50',
    durum:'Potansiyel', risk:'Düşük', sorumlu:'EMP-014', kaynak:'İş ortağı', referans:'REF-002',
    tel:'+90 312 000 00 17', eposta:'iletisim@baskenthukuk.av.tr', web:'baskenthukuk.av.tr',
    adres:'Kızılay, Ankara', vergiNo:'2185639470', vergiDairesi:'Kızılay',
    ilkKayit:'2026-06-15', sonIletisim:'2026-07-27', sonrakiAksiyon:'Teklif sunumu', sonrakiTarih:'2026-08-05',
    projeSayisi:0, aktifProje:0, toplamCiro:0, bekleyenTahsilat:0, memnuniyet:null, aktif:true,
    etiketler:['Potansiyel','Doküman yönetimi'] },
  { kod:'MUS-2026-009', unvan:'Öz Gıda Üretim A.Ş.', kisa:'Öz Gıda', sektor:'Gıda', buyukluk:'250-500',
    durum:'Aktif', risk:'Orta', sorumlu:'EMP-002', kaynak:'Mevcut müşteri', referans:'REF-001',
    tel:'+90 322 000 00 18', eposta:'bt@ozgida.com.tr', web:'ozgida.com.tr',
    adres:'Seyhan, Adana', vergiNo:'9047152386', vergiDairesi:'Seyhan',
    ilkKayit:'2026-04-22', sonIletisim:'2026-07-25', sonrakiAksiyon:'Üretim takip modülü analizi', sonrakiTarih:'2026-08-11',
    projeSayisi:1, aktifProje:0, toplamCiro:295000, bekleyenTahsilat:106200, memnuniyet:4.0, aktif:true,
    etiketler:['Üretim','Otomasyon'] },
  { kod:'MUS-2026-010', unvan:'Trakya Otomotiv Servis', kisa:'Trakya Otomotiv', sektor:'Otomotiv', buyukluk:'10-50',
    durum:'Riskli', risk:'Yüksek', sorumlu:'EMP-014', kaynak:'Web formu', referans:'REF-005',
    tel:'+90 282 000 00 19', eposta:'info@trakyaotomotiv.com', web:'trakyaotomotiv.com',
    adres:'Süleymanpaşa, Tekirdağ', vergiNo:'1573904826', vergiDairesi:'Süleymanpaşa',
    ilkKayit:'2026-03-05', sonIletisim:'2026-05-30', sonrakiAksiyon:'Memnuniyet görüşmesi — eskalasyon', sonrakiTarih:'2026-08-04',
    projeSayisi:1, aktifProje:1, toplamCiro:185000, bekleyenTahsilat:111000, memnuniyet:2.4, aktif:true,
    etiketler:['Riskli','Memnuniyet düşük','Eskalasyon'] },
  { kod:'MUS-2026-011', unvan:'Anka Finans Teknolojileri', kisa:'Anka Finans', sektor:'Finans', buyukluk:'50-100',
    durum:'Aktif', risk:'Düşük', sorumlu:'EMP-002', kaynak:'İş ortağı', referans:'REF-002',
    tel:'+90 216 000 00 20', eposta:'tech@ankafinans.com', web:'ankafinans.com',
    adres:'Kadıköy, İstanbul', vergiNo:'8362509174', vergiDairesi:'Kadıköy',
    ilkKayit:'2026-05-18', sonIletisim:'2026-08-02', sonrakiAksiyon:'AI skorlama POC değerlendirmesi', sonrakiTarih:'2026-08-09',
    projeSayisi:2, aktifProje:1, toplamCiro:690000, bekleyenTahsilat:0, memnuniyet:4.7, aktif:true,
    etiketler:['Fintech','Yapay zekâ','KVKK hassas'] },
  { kod:'MUS-2023-012', unvan:'Karadeniz Tarım Kooperatifi', kisa:'Karadeniz Tarım', sektor:'Tarım', buyukluk:'10-50',
    durum:'Pasif', risk:'Düşük', sorumlu:'EMP-002', kaynak:'Organik arama', referans:null,
    tel:'+90 462 000 00 21', eposta:'info@karadeniztarim.coop', web:'karadeniztarim.coop',
    adres:'Ortahisar, Trabzon', vergiNo:'5320148796', vergiDairesi:'Ortahisar',
    ilkKayit:'2023-11-08', sonIletisim:'2025-12-19', sonrakiAksiyon:'—', sonrakiTarih:null,
    projeSayisi:1, aktifProje:0, toplamCiro:120000, bekleyenTahsilat:0, memnuniyet:3.5, aktif:false, arsiv:true,
    etiketler:['Arşiv'] }
];

/* ---- Müşteri yetkilileri -----------------------------------------------
   KİŞİ KİMLİĞİ EKSENİ (VB-12 · VB-13 — 11. oturumda koda çevrildi):
   Bir müşteri yetkilisini gösteren her alan `YTK-*` **KODU** taşır, ad değil.
   Ad değişince bağ kopmaz; ad tek yerde, bu koleksiyonda tutulur.
     · `DB.tickets[].acan`        → talebi açan yetkili
     · `DB.interactions[].kontak` → görüşülen yetkili (aday görüşmesinde **null**,
                                     ad `DB.leads[].yetkili` alanından okunur)
     · `DB.referrers[].kontak`    → yönlendiren aynı zamanda bir müşteri yetkilisiyse
   Okuma her zaman `DB.contactName(kod)` üzerinden yapılır; ekranlar ad karşılaştırması
   yapmaz. `canon.js` eksen 24 bağların hedefini ve müşteri tutarlılığını doğrular. */
DB.contacts = [
  { kod:'YTK-001', musteri:'MUS-2024-001', ad:'Hakan Demirtaş', pozisyon:'Bilgi İşlem Müdürü', tel:'+90 533 100 00 01', eposta:'hakan@denizlojistik.com', birincil:true, karar:true, aktif:true },
  { kod:'YTK-002', musteri:'MUS-2024-001', ad:'Sibel Yurtsever', pozisyon:'Operasyon Direktörü', tel:'+90 533 100 00 22', eposta:'sibel@denizlojistik.com', birincil:false, karar:true, aktif:true },
  { kod:'YTK-003', musteri:'MUS-2024-002', ad:'Dr. Emine Karataş', pozisyon:'Dijital Dönüşüm Lideri', tel:'+90 533 100 00 23', eposta:'emine@vitalissaglik.com', birincil:true, karar:true, aktif:true },
  { kod:'YTK-004', musteri:'MUS-2024-002', ad:'Volkan Ateş', pozisyon:'BT Sorumlusu', tel:'+90 533 100 00 24', eposta:'volkan@vitalissaglik.com', birincil:false, karar:false, aktif:true },
  { kod:'YTK-005', musteri:'MUS-2025-003', ad:'Cengiz Solmaz', pozisyon:'Genel Müdür', tel:'+90 533 100 00 25', eposta:'cengiz@anadoluperakende.com', birincil:true, karar:true, aktif:true },
  { kod:'YTK-006', musteri:'MUS-2025-004', ad:'Neslihan Öz', pozisyon:'Kurum Müdürü', tel:'+90 533 100 00 26', eposta:'neslihan@egeegitim.k12.tr', birincil:true, karar:true, aktif:true },
  { kod:'YTK-007', musteri:'MUS-2025-005', ad:'Ahmet Vural', pozisyon:'BT Direktörü', tel:'+90 533 100 00 27', eposta:'ahmet@marmaraenerji.com', birincil:true, karar:true, aktif:true },
  { kod:'YTK-008', musteri:'MUS-2025-005', ad:'Gülay Şen', pozisyon:'Süreç Yöneticisi', tel:'+90 533 100 00 28', eposta:'gulay@marmaraenerji.com', birincil:false, karar:false, aktif:true },
  { kod:'YTK-009', musteri:'MUS-2026-007', ad:'Barış Ekinci', pozisyon:'Pazarlama Müdürü', tel:'+90 533 100 00 29', eposta:'baris@novaturizm.com', birincil:true, karar:true, aktif:true },
  { kod:'YTK-010', musteri:'MUS-2026-008', ad:'Av. Selçuk Onaran', pozisyon:'Kurucu Ortak', tel:'+90 533 100 00 30', eposta:'selcuk@baskenthukuk.av.tr', birincil:true, karar:true, aktif:true },
  { kod:'YTK-011', musteri:'MUS-2026-009', ad:'Fadime Çetin', pozisyon:'Üretim Planlama Şefi', tel:'+90 533 100 00 31', eposta:'fadime@ozgida.com.tr', birincil:true, karar:false, aktif:true },
  { kod:'YTK-012', musteri:'MUS-2026-010', ad:'Yusuf Balaban', pozisyon:'İşletme Sahibi', tel:'+90 533 100 00 32', eposta:'yusuf@trakyaotomotiv.com', birincil:true, karar:true, aktif:true },
  { kod:'YTK-013', musteri:'MUS-2026-011', ad:'Elif Şentürk', pozisyon:'CTO', tel:'+90 533 100 00 33', eposta:'elif@ankafinans.com', birincil:true, karar:true, aktif:true },
  { kod:'YTK-014', musteri:'MUS-2025-006', ad:'Serdar Kılıç', pozisyon:'Genel Müdür', tel:'+90 533 100 00 04', eposta:'serdar@kilictekstil.com', birincil:true, karar:true, aktif:false }
];

/* ---- Müşteri adayları (PROMPT.md §8.1 — 28 alan) ---------------------- */
DB.leads = [
  { kod:'LEAD-2026-001', destek:null, firma:'Başkent Hukuk Bürosu', yetkili:'Av. Selçuk Onaran', tel:'+90 312 000 00 17', eposta:'iletisim@baskenthukuk.av.tr',
    sektor:'Hukuk', buyukluk:'10-50', hizmet:'Özel Yazılım', ozet:'Dava dosyası ve müvekkil doküman yönetim sistemi',
    talepTarihi:'2026-06-15', kaynak:'İş ortağı', referans:'REF-002', yonlendiren:'Ayten Berk', sorumlu:'EMP-014',
    butce:450000, kapanisTahmini:'2026-08-25', oncelik:'Yüksek', puan:78, sicaklik:'Sıcak',
    sonIletisim:'2026-07-27', sonrakiAksiyon:'Teklif sunum toplantısı', sonrakiTarih:'2026-08-05',
    asama:'Teklif iletildi', musteri:'MUS-2026-008', kayipNedeni:null, aktif:true,
    etiketler:['Doküman yönetimi','KVKK'], notlar:'Mevcut sistemleri Excel tabanlı. Yıl sonundan önce devreye almak istiyorlar.' },
  { kod:'LEAD-2026-002', destek:null, firma:'Ege Eğitim Kurumları', yetkili:'Neslihan Öz', tel:'+90 232 000 00 13', eposta:'bilgi@egeegitim.k12.tr',
    sektor:'Eğitim', buyukluk:'100-250', hizmet:'Web Uygulaması', ozet:'Veli iletişim portalı ve devamsızlık modülü',
    talepTarihi:'2026-07-02', kaynak:'Mevcut müşteri', referans:'REF-001', yonlendiren:'Hakan Demirtaş', sorumlu:'EMP-002',
    butce:320000, kapanisTahmini:'2026-09-10', oncelik:'Orta', puan:71, sicaklik:'Sıcak',
    sonIletisim:'2026-07-28', sonrakiAksiyon:'Kapsam netleştirme görüşmesi', sonrakiTarih:'2026-08-14',
    asama:'İhtiyaç analizi', musteri:'MUS-2025-004', kayipNedeni:null, aktif:true,
    etiketler:['Mevcut müşteri','Ek modül'], notlar:'Mevcut projemizin üstüne ek modül talebi — entegrasyon kolay.' },
  { kod:'LEAD-2026-003', destek:null, firma:'Poyraz İnşaat Taahhüt', yetkili:'Metin Poyraz', tel:'+90 312 000 00 40', eposta:'metin@poyrazinsaat.com',
    sektor:'İnşaat', buyukluk:'50-100', hizmet:'CRM / ERP', ozet:'Proje takip ve tedarikçi yönetim sistemi',
    talepTarihi:'2026-07-11', kaynak:'Dijital reklam', referans:'REF-006', yonlendiren:'Linkedin Kampanyası', sorumlu:'EMP-014',
    butce:680000, kapanisTahmini:'2026-10-01', oncelik:'Yüksek', puan:64, sicaklik:'Ilık',
    sonIletisim:'2026-07-24', sonrakiAksiyon:'Ön analiz sunumu', sonrakiTarih:'2026-08-06',
    asama:'Ön analiz hazırlanıyor', musteri:null, kayipNedeni:null, aktif:true,
    etiketler:['Yeni müşteri','ERP'], notlar:'Bütçe onayı yönetim kurulundan geçmeli, karar süreci uzun olabilir.' },
  { kod:'LEAD-2026-004', destek:null, firma:'Zirve Market Zinciri', yetkili:'Tuğçe Aslan', tel:'+90 216 000 00 41', eposta:'tugce@zirvemarket.com',
    sektor:'Perakende', buyukluk:'250-500', hizmet:'Mobil Uygulama', ozet:'Sadakat programı ve mobil sipariş uygulaması',
    talepTarihi:'2026-07-19', kaynak:'Web formu', referans:'REF-005', yonlendiren:'Web Formu', sorumlu:'EMP-014',
    butce:540000, kapanisTahmini:'2026-09-20', oncelik:'Yüksek', puan:69, sicaklik:'Sıcak',
    sonIletisim:'2026-07-31', sonrakiAksiyon:'Teknik değerlendirme toplantısı', sonrakiTarih:'2026-08-04',
    asama:'Teknik değerlendirme', musteri:null, kayipNedeni:null, aktif:true,
    etiketler:['Mobil','Sadakat'], notlar:'iOS + Android, mevcut POS entegrasyonu kritik.' },
  { kod:'LEAD-2026-005', destek:null, firma:'Anka Finans Teknolojileri', yetkili:'Elif Şentürk', tel:'+90 216 000 00 20', eposta:'elif@ankafinans.com',
    sektor:'Finans', buyukluk:'50-100', hizmet:'Yapay Zekâ Çözümü', ozet:'Kredi başvurusu ön skorlama modeli ve panel',
    talepTarihi:'2026-05-18', kaynak:'İş ortağı', referans:'REF-002', yonlendiren:'Ayten Berk', sorumlu:'EMP-002',
    butce:530000, kapanisTahmini:'2026-06-30', oncelik:'Yüksek', puan:92, sicaklik:'Sıcak',
    sonIletisim:'2026-08-02', sonrakiAksiyon:'POC sonuç değerlendirmesi', sonrakiTarih:'2026-08-09',
    asama:'Kazanıldı', musteri:'MUS-2026-011', kayipNedeni:null, aktif:true,
    etiketler:['Yapay zekâ','Kazanıldı'], notlar:'POC başarılı, sözleşme imzalandı, proje devam ediyor.' },
  { kod:'LEAD-2026-006', destek:null, firma:'Batı Sigorta Aracılık', yetkili:'Onur Kaya', tel:'+90 212 000 00 42', eposta:'onur@batisigorta.com',
    sektor:'Finans', buyukluk:'10-50', hizmet:'Süreç Otomasyonu', ozet:'Poliçe yenileme hatırlatma ve teklif otomasyonu',
    talepTarihi:'2026-06-28', kaynak:'Organik arama', referans:null, yonlendiren:'—', sorumlu:'EMP-014',
    butce:180000, kapanisTahmini:'2026-08-15', oncelik:'Orta', puan:52, sicaklik:'Ilık',
    sonIletisim:'2026-07-15', sonrakiAksiyon:'Fiyat revizyonu ilet', sonrakiTarih:'2026-08-01',
    asama:'Müşteri değerlendirmesinde', musteri:null, kayipNedeni:null, aktif:true,
    etiketler:['Otomasyon','Fiyat hassas'], notlar:'Bütçe sınırlı, kapsam daraltma seçeneği sunuldu. 18 gündür hareket yok.' },
  { kod:'LEAD-2026-007', destek:null, firma:'Kuzey Mobilya Sanayi', yetkili:'Recep Duran', tel:'+90 224 000 00 43', eposta:'recep@kuzeymobilya.com',
    sektor:'Üretim', buyukluk:'100-250', hizmet:'E-ticaret Altyapısı', ozet:'B2B bayi sipariş portalı',
    talepTarihi:'2026-04-09', kaynak:'Etkinlik', referans:'REF-008', yonlendiren:'Teknoloji Zirvesi 2026', sorumlu:'EMP-002',
    butce:390000, kapanisTahmini:'2026-06-15', oncelik:'Düşük', puan:31, sicaklik:'Soğuk',
    sonIletisim:'2026-06-02', sonrakiAksiyon:'—', sonrakiTarih:null,
    asama:'Kaybedildi', musteri:null, kayipNedeni:'Rakip tercih edildi', aktif:true,
    etiketler:['Kayıp'], notlar:'Rakip firma daha düşük fiyat verdi. Kalite farkı anlatılamadı.' },
  { kod:'LEAD-2026-008', destek:null, firma:'Öz Gıda Üretim A.Ş.', yetkili:'Fadime Çetin', tel:'+90 322 000 00 18', eposta:'fadime@ozgida.com.tr',
    sektor:'Gıda', buyukluk:'250-500', hizmet:'Süreç Otomasyonu', ozet:'Üretim hattı takip ve fire raporlama',
    talepTarihi:'2026-04-22', kaynak:'Etkinlik', referans:'REF-008', yonlendiren:'Teknoloji Zirvesi 2026', sorumlu:'EMP-002',
    butce:295000, kapanisTahmini:'2026-05-30', oncelik:'Orta', puan:74, sicaklik:'Sıcak',
    sonIletisim:'2026-07-25', sonrakiAksiyon:'Faz 2 kapsamı', sonrakiTarih:'2026-08-11',
    asama:'Kazanıldı', musteri:'MUS-2026-009', kayipNedeni:null, aktif:true,
    etiketler:['Üretim','Kazanıldı'], notlar:'Faz 1 tamamlandı, faz 2 görüşülüyor.' },
  { kod:'LEAD-2026-009', destek:null, firma:'Doğu Turizm Acentesi', yetkili:'Melis Aydoğan', tel:'+90 242 000 00 44', eposta:'melis@doguturizm.com',
    sektor:'Turizm', buyukluk:'10-50', hizmet:'Kurumsal Web Sitesi', ozet:'Çok dilli kurumsal site ve rezervasyon formu',
    talepTarihi:'2026-07-26', kaynak:'Dijital reklam', referans:'REF-006', yonlendiren:'Linkedin Kampanyası', sorumlu:'EMP-014',
    butce:95000, kapanisTahmini:'2026-09-05', oncelik:'Düşük', puan:44, sicaklik:'Ilık',
    sonIletisim:'2026-07-30', sonrakiAksiyon:'İhtiyaç formu gönder', sonrakiTarih:'2026-08-05',
    asama:'İlk iletişim', musteri:null, kayipNedeni:null, aktif:true,
    etiketler:['Web','Küçük bütçe'], notlar:'Küçük ölçekli iş, standart paketle çözülebilir.' },
  { kod:'LEAD-2026-010', destek:null, firma:'Selçuk Makine Endüstri', yetkili:'İbrahim Tekin', tel:'+90 332 000 00 45', eposta:'ibrahim@selcukmakine.com',
    sektor:'Üretim', buyukluk:'50-100', hizmet:'API Entegrasyonu', ozet:'ERP ile e-fatura ve lojistik entegrasyonu',
    talepTarihi:'2026-08-01', kaynak:'Web formu', referans:'REF-005', yonlendiren:'Web Formu', sorumlu:'EMP-014',
    butce:140000, kapanisTahmini:'2026-09-15', oncelik:'Orta', puan:58, sicaklik:'Ilık',
    sonIletisim:'2026-08-01', sonrakiAksiyon:'İlk arama yap', sonrakiTarih:'2026-08-04',
    asama:'Yeni talep', musteri:null, kayipNedeni:null, aktif:true,
    etiketler:['Entegrasyon'], notlar:'Web formundan geldi, henüz aranmadı.' },
  { kod:'LEAD-2026-011', destek:null, firma:'Akdeniz Klinik Grubu', yetkili:'Dr. Sinan Bora', tel:'+90 242 000 00 46', eposta:'sinan@akdenizklinik.com',
    sektor:'Sağlık', buyukluk:'50-100', hizmet:'Mobil Uygulama', ozet:'Hasta randevu ve sonuç takip uygulaması',
    talepTarihi:'2026-08-02', kaynak:'Mevcut müşteri', referans:'REF-001', yonlendiren:'Hakan Demirtaş', sorumlu:'EMP-002',
    butce:410000, kapanisTahmini:'2026-10-10', oncelik:'Yüksek', puan:67, sicaklik:'Sıcak',
    sonIletisim:'2026-08-02', sonrakiAksiyon:'Ön görüşme planla', sonrakiTarih:'2026-08-05',
    asama:'Yeni talep', musteri:null, kayipNedeni:null, aktif:true,
    etiketler:['Sağlık','Mobil','KVKK'], notlar:'Vitalis projesine benzer kapsam — referans gösterilebilir.' },
  { kod:'LEAD-2026-012', destek:null, firma:'Yıldız Lojistik Depolama', yetkili:'Kemal Uz', tel:'+90 216 000 00 47', eposta:'kemal@yildizlojistik.com',
    sektor:'Lojistik', buyukluk:'100-250', hizmet:'Web Uygulaması', ozet:'Depo stok ve sevkiyat takip paneli',
    talepTarihi:'2026-03-12', kaynak:'Telefon', referans:null, yonlendiren:'—', sorumlu:'EMP-002',
    butce:260000, kapanisTahmini:'2026-05-20', oncelik:'Düşük', puan:28, sicaklik:'Soğuk',
    sonIletisim:'2026-04-30', sonrakiAksiyon:'60 gün sonra tekrar ara', sonrakiTarih:'2026-09-01',
    asama:'Beklemeye alındı', musteri:null, kayipNedeni:null, aktif:true,
    etiketler:['Beklemede'], notlar:'Yatırım kararı 2027ye ertelendi.' }
];

/* ---- Ön analizler (PROMPT.md §10) -------------------------------------
   EKSENLER:
   · `tahminiBedel` (VB-16'da `maliyet` adından çevrildi) **iç maliyet DEĞİL**,
     teklifin **indirim öncesi NET satış fiyatıdır** (KDV hariç). Teklife dönmüş üç
     analizin üçünde de `DB.quotes[].araToplam`'a birebir eşit (612.000 · 428.000 ·
     298.000); indirim sonrası netle 2/3, brütle 0/3 tutuyor. Eski ad bir ekranın
     kârlılık hesaplaması yapmasına ve sonucu sessizce yanlış vermesine açıktı;
     **iç maliyet ekseni veride hiç yoktur**, o yüzden kâr marjı hesaplanamaz.
   · `isgucu` **saat** ekseninde girilmiştir (420 · 360 · 260 · 190); birim alan
     adında yazılı olmadığı için ekranlar etikette "saat" yazar (assumptions).
   · `sureBirim` sözlüğü **yoktur** — dört kaydın dördü de `'hafta'`. Sözlük
     doğana kadar form tek seçenekli select basar (VB-17). */
DB.analyses = [
  { kod:'ANL-2026-001', lead:'LEAD-2026-003', firma:'Poyraz İnşaat Taahhüt', hizmet:'CRM / ERP',
    amac:'Proje, tedarikçi ve ilerleme ödemesi süreçlerini tek sistemde toplamak',
    hedefKullanici:'Operasyon ekibi, satın alma, muhasebe, yönetim', rolSayisi:6,
    anaModul:8, altModul:24, web:true, mobil:true, yonetimPaneli:true, musteriPaneli:false,
    entegrasyon:['E-fatura','Logo ERP'], aiOzellik:false, odeme:false, abonelik:false,
    cokluDil:false, cokluSirket:true, raporlama:true, bildirim:true, guvenlik:'Rol bazlı + log', kvkk:true,
    sunucu:'Müşteri bulut hesabı', ekip:5, isgucu:420, sure:16, sureBirim:'hafta',
    riskler:['Kapsam belirsizliği yüksek','Logo entegrasyon dokümantasyonu eksik'],
    belirsiz:['İlerleme ödemesi hesaplama kuralları','Onay hiyerarşisi'],
    beklenen:['Mevcut Excel şablonları','Logo API erişimi','Örnek ödeme planı dosyası'],
    kapsamIci:['Web uygulaması','Yönetim paneli','E-fatura entegrasyonu','Rapor merkezi'],
    kapsamDisi:['Mobil saha uygulaması (Faz 2)','Muhasebe defter kaydı'],
    hazirlayan:'EMP-003', tarih:'2026-07-20', durum:'Onay bekliyor', tahminiBedel:612000, aktif:true },
  { kod:'ANL-2026-002', lead:'LEAD-2026-004', firma:'Zirve Market Zinciri', hizmet:'Mobil Uygulama',
    amac:'Müşteri sadakati ve mobil sipariş kanalı oluşturmak',
    hedefKullanici:'Son tüketici, mağaza personeli, pazarlama', rolSayisi:4,
    anaModul:6, altModul:18, web:false, mobil:true, yonetimPaneli:true, musteriPaneli:false,
    entegrasyon:['POS','Ödeme altyapısı','SMS'], aiOzellik:true, odeme:true, abonelik:false,
    cokluDil:true, cokluSirket:false, raporlama:true, bildirim:true, guvenlik:'OAuth2 + cihaz doğrulama', kvkk:true,
    sunucu:'Gavia yönetimli', ekip:4, isgucu:360, sure:14, sureBirim:'hafta',
    riskler:['POS sağlayıcı API kısıtı','Store onay süreleri'],
    belirsiz:['Sadakat puan kuralları','Kampanya motoru derinliği'],
    beklenen:['POS API dokümanı','Marka kılavuzu','Kampanya örnekleri'],
    kapsamIci:['iOS ve Android uygulama','Yönetim paneli','Push bildirim','Sadakat modülü'],
    kapsamDisi:['Fiziksel kart basımı','Çağrı merkezi entegrasyonu'],
    hazirlayan:'EMP-003', tarih:'2026-07-29', durum:'Hazırlanıyor', tahminiBedel:518000, aktif:true },
  { kod:'ANL-2026-003', lead:'LEAD-2026-001', firma:'Başkent Hukuk Bürosu', hizmet:'Özel Yazılım',
    amac:'Dava dosyalarını ve müvekkil belgelerini merkezî yönetmek',
    hedefKullanici:'Avukatlar, stajyerler, sekreterya', rolSayisi:4,
    anaModul:5, altModul:14, web:true, mobil:false, yonetimPaneli:true, musteriPaneli:true,
    entegrasyon:['UYAP (manuel aktarım)','E-posta'], aiOzellik:true, odeme:false, abonelik:false,
    cokluDil:false, cokluSirket:false, raporlama:true, bildirim:true, guvenlik:'Alan bazlı yetki + şifreli depolama', kvkk:true,
    sunucu:'Yurt içi barındırma zorunlu', ekip:3, isgucu:260, sure:11, sureBirim:'hafta',
    riskler:['Gizlilik gereksinimleri yüksek','UYAP otomatik entegrasyon mümkün değil'],
    belirsiz:['Müvekkil portalı kapsamı'],
    beklenen:['Örnek dosya yapısı','Gizlilik politikası'],
    kapsamIci:['Web uygulaması','Müvekkil portalı','Doküman arama','Duruşma takvimi'],
    kapsamDisi:['UYAP otomatik senkronizasyon','Muhasebe modülü'],
    hazirlayan:'EMP-003', tarih:'2026-07-08', durum:'Onaylandı', tahminiBedel:428000, aktif:true },
  { kod:'ANL-2026-004', lead:'LEAD-2026-002', firma:'Ege Eğitim Kurumları', hizmet:'Web Uygulaması',
    amac:'Veli–okul iletişimini dijitalleştirmek',
    hedefKullanici:'Veliler, öğretmenler, idare', rolSayisi:4,
    anaModul:4, altModul:11, web:true, mobil:false, yonetimPaneli:true, musteriPaneli:true,
    entegrasyon:['Mevcut okul yönetim sistemi','SMS'], aiOzellik:false, odeme:false, abonelik:false,
    cokluDil:false, cokluSirket:false, raporlama:true, bildirim:true, guvenlik:'Rol bazlı', kvkk:true,
    sunucu:'Mevcut sunucu', ekip:3, isgucu:190, sure:8, sureBirim:'hafta',
    riskler:['Mevcut sistemin API desteği sınırlı'],
    belirsiz:['Devamsızlık kuralları'],
    beklenen:['Mevcut sistem erişimi','Veli listesi formatı'],
    kapsamIci:['Veli portalı','Devamsızlık modülü','Duyuru sistemi'],
    kapsamDisi:['Ödeme tahsilatı','Mobil uygulama'],
    hazirlayan:'EMP-003', tarih:'2026-07-30', durum:'Hazırlanıyor', tahminiBedel:298000, aktif:true }
];

/* ---- Teklifler (PROMPT.md §10) ---------------------------------------- */
DB.quotes = [
  { kod:'TKL-2026-014', musteri:'MUS-2026-008', firma:'Başkent Hukuk Bürosu', lead:'LEAD-2026-001', analiz:'ANL-2026-003',
    tarih:'2026-07-22', gecerlilik:'2026-08-21', versiyon:2, hazirlayan:'EMP-002',
    araToplam:428000, indirim:28000, vergiOran:20, vergi:80000, toplam:480000, doviz:'TRY',
    durum:'Gönderildi', icOnay:'Onaylandı', musteriOnay:'Bekliyor', kalemSayisi:6,
    odemePlani:'%40 peşin · %30 ara teslim · %30 teslimde', teslimSuresi:'11 hafta',
    garanti:'6 ay hata garantisi', destek:'12 ay bakım paketi opsiyonel', aktif:true },
  { kod:'TKL-2026-013', musteri:null, firma:'Poyraz İnşaat Taahhüt', lead:'LEAD-2026-003', analiz:'ANL-2026-001',
    tarih:'2026-07-30', gecerlilik:'2026-08-29', versiyon:1, hazirlayan:'EMP-002',
    araToplam:612000, indirim:0, vergiOran:20, vergi:122400, toplam:734400, doviz:'TRY',
    durum:'Taslak', icOnay:'Bekliyor', musteriOnay:'—', kalemSayisi:9,
    odemePlani:'%30 peşin · 4 eşit milestone', teslimSuresi:'16 hafta',
    garanti:'6 ay hata garantisi', destek:'İlk yıl ücretsiz destek', aktif:true },
  { kod:'TKL-2026-012', musteri:'MUS-2026-011', firma:'Anka Finans Teknolojileri', lead:'LEAD-2026-005', analiz:null,
    tarih:'2026-06-12', gecerlilik:'2026-07-12', versiyon:3, hazirlayan:'EMP-002',
    araToplam:530000, indirim:30000, vergiOran:20, vergi:100000, toplam:600000, doviz:'TRY',
    durum:'Kazanıldı', icOnay:'Onaylandı', musteriOnay:'Onaylandı', kalemSayisi:5,
    odemePlani:'%50 peşin · %50 teslimde', teslimSuresi:'10 hafta',
    garanti:'12 ay', destek:'12 ay dahil', aktif:true },
  { kod:'TKL-2026-011', musteri:null, firma:'Batı Sigorta Aracılık', lead:'LEAD-2026-006', analiz:null,
    tarih:'2026-07-05', gecerlilik:'2026-08-04', versiyon:2, hazirlayan:'EMP-014',
    araToplam:180000, indirim:20000, vergiOran:20, vergi:32000, toplam:192000, doviz:'TRY',
    durum:'Müşteri İncelemesi', icOnay:'Onaylandı', musteriOnay:'Bekliyor', kalemSayisi:4,
    odemePlani:'%50 peşin · %50 teslimde', teslimSuresi:'6 hafta',
    garanti:'6 ay', destek:'3 ay dahil', aktif:true },
  { kod:'TKL-2026-010', musteri:null, firma:'Kuzey Mobilya Sanayi', lead:'LEAD-2026-007', analiz:null,
    tarih:'2026-05-14', gecerlilik:'2026-06-13', versiyon:1, hazirlayan:'EMP-002',
    araToplam:390000, indirim:0, vergiOran:20, vergi:78000, toplam:468000, doviz:'TRY',
    durum:'Kaybedildi', icOnay:'Onaylandı', musteriOnay:'Reddedildi', kalemSayisi:7,
    odemePlani:'%40 peşin · %60 teslimde', teslimSuresi:'12 hafta',
    garanti:'6 ay', destek:'6 ay', aktif:true },
  { kod:'TKL-2026-009', musteri:'MUS-2026-009', firma:'Öz Gıda Üretim A.Ş.', lead:'LEAD-2026-008', analiz:null,
    tarih:'2026-05-08', gecerlilik:'2026-06-07', versiyon:1, hazirlayan:'EMP-002',
    araToplam:295000, indirim:0, vergiOran:20, vergi:59000, toplam:354000, doviz:'TRY',
    durum:'Kazanıldı', icOnay:'Onaylandı', musteriOnay:'Onaylandı', kalemSayisi:5,
    odemePlani:'%40 peşin · %30 ara · %30 teslim', teslimSuresi:'9 hafta',
    garanti:'6 ay', destek:'6 ay', aktif:true },
  { kod:'TKL-2026-008', musteri:'MUS-2025-004', firma:'Ege Eğitim Kurumları', lead:'LEAD-2026-002', analiz:'ANL-2026-004',
    tarih:'2026-08-01', gecerlilik:'2026-08-31', versiyon:1, hazirlayan:'EMP-002',
    araToplam:298000, indirim:18000, vergiOran:20, vergi:56000, toplam:336000, doviz:'TRY',
    durum:'Taslak', icOnay:'Bekliyor', musteriOnay:'—', kalemSayisi:4,
    odemePlani:'%50 peşin · %50 teslimde', teslimSuresi:'8 hafta',
    garanti:'6 ay', destek:'Mevcut bakım paketine dahil', aktif:true },
  { kod:'TKL-2025-007', musteri:'MUS-2025-005', firma:'Marmara Enerji Sistemleri', lead:null, analiz:null,
    tarih:'2025-06-20', gecerlilik:'2025-07-20', versiyon:2, hazirlayan:'EMP-002',
    araToplam:980000, indirim:60000, vergiOran:20, vergi:184000, toplam:1104000, doviz:'TRY',
    durum:'Kazanıldı', icOnay:'Onaylandı', musteriOnay:'Onaylandı', kalemSayisi:11,
    odemePlani:'6 eşit milestone', teslimSuresi:'26 hafta',
    garanti:'12 ay', destek:'24 ay bakım', aktif:true, arsiv:true }
];

/* ---- Teklif kalemleri (TKL-2026-014 örnek — detay ekranı için) --------- */
DB.quoteItems = [
  { teklif:'TKL-2026-014', sira:1, kalem:'İş analizi ve UX tasarımı', tur:'Modül', birim:'Paket', miktar:1, birimFiyat:78000, tutar:78000 },
  { teklif:'TKL-2026-014', sira:2, kalem:'Dava dosyası yönetim modülü', tur:'Modül', birim:'Paket', miktar:1, birimFiyat:132000, tutar:132000 },
  { teklif:'TKL-2026-014', sira:3, kalem:'Doküman arşivi ve arama', tur:'Modül', birim:'Paket', miktar:1, birimFiyat:96000, tutar:96000 },
  { teklif:'TKL-2026-014', sira:4, kalem:'Müvekkil portalı', tur:'Modül', birim:'Paket', miktar:1, birimFiyat:74000, tutar:74000 },
  { teklif:'TKL-2026-014', sira:5, kalem:'Yapay zekâ destekli belge arama', tur:'Modül', birim:'Paket', miktar:1, birimFiyat:38000, tutar:38000 },
  { teklif:'TKL-2026-014', sira:6, kalem:'Sunucu kurulumu ve devreye alma', tur:'Hizmet', birim:'Gün', miktar:5, birimFiyat:2000, tutar:10000 }
];

/* ---- İletişim geçmişi -------------------------------------------------- */
DB.interactions = [
  { kod:'ILT-001', musteri:'MUS-2024-001', lead:null, tur:'Toplantı', tarih:'2026-07-30T14:00', kisi:'EMP-002', kontak:'YTK-001',
    konu:'Q4 bakım paketi yenileme', ozet:'Mevcut paketin kapsamı gözden geçirildi, ek SLA talebi var.', sonuc:'Teklif hazırlanacak' },
  { kod:'ILT-002', musteri:'MUS-2024-002', lead:null, tur:'Telefon', tarih:'2026-08-01T10:30', kisi:'EMP-013', kontak:'YTK-003',
    konu:'Mobil uygulama teslim tarihi', ozet:'Teslim 6 Ağustos olarak teyit edildi.', sonuc:'Teslim toplantısı planlandı' },
  { kod:'ILT-003', musteri:'MUS-2025-003', lead:null, tur:'E-posta', tarih:'2026-06-24T09:15', kisi:'EMP-012', kontak:'YTK-005',
    konu:'Geciken fatura hatırlatması', ozet:'FTR-2026-018 için ikinci hatırlatma gönderildi.', sonuc:'Yanıt alınamadı' },
  { kod:'ILT-004', musteri:null, lead:'LEAD-2026-004', tur:'Toplantı', tarih:'2026-07-31T15:30', kisi:'EMP-014', kontak:null,
    konu:'Mobil uygulama kapsamı', ozet:'POS entegrasyonu ve sadakat kuralları konuşuldu.', sonuc:'Teknik değerlendirme başlatıldı' },
  { kod:'ILT-005', musteri:null, lead:'LEAD-2026-001', tur:'Toplantı', tarih:'2026-07-27T11:00', kisi:'EMP-014', kontak:'YTK-010',
    konu:'Teklif sunumu', ozet:'Teklif kalemleri tek tek açıklandı, müvekkil portalı öne çıktı.', sonuc:'Karar için 2 hafta süre istendi' },
  { kod:'ILT-006', musteri:'MUS-2026-010', lead:null, tur:'Telefon', tarih:'2026-05-30T16:45', kisi:'EMP-013', kontak:'YTK-012',
    konu:'Memnuniyetsizlik geri bildirimi', ozet:'Destek yanıt süreleri ve revizyon sayısından şikâyet.', sonuc:'Eskalasyon açıldı' },
  { kod:'ILT-007', musteri:'MUS-2025-005', lead:null, tur:'Toplantı', tarih:'2026-08-02T13:00', kisi:'EMP-003', kontak:'YTK-007',
    konu:'Faz 2 kapsam onayı', ozet:'Faz 2 modülleri önceliklendirildi.', sonuc:'Kapsam dokümanı gönderilecek' },
  { kod:'ILT-008', musteri:'MUS-2026-011', lead:null, tur:'Toplantı', tarih:'2026-08-02T09:00', kisi:'EMP-007', kontak:'YTK-013',
    konu:'AI skorlama POC sonuçları', ozet:'Model doğruluğu %87, kabul kriterinin üzerinde.', sonuc:'Canlıya alma planlanacak' }
];

/* ---- Komisyon kazançları -----------------------------------------------
   NOT: `komisyonToplam` / `kazanimTarihi` ALAN ADLARI hâlâ inşaat terimi taşıyor (VB-04).
   Rename tek turda yapılacak; o güne kadar ekranlarda gösterilen ETİKET
   "Komisyon kazancı" / "Kazanç tarihi"dir, alan adı değil. */
DB.commissions = [
  { kod:'KOM-2026-001', referans:'REF-001', kisi:'Hakan Demirtaş', musteri:'MUS-2025-004', firma:'Ege Eğitim Kurumları',
    ciro:640000, oran:5, tutar:32000, kazanimTarihi:'2026-04-15', durum:'Ödendi', odemeTarihi:'2026-05-02', onay:'Onaylandı', aktif:true },
  { kod:'KOM-2026-002', referans:'REF-002', kisi:'Ayten Berk', musteri:'MUS-2026-011', firma:'Anka Finans Teknolojileri',
    ciro:600000, oran:0, tutar:25000, kazanimTarihi:'2026-06-20', durum:'Ödendi', odemeTarihi:'2026-07-05', onay:'Onaylandı', aktif:true },
  { kod:'KOM-2026-003', referans:'REF-007', kisi:'Murat Sezer', musteri:'MUS-2025-005', firma:'Marmara Enerji Sistemleri',
    ciro:680000, oran:7, tutar:47600, kazanimTarihi:'2026-07-08', durum:'Onay bekliyor', odemeTarihi:null, onay:'Bekliyor', aktif:true },
  { kod:'KOM-2026-004', referans:'REF-001', kisi:'Hakan Demirtaş', musteri:'MUS-2026-009', firma:'Öz Gıda Üretim A.Ş.',
    ciro:354000, oran:5, tutar:17700, kazanimTarihi:'2026-07-18', durum:'Onaylandı', odemeTarihi:null, onay:'Onaylandı', aktif:true },
  { kod:'KOM-2026-005', referans:'REF-002', kisi:'Ayten Berk', musteri:'MUS-2026-008', firma:'Başkent Hukuk Bürosu',
    ciro:0, oran:0, tutar:25000, kazanimTarihi:null, durum:'Bekliyor', odemeTarihi:null, onay:'—', aktif:true },
  { kod:'KOM-2025-006', referans:'REF-004', kisi:'Serdar Kılıç', musteri:'MUS-2025-003', firma:'Anadolu Perakende Ticaret Ltd.',
    ciro:380000, oran:3, tutar:11400, kazanimTarihi:'2025-06-10', durum:'Ödendi', odemeTarihi:'2025-06-28', onay:'Onaylandı', aktif:true, arsiv:true }
];

/* ---- Arama yardımcıları (org.js'teki DB.emp / DB.empName ile aynı desen) ----
   Kişi kimliği ekseni koda çevrildiğinde (VB-12) ekranların ad çözmek için
   `DB.contacts.filter(...)` yazması gerekiyordu; bu, her ekranda tekrarlanan
   bir arama demekti. Tek yerde. */
DB.contact     = function(kod){ return DB.contacts.filter(function(c){ return c.kod === kod; })[0] || null; };
DB.contactName = function(kod){ var c = DB.contact(kod); return c ? c.ad : '—'; };
DB.referrer    = function(kod){ return DB.referrers.filter(function(r){ return r.kod === kod; })[0] || null; };
/* Bir iletişim kaydının muhatabının ADI. `kontak` bir `YTK-*` kodudur; ADAY
   görüşmesinde null olur ve ad adayın kendi `yetkili` alanından okunur — aday
   henüz müşteri olmadığı için `DB.contacts`'ta karşılığı yoktur ve ad ikinci kez
   yazılmaz (VB-12). Beş ekran aynı düşüşü yazmak zorunda kalmasın diye burada. */
DB.interactionContact = function(i){
  if(!i) return '—';
  if(i.kontak) return DB.contactName(i.kontak);
  if(i.lead){
    var l = DB.leads.filter(function(x){ return x.kod === i.lead; })[0];
    if(l && l.yetkili) return l.yetkili;
  }
  return '—';
};
