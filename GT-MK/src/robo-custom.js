// src/robo-custom.js — تخصيصُ الآليّ (لون + اسم + إكسسوار) لكلِّ حسابٍ على حدة.
// محلّيٌّ بالكامل (localStorage). اللونُ يُطبَّقُ عبرَ متغيّرِ CSS ‎--robo-body‎ فيَشملُ كلَّ نسخِ الآليّ.
// الإكسسواراتُ تُكسَبُ بالإنجاز (عددُ الأنشطةِ المُسجَّلة) — تحفيزٌ لطيفٌ لا حاجز.
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

// إكسسواراتٌ تُكسَبُ بعددِ الأنشطةِ المُنجَزة (need). رسومُها لمقاسِ الآليِّ 80×80 (المرافق/الدخول).
export const ROBO_ACCESSORIES = [
  { id: "none",    name: "بلا إكسسوار", emoji: "🚫", need: 0, svg: "" },
  { id: "bowtie",  name: "فِراشة",      emoji: "🎀", need: 3,
    svg: '<g><path d="M40 56 l-8 -4 v8 z" fill="#E0566B"/><path d="M40 56 l8 -4 v8 z" fill="#E0566B"/><circle cx="40" cy="56" r="2.4" fill="#C7613F"/></g>' },
  { id: "glasses", name: "نظّارة",       emoji: "🤓", need: 8,
    svg: '<g fill="none" stroke="#3a4250" stroke-width="2"><circle cx="31" cy="34" r="8"/><circle cx="49" cy="34" r="8"/><path d="M39 34 h2"/></g>' },
  { id: "hat",     name: "قبّعة",        emoji: "🎩", need: 20,
    svg: '<g><rect x="24" y="14" width="32" height="4" rx="2" fill="#3a4250"/><rect x="30" y="4" width="20" height="12" rx="2" fill="#3a4250"/><rect x="30" y="12" width="20" height="3" fill="#E0566B"/></g>' },
  { id: "crown",   name: "تاج",          emoji: "👑", need: 40,
    svg: '<path d="M28 16 l1 -10 l6 6 l5 -9 l5 9 l6 -6 l1 10 z" fill="#F4C95D" stroke="#D9A93B" stroke-width="1"/>' },
];

// كم أنجزَ الطفلُ (عددُ الأنشطةِ المُسجَّلة) — مقياسُ فتحِ الإكسسوارات.
export function earnedCount() { try { return getStats().total || 0; } catch (e) { return 0; } }
export function isAccessoryUnlocked(a) { return earnedCount() >= (a.need || 0); }

// رسمُ الإكسسوارِ المختارِ (إن كان مفتوحًا) — يُضافُ فوقَ الآليِّ 80×80.
export function accessorySvg() {
  const c = getRoboCustom();
  const a = ROBO_ACCESSORIES.find(x => x.id === c.accessory);
  return (a && a.id !== "none" && isAccessoryUnlocked(a)) ? a.svg : "";
}
