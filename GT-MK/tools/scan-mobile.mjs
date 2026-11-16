// tools/scan-mobile.mjs — فحصُ تجاوبٍ آليّ بعرض 360 (v1.8): تمريرٌ أفقيّ + عناصرُ خارجَ حدودِ الشاشة،
// لكلِّ صفحةٍ وأنشطتِها (وفي الألعاب: شاشةُ الإعداد ثمّ اللوحةُ بعد «ابدأ»). لا يكشفُ الألوانَ ولا الازدحام.
// التشغيل (من GT-MK/، بعد npm run build):
//   npx vite preview --port 5174 &
//   brave-browser --headless=new --remote-debugging-port=9333 --user-data-dir=/tmp/scan-profile about:blank &
//   node --experimental-websocket tools/scan-mobile.mjs <مجلّدُ-اللقطات>
// يطبعُ نقطةً لكلِّ حالةٍ سليمة و✗ لكلِّ مشكلةٍ مع لقطتها ومحدِّدِ العنصرِ الخارج.
import fs from "node:fs";
const OUT = process.argv[2];
const BASE = "http://localhost:5174/";
const W = 360, H = 780;
const tabs = await (await fetch("http://localhost:9333/json/list")).json();
const ws = new WebSocket(tabs.find(t => t.type === "page").webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = {}; let errs = [];
ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
  if (m.method === "Runtime.exceptionThrown") errs.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || "").split("\n")[0]); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const wait = ms => new Promise(r => setTimeout(r, ms));
const ev = async x => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result?.result?.value;
await send("Runtime.enable"); await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true }); await send("Network.setBypassServiceWorker", { bypass: true });
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: true });
const go = async url => { await send("Page.navigate", { url: "about:blank" }); await wait(150); await send("Page.navigate", { url: BASE + url }); await wait(2300); };

// يُحقَنُ في الصفحة: أبعدُ العناصرِ الخارجةِ عن العرض (غيرُ المقصوصةِ بأبٍ يمرّرُ أفقيًّا عمدًا)
const SCAN = `(()=>{
  const W=innerWidth, docW=document.documentElement.scrollWidth;
  const sel=el=>{ let s=el.tagName.toLowerCase(); if(el.id) s+="#"+el.id; const c=[...el.classList].slice(0,2).join("."); if(c) s+="."+c; return s; };
  const bad=new Set();
  for(const el of document.querySelectorAll("body *")){
    const cs=getComputedStyle(el);
    if(cs.display==="none"||cs.visibility==="hidden"||cs.position==="fixed") continue;
    const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) continue;
    if(r.right<=W+1 && r.left>=-1) continue;
    let p=el.parentElement, clipped=false;
    while(p && p!==document.body){ const o=getComputedStyle(p).overflowX; if(o==="auto"||o==="scroll"||o==="hidden"||o==="clip"){ clipped=true; break; } p=p.parentElement; }
    if(!clipped) bad.add(el);
  }
  const top=[...bad].filter(el=>{ let p=el.parentElement; while(p){ if(bad.has(p)) return false; p=p.parentElement; } return true; });
  return { docW, W, items: top.slice(0,6).map(el=>{ const r=el.getBoundingClientRect(); return sel(el)+" ["+Math.round(r.left)+"→"+Math.round(r.right)+", w"+Math.round(r.width)+"]"; }) };
})()`;

const report = [];
let shotN = 0;
async function check(label) {
  const r = await ev(SCAN);
  const e = errs; errs = [];
  const ok = r && r.docW <= W + 1 && !r.items.length && !e.length;
  if (!ok) {
    const f = `s${String(++shotN).padStart(2, "0")}.png`;
    const s = await send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(`${OUT}/${f}`, Buffer.from(s.result.data, "base64"));
    report.push({ label, docW: r?.docW, items: r?.items || [], errs: e, shot: f });
  }
  process.stdout.write(ok ? "." : "✗");
}
// ضغطُ «ابدأ» في شاشةِ الإعدادِ ثمّ فحصُ اللوحةِ الفعليّة (وبعدَ جولتينِ من النقرِ العشوائيِّ داخلَها)
async function startAndCheck(label){
  const started = await ev(`(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/ابدأ/.test(x.textContent)&&x.offsetParent); if(!b) return false; b.click(); return true; })()`);
  if(!started) return;
  await wait(1200); await check(label+" ▶");
}
// قائمةُ ما يُنقَرُ في المستوى الأوّلِ من كلِّ صفحة
const L1 = `.gcard[data-g], .mcard[data-go], .ccard[data-cat], .hcard[data-i]`;
const count = async s => await ev(`document.querySelectorAll(${JSON.stringify(s)}).length`);
const clickNth = async (s, i) => ev(`(()=>{ const el=document.querySelectorAll(${JSON.stringify(s)})[${i}]; if(!el) return ""; const t=(el.getAttribute("data-g")||el.getAttribute("data-go")||el.getAttribute("data-cat")||el.getAttribute("data-i")||el.textContent||"").trim().slice(0,24); el.click(); return t; })()`);

