// src/speak.js — النطق العربي المشترك (Text-to-Speech). محلّيّ بالكامل، بلا شبكة.
// يحلّ محلّ دالّة speak() المضمَّنة التي كانت محصورة في read.html، ويُعمَّم على كل الصفحات.
//
// مهمّ: الأصوات تُحمَّل بشكلٍ غير متزامن (خاصّةً على Chrome/لينُكس عبر speech-dispatcher).
// لذلك نؤجّل أوّل نطقٍ حتى تجهز الأصوات، ونختار الصوت العربيّ صراحةً (وإلّا قد لا يصدر شيء).
import { isVoiceOn, getVolume } from "./sound-prefs.js";
import { playClip, playClipAsync } from "./tts-clips.js";
import { primeVoices } from "./voices.js";

// تهيئة التسجيلات البشرية في الذاكرة عند الإقلاع (لنموذج «human»).
try { primeVoices(); } catch (e) {}

const HAS = ("speechSynthesis" in window);
let arVoice = null, voicesReady = false;
let queued = null; // أوّل طلبِ نطقٍ يصل قبل جهوز الأصوات

function scoreVoice(v) {
  const lang = (v.lang || "").toLowerCase(), name = (v.name || "").toLowerCase();
  if (lang.startsWith("ar")) return 3;          // أيّ لهجةٍ عربية (ar, ar-SA, ar-EG…)
  if (/arab/.test(name)) return 2;              // اسمٌ يحوي «arabic»
  return 0;
}
function pickVoice() {
  if (!HAS) return null;
  const vs = speechSynthesis.getVoices() || [];
  if (!vs.length) return null;                  // لم تُحمَّل بعد
  let best = null, bs = 0;
  for (const v of vs) { const s = scoreVoice(v); if (s > bs) { bs = s; best = v; } }
  arVoice = bs > 0 ? best : null;
  voicesReady = true;
  return arVoice;
}
function onVoices() { pickVoice(); if (queued) { const q = queued; queued = null; doSpeak(q.text, q.opts); } }

if (HAS) { pickVoice(); speechSynthesis.onvoiceschanged = onVoices; }

function doSpeak(text, opts) {
  try {
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = opts.lang || (arVoice && arVoice.lang) || "ar";
    u.rate = opts.rate != null ? opts.rate : 0.8;   // أبطأ قليلًا ليناسب الصغار
    u.pitch = opts.pitch != null ? opts.pitch : 1;
    u.volume = getVolume();   // مستوى الصوت العامّ للتطبيق
    if (arVoice) u.voice = arVoice;                 // تعيينٌ صريحٌ ضروريّ (لا نتركه للافتراضيّ)
    if (opts.onend) { u.onend = () => fire(opts); u.onerror = () => fire(opts); } // إشعارٌ بانتهاء النطق
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    speechSynthesis.resume();                        // درءُ علّة توقّف Chrome بعد cancel
    speechSynthesis.speak(u);
  } catch (e) { fire(opts); }
}
// يُطلِق onend مرّةً واحدة (يُستعمَل لتأخير الانتقال حتى تنتهي ردّة فعل الآلي).
function fire(opts) { if (opts && opts.onend) { const f = opts.onend; opts.onend = null; try { f(); } catch (e) {} } }

export function speak(text, opts = {}) {
  if (!text || !isVoiceOn()) { fire(opts); return; } // صامتٌ؟ نُطلق onend فوراً ليتابع المُتّصِل
  // (1) مقطعٌ مُولَّدٌ مسبقاً؟ مضمونٌ على كل جهاز دون إنترنت — يُقدَّم على نطق النظام.
  if (opts.onend) {
    playClipAsync(text).then(ok => { if (ok) fire(opts); else ttsPath(text, opts); });
    return;
  }
  if (playClip(text)) return;
  ttsPath(text, opts);
}
function ttsPath(text, opts) {
  // نطق النظام (Web Speech) للنصوص الطويلة/الديناميكية بلا مقطع.
  if (!HAS) { fire(opts); return; }
  if (!voicesReady) {
    pickVoice();
    if (!voicesReady) {
      queued = { text, opts }; // أجّلْ حتى onvoiceschanged
      // أمانٌ: على جهازٍ بلا أصواتٍ (لا يُطلَق onvoiceschanged) لا نُعلّق الانتقالَ التلقائيّ —
      // إن لم تجهز الأصواتُ سريعًا أطلِقْ onend ليتابعَ التدفّق (لا صوتَ، لكن لا تعليق).
      if (opts.onend) setTimeout(() => { if (queued && queued.opts === opts) { queued = null; fire(opts); } }, 1500);
      return;
    }
  }
  doSpeak(text, opts);
}
export function stopSpeaking() { try { if (HAS) speechSynthesis.cancel(); } catch (e) {} }
export function canSpeak() { return HAS; }
