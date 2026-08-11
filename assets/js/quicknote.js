/* =====================================================================
   GAVIAWORKS CRM R2 — HIZLI NOTLAR
   Şartname §4.2 · tasks/sadelestirme-talimati.md

   R1'de kişisel not AYRI BİR BÖLÜMDÜ: `app-notlarim.html` + `app-not-form.html`,
   6 liste sekmesi, 4 form sekmesi, 4 KPI, kategori/renk/öncelik/sabitleme/
   toplu işlem/arşiv. Şartname §1.1(3) bunu "günlük ihtiyacın önüne geçmiş"
   sayıyor ve modülü tek bir çekmeceye indiriyor.

   Bu dosya O ÇEKMECEDİR. Yeni not formunda YALNIZ:
     · not metni (ilk satır otomatik başlık)
     · isteğe bağlı tarih
     · otomatik sahip (oturum kullanıcısı, seçilemez)
     · Yapıldı checkbox'ı

   GÖSTERİLMEYEN ama VERİDE KORUNAN alanlar (§4.2 son paragraf):
     kategori · renk · öncelik · sabit · hatırlatma · kontrol listesi
   Bunlar `GV.notes.olustur` tarafından varsayılanla doldurulur ve eski
   kayıtlarda okunmaya devam eder — "eski not verileri kaybolmamalıdır".

   ⚠️ BACKEND PAYI — DÜRÜST BEYAN
   Şartname §4.2: "Not yalnız sahibine görünür. API her okumada ve yazmada
   `owner_user_id` kontrolü yapar; YALNIZ ARAYÜZDE FİLTRELEMEK YETERLİ
   DEĞİLDİR." Bu prototipte backend yoktur; sahiplik süzgeci `GV.notes`
   içinde İSTEMCİDE çalışır. Çekmece bunu kullanıcıya AÇIKÇA söyler
   (aşağıdaki `BACKEND_NOTU`). Yeteneği varmış gibi göstermek yasaktır.
   ===================================================================== */
