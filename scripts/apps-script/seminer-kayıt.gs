// WriteTec Teklif Mektubu - Google Apps Script
// Bu scripti Google Apps Script'e yapıştırıp Web App olarak deploy edin.
//
// ZORUNLU DAĞITIM AYARLARI (aksi halde site “beklenmeyen yanıt” / giriş sayfası alır):
//   Dağıtım → Web uygulaması → Düzenle
//   • “Kim çalıştırır” / Execute as: Ben (Me)
//   • “Kimler erişebilir” / Who has access: Herkes (Anyone)  ← “Yalnızca ben” veya yalnızca Google hesabı OLMAZ
//   Kaydet → “Yeni sürüm” ile yayınlayın. URL mutlaka .../exec ile bitsin.
// Tarayıcıda /exec açılınca GİRİŞ ekranı görüyorsanız erişim “Herkes” değildir; Code.gs ile düzelmez, dağıtımı düzeltin.
//
// Sorun giderme:
// 1) testEt() fonksiyonunu editörde Çalıştırın — Execution log çıktısını kontrol edin.
// 2) Dağıtım > Web uygulaması > "Yeni sürüm" ile güncel kodu yayınlayın; URL'nin /exec ile bittiğinden emin olun.
// 3) POST gövdesi her zaman geçerli JSON olmalı (site /api/quote üzerinden gönderir).

var COMPANY_EMAIL = "writetecbt@gmail.com";
var BRAND_NAME = "WriteTec Bilgi Teknolojileri";
/** Başvurana giden onay mailinde görünen gönderici adı (Gmail "Kimden" alanı). */
var USER_MAIL_SENDER_NAME = "WriteTec Seminer";
var BRAND_SITE_URL = "https://writetecbt.com";
/** Yatay logo — herkese açık URL (WordPress medya). */
var BRAND_LOGO_URL = "https://www.congress.writetecbt.com/logo.png";
var BRAND_PHONE_DISPLAY = "+90 (530) 471 8078";

/**
 * Tek ÜCRETLİ seminer: COST Semineri. Bu ada gelen kayıtlarda başvurana,
 * ücret + banka bilgileri ve "dekontu gönderin" talimatı içeren özel onay maili gider.
 * Ödeme bilgileri sitedeki COST Semineri sayfasıyla (SeminarDetailPage) birebir aynıdır.
 */
var COST_SEMINAR_BASE_NAME = "COST Semineri";
var COST_FEE_DISPLAY = "4.000₺";
var COST_ACCOUNT_HOLDER = "WRITETEC BİLGİ TEKNOLOJİLERİ DANIŞMANLIK SANAYİ VE TİCARET LİMİTED ŞİRKETİ";
var COST_BANK_BRANCH = "QNB FİNANS BANK, KARABÜK ŞUBESİ";
var COST_IBAN = "TR91 0011 1000 0000 0139 2223 88";
var COST_ACCOUNT_NO = "139222388";
var COST_BRANCH_CODE = "780";
var COST_CURRENCY = "TRY";

/** Her seminerin kendi Google E-Tablosunun oluşturulacağı/aranacağı Drive klasörü. */
var SEMINAR_SHEETS_FOLDER_ID = "1Bxlk0fRDwlCKM7KMHsrbTdEi4ja9sNAN";
var SEMINAR_SHEET_PROP_PREFIX_ = "SEMINAR_SHEET_ID::";

/**
 * Canlı /exec adresinin hangi kodu çalıştırdığını anlamak için sürüm damgası.
 * doGet ?action=ping yanıtında döner. Kodu her güncelleyip dağıttığınızda
 * tarayıcıda ping atıp bu değeri görüyorsanız yeni sürüm gerçekten yayında demektir.
 */
var CODE_VERSION = "2026-07-14-cost-payment-mail-1";

// Site / teklif sayfasıyla uyumlu mavi tonlar
var COLOR_PRIMARY = "#1565C0";
var COLOR_PRIMARY_DARK = "#0D47A1";
var COLOR_TEXT = "#1A1A2E";
var COLOR_MUTED = "#6B7280";
var COLOR_BG = "#F8FAFF";
var COLOR_BORDER = "#BBDEFB";
var COLOR_WHITE = "#ffffff";

