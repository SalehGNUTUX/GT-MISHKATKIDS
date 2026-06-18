// src/story-reader.js — مشغّلُ قراءةِ القصص (تشغيل/إيقاف + قراءةٌ تلقائيّةٌ للقصّة كاملةً مع الانتقال). محلّيّ.
// يقرأ بمقطعِ القارئ المختار (عصبيّ/بشريّ/آليّ) وإلّا بنطق النظام. زرٌّ كبيرٌ واضحٌ يناسب الأطفال.
import { playStoryAsync, stopClip, storySourceKind } from "./tts-clips.js";
import { speak, stopSpeaking } from "./speak.js";
import { getStoryVoice, setStoryVoice, CLIPS } from "./sound-prefs.js";
import bundled from "./voices-bundled.json";

// قائمةُ القرّاء: المجموعات المُدمجة (العصبيّ/البشريّ) للنصوص أوّلًا، والآليّ أخيرًا (القصصُ تُقرأ بصوتٍ طبيعيّ افتراضًا).
function readerOptions() {
  const opts = [];
  (bundled.sets || []).forEach(s => { if (!s.types || s.types.includes("story") || s.types.includes("sentence")) opts.push({ id: s.id, name: (s.kind === "tts" ? "🧠 " : "🎙️ ") + (s.name || s.id) }); });
  opts.push({ id: CLIPS, name: "🤖 آليّ" });
  return opts;
}
// القارئُ المعروضُ في القائمة = ما يُشغَّل فعلًا: اختيارُ المستخدم إن كان خيارًا صالحًا (يشمل «آلي»)، وإلّا الأوّل (العصبيّ).
function effectiveReader() {
  const opts = readerOptions(), v = getStoryVoice();
  return opts.some(o => o.id === v) ? v : (opts[0] ? opts[0].id : CLIPS);
}
// الافتراض مرّةً واحدة: إن لم يَختر المستخدمُ قارئاً بعد، اجعلْه العصبيَّ (Piper) إن وُجِد — فتُقرأ القصصُ طبيعيّةً تلقائياً.
(function defaultToNeural() {
  try { if (localStorage.getItem("tilmithi_story_voice")) return; } catch (e) { return; }
  const tts = (bundled.sets || []).find(s => s.kind === "tts");
  if (tts) setStoryVoice(tts.id);
})();

let token = 0, playing = false;
export function isReading() { return playing; }
export function stopReading() { token++; playing = false; try { stopClip(); } catch (e) {} try { stopSpeaking(); } catch (e) {} }

async function readOne(text, my) {
  try { const el = document.getElementById("srNow"); if (el) el.textContent = "🔊 " + storySourceKind(text); } catch (e) {}
  const ok = await playStoryAsync(text);            // مقطعٌ جاهز؟
  if (my !== token) return;
  if (!ok) await new Promise(res => speak(text, { onend: res })); // وإلّا نطقُ النظام
}
// قراءةُ نصٍّ واحد (صفحةٌ/قصّة). يُحَلّ عند الانتهاء أو الإيقاف.
export async function readSingle(text) {
  stopReading(); const my = ++token; playing = true;
  await readOne(text, my);
  if (my === token) playing = false;
}
// قراءةٌ تلقائيّةٌ متتابعة: pages نصوصٌ، onPage(i) يعرضُ الصفحة، تنتقلُ تلقائياً حتى النهاية.
export async function readSequence(pages, onPage, startIdx = 0) {
  stopReading(); const my = ++token; playing = true;
  for (let i = startIdx; i < pages.length; i++) {
    if (my !== token) return;
    if (onPage) try { onPage(i); } catch (e) {}
    await readOne(pages[i], my);
    if (my !== token) return;
    await new Promise(r => setTimeout(r, 550));      // فاصلٌ لطيفٌ بين الصفحات
  }
  if (my === token) playing = false;
}

let styled = false;
function ensureStyle() {
  if (styled) return; styled = true;
  const st = document.createElement("style");
  st.textContent = `
  .sr-bar{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:10px 0}
  .sr-btn{border:none;border-radius:999px;padding:10px 18px;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 12px rgba(0,0,0,.12);transition:transform .1s}
  .sr-btn:active{transform:scale(.96)}
  .sr-play{background:#7BB661;color:#fff} .sr-whole{background:#6FB3D6;color:#fff}
  .sr-stop{background:#E0566B;color:#fff;animation:sr-pulse 1.2s ease-in-out infinite}
  @keyframes sr-pulse{0%,100%{box-shadow:0 4px 12px rgba(224,86,107,.3)}50%{box-shadow:0 4px 20px rgba(224,86,107,.7)}}
  .sr-reader{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--muted,#6B6B6B)}
  .sr-pick{font-family:inherit;font-size:13px;border:1px solid var(--line,#ECE6DA);border-radius:999px;padding:6px 10px;background:var(--card,#fff);color:var(--ink,#2B2B2B);cursor:pointer}
  .sr-now{display:inline-flex;align-items:center;font-size:13px;font-weight:700;color:#5E9A47;background:rgba(94,154,71,.16);border-radius:999px;padding:4px 10px}`;
  document.head.appendChild(st);
}

// يبني أزرارَ القراءة داخل host. cfg: { text, pages?, onPage?, rerender }.
// عند القراءة يظهرُ زرُّ إيقافٍ نابض؛ وإلّا زرُّ «اقرأ» (وزرُّ «القصّة كاملة» إن وُجِدت صفحات).
export function attachStoryReader(host, cfg = {}) {
  if (!host) return;
  ensureStyle();
  const rr = cfg.rerender || (() => attachStoryReader(host, cfg));
  if (isReading()) {
    host.innerHTML = `<div class="sr-bar"><button class="sr-btn sr-stop" id="srStop">⏹️ إيقاف القراءة</button><span class="sr-now" id="srNow"></span></div>`;
    host.querySelector("#srStop").onclick = () => { stopReading(); rr(); };
    return;
  }
  const whole = cfg.pages && cfg.pages.length > 1
    ? `<button class="sr-btn sr-whole" id="srWhole">📖 اقرأ القصّة كاملةً</button>` : "";
  const cur = effectiveReader(); // ما يُعرَض = ما يُشغَّل فعلًا (لا تضاربَ بين القائمة والتشغيل)
  const pick = `<select class="sr-pick" id="srPick" title="اختر القارئ">${readerOptions().map(o => `<option value="${o.id}" ${o.id === cur ? "selected" : ""}>${o.name}</option>`).join("")}</select>`;
  host.innerHTML = `<div class="sr-bar"><button class="sr-btn sr-play" id="srPlay">🔊 اقرأ ${cfg.pages?"الصفحة":"القصّة"}</button>${whole}<span class="sr-reader">القارئ: ${pick}</span></div>`;
  host.querySelector("#srPlay").onclick = () => { readSingle(cfg.text).then(rr); rr(); };
  const w = host.querySelector("#srWhole");
  if (w) w.onclick = () => { readSequence(cfg.pages, cfg.onPage, cfg.startIdx || 0).then(rr); rr(); };
  host.querySelector("#srPick").onchange = e => setStoryVoice(e.target.value); // تبديلُ القارئ مباشرةً دون الإعدادات
}
