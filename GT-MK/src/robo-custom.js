// src/robo-custom.js — تخصيصُ الآليّ (لون + اسم + ملحقات) لكلِّ حسابٍ على حدة.
// محلّيٌّ بالكامل (localStorage). اللونُ يُطبَّقُ عبرَ متغيّرِ CSS ‎--robo-body‎ فيَشملُ كلَّ نسخِ الآليّ.
// الملحقاتُ تُكسَبُ بالإنجاز (عددُ الأنشطةِ المُسجَّلة) — تحفيزٌ لطيفٌ لا حاجز.
// (المُعرّفاتُ اللاتينيّةُ accessory تبقى كما هي على نهجِ الكود؛ العرضُ العربيُّ «ملحقات».)
import { getCurrentUser } from "./accounts.js";
import { getStats } from "./progress.js";

const DEFAULT = { color: "#B8C0CC", name: "", accessory: "none" };
function key() { try { const u = getCurrentUser(); return "tilmithi_robo_custom__" + ((u && u.id) || "default"); } catch (e) { return "tilmithi_robo_custom__default"; } }

export function getRoboCustom() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(key()) || "{}") }; } catch (e) { return { ...DEFAULT }; }
}
export function setRoboCustom(patch) {
  const c = { ...getRoboCustom(), ...patch };
  try { localStorage.setItem(key(), JSON.stringify(c)); } catch (e) {}
  applyRoboColor();
  return c;
}
// يُضبَطُ متغيّرُ اللونِ على الجذرِ فيَسري على كلِّ آليٍّ في الصفحة (المرافقُ + بطاقةُ الدخولِ + حلقةُ التلقين).
export function applyRoboColor() {
  try { document.documentElement.style.setProperty("--robo-body", getRoboCustom().color); } catch (e) {}
}

// ألوانٌ لطيفةٌ مناسبةٌ للأطفال (الأوّلُ هو الافتراضيّ الأصليّ).
export const ROBO_COLORS = [
  { id: "steel",  c: "#B8C0CC", name: "فضّيّ" },
  { id: "sky",    c: "#8FC7E8", name: "سماويّ" },
  { id: "mint",   c: "#9BD6B4", name: "نعناعيّ" },
  { id: "peach",  c: "#F3B79A", name: "مشمشيّ" },
  { id: "lilac",  c: "#C9B3E6", name: "بنفسجيّ" },
  { id: "gold",   c: "#F0CE7A", name: "ذهبيّ" },
  { id: "rose",   c: "#EFA6BE", name: "ورديّ" },
  { id: "teal",   c: "#8CCFC9", name: "فيروزيّ" },
];

