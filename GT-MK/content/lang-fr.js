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
  // name = نطقُ اسمِ الحرف بالفرنسيّة صوتيّاً (يقرؤه Piper ككلمةٍ سليمة).
  letters: [
    { ch: "A", name: "a",         word: "Avion",   emoji: "✈️" },
    { ch: "B", name: "bé",        word: "Ballon",  emoji: "🎈" },
    { ch: "C", name: "cé",        word: "Chat",    emoji: "🐱" },
    { ch: "D", name: "dé",        word: "Dé",      emoji: "🎲" },
    { ch: "E", name: "euh",       word: "Étoile",  emoji: "⭐" },
    { ch: "F", name: "effe",      word: "Fleur",   emoji: "🌸" },
    { ch: "G", name: "gé",        word: "Gâteau",  emoji: "🍰" },
    { ch: "H", name: "ache",      word: "Hibou",   emoji: "🦉" },
    { ch: "I", name: "i",         word: "Île",     emoji: "🏝️" },
    { ch: "J", name: "ji",        word: "Jardin",  emoji: "🌷" },
    { ch: "K", name: "ka",        word: "Koala",   emoji: "🐨" },
    { ch: "L", name: "elle",      word: "Lune",    emoji: "🌙" },
    { ch: "M", name: "emme",      word: "Maison",  emoji: "🏠" },
    { ch: "N", name: "enne",      word: "Nuage",   emoji: "☁️" },
    { ch: "O", name: "o",         word: "Oiseau",  emoji: "🐦" },
    { ch: "P", name: "pé",        word: "Pomme",   emoji: "🍎" },
    { ch: "Q", name: "ku",        word: "Quille",  emoji: "🎳" },
    { ch: "R", name: "erre",      word: "Renard",  emoji: "🦊" },
    { ch: "S", name: "esse",      word: "Soleil",  emoji: "☀️" },
    { ch: "T", name: "té",        word: "Tortue",  emoji: "🐢" },
    { ch: "U", name: "u",         word: "Univers", emoji: "🌌" },
    { ch: "V", name: "vé",        word: "Vache",   emoji: "🐄" },
    { ch: "W", name: "double vé", word: "Wagon",   emoji: "🚃" },
    { ch: "X", name: "ixe",       word: "Xylophone", emoji: "🎶" },
    { ch: "Y", name: "i grec",    word: "Yaourt",  emoji: "🥛" },
    { ch: "Z", name: "zède",      word: "Zèbre",   emoji: "🦓" },
  ],

  numbers: [
    { n: 0, word: "Zéro" }, { n: 1, word: "Un" }, { n: 2, word: "Deux" }, { n: 3, word: "Trois" },
    { n: 4, word: "Quatre" }, { n: 5, word: "Cinq" }, { n: 6, word: "Six" }, { n: 7, word: "Sept" },
    { n: 8, word: "Huit" }, { n: 9, word: "Neuf" }, { n: 10, word: "Dix" }, { n: 11, word: "Onze" },
    { n: 12, word: "Douze" }, { n: 13, word: "Treize" }, { n: 14, word: "Quatorze" }, { n: 15, word: "Quinze" },
    { n: 16, word: "Seize" }, { n: 17, word: "Dix-sept" }, { n: 18, word: "Dix-huit" }, { n: 19, word: "Dix-neuf" },
    { n: 20, word: "Vingt" }, { n: 30, word: "Trente" }, { n: 40, word: "Quarante" }, { n: 50, word: "Cinquante" },
    { n: 60, word: "Soixante" }, { n: 70, word: "Soixante-dix" }, { n: 80, word: "Quatre-vingts" }, { n: 90, word: "Quatre-vingt-dix" }, { n: 100, word: "Cent" },
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
    { id: "greetings", ar: "تحايا", items: [
      { w: "Bonjour", ar: "مرحبًا", emoji: "👋" }, { w: "Au revoir", ar: "وداعًا", emoji: "🙋" }, { w: "S'il vous plaît", ar: "من فضلك", emoji: "🙏" },
      { w: "Merci", ar: "شكرًا", emoji: "🤲" }, { w: "Oui", ar: "نعم", emoji: "✅" }, { w: "Non", ar: "لا", emoji: "❌" } ] },
    { id: "school", ar: "المدرسة", items: [
      { w: "Livre", ar: "كتاب", emoji: "📖" }, { w: "Stylo", ar: "قلم", emoji: "🖊️" }, { w: "Sac", ar: "حقيبة", emoji: "🎒" },
      { w: "Chaise", ar: "كرسيّ", emoji: "🪑" }, { w: "École", ar: "مدرسة", emoji: "🏫" }, { w: "Maître", ar: "معلّم", emoji: "🧑‍🏫" } ] },
    { id: "nature", ar: "الطبيعة", items: [
      { w: "Soleil", ar: "شمس", emoji: "☀️" }, { w: "Lune", ar: "قمر", emoji: "🌙" }, { w: "Étoile", ar: "نجمة", emoji: "⭐" },
      { w: "Arbre", ar: "شجرة", emoji: "🌳" }, { w: "Fleur", ar: "زهرة", emoji: "🌸" }, { w: "Mer", ar: "بحر", emoji: "🌊" } ] },
    { id: "transport", ar: "المواصلات", items: [
      { w: "Voiture", ar: "سيّارة", emoji: "🚗" }, { w: "Bus", ar: "حافلة", emoji: "🚌" }, { w: "Train", ar: "قطار", emoji: "🚂" },
      { w: "Avion", ar: "طائرة", emoji: "✈️" }, { w: "Bateau", ar: "قارب", emoji: "⛵" }, { w: "Vélo", ar: "درّاجة", emoji: "🚲" } ] },
    { id: "fruits", ar: "فواكه", items: [
      { w: "Raisin", ar: "عنب", emoji: "🍇" }, { w: "Orange", ar: "برتقال", emoji: "🍊" }, { w: "Fraise", ar: "فراولة", emoji: "🍓" },
      { w: "Pastèque", ar: "بطّيخ", emoji: "🍉" }, { w: "Citron", ar: "ليمون", emoji: "🍋" }, { w: "Cerise", ar: "كرز", emoji: "🍒" } ] },
    { id: "clothes", ar: "ملابس", items: [
      { w: "Chemise", ar: "قميص", emoji: "👕" }, { w: "Pantalon", ar: "بنطال", emoji: "👖" }, { w: "Chaussures", ar: "حذاء", emoji: "👟" },
      { w: "Chapeau", ar: "قبّعة", emoji: "🧢" }, { w: "Robe", ar: "فستان", emoji: "👗" }, { w: "Chaussettes", ar: "جوارب", emoji: "🧦" } ] },
    { id: "weather", ar: "الطقس", items: [
      { w: "Pluie", ar: "مطر", emoji: "🌧️" }, { w: "Nuage", ar: "سحابة", emoji: "☁️" }, { w: "Neige", ar: "ثلج", emoji: "❄️" },
      { w: "Vent", ar: "رياح", emoji: "🌬️" }, { w: "Arc-en-ciel", ar: "قوس قزح", emoji: "🌈" }, { w: "Orage", ar: "عاصفة", emoji: "⛈️" } ] },
    { id: "shapes", ar: "أشكال", items: [
      { w: "Cercle", ar: "دائرة", emoji: "⭕" }, { w: "Carré", ar: "مربّع", emoji: "🟦" }, { w: "Triangle", ar: "مثلّث", emoji: "🔺" },
      { w: "Cœur", ar: "قلب", emoji: "❤️" }, { w: "Losange", ar: "معيّن", emoji: "🔷" }, { w: "Rectangle", ar: "مستطيل", emoji: "🟧" } ] },
    { id: "days", ar: "أيّام الأسبوع", items: [
      { w: "Samedi", ar: "السبت", emoji: "📅" }, { w: "Dimanche", ar: "الأحد", emoji: "📅" }, { w: "Lundi", ar: "الاثنين", emoji: "📅" },
      { w: "Mardi", ar: "الثلاثاء", emoji: "📅" }, { w: "Mercredi", ar: "الأربعاء", emoji: "📅" }, { w: "Jeudi", ar: "الخميس", emoji: "📅" }, { w: "Vendredi", ar: "الجمعة", emoji: "📅" } ] },
    { id: "actions", ar: "أفعال", items: [
      { w: "Manger", ar: "يأكل", emoji: "🍽️" }, { w: "Boire", ar: "يشرب", emoji: "🥤" }, { w: "Courir", ar: "يجري", emoji: "🏃" },
      { w: "Dormir", ar: "ينام", emoji: "😴" }, { w: "Lire", ar: "يقرأ", emoji: "📖" }, { w: "Écrire", ar: "يكتب", emoji: "✍️" }, { w: "Jouer", ar: "يلعب", emoji: "🎮" } ] },
    { id: "jobs", ar: "مهن", items: [
      { w: "Médecin", ar: "طبيب", emoji: "🧑‍⚕️" }, { w: "Enseignant", ar: "معلّم", emoji: "👨‍🏫" }, { w: "Agriculteur", ar: "مزارع", emoji: "🧑‍🌾" },
      { w: "Cuisinier", ar: "طبّاخ", emoji: "👨‍🍳" }, { w: "Pilote", ar: "طيّار", emoji: "🧑‍✈️" }, { w: "Policier", ar: "شرطيّ", emoji: "👮" } ] },
    { id: "sports", ar: "رياضة", items: [
      { w: "Football", ar: "كرة القدم", emoji: "⚽" }, { w: "Natation", ar: "سباحة", emoji: "🏊" }, { w: "Course", ar: "جري", emoji: "🏃" },
      { w: "Vélo", ar: "ركوب الدرّاجة", emoji: "🚴" }, { w: "Basket", ar: "كرة السلّة", emoji: "🏀" }, { w: "Tennis", ar: "تنس", emoji: "🎾" } ] },
    { id: "house", ar: "أدوات البيت", items: [
      { w: "Table", ar: "طاولة", emoji: "🪑" }, { w: "Porte", ar: "باب", emoji: "🚪" }, { w: "Fenêtre", ar: "نافذة", emoji: "🪟" },
      { w: "Lit", ar: "سرير", emoji: "🛏️" }, { w: "Lampe", ar: "مصباح", emoji: "💡" }, { w: "Clé", ar: "مفتاح", emoji: "🔑" } ] },
  ],

  // الأفعالُ والأزمنة: الماضي (passé composé)/المضارع/المستقبل لصيغة المتكلّم + ترجمةٌ عربيّة.
  verbs: [
    { v: "manger",  ar: "يأكل", emoji: "🍽️", past:{w:"J'ai mangé",   ar:"أكلتُ"},  present:{w:"Je mange",   ar:"آكُلُ"},  future:{w:"Je mangerai",  ar:"سآكُلُ"} },
    { v: "boire",   ar: "يشرب", emoji: "🥤", past:{w:"J'ai bu",      ar:"شربتُ"},  present:{w:"Je bois",    ar:"أشربُ"},  future:{w:"Je boirai",    ar:"سأشربُ"} },
    { v: "jouer",   ar: "يلعب", emoji: "⚽", past:{w:"J'ai joué",    ar:"لعبتُ"},  present:{w:"Je joue",    ar:"ألعبُ"},  future:{w:"Je jouerai",   ar:"سألعبُ"} },
    { v: "lire",    ar: "يقرأ", emoji: "📖", past:{w:"J'ai lu",      ar:"قرأتُ"},  present:{w:"Je lis",     ar:"أقرأُ"},  future:{w:"Je lirai",     ar:"سأقرأُ"} },
    { v: "écrire",  ar: "يكتب", emoji: "✍️", past:{w:"J'ai écrit",   ar:"كتبتُ"},  present:{w:"J'écris",    ar:"أكتبُ"},  future:{w:"J'écrirai",    ar:"سأكتبُ"} },
    { v: "aller",   ar: "يذهب", emoji: "🚶", past:{w:"Je suis allé", ar:"ذهبتُ"},  present:{w:"Je vais",    ar:"أذهبُ"},  future:{w:"J'irai",       ar:"سأذهبُ"} },
    { v: "dormir",  ar: "ينام", emoji: "😴", past:{w:"J'ai dormi",   ar:"نمتُ"},   present:{w:"Je dors",    ar:"أنامُ"},  future:{w:"Je dormirai",  ar:"سأنامُ"} },
    { v: "voir",    ar: "يرى",  emoji: "👁️", past:{w:"J'ai vu",      ar:"رأيتُ"},  present:{w:"Je vois",    ar:"أرى"},    future:{w:"Je verrai",    ar:"سأرى"} },
  ],

  // القصص المصوّرة (نفسُ رسوم العربيّة ومعرّفاتها — مترجمةً للفرنسيّة).
  stories: [
    { id: "numerals-journey", cover: "numerals-2", title: "Le Voyage des Chiffres", pages: [
      { art: "numerals-1", text: "Autrefois, les gens comptaient avec des cailloux et des marques sur la pierre. Mais les grands nombres étaient très difficiles à écrire !" },
      { art: "numerals-2", text: "Puis de savants musulmans ont créé une façon facile d'écrire tout nombre avec seulement dix signes : 0 1 2 3 4 5 6 7 8 9." },
      { art: "numerals-3", text: "Leur plus grande idée fut le ZÉRO (sifr) — un cercle qui signifie «rien», et pourtant il donne sa place à chaque nombre !" },
      { art: "numerals-4", text: "Ces chiffres ont voyagé dans le monde entier. C'est pourquoi on les appelle encore «chiffres arabes» aujourd'hui." } ],
      lesson: "Les chiffres que tu écris aujourd'hui sont un cadeau des savants arabes et musulmans. 🔢" },
    { id: "ant-perseverance", cover: "ant-1", title: "La fourmi qui n'a jamais abandonné", pages: [
      { art: "ant-1", text: "La petite fourmi a trouvé une grande miette, bien plus grande qu'elle ! Elle a dit avec enthousiasme : «Je vais l'emporter chez moi.»" },
      { art: "ant-2", text: "Elle l'a portée en haut de la colline… mais elle a glissé, et la miette a roulé en bas ! La fourmi a respiré et a dit : «Je vais réessayer.»" },
      { art: "ant-3", text: "Elle a essayé une fois, deux fois, trois fois… jusqu'à arriver chez elle ! Sa famille l'a accueillie avec joie." } ],
      lesson: "Celui qui essaie et persévère, arrive. 🐜" },
    { id: "seed-dream", cover: "seed-3", title: "Une graine qui rêvait de devenir un arbre", pages: [
      { art: "seed-1", text: "Sous la terre, une petite graine rêvait : «Je voudrais devenir un grand arbre qui touche le ciel !»" },
      { art: "seed-2", text: "La pluie est tombée et l'a arrosée, le soleil a brillé et l'a réchauffée… et la graine a attendu patiemment, jour après jour." },
      { art: "seed-3", text: "Et au printemps, elle est devenue un arbre vert et touffu, et les oiseaux ont niché dans ses branches et ont chanté !" } ],
      lesson: "La patience fait des merveilles. 🌳" },
    { id: "lamp-courage", cover: "lamp-3", title: "La lampe qui avait peur du noir", pages: [
      { art: "lamp-1", text: "Une petite lampe avait peur du noir, et pensait que sa lumière était trop faible pour aider quelqu'un." },
      { art: "lamp-2", text: "Une nuit, le jouet d'un enfant s'est perdu dans le noir et il a pleuré… alors la lampe a brillé un peu, et le jouet est apparu !" },
      { art: "lamp-3", text: "La lampe était heureuse et a brillé de toutes ses forces ! Elle a compris que sa petite lumière rend heureux ceux qui l'entourent." } ],
      lesson: "Ta petite lumière peut éclairer le chemin d'un autre. ✨" },
    { id: "fish-honesty", cover: "fish-3", title: "Le petit poisson honnête", pages: [
      { art: "fish-1", text: "Le petit poisson nageait près des coquillages de son ami, bien rangés." },
      { art: "fish-2", text: "Soudain, il a remué sa queue et tous les coquillages se sont éparpillés ! Il a eu peur et a pensé s'enfuir… mais il s'est arrêté." },
      { art: "fish-3", text: "Il est revenu et a dit la vérité à son ami, et ils ont rangé les coquillages ensemble. L'ami a souri et a dit : «Merci pour ton honnêteté !»" } ],
      lesson: "L'honnête a le cœur tranquille et est aimé des gens. 🐠" },
    { id: "bee-cooperation", cover: "bee-3", title: "Les abeilles coopératives", pages: [
      { art: "bee-1", text: "La petite abeille voulait construire une ruche toute seule, alors elle s'est fatiguée et n'a fait que peu." },
      { art: "bee-2", text: "Ses amies sont venues, chacune a porté un morceau, et elles ont travaillé ensemble avec énergie et joie." },
      { art: "bee-3", text: "En quelques instants, une belle ruche était terminée ! Les abeilles étaient heureuses de ce qu'elles avaient fait ensemble." } ],
      lesson: "Ensemble, nous faisons ce que nous ne pouvons pas faire seuls. 🐝" },
    { id: "explore-curiosity", cover: "explore-2", title: "Le petit explorateur", pages: [
      { art: "explore-1", text: "L'enfant curieux portait sa loupe, cherchant dans le jardin de petits secrets." },
      { art: "explore-2", text: "Soudain, il a vu un papillon aux couleurs étonnantes ! Il s'est demandé : comment est-il devenu si beau ?" },
      { art: "explore-3", text: "Il a dessiné ce qu'il a vu et l'a raconté à sa famille. Plus il posait des questions et cherchait, plus il apprenait." } ],
      lesson: "La curiosité ouvre les portes du savoir. 🔍" },
    { id: "bird-mercy", cover: "mercy-3", title: "L'oiseau affamé", pages: [
      { art: "mercy-1", text: "Par un jour froid et pluvieux, un petit oiseau affamé se tenait, tremblant de froid." },
      { art: "mercy-2", text: "L'enfant l'a vu, lui a apporté des graines et de l'eau, et les a posées près de lui avec douceur." },
      { art: "mercy-3", text: "L'oiseau a mangé et s'est réchauffé, puis a chanté pour remercier ! Et l'enfant a souri de sa joie." } ],
      lesson: "La miséricorde envers les animaux est une belle qualité. 🐦" },
    { id: "clean-habit", cover: "clean-3", title: "Le héros propre", pages: [
      { art: "clean-1", text: "La chambre de l'enfant était en désordre, et ses mains étaient sales… et il n'était pas à l'aise." },
      { art: "clean-2", text: "Alors il s'est lavé les mains avec de l'eau et du savon, et a rangé ses jouets un par un." },
      { art: "clean-3", text: "La chambre est devenue propre et brillante, et il a ressenti du confort et de la fierté !" } ],
      lesson: "La propreté nous rend heureux et nous protège. 🫧" },
  ],

  // عباراتٌ وجملٌ مركّبة (بطاقةٌ خاصّة): t = العبارة، ar = معناها بالعربيّة.
  phrases: [
    { id: "hello", ar: "تحايا", items: [
      { t: "Bonjour !",              ar: "مرحباً! / صباح الخير." },
      { t: "Bonsoir.",               ar: "مساء الخير." },
      { t: "Comment ça va ?",        ar: "كيف حالك؟" },
      { t: "Ça va bien, merci.",     ar: "أنا بخير، شكراً." },
      { t: "Au revoir !",            ar: "إلى اللقاء!" },
      { t: "À demain.",              ar: "أراك غداً." },
      { t: "Bienvenue !",            ar: "أهلاً وسهلاً!" },
      { t: "Salut !",                ar: "أهلاً! (تحيّةٌ ودّيّة)" },
    ] },
    { id: "polite", ar: "التأدّب", items: [
      { t: "S'il te plaît.",         ar: "من فضلك." },
      { t: "Merci beaucoup.",        ar: "شكراً جزيلاً." },
      { t: "De rien.",               ar: "على الرحب والسعة." },
      { t: "Je suis désolé.",        ar: "أنا آسف." },
      { t: "Excuse-moi.",            ar: "اعذرني." },
      { t: "Est-ce que je peux entrer ?", ar: "هل أدخل؟" },
      { t: "Après toi.",             ar: "تفضّلْ أنت أوّلاً." },
    ] },
    { id: "useful", ar: "جملٌ مفيدة", items: [
      { t: "Je m'appelle Adam.",     ar: "اسمي آدم." },
      { t: "Je suis content.",       ar: "أنا سعيد." },
      { t: "J'aime ma famille.",     ar: "أحبّ عائلتي." },
      { t: "C'est mon livre.",       ar: "هذا كتابي." },
      { t: "Il fait beau aujourd'hui.", ar: "الطقس جميل اليوم." },
      { t: "J'ai faim.",             ar: "أنا جائع." },
      { t: "J'ai soif.",             ar: "أنا عطشان." },
      { t: "Jouons ensemble.",       ar: "هيّا نلعب معاً." },
    ] },
    { id: "questions", ar: "أسئلة", items: [
      { t: "Comment tu t'appelles ?", ar: "ما اسمك؟" },
      { t: "Quel âge as-tu ?",       ar: "كم عمرك؟" },
      { t: "Où habites-tu ?",        ar: "أين تسكن؟" },
      { t: "Qu'est-ce que c'est ?",  ar: "ما هذا؟" },
      { t: "Quelle heure est-il ?",  ar: "كم الساعة؟" },
      { t: "Peux-tu m'aider ?",      ar: "هل يمكنك مساعدتي؟" },
      { t: "Où est la porte ?",      ar: "أين الباب؟" },
    ] },
    { id: "class", ar: "في الصفّ", items: [
      { t: "Ouvre ton livre.",       ar: "افتحْ كتابك." },
      { t: "Écoute bien.",           ar: "أصغِ جيّداً." },
      { t: "Lève la main.",          ar: "ارفعْ يدك." },
      { t: "Répète après moi.",      ar: "كرّرْ بعدي." },
      { t: "Très bien !",            ar: "أحسنتَ!" },
      { t: "Assieds-toi, s'il te plaît.", ar: "اجلسْ من فضلك." },
      { t: "J'ai une question.",     ar: "عندي سؤال." },
    ] },
    { id: "sentences", ar: "جُمَلٌ مفيدة", items: [
      { t: "Je m'appelle Adam.",             ar: "اسمي آدم." },
      { t: "J'aime beaucoup les pommes.",    ar: "أُحبُّ التفّاحَ كثيراً." },
      { t: "Où est l'école, s'il te plaît ?", ar: "أين المدرسة، من فضلك؟" },
      { t: "Je suis très content aujourd'hui.", ar: "أنا سعيدٌ جدّاً اليوم." },
      { t: "Peux-tu m'aider, s'il te plaît ?", ar: "هل يمكنك مساعدتي، من فضلك؟" },
      { t: "Merci beaucoup, mon ami.",       ar: "شكراً جزيلاً يا صديقي." },
    ] },
  ],

  // ردودُ أفعالِ الآلي: كلُّ عبارةٍ فرنسيّة مقرونةٌ بترجمتها العربيّة المقابلة (تُنطَقان معاً — تعزيزٌ ثنائيّ).
  reactions: [
    { t: "Bravo !",       ar: "أَحْسَنْتَ يَا بَطَل!" },
    { t: "Très bien !",   ar: "هَذَا جَيِّدٌ جِدًّا!" },
    { t: "Excellent !",   ar: "هَذَا عَمَلٌ مُمْتَاز!" },
    { t: "Parfait !",     ar: "أَحْسَنْتَ، هَذَا تَمَام!" },
    { t: "Super !",       ar: "شَيْءٌ رَائِعٌ حَقًّا!" },
    { t: "Magnifique !",  ar: "هَذَا رَائِعٌ جِدًّا!" },
    { t: "Génial !",      ar: "أَنْتَ عَبْقَرِيٌّ صَغِير!" },
    { t: "Formidable !",  ar: "هَذَا مُدْهِشٌ جِدًّا!" },
    { t: "C'est ça !",    ar: "أَصَبْتَ تَمَامًا، أَحْسَنْت!" },
    { t: "Fantastique !", ar: "عَمَلٌ خَيَالِيٌّ رَائِع!" },
  ],
  // ردودُ التشجيع عند الخطأ (لطيفةٌ لا قسوةَ فيها) — كلٌّ بترجمته، جُملاً ليُتقنَها العصبيّ.
  encourage: [
    { t: "Essaie encore !",   ar: "حَاوِلْ مَرَّةً أُخْرَى!" },
    { t: "Presque !",         ar: "كِدْتَ تَنْجَح، حَاوِلْ ثَانِيَة!" },
    { t: "Continue !",        ar: "وَاصِلْ، أَنْتَ قَرِيب!" },
    { t: "N'abandonne pas !", ar: "لَا تَيْأَسْ، أَنْتَ تَسْتَطِيع!" },
    { t: "Tu peux le faire !",ar: "أَنْتَ تَسْتَطِيعُ ذَلِكَ بِإِذْنِ اللَّه!" },
    { t: "Bien essayé !",     ar: "مُحَاوَلَةٌ جَيِّدَةٌ جِدًّا!" },
  ],
};
