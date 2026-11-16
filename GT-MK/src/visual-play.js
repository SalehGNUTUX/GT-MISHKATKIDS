// src/visual-play.js — أنشطةُ الإدراكِ البصريّ (v1.9 · دفعة ب): 🔍 جِدِ المختلف (…ثمّ البازلُ والتلوين).
// وحدةٌ مستقلّةٌ عن play.html — وتستوردُ الإطارَ التنافسيَّ المركزيَّ (versus.js) لا نسخَ play.html المحلّيّة
// (انظر pitfalls ب‑1: التكرارُ مصدرُ الأخطاء). تتلقّى من الصفحةِ ما يخصُّها فقط: view وزرَّ الرجوع.
// كلُّ الرسومِ SVG محلّيّةٌ أصيلة.
import { robo } from "./robo-companion.js";
import { logEvent } from "./progress.js";
import { speak } from "./speak.js";
import { GAME_INTROS as GI } from "./robo-phrases.js";
import { vsSetup, vsMakePlayers, vsScoreHtml, vsTurnHtml, vsEndRound, vsStartIndex, vP, GAME as GR, sfx } from "./versus.js";

let ctx = null;          // { view, backBar, wireBack }
let run = false;         // حارسُ المؤقّتاتِ والذكاء: يُطفأُ عند الرجوعِ إلى القائمة
let raf = null, tmo = null;
const rand = n => Math.floor(Math.random() * n);
const pick = a => a[rand(a.length)];

