// ============================================================
// WriteTec Kongre Başvuru Otomasyonu — Google Apps Script
// ============================================================
// KURULUM:
// 1. Google Forms → Yanıtlar → Sheets simgesi → Sheets aç
// 2. Sheets → Uzantılar → Apps Script → Bu kodu yapıştır
// 3. AYARLAR bölümünü doldurun
//    Sertifika PNG: Apps Script → ⚙ Proje ayarları → Komut dosyası özellikleri →
//    SERTIFIKA_API_TOKEN = Vercel’deki SERTIFIKA_TOKEN ile aynı gizli anahtar (repoda tutulmaz).
// 4. TETİKLEYİCİ (çok önemli — yanlış kaynak seçilirse hiç çalışmaz):
//    Apps Script projesi SHEETS'e bağlı olmalı (Form → Yanıtlar → Sheets ile açılan dosya).
//    Tetikleyiciler → + Ekle:
//      Etkinlik kaynağı: "Elektronik tablodan" / "From spreadsheet"  ← "Formdan" DEĞİL
//      Etkinlik türü:   "Form gönderildiğinde" / "On form submit"
//      İşlev:           onFormSubmit
//    "Formdan - Form gönderildiğinde" seçilirse Son çalıştırma boş kalır; Drive klasörü oluşmaz.
// 5. Çıktı (başvuru anında): Ana klasör altında yazar adlarıyla klasör + başvuru .docx.
//    Kabul mektubu PDF ve sertifika PNG başvuruda ÜRETİLMEZ; bildiri hakem kontrolüne girer.
//    Admin panelden ONAY verilince PDF+PNG üretilip klasöre eklenir ve kabul maili gider;
//    RET verilince düzeltme notlarıyla düzeltme maili gider. Kararlar tabloya sütun olarak işlenir.
// 6. WEB SİTESİ (kongre-basvuru-formu.html): Dağıt → Yeni dağıtım → Tür: Web uygulaması
//    → Çalıştır: Ben / Erişen: Herkes → Dağıt → "Web uygulaması" URL'sini kopyalayın (/exec ile bitsin).
//    Bu URL'yi HTML'deki WEB_APP_EXEC_URL yapın. İsteğe bağlı: AYARLAR.WEB_GONDERIM_ANAHTARI ile
//    HTML'deki WEB_APP_TOKEN aynı olsun (canlıda önerilir).
// 7. ADMIN PANELİ: Anahtar AYARLAR.ADMIN_API_ANAHTARI içinde hazır; web sitesindeki
//    lib/admin.ts → ADMIN_GS_KEY ile aynı tutulmalı. Bu projenin /exec URL'si de
//    lib/admin.ts → CONGRESS_EXEC_URLS["saglik-bilimleri"] içinde kayıtlı.
//    Bu sürüme geçerken tabloyuDuzelt() fonksiyonunu BİR KEZ çalıştırın: başlıkları düzeltir,
//    eski özet-format çift kayıtları siler, eski satırları Beklemede yapar.
//    Eski "processKabulMailQueue_" zaman tetikleyicisi kaldıysa Tetikleyiciler ekranından SİLİN.
//    Kod güncellemesinden sonra Dağıt → Dağıtımı yönet → MEVCUT dağıtımı düzenleyip Yeni sürüm
//    yayınlayın (yeni dağıtım oluşturursanız /exec URL değişir; lib/admin.ts de güncellenmeli).
// ============================================================

// ============================================================
// AYARLAR — Sadece bu bölümü doldurun
// ============================================================
const AYARLAR = {
  // Google Drive'da başvuruların toplanacağı ANA klasörün ID'si
  // Drive'da klasörü açın, URL'deki /folders/BURASI kısmını kopyalayın
  ANA_KLASOR_ID: '11ZwEqKLUWXIgGmLYKNQzH_o7qNE-VTby',

  /**
   * Form yanıtlarının tutulduğu Google Sheets dosyasının ID'si.
   * Admin paneli (adminList/adminApprove/adminReject) ve durum sütunları bu dosyada yaşar.
   * Boş bırakılırsa script'in bağlı olduğu aktif e-tablo kullanılır.
   */
  BASVURU_SHEET_ID: '1mAZeDy8RcScbbRjHV2o28y50tJTCIM3DkbE8yFWTzJk',

  // Bildirim mailinin gideceği admin e-postası (sizin mailiniz)
  ADMIN_EMAIL: 'writetecbt@gmail.com',

  // Kongre adı (maillerde görünür)
  KONGRE_ADI:
    '1. Uluslararası WriteTec Yapay Zeka Çağında Sağlık Bilimleri Kongresi',

  // Kongre tarihi
  KONGRE_TARIHI: '15-16 Ağustos 2026 (Online)',

  /** EN başvuru mailleri / üst şerit (boşsa aşağıdaki sabit fallback kullanılır) */
  KONGRE_ADI_EN:
    '1st International WriteTec Health Sciences Congress in the Age of Artificial Intelligence',
  KONGRE_TARIHI_EN: '15–16 August 2026 (Online)',
  /** Gönderen adı — EN arayüz mailleri (boşsa GONDEREN_AD) */
  GONDEREN_AD_EN: '',

  /**
   * Kabul mektubu PDF şablonu (Google Doküman) dosya ID'si.
   * Şablonu Drive'da açın: docs.google.com/document/d/<ID>/edit
   * Boş bırakılırsa klasöre kabul mektubu PDF'i eklenmez.
   */
  KABUL_MEKTUBU_SABLON_DOC_ID: '10MIKMmpkF7Fb0ayrGBAsB_8KwJgNW88DGYETJ5Bbpsg',

  /**
   * İngilizce kabul mektubu şablonu (formLocale=en). Boşsa TR şablonu kullanılır.
   * Drive'da TR şablonun İngilizce kopyası; aynı yer tutucular: {tarih} {unvan} {isim} {soyisim} {bildiri_basligi}
   */
  KABUL_MEKTUBU_SABLON_DOC_ID_EN: '1Yvva0vHsMZtEU-7WOeKEFKSeYUKGDBVs_tooFrHMGBg',

  /**
   * Kabul mektubu PDF şablonunda kullanılacak yazı tipi ailesi (yer tutucu değişiminden sonra uygulanır).
   * Google Dokümanlar’da Calibri + italik/kalında ş/İ yedek fonta düşebilir; varsayılan Carlito metrik olarak Calibri’ye yakındır ve Türkçe gliflerde daha tutarlıdır.
   * Tam Calibri denemek için: 'Calibri'. Boş bırakılırsa Carlito kullanılır.
   */
  KABUL_MEKTUBU_YAZI_TIPI: 'Carlito',

  /** Şablondaki üst başlık metni (şablonda sabitse boş bırakabilirsiniz) */
  KONGRE_ADI_TR_UST:
    '1. ULUSLARARASI WRITETEC - YAPAY ZEKA ÇAĞINDA SAĞLIK BİLİMLERİ KONGRESİ',

  /** Şablondaki üst başlık İngilizce satır 1 (şablonda sabitse boş bırakabilirsiniz) */
  KONGRE_EN_SATIR1: '',

  /** Şablondaki üst başlık İngilizce satır 2 (şablonda sabitse boş bırakabilirsiniz) */
  KONGRE_EN_SATIR2: '',

  /** Şablondaki en üst şerit metni (örn. "15-16 Ağustos 2026  ◆  ONLINE  ◆  www.isparta.edu.tr  ◆  congress.writetecbt.com") */
  UST_BAR_METIN: '',

  // Gönderen görünen adı (Gmail adresiniz zaten gönderen olur)
  GONDEREN_AD: 'WriteTec Kongre',

  /** Web sitesinden POST ile gelen başvurular için (boş = token kontrolü yok; canlıda doldurun) */
  WEB_GONDERIM_ANAHTARI: '',

  /**
   * Logo: Gmail repodaki dosyayı göremez. Deploy sonrası tam HTTPS adresi yapıştırın; örnek:
   *   https://<alan-adiniz>/img/writetec-logo.png
   * Boş bırakılırsa mailde logo plakası yoktur.
   */
  LOGO_URL: 'https://www.congress.writetecbt.com/img/writetec-logo.png',

  /** Footer'da "Kongre web sitesi" bağlantısı (boş = gösterilmez) */
  KONGRE_WEB_URL: 'congress.writetecbt.com',

  /** İmza satırındaki telefon (TR mailler / footer) */
  ILETISIM_TELEFON: '0 (530) 471 80 78',
  /** EN footer’da gösterilecek telefon (boşsa +90 530 471 80 78) */
  ILETISIM_TELEFON_EN: '',

  /**
   * PNG sertifika üretimi için Vercel API uç noktası.
   * Boş bırakılırsa sertifika üretimi atlanır (klasör + mail akışı normal devam eder).
   * Örnek: 'https://www.congress.writetecbt.com/api/sertifika'
   */
  SERTIFIKA_API_URL: 'https://www.congress.writetecbt.com/api/sertifika',

  /**
   * Sertifika API token. Vercel’de SERTIFIKA_TOKEN env ile aynı olmalı; env yoksa
   * Next.js’teki SERTIFIKA_TOKEN_FALLBACK (app/api/sertifika/route.ts) bu değerle tutarlı olmalı.
   * Öncelik: Script properties SERTIFIKA_API_TOKEN doluysa o kullanılır, boşsa burası.
   */
  SERTIFIKA_API_TOKEN:
    '58622ee5aa627cb194fdb086d30c829d63e0b04ccc4ef22e165d80ad3a6359c3',

  /**
   * Admin paneli API anahtarı (adminList/adminApprove/adminReject).
   * Web sitesindeki lib/admin.ts → ADMIN_GS_KEY ile birebir aynı olmalı.
   */
  ADMIN_API_ANAHTARI: '2d3ad65c64fbb40427649802747c3041cc95674c378302be',

  /**
   * Başvuru formunun canlı adresi. Ret (düzeltme) mailindeki
   * "Düzeltilmiş başvuruyu gönder" butonu buraya ?duzeltmeRef=WT-… ekleyerek yönlendirir.
   */
  BASVURU_FORM_URL:
    'https://www.congress.writetecbt.com/kongrelerimiz/saglik/basvuru-formu/form',
};

/** @return {string} Önce Script properties ADMIN_API_ANAHTARI, yoksa AYARLAR.ADMIN_API_ANAHTARI */
function adminApiAnahtariResolve_() {
  var fromProp = '';
  try {
    fromProp = String(
      PropertiesService.getScriptProperties().getProperty('ADMIN_API_ANAHTARI') || ''
    ).trim();
  } catch (e) {
    fromProp = '';
  }
  if (fromProp) return fromProp;
  return String((AYARLAR && AYARLAR.ADMIN_API_ANAHTARI) || '').trim();
}

/** @return {string} Önce Script properties SERTIFIKA_API_TOKEN, yoksa AYARLAR.SERTIFIKA_API_TOKEN */
function sertifikaApiTokenResolve_() {
  var fromProp = '';
  try {
    fromProp = String(
      PropertiesService.getScriptProperties().getProperty('SERTIFIKA_API_TOKEN') || ''
    ).trim();
  } catch (e) {
    fromProp = '';
  }
  if (fromProp) return fromProp;
  return String((AYARLAR && AYARLAR.SERTIFIKA_API_TOKEN) || '').trim();
}

// ============================================================
// SÜTUN SIRALARI — Google Sheets'te hangi sütun ne?
// Sheets'i açın, 1. satırdaki başlıklara göre aşağıyı doldurun
// Örnek: A=1, B=2, C=3 ... (Timestamp her zaman 1. sütundur)
// ============================================================
const SUTUN = {
  TIMESTAMP: 1, // Otomatik — değiştirmeyin
  UNVAN: 2,
  AD: 3,
  SOYAD: 4,
  UNIVERSITE: 5,
  FAKULTE: 6,
  BOLUM: 7,
  ORCID: 8,
  EMAIL: 9,
  TELEFON: 10,
  SEHIR: 11,
  ULKE: 12,
  BILIM_ALANI: 13,
  YAYIN_TERCIHI: 14,
  BASLIK_TR: 15,
  OZET_TR: 16,
  KEYWORDS_TR: 17,
  JEL: 18,
  TEZ_NOTU: 19,
  BASLIK_EN: 20,
  OZET_EN: 21,
  KEYWORDS_EN: 22,
};

/** Form yanıtı sütun sayısı (1..22) */
const SUTUN_SAYISI = Object.keys(SUTUN).length;

// ============================================================
// EK SÜTUNLAR — İşlem/durum bilgisi (form alanlarından sonra)
// ============================================================
const SUTUN_EK = {
  ISLENDI: SUTUN_SAYISI + 1, // 23: ✅ İşlendi
  KLASOR_URL: SUTUN_SAYISI + 2, // 24: Drive klasör URL
  BASVURU_REF: SUTUN_SAYISI + 3, // 25: WT-YYYYMMDD-HHMMSS
  AUTHORS_JSON: SUTUN_SAYISI + 4, // 26: Tüm yazarlar (JSON)
  FORM_LOCALE: SUTUN_SAYISI + 5, // 27: tr/en
  DURUM: SUTUN_SAYISI + 6, // 28: Beklemede / Onaylandı / Reddedildi
  KARAR_TARIHI: SUTUN_SAYISI + 7, // 29
  DUZELTME_NOTU: SUTUN_SAYISI + 8, // 30
  KABUL_PDF_ID: SUTUN_SAYISI + 9, // 31
  SERTIFIKA_ID: SUTUN_SAYISI + 10, // 32
  KAYNAK: SUTUN_SAYISI + 11, // 33: Web / Form/Sheets / Test
  YAZARLAR: SUTUN_SAYISI + 12, // 34: Tüm yazarlar (okunur metin)
  REVIZYON: SUTUN_SAYISI + 13, // 35: Düzeltme sonrası yeniden gönderim sayısı
  KATILIM_SEKLI: SUTUN_SAYISI + 14, // 36: Yüz yüze / Online (hibrit kongrelerde)
};

const DURUM_BEKLEMEDE = 'Beklemede';
const DURUM_ONAYLANDI = 'Onaylandı';
const DURUM_REDDEDILDI = 'Reddedildi';

const SUTUN_EK_BASLIKLARI_ = {};
SUTUN_EK_BASLIKLARI_[SUTUN_EK.ISLENDI] = 'İşlendi';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.KLASOR_URL] = 'Drive Klasör URL';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.BASVURU_REF] = 'Başvuru Ref';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.AUTHORS_JSON] = 'Yazarlar JSON';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.FORM_LOCALE] = 'Form Locale';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.DURUM] = 'Durum';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.KARAR_TARIHI] = 'Karar Tarihi';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.DUZELTME_NOTU] = 'Düzeltme Notu';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.KABUL_PDF_ID] = 'Kabul PDF File ID';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.SERTIFIKA_ID] = 'Sertifika PNG File ID';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.KAYNAK] = 'Kaynak';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.YAZARLAR] = 'Yazarlar';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.REVIZYON] = 'Revizyon Sayısı';
SUTUN_EK_BASLIKLARI_[SUTUN_EK.KATILIM_SEKLI] = 'Katılım Şekli';

/** Ek sütun başlıklarını 1. satırda garantiler (boşsa yazar; dolu farklıysa dokunmaz). */
function ensureDurumBasliklari_(sh) {
  if (!sh || sh.getLastRow() < 1) return;
  const cols = Object.keys(SUTUN_EK_BASLIKLARI_).map(Number);
  const maxCol = Math.max.apply(null, cols);
  const existing = sh.getRange(1, 1, 1, maxCol).getValues()[0] || [];
  for (let i = 0; i < cols.length; i++) {
    const c = cols[i];
    if (!String(existing[c - 1] || '').trim()) {
      sh.getRange(1, c).setValue(SUTUN_EK_BASLIKLARI_[c]);
    }
  }
}

/** 1..22 form alanı başlıkları (SUTUN düzeniyle birebir aynı sırada). */
function basvuruSutunBasliklari_() {
  return [
    'Timestamp',
    'Ünvan',
    'Ad',
    'Soyad',
    'Üniversite/Kurum',
    'Fakülte/YO/MYO',
    'Bölüm',
    'ORCID',
    'E-posta',
    'Telefon',
    'Şehir',
    'Ülke',
    'Bilim Alanı',
    'Yayın Tercihi',
    'TR Bildiri Başlığı',
    'Özet (TR)',
    'Anahtar Kelimeler (TR)',
    'JEL Kodları',
    'Tez Notu',
    'EN Bildiri Başlığı',
    'Özet (EN)',
    'Keywords (EN)',
  ];
}

/** Başlık satırını kanonik hale getirir: 1..22 form alanları + durum sütunları (W..). */
function ensureBasvuruBasliklari_(sh) {
  if (!sh) return;
  const headers = basvuruSutunBasliklari_();
  const existing =
    sh.getLastRow() >= 1 ? sh.getRange(1, 1, 1, headers.length).getValues()[0] || [] : [];
  const same = headers.every(function (h, i) {
    return String(existing[i] || '').trim() === h;
  });
  if (!same) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  ensureDurumBasliklari_(sh);
  sh.setFrozenRows(1);
}

function isEnglishFormLocale_(data) {
  return (
    String((data && data.formLocale) || '')
      .trim()
      .toLowerCase() === 'en' ||
    (!String((data && data.baslikTr) || '').trim() &&
      String((data && data.baslikEn) || '').trim().length > 0)
  );
}

/** kongre-basvuru-formu.html AUTHOR_UNVAN_ROWS / select value (TR) ile aynı */
const UNVAN_TR_TO_EN_ = {
  'Prof. Dr.': 'Prof. Dr.',
  'Doç. Dr.': 'Assoc. Prof. Dr.',
  'Dr. Öğr. Üyesi': 'Asst. Prof. Dr.',
  'Arş. Gör. Dr.': 'Res. Asst. Dr.',
  'Dr.': 'Dr.',
  'Arş. Gör.': 'Res. Asst.',
  'Öğr. Gör.': 'Lecturer',
  'Uzm.': 'Specialist',
  Diğer: 'Other',
};

/**
 * kongre-basvuru-formu.html SCIENCE_EN_LABEL ile aynı anahtarlar (value TR kalır).
 */
const BILIM_ALANI_TR_TO_EN_ = {
  Hemşirelik: 'Nursing',
  Ebelik: 'Midwifery',
  'Sağlık Yönetimi': 'Health Management',
  'Halk Sağlığı': 'Public Health',
  'Fizyoterapi ve Rehabilitasyon': 'Physiotherapy and Rehabilitation',
  'Beslenme ve Diyetetik': 'Nutrition and Dietetics',
  Tıp: 'Medicine',
  Eczacılık: 'Pharmacy',
  'Diş Hekimliği': 'Dentistry',
  'Tıbbi Biyokimya': 'Medical Biochemistry',
  İktisat: 'Economics',
  İşletme: 'Business Administration',
  Maliye: 'Public Finance',
  'Uluslararası İlişkiler': 'International Relations',
  'Siyaset Bilimi ve Kamu Yönetimi': 'Political Science and Public Administration',
  Sosyoloji: 'Sociology',
  Psikoloji: 'Psychology',
  'Eğitim Bilimleri': 'Educational Sciences',
  Tarih: 'History',
  Hukuk: 'Law',
  Diğer: 'Other',
};

