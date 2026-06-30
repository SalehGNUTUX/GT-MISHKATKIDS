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
    const PRINT_W = 794, SC = 2; // عرضُ A4 عند 96dpi + تكبيرٌ للوضوح
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const M = 8, PW = 210, PH = 297, contentW = PW - 2 * M, contentH = PH - 2 * M;
    let first = true;
    const addSlice = (canvas, sy, h) => {
      sy = Math.max(0, Math.floor(sy)); h = Math.min(Math.ceil(h), canvas.height - sy); if (h <= 0) return;
      const pc = document.createElement("canvas"); pc.width = canvas.width; pc.height = h;
      pc.getContext("2d").drawImage(canvas, 0, sy, canvas.width, h, 0, 0, canvas.width, h);
      if (!first) pdf.addPage(); first = false;
      pdf.addImage(pc.toDataURL("image/jpeg", 0.92), "JPEG", M, M, contentW, h * contentW / canvas.width);
    };
    // يُنقّطُ حاويًا بعرض A4 ثابت. مع blockSel: يَحشُّ كتلَه في الصفحات دون قطعِ كتلة (استغلالُ الورق)؛ بدونه: قطعٌ بالتساوي.
    const printContainer = async (c, blockSel) => {
      const w0 = c.style.width, m0 = c.style.maxWidth, g0 = c.style.margin;
      c.style.width = PRINT_W + "px"; c.style.maxWidth = PRINT_W + "px"; c.style.margin = "0";
      const blocks = blockSel ? Array.from(c.querySelectorAll(blockSel)) : [];
      const cTop = c.getBoundingClientRect().top;
      const offs = blocks.map(b => { const r = b.getBoundingClientRect(); return { top: r.top - cTop, bot: r.bottom - cTop }; });
      const canvas = await html2canvas(c, { scale: SC, useCORS: true, backgroundColor: "#ffffff", windowWidth: PRINT_W, width: PRINT_W });
      c.style.width = w0; c.style.maxWidth = m0; c.style.margin = g0;
      const pageH = canvas.width * contentH / contentW;
      if (!blocks.length) { let sy = 0; while (sy < canvas.height) { addSlice(canvas, sy, Math.min(pageH, canvas.height - sy)); sy += pageH; } return; }
      let i = 0;
      while (i < blocks.length) {
        const start = offs[i].top * SC; let end = start;
        while (i < blocks.length && (offs[i].bot * SC - start) <= pageH) { end = offs[i].bot * SC; i++; }
        if (end === start) { end = offs[i].bot * SC; i++; } // كتلةٌ أكبرُ من صفحة
        addSlice(canvas, start, end - start);
      }
    };
    const tw = node.querySelector("#templatesWrap");
    if (tw && tw.querySelector(".tpl")) await printContainer(tw, ".tpl");
    const cw = node.querySelector("#cardsWrap");
    if (cw && cw.offsetParent !== null && cw.querySelector(".pcard")) await printContainer(cw, null);
    const pw = node.querySelector("#posterWrap");
    if (pw && pw.querySelector(".poster")) await printContainer(pw, null);
    if (!tw && !cw && !pw) await printContainer(node, null); // شهادة/أنشطةٌ (لا حاويات معروفة)
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
