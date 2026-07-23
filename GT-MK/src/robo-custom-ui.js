// src/robo-custom-ui.js — نافذةُ «خصّصْ آليّك»: لونٌ + اسمٌ + ملحقاتٌ تُكسَبُ بالإنجاز.
// محلّيّةٌ بالكامل. تُعاينُ التغييرَ فورًا على آليٍّ مصغّرٍ داخلَ النافذة، وتُحدّثُ المرافقَ عند الحفظ.
import { ROBO_SVG, robo } from "./robo-companion.js";
import { getRoboCustom, setRoboCustom, ROBO_COLORS, ROBO_ACCESSORIES, isAccessoryUnlocked, earnedCount, accessorySvg } from "./robo-custom.js";
import * as sfx from "./sfx.js";
import { NOTICES } from "./robo-phrases.js";

let mounted = false;
const STYLE = `
.rcx-ov{position:fixed;inset:0;z-index:120;background:rgba(20,20,28,.55);display:none;align-items:center;justify-content:center;padding:16px}
.rcx-ov.show{display:flex}
.rcx{background:var(--card,#fff);color:var(--ink,#2B2B2B);border:1px solid var(--line,#ECE6DA);border-radius:22px;max-width:440px;width:100%;
  max-height:90vh;overflow:auto;box-shadow:0 18px 50px rgba(0,0,0,.3);padding:18px}
.rcx h2{margin:0 0 4px;font-size:20px;text-align:center}
.rcx .rcx-sub{text-align:center;color:var(--muted,#6B6B6B);font-size:13px;margin:0 0 12px}
.rcx-preview{display:grid;place-items:center;margin:6px 0 14px}
.rcx-preview svg{width:110px;height:110px;filter:drop-shadow(0 5px 12px rgba(0,0,0,.2))}
.rcx-preview .rc-body{fill:var(--rcx-body,#B8C0CC)}
.rcx-lab{font-weight:800;font-size:14px;margin:12px 0 7px}
.rcx-colors{display:flex;flex-wrap:wrap;gap:9px}
.rcx-sw{width:38px;height:38px;border-radius:50%;border:3px solid transparent;cursor:pointer;padding:0}
.rcx-sw.on{border-color:var(--ink,#2B2B2B);box-shadow:0 0 0 2px var(--card,#fff) inset}
.rcx-name{width:100%;padding:10px;border:1px solid var(--line,#ECE6DA);border-radius:12px;font-family:inherit;font-size:15px;text-align:center;background:var(--card,#fff);color:var(--ink,#2B2B2B)}
.rcx-accs{display:grid;grid-template-columns:repeat(auto-fill,minmax(84px,1fr));gap:9px}
.rcx-acc{position:relative;border:1.5px solid var(--line,#ECE6DA);border-radius:14px;padding:9px 4px;text-align:center;cursor:pointer;background:var(--card,#fff);color:var(--ink,#2B2B2B);font-family:inherit}
.rcx-acc.on{border-color:var(--good,#7BB661);background:color-mix(in srgb,var(--good,#7BB661) 12%,var(--card,#fff))}
.rcx-acc.locked{opacity:.55;cursor:not-allowed}
.rcx-acc .em{font-size:26px;line-height:1.1}
.rcx-acc .an{font-size:12px;font-weight:700;margin-top:3px}
.rcx-acc .lk{font-size:11px;color:var(--muted,#6B6B6B);margin-top:2px}
.rcx-acts{display:flex;gap:9px;margin-top:16px}
.rcx-acts button{flex:1;border:none;border-radius:13px;padding:11px;font-weight:800;font-family:inherit;cursor:pointer;font-size:15px}
.rcx-save{background:var(--good,#7BB661);color:#fff}
.rcx-close{background:color-mix(in srgb,var(--ink,#2B2B2B) 8%,var(--card,#fff));color:var(--ink,#2B2B2B)}
`;

function ensureStyle() {
  if (mounted) return; mounted = true;
  const st = document.createElement("style"); st.textContent = STYLE; document.head.appendChild(st);
}

