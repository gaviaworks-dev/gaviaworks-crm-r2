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

  /* Tamamlanan not 24 saat sonra varsayılan listeden gizlenir (§4.2).
     Kayıt SİLİNMEZ — arama ile bulunabilir. */
  var GIZLEME_SAAT = 24;

  /* 5 saniyelik geri alma penceresi (§4.2). ADR-14'ün 7 günlük ÇÖP KUTUSU
     geri almasıyla karıştırılmamalı: o silme içindir, bu tamamlama içindir.
     İkisi ayrı eksendir ve ikisi de yaşar. */
  var GERI_ALMA_MS = 5000;

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
      if(GV.toast) GV.toast('Hızlı Not için domain.js ve notes.js gerekli.', 'warn');
      return;
    }
    if(!GV.notes.sahip()){
      if(GV.toast) GV.toast('Hızlı Not yalnız personel oturumunda kullanılır.', 'info');
      return;
    }

    GV.drawer({
      title:'Hızlı Notlar',
      body:govdeHtml(),
      onMount:function(body){ bagla(body); }
    });
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
    /* Panelin Hızlı Notlar kartı bu yordamı çağırır — liste tanımı TEK
       yerdedir, kart kendi süzgecini yazmaz (R1 dersi L-40). */
    gorunenler:gorunenler,
    basligiCikar:basligiCikar,
    backendNotu:BACKEND_NOTU
  };
})();
