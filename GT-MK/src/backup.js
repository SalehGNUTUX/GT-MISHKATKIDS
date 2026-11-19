// src/backup.js — نسخةٌ احتياطيّة: تصدير/استيراد كلِّ بياناتِ «مِشكاة». محلّيٌّ بالكامل، بلا شبكة.
// مشترَكٌ بين لوحة التحكّم (index.html) وصفحة الوالدين (home.html).
//
// v1.11 — **نسخةٌ كاملة** (ZIP) تشملُ ما في IndexedDB لا localStorage وحدَه:
//   • tilmithi/captures         صورُ «أعمالي» وتسجيلاتُها وملاحظاتُها ورسوماتُ التلوين
//   • tilmithi_practice/rec     تسجيلاتُ الأبناءِ لقراءتِهم
//   • tilmithi_voices/voices    تسجيلاتُ صوتِ التطبيق (استوديو الوالدين)
//   الملفّ: backup.json (المفاتيح + السجلّات، وكلُّ Blob يصيرُ {"$blob": "media/…", "type"}) + مجلّدُ media/.
//   و«خفيفة» = JSON المفاتيحِ وحدَها (صيغةُ v1.5 نفسُها). الاستيرادُ يقبلُ الصيغتين، ويسألُ: دمجٌ أم استبدال.
// أمانُ قواعدِ البيانات: لا تُفتَحُ قاعدةٌ بإصدارٍ يُطلِقُ ترقيةً (tilmithi_voices لها ترحيلٌ في v3)؛ الموجودةُ تُفتَحُ
// بإصدارِها الحاليّ، وغيرُ الموجودةِ تُتخطّى عندَ التصدير وتُنشَأُ بمخطّطِ التطبيقِ نفسِه عندَ الاستيراد.
import { zipStore, unzipStore } from "./zip.js";

const PFX = "tilmithi_";
const isTil = k => k.indexOf(PFX) === 0;
const ACCOUNTS = "tilmithi_accounts_v1";
const DBS = [
  { name: "tilmithi", ver: 1, store: "captures", label: "صورُ «أعمالي» وتسجيلاتُها" },
  { name: "tilmithi_practice", ver: 1, store: "rec", label: "تسجيلاتُ القراءة" },
  { name: "tilmithi_voices", ver: 3, store: "voices", label: "تسجيلاتُ صوتِ التطبيق" },
];
function collect() { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && isTil(k)) o[k] = localStorage.getItem(k); } return o; }
const today = () => new Date().toISOString().split("T")[0];

