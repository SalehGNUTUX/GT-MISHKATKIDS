// content/clock-time.js — نطقُ الوقتِ بجُمَلٍ طبيعيّةٍ صحيحةٍ في كلِّ لغة (عربيّ/إنجليزيّ/فرنسيّ).
// مصدرٌ موحَّدٌ يستعملُه: (1) مولّداتُ Piper (gen-piper / gen-piper-lang) لإنتاجِ المقاطع،
// (2) وحدةُ الساعة (clock-widget) لتشغيلِ المقطعِ بنفسِ النصّ. Node-safe (بلا DOM).
// الدقائقُ بخطواتِ 5 (0,5,…,55) — 12 ساعةً × 12 = 144 جملةً لكلّ لغة. النصُّ العربيُّ مشكولٌ للنطق الصحيح.

const h12 = h => ((h % 12) || 12);
const next = h => (h % 12) + 1;               // الساعةُ التالية (للصيغِ «إلّا» / «moins»)
export const CLOCK_STEP = 5;
export const CLOCK_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

// ===== العربيّة (مشكولة) =====
const AR_H = { 1: "الوَاحِدَةُ", 2: "الثَّانِيَةُ", 3: "الثَّالِثَةُ", 4: "الرَّابِعَةُ", 5: "الخَامِسَةُ", 6: "السَّادِسَةُ", 7: "السَّابِعَةُ", 8: "الثَّامِنَةُ", 9: "التَّاسِعَةُ", 10: "العَاشِرَةُ", 11: "الحَادِيَةَ عَشْرَةَ", 12: "الثَّانِيَةَ عَشْرَةَ" };
const AR_MIN = { 5: "وَخَمْسُ دَقَائِق", 10: "وَعَشْرُ دَقَائِق", 15: "وَالرُّبْع", 20: "وَعِشْرُونَ دَقِيقَة", 25: "وَخَمْسٌ وَعِشْرُونَ دَقِيقَة", 30: "وَالنِّصْف", 35: "وَخَمْسٌ وَثَلَاثُونَ دَقِيقَة", 40: "وَأَرْبَعُونَ دَقِيقَة", 45: "وَخَمْسٌ وَأَرْبَعُونَ دَقِيقَة", 50: "وَخَمْسُونَ دَقِيقَة", 55: "وَخَمْسٌ وَخَمْسُونَ دَقِيقَة" };
function arPhrase(h, m) {
  const base = "السَّاعَةُ " + AR_H[h12(h)];
  return m ? base + " " + AR_MIN[m] : base;
}

// ===== الإنجليزيّة (بريطانيّة: past/to) =====
const EN_H = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten", 11: "eleven", 12: "twelve" };
const EN_MIN = { 5: "five", 10: "ten", 20: "twenty", 25: "twenty-five", 35: "twenty-five", 40: "twenty", 50: "ten", 55: "five" };
function enPhrase(h, m) {
  const H = h12(h), N = next(H);
  if (m === 0) return `${EN_H[H]} o'clock`;
  if (m === 15) return `quarter past ${EN_H[H]}`;
  if (m === 30) return `half past ${EN_H[H]}`;
  if (m === 45) return `quarter to ${EN_H[N]}`;
  if (m < 30) return `${EN_MIN[m]} past ${EN_H[H]}`;
  return `${EN_MIN[m]} to ${EN_H[N]}`;                 // 35/40/50/55 → إلى الساعةِ التالية
}

// ===== الفرنسيّة (et quart / et demie / moins) =====
const FR_H = { 1: "une heure", 2: "deux heures", 3: "trois heures", 4: "quatre heures", 5: "cinq heures", 6: "six heures", 7: "sept heures", 8: "huit heures", 9: "neuf heures", 10: "dix heures", 11: "onze heures", 12: "douze heures" };
const FR_MIN = { 5: "cinq", 10: "dix", 20: "vingt", 25: "vingt-cinq", 35: "vingt-cinq", 40: "vingt", 50: "dix", 55: "cinq" };
function frPhrase(h, m) {
  const H = h12(h), N = next(H);
  if (m === 0) return FR_H[H];
  if (m === 15) return `${FR_H[H]} et quart`;
  if (m === 30) return `${FR_H[H]} et demie`;
  if (m === 45) return `${FR_H[N]} moins le quart`;
  if (m < 30) return `${FR_H[H]} ${FR_MIN[m]}`;
  return `${FR_H[N]} moins ${FR_MIN[m]}`;               // 35/40/50/55 → moins … de la suivante
}

// النصُّ المنطوقُ للوقتِ (h:1..12 أو 0..23، m مضاعفُ 5). lang ∈ ar|en|fr.
export function timePhrase(lang, h, m) {
  m = Math.round(m / CLOCK_STEP) * CLOCK_STEP % 60;
  if (lang === "en") return enPhrase(h, m);
  if (lang === "fr") return frPhrase(h, m);
  return arPhrase(h, m);
}

// لصيقةُ صباحًا/مساءً (مقطعٌ قصيرٌ مستقلٌّ يُنطَقُ بعد الوقتِ عند معرفةِ ص/م — فيبقى الصوتُ محدودًا).
export function amPmWord(lang, pm) {
  if (lang === "en") return pm ? "in the evening" : "in the morning";
  if (lang === "fr") return pm ? "du soir" : "du matin";
  return pm ? "مَسَاءً" : "صَبَاحًا";
}
export function allClockAmPm(lang) { return [amPmWord(lang, false), amPmWord(lang, true)]; }

// كلُّ جُمَلِ الوقتِ للّغةِ (144 + لصيقتا ص/م) — للمولّدات.
export function allClockPhrases(lang) {
  const out = [];
  for (let h = 1; h <= 12; h++) for (const m of CLOCK_MINUTES) out.push(timePhrase(lang, h, m));
  return [...new Set([...out, ...allClockAmPm(lang)])];
}