// ملحقاتٌ تُكسَبُ بعددِ الأنشطةِ المُنجَزة (need، تصاعديًّا). رسومُها لمقاسِ الآليِّ 80×80 (المرافق/الدخول).
export const ROBO_ACCESSORIES = [
  { id: "none",    name: "بلا ملحق", emoji: "🚫", need: 0, svg: "" },
  { id: "bowtie",  name: "فِراشة",   emoji: "🎀", need: 3,
    svg: '<g><path d="M40 56 l-8 -4 v8 z" fill="#E0566B"/><path d="M40 56 l8 -4 v8 z" fill="#E0566B"/><circle cx="40" cy="56" r="2.4" fill="#C7613F"/></g>' },
  { id: "star",    name: "نجمة",     emoji: "⭐", need: 6,
    svg: '<path d="M40 1 l1.7 3.6 l3.9 .5 l-2.9 2.7 l.8 3.9 l-3.5 -2 l-3.5 2 l.8 -3.9 l-2.9 -2.7 l3.9 -.5 z" fill="#F4C95D" stroke="#D9A93B" stroke-width=".5"/>' },
  { id: "glasses", name: "نظّارة",   emoji: "🤓", need: 8,
    svg: '<g fill="none" stroke="#3a4250" stroke-width="2"><circle cx="31" cy="34" r="8"/><circle cx="49" cy="34" r="8"/><path d="M39 34 h2"/></g>' },
  { id: "flower",  name: "زهرة",     emoji: "🌸", need: 12,
    svg: '<g><circle cx="24" cy="18" r="2.6" fill="#EFA6BE"/><circle cx="29" cy="18" r="2.6" fill="#EFA6BE"/><circle cx="26.5" cy="14" r="2.6" fill="#EFA6BE"/><circle cx="26.5" cy="22" r="2.6" fill="#EFA6BE"/><circle cx="26.5" cy="18" r="2.2" fill="#F4C95D"/></g>' },
  { id: "scarf",   name: "وشاح",     emoji: "🧣", need: 16,
    svg: '<g><rect x="20" y="53" width="40" height="7" rx="3.5" fill="#C7613F"/><rect x="52" y="58" width="7" height="15" rx="3" fill="#C7613F"/><rect x="52" y="66" width="7" height="4" fill="#9E4A2E"/></g>' },
  { id: "headphones", name: "سمّاعة", emoji: "🎧", need: 22,
    svg: '<g fill="#3a4250"><path d="M18 36 a22 22 0 0 1 44 0" fill="none" stroke="#3a4250" stroke-width="3"/><rect x="12" y="32" width="8" height="15" rx="3.5"/><rect x="60" y="32" width="8" height="15" rx="3.5"/></g>' },
  { id: "hat",     name: "قبّعة",    emoji: "🎩", need: 28,
    svg: '<g><rect x="24" y="14" width="32" height="4" rx="2" fill="#3a4250"/><rect x="30" y="4" width="20" height="12" rx="2" fill="#3a4250"/><rect x="30" y="12" width="20" height="3" fill="#E0566B"/></g>' },
  { id: "beanie",  name: "طاقيّة",   emoji: "🧢", need: 34,
    svg: '<g><path d="M22 18 a18 13 0 0 1 36 0 z" fill="#4E8C3A"/><path d="M22 18 h36 v3 a2 2 0 0 1 -2 2 h-32 a2 2 0 0 1 -2 -2 z" fill="#3F6B2C"/><circle cx="40" cy="4" r="3.6" fill="#6FB3D6"/></g>' },
  { id: "medal",   name: "وسام",     emoji: "🏅", need: 40,
    svg: '<g><path d="M34 55 l5 8 M46 55 l-5 8" stroke="#3F82C4" stroke-width="2.4" fill="none"/><circle cx="40" cy="65" r="6.5" fill="#F4C95D" stroke="#D9A93B" stroke-width="1"/><path d="M40 61.5 l1 2.1 l2.3 .3 l-1.7 1.6 l.5 2.3 l-2.1 -1.2 l-2.1 1.2 l.5 -2.3 l-1.7 -1.6 l2.3 -.3 z" fill="#D9A93B"/></g>' },
  { id: "crown",   name: "تاج",      emoji: "👑", need: 50,
    svg: '<path d="M28 16 l1 -10 l6 6 l5 -9 l5 9 l6 -6 l1 10 z" fill="#F4C95D" stroke="#D9A93B" stroke-width="1"/>' },
];

// كم أنجزَ الطفلُ (عددُ الأنشطةِ المُسجَّلة) — مقياسُ فتحِ الملحقات.
export function earnedCount() { try { return getStats().total || 0; } catch (e) { return 0; } }
export function isAccessoryUnlocked(a) { return earnedCount() >= (a.need || 0); }

// رسمُ الملحقِ المختارِ (إن كان مفتوحًا) — يُضافُ فوقَ الآليِّ 80×80.
export function accessorySvg() {
  const c = getRoboCustom();
  const a = ROBO_ACCESSORIES.find(x => x.id === c.accessory);
  return (a && a.id !== "none" && isAccessoryUnlocked(a)) ? a.svg : "";
}
