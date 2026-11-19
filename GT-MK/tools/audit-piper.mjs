// tools/audit-piper.mjs — تدقيقُ نطقِ Piper العربيّ على مستوى الفونيمات (v1.10).
// يقرأُ كلَّ نصوصِ مجموعةِ kareem من voices-bundled.json، ويُفنِّمُ نصَّ التركيبِ قبلَ waslFix وبعدَه
// بمُفنِّمِ Piper نفسِه، ويَعُدُّ أنماطَ الخطأ (حرفٌ مثلَّث · biaːl · همزةُ وصلٍ منطوقة). لا يُولِّدُ صوتًا.
//   node tools/audit-piper.mjs            ← الملخّصُ + أمثلة
//   node tools/audit-piper.mjs --changed  ← قائمةُ النصوصِ التي يغيّرُها waslFix (لإعادةِ توليدِ مقاطعِها)
// لماذا الفونيمات؟ Piper يقرأُ ما يُخرِجُه espeak لا الحروف؛ خطأُ الفونيماتِ يصلُ الصوتَ حتمًا (انظر pitfalls ز‑12).
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { forSynthesis, waslFix } from "../src/arabic-normalize.js";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SEP = " ";
const bundle = JSON.parse(readFileSync(join(ROOT, "src/voices-bundled.json"), "utf8"));
const texts = Object.keys(bundle.files).filter(k => k.startsWith("tts-kareem" + SEP)).map(k => k.slice(("tts-kareem" + SEP).length));
const items = texts.map(t => ({ t, old: forSynthesis(t), new: forSynthesis(waslFix(t)) }));
if (process.argv.includes("--changed")) { for (const it of items) if (it.old !== it.new) console.log(it.t); process.exit(0); }
const tmp = join(ROOT, ".piper-audit"), inF = tmp + "-in.json", outF = tmp + "-out.json";
writeFileSync(inF, JSON.stringify(items));
execFileSync(join(ROOT, ".piper-venv/bin/python"), ["-I", join(ROOT, "tools/audit_piper.py"), inF, outF, join(ROOT, "tools/piper-voices/ar_JO-kareem-medium.onnx")], { stdio: ["ignore", "inherit", "inherit"] });
const res = JSON.parse(readFileSync(outF, "utf8"));
const sum = k => res.reduce((a, r) => { for (const [p, n] of Object.entries(r[k])) a[p] = (a[p] || 0) + n; return a; }, {});
const changed = res.filter(r => r.old !== r.new);
const worse = changed.filter(r => Object.keys(r.c_new).some(p => r.c_new[p] > r.c_old[p]));
console.log(`نصوص: ${res.length} · يغيّرُها waslFix: ${changed.length}`);
console.log("الأنماطُ قبلَ:", sum("c_old"));
console.log("الأنماطُ بعدَ:", sum("c_new"));
console.log(`نصوصٌ ازدادَ فيها نمطٌ بعدَ التصحيح: ${worse.length}`);
for (const r of worse.slice(0, 10)) console.log("  ✗", r.t, "\n     ", r.ph_old, "\n   → ", r.ph_new);
for (const r of changed.slice(0, 6)) console.log("  ✓", r.t.slice(0, 50), "\n     ", r.ph_old.slice(0, 90), "\n   → ", r.ph_new.slice(0, 90));
