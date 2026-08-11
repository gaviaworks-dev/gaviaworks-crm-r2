/* =====================================================================
   GAVIAWORKS CRM R2 — MÜŞTERİ YAŞAM EVRESİ TÜRETMESİ
   Şartname §5 · tasks/sadelestirme-talimati.md

   ŞARTNAMENİN HÜKMÜ
   §5.1: "Aday müşteri ayrı modül ve ayrı şirket kaydı OLMAMALIDIR. Tek
   `customer_account` kaydı aşağıdaki yaşam evrelerinden birini taşır."
   §5.3: "Fırsat kazanıldığında AYNI müşteri hesabının yaşam evresi Müşteri
   yapılır; YENİ MÜŞTERİ KOPYASI OLUŞTURULMAZ."

   ⚠️ UYDURMA YOK — HER KAYIT R1'DEKİ GERÇEK BİR KAYITTAN TÜRETİLİR
   Bu dosya yeni veri ÜRETMEZ. `DB.customers` (12 kayıt) ve `DB.leads`
   (12 kayıt) üzerinden `DB.accounts` koleksiyonunu TÜRETİR. Her hesap
   `legacy_id` ile kaynağına bağlıdır (§12 "Veri göçü: legacy_id ile
   izlenebilirlik korunur"). Türetilemeyen alan BOŞ bırakılır, doldurulmaz.

   ÖLÇÜLMÜŞ ÇAKIŞMA — GÖÇÜN EN PAHALI YERİ
   R1'de `DB.leads[].musteri` alanı ZATEN müşteriye bağ taşıyor. On iki
   lead'in DÖRDÜ bağlı ve dördünde de firma adı müşterininkiyle BİREBİR AYNI:

     LEAD-2026-001 Başkent Hukuk Bürosu      → MUS-2026-008 (aynı ad)
     LEAD-2026-002 Ege Eğitim Kurumları      → MUS-2025-004 (aynı ad)
     LEAD-2026-005 Anka Finans Teknolojileri → MUS-2026-011 (aynı ad)
     LEAD-2026-008 Öz Gıda Üretim A.Ş.       → MUS-2026-009 (aynı ad)

   Naif göç (12 lead → 12 yeni hesap) 24 hesap üretir ve DÖRDÜ MÜKERRERDİR.
   Doğru sonuç: 12 müşteri + 8 bağsız lead = **20 hesap**. Bağlı dört lead
   yeni hesap DOĞURMAZ; yalnız fırsata dönüşür.

   Bu dosya `DB.opportunities` de türetir: her lead bir fırsattır (§5.3
   "bütçe, sıcaklık, tahmini kapanış, hizmet ve sonraki aksiyon `opportunity`
   kaydına taşınmalıdır") → 12 fırsat.
   ===================================================================== */
window.DB = window.DB || {};

