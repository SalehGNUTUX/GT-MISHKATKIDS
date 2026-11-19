// src/arabic-normalize.js — توحيدُ ترتيب التشكيل العربيّ. محلّيٌّ بالكامل، بلا DOM (يُقرأ في Node والمتصفّح).
//
// الجذر: محرّكا النطق (espeak والعصبيّ Piper الذي يعتمد espeak للتفنيم) يتوقّعان ترتيب
// «حرف + شدّة + حركة» (الشدّة قبل الحركة). كثيرٌ من نصوصنا (وما يُنتجه NFC) يأتي «حرف + حركة + شدّة»،
// فيضيع نطقُ الشدّة ويُسمَع كالسكون (مثل «أوّل» تُنطَق «أَوْل»). كما أنّ لفظ الجلالة المشكَّل يُشوَّه،
// بينما صورتُه المجرّدة «الله» يَنطقها espeak صحيحةً (ʔallaːh).
//
// لذا: نُعيد ترتيب العلامات إلى «شدّة ثمّ حركة»، ونُجرّد لفظ الجلالة عند التركيب (للنطق فقط — المفتاح يبقى الأصل).

const SHADDA = "ّ";

// يعيد ترتيب كلّ تتابعٍ «حركة/تنوين ثمّ شدّة» إلى «شدّة ثمّ حركة/تنوين». NFC أوّلاً للتوحيد.
export function reorderMarks(text) {
  return String(text == null ? "" : text).normalize("NFC").replace(/([ً-ِ])(ّ)/g, SHADDA + "$1");
}

// لفظ الجلالة: espeak يكسرُ نطقَه حين تلحقه حركةُ إعراب (اللهِ→«lhi»). الحلُّ إملاءٌ صوتيٌّ بمدٍّ صريحٍ
// «اَلّاه» (يُعطي ʔallaːh)، مع الحفاظ على حركة الإعراب الأخيرة. نعالجُ كلَّ كلمةٍ على حدة بمطابقة هيكلها المجرّد.
const JALALAH = { "الله": "اَلّاه", "لله": "لِلّاه", "بالله": "بِلّاه", "تالله": "تَلّاه", "والله": "وَلّاه", "كالله": "كَلّاه" };
const deMark = w => w.replace(/[ً-ْٰـ]/g, ""); // نزعُ التشكيل والتطويل ⇐ الهيكلُ المجرّد
export function jalalahBare(text) {
  return String(text == null ? "" : text).replace(/[ء-ي][ء-يً-ْٰـ]*/g, w => {
    const sk = deMark(w);
    if (sk === "اللهم") return "اَلّاهُمّ";
    const tpl = JALALAH[sk];
    if (!tpl) return w;
    const end = (w.match(/[ً-ْ]$/) || [""])[0]; // حركةُ الإعراب الأخيرة (إن وُجدت)
    return tpl + end;
  });
}

// تاءُ التأنيث وقفًا تُنطَق هاءً (خَمْسَة→«خَمْسَه»=khamsah لا «خَمْسَت»). **بأمان:** تُطبَّق فقط على كلمةٍ
// مفردةٍ ينتهي حرفُها الأخيرُ بحركةٍ صريحةٍ قبل التاء (وإلّا تضرّ ناقصةَ التشكيل مثل «خَمسة»→khamsh).
function pausalTa(s) {
  s = String(s);
  if (/\s/.test(s.trim())) return s;                 // الجُملُ لا تُمَسّ (العصبيُّ يُتقنها)
  return s.replace(/([ء-ي]ّ?[َُِ])ة([ً-ْ]*)$/, "$1ه$2"); // ة بعد حرفٍ مشكولٍ (وإن شُدِّد) فقط ⇐ ه
}

// النصّ المُعَدُّ للتركيب الصوتيّ (espeak/Piper): ترتيبُ الشدّة + لفظ الجلالة + تاءُ التأنيث الوقفيّة (بأمان).
export function forSynthesis(text) {
  return pausalTa(jalalahBare(reorderMarks(text)));
}