export function initVisualPlay(c) { ctx = c; ensureStyle(); }
export function stopVisualPlay() { run = false; cancelAnimationFrame(raf); clearTimeout(tmo); }

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  /* 🔍 جِدِ المختلف */
  .od-grid{display:grid;gap:6px;width:min(100%,420px);margin:6px auto 4px;direction:ltr}
  .od-cell{aspect-ratio:1;padding:4px;border:2px solid var(--line,#ECE6DA);border-radius:12px;background:var(--card,#fff);cursor:pointer;
    display:flex;align-items:center;justify-content:center;transition:transform .12s,border-color .2s;color:var(--ink)}
  .od-cell:active{transform:scale(.94)}
  .od-cell svg{width:100%;height:100%;display:block}
  .od-cell.ok{border-color:#4f8a3a;border-width:4px;background:#EEF6E9;animation:odPop .5s}
  .od-cell.bad{border-color:#E0566B;border-width:4px;background:#FCEBEE}
  html[data-theme="dark"] .od-cell.ok{background:#22351c} html[data-theme="dark"] .od-cell.bad{background:#3a1f24}
  @keyframes odPop{50%{transform:scale(1.12)}}
  @media (prefers-reduced-motion:reduce){.od-cell.ok{animation:none}}
  .od-bar{height:9px;background:var(--line,#ECE6DA);border-radius:99px;overflow:hidden;max-width:320px;margin:6px auto 4px}
  .od-bar span{display:block;height:100%;background:var(--primary);width:100%}
  .od-why{text-align:center;font-size:15px;min-height:26px;margin:4px 6px}
  .od-why b{color:var(--primary-d,#B5482F)}`;
  document.head.appendChild(st);
}

/* ======================================================================
   🔍 جِدِ المختلف (تنافسيّ · versus) — شبكةٌ من صورٍ متطابقةٍ إلّا واحدة.
   سهل 3×3: لونٌ أو شكلٌ مختلف · متوسّط 4×4: مقلوبةٌ/ينقصُها تفصيلٌ/لون · صعب 5×5: تفصيلٌ صغيرٌ أو عددٌ أو قلب.
   ====================================================================== */
const PAL = ["#E07A5F", "#6FB3D6", "#7BB661", "#F4C95D", "#C9A0DC", "#F28FB1"];
const INK = "#3A3A3A";
// كلُّ رسمٍ في 0..40. p = { c: اللون، flip: مقلوب، miss: ينقصُه التفصيل، cnt: عددُ العناصرِ المعدودة }
// asym: غيرُ متناظرٍ (يصلحُ للقلب) · cnt: [الأصل، البديل] للعدّ · miss: وصفُ التفصيلِ الناقص.
const MOTIFS = [
  { id: "fish", asym: true, cnt: [2, 3], miss: "بلا عين", cntTxt: "عددُ خطوطِها مختلف",
    svg: p => `<ellipse cx="17" cy="20" rx="13" ry="9" fill="${p.c}"/><polygon points="28,20 38,11 38,29" fill="${p.c}"/>`
      + Array.from({ length: p.cnt }, (_, i) => `<line x1="${20 + i * 3.5}" y1="13" x2="${20 + i * 3.5}" y2="27" stroke="${INK}" stroke-width="1.4" opacity=".55"/>`).join("")
      + (p.miss ? "" : `<circle cx="10" cy="18" r="2.6" fill="#fff"/><circle cx="9.4" cy="18" r="1.3" fill="${INK}"/>`) },
  { id: "house", asym: true, miss: "بلا نافذة",
    svg: p => `<rect x="7" y="18" width="26" height="17" fill="${p.c}"/><polygon points="4,19 20,5 36,19" fill="#9B4E3C"/>`
      + `<rect x="10" y="24" width="7" height="11" fill="#6B4A2A"/>`
      + (p.miss ? "" : `<rect x="22" y="22" width="8" height="7" fill="#CFEAF7" stroke="${INK}" stroke-width="1"/>`) },
  { id: "tree", asym: true, cnt: [3, 2], miss: "بلا جذع", cntTxt: "عددُ ثمارِها مختلف",
    svg: p => (p.miss ? "" : `<rect x="17.5" y="24" width="5" height="13" fill="#8B5A2B"/>`)
      + `<circle cx="20" cy="16" r="12" fill="${p.c}"/>`
      + [[13, 12], [11, 20], [17, 7], [16, 17]].slice(0, p.cnt).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.3" fill="#D63B3B"/>`).join("") },
  { id: "bug", asym: false, cnt: [4, 2], miss: "بلا قرنَيْ استشعار", cntTxt: "عددُ نقاطِها مختلف",
    svg: p => (p.miss ? "" : `<path d="M17 8 L13 2 M23 8 L27 2" stroke="${INK}" stroke-width="1.6" fill="none"/>`)
      + `<circle cx="20" cy="10" r="5" fill="${INK}"/><circle cx="20" cy="23" r="13" fill="${p.c}"/>`
      + `<line x1="20" y1="11" x2="20" y2="36" stroke="${INK}" stroke-width="1.4"/>`
      + [[14, 19], [26, 19], [14, 28], [26, 28]].slice(0, p.cnt).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${INK}"/>`).join("") },
  { id: "flower", asym: false, cnt: [6, 5], miss: "بلا وسط", cntTxt: "عددُ بتلاتِها مختلف",
    svg: p => Array.from({ length: p.cnt }, (_, i) => { const a = (i * 360 / p.cnt - 90) * Math.PI / 180;
        return `<circle cx="${(20 + 10 * Math.cos(a)).toFixed(1)}" cy="${(20 + 10 * Math.sin(a)).toFixed(1)}" r="6.5" fill="${p.c}"/>`; }).join("")
      + (p.miss ? "" : `<circle cx="20" cy="20" r="5.5" fill="#F4A93D" stroke="${INK}" stroke-width=".8"/>`) },
  { id: "balloon", asym: true, miss: "بلا لمعة",
    svg: p => `<path d="M20 30 Q24 34 19 37 Q15 39 20 40" stroke="${INK}" stroke-width="1.1" fill="none"/>`
      + `<ellipse cx="20" cy="16" rx="11" ry="13" fill="${p.c}"/><polygon points="18,29 22,29 20,31" fill="${p.c}"/>`
      + (p.miss ? "" : `<ellipse cx="15" cy="10" rx="2.6" ry="4" fill="#fff" opacity=".75" transform="rotate(-25 15 10)"/>`) },
];
const motifSvg = (m, p) => `<svg viewBox="0 0 40 40" aria-hidden="true"><g${p.flip ? ` transform="translate(40 0) scale(-1 1)"` : ""}>${m.svg(p)}</g></svg>`;

const OD = { diff: "easy", timed: true, ps: [], turn: 0, lock: false, q: null, aiPick: null };
const OD_TARGET = 5;
const OD_CFG = {
  easy:   { n: 9,  kinds: ["color", "shape"],          ms: 12000, pr: 0.6,  d: 2600 },
  medium: { n: 16, kinds: ["flip", "miss", "color"],   ms: 14000, pr: 0.72, d: 3200 },
  hard:   { n: 25, kinds: ["miss", "count", "flip"],   ms: 16000, pr: 0.82, d: 3800 },
};
const WHY = { color: "لونُها مختلف", shape: "شكلُها مختلف", flip: "مقلوبةٌ إلى الجهةِ الأخرى" };

export function startOddOne() {
  stopVisualPlay();
  const { view, backBar, wireBack } = ctx;
  view.innerHTML = backBar() + `<div id="odhost"></div>`; wireBack();
  vsSetup(document.getElementById("odhost"), {
    say: GI.oddone, soloOk: true,
    diffs: [{ v: "easy", label: "سهل · 3×3" }, { v: "medium", label: "متوسّط · 4×4" }, { v: "hard", label: "صعب · 5×5" }],
    getDiff: () => OD.diff, setDiff: v => { OD.diff = v; },
    toggle: { label: "⏱️ اللعبُ ضدّ الوقت", get: () => OD.timed, set: v => { OD.timed = v; } },
    start: newOddOne,
  });
  try { speak(GI.oddone); } catch (e) {}
}
function newOddOne() {
  run = true; OD.ps = vsMakePlayers(); OD.ps.forEach(p => p.score = 0);
  OD.turn = vsStartIndex(OD.ps); OD.lock = false; odNext();
}
// سؤالٌ: صورةُ الأصلِ مكرّرةً + صورةٌ واحدةٌ مختلفةٌ بنوعِ اختلافٍ يناسبُ الصعوبة
function odGen() {
  const kind = pick(OD_CFG[OD.diff].kinds);
  const pool = MOTIFS.filter(m => kind === "flip" ? m.asym : kind === "count" ? !!m.cnt : true);
  const m = pick(pool), c = pick(PAL);
  const base = { c, flip: false, miss: false, cnt: m.cnt ? m.cnt[0] : 0 };
  let om = m, odd = { ...base }, why;
  if (kind === "color") { odd.c = pick(PAL.filter(x => x !== c)); why = WHY.color; }
  else if (kind === "shape") { om = pick(MOTIFS.filter(x => x !== m)); odd.cnt = om.cnt ? om.cnt[0] : 0; why = WHY.shape; }
  else if (kind === "flip") { odd.flip = true; why = WHY.flip; }
  else if (kind === "miss") { odd.miss = true; why = m.miss; }
  else { odd.cnt = m.cnt[1]; why = m.cntTxt; }
  const n = OD_CFG[OD.diff].n;
  return { n, cols: Math.sqrt(n), odd: rand(n), baseSvg: motifSvg(m, base), oddSvg: motifSvg(om, odd), why };
}
function odNext() {
  if (!run) return;
  if (OD.ps.some(p => p.score >= OD_TARGET)) { odEnd(); return; }
  OD.q = odGen(); OD.lock = false; OD.aiPick = null; odRender();
  const cur = OD.ps[OD.turn];
  if (cur.cpu) odAI(); else if (OD.timed) odTimer(OD_CFG[OD.diff].ms, () => { if (!OD.lock) { OD.lock = true; odResolve(null); } });
}
function odRender() {
  const { view, backBar, wireBack } = ctx, q = OD.q, cur = OD.ps[OD.turn];
  view.innerHTML = backBar()
    + `<div class="clue" style="padding:10px"><div class="say">🔍 جِدِ الصورةَ المختلفة — أوّلُ من يبلغُ ${OD_TARGET} يفوز!</div></div>`
    + vsScoreHtml(OD.ps) + vsTurnHtml(cur)
    + (OD.timed ? `<div class="od-bar"><span id="odbar"></span></div>` : "")
    + `<div class="od-grid" id="odgrid" style="grid-template-columns:repeat(${q.cols},1fr)">`
    + Array.from({ length: q.n }, (_, i) => `<button class="od-cell" data-i="${i}" aria-label="صورة ${i + 1}">${i === q.odd ? q.oddSvg : q.baseSvg}</button>`).join("")
    + `</div><div class="od-why" id="odwhy"></div>`;
  wireBack();
  document.getElementById("odgrid").addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) odTap(+b.dataset.i); });
}
function odTimer(ms, onEnd) {
  const start = Date.now(); cancelAnimationFrame(raf);
  const tick = () => { if (!run) { cancelAnimationFrame(raf); return; }
    const left = ms - (Date.now() - start), bar = document.getElementById("odbar");
    if (bar) bar.style.width = Math.max(0, left / ms * 100) + "%";
    if (left <= 0) { onEnd && onEnd(); return; } raf = requestAnimationFrame(tick); };
  tick();
}
function odTap(i) { if (OD.lock || OD.ps[OD.turn].cpu) return; cancelAnimationFrame(raf); OD.lock = true; sfx.tap(); odResolve(i); }
// الآليُّ «يبحثُ» مدّةً ثمّ يختار؛ يُصيبُ باحتماليّةٍ تزدادُ مع الصعوبة، وخليّتُه تُلوَّنُ ليرى اللاعبُ ما فعل.
function odAI() {
  OD.lock = true; const cfg = OD_CFG[OD.diff], ok = Math.random() < cfg.pr;
  OD.aiPick = ok ? OD.q.odd : pick(Array.from({ length: OD.q.n }, (_, i) => i).filter(i => i !== OD.q.odd));
  if (OD.timed) odTimer(cfg.d, () => odResolve(OD.aiPick)); else tmo = setTimeout(() => odResolve(OD.aiPick), cfg.d);
}
function odResolve(i) {
  if (!run) return;
  cancelAnimationFrame(raf);
  const cur = OD.ps[OD.turn], human = !cur.cpu, q = OD.q, ok = i === q.odd;
  const cell = k => document.querySelector(`#odgrid [data-i="${k}"]`);
  if (i != null) cell(i)?.classList.add(ok ? "ok" : "bad");
  if (!ok) cell(q.odd)?.classList.add("ok");                 // المختلفةُ تظهرُ دائمًا
  if (ok) { cur.score++; const won = cur.score >= OD_TARGET;
    if (won) sfx.success(); else if (human) robo.cheer(vP(GR.ok), { female: cur.female }); else { sfx.success(); if (Math.random() < 0.4) robo.say(vP(GR.aiok), "happy"); } }
  else { if (human) robo.encourage(vP(GR.no), { female: cur.female }); else sfx.nope(); }
  const w = document.getElementById("odwhy");
  if (w) w.innerHTML = `${i === null ? "⏱️ انتهى الوقت — " : ""}الصورةُ المختلفة: <b>${q.why}</b>`;
  if (ok && human) logEvent("oddone_correct");
  tmo = setTimeout(() => { if (!run) return; OD.turn = (OD.turn + 1) % OD.ps.length; odNext(); }, 1900);
}
function odEnd() {
  logEvent("oddone_win");
  vsEndRound(OD.ps, { game: "جِدِ المختلف", diff: ({ easy: "سهل", medium: "متوسّط", hard: "صعب" }[OD.diff] || ""), onAgain: newOddOne, onExit: startOddOne });
}
