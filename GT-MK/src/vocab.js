// src/vocab.js — المفردات المنطوقة الموحَّدة (مصدرٌ واحد). تُقرأ في المتصفّح وNode (المولّد).
// الاستوديو (record.html) ومولّد الصوت (gen-audio) يقرآن منها معًا — فأيّ محتوًى يُضاف
// إلى content/* أو robo-phrases ينعكس تلقائياً في كليهما (تزامنٌ كامل).
import { allForms } from "./syl.js";
import reading from "../content/reading.js";
import words from "../content/words.js";
import letters from "../content/letters.js";
import math from "../content/math.js";
import compose from "../content/compose-vocab.js";
import numerals from "../content/numerals.js";
import stories from "../content/stories.js";
import sararim from "../content/sararim-stories.js";
import quiz from "../content/quiz.js";
import puzzles from "../content/puzzles.js";
import { numberNames } from "./numbers-ar.js";
import { REACTIONS, NOTICES, GAME_REACTIONS, GAME_INTROS, GREETINGS } from "./robo-phrases.js";
import { PRAISE } from "./islamic.js";
import langEn from "../content/lang-en.js";
import langFr from "../content/lang-fr.js";
import { allOrientWords } from "../content/orient.js";

const uniq = a => [...new Set(a.filter(Boolean).map(s => String(s).trim()).filter(Boolean))];

// «اسمعِ السؤال» (v1.10): أسئلةُ الاختباراتِ والألغازِ وأسئلةُ فهمِ القصصِ وخياراتُها — تُنطَقُ بـread-aloud.js.
// الجُمَلُ (فيها مسافة) إلى SENTENCE_UNITS فيولّدُها Piper، والمفرداتُ إلى WORD_UNITS فيولّدُها espeak
// (Piper ضعيفٌ في الكلمةِ المفردة، و«أفضلُ المتاح» يستعملُ مقطعَه لأيِّ نصٍّ إن وُجد — فلا يُولَّدُ لها).
// وحداتُ الجُمَلِ هذه `neuralOnly`: لا تُولَّدُ لها مقاطعُ espeak احتياطيّة (قرارُ المستخدم 2026-11-19 — الحجم)؛
// فإن اختارَ الوالدُ «الآليَّ» صراحةً لها رجعت إلى صوتِ النظام.
const isSentence = t => /\s/.test(String(t).trim());
const QA_TEXTS = uniq([
  ...(quiz.questions || []).flatMap(q => [q.q, ...(q.options || [])]),
  ...(puzzles.puzzles || []).flatMap(p => [p.riddle, p.hint, p.solution]),
  ...(sararim.stories || []).flatMap(s => (s.questions || []).flatMap(q => [q.q, ...(q.options || [])])),
]);