function unvanDisplayEn_(tr) {
  const k = String(tr || '').trim();
  if (!k) return '';
  const x = UNVAN_TR_TO_EN_[k];
  return x != null ? x : k;
}

/**
 * Kabul mektubu / sertifika gibi resmi belgelerde ünvan gösterimi.
 * "Diğer" seçilmişse ünvan bilinmediği için tamamen boş bırakılır
 * (belgede asla "Diğer" / "Other" yazmaz).
 */
function resolveUnvanForBelge_(unvan, en) {
  const raw = String(unvan || '').trim();
  if (!raw || /^di[ğg]er$/i.test(raw)) return '';
  return en ? unvanDisplayEn_(raw) : raw;
}

function bilimAlaniDisplayEn_(trLabel) {
  const k = String(trLabel || '').trim();
  if (!k) return '';
  const x = BILIM_ALANI_TR_TO_EN_[k];
  return x != null ? x : k;
}

function telefonFooterDisplay_(en) {
  if (en) {
    const o = String((AYARLAR && AYARLAR.ILETISIM_TELEFON_EN) || '').trim();
    if (o) return o;
    return '+90 530 471 80 78';
  }
  return String((AYARLAR && AYARLAR.ILETISIM_TELEFON) || '').trim() || '0 (530) 471 80 78';
}

/** Katılımcı özet tablosunda EN modda +90 gösterimi (kullanıcı 0 (5…) girdiyse). */
function telefonTabloDisplay_(tel, en) {
  var s = String(tel == null ? '' : tel).trim();
  if (!s) return '—';
  if (!en) return s;
  if (/^\+90/i.test(s)) return s;
  if (/^0\s*\(?\s*5/.test(s)) {
    return s
      .replace(/^0\s*\(?\s*/, '+90 ')
      .replace(/\)\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return s;
}

function mailKongreAdi_(en) {
  if (en) {
    const o = String((AYARLAR && AYARLAR.KONGRE_ADI_EN) || '').trim();
    if (o) return o;
    return '1st International WriteTec Health Sciences Congress in the Age of Artificial Intelligence';
  }
  return String((AYARLAR && AYARLAR.KONGRE_ADI) || '').trim();
}

function mailKongreTarihiRozet_(en) {
  if (en) {
    const o = String((AYARLAR && AYARLAR.KONGRE_TARIHI_EN) || '').trim();
    if (o) return o;
    return '15–16 August 2026 (Online)';
  }
  return String((AYARLAR && AYARLAR.KONGRE_TARIHI) || '').trim();
}

function mailGonderenAd_(en) {
  if (en) {
    const o = String((AYARLAR && AYARLAR.GONDEREN_AD_EN) || '').trim();
    if (o) return o;
  }
  return String((AYARLAR && AYARLAR.GONDEREN_AD) || '').trim();
}

function paperTitleForLocale_(data) {
  const en = isEnglishFormLocale_(data);
  const tr = String((data && data.baslikTr) || '').trim();
  const e = String((data && data.baslikEn) || '').trim();
  if (en) return e || tr || '—';
  return tr || e || '—';
}

function kabulMailMetni_(data) {
  const baslik = paperTitleForLocale_(data);
  const kayitUrl = 'https://www.congress.writetecbt.com/kayitbilgisi';
  if (isEnglishFormLocale_(data)) {
    return (
      'Dear Author;\n\n' +
      'Your abstract titled “' +
      baslik +
      '” submitted to the 1st International WRITETEC Health Sciences Congress in the Age of Artificial Intelligence (15–16 August 2026, online; hosted by WRITETEC Information Technologies and NA Academy) has been accepted for presentation. Your acceptance document is attached.\n\n' +
      'After you pay the congress registration fee and send the receipt to writetecbt@gmail.com, your application will be complete and you will be added to the congress program. Registration information: ' +
      kayitUrl +
      '\n\nThank you for your interest. Best regards.\n\n' +
      'Note: Online sessions will be held on 15–16 August 2026.\n\n' +
      'Congress Secretariat\n\n' +
      'INFO LINE: ' +
      telefonFooterDisplay_(true) +
      '\n\n' +
      'writetecbt@gmail.com\n\n' +
      'https://congress.writetecbt.com/\n\n' +
      'https://www.naakademi.com/\n'
    );
  }
  return (
    'Sayın Hocam;\n\n' +
    '15-16 Ağustos 2026 tarihlerinde WriteTec Bilgi Teknolojileri ve NA Akademi ev sahipliğinde düzenlenecek olan 1. Uluslararası WriteTec Yapay Zeka Çağında Sağlık Bilimleri Kongresi’ne göndermiş olduğunuz “' +
    baslik +
    '” başlıklı bildiri özetiniz kongrede sunulmak üzere kabul edilmiş ve kabul belgesi hazırlanıp ekte gönderilmiştir.\n\n' +
    'Kongre katılım ücret ödemesini gerçekleştirerek, dekontunu writetecbt@gmail.com e-mail adresine yolladığınızda kongre başvuru süreciniz tamamlanarak kongre programına eklenmiş olacaksınız. Kongre kayıt ve katılım bilgilerine; ' +
    kayitUrl +
    ' adresinden ulaşabilirsiniz.\n\n' +
    'Kongremize göstermiş olduğunuz ilgiye tekrar teşekkür eder, iyi çalışmalar dileriz.\n\n' +
    'NOT: Kongremizin online oturumları 15-16 Ağustos 2026 tarihleri arasında gerçekleştirilecektir.\n\n' +
    'Kongre Sekreteryası\n\n' +
    'KONGRE BİLGİ HATTI: +90 530 471 80 78\n\n' +
    'writetecbt@gmail.com\n\n' +
    'https://congress.writetecbt.com/\n\n' +
    'https://www.naakademi.com/\n'
  );
}

function kabulMailHtml_(data) {
  const baslik = paperTitleForLocale_(data);
  const kayitUrl = 'https://www.congress.writetecbt.com/kayitbilgisi';
  const congressUrl = 'https://congress.writetecbt.com/';
  const naUrl = 'https://www.naakademi.com/';

  function p(s) {
    return (
      '<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#111827">' +
      escapeHtml_(s) +
      '</p>'
    );
  }

  if (isEnglishFormLocale_(data)) {
    return (
      '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#ffffff;font-family:' +
      MAIL_FONT_STACK_ +
      ';color:#111827">' +
      '<div style="max-width:720px;margin:0 auto;padding:24px 18px">' +
      p('Dear Author;') +
      p(
        'Your abstract titled “' +
          baslik +
          '” submitted to the 1st International WRITETEC Health Sciences Congress in the Age of Artificial Intelligence (15–16 August 2026, online) has been accepted for presentation. Your acceptance document is attached.'
      ) +
      p(
        'Please complete the registration payment and email the receipt to writetecbt@gmail.com to finalize your application. Registration details: ' +
          kayitUrl
      ) +
      p('Thank you for your interest. Best regards.') +
      p('Note: Online sessions will be held on 15–16 August 2026.') +
      '<div style="margin-top:18px">' +
      p('Congress Secretariat') +
      '<p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#111827"><strong>INFO LINE:</strong> ' +
      escapeHtml_(telefonFooterDisplay_(true)) +
      '</p>' +
      '<p style="margin:0 0 6px;font-size:14px;line-height:1.7"><a href="mailto:writetecbt@gmail.com" style="color:#0b57d0;text-decoration:underline">writetecbt@gmail.com</a></p>' +
      '<p style="margin:0 0 6px;font-size:14px;line-height:1.7"><a href="' +
      escapeHtml_(congressUrl) +
      '" style="color:#0b57d0;text-decoration:underline">' +
      escapeHtml_(congressUrl) +
      '</a></p>' +
      '<p style="margin:0 0 6px;font-size:14px;line-height:1.7"><a href="' +
      escapeHtml_(naUrl) +
      '" style="color:#0b57d0;text-decoration:underline">' +
      escapeHtml_(naUrl) +
      '</a></p>' +
      '</div>' +
      '</div></body></html>'
    );
  }

  return (
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#ffffff;font-family:' +
    MAIL_FONT_STACK_ +
    ';color:#111827">' +
    '<div style="max-width:720px;margin:0 auto;padding:24px 18px">' +
    p('Sayın Hocam;') +
    p(
      '15-16 Ağustos 2026 tarihlerinde WriteTec Bilgi Teknolojileri ve NA Akademi ev sahipliğinde düzenlenecek olan 1. Uluslararası WriteTec Yapay Zeka Çağında Sağlık Bilimleri Kongresi’ne göndermiş olduğunuz “' +
        baslik +
        '” başlıklı bildiri özetiniz kongrede sunulmak üzere kabul edilmiş ve kabul belgesi hazırlanıp ekte gönderilmiştir.'
    ) +
    p(
      'Kongre katılım ücret ödemesini gerçekleştirerek, dekontunu writetecbt@gmail.com e-mail adresine yolladığınızda kongre başvuru süreciniz tamamlanarak kongre programına eklenmiş olacaksınız. Kongre kayıt ve katılım bilgilerine; ' +
        kayitUrl +
        ' adresinden ulaşabilirsiniz.'
    ) +
    p('Kongremize göstermiş olduğunuz ilgiye tekrar teşekkür eder, iyi çalışmalar dileriz.') +
    p('NOT: Kongremizin online oturumları 15-16 Ağustos 2026 tarihleri arasında gerçekleştirilecektir.') +
    '<div style="margin-top:18px">' +
    p('Kongre Sekreteryası') +
    '<p style="margin:0 0 6px;font-size:14px;line-height:1.7;color:#111827"><strong>KONGRE BİLGİ HATTI:</strong> +90 530 471 80 78</p>' +
    '<p style="margin:0 0 6px;font-size:14px;line-height:1.7"><a href="mailto:writetecbt@gmail.com" style="color:#0b57d0;text-decoration:underline">writetecbt@gmail.com</a></p>' +
    '<p style="margin:0 0 6px;font-size:14px;line-height:1.7"><a href="' +
    escapeHtml_(congressUrl) +
    '" style="color:#0b57d0;text-decoration:underline">' +
    escapeHtml_(congressUrl) +
    '</a></p>' +
    '<p style="margin:0 0 6px;font-size:14px;line-height:1.7"><a href="' +
    escapeHtml_(naUrl) +
    '" style="color:#0b57d0;text-decoration:underline">' +
    escapeHtml_(naUrl) +
    '</a></p>' +
    '</div>' +
    '</div></body></html>'
  );
}

// ============================================================
// KABUL MAİLİ — Onay anında PDF ekli gönderim (tüm yazarlara)
// ============================================================
function kabulMailiGonder_(data, klasorUrl, kabulPdfFileId) {
  const recipients = uniqueAuthorEmails_(data && data.authors);
  if (!recipients.length) {
    const tek = String((data && data.email) || '').trim().toLowerCase();
    if (tek) recipients.push(tek);
  }
  if (!recipients.length) throw new Error('Kabul maili: alıcı e-posta bulunamadı.');

  const en = isEnglishFormLocale_(data);
  const konu = en
    ? 'Acceptance letter — ' + mailKongreAdi_(true)
    : 'Kabul Belgesi — ' + mailKongreAdi_(false);

  const attachments = [];
  const pdfId = String(kabulPdfFileId || '').trim();
  if (pdfId) {
    attachments.push(DriveApp.getFileById(pdfId).getBlob());
  }

  MailApp.sendEmail({
    to: recipients.join(','),
    subject: konu,
    body: kabulMailMetni_(data),
    htmlBody: kabulMailHtml_(data),
    name: AYARLAR.GONDEREN_AD,
    replyTo: AYARLAR.ADMIN_EMAIL,
    attachments: attachments.length ? attachments : undefined,
  });

  // Admin bilgilendirme
  try {
    MailApp.sendEmail({
      to: AYARLAR.ADMIN_EMAIL,
      subject: 'Kabul mektubu gönderildi — ' + (data.adSoyad || recipients[0]),
      body:
        'Kabul mektubu gönderildi.\n\n' +
        'Bildiri: ' +
        paperTitleForLocale_(data) +
        '\n' +
        'Alıcılar: ' +
        recipients.join(', ') +
        '\n' +
        'Gönderim zamanı: ' +
        new Date().toLocaleString('tr-TR') +
        '\n' +
        'Drive klasör: ' +
        (klasorUrl || '—') +
        '\n',
      name: AYARLAR.GONDEREN_AD,
    });
  } catch (ignore) {}
}

/** Drive klasör adı: Ünvan + Ad + Soyad (güvenli karakterler) */
function klasorAdiOlustur_(unvan, ad, soyad) {
  const raw =
    String(unvan || '').trim() +
    '_' +
    String(ad || '').trim() +
    '_' +
    String(soyad || '').trim();
  let s = raw.replace(/[^a-zA-Z0-9_çğışöüÇĞİŞÖÜ]/g, '_').replace(/_+/g, '_');
  s = s.replace(/^_|_$/g, '');
  if (!s) s = 'Basvuru';
  if (s.length > 100) s = s.substring(0, 100);
  return s;
}

function getBasvuruSheet_() {
  let ss = null;
  const sheetId = String((AYARLAR && AYARLAR.BASVURU_SHEET_ID) || '').trim();
  if (sheetId) {
    try {
      ss = SpreadsheetApp.openById(sheetId);
    } catch (e) {
      console.error('BASVURU_SHEET_ID açılamadı: ' + e);
      ss = null;
    }
  }
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return null;
  const names = ['Başvurular', 'Form Yanıtları 1', 'Form Responses 1', 'Yanıtlar'];
  for (let i = 0; i < names.length; i++) {
    const sh = ss.getSheetByName(names[i]);
    if (sh) return sh;
  }
  return ss.getSheets()[0];
}

/** Ref tablodaki başka bir satırda kullanılıyorsa -2, -3… eki ile benzersizleştirir. */
function benzersizRef_(sh, ref, haricRow) {
  const taban = String(ref || '').trim();
  if (!sh || !taban) return taban;
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return taban;
  const values = sh.getRange(2, SUTUN_EK.BASVURU_REF, lastRow - 1, 1).getValues();
  const kullanilan = {};
  for (let i = 0; i < values.length; i++) {
    if (i + 2 === haricRow) continue;
    const v = String(values[i][0] || '').trim();
    if (v) kullanilan[v] = true;
  }
  if (!kullanilan[taban]) return taban;
  for (let n = 2; n < 100; n++) {
    const aday = taban + '-' + n;
    if (!kullanilan[aday]) return aday;
  }
  return taban + '-' + Utilities.getUuid().slice(0, 8);
}

/** Ek sütunları (İşlendi, Ref, Durum, Kaynak…) verilen satıra yazar. */
function durumSutunlariniYaz_(sh, row, data, klasorUrl, kaynak) {
  ensureDurumBasliklari_(sh);
  const refTaban = mailBasvuruReferans_(data && data.timestamp ? new Date(data.timestamp) : new Date());
  const ref = benzersizRef_(sh, refTaban, row);
  const authorsJson = Array.isArray(data && data.authors) ? JSON.stringify(data.authors) : '';
  const yazarlar =
    String((data && data.authorsText) || '').trim() ||
    authorsToCommaNames_(data && data.authors) ||
    [data && data.unvan, data && data.ad, data && data.soyad].filter(Boolean).join(' ').trim();
  sh.getRange(row, SUTUN_EK.ISLENDI).setValue('✅ İşlendi');
  sh.getRange(row, SUTUN_EK.KLASOR_URL).setValue(String(klasorUrl || ''));
  sh.getRange(row, SUTUN_EK.BASVURU_REF).setValue(ref);
  sh.getRange(row, SUTUN_EK.AUTHORS_JSON).setValue(authorsJson);
  sh.getRange(row, SUTUN_EK.FORM_LOCALE).setValue(String((data && data.formLocale) || 'tr'));
  sh.getRange(row, SUTUN_EK.DURUM).setValue(DURUM_BEKLEMEDE);
  sh.getRange(row, SUTUN_EK.KAYNAK).setValue(String(kaynak || ''));
  sh.getRange(row, SUTUN_EK.YAZARLAR).setValue(yazarlar);
  sh.getRange(row, SUTUN_EK.REVIZYON).setValue(0);
  sh.getRange(row, SUTUN_EK.KATILIM_SEKLI).setValue(String((data && data.katilimSekli) || ''));
  return ref;
}

/** doPost parametrelerinden getRowData ile aynı şekilli nesne */
function webParametrelerindenVeri_(p) {
  const authorsParsed = parseAndNormalizeAuthorsFromWeb_(p);
  const primary = (authorsParsed.authors && authorsParsed.authors[0]) || null;
  const unvan = String((primary && primary.unvan) || p.unvan || '').trim();
  const ad = String((primary && primary.ad) || p.ad || '').trim();
  const soyad = String((primary && primary.soyad) || p.soyad || '').trim();
  const universite = String((primary && primary.universite) || p.universite || '').trim();
  const fakulte = String((primary && primary.fakulte) || p.fakulte || '').trim();
  const bolum = String((primary && primary.bolum) || p.bolum || '').trim();
  const orcid = String((primary && primary.orcid) || p.orcid || '').trim();
  const email = String((primary && primary.email) || p.email || '').trim();
  const telefon = String((primary && primary.telefon) || p.telefon || '').trim();
  const sehir = String((primary && primary.sehir) || p.sehir || '').trim();
  const ulke = String((primary && primary.ulke) || p.ulke || '').trim();

  return {
    timestamp: new Date(),
    unvan: unvan,
    ad: ad,
    soyad: soyad,
    adSoyad: [resolveUnvanForBelge_(unvan, false), ad, soyad].filter(Boolean).join(' ').trim(),
    universite: universite,
    fakulte: fakulte,
    bolum: bolum,
    orcid: orcid,
    email: email,
    telefon: telefon,
    sehir: sehir,
    ulke: ulke,
    bilimAlani: String(p.bilimAlani || '').trim(),
    katilimSekli: String(p.katilimSekli || '').trim(),
    yayinTercihi: String(p.yayinTercihi || '').trim(),
    baslikTr: String(p.baslikTr || '').trim(),
    ozetTr: String(p.ozetTr || '').trim(),
    keywordsTr: String(p.keywordsTr || '').trim(),
    jel: String(p.jel || '').trim(),
    tezNotu: String(p.tezNotu || '').trim(),
    baslikEn: String(p.baslikEn || '').trim(),
    ozetEn: String(p.ozetEn || '').trim(),
    keywordsEn: String(p.keywordsEn || '').trim(),
    formLocale: (function () {
      const r = String((p && p.formLocale) || '').trim().toLowerCase();
      return r === 'en' ? 'en' : 'tr';
    })(),
    klasorAdi: klasorAdiOlusturFromAuthors_(authorsParsed.authors) || klasorAdiOlustur_(unvan, ad, soyad),
    authors: authorsParsed.authors,
    authorsText: authorsParsed.authorsText,
  };
}

function parseAndNormalizeAuthorsFromWeb_(p) {
  const rawJson = String((p && p.authorsJson) || '').trim();
  const maxAuthors = 50;
  const enLocale = String((p && p.formLocale) || '').trim().toLowerCase() === 'en';

  let authors = null;
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) authors = parsed;
    } catch (ignore) {
      // bozuk JSON: fallback aşağıda
    }
  }

  // Fallback: eski tek-yazar alanlarından üret
  if (!Array.isArray(authors) || !authors.length) {
    authors = [
      {
        unvan: String((p && p.unvan) || '').trim(),
        ad: String((p && p.ad) || '').trim(),
        soyad: String((p && p.soyad) || '').trim(),
        universite: String((p && p.universite) || '').trim(),
        fakulte: String((p && p.fakulte) || '').trim(),
        bolum: String((p && p.bolum) || '').trim(),
        orcid: String((p && p.orcid) || '').trim(),
        email: String((p && p.email) || '').trim(),
        telefon: String((p && p.telefon) || '').trim(),
        sehir: String((p && p.sehir) || '').trim(),
        ulke: String((p && p.ulke) || '').trim(),
      },
    ];
  }

  // Normalize + trim + limit
  const normalized = [];
  for (let i = 0; i < authors.length && normalized.length < maxAuthors; i++) {
    const a = authors[i] || {};
    normalized.push({
      unvan: String(a.unvan || '').trim(),
      // İsim biçimi: ad = ilk harf büyük, soyad = TAMAMEN BÜYÜK (belgelerle tutarlı).
      ad: adIlkHarfBuyuk_(a.ad, enLocale),
      soyad: soyadBuyukHarf_(a.soyad, enLocale),
      universite: String(a.universite || '').trim(),
      fakulte: String(a.fakulte || '').trim(),
      bolum: String(a.bolum || '').trim(),
      orcid: String(a.orcid || '').trim(),
      email: String(a.email || '').trim(),
      telefon: String(a.telefon || '').trim(),
      sehir: String(a.sehir || '').trim(),
      ulke: String(a.ulke || '').trim(),
    });
  }

  // Excel/Drive/kabul mektubu için istenen format: virgülle ayrılmış "Ünvan Ad Soyad"
  const authorsText = authorsToCommaNames_(normalized);
  return { authors: normalized, authorsText: authorsText };
}

