// content/lang-fr.js — محتوى اللغة الفرنسيّة (قسم اللغات الأجنبيّة). بيانات ES module.
// النطق: مجموعة Piper «tts-tom» (fr_FR-tom) عند توفّرها، وإلّا Web Speech (fr-FR).
export default {
  code: "fr-FR",
  name: "Français",
  nameAr: "الفرنسيّة",
  flag: "🇫🇷",
  dir: "ltr",
  voice: "tts-tom",  // مجموعة Piper المُدمجة (fr_FR-tom)

  // الأبجديّة الفرنسيّة + كلمةٌ مثالٌ ورمز.
  letters: [
    { ch: "A", word: "Avion",   emoji: "✈️" },
    { ch: "B", word: "Ballon",  emoji: "🎈" },
    { ch: "C", word: "Chat",    emoji: "🐱" },
    { ch: "D", word: "Dé",      emoji: "🎲" },
    { ch: "E", word: "Étoile",  emoji: "⭐" },
    { ch: "F", word: "Fleur",   emoji: "🌸" },
    { ch: "G", word: "Gâteau",  emoji: "🍰" },
    { ch: "H", word: "Hibou",   emoji: "🦉" },
    { ch: "I", word: "Île",     emoji: "🏝️" },
    { ch: "J", word: "Jardin",  emoji: "🌷" },
    { ch: "K", word: "Koala",   emoji: "🐨" },
    { ch: "L", word: "Lune",    emoji: "🌙" },
    { ch: "M", word: "Maison",  emoji: "🏠" },
    { ch: "N", word: "Nuage",   emoji: "☁️" },
    { ch: "O", word: "Oiseau",  emoji: "🐦" },
    { ch: "P", word: "Pomme",   emoji: "🍎" },
    { ch: "Q", word: "Quille",  emoji: "🎳" },
    { ch: "R", word: "Renard",  emoji: "🦊" },
    { ch: "S", word: "Soleil",  emoji: "☀️" },
    { ch: "T", word: "Tortue",  emoji: "🐢" },
    { ch: "U", word: "Univers", emoji: "🌌" },
    { ch: "V", word: "Vache",   emoji: "🐄" },
    { ch: "W", word: "Wagon",   emoji: "🚃" },
    { ch: "X", word: "Xylophone", emoji: "🎶" },
    { ch: "Y", word: "Yaourt",  emoji: "🥛" },
    { ch: "Z", word: "Zèbre",   emoji: "🦓" },
  ],

  numbers: [
    { n: 0, word: "Zéro" }, { n: 1, word: "Un" }, { n: 2, word: "Deux" }, { n: 3, word: "Trois" },
    { n: 4, word: "Quatre" }, { n: 5, word: "Cinq" }, { n: 6, word: "Six" }, { n: 7, word: "Sept" },
    { n: 8, word: "Huit" }, { n: 9, word: "Neuf" }, { n: 10, word: "Dix" }, { n: 11, word: "Onze" },
    { n: 12, word: "Douze" }, { n: 13, word: "Treize" }, { n: 14, word: "Quatorze" }, { n: 15, word: "Quinze" },
    { n: 16, word: "Seize" }, { n: 17, word: "Dix-sept" }, { n: 18, word: "Dix-huit" }, { n: 19, word: "Dix-neuf" },
    { n: 20, word: "Vingt" },
  ],

  // كلماتٌ مواضيعيّة (الكلمة الفرنسيّة + معناها العربيّ + رمز).
  words: [
    { id: "animals", ar: "حيوانات", items: [
      { w: "Chat", ar: "قطّة", emoji: "🐱" }, { w: "Chien", ar: "كلب", emoji: "🐶" }, { w: "Oiseau", ar: "طائر", emoji: "🐦" },
      { w: "Poisson", ar: "سمكة", emoji: "🐟" }, { w: "Lion", ar: "أسد", emoji: "🦁" }, { w: "Cheval", ar: "حصان", emoji: "🐴" }, { w: "Mouton", ar: "خروف", emoji: "🐑" }, { w: "Lapin", ar: "أرنب", emoji: "🐰" } ] },
    { id: "colors", ar: "ألوان", items: [
      { w: "Rouge", ar: "أحمر", emoji: "🔴" }, { w: "Bleu", ar: "أزرق", emoji: "🔵" }, { w: "Vert", ar: "أخضر", emoji: "🟢" },
      { w: "Jaune", ar: "أصفر", emoji: "🟡" }, { w: "Noir", ar: "أسود", emoji: "⚫" }, { w: "Blanc", ar: "أبيض", emoji: "⚪" } ] },
    { id: "family", ar: "العائلة", items: [
      { w: "Mère", ar: "أمّ", emoji: "👩" }, { w: "Père", ar: "أب", emoji: "👨" }, { w: "Frère", ar: "أخ", emoji: "👦" },
      { w: "Sœur", ar: "أخت", emoji: "👧" }, { w: "Bébé", ar: "رضيع", emoji: "👶" }, { w: "Famille", ar: "عائلة", emoji: "👪" } ] },
    { id: "food", ar: "طعام", items: [
      { w: "Pomme", ar: "تفّاحة", emoji: "🍎" }, { w: "Pain", ar: "خبز", emoji: "🍞" }, { w: "Lait", ar: "حليب", emoji: "🥛" },
      { w: "Eau", ar: "ماء", emoji: "💧" }, { w: "Œuf", ar: "بيضة", emoji: "🥚" }, { w: "Banane", ar: "موزة", emoji: "🍌" }, { w: "Miel", ar: "عسل", emoji: "🍯" } ] },
    { id: "body", ar: "الجسم", items: [
      { w: "Main", ar: "يد", emoji: "✋" }, { w: "Œil", ar: "عين", emoji: "👁️" }, { w: "Oreille", ar: "أذن", emoji: "👂" },
      { w: "Nez", ar: "أنف", emoji: "👃" }, { w: "Bouche", ar: "فم", emoji: "👄" }, { w: "Pied", ar: "قدم", emoji: "🦶" } ] },
  ],
};
