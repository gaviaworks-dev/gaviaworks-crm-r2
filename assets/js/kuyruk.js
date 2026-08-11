/* =====================================================================
   GAVIAWORKS CRM R2 — OPERASYON İŞ KUYRUĞU
   Şartname §6.2 · tasks/sadelestirme-talimati.md

   §6.2: "Kuyrukta destek talepleri, görevler, bekleyen onaylar, takip zamanı
   gelen müşteri aksiyonları ve geciken tahsilatlar ORTAK TİPTE gösterilebilir.
   Her satırda YALNIZ başlık, ilişki, durum, sorumlu ve son tarih bulunmalıdır."

   ⚠️ UYDURMA KAYIT YOK. Bu dosya yeni veri üretmez; beş mevcut koleksiyondan
   ortak satır modeli TÜRETİR. Her satır `kaynak` alanında hangi koleksiyondan
   geldiğini taşır. Türetilemeyen alan `null` bırakılır — boş bir tarih
   uydurmak, kullanıcıya olmayan bir termin göstermektir (R1 dersi L-13).

   OMURGA ÇATALLANMAZ. Durum geçişi `GV.flow`, onay kararı `GV.approval`,
   bakiye `GV.fin`, denetim izi `GV.audit` üzerinden yürür. Bu dosya onları
   ÇAĞIRIR, yerine geçmez.
   ===================================================================== */
