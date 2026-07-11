// src/backup.js — نسخةٌ احتياطيّة: تصدير/استيراد كلِّ بيانات الحسابات (مفاتيح tilmithi_*) كـJSON.
// مشترَكٌ بين لوحة التحكّم (index.html) وصفحة الوالدين (home.html). محلّيٌّ بالكامل، بلا شبكة.

const PFX = "tilmithi_";
function collect() { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(PFX) === 0) o[k] = localStorage.getItem(k); } return o; }
const isTil = k => k.indexOf(PFX) === 0;

// msg = دالّةُ إشعارٍ اختياريّة (text, ok:boolean).
export async function backupExport(msg = () => {}) {
  const payload = { app: "GT-MISHKATKIDS", type: "backup", schema: 1, exportedAt: new Date().toISOString(), keys: collect() };
  const json = JSON.stringify(payload, null, 2);
  const filename = `GT-MISHKATKIDS-backup-${new Date().toISOString().split("T")[0]}.json`;
  // (1) أندرويد/iOS: نكتبُ في الذاكرةِ المؤقّتة (CACHE) — لا تحتاجُ أيَّ صلاحيّةِ تخزينٍ —
  //     ثمّ نفتحُ صحيفةَ المشاركة (Share) ليحفظَه الأهلُ حيثُ شاؤوا. نفسُ نهجِ الطباعةِ المُثبَتِ على الهاتف.
  try {
    const P = (window.Capacitor && window.Capacitor.Plugins) || {};
    const Filesystem = P.Filesystem, Share = P.Share;
    const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    if (isNative && Filesystem && Share) {
      await Filesystem.writeFile({ path: filename, data: json, directory: "CACHE", encoding: "utf8" });
      const { uri } = await Filesystem.getUri({ path: filename, directory: "CACHE" });
      // الملفُّ وحدَه بلا نصّ: بعضُ تطبيقاتِ المراسلةِ يأخذُ النصَّ ويُسقِطُ المرفَق. + title = اسمُ الملفّ.
      await Share.share({ title: filename, files: [uri] });
      msg("✓ جاهزةٌ — اختَرْ تطبيقًا أو «حفظ في الملفّات» من صحيفةِ المشاركة.", true); return;
    }
  } catch (e) { const m = String((e && e.message) || e).toLowerCase(); if ((e && e.name === "AbortError") || m.includes("cancel")) return; }
  // (2) مشاركةُ الملفّ (ويب الهاتف)
  try {
    if (navigator.share) {
      const file = new File([json], filename, { type: "application/json" });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: filename }); msg("✓ تمّت المشاركة.", true); return; }
    }
  } catch (e) { if (e && e.name === "AbortError") return; }
  // (3) تنزيلٌ مباشر (سطح المكتب)
  const blob = new Blob([json], { type: "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  msg("✓ نُزِّل ملفُّ النسخةِ الاحتياطيّة.", true);
}

// استيرادٌ من نصِّ JSON مباشرةً (تُشارِكُه backupImport وفتحُ الملفِّ الوارد).
export function backupImportText(text, msg = () => {}) {
  let payload; try { payload = JSON.parse(text); } catch (e) { msg("تعذّر قراءةُ الملفّ (JSON غير صالح).", false); return false; }
  const keys = (payload && payload.keys && typeof payload.keys === "object") ? payload.keys : payload;
  if (!keys || typeof keys !== "object" || !Object.keys(keys).some(isTil)) { msg("ملفٌّ غير صالح — لا يحوي بياناتِ «مِشكاة».", false); return false; }
  const n = Object.keys(keys).filter(isTil).length;
  if (!confirm(`سيَستبدلُ الاستيرادُ كلَّ الحساباتِ والتقدّمِ والإعداداتِ الحاليّةَ على هذا الجهازِ بـ${n} عنصرًا من الملفّ. متابعة؟`)) return false;
  Object.keys(collect()).forEach(k => localStorage.removeItem(k));                 // امحُ القديمَ
  Object.keys(keys).forEach(k => { if (isTil(k)) localStorage.setItem(k, keys[k]); }); // استعِدْ
  msg("✓ استُعيدت البيانات — يُعادُ التحميلُ الآن…", true);
  setTimeout(() => location.reload(), 1000);
  return true;
}

export function backupImport(file, msg = () => {}) {
  const reader = new FileReader();
  reader.onload = () => backupImportText(reader.result, msg);
  reader.readAsText(file);
}

// فتحُ ملفِّ .json من خارجِ التطبيق (نقرٌ على الملفّ → «فتح بواسطة مِشكاة») على أندرويد:
// نقرأُ URI الملفِّ الوارد (VIEW) عبر Capacitor Filesystem ثمّ نعرضُ الاستيرادَ (بتأكيد). يتطلّبُ intent-filter (build-packages.sh).
export async function handleIncomingBackup(msg = () => {}) {
  try {
    const C = window.Capacitor;
    if (!(C && C.isNativePlatform && C.isNativePlatform())) return;
    const P = C.Plugins || {}, App = P.App, Filesystem = P.Filesystem;
    if (!App || !Filesystem) return;
    const looksJson = u => u && (u.startsWith("content://") || u.startsWith("file://")) ;
    const readImport = async (url) => {
      if (!looksJson(url)) return;
      if (sessionStorage.getItem("bk_incoming") === url) return; // لا تُكرّرِ المعالجةَ لنفسِ الملفّ
      sessionStorage.setItem("bk_incoming", url);
      try {
        const r = await Filesystem.readFile({ path: url, encoding: "utf8" });
        const text = typeof r.data === "string" ? r.data : "";
        if (text) backupImportText(text, msg);
      } catch (e) { try { msg("تعذّرت قراءةُ الملفّ المُختار — جرّبْ زرَّ «استيراد JSON».", false); } catch (_) {} }
    };
    const launch = await App.getLaunchUrl().catch(() => null);
    if (launch && launch.url) readImport(launch.url);
    App.addListener("appUrlOpen", d => { if (d && d.url) readImport(d.url); });
  } catch (e) {}
}

// نافذةٌ منبثقةٌ مستقلّةٌ بالزرّين (تُستدعى من بطاقةِ صفحة الوالدين) — بأنماطٍ مضمّنةٍ فتعملُ في أيّ صفحة.
export function openBackupModal() {
  const ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto";
  ov.innerHTML = `<div style="background:var(--card,#fff);color:var(--ink,#2b2b2b);max-width:420px;width:100%;border-radius:20px;box-shadow:0 20px 50px rgba(0,0,0,.35);padding:22px 18px;position:relative;font-family:inherit">
    <button data-x style="position:absolute;top:10px;inset-inline-start:12px;background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted,#888)">✕</button>
    <div style="font-size:19px;font-weight:800;margin-bottom:6px">💾 نسخةٌ احتياطيّة</div>
    <div style="font-size:13px;color:var(--muted,#777);margin-bottom:16px;line-height:1.7">صدّرْ ملفَّ JSON يحفظُ كلَّ الحساباتِ والتقدّمِ وإعداداتِ اللوحة، أو استوردْه على جهازٍ جديدٍ لئلّا تفقدَ بياناتَك.<br><b>الاستيرادُ يستبدلُ البياناتِ الحاليّةَ على هذا الجهاز.</b></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button data-exp style="flex:1;min-width:135px;padding:14px;border:none;border-radius:14px;background:linear-gradient(135deg,#4E8C3A,#6FB3D6);color:#fff;font-weight:800;font-size:15px;cursor:pointer;font-family:inherit">⬇️ تصدير JSON</button>
      <button data-imp style="flex:1;min-width:135px;padding:14px;border:2px solid var(--line,#ddd);border-radius:14px;background:var(--card,#fff);color:var(--ink,#2b2b2b);font-weight:800;font-size:15px;cursor:pointer;font-family:inherit">⬆️ استيراد JSON</button>
    </div>
    <input data-file type="file" accept="application/json,.json" hidden>
    <div data-msg style="font-size:12.5px;min-height:18px;margin-top:14px;text-align:center"></div>
  </div>`;
  document.body.appendChild(ov);
  const q = s => ov.querySelector(s);
  const msg = (t, ok) => { const el = q("[data-msg]"); if (el) { el.textContent = t; el.style.color = ok ? "#2f7d32" : "#c0392b"; } };
  const close = () => { try { ov.remove(); } catch (e) {} };
  q("[data-x]").onclick = close;
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  q("[data-exp]").onclick = () => backupExport(msg);
  const bf = q("[data-file]");
  q("[data-imp]").onclick = () => bf.click();
  bf.onchange = () => { if (bf.files && bf.files[0]) backupImport(bf.files[0], msg); bf.value = ""; };
}