/** Editörden Çalıştır (▶) — Web App URL ve zamanı Execution log'a yazar. */
function testEt() {
  var url = "";
  try {
    url = ScriptApp.getService().getUrl();
  } catch (inner) {
    url = "(Web App URL alınamadı — önce Web App olarak dağıtın)";
  }
  Logger.log("testEt: OK");
  Logger.log("Web App URL: " + url);
  Logger.log("Zaman (ISO): " + new Date().toISOString());
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml_(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nl2brEscaped_(s) {
  return escapeHtml_(s).replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, "<br>");
}

/**
 * Türkçe'ye duyarlı büyük harfe çevirme. CSS `text-transform:uppercase` e-posta
 * istemcilerinde "i" → "I" (noktasız) üretip Türkçe İ'yi bozduğu için, büyük harf
 * gereken metinleri bu fonksiyonla önceden çeviririz: i → İ, ı → I, gerisi standart.
 */
function trUpper_(s) {
  return String(s == null ? "" : s)
    .replace(/i/g, "İ")
    .replace(/ı/g, "I")
    .toUpperCase();
}

/**
 * Türkçe'ye duyarlı Title Case: her kelimenin ilk harfi büyük, kalanı küçük.
 * "bARış GÜdüL" → "Barış Güdül". Ad/soyad tek alanda geldiği için (ayrılamaz)
 * seminer isimlerini profesyonel biçime getirmek için kullanılır.
 */
function trTitleCase_(s) {
  var str = String(s == null ? "" : s).trim();
  if (!str) return "";
  return str
    .split(/\s+/)
    .map(function (w) {
      if (!w) return "";
      var first = trUpper_(w.charAt(0));
      var rest = w.slice(1).replace(/I/g, "ı").replace(/İ/g, "i").toLowerCase();
      return first + rest;
    })
    .join(" ");
}

function emailTableRow_(label, valueHtml) {
  return (
    "<tr>" +
    '<td style="padding:12px 16px;border-bottom:1px solid #E8EDF5;background:#FAFBFF;font-size:13px;font-weight:600;color:#374151;width:36%;vertical-align:top;font-family:Arial,Helvetica,sans-serif;">' +
    escapeHtml_(label) +
    "</td>" +
    '<td style="padding:12px 16px;border-bottom:1px solid #E8EDF5;font-size:13px;color:' +
    COLOR_TEXT +
    ';vertical-align:top;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">' +
    valueHtml +
    "</td>" +
    "</tr>"
  );
}

function emailOuterWrap_(previewText, innerContent, isEn) {
  return (
    '<!DOCTYPE html><html lang="' + (isEn ? 'en' : 'tr') + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    "<title>WriteTec</title></head>" +
    '<body style="margin:0;padding:0;background:' +
    COLOR_BG +
    ';">' +
    '<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">' +
    escapeHtml_(previewText) +
    "</span>" +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' +
    COLOR_BG +
    ';padding:24px 12px;">' +
    "<tr><td align=\"center\">" +
    '<table role="presentation" width="100%" style="max-width:600px;border-collapse:collapse;background:' +
    COLOR_WHITE +
    ';border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(13,71,161,0.12);">' +
    innerContent +
    "</table></td></tr></table></body></html>"
  );
}

function emailHeaderBlock_(title, subtitle) {
  return (
    "<tr>" +
    '<td bgcolor="' +
    COLOR_PRIMARY_DARK +
    '" style="background:linear-gradient(135deg,' +
    COLOR_PRIMARY_DARK +
    " 0%," +
    COLOR_PRIMARY +
    ' 100%);padding:24px 28px;text-align:center;">' +
    '<img src="' +
    escapeHtml_(BRAND_LOGO_URL) +
    '" alt="WriteTec — Bilgi Teknolojileri" width="280" style="display:block;margin:0 auto 12px;max-width:280px;width:100%;height:auto;border:0;">' +
    '<p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.08em;color:#BBDEFB;font-family:Arial,Helvetica,sans-serif;">' +
    escapeHtml_(subtitle) +
    "</p>" +
    '<h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;font-family:Arial,Helvetica,sans-serif;">' +
    escapeHtml_(title) +
    "</h1>" +
    "</td></tr>"
  );
}

function emailFooterBlock_(extraLine) {
  var line =
    extraLine ||
    "Bu e-posta teklif talep formu aracılığıyla otomatik gönderilmiştir.";
  return (
    "<tr>" +
    '<td style="padding:20px 28px;background:#EEF4FF;border-top:1px solid ' +
    COLOR_BORDER +
    ';">' +
    '<p style="margin:0 0 8px;font-size:12px;color:' +
    COLOR_MUTED +
    ';line-height:1.5;font-family:Arial,Helvetica,sans-serif;">' +
    escapeHtml_(line) +
    "</p>" +
    '<p style="margin:0;font-size:12px;color:' +
    COLOR_PRIMARY +
    ';font-weight:600;font-family:Arial,Helvetica,sans-serif;">' +
    '<a href="' +
    escapeHtml_(BRAND_SITE_URL) +
    '" style="color:' +
    COLOR_PRIMARY +
    ';text-decoration:none;">' +
    escapeHtml_(BRAND_SITE_URL.replace(/^https?:\/\//, "")) +
    "</a>" +
    " · " +
    escapeHtml_(BRAND_PHONE_DISPLAY) +
    "</p></td></tr>"
  );
}

/** Şirket içi: müşteri şu talepte bulundu — detaylı özet */
function buildCompanyEmailHtml_(seminarName, name, email, phone, examGroup, kvkkOk, privOk, submittedAt) {
  var intro =
    "<p style=\"margin:0 0 16px;font-size:14px;color:" +
    COLOR_TEXT +
    ';line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Web sitemiz üzerinden <strong style="color:' +
    COLOR_PRIMARY +
    ';">' +
    escapeHtml_(name) +
    "</strong> adlı kişi <strong>" + escapeHtml_(seminarName) + "</strong> seminerine kayıt oldu. Gerekirse e-posta veya telefon ile iletişime geçebilirsiniz.</p>";

  var tableOpen =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ' +
    COLOR_BORDER +
    ';border-radius:8px;overflow:hidden;margin-top:8px;">';
  var tableClose = "</table>";

  var rows =
    emailTableRow_("Ad soyad", escapeHtml_(name)) +
    emailTableRow_("E-posta (yanıt adresi)", '<a style="color:' + COLOR_PRIMARY + ';text-decoration:none;" href="mailto:' + escapeHtml_(email) + '">' + escapeHtml_(email) + "</a>") +
    emailTableRow_("Telefon", escapeHtml_(phone)) +
    (examGroup ? emailTableRow_("Sınav alanı", escapeHtml_(examGroup)) : "") +
    emailTableRow_("KVKK aydınlatma onayı", escapeHtml_(kvkkOk)) +
    emailTableRow_("Gizlilik politikası onayı", escapeHtml_(privOk)) +
    emailTableRow_("Form gönderim zamanı", escapeHtml_(submittedAt));

  var body =
    "<tr><td style=\"padding:24px 28px 8px;\">" +
    intro +
    tableOpen +
    rows +
    tableClose +
    "</td></tr>";

  return emailOuterWrap_(
    "Yeni seminer kaydı: " + name + " (" + seminarName + ")",
    emailHeaderBlock_("Yeni Seminer Kaydı", trUpper_(seminarName + " · Dahili özet")) + body + emailFooterBlock_("")
  );
}

function buildCompanyEmailPlain_(seminarName, name, email, phone, examGroup, kvkkOk, privOk, submittedAt) {
  var lines = [
    "WRITETEC — YENİ SEMİNER KAYDI (Dahili)",
    "",
    "Web formu üzerinden yeni bir seminer kaydı oluşturuldu.",
    "",
    "--- Kayıt özeti ---",
    "Ad soyad            : " + name,
    "Seminer             : " + seminarName,
    "E-posta             : " + email,
    "Telefon             : " + phone,
  ];
  if (examGroup) {
    lines.push("Sınav alanı         : " + examGroup);
  }
  lines = lines.concat([
    "",
    "--- Yasal onaylar ---",
    "KVKK onayı          : " + kvkkOk,
    "Gizlilik onayı      : " + privOk,
    "Gönderim zamanı     : " + submittedAt,
    "",
    "---",
    BRAND_NAME,
    BRAND_SITE_URL,
  ]);
  return lines.join("\n");
}

/** Müşteriye bilgilendirici onay maili. isCost=true ise ödeme bölümü (ücret + IBAN + dekont talimatı) eklenir. */
function buildUserEmailHtml_(seminarName, name, phone, isEn, isCost) {
  var greeting =
    '<p style="margin:0 0 14px;font-size:15px;color:' +
    COLOR_TEXT +
    ';line-height:1.6;font-family:Arial,Helvetica,sans-serif;">' + (isEn ? 'Hello <strong>' : 'Merhaba <strong>') +
    escapeHtml_(name) +
    "</strong>,</p>" +
    '<p style="margin:0 0 16px;font-size:14px;color:' +
    COLOR_MUTED +
    ';line-height:1.6;font-family:Arial,Helvetica,sans-serif;">' +
    (isEn 
      ? "Your registration for the <strong style='color:" + COLOR_PRIMARY + ";'>" + escapeHtml_(seminarName) + "</strong> seminar has been successfully completed. We are happy to have you with us.</p>"
      : "<strong style='color:" + COLOR_PRIMARY + ";'>" + escapeHtml_(seminarName) + "</strong> semineri için kayıt işleminiz başarıyla tamamlanmıştır. Sizi aramızda görmekten mutluluk duyacağız.</p>") +
    '<p style="margin:0 0 20px;font-size:14px;color:' +
    COLOR_MUTED +
    ';line-height:1.6;font-family:Arial,Helvetica,sans-serif;">' +
    (isEn
      ? "This email confirms that your registration has been processed in our system. You can reply to this email if you have any questions about the event time and other details.</p>"
      : "Bu e-posta, kaydınızın sistemimize işlendiğini teyit eder. Etkinlik saati ve diğer detaylar hakkında sorularınız olursa bu iletiyi yanıtlayabilirsiniz.</p>");

  var contact =
    '<p style="margin:20px 0 0;font-size:13px;color:' +
    COLOR_MUTED +
    ';line-height:1.6;font-family:Arial,Helvetica,sans-serif;">' + (isEn ? 'For your questions: ' : 'Sorularınız için: ') + '<strong style="color:' +
    COLOR_TEXT +
    ';">' +
    escapeHtml_(COMPANY_EMAIL) +
    "</strong> · " +
    escapeHtml_(BRAND_PHONE_DISPLAY) +
    "</p>" +
    '<p style="margin:16px 0 0;font-size:13px;color:' +
    COLOR_TEXT +
    ';font-family:Arial,Helvetica,sans-serif;">' + (isEn ? 'Best regards,' : 'Saygılarımızla,') + '<br><strong style="color:' +
    COLOR_PRIMARY +
    ';">' +
    escapeHtml_(BRAND_NAME) +
    "</strong></p>";

  var paymentSection = isCost ? buildCostPaymentSectionHtml_(isEn) : "";

  var body =
    "<tr><td style=\"padding:24px 28px 8px;\">" + greeting + paymentSection + contact + "</td></tr>";

  var preview = isCost
    ? (isEn ? "Registration received — payment details" : "Kaydınız alındı — ödeme bilgileri")
    : (isEn ? "Registration received" : "Kaydınız alındı");
  var headerTitle = isEn ? "Registration successfully completed" : "Kaydınız başarıyla tamamlandı";
  var headerSub = isEn
    ? String(seminarName + " · thank you").toUpperCase()
    : trUpper_(seminarName + " · teşekkür ederiz");
  var footerLine = isEn ? "Reply to: " + COMPANY_EMAIL : "Yanıt adresi: " + COMPANY_EMAIL;

  return emailOuterWrap_(
    preview,
    emailHeaderBlock_(headerTitle, headerSub) + body + emailFooterBlock_(footerLine),
    isEn
  );
}

function buildUserEmailPlain_(seminarName, name, phone, isEn, isCost) {
  var lines;
  if (isEn) {
    lines = [
      "Hello " + name + ",",
      "",
      "Your registration for the '" + seminarName + "' seminar has been successfully completed. We are happy to have you with us.",
      "",
      "This email confirms that your registration has been processed in our system. You can reply to this email if you have any questions about the event time and other details.",
    ];
    if (isCost) {
      lines.push("", buildCostPaymentSectionPlain_(true));
    }
    lines.push(
      "",
      "---",
      "For your questions: " + COMPANY_EMAIL + " / " + BRAND_PHONE_DISPLAY,
      "",
      "Best regards,",
      BRAND_NAME,
      BRAND_SITE_URL
    );
  } else {
    lines = [
      "Merhaba " + name + ",",
      "",
      "'" + seminarName + "' semineri için kayıt işleminiz başarıyla tamamlanmıştır. Sizi aramızda görmekten mutluluk duyacağız.",
      "",
      "Bu e-posta, kaydınızın sistemimize işlendiğini teyit eder. Etkinlik saati ve diğer detaylar hakkında sorularınız olursa bu iletiyi yanıtlayabilirsiniz.",
    ];
    if (isCost) {
      lines.push("", buildCostPaymentSectionPlain_(false));
    }
    lines.push(
      "",
      "---",
      "Sorularınız için: " + COMPANY_EMAIL + " / " + BRAND_PHONE_DISPLAY,
      "",
      "Saygılarımızla,",
      BRAND_NAME,
      BRAND_SITE_URL
    );
  }
  return lines.join("\n");
}

/**
 * Ücretli COST seminerini adından tanır. Form slug/ücret alanı göndermediği için
 * tek ayraç seminer adıdır; büyük/küçük harf farkına toleranslı karşılaştırılır.
 */
function isCostSemineri_(baseSeminarName) {
  return trUpper_(String(baseSeminarName || "").trim()) === trUpper_(COST_SEMINAR_BASE_NAME);
}

/** COST semineri onay mailine eklenen ödeme bölümü (HTML): ücret, banka tablosu, dekont talimatı. */
function buildCostPaymentSectionHtml_(isEn) {
  var intro =
    '<p style="margin:20px 0 12px;font-size:14px;color:' +
    COLOR_TEXT +
    ';line-height:1.6;font-family:Arial,Helvetica,sans-serif;">' +
    (isEn
      ? 'The participation fee for the COST Seminar is <strong style="color:' + COLOR_PRIMARY + ';">' + escapeHtml_(COST_FEE_DISPLAY) + "</strong>. You can find the payment details below (they are also available on the seminar page):"
      : 'COST Semineri katılım ücreti <strong style="color:' + COLOR_PRIMARY + ';">' + escapeHtml_(COST_FEE_DISPLAY) + "</strong>'dir. Ödeme bilgilerini aşağıda bulabilirsiniz (seminer sayfasında da yer almaktadır):") +
    "</p>";

  var rows = isEn
    ? emailTableRow_("Account holder", escapeHtml_(COST_ACCOUNT_HOLDER)) +
      emailTableRow_("Bank, Branch", escapeHtml_(COST_BANK_BRANCH)) +
      emailTableRow_("IBAN", "<strong>" + escapeHtml_(COST_IBAN) + "</strong>") +
      emailTableRow_("Account number", escapeHtml_(COST_ACCOUNT_NO)) +
      emailTableRow_("Branch code", escapeHtml_(COST_BRANCH_CODE)) +
      emailTableRow_("Currency", escapeHtml_(COST_CURRENCY))
    : emailTableRow_("Ad Soyad / Unvan", escapeHtml_(COST_ACCOUNT_HOLDER)) +
      emailTableRow_("Banka, Şube", escapeHtml_(COST_BANK_BRANCH)) +
      emailTableRow_("IBAN", "<strong>" + escapeHtml_(COST_IBAN) + "</strong>") +
      emailTableRow_("Hesap Numarası", escapeHtml_(COST_ACCOUNT_NO)) +
      emailTableRow_("Şube Kodu", escapeHtml_(COST_BRANCH_CODE)) +
      emailTableRow_("Döviz Kodu", escapeHtml_(COST_CURRENCY));

  var table =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ' +
    COLOR_BORDER +
    ';border-radius:8px;overflow:hidden;">' +
    rows +
    "</table>";

  var notice =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;"><tr>' +
    '<td style="background:#EEF4FF;border-left:4px solid ' +
    COLOR_PRIMARY +
    ';border-radius:6px;padding:14px 16px;font-size:13px;color:' +
    COLOR_TEXT +
    ';line-height:1.6;font-family:Arial,Helvetica,sans-serif;">' +
    (isEn
      ? "<strong>Important:</strong> To finalize your registration, please make the payment and send your payment receipt to <strong>" + escapeHtml_(COMPANY_EMAIL) + "</strong>."
      : "<strong>Önemli:</strong> Kaydınızın kesinleşmesi için lütfen ödemeyi yaptıktan sonra dekontunuzu <strong>" + escapeHtml_(COMPANY_EMAIL) + "</strong> adresine gönderiniz.") +
    "</td></tr></table>";

  return intro + table + notice;
}

/** COST semineri onay mailine eklenen ödeme bölümü (düz metin). */
function buildCostPaymentSectionPlain_(isEn) {
  if (isEn) {
    return [
      "--- Payment details ---",
      "The participation fee for the COST Seminar is " + COST_FEE_DISPLAY + ".",
      "",
      "Account holder : " + COST_ACCOUNT_HOLDER,
      "Bank, Branch   : " + COST_BANK_BRANCH,
      "IBAN           : " + COST_IBAN,
      "Account number : " + COST_ACCOUNT_NO,
      "Branch code    : " + COST_BRANCH_CODE,
      "Currency       : " + COST_CURRENCY,
      "",
      "IMPORTANT: To finalize your registration, please make the payment and send your payment receipt to " + COMPANY_EMAIL + ".",
    ].join("\n");
  }
  return [
    "--- Ödeme bilgileri ---",
    "COST Semineri katılım ücreti " + COST_FEE_DISPLAY + "'dir.",
    "",
    "Ad Soyad / Unvan : " + COST_ACCOUNT_HOLDER,
    "Banka, Şube      : " + COST_BANK_BRANCH,
    "IBAN             : " + COST_IBAN,
    "Hesap Numarası   : " + COST_ACCOUNT_NO,
    "Şube Kodu        : " + COST_BRANCH_CODE,
    "Döviz Kodu       : " + COST_CURRENCY,
    "",
    "ÖNEMLİ: Kaydınızın kesinleşmesi için lütfen ödemeyi yaptıktan sonra dekontunuzu " + COMPANY_EMAIL + " adresine gönderiniz.",
  ].join("\n");
}

/** "X Semineri - 12.08.2026 - Saat: 19:00" gibi bir başlıktan tarih/saat eklerini atıp temiz seminer adını döndürür. */
function baseSeminerAdi_(seminarBaseName, seminarName) {
  var raw = String(seminarBaseName || seminarName || "Genel Başvuru").trim();
  var base = raw.split(" - ")[0].trim();
  return base.replace(/\s+/g, " ") || "Genel Başvuru";
}

/**
 * Verilen seminer adına ait Google E-Tablosunu SEMINAR_SHEETS_FOLDER_ID klasöründe bulur,
 * yoksa oluşturur. Script Properties üzerinde ID önbelleklenir (her başvuruda Drive'da
 * arama yapılmasını önlemek için); dosya silinmiş/erişilemez olursa yeniden oluşturulur.
 */
function getOrCreateSeminerSheet_(baseSeminarName) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error("Seminer sayfası kilidi alınamadı (tryLock timeout).");
  }
  try {
    var props = PropertiesService.getScriptProperties();
    var propKey = SEMINAR_SHEET_PROP_PREFIX_ + baseSeminarName;
    var existingId = String(props.getProperty(propKey) || "").trim();

    if (existingId) {
      try {
        return SpreadsheetApp.openById(existingId);
      } catch (ignoreErr) {
        props.deleteProperty(propKey);
      }
    }

    var folder = DriveApp.getFolderById(SEMINAR_SHEETS_FOLDER_ID);
    var files = folder.getFilesByName(baseSeminarName);
    if (files.hasNext()) {
      var found = SpreadsheetApp.openById(files.next().getId());
      props.setProperty(propKey, found.getId());
      return found;
    }

    var ss = SpreadsheetApp.create(baseSeminarName);
    var file = DriveApp.getFileById(ss.getId());
    try {
      file.moveTo(folder);
    } catch (moveErr) {
      // Bazı alanlarda moveTo kısıtlı olabilir; en azından ID kaydedilsin.
    }

    var sh = ss.getSheets()[0];
    sh.setName("Kayıtlar");
    sh.getRange(1, 1, 1, 7).setValues([
      ["Tarih", "Ad Soyad", "E-posta", "Telefon", "Sınav Alanı", "KVKK Onayı", "Gizlilik Onayı"],
    ]);

    props.setProperty(propKey, ss.getId());
    return ss;
  } finally {
    lock.releaseLock();
  }
}

/** Bir seminer başvurusunu ilgili seminerin Google E-Tablosuna satır olarak ekler. */
function appendSeminerKaydiToSheet_(baseSeminarName, name, email, phone, examGroup, kvkkOk, privOk, submittedAt) {
  // ÖNCE tabloyu al: getOrCreateSeminerSheet_ aynı script kilidini içeride
  // alıp bırakır; kilit reentrant olmadığı için burada önce kilit alınsaydı
  // deadlock oluşurdu.
  var ss = getOrCreateSeminerSheet_(baseSeminarName);
  // appendRow + getLastRow kilitsiz kalırsa eşzamanlı iki kayıtta telefon
  // formatı yanlış satıra yazılabilir; ekleme + format tek kilit altında yapılır.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error("Seminer kayıt kilidi alınamadı (tryLock timeout).");
  }
  try {
    var sh = ss.getSheets()[0];
    sh.appendRow([submittedAt, name, email, phone, examGroup || "", kvkkOk, privOk]);
    // Telefon (4. sütun) daima METİN olarak saklansın; +90 / +39 Sheets'te formül sanılmasın.
    sh.getRange(sh.getLastRow(), 4).setNumberFormat("@").setValue(String(phone == null ? "" : phone));
  } finally {
    lock.releaseLock();
  }
}

