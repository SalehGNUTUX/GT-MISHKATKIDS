// tools/gen-piper-lang.mjs — توليد مقاطع Piper العصبيّة للّغات الأجنبيّة (وقتَ التطوير فقط).
//   الاستعمال: node tools/gen-piper-lang.mjs en   |   ... fr
//   en → en_GB-alba-medium (مجموعة tts-alba) · fr → fr_FR-tom-medium (مجموعة tts-tom)
//   المخرجات: public/tts/voices/<setHash>/*.mp3 + دمجٌ في src/voices-bundled.json (دون مساس بالعربيّة).
//   النصوص من content/lang-<code>.js (أحرف + أمثلة + أرقام؛ تتوسّع تلقائياً مع المحتوى).
//   types:["foreign"] كي لا تظهر هذه المجموعاتُ في قوائم الصوت العربيّة. التشغيل offline بعدها (MP3 ثابتة).
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const code = (process.argv[2] || "").toLowerCase();
const CFG = {
  en: { model: "en_GB-alba-medium.onnx", set: { id: "tts-alba", name: "English (alba)", kind: "tts", lang: "en", types: ["foreign"] }, content: "../content/lang-en.js" },
  fr: { model: "fr_FR-tom-medium.onnx", set: { id: "tts-tom", name: "Français (tom)", kind: "tts", lang: "fr", types: ["foreign"] }, content: "../content/lang-fr.js" },
}[code];
if (!CFG) { console.error("الاستعمال: node tools/gen-piper-lang.mjs en|fr"); process.exit(1); }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PYTHON = process.env.PIPER_PYTHON || join(ROOT, ".piper-venv", "bin", "python");
const MODEL = join(ROOT, "tools", "piper-voices", CFG.model);
const SYNTH = join(ROOT, "tools", "piper_synth.py");
const OUTDIR = join(ROOT, "public", "tts", "voices");
const BUNDLE = join(ROOT, "src", "voices-bundled.json");
const SEP = " ";
const sha = s => createHash("sha1").update(s).digest("hex").slice(0, 12);

const L = (await import(CFG.content)).default;
const SET = CFG.set;
const uniq = a => [...new Set(a.filter(Boolean).map(s => String(s).trim()).filter(Boolean))];
// أسماءُ الأحرف صوتيّاً (name) — يُنطِقُها العصبيُّ كبقيّة المحتوى. مفتاحُها = name، لكنّ نصَّ
// التركيب يُذيَّل بنقطةٍ (LETTER_DOT) لإعطاء النموذج خاتمةً جُمليّةً تُثبّتُ المقطعَ القصيرَ جدّاً.
const LETTER_NAMES = new Set(uniq((L.letters || []).map(x => x.name || x.ch)));
const texts = uniq([
  ...LETTER_NAMES,                       // أسماءُ الأحرف (عصبيّ)
  ...(L.letters || []).map(x => x.word), // كلمةُ المثال
  ...(L.numbers || []).map(x => x.word),
  ...(L.words || []).flatMap(c => (c.items || []).map(it => it.w)),
  ...(L.phrases || []).flatMap(c => (c.items || []).map(it => it.t)),
  ...(L.reactions || []).map(r => r.t),    // ردودُ أفعال الآلي (مدح) بلغة القسم
  ...(L.encourage || []).map(r => r.t),    // ردودُ التشجيع عند الخطأ بلغة القسم
  ...(L.stories || []).flatMap(s => [s.title, ...(s.pages || []).map(p => p.text), s.lesson]),
  ...(L.verbs || []).flatMap(v => [v.v,                                   // المصدرُ/الفعل
    ...(v.conj || []).map(c => c.w),                                       // تصريفُ الضمائر (المضارع)
    ...["past", "present", "future"].map(t => v.tenses && v.tenses[t] && v.tenses[t].w)]), // الأزمنة (أنا)
]);

const setHash = sha(SET.id);
const setDir = join(OUTDIR, setHash);
mkdirSync(setDir, { recursive: true });
// المفتاحُ يبقى النصَّ الأصليَّ (للمطابقة في lang.html)؛ نصُّ التركيبِ لأسماء الأحرف يُذيَّل بنقطةٍ
// (خاتمةٌ جُمليّةٌ تُحسّنُ نطقَ العصبيّ للوحدة المنفردة وتُقلّل تشويهَ الحوافّ).
const tasks = texts.map(t => ({ key: SET.id + SEP + t, text: LETTER_NAMES.has(t) ? t + " ." : t, out: join(setDir, sha(t) + ".mp3"), file: `tts/voices/${setHash}/${sha(t)}.mp3` }));

console.log(`🔊 توليد ${tasks.length} مقطعًا بصوت Piper (${SET.id} ← ${CFG.model})…`);
const tasksFile = join(ROOT, ".piper-tasks.json");
const manifestFile = join(ROOT, ".piper-manifest.json");
writeFileSync(tasksFile, JSON.stringify(tasks));
const synthArgs = [SYNTH, tasksFile, manifestFile, MODEL];
if (CFG.speaker != null) synthArgs.push(String(CFG.speaker)); // المتحدّث (للنماذج متعدّدة الأصوات)
execFileSync(PYTHON, synthArgs, { stdio: ["ignore", "inherit", "inherit"] });
const produced = JSON.parse(readFileSync(manifestFile, "utf8"));

const bundle = existsSync(BUNDLE) ? JSON.parse(readFileSync(BUNDLE, "utf8")) : { sets: [], files: {} };
bundle.sets = (bundle.sets || []).filter(s => s.id !== SET.id);
bundle.sets.push(SET);
bundle.files = Object.fromEntries(Object.entries(bundle.files || {}).filter(([k]) => !k.startsWith(SET.id + SEP)));
for (const [k, f] of Object.entries(produced)) bundle.files[k] = f;
writeFileSync(BUNDLE, JSON.stringify(bundle, null, 0));
console.log(`✅ دُمِجت ${Object.keys(produced).length} مقطعًا في مجموعة «${SET.name}» → src/voices-bundled.json`);
