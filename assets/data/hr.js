/* =====================================================================
   GAVIAWORKS CRM — İK VE ZAMAN VERİSİ
   İzinler · Zaman kayıtları · Timesheet · Performans · Eğitim
   ===================================================================== */
window.DB = window.DB || {};

DB.leaveTypes = ['Yıllık izin','Mazeret izni','Hastalık izni','Ücretsiz izin','Saatlik izin','Uzaktan çalışma'];

/* ---- İzin talepleri (PROMPT.md §14) ------------------------------------ */
/* `cakisma` alanı **personel çakışmasını değil** proje takvimi çakışmasını işaretler.
   Ölçüldü: IZN-2026-033'te `cakisma:true` ama sahibinin departmanında başka kimse yok;
   ret gerekçesi "Marmara Faz 1 teslim haftasıyla çakışıyor". Departman içi personel
   çakışması ekranda `baslangic`/`bitis` kesişiminden **hesaplanır**, bu alandan okunmaz. */
DB.leaves = [
  { kod:'IZN-2026-038', personel:'EMP-006', tur:'Yıllık izin', baslangic:'2026-08-10', bitis:'2026-08-14', gun:5,
    vekil:'EMP-016', gerekce:'Yıllık izin planı', durum:'Onay bekliyor', onaylayan:'EMP-003',
    talepTarihi:'2026-07-31', onayTarihi:null, cakisma:false, aktif:true },
  { kod:'IZN-2026-039', personel:'EMP-016', tur:'Mazeret izni', baslangic:'2026-08-05', bitis:'2026-08-05', gun:1,
    vekil:null, gerekce:'Üniversite sınav kaydı', durum:'Onay bekliyor', onaylayan:'EMP-006',
    talepTarihi:'2026-08-02', onayTarihi:null, cakisma:false, aktif:true },
  { kod:'IZN-2026-037', personel:'EMP-004', tur:'Uzaktan çalışma', baslangic:'2026-08-04', bitis:'2026-08-06', gun:3,
    vekil:null, gerekce:'Şehir dışı aile ziyareti', durum:'Onaylandı', onaylayan:'EMP-003',
    talepTarihi:'2026-07-28', onayTarihi:'2026-07-29', cakisma:false, aktif:true },
  { kod:'IZN-2026-036', personel:'EMP-007', tur:'Yıllık izin', baslangic:'2026-08-17', bitis:'2026-08-21', gun:5,
    vekil:'EMP-005', gerekce:'Yaz tatili', durum:'Onaylandı', onaylayan:'EMP-003',
    talepTarihi:'2026-07-20', onayTarihi:'2026-07-22', cakisma:false, aktif:true },
  { kod:'IZN-2026-035', personel:'EMP-009', tur:'Yıllık izin', baslangic:'2026-07-20', bitis:'2026-07-24', gun:5,
    vekil:'EMP-006', gerekce:'Yıllık izin', durum:'Onaylandı', onaylayan:'EMP-003',
    talepTarihi:'2026-07-10', onayTarihi:'2026-07-11', cakisma:false, aktif:true },
  { kod:'IZN-2026-034', personel:'EMP-013', tur:'Hastalık izni', baslangic:'2026-07-06', bitis:'2026-07-07', gun:2,
    vekil:'EMP-014', gerekce:'Rapor — grip', durum:'Onaylandı', onaylayan:'EMP-002',
    talepTarihi:'2026-07-06', onayTarihi:'2026-07-06', cakisma:false, aktif:true },
  { kod:'IZN-2026-033', personel:'EMP-005', tur:'Yıllık izin', baslangic:'2026-08-24', bitis:'2026-08-28', gun:5,
    vekil:'EMP-010', gerekce:'Yıllık izin', durum:'Reddedildi', onaylayan:'EMP-003',
    talepTarihi:'2026-07-15', onayTarihi:'2026-07-17', cakisma:true,
    ret:'Marmara Faz 1 teslim haftasıyla çakışıyor', aktif:true }
];

/* ---- Zaman kayıtları (PROMPT.md §14) ----------------------------------- */
/* CLOUD TURU · ADR-07 — ORAN SNAPSHOT'I (oranSnapshot).
   Ölçülen kusur: Proje.maliyet her zaman kaydına BUGÜNKÜ saat maliyetini
   çarpıyordu (Hr.icMaliyet tarih parametresi almıyordu). Bir maaş zammı
   geçmiş projelerin maliyetini ve kârlılığını geriye dönük değiştiriyordu;
   şartname [10.5.2] bunu doğrudan yasaklıyor.

   88 onaylı kaydın oranı donduruldu. ⚠️ DEĞERİN NE OLDUĞU AÇIKÇA YAZILI:
   oranKaynak:'bugunOran-geriye' demek "bu, kaydın tarihindeki gerçek oran
   DEĞİL, bugünkü orandır ve geriye doğru dondurulmuştur" demektir.
   Geçmiş maaş verisi yoktu (bkz. DB.salaryHistory) ve uydurulmadı.

   Dondurmanın kazandırdığı şey ölçülebilir: bundan sonraki maaş
   değişiklikleri kapanmış projelerin maliyetini ARTIK DEĞİŞTİREMEZ.
   Kazandırmadığı şey de açıktır: bu 88 kaydın tarihsel oranı hâlâ
   bilinmiyor. Proje.maliyet, oranı güvenilmez olan personelleri
   `oranGuvenilmez` listesinde döndürür; ekran bunu söyler.

   İleriye dönük gerçek çözüm Zaman.onaylaKayit içindedir: satır
   onaylanırken o günün oranı donar ve kaynak 'maas'/'maasGecmisi' olur. */
