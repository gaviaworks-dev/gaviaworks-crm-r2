/* =====================================================================
   GAVIAWORKS CRM — FİNANS, İLETİŞİM VE SİSTEM VERİSİ
   Sözleşmeler · Faturalar · Tahsilatlar · Toplantılar · Dokümanlar ·
   Sohbet kanalları · Bildirimler · Duyurular · Otomasyon kuralları
   ===================================================================== */
window.DB = window.DB || {};

/* ---- Sözleşmeler --------------------------------------------------------- */
/* PARA KONVANSİYONU — canonical, tek konvansiyon (lessons L-13):
     `tutar`   = sözleşme bedeli, **KDV HARİÇ (net)**. Tek eksen budur.
     `kdvOran` = KDV yüzdesi · `kdv` = hesaplanan KDV tutarı
     `toplam`  = tutar + kdv → **ekranda gösterilen brüt bedel**
   Ödeme planı taksitleri (`DB.milestones[].odeme`) **net** `tutar`dan türetilir;
   taksitlerin toplamı sözleşmenin `tutar`ına birebir eşittir.
   Fatura: `tutar` net (= milestone `odeme`) · `vergi` KDV · `toplam` brüt.
   Tahsilat `tutar`ı faturanın **brüt** `toplam`ıdır.
   `DB.projects[].sozlesmeTutari` ve `DB.customers[].toplamCiro` de **net** eksendedir.

   ⚠️ `sorumlu` ALANI AÇILDI (REVİZE 12 · 2026-08-07) — 7/7 dolu, KİŞİ KODUDUR
   (ad değil, VB-12 · canon eksen 24). Sözleşme kaydında bugüne kadar kişi
   tipinde tek alan yoktu; sözleşme detayı bunu bir notice ile itiraf edip dört
   kişiyi müşteri ve proje kartından türetip **salt okunur** basıyordu.
   Değer UYDURULMADI, ekranın zaten türettiği sıra korundu:
     proje varsa `DB.projects[].musteriSorumlu` (müşteri ilişkisini yürüten kişi)
     yoksa      `DB.customers[].sorumlu`        (12/12 dolu)
   `DB.projects[].pm` sorumlu kaynağı olarak KULLANILMADI: 14 projenin 14'ü de
   EMP-003, yani tek değerli bir eksen — "sorumlu" ayrımı yapmıyor.
   Sorumlu **operasyonel takipçidir**: imza süreci, bitiş, yenileme, fiyat
   revizyonu ve bakım yenilemesi ona düşer (`app-ayar-onay.html` yenileme
   bildirimi artık role değil bu kişiye gidiyor). */
DB.contracts = [
  { kod:'SZL-2026-021', musteri:'MUS-2026-011', musteriAd:'Anka Finans Teknolojileri', teklif:'TKL-2026-012',
    proje:'PRJ-2026-002', ad:'AI Kredi Skorlama Geliştirme Sözleşmesi',
    tutar:500000, kdvOran:20, kdv:100000, toplam:600000, doviz:'TRY',
    imzaTarihi:'2026-06-20', baslangic:'2026-06-24', bitis:'2026-09-04', durum:'Aktif',
    odemePlani:'%50 peşin · %50 teslimde', garanti:'12 ay', yenileme:false, sorumlu:'EMP-002', aktif:true },
  { kod:'SZL-2026-020', musteri:'MUS-2026-009', musteriAd:'Öz Gıda Üretim A.Ş.', teklif:'TKL-2026-009',
    proje:'PRJ-2026-004', ad:'Üretim Takip Sistemi Sözleşmesi',
    tutar:295000, kdvOran:20, kdv:59000, toplam:354000, doviz:'TRY',
    imzaTarihi:'2026-05-14', baslangic:'2026-05-18', bitis:'2026-07-24', durum:'Tamamlandı',
    odemePlani:'%40 · %30 · %30', garanti:'6 ay', yenileme:false, sorumlu:'EMP-002', aktif:true },
  { kod:'SZL-2025-018', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri', teklif:'TKL-2025-007',
    proje:'PRJ-2026-003', ad:'Mobil Operasyon ERP Faz 1 Sözleşmesi',
    tutar:920000, kdvOran:20, kdv:184000, toplam:1104000, doviz:'TRY',
    imzaTarihi:'2025-09-08', baslangic:'2025-09-15', bitis:'2026-09-30', durum:'Aktif',
    odemePlani:'6 eşit milestone', garanti:'12 ay', yenileme:true, yenilemeTarihi:'2026-09-30', sorumlu:'EMP-002', aktif:true },
  { kod:'SZL-2026-019', musteri:'MUS-2024-002', musteriAd:'Vitalis Sağlık Grubu', teklif:null,
    proje:'PRJ-2026-001', ad:'Hasta Randevu Mobil Uygulama Sözleşmesi',
    tutar:880000, kdvOran:20, kdv:176000, toplam:1056000, doviz:'TRY',
    imzaTarihi:'2026-02-24', baslangic:'2026-03-02', bitis:'2026-08-14', durum:'Aktif',
    odemePlani:'%30 · %30 · %40', garanti:'12 ay', yenileme:false, sorumlu:'EMP-013', aktif:true },
  { kod:'SZL-2026-022', musteri:'MUS-2024-001', musteriAd:'Deniz Lojistik A.Ş.', teklif:null, proje:null,
    ad:'Yıllık Kurumsal Bakım Sözleşmesi',
    tutar:180000, kdvOran:20, kdv:36000, toplam:216000, doviz:'TRY',
    imzaTarihi:'2025-12-20', baslangic:'2026-01-01', bitis:'2026-12-31', durum:'Aktif',
    odemePlani:'Aylık', garanti:'—', yenileme:true, yenilemeTarihi:'2026-12-31', sorumlu:'EMP-002', aktif:true },
  { kod:'SZL-2026-023', musteri:'MUS-2026-007', musteriAd:'Nova Turizm Yatırımları', teklif:null,
    proje:'PRJ-2026-005', ad:'Rezervasyon Portalı Sözleşmesi',
    tutar:420000, kdvOran:20, kdv:84000, toplam:504000, doviz:'TRY',
    imzaTarihi:'2026-06-02', baslangic:'2026-06-08', bitis:'2026-09-18', durum:'Aktif',
    odemePlani:'%30 · %30 · %40', garanti:'6 ay', yenileme:false, sorumlu:'EMP-014', aktif:true },
  { kod:'SZL-2026-024', musteri:'MUS-2026-010', musteriAd:'Trakya Otomotiv Servis', teklif:null,
    proje:'PRJ-2026-006', ad:'Servis Randevu Sistemi Sözleşmesi',
    tutar:185000, kdvOran:20, kdv:37000, toplam:222000, doviz:'TRY',
    imzaTarihi:'2026-03-10', baslangic:'2026-03-16', bitis:'2026-06-26', durum:'Aktif',
    odemePlani:'%50 peşin · %50 teslimde', garanti:'6 ay', yenileme:false, sorumlu:'EMP-013', aktif:true }
];

/* ---- Faturalar ----------------------------------------------------------- */
/* `tutar` NET (= bağlı milestone'un `odeme`si) · `vergi` KDV · `toplam` brüt.
   Bir milestone'a en fazla BİR fatura bağlanır (lessons L-13). */
