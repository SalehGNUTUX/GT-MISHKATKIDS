// src/listen-play.js — أنشطةُ السمع (v1.9 · دفعة ج): 🔊 ذاكرةُ الأصوات.
// البطاقاتُ مقلوبة؛ بطاقةُ الصوتِ تُنطَقُ عند قلبِها. نمطان: «صوت ↔ صوت» (زوجٌ بالصوتِ نفسِه) و«صوت ↔ كتابة»
// (الصوتُ يطابقُ الحرفَ/الكلمةَ المكتوبة — يربطُ السمعَ بالقراءة). المحتوى من مقاطعَ موجودةٍ أصلًا:
// أسماءُ الحروف (letters.js) والكلمات (words.js) — كلُّها في tts-manifest فلا يلزمُ توليد.
// تنافسيٌّ بالإطارِ المركزيّ versus.js (لا نسخَ play.html المحلّيّة — pitfalls ب‑1).
import { robo } from "./robo-companion.js";
import { logEvent } from "./progress.js";
import { speak } from "./speak.js";
import { ICONS } from "./icons.js";
import { GAME_INTROS as GI } from "./robo-phrases.js";
import { vsSetup, vsMakePlayers, vsScoreHtml, vsTurnHtml, vsEndRound, vsStartIndex, vP, GAME as GR, sfx } from "./versus.js";
import LETTERS from "../content/letters.js";
import WORDS from "../content/words.js";

