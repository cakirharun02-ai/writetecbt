
/**
 * ============================================================
 *  KONGRE BİLDİRİ KİTABI OTOMATİK YÜKLEME SİSTEMİ — Apps Script
 * ============================================================
 *
 *  scripts/kitap.gs (kitap bölümü sistemi) temel alınarak hazırlanmıştır.
 *  Birleştirme mantığı (docx → Google Doc dönüşümü, zengin içerik kopyalama,
 *  İÇİNDEKİLER yeniden yazımı, arka plan iş kuyruğu) birebir aynıdır.
 *
 *  KURULUM ADIMLARI:
 *  1. script.google.com → **YENİ** proje (kitap projesine EKLEMEYİN) → bu kodu yapıştırın.
 *  2. Aşağıdaki BILDIRI_CONFIG haritasında her kongre için
 *     - folderId  (Google Drive klasörü — yüklenen .docx dosyaları buraya)
 *     - docId     (Google Doc — bildiri kitabı; zaten dolu, ASLA sıfırlanmaz)
 *     - sheetId   (Google Sheets — log defteri)
 *     üçünü doldurun. docId'ler hazır gelir; folderId/sheetId sizden.
 *  3. Hizmetler (🔧) → "Google Drive API" v3 + "Google Docs API" ekleyin.
 *     Bağlı GCP projesinde her ikisi de etkin olmalı.
 *  4. Editörden sırayla çalıştırın:
 *       setupBildiriSheets()            → log sheet başlıklarını kurar
 *       ensureBildiriDocScaffolds()     → Doc'a İÇİNDEKİLER iskeleti ekler (idempotent)
 *       installSubmissionProcessorTrigger()
 *     ⚠️ Bu üç fonksiyonun HİÇBİRİ mevcut Doc içeriğini silmez.
 *  5. Dağıt → Web uygulaması: "Ben" + "Herkes".
 *  6. Dağıtım URL'sini iki form dosyasındaki APPS_SCRIPT_URL sabitine yazın:
 *       bildiri-form-saglik/bildiri-yukleme-formu.html
 *       bildiri-form-sosyal/bildiri-yukleme-formu.html
 *
 *  FORM alanları: congressKey + bildiriType (ozet|tammetin) + lang (tr|en) +
 *  title/subject/keywords/authors + fileBase64 (veya parçalı yükleme).
 *
 *  OPSİYONEL PDF: exportBildiriPdfToFolder(congressKey)
 *  İçindekiler bozulursa: repairBildiriToc(congressKey)
 * ============================================================
 */

// ──────────────────────────────────────────────────────────────
//  YAPILANDIRMA
// ──────────────────────────────────────────────────────────────

/**
 * Her kongre için ayrı Drive klasörü, bildiri kitabı Doc'u ve Spreadsheet'i tanımlayın.
 * key alanları form HTML'lerindeki CONGRESS_KEY sabiti ile birebir aynı olmalıdır.
 */
const BILDIRI_CONFIG = {
  saglik: {
    label: '1. ULUSLARARASI WRITETEC SAĞLIK BİLİMLERİ KONGRESİ',
    labelEn: '1st International WriteTec Health Sciences Congress',
    docId: '1l7_pblMXU4P1ex4Uk1Ka4Ccg5d5kdfMT7X0O8WLljL0',
    folderId: '1qjgXWNsnG329PjdgaKhhFt11fdMqy2YY',
    sheetId: '1gl5AkxlMg0beWcmQg0LoX8FfFWxFNm8D5aRy9fna4rI',
  },
  sosyal_saglik: {
    label: '7. ULUSLARARASI WRITETEC SOSYAL BİLİMLER VE SAĞLIK BİLİMLERİ KONGRESİ',
    labelEn: '7th International WriteTec Social Sciences and Health Sciences Congress',
    docId: '1WHfDo1R0vhpbPl3twPnWPSbe4TKY2ExGp1CpropVxKo',
    folderId: '18JBvTwA8wTj4OZ5mfBsBYBZQQbUSdvH-',
    sheetId: '1zT0ocrUbqhRIna87RNVhz5it1lmGposQWSLk8uHSILo',
  },
};

/** Kabul edilen bildiri türleri ve iki dildeki etiketleri. */
const BILDIRI_TYPES = {
  ozet: {
    docHeading: 'ÖZET BİLDİRİ',
    tocBadge: 'Özet',
    tr: 'Özet Bildiri',
    en: 'Abstract',
  },
  tammetin: {
    docHeading: 'TAM METİN BİLDİRİ',
    tocBadge: 'Tam Metin',
    tr: 'Tam Metin Bildiri',
    en: 'Full Text',
  },
};

const CONFIG = {
  BRAND_NAME: 'WriteTec',
  BRAND_NAME_UPPER: 'WRITETEC',
  ADMIN_EMAIL: 'writetecbt@gmail.com',
  SEND_CONFIRMATION: true,
  /** E-posta logosu (web URL). Kullanılmıyorsa boş bırakın. */
  EMAIL_LOGO_URL: 'https://saglik-bilimleri-kongresi.vercel.app/img/writetec-logo.png',
  EMAIL_LOGO_LINK: 'https://www.congress.writetecbt.com/',
  /** .docx → Drive ile Google Doc'a çevirip bildiri kitabı dosyasına birleştir */
  MERGE_DOCX_INTO_BOOK: true,
  /**
   * Web uygulaması doPost ~30 sn ile sınırlı. true: dosyayı kaydedip hemen yanıt döner;
   * bildiri kitabına birleştirme / TOC / e-posta arka planda çalışır.
   */
  PROCESS_IN_BACKGROUND: true,
};

const PENDING_JOBS_KEY = 'BILDIRI_PENDING_SUBMISSION_JOBS';
const SUBMISSION_PROCESSOR_FN = 'processPendingSubmissionJobs_';

/** Sürüm damgası — ?action=ping ile doğrulanır; form parçalı yükleme desteğini bundan anlar. */
const CODE_VERSION = '2026-07-30-bildiri-1';
/** Kuyruk işi en fazla bu kadar denenir; sonra admin'e hata maili gider. */
const JOB_MAX_ATTEMPTS = 3;
/** Kuyruk döngüsü zaman bütçesi — 6 dk yürütme limitinde katledilmemek için. */
const QUEUE_TIME_BUDGET_MS = 4.5 * 60 * 1000;
/** İstemci gönderim kimliği kayıtları (yinelenme koruması + durum sorgusu). */
const SUBMISSION_STATE_PREFIX = 'BILDIRI_SUB_';
const SUBMISSION_STATE_TTL_MS = 48 * 60 * 60 * 1000;
/** Sheet'te ortak yazar sütununun başlığı. */
const CO_AUTHOR_HEADER = 'Ortak Yazarlar';
/**
 * Parçalı yükleme geçici klasörü (script sahibinin Drive'ında; id ScriptProperties'te önbellekli).
 * ⚠️ Kitap projesiyle aynı Drive hesabında olduğu için adı MUTLAKA farklı olmalıdır.
 */
const UPLOAD_TEMP_FOLDER_NAME = 'BILDIRI_FORM_YUKLEME_TEMP';
const UPLOAD_TEMP_FOLDER_PROP = 'BILDIRI_UPLOAD_TEMP_FOLDER_ID';
/** Bir parçalı yüklemede izin verilen sınırlar. */
const UPLOAD_MAX_CHUNKS = 12;
const UPLOAD_CHUNK_MAX_CHARS = 8 * 1024 * 1024; // 8M karakter base64 (~6 MB ham)

const TOC_HEADING_TEXT = 'İÇİNDEKİLER';
const TOC_PLACEHOLDER = '(Bildiriler gönderildikçe bu kısım güncellenecektir)';

/** Bildiri kitabı gövdesi — Times New Roman, siyah */
const BOOK_BODY_FONT = 'Times New Roman';
const BOOK_INK = '#000000';

// ──────────────────────────────────────────────────────────────
//  KONGRE KONFİGÜRASYONU YARDIMCILARI
// ──────────────────────────────────────────────────────────────

function getCongressConfig_(congressKey) {
  const key = String(congressKey || '').trim();
  if (!key) {
    throw new Error('Kongre seçilmedi.');
  }
  if (!Object.prototype.hasOwnProperty.call(BILDIRI_CONFIG, key)) {
    throw new Error('Geçersiz kongre anahtarı: ' + key);
  }
  const cfg = BILDIRI_CONFIG[key];
  if (!cfg.folderId || !cfg.docId || !cfg.sheetId) {
    throw new Error(
      '"' + cfg.label + '" kongresi için BILDIRI_CONFIG eksik: folderId / docId / sheetId alanlarını doldurunuz.'
    );
  }
  return Object.assign({ key: key }, cfg);
}

function eachConfiguredCongress_(callback) {
  Object.keys(BILDIRI_CONFIG).forEach(function (key) {
    const cfg = BILDIRI_CONFIG[key];
    if (!cfg.folderId || !cfg.docId || !cfg.sheetId) {
      Logger.log('⚠️ Atlandı (ID eksik): ' + cfg.label + ' [' + key + ']');
      return;
    }
    callback(Object.assign({ key: key }, cfg));
  });
}

/** 'ozet' | 'tammetin' — geçersizse hata fırlatır. */
function normalizeBildiriType_(raw) {
  const value = String(raw || '').trim().toLowerCase();
  if (!value) {
    throw new Error('Bildiri türü seçilmedi (özet / tam metin).');
  }
  if (!Object.prototype.hasOwnProperty.call(BILDIRI_TYPES, value)) {
    throw new Error('Geçersiz bildiri türü: ' + value);
  }
  return value;
}

/** 'tr' | 'en' — tanınmayan değerlerde Türkçeye düşer. */
function normalizeLang_(raw) {
  return String(raw || '').trim().toLowerCase() === 'en' ? 'en' : 'tr';
}

/** Kongre adının seçilen dildeki karşılığı (labelEn yoksa Türkçesi). */
function congressLabelForLang_(cfg, lang) {
  return lang === 'en' && cfg.labelEn ? cfg.labelEn : cfg.label;
}

/** Bildiri türünün seçilen dildeki etiketi ("Özet Bildiri" / "Full Text"). */
function bildiriTypeLabel_(bildiriType, lang) {
  const entry = BILDIRI_TYPES[bildiriType] || BILDIRI_TYPES.ozet;
  return lang === 'en' ? entry.en : entry.tr;
}

// ──────────────────────────────────────────────────────────────
//  PARAGRAF / METİN YARDIMCILARI
// ──────────────────────────────────────────────────────────────

function applyParagraphFont_(paragraph, fontSizePt, bold, italic, color) {
  const text = paragraph.editAsText();
  const len = text.getText().length;
  if (len === 0) return;
  const end = len - 1;
  text.setFontFamily(0, end, BOOK_BODY_FONT);
  if (fontSizePt) text.setFontSize(0, end, fontSizePt);
  if (bold === true) text.setBold(0, end, true);
  if (italic === true) text.setItalic(0, end, true);
  text.setForegroundColor(0, end, color || BOOK_INK);
}

function toTitleCaseWord_(word) {
  if (!word) return word;
  const locale = isAsciiLatinWord_(word) ? 'en-US' : 'tr-TR';
  const lower = String(word).toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
}

function toTitleCaseTr_(s) {
  if (!s || !String(s).trim()) return '';
  return String(s)
    .trim()
    .split(/\s+/)
    .map(toTitleCaseWord_)
    .join(' ');
}

function toTitleCaseKeywordsDisplay_(s) {
  if (!s || !String(s).trim()) return '';
  return String(s)
    .split(',')
    .map(function (part) {
      return toTitleCaseTr_(part.trim());
    })
    .filter(Boolean)
    .join(', ');
}

function resolveUnvan_(a) {
  const unvan = (a.unvan || '').trim();
  if (/^di[ğg]er$/i.test(unvan)) {
    const diger = (a.unvanDiger || '').trim();
    return diger || '';
  }
  return unvan;
}

/**
 * Form her zaman kanonik Türkçe ünvanı gönderir (Doc/Sheet kaydı dilden
 * bağımsız tek tip kalsın diye — bkz. bildiri formundaki AUTHOR_UNVAN_ROWS).
 * Yalnızca İngilizce onay maili gösterimi için buradan çevrilir.
 */
const UNVAN_EN_MAP_ = {
  'Prof. Dr.': 'Prof. Dr.',
  'Doç. Dr.': 'Assoc. Prof. Dr.',
  'Dr. Öğr. Üyesi': 'Asst. Prof. Dr.',
  'Arş. Gör. Dr.': 'Res. Asst. Dr.',
  'Arş. Gör.': 'Res. Asst.',
  'Öğr. Gör. Dr.': 'Lecturer Dr.',
  'Öğr. Gör.': 'Lecturer',
  'Dr.': 'Dr.',
  'Uzm.': 'Specialist',
};

/** Yalnızca sabit listedeki ünvanları çevirir; serbest metin (Diğer) değişmeden kalır. */
function translateUnvanForLang_(unvan, lang) {
  if (normalizeLang_(lang) !== 'en') return unvan;
  return UNVAN_EN_MAP_[unvan] || unvan;
}

function formatAuthorDisplayLine_(a) {
  const unvan = resolveUnvan_(a);
  const nameTitle = toTitleCaseTr_([a.ad, a.soyad].filter(Boolean).join(' '));
  return [unvan, nameTitle].filter(Boolean).join(' ');
}

// ──────────────────────────────────────────────────────────────
//  KURULUM
// ──────────────────────────────────────────────────────────────

/** Tüm dolu kongreler için log sheet'lerini kurar. Doc'lara DOKUNMAZ. */
function setupBildiriSheets() {
  eachConfiguredCongress_(function (cfg) {
    Logger.log('▶ Sheet kuruluyor: ' + cfg.label);
    setupBildiriSheet_(cfg);
  });
  Logger.log('🎉 Log sheet kurulumu tamamlandı.');
}

/**
 * Tüm kongrelerin bildiri kitabı Doc'una İÇİNDEKİLER iskeletini ekler (idempotent).
 * Yalnızca docId gerektirir; folderId/sheetId henüz doldurulmamışsa bile çalışır.
 */