DB.invoices = [
  { kod:'FTR-2025-011', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri', sozlesme:'SZL-2025-018',
    proje:'PRJ-2026-003', milestone:'MS-010', tarih:'2025-12-01', vade:'2025-12-31',
    tutar:153333, vergi:30667, toplam:184000, durum:'Ödendi', belgeDurum:'Gönderildi', odemeTarihi:'2025-12-24', aktif:true },
  { kod:'FTR-2026-012', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri', sozlesme:'SZL-2025-018',
    proje:'PRJ-2026-003', milestone:'MS-011', tarih:'2026-02-02', vade:'2026-03-04',
    tutar:153333, vergi:30667, toplam:184000, durum:'Ödendi', belgeDurum:'Gönderildi', odemeTarihi:'2026-02-26', aktif:true },
  { kod:'FTR-2026-013', musteri:'MUS-2026-010', musteriAd:'Trakya Otomotiv Servis', sozlesme:'SZL-2026-024',
    proje:'PRJ-2026-006', milestone:'MS-018', tarih:'2026-03-18', vade:'2026-04-17',
    tutar:92500, vergi:18500, toplam:111000, durum:'Ödendi', belgeDurum:'Gönderildi', odemeTarihi:'2026-04-10', aktif:true },
  { kod:'FTR-2026-014', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri', sozlesme:'SZL-2025-018',
    proje:'PRJ-2026-003', milestone:'MS-012', tarih:'2026-03-30', vade:'2026-04-29',
    tutar:153333, vergi:30667, toplam:184000, durum:'Ödendi', belgeDurum:'Gönderildi', odemeTarihi:'2026-04-24', aktif:true },
  { kod:'FTR-2026-018', musteri:'MUS-2025-003', musteriAd:'Anadolu Perakende Ticaret Ltd.', sozlesme:null,
    proje:null, milestone:null, tarih:'2026-05-22', vade:'2026-06-21',
    tutar:237500, vergi:47500, toplam:285000, durum:'Ödenmedi', gecikti:true, belgeDurum:'Gönderildi', odemeTarihi:null, aktif:true },
  { kod:'FTR-2026-019', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri', sozlesme:'SZL-2025-018',
    proje:'PRJ-2026-003', milestone:'MS-013', tarih:'2026-06-01', vade:'2026-07-01',
    tutar:153333, vergi:30667, toplam:184000, durum:'Ödendi', belgeDurum:'Gönderildi', odemeTarihi:'2026-06-26', aktif:true },
  { kod:'FTR-2026-020', musteri:'MUS-2026-009', musteriAd:'Öz Gıda Üretim A.Ş.', sozlesme:'SZL-2026-020',
    proje:'PRJ-2026-004', milestone:'MS-014', tarih:'2026-06-08', vade:'2026-07-08',
    tutar:118000, vergi:23600, toplam:141600, durum:'Ödendi', belgeDurum:'Gönderildi', odemeTarihi:'2026-07-02', aktif:true },
  { kod:'FTR-2026-021', musteri:'MUS-2026-007', musteriAd:'Nova Turizm Yatırımları', sozlesme:'SZL-2026-023',
    proje:'PRJ-2026-005', milestone:'MS-016', tarih:'2026-06-29', vade:'2026-07-29',
    tutar:126000, vergi:25200, toplam:151200, durum:'Ödendi', belgeDurum:'Gönderildi', odemeTarihi:'2026-07-23', aktif:true },
  { kod:'FTR-2026-022', musteri:'MUS-2026-009', musteriAd:'Öz Gıda Üretim A.Ş.', sozlesme:'SZL-2026-020',
    proje:'PRJ-2026-004', milestone:'MS-015', tarih:'2026-07-02', vade:'2026-08-01',
    tutar:88500, vergi:17700, toplam:106200, durum:'Ödendi', belgeDurum:'Gönderildi', odemeTarihi:'2026-07-29', aktif:true },
  { kod:'FTR-2026-024', musteri:'MUS-2024-002', musteriAd:'Vitalis Sağlık Grubu', sozlesme:'SZL-2026-019',
    proje:'PRJ-2026-001', milestone:'MS-001', tarih:'2026-07-10', vade:'2026-08-09',
    tutar:264000, vergi:52800, toplam:316800, durum:'Ödendi', belgeDurum:'Gönderildi', odemeTarihi:'2026-07-28', aktif:true },
  { kod:'FTR-2026-025', musteri:'MUS-2024-002', musteriAd:'Vitalis Sağlık Grubu', sozlesme:'SZL-2026-019',
    proje:'PRJ-2026-001', milestone:'MS-002', tarih:'2026-08-01', vade:'2026-08-31',
    tutar:264000, vergi:52800, toplam:316800, durum:'Ödenmedi', belgeDurum:'Gönderildi', odemeTarihi:null, aktif:true },
  { kod:'FTR-2026-026', musteri:'MUS-2026-011', musteriAd:'Anka Finans Teknolojileri', sozlesme:'SZL-2026-021',
    proje:'PRJ-2026-002', milestone:'MS-003', tarih:'2026-06-24', vade:'2026-07-09',
    tutar:250000, vergi:50000, toplam:300000, durum:'Ödendi', belgeDurum:'Gönderildi', odemeTarihi:'2026-07-04', aktif:true },
  { kod:'FTR-2026-027', musteri:'MUS-2026-010', musteriAd:'Trakya Otomotiv Servis', sozlesme:'SZL-2026-024',
    proje:'PRJ-2026-006', milestone:'MS-008', tarih:'2026-06-26', vade:'2026-07-26',
    tutar:92500, vergi:18500, toplam:111000, durum:'Ödenmedi', gecikti:true, belgeDurum:'Gönderildi', odemeTarihi:null, aktif:true },
  { kod:'FTR-2026-028', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri', sozlesme:'SZL-2025-018',
    proje:'PRJ-2026-003', milestone:'MS-005', tarih:'2026-07-15', vade:'2026-08-14',
    tutar:153333, vergi:30667, toplam:184000, durum:'Ödenmedi', belgeDurum:'Gönderildi', odemeTarihi:null, aktif:true },
  { kod:'FTR-2026-029', musteri:'MUS-2026-007', musteriAd:'Nova Turizm Yatırımları', sozlesme:'SZL-2026-023',
    proje:'PRJ-2026-005', milestone:'MS-007', tarih:'2026-07-20', vade:'2026-08-19',
    tutar:126000, vergi:25200, toplam:151200, durum:'Ödenmedi', belgeDurum:'Gönderildi', odemeTarihi:null, aktif:true },
  { kod:'FTR-2026-030', musteri:'MUS-2026-009', musteriAd:'Öz Gıda Üretim A.Ş.', sozlesme:'SZL-2026-020',
    proje:'PRJ-2026-004', milestone:'MS-009', tarih:'2026-07-24', vade:'2026-08-23',
    tutar:88500, vergi:17700, toplam:106200, durum:'Ödenmedi', belgeDurum:'Gönderildi', odemeTarihi:null, aktif:true },
  { kod:'FTR-2026-031', musteri:'MUS-2024-001', musteriAd:'Deniz Lojistik A.Ş.', sozlesme:'SZL-2026-022',
    proje:null, milestone:null, tarih:'2026-08-01', vade:'2026-08-31',
    tutar:15000, vergi:3000, toplam:18000, durum:'Ödenmedi', belgeDurum:'Gönderildi', odemeTarihi:null, aktif:true }
];

/* ---- Tahsilatlar (gecikme takibi) --------------------------------------- */
/* `tutar` = bağlı faturanın **brüt** `toplam`ı (KDV dahil), `vade` faturanın vadesi. */
DB.payments = [
  { kod:'THS-2025-032', fatura:'FTR-2025-011', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri',
    tutar:184000, vade:'2025-12-31', gecikmeGun:0, durum:'Ödendi', tahsilEdildi:true, sorumlu:'EMP-012',
    sonAksiyon:'Tahsil edildi', sonAksiyonTarihi:'2025-12-24', aktif:true },
  { kod:'THS-2026-033', fatura:'FTR-2026-012', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri',
    tutar:184000, vade:'2026-03-04', gecikmeGun:0, durum:'Ödendi', tahsilEdildi:true, sorumlu:'EMP-012',
    sonAksiyon:'Tahsil edildi', sonAksiyonTarihi:'2026-02-26', aktif:true },
  { kod:'THS-2026-034', fatura:'FTR-2026-013', musteri:'MUS-2026-010', musteriAd:'Trakya Otomotiv Servis',
    tutar:111000, vade:'2026-04-17', gecikmeGun:0, durum:'Ödendi', tahsilEdildi:true, sorumlu:'EMP-012',
    sonAksiyon:'Peşinat tahsil edildi', sonAksiyonTarihi:'2026-04-10', aktif:true },
  { kod:'THS-2026-035', fatura:'FTR-2026-014', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri',
    tutar:184000, vade:'2026-04-29', gecikmeGun:0, durum:'Ödendi', tahsilEdildi:true, sorumlu:'EMP-012',
    sonAksiyon:'Tahsil edildi', sonAksiyonTarihi:'2026-04-24', aktif:true },
  { kod:'THS-2026-036', fatura:'FTR-2026-019', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri',
    tutar:184000, vade:'2026-07-01', gecikmeGun:0, durum:'Ödendi', tahsilEdildi:true, sorumlu:'EMP-012',
    sonAksiyon:'Tahsil edildi', sonAksiyonTarihi:'2026-06-26', aktif:true },
  { kod:'THS-2026-037', fatura:'FTR-2026-020', musteri:'MUS-2026-009', musteriAd:'Öz Gıda Üretim A.Ş.',
    tutar:141600, vade:'2026-07-08', gecikmeGun:0, durum:'Ödendi', tahsilEdildi:true, sorumlu:'EMP-012',
    sonAksiyon:'Tahsil edildi', sonAksiyonTarihi:'2026-07-02', aktif:true },
  { kod:'THS-2026-038', fatura:'FTR-2026-021', musteri:'MUS-2026-007', musteriAd:'Nova Turizm Yatırımları',
    tutar:151200, vade:'2026-07-29', gecikmeGun:0, durum:'Ödendi', tahsilEdildi:true, sorumlu:'EMP-012',
    sonAksiyon:'Tahsil edildi', sonAksiyonTarihi:'2026-07-23', aktif:true },
  { kod:'THS-2026-039', fatura:'FTR-2026-024', musteri:'MUS-2024-002', musteriAd:'Vitalis Sağlık Grubu',
    tutar:316800, vade:'2026-08-09', gecikmeGun:0, durum:'Ödendi', tahsilEdildi:true, sorumlu:'EMP-012',
    sonAksiyon:'Tahsil edildi', sonAksiyonTarihi:'2026-07-28', aktif:true },
  { kod:'THS-2026-040', fatura:'FTR-2026-026', musteri:'MUS-2026-011', musteriAd:'Anka Finans Teknolojileri',
    tutar:300000, vade:'2026-07-09', gecikmeGun:0, durum:'Ödendi', tahsilEdildi:true, sorumlu:'EMP-012',
    sonAksiyon:'Tahsil edildi', sonAksiyonTarihi:'2026-07-04', aktif:true },
  { kod:'THS-2026-041', fatura:'FTR-2026-018', musteri:'MUS-2025-003', musteriAd:'Anadolu Perakende Ticaret Ltd.',
    tutar:285000, vade:'2026-06-21', gecikmeGun:43, durum:'Gecikti', tahsilEdildi:false, sorumlu:'EMP-012',
    sonAksiyon:'2. hatırlatma gönderildi', sonAksiyonTarihi:'2026-06-24', aktif:true },
  { kod:'THS-2026-042', fatura:'FTR-2026-027', musteri:'MUS-2026-010', musteriAd:'Trakya Otomotiv Servis',
    tutar:111000, vade:'2026-07-26', gecikmeGun:8, durum:'Gecikti', tahsilEdildi:false, sorumlu:'EMP-012',
    sonAksiyon:'Teslim tamamlanmadığı için beklemede', sonAksiyonTarihi:'2026-07-29', aktif:true },
  { kod:'THS-2026-043', fatura:'FTR-2026-025', musteri:'MUS-2024-002', musteriAd:'Vitalis Sağlık Grubu',
    tutar:316800, vade:'2026-08-31', gecikmeGun:0, durum:'Bekliyor', tahsilEdildi:false, sorumlu:'EMP-012',
    sonAksiyon:'Vade takibi', sonAksiyonTarihi:'2026-08-01', aktif:true },
  { kod:'THS-2026-044', fatura:'FTR-2026-028', musteri:'MUS-2025-005', musteriAd:'Marmara Enerji Sistemleri',
    tutar:184000, vade:'2026-08-14', gecikmeGun:0, durum:'Bekliyor', tahsilEdildi:false, sorumlu:'EMP-012',
    sonAksiyon:'Vade takibi', sonAksiyonTarihi:'2026-07-16', aktif:true },
  { kod:'THS-2026-045', fatura:'FTR-2026-029', musteri:'MUS-2026-007', musteriAd:'Nova Turizm Yatırımları',
    tutar:151200, vade:'2026-08-19', gecikmeGun:0, durum:'Bekliyor', tahsilEdildi:false, sorumlu:'EMP-012',
    sonAksiyon:'Vade takibi', sonAksiyonTarihi:'2026-07-21', aktif:true },
  { kod:'THS-2026-046', fatura:'FTR-2026-030', musteri:'MUS-2026-009', musteriAd:'Öz Gıda Üretim A.Ş.',
    tutar:106200, vade:'2026-08-23', gecikmeGun:0, durum:'Bekliyor', tahsilEdildi:false, sorumlu:'EMP-012',
    sonAksiyon:'Vade takibi', sonAksiyonTarihi:'2026-07-25', aktif:true },
  { kod:'THS-2026-047', fatura:'FTR-2026-031', musteri:'MUS-2024-001', musteriAd:'Deniz Lojistik A.Ş.',
    tutar:18000, vade:'2026-08-31', gecikmeGun:0, durum:'Bekliyor', tahsilEdildi:false, sorumlu:'EMP-012',
    sonAksiyon:'Aylık bakım faturası — vade takibi', sonAksiyonTarihi:'2026-08-01', aktif:true },
  { kod:'THS-2026-048', fatura:'FTR-2026-022', musteri:'MUS-2026-009', musteriAd:'Öz Gıda Üretim A.Ş.',
    tutar:106200, vade:'2026-08-01', gecikmeGun:0, durum:'Ödendi', tahsilEdildi:true, sorumlu:'EMP-012',
    sonAksiyon:'Tahsil edildi', sonAksiyonTarihi:'2026-07-29', aktif:true }
];

