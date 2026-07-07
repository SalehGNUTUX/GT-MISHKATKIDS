// src/orient-widget.js — وحدةُ «الزمانِ والمكان» (v1.5): الاتجاهاتُ (بوصلةٌ + كرةٌ أرضيّة) · الفصولُ · فتراتُ اليوم.
// بطاقاتٌ تعليميّةٌ + اختباراتٌ تنافسيّةٌ (versus) — مشترَكةٌ بين العربيّة (clock.html) واللغات (lang.html).
// محلّيٌّ بالكامل. النطقُ عبر دالّةٍ مُمرَّرةٍ speak(text) (عربيّ: espeak · أجنبيّ: Piper).
import { robo } from "./robo-companion.js";
import { vsSetup, vsMakePlayers, vsScoreHtml, vsTurnHtml, vsEndRound, vP, sfx } from "./versus.js";
import { DIRECTIONS, SEASONS, DAYPARTS, nameOf } from "../content/orient.js";

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .or-wrap{max-width:640px;margin:8px auto;text-align:center}
  .or-bubble{background:color-mix(in srgb,var(--sky,#6FB3D6) 14%,var(--card,#fff));border:1px solid var(--line,#ECE6DA);border-radius:14px;padding:10px 14px;font-size:14px;color:var(--ink,#2B2B2B);max-width:460px;margin:6px auto;line-height:1.7}
  .or-two{display:flex;gap:14px;justify-content:center;align-items:center;flex-wrap:wrap;margin:10px 0}
  .or-svg{width:min(66vw,240px);height:min(66vw,240px);touch-action:none;user-select:none}
  .or-dir{cursor:pointer}
  .or-tiles{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:12px 0}
  .or-tile{background:var(--card,#fff);border:2px solid var(--line,#ECE6DA);border-radius:18px;padding:16px 14px;min-width:120px;cursor:pointer;transition:transform .1s,border-color .15s}
  .or-tile:active{transform:scale(.96)} .or-tile.on{border-color:var(--primary,#E07A5F)}
  .or-tile .e{font-size:44px} .or-tile .n{font-weight:800;font-size:19px;margin-top:4px} .or-tile .t{color:var(--muted,#6B6B6B);font-size:12.5px;margin-top:4px;min-height:16px}
  .or-timeline{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:12px 0}
  .or-per{background:var(--card,#fff);border:1px solid var(--line,#ECE6DA);border-radius:14px;padding:10px;min-width:82px;cursor:pointer;transition:transform .1s}
  .or-per:active{transform:scale(.95)} .or-per.night{background:color-mix(in srgb,#3a3a6a 14%,var(--card,#fff))}
  .or-per .e{font-size:30px} .or-per .n{font-weight:800;font-size:14px;margin-top:2px}
  .or-opts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:12px 0}
  .or-opt{background:var(--card,#fff);border:2px solid var(--line,#ECE6DA);border-radius:14px;padding:14px 20px;font-weight:800;font-size:18px;cursor:pointer;min-width:110px;transition:transform .1s}
  .or-opt.big{font-size:40px;padding:12px 18px} .or-opt:active{transform:scale(.96)}
  .or-opt.ok{background:var(--good,#7BB661);color:#fff;border-color:var(--good,#7BB661)} .or-opt.no{background:var(--bad,#E0566B);color:#fff;border-color:var(--bad,#E0566B)}
  .or-q{font-weight:800;font-size:20px;margin:6px 0}`;
  document.head.appendChild(st);
}

const NS = "http://www.w3.org/2000/svg";
const svgEl = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
const rad = d => (d - 90) * Math.PI / 180;

// ===== بوصلةٌ تفاعليّة =====
export function makeCompass(lang, onPick) {
  const svg = svgEl("svg", { viewBox: "0 0 200 200", class: "or-svg or-dir" });
  svg.appendChild(svgEl("circle", { cx: 100, cy: 100, r: 94, fill: "var(--card,#fff)", stroke: "var(--primary,#E07A5F)", "stroke-width": 4 }));
  svg.appendChild(svgEl("circle", { cx: 100, cy: 100, r: 6, fill: "var(--primary-d,#C7613F)" }));
  // إبرةُ الشمال (نصفٌ أحمرُ لأعلى)
  const needle = svgEl("polygon", { points: "100,20 108,100 100,110 92,100", fill: "var(--bad,#E0566B)" });
  svg.appendChild(needle);
  svg.appendChild(svgEl("polygon", { points: "100,180 108,100 100,90 92,100", fill: "var(--muted,#9a9a9a)" }));
  // الأحرفُ + مناطقُ النقر
  DIRECTIONS.forEach(d => {
    const a = rad(d.deg), r = d.prime ? 74 : 78, fs = d.prime ? 20 : 12;
    const short = lang === "ar" ? { n: "ش", ne: "شق", e: "ق", se: "جق", s: "ج", sw: "جغ", w: "غ", nw: "شغ" }[d.k] : (d[lang] || d.en).split(/[-\s]/).map(w => w[0].toUpperCase()).join("");
    const t = svgEl("text", { x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a), "text-anchor": "middle", "dominant-baseline": "central", fill: d.prime ? "var(--ink,#2B2B2B)" : "var(--muted,#8a8a8a)", "font-weight": d.prime ? "800" : "600", "font-size": fs, style: "cursor:pointer" });
    t.textContent = short; t.addEventListener("click", () => onPick && onPick(d)); svg.appendChild(t);
    // منطقةُ نقرٍ أوسع
    const hit = svgEl("circle", { cx: 100 + r * Math.cos(a), cy: 100 + r * Math.sin(a), r: 16, fill: "transparent", style: "cursor:pointer" });
    hit.addEventListener("click", () => onPick && onPick(d)); svg.appendChild(hit);
  });
  return svg;
}

// ===== كرةٌ أرضيّةٌ مبسّطة =====
export function makeGlobe() {
  const svg = svgEl("svg", { viewBox: "0 0 200 200", class: "or-svg" });
  svg.appendChild(svgEl("circle", { cx: 100, cy: 100, r: 88, fill: "#4C8BF5", stroke: "var(--line,#cfd8e3)", "stroke-width": 3 }));
  // قارّاتٌ خضراءُ (كتلٌ حرّة)
  const land = "M60 70 q20 -14 40 -4 q18 8 8 26 q-16 14 -34 6 q-22 -8 -14 -28 Z M120 110 q22 -8 30 12 q6 20 -16 24 q-24 2 -24 -18 q0 -14 10 -18 Z M70 130 q16 -6 26 8 q6 16 -12 20 q-20 2 -22 -14 q-1 -10 8 -14 Z";
  svg.appendChild(svgEl("path", { d: land, fill: "#7BB661", opacity: ".95" }));
  // خطُّ الاستواءِ ومدارٌ رأسيّ
  svg.appendChild(svgEl("ellipse", { cx: 100, cy: 100, rx: 88, ry: 30, fill: "none", stroke: "#ffffff", "stroke-width": 1.3, opacity: ".5" }));
  svg.appendChild(svgEl("ellipse", { cx: 100, cy: 100, rx: 30, ry: 88, fill: "none", stroke: "#ffffff", "stroke-width": 1.3, opacity: ".5" }));
  // أقطابٌ واتّجاهات
  const cap = (x, y, txt, col) => { const t = svgEl("text", { x, y, "text-anchor": "middle", "dominant-baseline": "central", fill: col, "font-weight": "800", "font-size": 15 }); t.textContent = txt; svg.appendChild(t); };
  cap(100, 22, "N", "#fff"); cap(100, 178, "S", "#fff"); cap(178, 100, "E", "#fff"); cap(22, 100, "W", "#fff");
  return svg;
}

// ===== بطاقةُ الاتجاهات =====
// opts={ lang, speak, L }
export function attachDirections(host, opts = {}) {
  ensureStyle();
  const lang = opts.lang || "ar", speak = opts.speak || (() => {}), L = opts.L || AR_L;
  host.innerHTML = `<div class="or-wrap"><div class="or-bubble">${L.dirIntro}</div>
    <div class="or-two"><div class="cslot"></div><div class="gslot"></div></div>
    <div class="or-q" id="orLbl" style="font-size:18px;min-height:24px"></div>
    <div class="or-bubble" style="max-width:420px">${L.qibla}</div></div>`;
  const lbl = host.querySelector("#orLbl");
  host.querySelector(".cslot").appendChild(makeCompass(lang, d => { lbl.textContent = nameOf(d, lang); try { speak(nameOf(d, lang)); } catch (e) {} }));
  host.querySelector(".gslot").appendChild(makeGlobe());
}

// ===== بطاقةُ الفصول =====
export function attachSeasons(host, opts = {}) {
  ensureStyle();
  const lang = opts.lang || "ar", speak = opts.speak || (() => {}), L = opts.L || AR_L;
  const traitK = lang === "en" ? "enTrait" : lang === "fr" ? "frTrait" : "arTrait";
  host.innerHTML = `<div class="or-wrap"><div class="or-bubble">${L.seasonsIntro}</div>
    <div class="or-tiles">${SEASONS.map(s => `<div class="or-tile" data-k="${s.k}"><div class="e">${s.emoji}</div><div class="n">${nameOf(s, lang)}</div><div class="t">${s[traitK] || ""}</div></div>`).join("")}</div></div>`;
  host.querySelectorAll(".or-tile").forEach(el => el.onclick = () => {
    host.querySelectorAll(".or-tile").forEach(x => x.classList.remove("on")); el.classList.add("on");
    const s = SEASONS.find(x => x.k === el.dataset.k); try { speak(nameOf(s, lang)); } catch (e) {}
  });
}

// ===== بطاقةُ فتراتِ اليوم =====
export function attachDayparts(host, opts = {}) {
  ensureStyle();
  const lang = opts.lang || "ar", speak = opts.speak || (() => {}), L = opts.L || AR_L;
  host.innerHTML = `<div class="or-wrap"><div class="or-bubble">${L.daypartsIntro}</div>
    <div class="or-timeline">${DAYPARTS.map(p => `<div class="or-per${p.night ? " night" : ""}" data-k="${p.k}"><div class="e">${p.emoji}</div><div class="n">${nameOf(p, lang)}</div></div>`).join("")}</div></div>`;
  host.querySelectorAll(".or-per").forEach(el => el.onclick = () => {
    const p = DAYPARTS.find(x => x.k === el.dataset.k); try { speak(nameOf(p, lang)); } catch (e) {}
  });
}

// ===== اختبارٌ تنافسيٌّ عامّ (رمز↔اسم) لأيّ موضوع =====
// opts={ items, lang, speak, title, L, onExit, onWin }
export function orientQuiz(host, opts = {}) {
  ensureStyle();
  const items = opts.items, lang = opts.lang || "ar", speak = opts.speak || (() => {}), L = opts.L || AR_L, TARGET = 5;
  let ps = [], turn = 0, lock = false, q = null, diff = "easy";
  vsSetup(host, {
    say: `${opts.title} — ${L.quizSay}`, soloOk: true,
    diffs: [{ v: "easy", label: "سهل" }, { v: "hard", label: "صعب" }],
    getDiff: () => diff, setDiff: v => diff = v, start: newRound
  });
  const nm = it => nameOf(it, lang);
  function newRound() { ps = vsMakePlayers(); ps.forEach(p => p.score = 0); turn = 0; lock = false; next(); }
  function pickN(ans, n) { const out = [ans]; const pool = shuffle(items.filter(x => x !== ans)); while (out.length < n && pool.length) out.push(pool.pop()); return shuffle(out); }
  function next() {
    if (!host.isConnected) return;
    const mode = Math.random() < .5 ? "e2n" : "n2e";     // رمز→اسم · اسم→رمز
    const answer = vP(items), list = pickN(answer, diff === "hard" ? 4 : 3);
    q = { mode, answer, list }; render();
  }
  function render() {
    const cur = ps[turn]; if (!host.isConnected) return; lock = false;
    const prompt = q.mode === "e2n"
      ? `<div style="font-size:64px">${q.answer.emoji}</div><div class="or-q">${L.qName}</div>`
      : `<div class="or-q">${nm(q.answer)}</div><div class="hint">${L.qPick}</div>`;
    const opts = q.list.map((o, i) => q.mode === "e2n"
      ? `<button class="or-opt" data-i="${i}">${nm(o)}</button>`
      : `<button class="or-opt big" data-i="${i}">${o.emoji}</button>`).join("");
    host.innerHTML = `<div class="or-wrap" style="text-align:center">${vsScoreHtml(ps)}${vsTurnHtml(cur)}${prompt}<div class="or-opts">${opts}</div></div>`;
    if (cur.cpu) return aiPlay();
    host.querySelectorAll(".or-opt").forEach(b => b.onclick = () => { if (lock) return; lock = true; sfx.tap(); pick(+b.dataset.i, b); });
  }
  function aiPlay() {
    lock = true; const ci = q.list.indexOf(q.answer);
    const pr = diff === "hard" ? .8 : .62, idx = Math.random() < pr ? ci : Math.floor(Math.random() * q.list.length);
    setTimeout(() => { if (!host.isConnected) return; const b = host.querySelectorAll(".or-opt")[idx]; pick(idx, b); }, 700 + Math.random() * 600);
  }
  function pick(i, btn) {
    if (!host.isConnected) return; lock = true;
    const ok = q.list[i] === q.answer;
    try {
      if (btn) btn.classList.add(ok ? "ok" : "no");
      if (!ok) { const cb = host.querySelectorAll(".or-opt")[q.list.indexOf(q.answer)]; if (cb) cb.classList.add("ok"); }
    } catch (e) {}
    if (ok) ps[turn].score++;
    try { if (ok) robo.applaud(); else sfx.wrong(); speak(nm(q.answer)); } catch (e) {}
    if (ps.some(p => p.score >= TARGET)) { setTimeout(end, 1300); return; }
    setTimeout(() => { if (!host.isConnected) return; turn = (turn + 1) % ps.length; next(); }, 1400);
  }
  function end() { opts.onWin && opts.onWin(); vsEndRound(ps, { onAgain: newRound, onExit: opts.onExit || (() => orientQuiz(host, opts)) }); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
}

// الترجماتُ الافتراضيّة (عربيّة)
export const AR_L = {
  dirIntro: "🧭 الاتجاهاتُ الأربعةُ الأصليّة: شمال · جنوب · شرق · غرب. اضغطْ على البوصلةِ لتسمعَ كلَّ اتّجاه.",
  qibla: "🕌 القِبلةُ هي اتّجاهُ الكعبةِ المشرّفةِ التي نتوجّهُ إليها في الصلاة.",
  seasonsIntro: "🍂 فصولُ السنةِ الأربعة — اضغطْ كلَّ فصلٍ لتسمعَ اسمَه وتعرفَ صفتَه.",
  daypartsIntro: "🌅 فتراتُ اليومِ والليل بالترتيب — اضغطْ كلَّ فترةٍ لتسمعَ اسمَها.",
  quizSay: "تنافَسْ في المطابقة!", qName: "ما اسمُ هذا؟", qPick: "اختَرِ الرمزَ المطابق", quiz: "اختبار",
};
