// src/practice.js — مُسجِّلُ تمرّنِ القراءة الشخصيّ، **لكلِّ حسابٍ على حدة**. محلّيّ بالكامل.
// يختلف عن src/voices.js (نموذج صوت التطبيق المشترك للجميع): هنا يسجّل الطفلُ قراءتَه للكلمة/الجملة/القصّة
// في حسابه، فيستمعُ إليها ويتابعُ مستواه. حسابُ الطفل يبقى محليًّا؛ حسابُ الضيف مؤقّتٌ يُمسَح بإغلاق البرنامج.
// ميزةُ المساعدة: يمكن لطفلٍ أن يستعينَ بقراءةِ حسابٍ آخر (أختِه مثلاً) أو صوتِ التطبيق لنصٍّ لم يعرفْه.
import { getCurrentUser } from "./accounts.js";
const DB = "tilmithi_practice", STORE = "rec", SEP = ""; // فاصلٌ نادرٌ (النصوص قد تحوي فراغات)
const VER = 1;

function acct() { try { const u = getCurrentUser(); return (u && u.id) ? u.id : "default"; } catch (e) { return "default"; } }
function accountName() { try { const u = getCurrentUser(); return (u && u.name) || ""; } catch (e) { return ""; } }

function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, VER);
    r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "key" }); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const mkKey = (account, text) => String(account) + SEP + String(text).trim();

export async function savePractice(text, blob, ts) {
  const a = acct(), db = await idb();
  return new Promise((res, rej) => { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).put({ key: mkKey(a, text), account: a, name: accountName(), text: String(text).trim(), blob, ts: ts || 0 }); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
export async function deletePractice(text) {
  const a = acct(), db = await idb();
  return new Promise(res => { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).delete(mkKey(a, text)); tx.oncomplete = () => res(); tx.onerror = () => res(); });
}
async function allRecords() {
  try { const db = await idb(); return await new Promise(res => { const tx = db.transaction(STORE, "readonly"); const rq = tx.objectStore(STORE).getAll(); rq.onsuccess = () => res(rq.result || []); rq.onerror = () => res([]); }); }
  catch (e) { return []; }
}
// تسجيلُ الحساب النشط لهذا النصّ (إن وُجد).
export async function getPractice(text) { const a = acct(), t = String(text).trim(); return (await allRecords()).find(r => r.account === a && r.text === t) || null; }
// كلّ تسجيلات الحساب النشط.
export async function listPractice() { const a = acct(); return (await allRecords()).filter(r => r.account === a); }
// تسجيلاتُ هذا النصّ من حساباتٍ أخرى (للمساعدة: «استمعْ لقراءة أختك»). تستثني الحساب النشط.
export async function helpersFor(text) { const a = acct(), t = String(text).trim(); return (await allRecords()).filter(r => r.text === t && r.account !== a); }
// تجميعٌ بحسب الحساب (لإدارة الأهل): { account, name, count }.
export async function practiceByAccount() {
  const all = await allRecords(), m = new Map();
  for (const r of all) { const e = m.get(r.account) || { account: r.account, name: r.name || "", count: 0 }; e.count++; if (r.name) e.name = r.name; m.set(r.account, e); }
  return [...m.values()];
}
export async function clearAccount(accountId) {
  const db = await idb(); const all = (await allRecords()).filter(r => r.account === accountId);
  return new Promise(res => { const tx = db.transaction(STORE, "readwrite"); const os = tx.objectStore(STORE); all.forEach(r => os.delete(r.key)); tx.oncomplete = () => res(); tx.onerror = () => res(); });
}

// تنظيفُ الضيف: تسجيلاتُ التمرّنِ للضيف مؤقّتةٌ تُمسَح ببدايةِ كلِّ جلسةٍ جديدة (إغلاقٌ ثمّ فتح).
try {
  if (!sessionStorage.getItem("tilmithi_practice_session")) {
    sessionStorage.setItem("tilmithi_practice_session", "1");
    clearAccount("guest");
  }
} catch (e) {}
