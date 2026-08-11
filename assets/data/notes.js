/* =====================================================================
   GAVIAWORKS CRM — KİŞİSEL NOTLAR (Çalışma Alanım)
   Şartname §15 · şema [15.3.1] / [15.3.2] · kararlar ADR-13 · ADR-14

   ⚠️ BU KOLEKSİYON KURUMSAL VERİ DEĞİLDİR.
   Diğer bütün `assets/data/*.js` dosyaları şirketin ortak kaydını tutar:
   herkesin — yetkisi ölçüsünde — görebildiği müşteri, proje, fatura. Bu dosya
   tersidir: her kayıt **tek bir kişinin** kendi çalışma alanıdır ve sahibi
   dışında hiç kimse (yönetici, sistem yöneticisi, rapor, arama, denetim
   defteri, dışa aktarma) içeriğini görmez.

   Bu yüzden koleksiyon AYRI DOSYADADIR ve yalnız Notlarım ekranları onu
   yükler. Amaç kozmetik değil ölçülebilir: bir ekran bu dosyayı yüklemiyorsa
   `DB.personalNotes` orada tanımsızdır, yani sızıntı yolu **fiziksel olarak**
   kapalıdır. `tasks/qa/dbref.js` bunu zaten tarıyor.

   ⚠️ PROTOTİP SINIRI — DÜRÜST KAYIT.
   Gerçek izolasyon burada SAĞLANAMAZ. Veri tarayıcıya tam yükleniyor ve owner
   süzgeci istemcide çalışıyor; konsolu açan biri `DB.personalNotes`'u okur.
   Şartname [15.4.1]–[15.4.3] bunun sunucu tarafında `owner_user_id` kapsamıyla
   yapılmasını istiyor. Bu, **modül canlıya çıkmadan kapatılması zorunlu bir
   açıktır** ve `docs/Q-cloud-turu-kapanis.md` §4'te kayıtlıdır. Ekranda bu
   sınır SÖYLENMEZ (kullanıcıya güvenlik açığı duyurulmaz); kodda ve raporda
   yazılıdır.

   Tarih ekseni: BUGÜN = DB.today (org.js).
   ===================================================================== */
window.DB = window.DB || {};

/* [15.3.1] — `owner` istemciden ALINMAZ, oturumdan atanır (bkz. GV.notes).
   Alan adları prototipte kısa tutuldu; şartnamedeki karşılıkları:
     kod → id · owner → owner_user_id · baslik → title · body → body
     durum → status (Açık / Tamamlandı / Arşiv) · oncelik → priority
     kategori → category · renk → color · sabit → is_pinned
     bitis → due_at · hatirlatma → reminder_at · sira → sort_order
     olusturma → created_at · guncelleme → updated_at
     tamamlanma → completed_at · arsivlenme → archived_at · silinme → deleted_at
   `tenant_id` YOK: ADR-15 tek tenant kararı verdi. */
