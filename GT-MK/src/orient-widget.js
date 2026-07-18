// src/orient-widget.js — وحدةُ «الزمانِ والمكان» (v1.5): الاتجاهاتُ (بوصلةٌ + كرةٌ أرضيّة) · الفصولُ · فتراتُ اليوم.
// بطاقاتٌ تعليميّةٌ + اختباراتٌ تنافسيّةٌ (versus) — مشترَكةٌ بين العربيّة (clock.html) واللغات (lang.html).
// محلّيٌّ بالكامل. النطقُ عبر دالّةٍ مُمرَّرةٍ speak(text) (عربيّ: espeak · أجنبيّ: Piper).
import { robo } from "./robo-companion.js";
import { vsSetup, vsMakePlayers, vsScoreHtml, vsTurnHtml, vsEndRound, vP, sfx } from "./versus.js";
import { DIRECTIONS, SEASONS, DAYPARTS, nameOf } from "../content/orient.js";

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .or-wrap{max-width:640px;margin:8px auto;text-align:center}
  .or-bubble{background:color-mix(in srgb,var(--sky,#6FB3D6) 14%,var(--card,#fff));border:1px solid var(--line,#ECE6DA);border-radius:14px;padding:10px 14px;font-size:14px;color:var(--ink,#2B2B2B);max-width:460px;margin:6px auto;line-height:1.7}
  .or-two{display:flex;gap:14px;justify-content:center;align-items:center;flex-wrap:wrap;margin:10px 0}
  .or-svg{width:min(66vw,240px);height:min(66vw,240px);touch-action:none;user-select:none}
  .or-dir{cursor:pointer}
  .or-tiles{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:12px 0}
  .or-tile{background:var(--card,#fff);color:var(--ink,#2B2B2B);border:2px solid var(--line,#ECE6DA);border-radius:18px;padding:16px 14px;min-width:120px;cursor:pointer;transition:transform .1s,border-color .15s}
  .or-tile:active{transform:scale(.96)} .or-tile.on{border-color:var(--primary,#E07A5F)}
  .or-tile .e{font-size:44px} .or-tile .n{font-weight:800;font-size:19px;margin-top:4px} .or-tile .t{color:var(--muted,#6B6B6B);font-size:12.5px;margin-top:4px;min-height:16px}
  .or-timeline{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:12px 0}
  .or-per{background:var(--card,#fff);color:var(--ink,#2B2B2B);border:1px solid var(--line,#ECE6DA);border-radius:14px;padding:10px;min-width:82px;cursor:pointer;transition:transform .1s}
  .or-per:active{transform:scale(.95)} .or-per.night{background:color-mix(in srgb,#3a3a6a 14%,var(--card,#fff))}
  .or-per .e{font-size:30px} .or-per .n{font-weight:800;font-size:14px;margin-top:2px}
  .or-opts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:12px 0}
  .or-opt{background:var(--card,#fff);color:var(--ink,#2B2B2B);border:2px solid var(--line,#ECE6DA);border-radius:14px;padding:14px 20px;font-weight:800;font-size:18px;cursor:pointer;min-width:110px;transition:transform .1s}
  .or-opt.big{font-size:40px;padding:12px 18px} .or-opt:active{transform:scale(.96)}
  .or-opt.ok{background:var(--good,#7BB661);color:#fff;border-color:var(--good,#7BB661)} .or-opt.no{background:var(--bad,#E0566B);color:#fff;border-color:var(--bad,#E0566B)}
  .or-q{font-weight:800;font-size:20px;margin:6px 0}
  .or-float{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(10px);z-index:9999;max-width:min(92vw,440px);
    background:var(--card,#fff);color:var(--ink,#2B2B2B);border:1px solid var(--line,#ECE6DA);border-radius:16px;
    box-shadow:0 12px 34px rgba(0,0,0,.3);padding:14px 16px;text-align:center;font-size:15px;line-height:1.8;opacity:0;transition:opacity .2s,transform .2s}
  .or-float.on{opacity:1;transform:translateX(-50%) translateY(0)}
  .or-float .ft{font-weight:800;font-size:17px;margin-bottom:4px}
  .or-realbtn{background:var(--card,#fff);color:var(--ink,#2B2B2B);border:2px solid var(--primary,#E07A5F);border-radius:999px;padding:8px 16px;font:inherit;font-weight:800;font-size:14px;cursor:pointer;transition:transform .1s}
  .or-realbtn:active{transform:scale(.96)} .or-realbtn.on{background:var(--primary,#E07A5F);color:#fff}
  .or-realmsg{font-size:12.5px;color:var(--muted,#6B6B6B);min-height:16px;margin-top:4px}`;
  document.head.appendChild(st);
}
// بطاقةٌ عائمةٌ مقتضبةٌ (تُغلَقُ تلقائيًّا أو بالنقر) — لمعلوماتِ الصلاةِ المرتبطةِ بالفترة.
let _floatEl = null, _floatTmr = null;
export function floatCard(title, body) {
  ensureStyle();
  if (_floatEl) { try { _floatEl.remove(); } catch (e) {} clearTimeout(_floatTmr); }
  const el = document.createElement("div"); el.className = "or-float";
  el.innerHTML = `<div class="ft">${title}</div><div>${body}</div>`;
  document.body.appendChild(el); _floatEl = el;
  requestAnimationFrame(() => el.classList.add("on"));
  const close = () => { el.classList.remove("on"); setTimeout(() => { try { el.remove(); } catch (e) {} }, 220); if (_floatEl === el) _floatEl = null; };
  el.onclick = close; _floatTmr = setTimeout(close, 5000);
}

const NS = "http://www.w3.org/2000/svg";
const svgEl = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
const rad = d => (d - 90) * Math.PI / 180;

// ===== بوصلةٌ تفاعليّة =====
export function makeCompass(lang, onPick) {
  const svg = svgEl("svg", { viewBox: "0 0 200 200", class: "or-svg or-dir" });
  svg.appendChild(svgEl("circle", { cx: 100, cy: 100, r: 94, fill: "var(--card,#fff)", stroke: "var(--primary,#E07A5F)", "stroke-width": 4 }));
  svg.appendChild(svgEl("circle", { cx: 100, cy: 100, r: 6, fill: "var(--primary-d,#C7613F)" }));
  // وردةُ البوصلة (إبرةٌ + أحرفٌ) داخلَ مجموعةٍ تدورُ مع الاتجاهِ الحقيقيِّ على أندرويد؛ الدائرةُ الخارجيّةُ ثابتة.
  const rose = svgEl("g", { class: "or-rose", style: "transition:transform .12s ease-out" });
  // إبرةُ الشمال (نصفٌ أحمرُ لأعلى)
  const needle = svgEl("polygon", { points: "100,20 108,100 100,110 92,100", fill: "var(--bad,#E0566B)" });
  rose.appendChild(needle);
  rose.appendChild(svgEl("polygon", { points: "100,180 108,100 100,90 92,100", fill: "var(--muted,#9a9a9a)" }));
  // الأحرفُ + مناطقُ النقر
  DIRECTIONS.forEach(d => {
    const a = rad(d.deg), r = d.prime ? 74 : 78, fs = d.prime ? 20 : 12;
    const short = lang === "ar" ? { n: "ش", ne: "شق", e: "ق", se: "جق", s: "ج", sw: "جغ", w: "غ", nw: "شغ" }[d.k] : (d[lang] || d.en).split(/[-\s]/).map(w => w[0].toUpperCase()).join("");
    const t = svgEl("text", { x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a), "text-anchor": "middle", "dominant-baseline": "central", fill: d.prime ? "var(--ink,#2B2B2B)" : "var(--muted,#8a8a8a)", "font-weight": d.prime ? "800" : "600", "font-size": fs, style: "cursor:pointer" });
    t.textContent = short; t.addEventListener("click", () => onPick && onPick(d)); rose.appendChild(t);
    // منطقةُ نقرٍ أوسع
    const hit = svgEl("circle", { cx: 100 + r * Math.cos(a), cy: 100 + r * Math.sin(a), r: 16, fill: "transparent", style: "cursor:pointer" });
    hit.addEventListener("click", () => onPick && onPick(d)); rose.appendChild(hit);
  });
  // مؤشّرُ القِبلةِ (🕋) — يظهرُ حين يُعرَفُ الموقعُ؛ يدورُ داخلَ الوردةِ بزاويةِ القبلةِ من الشمال.
  const qib = svgEl("g", { class: "or-qibla", style: "display:none" });
  qib.appendChild(svgEl("line", { x1: 100, y1: 100, x2: 100, y2: 52, stroke: "var(--good,#7BB661)", "stroke-width": 3.5, "stroke-linecap": "round" }));
  const qt = svgEl("text", { x: 100, y: 40, "text-anchor": "middle", "dominant-baseline": "central", "font-size": 17 });
  qt.textContent = "🕋"; qib.appendChild(qt);
  rose.appendChild(qib);
  svg.appendChild(rose);
  svg._rose = rose;   // مرجعٌ لتدويرِ الوردةِ ببوصلةٍ حقيقيّة
  svg._qibla = qib;   // مرجعٌ لتوجيهِ مؤشّرِ القبلة
  return svg;
}

// هل نحنُ داخلَ تطبيقِ الهاتفِ الأصليّ؟ (البوصلةُ الحقيقيّةُ تُعرَضُ فيه وحدَه — المتصفّحاتُ تحجبُ المستشعر.)
export function isNativeApp() {
  try { const C = window.Capacitor; return !!(C && C.isNativePlatform && C.isNativePlatform()); } catch (e) { return false; }
}
// اتجاهُ البوصلةِ من زوايا الجهازِ **مع تعويضِ الميل** — أدقُّ بكثيرٍ من alpha وحدَها (التي لا تصحُّ إلّا والجهازُ مسطَّح).
function compassHeadingFromAngles(alpha, beta, gamma) {
  const r = Math.PI / 180;
  const _x = (beta || 0) * r, _y = (gamma || 0) * r, _z = (alpha || 0) * r;
  const cX = Math.cos(_x), cY = Math.cos(_y), cZ = Math.cos(_z);
  const sX = Math.sin(_x), sY = Math.sin(_y), sZ = Math.sin(_z);
  const Vx = -cZ * sY - sZ * sX * cY;
  const Vy = -sZ * sY + cZ * sX * cY;
  return (Math.atan2(Vx, Vy) * (180 / Math.PI) + 360) % 360;
}
// اتجاهُ البوصلةِ من كواترنيونِ المستشعر: نُدوّرُ متّجهَ «أعلى الشاشة» (0,1,0) إلى إطارِ الأرضِ (شرق/شمال/أعلى)
// ثمّ نُسقِطُه على المستوى الأفقيّ — فيصحُّ الاتجاهُ مهما مالَ الجهاز.
function headingFromQuaternion(q) {
  const x = q[0], y = q[1], z = q[2], w = q[3];
  const east = 2 * (x * y - z * w);
  const north = 1 - 2 * (x * x + z * z);
  return (Math.atan2(east, north) * (180 / Math.PI) + 360) % 360;
}
// زاويةُ دورانِ الشاشةِ (0/90/180/270) — تُضافُ ليصحَّ الاتجاهُ في الوضعِ العرضيِّ والمقلوب.
function screenAngle() {
  try { if (screen.orientation && typeof screen.orientation.angle === "number") return screen.orientation.angle; } catch (e) {}
  try { if (typeof window.orientation === "number") return (window.orientation + 360) % 360; } catch (e) {}
  return 0;
}
// قراءةُ اتجاهِ البوصلةِ (درجاتٌ من الشمالِ مع عقاربِ الساعة) من حدثِ اتجاهِ الجهاز.
// **المطلقُ فقط**: الاتجاهُ النسبيُّ (deviceorientation بلا absolute) مبنيٌّ على الجيروسكوبِ فينحرفُ تراكميًّا
// كلّما تحرّكَ الجهازُ ويُعطي شمالًا خاطئًا لا يُصحَّحُ إلّا بعدَ طولِ وقتٍ — فرفضُه أصوبُ من بوصلةٍ كاذبة.
function headingFromEvent(e) {
  if (typeof e.webkitCompassHeading === "number" && !isNaN(e.webkitCompassHeading)) return (e.webkitCompassHeading + screenAngle()) % 360; // iOS (مطلقٌ ومعوَّض)
  const absolute = e.type === "deviceorientationabsolute" || e.absolute === true;
  if (!absolute) return null;
  if (typeof e.alpha === "number" && e.alpha !== null) return (compassHeadingFromAngles(e.alpha, e.beta, e.gamma) + screenAngle() + 360) % 360; // أندرويد: عوِّضِ الميلَ ودورانَ الشاشة
  return null;
}
// زاويةُ القِبلةِ (من الشمالِ مع عقاربِ الساعة) من موقعٍ إلى الكعبةِ المشرّفة — حسابٌ محلّيٌّ بحتٌ (بلا إنترنت).
const KAABA = { lat: 21.4224779, lon: 39.8251832 };
function qiblaBearing(lat, lon) {
  const r = Math.PI / 180, d = 180 / Math.PI;
  const f1 = lat * r, f2 = KAABA.lat * r, dl = (KAABA.lon - lon) * r;
  const y = Math.sin(dl);
  const x = Math.cos(f1) * Math.tan(f2) - Math.sin(f1) * Math.cos(dl);
  return (Math.atan2(y, x) * d + 360) % 360;
}
// واجهةُ المستشعرِ العامّة (Generic Sensor) — أدقُّ اتجاهٍ مطلقٍ في كروميوم/أندرويد (يشملُ WebView التطبيق) حين تُحجَبُ أحداثُ deviceorientation.
// cb(heading) بالدرجاتِ من الشمالِ مع عقاربِ الساعة. تُرجِعُ مُوقِفًا أو null إن تعذّر.
function startAbsoluteSensor(cb) {
  const AOS = typeof window !== "undefined" && window.AbsoluteOrientationSensor;
  if (!AOS) return null;
  let sensor;
  // referenceFrame:"screen" يُراعي دورانَ الشاشةِ تلقائيًّا ⇒ يصحُّ الاتجاهُ مسطَّحًا في الوضعِ الطوليِّ والعرضيِّ والمقلوب.
  try { sensor = new AOS({ frequency: 30, referenceFrame: "screen" }); } catch (e) { return null; }
  const onReading = () => { const q = sensor.quaternion; if (q) cb(headingFromQuaternion(q)); };
  try {
    sensor.addEventListener("reading", onReading);
    sensor.addEventListener("error", () => {});
    sensor.start();
  } catch (e) { return null; }
  return () => { try { sensor.removeEventListener("reading", onReading); sensor.stop(); } catch (_) {} };
}
// ربطُ زرِّ «بوصلةٌ حقيقيّة»: يستمعُ لمستشعرِ الاتجاهِ فيُديرُ وردةَ البوصلةِ لتشيرَ الإبرةُ (والأحرفُ) للشمالِ الحقيقيّ.
let _compassStop = null; // مُوقِفُ آخرِ بوصلةٍ حقيقيّةٍ نشطة (كي لا يتراكمَ مستمِعٌ عند إعادةِ رسمِ البطاقة)
function wireRealCompass(btn, msg, compass, globe, L) {
  if (!btn) return;
  if (_compassStop) { try { _compassStop(); } catch (_) {} } // أوقِفْ أيَّ بوصلةٍ سابقةٍ قبلَ ربطِ الجديدة
  const rose = compass && compass._rose, qib = compass && compass._qibla, grot = globe && globe._rot;
  let on = false, handler = null, got = false, timer = null, sensorStop = null, sensorLive = false, smooth = null, useRel = false;
  // تدويرُ الوردةِ **والكرةِ الأرضيّةِ** معًا فيتجاوبُ الشكلانِ مع الاتجاهِ الحقيقيّ.
  const setRot = deg => {
    if (rose) rose.setAttribute("transform", `rotate(${deg} 100 100)`);
    if (grot) grot.setAttribute("transform", `rotate(${deg} 100 100)`);
  };
  // تنعيمٌ دائريٌّ يمنعُ ارتجافَ الإبرة (يراعي الالتفافَ 359°→0°).
  const smoothOf = h => {
    if (smooth == null) { smooth = h; return h; }
    const d = ((h - smooth + 540) % 360) - 180;
    smooth = (smooth + d * 0.18 + 360) % 360;
    return smooth;
  };
  // مؤشّرُ القِبلة: يُحسَبُ من موقعِ الجهازِ محلّيًّا (بلا إنترنت) ويُوجَّهُ داخلَ الوردة.
  const showQibla = () => {
    if (!qib || !navigator.geolocation) return;
    try {
      navigator.geolocation.getCurrentPosition(p => {
        const b = qiblaBearing(p.coords.latitude, p.coords.longitude);
        qib.setAttribute("transform", `rotate(${b} 100 100)`); qib.style.display = "";
      }, () => {}, { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
    } catch (_) {}
  };
  const onHeading = (h, fromSensor) => {
    if (fromSensor) sensorLive = true; else if (sensorLive) return; // المستشعرُ العامُّ يعملُ ⇐ تجاهلْ أحداثَ deviceorientation
    got = true; if (msg && !useRel) msg.textContent = ""; setRot(-smoothOf(h));
  };
  const stop = () => {
    if (handler) { try { window.removeEventListener("deviceorientationabsolute", handler, true); window.removeEventListener("deviceorientation", handler, true); } catch (_) {} handler = null; }
    if (sensorStop) { try { sensorStop(); } catch (_) {} sensorStop = null; }
    if (timer) { clearTimeout(timer); timer = null; }
    on = false; got = false; sensorLive = false; smooth = null; useRel = false; btn.classList.remove("on"); btn.textContent = `🧭 ${L.realCompass || "بوصلةٌ حقيقيّة"}`;
    setRot(0); if (qib) qib.style.display = "none"; if (msg) msg.textContent = ""; if (_compassStop === stop) _compassStop = null;
  };
  const start = () => {
    on = true; got = false; sensorLive = false; smooth = null; useRel = false; btn.classList.add("on"); btn.textContent = `⏹️ ${L.compassStop || "أوقِفِ البوصلة"}`; _compassStop = stop;
    if (msg) msg.textContent = L.compassWait || "وجِّهْ جهازَك وحرّكْه قليلًا…";
    showQibla();                                               // مؤشّرُ القبلةِ (إن سُمِحَ بالموقع)
    sensorStop = startAbsoluteSensor(h => onHeading(h, true)); // (1) الأدقّ (Generic Sensor)
    // (2) ارتدادٌ لأحداثِ الاتجاه: المطلقُ فقط. والنسبيُّ لا يُستعمَلُ إلّا إذا عدِمَ الجهازُ المطلقَ تمامًا — وحينها بتنبيهٍ صريح.
    let relSeen = false;
    handler = e => {
      const h = headingFromEvent(e);
      if (h != null) { onHeading(h, false); return; }
      if (typeof e.alpha === "number" && e.alpha !== null) {
        relSeen = true;
        if (useRel) onHeading((compassHeadingFromAngles(e.alpha, e.beta, e.gamma) + screenAngle() + 360) % 360, false);
      }
    };
    try { window.addEventListener("deviceorientationabsolute", handler, true); } catch (_) {}
    try { window.addEventListener("deviceorientation", handler, true); } catch (_) {}
    timer = setTimeout(() => {
      if (got) return;
      if (relSeen) { useRel = true; if (msg) msg.textContent = L.compassApprox || "اتجاهٌ تقريبيٌّ — جهازُك لا يوفّرُ شمالًا مطلقًا."; }
      else if (msg) msg.textContent = L.compassNo || "المستشعرُ غيرُ متاحٍ على هذا الجهاز.";
    }, 5000);
  };
  btn.onclick = () => {
    if (on) { stop(); return; }
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") { // iOS 13+ يتطلّبُ إذنًا من إيماءةِ المستخدم
      DOE.requestPermission().then(r => { if (r === "granted") start(); else if (msg) msg.textContent = L.compassNo || "لم يُسمَحْ بالمستشعر."; }).catch(() => { if (msg) msg.textContent = L.compassNo || "تعذّرَ تشغيلُ المستشعر."; });
    } else start();
  };
}

// ===== كرةٌ أرضيّةٌ مبسّطة =====
export function makeGlobe() {
  const svg = svgEl("svg", { viewBox: "0 0 200 200", class: "or-svg" });
  svg.appendChild(svgEl("circle", { cx: 100, cy: 100, r: 88, fill: "#4C8BF5", stroke: "var(--line,#cfd8e3)", "stroke-width": 3 }));
  // ما يدورُ مع الاتجاهِ الحقيقيّ (قارّاتٌ + أقطاب)؛ الكرةُ وخطوطُها تبقى ثابتة.
  const rot = svgEl("g", { class: "or-globerot", style: "transition:transform .12s ease-out" });
  // قارّاتٌ خضراءُ (كتلٌ حرّة)
  const land = "M60 70 q20 -14 40 -4 q18 8 8 26 q-16 14 -34 6 q-22 -8 -14 -28 Z M120 110 q22 -8 30 12 q6 20 -16 24 q-24 2 -24 -18 q0 -14 10 -18 Z M70 130 q16 -6 26 8 q6 16 -12 20 q-20 2 -22 -14 q-1 -10 8 -14 Z";
  rot.appendChild(svgEl("path", { d: land, fill: "#7BB661", opacity: ".95" }));
  // خطُّ الاستواءِ ومدارٌ رأسيّ
  svg.appendChild(svgEl("ellipse", { cx: 100, cy: 100, rx: 88, ry: 30, fill: "none", stroke: "#ffffff", "stroke-width": 1.3, opacity: ".5" }));
  svg.appendChild(svgEl("ellipse", { cx: 100, cy: 100, rx: 30, ry: 88, fill: "none", stroke: "#ffffff", "stroke-width": 1.3, opacity: ".5" }));
  // أقطابٌ واتّجاهات
  const cap = (x, y, txt, col) => { const t = svgEl("text", { x, y, "text-anchor": "middle", "dominant-baseline": "central", fill: col, "font-weight": "800", "font-size": 15 }); t.textContent = txt; rot.appendChild(t); };
  cap(100, 22, "N", "#fff"); cap(100, 178, "S", "#fff"); cap(178, 100, "E", "#fff"); cap(22, 100, "W", "#fff");
  svg.appendChild(rot);
  svg._rot = rot; // مرجعٌ لتدويرِ الكرةِ مع البوصلةِ الحقيقيّة
  return svg;
}

// ===== بطاقةُ الاتجاهات =====
// opts={ lang, speak, L }
export function attachDirections(host, opts = {}) {
  ensureStyle();
  const lang = opts.lang || "ar", speak = opts.speak || (() => {}), L = opts.L || AR_L;
  host.innerHTML = `<div class="or-wrap"><div class="or-bubble">${L.dirIntro}</div>
    <div class="or-two"><div class="cslot"></div><div class="gslot"></div></div>
    <div class="or-q" id="orLbl" style="font-size:18px;min-height:24px"></div>
    ${isNativeApp() ? `<div style="text-align:center;margin-top:2px"><button class="or-realbtn" id="orReal" type="button">🧭 ${L.realCompass || "بوصلةٌ حقيقيّة"}</button><div class="or-realmsg" id="orRealMsg"></div></div>` : ""}
    <div class="or-bubble" style="max-width:420px">${L.qibla}</div></div>`;
  const lbl = host.querySelector("#orLbl");
  const compass = makeCompass(lang, d => { lbl.textContent = nameOf(d, lang); try { speak(nameOf(d, lang)); } catch (e) {} });
  const globe = makeGlobe();
  host.querySelector(".cslot").appendChild(compass);
  host.querySelector(".gslot").appendChild(globe);
  // البوصلةُ الحقيقيّةُ في تطبيقِ الهاتفِ وحدَه (المتصفّحاتُ تحجبُ المستشعرَ فلا داعيَ لإظهارِ زرٍّ لا يعمل).
  if (isNativeApp()) wireRealCompass(host.querySelector("#orReal"), host.querySelector("#orRealMsg"), compass, globe, L);
}

// ===== بطاقةُ الفصول =====
export function attachSeasons(host, opts = {}) {
  ensureStyle();
  const lang = opts.lang || "ar", speak = opts.speak || (() => {}), L = opts.L || AR_L;
  const traitK = lang === "en" ? "enTrait" : lang === "fr" ? "frTrait" : "arTrait";
  host.innerHTML = `<div class="or-wrap"><div class="or-bubble">${L.seasonsIntro}</div>
    <div class="or-tiles">${SEASONS.map(s => `<div class="or-tile" data-k="${s.k}"><div class="e">${s.emoji}</div><div class="n">${nameOf(s, lang)}</div><div class="t">${s[traitK] || ""}</div></div>`).join("")}</div></div>`;
  host.querySelectorAll(".or-tile").forEach(el => el.onclick = () => {
    host.querySelectorAll(".or-tile").forEach(x => x.classList.remove("on")); el.classList.add("on");
    const s = SEASONS.find(x => x.k === el.dataset.k); if (!s) return;
    try { speak(nameOf(s, lang)); } catch (e) {}
    // بطاقةٌ عائمةٌ بمعلومةٍ عن الفصل (بلغةِ القسم).
    const tr = s[traitK]; if (tr) floatCard(`${s.emoji} ${nameOf(s, lang)}`, tr);
  });
}

// ===== بطاقةُ فتراتِ اليوم =====
export function attachDayparts(host, opts = {}) {
  ensureStyle();
  const lang = opts.lang || "ar", speak = opts.speak || (() => {}), L = opts.L || AR_L;
  host.innerHTML = `<div class="or-wrap"><div class="or-bubble">${L.daypartsIntro}</div>
    <div class="or-timeline">${DAYPARTS.map(p => `<div class="or-per${p.night ? " night" : ""}" data-k="${p.k}"><div class="e">${p.emoji}</div><div class="n">${nameOf(p, lang)}</div></div>`).join("")}</div></div>`;
  host.querySelectorAll(".or-per").forEach(el => el.onclick = () => {
    const p = DAYPARTS.find(x => x.k === el.dataset.k); if (!p) return;
    try { speak(nameOf(p, lang)); } catch (e) {}
    // بطاقةٌ عائمةٌ بمعلومةِ الصلاةِ المرتبطةِ بالفترة (في القسمِ العربيّ).
    if (lang === "ar" && p.prayerAr) floatCard(`${p.emoji} ${nameOf(p, lang)}`, p.prayerAr);
  });
}

// ===== اختبارٌ تنافسيٌّ عامّ (رمز↔اسم) لأيّ موضوع =====
// opts={ items, lang, speak, title, L, onExit, onWin }
export function orientQuiz(host, opts = {}) {
  ensureStyle();
  const items = opts.items, lang = opts.lang || "ar", speak = opts.speak || (() => {}), L = opts.L || AR_L, TARGET = 5;
  let ps = [], turn = 0, lock = false, q = null, diff = "easy";
  vsSetup(host, {
    say: `${opts.title} — ${L.quizSay}`, soloOk: true,
    diffs: [{ v: "easy", label: "سهل" }, { v: "hard", label: "صعب" }],
    getDiff: () => diff, setDiff: v => diff = v, start: newRound
  });
  const nm = it => nameOf(it, lang);
  function newRound() { ps = vsMakePlayers(); ps.forEach(p => p.score = 0); turn = 0; lock = false; next(); }
  function pickN(ans, n) { const out = [ans]; const pool = shuffle(items.filter(x => x !== ans)); while (out.length < n && pool.length) out.push(pool.pop()); return shuffle(out); }
  function next() {
    if (!host.isConnected) return;
    const mode = Math.random() < .5 ? "e2n" : "n2e";     // رمز→اسم · اسم→رمز
    const answer = vP(items), list = pickN(answer, diff === "hard" ? 4 : 3);
    q = { mode, answer, list }; render();
  }
  function render() {
    const cur = ps[turn]; if (!host.isConnected) return; lock = false;
    const prompt = q.mode === "e2n"
      ? `<div style="font-size:64px">${q.answer.emoji}</div><div class="or-q">${L.qName}</div>`
      : `<div class="or-q">${nm(q.answer)}</div><div class="hint">${L.qPick}</div>`;
    const opts = q.list.map((o, i) => q.mode === "e2n"
      ? `<button class="or-opt" data-i="${i}">${nm(o)}</button>`
      : `<button class="or-opt big" data-i="${i}">${o.emoji}</button>`).join("");
    host.innerHTML = `<div class="or-wrap" style="text-align:center">${vsScoreHtml(ps)}${vsTurnHtml(cur)}${prompt}<div class="or-opts">${opts}</div></div>`;
    if (cur.cpu) return aiPlay();
    host.querySelectorAll(".or-opt").forEach(b => b.onclick = () => { if (lock) return; lock = true; sfx.tap(); pick(+b.dataset.i, b); });
  }
  function aiPlay() {
    lock = true; const ci = q.list.indexOf(q.answer);
    const pr = diff === "hard" ? .8 : .62, idx = Math.random() < pr ? ci : Math.floor(Math.random() * q.list.length);
    setTimeout(() => { if (!host.isConnected) return; const b = host.querySelectorAll(".or-opt")[idx]; pick(idx, b); }, 700 + Math.random() * 600);
  }
  function pick(i, btn) {
    if (!host.isConnected) return; lock = true;
    const ok = q.list[i] === q.answer;
    try {
      if (btn) btn.classList.add(ok ? "ok" : "no");
      if (!ok) { const cb = host.querySelectorAll(".or-opt")[q.list.indexOf(q.answer)]; if (cb) cb.classList.add("ok"); }
    } catch (e) {}
    if (ok) ps[turn].score++;
    try { if (ok) robo.applaud(); else sfx.nope(); speak(nm(q.answer)); } catch (e) {}
    if (ps.some(p => p.score >= TARGET)) { setTimeout(end, 1300); return; }
    setTimeout(() => { if (!host.isConnected) return; turn = (turn + 1) % ps.length; next(); }, 1400);
  }
  function end() { opts.onWin && opts.onWin(); vsEndRound(ps, { game: "الاتجاهاتُ والفصول", diff: ({ easy: "سهل", hard: "صعب" }[diff] || ""), onAgain: newRound, onExit: opts.onExit || (() => orientQuiz(host, opts)) }); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
}

// الترجماتُ الافتراضيّة (عربيّة)
export const AR_L = {
  dirIntro: "🧭 الاتجاهاتُ الأربعةُ الأصليّة: شمال · جنوب · شرق · غرب. اضغطْ على البوصلةِ لتسمعَ كلَّ اتّجاه.",
  qibla: "🕌 القِبلةُ هي اتّجاهُ الكعبةِ المشرّفةِ التي نتوجّهُ إليها في الصلاة.",
  seasonsIntro: "🍂 فصولُ السنةِ الأربعة — اضغطْ كلَّ فصلٍ لتسمعَ اسمَه وتعرفَ صفتَه.",
  daypartsIntro: "🌅 فتراتُ اليومِ والليل بالترتيب — اضغطْ كلَّ فترةٍ لتسمعَ اسمَها.",
  quizSay: "تنافَسْ في المطابقة!", qName: "ما اسمُ هذا؟", qPick: "اختَرِ الرمزَ المطابق", quiz: "اختبار",
  realCompass: "بوصلةٌ حقيقيّة", compassWait: "ضعِ الجهازَ مسطَّحًا وحرّكْه على هيئةِ ٨ ليُعايِرَ نفسَه…", compassNo: "المستشعرُ غيرُ متاحٍ على هذا الجهاز.", compassStop: "أوقِفِ البوصلة",
  compassApprox: "اتجاهٌ تقريبيٌّ — جهازُك لا يوفّرُ شمالًا مطلقًا.",
};
