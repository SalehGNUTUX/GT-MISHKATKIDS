// src/accounts.js — نظام الحسابات المحلّي (مقتبسٌ من gt-sararim-v2، مُكيَّفٌ vanilla JS).
// محلّيٌّ بالكامل: لا خادم ولا سحابة. الملفّات والإعدادات في localStorage؛ الجلسة في sessionStorage.
// الملفّات (طفل/ضيف) + إعدادات والدين بكلمة مرور (افتراضية «admin») + استعادة + جلسة 5 دقائق.

const KEY = "tilmithi_accounts_v1";
const SESSION_USER = "tilmithi_current_user";   // الملفّ النشط (جلسة فقط — يبدأ التطبيق بالدخول)
const PARENT_TS = "tilmithi_parent_auth_ts";    // ختم مصادقة الوالد
const PARENT_SESSION_MS = 5 * 60 * 1000;        // صلاحية مصادقة الوالد: 5 دقائق
const DEFAULT_PARENT_PASSWORD = "admin";

const AVATARS = ["🦊", "🐱", "🐼", "🦁", "🐰", "🐧", "🐢", "🦋", "🌟", "🌸", "🚀", "🐝",
  "🐶", "🐯", "🐵", "🐸", "🐙", "🦄", "🐳", "🦉", "🐨", "🦖", "🐬", "🦜",
  "⚽", "🎈", "🍎", "🌻", "🦒", "🐮", "🐦", "🐠", "🦓", "🐲", "🦔", "🐹",
  "🦚", "🌺", "🍓", "🎨", "🦢", "🐡"];

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
function state() {
  const s = load();
  s.profiles = s.profiles || [];
  s.settings = s.settings || {};
  if (s.settings.parentPassword == null) s.settings.parentPassword = DEFAULT_PARENT_PASSWORD;
  if (s.settings.guestEnabled == null) s.settings.guestEnabled = true;
  if (s.settings.parentName == null) s.settings.parentName = "الوالدان";
  // securityQuestion: { question, answer } اختياريّ
  return s;
}
const uid = () => "p_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const norm = a => String(a || "").trim().toLowerCase().replace(/\s+/g, " ");

/* ---------- الملفّات ---------- */
export function listProfiles() { return state().profiles; }
export function getProfile(id) { return state().profiles.find(p => p.id === id) || null; }

export function addProfile({ name, ageGroup = "all", avatar, password = "", gender = "m" }) {
  const s = state();
  const p = { id: uid(), name: String(name || "").trim() || "طفلي", role: "child", ageGroup,
    avatar: avatar || AVATARS[s.profiles.length % AVATARS.length], password: password || "", gender: gender === "f" ? "f" : "m", created: Date.now() };
  s.profiles.push(p); save(s); return p;
}
// جنسُ الحسابِ النشِط أنثى؟ (لتأنيثِ خطابِ الآليّ). الوالدُ/الضيفُ/بلا-حساب ⇒ مذكَّرٌ افتراضًا.
export function isFemale() { try { const u = getCurrentUser(); return !!(u && u.gender === "f"); } catch (e) { return false; } }
export function updateProfile(id, patch) {
  const s = state(); const p = s.profiles.find(x => x.id === id);
  if (p) { Object.assign(p, patch); save(s); } return p;
}
export function deleteProfile(id) {
  const s = state(); s.profiles = s.profiles.filter(p => p.id !== id); save(s);
  if (getCurrentUser() && getCurrentUser().id === id) clearCurrentUser();
}

/* ---------- الملفّ النشط (جلسة) ---------- */
export function getCurrentUser() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_USER)) || null; } catch (e) { return null; }
}
export function setCurrentUser(profile) { try { sessionStorage.setItem(SESSION_USER, JSON.stringify(profile)); } catch (e) {} }
export function clearCurrentUser() { try { sessionStorage.removeItem(SESSION_USER); } catch (e) {} }
export function loginProfile(id, password) {
  const p = getProfile(id); if (!p) return false;
  if (p.password && p.password !== password) return false;
  setCurrentUser(p); return true;
}
export function loginGuest() {
  if (!state().settings.guestEnabled) return false;
  setCurrentUser({ id: "guest", name: "ضيف", role: "guest", ageGroup: "all", avatar: "👋" }); return true;
}
export function isGuest() { const u = getCurrentUser(); return !!u && u.role === "guest"; }

/* ---------- حساب الوالد (جلسةٌ حقيقيّة بدور parent) ---------- */
// الوالد ليس ملفّاً مخزَّناً بل جلسةٌ تُبنى من إعدادات الوالد عند الدخول بكلمة المرور.
// يستكشف المزايا بحسابه (تقدّمه تحت __parent) وله لوحةُ التحكّم والتقارير.
export function loginParent(password) {
  if (!verifyParentPassword(password)) return false;
  const s = state();
  setCurrentUser({ id: "parent", name: s.settings.parentName || "الوالدان", role: "parent", ageGroup: "all", avatar: s.settings.parentAvatar || "👪" });
  markParentAuthed();
  return true;
}
export function isParent() { const u = getCurrentUser(); return !!u && u.role === "parent"; }
export function getParentName() { return state().settings.parentName || "الوالدان"; }
export function getParentAvatar() { return state().settings.parentAvatar || "👪"; }

/* ---------- إعدادات الوالدين وكلمة المرور ---------- */
export function getSettings() { return state().settings; }
export function updateSettings(patch) { const s = state(); Object.assign(s.settings, patch); save(s); }
export function guestEnabled() { return state().settings.guestEnabled !== false; }

export function verifyParentPassword(pw) { return pw === state().settings.parentPassword; }
export function changeParentPassword(pw) { updateSettings({ parentPassword: pw || DEFAULT_PARENT_PASSWORD }); }
export function resetParentPasswordToDefault() { updateSettings({ parentPassword: DEFAULT_PARENT_PASSWORD }); }
export function isDefaultParentPassword() { return state().settings.parentPassword === DEFAULT_PARENT_PASSWORD; }

// مصادقة الوالد بجلسةٍ مؤقّتة (5 دقائق) في sessionStorage.
export function markParentAuthed() { try { sessionStorage.setItem(PARENT_TS, String(Date.now())); } catch (e) {} }
export function isParentAuthed() {
  try { const ts = Number(sessionStorage.getItem(PARENT_TS)); return ts && (Date.now() - ts) < PARENT_SESSION_MS; }
  catch (e) { return false; }
}
export function clearParentAuth() { try { sessionStorage.removeItem(PARENT_TS); } catch (e) {} }

/* ---------- استعادة كلمة المرور (سؤال أمنيّ) ---------- */
export function getSecurityQuestion() { return state().settings.securityQuestion || null; }
export function setSecurityQuestion(question, answer) {
  updateSettings({ securityQuestion: question ? { question: String(question).trim(), answer: String(answer || "").trim() } : undefined });
}
export function verifySecurityAnswer(answer) {
  const sq = getSecurityQuestion(); return !!sq && norm(answer) === norm(sq.answer);
}

export { AVATARS, DEFAULT_PARENT_PASSWORD };
