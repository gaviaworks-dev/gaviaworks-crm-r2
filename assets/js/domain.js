/* =====================================================================
   domain.js — İŞ KURALI YORDAMLARI (ortak katman)

   NEDEN VAR: Aynı işlem birden çok ekrandan yürütülüyordu ve her ekran
   kendi mutasyonunu yazdığı için sonuçlar AYRIŞIYORDU:

   · VB-06 — fatura "Ödendi" işaretlenince bağlı tahsilat açık kalıyordu;
     tahsilat kapanınca fatura açık kalıyordu. Kullanıcı faturayı ödendi
     yaptıktan sonra tahsilat sekmesinde hâlâ açık alacak görüyordu:
     **ekran kendi içinde çelişiyordu.**
   · VB-23 — teslim onayı üç ekranda üç farklı yürütülüyordu: liste yalnız
     `musteriOnay` yazıyor, detay `durum`u da `Onaylandı` yapıyordu; yetki
     ekseni liste tarafında `onay`, detay tarafında `duzenle`ydi.
   · VB-25 — `DB.milestones[].odemeDurum` bağlı faturanın ayna alanıydı ve
     fatura değişince sessizce ayrışıyordu.

   KURAL: Bir olgu birden çok koleksiyona dokunuyorsa mutasyon BURADA
   tanımlanır; ekran yalnız çağırır ve sonucu raporlar. Yetki kapısı da
   burada tek eksende durur — iki ekran farklı yetki soramaz.

   `ui.js`'ten ayrı bir dosyadır: `ui.js` alana kör bileşen katmanıdır,
   bu dosya GaviaWorks iş kuralını bilir. Yükleme sırası: veri → shell →
   ui → domain.
   ===================================================================== */
