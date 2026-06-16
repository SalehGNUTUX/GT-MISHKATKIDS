// src/pdf-utils.js — توليد PDF من SVG داخل المتصفّح. محلّيٌّ بالكامل، دون شبكة.
// نَسلكُ مسلكَ التنقيط (Canvas → PNG → PDF) لأنّه يضمن نطقَ النصوص العربية تمامًا
// كما يرسمها المتصفّح، ويتجنّب مشاكل تشكيل الحروف العربية في مكتبات PDF النقية.
// الملفّ المُنزَّل ملفُّ PDF حقيقيٌّ قابلٌ للطباعة على A4 بمقياس 100% بمقاسٍ سليم.

let cachedJsPDF = null;
async function getJsPDF() {
  if (cachedJsPDF) return cachedJsPDF;
  const mod = await import("jspdf");
  cachedJsPDF = mod.jsPDF || mod.default || mod;
  return cachedJsPDF;
}

// تنقيطٌ بدقّةٍ تقريبية 200 نقطة لكلّ بوصة — وضوحٌ كافٍ للطباعة دون أن يَضخم الملفّ.
const A4_W_MM = 210, A4_H_MM = 297, DPI = 200;

export async function downloadSvgAsPdf(svgUrl, filename) {
  const res = await fetch(svgUrl);
  if (!res.ok) throw new Error("تعذّر جلب ملفّ SVG.");
  const svgText = await res.text();

  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload  = () => resolve();
      img.onerror = () => reject(new Error("تعذّر تحميل صورة SVG."));
      img.src = blobUrl;
    });

    const pxW = Math.round(A4_W_MM * DPI / 25.4);
    const pxH = Math.round(A4_H_MM * DPI / 25.4);
    const canvas = document.createElement("canvas");
    canvas.width = pxW; canvas.height = pxH;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, pxW, pxH);
    ctx.drawImage(img, 0, 0, pxW, pxH);
    const pngDataUrl = canvas.toDataURL("image/png");

    const JsPDF = await getJsPDF();
    const pdf = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    pdf.addImage(pngDataUrl, "PNG", 0, 0, A4_W_MM, A4_H_MM);
    pdf.save(filename);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
