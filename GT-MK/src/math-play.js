// src/math-play.js — أنشطةُ الرياضيّاتِ والمنطق (v1.9): ⚖️ ميزانُ المقارنة · ✏️ وصلُ النقاط · 📌 اللوحةُ الهندسيّة.
// وحدةٌ مستقلّةٌ عن math.html كي لا يتضخّم؛ تتلقّى ما تحتاجُه عبرَ ctx (الآليّ، إطارُ التنافس، تدفّقُ الإجابة).
// كلُّ الرسمِ SVG محلّيّ أصيل. ميزانُ المقارنة تنافسيٌّ عبر versus؛ النشاطانِ الآخرانِ فرديّانِ بتدرّجٍ في الصعوبة.

import { byAge } from "./progress.js"; // المستوى المقترحُ بحسبِ العمر (v1.9)
import { getLevel, setLevel, levelResult, announceLevelUp } from "./auto-next.js"; // الارتقاءُ بالإتقان (v1.10)

let ctx = null;          // { view, backBar, wireBack, robo, speak, logEvent, autoToggleHtml, wireAuto, onCorrect, onWrong, vs, GI, NOTICES, numAr }
let run = false;         // حارسُ المؤقّتاتِ والذكاء: يُطفأُ عند الرجوعِ إلى القائمة
let raf = null, tmo = null;
const rand = n => Math.floor(Math.random() * n);
const pick = a => a[rand(a.length)];
const shuffle = a => { for (let k = a.length - 1; k > 0; k--) { const j = rand(k + 1); [a[k], a[j]] = [a[j], a[k]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function initMathPlay(c) { ctx = c; ensureStyle(); CD.lvl = getLevel("dots", byAge([1, 2, 3], CD.lvl)); GB.lvl = getLevel("geo", byAge([1, 2, 3], GB.lvl)); } // المحفوظُ للطفلِ أوّلًا // مستوى عمرِ الطفل (v1.9)
export function stopMathPlay() { run = false; cancelAnimationFrame(raf); clearTimeout(tmo); }

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  /* ⚖️ الميزان */
  .bl-wrap{max-width:420px;margin:4px auto 0}
  .bl-svg{width:100%;height:auto;display:block;direction:ltr;overflow:visible}
  .bl-beam,.bl-pan{transition:transform .7s cubic-bezier(.34,1.4,.5,1)}
  .bl-beam{transform-box:view-box;transform-origin:160px 50px}
  .bl-pan{cursor:pointer}
  .bl-pan .plate{fill:var(--card);stroke:var(--line);stroke-width:2.5}
  .bl-pan:hover .plate{stroke:var(--primary)}
  .bl-pan.ok .plate{stroke:var(--good,#7BB661);stroke-width:4;fill:#EEF6E9}
  .bl-pan.bad .plate{stroke:var(--bad,#E0566B);stroke-width:4;fill:#FCEBEE}
  html[data-theme="dark"] .bl-pan.ok .plate{fill:#22351c} html[data-theme="dark"] .bl-pan.bad .plate{fill:#3a1f24}
  .bl-pan text{font-family:inherit;font-weight:800;fill:var(--ink);pointer-events:none}
  .bl-metal{fill:#B8A27A} html[data-theme="dark"] .bl-metal{fill:#8C7A5A}
  .bl-eqrow{display:flex;justify-content:center;margin:2px 0 4px}
  .bl-expr{direction:ltr;text-align:center;font-size:30px;font-weight:800;margin:6px 0;color:var(--primary-d)}
  .bl-say{text-align:center;font-size:14px;color:var(--muted)}
  /* ✏️ وصلُ النقاط */
  .cd-svg{width:100%;max-width:440px;height:auto;display:block;margin:6px auto;touch-action:manipulation;direction:ltr}
  .cd-line{fill:none;stroke:var(--primary);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
  .cd-fill{fill:color-mix(in srgb,var(--primary) 30%,transparent);stroke:var(--primary);stroke-width:1.4;opacity:0;transition:opacity .8s}
  .cd-fill.on{opacity:1}
  .cd-dot{fill:var(--ink)} .cd-dot.done{fill:var(--primary)}
  .cd-dot.next{fill:var(--primary);animation:cdPulse 1.1s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
  .cd-lbl{font-size:4.4px;font-weight:800;fill:var(--ink);font-family:inherit;pointer-events:none;text-anchor:middle;dominant-baseline:central}
  .cd-hit{fill:transparent;cursor:pointer}
  .cd-wrong{animation:cdShake .35s}
  @keyframes cdPulse{50%{transform:scale(1.5)}}
  @keyframes cdShake{25%{transform:translateX(-1.5px)}75%{transform:translateX(1.5px)}}
  .cd-name{text-align:center;font-size:22px;font-weight:800;color:var(--primary-d);min-height:30px;margin:2px 0}
  .mp-chips{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:6px 2px}
  .mp-chip{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-size:14px;cursor:pointer;font-family:inherit;color:var(--muted)}
  .mp-chip.on{background:var(--primary);border-color:var(--primary);color:#fff}
  /* 📌 اللوحةُ الهندسيّة */
  .gb-svg{width:100%;max-width:400px;height:auto;display:block;margin:6px auto;touch-action:manipulation;direction:ltr}
  .gb-board{fill:var(--card);stroke:var(--line);stroke-width:.6}
  .gb-peg{fill:#9A8C74;cursor:pointer} html[data-theme="dark"] .gb-peg{fill:#8C7F69}
  .gb-peg.used{fill:var(--primary)} .gb-peg.first{fill:var(--primary);stroke:#fff;stroke-width:.8}
  .gb-hit{fill:transparent;cursor:pointer}
  .gb-band{fill:none;stroke:#E0566B;stroke-width:1.3;stroke-linejoin:round;stroke-linecap:round}
  .gb-shape{fill:color-mix(in srgb,#E0566B 22%,transparent);stroke:#E0566B;stroke-width:1.3;stroke-linejoin:round}
  .gb-shape.ok{fill:color-mix(in srgb,#7BB661 30%,transparent);stroke:#4f8a3a}
  .gb-tools{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:4px 0}
  .gb-tools button{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px 14px;font-size:14px;cursor:pointer;font-family:inherit;color:var(--ink)}
  .gb-msg{text-align:center;font-size:15px;min-height:44px;margin:4px 6px;line-height:1.6}
  .gb-msg b{color:var(--primary-d)}`;
  document.head.appendChild(st);
}

/* ======================================================================
   ⚖️ ميزانُ المقارنة (تنافسيّ · versus)
   اضغطِ الكفّةَ الأثقل، أو «متساويتان». سهل: أشياءُ تُعَدّ · متوسّط: أعداد · صعب: عمليّاتٌ في الكفّتين.
   بعدَ الإجابةِ يميلُ الميزانُ فعلًا وتُكتَبُ المقارنةُ بالرمز (7 < 12) — الرمزُ يُبنى على المحسوس.
   ====================================================================== */
const BL = { diff: "easy", timed: true, ps: [], turn: 0, lock: false, q: null, aiPick: null };
const BL_TARGET = 5;
const BL_CFG = { easy: { ms: 10000, pr: 0.6, d: 1500 }, medium: { ms: 8000, pr: 0.75, d: 1200 }, hard: { ms: 7000, pr: 0.9, d: 1000 } };
const BL_OBJ = ["🍎", "🍊", "⭐", "🐟", "🌸", "🥕", "🍇", "🐤"];

export function startBalance() {
  stopMathPlay();
  const { view, backBar, wireBack, vs, GI, speak } = ctx;
  view.innerHTML = backBar() + `<div id="blhost"></div>`; wireBack();
  vs.vsSetup(document.getElementById("blhost"), {
    say: GI.balance, soloOk: true,
    diffs: [{ v: "easy", label: "سهل · أشياء" }, { v: "medium", label: "متوسّط · أعداد" }, { v: "hard", label: "صعب · عمليّات" }],
    getDiff: () => BL.diff, setDiff: v => { BL.diff = v; },
    toggle: { label: "⏱️ اللعبُ ضدّ الوقت", get: () => BL.timed, set: v => { BL.timed = v; } },
    start: newBalance,
  });
  try { speak(GI.balance); } catch (e) {}
}
function newBalance() {
  run = true; BL.ps = ctx.vs.vsMakePlayers(); BL.ps.forEach(p => p.score = 0);
  BL.turn = ctx.vs.vsStartIndex(BL.ps); BL.lock = false; blNext();
}
// قيمةُ كلِّ كفّةٍ + ما يُعرَضُ عليها. التساوي مقصودٌ بنسبةٍ معقولة كي لا يُخمَّن.
function blGen() {
  const eq = Math.random() < 0.22;
  if (BL.diff === "easy") {
    const a = 1 + rand(6); let b = eq ? a : 1 + rand(6); while (!eq && b === a) b = 1 + rand(6);
    const em = BL_OBJ[rand(BL_OBJ.length)];
    return { L: a, R: b, show: { L: { objs: a, em }, R: { objs: b, em } }, txt: [String(a), String(b)] };
  }
  if (BL.diff === "medium") {
    const a = 1 + rand(20); let b = eq ? a : 1 + rand(20); while (!eq && b === a) b = 1 + rand(20);
    return { L: a, R: b, show: { L: { text: String(a) }, R: { text: String(b) } }, txt: [String(a), String(b)] };
  }
  // صعب: «a + b» مقابلَ عددٍ أو مقابلَ «c + d» (لا تتجاوزُ 20)
  const x = 2 + rand(9), y = 1 + rand(9), sum = x + y;
  let side;
  if (Math.random() < 0.5) {
    const n = eq ? sum : Math.max(1, sum + (rand(2) ? 1 : -1) * (1 + rand(3)));
    side = { L: sum, R: n, lt: `${x}+${y}`, rt: String(n) };
  } else {
    let c = 1 + rand(sum - 1); if (!eq) c = Math.max(1, Math.min(18, c + (rand(2) ? 1 : -1) * (1 + rand(2))));
    const d = eq ? sum - c : 1 + rand(9);
    side = { L: sum, R: c + d, lt: `${x}+${y}`, rt: `${c}+${d}` };
  }
  if (rand(2)) side = { L: side.R, R: side.L, lt: side.rt, rt: side.lt }; // العمليّةُ في أيِّ كفّة
  return { L: side.L, R: side.R, show: { L: { text: side.lt }, R: { text: side.rt } }, txt: [side.lt, side.rt] };
}
const blAnswer = q => q.L > q.R ? "L" : q.L < q.R ? "R" : "E";

function blNext() {
  if (!run) return;
  if (BL.ps.some(p => p.score >= BL_TARGET)) { blEnd(); return; }
  BL.q = blGen(); BL.lock = false; BL.aiPick = null; blRender(0);
  const cur = BL.ps[BL.turn];
  if (cur.cpu) blAI(); else if (BL.timed) blTimer(BL_CFG[BL.diff].ms, () => { if (!BL.lock) { BL.lock = true; blResolve(null); } });
}
// محتوى الكفّة: أشياءُ مرصوصةٌ صفوفًا (3 في الصفّ) أو نصٌّ (عددٌ/عمليّة)
function panContent(s, cx) {
  if (s.objs) {
    const rows = []; for (let i = 0; i < s.objs; i++) rows.push(i);
    return rows.map(i => { const r = Math.floor(i / 3), c = i % 3, inRow = Math.min(3, s.objs - r * 3);
      const x = cx + (c - (inRow - 1) / 2) * 22, y = 112 - r * 20;
      return `<text x="${x}" y="${y}" font-size="18" text-anchor="middle">${s.em}</text>`; }).join("");
  }
  const len = s.text.length, fs = len > 4 ? 22 : 30;
  return `<text x="${cx}" y="112" font-size="${fs}" text-anchor="middle">${esc(s.text)}</text>`;
}
function blSvg(angle) {
  const q = BL.q, rad = angle * Math.PI / 180, dy = Math.sin(rad) * 90;
  const pan = (side, cx, off) => `<g class="bl-pan" data-side="${side}" style="transform:translateY(${off}px)">
      <line x1="${cx}" y1="50" x2="${cx - 48}" y2="118" stroke="#9A8C74" stroke-width="1.5"/><line x1="${cx}" y1="50" x2="${cx + 48}" y2="118" stroke="#9A8C74" stroke-width="1.5"/>
      <rect x="${cx - 62}" y="40" width="124" height="96" fill="transparent"/>
      ${panContent(q.show[side], cx)}
      <path class="plate" d="M${cx - 58} 118 Q${cx} 140 ${cx + 58} 118 Z"/></g>`;
  return `<svg class="bl-svg" viewBox="0 0 320 215" role="img" aria-label="ميزان">
    <rect class="bl-metal" x="150" y="50" width="20" height="140" rx="4"/><rect class="bl-metal" x="110" y="188" width="100" height="14" rx="7"/>
    <g class="bl-beam" style="transform:rotate(${angle}deg)"><rect class="bl-metal" x="70" y="45" width="180" height="10" rx="5"/></g>
    <circle class="bl-metal" cx="160" cy="50" r="9"/>
    ${pan("L", 70, -dy)}${pan("R", 250, dy)}</svg>`;
}
function blRender(angle) {
  const host = document.getElementById("blhost"); if (!host) return;
  const { vs } = ctx, cur = BL.ps[BL.turn];
  host.innerHTML = `<div class="prompt">⚖️ أيُّ الكفّتينِ أثقل؟ — أوّلُ من يبلغُ ${BL_TARGET} يفوز!</div>`
    + vs.vsScoreHtml(BL.ps) + vs.vsTurnHtml(cur)
    + (BL.timed ? `<div style="height:9px;background:var(--line);border-radius:99px;overflow:hidden;max-width:320px;margin:6px auto 4px"><span id="blbar" style="display:block;height:100%;background:var(--primary);width:100%"></span></div>` : "")
    + `<div class="bl-wrap" id="blscale">${blSvg(angle)}</div>`
    + `<div class="bl-eqrow"><button class="opt" id="bleq" style="font-size:17px">متساويتان</button></div>`
    + `<div id="blfb"></div>`;
  host.querySelectorAll(".bl-pan").forEach(g => g.addEventListener("click", () => blTap(g.dataset.side)));
  host.querySelector("#bleq").addEventListener("click", () => blTap("E"));
}
function blTimer(ms, onEnd) {
  const start = Date.now(); cancelAnimationFrame(raf);
  const tick = () => { if (!run) { cancelAnimationFrame(raf); return; }
    const left = ms - (Date.now() - start), bar = document.getElementById("blbar");
    if (bar) bar.style.width = Math.max(0, left / ms * 100) + "%";
    if (left <= 0) { onEnd && onEnd(); return; } raf = requestAnimationFrame(tick); };
  tick();
}
function blTap(side) { if (BL.lock || BL.ps[BL.turn].cpu) return; cancelAnimationFrame(raf); BL.lock = true; ctx.vs.sfx.tap(); blResolve(side); }
function blAI() {
  BL.lock = true; const cfg = BL_CFG[BL.diff], ans = blAnswer(BL.q), ok = Math.random() < cfg.pr;
  BL.aiPick = ok ? ans : shuffle(["L", "R", "E"].filter(v => v !== ans))[0];
  if (BL.timed) blTimer(cfg.d, () => blResolve(BL.aiPick)); else tmo = setTimeout(() => blResolve(BL.aiPick), cfg.d);
}
function blMark(side, cls) {
  if (!side) return;
  const el = side === "E" ? document.getElementById("bleq") : document.querySelector(`.bl-pan[data-side="${side}"]`);
  if (el) el.classList.add(cls);
}
function blResolve(pick) {
  if (!run) return;
  cancelAnimationFrame(raf);
  const { vs, robo } = ctx, cur = BL.ps[BL.turn], human = !cur.cpu, q = BL.q, ans = blAnswer(q), ok = pick === ans;
  // الميزانُ يميلُ نحوَ الأثقل (أو يستوي) — الحقيقةُ تظهرُ مهما كانت الإجابة
  const angle = ans === "L" ? -12 : ans === "R" ? 12 : 0, rad = angle * Math.PI / 180, dy = Math.sin(rad) * 90;
  const beam = document.querySelector(".bl-beam"); if (beam) beam.style.transform = `rotate(${angle}deg)`;
  const pl = document.querySelector('.bl-pan[data-side="L"]'), pr = document.querySelector('.bl-pan[data-side="R"]');
  if (pl) pl.style.transform = `translateY(${-dy}px)`; if (pr) pr.style.transform = `translateY(${dy}px)`;
  blMark(pick, ok ? "ok" : "bad"); if (!ok) blMark(ans, "ok");
  const eqb = document.getElementById("bleq"); if (eqb) eqb.disabled = true;
  if (ok) { cur.score++; const won = cur.score >= BL_TARGET;
    if (won) vs.sfx.success(); else if (human) robo.cheer(vs.vP(vs.GR.ok), { female: cur.female }); else { vs.sfx.success(); if (Math.random() < 0.4) robo.say(vs.vP(vs.GR.aiok), "happy"); } }
  else { if (human) robo.encourage(vs.vP(vs.GR.no), { female: cur.female }); else vs.sfx.nope(); }
  const sign = ans === "L" ? ">" : ans === "R" ? "<" : "=";
  const words = ans === "E" ? "الكفّتانِ متساويتان" : ans === "L" ? "الكفّةُ اليسرى أثقل" : "الكفّةُ اليمنى أثقل";
  const fb = document.getElementById("blfb");
  if (fb) fb.innerHTML = `<div class="bl-expr">${esc(q.txt[0])} ${sign} ${esc(q.txt[1])}</div><div class="bl-say">${pick === null ? "⏱️ انتهى الوقت — " : ""}${words}</div>`;
  if (ok && human) ctx.logEvent("math_correct");
  tmo = setTimeout(() => { if (!run) return; BL.turn = (BL.turn + 1) % BL.ps.length; blNext(); }, 1900);
}
function blEnd() {
  ctx.logEvent("math_balance_win");
  ctx.vs.vsEndRound(BL.ps, { game: "ميزانُ المقارنة", diff: ({ easy: "سهل", medium: "متوسّط", hard: "صعب" }[BL.diff] || ""), onAgain: newBalance, onExit: startBalance });
}

/* ======================================================================
   ✏️ وصلُ النقاط — صِلِ النقاطَ بالترتيبِ (أرقامًا أو حروفًا) فيظهرُ الرسم.
   ====================================================================== */
const ABJAD = ["أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "هـ", "و", "ي"];
const ring = (n, cx, cy, r, phase = -90, rIn = null) => Array.from({ length: n }, (_, i) => {
  const rr = rIn != null && i % 2 ? rIn : r, a = (phase + i * 360 / n) * Math.PI / 180;
  return [+(cx + rr * Math.cos(a)).toFixed(1), +(cy + rr * Math.sin(a)).toFixed(1)]; });
const heart = () => Array.from({ length: 12 }, (_, i) => { const t = Math.PI / 2 + i * 2 * Math.PI / 12;
  const x = 16 * Math.sin(t) ** 3, y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return [+(50 + x * 2.4).toFixed(1), +(48 - y * 2.4).toFixed(1)]; });
const crescent = () => { const o = [], inn = [];
  for (let i = 0; i <= 6; i++) { const a = (70 + i * 220 / 6) * Math.PI / 180; o.push([+(48 + 38 * Math.cos(a)).toFixed(1), +(50 + 38 * Math.sin(a)).toFixed(1)]); }
  for (let i = 5; i >= 1; i--) { const a = (95 + i * 170 / 6) * Math.PI / 180; inn.push([+(62 + 30 * Math.cos(a)).toFixed(1), +(50 + 30 * Math.sin(a)).toFixed(1)]); }
  return o.concat(inn); };
// كلُّ رسمٍ مضلّعٌ مغلقٌ في 0..100. «lvl» يحدّدُ أدنى صعوبةٍ يظهرُ فيها (بعددِ النقاط).
const CD_SHAPES = [
  { name: "طائرةٌ ورقيّة", lvl: 1, pts: [[50, 8], [80, 42], [50, 92], [20, 42]] },
  { name: "بيت", lvl: 1, pts: [[18, 90], [18, 50], [50, 18], [82, 50], [82, 90]] },
  { name: "خيمة", lvl: 1, pts: [[10, 88], [50, 16], [90, 88], [62, 88], [50, 62], [38, 88]] },
  { name: "سمكة", lvl: 2, pts: [[8, 50], [28, 30], [58, 28], [76, 42], [92, 26], [92, 74], [76, 58], [58, 72], [28, 70]] },
  { name: "قارب", lvl: 2, pts: [[24, 84], [10, 62], [46, 62], [46, 12], [80, 58], [50, 58], [50, 62], [90, 62], [76, 84]] },
  { name: "نجمة", lvl: 2, pts: ring(10, 50, 52, 42, -90, 18) },
  { name: "شجرة", lvl: 2, pts: [[50, 6], [76, 38], [64, 38], [84, 64], [56, 64], [56, 92], [44, 92], [44, 64], [16, 64], [36, 38], [24, 38]] },
  { name: "قلب", lvl: 3, pts: heart() },
  { name: "هلال", lvl: 3, pts: crescent() },
];
const CD = { mode: "num", lvl: 1, shape: null, i: 0, last: null };
export function startConnectDots() {
  stopMathPlay(); CD.last = null; cdNew();
  try { ctx.robo.say(ctx.NOTICES.dotsIntro, "ask"); } catch (e) {}
}
function cdNew() {
  const pool = CD_SHAPES.filter(s => s.lvl === CD.lvl && s.name !== CD.last);
  CD.shape = pool[rand(pool.length)] || CD_SHAPES[0]; CD.last = CD.shape.name; CD.i = 0; cdRender();
}
const cdLabel = i => CD.mode === "num" ? String(i + 1) : ABJAD[i];
function cdRender() {
  const { view, backBar, wireBack } = ctx, pts = CD.shape.pts;
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  // الرقمُ خارجَ النقطةِ بعيدًا عن المركز كي لا يغطّيه الخطّ
  const lbl = ([x, y]) => { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1; return [x + dx / d * 5.5, y + dy / d * 5.5]; };
  const chip = (k, v, t) => `<button class="mp-chip${CD[k] === v ? " on" : ""}" data-k="${k}" data-v="${v}">${t}</button>`;
  view.innerHTML = backBar()
    + `<div class="mp-chips">${chip("mode", "num", "123 أرقام")}${chip("mode", "abc", "أبت حروف")}<span style="width:8px"></span>${chip("lvl", 1, "سهل")}${chip("lvl", 2, "متوسّط")}${chip("lvl", 3, "صعب")}</div>`
    + `<div class="prompt">صِلِ النقاطَ بالترتيب: ${cdLabel(0)} ← ${cdLabel(1)} ← ${cdLabel(2)} …</div>`
    + `<svg class="cd-svg" viewBox="-6 -6 112 112" id="cdsvg">
        <polygon class="cd-fill" id="cdfill" points="${pts.map(p => p.join(",")).join(" ")}"/>
        <polyline class="cd-line" id="cdline" points=""/>
        ${pts.map((p, i) => { const [lx, ly] = lbl(p); return `<g data-i="${i}"><circle class="cd-hit" cx="${p[0]}" cy="${p[1]}" r="6"/>
          <circle class="cd-dot${i === 0 ? " next" : ""}" cx="${p[0]}" cy="${p[1]}" r="1.8"/><text class="cd-lbl" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}">${cdLabel(i)}</text></g>`; }).join("")}
      </svg>`
    + `<div class="cd-name" id="cdname"></div><div class="hint">ابدأْ من ${cdLabel(0)} واتبعِ الترتيب — ماذا سيظهر؟</div>`;
  wireBack();
  view.querySelectorAll(".mp-chip").forEach(b => b.onclick = () => { const k = b.dataset.k; CD[k] = k === "lvl" ? +b.dataset.v : b.dataset.v; if (k === "lvl") setLevel("dots", CD.lvl); CD.last = null; cdNew(); });
  view.querySelector("#cdsvg").addEventListener("click", e => { const g = e.target.closest("[data-i]"); if (g) cdTap(+g.dataset.i, g); });
}
function cdTap(i, g) {
  const pts = CD.shape.pts; if (CD.i >= pts.length) return;
  if (i !== CD.i) { g.classList.remove("cd-wrong"); void g.getBBox(); g.classList.add("cd-wrong"); ctx.vs.sfx.nope(); return; }
  ctx.vs.sfx.tap();
  if (CD.mode === "num") { try { ctx.speak(ctx.numAr(i + 1)); } catch (e) {} }
  const dots = document.querySelectorAll("#cdsvg .cd-dot");
  dots[i].classList.remove("next"); dots[i].classList.add("done");
  CD.i++;
  const line = document.getElementById("cdline");
  line.setAttribute("points", pts.slice(0, CD.i).map(p => p.join(",")).join(" ") + (CD.i === pts.length ? " " + pts[0].join(",") : ""));
  if (CD.i < pts.length) { dots[CD.i].classList.add("next"); return; }
  // اكتمل: يُلوَّنُ الشكلُ ويظهرُ اسمُه
  document.getElementById("cdfill").classList.add("on");
  document.getElementById("cdname").textContent = `🎉 ${CD.shape.name}!`;
  ctx.logEvent("math_dots_done");
  const up = levelResult("dots", CD.lvl, true, [1, 2, 3], 3);
  if (up) { CD.lvl = up; announceLevelUp(ctx.robo, `مستوًى جديد: ${["", "سهل", "متوسّط", "صعب"][up]}`); }
  ctx.onCorrect(ctx.robo, ctx.view, cdNew, up ? ctx.NOTICES.levelUp : ctx.NOTICES.dotsDone);
}

/* ======================================================================
   📌 اللوحةُ الهندسيّة (geoboard) — شُدَّ الشريطَ بين المساميرِ لتصنعَ الشكلَ المطلوب.
   اضغطِ المساميرَ بالترتيب، ثمّ المسمارَ الأوّلَ لإغلاقِ الشكل. التطبيقُ يتعرّفُ على ما صنعتَ ويحسبُ مساحتَه.
   ====================================================================== */
const GB_N = 6, GB_GAP = 16, GB_PAD = 10;
const GB_TARGETS = {
  1: ["triangle", "square", "rectangle"],
  2: ["triangle", "square", "rectangle", "right", "rhombus", "pentagon", "hexagon"],
  3: ["square", "rectangle", "right", "triangle", "parallelogram"],   // صعب: الشكلُ **بمساحةٍ مطلوبة** (v1.10)
};
// المساحاتُ الممكنةُ على لوحِ 6×6 لكلِّ شكلٍ في المستوى الصعب (بالمربّعات)
const GB_AREAS = { square: [1, 4, 9, 16], rectangle: [2, 3, 4, 6, 8, 10, 12], right: [1, 2, 3, 4, 6], triangle: [1, 2, 3, 4, 6], parallelogram: [2, 3, 4, 6] };
// المساحةُ بعربيّةٍ سليمةٍ للعددِ والمعدود (على شبكةِ المساميرِ صحيحةٌ أو نصف — مبرهنةُ بيك)
const areaTxt = u => { const w = Math.floor(u), half = u - w >= 0.5;
  if (!w) return "<b>نصفُ</b> مربّع";
  const base = w === 1 ? "<b>مربّعٌ</b> واحد" : w === 2 ? "<b>مربّعان</b>" : w <= 10 ? `<b>${w}</b> مربّعات` : `<b>${w}</b> مربّعًا`;
  return base + (half ? " <b>ونصف</b>" : ""); };
const GB_NAME = { triangle: "مثلّثًا", right: "مثلّثًا قائمَ الزاوية", square: "مربّعًا", rectangle: "مستطيلًا", rhombus: "معيّنًا",
  parallelogram: "متوازيَ أضلاع", quad: "شكلًا رباعيًّا", pentagon: "شكلًا خماسيًّا", hexagon: "شكلًا سداسيًّا", poly: "مضلّعًا" };
const GB = { lvl: 1, target: null, area: null, pts: [], closed: false, score: 0, free: false };
export function startGeoboard() {
  stopMathPlay(); GB.score = 0; gbNewTarget();
  try { ctx.robo.say(ctx.NOTICES.geoIntro, "ask"); } catch (e) {}
}
function gbNewTarget() {
  const list = GB_TARGETS[GB.lvl]; let t = list[rand(list.length)]; if (t === GB.target && list.length > 1) t = list[(list.indexOf(t) + 1) % list.length];
  GB.target = t; GB.area = GB.lvl === 3 ? pick(GB_AREAS[t]) : null; GB.pts = []; GB.closed = false; gbRender();
}
const pegXY = k => [GB_PAD + (k % GB_N) * GB_GAP, GB_PAD + Math.floor(k / GB_N) * GB_GAP];
function gbRender(msg) {
  const { view, backBar, wireBack, autoToggleHtml, wireAuto } = ctx, size = GB_PAD * 2 + (GB_N - 1) * GB_GAP;
  const chip = (v, t) => `<button class="mp-chip${GB.free ? (v === "free" ? " on" : "") : (GB.lvl === v ? " on" : "")}" data-v="${v}">${t}</button>`;
  const P = GB.pts.map(pegXY);
  view.innerHTML = backBar()
    + `<div class="gbar"><span class="pill">⭐ <b>${GB.score}</b></span>${autoToggleHtml()}</div>`
    + `<div class="mp-chips">${chip(1, "سهل")}${chip(2, "متوسّط")}${chip(3, "صعب · بمساحة")}${chip("free", "🎨 حُرّ")}</div>`
    + `<div class="prompt">${GB.free ? "اصنعْ أيَّ شكلٍ — وسأخبرُك ما هو!" : `اصنعْ <span style="color:var(--primary-d)">${GB_NAME[GB.target]}</span>${GB.area ? ` مساحتُه ${areaTxt(GB.area)}` : ""}`}</div>`
    + `<svg class="gb-svg" viewBox="0 0 ${size} ${size}" id="gbsvg"><rect class="gb-board" x="1" y="1" width="${size - 2}" height="${size - 2}" rx="5"/>
        ${GB.closed ? `<polygon class="gb-shape" id="gbshape" points="${P.map(p => p.join(",")).join(" ")}"/>` : `<polyline class="gb-band" points="${P.map(p => p.join(",")).join(" ")}"/>`}
        ${Array.from({ length: GB_N * GB_N }, (_, k) => { const [x, y] = pegXY(k), used = GB.pts.includes(k);
          return `<g data-k="${k}"><circle class="gb-hit" cx="${x}" cy="${y}" r="${GB_GAP / 2}"/><circle class="gb-peg${used ? " used" : ""}${GB.pts[0] === k && !GB.closed ? " first" : ""}" cx="${x}" cy="${y}" r="2.2"/></g>`; }).join("")}
      </svg>`
    + `<div class="gb-msg" id="gbmsg">${msg || (GB.pts.length ? (GB.pts.length >= 3 ? "اضغطِ المسمارَ الأوّلَ لإغلاقِ الشكل" : "تابِعْ — اضغطِ المسمارَ التالي") : "اضغطِ المساميرَ واحدًا تلوَ الآخر")}</div>`
    + `<div class="gb-tools"><button id="gbundo">↶ تراجع</button><button id="gbclear">🧹 امسح</button></div>`;
  wireBack(); wireAuto(view);
  view.querySelectorAll(".mp-chip").forEach(b => b.onclick = () => { const v = b.dataset.v; GB.free = v === "free"; if (!GB.free) { GB.lvl = +v; setLevel("geo", GB.lvl); } gbNewTarget(); });
  view.querySelector("#gbsvg").addEventListener("click", e => { const g = e.target.closest("[data-k]"); if (g) gbTap(+g.dataset.k); });
  view.querySelector("#gbundo").onclick = () => { if (GB.closed) GB.closed = false; else GB.pts.pop(); gbRender(); };
  view.querySelector("#gbclear").onclick = () => { GB.pts = []; GB.closed = false; gbRender(); };
}
function gbTap(k) {
  if (GB.closed) return;
  if (GB.pts.length >= 3 && k === GB.pts[0]) { GB.closed = true; ctx.vs.sfx.tap(); gbCheck(); return; }
  if (GB.pts.includes(k)) { ctx.vs.sfx.nope(); return; }
  GB.pts.push(k); ctx.vs.sfx.tap(); gbRender();
}
// التصنيف: يُحذَفُ الرأسُ الواقعُ على استقامةٍ واحدة، ثمّ يُفحَصُ التقاطعُ والزوايا والأضلاع.
function gbClassify(P) {
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  let V = P.slice(), changed = true;
  while (changed && V.length > 3) { changed = false;
    for (let i = 0; i < V.length; i++) { const a = V[(i - 1 + V.length) % V.length], b = V[i], c = V[(i + 1) % V.length];
      if (cross(a, b, c) === 0) { V.splice(i, 1); changed = true; break; } } }
  const n = V.length, seg = i => [V[i], V[(i + 1) % n]];
  const inter = (p1, p2, p3, p4) => { const d1 = cross(p3, p4, p1), d2 = cross(p3, p4, p2), d3 = cross(p1, p2, p3), d4 = cross(p1, p2, p4); return d1 * d2 < 0 && d3 * d4 < 0; };
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; const [a, b] = seg(i), [c, d] = seg(j); if (inter(a, b, c, d)) return { kind: "cross" }; }
  let area2 = 0; for (let i = 0; i < n; i++) { const [a, b] = seg(i); area2 += a[0] * b[1] - b[0] * a[1]; }
  if (n < 3 || area2 === 0) return { kind: "flat" };
  const units = Math.abs(area2) / 2 / (GB_GAP * GB_GAP);
  const sq = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2, dot = (o, a, b) => (a[0] - o[0]) * (b[0] - o[0]) + (a[1] - o[1]) * (b[1] - o[1]);
  const sides = V.map((p, i) => sq(p, V[(i + 1) % n]));
  const right = V.map((p, i) => dot(p, V[(i - 1 + n) % n], V[(i + 1) % n]) === 0);
  let kind;
  if (n === 3) kind = right.some(Boolean) ? "right" : "triangle";
  else if (n === 4) {
    const allRight = right.every(Boolean), allEq = sides.every(s => s === sides[0]);
    const par = (i, j) => { const [a, b] = seg(i), [c, d] = seg(j); return (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]) === 0; };
    kind = allRight ? (allEq ? "square" : "rectangle") : allEq ? "rhombus" : (par(0, 2) && par(1, 3)) ? "parallelogram" : "quad";
  } else kind = n === 5 ? "pentagon" : n === 6 ? "hexagon" : "poly";
  return { kind, units };
}
// هل يحقّقُ المصنوعُ الهدف؟ (المربّعُ مستطيلٌ ومعيّنٌ رياضيًّا، والقائمُ مثلّث)
const gbFits = (kind, t) => kind === t || (t === "triangle" && kind === "right") || (t === "rectangle" && kind === "square") || (t === "rhombus" && kind === "square")
  || (t === "parallelogram" && ["rectangle", "square", "rhombus"].includes(kind));   // كلُّها متوازياتُ أضلاعٍ رياضيًّا
function gbCheck() {
  const { robo, view, onCorrect, onWrong, logEvent, NOTICES } = ctx;
  const r = gbClassify(GB.pts.map(pegXY));
  if (r.kind === "cross") { GB.closed = false; gbRender("الشريطُ يتقاطعُ مع نفسِه ✋ — تراجعْ وجرّبْ ترتيبًا آخر"); robo.encourage(); return; }
  if (r.kind === "flat") { GB.closed = false; gbRender("هذه نقاطٌ على خطٍّ واحد — أضِفْ مسمارًا خارجَه"); return; }
  const made = GB_NAME[r.kind], area = `مساحتُه ${areaTxt(r.units)}`;
  if (GB.free) {
    gbRender(`صنعتَ <b>${made}</b> 👏 — ${area}`);
    document.getElementById("gbshape")?.classList.add("ok"); robo.cheer(); logEvent("math_geo_free");
    return;
  }
  if (gbFits(r.kind, GB.target) && (GB.area == null || Math.abs(r.units - GB.area) < 1e-9)) {
    GB.score++; gbRender(`أحسنت! صنعتَ <b>${made}</b> — ${area}`);
    document.getElementById("gbshape")?.classList.add("ok"); logEvent("math_correct");
    // أربعةُ أشكالٍ صحيحةٍ في المستوى ⇒ المستوى الأصعب (كان السهلُ يكرّرُ المثلّثَ والمربّعَ والمستطيلَ بلا نهاية)
    const up = levelResult("geo", GB.lvl, true, [1, 2, 3], 4);
    if (up) { GB.lvl = up; announceLevelUp(robo, up === 2 ? "مستوًى جديد: متوسّط — أشكالٌ أكثر" : "مستوًى جديد: صعب — الشكلُ بمساحتِه"); }
    onCorrect(robo, view, gbNewTarget, up ? NOTICES.levelUp : NOTICES.geoDone);
  } else {
    const want = `<b>${GB_NAME[GB.target]}</b>${GB.area ? ` مساحتُه ${areaTxt(GB.area)}` : ""}`;
    gbRender(gbFits(r.kind, GB.target) ? `صنعتَ <b>${made}</b> مساحتُه ${areaTxt(r.units)}، والمطلوبُ ${want} — تراجعْ وعدّلْ` : `صنعتَ <b>${made}</b>، والمطلوبُ ${want} — تراجعْ وعدّلْ`);
    levelResult("geo", GB.lvl, false, [1, 2, 3], 4);
    onWrong(robo, view, gbNewTarget);
  }
}