let ctx = null;          // { view, backBar, wireBack }
let run = false;
let raf = null, tmo = null;
const rand = n => Math.floor(Math.random() * n);
const shuffle = a => { for (let k = a.length - 1; k > 0; k--) { const j = rand(k + 1); [a[k], a[j]] = [a[j], a[k]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function initListenPlay(c) { ctx = c; ensureStyle(); }
export function stopListenPlay() { run = false; cancelAnimationFrame(raf); clearTimeout(tmo); }

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .sm-opts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:2px 0 8px}
  .sm-opts button{background:var(--card,#fff);border:1px solid var(--line,#ECE6DA);border-radius:999px;padding:6px 14px;font-size:14px;cursor:pointer;font-family:inherit;color:var(--muted,#6B6B6B)}
  .sm-opts button.on{background:var(--primary,#E07A5F);border-color:var(--primary,#E07A5F);color:#fff;font-weight:700}
  .sm-lbl{text-align:center;font-size:13px;color:var(--muted,#6B6B6B);margin-top:6px}
  .sm-grid{display:grid;gap:8px;width:min(100%,440px);margin:8px auto}
  .sm-card{aspect-ratio:1;border-radius:14px;border:2px solid var(--line,#ECE6DA);cursor:pointer;font-family:inherit;padding:4px;position:relative;
    display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--primary,#E07A5F),var(--primary-d,#B5482F));color:#fff;transition:transform .15s}
  .sm-card:active{transform:scale(.94)}
  .sm-card svg{width:42%;height:42%;fill:currentColor;opacity:.9}
  .sm-card .q{font-size:28px;font-weight:800;opacity:.9}
  .sm-card.open{background:var(--card,#fff);color:var(--ink,#2B2B2B);border-color:var(--primary,#E07A5F)}
  .sm-card.open.snd svg{fill:var(--primary,#E07A5F);animation:smPulse .8s infinite alternate}
  .sm-card .tx{font-size:clamp(18px,7vw,34px);font-weight:800;line-height:1.5}
  .sm-card.done{background:#EEF6E9;border-color:#4f8a3a;color:#2f5a22;cursor:default}
  html[data-theme="dark"] .sm-card.done{background:#22351c;color:#cfe9c2}
  .sm-card.done svg{animation:none;fill:#4f8a3a}
  .sm-card .who{position:absolute;inset:auto 4px 3px auto;font-size:11px;font-weight:800}
  @keyframes smPulse{to{transform:scale(1.15)}}
  @media (prefers-reduced-motion:reduce){.sm-card.open.snd svg{animation:none}}
  .sm-bar{height:9px;background:var(--line,#ECE6DA);border-radius:99px;overflow:hidden;max-width:320px;margin:6px auto 4px}
  .sm-bar span{display:block;height:100%;background:var(--primary);width:100%}
  .sm-msg{text-align:center;min-height:24px;font-size:15px;margin:4px}`;
  document.head.appendChild(st);
}

/* ======================================================================
   🔊 ذاكرةُ الأصوات
   ====================================================================== */
// الحيواناتُ: كلماتُ words.js التي رمزُها حيوان (الرمزُ لا يُعرَض — الكلمةُ وحدَها)
const ANIMAL_EMOJI = /[\u{1F400}-\u{1F43F}\u{1F980}-\u{1F9AE}\u{1F54A}\u{1F577}]/u;
const POOLS = {
  letters: () => LETTERS.letters.map(l => ({ say: l.name, show: l.char })),
  words:   () => WORDS.words.map(w => ({ say: w.word, show: w.word })),
  animals: () => WORDS.words.filter(w => ANIMAL_EMOJI.test(w.emoji || "")).map(w => ({ say: w.word, show: w.word })),
};
const SM = { diff: "easy", kind: "letters", mode: "ss", timed: true, ps: [], turn: 0, cards: [], open: [], lock: false, seen: new Map(), moves: 0 };
const SM_CFG = { easy: { pairs: 4, cols: 4, recall: 0.35, ms: 12000 }, medium: { pairs: 6, cols: 4, recall: 0.6, ms: 12000 }, hard: { pairs: 8, cols: 4, recall: 0.85, ms: 12000 } };
const SPEAKER = () => ICONS.sound || "🔊";

export function startSoundMemory() {
  stopListenPlay();
  const { view, backBar, wireBack } = ctx;
  view.innerHTML = backBar() + `<div id="smopts"></div><div id="smhost"></div>`; wireBack();
  smOpts();
  vsSetup(document.getElementById("smhost"), {
    say: GI.soundmem, soloOk: true,
    diffs: [{ v: "easy", label: "سهل · 4 أزواج" }, { v: "medium", label: "متوسّط · 6" }, { v: "hard", label: "صعب · 8" }],
    getDiff: () => SM.diff, setDiff: v => { SM.diff = v; },
    toggle: { label: "⏱️ اللعبُ ضدّ الوقت", get: () => SM.timed, set: v => { SM.timed = v; } },
    start: newSoundMemory,
  });
  try { speak(GI.soundmem); } catch (e) {}
}
// خياراتُ المحتوى والنمط فوقَ شاشةِ الإعدادِ المشتركة (vsSetup يُعيدُ رسمَ مضيفِه فقط فتبقى هذه)
function smOpts() {
  const b = (k, v, t) => `<button data-k="${k}" data-v="${v}" class="${SM[k] === v ? "on" : ""}">${t}</button>`;
  const host = document.getElementById("smopts"); if (!host) return;
  host.innerHTML = `<div class="sm-lbl">ماذا نسمع؟</div><div class="sm-opts">${b("kind", "letters", "الحروف")}${b("kind", "words", "الكلمات")}${b("kind", "animals", "الحيوانات")}</div>`
    + `<div class="sm-lbl">الزوجُ هو</div><div class="sm-opts">${b("mode", "ss", "صوت ↔ صوت")}${b("mode", "st", "صوت ↔ كتابة")}</div>`;
  host.querySelectorAll("button[data-k]").forEach(x => x.onclick = () => { SM[x.dataset.k] = x.dataset.v; smOpts(); });
}
function newSoundMemory() {
  run = true; SM.ps = vsMakePlayers(); SM.ps.forEach(p => p.score = 0);
  SM.turn = vsStartIndex(SM.ps); SM.lock = false; SM.open = []; SM.seen = new Map(); SM.moves = 0;
  const n = SM_CFG[SM.diff].pairs, items = shuffle(POOLS[SM.kind]()).slice(0, n);
  // كلُّ عنصرٍ يُنتجُ بطاقتَين بالمفتاحِ نفسِه: صوتَين، أو صوتًا وكتابة
  SM.cards = shuffle(items.flatMap((it, k) => [
    { key: k, say: it.say, show: it.show, type: "snd" },
    { key: k, say: it.say, show: it.show, type: SM.mode === "st" ? "txt" : "snd" },
  ])).map((c, i) => ({ ...c, i, done: false, by: null }));
  const opts = document.getElementById("smopts"); if (opts) opts.remove();
  smRender(); smTurnStart();
}
function smRender(msg) {
  const { view, backBar, wireBack } = ctx, cur = SM.ps[SM.turn];
  const face = c => {
    const open = c.done || SM.open.includes(c.i);
    if (!open) return `<button class="sm-card" data-i="${c.i}" aria-label="بطاقة مقلوبة"><span class="q">?</span></button>`;
    const body = c.type === "snd" && !c.done ? SPEAKER() : `<span class="tx">${esc(c.show)}</span>`;
    const who = c.done && c.by != null && SM.ps.length > 1 ? `<span class="who" style="color:${SM.ps[c.by].color}">${SM.ps[c.by].avatar}</span>` : "";
    return `<button class="sm-card open${c.type === "snd" ? " snd" : ""}${c.done ? " done" : ""}" data-i="${c.i}" aria-label="${esc(c.show)}">${body}${who}</button>`;
  };
  view.innerHTML = backBar()
    + `<div class="clue" style="padding:10px"><div class="say">🔊 ${SM.mode === "st" ? "طابقِ الصوتَ بكتابتِه" : "جِدِ الصوتَين المتطابقَين"} — اضغطْ بطاقةً مفتوحةً لتسمعَها ثانيةً</div></div>`
    + vsScoreHtml(SM.ps) + (SM.ps.length > 1 ? vsTurnHtml(cur) : `<div class="sm-lbl">المحاولات: <b>${SM.moves}</b></div>`)
    + (SM.timed && SM.ps.length > 1 ? `<div class="sm-bar"><span id="smbar"></span></div>` : "")
    + `<div class="sm-grid" id="smgrid" style="grid-template-columns:repeat(${SM_CFG[SM.diff].cols},1fr)">${SM.cards.map(face).join("")}</div>`
    + `<div class="sm-msg" id="smmsg">${msg || ""}</div>`;
  wireBack();
  document.getElementById("smgrid").addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) smTap(+b.dataset.i); });
}
function smTimer(ms, onEnd) {
  const start = Date.now(); cancelAnimationFrame(raf);
  const tick = () => { if (!run) { cancelAnimationFrame(raf); return; }
    const left = ms - (Date.now() - start), bar = document.getElementById("smbar");
    if (bar) bar.style.width = Math.max(0, left / ms * 100) + "%";
    if (left <= 0) { onEnd && onEnd(); return; } raf = requestAnimationFrame(tick); };
  tick();
}
function smTurnStart() {
  if (!run) return;
  const cur = SM.ps[SM.turn];
  if (cur.cpu) { SM.lock = true; tmo = setTimeout(smAI, 900); return; }
  SM.lock = false;
  // مهلةُ الدورِ في وضعِ اللاعبَين فقط (وحدَك لا خصمَ ينتظر): انقضاؤُها يُغلقُ المفتوحَ ويُمرِّرُ الدور
  if (SM.timed && SM.ps.length > 1) smTimer(SM_CFG[SM.diff].ms, () => { if (!run) return; SM.lock = true; SM.open = []; smRender("⏱️ انتهى الوقت"); tmo = setTimeout(smPass, 900); });
}
function smPass() { if (!run) return; SM.turn = (SM.turn + 1) % SM.ps.length; SM.open = []; smRender(); smTurnStart(); }
// قلبُ بطاقة: تُنطَقُ إن كانت صوتًا، وتُحفَظُ في ذاكرةِ الآليّ
function smFlip(i) {
  const c = SM.cards[i]; SM.open.push(i); SM.seen.set(i, c.key);
  smRender();
  if (c.type === "snd") { try { speak(c.say); } catch (e) {} } else sfx.tap();
}
function smTap(i) {
  const c = SM.cards[i];
  if (c.done || SM.open.includes(i)) { if (c.type === "snd" || c.done) { try { speak(c.say); } catch (e) {} } return; } // إعادةُ سماع
  if (SM.lock || SM.ps[SM.turn].cpu || SM.open.length >= 2) return;
  smFlip(i);
  if (SM.open.length === 2) { cancelAnimationFrame(raf); SM.lock = true; tmo = setTimeout(smCheck, 1500); }
}
function smCheck() {
  if (!run) return;
  const [a, b] = SM.open.map(i => SM.cards[i]), cur = SM.ps[SM.turn], human = !cur.cpu;
  SM.moves++;
  if (a.key === b.key) {
    a.done = b.done = true; a.by = b.by = SM.turn; cur.score++; SM.open = [];
    smRender(`✅ «${esc(a.show)}»`); sfx.success();
    try { speak(a.say); } catch (e) {}
    if (human) logEvent("soundmem_match");
    if (SM.cards.every(x => x.done)) { tmo = setTimeout(smEnd, 1400); return; }
    if (human && Math.random() < 0.5) robo.cheer(vP(GR.ok), { female: cur.female });
    tmo = setTimeout(smTurnStart, 1300);     // من وجدَ زوجًا يلعبُ ثانيةً (قاعدةُ الذاكرة)
  } else {
    if (human && SM.ps.length > 1) robo.encourage(vP(GR.no), { female: cur.female }); else sfx.nope();
    tmo = setTimeout(() => { SM.open = []; if (SM.ps.length > 1) smPass(); else { smRender(); smTurnStart(); } }, 900);
  }
}
// الآليّ: يتذكّرُ ما رآه باحتماليّةٍ بحسبِ الصعوبة — زوجٌ معروفٌ أوّلًا، وإلّا بطاقةٌ مجهولةٌ ثمّ شريكُها إن عرفَه
function smAI() {
  if (!run) return;
  const recall = SM_CFG[SM.diff].recall, hidden = SM.cards.filter(c => !c.done).map(c => c.i);
  const known = hidden.filter(i => SM.seen.has(i) && Math.random() < recall);
  let first = null, second = null;
  for (const i of known) { const j = known.find(k => k !== i && SM.cards[k].key === SM.cards[i].key); if (j != null) { first = i; second = j; break; } }
  if (first == null) {
    const unseen = hidden.filter(i => !SM.seen.has(i));
    first = (unseen.length ? unseen : hidden)[rand((unseen.length ? unseen : hidden).length)];
  }
  smFlip(first);
  tmo = setTimeout(() => {
    if (!run) return;
    if (second == null) {
      const partner = hidden.find(k => k !== first && SM.cards[k].key === SM.cards[first].key);
      const remembers = partner != null && SM.seen.has(partner) && Math.random() < recall;
      const rest = hidden.filter(k => k !== first);
      second = remembers ? partner : rest[rand(rest.length)];
    }
    smFlip(second);
    tmo = setTimeout(smCheck, 1500);
  }, 1400);
}
function smEnd() {
  if (!run) return;
  logEvent("soundmem_win");
  const kind = { letters: "الحروف", words: "الكلمات", animals: "الحيوانات" }[SM.kind];
  if (SM.ps.length === 1) { // وحدَك: النتيجةُ عددُ المحاولات
    smRender(`🎉 وجدتَ كلَّ الأزواجِ في <b>${SM.moves}</b> محاولة!`);
    try { robo.cheer(vP(GR.ok)); } catch (e) {}
    const m = document.getElementById("smmsg");
    if (m) { m.insertAdjacentHTML("beforeend", `<div style="margin-top:8px"><button class="vs-start" id="smagain">↻ جولةٌ جديدة</button></div>`); document.getElementById("smagain").onclick = startSoundMemory; }
    return;
  }
  vsEndRound(SM.ps, { game: `ذاكرةُ الأصوات · ${kind}`, diff: ({ easy: "سهل", medium: "متوسّط", hard: "صعب" }[SM.diff] || ""), onAgain: newSoundMemory, onExit: startSoundMemory });
}
