// tools/gen-piper.mjs — توليد مجموعة صوتٍ عصبيّة (Piper) **وقتَ التطوير فقط** للكلمات والجمل والنصوص والقصص.
// المخرجات: public/tts/voices/<setHash>/<textHash>.mp3 + دمجها في src/voices-bundled.json (دون مساس بمجموعة «صالح»).
// المبدأ: لا ذكاءَ وقتَ التشغيل — التطبيق يشغّل MP3 ثابتة بلا إنترنت. الحروفُ مستثناةٌ (Piper ضعيفٌ لها).
//   التشغيل: npm run gen:piper   (يتطلّب .piper-venv فيه piper-tts + imageio-ffmpeg، والنموذج في tools/piper-voices/).
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { WORD_UNITS, SENTENCE_UNITS } from "../src/vocab.js";
import { forSynthesis } from "../src/arabic-normalize.js";
import { spokenRef } from "../src/spoken-ref.js";
import stories from "../content/stories.js";
import sararim from "../content/sararim-stories.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PYTHON = process.env.PIPER_PYTHON || join(ROOT, ".piper-venv", "bin", "python");
const MODEL = process.env.PIPER_MODEL || join(ROOT, "tools", "piper-voices", "ar_JO-kareem-medium.onnx");
const SYNTH = join(ROOT, "tools", "piper_synth.py");
const OUTDIR = join(ROOT, "public", "tts", "voices");
const BUNDLE = join(ROOT, "src", "voices-bundled.json");
const SEP = " ";
const sha = s => createHash("sha1").update(s).digest("hex").slice(0, 12);

// مجموعةُ القارئ العصبيّ — متاحةٌ للكلمات/الجمل/القصص فقط (لا الحروف).
const SET = { id: "tts-kareem", name: "قارئ النصوص (kareem)", gender: "male", age: "adult", kind: "tts", types: ["word", "sentence", "story"] };

const uniq = a => [...new Set(a.filter(Boolean).map(s => String(s).trim()).filter(Boolean))];
const texts = uniq([
  ...WORD_UNITS.flatMap(u => u.items),
  ...SENTENCE_UNITS.flatMap(u => u.items),
  ...(stories.stories || []).flatMap(s => [s.title, s.lesson, ...(s.pages || []).map(p => p.text)]),
  ...(sararim.stories || []).flatMap(s => [s.title, s.text]),
]);

const setHash = sha(SET.id);
const setDir = join(OUTDIR, setHash);
mkdirSync(setDir, { recursive: true });
const tasks = texts.map(t => ({ key: SET.id + SEP + t, text: forSynthesis(spokenRef(t)), out: join(setDir, sha(t) + ".mp3"), file: `tts/voices/${setHash}/${sha(t)}.mp3` }));

console.log(`🔊 توليد ${tasks.length} مقطعًا بصوت Piper العصبيّ (${SET.id})…`);
const tasksFile = join(ROOT, ".piper-tasks.json");
const manifestFile = join(ROOT, ".piper-manifest.json");
writeFileSync(tasksFile, JSON.stringify(tasks));
execFileSync(PYTHON, [SYNTH, tasksFile, manifestFile, MODEL], { stdio: ["ignore", "inherit", "inherit"] });
const produced = JSON.parse(readFileSync(manifestFile, "utf8")); // key -> file (الناجحة فقط)

// دمجٌ في الحزمة دون مساسٍ بالمجموعات الأخرى (كـ«صالح»).
const bundle = existsSync(BUNDLE) ? JSON.parse(readFileSync(BUNDLE, "utf8")) : { sets: [], files: {} };
bundle.sets = (bundle.sets || []).filter(s => s.id !== SET.id);
bundle.sets.push(SET);
// أسقِطْ مفاتيحَ هذه المجموعة القديمة كلَّها قبل الدمج (كيلا تتراكم مفاتيحُ نصوصٍ تغيّرت).
bundle.files = Object.fromEntries(Object.entries(bundle.files || {}).filter(([k]) => !k.startsWith(SET.id + SEP)));
for (const [k, f] of Object.entries(produced)) bundle.files[k] = f;
writeFileSync(BUNDLE, JSON.stringify(bundle, null, 0));
console.log(`✅ دُمِجت ${Object.keys(produced).length} مقطعًا في مجموعة «${SET.name}» → src/voices-bundled.json`);