function authorFullName_(a) {
  if (!a) return '';
  return [resolveUnvanForBelge_(a.unvan, false), a.ad, a.soyad].filter(Boolean).join(' ').trim();
}

function authorsToCommaNames_(authors) {
  const list = Array.isArray(authors) ? authors : [];
  return list
    .map(function (a) {
      return authorFullName_(a);
    })
    .filter(function (x) {
      return x && String(x).trim().length > 0;
    })
    .join(', ');
}

function authorFullNameLocale_(a, en) {
  if (!a) return '';
  const u = resolveUnvanForBelge_(a && a.unvan, en);
  return [u, a.ad, a.soyad].filter(Boolean).join(' ').trim();
}

/** Kabul mektubunda / sertifikada soyadlar büyük harf; TR: tr-TR, EN: en-US (i -> I). */
function soyadBuyukHarf_(soyad, en) {
  const s = String(soyad == null ? '' : soyad).trim();
  if (!s.length) return '';
  const locale = en === true ? 'en-US' : 'tr-TR';
  try {
    return s.toLocaleUpperCase(locale);
  } catch (ignore) {
    return s.toUpperCase();
  }
}

function adIlkHarfBuyuk_(ad, en) {
  const s = String(ad == null ? '' : ad).trim();
  if (!s.length) return '';
  const locale = en === true ? 'en-US' : 'tr-TR';
  return s.split(/\s+/).map(function(word) {
    if (!word) return '';
    try {
      return word.charAt(0).toLocaleUpperCase(locale) + word.slice(1).toLocaleLowerCase(locale);
    } catch (ignore) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  }).join(' ');
}

/** Kabul mektubu hitabı: ad ilk harf büyük, soyad büyük harf. */
function authorFullNameKabulMektubu_(a, en) {
  if (!a) return '';
  const u = resolveUnvanForBelge_(a && a.unvan, en);
  const ad = adIlkHarfBuyuk_(a.ad, en);
  const soyad = soyadBuyukHarf_(a.soyad, en);
  return [u, ad, soyad].filter(Boolean).join(' ').trim();
}

function authorsToKabulMektubuHitap_(authors, useEn) {
  const en = useEn === true;
  const list = Array.isArray(authors) ? authors : [];
  const names = list
    .map(function (a) {
      return authorFullNameKabulMektubu_(a, en);
    })
    .filter(function (x) {
      return x && String(x).trim().length > 0;
    });
  if (!names.length) return '';
  // Virgül / satır sonu: şablonda genelde "{unvan} {isim} {soyisim};" ile sondaki ; zaten var;
  // burada ek ; basmıyoruz (çift "; ;" oluşmasın).
  return (
    names
      .map(function (n, i) {
        const isLast = i === names.length - 1;
        return String(n) + (isLast ? '' : ',');
      })
      .join('\n')
  );
}

function uniqueAuthorEmails_(authors) {
  const list = Array.isArray(authors) ? authors : [];
  const seen = {};
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const e = String(list[i] && list[i].email ? list[i].email : '')
      .trim()
      .toLowerCase();
    if (!e) continue;
    if (seen[e]) continue;
    seen[e] = true;
    out.push(e);
  }
  return out;
}

/** Yalnızca ana (birincil) yazarın e-postası; yoksa data.email. */
function anaYazarEmail_(data) {
  const list = data && Array.isArray(data.authors) ? data.authors : [];
  const ilk = list.length ? String(list[0].email || '').trim().toLowerCase() : '';
  if (ilk) return ilk;
  return String((data && data.email) || '').trim().toLowerCase();
}

function klasorAdiOlusturFromAuthors_(authors) {
  const raw = authorsToCommaNames_(authors);
  // Drive klasör adı olarak virgül/boşluk serbest; sadece problemli karakterleri temizle.
  let s = String(raw || '')
    .replace(/[\/\\:\*\?"<>\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) s = 'Basvuru';
  if (s.length > 120) s = s.substring(0, 120).trim();
  return s;
}

function authorsToText_(authors) {
  const list = Array.isArray(authors) ? authors : [];
  return list
    .map(function (a, i) {
      const fullName = [resolveUnvanForBelge_(a.unvan, false), a.ad, a.soyad].filter(Boolean).join(' ').trim();
      const kurum = [a.universite, a.fakulte, a.bolum].filter(Boolean).join(' — ').trim();
      const contact = [a.email, a.telefon].filter(Boolean).join(' · ');
      const loc = [a.sehir, a.ulke].filter(Boolean).join(' / ');
      const parts = [];
      if (fullName) parts.push(fullName);
      if (kurum) parts.push(kurum);
      if (contact) parts.push(contact);
      if (loc) parts.push(loc);
      return String(i + 1) + ') ' + (parts.length ? parts.join(' — ') : '—');
    })
    .join('\n');
}

function basvuruListesineEkle_(data, klasorUrl, kaynak) {
  const sh = getBasvuruSheet_();
  if (!sh) return;
  ensureBasvuruBasliklari_(sh);
  const row = [
    data.timestamp,
    data.unvan,
    data.ad,
    data.soyad,
    data.universite,
    data.fakulte,
    data.bolum,
    data.orcid,
    data.email,
    data.telefon,
    data.sehir,
    data.ulke,
    data.bilimAlani,
    data.yayinTercihi,
    data.baslikTr,
    data.ozetTr,
    data.keywordsTr,
    data.jel,
    data.tezNotu,
    data.baslikEn,
    data.ozetEn,
    data.keywordsEn,
  ];
  sh.appendRow(row);
  const yeniSatir = sh.getLastRow();
  // Telefon daima METİN olarak saklansın (+90 / +39 gibi değerler Sheets'te formül sanılmasın).
  sh.getRange(yeniSatir, SUTUN.TELEFON).setNumberFormat('@').setValue(String(data.telefon || ''));
  durumSutunlariniYaz_(sh, yeniSatir, data, klasorUrl, kaynak);
}

/**
 * Düzeltme (revizyon) eşleşmesi — güvenli fallback: aynı e-posta + birebir aynı
 * bildiri başlığı + Durum=Reddedildi olan en yeni satır. Farklı başlıklı bildiriler
 * eşleşmez; aynı kişinin yeni bildirileri her zaman yeni kayıt olur.
 */
function reddedilmisEslesmeBul_(sh, data) {
  if (!sh) return 0;
  const email = String((data && data.email) || '').trim().toLowerCase();
  const baslikTr = String((data && data.baslikTr) || '').trim().toLowerCase();
  const baslikEn = String((data && data.baslikEn) || '').trim().toLowerCase();
  if (!email || (!baslikTr && !baslikEn)) return 0;

  const lastRow = sh.getLastRow();
  if (lastRow < 2) return 0;
  const values = sh.getRange(2, 1, lastRow - 1, SUTUN_EK.SERTIFIKA_ID).getValues();
  let bulunan = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (String(v[SUTUN_EK.DURUM - 1] || '').trim() !== DURUM_REDDEDILDI) continue;
    if (String(v[SUTUN.EMAIL - 1] || '').trim().toLowerCase() !== email) continue;
    const eskiTr = String(v[SUTUN.BASLIK_TR - 1] || '').trim().toLowerCase();
    const eskiEn = String(v[SUTUN.BASLIK_EN - 1] || '').trim().toLowerCase();
    const baslikEsit =
      (baslikTr && eskiTr && baslikTr === eskiTr) ||
      (baslikEn && eskiEn && baslikEn === eskiEn);
    if (!baslikEsit) continue;
    bulunan = i + 2; // birden çok eşleşmede en yenisi kazanır
  }
  return bulunan;
}

/**
 * Revizyonu YERİNDE uygular: satır 1–22 yeni verilerle yazılır, Drive klasöründeki
 * başvuru .docx yenilenir, durum Beklemede'ye döner, revizyon sayacı artar.
 * Başvuru referansı ve orijinal Timestamp değişmez.
 * @return {{ref: string, klasorUrl: string, revizyon: number}}
 */
function basvuruRevizyonuUygula_(sh, row, data) {
  ensureBasvuruBasliklari_(sh);
  const eski = sh.getRange(row, 1, 1, SUTUN_EK.KATILIM_SEKLI).getValues()[0];
  const ref =
    String(eski[SUTUN_EK.BASVURU_REF - 1] || '').trim() ||
    mailBasvuruReferans_(eski[SUTUN.TIMESTAMP - 1]);
  const eskiKlasorUrl = String(eski[SUTUN_EK.KLASOR_URL - 1] || '').trim();
  const revizyon = (Number(eski[SUTUN_EK.REVIZYON - 1]) || 0) + 1;

  // Drive: aynı klasörde .docx yenilenir; yazar listesi değiştiyse klasör adı da güncellenir.
  const klasor = adminKlasorAcVeyaOlustur_(eskiKlasorUrl, data);
  try {
    if (data.klasorAdi && String(klasor.getName() || '') !== String(data.klasorAdi)) {
      klasor.setName(data.klasorAdi);
    }
  } catch (ignore) {}
  basvuruDocxYazVeEskisiniSil_(klasor, data);
  const klasorUrl = klasor.getUrl();

  // Önceki karara ait belgeler (varsa) temizlenir.
  adminEskiDosyayiSil_(eski[SUTUN_EK.KABUL_PDF_ID - 1]);
  adminEskiDosyayiSil_(eski[SUTUN_EK.SERTIFIKA_ID - 1]);

  // 1–22: yeni başvuru verileri (Timestamp orijinal kalır; ref ona bağlı).
  sh.getRange(row, 1, 1, SUTUN_SAYISI).setValues([[
    eski[SUTUN.TIMESTAMP - 1],
    data.unvan,
    data.ad,
    data.soyad,
    data.universite,
    data.fakulte,
    data.bolum,
    data.orcid,
    data.email,
    data.telefon,
    data.sehir,
    data.ulke,
    data.bilimAlani,
    data.yayinTercihi,
    data.baslikTr,
    data.ozetTr,
    data.keywordsTr,
    data.jel,
    data.tezNotu,
    data.baslikEn,
    data.ozetEn,
    data.keywordsEn,
  ]]);
  // Telefon daima METİN olarak saklansın (revizyonda da).
  sh.getRange(row, SUTUN.TELEFON).setNumberFormat('@').setValue(String(data.telefon || ''));

  const yazarlar =
    String((data && data.authorsText) || '').trim() ||
    authorsToCommaNames_(data && data.authors) ||
    [data.unvan, data.ad, data.soyad].filter(Boolean).join(' ').trim();

  sh.getRange(row, SUTUN_EK.ISLENDI).setValue('✅ İşlendi');
  sh.getRange(row, SUTUN_EK.KLASOR_URL).setValue(klasorUrl);
  sh.getRange(row, SUTUN_EK.BASVURU_REF).setValue(ref);
  sh.getRange(row, SUTUN_EK.AUTHORS_JSON).setValue(
    Array.isArray(data && data.authors) ? JSON.stringify(data.authors) : ''
  );
  sh.getRange(row, SUTUN_EK.FORM_LOCALE).setValue(String((data && data.formLocale) || 'tr'));
  sh.getRange(row, SUTUN_EK.DURUM).setValue(DURUM_BEKLEMEDE);
  sh.getRange(row, SUTUN_EK.KARAR_TARIHI).setValue('');
  // DUZELTME_NOTU korunur: panelde önceki talep görünmeye devam eder.
  sh.getRange(row, SUTUN_EK.KABUL_PDF_ID).setValue('');
  sh.getRange(row, SUTUN_EK.SERTIFIKA_ID).setValue('');
  sh.getRange(row, SUTUN_EK.KAYNAK).setValue('Web (düzeltme)');
  sh.getRange(row, SUTUN_EK.YAZARLAR).setValue(yazarlar);
  sh.getRange(row, SUTUN_EK.REVIZYON).setValue(revizyon);
  sh.getRange(row, SUTUN_EK.KATILIM_SEKLI).setValue(String((data && data.katilimSekli) || ''));

  console.log('Revizyon uygulandı: ' + ref + ' (Rev ' + revizyon + ')');
  return { ref: ref, klasorUrl: klasorUrl, revizyon: revizyon };
}

// ============================================================
// GÖNDERİM DEDUP (submissionId) — EK GÜVENLİK KATMANI
// submissionId gelmezse hiçbir davranış değişmez (eski istemciler aynen çalışır).
// Ağ hatasında istemci aynı submissionId ile tekrar gönderirse mükerrer kayıt
// (klasör + mail + satır) oluşmaz; saklanan sonuç aynen geri döner.
// ============================================================
const KONGRE_SUB_STATE_PREFIX = 'SUB_';
const KONGRE_SUB_STATE_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat

/** Geçersiz/eksik id'de '' döner — ASLA throw etmez (eski davranışa düşüş). */
function kongreSubmissionIdTemizle_(raw) {
  const id = String(raw || '').trim();
  return /^[A-Za-z0-9_-]{8,64}$/.test(id) ? id : '';
}

function getKongreSubmissionState_(submissionId) {
  if (!submissionId) return null;
  const props = PropertiesService.getScriptProperties();
  const key = KONGRE_SUB_STATE_PREFIX + submissionId;
  const raw = props.getProperty(key);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || !value.savedAt || Date.now() - value.savedAt > KONGRE_SUB_STATE_TTL_MS) {
      props.deleteProperty(key);
      return null;
    }
    return value;
  } catch (e) {
    props.deleteProperty(key);
    return null;
  }
}

function setKongreSubmissionState_(submissionId, result) {
  if (!submissionId) return;
  const props = PropertiesService.getScriptProperties();
  const key = KONGRE_SUB_STATE_PREFIX + submissionId;
  props.setProperty(key, JSON.stringify({ result: result, savedAt: Date.now() }));
  // Süresi geçen SUB_ anahtarlarını temizle (admin secret'ları SUB_ önekli değildir).
  const all = props.getProperties();
  Object.keys(all).forEach(function (propKey) {
    if (propKey.indexOf(KONGRE_SUB_STATE_PREFIX) !== 0 || propKey === key) return;
    try {
      const value = JSON.parse(all[propKey]);
      if (!value.savedAt || Date.now() - value.savedAt > KONGRE_SUB_STATE_TTL_MS) props.deleteProperty(propKey);
    } catch (e) {
      props.deleteProperty(propKey);
    }
  });
}

function doGet() {
  return ContentService.createTextOutput(
    'WriteTec kongre basvuru Web App hazir. POST ile gonderim kabul edilir. | surum=2026-07-17-dedup-1'
  ).setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Web sitesinden form POST (application/x-www-form-urlencoded).
 * HTML: fetch(WEB_APP_EXEC_URL, { method POST, body URLSearchParams, mode no-cors }).
 * Admin paneli: action=adminList / adminApprove / adminReject (+ adminKey).
 */
function doPost(e) {
  const p = (e && e.parameter) || {};

  // Public durum sorgusu (anahtar gerektirmez): düzeltme linki açılışında kullanılır.
  const action = String(p.action || '').trim();
  if (action === 'refDurum') {
    return refDurumPublicYaniti_(p);
  }

  // Public gönderim durum sorgusu (kilitsiz, anahtar gerektirmez): ağ hatası
  // sonrası istemci "kaydım işlendi mi?" diye sorar. Eski dağıtımlarda bu action
  // admin router'a düşüp {ok:false} döner; istemci bunu bulunamadı sayar.
  if (action === 'basvuruDurum') {
    const subId = kongreSubmissionIdTemizle_(p.submissionId);
    const st = subId ? getKongreSubmissionState_(subId) : null;
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, found: !!st, result: st ? String(st.result || 'ok') : null })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Admin API (kongre yönetim paneli)
  if (action) {
    return adminApiYonlendir_(action, p);
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return ContentService.createTextOutput('busy').setMimeType(ContentService.MimeType.TEXT);
  }
  try {
    const anahtar = String(AYARLAR.WEB_GONDERIM_ANAHTARI || '').trim();
    if (anahtar.length && p.token !== anahtar) {
      return ContentService.createTextOutput('unauthorized').setMimeType(
        ContentService.MimeType.TEXT
      );
    }
    // Dedup: aynı submissionId daha önce başarıyla işlendiyse hiçbir şeyi
    // yeniden çalıştırma; saklanan sonucu (ok / already-approved) aynen döndür.
    const kongreSubId = kongreSubmissionIdTemizle_(p.submissionId);
    if (kongreSubId) {
      const oncekiSonuc = getKongreSubmissionState_(kongreSubId);
      if (oncekiSonuc) {
        return ContentService.createTextOutput(String(oncekiSonuc.result || 'ok')).setMimeType(
          ContentService.MimeType.TEXT
        );
      }
    }
    const data = webParametrelerindenVeri_(p);
    if (!data.email || !data.ad || !data.soyad) {
      return ContentService.createTextOutput('invalid').setMimeType(
        ContentService.MimeType.TEXT
      );
    }
    // Düzeltme (revizyon) başvurusu: ret mailindeki bağlantıdan gelen ref ile
    // mevcut satır ve Drive klasörü YERİNDE güncellenir; yeni kayıt açılmaz.
    const duzeltmeRefRaw = String(p.duzeltmeRef || '').trim();
    const duzeltmeRef = /^WT-\d{8}-\d{6}(-\d+)?$/.test(duzeltmeRefRaw) ? duzeltmeRefRaw : '';
    const basvuruSh = getBasvuruSheet_();
    let revizyonRow = 0;
    if (basvuruSh) {
      if (duzeltmeRef) revizyonRow = adminRefIleSatirBul_(basvuruSh, duzeltmeRef);
      if (!revizyonRow) revizyonRow = reddedilmisEslesmeBul_(basvuruSh, data);
    }

    if (revizyonRow) {
      // Onaylanmış başvuru yeniden gönderilemez: stale düzeltme linki onaylı kaydı
      // Beklemede'ye döndürmesin, kabul PDF'i silinmesin.
      const mevcutDurum = String(
        basvuruSh.getRange(revizyonRow, SUTUN_EK.DURUM).getValue() || ''
      ).trim();
      if (mevcutDurum === DURUM_ONAYLANDI) {
        if (kongreSubId) setKongreSubmissionState_(kongreSubId, 'already-approved');
        return ContentService.createTextOutput('already-approved').setMimeType(
          ContentService.MimeType.TEXT
        );
      }
      const sonuc = basvuruRevizyonuUygula_(basvuruSh, revizyonRow, data);
      katilimciMailGonder(data, sonuc.klasorUrl);
      data.duzeltmeBilgi = sonuc.ref + ' (Rev ' + sonuc.revizyon + ')';
      adminMailGonder(data, sonuc.klasorUrl, 0);
      if (kongreSubId) setKongreSubmissionState_(kongreSubId, 'ok');
      return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
    }

    const klasorUrl = klasorOlustur(data);
    katilimciMailGonder(data, klasorUrl);
    adminMailGonder(data, klasorUrl, 0);
    basvuruListesineEkle_(data, klasorUrl, 'Web');
    if (kongreSubId) setKongreSubmissionState_(kongreSubId, 'ok');
    return ContentService.createTextOutput('ok').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    console.error(err);
    try {
      MailApp.sendEmail(
        AYARLAR.ADMIN_EMAIL,
        'Kongre Web POST hatasi',
        String(err) + '\n' + (err.stack || '')
      );
    } catch (ignore) {}
    return ContentService.createTextOutput('error').setMimeType(ContentService.MimeType.TEXT);
  } finally {
    lock.releaseLock();
  }
}