(function(){
  'use strict';

  var GV = window.GV = window.GV || {};

  /* Beş kuyruk tipi. `flowTur` alanı `GV.flow`daki geçiş varlığına bağlar;
     `null` olan tipin durum geçişi yoktur (onay kendi motorunda, tahsilat
     `GV.fin`de yürür). */
  var TIPLER = {
    gorev:    { ad:'Görev',            ikon:'i-tasks',       flowTur:'task',    kaynak:'DB.tasks' },
    destek:   { ad:'Destek talebi',    ikon:'i-support',     flowTur:'ticket',  kaynak:'DB.tickets' },
    onay:     { ad:'Bekleyen onay',    ikon:'i-stamp',       flowTur:null,      kaynak:'DB.approvals' },
    takip:    { ad:'Müşteri aksiyonu', ikon:'i-funnel',      flowTur:null,      kaynak:'DB.opportunities' },
    tahsilat: { ad:'Geciken tahsilat', ikon:'i-wallet',      flowTur:null,      kaynak:'DB.payments' },
    /* ⚠️ ALTINCI TİP — ŞARTNAMEDEN BİLİNÇLİ SAPMA (karar K-10 · ADR-R2-14).
       §6.2 BEŞ tip sayıyor ve departman talebini saymıyor. Bu tip Beyar'ın
       kararıyla eklendi; gerekçe "eylem bekleyen iş tek kuyrukta toplanır"
       ilkesidir. Sapma SESSİZ DEĞİLDİR: burada, ADR'de ve ekranın altındaki
       dipnotta yazılıdır. */
    istalebi: { ad:'Departman talebi', ikon:'i-arrow-right', flowTur:'request', kaynak:'DB.deptRequests' }
  };

  function bugun(){ return (window.DB && DB.today) || '2026-08-03'; }

  function empAd(kod){
    if(!kod) return null;
    return (window.DB && DB.empName) ? DB.empName(kod) : kod;
  }

  /* Ortak satır modeli — şartname §6.2'deki beş alan ve satırı kayda
     bağlayan teknik alanlar. Ekran BU MODELDEN başka alan okumaz. */
  function satir(o){
    return {
      /* Şartnamenin saydığı beş alan */
      baslik:  o.baslik || '(başlıksız)',
      iliski:  o.iliski || null,        /* müşteri / proje bağı — yoksa null */
      durum:   o.durum || null,
      sorumlu: o.sorumlu || null,       /* personel kodu */
      sonTarih:o.sonTarih || null,      /* yoksa null — uydurulmaz */
      /* Teknik alanlar */
      id:      o.tip + ':' + o.kod,     /* kuyruk genelinde benzersiz */
      tip:     o.tip,
      kod:     o.kod,
      flowTur: TIPLER[o.tip].flowTur,
      kaynak:  TIPLER[o.tip].kaynak,
      tam:     o.tam || null,           /* tam kaydın adresi — yoksa null */
      /* Hedefi OLMAYAN satır için sebep. Ekran düğmeyi gizlemez: devre dışı
         basar ve bu metni ipucu olarak gösterir. Gizlemek kapsamı küçük
         gösterir ve yetki davranışıyla karışır. */
      tamNot:  o.tamNot || null,
      tone:    o.tone || null,
      gecikti: !!o.gecikti
    };
  }

  /* ---- Beş kaynak ------------------------------------------------- */

  function gorevler(){
    var t = bugun();
    var kapali = ['Tamamlandı','İptal edildi','Arşivlendi'];
    return (DB.tasks || []).filter(function(g){
      return kapali.indexOf(g.durum) === -1;
    }).map(function(g){
      var gec = g.termin && g.termin < t;
      return satir({
        tip:'gorev', kod:g.kod, baslik:g.baslik,
        iliski:g.proje || g.musteri || null,
        durum:g.durum, sorumlu:g.sorumlu, sonTarih:g.termin || null,
        tam:'app-gorev-detay.html?id=' + g.kod,
        tone:gec ? 'danger' : null, gecikti:gec
      });
    });
  }

  function destekler(){
    var kapali = (DB.ticketClosedStatuses || []);
    return (DB.tickets || []).filter(function(d){
      return kapali.indexOf(d.durum) === -1;
    }).map(function(d){
      return satir({
        tip:'destek', kod:d.kod, baslik:d.baslik,
        iliski:d.musteriAd || d.musteri || null,
        durum:d.durum, sorumlu:d.sorumlu,
        /* Destek talebinde TERMİN ALANI YOK. SLA metni ("4 saat") bir süre
           taahhüdüdür, bir tarih değildir — tarihe çevirmek uydurma olurdu.
           Son tarih null bırakılır, SLA ilişki satırında gösterilir. */
        sonTarih:null,
        tam:'app-destek-detay.html?id=' + d.kod,
        tone:d.oncelik === 'Kritik' ? 'danger' : null
      });
    });
  }

  function onaylar(){
    return (DB.approvals || []).filter(function(a){
      return a.durum === 'Bekliyor';
    }).map(function(a){
      return satir({
        tip:'onay', kod:a.kod, baslik:a.baslik,
        iliski:a.kayit || null,
        durum:a.durum, sorumlu:a.onaylayan,
        sonTarih:a.tarih || null,
        tam:a.link || null,
        tone:a.aciliyet === 'Yüksek' ? 'danger' : null
      });
    });
  }

  /* Takip zamanı gelen müşteri aksiyonu — fırsat kaydındaki `sonrakiTarih`
     bugüne gelmiş ya da geçmişse. Fırsatlar `lifecycle.js` tarafından
     lead'lerden türetildi; `sonrakiAksiyon` alanı R1'deki gerçek veridir. */
  function takipler(){
    var t = bugun();
    var kapali = ['Kazanıldı','Kaybedildi'];
    return (DB.opportunities || []).filter(function(o){
      return o.sonrakiTarih && o.sonrakiTarih <= t && kapali.indexOf(o.asama) === -1;
    }).map(function(o){
      var hesap = (DB.accounts || []).filter(function(h){ return h.kod === o.hesap; })[0];
      return satir({
        tip:'takip', kod:o.kod,
        baslik:o.sonrakiAksiyon || o.baslik,
        iliski:hesap ? hesap.unvan : o.hesap,
        durum:o.asama, sorumlu:o.sorumlu, sonTarih:o.sonrakiTarih,
        tam:'app-musteri-detay.html?id=' + o.hesap,
        tone:o.sonrakiTarih < t ? 'danger' : null,
        gecikti:o.sonrakiTarih < t
      });
    });
  }

  /* Departman talebi — açık olanlar. `GV.flow`ta `request` varlığı olarak
     zaten tanımlı; kuyruk onu çağırır, ikinci bir durum ekseni doğmaz. */
  function departmanTalepleri(){
    var t = bugun();
    var kapali = ['Tamamlandı','İptal edildi','Reddedildi','Göreve Dönüştürüldü'];
    return (DB.deptRequests || []).filter(function(d){
      return kapali.indexOf(d.durum) === -1;
    }).map(function(d){
      var gec = d.termin && d.termin < t;
      return satir({
        tip:'istalebi', kod:d.kod, baslik:d.baslik || d.konu || d.kod,
        iliski:d.hedefDep || d.dep || null,
        durum:d.durum, sorumlu:d.sorumlu || d.atanan || null,
        sonTarih:d.termin || null,
        /* Rota 51-52: departman talebi GÖMÜLÜYOR — tam kaydı bu panelin
           KENDİSİDİR, ayrı ekran açılmayacak. `app-istalebi-detay.html`
           hedefi hiç doğmadı ve doğmayacak; onu göstermeye devam etmek
           "yakında gelecek" diye yanlış bir söz vermekti. */
        tam:null,
        tamNot:'Departman talebinin tam kaydı bu panelin kendisidir — ' +
               'ayrı ekran açılmıyor (rota 51-52, GÖMÜLÜYOR).',
        tone:gec ? 'danger' : null, gecikti:!!gec
      });
    });
  }

  /* Geciken tahsilat — vadesi geçmiş ve tahsil edilmemiş.
     ⚠️ İKİNCİ BİR BAKİYE KAYNAĞI YARATILMAZ. Açık tutar `GV.fin.balance`
     üzerinden okunur; burada yalnız hangi kaydın kuyruğa düşeceği seçilir. */
  function tahsilatlar(){
    var t = bugun();
    return (DB.payments || []).filter(function(p){
      return !p.tahsilEdildi && p.vade && p.vade < t;
    }).map(function(p){
      return satir({
        tip:'tahsilat', kod:p.kod,
        baslik:(p.musteriAd || p.musteri) + ' — vadesi geçmiş tahsilat',
        iliski:p.fatura || null,
        durum:p.durum, sorumlu:p.sorumlu, sonTarih:p.vade,
        /* K-23 — tahsilat detayı AYRI EKRAN DEĞİLDİR. Hedef, tahsilat
           listesinin tahsis defteri çekmecesidir; ekran `?ac=` parametresini
           okur ve çekmeceyi açar. Eskiden burada `app-tahsilat-detay.html`
           yazıyordu ve o dosya hiç doğmadı — kuyruğun iki satırı yazılmayan
           bir ekranı işaret ediyordu. */
        tam:'app-tahsilat.html?ac=' + p.kod,
        tone:'danger', gecikti:true
      });
    });
  }

  /* ---- Dışa açılan yüzey ------------------------------------------ */

  function hepsi(){
    if(!window.DB) return [];
    return gorevler().concat(destekler(), onaylar(), takipler(), tahsilatlar(), departmanTalepleri());
  }

  /* Rol kapsamı — §10 "Operasyon kuyruğu · Rolün eriştiği kayıtlar".
     ⚠️ BACKEND PAYI: gerçek sistemde satır kapsamı SUNUCUDA uygulanır.
     Burada istemcide süzülür ve ekran bunu dürüstçe söyler. */
  function kapsamli(){
    var me = (GV.session && GV.session.emp) || null;
    var rol = (GV.perm && GV.perm.role) ? GV.perm.role() : null;
    var genis = ['sahip','genelmudur','sistem','operasyon','pm','depmudur'];
    var list = hepsi();
    if(!me) return [];
    if(genis.indexOf(rol) !== -1) return list;
    /* Dar kapsam: üzerimdeki ya da onayımı bekleyen işler */
    return list.filter(function(r){ return r.sorumlu === me; });
  }

  function suz(rows, f){
    f = f || {};
    return rows.filter(function(r){
      if(f.tip && f.tip.length && f.tip.indexOf(r.tip) === -1) return false;
      if(f.durum && f.durum.length && f.durum.indexOf(r.durum) === -1) return false;
      if(f.sorumlu && r.sorumlu !== f.sorumlu) return false;
      if(f.tarih === 'geciken' && !r.gecikti) return false;
      if(f.tarih === 'bugun' && r.sonTarih !== bugun()) return false;
      if(f.tarih === 'tarihsiz' && r.sonTarih) return false;
      if(f.q){
        var q = String(f.q).toLocaleLowerCase('tr');
        var hay = [r.baslik, r.kod, r.iliski, empAd(r.sorumlu)].join(' ').toLocaleLowerCase('tr');
        if(hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  /* Sıralama: gecikenler önce, sonra son tarihe göre, tarihsizler en sonda.
     Tanım TEK yerde — ekran kendi sıralamasını yazmaz (R1 dersi L-40). */
  function sirala(rows){
    var t = bugun();
    return rows.slice().sort(function(a, b){
      if(a.gecikti !== b.gecikti) return a.gecikti ? -1 : 1;
      if(!a.sonTarih && !b.sonTarih) return String(a.kod).localeCompare(String(b.kod));
      if(!a.sonTarih) return 1;
      if(!b.sonTarih) return -1;
      return String(a.sonTarih).localeCompare(String(b.sonTarih));
    });
  }

  function bul(id){
    return hepsi().filter(function(r){ return r.id === id; })[0] || null;
  }

  /* Satırın arkasındaki GERÇEK kaydı döndürür — sağ panel bunu okur. */
  function kayit(r){
    if(!r) return null;
    if(r.tip === 'gorev')    return (DB.tasks || []).filter(function(x){ return x.kod === r.kod; })[0] || null;
    if(r.tip === 'destek')   return (DB.tickets || []).filter(function(x){ return x.kod === r.kod; })[0] || null;
    if(r.tip === 'onay')     return (DB.approvals || []).filter(function(x){ return x.kod === r.kod; })[0] || null;
    if(r.tip === 'takip')    return (DB.opportunities || []).filter(function(x){ return x.kod === r.kod; })[0] || null;
    if(r.tip === 'tahsilat') return (DB.payments || []).filter(function(x){ return x.kod === r.kod; })[0] || null;
    if(r.tip === 'istalebi') return (DB.deptRequests || []).filter(function(x){ return x.kod === r.kod; })[0] || null;
    return null;
  }

  function sayac(rows){
    var out = { toplam:rows.length, geciken:0 };
    Object.keys(TIPLER).forEach(function(k){ out[k] = 0; });
    rows.forEach(function(r){ out[r.tip]++; if(r.gecikti) out.geciken++; });
    return out;
  }

  GV.kuyruk = {
    tipler:TIPLER,
    hepsi:hepsi,
    kapsamli:kapsamli,
    suz:suz,
    sirala:sirala,
    bul:bul,
    kayit:kayit,
    sayac:sayac,
    empAd:empAd
  };
})();
