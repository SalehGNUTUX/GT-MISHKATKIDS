// src/theme.js — تبديلُ السمة (فاتح/داكن). محلّيٌّ بالكامل، يُحفَظ في localStorage ويُطبَّق على <html data-theme>.
// منعُ الوميض: يضع كلُّ صفحةٍ سكربتًا كلاسيكيًّا صغيرًا في <head> يضبط data-theme قبل الرسم؛ وهذه الوحدة للتبديل.
import "./fonts.css"; // الخطُّ الافتراضيُّ «Ubuntu Arabic» (مُضمَّنٌ، على كلّ الصفحات)
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
// زرُّ الرجوع في أندرويد (Capacitor): تنقّلٌ تدريجيٌّ عبر الصفحات؛ وعلى الفهرس (home) رسالةُ
// تأكيدِ الخروج/البقاء. يعملُ في الحزمة الأصليّة فقط (يَعتمدُ جسرَ Capacitor المحقون).
function exitConfirm(onYes) {
  if (document.getElementById("exitConfirm")) return;
  const ov = document.createElement("div");
  ov.id = "exitConfirm";
  ov.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55)";
  ov.innerHTML = '<div style="background:var(--card,#fff);color:var(--ink,#2b2b2b);border-radius:18px;padding:22px 20px;max-width:300px;width:84%;text-align:center;font-family:inherit;box-shadow:0 12px 44px rgba(0,0,0,.45)">'
    + '<div style="font-size:18px;font-weight:800;margin-bottom:16px">هل تريدُ الخروجَ من التطبيق؟</div>'
    + '<div style="display:flex;gap:10px;justify-content:center">'
    + '<button id="exitNo" style="flex:1;border:none;border-radius:12px;padding:12px;font-weight:800;font-family:inherit;cursor:pointer;background:var(--primary,#6FB3D6);color:#fff">البقاء</button>'
    + '<button id="exitYes" style="flex:1;border:none;border-radius:12px;padding:12px;font-weight:800;font-family:inherit;cursor:pointer;background:#E0566B;color:#fff">خروج</button>'
    + '</div></div>';
  document.body.appendChild(ov);
  ov.querySelector("#exitYes").onclick = () => { ov.remove(); onYes(); };
  ov.querySelector("#exitNo").onclick = () => ov.remove();
}
function mountNativeBack() {
  try {
    const Cap = window.Capacitor;
    const App = Cap && Cap.Plugins && Cap.Plugins.App;
    if (!App || !App.addListener) return; // ليست حزمةً أصليّة
    const isLauncher = /(^|\/)home\.html$/.test(location.pathname) || location.pathname.endsWith("/");
    App.addListener("backButton", () => {
      const dlg = document.getElementById("exitConfirm");
      if (dlg) { dlg.remove(); return; } // نافذةُ التأكيد مفتوحةٌ → أغلِقْها
      // مُعالِجُ الصفحة (إن وُجِد): يتراجعُ مستوًى واحدًا داخل الصفحة (لغات/ألعاب) ويُرجِعُ true إن تراجَع
      // — فلا نخسرَ ما يفعلُه الطفلُ كما في سارة وريم.
      try { if (typeof window.appBack === "function" && window.appBack()) return; } catch (e) {}
      if (!isLauncher && window.history.length > 1) { window.history.back(); return; } // رجوعٌ تدريجيّ بين الصفحات
      if (!isLauncher) { location.href = "home.html"; return; }                          // لا تاريخ → الفهرس
      exitConfirm(() => App.exitApp());                                                  // على الفهرس → تأكيدُ الخروج/البقاء
    });
  } catch (e) {}
}
if (typeof document !== "undefined") {
  const onReady = () => { mountPanelGear(); mountNativeBack(); };
  if (document.readyState !== "loading") onReady();
  else document.addEventListener("DOMContentLoaded", onReady);
}
