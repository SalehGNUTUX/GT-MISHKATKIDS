// src/updater.js — التحديثُ من داخلِ التطبيق: إشعارٌ بتوفّرِ إصدارٍ جديد ← تنزيلٌ ← تثبيت.
// • سطحُ المكتب (Electron): كلُّ الشبكةِ والتثبيتِ في العمليّة الرئيسيّة (electron/updates.cjs) عبرَ window.mishkatDesktop.
// • أندرويد (Capacitor): الفحصُ هنا (واجهةُ GitHub تسمحُ بـCORS)، والتنزيلُ والتثبيتُ بالمكوّنِ الأصليّ MishkatUpdater.
// • الويب/PWA: لا شيء — عاملُ الخدمةِ يُحدِّثُ نفسَه تلقائيًّا (skipWaiting).
// الخصوصيّة: الطلبُ الوحيدُ قراءةُ قائمةِ الإصداراتِ العامّة من GitHub؛ لا يُرسَلُ شيءٌ عن الطفلِ أو الجهاز.
// استثناءٌ مأذونٌ من «محلّيٌّ 100%» (طلبُ المستخدم)، يُطفئُه الوالدُ من لوحةِ التحكّم. التثبيتُ خلفَ كلمةِ مرورِ الوالدين.
import { confirmWithPassword } from "./confirm-action.js";
import { isParent } from "./accounts.js";

export const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "0.0.0";
const REPO = "SalehGNUTUX/GT-MISHKATKIDS";
const API = `https://api.github.com/repos/${REPO}/releases?per_page=20`;
const PAGE = `https://github.com/${REPO}/releases/latest`;
const PREF_KEY = "tilmithi_update_check";      // "off" يُطفئُ الفحصَ التلقائيّ (افتراضُه مُفعَّل)
const STATE_KEY = "tilmithi_update_state_v1";  // { lastCheck, skipped }
const AUTO_EVERY = 24 * 3600 * 1000;           // فحصٌ تلقائيٌّ واحدٌ في اليوم على الأكثر

const lsGet = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const getState = () => { try { return JSON.parse(lsGet(STATE_KEY, "{}")) || {}; } catch (e) { return {}; } };
const setState = patch => lsSet(STATE_KEY, JSON.stringify({ ...getState(), ...patch }));

export const isAutoCheckOn = () => lsGet(PREF_KEY, "on") !== "off";
export const setAutoCheckOn = on => lsSet(PREF_KEY, on ? "on" : "off");

const desktop = () => (typeof window !== "undefined" && window.mishkatDesktop && window.mishkatDesktop.updates) || null;
const native = () => {
  const C = typeof window !== "undefined" && window.Capacitor;
  return C && C.isNativePlatform && C.isNativePlatform() && C.getPlatform && C.getPlatform() === "android"
    && C.Plugins && C.Plugins.MishkatUpdater ? C.Plugins.MishkatUpdater : null;
};
/** "desktop" | "android" | "web" */
export function updatePlatform() { return desktop() ? "desktop" : native() ? "android" : "web"; }

// ── مقارنةُ النسخ (نظيرُ electron/updates.cjs) ────────────────────────────────
function parseVersion(str) {
  const m = /(\d+)\.(\d+)(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?/.exec(String(str || ""));
  return m ? { num: [+m[1], +m[2], +(m[3] || 0)], pre: m[4] ? m[4].split(".").filter(Boolean) : [] } : null;
}
function compareVersion(a, b) {
  for (let i = 0; i < 3; i++) if (a.num[i] !== b.num[i]) return a.num[i] - b.num[i];
  if (!a.pre.length || !b.pre.length) return (a.pre.length ? -1 : 0) - (b.pre.length ? -1 : 0);
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    if (i >= a.pre.length) return -1; if (i >= b.pre.length) return 1;
    const x = a.pre[i], y = b.pre[i], xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
    const c = xn && yn ? x - y : xn ? -1 : yn ? 1 : x < y ? -1 : x > y ? 1 : 0;
    if (c) return c;
  }
  return 0;
}
const vText = v => v.num.join(".") + (v.pre.length ? "-" + v.pre.join(".") : "");