DB.personalNotes = [
  { kod:'NOT-001', owner:'EMP-001', baslik:'Q3 kapanış görüşmesi hazırlığı',
    body:'Genel müdür toplantısından önce: satış hunisinin son 3 aylık dönüşüm oranını çıkar, kaybedilen üç büyük teklifin gerekçesini tek sayfada topla, ekip büyütme talebini rakamla destekle.',
    durum:'Açık', oncelik:'Yüksek', kategori:'Toplantı', renk:'amber', sabit:true,
    bitis:'2026-08-12', hatirlatma:'2026-08-11', sira:1,
    olusturma:'2026-08-01T09:20', guncelleme:'2026-08-03T14:05',
    tamamlanma:null, arsivlenme:null, silinme:null },

  { kod:'NOT-002', owner:'EMP-001', baslik:'Kişisel okuma listesi',
    body:'Ekip ölçeklendirme üzerine iki kitap; ayrıca yeni sözleşme şablonunu hukukla gözden geçirmeden imzalamamayı hatırla.',
    durum:'Açık', oncelik:'Düşük', kategori:'Kişisel', renk:'mavi', sabit:false,
    bitis:null, hatirlatma:null, sira:2,
    olusturma:'2026-07-22T18:40', guncelleme:'2026-07-22T18:40',
    tamamlanma:null, arsivlenme:null, silinme:null },

  { kod:'NOT-003', owner:'EMP-004', baslik:'Sprint retrospektif notlarım',
    body:'Kendi gözlemim: kod incelemesi darboğaz oluyor, iki kişilik onay kuralı tek kişiye düşünce bekleme uzuyor. Retro toplantısında dile getirmeden önce ölçüp getir.',
    durum:'Açık', oncelik:'Orta', kategori:'Proje', renk:'mor', sabit:false,
    bitis:'2026-08-07', hatirlatma:'2026-08-06', sira:1,
    olusturma:'2026-08-02T11:15', guncelleme:'2026-08-02T11:15',
    tamamlanma:null, arsivlenme:null, silinme:null },

  { kod:'NOT-004', owner:'EMP-004', baslik:'Yıllık izin planı taslağı',
    body:'Eylül ikinci haftası uygun görünüyor; ekipte aynı tarihte kimse yoksa talebi aç. Önce teslim takvimini kontrol et.',
    durum:'Tamamlandı', oncelik:'Orta', kategori:'Kişisel', renk:'yesil', sabit:false,
    bitis:'2026-07-30', hatirlatma:null, sira:2,
    olusturma:'2026-07-25T08:05', guncelleme:'2026-07-30T16:20',
    tamamlanma:'2026-07-30T16:20', arsivlenme:null, silinme:null },

  { kod:'NOT-005', owner:'EMP-007', baslik:'Müşteri görüşmesi kişisel hatırlatmalar',
    body:'Görüşmede teknik ekipten kimseyi yalnız bırakma; fiyat sorusunu ben cevaplayayım. Bu not paylaşılan toplantı notu değildir, kendi hazırlığımdır.',
    durum:'Açık', oncelik:'Yüksek', kategori:'Müşteri', renk:'kirmizi', sabit:true,
    bitis:'2026-08-05', hatirlatma:'2026-08-04', sira:1,
    olusturma:'2026-08-03T07:50', guncelleme:'2026-08-03T07:50',
    tamamlanma:null, arsivlenme:null, silinme:null },

  { kod:'NOT-006', owner:'EMP-007', baslik:'Eski kampanya fikirleri',
    body:'Geçen yıl denenmeyen üç fikir; arşivde dursun, gerekirse geri çağırırım.',
    durum:'Arşiv', oncelik:'Düşük', kategori:'Kişisel', renk:'gri', sabit:false,
    bitis:null, hatirlatma:null, sira:3,
    olusturma:'2026-05-14T13:00', guncelleme:'2026-07-01T10:10',
    tamamlanma:null, arsivlenme:'2026-07-01T10:10', silinme:null }
];

/* [15.3.2] — kontrol listesi maddeleri. `owner` notunkiyle AYNI olmak
   zorundadır; `GV.notes` bunu yazarken kopyalar, ekran girmez. */
DB.personalNoteChecklistItems = [
  { kod:'NKL-001', not:'NOT-001', owner:'EMP-001', metin:'Dönüşüm oranı tablosunu çıkar', isaretli:true,  isaretTarihi:'2026-08-02T10:00', sira:1 },
  { kod:'NKL-002', not:'NOT-001', owner:'EMP-001', metin:'Kaybedilen teklif gerekçelerini topla', isaretli:false, isaretTarihi:null, sira:2 },
  { kod:'NKL-003', not:'NOT-001', owner:'EMP-001', metin:'Ekip büyütme talebini rakamla destekle', isaretli:false, isaretTarihi:null, sira:3 },
  { kod:'NKL-004', not:'NOT-003', owner:'EMP-004', metin:'İnceleme bekleme süresini ölç', isaretli:true,  isaretTarihi:'2026-08-03T09:30', sira:1 },
  { kod:'NKL-005', not:'NOT-003', owner:'EMP-004', metin:'Retro gündemine ekle', isaretli:false, isaretTarihi:null, sira:2 },
  { kod:'NKL-006', not:'NOT-004', owner:'EMP-004', metin:'Teslim takvimini kontrol et', isaretli:true, isaretTarihi:'2026-07-29T12:00', sira:1 },
  { kod:'NKL-007', not:'NOT-004', owner:'EMP-004', metin:'İzin talebini aç', isaretli:true, isaretTarihi:'2026-07-30T16:20', sira:2 },
  { kod:'NKL-008', not:'NOT-005', owner:'EMP-007', metin:'Teknik ekiple ön görüşme', isaretli:false, isaretTarihi:null, sira:1 }
];

/* Sözlükler — ekranlar bunları elle yazmaz (L-31: ada atıf yapan kural, adın
   gerçekten var olduğu bir kümeden beslenir). */
DB.noteStatuses   = ['Açık','Tamamlandı','Arşiv'];
DB.notePriorities = ['Yüksek','Orta','Düşük'];
DB.noteCategories = ['Kişisel','Toplantı','Proje','Müşteri','Fikir'];
DB.noteColors     = ['amber','mavi','mor','yesil','kirmizi','gri'];

/* ADR-14 — yumuşak silme 7 gün geri alınabilir. Süre kullanıcıya YAZILIR;
   sessiz bir saklama süresi, kullanıcının kendi verisi üzerinde bilmediği bir
   kural demektir. */
DB.noteTrashDays = 7;
