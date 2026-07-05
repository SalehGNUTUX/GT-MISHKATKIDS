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

  // الأبجديّة + كلمةٌ مثالٌ ورمزٌ معبّر لكلّ حرف. name = نطقُ اسمِ الحرف صوتيّاً (يقرؤه Piper ككلمةٍ سليمة).
  letters: [
    { ch: "A", name: "eigh",       word: "Apple",     emoji: "🍎" },
    { ch: "B", name: "bee",        word: "Ball",      emoji: "⚽" },
    { ch: "C", name: "see",        word: "Cat",       emoji: "🐱" },
    { ch: "D", name: "dee",        word: "Dog",       emoji: "🐶" },
    { ch: "E", name: "ee",         word: "Egg",       emoji: "🥚" },
    { ch: "F", name: "ef",         word: "Fish",      emoji: "🐟" },
    { ch: "G", name: "jee",        word: "Goat",      emoji: "🐐" },
    { ch: "H", name: "aitch",      word: "House",     emoji: "🏠" },
    { ch: "I", name: "eye",        word: "Ice cream", emoji: "🍦" },
    { ch: "J", name: "jay",        word: "Jug",       emoji: "🫙" },
    { ch: "K", name: "kay",        word: "Key",       emoji: "🔑" },
    { ch: "L", name: "el",         word: "Lion",      emoji: "🦁" },
    { ch: "M", name: "em",         word: "Moon",      emoji: "🌙" },
    { ch: "N", name: "en",         word: "Nest",      emoji: "🪺" },
    { ch: "O", name: "oh",         word: "Orange",    emoji: "🍊" },
    { ch: "P", name: "pee",        word: "Pen",       emoji: "🖊️" },
    { ch: "Q", name: "cue",        word: "Queen",     emoji: "👑" },
    { ch: "R", name: "ar",         word: "Rabbit",    emoji: "🐰" },
    { ch: "S", name: "ess",        word: "Sun",       emoji: "☀️" },
    { ch: "T", name: "tee",        word: "Tree",      emoji: "🌳" },
    { ch: "U", name: "you",        word: "Umbrella",  emoji: "☂️" },
    { ch: "V", name: "vee",        word: "Van",       emoji: "🚐" },
    { ch: "W", name: "double-you", word: "Water",     emoji: "💧" },
    { ch: "X", name: "ex",         word: "Box",       emoji: "📦" },
    { ch: "Y", name: "why",        word: "Yarn",      emoji: "🧶" },
    { ch: "Z", name: "zed",        word: "Zebra",     emoji: "🦓" },
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
    { id: "jobs", ar: "مهن", items: [
      { w: "Doctor", ar: "طبيب", emoji: "🧑‍⚕️" }, { w: "Teacher", ar: "معلّم", emoji: "👨‍🏫" }, { w: "Farmer", ar: "مزارع", emoji: "🧑‍🌾" },
      { w: "Cook", ar: "طبّاخ", emoji: "👨‍🍳" }, { w: "Pilot", ar: "طيّار", emoji: "🧑‍✈️" }, { w: "Police", ar: "شرطيّ", emoji: "👮" } ] },
    { id: "sports", ar: "رياضة", items: [
      { w: "Football", ar: "كرة القدم", emoji: "⚽" }, { w: "Swimming", ar: "سباحة", emoji: "🏊" }, { w: "Running", ar: "جري", emoji: "🏃" },
      { w: "Cycling", ar: "ركوب الدرّاجة", emoji: "🚴" }, { w: "Basketball", ar: "كرة السلّة", emoji: "🏀" }, { w: "Tennis", ar: "تنس", emoji: "🎾" } ] },
    { id: "house", ar: "أدوات البيت", items: [
      { w: "Table", ar: "طاولة", emoji: "🪑" }, { w: "Door", ar: "باب", emoji: "🚪" }, { w: "Window", ar: "نافذة", emoji: "🪟" },
      { w: "Bed", ar: "سرير", emoji: "🛏️" }, { w: "Lamp", ar: "مصباح", emoji: "💡" }, { w: "Key", ar: "مفتاح", emoji: "🔑" } ] },
  ],

  // الأفعالُ والأزمنة: لكلّ فعلٍ تصريفٌ في المضارع لكلّ الضمائر (conj) + الأزمنةُ الثلاثُ لصيغة المتكلّم (tenses).
  verbs: [
    { v:"eat", ar:"يأكل", emoji:"🍽️",
      conj:[{ar:"أنا",w:"I eat",arw:"آكُلُ"},{ar:"أنتَ",w:"You eat",arw:"تأكُلُ"},{ar:"هو",w:"He eats",arw:"يأكُلُ"},{ar:"هي",w:"She eats",arw:"تأكُلُ"},{ar:"نحن",w:"We eat",arw:"نأكُلُ"},{ar:"هم",w:"They eat",arw:"يأكُلون"}],
      tenses:{past:{w:"I ate",ar:"أكلتُ"},present:{w:"I eat",ar:"آكُلُ"},future:{w:"I will eat",ar:"سآكُلُ"}} },
    { v:"drink", ar:"يشرب", emoji:"🥤",
      conj:[{ar:"أنا",w:"I drink",arw:"أشربُ"},{ar:"أنتَ",w:"You drink",arw:"تشربُ"},{ar:"هو",w:"He drinks",arw:"يشربُ"},{ar:"هي",w:"She drinks",arw:"تشربُ"},{ar:"نحن",w:"We drink",arw:"نشربُ"},{ar:"هم",w:"They drink",arw:"يشربون"}],
      tenses:{past:{w:"I drank",ar:"شربتُ"},present:{w:"I drink",ar:"أشربُ"},future:{w:"I will drink",ar:"سأشربُ"}} },
    { v:"play", ar:"يلعب", emoji:"⚽",
      conj:[{ar:"أنا",w:"I play",arw:"ألعبُ"},{ar:"أنتَ",w:"You play",arw:"تلعبُ"},{ar:"هو",w:"He plays",arw:"يلعبُ"},{ar:"هي",w:"She plays",arw:"تلعبُ"},{ar:"نحن",w:"We play",arw:"نلعبُ"},{ar:"هم",w:"They play",arw:"يلعبون"}],
      tenses:{past:{w:"I played",ar:"لعبتُ"},present:{w:"I play",ar:"ألعبُ"},future:{w:"I will play",ar:"سألعبُ"}} },
    { v:"read", ar:"يقرأ", emoji:"📖",
      conj:[{ar:"أنا",w:"I read",arw:"أقرأُ"},{ar:"أنتَ",w:"You read",arw:"تقرأُ"},{ar:"هو",w:"He reads",arw:"يقرأُ"},{ar:"هي",w:"She reads",arw:"تقرأُ"},{ar:"نحن",w:"We read",arw:"نقرأُ"},{ar:"هم",w:"They read",arw:"يقرؤون"}],
      tenses:{past:{w:"I read",ar:"قرأتُ"},present:{w:"I read",ar:"أقرأُ"},future:{w:"I will read",ar:"سأقرأُ"}} },
    { v:"write", ar:"يكتب", emoji:"✍️",
      conj:[{ar:"أنا",w:"I write",arw:"أكتبُ"},{ar:"أنتَ",w:"You write",arw:"تكتبُ"},{ar:"هو",w:"He writes",arw:"يكتبُ"},{ar:"هي",w:"She writes",arw:"تكتبُ"},{ar:"نحن",w:"We write",arw:"نكتبُ"},{ar:"هم",w:"They write",arw:"يكتبون"}],
      tenses:{past:{w:"I wrote",ar:"كتبتُ"},present:{w:"I write",ar:"أكتبُ"},future:{w:"I will write",ar:"سأكتبُ"}} },
    { v:"go", ar:"يذهب", emoji:"🚶",
      conj:[{ar:"أنا",w:"I go",arw:"أذهبُ"},{ar:"أنتَ",w:"You go",arw:"تذهبُ"},{ar:"هو",w:"He goes",arw:"يذهبُ"},{ar:"هي",w:"She goes",arw:"تذهبُ"},{ar:"نحن",w:"We go",arw:"نذهبُ"},{ar:"هم",w:"They go",arw:"يذهبون"}],
      tenses:{past:{w:"I went",ar:"ذهبتُ"},present:{w:"I go",ar:"أذهبُ"},future:{w:"I will go",ar:"سأذهبُ"}} },
    { v:"sleep", ar:"ينام", emoji:"😴",
      conj:[{ar:"أنا",w:"I sleep",arw:"أنامُ"},{ar:"أنتَ",w:"You sleep",arw:"تنامُ"},{ar:"هو",w:"He sleeps",arw:"ينامُ"},{ar:"هي",w:"She sleeps",arw:"تنامُ"},{ar:"نحن",w:"We sleep",arw:"ننامُ"},{ar:"هم",w:"They sleep",arw:"ينامون"}],
      tenses:{past:{w:"I slept",ar:"نمتُ"},present:{w:"I sleep",ar:"أنامُ"},future:{w:"I will sleep",ar:"سأنامُ"}} },
    { v:"see", ar:"يرى", emoji:"👁️",
      conj:[{ar:"أنا",w:"I see",arw:"أرى"},{ar:"أنتَ",w:"You see",arw:"ترى"},{ar:"هو",w:"He sees",arw:"يرى"},{ar:"هي",w:"She sees",arw:"ترى"},{ar:"نحن",w:"We see",arw:"نرى"},{ar:"هم",w:"They see",arw:"يرَوْن"}],
      tenses:{past:{w:"I saw",ar:"رأيتُ"},present:{w:"I see",ar:"أرى"},future:{w:"I will see",ar:"سأرى"}} },
    { v:"run", ar:"يجري", emoji:"🏃",
      conj:[{ar:"أنا",w:"I run",arw:"أجري"},{ar:"أنتَ",w:"You run",arw:"تجري"},{ar:"هو",w:"He runs",arw:"يجري"},{ar:"هي",w:"She runs",arw:"تجري"},{ar:"نحن",w:"We run",arw:"نجري"},{ar:"هم",w:"They run",arw:"يجرون"}],
      tenses:{past:{w:"I ran",ar:"جريتُ"},present:{w:"I run",ar:"أجري"},future:{w:"I will run",ar:"سأجري"}} },
    { v:"want", ar:"يريد", emoji:"🙋",
      conj:[{ar:"أنا",w:"I want",arw:"أريدُ"},{ar:"أنتَ",w:"You want",arw:"تريدُ"},{ar:"هو",w:"He wants",arw:"يريدُ"},{ar:"هي",w:"She wants",arw:"تريدُ"},{ar:"نحن",w:"We want",arw:"نريدُ"},{ar:"هم",w:"They want",arw:"يريدون"}],
      tenses:{past:{w:"I wanted",ar:"أردتُ"},present:{w:"I want",ar:"أريدُ"},future:{w:"I will want",ar:"سأريدُ"}} },
  ],

  // القصص المصوّرة (نفسُ رسوم العربيّة ومعرّفاتها — content/stories.js — مترجمةً).
  stories: [
    { id: "numerals-journey", cover: "numerals-2", title: "The Journey of Numbers", pages: [
      { art: "numerals-1", caption: "Counting was so hard…", text: "Long ago, people counted with pebbles and marks on stone. But big numbers were very hard to write!" },
      { art: "numerals-2", caption: "Ten easy signs!", text: "Then clever Muslim scholars created an easy way to write any number with just ten signs: 0 1 2 3 4 5 6 7 8 9." },
      { art: "numerals-3", caption: "Zero — nothing, yet everything!", text: "Their greatest idea was the ZERO (sifr) — a circle that means «nothing», yet it gives every number its place!" },
      { art: "numerals-4", caption: "Numbers for the whole world!", text: "These numbers traveled across the whole world. That is why we still call them «Arabic numerals» today." } ],
      lesson: "The numbers you write today are a gift from Arab and Muslim scholars. 🔢" },
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

  // عباراتٌ وجملٌ مركّبة (بطاقةٌ خاصّة): t = العبارة، ar = معناها بالعربيّة.
  phrases: [
    { id: "asking", ar: "كيف أسأل؟", items: [
      { t: "How are you?",                ar: "كيف حالك؟" },
      { t: "What's wrong?",               ar: "ماذا بك؟" },
      { t: "Where are you going?",        ar: "إلى أين أنت ذاهب؟" },
      { t: "What do you eat?",            ar: "ماذا تأكل؟" },
      { t: "What are you doing?",         ar: "ماذا تفعل؟" },
      { t: "Do you want to play?",        ar: "هل تريد أن تلعب؟" },
      { t: "Why are you sad?",            ar: "لماذا أنت حزين؟" },
      { t: "Where is the bathroom?",      ar: "أين الحمّام؟" },
      { t: "How much is this?",           ar: "بكم هذا؟" },
      { t: "What is your favorite color?", ar: "ما لونك المفضّل؟" },
      { t: "Are you hungry?",             ar: "هل أنت جائع؟" },
      { t: "May I help you?",             ar: "هل أستطيع مساعدتك؟" },
    ] },
    { id: "hello", ar: "تحايا", items: [
      { t: "Hello!",                 ar: "مرحباً!" },
      { t: "Good morning.",          ar: "صباح الخير." },
      { t: "Good evening.",          ar: "مساء الخير." },
      { t: "How are you?",           ar: "كيف حالك؟" },
      { t: "I am fine, thank you.",  ar: "أنا بخير، شكراً." },
      { t: "Goodbye!",               ar: "إلى اللقاء!" },
      { t: "See you tomorrow.",      ar: "أراك غداً." },
      { t: "Welcome!",               ar: "أهلاً وسهلاً!" },
    ] },
    { id: "polite", ar: "التأدّب", items: [
      { t: "Please.",                ar: "من فضلك." },
      { t: "Thank you very much.",   ar: "شكراً جزيلاً." },
      { t: "You are welcome.",       ar: "على الرحب والسعة." },
      { t: "I am sorry.",            ar: "أنا آسف." },
      { t: "Excuse me.",             ar: "المعذرة." },
      { t: "May I come in?",         ar: "هل أدخل؟" },
      { t: "After you.",             ar: "تفضّلْ أنت أوّلاً." },
    ] },
    { id: "useful", ar: "جملٌ مفيدة", items: [
      { t: "My name is Adam.",       ar: "اسمي آدم." },
      { t: "I am happy.",            ar: "أنا سعيد." },
      { t: "I love my family.",      ar: "أحبّ عائلتي." },
      { t: "This is my book.",       ar: "هذا كتابي." },
      { t: "The weather is nice today.", ar: "الطقس جميل اليوم." },
      { t: "I am hungry.",           ar: "أنا جائع." },
      { t: "I am thirsty.",          ar: "أنا عطشان." },
      { t: "Let us play together.",  ar: "هيّا نلعب معاً." },
    ] },
    { id: "questions", ar: "أسئلة", items: [
      { t: "What is your name?",     ar: "ما اسمك؟" },
      { t: "How old are you?",       ar: "كم عمرك؟" },
      { t: "Where do you live?",     ar: "أين تسكن؟" },
      { t: "What is this?",          ar: "ما هذا؟" },
      { t: "What time is it?",       ar: "كم الساعة؟" },
      { t: "Can you help me?",       ar: "هل يمكنك مساعدتي؟" },
      { t: "Where is the door?",     ar: "أين الباب؟" },
    ] },
    { id: "class", ar: "في الصفّ", items: [
      { t: "Open your book.",        ar: "افتحْ كتابك." },
      { t: "Listen carefully.",      ar: "أصغِ جيّداً." },
      { t: "Raise your hand.",       ar: "ارفعْ يدك." },
      { t: "Repeat after me.",       ar: "كرّرْ بعدي." },
      { t: "Very good!",             ar: "أحسنتَ!" },
      { t: "Sit down, please.",      ar: "اجلسْ من فضلك." },
      { t: "I have a question.",     ar: "عندي سؤال." },
    ] },
    { id: "sentences", ar: "جُمَلٌ مفيدة", items: [
      { t: "My name is Adam.",           ar: "اسمي آدم." },
      { t: "I like apples very much.",   ar: "أُحبُّ التفّاحَ كثيراً." },
      { t: "Where is the school, please?", ar: "أين المدرسة، من فضلك؟" },
      { t: "I am very happy today.",     ar: "أنا سعيدٌ جدّاً اليوم." },
      { t: "Can you help me, please?",   ar: "هل يمكنك مساعدتي، من فضلك؟" },
      { t: "Thank you very much, my friend.", ar: "شكراً جزيلاً يا صديقي." },
    ] },
  ],

  // ردودُ أفعالِ الآلي: كلُّ عبارةٍ إنجليزيّة مقرونةٌ بترجمتها العربيّة المقابلة (تُنطَقان معاً — تعزيزٌ ثنائيّ).
  reactions: [
    { t: "Well done!",  ar: "أَحْسَنْتَ يَا بَطَل!" },
    { t: "Excellent!",  ar: "هَذَا عَمَلٌ مُمْتَاز!" },
    { t: "Great job!",  ar: "عَمَلٌ رَائِعٌ جِدًّا!" },
    { t: "Perfect!",    ar: "أَحْسَنْتَ، هَذَا تَمَام!" },
    { t: "Wonderful!",  ar: "شَيْءٌ رَائِعٌ حَقًّا!" },
    { t: "Bravo!",      ar: "أَحْسَنْتَ، بَارَكَ اللَّهُ فِيك!" },
    { t: "Amazing!",    ar: "هَذَا مُدْهِشٌ جِدًّا!" },
    { t: "Fantastic!",  ar: "عَمَلٌ خَيَالِيٌّ رَائِع!" },
    { t: "You got it!", ar: "أَصَبْتَ تَمَامًا، أَحْسَنْت!" },
    { t: "Brilliant!",  ar: "أَنْتَ عَبْقَرِيٌّ صَغِير!" },
  ],
  // ردودُ التشجيع عند الخطأ (لطيفةٌ لا قسوةَ فيها) — كلٌّ بترجمته، جُملاً ليُتقنَها العصبيّ.
  encourage: [
    { t: "Try again!",     ar: "حَاوِلْ مَرَّةً أُخْرَى!" },
    { t: "Almost there!",  ar: "كِدْتَ تَنْجَح، حَاوِلْ ثَانِيَة!" },
    { t: "Keep going!",    ar: "وَاصِلْ، أَنْتَ قَرِيب!" },
    { t: "Don't give up!", ar: "لَا تَيْأَسْ، أَنْتَ تَسْتَطِيع!" },
    { t: "You can do it!", ar: "أَنْتَ تَسْتَطِيعُ ذَلِكَ بِإِذْنِ اللَّه!" },
    { t: "Nice try!",      ar: "مُحَاوَلَةٌ جَيِّدَةٌ جِدًّا!" },
  ],

  // الجملُ الافتتاحيّةُ للألعاب التنافسيّة بالإنجليزيّة (يَنطِقُها الآليُّ بعد نظيرتها العربيّة). تُولَّدُ بـPiper (tts-alba).
  intros: {
    transrace: "Translation race! Listen to the word, then choose its meaning.",
    sortwords: "Sort the words! Listen to the word, then choose its category.",
    match:     "Picture match! Listen to the word, then choose the right picture.",
    matchar:   "Meaning match! Look at the meaning, then choose the right word.",
    spell:     "Spelling! Listen to the word, then put its letters in order.",
    listen:    "Listen and choose! Listen carefully, then pick the right picture.",
    alphaorder:"Alphabetical order! Put the letters in the right order before your opponent.",
  },

  // 🔊 الأصوات (Phonics): رسمُ الصوت s + كلمةٌ مثالٌ w تحويه + معناها ar + رمز e. باحترامِ قواعدِ الإنجليزيّة:
  // الحروفُ المزدوجة (digraphs) والفرقُ الصوتيّ (vowel teams) والأصواتُ المُتحكَّمُ فيها بالراء (r-controlled).
  sounds: [
    { s:"sh",  w:"ship",  ar:"سفينة",  e:"🚢" },
    { s:"ch",  w:"chair", ar:"كرسيّ",  e:"🪑" },
    { s:"th",  w:"thumb", ar:"إبهام",  e:"👍" },
    { s:"wh",  w:"whale", ar:"حوت",    e:"🐋" },
    { s:"ph",  w:"phone", ar:"هاتف",   e:"📱" },
    { s:"ck",  w:"duck",  ar:"بطّة",   e:"🦆" },
    { s:"ng",  w:"king",  ar:"ملك",    e:"👑" },
    { s:"ee",  w:"tree",  ar:"شجرة",   e:"🌳" },
    { s:"ea",  w:"leaf",  ar:"ورقة",   e:"🍃" },
    { s:"ai",  w:"rain",  ar:"مطر",    e:"🌧️" },
    { s:"ay",  w:"day",   ar:"نهار",   e:"🌅" },
    { s:"oa",  w:"boat",  ar:"قارب",   e:"⛵" },
    { s:"ow",  w:"snow",  ar:"ثلج",    e:"❄️" },
    { s:"oo",  w:"moon",  ar:"قمر",    e:"🌙" },
    { s:"oo",  w:"book",  ar:"كتاب",   e:"📖", say:"book" }, // oo قصيرة (تختلفُ عن moon)
    { s:"ou",  w:"cloud", ar:"سحابة",  e:"☁️" },
    { s:"oi",  w:"coin",  ar:"عملة",   e:"🪙" },
    { s:"oy",  w:"boy",   ar:"ولد",    e:"👦" },
    { s:"igh", w:"light", ar:"ضوء",    e:"💡" },
    { s:"ar",  w:"star",  ar:"نجمة",   e:"⭐" },
    { s:"or",  w:"fork",  ar:"شوكة",   e:"🍴" },
    { s:"ir",  w:"bird",  ar:"طائر",   e:"🐦" },
    { s:"ur",  w:"nurse", ar:"ممرّضة", e:"👩‍⚕️" },
    { s:"air", w:"hair",  ar:"شعر",    e:"💇" },
    { s:"aw",  w:"saw",   ar:"منشار",  e:"🪚" },
  ],

  // 🔡 العائلاتُ الصوتيّة (Word Families): مكافئُ «خرائط المقاطع» بقواعدِ الإنجليزيّة (onset + rime = كلمةٌ CVC).
  // كلُّ خريطةٍ = حركةٌ قصيرة، وكلُّ صفٍّ = نهايةٌ (rime) مع كلماتِها. تُنطَقُ كلُّ كلمةٍ عند الضغط (blending).
  syllabaries: [
    { id:"a", ar:"عائلةُ a", en:"a family", groups:[
      { lab:"-at", syl:["cat","bat","hat","mat","rat","sat","fat","pat"] },
      { lab:"-an", syl:["can","fan","man","pan","ran","van","tan"] },
      { lab:"-ap", syl:["cap","map","nap","tap","lap","gap"] },
      { lab:"-ad", syl:["bad","dad","had","mad","sad","pad"] },
      { lab:"-ag", syl:["bag","tag","rag","wag","nag"] } ] },
    { id:"e", ar:"عائلةُ e", en:"e family", groups:[
      { lab:"-ed", syl:["bed","fed","led","red","wed"] },
      { lab:"-en", syl:["den","hen","men","pen","ten"] },
      { lab:"-et", syl:["bet","get","jet","let","met","net","pet","wet"] },
      { lab:"-eg", syl:["beg","leg","peg"] } ] },
    { id:"i", ar:"عائلةُ i", en:"i family", groups:[
      { lab:"-it", syl:["bit","fit","hit","kit","pit","sit"] },
      { lab:"-in", syl:["bin","fin","pin","tin","win"] },
      { lab:"-ig", syl:["big","dig","fig","pig","wig"] },
      { lab:"-ip", syl:["dip","hip","lip","rip","tip","zip"] } ] },
    { id:"o", ar:"عائلةُ o", en:"o family", groups:[
      { lab:"-og", syl:["dog","fog","hog","jog","log"] },
      { lab:"-ot", syl:["cot","dot","got","hot","lot","not","pot"] },
      { lab:"-op", syl:["cop","hop","mop","pop","top"] },
      { lab:"-ox", syl:["box","fox"] } ] },
    { id:"u", ar:"عائلةُ u", en:"u family", groups:[
      { lab:"-ug", syl:["bug","dug","hug","jug","mug","rug","tug"] },
      { lab:"-un", syl:["bun","fun","gun","run","sun"] },
      { lab:"-ut", syl:["but","cut","gut","hut","nut"] },
      { lab:"-up", syl:["cup","pup"] } ] },
  ],
};