// حالةٌ مؤقّتةٌ (تُحفَظُ فقط عند الضغط على «احفظ») كي تُعايَنَ التغييراتُ دون التزام.
export function openRoboCustom(onSaved) {
  ensureStyle();
  const cur = getRoboCustom();
  let draft = { color: cur.color, name: cur.name || "", accessory: cur.accessory || "none" };

  const ov = document.createElement("div"); ov.className = "rcx-ov";
  ov.innerHTML = `<div class="rcx" role="dialog" aria-label="خصّص آليّك">
    <h2>🎨 خصّصْ آليّك</h2>
    <p class="rcx-sub">اخترْ لونَه واسمَه وملحقاتِه — بعضُها يُفتَحُ بالإنجاز!</p>
    <div class="rcx-preview" id="rcxPrev"></div>
    <div class="rcx-lab">🎨 اللون</div>
    <div class="rcx-colors" id="rcxColors"></div>
    <div class="rcx-lab">✍️ الاسم</div>
    <input class="rcx-name" id="rcxName" maxlength="14" placeholder="سمِّ آليّك (اختياريّ)">
    <div class="rcx-lab">✨ الملحقات <span style="font-weight:600;color:var(--muted,#6B6B6B);font-size:12px">(أنجزتَ ${earnedCount()} نشاطًا)</span></div>
    <div class="rcx-accs" id="rcxAccs"></div>
    <div class="rcx-acts">
      <button class="rcx-close" id="rcxClose">إغلاق</button>
      <button class="rcx-save" id="rcxSave">💾 احفظ</button>
    </div>
  </div>`;
  document.body.appendChild(ov);

  const prev = ov.querySelector("#rcxPrev");
  function renderPreview() {
    prev.style.setProperty("--rcx-body", draft.color);
    const a = ROBO_ACCESSORIES.find(x => x.id === draft.accessory);
    const accSvg = (a && a.id !== "none" && isAccessoryUnlocked(a)) ? a.svg : "";
    prev.innerHTML = ROBO_SVG.replace("</svg>", accSvg + "</svg>");
  }
  renderPreview();

  // الألوان
  const cw = ov.querySelector("#rcxColors");
  cw.innerHTML = ROBO_COLORS.map(c => `<button class="rcx-sw${c.c === draft.color ? " on" : ""}" data-c="${c.c}" title="${c.name}" style="background:${c.c}"></button>`).join("");
  cw.querySelectorAll(".rcx-sw").forEach(b => b.onclick = () => {
    draft.color = b.getAttribute("data-c"); try { sfx.tap(); } catch (e) {}
    cw.querySelectorAll(".rcx-sw").forEach(x => x.classList.toggle("on", x === b));
    renderPreview();
  });

  // الاسم
  const nameEl = ov.querySelector("#rcxName");
  nameEl.value = draft.name;
  nameEl.oninput = () => { draft.name = nameEl.value.trim(); };

  // الملحقات
  const aw = ov.querySelector("#rcxAccs");
  function renderAccs() {
    aw.innerHTML = ROBO_ACCESSORIES.map(a => {
      const unlocked = isAccessoryUnlocked(a);
      const on = a.id === draft.accessory;
      return `<button class="rcx-acc${on ? " on" : ""}${unlocked ? "" : " locked"}" data-a="${a.id}"${unlocked ? "" : " disabled"}>
        <div class="em">${a.emoji}</div><div class="an">${a.name}</div>
        ${unlocked ? "" : `<div class="lk">🔒 عند ${a.need} نشاطًا</div>`}</button>`;
    }).join("");
    aw.querySelectorAll(".rcx-acc").forEach(b => b.onclick = () => {
      if (b.classList.contains("locked")) return;
      draft.accessory = b.getAttribute("data-a"); try { sfx.tap(); } catch (e) {}
      renderAccs(); renderPreview();
    });
  }
  renderAccs();

  const close = () => { ov.classList.remove("show"); setTimeout(() => ov.remove(), 200); };
  ov.querySelector("#rcxClose").onclick = close;
  ov.onclick = e => { if (e.target === ov) close(); };
  ov.querySelector("#rcxSave").onclick = () => {
    setRoboCustom({ color: draft.color, name: draft.name, accessory: draft.accessory });
    try { robo.refresh(); } catch (e) {}
    try { sfx.success(); } catch (e) {}
    try { robo.say(NOTICES.roboCustomized, "happy"); } catch (e) {} // عبارةٌ ثابتةٌ لها مقطعٌ عصبيّ (الاسمُ يظهرُ مرئيًّا)
    if (typeof onSaved === "function") { try { onSaved(getRoboCustom()); } catch (e) {} }
    close();
  };

  requestAnimationFrame(() => ov.classList.add("show"));
}
