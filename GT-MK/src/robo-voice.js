// src/robo-voice.js — شخصية صوت روبو المتجاوبة. محلّيّة بالكامل، بلا ملفات.
// طبقتان: (1) نبضة روبوتية مميِّزة عبر WebAudio تعطيه شخصية متجاوبة،
//         (2) نطقٌ عربيّ حقيقيّ للكلمات عبر speak.js ليفهمها الطفل ويتعلّمها.
// الفكرة: نبضةٌ قصيرة (بحسب المزاج) ثم ينطق روبو كلماته — كأنّه يشتغل ثمّ يتكلّم.
import { isTonesOn } from "./sound-prefs.js";
import { speak } from "./speak.js";
import { REACTIONS, QUESTION_STARTERS } from "./robo-phrases.js";

// بنك العبارات يأتي من src/robo-phrases.js (مصدرٌ واحد يُقرأ في المتصفّح وNode).
export { REACTIONS, QUESTION_STARTERS };

// مُعِينٌ يلتقط عبارةً من بنكٍ معيّن (فهرسٌ اختياريّ لتنويعٍ ثابت).
export function roboPhrase(kind, i) {
  const arr = REACTIONS[kind] || [];
  if (!arr.length) return "";
  const n = (i != null) ? i : Math.floor(Math.random() * arr.length);
  return arr[((n % arr.length) + arr.length) % arr.length];
}

/* ---------- النبضة الروبوتية (WebAudio) ---------- */
let ctx = null;
function ac() {
  try {
    if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch (e) { return null; }
}

// ترددٌ أساسيّ بحسب المزاج — يمنح كل حالةٍ لونًا صوتيًّا مختلفًا.
const MOOD_BASE = { talk: 349, ask: 392, happy: 523, wonder: 440, curious: 415, ok: 392 };

// نبضةٌ آليّة قصيرة (2–4 «بيب»). في وضع السؤال نرفع آخر نبضةٍ = نغمةُ استفهامٍ صاعدة.
export function roboBlip(mood = "talk") {
  if (!isTonesOn()) return;
  const c = ac(); if (!c) return;
  const base = MOOD_BASE[mood] || MOOD_BASE.talk;
  const n = mood === "ask" ? 3 : (mood === "happy" || mood === "wonder") ? 4 : 2;
  const now = c.currentTime, step = 0.085;
  for (let i = 0; i < n; i++) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = "square";
    let wobble = (i % 2) ? 1.16 : 0.9;                 // تذبذبٌ يُشبه الكلام الآليّ
    if (mood === "ask" && i === n - 1) wobble = 1.55;  // تنغيمُ استفهامٍ صاعد في آخر نبضة
    if (mood === "happy") wobble *= 1 + i * 0.12;       // تتابعٌ مرحٌ صاعد
    o.frequency.value = base * wobble;
    const t = now + i * step;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + step * 0.8);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + step);
  }
}

/* ---------- نطق روبو: نبضةٌ مميِّزة ثمّ كلماتٌ حقيقية ---------- */
// mood: talk | ask | happy | wonder | curious | ok
export function roboSay(text, opts = {}) {
  const mood = opts.mood || "talk";
  roboBlip(mood);
  // صوتٌ ودودٌ روبوتيّ لطيف: نبرةٌ أعلى قليلًا وإيقاعٌ مُتمهِّل يناسب الصغار.
  speak(text, {
    pitch: opts.pitch != null ? opts.pitch : 1.25,
    rate: opts.rate != null ? opts.rate : 0.85,
    onend: opts.onend,   // إشعارٌ بانتهاء كلام روبو (لتأخير الانتقال للسؤال التالي)
  });
}
