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
    // نُنقّطُ بعرضِ A4 ثابتٍ (لا عرضِ الهاتف الضيّق) ليُطبَّقَ تنسيقُ الطباعة (لوحاتُ اللعبة تصطفُّ صفًّا فتقصُر)،
    // ونَطبعُ كلَّ قسمٍ (لعبة/بطاقات/ملصق) في صفحته فلا تنقسمُ اللعبةُ الواحدة. (html2canvas يُشكّلُ العربيّةَ صحيحةً.)
    const { jsPDF } = await import("jspdf");
    const h2c = await import("html2canvas");
    const html2canvas = h2c.default || h2c;
    const PRINT_W = 794; // عرضُ A4 عند 96dpi
    let sections = Array.from(node.querySelectorAll(".tpl"));            // كلُّ لعبةٍ ورقيّةٍ في صفحتها
    const cw = node.querySelector("#cardsWrap");
    if (cw && cw.offsetParent !== null && cw.querySelector(".pcard")) sections.push(cw);
    const pw = node.querySelector("#posterWrap > .poster"); if (pw) sections.push(pw);
    if (!sections.length) sections = [node];
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const M = 8, PW = 210, PH = 297, contentW = PW - 2 * M, contentH = PH - 2 * M;
    let first = true;
    for (const sec of sections) {
      const pw0 = sec.style.width, mw0 = sec.style.maxWidth, mg0 = sec.style.margin;
      sec.style.width = PRINT_W + "px"; sec.style.maxWidth = PRINT_W + "px"; sec.style.margin = "0";
      const canvas = await html2canvas(sec, { scale: 2, useCORS: true, backgroundColor: "#ffffff", windowWidth: PRINT_W, width: PRINT_W });
      sec.style.width = pw0; sec.style.maxWidth = mw0; sec.style.margin = mg0;
      const pagePx = Math.floor(canvas.width * contentH / contentW); // ارتفاعُ شريحةٍ يملأُ صفحة
      let sy = 0;
      while (sy < canvas.height) {
        const sliceH = Math.min(pagePx, canvas.height - sy);
        const pc = document.createElement("canvas"); pc.width = canvas.width; pc.height = sliceH;
        pc.getContext("2d").drawImage(canvas, 0, sy, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        const img = pc.toDataURL("image/jpeg", 0.92);
        if (!first) pdf.addPage(); first = false;
        pdf.addImage(img, "JPEG", M, M, contentW, sliceH * contentW / canvas.width);
        sy += sliceH;
      }
    }
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
