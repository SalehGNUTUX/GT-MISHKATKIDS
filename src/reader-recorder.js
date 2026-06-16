// src/reader-recorder.js — مُسجِّلُ تمرّنِ القراءةِ المُضمَّن في الأقسام (قصص/قراءة/…). محلّيّ بالكامل.
// يسجّلُ الطفلُ قراءتَه للنصّ الحاليّ في حسابه، يستمعُ إليها، ويستعينُ عند الحاجة بقراءةِ حسابٍ آخر
// (أختِه مثلاً) أو بصوتِ التطبيق. تسجيلُ الطفلِ خاصٌّ بحسابه؛ الضيفُ مؤقّت (انظر practice.js).
import { savePractice, getPractice, deletePractice, helpersFor } from "./practice.js";
import { speak } from "./speak.js";
import { confirmChoice } from "./confirm-action.js";

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .rr{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:center;background:#FBF7EF;border:1px dashed #ECE6DA;border-radius:14px;padding:10px;margin:10px 0;font-family:inherit}
  .rr button{border:1px solid #ECE6DA;background:#fff;border-radius:12px;padding:8px 13px;font-size:14px;cursor:pointer;font-family:inherit;color:#2B2B2B}
  .rr button.rr-rec{background:#E07A5F;color:#fff;border-color:#E07A5F}
  .rr button.rr-rec.on{background:#E0566B;border-color:#E0566B;animation:rr-pulse 1s infinite}
  .rr button.rr-help{background:#fff;border-color:#C9A0DC;color:#7a4fa0}
  @keyframes rr-pulse{0%,100%{opacity:1}50%{opacity:.6}}
  .rr .rr-st{font-size:12px;color:#6B6B6B;width:100%;text-align:center}`;
  document.head.appendChild(st);
}

let stream = null, rec = null, chunks = [], active = null;
async function mic() { if (!stream) stream = await navigator.mediaDevices.getUserMedia({ audio: true }); return stream; }
function playBlob(blob) { try { const u = URL.createObjectURL(blob); const a = new Audio(u); a.onended = () => URL.revokeObjectURL(u); a.play().catch(() => {}); } catch (e) {} }

// يربطُ المُسجِّلَ بعنصرِ host لنصٍّ مُعطًى. يُستدعى كلّما تغيّر النصُّ المعروض.
export async function attachReader(host, text, opts = {}) {
  ensureStyle();
  if (!host) return;
  const label = opts.label || "قراءتك";
  host.innerHTML = `<div class="rr">
    <button class="rr-rec" data-a="rec">🎙️ سجّلْ ${label}</button>
    <button data-a="play" style="display:none">▶ استمعْ لتسجيلك</button>
    <button data-a="del" style="display:none">🗑️</button>
    <button class="rr-help" data-a="help">${opts.helpLabel || "🤝 استعنْ بقراءة"}</button>
    <span class="rr-st"></span>
  </div>`;
  const box = host.querySelector(".rr");
  const st = box.querySelector(".rr-st");
  const playB = box.querySelector('[data-a="play"]'), delB = box.querySelector('[data-a="del"]');
  async function refreshOwn() {
    const r = await getPractice(text);
    const has = !!(r && r.blob);
    playB.style.display = has ? "" : "none";
    delB.style.display = has ? "" : "none";
  }
  await refreshOwn();
  box.addEventListener("click", async e => {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const a = b.getAttribute("data-a");
    if (a === "rec") {
      if (rec && rec.state === "recording") { rec.stop(); return; }
      try {
        await mic(); chunks = []; rec = new MediaRecorder(stream); active = b;
        rec.ondataavailable = ev => { if (ev.data.size) chunks.push(ev.data); };
        rec.onstop = async () => {
          b.classList.remove("on"); b.textContent = `🎙️ سجّلْ ${label}`;
          const blob = new Blob(chunks, { type: "audio/webm" });
          let ts = 0; try { ts = Date.now(); } catch (e) {}
          await savePractice(text, blob, ts); st.textContent = "حُفِظت قراءتُك في حسابك ✅"; await refreshOwn();
        };
        rec.start(); b.classList.add("on"); b.textContent = "■ أوقِفْ"; st.textContent = "يسجّل… اقرأِ الآن";
      } catch (err) { st.textContent = "تعذّر الوصول إلى الميكروفون."; }
    } else if (a === "play") {
      const r = await getPractice(text); if (r && r.blob) { st.textContent = "تستمعُ لقراءتك 🔊"; playBlob(r.blob); }
    } else if (a === "del") {
      if (await confirmChoice("حذفُ تسجيلِك لهذا النصّ؟ يمكنك تسجيلُه ثانيةً.", "🗑️ حذف", "إبقاء")) { await deletePractice(text); st.textContent = "حُذِف تسجيلُك."; await refreshOwn(); }
    } else if (a === "help") {
      if (opts.onHelp) { st.textContent = opts.helpStatus || "تستمعُ للقراءة المرجعيّة 🔊"; opts.onHelp(); return; } // مرجعٌ مخصّص (كتلاوة الحصري)
      const others = await helpersFor(text);
      if (others.length) { const h = others[0]; st.textContent = `تستمعُ لقراءة ${h.name || "حسابٍ آخر"} 🤝`; playBlob(h.blob); }
      else { st.textContent = "قراءةُ التطبيق 🔊"; speak(text); }
    }
  });
}