(function(){
  'use strict';
  var GV = window.GV = window.GV || {};

  /* =====================================================================
     ARŞİV — TEK EKSEN (K-33 · VB-20 eki)

     Bir kaydın "çalışma kümesinden çıkmış" olması ÜÇ ayrı yerde
     yazılabiliyordu: `arsiv:true`, `aktif:false` ve `durum:'Arşivlendi'`.
     Üç eksen aynı soruya üç cevap verebilir; hangisinin kanon olduğu hiçbir
     yerde yazılı değildi ve 19 okuma yeri ikisini birden okuyordu.

     KURAL — ölçülerek kondu, tercih değil:
       · `arsiv === true`            her kayıtta arşivdir, tartışmasız.
       · Kaydın bir `durum` ekseni VARSA kanon odur; `aktif` OKUNMAZ.
         Hangi durumun "pasif" saydığı varlığa göre değişir ve listenin
         kendi sözleşmesinde (`cfg.passive`) yazılır — çünkü bir tedarik
         kaynağı için `Pasif` emekliliktir, bir personel için değildir.
         Genel liste yalnız `Arşivlendi`yi bilir.
       · Kaydın `durum` ekseni YOKSA `aktif` kanondur ve okunur.
         Ölçüldü: yalnız üç koleksiyon böyledir — `departments` (3 pasif),
         `contacts` (1), `customers` (`durum` K-21'de tuzağa çevrildi).

     Bu yordam, `durum`u olan bir kayıtta `aktif`e ASLA dokunmaz. Nöbetçi
     (`tasks/qa/aktif-ekseni.js`) tam olarak bunu ölçer. */
  /* Kaydın GERÇEK `durum` ekseni — yoksa `undefined`.
     ⚠️ Alan OKUNARAK karar verilemez: `DB.customers[].durum` K-21'de tuzağa
     çevrildi ve okumak sayacı artırır. Ölçüldü — ilk yazım tam bunu yaptı ve
     `bayat-alan` ekseni yüklemede 12 yanlış alarm bildirdi. Tuzak bir
     GETTER'dır; değer tanımlayıcısı olup olmadığına bakmak alanı okumaz. */
  function kanonDurum(r){
    var t = Object.getOwnPropertyDescriptor(r, 'durum');
    if(!t || t.get) return undefined;
    return typeof t.value === 'string' ? t.value : undefined;
  }
  GV.kanonDurum = kanonDurum;

  GV.arsivDurumlariVarsayilan = ['Arşivlendi'];
  GV.arsivli = function(r, pasif){
    if(!r || typeof r !== 'object') return false;
    if(r.arsiv === true) return true;
    var d = kanonDurum(r);
    if(d !== undefined)
      return (pasif || GV.arsivDurumlariVarsayilan).indexOf(d) !== -1;
    return r.aktif === false;   /* K-33: durumu yoksa `aktif` kanondur */
  };

  /* =====================================================================
     `aktif` TUZAĞI — BÜTÜN VARLIKLARDA (K-33)

     K-18'de `DB.employees[].aktif` tuzağa çevrilmişti; ölçüldü ki aynı tuzak
     53 koleksiyonda daha kuruluydu: 566 kayıtta alan vardı ve **yalnız 8'i
     `false`**. Yani alan neredeyse hiçbir yerde bir şey ayırt etmiyor, ama
     `durum` ile yan yana okunduğunda ikinci bir eksen gibi davranıyordu.

     KİMİ TUZAĞA ÇEVİRİR — liste elle tutulmaz, VERİDEN TÜRETİLİR:
     bir koleksiyonun herhangi bir kaydında gerçek (string) `durum` varsa o
     koleksiyon `durum` kanonludur ve `aktif` alanı tuzağa çevrilir. Elle
     tutulan bir liste, yeni bir koleksiyon eklendiğinde sessizce eskirdi.

     `durum` ekseni olmayan koleksiyonlarda alan KALIR — orada kanon odur
     (`departments` · `contacts` · `customers`). `customers` bu ayrımı
     doğrular: alanı `durum` VAR ama K-21'de tuzağa çevrildiği için değeri
     `undefined` döner, dolayısıyla kanon olarak `aktif` kalır. Karar alan
     ADINA değil DEĞERİNE bakılarak verilir.

     Alan silinmez, TUZAĞA çevrilir: okuyan `undefined` alır ve sayaç artar.
     `enumerable:false` — dışa aktarma ve `Object.keys` taraması tuzağı
     tetiklemez, yalnız gerçek bir karar okuması tetikler. */
  GV.bayatAktifKur = function(){
    if(!window.DB) return null;
    DB.bayatAktif = { okuma:[], yazma:[], sayac:0, tuzakli:[], kanon:[] };

    Object.keys(DB).forEach(function(ad){
      var v = DB[ad];
      if(!Array.isArray(v) || !v.length) return;
      var kayitlar = v.filter(function(x){ return x && typeof x === 'object'; });
      if(!kayitlar.length) return;
      var alanli = kayitlar.filter(function(x){
        return Object.getOwnPropertyDescriptor(x, 'aktif'); });
      if(!alanli.length) return;

      var durumlu = kayitlar.some(function(x){ return kanonDurum(x) !== undefined; });
      if(!durumlu){ DB.bayatAktif.kanon.push(ad); return; }

      var cevrilen = 0;
      alanli.forEach(function(x){
        var t = Object.getOwnPropertyDescriptor(x, 'aktif');
        if(t.get) return;              /* zaten tuzaklı (hr.js · employees) */
        delete x.aktif;   /* K-33: tuzağı kuran tek yer */
        Object.defineProperty(x, 'aktif', {
          configurable:true, enumerable:false,
          get:function(){
            DB.bayatAktif.okuma.push({ koleksiyon:ad, kod:x.kod || null });
            DB.bayatAktif.sayac++;
            return undefined;
          },
          set:function(){
            DB.bayatAktif.yazma.push({ koleksiyon:ad, kod:x.kod || null });
            DB.bayatAktif.sayac++;
          }
        });
        cevrilen++;
      });
      if(cevrilen) DB.bayatAktif.tuzakli.push({ koleksiyon:ad, kayit:cevrilen });
    });
    return DB.bayatAktif;
  };
  GV.bayatAktifKur();

  function can(action){ return !(GV.perm && GV.perm.can) || !!GV.perm.can(action); }
  function saat(){ return (window.DB ? DB.today : '') + 'T09:00'; }
  /* Aktivite kaydı kişiyi KOD olarak tutar, ad olarak değil (VB-12).
     Ad `GV.activity` içinde `DB.empName` ile çözülür; oturum yoksa kayıt
     kişisiz kalır — uydurma bir "Sistem" adı yazmak, olmayan bir personeli
     varmış gibi gösterirdi (canon eksen 22b onu ihlal sayar). */
  function kim(){ return (GV.session && GV.session.emp) || null; }
  function log(kayit, metin, eski, yeni, tone, icon){
    if(!window.DB || !DB.activities) return;
    DB.activities.unshift({ kayit:kayit, tarih:saat(), kisi:kim(), metin:metin,
                            eski:eski == null ? '' : eski, yeni:yeni == null ? '' : yeni,
                            tone:tone || 'ok', icon:icon || 'i-check' });
  }

  /* ===================================================================
     DENETİM İZİ — TEK DEFTER (şartname [2.0.7] · [19.0.7] · CLOUD TURU)
     -------------------------------------------------------------------
     Ölçülen kusur: İKİ defter vardı ve birbirini görmüyordu.
       · `DB.activities` — `log()` ile append edilen kayıt olay defteri (207 kayıt)
       · `DB.logs`       — ekranlarda ELLE yazılan sistem günlüğü (7 kayıt),
                           üstelik kodu da uydurarak: `'LOG-' + (88300 + DB.logs.length)`
     Aynı olgu iki yere yazılıyor, hiçbir ekran ikisini birden okumuyordu.

     `GV.audit` ikisini tek yüzeye getirir. `DB.logs` KALDIRILMAZ — beş ekran
     onu okuyor ve `modul`/`ip` gibi alanları var; bunun yerine defter
     `activities` şemasına KÖPRÜLENİR: `GV.audit.yaz()` her iki deftere de
     yazar ve `GV.audit.oku()` ikisini birleştirip tek zaman çizelgesi döner.
     Böylece ekranlar tek tek taşınırken hiçbir kayıt görünmez olmaz.
     =================================================================== */
  var Audit = {
    /* Tek yazma noktası. `modul`/`ip` verilirse sistem günlüğüne de düşer. */
    yaz:function(c){
      c = c || {};
      if(!window.DB) return null;
      var t = saat(), me = kim();
      /* Ekranlar `islem` adıyla çağırıyor, domain yordamları `metin` adıyla —
         ikisi aynı şeydir. Boş metinle olay yazmak, defterde ne olduğu
         okunamayan bir satır bırakırdı. */
      var metin = c.metin || c.islem;
      if(metin) log(c.kayit, metin, c.eski, c.yeni, c.tone, c.icon);
      if(c.modul && DB.logs){
        DB.logs.unshift({
          /* Kod artık uydurulmuyor: sıra numarası defterin kendisinden gelir
             ve çakışma olasılığı ölçülebilir. */
          kod:'LOG-' + (90000 + DB.logs.length + 1),
          tarih:t, kisi:me, islem:c.islem || c.metin, kayit:c.kayit || null,
          modul:c.modul, ip:c.ip || null,
          eski:c.eski == null ? null : c.eski, yeni:c.yeni == null ? null : c.yeni
        });
      }
      return { tarih:t, kisi:me };
    },

    /* İki defteri birleştirip tek zaman çizelgesi döndürür. Ekran hangi
       deftere yazıldığını bilmek zorunda kalmaz. */
    oku:function(kayitKod, limit){
      if(!window.DB) return [];
      var a = (DB.activities || []).filter(function(x){
        return !kayitKod || x.kayit === kayitKod; })
        .map(function(x){ return { tarih:x.tarih, kisi:x.kisi, metin:x.metin,
          eski:x.eski, yeni:x.yeni, tone:x.tone, icon:x.icon, kayit:x.kayit,
          kod:null, defter:'olay' }; });
      var b = (DB.logs || []).filter(function(x){
        return !kayitKod || x.kayit === kayitKod; })
        .map(function(x){ return { tarih:x.tarih, kisi:x.kisi, metin:x.islem,
          eski:x.eski, yeni:x.yeni, tone:'info', icon:'i-shield', kayit:x.kayit,
          kod:x.kod || null, modul:x.modul, ip:x.ip, defter:'sistem' }; });
      /* ⚠️ ÇİFT SAYIM — `yaz({modul:…})` aynı olayı BİLEREK iki deftere
         yazar (olay defteri + sistem günlüğü; sebebi yukarıda). Birleştirme
         bunu görmezden gelince aynı satır zaman çizelgesinde İKİ KEZ
         görünüyordu: ekran "iki kere olmuş" diyen bir geçmiş basıyordu.
         Köprü kalır, tekrar düşer — aynı kayıt + aynı an + aynı metin tek
         olaydır. Sistem defterinin ek alanları (`modul`, `ip`) hayatta
         kalan satıra taşınır ki bilgi kaybolmasın. */
      var hepsi = a.concat(b).sort(function(x,y){ return String(y.tarih).localeCompare(String(x.tarih)); });
      var gorulen = {}, tekil = [];
      hepsi.forEach(function(x){
        var anahtar = [x.kayit || '', x.tarih || '', x.metin || ''].join('');
        var onceki = gorulen[anahtar];
        if(onceki){
          if(x.modul && !onceki.modul){ onceki.modul = x.modul; onceki.ip = x.ip; }
          return;
        }
        /* SATIR KİMLİĞİ — `GV.list` `key:` ile ZORUNLU bir alan ister;
           olay defterinin kaydında `kod` YOKTUR (yalnız sistem
           günlüğünde var). Dizi indeksi kimlik olamaz: iki defter de
           `unshift` ile büyür, indeks her yazmada kayar ve seçili satır
           başka bir kayda kayar. Kimlik, tekilleştirmenin zaten
           kullandığı İÇERİK anahtarıdır; benzersizliğini
           tekilleştirmenin kendisi garanti eder. Ayraç `\x01` bir
           HTML özniteliğinde taşınamaz, o yüzden kimlikte kaçışlı `|`
           kullanılır — kaçış olmadan eşleme birebir olmazdı. */
        x.id = [x.kayit || '', x.tarih || '', x.metin || '']
                 .map(function(v){ return String(v).replace(/\|/g,'\\|'); }).join('|');
        if(x.kod === undefined) x.kod = null;
        gorulen[anahtar] = x;
        tekil.push(x);
      });
      return limit ? tekil.slice(0, limit) : tekil;
    },

    /* İki defterin çakışıp çakışmadığı — veri kalitesi ekseni için */
    denetle:function(){
      if(!window.DB) return null;
      var olay = (DB.activities || []).length, sistem = (DB.logs || []).length;
      var kodsuz = (DB.activities || []).filter(function(x){ return !x.kayit; }).length;
      var kisisiz = (DB.activities || []).filter(function(x){ return !x.kisi; }).length;
      return { olay:olay, sistem:sistem, toplam:olay + sistem,
               kayitKodsuz:kodsuz, aktorsuz:kisisiz };
    }
  };

  GV.audit = Audit;

  /* ===================================================================
     MERKEZÎ DURUM GEÇİŞ MOTORU — şartname §6.1 (CLOUD TURU)
     -------------------------------------------------------------------
     Ölçüm: geçiş motoru tek varlıkta yaşıyordu (`GV.task.transition`).
     Kalan 11 modül durumu form ekranındaki serbest `<select>` ile yazıyordu;
     28 ekran bunu yapıyordu. Sonucu: ön analiz herhangi bir durumdan
     `Onaylandı`ya atlayabiliyor, destek `Yeni`den `Kapatıldı`ya
     geçebiliyordu — yani sözlük vardı, kural yoktu.

     Bu motor `DB.transitions` sözleşmesini TÜM varlıklara uygular.
     Ekran artık durum yazmaz; `GV.flow.gec()` çağırır ve sonucu basar.

     GÖREV BİLEREK AYRI TABLODA KALDI (`DB.taskTransitions`): beş oturumdur
     çalışıyor, `onayGerekli` türetimi ve bekleme ekseni gibi göreve özgü
     kuralları var. Motor onu olduğu yerden okur — çalışan bir şeyi taşımak
     için yeniden yazmak, şartname [0.0.4]'ün yasakladığı iştir.
     =================================================================== */

  /* Ek engel yordamları. Tablo `kapi:'ad'` yazar, motor burayı çağırır.
     `{ok:false, why:…}` dönerse geçiş reddedilir; `istisnaRol` listesindeki
     rol gerekçe + neden kodu ile geçebilir (ADR-04 · ADR-05). */
  var Gates = {
    /* Proje "Aktif" ön koşulları — şartname [5.2.3] */
    projeAktif:function(p){
      var eksik = [];
      if(!p.pm)         eksik.push('proje yöneticisi');
      if(!p.baslangic || !p.bitis) eksik.push('başlangıç/bitiş tarihi');
      if(!p.musteri && p.kaynak === 'Müşteri Sözleşmesi') eksik.push('müşteri');
      if(p.kaynak === 'Müşteri Sözleşmesi' && !p.sozlesme) eksik.push('sözleşme bağı');
      return eksik.length ? { ok:false, why:'Aktife almak için eksik: ' + eksik.join(', ') } : { ok:true };
    },
    /* Proje "Teslim" — açık kritik hata / başarısız zorunlu test [5.2.5] */
    projeTeslim:function(p){
      var acik = (window.DB && DB.bugs || []).filter(function(b){
        return b.proje === p.kod && b.siddet === 'Kritik' &&
               ['Kapandı','Reddedildi','Mükerrer'].indexOf(b.durum) === -1; });
      return acik.length
        ? { ok:false, why:'Projede ' + acik.length + ' açık kritik hata var: ' + acik.map(function(b){ return b.kod; }).join(', ') }
        : { ok:true };
    },
    /* Proje kapanış listesi — ADR-04: ENGELLER (eski karar engellemiyordu) */
    projeKapanis:function(p){
      var k = (GV.proje && GV.proje.kapanisKontrol) ? GV.proje.kapanisKontrol(p.kod) : null;
      if(!k || !k.length) return { ok:true };
      var kalan = k.filter(function(m){ return m.olculdu && !m.gecti; });
      if(kalan.length)
        return { ok:false, why:'Kapanış listesi tamamlanmadı: ' + kalan.map(function(m){ return m.etiket; }).join(' · ') };
      /* Ölçülemeyen madde kilit saymaz ama gerekçe ister (ADR-04) */
      var olculemez = k.filter(function(m){ return !m.olculdu; });
      return olculemez.length
        ? { ok:true, uyari:'Kaydı olmadığı için ölçülemeyen ' + olculemez.length + ' madde var — gerekçe zorunlu', gerekceZorunlu:true }
        : { ok:true };
    },
    /* Sözleşme aktivasyonu — imza + ödeme planı dengesi [8.1.6] */
    sozlesmeAktif:function(c){
      if(!c.imzaTarihi) return { ok:false, why:'İmza tarihi olmadan sözleşme aktive edilemez' };
      /* ⚠️ Ödeme planı `DB.milestones` içinde yaşar, `DB.projectMilestones`
         içinde değil — `work.js:406` ikisini bilerek ayırıyor: biri ödeme
         defteri, öbürü tutarsız proje olayı. Yanlış koleksiyonu okumak
         diziyi HER ZAMAN boş bırakıyor, yani kapı dengeli bir planı da
         "ödeme planı yok" diye reddediyordu.

         AYRICA: koleksiyon yüklü değilse "plan yok" DEMEK YANLIŞTIR —
         ölçülemedi demektir (L-13 · L-25). Ekran bu ikisini karıştırırsa
         kullanıcıya olmayan bir eksiklik bildirilir. */
      if(!window.DB || !DB.milestones)
        return { ok:false, olculemedi:true,
                 why:'Ödeme planı defteri bu ekranda yüklü değil — aktivasyon kontrolü yapılamadı.' };
      var taksit = DB.milestones.filter(function(m){ return m.sozlesme === c.kod; });
      if(!taksit.length) return { ok:false, why:'Ödeme planı yok — aktivasyon için en az bir taksit tanımlı olmalı' };
      var toplam = taksit.reduce(function(s,m){ return s + (m.odeme || 0); }, 0);
      var fark = Math.abs(toplam - (c.tutar || 0));
      return fark > 1
        ? { ok:false, why:'Ödeme planı toplamı sözleşme tutarıyla uyuşmuyor (fark ' + fark.toLocaleString('tr-TR') + ' ₺)' }
        : { ok:true };
    },
    /* Teklif yalnız onaylı ön analizden — şartname [7.2.3] */
    teklifOnAnaliz:function(q){
      if(!q.analiz) return { ok:false, why:'Teklif onaylı bir ön analize bağlı olmalı' };
      var a = (window.DB && DB.analyses || []).filter(function(x){ return x.kod === q.analiz; })[0];
      if(!a) return { ok:false, why:'Bağlı ön analiz kaydı bulunamadı: ' + q.analiz };
      return a.durum === 'Onaylandı'
        ? { ok:true }
        : { ok:false, why:'Ön analiz "' + a.durum + '" durumunda — teklif için onaylanmış olmalı' };
    },
    /* Teslim: açık kritik hata engeli — ADR-05 (eski karar yalnız uyarıyordu) */
    teslimKritikHata:function(d){
      var acik = (window.DB && DB.bugs || []).filter(function(b){
        return b.proje === d.proje && b.siddet === 'Kritik' &&
               ['Kapandı','Reddedildi','Mükerrer'].indexOf(b.durum) === -1; });
      return acik.length
        ? { ok:false, why:'Projede ' + acik.length + ' açık kritik hata var — teslim müşteri onayını riske atar: ' + acik.map(function(b){ return b.kod; }).join(', ') }
        : { ok:true };
    },
    /* İzin bakiyesi — ADR-06: bakiyeyi aşan onay ENGELLENİR.
       Eski kod `Math.min(bakiye, gun)` ile aşan günü sessizce yutuyordu. */
    izinBakiye:function(l){
      var e = (window.DB && DB.employees || []).filter(function(x){ return x.kod === l.personel; })[0];
      if(!e) return { ok:true };
      if(l.tur === 'Ücretsiz izin') return { ok:true };
      var gun = (GV.calendar && GV.calendar.isGunu) ? GV.calendar.isGunu(l.baslangic, l.bitis) : (l.gun || 0);
      return gun > (e.izinBakiye || 0)
        ? { ok:false, why:'Bakiye yetersiz: ' + gun + ' iş günü isteniyor, kalan ' + (e.izinBakiye || 0) + ' gün. Gün sayısını düşürün ya da izni "Ücretsiz izin" türüne çevirin.' }
        : { ok:true };
    },
    /* [4.2.3] — PERSONEL AKTİFLEŞTİRME KAPISI.
       "Zorunlu evrak eksikken personel Aktif olamaz." Kural `org.js` içinde
       `transitions.employee['Onboarding'].kapi = 'personelEvrak'` diye
       YAZILIYDI ama karşılığı olan yordam yoktu; motor eksik kapıyı sessizce
       atlar, yani kural hiç uygulanmazdı — L-31'in tam tarifi ("uygulanmayan
       kural, yanlış kuralın en sinsi hâlidir").
       Zorunluluk sürecin adımlarından okunur (`DB.onboarding[].adimlar` →
       `zorunlu:true`), ekranda ikinci bir liste tutulmaz. */
    personelEvrak:function(e){
      var surec = (window.DB && DB.onboarding || []).filter(function(o){
        return o.personel === e.kod && o.tur === 'Giriş';
      })[0];
      /* Süreç kaydı YOKSA kapı açılmaz ama gerekçesi farklıdır: eksik evrak
         değil, hiç başlamamış bir onboarding. İkisini aynı mesaja katmak
         kullanıcıyı yanlış yere bakmaya gönderirdi. */
      if(!surec) return { ok:false, why:'Bu personel için bir onboarding süreci açılmamış. ' +
                                        'Aktifleştirmeden önce süreç başlatılmalı.' };
      var eksik = (surec.adimlar || []).filter(function(a){
        return a.zorunlu && a.durum !== 'Tamamlandı';
      });
      if(!eksik.length) return { ok:true };
      return { ok:false, why:'Zorunlu onboarding adımı tamamlanmadı: ' +
        eksik.map(function(a){ return a.ad; }).join(' · ') +
        ' (' + eksik.length + ' adım). Personel Onboarding durumunda kalır.' };
    },

    /* [20.4.4] — AYRILIŞ KAPISI: aktif zimmet varken personel `Ayrıldı`
       olamaz. Bugüne kadar `aktif:false` yapılırken zimmet HİÇ kontrol
       edilmiyordu; şirket demirbaşı ayrılan personelin üstünde kalıyordu ve
       hiçbir ekran bunu söylemiyordu. */
    personelZimmet:function(e){
      var acik = (window.DB && DB.assignments || []).filter(function(z){
        return z.personel === e.kod && z.durum === 'Aktif' && !z.iadeTarihi;
      });
      if(!acik.length) return { ok:true };
      return { ok:false, why:acik.length + ' zimmet hâlâ açık: ' +
        acik.map(function(z){ return z.kod; }).join(' · ') +
        '. Ayrılış tamamlanmadan demirbaşlar iade edilmeli.' };
    },

    /* [5.3] — FIRSAT KAZANMA KAPISI.
       Şartname §5.3 adım 2: "Sistem zorunlu müşteri bilgilerini kontrol eder."
       Kontrolün yeri burasıdır, ekran değil: fırsat üç yerden kazanılabilir
       (fırsat detayı · Satış Akışı kartı · teklif detayı) ve üçü ayrı ayrı
       kontrol yazsaydı biri diğerinden sessizce ayrılırdı (L-40).

       Kapı UYARMAZ, REDDEDER. Eksik alan listesi `GV.lifecycle`ten okunur —
       aynı liste evre geçişinde de geçerlidir, iki ayrı zorunluluk sözlüğü
       tutmak er geç çelişirdi. */
    firsatKazanma:function(o){
      var h = GV.lifecycle && GV.lifecycle.hesap(o.hesap);
      if(!h) return { ok:false, why:'Fırsatın bağlı olduğu müşteri hesabı bulunamadı (' +
                                    (o.hesap || '—') + '). Kazanma, hesabı olmayan bir fırsata uygulanamaz.' };
      /* Hesap zaten MÜŞTERİ ise alan kontrolü tekrar edilmez: evre değişmeyecek. */
      if(h.evre === 'MUSTERI') return { ok:true };
      var izinli = (GV.lifecycle.sonraki(h.evre) || []).indexOf('MUSTERI') !== -1;
      if(!izinli)
        return { ok:false, why:'“' + (GV.lifecycle.ad(h.evre) || h.evre) + '” evresindeki bir hesap doğrudan ' +
                 'Müşteri yapılamaz (§5.1). Önce hesabı “' +
                 (GV.lifecycle.ad('NITELIKLI')) + '” evresine taşıyın.' };
      var eksik = GV.lifecycle.eksikAlanlar(h);
      return eksik.length
        ? { ok:false, why:'Müşteri evresine geçiş için hesapta eksik alan var: ' +
                          eksik.join(' · ') + '. Kazanma bu alanlar dolmadan uygulanamaz.' }
        : { ok:true };
    },

    /* [K-17] — TEKLİF SÜRÜM KİLİDİ.
       Bir teklifin ARDILI varsa o kayıt donmuştur: revize edilmiş bir teklif
       ne onaylanır, ne gönderilir, ne iptal edilir. Kilit bir ALAN DEĞİL,
       zincirden TÜRETİLİR (L-08): `kilitli:true` diye bir bayrak tutmak, bir
       sonraki turda zincirle çelişecek ikinci bir defter açardı.
       `DB.flowEntities.quote.kilit` bunu motora bağlar. */
    teklifSurumKilidi:function(q){
      var ardil = (window.DB && DB.quotes || []).filter(function(x){
        return x.oncekiSurum === q.kod; })[0];
      if(!ardil) return { ok:true };
      return { ok:false, kilit:'surum', ardil:ardil.kod,
               why:'Bu teklif ' + ardil.kod + ' (sürüm ' + (ardil.versiyon || '?') +
                   ') ile revize edildi. Revize edilmiş sürüm salt okunurdur; ' +
                   'işlemler güncel sürüm üzerinden yürür.' };
    },

    /* Destek kapanışı: bakım kotası aşımı — ADR-10 */
    destekKota:function(t){
      if(t.ucretli) return { ok:true };
      var p = (GV.destek && GV.destek.paketOf) ? GV.destek.paketOf(t) : null;
      if(!p) return { ok:true };
      var harcanan = t.harcananSure || 0;
      return harcanan > (p.kalan || 0)
        ? { ok:false, why:'Bakım kotası yetersiz: ' + harcanan + ' saat düşülecek, pakette ' + (p.kalan || 0) + ' saat kaldı. Aşım onayı gerekiyor.' }
        : { ok:true };
    }
  };

  var Flow = {
    /* Varlık tanımı — koleksiyon adı hiçbir yordamda gömülü değil */
    tanim:function(tur){ return (window.DB && DB.flowEntities && DB.flowEntities[tur]) || null; },

    /* Kayıt bul. Görev kendi koleksiyonunda; diğerleri `flowEntities`'ten. */
    kayit:function(tur, kod){
      var t = Flow.tanim(tur);
      if(!t || !window.DB || !DB[t.koleksiyon]) return null;
      return DB[t.koleksiyon].filter(function(x){ return x.kod === kod; })[0] || null;
    },

    /* Durum alanının adı — fatura `belgeDurum`, diğerleri `durum` */
    alan:function(tur){ var t = Flow.tanim(tur); return t ? t.alan : 'durum'; },

    /* ===================================================================
       KAYIT KİLİDİ — varlık düzeyinde, duruma bağlı DEĞİL (K-17)
       -------------------------------------------------------------------
       `kapi` ve `girisKapi` tek bir GEÇİŞİ engeller. Bazı olgular ise kaydın
       TAMAMINI dondurur: teklifin yeni bir sürümü doğduğunda eski sürüm artık
       hiçbir yöne gidemez — ne onaylanır, ne gönderilir, ne iptal edilir.
       Bunu her duruma ayrı ayrı `kapi` yazarak kurmak, aynı kuralı on yerde
       tekrarlamaktı (L-40) ve bir durum eklendiğinde sessizce açık kalırdı.

       Sözleşme: `DB.flowEntities[tur].kilit = '<GV.gates yordamı>'`.
       Yordam `{ok:false, why}` dönerse HİÇBİR geçiş yapılamaz ve
       `adimlar()` boş döner — ekran ölü buton basmaz.
       =================================================================== */
    kilit:function(tur, kodYaKayit){
      var t = Flow.tanim(tur);
      if(!t || !t.kilit || !Gates[t.kilit]) return null;
      var rec = typeof kodYaKayit === 'string' ? Flow.kayit(tur, kodYaKayit) : kodYaKayit;
      if(!rec) return null;
      var g = Gates[t.kilit](rec);
      return (g && g.ok === false) ? g : null;
    },

    /* Geçiş tablosu. Görev tablosu ayrı yerde yaşıyor; motor ikisini de okur. */
    tablo:function(tur){
      if(tur === 'task') return (window.DB && DB.taskTransitions) || null;
      return (window.DB && DB.transitions && DB.transitions[tur]) || null;
    },

    kural:function(tur, durum){
      var tb = Flow.tablo(tur);
      return (tb && tb[durum]) || null;
    },

    /* Yetki: rol anahtarı VE ilişki anahtarı çözülür.
       `'pm'` bir roldür ("pm rolündeki herkes"), `'sorumlu'` bir ilişkidir
       ("BU kaydın sorumlusu"). Karıştırmak her kullanıcıyı her kaydın
       sorumlusu yapardı — görev motorundaki ayrım buraya genelleştirildi. */
    yetkili:function(rec, kural){
      if(!rec || !kural || !kural.yetki || !kural.yetki.length) return false;
      var me  = (GV.session && GV.session.emp) || null;
      var rol = (GV.perm && GV.perm.role) ? GV.perm.role() : null;
      return kural.yetki.some(function(k){
        if(k === 'sorumlu')     return me && (rec.sorumlu === me || rec.pm === me);
        if(k === 'kontrolEden') return me && rec.kontrolEden === me;
        if(k === 'onaylayan')   return me && rec.onaylayan === me;
        if(k === 'veren')       return me && (rec.veren === me || rec.talepEden === me || rec.personel === me);
        return rol === k;
      });
    },

    /* ZORUNLU ALAN — İKİ BAĞLAMA NOKTASI, `kapi`/`girisKapi` ve
       `gerekce`/`girisGerekce` ile birebir aynı ayrım:
         `zorunlu`      → BU DURUMDAN ÇIKMAK alan ister. Kaynak durumdan
                          çıkan HER hedefe uygulanır.
         `girisZorunlu` → BU DURUMA GİRMEK alan ister. Yalnız o hedefte.

       ⚠️ Bu ayrım K-31 ile ölçülmüş bir kusurdan doğdu: `Offboarding`
       üzerindeki `zorunlu:['cikisTarihi','cikisNedenKodu']` kaynak taraflıydı
       ve oradan çıkan her hedefe uygulanıyordu. Çıkış sürecine YANLIŞLIKLA
       alınmış bir personeli `Aktif`e geri döndürmek için önce çıkış tarihi ve
       çıkış nedeni doldurmak gerekiyordu — yani ayrılmadığını söylemek için
       ayrılış evrakını tamamlamak. Alan doğruydu, bağlandığı yer yanlıştı.

       `hk` = HEDEFİN kuralı. Verilmezse yalnız kaynak tarafı okunur (eski
       çağrı biçimi kırılmaz). */
    eksikAlanlar:function(rec, kural, ek, hk){
      var alanlar = [];
      if(kural && kural.zorunlu) alanlar = alanlar.concat(kural.zorunlu);
      if(hk && hk.girisZorunlu) hk.girisZorunlu.forEach(function(a){
        if(alanlar.indexOf(a) === -1) alanlar.push(a); });
      if(!alanlar.length) return [];
      ek = ek || {};
      return alanlar.filter(function(a){
        var v = (a in ek) ? ek[a] : rec[a];
        return v == null || v === '' || (Array.isArray(v) && !v.length);
      });
    },

    /* KAPI ÇÖZÜMLEME — TEK KARAR NOKTASI (K-32).
       Bir kapı üç yere bağlanabilir; öncelik daralttıkça artar:

         1. `kenarKapi:{ hedef:{ kapi, istisnaRol } }`  KAYNAK kuralında.
            YALNIZ o kenarı bağlar. En dar bağ.
         2. `kapi` (+ `istisnaRol`)  KAYNAK kuralında.
            O durumdan çıkan HER hedefi bağlar. En geniş bağ.
         3. `girisKapi` (+ `istisnaRol`)  HEDEF kuralında.
            O duruma giren HER kenarı bağlar.

       ⚠️ 2 ile 3 arasında seçim yaparken ölçülecek şey KENAR SAYISIDIR:
       hedefe tek kenar giriyorsa `girisKapi` kenarı tam bağlar; birden çok
       kenar giriyorsa `girisKapi` de fazladan kenar keser ve `kenarKapi`
       gerekir. K-32'de ölçüldü: `projeTeslim`in hedefi `Teslim`e iki kenar
       (`Test/Kabul` ileri · `Kapanış` geri), `destekKota`nın hedefi
       `Kapandı`ya iki kenar (`Müşteri Onayı` · `Yeni`) giriyor — o ikisi
       `kenarKapi` ile bağlandı. Diğer ikisinin hedefine tek kenar giriyor. */
    kapiCoz:function(kural, hk, hedef){
      kural = kural || {}; hk = hk || {};
      var kenar = kural.kenarKapi && kural.kenarKapi[hedef];
      if(kenar) return { ad:kenar.kapi || null, istisnaRol:kenar.istisnaRol || [], nere:'kenar' };
      if(kural.kapi) return { ad:kural.kapi, istisnaRol:kural.istisnaRol || [], nere:'kaynak' };
      if(hk.girisKapi) return { ad:hk.girisKapi, istisnaRol:hk.istisnaRol || [], nere:'hedef' };
      return { ad:null, istisnaRol:[], nere:null };
    },

    /* Kaydın durumu HAKKINDA tek başvuru noktası. `adimlar()` yapılabilir
       geçişleri verir; bu ise durumun KENDİSİNİ anlatır — terminal mi,
       hangi roller bu durumdan çıkabilir. İkisini ayrı ayrı `DB.transitions`
       okuyarak öğrenmek, aynı kuralın ikinci okuyucusunu doğurur. */
    durumBilgi:function(tur, kod){
      var rec = Flow.kayit(tur, kod);
      if(!rec) return null;
      var durum = rec[Flow.alan(tur)];
      var kural = Flow.kural(tur, durum) || {};
      return {
        durum:durum,
        terminal:!!kural.terminal || !(kural.next && kural.next.length),
        yetki:kural.yetki || [],
        kilit:Flow.kilit(tur, rec) || null
      };
    },

    /* Bu kayıt + bu oturum için yapılabilir geçişler. Ekran buradan buton üretir. */
    adimlar:function(tur, kod){
      if(tur === 'task') return GV.task.nextSteps(kod);
      var rec = Flow.kayit(tur, kod); if(!rec) return [];
      /* Kilitli kayıtta HİÇBİR adım yok — ekran ölü buton basmasın.
         Sebebini `Flow.kilit()` ile ayrıca okur ve kullanıcıya yazar. */
      if(Flow.kilit(tur, rec)) return [];
      var kural = Flow.kural(tur, rec[Flow.alan(tur)]);
      if(!kural || !kural.next || !kural.next.length) return [];
      var izin = Flow.yetkili(rec, kural);
      /* Dostane etiket YALNIZ birincil hedefe verilir. Eskiden `next[0]`a
         veriliyordu ve ikisi ayrışabiliyordu: proje `Aktif` durumunda etiket
         "Teste Al" iken `next[0]` `Beklemede`ydi — düğme yanlış işi vaat
         ediyordu. Birincil hedef artık tabloda `anaHedef` ile yazılır;
         yazılmamışsa `next[0]` varsayılır. */
      var ana = kural.anaHedef || kural.next[0];
      return kural.next.map(function(hedef){
        var hk = Flow.kural(tur, hedef) || {};
        return {
          hedef:hedef,
          birincil:hedef === ana,
          etiket:hedef === ana ? (kural.etiket || hedef) : hedef,
          tone:/Onay|Kabul|Tamam|Aktif|Kapandı|Kapat|Ödendi/.test(hedef) ? 'btn-ok'
             : /İptal|Ret|Fesih|Feshedildi|Kaybedildi|Engel/.test(hedef) ? 'btn-danger-line'
             : /Revizyon|Revize|İade|Geri|Arşiv|Askı/.test(hedef) ? 'btn-line' : 'btn-acc',
          /* Eksik alan HEDEFE GÖRE hesaplanır — `girisZorunlu` yalnız kendi
             hedefini bağlar. Eskiden tek liste bütün hedeflere basılıyordu. */
          /* `yetki` — bu geçişi HANGİ roller yapabilir. Ekran bunu yazmak
             için `DB.transitions`i kendisi okumak zorunda kalıyordu; kural
             motorda, okunuşu ekranda olurdu (L-40). Artık adımla birlikte
             gelir. */
          izin:izin, yetki:kural.yetki || [],
          eksik:Flow.eksikAlanlar(rec, kural, null, hk),
          /* ⚠️ DÜZELTME — burada `hk.gerekce` okunuyordu, oysa HEDEFİN
             bayrağı `girisGerekce`dir (`gec` zaten onu okuyor, satır ~380).
             Sonuç: gerekçe isteyen her hedef ekrana `gerekce:false` diye
             bildiriliyordu ve ekran ya gerekçesiz geçiş deniyor ya da kuralı
             `DB.transitions`ten KENDİSİ okumak zorunda kalıyordu — yani
             sözleşme motorda, uygulaması ekrandaydı. İki okuma, tek kural
             olması gereken yerde (L-40). Kaynak tarafındaki `gerekce` de
             korunur: o "bu durumdan ÇIKARKEN gerekçe iste" demektir. */
          gerekce:!!(kural.gerekce || hk.girisGerekce),
          /* Kapı ÜÇ yere bağlanabilir — `Flow.kapiCoz` tek karar noktasıdır. */
          kapi:Flow.kapiCoz(kural, hk, hedef).ad,
          istisnaRol:Flow.kapiCoz(kural, hk, hedef).istisnaRol
        };
      });
    },

    /* TEK MUTASYON NOKTASI. Ekran durum yazmaz, burayı çağırır.
       opts: { not, neden, ek, istisna } — `istisna:true` yalnız `istisnaRol`
       listesindeki rol için ve yalnız neden kodu ile geçerlidir. */
    gec:function(tur, kod, hedef, ek, opts){
      opts = opts || {};
      if(tur === 'task') return GV.task.transition(kod, hedef, ek, opts.not);
      var rec = Flow.kayit(tur, kod);
      if(!rec) return { ok:false, why:'kayıt yok: ' + kod };
      /* KİLİT en başta bakılır: kilitli kaydın durumunu, yetkisini ya da
         zorunlu alanını tartışmak anlamsız — kayıt donmuştur. */
      var kilitli = Flow.kilit(tur, rec);
      if(kilitli) return { ok:false, why:'kilit', mesaj:kilitli.why, kilit:kilitli };
      var alan = Flow.alan(tur), eski = rec[alan];
      var kural = Flow.kural(tur, eski);
      if(!kural) return { ok:false, why:'"' + eski + '" için geçiş kuralı tanımlı değil' };
      if(!kural.next || kural.next.indexOf(hedef) === -1)
        return { ok:false, why:'"' + eski + '" durumundan "' + hedef + '" durumuna geçilemez' };
      if(!Flow.yetkili(rec, kural))
        return { ok:false, why:'yetki', roller:kural.yetki };
      /* HEDEFİN kuralı zorunlu alan denetiminden ÖNCE okunur: `girisZorunlu`
         hedefe bağlıdır ve kaynak taraflı `zorunlu` ile birlikte değerlenir. */
      var hk = Flow.kural(tur, hedef) || {};
      var eksik = Flow.eksikAlanlar(rec, kural, ek, hk);
      if(eksik.length) return { ok:false, why:'zorunlu', eksik:eksik };

      /* Gerekçe zorunluluğu — şartname [2.0.6]: neden KODU + açıklama.
         İKİ AYRI ANLAM, iki ayrı bayrak:
           `gerekce`      → BU DURUMDAN ÇIKMAK gerekçe ister (ör. kapanmış
                            bir kaydı yeniden açmak).
           `girisGerekce` → BU DURUMA GİRMEK gerekçe ister (ör. ret, iptal,
                            iade, fesih — olumsuz karar).
         Tek bayrakla yürütülünce ikisi karışıyordu: `Kapandı` üzerindeki
         "yeniden açarken gerekçe iste" bayrağı, talebi KAPATIRKEN de gerekçe
         dayatıyordu. */
      if((kural.gerekce || hk.girisGerekce) && !opts.neden)
        return { ok:false, why:'gerekce',
                 mesaj:hk.girisGerekce
                   ? '"' + hedef + '" kararı için neden kodu ve açıklama zorunludur'
                   : '"' + eski + '" durumundan çıkmak için neden kodu ve açıklama zorunludur' };

      /* Ek engel kapısı — İKİ BAĞLAMA NOKTASI, `gerekce`/`girisGerekce` ile
         aynı ayrım:
           `kapi`      → BU DURUMDAN ÇIKMAK ön koşul ister. Kaynak durumdan
                         çıkan HER hedefe uygulanır.
           `girisKapi` → BU DURUMA GİRMEK ön koşul ister. Yalnız o hedefte.

         ⚠️ Bu ayrım ölçülmüş bir kusurdan doğdu: fırsat tablosunda kazanma
         kapısı KAYNAĞA (`Sözleşme aşaması`) bağlanmıştı ve aynı kaynaktan
         çıkan `Kaybedildi` ile `Beklemeye alındı` hedefleri de kapıya
         takılıyordu — yani bir satışı KAYBETMEK için müşterinin vergi
         numarasını doldurmak gerekiyordu. Kapı doğruydu, bağlandığı yer
         yanlıştı; motorun hedef tarafında bir kancası olmadığı için bunu
         veri tarafında düzeltmek mümkün değildi. */
      var kapiUyari = null;
      var coz     = Flow.kapiCoz(kural, hk, hedef);
      var kapiAd  = coz.ad;
      var kapiRol = coz.istisnaRol;
      if(kapiAd && Gates[kapiAd]){
        var g = Gates[kapiAd](rec);
        if(!g.ok){
          var rol = (GV.perm && GV.perm.role) ? GV.perm.role() : null;
          var istisnaVar = kapiRol.indexOf(rol) !== -1;
          if(!istisnaVar || !opts.istisna || !opts.neden)
            return { ok:false, why:'kapi', mesaj:g.why,
                     istisnaMumkun:istisnaVar,
                     roller:kapiRol };
          kapiUyari = 'YÖNETİCİ İSTİSNASI — ' + g.why;
        } else if(g.gerekceZorunlu && !opts.neden){
          return { ok:false, why:'gerekce', mesaj:g.uyari };
        } else if(g.uyari){ kapiUyari = g.uyari; }
      }

      if(ek) Object.keys(ek).forEach(function(k){ rec[k] = ek[k]; });
      rec[alan] = hedef;
      if(opts.neden){ rec.sonNedenKodu = opts.neden; rec.sonNedenAciklama = opts.not || ''; }

      /* Yan etkiler tek yerde — ekranda değil */
      Flow.yanEtki(tur, rec, eski, hedef);

      log(rec.kod,
          (kapiUyari ? kapiUyari + ' · ' : '') + 'Durum değiştirildi' +
          (opts.neden ? ' [' + opts.neden + ']' : '') + (opts.not ? ' — ' + opts.not : ''),
          eski, hedef,
          kapiUyari ? 'warn' : /Onay|Kabul|Tamam|Aktif|Kapandı/.test(hedef) ? 'ok'
            : /İptal|Ret|Fesih|Kaybedildi/.test(hedef) ? 'danger' : 'info',
          'i-refresh');
      return { ok:true, kayit:rec, eski:eski, yeni:hedef,
               istisna:!!kapiUyari, bildirim:kural.bildirim || [] };
    },

    /* Geçişin bağlı kayıtlarda doğurduğu sonuçlar. Şartname [6.1.6]:
       "oluşacak domain olayları ve bağlı kayıtlar" sözleşmenin parçasıdır. */
    yanEtki:function(tur, rec, eski, hedef){
      /* İzin onayı → bakiye düşümü. ADR-06: kapı zaten aşımı engelledi,
         burada clamp YOK — düşen gün gerçek gündür. */
      if(tur === 'leave' && hedef === 'Onaylandı'){
        var e = (DB.employees || []).filter(function(x){ return x.kod === rec.personel; })[0];
        if(e && rec.tur !== 'Ücretsiz izin'){
          var g = (GV.calendar && GV.calendar.isGunu) ? GV.calendar.isGunu(rec.baslangic, rec.bitis) : (rec.gun || 0);
          rec.dusenGun = g;
          e.izinBakiye = (e.izinBakiye || 0) - g;
        }
      }
      /* İzin iptali → bakiye iadesi (eski kodda hiç yoktu) */
      if(tur === 'leave' && eski === 'Onaylandı' && hedef === 'İptal edildi'){
        var e2 = (DB.employees || []).filter(function(x){ return x.kod === rec.personel; })[0];
        if(e2 && rec.dusenGun){ e2.izinBakiye = (e2.izinBakiye || 0) + rec.dusenGun; rec.dusenGun = 0; }
      }
      /* Departman talebi göreve dönüşünce görev bağı zorunlu (ADR-03) */
      if(tur === 'request' && hedef === 'Göreve Dönüştürüldü' && !rec.gorev)
        rec.gorevBekliyor = true;
      /* Destek KAPANIŞ DAMGASI — motorun işi, ekranın değil (L-40).
         İki ekran (`app-destek.html` · `app-destek-detay.html`) bu kuralı
         `ek` kanalıyla ayrı ayrı yazıyordu ve İKİSİ AYNI DEĞİLDİ: biri
         hedefi sözlükten türetiyor, diğeri `'Kapandı'` dizesini elle
         yazıyordu. Sözlük değişse ikisi ayrışır ve biri sessizce damgasız
         kapatırdı. Kural tek yere alındı; kapanış durumları
         `DB.ticketClosedStatuses`ten okunur, sabit dize yazılmaz.

         ⚠️ Var olan damga EZİLMEZ: kayıt zaten kapanmış ve yeniden açılıp
         tekrar kapatılıyorsa ilk kapanış tarihi korunur — üzerine bugünü
         yazmak gerçekleşmiş bir olayın tarihini değiştirmek olurdu. */
      if(tur === 'ticket' && (DB.ticketClosedStatuses || []).indexOf(hedef) !== -1 && !rec.kapanisTarihi){
        /* BİÇİM DEFTERDEN OKUNDU: yayındaki damga `2026-07-18T14:00`, yani
           tarih + saat. Yalnız `DB.today` yazmak, aynı alana iki farklı
           biçim koymak olurdu (brief §13.2 zaman damgası deseni). Gün sabit
           `DB.today`tan, saat gerçek saatten gelir. */
        rec.kapanisTarihi = DB.today + 'T' + new Date().toTimeString().slice(0, 5);
      }

      /* Destek kapanışı → bakım kotası düşümü (ADR-10). Kapı aşımı engelledi. */
      if(tur === 'ticket' && hedef === 'Kapandı' && !rec.ucretli){
        var p = (GV.destek && GV.destek.paketOf) ? GV.destek.paketOf(rec) : null;
        if(p && rec.harcananSure){
          p.kullanilan = (p.kullanilan || 0) + rec.harcananSure;
          p.kalan = (p.kalan || 0) - rec.harcananSure;
          rec.kotadanDusuldu = rec.harcananSure;
        }
      }
      /* Fatura belge iptali/iadesi → ödeme durumu yeniden türetilir */
      if(tur === 'invoice' && GV.fin && GV.fin.durumTazele) GV.fin.durumTazele(rec);
    },

    /* Bir durum sözlüğünün tabloyla tutarlı olup olmadığı — canon ekseni için */
    denetle:function(tur){
      var tb = Flow.tablo(tur), t = Flow.tanim(tur);
      if(!tb || !t || !window.DB || !DB[t.koleksiyon]) return null;
      var bilinmeyen = [], yetim = [];
      DB[t.koleksiyon].forEach(function(r){
        if(!tb[r[t.alan]] && bilinmeyen.indexOf(r[t.alan]) === -1) bilinmeyen.push(r[t.alan]);
      });
      Object.keys(tb).forEach(function(d){
        var k = tb[d];
        (k.next || []).forEach(function(h){ if(!tb[h] && yetim.indexOf(h) === -1) yetim.push(h); });
      });
      return { tur:tur, kayit:DB[t.koleksiyon].length, bilinmeyenDurum:bilinmeyen, tablodaOlmayanHedef:yetim };
    }
  };

  GV.flow  = Flow;
  GV.gates = Gates;

  /* ===================================================================
     GV.lifecycle — MÜŞTERİ YAŞAM EVRESİ (şartname §5.1 · §5.2 · §5.3)
     -------------------------------------------------------------------
     `lifecycle.js` evre SÖZLÜĞÜNÜ ve türetilmiş hesapları taşıyor
     (`DB.lifecycleStages` · `DB.accounts`), ama evreyi DEĞİŞTİREN bir
     yordam yoktu. Karşılığı olmayan tek şey buydu ve doldurulmasaydı üç
     ekran (müşteri detayı · müşteri formu · fırsat kazanma) evreyi
     `h.evre = 'MUSTERI'` diye elle yazardı — `GV.flow`un kapattığı hatanın
     birebir aynısı, yeni bir eksende.

     NEDEN `GV.flow` DEĞİL: geçiş motoru `DB.transitions` sözleşmesini okur ve
     ROL/İLİŞKİ eksenli yetki çözer. Yaşam evresi tablosu şartnamede AYRI bir
     biçimde yazılı (§5.1 tablosu: `sonraki` listesi) ve `lifecycle.js` onu
     zaten o biçimde taşıyor. Aynı tabloyu ikinci bir biçime çevirip
     `DB.transitions`e kopyalamak, tek kaynağı ikiye bölmek olurdu (L-40).
     Bu yordam o tabloyu OLDUĞU YERDEN okur — motorun kendisiyle aynı
     sözleşmeyi (`{ok:false, why:…}`) döndürür ki `GV.flowHata` onu da
     çevirebilsin.

     ⚠️ BACKEND PAYI (BE-S2): evre değişimi `DB.accounts` kaydında yaşar;
     kaynak `DB.customers[].durum` alanına AYNALANMAZ. Aynalamak, aynı olguyu
     iki deftere yazmak olurdu (VB-25'in tam tarifi) ve prototipte ikisi
     arasında hakem yok. Gerçek sistemde tek kayıt vardır:
     `PATCH /api/customers/:id/lifecycle-stage` (§9).
     =================================================================== */
  var EVRE_ROL = ['satismudur','sahip','genelmudur','operasyon'];

  var Lifecycle = {
    sozluk:function(){ return (window.DB && DB.lifecycleStages) || {}; },
    evreler:function(){ return (window.DB && DB.lifecycleOrder) || []; },
    ad:function(evre){ var s = Lifecycle.sozluk()[evre]; return s ? s.ad : null; },

    /* Kod da kayıt da kabul edilir — çağıran elindekini verir. */
    hesap:function(x){
      if(!x) return null;
      if(typeof x !== 'string') return x;
      if(!window.DB || !DB.accounts) return null;
      return DB.accounts.filter(function(h){ return h.kod === x; })[0] || null;
    },

    /* §5.1 tablosundan — ekran kendi listesini YAZMAZ */
    sonraki:function(evre){
      var s = Lifecycle.sozluk()[evre];
      return (s && s.sonraki) ? s.sonraki.slice() : [];
    },

    /* §5.2 son cümlesi: "Kayıt müşteri evresine geçirilirken eksik olan
       yasal/fatura alanları DOĞRULANMALIDIR; ilk aday kaydında bunların
       tamamı zorunlu olmamalıdır." Yani zorunluluk kaydın doğduğu anda değil,
       MÜŞTERİ evresine geçerken doğar. Liste burada TEK yerdedir; form da
       kapı da fırsat kazanma da bunu okur.
       Ölçüldü: 20 hesabın 8'inde `vergiNo` boş (hepsi aday kaydından türedi),
       yani bu kapı gerçekten ısırıyor. */
    eksikAlanlar:function(h, hedef){
      h = Lifecycle.hesap(h);
      if(!h) return [];
      if((hedef || 'MUSTERI') !== 'MUSTERI') return [];
      var eksik = [];
      if(!String(h.unvan || '').trim()) eksik.push('Firma / unvan');
      if(!String(h.vergiNo || '').trim()) eksik.push('Vergi numarası');
      if(!h.sorumlu) eksik.push('Sorumlu');
      if(!h.tel && !h.eposta) eksik.push('Telefon veya e-posta');
      return eksik;
    },

    /* Evre rozeti — TEK yerde. `app-musteri.html` ve müşteri detayı aynı
       `evreRozeti()` yordamını ayrı ayrı yazmıştı; sözlük (`tone`) değişince
       ikisi sessizce ayrışırdı (L-40). Rozet işaretlemesi `GV.badge` ile
       değil elle kurulur: yaşam evresi tonu ADI DEĞİL sözlükten gelir ve
       `GV.badge`in ton türetmesi (metin eşleşmesi) burada yanlış olurdu —
       "Aday" için §5.1 açıkça NÖTR etiket istiyor. */
    rozet:function(evre){
      var s = Lifecycle.sozluk()[evre];
      if(!s) return '<span class="u-faint">—</span>';
      var esc = (GV.esc || function(x){ return String(x == null ? '' : x); });
      return '<span class="badge' + (s.tone ? ' ' + s.tone : '') + '">' + esc(s.ad) + '</span>';
    },

    /* DOĞUM EVRESİ KAPISI — §10 yetki tablosu: "Müşteri evresini Müşteri yap →
       Satış yöneticisi veya tanımlı rol."
       Ölçülen açık: `gec()` bu kapıyı tutuyordu ama form yeni kaydın evresini
       DOĞARKEN yazıyor, yani geçişten geçmiyordu — herhangi bir rol doğrudan
       `MUSTERI` evresinde hesap açarak kapının etrafından dolaşabiliyordu.
       Kural ekranda ikinci kez yazılmaz; kapı burada. */
    dogumIzni:function(evre){
      if(evre !== 'MUSTERI') return { ok:true };
      var rol = (GV.perm && GV.perm.role) ? GV.perm.role() : null;
      if(EVRE_ROL.indexOf(rol) !== -1) return { ok:true };
      return { ok:false, why:'yetki', roller:EVRE_ROL,
               mesaj:'Kaydı doğrudan Müşteri evresinde açmak için satış yöneticisi ' +
                     'yetkisi gerekir. Hesabı Aday ya da Nitelikli olarak kaydedin.' };
    },

    /* Bu hesap + bu oturum için yapılabilir evre geçişleri.
       Ekran buradan buton üretir; `GV.flow.adimlar` ile aynı biçimde döner. */
    adimlar:function(x){
      var h = Lifecycle.hesap(x);
      if(!h) return [];
      var rol = (GV.perm && GV.perm.role) ? GV.perm.role() : null;
      return Lifecycle.sonraki(h.evre).map(function(hedef){
        var yetkiVar = hedef === 'MUSTERI' ? EVRE_ROL.indexOf(rol) !== -1 : can('duzenle');
        return {
          hedef:hedef,
          etiket:Lifecycle.ad(hedef) || hedef,
          birincil:hedef === 'MUSTERI' || hedef === 'NITELIKLI',
          tone:hedef === 'MUSTERI' ? 'btn-ok'
             : hedef === 'KAYIP' ? 'btn-danger-line' : 'btn-line',
          izin:yetkiVar,
          eksik:Lifecycle.eksikAlanlar(h, hedef),
          gerekce:hedef === 'KAYIP'
        };
      });
    },

    /* TEK MUTASYON NOKTASI. `h.evre = …` yazmak yasaktır.
       opts: { neden, not } — `KAYIP` için ikisi de zorunlu ([2.0.6]). */
    gec:function(x, hedef, opts){
      opts = opts || {};
      var h = Lifecycle.hesap(x);
      if(!h) return { ok:false, why:'kayit', mesaj:'Hesap kaydı bulunamadı: ' + x };
      if(!Lifecycle.sozluk()[hedef])
        return { ok:false, why:'gecis', mesaj:'"' + hedef + '" tanımlı bir yaşam evresi değil' };
      var eski = h.evre;
      if(eski === hedef)
        return { ok:false, why:'ayni', mesaj:'Hesap zaten "' + (Lifecycle.ad(hedef) || hedef) + '" evresinde' };

      var izinli = Lifecycle.sonraki(eski);
      if(izinli.indexOf(hedef) === -1)
        return { ok:false, why:'gecis',
                 mesaj:'"' + (Lifecycle.ad(eski) || eski) + '" evresinden "' + (Lifecycle.ad(hedef) || hedef) +
                       '" evresine geçilemez. İzinli evreler: ' +
                       (izinli.map(function(k){ return Lifecycle.ad(k) || k; }).join(', ') || 'yok') + '.' };

      var rol = (GV.perm && GV.perm.role) ? GV.perm.role() : null;
      /* §10 yetki tablosu: "Müşteri evresini Müşteri yap → Satış yöneticisi
         veya tanımlı rol". Diğer evreler düz düzenleme yetkisine bağlıdır. */
      if(hedef === 'MUSTERI' && EVRE_ROL.indexOf(rol) === -1)
        return { ok:false, why:'yetki', roller:EVRE_ROL,
                 mesaj:'Hesabı Müşteri evresine almak için satış yöneticisi yetkisi gerekir.' };
      if(hedef !== 'MUSTERI' && !can('duzenle'))
        return { ok:false, why:'yetki', roller:['duzenle'],
                 mesaj:'Yaşam evresini değiştirme yetkiniz yok.' };

      var eksik = Lifecycle.eksikAlanlar(h, hedef);
      if(eksik.length)
        return { ok:false, why:'zorunlu', eksik:eksik,
                 mesaj:'Müşteri evresine geçiş için şu alanlar dolu olmalı: ' + eksik.join(', ') + '.' };

      if(hedef === 'KAYIP' && (!opts.neden || !String(opts.not || '').trim()))
        return { ok:false, why:'gerekce',
                 mesaj:'Kayıp işaretlemek için neden kodu ve açıklama zorunludur.' };

      h.evre = hedef;
      /* Türetme izi KORUNUR, üzerine yazılmaz: kaydın nereden geldiği
         (`customers.durum=…`) göç doğrulamasının kanıtıdır. */
      h.evreKaynak = (h.evreKaynak || '') + ' + elle geçiş: ' + eski + '→' + hedef;
      if(opts.neden){ h.sonNedenKodu = opts.neden; h.sonNedenAciklama = opts.not || ''; }

      Audit.yaz({
        kayit:h.kod, modul:'Müşteri',
        islem:'Yaşam evresi değiştirildi' + (opts.neden ? ' [' + opts.neden + ']' : '') +
              (opts.not ? ' — ' + opts.not : ''),
        eski:Lifecycle.ad(eski) || eski, yeni:Lifecycle.ad(hedef) || hedef,
        tone:hedef === 'MUSTERI' ? 'ok' : hedef === 'KAYIP' ? 'danger' : 'info',
        icon:hedef === 'MUSTERI' ? 'i-check-circle' : 'i-refresh'
      });
      return { ok:true, hesap:h, eski:eski, yeni:hedef };
    }
  };

  GV.lifecycle = Lifecycle;

  /* ===================================================================
     İŞ TAKVİMİ / SLA MOTORU — şartname §9.5.3 · §11.1.3 (CLOUD TURU)
     -------------------------------------------------------------------
     Üç ayrı ekran aynı hatayı yapıyordu: hiçbirinde tarih bilinci yoktu.
     SLA düz duvar saati farkı alıyor, izin takvim günü sayıyor, tatil
     listesi kalıcı veri bile değildi. Üçü de artık buradan geçer.
     =================================================================== */
  var Calendar = {
    _tatil:null,
    tatilSeti:function(){
      if(Calendar._tatil) return Calendar._tatil;
      Calendar._tatil = {};
      ((window.DB && DB.holidays) || []).forEach(function(h){ Calendar._tatil[h.tarih] = h; });
      return Calendar._tatil;
    },
    takvim:function(){ return (window.DB && DB.workCalendar) || { gunler:[1,2,3,4,5], baslangic:'09:00', bitis:'18:00' }; },

    tatilMi:function(gun){ return !!Calendar.tatilSeti()[String(gun).slice(0,10)]; },
    haftaSonuMu:function(gun){
      var d = new Date(String(gun).slice(0,10) + 'T12:00:00');
      return Calendar.takvim().gunler.indexOf(d.getDay()) === -1;
    },
    isGunuMu:function(gun){ return !Calendar.haftaSonuMu(gun) && !Calendar.tatilMi(gun); },

    /* İki tarih ARASINDAKİ iş günü sayısı — iki uç dahil.
       İzin hesabının tabanı budur (ADR-12): hafta sonu ve resmî tatil
       bakiyeden düşmez. Eskiden takvim günü sayılıyordu ve cuma–pazartesi
       arası 4 günlük izin çalışanın bakiyesinden 4 gün yiyordu. */
    isGunu:function(bas, bit){
      if(!bas) return 0;
      var a = new Date(String(bas).slice(0,10) + 'T12:00:00');
      var b = new Date(String(bit || bas).slice(0,10) + 'T12:00:00');
      if(b < a) return 0;
      var n = 0, g = new Date(a);
      while(g <= b){
        var iso = g.toISOString().slice(0,10);
        if(Calendar.isGunuMu(iso)) n++;
        g.setDate(g.getDate() + 1);
      }
      return n;
    },

    /* İki zaman damgası arasındaki MESAİ DAKİKASI. SLA sayacının tabanı.
       Hafta sonu, resmî tatil ve öğle arası sayılmaz. */
    mesaiDakika:function(bas, bit){
      if(!bas) return 0;
      var t = Calendar.takvim();
      var a = new Date(String(bas).replace(' ', 'T'));
      var b = new Date(String(bit || (DB.today + 'T18:00')).replace(' ', 'T'));
      if(isNaN(a) || isNaN(b) || b <= a) return 0;
      var dk = function(hhmm){ var p = String(hhmm).split(':'); return (+p[0]) * 60 + (+p[1] || 0); };
      var acilis = dk(t.baslangic), kapanis = dk(t.bitis);
      var ogleA = t.ogleBaslangic ? dk(t.ogleBaslangic) : null;
      var ogleB = t.ogleBitis ? dk(t.ogleBitis) : null;
      var toplam = 0, g = new Date(a); g.setHours(0,0,0,0);
      var son = new Date(b); son.setHours(0,0,0,0);
      while(g <= son){
        var iso = g.toISOString().slice(0,10);
        if(Calendar.isGunuMu(iso)){
          var gunBas = new Date(g); gunBas.setMinutes(acilis);
          var gunBit = new Date(g); gunBit.setMinutes(kapanis);
          var s = a > gunBas ? a : gunBas;
          var e = b < gunBit ? b : gunBit;
          if(e > s){
            var d = (e - s) / 60000;
            /* öğle arası kesişimi düşülür */
            if(ogleA != null){
              var oA = new Date(g); oA.setMinutes(ogleA);
              var oB = new Date(g); oB.setMinutes(ogleB);
              var ks = s > oA ? s : oA, ke = e < oB ? e : oB;
              if(ke > ks) d -= (ke - ks) / 60000;
            }
            toplam += Math.max(0, d);
          }
        }
        g.setDate(g.getDate() + 1);
      }
      return Math.round(toplam);
    },

    /* SLA geçen süresi — 7/24 politikada duvar saati, mesai politikasında
       iş takvimi. Bekleme aralıkları politikaya göre DÜŞÜLÜR (ADR-11). */
    gecenDakika:function(kayit, politika){
      if(!kayit) return 0;
      var bas = kayit.acilis || kayit.olusturma;
      var bit = kayit.kapanisTarihi || null;
      var yediYirmiDort = politika && /7\s*[\/x]\s*24/i.test(String(politika.calismaSaati || ''));
      var ham = yediYirmiDort
        ? Math.max(0, (new Date(String(bit || saat()).replace(' ','T')) -
                       new Date(String(bas).replace(' ','T'))) / 60000)
        : Calendar.mesaiDakika(bas, bit);
      var duran = Calendar.beklemeDakika(kayit, yediYirmiDort);
      return { ham:Math.round(ham), duran:duran, net:Math.max(0, Math.round(ham - duran)),
               eksen:yediYirmiDort ? '7/24' : 'mesai' };
    },

    /* SLA'yı durduran bekleme aralıklarının toplamı */
    beklemeDakika:function(kayit, yediYirmiDort){
      var pol = (window.DB && DB.slaWaitPolicy) || {};
      var araliklar = kayit.beklemeAraliklari || [];
      var t = 0;
      araliklar.forEach(function(a){
        var p = pol[a.neden];
        if(!p || !p.durdurur) return;
        t += yediYirmiDort
          ? Math.max(0, (new Date(String(a.bitis || saat()).replace(' ','T')) -
                         new Date(String(a.baslangic).replace(' ','T'))) / 60000)
          : Calendar.mesaiDakika(a.baslangic, a.bitis);
      });
      return Math.round(t);
    },

    /* Beklemeyi başlat / bitir — aralık HER HÂLDE saklanır, politika
       sonradan değişse bile geçmiş yeniden hesaplanabilsin diye. */
    beklemeBaslat:function(kayit, neden, not){
      if(!kayit) return { ok:false, why:'kayıt yok' };
      kayit.beklemeAraliklari = kayit.beklemeAraliklari || [];
      var acik = kayit.beklemeAraliklari.filter(function(a){ return !a.bitis; })[0];
      if(acik) return { ok:false, why:'Zaten açık bir bekleme var (' + acik.neden + ')' };
      kayit.beklemeNedeni = neden;
      kayit.beklemeAraliklari.push({ neden:neden, baslangic:saat(), bitis:null, not:not || null });
      var p = (window.DB && DB.slaWaitPolicy && DB.slaWaitPolicy[neden]) || {};
      log(kayit.kod, 'Bekleme başladı — ' + neden + (p.durdurur ? ' (SLA duruyor)' : ' (SLA işlemeye devam ediyor)'),
          '', neden, 'warn', 'i-hourglass');
      return { ok:true, durdurur:!!p.durdurur };
    },
    beklemeBitir:function(kayit){
      if(!kayit || !kayit.beklemeAraliklari) return { ok:false, why:'bekleme yok' };
      var acik = kayit.beklemeAraliklari.filter(function(a){ return !a.bitis; })[0];
      if(!acik) return { ok:false, why:'açık bekleme yok' };
      acik.bitis = saat();
      var neden = kayit.beklemeNedeni;
      kayit.beklemeNedeni = null;
      log(kayit.kod, 'Bekleme bitti — ' + neden, neden, '', 'ok', 'i-play');
      return { ok:true, aralik:acik };
    }
  };

  GV.calendar = Calendar;

  /* ===================================================================
     ONAY MOTORU — şartname §6.3 (CLOUD TURU)
     -------------------------------------------------------------------
     Ölçülen kusur (UID-27 ile aynı sınıf, en ağırı): onay kuyruğundaki
     "Onayla" düğmesi yalnız `DB.approvals` satırının `durum` alanını
     değiştiriyordu. Kaynak kayda (SAT-* / IZN-* / TKL-*) DOKUNMUYOR,
     zincirde adım ilerletmiyor, aktiviteye yazmıyordu. Kullanıcı
     onayladığını sanıyor, talep hâlâ "Onay bekliyor" duruyordu.

     Motor üç şeyi TEK işlemde yapar:
       1. Onay kuyruğu kaydını sonuçlandırır,
       2. Varsa zincirde sıradaki adımı ilerletir,
       3. Zincir bittiğinde KAYNAK KAYDIN geçişini `GV.flow` ile uygular.

     "Bekleyen onay sayısı" ve "mevcut adım" ARTIK SAKLANMIYOR (şartname
     [6.3.10]). `ops.js`'teki `onayAdim`/`onayToplam` elle sayaçları
     kaldırıldı; `GV.approval.adim()` zincirden türetir.
     =================================================================== */
  var Approval = {
    tip:function(tur){ return (window.DB && DB.approvalTypes && DB.approvalTypes[tur]) || null; },

    kayit:function(kod){
      return (window.DB && DB.approvals || []).filter(function(a){ return a.kod === kod; })[0] || null;
    },

    /* Bir kaynak kaydın onay zinciri — elle sayaç yerine olaydan türetilir */
    zincir:function(tur, kayitKod){
      var t = Approval.tip(tur);
      if(!t || !t.zincir || !window.DB || !DB[t.zincir]) return [];
      return DB[t.zincir].filter(function(z){ return z[t.zincirAlan] === kayitKod; })
                         .sort(function(a,b){ return (a.sira || 0) - (b.sira || 0); });
    },

    /* ŞARTNAME [6.3.10] — sayaç değil, türetim.
       `{ adim, toplam, sirakiKisi }`; zincir yoksa `null` döner ve ekran
       "zincir tanımlı değil" der — sıfır uydurmaz. */
    adim:function(tur, kayitKod){
      var z = Approval.zincir(tur, kayitKod);
      if(!z.length) return null;
      var tamam = z.filter(function(x){ return x.durum === 'Onaylandı'; }).length;
      var bekleyen = z.filter(function(x){ return x.durum === 'Bekliyor'; })[0] || null;
      return { adim:tamam, toplam:z.length, siradaki:bekleyen,
               sonuclandi:tamam === z.length,
               reddedildi:z.some(function(x){ return x.durum === 'Reddedildi'; }) };
    },

    /* Görevler ayrılığı — şartname [6.3.6]/[2.0.8]. ADR: aynı kişi zincirde
       birden çok adımda çıkarsa UYARILIR ve audit'e işaretlenir; engellenmez
       (16 kişilik şirkette engellemek zinciri kilitlerdi). */
    sodUyari:function(tur, kayitKod, kisi){
      var z = Approval.zincir(tur, kayitKod);
      var kez = z.filter(function(x){ return x.kisi === kisi; }).length;
      return kez > 1 ? 'Aynı kişi zincirde ' + kez + ' adımda görünüyor (görevler ayrılığı uyarısı)' : null;
    },

    /* KARAR — kuyruk + zincir + kaynak kayıt tek işlemde.
       karar: 'Onaylandı' | 'Reddedildi' | 'İade'
       opts : { neden, not }  — ret ve iade için ikisi de ZORUNLU ([2.0.6]) */
    karar:function(onayKod, karar, opts){
      opts = opts || {};
      if(!window.DB) return { ok:false, why:'veri yok' };
      var a = Approval.kayit(onayKod);
      if(!a) return { ok:false, why:'onay kaydı yok: ' + onayKod };
      if(a.durum !== 'Bekliyor') return { ok:false, why:'Bu onay zaten sonuçlanmış (' + a.durum + ')' };
      if(!can('onay')) return { ok:false, why:'yetki', roller:['onay'] };
      if(karar !== 'Onaylandı' && (!opts.neden || !String(opts.not || '').trim()))
        return { ok:false, why:'gerekce', mesaj:'Ret ve iade için neden kodu ve açıklama zorunludur' };

      var t = Approval.tip(a.tur);
      if(!t) return { ok:false, why:'"' + a.tur + '" için onay tipi tanımlı değil' };

      var me = kim();
      var sod = me ? Approval.sodUyari(a.tur, a.kayit, me) : null;

      /* 1 — zincirde bu kişinin bekleyen adımı varsa onu sonuçlandır */
      var z = Approval.zincir(a.tur, a.kayit);
      var adimKaydi = z.filter(function(x){ return x.durum === 'Bekliyor'; })[0] || null;
      if(adimKaydi){
        adimKaydi.durum = karar === 'İade' ? 'İade' : karar;
        adimKaydi.tarih = saat();
        adimKaydi.not   = opts.not || adimKaydi.not;
        if(me) adimKaydi.karargeren = me;
      }
      var durumSonrasi = Approval.adim(a.tur, a.kayit);

      /* 2 — zincir bitmediyse kuyruk kaydı BEKLEMEDE kalır; kaynak kayda
             henüz dokunulmaz. Eskiden bu ayrım hiç yoktu. */
      var zincirBitti = !durumSonrasi || durumSonrasi.sonuclandi || karar !== 'Onaylandı';
      var akis = null;

      if(zincirBitti){
        a.durum = karar === 'İade' ? 'İade' : karar;
        a.sonucTarih = saat();
        if(me) a.karargeren = me;
        if(opts.neden){ a.nedenKodu = opts.neden; a.nedenAciklama = opts.not || ''; }

        /* 3 — KAYNAK KAYDIN GEÇİŞİ. Eksik olan buydu. */
        var hedef = karar === 'Onaylandı' ? t.onay : karar === 'İade' ? t.iade : t.ret;
        if(t.entity && hedef){
          akis = Flow.gec(t.entity, a.kayit, hedef, null,
                          { not:opts.not || ('onay kuyruğu · ' + onayKod), neden:opts.neden });
          if(!akis.ok){
            /* Kaynak kayıt geçemiyorsa onay kaydını da GERİ AL — yarım
               sonuç, UID-27'nin tam olarak ürettiği yanlış güvendir. */
            a.durum = 'Bekliyor'; a.sonucTarih = null;
            if(adimKaydi){ adimKaydi.durum = 'Bekliyor'; adimKaydi.tarih = null; }
            return { ok:false, why:'kaynak', mesaj:'Onay uygulanamadı — kaynak kayıt geçişi reddetti: ' +
                     (akis.mesaj || akis.why), akis:akis };
          }
        }
      }

      log(a.kayit, (sod ? sod + ' · ' : '') +
          (zincirBitti ? 'Onay sonuçlandı' : 'Onay adımı tamamlandı') +
          ' [' + a.kod + ' · ' + a.tur + ']' +
          (durumSonrasi ? ' · adım ' + durumSonrasi.adim + '/' + durumSonrasi.toplam : '') +
          (opts.neden ? ' [' + opts.neden + ']' : '') + (opts.not ? ' — ' + opts.not : ''),
          'Bekliyor', karar,
          karar === 'Onaylandı' ? 'ok' : 'danger',
          karar === 'Onaylandı' ? 'i-check-circle' : 'i-x-circle');

      return { ok:true, onay:a, karar:karar, zincirBitti:zincirBitti,
               adim:durumSonrasi, akis:akis, sod:sod,
               not:(!t.entity && t.not) ? t.not : null };
    },

    /* ===================================================================
       ADIMIN MUHATABI — ROL mü İLİŞKİ mi (K-38 · ADR-R2-38)

       `DB.approvalFlows[].adimlar[]` iki eksende muhatap tanımlayabilir ve
       ikisi AYNI ŞEY DEĞİLDİR:
         · `rol:'muhasebe'`   → bir KÜME. "muhasebe rolündeki herkes."
                                Kişi döndürmez; döndürmeye çalışmak kümenin
                                bir üyesini keyfî biçimde seçmek olurdu.
         · `iliski:'yonetici'`→ bir KENAR. "BU kaydın kişisinin yöneticisi."
                                Kayıt olmadan çözülemez ve kayıttan kayda
                                farklı kişiye çıkar.

       Ölçülen kusur: iki adım `rol` alanında sözlükte olmayan anahtar
       taşıyordu ve `DB.roleName()` çözemiyordu; `app-ayar-sirket.html`
       adımın kendi `ad` alanını basıp uyarmak zorunda kalmıştı (V2-61).
       Biri yazım hatasıydı (`finans` → `muhasebe`), öbürü hiç rol değildi.

       `Flow.yetkili` bu ayrımı zaten yapıyor (`sorumlu`/`onaylayan`/`veren`
       ilişki, `pm` rol) ama YETKİ sorusu için. Bu yordam MUHATAP sorusunu
       cevaplar ve ikinci bir sözlük açmaz: ilişki adları aşağıda TEK yerde.

       Dönüş: { tur, anahtar, ad, kisi, cozuldu, neden }
         `cozuldu:false` → muhatap ÇÖZÜLEMEDİ. Ekran adımın `ad` alanını
         basar ve sebebini yazar; kişi UYDURMAZ, sıfır da basmaz (§10.1).
       =================================================================== */
    ILISKILER:{
      yonetici:{ ad:'Bağlı yönetici',
                 alan:'yonetici',
                 kisiAlan:'personel',
                 aciklama:'Talebi açan personelin `DB.employees[].yonetici` alanı' },
      veren:{    ad:'Talebi açan',
                 alan:null,
                 kisiAlan:'talepEden',
                 aciklama:'Kaydın `talepEden` / `personel` alanı' }
    },

    adimMuhatap:function(adim, kayit){
      if(!adim) return null;
      /* Bir adım ya rol taşır ya ilişki — ikisi birden yazılıysa defter
         çelişkilidir ve bunu yutmak, hangisinin kazandığını gizlemektir. */
      if(adim.rol && adim.iliski)
        return { tur:'celiski', anahtar:adim.rol + '+' + adim.iliski, ad:adim.ad || null,
                 kisi:null, cozuldu:false,
                 neden:'Adım hem `rol` hem `iliski` taşıyor — defter çelişkili, ' +
                       'muhatap tek eksende yazılmalı.' };

      if(adim.iliski){
        var t = Approval.ILISKILER[adim.iliski];
        if(!t)
          return { tur:'iliski', anahtar:adim.iliski, ad:adim.ad || adim.iliski, kisi:null,
                   cozuldu:false, neden:'`' + adim.iliski + '` ilişki sözlüğünde tanımlı değil.' };
        if(!kayit)
          return { tur:'iliski', anahtar:adim.iliski, ad:t.ad, kisi:null, cozuldu:false,
                   neden:'İlişki muhatabı kayıt olmadan çözülemez — ' + t.aciklama +
                         '. Zincir TANIMI gösterilirken kişi yazılmaz.' };
        var kisiKod = kayit[t.kisiAlan] || kayit.personel || kayit.talepEden || null;
        if(!kisiKod)
          return { tur:'iliski', anahtar:adim.iliski, ad:t.ad, kisi:null, cozuldu:false,
                   neden:'Kayıtta `' + t.kisiAlan + '` alanı boş — ilişki kurulamadı.' };
        if(!t.alan)
          return { tur:'iliski', anahtar:adim.iliski, ad:t.ad, kisi:kisiKod, cozuldu:true,
                   neden:null };
        var e = GV.hr && GV.hr.kayit ? GV.hr.kayit(kisiKod) : null;
        if(!e)
          return { tur:'iliski', anahtar:adim.iliski, ad:t.ad, kisi:null, cozuldu:false,
                   neden:kisiKod + ' personel kaydı bulunamadı — ilişki çözülemedi.' };
        var hedef = e[t.alan] || null;
        if(!hedef)
          return { tur:'iliski', anahtar:adim.iliski, ad:t.ad, kisi:null, cozuldu:false,
                   neden:e.kod + ' kaydında `' + t.alan + '` alanı boş — bu personelin ' +
                         'bağlı yöneticisi defterde yazılı değil.' };
        return { tur:'iliski', anahtar:adim.iliski, ad:t.ad, kisi:hedef, cozuldu:true, neden:null };
      }

      if(adim.rol){
        var bilinen = ((window.DB && DB.roles) || []).some(function(r){ return r.key === adim.rol; });
        return { tur:'rol', anahtar:adim.rol,
                 ad:bilinen ? (DB.roleName(adim.rol) || adim.rol) : (adim.ad || adim.rol),
                 /* Rol bir KÜMEdir — kişi döndürmez. */
                 kisi:null, cozuldu:bilinen,
                 neden:bilinen ? null
                     : '`' + adim.rol + '` ' + ((window.DB && DB.roles) || []).length +
                       ' rollük sözlükte YOK.' };
      }

      return { tur:null, anahtar:null, ad:adim.ad || null, kisi:null, cozuldu:false,
               neden:'Adımda ne `rol` ne `iliski` yazılı — muhatap tanımsız.' };
    },

    /* Yayındaki akış tanımı — sürüm örneğe sabitlenir ([6.3.2]) */
    akisTanim:function(tur){
      return (window.DB && DB.approvalFlows || [])
        .filter(function(f){ return f.tur === tur && f.durum === 'Yayında'; })
        .sort(function(a,b){ return (b.surum || 0) - (a.surum || 0); })[0] || null;
    },

    /* Bekleyen onay sayısı — tek kaynak. `shell.js` ve `dashboard.js` bunu
       çağırır; eskiden ikisi de elle deftere ayrı ayrı bakıyordu. */
    bekleyen:function(kisi){
      var hepsi = (window.DB && DB.approvals || []).filter(function(a){ return a.durum === 'Bekliyor'; });
      return kisi ? hepsi.filter(function(a){ return a.onaylayan === kisi; }) : hepsi;
    },

    /* ŞARTNAME [6.3.10] — "bekleyen onay sayısı" ve "mevcut adım" ayrı elle
       güncellenen sayaç OLAMAZ; onay olaylarından türer.

       `onayAdim` / `onayToplam` alanları 8 ekranda 60+ yerde okunuyordu ve
       zincirle çelişiyordu (SAT-2026-014 kartında 2/3 yazılıyken zincirde
       1/3 onaylıydı). Alanı silmek 8 ekranı kırardı; bunun yerine alan
       TÜRETİLMİŞ GÖRÜNÜME çevrildi: her yüklemede zincirden yeniden
       hesaplanır, elle yazılan değer hiçbir zaman hayatta kalmaz.
       Tek gerçeklik zincirdir; alan onun okunabilir yansımasıdır. */
    tazeleSayaclar:function(){
      if(!window.DB || !DB.purchases || !DB.purchaseApprovals) return 0;
      var n = 0;
      DB.purchases.forEach(function(p){
        var d = Approval.adim('Satın alma talebi', p.kod);
        if(!d) return;
        if(p.onayAdim !== d.adim || p.onayToplam !== d.toplam) n++;
        p.onayAdim   = d.adim;
        p.onayToplam = d.toplam;
      });
      return n;
    }
  };

  GV.approval = Approval;

  /* Sayaçlar yükleme anında zincirden türetilir — veride yazılı değer
     otoriter değildir. Sapma sayısı `GV.approval.sonSapma` ile okunabilir;
     `app-ayar-onay.html` bunu veri kalitesi bulgusu olarak basar. */
  if(window.DB && DB.purchases) Approval.sonSapma = Approval.tazeleSayaclar();

  /* ===================================================================
     FİNANS — fatura ↔ tahsilat ↔ taksit zinciri (VB-06 · VB-25)
     Zincir: sözleşme → taksit(milestone) → fatura → tahsilat(payment).
     Kapanış hangi uçtan tetiklenirse tetiklensin **tamamı** kapanır ve
     müşterinin `bekleyenTahsilat` alanı yeniden türetilir.
     =================================================================== */
  /* =====================================================================
     ÖDEME TAHSİSİ TEK KANONİK KAYNAKTIR — şartname [10.4.5]/[10.4.6]
     ---------------------------------------------------------------------
     Ölçülen kusur ÜÇ katmanlıydı:
       1. Fatura ÜÇ ayrı ekrandan elle "Ödendi" işaretlenebiliyordu
          (`app-fatura-detay` · `app-fatura` · `app-fatura-form`), üstelik
          `odemeTarihi` de elle giriliyordu — hiçbir para hareketi olmadan.
       2. `settleInvoice` faturayı kapatıp tahsilatı ona uyduruyor,
          `settlePayment` tahsilatı kapatıp faturayı ona uyduruyordu:
          ÇİFT YÖNLÜ AYNA. Hangi uçtan tetiklenirse o kanonik oluyordu.
       3. Fatura bakiyesi ALTI ayrı yerde altı ayrı formülle hesaplanıyordu;
          ikisi net, ikisi brüt eksendeydi.

     Yeni kural tek yönlüdür: **para hareketi → tahsis → fatura durumu.**
     `durum` alanı artık TÜRETİLMİŞ bir görünümdür; hiçbir yordam onu
     doğrudan yazmaz, `durumTazele()` tahsis toplamından hesaplar.
     ===================================================================== */
  var Fin = {
    /* Bir faturanın tahsis satırları */
    tahsisler:function(faturaKod){
      return (window.DB && DB.paymentAllocations || [])
        .filter(function(a){ return a.fatura === faturaKod; });
    },

    /* ---- TAHSİS DEFTERİ KAPISI (K-25) ---------------------------------
       Tek yerde tanımlı, İKİ YÖNDE de aynı: `tahsisEt` de `tahsisKaldir` da
       bunu çağırır. Küme `DB.tahsisYetkiRolleri` (org.js) — rol adları
       sözlükten doğrulandı, uydurulmadı.

       `permMatrix.finans` bayrağı BU İŞ İÇİN KULLANILMAZ: o bayrak "parayı
       görebilir" demektir ve sekiz rolde açıktır (maskeleme kuralı UID-11
       onu o anlamda okur). Tahsilatı bir faturaya yazmak ayrı bir iştir. */
    tahsisYetkisi:function(){
      var rol = (GV.perm && GV.perm.role) ? GV.perm.role() : null;
      var kume = (window.DB && DB.tahsisYetkiRolleri) || ['muhasebe','sahip','genelmudur'];
      return kume.indexOf(rol) !== -1;
    },

    /* ---- NET OKUMA — ters kayıt defteri (K-25) ------------------------
       Şartname §8.5: "tahsilat kaydı SİLİNMEZ, ters işlem üretilir."
       Bu yüzden geri alınmış bir tahsis defterden çıkmaz; yanına eksi
       tutarlı bir TERS SATIR yazılır ve ikisinin toplamı sıfır olur.

       Sonuç: "bu çiftin tahsisi var mı" sorusunun cevabı artık SATIR
       SAYISI değil NET TUTARdır. Satır sayısına bakan her kontrol, geri
       alınmış bir tahsisi hâlâ duruyor sanır — `tahsisEt` yeni tahsisi
       "zaten var" diye reddederdi, `tahsilGeriAl` nakit olayını hiç
       serbest bırakmazdı. İki soru da tek yerden cevaplanır. */
    ciftNet:function(tahsilatKod, faturaKod){
      return (window.DB && DB.paymentAllocations || [])
        .filter(function(a){ return a.tahsilat === tahsilatKod && a.fatura === faturaKod; })
        .reduce(function(s, a){ return s + (a.tutar || 0); }, 0);
    },

    /* Bir tahsilatın TÜM faturalara dağıtılmış net tutarı */
    dagitimNet:function(tahsilatKod){
      return (window.DB && DB.paymentAllocations || [])
        .filter(function(a){ return a.tahsilat === tahsilatKod; })
        .reduce(function(s, a){ return s + (a.tutar || 0); }, 0);
    },

    /* Fatura tarafında NET'i sıfırlanmamış (yaşayan) tahsis çiftleri.
       Ekran tahsis defterini çizerken hangi satırın geri alınabileceğini
       buradan okur; ters satırlar geçmiş olarak ayrıca gösterilir. */
    canliTahsisler:function(faturaKod){
      var hepsi = Fin.tahsisler(faturaKod);
      var gorulen = {};
      return hepsi.filter(function(a){
        if(a.ters || gorulen[a.tahsilat]) return false;
        gorulen[a.tahsilat] = true;
        return Fin.ciftNet(a.tahsilat, faturaKod) > 0.01;
      });
    },

    /* TEK BAKİYE YORDAMI — altı kopya formülün yerine geçer.
       Brüt eksende çalışır: fatura `toplam` alanı KDV dahildir. */
    balance:function(fatura){
      var f = typeof fatura === 'string'
        ? (window.DB && DB.invoices || []).filter(function(x){ return x.kod === fatura; })[0]
        : fatura;
      if(!f) return null;
      var brut = f.toplam || 0;
      var tahsil = Fin.tahsisler(f.kod).reduce(function(s,a){ return s + (a.tutar || 0); }, 0);
      var acik = Math.max(0, brut - tahsil);
      return { fatura:f.kod, brut:brut, tahsil:tahsil, acik:acik,
               oran:brut ? Math.round(tahsil / brut * 100) : 0,
               tamOdendi:tahsil >= brut && brut > 0, kismi:tahsil > 0 && tahsil < brut };
    },

    /* Ödeme durumu TÜRETİLİR — şartname [10.4.5].
       İKİ AYRI EKSEN (şartname [10.4.3] `Vadesi Geçti`yi "SÜREÇSEL durum"
       diye ayırıyor): `durum` ödemenin nerede olduğunu söyler, `gecikti`
       vadenin geçip geçmediğini. Tek eksene sıkıştırmak bilgi yutuyordu —
       kısmi ödenmiş ama vadesi geçmiş fatura "Vadesi Geçti" görünüp
       ödemenin bir kısmının geldiği bilgisini siliyordu. */
    odemeDurum:function(fatura){
      var b = Fin.balance(fatura);
      if(!b) return null;
      if(b.tamOdendi) return 'Ödendi';
      return b.kismi ? 'Kısmi Ödendi' : 'Ödenmedi';
    },

    /* Gecikme — saklanmaz, vade ile açık bakiyeden okunur */
    gecikti:function(fatura){
      var f = typeof fatura === 'string'
        ? (window.DB && DB.invoices || []).filter(function(x){ return x.kod === fatura; })[0]
        : fatura;
      if(!f) return false;
      var b = Fin.balance(f);
      return !!(b && b.acik > 0 && f.vade && f.vade < DB.today);
    },

    /* Gecikme günü — gecikmemişse 0 */
    gecikmeGun:function(fatura){
      var f = typeof fatura === 'string'
        ? (window.DB && DB.invoices || []).filter(function(x){ return x.kod === fatura; })[0]
        : fatura;
      if(!f || !Fin.gecikti(f)) return 0;
      return Math.max(0, Math.round((new Date(DB.today) - new Date(f.vade)) / 86400000));
    },

    /* Türetilmiş durumu kayda yansıtır. Kullanıcı çağırmaz; tahsis
       değiştiğinde motor çağırır. */
    durumTazele:function(fatura){
      var f = typeof fatura === 'string'
        ? (window.DB && DB.invoices || []).filter(function(x){ return x.kod === fatura; })[0]
        : fatura;
      if(!f) return null;
      var yeni = Fin.odemeDurum(f), eski = f.durum;
      f.durum = yeni;
      f.gecikti = Fin.gecikti(f);
      f.gecikmeGun = Fin.gecikmeGun(f);
      var b = Fin.balance(f);
      f.odemeTarihi = b.tamOdendi
        ? (Fin.tahsisler(f.kod).map(function(a){ return a.tarih; })
             .filter(Boolean).sort().pop() || f.odemeTarihi)
        : null;
      if(eski !== yeni) log(f.kod, 'Ödeme durumu tahsis toplamından türetildi (' +
        b.tahsil.toLocaleString('tr-TR') + ' / ' + b.brut.toLocaleString('tr-TR') + ' ₺)',
        eski, yeni, yeni === 'Ödendi' ? 'ok' : yeni === 'Vadesi Geçti' ? 'danger' : 'info', 'i-refresh');
      return { fatura:f, eski:eski, yeni:yeni, bakiye:b };
    },

    /* TAHSİS ET — para hareketini bir faturaya dağıtır. Çoklu fatura
       tahsisi bu yordamın birden çok kez çağrılmasıdır ([10.4.4]). */
    tahsisEt:function(tahsilatKod, faturaKod, tutar, opts){
      opts = opts || {};
      if(!window.DB) return { ok:false, why:'veri yok' };
      /* K-25 — tahsis defteri kapısı. GERİ ALMAYLA AYNI küme (bkz. tahsisYetkisi). */
      if(!Fin.tahsisYetkisi())
        return { ok:false, why:'yetki', roller:(DB.tahsisYetkiRolleri || []).slice() };
      var p = (DB.payments || []).filter(function(x){ return x.kod === tahsilatKod; })[0];
      var f = (DB.invoices || []).filter(function(x){ return x.kod === faturaKod; })[0];
      if(!p) return { ok:false, why:'tahsilat kaydı yok: ' + tahsilatKod };
      if(!f) return { ok:false, why:'fatura kaydı yok: ' + faturaKod };
      if(p.musteri && f.musteri && p.musteri !== f.musteri)
        return { ok:false, why:'Farklı müşterilere ait tahsilat ve fatura eşleştirilemez' };
      /* ŞARTNAME [10.4.5]: "BAŞARILI ÖDEME HAREKETİ kanonik kaynaktır."
         `DB.payments` bir ALACAK defteridir — kaydın varlığı paranın geldiği
         anlamına gelmez. Henüz tahsil edilmemiş bir alacağı faturaya tahsis
         etmek, faturayı para gelmeden kapatırdı: düzeltmeye çalıştığımız
         hatanın aynısı. Nakit olayı ayrı alandır ve `Fin.tahsilEt` yazar. */
      if(!p.tahsilEdildi)
        return { ok:false, why:'tahsil',
          mesaj:'Bu tahsilat henüz gerçekleşmedi. Fatura ancak tahsil edilmiş bir para ' +
                'hareketinden kapanır — önce tahsilatı "tahsil edildi" olarak kaydedin.' };

      DB.paymentAllocations = DB.paymentAllocations || [];
      /* İdempotency — aynı tahsilat aynı faturaya iki kez tahsis edilemez.
         ⚠️ Ölçüt SATIR DEĞİL NET (K-25): geri alınmış bir tahsisin asıl
         satırı defterde durmaya devam eder. Satıra bakan eski kontrol,
         ters kayıttan sonra aynı çifte yeni tahsis yazmayı sonsuza dek
         reddederdi — geri alma işlemini geri alınamaz hâle getirirdi. */
      var cift = DB.paymentAllocations.filter(function(a){
        return a.tahsilat === tahsilatKod && a.fatura === faturaKod; });
      var ciftNet = cift.reduce(function(s, a){ return s + (a.tutar || 0); }, 0);
      /* Güncellenecek satır: net hâlâ pozitifse çiftin son ASIL satırı. */
      var mevcut = ciftNet > 0.01
        ? cift.filter(function(a){ return !a.ters; }).slice(-1)[0] || null
        : null;
      if(mevcut && !opts.guncelle)
        return { ok:false, why:'Bu tahsilat bu faturaya zaten tahsis edilmiş (' +
                 ciftNet.toLocaleString('tr-TR') + ' ₺)' };

      var b = Fin.balance(f);
      var kalanFatura = b.acik + (mevcut ? mevcut.tutar : 0);
      var dagitilmis = DB.paymentAllocations
        .filter(function(a){ return a.tahsilat === tahsilatKod && a !== mevcut; })
        .reduce(function(s,a){ return s + (a.tutar || 0); }, 0);
      var kalanTahsilat = (p.tutar || 0) - dagitilmis;

      var t = tutar == null ? Math.min(kalanFatura, kalanTahsilat) : tutar;
      if(t <= 0) return { ok:false, why:'Dağıtılacak tutar kalmadı' };
      if(t > kalanTahsilat + 0.01)
        return { ok:false, why:'Tahsilatın dağıtılmamış bakiyesi ' +
                 kalanTahsilat.toLocaleString('tr-TR') + ' ₺ — daha fazlası tahsis edilemez' };
      if(t > kalanFatura + 0.01)
        return { ok:false, why:'Faturanın açık bakiyesi ' +
                 kalanFatura.toLocaleString('tr-TR') + ' ₺ — fazla ödeme ayrı kayıt gerektirir' };

      if(mevcut){ mevcut.tutar = t; mevcut.tarih = opts.tarih || mevcut.tarih; }
      else DB.paymentAllocations.push({ tahsilat:tahsilatKod, fatura:faturaKod, tutar:t,
              tarih:opts.tarih || DB.today, yontem:opts.yontem || p.yontem || 'Havale',
              dekont:opts.dekont || null });

      var sonuc = Fin.durumTazele(f);
      Fin.tahsilatDurumTazele(p);
      senkronTaksit(f);
      musteriOzet(f.musteri);
      log(p.kod, 'Tahsilat ' + f.kod + ' faturasına tahsis edildi (' +
          t.toLocaleString('tr-TR') + ' ₺)', '', f.kod, 'ok', 'i-link');
      return { ok:true, tahsis:t, fatura:f, tahsilat:p, bakiye:sonuc.bakiye, durum:sonuc.yeni };
    },

    /* ---- TAHSİS GERİ ALMA (K-25) --------------------------------------
       Şartname §8.5, iade kuralı birebir: "İade ayrı yetki ve gerekiyorsa
       onay ister; TAHSİLAT KAYDI SİLİNMEZ, TERS İŞLEM ÜRETİLİR."

       Önceki yazım kaydı `splice` ile defterden ÇIKARIYORDU. Bu üç şeyi
       birden bozuyordu: (a) §8.5'i doğrudan çiğniyordu, (b) geri alınan
       tutar hiçbir yerde okunamıyordu — denetim izi "bir şey geri alındı"
       diyordu ama defter onu hiç görmemiş gibiydi, (c) yanlışlıkla geri
       alınan bir tahsisin ne olduğu kayıttan değil yalnız günlükten
       okunabiliyordu. Artık asıl satır yerinde kalır, yanına eksi tutarlı
       ve gerekçeli bir TERS SATIR yazılır; net sıfırlanır.

       YETKİ — `DB.tahsisYetkiRolleri` = **muhasebe · sahip · genelmudur**
       (Beyar kararı, K-25 düzeltmesi). "Finans yöneticisi" diye bir rol 27
       rollük sözlükte YOKTU; kapı var olan üç rol adına kuruldu.

       ⚠️ AYNI KÜME `tahsisEt`e de uygulandı. Geri almayı kurmaktan dar bir
       role bağlamak, tahsisi kuran kullanıcıyı kendi kaydının içine
       hapsederdi — bir işi geri almak, onu yapmaktan daha ağır koşula
       bağlanamaz. Daraltma bu yüzden iki yönde birden yapıldı; `finans`
       bayrağı (8 rol) artık bu iş için okunmuyor, o bayrak "parayı
       görebilir" demektir ve maskeleme kuralına aittir.

       Gerekçe zorunluluğu yetki değil KAYIT koşuludur; kimseyi kilitlemez,
       yalnız işlemi defterde adlandırır. */
    tahsisKaldir:function(tahsilatKod, faturaKod, gerekce){
      if(!window.DB || !DB.paymentAllocations) return { ok:false, why:'veri yok' };
      if(!Fin.tahsisYetkisi())
        return { ok:false, why:'yetki', roller:(DB.tahsisYetkiRolleri || []).slice() };
      var cift = DB.paymentAllocations.filter(function(a){
        return a.tahsilat === tahsilatKod && a.fatura === faturaKod; });
      if(!cift.length) return { ok:false, why:'tahsis kaydı yok' };
      var net = cift.reduce(function(s, a){ return s + (a.tutar || 0); }, 0);
      if(net <= 0.01)
        return { ok:false, why:'Bu tahsis zaten geri alınmış — defterde ' + cift.length +
                 ' satır var ve net tutarı sıfır' };
      if(!String(gerekce || '').trim())
        return { ok:false, why:'gerekce',
          mesaj:'Gerekçe zorunludur — tahsis geri alma defterde kalıcı bir ters kayıt ' +
                'üretir ve gerekçesiz yazılmaz (şartname §8.5).' };

      var f = (DB.invoices || []).filter(function(x){ return x.kod === faturaKod; })[0];
      var p = (DB.payments || []).filter(function(x){ return x.kod === tahsilatKod; })[0];
      var asil = cift.filter(function(a){ return !a.ters; }).slice(-1)[0] || cift[0];
      var ters = {
        tahsilat:tahsilatKod, fatura:faturaKod,
        tutar:-net,                       /* eksi tutar — toplam sıfırlanır */
        tarih:DB.today,
        yontem:asil.yontem || null,
        dekont:null,
        ters:true,                        /* TERS KAYIT bayrağı */
        gerekce:String(gerekce).trim(),
        aktor:(GV.session && GV.session.emp) || null,
        terslenenTarih:asil.tarih || null
      };
      DB.paymentAllocations.push(ters);

      if(f){ Fin.durumTazele(f); senkronTaksit(f); musteriOzet(f.musteri); }
      if(p) Fin.tahsilatDurumTazele(p);
      log(tahsilatKod, 'Tahsis geri alındı — ters kayıt üretildi (' +
          net.toLocaleString('tr-TR') + ' ₺) · gerekçe: ' + ters.gerekce,
          faturaKod, 'ters kayıt', 'warn', 'i-refresh');
      return { ok:true, ters:ters, kaldirilan:net, satirSayisi:cift.length + 1 };
    },

    /* NAKİT OLAYI — paranın geldiği an. Tahsis ancak bundan sonra yapılabilir.
       Şartname [10.4.4]: yöntem, banka/kasa hesabı, dekont, valör alanları
       bu olayla birlikte kaydedilir. */
    tahsilEt:function(kod, opts){
      opts = opts || {};
      if(!window.DB) return { ok:false, why:'veri yok' };
      if(!can('finans')) return { ok:false, why:'yetki', roller:['muhasebe'] };
      var p = (DB.payments || []).filter(function(x){ return x.kod === kod; })[0];
      if(!p) return { ok:false, why:'tahsilat kaydı yok: ' + kod };
      if(p.tahsilEdildi) return { ok:false, why:'Bu tahsilat zaten gerçekleşmiş olarak kayıtlı' };
      p.tahsilEdildi   = true;
      p.tahsilTarihi   = opts.tarih  || DB.today;
      p.yontem         = opts.yontem || p.yontem || 'Havale';
      p.hesap          = opts.hesap  || p.hesap || null;
      p.dekont         = opts.dekont || p.dekont || null;
      p.valor          = opts.valor  || p.tahsilTarihi;
      p.sonAksiyon     = 'Tahsil edildi';
      p.sonAksiyonTarihi = p.tahsilTarihi;
      Fin.tahsilatDurumTazele(p);
      /* Müşterinin `bekleyenTahsilat` alanı TÜRETİLMİŞ bir değerdir (L-08) ve
         nakit olayı onu doğrudan etkiler. Tazelemeyi atlamak, tahsilat
         alındıktan sonra müşteri kartının eski bakiyeyi göstermesine yol
         açıyordu — ekran haklı olarak "fark var" diyordu. Türetimi ekranda
         değil, değeri değiştiren yordamda yapmak gerekir. */
      if(p.musteri) musteriOzet(p.musteri);
      log(p.kod, 'Tahsilat gerçekleşti (' + (p.tutar || 0).toLocaleString('tr-TR') + ' ₺ · ' +
          p.yontem + (p.dekont ? ' · dekont ' + p.dekont : '') + ')',
          '', p.tahsilTarihi, 'ok', 'i-wallet');
      return { ok:true, tahsilat:p };
    },

    /* Nakit olayı geri alınır — tahsis varsa önce onlar kaldırılmalı */
    tahsilGeriAl:function(kod, gerekce){
      if(!window.DB) return { ok:false, why:'veri yok' };
      if(!can('finans')) return { ok:false, why:'yetki', roller:['muhasebe'] };
      var p = (DB.payments || []).filter(function(x){ return x.kod === kod; })[0];
      if(!p || !p.tahsilEdildi) return { ok:false, why:'Bu tahsilat zaten gerçekleşmemiş' };
      /* ⚠️ Ölçüt SATIR DEĞİL NET (K-25). Ters kayıttan sonra defterde asıl
         satır da ters satır da durur; satır sayısına bakan eski kontrol,
         tahsisleri usulünce geri almış kullanıcıyı nakit olayını geri
         alamaz hâlde bırakırdı — kapı yanlış tarafa düşerdi. */
      var netDagitim = Fin.dagitimNet(kod);
      if(netDagitim > 0.01){
        var acikCift = (DB.paymentAllocations || []).filter(function(a){
          return a.tahsilat === kod && Fin.ciftNet(kod, a.fatura) > 0.01;
        }).map(function(a){ return a.fatura; });
        return { ok:false, why:'tahsis',
          mesaj:'Bu tahsilatın ' + netDagitim.toLocaleString('tr-TR') + ' ₺ tutarı hâlâ ' +
                'faturaya dağıtılmış (' + Array.from(new Set(acikCift)).join(', ') +
                ') — önce tahsisleri geri alın.' };
      }
      if(!String(gerekce || '').trim()) return { ok:false, why:'gerekce', mesaj:'Gerekçe zorunludur' };
      p.tahsilEdildi = false; p.tahsilTarihi = null;
      Fin.tahsilatDurumTazele(p);
      log(p.kod, 'Tahsilat geri alındı — ' + gerekce, 'Tahsil edildi', '', 'warn', 'i-refresh');
      return { ok:true, tahsilat:p };
    },

    /* Tahsilatın kendi durumu da türetilir: nakit olayı + dağıtım oranı */
    tahsilatDurumTazele:function(p){
      if(!p || !window.DB) return null;
      var dagitim = (DB.paymentAllocations || [])
        .filter(function(a){ return a.tahsilat === p.kod; })
        .reduce(function(s,a){ return s + (a.tutar || 0); }, 0);
      var eski = p.durum;
      p.dagitilan = dagitim;
      p.dagitilmamis = Math.max(0, (p.tutar || 0) - dagitim);
      p.durum = p.tahsilEdildi ? 'Ödendi'
              : p.vade && p.vade < DB.today ? 'Gecikti' : 'Bekliyor';
      if(p.durum === 'Ödendi'){ p.gecikmeGun = 0; p.sonAksiyon = 'Tahsil edildi'; }
      return { eski:eski, yeni:p.durum, dagitilan:dagitim, dagitilmamis:p.dagitilmamis };
    },

    /* Tüm faturaların durumu tahsis defterinden yeniden türetilir.
       Yükleme anında bir kez çalışır; elle yazılmış durum hayatta kalmaz. */
    tazeleHepsi:function(){
      if(!window.DB || !DB.invoices) return 0;
      var n = 0;
      (DB.payments || []).forEach(function(p){ Fin.tahsilatDurumTazele(p); });
      DB.invoices.forEach(function(f){
        var eski = f.durum, yeni = Fin.odemeDurum(f);
        if(eski !== yeni) n++;
        f.durum = yeni;
        f.gecikti = Fin.gecikti(f);
        f.gecikmeGun = Fin.gecikmeGun(f);
        if(yeni !== 'Ödendi') f.odemeTarihi = null;
      });
      return n;
    },

    /* ⚠️ ESKİ API — geriye uyum. `settleInvoice` artık faturayı ELLE
       kapatmaz; bir tahsilat bulunup tahsis edilir. Tahsilat yoksa işlem
       REDDEDİLİR: para hareketi olmadan fatura kapanmaz ([10.4.6]). */
    settleInvoice:function(kod, tarih){
      if(!window.DB) return null;
      var f = DB.invoices.filter(function(x){ return x.kod === kod; })[0];
      if(!f) return { ok:false, why:'kayıt yok' };
      var b = Fin.balance(f);
      if(b.tamOdendi) return { ok:false, why:'zaten kapalı' };
      var p = (DB.payments || []).filter(function(x){
        return x.fatura === f.kod || (x.musteri === f.musteri && (x.dagitilmamis || x.tutar) > 0); })[0];
      if(!p) return { ok:false, why:'tahsilat',
        mesaj:'Bu faturaya bağlı bir para hareketi yok. Fatura yalnız tahsilat tahsisiyle kapanır — ' +
              'önce tahsilat kaydı oluşturup bu faturaya dağıtın.' };
      return Fin.tahsisEt(p.kod, f.kod, Math.min(b.acik, p.dagitilmamis != null ? p.dagitilmamis : p.tutar),
                          { tarih:tarih || DB.today });
    },

    /* ⚠️ ESKİ API — artık faturayı "ona uydurmuyor"; tahsis üretiyor. */
    settlePayment:function(kod, tarih){
      if(!window.DB) return null;
      var p = DB.payments.filter(function(x){ return x.kod === kod; })[0];
      if(!p) return { ok:false, why:'kayıt yok' };
      if(!p.fatura) return { ok:false, why:'tahsis',
        mesaj:'Bu tahsilat hiçbir faturaya bağlı değil — dağıtım ekranından fatura seçin.' };
      var f = DB.invoices.filter(function(x){ return x.kod === p.fatura; })[0];
      if(!f) return { ok:false, why:'bağlı fatura kaydı yok: ' + p.fatura };
      var b = Fin.balance(f);
      if(b.tamOdendi) return { ok:false, why:'zaten kapalı' };
      return Fin.tahsisEt(p.kod, f.kod, Math.min(b.acik, p.tutar), { tarih:tarih || DB.today });
    },

    /* Müşterinin bekleyen tahsilatı — TÜRETİLİR, elle yazılmaz (L-08) */
    refreshCustomer:function(kod){ return musteriOzet(kod); },

    /* ===================================================================
       BAĞIMSIZ ÇAPA — tutar normalizasyonu (dilim 2 · Beyar talimatı C)
       -------------------------------------------------------------------
       ÖLÇÜLMÜŞ TARİHÇE: R1'de teklif → sözleşme zinciri KDV'yi İKİ KEZ
       uyguluyordu. Kusur görünmedi çünkü alt zincir (ödeme planı, fatura,
       tahsilat) YANLIŞ ÇAPAYA GÖRE KENDİ İÇİNDE TUTARLIYDI: her halka bir
       öncekinden türediği için hepsi aynı şişmiş sayıyı taşıyordu ve hiçbir
       eksen çelişki göremiyordu. Çözüm zinciri düzeltmek değil, ÇAPAYI
       ZİNCİRİN DIŞINA ÇIKARMAKTI.

       ÇAPA = NET. Her koleksiyon kendi alan adlarını kullanmaya devam eder
       (`quotes` → `araToplam`/`vergiOran`, `contracts` → `tutar`/`kdvOran`,
       `invoices` → `tutar`/`vergi`), ama bu yordam hepsini TEK bir eksene
       çevirir ve brüt HER ZAMAN `net + kdv` olarak yeniden hesaplanır —
       kayıttaki brüt değer otoriter DEĞİLDİR, doğrulanır.

       Dönüş: { net, oran, kdv, brut, kayitliBrut, sapma, kaynak }
       `sapma` sıfır değilse kayıt kendi içinde çelişiyordur ve ekran bunu
       SÖYLER — sessizce birini seçmek, hangi sayının doğru olduğuna kod
       adına karar vermektir. */
    tutar:function(kayit, tur){
      if(!kayit) return null;
      /* Tür verilmezse alan imzasından çıkarılır — ekranlar tür adı
         taşımak zorunda kalmasın. */
      if(!tur){
        tur = kayit.araToplam != null ? 'quote'
            : kayit.kdvOran   != null ? 'contract'
            : kayit.odeme     != null ? 'milestone'
            : kayit.vergi     != null ? 'invoice' : null;
      }
      var net = null, oran = null, kdv = null, kayitliBrut = null, kaynak = tur;

      if(tur === 'quote'){
        net = (kayit.araToplam || 0) - (kayit.indirim || 0);
        oran = kayit.vergiOran != null ? kayit.vergiOran : null;
        kdv = kayit.vergi != null ? kayit.vergi : null;
        kayitliBrut = kayit.toplam != null ? kayit.toplam : null;
      }else if(tur === 'contract'){
        net = kayit.tutar || 0;
        oran = kayit.kdvOran != null ? kayit.kdvOran : null;
        kdv = kayit.kdv != null ? kayit.kdv : null;
        kayitliBrut = kayit.toplam != null ? kayit.toplam : null;
      }else if(tur === 'invoice'){
        net = kayit.tutar || 0;
        kdv = kayit.vergi != null ? kayit.vergi : null;
        /* Faturada oran alanı YOK — orandan değil, tutardan türetilir.
           Ters yönde okumak (oranı varsayıp KDV'yi hesaplamak) tam olarak
           çift KDV'yi doğuran hamleydi. */
        oran = (net && kdv != null) ? Math.round(kdv / net * 100) : null;
        kayitliBrut = kayit.toplam != null ? kayit.toplam : null;
      }else if(tur === 'milestone'){
        /* Ödeme planı taksiti NET eksendedir — ölçüldü: 19 taksitin
           19'u bağlı sözleşmenin NET bedelini bölüyor, brütünü değil. */
        net = kayit.odeme || 0;
        oran = null; kdv = null; kayitliBrut = null;
      }else{
        return null;
      }

      var hesaplananKdv = (oran != null) ? Math.round(net * oran / 100) : kdv;
      var brut = net + (hesaplananKdv || 0);
      var sapma = [];
      if(oran != null && kdv != null && Math.abs(kdv - hesaplananKdv) > 1)
        sapma.push({ eksen:'kdv', kayitli:kdv, beklenen:hesaplananKdv });
      if(kayitliBrut != null && Math.abs(kayitliBrut - brut) > 1)
        sapma.push({ eksen:'brut', kayitli:kayitliBrut, beklenen:brut });

      return { net:net, oran:oran, kdv:hesaplananKdv, brut:brut,
               kayitliBrut:kayitliBrut, kayitliKdv:kdv,
               sapma:sapma, tutarli:sapma.length === 0, kaynak:kaynak };
    },

    /* ===================================================================
       ZİNCİR DENETİMİ — teklif → sözleşme → taksit → fatura → tahsilat
       -------------------------------------------------------------------
       Her halka bir öncekinden TÜRER; bu yordam halkaların NET ekseninde
       birbirini tutup tutmadığını söyler. Ekran da eksen de burayı çağırır;
       ikinci bir karşılaştırma yazılmaz (L-40).

       `kapsam:false` olan halka ÖLÇÜLEMEDİ demektir, "sıfır" demek değil
       (L-13): sözleşmesi olmayan bir teklifi "sapma" saymak, henüz
       yapılmamış bir işi hata saymaktır.
       =================================================================== */
    zincirDenetim:function(sozlesmeKod){
      if(!window.DB || !DB.contracts) return null;
      var c = DB.contracts.filter(function(x){ return x.kod === sozlesmeKod; })[0];
      if(!c) return null;

      var halkalar = [];
      var cT = Fin.tutar(c, 'contract');

      /* 1 — teklif → sözleşme (NET eksende) */
      var q = c.teklif ? (DB.quotes || []).filter(function(x){ return x.kod === c.teklif; })[0] : null;
      if(!q){
        halkalar.push({ ad:'Teklif → Sözleşme', kapsam:false,
                        not:c.teklif ? ('Bağlı teklif kaydı bulunamadı: ' + c.teklif)
                                     : 'Sözleşme bir teklife bağlı değil' });
      }else{
        var qT = Fin.tutar(q, 'quote');
        halkalar.push({ ad:'Teklif → Sözleşme', kapsam:true,
          sol:{ kod:q.kod, net:qT.net }, sag:{ kod:c.kod, net:cT.net },
          fark:qT.net - cT.net, tutar:Math.abs(qT.net - cT.net) <= 1,
          not:'Teklifin indirim sonrası NET tutarı sözleşme bedeline eşit olmalı' });
      }

      /* 2 — sözleşme → ödeme planı toplamı (NET eksende) */
      var taksit = (DB.milestones || []).filter(function(m){ return m.sozlesme === c.kod; });
      if(!taksit.length){
        halkalar.push({ ad:'Sözleşme → Ödeme planı', kapsam:false,
                        not:'Bu sözleşmede taksit kaydı yok — ölçüm yapılamadı' });
      }else{
        var tTop = taksit.reduce(function(s, m){ return s + (m.odeme || 0); }, 0);
        halkalar.push({ ad:'Sözleşme → Ödeme planı', kapsam:true,
          sol:{ kod:c.kod, net:cT.net }, sag:{ kod:taksit.length + ' taksit', net:tTop },
          fark:cT.net - tTop, tutar:Math.abs(cT.net - tTop) <= 1,
          not:'Taksit toplamı sözleşmenin NET bedelini tam bölmeli (Gates.sozlesmeAktif aynı ekseni arar)' });
      }

      /* 3 — taksit → fatura (NET eksende, taksit başına) */
      var fatura = (DB.invoices || []).filter(function(f){ return f.sozlesme === c.kod; });
      if(!fatura.length){
        halkalar.push({ ad:'Ödeme planı → Fatura', kapsam:false,
                        not:'Bu sözleşmeye bağlı fatura yok — henüz kesilmemiş olabilir' });
      }else{
        var sapan = [];
        fatura.forEach(function(f){
          var fT = Fin.tutar(f, 'invoice');
          if(!fT.tutarli) sapan.push({ kod:f.kod, sebep:'kendi içinde tutarsız', sapma:fT.sapma });
          if(!f.milestone) return;
          var m = taksit.filter(function(x){ return x.kod === f.milestone; })[0];
          if(!m){ sapan.push({ kod:f.kod, sebep:'bağlı taksit bulunamadı: ' + f.milestone }); return; }
          if(Math.abs((m.odeme || 0) - fT.net) > 1)
            sapan.push({ kod:f.kod, sebep:'taksit NET ' + m.odeme + ' ≠ fatura NET ' + fT.net });
        });
        halkalar.push({ ad:'Ödeme planı → Fatura', kapsam:true,
          sol:{ kod:taksit.length + ' taksit' }, sag:{ kod:fatura.length + ' fatura' },
          sapan:sapan, tutar:sapan.length === 0,
          not:'Her fatura bağlı taksitin NET tutarını taşımalı; brüt = net + KDV olmalı' });
      }

      /* 4 — fatura → tahsilat (BRÜT eksende — tahsis brüt üzerinden yürür) */
      if(!fatura.length){
        halkalar.push({ ad:'Fatura → Tahsilat', kapsam:false, not:'Fatura yok' });
      }else{
        var sapanT = [];
        fatura.forEach(function(f){
          var b = Fin.balance(f);
          if(!b) return;
          var fT = Fin.tutar(f, 'invoice');
          /* Bakiye BRÜT eksende çalışır; çapadan hesaplanan brüt ile
             `balance`ın kullandığı `toplam` ayrışırsa tahsilat yanlış
             faturayı kapatır. */
          if(Math.abs(b.brut - fT.brut) > 1)
            sapanT.push({ kod:f.kod, sebep:'bakiye brütü ' + b.brut + ' ≠ çapadan brüt ' + fT.brut });
          if(b.tahsil > b.brut + 1)
            sapanT.push({ kod:f.kod, sebep:'tahsis toplamı fatura brütünü aşıyor (' + b.tahsil + ' > ' + b.brut + ')' });
          var beklenen = Fin.odemeDurum(f);
          if(f.durum !== beklenen)
            sapanT.push({ kod:f.kod, sebep:'durum "' + f.durum + '" ama tahsis toplamı "' + beklenen + '" diyor' });
        });
        halkalar.push({ ad:'Fatura → Tahsilat', kapsam:true,
          sag:{ kod:(DB.paymentAllocations || []).filter(function(a){
                  return fatura.some(function(f){ return f.kod === a.fatura; }); }).length + ' tahsis' },
          sapan:sapanT, tutar:sapanT.length === 0,
          not:'Tahsis BRÜT eksende yürür; fatura durumu tahsis toplamından TÜRETİLİR, elle atanmaz' });
      }

      var olculen = halkalar.filter(function(h){ return h.kapsam; });
      return {
        sozlesme:c.kod, halka:halkalar,
        olculen:olculen.length, halkaSayisi:halkalar.length,
        sapan:olculen.filter(function(h){ return h.tutar === false; }).length,
        tutarli:olculen.every(function(h){ return h.tutar !== false; })
      };
    }
  };

  /* Taksitin ödeme durumu bağlı faturanın aynasıdır (VB-25): tek yerde yazılır */
  function senkronTaksit(f){
    if(!f || !f.milestone || !DB.milestones) return null;
    var m = DB.milestones.filter(function(x){ return x.kod === f.milestone; })[0];
    if(!m) return null;
    var yeni = f.durum === 'Ödendi' ? 'Ödendi' : (f.durum === 'Gecikti' ? 'Gecikti' : 'Bekliyor');
    if(m.odemeDurum !== yeni){
      log(m.kod, 'Taksit ödeme durumu bağlı faturadan güncellendi', m.odemeDurum, yeni, 'ok', 'i-link');
      m.odemeDurum = yeni;
    }
    return m;
  }

  function musteriOzet(kod){
    if(!kod || !DB.customers) return null;
    var c = DB.customers.filter(function(x){ return x.kod === kod; })[0];
    if(!c) return null;
    c.bekleyenTahsilat = DB.payments
      .filter(function(p){ return p.musteri === kod && p.durum !== 'Ödendi'; })
      .reduce(function(s, p){ return s + p.tutar; }, 0);
    return c;
  }

  /* ===================================================================
     TESLİM — müşteri onayı (VB-23)
     Üç ekran (liste · detay · form) tek yordamı çağırır. `karar` sözlüğün
     tamamını kabul eder: 'Onaylandı' | 'Bekliyor' | 'Revizyon istendi'.
     Teslim durumu ile müşteri onayı AYNI EKSENDE tutulur — detay ekranının
     davranışı doğruydu, liste ekranı eksik yazıyordu.
     =================================================================== */
  var KARARLAR = ['Onaylandı', 'Bekliyor', 'Revizyon istendi'];
  var Delivery = {
    kararlar:KARARLAR,
    approve:function(kod, karar, tarih, not){
      if(!window.DB) return null;
      if(KARARLAR.indexOf(karar) === -1) return { ok:false, why:'geçersiz karar' };
      /* Tek yetki ekseni: onay. Liste `onay`, detay `duzenle` soruyordu. */
      if(!can('onay')) return { ok:false, why:'yetki' };
      var d = DB.deliveries.filter(function(x){ return x.kod === kod; })[0];
      if(!d) return { ok:false, why:'kayıt yok' };
      if(d.musteriOnay === karar) return { ok:false, why:'zaten bu durumda' };
      var eskiOnay = d.musteriOnay, eskiDurum = d.durum;
      d.musteriOnay = karar;
      /* ⚠️ CLOUD TURU — bu yordam sözlük dışı değer yazıyordu (`'Onaylandı'` ve
         `'Planlandı'`, ikisi de teslim sözlüğünden çıktı). Artık durumu KENDİ
         yazmaz; hedefi merkezî motora bırakır. Motor geçişe izin vermezse
         müşteri onayı alanı da geri alınır — yarım sonuç bırakmaz. */
      var hedef = karar === 'Onaylandı' ? 'Kabul'
                : karar === 'Revizyon istendi' ? 'Revizyon' : null;
      if(karar === 'Onaylandı') d.onayTarihi = tarih || DB.today;
      else d.onayTarihi = null;
      if(not) d.not = not;
      if(hedef && d.durum !== hedef){
        var g = Flow.gec('delivery', d.kod, hedef, null,
                         { not:not || 'müşteri kararı: ' + karar });
        if(!g.ok){
          d.musteriOnay = eskiOnay; d.onayTarihi = eskiDurum === 'Kabul' ? d.onayTarihi : null;
          return { ok:false, why:'akis', mesaj:g.mesaj || g.why, akis:g };
        }
      }
      log(d.kod, 'Müşteri onayı işlendi' +
          (eskiDurum !== d.durum ? ' · teslim durumu ' + eskiDurum + ' → ' + d.durum : ''),
          eskiOnay, karar, karar === 'Onaylandı' ? 'ok' : 'warn',
          karar === 'Onaylandı' ? 'i-check-circle' : 'i-refresh');
      return { ok:true, teslim:d, eskiDurum:eskiDurum };
    }
  };

  /* ===================================================================
     GÖREV — durum geçişleri (REVİZE 02)

     Geçiş tablosu (`DB.taskTransitions`) beş oturumdur veride duruyordu ama
     **uygulanmıyordu**: dokuz mutasyon yolunun yalnız ikisi ona bakıyordu.
     `app-gorev-detay.html` izin verilen rolleri ve zorunlu alanları modalda
     yalnız İPUCU METNİ olarak basıyor, sonra hedefi kontrolsüz yazıyordu;
     "Onayla" ve "Revize İste" düğmeleri tabloyu tamamen atlıyordu; hata
     detayı ve arşiv ekranı da kendi durumunu elle yazıyordu.

     VB-06 / VB-23'ün aynı sınıfı: bir olgu birden çok ekrandan yürütülünce
     sonuçlar ayrışır. Mutasyon buraya alındı; ekran yalnız çağırır.

     İKİ AYRIM ÖNEMLİ:
     · `yetki` listesi ROL anahtarı da İLİŞKİ anahtarı da taşır. `'pm'` bir
       roldür ("proje yöneticisi rolündeki herkes"), `'sorumlu'` bir ilişkidir
       ("BU görevin sorumlusu"). İkisi ayrı çözülür — karıştırmak, her
       geliştiriciyi her görevin sorumlusu yapardı.
     · Onay adımının gerekip gerekmediği SAKLANMAZ, türetilir (L-08):
       kontrol eden ile onaylayan **aynı kişiyse** kontrol zaten onaydır ve
       görev doğrudan `Tamamlandı`ya gider; **farklıysa** araya `Onay bekliyor`
       girer. Veride bugün 17 görevde aynı, 9 görevde farklı.
     =================================================================== */
  /* Yeni kayıt kodu DEFTERDEN türetilir, sabit yazılmaz. Desen ekran
     brief'i §13.2'de yazılı; iki oluşturma yordamı da bunu çağırır. */
  function yeniKayitKodu(list, onek, basamak){
    var yil = String((window.DB && DB.today) || '2026').slice(0, 4), max = 0;
    (list || []).forEach(function(x){
      var m = new RegExp('^' + onek + '-' + yil + '-(\\d+)$').exec(x.kod || '');
      if(m) max = Math.max(max, +m[1]);
    });
    return onek + '-' + yil + '-' + String(max + 1).padStart(basamak || 3, '0');
  }

  var Task = {
    /* Onay adımı gerekli mi — türetilir, alan açılmaz */
    onayGerekli:function(t){ return !!t && t.onaylayan !== t.kontrolEden; },

    /* Oturumdaki kişi bu geçişi yapabilir mi.
       `iliski` anahtarları görev kaydından, rol anahtarları oturumdan çözülür. */
    yetkili:function(t, kural){
      if(!t || !kural || !kural.yetki || !kural.yetki.length) return false;
      var me  = (GV.session && GV.session.emp) || null;
      var rol = (GV.perm && GV.perm.role) ? GV.perm.role() : null;
      return kural.yetki.some(function(k){
        if(k === 'sorumlu')     return me && t.sorumlu === me;
        if(k === 'kontrolEden') return me && t.kontrolEden === me;
        if(k === 'onaylayan')   return me && t.onaylayan === me;
        if(k === 'veren')       return me && t.veren === me;
        return rol === k;
      });
    },

    /* Hedefe geçmeden önce dolu olması gereken alanlar — EKSİK OLANLARI döndürür */
    eksikAlanlar:function(t, kural, ek){
      if(!kural || !kural.zorunlu || !kural.zorunlu.length) return [];
      ek = ek || {};
      return kural.zorunlu.filter(function(alan){
        var v = (alan in ek) ? ek[alan] : t[alan];
        return v == null || v === '' || (Array.isArray(v) && !v.length);
      });
    },

    /* Bu görev + bu oturum için YAPILABİLİR geçişler.
       Ekran bunu aksiyon butonuna çevirir; uzun statü dropdown'ı basmaz. */
    nextSteps:function(kod){
      if(!window.DB) return [];
      var t = DB.tasks.filter(function(x){ return x.kod === kod; })[0];
      if(!t) return [];
      var kural = DB.taskTransitions[t.durum];
      if(!kural || !kural.next.length) return [];
      var izin = Task.yetkili(t, kural);
      var onay = Task.onayGerekli(t);
      return kural.next.filter(function(hedef){
        /* Kontrolden çıkışta iki yol da tabloda yazılı; geçerli olan BİRİ basılır */
        if(t.durum === 'Kontrolde' && hedef === 'Onay bekliyor') return onay;
        if(t.durum === 'Kontrolde' && hedef === 'Tamamlandı')    return !onay;
        return true;
      }).map(function(hedef){
        return {
          hedef:hedef,
          etiket:(DB.taskActionLabels && DB.taskActionLabels[hedef]) || hedef,
          tone:hedef === 'Tamamlandı' ? 'btn-ok'
             : hedef === 'İptal edildi' || hedef === 'Engellendi' ? 'btn-danger-line'
             : hedef === 'Revizede' ? 'btn-line'
             : hedef === 'Arşivlendi' ? 'btn-line' : 'btn-acc',
          izin:izin,
          eksik:Task.eksikAlanlar(t, kural)
        };
      });
    },

    /* Tek mutasyon noktası. `ek` geçişle birlikte yazılacak alanları taşır
       (ör. `{ revizeNot:'…' }`) ve zorunlu alan denetiminde de sayılır. */
    transition:function(kod, hedef, ek, not){
      if(!window.DB) return null;
      var t = DB.tasks.filter(function(x){ return x.kod === kod; })[0];
      if(!t) return { ok:false, why:'kayıt yok' };
      var kural = DB.taskTransitions[t.durum];
      if(!kural) return { ok:false, why:'"' + t.durum + '" için geçiş kuralı tanımlı değil' };
      if(kural.next.indexOf(hedef) === -1)
        return { ok:false, why:'"' + t.durum + '" durumundan "' + hedef + '" durumuna geçilemez' };
      if(t.durum === 'Kontrolde'){
        var onay = Task.onayGerekli(t);
        if(hedef === 'Onay bekliyor' && !onay)
          return { ok:false, why:'Bu görevde kontrol eden ile onaylayan aynı kişi — ayrı onay adımı yok' };
        if(hedef === 'Tamamlandı' && onay)
          return { ok:false, why:'Bu görev onay adımından geçmeli — önce onaya gönderin' };
      }
      if(!Task.yetkili(t, kural))
        return { ok:false, why:'yetki', roller:kural.yetki };
      var eksik = Task.eksikAlanlar(t, kural, ek);
      if(eksik.length) return { ok:false, why:'zorunlu', eksik:eksik };

      var eski = t.durum;
      if(ek) Object.keys(ek).forEach(function(k){ t[k] = ek[k]; });
      t.durum = hedef;

      /* Durum geçişinin yan etkileri — hepsi TEK yerde, ekranda değil */
      if(hedef === 'Devam ediyor' && !t.baslangic) t.baslangic = DB.today;
      if(hedef === 'Revizede'){ t.revizyon = (t.revizyon || 0) + 1; }
      if(hedef === 'Tamamlandı'){ t.ilerleme = 100; t.tamamlanma = DB.today; }
      /* Arşiv bu veride İKİ alanla anlatılıyor (`durum:'Arşivlendi'` ve `arsiv:true`)
         ve `GV.list` ikisini de arşiv sayıyor — VB-20'nin açık bıraktığı eksen.
         Yalnız birini yazmak, kaydı bir ekranda arşivli bir ekranda değil
         gösterirdi; ikisi tek yerde birlikte yazılır. */
      if(hedef === 'Arşivlendi') t.arsiv = true;
      if(hedef !== 'Engellendi' && t.beklemeNedeni && hedef === 'Devam ediyor'){
        /* Engel kalkıp çalışmaya dönülüyorsa bekleme de biter */
        Task.bekleme(kod, null, null, true);
      }
      log(t.kod, 'Durum değiştirildi' + (not ? ' — ' + not : ''), eski, hedef,
          hedef === 'Tamamlandı' ? 'ok' : hedef === 'İptal edildi' || hedef === 'Engellendi' ? 'danger' : 'info',
          hedef === 'Tamamlandı' ? 'i-check-circle' : 'i-refresh');
      return { ok:true, gorev:t, eski:eski, bildirim:kural.bildirim || [] };
    },

    /* ARŞİVDEN GERİ AL — geçiş tablosunun TERSİ DEĞİL, ayrı bir işlem.
       `Arşivlendi` bilerek son duraktır (`next:[]`): arşive iki durumdan
       gelinir (`Tamamlandı` · `İptal edildi`), dolayısıyla tabloya çıkış
       kenarı eklemek iptal edilmiş bir görevi tamamlanmış diye diriltirdi.
       İleri geçiş yordamını ters yönde kullanmak da yanlış olurdu: o yordam
       `Tamamlandı` hedefinde `tamamlanma`yı BUGÜNE yazar ve kaydın gerçek
       bitiş tarihini ezerdi.

       Bu yüzden geri alma, gideceği yeri TAHMİN ETMEZ — aktivite kaydından
       okur: arşivleme işlemi zaten `eski` değerini yazmıştır. Kayıt yoksa
       işlem YAPILMAZ ve nedeni söylenir; yarım uygulamak (arsiv bayrağını
       temizleyip durumu bırakmak) kaydı arşiv listesinde bırakır ve üstüne
       başarı mesajı basardı — UID-27'nin tam olarak o hatası. */
    arsivGeriAl:function(kod){
      if(!window.DB) return null;
      var t = DB.tasks.filter(function(x){ return x.kod === kod; })[0];
      if(!t) return { ok:false, why:'kayıt yok' };
      if(t.durum !== 'Arşivlendi' && !t.arsiv) return { ok:false, why:'zaten arşivde değil' };
      if(!can('duzenle')) return { ok:false, why:'yetki' };
      var iz = (DB.activities || []).filter(function(a){
        return a.kayit === kod && a.yeni === 'Arşivlendi' && a.eski;
      })[0];
      if(!iz) return { ok:false, why:'kaynak durum bilinmiyor',
                       aciklama:'Bu kaydın arşivlenme hareketi yazılı değil; hangi duruma döneceği tahmin edilmez.' };
      var hedef = iz.eski;
      if(DB.taskStatuses.indexOf(hedef) === -1)
        return { ok:false, why:'kaynak durum sözlükte yok', aciklama:hedef };
      var eski = t.durum;
      t.durum = hedef;
      delete t.arsiv;
      log(t.kod, 'Arşivden geri alındı', eski, hedef, 'ok', 'i-refresh');
      return { ok:true, gorev:t, eski:eski, hedef:hedef };
    },

    /* SORUMLU ATAMA — iki yol, TEK giriş noktası (REVİZE 02 kuyruğu).

       `app-gorev.html`'in toplu "Sorumlu ata" işlemi `run` taşımıyordu, yani
       pasif basılıyordu. Yazarken çıkan gerçek soru şuydu: atama bazı
       görevlerde bir GEÇİŞ (`Havuzda → Atandı`), bazılarında düz bir alan
       yazımıdır. İkisini ekranda ayırmak, REVİZE 02'nin kapattığı ikinci
       mutasyon yolunu geri açardı — bu yüzden ayrım BURADA yapılır:

       · Görev `Havuzda` ise → `transition('Atandı')`. Geçiş tablosu, yetki
         ve zorunlu alan denetimi olduğu gibi çalışır.
       · Görev zaten atanmışsa → sorumlu DEĞİŞTİRME işlemidir, durum
         değişmez. Bu bir geçiş değildir ve tabloya sokulması yanlış olurdu:
         `Devam ediyor` durumundaki bir görevi `Atandı`ya geri çekerdi. */
    ata:function(kod, emp, not){
      if(!window.DB) return null;
      var t = DB.tasks.filter(function(x){ return x.kod === kod; })[0];
      if(!t) return { ok:false, why:'kayıt yok' };
      if(!emp || !DB.emp || !DB.emp(emp)) return { ok:false, why:'personel yok' };
      if(t.sorumlu === emp) return { ok:false, why:'zaten bu kişide' };
      if(t.durum === 'Havuzda')
        return Task.transition(kod, 'Atandı', { sorumlu:emp }, not || 'sorumlu atandı');
      if(!can('duzenle')) return { ok:false, why:'yetki' };
      var eski = t.sorumlu;
      t.sorumlu = emp;
      log(t.kod, 'Sorumlu değiştirildi' + (not ? ' — ' + not : ''),
          eski, emp, 'info', 'i-user-check');
      return { ok:true, gorev:t, eski:eski, gecis:false };
    },

    /* ÖNCELİK — durum ekseninden BAĞIMSIZ düz alan. Geçiş tablosuna hiç
       dokunmaz; buraya alınmasının sebebi mutasyonun ekranda yazılmaması. */
    oncelik:function(kod, deger){
      if(!window.DB) return null;
      var t = DB.tasks.filter(function(x){ return x.kod === kod; })[0];
      if(!t) return { ok:false, why:'kayıt yok' };
      if(!DB.priorities || DB.priorities.indexOf(deger) === -1)
        return { ok:false, why:'geçersiz öncelik' };
      if(t.oncelik === deger) return { ok:false, why:'zaten bu değerde' };
      if(!can('duzenle')) return { ok:false, why:'yetki' };
      var eski = t.oncelik;
      t.oncelik = deger;
      log(t.kod, 'Öncelik değiştirildi', eski, deger, 'info', 'i-flag');
      return { ok:true, gorev:t, eski:eski };
    },

    /* BEKLEME NEDENİ — durumdan bağımsız ikinci eksen (REVİZE 01).
       Görev "Devam ediyor" kalır, yalnız neyi beklediğini söyler. Eskiden
       bunun için üç ayrı DURUM vardı ve görev ilerlemeyi bırakmış görünüyordu. */
    /* ---- GÖREV OLUŞTURMA (dilim 3) ------------------------------------
       Form ekranı kaydı KENDİ ELİYLE `DB.tasks.push(...)` ile yazmaz. İki
       form ekranı (görev · destek) aynı anda yazılıyor ve ikisi de kendi
       oluşturma kodunu kurarsa, kod üretimi · başlangıç durumu · zorunlu
       alan kümesi · denetim izi dört ayrı yerde tanımlanmış olurdu (L-40).

       BAŞLANGIÇ DURUMU SABİT YAZILMAZ: `DB.taskStatuses[0]` okunur. Görev
       bir sorumluyla açılıyorsa ilk durumdan çıkış geçişi MOTORDAN geçirilir
       (`Task.transition`) — böylece geçiş tablosunun yetki ve zorunlu alan
       denetimi atlanmaz ve ikinci bir mutasyon yolu doğmaz. */
    olustur:function(v){
      if(!window.DB) return { ok:false, why:'veri yok' };
      if(!can('ekle')) return { ok:false, why:'yetki', roller:['ekle'] };
      v = v || {};
      if(!String(v.baslik || '').trim())
        return { ok:false, why:'zorunlu', eksik:['baslik'] };

      var ilk = (DB.taskStatuses || [])[0];
      if(!ilk) return { ok:false, why:'durum sözlüğü yüklü değil' };

      var t = {
        kod:yeniKayitKodu(DB.tasks, 'GRV'),
        baslik:String(v.baslik).trim(),
        tur:v.tur || null,
        proje:v.proje || null, modul:v.modul || null, sprint:v.sprint || null,
        musteri:v.musteri || null,
        dep:v.dep || ((GV.session && GV.session.dep) || null),
        olusturan:(GV.session && GV.session.emp) || null,
        veren:v.veren || (GV.session && GV.session.emp) || null,
        sorumlu:null,                       /* atama AŞAĞIDA, motordan geçer */
        yardimci:v.yardimci || [], izleyiciler:v.izleyiciler || [],
        kontrolEden:v.kontrolEden || null, onaylayan:v.onaylayan || null,
        oncelik:v.oncelik || null, etki:v.etki || null, aciliyet:v.aciliyet || null,
        destek:v.destek || null,
        durum:ilk,
        baslangic:null, termin:v.termin || null, tamamlanma:null,
        tahminiSure:v.tahminiSure != null ? v.tahminiSure : null,
        gercekSure:0,
        /* ⚠️ İKİ KOLEKSİYON, AYNI AD, AYRI ANLAM — ölçüldü:
             `DB.tasks[].faturalanabilir`    → SAAT (26/26 sayı: 6.5 · 5 · 9 …)
             `DB.timelogs[].faturalanabilir` → BOOLEAN (satır faturalanır mı)
           İlk yazımda buraya `v.faturalanabilir === true` konmuştu; bu, sayısal
           bir kolona boolean yazmak olurdu ve `GV.proje.sure().faturalanabilir`
           toplaması sessizce bozulurdu.

           Yeni görevin faturalanabilir SAATİ sıfırdır — henüz çalışılmadı.
           Bu bir varsayım değil ölçüm: değer zaman kayıtlarından birikir,
           oluşturma anında girilmez. Form bu alanı SORMAZ. */
        faturalanabilir:0,
        ilerleme:0, revizyon:0, yenidenAcilma:0,
        aciklama:v.aciklama || null, amac:v.amac || null,
        kabulKriteri:v.kabulKriteri || null, beklenenCikti:v.beklenenCikti || null,
        etiketler:v.etiketler || [],
        aktif:true
      };
      DB.tasks.push(t);
      log(t.kod, 'Görev oluşturuldu', '', ilk, 'ok', 'i-plus');

      /* Sorumlu verildiyse atama GEÇİŞTİR — alan olarak yazılmaz. */
      var atama = null;
      if(v.sorumlu){
        atama = Task.ata(t.kod, v.sorumlu, 'oluşturma sırasında atandı');
        if(atama && atama.ok === false) return { ok:true, gorev:t, atama:atama };
      }
      return { ok:true, gorev:t, atama:atama };
    },

    bekleme:function(kod, neden, notu, sessiz){
      if(!window.DB) return null;
      var t = DB.tasks.filter(function(x){ return x.kod === kod; })[0];
      if(!t) return { ok:false, why:'kayıt yok' };
      if(neden != null && DB.taskWaitReasons.indexOf(neden) === -1)
        return { ok:false, why:'geçersiz bekleme nedeni' };
      var eski = t.beklemeNedeni || null;
      var eskiNot = t.beklemeNotu || null;
      var yeniNot = notu == null ? eskiNot : (notu || null);
      /* Neden AYNI kalıp yalnız not değişiyorsa bu bir işlemdir, "zaten bu
         durumda" değildir. İlk yazımda öyle sayılıyordu ve kullanıcı bekleme
         notunu güncelleyemiyordu — ekran dürüstçe "değişiklik yapılmadı"
         diyordu ama yapılmak istenen şey meşruydu. */
      if(eski === (neden || null) && eskiNot === yeniNot)
        return { ok:false, why:'zaten bu durumda' };
      if(neden){
        t.beklemeNedeni = neden;
        if(yeniNot) t.beklemeNotu = yeniNot; else delete t.beklemeNotu;
      }else{ delete t.beklemeNedeni; delete t.beklemeNotu; }
      if(!sessiz){
        var sadeceNot = eski === (neden || null);
        log(t.kod, sadeceNot ? 'Bekleme notu güncellendi'
                 : neden ? 'Bekleme nedeni işaretlendi' : 'Bekleme kaldırıldı',
            sadeceNot ? eskiNot : eski, sadeceNot ? yeniNot : (neden || null),
            neden ? 'warn' : 'ok', neden ? 'i-clock' : 'i-check');
      }
      return { ok:true, gorev:t, eski:eski, eskiNot:eskiNot };
    }
  };

  /* ===================================================================
     ZAMAN — tek onay ekseni (REVİZE 03)

     Ölçüldü: "onaylı zaman kaydı" bu depoda İKİ AYRI ŞEY demekti.
     · `DB.timelogs[].onay`      — satır onayı (`app-zaman.html`)
     · `DB.timesheets[].durum`   — haftalık onay (`app-zaman-onay.html`)
     İkisi birbirine bağlı değildi: haftalık timesheet onaylanınca altındaki
     satırların `onay` alanı DEĞİŞMİYORDU. Dört kayıt tam bu yüzden kendi
     haftalık defteriyle çelişiyordu (satır "Onaylandı", haftası "Onay
     bekliyor"). REVİZE 03 "gerçekleşen süre onaylanmış timesheet
     kayıtlarından gelsin" diyor — hangi eksende olduğu belirsizken o cümle
     iki farklı sayı üretir.

     KARAR — haftalık timesheet, kapsadığı satırların ONAY MERCİİDİR:
     · Bir satırı kapsayan onaylı timesheet varsa satır da onaylıdır.
     · Timesheet iade edilirse kapsadığı satırların onayı da geri alınır.
     · Kapsayan timesheet onay bekliyorsa satır TEK BAŞINA onaylanamaz —
       yordam reddeder ve nereden onaylanacağını söyler. (Yarım yol açık
       bırakmak iki eksenli hâle geri dönmek olurdu.)
     · Hiçbir timesheet kapsamıyorsa satır kendi başına onaylanabilir;
       bu depoda haftalık defter yalnız 2026-W31'i kapsıyor.
     =================================================================== */
  var Zaman = {
    /* Satırı kapsayan haftalık timesheet — yoksa null */
    timesheetOf:function(l){
      if(!window.DB || !DB.timesheets || !l) return null;
      return DB.timesheets.filter(function(t){
        return t.personel === l.personel && l.tarih >= t.baslangic && l.tarih <= t.bitis;
      })[0] || null;
    },

    /* Timesheet'in kapsadığı zaman kayıtları — kırılım da bu yordamdan okunur */
    kayitlar:function(ts){
      if(!window.DB || !DB.timelogs || !ts) return [];
      return DB.timelogs.filter(function(l){
        return l.personel === ts.personel && l.tarih >= ts.baslangic && l.tarih <= ts.bitis;
      }).sort(function(a, b){ return a.tarih < b.tarih ? -1 : a.tarih > b.tarih ? 1 : 0; });
    },

    /* HAFTALIK ONAY — timesheet + kapsadığı her satır aynı işlemde onaylanır */
    onayla:function(kod, tarih){
      if(!window.DB) return null;
      if(!can('onay')) return { ok:false, why:'yetki' };
      var ts = DB.timesheets.filter(function(x){ return x.kod === kod; })[0];
      if(!ts) return { ok:false, why:'kayıt yok' };
      if(ts.durum === 'Onaylandı') return { ok:false, why:'zaten onaylı' };
      var eski = ts.durum, t = tarih || DB.today;
      ts.durum = 'Onaylandı'; ts.onaylayan = kim() || ts.onaylayan; ts.onayTarihi = t;
      var satir = Zaman.kayitlar(ts), n = 0, saat = 0;
      satir.forEach(function(l){
        if(l.onay === 'Onaylandı') return;
        l.onay = 'Onaylandı'; n++; saat += l.sure;
      });
      log(ts.kod, 'Haftalık timesheet onaylandı' +
          (n ? ' — altındaki ' + n + ' zaman kaydı da onaylandı' : ''),
          eski, 'Onaylandı', 'ok', 'i-check-circle');
      return { ok:true, timesheet:ts, satir:satir.length, onaylanan:n, saat:saat };
    },

    /* İADE — haftalık onay geri alınırsa kapsadığı satırların onayı da geri alınır */
    iade:function(kod, gerekce){
      if(!window.DB) return null;
      if(!can('onay')) return { ok:false, why:'yetki' };
      if(!gerekce) return { ok:false, why:'gerekçe zorunlu' };
      var ts = DB.timesheets.filter(function(x){ return x.kod === kod; })[0];
      if(!ts) return { ok:false, why:'kayıt yok' };
      if(ts.durum === 'Revize bekliyor') return { ok:false, why:'zaten iade edilmiş' };
      var eski = ts.durum;
      ts.durum = 'Revize bekliyor'; ts.iadeGerekce = gerekce;
      ts.iadeTarihi = DB.today; ts.iadeEden = kim();
      var n = 0;
      Zaman.kayitlar(ts).forEach(function(l){
        if(l.onay !== 'Onaylandı') return;
        l.onay = 'Bekliyor'; n++;
      });
      log(ts.kod, 'Timesheet iade edildi — ' + gerekce +
          (n ? ' · altındaki ' + n + ' zaman kaydının onayı geri alındı' : ''),
          eski, 'Revize bekliyor', 'warn', 'i-refresh');
      return { ok:true, timesheet:ts, geriAlinan:n };
    },

    /* SATIR ONAYI — kapsayan haftalık defter varsa ONA bağlıdır */
    onaylaKayit:function(kod){
      if(!window.DB) return null;
      if(!can('onay')) return { ok:false, why:'yetki' };
      var l = DB.timelogs.filter(function(x){ return x.kod === kod; })[0];
      if(!l) return { ok:false, why:'kayıt yok' };
      if(l.onay === 'Onaylandı') return { ok:false, why:'zaten onaylı' };
      var ts = Zaman.timesheetOf(l);
      if(ts && ts.durum !== 'Onaylandı')
        return { ok:false, why:'haftalık onaya bağlı', timesheet:ts.kod, hafta:ts.hafta };
      l.onay = 'Onaylandı';
      /* ADR-07 — ORAN SNAPSHOT'I. Şartname [10.5.2] geçmiş zamanlara
         bugünkü maliyeti uygulamayı yasaklıyor. Onay, oranın dondurulması
         için doğru andır: onaylanmamış kayıt zaten maliyete girmiyor.
         Bir kez yazılan snapshot bir daha değişmez — maaş zammı geçmiş
         proje kârlılığını artık geriye dönük değiştiremez. */
      if(!(l.oranSnapshot > 0)){
        var oran = Hr.icMaliyet(l.personel, l.tarih);
        if(oran){
          l.oranSnapshot = oran.saat;
          l.oranKaynak   = oran.kaynak;
          l.oranTarih    = DB.today;
        }
      }
      log(l.kod, 'Zaman kaydı onaylandı' + (ts ? ' (' + ts.kod + ' haftası onaylı)' : '') +
          (l.oranSnapshot ? ' · maliyet oranı ' + l.oranSnapshot + ' ₺/saat olarak donduruldu' : ''),
          'Bekliyor', 'Onaylandı', 'ok', 'i-check-circle');
      return { ok:true, kayit:l, timesheet:ts, oran:l.oranSnapshot || null };
    }
  };

  /* ===================================================================
     PROJE — süre zinciri (REVİZE 03)

     "Harcanan süre" beş oturum boyunca `DB.projects[].harcananSure`
     alanında ELLE YAZILI bir sayıydı; 9.125 saatin ~8.900'ünü hiçbir kayıt
     desteklemiyordu (V-44). Alan kaldırıldı; üç değer de burada türetilir.

     · `planlanan`      — projenin `tahminiSure`si, yoksa Σ görev tahmini
     · `gerceklesen`    — Σ ONAYLI zaman kaydı (dokümanın istediği eksen)
     · `faturalanabilir`— Σ onaylı **ve** faturalanabilir kayıt
     · `tum`            — onaysızlar dahil; ekran "onay bekleyen" farkını
                          bu ikisinden gösterir, ayrı bir alan tutmaz

     `kayit === 0` olan projede ekran **sıfır basmaz**: zaman defteri o
     projeyi kapsamıyorsa doğru cümle "0 saat çalışıldı" değil "defterde
     kayıt yok"tur (L-13). `kapsam` bayrağı bunu söyler.
     =================================================================== */
  var Proje = {
    sure:function(kod){
      var bos = { planlanan:0, gerceklesen:0, faturalanabilir:0, tum:0, kayit:0, kapsam:false };
      if(!window.DB || !DB.projects) return bos;
      var p = DB.projects.filter(function(x){ return x.kod === kod; })[0];
      if(!p) return bos;
      var ls = (DB.timelogs || []).filter(function(l){ return l.proje === kod; });
      var onayli = ls.filter(function(l){ return l.onay === 'Onaylandı'; });
      var planlanan = p.tahminiSure || (DB.tasks || [])
        .filter(function(t){ return t.proje === kod; })
        .reduce(function(s, t){ return s + (t.tahminiSure || 0); }, 0);
      var yuvarla = function(n){ return Math.round(n * 100) / 100; };
      return {
        planlanan:planlanan,
        gerceklesen:yuvarla(onayli.reduce(function(s, l){ return s + l.sure; }, 0)),
        faturalanabilir:yuvarla(onayli.filter(function(l){ return l.faturalanabilir; })
          .reduce(function(s, l){ return s + l.sure; }, 0)),
        tum:yuvarla(ls.reduce(function(s, l){ return s + l.sure; }, 0)),
        kayit:ls.length,
        kapsam:ls.length > 0
      };
    },

    /* ---- REVİZE 05 — proje DURUM ekseni, tek yerde -------------------
       "Bu proje devam ediyor mu?" sorusunun cevabı YEDİ ekranda ayrı ayrı
       yazılıydı ve yedisi de aynı cümleyi kuruyordu:
       `p.durum !== 'Teslim' && !p.arsiv`. Durum sözlüğü değişince yedisinin
       yedisi birden sessizce yanlışa düşerdi — sekmesi boşalan liste hata
       vermez, sadece hiçbir şey göstermez. Tanım artık burada.

       `kapali` = KAYIT kapandı (tamamlandı ya da iptal edildi).
       `bitti`  = İŞ teslim edildi — kapanış kaydı henüz yapılmamış olabilir.
                  Eski `durum !== 'Teslim'` cümlesinin birebir karşılığı budur;
                  `Teslim` iş bitmiş ama defter kapanmamış projedir
                  (R07 kapanış akışının hedefi tam olarak o aralıktır).
       `arsivli`= kaydın defterden çekilmiş olması — ayrı eksendir; arşivli
                  olmayan tamamlanmış proje de mümkündür.
       `acik`   = işi bitmemiş ve arşivlenmemiş. Liste sekmeleri, dashboard
                  sayaçları ve "aktif proje" KPI'ları bunu çağırır. */
    kapaliDurumlar:['Tamamlandı','İptal Edildi'],
    teslimDurumlari:['Teslim','Kapanış','Tamamlandı'],

    kapali:function(p){
      p = Proje.kayit(p);
      return !!p && Proje.kapaliDurumlar.indexOf(p.durum) !== -1;
    },

    bitti:function(p){
      p = Proje.kayit(p);
      return !!p && (Proje.teslimDurumlari.indexOf(p.durum) !== -1 ||
                     !!p.gercekBitis || p.ilerleme === 100);
    },

    /* `arsiv` TEK arşiv eksenidir (VB-20). `aktif:false` eski ikinci eksendi
       ve buradaki okuma K-33'te kaldırıldı: proje kayıtlarında `aktif` alanı
       zaten YOKTU, yani bu koşul her zaman `false` veren ÖLÜ bir okumaydı —
       ama kaldırılmadıkça "iki eksen var" izlenimini sürdürüyordu. */
    arsivli:function(p){
      p = Proje.kayit(p);
      return !!p && GV.arsivli(p);
    },

    acik:function(p){
      p = Proje.kayit(p);
      return !!p && !Proje.bitti(p) && !Proje.arsivli(p);
    },

    /* Planlanan bitişi geçmiş ve hâlâ açık olan proje. Beş ekran bu cümleyi
       ayrı ayrı yazıyordu; `DB.today` sabit gün olduğu için hepsi aynı yanıtı
       vermek zorundaydı ama tanım kaydıkça ayrışırlardı. */
    geciken:function(p){
      p = Proje.kayit(p);
      return !!p && Proje.acik(p) && !!p.planlananBitis && p.planlananBitis < DB.today;
    },

    /* Kod da kayıt da kabul edilir — çağıran ekran elindekini verir. */
    kayit:function(p){
      if(!p) return null;
      if(typeof p !== 'string') return p;
      if(!window.DB || !DB.projects) return null;
      return DB.projects.filter(function(x){ return x.kod === p; })[0] || null;
    }
  };

  /* ===================================================================
     İK — saatlik iç maliyet (REVİZE 04)

     Ölçüldü: `DB.employees[].saatlikUcret` 16 personelin **1'inde** dolu
     (EMP-015, freelancer). Kalan 15'i `maas` ekseninde ve
     `app-personel-form.html:146` **`maas > 0` XOR `saatlikUcret > 0`**
     kuralını uyguluyor — yani 16/16 `saatlikUcret` doldurmak var olan bir
     sözleşmeyi kırardı.

     Ayrıca sözleşmeli saat ücreti ile şirkete iç maliyet **farklı şeylerdir**:
     birincisi dışarıya fatura edilen tutar, ikincisi işverene maliyet.

     KARAR: yeni alan AÇILMADI. İç maliyet iki var olan alandan **türetilir**
     (L-08 — az önce `harcananSure`yi tam bu gerekçeyle kaldırdık; bir sonraki
     commit'te yeni bir türetilebilir sayaç saklamak onunla çelişirdi).
     Hesabın iki girdisi `DB.company`'de yazılı sabittir.
     =================================================================== */
  var Hr = {
    /* ===================================================================
       PERSONEL YAŞAM DÖNGÜSÜ — TEK EKSEN (K-18, R1'den devreden borç)

       Ölçüldü: `DB.employees[].durum` yedi değerlik gerçek bir yaşam
       döngüsüdür (`org.js:462`) ve `DB.transitions.employee` yedi durumu
       da tanımlar — ama HİÇBİR ekran onu okumuyordu. Yedi ekran bunun
       yerine `e.aktif !== false` yazıyordu ve o alan **16/16 kayıtta
       `true`** idi: yani hiçbir şey söylemiyordu. Somut sonuç —
       `EMP-015` (Nihan Arslan) `Offboarding` durumunda, çıkış tarihi
       2026-08-31 yazılı, ve yedi ekranın yedisinde de hâlâ "görev
       atanabilir personel" listesinde görünüyordu.

       Bu yüzden `aktif` alanı KALDIRILDI (tuzağa çevrildi, `hr.js`) ve
       yerine iki TÜRETİLMİŞ yordam kondu. İki ayrı soru, iki ayrı cevap:
         · `istihdamda` — şirketle ilişkisi var mı (bordro, özlük, rapor)
         · `atanabilir` — YENİ İŞ verilebilir mi (atama listeleri)
       İkisini tek "aktif" bayrağına sıkıştırmak, izinli bir çalışanı
       bordrodan düşürmek ya da ayrılmakta olana yeni görev atamak
       demekti; ikisi de bu depoda oluyordu.
       =================================================================== */

    /* Şirketle istihdam ilişkisi sürüyor mu. `Taslak` henüz işe girmemiş,
       `Ayrıldı` ilişkisi bitmiş kayıttır; kalan beşi bordrodadır. */
    istihdamda:function(e){
      var d = Hr.durum(e);
      return !!d && d !== 'Taslak' && d !== 'Ayrıldı';
    },

    /* YENİ iş atanabilir mi. `İzinli` ve `Pasif` ayrı sebeplerdir ama
       ikisi de "şu an çalışmıyor" der (org.js:457-461); `Offboarding`
       çıkış sürecidir ve yeni iş almaz. */
    atanabilir:function(e){
      return Hr.durum(e) === 'Aktif';
    },

    /* Kod da kayıt da kabul edilir — çağıran elindekini verir. */
    kayit:function(e){
      if(!e) return null;
      if(typeof e !== 'string') return e;
      if(!window.DB || !DB.employees) return null;
      return DB.employees.filter(function(x){ return x.kod === e; })[0] || null;
    },

    durum:function(e){
      var k = Hr.kayit(e);
      return k ? k.durum : null;
    },

    /* ===================================================================
       KİŞİSEL VERİ KAPISI — özlük · sağlık · maaş

       Personel kaydı üç ayrı hassasiyette alan taşır ve üçü AYNI kapıdan
       geçmez:
         · genel   — ad, pozisyon, departman, rol · herkes görür
         · özlük   — doğum tarihi, kan grubu, acil kişi, ev telefonu, adres
         · maaş    — `maas`, `saatlikUcret`, `DB.salaryHistory`

       Maaş kapısı zaten vardı (`permMatrix.maas`, 4 rol: sahip ·
       genelmudur · ik · muhasebe) ve `GV.perm.mask` onu uyguluyor.
       ÖZLÜK için kapı YOKTU — kan grubu ve acil kişi bilgisi hiçbir
       kontrolden geçmeden basılabilirdi. Yeni bir matris anahtarı
       AÇILMADI (uydurma yetki adı yok): var olan `personel` KAPSAMINDAN
       türetilir.
         `tum`       → herkesin özlüğü
         `departman` → yalnız kendi departmanı
         `proje`     → hayır (proje kapsamı özlük vermez)
         yok/boş     → yalnız KENDİ kaydı
       Kendi kaydını herkes görür — kişinin kendi kan grubunu görmesi bir
       yetki sorunu değildir. */
    ozlukGorebilir:function(e){
      var k = Hr.kayit(e);
      if(!k) return false;
      var me = (GV.session && GV.session.emp) || null;
      if(me && k.kod === me) return true;                     /* kendi kaydı */
      var kapsam = (GV.perm && GV.perm.scope) ? GV.perm.scope('personel') : 'yok';
      if(kapsam === 'tum') return true;
      if(kapsam === 'departman'){
        var benim = (GV.session && GV.session.dep) || null;
        return !!benim && k.dep === benim;
      }
      return false;
    },

    /* Maaş kapısı — matris anahtarı üzerinden, ekran kendi kopyasını kurmaz. */
    maasGorebilir:function(){
      return !!(GV.perm && GV.perm.can && GV.perm.can('maas'));
    },

    /* Özlük alanının EKRANDA basılacak hâli. Yetkisizde `0` ya da boş
       DEĞİL, maskelenmiş değer döner (UID-11): boş bırakmak "veri yok"
       demektir, oysa veri var ve görülemiyor — ikisi ayrı şeydir. */
    ozluk:function(e, alan){
      var k = Hr.kayit(e);
      if(!k) return null;
      return Hr.ozlukGorebilir(k) ? k[alan] : '••••••';
    },

    /* Atama listeleri için hazır küme — yedi ekran aynı süzgeci ayrı ayrı
       yazıyordu (L-40). Sıralama ada göre, çağıran yeniden sıralamaz. */
    atanabilirler:function(){
      return ((window.DB && DB.employees) || [])
        .filter(Hr.atanabilir)
        .slice()
        .sort(function(a, b){ return String(a.ad).localeCompare(String(b.ad), 'tr'); });
    },

    /* Şirkete saatlik iç maliyet — { saat, kaynak, formul } · yoksa null
       ─────────────────────────────────────────────────────────────────
       ⚠️ CLOUD TURU · ADR-07 — YORDAM ARTIK TARİH ALIR.
       Ölçülen kusur: yordamın tarih parametresi yoktu ve `Proje.maliyet`
       HER zaman kaydına BUGÜNKÜ oranı çarpıyordu. Sonuç: bir maaş zammı
       geçmiş projelerin maliyetini ve kârlılığını geriye dönük değiştiriyordu.
       Şartname [10.5.2] bunu doğrudan yasaklıyor: "Bugünkü personel
       maliyetini geçmiş zamanlara uygulama. Oran anlık görüntüsü veya
       geçerlilik aralığı kullan."

       ÜÇ KADEMELİ ÇÖZÜM, en güvenilirden en zayıfa:
         1. Zaman kaydında `oranSnapshot` varsa O kullanılır — satır onaylanırken
            dondurulmuş gerçek orandır.
         2. Yoksa `DB.salaryHistory` içinde tarihi kapsayan kayıt aranır.
         3. O da yoksa bugünkü orana düşülür ve `guvenilir:false` işaretlenir —
            çağıran bunu ekranda söyleyebilsin diye. Sessizce bugünü kullanmak
            tam da kapatılan hataydı. */
    icMaliyet:function(kod, tarih){
      if(!window.DB || !DB.employees) return null;
      var e = DB.employees.filter(function(x){ return x.kod === kod; })[0];
      if(!e) return null;
      var c = DB.company || {};

      /* 2 — tarihe göre geçerli maaş kaydı */
      var gecmis = null;
      if(tarih && DB.salaryHistory){
        gecmis = DB.salaryHistory.filter(function(h){
          return h.personel === kod && h.baslangic <= tarih &&
                 (!h.bitis || h.bitis >= tarih); })[0] || null;
      }

      if(e.saatlikUcret > 0 && !gecmis)
        return { saat:e.saatlikUcret, kaynak:'saatlikUcret', guvenilir:true,
                 formul:'Sözleşmeli saat ücreti · ' + e.saatlikUcret + ' ₺/saat' };

      var maas = gecmis ? gecmis.maas : e.maas;
      if(maas > 0){
        var s = Math.round(maas * c.isverenMaliyetKatsayisi / c.aylikCalismaSaati);
        return { saat:s, kaynak:gecmis ? 'maasGecmisi' : 'maas',
                 guvenilir:!!gecmis || !tarih,
                 donem:gecmis ? (gecmis.baslangic + ' →' + (gecmis.bitis || ' bugün')) : null,
                 formul:maas + ' ₺ brüt × ' + c.isverenMaliyetKatsayisi + ' ÷ ' +
                        c.aylikCalismaSaati + ' saat = ' + s + ' ₺/saat' +
                        (gecmis ? ' (' + gecmis.baslangic + ' dönemi oranı)'
                                : tarih ? ' (⚠ bu tarih için maaş geçmişi yok, bugünkü oran)' : '') };
      }
      /* İki eksenin ikisi de boşsa maliyet UYDURULMAZ — null döner ve
         çağıran bunu ekranda söyler. */
      return null;
    },

    /* Zaman kaydının maliyet oranı — snapshot varsa o, yoksa tarihe göre.
       `Proje.maliyet` bunu çağırır; ham `icMaliyet`i çağırmaz. */
    kayitOrani:function(l){
      if(!l) return null;
      if(l.oranSnapshot > 0)
        return { saat:l.oranSnapshot, kaynak:'oranSnapshot', guvenilir:true,
                 formul:'Satır onayında dondurulan oran · ' + l.oranSnapshot + ' ₺/saat' };
      return Hr.icMaliyet(l.personel, l.tarih);
    },

    /* İstihdam ilişkisi dış kaynak mı — `sozlesme` alanından türetilir.
       R16 bu ekseni `DB.employees[].calismaTipi` olarak resmîleştirecek;
       o zamana kadar tek yer burasıdır, ekranlar kendi kuralını yazmaz. */
    /* REVİZE 16 — eksen artık `calismaTipi`dir, sözleşme türü değil.
       Önceki tanım (`sozlesme === 'Hizmet sözleşmesi'`) bir VEKİLDİ ve
       components.md'de "R16 bu ekseni resmîleştirecek, o zamana kadar tek yer
       burasıdır" diye yazılıydı; o gün geldi. `Kadrolu` dışındaki her istihdam
       ilişkisi (Freelancer · Ajans · Danışman · Dış Kaynak) dış kaynaktır ve
       proje maliyetinde personel değil DIŞ KAYNAK kalemine yazılır (REVİZE 04).
       Alan yoksa eski vekile düşülür — şema kayıttan kayda değişmesin diye
       `canon.js` eksen 37 alanın 16/16 tanımlı olmasını zaten zorunlu kılıyor. */
    disKaynak:function(kod){
      var e = (window.DB && DB.employees || []).filter(function(x){ return x.kod === kod; })[0];
      if(!e) return false;
      return e.calismaTipi ? e.calismaTipi !== 'Kadrolu' : e.sozlesme === 'Hizmet sözleşmesi';
    }
  };

  GV.fin = Fin;
  /* Fatura ve tahsilat durumları yükleme anında tahsis defterinden yeniden
     türetilir — veride yazılı değer otoriter değildir ([10.4.5]). */
  if(window.DB && DB.invoices) Fin.sonSapma = Fin.tazeleHepsi();
  GV.delivery = Delivery;
  GV.task = Task;
  GV.zaman = Zaman;
  /* ===================================================================
     DESTEK TALEBİ (REVİZE 09)

     "Açık talep" tanımı DOKUZ yerde elle yazılıydı: üç ekranda durum listesi
     (`app-destek.html` ×2 · `app-destek-form.html`), altı yerde de kapalı
     durumların dışlanması (`shell.js` · `dashboard.js` · `app-musteri-detay`
     ×2 · `app-rapor-musteri` · `app-destek`). Sözlük yeniden adlandırılınca
     dokuzunun dokuzu birden sessizce yanlış sayardı — sayaç sıfırlanır,
     hata çıkmaz (R01'de `shell.js` sayacının başına gelen buydu).

     `cozumTarihi` ALAN DEĞİLDİR, türetilir: `acilis + cozumSuresi` (dakika).
     İkisini ayrı yazmak, er geç çelişecek iki defter tutmaktır (L-08).
     `cozumSuresi` SLA matematiğinin girdisidir; ona dokunulmadı.
     =================================================================== */
  var Destek = {
    /* Sözlük VERİDEN okunur (`DB.ticketClosedStatuses`) — `shell.js` de aynı
       listeyi kullanıyor ve o `domain.js`'ten önce yükleniyor. */
    kapaliDurumlar:function(){ return (window.DB && DB.ticketClosedStatuses) || []; },

    kayit:function(t){
      if(!t) return null;
      if(typeof t !== 'string') return t;
      if(!window.DB || !DB.tickets) return null;
      return DB.tickets.filter(function(x){ return x.kod === t; })[0] || null;
    },

    /* Talebin bakım paketi — şartname [9.5.5] kotanın buradan düşmesini istiyor.
       ⚠️ BAĞ DOLAYLIDIR: `ticket.bakimPaketi` bir paket KODU değil, paket TİPİ
       taşıyor ('Standart' · 'Kurumsal'). Paket kaydına müşteri üzerinden
       ulaşılır; tip yazılıysa aynı tipteki paket tercih edilir.
       Eşleşme yoksa `null` döner ve kota düşümü YAPILMAZ — olmayan bir paketten
       saat düşmek, ölçüm gibi görünen bir kurgu olurdu. */
    paketOf:function(t){
      var k = Destek.kayit(t);
      if(!k || !window.DB || !DB.supportPackages) return null;
      var aday = DB.supportPackages.filter(function(p){
        /* K-33: `p.aktif !== false` okuması kaldırıldı. Paket kayıtlarında
           `durum` kanondur ve 7/7 kayıtta `aktif` zaten `true`ydu — hiçbir
           paketi elemeyen, yalnız ikinci bir eksen varmış gibi gösteren bir
           koşuldu. Eleme tek eksenden yapılır. */
        return p.durum !== 'Sona erdi' && p.musteri === k.musteri; });
      if(!aday.length) return null;
      if(k.proje){
        var projeli = aday.filter(function(p){ return p.proje === k.proje; });
        if(projeli.length) aday = projeli;
      }
      /* SEVİYE EŞLEŞMESİ — K-27 sonrası TAM EŞİTLİK.
         Kanon kısa biçimdir ve üç yerde de aynıdır: `DB.supportPackageTypes`
         sözlüğü, `DB.supportPackages[].seviye`, `DB.tickets[].bakimPaketi`.
         Önceki iki yazım da yanlıştı: ilki `tip` ile karşılaştırıyordu
         (7/7 'Bakım', yani seviye değil cins — hiç tutmuyordu), ikincisi
         uzun `ad`ın önekini arıyordu (biçim farkını kodla kapatmak). Artık
         biçim farkı YOK, karşılaştırma düz eşitlik. */
      if(k.bakimPaketi){
        var seviyeli = aday.filter(function(p){ return p.seviye === k.bakimPaketi; });
        if(seviyeli.length) return seviyeli[0];
      }
      return aday[0];
    },

    /* Paketin EKRANDA GÖRÜNEN tam adı — `seviye + tip` (K-27).
       Uzun ad veride DURMAZ; birleştirmeyi ekran yapar demek, birleştirmeyi
       HER ekranın ayrı yapması demek değildir. Tek yerde. */
    paketAdi:function(p){
      if(!p) return null;
      return [p.seviye, p.tip].filter(Boolean).join(' ') || null;
    },

    /* Kotadan düşülecek süre — ücretli talep pakete yazılmaz ([9.5.5]) */
    kotaDusum:function(t){
      var k = Destek.kayit(t);
      if(!k || k.ucretli) return 0;
      return k.harcananSure || 0;
    },

    acik:function(t){
      t = Destek.kayit(t);
      return !!t && Destek.kapaliDurumlar().indexOf(t.durum) === -1;
    },

    kapali:function(t){
      t = Destek.kayit(t);
      return !!t && Destek.kapaliDurumlar().indexOf(t.durum) !== -1;
    },

    /* Çözüm zamanı — `acilis` + `cozumSuresi` dakika. Çözüm süresi yoksa
       çözüm de yoktur: `null` döner, ekran "çözüm kaydı yok" der. */
    /* ---- DESTEK TALEBİ OLUŞTURMA (dilim 3) ----------------------------
       Görev tarafıyla aynı gerekçe: form kaydı kendi eliyle yazmaz.

       ⚠️ `sla` ve `slaDurum` UYDURULMAZ. `sla` bir SÜRE taahhüdüdür ve
       `DB.slaPolicies` matrisinden (kategori × öncelik) OKUNUR; eşleşme
       yoksa alan **boş bırakılır** ve ekran sebebini yazar. `slaDurum`
       canlı hesaplanan bir sayaç değildir (BE-D1) — yeni kayıtta ölçülmemiş
       olduğu için `null` kalır, 'Zamanında' yazmak ölçülmemişi ölçülmüş
       göstermek olurdu (L-13). */
    slaPolitikasi:function(kategori, oncelik){
      /* ⚠️ İKİ ÖLÇÜM. (a) Üç politika `oncelik:'Tümü'` taşır — joker eşleşme
         yoksa `Geliştirme talebi` · `Kullanım sorusu` · `Bilgi talebi`
         kategorileri hiçbir politikaya düşmezdi. (b) Talep kaydındaki `sla`
         alanı politikanın `etiket`iyle eşleşir (`'4 saat'`), `ilkYanit` ile
         DEĞİL: `ilkYanit` DAKİKADIR (60 · 120 · 240). Ölçüldü — yayındaki 7
         talebin 7'sinde `sla` bir etiket dizesidir. İkisini karıştırmak
         defterin içine iki farklı birim yazmak olurdu. */
      var L = (window.DB && DB.slaPolicies) || [];
      return L.filter(function(p){
        return p.kategori === kategori && p.oncelik === oncelik;
      })[0] || L.filter(function(p){
        return p.kategori === kategori && p.oncelik === 'Tümü';
      })[0] || null;
    },

    olustur:function(v){
      if(!window.DB) return { ok:false, why:'veri yok' };
      if(!can('ekle')) return { ok:false, why:'yetki', roller:['ekle'] };
      v = v || {};
      if(!String(v.baslik || '').trim())
        return { ok:false, why:'zorunlu', eksik:['baslik'] };
      if(!v.musteri) return { ok:false, why:'zorunlu', eksik:['musteri'] };

      var ilk = (DB.ticketStatuses || [])[0];
      if(!ilk) return { ok:false, why:'durum sözlüğü yüklü değil' };

      var hesap = (DB.accounts || []).filter(function(x){ return x.kod === v.musteri; })[0];
      var pol   = Destek.slaPolitikasi(v.kategori, v.oncelik);

      var t = {
        kod:yeniKayitKodu(DB.tickets, 'DST'),
        musteri:v.musteri,
        musteriAd:hesap ? hesap.unvan : (v.musteriAd || null),
        proje:v.proje || null,
        baslik:String(v.baslik).trim(),
        kategori:v.kategori || null,
        oncelik:v.oncelik || null,
        etki:v.etki || null,
        /* Politikadan OKUNDU; yoksa boş — uydurulmadı. */
        sla:pol ? pol.etiket : null,     /* ETİKET dizesi — `ilkYanit` DAKİKADIR */
        sorumlu:v.sorumlu || null,
        acan:v.acan || (GV.session && GV.session.kontak) || (GV.session && GV.session.emp) || null,
        acilis:DB.today,
        ilkYanit:null, mudahaleSuresi:null, cozumSuresi:null,
        durum:ilk,
        harcananSure:0,
        ucretli:v.ucretli === true,
        bakimPaketi:v.bakimPaketi || null,
        kalanDestek:null,
        memnuniyet:null,
        slaDurum:null,                 /* ölçülmedi — BE-D1, sayaç canlı değil */
        kanal:v.kanal || null,
        aciklama:v.aciklama || null,
        cozumAciklama:null, cozenPersonel:null, musteriOnay:null, kapanisTarihi:null,
        aktif:true
      };
      DB.tickets.push(t);
      log(t.kod, 'Destek talebi açıldı' + (pol ? ' · SLA ' + pol.etiket + ' (politika ' + pol.kod + ')'
                                               : ' · SLA politikası eşleşmedi, süre boş bırakıldı'),
          '', ilk, 'ok', 'i-plus');
      return { ok:true, talep:t, politika:pol };
    },

    cozumTarihi:function(t){
      t = Destek.kayit(t);
      if(!t || t.cozumSuresi == null || !t.acilis) return null;
      var d = new Date(t.acilis);
      d.setMinutes(d.getMinutes() + t.cozumSuresi);
      var iki = function(n){ return (n < 10 ? '0' : '') + n; };
      return d.getFullYear() + '-' + iki(d.getMonth() + 1) + '-' + iki(d.getDate()) +
             'T' + iki(d.getHours()) + ':' + iki(d.getMinutes());
    }
  };

  /* ===================================================================
     YENİLEME — sözleşme ve hizmet paketi (REVİZE 17)
     ───────────────────────────────────────────────────────────────────
     Aynı iş İKİ EKRANDA ayrı ayrı yazılıydı ve ikisi farklı davranıyordu:
     `app-sozlesme-detay.html` yalnız `bitis`i bir yıl uzatıyor ve aktivite
     kaydı yazıyordu; `app-destek-paket.html` `baslangic` ile `bitis`i birlikte
     kaydırıyor, yenileme işaretini tüketiyor ama **hiç aktivite yazmıyordu**.
     Talimat "aynı özelliği iki farklı yerde yeniden oluşturma" diyor; yordam
     tek yere indi, alan politikası TÜRE göre yazılı:

       'sozlesme' → `bitis` +1 yıl · `yenilemeTarihi` varsa +1 yıl · durum Aktif.
                    `baslangic` DEĞİŞMEZ — imza dönemi geçmiştir.
       'paket'    → `baslangic` ve `bitis` birlikte +1 yıl (kota dönemi kayar,
                    ay sayısı ve dolayısıyla `kullanilan + kalan = aylikSaat × ay`
                    sözleşmesi korunur) · durum Aktif · yenileme işareti tüketilir.
                    Kota DEVREDER — bugünkü davranış budur ve ekran bunu yazıyor.

     İkisi de artık aktivite kaydı yazar. Okuduğu koleksiyonlar (L-34):
     `misc.js` (contracts) · `ops.js` (supportPackages) · `work.js` (activities).
     =================================================================== */
  var TUR_ALAN = {
    sozlesme:{ koleksiyon:'contracts',       ad:'Sözleşme',      baslangicKayar:false, isaretVar:false },
    paket:   { koleksiyon:'supportPackages', ad:'Hizmet paketi', baslangicKayar:true,  isaretVar:true  }
  };
  function yilEkle(iso){
    return iso ? (Number(String(iso).slice(0, 4)) + 1) + String(iso).slice(4) : iso;
  }
  var Yenileme = {
    /* Kaydı bulur — tür bilinmiyorsa `null`. */
    kayit:function(tur, kod){
      var t = TUR_ALAN[tur];
      if(!t || !window.DB) return null;
      return (DB[t.koleksiyon] || []).filter(function(x){ return x.kod === kod; })[0] || null;
    },
    /* Ekranın onay metnini kurabilmesi için: ne olacağının ÖNİZLEMESİ.
       Mutasyon yok — ekran ile yordam aynı sayıyı söylesin diye açıktır. */
    onizleme:function(tur, kod){
      var t = TUR_ALAN[tur], r = this.kayit(tur, kod);
      if(!r) return null;
      return {
        tur:tur, etiket:t.ad,
        eskiBaslangic:r.baslangic, yeniBaslangic:t.baslangicKayar ? yilEkle(r.baslangic) : r.baslangic,
        eskiBitis:r.bitis, yeniBitis:yilEkle(r.bitis),
        eskiDurum:r.durum,
        isaret:t.isaretVar ? !!r.yenileme : null
      };
    },
    /* Bir yıl uzatır. Dönüş sözleşmesi ortak: { ok:true, … } / { ok:false, why }. */
    uzat:function(tur, kod){
      var t = TUR_ALAN[tur];
      if(!t) return { ok:false, why:'tür' };
      var r = this.kayit(tur, kod);
      if(!r) return { ok:false, why:'kayıt yok' };
      if(!r.bitis) return { ok:false, why:'bitiş tarihi yok' };
      var eskiBitis = r.bitis, eskiDurum = r.durum;
      if(t.baslangicKayar) r.baslangic = yilEkle(r.baslangic);
      r.bitis = yilEkle(r.bitis);
      if(r.yenilemeTarihi) r.yenilemeTarihi = t.isaretVar ? null : yilEkle(r.yenilemeTarihi);
      if(t.isaretVar) r.yenileme = false;
      r.durum = 'Aktif';
      log(r.kod, t.ad + ' bir yıl yenilendi (durum: ' + eskiDurum + ' → Aktif)',
          eskiBitis, r.bitis, 'ok', 'i-refresh');
      return { ok:true, kod:r.kod, eskiBitis:eskiBitis, bitis:r.bitis,
               baslangic:r.baslangic, eskiDurum:eskiDurum };
    },
    /* Yenilemeye işaretle — paket ekseninde toplu işlem bunu çağırır. */
    isaretle:function(tur, kod){
      var t = TUR_ALAN[tur];
      if(!t || !t.isaretVar) return { ok:false, why:'tür' };
      var r = this.kayit(tur, kod);
      if(!r) return { ok:false, why:'kayıt yok' };
      if(r.yenileme) return { ok:false, why:'zaten işaretli' };
      r.yenileme = true;
      r.yenilemeTarihi = r.yenilemeTarihi || r.bitis;
      log(r.kod, t.ad + ' yenilemeye işaretlendi', '', r.yenilemeTarihi, 'warn', 'i-flag');
      return { ok:true, kod:r.kod, tarih:r.yenilemeTarihi };
    }
  };

  GV.destek = Destek;
  GV.proje = Proje;
  /* ===================================================================
     VARLIK — ZİMMET TEK KAYNAK (K-18 eki)

     `DB.assets[].zimmetli` ve `[].durum` TÜRETİLMİŞ görünümdür; otorite
     zimmet defteridir (`DB.assignments`). Ekran bu iki alanı OKUR ama
     YAZMAZ; yazan tek yer `tazeleHepsi` ve zimmet yordamlarıdır.
     =================================================================== */
  var Varlik = {
    kayit:function(a){
      if(!a) return null;
      if(typeof a !== 'string') return a;
      if(!window.DB || !DB.assets) return null;
      return DB.assets.filter(function(x){ return x.kod === a; })[0] || null;
    },

    /* Bir demirbaşın YAŞAYAN zimmet kaydı — iade edilmemiş olan. */
    zimmetOf:function(demirbasKod){
      return ((window.DB && DB.assignments) || []).filter(function(z){
        /* K-33: `z.aktif !== false` kaldırıldı — tutanak kayıtlarında `durum`
           kanondur ('İade edildi'), `aktif` 7/7 kayıtta `true`ydu. */
        return z.demirbas === demirbasKod && z.durum !== 'İade edildi';
      })[0] || null;
    },

    /* Kabul edildi mi — envanteri "Zimmetli" yapan TEK koşul. */
    kabulEdildi:function(z){ return !!z && z.personelOnay === 'Onaylandı'; },

    /* Tek demirbaşın türetilmiş görünümü. Hurda ve Aktif (sarf/ortak
       kullanım) durumları zimmetten BAĞIMSIZDIR ve ezilmez. */
    tazele:function(a){
      a = Varlik.kayit(a);
      if(!a) return null;
      if(a.durum === 'Hurda') return { demirbas:a, zimmet:null, degisti:false };
      var z = Varlik.zimmetOf(a.kod);
      var eskiK = a.zimmetli, eskiD = a.durum;
      if(!z){
        a.zimmetli = null;
        if(a.durum !== 'Aktif') a.durum = 'Depoda';
      }else if(Varlik.kabulEdildi(z)){
        a.zimmetli = z.personel;
        a.durum = 'Zimmetli';
      }else{
        /* Tutanak yazıldı ama personel kabul etmedi. Cihaz ne depodadır
           ne de teslim edilmiştir — ara durum söylenir, yutulmaz. */
        a.zimmetli = null;
        a.durum = 'Zimmet bekliyor';
      }
      return { demirbas:a, zimmet:z,
               degisti:(eskiK !== a.zimmetli || eskiD !== a.durum),
               eskiZimmetli:eskiK, eskiDurum:eskiD };
    },

    /* Yükleme anında hepsi yeniden türetilir; elle yazılmış değer yaşamaz. */
    tazeleHepsi:function(){
      if(!window.DB || !DB.assets) return { olculen:0, degisen:[] };
      var degisen = [];
      DB.assets.forEach(function(a){
        var r = Varlik.tazele(a);
        if(r && r.degisti) degisen.push({ kod:a.kod, eskiDurum:r.eskiDurum, yeniDurum:a.durum,
                                          eskiZimmetli:r.eskiZimmetli, yeniZimmetli:a.zimmetli });
      });
      return { olculen:DB.assets.length, degisen:degisen };
    },

    /* Personelin üzerindeki demirbaşlar — çıkış akışı bunu sorar. */
    zimmetliler:function(personelKod){
      return ((window.DB && DB.assignments) || []).filter(function(z){
        return z.personel === personelKod && z.durum !== 'İade edildi';
      });
    },

    /* KABUL — envanteri değiştiren olay budur, tutanağın yazılması değil. */
    kabulEt:function(zimmetKod){
      if(!window.DB) return { ok:false, why:'veri yok' };
      var z = (DB.assignments || []).filter(function(x){ return x.kod === zimmetKod; })[0];
      if(!z) return { ok:false, why:'zimmet kaydı yok' };
      if(z.personelOnay === 'Onaylandı') return { ok:false, why:'zaten onaylanmış' };
      var me = (GV.session && GV.session.emp) || null;
      /* Kabul, zimmeti ÜSTLENEN kişinin işidir; İK ve yönetim de onaylayabilir
         (personel sistemde değilse tutanak elle işlenir). Geri alma kümesi
         AYNI — bkz. `kabulGeriAl`. */
      if(!(me === z.personel || can('personel') || can('duzenle')))
        return { ok:false, why:'yetki', roller:['zimmetli personel','ik','sahip','genelmudur'] };
      z.personelOnay = 'Onaylandı';
      z.onayTarihi = DB.today;
      var r = Varlik.tazele(z.demirbas);
      log(z.kod, 'Zimmet kabul edildi — envanter durumu türetildi (' +
          (r && r.demirbas ? r.demirbas.durum : '?') + ')', 'Bekliyor', 'Onaylandı', 'ok', 'i-check-circle');
      return { ok:true, zimmet:z, demirbas:r && r.demirbas };
    },

    /* KABUL GERİ ALMA — kapı KABULLE AYNI ağırlıkta. Bir kaydı onaylayan
       kullanıcı onu geri de alabilmelidir; geri almayı daha dar bir role
       bağlamak yanlış tarafa kapı koymaktır. Gerekçe yetki değil kayıt
       koşuludur. */
    kabulGeriAl:function(zimmetKod, gerekce){
      if(!window.DB) return { ok:false, why:'veri yok' };
      var z = (DB.assignments || []).filter(function(x){ return x.kod === zimmetKod; })[0];
      if(!z) return { ok:false, why:'zimmet kaydı yok' };
      if(z.personelOnay !== 'Onaylandı') return { ok:false, why:'zaten onaylanmamış' };
      var me = (GV.session && GV.session.emp) || null;
      if(!(me === z.personel || can('personel') || can('duzenle')))
        return { ok:false, why:'yetki', roller:['zimmetli personel','ik','sahip','genelmudur'] };
      if(!String(gerekce || '').trim())
        return { ok:false, why:'gerekce', mesaj:'Gerekçe zorunludur — kabul geri alma envanter durumunu değiştirir.' };
      z.personelOnay = 'Bekliyor';
      z.onayTarihi = null;
      var r = Varlik.tazele(z.demirbas);
      log(z.kod, 'Zimmet kabulü geri alındı — ' + String(gerekce).trim(),
          'Onaylandı', 'Bekliyor', 'warn', 'i-refresh');
      return { ok:true, zimmet:z, demirbas:r && r.demirbas };
    },

    /* DÜŞÜRÜLEN ZİMMET İDDİASI (K-30) — envanterin bir zamanlar söylediği
       ama defterin doğrulamadığı iddia. `null` dönmesi "iddia yoktu"
       demektir, "iddia vardı ama bilmiyoruz" değil. */
    dusenIddia:function(demirbasKod){
      return ((window.DB && DB.assetClaimDrops) || []).filter(function(d){
        return d.demirbas === demirbasKod; })[0] || null;
    },

    /* Zaman çizelgesine basılacak satır — sahte aktivite kaydı olarak
       veriye YAZILMAZ, defterden okunup görüntü anında türetilir. */
    dusenIddiaSatiri:function(demirbasKod){
      var d = Varlik.dusenIddia(demirbasKod);
      if(!d) return null;
      return {
        /* ⚠️ `i-alert-triangle` DEĞİL — o ad 113 sembollük sprite'ta yok ve
           boş bir `<use>` çizerdi. Sprite'ta duran ad `i-alert`tir. */
        kayit:d.demirbas, tarih:d.dusurulme, kisi:null, tone:'warn', icon:'i-alert',
        eski:d.iddiaDurum, yeni:'Depoda', turetilmis:true,
        metin:'Envanterdeki "' + d.iddiaPersonel + ' zimmetli" iddiası düşürüldü (' +
              d.karar + ') — ' + d.neden + '. İddianın kaynağı: ' + d.kaynak.join(' · ') +
              '. Eksik tutanak üretilmedi.'
      };
    }
  };

  GV.varlik = Varlik;
  GV.hr = Hr;

  /* Yükleme anında envanter zimmet defterinden yeniden türetilir — elle
     yazılmış `zimmetli`/`durum` hayatta kalmaz (`Fin.tazeleHepsi` ile aynı
     desen, domain.js:2429). Sonuç saklanır: ekran "kaç kayıt düzeltildi"
     diye sorabilsin ve çelişki sessizce kapanmasın. */
  if(window.DB && DB.assets) Varlik.sonTazeleme = Varlik.tazeleHepsi();
  GV.yenileme = Yenileme;

  /* ===================================================================
     PROJE — maliyet ve kârlılık (REVİZE 04)

     `DB.projects[].gerceklesenMaliyet` 14 kayıtta elle yazılı TEK bir
     rakamdı; hangi kalemden oluştuğu hiçbir yerde yazılı değildi ve
     `app-proje-detay.html` bunu iki ayrı sekmede "türetilmiş / örtüşmeyebilir"
     uyarısıyla itiraf ediyordu. Alan kaldırıldı; dört kalem ayrı ayrı
     türetilir ve toplamları gösterilir.

     KALEMLERİN KAYNAĞI — ve kaynağı olmayan kalem
     · personel   Σ(onaylı saat × iç maliyet), kadrolu personel
     · disKaynak  aynı hesap, hizmet sözleşmeli personel
     · satinAlma  Σ `DB.purchases[proje==kod && durum=='Tam Teslim']`
                  — talep aşamasındaki kayıt henüz maliyet değildir
     · diger      **KAYNAK YOK.** projeye bağlı ayrı bir gider koleksiyonu bilerek AÇILMADI
                  (talimat: "yeni finans modülü oluşturma"); projeye bağlı
                  başka gider koleksiyonu bu depoda yok. Sıfır döner ve
                  ekran bunun bir ölçüm değil KAYNAK boşluğu olduğunu söyler.

     `kapsam` bayrağı `GV.proje.sure`'dekiyle aynı işi yapar: zaman defteri
     projeyi kapsamıyorsa maliyet HESAPLANAMAZ; sıfır basmak, maliyeti
     olmayan bir proje göstermek olurdu.
     =================================================================== */
  Proje.maliyet = function(kod){
    var bos = { personel:0, disKaynak:0, satinAlma:0, diger:0, toplam:0,
                gelir:0, brutKar:0, karlilikYuzde:null, kapsam:false,
                maliyetsizPersonel:[], oranGuvenilmez:[] };
    if(!window.DB || !DB.projects) return bos;
    var p = DB.projects.filter(function(x){ return x.kod === kod; })[0];
    if(!p) return bos;
    var s = Proje.sure(kod);
    var onayli = (DB.timelogs || []).filter(function(l){
      return l.proje === kod && l.onay === 'Onaylandı'; });

    /* ADR-07 — her satır KENDİ TARİHİNİN oranıyla değerlenir. Eskiden
       burada `Hr.icMaliyet(l.personel)` çağrılıyordu ve tarih hiç geçmiyordu:
       2025 tarihli bir zaman kaydı 2026 maaşıyla fiyatlanıyordu. */
    var personel = 0, disKaynak = 0, eksik = [], guvenilmez = [];
    onayli.forEach(function(l){
      var m = Hr.kayitOrani(l);
      if(!m){ if(eksik.indexOf(l.personel) === -1) eksik.push(l.personel); return; }
      if(m.guvenilir === false && guvenilmez.indexOf(l.personel) === -1) guvenilmez.push(l.personel);
      var tutar = l.sure * m.saat;
      if(Hr.disKaynak(l.personel)) disKaynak += tutar; else personel += tutar;
    });

    var satinAlma = (DB.purchases || []).filter(function(x){
      return x.proje === kod && ['Tam Teslim','Kapandı'].indexOf(x.durum) !== -1; })
      .reduce(function(a, x){ return a + (x.tahminiMaliyet || 0); }, 0);

    personel = Math.round(personel); disKaynak = Math.round(disKaynak);
    var toplam = personel + disKaynak + satinAlma;
    var gelir  = p.sozlesmeTutari || 0;

    /* KAPSAM, `sure`dekinden bir adım DAHA DAR: maliyet için satır sayısı
       değil ÖLÇÜLEN maliyet gerekir. Onaylı saati de satın alması da olmayan
       projede kâr "%100" çıkardı — maliyeti sıfır sanmak, ölçülmemişi
       ölçülmüş göstermenin en pahalı hâli. O projede kârlılık HESAPLANMAZ. */
    var olculdu = s.gerceklesen > 0 || satinAlma > 0;
    return {
      personel:personel, disKaynak:disKaynak, satinAlma:satinAlma, diger:0,
      toplam:toplam, gelir:gelir,
      brutKar:olculdu ? gelir - toplam : null,
      karlilikYuzde:(olculdu && gelir) ? Math.round((gelir - toplam) / gelir * 100) : null,
      kapsam:olculdu, saat:s.gerceklesen, maliyetsizPersonel:eksik,
      /* ADR-07: bu personellerin o tarihteki maaşı bilinmiyor, bugünkü oran
         kullanıldı — ekran bunu söyleyebilsin diye ayrı liste. */
      oranGuvenilmez:guvenilmez
    };
  };

  /* ===================================================================
     PROJE KAPANIŞ KONTROLÜ (REVİZE 07)

     Dokümanın istediği sekiz kontrol tek yordamda toplanır; ekran yalnız
     basar. Ekranda yazılsaydı kapanış modalı ile kapanışın KENDİSİ farklı
     cevap verebilirdi — REVİZE 02'de görev geçişinin başına gelen buydu.

     Her madde şunu döndürür:
       { anahtar, etiket, gecti, sayi, detay, href, olculdu }
     `olculdu:false` ⇒ **kontrol yapılamadı**, "geçti" DEĞİL. Ölçülemeyen
     bir maddeyi yeşile yazmak, kapanışı olmayan bir güvenceyle onaylatmak
     olurdu (L-13 · L-25). Ekran onu ayrı tonla basar.

     ⚠️ DURUŞ DEĞİŞTİ — CLOUD TURU · ADR-04.
     Eskiden burada şu yazıyordu: "Kapanış ENGELLENMEZ: geçmeyen madde uyarır,
     kullanıcı gerekçe yazarak kapatır. Doküman 'kullanıcıya sade bir checklist
     göster' diyor, 'kapanışı kilitle' demiyor."

     Cloud şartnamesi [20.2.7] bunun tersini emrediyor: "Proje kapanış kontrol
     listesi tamamlanmadan projeyi tamamlamayı engelle." Faz 0 ölçümü bu
     duruşun tek madde değil SİSTEMİK olduğunu gösterdi — aynı "uyar ama
     engelleme" deseni teslimde, sözleşme aktivasyonunda ve bakım kotasında
     da tekrarlıyordu; dördü birlikte kapatıldı.

     Yeni kural:
       · ÖLÇÜLEBİLEN ve geçmeyen madde varsa kapanış REDDEDİLİR.
       · `sahip` / `gm` rolü neden kodu + açıklama ile geçebilir; istisna
         aktiviteye "YÖNETİCİ İSTİSNASI" olarak yazılır.
       · ÖLÇÜLEMEYEN madde (`olculdu:false`) kilit saymaz — veri yokluğunu
         ihlal saymak, kaydı hiç olmayan eski projeleri kapatılamaz yapardı —
         ama gerekçe ister.
     =================================================================== */
  var GOREV_ACIK = ['Tamamlandı', 'İptal edildi', 'Arşivlendi'];

  Proje.kapanisKontrol = function(kod){
    var p = Proje.kayit(kod);
    if(!p) return [];
    var K = p.kod;
    var t   = (DB.tasks || []).filter(function(x){ return x.proje === K; });
    var cr  = (DB.changeRequests || []).filter(function(x){ return x.proje === K; });
    var tsl = (DB.deliveries || []).filter(function(x){ return x.proje === K; });
    var dok = (DB.documents || []).filter(function(x){ return x.proje === K; });
    var fat = (DB.invoices || []).filter(function(x){ return x.proje === K; });
    var tak = (DB.milestones || []).filter(function(x){ return x.proje === K; });
    var pkt = (DB.supportPackages || []).filter(function(x){ return x.proje === K; });

    var acikGorev = t.filter(function(x){ return GOREV_ACIK.indexOf(x.durum) === -1; });
    var kontrolde = t.filter(function(x){ return x.durum === 'Kontrolde'; });
    /* Değişiklik sözlüğü de taşındı: onaydan sonra `Uygulama → Teslim → Kapandı`
       adımları var ve bunların hiçbiri "açık talep" değildir. */
    var CR_KARARLI = ['Onaylandı','Uygulama','Teslim','Kapandı','Reddedildi','İptal Edildi'];
    var acikCr    = cr.filter(function(x){ return CR_KARARLI.indexOf(x.durum) === -1; });
    /* ⚠️ CLOUD TURU DÜZELTMESİ — teslim sözlüğü taşındığında burası geride
       kaldı: `'Onaylandı'` artık teslim durumu DEĞİL (`Kabul` oldu). Kural
       sessizce her teslimi "onaylanmamış" sayıyor, dolayısıyla HER proje
       kapanışı yönetici istisnası istiyordu. Kapalı sayılan durumlar
       `DB.deliveryStatuses` ile birebir hizalı tutulur. */
    var TESLIM_BITTI = ['Kabul','Kısmi Kabul','Kapandı'];
    var acikTsl   = tsl.filter(function(x){ return TESLIM_BITTI.indexOf(x.durum) === -1; });
    var onaysiz   = tsl.filter(function(x){ return x.musteriOnay !== 'Onaylandı'; });
    var zorunlu   = ((DB.company || {}).zorunluProjeDokuman || []);
    var eksikDok  = zorunlu.filter(function(tur){
                      return !dok.some(function(d){ return d.tur === tur && d.onay === 'Onaylandı'; }); });
    var acikFat   = fat.filter(function(x){ return ['Ödendi','İptal'].indexOf(x.durum) === -1; });
    var acikTak   = tak.filter(function(x){ return x.odemeDurum !== 'Ödendi'; });

    return [
      { anahtar:'gorev', etiket:'Açık görev', olculdu:t.length > 0,
        gecti:acikGorev.length === 0, sayi:acikGorev.length,
        detay:t.length ? (acikGorev.length + ' / ' + t.length + ' görev açık')
                       : 'Bu projede görev kaydı yok — kontrol yapılamadı',
        href:'app-gorev.html?t=tumu&q=' + K },
      { anahtar:'kontrolde', etiket:'Kontrolde bekleyen görev', olculdu:t.length > 0,
        gecti:kontrolde.length === 0, sayi:kontrolde.length,
        detay:t.length ? (kontrolde.length + ' görev kontrolde')
                       : 'Bu projede görev kaydı yok — kontrol yapılamadı',
        href:'app-gorev.html?t=kontrolde&q=' + K },
      { anahtar:'revizyon', etiket:'Açık revizyon talebi', olculdu:cr.length > 0,
        gecti:acikCr.length === 0, sayi:acikCr.length,
        detay:cr.length ? (acikCr.length + ' / ' + cr.length + ' talep karara bağlanmadı')
                        : 'Bu projede revizyon talebi yok',
        href:'app-proje-detay.html?id=' + K + '#degisiklik' },
      { anahtar:'teslim', etiket:'Teslimatlar tamamlandı', olculdu:tsl.length > 0,
        gecti:acikTsl.length === 0, sayi:acikTsl.length,
        detay:tsl.length ? (acikTsl.length + ' / ' + tsl.length + ' teslim onaylanmadı')
                         : 'Bu projede teslim kaydı yok — kontrol yapılamadı',
        href:'app-proje-detay.html?id=' + K + '#teslim' },
      { anahtar:'musteriOnay', etiket:'Müşteri onayı alındı', olculdu:tsl.length > 0,
        gecti:onaysiz.length === 0, sayi:onaysiz.length,
        detay:tsl.length ? (onaysiz.length + ' teslimde müşteri onayı yok')
                         : 'Onay ölçülecek teslim kaydı yok — kontrol yapılamadı',
        href:'app-proje-detay.html?id=' + K + '#teslim' },
      { anahtar:'dokuman', etiket:'Zorunlu dokümanlar tam', olculdu:zorunlu.length > 0,
        gecti:eksikDok.length === 0, sayi:eksikDok.length,
        detay:eksikDok.length ? ('eksik: ' + eksikDok.join(' · '))
                              : zorunlu.length + ' zorunlu tür de onaylı',
        href:'app-proje-detay.html?id=' + K + '#belge' },
      { anahtar:'finans', etiket:'Açık finansal işlem', olculdu:(fat.length + tak.length) > 0,
        gecti:acikFat.length === 0 && acikTak.length === 0, sayi:acikFat.length + acikTak.length,
        detay:(fat.length + tak.length)
          ? (acikFat.length + ' fatura · ' + acikTak.length + ' taksit ödenmedi')
          : 'Bu projede fatura ve taksit kaydı yok — kontrol yapılamadı',
        href:'app-fatura.html?t=tumu&q=' + K },
      /* Sekizinci madde bir SORUDUR, bir kontrol değil — cevabı kapanış
         akışının son adımında kullanıcıdan alınır (REVİZE 08). Bugün proje
         ile bakım paketi arasında bağ yok, o yüzden `olculdu:false`. */
      { anahtar:'bakim', etiket:'Bakım / destek hizmeti başlayacak mı',
        olculdu:pkt.length > 0, gecti:pkt.length > 0, sayi:pkt.length,
        detay:pkt.length ? (pkt.length + ' bakım paketi bu projeye bağlı')
                         : 'Bu projeye bağlı bakım paketi yok — kapanışta sorulur',
        /* Bakım paketi ayrı ekran değildir (ADR-R2-13): müşteri detayının
           Destek sekmesinde yaşar. Eski `app-destek-paket.html` hedefi hiç
           doğmadı; kapanış kontrolünün sekizinci maddesi oraya gidiyordu. */
        href:p.musteri ? 'app-musteri-detay.html?id=' + p.musteri + '#destek' : null }
    ];
  };

  /* Kapanışın KENDİSİ — ADR-04 sonrası ENGELLEYİCİ.
     `opts = { neden, aciklama, istisna }`. Geriye uyum için ikinci argüman
     düz metin de olabilir (eski çağrı biçimi); o zaman açıklama sayılır. */
  Proje.kapat = function(kod, opts, tarih){
    if(typeof opts === 'string' || opts == null) opts = { aciklama:opts || '' };
    var p = Proje.kayit(kod);
    if(!p) return { ok:false, why:'kayıt yok' };
    if(Proje.kapali(p)) return { ok:false, why:'zaten kapalı', durum:p.durum };
    if(!can('duzenle')) return { ok:false, why:'yetki', roller:['pm','gm','sahip'] };

    var kontrol = Proje.kapanisKontrol(p.kod);
    var gecmeyen  = kontrol.filter(function(k){ return k.olculdu && !k.gecti; });
    var olculemez = kontrol.filter(function(k){ return !k.olculdu; });
    var rol = (GV.perm && GV.perm.role) ? GV.perm.role() : null;
    var istisnaRol = ['sahip','gm'].indexOf(rol) !== -1;

    /* ADR-04 · KAPI: ölçülebilen ve geçmeyen madde kapanışı REDDEDER.
       Yalnız sahip/gm neden kodu + açıklama ile geçebilir. */
    if(gecmeyen.length){
      if(!istisnaRol)
        return { ok:false, why:'kapali', roller:['sahip','gm'],
                 eksik:gecmeyen.map(function(k){ return k.etiket; }),
                 mesaj:'Kapanış kontrolünde geçmeyen ' + gecmeyen.length +
                       ' madde var. Bu maddeler tamamlanmadan proje kapatılamaz.' };
      if(!opts.istisna || !opts.neden || !String(opts.aciklama || '').trim())
        return { ok:false, why:'istisna', istisnaMumkun:true,
                 eksik:gecmeyen.map(function(k){ return k.etiket; }),
                 mesaj:'Yönetici istisnası için neden kodu ve açıklama zorunludur.' };
    }
    /* Ölçülemeyen madde kilit saymaz ama gerekçe ister */
    if(!gecmeyen.length && olculemez.length && !String(opts.aciklama || '').trim())
      return { ok:false, why:'gerekçe',
               eksik:olculemez.map(function(k){ return k.etiket; }),
               mesaj:'Kaydı olmadığı için ölçülemeyen ' + olculemez.length +
                     ' madde var — kapanış gerekçesi zorunlu.' };

    var gerekce = String(opts.aciklama || '');
    var gun = tarih || DB.today;
    var eski = p.durum;
    p.durum = 'Tamamlandı';
    p.gercekBitis = gun;
    p.ilerleme = 100;
    p.faz = null;              /* faz yürüyen işin nerede olduğunu söyler (REVİZE 05) */
    p.sonGuncelleme = gun;

    /* Aktivite ortak `log()` ile yazılır: kişi KOD olarak durur (VB-12) ve
       eski → yeni ekseni timeline'da görünür. Ekran ikinci bir kayıt yazmaz. */
    if(opts.neden){ p.sonNedenKodu = opts.neden; p.sonNedenAciklama = gerekce; }
    log(p.kod, (gecmeyen.length ? 'YÖNETİCİ İSTİSNASI — ' : '') +
        'Proje kapatıldı — gerçekleşen bitiş ' + gun +
        (gecmeyen.length
          ? ' · kapanış kontrolünde geçmeyen ' + gecmeyen.length + ' madde [' +
            opts.neden + '] gerekçesiyle geçildi: ' + gerekce
          : olculemez.length
            ? ' · ölçülemeyen ' + olculemez.length + ' madde gerekçeyle kapatıldı: ' + gerekce
            : ' · kapanış kontrolünün ölçülebilen maddelerinin tamamı geçti'),
        eski, 'Tamamlandı', gecmeyen.length ? 'warn' : 'ok', 'i-check-circle');
    return { ok:true, kod:p.kod, tarih:gun, gecmeyen:gecmeyen.length, istisna:!!gecmeyen.length };
  };

  /* ===================================================================
     KAPANIŞTAN BAKIM / DESTEĞE GEÇİŞ (REVİZE 08)

     Kapanış kontrolünün sekizinci maddesi bir SORUDUR: "bakım veya destek
     hizmeti başlayacak mı?". Cevabı burada yazılır. Bağ **pakette** durur
     (`DB.supportPackages[].proje`), projede ayna alan doğmaz (§9d).

     Turun başında proje ile paket arasında **hiçbir yönde bağ yoktu** ve
     veriden türetilemiyordu: tek dolaylı zincir (`paket.sozlesme →
     contract.proje`) hiçe çıkıyor. Tarih yakınlığı ve müşteri eşleşmesi
     bağ sayılmadı (L-13) — bağı kullanıcı kurar, kapanış anında.
     =================================================================== */
  Proje.bakimPaketleri = function(kod){
    var p = Proje.kayit(kod);
    if(!p || !window.DB || !DB.supportPackages) return [];
    return DB.supportPackages.filter(function(x){ return x.musteri === p.musteri; });
  };

  Proje.bakimBagla = function(projeKod, paketKod){
    var p = Proje.kayit(projeKod);
    if(!p) return { ok:false, why:'kayıt yok' };
    if(!can('duzenle')) return { ok:false, why:'yetki' };
    var pkt = (DB.supportPackages || []).filter(function(x){ return x.kod === paketKod; })[0];
    if(!pkt) return { ok:false, why:'paket yok' };
    if(pkt.musteri !== p.musteri)
      return { ok:false, why:'başka müşterinin paketi', musteri:pkt.musteri };
    if(pkt.proje === p.kod) return { ok:false, why:'zaten bağlı' };
    if(pkt.proje) return { ok:false, why:'paket başka projeye bağlı', proje:pkt.proje };
    pkt.proje = p.kod;
    log(pkt.kod, 'Bakım paketi projeye bağlandı', '', p.kod, 'ok', 'i-link');
    log(p.kod, 'Kapanışta bakım paketine bağlandı', '', pkt.kod, 'ok', 'i-link');
    return { ok:true, paket:pkt.kod };
  };

  /* Yeni paket — YENİ EKRAN AÇILMAZ, kapanış modalının son adımıdır.
     Kota aritmetiği sözleşmesi korunur: `kullanilan + kalan = aylikSaat × ay`
     (components.md §9). Tutar ve aylık saat KULLANICIDAN alınır; paket
     fiyat katalogu bu depoda yok, uydurulmaz (L-13). */
  Proje.bakimAc = function(projeKod, cfg){
    var p = Proje.kayit(projeKod);
    if(!p) return { ok:false, why:'kayıt yok' };
    if(!can('duzenle')) return { ok:false, why:'yetki' };
    cfg = cfg || {};
    var ay = parseInt(cfg.ay, 10) || 0;
    var saat = parseInt(cfg.aylikSaat, 10) || 0;
    var tutar = parseInt(cfg.tutar, 10) || 0;
    var eksik = [];
    if(!cfg.baslangic) eksik.push('Başlangıç tarihi');
    if((DB.supportPackageTypes || []).indexOf(cfg.tip) === -1) eksik.push('Paket tipi');
    if(ay <= 0) eksik.push('Süre (ay)');
    if(saat <= 0) eksik.push('Aylık saat');
    if(tutar <= 0) eksik.push('Paket bedeli');
    if(eksik.length) return { ok:false, why:'zorunlu', eksik:eksik };

    /* Bitiş = başlangıç + ay − 1 gün. `toISOString()` KULLANILMAZ: yerel
       saat diliminde kurulan tarihi UTC'ye çevirip bir gün geriye kaydırır
       (ölçüldü: 2026-08-01 + 12 ay → 2027-07-30 çıkıyordu, doğrusu 07-31).
       Tarih parçaları elle biçimlenir. */
    var d = new Date(cfg.baslangic + 'T00:00:00');
    d.setMonth(d.getMonth() + ay); d.setDate(d.getDate() - 1);
    var iki = function(n){ return (n < 10 ? '0' : '') + n; };
    var bitis = d.getFullYear() + '-' + iki(d.getMonth() + 1) + '-' + iki(d.getDate());

    var no = (DB.supportPackages || []).reduce(function(m, x){
      var n = parseInt(String(x.kod).replace(/\D/g, ''), 10) || 0;
      return n > m ? n : m; }, 0) + 1;
    /* Sözleşme projeden DEVRALINIR — ters yönden çözülür (`contracts.proje`). */
    var soz = (DB.contracts || []).filter(function(c){ return c.proje === p.kod; })[0];

    var pkt = {
      kod:'BKP-' + String(no).padStart(3, '0'),
      musteri:p.musteri, ad:cfg.tip,
      /* REVİZE 17 — yeni paket de tip/periyot/sorumlu taşır, yoksa şema
         kayıttan kayda değişir (VB-18 sınıfı). Periyot dönem uzunluğundan
         türetilir; sözlükte karşılığı yoksa `null` kalır, uydurulmaz.
         Sorumlu müşteri kartındaki sorumludur (R12 ile aynı eksen). */
      tip:'Bakım',
      periyot:({ 1:'Aylık', 3:'3 Aylık', 6:'6 Aylık', 12:'Yıllık' })[ay] || null,
      sorumlu:(function(){
        var m = (DB.customers || []).filter(function(c){ return c.kod === p.musteri; })[0];
        return m ? (m.sorumlu || null) : null;
      })(),
      baslangic:cfg.baslangic, bitis:bitis,
      aylikSaat:saat, kullanilan:0, kalan:saat * ay,
      tutar:tutar, durum:'Aktif',
      sozlesme:soz ? soz.kod : null,
      yenileme:false, yenilemeTarihi:null, aktif:true,
      proje:p.kod
    };
    (DB.supportPackages || []).push(pkt);
    log(pkt.kod, 'Paket proje kapanışında oluşturuldu', '', p.kod, 'ok', 'i-plus');
    log(p.kod, 'Kapanışta bakım paketi açıldı', '', pkt.kod, 'ok', 'i-link');
    return { ok:true, paket:pkt.kod, bitis:bitis, sozlesme:pkt.sozlesme };
  };

  /* ===================================================================
     GV.notes — KİŞİSEL NOT SERVİSİ (şartname §15 · ADR-13 · ADR-14)
     -------------------------------------------------------------------
     Bu servis diğer bütün `GV.*` yordamlarından BİR YÖNÜYLE AYRILIR:
     kapsamı `GV.perm` rol matrisinden gelmez. Rol matrisi "bu rol bu modülü
     görebilir mi" sorusunu cevaplar; kişisel notta soru bu değildir —
     **sahibi değilsen göremezsin, rolün ne olursa olsun.** `sahip` ve
     `sistem` dahil. Şartname [15.4.1] bunu böyle istiyor, ADR-13 de öyle
     karara bağladı.

     Bu yüzden burada TEK kapı var: `benim()`. Ekranlar `DB.personalNotes`e
     DOĞRUDAN dokunmaz; hepsi bu yordamdan geçer. İki ayrı süzgeç yolu
     açılırsa biri diğerinden sessizce ayrılır (ders L-40).

     ⚠️ PROTOTİP SINIRI: süzgeç istemcide. Konsolu açan biri koleksiyonu
     okur. Gerçek izolasyon sunucu tarafı `owner_user_id` kapsamıyla gelir
     ([15.4.1]–[15.4.3], backend payı) ve modül canlıya çıkmadan kapatılması
     zorunludur. Bu sınır EKRANDA söylenmez, burada ve raporda yazılıdır.
     =================================================================== */
  GV.notes = (function(){

    function oturum(){
      return (GV.session && GV.session.emp) || null;
    }

    /* Yumuşak silinmiş kayıt ADR-14 gereği 7 gün geri alınabilir; süresi
       dolan kayıt listelerde hiç görünmez ama veriden de silinmez —
       prototipte "kalıcı silme" yapan bir yordam yok, olmayan bir yeteneği
       varmış gibi göstermek yasak ([2.0.12]). */
    function cope(n){
      if(!n.silinme) return false;
      /* `Fmt` domain.js'te tanımlı DEĞİL; biçimleyici ui.js'te yaşıyor ve
         `GV.fmt` olarak dışa veriliyor. Gün farkı buradan okunur — ikinci bir
         tarih aritmetiği yazmak, iki farklı "bugün" tanımı doğururdu. */
      var gun = Math.abs((GV.fmt && GV.fmt.days ? GV.fmt.days(String(n.silinme).slice(0,10)) : 0) || 0);
      return gun <= (DB.noteTrashDays || 7);
    }

    /* TEK KAPI — sahibinin kayıtları. Oturum yoksa BOŞ döner: "oturum yoksa
       hepsini göster" yedeği, tam olarak kapatmaya çalıştığımız açıktır. */
    function benim(opts){
      opts = opts || {};
      var emp = oturum();
      if(!emp) return [];
      return (DB.personalNotes || []).filter(function(n){
        if(n.owner !== emp) return false;
        if(n.silinme) return opts.cop === true && cope(n);
        return opts.cop !== true;
      });
    }

    function bul(kod){
      var emp = oturum();
      if(!emp || !kod) return null;
      var n = (DB.personalNotes || []).filter(function(x){ return x.kod === kod; })[0];
      /* Başkasının notunun ID'si verildiğinde "yetkin yok" DEMEZ, "yok" der:
         hata mesajı bile kaydın VARLIĞINI sızdırmamalı ([15.5.1] · [15.4.3]). */
      if(!n || n.owner !== emp) return null;
      if(n.silinme && !cope(n)) return null;
      return n;
    }

    function maddeler(kod){
      var n = bul(kod);
      if(!n) return [];
      return (DB.personalNoteChecklistItems || []).filter(function(m){
        return m.not === kod && m.owner === n.owner;
      }).sort(function(a,b){ return (a.sira || 0) - (b.sira || 0); });
    }

    function yeniKod(list, onek){
      var max = 0;
      (list || []).forEach(function(x){
        var m = new RegExp('^' + onek + '-(\\d+)$').exec(x.kod || '');
        if(m) max = Math.max(max, +m[1]);
      });
      return onek + '-' + String(max + 1).padStart(3, '0');
    }

    function simdi(){ return DB.today + 'T' + new Date().toTimeString().slice(0,5); }

    /* [15.5.3] — SAHİPLİK OTURUMDAN ATANIR. Çağıran `owner` gönderirse
       SESSİZCE YOK SAYILIR; reddetmek yerine ezmek seçildi çünkü bu bir
       kullanıcı hatası değil, çağıranın hiç sormaması gereken bir alandır. */
    function olustur(v){
      var emp = oturum();
      if(!emp) return null;
      v = v || {};
      var n = {
        kod:yeniKod(DB.personalNotes, 'NOT'),
        owner:emp,
        baslik:v.baslik || v.title || '',
        body:v.body || '',
        durum:(DB.noteStatuses || []).indexOf(v.durum) !== -1 ? v.durum : 'Açık',
        oncelik:(DB.notePriorities || []).indexOf(v.oncelik) !== -1 ? v.oncelik : 'Orta',
        kategori:(DB.noteCategories || []).indexOf(v.kategori) !== -1 ? v.kategori : 'Kişisel',
        renk:(DB.noteColors || []).indexOf(v.renk) !== -1 ? v.renk : 'mavi',
        sabit:!!v.sabit,
        bitis:v.bitis || null, hatirlatma:v.hatirlatma || null,
        sira:benim().length + 1,
        olusturma:simdi(), guncelleme:simdi(),
        tamamlanma:null, arsivlenme:null, silinme:null
      };
      (DB.personalNotes || (DB.personalNotes = [])).unshift(n);
      /* ⚠️ AUDIT YAZILMAZ ([15.5.5] · ADR-13). Kurumsal defter kişisel not
         metnini taşımaz — olay metadata'sı bile kaydın varlığını başkasına
         duyurur. Bu, `GV.audit.yaz` çağrısının BİLEREK yokluğudur. */
      return n;
    }

    function guncelle(kod, v){
      var n = bul(kod);
      if(!n) return null;
      ['baslik','body','durum','oncelik','kategori','renk','sabit','bitis','hatirlatma'].forEach(function(k){
        if(v[k] !== undefined) n[k] = v[k];
      });
      n.owner = n.owner;                 /* sahiplik DEĞİŞMEZ ([15.3.1]) */
      n.guncelleme = simdi();
      if(n.durum === 'Tamamlandı' && !n.tamamlanma) n.tamamlanma = simdi();
      if(n.durum !== 'Tamamlandı') n.tamamlanma = null;      /* [15.5.4] geri alınca temizlenir */
      if(n.durum === 'Arşiv' && !n.arsivlenme) n.arsivlenme = simdi();
      if(n.durum !== 'Arşiv') n.arsivlenme = null;
      return n;
    }

    /* [15.5.4] — işaretlenince `isaretTarihi` yazılır, geri alınca temizlenir. */
    function madde(kodMadde, isaretli){
      var emp = oturum();
      if(!emp) return null;
      var m = (DB.personalNoteChecklistItems || []).filter(function(x){ return x.kod === kodMadde; })[0];
      if(!m || m.owner !== emp) return null;
      m.isaretli = !!isaretli;
      m.isaretTarihi = m.isaretli ? simdi() : null;
      return m;
    }

    function maddeEkle(kod, metin){
      var n = bul(kod);
      if(!n || !metin) return null;
      var m = { kod:yeniKod(DB.personalNoteChecklistItems, 'NKL'), not:n.kod,
                owner:n.owner, metin:metin, isaretli:false, isaretTarihi:null,
                sira:maddeler(kod).length + 1 };
      (DB.personalNoteChecklistItems || (DB.personalNoteChecklistItems = [])).push(m);
      return m;
    }

    /* ADR-14 — yumuşak silme. Geri alma süresi çağırana DÖNDÜRÜLÜR ki ekran
       kullanıcıya yazabilsin; süre kodun içinde saklı kalmaz. */
    function sil(kod){
      var n = bul(kod);
      if(!n) return null;
      n.silinme = simdi();
      return { kod:n.kod, gun:DB.noteTrashDays || 7 };
    }
    function geriAl(kod){
      var emp = oturum();
      var n = (DB.personalNotes || []).filter(function(x){ return x.kod === kod; })[0];
      if(!n || !emp || n.owner !== emp || !cope(n)) return null;
      n.silinme = null;
      n.guncelleme = simdi();
      return n;
    }

    /* Arama YALNIZ Notlarım içinde ve YALNIZ sahibinin kayıtlarında
       ([15.5.1] · ADR-13). Genel arama bu yordamı çağırmaz — çağırmadığı
       `tasks/qa/notes-isolation.js` N3 ekseniyle ölçülür. */
    function ara(q){
      q = String(q || '').toLocaleLowerCase('tr');
      if(!q) return benim();
      return benim().filter(function(n){
        return String(n.baslik || '').toLocaleLowerCase('tr').indexOf(q) !== -1 ||
               String(n.body || '').toLocaleLowerCase('tr').indexOf(q) !== -1;
      });
    }

    /* Görünümler — [15.1.x]: Tümü · Açık · Bugün · Yaklaşan · Tamamlanan · Arşiv */
    function gorunum(key){
      var list = benim();
      var bugun = DB.today;
      if(key === 'acik')      return list.filter(function(n){ return n.durum === 'Açık'; });
      if(key === 'bugun')     return list.filter(function(n){ return n.durum === 'Açık' && n.bitis === bugun; });
      if(key === 'yaklasan')  return list.filter(function(n){ return n.durum === 'Açık' && n.bitis && n.bitis > bugun; });
      if(key === 'gecikmis')  return list.filter(function(n){ return n.durum === 'Açık' && n.bitis && n.bitis < bugun; });
      if(key === 'tamam')     return list.filter(function(n){ return n.durum === 'Tamamlandı'; });
      if(key === 'arsiv')     return list.filter(function(n){ return n.durum === 'Arşiv'; });
      if(key === 'cop')       return benim({ cop:true });
      return list.filter(function(n){ return n.durum !== 'Arşiv'; });
    }

    return { benim:benim, bul:bul, maddeler:maddeler, olustur:olustur,
             guncelle:guncelle, madde:madde, maddeEkle:maddeEkle,
             sil:sil, geriAl:geriAl, ara:ara, gorunum:gorunum,
             sahip:oturum };
  })();


  /* ===================================================================
     GV.sales — SATIŞ DÖNÜŞÜM ZİNCİRİ (şartname §7 · [20.1] · paket P3-01)
     -------------------------------------------------------------------
     Üç ölçülmüş kusuru kapatır:

     1. **Mükerrer müşteri kontrolü yoktu** ([7.1.3] · [20.1.4]).
        `app-lead-detay.html` koşulsuz yeni `MUS-` üretiyordu; aynı firma iki
        adaydan iki müşteri kaydı doğuruyordu. Artık dönüşüm önce ARAR.

     2. **"Kazanıldı" sonrası hiçbir şey olmuyordu** ([7.3.6]). Teklif
        kazanılınca müşteri, sözleşme taslağı, ödeme planı taslağı ve proje
        taslağı doğmalı.

     3. **Aynı dönüşüm iki kez çalıştırılınca ikinci müşteri doğuyordu**
        ([20.1.8]). Zincir artık idempotent: var olan bağ bulunursa yeniden
        üretmez, "zaten var" der.

     ⚠️ PROTOTİPTE TRANSACTION YOK. Zincirin ortasında hata çıkarsa yarım
     kayıt kümesi kalırdı; bu yüzden üretilen her kayıt `uretilenler`
     listesine yazılır ve hata hâlinde HEPSİ geri alınır. Yarım bırakmak,
     kullanıcıya "sözleşme oluştu" deyip ortada sözleşme olmaması demekti.
     =================================================================== */
  GV.sales = (function(){

    function norm(s){
      return String(s == null ? '' : s).toLocaleLowerCase('tr')
        .replace(/\b(ltd|a\.?ş|şti|san|tic|inc|llc|gmbh)\b\.?/g, '')
        .replace(/[^\p{L}\p{N}]+/gu, '').trim();
    }
    function alanAdi(mail){
      var m = /@([^@\s]+)$/.exec(String(mail || '').trim());
      return m ? m[1].toLocaleLowerCase('tr') : '';
    }
    function telNorm(t){ return String(t || '').replace(/\D/g, '').slice(-10); }

    /* MÜKERRER ARAMA — beş eksen ([7.1.3]): vergi no · unvan · e-posta ·
       telefon · alan adı. Her eşleşme GEREKÇESİYLE döner; ekran kullanıcıya
       "neden mükerrer sanıyorum" diyebilsin. Vergi no tek başına kesin
       kanıttır, diğerleri işarettir — bu ayrım `kesin` bayrağıyla taşınır. */
    /* Tarama gövdesi TEK yerdedir; iki koleksiyon (R1 `DB.customers`,
       R2 `DB.accounts`) aynı beş ekseni kullanır. İkinci bir kopya yazmak,
       kapatmaya çalıştığımız hatanın kendisi olurdu (L-40). */
    function tara(aday, liste){
      aday = aday || {};
      var vNo    = String(aday.vergiNo || '').replace(/\D/g, '');
      var unvanN = norm(aday.unvan || aday.firma);
      var posta  = String(aday.eposta || '').toLocaleLowerCase('tr').trim();
      var alan   = alanAdi(aday.eposta) || String(aday.web || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLocaleLowerCase('tr');
      var tel    = telNorm(aday.tel);
      /* Çağıran `hariç` de yazabilir `haric` de — ilk yazımda alan adı
         Türkçe karakterliydi ve dışarıdan çağıran onu ıskalıyordu. */
      var haric  = aday.hariç || aday.haric || null;
      var out = [];

      (liste || []).forEach(function(c){
        if(haric && c.kod === haric) return;
        var nedenler = [], kesin = false;
        if(vNo && String(c.vergiNo || '').replace(/\D/g, '') === vNo){ nedenler.push('aynı vergi numarası'); kesin = true; }
        if(unvanN && (norm(c.unvan) === unvanN || norm(c.kisa) === unvanN)) nedenler.push('aynı unvan');
        if(posta && String(c.eposta || '').toLocaleLowerCase('tr').trim() === posta) nedenler.push('aynı e-posta');
        if(tel && telNorm(c.tel) === tel) nedenler.push('aynı telefon');
        if(alan && alanAdi(c.eposta) === alan) nedenler.push('aynı e-posta alan adı');
        if(nedenler.length) out.push({ kayit:c, nedenler:nedenler, kesin:kesin });
      });
      /* Kesin eşleşme önce; sonra en çok işaret taşıyan. */
      return out.sort(function(a, b){
        if(a.kesin !== b.kesin) return a.kesin ? -1 : 1;
        return b.nedenler.length - a.nedenler.length;
      });
    }

    function mukerrer(aday){
      return tara(aday, DB.customers).map(function(x){
        return { musteri:x.kayit, nedenler:x.nedenler, kesin:x.kesin };
      });
    }

    /* R2 EKSENİ — §5.3 son paragrafı: "Mükerrer kontrolü vergi numarası,
       normalize telefon, e-posta ve unvan benzerliği üzerinden yapılmalı;
       OTOMATİK BİRLEŞTİRME yerine kullanıcıya EŞLEŞME ÖNERİSİ verilmelidir."

       Bu yordam öneri üretir, birleştirme YAPMAZ. Kaynak `DB.accounts`tır:
       R2'de aday ve müşteri aynı defterde yaşar, `DB.customers` üzerinden
       taramak sekiz aday kaynaklı hesabı görmezden gelirdi. */
    function hesapMukerrer(aday){
      return tara(aday, DB.accounts).map(function(x){
        return { hesap:x.kayit, nedenler:x.nedenler, kesin:x.kesin };
      });
    }

    function yeniKod(list, onek, basamak){
      var yil = String(DB.today).slice(0, 4);
      var max = 0;
      (list || []).forEach(function(x){
        var m = new RegExp('^' + onek + '-' + yil + '-(\\d+)$').exec(x.kod || '');
        if(m) max = Math.max(max, +m[1]);
      });
      return onek + '-' + yil + '-' + String(max + 1).padStart(basamak || 3, '0');
    }
    function simdi(){ return DB.today + 'T' + new Date().toTimeString().slice(0, 5); }
    function iz(kayit, metin, eski, yeni, ton, ikon){
      (DB.activities || []).unshift({ kayit:kayit, tarih:simdi(), kisi:(GV.session || {}).emp,
        metin:metin, eski:eski == null ? null : eski, yeni:yeni == null ? null : yeni,
        tone:ton || 'ok', icon:ikon || 'i-plus' });
    }

    /* MÜŞTERİ ÜRETİMİ — üç yol ([20.1.4]): yeni · mevcuda bağla · yönetici
       istisnasıyla yine de yeni. Karar EKRANDA verilir, burada UYGULANIR;
       servis kendi başına "muhtemelen aynıdır" diye birleştirme yapmaz. */
    function musteriUret(kaynak, opts){
      opts = opts || {};
      if(opts.mevcut){
        var m = (DB.customers || []).filter(function(c){ return c.kod === opts.mevcut; })[0];
        if(!m) return { ok:false, why:'musteri-yok' };
        return { ok:true, musteri:m, yeni:false };
      }
      var kod = yeniKod(DB.customers, 'MUS');
      var yeniM = {
        kod:kod, unvan:kaynak.firma || kaynak.unvan, kisa:kaynak.firma || kaynak.unvan,
        sektor:kaynak.sektor || null, buyukluk:kaynak.buyukluk || null,
        /* ⚠️ `durum` YAZILMIYOR (K-21): yaşam evresi `DB.accounts[].evre`
           üzerinde yaşar. Bu yordam R1 zinciridir ve R2'de çağrılmaz;
           bayat alana yazmaya devam etseydi tuzağı da tetiklerdi. */
        risk:'Düşük', sorumlu:kaynak.sorumlu || null,
        kaynak:kaynak.kaynak || null, referans:kaynak.referans || null,
        tel:kaynak.tel || null, eposta:kaynak.eposta || null, web:kaynak.web || null,
        adres:null, vergiNo:kaynak.vergiNo || null, vergiDairesi:null,
        ilkKayit:DB.today, sonIletisim:kaynak.sonIletisim || DB.today,
        sonrakiAksiyon:'Sözleşme görüşmesi', sonrakiTarih:kaynak.kapanisTahmini || null,
        /* Türetilen sayaçlar SIFIR doğar, elle doldurulmaz (ders L-08). */
        projeSayisi:0, aktifProje:0, toplamCiro:0, bekleyenTahsilat:0, memnuniyet:null,
        aktif:true
      };
      (DB.customers || []).unshift(yeniM);
      iz(kod, 'Müşteri kaydı oluşturuldu' + (kaynak.kod ? ' (' + kaynak.kod + ' kaynağından)' : ''), null, kod, 'ok', 'i-plus');
      if(opts.istisna){
        iz(kod, 'YÖNETİCİ İSTİSNASI — mükerrer uyarısına rağmen yeni müşteri açıldı',
           (opts.benzer || []).join(' · '), opts.neden || 'DIGER', 'warn', 'i-alert');
      }
      return { ok:true, musteri:yeniM, yeni:true, istisna:!!opts.istisna };
    }

    /* ---- KAZANILDI ZİNCİRİ ([7.3.6] · [20.1.5]–[20.1.8]) --------------
       Sıra: müşteri → sözleşme (Taslak) → ödeme planı (taslak taksitler) →
       proje (Taslak). Her adım bir öncekinin kodunu taşır; hiçbir adım
       "sonra bağlarız" diye boş bırakılmaz (ders L-22).
       İDEMPOTENT: teklifte zaten sözleşme varsa zincir yeniden koşmaz. */
    function kazanildi(teklif, opts){
      opts = opts || {};
      if(!teklif) return { ok:false, why:'teklif-yok' };

      var varOlan = (DB.contracts || []).filter(function(c){ return c.teklif === teklif.kod; })[0];
      if(varOlan) return { ok:true, tekrar:true, sozlesme:varOlan.kod,
                           proje:(DB.projects || []).filter(function(p){ return p.sozlesme === varOlan.kod; })[0] };

      var uretilen = [];      /* geri alma defteri — prototipte transaction yok */
      function geriAl(){
        uretilen.slice().reverse().forEach(function(u){
          var i = u.list.indexOf(u.kayit);
          if(i !== -1) u.list.splice(i, 1);
        });
        (DB.activities || []).splice(0, (DB.activities || []).filter(function(a){
          return uretilen.some(function(u){ return u.kayit.kod === a.kayit; }); }).length);
      }
      function ekle(list, kayit){ list.unshift(kayit); uretilen.push({ list:list, kayit:kayit }); return kayit; }

      try {
        /* 1 — müşteri */
        var mr = musteriUret({
          kod:teklif.kod, firma:teklif.firma, sektor:teklif.sektor,
          sorumlu:teklif.hazirlayan, eposta:teklif.eposta, tel:teklif.tel
        }, opts.musteri || (teklif.musteri ? { mevcut:teklif.musteri } : {}));
        if(!mr.ok) return { ok:false, why:mr.why };
        var mus = mr.musteri;
        if(mr.yeni) uretilen.push({ list:DB.customers, kayit:mus });
        if(!teklif.musteri) teklif.musteri = mus.kod;

        /* 2 — sözleşme TASLAK. Aktivasyon KAPISI burada çalışmaz: sözleşme
           imza ve dengeli ödeme planı olmadan `Aktif` olamaz (Gates.sozlesmeAktif).
           Taslak üretmek o kapıyı atlatmaz, ona hazırlık yapar. */
        var szl = ekle(DB.contracts || (DB.contracts = []), {
          kod:yeniKod(DB.contracts, 'SZL'),
          ad:(teklif.baslik || teklif.firma) + ' sözleşmesi',
          musteri:mus.kod, teklif:teklif.kod, tur:'Proje',
          /* ⚠️ ALAN ADI EKSENİ — iki koleksiyon aynı şeye başka ad veriyor:
             `DB.quotes` KDV oranını `vergiOran`, `DB.contracts` `kdvOran`
             diyor. İlk yazımda burada yalnız `kdvOran` okunuyordu; teklifte
             o ad olmadığı için sessizce **20'ye düşüyordu** ve bugün dört
             teklifin dördü de %20 olduğu için sayı tutuyordu — yani kusur
             veri sayesinde görünmüyordu. %10'luk bir teklif sessizce %20
             KDV'li sözleşme doğururdu (L-31 sınıfı: uygulanmayan kural,
             yanlış kuralın en sinsi hâli). İki ad da okunur, düşüş YOK. */
          tutar:teklif.araToplam != null ? teklif.araToplam : teklif.tutar,
          kdvOran:teklif.vergiOran != null ? teklif.vergiOran
                : teklif.kdvOran  != null ? teklif.kdvOran : null,
          doviz:teklif.doviz || 'TRY',
          musteriAd:mus.kisa || mus.unvan || null,
          imzaTarihi:null, baslangic:null, bitis:null,
          durum:'Taslak', odemePlani:teklif.odemePlani || 'Taksitli',
          garanti:teklif.garanti || null, yenileme:false,
          sorumlu:teklif.hazirlayan || null, aktif:true
        });
        /* KDV ve genel toplam TÜRETİLİR, elle yazılmaz (L-08). Oran
           bilinmiyorsa ikisi de `null` kalır — "0 KDV" yazmak, vergisiz bir
           sözleşme iddiasıdır. */
        szl.kdv    = szl.kdvOran == null ? null : Math.round((Number(szl.tutar) || 0) * szl.kdvOran / 100);
        szl.toplam = szl.kdv == null ? null : (Number(szl.tutar) || 0) + szl.kdv;
        iz(szl.kod, 'Kazanılan tekliften sözleşme taslağı oluşturuldu', teklif.kod, szl.kod, 'ok', 'i-file-check');

        /* 3 — ödeme planı taslağı. Tutar sözleşme bedelinden gelir ve
           taksitler bedeli TAM böler: `Gates.sozlesmeAktif` denge arıyor,
           yuvarlama farkı bırakmak kapıyı baştan kapatırdı. */
        var net = Number(szl.tutar) || 0;
        var adet = opts.taksit || 3;
        var pay = Math.floor(net / adet);
        var kalan = net - pay * (adet - 1);
        for(var i = 0; i < adet; i++){
          var ms = ekle(DB.milestones || (DB.milestones = []), {
            kod:yeniKod(DB.milestones, 'MS'),
            sozlesme:szl.kod, proje:null,
            ad:(i + 1) + '. taksit', sira:i + 1,
            odeme:(i === adet - 1 ? kalan : pay),
            tarih:null, durum:'Planlandı', fatura:null, aktif:true
          });
          uretilen.push({ list:DB.milestones, kayit:ms });
        }
        iz(szl.kod, 'Ödeme planı taslağı oluşturuldu — ' + adet + ' taksit', null, String(net), 'accent', 'i-milestone');

        /* 4 — proje TASLAK */
        /* Alan adları `DB.projects` şemasından alındı; uydurma alan açılmaz.
           `DB.quotes`'ta `baslik`/`hizmet` YOK — sözleşme adı firmadan türer,
           tür `null` kalır ve bu bir eksiklik olarak kayda geçer (veri
           uydurulmadı, L-13). Bütçe de `null`: proje bütçesi sözleşme
           bedeliyle aynı şey değildir, planlama aşamasında girilir. */
        var prj = ekle(DB.projects || (DB.projects = []), {
          kod:yeniKod(DB.projects, 'PRJ'),
          ad:(teklif.firma || mus.kisa || mus.unvan) + ' projesi',
          musteri:mus.kod, musteriAd:mus.kisa || mus.unvan || null,
          sozlesme:szl.kod, teklif:teklif.kod,
          pm:teklif.hazirlayan || null, ekip:[],
          durum:'Taslak', saglik:'Yolunda', faz:'Plan',
          baslangic:null, planlananBitis:null, gercekBitis:null, ilerleme:0,
          sozlesmeTutari:net, butce:null, tahminiSure:null,
          kaynak:'Müşteri Sözleşmesi', tur:null, oncelik:'Orta',
          aktif:true
        });
        iz(prj.kod, 'Sözleşme taslağından proje taslağı oluşturuldu', szl.kod, prj.kod, 'ok', 'i-briefcase');
        (DB.milestones || []).forEach(function(m){ if(m.sozlesme === szl.kod) m.proje = prj.kod; });

        iz(teklif.kod, 'Teklif kazanıldı — dönüşüm zinciri koştu',
           null, [mus.kod, szl.kod, prj.kod].join(' · '), 'ok', 'i-check-circle');

        return { ok:true, musteri:mus.kod, musteriYeni:mr.yeni, sozlesme:szl.kod,
                 proje:prj.kod, taksit:adet,
                 uretilen:[
                   { tur:'Müşteri',      kod:mus.kod, yeni:mr.yeni, href:'app-musteri-detay.html?id=' + mus.kod },
                   /* K-28 — sözleşme ve ödeme planı AYRI EKRAN DEĞİLDİR
                      (rota 5.x GÖMÜLÜYOR): müşteri detayının Finans
                      sekmesinde yaşarlar. `app-sozlesme-detay.html` ve
                      `app-odemeplani-detay.html` hiç doğmadı ve doğmayacak;
                      üretilen kaydı oraya göndermek, kullanıcıyı kabuğun
                      kilitlediği bir bağlantıya yollamaktı. */
                   { tur:'Sözleşme',     kod:szl.kod, yeni:true,
                     href:'app-musteri-detay.html?id=' + mus.kod + '#finans' },
                   { tur:'Ödeme planı',  kod:szl.kod, yeni:true,
                     href:'app-musteri-detay.html?id=' + mus.kod + '#finans' },
                   { tur:'Proje',        kod:prj.kod, yeni:true,    href:'app-proje-detay.html?id=' + prj.kod }
                 ] };
      } catch(e){
        geriAl();
        return { ok:false, why:'zincir-hatasi', mesaj:String(e && e.message || e) };
      }
    }

    /* ---- FIRSAT KAZANMA — R2 ZİNCİRİ (şartname §5.3) -----------------
       R1 zinciri (`kazanildi`, yukarıda) YENİ BİR `MUS-` KAYDI ÜRETİR.
       §5.3 adım 3 bunu açıkça yasaklıyor: "Aynı müşteri hesabının yaşam
       evresi Müşteri yapılır; YENİ MÜŞTERİ KOPYASI OLUŞTURULMAZ."
       Bu yüzden R2'de kazanma zinciri kopya üretmez, evre ilerletir.

       Beş adım, şartnamedeki sırayla:
         1. Fırsatta "Kazanıldı" seçilir      → GV.flow.gec('opportunity', …)
         2. Zorunlu müşteri bilgileri kontrol → Gates.firsatKazanma (motorda)
         3. Aynı hesabın evresi MUSTERI olur  → GV.lifecycle.gec(…)
         4. Teklif/sözleşme/proje seçenekleri → `oneriler` dizisi
         5. Dönüşüm denetim izine yazılır     → GV.audit.yaz

       ⚠️ PROTOTİPTE TRANSACTION YOK. 1. adım geçtikten sonra 3. adım
       düşerse fırsat kazanılmış, hesap aday kalmış olurdu — kullanıcıya
       "kazandın" deyip ortada müşteri olmaması, bu depodaki UID-27 sınıfının
       tam tarifi. Bu yüzden aşama GERİ ALINIR ve geri alma denetim izine
       ayrıca yazılır (sessiz geri alma, olmamış gibi göstermek olurdu). */
    function firsatKazan(firsatKod, opts){
      opts = opts || {};
      if(!window.DB) return { ok:false, why:'veri' };
      var o = (DB.opportunities || []).filter(function(x){ return x.kod === firsatKod; })[0];
      if(!o) return { ok:false, why:'firsat', mesaj:'Fırsat kaydı bulunamadı: ' + firsatKod };

      var h = GV.lifecycle.hesap(o.hesap);
      if(!h) return { ok:false, why:'hesap',
                      mesaj:'Fırsatın bağlı olduğu hesap bulunamadı (' + (o.hesap || '—') + ').' };

      /* 1 + 2 — motor ve kapı. Kapı `Gates.firsatKazanma`, tablo firsat.js'te. */
      var g = Flow.gec('opportunity', o.kod, 'Kazanıldı', null,
                       { neden:opts.neden, not:opts.not, istisna:opts.istisna });
      if(!g.ok) return { ok:false, why:'akis', akis:g,
                         mesaj:g.mesaj || g.why, eksik:g.eksik, roller:g.roller,
                         istisnaMumkun:g.istisnaMumkun };

      /* 3 — AYNI kaydın evresi. Yeni müşteri kopyası ÜRETİLMEZ. */
      var evreDegisti = false, evreSonuc = null;
      if(h.evre !== 'MUSTERI'){
        evreSonuc = GV.lifecycle.gec(h.kod, 'MUSTERI',
                     { neden:opts.neden, not:'fırsat kazanıldı — ' + o.kod });
        if(!evreSonuc.ok){
          /* GERİ ALMA — yarım sonuç bırakılmaz */
          o.asama = g.eski;
          Audit.yaz({ kayit:o.kod, modul:'Satış',
            islem:'Kazanma geri alındı — hesabın evresi ilerletilemedi: ' +
                  (evreSonuc.mesaj || evreSonuc.why),
            eski:'Kazanıldı', yeni:g.eski, tone:'danger', icon:'i-refresh' });
          return { ok:false, why:'evre', mesaj:evreSonuc.mesaj || evreSonuc.why,
                   eksik:evreSonuc.eksik, roller:evreSonuc.roller, geriAlindi:true };
        }
        evreDegisti = true;
      }

      /* 5 — dönüşüm olayı: iki kaydı BİRBİRİNE bağlayan tek satır.
         `GV.flow` ve `GV.lifecycle` kendi kayıtlarını zaten yazdı; bu satır
         onları tek olay olarak ilişkilendirir (§5.3 adım 5). */
      Audit.yaz({ kayit:h.kod, modul:'Satış',
        islem:'Fırsat kazanıldı — ' + o.kod + ' (' + (o.baslik || '') + ')' +
              (evreDegisti ? ' · hesap Müşteri evresine alındı' : ' · hesap zaten Müşteri evresindeydi'),
        eski:g.eski, yeni:'Kazanıldı', tone:'ok', icon:'i-check-circle' });

      /* 4 — seçenekler. Var olan teklif bulunursa ONA gidilir; yoksa
         oluşturma bağlantısı verilir. Hedef ekran yayında değilse kabuk
         `markWip` ile kilitler — burada tahmin yapılmaz. */
      var teklifler = DB.opportunityQuotes ? DB.opportunityQuotes(o.kod) : [];
      var oneriler = [];
      if(teklifler.length){
        oneriler.push({ tur:'Teklif', kod:teklifler[0].kod, yeni:false,
          label:'Teklifi aç — ' + teklifler[0].kod,
          href:'app-teklif-detay.html?id=' + teklifler[0].kod });
      }else{
        oneriler.push({ tur:'Teklif', kod:null, yeni:true, label:'Teklif oluştur',
          href:'app-teklif-form.html?firsat=' + o.kod });
      }
      /* K-28 — sözleşme OLUŞTURMA yüzeyi de ayrı ekran değildir; müşteri
         detayının Finans sekmesine gider. Etiket "oluştur" değil "aç":
         yapılamayan bir işi düğme olarak vaat etmemek için, sekme sözleşme
         oluşturma yüzeyini taşıyana kadar bağlantı kaydı AÇAR. */
      oneriler.push({ tur:'Sözleşme', kod:null, yeni:false, label:'Finans sekmesini aç — sözleşme',
        href:'app-musteri-detay.html?id=' + h.kod + '#finans' });
      oneriler.push({ tur:'Proje', kod:null, yeni:true, label:'Proje oluştur',
        href:'app-proje-form.html?hesap=' + h.kod });

      return { ok:true, firsat:o, hesap:h, eskiAsama:g.eski,
               evreDegisti:evreDegisti, evre:evreSonuc, oneriler:oneriler };
    }

    return { mukerrer:mukerrer, hesapMukerrer:hesapMukerrer,
             musteriUret:musteriUret, kazanildi:kazanildi, firsatKazan:firsatKazan };
  })();


  /* ===================================================================
     GV.test — TEST VARLIK MODELİ ([9.1.1] · [9.1.4] · paket P3-03)
     -------------------------------------------------------------------
     Sayaç artık VERİDEN TÜRETİLİR, kayıttan okunmaz — ama yalnız senaryo
     dökümü OLAN koşumlarda. Eski beş kayıt `senaryoDetayi:false` taşıyor:
     onların üç sayısı korunur ve `turetilmis:false` ile işaretlenir.
     Sessizce "0 senaryo" demek, koşulmuş 62 senaryoyu yok saymak olurdu
     (ders L-13: karşılığı olmayan veri "yok" diye yazılır, uydurulmaz).
     =================================================================== */
  /* ===================================================================
     GV.teklif — TEKLİF SÜRÜMLEME (K-17 · ADR-R2-17)
     -------------------------------------------------------------------
     R1'de üç tur boyunca SAHTE kaldı: ekranlarda "revizyon" yazıyordu ama
     revizyon yeni kayıt üretmiyor, `versiyon` alanı elle artırılıyor ve eski
     içerik ÜZERİNE yazılıyordu. Yani "sürüm 3" diyen bir teklifin 1. ve 2.
     sürümü hiçbir yerde yoktu — sayaç bir şey ANLATIYOR ama karşılığı yok.
     `tasks/riskler-ve-kapsam.md` K-17 bunu borç olarak taşıyordu.

     ÜÇ HÜKÜM, üçü de ölçülebilir:
       1. Revizyon YENİ KAYIT üretir (`revizyonAc`) — eski kayıt değişmez.
       2. Eski sürüm KİLİTLENİR — `Gates.teklifSurumKilidi` + motor kilidi.
          Kilit bir alan değil, zincirden türetilir: ardılı olan kilitlidir.
       3. İki sürüm KARŞILAŞTIRILABİLİR (`fark`) — alanlar ve kalemler.

     ZİNCİR İKİ ALANLA KURULUR, üçüncüsü türetilir:
       `kokTeklif`    — zincirin ilk kaydının kodu (tüm sürümlerde aynı)
       `oncekiSurum`  — bir önceki sürümün kodu (ilk sürümde null)
       `versiyon`     — zincirdeki sıra; YAZILIR ama otoriter değildir,
                        `sira()` onu zincirden doğrular.

     ⚠️ MEVCUT VERİ: 8 teklifin hiçbirinde zincir alanı yok ve dördü
     `versiyon` > 1 taşıyor (2 · 3 · 2 · 2). Bu sayılar R1'den DEVRALINDI ve
     karşılığı olan kayıt YOK. Uydurup geçmiş sürüm ÜRETMİYORUZ (L-13):
     `devralinan` bayrağı bunu söyler ve ekran "önceki sürümlerin kaydı
     kaynak veride yok" diye yazar.
     =================================================================== */
  GV.teklif = (function(){

    function kayit(x){
      if(!x) return null;
      if(typeof x !== 'string') return x;
      return (window.DB && DB.quotes || []).filter(function(q){ return q.kod === x; })[0] || null;
    }

    /* Zincirin kökü. Alan yoksa kayıt kendi köküdür. */
    function kok(x){
      var q = kayit(x);
      return q ? (q.kokTeklif || q.kod) : null;
    }

    /* Bir teklifin TÜM sürümleri, eskiden yeniye. Zincir alanı olmayan
       (devralınmış) kayıt yalnız kendini döndürür — geçmiş uydurulmaz. */
    function surumler(x){
      var k = kok(x);
      if(!k || !window.DB || !DB.quotes) return [];
      return DB.quotes.filter(function(q){ return (q.kokTeklif || q.kod) === k; })
        .sort(function(a, b){ return (a.versiyon || 1) - (b.versiyon || 1); });
    }

    function sonSurum(x){
      var s = surumler(x);
      return s.length ? s[s.length - 1] : null;
    }

    /* Kilitli mi — `Gates` ile AYNI yordamı çağırır, ikinci bir tanım yok. */
    function kilitli(x){
      var q = kayit(x);
      if(!q) return null;
      var g = Gates.teklifSurumKilidi(q);
      return g.ok ? null : g;
    }

    /* Sayaç ile zincir çelişiyor mu — `versiyon` alanı devralınmış olabilir.
       Ekran bu ayrımı KULLANMAK zorundadır: iki farklı güvenilirlikteki
       sayıyı aynı biçimde basmak yanlış beyandır (GV.test ile aynı disiplin). */
    function zincir(x){
      var s = surumler(x);
      var q = kayit(x);
      if(!q) return null;
      var devralinan = s.length === 1 && (q.versiyon || 1) > 1;
      return {
        kok:kok(q), surum:s, adet:s.length,
        sira:s.indexOf(q) + 1,
        guncel:s.length ? s[s.length - 1].kod : q.kod,
        sonuncuMu:s.length ? s[s.length - 1].kod === q.kod : true,
        kilit:kilitli(q),
        /* R1'den gelen sayaç: kayıtları olmayan sürüm iddiası */
        devralinan:devralinan,
        devralinanSayi:devralinan ? (q.versiyon || 1) : 0
      };
    }

    /* Revizyon açılabilir mi — kapı REDDEDER, uyarıp geçmez.
       Terminal ve kilitli kayıtta revizyon YOKTUR. */
    function revizyonIzni(x){
      var q = kayit(x);
      if(!q) return { ok:false, why:'kayit', mesaj:'Teklif kaydı bulunamadı.' };
      var kl = kilitli(q);
      if(kl) return { ok:false, why:'kilit', mesaj:kl.why, ardil:kl.ardil };
      var kural = (window.DB && DB.transitions && DB.transitions.quote &&
                   DB.transitions.quote[q.durum]) || {};
      if(kural.terminal)
        return { ok:false, why:'terminal',
                 mesaj:'"' + q.durum + '" sonuçlanmış bir durumdur; revizyon açılmaz. ' +
                       'Yeni bir teklif oluşturun.' };
      if(!can('ekle'))
        return { ok:false, why:'yetki', roller:['ekle'],
                 mesaj:'Teklif revizyonu açma yetkiniz yok.' };
      return { ok:true };
    }

    function yeniKod(){
      var yil = String(DB.today).slice(0, 4), max = 0;
      (DB.quotes || []).forEach(function(q){
        var m = new RegExp('^TKL-' + yil + '-(\\d+)$').exec(q.kod || '');
        if(m) max = Math.max(max, +m[1]);
      });
      return 'TKL-' + yil + '-' + String(max + 1).padStart(3, '0');
    }

    /* ---- REVİZYON AÇ ------------------------------------------------
       Yeni kayıt ESKİSİNDEN türetilir; alanlar kopyalanır, zincir kurulur,
       yeni sürüm `Taslak` doğar. Eski kayıt DEĞİŞTİRİLMEZ — kilidi zaten
       ardılın varlığından doğar, üzerine bayrak yazmaya gerek yok.
       Kalemler de kopyalanır: revizyon boş bir kalem tablosuyla açılsaydı
       kullanıcı her seferinde sıfırdan yazardı ve "revizyon" bir kopya değil
       yeni teklif olurdu. */
    function revizyonAc(x, opts){
      opts = opts || {};
      var q = kayit(x);
      var izin = revizyonIzni(q);
      if(!izin.ok) return izin;

      var s = surumler(q);
      var enBuyuk = s.reduce(function(m, r){ return Math.max(m, r.versiyon || 1); }, 0);
      var kokKod = kok(q);
      var yeni = {};
      Object.keys(q).forEach(function(k){ yeni[k] = q[k]; });

      yeni.kod          = yeniKod();
      yeni.kokTeklif    = kokKod;
      yeni.oncekiSurum  = q.kod;
      yeni.versiyon     = enBuyuk + 1;
      yeni.tarih        = opts.tarih || DB.today;
      yeni.durum        = 'Taslak';
      yeni.icOnay       = 'Bekliyor';
      yeni.musteriOnay  = '—';
      yeni.arsiv        = false;
      /* K-33: `yeni.aktif = true` YAZILMIYOR — teklif kaydında `durum`
         kanondur, `aktif` ikinci eksendi ve artık tuzaktır. */
      /* Önceki sürümün karar alanları TAŞINMAZ: yeni sürüm henüz hiçbir
         karara bağlanmadı. Taşımak, alınmamış bir kararı alınmış gösterirdi. */
      delete yeni.kayipNedeni;
      delete yeni.sonNedenKodu;
      delete yeni.sonNedenAciklama;

      /* Kökün kendisi de zincire yazılır ki `surumler()` ikisini de bulsun.
         Bu, kök kayda dokunan TEK yazımdır ve içeriğini değiştirmez. */
      var kokKayit = kayit(kokKod);
      if(kokKayit && !kokKayit.kokTeklif) kokKayit.kokTeklif = kokKod;

      (DB.quotes || (DB.quotes = [])).unshift(yeni);

      /* Kalemler kopyalanır — miktar/fiyat aynen, teklif kodu yeni. */
      var kalem = (DB.quoteItems || []).filter(function(i){ return i.teklif === q.kod; });
      kalem.forEach(function(i){
        var kopya = {};
        Object.keys(i).forEach(function(k){ kopya[k] = i[k]; });
        kopya.teklif = yeni.kod;
        DB.quoteItems.push(kopya);
      });

      Audit.yaz({ kayit:yeni.kod, modul:'Satış',
        islem:'Teklif revizyonu açıldı — ' + q.kod + ' sürüm ' + (q.versiyon || 1) +
              ' → ' + yeni.kod + ' sürüm ' + yeni.versiyon +
              (kalem.length ? ' · ' + kalem.length + ' kalem kopyalandı' : ' · kalem dökümü yok') +
              (opts.not ? ' — ' + opts.not : ''),
        eski:q.kod, yeni:yeni.kod, tone:'ok', icon:'i-copy' });
      Audit.yaz({ kayit:q.kod, modul:'Satış',
        islem:'Bu sürüm revize edildi ve kilitlendi — ardıl ' + yeni.kod,
        eski:'açık', yeni:'kilitli', tone:'warn', icon:'i-lock' });

      return { ok:true, yeni:yeni, eski:q, versiyon:yeni.versiyon,
               kalem:kalem.length, kok:kokKod };
    }

    /* ---- FARK -------------------------------------------------------
       İki sürüm arasındaki değişiklik. Alan listesi SABİT değil, iki kaydın
       birleşimidir; yeni bir alan eklendiğinde karşılaştırma kendiliğinden
       kapsar. Zincir ve kimlik alanları dışarıdadır — onlar zaten farklı. */
    var GIZLI = ['kod','kokTeklif','oncekiSurum','versiyon','aktif','arsiv'];
    var ETIKET = {
      firma:'Firma', musteri:'Müşteri hesabı', lead:'Bağlı aday', analiz:'Ön analiz',
      tarih:'Teklif tarihi', gecerlilik:'Geçerlilik', hazirlayan:'Hazırlayan',
      araToplam:'Ara toplam', indirim:'İndirim', vergiOran:'Vergi oranı',
      vergi:'Vergi', toplam:'Genel toplam', doviz:'Döviz', durum:'Durum',
      icOnay:'İç onay', musteriOnay:'Müşteri onayı', kalemSayisi:'Kalem sayısı',
      odemePlani:'Ödeme planı', teslimSuresi:'Teslim süresi',
      garanti:'Garanti', destek:'Destek'
    };

    function fark(a, b){
      var qa = kayit(a), qb = kayit(b);
      if(!qa || !qb) return null;
      var alanlar = {};
      Object.keys(qa).concat(Object.keys(qb)).forEach(function(k){
        if(GIZLI.indexOf(k) === -1) alanlar[k] = 1;
      });
      var degisen = [];
      Object.keys(alanlar).sort().forEach(function(k){
        var x = qa[k] == null ? '' : qa[k], y = qb[k] == null ? '' : qb[k];
        if(String(x) === String(y)) return;
        degisen.push({ alan:k, etiket:ETIKET[k] || k, eski:qa[k], yeni:qb[k],
                       sayisal:typeof qa[k] === 'number' || typeof qb[k] === 'number' });
      });

      /* Kalem farkı — sıra numarası üzerinden eşlenir; ad değişse bile aynı
         satırın revizyonu olduğu görülsün. */
      function kalemler(kod){
        return (DB.quoteItems || []).filter(function(i){ return i.teklif === kod; })
          .sort(function(m, n){ return (m.sira || 0) - (n.sira || 0); });
      }
      var ka = kalemler(qa.kod), kb = kalemler(qb.kod);
      var siralar = {};
      ka.concat(kb).forEach(function(i){ siralar[i.sira] = 1; });
      var kalemFark = [];
      Object.keys(siralar).sort(function(m, n){ return m - n; }).forEach(function(sira){
        var x = ka.filter(function(i){ return String(i.sira) === String(sira); })[0] || null;
        var y = kb.filter(function(i){ return String(i.sira) === String(sira); })[0] || null;
        if(x && !y){ kalemFark.push({ sira:+sira, tur:'silindi', eski:x, yeni:null }); return; }
        if(!x && y){ kalemFark.push({ sira:+sira, tur:'eklendi', eski:null, yeni:y }); return; }
        var d = ['kalem','tur','birim','miktar','birimFiyat','tutar'].filter(function(k){
          return String(x[k] == null ? '' : x[k]) !== String(y[k] == null ? '' : y[k]); });
        if(d.length) kalemFark.push({ sira:+sira, tur:'degisti', eski:x, yeni:y, alanlar:d });
      });

      return {
        eski:qa, yeni:qb, alan:degisen, kalem:kalemFark,
        /* Tutar ekseni ayrıca özetlenir: revizyonun ticari anlamı budur. */
        tutarFarki:(qb.toplam || 0) - (qa.toplam || 0),
        degisiklikSayisi:degisen.length + kalemFark.length
      };
    }

    return { kayit:kayit, kok:kok, surumler:surumler, sonSurum:sonSurum,
             kilitli:kilitli, zincir:zincir, revizyonIzni:revizyonIzni,
             revizyonAc:revizyonAc, fark:fark };
  })();

  GV.test = (function(){

    function kosumlar(testKod){
      return (DB.testRuns || []).filter(function(r){ return r.test === testKod; });
    }
    function sonuclar(kosumKod){
      return (DB.testCaseResults || []).filter(function(x){ return x.kosum === kosumKod; });
    }

    /* Bir test kaydının sayaçları. Dönüş HER ZAMAN `turetilmis` bayrağı
       taşır: çağıran "bu sayı ölçüldü mü yoksa devralındı mı" ayrımını
       yapabilsin. Ekran bu ayrımı KULLANMAK zorundadır — iki farklı
       güvenilirlikteki sayıyı aynı biçimde basmak yanlış beyandır. */
    function sayac(test){
      if(!test) return null;
      var runs = kosumlar(test.kod);
      var tumu = runs.reduce(function(a, r){ return a.concat(sonuclar(r.kod)); }, []);
      if(test.senaryoDetayi === false || !tumu.length){
        return { turetilmis:false, senaryo:test.senaryo || 0,
                 basarili:test.basarili || 0, basarisiz:test.basarisiz || 0,
                 engellendi:null, kosulmadi:null, kosum:runs.length };
      }
      function say(v){ return tumu.filter(function(x){ return x.sonuc === v; }).length; }
      return { turetilmis:true, senaryo:tumu.length,
               basarili:say('Başarılı'), basarisiz:say('Başarısız'),
               engellendi:say('Engellendi'), kosulmadi:say('Koşulmadı'),
               kosum:runs.length };
    }

    /* [9.1.4] — Başarısız sonuçtan hata açma. Kaynak test/senaryo/build/ortam
       ve kanıt OTOMATİK bağlanır; ekran bunları tek tek toplamaz.
       Bugünkü kusur: ekran "başarısız senaryo var ama hata yok" uyarısını
       basıyor ama hata açacak düğme sunmuyordu. */
    function hataBaglami(sonucKod){
      var r = (DB.testCaseResults || []).filter(function(x){ return x.kod === sonucKod; })[0];
      if(!r) return null;
      var kosum = (DB.testRuns || []).filter(function(x){ return x.kod === r.kosum; })[0] || {};
      var sen   = (DB.testCases || []).filter(function(x){ return x.kod === r.senaryo; })[0] || {};
      var build = (DB.builds || []).filter(function(x){ return x.kod === kosum.build; })[0] || {};
      var ort   = (DB.environments || []).filter(function(x){ return x.kod === kosum.ortam; })[0] || {};
      var kanit = (DB.testEvidence || []).filter(function(x){ return x.sonuc === r.kod; });
      var adimlar = (DB.testSteps || []).filter(function(x){ return x.senaryo === r.senaryo; })
                      .sort(function(a,b){ return (a.sira||0)-(b.sira||0); });
      return {
        sonuc:r, senaryo:sen, kosum:kosum, build:build, ortam:ort,
        kanit:kanit, adimlar:adimlar,
        /* Hata formunun ön dolduracağı alanlar — yapılandırılmış repro
           adımın kendisinden gelir, kullanıcıdan serbest metin istenmez. */
        oneri:{
          proje:kosum.proje || sen.proje || null,
          modul:sen.modul || null,
          baslik:sen.ad ? (sen.ad + ' — ' + r.sonuc.toLocaleLowerCase('tr')) : null,
          surum:build.surum || null,
          ortam:ort.ad || null,
          test:kosum.test || null,
          adimMetni:adimlar.map(function(a, i){
            return (i + 1) + '. ' + a.adim + ' → beklenen: ' + a.beklenen; }).join('\n'),
          gerceklesen:r.not || null
        }
      };
    }

    /* Hatası olmayan başarısız sonuçlar — ekran bunlar için "hata aç"
       düğmesi sunar. Boş dönmesi iyi haberdir, ölçülemedi demek değildir. */
    function hatasizBasarisiz(testKod){
      var kods = kosumlar(testKod).map(function(r){ return r.kod; });
      return (DB.testCaseResults || []).filter(function(x){
        return kods.indexOf(x.kosum) !== -1 && x.sonuc === 'Başarısız' && !x.hata;
      });
    }

    function senaryolar(planKod){
      return (DB.testCases || []).filter(function(c){ return !planKod || c.plan === planKod; });
    }
    function adimlar(senaryoKod){
      return (DB.testSteps || []).filter(function(x){ return x.senaryo === senaryoKod; })
               .sort(function(a,b){ return (a.sira||0)-(b.sira||0); });
    }

    return { sayac:sayac, kosumlar:kosumlar, sonuclar:sonuclar,
             hataBaglami:hataBaglami, hatasizBasarisiz:hatasizBasarisiz,
             senaryolar:senaryolar, adimlar:adimlar };
  })();

  /* ===================================================================
     ENTEGRASYON — BAĞLANTI DURUMU TÜRETİLİR, KATALOGDAN OKUNMAZ (K-34)
     -------------------------------------------------------------------
     ÖLÇÜLEN ÇELİŞKİ: `DB.integrations` on kayıt taşıyor ve dördü
     `durum:'Bağlı'` diyor (GitHub · Google Calendar · Paraşüt · OpenAI).
     Aynı deponun kendi veri dosyası bunun yanında şunu yazıyor
     (`assets/data/misc.js`, `DB.integrationErrors` başlığı):

       "Bu prototipte GERÇEK BİR ENTEGRASYON KOŞUMU YOK — `DB.integrations`
        yalnız bağlantı tanımlarını taşıyor, hiçbiri çalışmıyor."

     İkisi aynı anda doğru olamaz. `durum` alanı bir ÖLÇÜM değil, katalogun
     NİYETİDİR: hangi sağlayıcıyla entegre olunması planlandığını söyler.
     Yeşil bir "Bağlı" rozeti basmak, hiç kurulmamış bir bağlantıyı kurulmuş
     göstermek olurdu — K-30'da envanterin tutanaksız zimmet iddiası aynı
     gerekçeyle düşürülmüştü.

     KURAL — kayıt SİLİNMEZ, iddia ile ölçüm AYRIŞTIRILIR:
       · `olculenDurum()` her entegrasyonda `'Bağlanmadı'` döner ve bunun
         KANITINI verir. Sabit bir dize değildir; kanıt boşalırsa (gerçek
         bir koşum defteri eklenirse) yordam yeniden yazılır.
       · `katalogIddiasi()` katalogun ne dediğini AYRI bir ad altında verir.
       · `celisenler()` ikisinin çeliştiği kayıtları sayar — ekran bunu
         gizlemez, dürüstçe basar.

     ⚠️ ANAHTAR ALANI YOKTUR VE EKLENMEZ. Şartname §8.7: "Canlı anahtarlar
     kodda veya istemci paketinde bulunmamalıdır." Bir `<input>` bile
     açmak, anahtarın istemcide toplanabileceğini ima ederdi.
     =================================================================== */
  var BAGLI_IDDIA = ['Bağlı','Senkronda'];

  var Entegrasyon = {
    liste:function(){ return (window.DB && DB.integrations) || []; },
    kayit:function(k){
      if(!k) return null;
      if(typeof k === 'object') return k;
      return this.liste().filter(function(e){ return e.kod === k; })[0] || null;
    },

    /* Bağlantının ÖLÇÜLEBİLİR kanıtı. Üçü de boşsa hiçbir sağlayıcı
       çalışmıyor demektir ve tek dürüst durum `Bağlanmadı`dır. */
    kanit:function(){
      var D = window.DB || {};
      return {
        kosumDefteri:  Array.isArray(D.integrationRuns) ? D.integrationRuns.length : null,
        hataKuyrugu:   (D.integrationErrors || []).length,
        webhookOlayi:  (D.webhookEvents || []).length,
        /* Ödeme sağlayıcısı da bir entegrasyondur ve o da seçilmemiştir. */
        odemeSaglayici:(D.paymentLinkDefaults || {}).saglayici || null
      };
    },
    kosumVar:function(){
      var k = this.kanit();
      return !!(k.kosumDefteri || k.hataKuyrugu || k.webhookOlayi);
    },
    olculenDurum:function(){
      return this.kosumVar() ? null : 'Bağlanmadı';
    },
    olculemedi:function(){
      /* Koşum defteri hiç YOK — "hata yok" ile "ölçülemedi" ayrı şeydir. */
      return !Array.isArray((window.DB || {}).integrationRuns);
    },

    katalogIddiasi:function(e){
      var r = this.kayit(e);
      return r ? (r.durum || null) : null;
    },
    celisir:function(e){
      var i = this.katalogIddiasi(e);
      return !!i && BAGLI_IDDIA.indexOf(i) !== -1 && !this.kosumVar();
    },
    celisenler:function(){
      var self = this;
      return this.liste().filter(function(e){ return self.celisir(e); });
    },
    kategoriler:function(){
      return this.liste().reduce(function(acc, e){
        if(e.kategori && acc.indexOf(e.kategori) === -1) acc.push(e.kategori);
        return acc;
      }, []).sort();
    },

    /* §8.7 — sağlayıcı bağımsız ödeme adaptörü. Beş yordam ADI ŞARTNAMEDEN
       alındı, uydurulmadı; hiçbiri uygulanmadı. */
    odemeAdaptoru:function(){
      var d = (window.DB || {}).paymentLinkDefaults || {};
      return {
        saglayici:d.saglayici || null,
        etiket:d.saglayiciEtiket || null,
        secildi:!!d.saglayici && d.saglayici !== 'TEST-MOCK',
        yordamlar:['createCheckoutSession','verifyWebhook','getPaymentStatus',
                   'refundPayment','cancelSession'],
        acikMadde:((window.DB || {}).paymentBackendGaps || [])
                    .filter(function(g){ return ['§8.6','§8.7','§8.5'].indexOf(g.bolum) !== -1; })
      };
    }
  };
  GV.entegrasyon = Entegrasyon;

  /* ===================================================================
     AYAR MUTASYONU — MODÜL ANAHTARI (şartname §3.1 · REVİZE 18)
     -------------------------------------------------------------------
     `DB.company.aktifModuller` kabuğun GERÇEKTEN okuduğu tek ayardır
     (`shell.js` `Perm.modul` → menü + `guard`). Bu yüzden ayar ekranındaki
     TEK gerçek eylemdir: kapatınca menü girdisi düşer ve doğrudan adres de
     403 verir, veri SİLİNMEZ.

     ⚠️ KAPI İKİ YÖNDE DE AYNIDIR. Kapatma ile açma aynı yetki kümesini
     ister ve açmak kapatmaktan AĞIR koşula bağlanmaz. Ters kurgu — "kapatan
     herkes kapatır, açmayı yalnız sahip açar" — kullanıcıyı kendi kapattığı
     kapının arkasında bırakırdı. Gerekçe de iki yönde de aynı kuralla
     istenir: ikisi de bir yönetim kararıdır.
     =================================================================== */
  var Ayar = {
    modulAnahtarlari:function(){
      var m = (window.DB && DB.company && DB.company.aktifModuller) || {};
      return Object.keys(m);
    },
    modulAcik:function(anahtar){
      var m = (window.DB && DB.company && DB.company.aktifModuller) || {};
      return !(anahtar in m) || m[anahtar] !== false;
    },
    /* Yetki TEK yordamda durur; iki yön de burayı çağırır. */
    modulYetkisi:function(){
      return !!(GV.perm && GV.perm.can('duzenle') && GV.perm.role &&
                ['sahip','genelmudur','sistem'].indexOf(GV.perm.role()) !== -1);
    },
    modulAyarla:function(anahtar, acik, gerekce){
      if(!window.DB || !DB.company || !DB.company.aktifModuller)
        return { ok:false, why:'kayit', mesaj:'Modül defteri yüklü değil.' };
      if(!(anahtar in DB.company.aktifModuller))
        return { ok:false, why:'kayit', mesaj:'Tanımsız modül anahtarı: ' + anahtar };
      if(!this.modulYetkisi())
        return { ok:false, why:'yetki',
                 mesaj:'Modül anahtarını yalnız şirket sahibi, genel müdür ve sistem yöneticisi değiştirebilir.' };
      var g = String(gerekce == null ? '' : gerekce).trim();
      if(g.length < 8)
        return { ok:false, why:'gerekce',
                 mesaj:'Gerekçe zorunludur (en az 8 karakter) — açmak ve kapatmak için aynı koşul.' };
      var eski = this.modulAcik(anahtar);
      if(eski === !!acik)
        return { ok:false, why:'degisiklikyok', mesaj:'Anahtar zaten bu durumda.' };
      DB.company.aktifModuller[anahtar] = !!acik;
      GV.audit.yaz({
        kayit:'AYAR-MODUL-' + anahtar,
        islem:(acik ? 'Modül açıldı' : 'Modül kapatıldı') + ': ' + anahtar,
        eski:eski ? 'açık' : 'kapalı', yeni:acik ? 'açık' : 'kapalı',
        tone:acik ? 'ok' : 'warn', icon:'i-sliders',
        modul:'Ayarlar', not:g
      });
      return { ok:true, anahtar:anahtar, eski:eski, yeni:!!acik, gerekce:g };
    }
  };
  GV.ayar = Ayar;

})();
