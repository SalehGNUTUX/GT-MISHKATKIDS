// src/theme.js — تبديلُ السمة (فاتح/داكن). محلّيٌّ بالكامل، يُحفَظ في localStorage ويُطبَّق على <html data-theme>.
// منعُ الوميض: يضع كلُّ صفحةٍ سكربتًا كلاسيكيًّا صغيرًا في <head> يضبط data-theme قبل الرسم؛ وهذه الوحدة للتبديل.
import "./dark.css"; // أنماطُ السمة الداكنة المشتركة (يستخرجها Vite كـ<link>)
import "./topbar.css"; // تنسيقٌ موحّدٌ لشريط الأزرار العلويّ في كلّ الصفحات
import "./nav-icons.css"; // حجمُ وتلوينُ أيقونات بطاقات الأقسام (SVG)
import { iconHtml } from "./icons.js"; // أيقوناتُ Font Awesome (لمسنّن اللوحة بنفس سلسلة الفهرس)
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
  btn.classList.add("themetoggle"); // لتأثير الدوران اللطيف عند المرور (كالمسنّن)
  const sync = () => { btn.textContent = isDark() ? "☀️" : "🌙"; btn.setAttribute("title", isDark() ? "الوضع الفاتح" : "الوضع الداكن"); btn.setAttribute("aria-label", btn.title); };
  sync();
  btn.addEventListener("click", () => { toggleTheme(); sync(); });
}

// مسنّنُ لوحة التحكّم ⚙️: يُحقَن تلقائيًّا في شريط كلّ صفحةٍ (هذه الوحدة تُستورَد في الجميع)
// فيَصِلُ الوالدُ إلى اللوحةِ مباشرةً (index.html?parent=1، حاجزُ كلمة المرور يحميها) دون العودة للفهرس.
// لا يُحقَن في الفهرس نفسِه (index.html) فهو مُضيفُ اللوحة.
function mountPanelGear() {
  try {
    if (document.getElementById("panelGear")) return;
    const path = location.pathname;
    if (/(^|\/)index\.html$/.test(path)) return; // الفهرس = مضيفُ اللوحة، لا حاجةَ لمسنّن
    const g = document.createElement("a");
    g.id = "panelGear"; g.className = "iconbtn"; g.href = "index.html?parent=1";
    g.title = "لوحة التحكّم"; g.setAttribute("aria-label", "لوحة التحكّم");
    g.innerHTML = iconHtml("⚙️"); // ترسُ Font Awesome (iconHtml يطابقُ الإيموجي ⚙️ ← gear ← SVG)
    // يُوضَع ملاصقًا لزرّ تبديل السمة (🌙/☀️) ليكونا مجموعةً واحدةً متناسقةً في كلّ الصفحات.
    const themeBtn = document.getElementById("themeBtn")
      || document.querySelector('.iconbtn[title*="الوضع"], [aria-label*="الوضع"]');
    if (themeBtn && themeBtn.parentElement) { themeBtn.parentElement.insertBefore(g, themeBtn); return; }
    const home = document.querySelector('a[href$="home.html"]');
    const host = (home && home.parentElement) || document.querySelector(".topbtns") || document.querySelector("header");
    if (!host) return;
    if (home && home.parentElement === host) host.insertBefore(g, home);
    else host.insertBefore(g, host.firstChild);
  } catch (e) {}
}
if (typeof document !== "undefined") {
  if (document.readyState !== "loading") mountPanelGear();
  else document.addEventListener("DOMContentLoaded", mountPanelGear);
}
