// src/parent-guide-ui.js — نافذةُ «دليلِ الوالد»: كيف يُحوّلُ كلَّ نشاطٍ إلى تعلّمٍ حقيقيٍّ في الواقع.
// تُفتَحُ من لوحةِ الأهل العُليا في الفهرس. بطاقاتٌ قابلةٌ للطيّ (لماذا · كيف في الواقع · نصيحة).
import GUIDE from "../content/parent-guide.js";

let mounted = false;
const STYLE = `
.pg-ov{position:fixed;inset:0;z-index:120;background:rgba(20,20,28,.55);display:none;align-items:center;justify-content:center;padding:16px}
.pg-ov.show{display:flex}
.pg{background:var(--card,#fff);color:var(--ink,#2B2B2B);border:1px solid var(--line,#ECE6DA);border-radius:22px;max-width:560px;width:100%;
  max-height:90vh;overflow:auto;box-shadow:0 18px 50px rgba(0,0,0,.3);padding:18px}
.pg h2{margin:0 0 4px;font-size:21px;text-align:center}
.pg .pg-sub{text-align:center;color:var(--muted,#6B6B6B);font-size:13px;margin:0 0 14px;line-height:1.6}
.pg-item{border:1px solid var(--line,#ECE6DA);border-radius:15px;margin-bottom:10px;overflow:hidden;background:var(--card,#fff)}
.pg-head{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;font-weight:800;font-size:16px;user-select:none}
.pg-head .em{font-size:24px;flex:none}
.pg-head .ar{margin-inline-start:auto;color:var(--muted,#6B6B6B);font-size:14px;transition:transform .2s}
.pg-item.open .pg-head .ar{transform:rotate(180deg)}
.pg-body{display:none;padding:0 14px 14px;font-size:14.5px;line-height:1.75}
.pg-item.open .pg-body{display:block}
.pg-body .lab{font-weight:800;margin-top:10px;display:block}
.pg-body .why{color:var(--muted,#6B6B6B)}
.pg-body .tip{background:color-mix(in srgb,var(--good,#7BB661) 12%,var(--card,#fff));border-radius:11px;padding:9px 11px;margin-top:10px}
.pg-close{width:100%;margin-top:8px;border:none;border-radius:13px;padding:12px;font-weight:800;font-family:inherit;cursor:pointer;font-size:15px;
  background:color-mix(in srgb,var(--ink,#2B2B2B) 8%,var(--card,#fff));color:var(--ink,#2B2B2B)}
`;

function ensureStyle() { if (mounted) return; mounted = true; const st = document.createElement("style"); st.textContent = STYLE; document.head.appendChild(st); }

export function openParentGuide() {
  ensureStyle();
  const ov = document.createElement("div"); ov.className = "pg-ov";
  ov.innerHTML = `<div class="pg" role="dialog" aria-label="دليل الوالد">
    <h2>📘 دليلُ الوالد</h2>
    <p class="pg-sub">الشاشةُ محفّزٌ لا معلّم. لكلِّ نشاطٍ هنا كيفَ تُحوّلُه إلى تعلّمٍ حقيقيٍّ باللمسِ والحوارِ في الواقع.</p>
    <div id="pgList"></div>
    <button class="pg-close" id="pgClose">إغلاق</button>
  </div>`;
  const list = ov.querySelector("#pgList");
  list.innerHTML = GUIDE.map((g, i) => `<div class="pg-item" data-i="${i}">
    <div class="pg-head"><span class="em">${g.icon}</span><span>${g.title}</span><span class="ar">▾</span></div>
    <div class="pg-body">
      <span class="lab">💡 لماذا؟</span><span class="why">${g.why}</span>
      <span class="lab">🖐️ كيفَ في الواقع؟</span><span>${g.how}</span>
      <div class="tip">🌱 <b>نصيحة:</b> ${g.tip}</div>
    </div></div>`).join("");
  list.querySelectorAll(".pg-head").forEach(h => h.onclick = () => h.parentElement.classList.toggle("open"));

  const close = () => { ov.classList.remove("show"); setTimeout(() => ov.remove(), 200); };
  ov.querySelector("#pgClose").onclick = close;
  ov.onclick = e => { if (e.target === ov) close(); };
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("show"));
}
