// tools/check-icons.mjs — تدقيقُ الأيقونات: يكشفُ أيَّ رمزٍ يُعرَضُ خامًّا بدلَ الأيقونةِ المعتمَدة.
//   التشغيل: npm run check:icons   (يُرجِعُ خطأً إن وُجِدَ رمزٌ غيرُ معتمَد، فيصلحُ للتحقّقِ قبلَ الإصدار)
// القاعدة: كلُّ أيقونةٍ في الواجهةِ تمرُّ عبرَ ICONS/iconHtml — لا إيموجي خامّةً في بطاقةٍ أو قسم.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const icons = readFileSync(join(ROOT, "src/icons.js"), "utf8");
const MAPPED = new Set([...icons.matchAll(/"([^"]+)":\s*"[a-zA-Z_]+",/g)].map(m => m[1]));   // إيموجي → اسم
const NAMES = new Set([...icons.matchAll(/^\s*([a-zA-Z_]+):/gm)].map(m => m[1]));            // أسماءُ الأيقونات

const files = [
  ...readdirSync(ROOT).filter(f => f.endsWith(".html")).map(f => join(ROOT, f)),
  ...readdirSync(join(ROOT, "src")).filter(f => f.endsWith(".js")).map(f => join(ROOT, "src", f)),
];

let bad = 0;
const report = (file, what) => { console.error("  ❌", file.replace(ROOT + "/", ""), "→", what); bad++; };

for (const f of files) {
  const t = readFileSync(f, "utf8");
  // (1) data-icon باسمٍ غيرِ معرَّف
  for (const m of t.matchAll(/data-icon="([^"]+)"/g)) if (!NAMES.has(m[1])) report(f, `data-icon="${m[1]}"`);
  // (2) iconHtml بإيموجي غيرِ مُعيَّنة
  for (const m of t.matchAll(/iconHtml\("([^"]+)"\)/g)) if (!MAPPED.has(m[1])) report(f, `iconHtml("${m[1]}")`);
  // (3) حقولُ الأيقوناتِ في البيانات (ic:"…") — بطاقاتُ الألعابِ والأقسام
  for (const m of t.matchAll(/\bic:\s*"([^"]+)"/g)) if (!MAPPED.has(m[1])) report(f, `ic:"${m[1]}"`);
}

if (bad) { console.error(`\n❌ ${bad} رمزًا غيرَ معتمَد. أضِفْه إلى tools/gen-fa-icons.mjs (MAP + EMOJI) ثمّ npm run gen:icons.`); process.exit(1); }
console.log(`✅ كلُّ الأيقوناتِ معتمَدة (${MAPPED.size} تعيينَ إيموجي · ${NAMES.size} أيقونة).`);
