/* =====================================================================
   GAVIAWORKS CRM R2 — FIRSAT GEÇİŞ SÖZLEŞMESİ
   Şartname §5.3 · §9 (`opportunity` varlığı) · tasks/sadelestirme-talimati.md

   NEDEN AYRI DOSYA
   `lifecycle.js` fırsat KAYITLARINI türetiyor (12 lead → 12 fırsat) ama
   geçiş kuralı yoktu: `DB.flowEntities` içinde `opportunity` YOKTU ve
   `DB.transitions` içinde karşılığı YOKTU. Yani fırsatın aşaması `GV.flow`
   dışında, ekranda serbestçe yazılabilir durumdaydı — bu depoda beş oturum
   boyunca en pahalı hata sınıfı tam olarak buydu (`domain.js:113-127`).

   Emsal: `odeme.js:100-103` ödeme linkini onaltıncı geçiş varlığı olarak
   AYNI biçimde kaydediyor. Fırsat onyedincidir.

   ⚠️ TABLO UYDURULMADI — `DB.pipelineStages`ten (crm.js:42-58, 15 aşama)
   TÜRETİLİR. Aşama silmek yasak (talimat: "mevcut detaylı satış aşamalarını
   sistemden kaldırma"); bu dosya yalnız aralarındaki KENARLARI yazar.

   TÜRETME KURALLARI — gerekçesiyle:
     1. Sıralı ilerleme: `sira` n olan aşamanın birincil hedefi n+1'dir.
        Aşama ATLANAMAZ; §8.2 her aşamaya bir beklenen çıktı bağlıyor,
        atlamak o çıktıyı üretilmemiş bırakırdı.
     2. Her ilerleyen aşamadan `Beklemeye alındı` ve `Kaybedildi` çıkışı var:
        ikisi de her noktada gerçekleşebilir bir ticari sonuçtur.
     3. TEK İSTİSNA — `Müşteri değerlendirmesinde` (sıra 10) doğrudan
        `Sözleşme aşaması`na (12) da gidebilir. Sebebi tabloda yazılı:
        `Revize teklif` (11) müşteri revizyon İSTERSE doğar; her satışta
        revizyon olmaz. Zorunlu kılmak, revizyonsuz kapanan satışı sahte bir
        revizyon kaydı yazmaya zorlardı.
     4. `Beklemeye alındı` → `Yeni talep`. Tablonun kendi beklenen çıktısı
        bunu söylüyor: "Yeniden aktifleştirme". Donmuş bir fırsat yeniden
        niteliklendirilir; bırakıldığı aşamaya geri koymak, aradan geçen
        60 günün (tablodaki `maxGun`) doğrulamayı eskittiğini yok sayardı.
        Hangi aşamadan geldiği denetim izinde durur, tahmin edilmez.
     5. `Kazanıldı` ve `Kaybedildi` terminaldir. `Kaybedildi` girişinde
        neden kodu + açıklama ZORUNLU ([2.0.6]); `DB.lostReasons` sözlüğü
        ekranda ayrıca sorulur.

   KAPI — `firsatKazanma` (domain.js `GV.gates`): §5.3 adım 2 "sistem zorunlu
   müşteri bilgilerini kontrol eder". Kapı UYARMAZ, REDDEDER. İstisna yalnız
   `sahip` / `genelmudur` ve yalnız gerekçeyle.
   ===================================================================== */
window.DB = window.DB || {};

