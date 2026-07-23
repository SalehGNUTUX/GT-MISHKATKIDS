// src/quran-online.js — منطقُ القرآنِ الكاملِ عبرَ الإنترنت (استثناءٌ مأذونٌ من «محلّيٌّ 100%»).
// **مُطفأٌ افتراضيًّا خلفَ بوّابةِ الوالد.** لا يَمَسُّ القرآنَ المحلّيَّ (الفاتحة+جزء عمّ) في quran.html إطلاقًا.
// النصُّ من alquran.cloud، الصوتُ من everyayah (الحصري) — يُخبّئُهما عاملُ الخدمةِ فيعملانِ لاحقًا دونَ إنترنت.
// السورُ المحلّيّةُ أصلًا (LOCAL) تُقرأُ من الحزمةِ (نصٌّ من content/quran.js، صوتٌ من public/quran/husary) بلا شبكة.
import QF from "../content/quran-full.js";
import LOCAL_QURAN from "../content/quran.js";

const GATE_KEY = "tilmithi_quran_online";  // بوّابةُ الوالد (off افتراضًا) — عامّةٌ يضبطُها الوالدُ في اللوحة
const DL_KEY = "tilmithi_quran_dl";        // مجموعةُ أرقامِ السورِ المنزَّلةِ يدويًّا

export const QURAN_FULL = QF;
export const LOCAL_SURAHS = new Set(QF.local);
const pad3 = n => String(n).padStart(3, "0");

// ── بوّابةُ الوالد ──
export function isQuranOnlineOn() { try { return localStorage.getItem(GATE_KEY) === "on"; } catch (e) { return false; } }
export function setQuranOnlineOn(on) { try { localStorage.setItem(GATE_KEY, on ? "on" : "off"); } catch (e) {} }

// ── البياناتُ الوصفيّة ──
export function surahMeta(n) { return QF.surahs[n - 1]; }
export function hizbList() { return QF.hizbs; }
export function isSurahLocal(n) { return LOCAL_SURAHS.has(n); }

// ── الروابط ──
// الصوت: المحلّيُّ من الحزمة (نسبيّ)، وغيرُه من everyayah (الحصري 128) — يُخبّئُه الـSW عند الاستماع/التنزيل.
export const audioUrl = (s, a) => LOCAL_SURAHS.has(s)
  ? `quran/husary/${pad3(s)}${pad3(a)}.mp3`
  : `https://everyayah.com/data/Husary_128kbps/${pad3(s)}${pad3(a)}.mp3`;
export const BASMALA_AUDIO = "quran/husary/001001.mp3"; // صوتُ البسملةِ المستقلّ = الفاتحة آية1 (محلّيّ، كمنطقِ quran.html)
const textApi = n => `https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`;

// ── حالةُ التوفّر ──
function dlSet() { try { return new Set(JSON.parse(localStorage.getItem(DL_KEY) || "[]")); } catch (e) { return new Set(); } }
function saveDl(s) { try { localStorage.setItem(DL_KEY, JSON.stringify([...s])); } catch (e) {} }
// متوفّرٌ دونَ إنترنت: محلّيٌّ مضمَّنٌ أو منزَّلٌ يدويًّا.
export function isAvailableOffline(n) { return LOCAL_SURAHS.has(n) || dlSet().has(n); }
export function downloadedCount() { return dlSet().size; }

// ── نصُّ السورة ──
// المحلّيّةُ من content/quran.js (بلا شبكة)؛ غيرُها من alquran.cloud (ويُخبّئُه الـSW). يرجعُ [{a,text}].
export async function fetchSurahText(n) {
  if (LOCAL_SURAHS.has(n)) {
    const s = LOCAL_QURAN.surahs.find(x => x.n === n);
    if (s) return s.ayahs.map(x => ({ a: x.a, text: String(x.text).replace(/﻿/g, "").trim() }));
  }
  const j = await (await fetch(textApi(n))).json();
  if (!j || !j.data || !j.data.ayahs) throw new Error("تعذّرَ جلبُ نصِّ السورة");
  return j.data.ayahs.map(x => ({ a: x.numberInSurah, text: String(x.text).replace(/﻿/g, "").trim() }));
}

// ── تنزيلُ سورةٍ للاستماعِ دونَ إنترنت ──
// يجلبُ النصَّ + كلَّ آياتِ الصوتِ (بوضعِ no-cors لغيرِ المحلّيّ) فيُخبّئُها الـSW، ثمّ يُعلِّمُها منزَّلة.
// onProgress(done,total) للشريط. في التطويرِ (بلا SW) يُعلِّمُ فقط.
export async function downloadSurah(n, onProgress) {
  if (LOCAL_SURAHS.has(n)) return true; // مضمَّنٌ أصلًا
  const meta = surahMeta(n); const total = meta.ayahCount;
  try { await fetch(textApi(n)); } catch (e) {}
  let done = 0;
  for (let a = 1; a <= total; a++) {
    try { await fetch(audioUrl(n, a), { mode: "no-cors" }); } catch (e) {}
    done++; if (onProgress) { try { onProgress(done, total); } catch (e) {} }
  }
  const s = dlSet(); s.add(n); saveDl(s);
  return true;
}

// ── حذفُ تنزيلِ سورة ──
export async function deleteSurah(n) {
  if (LOCAL_SURAHS.has(n)) return; // لا نحذفُ المضمَّن
  try {
    const c = await caches.open("quran-online-audio");
    const meta = surahMeta(n);
    for (let a = 1; a <= meta.ayahCount; a++) { try { await c.delete(audioUrl(n, a)); } catch (e) {} }
  } catch (e) {}
  const s = dlSet(); s.delete(n); saveDl(s);
}