(function(){
  'use strict';

  var GV = window.GV = window.GV || {};

  var BACKEND_NOTU =
    'Sahiplik süzgeci bu prototipte istemcide çalışır. Gerçek sistemde ' +
    'her okuma ve yazma sunucuda owner_user_id ile doğrulanır.';

  /* =====================================================================
     TEMBEL YÜKLEME — karar K-11 (ADR-R2-01)

     R1'de kişisel not verisi ayrı dosyadaydı ve 148 ekranın yalnız 2'sinde
     yükleniyordu (ADR-21): sızıntı yolu FİZİKSEL olarak kapalıydı. Şartname
     §4.2 "tüm sayfalarda Not Al düğmesi" isteyince o garanti düşecekti —
     her sayfa `notes.js`i yüklemek zorunda kalırdı.

     K-11 bunu düz bırakmayı reddetti. Yeni sözleşme:
       · Sayfa yüklenirken HİÇBİR not belleğe girmez. `notes.js` hiçbir
         HTML dosyasında `<script>` ile yüklenmez.
       · Veri ancak kullanıcı AÇIK BİR EYLEMLE istediğinde çekilir.
       · Çekildiği anda SAHİPLİK SÜZGECİ UYGULANIR: oturum sahibine ait
         olmayan kayıtlar bellekten ATILIR, ekranda gizlenmez.

     Fark önemlidir: R1'de süzgeç okuma anındaydı (`GV.notes.benim`), yani
     başkasının notu bellekte DURUYORDU ve yalnız gösterilmiyordu. Burada
     bellekte hiç durmaz. Bu, backend izolasyonunun yerini TUTMAZ — ama
     istemcide yapılabilecek en güçlü şeydir ve ekran bunu söylemeye
     devam eder.
     ===================================================================== */
  var VERI_YOLU = 'assets/data/notes.js';
  var yukleSozu = null;

  /* Sahiplik süzgeci — YÜKLEME ANINDA, yıkıcı. */
  function sahipSuz(){
    var emp = (GV.session && GV.session.emp) || null;
    if(!window.DB) return 0;
    if(!emp){
      /* Oturum yoksa hiçbir not tutulmaz. "Oturum yoksa hepsini göster"
         yedeği tam olarak kapatılan açıktır. */
      DB.personalNotes = [];
      DB.personalNoteChecklistItems = [];
      return 0;
    }
    var once = (DB.personalNotes || []).length;
    DB.personalNotes = (DB.personalNotes || []).filter(function(n){ return n.owner === emp; });
    var kalanKodlar = DB.personalNotes.map(function(n){ return n.kod; });
    DB.personalNoteChecklistItems = (DB.personalNoteChecklistItems || []).filter(function(m){
      return m.owner === emp && kalanKodlar.indexOf(m.not) !== -1;
    });
    return once - DB.personalNotes.length;   /* bellekten atılan yabancı kayıt */
  }

  function yukle(){
    if(yukleSozu) return yukleSozu;
    /* Veri zaten yüklüyse (ör. sayfa elle yüklemişse) yalnız süz. */
    if(window.DB && DB.personalNotes){
      sahipSuz();
      yukleSozu = Promise.resolve(true);
      return yukleSozu;
    }
    yukleSozu = new Promise(function(res){
      var s = document.createElement('script');
      s.src = VERI_YOLU;
      s.onload = function(){
        var atilan = sahipSuz();
        if(atilan > 0 && window.console && console.debug){
          console.debug('[quicknote] ' + atilan + ' yabancı not bellekten atıldı');
        }
        res(true);
      };
      s.onerror = function(){
        /* Yüklenemedi — "not yok" DENMEZ, "okunamadı" denir. Sıfır ölçüm
           temiz değildir (R1 dersi). */
        res(false);
      };
      document.head.appendChild(s);
    });
    return yukleSozu;
  }

  /* Veri bellekte mi — ekranlar buna bakıp yükleme çağrısı yapar. */
  function hazir(){
    return !!(window.DB && DB.personalNotes);
  }

  /* Tamamlanan not 24 saat sonra varsayılan listeden gizlenir (§4.2).
     Kayıt SİLİNMEZ — arama ile bulunabilir. */
  var GIZLEME_SAAT = 24;

  /* ⚠️ İKİ GERİ ALMA, İKİ AYRI DİL — karar K-12 · ADR-R2-15.

     Sistemde geri alınabilen iki şey var ve süreleri farklı:
       · TAMAMLAMA → 5 saniye → arayüzdeki adı **"Geri al"** (tost şeridi)
       · SİLME     → 7 gün    → arayüzdeki adı **"Çöp kutusu"** (ADR-14)

     Karar: ikisi de yaşar ama AYNI KELİME İKİ YERDE KULLANILMAZ. "Geri al"
     yalnız beş saniyelik tamamlama şeridinin adıdır; silinen not "çöp
     kutusundadır" ve oradan "geri yüklenir". Kullanıcı iki farklı süreyi
     iki farklı kelimeyle öğrenir, tek kelimenin iki anlamıyla değil. */
  var GERI_ALMA_MS = 5000;
  var COP_KUTUSU_GUN = (window.DB && DB.noteTrashDays) || 7;

  function esc(s){ return GV.esc ? GV.esc(s) : String(s == null ? '' : s); }
  function ico(n, c){ return GV.ico ? GV.ico(n, c) : ''; }

  /* Notun ilk satırı başlıktır (§4.2 "ilk satır otomatik başlık kabul edilir") */
  function basligiCikar(metin){
    var ilk = String(metin || '').split('\n')[0].trim();
    return ilk.slice(0, 120);
  }

  /* Tamamlanma damgası ile şimdi arasındaki saat farkı.
     `GV.notes` damgayı `DB.today + 'T' + saat` biçiminde yazıyor. */
  function saatGecti(damga){
    if(!damga) return 0;
    var d = new Date(String(damga).replace(' ', 'T'));
    if(isNaN(d)) return 0;
    return (Date.now() - d.getTime()) / 3600000;
  }

  /* Çekmecede gösterilecek notlar:
     · açık notların en yenisi yedi tanesi (§4.2 "son yedi açık not")
     · 24 saatten yeni tamamlananlar (kullanıcı az önce ne bitirdiğini görsün)
     Arama kipinde bu sınır KALKAR — tamamlananlar da bulunur. */
  function gorunenler(q){
    if(!GV.notes) return { acik:[], tamam:[], arama:false };
    if(q){
      var hepsi = GV.notes.ara(q);
      return {
        acik:  hepsi.filter(function(n){ return n.durum === 'Açık'; }),
        tamam: hepsi.filter(function(n){ return n.durum === 'Tamamlandı'; }),
        arama: true
      };
    }
    var acik = GV.notes.gorunum('acik').slice(0, 7);
    var tamam = GV.notes.gorunum('tamam').filter(function(n){
      return saatGecti(n.tamamlanma) < GIZLEME_SAAT;
    });
    return { acik:acik, tamam:tamam, arama:false };
  }

  function satir(n, tamamMi){
    var baslik = n.baslik || basligiCikar(n.body) || '(boş not)';
    var govde  = String(n.body || '');
    var kalan  = govde.split('\n').slice(1).join(' ').trim();
    return '<li class="qn-item' + (tamamMi ? ' is-done' : '') + '" data-kod="' + esc(n.kod) + '">' +
      '<label class="qn-check">' +
        '<input type="checkbox" ' + (tamamMi ? 'checked' : '') + ' data-qn-toggle="' + esc(n.kod) + '" ' +
          'aria-label="' + esc(baslik) + ' — tamamlandı olarak işaretle">' +
        '<span></span>' +
      '</label>' +
      '<div class="qn-body">' +
        '<div class="qn-title">' + esc(baslik) + '</div>' +
        (kalan ? '<div class="qn-sub">' + esc(kalan.slice(0, 90)) + (kalan.length > 90 ? '…' : '') + '</div>' : '') +
        (n.bitis ? '<div class="qn-due">' + ico('i-calendar','ic-sm') + ' ' + esc(n.bitis) + '</div>' : '') +
      '</div>' +
    '</li>';
  }

  function listeHtml(q){
    var g = gorunenler(q);
    var html = '';

    if(!g.acik.length && !g.tamam.length){
      html += '<div class="qn-empty">' + ico('i-file','ic-xl') +
              '<p>' + (g.arama ? 'Bu aramaya uyan not yok.' : 'Henüz notunuz yok. Yukarıya yazıp Enter\'a basın.') + '</p></div>';
      return html;
    }

    if(g.acik.length){
      html += '<ul class="qn-list">' + g.acik.map(function(n){ return satir(n, false); }).join('') + '</ul>';
    }
    if(g.tamam.length){
      html += '<div class="qn-sep">' + (g.arama ? 'Tamamlanan' : 'Az önce tamamlanan') + '</div>' +
              '<ul class="qn-list">' + g.tamam.map(function(n){ return satir(n, true); }).join('') + '</ul>';
    }
    return html;
  }

  function govdeHtml(){
    return (
      '<div class="qn-new">' +
        '<textarea id="qnText" class="inp qn-text" rows="2" ' +
          'placeholder="Not yazın — Enter kaydeder, Shift+Enter satır açar" ' +
          'aria-label="Yeni not"></textarea>' +
        '<div class="qn-new-foot">' +
          '<label class="qn-date">' + ico('i-calendar','ic-sm') +
            '<input type="date" id="qnDate" class="inp" aria-label="Tarih (isteğe bağlı)">' +
          '</label>' +
          '<button type="button" class="btn btn-acc btn-sm" id="qnSave">' + ico('i-check','ic-sm') + ' Kaydet</button>' +
        '</div>' +
      '</div>' +
      '<div class="qn-search">' + ico('i-search','ic-sm') +
        '<input type="search" id="qnSearch" class="inp" placeholder="Notlarımda ara" aria-label="Notlarımda ara">' +
      '</div>' +
      '<div id="qnList">' + listeHtml('') + '</div>' +
      '<div id="qnUndo" class="qn-undo" aria-live="polite"></div>' +
      '<p class="qn-owner">' + ico('i-lock','ic-sm') + ' Bu notlar yalnız size görünür. ' +
        '<span class="qn-backend">' + esc(BACKEND_NOTU) + '</span></p>'
    );
  }

  var undoTimer = null;

  function ac(){
    if(!GV.drawer){
      if(GV.toast) GV.toast('Hızlı Not için ui.js gerekli.', 'warn');
      return;
    }
    if(!GV.notes){
      if(GV.toast) GV.toast('Hızlı Not için domain.js gerekli.', 'warn');
      return;
    }
    if(!GV.session || !GV.session.emp){
      if(GV.toast) GV.toast('Hızlı Not yalnız personel oturumunda kullanılır.', 'info');
      return;
    }

    /* Çekmece ÖNCE açılır, veri SONRA gelir — kullanıcı boş ekrana bakmaz.
       Yükleme bitene kadar iskelet basılır. */
    var d = GV.drawer({
      title:'Hızlı Notlar',
      body:'<div class="qn-yukleniyor">' + ico('i-file','ic-xl') +
           '<p>Notlarınız yükleniyor…</p></div>',
      onMount:function(body){
        yukle().then(function(basarili){
          if(!body.isConnected) return;        /* çekmece bu arada kapandıysa */
          if(!basarili){
            body.innerHTML = '<div class="qn-empty">' + ico('i-alert','ic-xl') +
              '<p>Not verisi okunamadı. Bu bir hata durumudur — ' +
              '&laquo;notunuz yok&raquo; anlamına gelmez.</p></div>';
            return;
          }
          body.innerHTML = govdeHtml();
          bagla(body);
        });
      }
    });
    return d;
  }

  function yenile(body){
    var host = body.querySelector('#qnList');
    var q = (body.querySelector('#qnSearch') || {}).value || '';
    if(host) host.innerHTML = listeHtml(q);
  }

  function bagla(body){
    var ta     = body.querySelector('#qnText');
    var dateEl = body.querySelector('#qnDate');
    var saveEl = body.querySelector('#qnSave');
    var searchEl = body.querySelector('#qnSearch');

    if(ta) ta.focus();

    function kaydet(){
      var metin = String(ta.value || '').trim();
      if(!metin){
        if(GV.toast) GV.toast('Not metni boş olamaz.', 'warn');
        ta.focus();
        return;
      }
      /* Sahiplik OTURUMDAN atanır — çağıran owner göndermez (§9 quick_note
         "Yalnız sahibi okuyabilir/değiştirebilir"). */
      GV.notes.olustur({
        baslik: basligiCikar(metin),
        body:   metin,
        bitis:  dateEl && dateEl.value ? dateEl.value : null
      });
      ta.value = '';
      if(dateEl) dateEl.value = '';
      yenile(body);
      ta.focus();
    }

    /* §4.2 — Enter kaydeder, Shift+Enter yeni satır açar. */
    if(ta){
      ta.addEventListener('keydown', function(e){
        if(e.key !== 'Enter' || e.shiftKey) return;
        e.preventDefault();
        kaydet();
      });
    }
    if(saveEl) saveEl.addEventListener('click', kaydet);

    if(searchEl){
      searchEl.addEventListener('input', function(){ yenile(body); });
    }

    /* §4.2 — checkbox işaretlenince not tamamlanır ve 5 saniyelik geri alma
       imkânı verilir. Geri alma penceresi kapanınca şerit kendi kendine
       kaybolur; kayıt zaten yazılmıştır, şerit yalnız geri dönüş sunar. */
    body.addEventListener('change', function(e){
      var cb = e.target.closest('[data-qn-toggle]');
      if(!cb) return;
      var kod = cb.getAttribute('data-qn-toggle');
      var n = GV.notes.bul(kod);
      if(!n) return;

      var hedef = cb.checked ? 'Tamamlandı' : 'Açık';
      GV.notes.guncelle(kod, { durum:hedef });
      yenile(body);

      if(hedef !== 'Tamamlandı') return;
      geriAlmaSerit(body, kod, n.baslik || basligiCikar(n.body));
    });
  }

  function geriAlmaSerit(body, kod, baslik){
    var host = body.querySelector('#qnUndo');
    if(!host) return;
    if(undoTimer){ clearTimeout(undoTimer); undoTimer = null; }

    host.innerHTML =
      '<div class="qn-undo-bar">' +
        '<span>' + ico('i-check-circle','ic-sm') + ' <b>' + esc(baslik) + '</b> tamamlandı.</span>' +
        '<button type="button" class="btn btn-line btn-sm" id="qnUndoBtn">' +
          ico('i-refresh','ic-sm') + ' Geri al</button>' +
      '</div>';

    var btn = host.querySelector('#qnUndoBtn');
    if(btn){
      btn.addEventListener('click', function(){
        GV.notes.guncelle(kod, { durum:'Açık' });
        host.innerHTML = '';
        if(undoTimer){ clearTimeout(undoTimer); undoTimer = null; }
        yenile(body);
      });
    }

    undoTimer = setTimeout(function(){
      /* Çekmece bu arada kapanmış olabilir — düğüm hâlâ belgede mi diye bak. */
      if(host.isConnected) host.innerHTML = '';
      undoTimer = null;
    }, GERI_ALMA_MS);
  }

  GV.quickNote = {
    ac:ac,
    /* Panelin Hızlı Notlar kartı bu yordamları çağırır — liste tanımı TEK
       yerdedir, kart kendi süzgecini yazmaz (R1 dersi L-40). */
    gorunenler:gorunenler,
    basligiCikar:basligiCikar,
    backendNotu:BACKEND_NOTU,
    /* K-12 — arayüz dili tek yerde tanımlı; ekranlar kendi kelimesini
       uydurmaz. Silme yüzeyi yazıldığında bu sözlükten okuyacak. */
    dil:{
      tamamlamaGeriAl:'Geri al',
      tamamlamaSure:GERI_ALMA_MS / 1000,
      silmeYuzey:'Çöp kutusu',
      silmeGeriYukle:'Geri yükle',
      silmeSureGun:COP_KUTUSU_GUN
    },
    /* Tembel yükleme yüzeyi — karar K-11 */
    yukle:yukle,
    hazir:hazir,
    veriYolu:VERI_YOLU
  };
})();
