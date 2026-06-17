// src/quiz-flow.js — تدفّقٌ موحَّدٌ للاختبارات في كل الأقسام. محلّيّ بالكامل.
// المبدأ: لا يُقطَع صوتُ ردّة فعل الآلي — الانتقالُ يقع *بعد* انتهاء كلامه (onend)،
// تلقائياً إن فعّل المستخدمُ «الانتقال التلقائيّ»، وإلّا بزرّ «التالي ▶» يدويّ.
// وعند الخطأ: تشجيعٌ + إتاحةُ التجاوز («سنعودُ إليها لاحقًا») كي لا يَعلَقَ الطفل.
import { isAutoNext, setAutoNext } from "./sound-prefs.js";

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .qa-auto{background:#fff;border:1px solid #ECE6DA;border-radius:999px;padding:5px 12px;font-size:13px;cursor:pointer;font-family:inherit;color:#6B6B6B}
  .qa-auto.on{background:#7BB661;color:#fff;border-color:#7BB661}
  .qa-next{text-align:center;margin-top:16px}
  .qa-nextbtn{background:#E07A5F;color:#fff;border:none;border-radius:12px;padding:11px 22px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit}
  .qa-skipbtn{background:#fff;color:#6B6B6B;border:1px solid #ECE6DA;border-radius:12px;padding:10px 18px;font-size:14px;cursor:pointer;font-family:inherit}`;
  document.head.appendChild(st);
}

// زرّ تبديل «الانتقال التلقائيّ» — يوضَع في شريط كلّ اختبار.
export function autoToggleHtml() {
  const on = isAutoNext();
  return `<button class="qa-auto${on ? " on" : ""}" id="qaAuto" title="عند تفعيله ينتقل للسؤال التالي تلقائياً">${on ? "⏭️ تلقائيّ" : "✋ يدويّ"}</button>`;
}
export function wireAuto(root) {
  const b = (root || document).querySelector("#qaAuto"); if (!b) return;
  b.onclick = () => { const on = !isAutoNext(); setAutoNext(on); b.classList.toggle("on", on); b.textContent = on ? "⏭️ تلقائيّ" : "✋ يدويّ"; };
}

function appendNext(view, next, label, cls) {
  ensureStyle();
  if (view.querySelector(".qa-next")) return;       // زرٌّ واحدٌ فقط
  const d = document.createElement("div"); d.className = "qa-next";
  d.innerHTML = `<button class="${cls || "qa-nextbtn"}">${label || "التالي ▶"}</button>`;
  view.appendChild(d);
  d.querySelector("button").onclick = () => { try { d.remove(); } catch (e) {} next && next(); };
}

// إجابةٌ صحيحة: يَنطق روبو الجوابَ الصحيح أوّلًا (إن مُرِّر: كلمة/رقم/حرف) ثمّ ردّةَ الفعل،
// ثمّ ينتقل (تلقائيّ بعد انتهاء الكلام، أو زرٌّ يدويّ لا يَقطع الصوت). لا تتداخلُ الأصوات.
export function onCorrect(robo, view, next, praise, answer) {
  ensureStyle();
  const react = () => {
    if (isAutoNext()) robo.cheer(praise, { then: next });
    else { robo.cheer(praise); appendNext(view, next, "التالي ▶"); }
  };
  if (answer) robo.read(String(answer), { then: react });   // انطق الجوابَ ثمّ تفاعَلْ
  else react();
}
// إجابةٌ خاطئة: تشجيعٌ لطيف + إتاحةُ تجاوزٍ مع وعدِ العودة (robo.recall) كيلا يَعلَق الطفل.
export function onWrong(robo, view, next) {
  ensureStyle();
  robo.encourage();
  appendNext(view, () => robo.recall({ then: next }), "↪️ تجاوَزْ — سنعودُ إليها", "qa-skipbtn");
}
