// src/sfx.js — مؤثّرات صوتية صغيرة عبر Web Audio (بلا ملفات صوتية، آمنة للخصوصية وخفيفة).
// نغماتٌ لطيفة مناسبة للأطفال. تحترم مفتاح الصوت العامّ.
import { isTonesOn, getVolume } from "./sound-prefs.js";

let ctx = null;
function ac() {
  try {
    if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
    if (ctx.state === "suspended") ctx.resume();   // المتصفّحات تتطلّب تفاعلًا أوّلًا
    return ctx;
  } catch (e) { return null; }
}

// اهتزازٌ لطيفٌ على الهاتفِ يرافقُ المؤثّر (تغذيةٌ راجعةٌ حسّيّةٌ للصغار). يحترمُ نفسَ توگلِ النبضات،
// ولا أثرَ له على سطحِ المكتب (navigator.vibrate لا وجودَ له أو يُرجِعُ false). أنماطٌ قصيرةٌ غيرُ مزعجة.
function haptic(pattern) {
  try { if (isTonesOn() && navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
}
// notes: [{ f: تردّد Hz, t: بداية ث, d: مدّة ث, g: ذروة الكسب, type: شكل الموجة }]
function play(notes) {
  if (!isTonesOn()) return;
  const c = ac(); if (!c) return;
  const vol = getVolume(); if (vol <= 0) return;   // مستوى الصوت العامّ (0 = كتم)
  const now = c.currentTime;
  for (const n of notes) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = n.type || "sine";
    o.frequency.value = n.f;
    const start = now + (n.t || 0), peak = (n.g != null ? n.g : 0.18) * vol, end = start + (n.d || 0.18);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    o.connect(g); g.connect(c.destination);
    o.start(start); o.stop(end + 0.03);
  }
}

// تتابع صاعد ودود — نجاحٌ صغير (اهتزازٌ خفيفٌ مبهج).
export function success() { play([{ f: 523.25, t: 0, d: .14 }, { f: 659.25, t: .10, d: .14 }, { f: 783.99, t: .20, d: .20 }]); haptic([18, 40, 30]); }
// نفير أكبر — شفاء الآليّ / إنجاز مميّز (اهتزازٌ احتفاليّ).
export function heal() { play([{ f: 523.25, t: 0, d: .15 }, { f: 659.25, t: .12, d: .15 }, { f: 783.99, t: .24, d: .15 }, { f: 1046.5, t: .36, d: .30, g: .2 }]); haptic([20, 40, 20, 40, 45]); }
// نغمة منخفضة ناعمة «حاوِل ثانيةً» — غير قاسية أبدًا على الطفل (نبضةٌ واحدةٌ لطيفة).
export function nope() { play([{ f: 311.13, t: 0, d: .18, type: "triangle" }, { f: 261.63, t: .14, d: .22, type: "triangle" }]); haptic(45); }
// نقرة تأكيد خفيفة (نبضةٌ صغيرةٌ جدًّا).
export function tap() { play([{ f: 587.33, t: 0, d: .08, g: .12 }]); haptic(12); }