// ── IndexedDB ───────────────────────────────────────────────────────────────────────────
async function dbExists(name) {
  try { if (indexedDB.databases) return (await indexedDB.databases()).some(d => d.name === name); } catch (e) {}
  return null; // غيرُ معروف
}
// فتحٌ بلا ترقية: الإصدارُ الحاليّ إن وُجدت، وإلّا null (لا نُنشئُ قاعدةً فارغةً بإصدارٍ خاطئ)
function openExisting(spec) {
  return new Promise(res => {
    let created = false;
    const r = indexedDB.open(spec.name);
    r.onupgradeneeded = () => { created = true; try { r.transaction.abort(); } catch (e) {} };
    r.onsuccess = () => { const db = r.result; if (created || !db.objectStoreNames.contains(spec.store)) { db.close(); res(null); } else res(db); };
    r.onerror = () => res(null);
  });
}
// فتحٌ للكتابة: الموجودةُ بإصدارِها، وغيرُ الموجودةِ تُنشَأُ بمخطّطِ التطبيق (store بمفتاح key)
async function openForWrite(spec) {
  const ex = await dbExists(spec.name);
  if (ex !== false) { const db = await openExisting(spec); if (db) return db; }
  return new Promise((res, rej) => {
    const r = indexedDB.open(spec.name, spec.ver);
    r.onupgradeneeded = () => { const db = r.result; if (!db.objectStoreNames.contains(spec.store)) db.createObjectStore(spec.store, { keyPath: "key" }); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
const allRecords = (db, store) => new Promise(res => { const rq = db.transaction(store, "readonly").objectStore(store).getAll(); rq.onsuccess = () => res(rq.result || []); rq.onerror = () => res([]); });
const allKeys = (db, store) => new Promise(res => { const rq = db.transaction(store, "readonly").objectStore(store).getAllKeys(); rq.onsuccess = () => res(new Set(rq.result || [])); rq.onerror = () => res(new Set()); });

// ── التصدير ──────────────────────────────────────────────────────────────────────────────
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "m4a", "audio/mpeg": "mp3", "video/webm": "webm", "video/mp4": "mp4" };
async function buildFull() {
  const files = [], idb = {}, counts = {};
  let n = 0;
  for (const spec of DBS) {
    const db = await openExisting(spec); if (!db) continue;
    const recs = await allRecords(db, spec.store); db.close();
    const out = [];
    for (const rec of recs) {
      const o = {};
      for (const [k, v] of Object.entries(rec)) {
        if (v instanceof Blob) {
          const path = `media/${spec.name}/${++n}.${EXT[(v.type || "").split(";")[0]] || "bin"}`;
          files.push({ name: path, data: new Uint8Array(await v.arrayBuffer()) });
          o[k] = { $blob: path, type: v.type || "" };
        } else o[k] = v;
      }
      out.push(o);
    }
    idb[spec.name] = { store: spec.store, records: out }; counts[spec.name] = out.length;
  }
  const payload = { app: "GT-MISHKATKIDS", type: "backup", schema: 2, exportedAt: new Date().toISOString(), keys: collect(), idb, counts };
  files.unshift({ name: "backup.json", data: new TextEncoder().encode(JSON.stringify(payload)) });
  return { blob: zipStore(files), counts, media: files.length - 1 };
}
async function deliver(blob, filename, mime, msg) {
  // (1) أندرويد: نكتبُ في CACHE (بلا صلاحيّةِ تخزين) ثمّ صحيفةُ المشاركة — نهجُ الطباعةِ نفسُه
  try {
    const P = (window.Capacitor && window.Capacitor.Plugins) || {};
    const Filesystem = P.Filesystem, Share = P.Share;
    const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    if (isNative && Filesystem && Share) {
      const b64 = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(",")[1] || ""); fr.readAsDataURL(blob); });
      await Filesystem.writeFile({ path: filename, data: b64, directory: "CACHE" });
      const { uri } = await Filesystem.getUri({ path: filename, directory: "CACHE" });
      await Share.share({ title: filename, files: [uri] });   // الملفُّ وحدَه: بعضُ التطبيقاتِ يُسقِطُ المرفقَ مع نصّ
      msg("✓ جاهزةٌ — اختَرْ تطبيقًا أو «حفظ في الملفّات» من صحيفةِ المشاركة.", true); return;
    }
  } catch (e) { const m = String((e && e.message) || e).toLowerCase(); if ((e && e.name === "AbortError") || m.includes("cancel")) return; }
  // (2) مشاركةُ الويب للملفّات (متصفّحاتُ الهاتف)
  try {
    if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
      const file = new File([blob], filename, { type: mime });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: filename }); msg("✓ تمّت المشاركة.", true); return; }
    }
  } catch (e) { if (e && e.name === "AbortError") return; }
  // (3) تنزيلٌ مباشر (سطحُ المكتب)
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
  msg("✓ نُزِّل ملفُّ النسخةِ الاحتياطيّة.", true);
}
/** full=true ⇒ ZIP كاملٌ بالوسائط؛ وإلّا JSON الحساباتِ والتقدّمِ والإعداداتِ وحدَها. */
export async function backupExport(msg = () => {}, { full = false } = {}) {
  if (!full) {
    const json = JSON.stringify({ app: "GT-MISHKATKIDS", type: "backup", schema: 1, exportedAt: new Date().toISOString(), keys: collect() }, null, 2);
    return deliver(new Blob([json], { type: "application/json" }), `GT-MISHKATKIDS-backup-${today()}.json`, "application/json", msg);
  }
  msg("… يجمعُ البياناتِ والتسجيلاتِ والصور", true);
  try {
    const { blob, media } = await buildFull();
    const mb = (blob.size / 1048576).toFixed(1);
    msg(`… ${media} ملفّ وسائط (${mb} م.ب)`, true);
    await deliver(blob, `GT-MISHKATKIDS-backup-full-${today()}.zip`, "application/zip", msg);
  } catch (e) { msg("تعذّرَ إنشاءُ النسخةِ الكاملة: " + ((e && e.message) || e), false); }
}

