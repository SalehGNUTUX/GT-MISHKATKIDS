// src/confirm-action.js — حارسٌ موحَّدٌ للعمليات الحسّاسة: رسالةُ تأكيدٍ + كلمةُ مرورِ الوالدين،
// ثمّ تنفيذٌ مؤجَّلٌ مع مهلةِ تراجع. محلّيٌّ بالكامل، يعمل في أيّ صفحة.
// الاستعمال:  if (await confirmWithPassword("حذف الملفّ؟")) undoable("حُذِف الملفّ", () => doDelete());
import { verifyParentPassword } from "./accounts.js";

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .ca-ov{position:fixed;inset:0;background:rgba(43,43,43,.5);z-index:120;display:flex;align-items:center;justify-content:center;padding:20px;font-family:inherit}
  .ca-card{background:#fff;border-radius:18px;box-shadow:0 8px 30px rgba(0,0,0,.25);max-width:380px;width:100%;padding:20px;text-align:center;color:#2B2B2B}
  .ca-card h3{margin:0 0 6px;font-size:18px}
  .ca-card p{color:#6B6B6B;font-size:14px;margin:0 0 12px}
  .ca-card input{width:200px;max-width:90%;padding:9px;border:1px solid #ECE6DA;border-radius:10px;font-family:inherit;text-align:center;font-size:15px}
  .ca-bad{color:#B5482F;font-size:13px;min-height:18px;margin-top:6px}
  .ca-btns{display:flex;gap:8px;justify-content:center;margin-top:10px}
  .ca-btns button{border:none;border-radius:12px;padding:10px 18px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}
  .ca-go{background:#E0566B;color:#fff} .ca-cancel{background:#fff;border:1px solid #ECE6DA;color:#2B2B2B}
  .ca-undo{position:fixed;inset-inline:0;bottom:calc(18px + env(safe-area-inset-bottom));margin:0 auto;width:max-content;max-width:90%;
    background:#2B2B2B;color:#fff;border-radius:14px;padding:10px 16px;font-size:14px;z-index:120;display:flex;gap:12px;align-items:center;box-shadow:0 6px 20px rgba(0,0,0,.25)}
  .ca-undo button{background:#fff;color:#2B2B2B;border:none;border-radius:10px;padding:6px 12px;font-weight:700;cursor:pointer;font-family:inherit}`;
  document.head.appendChild(st);
}

// رسالةُ تأكيدٍ مع كلمةِ مرورِ الوالدين. تُرجِع Promise<boolean>.
export function confirmWithPassword(message) {
  ensureStyle();
  return new Promise(resolve => {
    const ov = document.createElement("div"); ov.className = "ca-ov";
    ov.innerHTML = `<div class="ca-card"><h3>🛡️ تأكيدٌ مطلوب</h3><p>${message}</p>
      <input type="password" placeholder="كلمة مرور الوالدين" autocomplete="off" />
      <div class="ca-bad"></div>
      <div class="ca-btns"><button class="ca-go">تأكيد</button><button class="ca-cancel">إلغاء</button></div></div>`;
    document.body.appendChild(ov);
    const inp = ov.querySelector("input"), bad = ov.querySelector(".ca-bad");
    const done = v => { ov.remove(); resolve(v); };
    inp.focus();
    const go = () => { if (verifyParentPassword(inp.value)) done(true); else { bad.textContent = "كلمة مرور غير صحيحة."; inp.value = ""; inp.focus(); } };
    ov.querySelector(".ca-go").onclick = go;
    ov.querySelector(".ca-cancel").onclick = () => done(false);
    ov.addEventListener("click", e => { if (e.target === ov) done(false); });
    inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  });
}

// رسالةُ تأكيدٍ بسيطةٌ (دون كلمة مرور) بزرّين مخصّصين. تُرجِع Promise<boolean>.
export function confirmChoice(message, okText = "نعم", cancelText = "إلغاء") {
  ensureStyle();
  return new Promise(resolve => {
    const ov = document.createElement("div"); ov.className = "ca-ov";
    ov.innerHTML = `<div class="ca-card"><p style="font-size:15px;color:#2B2B2B;margin:4px 0 14px">${message}</p>
      <div class="ca-btns"><button class="ca-go">${okText}</button><button class="ca-cancel">${cancelText}</button></div></div>`;
    document.body.appendChild(ov);
    const done = v => { ov.remove(); resolve(v); };
    ov.querySelector(".ca-go").onclick = () => done(true);
    ov.querySelector(".ca-cancel").onclick = () => done(false);
    ov.addEventListener("click", e => { if (e.target === ov) done(false); });
  });
}

// تنفيذٌ مؤجَّلٌ مع مهلةِ تراجع: لا يُنفَّذ الإجراءُ إلّا بعد انقضاء المهلة دون تراجع.
// onUndo (اختياريّ) يُستدعى عند الضغط على «تراجع» — لاستعادة أيّ تغييرٍ بصريٍّ مؤقّت.
let pending = null;
export function undoable(message, finalize, ms = 6000, onUndo = null) {
  ensureStyle();
  if (pending) { clearTimeout(pending.t); pending.remove(); const f = pending.finalize; pending = null; if (f) f(); } // أنهِ السابقَ فورًا
  const bar = document.createElement("div"); bar.className = "ca-undo";
  bar.innerHTML = `<span>${message}</span><button>↩ تراجع</button>`;
  document.body.appendChild(bar);
  const remove = () => { try { bar.remove(); } catch (e) {} };
  pending = { finalize, remove, t: setTimeout(() => { remove(); pending = null; if (finalize) finalize(); }, ms) };
  bar.querySelector("button").onclick = () => { clearTimeout(pending.t); pending = null; remove(); if (onUndo) onUndo(); };
}
