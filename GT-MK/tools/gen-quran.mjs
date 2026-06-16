// tools/gen-quran.mjs — تنزيلٌ **وقتَ التطوير فقط** لنصّ القرآن (العثمانيّ) وتلاوةِ الحصري آيةً آيةً
// للفاتحة + جزء عمّ (آخر حزبين: السور 78–114) → محلّيّ بالكامل ليعمل دون إنترنت.
// المخرجات: content/quran.js (النصّ + البيانات) + public/quran/husary/SSSAAA.mp3 (مقاطع الآيات).
// التشغيل: npm run gen:quran  (يتطلّب إنترنت مرّةً واحدة على جهاز التطوير).
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AUDIO_DIR = join(ROOT, "public", "quran", "husary");
const OUT = join(ROOT, "content", "quran.js");
mkdirSync(AUDIO_DIR, { recursive: true });

const pad3 = n => String(n).padStart(3, "0");
const SURAHS = [1, ...Array.from({ length: 114 - 78 + 1 }, (_, i) => 78 + i)]; // الفاتحة + جزء عمّ
const TEXT_API = n => `https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`;
const AUDIO_URL = (s, a) => `https://everyayah.com/data/Husary_128kbps/${pad3(s)}${pad3(a)}.mp3`;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchJSON(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch (e) {}
    await sleep(600 * (i + 1));
  }
  throw new Error("نصّ تعذّر جلبه: " + url);
}
async function dlAudio(s, a, tries = 4) {
  const file = join(AUDIO_DIR, `${pad3(s)}${pad3(a)}.mp3`);
  if (existsSync(file)) return true;
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(AUDIO_URL(s, a));
      if (r.ok) { const buf = Buffer.from(await r.arrayBuffer()); if (buf.length > 500) { writeFileSync(file, buf); return true; } }
    } catch (e) {}
    await sleep(700 * (i + 1));
  }
  return false;
}

const surahs = [];
let audioOk = 0, audioFail = 0;
for (const n of SURAHS) {
  const j = await fetchJSON(TEXT_API(n));
  const d = j.data;
  const ayahs = d.ayahs.map(a => ({ a: a.numberInSurah, text: a.text }));
  surahs.push({ n, name: d.name, nameEn: d.englishName, type: d.revelationType, ayahCount: d.numberOfAyahs, ayahs });
  // تنزيل الصوت آيةً آية (تسلسليّ لطيفٌ على الخادم).
  for (const a of ayahs) { const ok = await dlAudio(n, a.a); ok ? audioOk++ : audioFail++; }
  console.log(`… سورة ${n} (${d.name}): ${ayahs.length} آية`);
}

const header = `// content/quran.js — نصّ القرآن (العثمانيّ) + بيانات الفاتحة وجزء عمّ. مُولَّدٌ بـtools/gen-quran.mjs.\n// التلاوة: محمود خليل الحصري (محلّيّة في public/quran/husary/SSSAAA.mp3). محلّيٌّ بالكامل دون إنترنت.\n`;
writeFileSync(OUT, header + "export default " + JSON.stringify({ reciter: "محمود خليل الحصري", source: "alquran.cloud (عثماني) + everyayah.com (الحصري)", surahs }, null, 1) + ";\n");
console.log(`✅ ${surahs.length} سورة، صوت: ${audioOk} ناجح / ${audioFail} فشل → content/quran.js + public/quran/husary/`);