(function(){
  'use strict';

  /* Yaşam evresi sözlüğü — §5.1 tablosu birebir.
     `sonraki` alanı izin verilen geçişleri taşır; Operasyon ve müşteri
     formu bu tablodan beslenecek, kendi listesini yazmayacak (L-40). */
  DB.lifecycleStages = {
    ADAY:      { ad:'Aday',      tone:'',       sira:1, sonraki:['NITELIKLI','KAYIP'] },
    NITELIKLI: { ad:'Nitelikli', tone:'is-info',sira:2, sonraki:['MUSTERI','KAYIP','ADAY'] },
    MUSTERI:   { ad:'Müşteri',   tone:'is-ok',  sira:3, sonraki:['PASIF'] },
    PASIF:     { ad:'Pasif',     tone:'',       sira:4, sonraki:['MUSTERI'] },
    KAYIP:     { ad:'Kayıp',     tone:'is-danger',sira:5, sonraki:['ADAY'] }
  };
  DB.lifecycleOrder = ['ADAY','NITELIKLI','MUSTERI','PASIF','KAYIP'];

  /* ---- TÜRETME KURALLARI — gerekçesiyle yazılı -------------------- */

  /* Müşteri kaydının `durum` alanı → evre.
     'Riskli' MUSTERI'ye düşer: risk AYRI BİR EKSENDİR (kayıtta `risk` alanı
     zaten var), yaşam evresi değildir. R1'de ikisi tek alanda karışıyordu. */
  var MUSTERI_DURUM = {
    'Aktif':      'MUSTERI',
    'Riskli':     'MUSTERI',
    'Pasif':      'PASIF',
    'Potansiyel': 'NITELIKLI'
  };

  /* Lead'in `asama` alanı → evre.
     Ayrım §5.1'in tanımıdır: ADAY = "henüz doğrulanmamış ihtiyaç",
     NITELIKLI = "ihtiyaç ve karar süreci doğrulanmış". */
  var LEAD_ASAMA = {
    'Yeni talep':                 'ADAY',
    'İlk iletişim':               'ADAY',
    'İhtiyaç analizi':            'NITELIKLI',
    'Ön analiz hazırlanıyor':     'NITELIKLI',
    'Teknik değerlendirme':       'NITELIKLI',
    'Teklif iletildi':            'NITELIKLI',
    'Müşteri değerlendirmesinde': 'NITELIKLI',
    /* 'Beklemeye alındı' — ihtiyaç doğrulanmış ama süreç durmuş. NITELIKLI
       seçildi; ADAY'a düşürmek doğrulanmış bilgiyi çöpe atmak olurdu.
       Bu bir VARSAYIMDIR ve tasks/riskler-ve-kapsam.md'de kayıtlıdır. */
    'Beklemeye alındı':           'NITELIKLI',
    'Kazanıldı':                  'MUSTERI',
    'Kaybedildi':                 'KAYIP'
  };

  /* İki kaynak aynı hesabı işaret ettiğinde İLERİ olan evre kazanır.
     Örnek: MUS-2025-004 'Aktif' (MUSTERI) + LEAD-2026-002 'İhtiyaç analizi'
     (NITELIKLI) → MUSTERI. Aktif müşterinin yeni talebi onu adaya düşürmez. */
  function ileriOlan(a, b){
    if(!a) return b;
    if(!b) return a;
    /* PASIF ve KAYIP terminal sayılmaz ama sıraları yüksektir; ticari
       ilerleme ekseninde MUSTERI en ileridir. */
    var agirlik = { ADAY:1, NITELIKLI:2, PASIF:3, KAYIP:0, MUSTERI:4 };
    return (agirlik[a] >= agirlik[b]) ? a : b;
  }

  /* ---- TÜRETME ---------------------------------------------------- */
  function tureti(){
    var musteriler = DB.customers || [];
    var leadler    = DB.leads || [];

    var hesaplar = [];
    var indeks   = {};          /* müşteri kodu → hesap */

    /* 1) Her müşteri kaydı bir hesaptır. Kimlik KORUNUR — yeni kod üretilmez. */
    musteriler.forEach(function(c){
      /* Ham göç değeri YEREL kalır: kayda yazılmaz, yalnız `evreKaynak`
         metnine girer. Böylece izlenebilirlik korunur ama canlı okunabilen
         bayat bir alan doğmaz (K-21). */
      var hamDurum = c.durum;   /* bayat-alan:goc-kaynagi — türetmenin TEK okuması */
      var h = {
        kod:            c.kod,                  /* kimlik değişmez (§5.3) */
        legacy_id:      c.kod,
        legacy_kaynak:  'DB.customers',
        unvan:          c.unvan,
        kisa:           c.kisa,
        evre:           MUSTERI_DURUM[hamDurum] || null,
        evreKaynak:     'göç: customers.durum=' + hamDurum,
        tip:            c.tip || null,
        sektor:         c.sektor || null,
        sorumlu:        c.sorumlu || null,
        tel:            c.tel || null,
        eposta:         c.eposta || null,
        vergiNo:        c.vergiNo || null,
        risk:           c.risk || null,
        /* ⚠️ `durum` ALANI TAŞINMIYOR (K-21 · ADR-R2-18).
           Eskiden burada `durum: c.durum` vardı ve "eski eksen metadata olarak
           korunur" diye yazılıydı. Ölçüldü: bu alan hesap kaydına ÖLÜ DOĞUYOR.
           `GV.lifecycle.gec` evreyi değiştirdiğinde `durum` OLDUĞU GİBİ kalıyor,
           yani ilk saniyeden sonra kaydın kendi içinde iki cevabı oluyor.
           R1'deki çift KDV hatası tam bu sınıftandı: alt zincir yanlış çapaya
           göre TUTARLIYDI ve hiçbir eksen çelişki göremiyordu.
           Göç izi kaybolmuyor — `evreKaynak` ham değeri zaten metin olarak
           taşıyor ve `legacy_id` kaynağa bağlıyor. */
        sonIletisim:    c.sonIletisim || null,
        aktifProje:     c.aktifProje != null ? c.aktifProje : null,
        toplamCiro:     c.toplamCiro != null ? c.toplamCiro : null,
        bekleyenTahsilat: c.bekleyenTahsilat != null ? c.bekleyenTahsilat : null,
        memnuniyet:     c.memnuniyet != null ? c.memnuniyet : null,
        /* Lead'den gelen hesaplarda dolacak; müşteriden gelende BOŞ kalır.
           Uydurulmaz — karşılığı yoksa null. */
        ihtiyac:        null,
        leadKodlari:    []
      };
      hesaplar.push(h);
      indeks[c.kod] = h;
    });

    /* 2) Lead'ler. Bağlı olan hesabı GÜNCELLER, bağsız olan YENİ hesap açar. */
    leadler.forEach(function(l){
      var leadEvre = LEAD_ASAMA[l.asama] || null;

      if(l.musteri && indeks[l.musteri]){
        /* KATLANMA — yeni hesap doğmaz (§5.3). */
        var h = indeks[l.musteri];
        var onceki = h.evre;
        h.evre = ileriOlan(h.evre, leadEvre);
        h.leadKodlari.push(l.kod);
        /* ⚠️ Burada `h.durum` okunuyordu — kaldırılan bayat alan.
           Göç değeri artık `evreKaynak` metninin kendisinde duruyor;
           satır ona EKLENİR, ikinci kez kaynaktan okunmaz. */
        h.evreKaynak = h.evreKaynak + ' + ' + l.kod + '.asama=' + l.asama +
                       (h.evre !== onceki ? ' → ilerletildi' : '');
        if(!h.ihtiyac && l.ozet) h.ihtiyac = l.ozet;
        return;
      }

      /* YENİ HESAP — bağsız lead. Kimlik lead kodundan türetilir ki
         `legacy_id` ile geriye izlenebilsin. */
      var yeni = {
        kod:            l.kod,
        legacy_id:      l.kod,
        legacy_kaynak:  'DB.leads',
        unvan:          l.firma,
        kisa:           l.firma,
        evre:           leadEvre,
        evreKaynak:     'leads.asama=' + l.asama,
        tip:            null,                  /* lead kaydında müşteri tipi YOK — boş bırakılır */
        sektor:         l.sektor || null,
        sorumlu:        l.sorumlu || null,
        tel:            l.tel || null,
        eposta:         l.eposta || null,
        vergiNo:        null,                  /* lead'de vergi no YOK */
        risk:           null,
        sonIletisim:    l.sonIletisim || null,
        /* Ticari sayaçlar lead'de YOK — sıfır yazmak yanlış beyandır,
           null bırakılır ve ekran "—" basar (R1 dersi L-08 · L-13). */
        aktifProje:     null,
        toplamCiro:     null,
        bekleyenTahsilat: null,
        memnuniyet:     null,
        ihtiyac:        l.ozet || null,
        leadKodlari:    [l.kod]
      };
      hesaplar.push(yeni);
      indeks[yeni.kod] = yeni;
    });

    return hesaplar;
  }

  /* ---- FIRSATLAR — §5.3 ------------------------------------------
     "Mevcut lead alanlarından bütçe, sıcaklık, tahmini kapanış, hizmet ve
     sonraki aksiyon `opportunity` kaydına taşınmalıdır."
     Her lead BİR fırsattır — bağlı olsun olmasın. 12 lead → 12 fırsat. */
  function firsatlar(){
    return (DB.leads || []).map(function(l){
      return {
        kod:        l.kod.replace('LEAD-', 'FRS-'),
        legacy_id:  l.kod,
        legacy_kaynak:'DB.leads',
        /* Fırsatın hesabı: bağlıysa müşteri kodu, değilse lead'in kendi kodu
           (o kod yukarıda hesap kodu olarak kullanıldı). */
        hesap:      l.musteri || l.kod,
        baslik:     l.ozet || l.firma,
        asama:      l.asama,
        hizmet:     l.hizmet || null,
        butce:      l.butce != null ? l.butce : null,
        sicaklik:   l.sicaklik || null,
        puan:       l.puan != null ? l.puan : null,
        kapanisTahmini: l.kapanisTahmini || null,
        sonrakiAksiyon: l.sonrakiAksiyon || null,
        sonrakiTarih:   l.sonrakiTarih || null,
        sorumlu:    l.sorumlu || null,
        kaynak:     l.kaynak || null,
        referans:   l.referans || null,
        kayipNedeni:l.kayipNedeni || null
      };
    });
  }

  /* Veri dosyaları shell'den ÖNCE yüklenir; `DB.customers` ve `DB.leads`
     bu noktada hazırdır (crm.js önce gelir). Hazır değilse türetme boş
     döner — sessizce yanlış sayı üretmez. */
  DB.accounts = (DB.customers && DB.leads) ? tureti() : [];
  DB.opportunities = (DB.leads) ? firsatlar() : [];

  /* ===================================================================
     BAYAT ALAN TUZAĞI — K-21 · ADR-R2-18
     -------------------------------------------------------------------
     `DB.customers[].durum` göçün KAYNAĞIDIR ve türetme bittiği anda ÖLÜR:
     yaşam evresi artık `DB.accounts[].evre` üzerinde yaşıyor ve
     `GV.lifecycle.gec` yalnız onu değiştiriyor. Kaynak alan olduğu yerde
     kalırsa, bir sonraki turda birileri onu okur ve **eski cevabı alır**.

     Alanı sessizce silmek yetmez: `undefined` okuyan kod da sessizce yanlış
     çalışır. Bu yüzden alan bir TUZAĞA çevrilir:
       · okunduğunda   → sayaca yazılır, `undefined` döner
       · yazıldığında  → sayaca yazılır, değer TUTULMAZ
       · `enumerable:false` → `Object.keys` / `JSON.stringify` tuzağa basmaz,
         yani serileştirme yanlış alarm üretmez (L-26: araç fazla saymasın)

     Sayaç `DB.bayat` altında durur; `tasks/qa/bayat-alan.js` ve tarayıcı
     ekseni onu okur. Tek bir okuma kalırsa eksen kırmızı yanar.

     GEREKÇE (K-21): R1'deki çift KDV hatası tam bu sınıftandı — alt zincir
     yanlış çapaya göre kendi içinde TUTARLIYDI, dolayısıyla hiçbir eksen
     çelişki göremiyordu. Bayat çapayı ölçülebilir kılmak, o hatanın tek
     panzehiri.
     =================================================================== */
  DB.bayat = { okuma:[], yazma:[], sayac:0 };

  function bayatKapat(kayit, alan, sebep){
    if(!Object.getOwnPropertyDescriptor(kayit, alan)) return;
    delete kayit[alan];
    Object.defineProperty(kayit, alan, {
      configurable:true,
      enumerable:false,
      get:function(){
        DB.bayat.okuma.push({ alan:alan, kod:kayit.kod, sebep:sebep });
        DB.bayat.sayac++;
        return undefined;
      },
      set:function(){
        DB.bayat.yazma.push({ alan:alan, kod:kayit.kod, sebep:sebep });
        DB.bayat.sayac++;
      }
    });
  }

  (DB.customers || []).forEach(function(c){
    bayatKapat(c, 'durum',
      'yaşam evresi DB.accounts[].evre üzerinde yaşar — GV.lifecycle kullanın');
  });

  /* Ekranların ve ölçüm betiğinin ortak kapısı — evre sayımı TEK yerde. */
  DB.accountsByStage = function(){
    var out = {};
    DB.lifecycleOrder.forEach(function(k){ out[k] = 0; });
    (DB.accounts || []).forEach(function(h){ if(h.evre) out[h.evre]++; });
    return out;
  };
})();
