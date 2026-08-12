/* =====================================================================
   GAVIAWORKS CRM R2 — TEK RAPOR YÜZEYİ
   Şartname §7.1 · §7.3 · §7.4

   ⚠️ NEDEN YENİ BİR KABUK
   `ui.js` içinde R1'den taşınan bir `GV.report` var ve o, `gv-rp-nav`
   sınıfıyla **rapor içi bir sol menü** basıyor. Şartname §7.1'in ilk cümlesi
   tam olarak bunu yasaklıyor: "Rapor içi sol menü kaldırılmalıdır."
   `ui.js` değiştirilmeden taşındı ve değiştirilmiyor; bu yüzden yeni yüzey
   `GV.rapor` adıyla AYRI bir dosyada kuruldu. `GV.report` yerinde duruyor,
   R2'de hiçbir ekran onu çağırmıyor.

   SAYFA SIRASI (§7.1, birebir):
     1. Başlık ve çıktı eylemleri      → GV.pageHead + .rp-cikti
     2. Tek satır ortak filtre          → .rp-filtre (dönem · kapsam · sorumlu · temizle)
     3. Yatay rapor seçimi              → .rp-secim
     4. En fazla DÖRT KPI               → .rp-kpi
     5. En fazla İKİ grafik             → .rp-grafik
     6. BİR detay tablosu               → .rp-tablo

   TAVANLAR KODDA UYGULANIR, umut edilmez: `TAVAN` sabitleri fazlasını keser
   ve kesileni konsola yazar. Ölçüm ekseni (`tasks/qa/rapor-tavan.js`) aynı
   sayıları DOM'dan bağımsız olarak sayar.
   ===================================================================== */
