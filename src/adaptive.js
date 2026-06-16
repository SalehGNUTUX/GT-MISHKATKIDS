// src/adaptive.js — اختيارٌ متكيّفٌ يرجّح المهارات الضعيفة أو المستحقّة للمراجعة (لايتنر).
// محلّيّ بالكامل. يجعل الأنشطة تعيد ما لم يُتقَن بعدُ أكثر، وتخفّف ما أُتقِن.
import { getMastery, isDueForReview } from "./progress.js";

// items: عناصر؛ keyOf: دالّة تُرجِع مفتاح المهارة لكل عنصر.
// الوزن: المستحقّ للمراجعة (أو الجديد) أعلى، والأضعف صندوقًا أعلى — مع إبقاء عشوائيةٍ للتنويع.
export function pickAdaptive(items, keyOf) {
  if (!items || !items.length) return null;
  const bag = [];
  for (const it of items) {
    const k = keyOf(it);
    const m = getMastery(k);
    let w = isDueForReview(k) ? 4 : Math.max(1, 6 - m.box); // box1→5، box5→1، مستحقّ→4+
    for (let i = 0; i < w; i++) bag.push(it);
  }
  return bag[Math.floor(Math.random() * bag.length)];
}
