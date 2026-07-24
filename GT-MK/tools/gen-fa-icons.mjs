// tools/gen-fa-icons.mjs — يستخرج أيقوناتِ التنقّل من Font Awesome Free (solid) ويضمّنها في src/icons.js.
//   الاستعمال: node tools/gen-fa-icons.mjs   (أو npm run gen:icons)
//   الهدف: SVG نظيفةٌ احترافيّةٌ بحجمٍ ضئيل (أيقوناتُنا فقط لا الخطُّ الكامل) تعمل offline، تُلوَّن بـcurrentColor.
//   الرخصة: Font Awesome Free — الأيقونات CC BY 4.0 (متوافقة مع GPL)، انظر docs/CREDITS.md.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOLID = join(ROOT, "node_modules", "@fortawesome", "fontawesome-free", "svgs", "solid");

// خريطةُ أسمائِنا الدلاليّة ← ملفّ Font Awesome (solid)
const MAP = {
  // بطاقات الفهرس (home — تُحقَن بـ data-icon)
  robot: "robot", quran: "book-quran", basics: "font", read: "book-open", math: "shapes",
  lang: "language", stories: "images", tales: "scroll", play: "gamepad", puzzles: "puzzle-piece",
  quiz: "bullseye", progress: "trophy", print: "print", shield: "user-shield",
  components: "box-open", reports: "chart-column", accounts: "users", gear: "gear",
  // v1.5: النسخة الاحتياطيّة + «الزمانُ والمكان» + الأصوات
  backup: "floppy-disk", clock: "clock", trophy: "trophy", compass: "compass", leaf: "leaf", sun: "sun", sound: "volume-high",
  // v1.7: دليلُ الوالد
  book: "book",
  // v1.8: الدَّامةُ والشطرنجُ التنافسيّان
  dama: "chess-board", chess: "chess-knight",
  // أيقوناتٌ أُضيفت بعدَ تدقيقِ v1.6 (كانت إيموجي خامًا في بطاقاتِ الألعاب)
  hunt: "magnifying-glass", bolt: "bolt", circledot: "circle-dot", dots: "table-cells-large", paw: "paw", globe: "globe", stopwatch: "stopwatch",
  // تدقيقُ v1.6 الآليّ (npm run check:icons) — رموزٌ كانت خامّةً في مظاهرِ الذاكرةِ والأوسمةِ والمهامّ
  abacus: "calculator", smile: "face-smile", rocket: "rocket", flower: "spa", seedling: "seedling", fire: "fire", dice: "dice", duo: "user-group",
  // الرياضيّات
  numbers: "list-ol", add: "plus", sub: "minus", mul: "xmark", div: "divide", find: "magnifying-glass",
  compare: "scale-balanced", pattern: "repeat", size: "ruler", circle: "circle", crafts: "scissors",
  // الألعاب
  brain: "brain", train: "train", pins: "basket-shopping", blocks: "cubes", fish: "fish",
  maze: "route", wheel: "arrows-spin", cards: "clone", spellcheck: "spell-check", earlisten: "ear-listen",
  // الأساسيّات والقراءة
  index: "table-list", mic: "microphone", link: "link",
  // قصص وعِبَر
  star: "star", mosque: "mosque", microscope: "microscope", handshake: "handshake",
  // اللغات: الأقسام
  words: "pen", phrases: "comments",
  // اللغات: فئات الكلمات/العبارات
  animals: "paw", colors: "palette", family: "people-roof", food: "utensils", body: "child",
  hand: "hand", school: "school", nature: "tree", transport: "car", fruits: "apple-whole",
  clothes: "shirt", weather: "cloud-sun", days: "calendar-days", actions: "person-running",
  polite: "hands-praying", questions: "circle-question",
  jobs: "briefcase", sports: "futbol", house: "house", sentences: "comment-dots", tenses: "clock-rotate-left",
  asking: "person-circle-question",
};