async function checkAndroid() {
  const base = { current: APP_VERSION, latest: "", available: false, url: PAGE, notes: "", checked: false, channel: "android", asset: null };
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(API, { signal: ctrl.signal, headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
    clearTimeout(t);
    if (!res.ok) return base;
    const list = await res.json();
    const tagOf = r => r.tag_name || r.name || "";
    const rel = (Array.isArray(list) ? list : []).filter(r => !r.draft && !r.prerelease && parseVersion(tagOf(r)))
      .sort((a, b) => compareVersion(parseVersion(tagOf(b)), parseVersion(tagOf(a))))[0];
    if (!rel) return { ...base, checked: true };
    const latest = parseVersion(tagOf(rel)), cur = parseVersion(APP_VERSION);
    const a = (rel.assets || []).find(x => /\.apk$/i.test(x.name));
    const d = a && /^sha256:([0-9a-f]{64})$/.exec(a.digest || "");
    return { ...base, checked: true, latest: vText(latest), available: !!cur && compareVersion(latest, cur) > 0,
      url: rel.html_url || PAGE, notes: (rel.body || "").slice(0, 4000),
      asset: a ? { name: a.name, size: a.size, url: a.browser_download_url, ...(d ? { sha256: d[1] } : {}) } : null };
  } catch (e) { return base; }
}

/** فحصٌ صريح. يُرجِعُ معلوماتِ التحديث (available/latest/asset…) أو null على الويب. */
export async function checkForUpdate() {
  const p = updatePlatform();
  if (p === "web") return null;
  const info = p === "desktop" ? await desktop().check({}) : await checkAndroid();
  if (info && info.checked) setState({ lastCheck: Date.now() });
  return info;
}

// ── الإشعار (شريطٌ لطيفٌ أسفلَ الفهرس) ────────────────────────────────────────
let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .up-bar{position:fixed;inset-inline:0;bottom:calc(14px + env(safe-area-inset-bottom));margin:0 auto;width:min(520px,calc(100% - 24px));z-index:110;
    background:var(--card,#fff);color:var(--ink,#2B2B2B);border:2px solid #39562a;border-radius:16px;box-shadow:0 8px 26px rgba(0,0,0,.22);
    padding:12px 14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;animation:upIn .35s ease-out}
  @keyframes upIn{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
  @media (prefers-reduced-motion:reduce){.up-bar{animation:none}}
  .up-bar .up-ic{width:34px;height:34px;border-radius:50%;background:#39562a;color:#fff;display:flex;align-items:center;justify-content:center;flex:none}
  .up-bar .up-ic svg{width:18px;height:18px;fill:currentColor}
  .up-bar .up-tx{flex:1;min-width:160px;font-size:14px;line-height:1.5}
  .up-bar .up-tx small{display:block;color:var(--muted,#6B6B6B);font-size:12px}
  .up-btns{display:flex;gap:6px;flex-wrap:wrap}
  .up-btns button,.up-card button{border:none;border-radius:11px;padding:8px 13px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:inherit;color:var(--ink,#2B2B2B);background:var(--bg,#F4EFE4)}
  .up-btns .up-go,.up-card .up-go{background:#39562a;color:#fff}
  .up-ov{position:fixed;inset:0;background:rgba(43,43,43,.5);z-index:121;display:flex;align-items:center;justify-content:center;padding:18px}
  .up-card{background:var(--card,#fff);color:var(--ink,#2B2B2B);border-radius:18px;max-width:440px;width:100%;padding:18px 18px 14px;box-shadow:0 8px 30px rgba(0,0,0,.25);max-height:90vh;overflow:auto}
  .up-card h3{margin:0 0 4px;font-size:18px}
  .up-card .up-sub{color:var(--muted,#6B6B6B);font-size:13px;margin-bottom:10px}
  .up-notes .up-h{font-weight:800;margin:8px 0 2px} .up-notes .up-h:first-child{margin-top:0} .up-notes .up-li{padding-inline-start:4px}
  .up-file{font-family:monospace;font-size:11.5px;opacity:.85}
  .up-notes{font-size:12.5px;line-height:1.6;background:var(--bg,#F7F3EA);border-radius:10px;padding:8px 10px;max-height:160px;overflow:auto;margin-bottom:10px;direction:rtl}
  .up-prog{height:10px;border-radius:6px;background:var(--line,#ECE6DA);overflow:hidden;margin:8px 0 4px}
  .up-prog i{display:block;height:100%;width:0;background:#39562a;transition:width .2s}
  .up-msg{font-size:13px;min-height:18px;margin:6px 0}
  .up-msg.bad{color:#B5482F}
  .up-cmd{direction:ltr;text-align:left;font-family:monospace;font-size:12px;background:var(--bg,#F7F3EA);border-radius:8px;padding:6px 8px;word-break:break-all;user-select:all}
  .up-card .up-btns{justify-content:flex-end;margin-top:10px}`;
  document.head.appendChild(st);
}
const ARROW = `<svg viewBox="0 0 384 512" aria-hidden="true"><path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>`;
const esc = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// ملاحظاتُ الإصدارِ مكتوبةٌ بـMarkdown: عرضٌ مبسَّطٌ آمن (يُهرَّبُ النصُّ أوّلًا، ثمّ عناوينُ/عريضٌ/روابطُ/قوائم).
// الروابطُ تصيرُ نصَّها فقط — لا تنقُّلَ إلى الخارجِ من نافذةٍ يراها الطفل.
function notesHtml(md) {
  return String(md || "").replace(/\r/g, "").split("\n").map(line => {
    let t = esc(line)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")                 // صور
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")               // [نصّ](رابط) ← نصّ
      .replace(/https?:\/\/\S+/g, "")                        // رابطٌ مجرَّد
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/`([^`]+)`/g, "$1");
    const h = /^\s*#{1,6}\s+(.*)$/.exec(t);
    if (h) return `<div class="up-h">${h[1]}</div>`;
    const li = /^\s*[-*+]\s+(.*)$/.exec(t);
    if (li) return `<div class="up-li">• ${li[1]}</div>`;
    return t.trim() ? `<div>${t}</div>` : "";
  }).join("");
}
const mb = b => (b / 1048576).toFixed(b > 104857600 ? 0 : 1) + " م.ب";

function showBar(info) {
  ensureStyle();
  document.querySelector(".up-bar")?.remove();
  const bar = document.createElement("div"); bar.className = "up-bar"; bar.setAttribute("role", "status");
  bar.innerHTML = `<div class="up-ic">${ARROW}</div>
    <div class="up-tx"><b>إصدارٌ جديدٌ متاح: v${esc(info.latest)}</b><small>أنتَ على v${esc(info.current)}${isParent() ? "" : " · التحديثُ بإذنِ الوالدَين"}</small></div>
    <div class="up-btns"><button class="up-go">تحديث</button><button class="up-later">لاحقًا</button><button class="up-skip" title="لا تُذكِّرْني بهذا الإصدار">تخطَّه</button></div>`;
  document.body.appendChild(bar);
  bar.querySelector(".up-later").onclick = () => bar.remove();
  bar.querySelector(".up-skip").onclick = () => { setState({ skipped: info.latest }); bar.remove(); };
  bar.querySelector(".up-go").onclick = async () => {
    if (!isParent() && !(await confirmWithPassword(`تحديثُ التطبيقِ إلى الإصدار v${esc(info.latest)}؟`))) return;
    bar.remove(); openUpdateDialog(info);
  };
}

/** فحصٌ تلقائيٌّ هادئٌ عند الإقلاع (مرّةً يوميًّا على الأكثر)؛ يُظهرُ الشريطَ إن وُجدَ إصدارٌ لم يُتخطَّ. */
export function initUpdateNotice({ delay = 8000 } = {}) {
  if (updatePlatform() === "web" || !isAutoCheckOn()) return;
  try { if (sessionStorage.getItem("tilmithi_update_seen")) return; sessionStorage.setItem("tilmithi_update_seen", "1"); } catch (e) {}
  setTimeout(async () => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    if (Date.now() - (getState().lastCheck || 0) < AUTO_EVERY) return;
    const info = await checkForUpdate();
    if (info && info.available && info.latest !== getState().skipped) showBar(info);
  }, delay);
}

// ── نافذةُ التحديث: ملاحظات ← تنزيلٌ بتقدّم ← تثبيت ───────────────────────────
export function openUpdateDialog(info) {
  ensureStyle();
  const p = updatePlatform();
  const ov = document.createElement("div"); ov.className = "up-ov";
  ov.innerHTML = `<div class="up-card"><h3>تحديثُ «مِشكاة» إلى v${esc(info.latest)}</h3>
    <div class="up-sub">الحالي v${esc(info.current)}${info.asset ? ` · الحجمُ ${mb(info.asset.size)}<br><bdi dir="ltr" class="up-file">${esc(info.asset.name)}</bdi>` : ""}</div>
    ${info.notes ? `<div class="up-notes">${notesHtml(info.notes)}</div>` : ""}
    <div class="up-prog" hidden><i></i></div><div class="up-msg"></div><div class="up-extra"></div>
    <div class="up-btns"><button class="up-go">${info.asset ? "نزِّلْ وثبِّت" : "افتحْ صفحةَ التنزيل"}</button><button class="up-close">إغلاق</button></div></div>`;
  document.body.appendChild(ov);
  const $ = s => ov.querySelector(s);
  const go = $(".up-go"), close = $(".up-close"), msg = $(".up-msg"), prog = $(".up-prog"), bar = $(".up-prog i"), extra = $(".up-extra");
  const say = (t, bad) => { msg.textContent = t; msg.classList.toggle("bad", !!bad); };
  let busy = false, off = null;
  const finish = () => { if (off) { try { off(); } catch (e) {} off = null; } };
  close.onclick = async () => {
    if (busy) { // إلغاءُ التنزيلِ الجاري (الجزءُ المنزَّلُ يبقى ليُستأنَف)
      try { p === "desktop" ? await desktop().cancel() : await native().cancel(); } catch (e) {}
      return;
    }
    finish(); ov.remove();
  };
  const openPage = () => { if (p === "desktop") desktop().openPage(); else location.href = info.url || PAGE; };
  if (!info.asset) { go.onclick = openPage; return; }

  const progress = d => { prog.hidden = false; bar.style.width = (d.percent || 0).toFixed(1) + "%";
    say(`جارٍ التنزيل… ${Math.floor(d.percent || 0)}% (${mb(d.received || 0)} من ${mb(d.total || info.asset.size)})`); };

  go.onclick = async () => {
    busy = true; go.disabled = true; close.textContent = "إلغاء"; extra.innerHTML = ""; say("يبدأُ التنزيل…");
    let file = null;
    try {
      if (p === "desktop") {
        off = desktop().onProgress(progress);
        const r = await desktop().download(info.asset);
        if (r.cancelled) { say("أُلغِيَ التنزيل. يمكنُك استئنافُه لاحقًا."); return; }
        if (!r.ok) { say("تعذّرَ التنزيل: " + (r.error || ""), true); return; }
        file = r.file;
      } else {
        const h = await native().addListener("progress", progress);
        off = () => h.remove();
        const r = await native().download(info.asset);
        file = r.file;
      }
    } catch (e) {
      say(/cancel/i.test(String(e && (e.code || e.message))) ? "أُلغِيَ التنزيل. يمكنُك استئنافُه لاحقًا." : "تعذّرَ التنزيل: " + (e && e.message || e), true);
      return;
    } finally { busy = false; finish(); go.disabled = false; close.textContent = "إغلاق"; }

    bar.style.width = "100%";
    say(info.asset.sha256 ? "اكتملَ التنزيلُ وتطابقتِ البصمة ✓" : "اكتملَ التنزيل ✓");
    go.textContent = "ثبِّتِ الآن";
    go.onclick = () => install(file);
    install(file);
  };

  async function install(file) {
    if (p === "android") {
      const { allowed } = await native().canInstall();
      if (!allowed) {
        say("يحتاجُ أندرويد إذنَ «تثبيتِ التطبيقاتِ غيرِ المعروفة» لهذا التطبيقِ مرّةً واحدة. فعِّلْه ثمّ عُدْ واضغطْ «ثبِّتِ الآن».");
        extra.innerHTML = `<button class="up-perm">افتحِ الإعدادات</button>`;
        extra.querySelector(".up-perm").onclick = () => native().openInstallSettings();
        return;
      }
      extra.innerHTML = "";
      try { await native().install({ file }); say("اتّبعْ نافذةَ المثبِّت. بياناتُ الأطفالِ تبقى كما هي."); }
      catch (e) { say("تعذّرَ فتحُ المثبِّت: " + (e && e.message || e), true); }
      return;
    }
    say("جارٍ التثبيت… قد يُطلَبُ منك كلمةُ مرورِ النظام.");
    go.disabled = true;
    const r = await desktop().install(file);
    go.disabled = false;
    if (r.ok) {
      say("ثُبِّتَ الإصدارُ الجديد ✓");
      go.textContent = "أعِدِ التشغيلَ الآن"; go.onclick = () => desktop().restart();
      return;
    }
    say(r.error === "dev-build" ? "هذه نسخةُ تطوير — لا تُحدَّثُ تلقائيًّا." : "تعذّرَ التثبيتُ التلقائيّ؛ الحزمةُ منزَّلةٌ ومُتحقَّقٌ منها ويمكنُك إتمامُه يدويًّا:", true);
    extra.innerHTML = (r.cmd ? `<div class="up-cmd">${esc(r.cmd)}</div>` : "")
      + `<div class="up-btns" style="justify-content:flex-start"><button class="up-reveal">أظهِرِ الحزمة</button><button class="up-page">صفحةُ الإصدار</button></div>`;
    extra.querySelector(".up-reveal").onclick = () => desktop().reveal(file);
    extra.querySelector(".up-page").onclick = openPage;
  }
}
