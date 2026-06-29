// src/smart-print.js — طباعةٌ تعملُ على كلّ المنصّات.
//   الويب/سطح المكتب: نافذةُ الطباعة المعتادة (window.print).
//   الهاتف (Capacitor): window.print لا يعمل في WebView أندرويد، و pdf.save() لا يُظهِرُ الملفَّ.
//   لذا نُولّدُ PDF (jsPDF + html2canvas المُضمَّنان) ونكتبُه في ذاكرةِ التطبيق المؤقّتة
//   ثمّ نفتحُ صحيفةَ المشاركة (Filesystem + Share) ليحفظَه/يطبعَه الأهل. محلّيٌّ بالكامل.

function isNativePhone() {
  try { return !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform()); }
  catch (e) { return false; }
}

// el: عنصرٌ أو مُعرِّفٌ (id). filename: اسمُ ملفّ الـPDF.
export async function smartPrint(el, filename = "مِشكاة.pdf") {
  if (!isNativePhone()) { window.print(); return; }
  const node = (typeof el === "string") ? document.getElementById(el) : el;
  if (!node) { window.print(); return; }
  let busy;
  try {
    busy = document.createElement("div");
    busy.textContent = "جارٍ إنشاءُ ملفّ الطباعة (PDF)…";
    busy.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);color:#fff;font-family:inherit;font-size:16px";
    document.body.appendChild(busy);
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "px", format: "a4", orientation: "portrait", hotfixes: ["px_scaling"] });
    const pageW = pdf.internal.pageSize.getWidth();
    const scale = Math.max(0.5, Math.min(2, (pageW - 32) / Math.max(1, node.scrollWidth)));
    await pdf.html(node, {
      x: 16, y: 16, autoPaging: "text",
      html2canvas: { scale, useCORS: true, backgroundColor: "#ffffff" },
      width: pageW - 32, windowWidth: node.scrollWidth,
    });
    const base64 = pdf.output("datauristring").split(",")[1];
    const P = (window.Capacitor && window.Capacitor.Plugins) || {};
    const Filesystem = P.Filesystem, Share = P.Share;
    if (Filesystem && Share) {
      // الذاكرةُ المؤقّتة (Cache) — لا تحتاجُ صلاحيّاتٍ، وتُشارَكُ عبر FileProvider.
      await Filesystem.writeFile({ path: filename, data: base64, directory: "CACHE" });
      const { uri } = await Filesystem.getUri({ path: filename, directory: "CACHE" });
      await Share.share({ title: filename, text: "ملفُّ الطباعة من مِشكاة 🖨️", files: [uri] });
    } else {
      pdf.save(filename); // ارتدادٌ إن غابتِ الإضافات
    }
  } catch (e) {
    const m = (e && e.message) || e;
    if (String(m).toLowerCase().includes("cancel")) return; // ألغى المستخدمُ المشاركة
    try { alert("تعذّر إنشاءُ ملفّ الطباعة على الهاتف: " + m + "\nيمكنك الطباعةُ من نسخة الحاسوب أو الموقع."); } catch (_) {}
  } finally {
    if (busy) busy.remove();
  }
}
