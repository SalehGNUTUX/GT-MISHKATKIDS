// tools/gen-audio.mjs — يولّد مقاطع نطقٍ عربية مسبقاً بمحرّك espeak-ng المثبّت على النظام،
// فيعمل النطق دون إنترنت وبنفس الجودة على كل الأجهزة (لا اعتماد على أصوات نظام الجهاز).
// المخرجات: public/tts/<hash>.mp3 + src/tts-manifest.json (نصّ → ملفّ).
// التشغيل: node tools/gen-audio.mjs   (يتطلّب espeak-ng + lame على جهاز التطوير فقط).
//
// نُغطّي المفرداتِ القصيرةَ المتكرّرة (هتافات روبو، حروف، كلمات، أرقام، حركات، قراءة).
// النصوص الطويلة (أسئلة الذكريات) ترجع وقت التشغيل إلى Web Speech API.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { allSpeakable } from "../src/vocab.js";
import { forSynthesis } from "../src/arabic-normalize.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "tts");
const MANIFEST = join(ROOT, "src", "tts-manifest.json");
const VOICE = "ar", SPEED = "140";


async function loadContent() {
  // المصدرُ الموحَّد src/vocab.js: حروف+أشكال+أسماء+كلمات+جمل+عبارات روبو.
  // أيّ محتوًى يُضاف إلى content/* أو robo-phrases ينعكس هنا وفي الاستوديو تلقائياً.
  return allSpeakable();
}

// تصحيحاتُ نطقٍ لعللِ محرّك espeak-ng (النطقُ فقط؛ مفتاحُ المانيفست يبقى النصَّ الأصليّ):
//  • «تَ» تُنطَق «ت + فتحة» (اسمَ الحركة)! نضيف تطويلًا (ـ) فتُنطَق «تا» سليمةً.
//  • حرفُ العين (A) ضعيفٌ في espeak؛ نُدخِل فونيماتٍ بعينٍ مُطالةٍ (A:) فتظهر أوضح.
const SPEAK_FIX = {
  "تَ": "تَـ",
  // العين: اسمها ومقاطعها ومدودها وكلماتها — بعينٍ مُطالةٍ A:
  "عين": "[[A:'ajn]]", "عِنَب": "[[A:'inab]]",
  "عَ": "[[A:'a]]", "عُ": "[[A:'u]]", "عِ": "[[A:'i]]",
  "عَا": "[[A:'a:]]", "عُو": "[[A:'u:]]", "عِي": "[[A:'i:]]",
  "علم": "[[A:'ilm]]", "عنب": "[[A:'inab]]", "عسل": "[[A:'asal]]",
  // الياء مع كسرة: espeak يَمُدّها (j'i:) → نقصّرها فونيميًّا
  "يِ": "[[j'i]]",
  // مدّ الألف: «آ» يُنطق اسمَه في espeak → نُدخِل ألفًا طويلة
  "آ": "[[?'a:]]",
  // تنوين فتح الألف «أً» (همزة بفتحتين) يُسقطه espeak → نفرضه «أَن»
  "أً": "[[?'an]]",
};

// أصواتٌ حلقية/لهوية ضعيفةٌ في espeak (العين A، الغين Q) — نُطيلها فونيميًّا في كل أشكالها.
const WEAK = { "ع": "A", "غ": "Q" };
const SUKUN = "ْ";
function weakFix(text) {
  const P = WEAK[text[0]]; if (!P) return null;
  const r = text.slice(1);
  const M = {
    "َ": `[[${P}:'a]]`, "ُ": `[[${P}:'u]]`, "ِ": `[[${P}:'i]]`,
    "َا": `[[${P}:'a:]]`, "ُو": `[[${P}:'u:]]`, "ِي": `[[${P}:'i:]]`,
    "ًا": `[[${P}:'an]]`, "ٌ": `[[${P}:'un]]`, "ٍ": `[[${P}:'in]]`,
    "َّ": `[[${P}::'a]]`, "ْ": `[[${P}:]]`,
  };
  return M[r] || null;
}
// النصّ المنطوق (المفتاح يبقى الأصل): تصحيحاتٌ ثابتة، ثمّ ع/غ، ثمّ السكونُ المفرد.
function spokenFor(text) {
  if (SPEAK_FIX[text]) return SPEAK_FIX[text];
  const w = weakFix(text); if (w) return w; // ع/غ بترتيب المحتوى (سلوكٌ قائم)
  // المفتاحُ يبقى الأصل؛ النطقُ بترتيبٍ صحيحٍ للشدّة + لفظ الجلالة مجرّداً.
  return forSynthesis(text);
}
function clean(text) {
  // نزع الإيموجي ورموز التشكيل الزائدة من النصّ المنطوق (لا من المفتاح).
  return spokenFor(text).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}←-⇿⬀-⯿]/gu, "").trim();
}

function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  return loadContent().then(items => {
    const manifest = {};
    let ok = 0, fail = 0;
    for (const text of items) {
      const spoken = clean(text);
      if (!spoken) continue;
      const hash = createHash("sha1").update(text).digest("hex").slice(0, 16);
      const file = hash + ".mp3";
      const wav = join("/tmp", "tts-" + hash + ".wav");
      const mp3 = join(OUT_DIR, file);
      try {
        execFileSync("espeak-ng", ["-v", VOICE, "-s", SPEED, spoken, "-w", wav], { stdio: "ignore" });
        execFileSync("lame", ["--quiet", "-V", "7", wav, mp3], { stdio: "ignore" });
        rmSync(wav, { force: true });
        manifest[text] = file;
        ok++;
      } catch (e) { fail++; console.error("✗", text, e.message); }
    }
    writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0));
    console.log(`✅ تمّ توليد ${ok} مقطعًا (${fail} فشل). المانيفست: src/tts-manifest.json`);
  });
}
main();