(function(){
  'use strict';

  var GV = window.GV = window.GV || {};

  var TAVAN = { kpi:4, grafik:2, tablo:1 };

  function esc(s){ return GV.esc ? GV.esc(s) : String(s == null ? '' : s); }
  function ico(n, c){ return GV.ico ? GV.ico(n, c) : ''; }

  /* Uzun etiket kısaltma — §7.3 "Uzun etiketler kısaltılmalı, tooltip tam
     metni göstermeli". Kısaltma TEK yerde; her grafik kendi kuralını yazmaz. */
  function kisa(s, n){
    s = String(s == null ? '' : s);
    n = n || 14;
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  GV.rapor = function(cfg){
    var mount = typeof cfg.mount === 'string' ? document.querySelector(cfg.mount) : cfg.mount;
    if(!mount) return null;
    var raporlar = (cfg.raporlar || []).filter(Boolean);
    if(!raporlar.length) return null;

    var qs = new URLSearchParams(location.search);
    var durum = {
      key:null,
      donem:qs.get('donem') || '12ay',
      kapsam:qs.get('kapsam') || '',
      sorumlu:qs.get('sorumlu') || ''
    };
    function bul(k){
      for(var i = 0; i < raporlar.length; i++) if(raporlar[i].key === k) return raporlar[i];
      return null;
    }
    durum.key = bul(qs.get('r')) ? qs.get('r') : raporlar[0].key;

    function urlYaz(){
      var u = new URLSearchParams(location.search);
      u.set('r', durum.key);
      ['donem','kapsam','sorumlu'].forEach(function(k){
        if(durum[k]) u.set(k, durum[k]); else u.delete(k);
      });
      history.replaceState(null, '', location.pathname + '?' + u.toString());
    }

    /* ---- 2. Tek satır ortak filtre (§7.1/2) --------------------- */
    var DONEMLER = [
      { v:'3ay',  ad:'Son 3 ay' },
      { v:'6ay',  ad:'Son 6 ay' },
      { v:'12ay', ad:'Son 12 ay' },
      { v:'yil',  ad:'Bu yıl' }
    ];

    function filtreHtml(){
      var kapsamlar = (cfg.kapsamlar || []);
      var kisiler = (cfg.sorumlular || []);
      return '<div class="rp-filtre" role="group" aria-label="Rapor filtreleri">' +
        '<label class="rp-f"><span>Dönem</span>' +
          '<select class="inp" id="rpDonem">' + DONEMLER.map(function(d){
            return '<option value="' + d.v + '"' + (durum.donem === d.v ? ' selected' : '') + '>' + esc(d.ad) + '</option>';
          }).join('') + '</select></label>' +
        '<label class="rp-f"><span>Kapsam</span>' +
          '<select class="inp" id="rpKapsam"><option value="">Tümü</option>' + kapsamlar.map(function(k){
            return '<option value="' + esc(k.v) + '"' + (durum.kapsam === k.v ? ' selected' : '') + '>' + esc(k.ad) + '</option>';
          }).join('') + '</select></label>' +
        '<label class="rp-f"><span>Sorumlu</span>' +
          '<select class="inp" id="rpSorumlu"><option value="">Tümü</option>' + kisiler.map(function(k){
            return '<option value="' + esc(k.v) + '"' + (durum.sorumlu === k.v ? ' selected' : '') + '>' + esc(k.ad) + '</option>';
          }).join('') + '</select></label>' +
        '<button type="button" class="btn btn-line btn-sm" id="rpTemizle">' +
          ico('i-x','ic-sm') + ' Temizle</button>' +
      '</div>';
    }

    /* ---- 3. Yatay rapor seçimi (§7.1/3) — sol menü DEĞİL --------- */
    function secimHtml(){
      return '<div class="rp-secim" role="tablist" aria-label="Rapor seçimi">' +
        raporlar.map(function(r){
          var on = r.key === durum.key;
          return '<button type="button" class="rp-sec' + (on ? ' is-on' : '') + '" ' +
            'role="tab" aria-selected="' + (on ? 'true' : 'false') + '" data-rp="' + esc(r.key) + '">' +
            ico(r.ikon || 'i-chart-bar','ic-sm') + '<span>' + esc(r.ad) + '</span></button>';
        }).join('') + '</div>';
    }

    /* ---- 4/5/6. Gövde — tavanlar burada uygulanır --------------- */
    function govdeHtml(r, veri){
      var html = '';

      /* 4 — en fazla dört KPI */
      var kpis = (veri.kpis || []);
      if(kpis.length > TAVAN.kpi){
        console.warn('[rapor] ' + r.key + ': ' + kpis.length + ' KPI verildi, ' + TAVAN.kpi + ' basıldı');
        kpis = kpis.slice(0, TAVAN.kpi);
      }
      html += '<div class="rp-kpi" data-rp-kpi="' + kpis.length + '">' + kpis.map(function(k){
        return '<div class="rp-kpi-k' + (k.tone ? ' is-' + k.tone : '') + '"' +
          (k.ipucu ? ' title="' + esc(k.ipucu) + '"' : '') + '>' +
          '<div class="rp-kpi-lbl">' + esc(k.lbl) + '</div>' +
          '<div class="rp-kpi-val">' + (k.gizli ? '••••••' : esc(k.val)) + '</div>' +
          (k.alt ? '<div class="rp-kpi-alt">' + esc(k.alt) + '</div>' : '') +
        '</div>';
      }).join('') + '</div>';

      /* 5 — en fazla iki grafik. §7.3: 1200px üstü iki kolon, altı tek kolon
         (CSS'te); kapsayıcıda min-width:0 ve overflow:hidden. */
      var grafikler = (veri.grafikler || []);
      if(grafikler.length > TAVAN.grafik){
        console.warn('[rapor] ' + r.key + ': ' + grafikler.length + ' grafik verildi, ' + TAVAN.grafik + ' basıldı');
        grafikler = grafikler.slice(0, TAVAN.grafik);
      }
      if(grafikler.length){
        html += '<div class="rp-grafikler" data-rp-chart="' + grafikler.length + '">' +
          grafikler.map(function(g){
            return '<figure class="rp-grafik">' +
              '<figcaption class="rp-grafik-bas">' + esc(g.baslik) + '</figcaption>' +
              '<div class="rp-grafik-ic">' + (g.html || '') + '</div>' +
              (g.aciklama ? '<div class="rp-grafik-alt">' + esc(g.aciklama) + '</div>' : '') +
            '</figure>';
          }).join('') + '</div>';
      }else{
        html += '<div class="rp-grafikler" data-rp-chart="0"></div>';
      }

      /* 6 — bir detay tablosu */
      var t = veri.tablo;
      if(t && t.satirlar && t.satirlar.length){
        html += '<section class="rp-tablo-sar" data-rp-table="1">' +
          '<h2 class="rp-tablo-bas">' + esc(t.baslik) + '</h2>' +
          '<div class="rp-tablo-kaydir">' +
            '<table class="rp-tablo"><thead><tr>' +
              t.kolonlar.map(function(c){
                return '<th' + (c.num ? ' class="num"' : '') + '>' + esc(c.lbl) + '</th>';
              }).join('') +
            '</tr></thead><tbody>' +
              t.satirlar.map(function(s){
                return '<tr>' + s.map(function(h, i){
                  var c = t.kolonlar[i] || {};
                  return '<td' + (c.num ? ' class="num"' : '') +
                    (h && h.ipucu ? ' title="' + esc(h.ipucu) + '"' : '') + '>' +
                    (h && h.html ? h.html : esc(h && h.v != null ? h.v : h)) + '</td>';
                }).join('') + '</tr>';
              }).join('') +
            '</tbody></table>' +
          '</div>' +
        '</section>';
      }else{
        /* §7.3 — "Boş veri, 0 çizmek yerine açıklayıcı boş durum göstermeli." */
        html += '<section class="rp-tablo-sar" data-rp-table="0">' +
          (GV.empty ? GV.empty({ icon:'i-chart-bar', title:'Bu filtrede tablo verisi yok',
            desc:'Dönemi genişletebilir ya da kapsam ve sorumlu filtresini temizleyebilirsiniz.' })
            : '<p>Veri yok</p>') +
        '</section>';
      }

      return html;
    }

    /* ---- 1. Çıktı eylemleri (§7.4) ------------------------------- */
    function ciktiHtml(){
      return '<div class="rp-cikti">' +
        '<button type="button" class="btn btn-line btn-sm" data-cikti="pdf">' + ico('i-download','ic-sm') + ' PDF</button>' +
        '<button type="button" class="btn btn-line btn-sm" data-cikti="csv">' + ico('i-download','ic-sm') + ' Excel / CSV</button>' +
        '<button type="button" class="btn btn-line btn-sm" data-cikti="yazdir">' + ico('i-printer','ic-sm') + ' Yazdır</button>' +
      '</div>';
    }

    /* Baskı künyesi — §7.4. Ekranda gizli, yalnız baskıda görünür. */
    function kunyeHtml(r){
      var f = [];
      f.push('Dönem: ' + (DONEMLER.filter(function(d){ return d.v === durum.donem; })[0] || {}).ad);
      if(durum.kapsam)  f.push('Kapsam: ' + ((cfg.kapsamlar || []).filter(function(k){ return k.v === durum.kapsam; })[0] || {}).ad);
      if(durum.sorumlu) f.push('Sorumlu: ' + ((cfg.sorumlular || []).filter(function(k){ return k.v === durum.sorumlu; })[0] || {}).ad);
      var kisi = (GV.session && GV.session.ad) || '—';
      var t = (window.DB && DB.today) || '';
      return '<div class="rp-kunye" aria-hidden="true">' +
        '<div class="rp-kunye-bas"><b>GaviaWorks</b> · ' + esc(r.ad) + '</div>' +
        '<div class="rp-kunye-sat">Filtreler: ' + esc(f.join(' · ')) + '</div>' +
        '<div class="rp-kunye-sat">Oluşturma: ' + esc(t) + ' · Oluşturan: ' + esc(kisi) + '</div>' +
      '</div>';
    }

    /* ---- Çıktı uygulayıcıları ----------------------------------- */
    function ciktiUygula(tur, r, veri){
      if(tur === 'yazdir'){
        /* Baskıda navigasyon, filtre ve butonlar görünmez — kural CSS'te
           (@media print). Burada yalnız pencere açılır. */
        GV.audit && GV.audit.yaz({ kayit:'RAPOR-' + r.key, islem:'Rapor yazdırıldı',
          tone:'info', icon:'i-printer', modul:'rapor' });
        window.print();
        return;
      }
      if(tur === 'csv'){
        if(!veri.tablo || !veri.tablo.satirlar || !veri.tablo.satirlar.length){
          GV.toast && GV.toast('Bu filtrede dışa aktarılacak satır yok.', 'warn');
          return;
        }
        csvIndir(r, veri);
        return;
      }
      if(tur === 'pdf'){
        /* ⚠️ BACKEND PAYI — taklit edilmez. R1'de de "PDF" yazdırma
           penceresiydi ve o dürüstçe kısmi sayılmıştı. */
        GV.modal && GV.modal({
          title:'PDF çıktısı', size:'sm', icon:'i-alert', tone:'warn',
          body:'<p class="u-sm">Gerçek PDF üretimi <b>backend payıdır</b> ve bu ' +
               'prototipte yoktur. Taklit edilmedi: bir kütüphaneyle üretilen ' +
               '&laquo;PDF gibi&raquo; bir çıktı, yetki ve maskeleme kurallarını ' +
               'sunucuda uygulanmış gibi gösterirdi.</p>' +
               '<p class="u-sm">Bugün yapılabilecek en dürüst şey, tarayıcının ' +
               'yazdırma penceresinden &laquo;PDF olarak kaydet&raquo;tir — künye, ' +
               'filtreler ve sayfa numarası baskı düzeninde zaten var.</p>',
          actions:[{ label:'Vazgeç', cls:'btn-line' },
                   { label:'Yazdırma penceresini aç', cls:'btn-acc',
                     onClick:function(){ setTimeout(function(){ window.print(); }, 60); } }]
        });
        return;
      }
    }

    /* CSV — formül koruması R1'den taşındı (`csvGuard` deseni).
       Bir hücre = + - @ ile başlıyorsa tablo programı onu FORMÜL sanır;
       başına tırnak konur. Bu, dışa aktarılan bir raporun açıldığında
       komut çalıştırmasını engeller. */
    function csvKoru(s){
      s = String(s == null ? '' : s);
      if(/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    }

    function csvIndir(r, veri){
      var t = veri.tablo;
      var sat = [];
      /* Künye satırları — §7.4 "uygulanan filtreler, oluşturma zamanı ve
         oluşturan kullanıcı" çıktının içinde olmalı. */
      sat.push([csvKoru('GaviaWorks — ' + r.ad)]);
      sat.push([csvKoru('Dönem'), csvKoru(durum.donem)]);
      if(durum.kapsam)  sat.push([csvKoru('Kapsam'), csvKoru(durum.kapsam)]);
      if(durum.sorumlu) sat.push([csvKoru('Sorumlu'), csvKoru(durum.sorumlu)]);
      sat.push([csvKoru('Oluşturma'), csvKoru((window.DB && DB.today) || '')]);
      sat.push([csvKoru('Oluşturan'), csvKoru((GV.session && GV.session.ad) || '')]);
      sat.push([]);
      sat.push(t.kolonlar.map(function(c){ return csvKoru(c.lbl); }));
      t.satirlar.forEach(function(s){
        sat.push(s.map(function(h, i){
          /* Dışa aktarılan değer EKRANDAKİ değerdir; maskeliyse maskeli
             çıkar. Yetki süzgeci burada delinmez (§7.4). */
          var v = (h && h.disa !== undefined) ? h.disa : (h && h.v !== undefined ? h.v : h);
          return csvKoru(v);
        }));
      });
      var csv = '﻿' + sat.map(function(x){ return x.join(';'); }).join('\r\n');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8;' }));
      a.download = 'gaviaworks-' + r.key + '-' + ((window.DB && DB.today) || '') + '.csv';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 400);

      GV.audit && GV.audit.yaz({ kayit:'RAPOR-' + r.key,
        islem:'Rapor dışa aktarıldı (CSV, ' + t.satirlar.length + ' satır)',
        tone:'info', icon:'i-download', modul:'rapor' });
      GV.toast && GV.toast('CSV indirildi · denetim izine yazıldı', 'ok');
    }

    /* §7.3 — "SVG'de `viewBox` ve `preserveAspectRatio` kullanılmalı."
       `ui.js`teki Chart yordamı `viewBox` basıyor ama `preserveAspectRatio`
       basmıyor. `ui.js` R1'den DEĞİŞTİRİLMEDEN taşındı ve değiştirilmiyor;
       eksik nitelik burada, çizimden sonra tamamlanır. Varsayılan değer
       zaten `xMidYMid meet`tir — ama şartname niteliğin YAZILI olmasını
       istiyor ve ölçüm ekseni onu arıyor. */
    function svgTamamla(){
      Array.prototype.forEach.call(mount.querySelectorAll('.rp-grafik-ic svg'), function(s){
        if(!s.getAttribute('preserveAspectRatio')) s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      });
    }

    /* ---- Çizim ---------------------------------------------------- */
    function ciz(){
      var r = bul(durum.key);
      var veri = r.hesapla(durum) || {};

      mount.innerHTML =
        ciktiHtml() +
        filtreHtml() +
        secimHtml() +
        kunyeHtml(r) +
        '<div class="rp-govde" id="rpGovde">' +
          '<h2 class="rp-baslik">' + esc(r.ad) + '</h2>' +
          (r.ozet ? '<p class="rp-ozet">' + esc(r.ozet) + '</p>' : '') +
          govdeHtml(r, veri) +
        '</div>' +
        (cfg.altBilgi ? '<div class="rp-alt">' + cfg.altBilgi + '</div>' : '');

      svgTamamla();
      bagla(r, veri);
    }

    function bagla(r, veri){
      /* ⚠️ ÖLÇÜLEN KUSUR (gömme dilimi ajanı raporladı, burada ölçülüp
         onarıldı): burada `mount.addEventListener` vardı ve `bagla()` HER
         `ciz()`te koşuyor. `mount` düğümü kalıcı — yalnız `innerHTML`
         değişiyor — dolayısıyla her rapor/filtre değişiminde bir dinleyici
         daha birikiyordu; n. tıklamada `ciz()` n kez koşuyor ve altı
         raporun hesap yordamları katlanarak çalışıyordu. Ekranda görünür
         bozulma yok (çizim idempotent), bu yüzden beş oturum fark
         edilmedi. §2.6'nın `GV.on(el, type, fn, key)` yordamı tam bu iş
         için var ve kayıt anahtarı düğüme yazıldığı için ikinci bağlama
         öncekini SÖKER. `select` dinleyicileri her çizimde YENİ düğümlere
         bağlanıyor, onlarda birikme yok — dokunulmadı. */
      GV.on(mount, 'click', function(e){
        var s = e.target.closest('[data-rp]');
        if(s){ durum.key = s.dataset.rp; urlYaz(); ciz(); return; }
        var c = e.target.closest('[data-cikti]');
        if(c){ ciktiUygula(c.dataset.cikti, r, veri); return; }
        if(e.target.closest('#rpTemizle')){
          durum.donem = '12ay'; durum.kapsam = ''; durum.sorumlu = '';
          urlYaz(); ciz(); return;
        }
      });
      ['rpDonem','rpKapsam','rpSorumlu'].forEach(function(id){
        var el = document.getElementById(id);
        if(!el) return;
        el.addEventListener('change', function(){
          durum[id === 'rpDonem' ? 'donem' : id === 'rpKapsam' ? 'kapsam' : 'sorumlu'] = el.value;
          urlYaz(); ciz();
        });
      });
    }

    ciz();
    return { ciz:ciz, durum:durum, tavan:TAVAN };
  };

  GV.rapor.kisa = kisa;
  GV.rapor.TAVAN = TAVAN;
})();
