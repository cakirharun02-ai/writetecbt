import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/sertifika": [
      "./sertifika_v3.html",
      "./certificate/7.kongre-sertifika.html",
      "./public/img/writetec-logo.png",
      "./public/img/imza.png",
      "./node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/@sparticuz/chromium/build/**",
    ],
    "/kongrelerimiz/sosyal-saglik-bilimleri/basvuru-formu/form": [
      "./sosyal-form/kongre-basvuru-formu.html",
    ],
    "/kongrelerimiz/sosyal-saglik-bilimleri/bildiri-yukleme/form": [
      "./bildiri-form-sosyal/bildiri-yukleme-formu.html",
    ],
    // Mevcut eksik: kitap formu da aynı şekilde disk'ten okunuyor ama
    // bundle'a dahil edilmiyordu.
    "/yayin-imkanlari/kitap/form": ["./kitap-form/kitap-bolum-formu.html"],
  },
};

export default nextConfig;
