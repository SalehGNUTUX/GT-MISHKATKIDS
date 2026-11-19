// src/read-aloud.js — «اسمعِ السؤال» (v1.10): يجعلُ الأسئلةَ والخياراتِ مسموعةً لمن لا يقرأُ بعد.
// • sayBtn(text)  زرُّ 🔊 صغيرٌ (أيقونةٌ معتمَدة) يُنطِقُ نصَّه — يصلحُ داخلَ زرِّ الخيار (span لا button متداخل).
// • wireSay(root) ربطٌ مفوَّضٌ في طورِ الالتقاط: النقرُ على 🔊 يُنطِقُ ويوقفُ الحدثَ فلا يُحتسَبُ اختيارًا.
// • autoRead(text) قراءةٌ تلقائيّةٌ للسؤالِ عندَ ظهورِه لـ4–6 و«الكلّ» (7–10: الزرُّ وحدَه — يقرأُ بنفسِه).
// النصوصُ تُنطَقُ كما هي حرفيًّا فتطابقُ مقاطعَها المولَّدة (Piper للجُمَل، espeak للمفردات — vocab.js).
import { speak } from "./speak.js";
import { ICONS } from "./icons.js";
import { ageTier } from "./progress.js";

const REG = [];   // سجلُّ النصوص: الزرُّ يحملُ رقمَه لا النصَّ (لا هروبَ لعلاماتِ الاقتباسِ في السمات)
let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .say-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;flex:none;
    background:color-mix(in srgb,var(--primary,#E07A5F) 14%,var(--card,#fff));color:var(--primary-d,#B5482F);
    border:1.5px solid color-mix(in srgb,var(--primary,#E07A5F) 45%,transparent);cursor:pointer;vertical-align:middle;margin-inline-start:6px;padding:0}
  .say-btn svg{width:16px;height:16px;fill:currentColor}
  .say-btn:active{transform:scale(.9)}
  .say-btn.sm{width:28px;height:28px} .say-btn.sm svg{width:13px;height:13px}
  .say-btn.playing{background:var(--primary,#E07A5F);color:#fff}`;
  document.head.appendChild(st);
}
export function sayBtn(text, small) {
  ensureStyle();
  const i = REG.push(String(text)) - 1;
  return `<span class="say-btn${small ? " sm" : ""}" role="button" tabindex="0" data-say-i="${i}" title="اسمعْ" aria-label="اسمعْ">${ICONS.sound || "🔊"}</span>`;
}
function play(el) {
  const t = REG[+el.dataset.sayI]; if (!t) return;
  document.querySelectorAll(".say-btn.playing").forEach(x => x.classList.remove("playing"));
  el.classList.add("playing");
  try { speak(t, { onend: () => el.classList.remove("playing") }); } catch (e) { el.classList.remove("playing"); }
}
export function wireSay(root) {
  if (!root || root.dataset.sayWired) return; root.dataset.sayWired = "1";
  const h = e => { const b = e.target.closest && e.target.closest(".say-btn[data-say-i]"); if (!b) return;
    e.preventDefault(); e.stopPropagation(); play(b); };
  root.addEventListener("click", h, true);   // طورُ الالتقاط: قبلَ معالجِ «اختيارِ الخيار»
  root.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches(".say-btn")) h(e); }, true);
}
/** يقرأُ السؤالَ تلقائيًّا لمن لا يقرأُ بعدُ (4–6) أو حين لم تُحدَّدِ الفئة. */
export function autoRead(text) { if (ageTier() !== "older") { try { speak(text); } catch (e) {} } }
