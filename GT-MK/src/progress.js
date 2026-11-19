// src/progress.js — local progress, badges, streak, daily mission, certificate name.
// Fully local: everything lives in localStorage. Nothing leaves the device.
// Each section imports this and calls logEvent(type) at its success point.

import { getCurrentUser } from "./accounts.js";
// تقدّمٌ منفصلٌ لكل ملفّ: مفتاحٌ خاصٌّ بالملفّ النشط، والضيف/بلا-ملفّ على المفتاح الأصليّ.
const _cu = (() => { try { return getCurrentUser(); } catch (e) { return null; } })();
const KEY = (_cu && _cu.role !== "guest" && _cu.id) ? "tilmithi_progress_v1__" + _cu.id : "tilmithi_progress_v1";

function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function fmt(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
const today = () => fmt(new Date());

// type → which "section" it belongs to (for the explorer badge + dashboard grouping)
export const SECTION_OF = {
  memory_heal: "robo", story_open: "tales", comprehension_ok: "tales",
  puzzle_seen: "puzzles", quiz_done: "quiz", word_win: "play",
  memory_win: "play", basics_correct: "basics", read_practice: "read",
  math_correct: "math", craft_done: "math", quran_listen: "quran",
  math_dots_done: "math", math_balance_win: "math", math_geo_free: "math",
  picture_story_open: "stories",
  oddone_correct: "play", oddone_win: "play", jigsaw_done: "play", color_done: "play", color_saved: "play", soundmem_match: "play", soundmem_win: "play",
};

export function logEvent(type, payload = {}) {
  const s = load();
  s.counts = s.counts || {};
  s.counts[type] = (s.counts[type] || 0) + 1;
  if (payload.add) { s.totals = s.totals || {}; for (const k in payload.add) s.totals[k] = (s.totals[k] || 0) + payload.add[k]; }
  const t = today();
  s.days = s.days || {}; s.days[t] = (s.days[t] || 0) + 1;
  s.dayTypes = s.dayTypes || {}; s.dayTypes[t] = s.dayTypes[t] || {}; s.dayTypes[t][type] = true;
  s.lastDay = t;
  save(s);
}

// مفتاحُ تقدّمِ ملفٍّ بعينه (يطابق نمطَ index.html وهذا الملفّ) + قارئٌ مباشر.
function keyFor(id) { return id ? "tilmithi_progress_v1__" + id : "tilmithi_progress_v1"; }
function loadKey(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; } }

// حسابُ الإحصاءات من كائن تقدّمٍ معطًى (نقيّ، يُعاد استعماله للجلسة الحاليّة وللتقارير).
function computeStats(s) {
  const counts = s.counts || {}, totals = s.totals || {}, days = s.days || {};
  let streak = 0; const d = new Date();
  for (;;) { if (days[fmt(d)]) { streak++; d.setDate(d.getDate() - 1); } else break; }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const sections = new Set();
  for (const k in counts) if (counts[k] > 0 && SECTION_OF[k]) sections.add(SECTION_OF[k]);
  return { counts, totals, days, streak, total, activeDays: Object.keys(days).length, sections: sections.size, name: s.name || "" };
}
export function getStats() { return computeStats(load()); }

// قراءةٌ فقط لتقدّمِ ملفٍّ آخرَ (لتقارير لوحة الأهل) — لا تمسّ الجلسةَ الحاليّة.
export function loadProgressFor(id) { return loadKey(keyFor(id)); }
export function getStatsFor(id) { return computeStats(loadKey(keyFor(id))); }

