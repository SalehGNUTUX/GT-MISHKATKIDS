// tools/gen-quran-full.mjs — يولّدُ البياناتِ الوصفيّةَ للقرآنِ الكاملِ (أحزاب + سور) فقط، بلا نصٍّ ولا صوت.
// النصُّ والصوتُ يبقيانِ عبرَ الإنترنت (تحميلٌ عند الطلب) — هذا أوّلُ استثناءٍ متعمَّدٍ من «محلّيٌّ 100%»،
// مُطفأٌ افتراضيًّا خلفَ بوّابةِ الوالد. المخرَج: content/quran-full.js (~صغير، بياناتٌ وصفيّةٌ محضة).
// المصدر: api.alquran.cloud/v1/meta (مرّةً وقتَ التطوير). لا يَمَسُّ content/quran.js المحلّيَّ إطلاقًا.
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "content", "quran-full.js");

async function fetchJSON(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return await r.json(); } catch (e) {}
    await new Promise(r => setTimeout(r, 800 * (i + 1)));
  }
  throw new Error("فشلَ الجلبُ: " + url);
}

const meta = (await fetchJSON("https://api.alquran.cloud/v1/meta")).data;

// السورُ الـ114: بياناتٌ وصفيّةٌ فقط (رقم/اسم/اسمٌ إنجليزيّ/نوع/عددُ آيات).
const surahs = meta.surahs.references.map(s => ({
  n: s.number, name: s.name, nameEn: s.englishName, type: s.revelationType, ayahCount: s.numberOfAyahs,
}));

// خريطةُ الآيةِ العالميّة (surah,ayah) → فهرسٌ متسلسلٌ لحسابِ تداخلِ السور مع الأحزاب.
const cum = [0]; // cum[s] = مجموعُ آياتِ السورِ قبلَ السورةِ s
for (let s = 1; s <= 114; s++) cum[s] = cum[s - 1] + surahs[s - 1].ayahCount;
const gidx = (s, a) => cum[s - 1] + a; // 1..6236

// 60 حزبًا: يبدأُ الحزبُ n عندَ الربعِ رقم (n-1)*4 من hizbQuarters (240 ربعًا).
const q = meta.hizbQuarters.references; // [{surah,ayah}]×240
const hizbs = [];
for (let n = 1; n <= 60; n++) {
  const start = q[(n - 1) * 4];
  const nextStart = n < 60 ? q[n * 4] : { surah: 114, ayah: surahs[113].ayahCount + 1 };
  const gStart = gidx(start.surah, start.ayah);
  const gEnd = gidx(nextStart.surah, nextStart.ayah) - 1; // شاملٌ آخرَ آيةٍ في الحزب
  // السورُ المتداخلةُ مع نطاقِ الحزب [gStart, gEnd]
  const list = [];
  for (let s = 1; s <= 114; s++) {
    const sStart = gidx(s, 1), sEnd = gidx(s, surahs[s - 1].ayahCount);
    if (sStart <= gEnd && sEnd >= gStart) list.push(s);
  }
  hizbs.push({ n, startSurah: start.surah, startAyah: start.ayah, surahs: list });
}

const LOCAL = [1, ...Array.from({ length: 114 - 78 + 1 }, (_, i) => 78 + i)]; // الفاتحة + جزء عمّ (متوفّرٌ محلّيًّا أصلًا)

const header = `// content/quran-full.js — بياناتٌ وصفيّةٌ للقرآنِ الكاملِ (أحزاب + 114 سورة) — مُولَّدٌ بـtools/gen-quran-full.mjs.
// **لا نصَّ ولا صوتَ هنا**: يُجلَبانِ عبرَ الإنترنت عندَ الطلب (استثناءٌ مأذونٌ، مُطفأٌ افتراضيًّا خلفَ بوّابةِ الوالد).
// السورُ المحلّيّةُ أصلًا (الفاتحة+جزء عمّ) في LOCAL — تُعرَضُ بشارةِ 🟢 وتُقرأُ من الحزمةِ لا الشبكة.
// لا يَمَسُّ content/quran.js المحلّيَّ (الفاتحة+جزء عمّ) إطلاقًا.\n`;
writeFileSync(OUT, header + "export default " + JSON.stringify({
  source: "api.alquran.cloud/v1/meta (بياناتٌ وصفيّة) · النصُّ quran-uthmani · الصوتُ everyayah Husary_128kbps",
  local: LOCAL, surahs, hizbs,
}, null, 1) + ";\n");

console.log(`✅ ${surahs.length} سورة، ${hizbs.length} حزبًا → content/quran-full.js`);
console.log(`   الحزبُ 1: سور [${hizbs[0].surahs.join(",")}] · الحزبُ 60: سور [${hizbs[59].surahs.join(",")}]`);
