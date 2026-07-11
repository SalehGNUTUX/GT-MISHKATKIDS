// tools/gen-piper.mjs — توليد مجموعة صوتٍ عصبيّة (Piper) **وقتَ التطوير فقط** للكلمات والجمل والنصوص والقصص.
// المخرجات: public/tts/voices/<setHash>/<textHash>.mp3 + دمجها في src/voices-bundled.json (دون مساس بمجموعة «صالح»).
// المبدأ: لا ذكاءَ وقتَ التشغيل — التطبيق يشغّل MP3 ثابتة بلا إنترنت. الحروفُ مستثناةٌ (Piper ضعيفٌ لها).
//   التشغيل: npm run gen:piper   (يتطلّب .piper-venv فيه piper-tts + imageio-ffmpeg، والنموذج في tools/piper-voices/).
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SENTENCE_UNITS } from "../src/vocab.js";
import { forSynthesis } from "../src/arabic-normalize.js";
import stories from "../content/stories.js";
import sararim from "../content/sararim-stories.js";
import { allClockPhrases } from "../content/clock-time.js"; // جُمَلُ الوقت (v1.5) — نطقُ الساعةِ العربيّ
import { allOrientWords, allPrayerWords } from "../content/orient.js"; // اتجاهات/فصول/فترات + أسماءُ الصلوات (نطقٌ عصبيٌّ عربيّ)
import { REACTIONS, GAME_REACTIONS, GAME_INTROS, NOTICES, GREETINGS, femaleize } from "../src/robo-phrases.js"; // عباراتُ الآليّ الموجَّهة
import { PRAISE } from "../src/islamic.js";
import library from "../content/library.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PYTHON = process.env.PIPER_PYTHON || join(ROOT, ".piper-venv", "bin", "python");
const MODEL = process.env.PIPER_MODEL || join(ROOT, "tools", "piper-voices", "ar_JO-kareem-medium.onnx");
const SYNTH = join(ROOT, "tools", "piper_synth.py");
const OUTDIR = join(ROOT, "public", "tts", "voices");
const BUNDLE = join(ROOT, "src", "voices-bundled.json");
const SEP = " ";
const sha = s => createHash("sha1").update(s).digest("hex").slice(0, 12);

// مجموعةُ القارئ العصبيّ — **للجُمَل والنصوص وردود أفعال الآلي فقط** (حيث يتفوّق Piper). أُزيلَ توليدُ المفردات
// (حرف/كلمة/رقم) لأنّ العصبيَّ ضعيفٌ لها وغيرُ افتراضيّ لها (ترشيدُ الحجم: ~913 مقطعًا مفردًا حُذِفت).
// للمفردات: espeak (الآليّ) و«صالح» (البشريّ) — وكلاهما متاحٌ لكلّ الأنواع (بلا types).
const SET = { id: "tts-kareem", name: "قارئ النصوص (kareem)", gender: "male", age: "adult", kind: "tts", types: ["sentence", "story", "reaction"] };

const uniq = a => [...new Set(a.filter(Boolean).map(s => String(s).trim()).filter(Boolean))];
// عباراتُ الآليِّ الموجَّهةُ للطفل (تُخاطَبُ بالمذكّرِ أو المؤنَّثِ حسبَ جنسِ الحساب) — نولّدُ النسختين
// كي يكونَ للنصِّ المؤنَّثِ (femaleize) مقطعُ Piper عصبيٌّ ولا يَصمُتَ لحساباتِ البنات.
const roboDirected = uniq([
  ...Object.values(REACTIONS || {}).flat(),
  ...Object.values(GAME_REACTIONS || {}).flat(),
  ...Object.values(GAME_INTROS || {}),
  ...Object.values(NOTICES || {}),
  ...(PRAISE || []), ...(GREETINGS || []),
  ...(library.memories || []).flatMap(m => [m.spark && m.spark.robo_line, m.teach && m.teach.robo_question, m.heal && m.heal.robo_reaction, m.think && m.think.robo_wrong]),
]);
const texts = uniq([
  ...SENTENCE_UNITS.flatMap(u => u.items),   // جُمَل القراءة + ردود الآلي + الإشعارات + نصوص قصّة الأرقام + القصص
  ...(stories.stories || []).flatMap(s => [s.title, s.lesson, ...(s.pages || []).map(p => p.text)]),
  ...(sararim.stories || []).flatMap(s => [s.title, s.text]),
  ...roboDirected,                            // خطابُ الآليّ المذكّر (يشمل حلقةَ «علّم الآليّ»)
  ...roboDirected.map(femaleize),             // النسخُ المؤنّثةُ (تُطابقُ خطابَ الآليّ للأنثى)
  ...allClockPhrases("ar"),                  // نطقُ الوقتِ العربيُّ (144 جملة + لصيقتا ص/م)
  ...allOrientWords("ar"),                   // الاتجاهاتُ والفصولُ وفتراتُ اليوم (20 كلمة، عصبيّ)
  ...allPrayerWords(),                        // أسماءُ الصلواتِ الخمس (عصبيّ)
]);
// الكلماتُ القصيرةُ (اتجاهات/فصول/فترات/صلوات) يُذيَّلُ نصُّ تركيبِها بنقطةٍ لتثبيتِ نطقِ العصبيّ للوحدةِ المنفردة.
const ORIENT_AR = new Set([...allOrientWords("ar"), ...allPrayerWords()]);

const setHash = sha(SET.id);
const setDir = join(OUTDIR, setHash);
mkdirSync(setDir, { recursive: true });
// تصحيحاتُ تركيبٍ لكلماتٍ يُقصّرُ العصبيُّ مدَّها (المفتاحُ/الملفُّ يبقى الأصلَ، والنصُّ المُركَّبُ بديلٌ ممدود):
// «مُمْتَاز» كان يُنطَقُ قصيرًا (mumtaz)؛ مدُّ الألفِ صراحةً يُعطي المدَّ الصحيح (mumtaaz).
const SYNTH_FIX = { "مُمْتَاز!": "مُمْتَااز!" };
const tasks = texts.map(t => ({ key: SET.id + SEP + t, text: forSynthesis(SYNTH_FIX[t] || (ORIENT_AR.has(t) ? t + " ." : t)), out: join(setDir, sha(t) + ".mp3"), file: `tts/voices/${setHash}/${sha(t)}.mp3` }));

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