/* ---- Toplantılar (PROMPT.md §19) ---------------------------------------- */
DB.meetings = [
  { kod:'TOP-2026-064', ad:'Vitalis mobil teslim toplantısı', tur:'Müşteri toplantısı', musteri:'MUS-2024-002',
    proje:'PRJ-2026-001', tarih:'2026-08-06T10:00', sure:60, yer:'Online — Meet',
    katilimci:['EMP-003','EMP-008','EMP-013'], disKatilimci:['Dr. Emine Karataş','Volkan Ateş'],
    gundem:['Kalan hatalar','Store yayın planı','Eğitim takvimi'], durum:'Planlandı', aktif:true },
  { kod:'TOP-2026-065', ad:'Zirve Market teknik değerlendirme', tur:'Satış görüşmesi', musteri:null,
    proje:null, tarih:'2026-08-04T14:00', sure:90, yer:'Online — Zoom',
    katilimci:['EMP-014','EMP-003','EMP-008'], disKatilimci:['Tuğçe Aslan'],
    gundem:['POS entegrasyon kapsamı','Sadakat kuralları','Zaman planı'], durum:'Planlandı', aktif:true },
  { kod:'TOP-2026-066', ad:'Haftalık ekip toplantısı', tur:'Departman toplantısı', musteri:null,
    proje:null, tarih:'2026-08-04T09:30', sure:45, yer:'Ofis — Toplantı odası',
    katilimci:['EMP-001','EMP-002','EMP-003','EMP-004','EMP-005','EMP-006','EMP-007','EMP-008','EMP-009','EMP-010'],
    disKatilimci:[], gundem:['Sprint durumu','Riskler','Haftanın öncelikleri'], durum:'Planlandı', aktif:true },
  { kod:'TOP-2026-063', ad:'Marmara Faz 2 kapsam toplantısı', tur:'Proje toplantısı', musteri:'MUS-2025-005',
    proje:'PRJ-2026-003', tarih:'2026-08-02T13:00', sure:90, yer:'Online — Teams',
    katilimci:['EMP-003','EMP-005','EMP-002'], disKatilimci:['Ahmet Vural','Gülay Şen'],
    gundem:['Faz 2 modülleri','Bütçe','Takvim'], durum:'Tamamlandı', aktif:true,
    notlar:'Faz 2 için 3 modül önceliklendirildi. Bütçe onayı Eylül başında netleşecek.' },
  { kod:'TOP-2026-062', ad:'Trakya Otomotiv memnuniyet görüşmesi', tur:'Müşteri toplantısı', musteri:'MUS-2026-010',
    proje:'PRJ-2026-006', tarih:'2026-08-04T16:00', sure:60, yer:'Online — Meet',
    katilimci:['EMP-002','EMP-003','EMP-013'], disKatilimci:['Yusuf Balaban'],
    gundem:['Memnuniyet geri bildirimi','Kapsam mutabakatı','Teslim planı'], durum:'Planlandı', aktif:true },
  { kod:'TOP-2026-061', ad:'Temmuz yönetim değerlendirmesi', tur:'Departman toplantısı', musteri:null,
    proje:null, tarih:'2026-07-28T11:00', sure:120, yer:'Ofis — Toplantı odası',
    katilimci:['EMP-001','EMP-002','EMP-003','EMP-012'], disKatilimci:[],
    gundem:['Temmuz finansal durum','Gecikmiş tahsilatlar','Ağustos öncelikleri'],
    durum:'Tamamlandı', aktif:true,
    notlar:'Gecikmiş tahsilat tutarı kabul edilebilir eşiğin üzerinde; hatırlatma akışı sıkılaştırılacak.' },
  { kod:'TOP-2026-060', ad:'Öz Gıda fire raporu değerlendirme', tur:'Müşteri toplantısı', musteri:'MUS-2026-009',
    proje:'PRJ-2026-004', tarih:'2026-07-22T14:00', sure:60, yer:'Online — Meet',
    katilimci:['EMP-003','EMP-009','EMP-013'], disKatilimci:['Fadime Çetin'],
    gundem:['Fire raporu revizyonu','Kullanıcı eğitimi','Devreye alma sonrası destek'],
    durum:'Tamamlandı', aktif:true,
    notlar:'Fire raporunun kırılım mantığı müşterinin beklentisiyle örtüşmedi, revizyon kararlaştırıldı.' },
  { kod:'TOP-2026-059', ad:'Haftalık geliştirme toplantısı', tur:'Departman toplantısı', musteri:null,
    proje:null, tarih:'2026-07-15T09:30', sure:45, yer:'Ofis — Toplantı odası',
    katilimci:['EMP-003','EMP-004','EMP-005','EMP-006','EMP-007','EMP-008'], disKatilimci:[],
    gundem:['Sprint durumu','Teknik borç','Test kapsamı'], durum:'Tamamlandı', aktif:true,
    notlar:'Test kapsamı hedefin altında kaldı; sprint sonuna kadar kapatılması kararlaştırıldı.' },
  { kod:'TOP-2026-058', ad:'Anka Finans skorlama modeli gözden geçirme', tur:'Proje toplantısı', musteri:'MUS-2026-011',
    proje:'PRJ-2026-002', tarih:'2026-07-08T13:30', sure:90, yer:'Online — Teams',
    katilimci:['EMP-003','EMP-010','EMP-005'], disKatilimci:['Nihan Arslan'],
    gundem:['Model doğruluk sonuçları','Veri hattı','Karar raporlama'], durum:'Tamamlandı', aktif:true,
    notlar:'Model doğruluğu hedefe ulaştı; karar raporlama ekranı bir sonraki sprinte alındı.' }
];

