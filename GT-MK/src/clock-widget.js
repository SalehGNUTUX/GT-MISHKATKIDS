// src/clock-widget.js — وحدةٌ مشترَكةٌ لنشاطِ الساعة (v1.5): وجهٌ تناظُريٌّ SVG بعقاربَ قابلةٍ للسحب،
// عرضٌ رقميٌّ بوضعَي «صباح/مساء (12)» و«24 ساعة»، بطاقةٌ تعليميّة، ولعبةٌ تنافسيّةٌ عبر versus.js.
// تُستعمَلُ في العربيّة (clock.html) وفي قسم اللغات (lang.html) بلغةٍ/صوتٍ مختلف. محلّيٌّ بالكامل.
// النطقُ يُعادُ فيه استخدامُ مقاطعِ الأعداد الموجودةِ (ساعة + دقيقة) فلا يحتاجُ توليدَ صوتٍ جديد.

import { robo } from "./robo-companion.js";
import { vsSetup, vsMakePlayers, vsScoreHtml, vsTurnHtml, vsEndRound, vP, GAME as GR, sfx } from "./versus.js";
import { timePhrase, amPmWord, CLOCK_STEP } from "../content/clock-time.js"; // نطقُ الوقتِ بجُمَلٍ صحيحةٍ (مقاطعُ Piper)

const pad = n => String(n).padStart(2, "0");
const h12of = h => (h % 12) || 12;            // 0→12, 13→1 …
const rad = d => (d - 90) * Math.PI / 180;    // 0° = الساعة 12 (أعلى)