// ── الاستيراد ────────────────────────────────────────────────────────────────────────────
// يقرأُ JSON (schema 1/2) أو ZIP؛ يُرجِعُ { keys, idb, files } أو null
function parseBackup(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (u8[0] === 0x50 && u8[1] === 0x4b) {            // «PK» ⇒ ZIP
    const files = unzipStore(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength));
    if (!files["backup.json"]) return null;
    const p = JSON.parse(new TextDecoder().decode(files["backup.json"]));
    return { keys: p.keys || {}, idb: p.idb || {}, files };
  }
  const p = JSON.parse(new TextDecoder().decode(u8));
  const keys = (p && p.keys && typeof p.keys === "object") ? p.keys : p;
  return { keys, idb: (p && p.idb) || {}, files: {} };
}
function reviveRecord(rec, files) {
  const o = {};
  for (const [k, v] of Object.entries(rec)) {
    if (v && typeof v === "object" && v.$blob) { const d = files[v.$blob]; o[k] = d ? new Blob([d], { type: v.type || "" }) : null; }
    else o[k] = v;
  }
  return o;
}
// دمجُ الحسابات: اتّحادُ الأبناءِ بالمعرّف، وإعداداتُ هذا الجهازِ (كلمةُ المرورِ وغيرُها) تبقى
function mergeAccounts(localStr, incomingStr) {
  let L, I; try { L = JSON.parse(localStr) || {}; I = JSON.parse(incomingStr) || {}; } catch (e) { return localStr; }
  const have = new Set((L.profiles || []).map(p => p.id));
  L.profiles = (L.profiles || []).concat((I.profiles || []).filter(p => !have.has(p.id)));
  L.settings = L.settings || I.settings || {};
  return JSON.stringify(L);
}
async function applyBackup(b, mode) {
  const keys = Object.keys(b.keys || {}).filter(isTil);
  if (mode === "replace") {
    Object.keys(collect()).forEach(k => localStorage.removeItem(k));
    keys.forEach(k => localStorage.setItem(k, b.keys[k]));
  } else {
    for (const k of keys) {
      const cur = localStorage.getItem(k);
      if (cur == null) localStorage.setItem(k, b.keys[k]);
      else if (k === ACCOUNTS) localStorage.setItem(k, mergeAccounts(cur, b.keys[k]));   // غيرُها: ما على الجهازِ يبقى
    }
  }
  let added = 0;
  for (const spec of DBS) {
    const part = (b.idb || {})[spec.name];
    if (!part) continue;   // قاعدةٌ لم تَرِدْ في الملفّ (نسخةٌ خفيفة) لا تُمسّ — ولا في الاستبدال
    const db = await openForWrite(spec);
    const existing = mode === "replace" ? new Set() : await allKeys(db, spec.store);
    await new Promise((res, rej) => {
      const tx = db.transaction(spec.store, "readwrite"), os = tx.objectStore(spec.store);
      if (mode === "replace") os.clear();
      for (const r of part.records || []) { if (!existing.has(r.key)) { os.put(reviveRecord(r, b.files)); added++; } }
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
    db.close();
  }
  return { keys: keys.length, added };
}
// نافذةُ الاختيار: ملخّصُ المحتوى + دمج/استبدال/إلغاء (تعملُ في أيِّ صفحة)
function chooseMode(summary) {
  return new Promise(resolve => {
    const ov = document.createElement("div");
    ov.style.cssText = "position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:18px";
    ov.innerHTML = `<div style="background:var(--card,#fff);color:var(--ink,#2b2b2b);max-width:430px;width:100%;border-radius:18px;padding:20px 18px;box-shadow:0 20px 50px rgba(0,0,0,.35);font-family:inherit">
      <div style="font-size:17px;font-weight:800;margin-bottom:8px">⬆️ استعادةُ نسخةٍ احتياطيّة</div>
      <div style="font-size:13px;line-height:1.8;margin-bottom:12px">${summary}</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button data-m="merge" style="padding:12px;border:none;border-radius:12px;background:#4E8C3A;color:#fff;font-weight:800;font-family:inherit;font-size:14px;cursor:pointer">➕ دمج — أضِفِ الناقصَ وأبقِ ما على الجهاز</button>
        <button data-m="replace" style="padding:12px;border:none;border-radius:12px;background:#C0573E;color:#fff;font-weight:800;font-family:inherit;font-size:14px;cursor:pointer">♻️ استبدال — امحُ ما على الجهازِ واستعِدِ الملفّ</button>
        <button data-m="" style="padding:10px;border:1px solid var(--line,#ddd);border-radius:12px;background:var(--card,#fff);color:var(--ink,#2b2b2b);font-family:inherit;font-size:14px;cursor:pointer">إلغاء</button>
      </div></div>`;
    document.body.appendChild(ov);
    ov.addEventListener("click", e => { const b = e.target.closest("[data-m]"); if (!b && e.target !== ov) return; const m = b ? b.dataset.m : ""; ov.remove(); resolve(m || null); });
  });
}
export async function backupImportBytes(bytes, msg = () => {}) {
  let b; try { b = parseBackup(bytes); } catch (e) { b = null; }
  if (!b || !Object.keys(b.keys || {}).some(isTil)) { msg("ملفٌّ غيرُ صالح — لا يحوي بياناتِ «مِشكاة».", false); return false; }
  let kids = 0; try { kids = (JSON.parse(b.keys[ACCOUNTS] || "{}").profiles || []).length; } catch (e) {}
  const media = DBS.map(s => { const n = ((b.idb || {})[s.name] || {}).records; return n && n.length ? `${s.label}: <b>${n.length}</b>` : ""; }).filter(Boolean);
  const summary = `في الملفّ: <b>${kids}</b> ${kids === 1 ? "حسابُ طفل" : "حساباتِ أطفال"} وتقدّمُهم وإعداداتُ اللوحة`
    + (media.length ? `<br>${media.join("<br>")}` : `<br><span style="opacity:.75">(نسخةٌ خفيفة — بلا تسجيلاتٍ ولا صور)</span>`);
  const mode = await chooseMode(summary);
  if (!mode) return false;
  try {
    msg("… يستعيد", true);
    const r = await applyBackup(b, mode);
    msg(`✓ استُعيدت البيانات${r.added ? ` ومعها ${r.added} من التسجيلاتِ والصورِ والملاحظات` : ""} — يُعادُ التحميلُ الآن…`, true);
    setTimeout(() => location.reload(), 1200);
    return true;
  } catch (e) { msg("تعذّرَتِ الاستعادة: " + ((e && e.message) || e), false); return false; }
}
// توافقٌ: نصُّ JSON مباشرةً (فتحُ ملفٍّ واردٍ على أندرويد)
export function backupImportText(text, msg = () => {}) { return backupImportBytes(new TextEncoder().encode(text), msg); }
export function backupImport(file, msg = () => {}) {
  const reader = new FileReader();
  reader.onload = () => backupImportBytes(new Uint8Array(reader.result), msg);
  reader.onerror = () => msg("تعذّرت قراءةُ الملفّ.", false);
  reader.readAsArrayBuffer(file);
}

// فتحُ ملفِّ نسخةٍ من خارجِ التطبيق (نقرٌ على الملفّ → «فتح بواسطة مِشكاة») على أندرويد:
// نقرأُ URI الملفِّ الوارد عبر Capacitor Filesystem (base64 ⇒ JSON أو ZIP). يتطلّبُ intent-filter (build-packages.sh).
export async function handleIncomingBackup(msg = () => {}) {
  try {
    const C = window.Capacitor;
    if (!(C && C.isNativePlatform && C.isNativePlatform())) return;
    const P = C.Plugins || {}, App = P.App, Filesystem = P.Filesystem;
    if (!App || !Filesystem) return;
    const looksFile = u => u && (u.startsWith("content://") || u.startsWith("file://"));
    const readImport = async (url) => {
      if (!looksFile(url)) return;
      if (sessionStorage.getItem("bk_incoming") === url) return;   // لا تُكرّرِ المعالجةَ لنفسِ الملفّ
      sessionStorage.setItem("bk_incoming", url);
      try {
        const r = await Filesystem.readFile({ path: url });          // بلا ترميز ⇒ base64 (يصلحُ للنصِّ والثنائيّ)
        const bin = atob(typeof r.data === "string" ? r.data : ""), u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        if (u8.length) backupImportBytes(u8, msg);
      } catch (e) { try { msg("تعذّرت قراءةُ الملفّ المُختار — جرّبْ زرَّ «استيراد».", false); } catch (_) {} }
    };
    const launch = await App.getLaunchUrl().catch(() => null);
    if (launch && launch.url) readImport(launch.url);
    App.addListener("appUrlOpen", d => { if (d && d.url) readImport(d.url); });
  } catch (e) {}
}

// نافذةٌ منبثقةٌ مستقلّة (بطاقةُ صفحةِ الوالدين) — بأنماطٍ مضمّنةٍ فتعملُ في أيِّ صفحة.
export function openBackupModal() {
  const ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto";
  ov.innerHTML = `<div style="background:var(--card,#fff);color:var(--ink,#2b2b2b);max-width:440px;width:100%;border-radius:20px;box-shadow:0 20px 50px rgba(0,0,0,.35);padding:22px 18px;position:relative;font-family:inherit">
    <button data-x style="position:absolute;top:10px;inset-inline-start:12px;background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted,#888)">✕</button>
    <div style="font-size:19px;font-weight:800;margin-bottom:6px">💾 نسخةٌ احتياطيّة</div>
    <div style="font-size:13px;color:var(--muted,#777);margin-bottom:16px;line-height:1.7"><b>الكاملة</b> تحفظُ الحساباتِ والتقدّمَ والإعدادات <b>ومعها كلَّ التسجيلاتِ والصورِ والرسومات</b> (ملفُّ ZIP). <b>الخفيفةُ</b> بلا وسائط (JSON صغير). عند الاستيرادِ تختارُ: دمجٌ أو استبدال.</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button data-full style="flex:1 1 100%;padding:14px;border:none;border-radius:14px;background:linear-gradient(135deg,#4E8C3A,#6FB3D6);color:#fff;font-weight:800;font-size:15px;cursor:pointer;font-family:inherit">⬇️ نسخةٌ كاملة (ZIP)</button>
      <button data-exp style="flex:1;min-width:135px;padding:12px;border:2px solid var(--line,#ddd);border-radius:14px;background:var(--card,#fff);color:var(--ink,#2b2b2b);font-weight:800;font-size:14px;cursor:pointer;font-family:inherit">⬇️ خفيفة (JSON)</button>
      <button data-imp style="flex:1;min-width:135px;padding:12px;border:2px solid var(--line,#ddd);border-radius:14px;background:var(--card,#fff);color:var(--ink,#2b2b2b);font-weight:800;font-size:14px;cursor:pointer;font-family:inherit">⬆️ استيراد</button>
    </div>
    <input data-file type="file" accept="application/json,.json,application/zip,.zip" hidden>
    <div data-msg style="font-size:12.5px;min-height:18px;margin-top:14px;text-align:center"></div>
  </div>`;
  document.body.appendChild(ov);
  const q = s => ov.querySelector(s);
  const msg = (t, ok) => { const el = q("[data-msg]"); if (el) { el.textContent = t; el.style.color = ok ? "#2f7d32" : "#c0392b"; } };
  const close = () => { try { ov.remove(); } catch (e) {} };
  q("[data-x]").onclick = close;
  ov.addEventListener("click", e => { if (e.target === ov) close(); });
  q("[data-full]").onclick = () => backupExport(msg, { full: true });
  q("[data-exp]").onclick = () => backupExport(msg);
  const bf = q("[data-file]");
  q("[data-imp]").onclick = () => bf.click();
  bf.onchange = () => { if (bf.files && bf.files[0]) backupImport(bf.files[0], msg); bf.value = ""; };
}