// ============================================================
// ANA FONKSİYON — Form gönderildiğinde tetiklenir
// ============================================================
function onFormSubmit(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    console.warn('onFormSubmit: kilit alınamadı');
    return;
  }
  try {
    if (!e || !e.range) {
      console.warn('onFormSubmit: olay veya aralık yok');
      return;
    }
    const sheet = e.range.getSheet();
    const row = e.range.getRow();
    if (row < 2) return;

    const data = getRowData(sheet, row);

    const klasorUrl = klasorOlustur(data);

    katilimciMailGonder(data, klasorUrl);

    adminMailGonder(data, klasorUrl, row);

    // Kanonik başvuru tablosu farklı bir dosyaysa tam satırı oraya ekle;
    // formun bağlı olduğu sayfada yalnızca işlendi işareti kalır.
    const basvuruSheetId = String(AYARLAR.BASVURU_SHEET_ID || '').trim();
    const eventSsId = sheet.getParent().getId();
    if (!basvuruSheetId || eventSsId === basvuruSheetId) {
      durumSutunlariniYaz_(sheet, row, data, klasorUrl, 'Form/Sheets');
    } else {
      sheet.getRange(row, SUTUN_EK.ISLENDI).setValue('✅ İşlendi');
      sheet.getRange(row, SUTUN_EK.KLASOR_URL).setValue(String(klasorUrl || ''));
      basvuruListesineEkle_(data, klasorUrl, 'Form/Sheets');
    }

    console.log('✅ Başvuru işlendi: ' + data.adSoyad);
  } catch (err) {
    console.error('❌ Hata: ' + err.toString());
    MailApp.sendEmail(
      AYARLAR.ADMIN_EMAIL,
      '⚠️ Kongre Başvuru Hatası',
      'Bir başvuru işlenirken hata oluştu:\n\n' + err.toString()
    );
  } finally {
    lock.releaseLock();
  }
}

// ============================================================
// YARDIMCI: Satırdan veri oku
// ============================================================
function getRowData(sheet, row) {
  const values = sheet.getRange(row, 1, 1, 25).getValues()[0];
  const get = function (col) {
    var v = values[col - 1];
    return v == null || v === '' ? '' : v;
  };

  return {
    timestamp: get(SUTUN.TIMESTAMP),
    unvan: get(SUTUN.UNVAN),
    ad: get(SUTUN.AD),
    soyad: get(SUTUN.SOYAD),
    adSoyad: [resolveUnvanForBelge_(get(SUTUN.UNVAN), false), get(SUTUN.AD), get(SUTUN.SOYAD)]
      .filter(Boolean)
      .join(' ')
      .trim(),
    universite: get(SUTUN.UNIVERSITE),
    fakulte: get(SUTUN.FAKULTE),
    bolum: get(SUTUN.BOLUM),
    orcid: get(SUTUN.ORCID),
    email: get(SUTUN.EMAIL),
    telefon: get(SUTUN.TELEFON),
    sehir: get(SUTUN.SEHIR),
    ulke: get(SUTUN.ULKE),
    bilimAlani: get(SUTUN.BILIM_ALANI),
    katilimSekli: '',
    yayinTercihi: get(SUTUN.YAYIN_TERCIHI),
    baslikTr: get(SUTUN.BASLIK_TR),
    ozetTr: get(SUTUN.OZET_TR),
    keywordsTr: get(SUTUN.KEYWORDS_TR),
    jel: get(SUTUN.JEL),
    tezNotu: get(SUTUN.TEZ_NOTU),
    baslikEn: get(SUTUN.BASLIK_EN),
    ozetEn: get(SUTUN.OZET_EN),
    keywordsEn: get(SUTUN.KEYWORDS_EN),
    formLocale: 'tr',
    klasorAdi: klasorAdiOlustur_(
      get(SUTUN.UNVAN),
      get(SUTUN.AD),
      get(SUTUN.SOYAD)
    ),
  };
}

// ============================================================
// YARDIMCI: Geçici Google Doc gövdesine başvuru + kabul taslağı yazar
// DocumentApp boş metin paragrafı / hücre kabul etmez.
// ============================================================
function docHucreMetni_(v) {
  const s = String(v == null ? '' : v).trim();
  return s.length ? s : '—';
}

function docParagraf_(body, metin) {
  const s = String(metin == null ? '' : metin);
  body.appendParagraph(s.length ? s : '—');
}

function basvuruDocGovdesiDoldur_(body, data) {
  const localeEn = isEnglishFormLocale_(data);
  body
    .appendParagraph(localeEn ? mailKongreAdi_(true) : String(AYARLAR.KONGRE_ADI || '').trim())
    .setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body
    .appendParagraph(localeEn ? 'CONGRESS APPLICATION' : 'KONGRE BAŞVURU FORMU')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);

  body.appendTable([
    [localeEn ? 'Title' : 'Ünvan', docHucreMetni_(localeEn ? unvanDisplayEn_(data.unvan) : data.unvan)],
    [localeEn ? 'First name' : 'Ad', docHucreMetni_(data.ad)],
    [localeEn ? 'Last name' : 'Soyad', docHucreMetni_(data.soyad)],
    [localeEn ? 'University / Institution' : 'Üniversite / Kurum', docHucreMetni_(data.universite)],
    [localeEn ? 'Faculty' : 'Fakülte / YO / MYO', docHucreMetni_(data.fakulte)],
    [localeEn ? 'Department' : 'Bölüm', docHucreMetni_(data.bolum)],
    ['ORCID ID', docHucreMetni_(data.orcid)],
    [localeEn ? 'Email' : 'E-posta', docHucreMetni_(data.email)],
    [localeEn ? 'Phone' : 'Telefon', docHucreMetni_(telefonTabloDisplay_(data.telefon, localeEn))],
    [localeEn ? 'City' : 'Şehir', docHucreMetni_(data.sehir)],
    [localeEn ? 'Country' : 'Ülke', docHucreMetni_(data.ulke)],
    [
      localeEn ? 'Scientific field' : 'Bilim Alanı',
      docHucreMetni_(localeEn ? bilimAlaniDisplayEn_(data.bilimAlani) : data.bilimAlani),
    ],
    [
      localeEn ? 'Participation type' : 'Katılım Şekli',
      docHucreMetni_(data.katilimSekli),
    ],
    [localeEn ? 'Publication preference' : 'Yayın Tercihi', docHucreMetni_(data.yayinTercihi)],
    [
      localeEn ? 'Submitted at' : 'Başvuru / Zaman damgası',
      data.timestamp
        ? new Date(data.timestamp).toLocaleString(localeEn ? 'en-GB' : 'tr-TR')
        : '—',
    ],
  ]);

  const authors = Array.isArray(data.authors) ? data.authors : [];
  if (authors.length > 0) {
    body
      .appendParagraph(localeEn ? 'All authors' : 'Tüm Yazarlar')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    const rows = [];
    for (let i = 0; i < authors.length; i++) {
      const a = authors[i];
      const adSoyad = authorFullNameLocale_(a, localeEn) || '—';
      const kurum = [a.universite, a.fakulte, a.bolum].filter(Boolean).join(' — ').trim() || '—';
      const telPart = String(a.telefon || '').trim();
      const contact =
        [a.email, telPart ? telefonTabloDisplay_(telPart, localeEn) : '']
          .filter(Boolean)
          .join(' · ')
          .trim() || '—';
      const loc = [a.sehir, a.ulke].filter(Boolean).join(' / ').trim() || '—';
      const orcid = String(a.orcid || '').trim() || '—';
      rows.push([
        (localeEn ? 'Author ' : 'Yazar ') + String(i + 1),
        adSoyad + '\n' + kurum + '\n' + contact + '\n' + loc + '\n' + 'ORCID: ' + orcid,
      ]);
    }
    body.appendTable(rows);
  }

  if (!localeEn) {
    body
      .appendParagraph('Bildiri Başlığı (Türkçe)')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    docParagraf_(body, data.baslikTr);

    body
      .appendParagraph('Özet (Türkçe)')
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
    docParagraf_(body, data.ozetTr);

    docParagraf_(
      body,
      'Anahtar Kelimeler (Türkçe): ' + docHucreMetni_(data.keywordsTr)
    );
  }

  docParagraf_(
    body,
    (localeEn ? 'Thesis note: ' : 'Tez Notu: ') + docHucreMetni_(data.tezNotu)
  );

  body
    .appendParagraph('Paper Title (English)')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  docParagraf_(body, data.baslikEn);

  body
    .appendParagraph('Abstract (English)')
    .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  docParagraf_(body, data.ozetEn);

  docParagraf_(body, 'Keywords (English): ' + docHucreMetni_(data.keywordsEn));
}

// ============================================================
// YARDIMCI: Google Doc → .docx (Drive API v3 export)
// DriveApp.File#getAs(MICROSOFT_WORD) bazı hesaplarda desteklenmiyor; export uç noktası kullanılır.
// ============================================================
function exportDocIdToDocxBlob_(docId) {
  const mime =
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const url =
    'https://www.googleapis.com/drive/v3/files/' +
    encodeURIComponent(docId) +
    '/export?mimeType=' +
    encodeURIComponent(mime);
  const resp = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  });
  const code = resp.getResponseCode();
  if (code !== 200) {
    throw new Error(
      'DOCX export başarısız (HTTP ' +
        code +
        '): ' +
        resp.getContentText().substring(0, 400)
    );
  }
  return resp.getBlob();
}

function escapeDocsReplacement_(s) {
  return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/\$/g, '$$$$');
}

function escapeRegexLiteral_(s) {
  return String(s == null ? '' : s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Birleşik Unicode (NFC); kopyala-yapıştır kaynaklı karakter farklarını azaltır. */
function nfcMetin_(s) {
  const t = String(s == null ? '' : s);
  if (!t.length) return t;
  try {
    if (typeof t.normalize === 'function') return t.normalize('NFC');
  } catch (ignore) {}
  return t;
}

/** AYARLAR.KABUL_MEKTUBU_YAZI_TIPI veya boşsa Carlito (Türkçe glif + PDF tutarlılığı). */
function kabulMektubuYaziTipiAilesi_() {
  const s = String((AYARLAR && AYARLAR.KABUL_MEKTUBU_YAZI_TIPI) || '').trim();
  return s.length ? s : 'Carlito';
}

/**
 * TEXT içinde öznitelik dilimlerine göre yazı tipi ailesini günceller; italik/kalın vb. korunur.
 */
function docTextYaziTipiOznitelikDilimlerindeUygula_(text, fontFamily) {
  const fam = String(fontFamily || '').trim();
  if (!text || !fam) return;
  const str = text.getText();
  const len = str ? str.length : 0;
  if (!len) return;
  let idx;
  try {
    idx = text.getAttributeIndices();
  } catch (ignore) {
    try {
      text.setFontFamily(fam);
    } catch (ignore2) {}
    return;
  }
  if (!idx || idx.length === 0) {
    try {
      text.setFontFamily(fam);
    } catch (ignore3) {}
    return;
  }
  for (let k = 0; k < idx.length; k++) {
    const start = idx[k];
    const end = k + 1 < idx.length ? idx[k + 1] : len;
    if (start >= end) continue;
    let attrs;
    try {
      attrs = text.getAttributes(start);
    } catch (ignoreA) {
      continue;
    }
    if (!attrs) continue;
    attrs[DocumentApp.Attribute.FONT_FAMILY] = fam;
    try {
      text.setAttributes(start, end, attrs);
    } catch (ignoreB) {}
  }
}

/**
 * Paragraf / liste öğesi içindeki TEXT koşularına yazı tipi uygular (kalın/italik korunur).
 */
function docParagrafBenzeriMetneYaziTipi_(p, fontFamily) {
  const fam = String(fontFamily || '').trim();
  if (!p || !fam) return;
  const m = p.getNumChildren();
  for (let j = 0; j < m; j++) {
    const ch = p.getChild(j);
    if (ch.getType() === DocumentApp.ElementType.TEXT) {
      const tx = ch.asText();
      if (tx.getText().length > 0) docTextYaziTipiOznitelikDilimlerindeUygula_(tx, fam);
    }
  }
}

/**
 * Gövde, tablo hücreleri vb. içinde paragraf/liste/tabloları dolaşır.
 * İmza metni şablonda altbilgideyse kabulMektubuDocTumMetneYaziTipiUygula_ footer’ı da kapsar;
 * Drive şablonunda tüm blokları AYARLAR.KABUL_MEKTUBU_YAZI_TIPI (örn. Carlito) ile gözden geçirmek PDF çıktısını stabilize eder.
 */
function docKapsayiciMetneYaziTipi_(container, fontFamily) {
  const fam = String(fontFamily || '').trim();
  if (!container || !fam) return;
  const n = container.getNumChildren();
  for (let i = 0; i < n; i++) {
    const el = container.getChild(i);
    const type = el.getType();
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      docParagrafBenzeriMetneYaziTipi_(el.asParagraph(), fam);
    } else if (type === DocumentApp.ElementType.LIST_ITEM) {
      docParagrafBenzeriMetneYaziTipi_(el.asListItem(), fam);
    } else if (type === DocumentApp.ElementType.TABLE) {
      const tbl = el.asTable();
      for (let r = 0; r < tbl.getNumRows(); r++) {
        const row = tbl.getRow(r);
        for (let c = 0; c < row.getNumCells(); c++) {
          docKapsayiciMetneYaziTipi_(row.getCell(c), fam);
        }
      }
    }
  }
}

/** Kabul şablonu: gövde + varsa üstbilgi/altbilgi; yazı tipi AYARLAR.KABUL_MEKTUBU_YAZI_TIPI veya fontFamily argümanı. */
function kabulMektubuDocTumMetneYaziTipiUygula_(doc, fontFamily) {
  let fam = String(fontFamily || '').trim();
  if (!fam) fam = kabulMektubuYaziTipiAilesi_();
  if (!doc || !fam) return;
  docKapsayiciMetneYaziTipi_(doc.getBody(), fam);
  try {
    const h = doc.getHeader();
    if (h) docKapsayiciMetneYaziTipi_(h, fam);
  } catch (ignoreH) {}
  try {
    const f = doc.getFooter();
    if (f) docKapsayiciMetneYaziTipi_(f, fam);
  } catch (ignoreF) {}
}

/**
 * Şablonda italik + Calibri benzeri fontlarda ş/İ/ü PDF’de bozulabiliyor.
 * Carlito uygulandıktan sonra italik kaldırılır; Türkçe glifler tutarlı kalır.
 */
function docTextItalicKaldir_(text) {
  if (!text) return;
  const str = text.getText();
  const len = str ? str.length : 0;
  if (!len) return;
  let idx;
  try {
    idx = text.getAttributeIndices();
  } catch (ignore) {
    try {
      text.setItalic(0, len - 1, false);
    } catch (ignore2) {}
    return;
  }
  if (!idx || idx.length === 0) {
    try {
      text.setItalic(0, len - 1, false);
    } catch (ignore3) {}
    return;
  }
  for (let k = 0; k < idx.length; k++) {
    const start = idx[k];
    const end = k + 1 < idx.length ? idx[k + 1] : len;
    if (start >= end) continue;
    try {
      text.setItalic(start, end - 1, false);
    } catch (ignoreB) {}
  }
}

function docParagrafBenzeriItalicKaldir_(p) {
  if (!p) return;
  const m = p.getNumChildren();
  for (let j = 0; j < m; j++) {
    const ch = p.getChild(j);
    if (ch.getType() === DocumentApp.ElementType.TEXT) {
      const tx = ch.asText();
      if (tx.getText().length > 0) docTextItalicKaldir_(tx);
    }
  }
}

function docKapsayiciItalicKaldir_(container) {
  if (!container) return;
  const n = container.getNumChildren();
  for (let i = 0; i < n; i++) {
    const el = container.getChild(i);
    const type = el.getType();
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      docParagrafBenzeriItalicKaldir_(el.asParagraph());
    } else if (type === DocumentApp.ElementType.LIST_ITEM) {
      docParagrafBenzeriItalicKaldir_(el.asListItem());
    } else if (type === DocumentApp.ElementType.TABLE) {
      const tbl = el.asTable();
      for (let r = 0; r < tbl.getNumRows(); r++) {
        const row = tbl.getRow(r);
        for (let c = 0; c < row.getNumCells(); c++) {
          docKapsayiciItalicKaldir_(row.getCell(c));
        }
      }
    }
  }
}

function kabulMektubuDocItalicKaldir_(doc) {
  if (!doc) return;
  docKapsayiciItalicKaldir_(doc.getBody());
  try {
    const h = doc.getHeader();
    if (h) docKapsayiciItalicKaldir_(h);
  } catch (ignoreH) {}
  try {
    const f = doc.getFooter();
    if (f) docKapsayiciItalicKaldir_(f);
  } catch (ignoreF) {}
}

