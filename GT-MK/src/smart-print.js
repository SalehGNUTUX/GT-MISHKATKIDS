// src/smart-print.js — طباعةٌ تعملُ على كلّ المنصّات.
//   الويب/سطح المكتب: نافذةُ الطباعة المعتادة (window.print).
//   الهاتف (Capacitor): window.print لا يعمل في WebView أندرويد ⇒ نُولّدُ PDF من المحتوى
//   (jsPDF + html2canvas المُضمَّنان) ونحفظُه ليطبعَه الأهلُ لاحقًا. محلّيٌّ بالكامل.

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
    pdf.save(filename);
  } catch (e) {
    try { window.print(); } catch (_) {}
    try { alert("تعذّر إنشاءُ ملفّ الطباعة على الهاتف. يمكنك الطباعةُ من نسخة الحاسوب أو الموقع."); } catch (_) {}
  } finally {
    if (busy) busy.remove();
  }
}
