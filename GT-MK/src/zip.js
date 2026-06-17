// src/zip.js — مولّد ملفّ ZIP بسيط (تخزينٌ دون ضغط) بلا أيّ تبعيات. محلّيّ بالكامل.
// يدعم المجلّدات عبر «/» في الأسماء. يُستعمل لتصدير التسجيلات البشرية مصنَّفةً.
function crc32(u8) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u8.length; i++) { c ^= u8[i]; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1)); }
  return (c ^ 0xFFFFFFFF) >>> 0;
}
const bytes = s => new TextEncoder().encode(s);

// files: [{ name: "مجلّد/ملفّ.ext", data: Uint8Array }]  →  Blob (application/zip)
export function zipStore(files) {
  const parts = [], central = [];
  let offset = 0;
  for (const f of files) {
    const nameB = bytes(f.name), data = f.data, crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true);
    lh.setUint16(6, 0x0800, true); // علامة UTF-8 لأسماء عربية صحيحة
    lh.setUint16(8, 0, true); lh.setUint16(10, 0, true); lh.setUint16(12, 0, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
    lh.setUint16(26, nameB.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), nameB, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true); // علامة UTF-8
    ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
    ch.setUint16(28, nameB.length, true); ch.setUint32(42, offset, true);
    central.push({ head: new Uint8Array(ch.buffer), name: nameB });
    offset += 30 + nameB.length + data.length;
  }
  const cdStart = offset; let cdSize = 0;
  for (const c of central) { parts.push(c.head, c.name); cdSize += 46 + c.name.length; }
  const eo = new DataView(new ArrayBuffer(22));
  eo.setUint32(0, 0x06054b50, true);
  eo.setUint16(8, central.length, true); eo.setUint16(10, central.length, true);
  eo.setUint32(12, cdSize, true); eo.setUint32(16, cdStart, true);
  parts.push(new Uint8Array(eo.buffer));
  return new Blob(parts, { type: "application/zip" });
}

// قراءةُ ZIP تخزينيّ (المُنتَج بـzipStore): يُرجِع { "اسم الملفّ": Uint8Array } — بلا فكّ ضغطٍ (تخزينٌ فقط).
// يقرأ السجلّاتِ المحلّيّةَ تتابعاً حتى الفهرس المركزيّ. الأسماء UTF-8.
export function unzipStore(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf), dec = new TextDecoder("utf-8");
  const out = {};
  let i = 0;
  while (i + 30 <= dv.byteLength && dv.getUint32(i, true) === 0x04034b50) {
    const method = dv.getUint16(i + 8, true);
    const compSize = dv.getUint32(i + 18, true);
    const nameLen = dv.getUint16(i + 26, true);
    const extraLen = dv.getUint16(i + 28, true);
    const nameStart = i + 30;
    const name = dec.decode(u8.subarray(nameStart, nameStart + nameLen));
    const dataStart = nameStart + nameLen + extraLen;
    if (method === 0) out[name] = u8.slice(dataStart, dataStart + compSize); // تخزينٌ ⇒ خام
    i = dataStart + compSize;
  }
  return out;
}
