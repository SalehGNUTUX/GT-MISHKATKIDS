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
import { numberNames } from "./numbers-ar.js";
import { REACTIONS } from "./robo-phrases.js";
import { PRAISE } from "./islamic.js";

const uniq = a => [...new Set(a.filter(Boolean).map(s => String(s).trim()).filter(Boolean))];

// وحداتُ الكلمات والجمل (تُعرَض في الاستوديو، وتُولَّد لها مقاطع espeak احتياطية).
export const WORD_UNITS = [
  { key: "read", label: "كلمات القراءة", items: uniq((reading.words || []).map(w => w.word)) },
  { key: "play", label: "كلمات الألعاب", items: uniq((words.words || []).map(w => w.word)) },
  { key: "ex",   label: "أمثلة الحروف", items: uniq((letters.letters || []).map(l => l.ex)) },
  { key: "num",  label: "الأرقام", items: uniq((letters.numbers || []).map(n => n.name)) },
  { key: "num100", label: "الأعداد 0–100", items: uniq(numberNames(100)) },
  { key: "shapes", label: "أسماء الأشكال", items: uniq([].concat(math.shapes_basic || [], math.shapes_advanced || []).map(s => s.name)) },
  // مفردات «اقرأ بصوتك» (compose-vocab) — وحدةٌ لكلِّ فئة، تُعرَض في الاستوديو وتُولَّد لها مقاطع احتياطية.
  ...(compose.categories || []).map(c => ({ key: "cmp_" + c.id, label: "اقرأ: " + c.title, items: uniq((c.items || []).map(it => it.t)) })),
];
export const SENTENCE_UNITS = [
  { key: "sread", label: "جمل القراءة", items: uniq((reading.sentences || []).map(s => s.text)) },
  { key: "robo",  label: "عبارات روبو", items: uniq([].concat(...Object.values(REACTIONS || {}), PRAISE || [])) },
  // نصوص قصّة الأرقام (لتسجيلها بصوتٍ بشريّ ولها مقاطع احتياطية).
  { key: "numerals", label: "قصّة الأرقام", items: uniq([numerals.intro, (numerals.zero && numerals.zero.body || "").replace(/\*\*/g, ""), numerals.zero && numerals.zero.tadabbur, numerals.tadabbur, ...(numerals.timeline || []).map(t => t.d)]) },
  // نصوص القصص المصوّرة (صفحاتها) والقصص والعِبَر — لتسجيلها بصوت قارئٍ بشريّ.
  { key: "stories", label: "القصص المصوّرة", items: uniq([].concat(...(stories.stories || []).map(s => [s.title, s.lesson, ...(s.pages || []).map(p => p.text)]))) },
  { key: "tales", label: "قصص وعِبَر", items: uniq([].concat(...(sararim.stories || []).map(s => [s.title, s.text]))) },
];

// كل النصوص المنطوقة القصيرة (حروف+أشكال+أسماء+كلمات+جمل+عبارات) — للمولّد.
export function allSpeakable() {
  const syl = [].concat(...(reading.words || []).map(w => w.syl || [])); // مقاطع كلمات القراءة
  return uniq([].concat(
    allForms(),
    ...WORD_UNITS.map(u => u.items),
    ...SENTENCE_UNITS.map(u => u.items),
    syl,
  ));
}