function ensureBildiriDocScaffolds() {
  Object.keys(BILDIRI_CONFIG).forEach(function (key) {
    const cfg = Object.assign({ key: key }, BILDIRI_CONFIG[key]);
    if (!cfg.docId) {
      Logger.log('⚠️ Atlandı (docId eksik): ' + cfg.label + ' [' + key + ']');
      return;
    }
    const added = ensureBildiriDocScaffold_(cfg);
    Logger.log((added ? '✅ İskele eklendi: ' : 'ℹ️ İskele zaten vardı: ') + cfg.label);
  });
}

function setupBildiriSheetFor(congressKey) {
  setupBildiriSheet_(getCongressConfig_(congressKey));
}

/**
 * Bildiri kitabı Doc'una başlık + İÇİNDEKİLER iskeletini ekler.
 *
 * ⚠️ YIKICI DEĞİLDİR: mevcut içerik ASLA silinmez (kitap.gs'teki body.clear()
 * çağrısı bilerek kaldırılmıştır — hedef Doc'lar canlı bildiri kitaplarıdır).
 * İÇİNDEKİLER başlığı zaten varsa hiçbir şey yapmaz ve false döner.
 */
function ensureBildiriDocScaffold_(cfg) {
  const doc = openDocWithRetry_(cfg.docId);
  const body = doc.getBody();

  for (let i = 0; i < body.getNumChildren(); i++) {
    const el = body.getChild(i);
    if (el.getType() === DocumentApp.ElementType.PARAGRAPH && paragraphIsTocHeading_(el.asParagraph())) {
      doc.saveAndClose();
      return false;
    }
  }

  // Mevcut içeriğin sonuna ekle; hiçbir şey silinmez.
  if (body.getNumChildren() > 0) ensureBookStartsOnNewPage_(body);

  const bookTitle = body.appendParagraph(cfg.label);
  bookTitle.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  bookTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  bookTitle.setSpacingBefore(72);
  bookTitle.setSpacingAfter(18);
  applyParagraphFont_(bookTitle, 18, true, false, null);

  const subtitle = body.appendParagraph('BİLDİRİ KİTABI');
  subtitle.setHeading(DocumentApp.ParagraphHeading.HEADING2);
  subtitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  subtitle.setSpacingAfter(18);
  applyParagraphFont_(subtitle, 14, true, false, null);

  const generatedAt = body.appendParagraph(
    'Oluşturulma Tarihi: ' + Utilities.formatDate(new Date(), 'Europe/Istanbul', 'dd.MM.yyyy')
  );
  generatedAt.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  generatedAt.setSpacingAfter(12);
  applyParagraphFont_(generatedAt, 11, false, false, null);

  const note = body.appendParagraph(
    'Bu doküman, özet ve tam metin bildiriler geldikçe otomatik olarak güncellenir. İçindekiler bölümü her eklemede yenilenir.'
  );
  note.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  note.setSpacingBefore(12);
  note.setSpacingAfter(0);
  applyParagraphFont_(note, 10, false, true, null);

  body.appendPageBreak();

  const tocTitle = body.appendParagraph(TOC_HEADING_TEXT);
  tocTitle.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  tocTitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  tocTitle.setSpacingAfter(10);
  applyParagraphFont_(tocTitle, 14, true, false, null);

  const tocPh = body.appendParagraph(TOC_PLACEHOLDER);
  tocPh.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  applyParagraphFont_(tocPh, 11, false, true, null);

  body.appendPageBreak();

  doc.saveAndClose();
  Logger.log('✅ Doc iskelesi hazırlandı (' + cfg.label + '): ' + doc.getUrl());
  return true;
}

function setupBildiriSheet_(book) {
  const ss = SpreadsheetApp.openById(book.sheetId);
  const sheet = ss.getSheets()[0];
  sheet.setName('Bildiri Kayıtları');

  sheet.clear({ contentsOnly: false });

  const headers = [
    'Sıra No',
    'Gönderim Zamanı',
    'Kongre',
    'Bildiri Başlığı',
    'Bildiri Türü',
    'Konu Alanı',
    'Anahtar Kelimeler',
    'Yazar Sayısı',
    'Sorumlu Yazar',
    'Kurum',
    'E-posta',
    'ORCID',
    'Dosya Adı',
    'Drive Linki',
    'Doc Bildiri',
    'Dil',
    CO_AUTHOR_HEADER,
  ];

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange
    .setBackground('#0b2d5a')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);

  try {
    const existing = sheet.getFilter();
    if (existing) existing.remove();
  } catch (e) { /* yok say */ }
  headerRange.createFilter();

  sheet.setRowHeight(1, 34);
  sheet.setColumnWidths(1, headers.length, 140);
  sheet.setColumnWidth(1, 70);   // Sıra No
  sheet.setColumnWidth(2, 160);  // Gönderim Zamanı
  sheet.setColumnWidth(3, 260);  // Kongre
  sheet.setColumnWidth(4, 360);  // Bildiri Başlığı
  sheet.setColumnWidth(5, 120);  // Bildiri Türü
  sheet.setColumnWidth(6, 200);  // Konu Alanı
  sheet.setColumnWidth(7, 240);  // Anahtar Kelimeler
  sheet.setColumnWidth(8, 100);  // Yazar Sayısı
  sheet.setColumnWidth(13, 220); // Dosya Adı
  sheet.setColumnWidth(14, 260); // Drive Linki
  sheet.setColumnWidth(15, 160); // Doc Bildiri
  sheet.setColumnWidth(16, 60);  // Dil
  sheet.setColumnWidth(17, 280); // Ortak Yazarlar
  sheet.getRange(1, 1, sheet.getMaxRows(), headers.length).setWrap(true);

  Logger.log('✅ Sheet hazırlandı (' + book.label + '): ' + ss.getUrl());
}

/** Canlı sheet'i sıfırlamadan ortak yazar sütununu ekler. */
function ensureCoAuthorColumn_(sheet) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  let column = headers.indexOf(CO_AUTHOR_HEADER) + 1;
  if (column) return column;
  column = Math.max(17, lastColumn + 1);
  sheet.getRange(1, column).setValue(CO_AUTHOR_HEADER)
    .setBackground('#0b2d5a').setFontColor('#ffffff').setFontWeight('bold');
  sheet.setColumnWidth(column, 280);
  return column;
}

// ──────────────────────────────────────────────────────────────
//  WEB HOOK
// ──────────────────────────────────────────────────────────────

function doPost(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  const params = (e && e.parameter) || {};

  // Parça yüklemeleri global lock'a girmez: her parça yalnızca kendi geçici
  // dosyasına yazar; kuyruk işlemcisinin uzun lock'una takılmamalı.
  if (params.action === 'uploadChunk') {
    try {
      output.setContent(JSON.stringify(handleUploadChunk_(params)));
    } catch (chunkErr) {
      Logger.log('uploadChunk HATA: ' + chunkErr.toString());
      output.setContent(JSON.stringify({ success: false, error: chunkErr.toString() }));
    }
    return output;
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    output.setContent(JSON.stringify({
      success: false,
      error: 'Sistem şu an yoğun. Lütfen birkaç saniye sonra tekrar deneyiniz.',
    }));
    return output;
  }

  try {
    // Yinelenme koruması: aynı submissionId daha önce kaydedildiyse (ör. yanıt
    // istemciye ulaşamadı ve retry geldi) satırı/dosyayı tekrar yazmadan başarı dön.
    const dupState = getSubmissionState_(sanitizeSubmissionId_(params.submissionId));
    if (dupState) {
      output.setContent(JSON.stringify({
        success: true,
        duplicate: true,
        queued: dupState.state !== 'done',
        message: 'Bu gönderim zaten alınmış.',
      }));
      return output;
    }
    if (params.action === 'finalizeUpload') {
      params.fileBase64 = assembleUploadChunks_(params);
    }
    handleSubmission_(params, output);
  } catch (err) {
    Logger.log('HATA: ' + err.toString() + '\n' + (err.stack || ''));
    output.setContent(JSON.stringify({
      success: false,
      error: err.toString(),
    }));
  } finally {
    lock.releaseLock();
  }

  return output;
}

/** Tek-atımlık ve finalize yollarının ortak gönderim boru hattı. */
function handleSubmission_(params, output) {
  const authors = JSON.parse(params.authors || '[]');

  if (!params.title || !authors.length) {
    output.setContent(JSON.stringify({ success: false, error: 'Eksik veri.' }));
    return;
  }

  let book;
  let bildiriType;
  try {
    book = getCongressConfig_(params.congressKey);
    bildiriType = normalizeBildiriType_(params.bildiriType);
  } catch (cfgErr) {
    output.setContent(JSON.stringify({ success: false, error: cfgErr.message }));
    return;
  }
  const lang = normalizeLang_(params.lang);

  const incomingName = String(params.fileName || '').trim();
  if (!incomingName || !incomingName.toLowerCase().endsWith('.docx')) {
    output.setContent(
      JSON.stringify({
        success: false,
        error: 'Sadece .docx formatında dosya kabul edilmektedir.',
      })
    );
    return;
  }

  if (!params.fileBase64 || !String(params.fileBase64).trim()) {
    output.setContent(JSON.stringify({ success: false, error: 'Dosya alınamadı (fileBase64).' }));
    return;
  }

  const jobParams = {
    title: params.title || '',
    subject: params.subject || '',
    keywords: params.keywords || '',
    fileName: params.fileName || '',
    bildiriType: bildiriType,
    lang: lang,
  };

  // saveFileToDrive_ ham yükü (fileBase64/fileMime) okur; jobParams'a bunlar
  // KONULMAZ çünkü iş kuyruğu ScriptProperties'e serileştirilir.
  params.bildiriType = bildiriType;
  const queueNumber = getNextQueueNumber_(book);
  const driveFile = saveFileToDrive_(params, queueNumber, authors[0], book);
  logToSheet_(jobParams, authors, queueNumber, driveFile, book);
  const submissionId = sanitizeSubmissionId_(params.submissionId);
  if (submissionId) setSubmissionState_(submissionId, 'saved');

  if (CONFIG.PROCESS_IN_BACKGROUND) {
    enqueueSubmissionJob_({
      congressKey: book.key,
      queueNumber: queueNumber,
      driveFileId: driveFile.getId(),
      params: jobParams,
      authorsJson: JSON.stringify(authors),
      submissionId: submissionId,
      attempts: 0,
      done: { merged: false, toc: false, mails: false, admin: false },
    });
    output.setContent(JSON.stringify({
      success: true,
      message: 'Dosyanız kaydedildi. Bildiri kitabına ekleniyor…',
      queued: true,
      pendingJobs: countPendingSubmissionJobs_(),
    }));
  } else {
    const inlineJob = {
      congressKey: book.key,
      queueNumber: queueNumber,
      driveFileId: driveFile.getId(),
      params: jobParams,
      authorsJson: JSON.stringify(authors),
      submissionId: submissionId,
      done: { merged: false, toc: false, mails: false, admin: false },
    };
    processSubmissionJob_(inlineJob);
    if (submissionId) setSubmissionState_(submissionId, 'done');
    output.setContent(JSON.stringify({
      success: true,
      message: 'Bildiriniz başarıyla alındı.',
    }));
  }
}

// ──────────────────────────────────────────────────────────────
//  PARÇALI YÜKLEME (büyük .docx dosyaları tek POST'ta kopuyor)
// ──────────────────────────────────────────────────────────────

function sanitizeUploadId_(raw) {
  const id = String(raw || '').trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
    throw new Error('Geçersiz yükleme kimliği.');
  }
  return id;
}

function getOrCreateUploadTempFolder_() {
  const props = PropertiesService.getScriptProperties();
  let cachedId = props.getProperty(UPLOAD_TEMP_FOLDER_PROP);
  if (cachedId) {
    try {
      const cached = DriveApp.getFolderById(cachedId);
      if (!cached.isTrashed()) return cached;
    } catch (e) { /* önbellek bayat — yeniden bul/oluştur */ }
  }
  // uploadChunk kilitsiz çalıştığı için ilk kullanımda eşzamanlı istekler
  // yinelenen klasör oluşturabilir. Script kilidi KULLANILMAZ (finalizeUpload
  // yolu doPost kilidi altında buraya girer; aynı yürütmede kilidi yeniden
  // alıp bırakmak doPost'un kilidini erken düşürebilir). Bunun yerine kilitsiz
  // deterministik dedup: yarışan her istek aynı "kanonik" (en eski) klasöre
  // yakınsar; kendi oluşturduğu kopya kanonik değilse onu çöpe atar.
  const existing = DriveApp.getFoldersByName(UPLOAD_TEMP_FOLDER_NAME);
  let folder = existing.hasNext() ? existing.next() : null;
  let created = null;
  if (!folder) {
    created = DriveApp.createFolder(UPLOAD_TEMP_FOLDER_NAME);
    folder = created;
  }
  // Kanonik seçim: aynı ada sahip tüm klasörler içinde en eski olan
  // (eşitlikte id sırası). Tüm yarışanlar aynı sonuca ulaşır.
  const all = DriveApp.getFoldersByName(UPLOAD_TEMP_FOLDER_NAME);
  let canonical = folder;
  while (all.hasNext()) {
    const f = all.next();
    const fT = f.getDateCreated().getTime();
    const cT = canonical.getDateCreated().getTime();
    if (fT < cT || (fT === cT && f.getId() < canonical.getId())) canonical = f;
  }
  if (created && created.getId() !== canonical.getId()) {
    try { created.setTrashed(true); } catch (e) { /* yok say */ }
  }
  props.setProperty(UPLOAD_TEMP_FOLDER_PROP, canonical.getId());
  return canonical;
}

function chunkFileName_(uploadId, index) {
  return 'chunk_' + uploadId + '_' + index;
}

function handleUploadChunk_(params) {
  const uploadId = sanitizeUploadId_(params.uploadId);
  const chunkIndex = parseInt(params.chunkIndex, 10);
  const totalChunks = parseInt(params.totalChunks, 10);
  const chunkData = String(params.chunkData || '');

  if (isNaN(chunkIndex) || isNaN(totalChunks) || chunkIndex < 0 || totalChunks < 1 ||
      totalChunks > UPLOAD_MAX_CHUNKS || chunkIndex >= totalChunks) {
    throw new Error('Geçersiz parça bilgisi.');
  }
  if (!chunkData || chunkData.length > UPLOAD_CHUNK_MAX_CHARS) {
    throw new Error('Parça verisi boş veya çok büyük.');
  }

  const folder = getOrCreateUploadTempFolder_();
  const name = chunkFileName_(uploadId, chunkIndex);
  // Aynı parça yeniden denenirse eskisini çöpe at (idempotent retry).
  const dupes = folder.getFilesByName(name);
  while (dupes.hasNext()) dupes.next().setTrashed(true);
  folder.createFile(name, chunkData, 'text/plain');

  return { success: true, received: chunkIndex, totalChunks: totalChunks };
}

