// src/visual-play.js — أنشطةُ الإدراكِ البصريّ (v1.9 · دفعة ب): 🔍 جِدِ المختلف (…ثمّ البازلُ والتلوين).
// وحدةٌ مستقلّةٌ عن play.html — وتستوردُ الإطارَ التنافسيَّ المركزيَّ (versus.js) لا نسخَ play.html المحلّيّة
// (انظر pitfalls ب‑1: التكرارُ مصدرُ الأخطاء). تتلقّى من الصفحةِ ما يخصُّها فقط: view وزرَّ الرجوع.
// كلُّ الرسومِ SVG محلّيّةٌ أصيلة.
import { robo } from "./robo-companion.js";
import { logEvent, byAge } from "./progress.js";
import { speak } from "./speak.js";
import { GAME_INTROS as GI, NOTICES } from "./robo-phrases.js";
import { vsSetup, vsMakePlayers, vsScoreHtml, vsTurnHtml, vsEndRound, vsStartIndex, vP, GAME as GR, sfx } from "./versus.js";

let ctx = null;          // { view, backBar, wireBack }
let run = false;         // حارسُ المؤقّتاتِ والذكاء: يُطفأُ عند الرجوعِ إلى القائمة
let raf = null, tmo = null;
const rand = n => Math.floor(Math.random() * n);
const pick = a => a[rand(a.length)];

export function initVisualPlay(c) { ctx = c; ensureStyle(); JG.n = byAge([2, 3, 4], JG.n); } // حجمُ البازلِ بحسبِ العمر (v1.9)
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

/* ======================================================================
   🧩 بازلُ الصور — من صورِ القصصِ المصوّرةِ نفسِها: لوحاتُ «رحلةِ الأرقام» (webp) ورسومُ STORY_ART (SVG).
   اضغطْ قطعتَين لتتبادلا مكانَيهما (أيسرُ للأصابعِ الصغيرة من السحب). 2×2 · 3×3 · 4×4.
   المصادرُ تُحمَّلُ عند الطلبِ فقط (import ديناميكيّ) فلا يثقلُ play.html.
   ====================================================================== */