await go("home.html");
await ev(`sessionStorage.setItem("tilmithi_current_user", JSON.stringify({id:"guest",name:"ضيف",role:"guest",ageGroup:"all",avatar:"👋"})); localStorage.setItem("tilmithi_theme","dark"); 1`);

const PAGES = ["home.html", "index.html", "basics.html", "read.html", "math.html", "play.html", "quiz.html", "tales.html", "puzzles.html",
  "stories.html", "progress.html", "quran.html", "quran-full.html", "clock.html", "print.html", "record.html"];
for (const p of PAGES) {
  process.stdout.write(`\n${p.padEnd(16)}`);
  await go(p); await check(p);
  let n = Math.min(await count(L1), 30); if (!n) { await wait(1500); n = Math.min(await count(L1), 30); }
  for (let i = 0; i < n; i++) {
    await go(p); const t = await clickNth(L1, i); await wait(700); await check(`${p} › ${t}`);
    if (p !== "play.html") await startAndCheck(`${p} › ${t}`);
    if (p === "play.html") { // مستوًى ثانٍ: ألعابُ القسم
      const m = Math.min(await count(".gcard[data-g]"), 12);
      for (let j = 0; j < m; j++) {
        await go(p); await clickNth(L1, i); await wait(500);
        const g = await clickNth(".gcard[data-g]", j); await wait(800); await check(`${p} › ${t} › ${g}`);
        await startAndCheck(`${p} › ${t} › ${g}`);
      }
    }
  }
}
// اللغات عبرَ الروابط
const SECS = ["letters", "numbers", "sounds", "syllabaries", "words", "phrases", "stories", "verbs", "time", "quiz", "games"];
const GAMES = ["transrace", "sortwords", "alphaorder", "match", "matchar", "spell", "listen"];
for (const lng of ["en", "fr"]) {
  process.stdout.write(`\nlang ${lng}`.padEnd(17));
  await go(`lang.html?lng=${lng}`); await check(`lang ${lng}`);
  for (const s of SECS) { await go(`lang.html?lng=${lng}&sec=${s}`); await check(`lang ${lng} › ${s}`); }
  for (const g of GAMES) { await go(`lang.html?lng=${lng}&sec=games&g=${g}`); await check(`lang ${lng} › game ${g}`); await startAndCheck(`lang ${lng} › game ${g}`); }
  for (const q of ["quiz"]) { await go(`lang.html?lng=${lng}&sec=${q}`); await startAndCheck(`lang ${lng} › ${q}`); }
  { await go(`lang.html?lng=${lng}&sec=time&t=game`); await startAndCheck(`lang ${lng} › clock game`); }
  for (const t of ["learn", "game", "dayparts", "directions", "seasons"]) { await go(`lang.html?lng=${lng}&sec=time&t=${t}`); await check(`lang ${lng} › time ${t}`); }
  await go(`lang.html?lng=${lng}&sec=words&cat=animals`); await check(`lang ${lng} › words › animals`);
}
fs.writeFileSync(`${OUT}/scan360.json`, JSON.stringify(report, null, 1));
console.log(`\n\nمشكلات: ${report.length}`);
for (const r of report) console.log(`\n✗ ${r.label}  (docW ${r.docW})${r.errs.length ? "  ERR: " + r.errs.join(" | ") : ""}  [${r.shot}]\n   ` + r.items.join("\n   "));
ws.close();
