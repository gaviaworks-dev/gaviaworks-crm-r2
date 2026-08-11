/* =====================================================================
   GAVIAWORKS CRM R2 — ÖDEME LİNKLERİ VERİ VE DURUM MAKİNESİ
   Şartname §8 · tasks/sadelestirme-talimati.md

   İKİ İŞ YAPAR:
     1. `GV.flow`a ONALTINCI geçiş varlığını ekler (`paymentLink`) — motor
        YENİDEN YAZILMAZ, tabloya bir varlık EKLENİR. Karar R-02 / onaylı.
     2. Mevcut fatura kayıtlarından ödeme linki TÜRETİR.

   ⚠️ UYDURMA KAYIT YOK
   Link üretilen tek kaynak `DB.invoices` içindeki AÇIK BAKİYELİ faturadır.
   Ölçüldü: 17 faturanın 10'u tam ödenmiş, 7'sinin bakiyesi açık, 2'si vadesi
   geçmiş. Yani 7 link doğar.

   Tam ödenmiş 10 fatura için link ÜRETİLMEZ. Üretmek, o tahsilatların bir
   ödeme linki üzerinden geldiğini iddia etmek olurdu; kaynak veri bunu
   söylemiyor (tahsilat `DB.payments` üzerinden yapılmış). R1 dersi L-13:
   bağ veride yoksa uydurulmaz.

   Aynı sebeple `DB.paymentAttempts`, `DB.paymentTransactions` ve
   `DB.webhookEvents` BOŞ doğar ve BİLEREK BOŞTUR: bu depoda hiçbir ödeme
   bir sağlayıcıdan geçmedi. Boş koleksiyon dürüsttür, uydurulmuş bir deneme
   kaydı değildir.
   ===================================================================== */
window.DB = window.DB || {};

