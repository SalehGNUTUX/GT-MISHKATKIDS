// content/orient.js — بياناتُ «الزمانِ والمكان» (v1.5): الاتجاهاتُ · الفصولُ · فتراتُ اليومِ والليل
// بالعربيّةِ والإنجليزيّةِ والفرنسيّة. Node-safe (بلا DOM) — تقرؤُها الواجهةُ ومولّداتُ الصوت.
// النطقُ: العربيّةُ بمقاطعِ espeak (gen:audio)؛ اللغاتُ الأجنبيّةُ بمقاطعِ Piper (gen-piper-lang).

// الاتجاهاتُ الثمانية (deg من الشمالِ 0° باتّجاهِ عقاربِ الساعة). الأربعةُ الأصليّةُ prime:true.
export const DIRECTIONS = [
  { k: "n",  deg: 0,   prime: true,  ar: "الشَّمال",           en: "North",      fr: "Nord",       emoji: "⬆️" },
  { k: "ne", deg: 45,  prime: false, ar: "الشَّمالُ الشَّرقيّ", en: "North-East", fr: "Nord-Est",   emoji: "↗️" },
  { k: "e",  deg: 90,  prime: true,  ar: "الشَّرق",            en: "East",       fr: "Est",        emoji: "➡️" },
  { k: "se", deg: 135, prime: false, ar: "الجَنوبُ الشَّرقيّ",  en: "South-East", fr: "Sud-Est",    emoji: "↘️" },
  { k: "s",  deg: 180, prime: true,  ar: "الجَنوب",            en: "South",      fr: "Sud",        emoji: "⬇️" },
  { k: "sw", deg: 225, prime: false, ar: "الجَنوبُ الغَربيّ",   en: "South-West", fr: "Sud-Ouest",  emoji: "↙️" },
  { k: "w",  deg: 270, prime: true,  ar: "الغَرب",             en: "West",       fr: "Ouest",      emoji: "⬅️" },
  { k: "nw", deg: 315, prime: false, ar: "الشَّمالُ الغَربيّ",  en: "North-West", fr: "Nord-Ouest", emoji: "↖️" },
];

// الفصولُ الأربعة (arTrait/… وصفٌ يُعرَضُ نصًّا فقط، لا يُنطَق).
export const SEASONS = [
  { k: "spring", ar: "الرَّبيع", en: "Spring", fr: "Printemps", emoji: "🌸", arTrait: "يعتدلُ الجوُّ وتتفتّحُ الأزهار",     enTrait: "Mild weather, flowers bloom", frTrait: "Temps doux, les fleurs s'ouvrent" },
  { k: "summer", ar: "الصَّيف", en: "Summer", fr: "Été",       emoji: "☀️", arTrait: "حارٌّ ونهارُه طويل",              enTrait: "Hot, long days",           frTrait: "Chaud, journées longues" },
  { k: "autumn", ar: "الخَريف", en: "Autumn", fr: "Automne",   emoji: "🍂", arTrait: "يبردُ الجوُّ وتتساقطُ الأوراق",    enTrait: "Cooler, leaves fall",       frTrait: "Plus frais, les feuilles tombent" },
  { k: "winter", ar: "الشِّتاء", en: "Winter", fr: "Hiver",     emoji: "❄️", arTrait: "باردٌ وتكثرُ الأمطار",             enTrait: "Cold, lots of rain",        frTrait: "Froid, beaucoup de pluie" },
];

// فتراتُ اليومِ والليل (مرتّبةٌ زمنيًّا). ثريّةٌ بالعربيّة، ولكلٍّ مقابلٌ إنجليزيٌّ وفرنسيّ.
export const DAYPARTS = [
  { k: "fajr",    ar: "الفَجْر",    en: "Dawn",       fr: "Aube",        emoji: "🌄", night: true },
  { k: "sabah",   ar: "الصَّباح",   en: "Morning",    fr: "Matin",       emoji: "🌅", night: false },
  { k: "duha",    ar: "الضُّحى",    en: "Forenoon",   fr: "Matinée",     emoji: "🌞", night: false },
  { k: "dhuhr",   ar: "الظَّهيرة",  en: "Noon",       fr: "Midi",        emoji: "☀️", night: false },
  { k: "asr",     ar: "العَصْر",    en: "Afternoon",  fr: "Après-midi",  emoji: "🌤️", night: false },
  { k: "ghurub",  ar: "الغُروب",    en: "Sunset",     fr: "Coucher",     emoji: "🌇", night: false },
  { k: "masaa",   ar: "المَساء",    en: "Evening",    fr: "Soir",        emoji: "🌆", night: true },
  { k: "layl",    ar: "اللَّيل",    en: "Night",      fr: "Nuit",        emoji: "🌙", night: true },
];

const langKey = l => (l === "en" || l === "fr") ? l : "ar";
export const nameOf = (item, lang) => item[langKey(lang)];

// كلُّ الكلماتِ المنطوقةِ للّغةِ (للمولّدات): الاتجاهات + الفصول + الفترات.
export function allOrientWords(lang) {
  const k = langKey(lang);
  return [...new Set([...DIRECTIONS, ...SEASONS, ...DAYPARTS].map(x => x[k]).filter(Boolean))];
}
