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

// تشغيلُ رابطِ صوتٍ بثبات: ينتظرُ جهوزيّةَ المقطع قبل التشغيل (canplay) فلا يفشلُ أوّلُ تشغيلٍ لمقطعٍ
// لم يُحمَّل بعد (كان يرتدّ خطأً لنموذجٍ آخر). يحترمُ النموذجَ المختار: لا يستبدله، إنّما يَنتظره.
// يُحَلّ true عند انتهاء المقطع، false إن لا رابط/تعذّر التحميل (فيَلجأ المُتّصِلُ للبديل).
function playUrlAsync(url) {
  return new Promise(resolve => {
    if (!url) { resolve(false); return; }
    if (current) { try { current.pause(); } catch (e) {} }
    const a = audioFor(url); a.preload = "auto"; current = a;
    let settled = false;
    const done = v => { if (settled) return; settled = true; a.onended = null; a.onerror = null; resolve(v); };
    a.onended = () => done(true);
    a.onerror = () => done(false);
    const play = () => {
      if (current !== a) { done(false); return; }   // أُلغِيَ هذا التشغيلُ (طلبٌ أحدث) — لا تُشغّل القديم
      try { a.currentTime = 0; } catch (e) {}
      const p = a.play(); if (p && p.catch) p.catch(() => {}); // فشلُ play العابر يُعالَج بانتظار canplay
    };
    if (a.readyState >= 2) play();                 // HAVE_CURRENT_DATA: جاهزٌ الآن (مثل الإعادة المخزَّنة)
    else {
      const onReady = () => { a.removeEventListener("canplay", onReady); play(); };
      a.addEventListener("canplay", onReady);
      try { a.load(); } catch (e) {}               // ابدأ التحميل صراحةً
      setTimeout(() => { if (!settled && a.readyState < 2) { a.removeEventListener("canplay", onReady); done(false); } }, 6000); // أمانٌ ضدّ التعليق
    }
  });
}
// نسخةٌ وعديّة لقراءة القصّة بالنموذج المختار (عصبيّ/بشريّ/آليّ) — تنتظرُ جهوزيّةَ المقطع.
export function playStoryAsync(text) { return playUrlAsync(srcForSet(text, storySet())); }
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

// نسخةٌ وعديّة (وضع التهجئة وقراءة الكلمات/الجمل): تنتظرُ جهوزيّةَ المقطع بنفس المنطق الثابت.
export function playClipAsync(text) { return playUrlAsync(srcFor(text)); }