/** Yer tutucu değişimi: gövde + üstbilgi + altbilgi. */
function kabulMektubuDocReplaceText_(doc, pattern, replacement) {
  if (!doc) return;
  const p = escapeRegexLiteral_(pattern);
  const r = escapeDocsReplacement_(replacement);
  doc.getBody().replaceText(p, r);
  try {
    const h = doc.getHeader();
    if (h) h.replaceText(p, r);
  } catch (ignoreH) {}
  try {
    const f = doc.getFooter();
    if (f) f.replaceText(p, r);
  } catch (ignoreF) {}
}

function kabulMektubuYerTutuculari_(data) {
  const tz = Session.getScriptTimeZone() || 'Europe/Istanbul';
  // Belge onay anında üretildiği için tarih = onay günü.
  const tarih = Utilities.formatDate(new Date(), tz, 'dd.MM.yyyy');
  const authors = Array.isArray(data && data.authors) ? data.authors : [];
  const en = isEnglishFormLocale_(data);
  const bildiri = nfcMetin_(docHucreMetni_(paperTitleForLocale_(data)));

  if (authors.length > 1) {
    const allNames = authorsToKabulMektubuHitap_(authors, en);
    return {
      '{tarih}': nfcMetin_(tarih),
      '{unvan}': nfcMetin_(docHucreMetni_(allNames)),
      '{isim}': '',
      '{soyisim}': '',
      '{bildiri_basligi}': bildiri,
    };
  }

  const primary =
    authors.length > 0
      ? authors[0]
      : {
          unvan: data && data.unvan,
          ad: data && data.ad,
          soyad: data && data.soyad,
        };
  const unvanVal = resolveUnvanForBelge_(primary && primary.unvan, en);
  const isimVal = String(primary.ad || '').trim();
  const soyisimVal = soyadBuyukHarf_(primary.soyad, en);

  return {
    '{tarih}': nfcMetin_(tarih),
    '{unvan}': nfcMetin_(unvanVal),
    '{isim}': nfcMetin_(isimVal),
    '{soyisim}': nfcMetin_(soyisimVal),
    '{bildiri_basligi}': bildiri,
  };
}

function kabulMektubuPdfOlusturVeKaydet_(klasor, data) {
  const en = isEnglishFormLocale_(data);
  const enId = String((AYARLAR && AYARLAR.KABUL_MEKTUBU_SABLON_DOC_ID_EN) || '').trim();
  const trId = String((AYARLAR && AYARLAR.KABUL_MEKTUBU_SABLON_DOC_ID) || '').trim();
  const templateId = en && enId ? enId : trId;
  if (!templateId) {
    console.warn(
      'Kabul mektubu şablon ID boş: AYARLAR.KABUL_MEKTUBU_SABLON_DOC_ID' +
        (en ? ' veya EN başvurular için KABUL_MEKTUBU_SABLON_DOC_ID_EN' : '')
    );
    return '';
  }

  const tmpTitle = '_tmp_kabul_' + Utilities.getUuid();
  let copy = null;
  try {
    const templateFile = DriveApp.getFileById(templateId);
    copy = templateFile.makeCopy(tmpTitle);

    const doc = DocumentApp.openById(copy.getId());
    const map = kabulMektubuYerTutuculari_(data);
    Object.keys(map).forEach(function (k) {
      kabulMektubuDocReplaceText_(doc, k, map[k]);
    });
    // Şablonda sonda ";" varken eski sürümlerde {unvan} değerine ek ";" gelmişse "; ;" / ";;" kalır
    try {
      kabulMektubuDocReplaceText_(doc, ';\\s*;', ';');
    } catch (ignoreSemi) {}
    if (en) {
      try {
        kabulMektubuDocReplaceText_(doc, 'Dear;', 'Dear,');
      } catch (ignoreDear) {}
    }
    kabulMektubuDocTumMetneYaziTipiUygula_(doc);
    kabulMektubuDocItalicKaldir_(doc);
    doc.saveAndClose();

    const pdfBlob = copy.getAs(MimeType.PDF);
    const pdfAdi = 'KABUL_MEKTUBU_' + data.klasorAdi + '.pdf';
    const f = klasor.createFile(pdfBlob).setName(pdfAdi);
    return f.getId();
  } catch (err) {
    const msg =
      'Kabul mektubu PDF üretilemedi.\n\n' +
      'Hata: ' +
      String(err) +
      '\n\n' +
      'Katılımcı: ' +
      String(data.adSoyad || '') +
      '\n' +
      'E-posta: ' +
      String(data.email || '') +
      '\n' +
      'Şablon ID: ' +
      templateId +
      '\n' +
      'Hedef klasör: ' +
      (klasor && klasor.getUrl ? klasor.getUrl() : '(bilinmiyor)') +
      '\n\n' +
      (err && err.stack ? String(err.stack) : '');
    console.error(msg);
    try {
      MailApp.sendEmail(AYARLAR.ADMIN_EMAIL, '⚠️ Kabul mektubu PDF hatası', msg);
    } catch (ignore) {}
    return '';
  } finally {
    if (copy) {
      try {
        copy.setTrashed(true);
      } catch (ignore) {}
    }
  }
}

// ============================================================
// YARDIMCI: Drive klasörü + tek .docx (geçici Google Doc DOCX’e dönüştürülür)
// ============================================================
/** Klasördeki eski Basvuru_*.docx dosyalarını çöpe atıp yenisini üretir (revizyon paylaşır). */
function basvuruDocxYazVeEskisiniSil_(klasor, data) {
  try {
    const files = klasor.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      if (String(f.getName() || '').indexOf('Basvuru_') === 0) {
        try {
          f.setTrashed(true);
        } catch (ignore) {}
      }
    }
  } catch (ignore) {}

  const tmpTitle = '_tmp_basvuru_' + Utilities.getUuid();
  const doc = DocumentApp.create(tmpTitle);
  basvuruDocGovdesiDoldur_(doc.getBody(), data);
  doc.saveAndClose();

  const docId = doc.getId();
  const tmpFile = DriveApp.getFileById(docId);
  let docxBlob;
  try {
    docxBlob = tmpFile.getAs(MimeType.MICROSOFT_WORD);
  } catch (ignore) {
    docxBlob = exportDocIdToDocxBlob_(docId);
  }
  const docxAdi = 'Basvuru_' + data.klasorAdi + '.docx';
  klasor.createFile(docxBlob).setName(docxAdi);
  tmpFile.setTrashed(true);
}

function klasorOlustur(data) {
  const anaKlasor = DriveApp.getFolderById(AYARLAR.ANA_KLASOR_ID);
  const klasor = anaKlasor.createFolder(data.klasorAdi);
  basvuruDocxYazVeEskisiniSil_(klasor, data);

  // NOT: Kabul mektubu PDF ve sertifika PNG artık burada üretilmez.
  // Hakem kontrolü sonrası admin panelden onay verilince adminApprove_ üretir.

  return klasor.getUrl();
}

// ============================================================
// YARDIMCI: Vercel'deki /api/sertifika ile PNG sertifika üret ve klasöre kaydet
// ============================================================
function sertifikaUnvanIsimMetni_(data) {
  const en = isEnglishFormLocale_(data);
  const authors = Array.isArray(data && data.authors) ? data.authors : [];
  // Sertifikada soyadlar büyük harf (ör. Test KULLANICI).
  if (authors.length) {
    const names = authors
      .map(function (a) { return authorFullNameKabulMektubu_(a, en); })
      .filter(function (x) { return x && String(x).trim().length > 0; });
    if (names.length) return names.join(', ');
  }
  const single = authorFullNameKabulMektubu_(
    { unvan: data && data.unvan, ad: data && data.ad, soyad: data && data.soyad },
    en
  );
  return String(single || '').trim();
}

function sertifikaPngOlusturVeKaydet_(klasor, data) {
  const url = String((AYARLAR && AYARLAR.SERTIFIKA_API_URL) || '').trim();
  if (!url) {
    console.warn('Sertifika API URL boş; PNG üretimi atlandı.');
    return '';
  }
  const token = sertifikaApiTokenResolve_();
  if (!token) {
    console.warn('Sertifika API token boş (Script properties SERTIFIKA_API_TOKEN veya AYARLAR); PNG atlandı.');
    return '';
  }

  const unvanIsim = sertifikaUnvanIsimMetni_(data);
  if (!unvanIsim) {
    console.warn('Sertifika için isim bulunamadı; PNG üretimi atlandı.');
    return '';
  }

  const payload = {
    token: token,
    unvanIsim: unvanIsim,
    baslikTr: String((data && data.baslikTr) || '').trim(),
    baslikEn: String((data && data.baslikEn) || '').trim(),
    formLocale: isEnglishFormLocale_(data) ? 'en' : 'tr',
    congress: 'saglik',
  };

  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
  const code = resp.getResponseCode();
  if (code !== 200) {
    const detay = String(resp.getContentText() || '').substring(0, 200);
    console.warn('Sertifika API yanıtı HTTP ' + code + ' — ' + detay);
    return '';
  }

  const pngAdi = 'SERTIFIKA_' + (data.klasorAdi || 'Sertifika') + '.png';
  const blob = resp.getBlob().setName(pngAdi);
  return klasor.createFile(blob).getId();
}

// ============================================================
// YARDIMCI: HTML e-posta kaçışı ve bloklar
// ============================================================
var MAIL_FONT_STACK_ =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function kisaMetin_(s, maxLen) {
  const t = String(s == null ? '' : s);
  if (t.length <= maxLen) return t;
  return t.substring(0, maxLen) + '…';
}

/** Başvuru referansı: zaman damgasından WT-YYYYMMDD-HHMMSS (ek DB yok). */
function mailBasvuruReferans_(dateOrTimestamp) {
  var d = dateOrTimestamp;
  if (d == null || d === '') d = new Date();
  if (!(d instanceof Date)) {
    try {
      d = new Date(d);
    } catch (ignore) {
      d = new Date();
    }
  }
  if (isNaN(d.getTime())) d = new Date();
  var tz = Session.getScriptTimeZone() || 'Europe/Istanbul';
  var ymd = Utilities.formatDate(d, tz, 'yyyyMMdd');
  var hms = Utilities.formatDate(d, tz, 'HHmmss');
  return 'WT-' + ymd + '-' + hms;
}

function mailWrapperOuter_(cardIcerikSatirlari) {
  return (
    '<!DOCTYPE html><html><head><meta charset="UTF-8"></head>' +
    '<body style="margin:0;padding:0;background:#f5f8ff;font-family:' +
    MAIL_FONT_STACK_ +
    ';color:#333333;line-height:1.55">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f8ff">' +
    '<tr><td align="center" style="padding:24px 12px">' +
    '<table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;background:#ffffff;border:1px solid #d7e4f5;border-collapse:separate">' +
    cardIcerikSatirlari +
    '</table></td></tr></table></body></html>'
  );
}

function mailFooterHtml_(en) {
  const enUi = en === true;
  const adminMail = escapeHtml_(AYARLAR.ADMIN_EMAIL);
  const tel = escapeHtml_(telefonFooterDisplay_(enUi));
  const site = String(AYARLAR.KONGRE_WEB_URL || '').trim();
  let siteRow = '';
  if (site) {
    const href = /^https?:\/\//i.test(site) ? site : 'https://' + site;
    const linkLabel = enUi ? 'Congress website' : 'Kongre web sitesi';
    siteRow =
      '<p style="margin:0 0 10px;font-size:13px;line-height:1.6">' +
      '<a href="' +
      escapeHtml_(href) +
      '" style="color:#0072BC;text-decoration:none;font-weight:600">' +
      escapeHtml_(linkLabel) +
      '</a></p>';
  }
  const disclaimer = enUi
    ? 'This message is for information only; you do not need to reply. Official acceptance and outcome notices are sent separately.'
    : 'Bu ileti bilgilendirme amaçlıdır; yanıtlamanız gerekmez. Resmî kabul ve sonuç bildirimleri ayrıca iletilir.';
  return (
    '<tr><td style="padding:0;background:#f5f8ff;border-top:1px solid #d7e4f5">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
    '<tr><td style="padding:20px 24px;font-size:13px;line-height:1.6;color:#333333;text-align:center">' +
    '<p style="margin:0 0 8px;font-size:13px">' +
    '<a href="mailto:' +
    adminMail +
    '" style="color:#0072BC;text-decoration:none;font-weight:600">' +
    adminMail +
    '</a>' +
    ' <span style="color:#aac0d8">&middot;</span> ' +
    '<span style="color:#333333">' +
    tel +
    '</span></p>' +
    siteRow +
    '<p style="margin:12px 0 0;font-size:11px;color:#5a6e88;line-height:1.55">' +
    escapeHtml_(disclaimer) +
    '</p></td></tr></table></td></tr>'
  );
}

function mailLogoHtml_() {
  const u = String(AYARLAR.LOGO_URL || '').trim();
  if (!u) return '';
  return (
    '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 18px">' +
    '<tr><td style="background:#ffffff;border-radius:14px;padding:14px 22px;text-align:center">' +
    '<img src="' +
    escapeHtml_(u) +
    '" width="200" alt="WriteTec" style="display:block;max-width:200px;width:100%;height:auto;border:0;line-height:0" />' +
    '</td></tr></table>'
  );
}

function mailUstMarkaHtml_(baslikSatir, en) {
  const enUi = en === true;
  const logo = mailLogoHtml_();
  const kt = String(mailKongreTarihiRozet_(enUi) || '').trim();
  const badge =
    kt.length > 0
      ? '<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:14px auto 0"><tr><td style="background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.28);border-radius:999px;padding:7px 16px;font-size:12px;color:#e8f6ff;font-weight:600;letter-spacing:0.02em">' +
        escapeHtml_(kt) +
        '</td></tr></table>'
      : '';
  return (
    '<tr><td style="padding:0">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(180deg,#0d2340 0%,#003366 52%,#0d2340 100%)">' +
    '<tr><td style="padding:28px 24px 26px;font-family:' +
    MAIL_FONT_STACK_ +
    '">' +
    logo +
    '<p style="color:#ffffff;margin:0;font-size:19px;font-weight:600;letter-spacing:0.02em;line-height:1.35;text-align:center">' +
    escapeHtml_(baslikSatir) +
    '</p>' +
    '<p style="color:rgba(255,255,255,0.9);margin:12px 0 0;font-size:13px;line-height:1.55;text-align:center">' +
    escapeHtml_(mailKongreAdi_(enUi)) +
    '</p>' +
    badge +
    '</td></tr></table></td></tr>'
  );
}

function mailTabloSatir_(etiket, deger, acikArka, sonSatir) {
  var son = sonSatir === true;
  const bg = acikArka ? '#f5f8ff' : '#ffffff';
  const bottom = son ? 'border-bottom:none' : 'border-bottom:1px solid #e3ebf7';
  const val = String(deger == null ? '' : deger);
  return (
    '<tr style="background:' +
    bg +
    '">' +
    '<td style="padding:12px 14px;color:#003366;width:36%;vertical-align:top;' +
    bottom +
    ';font-size:13px;font-weight:600;font-family:' +
    MAIL_FONT_STACK_ +
    '">' +
    escapeHtml_(etiket) +
    '</td>' +
    '<td style="padding:12px 14px;color:#333333;vertical-align:top;' +
    bottom +
    ';font-size:13px;line-height:1.55;font-family:' +
    MAIL_FONT_STACK_ +
    '">' +
    escapeHtml_(val) +
    '</td>' +
    '</tr>'
  );
}

function dataForAuthor_(baseData, author) {
  const a = author || {};
  const unvan = String(a.unvan || baseData.unvan || '').trim();
  const ad = String(a.ad || baseData.ad || '').trim();
  const soyad = String(a.soyad || baseData.soyad || '').trim();
  const universite = String(a.universite || baseData.universite || '').trim();
  const fakulte = String(a.fakulte || baseData.fakulte || '').trim();
  const bolum = String(a.bolum || baseData.bolum || '').trim();
  const orcid = String(a.orcid || baseData.orcid || '').trim();
  const email = String(a.email || baseData.email || '').trim();
  const telefon = String(a.telefon || baseData.telefon || '').trim();
  const sehir = String(a.sehir || baseData.sehir || '').trim();
  const ulke = String(a.ulke || baseData.ulke || '').trim();
  const adSoyad = [resolveUnvanForBelge_(unvan, false), ad, soyad].filter(Boolean).join(' ').trim();

  // baseData'yı kopyalayarak bu yazara özel alanları override ediyoruz.
  const out = {};
  Object.keys(baseData || {}).forEach(function (k) {
    out[k] = baseData[k];
  });
  out.unvan = unvan;
  out.ad = ad;
  out.soyad = soyad;
  out.adSoyad = adSoyad;
  out.universite = universite;
  out.fakulte = fakulte;
  out.bolum = bolum;
  out.orcid = orcid;
  out.email = email;
  out.telefon = telefon;
  out.sehir = sehir;
  out.ulke = ulke;
  return out;
}

