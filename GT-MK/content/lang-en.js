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
    { n: 20, word: "Twenty" }, { n: 30, word: "Thirty" }, { n: 40, word: "Forty" }, { n: 50, word: "Fifty" },
    { n: 60, word: "Sixty" }, { n: 70, word: "Seventy" }, { n: 80, word: "Eighty" }, { n: 90, word: "Ninety" }, { n: 100, word: "One hundred" },
  ],

  // كلماتٌ مواضيعيّة (الكلمة الإنجليزيّة + معناها العربيّ + رمز). تُنطَق بـPiper وتُولَّد لها مقاطع.
  words: [
    { id: "animals", ar: "حيوانات", items: [
      { w: "Cat", ar: "قطّة", emoji: "🐱" }, { w: "Dog", ar: "كلب", emoji: "🐶" }, { w: "Bird", ar: "طائر", emoji: "🐦" },
      { w: "Fish", ar: "سمكة", emoji: "🐟" }, { w: "Lion", ar: "أسد", emoji: "🦁" }, { w: "Horse", ar: "حصان", emoji: "🐴" }, { w: "Sheep", ar: "خروف", emoji: "🐑" }, { w: "Rabbit", ar: "أرنب", emoji: "🐰" } ] },
    { id: "colors", ar: "ألوان", items: [
      { w: "Red", ar: "أحمر", emoji: "🔴" }, { w: "Blue", ar: "أزرق", emoji: "🔵" }, { w: "Green", ar: "أخضر", emoji: "🟢" },
      { w: "Yellow", ar: "أصفر", emoji: "🟡" }, { w: "Black", ar: "أسود", emoji: "⚫" }, { w: "White", ar: "أبيض", emoji: "⚪" } ] },
    { id: "family", ar: "العائلة", items: [
      { w: "Mother", ar: "أمّ", emoji: "👩" }, { w: "Father", ar: "أب", emoji: "👨" }, { w: "Brother", ar: "أخ", emoji: "👦" },
      { w: "Sister", ar: "أخت", emoji: "👧" }, { w: "Baby", ar: "رضيع", emoji: "👶" }, { w: "Family", ar: "عائلة", emoji: "👪" } ] },
    { id: "food", ar: "طعام", items: [
      { w: "Apple", ar: "تفّاحة", emoji: "🍎" }, { w: "Bread", ar: "خبز", emoji: "🍞" }, { w: "Milk", ar: "حليب", emoji: "🥛" },
      { w: "Water", ar: "ماء", emoji: "💧" }, { w: "Egg", ar: "بيضة", emoji: "🥚" }, { w: "Banana", ar: "موزة", emoji: "🍌" }, { w: "Honey", ar: "عسل", emoji: "🍯" } ] },
    { id: "body", ar: "الجسم", items: [
      { w: "Hand", ar: "يد", emoji: "✋" }, { w: "Eye", ar: "عين", emoji: "👁️" }, { w: "Ear", ar: "أذن", emoji: "👂" },
      { w: "Nose", ar: "أنف", emoji: "👃" }, { w: "Mouth", ar: "فم", emoji: "👄" }, { w: "Foot", ar: "قدم", emoji: "🦶" } ] },
    { id: "greetings", ar: "تحايا", items: [
      { w: "Hello", ar: "مرحبًا", emoji: "👋" }, { w: "Goodbye", ar: "وداعًا", emoji: "🙋" }, { w: "Please", ar: "من فضلك", emoji: "🙏" },
      { w: "Thank you", ar: "شكرًا", emoji: "🤲" }, { w: "Yes", ar: "نعم", emoji: "✅" }, { w: "No", ar: "لا", emoji: "❌" } ] },
    { id: "school", ar: "المدرسة", items: [
      { w: "Book", ar: "كتاب", emoji: "📖" }, { w: "Pen", ar: "قلم", emoji: "🖊️" }, { w: "Bag", ar: "حقيبة", emoji: "🎒" },
      { w: "Chair", ar: "كرسيّ", emoji: "🪑" }, { w: "School", ar: "مدرسة", emoji: "🏫" }, { w: "Teacher", ar: "معلّم", emoji: "🧑‍🏫" } ] },
    { id: "nature", ar: "الطبيعة", items: [
      { w: "Sun", ar: "شمس", emoji: "☀️" }, { w: "Moon", ar: "قمر", emoji: "🌙" }, { w: "Star", ar: "نجمة", emoji: "⭐" },
      { w: "Tree", ar: "شجرة", emoji: "🌳" }, { w: "Flower", ar: "زهرة", emoji: "🌸" }, { w: "Sea", ar: "بحر", emoji: "🌊" } ] },
    { id: "transport", ar: "المواصلات", items: [
      { w: "Car", ar: "سيّارة", emoji: "🚗" }, { w: "Bus", ar: "حافلة", emoji: "🚌" }, { w: "Train", ar: "قطار", emoji: "🚂" },
      { w: "Plane", ar: "طائرة", emoji: "✈️" }, { w: "Boat", ar: "قارب", emoji: "⛵" }, { w: "Bike", ar: "درّاجة", emoji: "🚲" } ] },
    { id: "fruits", ar: "فواكه", items: [
      { w: "Grapes", ar: "عنب", emoji: "🍇" }, { w: "Orange", ar: "برتقال", emoji: "🍊" }, { w: "Strawberry", ar: "فراولة", emoji: "🍓" },
      { w: "Watermelon", ar: "بطّيخ", emoji: "🍉" }, { w: "Lemon", ar: "ليمون", emoji: "🍋" }, { w: "Cherry", ar: "كرز", emoji: "🍒" } ] },
    { id: "clothes", ar: "ملابس", items: [
      { w: "Shirt", ar: "قميص", emoji: "👕" }, { w: "Trousers", ar: "بنطال", emoji: "👖" }, { w: "Shoes", ar: "حذاء", emoji: "👟" },
      { w: "Hat", ar: "قبّعة", emoji: "🧢" }, { w: "Dress", ar: "فستان", emoji: "👗" }, { w: "Socks", ar: "جوارب", emoji: "🧦" } ] },
    { id: "weather", ar: "الطقس", items: [
      { w: "Rain", ar: "مطر", emoji: "🌧️" }, { w: "Cloud", ar: "سحابة", emoji: "☁️" }, { w: "Snow", ar: "ثلج", emoji: "❄️" },
      { w: "Wind", ar: "رياح", emoji: "🌬️" }, { w: "Rainbow", ar: "قوس قزح", emoji: "🌈" }, { w: "Storm", ar: "عاصفة", emoji: "⛈️" } ] },
    { id: "shapes", ar: "أشكال", items: [
      { w: "Circle", ar: "دائرة", emoji: "⭕" }, { w: "Square", ar: "مربّع", emoji: "🟦" }, { w: "Triangle", ar: "مثلّث", emoji: "🔺" },
      { w: "Heart", ar: "قلب", emoji: "❤️" }, { w: "Diamond", ar: "معيّن", emoji: "🔷" }, { w: "Rectangle", ar: "مستطيل", emoji: "🟧" } ] },
    { id: "days", ar: "أيّام الأسبوع", items: [
      { w: "Saturday", ar: "السبت", emoji: "📅" }, { w: "Sunday", ar: "الأحد", emoji: "📅" }, { w: "Monday", ar: "الاثنين", emoji: "📅" },
      { w: "Tuesday", ar: "الثلاثاء", emoji: "📅" }, { w: "Wednesday", ar: "الأربعاء", emoji: "📅" }, { w: "Thursday", ar: "الخميس", emoji: "📅" }, { w: "Friday", ar: "الجمعة", emoji: "📅" } ] },
    { id: "actions", ar: "أفعال", items: [
      { w: "Eat", ar: "يأكل", emoji: "🍽️" }, { w: "Drink", ar: "يشرب", emoji: "🥤" }, { w: "Run", ar: "يجري", emoji: "🏃" },
      { w: "Sleep", ar: "ينام", emoji: "😴" }, { w: "Read", ar: "يقرأ", emoji: "📖" }, { w: "Write", ar: "يكتب", emoji: "✍️" }, { w: "Play", ar: "يلعب", emoji: "🎮" } ] },
  ],

  // القصص المصوّرة (نفسُ رسوم العربيّة ومعرّفاتها — content/stories.js — مترجمةً).
  stories: [
    { id: "ant-perseverance", cover: "ant-1", title: "The Ant That Never Gave Up", pages: [
      { art: "ant-1", text: "The little ant found a big crumb, much bigger than herself! She said excitedly: «I will take it home.»" },
      { art: "ant-2", text: "She carried it up the hill… but she slipped, and the crumb rolled down! The ant took a breath and said: «I will try again.»" },
      { art: "ant-3", text: "She tried once, twice, three times… until she reached her home! Her family welcomed her with joy and cheers." } ],
      lesson: "Whoever tries and perseveres, arrives. 🐜" },
    { id: "seed-dream", cover: "seed-3", title: "A Seed That Dreamed of Becoming a Tree", pages: [
      { art: "seed-1", text: "Under the soil, a tiny seed was dreaming: «I wish to become a big tree that touches the sky!»" },
      { art: "seed-2", text: "The rain fell and watered it, the sun shone and warmed it… and the seed waited patiently, day after day." },
      { art: "seed-3", text: "And in spring, it became a lush green tree, and birds nested in its branches and sang!" } ],
      lesson: "Patience works wonders. 🌳" },
    { id: "lamp-courage", cover: "lamp-3", title: "The Lamp That Was Afraid of the Dark", pages: [
      { art: "lamp-1", text: "A little lamp was afraid of the dark, and thought its light was too weak to help anyone." },
      { art: "lamp-2", text: "One night, a child's toy was lost in the dark and he cried… so the lamp glowed a little, and the toy appeared!" },
      { art: "lamp-3", text: "The lamp was happy and shone with all its might! It learned that its small light makes those around it happy." } ],
      lesson: "Your small light may light someone else's path. ✨" },
    { id: "fish-honesty", cover: "fish-3", title: "The Honest Little Fish", pages: [
      { art: "fish-1", text: "The little fish was swimming near her friend's seashells, which were neatly arranged." },
      { art: "fish-2", text: "Suddenly, she moved her tail and all the shells scattered! She was scared and thought of running away… but she stopped." },
      { art: "fish-3", text: "She came back and told her friend the truth, and they arranged the shells together. The friend smiled and said: «Thank you for your honesty!»" } ],
      lesson: "The honest one has a peaceful heart and is loved by people. 🐠" },
    { id: "bee-cooperation", cover: "bee-3", title: "The Cooperative Bees", pages: [
      { art: "bee-1", text: "The little bee wanted to build a hive all alone, so she got tired and did only a little." },
      { art: "bee-2", text: "Her friends came, each carried a piece, and they worked together with energy and joy." },
      { art: "bee-3", text: "In moments, a beautiful hive was complete! The bees were happy with what they made together." } ],
      lesson: "Together we make what we cannot do alone. 🐝" },
    { id: "explore-curiosity", cover: "explore-2", title: "The Little Explorer", pages: [
      { art: "explore-1", text: "The curious child carried his magnifying glass, searching the garden for little secrets." },
      { art: "explore-2", text: "Suddenly, he saw a butterfly with amazing colors! He wondered: how did it become so beautiful?" },
      { art: "explore-3", text: "He drew what he saw and told his family. The more he asked and searched, the more he learned." } ],
      lesson: "Curiosity opens the doors of knowledge. 🔍" },
    { id: "bird-mercy", cover: "mercy-3", title: "The Hungry Bird", pages: [
      { art: "mercy-1", text: "On a cold rainy day, a little hungry bird stood shivering from the cold." },
      { art: "mercy-2", text: "The child saw him, brought him some seeds and water, and placed them near him gently." },
      { art: "mercy-3", text: "The bird ate and got warm, then sang in thanks! And the child smiled at his joy." } ],
      lesson: "Mercy to animals is a beautiful trait. 🐦" },
    { id: "clean-habit", cover: "clean-3", title: "The Clean Hero", pages: [
      { art: "clean-1", text: "The child's room was a mess, and his hands were dirty… and he was not comfortable." },
      { art: "clean-2", text: "So he washed his hands with water and soap, and tidied his toys one by one." },
      { art: "clean-3", text: "The room became clean and shiny, and he felt comfort and pride!" } ],
      lesson: "Cleanliness makes us happy and protects us. 🫧" },
  ],
};
