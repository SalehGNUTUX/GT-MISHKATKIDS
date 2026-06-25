// حارسُ التطوير: في وضع `npm run dev` فقط، ألغِ أيَّ Service Worker قديمٍ وامسحِ الكاش — كيلا يُقدَّم
// كودٌ/مقاطعُ قديمةٌ مُخبّأةٌ من بناءٍ سابق (سببُ «يظهر العصبيّ ويشتغل الآليّ» وعدمِ ظهور المستجدّات).
// في الإنتاج (PWA المبنيّ) لا يعمل هذا، فيبقى عملُه دون إنترنت كما هو.
try {
  if (import.meta && import.meta.env && import.meta.env.DEV && typeof navigator !== "undefined" && navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
    if (typeof caches !== "undefined") caches.keys().then(ks => ks.forEach(k => caches.delete(k))).catch(() => {});
  }
} catch (e) {}

// src/sound-prefs.js — تفضيلات الصوت، مفصولةٌ إلى طبقتين مستقلّتين، مصدرٌ موحَّد لكل الصفحات.
// (1) النغمات: النبضة الآليّة + مؤثّرات النجاح/الخطأ (WebAudio).
// (2) النطق: كلمات الآليّ الحقيقية (TTS).
// المستخدم يتحكّم بكلٍّ على حدة من الإعدادات. مفاتيح مستقلّة تبقى بمعزلٍ عن تقدّم الجلسة.
const T_KEY = "tilmithi_tones_v1";   // النغمات
const V_KEY = "tilmithi_voice_v1";   // النطق

export function isTonesOn() { try { return localStorage.getItem(T_KEY) !== "off"; } catch (e) { return true; } }
export function setTonesOn(on) { try { localStorage.setItem(T_KEY, on ? "on" : "off"); } catch (e) {} }
export function isVoiceOn() { try { return localStorage.getItem(V_KEY) !== "off"; } catch (e) { return true; } }
export function setVoiceOn(on) { try { localStorage.setItem(V_KEY, on ? "on" : "off"); } catch (e) {} }

// مِفتاحٌ رئيسيّ سريع (للشريط العلويّ): هل أيُّ صوتٍ مُفعَّل؟ وكتمُ/تشغيلُ الطبقتين معًا.
export function isSoundOn() { return isTonesOn() || isVoiceOn(); }
export function toggleSound() { const next = !isSoundOn(); setTonesOn(next); setVoiceOn(next); return next; }

// مجموعةُ الصوت المختارة لكلّ نوعٍ على حدة (حرف/كلمات/جمل). القيمةُ مُعرّفُ مجموعة:
//   "clips" = مقاطع espeak المُولَّدة مسبقاً (الافتراض، مضمونٌ على كل جهاز).
//   أو مُعرّفُ مجموعةٍ بشريّة: مُدمجةٌ مع البرنامج، أو سجّلها المستخدم على جهازه (بالاسم المختار).
export const VOICE_TYPES = ["letter", "word", "sentence", "reaction"];
export const CLIPS = "clips";
export const AUTO = "auto"; // «أفضل المتاح»: بشريّ (صالح/جهازك) ← عصبيّ ← آليّ، لكلّ نصٍّ على حدة
const SET_KEY = t => "tilmithi_vset_" + t;
// الافتراضُ لكلِّ الأنواع = «أفضل المتاح» (AUTO): يُقدَّم الصوتُ البشريُّ حيثما سُجِّل (أنضجُ وأسلم)،
// ثمّ العصبيُّ (ممتازٌ للجمل/النصوص/الردود)، ثمّ الآليّ (espeak، تغطيةٌ كاملةٌ مضمونة). فيتّسع البشريُّ تلقائيّاً
// كلّما غطّى الوالدُ المزيد، دون تغييرِ إعداد. (يُمكنُ فرضُ مصدرٍ بعينه لكلّ نوعٍ في اللوحة.)
const VOICE_DEFAULTS = { letter: AUTO, word: AUTO, sentence: AUTO, reaction: AUTO };
export function getVoiceSet(type) { try { return localStorage.getItem(SET_KEY(type)) || VOICE_DEFAULTS[type] || AUTO; } catch (e) { return VOICE_DEFAULTS[type] || AUTO; } }
export function setVoiceSet(type, id) { try { if (VOICE_TYPES.includes(type)) localStorage.setItem(SET_KEY(type), id || CLIPS); } catch (e) {} }

// الانتقال التلقائيّ في الاختبارات: حين يُفعَّل يمرّ للسؤال التالي تلقائياً بعد ردّة فعل الآلي،
// وإلّا يظهر زرّ «التالي ▶» يدويّ. الافتراض: يدويّ (off) كي لا يُفاجَأ الطفل بانتقالٍ سريع.
const AUTO_KEY = "tilmithi_autonext_v1";
export function isAutoNext() { try { return localStorage.getItem(AUTO_KEY) === "on"; } catch (e) { return false; } }
export function setAutoNext(on) { try { localStorage.setItem(AUTO_KEY, on ? "on" : "off"); } catch (e) {} }

// قارئُ القصص والنصوص: مجموعةُ الصوت التي تقرأ صفحاتِ القصص (يصلح لها النموذجُ العصبيّ Piper)،
// وتوگل تفعيل زرّ «اقرأ القصّة». مستقلٌّ عن أنواع (حرف/كلمة/جملة) ليُغيَّر القارئُ للقصص وحدها.
const STORY_SET_KEY = "tilmithi_story_voice", STORY_ON_KEY = "tilmithi_story_read";
// القيمةُ الافتراضيّة (العصبيّ إن وُجِد) تُضبَط مرّةً من story-reader.js كي لا يستوردَ هذا الملفُّ JSON.
export function getStoryVoice() { try { return localStorage.getItem(STORY_SET_KEY) || AUTO; } catch (e) { return AUTO; } }
export function setStoryVoice(id) { try { localStorage.setItem(STORY_SET_KEY, id || CLIPS); } catch (e) {} }
// ظاهرةٌ افتراضيّاً (القراءةُ الصوتيّةُ أداةٌ جوهريّة): تُحجَب فقط إن أطفأها الأهلُ صراحةً (= "off").
export function isStoryReadOn() { try { return localStorage.getItem(STORY_ON_KEY) !== "off"; } catch (e) { return true; } }
export function setStoryReadOn(on) { try { localStorage.setItem(STORY_ON_KEY, on ? "on" : "off"); } catch (e) {} }

// إظهارُ التشكيل في عرض النصوص (القصص). الافتراض: مع الشكل (true). إخفاؤه للعرض فقط لا يؤثّر في القراءة.
const TASHKEEL_KEY = "tilmithi_show_tashkeel";
export function showTashkeel() { try { return localStorage.getItem(TASHKEEL_KEY) !== "off"; } catch (e) { return true; } }
export function setShowTashkeel(on) { try { localStorage.setItem(TASHKEEL_KEY, on ? "on" : "off"); } catch (e) {} }
// إزالةُ علاماتِ التشكيل من نصٍّ للعرض (لا يُغيّر النصَّ المُستعمَل في القراءة).
export function stripTashkeel(s) { return String(s || "").replace(/[ً-ْٰـ]/g, ""); }