function assembleUploadChunks_(params) {
  const uploadId = sanitizeUploadId_(params.uploadId);
  const totalChunks = parseInt(params.totalChunks, 10);
  if (isNaN(totalChunks) || totalChunks < 1 || totalChunks > UPLOAD_MAX_CHUNKS) {
    throw new Error('Geçersiz parça sayısı.');
  }

  const folder = getOrCreateUploadTempFolder_();
  const parts = [];
  const chunkFiles = [];
  for (let i = 0; i < totalChunks; i++) {
    const it = folder.getFilesByName(chunkFileName_(uploadId, i));
    if (!it.hasNext()) {
      throw new Error('Yükleme parçası eksik (' + (i + 1) + '/' + totalChunks + '). Lütfen tekrar deneyiniz.');
    }
    const f = it.next();
    parts.push(f.getBlob().getDataAsString());
    chunkFiles.push(f);
  }

  chunkFiles.forEach(function (f) {
    try { f.setTrashed(true); } catch (e) { /* yok say */ }
  });
  cleanupStaleUploadChunks_(folder);

  return parts.join('');
}

/** 24 saatten eski, finalize edilmemiş parça dosyalarını fırsatçı temizler. */
function cleanupStaleUploadChunks_(folder) {
  try {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const files = folder.getFiles();
    while (files.hasNext()) {
      const f = files.next();
      if (f.getName().indexOf('chunk_') === 0 && f.getLastUpdated().getTime() < cutoff) {
        f.setTrashed(true);
      }
    }
  } catch (e) {
    Logger.log('cleanupStaleUploadChunks_: ' + e);
  }
}

function sanitizeSubmissionId_(raw) {
  const id = String(raw || '').trim();
  if (!id) return '';
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) throw new Error('Geçersiz gönderim kimliği.');
  return id;
}

function submissionPropertyKey_(submissionId) {
  return SUBMISSION_STATE_PREFIX + submissionId;
}

function getSubmissionState_(submissionId) {
  if (!submissionId) return null;
  const props = PropertiesService.getScriptProperties();
  const key = submissionPropertyKey_(submissionId);
  const raw = props.getProperty(key);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (!value || !value.savedAt || Date.now() - value.savedAt > SUBMISSION_STATE_TTL_MS) {
      props.deleteProperty(key);
      return null;
    }
    return value;
  } catch (e) {
    props.deleteProperty(key);
    return null;
  }
}

function setSubmissionState_(submissionId, state) {
  if (!submissionId) return;
  const props = PropertiesService.getScriptProperties();
  const key = submissionPropertyKey_(submissionId);
  props.setProperty(key, JSON.stringify({ state: state, savedAt: Date.now() }));
  const all = props.getProperties();
  Object.keys(all).forEach(function (propKey) {
    if (propKey.indexOf(SUBMISSION_STATE_PREFIX) !== 0 || propKey === key) return;
    try {
      const value = JSON.parse(all[propKey]);
      if (!value.savedAt || Date.now() - value.savedAt > SUBMISSION_STATE_TTL_MS) props.deleteProperty(propKey);
    } catch (e) {
      props.deleteProperty(propKey);
    }
  });
}

// ──────────────────────────────────────────────────────────────
//  ARKA PLAN İŞ KUYRUĞU (doPost 30 sn limiti)
// ──────────────────────────────────────────────────────────────

function enqueueSubmissionJob_(job) {
  const props = PropertiesService.getScriptProperties();
  const jobs = JSON.parse(props.getProperty(PENDING_JOBS_KEY) || '[]');
  jobs.push(job);
  props.setProperty(PENDING_JOBS_KEY, JSON.stringify(jobs));
}

function popNextSubmissionJob_() {
  const props = PropertiesService.getScriptProperties();
  const jobs = JSON.parse(props.getProperty(PENDING_JOBS_KEY) || '[]');
  if (!jobs.length) return null;
  const job = jobs.shift();
  if (jobs.length) {
    props.setProperty(PENDING_JOBS_KEY, JSON.stringify(jobs));
  } else {
    props.deleteProperty(PENDING_JOBS_KEY);
  }
  return job;
}

/**
 * Kuyruk işlemcisini kurar — yalnızca Apps Script editöründen çalıştırın (doPost yetkisi yok).
 * setupAllBooks() bunu otomatik çağırır; ayrıca bir kez elle de çalıştırabilirsiniz.
 */
function installSubmissionProcessorTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === SUBMISSION_PROCESSOR_FN) {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger(SUBMISSION_PROCESSOR_FN).timeBased().everyMinutes(1).create();
  Logger.log('✅ Gönderim kuyruğu: processPendingSubmissionJobs_ dakikada bir çalışacak.');
}

function countPendingSubmissionJobs_() {
  const raw = PropertiesService.getScriptProperties().getProperty(PENDING_JOBS_KEY) || '[]';
  try {
    return JSON.parse(raw).length;
  } catch (e) {
    return 0;
  }
}

function processPendingSubmissionJobsCore_() {
  let processed = 0;
  let lastError = null;
  const startedAt = Date.now();
  while (true) {
    if (Date.now() - startedAt >= QUEUE_TIME_BUDGET_MS) {
      Logger.log('Kuyruk zaman bütçesine ulaştı; kalan işler sonraki çalışmaya bırakıldı.');
      break;
    }
    const job = popNextSubmissionJob_();
    if (!job) break;
    try {
      processSubmissionJob_(job);
      processed += 1;
      // Sonraki işe geçmeden önce Google Doc API/servis kotalarını zorlamamak için kısa bir süre bekleyelim
      const nextPending = countPendingSubmissionJobs_();
      if (nextPending > 0) {
        Logger.log('Kuyrukta bekleyen ' + nextPending + ' iş var. Sonraki işe geçmeden önce 3 saniye bekleniyor...');
        Utilities.sleep(3000);
      }
    } catch (jobErr) {
      lastError = jobErr;
      Logger.log(
        'Kuyruk işi hatası (#' + job.queueNumber + ' ' + job.congressKey + '): ' +
        jobErr.toString() + '\n' + (jobErr.stack || '')
      );
      job.attempts = Number(job.attempts || 0) + 1;
      if (job.attempts < JOB_MAX_ATTEMPTS) {
        enqueueSubmissionJob_(job);
        Logger.log('Kuyruk işi yeniden sıraya alındı: deneme ' + (job.attempts + 1) + '/' + JOB_MAX_ATTEMPTS);
        // Hata durumunda Google Docs servisinin kendine gelmesi ve eşzamanlama yapabilmesi için üstel bekleme süresi uygulayalım
        const sleepTime = 5000 * job.attempts;
        Logger.log('Hata sonrası ' + sleepTime + 'ms beklenecek.');
        Utilities.sleep(sleepTime);
      } else {
        const subject = '[Bildiri kuyruğu hatası] #' + job.queueNumber;
        const body = 'İş ' + JOB_MAX_ATTEMPTS + ' denemede tamamlanamadı.\n\n' +
          'Kongre: ' + job.congressKey + '\nSıra: #' + job.queueNumber + '\nHata: ' + jobErr;
        try { MailApp.sendEmail(CONFIG.ADMIN_EMAIL, subject, body); } catch (mailErr) { Logger.log('Hata maili gönderilemedi: ' + mailErr); }
      }
    }
  }
  return { processed: processed, lastError: lastError };
}

/** Web uygulaması (doGet) veya tetikleyici — bekleyen gönderimleri işler */
function runSubmissionQueueProcessor_() {
  const pendingBefore = countPendingSubmissionJobs_();
  if (pendingBefore < 1) {
    return { ok: true, processed: 0, pending: 0, message: 'Bekleyen iş yok.' };
  }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(300000)) {
    return { ok: false, retry: true, pending: pendingBefore, error: 'Kuyruk şu an meşgul.' };
  }

  let result;
  try {
    result = processPendingSubmissionJobsCore_();
  } finally {
    lock.releaseLock();
  }

  const pendingAfter = countPendingSubmissionJobs_();
  const errMsg = result.lastError
    ? String((result.lastError && result.lastError.message) || result.lastError)
    : null;

  return {
    ok: result.processed > 0 && !errMsg,
    processed: result.processed,
    pending: pendingAfter,
    error: errMsg,
    message: result.processed > 0
      ? result.processed + ' gönderim işlendi.'
      : 'İşlenecek gönderim bulunamadı.',
  };
}

/** Tetikleyici veya editörden manuel — bekleyen gönderimleri işler */
function processPendingSubmissionJobs_() {
  const r = runSubmissionQueueProcessor_();
  Logger.log('Kuyruk: ' + JSON.stringify(r));
}