// ── v1.10: همزةُ الوصلِ في «ال» (لنصِّ التركيبِ العصبيّ فقط) ────────────────────────────────
// تدقيقٌ بفونيماتِ Piper نفسِه (PiperVoice.phonemize) كشفَ أنّ مُفنِّمَ espeak يَنطقُ ألفَ «ال» حيثُ يجبُ أن تسقط:
//   «فِي الْبَيْتِ» ← fiː albait (والصحيحُ fi-lbait) · «بِالْقَلَمِ» ← biaːlqalam (bilqalam)
//   «رَأَى النَّاسَ» ← raʔaː ʔannnaːs (همزةٌ وسطَ الكلام + حرفٌ مثلَّث) · «الرَّحْمَةُ» أوّلَ الجملة ← ʔarrraħma.
// القواعدُ (كلٌّ منها تُحقِّقَ فونيميًّا قبلَ اعتماده):
//   1) «بِالـ»: قمريّةٌ ← «بِلْـ» · شمسيّةٌ مشدَّدة ← «بِـ» + الحرف (biʃʃams).
//   2) «الـ» + شمسيّةٌ مشدَّدةٌ بعدَ كلمةٍ تنتهي بحركةٍ أو حرفِ مدّ: تسقطُ «ال» ← الحرفُ الشمسيُّ مباشرةً.
//   3) «الـ» + شمسيّةٌ مشدَّدةٌ أوّلَ الجملة/بعدَ وقف: «أَ» + الحرف (ʔarraħma بدلَ ʔarrraħma).
// رُفِضَ بعدَ التدقيق (أسوأُ من الأصل): إسقاطُ «ال» القمريّة (espeak يُقحِمُ حركةً: «عَبَرَ لْقَائِدُ» ← liqaːʔid
// فيُسمَعُ «لِقائد») · وإسقاطُ «ال» عن كلمةٍ تنتهي بـ«ة» (يُنوِّنُها: ʔazzahratun). لا يُمَسُّ لفظُ الجلالة.
const SUN_LETTERS = new Set("تثدذرزسشصضطظلن");
const MARKS_RE = /[ً-ْٰ]/;
const PAUSE_RE = /[.!؟?:،,؛;«»"…()\-–—]/;
function splitToken(tok) {            // [علاماتٌ قبلَ الكلمة، الكلمة، علاماتٌ بعدَها]
  const m = /^([^ء-يٱ]*)(.*?)([^ء-ْٰٱ]*)$/u.exec(tok);
  return m ? [m[1], m[2], m[3]] : ["", tok, ""];
}
function endsWithVowel(word) {
  const w = word.replace(/[ـ]/g, "");
  let i = w.length - 1, marks = "";
  while (i >= 0 && MARKS_RE.test(w[i])) { marks = w[i] + marks; i--; }
  if (/[ًْ-ٍ]/.test(marks)) return false;          // سكونٌ أو تنوين
  if (/[َ-ِ]/.test(marks)) return true;                 // فتحةٌ/ضمّةٌ/كسرة
  const L = w[i]; if (L === "ا" || L === "ى") return true;
  const prevMark = w[i - 1] || "";
  return (L === "و" && prevMark === "ُ") || (L === "ي" && prevMark === "ِ");
}
// «ال» في أوّلِ الكلمة: [المتبقّي بعدَ «ال»، أهيَ شمسيّةٌ مشدَّدة؟] أو null
function article(word) {
  const m = /^[اٱ]َ?لْ?(.+)$/u.exec(word); if (!m) return null;
  const rest = m[1]; let j = 1, marks = "";
  while (j < rest.length && MARKS_RE.test(rest[j])) { marks += rest[j]; j++; }
  return { rest, sun: SUN_LETTERS.has(rest[0]) && marks.includes("ّ") };
}
export function waslFix(text) {
  const parts = String(text).split(/(\s+)/);
  let prevVowel = false, atStart = true;
  for (let k = 0; k < parts.length; k++) {
    const tok = parts[k]; if (!tok || /^\s+$/.test(tok)) continue;
    const [pre, word, post] = splitToken(tok);
    let w = word;
    if (word && !/لله|اللّه|اللَّه/.test(word)) {
      if (PAUSE_RE.test(pre)) atStart = true;
      const bi = /^بِ[اٱ]لْ?(.+)$/u.exec(word);
      if (bi) {                                                        // (1) بِالـ
        const a = article("ال" + bi[1]);
        w = a && a.sun ? "بِ" + bi[1] : "بِلْ" + bi[1];
      } else {
        const a = article(word);
        // الشمسيّةُ وحدَها، وبشرطِ ألّا تنتهيَ الكلمةُ بتاءٍ مربوطة: espeak يُنوِّنُ «ةُ» إن غابت «ال» (ʔazzahratun)
        if (a && a.sun && !/ة[ً-ْ]*$/.test(word)) {
          if (!atStart && prevVowel) w = a.rest;                     // (2) وصلٌ بعدَ حركة: raʔaːn naːs
          else if (atStart) w = "أَ" + a.rest;                        // (3) أوّلَ الجملة: ʔarraħma
        }
      }
    }
    parts[k] = pre + w + post;
    prevVowel = !!word && !PAUSE_RE.test(post) && endsWithVowel(word);
    atStart = PAUSE_RE.test(post) || !word;
  }
  return parts.join("");
}
