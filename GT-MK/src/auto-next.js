// src/auto-next.js — الانتقالُ التلقائيُّ والمستوياتُ المتدرّجة في كلِّ الاختباراتِ والألعاب (v1.10).
//
// (1) armAutoNext(btn): بجانبِ أيِّ زرِّ «التالي» زرُّ «⏭️ تلقائيّ» (يُحفَظُ الاختيارُ للكلّ — tilmithi_autonext_v1).
//     إن فُعِّل يُضغَطُ «التالي» بنفسِه بعدَ **3 ثوانٍ على الأقلّ وحتّى يفرغَ الآليُّ من ردّةِ فعلِه**
//     (لا مقطعَ يُشغَّلُ ولا نطقَ نظامٍ جارٍ)، وبسقفِ 12 ثانيةً كي لا يَعلَقَ الطفلُ إن لم يُسمَعْ شيء.
//     يتوقّفُ وحدَه إن اختفى الزرّ (ضغطَه الطفلُ أو غادرَ النشاط).
// (2) المستويات: getLevel/setLevel/levelResult — لكلِّ نشاطٍ مستواه المحفوظُ لكلِّ طفل، يرتفعُ بعدَ سلسلةِ
//     إجاباتٍ صحيحة (الخطأُ يُنقِصُ السلسلةَ ولا يُعاقِبُ بالنزول)، مع إعلانٍ لطيف (announceLevelUp).
import { isAutoNext, setAutoNext } from "./sound-prefs.js";
import { isClipPlaying } from "./tts-clips.js";
import { getLevel as _get, setLevel as _set, levelResult as _res } from "./progress.js";

export const AUTO_MIN_MS = 3000, AUTO_CAP_MS = 12000;
let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .an-auto{background:var(--card,#fff);border:1px solid var(--line,#ECE6DA);border-radius:999px;padding:6px 12px;font-size:13px;cursor:pointer;font-family:inherit;color:var(--muted,#6B6B6B);margin-inline-start:8px;vertical-align:middle}
  .an-auto.on{background:#7BB661;color:#fff;border-color:#7BB661}
  .an-arm{position:relative;overflow:hidden}
  .an-arm.counting::after{content:"";position:absolute;inset:auto 0 0 0;height:4px;background:rgba(255,255,255,.85);transform-origin:right;animation:anFill ${AUTO_MIN_MS}ms linear forwards}
  @keyframes anFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  @media (prefers-reduced-motion:reduce){.an-arm.counting::after{animation:none;transform:scaleX(1)}}
  .an-toast{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:9997;background:linear-gradient(135deg,#7BB661,#4f8a3a);color:#fff;border-radius:999px;padding:10px 20px;font-weight:800;font-size:15px;box-shadow:0 8px 24px rgba(0,0,0,.25);animation:anToast 3.2s ease forwards;pointer-events:none;white-space:nowrap}
  @keyframes anToast{0%{opacity:0;transform:translate(-50%,-14px)}12%,82%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-10px)}}`;
  document.head.appendChild(st);
}
// الآليُّ صامت؟ (لا مقطعَ يُشغَّل، ولا نطقُ نظامٍ جارٍ أو منتظِر)
export function isQuiet() {
  let busy = false;
  try { busy = isClipPlaying() || (typeof speechSynthesis !== "undefined" && (speechSynthesis.speaking || speechSynthesis.pending)); } catch (e) {}
  return !busy;
}
const label = on => on ? "⏭️ تلقائيّ" : "✋ يدويّ";
export function armAutoNext(btn, opts = {}) {
  if (!btn || btn.dataset.anArmed) return; btn.dataset.anArmed = "1";
  ensureStyle();
  btn.classList.add("an-arm");
  let tog = null;
  if (opts.toggle !== false) {
    tog = document.createElement("button"); tog.type = "button";
    tog.className = "an-auto" + (isAutoNext() ? " on" : ""); tog.textContent = label(isAutoNext());
    tog.title = "الانتقالُ التلقائيّ: بعدَ 3 ثوانٍ أو حينَ يُنهي الآليُّ ردَّ فعلِه";
    btn.insertAdjacentElement("afterend", tog);
  }
  let start = Date.now(), quiet = 0, timer = null;
  const paint = () => { const on = isAutoNext(); btn.classList.toggle("counting", on); if (tog) { tog.classList.toggle("on", on); tog.textContent = label(on); } };
  const stop = () => { clearInterval(timer); btn.classList.remove("counting"); };
  if (tog) tog.onclick = e => { e.stopPropagation(); setAutoNext(!isAutoNext()); start = Date.now(); quiet = 0;
    btn.classList.remove("counting"); void btn.offsetWidth; paint(); };
  paint();
  timer = setInterval(() => {
    if (!btn.isConnected || btn.disabled) { stop(); if (tog && !btn.isConnected) tog.remove(); return; }
    if (!isAutoNext()) { quiet = 0; return; }
    quiet = isQuiet() ? quiet + 1 : 0;
    const t = Date.now() - start;
    if (t >= AUTO_CAP_MS || (t >= AUTO_MIN_MS && quiet >= 3)) { stop(); if (tog) tog.remove(); btn.click(); }
  }, 250);
  return stop;
}

// ── المستويات ────────────────────────────────────────────────────────────────────────────
export const getLevel = _get, setLevel = _set;
/** نتيجةُ محاولة: يُرجِعُ المستوى الجديدَ إن حانَ الارتقاء، وإلّا null. levels مرتّبةٌ من الأسهل. */
export function levelResult(act, level, ok, levels, need = 5) { return _res(act, level, ok, levels, need); }
export function announceLevelUp(robo, text, phrase) {
  ensureStyle();
  try { document.querySelectorAll(".an-toast").forEach(x => x.remove()); } catch (e) {}
  const t = document.createElement("div"); t.className = "an-toast"; t.textContent = "⬆️ " + text;
  document.body.appendChild(t); setTimeout(() => t.remove(), 3400);
  try { if (robo && phrase) robo.say(phrase, "happy"); } catch (e) {}
}
