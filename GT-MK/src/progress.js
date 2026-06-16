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

export function getStats() {
  const s = load();
  const counts = s.counts || {}, totals = s.totals || {}, days = s.days || {};
  let streak = 0; const d = new Date();
  for (;;) { if (days[fmt(d)]) { streak++; d.setDate(d.getDate() - 1); } else break; }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const sections = new Set();
  for (const k in counts) if (counts[k] > 0 && SECTION_OF[k]) sections.add(SECTION_OF[k]);
  return { counts, totals, days, streak, total, activeDays: Object.keys(days).length, sections: sections.size, name: s.name || "" };
}

export const BADGES = [
  { id: "first",   ic: "🌱", label: "أوّل خطوة",        cond: s => s.total >= 1 },
  { id: "reader",  ic: "📖", label: "قارئ القصص",       cond: s => (s.counts.story_open || 0) >= 5 },
  { id: "words",   ic: "🔤", label: "بانِي الكلمات",     cond: s => (s.counts.word_win || 0) >= 10 },
  { id: "puzzles", ic: "🧩", label: "حلّال الألغاز",     cond: s => (s.counts.puzzle_seen || 0) >= 10 },
  { id: "quiz",    ic: "🎯", label: "بطل الاختبار",      cond: s => (s.counts.quiz_done || 0) >= 3 },
  { id: "letters", ic: "🔍", label: "صديق الحروف",       cond: s => (s.counts.basics_correct || 0) >= 15 },
  { id: "decoder", ic: "🔡", label: "أقرأُ بنفسي",        cond: s => (s.counts.read_practice || 0) >= 10 },
  { id: "memory",  ic: "🧠", label: "ذاكرة قويّة",        cond: s => (s.counts.memory_win || 0) >= 3 },
  { id: "robo",    ic: "🤖", label: "معلّم روبو",         cond: s => (s.counts.memory_heal || 0) >= 5 },
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

// Daily mission: 3 fixed tasks, "done" if an event of its type fired today.
export const MISSION = [
  { key: "quran",  ic: "📖", label: "اقرأ من القرآن",        href: "quran.html",  types: ["quran_open", "quran_listen"] },
  { key: "tales",  ic: "📚", label: "اقرأ قصّة",            href: "tales.html",  types: ["story_open"] },
  { key: "play",   ic: "🔤", label: "العب لعبة حروف",       href: "play.html",   types: ["word_win"] },
  { key: "basics", ic: "🔍", label: "تدرّب على الأساسيّات",  href: "basics.html", types: ["basics_correct"] },
];
export function getDailyMission() {
  const s = load(); const t = today(); const dt = (s.dayTypes && s.dayTypes[t]) || {};
  const tasks = MISSION.map(m => ({ ...m, done: m.types.some(x => dt[x]) }));
  return { tasks, complete: tasks.every(x => x.done), date: t };
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