(function(){
  'use strict';

  if(!DB.pipelineStages || !DB.pipelineStages.length) return;   /* crm.js yüklü değil */

  var SIRALI = DB.pipelineStages.slice().sort(function(a, b){ return a.sira - b.sira; });
  function adi(sira){
    for(var i = 0; i < SIRALI.length; i++) if(SIRALI[i].sira === sira) return SIRALI[i].key;
    return null;
  }

  var KAZANILDI = adi(13), KAYBEDILDI = adi(14), BEKLEME = adi(15);

  /* Satış rolleri + ilişki anahtarı. `'sorumlu'` bir ROL DEĞİL İLİŞKİDİR:
     `GV.flow.yetkili` onu "BU kaydın sorumlusu" diye çözer (domain.js:303).
     Karıştırmak her satışçıyı her fırsatın sahibi yapardı. */
  var YETKI = ['sorumlu', 'satistemsilci', 'satismudur', 'sahip', 'genelmudur'];

  var tablo = {};

  SIRALI.forEach(function(s){
    if(s.sira >= 13) return;                       /* sonuç aşamaları aşağıda */

    var sonraki = adi(s.sira + 1);
    var next = [sonraki];

    /* Kural 3 — revizyon opsiyoneldir */
    if(s.sira === 10) next.push(adi(12));

    next.push(BEKLEME, KAYBEDILDI);

    tablo[s.key] = {
      next:next,
      anaHedef:sonraki,
      etiket:sonraki,                              /* buton yazısı = hedef aşama */
      tone:'btn-acc',
      yetki:YETKI,
      /* Zorunlu alan YALNIZ karşılığı VERİDE olan yerde konur. §8.2'nin
         "beklenen çıktı" sütunu bir belge adıdır, kayıt alanı değil —
         alanı olmayan bir kuralı zorunlu yazmak, hiç uygulanmayan bir kural
         yazmaktır (L-31). */
      zorunlu:s.sira === 1 ? ['sorumlu']
            : s.sira === 7 ? ['butce']             /* Fiyatlandırma: maliyet ve fiyat */
            : s.sira === 12 ? ['butce', 'kapanisTahmini']
            : []
    };
  });

  /* KAPI HEDEFE BAĞLIDIR, kaynağa değil.
     İlk yazımda `tablo[adi(12)].kapi` kullanılmıştı ve ölçüldü: kapı,
     `Sözleşme aşaması`ndan çıkan HER hedefe uygulanıyordu — yani bir satışı
     KAYBETMEK için müşterinin vergi numarasını doldurmak gerekiyordu.
     `girisKapi` yalnız `Kazanıldı` hedefinde çalışır (motor: domain.js `gec`). */
  tablo[KAZANILDI]  = { next:[], terminal:true,
                        girisKapi:'firsatKazanma',
                        istisnaRol:['sahip', 'genelmudur'] };
  tablo[KAYBEDILDI] = { next:[], terminal:true, girisGerekce:true };
  tablo[BEKLEME]    = {
    next:[adi(1), KAYBEDILDI],
    anaHedef:adi(1),
    etiket:'Yeniden Aktifleştir',
    tone:'btn-acc',
    yetki:YETKI,
    zorunlu:[],
    girisGerekce:true                              /* beklemeye almak bir karardır */
  };

  DB.transitions = DB.transitions || {};
  DB.transitions.opportunity = tablo;

  DB.flowEntities = DB.flowEntities || {};
  DB.flowEntities.opportunity = {
    koleksiyon:'opportunities', alan:'asama', ad:'Fırsat'
  };

  /* ===================================================================
     BAĞ YORDAMLARI — kural N ekranda değil, TEK yerde (ders L-40)

     Bu dilimde üç ekran (müşteri detayı · fırsat detayı · teklif listesi)
     aynı bağ sorusunu soruyor. Üçü de ayrı yazsaydı biri diğerinden
     sessizce ayrılırdı.

     ⚠️ TEKLİF → HESAP BAĞI İKİ YOLLUDUR ve ikisi de veride ölçüldü:
       · 5 teklif doğrudan `musteri` taşıyor (MUS-*),
       · 7 teklif `lead` taşıyor (LEAD-*) — bunların üçünde `musteri` boş.
     Lead yolunda hesap, lead'in fırsatı üzerinden bulunur: fırsatın `hesap`
     alanı bağlıysa müşteri kodu, değilse lead kodudur (lifecycle.js:195-197).
     İki yol da tutmuyorsa bağ YOKTUR — tarih ya da firma adı benzerliği
     bağ sayılmaz (L-13).
     =================================================================== */

  /* Lead kodundan fırsat — `legacy_id` üzerinden, kod dönüşümü tahmin edilmez */
  DB.opportunityOfLead = function(leadKod){
    if(!leadKod) return null;
    return (DB.opportunities || []).filter(function(o){ return o.legacy_id === leadKod; })[0] || null;
  };

  DB.quoteOpportunity = function(q){
    if(!q) return null;
    return q.lead ? DB.opportunityOfLead(q.lead) : null;
  };

  /* Teklifin hesabı — doğrudan bağ, yoksa fırsat üzerinden. Yoksa null. */
  DB.quoteAccount = function(q){
    if(!q) return null;
    if(q.musteri) return q.musteri;
    var o = DB.quoteOpportunity(q);
    return o ? o.hesap : null;
  };

  DB.accountOpportunities = function(hesapKod){
    if(!hesapKod) return [];
    return (DB.opportunities || []).filter(function(o){ return o.hesap === hesapKod; });
  };

  DB.accountQuotes = function(hesapKod){
    if(!hesapKod) return [];
    return (DB.quotes || []).filter(function(q){ return DB.quoteAccount(q) === hesapKod; });
  };

  /* Fırsatın teklifleri — aynı bağın ters yönü */
  DB.opportunityQuotes = function(firsatKod){
    if(!firsatKod) return [];
    return (DB.quotes || []).filter(function(q){
      var o = DB.quoteOpportunity(q);
      return o && o.kod === firsatKod;
    });
  };

  /* Aşama sözlüğü hızlı erişim — ekran `filter` yazmasın */
  DB.pipelineStage = function(key){
    return SIRALI.filter(function(s){ return s.key === key; })[0] || null;
  };

  DB.opportunitiesByStage = function(){
    var out = {};
    SIRALI.forEach(function(s){ out[s.key] = 0; });
    (DB.opportunities || []).forEach(function(o){ if(o.asama in out) out[o.asama]++; });
    return out;
  };

  /* Pano kolonu = `grup` alanı (REVİZE 14): 15 aşama altı gruba iner ve
     hiçbir aşama SİLİNMEZ. `GV.list`in kanban `groupOf` kancası bunu okur. */
  DB.pipelineGroups = (function(){
    var out = [];
    SIRALI.forEach(function(s){ if(out.indexOf(s.grup) === -1) out.push(s.grup); });
    return out;
  })();

  DB.pipelineGroupOf = function(asama){
    var s = DB.pipelineStage(asama);
    return s ? s.grup : null;
  };
})();