/**
 * ▶ EDİTÖRDEN ÇALIŞTIRIN (bir kez): Drive + Sheets izinlerini yetkilendirir ve
 * seminer klasörüne erişip örnek bir tablo oluşturarak kurulumu doğrular.
 * İzin ekranı çıkarsa mutlaka onaylayın; sonra Execution log'da sonuçları görün.
 */
function seminerSheetKurulumTesti() {
  var folder = DriveApp.getFolderById(SEMINAR_SHEETS_FOLDER_ID);
  Logger.log("✅ Klasöre erişildi: " + folder.getName() + " — " + folder.getUrl());

  var now = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
  appendSeminerKaydiToSheet_(
    "Kurulum Testi (silinebilir)",
    "TEST Kullanıcı",
    "test@example.com",
    "+90 000 000 00 00",
    "",
    "Evet",
    "Evet",
    now
  );

  var testSs = getOrCreateSeminerSheet_("Kurulum Testi (silinebilir)");
  Logger.log("✅ Test tablosu hazır: " + testSs.getUrl());
  Logger.log("Kurulum başarılı. Artık gerçek başvurular ilgili seminer tablolarına işlenecek.");
}

function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action;
    if (action === "testEt" || action === "ping") {
      return jsonOutput_({
        status: "success",
        message: "testEt (GET): Web App yanıt veriyor; dağıtım ve sürüm uyumlu.",
        version: CODE_VERSION,
        ts: new Date().toISOString(),
      });
    }
    // Canlı dağıtım üzerinde Drive/Sheets erişimini uçtan uca test eder.
    // Tarayıcıda açın: <exec-url>?action=sheetTest
    // Başarılıysa klasörde "Kurulum Testi (silinebilir)" tablosu oluşur ve URL'si döner;
    // başarısızsa GERÇEK hata mesajı tarayıcıda görünür (izin, klasör, kapsam vb.).
    if (action === "sheetTest") {
      try {
        var now = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
        appendSeminerKaydiToSheet_(
          "Kurulum Testi (silinebilir)",
          "TEST Kullanıcı",
          "test@example.com",
          "+90 000 000 00 00",
          "",
          "Evet",
          "Evet",
          now
        );
        var testSs = getOrCreateSeminerSheet_("Kurulum Testi (silinebilir)");
        return jsonOutput_({
          status: "success",
          version: CODE_VERSION,
          message: "Sheets erişimi ÇALIŞIYOR — test satırı eklendi.",
          sheetUrl: testSs.getUrl(),
          folderUrl: "https://drive.google.com/drive/folders/" + SEMINAR_SHEETS_FOLDER_ID,
        });
      } catch (sheetTestErr) {
        return jsonOutput_({
          status: "error",
          version: CODE_VERSION,
          message: "Sheets erişimi BAŞARISIZ — asıl hata: " + sheetTestErr,
          stack: String(sheetTestErr && sheetTestErr.stack ? sheetTestErr.stack : ""),
        });
      }
    }
    return jsonOutput_({
      status: "ok",
      message: "WriteTec başvuru Web App çalışıyor.",
      version: CODE_VERSION,
    });
  } catch (err) {
    return jsonOutput_({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || typeof e.postData.contents !== "string") {
      return jsonOutput_({
        status: "error",
        message: "Geçersiz istek: gövde (body) eksik veya okunamadı.",
      });
    }

    var raw = e.postData.contents;
    var data;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      return jsonOutput_({
        status: "error",
        message: "JSON ayrıştırılamadı. Gönderilen gövde geçerli JSON olmalıdır.",
      });
    }

    var act = data.action;
    if (act === "ping" || act === "testEt") {
      return jsonOutput_({
        status: "success",
        message: "testEt (POST): Web App ve doPost çalışıyor; e-posta gönderilmedi.",
        ts: new Date().toISOString(),
      });
    }

    var name = trTitleCase_(data.name) || "—";
    var email = data.email || "—";
    var phone = data.phone || "—";
    var examGroup = data.examGroup || "";
    var kvkkOk = data.kvkkAccepted === true ? "Evet" : "Hayır";
    var privOk = data.privacyAccepted === true ? "Evet" : "Hayır";
    var submittedAt = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

    var isEn = data.lang === "en";
    var seminarName = data.seminarName || (isEn ? "General Application" : "Genel Başvuru");
    var baseSeminarName = baseSeminerAdi_(data.seminarBaseName, seminarName);
    var isCost = isCostSemineri_(baseSeminarName);

    try {
      appendSeminerKaydiToSheet_(baseSeminarName, name, email, phone, examGroup, kvkkOk, privOk, submittedAt);
    } catch (sheetErr) {
      Logger.log("Seminer Sheet kaydı hatası: " + sheetErr);
      // Sessiz kalmasın: tablo oluşmazsa asıl nedeni yöneticiye bildir (mail akışını engellemeden).
      try {
        MailApp.sendEmail(
          COMPANY_EMAIL,
          "⚠️ Seminer Excel kaydı başarısız",
          "Seminer: " + baseSeminarName + "\n" +
            "Kişi: " + name + " (" + email + ")\n\n" +
            "Hata: " + sheetErr + "\n\n" +
            "Tarayıcıda şunu açarak canlı testi çalıştırın: <exec-url>?action=sheetTest\n" +
            "Klasör: https://drive.google.com/drive/folders/" + SEMINAR_SHEETS_FOLDER_ID
        );
      } catch (ignore) {}
    }

    var companySubject = isEn ? "[WriteTec Seminar Reg] " + seminarName + " - " + name : "[WriteTec Seminer Kaydı] " + seminarName + " - " + name;
    var companyHtml = buildCompanyEmailHtml_(
      seminarName,
      name,
      email,
      phone,
      examGroup,
      kvkkOk,
      privOk,
      submittedAt
    );
    var companyPlain = buildCompanyEmailPlain_(
      seminarName,
      name,
      email,
      phone,
      examGroup,
      kvkkOk,
      privOk,
      submittedAt
    );

    try {
      MailApp.sendEmail({
        to: COMPANY_EMAIL,
        subject: companySubject,
        body: companyPlain,
        htmlBody: companyHtml,
        name: BRAND_NAME,
      });
    } catch (companyMailErr) {
      Logger.log("Şirket bildirim maili hatası: " + companyMailErr);
    }

    if (email && email !== "-") {
      var userSubject;
      if (isCost) {
        userSubject = isEn
          ? seminarName + " Seminar Registration Received — Payment Details — " + BRAND_NAME
          : seminarName + " Seminer Kaydınız Alındı — Ödeme Bilgileri — " + BRAND_NAME;
      } else {
        userSubject = isEn
          ? seminarName + " Seminar Registration Received — " + BRAND_NAME
          : seminarName + " Seminer Kaydınız Alındı — " + BRAND_NAME;
      }
      var userHtml = buildUserEmailHtml_(seminarName, name, phone, isEn, isCost);
      var userPlain = buildUserEmailPlain_(seminarName, name, phone, isEn, isCost);

      try {
        MailApp.sendEmail({
          to: email,
          subject: userSubject,
          body: userPlain,
          htmlBody: userHtml,
          replyTo: COMPANY_EMAIL,
          name: USER_MAIL_SENDER_NAME,
        });
      } catch (userMailErr) {
        Logger.log("Başvuran onay maili hatası: " + userMailErr);
      }
    }

    return jsonOutput_({ status: "success" });
  } catch (err) {
    return jsonOutput_({ status: "error", message: err.toString() });
  }
}