// ============================================================
// YARDIMCI: Katılımcıya mail
// ============================================================
function katilimciMailGonder(data, klasorUrl) {
  const en = isEnglishFormLocale_(data);
  const konu = en
    ? 'Application received — ' + mailKongreAdi_(true)
    : 'Başvurunuz alındı — ' + mailKongreAdi_(false);
  const ts = data.timestamp ? new Date(data.timestamp) : new Date();
  const tarih = ts.toLocaleString(en ? 'en-GB' : 'tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const ref = mailBasvuruReferans_(ts);

  const authors = Array.isArray(data && data.authors) ? data.authors : [];
  const recipients = uniqueAuthorEmails_(authors);
  if (!recipients.length) recipients.push(String(data.email || '').trim().toLowerCase());

  for (let r = 0; r < recipients.length; r++) {
    const to = String(recipients[r] || '').trim();
    if (!to) continue;

    let authorObj = null;
    for (let i = 0; i < authors.length; i++) {
      const em = String(authors[i] && authors[i].email ? authors[i].email : '')
        .trim()
        .toLowerCase();
      if (em && em === to) {
        authorObj = authors[i];
        break;
      }
    }

    const d = dataForAuthor_(data, authorObj || {});

    const kurumParca = [d.universite, d.fakulte, d.bolum]
      .map(function (x) {
        return String(x || '').trim();
      })
      .filter(function (x) {
        return x.length > 0;
      });
    const kurumBloc = kurumParca.length ? kurumParca.join(' — ') : '—';
    const sehirUlke = [d.sehir, d.ulke]
      .map(function (x) {
        return String(x || '').trim();
      })
      .filter(function (x) {
        return x.length > 0;
      })
      .join(' · ');

    var ozetSatirlari = '';
    var satirIx = 0;
    function ek(etiket, deger) {
      ozetSatirlari += mailTabloSatir_(etiket, deger, satirIx % 2 === 0, false);
      satirIx++;
    }
    ek(en ? 'Reference' : 'Başvuru referansı', ref);
    if (Array.isArray(d.authors) && d.authors.length > 0) {
      ek(en ? 'Number of authors' : 'Yazar sayısı', String(d.authors.length));
    }
    ek(en ? 'Academic title' : 'Ünvan', en ? unvanDisplayEn_(d.unvan) || '—' : d.unvan || '—');
    if (en) {
      ek('Paper title', kisaMetin_(d.baslikEn || d.baslikTr || '—', 160));
    } else {
      ek('Bildiri başlığı (TR)', d.baslikTr || '—');
      if (String(d.baslikEn || '').trim().length > 0) {
        ek('Bildiri başlığı (EN)', kisaMetin_(d.baslikEn, 140));
      }
    }
    ek(en ? 'Scientific field' : 'Bilim alanı', en ? bilimAlaniDisplayEn_(d.bilimAlani) || '—' : d.bilimAlani || '—');
    if (String(d.katilimSekli || '').trim()) {
      ek(en ? 'Participation type' : 'Katılım şekli', d.katilimSekli);
    }
    ek(en ? 'Institution' : 'Kurum / fakülte / bölüm', kurumBloc);
    ek(en ? 'City / country' : 'Şehir / ülke', sehirUlke || '—');
    if (String(d.orcid || '').trim().length > 0) {
      ek('ORCID', String(d.orcid).trim());
    }
    if (en) {
      ek('Keywords', kisaMetin_(d.keywordsEn || '—', 100));
    } else {
      ek('Anahtar kelimeler (TR)', kisaMetin_(d.keywordsTr || '—', 100));
    }
    ek(en ? 'Publication preference' : 'Yayın tercihi', d.yayinTercihi || '—');
    ek(en ? 'Email' : 'E-posta (yazar)', d.email || '—');
    ek(en ? 'Phone' : 'Telefon (yazar)', telefonTabloDisplay_(d.telefon, en));
    ozetSatirlari += mailTabloSatir_(
      en ? 'Submitted at' : 'Başvuru zamanı',
      tarih,
      satirIx % 2 === 0,
      true
    );

    const govdeIc = en
      ? '<tr><td style="padding:28px 24px 24px;border-left:1px solid #d7e4f5;border-right:1px solid #d7e4f5;font-family:' +
        MAIL_FONT_STACK_ +
        '">' +
        '<p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#333333">Dear <strong>' +
        escapeHtml_(authorFullNameLocale_(d, true)) +
        '</strong>,</p>' +
        '<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#333333">' +
        '<strong>Your application has been received.</strong> Your abstract and the information you provided have been sent for review.' +
        '</p>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#f5f8ff;border:1px solid #d7e4f5;border-radius:10px">' +
        '<tr><td style="padding:14px 18px 14px 16px;border-left:4px solid #00AEEF">' +
        '<p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#003366;letter-spacing:0.03em;text-transform:uppercase">Next steps</p>' +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:1.65;color:#333333;width:100%">' +
        '<tr><td style="padding:4px 8px 4px 0;vertical-align:top;color:#0072BC;font-weight:700;width:22px">1.</td><td style="padding:4px 0">When peer review is complete, you will be notified by <strong>email</strong>.</td></tr>' +
        '<tr><td style="padding:4px 8px 4px 0;vertical-align:top;color:#0072BC;font-weight:700">2.</td><td style="padding:4px 0">If revisions are required, we will contact you at the <strong>email</strong> address provided in the form.</td></tr>' +
        '<tr><td style="padding:4px 8px 4px 0;vertical-align:top;color:#0072BC;font-weight:700">3.</td><td style="padding:4px 0">You will usually hear back within <strong>3 business days</strong> (may vary depending on volume).</td></tr>' +
        '</table></td></tr></table>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d7e4f5;border-radius:10px">' +
        '<tr><td style="padding:18px 16px;background:#ffffff">' +
        '<p style="margin:0 0 14px;font-size:12px;text-transform:uppercase;letter-spacing:0.07em;color:#0072BC;font-weight:700">Application summary</p>' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px;font-family:' +
        MAIL_FONT_STACK_ +
        '">' +
        ozetSatirlari +
        '</table></td></tr></table>' +
        '</td></tr>'
      : '<tr><td style="padding:28px 24px 24px;border-left:1px solid #d7e4f5;border-right:1px solid #d7e4f5;font-family:' +
        MAIL_FONT_STACK_ +
        '">' +
        '<p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#333333">Sayın <strong>' +
        escapeHtml_(String(d.adSoyad || '')) +
        '</strong>,</p>' +
        '<p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#333333">' +
        '<strong>Başvurunuz sistemimize başarıyla bir şekilde kaydedilmiştir.</strong> Bildiri özetiniz ve ilettiğiniz bilgiler değerlendirme sürecine alınmıştır.' +
        '</p>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#f5f8ff;border:1px solid #d7e4f5;border-radius:10px">' +
        '<tr><td style="padding:14px 18px 14px 16px;border-left:4px solid #00AEEF">' +
        '<p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#003366;letter-spacing:0.03em;text-transform:uppercase">Sıradaki adımlar</p>' +
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:1.65;color:#333333;width:100%">' +
        '<tr><td style="padding:4px 8px 4px 0;vertical-align:top;color:#0072BC;font-weight:700;width:22px">1.</td><td style="padding:4px 0">Hakem değerlendirmesi tamamlandığında sonucu size <strong>e-posta</strong> ile bildirilecektir.</td></tr>' +
        '<tr><td style="padding:4px 8px 4px 0;vertical-align:top;color:#0072BC;font-weight:700">2.</td><td style="padding:4px 0">Hakem değerlendirmesine bağlı olarak özetinizle ilgili düzeltme gerekirse başvuru formunda belirttiğiniz <strong>e-posta</strong> adresiniz kanalı ile sizinle iletişime geçilecektir.</td></tr>' +
        '<tr><td style="padding:4px 8px 4px 0;vertical-align:top;color:#0072BC;font-weight:700">3.</td><td style="padding:4px 0">Bilgilendirme için çoğu zaman <strong>en geç 3 iş günü</strong> içinde size geri dönüş sağlanacaktır. (Bu süre yoğunluğa bağlı olarak değişkenlik gösterebilir.)</td></tr>' +
        '</table></td></tr></table>' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #d7e4f5;border-radius:10px">' +
        '<tr><td style="padding:18px 16px;background:#ffffff">' +
        '<p style="margin:0 0 14px;font-size:12px;text-transform:uppercase;letter-spacing:0.07em;color:#0072BC;font-weight:700">Başvuru özeti</p>' +
        '<table style="width:100%;border-collapse:collapse;font-size:13px;font-family:' +
        MAIL_FONT_STACK_ +
        '">' +
        ozetSatirlari +
        '</table></td></tr></table>' +
        '</td></tr>';

    const html = mailWrapperOuter_(
      mailUstMarkaHtml_(mailGonderenAd_(en), en) + govdeIc + mailFooterHtml_(en)
    );

    MailApp.sendEmail({
      to: to,
      subject: konu,
      htmlBody: html,
      name: AYARLAR.GONDEREN_AD,
      replyTo: AYARLAR.ADMIN_EMAIL,
    });
  }
}

// ============================================================
// YARDIMCI: Admin bildirim maili
// ============================================================
function adminMailGonder(data, klasorUrl, row) {
  const baslikKisa = kisaMetin_(
    String(data.baslikTr || '').trim() || String(data.baslikEn || '').trim(),
    48
  );
  const konu =
    (String(data.duzeltmeBilgi || '').trim() ? 'Düzeltilmiş başvuru: ' : 'Yeni başvuru: ') +
    data.adSoyad +
    (baslikKisa ? ' — ' + baslikKisa : '');
  const ozetOnizleme = 320;
  const ozetNot =
    ' (tam metin ve kabul taslağı bölümü Drive’daki .docx dosyasında)';
  const refTs = data.timestamp ? new Date(data.timestamp) : new Date();
  const enSub = isEnglishFormLocale_(data);

  var tablo = '';
  var i = 0;
  function sat(etiket, deger) {
    tablo += mailTabloSatir_(etiket, deger, i % 2 === 0, false);
    i++;
  }
  if (Array.isArray(data.authors) && data.authors.length > 0) {
    const firstNames = data.authors
      .slice(0, 3)
      .map(function (a) {
        return [resolveUnvanForBelge_(a.unvan, false), a.ad, a.soyad].filter(Boolean).join(' ').trim();
      })
      .filter(function (x) {
        return x && String(x).trim().length > 0;
      })
      .join(' · ');
    sat(
      'Yazarlar',
      String(data.authors.length) +
        ' kişi' +
        (firstNames ? ' — ' + firstNames + (data.authors.length > 3 ? ' …' : '') : '')
    );
  }
  sat('Kaynak', row ? 'Google Form / Sheets (satır ' + row + ')' : 'Web sitesi (doPost)');
  if (String(data.duzeltmeBilgi || '').trim()) {
    sat('Düzeltme başvurusu', String(data.duzeltmeBilgi).trim() + ' — mevcut kayıt yerinde güncellendi');
  }
  sat('Başvuru referansı', mailBasvuruReferans_(refTs));
  sat('Form locale', String(data.formLocale || 'tr') + (enSub ? ' (EN başvuru)' : ''));
  sat('Ünvan', data.unvan);
  sat('Ad', data.ad);
  sat('Soyad', data.soyad);
  sat('E-posta', data.email);
  sat('Telefon', data.telefon);
  sat('Üniversite / kurum', data.universite);
  sat('Fakülte / YO / MYO', data.fakulte || '—');
  sat('Bölüm', data.bolum);
  sat('ORCID', data.orcid || '—');
  sat('Şehir', data.sehir);
  sat('Ülke', data.ulke);
  sat('Bilim alanı', data.bilimAlani);
  if (String(data.katilimSekli || '').trim()) {
    sat('Katılım şekli', data.katilimSekli);
  }
  sat('Yayın tercihi', data.yayinTercihi || '—');
  if (String(data.baslikTr || '').trim()) {
    sat('Bildiri başlığı (TR)', data.baslikTr);
    sat(
      'Özet (TR) — önizleme',
      kisaMetin_(data.ozetTr, ozetOnizleme) + ozetNot
    );
    sat('Anahtar kelimeler (TR)', data.keywordsTr || '—');
  }
  sat('Tez notu', data.tezNotu || '—');
  sat('Paper title (EN)', data.baslikEn);
  sat(
    'Abstract (EN) — önizleme',
    kisaMetin_(data.ozetEn, ozetOnizleme) + ozetNot
  );
  tablo += mailTabloSatir_('Keywords (EN)', data.keywordsEn || '—', i % 2 === 0, true);

  const html = mailWrapperOuter_(
    mailUstMarkaHtml_('Yeni kongre başvurusu', false) +
      '<tr><td style="padding:24px 22px 0;border-left:1px solid #d7e4f5;border-right:1px solid #d7e4f5;font-family:' +
      MAIL_FONT_STACK_ +
      '">' +
      '<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#333333">' +
      'Aşağıda başvurunun tam özeti yer almaktadır. Katılımcıya <strong>alındı</strong> bilgilendirmesi gönderilmiştir.' +
      '</p></td></tr>' +
      '<tr><td style="padding:0 22px 24px;border-left:1px solid #d7e4f5;border-right:1px solid #d7e4f5;font-family:' +
      MAIL_FONT_STACK_ +
      '">' +
      '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px;font-family:' +
      MAIL_FONT_STACK_ +
      '">' +
      tablo +
      '</table>' +
      '<p style="margin:0 0 14px;font-size:13px;font-weight:600;color:#003366">Sonraki adımlar (yönetici)</p>' +
      '<ol style="margin:0 0 22px;padding:0 0 0 22px;font-size:13px;line-height:1.65;color:#333333">' +
      '<li style="margin-bottom:6px">Drive klasörünü açıp <strong>Başvuru… .docx</strong> dosyasını kontrol edin.</li>' +
      '<li style="margin-bottom:6px">Gerekirse Word’de düzenleyin; kabul mektubu taslağı dosyanın sonundadır.</li>' +
      '<li>Katılımcıya PDF ekli resmi kabul göndermeden önce metni onaylayın.</li>' +
      '</ol>' +
      '<div style="text-align:center;margin-bottom:8px">' +
      '<a href="' +
      escapeHtml_(klasorUrl) +
      '" style="display:inline-block;background:#0072BC;color:#ffffff !important;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">' +
      'Drive klasörünü aç' +
      '</a></div>' +
      '</td></tr>' +
      mailFooterHtml_(false)
  );

  MailApp.sendEmail({
    to: AYARLAR.ADMIN_EMAIL,
    subject: konu,
    htmlBody: html,
    name: AYARLAR.GONDEREN_AD,
  });
}

// ============================================================
// ADMIN API — Kongre yönetim paneli (hakem kontrolü)
// doPost?action=adminList|adminApprove|adminReject (+adminKey)
// ============================================================
function adminJsonYaniti_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function adminApiYonlendir_(action, p) {
  const anahtar = adminApiAnahtariResolve_();
  if (!anahtar || String(p.adminKey || '') !== anahtar) {
    // Anahtar tanımlı değilse de kapalı kalır (fail closed).
    return adminJsonYaniti_({ ok: false, error: 'unauthorized' });
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return adminJsonYaniti_({ ok: false, error: 'busy' });
  }
  try {
    if (action === 'adminList') {
      return adminJsonYaniti_({ ok: true, basvurular: adminBasvurulariListele_() });
    }
    if (action === 'adminApprove') {
      return adminJsonYaniti_(adminApprove_(String(p.ref || '').trim()));
    }
    if (action === 'adminReject') {
      return adminJsonYaniti_(
        adminReject_(String(p.ref || '').trim(), String(p.duzeltmeNotu || '').trim())
      );
    }
    return adminJsonYaniti_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    console.error('Admin API hatası (' + action + '): ' + (err && err.stack ? err.stack : err));
    return adminJsonYaniti_({
      ok: false,
      error: String(err && err.message ? err.message : err).substring(0, 400),
    });
  } finally {
    lock.releaseLock();
  }
}

/** Satırdan başvuru referansı: kolon doluysa o, boşsa timestamp'ten türetilir (deterministik). */
function adminSatirRef_(values) {
  const kayitli = String(values[SUTUN_EK.BASVURU_REF - 1] || '').trim();
  if (kayitli) return kayitli;
  return mailBasvuruReferans_(values[SUTUN.TIMESTAMP - 1]);
}

/** Satır değerlerinden getRowData şekilli veri nesnesi (yazarlar JSON dahil). */
function adminSatirdanVeri_(values) {
  const get = function (col) {
    const v = values[col - 1];
    return v == null || v === '' ? '' : v;
  };

  let authors = null;
  const rawJson = String(get(SUTUN_EK.AUTHORS_JSON) || '').trim();
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed) && parsed.length) authors = parsed;
    } catch (ignore) {}
  }
  if (!authors) {
    authors = [
      {
        unvan: String(get(SUTUN.UNVAN)).trim(),
        ad: String(get(SUTUN.AD)).trim(),
        soyad: String(get(SUTUN.SOYAD)).trim(),
        universite: String(get(SUTUN.UNIVERSITE)).trim(),
        fakulte: String(get(SUTUN.FAKULTE)).trim(),
        bolum: String(get(SUTUN.BOLUM)).trim(),
        orcid: String(get(SUTUN.ORCID)).trim(),
        email: String(get(SUTUN.EMAIL)).trim(),
        telefon: String(get(SUTUN.TELEFON)).trim(),
        sehir: String(get(SUTUN.SEHIR)).trim(),
        ulke: String(get(SUTUN.ULKE)).trim(),
      },
    ];
  }

  let formLocale = String(get(SUTUN_EK.FORM_LOCALE) || '').trim().toLowerCase();
  if (formLocale !== 'en') {
    formLocale =
      !String(get(SUTUN.BASLIK_TR)).trim() && String(get(SUTUN.BASLIK_EN)).trim() ? 'en' : 'tr';
  }

  return {
    timestamp: get(SUTUN.TIMESTAMP),
    unvan: get(SUTUN.UNVAN),
    ad: get(SUTUN.AD),
    soyad: get(SUTUN.SOYAD),
    adSoyad: [resolveUnvanForBelge_(get(SUTUN.UNVAN), false), get(SUTUN.AD), get(SUTUN.SOYAD)]
      .filter(Boolean)
      .join(' ')
      .trim(),
    universite: get(SUTUN.UNIVERSITE),
    fakulte: get(SUTUN.FAKULTE),
    bolum: get(SUTUN.BOLUM),
    orcid: get(SUTUN.ORCID),
    email: get(SUTUN.EMAIL),
    telefon: get(SUTUN.TELEFON),
    sehir: get(SUTUN.SEHIR),
    ulke: get(SUTUN.ULKE),
    bilimAlani: get(SUTUN.BILIM_ALANI),
    yayinTercihi: get(SUTUN.YAYIN_TERCIHI),
    baslikTr: get(SUTUN.BASLIK_TR),
    ozetTr: get(SUTUN.OZET_TR),
    keywordsTr: get(SUTUN.KEYWORDS_TR),
    jel: get(SUTUN.JEL),
    tezNotu: get(SUTUN.TEZ_NOTU),
    baslikEn: get(SUTUN.BASLIK_EN),
    ozetEn: get(SUTUN.OZET_EN),
    keywordsEn: get(SUTUN.KEYWORDS_EN),
    katilimSekli: String(get(SUTUN_EK.KATILIM_SEKLI) || '').trim(),
    formLocale: formLocale,
    authors: authors,
    authorsText: authorsToCommaNames_(authors),
    klasorAdi:
      klasorAdiOlusturFromAuthors_(authors) ||
      klasorAdiOlustur_(get(SUTUN.UNVAN), get(SUTUN.AD), get(SUTUN.SOYAD)),
  };
}

function adminBasvurulariListele_() {
  const sh = getBasvuruSheet_();
  if (!sh) throw new Error('Başvuru tablosu bulunamadı.');
  ensureBasvuruBasliklari_(sh);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];

  const values = sh.getRange(2, 1, lastRow - 1, SUTUN_EK.KATILIM_SEKLI).getValues();
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    // Tamamen boş satırları atla
    if (!String(v[SUTUN.TIMESTAMP - 1] || '').toString().trim() && !String(v[SUTUN.AD - 1] || '').trim()) {
      continue;
    }
    const data = adminSatirdanVeri_(v);
    const ts = v[SUTUN.TIMESTAMP - 1];
    const kt = v[SUTUN_EK.KARAR_TARIHI - 1];
    out.push({
      ref: adminSatirRef_(v),
      timestamp: ts instanceof Date ? ts.toISOString() : String(ts || ''),
      unvan: String(data.unvan || ''),
      ad: String(data.ad || ''),
      soyad: String(data.soyad || ''),
      adSoyad: data.adSoyad,
      authors: data.authors,
      universite: String(data.universite || ''),
      fakulte: String(data.fakulte || ''),
      bolum: String(data.bolum || ''),
      email: String(data.email || ''),
      telefon: String(data.telefon || ''),
      sehir: String(data.sehir || ''),
      ulke: String(data.ulke || ''),
      bilimAlani: String(data.bilimAlani || ''),
      katilimSekli: String(data.katilimSekli || ''),
      yayinTercihi: String(data.yayinTercihi || ''),
      baslikTr: String(data.baslikTr || ''),
      ozetTr: String(data.ozetTr || ''),
      keywordsTr: String(data.keywordsTr || ''),
      tezNotu: String(data.tezNotu || ''),
      baslikEn: String(data.baslikEn || ''),
      ozetEn: String(data.ozetEn || ''),
      keywordsEn: String(data.keywordsEn || ''),
      formLocale: data.formLocale,
      klasorUrl: String(v[SUTUN_EK.KLASOR_URL - 1] || '').trim(),
      durum: String(v[SUTUN_EK.DURUM - 1] || '').trim() || DURUM_BEKLEMEDE,
      kararTarihi: kt instanceof Date ? kt.toISOString() : String(kt || ''),
      duzeltmeNotu: String(v[SUTUN_EK.DUZELTME_NOTU - 1] || ''),
      revizyon: Number(v[SUTUN_EK.REVIZYON - 1]) || 0,
    });
  }
  return out;
}

