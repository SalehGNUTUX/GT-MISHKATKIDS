// Import tool — regenerates content/{sararim-stories,puzzles,quiz}.json from GT-SARARIM.
//
//   node tools/import-from-gtsararim.mjs
//
// Source: https://github.com/SalehGNUTUX/GT-SARARIM  (v2/src/data/*.ts) — GPL-3.0.
// We copy the DATA (story/puzzle/question text) verbatim and reshape it into our JSON
// schema. The text is GT-SARARIM's; the JSON field layout and the viewer pages are ours.
// See docs/CREDITS.md for the licensing implications (GPL-3.0).
//
// Requires network (fetches via the GitHub contents API, which avoids the raw.* CDN).
// This is a one-time dev tool, NOT part of the offline app build.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "content");
const UPDATED = new Date().toISOString().slice(0, 10);
const API = "https://api.github.com/repos/SalehGNUTUX/GT-SARARIM/contents/v2/src/data";

const credit = {
  source: "GT-SARARIM",
  source_url: "https://github.com/SalehGNUTUX/GT-SARARIM",
  license: "GPL-3.0",
};

async function fetchTs(name) {
  const res = await fetch(`${API}/${name}.ts?ref=main`, {
    headers: { "User-Agent": "tilmithi-import", Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`fetch ${name}: HTTP ${res.status}`);
  const json = await res.json();
  return Buffer.from(json.content, "base64").toString("utf8");
}

// Evaluate a clean single-export TS data file (`import ...; export const NAME: T[] = [...]`)
function evalArray(src) {
  src = src.replace(/import\s+\{[^}]*\}\s+from\s+'[^']*';?/g, "");
  src = src.replace(/export const \w+\s*:\s*\w+\[\]\s*=/, "return");
  return new Function(src)();
}

// Data files are ES modules (`export default {...}`) so the app loads them with a
// plain `import` under ANY static server — no bundler needed (raw, vite dev, or dist).
function write(name, key, arr, extra = {}) {
  const data = { version: 1, updated: UPDATED, ...credit, ...extra, [key]: arr };
  fs.writeFileSync(path.join(OUT, name), "export default " + JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`${name}: ${arr.length} ${key}`);
}

const [storiesSrc, puzzlesSrc, questionsSrc] = await Promise.all([
  fetchTs("stories"),
  fetchTs("puzzles"),
  fetchTs("questions"),
]);

// stories: content + textWithHarakat (identical) + MCQ exercises (option1 is the answer)
const stories = evalArray(storiesSrc).map((s) => ({
  id: s.id,
  level: s.level,
  age_band: s.ageGroup,
  category: s.category,
  title: s.title.trim(),
  text: s.content.trim(),
  questions: (s.exercises || []).map((e) => ({
    q: e.text,
    options: [e.option1, e.option2, e.option3, e.option4],
    correct: 0,
  })),
}));

// puzzles: riddle | logic, with hint + solution
const puzzles = evalArray(puzzlesSrc).map((p) => ({
  id: p.id,
  level: p.level,
  age_band: p.ageGroup,
  type: p.type,
  title: p.title,
  riddle: p.content,
  hint: p.hint,
  solution: p.solution,
}));

// quiz: MCQ (option1 is the answer)
const quiz = evalArray(questionsSrc).map((q) => ({
  id: q.id,
  level: q.level,
  age_band: q.ageGroup,
  category: q.category,
  q: q.text,
  options: [q.option1, q.option2, q.option3, q.option4],
  correct: 0,
}));

write("sararim-stories.js", "stories", stories);
write("puzzles.js", "puzzles", puzzles);
write("quiz.js", "questions", quiz);
console.log("done.");
