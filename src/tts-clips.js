// src/tts-clips.js — مشغّل مقاطع النطق المُولَّدة مسبقاً (espeak). محلّيّ بالكامل.
// النطق مضمونٌ بنفس الجودة على كل الأجهزة دون إنترنت ودون اعتمادٍ على أصوات نظام الجهاز.
// المانيفست يربط النصّ بالملفّ؛ ما لا مقطعَ له (نصوصٌ طويلة) يرجع إلى Web Speech في speak.js.
// طبقة تجاوز: إن وُضِع تسجيلٌ بشريّ في public/tts/custom/<الملفّ> (مُسجَّلٌ في tts-custom.json)
// شُغِّل بدل مقطع espeak — لإصلاح ما يعجز عنه المحرّك (كالسكون على الحروف الشديدة ب ج د ض، والهمزة).
import manifest from "./tts-manifest.json";
import custom from "./tts-custom.json";
import { getVoiceSet, CLIPS, getStoryVoice } from "./sound-prefs.js";
import { deviceURL } from "./voices.js";
import { allForms } from "./syl.js";
import letters from "../content/letters.js";
import bundled from "./voices-bundled.json";

const customSet = new Set(custom || []);
const bundledFiles = bundled.files || {};
const SEP = " ";
const cache = {};
let current = null;

// تصنيف النصّ: حرف (شكلٌ مفرد) / كلمة / جملة — لاختيار مجموعة الصوت المناسبة لنوعه.
const LETTER_SET = new Set([
  ...allForms(),
  ...(letters.letters || []).map(l => l.name).filter(Boolean),
  ...(letters.numbers || []).map(n => n.name).filter(Boolean),
]);
function classify(text) {
  const t = String(text).trim();
  if (LETTER_SET.has(t)) return "letter";
  return /\s/.test(t) ? "sentence" : "word";
}

export function clipFor(text) { return manifest[String(text).trim()] || null; }

// مصدرُ صوتِ النصّ بحسب المجموعة المختارة لنوعه:
//   clips → مقطع espeak. مجموعةٌ مُدمجة → ملفّ ثابت. مجموعةٌ على الجهاز → تسجيلٌ بشريّ.
//   وإن غاب الصوتُ من المجموعة المختارة → يرجع إلى مقطع espeak.
function srcFor(text) {
  const t = String(text).trim();
  const setId = getVoiceSet(classify(t));
  if (setId && setId !== CLIPS) {
    const du = deviceURL(setId, t); if (du) return du;               // على الجهاز (يُقدَّم ليُمكِنَ تحديث المُدمج)
    const bf = bundledFiles[setId + SEP + t]; if (bf) return bf;     // مُدمجة
  }
  const file = clipFor(t);
  if (!file) return null;
  return (customSet.has(file) ? "tts/custom/" : "tts/") + file;
}
// مصدرُ صوتِ النصّ من مجموعةٍ بعينها (لقارئ القصص: نختار المجموعةَ صراحةً لا بالتصنيف).
function srcForSet(text, setId) {
  const t = String(text).trim();
  if (setId && setId !== CLIPS) {
    const du = deviceURL(setId, t); if (du) return du;
    const bf = bundledFiles[setId + SEP + t]; if (bf) return bf;
  }
  const file = clipFor(t);
  return file ? (customSet.has(file) ? "tts/custom/" : "tts/") + file : null;
}
function audioFor(url) { return cache[url] || (cache[url] = new Audio(url)); }

export function playClip(text) {
  const url = srcFor(text);
  if (!url) return false;
  try {
    if (current) { try { current.pause(); } catch (e) {} }
    const a = audioFor(url);
    a.currentTime = 0;
    a.play().catch(() => {});
    current = a;
    return true;
  } catch (e) { return false; }
}

// تشغيلُ نصٍّ بمجموعةٍ مُحدَّدة (قارئ القصص). يرجع true إن وُجد مقطع، وإلّا false (ليُلجأ لـspeak).
export function playClipForSet(text, setId) {
  const url = srcForSet(text, setId);
  if (!url) return false;
  try { if (current) { try { current.pause(); } catch (e) {} } const a = audioFor(url); a.currentTime = 0; a.play().catch(() => {}); current = a; return true; }
  catch (e) { return false; }
}

// قراءةُ نصِّ قصّةٍ بالصوت المناسب: قارئُ القصص المختار إن لم يكن آليّاً، وإلّا صوتُ «الجمل والنصوص»
// المختار (فإن اختار المستخدمُ «عصبيّ» لأيٍّ منهما قُرِئت القصّةُ به)، وإلّا مقطع espeak.
// قارئُ القصص: يَحترمُ اختيارَ المستخدم (عصبيّ/بشريّ/آليّ صراحةً). الافتراضُ العصبيّ يُضبَط مرّةً
// في story-reader عند أوّل تشغيل. إن كانت القيمةُ المحفوظةُ قديمةً غيرَ معروفة → نلجأ للعصبيّ.
function storySet() {
  const v = getStoryVoice ? getStoryVoice() : CLIPS;
  const sets = bundled.sets || [];
  if (v === CLIPS || sets.some(s => s.id === v)) return v;   // اختيارٌ صريحٌ صالح (يشمل «آلي»)
  const tts = sets.find(s => s.kind === "tts"); return tts ? tts.id : CLIPS; // قيمةٌ قديمة → عصبيّ
}
export function playStory(text) { return playClipForSet(text, storySet()); }
// نسخةٌ وعديّة: تُحَلّ عند انتهاء مقطعِ القصّة (true) أو فورًا (false) إن لا مقطع — للقراءة المتتابعة.
export function playStoryAsync(text) {
  return new Promise(resolve => {
    const url = srcForSet(text, storySet());
    if (!url) { resolve(false); return; }
    try { if (current) { try { current.pause(); } catch (e) {} } const a = audioFor(url); a.currentTime = 0; a.onended = () => resolve(true); a.onerror = () => resolve(false); a.play().catch(() => resolve(false)); current = a; }
    catch (e) { resolve(false); }
  });
}
// إيقافُ أيِّ مقطعٍ جارٍ (لزرّ إيقاف القراءة).
export function stopClip() { if (current) { try { current.pause(); current.currentTime = 0; } catch (e) {} } }

// نوعُ الصوت الذي ستُقرأ به القصّةُ لهذا النصّ فعلاً (للعرض/التشخيص): عصبيّ/بشريّ/آليّ.
export function storySourceKind(text) {
  const sid = storySet(), t = String(text).trim();
  if (sid !== CLIPS && (deviceURL(sid, t) || bundledFiles[sid + SEP + t])) {
    const set = (bundled.sets || []).find(s => s.id === sid);
    return (set && set.kind === "tts") ? "🧠 عصبيّ" : "🎙️ بشريّ";
  }
  return "🤖 آليّ";
}

// نسخةٌ وعديّة لوضع التهجئة: تُرجِع Promise يُحَلّ عند انتهاء المقطع (false إن لا صوت).
export function playClipAsync(text) {
  return new Promise(resolve => {
    const url = srcFor(text);
    if (!url) { resolve(false); return; }
    try {
      if (current) { try { current.pause(); } catch (e) {} }
      const a = audioFor(url);
      a.currentTime = 0;
      a.onended = () => resolve(true);
      a.onerror = () => resolve(false);
      a.play().catch(() => resolve(false));
      current = a;
    } catch (e) { resolve(false); }
  });
}
