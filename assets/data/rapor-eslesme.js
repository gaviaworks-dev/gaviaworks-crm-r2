/* =====================================================================
   GAVIAWORKS CRM R2 — 105 RAPOR TANIMININ ALTI ŞABLONA EŞLEMESİ
   Şartname §7.1 · karar ADR-R2-05

   §7.1: "Mevcut 105 rapor tanımı ilk aşamada SİLİNMEMELİDİR. Her biri bu altı
   şablondan birinin drill-down filtresi veya dışa aktarma görünümü olarak
   eşlenmelidir."

   ⚠️ NEDEN AYRI DOSYA
   `assets/data/reports.js` ÜRETİLEN bir dosyadır — başındaki not açıkça
   "BU DOSYA ÜRETİLİR, ELLE DÜZENLENMEZ" diyor ve üreteci (`reg.js`) R2'ye
   taşınmadı. Eşleme alanını oraya elle yazmak, ilk yeniden üretimde sessizce
   silinmek demekti. Bu yüzden eşleme burada, KENDİ dosyasında durur ve
   `report_key` + `category` çiftiyle bağlanır — kayıt kodu değişse bile
   eşleme kopmaz.

   ⚠️ UYDURMA HEDEF YOK
   Hedefi olmayan kayda şablon atanmaz. 21 kayıt bilerek şablonsuzdur ve
   "Ayrıntılı analiz" kataloğunda kalır (§4). Katalog YALNIZ yetkili
   yöneticiye açılır; §7.1: "standart kullanıcıya katalog gösterilmemelidir."
   ===================================================================== */
window.DB = window.DB || {};

