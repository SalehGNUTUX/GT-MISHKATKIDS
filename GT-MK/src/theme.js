// src/theme.js — تبديلُ السمة (فاتح/داكن). محلّيٌّ بالكامل، يُحفَظ في localStorage ويُطبَّق على <html data-theme>.
// منعُ الوميض: يضع كلُّ صفحةٍ سكربتًا كلاسيكيًّا صغيرًا في <head> يضبط data-theme قبل الرسم؛ وهذه الوحدة للتبديل.
const KEY = "tilmithi_theme"; // "light" | "dark" | غير مضبوط (يتبع تفضيل النظام)

export function storedTheme() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
export function isDark() {
  const t = storedTheme();
  if (t === "dark") return true;
  if (t === "light") return false;
  try { return matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; }
}
export function applyTheme() {
  try { document.documentElement.setAttribute("data-theme", isDark() ? "dark" : "light"); } catch (e) {}
}
export function setTheme(t) { try { localStorage.setItem(KEY, t); } catch (e) {} applyTheme(); }
export function toggleTheme() { setTheme(isDark() ? "light" : "dark"); return isDark(); }

// يربط زرًّا للتبديل ويُحدّث أيقونته (🌙 لتفعيل الداكن، ☀️ للرجوع للفاتح).
export function wireThemeToggle(btn) {
  if (!btn) return;
  const sync = () => { btn.textContent = isDark() ? "☀️" : "🌙"; btn.setAttribute("title", isDark() ? "الوضع الفاتح" : "الوضع الداكن"); btn.setAttribute("aria-label", btn.title); };
  sync();
  btn.addEventListener("click", () => { toggleTheme(); sync(); });
}