// خريطةُ الإيموجي (المستعمَلة كأيقونات بطاقاتٍ في صفحاتٍ تُرسَم من بياناتٍ) ← الاسم الدلاليّ
const EMOJI = {
  "🤖": "robot", "🔢": "numbers", "📜": "tales", "➕": "add", "➖": "sub", "✖️": "mul", "➗": "div",
  "🔍": "find", "⚖️": "compare", "🔁": "pattern", "📏": "size", "🔵": "circle", "🔷": "math",
  "✂️": "crafts", "🧠": "brain", "🚂": "train", "🧺": "pins", "🧱": "blocks", "🎣": "fish",
  "🧩": "puzzles", "🌀": "maze", "🎡": "wheel", "🖨️": "print", "📑": "index", "🔤": "basics",
  "🎙️": "mic", "🔗": "link", "🌟": "star", "🕌": "mosque", "🔬": "microscope", "🤝": "handshake",
  "🕐": "clock", "🏆": "trophy", "🧭": "compass", "🍂": "leaf", "🌅": "sun", "🔊": "sound", "💾": "backup", "📘": "book", "♛": "dama", "♟️": "chess",
  "🔎": "hunt", "⚡": "bolt", "⭕": "circledot", "▪️": "dots", "🐾": "paw", "🌍": "globe", "⏱️": "stopwatch",
  "🧮": "abacus", "😀": "smile", "🚀": "rocket", "🌸": "flower", "🌱": "seedling", "🔥": "fire", "🎲": "dice", "👯": "duo",
  "🐶": "animals", "🍕": "food", "🌿": "nature", "🐠": "fish", "⭐": "star", "🧐": "find", "💭": "sentences", "ﹷ": "spellcheck",
  "📝": "words", "💬": "phrases", "📚": "stories", "🎯": "quiz", "🎮": "play", "📖": "read",
  "🦁": "animals", "🎨": "colors", "👪": "family", "🍎": "food", "🧒": "body", "👋": "hand",
  "🏫": "school", "🌳": "nature", "🚗": "transport", "🍇": "fruits", "👕": "clothes",
  "🌦️": "weather", "📅": "days", "🏃": "actions", "🙏": "polite", "❓": "questions",
  "⚙️": "gear", "🃏": "cards", "🔡": "spellcheck", "👂": "earlisten",
  "💼": "jobs", "⚽": "sports", "🏠": "house", "🗨️": "sentences", "🕰️": "tenses", "🙋": "asking",
};

function clean(name) {
  let s = readFileSync(join(SOLID, name + ".svg"), "utf8");
  s = s.replace(/<!--[\s\S]*?-->/g, "");                       // إزالةُ تعليق الترخيص (محفوظٌ في CREDITS)
  const vb = (s.match(/viewBox="([^"]+)"/) || [])[1] || "0 0 512 512";
  const inner = s.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();
  return `<svg viewBox="${vb}" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

const iconsEntries = Object.entries(MAP).map(([k, fa]) => `  ${k}: \`${clean(fa)}\`,`).join("\n");
const emojiEntries = Object.entries(EMOJI).map(([e, n]) => `  ${JSON.stringify(e)}: ${JSON.stringify(n)},`).join("\n");

const out = `// src/icons.js — أيقوناتُ بطاقات الأقسام/التنقّل من Font Awesome Free 7 (solid).
// مولَّدٌ تلقائيّاً بـ tools/gen-fa-icons.mjs — لا تُحرّرْه يدويّاً (npm run gen:icons).
// SVG مضمَّنةٌ (أيقوناتُنا فقط، لا الخطّ الكامل) تعمل offline؛ تُلوَّن بـ\`currentColor\` (لوحةُ كلّ بطاقة).
// الرخصة: Font Awesome Free — الأيقونات CC BY 4.0 (متوافقة مع GPL-3.0)؛ انظر docs/CREDITS.md.

export const ICONS = {
${iconsEntries}
};

// إيموجي ← اسمُ الأيقونة (لبطاقاتٍ تُرسَم من بياناتٍ تحملُ إيموجي)
export const EMOJI_ICON = {
${emojiEntries}
};

// يُرجِع SVG للأيقونة المطابقة لإيموجي (أو النصَّ كما هو إن لم تُعرَف — تدرّجٌ آمن لغير المُعيَّن مثل الحركات/الأعلام).
export function iconHtml(emoji) {
  const name = EMOJI_ICON[emoji];
  return (name && ICONS[name]) || emoji;
}

// يحقن أيقونةَ SVG في كلّ عنصرٍ يحمل data-icon (يطابق اسمَ المفتاح). تبقى الإيموجي إن لم تُعرَف الأيقونة.
export function injectIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach(el => {
    const svg = ICONS[el.getAttribute("data-icon")];
    if (svg) el.innerHTML = svg;
  });
}
`;
writeFileSync(join(ROOT, "src", "icons.js"), out);
console.log(`✅ كُتِبت ${Object.keys(MAP).length} أيقونةً + ${Object.keys(EMOJI).length} تعيينَ إيموجي → src/icons.js`);