(function(){
  'use strict';

  /* Altı şablon — anahtarlar `app-rapor.html` içindeki rapor anahtarlarıdır. */
  DB.reportTemplates = {
    'satis-ozeti':    { ad:'Satış Özeti' },
    'musteri-sagligi':{ ad:'Müşteri Sağlığı' },
    'proje-teslimati':{ ad:'Proje Teslimatı' },
    'is-kapasite':    { ad:'İş ve Kapasite' },
    'nakit-tahsilat': { ad:'Nakit ve Tahsilat' },
    'hizmet-destek':  { ad:'Hizmet ve Destek' }
  };

  /* ---------------------------------------------------------------
     EŞLEME TABLOSU — `kategori` → { report_key: sablon }

     Her satır elle ve gerekçeyle yazıldı; otomatik bir kural (ör. "kategori
     adına bak") 105 kaydın hepsini doğru yere koymuyordu. Örnek: `Müşteri`
     kategorisindeki 14 kaydın 14'ü Müşteri Sağlığı'na ait değil — `finans`,
     `tahsilat` ve `karlilik` para raporudur, `teklif` ve `donusum` satış
     raporudur.
     --------------------------------------------------------------- */
  var ESLEME = {

    /* Satış ve Finans (18) — sekizi satış hunisi, onu para ekseni */
    'Satış ve Finans':{
      leadkaynak:'satis-ozeti', donusum:'satis-ozeti', teklif:'satis-ozeti',
      kazanilan:'satis-ozeti', kaybedilen:'satis-ozeti', tahminigelir:'satis-ozeti',
      temsilci:'satis-ozeti', satissure:'satis-ozeti',
      projebutce:'nakit-tahsilat', projemaliyet:'nakit-tahsilat',
      musterikar:'nakit-tahsilat', hizmetkar:'nakit-tahsilat',
      tahsilat:'nakit-tahsilat', geciken:'nakit-tahsilat',
      aylikgelir:'nakit-tahsilat', nakit:'nakit-tahsilat',
      tekrarlayan:'nakit-tahsilat', sozlesmebitis:'nakit-tahsilat'
    },

    /* Müşteri (14) — kategori adı yanıltıcı, içerik dört şablona dağılıyor */
    'Müşteri':{
      genel:'musteri-sagligi', iletisim:'musteri-sagligi', risk:'musteri-sagligi',
      yenileme:'musteri-sagligi', capraz:'musteri-sagligi', ltv:'musteri-sagligi',
      memnuniyet:'hizmet-destek', destek:'hizmet-destek',
      teklif:'satis-ozeti', donusum:'satis-ozeti',
      proje:'proje-teslimati',
      finans:'nakit-tahsilat', tahsilat:'nakit-tahsilat', karlilik:'nakit-tahsilat'
    },

    /* Proje (12) — biri hariç hepsi teslimat; `butce` para ekseni */
    'Proje':{
      saglik:'proje-teslimati', ilerleme:'proje-teslimati', modul:'proje-teslimati',
      sure:'proje-teslimati', milestone:'proje-teslimati', sprint:'proje-teslimati',
      test:'proje-teslimati', hata:'proje-teslimati', teslim:'proje-teslimati',
      degisiklik:'proje-teslimati', kaynak:'proje-teslimati',
      butce:'nakit-tahsilat'
    },

    /* Görev ve Zaman (19) — tamamı İş ve Kapasite */
    'Görev ve Zaman':{
      acik:'is-kapasite', geciken:'is-kapasite', engellenen:'is-kapasite',
      atanmamis:'is-kapasite', bekleyen:'is-kapasite', kontrol:'is-kapasite',
      revize:'is-kapasite', tamamlanan:'is-kapasite', departman:'is-kapasite',
      projeBazli:'is-kapasite', musteriBazli:'is-kapasite', sure:'is-kapasite',
      zamaninda:'is-kapasite', revizyonOrani:'is-kapasite', yenidenAcilma:'is-kapasite',
      kalite:'is-kapasite', talep:'is-kapasite', sohbet:'is-kapasite',
      toplanti:'is-kapasite'
    },

    /* İnsan Kaynakları (13) — on biri iş yükü ekseni.
       `zimmet` ve `arac` VARLIK raporudur; altı şablonun hiçbiri varlık
       ölçmüyor. Zorla İş ve Kapasite'ye itmek, "kaç kişi kaç saat çalışıyor"
       sorusuna "kaç aracımız var" cevabını karıştırmak olurdu. Katalogda
       kalıyorlar — hedef UYDURULMADI. */
    'İnsan Kaynakları':{
      genel:'is-kapasite', gorev:'is-kapasite', isyuku:'is-kapasite',
      katki:'is-kapasite', zaman:'is-kapasite', kapasite:'is-kapasite',
      mesai:'is-kapasite', eksik:'is-kapasite', performans:'is-kapasite',
      egitim:'is-kapasite', izin:'is-kapasite',
      zimmet:null, arac:null
    },

    /* Yönlendirme (10) — ADR-R2-04 gereği ikiye ayrılır: yönlendirme
       KANALI satış raporudur, yönlendirme BEDELİ (komisyon) para raporudur.
       Karar birebir şöyleydi: "komisyon Finans raporunda satır olur." */
    'Yönlendirme':{
      kaynaklar:'satis-ozeti', performans:'satis-ozeti', donusum:'satis-ozeti',
      personel:'satis-ozeti', musteriRef:'satis-ozeti', devamlilik:'satis-ozeti',
      ciro:'nakit-tahsilat', kar:'nakit-tahsilat',
      odenen:'nakit-tahsilat', bekleyen:'nakit-tahsilat'
    },

    /* Filo (19) — ADR-R2-05: yedinci şablon AÇILMAZ, altı şablon korunur.
       On dokuzunun hiçbiri altı şablona düşmüyor; hepsi katalogda kalır.
       Bu, kararın uygulanmış hâlidir — kayıp değil, bilinçli konum. */
    'Filo':{
      aktif:null, tahsisli:null, ortak:null, serviste:null,
      bakimYaklasan:null, bakimGeciken:null, muayene:null, sigorta:null,
      kasko:null, yakit:null, gider:null, kmMaliyet:null,
      personelKullanim:null, depKullanim:null, projeKullanim:null,
      kaza:null, ceza:null, kiralama:null, sahiplik:null
    }
  };

  /* ---------------------------------------------------------------
     Kayıt → şablon. Eşleşmeyen kayıt `null` döner; çağıran bunu
     "katalogda kalır" diye okur, "hata" diye değil.
     --------------------------------------------------------------- */
  DB.reportTemplateOf = function(rec){
    if(!rec) return null;
    var k = ESLEME[rec.category];
    if(!k) return null;                       /* bilinmeyen kategori */
    var v = k[rec.report_key];
    return v || null;
  };

  /* Bir şablonun drill-down kataloğu — rapor yüzeyi bunu basar. */
  DB.reportsForTemplate = function(sablon){
    return (DB.reportRegistry || []).filter(function(r){
      return DB.reportTemplateOf(r) === sablon;
    });
  };

  /* Şablonsuz kalanlar — "Ayrıntılı analiz" kataloğu (§7.1 · ADR-R2-05).
     Bu liste DÜRÜSTÇE listelenir, gizlenmez. */
  DB.reportsUnmapped = function(){
    return (DB.reportRegistry || []).filter(function(r){
      return !DB.reportTemplateOf(r);
    });
  };

  /* Ölçüm kapısı — eksen ve ekran aynı yerden sayar (R1 dersi L-40). */
  DB.reportMappingStats = function(){
    var out = { toplam:(DB.reportRegistry || []).length, eslesen:0, hedefsiz:0, sablon:{} };
    Object.keys(DB.reportTemplates).forEach(function(k){ out.sablon[k] = 0; });
    (DB.reportRegistry || []).forEach(function(r){
      var s = DB.reportTemplateOf(r);
      if(s){ out.eslesen++; out.sablon[s]++; }
      else out.hedefsiz++;
    });
    return out;
  };

  /* Eşleme tablosunun KENDİSİ de denetlenir: tabloda yazılı bir
     `report_key` defterde yoksa, eşleme bayatlamış demektir. `reports.js`
     yeniden üretildiğinde bu, sessiz kaymayı yakalayan tek şeydir. */
  DB.reportMappingAudit = function(){
    var defter = {};
    (DB.reportRegistry || []).forEach(function(r){
      (defter[r.category] = defter[r.category] || {})[r.report_key] = true;
    });
    var yetimEsleme = [];   /* eşlemede var, defterde yok */
    var eksikKayit  = [];   /* defterde var, eşlemede yok */
    Object.keys(ESLEME).forEach(function(cat){
      Object.keys(ESLEME[cat]).forEach(function(key){
        if(!defter[cat] || !defter[cat][key]) yetimEsleme.push(cat + '/' + key);
      });
    });
    Object.keys(defter).forEach(function(cat){
      Object.keys(defter[cat]).forEach(function(key){
        if(!ESLEME[cat] || !(key in ESLEME[cat])) eksikKayit.push(cat + '/' + key);
      });
    });
    return { yetimEsleme:yetimEsleme, eksikKayit:eksikKayit };
  };
})();