(function(){
  'use strict';

  /* ===================================================================
     1. DURUM SÖZLÜĞÜ — şartname §8.4 tablosu BİREBİR

     Depolanan değer BÜYÜK HARF KODUDUR (TASLAK, AKTIF, …). Diğer on beş
     varlık görünen adı saklıyor; ödeme linkinde kod tercih edildi çünkü
     şartname §13 promptu kodları açıkça sayıyor ve dış sistemle (sağlayıcı,
     webhook) eşleşecek eksen odur. Görünen ad ve ton bu sözlükten okunur —
     ekran kendi çevirisini yazmaz.
     =================================================================== */
  DB.paymentLinkStages = {
    TASLAK:          { ad:'Taslak',          tone:'',          sira:1,  anlam:'Henüz paylaşıma açık değil' },
    AKTIF:           { ad:'Aktif',           tone:'is-ok',     sira:2,  anlam:'Ödeme kabul ediyor' },
    ACILDI:          { ad:'Açıldı',          tone:'is-info',   sira:3,  anlam:'Müşteri linki görüntüledi' },
    ISLEMDE:         { ad:'İşlemde',         tone:'is-warn',   sira:4,  anlam:'Sağlayıcı sonucu bekleniyor' },
    KISMI_ODENDI:    { ad:'Kısmi Ödendi',    tone:'is-warn',   sira:5,  anlam:'Kalan bakiye var' },
    ODENDI:          { ad:'Ödendi',          tone:'is-ok',     sira:6,  anlam:'Kalan sıfır' },
    SURESI_DOLDU:    { ad:'Süresi Doldu',    tone:'',          sira:7,  anlam:'Yeni işlem kabul etmez' },
    IPTAL:           { ad:'İptal',           tone:'',          sira:8,  anlam:'Kullanıcı tarafından kapatıldı' },
    HATA:            { ad:'Hata',            tone:'is-danger', sira:9,  anlam:'Teknik/sağlayıcı hatası' },
    IADE_SURECINDE:  { ad:'İade Sürecinde',  tone:'is-warn',   sira:10, anlam:'İade başlatıldı' },
    KISMEN_IADE:     { ad:'Kısmen İade',     tone:'is-warn',   sira:11, anlam:'Tutarın bir kısmı iade edildi' },
    IADE_EDILDI:     { ad:'İade Edildi',     tone:'is-danger', sira:12, anlam:'Tamamı iade edildi' }
  };
  DB.paymentLinkOrder = Object.keys(DB.paymentLinkStages);

  /* ===================================================================
     2. GEÇİŞ TABLOSU — §8.4'ün "Sonraki durum" sütunu birebir

     `yetki` §10 yetki matrisinden: "Ödeme linki oluştur · Finans, yetkili
     satış" · "Ödeme linki iptal · Finans" · "İade başlat · Finans yöneticisi".
     `girisGerekce` olumsuz kararlarda gerekçe zorunlu kılar (§6.3 deseni).

     ⚠️ BACKEND PAYI OLAN GEÇİŞLER `backend:true` ile işaretli. Bu bayrak
     `GV.flow` tarafından okunmaz — ekran okur ve kullanıcıya TEST etiketiyle
     söyler. Sağlayıcı olmadan bu geçişleri gerçek sayan bir arayüz, olmayan
     bir yeteneği varmış gibi gösterirdi.
     =================================================================== */
  var FINANS  = ['muhasebe','sahip','genelmudur'];
  var URETEN  = ['muhasebe','sahip','genelmudur','satismudur'];

  DB.transitions = DB.transitions || {};
  DB.transitions.paymentLink = {
    TASLAK:         { next:['AKTIF','IPTAL'], yetki:URETEN, zorunlu:['musteri','tutar','paraBirimi','sonKullanma'],
                      anaHedef:'AKTIF', etiket:'Yayına Al' },
    AKTIF:          { next:['ACILDI','ISLEMDE','KISMI_ODENDI','ODENDI','SURESI_DOLDU','IPTAL'],
                      yetki:URETEN, zorunlu:[], anaHedef:'IPTAL', etiket:'Linki İptal Et' },
    ACILDI:         { next:['ISLEMDE','KISMI_ODENDI','ODENDI','SURESI_DOLDU','IPTAL'],
                      yetki:URETEN, zorunlu:[], anaHedef:'IPTAL', etiket:'Linki İptal Et' },
    ISLEMDE:        { next:['AKTIF','KISMI_ODENDI','ODENDI','HATA'],
                      yetki:FINANS, zorunlu:[], anaHedef:'AKTIF', etiket:'Oturumu Serbest Bırak', backend:true },
    KISMI_ODENDI:   { next:['ISLEMDE','ODENDI','SURESI_DOLDU','IPTAL'],
                      yetki:FINANS, zorunlu:[], anaHedef:'IPTAL', etiket:'Linki İptal Et' },
    ODENDI:         { next:['IADE_SURECINDE','KISMEN_IADE','IADE_EDILDI'],
                      yetki:FINANS, zorunlu:[], anaHedef:'IADE_SURECINDE',
                      etiket:'İade Başlat', girisGerekce:true },
    SURESI_DOLDU:   { next:['AKTIF'], yetki:URETEN, zorunlu:['sonKullanma'],
                      anaHedef:'AKTIF', etiket:'Yeniden Aktifleştir' },
    /* §8.4: "İptal → Yeni link". Yeni link YENİ BİR KAYITTIR, geçiş değildir;
       bu yüzden İPTAL terminaldir ve ekran "yeni link oluştur" bağlantısı basar. */
    IPTAL:          { next:[], terminal:true },
    HATA:           { next:['AKTIF','IPTAL'], yetki:FINANS, zorunlu:[],
                      anaHedef:'AKTIF', etiket:'Yeniden Dene', backend:true },
    IADE_SURECINDE: { next:['KISMEN_IADE','IADE_EDILDI'], yetki:FINANS, zorunlu:[],
                      anaHedef:'IADE_EDILDI', etiket:'İadeyi Tamamla', backend:true },
    KISMEN_IADE:    { next:['IADE_SURECINDE','IADE_EDILDI'], yetki:FINANS, zorunlu:[],
                      anaHedef:'IADE_EDILDI', etiket:'Kalanı İade Et', backend:true },
    IADE_EDILDI:    { next:[], terminal:true }
  };

  /* Geçiş varlığı kaydı — GV.flow bunu okur ve on altıncı varlık olur. */
  DB.flowEntities = DB.flowEntities || {};
  DB.flowEntities.paymentLink = {
    koleksiyon:'paymentLinks', alan:'durum', ad:'Ödeme linki'
  };

  /* ===================================================================
     3. LİNK TÜRETMESİ
     =================================================================== */

  /* Faturanın tahsil edilmiş tutarı — `DB.paymentAllocations` kanonik
     kaynaktır (R1 P1-05). İkinci bir bakiye hesabı YAZILMAZ; `GV.fin.balance`
     ekranlarda aynı kaynaktan okur. Bu dosya `domain.js`ten ÖNCE yüklendiği
     için burada aynı toplamı yerel olarak hesaplamak zorundayız — ama
     FORMÜL AYNI KOLEKSİYONDAN okur, ikinci bir doğruluk kaynağı doğmaz. */
  function tahsilEdilen(faturaKod){
    return (DB.paymentAllocations || [])
      .filter(function(a){ return a.fatura === faturaKod; })
      .reduce(function(s, a){ return s + (a.tutar || 0); }, 0);
  }

  function gunEkle(tarih, gun){
    var d = new Date(tarih + 'T00:00:00');
    if(isNaN(d)) return null;
    d.setDate(d.getDate() + gun);
    return d.toISOString().slice(0, 10);
  }

  /* Şirket varsayılanı — §8.2 "Son kullanma tarihi: şirket varsayılanı".
     Ayarda karşılığı yoksa 14 gün. */
  DB.paymentLinkDefaults = {
    gecerlilikGun:14,
    paraBirimi:(DB.company && DB.company.paraBirimi) || 'TRY',
    /* §8.7 — sağlayıcı SEÇİLMEDİ. Mock adaptör açıkça TEST etiketlidir. */
    saglayici:'TEST-MOCK',
    saglayiciEtiket:'TEST — sağlayıcı seçilmedi'
  };

  function linkler(){
    var t = DB.today;
    var out = [];
    var sira = 0;

    (DB.invoices || []).forEach(function(f){
      var brut = f.toplam || 0;
      if(brut <= 0) return;
      var tahsil = tahsilEdilen(f.kod);
      var kalan = Math.max(0, brut - tahsil);
      /* Kapalı faturaya link üretilmez — o tahsilat linkten geçmedi. */
      if(kalan <= 0) return;

      sira++;
      var sonKullanma = gunEkle(f.vade || t, DB.paymentLinkDefaults.gecerlilikGun);
      /* Durum TÜRETİLİR, yazılmaz:
           · son kullanma geçmişse  → SURESI_DOLDU
           · kısmi tahsilat varsa   → KISMI_ODENDI
           · aksi hâlde             → AKTIF
         ACILDI / ISLEMDE / ODENDI / HATA / iade durumları için bu depoda
         KAYNAK VERİ YOKTUR; o durumlara yalnız kullanıcı eylemiyle geçilir. */
      var durum = (sonKullanma && sonKullanma < t) ? 'SURESI_DOLDU'
                : (tahsil > 0 ? 'KISMI_ODENDI' : 'AKTIF');

      out.push({
        kod:'ODL-2026-' + String(100 + sira),
        legacy_kaynak:'DB.invoices',
        legacy_id:f.kod,
        /* §8.6 — token DB'de düz metin tutulmaz. Prototipte gerçek token
           üretilmez; alan `null` bırakılır ve ekran bunun backend payı
           olduğunu söyler. Sahte bir "hash" yazmak, olmayan bir güvenlik
           önlemini varmış gibi göstermek olurdu. */
        tokenHash:null,
        musteri:f.musteri,
        musteriAd:f.musteriAd,
        fatura:f.kod,
        proje:f.proje || null,
        tutar:kalan,
        paraBirimi:DB.paymentLinkDefaults.paraBirimi,
        aciklama:f.kod + ' numaralı fatura ödemesi',
        olusturma:f.tarih || t,
        sonKullanma:sonKullanma,
        durum:durum,
        /* Ödenen tutar link üzerinden GELMEDİ; kısmi tahsilat faturaya
           doğrudan işlenmiş. Alan bu yüzden 0'dır, `tahsil` değil. */
        odenen:0,
        kalan:kalan,
        saglayici:DB.paymentLinkDefaults.saglayici,
        sorumlu:(DB.payments || []).filter(function(p){ return p.fatura === f.kod; })
                  .map(function(p){ return p.sorumlu; })[0] || null,
        /* Gelişmiş seçenekler — §8.2, hepsi varsayılan kapalı */
        kismiOdeme:false, tekKullanim:true, taksit:false, dil:'tr',
        acilma:0, deneme:0
      });
    });

    return out;
  }

  DB.paymentLinks = (DB.invoices && DB.paymentAllocations) ? linkler() : [];

  /* ===================================================================
     4. BİLEREK BOŞ KOLEKSİYONLAR — §9 veri modeli

     Bu üçü şartnamenin veri modelinde vardır ama bu depoda KARŞILIĞI YOKTUR:
     hiçbir ödeme bir sağlayıcıdan geçmedi. Boş dizi, uydurulmuş bir deneme
     kaydından dürüsttür (R1'in entegrasyon hata kuyruğu ile aynı karar).
     =================================================================== */
  DB.paymentAttempts    = [];   /* payment_attempt  — sağlayıcı oturumu yok */
  DB.paymentTransactions= [];   /* payment_transaction — doğrulanmış tahsilat yok */
  DB.webhookEvents      = [];   /* webhook_event    — webhook ucu yok */

  /* ===================================================================
     5. BACKEND PAYI KAYDI — ekranlar bu listeyi basar

     Şartnamenin ödeme bölümünde prototipte KARŞILANAMAYAN maddeler. Ekran
     bunları kullanıcıya dürüstçe gösterir; taklit edilmez.
     =================================================================== */
  DB.paymentBackendGaps = [
    { kod:'B-01', madde:'Sağlayıcı webhook imzası ve zaman damgası doğrulaması', bolum:'§8.6' },
    { kod:'B-02', madde:'Idempotency anahtarı — aynı bildirim ikinci tahsilat oluşturmaz', bolum:'§8.5' },
    { kod:'B-03', madde:'Token üretimi (≥128 bit entropi) ve veritabanında hash olarak saklanması', bolum:'§8.6' },
    { kod:'B-04', madde:'Tutar, para birimi ve fatura ilişkisinin her işlemde sunucudan yeniden okunması', bolum:'§8.6' },
    { kod:'B-05', madde:'Tarayıcı dönüşünün ödeme saymaması; kesin sonucun sunucu bildiriminden gelmesi', bolum:'§8.3' },
    { kod:'B-06', madde:'HTTPS zorunluluğu, hız sınırı, başarısız deneme kontrolü ve güvenlik günlüğü', bolum:'§8.6' },
    { kod:'B-07', madde:'Değişmez (append-only) denetim izi', bolum:'§8.6' },
    { kod:'B-08', madde:'Gerçek sağlayıcı adaptörü — bugün TEST/mock', bolum:'§8.7' },
    { kod:'B-09', madde:'3-D Secure ve PCI DSS kapsam doğrulaması', bolum:'§8.6' },
    { kod:'B-10', madde:'İade işleminin ters kayıt üretmesi ve ikinci onaya bağlanması', bolum:'§8.5' },
    { kod:'B-11', madde:'Mutabakat kuyruğu — iptal sonrası dönen sağlayıcı işlemi', bolum:'§8.5' }
  ];

  /* Sayım kapısı — ekran ve ölçüm betiği aynı yerden okur. */
  DB.paymentLinksByStage = function(){
    var out = {};
    DB.paymentLinkOrder.forEach(function(k){ out[k] = 0; });
    (DB.paymentLinks || []).forEach(function(l){ if(l.durum) out[l.durum]++; });
    return out;
  };
})();