/* ---- Toplantı kararları ve aksiyonları ---------------------------------- */
DB.decisions = [
  { kod:'KRR-2026-101', toplanti:'TOP-2026-063', karar:'Faz 2 kapsamı 3 modülle sınırlandırılacak',
    sorumlu:'EMP-003', termin:'2026-08-15', durum:'Devam ediyor', gorev:null, aktif:true },
  { kod:'KRR-2026-102', toplanti:'TOP-2026-063', karar:'Faz 2 için ayrı teklif hazırlanacak',
    sorumlu:'EMP-002', termin:'2026-08-20', durum:'Bekliyor', gorev:null, aktif:true },
  { kod:'KRR-2026-103', toplanti:'TOP-2026-063', karar:'Rapor merkezi tasarımı öne alınacak',
    sorumlu:'EMP-004', termin:'2026-08-16', durum:'Devam ediyor', gorev:'GRV-2026-106', aktif:true },

  { kod:'KRR-2026-098', toplanti:'TOP-2026-061', karar:'Gecikmiş tahsilatlarda ikinci hatırlatma otomatiğe bağlanacak',
    sorumlu:'EMP-012', termin:'2026-08-08', durum:'Devam ediyor', gorev:null, aktif:true },
  { kod:'KRR-2026-099', toplanti:'TOP-2026-061', karar:'Ağustos ayında yeni işe alım açılmayacak',
    sorumlu:'EMP-001', termin:'2026-08-01', durum:'Tamamlandı', gorev:null, aktif:true },
  { kod:'KRR-2026-100', toplanti:'TOP-2026-061', karar:'Bakım paketi yenilemeleri 60 gün önceden takip edilecek',
    sorumlu:'EMP-002', termin:'2026-08-12', durum:'Devam ediyor', gorev:null, aktif:true },

  { kod:'KRR-2026-096', toplanti:'TOP-2026-060', karar:'Fire raporu kırılımı ürün grubuna göre yeniden yazılacak',
    sorumlu:'EMP-009', termin:'2026-08-07', durum:'Devam ediyor', gorev:'GRV-2026-104', aktif:true },
  { kod:'KRR-2026-097', toplanti:'TOP-2026-060', karar:'Devreye alma sonrası iki oturumluk kullanıcı eğitimi verilecek',
    sorumlu:'EMP-013', termin:'2026-08-14', durum:'Bekliyor', gorev:null, aktif:true },

  { kod:'KRR-2026-094', toplanti:'TOP-2026-059', karar:'Test kapsamı sprint sonuna kadar %70 üzerine çıkarılacak',
    sorumlu:'EMP-008', termin:'2026-08-09', durum:'Devam ediyor', gorev:'GRV-2026-108', aktif:true },
  { kod:'KRR-2026-095', toplanti:'TOP-2026-059', karar:'Teknik borç kalemleri ayrı bir listede toplanacak',
    sorumlu:'EMP-005', termin:'2026-07-25', durum:'Aktif', gorev:null, aktif:true },

  { kod:'KRR-2026-092', toplanti:'TOP-2026-058', karar:'Skorlama modeli mevcut eşikle üretime alınacak',
    sorumlu:'EMP-010', termin:'2026-07-20', durum:'Tamamlandı', gorev:null, aktif:true },
  { kod:'KRR-2026-093', toplanti:'TOP-2026-058', karar:'Karar raporlama ekranı bir sonraki sprinte alınacak',
    sorumlu:'EMP-003', termin:'2026-08-18', durum:'Bekliyor', gorev:null, aktif:true }
];

/* ---- Dokümanlar (PROMPT.md §19) ----------------------------------------- */
DB.documents = [
  { kod:'DOK-2026-201', ad:'Anka Finans Sözleşmesi (imzalı)', tur:'Sözleşme', klasor:'Müşteriler / Anka Finans', arac:null,
    musteri:'MUS-2026-011', proje:'PRJ-2026-002', boyut:'2,4 MB', format:'PDF', versiyon:1,
    yukleyen:'EMP-001', tarih:'2026-06-20', sonKullanma:null, kalanGun:null, gizlilik:'Gizli',
    onay:'Onaylandı', aktif:true },
  { kod:'DOK-2026-202', ad:'Başkent Hukuk Teklifi v2', tur:'Teklif', klasor:'Teklifler / 2026', arac:null,
    musteri:'MUS-2026-008', proje:null, boyut:'860 KB', format:'PDF', versiyon:2,
    yukleyen:'EMP-002', tarih:'2026-07-22', sonKullanma:'2026-08-21', kalanGun:18, gizlilik:'İç kullanım',
    onay:'Onaylandı', aktif:true },
  { kod:'DOK-2026-203', ad:'Poyraz İnşaat Ön Analiz Dokümanı', tur:'Proje analizi', klasor:'Ön Analizler / 2026', arac:null,
    musteri:null, proje:null, boyut:'1,8 MB', format:'PDF', versiyon:1,
    yukleyen:'EMP-003', tarih:'2026-07-20', sonKullanma:null, kalanGun:null, gizlilik:'İç kullanım',
    onay:'Bekliyor', aktif:true },
  { kod:'DOK-2026-204', ad:'Figma Lisans Faturası', tur:'Fatura', klasor:'Finans / Giderler', arac:null,
    musteri:null, proje:null, boyut:'240 KB', format:'PDF', versiyon:1,
    yukleyen:'EMP-012', tarih:'2025-09-01', sonKullanma:'2026-08-31', kalanGun:28, gizlilik:'İç kullanım',
    onay:'Onaylandı', aktif:true },
  /* REVİZE 19 — `arac` alanı açıldı (VB-15 kalıbı): araç detayındaki
     "Evraklar" sekmesi ruhsat/poliçe/muayene belgesini bu bağdan okur.
     Bağ UYDURULMADI: yalnız plakası belgenin ADINDA yazılı olan kayıt
     bağlandı (DOK-2026-205 → ARC-001). DOK-2026-211'in adındaki "34 GVA 118"
     filodaki dört aracın hiçbirinin plakası değil — o belge bağsız kalır
     ve ekran "aracı belirtilmemiş belge" der (V-59). */
  { kod:'DOK-2026-205', ad:'06 GW 1907 Trafik Sigorta Poliçesi', tur:'Poliçe', klasor:'Filo / Poliçeler', arac:'ARC-001',
    musteri:null, proje:null, boyut:'420 KB', format:'PDF', versiyon:1,
    yukleyen:'EMP-011', tarih:'2025-09-05', sonKullanma:'2026-09-05', kalanGun:33, gizlilik:'İç kullanım',
    onay:'Onaylandı', aktif:true },
  { kod:'DOK-2026-206', ad:'Vitalis Regresyon Test Raporu v18', tur:'Test raporu', klasor:'Projeler / Vitalis', arac:null,
    musteri:'MUS-2024-002', proje:'PRJ-2026-001', boyut:'1,1 MB', format:'PDF', versiyon:18,
    yukleyen:'EMP-009', tarih:'2026-07-31', sonKullanma:null, kalanGun:null, gizlilik:'İç kullanım',
    onay:'Bekliyor', aktif:true },
  { kod:'DOK-2026-207', ad:'EMP-005 Zimmet Formu', tur:'Zimmet formu', klasor:'Personel / Zimmet', arac:null,
    musteri:null, proje:null, boyut:'180 KB', format:'PDF', versiyon:1,
    yukleyen:'EMP-011', tarih:'2024-01-22', sonKullanma:null, kalanGun:null, gizlilik:'Kişisel veri',
    onay:'Onaylandı', aktif:true },
  { kod:'DOK-2026-208', ad:'Gizlilik Sözleşmesi — Nihan Arslan', tur:'Gizlilik sözleşmesi', klasor:'Personel / Sözleşmeler', arac:null,
    musteri:null, proje:null, boyut:'320 KB', format:'PDF', versiyon:1,
    yukleyen:'EMP-011', tarih:'2025-06-01', sonKullanma:'2026-08-15', kalanGun:12, gizlilik:'Gizli',
    onay:'Onaylandı', aktif:true },
  { kod:'DOK-2026-209', ad:'Marmara ERP Teknik Doküman', tur:'Teknik doküman', klasor:'Projeler / Marmara', arac:null,
    musteri:'MUS-2025-005', proje:'PRJ-2026-003', boyut:'4,2 MB', format:'PDF', versiyon:5,
    yukleyen:'EMP-005', tarih:'2026-07-12', sonKullanma:null, kalanGun:null, gizlilik:'İç kullanım',
    onay:'Onaylandı', aktif:true },
  { kod:'DOK-2025-210', ad:'Kılıç Tekstil Bakım Sözleşmesi (süresi dolmuş)', tur:'Sözleşme', klasor:'Müşteriler / Kılıç Tekstil', arac:null,
    musteri:'MUS-2025-006', proje:null, boyut:'1,1 MB', format:'PDF', versiyon:1,
    yukleyen:'EMP-002', tarih:'2024-12-18', sonKullanma:'2025-12-31', kalanGun:-215, gizlilik:'İç kullanım',
    onay:'Onaylandı', aktif:true },
  { kod:'DOK-2026-211', ad:'Ticari Araç Ruhsat Fotokopisi — 34 GVA 118', tur:'Ruhsat', klasor:'Filo / Belgeler', arac:null,
    musteri:null, proje:null, boyut:'420 KB', format:'PDF', versiyon:1,
    yukleyen:'EMP-015', tarih:'2025-07-10', sonKullanma:'2026-07-20', kalanGun:-14, gizlilik:'İç kullanım',
    onay:'Bekliyor', aktif:true }
];

/* ---- Doküman versiyon geçmişi (PROMPT.md §19) ---------------------------
   Bağ tek yönlüdür: sürüm kaydı dokümanı gösterir, dokümanda ayna alan yoktur (§9d).
   Dokümanın `versiyon` alanı bu koleksiyondan **türetilebilir olmalıdır**:
     max(sira) === document.versiyon    ve   en yüksek sürümün tarihi/yükleyeni
     doküman kaydının `tarih`/`yukleyen` alanıyla birebir aynıdır.

   KAPSAM DÜRÜSTLÜĞÜ (L-13): on bir dokümanın **onunda** zincir baştan sona
   yazılıdır (v1 … vN). Tek istisna `DOK-2026-206`'dır — kayıt v18 der, ama
   önceki **17 regresyon koşumunun** tarihi, boyutu ve notu hiçbir yerden
   türetilemez; uydurmak yerine yalnız güncel sürüm yazıldı ve ekran bunu
   dokümanın kendi satırında söyler. --------------------------------------- */