export const BADGES = [
  { id: "first",   ic: "🌱", label: "أوّل خطوة",        cond: s => s.total >= 1 },
  { id: "reader",  ic: "📖", label: "قارئ القصص",       cond: s => (s.counts.story_open || 0) >= 5 },
  { id: "words",   ic: "🔤", label: "بانِي الكلمات",     cond: s => (s.counts.word_win || 0) >= 10 },
  { id: "puzzles", ic: "🧩", label: "حلّال الألغاز",     cond: s => (s.counts.puzzle_seen || 0) >= 10 },
  { id: "quiz",    ic: "🎯", label: "بطل الاختبار",      cond: s => (s.counts.quiz_done || 0) >= 3 },
  { id: "letters", ic: "🔍", label: "صديق الحروف",       cond: s => (s.counts.basics_correct || 0) >= 15 },
  { id: "decoder", ic: "🔡", label: "أقرأُ بنفسي",        cond: s => (s.counts.read_practice || 0) >= 10 },
  { id: "memory",  ic: "🧠", label: "ذاكرة قويّة",        cond: s => (s.counts.memory_win || 0) >= 3 },
  { id: "robo",    ic: "🤖", label: "معلّم الآليّ",         cond: s => (s.counts.memory_heal || 0) >= 5 },
  { id: "streak3", ic: "🔥", label: "ثلاثة أيّامٍ متتالية", cond: s => s.streak >= 3 },
  { id: "streak7", ic: "⭐", label: "أسبوعٌ كامل",        cond: s => s.streak >= 7 },
  { id: "explorer",ic: "🧭", label: "مُستكشِف",           cond: s => s.sections >= 4 },
  // أوسمة تكافئ التفكير والاستكشاف والتعاون (لا الكمّ وحده)
  { id: "critic",  ic: "🧐", label: "ناقدٌ صغير",         cond: s => (s.counts.wrong_fixed || 0) >= 3 },
  { id: "thinker", ic: "💭", label: "مُفكِّرٌ عميق",        cond: s => (s.counts.think_deep || 0) >= 10 },
  { id: "adventurer", ic: "🎲", label: "مُغامِر",          cond: s => (s.counts.explore_surprise || 0) >= 5 },
  { id: "buddy",   ic: "👯", label: "رفيقُ الإخوة",        cond: s => (s.counts.coop_done || 0) >= 3 },
  { id: "star50",  ic: "🏆", label: "خمسون نجمة",        cond: s => s.total >= 50 },
  // القرآن الكريم — تشجيعٌ على القراءة والحفظ.
  { id: "quran",   ic: "📖", label: "صديقُ القرآن",        cond: s => (s.counts.quran_listen || 0) >= 3 },
  { id: "hafiz",   ic: "🕌", label: "يَحفظُ كتابَ الله",     cond: s => (s.counts.quran_listen || 0) >= 10 },
];
export function getBadges() { const s = getStats(); return BADGES.map(b => ({ id: b.id, ic: b.ic, label: b.label, earned: !!b.cond(s) })); }
// أوسمةُ ملفٍّ آخرَ (للتقارير) — قراءةٌ فقط.
export function getBadgesFor(id) { const s = getStatsFor(id); return BADGES.map(b => ({ id: b.id, ic: b.ic, label: b.label, earned: !!b.cond(s) })); }

