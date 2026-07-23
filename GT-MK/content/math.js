// content/math.js — بيانات قسم الرياضيات والهندسة لـ math.html.
// محلّيّ بالكامل: لا شبكة، لا ذكاء اصطناعي. الرسومات SVG مُضمَّنة، والمقاسات بالسنتيمتر.
// الأمثلة الكونيّة تربط الأشكال بخلق الله (تدبّرٌ لا مجرّد تعليمٍ تجريديّ).

export default {
  // الأشكال الأربع الأساسية — تُعرَف باسمها وعدد أضلاعها وزواياها ومثيلاتٍ في الواقع.
  shapes_basic: [
    {
      id: "circle", name: "دائرة", sides: 0, corners: 0,
      svg: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="48" fill="#6FB3D6" stroke="#3a4250" stroke-width="3"/></svg>`,
      facts: ["لا أضلاعَ لها ولا زوايا", "كل نقطةٍ على حدّها على المسافة نفسها من المركز"],
      examples: ["☀️ الشمس", "🌕 القمر مكتملًا", "👁️ بؤبؤ العين", "🛞 العجلة", "🍩 الكعكة المستديرة"],
      tadabbur: "خَلَقَ اللهُ الشمسَ والقمرَ دائرتين، وكلَّ ما يدور ينتظمُ على دائرةٍ — سبحان الذي أتقن خلقَه.",
    },
    {
      id: "square", name: "مربّع", sides: 4, corners: 4,
      svg: `<svg viewBox="0 0 120 120"><rect x="20" y="20" width="80" height="80" fill="#F4C95D" stroke="#3a4250" stroke-width="3"/></svg>`,
      facts: ["أربعةُ أضلاعٍ متساوية", "أربعُ زوايا قائمة (90°)"],
      examples: ["🪟 النافذة المربّعة", "🟨 بلاطة الأرض", "🧊 مكعّبُ الثلج", "📦 بعضُ الصناديق"],
      tadabbur: "بناءُ الكعبة المشرَّفة شِبهُ مكعَّب، وكلُّ وجهٍ فيه مربَّعٌ تقريبًا.",
    },
    {
      id: "triangle", name: "مثلّث", sides: 3, corners: 3,
      svg: `<svg viewBox="0 0 120 120"><polygon points="60,15 105,100 15,100" fill="#7BB661" stroke="#3a4250" stroke-width="3"/></svg>`,
      facts: ["ثلاثةُ أضلاع", "ثلاثُ زوايا — مجموعها 180°"],
      examples: ["🍕 شريحة البتزا", "⛰️ قمّة الجبل", "🏠 سقف البيت", "🛑 إشارة المرور بعض الأحيان"],
      tadabbur: "قمم الجبال مثلّثات شامخة، وهي أوتادٌ تُثبِّتُ الأرض كما ذُكر في القرآن.",
    },
    {
      id: "rectangle", name: "مستطيل", sides: 4, corners: 4,
      svg: `<svg viewBox="0 0 120 120"><rect x="12" y="32" width="96" height="56" fill="#C9A0DC" stroke="#3a4250" stroke-width="3"/></svg>`,
      facts: ["أربعةُ أضلاع، كلُّ ضلعين متقابلين متساويان", "أربعُ زوايا قائمة"],
      examples: ["📖 الكتاب", "🚪 الباب", "📺 الشاشة", "📱 الجوّال", "🚌 جانبُ الحافلة"],
      tadabbur: "صفحات المصحف الشريف مستطيلات يُيسِّر شكلُها القراءةَ والحفظ.",
    },
  ],

  // أشكالٌ متقدّمة — ثنائية الأبعاد (2D) وثلاثية الأبعاد (3D)، مع SVG وأمثلةٍ كونية.
  shapes_advanced: [
    {
      id: "pentagon", name: "خماسي", sides: 5, corners: 5, dim: "2D",
      svg: `<svg viewBox="0 0 120 120"><polygon points="60,15 108,52 90,108 30,108 12,52" fill="#F4C95D" stroke="#3a4250" stroke-width="3"/></svg>`,
      facts: ["خمسةُ أضلاعٍ منتظمة", "مجموع زواياه 540°"],
      examples: ["⚽ بعضُ وجوه كرة القدم", "🏠 بعضُ بيوت الطيور"],
    },
    {
      id: "hexagon", name: "سداسي", sides: 6, corners: 6, dim: "2D",
      svg: `<svg viewBox="0 0 120 120"><polygon points="60,15 105,40 105,80 60,105 15,80 15,40" fill="#F4A03A" stroke="#3a4250" stroke-width="3"/></svg>`,
      facts: ["ستّةُ أضلاعٍ متساوية", "ينتظمُ في الطبيعة بإحكامٍ مذهل"],
      examples: ["🐝 خلايا النحل", "❄️ نُدفُ الثلج", "🐢 درعُ السلحفاة"],
      tadabbur: "خلايا النحل سداسيّةٌ تمامًا — هندسةٌ تَقتصدُ الشمعَ وتُكثّرُ العسل. {فِيهِ شِفَاءٌ لِلنَّاسِ}.",
    },
    {
      id: "octagon", name: "ثماني", sides: 8, corners: 8, dim: "2D",
      svg: `<svg viewBox="0 0 120 120"><polygon points="40,12 80,12 108,40 108,80 80,108 40,108 12,80 12,40" fill="#E0566B" stroke="#3a4250" stroke-width="3"/></svg>`,
      facts: ["ثمانيةُ أضلاع", "يُستعمل في إشارات «قِف»"],
      examples: ["🛑 إشارة قِف", "بعض البلاط"],
    },
    {
      id: "rhombus", name: "معيَّن", sides: 4, corners: 4, dim: "2D",
      svg: `<svg viewBox="0 0 120 120"><polygon points="60,12 108,60 60,108 12,60" fill="#7BB661" stroke="#3a4250" stroke-width="3"/></svg>`,
      facts: ["أربعةُ أضلاعٍ متساوية مائلة", "كالطيّارة الورقية"],
      examples: ["🪁 الطائرة الورقية", "بعض النقوش الإسلامية"],
    },
    {
      id: "trapezoid", name: "شبه منحرف", sides: 4, corners: 4, dim: "2D",
      svg: `<svg viewBox="0 0 120 120"><polygon points="20,30 100,30 90,90 30,90" fill="#6FB3D6" stroke="#3a4250" stroke-width="3"/></svg>`,
      facts: ["ضلعان متوازيان لا متساويان", "والآخرَان مائلان"],
      examples: ["جسمُ بعض الجبال", "إناءُ الزهور"],
    },
    {
      id: "cube", name: "مكعّب", dim: "3D",
      svg: `<svg viewBox="0 0 120 120">
        <polygon points="30,40 70,20 110,40 70,60" fill="#FCEBC9" stroke="#3a4250" stroke-width="2"/>
        <polygon points="30,40 30,90 70,110 70,60" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/>
        <polygon points="70,60 110,40 110,90 70,110" fill="#D9A22E" stroke="#3a4250" stroke-width="2"/>
      </svg>`,
      facts: ["6 وجوهٍ مربّعةٍ متساوية", "8 زوايا و12 ضلعًا"],
      examples: ["🧊 مكعّبُ الثلج", "🟦 مكعّباتُ البناء", "📦 كثيرٌ من الصناديق"],
      tadabbur: "الكعبة المشرَّفة شِبهُ مكعَّبٍ بُنِيَ على هندسةٍ ثابتةٍ يقصدُها الناس في كل أرضٍ منذ آلاف السنين.",
    },
    {
      id: "sphere", name: "كرة", dim: "3D",
      svg: `<svg viewBox="0 0 120 120">
        <defs><radialGradient id="g-sph" cx="38%" cy="35%"><stop offset="0%" stop-color="#fff"/><stop offset="60%" stop-color="#6FB3D6"/><stop offset="100%" stop-color="#3D7DA0"/></radialGradient></defs>
        <circle cx="60" cy="60" r="48" fill="url(#g-sph)" stroke="#3a4250" stroke-width="2"/>
      </svg>`,
      facts: ["لا حوافَّ لها ولا زوايا", "كلُّ نقطةٍ على سطحها على البُعد نفسه من المركز"],
      examples: ["🌍 الأرض", "⚽ الكرة", "🍊 البرتقالة", "🌕 القمر"],
      tadabbur: "الأرضُ كرويّةٌ كَوَّرها اللهُ تكويرًا، وكلُّ كوكبٍ يَجري في فلكٍ يَسبحون.",
    },
    {
      id: "cone", name: "مخروط", dim: "3D",
      svg: `<svg viewBox="0 0 120 120">
        <ellipse cx="60" cy="100" rx="40" ry="10" fill="#D9A22E" stroke="#3a4250" stroke-width="2"/>
        <polygon points="60,15 100,100 20,100" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/>
        <path d="M20,100 A40,10 0 0 0 100,100" fill="none" stroke="#3a4250" stroke-width="2" stroke-dasharray="3,3"/>
      </svg>`,
      facts: ["قاعدةٌ دائريّة وقمّةٌ مدبَّبة", "كالقبّعة المخروطية"],
      examples: ["🍦 قمعُ المثلّجات", "🎉 قبّعة الاحتفال", "🚧 مخروط المرور"],
    },
    {
      id: "cylinder", name: "أسطوانة", dim: "3D",
      svg: `<svg viewBox="0 0 120 120">
        <ellipse cx="60" cy="22" rx="32" ry="9" fill="#FCEBC9" stroke="#3a4250" stroke-width="2"/>
        <rect x="28" y="22" width="64" height="76" fill="#F4C95D" stroke="none"/>
        <ellipse cx="60" cy="98" rx="32" ry="9" fill="#D9A22E" stroke="#3a4250" stroke-width="2"/>
        <line x1="28" y1="22" x2="28" y2="98" stroke="#3a4250" stroke-width="2"/>
        <line x1="92" y1="22" x2="92" y2="98" stroke="#3a4250" stroke-width="2"/>
      </svg>`,
      facts: ["قاعدتان دائريّتان متطابقتان", "وجهٌ منحنٍ يصلُ بينهما"],
      examples: ["🥫 علبة الطعام", "🥤 كوبُ العصير", "🪵 جذعُ الشجرة"],
    },
    {
      id: "pyramid", name: "هرم", dim: "3D",
      svg: `<svg viewBox="0 0 120 120">
        <polygon points="60,15 100,100 20,100" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/>
        <polygon points="60,15 100,100 75,90" fill="#D9A22E" stroke="#3a4250" stroke-width="2"/>
        <line x1="60" y1="15" x2="60" y2="100" stroke="#3a4250" stroke-width="1.5" stroke-dasharray="3,3"/>
      </svg>`,
      facts: ["قاعدةٌ مضلَّعة وقمّةٌ واحدة", "أوجهُه مثلّثات تَلتقي في القمّة"],
      examples: ["🔺 خيمةٌ مدبّبة", "أهراماتٌ قديمةٌ"],
    },
  ],

  // أنشطة الورق — كل نشاطٍ يصنع شكلًا بمقاساتٍ محدَّدة بخطواتٍ مرسومة.
  // المبدأ: الشاشة محفّزٌ، والنشاط الحقيقيّ يدويٌّ بالورق والمسطرة والقلم.
  crafts: [
    {
      id: "craft-square",
      title: "مربّع 10×10 سم",
      shape: "مربّع",
      mins: 5,
      file: "crafts/square-10cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><rect x="10" y="10" width="40" height="40" fill="#FFF6DD" stroke="#3a4250" stroke-width="2"/></svg>`,
      materials: ["ورقة A4 بيضاء", "قلم رصاص", "مسطرة", "مقصّ"],
      steps: [
        { txt: "ضع الورقة أمامك، وارسم خطًّا أُفقيًّا طوله 10 سم.", svg: `<svg viewBox="0 0 200 120"><rect x="10" y="10" width="180" height="100" fill="#FFF" stroke="#ECE6DA"/><line x1="40" y1="50" x2="160" y2="50" stroke="#3a4250" stroke-width="2"/><text x="100" y="42" text-anchor="middle" font-size="12" fill="#C7613F" font-family="inherit">10 سم</text></svg>` },
        { txt: "من بداية الخطّ ومن نهايته، ارسم خطّين عموديّين إلى الأسفل، كلٌّ منهما 10 سم.", svg: `<svg viewBox="0 0 200 120"><line x1="40" y1="20" x2="160" y2="20" stroke="#3a4250" stroke-width="2"/><line x1="40" y1="20" x2="40" y2="110" stroke="#3a4250" stroke-width="2"/><line x1="160" y1="20" x2="160" y2="110" stroke="#3a4250" stroke-width="2"/><text x="100" y="14" text-anchor="middle" font-size="11" fill="#C7613F">10 سم</text><text x="30" y="68" text-anchor="end" font-size="11" fill="#C7613F">10</text><text x="170" y="68" text-anchor="start" font-size="11" fill="#C7613F">10</text></svg>` },
        { txt: "صِل بين نهايتي الخطّين العموديّين بخطٍّ أُفقيٍّ رابع — اكتمل المربّع.", svg: `<svg viewBox="0 0 200 120"><rect x="40" y="20" width="120" height="90" fill="#FFFBE8" stroke="#3a4250" stroke-width="2"/></svg>` },
        { txt: "اقُصَّ على الخطوط الأربعة بحذرٍ بمساعدةِ والديك.", svg: `<svg viewBox="0 0 200 120"><rect x="40" y="20" width="120" height="90" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/><text x="100" y="70" text-anchor="middle" font-size="20">✂️</text></svg>` },
      ],
      tip: "تحقّق: قِسْ كلَّ ضلعٍ — يجب أن يكون 10 سم. وزواياه أربعٌ قائمة (مثلَ زاوية الكتاب).",
    },
    {
      id: "craft-rectangle",
      title: "مستطيل 15×8 سم",
      shape: "مستطيل",
      mins: 5,
      file: "crafts/rectangle-15x8cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><rect x="6" y="18" width="48" height="26" fill="#F0E9F7" stroke="#3a4250" stroke-width="2"/></svg>`,
      materials: ["ورقة A4", "قلم", "مسطرة", "مقصّ"],
      steps: [
        { txt: "ارسم خطًّا أُفقيًّا طوله 15 سم.", svg: `<svg viewBox="0 0 200 90"><line x1="20" y1="45" x2="180" y2="45" stroke="#3a4250" stroke-width="2"/><text x="100" y="35" text-anchor="middle" font-size="12" fill="#C7613F">15 سم</text></svg>` },
        { txt: "من طرفَيه ارسم خطّين إلى الأسفل، كلُّ خطٍّ 8 سم.", svg: `<svg viewBox="0 0 200 120"><line x1="20" y1="20" x2="180" y2="20" stroke="#3a4250" stroke-width="2"/><line x1="20" y1="20" x2="20" y2="100" stroke="#3a4250" stroke-width="2"/><line x1="180" y1="20" x2="180" y2="100" stroke="#3a4250" stroke-width="2"/><text x="100" y="14" text-anchor="middle" font-size="11" fill="#C7613F">15 سم</text><text x="10" y="64" text-anchor="end" font-size="11" fill="#C7613F">8</text></svg>` },
        { txt: "صِلْ نهايتي الخطّين بخطٍّ أُفقيٍّ رابعٍ بطول 15 سم.", svg: `<svg viewBox="0 0 200 120"><rect x="20" y="20" width="160" height="80" fill="#FBEFF4" stroke="#3a4250" stroke-width="2"/></svg>` },
        { txt: "اقُصَّ بالمقصّ على الخطوط الأربعة.", svg: `<svg viewBox="0 0 200 120"><rect x="20" y="20" width="160" height="80" fill="#C9A0DC" stroke="#3a4250" stroke-width="2"/><text x="100" y="70" text-anchor="middle" font-size="20">✂️</text></svg>` },
      ],
      tip: "قارنه بالكتاب — ستجد أنّ الكتاب مستطيلٌ أيضًا.",
    },
    {
      id: "craft-triangle",
      title: "مثلّث متساوي الأضلاع (8 سم)",
      shape: "مثلّث",
      mins: 7,
      file: "crafts/triangle-eq-8cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><polygon points="30,8 52,50 8,50" fill="#E9F5E0" stroke="#3a4250" stroke-width="2"/></svg>`,
      materials: ["ورقة", "قلم", "مسطرة", "مقصّ"],
      steps: [
        { txt: "ارسم خطًّا أُفقيًّا طوله 8 سم في أسفل الورقة. سمِّ طرفيه «أ» و«ب».", svg: `<svg viewBox="0 0 200 120"><line x1="40" y1="90" x2="160" y2="90" stroke="#3a4250" stroke-width="2"/><text x="35" y="105" font-size="13" fill="#C7613F">أ</text><text x="165" y="105" font-size="13" fill="#C7613F">ب</text><text x="100" y="82" text-anchor="middle" font-size="12" fill="#C7613F">8 سم</text></svg>` },
        { txt: "من «أ» قِسْ 8 سم بزاويةٍ مائلةٍ نحو الأعلى، وضع نقطةً «ج». افعل المثل من «ب» نحو «ج».", svg: `<svg viewBox="0 0 200 120"><polygon points="40,90 160,90 100,15" fill="none" stroke="#3a4250" stroke-width="2"/><text x="35" y="105" font-size="13" fill="#C7613F">أ</text><text x="165" y="105" font-size="13" fill="#C7613F">ب</text><text x="100" y="10" text-anchor="middle" font-size="13" fill="#C7613F">ج</text></svg>` },
        { txt: "صِلْ «ج» بـ«أ» و«ب» بمسطرتك — تأكَّد أنّ الضلعَين 8 سم تمامًا.", svg: `<svg viewBox="0 0 200 120"><polygon points="40,90 160,90 100,15" fill="#EDFBE3" stroke="#3a4250" stroke-width="2"/></svg>` },
        { txt: "اقُصّ على الأضلاع الثلاثة.", svg: `<svg viewBox="0 0 200 120"><polygon points="40,90 160,90 100,15" fill="#7BB661" stroke="#3a4250" stroke-width="2"/><text x="100" y="78" text-anchor="middle" font-size="20">✂️</text></svg>` },
      ],
      tip: "زواياه الثلاث متساوية، كلُّ زاويةٍ 60°. ضعْه قربَ ساعةٍ ولاحظِ الزاوية.",
    },
    {
      id: "craft-circle",
      title: "دائرة قطرها 10 سم",
      shape: "دائرة",
      mins: 6,
      file: "crafts/circle-d10cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="22" fill="#E4F0F8" stroke="#3a4250" stroke-width="2"/></svg>`,
      materials: ["ورقة", "قلم", "صحنٌ صغيرٌ قطرُه 10 سم (أو فرجار)", "مقصّ"],
      steps: [
        { txt: "ضع الصحن مقلوبًا على الورقة في وسطها.", svg: `<svg viewBox="0 0 200 140"><rect x="10" y="10" width="180" height="120" fill="#FFF" stroke="#ECE6DA"/><circle cx="100" cy="70" r="50" fill="#FCEBC9" stroke="#3a4250" stroke-width="2"/></svg>` },
        { txt: "حرِّك قلمك حول الصحن بهدوءٍ من دون أن يتحرّك الصحن.", svg: `<svg viewBox="0 0 200 140"><circle cx="100" cy="70" r="50" fill="none" stroke="#3a4250" stroke-width="2"/><text x="155" y="40" font-size="20">✏️</text></svg>` },
        { txt: "ارفع الصحن — سترى دائرةً جميلةً مرسومة.", svg: `<svg viewBox="0 0 200 140"><circle cx="100" cy="70" r="50" fill="#FFF6DD" stroke="#3a4250" stroke-width="2"/><line x1="50" y1="70" x2="150" y2="70" stroke="#C7613F" stroke-width="1" stroke-dasharray="3,3"/><text x="100" y="65" text-anchor="middle" font-size="11" fill="#C7613F">القطر 10 سم</text></svg>` },
        { txt: "اقُصَّ على حافّة الدائرة بحذر.", svg: `<svg viewBox="0 0 200 140"><circle cx="100" cy="70" r="50" fill="#6FB3D6" stroke="#3a4250" stroke-width="2"/><text x="100" y="78" text-anchor="middle" font-size="20">✂️</text></svg>` },
      ],
      tip: "نصفُ القطر = 5 سم (نصف الـ10). جرّب أن تَطوي الدائرة نصفين فيظهر القطر.",
    },
    {
      id: "craft-cube",
      title: "مكعّب من الشبكة (ضلع 4 سم)",
      shape: "مكعّب",
      mins: 15,
      file: "crafts/cube-net-4cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><polygon points="10,22 30,12 50,22 30,32" fill="#FCEBC9" stroke="#3a4250" stroke-width="1.5"/><polygon points="10,22 10,46 30,56 30,32" fill="#F4C95D" stroke="#3a4250" stroke-width="1.5"/><polygon points="50,22 50,46 30,56 30,32" fill="#D9A22E" stroke="#3a4250" stroke-width="1.5"/></svg>`,
      materials: ["ورق مقوّى (كرتون رقيق)", "قلم", "مسطرة", "مقصّ", "صمغ أو شريط لاصق"],
      steps: [
        { txt: "ارسم الشبكة الكروسيّة المبيَّنة: عمودٌ من 4 مربّعات (4×4 سم لكلٍّ) ومربّعان جانبيّان عند الثاني من الأعلى.", svg: `<svg viewBox="0 0 200 200"><g stroke="#3a4250" stroke-width="2" fill="#FFF6DD"><rect x="80" y="20" width="36" height="36"/><rect x="80" y="56" width="36" height="36"/><rect x="44" y="56" width="36" height="36"/><rect x="116" y="56" width="36" height="36"/><rect x="80" y="92" width="36" height="36"/><rect x="80" y="128" width="36" height="36"/></g><text x="98" y="42" text-anchor="middle" font-size="9" fill="#C7613F">4×4</text></svg>` },
        { txt: "أضِف ألسنةَ لصقٍ بعرض 1 سم على الأطراف كما في الشكل.", svg: `<svg viewBox="0 0 200 200"><g stroke="#3a4250" stroke-width="1.5" fill="#FFF6DD"><rect x="80" y="20" width="36" height="36"/><rect x="80" y="56" width="36" height="36"/><rect x="44" y="56" width="36" height="36"/><rect x="116" y="56" width="36" height="36"/><rect x="80" y="92" width="36" height="36"/><rect x="80" y="128" width="36" height="36"/></g><g fill="#FCEBC9" stroke="#C7613F" stroke-width="1" stroke-dasharray="2,2"><polygon points="80,20 116,20 110,12 86,12"/><polygon points="44,56 80,56 78,48 50,48"/><polygon points="116,56 152,56 148,48 122,48"/><polygon points="80,164 116,164 112,172 86,172"/></g></svg>` },
        { txt: "اقُصَّ حول الشبكة بأكملها (لا تقُصَّ الخطوط الداخلية).", svg: `<svg viewBox="0 0 200 200"><polygon points="50,12 110,12 110,48 152,48 152,92 110,92 110,172 86,172 86,92 44,92 44,48 86,48" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/><text x="100" y="105" text-anchor="middle" font-size="22">✂️</text></svg>` },
        { txt: "اطوِ كلَّ ضلعٍ بين المربّعات إلى الداخل (90°) حتى تتلامس الجوانب.", svg: `<svg viewBox="0 0 200 200"><polygon points="30,120 90,80 150,120 90,160" fill="#FFF6DD" stroke="#3a4250" stroke-width="2"/><polygon points="30,120 90,160 90,100" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/><polygon points="90,160 150,120 150,60 90,100" fill="#D9A22E" stroke="#3a4250" stroke-width="2"/><text x="100" y="40" text-anchor="middle" font-size="11" fill="#C7613F">اطوِ</text></svg>` },
        { txt: "ضع صمغًا (أو شريطًا لاصقًا) على الألسنة وألصِق الوجوهَ معًا.", svg: `<svg viewBox="0 0 200 200"><polygon points="30,120 90,80 150,120 90,160" fill="#FFF6DD" stroke="#3a4250" stroke-width="2"/><polygon points="30,120 90,160 90,100" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/><polygon points="90,160 150,120 150,60 90,100" fill="#D9A22E" stroke="#3a4250" stroke-width="2"/><text x="100" y="180" text-anchor="middle" font-size="11" fill="#7BB661">✓ مكعّبٌ جاهز</text></svg>` },
      ],
      tip: "للمكعّب 6 وجوه و8 زوايا و12 ضلعًا. كلُّ ضلعٍ في صنعك = 4 سم.",
    },
    {
      id: "craft-cone",
      title: "مخروط (قبّعة ساحرٍ)",
      shape: "مخروط",
      mins: 8,
      file: "crafts/cone-r4-s10cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><ellipse cx="30" cy="48" rx="20" ry="5" fill="#D9A22E" stroke="#3a4250" stroke-width="1.5"/><polygon points="30,8 50,48 10,48" fill="#F4C95D" stroke="#3a4250" stroke-width="1.5"/></svg>`,
      materials: ["ورقة مقوّاة", "قلم", "خيط", "مسطرة", "مقصّ", "شريط لاصق"],
      steps: [
        { txt: "ضع نهاية الخيط في زاوية الورقة، وثبّت قلمًا على الطرف الآخر، ثمّ ارسم قوسًا (نصف دائرة) نصف قطره 12 سم.", svg: `<svg viewBox="0 0 200 160"><rect x="10" y="10" width="180" height="140" fill="#FFF" stroke="#ECE6DA"/><circle cx="20" cy="140" r="4" fill="#C7613F"/><path d="M20,20 A120,120 0 0 0 140,140" fill="none" stroke="#3a4250" stroke-width="2"/><text x="80" y="80" font-size="11" fill="#C7613F">نصف القطر 12 سم</text></svg>` },
        { txt: "اقُصَّ القطاعَ الناتج (شِبهَ مثلّثٍ منحنيِ القاعدة).", svg: `<svg viewBox="0 0 200 160"><path d="M20,140 L20,20 A120,120 0 0 0 140,140 Z" fill="#FFF6DD" stroke="#3a4250" stroke-width="2"/><text x="80" y="100" text-anchor="middle" font-size="20">✂️</text></svg>` },
        { txt: "لُفَّ القطاع حول نفسه حتى تلتقي الحوافُّ المستقيمة، يتشكّل مخروط.", svg: `<svg viewBox="0 0 200 160"><polygon points="100,15 140,140 60,140" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/><ellipse cx="100" cy="140" rx="40" ry="8" fill="#D9A22E" stroke="#3a4250" stroke-width="2"/></svg>` },
        { txt: "ثبّت الحافّتين بشريطٍ لاصقٍ من الداخل.", svg: `<svg viewBox="0 0 200 160"><polygon points="100,15 140,140 60,140" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/><text x="100" y="155" text-anchor="middle" font-size="11" fill="#7BB661">✓ مخروطٌ جاهز</text></svg>` },
      ],
      tip: "كلَّما زاد نصف القطر، اتّسعت قاعدة المخروط وعَلَت قمَّتُه.",
    },
    {
      id: "craft-cylinder",
      title: "أسطوانة (علبةٌ صغيرة)",
      shape: "أسطوانة",
      mins: 10,
      file: "crafts/cylinder-d6-h8cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><ellipse cx="30" cy="12" rx="16" ry="4" fill="#FCEBC9" stroke="#3a4250" stroke-width="1.5"/><rect x="14" y="12" width="32" height="36" fill="#F4C95D" stroke="none"/><ellipse cx="30" cy="48" rx="16" ry="4" fill="#D9A22E" stroke="#3a4250" stroke-width="1.5"/><line x1="14" y1="12" x2="14" y2="48" stroke="#3a4250" stroke-width="1.5"/><line x1="46" y1="12" x2="46" y2="48" stroke="#3a4250" stroke-width="1.5"/></svg>`,
      materials: ["ورق مقوّى", "قلم", "مسطرة", "مقصّ", "شريط لاصق", "صحنٌ صغير قطره 6 سم"],
      steps: [
        { txt: "ارسم مستطيلًا قياسُه 20 × 8 سم (سيكون جانبَ الأسطوانة).", svg: `<svg viewBox="0 0 200 120"><rect x="20" y="35" width="160" height="50" fill="#FFF6DD" stroke="#3a4250" stroke-width="2"/><text x="100" y="28" text-anchor="middle" font-size="11" fill="#C7613F">20 سم</text><text x="10" y="63" text-anchor="end" font-size="11" fill="#C7613F">8</text></svg>` },
        { txt: "ارسم دائرتين قطرُ كلٍّ منهما 6 سم (هما القاعدتان). يمكنك استعمال الصحن.", svg: `<svg viewBox="0 0 200 120"><circle cx="60" cy="60" r="28" fill="#FCEBC9" stroke="#3a4250" stroke-width="2"/><circle cx="140" cy="60" r="28" fill="#FCEBC9" stroke="#3a4250" stroke-width="2"/><text x="60" y="65" text-anchor="middle" font-size="10" fill="#C7613F">6 سم</text></svg>` },
        { txt: "اقُصَّ المستطيل والدائرتين.", svg: `<svg viewBox="0 0 200 120"><rect x="20" y="35" width="160" height="50" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/><text x="100" y="65" text-anchor="middle" font-size="20">✂️</text></svg>` },
        { txt: "لُفَّ المستطيل ليكوّن أنبوبًا (يلتقي طرفاه الأقصران)، وثبِّت بشريطٍ لاصق.", svg: `<svg viewBox="0 0 200 120"><ellipse cx="100" cy="25" rx="32" ry="8" fill="#FCEBC9" stroke="#3a4250" stroke-width="2"/><rect x="68" y="25" width="64" height="65" fill="#F4C95D" stroke="none"/><ellipse cx="100" cy="90" rx="32" ry="8" fill="#D9A22E" stroke="#3a4250" stroke-width="2"/><line x1="68" y1="25" x2="68" y2="90" stroke="#3a4250" stroke-width="2"/><line x1="132" y1="25" x2="132" y2="90" stroke="#3a4250" stroke-width="2"/></svg>` },
        { txt: "ألصِق الدائرتين على فتحتي الأنبوب — حصلتَ على أسطوانة.", svg: `<svg viewBox="0 0 200 120"><ellipse cx="100" cy="25" rx="32" ry="8" fill="#FCEBC9" stroke="#3a4250" stroke-width="2"/><rect x="68" y="25" width="64" height="65" fill="#F4C95D" stroke="none"/><ellipse cx="100" cy="90" rx="32" ry="8" fill="#D9A22E" stroke="#3a4250" stroke-width="2"/><line x1="68" y1="25" x2="68" y2="90" stroke="#3a4250" stroke-width="2"/><line x1="132" y1="25" x2="132" y2="90" stroke="#3a4250" stroke-width="2"/><text x="100" y="115" text-anchor="middle" font-size="11" fill="#7BB661">✓ أسطوانةٌ جاهزة</text></svg>` },
      ],
      tip: "محيطُ الدائرة (قطر 6 سم) ≈ 18٫8 سم. لذلك المستطيل 20 سم يكفي تمامًا (مع تداخلٍ 1 سم للّصق).",
    },
    {
      id: "craft-hex",
      title: "سداسيٌّ منتظم (كخليّة النحل)",
      shape: "سداسي",
      mins: 10,
      file: "crafts/hexagon-4cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><polygon points="50,30 40,48 20,48 10,30 20,12 40,12" fill="#FDF1E2" stroke="#3a4250" stroke-width="2"/></svg>`,
      materials: ["ورقة", "قلم", "فرجار أو كأسٌ مستدير", "مسطرة"],
      steps: [
        { txt: "ارسم دائرةً نصفُ قطرها 4 سم في وسط الورقة.", svg: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="60" fill="none" stroke="#3a4250" stroke-width="2"/><text x="100" y="106" text-anchor="middle" font-size="10" fill="#C7613F">نصف القطر 4 سم</text></svg>` },
        { txt: "ضع رأس الفرجار (أو الكأس) على نقطةٍ ما على محيط الدائرة، وارسم قوسًا يمرّ بالمركز.", svg: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="60" fill="none" stroke="#3a4250" stroke-width="2"/><circle cx="100" cy="40" r="4" fill="#C7613F"/><path d="M40,100 A60,60 0 0 1 160,100" fill="none" stroke="#C7613F" stroke-width="2" stroke-dasharray="3,3"/></svg>` },
        { txt: "حرّك رأس الفرجار إلى نقطةِ التقاطع وارسم قوسًا آخر… استمرَّ حتى تحصل على 6 علاماتٍ على المحيط.", svg: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="60" fill="none" stroke="#3a4250" stroke-width="2"/><circle cx="100" cy="40" r="4" fill="#C7613F"/><circle cx="152" cy="70" r="4" fill="#C7613F"/><circle cx="152" cy="130" r="4" fill="#C7613F"/><circle cx="100" cy="160" r="4" fill="#C7613F"/><circle cx="48" cy="130" r="4" fill="#C7613F"/><circle cx="48" cy="70" r="4" fill="#C7613F"/></svg>` },
        { txt: "صِل النقاط الستّ بمسطرتك — يظهر السداسيُّ المنتظم.", svg: `<svg viewBox="0 0 200 200"><polygon points="100,40 152,70 152,130 100,160 48,130 48,70" fill="#F4A03A" fill-opacity=".5" stroke="#3a4250" stroke-width="2"/></svg>` },
      ],
      tip: "هكذا يبني النحلُ خلاياه — 6 أضلاعٍ تتلاصق بلا فراغ. سبحان الذي أتقنَ كلَّ شيءٍ خلَقه.",
    },
    {
      id: "craft-star",
      title: "نجمة خماسيّة (شعاع 4 سم)",
      shape: "نجمة",
      mins: 8,
      file: "crafts/star-5pt-8cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><polygon points="30,6 36,22 53,22 39,32 44,49 30,39 16,49 21,32 7,22 24,22" fill="#F4C95D" stroke="#3a4250" stroke-width="1.5"/></svg>`,
      materials: ["ورقة", "قلم", "مسطرة", "مقصّ"],
      steps: [
        { txt: "ارسم دائرةً مساعدةً نصف قطرها 4 سم في وسط الورقة.", svg: `<svg viewBox="0 0 200 160"><circle cx="100" cy="80" r="60" fill="none" stroke="#3a4250" stroke-width="1.5" stroke-dasharray="2,2"/></svg>` },
        { txt: "ضع 5 نقاطٍ على محيط الدائرة، كلُّ نقطتين بينهما 72° (مثل خمسة أعمدةٍ متساوية).", svg: `<svg viewBox="0 0 200 160"><circle cx="100" cy="80" r="60" fill="none" stroke="#3a4250" stroke-width="0.8" stroke-dasharray="2,2"/><g fill="#C7613F"><circle cx="100" cy="20" r="3"/><circle cx="157" cy="62" r="3"/><circle cx="135" cy="138" r="3"/><circle cx="65" cy="138" r="3"/><circle cx="43" cy="62" r="3"/></g></svg>` },
        { txt: "صِل النقطة الأولى بالنقطة الثالثة، ثم بالخامسة، ثم بالثانية، ثم بالرابعة، ثم عُد للأولى — تظهر النجمة.", svg: `<svg viewBox="0 0 200 160"><polygon points="100,20 135,138 43,62 157,62 65,138" fill="none" stroke="#3a4250" stroke-width="1.5"/></svg>` },
        { txt: "اقُصَّ على المحيط الخارجيّ للنجمة فقط.", svg: `<svg viewBox="0 0 200 160"><polygon points="100,20 113,55 152,55 121,76 132,114 100,90 68,114 79,76 48,55 87,55" fill="#F4C95D" stroke="#3a4250" stroke-width="1.5"/><text x="100" y="85" text-anchor="middle" font-size="16">✂️</text></svg>` },
      ],
      tip: "اثقب أحدَ أشعّتها العُلوية ومرّر خيطًا — تَلتمعُ كنجمةٍ في غرفتك. تذكَّرْ قولَ الله {زَيَّنَّاهَا لِلنَّاظِرِينَ}.",
    },
    {
      id: "craft-rhombus",
      title: "معيَّن (قُطْراه 10×6 سم)",
      shape: "معيَّن",
      mins: 6,
      file: "crafts/rhombus-10x6cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><polygon points="30,8 52,30 30,52 8,30" fill="#E9F5E0" stroke="#3a4250" stroke-width="2"/></svg>`,
      materials: ["ورقة", "قلم", "مسطرة", "مقصّ"],
      steps: [
        { txt: "ارسم خطًّا أُفقيًّا في وسط الورقة طولُه 10 سم — هذا القُطر الأكبر.", svg: `<svg viewBox="0 0 200 120"><line x1="40" y1="60" x2="160" y2="60" stroke="#3a4250" stroke-width="2"/><text x="100" y="52" text-anchor="middle" font-size="11" fill="#C7613F">10 سم</text></svg>` },
        { txt: "ارسم خطًّا عموديًّا يقطعه في وسطه طولُه 6 سم (3 سم فوق و3 سم تحت) — هذا القُطر الأصغر.", svg: `<svg viewBox="0 0 200 140"><line x1="40" y1="70" x2="160" y2="70" stroke="#3a4250" stroke-width="2"/><line x1="100" y1="30" x2="100" y2="110" stroke="#3a4250" stroke-width="2"/><text x="100" y="22" text-anchor="middle" font-size="11" fill="#C7613F">3+3=6 سم</text></svg>` },
        { txt: "صِل الأطراف الأربعة بأربعة خطوطٍ مائلة — يظهر المعيَّن.", svg: `<svg viewBox="0 0 200 140"><polygon points="100,30 160,70 100,110 40,70" fill="#E9F5E0" stroke="#3a4250" stroke-width="2"/></svg>` },
        { txt: "اقُصَّ على الخطوط المائلة الأربعة.", svg: `<svg viewBox="0 0 200 140"><polygon points="100,30 160,70 100,110 40,70" fill="#7BB661" stroke="#3a4250" stroke-width="2"/><text x="100" y="76" text-anchor="middle" font-size="18">✂️</text></svg>` },
      ],
      tip: "أضلاعه الأربعة متساوية الطول (≈ 5.83 سم لكلٍّ)، لكنّ زواياه ليست قائمة. كالطيّارة الورقية.",
    },
    {
      id: "craft-trapezoid",
      title: "شبه منحرف (10×6 وارتفاع 4 سم)",
      shape: "شبه منحرف",
      mins: 6,
      file: "crafts/trapezoid-10-6-4cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><polygon points="18,15 42,15 52,45 8,45" fill="#E4F0F8" stroke="#3a4250" stroke-width="2"/></svg>`,
      materials: ["ورقة", "قلم", "مسطرة", "مقصّ"],
      steps: [
        { txt: "ارسم القاعدة السفلى أُفقيًّا بطول 10 سم.", svg: `<svg viewBox="0 0 200 120"><line x1="30" y1="90" x2="170" y2="90" stroke="#3a4250" stroke-width="2"/><text x="100" y="103" text-anchor="middle" font-size="11" fill="#C7613F">10 سم</text></svg>` },
        { txt: "فوقها بـ4 سم ارسم القاعدة العُليا بطول 6 سم، يكون مركزها فوق مركز القاعدة السفلى.", svg: `<svg viewBox="0 0 200 120"><line x1="30" y1="90" x2="170" y2="90" stroke="#3a4250" stroke-width="2"/><line x1="60" y1="42" x2="140" y2="42" stroke="#3a4250" stroke-width="2"/><text x="100" y="36" text-anchor="middle" font-size="11" fill="#C7613F">6 سم</text><text x="180" y="68" font-size="11" fill="#C7613F">4</text></svg>` },
        { txt: "صِل أطراف القاعدتين بخطّين مائلين — تَكتمل صورةُ شبهِ المنحرف.", svg: `<svg viewBox="0 0 200 120"><polygon points="60,42 140,42 170,90 30,90" fill="#E4F0F8" stroke="#3a4250" stroke-width="2"/></svg>` },
        { txt: "اقُصَّ على الخطوط الأربعة.", svg: `<svg viewBox="0 0 200 120"><polygon points="60,42 140,42 170,90 30,90" fill="#6FB3D6" stroke="#3a4250" stroke-width="2"/><text x="100" y="74" text-anchor="middle" font-size="18">✂️</text></svg>` },
      ],
      tip: "له ضلعان متوازيان لا متساويان (10 و6 سم)، وضلعان مائلان متساويان. كالخيمة أو جانبٍ من سيارة.",
    },
    {
      id: "craft-pyramid",
      title: "هرم قاعدتُه مربّعة (ضلع 5 سم)",
      shape: "هرم رباعي",
      mins: 15,
      file: "crafts/pyramid-square-5cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><polygon points="30,8 52,52 8,52" fill="#F4C95D" stroke="#3a4250" stroke-width="1.5"/><polygon points="30,8 52,52 38,46" fill="#D9A22E" stroke="#3a4250" stroke-width="1.5"/><line x1="30" y1="8" x2="30" y2="52" stroke="#3a4250" stroke-width="1" stroke-dasharray="2,1.5"/></svg>`,
      materials: ["ورق مقوّى", "قلم", "مسطرة", "مقصّ", "صمغ أو شريط لاصق", "خيط"],
      steps: [
        { txt: "ارسم مربَّعًا في وسط الورقة ضلعُه 5 سم — هذه القاعدة.", svg: `<svg viewBox="0 0 200 200"><rect x="80" y="80" width="40" height="40" fill="#FFF6DD" stroke="#3a4250" stroke-width="2"/><text x="100" y="76" text-anchor="middle" font-size="10" fill="#C7613F">5×5 سم</text></svg>` },
        { txt: "على كل ضلعٍ من المربَّع ارسم مثلَّثًا متساوي الساقَين قاعدتُه ضلع المربَّع، وارتفاعُه 6 سم.", svg: `<svg viewBox="0 0 200 200"><rect x="80" y="80" width="40" height="40" fill="#FFF6DD" stroke="#3a4250" stroke-width="2"/><polygon points="80,80 120,80 100,32" fill="#FDF1E2" stroke="#3a4250" stroke-width="1.5"/><polygon points="120,80 120,120 168,100" fill="#FDF1E2" stroke="#3a4250" stroke-width="1.5"/><polygon points="120,120 80,120 100,168" fill="#FDF1E2" stroke="#3a4250" stroke-width="1.5"/><polygon points="80,120 80,80 32,100" fill="#FDF1E2" stroke="#3a4250" stroke-width="1.5"/></svg>` },
        { txt: "اقُصَّ المحيط الخارجيَّ للشبكة كاملةً.", svg: `<svg viewBox="0 0 200 200"><polygon points="100,32 120,80 168,100 120,120 100,168 80,120 32,100 80,80" fill="#F4C95D" stroke="#3a4250" stroke-width="2"/><text x="100" y="105" text-anchor="middle" font-size="20">✂️</text></svg>` },
        { txt: "اطوِ كلَّ مثلَّثٍ إلى الأعلى حول ضلعه المشترك مع المربَّع حتى تَلتقي القمم.", svg: `<svg viewBox="0 0 200 200"><polygon points="50,140 150,140 100,40" fill="#FDF1E2" stroke="#3a4250" stroke-width="1.5"/><polygon points="100,40 150,140 130,128" fill="#D9A22E" stroke="#3a4250" stroke-width="1.5"/><polygon points="50,140 150,140 130,128 70,128" fill="#FFF6DD" stroke="#3a4250" stroke-width="1.5"/></svg>` },
        { txt: "ضع صمغًا على الحوافّ المتلاصقة، اثقب القمّة، ومرّر الخيط للتعليق.", svg: `<svg viewBox="0 0 200 200"><line x1="100" y1="20" x2="100" y2="40" stroke="#3a4250" stroke-width="1" stroke-dasharray="2,2"/><polygon points="50,140 150,140 100,40" fill="#FDF1E2" stroke="#3a4250" stroke-width="1.5"/><polygon points="100,40 150,140 130,128" fill="#D9A22E" stroke="#3a4250" stroke-width="1.5"/><circle cx="100" cy="40" r="1.5" fill="none" stroke="#5E9A47" stroke-width="1"/><text x="100" y="185" text-anchor="middle" font-size="12" fill="#7BB661">✓ هرمٌ معلَّق 🧵</text></svg>` },
      ],
      tip: "للهرم الرباعيّ: قاعدةٌ واحدة (مربّع) + 4 أوجهٍ مثلّثة + قمّةٌ واحدة. يُذكِّر بهرم القرافة في مصر.",
    },
    {
      id: "craft-tetrahedron",
      title: "رباعي السطوح (ضلع 6 سم)",
      shape: "رباعي السطوح",
      mins: 15,
      file: "crafts/tetrahedron-6cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><polygon points="30,8 52,46 8,46" fill="#FBEFF4" stroke="#3a4250" stroke-width="1.5"/><polygon points="30,8 52,46 30,38" fill="#E0566B" stroke="#3a4250" stroke-width="1.5"/><line x1="30" y1="8" x2="30" y2="38" stroke="#3a4250" stroke-width="1" stroke-dasharray="2,1.5"/></svg>`,
      materials: ["ورق مقوّى", "قلم", "مسطرة", "مقصّ", "صمغ", "خيط"],
      steps: [
        { txt: "ارسم شريطًا من 4 مثلّثاتٍ متساوية الأضلاع (كلُّ ضلع 6 سم)، يتشاركان أضلاعًا بالتناوب.", svg: `<svg viewBox="0 0 200 140"><polygon points="20,90 80,90 50,38" fill="#FBEFF4" stroke="#3a4250" stroke-width="1.5"/><polygon points="50,38 80,90 110,38" fill="#F0E9F7" stroke="#3a4250" stroke-width="1.5"/><polygon points="80,90 140,90 110,38" fill="#FBEFF4" stroke="#3a4250" stroke-width="1.5"/><polygon points="110,38 140,90 170,38" fill="#F0E9F7" stroke="#3a4250" stroke-width="1.5"/></svg>` },
        { txt: "اقُصَّ الشريط من حوله، واترك الخطوط الداخلية بين المثلّثات (هي خطوط الطيّ).", svg: `<svg viewBox="0 0 200 140"><polygon points="20,90 50,38 110,38 170,38 140,90 80,90" fill="#C9A0DC" stroke="#3a4250" stroke-width="2"/><text x="95" y="78" text-anchor="middle" font-size="18">✂️</text></svg>` },
        { txt: "اطوِ على كلِّ خطٍّ داخليٍّ بين مثلَّثَين، ثمّ اجمع المثلّثات حتى تَلتقي ثلاثُ قِمم — تتشكَّل خيمةٌ من 4 مثلّثاتٍ متساوية.", svg: `<svg viewBox="0 0 200 140"><polygon points="50,120 150,120 100,30" fill="#FBEFF4" stroke="#3a4250" stroke-width="1.5"/><polygon points="100,30 150,120 130,108" fill="#F0E9F7" stroke="#3a4250" stroke-width="1.5"/><polygon points="50,120 100,30 75,108" fill="#E4D5F0" stroke="#3a4250" stroke-width="1.5"/></svg>` },
        { txt: "ألصِق الحوافّ المتلاصقة، ثمّ اثقب القمّة العُلوية للخيط.", svg: `<svg viewBox="0 0 200 140"><line x1="100" y1="14" x2="100" y2="30" stroke="#3a4250" stroke-width="1" stroke-dasharray="2,2"/><polygon points="50,120 150,120 100,30" fill="#FBEFF4" stroke="#3a4250" stroke-width="1.5"/><polygon points="100,30 150,120 130,108" fill="#F0E9F7" stroke="#3a4250" stroke-width="1.5"/><circle cx="100" cy="30" r="1.5" fill="none" stroke="#5E9A47" stroke-width="1"/><text x="100" y="135" text-anchor="middle" font-size="11" fill="#7BB661">✓ معلَّق 🧵</text></svg>` },
      ],
      tip: "أبسطُ شكلٍ ثلاثيِّ الأبعاد: 4 وجوهٍ مثلّثة فقط. كلُّ وجهٍ ينظر إلى الآخر — هندسةٌ متّزنة.",
    },
    {
      id: "craft-prism-tri",
      title: "موشور ثلاثيّ (قاعدة 5 سم، طول 7 سم)",
      shape: "موشور ثلاثي",
      mins: 18,
      file: "crafts/prism-tri-5x7cm.svg",
      thumb: `<svg viewBox="0 0 60 60"><polygon points="10,18 30,8 50,18 30,28" fill="#FFF6DD" stroke="#3a4250" stroke-width="1.5"/><polygon points="10,18 10,46 30,56 30,28" fill="#F4C95D" stroke="#3a4250" stroke-width="1.5"/><polygon points="30,28 50,18 50,46 30,56" fill="#D9A22E" stroke="#3a4250" stroke-width="1.5"/></svg>`,
      materials: ["ورق مقوّى", "قلم", "مسطرة", "مقصّ", "صمغ", "خيط"],
      steps: [
        { txt: "ارسم 3 مستطيلاتٍ متجاورة، كلُّ مستطيلٍ 5×7 سم — هذه الأوجه الثلاثة الجانبيّة.", svg: `<svg viewBox="0 0 200 160"><g fill="none" stroke="#3a4250" stroke-width="1.5"><rect x="20" y="60" width="40" height="56" fill="#FFF6DD"/><rect x="60" y="60" width="40" height="56" fill="#F4C95D"/><rect x="100" y="60" width="40" height="56" fill="#D9A22E"/></g><text x="80" y="56" text-anchor="middle" font-size="10" fill="#C7613F">5 سم</text><text x="14" y="92" text-anchor="end" font-size="10" fill="#C7613F">7</text></svg>` },
        { txt: "أعلى المستطيل الأوسط ارسم مثلَّثًا متساوي الأضلاع ضلعُه 5 سم. وأسفلَه ارسم مثلَّثًا آخر مثله — هما القاعدتان.", svg: `<svg viewBox="0 0 200 200"><g fill="none" stroke="#3a4250" stroke-width="1.5"><rect x="20" y="80" width="40" height="56" fill="#FFF6DD"/><rect x="60" y="80" width="40" height="56" fill="#F4C95D"/><rect x="100" y="80" width="40" height="56" fill="#D9A22E"/></g><polygon points="60,80 100,80 80,46" fill="#FCEBC9" stroke="#3a4250" stroke-width="1.5"/><polygon points="60,136 100,136 80,170" fill="#FCEBC9" stroke="#3a4250" stroke-width="1.5"/></svg>` },
        { txt: "اقُصَّ المحيط الخارجيَّ للشبكة، واترك الخطوط الداخلية للطيّ.", svg: `<svg viewBox="0 0 200 200"><polygon points="20,80 60,80 80,46 100,80 140,80 140,136 100,136 80,170 60,136 20,136" fill="#C9A0DC" stroke="#3a4250" stroke-width="2"/><text x="80" y="115" text-anchor="middle" font-size="20">✂️</text></svg>` },
        { txt: "اطوِ على كل خطٍّ داخليٍّ بين الأشكال، ثمّ ألصِق الأطراف ليتشكَّل الموشور الثلاثيّ.", svg: `<svg viewBox="0 0 200 160"><polygon points="20,40 60,30 100,40 60,50" fill="#FFF6DD" stroke="#3a4250" stroke-width="1.5"/><polygon points="20,40 20,110 60,120 60,50" fill="#F4C95D" stroke="#3a4250" stroke-width="1.5"/><polygon points="60,50 100,40 100,110 60,120" fill="#D9A22E" stroke="#3a4250" stroke-width="1.5"/></svg>` },
        { txt: "اثقب نقطةً في إحدى القاعدتين ومرّر الخيط للتعليق.", svg: `<svg viewBox="0 0 200 160"><line x1="60" y1="10" x2="60" y2="30" stroke="#3a4250" stroke-width="1" stroke-dasharray="2,2"/><polygon points="20,40 60,30 100,40 60,50" fill="#FFF6DD" stroke="#3a4250" stroke-width="1.5"/><polygon points="20,40 20,110 60,120 60,50" fill="#F4C95D" stroke="#3a4250" stroke-width="1.5"/><polygon points="60,50 100,40 100,110 60,120" fill="#D9A22E" stroke="#3a4250" stroke-width="1.5"/><circle cx="60" cy="30" r="1.5" fill="none" stroke="#5E9A47" stroke-width="1"/><text x="60" y="148" text-anchor="middle" font-size="11" fill="#7BB661">✓ موشورٌ معلَّق 🧵</text></svg>` },
      ],
      tip: "للموشور الثلاثيّ: قاعدتان مثلّثتان متطابقتان + 3 أوجهٍ جانبيّةٍ مستطيلة. يَلتقطُ الضوءَ كموشور التجارب.",
    },
  ],
};