DB.documentVersions = [
  { dokuman:'DOK-2026-201', sira:1, tarih:'2026-06-20', yukleyen:'EMP-001', boyut:'2,4 MB', format:'PDF',
    not:'Karşılıklı imzalı nüsha tarandı' },
  { dokuman:'DOK-2026-202', sira:1, tarih:'2026-07-14', yukleyen:'EMP-002', boyut:'840 KB', format:'PDF',
    not:'İlk teklif — müşteriye iletildi' },
  { dokuman:'DOK-2026-202', sira:2, tarih:'2026-07-22', yukleyen:'EMP-002', boyut:'860 KB', format:'PDF',
    not:'Müvekkil portalı kapsamı ve ödeme planı revize edildi' },
  { dokuman:'DOK-2026-203', sira:1, tarih:'2026-07-20', yukleyen:'EMP-003', boyut:'1,8 MB', format:'PDF',
    not:'ANL-2026-001 ön analizinden çıkarıldı' },
  { dokuman:'DOK-2026-204', sira:1, tarih:'2025-09-01', yukleyen:'EMP-012', boyut:'240 KB', format:'PDF',
    not:'Tedarikçi faturası arşivlendi' },
  { dokuman:'DOK-2026-205', sira:1, tarih:'2025-09-05', yukleyen:'EMP-011', boyut:'420 KB', format:'PDF',
    not:'Poliçe sigorta şirketinden alındı' },
  { dokuman:'DOK-2026-206', sira:18, tarih:'2026-07-31', yukleyen:'EMP-009', boyut:'1,1 MB', format:'PDF',
    not:'18. regresyon koşumu — önceki 17 koşumun sürüm kaydı yok' },
  { dokuman:'DOK-2026-207', sira:1, tarih:'2024-01-22', yukleyen:'EMP-011', boyut:'180 KB', format:'PDF',
    not:'ZMT-2024-001 zimmet tutanağı imzalandı' },
  { dokuman:'DOK-2026-208', sira:1, tarih:'2025-06-01', yukleyen:'EMP-011', boyut:'320 KB', format:'PDF',
    not:'Freelance sözleşme ekinde imzalandı' },
  { dokuman:'DOK-2026-209', sira:1, tarih:'2026-03-16', yukleyen:'EMP-005', boyut:'2,6 MB', format:'PDF',
    not:'İlk teknik doküman — mimari ve veri modeli' },
  { dokuman:'DOK-2026-209', sira:2, tarih:'2026-04-27', yukleyen:'EMP-005', boyut:'3,1 MB', format:'PDF',
    not:'Entegrasyon bölümü eklendi' },
  { dokuman:'DOK-2026-209', sira:3, tarih:'2026-05-29', yukleyen:'EMP-005', boyut:'3,5 MB', format:'PDF',
    not:'Yetki matrisi bölümü eklendi' },
  { dokuman:'DOK-2026-209', sira:4, tarih:'2026-06-24', yukleyen:'EMP-010', boyut:'3,9 MB', format:'PDF',
    not:'Sunucu ve dağıtım mimarisi güncellendi' },
  { dokuman:'DOK-2026-209', sira:5, tarih:'2026-07-12', yukleyen:'EMP-005', boyut:'4,2 MB', format:'PDF',
    not:'Logo ERP servis sözleşmesi bölümü yazıldı' },
  { dokuman:'DOK-2025-210', sira:1, tarih:'2024-12-18', yukleyen:'EMP-002', boyut:'1,1 MB', format:'PDF',
    not:'Yıllık bakım sözleşmesi imzalandı' },
  { dokuman:'DOK-2026-211', sira:1, tarih:'2025-07-10', yukleyen:'EMP-015', boyut:'420 KB', format:'PDF',
    not:'Ruhsat fotokopisi tarandı' }
];

/* ---- Doküman dijital onay zinciri (PROMPT.md §19) -----------------------
   `DB.purchaseApprovals` ile **aynı desen**: adım sırası · makam · kişi · durum ·
   tarih · not. Dokümanın `onay` alanı zincirden türer:
     her adım 'Onaylandı' → doküman 'Onaylandı' · bir adım bile bekliyorsa 'Bekliyor'.
   Adım sayısı belgenin niteliğine göre değişir: gizli/kişisel veri taşıyan ve
   müşteriye giden belgeler iki adımdan (kontrol + onay), iç arşiv belgeleri tek
   adımdan geçer. Onay **tarihi** her zaman sürümün yükleme tarihinden sonradır. */
DB.documentApprovals = [
  { dokuman:'DOK-2026-201', sira:1, makam:'Hukuki kontrol', kisi:'EMP-002', durum:'Onaylandı',
    tarih:'2026-06-20T14:10', not:'Sözleşme metni teklifle örtüşüyor' },
  { dokuman:'DOK-2026-201', sira:2, makam:'Şirket sahibi onayı', kisi:'EMP-001', durum:'Onaylandı',
    tarih:'2026-06-20T16:35', not:'İmzalı nüsha arşive alındı' },
  { dokuman:'DOK-2026-202', sira:1, makam:'Satış yöneticisi onayı', kisi:'EMP-002', durum:'Onaylandı',
    tarih:'2026-07-22T11:20', not:'Revize teklif müşteriye iletilebilir' },
  { dokuman:'DOK-2026-203', sira:1, makam:'Proje yöneticisi kontrolü', kisi:'EMP-003', durum:'Onaylandı',
    tarih:'2026-07-21T09:40', not:'Kapsam ve efor tahmini yerinde' },
  { dokuman:'DOK-2026-203', sira:2, makam:'Şirket sahibi onayı', kisi:'EMP-001', durum:'Bekliyor',
    tarih:null, not:null },
  { dokuman:'DOK-2026-204', sira:1, makam:'Muhasebe onayı', kisi:'EMP-012', durum:'Onaylandı',
    tarih:'2025-09-01T17:05', not:'Gider kaydı açıldı' },
  { dokuman:'DOK-2026-205', sira:1, makam:'İdari işler onayı', kisi:'EMP-011', durum:'Onaylandı',
    tarih:'2025-09-05T10:15', not:'Poliçe filo dosyasına işlendi' },
  { dokuman:'DOK-2026-206', sira:1, makam:'Test ve kalite onayı', kisi:'EMP-009', durum:'Onaylandı',
    tarih:'2026-07-31T18:20', not:'Koşum sonuçları doğrulandı' },
  { dokuman:'DOK-2026-206', sira:2, makam:'Proje yöneticisi onayı', kisi:'EMP-003', durum:'Bekliyor',
    tarih:null, not:null },
  { dokuman:'DOK-2026-207', sira:1, makam:'İnsan kaynakları onayı', kisi:'EMP-011', durum:'Onaylandı',
    tarih:'2024-01-22T15:30', not:'Personel imzası alındı' },
  { dokuman:'DOK-2026-208', sira:1, makam:'İnsan kaynakları kontrolü', kisi:'EMP-011', durum:'Onaylandı',
    tarih:'2025-06-01T11:00', not:'Gizlilik maddeleri standart metinle aynı' },
  { dokuman:'DOK-2026-208', sira:2, makam:'Şirket sahibi onayı', kisi:'EMP-001', durum:'Onaylandı',
    tarih:'2025-06-02T09:25', not:'İmzalandı' },
  { dokuman:'DOK-2026-209', sira:1, makam:'Teknik kontrol', kisi:'EMP-010', durum:'Onaylandı',
    tarih:'2026-07-12T16:40', not:'Sunucu mimarisi bölümü doğrulandı' },
  { dokuman:'DOK-2025-210', sira:1, makam:'Satış yöneticisi onayı', kisi:'EMP-002', durum:'Onaylandı',
    tarih:'2024-12-18T13:50', not:'Bakım kapsamı sözleşmeye uygun' },
  { dokuman:'DOK-2026-211', sira:1, makam:'İdari işler onayı', kisi:'EMP-011', durum:'Bekliyor',
    tarih:null, not:'Ruhsat süresi doldu, yenilenmiş nüsha bekleniyor' }
];