// وحداتُ الكلمات والجمل (تُعرَض في الاستوديو، وتُولَّد لها مقاطع espeak احتياطية).
export const WORD_UNITS = [
  { key: "read", label: "كلمات القراءة", items: uniq((reading.words || []).map(w => w.word)) },
  { key: "play", label: "كلمات الألعاب", items: uniq((words.words || []).map(w => w.word)) },
  { key: "ex",   label: "أمثلة الحروف", items: uniq((letters.letters || []).map(l => l.ex)) },
  { key: "num",  label: "الأرقام", items: uniq((letters.numbers || []).map(n => n.name)) },
  { key: "num100", label: "الأعداد 0–100", items: uniq(numberNames(100)) },
  { key: "shapes", label: "أسماء الأشكال", items: uniq([].concat(math.shapes_basic || [], math.shapes_advanced || []).map(s => s.name)) },
  { key: "orient", label: "الزمان والمكان (اتجاهات/فصول/فترات)", items: uniq(allOrientWords("ar")) },
  // مفردات «اقرأ بصوتك» (compose-vocab) — وحدةٌ لكلِّ فئة، تُعرَض في الاستوديو وتُولَّد لها مقاطع احتياطية.
  { key: "qa_words", label: "إجاباتٌ من كلمة (اختبارات · ألغاز · قصص)", items: QA_TEXTS.filter(t => !isSentence(t)) },
  ...(compose.categories || []).map(c => ({ key: "cmp_" + c.id, label: "اقرأ: " + c.title, items: uniq((c.items || []).map(it => it.t)) })),
];
export const SENTENCE_UNITS = [
  { key: "sread", label: "جمل القراءة", items: uniq((reading.sentences || []).map(s => s.text)) },
  { key: "robo",  label: "عبارات الآليّ", items: uniq([].concat(...Object.values(REACTIONS || {}), PRAISE || [], GREETINGS || [])) },
  // إشعاراتُ الآليّ السياقيّة (نهاية سورة، حلّ لغز، ورشة، ألعاب…) — تُنطَق بمقاطع espeak وتُسجَّل بشريًّا.
  { key: "notices", label: "إشعارات الآليّ", items: uniq(Object.values(NOTICES || {})) },
  // تفاعلاتُ الألعاب التنافسيّة — تُنطَق عصبيًّا (kareem) في الألعاب.
  { key: "games", label: "تفاعلات الألعاب", items: uniq([].concat(...Object.values(GAME_REACTIONS || {}))) },
  { key: "game_intros", label: "تعليمات الألعاب", items: uniq(Object.values(GAME_INTROS || {})) },
  // نصوص قصّة الأرقام (لتسجيلها بصوتٍ بشريّ ولها مقاطع احتياطية).
  { key: "numerals", label: "قصّة الأرقام", items: uniq([numerals.intro, (numerals.zero && numerals.zero.body || "").replace(/\*\*/g, ""), numerals.zero && numerals.zero.tadabbur, numerals.tadabbur, ...(numerals.timeline || []).map(t => t.d)]) },
  // نصوص القصص المصوّرة (صفحاتها) والقصص والعِبَر — لتسجيلها بصوت قارئٍ بشريّ.
  { key: "stories", label: "القصص المصوّرة", items: uniq([].concat(...(stories.stories || []).map(s => [s.title, s.lesson, ...(s.pages || []).map(p => p.text)]))) },
  { key: "tales", label: "قصص وعِبَر", items: uniq([].concat(...(sararim.stories || []).map(s => [s.title, s.text]))) },
  { key: "quiz_q", neuralOnly: true, label: "أسئلة الاختبارات وخياراتها", items: uniq((quiz.questions || []).flatMap(q => [q.q, ...(q.options || [])]).filter(isSentence)) },
  { key: "puzzles", neuralOnly: true, label: "الألغاز (نصٌّ وتلميحٌ وحلّ)", items: uniq((puzzles.puzzles || []).flatMap(p => [p.riddle, p.hint, p.solution]).filter(isSentence)) },
  { key: "tales_q", neuralOnly: true, label: "أسئلة فهم القصص وخياراتها", items: uniq((sararim.stories || []).flatMap(s => (s.questions || []).flatMap(q => [q.q, ...(q.options || [])])).filter(isSentence)) },
  // الترجماتُ العربيّةُ المقابلةُ لردود أفعال قسم اللغات — لينطقَها النموذجُ العصبيّ (kareem) في الاختبارات والألعاب.
  { key: "lang_ar", label: "ردود اللغات (عربيّ)", items: uniq([langEn, langFr].flatMap(L => [...(L.reactions || []), ...(L.encourage || [])].map(r => r.ar))) },
];

// كل النصوص المنطوقة القصيرة (حروف+أشكال+أسماء+كلمات+جمل+عبارات) — للمولّد.
export function allSpeakable() {
  const syl = [].concat(...(reading.words || []).map(w => w.syl || [])); // مقاطع كلمات القراءة
  return uniq([].concat(
    allForms(),
    ...WORD_UNITS.map(u => u.items),
    ...SENTENCE_UNITS.filter(u => !u.neuralOnly).map(u => u.items),  // neuralOnly: لها مقاطعُ Piper، فلا احتياطَ espeak (توفيرُ ~37 م.ب)
    syl,
  ));
}
