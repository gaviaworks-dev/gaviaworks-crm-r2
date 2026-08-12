/* =====================================================================
   GAVIAWORKS CRM R2 — SHELL ENGINE (YENİDEN YAZILDI)

   Bu dosya R1'den TAŞINMADI. R1'in kabuğu 16 bölüm ve 86 tıklanabilir menü
   girdisi taşıyordu; şartname (tasks/sadelestirme-talimati.md §3.1) yedi
   çalışma alanı ve standart kullanıcıda en fazla 18 görünür girdi istiyor.
   Menü modeli baştan kuruldu; kabuğun geri kalanı (oturum sözleşmesi, yetki
   kapısı, iskelet, GV.refresh) R1'de ölçülmüş dersleri KORUR:

     L-15 — location.reload() YASAK. Veri assets/data/*.js içinde bellekte
            durur; sayfa yeniden yüklenince mutasyon silinir. GV.refresh().
     L-16 — kalıcı düğüme dinleyici bağlarken GV.on kullanılır, yoksa her
            tazelemede dinleyici birikir.
     L-18 — modal/drawer .page-main DIŞINA basılır; GV.refresh onları kapatır.
     L-36 — menüyü tazelemek, menünün bağlı olduğu düğümleri tazelemek
            değildir; wireNav() syncNav içinde ÇAĞRILMAZ.

   Sözleşme (R1 ile aynı — taşınan ui.js ve domain.js buna bağlı):
     <body data-sec="satis" data-screen="musteri">
     sessionStorage('gv.session') → { rol:'sahip', emp:'EMP-001', … }
     Dışa verilen: GV.esc · GV.ico · GV.perm · GV.session · GV.counters ·
                   GV.refresh · GV.on · GV.pageHead · GV.built · GV.isBuilt ·
                   GV.markWip · GV.shell
     Olaylar: gv:ready (yetki verildi) · gv:denied (403)
   ===================================================================== */