// Daily mission: 3 fixed tasks, "done" if an event of its type fired today.
// ── مهمّةُ اليومِ الذكيّة (v1.10) ───────────────────────────────────────────────────────────
// مجموعةُ مهامٍّ تغطّي كلَّ الأقسام؛ لكلٍّ رابطُ قسمِها الدقيق وأحداثُه الحقيقيّة (تُحتسَبُ منجزةً بأيٍّ منها اليوم).
// كلَّ يومٍ: القرآنُ مرساةٌ ثابتة + ثلاثُ مهامّ تُختارُ بذكاء ← ما لم يُجرَّبْ منذ أطولِ مدّة (أو قطّ)،
// وما بقيَ غيرَ منجَزٍ أمس، مع تجنّبِ تكرارِ ما أُنجِزَ أمس. الاختيارُ يُحفَظُ لليوم فيبقى ثابتًا حتّى الغد.
export const MISSION_POOL = [
  { key: "quran",   ic: "📖", label: "اقرأ من القرآن",         href: "quran.html",   types: ["quran_open", "quran_listen"] },
  { key: "tales",   ic: "📜", label: "اقرأ قصّةً وعِبرة",       href: "tales.html",   types: ["story_open", "comprehension_ok"] },
  { key: "stories", ic: "📚", label: "اقرأ قصّةً مصوّرة",       href: "stories.html", types: ["picture_story_open"] },
  { key: "letters", ic: "🔤", label: "العب لعبةَ حروف",         href: "play.html?only=letters", types: ["word_win", "wordgrid_win", "wheel_win"] },
  { key: "basics",  ic: "🔍", label: "تدرّبْ على الأساسيّات",   href: "basics.html",  types: ["basics_correct"] },
  { key: "read",    ic: "📘", label: "اصعدْ سُلّمَ القراءة",     href: "read.html",    types: ["read_practice"] },
  { key: "math",    ic: "🔢", label: "تمرينُ أرقامٍ وهندسة",     href: "math.html",    types: ["math_correct", "math_arith_win", "math_pattern_win", "math_balance_win", "math_dots_done", "math_geo_free", "craft_done"] },
  { key: "puzzles", ic: "🧩", label: "حُلَّ لغزًا",              href: "puzzles.html", types: ["puzzle_solved", "puzzle_seen"] },
  { key: "quiz",    ic: "🎯", label: "أجِبْ عن اختبار",          href: "quiz.html",    types: ["quiz_done"] },
  { key: "teach",   ic: "🤖", label: "علّمِ الآليَّ ذكرى",       href: "index.html",   types: ["memory_heal"] },
  { key: "lang",    ic: "🌍", label: "تعلّمْ من لغةٍ أخرى",       href: "lang.html",    types: ["lang_open", "lang_spell_win", "lang_alphaorder_win", "lang_orientquiz", "lang_clock_win"] },
  { key: "skill",   ic: "⚡", label: "العبْ لعبةَ مهارةٍ وتركيز", href: "play.html?only=skill", types: ["hunt_win", "smatch_win", "oddone_correct", "oddone_win", "soundmem_match", "soundmem_win", "numrace_win"] },
];
const POOL = Object.fromEntries(MISSION_POOL.map(m => [m.key, m]));
export const MISSION = MISSION_POOL;          // توافقٌ مع الاستيرادِ القديم
const ANCHOR = "quran", PICK = 3;
const dayNum = d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 864e5;
const shiftDay = (d, n) => { const x = new Date(dayNum(d) * 864e5 + n * 864e5); return x.getUTCFullYear() + "-" + String(x.getUTCMonth() + 1).padStart(2, "0") + "-" + String(x.getUTCDate()).padStart(2, "0"); };
const doneOn = (s, d, m) => { const dt = (s.dayTypes || {})[d] || {}; return m.types.some(x => dt[x]); };
// آخرُ يومٍ (قبلَ اليوم) أُنجِزَت فيه المهمّة ← عددُ الأيّامِ منذه، أو null إن لم تُنجَزْ قطّ
function daysSince(s, m, t) {
  let best = null;
  for (const d of Object.keys(s.dayTypes || {})) if (d < t && doneOn(s, d, m) && (!best || d > best)) best = d;
  return best ? dayNum(t) - dayNum(best) : null;
}
const jitter = str => { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h) % 7; };
function pickMissions(s, t) {
  const y = shiftDay(t, -1), yKeys = (s.missions || {})[y] || [];
  const scored = MISSION_POOL.filter(m => m.key !== ANCHOR).map(m => {
    const ago = daysSince(s, m, t), inY = yKeys.includes(m.key), yDone = inY && doneOn(s, y, m);
    const practice = m.types.reduce((a, x) => a + ((s.counts || {})[x] || 0), 0);
    let score = ago === null ? 100 : Math.min(ago, 30) * 3;   // الأطولُ غيابًا أوّلًا
    if (inY && !yDone) score += 40;                            // بقيت أمسِ غيرَ منجَزة ← تُرحَّل
    if (yDone) score -= 50;                                    // أُنجِزَت أمس ← تنويع
    score += Math.max(0, 10 - practice);                       // القليلُ التدرّبِ أَولى
    return { k: m.key, score: score + jitter(t + m.key) };
  }).sort((a, b) => b.score - a.score);
  return [ANCHOR, ...scored.slice(0, PICK).map(x => x.k)];
}
// سببٌ قصيرٌ يُعرَضُ تحتَ المهمّة (لماذا اختيرت اليوم)
function reasonFor(s, m, t) {
  if (m.key === ANCHOR) return "وِردُك اليوميّ";
  const y = shiftDay(t, -1), yKeys = (s.missions || {})[y] || [];
  if (yKeys.includes(m.key) && !doneOn(s, y, m)) return "لم تُكمِلْها أمس — هيّا اليوم!";
  const ago = daysSince(s, m, t);
  if (ago === null) return "لم تُجرّبْها بعد";
  if (ago >= 2) return `آخرَ مرّةٍ قبلَ ${ago} أيّام`;
  return "لتبقى مهارتُك قويّة";
}
export function getDailyMission() {
  const s = load(), t = today();
  s.missions = s.missions || {};
  let keys = s.missions[t];
  if (!Array.isArray(keys) || !keys.every(k => POOL[k])) {      // أوّلُ فتحٍ اليوم ← اختيارٌ ثابتٌ لليوم
    keys = pickMissions(s, t); s.missions[t] = keys;
    for (const d of Object.keys(s.missions)) if (dayNum(t) - dayNum(d) > 30) delete s.missions[d];   // تقليمٌ
    save(s);
  }
  const tasks = keys.map(k => ({ ...POOL[k], done: doneOn(s, t, POOL[k]), why: reasonFor(s, POOL[k], t) }));
  // آخرُ سبعةِ أيّام: كم أُنجِزَ من مهامِّ كلِّ يوم (يومٌ بلا سجلِّ مهامّ ⇒ نشاطُه فقط)
  const history = Array.from({ length: 7 }, (_, i) => {
    const d = shiftDay(t, i - 6), ks = s.missions[d] || [];
    return { date: d, today: d === t, total: ks.length, done: ks.filter(k => POOL[k] && doneOn(s, d, POOL[k])).length, active: !!(s.days || {})[d] };
  });
  return { tasks, complete: tasks.every(x => x.done), date: t, history };
}