function processSubmissionJob_(job) {
  const book = getCongressConfig_(job.congressKey);
  const driveFile = DriveApp.getFileById(job.driveFileId);
  const params = job.params || {};
  const authors = JSON.parse(job.authorsJson || '[]');
  const queueNumber = job.queueNumber;

  job.done = job.done || {};
  if (!job.done.merged) {
    appendToBildiriDoc_(params, authors, queueNumber, driveFile, book);
    job.done.merged = true;
  }
  if (!job.done.toc) {
    updateTableOfContents_(book);
    job.done.toc = true;
  }
  if (!job.done.mails && CONFIG.SEND_CONFIRMATION) {
    sendConfirmationEmail_(params, authors, queueNumber, book);
    job.done.mails = true;
  } else if (!CONFIG.SEND_CONFIRMATION) {
    job.done.mails = true;
  }
  if (!job.done.admin) {
    sendAdminNotification_(params, authors, queueNumber, driveFile, book);
    job.done.admin = true;
  }
  if (job.submissionId) setSubmissionState_(job.submissionId, 'done');
  Logger.log('✅ Arka plan işi tamamlandı: ' + book.label + ' #' + queueNumber);
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.action === 'ping') {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, version: CODE_VERSION, chunkedUpload: true })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  if (params.action === 'processQueue') {
    const result = runSubmissionQueueProcessor_();
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  }
  if (params.action === 'checkSubmission') {
    const state = getSubmissionState_(sanitizeSubmissionId_(params.submissionId));
    return ContentService.createTextOutput(JSON.stringify({ found: !!state, state: state ? state.state : null }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({
      status: 'Kongre bildiri gönderim sistemi aktif.',
      pendingJobs: countPendingSubmissionJobs_(),
      congresses: Object.keys(BILDIRI_CONFIG).map(function (k) {
        return { key: k, label: BILDIRI_CONFIG[k].label };
      }),
      bildiriTypes: Object.keys(BILDIRI_TYPES),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ──────────────────────────────────────────────────────────────
//  SIRA / DRIVE KAYIT
// ──────────────────────────────────────────────────────────────

function getNextQueueNumber_(book) {
  const ss = SpreadsheetApp.openById(book.sheetId);
  const sheet = ss.getSheets()[0];
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) {
    throw new Error('Log sheet boş veya başlık yok. Önce setupSheetForBook("' + book.key + '") çalıştırın.');
  }
  return lastRow;
}

function saveFileToDrive_(params, queueNo, firstAuthor, book) {
  const folder = DriveApp.getFolderById(book.folderId);

  const soyadSlug = (firstAuthor.soyad || 'Yazar').toUpperCase().replace(/\s+/g, '_');
  const titleSlug = (params.title || 'Bildiri')
    .substring(0, 30)
    .replace(/[^a-zA-ZğüşöçıİĞÜŞÖÇ0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const paddedNo = String(queueNo).padStart(3, '0');

  const raw = Utilities.base64Decode(params.fileBase64);
  const origName = params.fileName || 'bildiri.docx';
  const ext = origName.lastIndexOf('.') >= 0 ? origName.substring(origName.lastIndexOf('.')) : '.docx';
  const declaredMime = params.fileMime || 'application/octet-stream';
  const mime = resolveUploadMime_(origName, declaredMime);
  const typeSlug = params.bildiriType === 'tammetin' ? 'TAMMETIN' : 'OZET';

  const fileBlob = Utilities.newBlob(
    raw, mime, paddedNo + '_' + typeSlug + '_' + soyadSlug + '_' + titleSlug + ext
  );
  const savedFile = folder.createFile(fileBlob);
  savedFile.setDescription(
    'Kongre: ' + book.label + ' | ' + bildiriTypeLabel_(params.bildiriType, 'tr') +
    ' #' + queueNo + ' | ' + params.title +
    ' | ' + firstAuthor.ad + ' ' + firstAuthor.soyad
  );
  return savedFile;
}

function resolveUploadMime_(fileName, declaredMime) {
  const fn = (fileName || '').toLowerCase();
  const dm = (declaredMime || '').trim() || 'application/octet-stream';
  if (fn.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (fn.endsWith('.doc')) {
    return 'application/msword';
  }
  if (fn.endsWith('.pdf')) {
    return MimeType.PDF;
  }
  return dm;
}

function ensureBlobMimeMatchesFilename_(blob, fileName) {
  const want = resolveUploadMime_(fileName, blob.getContentType());
  if (!want || want === blob.getContentType()) {
    return blob;
  }
  return Utilities.newBlob(blob.getBytes(), want, blob.getName());
}

function truncateForDoc_(s, maxLen) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) {
    return t;
  }
  return t.substring(0, maxLen - 1) + '…';
}

// ──────────────────────────────────────────────────────────────
//  DOCX → GOOGLE DOC (Drive Advanced Service v3)
// ──────────────────────────────────────────────────────────────

function convertOfficeBlobToGoogleDocId_(blob, fileName, parentFolderId) {
  if (typeof Drive === 'undefined' || typeof Drive.Files === 'undefined') {
    const msg =
      'Drive API gelişmiş hizmeti tanımlı değil (Drive is not defined). ' +
      'Apps Script: Hizmetler → "Google Drive API" v3 ekleyin; GCP projesinde Drive API etkin olsun; yeniden yetkilendirin.';
    Logger.log('convertOfficeBlobToGoogleDocId_: ' + msg);
    return { id: null, error: msg };
  }
  const blobReady = ensureBlobMimeMatchesFilename_(blob, fileName);
  const titleBase = fileName || 'bolum';
  try {
    const resource = {
      name: titleBase.replace(/\.[^/.]+$/, '') + '_gecici_gdoc',
      mimeType: MimeType.GOOGLE_DOCS,
      parents: [parentFolderId],
    };
    const inserted = Drive.Files.create(resource, blobReady, {
      fields: 'id',
      supportsAllDrives: true,
    });
    if (inserted && inserted.id) {
      return { id: inserted.id, error: null };
    }
    const msg = 'Drive.Files.create yanıtında dosya kimliği dönmedi.';
    Logger.log('convertOfficeBlobToGoogleDocId_: ' + msg);
    return { id: null, error: msg };
  } catch (err) {
    const msg = String((err && err.message) || err);
    Logger.log('convertOfficeBlobToGoogleDocId_: ' + msg);
    return { id: null, error: truncateForDoc_(msg, 400) };
  }
}

// ──────────────────────────────────────────────────────────────
//  KİTAP DOC'UNA EKLEME
// ──────────────────────────────────────────────────────────────

function isWordDriveFile_(driveFile) {
  const mime = driveFile.getMimeType() || '';
  const name = (driveFile.getName() || '').toLowerCase();
  if (mime === MimeType.MICROSOFT_WORD || mime === 'application/msword') return true;
  if (mime.indexOf('wordprocessingml') >= 0) return true;
  if (name.endsWith('.docx') || name.endsWith('.doc')) return true;
  return false;
}

function ensureBookStartsOnNewPage_(body) {
  const n = body.getNumChildren();
  if (n <= 0) return;
  for (let i = n - 1; i >= 0; i--) {
    const el = body.getChild(i);
    const type = el.getType();
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      const t = (el.asParagraph().getText() || '').trim();
      if (t === '') continue;
    }
    if (type === DocumentApp.ElementType.PAGE_BREAK || type === DocumentApp.ElementType.SECTION_BREAK) {
      return;
    }
    break;
  }
  body.appendPageBreak();
}

function appendToBildiriDoc_(params, authors, queueNo, driveFile, book) {
  const footerText = buildChapterFirstPageFooterText_(authors);
  const hasFirstPageFooter = createChapterFirstPageFooter_(book.docId, footerText);
  let doc = openDocWithRetry_(book.docId);
  let body = doc.getBody();

  // Docs API ile yeni bildiri zaten yeni sayfada başlatıldı. API erişilemiyorsa
  // eski güvenli sayfa sonu davranışını koru.
  if (!hasFirstPageFooter) ensureBookStartsOnNewPage_(body);

  const divider = body.appendParagraph('─'.repeat(80));
  divider.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  applyParagraphFont_(divider, 9, false, false, null);

  // "ÖZET BİLDİRİ #12" / "TAM METİN BİLDİRİ #13"
  const typeEntry = BILDIRI_TYPES[params.bildiriType] || BILDIRI_TYPES.ozet;
  const numPara = body.appendParagraph(typeEntry.docHeading + ' #' + queueNo);
  numPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  applyParagraphFont_(numPara, 10, false, true, null);

  const titleText = (params.title || '').trim().toLocaleUpperCase('tr-TR');
  const titlePara = body.appendParagraph(titleText);
  titlePara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  titlePara.setSpacingAfter(6);
  applyParagraphFont_(titlePara, 13, true, false, null);

  // Sorumlu yazar bildirinin ilk sayfasında sağ üstte görünür. Kurum, e-posta
  // ve ORCID bilgileri ise sadece bu bildirinin ilk sayfa footer'ına yazılır.
  authors.forEach(function (a, i) {
    const displayName = formatAuthorDisplayLine_(a);
    const namePara = body.appendParagraph(displayName);
    namePara.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    namePara.setSpacingAfter(i < authors.length - 1 ? 2 : 8);
    applyParagraphFont_(namePara, 11, false, false, null);
  });
  if (!hasFirstPageFooter && footerText) appendChapterFooterFallback_(body, footerText);

  // Konu Alanı, Anahtar Kelimeler ve TAM METİN başlığı yazılmaz
  // (Madde 1: kapak sayfasında bu bilgiler artık yer almayacak)

  const isWord = isWordDriveFile_(driveFile);
  let merged = false;
  let wordConversionError = null;
  let hadGdocFromConversion = false;

  if (CONFIG.MERGE_DOCX_INTO_BOOK && isWord) {
    const blob = driveFile.getBlob();
    const conv = convertOfficeBlobToGoogleDocId_(blob, driveFile.getName(), book.folderId);
    wordConversionError = conv.error;
    if (conv.id) {
      hadGdocFromConversion = true;
      try {
        copyGoogleDocContentRich(conv.id, body);
        merged = true;
      } catch (copyErr) {
        Logger.log('copyGoogleDocContentRich: ' + copyErr);
        const errP = body.appendParagraph(
          '[Tam metin birleştirilirken hata: ' + String((copyErr && copyErr.message) || copyErr) + ']'
        );
        errP.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        applyParagraphFont_(errP, 10, false, false, null);
      }
      try {
        DriveApp.getFileById(conv.id).setTrashed(true);
      } catch (trErr) {
        Logger.log('Geçici GDoc çöpe atılamadı: ' + trErr);
      }
    }
  }

  if (!merged && isWord && CONFIG.MERGE_DOCX_INTO_BOOK && !hadGdocFromConversion) {
    let wMsg =
      'Word dosyası Google Doc biçimine dönüştürülemedi (Drive API / dönüştürme). Lütfen yönetici konsolda Drive API ve Gelişmiş Hizmetleri kontrol edin.';
    if (wordConversionError) {
      wMsg += ' Teknik ayrıntı: ' + wordConversionError;
    }
    const wP = body.appendParagraph(wMsg);
    wP.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    applyParagraphFont_(wP, 10, false, false, null);
    const adminHint = body.appendParagraph(
      '[Yönetici: Apps Script → Hizmetler → Google Drive API v3; GCP projesinde Drive API etkin; yeniden yetkilendirin.]'
    );
    adminHint.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    applyParagraphFont_(adminHint, 9, false, true, null);
  }

  body.appendPageBreak();
  doc.saveAndClose();
  Logger.log(
    '✅ ' + typeEntry.docHeading + ' #' + queueNo + ' "' + book.label + '" bildiri kitabına eklendi.'
  );
}

function buildChapterFirstPageFooterText_(authors) {
  return authors.map(function (author, index) {
    const details = [];
    if ((author.kurum || '').trim()) details.push((author.kurum || '').trim());
    if ((author.email || '').trim()) details.push((author.email || '').trim());
    if ((author.orcid || '').trim()) details.push('ORCID: ' + (author.orcid || '').trim());
    return [superscriptNumber_(index + 1) + ' ' + formatAuthorDisplayLine_(author), details.join(' · ')]
      .filter(Boolean).join(' — ');
  }).filter(Boolean).join('\n');
}

/**
 * Her bildiri için yeni bir Docs section açar ve yalnızca o section'ın ilk
 * sayfasına footer ekler. Böylece yazar bilgileri kitabın diğer bildirilerine
 * veya aynı bildirinin sonraki sayfalarına yayılmaz.
 */
function createChapterFirstPageFooter_(docId, footerText) {
  if (!footerText || typeof Docs === 'undefined' || !Docs.Documents) return false;
  try {
    const docJson = Docs.Documents.get(docId);
    const content = (((docJson || {}).body || {}).content || []);
    if (!content.length) throw new Error('Belge gövdesi bulunamadı.');
    const sectionIndex = Number(content[content.length - 1].endIndex) - 1;

    Docs.Documents.batchUpdate({ requests: [{
      insertSectionBreak: { location: { index: sectionIndex }, sectionType: 'NEXT_PAGE' },
    }] }, docId);
    Docs.Documents.batchUpdate({ requests: [{
      updateSectionStyle: {
        range: { startIndex: sectionIndex, endIndex: sectionIndex + 1 },
        sectionStyle: { useFirstPageHeaderFooter: true },
        fields: 'useFirstPageHeaderFooter',
      },
    }] }, docId);
    const footerResponse = Docs.Documents.batchUpdate({ requests: [{
      createFooter: { type: 'FIRST_PAGE', sectionBreakLocation: { index: sectionIndex } },
    }] }, docId);
    const footerId = footerResponse.replies[0].createFooter.footerId;
    Docs.Documents.batchUpdate({ requests: [
      { insertText: { location: { segmentId: footerId, index: 0 }, text: footerText } },
      { updateTextStyle: { range: { segmentId: footerId, startIndex: 0, endIndex: footerText.length }, textStyle: { weightedFontFamily: { fontFamily: BOOK_BODY_FONT }, fontSize: { magnitude: 9, unit: 'PT' } }, fields: 'weightedFontFamily,fontSize' } },
      { updateParagraphStyle: { range: { segmentId: footerId, startIndex: 0, endIndex: footerText.length }, paragraphStyle: { alignment: 'END' }, fields: 'alignment' } },
    ] }, docId);
    return true;
  } catch (error) {
    Logger.log('İlk sayfa footer oluşturulamadı; görünür fallback kullanılacak: ' + error);
    return false;
  }
}

function appendChapterFooterFallback_(body, footerText) {
  const divider = body.appendParagraph('─'.repeat(80));
  divider.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  applyParagraphFont_(divider, 8, false, false, null);
  footerText.split('\n').forEach(function (line) {
    const paragraph = body.appendParagraph(line);
    paragraph.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
    applyParagraphFont_(paragraph, 9, false, false, null);
  });
}

function findTokenIndexInDocs_(documentJson, token) {
  const content = (((documentJson || {}).body || {}).content || []);
  for (let i = 0; i < content.length; i++) {
    const paragraph = content[i].paragraph;
    const elements = paragraph && paragraph.elements || [];
    for (let j = 0; j < elements.length; j++) {
      const element = elements[j];
      const textRun = element.textRun;
      const text = textRun && textRun.content || '';
      const at = text.indexOf(token);
      if (at >= 0) return Number(element.startIndex) + at;
    }
  }
  return -1;
}

function createGoogleDocsFootnotes_(docId, footnotes) {
  if (!footnotes.length) return [];
  const failed = [];
  if (typeof Docs === 'undefined' || !Docs.Documents) {
    Logger.log('Google Docs API hizmeti yok; görünür dipnot fallback\'i kullanılıyor.');
    return footnotes;
  }
  footnotes.forEach(function (footnote) {
    try {
      let documentJson = Docs.Documents.get(docId);
      let tokenIndex = findTokenIndexInDocs_(documentJson, footnote.token);
      if (tokenIndex < 0) throw new Error('Dipnot tokenı bulunamadı: ' + footnote.token);
      const create = Docs.Documents.batchUpdate({ requests: [{ createFootnote: { location: { index: tokenIndex } } }] }, docId);
      const footnoteId = create.replies[0].createFootnote.footnoteId;
      documentJson = Docs.Documents.get(docId);
      tokenIndex = findTokenIndexInDocs_(documentJson, footnote.token);
      if (tokenIndex < 0) throw new Error('Dipnot tokenı oluşturma sonrası bulunamadı.');
      Docs.Documents.batchUpdate({ requests: [
        { deleteContentRange: { range: { startIndex: tokenIndex, endIndex: tokenIndex + footnote.token.length } } },
        { insertText: { location: { segmentId: footnoteId, index: 0 }, text: footnote.text } },
        { updateTextStyle: { range: { segmentId: footnoteId, startIndex: 0, endIndex: footnote.text.length }, textStyle: { weightedFontFamily: { fontFamily: BOOK_BODY_FONT }, fontSize: { magnitude: 10, unit: 'PT' } }, fields: 'weightedFontFamily,fontSize' } },
      ] }, docId);
    } catch (err) {
      Logger.log('Gerçek dipnot eklenemedi (' + footnote.token + '): ' + err);
      failed.push(footnote);
    }
  });
  return failed;
}

function appendFallbackFootnotes_(body, footnotes) {
  footnotes.forEach(function (footnote) {
    const marker = superscriptNumber_(footnote.number);
    body.replaceText(escapeRegex_(footnote.token), marker);
  });
  const divider = body.appendParagraph('─'.repeat(80));
  divider.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  applyParagraphFont_(divider, 8, false, false, null);
  footnotes.forEach(function (footnote) {
    const para = body.appendParagraph('[' + footnote.number + '] ' + footnote.text);
    para.setAlignment(DocumentApp.HorizontalAlignment.LEFT);
    applyParagraphFont_(para, 9, false, false, null);
  });
}

function superscriptNumber_(number) {
  const chars = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(number).split('').map(function (digit) { return chars[digit] || digit; }).join('');
}

function escapeRegex_(value) {
  return String(value).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

// ──────────────────────────────────────────────────────────────
//  İÇİNDEKİLER (Sheet → Doc)
// ──────────────────────────────────────────────────────────────

function normalizeTocHeadingText_(raw) {
  return String(raw || '')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function paragraphIsTocHeading_(para) {
  return normalizeTocHeadingText_(para.getText()) === TOC_HEADING_TEXT;
}

function findTocRegionEndIndex_(body, headingIndex) {
  for (let i = headingIndex + 1; i < body.getNumChildren(); i++) {
    const el = body.getChild(i);
    const type = el.getType();
    if (type === DocumentApp.ElementType.PAGE_BREAK || type === DocumentApp.ElementType.SECTION_BREAK) {
      return i;
    }
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      const raw = el.asParagraph().getText().trim();
      if (raw.length >= 20 && /^[─\-_\s]{20,}$/.test(raw)) {
        return i;
      }
      // "BÖLÜM #1" (kitap mirası) ve "ÖZET BİLDİRİ #1" / "TAM METİN BİLDİRİ #1"
      if (/^((ÖZET|TAM METİN)\s+)?(BÖLÜM|BİLDİRİ)\s*#\d+/i.test(raw)) {
        return i;
      }
    }
  }
  return -1;
}

function updateTableOfContents_(book) {
  const ss = SpreadsheetApp.openById(book.sheetId);
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    Logger.log('TOC atlandı (' + book.label + '): Sheet boş.');
    return;
  }

  const doc = openDocWithRetry_(book.docId);
  const body = doc.getBody();

  let tocHeadingIndex = -1;
  for (let i = 0; i < body.getNumChildren(); i++) {
    const el = body.getChild(i);
    if (el.getType() === DocumentApp.ElementType.PARAGRAPH && paragraphIsTocHeading_(el.asParagraph())) {
      tocHeadingIndex = i;
      break;
    }
  }

  if (tocHeadingIndex < 0) {
    Logger.log('TOC atlandı (' + book.label + '): "İÇİNDEKİLER" başlığı bulunamadı.');
    doc.saveAndClose();
    return;
  }

  const tocEndIndex = findTocRegionEndIndex_(body, tocHeadingIndex);
  if (tocEndIndex < 0) {
    Logger.log('TOC atlandı (' + book.label + '): TOC bitiş sınırı bulunamadı.');
    doc.saveAndClose();
    return;
  }

  for (let j = tocEndIndex - 1; j > tocHeadingIndex; j--) {
    body.getChild(j).removeFromParent();
  }

  // Sheet sütun düzeni: 1=Sıra No, 2=Zaman, 3=Kongre, 4=Bildiri Başlığı, 5=Bildiri Türü ...
  let insertPos = tocHeadingIndex;
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const no = row[0];
    const title = row[3] || '';
    const typeBadge = String(row[4] || '').trim();
    if (title === '' && no === '') continue;
    const line = no + '. ' + title + (typeBadge ? '  (' + typeBadge + ')' : '');
    insertPos += 1;
    const p = body.insertParagraph(insertPos, line);
    p.setHeading(DocumentApp.ParagraphHeading.NORMAL);
    p.setSpacingAfter(3);
    applyParagraphFont_(p, 11, false, false, null);
  }

  const afterLastToc = insertPos + 1;
  const nextEl = afterLastToc < body.getNumChildren() ? body.getChild(afterLastToc) : null;
  const nextIsBreak =
    nextEl &&
    (nextEl.getType() === DocumentApp.ElementType.PAGE_BREAK ||
      nextEl.getType() === DocumentApp.ElementType.SECTION_BREAK);
  if (!nextIsBreak) {
    body.insertPageBreak(afterLastToc);
  }

  doc.saveAndClose();
  Logger.log('✅ İçindekiler güncellendi: ' + book.label);
}

function repairBildiriToc(congressKey) {
  updateTableOfContents_(getCongressConfig_(congressKey));
}

function repairAllTocs() {
  eachConfiguredCongress_(function (cfg) {
    updateTableOfContents_(cfg);
  });
}

// ──────────────────────────────────────────────────────────────
//  LOG SHEET'E YAZMA
// ──────────────────────────────────────────────────────────────

function logToSheet_(params, authors, queueNo, driveFile, book) {
  const ss = SpreadsheetApp.openById(book.sheetId);
  const sheet = ss.getSheets()[0];

  const firstAuthor = authors[0];
  const coAuthors = authors.slice(1).map(function (author) {
    return (formatAuthorDisplayLine_(author) + (author.email ? ' (' + author.email + ')' : '')).trim();
  }).filter(Boolean).join(' | ');
  const coAuthorColumn = ensureCoAuthorColumn_(sheet);

  const typeEntry = BILDIRI_TYPES[params.bildiriType] || BILDIRI_TYPES.ozet;

  const row = [
    queueNo,
    Utilities.formatDate(new Date(), 'Europe/Istanbul', 'dd.MM.yyyy HH:mm:ss'),
    book.label,
    params.title || '',
    typeEntry.tocBadge,
    params.subject || '',
    params.keywords || '',
    authors.length,
    (resolveUnvan_(firstAuthor) + ' ' + firstAuthor.ad + ' ' + firstAuthor.soyad).trim(),
    firstAuthor.kurum || '',
    firstAuthor.email || '',
    firstAuthor.orcid || '',
    driveFile.getName(),
    driveFile.getUrl(),
    typeEntry.docHeading + ' #' + queueNo,
    normalizeLang_(params.lang).toUpperCase(),
  ];

  sheet.appendRow(row);

  const rowNum = sheet.getLastRow();
  sheet.getRange(rowNum, coAuthorColumn).setValue(coAuthors);
  if (rowNum % 2 === 0) {
    sheet.getRange(rowNum, 1, 1, row.length).setBackground('#f8f4ec');
  }

  Logger.log('✅ Sheet kaydı (' + book.label + '): Satır ' + rowNum);
}

// ──────────────────────────────────────────────────────────────
//  E-POSTA
// ──────────────────────────────────────────────────────────────

/** İngilizce marka / terimler — tr-TR ile büyük harfe çevrilirse i→İ olur (WriteTec→WRİTETEC). */
function toUpperCaseEn_(s) {
  return String(s || '').toLocaleUpperCase('en-US');
}

function isAsciiLatinWord_(word) {
  return /^[A-Za-z][A-Za-z'\-]*$/.test(String(word || '').trim());
}

function escapeHtml_(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** lang verilirse (yalnızca katılımcı onay mailinde) ünvan o dile çevrilir; admin maili her zaman Türkçe kalsın diye lang opsiyoneldir. */
function formatAuthorEmailName_(author, lang) {
  if (!author) return '';
  const visibleUnvan = translateUnvanForLang_(resolveUnvan_(author), lang);
  return [visibleUnvan, author.ad, author.soyad].filter(Boolean).join(' ');
}

/**
 * Katılımcı onay e-postasının iki dildeki metinleri.
 * Tasarım (renkler, kart yapısı) kitap.gs ile birebir aynıdır; yalnızca metinler değişir.
 */
const EMAIL_I18N = {
  tr: {
    htmlLang: 'tr',
    docTitle: 'Bildiri Alındı',
    preheaderSuffix: ' — Bildiriniz başarıyla alındı. Detaylar e-postanın içinde.',
    badge: 'Bildiri Alındı',
    heroLine1: 'Bildiriniz',
    heroLine2: 'başarıyla alındı',
    heroLead: 'Aşağıda kongre ve bildiri detaylarınızı bulabilirsiniz.',
    greetPrefix: 'Sayın',
    introBefore: 'Aşağıdaki bildiriniz ',
    introAfter: ' bildiri kitabına başarıyla eklenmiştir.',
    titleCaption: '— Bildiri Başlığı',
    congressEyebrow: 'Kongre',
    statAuthors: 'Yazar',
    statStatus: 'Durum',
    statStatusValue: '✓ Alındı',
    detailsTitle: 'Bildiri Detayları',
    rowType: 'Bildiri Türü',
    rowSubject: 'Konu Alanı',
    rowKeywords: 'Anahtar Kelimeler',
    rowWhen: 'Gönderim Zamanı',
    authorsTitle: 'Yazarlar',
    roleCorresponding: 'Sorumlu Yazar',
    roleCoAuthorSuffix: '. Ortak Yazar',
    stepsTitle: 'Sonraki Adımlar',
    step1Title: 'Bildiriniz kayıt altına alındı',
    step1Body: 'Word belgeniz bildiri kitabına otomatik olarak eklendi; içindekiler güncellendi.',
    step2Title: 'Editör değerlendirmesi',
    step2Body: 'Yayın editörümüz biçim ve içerik kontrolü yapacak; gerektiğinde sizinle iletişime geçilecek.',
    step3Title: 'Bildiri kitabı yayınlanır',
    step3Body: 'Tüm bildiriler tamamlandığında bildiri kitabı ISBN numarası ile e-kitap olarak yayımlanır ve tüm yazarlar bilgilendirilir.',
    contactTitle: 'Sorularınız mı var?',
    contactBefore: 'Bildirinizle ilgili her türlü konuda ',
    contactAfter: ' adresinden bize ulaşabilirsiniz.',
    regards: 'Saygılarımızla,',
    signatureSuffix: ' — Yayın Koordinasyonu',
    brandSuffix: ' Bilgi Teknolojileri',
    autoNoteBefore: 'Bu e-posta otomatik gönderilmiştir. Lütfen yanıtlamayınız;',
    autoNoteMiddle: 'sorularınız için ',
    autoNoteAfter: ' adresini kullanınız.',
    subjectSuffix: ' — Bildiri Alındı',
  },
  en: {
    htmlLang: 'en',
    docTitle: 'Paper Received',
    preheaderSuffix: ' — Your paper has been received successfully. Details are inside this e-mail.',
    badge: 'Paper Received',
    heroLine1: 'Your paper',
    heroLine2: 'has been received',
    heroLead: 'Below you can find the details of your congress submission.',
    greetPrefix: 'Dear',
    introBefore: 'Your paper below has been successfully added to the proceedings book of ',
    introAfter: '.',
    titleCaption: '— Paper Title',
    congressEyebrow: 'Congress',
    statAuthors: 'Authors',
    statStatus: 'Status',
    statStatusValue: '✓ Received',
    detailsTitle: 'Paper Details',
    rowType: 'Submission Type',
    rowSubject: 'Subject Area',
    rowKeywords: 'Keywords',
    rowWhen: 'Submitted At',
    authorsTitle: 'Authors',
    roleCorresponding: 'Corresponding Author',
    roleCoAuthorSuffix: '. Co-Author',
    stepsTitle: 'Next Steps',
    step1Title: 'Your paper has been recorded',
    step1Body: 'Your Word document was automatically added to the proceedings book and the table of contents was updated.',
    step2Title: 'Editorial review',
    step2Body: 'Our publication editor will check the format and content, and will contact you if needed.',
    step3Title: 'The proceedings book is published',
    step3Body: 'Once all papers are collected, the proceedings book is published as an e-book with an ISBN and all authors are notified.',
    contactTitle: 'Any questions?',
    contactBefore: 'For anything regarding your paper you can reach us at ',
    contactAfter: '.',
    regards: 'Kind regards,',
    signatureSuffix: ' — Publication Coordination',
    brandSuffix: ' Information Technologies',
    autoNoteBefore: 'This e-mail was sent automatically. Please do not reply;',
    autoNoteMiddle: 'for questions please use ',
    autoNoteAfter: '.',
    subjectSuffix: ' — Paper Received',
  },
};

function emailStrings_(lang) {
  return EMAIL_I18N[normalizeLang_(lang)] || EMAIL_I18N.tr;
}

function buildConfirmationEmailHtml_(params, authors, queueNo, recipientAuthor, book) {
  const lang = normalizeLang_(params.lang);
  const L = emailStrings_(lang);
  const recipient = recipientAuthor || authors[0];
  const fullName = formatAuthorEmailName_(recipient, lang);
  const when = Utilities.formatDate(new Date(), 'Europe/Istanbul', 'dd.MM.yyyy HH:mm');
  const t = escapeHtml_(params.title);
  const subj = escapeHtml_(params.subject || '—');
  const keywords = escapeHtml_(params.keywords || '—');
  const bookLabel = escapeHtml_(congressLabelForLang_(book, lang));
  const typeLabel = escapeHtml_(bildiriTypeLabel_(params.bildiriType, lang));
  const adminMail = escapeHtml_(CONFIG.ADMIN_EMAIL);
  const greet = escapeHtml_(fullName);
  const authorCount = authors.length;
  const logoSrc = CONFIG.EMAIL_LOGO_URL || '';
  const logoLink = CONFIG.EMAIL_LOGO_LINK || '#';

  const logoHtml = logoSrc
    ? '<div style="margin:0 0 18px 0;"><a href="' + escapeHtml_(logoLink) +
      '" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block;">' +
      '<img src="' + escapeHtml_(logoSrc) +
      '" width="150" alt="' + escapeHtml_(CONFIG.BRAND_NAME) + '" style="display:block;max-width:150px;height:auto;border:0;outline:none;text-decoration:none;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.25));"></a></div>'
    : '';

  const authorsRowsHtml = authors.map(function (a, i) {
    const role = i === 0 ? L.roleCorresponding : (i + 1) + L.roleCoAuthorSuffix;
    const initials = ((a.ad || '').charAt(0) + (a.soyad || '').charAt(0)).toLocaleUpperCase('tr-TR') || '·';
    const fullLine = formatAuthorEmailName_(a, lang);
    return (
      '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(11,45,90,0.08);">' +
      '<table role="presentation" cellspacing="0" cellpadding="0" width="100%"><tr>' +
      '<td width="42" style="vertical-align:middle;">' +
      '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0b2d5a 0%,#2f67b8 100%);color:#ffffff;font-weight:800;font-size:13px;line-height:36px;text-align:center;letter-spacing:0.5px;">' +
      escapeHtml_(initials) + '</div></td>' +
      '<td style="padding-left:12px;vertical-align:middle;">' +
      '<div style="font-size:14px;font-weight:700;color:#0b2d5a;line-height:1.3;">' + escapeHtml_(fullLine) + '</div>' +
      '<div style="font-size:11px;color:#7a8697;letter-spacing:0.6px;text-transform:uppercase;font-weight:600;margin-top:2px;">' + escapeHtml_(role) + '</div>' +
      '</td></tr></table></td></tr>'
    );
  }).join('');

  return (
    '<!DOCTYPE html><html lang="' + L.htmlLang + '"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml_(L.docTitle) + '</title></head>' +
    '<body style="margin:0;padding:0;background-color:#eef4fb;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,\'Helvetica Neue\',Arial,sans-serif;">' +
    '<div style="display:none;font-size:1px;color:#eef4fb;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">' +
    bookLabel + escapeHtml_(L.preheaderSuffix) +
    '</div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#eef4fb;padding:32px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(11,45,90,0.18);border:1px solid rgba(11,45,90,0.08);">' +

    // ─ HERO ─
    '<tr><td style="background:linear-gradient(135deg,#0b2d5a 0%,#143a72 30%,#2f67b8 70%,#4da8e5 100%);padding:40px 36px 40px 36px;position:relative;text-align:center;">' +
    logoHtml +
    '<div style="display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,0.10);border:1px solid rgba(255,255,255,0.22);font-size:10.5px;letter-spacing:3px;text-transform:uppercase;color:#ffffff;font-weight:700;margin-bottom:18px;">' + escapeHtml_(L.badge) + '</div>' +
    '<h1 style="margin:0 0 8px 0;font-family:Georgia,\'Times New Roman\',serif;font-size:32px;font-weight:700;line-height:1.18;color:#ffffff;letter-spacing:-0.4px;">' + escapeHtml_(L.heroLine1) + '</h1>' +
    '<h1 style="margin:0 0 18px 0;font-family:Georgia,\'Times New Roman\',serif;font-size:32px;font-weight:700;line-height:1.18;color:#c9a84c;font-style:italic;letter-spacing:-0.4px;">' + escapeHtml_(L.heroLine2) + '</h1>' +
    '<p style="margin:0;font-size:15px;color:rgba(255,255,255,0.82);line-height:1.6;max-width:420px;margin-left:auto;margin-right:auto;">' + escapeHtml_(L.heroLead) + '</p>' +
    '</td></tr>' +

    // ─ KARŞILAMA ─
    '<tr><td style="padding:28px 40px 8px 40px;text-align:center;">' +
    '<p style="margin:0 0 8px 0;font-size:16px;color:#0b2d5a;line-height:1.6;">' + escapeHtml_(L.greetPrefix) + ' <strong>' + greet + '</strong>,</p>' +
    '<p style="margin:0;font-size:15px;color:#4b5563;line-height:1.7;">' + escapeHtml_(L.introBefore) + '<strong style="color:#0b2d5a;">' + bookLabel + '</strong>' + escapeHtml_(L.introAfter) + '</p>' +
    '</td></tr>' +

    // ─ BAŞLIK ALINTI ─
    '<tr><td style="padding:24px 40px 8px 40px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#f5f9ff 0%,#fdf8ed 100%);border-radius:14px;overflow:hidden;border:1px solid rgba(11,45,90,0.08);">' +
    '<tr><td style="padding:22px 24px;position:relative;">' +
    '<div style="font-family:Georgia,serif;font-size:48px;color:#c9a84c;line-height:1;margin-bottom:-12px;opacity:0.55;">&ldquo;</div>' +
    '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:18px;font-weight:700;color:#0b2d5a;line-height:1.4;font-style:italic;">' + t + '</div>' +
    '<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#7a8697;margin-top:14px;font-weight:700;">' + escapeHtml_(L.titleCaption) + '</div>' +
    '</td></tr></table>' +
    '</td></tr>' +

    // ─ KONGRE ŞOWCASE ─
    '<tr><td style="padding:20px 40px 4px 40px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b2d5a;border-radius:14px;overflow:hidden;background-image:linear-gradient(135deg,#0b2d5a 0%,#143a72 100%);">' +
    '<tr><td style="padding:22px 24px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>' +
    '<td width="56" style="vertical-align:middle;">' +
    '<div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#c9a84c 0%,#e8c97a 100%);text-align:center;line-height:48px;color:#0b2d5a;font-weight:800;font-size:20px;font-family:Georgia,serif;">📖</div>' +
    '</td>' +
    '<td style="padding-left:14px;vertical-align:middle;">' +
    '<div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(201,168,76,0.95);font-weight:800;margin-bottom:4px;">' + escapeHtml_(L.congressEyebrow) + '</div>' +
    '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:17px;font-weight:700;color:#ffffff;line-height:1.3;">' + bookLabel + '</div>' +
    '</td></tr></table>' +
    '</td></tr></table>' +
    '</td></tr>' +

    // ─ İSTATİSTİK KUTUSU ─
    '<tr><td style="padding:18px 40px 4px 40px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0">' +
    '<tr>' +
    '<td width="50%" style="padding:0 6px 0 0;">' +
    '<div style="background:#f5f9ff;border:1px solid rgba(47,103,184,0.14);border-radius:12px;padding:14px 12px;text-align:center;">' +
    '<div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#7a8697;font-weight:700;margin-bottom:6px;">' + escapeHtml_(L.statAuthors) + '</div>' +
    '<div style="font-family:Georgia,serif;font-size:22px;font-weight:800;color:#0b2d5a;line-height:1;">' + authorCount + '</div>' +
    '</div></td>' +
    '<td width="50%" style="padding:0 0 0 6px;">' +
    '<div style="background:#f0f9f4;border:1px solid rgba(45,106,79,0.20);border-radius:12px;padding:14px 12px;text-align:center;">' +
    '<div style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#2d6a4f;font-weight:700;margin-bottom:6px;">' + escapeHtml_(L.statStatus) + '</div>' +
    '<div style="font-family:Georgia,serif;font-size:14px;font-weight:800;color:#2d6a4f;line-height:1;padding-top:4px;">' + escapeHtml_(L.statStatusValue) + '</div>' +
    '</div></td>' +
    '</tr></table>' +
    '</td></tr>' +

    // ─ DETAY TABLOSU ─
    '<tr><td style="padding:22px 40px 8px 40px;">' +
    '<div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:800;margin-bottom:12px;display:flex;align-items:center;">' + escapeHtml_(L.detailsTitle) + '</div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(11,45,90,0.10);border-collapse:separate;border-spacing:0;border-radius:14px;overflow:hidden;background:#ffffff;">' +
    '<tr><td style="padding:14px 18px;background:#fafbfd;width:38%;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;border-bottom:1px solid rgba(11,45,90,0.07);">' + escapeHtml_(L.rowType) + '</td>' +
    '<td style="padding:14px 18px;font-size:14px;color:#0b2d5a;border-bottom:1px solid rgba(11,45,90,0.07);font-weight:700;">' + typeLabel + '</td></tr>' +
    '<tr><td style="padding:14px 18px;background:#fafbfd;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;border-bottom:1px solid rgba(11,45,90,0.07);">' + escapeHtml_(L.rowSubject) + '</td>' +
    '<td style="padding:14px 18px;font-size:14px;color:#0b2d5a;border-bottom:1px solid rgba(11,45,90,0.07);font-weight:600;">' + subj + '</td></tr>' +
    '<tr><td style="padding:14px 18px;background:#fafbfd;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;border-bottom:1px solid rgba(11,45,90,0.07);">' + escapeHtml_(L.rowKeywords) + '</td>' +
    '<td style="padding:14px 18px;font-size:14px;color:#0b2d5a;border-bottom:1px solid rgba(11,45,90,0.07);line-height:1.5;">' + keywords + '</td></tr>' +
    '<tr><td style="padding:14px 18px;background:#fafbfd;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;">' + escapeHtml_(L.rowWhen) + '</td>' +
    '<td style="padding:14px 18px;font-size:14px;color:#0b2d5a;font-weight:600;">' + escapeHtml_(when) + '</td></tr>' +
    '</table>' +
    '</td></tr>' +

    // ─ YAZAR LİSTESİ ─
    '<tr><td style="padding:22px 40px 8px 40px;">' +
    '<div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:800;margin-bottom:12px;">' + escapeHtml_(L.authorsTitle) + ' (' + authorCount + ')</div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(11,45,90,0.10);border-radius:14px;overflow:hidden;background:#ffffff;">' +
    '<tr><td style="padding:8px 18px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0">' + authorsRowsHtml + '</table>' +
    '</td></tr></table>' +
    '</td></tr>' +

    // ─ SONRAKİ ADIMLAR ─
    '<tr><td style="padding:22px 40px 8px 40px;">' +
    '<div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:800;margin-bottom:14px;">' + escapeHtml_(L.stepsTitle) + '</div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0">' +
    '<tr><td style="padding:0 0 12px 0;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>' +
    '<td width="40" style="vertical-align:top;"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#2d6a4f 0%,#52b788 100%);color:#ffffff;text-align:center;line-height:32px;font-weight:800;font-size:13px;">✓</div></td>' +
    '<td style="padding-left:14px;vertical-align:top;">' +
    '<div style="font-size:14px;font-weight:700;color:#0b2d5a;line-height:1.35;">' + escapeHtml_(L.step1Title) + '</div>' +
    '<div style="font-size:13px;color:#6b7280;line-height:1.6;margin-top:3px;">' + escapeHtml_(L.step1Body) + '</div>' +
    '</td></tr></table></td></tr>' +
    '<tr><td style="padding:0 0 12px 0;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>' +
    '<td width="40" style="vertical-align:top;"><div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#c9a84c 0%,#e8c97a 100%);color:#0b2d5a;text-align:center;line-height:32px;font-weight:800;font-size:13px;">2</div></td>' +
    '<td style="padding-left:14px;vertical-align:top;">' +
    '<div style="font-size:14px;font-weight:700;color:#0b2d5a;line-height:1.35;">' + escapeHtml_(L.step2Title) + '</div>' +
    '<div style="font-size:13px;color:#6b7280;line-height:1.6;margin-top:3px;">' + escapeHtml_(L.step2Body) + '</div>' +
    '</td></tr></table></td></tr>' +
    '<tr><td>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>' +
    '<td width="40" style="vertical-align:top;"><div style="width:32px;height:32px;border-radius:50%;background:#eef4fb;border:1px solid rgba(11,45,90,0.18);color:#0b2d5a;text-align:center;line-height:30px;font-weight:800;font-size:13px;">3</div></td>' +
    '<td style="padding-left:14px;vertical-align:top;">' +
    '<div style="font-size:14px;font-weight:700;color:#0b2d5a;line-height:1.35;">' + escapeHtml_(L.step3Title) + '</div>' +
    '<div style="font-size:13px;color:#6b7280;line-height:1.6;margin-top:3px;">' + escapeHtml_(L.step3Body) + '</div>' +
    '</td></tr></table></td></tr>' +
    '</table>' +
    '</td></tr>' +

    // ─ İLETİŞİM ─
    '<tr><td style="padding:24px 40px 24px 40px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#f5f9ff 0%,#ffffff 100%);border-left:4px solid #4da8e5;border-radius:0 12px 12px 0;">' +
    '<tr><td style="padding:16px 20px;">' +
    '<div style="font-size:13px;color:#0b2d5a;font-weight:700;margin-bottom:4px;">' + escapeHtml_(L.contactTitle) + '</div>' +
    '<div style="font-size:13px;color:#5b6472;line-height:1.6;">' + escapeHtml_(L.contactBefore) + '<a href="mailto:' + adminMail + '" style="color:#2f67b8;font-weight:800;text-decoration:none;">' + adminMail + '</a>' + escapeHtml_(L.contactAfter) + '</div>' +
    '</td></tr></table>' +
    '</td></tr>' +

    // ─ FOOTER ─
    '<tr><td style="padding:24px 40px 32px 40px;background:linear-gradient(180deg,#ffffff 0%,#f5f9ff 100%);border-top:1px solid rgba(11,45,90,0.08);text-align:center;">' +
    '<div style="display:inline-block;width:40px;height:2px;background:linear-gradient(90deg,#c9a84c 0%,#4da8e5 100%);border-radius:2px;margin-bottom:14px;"></div>' +
    '<p style="margin:0 0 6px 0;font-size:14px;color:#0b2d5a;font-weight:600;">' + escapeHtml_(L.regards) + '</p>' +
    '<p style="margin:0 0 12px 0;font-family:Georgia,\'Times New Roman\',serif;font-size:16px;color:#0b2d5a;font-weight:700;font-style:italic;">' + escapeHtml_(CONFIG.BRAND_NAME) + escapeHtml_(L.signatureSuffix) + '</p>' +
    '<p style="margin:0;font-size:11px;color:#7a8697;letter-spacing:0.6px;">© ' + escapeHtml_(Utilities.formatDate(new Date(), 'Europe/Istanbul', 'yyyy')) + ' ' + escapeHtml_(CONFIG.BRAND_NAME) + escapeHtml_(L.brandSuffix) + '</p>' +
    '</td></tr>' +

    '</table>' +
    '<p style="margin:14px 0 0 0;font-size:11px;color:#7a8697;text-align:center;line-height:1.6;">' + escapeHtml_(L.autoNoteBefore) + '<br>' + escapeHtml_(L.autoNoteMiddle) + '<a href="mailto:' + adminMail + '" style="color:#2f67b8;text-decoration:none;font-weight:700;">' + adminMail + '</a>' + escapeHtml_(L.autoNoteAfter) + '</p>' +
    '</td></tr></table>' +
    '</body></html>'
  );
}

function buildConfirmationEmailPlain_(params, authors, queueNo, recipientAuthor, book) {
  const lang = normalizeLang_(params.lang);
  const recipient = recipientAuthor || authors[0];
  const when = Utilities.formatDate(new Date(), 'Europe/Istanbul', 'dd.MM.yyyy HH:mm');
  const label = congressLabelForLang_(book, lang);
  const typeLabel = bildiriTypeLabel_(params.bildiriType, lang);
  const name = formatAuthorEmailName_(recipient, lang);

  if (lang === 'en') {
    return [
      'Dear ' + name + ',',
      '',
      'Your paper titled "' + (params.title || '') + '" has been successfully received for ' + label + '.',
      '',
      'PAPER DETAILS',
      'Congress     : ' + label,
      'Title        : ' + (params.title || ''),
      'Type         : ' + typeLabel,
      'Subject Area : ' + (params.subject || ''),
      'Date         : ' + when,
      '',
      'Your paper has been successfully added to the proceedings book.',
      '',
      'For any issues you can reach us at ' + CONFIG.ADMIN_EMAIL + '.',
      '',
      'Kind regards,',
      CONFIG.BRAND_NAME + ' Information Technologies — Publication Coordination',
    ].join('\n');
  }

  return [
    'Sayın ' + name + ',',
    '',
    '"' + (params.title || '') + '" başlıklı bildiriniz ' + label + ' için başarıyla alınmıştır.',
    '',
    'BİLDİRİ DETAYLARI',
    'Kongre      : ' + label,
    'Başlık      : ' + (params.title || ''),
    'Tür         : ' + typeLabel,
    'Konu Alanı  : ' + (params.subject || ''),
    'Tarih       : ' + when,
    '',
    'Bildiriniz bildiri kitabına başarıyla eklenmiştir.',
    '',
    'Herhangi bir sorun için ' + CONFIG.ADMIN_EMAIL + ' adresine ulaşabilirsiniz.',
    '',
    'Saygılarımızla,',
    CONFIG.BRAND_NAME + ' Bilgi Teknolojileri — Yayın Koordinasyonu',
  ].join('\n');
}

function buildAdminNotificationHtml_(params, authors, queueNo, driveFile, book) {
  const firstAuthor = authors[0];
  const when = Utilities.formatDate(new Date(), 'Europe/Istanbul', 'dd.MM.yyyy HH:mm:ss');
  const url = driveFile.getUrl();
  const urlEsc = escapeHtml_(url);
  const fileName = escapeHtml_(driveFile.getName ? driveFile.getName() : '—');
  const bookLabel = escapeHtml_(book.label);
  const queueStr = escapeHtml_(String(queueNo));
  const authorCount = authors.length;
  const firstAuthorFull = escapeHtml_(formatAuthorEmailName_(firstAuthor));
  const firstAuthorInitials = (((firstAuthor.ad || '').charAt(0)) + ((firstAuthor.soyad || '').charAt(0))).toLocaleUpperCase('tr-TR') || '·';
  const firstAuthorEmail = escapeHtml_(firstAuthor.email || '—');
  const firstAuthorKurum = escapeHtml_(firstAuthor.kurum || '—');
  const firstAuthorOrcid = escapeHtml_(firstAuthor.orcid || '—');
  const subj = escapeHtml_(params.subject || '—');
  const keywords = escapeHtml_(params.keywords || '—');
  const titleEsc = escapeHtml_(params.title);
  const typeEntry = BILDIRI_TYPES[params.bildiriType] || BILDIRI_TYPES.ozet;
  const typeLabel = escapeHtml_(typeEntry.tr);
  const langLabel = escapeHtml_(normalizeLang_(params.lang) === 'en' ? 'İngilizce (EN)' : 'Türkçe (TR)');

  const logoSrc = CONFIG.EMAIL_LOGO_URL || '';
  const logoLink = CONFIG.EMAIL_LOGO_LINK || '#';
  const logoHtml = logoSrc
    ? '<div style="margin:0 0 16px 0;"><a href="' + escapeHtml_(logoLink) +
      '" target="_blank" rel="noopener" style="text-decoration:none;display:inline-block;">' +
      '<img src="' + escapeHtml_(logoSrc) +
      '" width="130" alt="' + escapeHtml_(CONFIG.BRAND_NAME) + '" style="display:block;max-width:130px;height:auto;border:0;outline:none;text-decoration:none;filter:drop-shadow(0 8px 18px rgba(0,0,0,0.25));"></a></div>'
    : '';

  const coAuthorsHtml = authors.slice(1).map(function (a, i) {
    const initials = ((a.ad || '').charAt(0) + (a.soyad || '').charAt(0)).toLocaleUpperCase('tr-TR') || '·';
    const fullLine = formatAuthorEmailName_(a);
    return (
      '<tr><td style="padding:8px 0;border-top:1px solid rgba(11,45,90,0.06);">' +
      '<table role="presentation" cellspacing="0" cellpadding="0" width="100%"><tr>' +
      '<td width="36" style="vertical-align:middle;">' +
      '<div style="width:30px;height:30px;border-radius:50%;background:#eef4fb;color:#0b2d5a;border:1px solid rgba(11,45,90,0.14);font-weight:800;font-size:11px;line-height:30px;text-align:center;">' +
      escapeHtml_(initials) + '</div></td>' +
      '<td style="padding-left:10px;vertical-align:middle;">' +
      '<div style="font-size:13px;font-weight:700;color:#0b2d5a;line-height:1.3;">' + escapeHtml_(fullLine) + '</div>' +
      '<div style="font-size:11px;color:#7a8697;margin-top:2px;">' + escapeHtml_(a.email || '—') + '</div>' +
      '</td>' +
      '<td align="right" style="font-size:10px;letter-spacing:1px;color:#7a8697;text-transform:uppercase;font-weight:700;vertical-align:middle;">' +
      (i + 2) + '. Yazar</td>' +
      '</tr></table></td></tr>'
    );
  }).join('');

  const coAuthorsBlock = coAuthorsHtml
    ? '<tr><td style="padding:6px 30px 0 30px;">' +
      '<div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7a8697;font-weight:800;margin:14px 0 8px 0;">Ortak Yazarlar (' + (authorCount - 1) + ')</div>' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0">' + coAuthorsHtml + '</table>' +
      '</td></tr>'
    : '';

  return (
    '<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yeni Bildiri</title></head>' +
    '<body style="margin:0;padding:0;background-color:#eef4fb;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,\'Helvetica Neue\',Arial,sans-serif;">' +
    '<div style="display:none;font-size:1px;color:#eef4fb;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">' +
    'Yeni bildiri (' + typeLabel + '): ' + bookLabel + ' #' + queueStr + ' — ' + firstAuthorFull +
    '</div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#eef4fb;padding:32px 12px;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(11,45,90,0.18);border:1px solid rgba(11,45,90,0.08);">' +

    // ─ HERO ─
    '<tr><td style="background:linear-gradient(135deg,#0b2d5a 0%,#143a72 35%,#2f67b8 100%);padding:30px 36px 28px 36px;position:relative;border-bottom:5px solid #c9a84c;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>' +
    '<td style="vertical-align:top;">' +
    logoHtml +
    '<div style="display:inline-block;padding:5px 12px;border-radius:999px;background:rgba(201,168,76,0.18);border:1px solid rgba(201,168,76,0.40);font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#e8c97a;font-weight:800;margin-bottom:10px;">⚡ Yeni ' + typeLabel + ' Bildirimi</div>' +
    '<h1 style="margin:0;font-family:Georgia,\'Times New Roman\',serif;font-size:24px;font-weight:700;line-height:1.2;color:#ffffff;letter-spacing:-0.2px;">Bildiri kitabına yeni bir bildiri düştü</h1>' +
    '</td>' +
    '<td width="90" align="right" style="vertical-align:top;">' +
    '<div style="display:inline-block;text-align:center;padding:14px 12px;background:linear-gradient(135deg,#c9a84c 0%,#e8c97a 100%);border-radius:14px;box-shadow:0 12px 26px rgba(201,168,76,0.30);">' +
    '<div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#5a4310;font-weight:800;line-height:1;margin-bottom:4px;">Sıra</div>' +
    '<div style="font-family:Georgia,serif;font-size:24px;font-weight:800;color:#0b2d5a;line-height:1;">#' + queueStr + '</div>' +
    '</div>' +
    '</td></tr></table>' +
    '</td></tr>' +

    // ─ KONGRE ROZETİ ─
    '<tr><td style="padding:22px 30px 4px 30px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#f5f9ff 0%,#fdf8ed 100%);border:1px solid rgba(11,45,90,0.10);border-left:4px solid #c9a84c;border-radius:0 14px 14px 0;">' +
    '<tr><td style="padding:14px 18px;">' +
    '<div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#c9a84c;font-weight:800;margin-bottom:4px;">Kongre</div>' +
    '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:17px;font-weight:700;color:#0b2d5a;line-height:1.3;">' + bookLabel + '</div>' +
    '</td></tr></table>' +
    '</td></tr>' +

    // ─ BİLDİRİ BAŞLIĞI ─
    '<tr><td style="padding:18px 30px 4px 30px;">' +
    '<div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7a8697;font-weight:800;margin-bottom:6px;">' + typeLabel + ' Başlığı</div>' +
    '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:18px;font-weight:700;color:#0b2d5a;line-height:1.4;font-style:italic;">&ldquo;' + titleEsc + '&rdquo;</div>' +
    '</td></tr>' +

    // ─ SORUMLU YAZAR ─
    '<tr><td style="padding:20px 30px 6px 30px;">' +
    '<div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7a8697;font-weight:800;margin-bottom:8px;">Sorumlu Yazar</div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b2d5a;background-image:linear-gradient(135deg,#0b2d5a 0%,#143a72 100%);border-radius:14px;overflow:hidden;">' +
    '<tr><td style="padding:18px 20px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>' +
    '<td width="56" style="vertical-align:middle;">' +
    '<div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#c9a84c 0%,#e8c97a 100%);color:#0b2d5a;font-weight:800;font-size:16px;line-height:46px;text-align:center;letter-spacing:0.5px;">' + escapeHtml_(firstAuthorInitials) + '</div>' +
    '</td>' +
    '<td style="padding-left:14px;vertical-align:middle;">' +
    '<div style="font-size:15px;font-weight:800;color:#ffffff;line-height:1.3;">' + firstAuthorFull + '</div>' +
    '<div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:3px;line-height:1.5;">' + firstAuthorKurum + '</div>' +
    '<div style="font-size:12px;margin-top:4px;line-height:1.4;"><a href="mailto:' + firstAuthorEmail + '" style="color:#e8c97a;text-decoration:none;font-weight:700;">' + firstAuthorEmail + '</a></div>' +
    '</td></tr></table>' +
    '</td></tr></table>' +
    '</td></tr>' +

    coAuthorsBlock +

    // ─ DETAY TABLOSU ─
    '<tr><td style="padding:22px 30px 6px 30px;">' +
    '<div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7a8697;font-weight:800;margin-bottom:10px;">Bildiri Detayları</div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid rgba(11,45,90,0.10);border-collapse:separate;border-spacing:0;border-radius:14px;overflow:hidden;background:#ffffff;">' +
    '<tr><td style="padding:12px 16px;background:#fafbfd;width:36%;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;border-bottom:1px solid rgba(11,45,90,0.07);">Bildiri Türü</td>' +
    '<td style="padding:12px 16px;font-size:13.5px;color:#0b2d5a;border-bottom:1px solid rgba(11,45,90,0.07);font-weight:700;">' + typeLabel + '</td></tr>' +
    '<tr><td style="padding:12px 16px;background:#fafbfd;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;border-bottom:1px solid rgba(11,45,90,0.07);">Konu Alanı</td>' +
    '<td style="padding:12px 16px;font-size:13.5px;color:#0b2d5a;border-bottom:1px solid rgba(11,45,90,0.07);font-weight:600;">' + subj + '</td></tr>' +
    '<tr><td style="padding:12px 16px;background:#fafbfd;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;border-bottom:1px solid rgba(11,45,90,0.07);">Anahtar Kelimeler</td>' +
    '<td style="padding:12px 16px;font-size:13.5px;color:#0b2d5a;border-bottom:1px solid rgba(11,45,90,0.07);line-height:1.5;">' + keywords + '</td></tr>' +
    '<tr><td style="padding:12px 16px;background:#fafbfd;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;border-bottom:1px solid rgba(11,45,90,0.07);">Sorumlu ORCID</td>' +
    '<td style="padding:12px 16px;font-size:13.5px;color:#0b2d5a;border-bottom:1px solid rgba(11,45,90,0.07);font-family:Menlo,Consolas,monospace;">' + firstAuthorOrcid + '</td></tr>' +
    '<tr><td style="padding:12px 16px;background:#fafbfd;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;border-bottom:1px solid rgba(11,45,90,0.07);">Yazar Sayısı</td>' +
    '<td style="padding:12px 16px;font-size:13.5px;color:#0b2d5a;border-bottom:1px solid rgba(11,45,90,0.07);font-weight:600;">' + authorCount + '</td></tr>' +
    '<tr><td style="padding:12px 16px;background:#fafbfd;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;border-bottom:1px solid rgba(11,45,90,0.07);">Form Dili</td>' +
    '<td style="padding:12px 16px;font-size:13.5px;color:#0b2d5a;border-bottom:1px solid rgba(11,45,90,0.07);font-weight:600;">' + langLabel + '</td></tr>' +
    '<tr><td style="padding:12px 16px;background:#fafbfd;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:#7a8697;font-weight:700;">Gönderim Zamanı</td>' +
    '<td style="padding:12px 16px;font-size:13.5px;color:#0b2d5a;font-weight:600;">' + escapeHtml_(when) + '</td></tr>' +
    '</table>' +
    '</td></tr>' +

    // ─ DOSYA KARTI + CTA ─
    '<tr><td style="padding:22px 30px 6px 30px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#0b2d5a 0%,#2f67b8 100%);border-radius:14px;overflow:hidden;">' +
    '<tr><td style="padding:22px 22px 10px 22px;">' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>' +
    '<td width="56" style="vertical-align:middle;">' +
    '<div style="width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.20);text-align:center;line-height:46px;color:#e8c97a;font-weight:800;font-size:18px;">📄</div>' +
    '</td>' +
    '<td style="padding-left:14px;vertical-align:middle;">' +
    '<div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(201,168,76,0.95);font-weight:800;margin-bottom:3px;"><span style="text-transform:none;">WORD</span> BELGESİ</div>' +
    '<div style="font-size:14px;font-weight:700;color:#ffffff;line-height:1.4;word-break:break-all;">' + fileName + '</div>' +
    '</td></tr></table>' +
    '</td></tr>' +
    '<tr><td style="padding:6px 22px 22px 22px;" align="center">' +
    '<a href="' + urlEsc + '" target="_blank" rel="noopener" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#c9a84c 0%,#e8c97a 100%);color:#0b2d5a;text-decoration:none;font-size:13px;font-weight:800;border-radius:999px;letter-spacing:1.5px;text-transform:uppercase;box-shadow:0 14px 28px rgba(201,168,76,0.40);">' +
    '📂 Drive\'da Aç' +
    '</a>' +
    '</td></tr>' +
    '</table>' +
    '<p style="margin:10px 0 0 0;font-size:11px;word-break:break-all;color:#7a8697;text-align:center;line-height:1.5;"><a href="' + urlEsc + '" style="color:#7a8697;text-decoration:none;">' + urlEsc + '</a></p>' +
    '</td></tr>' +

    // ─ İŞLEM ÖZETİ ─
    '<tr><td style="padding:22px 30px 8px 30px;">' +
    '<div style="font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#7a8697;font-weight:800;margin-bottom:10px;">Otomatik İşlemler</div>' +
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0">' +
    '<tr>' +
    '<td width="33%" style="padding:0 4px 0 0;vertical-align:top;">' +
    '<div style="background:#f0f9f4;border:1px solid rgba(45,106,79,0.20);border-radius:12px;padding:12px 10px;text-align:center;">' +
    '<div style="color:#2d6a4f;font-size:18px;font-weight:800;line-height:1;margin-bottom:4px;">✓</div>' +
    '<div style="font-size:11px;color:#2d6a4f;font-weight:700;line-height:1.4;">Drive\'a kaydedildi</div>' +
    '</div></td>' +
    '<td width="33%" style="padding:0 2px;vertical-align:top;">' +
    '<div style="background:#f0f9f4;border:1px solid rgba(45,106,79,0.20);border-radius:12px;padding:12px 10px;text-align:center;">' +
    '<div style="color:#2d6a4f;font-size:18px;font-weight:800;line-height:1;margin-bottom:4px;">✓</div>' +
    '<div style="font-size:11px;color:#2d6a4f;font-weight:700;line-height:1.4;">Bildiri kitabına eklendi</div>' +
    '</div></td>' +
    '<td width="33%" style="padding:0 0 0 4px;vertical-align:top;">' +
    '<div style="background:#f0f9f4;border:1px solid rgba(45,106,79,0.20);border-radius:12px;padding:12px 10px;text-align:center;">' +
    '<div style="color:#2d6a4f;font-size:18px;font-weight:800;line-height:1;margin-bottom:4px;">✓</div>' +
    '<div style="font-size:11px;color:#2d6a4f;font-weight:700;line-height:1.4;">Sheet kaydı</div>' +
    '</div></td>' +
    '</tr></table>' +
    '</td></tr>' +

    // ─ FOOTER ─
    '<tr><td style="padding:22px 30px 26px 30px;background:linear-gradient(180deg,#ffffff 0%,#f5f9ff 100%);border-top:1px solid rgba(11,45,90,0.08);text-align:center;">' +
    '<div style="display:inline-block;width:40px;height:2px;background:linear-gradient(90deg,#c9a84c 0%,#4da8e5 100%);border-radius:2px;margin-bottom:12px;"></div>' +
    '<p style="margin:0 0 4px 0;font-size:11px;color:#7a8697;letter-spacing:0.8px;font-weight:700;">' +
    escapeHtml_(CONFIG.BRAND_NAME_UPPER) + ' • OTOMATİK BİLDİRİM</p>' +
    '<p style="margin:0;font-size:11px;color:#7a8697;">Bu mesaj, yeni bir bildiri gönderimi sonrasında otomatik üretildi.</p>' +
    '</td></tr>' +

    '</table></td></tr></table>' +
    '</body></html>'
  );
}

function buildAdminNotificationPlain_(params, authors, queueNo, driveFile, book) {
  const firstAuthor = authors[0];
  const when = Utilities.formatDate(new Date(), 'Europe/Istanbul', 'dd.MM.yyyy HH:mm:ss');
  const typeEntry = BILDIRI_TYPES[params.bildiriType] || BILDIRI_TYPES.ozet;
  return [
    'Yeni bir kongre bildirisi alındı.',
    '',
    'Kongre   : ' + book.label,
    'Sıra No  : #' + queueNo,
    'Tür      : ' + typeEntry.tr,
    'Başlık   : ' + (params.title || ''),
    'Yazar    : ' + formatAuthorEmailName_(firstAuthor) + ' (' + (firstAuthor.email || '') + ')',
    'Kurum    : ' + (firstAuthor.kurum || ''),
    'Konu     : ' + (params.subject || ''),
    'Form Dili: ' + (normalizeLang_(params.lang) === 'en' ? 'İngilizce (EN)' : 'Türkçe (TR)'),
    'Dosya    : ' + driveFile.getUrl(),
    'Tarih    : ' + when,
  ].join('\n');
}

function sendConfirmationEmail_(params, authors, queueNo, book) {
  const lang = normalizeLang_(params.lang);
  const L = emailStrings_(lang);
  const subject = '[' + congressLabelForLang_(book, lang) + L.subjectSuffix + '] ' + params.title;
  const sentEmails = {};

  authors.forEach(function (author) {
    const email = String((author && author.email) || '').trim();
    if (!email || sentEmails[email.toLowerCase()]) return;

    const mail = {
      to: email,
      subject: subject,
      body: buildConfirmationEmailPlain_(params, authors, queueNo, author, book),
      htmlBody: buildConfirmationEmailHtml_(params, authors, queueNo, author, book),
    };
    MailApp.sendEmail(mail);
    sentEmails[email.toLowerCase()] = true;

    Logger.log('✅ Onay maili gönderildi (' + book.label + '): ' + email);
  });
}

function sendAdminNotification_(params, authors, queueNo, driveFile, book) {
  const typeEntry = BILDIRI_TYPES[params.bildiriType] || BILDIRI_TYPES.ozet;
  const subject =
    '[' + book.label + ' — Yeni ' + typeEntry.tr + ' #' + queueNo + '] ' + params.title;
  const mail = {
    to: CONFIG.ADMIN_EMAIL,
    subject: subject,
    body: buildAdminNotificationPlain_(params, authors, queueNo, driveFile, book),
    htmlBody: buildAdminNotificationHtml_(params, authors, queueNo, driveFile, book),
  };
  MailApp.sendEmail(mail);
}

// ──────────────────────────────────────────────────────────────
//  OPSİYONEL: TEK PDF (Bildiri Kitabı Doc)
// ──────────────────────────────────────────────────────────────

function exportBildiriPdfToFolder(congressKey) {
  const book = getCongressConfig_(congressKey);
  const pdfBlob = DriveApp.getFileById(book.docId).getAs(MimeType.PDF);
  const safeLabel = book.label.replace(/[^a-zA-Z0-9_\- ()ğüşöçıİĞÜŞÖÇ]/g, '').replace(/\s+/g, '_');
  const name =
    'BildiriKitabi_' + safeLabel + '_' +
    Utilities.formatDate(new Date(), 'Europe/Istanbul', 'yyyyMMdd_HHmm') +
    '.pdf';
  pdfBlob.setName(name);
  const folder = DriveApp.getFolderById(book.folderId);
  const f = folder.createFile(pdfBlob);
  Logger.log('PDF oluşturuldu (' + book.label + '): ' + f.getUrl());
  return f.getUrl();
}

// ──────────────────────────────────────────────────────────────
//  GOOGLE DOC İÇERİK KOPYALAMA (element.copy() temelli — biçim bütünlüğü korunur)
// ──────────────────────────────────────────────────────────────

const BOOK_MAX_INLINE_IMAGE_WIDTH_PT = 468;

/** Kaynak GDoc listId → hedef bildiri kitabındaki ilk liste maddesi (çok seviyeli numara/glyph korunur) */
let _listIdMap_ = {};

function _resetListIdMap_() {
  _listIdMap_ = {};
}

function copyGoogleDocContentRich(sourceDocId, targetBody) {
  _resetListIdMap_();
  const sourceDoc = openDocWithRetry_(sourceDocId);
  const sourceBody = sourceDoc.getBody();
  const n = sourceBody.getNumChildren();
  for (let i = 0; i < n; i++) {
    _appendSourceElement_(sourceBody.getChild(i), targetBody);
  }
  Logger.log('✅ İçerik kopyalandı: ' + sourceDocId);
}

function _appendSourceElement_(child, targetBody) {
  const type = child.getType();
  try {
    if (type === DocumentApp.ElementType.PARAGRAPH) {
      const sp = child.asParagraph();
      const copy = sp.copy().asParagraph();
      targetBody.appendParagraph(copy);
      _enforceBookFontOnParagraph_(copy, { preserveColors: true });
      _copyPositionedImagesAfter_(sp, targetBody);
    } else if (type === DocumentApp.ElementType.LIST_ITEM) {
      _appendListItem_(child.asListItem(), targetBody);
    } else if (type === DocumentApp.ElementType.TABLE) {
      const st = child.asTable();
      const copy = st.copy().asTable();
      targetBody.appendTable(copy);
      // Tablo: copy() ile gelen punto, renk ve başlık satırı biçimine dokunma
    } else if (type === DocumentApp.ElementType.PAGE_BREAK) {
      targetBody.appendPageBreak();
    } else if (type === DocumentApp.ElementType.HORIZONTAL_RULE) {
      targetBody.appendHorizontalRule();
    }
  } catch (e) {
    Logger.log('Element atlandı (' + type + '): ' + e);
  }
}

/**
 * Liste maddesini olduğu gibi kopyala (heading dahil).
 * Aynı kaynak listId için hedef listId eşlemesiyle "1.2." / "—" gibi glifler korunur.
 */
function _appendListItem_(sourceLi, targetBody) {
  const copy = sourceLi.copy().asListItem();
  let srcListId = null;
  try { srcListId = sourceLi.getListId(); } catch (e) {}

  let appended;
  if (srcListId && _listIdMap_[srcListId]) {
    try {
      appended = targetBody.appendListItem(copy).setListId(_listIdMap_[srcListId]);
    } catch (e) {
      appended = targetBody.appendListItem(copy);
    }
  } else {
    appended = targetBody.appendListItem(copy);
    if (srcListId) {
      _listIdMap_[srcListId] = appended;
    }
  }

  try {
    const g = sourceLi.getGlyphType();
    if (g) appended.setGlyphType(g);
  } catch (e) {}
  try {
    appended.setNestingLevel(sourceLi.getNestingLevel() || 0);
  } catch (e) {}

  _enforceBookFontOnParagraph_(appended, { preserveColors: true });
  _copyPositionedImagesAfter_(sourceLi, targetBody);
}

function _clearParaText_(p) {
  try {
    const t = p.editAsText();
    const L = t.getText().length;
    if (L > 0) t.deleteText(0, L - 1);
  } catch (e) {}
}

/**
 * Birleştirilen Word içeriğindeki paragraf/liste maddesinin yazı tipini
 * Times New Roman'a (BOOK_BODY_FONT) çevirir.
 * Punto, bold, italic, renk gibi diğer biçimlendirmeler korunur.
 */
function _enforceBookFontOnParagraph_(para, options) {
  try {
    var text = para.editAsText();
    var len = text.getText().length;
    if (len === 0) return;
    text.setFontFamily(0, len - 1, BOOK_BODY_FONT);
  } catch (e) {
    Logger.log('_enforceBookFontOnParagraph_: ' + e);
  }
}

function _copyPositionedImagesAfter_(sourcePara, targetBody) {
  if (!sourcePara || typeof sourcePara.getPositionedImages !== 'function') return;
  let positioned;
  try { positioned = sourcePara.getPositionedImages(); } catch (e) { return; }
  if (!positioned || !positioned.length) return;
  positioned.forEach(function (pi, idx) {
    try {
      const imgPara = targetBody.appendParagraph('');
      _clearParaText_(imgPara);
      try {
        imgPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        imgPara.setSpacingBefore(6);
        imgPara.setSpacingAfter(6);
      } catch (e) {}
      const newImg = imgPara.appendInlineImage(pi.getBlob().copyBlob());
      let w = 0, h = 0;
      try { w = pi.getWidth() || 0; } catch (e) {}
      try { h = pi.getHeight() || 0; } catch (e) {}
      if (w > 0 && h > 0) {
        const scale = Math.min(1, BOOK_MAX_INLINE_IMAGE_WIDTH_PT / w);
        try { newImg.setWidth(Math.round(w * scale)); newImg.setHeight(Math.round(h * scale)); } catch (e) {}
      }
    } catch (e) {
      Logger.log('POSITIONED_IMAGE atlandı (#' + (idx + 1) + '): ' + e);
    }
  });
}
// ──────────────────────────────────────────────────────────────
//  TEST
// ──────────────────────────────────────────────────────────────

/**
 * Onay ve admin maillerini ADMIN_EMAIL adresine gönderir (Doc/Sheet'e dokunmaz).
 * @param {string=} congressKey  Boşsa ilk dolu kongre kullanılır.
 * @param {string=} lang         'tr' (varsayılan) veya 'en'.
 * @param {string=} bildiriType  'ozet' (varsayılan) veya 'tammetin'.
 */
function testEt(congressKey, lang, bildiriType) {
  // Yalnızca mail önizlemesi gönderir; Drive/Sheet'e dokunmaz — bu yüzden
  // getCongressConfig_'in aksine yalnızca docId'yi zorunlu kılar, folderId/sheetId
  // henüz boşken de (gerçek gönderim akışından bağımsız) çalışabilsin diye.
  let book;
  const key = String(congressKey || '').trim();
  if (key) {
    if (!Object.prototype.hasOwnProperty.call(BILDIRI_CONFIG, key)) {
      Logger.log('❌ Geçersiz kongre anahtarı: ' + key);
      return;
    }
    book = Object.assign({ key: key }, BILDIRI_CONFIG[key]);
  } else {
    const firstReady = Object.keys(BILDIRI_CONFIG).find(function (k) {
      return !!BILDIRI_CONFIG[k].docId;
    });
    if (!firstReady) {
      Logger.log('❌ Hiçbir kongre için docId dolu değil. BILDIRI_CONFIG\'i doldurunuz.');
      return;
    }
    book = Object.assign({ key: firstReady }, BILDIRI_CONFIG[firstReady]);
  }
  if (!book.docId) {
    Logger.log('❌ "' + book.label + '" için docId eksik.');
    return;
  }

  Logger.log('▶ Test kongresi: ' + book.label);

  const queueNo = 999;
  const testParams = {
    title: 'TEST: Sağlık Hizmetlerinde Dijital Dönüşüm',
    subject: 'Sağlık Yönetimi',
    keywords: 'sağlık, dijital, dönüşüm, yönetim',
    bildiriType: bildiriType || 'ozet',
    lang: normalizeLang_(lang),
  };

  const TEST_RECIPIENT_EMAIL = (CONFIG.ADMIN_EMAIL || '').trim();
  const testAuthors = [
    {
      unvan: 'Dr.',
      ad: 'Test',
      soyad: 'Yazar',
      kurum: CONFIG.BRAND_NAME + ' (Test)',
      email: TEST_RECIPIENT_EMAIL,
      orcid: '0000-0000-0000-0000',
    },
  ];

  const mockDriveFile = {
    getUrl: function () { return 'https://drive.google.com/'; },
    getName: function () { return 'TEST_DOSYA.docx'; },
    getMimeType: function () { return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; },
  };

  try {
    sendConfirmationEmail_(testParams, testAuthors, queueNo, book);
    Logger.log('✅ Onay maili gönderildi.');
  } catch (e) {
    Logger.log('❌ Onay maili hatası: ' + e);
  }

  try {
    sendAdminNotification_(testParams, testAuthors, queueNo, mockDriveFile, book);
    Logger.log('✅ Admin maili gönderildi.');
  } catch (e) {
    Logger.log('❌ Admin maili hatası: ' + e);
  }

  Logger.log('▶ Drive Advanced Service kontrolü:');
  if (typeof Drive === 'undefined' || typeof Drive.Files === 'undefined') {
    Logger.log('⚠️ Drive Advanced Service kapalı — Hizmetler → Google Drive API v3 ekleyiniz.');
  } else {
    Logger.log('✅ Drive Advanced Service hazır.');
  }
}

/**
 * Google Doc dosyasını açmaya çalışır, hata durumunda üstel geri çekilme ile yeniden dener.
 * @param {string} docId Doküman kimliği
 * @return {DocumentApp.Document} Açılan doküman nesnesi
 */
function openDocWithRetry_(docId) {
  var attempts = 0;
  var maxAttempts = 5;
  var baseDelay = 1000;
  while (true) {
    try {
      return DocumentApp.openById(docId);
    } catch (err) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw err;
      }
      var delay = baseDelay * Math.pow(2, attempts - 1) + Math.random() * 500;
      Logger.log('Doküman açılırken hata oluştu (' + docId + '), ' + Math.round(delay) + 'ms sonra tekrar denenecek. Deneme: ' + attempts + '/' + maxAttempts + '. Hata: ' + err.toString());
      Utilities.sleep(delay);
    }
  }
}
