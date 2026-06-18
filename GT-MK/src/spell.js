// src/spell.js — وضع التهجئة/التركيب. محلّيّ بالكامل.
// يحلّل كلمةً عربيّةً مشكّلةً إلى مقاطعها (حرف + حركته/مدّه/تنوينه/سكونه)، ثم يشغّلها
// بالتتابع ثمّ الكلمة كاملةً — لتعليم فكّ القراءة. يعمل بمقاطع espeak الحالية، ويتحسّن
// تلقائيًّا حين تُوضَع تسجيلاتٌ بشرية (عبر طبقة التجاوز في tts-clips).
import { playClipAsync } from "./tts-clips.js";
import { speak } from "./speak.js";
import { isVoiceOn } from "./sound-prefs.js";
import { reorderMarks } from "./arabic-normalize.js";

const MARKS = new Set(["َ","ُ","ِ","ً","ٌ","ٍ","ّ","ْ","ٰ"]); // الحركات والتشكيل
const MADD_LETTERS = new Set(["ا","و","ي","ى"]);
const FATHA="َ", DAMMA="ُ", KASRA="ِ", FATHATAN="ً";

const delay = ms => new Promise(r => setTimeout(r, ms));
let token = 0; // لإلغاء تسلسلٍ سابق عند بدء جديد

// يقسم النصّ المشكّل إلى مقاطع (سلاسل تطابق مفاتيح المقاطع). الفراغ يُمرَّر كفاصل " ".
export function segment(text) {
  const chars = [...String(text || "").trim()];
  const toks = [];
  for (const ch of chars) {
    if (MARKS.has(ch)) { if (toks.length && toks[toks.length - 1].c !== " ") toks[toks.length - 1].m.push(ch); }
    else toks.push({ c: ch, m: [] });
  }
  const units = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.c === " ") { units.push(" "); continue; }
    let str = t.c + t.m.join("");
    const nx = toks[i + 1];
    // دمج حرف المدّ المجرّد التالي مع حركته المناسبة (قَ+ا=قَا، قُ+و، قِ+ي، تنوين فتح بًا)
    if (nx && nx.m.length === 0 && MADD_LETTERS.has(nx.c) && t.m.length) {
      const last = t.m[t.m.length - 1];
      if ((last === FATHA && nx.c === "ا") || (last === DAMMA && nx.c === "و") ||
          (last === KASRA && nx.c === "ي") || (last === FATHATAN && nx.c === "ا")) {
        str += nx.c; i++;
      }
    }
    units.push(reorderMarks(str)); // ترتيبٌ موحّدٌ للشدّة ليطابق مفاتيحَ المقاطع (الاستوديو/المولَّدة)
  }
  return units;
}

export function cancelSpell() { token++; }

// يشغّل المقاطع بالتتابع ثمّ الكلمة كاملةً.
// opts: { units?: string[] (تقطيعٌ جاهز)، gap=160، thenWhole=true، onUnit?(unit,index) }
export async function playSpelled(text, opts = {}) {
  if (!isVoiceOn()) return;
  cancelSpell();
  const my = token;
  const gap = opts.gap != null ? opts.gap : 160;
  const units = (opts.units || segment(text)).filter(u => u && u !== " ");
  for (let i = 0; i < units.length; i++) {
    if (my !== token) return;            // أُلغِيَ بتسلسلٍ جديد
    if (opts.onUnit) try { opts.onUnit(units[i], i); } catch (e) {}
    const ok = await playClipAsync(units[i]);
    if (!ok) { speak(units[i]); await delay(500); } // احتياط Web Speech للوحدة بلا مقطع
    await delay(gap);
  }
  if (my !== token) return;
  if (opts.thenWhole !== false) { await delay(220); speak(text); } // ثمّ الكلمة كاملةً
}
