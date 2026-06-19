// src/voices.js — نموذجُ صوتِ التطبيق البشريّ (النطق الذي يسمعه الجميع). محلّيّ بالكامل على الجهاز.
// **مشترَكٌ للجميع**: يبنيه الوالدان في الاستوديو (record.html) فيصير صوتَ التطبيق لكلّ الحسابات.
// (مُسجِّلُ تمرّنِ الطفل الشخصيّ مختلفٌ تماماً — انظر src/practice.js؛ ذاك لكلّ حسابٍ على حدة.)
// داخل النموذج: كلّ مُسجِّل = «مجموعةٌ» (setId = الجنس-الفئة-الاسم). خريطةٌ في الذاكرة (نصّ→objectURL).
const DB = "tilmithi_voices", STORE = "voices", SEP = " ";
const VER = 3;
const SHARED = "shared"; // كلّ تسجيلات النموذج عامّةٌ تحت حسابٍ واحدٍ مشترك

function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, VER);
    r.onupgradeneeded = () => {
      const db = r.result, tx = r.transaction;
      if (db.objectStoreNames.contains(STORE)) {
        // ترحيلٌ آمن: تسجيلاتٌ سابقة → تبقى دون فقدان (مفتاحٌ موحَّد account+setId+text).
        const rq = tx.objectStore(STORE).getAll();
        rq.onsuccess = () => {
          const old = rq.result || [];
          db.deleteObjectStore(STORE);
          const ns = db.createObjectStore(STORE, { keyPath: "key" });
          for (const o of old) {
            const text = String(o.text || "").trim(); if (!text) continue;
            const setId = o.setId || "legacy";
            ns.put({ key: mkKey(setId, text), setId, text, blob: o.blob, meta: o.meta || null });
          }
        };
      } else {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const mkKey = (setId, text) => SHARED + SEP + String(setId) + SEP + String(text).trim();

export async function saveVoice(setId, text, blob, meta) {
  const db = await idb();
  return new Promise((res, rej) => { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).put({ key: mkKey(setId, text), setId, text: String(text).trim(), blob, meta: meta || null }); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
export async function deleteVoice(setId, text) {
  const db = await idb();
  return new Promise(res => { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).delete(mkKey(setId, text)); tx.oncomplete = () => res(); tx.onerror = () => res(); });
}
export async function allVoices() {
  try { const db = await idb(); return await new Promise(res => { const tx = db.transaction(STORE, "readonly"); const rq = tx.objectStore(STORE).getAll(); rq.onsuccess = () => res(rq.result || []); rq.onerror = () => res([]); }); }
  catch (e) { return []; }
}
export async function voicesOfSet(setId) { return (await allVoices()).filter(v => v.setId === setId); }
export async function listSets() {
  const all = await allVoices(), m = new Map();
  for (const v of all) { const e = m.get(v.setId) || { setId: v.setId, count: 0, meta: v.meta }; e.count++; m.set(v.setId, e); }
  return [...m.values()];
}
// ضمّ/إعادة تسمية: ينقل تسجيلات مجموعةٍ إلى أخرى (دمجٌ دون فقدان) بمعلوماتٍ جديدة.
export async function renameSet(oldId, newId, meta) {
  if (oldId === newId) return;
  const recs = await voicesOfSet(oldId), db = await idb();
  return new Promise(res => {
    const tx = db.transaction(STORE, "readwrite"), os = tx.objectStore(STORE);
    for (const r of recs) { os.delete(r.key); os.put({ key: mkKey(newId, r.text), setId: newId, text: r.text, blob: r.blob, meta: meta || r.meta || null }); }
    tx.oncomplete = () => res(); tx.onerror = () => res();
  });
}
export async function clearSet(setId) {
  const db = await idb(); const all = await voicesOfSet(setId);
  return new Promise(res => { const tx = db.transaction(STORE, "readwrite"); const os = tx.objectStore(STORE); all.forEach(v => os.delete(v.key)); tx.oncomplete = () => res(); tx.onerror = () => res(); });
}
export async function clearVoices() {
  try { const db = await idb(); return await new Promise(res => { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).clear(); tx.oncomplete = () => res(); tx.onerror = () => res(); }); } catch (e) {}
}

// خريطة الذاكرة لتشغيلٍ متزامن من tts-clips (نصّ→objectURL، مفتاح setId+SEP+text).
let urlMap = new Map();
export function deviceURL(setId, text) { return urlMap.get(String(setId) + SEP + String(text).trim()) || null; }
// أيُّ تسجيلٍ بشريٍّ على الجهاز لهذا النصّ (لأيِّ مجموعة) — لوضع «أفضل المتاح» التلقائيّ.
export function deviceAnyURL(text) { const suf = SEP + String(text).trim(); for (const [k, u] of urlMap) { if (k.endsWith(suf)) return u; } return null; }
export function voiceCount() { return urlMap.size; }
export async function primeVoices() {
  try {
    for (const u of urlMap.values()) { try { URL.revokeObjectURL(u); } catch (e) {} }
    urlMap = new Map();
    const all = await allVoices();
    for (const v of all) if (v.blob) urlMap.set(v.setId + SEP + v.text, URL.createObjectURL(v.blob));
  } catch (e) {}
  return urlMap.size;
}