// --- تتبّع الإتقان لكل مهارة (يغذّي المراجعة بالفواصل في المرحلة 4) ---
// mastery[skillId] = { box:1..5, seen, correct, last:"YYYY-MM-DD" } — أسلوب لايتنر مبسّط.
// كل دالّة تُحمّل-تعدّل-تحفظ، فتحفظ بقيّة الحقول (completed/parts/world…) التي تشاركها index.html.
const BOX_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 16 }; // فاصل المراجعة بالأيّام لكل صندوق

export function recordMastery(skillId, correct) {
  const s = load(); s.mastery = s.mastery || {};
  const m = s.mastery[skillId] || { box: 1, seen: 0, correct: 0, last: null };
  m.seen += 1;
  if (correct) { m.correct += 1; m.box = Math.min(5, m.box + 1); }
  else { m.box = Math.max(1, m.box - 1); }
  m.last = today();
  s.mastery[skillId] = m; save(s);
  return m;
}
export function getMastery(skillId) {
  const s = load();
  return (s.mastery && s.mastery[skillId]) || { box: 1, seen: 0, correct: 0, last: null };
}
export function isDueForReview(skillId) {
  const m = getMastery(skillId);
  if (!m.last) return true;
  const days = Math.floor((new Date(today() + "T00:00:00") - new Date(m.last + "T00:00:00")) / 86400000);
  return days >= (BOX_DAYS[m.box] || 0);
}
export function dueSkills(skillIds) { return (skillIds || []).filter(isDueForReview); }
export function getAllMastery() { return load().mastery || {}; }

// الفئة العمرية المختارة للطفل — تُستعمل افتراضًا في تصفية الأنشطة (تصفية ذكية).
// الفئة العمرية: من الملفّ النشط إن وُجد (يقود التصفية المتكيّفة)، وإلّا المحفوظة.
export function getChildAge() { return (_cu && _cu.ageGroup) ? _cu.ageGroup : (load().childAge || "all"); }
export function setChildAge(a) { const s = load(); s.childAge = a; save(s); }

export function getName() { return load().name || ""; }
export function setName(n) { const s = load(); s.name = (n || "").slice(0, 40); save(s); }
export function resetProgress() { save({}); }

// v1.9 — عملٌ من خارجِ «علّمِ الآليّ» (رسمةُ التلوين…) يُضافُ إلى «📂 أعمالي» وسجلِّ الجلسات:
// مدخلٌ في log بالبنيةِ نفسِها التي يقرؤها index.html، والوسائطُ تُحفَظُ بطابعِ الوقتِ نفسِه (src/works.js).
// نمطُ «حمّلْ-عدّلْ-احفظ» لأنّ index.html يكتبُ في المفتاحِ نفسِه.
export function addWorkEntry(entry) { const s = load(); s.log = s.log || []; s.log.push(entry); save(s); }

// v1.9 — المستوى بحسبِ الفئةِ العمريّةِ المختارةِ في الحساب: تقترحُ كلُّ لعبةٍ مستواها عند فتحِها،
// ويبقى الطفلُ/الوالدُ حرًّا في تغييرِه. "young" = 4–6 · "older" = 7–10 · null = «الكلّ»/غيرُ محدَّد (لا تغيير).
export function ageTier() { const a = getChildAge(); return a === "4-6" ? "young" : a === "7-10" ? "older" : null; }
/** من مستوياتٍ مرتّبةٍ من الأسهل: الصغيرُ أوّلُها، والأكبرُ أوسطُها (يبقى الأصعبُ تحدّيًا اختياريًّا). */
export function byAge(levels, fallback) {
  const t = ageTier(); if (!t || !levels || !levels.length) return fallback;
  return t === "young" ? levels[0] : levels[Math.min(levels.length - 1, Math.floor(levels.length / 2))];
}

// v1.10 — مستوى كلِّ نشاطٍ لكلِّ طفل (يرتفعُ بالإتقان): s.levels[act] = { level, streak }
export function getLevel(act, fallback) { const v = (load().levels || {})[act]; return v && v.level != null ? v.level : fallback; }
export function setLevel(act, level) { const s = load(); s.levels = s.levels || {}; s.levels[act] = { level, streak: 0 }; save(s); }
export function levelResult(act, level, ok, levels, need = 5) {
  const s = load(); s.levels = s.levels || {};
  const L = s.levels[act] && s.levels[act].level === level ? s.levels[act] : { level, streak: 0 };
  L.streak = ok ? L.streak + 1 : Math.max(0, L.streak - 2);       // الخطأُ يُنقِصُ السلسلةَ ولا يُنزِلُ المستوى
  let up = null; const i = levels.indexOf(level);
  if (L.streak >= need && i >= 0 && i < levels.length - 1) { up = levels[i + 1]; L.level = up; L.streak = 0; }
  s.levels[act] = L; save(s); return up;
}