/**
 * Public durum sorgusu: verilen WT- ref için yalnızca DURUM'u döndürür.
 * Admin anahtarı gerektirmez; kişisel veri sızdırmaz (yalnızca durum + kabul bool).
 * Düzeltme formu, link açılışında onaylı başvuruda "kabul edildi" ekranı için kullanır.
 */
function refDurumPublicYaniti_(p) {
  const ref = String((p && p.ref) || '').trim();
  if (!/^WT-\d{8}-\d{6}(-\d+)?$/.test(ref)) {
    return adminJsonYaniti_({ ok: false, error: 'invalid_ref' });
  }
  const sh = getBasvuruSheet_();
  const row = sh ? adminRefIleSatirBul_(sh, ref) : 0;
  if (!row) {
    return adminJsonYaniti_({ ok: true, ref: ref, durum: '', bulundu: false, kabul: false });
  }
  const durum =
    String(sh.getRange(row, SUTUN_EK.DURUM).getValue() || '').trim() || DURUM_BEKLEMEDE;
  return adminJsonYaniti_({
    ok: true,
    ref: ref,
    durum: durum,
    bulundu: true,
    kabul: durum === DURUM_ONAYLANDI,
  });
}

/** @return {number} ref ile eşleşen satır numarası; bulunamazsa 0 */
function adminRefIleSatirBul_(sh, ref) {
  const aranan = String(ref || '').trim();
  if (!aranan) return 0;
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return 0;
  const values = sh.getRange(2, 1, lastRow - 1, SUTUN_EK.SERTIFIKA_ID).getValues();
  for (let i = 0; i < values.length; i++) {
    if (adminSatirRef_(values[i]) === aranan) return i + 2;
  }
  return 0;
}

/** Klasör URL'sinden Drive klasörü açar; yoksa/açılamazsa ana klasör altında oluşturur. */
function adminKlasorAcVeyaOlustur_(klasorUrl, data) {
  const m = String(klasorUrl || '').match(/\/folders\/([A-Za-z0-9_-]+)/);
  if (m && m[1]) {
    try {
      return DriveApp.getFolderById(m[1]);
    } catch (ignore) {}
  }
  const anaKlasor = DriveApp.getFolderById(AYARLAR.ANA_KLASOR_ID);
  const it = anaKlasor.getFoldersByName(data.klasorAdi);
  if (it.hasNext()) return it.next();
  return anaKlasor.createFolder(data.klasorAdi);
}

function adminEskiDosyayiSil_(fileId) {
  const id = String(fileId || '').trim();
  if (!id) return;
  try {
    DriveApp.getFileById(id).setTrashed(true);
  } catch (ignore) {}
}

/**
 * ONAY: kabul mektubu PDF + sertifika PNG üretilir, Drive klasörüne konur,
 * kabul maili PDF ekli olarak tüm yazarlara hemen gönderilir, durum güncellenir.
 * Karar değişikliğinde (Reddedildi → Onaylandı) eski dosyalar çöpe atılır.
 */
function adminApprove_(ref) {
  const sh = getBasvuruSheet_();
  if (!sh) throw new Error('Başvuru tablosu bulunamadı.');
  ensureDurumBasliklari_(sh);
  const row = adminRefIleSatirBul_(sh, ref);
  if (!row) throw new Error('Başvuru bulunamadı: ' + ref);

  const values = sh.getRange(row, 1, 1, SUTUN_EK.KATILIM_SEKLI).getValues()[0];
  const data = adminSatirdanVeri_(values);

  let klasorUrl = String(values[SUTUN_EK.KLASOR_URL - 1] || '').trim();
  const klasor = adminKlasorAcVeyaOlustur_(klasorUrl, data);
  klasorUrl = klasor.getUrl();

  // Idempotency: önceki karar dosyalarını çöpe at
  adminEskiDosyayiSil_(values[SUTUN_EK.KABUL_PDF_ID - 1]);
  adminEskiDosyayiSil_(values[SUTUN_EK.SERTIFIKA_ID - 1]);

  const kabulPdfId = kabulMektubuPdfOlusturVeKaydet_(klasor, data);
  if (!kabulPdfId) {
    throw new Error('Kabul mektubu PDF üretilemedi; onay iptal edildi (mail gönderilmedi).');
  }

  let sertifikaId = '';
  try {
    sertifikaId = sertifikaPngOlusturVeKaydet_(klasor, data) || '';
  } catch (sertErr) {
    console.error('Sertifika PNG üretimi başarısız: ' + (sertErr && sertErr.stack ? sertErr.stack : sertErr));
  }

  kabulMailiGonder_(data, klasorUrl, kabulPdfId);

  const simdi = new Date();
  sh.getRange(row, SUTUN_EK.KLASOR_URL).setValue(klasorUrl);
  sh.getRange(row, SUTUN_EK.BASVURU_REF).setValue(ref);
  sh.getRange(row, SUTUN_EK.DURUM).setValue(DURUM_ONAYLANDI);
  sh.getRange(row, SUTUN_EK.KARAR_TARIHI).setValue(simdi);
  sh.getRange(row, SUTUN_EK.KABUL_PDF_ID).setValue(kabulPdfId);
  sh.getRange(row, SUTUN_EK.SERTIFIKA_ID).setValue(sertifikaId);

  return {
    ok: true,
    ref: ref,
    durum: DURUM_ONAYLANDI,
    kararTarihi: simdi.toISOString(),
    klasorUrl: klasorUrl,
    kabulPdfFileId: kabulPdfId,
    sertifikaFileId: sertifikaId,
    sertifikaUyari: sertifikaId ? '' : 'Sertifika PNG üretilemedi (kabul akışı tamamlandı).',
  };
}

/**
 * RET: düzeltme notları şık bir mail şablonuyla tüm yazarlara gönderilir, durum güncellenir.
 */
function adminReject_(ref, duzeltmeNotu) {
  const not = String(duzeltmeNotu || '').trim();
  if (!not) throw new Error('Düzeltme notu boş olamaz.');

  const sh = getBasvuruSheet_();
  if (!sh) throw new Error('Başvuru tablosu bulunamadı.');
  ensureDurumBasliklari_(sh);
  const row = adminRefIleSatirBul_(sh, ref);
  if (!row) throw new Error('Başvuru bulunamadı: ' + ref);

  const values = sh.getRange(row, 1, 1, SUTUN_EK.KATILIM_SEKLI).getValues()[0];
  const data = adminSatirdanVeri_(values);
  const klasorUrl = String(values[SUTUN_EK.KLASOR_URL - 1] || '').trim();

  duzeltmeMailiGonder_(data, not, klasorUrl, ref);

  const simdi = new Date();
  sh.getRange(row, SUTUN_EK.BASVURU_REF).setValue(ref);
  sh.getRange(row, SUTUN_EK.DURUM).setValue(DURUM_REDDEDILDI);
  sh.getRange(row, SUTUN_EK.KARAR_TARIHI).setValue(simdi);
  sh.getRange(row, SUTUN_EK.DUZELTME_NOTU).setValue(not);

  return {
    ok: true,
    ref: ref,
    durum: DURUM_REDDEDILDI,
    kararTarihi: simdi.toISOString(),
    duzeltmeNotu: not,
  };
}

// ============================================================
// DÜZELTME MAİLİ — Hakem değerlendirmesi sonucu revizyon talebi
// ============================================================
/** Ret mailindeki "düzeltilmiş başvuruyu gönder" bağlantısı (?duzeltmeRef=WT-…). */
function duzeltmeFormLinki_(ref) {
  const base = String((AYARLAR && AYARLAR.BASVURU_FORM_URL) || '').trim();
  if (!base) return '';
  return (
    base +
    (base.indexOf('?') >= 0 ? '&' : '?') +
    'duzeltmeRef=' +
    encodeURIComponent(String(ref || '').trim())
  );
}

function duzeltmeMailMetni_(data, not, ref) {
  const baslik = paperTitleForLocale_(data);
  const link = duzeltmeFormLinki_(ref);
  if (isEnglishFormLocale_(data)) {
    return (
      'Dear Author;\n\n' +
      'Your abstract titled “' +
      baslik +
      '” submitted to the ' +
      mailKongreAdi_(true) +
      ' has been reviewed by the scientific committee. Before it can be accepted, the following revisions are requested:\n\n' +
      not +
      '\n\n' +
      'After making the revisions, please RESUBMIT your application via the application form:\n' +
      (link || 'the application form on the congress website') +
      '\n\n' +
      'Your submission will be updated under the same application number (' +
      String(ref || '') +
      ') and re-evaluated as soon as it is received.\n\n' +
      'Thank you for your interest. Best regards.\n\n' +
      'Congress Secretariat\n\n' +
      'INFO LINE: ' +
      telefonFooterDisplay_(true) +
      '\n\n' +
      AYARLAR.ADMIN_EMAIL +
      '\n'
    );
  }
  return (
    'Sayın Hocam;\n\n' +
    mailKongreAdi_(false) +
    ' kapsamında göndermiş olduğunuz “' +
    baslik +
    '” başlıklı bildiri özetiniz hakem değerlendirmesinden geçmiştir. Bildirinizin kabul edilebilmesi için aşağıdaki düzeltmeler talep edilmektedir:\n\n' +
    not +
    '\n\n' +
    'Düzeltmeleri yaptıktan sonra başvurunuzu başvuru formu üzerinden YENİDEN göndermenizi rica ederiz:\n' +
    (link || 'Kongre web sitesindeki başvuru formu') +
    '\n\n' +
    'Başvurunuz aynı başvuru numarası (' +
    String(ref || '') +
    ') altında güncellenecek ve yeniden değerlendirmeye alınacaktır.\n\n' +
    'Kongremize göstermiş olduğunuz ilgiye teşekkür eder, iyi çalışmalar dileriz.\n\n' +
    'Kongre Sekreteryası\n\n' +
    'KONGRE BİLGİ HATTI: ' +
    telefonFooterDisplay_(false) +
    '\n\n' +
    AYARLAR.ADMIN_EMAIL +
    '\n'
  );
}

function duzeltmeMailHtml_(data, not, ref) {
  const en = isEnglishFormLocale_(data);
  const baslik = paperTitleForLocale_(data);
  const link = duzeltmeFormLinki_(ref);
  const notHtml = escapeHtml_(not).replace(/\r?\n/g, '<br />');

  function p(s) {
    return (
      '<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#111827">' + s + '</p>'
    );
  }

  const govdeIc =
    '<tr><td style="padding:28px 24px 24px;border-left:1px solid #d7e4f5;border-right:1px solid #d7e4f5;font-family:' +
    MAIL_FONT_STACK_ +
    '">' +
    (en
      ? p('Dear <strong>' + escapeHtml_(String(data.authorsText || authorFullNameLocale_(data, true) || 'Author')) + '</strong>,') +
        p(
          'Your abstract titled “<strong>' +
            escapeHtml_(baslik) +
            '</strong>” has been reviewed by the scientific committee. Before it can be accepted, the following <strong>revisions are requested</strong>:'
        )
      : p('Sayın <strong>' + escapeHtml_(String(data.authorsText || data.adSoyad || 'Yazar')) + '</strong>,') +
        p(
          '“<strong>' +
            escapeHtml_(baslik) +
            '</strong>” başlıklı bildiri özetiniz hakem değerlendirmesinden geçmiştir. Bildirinizin kabul edilebilmesi için aşağıdaki <strong>düzeltmeler talep edilmektedir</strong>:'
        )) +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#fef9ec;border:1px solid #fde68a;border-radius:10px">' +
    '<tr><td style="padding:16px 18px 16px 16px;border-left:4px solid #b45309">' +
    '<p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#92400e;letter-spacing:0.05em;text-transform:uppercase">' +
    (en ? 'Requested revisions' : 'Talep edilen düzeltmeler') +
    '</p>' +
    '<p style="margin:0;font-size:14px;line-height:1.7;color:#374151">' +
    notHtml +
    '</p>' +
    '</td></tr></table>' +
    (en
      ? p(
          'After making the revisions, please <strong>resubmit your application via the application form</strong>. Your submission will be updated under the same application number (<strong>' +
            escapeHtml_(String(ref || '')) +
            '</strong>) and re-evaluated as soon as it is received.'
        )
      : p(
          'Düzeltmeleri yaptıktan sonra başvurunuzu <strong>başvuru formu üzerinden yeniden gönderin</strong>. Başvurunuz aynı başvuru numarası (<strong>' +
            escapeHtml_(String(ref || '')) +
            '</strong>) altında güncellenecek ve yeniden değerlendirmeye alınacaktır.'
        )) +
    (link
      ? '<div style="text-align:center;margin:0 0 22px">' +
        '<a href="' +
        escapeHtml_(link) +
        '" style="display:inline-block;background:#0072BC;color:#ffffff !important;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">' +
        (en ? 'Submit revised application' : 'Düzeltilmiş başvuruyu gönder') +
        '</a></div>' +
        '<p style="margin:0 0 14px;font-size:12px;line-height:1.6;color:#5a6e88;text-align:center">' +
        (en ? 'If the button does not work, copy this link: ' : 'Buton çalışmazsa bu bağlantıyı kopyalayın: ') +
        '<a href="' +
        escapeHtml_(link) +
        '" style="color:#0b57d0;text-decoration:underline;word-break:break-all">' +
        escapeHtml_(link) +
        '</a></p>'
      : '') +
    (en
      ? p('Thank you for your interest. Best regards.<br /><strong>Congress Secretariat</strong>')
      : p(
          'Kongremize göstermiş olduğunuz ilgiye teşekkür eder, iyi çalışmalar dileriz.<br /><strong>Kongre Sekreteryası</strong>'
        )) +
    '</td></tr>';

  return mailWrapperOuter_(
    mailUstMarkaHtml_(en ? 'Revision request' : 'Bildiri düzeltme talebi', en) +
      govdeIc +
      mailFooterHtml_(en)
  );
}

function duzeltmeMailiGonder_(data, not, klasorUrl, ref) {
  // Düzeltme (revizyon) maili YALNIZCA ana yazara gider; ortak yazarlara gitmez.
  const ana = anaYazarEmail_(data);
  const recipients = ana ? [ana] : [];
  if (!recipients.length) throw new Error('Düzeltme maili: alıcı e-posta bulunamadı.');

  const en = isEnglishFormLocale_(data);
  const konu = en
    ? 'Revision request — ' + mailKongreAdi_(true)
    : 'Bildiri düzeltme talebi — ' + mailKongreAdi_(false);

  MailApp.sendEmail({
    to: recipients.join(','),
    subject: konu,
    body: duzeltmeMailMetni_(data, not, ref),
    htmlBody: duzeltmeMailHtml_(data, not, ref),
    name: AYARLAR.GONDEREN_AD,
    replyTo: AYARLAR.ADMIN_EMAIL,
  });

  // Admin bilgilendirme
  try {
    MailApp.sendEmail({
      to: AYARLAR.ADMIN_EMAIL,
      subject: 'Düzeltme maili gönderildi — ' + (data.adSoyad || recipients[0]),
      body:
        'Düzeltme talebi maili gönderildi.\n\n' +
        'Bildiri: ' +
        paperTitleForLocale_(data) +
        '\n' +
        'Alıcılar: ' +
        recipients.join(', ') +
        '\n' +
        'Başvuru ref: ' +
        String(ref || '—') +
        '\n' +
        'Düzeltme notu:\n' +
        not +
        '\n\n' +
        'Drive klasör: ' +
        (klasorUrl || '—') +
        '\n',
      name: AYARLAR.GONDEREN_AD,
    });
  } catch (ignore) {}
}

// ============================================================
// MİGRASYON — Bir kez elle çalıştırın: eski satırlara Ref/Locale/Durum yazar
// ============================================================
function migrasyonEskiKayitlar() {
  const sh = getBasvuruSheet_();
  if (!sh) throw new Error('Başvuru tablosu bulunamadı.');
  ensureDurumBasliklari_(sh);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) {
    console.log('migrasyonEskiKayitlar: veri satırı yok.');
    return;
  }

  const values = sh.getRange(2, 1, lastRow - 1, SUTUN_EK.SERTIFIKA_ID).getValues();
  let guncellenen = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    const row = i + 2;
    if (!String(v[SUTUN.TIMESTAMP - 1] || '').toString().trim() && !String(v[SUTUN.AD - 1] || '').trim()) {
      continue;
    }
    let degisti = false;
    if (!String(v[SUTUN_EK.BASVURU_REF - 1] || '').trim()) {
      sh.getRange(row, SUTUN_EK.BASVURU_REF).setValue(mailBasvuruReferans_(v[SUTUN.TIMESTAMP - 1]));
      degisti = true;
    }
    if (!String(v[SUTUN_EK.FORM_LOCALE - 1] || '').trim()) {
      const en =
        !String(v[SUTUN.BASLIK_TR - 1] || '').trim() && String(v[SUTUN.BASLIK_EN - 1] || '').trim();
      sh.getRange(row, SUTUN_EK.FORM_LOCALE).setValue(en ? 'en' : 'tr');
      degisti = true;
    }
    if (!String(v[SUTUN_EK.DURUM - 1] || '').trim()) {
      sh.getRange(row, SUTUN_EK.DURUM).setValue(DURUM_BEKLEMEDE);
      degisti = true;
    }
    if (degisti) guncellenen++;
  }
  console.log('migrasyonEskiKayitlar: ' + guncellenen + ' satır güncellendi (hepsi Beklemede).');
}

/**
 * TEK SEFERLİK: Başlık satırını kanonik hale getirir ve eski özet-format ("ana liste")
 * çift kayıtlarını siler — ilk hücresi WT-XXXXXXXX-XXXXXX deseninde olan satırlar.
 * (Aynı başvurunun 22 sütunluk detay satırı zaten tabloda mevcut.)
 * Sonra eksik Ref/Locale/Durum alanlarını doldurur.
 */
