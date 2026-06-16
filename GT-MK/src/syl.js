// src/syl.js — مصدرٌ موحّد لأشكال كل حرف (الاسم/حركات/مدود/تنوين/شدّة/سكون). محلّيّ.
// يستعمله سُلّم القراءة (read.html) واستوديو التسجيل (record.html) ومولّد الصوت (gen-audio).
import reading from "../content/reading.js";
import letters from "../content/letters.js";

export const FATHA = "َ", DAMMA = "ُ", KASRA = "ِ", FATHATAN = "ً", DAMMATAN = "ٌ", KASRATAN = "ٍ", SHADDA = "ّ", SUKUN = "ْ";
export const LETTERS = reading.consonants || [];

const NAME = {};
(letters.letters || []).forEach(L => { if (L.char && L.name) NAME[L.char] = L.name; });
export function letterName(c) { return NAME[c] || c; }

// صفوفُ أشكال الحرف. الألفُ حالةٌ خاصّة (لا شدّة لها؛ مدُّها آ/أى/أُو/إِي).
export function sylRows(c) {
  if (c === "ا") return [
    { t: "اسم الحرف", a: [{ s: letterName(c), n: "الاسم المجرّد" }] },
    { t: "الهمزة بالحركات", a: [{ s: "أَ", n: "فتحة" }, { s: "أُ", n: "ضمّة" }, { s: "إِ", n: "كسرة" }] },
    { t: "المدّ", a: [{ s: "آ", n: "بالفتحة — أوّلَ الكلمة" }, { s: "أى", n: "بالفتحة — آخرَ الكلمة (ألف مقصورة)" }, { s: "أُو", n: "مدّ بالواو" }, { s: "إِي", n: "مدّ بالياء" }] },
    { t: "التنوين", a: [{ s: "أً", n: "تنوين فتح" }, { s: "أٌ", n: "تنوين ضمّ" }, { s: "إٍ", n: "تنوين كسر" }] },
    { t: "السكون", a: [{ s: "أْ", n: "سكون" }] },
  ];
  return [
    { t: "اسم الحرف", a: [{ s: letterName(c), n: "الاسم المجرّد" }] },
    { t: "الحركات", a: [{ s: c + FATHA, n: "فتحة" }, { s: c + DAMMA, n: "ضمّة" }, { s: c + KASRA, n: "كسرة" }] },
    { t: "المدود", a: [{ s: c + FATHA + "ا", n: "مدّ بالألف" }, { s: c + DAMMA + "و", n: "مدّ بالواو" }, { s: c + KASRA + "ي", n: "مدّ بالياء" }] },
    { t: "التنوين", a: [{ s: c + FATHATAN + "ا", n: "تنوين فتح" }, { s: c + DAMMATAN, n: "تنوين ضمّ" }, { s: c + KASRATAN, n: "تنوين كسر" }] },
    { t: "الشدّة", a: [
      { s: c + SHADDA + FATHA, n: "شدّة بفتحة" }, { s: c + SHADDA + DAMMA, n: "شدّة بضمّة" }, { s: c + SHADDA + KASRA, n: "شدّة بكسرة" },
      { s: c + SHADDA + FATHATAN + "ا", n: "شدّة بتنوين فتح" }, { s: c + SHADDA + DAMMATAN, n: "شدّة بتنوين ضمّ" }, { s: c + SHADDA + KASRATAN, n: "شدّة بتنوين كسر" },
    ] },
    { t: "السكون", a: [{ s: c + SUKUN, n: "سكون" }] },
  ];
}

export function formsOf(c) { return sylRows(c).flatMap(r => r.a.map(it => it.s)); }
export function allForms() { return LETTERS.flatMap(formsOf); }
