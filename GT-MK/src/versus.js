// src/versus.js — إطارٌ تنافسيٌّ مشترك (ضدّ الآليّ بثلاث صعوبات · الإخوة · الوالد) يعملُ في أيّ صفحة.
// يحقنُ أنماطَه مرّةً فلا يعتمدُ على CSS الصفحة. مبنيٌّ على إطار play.html التنافسيّ ومعمَّمٌ لـv1.4.
import { getCurrentUser, listProfiles, getProfile, getParentName, getParentAvatar } from "./accounts.js";
import { robo } from "./robo-companion.js";
import * as sfx from "./sfx.js";
import { GAME_REACTIONS as GR } from "./robo-phrases.js";

// جنسُ الوالدِ في اللعبِ التنافسيّ (أب/أم) — يختارُه الابنُ عند «ضدّ الوالد»، محفوظٌ ليبقى بين الجلسات.
const PGEN_KEY = "tilmithi_vs_parentgender";
function loadParentFemale() { try { return localStorage.getItem(PGEN_KEY) === "f"; } catch (e) { return false; } }
export const VS = { opp: "ai", ai: "medium", parentFemale: loadParentFemale() };  // اختيارٌ مشترَكٌ يبقى بين الألعاب
export function setParentFemale(f) { VS.parentFemale = !!f; try { localStorage.setItem(PGEN_KEY, f ? "f" : "m"); } catch (e) {} }
export const VS_COLA = "#E0566B", VS_COLB = "#4C8BF5";
export const vP = a => a[Math.floor(Math.random() * a.length)];

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .vs-set{max-width:580px;margin:14px auto;background:var(--card,#fff);border:1px solid var(--line,#ECE6DA);border-radius:18px;padding:18px 16px;box-shadow:var(--shadow,0 6px 20px rgba(0,0,0,.08))}
  .vs-row{margin:0 0 16px} .vs-lbl{font-weight:800;font-size:14px;color:var(--muted,#6B6B6B);margin-bottom:8px}
  .vs-lvl{display:flex;gap:8px;flex-wrap:wrap}
  .vs-lvl button{background:var(--card,#fff);border:1px solid var(--line,#ECE6DA);border-radius:999px;padding:9px 16px;font-size:15px;cursor:pointer;font-family:inherit;color:var(--muted,#6B6B6B)}
  .vs-lvl button.on{background:var(--primary,#E07A5F);color:#fff;border-color:var(--primary,#E07A5F)}
  .vs-start{width:100%;margin-top:4px;padding:14px;border:none;border-radius:14px;font-weight:800;font-family:inherit;font-size:16px;cursor:pointer;background:var(--primary,#E07A5F);color:#fff;transition:transform .12s,background .12s}
  .vs-start:active{transform:scale(.98)}
  .vs-turn{display:flex;align-items:center;justify-content:center;gap:8px;width:fit-content;max-width:92%;margin:10px auto 14px;
    font-weight:800;font-size:19px;padding:9px 22px;border-radius:999px;border:2px solid currentColor;
    background:color-mix(in srgb,currentColor 14%,var(--card,#fff));box-shadow:0 4px 16px color-mix(in srgb,currentColor 30%,transparent);
    animation:vsTurn .55s cubic-bezier(.34,1.56,.64,1)}
  @keyframes vsTurn{0%{transform:scale(.6) translateY(-10px);opacity:0}55%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
  .vs-score{display:flex;justify-content:center;gap:14px;margin:8px 0 4px;flex-wrap:wrap}
  .vs-chip{font-weight:800;font-size:15px;border-radius:999px;padding:5px 14px;border:2px solid}
  /* نافذةُ نهاية الجولة (مركزيّة، لكلّ الألعاب) */
  .vs-ov{position:fixed;inset:0;z-index:200;display:flex;align-items:center;justify-content:center;background:rgba(20,20,25,.55);padding:20px;font-family:inherit;animation:vsIn .2s ease}
  @keyframes vsIn{from{opacity:0}to{opacity:1}}
  .vs-modal{background:var(--card,#fff);color:var(--ink,#2B2B2B);border-radius:24px;box-shadow:0 16px 48px rgba(0,0,0,.32);max-width:430px;width:100%;padding:26px 22px;text-align:center;animation:vsPop .3s cubic-bezier(.34,1.56,.64,1)}
  @keyframes vsPop{from{transform:scale(.82)}to{transform:scale(1)}}
  .vs-win-t{font-size:27px;font-weight:800;margin-bottom:14px;line-height:1.3}
  .vs-win-s{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:14px}
  .vs-win-r{background:color-mix(in srgb,var(--primary,#E07A5F) 10%,var(--card,#fff));border:1px solid var(--line,#ECE6DA);border-radius:14px;padding:11px 12px;font-size:15px;margin-bottom:18px;line-height:1.9}
  .vs-win-b{display:flex;gap:10px;justify-content:center;margin-bottom:12px;flex-wrap:wrap}
  .vs-win-b button{border:none;border-radius:14px;padding:12px 22px;font-size:16px;font-weight:800;cursor:pointer;font-family:inherit;transition:transform .1s}
  .vs-win-b button:active{transform:scale(.96)}
  .vs-again{background:var(--primary,#E07A5F);color:#fff} .vs-exit{background:var(--bg,#f4efe6);border:1px solid var(--line,#ECE6DA);color:var(--ink,#2B2B2B)}
  .vs-reset{background:none;border:none;color:var(--muted,#6B6B6B);font-size:13px;cursor:pointer;font-family:inherit;text-decoration:underline}`;
  document.head.appendChild(st);
}

function meCard() { const u = getCurrentUser(); return (u && u.name) ? { name: u.name, avatar: u.avatar || "🙂", female: u.gender === "f" } : { name: "أنت", avatar: "🧒", female: false }; }
function siblings() { const u = getCurrentUser(); return listProfiles().filter(p => !u || p.id !== u.id).map(p => ({ key: "p:" + p.id, name: p.name, avatar: p.avatar || "🙂" })); }

// يبني لاعبَين حسب VS.opp (أو لاعبًا واحدًا للفرد؛ forceTwo يُجبرُ خصمًا للألعاب الثنائيّة).
// كلُّ لاعبٍ بشريٍّ يحملُ female (لتجنيسِ خطابِ الآليِّ له)؛ الآليُّ بلا female (يتحدّثُ عن نفسه).
// مَن يبدأُ الجولةَ التالية: أوّلُ لعبةٍ يبدؤها **صاحبُ الحساب**، ثمّ يبدأُ **الفائزُ** في كلِّ جولةٍ تالية
// (والتعادلُ يُعيدُ البدءَ لصاحبِ الحساب). تُستدعى في كلِّ لعبةٍ بدلَ تثبيتِ turn=0.
let vsNextStarter = null;   // اسمُ الفائزِ الأخير (null = صاحبُ الحساب)
export function vsStartIndex(players) {
  if (!vsNextStarter || !players || players.length < 2) return 0;
  const i = players.findIndex(p => p.name === vsNextStarter);
  return i > 0 ? i : 0;
}
export function vsResetStarter() { vsNextStarter = null; }   // بدءُ سلسلةٍ جديدة (تغييرُ الخصمِ/الإعدادات)
export function vsMakePlayers(forceTwo) {
  const me = meCard(), m = { ...me, role: "me", score: 0, cpu: false, color: VS_COLA };
  if (VS.opp === "ai") return [m, { name: "الآليّ", avatar: "🤖", role: "ai", score: 0, cpu: true, color: VS_COLB }];
  if (VS.opp === "parent") return [m, { name: getParentName(), avatar: getParentAvatar(), role: "parent", score: 0, cpu: false, female: VS.parentFemale, color: VS_COLB }];
  if (VS.opp.startsWith("p:")) { const p = getProfile(VS.opp.slice(2)); return [m, { name: p ? p.name : "اللاعب 2", avatar: (p && p.avatar) || "🙂", role: "sibling", score: 0, cpu: false, female: !!(p && p.gender === "f"), color: VS_COLB }]; }
  return forceTwo ? [m, { name: "الآليّ", avatar: "🤖", role: "ai", score: 0, cpu: true, color: VS_COLB }] : [m];
}

export function vsReact(p0, p1) {
  const f = p0 && p0.female;   // p0 = اللاعبُ البشريُّ صاحبُ النتيجة — يُخاطَبُ بجنسه
  if (!p1) { robo.cheer(undefined, { female: f }); return; }
  if (p1.cpu) { if (p0.score > p1.score) robo.read(vP(GR.beatai), { female: f }); else if (p1.score > p0.score) robo.read(vP(GR.aiwon), { female: f }); else robo.read(vP(GR.tie), { female: f }); }
  else robo.read(vP(GR.kids));   // مباراةُ بشريَّين: صيغةُ المثنّى (أحسنتُما) محايدةٌ جنسًا
}
export const GAME = GR; // ok/no/aiok/beatai/... للاستعمال المباشر
// حبّةُ «دورُ اللاعب» المبهجةُ الموحّدة (تظهرُ بحركةٍ عند كلّ تبديل). تُستعمَلُ في كلّ الألعاب.
export function vsTurnHtml(p) {
  ensureStyle();
  // «دورُكَ/دورُكِ يا X» حسبَ جنسِ اللاعبِ الحاليّ (الوالد/الأخ/الابن كلٌّ بجنسه) — بناءٌ مباشرٌ لأنّ الكافَ هنا مجرّدة.
  const turn = `${p.avatar} ${p.female ? "دورُكِ" : "دورُكَ"} يا ${p.name}! 🎉`;
  return `<div class="vs-turn" style="color:${p.color}">${p.cpu ? "🤖 دورُ الآليّ…" : turn}</div>`;
}
export function vsScoreHtml(ps) { return `<div class="vs-score">` + ps.map(p => { const w = vsWins[p.name] || 0; return `<span class="vs-chip" style="border-color:${p.color};color:${p.color}">${p.avatar} ${p.name}: ${p.score}${w ? ` <b style="opacity:.8">🏅${w}</b>` : ""}</span>`; }).join("") + `</div>`; }

// شاشةُ الإعداد داخل host. cfg={ say, diffLabel?, diffs:[{v,label}], getDiff, setDiff, start, soloOk? }
export function vsSetup(host, cfg) {
  ensureStyle();
  vsResetStarter();   // شاشةُ الإعدادِ = سلسلةٌ جديدة ⇒ يبدأُ صاحبُ الحسابِ أوّلَ جولة
  const sibs = siblings();
  if (!cfg.soloOk && VS.opp === "solo") VS.opp = "ai";
  const opp = (cfg.soloOk ? `<button data-opp="solo" class="${VS.opp === "solo" ? "on" : ""}">🧒 وحدي</button>` : "")
    + `<button data-opp="ai" class="${VS.opp === "ai" ? "on" : ""}">🤖 ضدّ الآليّ</button>`
    + sibs.map(s => `<button data-opp="${s.key}" class="${VS.opp === s.key ? "on" : ""}">${s.avatar} ${s.name}</button>`).join("")
    + `<button data-opp="parent" class="${VS.opp === "parent" ? "on" : ""}">${getParentAvatar()} ${getParentName()}</button>`;
  const dh = cfg.diffs.map(d => `<button data-d="${d.v}" class="${cfg.getDiff() == d.v ? "on" : ""}">${d.label}</button>`).join("");
  host.innerHTML = `<div class="clue" style="padding:12px"><div class="say">${cfg.say}</div></div>
    <div class="vs-set">
      <div class="vs-row"><div class="vs-lbl">${cfg.diffLabel || "🎚️ الصعوبة"}</div><div class="vs-lvl" id="vsD">${dh}</div></div>
      <div class="vs-row"><div class="vs-lbl">👥 اللعبُ مع</div><div class="vs-lvl" id="vsO">${opp}</div></div>
      <div class="vs-row" id="vsPR" style="${VS.opp === "parent" ? "" : "display:none"}"><div class="vs-lbl">👤 مَن سيلعب؟ (ليخاطبَه الآليُّ صحيحًا)</div><div class="vs-lvl" id="vsP"><button data-pg="m" class="${!VS.parentFemale ? "on" : ""}">👨 أب</button><button data-pg="f" class="${VS.parentFemale ? "on" : ""}">👩 أم</button></div></div>
      <div class="vs-row" id="vsAR" style="${VS.opp === "ai" ? "" : "display:none"}"><div class="vs-lbl">🤖 مستوى الآليّ</div><div class="vs-lvl" id="vsA"><button data-ai="easy" class="${VS.ai === "easy" ? "on" : ""}">سهل</button><button data-ai="medium" class="${VS.ai === "medium" ? "on" : ""}">متوسّط</button><button data-ai="hard" class="${VS.ai === "hard" ? "on" : ""}">صعب</button></div></div>
      ${cfg.toggle ? `<div class="vs-row"><div class="vs-lbl">${cfg.toggle.label}</div><div class="vs-lvl" id="vsTG"><button data-tg="1" class="${cfg.toggle.get() ? "on" : ""}">مُفعَّل</button><button data-tg="0" class="${!cfg.toggle.get() ? "on" : ""}">مُعطَّل</button></div></div>` : ""}
      <button class="vs-start" id="vsGo">▶ ابدأ اللعب</button>
    </div>`;
  const rr = () => vsSetup(host, cfg);
  host.querySelector("#vsD").addEventListener("click", e => { const b = e.target.closest("[data-d]"); if (!b) return; cfg.setDiff(b.getAttribute("data-d")); rr(); });
  host.querySelector("#vsO").addEventListener("click", e => { const b = e.target.closest("[data-opp]"); if (!b) return; VS.opp = b.getAttribute("data-opp"); rr(); });
  const vp = host.querySelector("#vsP"); if (vp) vp.addEventListener("click", e => { const b = e.target.closest("[data-pg]"); if (!b) return; setParentFemale(b.getAttribute("data-pg") === "f"); rr(); });
  host.querySelector("#vsA").addEventListener("click", e => { const b = e.target.closest("[data-ai]"); if (!b) return; VS.ai = b.getAttribute("data-ai"); rr(); });
  const tg = host.querySelector("#vsTG"); if (tg) tg.addEventListener("click", e => { const b = e.target.closest("[data-tg]"); if (!b) return; cfg.toggle.set(b.getAttribute("data-tg") === "1"); rr(); });
  host.querySelector("#vsGo").onclick = cfg.start;
}

// سجلُّ الانتصارات (يتراكمُ عبر الجولات في الجلسة؛ يُصفَّرُ بزرّ). مفتاحُه اسمُ اللاعب.
const vsWins = {};
export function vsWinsOf(name) { return vsWins[name] || 0; }

// سجلٌّ **دائمٌ** للألعابِ التنافسيّة (يستعرضُه الأهلُ في اللوحة، قابلٌ للتصفير) — مفصولٌ عن vsWins (الجلسة).
// كلُّ مدخلٍ = جولةٌ منتهية: التاريخ · اللعبة · الصعوبة · الابن · الخصم (دورُه + أب/أم) · الفائز.
const VS_HIST_KEY = "tilmithi_vs_history", VS_HIST_MAX = 300;
export function getVsHistory() { try { return JSON.parse(localStorage.getItem(VS_HIST_KEY) || "[]"); } catch (e) { return []; } }
export function clearVsHistory() { try { localStorage.removeItem(VS_HIST_KEY); } catch (e) {} }
// مفتاحُ الطرفَين (الابنُ + الخصمُ، والأمُّ تُفصَلُ عن الأب) — مصدرٌ **واحدٌ** للتجميعِ والحذفِ الانتقائيِّ معًا
// كي لا يختلفَ منطقانِ فيُحذَفَ غيرُ المقصود.
export function vsPairKey(e) {
  const opp = e && e.opp;
  const ok = opp ? (opp.role === "ai" ? "ai" : opp.role === "parent" ? (opp.female ? "mom" : "dad") : "sib:" + (opp.name || "")) : "?";
  return ((e && e.me) || "?") + "|" + ok;
}
// تصفيرُ سجلِّ طرفَينِ بعينِهما دونَ المساسِ ببقيّةِ السجلّ. يُرجِعُ عددَ المبارياتِ المحذوفة.
export function clearVsPair(key) {
  try {
    const arr = getVsHistory(), keep = arr.filter(e => vsPairKey(e) !== key);
    localStorage.setItem(VS_HIST_KEY, JSON.stringify(keep));
    return arr.length - keep.length;
  } catch (e) { return 0; }
}
function recordVsHistory(players, opts, winner) {
  try {
    if (!players || players.length < 2) return;   // تنافسيٌّ فقط (لا اللعبَ الفرديّ)
    const me = players.find(p => p.role === "me") || players.find(p => !p.cpu) || players[0];
    const opp = players.find(p => p !== me) || null;
    const entry = {
      ts: Date.now(), game: opts.game || "", diff: opts.diff || "", me: me ? me.name : "",
      opp: opp ? { role: opp.role || (opp.cpu ? "ai" : "sibling"), name: opp.name, female: !!opp.female } : null,
      players: players.map(p => ({ name: p.name, score: p.score, role: p.role || (p.cpu ? "ai" : "") })),
      winner: winner ? winner.name : null,
    };
    let arr = getVsHistory(); arr.push(entry); if (arr.length > VS_HIST_MAX) arr = arr.slice(-VS_HIST_MAX);
    localStorage.setItem(VS_HIST_KEY, JSON.stringify(arr));
  } catch (e) {}
}

// نافذةُ نهاية الجولة الموحّدة لكلّ الألعاب: اسمُ الفائز + النقاط + سجلُّ الانتصارات + [جولةٌ جديدة/خروج/تصفير].
// opts = { onAgain, onExit, subtitle? }.  يُحسَبُ الفائزُ من أعلى نقاطٍ، ويُسجَّلُ انتصارُه، ويُطلَقُ ردُّ الآليّ العصبيّ.
export function vsEndRound(players, opts = {}) {
  ensureStyle();
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const tie = sorted[1] && sorted[0].score === sorted[1].score;
  const winner = tie ? null : sorted[0];
  if (winner) vsWins[winner.name] = (vsWins[winner.name] || 0) + 1;
  vsNextStarter = winner ? winner.name : null;   // الفائزُ يبدأُ الجولةَ التالية (والتعادلُ يُعيدُ البدءَ لصاحبِ الحساب)
  recordVsHistory(players, opts, winner);   // تسجيلٌ دائمٌ للوحةِ الأهل
  const me = players.find(p => !p.cpu), o = players.find(p => p.cpu);
  if (o && me) vsReact(me, o); else robo.read(vP(GR.kids)); // ردُّ فعلٍ عصبيٌّ منطوق
  const ov = document.createElement("div"); ov.className = "vs-ov";
  const title = tie ? "🤝 تعادُل!" : `🏆 فاز ${winner.avatar} ${winner.name}!`;
  const rec = () => players.map(p => `${p.avatar} ${p.name}: <b>${vsWins[p.name] || 0}</b>`).join(" · ");
  ov.innerHTML = `<div class="vs-modal">
    <div class="vs-win-t">${title}</div>
    ${opts.subtitle ? `<div class="hint" style="margin:-6px 0 12px">${opts.subtitle}</div>` : ""}
    <div class="vs-win-s">${players.map(p => `<span class="vs-chip" style="border-color:${p.color};color:${p.color}">${p.avatar} ${p.name}: ${p.score}</span>`).join("")}</div>
    <div class="vs-win-r">🏅 سجلُّ الجولات المكسوبة:<br><span id="vsRec">${rec()}</span></div>
    <div class="vs-win-b"><button class="vs-again">🔁 جولةٌ جديدة</button><button class="vs-exit">🚪 خروج</button></div>
    <button class="vs-reset">↺ صفّرِ السجلّ</button>
  </div>`;
  document.body.appendChild(ov);
  sfx.success();
  const close = () => { try { ov.remove(); } catch (e) {} };
  ov.querySelector(".vs-again").onclick = () => { close(); opts.onAgain && opts.onAgain(); };
  ov.querySelector(".vs-exit").onclick = () => { close(); opts.onExit && opts.onExit(); };
  ov.querySelector(".vs-reset").onclick = () => { players.forEach(p => { vsWins[p.name] = 0; }); const el = ov.querySelector("#vsRec"); if (el) el.innerHTML = rec(); };
  ov.addEventListener("click", e => { if (e.target === ov) { /* لا يُغلَق بالنقر خارجًا لئلّا يُفلَت الطفلُ الأزرار */ } });
}

export { sfx };
