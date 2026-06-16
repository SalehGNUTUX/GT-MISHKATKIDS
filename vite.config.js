import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  // منفذٌ ثابت: التخزين (الحسابات/التقدّم/التسجيلات) مرتبطٌ بالأصل (المنفذ)، فتثبيتُه يمنع «اختفاء» البيانات
  // حين يختار Vite منفذًا مختلفًا. strictPort يُخطئ بدل الانتقال صامتًا (فنحرّر المنفذ بدل تغيّر الأصل).
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        print: "print.html",
        home: "home.html",
        stories: "stories.html",
        play: "play.html",
        tales: "tales.html",
        puzzles: "puzzles.html",
        quiz: "quiz.html",
        basics: "basics.html",
        math: "math.html",
        read: "read.html",
        record: "record.html",
        progress: "progress.html",
        quran: "quran.html",
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "icon-192.png", "icon-512.png", "apple-touch-icon.png"],
      manifest: {
        name: "مِشكاة — الطفل والآليّ (Mishkat)",
        short_name: "مِشكاة",
        lang: "ar",
        dir: "rtl",
        start_url: "./",
        scope: "./",
        display: "standalone",
        orientation: "portrait",
        background_color: "#FBF7EF",
        theme_color: "#E07A5F",
        description:
          "نظام تعليميّ للأطفال: الطفل يُعلّم روبو فيتذكّر ويتعافى — محليّ بالكامل، بلا اتصال وبلا ذكاء اصطناعي.",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
        ],
      },
      workbox: {
        // mp3 = مقاطع النطق المُولَّدة مسبقاً (لتعمل دون إنترنت على كل جهاز)
        globPatterns: ["**/*.{js,css,html,svg,json,webmanifest,woff2,ttf,otf,mp3}"],
        // تلاوةُ القرآن (الحصري، ~79م) لا تُحمَّل مسبقاً (تُثقِل التثبيت)؛ تُخزَّن عند الاستماع (CacheFirst)
        // فتعمل دون إنترنت بعد أوّل استماعٍ لكلِّ سورة. النصُّ مُضمَّنٌ في الحزمة فيعملُ دائمًا.
        globIgnores: ["**/quran/husary/**"],
        runtimeCaching: [{
          urlPattern: ({ url }) => url.pathname.includes("/quran/husary/"),
          handler: "CacheFirst",
          options: { cacheName: "quran-husary", expiration: { maxEntries: 1200 }, cacheableResponse: { statuses: [0, 200] } },
        }],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // يتولّى الإصدارُ الجديد السيطرةَ فورًا عند التحديث (يمنع تقديمَ مقاطع/كود قديمٍ مُخبَّأ بعد إعادة البناء).
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