const JG = { n: 2, pics: null, pic: null, order: [], sel: -1, moves: 0, done: false, last: null, peek: false };
let jgStyled = false;
function jgStyle() {
  if (jgStyled) return; jgStyled = true;
  const st = document.createElement("style");
  st.textContent = `
  .jg-chips{display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:4px 0}
  .jg-chip{background:var(--card,#fff);border:1px solid var(--line,#ECE6DA);border-radius:999px;padding:6px 14px;font-size:14px;cursor:pointer;font-family:inherit;color:var(--muted,#6B6B6B)}
  .jg-chip.on{background:var(--primary,#E07A5F);border-color:var(--primary,#E07A5F);color:#fff;font-weight:700}
  .jg-prompt{text-align:center;font-size:16px;font-weight:700;margin:6px 4px}
  .jg-tools{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:6px 0}
  .jg-tools button{background:var(--card,#fff);border:1px solid var(--line,#ECE6DA);border-radius:12px;padding:9px 16px;font-size:15px;cursor:pointer;font-family:inherit;color:var(--ink,#2B2B2B)}
  .jg-board{display:grid;gap:3px;width:min(100%,440px);margin:6px auto;background:var(--line,#ECE6DA);border:3px solid var(--line,#ECE6DA);border-radius:14px;overflow:hidden;direction:ltr;transition:gap .5s,border-color .5s}
  .jg-board.done{gap:0;border-color:#4f8a3a}
  .jg-t{border:0;padding:0;margin:0;cursor:pointer;background-repeat:no-repeat;position:relative;transition:transform .15s,outline-color .2s;outline:3px solid transparent;outline-offset:-3px}
  .jg-t.sel{outline-color:var(--primary,#E07A5F);transform:scale(.93);z-index:1}
  .jg-t.in::after{content:"";position:absolute;inset:auto 4px 4px auto;width:7px;height:7px;border-radius:50%;background:#4f8a3a;opacity:.8}
  .jg-board.done .jg-t::after{display:none}
  .jg-t.swap{animation:jgSwap .3s}
  @keyframes jgSwap{50%{transform:scale(.88)}}
  @media (prefers-reduced-motion:reduce){.jg-t.swap{animation:none}.jg-board{transition:none}}
  .jg-peek{width:min(60%,220px);margin:4px auto;display:block;border-radius:10px;border:2px solid var(--line,#ECE6DA)}
  .jg-info{text-align:center;font-size:14px;color:var(--muted,#6B6B6B);margin:2px 0}
  .jg-done{text-align:center;font-size:17px;margin:6px}
  .jg-done a{color:var(--primary-d,#B5482F);font-weight:700}`;
  document.head.appendChild(st);
}
async function jgLoadPics() {
  if (JG.pics) return JG.pics;
  const [{ default: data }, { STORY_ART }] = await Promise.all([import("../content/stories.js"), import("./story-art.js")]);
  const list = [], seen = new Set();
  for (const s of (data.stories || data)) for (const pg of (s.pages || [])) {
    const key = pg.img || pg.art; if (!key || seen.has(key)) continue; seen.add(key);
    if (pg.img) list.push({ key, url: pg.img, ar: 792 / 600, story: s.id, title: s.title });
    else if (STORY_ART[pg.art]) list.push({ key, url: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(STORY_ART[pg.art]), ar: 320 / 200, story: s.id, title: s.title });
  }
  return (JG.pics = list);
}
export async function startJigsaw() {
  stopVisualPlay(); jgStyle();
  ctx.view.innerHTML = ctx.backBar() + `<div class="jg-info">… تحميلُ الصور</div>`; ctx.wireBack();
  const pics = await jgLoadPics();
  if (!pics.length) { ctx.view.innerHTML = ctx.backBar() + `<div class="jg-info">لا صورَ متاحة.</div>`; ctx.wireBack(); return; }
  jgNew();
  try { robo.say(NOTICES.jigsawIntro, "ask"); } catch (e) {}
}
function jgNew() {
  // رسومُ SVG فيها مساحاتٌ سادةٌ واسعة: في 3×3 و4×4 تتشابهُ قطعٌ كثيرةٌ تمامًا فيُرتِّبُها الطفلُ صحيحةً بالعين
  // ولا تُحتسَب. لذا الأحجامُ الكبيرةُ من اللوحاتِ المصوّرةِ الغنيّةِ بالتفاصيلِ وحدَها، وSVG لـ2×2 فقط.
  const fit = JG.n >= 3 ? JG.pics.filter(p => !p.url.startsWith("data:")) : JG.pics;
  const pool = (fit.length ? fit : JG.pics).filter(p => p.key !== JG.last);
  JG.pic = pick(pool.length ? pool : JG.pics); JG.last = JG.pic.key;
  const N = JG.n * JG.n;
  // خلطٌ يضمنُ ألّا تبدأَ محلولةً ولا تبقى قطعةٌ واحدةٌ فقط في غيرِ مكانِها
  do { JG.order = shuffleArr(Array.from({ length: N }, (_, i) => i)); } while (JG.order.filter((v, i) => v !== i).length < Math.min(N, 3));
  JG.sel = -1; JG.moves = 0; JG.done = false; JG.peek = false;
  jgRender();
}
const shuffleArr = a => { for (let k = a.length - 1; k > 0; k--) { const j = rand(k + 1); [a[k], a[j]] = [a[j], a[k]]; } return a; };
function jgTileStyle(piece) {
  const n = JG.n, r = Math.floor(piece / n), c = piece % n, pos = v => n === 1 ? 0 : (v / (n - 1)) * 100;
  return `background-image:url('${JG.pic.url}');background-size:${n * 100}% ${n * 100}%;background-position:${pos(c)}% ${pos(r)}%`;
}
function jgRender() {
  const { view, backBar, wireBack } = ctx, n = JG.n;
  const chip = (v, t) => `<button class="jg-chip${JG.n === v ? " on" : ""}" data-n="${v}">${t}</button>`;
  const inPlace = JG.order.filter((v, i) => v === i).length;
  view.innerHTML = backBar()
    + `<div class="jg-chips">${chip(2, "سهل · 4 قطع")}${chip(3, "متوسّط · 9")}${chip(4, "صعب · 16")}</div>`
    + `<div class="jg-prompt">${JG.done ? "🎉 اكتملتِ الصورة!" : "اضغطْ قطعتَين لتتبادلا مكانَيهما — رتِّبِ الصورة"}</div>`
    + `<div class="jg-board${JG.done ? " done" : ""}" id="jgb" style="grid-template-columns:repeat(${n},1fr);aspect-ratio:${JG.pic.ar}">`
    + JG.order.map((piece, i) => `<button class="jg-t${piece === i && !JG.done ? " in" : ""}${i === JG.sel ? " sel" : ""}" data-i="${i}" aria-label="قطعة" style="${jgTileStyle(piece)}"></button>`).join("")
    + `</div>`
    + (JG.done
      ? `<div class="jg-done">من قصّةِ «${esc(JG.pic.title)}» — <a href="stories.html?story=${encodeURIComponent(JG.pic.story)}">اقرأِ القصّة 📖</a></div>`
      : `<div class="jg-info">الحركات: <b>${JG.moves}</b> · في مكانِها: <b>${inPlace}</b> من ${n * n}</div>`
        + (JG.peek ? `<img class="jg-peek" src="${JG.pic.url}" alt="الصورةُ كاملة">` : ""))
    + `<div class="jg-tools">`
    + (JG.done ? "" : `<button id="jgpeek">${JG.peek ? "🙈 أخفِ الصورة" : "👀 الصورة"}</button>`)
    + `<button id="jgnext">🔀 صورةٌ أخرى</button></div>`;
  wireBack();
  view.querySelectorAll(".jg-chip[data-n]").forEach(b => b.onclick = () => { JG.n = +b.dataset.n; jgNew(); });
  view.querySelector("#jgnext").onclick = jgNew;
  const pk = view.querySelector("#jgpeek"); if (pk) pk.onclick = () => { JG.peek = !JG.peek; jgRender(); };
  view.querySelector("#jgb").addEventListener("click", e => { const t = e.target.closest("[data-i]"); if (t) jgTap(+t.dataset.i); });
}
function jgTap(i) {
  if (JG.done) return;
  if (JG.sel < 0) { JG.sel = i; sfx.tap(); jgRender(); return; }
  if (JG.sel === i) { JG.sel = -1; jgRender(); return; }      // نقرٌ ثانٍ على المختارةِ يُلغي الاختيار
  const a = JG.sel, o = JG.order; [o[a], o[i]] = [o[i], o[a]]; JG.sel = -1; JG.moves++;
  const fixed = (o[a] === a) + (o[i] === i);
  if (o.every((v, k) => v === k)) { JG.done = true; jgRender(); sfx.success();
    logEvent("jigsaw_done", { n: JG.n, moves: JG.moves });
    try { robo.cheer(NOTICES.jigsawDone); } catch (e) {}
    return; }
  if (fixed) sfx.success(); else sfx.tap();
  jgRender();
  for (const k of [a, i]) document.querySelector(`#jgb [data-i="${k}"]`)?.classList.add("swap");
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ======================================================================
   🎨 التلوين — رسوماتٌ SVG أصيلةٌ بمناطقَ مغلقة. ثلاثةُ أنماط:
   حُرّ (أيُّ لونٍ لأيِّ منطقة) · حسبَ الرقم · حسبَ الحرف (لونُ المنطقةِ مكتوبٌ فيها؛ اللونُ الخطأُ يهتزُّ ولا يُحتسَب).
   «💾 احفظْ في أعمالي» يُحوِّلُ الرسمةَ إلى PNG ويضيفُها إلى «📂 أعمالي» (src/works.js).
   ====================================================================== */
// الألوانُ مرقّمةٌ 1..10 (الرقمُ/الحرفُ المكتوبُ في المنطقةِ = موضعُ اللونِ هنا)
const CL_PAL = [
  { c: "#E0566B", n: "أحمر" }, { c: "#F28C38", n: "برتقاليّ" }, { c: "#F4C95D", n: "أصفر" }, { c: "#7BB661", n: "أخضر" },
  { c: "#4C8BF5", n: "أزرق" }, { c: "#9B6DD6", n: "بنفسجيّ" }, { c: "#8B5A2B", n: "بنّيّ" }, { c: "#F28FB1", n: "ورديّ" },
  { c: "#8FD3F0", n: "سماويّ" }, { c: "#4A4A4A", n: "رماديٌّ داكن" },
];
const CL_LET = ["أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر"];
// كلُّ منطقة: s = عنصرُ SVG بلا fill، n = رقمُ لونِها (1..10)، at = موضعُ الرقم، f = حجمُ خطِّه (اختياريّ)
const CL_PICS = [
  { id: "house", name: "البيت", regions: [
    { s: `<rect x="0" y="0" width="200" height="140"/>`, n: 9, at: [22, 22] },
    { s: `<rect x="0" y="140" width="200" height="60"/>`, n: 4, at: [22, 175] },
    { s: `<circle cx="165" cy="35" r="18"/>`, n: 3, at: [165, 35] },
    { s: `<rect x="122" y="50" width="13" height="30"/>`, n: 7, at: [128.5, 62], f: 9 },
    { s: `<rect x="50" y="90" width="100" height="70"/>`, n: 8, at: [68, 140] },
    { s: `<polygon points="40,92 100,42 160,92"/>`, n: 1, at: [100, 74] },
    { s: `<rect x="86" y="118" width="24" height="42"/>`, n: 7, at: [98, 140] },
    { s: `<rect x="120" y="104" width="20" height="18"/>`, n: 5, at: [130, 113], f: 10 },
  ] },
  { id: "fish", name: "السمكة", regions: [
    { s: `<rect x="0" y="0" width="200" height="165"/>`, n: 5, at: [20, 20] },
    { s: `<path d="M0 165 Q50 152 100 162 T200 160 V200 H0 Z"/>`, n: 3, at: [100, 184] },
    { s: `<path d="M150 165 Q140 130 155 110 Q168 95 158 75 Q178 100 166 125 Q158 145 165 165 Z"/>`, n: 4, at: [158, 135], f: 9 },
    { s: `<polygon points="128,90 170,62 162,92 170,122"/>`, n: 1, at: [156, 92] },
    { s: `<path d="M84 72 Q100 46 118 70 Z"/>`, n: 1, at: [101, 63], f: 9 },
    { s: `<ellipse cx="85" cy="92" rx="48" ry="28"/>`, n: 2, at: [96, 98] },
    { s: `<circle cx="62" cy="86" r="7"/>`, n: 10, at: [62, 86], f: 0 },
    { s: `<circle cx="40" cy="45" r="7"/>`, n: 9, at: [40, 45], f: 8 },
    { s: `<circle cx="26" cy="68" r="5"/>`, n: 9, at: [26, 68], f: 0 },
  ] },
  { id: "butterfly", name: "الفراشة", regions: [
    { s: `<path d="M98 95 Q60 20 22 45 Q5 75 50 95 Z"/>`, n: 6, at: [52, 66] },
    { s: `<path d="M102 95 Q140 20 178 45 Q195 75 150 95 Z"/>`, n: 6, at: [148, 66] },
    { s: `<path d="M98 100 Q55 105 40 140 Q55 170 98 118 Z"/>`, n: 8, at: [66, 132] },
    { s: `<path d="M102 100 Q145 105 160 140 Q145 170 102 118 Z"/>`, n: 8, at: [134, 132] },
    { s: `<circle cx="45" cy="60" r="9"/>`, n: 3, at: [45, 60], f: 9 },
    { s: `<circle cx="155" cy="60" r="9"/>`, n: 3, at: [155, 60], f: 9 },
    { s: `<ellipse cx="100" cy="105" rx="7" ry="38"/>`, n: 7, at: [100, 108], f: 9 },
    { s: `<circle cx="100" cy="62" r="9"/>`, n: 10, at: [100, 62], f: 0 },
  ], extra: `<path d="M96 56 Q86 34 78 30 M104 56 Q114 34 122 30" fill="none" stroke="#333" stroke-width="2"/>` },
  { id: "tree", name: "الشجرة", regions: [
    { s: `<rect x="0" y="0" width="200" height="150"/>`, n: 9, at: [20, 20] },
    { s: `<rect x="0" y="150" width="200" height="50"/>`, n: 4, at: [24, 178] },
    { s: `<rect x="90" y="110" width="20" height="62"/>`, n: 7, at: [100, 145] },
    { s: `<path d="M100 22 C150 22 165 60 150 85 C170 110 130 130 100 118 C70 130 30 110 50 85 C35 60 50 22 100 22 Z"/>`, n: 4, at: [100, 50] },
    { s: `<circle cx="72" cy="80" r="9"/>`, n: 1, at: [72, 80], f: 9 },
    { s: `<circle cx="125" cy="70" r="9"/>`, n: 1, at: [125, 70], f: 9 },
    { s: `<circle cx="104" cy="98" r="9"/>`, n: 1, at: [104, 98], f: 9 },
    { s: `<circle cx="168" cy="30" r="14"/>`, n: 3, at: [168, 30] },
  ] },
  { id: "car", name: "السيّارة", regions: [
    { s: `<rect x="0" y="0" width="200" height="140"/>`, n: 9, at: [20, 20] },
    { s: `<rect x="0" y="140" width="200" height="60"/>`, n: 10, at: [20, 178] },
    { s: `<path d="M20 135 V108 Q22 98 34 96 L62 94 L80 66 H138 L160 94 Q182 96 184 110 V135 Z"/>`, n: 1, at: [44, 120] },
    { s: `<polygon points="86,72 106,72 106,94 70,94"/>`, n: 9, at: [94, 85], f: 9 },
    { s: `<polygon points="112,72 134,72 152,94 112,94"/>`, n: 9, at: [124, 85], f: 9 },
    { s: `<circle cx="60" cy="138" r="17"/>`, n: 10, at: [60, 138], f: 0 },
    { s: `<circle cx="148" cy="138" r="17"/>`, n: 10, at: [148, 138], f: 0 },
    { s: `<circle cx="60" cy="138" r="7"/>`, n: 3, at: [60, 138], f: 8 },
    { s: `<circle cx="148" cy="138" r="7"/>`, n: 3, at: [148, 138], f: 8 },
    { s: `<rect x="172" y="108" width="10" height="8"/>`, n: 3, at: [177, 112], f: 0 },
  ] },
  { id: "flower", name: "الزهرة", regions: [
    { s: `<rect x="96" y="80" width="8" height="70"/>`, n: 4, at: [100, 128], f: 0 },
    { s: `<path d="M100 130 Q70 110 60 125 Q75 140 100 136 Z"/>`, n: 4, at: [78, 127], f: 9 },
    { s: `<path d="M100 115 Q130 95 140 110 Q125 125 100 121 Z"/>`, n: 4, at: [122, 112], f: 9 },
    ...[0, 1, 2, 3, 4, 5].map(i => { const a = (i * 60 - 90) * Math.PI / 180, x = +(100 + 24 * Math.cos(a)).toFixed(1), y = +(62 + 24 * Math.sin(a)).toFixed(1);
      return { s: `<circle cx="${x}" cy="${y}" r="15"/>`, n: 8, at: [+(100 + 30 * Math.cos(a)).toFixed(1), +(62 + 30 * Math.sin(a)).toFixed(1)], f: 9 }; }),
    { s: `<circle cx="100" cy="62" r="13"/>`, n: 3, at: [100, 62] },
    { s: `<path d="M62 150 H138 L128 192 H72 Z"/>`, n: 2, at: [100, 172] },
  ] },
];
const CL = { mode: "num", pic: null, fills: [], sel: 1, last: null };
export function startColoring() { stopVisualPlay(); jgStyle(); clStyle(); clNew(); try { robo.say(NOTICES.colorIntro, "ask"); } catch (e) {} }
let clStyled = false;
function clStyle() {
  if (clStyled) return; clStyled = true;
  const st = document.createElement("style");
  st.textContent = `
  .cl-svg{width:min(100%,400px);display:block;margin:4px auto;background:#fff;border:2px solid var(--line,#ECE6DA);border-radius:14px;touch-action:manipulation}
  .cl-svg [data-r]{cursor:pointer;transition:fill .2s}
  .cl-svg .cl-lbl{font:700 12px system-ui,sans-serif;fill:#555;text-anchor:middle;dominant-baseline:central;pointer-events:none}
  .cl-svg .cl-lbl.done{display:none}
  .cl-svg .shake{animation:clShake .35s}
  @keyframes clShake{25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
  @media (prefers-reduced-motion:reduce){.cl-svg .shake{animation:none}}
  .cl-pal{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;max-width:420px;margin:6px auto}
  .cl-sw{width:40px;height:40px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px var(--line,#ddd);cursor:pointer;font:800 15px system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.55);padding:0}
  .cl-sw.on{box-shadow:0 0 0 3px var(--ink,#2B2B2B);transform:scale(1.12)}
  .cl-sw.eraser{background:#fff;color:#888;text-shadow:none}
  .cl-msg{text-align:center;min-height:24px;font-size:15px;margin:4px}`;
  document.head.appendChild(st);
}
function clNew(id) {
  const pool = CL_PICS.filter(p => p.id !== CL.last);
  CL.pic = id ? CL_PICS.find(p => p.id === id) : pick(pool); CL.last = CL.pic.id;
  CL.fills = CL.pic.regions.map(() => null); CL.sel = 1; clRender();
}
const clLabel = n => CL.mode === "abc" ? CL_LET[n - 1] : String(n);
// الرسمةُ نفسُها (للعرضِ وللحفظ): withLabels=false للحفظِ صورةً نظيفة
function clSvgMarkup(withLabels) {
  const P = CL.pic, guided = CL.mode !== "free";
  const regs = P.regions.map((r, i) => `<g data-r="${i}" fill="${CL.fills[i] || "#fff"}" stroke="#333" stroke-width="1.6" stroke-linejoin="round">${r.s}</g>`).join("");
  const lbls = !withLabels || !guided ? "" : P.regions.map((r, i) => r.f === 0 ? ""
    : `<text class="cl-lbl${CL.fills[i] === CL_PAL[r.n - 1].c ? " done" : ""}" x="${r.at[0]}" y="${r.at[1]}" style="font-size:${r.f || 12}px">${clLabel(r.n)}</text>`).join("");
  return `<svg class="cl-svg" id="clsvg" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${regs}${P.extra || ""}${lbls}</svg>`;
}
// منطقةٌ بلا رقمٍ ظاهر (f:0 — صغيرةٌ جدًّا) تُلوَّنُ تلقائيًّا في النمطِ الموجَّه ليكتملَ الرسمُ دونَ تخمين
function clAutoSmall() { if (CL.mode === "free") return; CL.pic.regions.forEach((r, i) => { if (r.f === 0) CL.fills[i] = CL_PAL[r.n - 1].c; }); }
function clDone() { return CL.mode !== "free" && CL.pic.regions.every((r, i) => CL.fills[i] === CL_PAL[r.n - 1].c); }
function clRender(msg) {
  const { view, backBar, wireBack } = ctx, guided = CL.mode !== "free";
  clAutoSmall();
  const chip = (v, t) => `<button class="jg-chip${CL.mode === v ? " on" : ""}" data-m="${v}">${t}</button>`;
  const sw = CL_PAL.map((p, k) => `<button class="cl-sw${CL.sel === k + 1 ? " on" : ""}" data-c="${k + 1}" style="background:${p.c}" title="${p.n}" aria-label="${p.n}">${guided ? clLabel(k + 1) : ""}</button>`).join("")
    + (guided ? "" : `<button class="cl-sw eraser${CL.sel === 0 ? " on" : ""}" data-c="0" title="ممحاة" aria-label="ممحاة">⌫</button>`);
  view.innerHTML = backBar()
    + `<div class="jg-chips">${chip("free", "حُرّ")}${chip("num", "حسبَ الرقم")}${chip("abc", "حسبَ الحرف")}</div>`
    + `<div class="jg-prompt">${guided ? `لوِّنْ «${CL.pic.name}»: لونُ كلِّ منطقةٍ هو ${CL.mode === "abc" ? "حرفُها" : "رقمُها"}` : `لوِّنْ «${CL.pic.name}» كما تحبّ`}</div>`
    + clSvgMarkup(true)
    + `<div class="cl-pal" id="clpal">${sw}</div>`
    + `<div class="cl-msg" id="clmsg">${msg || ""}</div>`
    + `<div class="jg-tools"><button id="clsave">💾 احفظْ في أعمالي</button><button id="clclear">🧹 امسحْ</button><button id="clnext">🔀 رسمةٌ أخرى</button></div>`;
  wireBack();
  view.querySelectorAll(".jg-chip[data-m]").forEach(b => b.onclick = () => { CL.mode = b.dataset.m; CL.fills = CL.pic.regions.map(() => null); CL.sel = 1; clRender(); });
  view.querySelector("#clpal").addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (!b) return; CL.sel = +b.dataset.c; sfx.tap();
    view.querySelectorAll(".cl-sw").forEach(x => x.classList.toggle("on", x === b)); });
  view.querySelector("#clsvg").addEventListener("click", e => { const g = e.target.closest("[data-r]"); if (g) clTap(+g.dataset.r, g); });
  view.querySelector("#clclear").onclick = () => { CL.fills = CL.pic.regions.map(() => null); clRender(); };
  view.querySelector("#clnext").onclick = () => clNew();
  view.querySelector("#clsave").onclick = clSave;
}
function clTap(i, g) {
  const r = CL.pic.regions[i];
  if (CL.mode !== "free" && CL.sel !== r.n) {           // اللونُ ليس لونَ هذه المنطقة: اهتزازٌ وتلميحٌ لطيف
    g.classList.remove("shake"); void g.getBBox(); g.classList.add("shake"); sfx.nope();
    const m = document.getElementById("clmsg"); if (m) m.textContent = `هذه المنطقةُ لونُها ${clLabel(r.n)} — ${CL_PAL[r.n - 1].n}`;
    return;
  }
  CL.fills[i] = CL.sel === 0 ? null : CL_PAL[CL.sel - 1].c; sfx.tap();
  if (clDone()) { clRender(`🎉 أحسنت! اكتملَ «${CL.pic.name}» — احفظْه في أعمالِك`); sfx.success(); logEvent("color_done", { pic: CL.pic.id, mode: CL.mode });
    try { robo.cheer(NOTICES.colorDone); } catch (e) {} return; }
  // تحديثٌ موضعيٌّ دونَ إعادةِ رسمِ الصفحة (أسرعُ وأهدأُ للعين)
  g.setAttribute("fill", CL.fills[i] || "#fff");
  const lbl = document.querySelectorAll("#clsvg .cl-lbl"); // تُطابَقُ بالفهرسِ بين المناطقِ ذاتِ الرقمِ الظاهر
  let k = -1; CL.pic.regions.forEach((rr, j) => { if (rr.f !== 0) { k++; if (j === i && lbl[k]) lbl[k].classList.toggle("done", CL.fills[i] === CL_PAL[rr.n - 1].c); } });
  const m = document.getElementById("clmsg"); if (m) m.textContent = "";
}
async function clSave() {
  const msg = t => { const m = document.getElementById("clmsg"); if (m) m.textContent = t; };
  if (!CL.fills.some(Boolean)) { msg("لوِّنْ شيئًا أوّلًا 🙂"); return; }
  msg("… أحفظُ رسمتَك");
  try {
    const src = clSvgMarkup(false).replace(' class="cl-svg" id="clsvg"', ' width="600" height="600"');
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src); });
    const cv = document.createElement("canvas"); cv.width = cv.height = 600;
    const g2 = cv.getContext("2d"); g2.fillStyle = "#fff"; g2.fillRect(0, 0, 600, 600); g2.drawImage(img, 0, 0, 600, 600);
    const blob = await new Promise(res => cv.toBlob(res, "image/png"));
    const { saveWork } = await import("./works.js");
    const ok = blob && await saveWork({ id: "color:" + CL.pic.id, title: `🎨 تلوين: ${CL.pic.name}`, domain: "رسوماتي", blob });
    if (!ok) throw new Error("save");
    msg("✅ حُفِظَتْ في «📂 أعمالي»"); logEvent("color_saved", { pic: CL.pic.id });
    try { robo.say(NOTICES.colorSaved, "happy"); } catch (e) {}
  } catch (e) { msg("تعذّرَ الحفظ — جرِّبْ مرّةً أخرى"); }
}
