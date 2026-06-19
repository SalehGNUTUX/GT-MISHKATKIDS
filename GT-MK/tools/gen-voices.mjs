// tools/gen-voices.mjs — يُضمّن تسجيلاتٍ بشريّةً مُصدَّرةً من الاستوديو مع البرنامج (افتراضياً).
// الخطوات: من الاستوديو اضغط «📦 تصدير» → فُكّ الـZIP في مجلّد voices-src/ بجذر المشروع → شغّل:
//   npm run gen:voices   (يتطلّب ffmpeg على جهاز التطوير)
// المخرجات: public/tts/voices/<setHash>/<textHash>.mp3 + src/voices-bundled.json (مجموعات + خريطة).
// الأسماء على القرص بهاشّاتٍ لاتينية (آمنة)، والأسماء العربية تبقى في حقل name للعرض في الإعدادات.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// مسحٌ تعاوديّ: يربط اسم الملفّ (الهاش اللاتينيّ الفريد) بمساره الفعليّ —
// لتفادي عللِ ترميز أسماء المجلّدات العربية عند فكّ الضغط.
function walk(dir) { let out = []; for (const n of readdirSync(dir)) { const p = join(dir, n); if (statSync(p).isDirectory()) out = out.concat(walk(p)); else out.push(p); } return out; }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.env.VOICES_SRC || join(ROOT, "voices-src");
const OUT = join(ROOT, "public", "tts", "voices");
const MANIFEST = join(ROOT, "src", "voices-bundled.json");
const SEP = " ";
const sha = s => createHash("sha1").update(s).digest("hex").slice(0, 12);

const idxPath = join(SRC, "voices.json");
if (!existsSync(idxPath)) {
  console.error("✗ لا يوجد voices-src/voices.json — صدّر من الاستوديو وفُكّ الـZIP في voices-src/.");
  process.exit(1);
}
const idx = JSON.parse(readFileSync(idxPath, "utf8"));
const byBase = new Map();
for (const f of walk(SRC)) byBase.set(f.split("/").pop(), f); // اسم الملفّ → مساره الفعليّ
const sets = new Map(), files = {};
let ok = 0, fail = 0;
for (const e of idx) {
  const setId = e.set || `${e.gender}-${e.age}-${e.name}`;
  const setHash = sha(setId);
  const setDir = join(OUT, setHash); mkdirSync(setDir, { recursive: true });
  const inFile = byBase.get(e.file.split("/").pop());
  if (!inFile) { fail++; console.error("✗ ملفّ مفقود:", e.file); continue; }
  const tHash = sha(e.text);
  const outMp3 = join(setDir, tHash + ".mp3");
  try {
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", inFile, "-codec:a", "libmp3lame", "-q:a", "6", outMp3]);
    files[setId + SEP + e.text] = `tts/voices/${setHash}/${tHash}.mp3`;
    if (!sets.has(setId)) sets.set(setId, { id: setId, name: e.name || setId, gender: e.gender || "", age: e.age || "" });
    ok++;
  } catch (err) { fail++; console.error("✗", e.file, err.message); }
}
// **تراكُمٌ لا استبدال:** التصديرُ من الاستوديو يَشمل تسجيلاتِ الجهاز فقط (لا المُدمَجَ)، فلو استبدلنا
// لضاع المُدمَجُ القديم. لذا نُبقي **كلَّ** القديم (كلُّ المجموعات وكلُّ مقاطعها) ونُضيف/نُحدّث الواردَ فوقه.
// (الحذفُ المقصودُ يكون يدويّاً أو بأداةٍ منفصلة، لا عبر تصديرٍ جزئيّ.)
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { sets: [], files: {} };
const updatedIds = new Set(sets.keys());
const mergedSets = (prev.sets || []).filter(s => !updatedIds.has(s.id)).concat([...sets.values()]); // حدّثْ بيانات المجموعة
const mergedFiles = { ...(prev.files || {}), ...files }; // أبقِ كلَّ القديم ثمّ أضِف/حدّثِ الجديد (اتّحاد)
const before = Object.keys(prev.files || {}).filter(k => updatedIds.has(k.split(SEP)[0])).length;
const after = Object.keys(mergedFiles).filter(k => updatedIds.has(k.split(SEP)[0])).length;
writeFileSync(MANIFEST, JSON.stringify({ sets: mergedSets, files: mergedFiles }, null, 0));
console.log(`✅ ${ok} مقطعًا (${fail} فشل). المجموعةُ المُحدَّثة: ${before} → ${after} (تراكُمٌ لا استبدال) → src/voices-bundled.json`);