/* ---- Sohbet kanalları (PROMPT.md §13) ----------------------------------- */
DB.channels = [
  { kod:'KNL-001', ad:'#genel', tur:'Şirket duyuruları', uyeler:16, okunmamis:2, sonMesaj:'2026-08-03T09:12',
    sonMesajKisi:'EMP-001', sonMesajOzet:'Bu hafta ekip toplantısı Salı 09:30', sessiz:false, aktif:true },
  { kod:'KNL-002', ad:'#proje-vitalis', tur:'Proje kanalı', proje:'PRJ-2026-001', uyeler:5, okunmamis:7,
    sonMesaj:'2026-08-03T08:40', sonMesajKisi:'EMP-008', sonMesajOzet:'PDF hatası için düzeltme hazır, test edebilir misin?',
    sessiz:false, aktif:true },
  { kod:'KNL-003', ad:'#proje-marmara', tur:'Proje kanalı', proje:'PRJ-2026-003', uyeler:6, okunmamis:0,
    sonMesaj:'2026-08-02T17:20', sonMesajKisi:'EMP-005', sonMesajOzet:'Logo test hesabı hâlâ gelmedi, eskalasyon gerekiyor',
    sessiz:false, aktif:true },
  { kod:'KNL-004', ad:'#tasarim', tur:'Departman içi kanal', dep:'DEP-06', uyeler:3, okunmamis:1,
    sonMesaj:'2026-08-02T15:05', sonMesajKisi:'EMP-004', sonMesajOzet:'Store görselleri kontrole hazır',
    sessiz:false, aktif:true },
  { kod:'KNL-005', ad:'#satis-teknik', tur:'Departmanlar arası kanal', uyeler:6, okunmamis:3,
    sonMesaj:'2026-08-01T11:30', sonMesajKisi:'EMP-014', sonMesajOzet:'Zirve Market POS dokümanı paylaşıldı',
    sessiz:false, aktif:true },
  { kod:'KNL-006', ad:'Barış Yalçın', tur:'Birebir sohbet', uyeler:2, okunmamis:1,
    sonMesaj:'2026-08-03T08:05', sonMesajKisi:'EMP-003', sonMesajOzet:'Sprint planlamasını 10:00e alabilir miyiz?',
    sessiz:false, aktif:true },
  { kod:'KNL-007', ad:'#destek', tur:'Departman içi kanal', dep:'DEP-13', uyeler:4, okunmamis:0,
    sonMesaj:'2026-07-31T16:45', sonMesajKisi:'EMP-013', sonMesajOzet:'Trakya destek kaydı eskalasyona taşındı',
    sessiz:true, aktif:true }
];

DB.messages = [
  { kanal:'KNL-002', kod:'MSG-4401', kisi:'EMP-003', tarih:'2026-08-03T08:12', metin:'Store başvurusu için kalan tek engel PDF hatası. Bugün kapatabilir miyiz?', tepki:[] },
  { kanal:'KNL-002', kod:'MSG-4402', kisi:'EMP-008', tarih:'2026-08-03T08:22', metin:'Sebebini buldum — dosya izinleri iOS 17 ile değişmiş. Düzeltme yazıyorum.', tepki:['👍'] },
  { kanal:'KNL-002', kod:'MSG-4403', kisi:'EMP-009', tarih:'2026-08-03T08:31', metin:'Düzeltme gelince 3 cihazda doğrularım, test seti hazır.', tepki:[] },
  { kanal:'KNL-002', kod:'MSG-4404', kisi:'EMP-008', tarih:'2026-08-03T08:40', metin:'PDF hatası için düzeltme hazır, test edebilir misin?', tepki:['🎉'], gorev:'GRV-2026-101' },
  { kanal:'KNL-003', kod:'MSG-4405', kisi:'EMP-005', tarih:'2026-08-02T17:20', metin:'Logo test hesabı hâlâ gelmedi, eskalasyon gerekiyor. Görev GRV-2026-105 engellendi durumunda.', tepki:[] },
  { kanal:'KNL-001', kod:'MSG-4406', kisi:'EMP-001', tarih:'2026-08-03T09:12', metin:'Bu hafta ekip toplantısı Salı 09:30. Gündem: sprint durumu, riskler, haftanın öncelikleri.', tepki:['👍','✅'] }
];

/* ---- Hatırlatmalar (VB-29) ---------------------------------------------
   "Şu kayda, şu tarihte, şu kişiye hatırlatma gönderildi" ekseni hiçbir
   koleksiyonda yoktu; bu yüzden `hatirlat` aksiyonları yalnız yeşil toast
   basıyor, hiçbir yerde iz bırakmıyordu (UID-30 · 🔴 yalan).

   `DB.notifications`'tan FARKI: bildirim **kullanıcıya düşen kutu kaydıdır**
   (okundu/okunmadı ekseni vardır); hatırlatma ise **kayda ilişkin gönderim
   olayıdır** (kim, ne zaman, hangi kanaldan, hangi kayıt için). Aynı olay iki
   kayıt üretebilir: hatırlatma logu + alıcının bildirimi.

   `kayit` alanı bağın kendisidir (`DOK-*` · `FTR-*` · `PAY-*` …) ve
   `canon.js` bunun gerçekten var olan bir kaydı gösterdiğini doğrular. */
DB.reminders = [
  { kod:'HTR-2026-001', kayit:'DOK-2026-208', tur:'Doküman yenileme', tarih:'2026-07-28T09:10',
    kanal:'E-posta', gonderen:'EMP-001', alici:'EMP-011', durum:'Gönderildi' },
  { kod:'HTR-2026-002', kayit:'DOK-2026-211', tur:'Doküman yenileme', tarih:'2026-08-01T10:05',
    kanal:'Sistem içi', gonderen:'EMP-001', alici:'EMP-015', durum:'Gönderildi' },
  { kod:'HTR-2026-003', kayit:'FTR-2026-028', tur:'Ödeme hatırlatması', tarih:'2026-07-30T14:40',
    kanal:'E-posta', gonderen:'EMP-012', alici:'MUS-2025-005', durum:'Gönderildi' }
];

/* ---- Bildirimler (PROMPT.md §21 — 31 tip) ------------------------------- */
DB.notifications = [
  { kod:'BLD-9001', tur:'Görev gecikmesi', baslik:'GRV-2026-101 termini geçti', ozet:'iOS PDF indirme hatası — 2 gün gecikti',
    tarih:'2026-08-02T09:00', kisi:'EMP-008', okundu:false, tone:'danger', link:'app-gorev-detay.html?id=GRV-2026-101' },
  { kod:'BLD-9002', tur:'Onay bekleyen işlem', baslik:'Satın alma onayınızı bekliyor', ozet:'SAT-2026-014 · 186.000 ₺ · 2 dizüstü bilgisayar',
    tarih:'2026-08-02T08:30', kisi:'EMP-001', okundu:false, tone:'warn', link:'app-satinalma-detay.html?id=SAT-2026-014' },
  { kod:'BLD-9003', tur:'Sohbette etiketlenme', baslik:'#proje-vitalis kanalında etiketlendiniz', ozet:'Onur Şahin: düzeltme hazır, test edebilir misin?',
    tarih:'2026-08-03T08:40', kisi:'EMP-009', okundu:false, tone:'info', link:'app-sohbet.html?k=KNL-002' },
  { kod:'BLD-9004', tur:'SLA ihlali riski', baslik:'DST-2026-118 SLA süresi doluyor', ozet:'Trakya Otomotiv · kritik hata · 4 saatlik SLA',
    tarih:'2026-08-02T13:15', kisi:'EMP-013', okundu:false, tone:'danger', link:'app-destek-detay.html?id=DST-2026-118' },
  { kod:'BLD-9005', tur:'Geciken tahsilat', baslik:'FTR-2026-018 · 43 gün gecikti', ozet:'Anadolu Perakende · 285.000 ₺',
    tarih:'2026-08-01T10:00', kisi:'EMP-012', okundu:false, tone:'danger', link:'app-tahsilat.html' },
  { kod:'BLD-9006', tur:'Muayene tarihi', baslik:'06 GW 1907 muayenesi 25 gün sonra', ozet:'Geçerlilik: 28 Ağustos 2026',
    tarih:'2026-08-01T08:00', kisi:'EMP-011', okundu:false, tone:'warn', link:'app-arac-muayene.html' },
  { kod:'BLD-9007', tur:'Trafik sigortası', baslik:'06 GW 3388 trafik sigortası 17 gün sonra bitiyor', ozet:'Anadolu Sigorta · 20 Ağustos 2026',
    tarih:'2026-08-01T08:00', kisi:'EMP-011', okundu:false, tone:'warn', link:'app-arac-sigorta.html' },
  { kod:'BLD-9008', tur:'Lisans yenileme', baslik:'Figma lisansı 28 gün sonra doluyor', ozet:'31 Ağustos 2026 · 42.000 ₺',
    tarih:'2026-08-01T08:00', kisi:'EMP-012', okundu:true, tone:'warn', link:'app-demirbas-detay.html?id=DMB-2025-009' },
  { kod:'BLD-9009', tur:'Yeni müşteri adayı', baslik:'LEAD-2026-011 · Akdeniz Klinik Grubu', ozet:'Referans: Hakan Demirtaş · 410.000 ₺',
    tarih:'2026-08-02T09:20', kisi:'EMP-002', okundu:true, tone:'ok', link:'app-lead-detay.html?id=LEAD-2026-011' },
  { kod:'BLD-9010', tur:'İzin talebi', baslik:'Deniz Korkmaz izin talebi', ozet:'10-14 Ağustos · 5 gün yıllık izin',
    tarih:'2026-07-31T16:40', kisi:'EMP-003', okundu:false, tone:'info', link:'app-izin-detay.html?id=IZN-2026-038' },
  { kod:'BLD-9011', tur:'Geciken proje', baslik:'PRJ-2026-006 teslim tarihi geçti', ozet:'Trakya Otomotiv · 38 gün gecikme',
    tarih:'2026-07-29T09:00', kisi:'EMP-003', okundu:true, tone:'danger', link:'app-proje-detay.html?id=PRJ-2026-006' },
  { kod:'BLD-9012', tur:'Departmanlar arası talep', baslik:'Yeni tasarım talebi', ozet:'TLP-2026-042 · Rapor merkezi 8 ekran',
    tarih:'2026-08-01T11:10', kisi:'EMP-004', okundu:false, tone:'info', link:'app-istalebi-detay.html?id=TLP-2026-042' }
];