DB.timelogs = [
  { kod:'ZMN-9001', personel:'EMP-008', tarih:'2026-08-02', gorev:'GRV-2026-101', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:4.5, faturalanabilir:true, aciklama:'iOS PDF indirme hatası incelemesi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9002', personel:'EMP-008', tarih:'2026-08-01', gorev:'GRV-2026-101', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:2, faturalanabilir:true, aciklama:'Hata yeniden üretimi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9003', personel:'EMP-007', tarih:'2026-08-02', gorev:'GRV-2026-103', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:6, faturalanabilir:true, aciklama:'Model metrik hesaplaması', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9004', personel:'EMP-007', tarih:'2026-07-31', gorev:'GRV-2026-103', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:3, faturalanabilir:true, aciklama:'Test kümesi hazırlığı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9005', personel:'EMP-006', tarih:'2026-08-01', gorev:'GRV-2026-104', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:7, faturalanabilir:true, aciklama:'Başvuru listesi bileşeni', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9006', personel:'EMP-006', tarih:'2026-07-31', gorev:'GRV-2026-108', proje:'PRJ-2026-005', musteri:'MUS-2026-007',
    sure:5, faturalanabilir:true, aciklama:'Rezervasyon takvimi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9007', personel:'EMP-005', tarih:'2026-08-01', gorev:'GRV-2026-105', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:3, faturalanabilir:true, aciklama:'Logo API sözleşmesi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9008', personel:'EMP-005', tarih:'2026-07-30', gorev:'GRV-2026-105', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:8, faturalanabilir:true, aciklama:'Senkronizasyon servisi taslağı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9009', personel:'EMP-009', tarih:'2026-07-31', gorev:'GRV-2026-113', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:8, faturalanabilir:true, aciklama:'Regresyon test koşumu', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9010', personel:'EMP-004', tarih:'2026-08-01', gorev:'GRV-2026-102', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:5, faturalanabilir:true, aciklama:'Store görselleri', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9011', personel:'EMP-003', tarih:'2026-08-02', gorev:'GRV-2026-109', proje:'PRJ-2026-007', musteri:'MUS-2025-004',
    sure:3, faturalanabilir:true, aciklama:'Bilgi mimarisi taslağı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9012', personel:'EMP-012', tarih:'2026-08-01', gorev:'GRV-2026-112', proje:null, musteri:'MUS-2025-003',
    sure:2, faturalanabilir:false, aciklama:'Tahsilat görüşmesi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9013', personel:'EMP-010', tarih:'2026-08-01', gorev:'GRV-2026-110', proje:null, musteri:null,
    sure:1, faturalanabilir:false, aciklama:'Maliyet raporu hazırlığı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9014', personel:'EMP-002', tarih:'2026-08-02', gorev:'GRV-2026-120', proje:null, musteri:'MUS-2024-001',
    sure:2, faturalanabilir:false, aciklama:'Yenileme teklifi hazırlığı', onay:'Bekliyor', aktif:true },

  /* 2026-W31 haftasının kalan kayıtları. Canonical: bir timesheet'in `toplam` alanı,
     o personelin o haftaya düşen timelog `sure` toplamına eşittir; `faturalanabilir`
     alanı da faturalanabilir kayıtların toplamına eşittir. */
  { kod:'ZMN-9015', personel:'EMP-004', tarih:'2026-07-27', gorev:'GRV-2026-102', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:7, faturalanabilir:true, aciklama:'Store ekran akışı revizyonu', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9016', personel:'EMP-004', tarih:'2026-07-28', gorev:'GRV-2026-102', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:7, faturalanabilir:true, aciklama:'Randevu akışı arayüz düzeni', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9017', personel:'EMP-004', tarih:'2026-07-29', gorev:'GRV-2026-102', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:7, faturalanabilir:true, aciklama:'Bileşen kütüphanesi güncellemesi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9018', personel:'EMP-004', tarih:'2026-07-30', gorev:'GRV-2026-102', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:8, faturalanabilir:true, aciklama:'Tasarım teslim paketi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9019', personel:'EMP-004', tarih:'2026-07-31', gorev:null, proje:null, musteri:null,
    sure:4, faturalanabilir:false, aciklama:'Ekip toplantısı ve tasarım incelemesi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9020', personel:'EMP-005', tarih:'2026-07-27', gorev:'GRV-2026-105', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:7, faturalanabilir:true, aciklama:'Mobil ekip verisi senkron kuyruğu', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9021', personel:'EMP-005', tarih:'2026-07-28', gorev:'GRV-2026-105', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:7, faturalanabilir:true, aciklama:'Yeniden deneme mantığı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9022', personel:'EMP-005', tarih:'2026-07-29', gorev:'GRV-2026-105', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:7, faturalanabilir:true, aciklama:'Hata günlüğü ve izleme', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9023', personel:'EMP-005', tarih:'2026-07-31', gorev:'GRV-2026-105', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:6, faturalanabilir:true, aciklama:'Servis testleri', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9024', personel:'EMP-005', tarih:'2026-07-31', gorev:null, proje:null, musteri:null,
    sure:4, faturalanabilir:false, aciklama:'Teknik borç değerlendirmesi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9025', personel:'EMP-006', tarih:'2026-07-27', gorev:'GRV-2026-104', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:6, faturalanabilir:true, aciklama:'Başvuru filtre bileşeni', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9026', personel:'EMP-006', tarih:'2026-07-27', gorev:null, proje:null, musteri:null,
    sure:3, faturalanabilir:false, aciklama:'Sprint planlama ve kod incelemesi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9027', personel:'EMP-006', tarih:'2026-07-28', gorev:'GRV-2026-104', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:6, faturalanabilir:true, aciklama:'Karar detay ekranı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9028', personel:'EMP-006', tarih:'2026-07-29', gorev:'GRV-2026-108', proje:'PRJ-2026-005', musteri:'MUS-2026-007',
    sure:6, faturalanabilir:true, aciklama:'Rezervasyon formu doğrulama', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9029', personel:'EMP-006', tarih:'2026-07-30', gorev:'GRV-2026-108', proje:'PRJ-2026-005', musteri:'MUS-2026-007',
    sure:6, faturalanabilir:true, aciklama:'Takvim görünümü düzeltmeleri', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9030', personel:'EMP-007', tarih:'2026-07-27', gorev:'GRV-2026-103', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:6, faturalanabilir:true, aciklama:'Veri hattı temizleme adımı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9031', personel:'EMP-007', tarih:'2026-07-28', gorev:'GRV-2026-103', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:6, faturalanabilir:true, aciklama:'Öznitelik üretimi', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9032', personel:'EMP-007', tarih:'2026-07-29', gorev:'GRV-2026-103', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:6, faturalanabilir:true, aciklama:'Model eğitim koşumu', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9033', personel:'EMP-007', tarih:'2026-07-29', gorev:null, proje:null, musteri:null,
    sure:3, faturalanabilir:false, aciklama:'Model gözden geçirme toplantısı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9034', personel:'EMP-007', tarih:'2026-07-30', gorev:'GRV-2026-103', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:6, faturalanabilir:true, aciklama:'Eşik ayarı ve doğrulama', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9035', personel:'EMP-008', tarih:'2026-07-27', gorev:'GRV-2026-101', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:7, faturalanabilir:true, aciklama:'Tarih seçici mobil davranışı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9036', personel:'EMP-008', tarih:'2026-07-28', gorev:'GRV-2026-101', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:7, faturalanabilir:true, aciklama:'Bildirim servisi entegrasyonu', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9037', personel:'EMP-008', tarih:'2026-07-29', gorev:'GRV-2026-101', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:7, faturalanabilir:true, aciklama:'Çevrimdışı önbellek', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9038', personel:'EMP-008', tarih:'2026-07-30', gorev:'GRV-2026-101', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:7, faturalanabilir:true, aciklama:'Sürüm hazırlığı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9039', personel:'EMP-008', tarih:'2026-07-31', gorev:'GRV-2026-101', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:6.5, faturalanabilir:true, aciklama:'Mağaza yükleme kontrolleri', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9040', personel:'EMP-008', tarih:'2026-07-31', gorev:null, proje:null, musteri:null,
    sure:3, faturalanabilir:false, aciklama:'Ekip toplantısı ve teknik borç', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9041', personel:'EMP-009', tarih:'2026-07-27', gorev:'GRV-2026-113', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:7, faturalanabilir:true, aciklama:'Test senaryosu yazımı', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9042', personel:'EMP-009', tarih:'2026-07-28', gorev:'GRV-2026-113', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:7, faturalanabilir:true, aciklama:'Otomasyon koşum ortamı', onay:'Onaylandı', oranSnapshot:571, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9043', personel:'EMP-009', tarih:'2026-07-29', gorev:'GRV-2026-113', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:8, faturalanabilir:true, aciklama:'Regresyon kümesi genişletme', onay:'Onaylandı', oranSnapshot:571, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9044', personel:'EMP-009', tarih:'2026-07-30', gorev:'GRV-2026-113', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:7, faturalanabilir:true, aciklama:'Hata doğrulama turu', onay:'Onaylandı', oranSnapshot:571, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9045', personel:'EMP-009', tarih:'2026-07-30', gorev:null, proje:null, musteri:null,
    sure:3, faturalanabilir:false, aciklama:'Test kapsamı değerlendirmesi', onay:'Onaylandı', oranSnapshot:571, oranKaynak:'bugunOran-geriye', aktif:true },

  /* ---- REVİZE 03 — defterin kapatılmayan sekiz görevi (2026-08-07) --------
     Sekiz görev `gercekSure` taşıyordu ama zaman defterinde **tek satırı**
     yoktu; yani görev "şu kadar çalışıldı" diyor, defter "hiç çalışılmadı"
     diyordu. İkisi de aynı olguyu anlatmaya çalıştığı için biri yanlıştı
     (L-08). Defter kazanmalıydı — ama boş bir defteri kazandırmak, olmuş bir
     işi olmamış saymak olurdu.

     Aşağıdaki sekiz kayıt **uydurulmadı**: her biri var olan bir görev
     kaydından türetildi. Süre görevin `gercekSure` değeri, kişi `sorumlu`su,
     proje/müşteri görevin kendi bağları, tarih görevin `baslangic`–`termin`
     aralığı içinde. Kaynağı `aciklama` alanında **kod olarak** yazılıdır ki
     türetilmiş olduğu sonradan da görülebilsin.

     `onay` ekseni de uydurulmadı: tamamlanmış/arşivlenmiş görevin emeği
     onaylanmıştır, süren görevinki onay bekler. `faturalanabilir` görevin
     kendi `faturalanabilir` alanından okundu — projesiz iç işler false. */
  /* ⚠️ TARİH SEÇİMİ HAFTALIK DEFTERE BAĞLIDIR (2026-08-07 düzeltmesi).
     ZMN-9046 ve ZMN-9050 ilk yazımda 2026-07-28 / 2026-07-27 tarihliydi ve
     ikisi de **2026-W31 haftasının içine** düştü. O hafta EMP-006 için bir
     timesheet taşıyor (TSH-2026-031, `toplam:39`); 31 saatlik iki toplu
     aktarım eklenince haftanın defter toplamı 70'e çıktı ve timesheet
     bildirimiyle çeliştir oldu. Kayıtlar kaynak görevlerinin kendi tarih
     aralığı içinde, haftalık defterin dışına alındı:
     GRV-2026-107 → 07-25 (görev penceresi 07-25…07-30)
     GRV-2026-121 → 07-24 (görev penceresi 07-21…07-29)
     Kural: türetilmiş toplu aktarım kaydı, kapsayan bir timesheet haftasına
     yazılmaz — yoksa haftalık bildirim ile satır kırılımı ayrışır. */
  { kod:'ZMN-9046', personel:'EMP-006', tarih:'2026-07-25', gorev:'GRV-2026-107', proje:'PRJ-2026-006', musteri:'MUS-2026-010',
    sure:18, faturalanabilir:false, aciklama:'GRV-2026-107 revizyon zinciri — görev kaydından aktarıldı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9047', personel:'EMP-003', tarih:'2026-08-01', gorev:'GRV-2026-116', proje:null, musteri:null,
    sure:2, faturalanabilir:false, aciklama:'GRV-2026-116 teknik değerlendirme — görev kaydından aktarıldı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9048', personel:'EMP-005', tarih:'2026-07-24', gorev:'GRV-2026-118', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:9, faturalanabilir:true, aciklama:'GRV-2026-118 push bildirim şablonları — görev kaydından aktarıldı', onay:'Onaylandı', oranSnapshot:863, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9049', personel:'EMP-010', tarih:'2026-07-24', gorev:'GRV-2026-119', proje:'PRJ-2026-004', musteri:'MUS-2026-009',
    sure:5, faturalanabilir:true, aciklama:'GRV-2026-119 — görev kaydından aktarıldı', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9050', personel:'EMP-006', tarih:'2026-07-24', gorev:'GRV-2026-121', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:13, faturalanabilir:true, aciklama:'GRV-2026-121 — görev kaydından aktarıldı', onay:'Onaylandı', oranSnapshot:738, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9051', personel:'EMP-010', tarih:'2026-02-20', gorev:'GRV-2026-124', proje:null, musteri:null,
    sure:9, faturalanabilir:false, aciklama:'GRV-2026-124 arşiv temizliği — görev kaydından aktarıldı', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9052', personel:'EMP-002', tarih:'2026-07-31', gorev:'GRV-2026-125', proje:'PRJ-2026-006', musteri:'MUS-2026-010',
    sure:3, faturalanabilir:false, aciklama:'GRV-2026-125 memnuniyet eskalasyonu — görev kaydından aktarıldı', onay:'Bekliyor', aktif:true },
  { kod:'ZMN-9053', personel:'EMP-006', tarih:'2026-08-03', gorev:'GRV-2026-126', proje:'PRJ-2026-006', musteri:'MUS-2026-010',
    sure:2, faturalanabilir:true, aciklama:'GRV-2026-126 tarih seçici düzeltmesi — görev kaydından aktarıldı', onay:'Bekliyor', aktif:true },

  /* ---- REVİZE 03 — PROJE UCU: modül ilerlemesinden türetilen defter ------
     Ölçüm (2026-08-07): `DB.projects[].harcananSure` 9.125 saat diyordu,
     zaman defterinde bunun karşılığı **308 saatti**. Aradaki ~8.900 saat
     hiçbir kayda dayanmıyordu — talimatın "demo verisini gerçek veri kabul
     etme" yasağının tam hedefi. Sayı olduğu gibi bırakılmadı; **türetilebilen
     kısım türetildi, türetilemeyen kısım üretilmedi.**

     KAYNAK: `DB.projectModules`. Modül var olan bir kayıttır ve üç gerçek
     alan taşır — `efor` (planlanan iş) · `ilerleme` (yüzde) · `sorumlu`
     (gerçek personel) — artı projesi üzerinden gerçek müşteri ve gerçek
     tarih penceresi. Tamamlanan emek = round(efor × ilerleme / 100).

     ÇİFT SAYIM KESİLDİ: `DB.tasks[].modul` bağı sayesinde bir modülün
     defterde ZATEN yazılı saatleri (görevlerinden gelen kayıtlar) hedeften
     düşüldü. Modül ekseninin toplamı hedefi tam karşılar, aşmaz:

     MOD-001 PRJ-2026-001 EMP-008 · efor 180 × %100 = 180 sa · defterde 0 sa · türetilen 180 sa → 5 ay
     MOD-002 PRJ-2026-001 EMP-008 · efor 220 × %88 = 194 sa · defterde 78 sa (GRV-2026-101 · GRV-2026-113) · türetilen 116 sa → 5 ay
     MOD-003 PRJ-2026-001 EMP-005 · efor 140 × %75 = 105 sa · defterde 9 sa (GRV-2026-118) · türetilen 96 sa → 5 ay
     MOD-004 PRJ-2026-001 EMP-006 · efor 260 × %62 = 161 sa · defterde 0 sa · türetilen 161 sa → 5 ay
     MOD-005 PRJ-2026-002 EMP-007 · efor 160 × %100 = 160 sa · defterde 0 sa · türetilen 160 sa → 2 ay
     MOD-006 PRJ-2026-002 EMP-007 · efor 240 × %70 = 168 sa · defterde 33 sa (GRV-2026-103) · türetilen 135 sa → 2 ay
     MOD-007 PRJ-2026-002 EMP-006 · efor 200 × %35 = 70 sa · defterde 19 sa (GRV-2026-104) · türetilen 51 sa → 2 ay
     MOD-009 PRJ-2026-003 EMP-005 · efor 340 × %100 = 340 sa · defterde 0 sa · türetilen 340 sa → 11 ay
     MOD-010 PRJ-2026-003 EMP-006 · efor 420 × %92 = 386 sa · defterde 13 sa (GRV-2026-114 · GRV-2026-121) · türetilen 373 sa → 11 ay
     MOD-011 PRJ-2026-003 EMP-005 · efor 380 × %44 = 167 sa · defterde 38 sa (GRV-2026-105) · türetilen 129 sa → 11 ay
     MOD-012 PRJ-2026-003 EMP-006 · efor 300 × %10 = 30 sa · defterde 0 sa (GRV-2026-106) · türetilen 30 sa → 11 ay
     MOD-013 PRJ-2026-005 EMP-006 · efor 280 × %52 = 146 sa · defterde 17 sa (GRV-2026-108) · türetilen 129 sa → 2 ay
     MOD-014 PRJ-2026-005 EMP-006 · efor 160 × %12 = 19 sa · defterde 0 sa · türetilen 19 sa → 2 ay
     MOD-015 PRJ-2026-006 EMP-006 · efor 180 × %90 = 162 sa · defterde 20 sa (GRV-2026-107 · GRV-2026-126) · türetilen 142 sa → 4 ay

     TARİH: her modülün kalan emeği proje penceresinin aylarına **eşit
     bölündü**; gün modül sırasından türetilir (4·11·18·25) ki aynı kişinin
     paralel modülleri tek güne yığılmasın. Kayıtlar bilerek haftalık
     defterin (2026-W31) dışında kalır — içine düşselerdi timesheet
     bildirimi ile satır kırılımı ayrışırdı.

     ONAY: bu kayıtların hiçbirini bir timesheet kapsamıyor (haftalık defter
     2026-07-27'de başlıyor). Kapanmış döneme ait oldukları için `Onaylandı`
     yazılıdır; `canon.js` eksen 27 "kapsayan timesheet'i olmayan onaylı
     kayıt haftalık defterin başlangıcından ÖNCE olmalı" diyerek bu izni
     bugüne taşınamaz hâle getirir.

     FATURALANDIRMA: beş projenin beşi de sözleşme bedeli taşıyan müşteri
     projesi; modül kapsamındaki emek faturalanabilirdir.

     `modul` alanı YALNIZ görevi olmayan kayıtta yazılıdır — görevli kaydın
     modülü görevinden çözülür ve ikinci kez yazılmaz (L-08).

     TÜRETİLEMEYEN KISIM ÜRETİLMEDİ: yedi arşivli proje ile PRJ-2026-004 /
     PRJ-2026-007'nin modül kırılımı yok, görevi de yok. O projelerin
     ~5.600 saati için tek bir kayıt bile uydurulmadı; ekran onlarda sayı
     basmaz, "zaman defteri bu projeyi kapsamıyor" der (V-45). */

  { kod:'ZMN-9054', personel:'EMP-008', tarih:'2026-03-04', gorev:null, modul:'MOD-001', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:36, faturalanabilir:true, aciklama:'MOD-001 Randevu oluşturma akışı — 2026-03 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9055', personel:'EMP-008', tarih:'2026-04-04', gorev:null, modul:'MOD-001', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:36, faturalanabilir:true, aciklama:'MOD-001 Randevu oluşturma akışı — 2026-04 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9056', personel:'EMP-008', tarih:'2026-05-04', gorev:null, modul:'MOD-001', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:36, faturalanabilir:true, aciklama:'MOD-001 Randevu oluşturma akışı — 2026-05 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9057', personel:'EMP-008', tarih:'2026-06-04', gorev:null, modul:'MOD-001', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:36, faturalanabilir:true, aciklama:'MOD-001 Randevu oluşturma akışı — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9058', personel:'EMP-008', tarih:'2026-07-04', gorev:null, modul:'MOD-001', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:36, faturalanabilir:true, aciklama:'MOD-001 Randevu oluşturma akışı — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9059', personel:'EMP-008', tarih:'2026-03-11', gorev:null, modul:'MOD-002', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:23.2, faturalanabilir:true, aciklama:'MOD-002 Tahlil sonuç görüntüleme — 2026-03 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9060', personel:'EMP-008', tarih:'2026-04-11', gorev:null, modul:'MOD-002', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:23.2, faturalanabilir:true, aciklama:'MOD-002 Tahlil sonuç görüntüleme — 2026-04 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9061', personel:'EMP-008', tarih:'2026-05-11', gorev:null, modul:'MOD-002', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:23.2, faturalanabilir:true, aciklama:'MOD-002 Tahlil sonuç görüntüleme — 2026-05 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9062', personel:'EMP-008', tarih:'2026-06-11', gorev:null, modul:'MOD-002', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:23.2, faturalanabilir:true, aciklama:'MOD-002 Tahlil sonuç görüntüleme — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9063', personel:'EMP-008', tarih:'2026-07-11', gorev:null, modul:'MOD-002', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:23.2, faturalanabilir:true, aciklama:'MOD-002 Tahlil sonuç görüntüleme — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9064', personel:'EMP-005', tarih:'2026-03-18', gorev:null, modul:'MOD-003', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:19.2, faturalanabilir:true, aciklama:'MOD-003 Bildirim ve hatırlatma — 2026-03 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:654, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9065', personel:'EMP-005', tarih:'2026-04-18', gorev:null, modul:'MOD-003', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:19.2, faturalanabilir:true, aciklama:'MOD-003 Bildirim ve hatırlatma — 2026-04 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9066', personel:'EMP-005', tarih:'2026-05-18', gorev:null, modul:'MOD-003', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:19.2, faturalanabilir:true, aciklama:'MOD-003 Bildirim ve hatırlatma — 2026-05 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9067', personel:'EMP-005', tarih:'2026-06-18', gorev:null, modul:'MOD-003', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:19.2, faturalanabilir:true, aciklama:'MOD-003 Bildirim ve hatırlatma — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9068', personel:'EMP-005', tarih:'2026-07-18', gorev:null, modul:'MOD-003', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:19.2, faturalanabilir:true, aciklama:'MOD-003 Bildirim ve hatırlatma — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9069', personel:'EMP-006', tarih:'2026-03-25', gorev:null, modul:'MOD-004', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:32.2, faturalanabilir:true, aciklama:'MOD-004 Yönetim paneli — 2026-03 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9070', personel:'EMP-006', tarih:'2026-04-25', gorev:null, modul:'MOD-004', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:32.2, faturalanabilir:true, aciklama:'MOD-004 Yönetim paneli — 2026-04 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9071', personel:'EMP-006', tarih:'2026-05-25', gorev:null, modul:'MOD-004', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:32.2, faturalanabilir:true, aciklama:'MOD-004 Yönetim paneli — 2026-05 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9072', personel:'EMP-006', tarih:'2026-06-25', gorev:null, modul:'MOD-004', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:32.2, faturalanabilir:true, aciklama:'MOD-004 Yönetim paneli — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9073', personel:'EMP-006', tarih:'2026-07-16', gorev:null, modul:'MOD-004', proje:'PRJ-2026-001', musteri:'MUS-2024-002',
    sure:32.2, faturalanabilir:true, aciklama:'MOD-004 Yönetim paneli — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9074', personel:'EMP-007', tarih:'2026-06-24', gorev:null, modul:'MOD-005', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:80, faturalanabilir:true, aciklama:'MOD-005 Veri hazırlama hattı — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9075', personel:'EMP-007', tarih:'2026-07-04', gorev:null, modul:'MOD-005', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:80, faturalanabilir:true, aciklama:'MOD-005 Veri hazırlama hattı — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:752, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9076', personel:'EMP-007', tarih:'2026-06-25', gorev:null, modul:'MOD-006', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:67.5, faturalanabilir:true, aciklama:'MOD-006 Skorlama modeli — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:752, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9077', personel:'EMP-007', tarih:'2026-07-11', gorev:null, modul:'MOD-006', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:67.5, faturalanabilir:true, aciklama:'MOD-006 Skorlama modeli — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:752, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9078', personel:'EMP-006', tarih:'2026-06-26', gorev:null, modul:'MOD-007', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:25.5, faturalanabilir:true, aciklama:'MOD-007 Başvuru inceleme paneli — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:752, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9079', personel:'EMP-006', tarih:'2026-07-18', gorev:null, modul:'MOD-007', proje:'PRJ-2026-002', musteri:'MUS-2026-011',
    sure:25.5, faturalanabilir:true, aciklama:'MOD-007 Başvuru inceleme paneli — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9080', personel:'EMP-005', tarih:'2025-09-15', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:30.9, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2025-09 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9081', personel:'EMP-005', tarih:'2025-10-04', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:30.9, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2025-10 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9082', personel:'EMP-005', tarih:'2025-11-04', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:30.9, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2025-11 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9083', personel:'EMP-005', tarih:'2025-12-04', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:30.9, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2025-12 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9084', personel:'EMP-005', tarih:'2026-01-04', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:30.9, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2026-01 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9085', personel:'EMP-005', tarih:'2026-02-04', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:30.9, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2026-02 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9086', personel:'EMP-005', tarih:'2026-03-04', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:30.9, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2026-03 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9087', personel:'EMP-005', tarih:'2026-04-04', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:30.9, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2026-04 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9088', personel:'EMP-005', tarih:'2026-05-04', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:30.9, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2026-05 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9089', personel:'EMP-005', tarih:'2026-06-04', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:30.9, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9090', personel:'EMP-005', tarih:'2026-07-04', gorev:null, modul:'MOD-009', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:31, faturalanabilir:true, aciklama:'MOD-009 Mobil ekip yönetimi — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9091', personel:'EMP-006', tarih:'2025-09-16', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:33.9, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2025-09 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9092', personel:'EMP-006', tarih:'2025-10-11', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:33.9, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2025-10 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9093', personel:'EMP-006', tarih:'2025-11-11', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:33.9, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2025-11 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9094', personel:'EMP-006', tarih:'2025-12-11', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:33.9, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2025-12 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9095', personel:'EMP-006', tarih:'2026-01-11', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:33.9, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2026-01 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9096', personel:'EMP-006', tarih:'2026-02-11', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:33.9, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2026-02 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9097', personel:'EMP-006', tarih:'2026-03-11', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:33.9, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2026-03 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9098', personel:'EMP-006', tarih:'2026-04-11', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:33.9, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2026-04 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9099', personel:'EMP-006', tarih:'2026-05-11', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:33.9, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2026-05 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9100', personel:'EMP-006', tarih:'2026-06-11', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:33.9, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9101', personel:'EMP-006', tarih:'2026-07-11', gorev:null, modul:'MOD-010', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:34, faturalanabilir:true, aciklama:'MOD-010 İş emri takibi — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9102', personel:'EMP-005', tarih:'2025-09-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.72, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2025-09 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9103', personel:'EMP-005', tarih:'2025-10-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.72, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2025-10 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9104', personel:'EMP-005', tarih:'2025-11-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.72, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2025-11 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9105', personel:'EMP-005', tarih:'2025-12-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.72, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2025-12 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9106', personel:'EMP-005', tarih:'2026-01-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.72, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2026-01 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9107', personel:'EMP-005', tarih:'2026-02-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.72, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2026-02 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9108', personel:'EMP-005', tarih:'2026-03-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.72, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2026-03 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9109', personel:'EMP-005', tarih:'2026-04-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.72, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2026-04 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9110', personel:'EMP-005', tarih:'2026-05-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.72, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2026-05 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9111', personel:'EMP-005', tarih:'2026-06-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.72, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9112', personel:'EMP-005', tarih:'2026-07-18', gorev:null, modul:'MOD-011', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:11.8, faturalanabilir:true, aciklama:'MOD-011 Logo ERP entegrasyonu — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9113', personel:'EMP-006', tarih:'2025-09-25', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.72, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2025-09 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:821, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9114', personel:'EMP-006', tarih:'2025-10-25', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.72, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2025-10 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9115', personel:'EMP-006', tarih:'2025-11-25', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.72, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2025-11 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9116', personel:'EMP-006', tarih:'2025-12-25', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.72, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2025-12 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9117', personel:'EMP-006', tarih:'2026-01-25', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.72, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2026-01 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9118', personel:'EMP-006', tarih:'2026-02-25', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.72, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2026-02 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9119', personel:'EMP-006', tarih:'2026-03-25', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.72, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2026-03 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9120', personel:'EMP-006', tarih:'2026-04-25', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.72, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2026-04 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9121', personel:'EMP-006', tarih:'2026-05-25', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.72, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2026-05 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9122', personel:'EMP-006', tarih:'2026-06-25', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.72, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9123', personel:'EMP-006', tarih:'2026-07-16', gorev:null, modul:'MOD-012', proje:'PRJ-2026-003', musteri:'MUS-2025-005',
    sure:2.8, faturalanabilir:true, aciklama:'MOD-012 Rapor merkezi — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9124', personel:'EMP-006', tarih:'2026-06-08', gorev:null, modul:'MOD-013', proje:'PRJ-2026-005', musteri:'MUS-2026-007',
    sure:64.5, faturalanabilir:true, aciklama:'MOD-013 Rezervasyon motoru — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9125', personel:'EMP-006', tarih:'2026-07-04', gorev:null, modul:'MOD-013', proje:'PRJ-2026-005', musteri:'MUS-2026-007',
    sure:64.5, faturalanabilir:true, aciklama:'MOD-013 Rezervasyon motoru — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9126', personel:'EMP-006', tarih:'2026-06-11', gorev:null, modul:'MOD-014', proje:'PRJ-2026-005', musteri:'MUS-2026-007',
    sure:9.5, faturalanabilir:true, aciklama:'MOD-014 Ödeme entegrasyonu — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9127', personel:'EMP-006', tarih:'2026-07-11', gorev:null, modul:'MOD-014', proje:'PRJ-2026-005', musteri:'MUS-2026-007',
    sure:9.5, faturalanabilir:true, aciklama:'MOD-014 Ödeme entegrasyonu — 2026-07 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9128', personel:'EMP-006', tarih:'2026-03-18', gorev:null, modul:'MOD-015', proje:'PRJ-2026-006', musteri:'MUS-2026-010',
    sure:35.5, faturalanabilir:true, aciklama:'MOD-015 Servis randevu takvimi — 2026-03 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9129', personel:'EMP-006', tarih:'2026-04-18', gorev:null, modul:'MOD-015', proje:'PRJ-2026-006', musteri:'MUS-2026-010',
    sure:35.5, faturalanabilir:true, aciklama:'MOD-015 Servis randevu takvimi — 2026-04 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9130', personel:'EMP-006', tarih:'2026-05-18', gorev:null, modul:'MOD-015', proje:'PRJ-2026-006', musteri:'MUS-2026-010',
    sure:35.5, faturalanabilir:true, aciklama:'MOD-015 Servis randevu takvimi — 2026-05 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true },
  { kod:'ZMN-9131', personel:'EMP-006', tarih:'2026-06-18', gorev:null, modul:'MOD-015', proje:'PRJ-2026-006', musteri:'MUS-2026-010',
    sure:35.5, faturalanabilir:true, aciklama:'MOD-015 Servis randevu takvimi — 2026-06 ayı payı · modül ilerlemesinden türetildi', onay:'Onaylandı', oranSnapshot:613, oranKaynak:'bugunOran-geriye', aktif:true }
];

/* ---- Haftalık timesheet özeti ------------------------------------------ */
DB.timesheets = [
  { kod:'TSH-2026-030', personel:'EMP-005', hafta:'2026-W31', baslangic:'2026-07-27', bitis:'2026-08-02',
    toplam:42, faturalanabilir:38, eksik:0, fazla:2, durum:'Onay bekliyor', onaylayan:'EMP-003', aktif:true },
  { kod:'TSH-2026-031', personel:'EMP-006', hafta:'2026-W31', baslangic:'2026-07-27', bitis:'2026-08-02',
    toplam:39, faturalanabilir:36, eksik:1, fazla:0, durum:'Onay bekliyor', onaylayan:'EMP-003', aktif:true },
  { kod:'TSH-2026-032', personel:'EMP-007', hafta:'2026-W31', baslangic:'2026-07-27', bitis:'2026-08-02',
    toplam:36, faturalanabilir:33, eksik:4, fazla:0, durum:'Onay bekliyor', onaylayan:'EMP-003', aktif:true },
  { kod:'TSH-2026-033', personel:'EMP-008', hafta:'2026-W31', baslangic:'2026-07-27', bitis:'2026-08-02',
    toplam:44, faturalanabilir:41, eksik:0, fazla:4, durum:'Onay bekliyor', onaylayan:'EMP-003', aktif:true },
  { kod:'TSH-2026-034', personel:'EMP-009', hafta:'2026-W31', baslangic:'2026-07-27', bitis:'2026-08-02',
    toplam:40, faturalanabilir:37, eksik:0, fazla:0, durum:'Onaylandı', onaylayan:'EMP-003', aktif:true },
  { kod:'TSH-2026-035', personel:'EMP-004', hafta:'2026-W31', baslangic:'2026-07-27', bitis:'2026-08-02',
    toplam:38, faturalanabilir:34, eksik:2, fazla:0, durum:'Onay bekliyor', onaylayan:'EMP-003', aktif:true }
];

/* ---- Performans değerlendirmeleri (§14 — karar desteği, otomatik karar YOK) */
DB.performance = [
  { kod:'PRF-2026-Q2-005', personel:'EMP-005', donem:'2026-Q2', durum:'Tamamlandı',
    ozDegerlendirme:4.3, yoneticiDegerlendirme:4.5, pmDegerlendirme:4.4,
    zamanindaTeslim:92, revizyonOrani:8, gorevSayisi:34, kaliteSonucu:4.6,
    problemCozme:5, teknikGelisim:4, ekipCalismasi:4, iletisim:4, musteriGeriBildirim:4.5,
    egitimIhtiyaci:['Sistem mimarisi'], gelisimPlani:'Mimari tasarım liderliği', aktif:true },
  { kod:'PRF-2026-Q2-006', personel:'EMP-006', donem:'2026-Q2', durum:'Tamamlandı',
    ozDegerlendirme:3.9, yoneticiDegerlendirme:4.1, pmDegerlendirme:4.0,
    zamanindaTeslim:84, revizyonOrani:16, gorevSayisi:41, kaliteSonucu:4.0,
    problemCozme:4, teknikGelisim:4, ekipCalismasi:5, iletisim:4, musteriGeriBildirim:3.8,
    egitimIhtiyaci:['Erişilebilirlik','Test otomasyonu'], gelisimPlani:'WCAG sertifikasyonu', aktif:true },
  { kod:'PRF-2026-Q2-007', personel:'EMP-004', donem:'2026-Q2', durum:'Tamamlandı',
    ozDegerlendirme:4.5, yoneticiDegerlendirme:4.6, pmDegerlendirme:4.7,
    zamanindaTeslim:95, revizyonOrani:11, gorevSayisi:28, kaliteSonucu:4.8,
    problemCozme:4, teknikGelisim:5, ekipCalismasi:5, iletisim:5, musteriGeriBildirim:4.7,
    egitimIhtiyaci:[], gelisimPlani:'Tasarım sistemi sahipliği', aktif:true },
  { kod:'PRF-2026-Q2-009', personel:'EMP-009', donem:'2026-Q2', durum:'Tamamlandı',
    ozDegerlendirme:4.0, yoneticiDegerlendirme:4.2, pmDegerlendirme:4.3,
    zamanindaTeslim:97, revizyonOrani:4, gorevSayisi:22, kaliteSonucu:4.5,
    problemCozme:4, teknikGelisim:4, ekipCalismasi:4, iletisim:4, musteriGeriBildirim:4.2,
    egitimIhtiyaci:['Performans testi'], gelisimPlani:'Test otomasyon kapsamı artırma', aktif:true },
  { kod:'PRF-2026-Q3-005', personel:'EMP-005', donem:'2026-Q3', durum:'Açık',
    ozDegerlendirme:null, yoneticiDegerlendirme:null, pmDegerlendirme:null,
    zamanindaTeslim:null, revizyonOrani:null, gorevSayisi:null, kaliteSonucu:null,
    problemCozme:null, teknikGelisim:null, ekipCalismasi:null, iletisim:null, musteriGeriBildirim:null,
    egitimIhtiyaci:[], gelisimPlani:'—', aktif:true }
];

/* ---- Eğitim ve yetkinlik ------------------------------------------------
   YETKİNLİK EKSENİ: `kazanim` eğitimin KAZANDIRDIĞI yetkinliklerdir ve
   `DB.employees[].yetkinlik` ile **aynı sözlükten** gelir — eğitim tamamlanınca
   katılımcının yetkinlik listesine bu değerler eklenir. Ölçüldü: EGT-2026-010
   (Tamamlandı) `kazanim:['Erişilebilirlik']` ve katılımcıları EMP-004 / EMP-006'nın
   `yetkinlik` dizisinde 'Erişilebilirlik' zaten yazılı — eksen veriyle tutarlı.
   Planlanmış eğitimlerin kazanımı henüz katılımcıya İŞLENMEZ; işlenme koşulu
   `durum === 'Tamamlandı'`tır. -------------------------------------------- */
DB.trainings = [
  { kod:'EGT-2026-011', ad:'İleri React Performans Optimizasyonu', tur:'Online kurs', saglayici:'Frontend Masters',
    kazanim:['Performans','React'],
    katilimci:['EMP-006','EMP-016'], baslangic:'2026-08-12', bitis:'2026-09-12', sure:24, maliyet:9800,
    durum:'Planlandı', sertifika:false, aktif:true },
  { kod:'EGT-2026-010', ad:'WCAG 2.2 Erişilebilirlik', tur:'Atölye', saglayici:'A11y TR',
    kazanim:['Erişilebilirlik'],
    katilimci:['EMP-004','EMP-006'], baslangic:'2026-06-15', bitis:'2026-06-16', sure:16, maliyet:14000,
    durum:'Tamamlandı', sertifika:true, aktif:true },
  { kod:'EGT-2026-009', ad:'AWS Solutions Architect Hazırlık', tur:'Online kurs', saglayici:'A Cloud Guru',
    kazanim:['AWS','Altyapı'],
    katilimci:['EMP-010'], baslangic:'2026-05-02', bitis:'2026-07-30', sure:48, maliyet:11200,
    durum:'Tamamlandı', sertifika:true, aktif:true },
  { kod:'EGT-2026-012', ad:'LLM Uygulama Güvenliği', tur:'Seminer', saglayici:'OWASP TR',
    kazanim:['Güvenlik','LLM'],
    katilimci:['EMP-007','EMP-005'], baslangic:'2026-09-08', bitis:'2026-09-08', sure:8, maliyet:0,
    durum:'Planlandı', sertifika:false, aktif:true }
];

/* ---- Kapasite (haftalık) -----------------------------------------------
   BİRİM UYARISI: kartın çoğu alanı **saat** ekseninde, ama `izin` alanı **GÜN**dür.
   Ölçüldü (5. oturum, 10/10 kayıt): `izin` = o personelin `DB.today`'den sonra biten,
   reddedilmemiş izinlerinin `gun` toplamı (EMP-006 → 5 · EMP-007 → 5 · EMP-004 → 3 ·
   EMP-016 → 1, kalanlar 0). Başlıktaki eski "saat" yorumu yanıltıcıydı.
   Ekranda gösterilirken birimi etikete yazılır, saat alanlarıyla toplanmaz.
   ------------------------------------------------------------------------- */
DB.capacity = [
  { personel:'EMP-003', kapasite:40, planlanan:37, doluluk:92, izin:0 },
  { personel:'EMP-004', kapasite:40, planlanan:34, doluluk:86, izin:3 },
  { personel:'EMP-005', kapasite:40, planlanan:39, doluluk:97, izin:0 },
  { personel:'EMP-006', kapasite:40, planlanan:32, doluluk:81, izin:5 },
  { personel:'EMP-007', kapasite:40, planlanan:30, doluluk:74, izin:5 },
  { personel:'EMP-008', kapasite:40, planlanan:35, doluluk:88, izin:0 },
  { personel:'EMP-009', kapasite:40, planlanan:28, doluluk:69, izin:0 },
  { personel:'EMP-010', kapasite:40, planlanan:28, doluluk:71, izin:0 },
  { personel:'EMP-016', kapasite:20, planlanan:9,  doluluk:44, izin:1 },
  { personel:'EMP-015', kapasite:20, planlanan:7,  doluluk:35, izin:0 }
];

/* ---- İşe giriş / işten ayrılış (PROMPT.md §14 — "İşe Giriş/Çıkış") ---------
   Menü haritasında ve plan.md'de yazılıydı ama koleksiyonu da ekranı da yoktu.
   `tur` iki eksenlidir: **Giriş** (onboarding) ve **Çıkış** (offboarding).
   `adimlar` süreç kontrol listesidir — her adım `{ad, tamam, sorumlu}`; ilerleme
   YAZILMAZ, tamamlanan adım oranından türetilir (L-08).
   Kayıtlar personelin kendi `girisTarihi` alanıyla tutarlıdır: giriş süreci
   o tarihte başlar.

   ⚠️ ESKİ KURAL DÜZELTİLDİ (P3-06). Burada "ayrılış kaydı yalnız `aktif:false`
   personelde olabilir" yazıyordu ve bu kural, kendi koyduğu şartla birlikte
   koleksiyonu ÇIKIŞ KAYDI OLMADAN bıraktı: veride `aktif:false` tek bir
   personel yoktu, dolayısıyla `tur:'Çıkış'` sayısı sıfırdı ve `İşe Giriş ve
   Çıkış` ekranının Çıkışlar sekmesi hep boş bir liste basıyordu.
   Kuralın yanlışı şuydu: ayrılış bir AN değil bir SÜREÇtir. Süreç yürürken
   kişi hâlâ çalışır (`aktif:true`, `durum:'Offboarding'`); `aktif:false`
   ancak süreç TAMAMLANINCA (`durum:'Ayrıldı'`) doğar. Doğru bağ artık
   personelin yaşam döngüsü alanıyla kurulur:
     · `durum:'Offboarding'` ↔ `tur:'Çıkış'` · `durum:'Devam ediyor'`
     · `durum:'Ayrıldı'`     ↔ `tur:'Çıkış'` · `durum:'Tamamlandı'` (+ aktif:false) */
/* ---- Süreç şablonları (şartname [4.2.1]/[4.2.3]) --------------------------
   Ölçülen kusur: `DB.onboarding` içindeki üç sürecin adım listesi ELLE
   yazılmıştı. Yeni bir personel açıldığında hangi adımların doğması
   gerektiğini söyleyen hiçbir kayıt yoktu; liste her seferinde yeniden
   hatırlanmak zorundaydı ve "zorunlu evrak" diye bir kavram veride yoktu —
   [4.2.3]'ün `personelEvrak` kapısı ölçecek bir şey bulamazdı.

   ŞABLON MEVCUT KAYITLARDAN TÜRETİLDİ, ONLARA DAYATILMADI. `tip:'temel'`
   şablonların adım adları ve sorumluları, var olan üç sürecin adımlarıyla
   BİREBİR aynıdır — yani şablon o kayıtları yeniden üretebilir, bozmaz.

   BİLEŞİM KURALI: bir personel için önce `tip:'temel'` şablonlardan
   `calismaTipi` eşleşeni seçilir, sonra kapsamı tutan `tip:'ek'` şablonların
   adımları SONUNA eklenir. Kapsam alanları null ise "hepsi" demektir.
   ⚠️ Ek şablonlar var olan üç kayda GERİYE DÖNÜK UYGULANMADI: kapanmış bir
   sürecin adım listesini sonradan uzatmak, o süreçte hiç yapılmamış işi
   yapılmış (ya da eksik) göstermek olurdu (L-13).

   `sorumluRol` bir ROL anahtarıdır (`DB.roles[].key`); tek istisnası
   `yonetici`dir ve "bu personelin kendi bağlı yöneticisi" demektir —
   `DB.employees[].yonetici` alanından çözülür. Aynı ilişki anahtarı
   `DB.approvalFlows` (AKS-IZN-1) içinde de bu anlamda kullanılıyor.
   `gun` süreç ÇAPASINA göre gün farkıdır: Giriş şablonunda çapa `girisTarihi`
   ve değerler ileriye (0, +1, +7); Çıkış şablonunda çapa `cikisTarihi` ve
   değerler çoğunlukla geriye (-30, -14) — son ödeme çıkıştan SONRA gelir. */
DB.onboardingStepTypes = ['Görev','Belge','Hesap','Eğitim','Ekipman'];

DB.onboardingTemplates = [
  { kod:'SBL-GIRIS-KADROLU', ad:'İşe giriş — kadrolu', tur:'Giriş', tip:'temel',
    calismaTipi:'Kadrolu', ustDepartman:null, rol:null, aktif:true,
    adimlar:[
      { ad:'Sözleşme imzası',           tur:'Belge',   sorumluRol:'ik',       gun:0, zorunlu:true },
      { ad:'Özlük dosyası açıldı',      tur:'Belge',   sorumluRol:'ik',       gun:0, zorunlu:true },
      { ad:'Hesap ve e-posta tanımı',   tur:'Hesap',   sorumluRol:'devops',   gun:0, zorunlu:true },
      { ad:'Ekipman zimmeti',           tur:'Ekipman', sorumluRol:'ik',       gun:1, zorunlu:true },
      { ad:'Oryantasyon eğitimi',       tur:'Eğitim',  sorumluRol:'yonetici', gun:3, zorunlu:true },
      { ad:'İlk hafta değerlendirmesi', tur:'Görev',   sorumluRol:'yonetici', gun:7, zorunlu:false }
    ] },
  /* Dış kaynak girişinde ekipman ve ilk hafta değerlendirmesi YOKTUR: kişi
     kendi cihazıyla çalışır ve performans ekseni sözleşmeye bağlıdır.
     IGC-2025-002 bu dört adımla açılmıştı; şablon onu doğruluyor. */
  { kod:'SBL-GIRIS-DISKAYNAK', ad:'İşe giriş — dış kaynak / freelancer', tur:'Giriş', tip:'temel',
    calismaTipi:'Freelancer', ustDepartman:null, rol:null, aktif:true,
    adimlar:[
      { ad:'Sözleşme imzası',         tur:'Belge',  sorumluRol:'ik',       gun:0, zorunlu:true },
      { ad:'Özlük dosyası açıldı',    tur:'Belge',  sorumluRol:'ik',       gun:0, zorunlu:true },
      { ad:'Hesap ve e-posta tanımı', tur:'Hesap',  sorumluRol:'devops',   gun:0, zorunlu:true },
      { ad:'Oryantasyon eğitimi',     tur:'Eğitim', sorumluRol:'yonetici', gun:2, zorunlu:true }
    ] },
  { kod:'SBL-GIRIS-YAZILIM', ad:'Ek adımlar — yazılım ekipleri', tur:'Giriş', tip:'ek',
    calismaTipi:null, ustDepartman:'Yazılım', rol:null, aktif:true,
    adimlar:[
      { ad:'Kod deposu ve CI erişimi',     tur:'Hesap',  sorumluRol:'devops',     gun:0, zorunlu:true },
      { ad:'Geliştirme ortamı kurulumu',   tur:'Görev',  sorumluRol:'takimlideri',gun:1, zorunlu:true },
      { ad:'Kod standartları eğitimi',     tur:'Eğitim', sorumluRol:'takimlideri',gun:5, zorunlu:false }
    ] },
  { kod:'SBL-GIRIS-SATIS', ad:'Ek adımlar — satış ve müşteri', tur:'Giriş', tip:'ek',
    calismaTipi:null, ustDepartman:'Satış & Müşteri', rol:null, aktif:true,
    adimlar:[
      { ad:'CRM ve teklif şablonu erişimi',    tur:'Hesap',  sorumluRol:'satismudur', gun:0, zorunlu:true },
      { ad:'Hizmet kataloğu ve fiyat eğitimi', tur:'Eğitim', sorumluRol:'satismudur', gun:4, zorunlu:true },
      { ad:'Müşteri portföyü devri',           tur:'Görev',  sorumluRol:'satismudur', gun:7, zorunlu:false }
    ] },
  { kod:'SBL-GIRIS-STAJYER', ad:'Ek adımlar — stajyer', tur:'Giriş', tip:'ek',
    calismaTipi:null, ustDepartman:null, rol:'stajyer', aktif:true,
    adimlar:[
      { ad:'Staj sözleşmesi ve okul belgesi', tur:'Belge', sorumluRol:'ik',       gun:0, zorunlu:true },
      { ad:'Mentör ataması',                  tur:'Görev', sorumluRol:'yonetici', gun:0, zorunlu:true }
    ] },
  /* Çıkış şablonu — `DB.transitions.employee` içindeki `personelZimmet`
     kapısının veri karşılığı "Zimmet iadesi" adımıdır. Kapı yordamı
     `DB.assets` üzerinden ölçer; adım ise sürecin görünür yüzüdür. */
  { kod:'SBL-CIKIS-STD', ad:'İşten çıkış — standart', tur:'Çıkış', tip:'temel',
    calismaTipi:null, ustDepartman:null, rol:null, aktif:true,
    adimlar:[
      { ad:'Çıkış bildirimi ve onayı', tur:'Belge',   sorumluRol:'ik',       gun:-30, zorunlu:true },
      { ad:'Görev ve dosya devri',     tur:'Görev',   sorumluRol:'yonetici', gun:-14, zorunlu:true },
      { ad:'Zimmet iadesi',            tur:'Ekipman', sorumluRol:'ik',       gun:-7,  zorunlu:true },
      { ad:'Hesap ve erişim kapatma',  tur:'Hesap',   sorumluRol:'devops',   gun:0,   zorunlu:true },
      { ad:'Çıkış görüşmesi',          tur:'Görev',   sorumluRol:'ik',       gun:-1,  zorunlu:false },
      { ad:'Son ödeme ve ibraname',    tur:'Belge',   sorumluRol:'muhasebe', gun:5,   zorunlu:true }
    ] }
];

DB.onboarding = [
  /* İLK ÇIKIŞ KAYDI (P3-06). `tur:'Çıkış'` sayısı bu kayda kadar SIFIRDI ve
     ekranın Çıkışlar sekmesi boş bir liste basıyordu. Kayıt SBL-CIKIS-STD
     şablonundan üretildi; sorumlular EMP-015'in kendi bağlarından çözüldü
     (yonetici EMP-004 · ik EMP-011 · devops EMP-010 · muhasebe EMP-012).
     `tarih` çıkış tarihidir ve personel kartındaki `cikisTarihi` ile aynıdır.
     Zimmet adımı TAMAM: ZMT-2025-005 zaten 2026-05-14'te iade edilmişti. */
  { kod:'IGC-2026-004', personel:'EMP-015', tur:'Çıkış', tarih:'2026-08-31', durum:'Devam ediyor',
    sorumlu:'EMP-011', not:'Hizmet sözleşmesi süresi doluyor, yenilenmeyecek. İhbar süresi sürüyor.',
    adimlar:[
      { ad:'Çıkış bildirimi ve onayı', tamam:true,  sorumlu:'EMP-011' },
      { ad:'Görev ve dosya devri', tamam:false, sorumlu:'EMP-004' },
      { ad:'Zimmet iadesi', tamam:true,  sorumlu:'EMP-011' },
      { ad:'Hesap ve erişim kapatma', tamam:false, sorumlu:'EMP-010' },
      { ad:'Çıkış görüşmesi', tamam:false, sorumlu:'EMP-011' },
      { ad:'Son ödeme ve ibraname', tamam:false, sorumlu:'EMP-012' }
    ], aktif:true },
  { kod:'IGC-2026-001', personel:'EMP-016', tur:'Giriş', tarih:'2026-06-15', durum:'Devam ediyor',
    sorumlu:'EMP-011', not:'Staj sözleşmesi imzalandı, ekipman bekleniyor.',
    adimlar:[
      { ad:'Sözleşme imzası', tamam:true, sorumlu:'EMP-011' },
      { ad:'Özlük dosyası açıldı', tamam:true, sorumlu:'EMP-011' },
      { ad:'Hesap ve e-posta tanımı', tamam:true, sorumlu:'EMP-010' },
      { ad:'Ekipman zimmeti', tamam:false, sorumlu:'EMP-011' },
      { ad:'Oryantasyon eğitimi', tamam:false, sorumlu:'EMP-006' },
      { ad:'İlk hafta değerlendirmesi', tamam:false, sorumlu:'EMP-006' }
    ], aktif:true },
  { kod:'IGC-2025-002', personel:'EMP-015', tur:'Giriş', tarih:'2025-06-01', durum:'Tamamlandı',
    sorumlu:'EMP-011', not:'Freelance sözleşme; ekipman kendi cihazı.',
    adimlar:[
      { ad:'Sözleşme imzası', tamam:true, sorumlu:'EMP-011' },
      { ad:'Özlük dosyası açıldı', tamam:true, sorumlu:'EMP-011' },
      { ad:'Hesap ve e-posta tanımı', tamam:true, sorumlu:'EMP-010' },
      { ad:'Oryantasyon eğitimi', tamam:true, sorumlu:'EMP-004' }
    ], aktif:true },
  { kod:'IGC-2025-003', personel:'EMP-014', tur:'Giriş', tarih:'2025-02-03', durum:'Tamamlandı',
    sorumlu:'EMP-011', not:'Satış ekibine katıldı.',
    adimlar:[
      { ad:'Sözleşme imzası', tamam:true, sorumlu:'EMP-011' },
      { ad:'Özlük dosyası açıldı', tamam:true, sorumlu:'EMP-011' },
      { ad:'Hesap ve e-posta tanımı', tamam:true, sorumlu:'EMP-010' },
      { ad:'Ekipman zimmeti', tamam:true, sorumlu:'EMP-011' },
      { ad:'Oryantasyon eğitimi', tamam:true, sorumlu:'EMP-002' },
      { ad:'İlk hafta değerlendirmesi', tamam:true, sorumlu:'EMP-002' }
    ], aktif:true }
];

/* =======================================================================
   K-18 · BAYAT EKSEN — `DB.employees[].aktif` TUZAĞA ÇEVRİLDİ

   Ölçüldü: alan 16 kaydın 16'sında `true`. Yani hiçbir şey ayırt etmiyordu.
   Yedi ekran `e.aktif !== false` yazarak "çalışan personel" listesi kuruyor
   ve `EMP-015`i (durum `Offboarding`, çıkış 2026-08-31) o listeye koyuyordu.

   Yaşam döngüsü `durum` alanında yaşar (`DB.employeeStatuses`, 7 değer) ve
   geçişleri `GV.flow` `employee` varlığı yürütür. Sorular artık türetilir:
     GV.hr.istihdamda(e)  — bordroda mı
     GV.hr.atanabilir(e)  — YENİ iş verilebilir mi
     GV.hr.atanabilirler()— hazır atama listesi

   Alan silinmedi, TUZAĞA çevrildi: okuyan olursa sayaç artar ve `undefined`
   döner. `tasks/qa/ik-ekseni.js` tek bir okuma kalırsa kırmızı yanar.
   Aynı disiplin `DB.customers[].durum` için K-21'de kuruldu (lifecycle.js).
   ======================================================================= */
(function(){
  if(!window.DB || !DB.employees) return;

  DB.ikBayat = { okuma:[], yazma:[], sayac:0 };

  DB.employees.forEach(function(e){
    if(!Object.getOwnPropertyDescriptor(e, 'aktif')) return;
    delete e.aktif;
    Object.defineProperty(e, 'aktif', {
      configurable:true,
      enumerable:false,
      get:function(){
        DB.ikBayat.okuma.push({ alan:'aktif', kod:e.kod });
        DB.ikBayat.sayac++;
        return undefined;
      },
      set:function(){
        DB.ikBayat.yazma.push({ alan:'aktif', kod:e.kod });
        DB.ikBayat.sayac++;
      }
    });
  });
})();

/* =======================================================================
   ZİMMET KABULÜ ÇELİŞKİSİ — TEK KAYNAK `DB.assignments` (K-18 eki)

   Ölçüldü: envanter kaydı zimmet TUTANAĞI YAZILDIĞI AN güncelleniyordu,
   personelin kabulü beklenmiyordu. Somut kanıt — `ZMT-2026-007`:
     tutanak durumu   : Aktif
     personel onayı   : **Bekliyor**
     envanter kaydı   : `zimmetli:'EMP-006'` · `durum:'Zimmetli'`
   Yani envanter "bu cihaz EMP-006'da" diyordu, tutanak "henüz kabul
   etmedi" diyordu. İki defter aynı soruya iki cevap veriyordu.

   KARAR: `DB.assets[].zimmetli` ve `[].durum` **TÜRETİLMİŞ görünümdür**;
   tek kaynak zimmet defteridir. Değerler yükleme anında yeniden hesaplanır
   ve elle yazılmış olan hayatta kalmaz — `GV.fin.tazeleHepsi`nin fatura
   durumları için yaptığının aynısı.

   KABUL KURALI: zimmet ancak personel onayladığında envanteri "Zimmetli"
   yapar. Onay beklerken cihaz **`Zimmet bekliyor`** durumundadır — ne
   depoda ne de teslim edilmiş sayılır. Bu ara durumu yok saymak, kabul
   edilmemiş bir teslimi teslim edilmiş göstermek olurdu.
   ======================================================================= */
DB.assetStatuses = ['Depoda','Zimmet bekliyor','Zimmetli','Aktif','Hurda'];
