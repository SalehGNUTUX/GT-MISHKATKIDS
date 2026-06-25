// src/robo-companion.js — رفيق الآليّ المشترك لصفحات الأنشطة. محلّيّ بالكامل.
// يُحقَن في أيّ صفحةٍ الآليّ مصغّرٌ في الزاوية، يتفاعل مع إنجازات الطفل وأخطائه
// بصوتٍ وحركةٍ ونبرةٍ إسلامية. تجسيدٌ لمبدأ «الطفل يُعلّم الآليّ» في كل أقسام التطبيق.
// الآليّ متحرّكٌ متجاوبٌ (لا يُوصَف بحيّ).
import { roboSay, roboPhrase } from "./robo-voice.js";
import { speak } from "./speak.js";
import * as sfx from "./sfx.js";

let el = null, bubble = null, hideT = null, mounted = false;

const STYLE = `
.robo-comp{position:fixed;inset-inline-end:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:60;width:74px;text-align:center;pointer-events:none;font-family:inherit}
.robo-comp svg{width:64px;height:64px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.18))}
.robo-comp .rc-eye{transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion: no-preference){
  .robo-comp{animation:rc-bob 3.4s ease-in-out infinite}
  .robo-comp .rc-eye{animation:rc-blink 5s ease-in-out infinite}
  .robo-comp.cheer{animation:rc-cheer .9s ease}
  .robo-comp.sad{animation:rc-sad .7s ease}
}
@keyframes rc-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes rc-blink{0%,90%,100%{transform:scaleY(1)}94%{transform:scaleY(.12)}}
@keyframes rc-cheer{0%{transform:translateY(0) rotate(0)}30%{transform:translateY(-16px) rotate(-6deg)}60%{transform:translateY(0) rotate(4deg)}100%{transform:translateY(0)}}
@keyframes rc-sad{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.rc-bubble{position:fixed;inset-inline-end:92px;bottom:calc(30px + env(safe-area-inset-bottom));z-index:60;max-width:min(60vw,240px);background:var(--card,#fff);color:var(--ink,#2B2B2B);
  border:1px solid var(--line,#ECE6DA);border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.12);padding:9px 12px;font-size:14px;line-height:1.5;
  opacity:0;transform:translateY(6px);transition:.25s;pointer-events:none}
.rc-bubble.show{opacity:1;transform:translateY(0)}
`;

const SVG = `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="الآليّ">
  <line x1="40" y1="16" x2="40" y2="8" stroke="#8A93A0" stroke-width="2.4"/>
  <circle cx="40" cy="6" r="3.4" fill="#F4C95D"/>
  <rect x="16" y="16" width="48" height="40" rx="11" fill="#B8C0CC"/>
  <circle class="rc-eye" cx="31" cy="34" r="5.2" fill="#3a4250"/>
  <circle class="rc-eye" cx="49" cy="34" r="5.2" fill="#3a4250"/>
  <rect class="rc-mouth" x="31" y="45" width="18" height="5" rx="2.5" fill="#3a4250"/>
  <circle cx="22" cy="62" r="5" fill="#7BB661"/><circle cx="58" cy="62" r="5" fill="#6FB3D6"/>
</svg>`;

function ensureMounted() {
  if (mounted) return;
  mounted = true;
  const st = document.createElement("style"); st.textContent = STYLE; document.head.appendChild(st);
  el = document.createElement("div"); el.className = "robo-comp"; el.innerHTML = SVG;
  bubble = document.createElement("div"); bubble.className = "rc-bubble";
  document.body.appendChild(bubble); document.body.appendChild(el);
}

function flash(cls) {
  if (!el) return;
  el.classList.remove("cheer", "sad");
  if (cls) { void el.offsetWidth; el.classList.add(cls); } // ملاحظة: classList.add("") يرمي استثناءً
}
function showBubble(text) {
  if (!bubble || !text) return;
  bubble.textContent = text; bubble.classList.add("show");
  clearTimeout(hideT); hideT = setTimeout(() => bubble.classList.remove("show"), 3200);
}

// واجهةٌ عالية المستوى تستعملها صفحات الأنشطة:
export const robo = {
  mount() { ensureMounted(); return this; },
  // نجاحٌ: فرحٌ + هتافٌ مع نبرةٍ إسلامية. opts.then يُستدعى عند انتهاء الكلام (لتأخير الانتقال).
  cheer(text, opts = {}) { ensureMounted(); const t = text || roboPhrase("praise"); flash("cheer"); showBubble(t); sfx.success(); roboSay(t, { mood: "happy", onend: opts.then }); },
  // خطأٌ: تشجيعٌ لطيفٌ لا قسوةَ فيه.
  encourage(text, opts = {}) { ensureMounted(); const t = text || roboPhrase("encourage"); flash("sad"); showBubble(t); sfx.nope(); roboSay(t, { mood: "ok", onend: opts.then }); },
  // عند تجاوز سؤالٍ بعد الخطأ: طمأنةٌ مع وعدٍ بالعودة إليه.
  recall(opts = {}) { ensureMounted(); const t = roboPhrase("recall"); flash("sad"); showBubble(t); sfx.nope(); roboSay(t, { mood: "ok", onend: opts.then }); },
  // تصفيقٌ صامتٌ: فرحٌ + نغمةُ نجاحٍ بلا كلام — حين يكون هناك نطقٌ آخرُ جارٍ (كقراءة كلمة).
  applaud() { ensureMounted(); flash("cheer"); sfx.success(); },
  // كلامٌ عامّ بمزاجٍ مُحدَّد. opts.then يُستدعى عند انتهاء الكلام.
  say(text, mood = "talk", opts = {}) { ensureMounted(); flash(mood === "happy" ? "cheer" : ""); showBubble(text); roboSay(text, { mood, onend: opts.then }); },
  // قراءةُ حرفٍ أو كلمةٍ بوضوحٍ (بلا نبضةٍ آليّة كي لا تُزعجَ عند التكرار).
  read(text, opts = {}) { ensureMounted(); flash(""); showBubble(text); speak(text, { rate: opts.rate != null ? opts.rate : 0.7, onend: opts.then }); },
  // عرضٌ مرئيٌّ فقط (فقاعة + مزاج + مؤثّر) بلا نطقٍ آليّ — ليُشغَّلَ نطقٌ خارجيٌّ بعده (كاللغات الأجنبيّة).
  // opts.good: true=فرح+نغمةُ نجاح، false=طمأنة+نغمةُ خطأ.
  show(text, mood = "talk", opts = {}) { ensureMounted(); flash(opts.good === true ? "cheer" : (opts.good === false ? "sad" : "")); showBubble(text); if (opts.good === true) sfx.success(); else if (opts.good === false) sfx.nope(); },
};