/* ---- Duyurular ----------------------------------------------------------- */
DB.announcements = [
  { kod:'DUY-2026-014', baslik:'Ağustos ekip toplantısı takvimi', ozet:'Haftalık toplantılar Salı 09:30\'a alındı.',
    icerik:'Ağustos ayı boyunca haftalık ekip toplantıları Salı günleri 09:30\'da yapılacaktır. Katılım tüm ekip için zorunludur.',
    yazan:'EMP-001', tarih:'2026-08-03', oncelik:'Orta', dep:null, aktif:true,
    okuyanlar:['EMP-003','EMP-008'] },
  { kod:'DUY-2026-013', baslik:'Yıllık izin planlaması', ozet:'Eylül-Aralık izin planlarınızı 15 Ağustos\'a kadar girin.',
    icerik:'Yılın kalan dönemi için izin planlarının sisteme girilmesi gerekmektedir. Çakışma kontrolü otomatik yapılacaktır.',
    yazan:'EMP-011', tarih:'2026-07-28', oncelik:'Yüksek', dep:null, aktif:true,
    okuyanlar:['EMP-011','EMP-002','EMP-003','EMP-005','EMP-008','EMP-013'] },
  { kod:'DUY-2026-012', baslik:'Yeni gizlilik politikası yürürlükte', ozet:'KVKK kapsamında güncellenen politika yayımlandı.',
    icerik:'Müşteri verisi barındıran tüm sistemler için yeni gizlilik ve saklama politikası yürürlüğe girmiştir.',
    yazan:'EMP-001', tarih:'2026-07-15', oncelik:'Yüksek', dep:null, aktif:true,
    okuyanlar:['EMP-001','EMP-002','EMP-003','EMP-004','EMP-005','EMP-006','EMP-008','EMP-009',
               'EMP-011','EMP-012','EMP-013','EMP-014','EMP-015'] }
];

/* ---- Otomasyon kuralları (PROMPT.md §21, §26-J) ------------------------- */
DB.automations = [
  { kod:'OTO-001', ad:'Görev atama bildirimi', tetikleyici:'Görev sorumlusu atandığında',
    islem:'Sorumluya sistem içi + e-posta bildirimi gönder', kullanici:'Sorumlu', kanal:['Sistem içi','E-posta'],
    fayda:'Görev kaçırma riskini ortadan kaldırır', durum:'Aktif', aktif:true },
  { kod:'OTO-002', ad:'Görev başlatma hatırlatması', tetikleyici:'Atamadan 24 saat sonra çalışmaya başlanmamışsa',
    islem:'Sorumluya hatırlatma, 48 saatte yöneticiye eskalasyon', kullanici:'Sorumlu, yönetici', kanal:['Sistem içi'],
    fayda:'Sahipsiz görev kalmaz', durum:'Aktif', aktif:true },
  { kod:'OTO-003', ad:'Termin yaklaşma uyarısı', tetikleyici:'Termine 2 gün kala',
    islem:'Sorumlu ve izleyicilere bildirim', kullanici:'Sorumlu, izleyiciler', kanal:['Sistem içi','E-posta'],
    fayda:'Gecikmeleri önler', durum:'Aktif', aktif:true },
  { kod:'OTO-004', ad:'Gecikme eskalasyonu', tetikleyici:'Termin geçtiğinde',
    islem:'Görevi veren ve proje yöneticisine bildirim, görev listede kırmızı işaretlenir',
    kullanici:'Veren, PM', kanal:['Sistem içi','E-posta'], fayda:'Gecikme görünür olur', durum:'Aktif', aktif:true },
  { kod:'OTO-005', ad:'Bağımlı görev başlatma', tetikleyici:'Öncül görev tamamlandığında',
    islem:'Bağımlı görevi "Atandı" durumuna al ve sorumluya bildir', kullanici:'Bağımlı görev sorumlusu',
    kanal:['Sistem içi'], fayda:'Zincirleme işler beklemede kalmaz', durum:'Aktif', aktif:true },
  { kod:'OTO-006', ad:'Kontrol süreci başlatma', tetikleyici:'Görev "Kontrolde" olduğunda',
    islem:'Kontrol eden kişiye görev ata ve bildir', kullanici:'Kontrol eden', kanal:['Sistem içi'],
    fayda:'Kalite kontrolü atlanmaz', durum:'Aktif', aktif:true },
  { kod:'OTO-007', ad:'Revizyon görevi oluşturma', tetikleyici:'Kontrol reddedildiğinde',
    islem:'Revizyon görevi aç, revizyon sayacını artır', kullanici:'Sorumlu', kanal:['Sistem içi'],
    fayda:'Revizyon geçmişi ölçülebilir olur', durum:'Aktif', aktif:true },
  { kod:'OTO-008', ad:'Tekrarlayan görev üretimi', tetikleyici:'Tanımlı periyot geldiğinde',
    islem:'Yeni görev kopyası oluştur ve ata', kullanici:'Sorumlu', kanal:['Sistem içi'],
    fayda:'Rutin işler unutulmaz', durum:'Aktif', aktif:true },
  { kod:'OTO-009', ad:'Aşırı iş yükü uyarısı', tetikleyici:'Personel doluluğu %95 üstüne çıktığında',
    islem:'Yöneticiye uyarı, yeni atama önerisi', kullanici:'Yönetici, PM', kanal:['Sistem içi'],
    fayda:'Tükenmişlik ve gecikme önlenir', durum:'Aktif', aktif:true },
  { kod:'OTO-010', ad:'Sohbetten görev oluşturma', tetikleyici:'Mesaj göreve dönüştürüldüğünde',
    islem:'Mesaj bağlantısıyla görev aç, kanalda durum mesajı yayınla', kullanici:'Kanal üyeleri',
    kanal:['Sistem içi'], fayda:'Sohbette kaybolan işler kayıt altına alınır', durum:'Aktif', aktif:true },
  { kod:'OTO-011', ad:'Toplantı kararından görev', tetikleyici:'Toplantı kararı aksiyona çevrildiğinde',
    islem:'Sorumlu ve terminle görev oluştur', kullanici:'Karar sorumlusu', kanal:['Sistem içi'],
    fayda:'Toplantı kararları takip edilir', durum:'Aktif', aktif:true },
  { kod:'OTO-012', ad:'Destek talebinden geliştirme görevi', tetikleyici:'Destek kaydı "Geliştirme" olarak sınıflandığında',
    islem:'İlgili projede geliştirme görevi aç', kullanici:'PM', kanal:['Sistem içi'],
    fayda:'Müşteri talepleri backlog\'a düşer', durum:'Aktif', aktif:true },
  { kod:'OTO-013', ad:'Teklif geçerlilik uyarısı', tetikleyici:'Geçerlilik bitişine 5 gün kala',
    islem:'Satış sorumlusuna hatırlatma', kullanici:'Satış sorumlusu', kanal:['Sistem içi','E-posta'],
    fayda:'Fırsat kaybı önlenir', durum:'Aktif', aktif:true },
  { kod:'OTO-014', ad:'İşlem yapılmayan fırsat uyarısı', tetikleyici:'Aşamada maksimum bekleme süresi aşıldığında',
    islem:'Satış sorumlusu ve yöneticisine uyarı', kullanici:'Satış', kanal:['Sistem içi'],
    fayda:'Pipeline tıkanması görünür olur', durum:'Aktif', aktif:true },
  { kod:'OTO-015', ad:'Araç bakım/muayene/poliçe uyarısı', tetikleyici:'60 / 30 / 15 / 7 gün kala ve süre dolduğunda',
    islem:'İdari işler sorumlusuna kademeli bildirim', kullanici:'İdari işler', kanal:['Sistem içi','E-posta'],
    fayda:'Yasal yükümlülük kaçırılmaz', durum:'Aktif', aktif:true },
  { kod:'OTO-016', ad:'Geciken tahsilat hatırlatması', tetikleyici:'Vade geçtiğinde ve her 7 günde bir',
    islem:'Muhasebeye görev, müşteri sorumlusuna bildirim', kullanici:'Muhasebe, satış', kanal:['Sistem içi','E-posta'],
    fayda:'Nakit akışı korunur', durum:'Aktif', aktif:true },
  { kod:'OTO-017', ad:'SLA ihlali uyarısı', tetikleyici:'SLA süresinin %75\'i dolduğunda',
    islem:'Destek sorumlusu ve yöneticisine uyarı', kullanici:'Destek', kanal:['Sistem içi'],
    fayda:'SLA ihlali önlenir', durum:'Aktif', aktif:true },
  { kod:'OTO-018', ad:'Eksik zaman kaydı uyarısı', tetikleyici:'Haftalık 40 saatin altında kayıt varsa (Cuma 17:00)',
    islem:'Personele hatırlatma', kullanici:'Personel', kanal:['Sistem içi'],
    fayda:'Timesheet eksiksiz kapanır', durum:'Aktif', aktif:true },
  { kod:'OTO-019', ad:'Günlük yönetici özeti', tetikleyici:'Her gün 08:00',
    islem:'Geciken işler, onaylar, riskli müşteriler özetini gönder', kullanici:'Yönetim', kanal:['E-posta'],
    fayda:'Yönetim tek bakışta durumu görür', durum:'Aktif', aktif:true },
  { kod:'OTO-020', ad:'Haftalık operasyon özeti', tetikleyici:'Her Pazartesi 08:00',
    islem:'Proje ilerlemesi, kapasite ve finans özeti gönder', kullanici:'Yönetim', kanal:['E-posta'],
    fayda:'Haftalık planlama beslenir', durum:'Aktif', aktif:true },
  { kod:'OTO-021', ad:'Garanti bitiş uyarısı', tetikleyici:'Demirbaş garantisi bitişine 30 gün kala',
    islem:'İdari işlere bildirim', kullanici:'İdari işler', kanal:['Sistem içi'],
    fayda:'Garanti hakkı kaybedilmez', durum:'Aktif', aktif:true },
  { kod:'OTO-022', ad:'Zimmet iade kontrolü', tetikleyici:'Personel çıkış süreci başlatıldığında',
    islem:'Tüm zimmetler için iade görevi aç', kullanici:'İK, idari işler', kanal:['Sistem içi'],
    fayda:'Ekipman kaybı önlenir', durum:'Aktif', aktif:true }
];

