/* =====================================================================
   GAVIAWORKS CRM — ORTAK BİLEŞEN MOTORU
   Sözlük: tasks/components.md
   Liste bileşeni PROMPT.md §6'nın tamamını tek yerden karşılar.
   ===================================================================== */
(function(){
  'use strict';

  var GV = window.GV = window.GV || {};
  var esc = GV.esc || function(s){ return String(s == null ? '' : s); };
  var ico = GV.ico || function(n){ return '<svg class="ic"><use href="#' + n + '"></use></svg>'; };

  /* Maskeleme işareti — tablo hücresi (`.cell-mask`), KPI ve rapor için TEK yerde.
     UID-11: yetkisiz rolde KPI "₺0" basıyordu; sıfır bir DEĞERDİR, "göremezsin"
     demek değildir. Yetkisiz kullanıcı "para yok" sanıyordu. */
  var MASK = '••••••';

  /* `kpis[]` maskeleme sözleşmesi (UID-11 / UID-28):
       perm:'finans'            → GV.perm.can('finans') değilse maskelenir
       mask:function(){...}     → true dönerse maskelenir
     İkisi de yoksa KPI her rolde açıktır. Ekranlarda tekrarlanan
     `canFinans ? toplam : 0` deseni bu sözleşmeyle silinir. */
  /* Dışa aktarma yetkisi — `GV.perm` yoksa (bileşen tek başına test edilirse) açık sayılır. */
  function canExport(){ return !(GV.perm && GV.perm.can) || !!GV.perm.can('disaAktar'); }

  function kpiMasked(k){
    if(typeof k.mask === 'function') return !!k.mask();
    if(k.perm) return !(GV.perm && GV.perm.can(k.perm));
    return false;
  }

  /* `columns[]` maskeleme sözleşmesi (UID-28) — KPI ile AYNI anahtarlar.
     Maskeleme kararı ekran başına bırakıldığı için kardeş ekranlar ayrışıyordu:
     `app-dokuman-sure` belge adını `can('log')` ile maskelerken merkez liste
     `app-dokuman` aynı kayıtları açık basıyordu; `app-arac-yakit` tutarı
     maskelerken birim fiyatı açık bırakıyor ve maskelenen sayı
     `litre × birimFiyat` ile geri hesaplanabiliyordu.
     Maskelenen kolon ÇIKTIYA DA girmez — maske dekor değil kapıdır. */
  function colMasked(c, r){
    /* `mask` SATIRI alır: gizlilik seviyesi kayıttan kayda değişebilir
       (`Gizli` / `Kişisel veri` belge adı). `perm` ise kolonun tamamına bakar. */
    if(typeof c.mask === 'function') return !!c.mask(r);
    if(c.perm) return !(GV.perm && GV.perm.can(c.perm));
    return false;
  }

  /* ===================================================================
     0a. HTML → DÜZ METİN  (çıktı katmanının tabanı — şartname [14.6.1])
     -------------------------------------------------------------------
     `xport.js` beş oturumdur şunu ölçüyor: "ekranda dolu, çıktıda boş" hücre.
     Kök neden tek cümlede: **kolonun ekranda gösterdiği değer `render`'dan
     türüyor, çıktı ise `r[c.key]`'e bakıyordu.** Türetilmiş kolonda o anahtar
     kayıtta hiç yok, dolayısıyla hücre boş çıkıyordu — 22 ekranda.

     Yanlış çözüm: 22 ekranda tek tek `exportValue` yazmak. Doğru çözüm:
     çıktı, `exportValue` verilmediğinde **ekranın gösterdiği metni** almalı.
     `render` HTML döndürdüğü için ham etiket çıktıya gitmesin diye buradan
     geçirilir. Etiket sınırları BOŞLUĞA çevrilir: `<span>Acme</span><span>
     MUS-001</span>` düz silmeyle "AcmeMUS-001" olurdu (L-14'ün çıktı
     tarafındaki ikizi — "konsol temiz ≠ ekran doğru"nun üçüncüsü). */
  function htmlText(h){
    if(h == null) return '';
    return String(h)
      .replace(/<(br|hr)\s*\/?>/gi, ' ')
      .replace(/<\/(div|p|li|tr|td|th|span|h[1-6])\s*>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }
  GV.htmlText = htmlText;

  /* CSV FORMÜL ENJEKSİYONU KORUMASI — şartname [14.4.5].
     `=`, `+`, `-`, `@` ile başlayan bir hücre Excel/Sheets'te FORMÜL olarak
     yorumlanır; `=cmd|'/c calc'!A1` gibi bir değer dosyayı açan kişinin
     makinesinde komut çalıştırabilir. Değer bozulmadan zararsızlaştırılır:
     başına tek tırnak konur (Excel'in metin işareti) ve hücre tırnaklanır.
     ⚠️ Negatif sayı da `-` ile başlar; sayısal hücre (yalnız rakam, ayraç,
     nokta/virgül) MUAF tutulur, yoksa her eksi tutar bozulurdu. */
  function csvGuard(s){
    if(!s) return s;
    if(!/^[=+\-@\t\r]/.test(s)) return s;
    if(/^-?[\d.,\s]+$/.test(s)) return s;             /* düz negatif sayı — formül değil */
    return "'" + s;
  }

  /* ===================================================================
     0. BİÇİMLENDİRME
     =================================================================== */
  var AY = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  var AY_UZUN = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  var GUN = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

  var Fmt = {
    date:function(iso){
      if(!iso) return '—';
      var p = String(iso).slice(0,10).split('-');
      if(p.length !== 3) return iso;
      return p[2] + '.' + p[1] + '.' + p[0];
    },
    dateShort:function(iso){
      if(!iso) return '—';
      var p = String(iso).slice(0,10).split('-');
      if(p.length !== 3) return iso;
      return parseInt(p[2],10) + ' ' + AY[parseInt(p[1],10) - 1];
    },
    dateLong:function(iso){
      if(!iso) return '—';
      var d = new Date(iso + 'T00:00:00');
      return d.getDate() + ' ' + AY_UZUN[d.getMonth()] + ' ' + d.getFullYear() + ', ' + GUN[d.getDay()];
    },
    dt:function(iso){
      if(!iso) return '—';
      var s = String(iso);
      var d = s.slice(0,10), t = s.slice(11,16);
      return Fmt.date(d) + (t ? ' · ' + t : '');
    },
    num:function(n, dec){
      if(n == null || n === '') return '—';
      return Number(n).toLocaleString('tr-TR', { minimumFractionDigits:dec || 0, maximumFractionDigits:dec == null ? 0 : dec });
    },
    money:function(n, cur){
      if(n == null || n === '') return '—';
      var s = Number(n).toLocaleString('tr-TR', { maximumFractionDigits:0 });
      var c = cur || '₺';
      return c === '₺' ? '₺' + s : s + ' ' + c;
    },
    moneyK:function(n){
      if(n == null) return '—';
      var a = Math.abs(n);
      if(a >= 1000000) return '₺' + (n / 1000000).toLocaleString('tr-TR', { maximumFractionDigits:1 }) + 'M';
      if(a >= 1000) return '₺' + (n / 1000).toLocaleString('tr-TR', { maximumFractionDigits:0 }) + 'B';
      return '₺' + Fmt.num(n);
    },
    pct:function(n){ return (n == null ? '—' : Fmt.num(n) + '%'); },
    hours:function(h){
      if(h == null) return '—';
      var t = Math.round(h * 10) / 10;
      return Fmt.num(t, t % 1 ? 1 : 0) + ' sa';
    },
    /* Bugüne göre gün farkı — mock veri sabit tarih ekseni kullanır */
    days:function(iso, today){
      if(!iso) return null;
      var t = today || (window.DB && DB.today) || '2026-08-03';
      var a = new Date(String(iso).slice(0,10) + 'T00:00:00');
      var b = new Date(t + 'T00:00:00');
      return Math.round((a - b) / 86400000);
    },
    rel:function(iso){
      var d = Fmt.days(iso);
      if(d == null) return '—';
      if(d === 0) return 'bugün';
      if(d === 1) return 'yarın';
      if(d === -1) return 'dün';
      if(d < 0) return (-d) + ' gün gecikti';
      return d + ' gün kaldı';
    },
    initials:function(ad){
      if(!ad) return '—';
      var p = String(ad).trim().split(/\s+/);
      return ((p[0] || '')[0] || '') + ((p[p.length - 1] || '')[0] || '');
    }
  };
  GV.fmt = Fmt;

  /* ===================================================================
     1. DURUM SÖZLÜKLERİ (semantik ton eşlemesi)
     =================================================================== */
  var TONE = {
    /* teslim müşteri onayı — DB.deliveries[].musteriOnay */
    'Revizyon istendi':'warn',
    /* lead sıcaklığı — DB.leads[].sicaklik (tek eksende geçer, çakışma yok) */
    'Sıcak':'danger', 'Ilık':'warn', 'Soğuk':'info',
    /* ön analiz durumu — DB.analyses[].durum */
    'Hazırlanıyor':'accent',
    /* değişiklik talebi — DB.changeRequests[].durum */
    'Değerlendiriliyor':'accent',
    /* test türleri — DB.tests[].tur (app-proje-test.html) */
    'Regresyon':'info', 'Fonksiyonel':'accent', 'Performans':'purple',
    'Duman':'warn', 'Kabul':'ok',
    /* görev durumları — REVİZE 01: sözlük 19'dan 10'a indi.
       Çıkan yedi anahtar buradan da alındı; ÜÇÜ KALDI çünkü BAŞKA modüller
       kullanıyor: `Taslak` teklif ve satın almada, `Planlandı` taksit · sprint ·
       teslim · eğitimde, `Müşteri bekleniyor` destek talebinde. Bu harita
       modüller arası düz bir isim alanıdır — bir değeri silerken onu kullanan
       her koleksiyon aranır (ölçüldü, `assets/data/*.js`). */
    'Havuzda':'info', 'Atandı':'info', 'Devam ediyor':'accent', 'Kontrolde':'purple',
    'Revizede':'warn', 'Onay bekliyor':'purple', 'Tamamlandı':'ok',
    'Engellendi':'danger', 'İptal edildi':'neutral', 'Arşivlendi':'neutral',
    /* başka modüllerin de kullandığı ortak durum adları.
       `Revize bekliyor` görev sözlüğünden çıktı ama **haftalık timesheet**
       reddedildiğinde hâlâ bu değere düşüyor (`app-zaman-onay.html`) — görev
       ekseninden sildiğimde o rozet griye düşmüştü. Ad ortak, eksen ayrı. */
    'Taslak':'neutral', 'Planlandı':'info', 'Müşteri bekleniyor':'warn',
    'Revize bekliyor':'warn',
    /* satış aşamaları — §8.2 (15 aşama) */
    'Yeni talep':'info', 'İlk iletişim':'info', 'Ön görüşme':'info', 'İhtiyaç analizi':'accent',
    'Teknik değerlendirme':'accent', 'Ön analiz hazırlanıyor':'accent', 'Fiyatlandırma':'purple',
    'Teklif hazırlanıyor':'purple', 'Teklif iletildi':'purple', 'Müşteri değerlendirmesinde':'warn',
    'Revize teklif':'warn', 'Sözleşme aşaması':'ok', 'Kazanıldı':'ok', 'Kaybedildi':'danger',
    'Beklemeye alındı':'neutral',
    /* genel */
    'Aktif':'ok', 'Pasif':'neutral', 'Riskli':'danger', 'Potansiyel':'info', 'Arşiv':'neutral',
    'Onaylandı':'ok', 'Reddedildi':'danger', 'Bekliyor':'warn', 'Kısmi onay':'warn',
    'Açık':'info', 'Kapandı':'ok', 'Çözüldü':'ok', 'Yeni':'info',
    /* destek talebi ekseni (REVİZE 09) — üç YENİ ad. `Açık` · `Kapandı` ·
       `Devam ediyor` SİLİNMEDİ: hata, sprint, karar ve görev eksenlerinde
       yaşamayı sürdürüyorlar (L-33). `Atandı` görev ekseninden zaten var. */
    'Çalışılıyor':'accent', 'Kapatıldı':'ok', 'Yeniden Açıldı':'warn',
    /* proje DURUM ekseni (REVİZE 05) — `Teslim` çıktı, yerine `Teslim Sürecinde`
       ve `Tamamlandı` geldi. `Planlama` · `Geliştirme` · `Test` ADI KALIYOR
       çünkü `DB.projectModules[].durum` onları kullanmayı sürdürüyor: bir tonu
       silmeden önce o adı kullanan HER koleksiyon aranır (L-33 · R01'de
       `Revize bekliyor` tam bu yüzden geri konmuştu). `Aktif` · `Tamamlandı` ·
       `İptal` zaten yukarıda genel eksende tanımlı. */
    'Planlama':'info', 'Geliştirme':'accent', 'Test':'purple', 'Askıda':'warn',
    'Kontrol / Test':'purple', 'Teslim Sürecinde':'info', 'İptal Edildi':'neutral',
    /* CLOUD TURU — şartnameye hizalanan yeni durum adları. Eski adlar
       SİLİNMEDİ (L-33): `Teslim Sürecinde` ve `Kontrol / Test` başka
       koleksiyonlarda ve geçmiş aktivite kayıtlarında yaşamayı sürdürüyor. */
    'Plan':'neutral', 'Başlatma Onayı':'warn', 'Beklemede':'warn', 'Test/Kabul':'purple',
    'Kapanış':'info', 'Arşivlendi':'neutral',
    'İç İnceleme':'warn', 'Müşteri İncelemesi':'warn', 'İmza':'purple', 'Askıda':'warn',
    'Yenileme/Zeyil':'info', 'Feshedildi':'danger',
    'İç Onay':'warn', 'Gönderildi':'purple', 'Müzakere/Revizyon':'warn', 'Süresi Doldu':'neutral',
    'Teknik İnceleme':'warn', 'İade/Revizyon':'warn',
    'Triage':'warn', 'Düzeltildi':'ok', 'Yeniden Test':'purple', 'Mükerrer':'neutral',
    'Müşteri Onayı':'warn', 'Kapandı':'ok',
    'Onaya Gönderildi':'warn', 'İnceleme':'warn', 'RFQ/Satın Alma':'info', 'Sipariş':'info',
    'Kısmi Teslim':'warn', 'Tam Teslim':'ok',
    'İç Kontrol':'warn', 'Müşteriye Gönderildi':'purple', 'Kabul':'ok', 'Kısmi Kabul':'warn',
    'Geri Çekildi':'neutral', 'Etki Analizi':'warn', 'Ticari Onay':'warn', 'Uygulama':'accent',
    'Ek Bilgi/Revizyon':'warn', 'Göreve Dönüştürüldü':'ok',
    'Vadesi Geçti':'danger', 'Kısmi Ödendi':'warn',
    'Engellendi':'danger', 'Koşulmadı':'neutral',
    'Gecikti':'danger', 'Yaklaşıyor':'warn', 'Zamanında':'ok', 'Tamam':'ok',
    'Ödendi':'ok', 'Kısmi':'warn', 'Ödenmedi':'danger', 'İletildi':'purple',
    'Serviste':'warn', 'Tahsisli':'info', 'Ortak kullanım':'accent', 'Kiralık':'info',
    'Zimmetli':'info', 'Depoda':'neutral', 'Hurda':'neutral', 'Onarımda':'warn',
    /* 'Onay bekliyor' yukarıda (görev durumları) tanımlı — satın alma ekseninde de aynı
       anlamı taşır, tek ton kullanılır. Sonunda boşluklu ikinci bir anahtar vardı, hiç
       eşleşmiyordu; silindi. Farklı vurgu gerekiyorsa GV.badge(v,'is-warn') ile açık ton geçilir. */
    'Sipariş verildi':'info', 'Teslim alındı':'ok', 'İptal':'neutral',
    /* proje sağlığı — §11 */
    'İyi':'ok', 'Dikkat':'warn', 'Kritik':'danger', 'Sağlıklı':'ok',
    /* finans */
    'Yenilenecek':'warn', 'Süresi doldu':'danger', 'Yenilendi':'ok', 'Faturalandı':'info',
    'Tahsil edildi':'ok', 'Kısmi tahsilat':'warn', 'Vadesi yaklaşıyor':'warn',
    /* doküman / sözleşme */
    'Geçerli':'ok', 'Yürürlükte':'ok', 'Feshedildi':'danger', 'İmza bekliyor':'purple',
    /* destek ve bakım — §18 */
    'Yanıtlandı':'ok', 'Yanıt bekliyor':'warn', 'Risk altında':'warn', 'İhlal edildi':'danger',
    'Tutturuldu':'ok', 'Aşıldı':'danger', 'Sona erdi':'neutral', 'Yenilemesi yaklaşan':'warn',
    'Çözüm bekliyor':'warn',
    /* NPS grupları — DB.surveys[].tavsiye kırılımı (9-10 / 7-8 / 0-6) */
    'Destekleyici':'ok', 'Nötr':'warn', 'Kötüleyici':'danger',
    /* filo — muayene sonucu ve poliçe yenileme (DB.inspections, DB.policies) */
    'Geçti':'ok', 'Kaldı':'danger', 'Teklif alındı':'info', 'Sözleşmeye dahil':'neutral',
    /* zimmet (DB.assignments[].durum) */
    'İade edildi':'neutral',
    /* satın alma — teklif değerlendirmesi ve teslim (DB.supplierQuotes, DB.orders) */
    'Teknik uygun':'ok', 'Teknik uygun değil':'danger',
    'Tercih edildi':'ok', 'Tercih bekliyor':'warn', 'Teslim bekleniyor':'warn',
    /* teslim kontrolü üç değerlidir (UID-24): listede 'Eksik' ve 'İade' aynı
       "Kısmi" etiketine düşürülüyordu — oysa 'İade' seçilince sipariş İPTAL'e
       çekiliyor. Kullanıcı iade edilmiş siparişi eksik teslimattan ayıramıyordu. */
    'Tam':'ok', 'Eksik':'warn', 'İade':'danger',
    /* entegrasyon / sistem */
    /* 'Planlandı' görev durumlarında zaten tanımlı (info), tekrar yazılmaz */
    'Bağlı':'ok', 'Bağlı değil':'neutral', 'Hata':'danger', 'Senkronda':'accent'
  };

  function tone(v){ return TONE[v] || 'neutral'; }
  GV.tone = tone;

  /* extra içinde açık bir is-<ton> verilirse sözlükten türetilen ton yerine O kullanılır.
     (CSS özgüllük yarışına girmemek için — lessons L-01) */
  GV.badge = function(v, extra){
    if(v == null || v === '') return '<span class="u-faint">—</span>';
    var forced = extra && /(^|\s)is-[a-z]+/.exec(extra);
    var cls = forced ? extra.trim() : 'is-' + tone(v) + (extra ? ' ' + extra : '');
    return '<span class="badge ' + cls + '">' + esc(v) + '</span>';
  };

  GV.pri = function(v){
    if(!v) return '<span class="u-faint">—</span>';
    /* Global regex şart: 'düşük' iki 'ü' içerir, tekil replace 'dusük' üretip
       CSS'teki .pri.is-dusuk ile eşleşmiyordu (öncelik rozeti renksiz kalıyordu). */
    var k = String(v).toLowerCase().replace(/ı/g,'i').replace(/ü/g,'u').replace(/ö/g,'o')
                     .replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g')
                     .replace(/\s+/g,'-');   /* 'Çok yüksek' → tek sınıf: is-cok-yuksek */
    return '<span class="pri is-' + k + '">' + esc(v) + '</span>';
  };

  GV.user = function(kod, opt){
    opt = opt || {};
    var e = (window.DB && DB.emp) ? DB.emp(kod) : null;
    var ad = e ? e.ad : (opt.ad || kod || '—');
    var ini = e ? e.ini : Fmt.initials(ad);
    if(!kod && !opt.ad) return '<span class="u-faint">Atanmamış</span>';
    return '<span class="gv-user">' +
      '<span class="gv-user-ava' + (opt.sm ? ' is-sm' : '') + '">' + esc(ini) + '</span>' +
      (opt.nameOnly === false ? '' : '<span class="gv-user-name">' + esc(ad) + '</span>') +
      '</span>';
  };

  GV.dateCell = function(iso, opt){
    opt = opt || {};
    if(!iso) return '<span class="u-faint">—</span>';
    var d = Fmt.days(iso);
    var cls = '';
    if(opt.done) cls = 'is-done';
    else if(d < 0) cls = 'is-late';
    else if(d <= 3) cls = 'is-soon';
    return '<span class="cell-date ' + cls + '">' + Fmt.dateShort(iso) + '</span>';
  };

  GV.progress = function(v, opt){
    opt = opt || {};
    var t = opt.tone || (v >= 100 ? 'ok' : v < 35 ? 'danger' : v < 70 ? 'warn' : '');
    return '<span class="gv-progress-row">' +
      '<span class="gv-progress' + (t ? ' is-' + t : '') + '"><span style="width:' + Math.max(0, Math.min(100, v || 0)) + '%"></span></span>' +
      '<span class="gv-progress-val">' + (v == null ? '—' : v + '%') + '</span></span>';
  };

  /* ===================================================================
     2. TOAST / MODAL / CONFIRM / DRAWER
     =================================================================== */
  function toastHost(){
    var h = document.getElementById('gvToasts');
    if(!h){
      h = document.createElement('div');
      h.id = 'gvToasts'; h.className = 'gv-toasts';
      h.setAttribute('role','status'); h.setAttribute('aria-live','polite');
      document.body.appendChild(h);
    }
    return h;
  }

  GV.toast = function(text, kind, ms){
    var t = kind || 'ok';
    var icons = { ok:'i-check-circle', danger:'i-x-circle', warn:'i-alert', info:'i-info' };
    var el = document.createElement('div');
    el.className = 'gv-toast is-' + t;
    el.innerHTML = ico(icons[t] || 'i-info') + '<span>' + esc(text) + '</span>' +
                   '<button type="button" aria-label="Kapat">' + ico('i-x','ic-sm') + '</button>';
    toastHost().appendChild(el);
    var kill = function(){ el.style.opacity = '0'; setTimeout(function(){ el.remove(); }, 220); };
    el.querySelector('button').addEventListener('click', kill);
    setTimeout(kill, ms || 3600);
  };

  var lastFocus = null;

  function trapTab(e, container){
    if(e.key !== 'Tab') return;
    var f = container.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
    if(!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }

  /* Modal — .gv-page İÇİNE basılmaz (stacking context kuralı) */
  GV.modal = function(cfg){
    cfg = cfg || {};
    lastFocus = document.activeElement;
    var scrim = document.createElement('div');
    scrim.className = 'gv-scrim';
    var acts = (cfg.actions || []).map(function(a, i){
      return '<button type="button" class="btn ' + (a.cls || 'btn-line') + '" data-act="' + i + '">' +
             (a.icon ? ico(a.icon) + ' ' : '') + esc(a.label) + '</button>';
    }).join('');

    scrim.innerHTML =
      '<div class="gv-modal' + (cfg.tone ? ' is-' + cfg.tone : '') + (cfg.size ? ' is-' + cfg.size : '') +
      '" role="dialog" aria-modal="true" aria-labelledby="gvModalTitle">' +
        '<div class="gv-modal-head">' +
          (cfg.icon ? '<div class="gv-modal-ico">' + ico(cfg.icon, 'ic-lg') + '</div>' : '') +
          '<div><h2 id="gvModalTitle">' + esc(cfg.title || '') + '</h2>' +
          (cfg.text ? '<p>' + esc(cfg.text) + '</p>' : '') + '</div>' +
          '<button type="button" class="ia gv-modal-close" data-close aria-label="Kapat">' + ico('i-x','ic-sm') + '</button>' +
        '</div>' +
        (cfg.body ? '<div class="gv-modal-body">' + cfg.body + '</div>' : '') +
        (acts ? '<div class="gv-modal-foot">' + acts + '</div>' : '') +
      '</div>';

    document.body.appendChild(scrim);
    requestAnimationFrame(function(){ scrim.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';

    function close(){
      scrim.classList.remove('is-open');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      setTimeout(function(){ scrim.remove(); if(lastFocus) lastFocus.focus(); }, 220);
    }
    function onKey(e){
      if(e.key === 'Escape') close();
      trapTab(e, scrim);
    }
    document.addEventListener('keydown', onKey);
    scrim.addEventListener('click', function(e){
      if(e.target === scrim || e.target.closest('[data-close]')) return close();
      var b = e.target.closest('[data-act]');
      if(b){
        var a = cfg.actions[+b.dataset.act];
        if(a.onClick && a.onClick(close, scrim) === false) return;
        if(a.close !== false) close();
      }
    });
    var focusEl = scrim.querySelector('.btn-acc, .btn-danger, input, select, textarea, button');
    if(focusEl) focusEl.focus();
    /* SAHTE BUTON YASAĞI OVERLAY İÇİNDE DE GEÇERLİ. Kabuğun WIP gözlemcisi
       `.gv-main`i izliyor (shell.js:794) ama modal/çekmece `document.body`ye
       basılıyor — yani pencere içindeki bağlantılar kilitlenmiyordu ve
       ekranlar `GV.markWip(res.el)`i elle çağırmak zorunda kalıyordu.
       Kural bileşende olmalı; çağıranın hatırlaması gereken bir kural,
       er geç unutulan kuraldır. */
    if(GV.markWip) GV.markWip(scrim);
    /* GV.refresh() açık overlay'i kapatabilsin diye kapatıcıyı düğüme asıyoruz. */
    /* L-18 — overlay üreten bileşen kapatıcısını DÜĞÜME asar; `GV.refresh()`
       dışarıdan kapatabilsin diye. Scrim'e asılıydı, modal kutusuna değildi. */
    scrim.__gvClose = close;
    var kutu = scrim.querySelector('.gv-modal'); if(kutu) kutu.__gvClose = close;
    return { close:close, el:scrim };
  };

  GV.confirm = function(cfg){
    return new Promise(function(resolve){
      GV.modal({
        title:cfg.title || 'Emin misiniz?',
        text:cfg.text || '',
        tone:cfg.tone || 'warn',
        size:'sm',
        icon:cfg.tone === 'danger' ? 'i-alert' : 'i-alert-circle',
        body:cfg.body,
        actions:[
          { label:cfg.cancelLabel || 'Vazgeç', cls:'btn-line', onClick:function(){ resolve(false); } },
          { label:cfg.okLabel || 'Onayla', cls:cfg.tone === 'danger' ? 'btn-danger' : 'btn-acc',
            onClick:function(){ resolve(true); } }
        ]
      });
    });
  };

  GV.result = function(cfg){
    return GV.modal({
      title:cfg.title, text:cfg.text, tone:cfg.tone || 'ok', size:'sm',
      icon:cfg.tone === 'danger' ? 'i-x-circle' : cfg.tone === 'warn' ? 'i-alert' : 'i-check-circle',
      body:cfg.body,
      actions:cfg.actions || [{ label:'Tamam', cls:'btn-acc' }]
    });
  };

  /* ===================================================================
     ORTAK EYLEM PENCERESİ — şartname §6.2 (CLOUD TURU)
     -------------------------------------------------------------------
     Ölçülen kusur: sekiz eylemin (Onayla · Reddet · İade Et · Revizyon İste ·
     İptal Et · Geri Çek · Devret · Yeniden Aç) her biri HER SAYFADA sıfırdan
     `GV.modal` ile kuruluyordu — `app-izin-detay`, `app-panel-onaylar`,
     `app-proje-degisiklik-detay`, `app-zaman-onay` dördü de ayrı koddu.
     Neden kodu sözlüğü, ek dosya, sonraki onaycı, etkilenen kayıt özeti ve
     audit bağlantısı hiçbirinde yoktu.

     `GV.action(cfg)` şartname [6.2.2]–[6.2.8]'in yedi bileşenini tek yerde
     toplar. Geçişi KENDİ YÜRÜTMEZ; `cfg.run(veri)` çağırır ve sonucu basar —
     böylece motor (`GV.flow` · `GV.approval` · `GV.fin`) tek mutasyon noktası
     olmayı sürdürür.

     cfg = {
       eylem      : 'Onayla' | 'Reddet' | …        (başlık ve ton buradan)
       kayit      : { kod, baslik }                 (neyin üzerinde çalışıyoruz)
       sonuc      : 'Bu kayıt "Onaylandı" durumuna geçecek.'   [6.2.2]
       gerekce    : true → neden kodu + açıklama ZORUNLU        [6.2.3]
       nedenTuru  : 'ret' | 'iade' | 'revizyon' | 'iptal' | 'geri' | 'istisna'
       ek         : true → dosya/kanıt alanı                    [6.2.4]
       onaycilar  : [{deger, ad}] → sonraki onaycı/delege seçimi [6.2.5]
       etkilenen  : ['SZL-2026-004 zeyil taslağı', …]           [6.2.6]
       geriDonusYok: true → geri döndürülemez uyarısı           [6.2.7]
       run(veri)  : { ok:bool, mesaj, auditKod }                 [6.2.8]
     }
     =================================================================== */
  var EYLEM_TON = {
    'Onayla':'ok', 'Reddet':'danger', 'İade Et':'warn', 'Revizyon İste':'warn',
    'İptal Et':'danger', 'Geri Çek':'warn', 'Devret':'accent', 'Yeniden Aç':'accent'
  };
  /* ⚠️ Bu harita SPRITE'LA HİZALI OLMAK ZORUNDA. Üç ad 113 sembollük
     sprite'ta hiç yoktu (`i-corner-up-left` · `i-rotate` · geri düşüş
     `i-help`) ve sonuç sessizdi: `<use href="#i-help">` hedefi bulamayınca
     hata vermez, BOŞLUK çizer. Üç ekran birden bunu bağımsız olarak bildirdi
     ve üçü de sözlük dışı bir `eylem` adı kullanmaktan kaçındı — yani kusur
     ekranların dilini daraltıyordu. Adlar sprite'ta var olanlarla eşlendi. */
  var EYLEM_IKON = {
    'Onayla':'i-check-circle', 'Reddet':'i-x-circle', 'İade Et':'i-refresh',
    'Revizyon İste':'i-refresh', 'İptal Et':'i-x-circle', 'Geri Çek':'i-arrow-left',
    'Devret':'i-users', 'Yeniden Aç':'i-refresh'
  };

  GV.action = function(cfg){
    cfg = cfg || {};
    var eylem = cfg.eylem || 'İşlem';
    var ton   = cfg.tone || EYLEM_TON[eylem] || 'accent';
    var kayit = cfg.kayit || {};
    var DBref = window.DB || {};
    var kodlar = (DBref.reasonCodes || []).filter(function(r){
      return !cfg.nedenTuru || (r.tur || []).indexOf(cfg.nedenTuru) !== -1; });
    /* Sözlükte bu türe uygun kod yoksa TÜMÜ basılır — boş select, kullanıcıyı
       zorunlu bir alanı dolduramaz hâlde bırakırdı. */
    if(!kodlar.length) kodlar = DBref.reasonCodes || [];

    var g = [];
    if(cfg.sonuc)
      g.push('<p class="u-sm u-muted" style="margin:0 0 12px">' + esc(cfg.sonuc) + '</p>');

    /* Etkilenen kayıt özeti ortak `GV.notice` diliyle basılır — bu pencere
       için yeni bir uyarı kutusu sınıfı icat edilmez. */
    if(cfg.etkilenen && cfg.etkilenen.length)
      g.push(GV.notice({ tone:'info', icon:'i-link', title:'Bu işlemden etkilenecek kayıtlar',
                         text:cfg.etkilenen.join(' · ') }));

    if(cfg.gerekce)
      g.push('<div class="field"><label for="gvaKod">Neden kodu <span class="req">*</span></label>' +
             '<select id="gvaKod"><option value="">Seçiniz…</option>' +
             kodlar.map(function(r){ return '<option value="' + esc(r.kod) + '">' + esc(r.ad) + '</option>'; }).join('') +
             '</select></div>');

    g.push('<div class="field"><label for="gvaNot">Açıklama' +
           (cfg.gerekce ? ' <span class="req">*</span>' : '') + '</label>' +
           '<textarea id="gvaNot" rows="3" placeholder="' +
           (cfg.gerekce ? 'Kararın gerekçesi kayda ve denetim izine geçer.' : 'İsteğe bağlı not.') +
           '"></textarea></div>');

    if(cfg.onaycilar && cfg.onaycilar.length)
      g.push('<div class="field"><label for="gvaKisi">Sonraki onaycı / delege</label>' +
             '<select id="gvaKisi"><option value="">Sıradaki makam (varsayılan)</option>' +
             cfg.onaycilar.map(function(o){
               return '<option value="' + esc(o.deger) + '">' + esc(o.ad) + '</option>'; }).join('') +
             '</select></div>');

    if(cfg.ek)
      g.push('<div class="field"><label for="gvaEk">Ek dosya / kanıt</label>' +
             '<input type="file" id="gvaEk" class="inp"></div>');

    if(cfg.geriDonusYok)
      g.push(GV.notice({ tone:'danger', icon:'i-alert', title:'Bu işlem geri alınamaz',
                         text:'Devam etmeden önce özeti kontrol edin.' }));

    return GV.modal({
      title:eylem + (kayit.kod ? ' — ' + kayit.kod : ''),
      text:kayit.baslik || '',
      icon:EYLEM_IKON[eylem] || 'i-info',
      tone:ton, size:'sm', body:g.join(''),
      actions:[
        { label:'Vazgeç', cls:'btn-line' },
        { label:eylem, cls:ton === 'danger' ? 'btn-danger' : ton === 'ok' ? 'btn-ok' : 'btn-acc',
          onClick:function(close, el){
            var neden = cfg.gerekce ? (el.querySelector('#gvaKod') || {}).value : null;
            var not   = ((el.querySelector('#gvaNot') || {}).value || '').trim();
            var kisi  = (el.querySelector('#gvaKisi') || {}).value || null;
            var dosya = cfg.ek ? ((el.querySelector('#gvaEk') || {}).files || [])[0] : null;
            if(cfg.gerekce && !neden){ GV.toast('Neden kodu zorunludur', 'danger'); return false; }
            if(cfg.gerekce && !not){ GV.toast('Açıklama zorunludur', 'danger'); return false; }
            if(typeof cfg.run !== 'function'){
              /* L-23 — çağıranın vermediği yordamın yerine BAŞARI VARSAYILMAZ */
              GV.toast('Bu eylem henüz bir yordama bağlı değil.', 'warn'); return false;
            }
            var r = cfg.run({ neden:neden, not:not, kisi:kisi, dosya:dosya }) || {};
            if(r.ok === false){ GV.toast(r.mesaj || 'İşlem uygulanamadı', 'danger'); return false; }
            /* [6.2.8] — tekil başarı ekranı + audit bağlantısı */
            if(r.mesaj) GV.toast(r.mesaj, 'ok');
            if(r.auditKod || cfg.auditHref)
              GV.toast('Denetim izine yazıldı' + (r.auditKod ? ' · ' + r.auditKod : ''), 'info');
          } }
      ]
    });
  };

  /* `GV.flow.gec` sonucunu kullanıcı diline çeviren ortak yardımcı.
     Dört ekranda ayrı ayrı yazılmıştı; sözleşme tek olduğuna göre çeviri de
     tek olmalı. */
  GV.flowHata = function(r){
    if(!r || r.ok) return '';
    if(r.why === 'yetki')
      return 'Bu geçişi yapma yetkiniz yok' + (r.roller && r.roller.length ? ' — gereken: ' + r.roller.join(', ') : '') + '.';
    if(r.why === 'zorunlu')
      return 'Önce şu alanlar doldurulmalı: ' + (r.eksik || []).join(', ') + '.';
    if(r.why === 'gerekce') return r.mesaj || 'Neden kodu ve açıklama zorunludur.';
    if(r.why === 'kapi')    return r.mesaj || 'Bu geçiş bir ön koşul nedeniyle engellendi.';
    /* `kilit` — kaydın TAMAMI donmuş (ör. revize edilmiş teklif sürümü).
       `kapi`dan farkı: tek bir geçiş değil, hiçbir geçiş mümkün değil. */
    if(r.why === 'kilit')   return r.mesaj || 'Bu kayıt kilitli; üzerinde işlem yapılamaz.';
    if(r.why === 'tahsil' || r.why === 'tahsis' || r.why === 'kaynak') return r.mesaj || r.why;
    return r.mesaj || r.why || 'İşlem uygulanamadı.';
  };

  GV.drawer = function(cfg){
    cfg = cfg || {};
    lastFocus = document.activeElement;
    var scrim = document.createElement('div');
    scrim.className = 'gv-overlay';
    scrim.style.opacity = '1'; scrim.style.visibility = 'visible';

    var d = document.createElement('aside');
    d.className = 'gv-drawer' + (cfg.side === 'left' ? ' is-left' : '');
    d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true');
    d.innerHTML =
      '<div class="gv-drawer-head">' +
        '<h2>' + esc(cfg.title || '') + '</h2>' +
        '<button type="button" class="ia" data-close aria-label="Kapat">' + ico('i-x','ic-sm') + '</button>' +
      '</div>' +
      '<div class="gv-drawer-body">' + (cfg.body || '') + '</div>' +
      (cfg.actions ? '<div class="gv-drawer-foot">' + cfg.actions.map(function(a,i){
        return '<button type="button" class="btn ' + (a.cls || 'btn-line') + '" data-act="' + i + '">' + esc(a.label) + '</button>';
      }).join('') + '</div>' : '');

    document.body.appendChild(scrim);
    document.body.appendChild(d);
    requestAnimationFrame(function(){ d.classList.add('is-open'); });
    /* `onMount(gövde, panel)` — panel DOM'a girdikten sonra çağrılır. Çağıran
       ekranın panelin içine dinleyici bağlaması için tek yol; eskiden panelin
       düğümüne dışarıdan erişilemiyordu ve ekranlar `setTimeout` ile arıyordu. */
    if(cfg.onMount) cfg.onMount(d.querySelector('.gv-drawer-body'), d);
    document.body.style.overflow = 'hidden';

    function close(){
      d.classList.remove('is-open');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      setTimeout(function(){ d.remove(); scrim.remove(); if(lastFocus) lastFocus.focus(); }, 320);
    }
    function onKey(e){ if(e.key === 'Escape') close(); trapTab(e, d); }
    document.addEventListener('keydown', onKey);
    scrim.addEventListener('click', close);
    d.addEventListener('click', function(e){
      if(e.target.closest('[data-close]')) return close();
      var b = e.target.closest('[data-act]');
      if(b){
        var a = cfg.actions[+b.dataset.act];
        if(a.onClick && a.onClick(close, d) === false) return;
        if(a.close !== false) close();
      }
    });
    if(cfg.onOpen) cfg.onOpen(d, close);
    if(GV.markWip) GV.markWip(d);          /* modal ile aynı gerekçe */
    /* GV.refresh() açık paneli kapatabilsin diye kapatıcıyı iki düğüme de asıyoruz;
       kapatma iki kez çağrılsa da zararsızdır (düğüm zaten sökülmüş olur). */
    d.__gvClose = close; scrim.__gvClose = close;
    return { close:close, el:d };
  };

  /* ===================================================================
     3. DURUM BLOKLARI
     =================================================================== */
  GV.empty = function(c){
    c = c || {};
    return '<div class="gv-state">' +
      '<div class="gv-state-ico">' + ico(c.icon || 'i-inbox','ic-xl') + '</div>' +
      '<h3>' + esc(c.title || 'Kayıt bulunamadı') + '</h3>' +
      '<p>' + esc(c.desc || 'Bu görünümde gösterilecek kayıt yok. Filtreleri değiştirebilir veya yeni kayıt ekleyebilirsiniz.') + '</p>' +
      (c.action ? '<div class="gv-state-acts">' + c.action + '</div>' : '') +
      '</div>';
  };

  /* KAYIT SAHİPLİĞİ KAPISI (REVİZE 13) — `GV.list` satır kapsamının DETAY
     ekranındaki karşılığı. Liste kapsamlıyken detayın adres çubuğundan ham
     `?id=` okuması, kapsamın açık bıraktığı arka kapıdır: müşteri listede
     göremediği kaydı adresi yazarak açabiliyordu (ölçüldü: yabancı talebin
     başlığı, çözüm notu ve TÜM aktivite geçmişi basılıyordu).
     Kural ekranda değil burada durur ki 26 detay ekranı aynı cümleyi 26 kez
     yazmasın ve biri unutulduğunda sessizce açık kalmasın.
       GV.guardRecord({ mount, musteri, kod, eyebrow, title, geriHref, geriLabel })
         → true  : oturum bu kaydı görebilir (personel oturumu her zaman)
         → false : ekran yetkisiz durumunu BASTI, çağıran hemen `return` eder
     Yetkisiz ekran yabancı kayıttan HİÇBİR ŞEY yazmaz — ziyaretçinin kendi
     yazdığı kod dışında: hata mesajı da bir sızıntı yüzeyidir. */
  GV.guardRecord = function(c){
    c = c || {};
    var me = GV.session || {};
    if(!me.musteri) return true;                       /* personel oturumu */
    if(c.musteri && String(c.musteri) === String(me.musteri)) return true;
    var mount = typeof c.mount === 'string' ? document.querySelector(c.mount) : c.mount;
    if(GV.pageHead) GV.pageHead({
      eyebrow:c.eyebrow || '', title:c.title || 'Kayıt', sub:'Bu kayıt size ait değil',
      actions:c.geriHref ? [{ label:c.geriLabel || 'Listeye dön', icon:'i-arrow-left', href:c.geriHref }] : []
    });
    /* Kod YALNIZ ziyaretçinin kendi yazdığı adresten geldiyse yankılanır.
       Ekranın kendi varsayılanına (`DB.<koleksiyon>[0]`) düşmüş bir kodu
       basmak, yabancı bir kaydın numarasını sızdırmak olurdu. */
    var urlId = '';
    try{ urlId = new URLSearchParams(location.search).get('id') || ''; }catch(e){}
    var yankila = c.kod && String(c.kod) === String(urlId);
    if(mount) mount.innerHTML = '<div class="gv-card">' + GV.empty({
      icon:'i-lock', title:'Bu kaydı görüntüleme yetkiniz yok',
      desc:(yankila ? '“' + esc(c.kod) + '” kaydı ' : 'Açmaya çalıştığınız kayıt ') +
           esc(me.musteriAd || 'sizin firmanız') +
           ' adına açılmış bir kayıt değil. Yalnız kendi firmanıza ait kayıtları görüntüleyebilirsiniz.',
      action:c.geriHref
        ? '<a class="btn btn-acc" href="' + c.geriHref + '">' + esc(c.geriLabel || 'Listeye dön') + '</a>' : ''
    }) + '</div>';
    document.title = 'Yetkisiz erişim — GaviaWorks CRM';
    return false;
  };

  /* Satır içi bilgi/uyarı bloğu — salt-okunur uyarısı, eksik entegrasyon, kapsam notu.
     GV.notice({tone,title,text,icon,actions:[{label,href,cls}]}) → HTML */
  GV.notice = function(c){
    c = c || {};
    var icons = { ok:'i-check-circle', warn:'i-alert', danger:'i-x-circle', neutral:'i-info', info:'i-info' };
    var tone = c.tone || 'info';
    return '<div class="gv-notice' + (tone !== 'info' ? ' is-' + tone : '') + '" role="note">' +
      ico(c.icon || icons[tone] || 'i-info', 'ic-lg') +
      '<span class="gv-notice-body">' +
        (c.title ? '<span class="gv-notice-title">' + esc(c.title) + '</span>' : '') +
        (c.text ? '<span class="gv-notice-text">' + esc(c.text) + '</span>' : '') +
        (c.actions && c.actions.length
          ? '<span class="gv-notice-acts">' + c.actions.map(function(a){
              return '<a class="btn btn-sm ' + (a.cls || 'btn-line') + '" href="' + a.href + '">' + esc(a.label) + '</a>';
            }).join('') + '</span>'
          : '') +
      '</span></div>';
  };

  /* ⚠️ "Tekrar dene" düğmesi ÖLÜ BUTONDU. `data-retry` yalnız `GV.list`
     içinde bağlanıyor (`ui.js` wire); bileşen tek başına kullanıldığında —
     kayıt bulunamayan her detay ekranında — düğme basılıyor ama hiçbir şey
     yapmıyordu. Sahte buton yasağı bileşenin kendisi için de geçerlidir.
     Yeni sözleşme: `retry` verilirse düğme onu çağırır; verilmezse
     ÇAĞIRANIN kendi eylemi (`action`) basılır; ikisi de yoksa düğme HİÇ
     basılmaz. `GV.list` davranışı değişmez — o `data-retry`yi kendi bağlıyor
     ve `retry` göndermiyor, dolayısıyla eski yol olduğu gibi çalışır. */
  GV.errorState = function(c){
    c = c || {};
    var acts;
    if(c.action) acts = c.action;
    else if(c.retry === false) acts = '';
    else acts = '<button type="button" class="btn btn-line" data-retry>' +
                ico('i-refresh') + ' Tekrar dene</button>';
    var html = '<div class="gv-state is-danger">' +
      '<div class="gv-state-ico">' + ico('i-alert','ic-xl') + '</div>' +
      '<h3>' + esc(c.title || 'Veri yüklenemedi') + '</h3>' +
      '<p>' + esc(c.desc || 'Kayıtlar getirilirken bir sorun oluştu. Bağlantınızı kontrol edip tekrar deneyin.') + '</p>' +
      (acts ? '<div class="gv-state-acts">' + acts + '</div>' : '') + '</div>';
    /* Çağıran bir yordam verdiyse düğme DOM'a girdikten sonra bağlanır —
       bileşen HTML döndürdüğü için tek yol budur. */
    if(typeof c.retry === 'function'){
      setTimeout(function(){
        Array.prototype.forEach.call(document.querySelectorAll('[data-retry]'), function(b){
          if(b.__gvRetry) return;
          b.__gvRetry = true;
          b.addEventListener('click', function(){ c.retry(); });
        });
      }, 0);
    }
    return html;
  };

  GV.skeleton = function(type, n){
    var rows = '';
    var count = n || 6;
    if(type === 'card'){
      for(var i = 0; i < count; i++) rows += '<div class="sk sk-card"></div>';
      return '<div class="gv-cards">' + rows + '</div>';
    }
    for(var j = 0; j < count; j++){
      rows += '<div class="sk-row"><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div><div class="sk"></div></div>';
    }
    return '<div aria-busy="true" aria-label="Yükleniyor">' + rows + '</div>';
  };

  /* ===================================================================
     4. LİSTE BİLEŞENİ — PROMPT.md §6
     =================================================================== */
  function uniq(a){ return a.filter(function(v,i,s){ return v != null && v !== '' && s.indexOf(v) === i; }); }

  GV.list = function(cfg){
    var mount = typeof cfg.mount === 'string' ? document.querySelector(cfg.mount) : cfg.mount;
    /* UID-06 — sayfadaki liste örneği sayısı. Sayaç düğümü belge genelinde
       aranırken bu sayı 1 değilse arama yapılmaz (iki örnek birbirinin sayısını
       ezerdi). `GV.refresh()` mount'u tazelediği için sayı her çizimde yeniden
       ölçülür, birikmez. */
    if(!mount) return null;
    mount.setAttribute('data-gvlist', cfg.id || '');
    GV._listAdet = document.querySelectorAll('[data-gvlist]').length;

    var LS_COLS = 'gv.cols.' + (cfg.id || location.pathname);
    var LS_VIEWS = 'gv.views.' + (cfg.id || location.pathname);

    var state = {
      tab:cfg.tabs && cfg.tabs.length ? cfg.tabs[0].key : null,
      q:'', page:1, size:cfg.pageSize || 10,
      sort:cfg.defaultSort || null, dir:cfg.defaultDir || 'asc',
      filters:{}, archive:false, view:(cfg.views && cfg.views[0]) || 'table',
      selected:[], cols:null, loading:true, error:false,
      /* Takvim görünümünün gezilen ayı — referans DB.today, `new Date()` DEĞİL */
      calAy:String((typeof DB !== 'undefined' && DB.today) || '2026-01-01').slice(0,7)
    };

    /* ---- kolon durumu ---- */
    function loadCols(){
      var saved = null;
      try{ saved = JSON.parse(localStorage.getItem(LS_COLS) || 'null'); }catch(e){}
      var base = cfg.columns.map(function(c){ return { key:c.key, visible:c.visible !== false }; });
      if(saved && saved.length){
        var order = saved.map(function(s){ return s.key; });
        base.sort(function(a,b){ return order.indexOf(a.key) - order.indexOf(b.key); });
        base.forEach(function(c){
          var s = saved.filter(function(x){ return x.key === c.key; })[0];
          if(s) c.visible = s.visible;
        });
      }
      return base;
    }
    function saveCols(){ try{ localStorage.setItem(LS_COLS, JSON.stringify(state.cols)); }catch(e){} }
    state.cols = loadCols();

    function colDef(key){ return cfg.columns.filter(function(c){ return c.key === key; })[0]; }
    function visibleCols(){
      return state.cols.filter(function(c){ return c.visible; })
                       .map(function(c){ return colDef(c.key); })
                       .filter(Boolean);
    }

    /* ---- URL senkronu ---- */
    function readURL(){
      var q = new URLSearchParams(location.search);
      if(q.get('t')) state.tab = q.get('t');
      if(q.get('q')) state.q = q.get('q');
      if(q.get('p')) state.page = Math.max(1, parseInt(q.get('p'),10) || 1);
      if(q.get('s')){ state.sort = q.get('s'); state.dir = q.get('d') === 'desc' ? 'desc' : 'asc'; }
      if(q.get('v')) state.view = q.get('v');
      if(q.get('arsiv') === '1') state.archive = true;
      (cfg.filters || []).forEach(function(f){
        var v = q.get('f_' + f.key);
        if(v) state.filters[f.key] = f.type === 'multi' ? v.split('|') : v;
      });
    }
    function writeURL(){
      if(cfg.urlSync === false) return;
      var q = new URLSearchParams(location.search);
      ['t','q','p','s','d','v','arsiv'].forEach(function(k){ q.delete(k); });
      Array.from(q.keys()).forEach(function(k){ if(k.indexOf('f_') === 0) q.delete(k); });
      if(state.tab && cfg.tabs && state.tab !== cfg.tabs[0].key) q.set('t', state.tab);
      else if(state.tab && cfg.tabs) q.set('t', state.tab);
      if(state.q) q.set('q', state.q);
      if(state.page > 1) q.set('p', state.page);
      if(state.sort){ q.set('s', state.sort); q.set('d', state.dir); }
      if(state.view !== ((cfg.views && cfg.views[0]) || 'table')) q.set('v', state.view);
      if(state.archive) q.set('arsiv','1');
      Object.keys(state.filters).forEach(function(k){
        var v = state.filters[k];
        if(v == null || v === '' || (Array.isArray(v) && !v.length)) return;
        q.set('f_' + k, Array.isArray(v) ? v.join('|') : v);
      });
      var s = q.toString();
      history.replaceState({}, '', location.pathname + (s ? '?' + s : ''));
    }

    /* ---- veri hattı ---- */
    function source(){ return (typeof cfg.source === 'function' ? cfg.source() : cfg.source) || []; }

    /* UID-05 — SATIR KAPSAMI. `GV.perm.scope('gor')` `'tum'|'departman'|'proje'|'kendi'`
       döndürüyordu ama yalnız üç ekran okuyordu; liste ekranları kaynağın TAMAMINI
       basıyordu. Ölçülen örnek: `app-destek-paket` `musteri` rolüyle 6 müşterinin
       paketini birden gösteriyordu — maskeleme çalışıyor ama satır kapsamı yoktu.
       65 ekrana tek tek yazmak yanlış çözümdü; ekran yalnız hangi ALANIN hangi
       kapsama karşılık geldiğini bildirir, süzmeyi bileşen yapar:
           scopeField:{ kendi:'sorumlu', departman:'dep', musteri:'musteri' }
       Karşılaştırılan değer oturumdan gelir. `proje` kapsamı için oturumda bir
       proje listesi YOK — o kapsamda süzme yapılmaz ve bu **söylenir** (sessizce
       tam liste basmak, kapsam varmış gibi göstermekten iyidir; L-23). */
    function scopeBilgi(){ return kapsamNot; }
    var kapsamNot = '';
    function afterScope(rows){
      kapsamNot = '';
      if(!cfg.scopeField || !GV.perm || !GV.perm.scope) return rows;
      var k = GV.perm.scope('gor');
      if(!k || k === 'tum' || k === 'yok') return rows;
      var alan = cfg.scopeField[k];
      if(!alan){
        /* Eşlenmemiş kapsam SESSİZ geçmez (L-23): kullanıcı yetkisinin kısıtlı
           olduğunu bilir, listenin kısıtlanmadığını da bilmelidir. Eksik eşleme
           burada görünür olur — yazılmayan süzgeç saklanmaz. */
        var ad = k === 'proje' ? 'proje' : k === 'departman' ? 'departman'
               : k === 'musteri' ? 'müşteri' : k;
        kapsamNot = 'Kapsamınız ' + ad + ' bazlı, ancak bu ekranda ' + ad +
                    ' süzgeci tanımlı değil — tüm kayıtlar listeleniyor.';
        return rows;
      }
      var me = GV.session || {};
      var deger = k === 'kendi' ? me.emp : k === 'departman' ? me.dep : k === 'musteri' ? me.musteri : null;
      if(!deger){
        kapsamNot = 'Kapsam süzgeci uygulanamadı — oturumda karşılığı olan bir değer yok.';
        return rows;
      }
      /* Eşleme bir ALAN ADI ya da bir YORDAM olabilir (REVİZE 13). Yordam
         gerekiyor çünkü kapsam alanı kayıtta her zaman doğrudan yazılı değil:
         teslim kaydında müşteri yoktur, projesinde yazılıdır. Yordam kaydı alır,
         karşılaştırılacak değeri (ya da değer dizisini) döndürür. */
      var out = rows.filter(function(r){
        var v = typeof alan === 'function' ? alan(r) : r[alan];
        return Array.isArray(v) ? v.indexOf(deger) !== -1 : v === deger;
      });
      kapsamNot = k === 'kendi' ? 'Yalnız kendi kayıtlarınız gösteriliyor.'
                : k === 'departman' ? 'Yalnız departmanınızın kayıtları gösteriliyor.'
                : 'Yalnız size ait kayıtlar gösteriliyor.';
      return out;
    }

    function afterTab(rows){
      if(!state.tab || !cfg.tabs) return rows;
      var t = cfg.tabs.filter(function(x){ return x.key === state.tab; })[0];
      return t && t.filter ? rows.filter(t.filter) : rows;
    }
    function afterArchive(rows){
      if(cfg.archive === false) return rows;
      return rows.filter(function(r){
        var arch = r.arsiv === true || r.aktif === false || r.durum === 'Arşivlendi';
        return state.archive ? true : !arch;
      });
    }
    function afterSearch(rows){
      if(!state.q) return rows;
      var q = state.q.toLocaleLowerCase('tr');
      var fields = (cfg.search && cfg.search.fields) || Object.keys(rows[0] || {});
      /* search.extra(row) → aramaya dahil edilecek TÜRETİLMİŞ metin.
         Kayıtta kod tutulup ekranda ad gösterilen alanlar (kisi:'EMP-012' → "Serkan Yılmaz")
         ancak böyle aranabilir hâle gelir. */
      var extra = cfg.search && cfg.search.extra;
      return rows.filter(function(r){
        var hit = fields.some(function(f){
          var v = r[f];
          if(v == null) return false;
          if(Array.isArray(v)) v = v.join(' ');
          return String(v).toLocaleLowerCase('tr').indexOf(q) !== -1;
        });
        if(hit || !extra) return hit;
        var ex = extra(r);
        return ex != null && String(ex).toLocaleLowerCase('tr').indexOf(q) !== -1;
      });
    }
    function afterFilters(rows){
      var keys = Object.keys(state.filters);
      if(!keys.length) return rows;
      return rows.filter(function(r){
        return keys.every(function(k){
          var v = state.filters[k];
          if(v == null || v === '' || (Array.isArray(v) && !v.length)) return true;
          var f = (cfg.filters || []).filter(function(x){ return x.key === k; })[0];
          if(f && f.test) return f.test(r, v);
          var rv = r[k];
          if(Array.isArray(v)) return v.indexOf(String(rv)) !== -1;
          if(f && f.type === 'daterange'){
            var parts = String(v).split('~');
            var d = String(rv || '').slice(0,10);
            if(parts[0] && d < parts[0]) return false;
            if(parts[1] && d > parts[1]) return false;
            return true;
          }
          return String(rv) === String(v);
        });
      });
    }
    function afterSort(rows){
      if(!state.sort) return rows;
      var c = colDef(state.sort);
      var mul = state.dir === 'desc' ? -1 : 1;
      return rows.slice().sort(function(a,b){
        var av = c && c.sortValue ? c.sortValue(a) : a[state.sort];
        var bv = c && c.sortValue ? c.sortValue(b) : b[state.sort];
        if(av == null) return 1; if(bv == null) return -1;
        if(typeof av === 'number' && typeof bv === 'number') return (av - bv) * mul;
        return String(av).localeCompare(String(bv), 'tr') * mul;
      });
    }

    /* Kapsam süzgeci zincirin EN BAŞINDA — sekme sayaçları ve KPI'lar da kapsamlı
       kaynaktan hesaplansın; yoksa kullanıcı göremediği kayıtları sayıda görür. */
    function kaynak(){ return afterScope(source()); }
    function pipeline(){ return afterSort(afterFilters(afterSearch(afterArchive(afterTab(kaynak()))))); }
    function tabRows(t){ return afterFilters(afterSearch(afterArchive(t.filter ? kaynak().filter(t.filter) : kaynak()))); }

    /* ---- render parçaları ---- */
    function renderKpis(all){
      if(!cfg.kpis || !cfg.kpis.length) return '';
      var base = afterArchive(kaynak());
      return '<div class="kpi-grid">' + cfg.kpis.map(function(k){
        var gizli = kpiMasked(k);
        var val = gizli ? null : (k.calc ? k.calc(base, all) : 0);
        var inner =
          '<div class="kpi-ico">' + ico(k.icon || 'i-chart-bar','ic-lg') + '</div>' +
          '<div class="kpi-body"><div class="kpi-num' + (gizli ? ' is-masked' : '') + '">' +
            (gizli ? MASK : (k.format ? k.format(val) : Fmt.num(val))) + '</div>' +
          '<div class="kpi-lbl">' + esc(k.label) + '</div>' +
          (k.meta && !gizli ? '<div class="kpi-meta ' + (k.metaTone ? 'is-' + k.metaTone : '') + '">' + k.meta(base) + '</div>' : '') + '</div>';
        return k.href
          ? '<a class="kpi' + (k.tone ? ' is-' + k.tone : '') + '" href="' + k.href + '">' + inner + '</a>'
          : '<div class="kpi' + (k.tone ? ' is-' + k.tone : '') + '">' + inner + '</div>';
      }).join('') + '</div>';
    }

    function renderTabs(){
      if(!cfg.tabs || !cfg.tabs.length) return '';
      return '<div class="lh-tabs"><div class="chipbar-wrap">' +
        '<button type="button" class="cb-arrow cb-prev" aria-label="Sola kaydır" hidden>' + ico('i-chev-left','ic-sm') + '</button>' +
        '<div class="chipbar" role="tablist">' +
        cfg.tabs.map(function(t){
          var n = tabRows(t).length;
          return '<button type="button" class="chip" role="tab" data-tab="' + t.key + '"' +
                 ' aria-selected="' + (state.tab === t.key ? 'true' : 'false') + '">' +
                 (t.icon ? ico(t.icon,'ic-sm') : '') + esc(t.label) +
                 '<span class="chip-cnt">' + n + '</span></button>';
        }).join('') +
        '</div><button type="button" class="cb-arrow cb-next" aria-label="Sağa kaydır" hidden>' + ico('i-chev-right','ic-sm') + '</button>' +
        '</div></div>';
    }

    function renderAchips(){
      var keys = Object.keys(state.filters).filter(function(k){
        var v = state.filters[k];
        return v != null && v !== '' && !(Array.isArray(v) && !v.length);
      });
      if(!keys.length) return '<div class="lh-achips" hidden></div>';
      return '<div class="lh-achips">' + keys.map(function(k){
        var f = (cfg.filters || []).filter(function(x){ return x.key === k; })[0];
        var v = state.filters[k];
        /* seçenek etiketi varsa ham kod yerine etiket gösterilir (MUS-2026-011 → Anka Finans) */
        function optLabel(val){
          var opts = (f && f.options) || [];
          for(var i = 0; i < opts.length; i++){
            var o = opts[i];
            if(o && typeof o === 'object' && String(o.value) === String(val)) return o.label;
          }
          return val;
        }
        var txt = Array.isArray(v) ? v.map(optLabel).join(', ')
                : (f && f.type === 'daterange' ? String(v).split('~').map(Fmt.date).join(' – ') : optLabel(v));
        return '<span class="achip"><b>' + esc(f ? f.label : k) + ':</b> ' + esc(txt) +
               '<button type="button" data-rmfilter="' + k + '" aria-label="Filtreyi kaldır">' + ico('i-x','ic-sm') + '</button></span>';
      }).join('') +
      '<button type="button" class="btn btn-ghost btn-sm" data-clearfilters>' + ico('i-filter-x','ic-sm') + ' Filtreleri Temizle</button>' +
      '</div>';
    }

    function renderHead(){
      var acts = '';
      acts += '<button type="button" class="btn btn-line btn-sm" data-openfilters aria-label="Gelişmiş filtre">' +
              ico('i-sliders','ic-sm') + '<span class="u-desktop">Gelişmiş Filtre</span></button>';
      acts += '<button type="button" class="btn btn-line btn-sm" data-opencols aria-label="Kolonlar">' +
              ico('i-columns','ic-sm') + '<span class="u-desktop">Kolonlar</span></button>';
      if(cfg.archive !== false){
        acts += '<label class="lh-toggle"><input type="checkbox" data-archive' + (state.archive ? ' checked' : '') + '>' +
                ico('i-archive','ic-sm') + '<span class="u-desktop">Arşivlenenleri Göster</span></label>';
      }
      /* UID-25 — çıktı yetki kapısı BİLEŞENDE. `disaAktar` 27 rolün 14'ünde var;
         kapı ekran başına bırakıldığı için 73 raporda hiç kurulmamıştı ve 13 rol
         göremeyeceği bir butonu görüyordu. Yetkisizde şerit HİÇ basılmaz —
         "yetkin yok" durumunda gizlemek doğru davranıştır (UID-13 felsefesi;
         "bu sürümde yok" durumundan ayrılır). */
      if(cfg.export !== false && canExport()){
        acts += '<button type="button" class="btn btn-line btn-sm" data-export aria-label="Çıktı al">' +
                ico('i-download','ic-sm') + '<span class="u-desktop">Çıktı Al</span></button>';
      }
      if(cfg.views && cfg.views.length > 1){
        var vi = { table:'i-table', card:'i-grid', kanban:'i-kanban', calendar:'i-calendar' };
        var vl = { table:'Tablo', card:'Kart', kanban:'Kanban', calendar:'Takvim' };
        acts += '<span class="viewswitch">' + cfg.views.map(function(v){
          return '<button type="button" data-view="' + v + '" aria-pressed="' + (state.view === v ? 'true' : 'false') +
                 '" aria-label="' + (vl[v] || v) + ' görünümü">' +
                 ico(vi[v] || 'i-table','ic-sm') + '</button>';
        }).join('') + '</span>';
      }

      return '<div class="gv-listhead">' +
        '<div class="lh-row">' +
          '<div class="lh-search">' + ico('i-search','ic-sm') +
          '<input type="search" data-search value="' + esc(state.q) + '" placeholder="' +
          esc((cfg.search && cfg.search.placeholder) || 'Ara') + '" aria-label="Listede ara"></div>' +
          '<div class="lh-acts">' + acts + '</div>' +
        '</div>' +
        renderAchips() +
        renderTabs() +
      '</div>';
    }

    function renderTable(rows){
      var cols = visibleCols();
      var head = '<tr>';
      if(cfg.bulk) head += '<th class="col-check"><input type="checkbox" data-selectall aria-label="Tümünü seç"></th>';
      cols.forEach(function(c){
        var sortable = c.sortable !== false;
        var aria = state.sort === c.key ? ' aria-sort="' + (state.dir === 'asc' ? 'ascending' : 'descending') + '"' : '';
        /* Hizalama kolonun özelliğidir: `cellClass` başlığa DA basılır, yoksa
           `num`/`center` kolonlarında başlık solda, değer sağda/ortada kalır
           ([14.2.4]–[14.2.6]). Sıralanabilirlik ayrı bir sınıf, ikisi birlikte. */
        var thCls = [sortable ? 'is-sortable' : '', c.cellClass || ''].filter(Boolean).join(' ');
        head += '<th data-col="' + c.key + '"' + (thCls ? ' class="' + thCls + '"' : '') +
                (sortable ? ' data-sort="' + c.key + '"' : '') + aria +
                (c.width ? ' style="width:' + c.width + '"' : '') + '>' + esc(c.label) +
                (state.sort === c.key ? ico(state.dir === 'asc' ? 'i-chev-up' : 'i-chev-down') : '') + '</th>';
      });
      if(cfg.rowActions) head += '<th class="col-acts"><span class="gv-sr">İşlemler</span></th>';
      head += '</tr>';

      var body = rows.map(function(r, i){
        var cls = [];
        if(cfg.rowClass) cls.push(cfg.rowClass(r) || '');
        if(state.selected.indexOf(r[cfg.key]) !== -1) cls.push('is-selected');
        var tr = '<tr' + (cls.length ? ' class="' + cls.join(' ').trim() + '"' : '') + ' data-id="' + esc(r[cfg.key]) + '">';
        if(cfg.bulk) tr += '<td><input type="checkbox" data-rowcheck="' + esc(r[cfg.key]) + '"' +
                           (state.selected.indexOf(r[cfg.key]) !== -1 ? ' checked' : '') + ' aria-label="Satırı seç"></td>';
        cols.forEach(function(c){
          tr += '<td data-col="' + c.key + '"' + (c.cellClass ? ' class="' + c.cellClass + '"' : '') + '>' +
                (colMasked(c, r) ? '<span class="cell-mask">' + MASK + '</span>'
                              : (c.render ? c.render(r, i) : esc(r[c.key] == null ? '—' : r[c.key]))) + '</td>';
        });
        if(cfg.rowActions) tr += '<td class="col-acts">' + aksiyonSeridi(r) + '</td>';
        return tr + '</tr>';
      }).join('');

      return '<div class="gv-tablewrap"><table class="gtable"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' +
             renderCardList(rows);
    }

    /* UID-02 — Satır aksiyon şeridi TEK YERDE üretilir. Eskiden yalnız tablo
       satırında kuruluyordu; mobil kart listesine hiç basılmıyordu ve 390 px'te
       satır aksiyonlarına **hiç erişilemiyordu** — arşivde "geri al"/"kalıcı sil",
       tahsilatta "hatırlatma gönder", otomasyonda "kuralı çalıştır" mobilde yoktu.
       İkinci bir markup yazmak yerine aynı üretici iki yerden çağrılır. */
    function aksiyonSeridi(r){
      if(!cfg.rowActions) return '';
      return '<span class="cell-acts">' + cfg.rowActions.filter(function(a){
        /* show(row) → o satırda anlamsız olan aksiyon hiç basılmaz.
           Devre dışı buton bırakmak yerine aksiyonu yok saymak esastır. */
        return typeof a.show === 'function' ? !!a.show(r) : true;
      }).map(function(a){
        var href = typeof a.href === 'function' ? a.href(r) : a.href;
        return href
          ? '<a class="ia' + (a.cls ? ' ' + a.cls : '') + '" href="' + href + '" title="' + esc(a.label) + '" aria-label="' + esc(a.label) + '">' + ico(a.icon,'ic-sm') + '</a>'
          /* AYNI SÖZLEŞME (UID-27): `href` de `run` da yoksa aksiyon ölüdür —
             devre dışı basılır ve durumunu söyler. Toplu işlemle tek kural. */
          : !a.run
          ? '<button type="button" class="ia is-todo" disabled data-rowact-todo="' + esc(a.key) + '" title="' + esc(a.label) + ' — bu sürümde yok" aria-label="' + esc(a.label) + ' — bu sürümde yok">' + ico(a.icon,'ic-sm') + '</button>'
          : '<button type="button" class="ia' + (a.cls ? ' ' + a.cls : '') + '" data-rowact="' + esc(a.key) + '" title="' + esc(a.label) + '" aria-label="' + esc(a.label) + '">' + ico(a.icon,'ic-sm') + '</button>';
      }).join('') + '</span>';
    }

    /* Kart altındaki aksiyon şeridi — tıklama alanı `.gv-mrow-acts` ile 44 px'e çıkar */
    function mobilAksiyon(r){
      var h = aksiyonSeridi(r);
      /* Şerit boşsa (tüm aksiyonlar `show` ile elendi) sarmalayıcı da basılmaz */
      return /<(a|button)\b/.test(h) ? '<div class="gv-mrow-acts">' + h + '</div>' : '';
    }

    /* Mobil kart listesi — AYNI veri kaynağından üretilir (ikinci markup yazılmaz) */
    function renderCardList(rows){
      if(!cfg.mobile) {
        return '<div class="gv-cardlist">' + rows.map(function(r){
          var cols = visibleCols();
          var main = cols[0];
          return '<div class="gv-mrow" data-id="' + esc(r[cfg.key]) + '"><div class="gv-mrow-top">' +
            '<div>' + (main.render ? main.render(r,0) : esc(r[main.key])) + '</div></div>' +
            '<div class="gv-mrow-meta">' + cols.slice(1,4).map(function(c){
              return '<span>' + esc(c.label) + ': ' + (c.render ? c.render(r,0) : esc(r[c.key])) + '</span>';
            }).join('') + '</div>' + mobilAksiyon(r) + '</div>';
        }).join('') + '</div>';
      }
      return '<div class="gv-cardlist">' + rows.map(function(r,i){
        return '<div class="gv-mrow' + (cfg.rowClass && /is-late/.test(cfg.rowClass(r) || '') ? ' is-late' : '') +
          '" data-id="' + esc(r[cfg.key]) + '">' + cfg.mobile(r,i) + mobilAksiyon(r) + '</div>';
      }).join('') + '</div>';
    }

    function renderCards(rows){
      if(!cfg.card) return renderTable(rows);
      return '<div class="gv-cards">' + rows.map(function(r,i){
        return '<div class="gv-rcard">' + cfg.card(r,i) + '</div>';
      }).join('') + '</div>';
    }

    function renderKanban(rows){
      if(!cfg.kanban) return renderTable(rows);
      var groups = cfg.kanban.columns || uniq(rows.map(function(r){ return r[cfg.kanban.groupBy]; }));
      return '<div class="gv-kanban">' + groups.map(function(g){
        var key = typeof g === 'string' ? g : g.key;
        var label = typeof g === 'string' ? g : g.label;
        /* REVİZE 14 — kolon eşleşmesi ham alan değerinden ya da bir YORDAMDAN
           gelir. Kanca opsiyoneldir; verilmezse bugünkü davranış birebir aynı
           kalır. Gerekçe: 15 aşamalı bir pipeline'ı 15 kolon basmak "ilk
           bakışta okunabilir" olmuyor, ama aşamaları SİLMEK de yasak — kolon
           kümesi ile kayıt alanı arasına bir eşleme katmanı gerekiyor. */
        var items = rows.filter(function(r){
          var v = cfg.kanban.groupOf ? cfg.kanban.groupOf(r) : r[cfg.kanban.groupBy];
          return String(v) === String(key);
        });
        return '<section class="gv-kcol" data-kcol="' + esc(key) + '">' +
          '<div class="gv-kcol-head"><span class="gv-kcol-bar" style="width:var(--sp-8);background:var(--' +
          (tone(key) === 'accent' ? 'acc' : tone(key)) + ')"></span>' +
          '<span class="gv-kcol-title">' + esc(label) + '</span>' +
          '<span class="gv-kcol-cnt">' + items.length + '</span></div>' +
          '<div class="gv-kcol-body">' + (items.length ? items.map(function(r){
            return '<article class="gv-kcard" data-id="' + esc(r[cfg.key]) + '">' + cfg.kanban.card(r) + '</article>';
          }).join('') : '<p class="u-xs u-faint u-center" style="padding:var(--sp-8)">Kayıt yok</p>') + '</div>' +
        '</section>';
      }).join('') + '</div>';
    }

    /* TAKVİM GÖRÜNÜMÜ — dördüncü görünüm (PROMPT.md §12: tablo/kart/kanban/takvim).
       Sözleşme: cfg.calendar = { dateField, title(row), tone(row)?, href(row)? }
       · Ay `state.calAy` ile gezilir, referans **DB.today**'dir (new Date() ile
         bugün alınmaz — ders L-08 ile aynı disiplin).
       · Kanban gibi SAYFALAMAYA girmez: ayın tamamı gösterilir, alt gövde
         gösterilen ayın kayıt sayısını söyler.
       · Tarihi olmayan kayıt uydurma bir güne konmaz; sayısı ayrıca yazılır. */
    function ayBasligi(ym){
      var A = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
               'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
      return A[+ym.slice(5,7) - 1] + ' ' + ym.slice(0,4);
    }
    function ayKaydir(ym, delta){
      var y = +ym.slice(0,4), m = +ym.slice(5,7) - 1 + delta;
      y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
      return y + '-' + ('0' + (m + 1)).slice(-2);
    }
    function renderCalendar(rows){
      if(!cfg.calendar || !cfg.calendar.dateField) return renderTable(rows);
      var alan = cfg.calendar.dateField;
      var ym   = state.calAy;
      var gunSayisi = new Date(+ym.slice(0,4), +ym.slice(5,7), 0).getDate();
      /* Pazartesi = 0 olacak şekilde ilk günün sütunu */
      var ilkGun = (new Date(ym + '-01T00:00:00').getDay() + 6) % 7;

      var tarihli = rows.filter(function(r){ return !!r[alan]; });
      var tarihsiz = rows.length - tarihli.length;
      var ayKayit = tarihli.filter(function(r){ return String(r[alan]).slice(0,7) === ym; });

      var hucreler = '';
      for(var b = 0; b < ilkGun; b++) hucreler += '<div class="gv-cal-cell is-pad" aria-hidden="true"></div>';
      for(var g = 1; g <= gunSayisi; g++){
        var iso = ym + '-' + ('0' + g).slice(-2);
        var gun = ayKayit.filter(function(r){ return String(r[alan]).slice(0,10) === iso; });
        hucreler += '<div class="gv-cal-cell' + (iso === DB.today ? ' is-today' : '') + '">' +
          '<div class="gv-cal-day"><span class="gv-cal-num">' + g + '</span>' +
            (gun.length ? '<span class="gv-cal-cnt">' + gun.length + '</span>' : '') + '</div>' +
          gun.map(function(r){
            var t = cfg.calendar.tone ? cfg.calendar.tone(r) : 'neutral';
            var etiket = cfg.calendar.title(r);
            var href = cfg.calendar.href ? cfg.calendar.href(r) : null;
            var ic = '<span class="gv-cal-ev is-' + esc(t) + '" data-id="' + esc(r[cfg.key]) + '" title="' +
                     esc(etiket) + '">' + esc(etiket) + '</span>';
            return href ? '<a class="gv-cal-link" href="' + esc(href) + '">' + ic + '</a>' : ic;
          }).join('') +
        '</div>';
      }

      var basliklar = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']
        .map(function(g){ return '<div class="gv-cal-head">' + g + '</div>'; }).join('');

      return '<div class="gv-cal">' +
        '<div class="gv-cal-bar">' +
          '<button type="button" class="ia" data-cal="prev" aria-label="Önceki ay">' + ico('i-chev-left','ic-sm') + '</button>' +
          '<b class="gv-cal-title">' + ayBasligi(ym) + '</b>' +
          '<button type="button" class="ia" data-cal="next" aria-label="Sonraki ay">' + ico('i-chev-right','ic-sm') + '</button>' +
          '<button type="button" class="btn btn-line btn-sm" data-cal="today">Bugüne dön</button>' +
          '<span class="gv-cal-meta"><b>' + ayKayit.length + '</b> kayıt bu ayda' +
            (tarihsiz ? ' · <b>' + tarihsiz + '</b> kaydın ' + esc(alan) + ' alanı boş, takvimde gösterilemez' : '') +
          '</span>' +
        '</div>' +
        '<div class="gv-cal-grid">' + basliklar + hucreler + '</div>' +
      '</div>';
    }

    function renderPager(total){
      var pages = Math.max(1, Math.ceil(total / state.size));
      if(state.page > pages) state.page = pages;
      var from = total ? (state.page - 1) * state.size + 1 : 0;
      var to = Math.min(total, state.page * state.size);

      var btns = '';
      btns += '<button type="button" data-page="prev"' + (state.page === 1 ? ' disabled' : '') + ' aria-label="Önceki sayfa">' + ico('i-chev-left','ic-sm') + '</button>';
      var list = [];
      for(var i = 1; i <= pages; i++){
        if(i === 1 || i === pages || Math.abs(i - state.page) <= 1) list.push(i);
        else if(list[list.length - 1] !== '…') list.push('…');
      }
      list.forEach(function(p){
        btns += p === '…' ? '<span class="gap">…</span>' :
          '<button type="button" data-page="' + p + '"' + (p === state.page ? ' aria-current="page"' : '') + '>' + p + '</button>';
      });
      btns += '<button type="button" data-page="next"' + (state.page === pages ? ' disabled' : '') + ' aria-label="Sonraki sayfa">' + ico('i-chev-right','ic-sm') + '</button>';

      return '<div class="gv-pager">' +
        '<div class="gv-pager-info">Toplam <b>' + Fmt.num(total) + '</b> kayıt · <b>' + from + '–' + to + '</b> arası gösteriliyor</div>' +
        '<div class="gv-pager-nav">' + btns + '</div>' +
        '<label class="gv-pager-size">Sayfa başına <select data-size>' +
        [10,25,50,100].map(function(n){ return '<option value="' + n + '"' + (n === state.size ? ' selected' : '') + '>' + n + '</option>'; }).join('') +
        '</select></label></div>';
    }

    function renderBulk(){
      if(!cfg.bulk) return '';
      return '<div class="gv-bulk"' + (state.selected.length ? '' : ' hidden') + '>' +
        '<span class="gv-bulk-count"><b>' + state.selected.length + '</b> kayıt seçildi</span>' +
        '<span class="gv-bulk-acts">' + cfg.bulk.map(function(b){
          /* SÖZLEŞME (UID-27): `run` yoksa aksiyon çalışmıyor demektir. Bu durumda
             buton DEVRE DIŞI basılır ve durumunu kendisi söyler. Gizlemiyoruz —
             prototipin işi kapsamı göstermek; gizlemek kapsamı küçük gösterir.
             İSTİSNA (UID-07): `export:true` maddesinin yordamı BİLEŞENDE —
             seçili kayıtları `exportRows` ile dışa aktarır, ekran `run` yazmaz. */
          if(b.export && !canExport()) return '';        /* UID-25 — yetkisizde hiç basılmaz */
          /* UID-13 — `rowActions[]`in `show(row)` sözleşmesi vardı, `bulk[]`in YOKTU:
             yetki isteyen toplu işlemler HER rolde basılıyor, kontrol ancak `run`
             içinde çalışıp "yetkiniz yok" diyordu. Kullanıcı basana kadar
             yapamayacağını bilmiyordu — satır aksiyonunda yasakladığımız ölü buton
             deseni burada yaşıyordu. Tek sözleşme, aynı ad: `show()` + `perm`.
             GİZLEME burada doğrudur çünkü "yetkin yok" ile "henüz yazılmadı" ayrı
             şeylerdir; ikincisi devre dışı + etiketle gösterilir (UID-27). */
          if(b.perm && GV.perm && !GV.perm.can(b.perm)) return '';
          if(typeof b.show === 'function' && !b.show(state.selected.slice())) return '';
          if(!b.run && !b.export) return '<button type="button" class="btn btn-sm is-todo" disabled' +
                 ' data-bulk-todo="' + esc(b.key) + '"' +
                 ' title="Bu sürümde yok — aksiyon henüz uygulanmadı"' +
                 ' aria-label="' + esc(b.label) + ' — bu sürümde yok">' +
                 ico(b.icon || 'i-check','ic-sm') + ' ' + esc(b.label) +
                 ' <span class="gv-todo-tag">bu sürümde yok</span></button>';
          return '<button type="button" class="btn btn-sm' + (b.tone === 'danger' ? ' is-danger' : '') + '" data-bulk="' + esc(b.key) + '">' +
                 ico(b.icon || 'i-check','ic-sm') + ' ' + esc(b.label) + '</button>';
        }).join('') + '<button type="button" class="btn btn-sm" data-bulkclear>' + ico('i-x','ic-sm') + ' Seçimi bırak</button></span>' +
      '</div>';
    }

    /* ---- ana render ---- */
    function render(){
      if(state.loading){
        mount.innerHTML = (cfg.kpis ? '<div class="kpi-grid">' +
          cfg.kpis.map(function(){ return '<div class="sk sk-card" style="height:var(--sp-17)"></div>'; }).join('') + '</div>' : '') +
          '<div class="gv-card">' + GV.skeleton('row', 8) + '</div>';
        return;
      }
      if(state.error){
        mount.innerHTML = '<div class="gv-card">' + GV.errorState({}) + '</div>';
        return;
      }

      var all = pipeline();
      var total = all.length;
      var pages = Math.max(1, Math.ceil(total / state.size));
      if(state.page > pages) state.page = pages;
      var pageRows = all.slice((state.page - 1) * state.size, state.page * state.size);

      var bodyHtml;
      if(!total){
        bodyHtml = GV.empty(cfg.emptyState || {});
      }else if(state.view === 'kanban'){
        bodyHtml = renderKanban(all);
      }else if(state.view === 'calendar'){
        bodyHtml = renderCalendar(all);
      }else if(state.view === 'card'){
        bodyHtml = renderCards(pageRows);
      }else{
        bodyHtml = renderTable(pageRows);
      }

      mount.innerHTML =
        renderKpis(all) +
        /* UID-05 — Kapsam süzgeci SESSİZ çalışmaz. Kullanıcı eksik liste görüp
           "kayıt kaybolmuş" sanmamalı; süzgeç uygulandıysa bunu söyleriz (L-23:
           bileşen olan biteni gizlemez). */
        (scopeBilgi() ? '<div class="gv-scopebar">' + ico('i-shield','ic-sm') +
          '<span>' + esc(scopeBilgi()) + '</span></div>' : '') +
        '<div class="gv-card">' +
          renderHead() +
          '<div class="gc-body flush">' + bodyHtml + '</div>' +
          renderBulk() +
          /* Kanban ve takvim kayıtların TAMAMINI gösterir, sayfalayıcı basılmaz */
          (total && state.view !== 'kanban' && state.view !== 'calendar' ? renderPager(total) : '') +
        '</div>';

      wire();
      if(cfg.onRender) cfg.onRender(all, state);
      writeURL();

      /* UID-06 — Sayaç mount kapsamına değil BELGEYE bağlıydı; aynı sayfada iki
         `GV.list` örneği kurulursa ikisi de aynı düğüme yazar ve ikincisi
         birincinin sayısını ezerdi. `app-egitim` katılımcı kırılımını bu yüzden
         ikinci liste olarak değil elle matris olarak yazmak zorunda kalmıştı.
         Sıra: `countTarget` → mount kökü → belge (yalnız sayfada TEK liste varsa). */
      var sub = cfg.countTarget
        ? (typeof cfg.countTarget === 'string' ? document.querySelector(cfg.countTarget) : cfg.countTarget)
        : (mount.querySelector('[data-listcount]') ||
           (GV._listAdet === 1 ? document.querySelector('[data-listcount]') : null));
      if(sub){
        var tabLbl = cfg.tabs ? (cfg.tabs.filter(function(t){ return t.key === state.tab; })[0] || {}).label : '';
        sub.textContent = Fmt.num(total) + ' kayıt' + (tabLbl ? ' · ' + tabLbl : '');
      }
    }

    /* ---- olay bağlama ---- */
    function reset(){ state.page = 1; state.selected = []; }

    function wire(){
      var q = function(s){ return mount.querySelector(s); };
      var qa = function(s){ return Array.prototype.slice.call(mount.querySelectorAll(s)); };

      var si = q('[data-search]');
      if(si){
        var timer;
        si.addEventListener('input', function(){
          clearTimeout(timer);
          timer = setTimeout(function(){ state.q = si.value.trim(); reset(); render(); q('[data-search]').focus(); }, 220);
        });
      }

      qa('[data-tab]').forEach(function(b){
        b.addEventListener('click', function(){ state.tab = b.dataset.tab; reset(); render(); });
      });

      qa('[data-sort]').forEach(function(th){
        th.addEventListener('click', function(){
          var k = th.dataset.sort;
          if(state.sort === k) state.dir = state.dir === 'asc' ? 'desc' : 'asc';
          else { state.sort = k; state.dir = 'asc'; }
          render();
        });
      });

      qa('[data-page]').forEach(function(b){
        b.addEventListener('click', function(){
          var v = b.dataset.page;
          var pages = Math.max(1, Math.ceil(pipeline().length / state.size));
          if(v === 'prev') state.page = Math.max(1, state.page - 1);
          else if(v === 'next') state.page = Math.min(pages, state.page + 1);
          else state.page = parseInt(v,10);
          render();
          window.scrollTo({ top:mount.offsetTop - 80, behavior:'smooth' });
        });
      });

      var sz = q('[data-size]');
      if(sz) sz.addEventListener('change', function(){ state.size = parseInt(sz.value,10); state.page = 1; render(); });

      var arc = q('[data-archive]');
      if(arc) arc.addEventListener('change', function(){ state.archive = arc.checked; reset(); render(); });

      /* Takvim ay gezinmesi — ay değişince sayfa 1'e döner (filtre kuralıyla aynı) */
      qa('[data-cal]').forEach(function(b){
        b.addEventListener('click', function(){
          var d = b.dataset.cal;
          state.calAy = d === 'today'
            ? String(DB.today).slice(0,7)
            : ayKaydir(state.calAy, d === 'prev' ? -1 : 1);
          state.page = 1; render();
        });
      });
      qa('[data-view]').forEach(function(b){
        b.addEventListener('click', function(){ state.view = b.dataset.view; state.page = 1; render(); });
      });

      qa('[data-rmfilter]').forEach(function(b){
        b.addEventListener('click', function(){ delete state.filters[b.dataset.rmfilter]; reset(); render(); });
      });
      var cf = q('[data-clearfilters]');
      if(cf) cf.addEventListener('click', function(){ state.filters = {}; reset(); render(); });

      var of = q('[data-openfilters]');
      if(of) of.addEventListener('click', openFilters);

      var oc = q('[data-opencols]');
      if(oc) oc.addEventListener('click', function(e){ openCols(e.currentTarget); });

      var ex = q('[data-export]');
      if(ex) ex.addEventListener('click', function(){ openExport(pipeline()); });

      /* toplu seçim */
      var sa = q('[data-selectall]');
      if(sa){
        sa.addEventListener('change', function(){
          var rows = pipeline().slice((state.page - 1) * state.size, state.page * state.size);
          if(sa.checked) rows.forEach(function(r){ if(state.selected.indexOf(r[cfg.key]) === -1) state.selected.push(r[cfg.key]); });
          else rows.forEach(function(r){ state.selected = state.selected.filter(function(x){ return x !== r[cfg.key]; }); });
          render();
        });
      }
      qa('[data-rowcheck]').forEach(function(c){
        c.addEventListener('change', function(){
          var id = c.dataset.rowcheck;
          if(c.checked){ if(state.selected.indexOf(id) === -1) state.selected.push(id); }
          else state.selected = state.selected.filter(function(x){ return x !== id; });
          render();
        });
      });
      var bc = q('[data-bulkclear]');
      if(bc) bc.addEventListener('click', function(){ state.selected = []; render(); });
      qa('[data-bulk]').forEach(function(b){
        b.addEventListener('click', function(){
          var act = cfg.bulk.filter(function(x){ return x.key === b.dataset.bulk; })[0];
          if(!act) return;
          /* UID-27 / ders L-23: `run` yoksa BAŞARI MESAJI BASILMAZ.
             Eskiden burada `else GV.toast(... 'kayıt işlendi', 'ok')` vardı:
             kullanıcı onay veriyor, yeşil "12 kayıt arşivlendi" görüyor, veri
             değişmiyordu. Ölçüldü: 87 toplu aksiyon, 47 ekran. Bileşen, çağıranın
             vermediği bir yordamın yerine başarı varsayamaz. `run`suz aksiyon
             zaten `disabled` basılıyor; bu ikinci savunma hattıdır. */
          if(!act.run && !act.export) return;
          var run = act.export
            ? function(){ exportRows(state.selected.slice()); }   /* UID-07: seçim korunur */
            : function(){
                act.run(state.selected.slice());
                state.selected = []; render();
              };
          if(act.confirm){
            GV.confirm({ title:act.label, text:act.confirm.replace('{n}', state.selected.length),
                         tone:act.tone === 'danger' ? 'danger' : 'warn' })
              .then(function(ok){ if(ok) run(); });
          }else run();
        });
      });

      qa('[data-rowact]').forEach(function(b){
        b.addEventListener('click', function(){
          /* UID-02 — Eskiden `closest('tr')` aranıyordu; mobil kartta `<tr>` YOK,
             bu yüzden aksiyon şeridi karta basılsa bile tıklama patlardı. Artık
             `data-id` taşıyan en yakın düğüm aranır: tablo satırı da mobil kart da. */
          var kap = b.closest('[data-id]');
          var id = kap ? kap.dataset.id : null;
          if(!id) return;
          var a = cfg.rowActions.filter(function(x){ return x.key === b.dataset.rowact; })[0];
          var rec = kaynak().filter(function(r){ return String(r[cfg.key]) === String(id); })[0];
          if(a && a.run) a.run(rec, render);
        });
      });

      var rt = q('[data-retry]');
      if(rt) rt.addEventListener('click', function(){ state.error = false; state.loading = true; render(); load(); });

      wireChipbar(mount);
      wireScrollHint(mount);
    }

    /* ---- gelişmiş filtre drawer ---- */
    function openFilters(){
      var fields = cfg.filters || [];
      if(!fields.length){ GV.toast('Bu listede tanımlı gelişmiş filtre yok', 'info'); return; }
      var body = fields.map(function(f){
        var cur = state.filters[f.key];
        if(f.type === 'multi'){
          var vals = Array.isArray(cur) ? cur : [];
          return '<div class="field fd-field"><span class="f-lbl">' + esc(f.label) + '</span>' +
            f.options.map(function(o){
              var v = typeof o === 'string' ? o : o.value;
              var l = typeof o === 'string' ? o : o.label;
              return '<label class="f-check"><input type="checkbox" data-f="' + f.key + '" value="' + esc(v) + '"' +
                     (vals.indexOf(String(v)) !== -1 ? ' checked' : '') + '><span>' + esc(l) + '</span></label>';
            }).join('') + '</div>';
        }
        if(f.type === 'daterange'){
          var p = String(cur || '').split('~');
          return '<div class="field fd-field"><label>' + esc(f.label) + '</label><div class="fd-range">' +
            '<input type="date" data-f="' + f.key + '" data-part="0" value="' + esc(p[0] || '') + '" aria-label="Başlangıç">' +
            '<span>–</span>' +
            '<input type="date" data-f="' + f.key + '" data-part="1" value="' + esc(p[1] || '') + '" aria-label="Bitiş">' +
            '</div></div>';
        }
        if(f.type === 'text'){
          return '<div class="field fd-field"><label>' + esc(f.label) + '</label>' +
            /* UID-10 — Para ve yüzde filtresinde BİRİM EKİ. Form tarafında
               `f-affix`/`f-suffix` vardı, filtre panelinde yoktu; kullanıcı
               "en az 50000" yazarken neyin birimi olduğunu göremiyordu. */
            (f.type === 'money' || f.type === 'percent'
              ? '<div class="f-affix"><input type="number" class="inp" data-f="' + f.key + '" value="' + esc(cur || '') + '" min="0"' +
                (f.type === 'percent' ? ' max="100"' : '') + '><span class="f-suffix">' +
                esc(f.type === 'percent' ? '%' : (f.currency || '₺')) + '</span></div>'
              : '<input type="' + (f.type === 'number' ? 'number' : 'text') + '" class="inp" data-f="' + f.key + '" value="' + esc(cur || '') + '">') + '</div>';
        }
        return '<div class="field fd-field"><label>' + esc(f.label) + '</label><select data-f="' + f.key + '">' +
          '<option value="">Tümü</option>' +
          f.options.map(function(o){
            var v = typeof o === 'string' ? o : o.value;
            var l = typeof o === 'string' ? o : o.label;
            return '<option value="' + esc(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>';
          }).join('') + '</select></div>';
      }).join('');

      /* UID-10 — "Filtre uygula butonu seçili filtre sayısını göstermiyor".
         Panel açıkken kaç alanın dolu olduğu butonda canlı sayılır; kullanıcı
         uygulamadan önce kaç kısıt koyduğunu görür. */
      function doluSay(el){
        var n = 0;
        fields.forEach(function(f){
          if(f.type === 'multi'){ if(el.querySelectorAll('[data-f="' + f.key + '"]:checked').length) n++; }
          else if(f.type === 'daterange'){
            var a = el.querySelector('[data-f="' + f.key + '"][data-part="0"]');
            var b = el.querySelector('[data-f="' + f.key + '"][data-part="1"]');
            if((a && a.value) || (b && b.value)) n++;
          }else{
            var i = el.querySelector('[data-f="' + f.key + '"]');
            if(i && String(i.value || '').trim()) n++;
          }
        });
        return n;
      }
      GV.drawer({
        title:'Gelişmiş Filtre',
        body:body,
        onMount:function(el, kok){
          var btn = kok && kok.querySelector('.gv-drawer-foot .btn-acc');
          if(!btn) return;
          var taban = btn.textContent;
          var yaz = function(){
            var n = doluSay(el);
            btn.textContent = taban + (n ? ' (' + n + ')' : '');
          };
          el.addEventListener('input', yaz); el.addEventListener('change', yaz); yaz();
        },
        actions:[
          { label:'Temizle', cls:'btn-line', onClick:function(){ state.filters = {}; reset(); render(); } },
          { label:'Uygula', cls:'btn-acc', onClick:function(close, el){
              var next = {};
              fields.forEach(function(f){
                if(f.type === 'multi'){
                  var vs = Array.prototype.slice.call(el.querySelectorAll('[data-f="' + f.key + '"]:checked')).map(function(i){ return i.value; });
                  if(vs.length) next[f.key] = vs;
                }else if(f.type === 'daterange'){
                  var a = el.querySelector('[data-f="' + f.key + '"][data-part="0"]').value;
                  var b = el.querySelector('[data-f="' + f.key + '"][data-part="1"]').value;
                  if(a || b) next[f.key] = a + '~' + b;
                }else{
                  var v = el.querySelector('[data-f="' + f.key + '"]').value;
                  if(v) next[f.key] = v;
                }
              });
              state.filters = next; reset(); render();
            } }
        ]
      });
    }

    /* ---- kolon yöneticisi ---- */
    function openCols(anchor){
      var views = [];
      try{ views = JSON.parse(localStorage.getItem(LS_VIEWS) || '[]'); }catch(e){}

      var body = '<div class="gv-pop-list">' + state.cols.map(function(c, i){
        var d = colDef(c.key);
        if(!d) return '';
        return '<label class="gv-pop-item"><input type="checkbox" data-col="' + c.key + '"' +
               (c.visible ? ' checked' : '') + (d.locked ? ' disabled' : '') + '>' +
               '<span>' + esc(d.label) + '</span>' +
               '<button type="button" class="ia btn-xs" data-move="' + i + '" data-dir="up" aria-label="Yukarı taşı">' + ico('i-chev-up','ic-sm') + '</button>' +
               '<button type="button" class="ia btn-xs" data-move="' + i + '" data-dir="down" aria-label="Aşağı taşı">' + ico('i-chev-down','ic-sm') + '</button>' +
               '</label>';
      }).join('') + '</div>' +
      (views.length ? '<div class="gv-pop-head" style="margin-top:var(--sp-6)"><span class="gv-pop-title">Kayıtlı görünümler</span></div>' +
        views.map(function(v,i){
          return '<button type="button" class="gv-pop-item" data-loadview="' + i + '">' + ico('i-eye','ic-sm') + esc(v.ad) + '</button>';
        }).join('') : '');

      GV.modal({
        title:'Kolon Yönetimi',
        text:'Görünecek kolonları seçin, sırayı değiştirin veya bu görünümü kaydedin.',
        icon:'i-columns', size:'sm',
        body:body,
        actions:[
          { label:'Görünümü Kaydet', cls:'btn-line', close:false, onClick:function(close, el){
              var ad = prompt('Görünüm adı:');
              if(!ad) return false;
              views.push({ ad:ad, cols:state.cols.slice() });
              try{ localStorage.setItem(LS_VIEWS, JSON.stringify(views)); }catch(e){}
              GV.toast('Görünüm kaydedildi: ' + ad, 'ok');
              return false;
            } },
          { label:'Varsayılana Dön', cls:'btn-line', onClick:function(){
              try{ localStorage.removeItem(LS_COLS); }catch(e){}
              state.cols = cfg.columns.map(function(c){ return { key:c.key, visible:c.visible !== false }; });
              render();
            } },
          { label:'Uygula', cls:'btn-acc', onClick:function(close, el){
              Array.prototype.slice.call(el.querySelectorAll('[data-col]')).forEach(function(i){
                var c = state.cols.filter(function(x){ return x.key === i.dataset.col; })[0];
                if(c) c.visible = i.checked;
              });
              if(!state.cols.some(function(c){ return c.visible; })) state.cols[0].visible = true;
              saveCols(); render();
            } }
        ]
      });

      /* sıra değiştirme — modal içinde canlı */
      setTimeout(function(){
        var mb = document.querySelector('.gv-modal-body');
        if(!mb) return;
        mb.addEventListener('click', function(e){
          var b = e.target.closest('[data-move]');
          if(!b) return;
          e.preventDefault();
          var i = +b.dataset.move;
          var j = b.dataset.dir === 'up' ? i - 1 : i + 1;
          if(j < 0 || j >= state.cols.length) return;
          var tmp = state.cols[i]; state.cols[i] = state.cols[j]; state.cols[j] = tmp;
          saveCols();
          var scrim = b.closest('.gv-scrim');
          if(scrim) scrim.remove();
          document.body.style.overflow = '';
          render();
          openCols(anchor);
        });
      }, 40);
    }

    /* ---- çıktı ---- */
    /* Biçim seçimi tek yerde üretilir — kapsamlı ve kapsamsız çıktı modalı
       aynı listeyi kullanır (UID-07: ikinci markup yazılmaz). */
    function fmtField(){
      return '<div class="field"><span class="f-lbl">Biçim</span><div class="f-radios">' +
        [['xlsx','Excel'],['csv','CSV'],['pdf','PDF'],['print','Yazdır']].map(function(f,i){
          return '<label class="f-radio"><input type="radio" name="expfmt" value="' + f[0] + '"' +
                 (i === 0 ? ' checked' : '') + '>' + f[1] + '</label>';
        }).join('') + '</div></div>';
    }

    function openExport(rows){
      var scopes = [
        { key:'filtreli', label:'Filtrelenmiş kayıtlar (' + rows.length + ')' },
        { key:'tumu', label:'Tüm kayıtlar (' + kaynak().length + ')' }
      ];
      if(state.selected.length) scopes.unshift({ key:'secili', label:'Seçili kayıtlar (' + state.selected.length + ')' });

      GV.modal({
        title:'Çıktı Al', text:'Kapsam ve biçim seçin.', icon:'i-download', size:'sm',
        body:'<div class="field"><span class="f-lbl">Kapsam</span><div class="f-radios">' +
          scopes.map(function(s,i){
            return '<label class="f-radio"><input type="radio" name="expscope" value="' + s.key + '"' +
                   (i === 0 ? ' checked' : '') + '>' + esc(s.label) + '</label>';
          }).join('') + '</div></div>' +
          '<div class="u-mt-4">' + fmtField() + '</div>',
        actions:[
          { label:'Vazgeç', cls:'btn-line' },
          { label:'Çıktı Al', cls:'btn-acc', onClick:function(close, el){
              var scope = el.querySelector('[name=expscope]:checked').value;
              var fmt = el.querySelector('[name=expfmt]:checked').value;
              /* UID-05 — kapsam dışı kayıt DIŞA AKTARILAMAZ; süzgeç burada da geçerli */
              var data = scope === 'tumu' ? kaynak()
                       : scope === 'secili' ? kaynak().filter(function(r){ return state.selected.indexOf(r[cfg.key]) !== -1; })
                       : rows;
              var ad = scope === 'tumu' ? 'tüm kayıtlar' : scope === 'secili' ? 'seçili kayıtlar' : 'filtrelenmiş';
              /* Şartname [14.4.7] — "Tüm kayıtlar" ekranda süzülmemiş veriyi
                 dosyaya çıkarır; filtre kapsamı bir yetki sınırı da olabildiği
                 için ayrıca onaylatılır. Diğer iki kapsamda ek soru sorulmaz:
                 kullanıcı zaten gördüğü kümeyi indiriyor. */
              if(scope === 'tumu'){
                GV.confirm({
                  title:'Tüm kayıtlar dışa aktarılacak',
                  text:'Ekrandaki filtreler UYGULANMAYACAK; ' + data.length + ' kaydın tamamı ' +
                       'dosyaya yazılacak. Dosya paylaşıldığında kapsam sınırı korunmaz.',
                  okLabel:'Tümünü aktar', tone:'warn'
                }).then(function(ok){ if(ok) doExport(data, fmt, ad); });
                return;
              }
              doExport(data, fmt, ad);
            } }
        ]
      });
    }

    /* UID-07 — SEÇİLİ KAPSAMI DIŞA AKTARMA.
       `doExport` beş oturumdur generic ama `GV.list` kapanışına kilitliydi
       (UID-26): toplu işlemdeki "Dışa aktar" onu çağıramıyordu ve 53 ekranda
       aksiyon boş kalıyordu. Yordam artık dönüş yüzeyinde: `exportRows(kayıtlar
       ya da id'ler, biçim)`. Biçim verilmezse kullanıcıya sorulur — bileşen
       kullanıcı adına biçim seçmez. */
    function exportRows(list, fmt){
      if(!canExport()){ GV.toast('Dışa aktarma yetkiniz yok.', 'danger'); return 0; }
      var rows = (list || []).map(function(x){
        if(x && typeof x === 'object') return x;
        return kaynak().filter(function(r){ return String(r[cfg.key]) === String(x); })[0];
      }).filter(Boolean);
      if(!rows.length){ GV.toast('Dışa aktarılacak kayıt yok', 'warn'); return 0; }
      if(fmt){ doExport(rows, fmt); return rows.length; }
      GV.modal({
        title:'Çıktı Al', text:rows.length + ' seçili kayıt dışa aktarılacak.', icon:'i-download', size:'sm',
        body:fmtField(),
        actions:[
          { label:'Vazgeç', cls:'btn-line' },
          { label:'Çıktı Al', cls:'btn-acc', onClick:function(close, el){
              doExport(rows, el.querySelector('[name=expfmt]:checked').value);
            } }
        ]
      });
      return rows.length;
    }

    /* ÇIKTI KÜNYESİ — şartname [14.4.2]: "çıktı ekranda aktif filtre, kolon,
       sıralama, kapsam ve formül sürümünü taşısın." Künye VERİNİN ARDINA
       yazılır, önüne değil: başa konan satırlar CSV'yi okuyan her aracın
       başlık satırını kaydırır ve [14.6.1]'in "ekranla aynı kayıt kümesi"
       sözleşmesini bozardı. */
    function ciktiKunyesi(rows, cols, kapsam){
      var f = [];
      if(state.q) f.push('arama: ' + state.q);
      if(state.tab) f.push('sekme: ' + state.tab);
      Object.keys(state.filters || {}).forEach(function(k){
        var v = state.filters[k];
        if(v && v.length) f.push(k + ': ' + (Array.isArray(v) ? v.join(' | ') : v));
      });
      if(state.archive) f.push('arşiv: dahil');
      return [
        ['Kapsam', kapsam + ' · ' + rows.length + ' kayıt'],
        ['Filtre', f.length ? f.join(' · ') : 'yok'],
        ['Sıralama', state.sort ? state.sort + ' ' + (state.dir === 'desc' ? 'azalan' : 'artan') : 'varsayılan'],
        ['Kolon', cols.map(function(c){ return c.label; }).join(' | ')],
        ['Formül sürümü', (window.DB && DB.formulaVersion) || 'tanımsız'],
        ['Alındığı an', (window.DB ? DB.today : '') + ' · ' + ((GV.session && GV.session.ad) || '—')]
      ];
    }

    /* TEK HÜCRE SÖZLEŞMESİ — çıktının değer kuralı BURADA yaşar.
       Değer sırası: açık sözleşme → ekranın gösterdiği metin → ham alan.
       Ortadaki basamak `xport.js`'in ölçtüğü "ekranda dolu, çıktıda boş"
       sınıfını kökten kapatır; kolon başına yama gerekmez.

       ⚠️ Ayrı bir yordam olmasının sebebi ölçüm: `xport.js` bu kuralı kendi
       içinde KOPYALIYORDU ve kopya, ürün kodundan bağımsız yaşıyordu — kuralı
       ürün tarafında bozup ekseni koşturduğumda eksen yine "TEMİZ" dedi, çünkü
       kendi kopyasını ölçüyordu (L-27 ailesinin yeni bir üyesi). Eksen artık
       liste örneğinin dönüş yüzeyindeki `exportCell`i çağırır, yani ÜRÜNÜ
       ölçer. Bu yordamın imzası ölçüm sözleşmesinin parçasıdır. */
    function exportCell(c, r, i){
      if(colMasked(c, r)) return '';                /* UID-28 — maskeli hücre çıktıya da girmez */
      var v = c.exportValue ? c.exportValue(r, i)
            : c.render     ? htmlText(c.render(r, i))
            : r[c.key];
      return v == null ? '' : htmlText(v);
    }

    function doExport(rows, fmt, kapsam){
      var cols = visibleCols().filter(function(c){ return c.exportable !== false; });
      var head = cols.map(function(c){ return c.label; });
      var body = rows.map(function(r, i){
        return cols.map(function(c){ return exportCell(c, r, i); });
      });
      var name = (cfg.exportName || 'liste') + '-' + (window.DB ? DB.today : '');
      var kunye = ciktiKunyesi(rows, cols, kapsam || 'filtrelenmiş');

      if(fmt === 'print' || fmt === 'pdf'){
        var w = window.open('', '_blank');
        if(!w){ GV.toast('Açılır pencere engellendi', 'danger'); return; }
        w.document.write('<html><head><title>' + name + '</title><meta charset="utf-8">' +
          '<style>@page{size:A4 landscape;margin:14mm}' +
          'body{font-family:system-ui,sans-serif;padding:0;color:#101426}' +
          'h1{font-size:18px;margin:0 0 4px}p{color:#6A7189;font-size:12px;margin:0 0 12px}' +
          'table{width:100%;border-collapse:collapse;font-size:11px}' +
          /* Şartname [14.4.6]: başlık her sayfada tekrar etsin, satır ortadan bölünmesin. */
          'thead{display:table-header-group}tfoot{display:table-footer-group}' +
          'tr{page-break-inside:avoid;break-inside:avoid}' +
          'th{background:#EDF0F5;text-align:left;padding:7px;border:1px solid #E3E7EE;font-size:10px;text-transform:uppercase}' +
          'td{padding:7px;border:1px solid #E3E7EE}' +
          '.kunye{margin-top:14px;font-size:10px;color:#6A7189;page-break-inside:avoid}' +
          '.kunye b{color:#101426}' +
          '</style></head><body>' +
          '<h1>' + esc(cfg.exportTitle || 'Liste çıktısı') + '</h1>' +
          '<p>GaviaWorks · ' + Fmt.date(window.DB ? DB.today : '') + ' · ' + rows.length + ' kayıt</p>' +
          '<table><thead><tr>' + head.map(function(h){ return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
          body.map(function(r){ return '<tr>' + r.map(function(c){ return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table>' +
          '<div class="kunye">' + kunye.map(function(k){
            return '<div><b>' + esc(k[0]) + ':</b> ' + esc(k[1]) + '</div>'; }).join('') + '</div>' +
          '</body></html>');
        w.document.close();
        setTimeout(function(){ w.print(); }, 300);
        GV.toast(fmt === 'pdf' ? 'Yazdırma penceresinden PDF olarak kaydedebilirsiniz' : 'Yazdırma penceresi açıldı', 'info', 5000);
        return;
      }

      var sep = fmt === 'csv' ? ',' : '\t';
      function satir(r){
        return r.map(function(c){
          c = csvGuard(String(c == null ? '' : c));
          return /^'|["\n,;\t]/.test(c) ? '"' + c.replace(/"/g,'""') + '"' : c;
        }).join(sep);
      }
      var text = [satir(head)].concat(body.map(satir)).join('\n') +
                 '\n\n' + kunye.map(function(k){ return satir([k[0], k[1]]); }).join('\n');
      var mime = fmt === 'csv' ? 'text/csv;charset=utf-8' : 'application/vnd.ms-excel;charset=utf-8';
      var blob = new Blob(['﻿' + text], { type:mime });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name + (fmt === 'csv' ? '.csv' : '.xls');
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
      GV.toast(rows.length + ' kayıt dışa aktarıldı', 'ok');
    }

    /* ---- yükleme simülasyonu (skeleton → veri) ---- */
    function load(){
      setTimeout(function(){
        state.loading = false;
        render();
      }, cfg.delay == null ? 260 : cfg.delay);
    }

    readURL();
    render();
    load();

    /* UID-26 — Kolon yöneticisi, gelişmiş filtre, çıktı ve kanban `GV.list`
       kapanışının İÇİNDE yaşıyordu ve dışarıdan hiç çağrılamıyordu; sözlük
       beş oturum boyunca bunları `GV.cols()` / `GV.filters()` / `GV.export()` /
       `GV.kanban()` diye **var olmayan bileşenler** olarak listelemişti.
       Artık her biri liste örneğinin DÖNÜŞ YÜZEYİNDE: ekran kendi başlık
       çubuğundan, klavye kısayolundan ya da başka bir panelden çağırabilir.

       AÇIKÇA YAPILMAYAN: bunları listeden BAĞIMSIZ, tek başına kurulabilen
       `GV.cols(cfg)` bileşenlerine dönüştürmek. Dördü de `state` (seçili
       kolonlar, aktif filtreler, sayfa, seçim) ve `cfg` üzerinde çalışıyor;
       bağımsız hâle getirmek bu durumu dışarı taşıyan ayrı bir sözleşme
       gerektirir. Borcun gerekçe olarak gösterdiği üç belirti (UID-06 ikinci
       liste örneği · UID-07 seçili kapsam çıktısı · UID-17 `dl` tekrarı)
       **başka yollarla kapandı**, bu yüzden ayrıştırmanın kalan değeri
       mimari saflık; dondurulmuş kapsamda bırakıldı (ui-debt.md V2). */
    return {
      state:state,
      refresh:render,
      setTab:function(k){ state.tab = k; reset(); render(); },
      setFilter:function(k, v){ state.filters[k] = v; reset(); render(); },
      exportRows:exportRows,         /* UID-07 — seçili / dışarıdan verilen kapsamı dışa aktarır */
      exportCell:exportCell,         /* ÖLÇÜM SÖZLEŞMESİ — `xport.js` çıktı değerini buradan okur */
      openCols:openCols,             /* UID-26 — kolon yöneticisi */
      openFilters:openFilters,       /* UID-26 — gelişmiş filtre paneli */
      /* Kayıt kümesi verilmezse EKRANDAKİ süzülmüş küme kullanılır — çağıran
         ekranın `pipeline()`a erişimi yok, boş geçince patlıyordu. */
      openExport:function(rows){ return openExport(rows || pipeline()); },
      setView:function(v){ state.view = v; render(); } /* UID-26 — tablo/kart/kanban */
    };
  };

  /* ===================================================================
     5. CHIPBAR / SCROLL İPUCU
     =================================================================== */
  function wireChipbar(root){
    var wraps = (root || document).querySelectorAll('.chipbar-wrap');
    Array.prototype.forEach.call(wraps, function(w){
      var bar = w.querySelector('.chipbar');
      var prev = w.querySelector('.cb-prev');
      var next = w.querySelector('.cb-next');
      if(!bar || !prev || !next) return;
      function upd(){
        var over = bar.scrollWidth > bar.clientWidth + 2;
        prev.hidden = !over || bar.scrollLeft <= 2;
        next.hidden = !over || bar.scrollLeft >= bar.scrollWidth - bar.clientWidth - 2;
      }
      prev.addEventListener('click', function(){ bar.scrollBy({ left:-220, behavior:'smooth' }); });
      next.addEventListener('click', function(){ bar.scrollBy({ left:220, behavior:'smooth' }); });
      bar.addEventListener('scroll', upd);
      window.addEventListener('resize', upd);
      setTimeout(upd, 60);
      var active = bar.querySelector('[aria-selected="true"]');
      if(active) active.scrollIntoView({ inline:'nearest', block:'nearest' });
    });
  }
  GV.chipbar = wireChipbar;

  function wireScrollHint(root){
    var wraps = (root || document).querySelectorAll('.gv-tablewrap');
    Array.prototype.forEach.call(wraps, function(w){
      function upd(){
        w.classList.toggle('has-shadow-r', w.scrollWidth > w.clientWidth + 2 && w.scrollLeft < w.scrollWidth - w.clientWidth - 2);
        w.classList.toggle('has-shadow-l', w.scrollLeft > 2);
      }
      w.addEventListener('scroll', upd);
      window.addEventListener('resize', upd);
      setTimeout(upd, 60);
    });
  }

  /* ===================================================================
     6. SEKME BİLEŞENİ (detay sayfaları)
     =================================================================== */
  GV.tabs = function(root){
    var el = typeof root === 'string' ? document.querySelector(root) : root;
    if(!el) return;
    var btns = Array.prototype.slice.call(el.querySelectorAll('[role=tab]'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('[role=tabpanel]'));

    function activate(key, push){
      btns.forEach(function(b){ b.setAttribute('aria-selected', b.dataset.tab === key ? 'true' : 'false'); });
      panels.forEach(function(p){ p.hidden = p.dataset.panel !== key; });
      if(push) history.replaceState({}, '', location.pathname + location.search + '#' + key);
      var b = btns.filter(function(x){ return x.dataset.tab === key; })[0];
      if(b) b.scrollIntoView({ inline:'nearest', block:'nearest' });
      document.dispatchEvent(new CustomEvent('gv:tab', { detail:{ key:key } }));
    }

    el.addEventListener('click', function(e){
      var b = e.target.closest('[role=tab]');
      if(b) activate(b.dataset.tab, true);
    });
    el.addEventListener('keydown', function(e){
      if(['ArrowLeft','ArrowRight'].indexOf(e.key) === -1) return;
      var i = btns.indexOf(document.activeElement);
      if(i === -1) return;
      var n = e.key === 'ArrowRight' ? (i + 1) % btns.length : (i - 1 + btns.length) % btns.length;
      btns[n].focus(); activate(btns[n].dataset.tab, true);
    });

    var hash = location.hash.replace('#','');
    activate(hash && btns.some(function(b){ return b.dataset.tab === hash; }) ? hash : btns[0].dataset.tab, false);
    return { activate:activate };
  };

  /* ===================================================================
     7. FORM BİLEŞENİ
     =================================================================== */
  GV.form = function(cfg){
    var mount = typeof cfg.mount === 'string' ? document.querySelector(cfg.mount) : cfg.mount;
    if(!mount) return null;
    var rec = cfg.record || {};
    var dirty = false;

    function fieldHtml(f){
      var v = rec[f.key] != null ? rec[f.key] : (f.value != null ? f.value : '');
      var id = 'f_' + f.key;
      /* `required` bir işlev de olabilir: zorunluluğu başka bir alanın değeri
         belirliyorsa hüküm bileşende durur (bkz. `showIf`). Yıldız o durumda
         da basılır — alan çoğu halde zorunludur, istisnası `hint`te yazılır.
         Native `required` özniteliği işlevde basılmaz; form zaten `novalidate`. */
      var reqSabit = typeof f.required === 'function' ? false : !!f.required;
      /* SALT OKUNUR ALAN — şartname [3.1.11]: "sistem tarafından türetilen
         alanlar salt okunur olsun ve neden değiştirilemediği kısa yardım
         metniyle açıklansın".
         ⚠️ Bu sözleşme BEŞ EKRANDA YAZILIYDI AMA HİÇBİR YERDE UYGULANMIYORDU:
         formlar `readonly:true` bildiriyor, motor bunu okumuyordu; alan
         düzenlenebilir kalıyordu. Ekranlar bunu tek tek DOM'a dokunarak
         (`el.readOnly = true`) çözmeye çalışmıştı — yani kural bileşende
         değil, çağıranda yaşıyordu. Artık motorda. */
      var salt = !!f.readonly;
      var req = (f.required ? '<span class="req" aria-hidden="true">*</span>' : '');
      var inner = '';

      if(f.type === 'textarea'){
        inner = '<textarea id="' + id + '" name="' + f.key + '" rows="' + (f.rows || 4) + '"' +
                (reqSabit ? ' required' : '') + (salt ? ' readonly aria-readonly="true"' : '') +
                (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') +
                '>' + esc(v) + '</textarea>';
      }else if(f.type === 'select'){
        /* `<select>` `readonly` özniteliğini desteklemez ve `disabled` alan
           `read()` tarafından okunamaz. Salt okunur seçim, DEĞERİ TAŞIYAN gizli
           bir alanla eşlenir; görünen seçim yalnız gösterim içindir. */
        if(salt){
          var etiket = v;
          (f.options || []).forEach(function(o){
            if(typeof o !== 'string' && String(o.value) === String(v)) etiket = o.label; });
          inner = '<input type="hidden" name="' + f.key + '" value="' + esc(v) + '">' +
                  '<input type="text" id="' + id + '" class="inp is-readonly" readonly aria-readonly="true" ' +
                  'tabindex="-1" value="' + esc(etiket || '—') + '">';
        }else
        inner = '<select id="' + id + '" name="' + f.key + '"' + (reqSabit ? ' required' : '') + '>' +
          '<option value="">' + esc(f.placeholder || 'Seçiniz') + '</option>' +
          (f.options || []).map(function(o){
            var ov = typeof o === 'string' ? o : o.value;
            var ol = typeof o === 'string' ? o : o.label;
            return '<option value="' + esc(ov) + '"' + (String(v) === String(ov) ? ' selected' : '') + '>' + esc(ol) + '</option>';
          }).join('') + '</select>';
      }else if(f.type === 'switch'){
        inner = '<label class="f-switch"><input type="checkbox" id="' + id + '" name="' + f.key + '"' +
                (v ? ' checked' : '') + '><span class="sw"></span><span>' + esc(f.onLabel || 'Aktif') + '</span></label>';
      }else if(f.type === 'checkbox'){
        inner = '<label class="f-check"><input type="checkbox" id="' + id + '" name="' + f.key + '"' +
                (v ? ' checked' : '') + '><span>' + esc(f.checkLabel || f.label) + '</span></label>';
      }else if(f.type === 'radio'){
        inner = '<div class="f-radios">' + (f.options || []).map(function(o){
          var ov = typeof o === 'string' ? o : o.value;
          var ol = typeof o === 'string' ? o : o.label;
          return '<label class="f-radio"><input type="radio" name="' + f.key + '" value="' + esc(ov) + '"' +
                 (String(v) === String(ov) ? ' checked' : '') + '>' + esc(ol) + '</label>';
        }).join('') + '</div>';
      }else if(f.type === 'file'){
        inner = '<div class="gv-upload" data-upload tabindex="0" role="button">' + ico('i-upload','ic-lg') +
                '<div class="gv-upload-title">Dosya seçin veya sürükleyip bırakın</div>' +
                '<div class="gv-upload-hint">' + esc(f.hint || 'PDF, DOCX, XLSX, PNG, JPG · en fazla 20 MB') + '</div>' +
                '<input type="file" id="' + id + '" name="' + f.key + '" hidden' + (f.multiple ? ' multiple' : '') + '></div>' +
                '<div class="gv-filelist" data-filelist></div>';
      /* ⚠️ `readonly` SÖZLEŞMESİ BU İKİ DALDA UYGULANMIYORDU. Metin, çok
         satırlı ve seçim alanlarında kilit vardı; para ve yüzde alanında
         yoktu. Sonuç: türetilmiş bir tutar (kalemlerden hesaplanan ara
         toplam) `readonly:true` bildirmesine rağmen düzenlenebiliyordu ve
         ekran kilidi kendi DOM'una elle yazmak zorunda kalıyordu — yani
         kural bileşende değil çağıranda yaşıyordu. [3.1.11] tam bunu
         yasaklıyor. */
      }else if(f.type === 'money'){
        inner = '<div class="f-affix"><input type="number" class="inp' + (salt ? ' is-readonly' : '') +
                '" id="' + id + '" name="' + f.key + '" value="' + esc(v) + '"' +
                (reqSabit ? ' required' : '') + (salt ? ' readonly aria-readonly="true"' : '') +
                ' min="0" step="1"><span class="f-suffix">' + esc(f.currency || '₺') + '</span></div>';
      }else if(f.type === 'percent'){
        inner = '<div class="f-affix"><input type="number" class="inp' + (salt ? ' is-readonly' : '') +
                '" id="' + id + '" name="' + f.key + '" value="' + esc(v) + '"' +
                (salt ? ' readonly aria-readonly="true"' : '') +
                ' min="0" max="100"><span class="f-suffix">%</span></div>';
      }else{
        var t = f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : f.type === 'email' ? 'email' :
                f.type === 'tel' ? 'tel' : f.type === 'url' ? 'url' : 'text';
        inner = '<input type="' + t + '" class="inp' + (salt ? ' is-readonly' : '') + '" id="' + id +
                '" name="' + f.key + '" value="' + esc(v) + '"' +
                (reqSabit ? ' required' : '') + (salt ? ' readonly aria-readonly="true"' : '') +
                (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') +
                (f.min != null ? ' min="' + f.min + '"' : '') + (f.max != null ? ' max="' + f.max + '"' : '') + '>';
      }

      return '<div class="field f-col-' + (f.cols || 6) + '" data-field="' + f.key + '"' +
        (f.showIf ? ' hidden' : '') + '>' +
        (f.type === 'switch' || f.type === 'checkbox' ? '' : '<label for="' + id + '">' + esc(f.label) + req + '</label>') +
        inner +
        (f.hint && f.type !== 'file' ? '<div class="f-hint">' + esc(f.hint) + '</div>' : '') +
        '<div class="f-err">' + ico('i-alert-circle','ic-sm') + '<span></span></div>' +
      '</div>';
    }

    /* ===================================================================
       SEKME VE SAĞ PANEL — şartname [3.1.4] · [3.1.5] · [3.1.15] (CLOUD TURU)
       -------------------------------------------------------------------
       Ölçülen kusur: motor yalnız düz bir `sections` döngüsü basıyordu.
       Ortak sekme bileşeni (`.gv-tabs`) 28 DETAY ekranında kullanılıyordu
       ama formların SIFIRINDA — çünkü form motoru onu hiç çağırmıyordu.
       Bu tek boşluk [3.1.6] (sekme ikonu), [3.1.12] (sekme bazlı hata özeti)
       ve [3.2.1] (sekme klavye erişilebilirliği) maddelerini de düşürüyordu.
       Sağ bağlam paneli de yoktu: 36 formdan 35'i tek sütun kart yığınıydı.

       İKİSİ DE OPSİYONEL. `cfg.tabs` verilmeyen form eski düz davranışında
       kalır — 36 formu aynı anda değiştirmek zorunda kalmadan geçiş yapılır.

       cfg.tabs  = [{ key, label, icon }]  · section.tab = <key>
       cfg.aside = function(record){ return html; }  → canlı sağ panel
       =================================================================== */
    var sekmeli = !!(cfg.tabs && cfg.tabs.length);
    var yanPanel = typeof cfg.aside === 'function';

    function sectionHtml(s){
      return '<div class="gv-form-sec"' + (s.tab ? ' data-tabsec="' + esc(s.tab) + '"' : '') + '>' +
        (s.title ? '<div class="gv-form-sec-head"><h3>' +
          (s.icon ? ico(s.icon, 'ic-sm') + ' ' : '') + esc(s.title) + '</h3>' +
          (s.desc ? '<p>' + esc(s.desc) + '</p>' : '') + '</div>' : '') +
        '<div class="gv-fields">' + (s.fields || []).map(fieldHtml).join('') + '</div></div>';
    }

    var html = '<form novalidate>' +
      '<div class="form-err-summary" role="alert"><span>' + ico('i-alert') + '</span>' +
      '<div><b>Form gönderilemedi.</b><ul></ul></div></div>';

    if(sekmeli){
      /* Sekme şeridi — `GV.tabs` ile aynı işaretleme ve aynı ARIA sözleşmesi.
         Detay ekranlarındakiyle birebir aynı dil; ikinci bir sekme dili yok. */
      html += '<div class="gv-tabs" role="tablist">' + cfg.tabs.map(function(t, i){
        return '<button type="button" class="gv-tab' + (i === 0 ? ' is-active' : '') + '"' +
          ' role="tab" id="ftab_' + esc(t.key) + '"' +
          ' aria-selected="' + (i === 0 ? 'true' : 'false') + '"' +
          ' aria-controls="fpanel_' + esc(t.key) + '"' +
          ' tabindex="' + (i === 0 ? '0' : '-1') + '" data-ftab="' + esc(t.key) + '">' +
          (t.icon ? ico(t.icon, 'ic-sm') : '') + '<span>' + esc(t.label) + '</span>' +
          '<span class="gv-tab-err" hidden aria-hidden="true"></span></button>';
      }).join('') + '</div>';

      /* Sekmesi belirtilmemiş bölüm KAYBOLMAZ — İLK panelin altına düşer.
         Sessizce yok saymak, alanı olmayan bir formu "tamam" gösterirdi.
         ⚠️ Bu güvenlik ağı ilk yazımında `html.replace('</div>', …)` ile
         kurulmuştu ve YANLIŞ YERE basıyordu: dizedeki ilk `</div>`, hata özeti
         bloğunun kapanışıdır — sekmesiz bölüm formun görünmez uyarı kutusunun
         İÇİNE düşüyordu. Kusur hiç görülmedi çünkü göç eden ilk dört formun
         dördü de her bölüme `tab` verdi; yani kural yazılıydı ama hiç
         çalışmamıştı (ders L-31'in aynı sınıfı). Artık panel içeriği tek yerde,
         dize oyunu olmadan kuruluyor. */
      cfg.tabs.forEach(function(t, i){
        var icerik = (cfg.sections || []).filter(function(s){
          return s.tab === t.key || (i === 0 && !s.tab);
        });
        html += '<div class="gv-tabpanel" role="tabpanel" id="fpanel_' + esc(t.key) + '"' +
          ' aria-labelledby="ftab_' + esc(t.key) + '"' + (i === 0 ? '' : ' hidden') + '>' +
          icerik.map(sectionHtml).join('') + '</div>';
      });
    }else{
      (cfg.sections || []).forEach(function(s){ html += sectionHtml(s); });
    }

    html += '</form>';

    if(yanPanel){
      mount.innerHTML = '<div class="gv-grid gv-grid-aside">' +
        '<div data-formmain></div>' +
        '<aside class="gv-aside" data-formaside></aside></div>';
      mount.querySelector('[data-formmain]').innerHTML = html;
    }else{
      mount.innerHTML = html;
    }

    var form = mount.querySelector('form');

    /* Sağ panel — şartname [3.1.15] "CANLI özetlesin" diyor. Her alan
       değişiminde yeniden çizilir; çağıran güncel değerleri `read()`'ten alır. */
    var asideEl = yanPanel ? mount.querySelector('[data-formaside]') : null;
    function cizAside(){
      if(!asideEl) return;
      try{ asideEl.innerHTML = cfg.aside(read(), api) || ''; }
      catch(e){ asideEl.innerHTML = GV.notice({ tone:'warn', title:'Özet çizilemedi', text:String(e.message || e) }); }
    }

    /* Sekme geçişi — klavye sözleşmesi `GV.tabs` ile aynı ([3.2.1]) */
    function sekmeGec(key, odak){
      Array.prototype.forEach.call(mount.querySelectorAll('[data-ftab]'), function(b){
        var aktif = b.dataset.ftab === key;
        b.classList.toggle('is-active', aktif);
        b.setAttribute('aria-selected', aktif ? 'true' : 'false');
        b.tabIndex = aktif ? 0 : -1;
        if(aktif && odak) b.focus();
      });
      Array.prototype.forEach.call(mount.querySelectorAll('.gv-tabpanel'), function(pn){
        pn.hidden = pn.id !== 'fpanel_' + key;
      });
    }
    if(sekmeli){
      var tabBtns = Array.prototype.slice.call(mount.querySelectorAll('[data-ftab]'));
      tabBtns.forEach(function(b, i){
        b.addEventListener('click', function(){ sekmeGec(b.dataset.ftab); });
        b.addEventListener('keydown', function(e){
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if(!d) return;
          e.preventDefault();
          var n = (i + d + tabBtns.length) % tabBtns.length;
          sekmeGec(tabBtns[n].dataset.ftab, true);
        });
      });
    }

    form.addEventListener('input', function(){ dirty = true; syncShowIf(); cizAside(); });
    form.addEventListener('change', function(){ dirty = true; syncShowIf(); cizAside(); });

    /* dosya alanı */
    Array.prototype.forEach.call(mount.querySelectorAll('[data-upload]'), function(u){
      var input = u.querySelector('input[type=file]');
      var list = u.parentElement.querySelector('[data-filelist]');
      function show(files){
        list.innerHTML = Array.prototype.map.call(files, function(f){
          return '<div class="gv-file"><span class="gv-file-ico">' + ico('i-file','ic-sm') + '</span>' +
            '<span class="gv-file-body"><span class="gv-file-name">' + esc(f.name) + '</span>' +
            '<span class="gv-file-meta">' + (f.size / 1024 > 1024 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.round(f.size / 1024) + ' KB') + '</span></span>' +
            '<button type="button" class="ia is-danger" data-rmfile aria-label="Kaldır">' + ico('i-x','ic-sm') + '</button></div>';
        }).join('');
      }
      u.addEventListener('click', function(){ input.click(); });
      u.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); input.click(); } });
      u.addEventListener('dragover', function(e){ e.preventDefault(); u.classList.add('is-over'); });
      u.addEventListener('dragleave', function(){ u.classList.remove('is-over'); });
      u.addEventListener('drop', function(e){
        e.preventDefault(); u.classList.remove('is-over');
        input.files = e.dataTransfer.files; show(input.files);
      });
      input.addEventListener('change', function(){ show(input.files); });
      list.addEventListener('click', function(e){
        if(e.target.closest('[data-rmfile]')){ e.target.closest('.gv-file').remove(); input.value = ''; }
      });
    });

    function allFields(){
      return (cfg.sections || []).reduce(function(a, s){ return a.concat(s.fields || []); }, []);
    }

    /* KOŞULLU ALAN (`showIf`) — bir alanın varlığı başka bir alanın değerine
       bağlıysa bu karar BİLEŞENDE verilir, ekranda değil. Sözleşme:
         · `showIf(data)` false ise alan `hidden`'dır,
         · gizli alan DOĞRULANMAZ (`required` tetiklenmez) — yoksa kullanıcının
           göremediği bir alan formu kilitlerdi,
         · gizli alan `read()`'te BOŞ döner: görünmeyen alan formun parçası
           değildir, eski değeri sessizce kayda yazılmaz.
       Alan `hidden` ile gizlenir (`.field[hidden]` ui.css'te), ekranın kendi
       `<style>` bloğu ya da `display` yazması gerekmez (§8 yasağı). */
    var kosullu = allFields().filter(function(f){ return typeof f.showIf === 'function'; });
    function syncShowIf(){
      if(!kosullu.length) return;
      var data = read();
      kosullu.forEach(function(f){
        var wrap = mount.querySelector('[data-field="' + f.key + '"]');
        if(!wrap) return;
        var goster = !!f.showIf(data);
        wrap.hidden = !goster;
        if(!goster) wrap.classList.remove('is-invalid');
      });
    }

    function validate(){
      var errs = [];
      allFields().forEach(function(f){
        var wrap = mount.querySelector('[data-field="' + f.key + '"]');
        if(!wrap) return;
        if(wrap.hidden) return;                    /* gizli alan doğrulanmaz */
        var el = wrap.querySelector('input,select,textarea');
        if(!el) return;
        wrap.classList.remove('is-invalid');
        /* Radyoda `el` grubun İLK düğmesidir; `.value` her zaman dolu olduğu için
           `required` hiç tetiklenmezdi. Seçili olanı `read()` ile aynı yordamla oku. */
        var val = el.type === 'checkbox' ? el.checked
                : el.type === 'radio'
                    ? ((wrap.querySelector('input[type=radio]:checked') || {}).value || '')
                    : el.value;
        var msg = '';

        var zorunlu = typeof f.required === 'function' ? !!f.required(read()) : !!f.required;
        if(zorunlu && (val === '' || val == null || val === false)) msg = f.label + ' zorunlu alandır.';
        else if(val && f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) msg = 'Geçerli bir e-posta adresi girin.';
        else if(val && f.type === 'tel' && String(val).replace(/\D/g,'').length < 10) msg = 'Telefon numarası en az 10 haneli olmalıdır.';
        /* ⚠️ ŞEMASIZ ADRES KABUL EDİLİR. Eski kural `http(s)://` dayatıyordu
           ve ölçüldü: 12 müşteri kaydının 12'si web adresini şemasız tutuyor
           (`denizlojistik.com`), yani MEVCUT HER KAYDIN DÜZENLENMESİ
           kilitleniyordu — doğrulama var olan veriyi geçersiz ilan ediyordu.
           Kural, adresin ŞEKLİNE bakar: en az bir nokta ve boşluksuz gövde.
           Şema eklemek görüntüleme tarafının işidir, kullanıcının değil. */
        else if(val && f.type === 'url' &&
                !/^(https?:\/\/)?[^\s/$.?#][^\s]*\.[^\s.]{2,}(\/[^\s]*)?$/i.test(String(val).trim()))
          msg = 'Geçerli bir web adresi girin (örnek: gaviaworks.com).';
        else if(val && f.min != null && Number(val) < f.min) msg = 'En küçük değer ' + f.min + '.';
        else if(val && f.max != null && Number(val) > f.max) msg = 'En büyük değer ' + f.max + '.';
        else if(f.validate){
          var data = read();
          msg = f.validate(val, data) || '';
        }

        if(msg){
          wrap.classList.add('is-invalid');
          wrap.querySelector('.f-err span').textContent = msg;
          errs.push({ key:f.key, msg:msg });
        }
      });

      var sum = mount.querySelector('.form-err-summary');
      sum.classList.toggle('is-on', errs.length > 0);

      /* SEKME BAZLI HATA ÖZETİ — şartname [3.1.12]. Hatalı alan gizli bir
         sekmedeyse kullanıcı listeyi okur ama alanı GÖREMEZ; hangi sekmede
         olduğu yazılır ve sekme rozeti sayıyı gösterir. */
      var alanTab = {};
      if(sekmeli) (cfg.sections || []).forEach(function(sec){
        (sec.fields || []).forEach(function(f){ alanTab[f.key] = sec.tab || null; });
      });
      var tabAd = {};
      (cfg.tabs || []).forEach(function(t){ tabAd[t.key] = t.label; });
      var tabSayi = {};
      errs.forEach(function(e){ var k = alanTab[e.key]; if(k) tabSayi[k] = (tabSayi[k] || 0) + 1; });

      sum.querySelector('ul').innerHTML = errs.map(function(e){
        var k = alanTab[e.key];
        return '<li>' + esc(e.msg) +
          (k && tabAd[k] ? ' <span class="u-faint">— ' + esc(tabAd[k]) + ' sekmesi</span>' : '') +
          '</li>';
      }).join('');

      if(sekmeli) Array.prototype.forEach.call(mount.querySelectorAll('[data-ftab]'), function(b){
        var n = tabSayi[b.dataset.ftab] || 0;
        var rozet = b.querySelector('.gv-tab-err');
        if(!rozet) return;
        rozet.hidden = !n;
        rozet.textContent = n ? String(n) : '';
        b.classList.toggle('has-err', !!n);
      });

      if(errs.length){
        /* İlk hatalı alanın sekmesine GEÇ, sonra odaklan — gizli alana
           odaklanmak kullanıcıyı boş ekrana bakar hâlde bırakırdı. */
        var ilkTab = alanTab[errs[0].key];
        if(sekmeli && ilkTab) sekmeGec(ilkTab);
        var first = mount.querySelector('[data-field="' + errs[0].key + '"] input, [data-field="' + errs[0].key + '"] select, [data-field="' + errs[0].key + '"] textarea');
        if(first){ first.focus(); sum.scrollIntoView({ behavior:'smooth', block:'center' }); }
      }
      return errs;
    }

    function read(){
      var out = {};
      allFields().forEach(function(f){
        var el = mount.querySelector('[name="' + f.key + '"]');
        if(!el) return;
        var wrap = el.closest('[data-field]');
        if(wrap && wrap.hidden){ out[f.key] = el.type === 'checkbox' ? false : ''; return; }
        if(el.type === 'checkbox') out[f.key] = el.checked;
        else if(el.type === 'radio') { var c = mount.querySelector('[name="' + f.key + '"]:checked'); out[f.key] = c ? c.value : ''; }
        else out[f.key] = el.value;
      });
      return out;
    }

    /* Kaydetmeden çıkış uyarısı. `window` kalıcı düğümdür: her `GV.refresh()` sonrası
       yeniden bağlanırsa dinleyici birikir (ders L-16). Bu yüzden `GV.on` ile tekil
       anahtar üzerinden bağlanır — aynı anahtar ikinci kez gelince öncekini söker.
       Anahtar mount'a özgüdür ki aynı sayfadaki iki form birbirini sökmesin. */
    var dirtyKey = 'gvform.dirty.' + (cfg.id || cfg.mount || 'form');
    if(GV.on){
      GV.on(window, 'beforeunload', function(e){
        if(dirty){ e.preventDefault(); e.returnValue = ''; }
      }, dirtyKey);
    }

    syncShowIf();                                  /* açılıştaki ilk hüküm */
    cizAside();                                    /* sağ panelin ilk çizimi */

    var api = {
      validate:validate,
      read:read,
      el:mount,
      sync:syncShowIf,                             /* ekran alanı dışarıdan yazdıysa */
      isDirty:function(){ return dirty; },
      submit:function(){
        var errs = validate();
        if(errs.length){ GV.toast(errs.length + ' alan hatalı — kontrol edin', 'danger'); return null; }
        dirty = false;
        return read();
      },
      setDirty:function(v){ dirty = v; },
      /* Sekmeli formda dışarıdan sekme değiştirme */
      tab:function(key){ if(sekmeli) sekmeGec(key); },
      /* Sağ paneli elle tazeleme — ekran alanı dışarıdan yazdıysa */
      aside:cizAside
    };
    return api;
  };

  /* ===================================================================
     7b. KAYIT SONRASI YÖNLENDİRME — `GV.afterSave` (şartname [3.1.16])
     -------------------------------------------------------------------
     ÖLÇÜLEN DURUM: 38 formun tamamı kaydettikten sonra LİSTEYE dönüyordu ve
     bu, kodda yorum satırı olarak kurallaştırılmıştı:
       /* location.reload() YASAK — normal akış listeye dönmektir. * /
     Yorumun DOĞRU yarısı `location.reload()` yasağıdır (L-15: mock veri
     bellekte durur, yeniden yükleme mutasyonu siler) ve YERİNDE DURUYOR.
     Yanlış yarısı "normal akış listeye dönmektir" hükmüydü: şartname
     [3.1.16] kaydedilen kaydın DETAYINA gidilmesini ve o kayıtla birlikte
     otomatik doğan alt kayıtların bağlantılarının gösterilmesini istiyor.
     Bu paket o karşı-kararı gerekçesiyle tersine çevirir (`lessons.md` L-40).

     NEDEN ORTAK YORDAM: kural 38 ayrı `kaydet()` sonunda yaşarsa 38 ayrı
     yerde "detay var mı · yetki var mı · alt kayıt nasıl gösterilir"
     sorusuna ayrı cevap verilir; biri diğerinden sessizce ayrılır (L-23'ün
     aynısı). Karar TEK yordamda:
       · hedef detay ekranı YAYINDA değilse   → listeye dönülür,
       · kullanıcının o dosyaya yetkisi yoksa → listeye dönülür,
       · ikisi de varsa                        → `detay?id=KOD`.
     Dönen değer (`'detay'` / `'liste'`) çağırana bildirilir ki ölçüm ekseni
     kararı okuyabilsin; sessiz bir düşüş "detaya gitti" sanılmasın.

     ALT KAYIT BAĞLANTILARI: hedef sayfa 26 ayrı detay ekranıdır; her birine
     "az önce ne oluştu" bloğu yazmak 26 kopya demekti. Bunun yerine mesaj
     iskeletteki `#gvFlash` şeridine bırakılır (shell.js) ve hedef sayfa
     açılınca BİR KEZ okunup silinir. Şerit sayfa içeriğinin dışındadır:
     ekranın kendi mount'unu yeniden çizmesi ya da `GV.refresh()` onu silmez.
     =================================================================== */
  var FLASH_KEY = 'gv.aftersave';

  GV.afterSave = function(cfg){
    cfg = cfg || {};
    var kod   = cfg.kod || '';
    var liste = cfg.liste || '';
    var detay = cfg.detay || '';
    var hedef = liste, karar = 'liste';

    if(detay && kod && GV.shell && GV.shell.ekranAcilabilir && GV.shell.ekranAcilabilir(detay)){
      hedef = detay + (detay.indexOf('?') === -1 ? '?' : '&') + 'id=' + encodeURIComponent(kod);
      karar = 'detay';
    }
    if(!hedef) return karar;                     /* çağıran hedef vermediyse gitme */

    var alt = (cfg.alt || []).filter(function(a){ return a && a.label; });
    if(kod || alt.length){
      try{
        sessionStorage.setItem(FLASH_KEY, JSON.stringify({
          kod:kod, yeni:!!cfg.yeni, mesaj:cfg.mesaj || '', alt:alt,
          hedef:hedef.split('?')[0], karar:karar
        }));
      }catch(e){ /* depolama kapalıysa şerit basılmaz, yönlendirme yine olur */ }
    }
    /* ⚠️ YUMUŞAK GEÇİŞ — `location.href` bellekteki kaydı SİLER.
       Ölçülen kusur (teklif sürümleme turunda): revizyon açılıyor, yeni kayıt
       `DB.quotes`e giriyor, sonra bu yordam tam sayfa yüklemesi yapıyor ve
       veri dosyaları yeniden koşuyor — yani az önce üretilen kayıt yok oluyor.
       Kullanıcı hedefte yeşil "TKL-… oluşturuldu" şeridiyle BİRLİKTE
       "kayıt bulunamadı" hatasını görüyordu. L-15 `location.reload()`u tam bu
       gerekçeyle yasaklamıştı; `location.href` aynı dosyaya giderken aynı şey.

       Hedef AYNI DOSYA ise (yalnız `?id=` değişiyorsa) sayfa hiç yeniden
       yüklenmez: adres `replaceState` ile güncellenir ve `GV.refresh()`
       ekranı taze veriyle yeniden çizer. Farklı dosyaya giden yönlendirme
       eskisi gibi kalır — orada kaybın kaynağı prototipin kendisidir ve
       ekranlar bunu backend payında beyan eder. */
    var suanki = location.pathname.split('/').pop();
    var hedefDosya = hedef.split('?')[0].split('#')[0];
    if(hedefDosya === suanki && GV.refresh){
      setTimeout(function(){
        history.replaceState({}, '', hedef);
        GV.refresh();
      }, cfg.gecikme != null ? cfg.gecikme : 400);
      return karar + '-yumusak';
    }
    setTimeout(function(){ location.href = hedef; }, cfg.gecikme != null ? cfg.gecikme : 700);
    return karar;
  };

  /* Şeridi bas — hedef sayfa açıldığında, bir kez. */
  function cizFlash(){
    var host = document.getElementById('gvFlash');
    if(!host) return;
    var ham = null;
    try{ ham = sessionStorage.getItem(FLASH_KEY); }catch(e){ return; }
    if(!ham) return;
    try{ sessionStorage.removeItem(FLASH_KEY); }catch(e){}      /* tek kullanımlık */
    var f;
    try{ f = JSON.parse(ham); }catch(e){ return; }
    /* Yanlış sayfaya düşmüş şerit basılmaz: kullanıcı yönlendirmeyi iptal edip
       başka bir ekrana gitmiş olabilir. Kayıt zaten silindi, iz bırakmaz. */
    if(f.hedef && f.hedef !== location.pathname.split('/').pop()) return;

    host.innerHTML = GV.notice({
      tone:'ok',
      icon:f.yeni ? 'i-plus' : 'i-check-circle',
      title:(f.kod ? f.kod + ' ' : '') + (f.yeni ? 'oluşturuldu' : 'güncellendi'),
      text:f.mesaj || (f.karar === 'detay'
        ? 'Kaydın detay ekranındasınız; alanları buradan görüntüleyebilirsiniz.'
        : 'Bu kayıt türünün detay ekranı henüz yayında değil, listeye dönüldü.'),
      actions:(f.alt || []).map(function(a){
        return { label:a.label, href:a.href, cls:a.cls || 'btn-line' };
      })
    });
  }
  document.addEventListener('gv:ready', cizFlash);

  /* ===================================================================
     8. AKTİVİTE TIMELINE / ONAY ZİNCİRİ
     =================================================================== */
  GV.activity = function(items){
    if(!items || !items.length){
      return GV.empty({ icon:'i-activity', title:'Henüz hareket yok', desc:'Bu kayıt üzerinde yapılan tüm değişiklikler burada listelenir.' });
    }
    /* `kisi` KİŞİ KODUDUR, ad değil (VB-12). Ad koleksiyonun kendisinde tutulur;
       burada çözülür ki ad değişince timeline sessizce eskimesin. `EMP-*` personel,
       `YTK-*` müşteri yetkilisidir. Kod olmayan bir değer geldiğinde olduğu gibi
       basılır — eski çağıranı kırmamak için, ama bu yol `canon.js` eksen 22b ile
       veri tarafında, `pers.js` ile ekran tarafında YASAKLANMIŞTIR. */
    var kisiAd = function(v){
      if(!v) return '—';
      if(/^EMP-/.test(v) && window.DB && DB.empName)     return DB.empName(v);
      if(/^YTK-/.test(v) && window.DB && DB.contactName) return DB.contactName(v);
      return v;
    };
    return '<div class="gv-timeline">' + items.map(function(a){
      return '<div class="gv-tl-item">' +
        '<span class="gv-tl-dot is-' + (a.tone || 'neutral') + '">' + ico(a.icon || 'i-dot','ic-sm') + '</span>' +
        '<div class="gv-tl-head"><span class="gv-tl-who">' + esc(kisiAd(a.kisi)) + '</span>' +
        '<span class="gv-tl-when">' + Fmt.dt(a.tarih) + '</span></div>' +
        '<div class="gv-tl-text">' + esc(a.metin) + '</div>' +
        (a.eski != null || a.yeni != null
          ? '<div class="gv-tl-diff"><span class="old">' + esc(a.eski || '—') + '</span>' + ico('i-arrow-right','ic-sm') +
            '<span class="new">' + esc(a.yeni || '—') + '</span></div>' : '') +
      '</div>';
    }).join('') + '</div>';
  };

  /* UID-17 — ALAN LİSTESİ. `.gv-dl` yalnız CSS olarak vardı; JS karşılığı olmadığı
     için **on iki ekran** kendi `dl(pairs)` üreticisini yazdı ve kararlar ayrıştı:
     bir kısmı `dt`yi escape ediyordu (para ekseni işareti `<span class="u-faint">
     (KDV hariç)</span>` ekranda HAM METİN olarak göründü — ders L-14), bir kısmı
     etmiyordu; `app-ajanda` boş satırı hiç basmıyordu, diğerleri `—` basıyordu.

     SÖZLEŞME: `dt` de `dd` de **çağıranın kurduğu işaretlemedir** — veri tarafını
     çağıran `esc()` ile kendisi geçirir; bileşen escape ETMEZ, çünkü etiketler
     bilinçli işaretleme (birim eki, ipucu) taşıyabilir. Boş değer TEK yerde
     `.is-empty` + `—` alır. `skipEmpty:true` boş satırı hiç basmaz. */
  GV.dl = function(pairs, opts){
    opts = opts || {};
    var list = (pairs || []).filter(function(p){
      if(!p) return false;
      if(!opts.skipEmpty) return true;
      return p[1] != null && p[1] !== '';
    });
    if(!list.length) return '';
    return '<dl class="gv-dl' + (opts.cls ? ' ' + opts.cls : '') + '">' + list.map(function(p){
      var bos = p[1] == null || p[1] === '';
      return '<div><dt>' + p[0] + '</dt><dd' + (bos ? ' class="is-empty"' : '') + '>' +
        (bos ? '—' : p[1]) + '</dd></div>';
    }).join('') + '</dl>';
  };

  GV.chain = function(steps){
    return '<div class="gv-chain">' + (steps || []).map(function(s){
      var st = s.durum === 'Onaylandı' ? 'ok' : s.durum === 'Reddedildi' ? 'danger' :
               s.durum === 'Bekliyor' ? 'wait' : 'idle';
      var icn = st === 'ok' ? 'i-check-circle' : st === 'danger' ? 'i-x-circle' : st === 'wait' ? 'i-clock' : 'i-dot';
      return '<div class="gv-chain-step is-' + st + '">' +
        '<div class="gv-chain-top"><span class="gv-chain-ico">' + ico(icn,'ic-sm') + '</span>' +
        '<span class="gv-chain-role">' + esc(s.rol) + '</span></div>' +
        '<div class="gv-chain-who">' + esc(s.kisi || 'Atanmadı') + '</div>' +
        '<div class="gv-chain-when">' + (s.tarih ? Fmt.dt(s.tarih) : esc(s.durum)) + '</div>' +
        (s.not ? '<div class="gv-chain-note">' + esc(s.not) + '</div>' : '') +
      '</div>';
    }).join('') + '</div>';
  };

  /* ===================================================================
     8b. BELGE ÇIKTISI — GV.doc(cfg)
     Bir KAYITTAN türetilmiş yazılı belge üretir (liste çıktısı değildir; o
     `GV.list` şeridinin işidir). Ön analizin §10'da istediği on çıktı bunun
     üstünde kurulur, ama bileşen kayıt türü bilmez.

       cfg.baslik   → belge başlığı
       cfg.altBilgi → başlığın altındaki tek satır künye
       cfg.bolumler → [{ h:'Başlık', dl:[[etiket, değer]] | liste:[...] |
                         tablo:{ head:[], rows:[[]] } | metin:'...' }]

     Dönen yüzey: { html(), onizle(), yazdir() }
       · onizle() → modalde ekranda gösterir
       · yazdir() → ayrı pencerede yazdırma/PDF (GV.list çıktısıyla aynı biçim)
     Boş bölüm BASILMAZ; değeri olmayan alan "—" yerine hiç yazılmaz, böylece
     belge olmayan bilgiyi varmış gibi göstermez (L-13).
     =================================================================== */
  GV.doc = function(cfg){
    cfg = cfg || {};
    var bolumler = (cfg.bolumler || []).filter(function(b){
      if(!b) return false;
      if(b.dl)    return b.dl.filter(function(r){ return r && r[1] != null && r[1] !== ''; }).length > 0;
      if(b.liste) return (b.liste || []).length > 0;
      if(b.tablo) return (b.tablo.rows || []).length > 0;
      return !!b.metin;
    });

    function govde(){
      return bolumler.map(function(b){
        var ic = '';
        if(b.dl){
          ic = '<dl class="gv-doc-dl">' + b.dl.filter(function(r){
            return r && r[1] != null && r[1] !== '';
          }).map(function(r){
            return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(String(r[1])) + '</dd></div>';
          }).join('') + '</dl>';
        }else if(b.liste){
          ic = '<ul class="gv-doc-list">' + b.liste.map(function(x){
            return '<li>' + esc(String(x)) + '</li>'; }).join('') + '</ul>';
        }else if(b.tablo){
          ic = '<table class="gv-doc-table"><thead><tr>' +
            b.tablo.head.map(function(h){ return '<th>' + esc(h) + '</th>'; }).join('') +
            '</tr></thead><tbody>' + b.tablo.rows.map(function(r){
              return '<tr>' + r.map(function(c){ return '<td>' + esc(String(c == null ? '' : c)) + '</td>'; }).join('') + '</tr>';
            }).join('') + '</tbody></table>';
        }else{
          ic = '<p class="gv-doc-p">' + esc(b.metin) + '</p>';
        }
        return '<section class="gv-doc-sec"><h3>' + esc(b.h) + '</h3>' + ic + '</section>';
      }).join('');
    }

    function html(){
      return '<article class="gv-doc">' +
        '<header class="gv-doc-head"><h2>' + esc(cfg.baslik || 'Belge') + '</h2>' +
        (cfg.altBilgi ? '<p>' + esc(cfg.altBilgi) + '</p>' : '') + '</header>' +
        (bolumler.length ? govde()
          : '<p class="gv-doc-p">Bu belgeyi dolduracak alan kayıtta boş.</p>') +
      '</article>';
    }

    function yazdir(){
      var w = window.open('', '_blank');
      if(!w){ GV.toast('Açılır pencere engellendi', 'danger'); return; }
      w.document.write('<html><head><meta charset="utf-8"><title>' + esc(cfg.baslik || 'Belge') + '</title>' +
        '<style>body{font-family:system-ui,sans-serif;padding:28px;color:#101426;max-width:840px}' +
        'h2{font-size:19px;margin:0 0 4px}h3{font-size:13px;margin:20px 0 7px;text-transform:uppercase;' +
        'letter-spacing:.04em;color:#5B6379;border-bottom:1px solid #E3E7EE;padding-bottom:5px}' +
        '.gv-doc-head p{color:#6A7189;font-size:12px;margin:0 0 6px}' +
        'dl{margin:0;display:grid;grid-template-columns:200px 1fr;gap:5px 14px;font-size:12px}' +
        'dl > div{display:contents}dt{color:#6A7189}dd{margin:0;color:#101426}' +
        'ul{margin:0;padding-left:18px;font-size:12px}li{margin:3px 0}' +
        'p{font-size:12px;line-height:1.55}' +
        'table{width:100%;border-collapse:collapse;font-size:11px;margin-top:4px}' +
        'th{background:#EDF0F5;text-align:left;padding:6px;border:1px solid #E3E7EE;font-size:10px;text-transform:uppercase}' +
        'td{padding:6px;border:1px solid #E3E7EE}' +
        'footer{margin-top:26px;padding-top:10px;border-top:1px solid #E3E7EE;color:#6A7189;font-size:10px}' +
        '</style></head><body>' + html().replace(/class="[^"]*"/g, '') +
        '<footer>Gavia Works · ' + Fmt.date(window.DB ? DB.today : '') +
        ' · bu belge kayıttan türetilmiştir, ayrıca saklanmaz.</footer>' +
        '</body></html>');
      w.document.close();
      setTimeout(function(){ w.print(); }, 300);
    }

    function onizle(){
      GV.modal({
        title:cfg.baslik || 'Belge', icon:cfg.ikon || 'i-file', size:'lg',
        text:cfg.altBilgi || '',
        body:'<div class="gv-doc-wrap">' + html() + '</div>',
        actions:[{ label:'Kapat', cls:'btn-line' },
          { label:'Yazdır / PDF', cls:'btn-acc', icon:'i-printer', close:false,
            onClick:function(){ yazdir(); return false; } }]
      });
    }

    return { html:html, onizle:onizle, yazdir:yazdir, bolumSayisi:bolumler.length };
  };

  /* ===================================================================
     9. BASİT SVG GRAFİKLER
     =================================================================== */
  var Chart = {
    /* data: [{label, value, value2?, tone?}]
       value2 verilirse aynı slotta ikinci (karşılaştırma) çubuğu çizilir — bütçe/maliyet gibi.
       opt.money:true → eksen ve ipucu para biçiminde. opt.series:['Bütçe','Maliyet'] legend için. */
    bar:function(data, opt){
      opt = opt || {};
      data = (data || []).filter(Boolean);
      if(!data.length) return GV.empty({ icon:'i-chart-bar', title:'Grafik için veri yok',
        desc:'Seçili filtrelerde bu grafiği çizecek kayıt bulunmuyor.' });
      var w = opt.width || 640, h = opt.height || 220, pad = 32, padL = opt.padL || (opt.money ? 62 : 48);
      var paired = data.some(function(d){ return d.value2 != null; });
      var fmtV = opt.money ? Fmt.moneyK : Fmt.num;
      var vals = data.map(function(d){ return d.value; }).concat(paired ? data.map(function(d){ return d.value2 || 0; }) : []);
      var max = Math.max.apply(null, vals.concat([1]));
      var bw = (w - padL - pad) / data.length;
      var svg = '<svg class="gv-chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(opt.label || 'Sütun grafik') + '">';
      for(var g = 0; g <= 4; g++){
        var y = pad + (h - pad * 2) * (g / 4);
        svg += '<line class="gridline" x1="' + padL + '" y1="' + y + '" x2="' + (w - pad) + '" y2="' + y + '"/>';
        svg += '<text class="lbl" x="' + (padL - 8) + '" y="' + (y + 4) + '" text-anchor="end">' +
               fmtV(Math.round(max * (1 - g / 4))) + '</text>';
      }
      data.forEach(function(d, i){
        var slot = padL + i * bw;
        var bwid = paired ? bw * 0.30 : bw * 0.64;
        var x1 = paired ? slot + bw * 0.12 : slot + bw * 0.18;
        function drawBar(val, x, cls){
          var bh = (h - pad * 2) * ((val || 0) / max);
          svg += '<rect class="bar' + cls + '" x="' + x + '" y="' + (h - pad - bh) +
                 '" width="' + bwid + '" height="' + Math.max(2, bh) + '" rx="4"><title>' +
                 esc(d.label) + ': ' + fmtV(val || 0) + '</title></rect>';
          if(opt.showValues !== false && !paired)
            svg += '<text class="val" x="' + (x + bwid / 2) + '" y="' + (h - pad - bh - 6) + '" text-anchor="middle">' + fmtV(val || 0) + '</text>';
        }
        drawBar(d.value, x1, d.tone ? ' is-' + d.tone : '');
        if(paired) drawBar(d.value2, x1 + bwid + bw * 0.06, ' is-2');
        svg += '<text class="lbl" x="' + (slot + bw / 2) + '" y="' + (h - pad + 16) + '" text-anchor="middle">' + esc(d.label) + '</text>';
      });
      return svg + '</svg>';
    },

    line:function(series, labels, opt){
      opt = opt || {};
      /* boş seri / boş etiket çizdirilmez — çağıran her yerde kontrol etmek zorunda kalmasın */
      series = (series || []).filter(function(s){ return s && s.values && s.values.length; });
      labels = labels || [];
      if(!series.length || !labels.length) return GV.empty({ icon:'i-chart-bar', title:'Grafik için veri yok',
        desc:'Seçili filtrelerde bu grafiği çizecek kayıt bulunmuyor.' });
      var w = opt.width || 640, h = opt.height || 220, pad = 32, padL = 52;
      var all = series.reduce(function(a, s){ return a.concat(s.values); }, []);
      var max = Math.max.apply(null, all.concat([1]));
      var stepX = (w - padL - pad) / Math.max(1, labels.length - 1);
      var svg = '<svg class="gv-chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(opt.label || 'Çizgi grafik') + '">';
      for(var g = 0; g <= 4; g++){
        var y = pad + (h - pad * 2) * (g / 4);
        svg += '<line class="gridline" x1="' + padL + '" y1="' + y + '" x2="' + (w - pad) + '" y2="' + y + '"/>';
        svg += '<text class="lbl" x="' + (padL - 8) + '" y="' + (y + 4) + '" text-anchor="end">' +
               (opt.money ? Fmt.moneyK(Math.round(max * (1 - g / 4))) : Fmt.num(Math.round(max * (1 - g / 4)))) + '</text>';
      }
      series.forEach(function(s, si){
        var pts = s.values.map(function(v, i){
          return [padL + i * stepX, h - pad - (h - pad * 2) * (v / max)];
        });
        var d = pts.map(function(p, i){ return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
        if(si === 0 && opt.area !== false){
          svg += '<path class="area" d="' + d + ' L' + pts[pts.length-1][0].toFixed(1) + ' ' + (h - pad) + ' L' + pts[0][0].toFixed(1) + ' ' + (h - pad) + ' Z"/>';
        }
        svg += '<path class="line' + (si ? ' is-2' : '') + '" d="' + d + '"/>';
        pts.forEach(function(p, i){
          svg += '<circle class="pt" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.4"><title>' +
                 esc(labels[i]) + ': ' + (opt.money ? Fmt.money(s.values[i]) : Fmt.num(s.values[i])) + '</title></circle>';
        });
      });
      labels.forEach(function(l, i){
        svg += '<text class="lbl" x="' + (padL + i * stepX) + '" y="' + (h - pad + 16) + '" text-anchor="middle">' + esc(l) + '</text>';
      });
      return svg + '</svg>';
    },

    donut:function(data, opt){
      opt = opt || {};
      data = (data || []).filter(function(d){ return d && d.value; });
      if(!data.length) return GV.empty({ icon:'i-chart-bar', title:'Grafik için veri yok',
        desc:'Seçili filtrelerde bu grafiği çizecek kayıt bulunmuyor.' });
      var size = opt.size || 200, r = size / 2 - 12, cx = size / 2, cy = size / 2, sw = opt.thickness || 26;
      var total = data.reduce(function(a, d){ return a + d.value; }, 0) || 1;
      var colors = ['var(--acc-ink)','var(--info)','var(--purple)','var(--warn)','var(--danger)','var(--ok)','var(--neutral)'];
      var off = 0;
      var circ = 2 * Math.PI * r;
      var svg = '<svg class="gv-chart" viewBox="0 0 ' + size + ' ' + size + '" style="max-width:' + size + 'px" role="img" aria-label="' + esc(opt.label || 'Halka grafik') + '">';
      data.forEach(function(d, i){
        var len = circ * (d.value / total);
        svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + (d.color || colors[i % colors.length]) +
               '" stroke-width="' + sw + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (circ - len).toFixed(2) +
               '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"><title>' +
               esc(d.label) + ': ' + Fmt.num(d.value) + '</title></circle>';
        off += len;
      });
      if(opt.center){
        svg += '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" class="val" style="font-size:22px">' + esc(opt.center) + '</text>';
        if(opt.centerSub) svg += '<text x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle" class="lbl">' + esc(opt.centerSub) + '</text>';
      }
      return svg + '</svg>';
    },

    legend:function(data){
      var colors = ['var(--acc-ink)','var(--info)','var(--purple)','var(--warn)','var(--danger)','var(--ok)','var(--neutral)'];
      return '<div class="gv-legend">' + data.map(function(d, i){
        return '<span class="gv-legend-item"><span class="gv-legend-swatch" style="background:' +
               (d.color || colors[i % colors.length]) + '"></span>' + esc(d.label) + ' · <b>' + Fmt.num(d.value) + '</b></span>';
      }).join('') + '</div>';
    },

    spark:function(values, opt){
      opt = opt || {};
      var w = opt.width || 120, h = opt.height || 32;
      var max = Math.max.apply(null, values.concat([1])), min = Math.min.apply(null, values);
      var span = (max - min) || 1;
      var d = values.map(function(v, i){
        var x = i * (w / Math.max(1, values.length - 1));
        var y = h - 2 - (h - 4) * ((v - min) / span);
        return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }).join(' ');
      return '<svg class="gv-chart" viewBox="0 0 ' + w + ' ' + h + '" style="width:' + w + 'px;height:' + h + 'px">' +
             '<path class="line" style="stroke-width:1.8" d="' + d + '"/></svg>';
    }
  };
  GV.chart = Chart;

  /* ===================================================================
     9c. DOSYA YÜKLEME — GV.upload(cfg)
     Form dışında da kullanılabilen bağımsız yükleme alanı.
     GV.upload({ mount, accept, multiple, maxMB, hint, files:[{ad,boyut}], onChange })
     → { files(), clear(), el }
     =================================================================== */
  GV.upload = function(cfg){
    cfg = cfg || {};
    var host = typeof cfg.mount === 'string' ? document.querySelector(cfg.mount) : cfg.mount;
    if(!host) return null;
    var maxMB = cfg.maxMB || 20;
    var picked = (cfg.files || []).slice();

    host.innerHTML =
      '<div class="gv-upload" data-gvup tabindex="0" role="button" aria-label="Dosya seçin veya sürükleyip bırakın">' +
        ico('i-upload','ic-lg') +
        '<div class="gv-upload-title">' + esc(cfg.title || 'Dosya seçin veya sürükleyip bırakın') + '</div>' +
        '<div class="gv-upload-hint">' + esc(cfg.hint || 'PDF, DOCX, XLSX, PNG, JPG · en fazla ' + maxMB + ' MB') + '</div>' +
        '<input type="file" hidden' + (cfg.multiple === false ? '' : ' multiple') +
          (cfg.accept ? ' accept="' + esc(cfg.accept) + '"' : '') + '>' +
      '</div><div class="gv-filelist" data-gvuplist></div>';

    var zone = host.querySelector('[data-gvup]');
    var input = zone.querySelector('input[type=file]');
    var list = host.querySelector('[data-gvuplist]');

    function sizeText(b){ return b == null ? '' : (b / 1024 > 1024 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB'); }
    function draw(){
      list.innerHTML = picked.map(function(f, i){
        return '<div class="gv-file"><span class="gv-file-ico">' + ico('i-file','ic-sm') + '</span>' +
          '<span class="gv-file-body"><span class="gv-file-name">' + esc(f.ad) + '</span>' +
          '<span class="gv-file-meta">' + esc(sizeText(f.boyut)) + '</span></span>' +
          '<button type="button" class="ia is-danger" data-rm="' + i + '" aria-label="Kaldır">' + ico('i-x','ic-sm') + '</button></div>';
      }).join('');
      if(cfg.onChange) cfg.onChange(picked);
    }
    /* UID-04 — `onChange` yalnız `{ad, boyut}` veriyordu; gerçek `File` nesnesi
       dışarı hiç çıkmıyordu. Önizleme yapmak isteyen ekran (logo, profil fotoğrafı)
       mount üzerine **capture fazlı `change` dinleyicisi** takmak zorunda kalıyordu —
       bileşenin iç işleyişine sızan bir çözüm. `onFile(file, meta)` her kabul edilen
       dosya için çağrılır. `preview:true` verilirse bileşen önizlemeyi `.gv-thumb`
       ile KENDİSİ basar (UID-03) ve ekranın FileReader yazmasına gerek kalmaz. */
    function accept(fileList){
      Array.prototype.forEach.call(fileList, function(f){
        if(f.size > maxMB * 1048576){ GV.toast('“' + f.name + '” ' + maxMB + ' MB sınırını aşıyor.', 'danger'); return; }
        var meta = { ad:f.name, boyut:f.size, tur:f.type };
        picked.push(meta);
        if(cfg.onFile) cfg.onFile(f, meta);
        if(cfg.preview && /^image\//.test(f.type || '')) onizle(f);
      });
      draw();
    }
    /* Önizleme kutusu — kare görsel kuralı bileşende (CLAUDE.md: img değil,
       div + background-image cover/center). Hedef `cfg.preview` bir seçici ya da
       düğüm olabilir; verilmezse bileşen kendi kutusunu yükleme alanının üstüne kurar. */
    function onizleKutu(){
      if(cfg.preview && cfg.preview !== true){
        return typeof cfg.preview === 'string' ? document.querySelector(cfg.preview) : cfg.preview;
      }
      var b = host.querySelector('[data-gvupimg]');
      if(!b){
        b = document.createElement('div');
        b.className = 'gv-thumb is-lg'; b.setAttribute('data-gvupimg', '');
        b.setAttribute('aria-hidden', 'true');
        host.insertBefore(b, host.firstChild);
      }
      return b;
    }
    function onizle(f){
      var kutu = onizleKutu(); if(!kutu) return;
      var okur = new FileReader();
      okur.onload = function(){
        kutu.style.backgroundImage = 'url("' + okur.result + '")';
        kutu.classList.add('has-img');
      };
      okur.readAsDataURL(f);
    }

    zone.addEventListener('click', function(){ input.click(); });
    zone.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); input.click(); } });
    zone.addEventListener('dragover', function(e){ e.preventDefault(); zone.classList.add('is-over'); });
    zone.addEventListener('dragleave', function(){ zone.classList.remove('is-over'); });
    zone.addEventListener('drop', function(e){ e.preventDefault(); zone.classList.remove('is-over'); accept(e.dataTransfer.files); });
    input.addEventListener('change', function(){ accept(input.files); input.value = ''; });
    list.addEventListener('click', function(e){
      var b = e.target.closest('[data-rm]');
      if(b){ picked.splice(+b.dataset.rm, 1); draw(); }
    });

    draw();
    return { files:function(){ return picked.slice(); }, clear:function(){ picked = []; draw(); }, el:host };
  };

  /* ===================================================================
     9b. RAPOR İSKELETİ — GV.report(cfg)   (PROMPT.md §20)
     Her rapor ekranı bunu kullanır: rapor seçici + ortak filtre şeridi +
     KPI + grafik + detay tablo (GV.list) + kayıtlı rapor + çıktı.

     GV.report({
       mount:'#rapor', id:'rapormusteri',
       filters:[{key,label,type:'select|date|daterange|text',options,value,all}],
       reports:[{ key, label, icon, group, title, desc,
                  rows:function(f){...},              // filtrelenmiş kayıtlar
                  kpis:[{label,icon,tone,format,calc(rows,f)}],
                  charts:function(rows,f){ return [{title,sub,html,wide}]; },
                  table:{...GV.list config (mount hariç)} }]
     })
     =================================================================== */
  /* ===================================================================
     11b. ORTAK HÜCRE VE KOLON FABRİKALARI — `GV.cell` · `GV.cols`
     -------------------------------------------------------------------
     ÖLÇÜLEN SORUN ([14.0.2]): 7 rapor sayfası toplam ~3.060 satır prelude
     yazıyor ve `colMoney / colNum / colPct / colDate / colDurum / colKisi /
     mny / num / sub / faint / linkCell / mRow / tbl / bos` fabrikaları HER
     SAYFADA yeniden tanımlanıyor (finans'ta 115 satır). Yedi kopya, biri
     diğerinden sessizce ayrılabiliyor.

     Üç şey buraya taşındığında düzeliyor:
     1. **Hizalama** ([14.2.5] · [14.2.6]) — tarih ve durum kolonlarının
        ortalanması gerekiyordu; ölçüldü, 7 sayfanın hiçbirinde
        `cellClass:'center'` yoktu. Artık fabrikadan geliyor, sayfa unutamaz.
     2. **Çıktı** ([14.4.1]) — her fabrika `exportValue`'yu kendi kurar.
     3. **`null` ≠ 0** (REVİZE 04) — ölçülemeyen bir maliyet için "0 ₺"
        basmak, gideri olmayan bir kayıt göstermek olurdu. Boş değer dili
        tek yerde.

     ⚠️ `GV.fmt` ZATEN VAR ve biçimlendirmedir (`Fmt`: date/money/num).
     HTML üreten hücre yardımcıları bu yüzden `GV.cell` altındadır; ikisi
     karıştırılırsa sayfa `GV.fmt.mny` diye var olmayan bir ad çağırır.
     =================================================================== */
  GV.cell = {
    /* Değer tarafı escape'lidir, sabit işaretleme değil (ders L-14). */
    faint:function(t){ return '<span class="u-faint">' + esc(t == null ? '—' : t) + '</span>'; },
    /* `sub` HTML ALIR — çağıran içeride başka hücre yardımcısı kullanabilsin
       diye. Ham kullanıcı metni verilecekse çağıran escape eder. */
    sub:function(html){ return '<span class="cell-sub">' + (html == null ? '' : html) + '</span>'; },
    mny:function(v, o){
      o = o || {};
      if(v == null) return GV.cell.faint('—');
      if(o.signed) return v < 0
        ? '<span class="cell-money u-danger">−' + Fmt.money(Math.abs(v), o.cur) + '</span>'
        : '<span class="cell-money u-ok">' + Fmt.money(v, o.cur) + '</span>';
      return '<span class="cell-money' + (o.tone ? ' u-' + o.tone : '') + '">' + Fmt.money(v, o.cur) + '</span>';
    },
    num:function(v, o){
      o = o || {};
      if(v == null) return GV.cell.faint('—');
      /* `signed` — `GV.cell.mny`de vardı, burada YOKTU ve fark hücresi kuran
         ekran `+/−` biçimini elde yazmak zorunda kalıyordu. İki kardeş
         yardımcının sözleşmesi ayrışmamalı. */
      if(o.signed) return v < 0
        ? '<span class="u-num u-danger">−' + Fmt.num(Math.abs(v), o.basamak) + '</span>'
        : '<span class="u-num u-ok">+' + Fmt.num(v, o.basamak) + '</span>';
      return '<span class="u-num' + (o.tone ? ' u-' + o.tone : '') + '">' + Fmt.num(v, o.basamak) + '</span>';
    },
    gun:function(v, tone){
      if(v == null) return GV.cell.faint('—');
      return '<span class="u-num' + (tone ? ' u-' + tone : '') + '">' + Fmt.num(v) + ' gün</span>';
    },
    oran:function(v, esik){
      if(v == null) return GV.cell.faint('—');
      var e = esik || 50;
      return '<span class="u-num ' + (v >= e ? 'u-ok' : v >= e / 2 ? 'u-warn' : 'u-danger') + '">%' + Fmt.num(v) + '</span>';
    },
    link:function(href, kod, altHtml){
      return '<a class="cell-main" href="' + href + '">' + esc(kod) + '</a>' + (altHtml || '');
    },
    mrow:function(main, kod, metas, badges){
      return '<div class="gv-mrow-top">' + main + '</div>' +
        '<div class="gv-mrow-code">' + kod + '</div>' +
        (metas && metas.length ? '<div class="gv-mrow-meta">' + metas.map(function(m){
          return '<span>' + m + '</span>'; }).join('') + '</div>' : '') +
        (badges ? '<div class="gv-mrow-bottom"><span class="gv-mrow-badges">' + badges + '</span></div>' : '');
    }
  };

  /* Fabrikanın ürettiği nesneye, kolon sözleşmesinin GEÇİŞLİ alanlarını taşır.
     Yedi rapor sayfasının GÖÇÜ sırasında dördü de bağımsız olarak aynı eksiği
     bildirdi: `perm` (UID-28 maskesi) · `width` · `locked` · `sortable` ·
     `sortValue` · `mask` fabrikadan geçmediği için kolon fabrikayı hiç
     kullanamıyor, sayfa `var c = GV.cols.money(…); c.perm='finans';` diye
     sarmalayıcı yazıyordu — yani kopya, fabrikadan bir adım öteye taşınmıştı.
     Dört ayrı ajanın aynı eksiği bulması, eksiğin fabrikanın kendisinde
     olduğunun kanıtıdır (L-40: kural N yerde tekrarlanıyorsa oraya değil,
     ortak katmana aittir). Geçişli alanlar burada TEK yerde tanımlıdır. */
  var COL_GECISLI = ['perm','mask','width','locked','sortable','sortValue','group','footer'];
  function colGecir(c, o){
    COL_GECISLI.forEach(function(k){ if(o[k] != null) c[k] = o[k]; });
    return c;
  }

  GV.cols = {
    money:function(key, label, o){
      o = o || {};
      return colGecir({ key:key, label:label, cellClass:o.cellClass != null ? o.cellClass : 'num', visible:o.visible !== false,
        sortValue:function(x){ return x[key] == null ? null : x[key]; },
        exportValue:o.exportValue || function(x){ return x[key] == null ? '' : x[key]; },
        render:function(x){
          return GV.cell.mny(x[key], { signed:o.signed, cur:o.cur, tone:o.tone ? o.tone(x) : null }) +
                 (o.sub ? GV.cell.sub(o.sub(x)) : ''); } }, o);
    },
    num:function(key, label, o){
      o = o || {};
      return colGecir({ key:key, label:label, cellClass:o.cellClass != null ? o.cellClass : 'num', visible:o.visible !== false,
        sortValue:function(x){ return x[key] == null ? null : x[key]; },
        exportValue:o.exportValue || function(x){ return x[key] == null ? '' : x[key]; },
        render:function(x){
          return GV.cell.num(x[key], { basamak:o.basamak, tone:o.tone ? o.tone(x) : null }) +
                 (o.sub ? GV.cell.sub(o.sub(x)) : ''); } }, o);
    },
    pct:function(key, label, o){
      o = o || {};
      return colGecir({ key:key, label:label, cellClass:o.cellClass != null ? o.cellClass : 'num', visible:o.visible !== false,
        sortValue:function(x){ return x[key] == null ? null : x[key]; },
        exportValue:o.exportValue || function(x){ return x[key] == null ? '' : x[key]; },
        /* Ölçüm yoksa ilerleme çubuğu da çizilmez — %0 dolu çubuk "hiç
           kullanılmamış" iddiasıdır, oysa değer hesaplanamıyor. */
        render:function(x){ return x[key] == null ? GV.cell.faint('—')
          : o.bar ? GV.progress(x[key]) : GV.cell.oran(x[key], o.esik); } }, o);
    },
    /* [14.2.5] — tarih kolonu ORTALANIR. */
    date:function(key, label, o){
      o = o || {};
      return colGecir({ key:key, label:label, cellClass:o.cellClass != null ? o.cellClass : 'center', visible:o.visible !== false,
        exportValue:o.exportValue || function(x){ return x[key] || ''; },
        render:function(x){
          if(!x[key]) return GV.cell.faint(o.bosMetin || '—');
          var g = o.plain ? '<span class="cell-date">' + Fmt.date(x[key]) + '</span>'
                          : GV.dateCell(x[key], { done:o.done ? o.done(x) : false });
          return g + (o.sub ? GV.cell.sub(o.sub(x)) : ''); } }, o);
    },
    /* [14.2.6] — durum kolonu ORTALANIR. Rozet HTML'dir; çıktıya ham
       değerin kendisi gider, etiket soyulmuş rozet değil. */
    durum:function(key, label, o){
      o = o || {};
      key = key || 'durum';
      /* `deger(x)` — rozet değeri kayıtta değil TÜRETİLİYORSA (ör. terminden
         hesaplanan "Gecikti") fabrikanın kullanılabilmesi için. Verilmezse
         eski davranış: `x[key]`. */
      var oku = o.deger || function(x){ return x[key]; };
      return colGecir({ key:key, label:label || 'Durum', cellClass:o.cellClass != null ? o.cellClass : 'center', visible:o.visible !== false,
        exportValue:o.exportValue || function(x){ var v = oku(x); return v == null ? '' : v; },
        render:function(x){ var v = oku(x);
          return v ? GV.badge(v, o.extra ? o.extra(x) : null) : GV.cell.faint(o.bosMetin || '—'); } }, o);
    },
    /* Kişi kolonu ekranda avatar+ad basar; çıktıya ADI gider, kod değil —
       dosyayı açan kişi `EMP-004`'ü okuyamaz (VB-12 ile aynı gerekçe). */
    kisi:function(key, label, o){
      o = o || {};
      return colGecir({ key:key, label:label, visible:o.visible !== false,
        sortValue:o.sortValue || function(x){
          return x[key] ? (window.DB && DB.empName ? DB.empName(x[key]) : x[key]) : null; },
        exportValue:o.exportValue || function(x){
          return x[key] ? (window.DB && DB.empName ? DB.empName(x[key]) : x[key]) : ''; },
        render:function(x){ return x[key]
          ? GV.user(x[key], { sm:true }) + (o.sub ? GV.cell.sub(o.sub(x)) : '')
          : GV.cell.faint(o.bosMetin || '—'); } }, o);
    },
    kod:function(key, label, o){
      o = o || {};
      return colGecir({ key:key, label:label, visible:o.visible !== false,
        exportValue:o.exportValue || function(x){ return x[key] || ''; },
        render:function(x){
          var alt = o.sub ? GV.cell.sub(o.sub(x)) : '';
          return o.href ? GV.cell.link(o.href(x), x[key], alt)
                        : '<span class="cell-main">' + esc(x[key]) + '</span>' + alt; } }, o);
    },
    /* Rapor tablosu iskeleti — `GV.list` yapılandırmasının rapor lehçesi. */
    tbl:function(o){
      return { key:o.key || 'kod', pageSize:o.pageSize || 10, archive:false,
        exportName:o.exportName, exportTitle:o.exportTitle,
        search:o.search, defaultSort:o.defaultSort, defaultDir:o.defaultDir || 'desc',
        tabs:o.tabs, columns:o.columns, mobile:o.mobile, emptyState:o.emptyState };
    },
    bos:function(baslik, aciklama, ikon){
      return { icon:ikon || 'i-wallet', title:baslik,
        desc:aciklama || 'Ortak filtreleri temizleyerek ya da tarih aralığını genişleterek kapsamı büyütebilirsiniz.' };
    }
  };

  GV.report = function(cfg){
    var mount = typeof cfg.mount === 'string' ? document.querySelector(cfg.mount) : cfg.mount;
    if(!mount) return null;
    var reports = (cfg.reports || []).filter(Boolean);
    if(!reports.length) return null;

    var LS_SAVED = 'gv.rp.' + (cfg.id || location.pathname);
    var qs = new URLSearchParams(location.search);
    var state = { key:null, f:{} };

    var byKey = function(k){ for(var i=0;i<reports.length;i++) if(reports[i].key === k) return reports[i]; return null; };
    state.key = byKey(qs.get('r')) ? qs.get('r') : reports[0].key;
    (cfg.filters || []).forEach(function(f){
      var v = qs.get('rf_' + f.key);
      state.f[f.key] = v != null ? v : (f.value != null ? f.value : '');
    });

    function syncUrl(){
      var u = new URLSearchParams(location.search);
      u.set('r', state.key);
      (cfg.filters || []).forEach(function(f){
        if(state.f[f.key]) u.set('rf_' + f.key, state.f[f.key]); else u.delete('rf_' + f.key);
      });
      history.replaceState(null, '', location.pathname + '?' + u.toString());
    }

    /* ---- kayıtlı raporlar ---- */
    function savedList(){
      try{ return JSON.parse(localStorage.getItem(LS_SAVED) || '[]'); }catch(e){ return []; }
    }
    function saveCurrent(){
      var r = byKey(state.key);
      GV.modal({
        title:'Raporu kaydet', size:'sm',
        body:'<div class="gv-fields"><div class="field f-col-12"><label for="rp-nm">Rapor adı</label>' +
             '<input id="rp-nm" class="inp" type="text" value="' + esc(r.title || r.label) + '"></div></div>' +
             '<p class="u-faint u-mt-4">Seçili rapor ve filtreler bu adla saklanır.</p>',
        actions:[{ label:'Vazgeç' },
                 { label:'Kaydet', cls:'btn-acc', onClick:function(close, box){
                     var nm = (box.querySelector('#rp-nm').value || '').trim();
                     if(!nm){ GV.toast('Rapor adı gerekli.', 'warn'); return false; }
                     var list = savedList();
                     list.push({ nm:nm, key:state.key, f:JSON.parse(JSON.stringify(state.f)) });
                     try{ localStorage.setItem(LS_SAVED, JSON.stringify(list)); }catch(e){}
                     GV.toast('“' + nm + '” kayıtlı raporlara eklendi.', 'ok');
                     render();
                   } }]
      });
    }
    function openSaved(){
      var list = savedList();
      if(!list.length){ GV.toast('Henüz kayıtlı rapor yok.', 'info'); return; }
      GV.drawer({
        title:'Kayıtlı raporlar',
        body:'<div class="gv-rp-list">' + list.map(function(s, i){
          var r = byKey(s.key);
          return '<button type="button" class="gv-rp-item" data-saved="' + i + '">' + ico(r ? (r.icon || 'i-chart-bar') : 'i-chart-bar') +
                 '<span class="cell-main">' + esc(s.nm) + '<span class="cell-sub">' + esc(r ? r.label : s.key) + '</span></span></button>';
        }).join('') + '</div>',
        onOpen:function(box, close){
          Array.prototype.forEach.call(box.querySelectorAll('[data-saved]'), function(b){
            b.addEventListener('click', function(){
              var s = list[+b.dataset.saved];
              state.key = byKey(s.key) ? s.key : state.key;
              state.f = JSON.parse(JSON.stringify(s.f || {}));
              close(); render(); syncUrl();
            });
          });
        }
      });
    }

    /* ---- parçalar ---- */
    function navHtml(){
      var out = '<nav class="gv-rp-nav" aria-label="Raporlar"><div class="gv-rp-navhead">Raporlar</div><div class="gv-rp-list">';
      var group = null;
      reports.forEach(function(r){
        if(r.group && r.group !== group){ group = r.group; out += '<div class="gv-rp-group">' + esc(group) + '</div>'; }
        out += '<button type="button" class="gv-rp-item' + (r.key === state.key ? ' is-on' : '') + '" data-rp="' + r.key + '"' +
               (r.key === state.key ? ' aria-current="true"' : '') + '>' + ico(r.icon || 'i-chart-bar') +
               '<span>' + esc(r.label) + '</span></button>';
      });
      return out + '</div></nav>';
    }

    function filterHtml(){
      if(!cfg.filters || !cfg.filters.length) return '';
      var out = '<div class="gv-card"><div class="rp-filters">';
      cfg.filters.forEach(function(f){
        var v = state.f[f.key] || '';
        out += '<div class="field"><label for="rpf-' + f.key + '">' + esc(f.label) + '</label>';
        if(f.type === 'select'){
          out += '<select class="inp" id="rpf-' + f.key + '" data-rf="' + f.key + '">' +
                 '<option value="">' + esc(f.all || 'Tümü') + '</option>' +
                 (f.options || []).map(function(o){
                   var val = o && o.value != null ? o.value : o, lbl = o && o.label != null ? o.label : o;
                   return '<option value="' + esc(String(val)) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(String(lbl)) + '</option>';
                 }).join('') + '</select>';
        } else if(f.type === 'date'){
          out += '<input class="inp" type="date" id="rpf-' + f.key + '" data-rf="' + f.key + '" value="' + esc(v) + '">';
        } else {
          out += '<input class="inp" type="text" id="rpf-' + f.key + '" data-rf="' + f.key + '" value="' + esc(v) + '" placeholder="' + esc(f.placeholder || '') + '">';
        }
        out += '</div>';
      });
      out += '<div class="rp-acts">' +
        '<button type="button" class="btn btn-ghost" data-rp-clear>' + ico('i-x','ic-sm') + ' Filtreleri temizle</button>' +
        '<button type="button" class="btn" data-rp-saved>' + ico('i-star','ic-sm') + ' Kayıtlı raporlar</button>' +
        '<button type="button" class="btn btn-acc" data-rp-save>' + ico('i-check','ic-sm') + ' Raporu kaydet</button>' +
        '</div></div></div>';
      return out;
    }

    function kpiHtml(r, rows){
      if(!r.kpis || !r.kpis.length) return '';
      return '<div class="kpi-grid">' + r.kpis.map(function(k){
        var gizli = kpiMasked(k);                       /* UID-11 — aynı sözleşme */
        var val = gizli ? null : (k.calc ? k.calc(rows, state.f) : 0);
        return '<div class="kpi' + (k.tone ? ' is-' + k.tone : '') + '">' +
          '<div class="kpi-ico">' + ico(k.icon || 'i-chart-bar','ic-lg') + '</div>' +
          '<div class="kpi-body"><div class="kpi-num' + (gizli ? ' is-masked' : '') + '">' +
            (gizli ? MASK : (k.format ? k.format(val) : Fmt.num(val))) + '</div>' +
          '<div class="kpi-lbl">' + esc(k.label) + '</div>' +
          (k.meta && !gizli ? '<div class="kpi-meta' + (k.metaTone ? ' is-' + k.metaTone : '') + '">' + k.meta(rows) + '</div>' : '') +
          '</div></div>';
      }).join('') + '</div>';
    }

    function chartHtml(r, rows){
      var items = r.charts ? (r.charts(rows, state.f) || []) : [];
      items = items.filter(Boolean);
      if(!items.length) return '';
      return '<div class="gv-charts' + (items.length === 1 ? ' is-single' : '') + '">' + items.map(function(c){
        return '<div class="gv-chartcard"' + (c.wide ? ' style="grid-column:1/-1"' : '') + '>' +
               '<h3>' + esc(c.title || '') + '</h3>' +
               (c.sub ? '<span class="gv-ch-sub">' + esc(c.sub) + '</span>' : '') +
               (c.html || '') +
               (c.legend ? Chart.legend(c.legend) : '') + '</div>';
      }).join('') + '</div>';
    }

    /* RAPOR KÜNYESİ — şartname [14.5.3] · [14.1.7] · [14.4.2].
       Kayıt defteri (`DB.reportRegistry`) yalnız DURMASIN diye değil, ekranda
       KULLANILSIN diye okunur: bir defter alanı hiçbir yerde görünmüyorsa
       "alan açıldı" der ama bağ yazılmamıştır (ders **L-22**).
       Defter yüklü değilse künye basılmaz ve bu SESSİZ bir başarı değildir —
       `tasks/qa/reg.js` ekseni defterin varlığını ayrıca ölçer. */
    function kunyeHtml(r){
      var reg = window.DB && DB.reportRegistry;
      if(!reg || !reg.length) return '';
      var dosya = location.pathname.split('/').pop();
      var kayit = null;
      for(var i = 0; i < reg.length; i++)
        if(reg[i].screen === dosya && reg[i].report_key === r.key){ kayit = reg[i]; break; }
      if(!kayit) return '';
      var satir = [
        ['Rapor kimliği', kayit.report_id],
        ['Kategori', kayit.category],
        ['Veri sınıfı', kayit.data_classification],
        ['Tazelik', kayit.freshness_policy],
        /* Sürüm defterden DEĞİL tek kaynaktan okunur (defterde bilerek null). */
        ['Formül sürümü', (window.DB && DB.formulaVersion) || 'tanımsız'],
        ['Çıktı biçimi', (kayit.export_types || []).join(' · ')]
      ];
      return '<section class="gv-rp-kunye"><h3>' + ico('i-info','ic-sm') + ' Rapor künyesi</h3>' +
        '<dl>' + satir.map(function(s){
          return '<dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1] == null ? '—' : s[1]) + '</dd>';
        }).join('') + '</dl>' +
        '<p class="u-faint">Bu künye dışa aktarılan dosyanın sonuna da yazılır; ' +
        'elinizdeki çıktının hangi hesap kuralıyla üretildiği oradan okunur.</p></section>';
    }

    function render(){
      var r = byKey(state.key) || reports[0];
      var rows = r.rows ? (r.rows(state.f) || []) : [];
      mount.innerHTML =
        '<div class="gv-rp">' + navHtml() +
        '<div class="gv-rp-body">' +
          filterHtml() +
          '<section class="gv-rp-intro"><h2>' + esc(r.title || r.label) + '</h2>' +
            (r.desc ? '<p>' + esc(r.desc) + '</p>' : '') + '</section>' +
          kpiHtml(r, rows) +
          chartHtml(r, rows) +
          '<div class="gv-rp-table"></div>' +
          kunyeHtml(r) +
        '</div></div>';

      if(r.table){
        var tcfg = {}, k;
        for(k in r.table) if(Object.prototype.hasOwnProperty.call(r.table, k)) tcfg[k] = r.table[k];
        tcfg.mount = mount.querySelector('.gv-rp-table');
        tcfg.id = (cfg.id || 'rp') + '-' + r.key;
        tcfg.urlSync = false;
        tcfg.source = function(){ return rows; };
        GV.list(tcfg);
      }

      Array.prototype.forEach.call(mount.querySelectorAll('[data-rp]'), function(b){
        b.addEventListener('click', function(){
          if(state.key === b.dataset.rp) return;
          state.key = b.dataset.rp; render(); syncUrl();
          var body = mount.querySelector('.gv-rp-body');
          if(body && window.innerWidth <= 980) body.scrollIntoView({ behavior:'smooth', block:'start' });
        });
      });
      Array.prototype.forEach.call(mount.querySelectorAll('[data-rf]'), function(el){
        el.addEventListener('change', function(){ state.f[el.dataset.rf] = el.value; render(); syncUrl(); });
      });
      var clr = mount.querySelector('[data-rp-clear]');
      if(clr) clr.addEventListener('click', function(){
        (cfg.filters || []).forEach(function(f){ state.f[f.key] = ''; });
        render(); syncUrl(); GV.toast('Filtreler temizlendi.', 'info');
      });
      var sv = mount.querySelector('[data-rp-save]'); if(sv) sv.addEventListener('click', saveCurrent);
      var op = mount.querySelector('[data-rp-saved]'); if(op) op.addEventListener('click', openSaved);
      if(GV.markWip) GV.markWip(mount);
    }

    render(); syncUrl();
    return { render:render, state:state };
  };

  /* ===================================================================
     10. WIP BAĞLANTI KORUMASI — sahte buton bırakılmaz
     =================================================================== */
  function wipNotice(w){
    GV.toast('“' + (w.dataset.wip || 'Bu ekran') + '” henüz yayında değil — sonraki wave\'de eklenecek.', 'info');
  }
  document.addEventListener('click', function(e){
    var w = e.target.closest('[data-wip]');
    if(!w) return;
    e.preventDefault();
    wipNotice(w);
  });
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Enter' && e.key !== ' ') return;
    var w = e.target.closest && e.target.closest('[data-wip]');
    if(!w) return;
    e.preventDefault();
    wipNotice(w);
  });

  /* Yardım tetikleyicisi */
  document.addEventListener('click', function(e){
    var h = e.target.closest('[data-help]');
    if(!h) return;
    e.preventDefault();
    GV.modal({ title:h.dataset.helpTitle || 'Açıklama', text:h.dataset.help, icon:'i-info', size:'sm',
               actions:[{ label:'Anladım', cls:'btn-acc' }] });
  });

})();
