// content/lang-en.js — محتوى اللغة الإنجليزيّة (قسم اللغات الأجنبيّة). بيانات ES module.
// النطق: مجموعة Piper «tts-arctic» (en_US-arctic) عند توفّرها، وإلّا Web Speech (en-US).
// تُجمَع كلُّ مناحي اللغة هنا: أحرف · أرقام · كلمات · قصص · نصوص (تُضاف تباعاً عبر المراحل).
export default {
  code: "en-US",        // رمز Web Speech
  name: "English",
  nameAr: "الإنجليزيّة",
  flag: "🇬🇧",
  dir: "ltr",
  voice: "tts-alba",  // مجموعة Piper المُدمجة (en_GB-alba)

  // الأبجديّة + كلمةٌ مثالٌ ورمزٌ معبّر لكلّ حرف.
  letters: [
    { ch: "A", word: "Apple",     emoji: "🍎" },
    { ch: "B", word: "Ball",      emoji: "⚽" },
    { ch: "C", word: "Cat",       emoji: "🐱" },
    { ch: "D", word: "Dog",       emoji: "🐶" },
    { ch: "E", word: "Egg",       emoji: "🥚" },
    { ch: "F", word: "Fish",      emoji: "🐟" },
    { ch: "G", word: "Goat",      emoji: "🐐" },
    { ch: "H", word: "House",     emoji: "🏠" },
    { ch: "I", word: "Ice cream", emoji: "🍦" },
    { ch: "J", word: "Jug",       emoji: "🫙" },
    { ch: "K", word: "Key",       emoji: "🔑" },
    { ch: "L", word: "Lion",      emoji: "🦁" },
    { ch: "M", word: "Moon",      emoji: "🌙" },
    { ch: "N", word: "Nest",      emoji: "🪺" },
    { ch: "O", word: "Orange",    emoji: "🍊" },
    { ch: "P", word: "Pen",       emoji: "🖊️" },
    { ch: "Q", word: "Queen",     emoji: "👑" },
    { ch: "R", word: "Rabbit",    emoji: "🐰" },
    { ch: "S", word: "Sun",       emoji: "☀️" },
    { ch: "T", word: "Tree",      emoji: "🌳" },
    { ch: "U", word: "Umbrella",  emoji: "☂️" },
    { ch: "V", word: "Van",       emoji: "🚐" },
    { ch: "W", word: "Water",     emoji: "💧" },
    { ch: "X", word: "Box",       emoji: "📦" },
    { ch: "Y", word: "Yarn",      emoji: "🧶" },
    { ch: "Z", word: "Zebra",     emoji: "🦓" },
  ],

  // الأعداد 0–20 بالكلمات (نُطقاً).
  numbers: [
    { n: 0, word: "Zero" }, { n: 1, word: "One" }, { n: 2, word: "Two" }, { n: 3, word: "Three" },
    { n: 4, word: "Four" }, { n: 5, word: "Five" }, { n: 6, word: "Six" }, { n: 7, word: "Seven" },
    { n: 8, word: "Eight" }, { n: 9, word: "Nine" }, { n: 10, word: "Ten" }, { n: 11, word: "Eleven" },
    { n: 12, word: "Twelve" }, { n: 13, word: "Thirteen" }, { n: 14, word: "Fourteen" }, { n: 15, word: "Fifteen" },
    { n: 16, word: "Sixteen" }, { n: 17, word: "Seventeen" }, { n: 18, word: "Eighteen" }, { n: 19, word: "Nineteen" },
    { n: 20, word: "Twenty" },
  ],
};