/* ---- Bildirim kanalı tercihleri ----------------------------------------- */
DB.notificationChannels = ['Sistem içi','E-posta','Mobil bildirim','SMS','WhatsApp','Slack','Microsoft Teams'];

/* ---- Entegrasyonlar ------------------------------------------------------ */
DB.integrations = [
  { kod:'ENT-001', ad:'GitHub', kategori:'Kaynak kod', durum:'Bağlı', aciklama:'Depo ve PR bağlantıları proje kartına yansır', aktif:true },
  { kod:'ENT-002', ad:'GitLab', kategori:'Kaynak kod', durum:'Bağlı değil', aciklama:'Alternatif depo sağlayıcı', aktif:true },
  { kod:'ENT-003', ad:'Google Calendar', kategori:'Takvim', durum:'Bağlı', aciklama:'Toplantılar iki yönlü senkronize edilir', aktif:true },
  { kod:'ENT-004', ad:'Slack', kategori:'İletişim', durum:'Bağlı değil', aciklama:'Bildirimler kanala düşer', aktif:true },
  { kod:'ENT-005', ad:'Microsoft Teams', kategori:'İletişim', durum:'Bağlı değil', aciklama:'Bildirimler kanala düşer', aktif:true },
  { kod:'ENT-006', ad:'Logo Tiger', kategori:'Muhasebe', durum:'Planlandı', aciklama:'Fatura ve cari aktarımı', aktif:true },
  { kod:'ENT-007', ad:'Paraşüt', kategori:'Muhasebe', durum:'Bağlı', aciklama:'Fatura kesme ve tahsilat takibi', aktif:true },
  { kod:'ENT-008', ad:'E-imza (KamuSM)', kategori:'Doküman', durum:'Planlandı', aciklama:'Sözleşme dijital imzalama', aktif:true },
  { kod:'ENT-009', ad:'OpenAI API', kategori:'Yapay zekâ', durum:'Bağlı', aciklama:'Ön analiz ve özetleme özellikleri', aktif:true },
  { kod:'ENT-010', ad:'WhatsApp Business', kategori:'İletişim', durum:'Planlandı', aciklama:'Müşteri bildirimleri', aktif:true }
];

/* ---- Sistem log kayıtları ------------------------------------------------ */
DB.logs = [
  { kod:'LOG-88201', tarih:'2026-08-03T09:12', kisi:'EMP-001', islem:'Duyuru oluşturdu', kayit:'DUY-2026-014',
    modul:'Duyurular', ip:'88.230.14.7', eski:null, yeni:'Ağustos ekip toplantısı takvimi' },
  { kod:'LOG-88200', tarih:'2026-08-02T16:20', kisi:'EMP-008', islem:'Görev güncelledi', kayit:'GRV-2026-101',
    modul:'Görevler', ip:'88.230.14.9', eski:'İlerleme %45', yeni:'İlerleme %70' },
  { kod:'LOG-88199', tarih:'2026-08-02T14:05', kisi:'EMP-012', islem:'Maaş bilgisi görüntüledi', kayit:'EMP-005',
    modul:'Personel', ip:'88.230.14.11', eski:null, yeni:null },
  { kod:'LOG-88198', tarih:'2026-08-02T11:40', kisi:'EMP-003', islem:'Proje sağlık durumu değiştirdi', kayit:'PRJ-2026-006',
    modul:'Projeler', ip:'88.230.14.8', eski:'Dikkat', yeni:'Riskli' },
  { kod:'LOG-88197', tarih:'2026-08-01T10:15', kisi:'EMP-002', islem:'Teklif oluşturdu', kayit:'TKL-2026-008',
    modul:'Teklifler', ip:'88.230.14.6', eski:null, yeni:'336.000 ₺' },
  { kod:'LOG-88196', tarih:'2026-07-31T16:40', kisi:'EMP-006', islem:'İzin talebi oluşturdu', kayit:'IZN-2026-038',
    modul:'İzinler', ip:'88.230.14.12', eski:null, yeni:'10-14 Ağustos' },
  { kod:'LOG-88195', tarih:'2026-07-30T14:20', kisi:'EMP-005', islem:'Satın alma onayladı', kayit:'SAT-2026-014',
    modul:'Satın Alma', ip:'88.230.14.9', eski:'Bekliyor', yeni:'Onaylandı' }
];

/* CLOUD TURU · sartname [10.4.4]/[10.4.5] — ODEME TAHSIS DEFTERI.
   Olcum: DB.payments[].fatura TEKIL bir alandi; bir tahsilatin birden cok
   faturaya dagitilmasi SEMA duzeyinde imkansizdi (docs/G-veri-modeli.md:423
   bunu "birebir" diye yaziyordu). Fatura durumu da tahsis toplamindan
   turemiyor, uc ekrandan ELLE Odendi yapilabiliyordu.
   Tahsis defteri o bosluktur. Asagidaki satirlar UYDURULMADI: mevcut 1:1
   baglardan turetildi ve yalnizca GERCEKLESMIS (durum Odendi) hareketler
   tahsis uretti — bekleyen tahsilat bir para hareketi degildir.
   Tutar = min(tahsilat tutari, fatura brutu). Yontem alani veride yoktu;
   Havale yazildi ve turetilmis:true ile isaretlendi. */
DB.paymentAllocations = [
  { tahsilat:'THS-2025-032', fatura:'FTR-2025-011', tutar:184000, tarih:'2025-12-24', yontem:'Havale', turetilmis:true },
  { tahsilat:'THS-2026-033', fatura:'FTR-2026-012', tutar:184000, tarih:'2026-02-26', yontem:'Havale', turetilmis:true },
  { tahsilat:'THS-2026-034', fatura:'FTR-2026-013', tutar:111000, tarih:'2026-04-10', yontem:'Havale', turetilmis:true },
  { tahsilat:'THS-2026-035', fatura:'FTR-2026-014', tutar:184000, tarih:'2026-04-24', yontem:'Havale', turetilmis:true },
  { tahsilat:'THS-2026-036', fatura:'FTR-2026-019', tutar:184000, tarih:'2026-06-26', yontem:'Havale', turetilmis:true },
  { tahsilat:'THS-2026-037', fatura:'FTR-2026-020', tutar:141600, tarih:'2026-07-02', yontem:'Havale', turetilmis:true },
  { tahsilat:'THS-2026-038', fatura:'FTR-2026-021', tutar:151200, tarih:'2026-07-23', yontem:'Havale', turetilmis:true },
  { tahsilat:'THS-2026-039', fatura:'FTR-2026-024', tutar:316800, tarih:'2026-07-28', yontem:'Havale', turetilmis:true },
  { tahsilat:'THS-2026-040', fatura:'FTR-2026-026', tutar:300000, tarih:'2026-07-04', yontem:'Havale', turetilmis:true },
  { tahsilat:'THS-2026-048', fatura:'FTR-2026-022', tutar:106200, tarih:'2026-07-29', yontem:'Havale', turetilmis:true }
];

/* =====================================================================
   ENTEGRASYON HATA KUYRUĞU — şartname [13.0.13] · P0
   ---------------------------------------------------------------------
   ⚠️ KOLEKSİYON BOŞ VE BU BİLEREK BÖYLEDİR.
   Şartname bu ekranı P0 sayıyor: kullanıcı hatayı, etkilenen kaydı, deneme
   sayısını, son mesajı, güvenli payload özetini, önerilen çözümü ve tekrar
   çalıştırma sonucunu görebilmeli.

   Bu prototipte GERÇEK BİR ENTEGRASYON KOŞUMU YOK — `DB.integrations`
   yalnız bağlantı tanımlarını taşıyor, hiçbiri çalışmıyor. Dolayısıyla
   yazılabilecek tek dürüst değer boş listedir. Örnek hata kaydı uydurmak,
   çalışmayan bir entegrasyonun çalıştığını ve hata verdiğini iddia etmek
   olurdu (L-13).

   Boş liste ile ÖLÇÜLEMEDİ aynı şey değildir ve ekranlar ikisini ayırır:
   `app-veri-kalitesi.html` K6 kontrolü "koşum kaydı yok, kontrol yapılamadı"
   der — "hata yok" demez.

   Şema (kayıt yazıldığında): kod · entegrasyon · olayTipi · kayit · deneme ·
   sonMesaj · payloadOzet · onerilenCozum · durum · ilkGorulme · sonGorulme ·
   replaySonuc. Sunucu tarafı kuyruk gelene kadar bu liste dolmaz. */
DB.integrationErrors = [];