(function(){
  'use strict';

  var GV = window.GV = window.GV || {};
  var SS_KEY  = 'gv.session';
  var LS_MENU = 'gv.menu.collapsed';

  /* ===================================================================
     1. YEDİ ÇALIŞMA ALANI — şartname §3.1

     Ölçüm sözleşmesi: tıklanabilir girdi = `href:` taşıyan kayıt.
     R1'de `seclbl:` ayraçları da `lbl:` içerdiği için 86 girdi 99 sanılmıştı
     (bkz. tasks/rota-haritasi.md). R2'de AYRAÇ KULLANILMAZ — yedi alanın en
     kalabalığı dört girdi taşıyor, gruplamaya gerek yok. Böylece
     `grep -c "href:"` doğrudan girdi sayısını verir.
     =================================================================== */

  /* Yönetim rolleri — ayar girdilerinin görünürlük kapısı.
     Şartname §3.1: "Sistem yöneticisi, ayar sekmeleri nedeniyle daha fazla
     öğeye erişebilir; ancak bunlar günlük menüyle aynı görsel ağırlıkta
     olmamalıdır." Standart kullanıcı bu üç girdiyi GÖRMEZ (§2 "yetkisiz öğe
     gri veya kilitli gösterilmek yerine menüden kaldırılmalı"). */
  var YONETIM       = ['sahip','genelmudur','sistem'];
  var YONETIM_DEVOPS= ['sahip','genelmudur','sistem','devops'];
  var YONETIM_OPS   = ['sahip','genelmudur','sistem','operasyon','devops'];

  var SECTIONS = {
    gundem:{ ic:'i-gauge', eyebrow:'Bugün', title:'Gündem', menu:[
      { ic:'i-gauge',     lbl:'Ana Panel',        href:'app-panel.html',       screen:'panel' }
    ]},

    satis:{ ic:'i-target', eyebrow:'Satış', title:'Müşteri ve Satış', menu:[
      { ic:'i-building',  lbl:'Müşteriler',       href:'app-musteri.html',     screen:'musteri' },
      { ic:'i-funnel',    lbl:'Satış Akışı',      href:'app-satis-akisi.html', screen:'satisakisi' },
      { ic:'i-quote',     lbl:'Teklifler',        href:'app-teklif.html',      screen:'teklif', cnt:'teklif' }
    ]},

    operasyon:{ ic:'i-briefcase', eyebrow:'Teslimat', title:'Proje ve Operasyon', menu:[
      { ic:'i-briefcase', lbl:'Projeler',         href:'app-proje.html',       screen:'proje' },
      { ic:'i-tasks',     lbl:'Görevler',         href:'app-gorev.html',       screen:'gorev', cnt:'bana' },
      { ic:'i-layers',    lbl:'Operasyon',        href:'app-operasyon.html',   screen:'operasyon' },
      { ic:'i-support',   lbl:'Destek',           href:'app-destek.html',      screen:'destek', cnt:'destek' }
    ]},

    finans:{ modul:'finans', ic:'i-wallet', eyebrow:'Finans', title:'Finans', menu:[
      { ic:'i-receipt',   lbl:'Faturalar',        href:'app-fatura.html',      screen:'fatura' },
      { ic:'i-wallet',    lbl:'Tahsilatlar',      href:'app-tahsilat.html',    screen:'tahsilat', cnt:'tahsilat', tone:'danger' },
      { ic:'i-link',      lbl:'Ödeme Linkleri',   href:'app-odeme-linki.html', screen:'odemelinki' },
      { ic:'i-cart',      lbl:'Satın Alma',       href:'app-satinalma.html',   screen:'satinalma', cnt:'satinalma' }
    ]},

    ekip:{ ic:'i-users', eyebrow:'Kaynak', title:'Ekip ve Kaynaklar', menu:[
      { ic:'i-users',     lbl:'Personel',         href:'app-personel.html',    screen:'personel' },
      { ic:'i-timer',     lbl:'Zaman ve İzin',    href:'app-zaman.html',       screen:'zaman', cnt:'izin' },
      { ic:'i-package',   lbl:'Varlıklar',        href:'app-varlik.html',      screen:'varlik' }
    ]},

    rapor:{ ic:'i-chart-bar', eyebrow:'Analiz', title:'Raporlar', menu:[
      { ic:'i-chart-bar', lbl:'Raporlar',         href:'app-rapor.html',       screen:'rapor' }
    ]},

    ayarlar:{ ic:'i-settings', eyebrow:'Sistem', title:'Ayarlar', menu:[
      { ic:'i-user',      lbl:'Profil',           href:'app-ayar-profil.html', screen:'profil' },
      /* `yonetim:true` — §3.1: "Sistem yöneticisi, ayar sekmeleri nedeniyle
         daha fazla öğeye erişebilir; ancak bunlar GÜNLÜK MENÜYLE AYNI GÖRSEL
         AĞIRLIKTA OLMAMALIDIR." Bu bayrak menüde ayrı ve soluk bir bloğa
         düşürür; yetki kapısı `roles:`tir, bayrak yalnız görsel ağırlıktır. */
      { ic:'i-shield',    lbl:'Şirket ve Erişim', href:'app-ayar-sirket.html', screen:'sirket',      roles:YONETIM,        yonetim:true },
      { ic:'i-link',      lbl:'Entegrasyonlar',   href:'app-ayar-entegrasyon.html', screen:'entegrasyon', roles:YONETIM_DEVOPS, yonetim:true },
      { ic:'i-list',      lbl:'Sistem Kayıtları', href:'app-ayar-log.html',    screen:'log',         roles:YONETIM_OPS,    yonetim:true }
    ]}
  };

  var RAIL_ORDER = ['gundem','satis','operasyon','finans','ekip','rapor','ayarlar'];

  /* ===================================================================
     AYAR SEKMELERİ — şartname §3.3
     "`app-ayar-*.html` → `/ayarlar/:sekme` · Aynı ayar kabuğunda sekmeli
      yönetim; YETKİYE GÖRE SEKME ÜRET."

     Dört ayar ekranının hepsi bu tek kayıttan sekme üretir. Kural burada
     TEK yerde durur (L-40): dört ekranda dört kopya olsaydı bir rol
     değiştiğinde üçü sessizce eskirdi.

     `rota` alanı `tasks/rota-haritasi.md` satır numarasıdır — bir sekmenin
     hangi R1 ekranını kapattığı defterle karşılıklı ölçülebilsin diye
     yazılıdır, süs değildir.

     Kapı sırası: `roles` (rol beyaz listesi) → `perm` (yetki matrisi
     anahtarı). Sekme kapısı MENÜ kapısından ayrıdır: ekrana girebilen bir
     rol her sekmeyi göremeyebilir; göremediği sekme BASILMAZ (§2 "yetkisiz
     öğe gri veya kilitli gösterilmek yerine kaldırılmalı").
     =================================================================== */
  var AYAR_SEKME = {
    profil:[
      { key:'hesap',     lbl:'Hesabım',             ic:'i-user',         rota:134 },
      { key:'bildirim',  lbl:'Bildirim Tercihleri', ic:'i-bell',         rota:135 }
    ],
    sirket:[
      { key:'sirket',    lbl:'Şirket',              ic:'i-building',     rota:136 },
      { key:'departman', lbl:'Departmanlar',        ic:'i-layers',       rota:137 },
      { key:'kullanici', lbl:'Kullanıcılar',        ic:'i-users',        rota:138, perm:'personel' },
      { key:'rol',       lbl:'Roller',              ic:'i-shield',       rota:139 },
      { key:'yetki',     lbl:'Yetki Matrisi',       ic:'i-key',          rota:140, roles:YONETIM },
      { key:'onay',      lbl:'Onay Akışları',       ic:'i-stamp',        rota:141 }
    ],
    entegrasyon:[
      { key:'saglayici', lbl:'Sağlayıcılar',        ic:'i-link',         rota:142 },
      { key:'odeme',     lbl:'Ödeme Sağlayıcısı',   ic:'i-wallet',       rota:142, perm:'finans' },
      { key:'otomasyon', lbl:'Otomasyonlar',        ic:'i-refresh',      rota:143 },
      { key:'hata',      lbl:'Hata Kuyruğu',        ic:'i-alert',        rota:142 }
    ],
    log:[
      { key:'kayit',     lbl:'Sistem Kayıtları',    ic:'i-list',         rota:144, perm:'log' },
      { key:'arsiv',     lbl:'Belge Arşivi',        ic:'i-archive',      rota:145 },
      { key:'kalite',    lbl:'Veri Kalitesi',       ic:'i-shield-check', rota:146 }
    ]
  };

  /* Rol → görebileceği çalışma alanı.
     R1'de 27 rol × 16 bölüm bir haritaydı; R2'de alan sayısı yediye indiği
     için harita da sadeleşti. `ayarlar` HERKESE açıktır (herkes kendi
     profilini yönetir) — içindeki üç yönetim girdisi `roles:` ile kapanır. */
  var ALL = RAIL_ORDER.slice();
  var SEC_BY_ROLE = {
    sahip:        ALL,
    genelmudur:   ALL,
    sistem:       ALL,
    operasyon:    ALL,
    depmudur:     ['gundem','operasyon','ekip','rapor','ayarlar'],
    satismudur:   ['gundem','satis','operasyon','finans','rapor','ayarlar'],
    satistemsilci:['gundem','satis','operasyon','ayarlar'],
    musteritems:  ['gundem','satis','operasyon','ayarlar'],
    analist:      ['gundem','satis','operasyon','rapor','ayarlar'],
    pm:           ['gundem','satis','operasyon','finans','ekip','rapor','ayarlar'],
    takimlideri:  ['gundem','operasyon','ekip','rapor','ayarlar'],
    tasarimci:    ['gundem','operasyon','ayarlar'],
    frontend:     ['gundem','operasyon','ayarlar'],
    backend:      ['gundem','operasyon','ayarlar'],
    mobil:        ['gundem','operasyon','ayarlar'],
    ai:           ['gundem','operasyon','ayarlar'],
    qa:           ['gundem','operasyon','ayarlar'],
    devops:       ['gundem','operasyon','ekip','ayarlar'],
    destek:       ['gundem','satis','operasyon','ayarlar'],
    ik:           ['gundem','ekip','operasyon','rapor','ayarlar'],
    muhasebe:     ['gundem','satis','finans','ekip','rapor','ayarlar'],
    satinalma:    ['gundem','finans','ekip','operasyon','rapor','ayarlar'],
    idari:        ['gundem','ekip','finans','operasyon','ayarlar'],
    freelancer:   ['gundem','operasyon','ayarlar'],
    diskaynak:    ['gundem','operasyon','ayarlar'],
    stajyer:      ['gundem','operasyon','ayarlar'],
    /* Müşteri portalı kimliği bir YTK- kaydıdır, personel değildir.
       Hızlı Not ona kapalıdır: GV.notes oturumdaki personel koduna bağlı. */
    musteri:      ['gundem','operasyon','ayarlar']
  };

  /* Ekran düzeyinde yasak — menü gizlemesi ile doğrudan adres kapısı TEK
     kaynaktan beslenir (R1 REVİZE 13 dersi: biri kapanıp diğeri açık kalamaz). */
  var SCREEN_DENY = {
    operasyon: ['musteri'],   /* iç iş kuyruğu */
    satisakisi:['musteri'],
    odemelinki:['musteri']    /* link YÖNETİMİ iç iştir; müşteri /odeme/:token görür */
  };

  /* ===================================================================
     2. OTURUM
     R1 sözleşmesi korunur: personel → { emp:'EMP-*', musteri:null }
                            müşteri  → { emp:null,   musteri:'MUS-*', kontak:'YTK-*' }
     `emp` null olduğunda kişisel bloklar (Hızlı Not dahil) BASILMAZ.
     =================================================================== */
  function readSession(){
    try{ return JSON.parse(sessionStorage.getItem(SS_KEY) || 'null'); }catch(e){ return null; }
  }
  function writeSession(s){
    try{ sessionStorage.setItem(SS_KEY, JSON.stringify(s)); }catch(e){}
  }

  function buildSession(empKod, roleKey){
    var e = (window.DB && DB.emp) ? DB.emp(empKod) : null;
    if(!e) return null;
    return {
      emp:e.kod, ad:e.ad, ini:e.ini, dep:e.dep, depAd:e.depAd,
      musteri:null, kontak:null, musteriAd:null,
      rol:roleKey || e.rol, rolAd:(window.DB ? DB.roleName(roleKey || e.rol) : roleKey),
      eposta:e.eposta, girildi:new Date().toISOString()
    };
  }

  function buildMusteriSession(kontakKod){
    if(!window.DB || !DB.contacts) return null;
    var k = kontakKod ? DB.contacts.filter(function(c){ return c.kod === kontakKod; })[0] : null;
    /* `contacts` — `durum` yok, `aktif` kanon (K-33). */
    if(!k) k = DB.contacts.filter(function(c){ return c.aktif !== false; })[0] || DB.contacts[0];
    if(!k) return null;
    var m = (DB.customers || []).filter(function(c){ return c.kod === k.musteri; })[0];
    var parca = String(k.ad || '').trim().split(/\s+/);
    return {
      emp:null, kontak:k.kod, musteri:k.musteri, musteriAd:m ? m.unvan : k.musteri,
      ad:k.ad,
      ini:(parca[0] || '').slice(0,1) + (parca.length > 1 ? parca[parca.length - 1].slice(0,1) : ''),
      dep:null, depAd:m ? m.kisa : null,
      rol:'musteri', rolAd:(window.DB ? DB.roleName('musteri') : 'Müşteri'),
      eposta:k.eposta, girildi:new Date().toISOString()
    };
  }

  var session = null;
  var syncNav = null;

  function resolveSession(){
    var s = readSession();
    var q = new URLSearchParams(location.search);
    var qRole = q.get('role');
    var qEmp  = q.get('emp');

    /* URL yalnız İLK seçimde okunur, sonra adres çubuğundan temizlenir. */
    if(qRole || qEmp){
      var ns;
      if(qRole === 'musteri' || /^YTK-/.test(qEmp || '')){
        ns = buildMusteriSession(/^YTK-/.test(qEmp || '') ? qEmp : null);
      }else{
        var emp = qEmp;
        if(!emp && qRole && window.DB){
          var m = DB.employees.filter(function(x){ return x.roller.indexOf(qRole) !== -1; })[0];
          emp = m ? m.kod : DB.employees[0].kod;
        }
        ns = buildSession(emp || 'EMP-001', qRole || null);
      }
      if(ns){ s = ns; writeSession(s); }
      q.delete('role'); q.delete('emp');
      var rest = q.toString();
      history.replaceState({}, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
    }
    return s;
  }

  /* ===================================================================
     3. YETKİ
     =================================================================== */
  var Perm = {
    role:function(){ return session ? session.rol : 'stajyer'; },
    matrix:function(){
      var m = (window.DB && DB.permMatrix) ? DB.permMatrix[this.role()] : null;
      return m || { gor:'kendi', ekle:'yok', duzenle:'yok', sil:'yok', onay:false,
                    rapor:'yok', finans:false, maas:false, personel:'yok', log:false, disaAktar:false };
    },
    /* Modül anahtarı — "şirket bunu kullanıyor mu". Tanımsız anahtar AÇIK. */
    modul:function(key){
      if(!key) return true;
      var m = (window.DB && DB.company && DB.company.aktifModuller) || null;
      if(!m || !(key in m)) return true;
      return m[key] !== false;
    },
    sec:function(key){
      var list = SEC_BY_ROLE[this.role()] || ['gundem'];
      if(list.indexOf(key) === -1) return false;
      var sc = SECTIONS[key];
      if(sc && sc.modul && !this.modul(sc.modul)) return false;
      /* Tüm maddeleri gizlenmiş alan düşer — boş bölüm açmak kullanıcıya
         tıklanacak bir hiç sunmaktır. */
      if(sc && sc.menu){
        var self = this;
        var gorunur = sc.menu.filter(function(it){ return self.item(it); });
        if(sc.menu.length && !gorunur.length) return false;
      }
      return true;
    },
    item:function(it){
      if(it.screen && SCREEN_DENY[it.screen] && SCREEN_DENY[it.screen].indexOf(this.role()) !== -1) return false;
      if(it.modul && !this.modul(it.modul)) return false;
      if(!it.roles) return true;
      return it.roles.indexOf(this.role()) !== -1;
    },
    can:function(action){
      var m = this.matrix();
      if(action === 'musteriRapor') return !!(m.rapor && m.rapor !== 'yok') && this.sec('satis');
      if(action === 'personelRapor')
        return !!(m.rapor && m.rapor !== 'yok' && m.personel && m.personel !== 'yok') && this.sec('ekip');
      var v = m[action];
      if(typeof v === 'boolean') return v;
      return v && v !== 'yok';
    },
    scope:function(action){ return this.matrix()[action] || 'yok'; },
    mask:function(value, action){ return this.can(action || 'maas') ? value : '••••••'; },

    /* =================================================================
       İÇ VERİ KAPISI — KİMLİK düzeyi (ADR-R2-47 · V2-100)
       R2'nin iki kapısı vardı ve ikisi de KAYIT düzeyindeydi:
         · `GV.guardRecord`     → "bu KAYIT bu oturuma ait mi?"
         · `GV.list` scopeField → "bu SATIR bu oturuma ait mi?"
       İkisi de bir kaydın SAHİBİNİ sorar. Toplayan yüzey (panel kartı,
       KPI sayacı, form seçeneği) kayıt açmaz — defterin TAMAMINI sayar,
       yani sorulacak bir sahip yoktur ve iki kapı da onu görmez. Ölçüldü
       (13 Ağustos, gerçek Chromium, `YTK-001` oturumu): panel müşteri
       kimliğine 5 iç bildirim · 6 iç proje · 15 personel sayısı · 2 izin
       talebini İSMİYLE · "Bekleyen onay 10" basıyordu.

       Üçüncü soru bu yordamdır: **bu KİMLİK şirket içi veriyi görebilir
       mi?** Cevap oturumun kendisinden gelir, ekranın yorumundan değil.
         GV.perm.icVeri()       → true: personel · false: portal kimliği
         GV.perm.icVeriNeden()  → kapalıysa GEREKÇE cümlesi
       Gerekçe de burada durur: kapalı bir yüzeyin sebebini ekran kendi
       cümlesiyle anlatırsa kural iki yerde yaşar ve yordam değişince
       cümle sessizce bayatlar (L-40 · dilim 7 bayat beyan dersi). */
    icVeri:function(){ return !(session && session.musteri); },
    /* İÇ KÜME — şirket içi bir defterden gelen seçenek/liste kümesi
       (personel kadrosu, iç onay zinciri, denetim defteri). Portal
       kimliğinde BOŞ döner. Küme boşaldığında yüzeyin BOŞ GÖRÜNMESİ
       yetmez, sebebi de basılmalıdır — sebep `icVeriNeden()`tedir. */
    icKume:function(rows){ return this.icVeri() ? (rows || []) : []; },
    icVeriNeden:function(){
      if(this.icVeri()) return '';
      /* Özne "blok" ya da "ekran" DEĞİL "yüzey": aynı cümle hem bir panel
         kartını hem bir form ekranını anlatıyor. İki ayrı cümle yazmak,
         aynı kuralı iki yerde tutmak olurdu. */
      return (session.musteriAd || 'firmanız') + ' portal oturumundasınız. ' +
             'Bu yüzey şirket içi bir deftere dayanıyor ve o defter müşteri ekseni ' +
             'taşımıyor; kapsamınıza indirgenemediği için hiç basılmıyor.';
    },

    /* KAPSAM SÜZGECİ — `GV.list` `afterScope`unun ÇAĞRILABİLİR hâli.
       Aynı kural iki yerde yaşamasın diye tek uygulama burada durur;
       `ui.js` bunu çağırır, kendi kopyasını taşımaz (V2-101/3).
         GV.perm.kapsa(satirlar, { kendi:'sorumlu', musteri:'musteri' })
           → { satir, kapsandi, not }
       `alanMap` bir ALAN ADI ya da bir YORDAM taşıyabilir: kapsam alanı
       kayıtta her zaman doğrudan yazılı değildir (teslim kaydında müşteri
       yoktur, projesinde yazılıdır).
       Eşlenmemiş kapsam SESSİZ GEÇMEZ — `not` doldurulur ve çağıran onu
       basar; süzülmeyen listeyi süzülmüş gibi göstermek yasaktır (L-23). */
    kapsa:function(rows, alanMap){
      rows = rows || [];
      var k = this.scope('gor');
      if(!alanMap || !k || k === 'tum' || k === 'yok')
        return { satir:rows, kapsandi:false, not:'' };
      var alan = alanMap[k];
      var adlar = { proje:'proje', departman:'departman', musteri:'müşteri', kendi:'kendi kaydınız' };
      if(!alan)
        return { satir:rows, kapsandi:false,
                 not:'Kapsamınız ' + (adlar[k] || k) + ' bazlı, ancak bu yüzeyde ' +
                     (adlar[k] || k) + ' süzgeci tanımlı değil — tüm kayıtlar gösteriliyor.' };
      var me = session || {};
      var deger = k === 'kendi' ? me.emp : k === 'departman' ? me.dep
                : k === 'musteri' ? me.musteri : null;
      if(!deger)
        return { satir:rows, kapsandi:false,
                 not:'Kapsam süzgeci uygulanamadı — oturumda karşılığı olan bir değer yok.' };
      var sec = typeof alan === 'function' ? alan : function(r){ return r[alan]; };
      /* Değer DİZİ olabilir (bir kayıt birden çok projeye bağlı olabilir);
         `GV.list` bu davranışı taşıyordu ve taşımaya devam eder. */
      return {
        satir:rows.filter(function(r){
          var v = sec(r);
          return Array.isArray(v) ? v.indexOf(deger) !== -1 : v === deger;
        }),
        kapsandi:true, kapsam:k, not:''
      };
    }
  };
  GV.perm = Perm;

  /* Görünür menü girdisi — ÖLÇÜM KAPISI.
     Kabul kriteri (§12): standart kullanıcı en fazla 18 girdi görür.
     Sayı burada TEK yerden üretilir; tasks/qa/menu.js bu yordamı çağırır,
     kendi kopyasını yazmaz (R1 dersi L-40: kural N yerde yaşamaz). */
  function gorunurGirdiler(){
    var out = [];
    RAIL_ORDER.forEach(function(key){
      if(!Perm.sec(key)) return;
      (SECTIONS[key].menu || []).forEach(function(it){
        /* `yonetim` bayrağı ölçüme TAŞINIR: §3.1 "en fazla 18" hükmü
           STANDART kullanıcı içindir; yönetici ayar girdileri ayrı sayılır. */
        if(Perm.item(it)) out.push({ alan:key, lbl:it.lbl, href:it.href, yonetim:!!it.yonetim });
      });
    });
    return out;
  }

  /* Ayar sekmesi üretimi — §3.3. Menü kapısıyla AYNI ilkelleri okur
     (`Perm.role` · `Perm.can`), kendi yetki kuralını TANIMLAMAZ. */
  function ayarSekmeleri(ekran){
    return (AYAR_SEKME[ekran] || []).filter(function(t){
      if(t.roles && t.roles.indexOf(Perm.role()) === -1) return false;
      if(t.perm && !Perm.can(t.perm)) return false;
      return true;
    });
  }

  /* ===================================================================
     4. SAYAÇLAR — mock veriden türetilir, statik sabit YOK
     =================================================================== */
  function counters(){
    var D = window.DB || {};
    var me = session ? session.emp : null;
    var t = D.today || '2026-08-03';
    var tasks = D.tasks || [];
    var mus = session ? session.musteri : null;

    /* Müşteri oturumunda sayaç da kapsamlıdır — kapsamsız "12 açık talep"
       müşteriye başka firmaların hacmini söyler (R1 REVİZE 13). */
    if(mus){
      var benimProje = (D.projects || []).filter(function(p){ return p.musteri === mus; })
                        .map(function(p){ return p.kod; });
      return {
        bana:0, teklif:0, tahsilat:0, satinalma:0, izin:0, bildirim:0, onay:0,
        destek:(D.tickets || []).filter(function(x){
                 return x.musteri === mus &&
                   (D.ticketClosedStatuses || []).indexOf(x.durum) === -1; }).length
      };
    }

    return {
      bana:      tasks.filter(function(x){ return x.sorumlu === me && ['Devam ediyor','Atandı'].indexOf(x.durum) !== -1; }).length,
      geciken:   tasks.filter(function(x){ return x.termin < t && ['Tamamlandı','İptal edildi','Arşivlendi'].indexOf(x.durum) === -1; }).length,
      onay:      (D.approvals || []).filter(function(x){ return x.durum === 'Bekliyor'; }).length,
      bildirim:  (D.notifications || []).filter(function(x){ return !x.okundu; }).length,
      teklif:    (D.quotes || []).filter(function(x){ return ['Gönderildi','Müşteri İncelemesi','Müzakere/Revizyon'].indexOf(x.durum) !== -1; }).length,
      destek:    (D.tickets || []).filter(function(x){
                   return (D.ticketClosedStatuses || []).indexOf(x.durum) === -1; }).length,
      izin:      (D.leaves || []).filter(function(x){ return x.durum === 'Onay bekliyor'; }).length,
      satinalma: (D.purchases || []).filter(function(x){ return x.durum === 'Onay bekliyor'; }).length,
      tahsilat:  (D.payments || []).filter(function(x){ return x.durum === 'Gecikti'; }).length
    };
  }

  /* ===================================================================
     5. RENDER YARDIMCILARI
     =================================================================== */
  function ico(name, cls){
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#' + name + '"></use></svg>';
  }
  GV.ico = ico;

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  GV.esc = esc;

  function renderRail(activeSec, cnt){
    var rail = document.getElementById('gvRail');
    if(!rail) return;
    var html = '<a class="gv-logo" href="app-panel.html" aria-label="GaviaWorks — Gündem">' + ico('i-gavia') + '</a>';
    html += '<ul class="gv-rail-list">';
    RAIL_ORDER.forEach(function(key){
      if(!Perm.sec(key)) return;
      var S = SECTIONS[key];
      if(!S) return;
      var badge = 0;
      S.menu.forEach(function(it){ if(it.cnt && cnt[it.cnt]) badge += cnt[it.cnt]; });
      html += '<li><button type="button" class="gv-rail-btn" data-sec="' + key + '"' +
              (key === activeSec ? ' aria-current="true"' : '') +
              ' data-tip="' + esc(S.title) + '" aria-label="' + esc(S.title) + '">' +
              ico(S.ic) +
              (badge ? '<span class="gv-rail-dot">' + (badge > 99 ? '99+' : badge) + '</span>' : '') +
              '</button></li>';
    });
    html += '</ul>';
    html += '<div class="gv-rail-foot"><span class="gv-rail-mark">GW</span></div>';
    rail.innerHTML = html;
  }

  /* Rail tıklaması ve ipucu — İSKELETE bağlanır, syncNav'da yeniden
     bağlanmaz (L-16). Delegasyon rail düğümünün kendisindedir. */
  function wireRail(){
    var rail = document.getElementById('gvRail');
    if(!rail) return;
    GV.on(rail, 'click', function(e){
      var b = e.target.closest('.gv-rail-btn');
      if(!b) return;
      var S = SECTIONS[b.dataset.sec];
      if(!S) return;
      var visible = S.menu.filter(function(it){ return it.href && Perm.item(it); });
      var target = visible.filter(function(it){ return isBuilt(it.href); })[0];
      if(target){ location.href = target.href; return; }
      if(GV.toast) GV.toast(S.title + ' alanı henüz yayında değil.', 'info');
    }, 'railclick');

    var tip = document.getElementById('gvRailTip');
    if(!tip){
      tip = document.createElement('div');
      tip.className = 'gv-tip';
      tip.id = 'gvRailTip';
      document.body.appendChild(tip);
    }
    GV.on(rail, 'mouseover', function(e){
      var b = e.target.closest('.gv-rail-btn');
      if(!b) return;
      tip.textContent = b.dataset.tip;
      var r = b.getBoundingClientRect();
      tip.style.left = (r.right + 10) + 'px';
      tip.style.top  = (r.top + r.height / 2 - 15) + 'px';
      tip.classList.add('is-on');
    }, 'railtipin');
    GV.on(rail, 'mouseout', function(){ tip.classList.remove('is-on'); }, 'railtipout');
  }

  function renderMenu(activeSec, activeScreen, cnt){
    var menu = document.getElementById('gvMenu');
    if(!menu) return;
    var S = SECTIONS[activeSec] || SECTIONS.gundem;

    var html = '<div class="gv-menu-head">' +
               '<div class="gv-menu-eyebrow">' + esc(S.eyebrow) + '</div>' +
               '<h2 class="gv-menu-title">' + esc(S.title) + '</h2></div>' +
               '<div class="gv-menu-scroll"><nav aria-label="' + esc(S.title) + ' menüsü">';

    /* Günlük girdiler önce, yönetim girdileri sonra ve AYRI blokta.
       Ayrım görseldir; erişim kapısı `Perm.item` içindedir. */
    var gunluk  = S.menu.filter(function(it){ return Perm.item(it) && !it.yonetim; });
    var yonetim = S.menu.filter(function(it){ return Perm.item(it) &&  it.yonetim; });

    function madde(it){
      var n = it.cnt ? (cnt[it.cnt] || 0) : 0;
      return '<a class="gv-menu-item' + (it.yonetim ? ' is-admin' : '') + '" href="' + it.href + '"' +
             (it.screen === activeScreen ? ' aria-current="page"' : '') + '>' +
             ico(it.ic) +
             '<span class="gv-menu-lbl">' + esc(it.lbl) + '</span>' +
             (n ? '<span class="gv-menu-cnt' + (it.tone === 'danger' ? ' is-danger' : '') + '">' + n + '</span>' : '') +
             '</a>';
    }

    html += gunluk.map(madde).join('');
    if(yonetim.length){
      html += '<div class="gv-menu-admin"><div class="gv-menu-admin-lbl">Yönetim</div>' +
              yonetim.map(madde).join('') + '</div>';
    }

    html += '</nav></div>';
    html += '<div class="gv-menu-foot">' +
            '<a class="gv-menu-item" href="index.html">' + ico('i-logout') +
            '<span class="gv-menu-lbl">Çıkış / Rol Değiştir</span></a></div>';
    menu.innerHTML = html;
  }

  /* ---- ÜST ÇUBUK — şartname §3.2 ----------------------------------
     Yedi küresel araç: genel arama · Yeni menüsü · takvim çekmecesi ·
     bekleyen onay sayacı · bildirimler · Hızlı Not · profil bağlamı.
     Takvim, bildirim, onay ve kişisel not için AYRI ÜST DÜZEY BÖLÜM AÇILMAZ
     — hepsi bu çubuktan çekmece olarak açılır. */
  function renderTop(cnt){
    var top = document.getElementById('gvTop');
    if(!top || !session) return;
    var kisisel = !!session.emp;   /* müşteri oturumunda Hızlı Not yok */

    top.innerHTML =
      '<button class="gv-burger" id="gvBurger" aria-label="Menüyü aç" aria-expanded="false">' + ico('i-menu') + '</button>' +
      '<div class="gv-globalsearch">' + ico('i-search') +
        '<input type="search" id="gvGlobalSearch" placeholder="Müşteri, proje, görev veya kişi ara" aria-label="Genel arama">' +
      '</div>' +
      '<div class="gv-top-tools">' +
        '<button type="button" class="btn btn-acc gv-newbtn" id="gvNew" aria-haspopup="true" aria-expanded="false">' +
          ico('i-plus') + '<span>Yeni</span>' + ico('i-chev-down','ic-sm') +
        '</button>' +
        '<button type="button" class="gv-iconbtn" id="gvCal" aria-label="Takvim" title="Takvim">' + ico('i-calendar') + '</button>' +
        '<button type="button" class="gv-iconbtn" id="gvApprove" aria-label="Bekleyen onaylar" title="Bekleyen onaylar">' +
          ico('i-stamp') + (cnt.onay ? '<span class="gv-dot">' + (cnt.onay > 9 ? '9+' : cnt.onay) + '</span>' : '') +
        '</button>' +
        '<button type="button" class="gv-iconbtn" id="gvBell" aria-label="Bildirimler" title="Bildirimler">' +
          ico('i-bell') + (cnt.bildirim ? '<span class="gv-dot">' + (cnt.bildirim > 9 ? '9+' : cnt.bildirim) + '</span>' : '') +
        '</button>' +
        (kisisel
          ? '<button type="button" class="gv-iconbtn" id="gvNote" aria-label="Hızlı not al" title="Hızlı not al">' + ico('i-file') + '</button>'
          : '') +
        '<button class="gv-me" id="gvMe" aria-haspopup="true" aria-expanded="false">' +
          '<span class="gv-ava">' + esc(session.ini) + '</span>' +
          '<span class="gv-me-id"><span class="gv-me-name">' + esc(session.ad) + '</span>' +
          '<span class="gv-me-role">' + esc(session.rolAd) + '</span></span>' + ico('i-chev-down') +
        '</button>' +
      '</div>';
  }

  /* Üst çubuk açılır menüleri ve çekmeceleri. Hepsi `.gv-page` DIŞINA
     basılır (L-18) ve GV.refresh onları kapatır. */
  function wireTop(){
    /* — "Yeni" hızlı oluşturma menüsü — */
    var newBtn = document.getElementById('gvNew');
    if(newBtn){
      var wrap = document.getElementById('gvNewMenu');
      if(!wrap){
        wrap = document.createElement('div');
        wrap.className = 'gv-me-menu';
        wrap.id = 'gvNewMenu';
        document.body.appendChild(wrap);
      }
      /* Hedefler BUILT süzgecinden geçer — yayında olmayan hiçbir şey
         tıklanabilir görünmez (sahte buton yasağı). */
      var adaylar = [
        { ic:'i-building', lbl:'Müşteri',      href:'app-musteri-form.html' },
        { ic:'i-quote',    lbl:'Teklif',       href:'app-teklif-form.html' },
        { ic:'i-tasks',    lbl:'Görev',        href:'app-gorev-form.html' },
        { ic:'i-support',  lbl:'Destek talebi',href:'app-destek-form.html' },
        { ic:'i-link',     lbl:'Ödeme linki',  href:'app-odeme-linki-form.html' }
      ].filter(function(a){ return isBuilt(a.href) && dosyaIzinli(a.href); });

      wrap.innerHTML = '<div class="gv-me-menu-head"><div class="gv-me-menu-name">Yeni kayıt</div></div>' +
        (adaylar.length
          ? adaylar.map(function(a){ return '<a href="' + a.href + '">' + ico(a.ic) + esc(a.lbl) + '</a>'; }).join('')
          : '<div class="gv-me-menu-empty">Bu turda yayında olan oluşturma ekranı yok.<br>' +
            'Dikey dilim üç ekranla sınırlı — form ekranları sonraki fazda açılır.</div>');
      dropdown(newBtn, wrap);
    }

    /* — Takvim çekmecesi — */
    var cal = document.getElementById('gvCal');
    if(cal) GV.on(cal, 'click', function(){ takvimCekmece(); }, 'calclick');

    /* — Bekleyen onay çekmecesi — */
    var ap = document.getElementById('gvApprove');
    if(ap) GV.on(ap, 'click', function(){ onayCekmece(); }, 'apclick');

    /* — Bildirim çekmecesi — */
    var bell = document.getElementById('gvBell');
    if(bell) GV.on(bell, 'click', function(){ bildirimCekmece(); }, 'bellclick');

    /* — Hızlı Not çekmecesi — quicknote.js sağlar — */
    var note = document.getElementById('gvNote');
    if(note) GV.on(note, 'click', function(){
      if(GV.quickNote) GV.quickNote.ac();
      else if(GV.toast) GV.toast('Hızlı Not bileşeni bu sayfada yüklü değil.', 'warn');
    }, 'noteclick');

    /* — Profil menüsü — */
    var me = document.getElementById('gvMe');
    if(me){
      var mw = document.getElementById('gvMeMenu');
      if(!mw){
        mw = document.createElement('div');
        mw.className = 'gv-me-menu';
        mw.id = 'gvMeMenu';
        document.body.appendChild(mw);
      }
      mw.innerHTML =
        '<div class="gv-me-menu-head">' +
          '<div class="gv-me-menu-name">' + esc(session.ad) + '</div>' +
          '<div class="gv-me-menu-mail">' + esc(session.eposta || '—') + ' · ' + esc(session.rolAd) + '</div>' +
        '</div>' +
        (isBuilt('app-ayar-profil.html') ? '<a href="app-ayar-profil.html">' + ico('i-user') + 'Profilim</a>' : '') +
        '<hr>' +
        '<a href="index.html">' + ico('i-logout') + 'Çıkış / Rol Değiştir</a>';
      dropdown(me, mw);
    }
  }

  function dropdown(btn, wrap){
    function setOpen(o){
      wrap.classList.toggle('is-open', o);
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      if(o){
        var r = btn.getBoundingClientRect();
        wrap.style.top = (r.bottom + 8) + 'px';
        wrap.style.right = Math.max(12, window.innerWidth - r.right) + 'px';
      }
    }
    GV.on(btn, 'click', function(e){
      e.stopPropagation();
      /* Açılmadan önce diğer açılır menüler kapanır */
      Array.prototype.forEach.call(document.querySelectorAll('.gv-me-menu.is-open'), function(o){
        if(o !== wrap) o.classList.remove('is-open');
      });
      setOpen(!wrap.classList.contains('is-open'));
    }, 'dd-' + btn.id);
    GV.on(document, 'click', function(e){
      Array.prototype.forEach.call(document.querySelectorAll('.gv-me-menu.is-open'), function(o){
        if(!o.contains(e.target)) o.classList.remove('is-open');
      });
    }, 'dd-doc');
    GV.on(document, 'keydown', function(e){
      if(e.key !== 'Escape') return;
      Array.prototype.forEach.call(document.querySelectorAll('.gv-me-menu.is-open'), function(o){
        o.classList.remove('is-open');
      });
    }, 'dd-esc');
  }

  /* ---- Üst çubuk çekmeceleri --------------------------------------
     ui.js'in GV.drawer bileşeni varsa o kullanılır; yoksa çekmece
     açılmaz ve kullanıcıya dürüst mesaj verilir (uydurma yok). */
  function cekmece(baslik, alt, html){
    if(!GV.drawer){
      if(GV.toast) GV.toast(baslik + ' çekmecesi için ui.js gerekli.', 'warn');
      return null;
    }
    /* GV.drawer sözleşmesi { title, body, actions, side, onMount, onOpen }
       kabul eder — `sub` alanı YOKTUR, alt başlık gövdenin ilk satırına
       basılır. Desteklenmeyen anahtar göndermek sessizce yutulurdu. */
    var govde = (alt ? '<p class="gv-drawer-sub">' + esc(alt) + '</p>' : '') + html;
    return GV.drawer({ title:baslik, body:govde });
  }

  function takvimCekmece(){
    var D = window.DB || {};
    var t = D.today;
    var me = session.emp;
    /* Bugünün işi — görev termini ve toplantı. Uydurma yok: kaynak DB. */
    var gorev = (D.tasks || []).filter(function(x){
      return x.termin === t && x.sorumlu === me &&
             ['Tamamlandı','İptal edildi','Arşivlendi'].indexOf(x.durum) === -1;
    });
    /* Alan adları DB şemasından okundu: toplantı başlığı `ad`, tarih ISO
       damgasıdır (`2026-08-06T10:00`) — ayrı `saat` alanı YOKTUR. */
    var toplanti = (D.meetings || []).filter(function(x){ return String(x.tarih || '').slice(0,10) === t; });

    var html = '<div class="gv-drawer-sec"><h4>Bugün · ' + esc(t) + '</h4>';
    if(!gorev.length && !toplanti.length){
      html += '<div class="gv-state"><p>Bugün için planlanmış iş ya da toplantı yok.</p></div>';
    }else{
      html += '<ul class="gv-tl">';
      toplanti.forEach(function(m){
        var saat = String(m.tarih || '').slice(11,16);
        html += '<li><b>' + esc(m.ad || m.kod) + '</b><span class="gv-tl-meta">Toplantı' +
                (saat ? ' · ' + esc(saat) : '') + '</span></li>';
      });
      gorev.forEach(function(g){
        html += '<li><b>' + esc(g.baslik) + '</b><span class="gv-tl-meta">Görev · ' + esc(g.durum) + '</span></li>';
      });
      html += '</ul>';
    }
    html += '</div>';
    html += '<p class="gv-note-hint">Takvim ayrı bir üst düzey bölüm değildir (§3.2). ' +
            'Tam takvim görünümü sonraki fazda Gündem paneline bağlanacak.</p>';
    cekmece('Takvim', 'Bugünün ajandası', html);
  }

  function onayCekmece(){
    var D = window.DB || {};
    var bekleyen = (D.approvals || []).filter(function(x){ return x.durum === 'Bekliyor'; });
    var html = '<div class="gv-drawer-sec"><h4>Bekleyen onaylar · ' + bekleyen.length + '</h4>';
    if(!bekleyen.length){
      html += '<div class="gv-state"><p>Bekleyen onay yok.</p></div>';
    }else{
      html += '<ul class="gv-tl">';
      bekleyen.slice(0, 10).forEach(function(a){
        /* Onay kaydında kaynak alanı `kayit`tir (`SAT-2026-014`), `kaynak` değil. */
        html += '<li><b>' + esc(a.baslik || a.kod) + '</b>' +
                '<span class="gv-tl-meta">' + esc(a.tur || '—') + ' · ' + esc(a.kayit || a.kod) + '</span></li>';
      });
      html += '</ul>';
      if(bekleyen.length > 10) html += '<p class="gv-note-hint">İlk 10 kayıt gösteriliyor.</p>';
    }
    html += '</div>';
    html += '<p class="gv-note-hint">Onay eylemleri Operasyon ekranında toplanacak (§6.3). ' +
            'Bu çekmece bu turda yalnız okur — karar verdirmez.</p>';
    cekmece('Bekleyen Onaylar', bekleyen.length + ' kayıt', html);
  }

  function bildirimCekmece(){
    var D = window.DB || {};
    var okunmamis = (D.notifications || []).filter(function(x){ return !x.okundu; });
    var html = '<div class="gv-drawer-sec"><h4>Okunmamış · ' + okunmamis.length + '</h4>';
    if(!okunmamis.length){
      html += '<div class="gv-state"><p>Okunmamış bildirim yok.</p></div>';
    }else{
      html += '<ul class="gv-tl">';
      okunmamis.slice(0, 12).forEach(function(n){
        html += '<li><b>' + esc(n.baslik || n.kod) + '</b>' +
                '<span class="gv-tl-meta">' + esc(n.tur || '') +
                (n.tarih ? ' · ' + esc(String(n.tarih).replace('T',' ')) : '') + '</span></li>';
      });
      html += '</ul>';
    }
    html += '</div>';
    cekmece('Bildirimler', okunmamis.length + ' okunmamış', html);
  }

  /* ---- Breadcrumb ---- */
  function renderCrumb(activeSec, activeScreen){
    var el = document.getElementById('gvCrumb');
    if(!el) return;
    var S = SECTIONS[activeSec] || SECTIONS.gundem;
    var item = S.menu.filter(function(it){ return it.screen === activeScreen; })[0];
    var extra = el.dataset.extra || '';
    var first = S.menu.filter(function(it){ return it.href; })[0];
    var html = '<a href="app-panel.html">Gündem</a>' + ico('i-chev-right');
    if(activeSec !== 'gundem'){
      html += '<a href="' + (first ? first.href : 'app-panel.html') + '">' + esc(S.title) + '</a>' + ico('i-chev-right');
    }
    if(item){
      if(extra){
        html += '<a href="' + item.href + '">' + esc(item.lbl) + '</a>' + ico('i-chev-right') +
                '<span aria-current="page">' + esc(extra) + '</span>';
      }else{
        html += '<span aria-current="page">' + esc(item.lbl) + '</span>';
      }
    }else if(extra){
      html += '<span aria-current="page">' + esc(extra) + '</span>';
    }
    el.innerHTML = html;
  }

  /* ===================================================================
     6. MENÜ AÇ/KAPA — iskelet düğümlerine bağlanır, syncNav'da DEĞİL (L-36)
     =================================================================== */
  function wireNav(){
    var burger  = document.getElementById('gvBurger');
    var overlay = document.getElementById('gvOverlay');
    var divider = document.getElementById('gvDivider');

    function setNav(o){
      document.body.classList.toggle('gv-nav-open', o);
      if(burger) burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    }
    if(burger)  GV.on(burger, 'click', function(){ setNav(!document.body.classList.contains('gv-nav-open')); }, 'burger');
    if(overlay) GV.on(overlay, 'click', function(){ setNav(false); }, 'overlay');
    GV.on(document, 'keydown', function(e){ if(e.key === 'Escape') setNav(false); }, 'navesc');

    if(divider){
      var collapsed = false;
      try{ collapsed = localStorage.getItem(LS_MENU) === '1'; }catch(e){}
      if(collapsed) document.body.classList.add('gv-menu-off');

      function menuOpen(){
        if(window.matchMedia('(max-width:980px)').matches) return document.body.classList.contains('gv-nav-open');
        if(window.matchMedia('(min-width:981px) and (max-width:1180px)').matches) return document.body.classList.contains('gv-menu-on');
        return !document.body.classList.contains('gv-menu-off');
      }
      function syncDivider(){
        var open = menuOpen();
        divider.setAttribute('aria-expanded', open ? 'true' : 'false');
        divider.setAttribute('aria-label', open ? 'Bölüm menüsünü daralt' : 'Bölüm menüsünü genişlet');
      }
      GV.on(divider, 'click', function(){
        var open = menuOpen();
        document.body.classList.toggle('gv-menu-off', open);
        document.body.classList.toggle('gv-menu-on', !open);
        try{ localStorage.setItem(LS_MENU, open ? '1' : '0'); }catch(e){}
        syncDivider();
      }, 'divider');
      GV.on(window, 'resize', syncDivider, 'dividerresize');
      syncDivider();
    }
  }

  /* ===================================================================
     7. YAYINDA OLAN EKRANLAR — "sahte buton bırakma" kuralı
     Bu liste R2'nin GERÇEK durumudur. Dikey dilim üç ekranla sınırlı;
     listeye ekran ancak dosya doğduğunda eklenir. Bu listede olmayan her
     bağlantı `markWip` tarafından data-wip'e çevrilir ve tıklanamaz olur.
     =================================================================== */
  var BUILT = [
    'index.html',
    'app-panel.html',
    'app-musteri.html',
    'app-musteri-detay.html',
    'app-musteri-form.html',
    'app-satis-akisi.html',
    'app-firsat-detay.html',
    'app-firsat-form.html',
    'app-teklif.html',
    'app-teklif-detay.html',
    'app-teklif-form.html',
    'app-fatura.html',
    'app-fatura-detay.html',
    'app-fatura-form.html',
    'app-tahsilat.html',
    'app-tahsilat-form.html',
    'app-satinalma.html',
    'app-operasyon.html',
    /* Dilim 3 — Proje ve Operasyon. Liste ve form ekranları (proje · görev
       formu · destek listesi ve formu) HENÜZ YAZILMADI ve bilerek listede
       DEĞİL: kabuk onları `markWip` ile kilitli tutar, ölü bağlantı doğmaz. */
    'app-proje.html',
    'app-proje-detay.html',
    'app-gorev.html',
    'app-gorev-detay.html',
    'app-gorev-form.html',
    'app-destek.html',
    'app-destek-detay.html',
    'app-destek-form.html',
    /* Dilim 4 — Ekip ve Kaynaklar. Personel detay/form ve izin formu HENÜZ
       YAZILMADI ve bilerek listede değil; kabuk onları `markWip` ile kilitli
       tutar, ölü bağlantı doğmaz. */
    'app-personel.html',
    'app-zaman.html',
    'app-varlik.html',
    'app-izin-detay.html',
    'app-odeme-linki.html',
    'app-odeme-linki-form.html',
    'app-odeme-linki-detay.html',
    /* Dış ödeme ekranları kabuğu YÜKLEMEZ (§8.3) ama iç ekranlar onlara
       bağlantı verir; listede olmasalar `markWip` bağlantıyı keserdi. */
    'app-odeme.html',
    'app-odeme-sonuc.html',
    'app-rapor.html',
    /* Dilim 6 — rota defterinin son dokuz KARŞILIĞI VAR satırı. Liste ekran
       dosya diske düştükçe büyür; `ayar-ekseni` bu listeyi diskle BİREBİR
       karşılaştırıyor (iki yönde de), yani yayına giren ekranın burada
       olmaması da, burada olup diskte olmaması da kırmızı yanar. */
    'app-proje-form.html',
    'app-satinalma-form.html',
    'app-izin-form.html',
    'app-personel-form.html',
    'app-demirbas-form.html',
    'app-arac-form.html',
    'app-arac-detay.html',
    'app-demirbas-detay.html',
    'app-personel-detay.html',
    /* Dilim 5 — Ayarlar. Dört ekranın dördü de şartname §3.3'ün AYNI ayar
       kabuğudur; sekmeler `GV.shell.ayarSekmeleri()` ile yetkiden üretilir. */
    'app-ayar-profil.html',
    'app-ayar-log.html',
    'app-ayar-entegrasyon.html',
    'app-ayar-sirket.html'
  ];
  GV.built = BUILT;

  function isBuilt(href){
    if(!href) return false;
    if(/^(https?:|mailto:|tel:|#)/.test(href)) return true;
    var file = href.split('?')[0].split('#')[0];
    return BUILT.indexOf(file) !== -1;
  }
  GV.isBuilt = isBuilt;

  /* Ekran → modül eşlemesi; menü kaydından okunur, ikinci liste tutulmaz. */
  function modulOf(sec, screen){
    var sc = SECTIONS[sec];
    if(!sc) return null;
    var it = (sc.menu || []).filter(function(x){ return x.screen === screen; })[0];
    if(it && it.modul) return it.modul;
    return sc.modul || null;
  }

  /* Dosya adından menü kaydını bulur. Kapıyı TEK kaynaktan beslemenin yolu
     budur: kaydın kendisi `screen` · `roles` · `modul` alanlarını taşır ve
     `Perm.item` üçünü birden uygular. */
  function menuKaydiDosya(dosya){
    var f = String(dosya || '').split('?')[0].split('#')[0];
    if(!f) return null;
    var bulunan = null;
    RAIL_ORDER.forEach(function(key){
      ((SECTIONS[key] || {}).menu || []).forEach(function(it){
        if(!bulunan && it.href && it.href.split('?')[0] === f) bulunan = { alan:key, it:it };
      });
    });
    return bulunan;
  }

  /* ⚠️ İKİ KUSUR BURADAYDI ve ikisi de bu dosyanın kendi yazdığı sözü
     bozuyordu (bkz. SCREEN_DENY başlığı: "menü gizlemesi ile doğrudan adres
     kapısı TEK kaynaktan beslenir — biri kapanıp diğeri açık kalamaz").

     1. `SCREEN_DENY[f]` — `f` bir DOSYA adı (`app-operasyon.html`),
        `SCREEN_DENY` ise EKRAN adıyla anahtarlı (`operasyon`). Arama hiçbir
        zaman tutmuyordu; yordam üç yasağın hiçbirini uygulamıyordu.
     2. Menü kaydının `roles:` listesi doğrudan adrese HİÇ uygulanmıyordu.
        Ölçüldü: `app-ayar-sirket.html?role=operasyon` 403 basmıyor, sayfa
        açılıyordu. Menü girdisi gizliydi ama adres açıktı — yani kapı
        yalnız görünürlükteydi.

     Çözüm ikinci bir liste değil, VAR OLAN kaydı okumaktır: `Perm.item(it)`
     zaten `SCREEN_DENY` + `modul` + `roles` üçünü birden uygular ve menü
     çizimi de aynı yordamı çağırır. Böylece iki kapı tek yordamdan besleniyor. */
  function dosyaIzinli(dosya, sec, screen){
    if(!dosya) return false;
    var kayit = menuKaydiDosya(dosya);
    if(kayit){
      if(!Perm.sec(kayit.alan)) return false;
      if(!Perm.item(kayit.it)) return false;
      return true;
    }
    /* Menüde girdisi olmayan ekran (detay · form · dış ödeme): kaydı yok,
       o yüzden ekran adı ve modül gövdeden/çağrıdan okunur. */
    var ekran = screen || (document.body && document.body.dataset ? document.body.dataset.screen : '') || '';
    if(SCREEN_DENY[ekran] && SCREEN_DENY[ekran].indexOf(Perm.role()) !== -1) return false;
    if(!Perm.modul(modulOf(sec || ((document.body && document.body.dataset && document.body.dataset.sec) || 'gundem'), ekran))) return false;
    return true;
  }

  function markWip(root){
    var scope = root || document;
    Array.prototype.forEach.call(scope.querySelectorAll('a[href]'), function(a){
      var href = a.getAttribute('href');
      if(isBuilt(href) || a.hasAttribute('data-wip')) return;
      var label = (a.textContent || '').trim().replace(/\s+/g,' ').slice(0, 40) || 'Bu ekran';
      a.setAttribute('data-wip', label);
      a.dataset.wipHref = href;
      a.removeAttribute('href');
      a.setAttribute('role', 'link');
      a.setAttribute('aria-disabled', 'true');
      a.setAttribute('tabindex', '0');
      a.setAttribute('title', label + ' — bu ekran henüz yayında değil');
    });
  }
  GV.markWip = markWip;

  var wipObserver = null;
  function watchWip(){
    if(wipObserver) return;
    wipObserver = new MutationObserver(function(muts){
      if(muts.some(function(m){ return m.addedNodes.length; })){
        markWip(document.querySelector('.gv-main') || document);
      }
    });
    var main = document.querySelector('.gv-main');
    if(main) wipObserver.observe(main, { childList:true, subtree:true });
  }

  /* ===================================================================
     8. YETKİ KAPISI — 403
     =================================================================== */
  function guard(activeSec, activeScreen){
    var ok = Perm.sec(activeSec);
    if(SCREEN_DENY[activeScreen] && SCREEN_DENY[activeScreen].indexOf(Perm.role()) !== -1) ok = false;
    if(!dosyaIzinli(location.pathname.split('/').pop(), activeSec, activeScreen)) ok = false;
    if(ok) return true;

    var main = document.querySelector('.gv-page');
    if(!main) return false;
    main.innerHTML =
      '<div class="gv-card"><div class="gv-state is-danger">' +
        '<div class="gv-state-ico">' + ico('i-lock', 'ic-xl') + '</div>' +
        '<h3>Bu ekranı görüntüleme yetkiniz yok</h3>' +
        '<p><b>' + esc(session ? session.rolAd : '—') + '</b> rolü bu alana erişemez. ' +
        'Erişim gerekiyorsa sistem yöneticinizden yetki talep edin.</p>' +
        '<div class="gv-state-acts">' +
          '<a class="btn btn-acc" href="app-panel.html">' + ico('i-home') + ' Gündeme Dön</a>' +
          '<a class="btn btn-line" href="index.html">' + ico('i-logout') + ' Rol Değiştir</a>' +
        '</div>' +
      '</div></div>';
    document.title = 'Yetkisiz erişim — GaviaWorks CRM';
    return false;
  }

  /* ===================================================================
     9. İSKELET
     =================================================================== */
  function buildSkeleton(){
    if(document.querySelector('.gv-app')) return;

    var keep = document.createDocumentFragment();
    Array.prototype.slice.call(document.body.childNodes).forEach(function(n){
      if(n.nodeType === 1 && n.tagName === 'SCRIPT') return;
      keep.appendChild(n);
    });

    var app = document.createElement('div');
    app.className = 'gv-app';
    app.innerHTML =
      '<aside class="gv-rail" id="gvRail"></aside>' +
      '<nav class="gv-menu" id="gvMenu"></nav>' +
      '<button type="button" class="gv-divider" id="gvDivider" aria-controls="gvMenu" aria-expanded="true" ' +
        'aria-label="Bölüm menüsünü daralt"><span>' + ico('i-chev-left','ic-sm') + '</span></button>' +
      '<div class="gv-overlay" id="gvOverlay"></div>' +
      '<header class="gv-top" id="gvTop"></header>' +
      '<main class="gv-main" id="gvMain"><div class="gv-page">' +
        '<nav class="gv-crumb" id="gvCrumb" aria-label="Konum"></nav>' +
        '<div id="gvFlash" class="gv-flash" aria-live="polite"></div>' +
        '<div id="gvPageHead"></div>' +
      '</div></main>';

    var skip = document.createElement('a');
    skip.className = 'gv-skip';
    skip.href = '#gvMain';
    skip.textContent = 'İçeriğe atla';

    document.body.insertBefore(app, document.body.firstChild);
    document.body.insertBefore(skip, app);
    app.querySelector('.gv-page').appendChild(keep);
  }

  GV.pageHead = function(cfg){
    var host = document.getElementById('gvPageHead') ||
               document.querySelector('.gv-page .gv-page-head');
    if(!host) return;
    host.outerHTML =
      '<div class="gv-page-head"><div>' +
        (cfg.eyebrow ? '<div class="ph-eyebrow">' + esc(cfg.eyebrow) + '</div>' : '') +
        '<h1>' + esc(cfg.title) + '</h1>' +
        '<div class="ph-sub" data-listcount>' + esc(cfg.sub || '—') + '</div>' +
      '</div>' +
      (cfg.actions && cfg.actions.length
        ? '<div class="ph-actions">' + cfg.actions.map(function(a, i){
            var inner = (a.icon ? ico(a.icon) + ' ' : '') + esc(a.label);
            return a.href
              ? '<a class="btn ' + (a.cls || 'btn-line') + '" href="' + a.href + '">' + inner + '</a>'
              : '<button type="button" class="btn ' + (a.cls || 'btn-line') + '"' +
                (a.id ? ' id="' + a.id + '"' : '') + ' data-ph-act="' + i + '">' + inner + '</button>';
          }).join('') + '</div>'
        : '') +
      '</div>';

    (cfg.actions || []).forEach(function(a, i){
      if(a.href || typeof a.run !== 'function') return;
      var btn = document.querySelector('.ph-actions [data-ph-act="' + i + '"]');
      if(btn) btn.addEventListener('click', function(ev){ a.run(ev, btn); });
    });
  };

  /* ===================================================================
     10. TAZELEME — location.reload() KULLANILMAZ (L-15)
     =================================================================== */
  GV.refresh = function(){
    /* Mount düğümü taze kopyayla değiştirilir — delege dinleyiciler birikmesin (L-16) */
    var m = document.getElementById('rec');
    if(m && m.parentNode){
      var taze = document.createElement(m.tagName);
      taze.id = m.id;
      if(m.className) taze.className = m.className;
      m.parentNode.replaceChild(taze, m);
    }
    /* Açık modal / çekmece kapatılır — .gv-page dışına basıldıkları için
       mount değişince ölmezler (L-18). */
    var acik = document.querySelectorAll('.gv-scrim, .gv-drawer, .gv-modal-scrim');
    if(acik.length){
      Array.prototype.forEach.call(acik, function(el){
        if(el.__gvClose){ el.__gvClose(); return; }
        el.remove();
      });
      document.body.style.overflow = '';
    }
    Array.prototype.forEach.call(document.querySelectorAll('.gv-me-menu.is-open'), function(o){
      o.classList.remove('is-open');
    });
    if(typeof syncNav === 'function') syncNav();
    document.dispatchEvent(new CustomEvent('gv:ready'));
  };

  GV.on = function(el, type, fn, key){
    if(!el) return;
    var reg = el.__gvOn || (el.__gvOn = {});
    var k = key || type;
    if(reg[k]) el.removeEventListener(type, reg[k]);
    reg[k] = fn;
    el.addEventListener(type, fn);
  };

  /* ===================================================================
     11. İKON SPRITE
     =================================================================== */
  function injectSprite(){
    if(document.getElementById('gvSprite')) return Promise.resolve();
    return fetch('assets/img/icons.svg')
      .then(function(r){ return r.text(); })
      .then(function(txt){
        var d = document.createElement('div');
        d.id = 'gvSprite';
        d.style.display = 'none';
        d.setAttribute('aria-hidden','true');
        d.innerHTML = txt;
        document.body.insertBefore(d, document.body.firstChild);
      })
      .catch(function(){ /* sprite yoksa arayüz metinle çalışmayı sürdürür */ });
  }

  /* ===================================================================
     12. BAŞLATMA
     =================================================================== */
  function boot(){
    session = resolveSession();

    if(!session){
      if(!/index\.html$/.test(location.pathname) && location.pathname !== '/' &&
         !/\/$/.test(location.pathname)){
        location.replace('index.html');
        return;
      }
      return;
    }
    GV.session = session;
    buildSkeleton();

    var body = document.body;
    var activeSec    = body.dataset.sec || 'gundem';
    var activeScreen = body.dataset.screen || '';
    var cnt = counters();
    GV.counters = cnt;

    syncNav = function(){
      var c = counters();
      GV.counters = c;
      renderRail(activeSec, c);
      renderMenu(activeSec, activeScreen, c);
      renderTop(c);
      wireTop();
      /* ⚠️ wireNav() BURADA ÇAĞRILMAZ (L-36): bağlandığı düğümler
         iskelettedir ve yerinde kalır. Çağırmak her tazelemede document
         keydown ve window resize dinleyicisi biriktirirdi. */
    };

    renderRail(activeSec, cnt);
    renderMenu(activeSec, activeScreen, cnt);
    renderTop(cnt);
    renderCrumb(activeSec, activeScreen);
    wireNav();
    wireRail();
    wireTop();

    var allowed = guard(activeSec, activeScreen);
    markWip(document);
    watchWip();
    document.dispatchEvent(new CustomEvent(allowed ? 'gv:ready' : 'gv:denied',
      { detail:{ session:session, counters:cnt, section:activeSec } }));
  }

  GV.shell = {
    sections:SECTIONS,
    railOrder:RAIL_ORDER,
    secByRole:SEC_BY_ROLE,
    /* Ayar sekmeleri — ham kayıt ve yetkiden SÜZÜLMÜŞ küme (§3.3) */
    ayarSekmeHam:AYAR_SEKME,
    ayarSekmeleri:ayarSekmeleri,
    /* Ölçüm kapısı — tasks/qa/menu.js bunu çağırır */
    visibleItems:gorunurGirdiler,
    session:function(){ return session; },
    setSession:function(empKod, roleKey){
      var s = (roleKey === 'musteri' || /^YTK-/.test(empKod || ''))
        ? buildMusteriSession(/^YTK-/.test(empKod || '') ? empKod : null)
        : buildSession(empKod, roleKey);
      if(s){ writeSession(s); session = s; GV.session = s; }
      return s;
    },
    clear:function(){ try{ sessionStorage.removeItem(SS_KEY); }catch(e){} },
    counters:counters,
    ekranAcilabilir:function(href){ return isBuilt(href) && dosyaIzinli(String(href||'').split('?')[0]); },
    crumb:function(text){
      var el = document.getElementById('gvCrumb');
      if(el){
        el.dataset.extra = text;
        renderCrumb(document.body.dataset.sec || 'gundem', document.body.dataset.screen || '');
      }
    }
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ injectSprite().then(boot); });
  }else{
    injectSprite().then(boot);
  }
})();
