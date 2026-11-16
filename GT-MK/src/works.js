// src/works.js — حفظُ عملٍ في «📂 أعمالي» من أيِّ صفحة (v1.9: رسماتُ التلوين).
// «أعمالي» (viewMyWorks في index.html) تَعرضُ مدخلاتِ progress.log ومعها الوسائطَ المحفوظةَ بطابعِ الوقتِ نفسِه
// في IndexedDB «tilmithi» → «captures». المخطّطُ هنا مطابقٌ لـidb()/putCapture في index.html — إن تغيّرَ هناك فغيِّرْه هنا.
import { addWorkEntry } from "./progress.js";

function idb() {
  return new Promise((res, rej) => { const r = indexedDB.open("tilmithi", 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("captures")) r.result.createObjectStore("captures", { keyPath: "key" }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
}
async function putCapture(rec) {
  const db = await idb();
  return new Promise((res, rej) => { const tx = db.transaction("captures", "readwrite"); tx.objectStore("captures").put(rec);
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
/** يحفظُ صورةً (Blob) عملًا جديدًا. يُرجِعُ true عند النجاح. */
export async function saveWork({ id, title, domain, blob }) {
  const ts = Date.now();
  try {
    await putCapture({ key: ts + "-0-photo", ts, memId: id, title, type: "photo", blob });
    addWorkEntry({ id, title, domain, age_band: "", ts, hasAudio: false, hasPhoto: true, hasNote: false, work: true });
    return true;
  } catch (e) { return false; }
}