// ===== الترجماتُ الافتراضيّة (العربيّة). تُمرَّرُ L مختلفةٌ للّغات. =====
export const AR_L = {
  am: "صباحًا", pm: "مساءً", mode12: "🌅 صباح/مساء", mode24: "🕓 24 ساعة",
  learn: "تعلَّمِ الساعة", dragHint: "اسحبِ العقربَين لتضبطَ الوقت", speak: "🔊 اسمعِ الوقت",
  now: "الوقتُ الآن", read: "اقرأِ الساعة", whatTime: "كمِ الساعةُ الآن؟", setTo: "اضبطِ الساعةَ على",
  correct: "أحسنت! ✅", tryAgain: "حاولْ ثانيةً", game: "تحدّي الساعة",
  // نمطُ الأسئلة
  qA2D: "كمِ الساعةُ على وجهِ العقارب؟", qD2A: "أيُّ ساعةٍ تُطابقُ هذا الوقت؟",
  qType: "اكتبِ الوقتَ الذي تُشيرُ إليه الساعة", qSet: "حرّكِ العقاربَ لتُطابقَ هذا الوقت",
  qConv12: "اختَرِ التوقيتَ نفسَه بنظامِ 24 ساعة", qConv24: "اختَرِ التوقيتَ نفسَه بنظامِ 12 ساعة (صباح/مساء)",
  check: "✓ تحقّقْ", hourPh: "ساعة", minPh: "دقيقة",
  // روحُ الآليّ في هذا القسم (الطفلُ يُعلّمُ الآليَّ الذي نسيَ قراءةَ الساعة)
  roboLearn: "🤖 الآليُّ نسيَ كيف يقرأُ الساعة! حرّكِ العقاربَ وعلِّمْه.",
  roboGame: "🤖 ساعِدِ الآليَّ ليتذكّرَ قراءةَ الساعة — تنافَسا!"
};

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .clk-wrap{max-width:560px;margin:10px auto;text-align:center}
  .clk-face{width:min(74vw,300px);height:min(74vw,300px);touch-action:none;user-select:none;cursor:pointer;display:block;margin:6px auto}
  .clk-num{font:700 15px system-ui,sans-serif;fill:var(--ink,#2B2B2B)}
  .clk-hand{transition:transform .08s linear}
  .clk-dig{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:10px 0}
  .clk-card{background:var(--card,#fff);border:1px solid var(--line,#ECE6DA);border-radius:16px;padding:12px 16px;min-width:120px}
  .clk-card .lb{font-size:12px;color:var(--muted,#6B6B6B);margin-bottom:4px}
  .clk-card .vv{font:800 26px system-ui,monospace;color:var(--primary-d,#C7613F);letter-spacing:1px;direction:ltr;unicode-bidi:isolate}
  .clk-ctl{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:8px 0}
  .clk-ctl button{background:var(--card,#fff);border:1px solid var(--line,#ECE6DA);border-radius:999px;padding:8px 15px;font:inherit;font-weight:800;font-size:14px;cursor:pointer;color:var(--muted,#6B6B6B)}
  .clk-ctl button.on{background:var(--primary,#E07A5F);color:#fff;border-color:var(--primary,#E07A5F)}
  .clk-speak{background:var(--sky,#6FB3D6);color:#fff;border:none;border-radius:14px;padding:11px 22px;font:inherit;font-weight:800;font-size:16px;cursor:pointer;margin-top:6px}
  .clk-opts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:12px 0}
  .clk-opt{background:var(--card,#fff);color:var(--ink,#2B2B2B);border:2px solid var(--line,#ECE6DA);border-radius:14px;padding:14px 20px;font:800 22px system-ui,monospace;cursor:pointer;direction:ltr;min-width:96px;transition:transform .1s}
  .clk-opt:active{transform:scale(.96)} .clk-opt.ok{background:var(--good,#7BB661);color:#fff;border-color:var(--good,#7BB661)} .clk-opt.no{background:var(--bad,#E0566B);color:#fff;border-color:var(--bad,#E0566B)}
  .clk-facebtn{background:var(--card,#fff);border:3px solid var(--line,#ECE6DA);border-radius:16px;padding:8px;cursor:pointer;transition:transform .1s;line-height:0}
  .clk-facebtn:active{transform:scale(.96)} .clk-facebtn.ok{border-color:var(--good,#7BB661)} .clk-facebtn.no{border-color:var(--bad,#E0566B)}
  .clk-target{font:800 34px system-ui,monospace;color:var(--primary-d,#C7613F);direction:ltr;margin:6px 0;letter-spacing:1px}
  .clk-type{display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;margin:12px 0;direction:ltr}
  .clk-type input{width:74px;font:800 26px system-ui,monospace;text-align:center;border:2px solid var(--line,#ECE6DA);border-radius:12px;padding:8px;background:var(--card,#fff);color:var(--ink,#2B2B2B)}
  .clk-type .colon{font:800 26px system-ui;color:var(--muted,#6B6B6B)}
  .clk-check{background:var(--good,#7BB661);color:#fff;border:none;border-radius:14px;padding:12px 26px;font:inherit;font-weight:800;font-size:16px;cursor:pointer;margin-top:4px}
  .clk-bubble{background:color-mix(in srgb,var(--sky,#6FB3D6) 14%,var(--card,#fff));border:1px solid var(--line,#ECE6DA);border-radius:14px;padding:10px 14px;font-size:14px;color:var(--ink,#2B2B2B);max-width:440px;margin:6px auto;line-height:1.7}
  .clk-timebar{height:6px;background:var(--line,#ECE6DA);border-radius:999px;overflow:hidden;max-width:340px;margin:6px auto 2px}
  .clk-timebar span{display:block;height:100%;width:100%;background:var(--primary,#E07A5F);transition:width .1s linear}`;
  document.head.appendChild(st);
}

// ===== وجهُ الساعةِ التناظُريّ (SVG). يُرجِعُ العنصرَ مع دوالِّ ضبطٍ. =====
// state={ h12:1..12, m:0..59, pm:bool }. drag=true لتمكينِ سحبِ العقارب.
export function makeFace(state, { drag = false, onChange, size, snap = CLOCK_STEP } = {}) {
  ensureStyle();
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 200 200"); svg.setAttribute("class", "clk-face");
  if (size) { svg.style.width = svg.style.height = size + "px"; svg.style.margin = "0"; }
  const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  svg.appendChild(el("circle", { cx: 100, cy: 100, r: 96, fill: "var(--card,#fff)", stroke: "var(--primary,#E07A5F)", "stroke-width": 4 }));
  // علاماتُ الدقائق والساعات
  for (let i = 0; i < 60; i++) {
    const a = rad(i * 6), big = i % 5 === 0, r1 = big ? 80 : 84, r2 = 90;
    svg.appendChild(el("line", { x1: 100 + r1 * Math.cos(a), y1: 100 + r1 * Math.sin(a), x2: 100 + r2 * Math.cos(a), y2: 100 + r2 * Math.sin(a), stroke: big ? "var(--ink,#2B2B2B)" : "var(--line,#ECE6DA)", "stroke-width": big ? 2.4 : 1.2 }));
  }
  // أرقامُ الساعات 1..12 (غربيّة)
  for (let n = 1; n <= 12; n++) {
    const a = rad(n * 30), t = el("text", { x: 100 + 66 * Math.cos(a), y: 100 + 66 * Math.sin(a), "text-anchor": "middle", "dominant-baseline": "central", class: "clk-num" });
    t.textContent = n; svg.appendChild(t);
  }
  const hHand = el("line", { x1: 100, y1: 100, x2: 100, y2: 46, stroke: "var(--ink,#2B2B2B)", "stroke-width": 6, "stroke-linecap": "round", class: "clk-hand" });
  const mHand = el("line", { x1: 100, y1: 100, x2: 100, y2: 24, stroke: "var(--primary,#E07A5F)", "stroke-width": 4, "stroke-linecap": "round", class: "clk-hand" });
  svg.appendChild(hHand); svg.appendChild(mHand);
  svg.appendChild(el("circle", { cx: 100, cy: 100, r: 5, fill: "var(--primary-d,#C7613F)" }));
  function render() {
    const hAng = (h12of(state.h12) % 12) * 30 + state.m * 0.5;
    const mAng = state.m * 6;
    hHand.setAttribute("transform", `rotate(${hAng} 100 100)`);
    mHand.setAttribute("transform", `rotate(${mAng} 100 100)`);
  }
  render();
  if (drag) {
    let dragging = null;
    const angleAt = ev => {
      const r = svg.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = ev.clientX - cx, dy = ev.clientY - cy;
      let deg = Math.atan2(dx, -dy) * 180 / Math.PI; if (deg < 0) deg += 360;
      return { deg, frac: Math.hypot(dx, dy) / (r.width / 2) };
    };
    const move = ev => {
      if (!dragging) return; const { deg } = angleAt(ev);
      if (dragging === "m") { state.m = (Math.round(deg / 6 / snap) * snap) % 60; }
      else { let hh = Math.round(deg / 30) % 12; if (hh === 0) hh = 12; state.h12 = hh; }
      render(); onChange && onChange();
    };
    // أحداثُ المؤشّرِ مع الْتقاطٍ (pointer capture): تنحصرُ على العنصرِ فلا تُسرِّبُ مستمعاتٍ عبر الجولات.
    svg.addEventListener("pointerdown", ev => { const a = angleAt(ev); dragging = a.frac > 0.55 ? "m" : "h"; try { svg.setPointerCapture(ev.pointerId); } catch (e) {} move(ev); ev.preventDefault(); });
    svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerup", () => { dragging = null; });
    svg.addEventListener("pointercancel", () => { dragging = null; });
  }
  svg.__render = render;
  return svg;
}

// النصوصُ الرقميّة
export function dig12(s, L) { return `${h12of(s.h12)}:${pad(s.m)} ${s.pm ? L.pm : L.am}`; }
export function dig24(s) { const h = (h12of(s.h12) % 12) + (s.pm ? 12 : 0); return `${pad(h)}:${pad(s.m)}`; }

// نطقُ الوقتِ بجملةٍ طبيعيّة، ثمّ لصيقةَ صباحًا/مساءً عند معرفةِ ص/م (ampm=true). مقاطعُ Piper منفصلةٌ متتابعة.
async function sayTime(lang, s, speakPhrase, ampm) {
  try {
    await speakPhrase(timePhrase(lang, h12of(s.h12), s.m));
    if (ampm) await speakPhrase(amPmWord(lang, !!s.pm));
  } catch (e) {}
}

// ===== البطاقةُ التعليميّة =====
// opts={ L, lang, speakPhrase, initial?:{h12,m,pm} }
export function attachClockLearn(host, opts = {}) {
  ensureStyle();
  const L = opts.L || AR_L, lang = opts.lang || "ar", speakPhrase = opts.speakPhrase || (() => {});
  const now = new Date();
  const state = opts.initial || { h12: h12of(now.getHours()), m: (Math.round(now.getMinutes() / CLOCK_STEP) * CLOCK_STEP) % 60, pm: now.getHours() >= 12 };
  if (!state.mode) state.mode = "12";     // نظامُ العرض: 12 (صباح/مساء) أو 24
  host.innerHTML = `<div class="clk-wrap">
    <div class="clk-bubble">${L.roboLearn}</div>
    <div class="hint" style="margin-bottom:2px">${L.dragHint}</div>
    <div class="clk-face-slot"></div>
    <div class="clk-ctl" id="apCtl"><button data-ap="am" class="${!state.pm ? "on" : ""}">${L.am}</button><button data-ap="pm" class="${state.pm ? "on" : ""}">${L.pm}</button></div>
    <div class="clk-ctl" id="modeCtl"><button data-mode="12" class="${state.mode === "12" ? "on" : ""}">${L.mode12}</button><button data-mode="24" class="${state.mode === "24" ? "on" : ""}">${L.mode24}</button></div>
    <div class="clk-dig"><div class="clk-card"><div class="lb" id="digLb"></div><div class="vv" id="dig"></div></div></div>
    <button class="clk-speak" id="clkSpk">${L.speak}</button>
  </div>`;
  host.querySelector(".clk-face-slot").appendChild(makeFace(state, { drag: true, onChange: upd }));
  function upd() {
    const is12 = state.mode === "12";
    host.querySelector("#dig").textContent = is12 ? dig12(state, L) : dig24(state);
    host.querySelector("#digLb").textContent = is12 ? L.mode12 : L.mode24;
    // صباح/مساء يبقى ظاهرًا في النظامين: في 12 لصيقةٌ، وفي 24 يُحدّدُ 0–11 أو 12–23.
  }
  upd();
  host.querySelector("#apCtl").addEventListener("click", e => {
    const b = e.target.closest("[data-ap]"); if (!b) return; state.pm = b.getAttribute("data-ap") === "pm";
    host.querySelectorAll("#apCtl button").forEach(x => x.classList.toggle("on", (x.getAttribute("data-ap") === "pm") === state.pm)); upd();
  });
  host.querySelector("#modeCtl").addEventListener("click", e => {
    const b = e.target.closest("[data-mode]"); if (!b) return; state.mode = b.getAttribute("data-mode");
    host.querySelectorAll("#modeCtl button").forEach(x => x.classList.toggle("on", x.getAttribute("data-mode") === state.mode)); upd();
  });
  host.querySelector("#clkSpk").onclick = () => sayTime(lang, state, speakPhrase, true);   // ينطقُ الوقتَ + صباحًا/مساءً
}

// ===== اللعبةُ التنافسيّة (versus) — متعدّدةُ الأنماط =====
// opts={ L, lang, speakPhrase, onExit, onWin }.  الأنماط: عقارب→رقميّ · رقميّ→عقارب · اكتبِ الوقت ·
// حرّكِ العقارب · **تحويلٌ 12↔24 (صباح/مساء)**. العقاربُ لا تُظهِرُ ص/م فتُقارَنُ الساعةُ والدقيقةُ فقط،
// أمّا نمطُ التحويلِ فيقارنُ ص/م أيضًا (يُعلّمُ 3:30 مساءً = 15:30) — فيَشملُ الاختبارُ نهجَ AM/PM و24 ساعة.
const STEP = { easy: 60, medium: 15, hard: 5 };
const MODES = { easy: ["a2d", "d2a"], medium: ["a2d", "d2a", "type", "conv"], hard: ["a2d", "d2a", "type", "set", "conv"] };
const AMPM_MODE = { a2d: false, d2a: true, type: false, set: true, conv: true };   // متى يُنطَقُ صباحًا/مساءً
const AIPR = { easy: .6, medium: .76, hard: .9 };
const CLK_TIME = { easy: 16000, medium: 12000, hard: 9000 }; // مهلةُ «ضدّ الوقت» لكلِّ صعوبة
let clkDiff = "easy", clkTimed = true, clkRaf = 0;
const _pad = pad;
export function clockGame(host, opts = {}) {
  const L = opts.L || AR_L, lang = opts.lang || "ar", speakPhrase = opts.speakPhrase || (() => {}), TARGET = 5;
  let ps = [], turn = 0, lock = false, q = null, setState = null;
  vsSetup(host, {
    say: `🕐 ${L.game} — ${L.roboGame}`, soloOk: true,
    diffs: [{ v: "easy", label: "سهل" }, { v: "medium", label: "متوسّط" }, { v: "hard", label: "صعب" }],
    getDiff: () => clkDiff, setDiff: v => clkDiff = v,
    toggle: { label: "⏱️ اللعبُ ضدّ الوقت", get: () => clkTimed, set: v => clkTimed = v },
    start: newRound
  });
  function cancelTimer() { if (clkRaf) { cancelAnimationFrame(clkRaf); clkRaf = 0; } }
  function armTimer() {
    const ms = CLK_TIME[clkDiff] || 12000, t0 = Date.now(); cancelTimer();
    const tick = () => {
      if (!host.isConnected) { cancelTimer(); return; }
      const left = ms - (Date.now() - t0), bar = host.querySelector("#clkbar");
      if (bar) bar.style.width = Math.max(0, left / ms * 100) + "%";
      if (left <= 0) { if (!lock) { lock = true; sfx.nope(); resolve(false); } return; }
      clkRaf = requestAnimationFrame(tick);
    };
    tick();
  }
  const same = (a, b) => h12of(a.h12) === h12of(b.h12) && a.m === b.m;    // العقاربُ لا تُميّزُ ص/م
  const sameFull = (a, b) => same(a, b) && !!a.pm === !!b.pm;             // التحويلُ يُميّزُ ص/م
  const eq = (a, b) => q && q.mode === "conv" ? sameFull(a, b) : same(a, b);
  const bare = s => `${h12of(s.h12)}:${_pad(s.m)}`;                       // 12h بلا لصيقةِ ص/م (مصدرُه عقارب)
  function randTime() {
    const step = STEP[clkDiff], h12 = 1 + Math.floor(Math.random() * 12);
    const m = step >= 60 ? 0 : Math.floor(Math.random() * (60 / step)) * step;
    return { h12, m, pm: Math.random() < .5 };
  }
  function distractors(ans, n, full) {
    const out = [ans]; let guard = 0;
    while (out.length < n && guard++ < 300) { const c = randTime(); if (!out.some(o => (full ? sameFull : same)(o, c))) out.push(c); }
    return shuffle(out);
  }
  function newRound() { ps = vsMakePlayers(); ps.forEach(p => p.score = 0); turn = 0; lock = false; next(); }
  function next() {
    if (!host.isConnected) return;
    const mode = vP(MODES[clkDiff]), answer = randTime();
    q = { mode, answer };
    if (mode === "a2d" || mode === "d2a") { q.list = distractors(answer, 3); q.fmt24 = Math.random() < .5; }
    else if (mode === "conv") { q.list = distractors(answer, clkDiff === "hard" ? 4 : 3, true); q.a12 = Math.random() < .5; } // a12: يُعرَضُ 12h ← تُختارُ 24h
    render();
  }
  const head = cur => `${vsScoreHtml(ps)}${vsTurnHtml(cur)}${(clkTimed && !cur.cpu) ? '<div class="clk-timebar"><span id="clkbar"></span></div>' : ''}`;
  function render() {
    const cur = ps[turn]; if (!host.isConnected) return; lock = false; cancelTimer();
    ({ a2d: renderA2D, d2a: renderD2A, type: renderType, set: renderSet, conv: renderConv }[q.mode] || renderA2D)(cur);
    if (clkTimed && !cur.cpu) armTimer();   // «ضدّ الوقت»: عدّادٌ لدورِ اللاعب
  }
  // عقارب → اختَرِ الرقميّ
  function renderA2D(cur) {
    host.innerHTML = `<div style="text-align:center">${head(cur)}
      <div class="clk-bubble">${L.qA2D}</div><div class="clk-face-slot"></div>
      <div class="clk-opts">${q.list.map((o, i) => `<button class="clk-opt" data-i="${i}">${bare(o)}</button>`).join("")}</div></div>`;
    host.querySelector(".clk-face-slot").appendChild(makeFace(q.answer, {}));
    if (cur.cpu) return aiPickOption();
    host.querySelectorAll(".clk-opt").forEach(b => b.onclick = () => { if (lock) return; lock = true; sfx.tap(); markOption(b, eq(q.list[+b.dataset.i], q.answer)); resolve(eq(q.list[+b.dataset.i], q.answer)); });
  }
  // تحويلٌ 12↔24 (صباح/مساء): يُعرَضُ الوقتُ بنظامٍ ← اختَرْ مقابلَه في النظامِ الآخر.
  function renderConv(cur) {
    const shown = q.a12 ? dig12(q.answer, L) : dig24(q.answer);
    host.innerHTML = `<div style="text-align:center">${head(cur)}
      <div class="clk-bubble">${q.a12 ? L.qConv12 : L.qConv24}</div><div class="clk-target">${shown}</div>
      <div class="clk-opts">${q.list.map((o, i) => `<button class="clk-opt" data-i="${i}">${q.a12 ? dig24(o) : dig12(o, L)}</button>`).join("")}</div></div>`;
    if (cur.cpu) return aiPickOption();
    host.querySelectorAll(".clk-opt").forEach(b => b.onclick = () => { if (lock) return; lock = true; sfx.tap(); markOption(b, eq(q.list[+b.dataset.i], q.answer)); resolve(eq(q.list[+b.dataset.i], q.answer)); });
  }
  // رقميٌّ → اختَرِ العقارب
  function renderD2A(cur) {
    const shown = q.fmt24 ? dig24(q.answer) : dig12(q.answer, L);
    host.innerHTML = `<div style="text-align:center">${head(cur)}
      <div class="clk-bubble">${L.qD2A}</div><div class="clk-target">${shown}</div>
      <div class="clk-opts" id="faceOpts"></div></div>`;
    const wrap = host.querySelector("#faceOpts");
    q.list.forEach((o, i) => { const b = document.createElement("button"); b.className = "clk-facebtn"; b.dataset.i = i; b.appendChild(makeFace(o, { size: 118 })); wrap.appendChild(b); });
    if (cur.cpu) return aiPickOption(true);
    wrap.querySelectorAll(".clk-facebtn").forEach(b => b.onclick = () => { if (lock) return; lock = true; sfx.tap(); markOption(b, eq(q.list[+b.dataset.i], q.answer)); resolve(eq(q.list[+b.dataset.i], q.answer)); });
  }
  // عقارب → اكتبِ الوقت
  function renderType(cur) {
    host.innerHTML = `<div style="text-align:center">${head(cur)}
      <div class="clk-bubble">${L.qType}</div><div class="clk-face-slot"></div>
      <div class="clk-type"><input id="tH" type="number" min="1" max="12" inputmode="numeric" placeholder="${L.hourPh}"><span class="colon">:</span><input id="tM" type="number" min="0" max="59" inputmode="numeric" placeholder="${L.minPh}"></div>
      <button class="clk-check" id="tGo">${L.check}</button></div>`;
    host.querySelector(".clk-face-slot").appendChild(makeFace(q.answer, {}));
    if (cur.cpu) { setTimeout(() => aiFill(), 1100 + Math.random() * 700); return; }
    host.querySelector("#tGo").onclick = () => {
      if (lock) return; const h = +host.querySelector("#tH").value, m = +host.querySelector("#tM").value;
      if (!h || h < 1 || h > 12 || isNaN(m) || m < 0 || m > 59) return; lock = true; sfx.tap();
      resolve(same({ h12: h, m }, q.answer));
    };
  }
  // رقميٌّ → حرّكِ العقارب
  function renderSet(cur) {
    setState = { h12: 12, m: 0, pm: false };
    const shown = q.fmt24 !== false && Math.random() < .5 ? dig24(q.answer) : dig12(q.answer, L);
    q._shown = shown;
    host.innerHTML = `<div style="text-align:center">${head(cur)}
      <div class="clk-bubble">${L.qSet}</div><div class="clk-target">${shown}</div><div class="clk-face-slot"></div>
      <button class="clk-check" id="sGo">${L.check}</button></div>`;
    host.querySelector(".clk-face-slot").appendChild(makeFace(setState, { drag: !cur.cpu }));
    if (cur.cpu) { setTimeout(() => aiFill(), 1200 + Math.random() * 800); return; }
    host.querySelector("#sGo").onclick = () => { if (lock) return; lock = true; sfx.tap(); resolve(same(setState, q.answer)); };
  }
  // الآليُّ يختارُ خيارًا (بطاقةً أو زرًّا)
  function aiPickOption(faces) {
    if (!host.isConnected) return; lock = true;
    const ci = q.list.findIndex(o => eq(o, q.answer));
    const pick = Math.random() < AIPR[clkDiff] ? ci : Math.floor(Math.random() * q.list.length);
    const btn = host.querySelectorAll(faces ? ".clk-facebtn" : ".clk-opt")[pick];
    setTimeout(() => { if (!host.isConnected) return; markOption(btn, eq(q.list[pick], q.answer)); resolve(eq(q.list[pick], q.answer)); }, 700 + Math.random() * 500);
  }
  // الآليُّ يملأُ (كتابة/ضبط): ينجحُ باحتمالٍ حسبَ الصعوبة
  function aiFill() { if (!host.isConnected) return; lock = true; resolve(Math.random() < AIPR[clkDiff]); }
  function markOption(btn, ok) {
    try {
      if (btn) btn.classList.add(ok ? "ok" : "no");
      if (!ok) { const ci = q.list.findIndex(o => eq(o, q.answer)); const nodes = host.querySelectorAll(".clk-opt, .clk-facebtn"); if (nodes[ci]) nodes[ci].classList.add("ok"); }
    } catch (e) {}
  }
  function resolve(ok) {
    if (!host.isConnected) return; lock = true; cancelTimer();
    if (ok) ps[turn].score++;
    // تفاعلُ الآليّ + نطقُ الوقتِ داخلَ try كي لا يمنعَ خطأٌ عارضٌ (صوت/DOM) انتقالَ الدور.
    try { if (ok) robo.applaud(); else sfx.nope(); sayTime(lang, q.answer, speakPhrase, AMPM_MODE[q.mode]); } catch (e) {}
    // الانتقالُ مجدولٌ دائمًا بعدَ الـtry (لا يُعلَقُ الدورُ أبدًا).
    if (ps.some(p => p.score >= TARGET)) { setTimeout(end, 1300); return; }
    setTimeout(() => { if (!host.isConnected) return; turn = (turn + 1) % ps.length; next(); }, 1500);
  }
  function end() { opts.onWin && opts.onWin(); vsEndRound(ps, { game: "تحدّي الساعة", diff: ({ easy: "سهل", medium: "متوسّط", hard: "صعب" }[diff] || ""), onAgain: newRound, onExit: opts.onExit || (() => clockGame(host, opts)) }); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
}
