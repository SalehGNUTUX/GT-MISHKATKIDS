// tools/gen-custom.mjs — يَمسح مجلّد التسجيلات البشرية public/tts/custom/ ويبني قائمتها
// في src/tts-custom.json. التشغيل: node tools/gen-custom.mjs (بعد إضافة/حذف تسجيل).
// التسجيلات البشرية تُقدَّم على مقاطع espeak (لإصلاح ما يعجز عنه المحرّك كالسكون الشديد).
import { readdirSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, "public", "tts", "custom");
const OUT = join(ROOT, "src", "tts-custom.json");

if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
const files = readdirSync(DIR).filter(f => /\.mp3$/i.test(f));
writeFileSync(OUT, JSON.stringify(files));
console.log(`✅ ${files.length} تسجيلًا بشريًّا في public/tts/custom/ (src/tts-custom.json)`);