function tabloyuDuzelt() {
  const sh = getBasvuruSheet_();
  if (!sh) throw new Error('Başvuru tablosu bulunamadı.');
  ensureBasvuruBasliklari_(sh);

  const lastRow = sh.getLastRow();
  let silinen = 0;
  if (lastRow >= 2) {
    const firstCol = sh.getRange(2, 1, lastRow - 1, 1).getValues();
    // Alttan yukarı sil ki satır numaraları kaymasın.
    for (let i = firstCol.length - 1; i >= 0; i--) {
      const v = String(firstCol[i][0] || '').trim();
      if (/^WT-\d{8}-\d{6}$/.test(v)) {
        sh.deleteRow(i + 2);
        silinen++;
      }
    }
  }
  console.log('tabloyuDuzelt: başlıklar düzeltildi, ' + silinen + ' özet-format çift kayıt silindi.');
  migrasyonEskiKayitlar();
}

// ============================================================
// TEST FONKSİYONU — Script'i kurmadan önce test edin
// Apps Script editöründe bu fonksiyonu seçip ▶ çalıştırın
// ============================================================
function testEt() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    console.warn('testEt: kilit alınamadı');
    return;
  }
  try {
    // Mail önizlemesi için geçici AYARLAR.LOGO_URL + KONGRE_WEB_URL kullanın; örn. …/new5/img/writetec-logo.png
    const testData = {
      timestamp: new Date(),
      unvan: 'Doç. Dr.',
      ad: 'Test',
      soyad: 'Kullanıcı',
      adSoyad: 'Doç. Dr. Test Kullanıcı',
      universite: 'Test Üniversitesi',
      fakulte: 'Sağlık Bilimleri Fakültesi',
      bolum: 'Hemşirelik',
      orcid: '0000-0000-0000-0000',
      email: AYARLAR.ADMIN_EMAIL,
      telefon: '05001234567',
      sehir: 'Isparta',
      ulke: 'Türkiye',
      bilimAlani: 'Sağlık Yönetimi',
      yayinTercihi: 'Kongre Bildiri Kitabı',
      baslikTr: 'Test Bildiri Başlığı — Yapay Zeka Uygulamaları',
      ozetTr: new Array(31).join('Bu bir test özetidir. '),
      keywordsTr: 'Yapay Zeka, Sağlık, Test',
      jel: '',
      tezNotu: '',
      baslikEn: 'Test Paper Title — AI Applications',
      ozetEn: new Array(31).join('This is a test abstract. '),
      keywordsEn: 'Artificial Intelligence, Health, Test',
      klasorAdi: klasorAdiOlustur_('Doç. Dr.', 'Test', 'Kullanıcı'),
      formLocale: 'tr',
    };
    testData.authors = [
      {
        unvan: testData.unvan,
        ad: testData.ad,
        soyad: testData.soyad,
        universite: testData.universite,
        fakulte: testData.fakulte,
        bolum: testData.bolum,
        orcid: testData.orcid,
        email: 'mehmetbarisgudul@gmail.com',
        telefon: testData.telefon,
        sehir: testData.sehir,
        ulke: testData.ulke,
      },
      {
        unvan: 'Dr.',
        ad: 'Test',
        soyad: 'İkinci',
        universite: 'Test Üniversitesi',
        fakulte: 'Sağlık Bilimleri Fakültesi',
        bolum: 'Fizyoterapi ve Rehabilitasyon',
        orcid: '',
        email: 'barisguduljob@gmail.com',
        telefon: '05007654321',
        sehir: 'Isparta',
        ulke: 'Türkiye',
      },
      {
        unvan: 'Dr.',
        ad: 'Test',
        soyad: 'Üçüncü',
        universite: 'Test Üniversitesi',
        fakulte: 'Sağlık Bilimleri Fakültesi',
        bolum: 'Sağlık Yönetimi',
        orcid: '',
        email: AYARLAR.ADMIN_EMAIL,
        telefon: '05009998877',
        sehir: 'Isparta',
        ulke: 'Türkiye',
      },
    ];
    // Excel/Drive için virgüllü yazar listesi
    testData.authorsText = authorsToCommaNames_(testData.authors);

    // Uyum: birincil yazar alanları (Yazar 1)
    testData.unvan = testData.authors[0].unvan;
    testData.ad = testData.authors[0].ad;
    testData.soyad = testData.authors[0].soyad;
    testData.adSoyad = (testData.unvan + ' ' + testData.ad + ' ' + testData.soyad).trim();
    testData.universite = testData.authors[0].universite;
    testData.fakulte = testData.authors[0].fakulte;
    testData.bolum = testData.authors[0].bolum;
    testData.orcid = testData.authors[0].orcid;
    testData.email = testData.authors[0].email;
    testData.telefon = testData.authors[0].telefon;
    testData.sehir = testData.authors[0].sehir;
    testData.ulke = testData.authors[0].ulke;

    // Drive klasör adı: "Ünvan Ad Soyad, Ünvan Ad Soyad, ..."
    testData.klasorAdi =
      klasorAdiOlusturFromAuthors_(testData.authors) ||
      klasorAdiOlustur_(testData.unvan, testData.ad, testData.soyad);

    const anaKlasor = DriveApp.getFolderById(AYARLAR.ANA_KLASOR_ID);
    const testKlasorAdi = testData.klasorAdi;
    const it = anaKlasor.getFoldersByName(testKlasorAdi);
    while (it.hasNext()) {
      it.next().setTrashed(true);
    }

    const klasorUrl = klasorOlustur(testData);
    katilimciMailGonder(testData, klasorUrl);
    adminMailGonder(testData, klasorUrl, 2);
    basvuruListesineEkle_(testData, klasorUrl, 'Test');
    console.log('testEt: Belgeler üretilmedi (hakem kontrolü) — onay admin panelden verilir.');

    console.log('Başvuru referansı: ' + mailBasvuruReferans_(testData.timestamp));
    console.log('✅ Test tamamlandı. Drive klasörü: ' + klasorUrl);
    console.log('📧 Mail gönderildi: ' + testData.email);
  } finally {
    lock.releaseLock();
  }
}

/** Web formu İngilizce akışı: TR özet alanları boş, formLocale=en (katılımcı/kabul maili EN). */
function testEtIngilizce() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    console.warn('testEtIngilizce: kilit alınamadı');
    return;
  }
  try {
    const testData = {
      timestamp: new Date(),
      formLocale: 'en',
      unvan: 'Dr.',
      ad: 'Jane',
      soyad: 'EnglishTest',
      adSoyad: 'Dr. Jane EnglishTest',
      universite: 'Test University',
      fakulte: 'Faculty of Health',
      bolum: 'Nursing',
      orcid: '',
      email: AYARLAR.ADMIN_EMAIL,
      telefon: '+1 5550100',
      sehir: 'London',
      ulke: 'United Kingdom',
      bilimAlani: 'Hemşirelik',
      yayinTercihi: 'Congress proceedings (e-book, included in registration fee)',
      baslikTr: '',
      ozetTr: '',
      keywordsTr: '',
      jel: '',
      tezNotu: '',
      baslikEn: 'English-only congress abstract test',
      ozetEn: new Array(31).join('This is a test abstract for the English submission flow. '),
      keywordsEn: 'Nursing, Congress, English',
      klasorAdi: klasorAdiOlustur_('Dr.', 'Jane', 'EnglishTest'),
    };
    testData.authors = [
      {
        unvan: testData.unvan,
        ad: testData.ad,
        soyad: testData.soyad,
        universite: testData.universite,
        fakulte: testData.fakulte,
        bolum: testData.bolum,
        orcid: testData.orcid,
        email: testData.email,
        telefon: testData.telefon,
        sehir: testData.sehir,
        ulke: testData.ulke,
      },
    ];
    testData.authorsText = authorsToCommaNames_(testData.authors);

    const anaKlasor = DriveApp.getFolderById(AYARLAR.ANA_KLASOR_ID);
    const testKlasorAdi = testData.klasorAdi;
    const it = anaKlasor.getFoldersByName(testKlasorAdi);
    while (it.hasNext()) {
      it.next().setTrashed(true);
    }

    const klasorUrl = klasorOlustur(testData);
    katilimciMailGonder(testData, klasorUrl);
    adminMailGonder(testData, klasorUrl, 0);
    basvuruListesineEkle_(testData, klasorUrl, 'Test-EN');
    console.log('testEtIngilizce: Belgeler üretilmedi (hakem kontrolü) — onay admin panelden verilir.');

    console.log('✅ testEtIngilizce tamam. Drive: ' + klasorUrl);
  } finally {
    lock.releaseLock();
  }
}

function testEtCokluYazarSenaryolari_() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    console.warn('testEtCokluYazarSenaryolari_: kilit alınamadı');
    return;
  }
  try {
    const counts = [1, 6, 10];
    for (let i = 0; i < counts.length; i++) {
      const n = counts[i];
      const base = {
        timestamp: new Date(),
        unvan: 'Doç. Dr.',
        ad: 'Test',
        soyad: 'Yazar' + String(n),
        adSoyad: 'Doç. Dr. Test Yazar' + String(n),
        universite: 'Test Üniversitesi',
        fakulte: 'Sağlık Bilimleri Fakültesi',
        bolum: 'Hemşirelik',
        orcid: '0000-0000-0000-0000',
        email: AYARLAR.ADMIN_EMAIL,
        telefon: '05001234567',
        sehir: 'Isparta',
        ulke: 'Türkiye',
        bilimAlani: 'Sağlık Yönetimi',
        yayinTercihi: 'Kongre Bildiri Kitabı',
        baslikTr: 'Çok yazarlı test (' + String(n) + ')',
        ozetTr: new Array(31).join('Bu bir test özetidir. '),
        keywordsTr: 'Yapay Zeka, Sağlık, Test',
        jel: '',
        tezNotu: '',
        baslikEn: 'Multi-author test (' + String(n) + ')',
        ozetEn: new Array(31).join('This is a test abstract. '),
        keywordsEn: 'Artificial Intelligence, Health, Test',
        klasorAdi: klasorAdiOlustur_('Doç. Dr.', 'Test', 'Yazar' + String(n)),
        formLocale: 'tr',
      };

      base.authors = [];
      for (let k = 0; k < n; k++) {
        base.authors.push({
          unvan: k === 0 ? 'Doç. Dr.' : 'Dr.',
          ad: k === 0 ? 'Test' : 'Yazar',
          soyad: 'No' + String(k + 1),
          universite: 'Test Üniversitesi',
          fakulte: 'SB',
          bolum: 'Bölüm ' + String(k + 1),
          orcid: '',
          email: 'test' + String(k + 1) + '+writetec@example.com',
          telefon: '0500000000' + String(k + 1),
          sehir: 'Isparta',
          ulke: 'Türkiye',
        });
      }
      // Uyum: birincil yazar alanları
      base.unvan = base.authors[0].unvan;
      base.ad = base.authors[0].ad;
      base.soyad = base.authors[0].soyad;
      base.adSoyad = (base.unvan + ' ' + base.ad + ' ' + base.soyad).trim();
      base.universite = base.authors[0].universite;
      base.fakulte = base.authors[0].fakulte;
      base.bolum = base.authors[0].bolum;
      base.orcid = base.authors[0].orcid;
      base.email = base.authors[0].email;
      base.telefon = base.authors[0].telefon;
      base.sehir = base.authors[0].sehir;
      base.ulke = base.authors[0].ulke;
      base.authorsText = authorsToText_(base.authors);

      const anaKlasor = DriveApp.getFolderById(AYARLAR.ANA_KLASOR_ID);
      const it = anaKlasor.getFoldersByName(base.klasorAdi);
      while (it.hasNext()) it.next().setTrashed(true);

      const klasorUrl = klasorOlustur(base);
      katilimciMailGonder(base, klasorUrl);
      adminMailGonder(base, klasorUrl, 0);
      basvuruListesineEkle_(base, klasorUrl, 'Test-CokluYazar');
      console.log('✅ Çok yazarlı test tamam: ' + String(n) + ' yazar. ' + klasorUrl);
    }
  } finally {
    lock.releaseLock();
  }
}

function testWebPostSimule_() {
  // doPost'un beklediği şekil: { parameter: {...} }
  const baseParams = {
    token: String(AYARLAR.WEB_GONDERIM_ANAHTARI || ''),
    bilimAlani: 'Sağlık Yönetimi',
    yayinTercihi: 'Kongre Bildiri Kitabı',
    baslikTr: 'Simüle Web POST (çok yazar)',
    ozetTr: new Array(31).join('Bu bir test özetidir. '),
    keywordsTr: 'Yapay Zeka, Sağlık, Test',
    jel: '',
    tezNotu: '',
    baslikEn: 'Simulated Web POST (multi-author)',
    ozetEn: new Array(31).join('This is a test abstract. '),
    keywordsEn: 'Artificial Intelligence, Health, Test',
    formLocale: 'tr',
  };
  const authors = [
    {
      unvan: 'Doç. Dr.',
      ad: 'Sim',
      soyad: 'Primary',
      universite: 'Test Üniversitesi',
      fakulte: 'SB',
      bolum: 'Bölüm 1',
      orcid: '',
      email: 'mehmetbarisgudul@gmail.com',
      telefon: '05001234567',
      sehir: 'Isparta',
      ulke: 'Türkiye',
    },
    {
      unvan: 'Dr.',
      ad: 'Sim',
      soyad: 'Second',
      universite: 'Test Üniversitesi',
      fakulte: 'SB',
      bolum: 'Bölüm 2',
      orcid: '',
      email: 'barisguduljob@gmail.com',
      telefon: '05007654321',
      sehir: 'Isparta',
      ulke: 'Türkiye',
    },
    {
      unvan: 'Dr.',
      ad: 'Sim',
      soyad: 'Third',
      universite: 'Test Üniversitesi',
      fakulte: 'SB',
      bolum: 'Bölüm 3',
      orcid: '',
      email: AYARLAR.ADMIN_EMAIL,
      telefon: '05009998877',
      sehir: 'Isparta',
      ulke: 'Türkiye',
    },
  ];
  baseParams.authorsJson = JSON.stringify(authors);
  baseParams.authorsText = authorsToText_(authors);

  const result = doPost({ parameter: baseParams });
  console.log('doPost simülasyon sonucu: ' + (result && result.getContent ? result.getContent() : String(result)));

  const enSim = Object.assign({}, baseParams, {
    formLocale: 'en',
    baslikTr: '',
    ozetTr: '',
    keywordsTr: '',
    baslikEn: 'Simulated Web POST (English UI / EN-only abstracts)',
  });
  const resultEn = doPost({ parameter: enSim });
  console.log(
    'doPost EN simülasyon sonucu: ' +
      (resultEn && resultEn.getContent ? resultEn.getContent() : String(resultEn))
  );

  // Parse hatası fallback testi
  const bad = Object.assign({}, baseParams, { authorsJson: '{broken-json' });
  // Fallback için tek yazar alanlarını da verelim
  bad.unvan = 'Dr.';
  bad.ad = 'Fallback';
  bad.soyad = 'User';
  bad.universite = 'Fallback Uni';
  bad.fakulte = '';
  bad.bolum = 'Bölüm';
  bad.orcid = '';
  bad.email = AYARLAR.ADMIN_EMAIL;
  bad.telefon = '05001112233';
  bad.sehir = 'Isparta';
  bad.ulke = 'Türkiye';
  const result2 = doPost({ parameter: bad });
  console.log('doPost bozuk JSON fallback sonucu: ' + (result2 && result2.getContent ? result2.getContent() : String(result2)));
}

/**
 * Admin akışı uçtan uca test: liste → onay (PDF+PNG+kabul maili) → ret (düzeltme maili).
 * Çalıştırmadan önce Script Properties'te ADMIN_API_ANAHTARI tanımlı olmalı.
 * Tabloda en az bir başvuru satırı olmalı (yoksa önce testWebPostSimule_ çalıştırın).
 */
function testAdminAkisi_() {
  const anahtar = adminApiAnahtariResolve_();
  if (!anahtar) {
    console.error('testAdminAkisi_: ADMIN_API_ANAHTARI boş. Script Properties\'e ekleyin.');
    return;
  }

  // 1) Liste
  const listResp = doPost({ parameter: { action: 'adminList', adminKey: anahtar } });
  const list = JSON.parse(listResp.getContent());
  console.log('adminList: ok=' + list.ok + ', kayıt=' + (list.basvurular ? list.basvurular.length : 0));
  if (!list.ok || !list.basvurular || !list.basvurular.length) {
    console.error('testAdminAkisi_: listede kayıt yok; önce testWebPostSimule_ çalıştırın.');
    return;
  }

  // Son kaydı kullan (büyük olasılıkla test kaydı)
  const ref = list.basvurular[list.basvurular.length - 1].ref;
  console.log('Test ref: ' + ref);

  // 2) Onay — PDF + PNG üretilir, kabul maili gider
  const okResp = doPost({ parameter: { action: 'adminApprove', adminKey: anahtar, ref: ref } });
  console.log('adminApprove: ' + okResp.getContent());

  // 3) Ret — düzeltme maili gider, durum Reddedildi olur
  const redResp = doPost({
    parameter: {
      action: 'adminReject',
      adminKey: anahtar,
      ref: ref,
      duzeltmeNotu:
        '1) Özet 300 kelimeyi aşıyor, kısaltınız.\n2) Anahtar kelimeler alfabetik sıralanmalı.\n3) İngilizce başlıkta yazım hatası var.',
    },
  });
  console.log('adminReject: ' + redResp.getContent());

  // 4) Revizyon — düzeltme linkiyle yeniden gönderim aynı satırı güncellemeli
  const kayit = list.basvurular[list.basvurular.length - 1];
  const sh = getBasvuruSheet_();
  const satirOnce = sh.getLastRow();
  const revParams = {
    token: String(AYARLAR.WEB_GONDERIM_ANAHTARI || ''),
    duzeltmeRef: ref,
    authorsJson: JSON.stringify(kayit.authors || []),
    unvan: kayit.unvan,
    ad: kayit.ad,
    soyad: kayit.soyad,
    universite: kayit.universite,
    fakulte: kayit.fakulte,
    bolum: kayit.bolum,
    orcid: '',
    email: kayit.email,
    telefon: kayit.telefon,
    sehir: kayit.sehir,
    ulke: kayit.ulke,
    bilimAlani: kayit.bilimAlani,
    yayinTercihi: kayit.yayinTercihi,
    baslikTr: kayit.baslikTr ? kayit.baslikTr + ' (düzeltilmiş)' : '',
    ozetTr: kayit.ozetTr,
    keywordsTr: kayit.keywordsTr,
    jel: '',
    tezNotu: '',
    baslikEn: kayit.baslikEn ? kayit.baslikEn + ' (revised)' : '',
    ozetEn: kayit.ozetEn,
    keywordsEn: kayit.keywordsEn,
    formLocale: kayit.formLocale || 'tr',
  };
  const revResp = doPost({ parameter: revParams });
  const satirSonra = sh.getLastRow();
  console.log(
    'revizyon doPost: ' +
      revResp.getContent() +
      ' — satır ' +
      satirOnce +
      ' → ' +
      satirSonra +
      (satirOnce === satirSonra ? ' (yerinde güncellendi ✓)' : ' (YENİ SATIR AÇILDI ✗)')
  );

  // 5) Yanlış anahtar → unauthorized
  const badResp = doPost({ parameter: { action: 'adminList', adminKey: 'yanlis-anahtar' } });
  console.log('yanlış anahtar testi: ' + badResp.getContent());
}
