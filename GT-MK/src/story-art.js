// src/story-art.js — رسومُ القصصِ المصوّرةِ الأصيلة (SVG برمجيّ، محلّيٌّ بالكامل، بلا صورٍ خارجيّة).
// المفتاح = art في صفحةِ القصّة (content/stories.js)؛ يستعملُها أيضًا lang.html (الترجمات) وبازلُ الصور.
// viewBox عريض 320×200.
// v1.10 — إعادةُ تصميمٍ حديثة: عمقٌ (تدرّجاتٌ وطبقاتٌ وظلالٌ ناعمة) + شخصيّاتٌ أكبرُ بوجوهٍ معبِّرة
// (عيونٌ لامعة · حواجبُ تحملُ الشعور · خدودٌ متورّدة · فمٌ لكلِّ شعور). كلُّ مشهدٍ يُبنى بـscene(id,…)
// ومعرّفاتُ تدرّجاتِه مسبوقةٌ بمفتاحِه — فلا تتصادمُ حين تُعرَضُ عدّةُ أغلفةٍ في صفحةٍ واحدة.

const INK = "#3B2F2A";
// ── الوجه: عينان + حاجبان + فم + خدود، حولَ (0,0) بمقياسِ s ─────────────────────────────
// mood: happy · joy · sad · worried · surprised · determined · dream · calm
function face(mood = "happy", s = 1, o = {}) {
  const gx = (o.gap ?? 7) * s, er = (o.eye ?? 3.4) * s, ey = (o.ey ?? -1) * s, my = (o.my ?? 6) * s;
  const lid = mood === "dream" || mood === "joy";
  const eye = x => lid
    ? `<path d="M${x - er} ${ey} q${er} ${-er * 1.1} ${er * 2} 0" fill="none" stroke="${INK}" stroke-width="${1.5 * s}" stroke-linecap="round"/>`
    : `<ellipse cx="${x}" cy="${ey}" rx="${er}" ry="${er * (mood === "surprised" ? 1.25 : 1.12)}" fill="#fff"/>`
      + `<circle cx="${x + (o.look || 0) * s}" cy="${ey + (mood === "sad" ? er * .35 : mood === "worried" ? er * .15 : 0)}" r="${er * .62}" fill="${INK}"/>`
      + `<circle cx="${x + er * .25 + (o.look || 0) * s}" cy="${ey - er * .3}" r="${er * .24}" fill="#fff"/>`;
  const bh = ey - er * 1.75, bw = er * 1.05;
  const brow = (x, side) => {
    const t = { sad: -1.1, worried: -1.4, determined: 1.2, surprised: 0, happy: 0, joy: 0, dream: 0, calm: 0 }[mood] || 0;
    const lift = mood === "surprised" ? -er * .55 : 0;
    const inner = side * bw, outer = -side * bw;
    return `<path d="M${x + outer} ${bh + lift} L${x + inner} ${bh + lift + t * s}" stroke="${INK}" stroke-width="${1.4 * s}" stroke-linecap="round"/>`;
  };
  const mouths = {
    happy: `<path d="M${-4.5 * s} ${my} q${4.5 * s} ${4.2 * s} ${9 * s} 0" fill="none" stroke="${INK}" stroke-width="${1.5 * s}" stroke-linecap="round"/>`,
    calm: `<path d="M${-3 * s} ${my} q${3 * s} ${2.4 * s} ${6 * s} 0" fill="none" stroke="${INK}" stroke-width="${1.4 * s}" stroke-linecap="round"/>`,
    joy: `<path d="M${-5.5 * s} ${my - s} q${5.5 * s} ${8 * s} ${11 * s} 0 z" fill="#7a2f2a"/><path d="M${-2.6 * s} ${my + 3.2 * s} q${2.6 * s} ${-2 * s} ${5.2 * s} 0 q${-2.6 * s} ${2.2 * s} ${-5.2 * s} 0z" fill="#F08A8A"/>`,
    sad: `<path d="M${-4 * s} ${my + 2.5 * s} q${4 * s} ${-4 * s} ${8 * s} 0" fill="none" stroke="${INK}" stroke-width="${1.5 * s}" stroke-linecap="round"/>`,
    worried: `<path d="M${-4.5 * s} ${my + 1.5 * s} q${1.5 * s} ${-1.6 * s} ${3 * s} 0 t${3 * s} 0 t${3 * s} 0" fill="none" stroke="${INK}" stroke-width="${1.4 * s}" stroke-linecap="round"/>`,
    surprised: `<ellipse cx="0" cy="${my + s}" rx="${2.4 * s}" ry="${3 * s}" fill="#7a2f2a"/>`,
    determined: `<path d="M${-4.5 * s} ${my + s} q${4.5 * s} ${2 * s} ${9 * s} -${s}" fill="none" stroke="${INK}" stroke-width="${1.7 * s}" stroke-linecap="round"/>`,
    dream: `<path d="M${-3.5 * s} ${my} q${3.5 * s} ${3 * s} ${7 * s} 0" fill="none" stroke="${INK}" stroke-width="${1.4 * s}" stroke-linecap="round"/>`,
  };
  const cheek = o.cheek === false ? "" : `<ellipse cx="${-gx - er * .9}" cy="${my - s}" rx="${2.6 * s}" ry="${1.7 * s}" fill="#FF8FA3" opacity=".5"/><ellipse cx="${gx + er * .9}" cy="${my - s}" rx="${2.6 * s}" ry="${1.7 * s}" fill="#FF8FA3" opacity=".5"/>`;
  const tear = o.tear ? `<path d="M${gx + er * .2} ${ey + er * 1.3} q${-1.6 * s} ${3 * s} 0 ${4.4 * s} q${1.6 * s} ${-1.4 * s} 0 ${-4.4 * s}z" fill="#7EC8F2"/>` : "";
  return `${cheek}${eye(-gx)}${eye(gx)}${lid || mood === "calm" || mood === "happy" ? "" : brow(-gx, 1) + brow(gx, -1)}${mouths[mood] || mouths.happy}${tear}`;
}

// ── المشهد وأدواتُه العامّة ──────────────────────────────────────────────────────────────
// sky: [أعلى، أسفل] · defs إضافيّة · المعرّفاتُ مسبوقةٌ بـp
function scene(p, sky, body, extraDefs = "") {
  return `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><defs>`
    + `<linearGradient id="${p}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>`
    + `<radialGradient id="${p}-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF6C9"/><stop offset=".55" stop-color="#FFD25E"/><stop offset="1" stop-color="#FFB547"/></radialGradient>`
    + `<radialGradient id="${p}-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF3B0" stop-opacity=".95"/><stop offset="1" stop-color="#FFF3B0" stop-opacity="0"/></radialGradient>`
    + extraDefs + `</defs><rect width="320" height="200" fill="url(#${p}-sky)"/>${body}</svg>`;
}
const lin = (id, a, b, vertical = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const shadow = (x, y, rx, op = .18) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${rx * .22}" fill="#1d2b18" opacity="${op}"/>`;
const sun = (p, x, y, r = 20, mood = "happy") => `<circle cx="${x}" cy="${y}" r="${r * 2.1}" fill="url(#${p}-glow)"/>`
  + `<g stroke="#FFC94D" stroke-width="3" stroke-linecap="round" opacity=".85">${Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5, r1 = r + 6, r2 = r + 12;
      return `<line x1="${(x + r1 * Math.cos(a)).toFixed(1)}" y1="${(y + r1 * Math.sin(a)).toFixed(1)}" x2="${(x + r2 * Math.cos(a)).toFixed(1)}" y2="${(y + r2 * Math.sin(a)).toFixed(1)}"/>`; }).join("")}</g>`
  + `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${p}-sun)"/><g transform="translate(${x} ${y + 1})">${face(mood, r / 16, { gap: 6, eye: 2.4, my: 5 })}</g>`;
const cloud = (x, y, s = 1, c = "#fff", op = .95) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op}"><ellipse cx="0" cy="6" rx="26" ry="9" fill="${c}"/><circle cx="-10" cy="1" r="10" fill="${c}"/><circle cx="6" cy="-3" r="13" fill="${c}"/><circle cx="18" cy="3" r="8" fill="${c}"/></g>`;
// تلالٌ بطبقتَين (بعيدةٌ فاتحة، قريبةٌ أغمق) + أرض
const hills = (p, base = 150, far = "#B9E39A", near = "#8CCB63", ground = ["#9BD46E", "#6FB04A"]) =>
  `<path d="M0 ${base - 18} Q60 ${base - 52} 130 ${base - 22} T260 ${base - 30} T320 ${base - 20} V200 H0Z" fill="${far}"/>`
  + `<path d="M0 ${base - 4} Q90 ${base - 30} 180 ${base - 6} T320 ${base - 10} V200 H0Z" fill="${near}"/>`
  + `<rect y="${base}" width="320" height="${200 - base}" fill="url(#${p}-gnd)"/>`;
const gndDef = (p, a = "#9BD46E", b = "#6FB04A") => lin(`${p}-gnd`, a, b);
const tuft = (x, y, c = "#5E9E3D") => `<path d="M${x - 5} ${y} q2 -9 4 -1 q1 -11 3 -1 q2 -8 4 1z" fill="${c}"/>`;
const flower = (x, y, c = "#FF7FA0", s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 V14" stroke="#4E8F34" stroke-width="2"/><path d="M0 9 q-6 -3 -7 2 q5 2 7 -2" fill="#5FA843"/>`
  + [0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-4.5" rx="3.4" ry="5" fill="${c}" transform="rotate(${a})"/>`).join("") + `<circle r="3" fill="#FFD25E"/></g>`;
const sparkle = (x, y, s = 1, c = "#FFD25E") => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -7 Q1.4 -1.4 7 0 Q1.4 1.4 0 7 Q-1.4 1.4 -7 0 Q-1.4 -1.4 0 -7Z" fill="${c}"/>`;
const flip = (dir, body) => dir < 0 ? `<g transform="scale(-1 1)">${body}</g>` : body;

// ── الشخصيّات ───────────────────────────────────────────────────────────────────────────
// نملة: رأسٌ كبيرٌ معبِّر، جسمٌ من ثلاثِ قطع، أرجلٌ وقرونُ استشعار. (x,y) = أسفلُ الجسم
function ant(x, y, s = 1, mood = "happy", dir = 1, o = {}) {
  const body = `<g stroke="#5C2418" stroke-width="2.2" stroke-linecap="round" fill="none">
      <path d="M-14 -10 l-8 10 M-6 -10 l-2 11 M2 -10 l7 10"/></g>
    <ellipse cx="-20" cy="-17" rx="12" ry="10" fill="#B4422F"/><ellipse cx="-23" cy="-20" rx="5" ry="3" fill="#D86A55" opacity=".7"/>
    <ellipse cx="-3" cy="-16" rx="7" ry="6.5" fill="#A23A29"/>
    <g stroke="#5C2418" stroke-width="2" stroke-linecap="round" fill="none"><path d="M16 -36 q-2 -10 -10 -14 M22 -35 q4 -11 12 -12"/></g>
    <circle cx="6" cy="-50" r="2.6" fill="#5C2418"/><circle cx="34" cy="-47" r="2.6" fill="#5C2418"/>
    <circle cx="16" cy="-24" r="15" fill="#C24C36"/><ellipse cx="11" cy="-31" rx="6" ry="4" fill="#E07B63" opacity=".6"/>
    <g transform="translate(17 -23)">${face(mood, .9, { gap: 6, eye: 3.4, ...o })}</g>
    ${o.arms ? `<path d="M26 -14 q12 -4 18 -18 M24 -10 q14 2 22 -6" stroke="#5C2418" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="44" cy="-32" r="2.6" fill="#5C2418"/><circle cx="46" cy="-16" r="2.6" fill="#5C2418"/>` : ""}`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${flip(dir, body)}</g>`;
}
// فُتاتة خبز/كعكة
const crumb = (x, y, s = 1, rot = 0) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rot})"><path d="M-22 6 Q-26 -14 -6 -18 Q14 -24 22 -6 Q28 10 6 12 Q-18 16 -22 6Z" fill="#E7B266"/>
  <path d="M-22 6 Q-26 -14 -6 -18 Q14 -24 22 -6" fill="none" stroke="#C88A3C" stroke-width="2.4"/>
  <circle cx="-8" cy="-4" r="2.2" fill="#B9772F"/><circle cx="6" cy="-8" r="1.8" fill="#B9772F"/><circle cx="10" cy="3" r="2" fill="#B9772F"/><circle cx="-12" cy="6" r="1.5" fill="#B9772F"/></g>`;
// نحلة
function bee(x, y, s = 1, mood = "happy", dir = 1, o = {}) {
  const b = `<ellipse cx="-6" cy="-14" rx="10" ry="13" fill="#E6F4FF" opacity=".85" transform="rotate(-25 -6 -14)"/><ellipse cx="6" cy="-14" rx="8" ry="11" fill="#D4ECFF" opacity=".85" transform="rotate(20 6 -14)"/>
    <ellipse cx="-4" cy="0" rx="17" ry="13" fill="#FFC93C"/>
    <path d="M-12 -11 q-3 11 0 22 M-3 -13 q-3 13 0 26 M6 -12 q-3 12 0 24" stroke="#3B2F2A" stroke-width="4.2" fill="none" opacity=".9"/>
    <path d="M-21 2 l-7 2 l7 3z" fill="#3B2F2A"/>
    <circle cx="14" cy="-3" r="11" fill="#FFD95E"/>
    <path d="M17 -13 q2 -8 7 -9 M12 -13 q-1 -8 -5 -10" stroke="#3B2F2A" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="24" cy="-22" r="1.8" fill="#3B2F2A"/><circle cx="7" cy="-23" r="1.8" fill="#3B2F2A"/>
    <g transform="translate(16 -3)">${face(mood, .72, { gap: 5.5, eye: 3.2, ...o })}</g>
    ${o.carry ? `<g transform="translate(6 18)">${cell(0, 0, 7, "#FFD36A")}</g>` : ""}`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${flip(dir, b)}</g>`;
}
// خليّةُ عسلٍ سداسيّة
const hex = r => Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + i * Math.PI / 3; return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`; }).join(" ");
const cell = (x, y, r = 12, fill = "#FFC23D", empty = false) => `<g transform="translate(${x} ${y})"><polygon points="${hex(r)}" fill="${empty ? "#FFF5D6" : fill}" stroke="#D99A1E" stroke-width="2"/>${empty ? "" : `<polygon points="${hex(r * .55)}" fill="#FFE08A" opacity=".7"/>`}</g>`;
function comb(cx, cy, r, filled) {   // قرصُ عسلٍ من خلايا؛ filled = عددُ المملوءة
  const W = r * Math.sqrt(3), pos = [[0, 0], [W, 0], [-W, 0], [W / 2, r * 1.5], [-W / 2, r * 1.5], [W / 2, -r * 1.5], [-W / 2, -r * 1.5], [W * 1.5, r * 1.5], [-W * 1.5, r * 1.5], [W * 1.5, -r * 1.5], [-W * 1.5, -r * 1.5], [0, r * 3]];
  return pos.map(([dx, dy], i) => cell(cx + dx, cy + dy, r, "#FFC23D", i >= filled)).join("");
}
// سمكة
function fish(x, y, s = 1, color = "#FF8A4C", mood = "happy", dir = 1, o = {}) {
  const light = o.light || "#FFC08F";
  const b = `<path d="M24 0 L44 -16 Q40 0 44 16Z" fill="${color}"/><path d="M28 0 L42 -10 M28 0 L42 10" stroke="${light}" stroke-width="1.5"/>
    <ellipse cx="0" cy="0" rx="28" ry="20" fill="${color}"/>
    <path d="M-6 -19 Q6 -34 18 -16Z" fill="${color}"/><path d="M0 14 Q8 24 14 14Z" fill="${light}"/>
    <ellipse cx="-4" cy="5" rx="18" ry="11" fill="${light}" opacity=".55"/>
    <path d="M8 -12 q5 12 0 24 M16 -10 q4 10 0 20" stroke="${light}" stroke-width="2" fill="none" opacity=".8"/>
    <g transform="translate(-12 -3)">${face(mood, .82, { gap: 5.5, eye: 4, my: 8, ...o })}</g>`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${flip(-dir, b)}</g>`;
}
const shell = (x, y, s = 1, c = "#FFB3C7", rot = 0) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${rot})"><path d="M-12 4 Q0 -18 12 4Z" fill="${c}"/><path d="M0 4 L0 -10 M-6 4 L-3 -8 M6 4 L3 -8" stroke="#fff" stroke-width="1.4" opacity=".7"/><rect x="-4" y="3" width="8" height="4" rx="2" fill="${c}"/></g>`;
const bubble = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-opacity=".8" stroke-width="1.2"/><circle cx="${x - r * .35}" cy="${y - r * .35}" r="${r * .25}" fill="#fff" opacity=".9"/>`;
const weed = (x, y, h = 40, c = "#3FA372") => `<path d="M${x} ${y} q-9 ${-h * .3} 0 ${-h * .55} q9 ${-h * .25} -1 ${-h * .45}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M${x + 6} ${y} q8 ${-h * .25} 1 ${-h * .5}" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
// طفل (y = القدمان). pose: stand · reach (يمدُّ يدًا) · cheer (يرفعُ ذراعَيه) · hold (يحملُ أمامه)
function kid(x, y, s = 1, shirt = "#4FA3E0", mood = "happy", o = {}) {
  const pose = o.pose || "stand", skin = o.skin || "#F5C9A3", hair = o.hair || "#4A3022";
  const arms = {
    stand: `<path d="M-15 -40 q-8 12 -6 24" /><path d="M15 -40 q8 12 6 24"/>`,
    reach: `<path d="M-15 -40 q-8 12 -6 24"/><path d="M15 -40 q14 4 26 -2"/>`,
    cheer: `<path d="M-15 -40 q-10 -10 -14 -24"/><path d="M15 -40 q10 -10 14 -24"/>`,
    hold: `<path d="M-15 -40 q4 12 12 10"/><path d="M15 -40 q-4 12 -12 10"/>`,
  }[pose];
  const hands = { stand: [[-21, -16], [21, -16]], reach: [[-21, -16], [41, -42]], cheer: [[-29, -64], [29, -64]], hold: [[-3, -30], [3, -30]] }[pose];
  return `<g transform="translate(${x} ${y}) scale(${s})">
    ${shadow(0, 0, 22)}
    <path d="M-9 -20 v18 M9 -20 v18" stroke="#46567A" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="-10" cy="-1" rx="6" ry="3.4" fill="#2F3A55"/><ellipse cx="10" cy="-1" rx="6" ry="3.4" fill="#2F3A55"/>
    <g stroke="${shirt}" stroke-width="7.5" stroke-linecap="round" fill="none">${arms}</g>
    ${hands.map(([hx, hy]) => `<circle cx="${hx}" cy="${hy}" r="4.4" fill="${skin}"/>`).join("")}
    <path d="M-16 -42 Q0 -50 16 -42 L14 -18 Q0 -14 -14 -18Z" fill="${shirt}"/>
    <path d="M-6 -46 Q0 -42 6 -46" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/>
    <circle cx="0" cy="-66" r="20" fill="${skin}"/>
    <ellipse cx="-20" cy="-64" rx="3.6" ry="5" fill="${skin}"/><ellipse cx="20" cy="-64" rx="3.6" ry="5" fill="${skin}"/>
    ${o.girl ? `<path d="M-22 -64 Q-30 -40 -24 -30 Q-18 -44 -18 -62Z M22 -64 Q30 -40 24 -30 Q18 -44 18 -62Z" fill="${hair}"/><circle cx="-24" cy="-32" r="4" fill="${o.bow || "#FF6B8B"}"/><circle cx="24" cy="-32" r="4" fill="${o.bow || "#FF6B8B"}"/>` : ""}
    <path d="M-21 -66 Q-22 -90 0 -89 Q22 -90 21 -66 Q14 -80 2 -78 Q-10 -84 -21 -66Z" fill="${hair}"/>
    ${o.girl ? `<path d="M12 -84 l-9 -7 v14z M12 -84 l9 -7 v14z" fill="${o.bow || "#FF6B8B"}"/><circle cx="12" cy="-84" r="3.2" fill="${o.bow || "#FF6B8B"}"/>` : ""}
    <g transform="translate(0 -64)">${face(mood, 1.05, { gap: 7.5, eye: 3.6, my: 7, ...o })}</g>
    ${o.dirt ? `<circle cx="-21" cy="-16" r="4.6" fill="#8B6A48" opacity=".75"/><circle cx="21" cy="-16" r="4.6" fill="#8B6A48" opacity=".75"/><circle cx="-6" cy="-30" r="2.4" fill="#8B6A48" opacity=".5"/>` : ""}
  </g>`;
}
// عصفور
function bird(x, y, s = 1, color = "#7FB8E8", mood = "happy", dir = 1, o = {}) {
  const b = `<ellipse cx="0" cy="0" rx="17" ry="14" fill="${color}"/><ellipse cx="2" cy="5" rx="11" ry="8" fill="#fff" opacity=".55"/>
    <path d="M-15 -2 L-30 -10 L-27 4Z" fill="${color}"/>
    ${o.wingUp ? `<path d="M-4 -6 Q-12 -30 8 -26 Q10 -14 4 -4Z" fill="${o.wing || "#5E9DD4"}"/>` : `<path d="M-8 -2 Q2 -10 12 0 Q2 10 -8 -2Z" fill="${o.wing || "#5E9DD4"}"/>`}
    <path d="M16 -3 l9 3 l-9 4z" fill="#F7A93C"/>
    <g transform="translate(8 -4)">${face(mood, .62, { gap: 5, eye: 3.4, my: 6, cheek: o.cheek })}</g>
    <path d="M-3 13 v7 M5 13 v7" stroke="#E08A2C" stroke-width="2" stroke-linecap="round"/>
    ${o.shiver ? `<path d="M-24 -18 q3 -3 0 -6 M26 -16 q3 -3 0 -6 M-26 6 q3 -3 0 -6" stroke="#9BB7D4" stroke-width="1.6" fill="none"/>` : ""}`;
  return `<g transform="translate(${x} ${y}) scale(${s})">${flip(dir, b)}</g>`;
}
// مصباح (فانوس) بوجه — lit: 0 مطفأ · 1 خافت · 2 مشرق
function lamp(x, y, s = 1, mood = "happy", lit = 0) {
  const glass = lit ? (lit > 1 ? "#FFE680" : "#FFE9A8") : "#C9C6D6";
  const glow = lit ? `<circle cx="0" cy="-26" r="${lit > 1 ? 70 : 38}" fill="#FFE37A" opacity="${lit > 1 ? .28 : .2}"/><circle cx="0" cy="-26" r="${lit > 1 ? 42 : 24}" fill="#FFF2B3" opacity="${lit > 1 ? .45 : .3}"/>` : "";
  return `<g transform="translate(${x} ${y}) scale(${s})">${glow}
    <path d="M-12 -62 Q0 -76 12 -62" fill="none" stroke="#6B5B47" stroke-width="3.4"/>
    <rect x="-18" y="-60" width="36" height="7" rx="3" fill="#8C6C46"/>
    <path d="M-16 -53 L-19 -6 Q0 0 19 -6 L16 -53Z" fill="${glass}" stroke="#8C6C46" stroke-width="3"/>
    ${lit ? `<path d="M0 -40 q-6 8 0 14 q6 -6 0 -14z" fill="#FFB23E" opacity=".9"/>` : ""}
    <rect x="-22" y="-8" width="44" height="8" rx="3" fill="#8C6C46"/>
    <g transform="translate(0 -26)">${face(mood, 1, { gap: 7, eye: 3.6, my: 7 })}</g>
  </g>`;
}
const teddy = (x, y, s = 1, mood = "happy") => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="-12" rx="14" ry="13" fill="#B5845A"/><ellipse cx="0" cy="-9" rx="8" ry="7" fill="#E2BE93"/>
  <circle cx="-13" cy="-38" r="6" fill="#B5845A"/><circle cx="13" cy="-38" r="6" fill="#B5845A"/><circle cx="-13" cy="-38" r="3" fill="#E2BE93"/><circle cx="13" cy="-38" r="3" fill="#E2BE93"/>
  <circle cx="0" cy="-30" r="13" fill="#C2915F"/><ellipse cx="0" cy="-25" rx="6" ry="4.4" fill="#E2BE93"/><ellipse cx="0" cy="-27" rx="2.2" ry="1.6" fill="${INK}"/>
  <g transform="translate(0 -32)">${face(mood, .7, { gap: 6, eye: 3, my: 9, cheek: false })}</g></g>`;
// بذرة بوجه
const seed = (x, y, s = 1, mood = "dream") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -22 Q16 -18 15 2 Q12 20 0 20 Q-12 20 -15 2 Q-16 -18 0 -22Z" fill="#C8955A"/>
  <path d="M-8 -14 Q-12 0 -6 12" stroke="#E3B983" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
  <g transform="translate(1 0)">${face(mood, .9, { gap: 5.5, eye: 3.2, my: 6.5 })}</g></g>`;
const butterfly = (x, y, s = 1, a = "#B57BFF", b = "#FF8FB8", o = {}) => `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M0 0 Q-26 -30 -32 -6 Q-30 8 0 4Z" fill="${a}"/><path d="M0 0 Q26 -30 32 -6 Q30 8 0 4Z" fill="${a}"/>
  <path d="M0 4 Q-22 8 -20 22 Q-8 24 0 8Z" fill="${b}"/><path d="M0 4 Q22 8 20 22 Q8 24 0 8Z" fill="${b}"/>
  <circle cx="-18" cy="-8" r="5" fill="#FFE27A"/><circle cx="18" cy="-8" r="5" fill="#FFE27A"/><circle cx="-12" cy="14" r="3" fill="#7FD3FF"/><circle cx="12" cy="14" r="3" fill="#7FD3FF"/>
  <ellipse cx="0" cy="4" rx="3.4" ry="13" fill="${INK}"/><path d="M-1 -8 q-5 -9 -9 -10 M1 -8 q5 -9 9 -10" stroke="${INK}" stroke-width="1.4" fill="none"/>
  ${o.face ? `<g transform="translate(0 -6)">${face("happy", .38, { gap: 5, eye: 3, my: 6, cheek: false })}</g>` : ""}</g>`;
const magnifier = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M10 10 L24 24" stroke="#8A5A33" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="0" r="14" fill="#DDF3FF" fill-opacity=".55" stroke="#4F5B6E" stroke-width="4"/><path d="M-7 -5 q3 -6 9 -6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
// شجرة (للخلفيّات وقصّةِ البذرة)
const tree = (x, y, s = 1, crown = "#5DB15A", o = {}) => `<g transform="translate(${x} ${y}) scale(${s})">${shadow(0, 0, 40, .14)}
  <path d="M-9 0 Q-6 -40 -4 -58 L4 -58 Q6 -40 9 0Z" fill="#8B5A33"/><path d="M-2 -40 q-14 -8 -22 -20 M2 -48 q12 -6 18 -18" stroke="#8B5A33" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="-26" cy="-72" r="26" fill="${crown}"/><circle cx="26" cy="-74" r="27" fill="${crown}"/><circle cx="0" cy="-96" r="32" fill="${crown}"/>
  <circle cx="-8" cy="-104" r="13" fill="#fff" opacity=".12"/>
  ${o.fruit ? [[-22, -70], [22, -86], [6, -64], [-6, -110], [30, -60]].map(([fx, fy]) => `<circle cx="${fx}" cy="${fy}" r="5" fill="#E8534A"/>`).join("") : ""}
  ${o.face ? `<g transform="translate(0 -84)">${face(o.face, 1.15, { gap: 9, eye: 3.8, my: 9 })}</g>` : ""}</g>`;
// الجدّة: حجابٌ وثوبٌ طويلٌ ونظّارة
function grandma(x, y, s = 1, mood = "happy", o = {}) {
  const scarf = o.scarf || "#7A6BC2", dress = o.dress || "#5FA4A0", skin = "#EFC3A0";
  const arms = o.pose === "reach" ? `<path d="M-16 -50 q-6 14 -4 28"/><path d="M16 -50 q14 6 24 0"/>` : `<path d="M-16 -50 q-6 14 -4 28"/><path d="M16 -50 q6 14 4 28"/>`;
  const hands = o.pose === "reach" ? [[-20, -22], [40, -50]] : [[-20, -22], [20, -22]];
  return `<g transform="translate(${x} ${y}) scale(${s})">${shadow(0, 0, 26)}
    <path d="M-20 -56 Q0 -64 20 -56 L26 -4 Q0 4 -26 -4Z" fill="${dress}"/><path d="M-10 -56 L0 -40 L10 -56" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>
    <ellipse cx="-9" cy="-1" rx="7" ry="3.4" fill="#5A4A3C"/><ellipse cx="9" cy="-1" rx="7" ry="3.4" fill="#5A4A3C"/>
    <g stroke="${dress}" stroke-width="8" stroke-linecap="round" fill="none">${arms}</g>
    ${hands.map(([hx, hy]) => `<circle cx="${hx}" cy="${hy}" r="4.4" fill="${skin}"/>`).join("")}
    <path d="M-24 -74 Q-26 -104 0 -104 Q26 -104 24 -74 L28 -52 Q0 -42 -28 -52Z" fill="${scarf}"/>
    <ellipse cx="0" cy="-76" rx="16" ry="18" fill="${skin}"/>
    <g transform="translate(0 -76)">${face(mood, .95, { gap: 7, eye: 3.2, my: 8 })}
      <g fill="none" stroke="#6B5B47" stroke-width="1.4"><circle cx="-7" cy="-1" r="5"/><circle cx="7" cy="-1" r="5"/><path d="M-2 -1 h4"/></g>
      <path d="M-9 4 q2 2 4 0 M5 4 q2 2 4 0" stroke="#D9A07E" stroke-width="1" fill="none"/></g>
  </g>`;
}
const wateringCan = (x, y, s = 1, pour = false) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(${pour ? -28 : 0})"><path d="M-14 -16 h24 l-3 20 h-18z" fill="#4FB3A9"/><path d="M10 -10 L26 -22" stroke="#4FB3A9" stroke-width="4" stroke-linecap="round"/><ellipse cx="27" cy="-23" rx="3" ry="4" fill="#3E958C"/><path d="M-14 -12 q-10 0 -10 8 q0 8 10 8" fill="none" stroke="#3E958C" stroke-width="3"/>
  ${pour ? `<g stroke="#7EC8F2" stroke-width="1.8" stroke-linecap="round"><path d="M30 -20 l6 10 M27 -18 l3 12 M33 -22 l9 8"/></g>` : ""}</g>`;
const umbrella = (x, y, s = 1, c = "#FF6B8B", c2 = "#FFD25E") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 V48 q0 7 -7 7" stroke="#5A4A3C" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M-46 0 Q-44 -38 0 -40 Q44 -38 46 0 Q38 -8 30 0 Q22 -8 15 0 Q8 -8 0 0 Q-8 -8 -15 0 Q-22 -8 -30 0 Q-38 -8 -46 0Z" fill="${c}"/>
  <path d="M-15 0 Q-12 -30 0 -40 Q12 -30 15 0" fill="${c2}" opacity=".9"/><circle cx="0" cy="-41" r="3" fill="#5A4A3C"/></g>`;
// قطرةُ ماءٍ بوجه
const drop = (x, y, s = 1, mood = "happy") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -24 Q16 -2 14 8 Q12 20 0 20 Q-12 20 -14 8 Q-16 -2 0 -24Z" fill="#6EC3F5"/><ellipse cx="-5" cy="-2" rx="3" ry="6" fill="#fff" opacity=".6"/><g transform="translate(0 6)">${face(mood, .6, { gap: 5, eye: 3, my: 6 })}</g></g>`;
const plant = (x, y, s = 1, wilt = false) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 h28 l-4 -18 h-20z" fill="#D9784E"/><rect x="-16" y="-22" width="32" height="6" rx="2" fill="#C2653E"/>
  <path d="M0 -22 ${wilt ? "q2 -14 12 -16" : "V-48"}" stroke="#4E9A38" stroke-width="3" fill="none"/>
  ${wilt ? `<path d="M10 -38 q8 2 8 10 q-8 -2 -8 -10z M4 -30 q-10 0 -10 8 q8 0 10 -8z" fill="#A9B864"/>` : `<path d="M0 -36 q-14 -6 -16 -16 q12 2 16 16z M0 -42 q14 -6 16 -16 q-12 2 -16 16z" fill="#69BF4B"/>${flower(0, -48, "#FF7FA0", .9).replace('<path d="M0 0 V14" stroke="#4E8F34" stroke-width="2"/>', "")}`}</g>`;
const classroom = p => `<rect width="320" height="150" fill="url(#${p}-wall)"/><rect x="88" y="20" width="144" height="70" rx="5" fill="#2F5D50" stroke="#B98A5C" stroke-width="6"/>
  <path d="M110 46 q12 -12 24 0 t24 0 M180 62 h30" stroke="#E8F2EE" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/><text x="120" y="80" font-size="13" fill="#E8F2EE" font-family="sans-serif" font-weight="700">أ ب ت</text>
  <rect y="150" width="320" height="50" fill="url(#${p}-floor)"/><path d="M0 150 H320" stroke="#C9A57A" stroke-width="3"/>`;
const desk = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-32" y="-34" width="64" height="8" rx="2" fill="#C8955A"/><path d="M-28 -26 V0 M28 -26 V0" stroke="#A97B48" stroke-width="5"/></g>`;
const toy = (x, y, kind, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${{
  block: `<rect x="-9" y="-18" width="18" height="18" rx="3" fill="#FF8A65"/><text x="0" y="-5" font-size="12" font-weight="800" text-anchor="middle" fill="#fff" font-family="sans-serif">A</text>`,
  ball: `<circle cx="0" cy="-10" r="10" fill="#4FA3E0"/><path d="M-10 -10 h20 M0 -20 q-6 10 0 20" stroke="#fff" stroke-width="2" fill="none"/>`,
  car: `<rect x="-14" y="-14" width="28" height="9" rx="3" fill="#E85D75"/><path d="M-8 -14 l4 -7 h9 l4 7z" fill="#E85D75"/><circle cx="-8" cy="-4" r="4" fill="#3B3B4A"/><circle cx="8" cy="-4" r="4" fill="#3B3B4A"/>`,
  book: `<rect x="-11" y="-6" width="22" height="6" rx="1.5" fill="#7FB86A"/><rect x="-10" y="-11" width="20" height="5" rx="1.5" fill="#F6C94D"/>`,
}[kind]}</g>`;

// ── خلفيّاتٌ مشتركة ─────────────────────────────────────────────────────────────────────
const note = (x, y, s = 1, c = "#7A5CC7") => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="0" rx="4.4" ry="3.4" transform="rotate(-20)"/><path d="M3.6 -1 V-16 q6 2 8 7" stroke="${c}" stroke-width="1.8" fill="none"/></g>`;
const rain = (n, seed, c = "#9CC3E6", x0 = 0, x1 = 320, y0 = 0, y1 = 170) => Array.from({ length: n }, (_, i) => {
  const h = k => { const v = Math.sin(k * 12.9898 + seed * 78.233) * 43758.5453; return v - Math.floor(v); };
  const r = (i + h(i)) / n, r2 = h(i + 101);   // موزَّعٌ أفقيًّا بانتظامٍ مع ارتجاجٍ صغير
  const x = x0 + r * (x1 - x0), y = y0 + r2 * (y1 - y0);
  return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l-3 9" stroke="${c}" stroke-width="2" stroke-linecap="round" opacity=".8"/>`; }).join("");
const motion = (x, y, s = 1, c = "#fff") => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${c}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".85"><path d="M0 -8 h-14"/><path d="M2 0 h-20"/><path d="M0 8 h-14"/></g>`;
// غرفة: جدارٌ متدرّج + أرضيّة + نافذة (ليل/نهار)
const room = (p, night, o = {}) => `<rect width="320" height="150" fill="url(#${p}-wall)"/>
  <rect x="${o.wx ?? 214}" y="26" width="74" height="62" rx="6" fill="${night ? "#1C2448" : "#BFE6FF"}" stroke="${night ? "#55597A" : "#E6D3B5"}" stroke-width="5"/>
  <path d="M${(o.wx ?? 214) + 37} 26 v62 M${o.wx ?? 214} 57 h74" stroke="${night ? "#55597A" : "#E6D3B5"}" stroke-width="4"/>
  ${night ? `<circle cx="${(o.wx ?? 214) + 55}" cy="42" r="8" fill="#FFF3C4"/><circle cx="${(o.wx ?? 214) + 59}" cy="39" r="7" fill="#1C2448"/>${sparkle((o.wx ?? 214) + 16, 40, .5, "#FFF3C4")}${sparkle((o.wx ?? 214) + 24, 74, .4, "#FFF3C4")}` : cloud((o.wx ?? 214) + 30, 46, .55)}
  <rect y="150" width="320" height="50" fill="url(#${p}-floor)"/><path d="M0 150 H320" stroke="${night ? "#2A2440" : "#C9A57A"}" stroke-width="3"/>`;
const roomDefs = (p, night) => lin(`${p}-wall`, night ? "#2B2A4A" : "#FFF1DC", night ? "#3A3460" : "#FBE3C4") + lin(`${p}-floor`, night ? "#3A3150" : "#D9B48A", night ? "#2A2440" : "#C49A6C");
// تحتَ الماء
const seaDefs = p => lin(`${p}-sand`, "#F6E2B3", "#E9C98A") + `<linearGradient id="${p}-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
const sea = p => `<path d="M40 0 L80 0 L130 170 L70 170Z M170 0 L200 0 L240 170 L190 170Z" fill="url(#${p}-ray)"/>
  <path d="M0 168 Q80 156 160 166 T320 162 V200 H0Z" fill="url(#${p}-sand)"/>
  ${weed(24, 176, 58)}${weed(296, 178, 46, "#2E8C64")}${weed(278, 182, 34, "#4DB585")}`;


export const STORY_ART = {
"ant-1": scene("ant-1", ["#7CC8FF", "#DDF3FF"], `${sun("ant-1", 270, 42, 18)}${cloud(70, 38, .9)}${cloud(160, 26, .6, "#fff", .8)}
  ${hills("ant-1", 150)}${tuft(30, 152)}${tuft(300, 156)}${tuft(140, 160)}${flower(40, 140, "#FF7FA0")}${flower(292, 138, "#B57BFF", .9)}
  ${shadow(210, 166, 34)}${crumb(210, 150, 1.55, -6)}${sparkle(244, 112, .8)}${sparkle(178, 118, .6)}
  ${ant(112, 166, 1.25, "joy", 1, { arms: true })}`, gndDef("ant-1")),
"ant-2": scene("ant-2", ["#8AD0FF", "#E6F6FF"], `${sun("ant-2", 50, 40, 16)}${cloud(250, 34, .8)}
  <path d="M0 200 L0 168 Q120 160 240 80 Q280 58 320 56 V200Z" fill="url(#ant-2-hill)"/><path d="M0 168 Q120 160 240 80 Q280 58 320 56" fill="none" stroke="#5E9E3D" stroke-width="4"/>
  ${tuft(262, 72)}${tuft(200, 116)}${flower(300, 50, "#FFB547", .8)}
  ${crumb(48, 168, 1.15, 40)}${motion(78, 160, 1, "#5E9E3D")}<path d="M120 150 q-20 -24 -48 -4" stroke="#5E9E3D" stroke-width="2" stroke-dasharray="4 5" fill="none"/>
  ${ant(186, 126, 1.2, "determined", -1, { look: -1 })}<text x="220" y="94" font-size="14" font-weight="800" fill="#5C2418" font-family="sans-serif">!</text>`,
  lin("ant-2-hill", "#9BD46E", "#6FB04A")),
"ant-3": scene("ant-3", ["#FFB37A", "#FFE7C2"], `${sun("ant-3", 262, 70, 22, "joy")}${cloud(70, 40, .8, "#FFF4E6")}
  ${hills("ant-3", 152, "#E8C98F", "#B9D27A", ["#A9CF6E", "#7DB352"])}
  <path d="M110 160 Q160 70 210 160Z" fill="#C79A63"/><path d="M118 160 Q160 84 202 160" fill="none" stroke="#A97B48" stroke-width="3"/>
  <ellipse cx="160" cy="146" rx="15" ry="13" fill="#5A3B24"/>${crumb(160, 166, .95, 0)}
  ${ant(56, 178, 1, "joy", 1, { arms: true })}${ant(270, 180, .95, "joy", -1, { arms: true })}${ant(120, 196, .62, "happy", 1)}${ant(206, 197, .6, "joy", -1)}
  ${sparkle(120, 90, .9, "#FF7FA0")}${sparkle(206, 84, 1, "#7FD3FF")}${sparkle(160, 58, .8)}${sparkle(80, 120, .6, "#B57BFF")}${sparkle(240, 120, .7, "#FFD25E")}`,
  gndDef("ant-3", "#A9CF6E", "#7DB352")),

"seed-1": scene("seed-1", ["#9AD6FF", "#E6F6FF"], `${cloud(250, 30, .8)}${sun("seed-1", 50, 34, 14, "calm")}
  <rect y="62" width="320" height="10" fill="#7DBE55"/>${tuft(40, 64)}${tuft(120, 64)}${tuft(220, 64)}${tuft(290, 64)}
  <rect y="70" width="320" height="130" fill="url(#seed-1-soil)"/>
  ${[[30, 100], [80, 170], [250, 110], [290, 180], [200, 186], [40, 150]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4" fill="#6E4A2C" opacity=".6"/>`).join("")}
  <path d="M70 120 q14 -6 22 4 M240 150 q10 6 22 -2" stroke="#E0A2A2" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
  ${seed(150, 150, 1.5, "dream")}
  <circle cx="186" cy="120" r="4" fill="#fff" opacity=".9"/><circle cx="198" cy="106" r="6" fill="#fff" opacity=".9"/>
  <g transform="translate(244 96)"><ellipse cx="0" cy="0" rx="40" ry="28" fill="#fff" opacity=".95"/>${tree(0, 22, .3, "#5DB15A")}</g>`,
  lin("seed-1-soil", "#9C6B42", "#6E4A2C")),
"seed-2": scene("seed-2", ["#B5C9DC", "#E9F3FA"], `${cloud(80, 34, 1.3, "#E3EBF3")}${rain(16, 3, "#7FB3E0", 30, 140, 50, 110)}${sun("seed-2", 262, 40, 17)}
  <rect y="112" width="320" height="10" fill="#7DBE55"/><rect y="120" width="320" height="80" fill="url(#seed-2-soil)"/>
  ${tuft(30, 114)}${tuft(290, 114)}
  <path d="M160 160 Q158 128 160 92" stroke="#4E9A38" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M160 104 Q136 86 124 96 Q138 112 160 104Z" fill="#69BF4B"/><path d="M160 98 Q186 78 198 90 Q184 106 160 98Z" fill="#7ACF59"/>
  ${seed(160, 168, .95, "happy")}${[[140, 140], [182, 136]].map(([x, y]) => `<path d="M${x} ${y} q-3 5 0 7 q3 -2 0 -7z" fill="#7EC8F2"/>`).join("")}
  ${sparkle(206, 84, .7)}${sparkle(116, 74, .5, "#fff")}`, lin("seed-2-soil", "#9C6B42", "#6E4A2C")),
"seed-3": scene("seed-3", ["#7CC8FF", "#E3F6FF"], `${sun("seed-3", 270, 36, 16, "joy")}${cloud(60, 30, .8)}
  ${hills("seed-3", 166)}${flower(40, 160, "#FF7FA0")}${flower(290, 164, "#FFB547")}${flower(70, 170, "#B57BFF", .8)}
  ${tree(160, 180, 1.18, "#4FAE52", { fruit: true, face: "calm" })}
  <path d="M190 64 q12 8 26 0" stroke="#8B5A33" stroke-width="3" fill="none"/><path d="M196 66 q10 8 20 0z" fill="#B5845A"/>
  ${bird(206, 54, .7, "#FF8FA3", "joy", -1, { wing: "#E8708A" })}${bird(96, 66, .72, "#7FB8E8", "joy", 1, { wingUp: true })}
  ${note(232, 40, 1)}${note(120, 40, .8, "#E8708A")}${note(70, 50, .7)}`, gndDef("seed-3")),

"lamp-1": scene("lamp-1", ["#22213C", "#33304F"], `${room("lamp-1", true)}
  <rect x="30" y="118" width="70" height="32" rx="4" fill="#4A3F63"/><rect x="34" y="110" width="62" height="10" rx="3" fill="#574B73"/>
  <circle cx="160" cy="100" r="60" fill="#000" opacity=".12"/>
  ${shadow(160, 178, 28, .3)}${lamp(160, 176, 1.35, "sad", 0)}
  <path d="M196 96 q6 -6 12 0 M212 110 q6 -6 12 0" stroke="#8A86A8" stroke-width="1.6" fill="none"/>`, roomDefs("lamp-1", true)),
"lamp-2": scene("lamp-2", ["#22213C", "#33304F"], `${room("lamp-2", true, { wx: 24 })}
  ${shadow(214, 182, 24, .3)}${lamp(214, 180, 1.2, "surprised", 1)}
  ${teddy(156, 180, 1, "happy")}${sparkle(132, 140, .6, "#FFF3C4")}${sparkle(178, 134, .5, "#FFF3C4")}
  ${kid(70, 192, .92, "#E85D75", "sad", { tear: true })}`, roomDefs("lamp-2", true)),
"lamp-3": scene("lamp-3", ["#FFE7A8", "#FFF6DC"], `${room("lamp-3", false, { wx: 26 })}
  <circle cx="222" cy="110" r="120" fill="url(#lamp-3-glow)"/>
  ${shadow(232, 182, 26, .2)}${lamp(232, 180, 1.3, "joy", 2)}
  ${[[180, 60], [280, 70], [196, 140], [292, 140], [232, 36]].map(([x, y], i) => sparkle(x, y, .8 - i * .06))}
  <g>${kid(110, 192, .95, "#4FA3E0", "joy", { pose: "hold" })}${teddy(110, 178, .5, "joy")}</g>`, roomDefs("lamp-3", false)),

"fish-1": scene("fish-1", ["#4FB3E8", "#BDE8FF"], `${sea("fish-1")}
  ${shell(196, 168, 1.1, "#FFB3C7")}${shell(222, 168, 1.1, "#FFD08A")}${shell(248, 168, 1.1, "#C3B3FF")}${shell(274, 168, 1.1, "#9FE3C9")}
  ${fish(110, 96, 1.25, "#FF8A4C", "happy", 1)}${bubble(70, 70, 5)}${bubble(62, 52, 3.5)}${bubble(150, 46, 4)}
  ${fish(268, 112, .7, "#5BA7F2", "calm", -1, { light: "#A9D6FF" })}`, seaDefs("fish-1")),
"fish-2": scene("fish-2", ["#4FB3E8", "#BDE8FF"], `${sea("fish-2")}
  ${shell(150, 172, 1, "#FFB3C7", 70)}${shell(196, 160, 1, "#FFD08A", -50)}${shell(238, 174, 1, "#C3B3FF", 140)}${shell(270, 150, 1, "#9FE3C9", 30)}
  ${motion(152, 120, 1.1)}<path d="M156 150 q10 -12 22 -4 M210 140 q8 -10 18 -2" stroke="#fff" stroke-width="2" fill="none" stroke-dasharray="3 4"/>
  ${fish(110, 100, 1.25, "#FF8A4C", "worried", 1, { look: 2 })}
  <text x="74" y="56" font-size="22" font-weight="900" fill="#fff" font-family="sans-serif">!</text>${bubble(50, 80, 4)}`, seaDefs("fish-2")),
"fish-3": scene("fish-3", ["#4FB3E8", "#BDE8FF"], `${sea("fish-3")}
  ${shell(120, 170, 1.05, "#FFB3C7")}${shell(146, 170, 1.05, "#FFD08A")}${shell(172, 170, 1.05, "#C3B3FF")}${shell(198, 170, 1.05, "#9FE3C9")}
  ${fish(104, 92, 1.1, "#FF8A4C", "joy", 1)}${fish(218, 96, 1.1, "#5BA7F2", "joy", -1, { light: "#A9D6FF" })}
  <path d="M160 64 c-6 -10 -20 -4 -14 6 l14 12 l14 -12 c6 -10 -8 -16 -14 -6z" fill="#FF6B8B"/>${bubble(140, 40, 4)}${bubble(184, 34, 3)}`, seaDefs("fish-3")),

"bee-1": scene("bee-1", ["#9AD6FF", "#EAF7FF"], `${sun("bee-1", 266, 38, 16)}${cloud(70, 32, .8)}
  ${hills("bee-1", 156)}${flower(40, 150, "#FF7FA0")}${flower(70, 158, "#FFB547", .9)}${flower(286, 152, "#B57BFF")}
  <path d="M206 40 V64" stroke="#8B5A33" stroke-width="4"/>${comb(206, 82, 13, 2)}
  ${bee(122, 104, 1.3, "worried", 1, { look: 2 })}<path d="M150 74 q4 6 0 9 q-4 -3 0 -9z" fill="#7EC8F2"/>`, gndDef("bee-1")),
"bee-2": scene("bee-2", ["#9AD6FF", "#EAF7FF"], `${sun("bee-2", 270, 36, 15, "joy")}
  ${hills("bee-2", 160)}${flower(30, 154, "#FF7FA0")}${flower(296, 156, "#FFB547")}
  <path d="M168 34 V54" stroke="#8B5A33" stroke-width="4"/>${comb(168, 72, 12, 6)}
  ${bee(60, 84, 1, "happy", 1, { carry: true })}${bee(272, 98, 1, "joy", -1, { carry: true })}${bee(96, 142, .9, "happy", 1, { carry: true })}${bee(240, 150, .85, "happy", -1)}
  <path d="M84 70 q30 -26 56 -8" stroke="#fff" stroke-width="2" stroke-dasharray="3 5" fill="none"/>`, gndDef("bee-2")),
"bee-3": scene("bee-3", ["#FFD98A", "#FFF4D6"], `<circle cx="160" cy="92" r="110" fill="url(#bee-3-glow)"/>
  ${hills("bee-3", 168, "#E8D98F", "#B9D27A", ["#A9CF6E", "#7DB352"])}${flower(30, 162, "#FF7FA0")}${flower(290, 164, "#B57BFF")}
  <path d="M160 18 V38" stroke="#8B5A33" stroke-width="4"/>${comb(160, 60, 13, 12)}
  ${bee(60, 70, 1, "joy", 1)}${bee(262, 74, 1, "joy", -1)}${bee(76, 140, .9, "joy", 1)}${bee(246, 144, .9, "joy", -1)}
  ${sparkle(120, 36, .8)}${sparkle(206, 30, .9)}${sparkle(110, 110, .6, "#FF7FA0")}${sparkle(214, 116, .6, "#7FD3FF")}`, gndDef("bee-3", "#A9CF6E", "#7DB352")),

"explore-1": scene("explore-1", ["#8FD0FF", "#E6F6FF"], `${sun("explore-1", 274, 36, 15)}${cloud(150, 30, .7)}
  ${hills("explore-1", 158)}${tree(40, 160, .62, "#5DB15A")}
  ${flower(210, 168, "#FF7FA0", 1.6)}${flower(244, 172, "#FFB547", 1.2)}${tuft(280, 168)}${tuft(180, 172)}
  ${kid(130, 190, .95, "#F2A541", "happy", { pose: "reach", look: 2 })}${magnifier(176, 146, 1)}
  <path d="M224 146 q4 -4 8 0" stroke="#5E9E3D" stroke-width="1.6" fill="none"/>`, gndDef("explore-1")),
"explore-2": scene("explore-2", ["#8FD0FF", "#E6F6FF"], `${sun("explore-2", 46, 36, 14)}${cloud(250, 28, .7)}
  ${hills("explore-2", 160)}${flower(40, 166, "#FF7FA0")}${flower(290, 168, "#FFB547")}
  ${kid(108, 192, .95, "#F2A541", "surprised", { pose: "cheer" })}
  ${butterfly(222, 82, 1.45, "#B57BFF", "#FF8FB8", { face: true })}${sparkle(186, 54, .8)}${sparkle(262, 46, .7, "#FF7FA0")}${sparkle(268, 120, .6, "#7FD3FF")}
  <path d="M180 108 q20 -10 18 -32" stroke="#fff" stroke-width="2" stroke-dasharray="3 4" fill="none"/>`, gndDef("explore-2")),
"explore-3": scene("explore-3", ["#FFF1DC", "#FBE3C4"], `${room("explore-3", false, { wx: 230 })}
  <rect x="24" y="132" width="70" height="8" rx="3" fill="#B98A5C"/>${toy(42, 132, "book")}${toy(74, 132, "book", .9)}
  <g transform="translate(112 74) rotate(-4)"><rect x="-44" y="-36" width="88" height="66" rx="5" fill="#fff" stroke="#E6D3B5" stroke-width="3"/>${butterfly(0, -4, .9, "#B57BFF", "#FF8FB8")}${flower(-28, 12, "#FF7FA0", .8)}</g>
  ${kid(196, 194, .9, "#F2A541", "joy", { pose: "reach", look: -2 })}
  <g font-family="sans-serif" font-weight="900" fill="#E07A5F"><text x="256" y="128" font-size="22">؟</text><text x="284" y="108" font-size="16" fill="#7A5CC7">؟</text></g>${sparkle(290, 140, .7)}`, roomDefs("explore-3", false)),

"mercy-1": scene("mercy-1", ["#8E9AAE", "#C9D2DE"], `${cloud(70, 34, 1.4, "#AEB8C7")}${cloud(230, 26, 1.2, "#B8C1CF")}${rain(40, 7, "#E3EDF7", 0, 320, 40, 170)}
  <rect y="160" width="320" height="40" fill="#7D8B7A"/><ellipse cx="90" cy="176" rx="34" ry="5" fill="#A9B8C8" opacity=".7"/><ellipse cx="240" cy="184" rx="26" ry="4" fill="#A9B8C8" opacity=".7"/>
  <path d="M70 160 V110 M250 160 V110" stroke="#6E5A48" stroke-width="7"/><path d="M50 118 H270" stroke="#7E6A56" stroke-width="7" stroke-linecap="round"/>
  ${bird(164, 100, 1.25, "#8FA9C4", "sad", 1, { shiver: true, wing: "#7690AE" })}`),
"mercy-2": scene("mercy-2", ["#A9B6C8", "#DCE4EE"], `${cloud(250, 30, 1.1, "#C2CBD8")}${rain(14, 5, "#EEF4FA", 180, 320, 40, 150)}
  <rect y="160" width="320" height="40" fill="#86A07E"/>
  <path d="M210 160 V122" stroke="#6E5A48" stroke-width="7"/><path d="M190 128 H300" stroke="#7E6A56" stroke-width="7" stroke-linecap="round"/>
  ${bird(246, 112, 1.05, "#8FA9C4", "calm", -1, { wing: "#7690AE" })}
  <g transform="translate(232 160)"><ellipse cx="0" cy="0" rx="16" ry="5" fill="#D98C5F"/><path d="M-16 0 q16 10 32 0" fill="#C77548"/>${[-8, -3, 2, 7, -5, 4].map((x, i) => `<circle cx="${x}" cy="${-2 - (i % 2) * 2}" r="1.8" fill="#E8C873"/>`).join("")}</g>
  <g transform="translate(270 162)"><ellipse cx="0" cy="0" rx="12" ry="4" fill="#9CC9EC"/><path d="M-12 0 q12 8 24 0" fill="#7EB3DD"/></g>
  ${kid(110, 194, .95, "#5CB88A", "happy", { pose: "reach", look: 2 })}`),
"mercy-3": scene("mercy-3", ["#7CC8FF", "#E3F6FF"], `${sun("mercy-3", 270, 38, 17, "joy")}
  <g fill="none" stroke-width="7" opacity=".55"><path d="M10 170 A150 150 0 0 1 310 170" stroke="#FF7B7B"/><path d="M24 170 A136 136 0 0 1 296 170" stroke="#FFC24D"/><path d="M38 170 A122 122 0 0 1 282 170" stroke="#7ED37E"/><path d="M52 170 A108 108 0 0 1 268 170" stroke="#6FB7FF"/></g>
  ${hills("mercy-3", 164)}${flower(40, 160, "#FF7FA0")}${flower(296, 162, "#FFB547")}
  <path d="M196 164 V128" stroke="#6E5A48" stroke-width="7"/><path d="M178 134 H272" stroke="#7E6A56" stroke-width="7" stroke-linecap="round"/>
  ${bird(226, 112, 1.1, "#7FB8E8", "joy", -1, { wingUp: true })}${note(196, 84, 1)}${note(250, 76, .9, "#E8708A")}${note(220, 60, .8)}
  ${kid(106, 194, .95, "#5CB88A", "joy", { pose: "cheer" })}`, gndDef("mercy-3")),

"clean-1": scene("clean-1", ["#FFF1DC", "#FBE3C4"], `${room("clean-1", false)}
  ${toy(40, 176, "car", 1.1)}${toy(232, 184, "ball", 1.1)}${toy(70, 190, "block", 1.1)}${toy(272, 176, "block", .9)}${toy(196, 192, "book", 1.1)}
  <path d="M30 150 l14 -6 l10 8 M250 152 l18 -4" stroke="#C9A57A" stroke-width="2" fill="none"/>
  ${kid(150, 188, .98, "#9C7CE0", "worried", { dirt: true })}
  <path d="M178 90 q8 -6 14 2 q-8 4 -14 -2z" fill="#B9A08A" opacity=".6"/>`, roomDefs("clean-1", false)),
"clean-2": scene("clean-2", ["#E7F6FF", "#CDEBFA"], `<rect width="320" height="150" fill="url(#clean-2-tile)"/>
  ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 40} 0 V150" stroke="#fff" stroke-width="1.5" opacity=".6"/>`).join("")}${[50, 100].map(y => `<path d="M0 ${y} H320" stroke="#fff" stroke-width="1.5" opacity=".6"/>`).join("")}
  <rect y="150" width="320" height="50" fill="#9CC3D9"/>
  <rect x="176" y="150" width="112" height="50" fill="#DCE7EE"/><rect x="170" y="140" width="124" height="14" rx="6" fill="#F4F8FB" stroke="#C5D5E0" stroke-width="3"/><ellipse cx="200" cy="146" rx="22" ry="4" fill="#C5D5E0"/>
  <path d="M236 140 v-34 q0 -8 -10 -8 h-26" stroke="#A8B8C4" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M198 102 q-2 20 0 40" stroke="#7EC8F2" stroke-width="4" stroke-dasharray="4 3"/>
  <rect x="262" y="128" width="18" height="12" rx="3" fill="#FF9EB5"/>
  ${[[212, 128, 6], [184, 122, 4.5], [222, 108, 4], [176, 100, 5.5], [206, 84, 3.5]].map(([x, y, r]) => bubble(x, y, r)).join("")}
  ${kid(146, 196, 1, "#9C7CE0", "happy", { pose: "reach", look: 2 })}
  <rect x="36" y="150" width="62" height="34" rx="5" fill="#F2A541"/><rect x="36" y="146" width="62" height="8" rx="3" fill="#E08A2C"/>${toy(56, 150, "block", .9)}${toy(80, 148, "ball", .7)}`, lin("clean-2-tile", "#E7F6FF", "#CDEBFA")),
"clean-3": scene("clean-3", ["#FFF1DC", "#FBE3C4"], `${room("clean-3", false)}
  <rect x="26" y="98" width="110" height="8" rx="3" fill="#B98A5C"/>${toy(44, 98, "block")}${toy(70, 98, "ball", .9)}${toy(100, 98, "car", .9)}${toy(124, 98, "book", .8)}
  ${[[60, 70], [190, 50], [292, 120], [40, 140], [250, 160]].map(([x, y], i) => sparkle(x, y, .9 - i * .08, i % 2 ? "#7FD3FF" : "#FFD25E"))}
  ${kid(176, 192, 1, "#9C7CE0", "joy", { pose: "cheer" })}`, roomDefs("clean-3", false)),

// ── v1.10: قصصٌ مصوّرةٌ جديدة ───────────────────────────────────────────────────────────
"garden-1": scene("garden-1", ["#9AD6FF", "#EAF7FF"], `${sun("garden-1", 270, 36, 15)}${cloud(80, 30, .8)}
  ${hills("garden-1", 160)}<path d="M0 160 H320" stroke="#5E9E3D" stroke-width="2"/>
  ${plant(60, 178, 1, true)}${plant(100, 182, .9, true)}${plant(250, 180, 1, true)}
  ${grandma(176, 190, 1, "worried")}${wateringCan(212, 166, .95)}<path d="M150 98 q4 6 0 9 q-4 -3 0 -9z" fill="#7EC8F2"/>`, gndDef("garden-1")),
"garden-2": scene("garden-2", ["#9AD6FF", "#EAF7FF"], `${sun("garden-2", 46, 36, 15)}${cloud(240, 28, .8)}
  ${hills("garden-2", 160)}
  ${plant(196, 182, 1, true)}${plant(236, 184, .95, false)}${plant(278, 182, 1, true)}
  ${grandma(70, 190, .95, "happy")}${kid(150, 192, .9, "#E85D75", "determined", { pose: "reach", skin: "#D9A17A", hair: "#2B1E16" })}${wateringCan(194, 146, .95, true)}`, gndDef("garden-2")),
"garden-3": scene("garden-3", ["#7CC8FF", "#E3F6FF"], `${sun("garden-3", 270, 36, 16, "joy")}${cloud(70, 30, .8)}
  ${hills("garden-3", 160)}
  ${plant(206, 182, 1)}${plant(246, 184, .95)}${plant(286, 182, 1)}${flower(30, 170, "#FFB547")}
  ${grandma(78, 190, .95, "joy", { pose: "reach" })}${kid(150, 192, .9, "#E85D75", "joy", { skin: "#D9A17A", hair: "#2B1E16" })}
  <path d="M126 70 c-5 -8 -16 -3 -11 5 l11 10 l11 -10 c5 -8 -6 -13 -11 -5z" fill="#FF6B8B"/>${sparkle(178, 84, .7)}${sparkle(100, 60, .6, "#FF7FA0")}`, gndDef("garden-3")),

"umb-1": scene("umb-1", ["#8E9AAE", "#C9D2DE"], `${cloud(80, 30, 1.3, "#AEB8C7")}${cloud(240, 24, 1.1, "#B8C1CF")}${rain(34, 11, "#E3EDF7", 0, 320, 40, 170)}
  <rect y="160" width="320" height="40" fill="#7D8B7A"/><ellipse cx="160" cy="180" rx="40" ry="5" fill="#A9B8C8" opacity=".7"/>
  ${kid(96, 192, .9, "#F2A541", "worried", { girl: true, hair: "#5A3825", bow: "#FFD25E", look: 2 })}${umbrella(124, 108, .74)}
  ${kid(236, 194, .88, "#5CB88A", "sad", { girl: true, hair: "#2B1E16", skin: "#C98F6A", tear: true })}`),
"umb-2": scene("umb-2", ["#9AA6BA", "#D2DAE5"], `${cloud(70, 28, 1.2, "#B4BECC")}${cloud(250, 26, 1.1, "#BCC5D2")}${rain(28, 13, "#EEF4FA", 0, 320, 40, 170)}
  <rect y="160" width="320" height="40" fill="#86A07E"/>
  ${umbrella(160, 100, 1.05, "#FF6B8B", "#FFD25E")}
  ${kid(132, 194, .9, "#F2A541", "happy", { girl: true, hair: "#5A3825", bow: "#FFD25E" })}${kid(188, 194, .9, "#5CB88A", "happy", { girl: true, hair: "#2B1E16", skin: "#C98F6A" })}`),
"umb-3": scene("umb-3", ["#FFD0A0", "#FFF0DC"], `${sun("umb-3", 60, 44, 16, "joy")}
  <g fill="none" stroke-width="6" opacity=".5"><path d="M40 160 A120 120 0 0 1 280 160" stroke="#FF7B7B"/><path d="M52 160 A108 108 0 0 1 268 160" stroke="#FFC24D"/><path d="M64 160 A96 96 0 0 1 256 160" stroke="#7ED37E"/></g>
  <path d="M196 160 V96 L250 62 L304 96 V160Z" fill="#F6E1C3" stroke="#C99A6B" stroke-width="3"/><path d="M188 98 L250 54 L312 98" fill="none" stroke="#C0573E" stroke-width="8" stroke-linecap="round"/><rect x="238" y="118" width="24" height="42" rx="3" fill="#9C6B42"/>
  ${hills("umb-3", 164)}
  ${kid(110, 194, .9, "#F2A541", "joy", { girl: true, hair: "#5A3825", bow: "#FFD25E", pose: "cheer" })}${kid(168, 194, .9, "#5CB88A", "joy", { girl: true, hair: "#2B1E16", skin: "#C98F6A", pose: "cheer" })}
  ${umbrella(212, 186, .5)}`, gndDef("umb-3")),

"tap-1": scene("tap-1", ["#E7F6FF", "#CDEBFA"], `<rect width="320" height="150" fill="url(#tap-1-tile)"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 40} 0 V150" stroke="#fff" stroke-width="1.5" opacity=".6"/>`).join("")}
  <rect y="150" width="320" height="50" fill="#9CC3D9"/>
  <rect x="176" y="150" width="112" height="50" fill="#DCE7EE"/><rect x="170" y="140" width="124" height="14" rx="6" fill="#F4F8FB" stroke="#C5D5E0" stroke-width="3"/>
  <path d="M236 140 v-34 q0 -8 -10 -8 h-26" stroke="#A8B8C4" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M198 102 q-2 20 0 40" stroke="#4FA3E0" stroke-width="7"/>
  <path d="M200 150 q-30 10 -60 30" stroke="#7EC8F2" stroke-width="5" fill="none" opacity=".6"/>
  ${drop(150, 174, .8, "sad")}${drop(120, 186, .6, "worried")}
  ${kid(70, 194, .92, "#4FA3E0", "surprised", { look: 2 })}`, lin("tap-1-tile", "#E7F6FF", "#CDEBFA")),
"tap-2": scene("tap-2", ["#E7F6FF", "#CDEBFA"], `<rect width="320" height="150" fill="url(#tap-2-tile)"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 40} 0 V150" stroke="#fff" stroke-width="1.5" opacity=".6"/>`).join("")}
  <rect y="150" width="320" height="50" fill="#9CC3D9"/>
  <rect x="176" y="150" width="112" height="50" fill="#DCE7EE"/><rect x="170" y="140" width="124" height="14" rx="6" fill="#F4F8FB" stroke="#C5D5E0" stroke-width="3"/>
  <path d="M236 140 v-34 q0 -8 -10 -8 h-26" stroke="#A8B8C4" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M216 140 v-8" stroke="#A8B8C4" stroke-width="4"/><circle cx="216" cy="130" r="6" fill="#E85D75"/>
  ${kid(178, 196, 1, "#4FA3E0", "determined", { pose: "reach" })}
  ${drop(286, 128, .7, "happy")}<path d="M270 100 q8 -8 18 0" stroke="#4FA3E0" stroke-width="2" fill="none"/>`, lin("tap-2-tile", "#E7F6FF", "#CDEBFA")),
"tap-3": scene("tap-3", ["#9AD6FF", "#EAF7FF"], `${sun("tap-3", 266, 38, 16, "joy")}${cloud(70, 30, .8)}
  ${hills("tap-3", 160)}
  ${plant(196, 184, 1.1)}${plant(240, 186, 1)}${plant(282, 184, 1.1)}
  ${kid(90, 194, .95, "#4FA3E0", "joy", { pose: "hold" })}${wateringCan(104, 160, .8)}
  ${drop(150, 70, .8, "joy")}${drop(184, 52, .65, "joy")}${drop(124, 46, .55, "happy")}${sparkle(214, 96, .7)}`, gndDef("tap-3")),

"friend-1": scene("friend-1", ["#FFF1DC", "#FBE3C4"], `${classroom("friend-1")}
  ${desk(70, 186)}${kid(70, 196, .78, "#4FA3E0", "happy")}${desk(250, 186)}${kid(250, 196, .78, "#E85D75", "happy", { girl: true, hair: "#5A3825" })}
  ${kid(160, 196, .86, "#8C7AE6", "worried", { skin: "#C98F6A", hair: "#1E1712", look: -1 })}${desk(160, 196, 1)}
  <path d="M190 120 q6 -6 12 0 M196 132 q6 -6 12 0" stroke="#B9A08A" stroke-width="1.6" fill="none"/>`, roomDefs("friend-1", false)),
"friend-2": scene("friend-2", ["#FFF1DC", "#FBE3C4"], `${classroom("friend-2")}
  ${desk(110, 196, 1)}${kid(110, 196, .86, "#8C7AE6", "surprised", { skin: "#C98F6A", hair: "#1E1712", look: 2 })}
  ${kid(206, 194, .9, "#F2A541", "happy", { pose: "reach", look: -2 })}
  <g transform="translate(262 72)"><rect x="-56" y="-20" width="112" height="34" rx="14" fill="#fff" stroke="#E6D3B5" stroke-width="2"/><path d="M-14 14 l-10 12 l16 -12z" fill="#fff"/><text x="0" y="3" font-size="13" font-weight="800" text-anchor="middle" fill="#7A5CC7" font-family="sans-serif">السلامُ عليكم</text></g>`, roomDefs("friend-2", false)),
"friend-3": scene("friend-3", ["#8FD0FF", "#E6F6FF"], `${sun("friend-3", 272, 36, 15, "joy")}${cloud(140, 28, .8)}
  ${hills("friend-3", 160)}${tree(36, 162, .55, "#5DB15A")}
  ${kid(120, 194, .92, "#8C7AE6", "joy", { skin: "#C98F6A", hair: "#1E1712", pose: "cheer" })}${kid(200, 194, .92, "#F2A541", "joy", { pose: "cheer" })}
  ${toy(160, 128, "ball", 1.4)}${motion(150, 116, .7, "#fff")}${sparkle(160, 80, .8)}${sparkle(250, 110, .6, "#FF7FA0")}`, gndDef("friend-3")),

// «رحلةُ الأرقام» بنسقِها الأصليّ (لم يُعَدْ تصميمُها)
"numerals-1":`<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#FBF3E0"/><rect y="158" width="320" height="42" fill="#E6D6A8"/><g fill="#B59B6A"><circle cx="56" cy="168" r="10"/><circle cx="80" cy="176" r="7"/><circle cx="100" cy="166" r="9"/><circle cx="122" cy="176" r="6"/></g><rect x="150" y="92" width="120" height="74" rx="10" fill="#fff" stroke="#C7913F" stroke-width="3"/><g stroke="#8d6b3a" stroke-width="4" stroke-linecap="round"><path d="M168 108v42M182 108v42M196 108v42M210 108v42"/><path d="M162 150l54 -44"/></g><text x="44" y="84" font-size="62" fill="#E0566B" font-family="sans-serif" font-weight="bold" direction="ltr" text-anchor="start">؟</text></svg>`,
"numerals-2":`<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#EAF6FF"/><rect y="160" width="320" height="40" fill="#9ED36A"/><rect x="116" y="30" width="188" height="100" rx="10" fill="#2f5a3a" stroke="#8d6b3a" stroke-width="5"/><text x="132" y="72" font-size="28" fill="#fff" font-family="sans-serif" font-weight="bold" direction="ltr" text-anchor="start">1 2 3 4 5</text><text x="132" y="112" font-size="28" fill="#F6C84C" font-family="sans-serif" font-weight="bold" direction="ltr" text-anchor="start">6 7 8 9 0</text><rect x="40" y="100" width="54" height="60" rx="14" fill="#6FB3D6"/><path d="M45 72 q22 -26 44 0z" fill="#ECECEC"/><circle cx="67" cy="80" r="19" fill="#F0C8A8"/><path d="M48 76 a19 19 0 0 1 38 0z" fill="#ECECEC"/><circle cx="61" cy="82" r="2.2" fill="#333"/><circle cx="73" cy="82" r="2.2" fill="#333"/><path d="M61 90 q6 4 12 0" stroke="#333" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M54 92 q13 20 26 0 q-13 7 -26 0z" fill="#cfcfcf"/></svg>`,
"numerals-3":`<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#1d2740"/><g fill="#F6C84C"><path d="M58 48 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z"/><path d="M256 138 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z"/><path d="M262 52 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z"/></g><circle cx="160" cy="100" r="58" fill="none" stroke="#6FB3D6" stroke-width="16"/><circle cx="146" cy="92" r="3.4" fill="#fff"/><circle cx="174" cy="92" r="3.4" fill="#fff"/><path d="M146 112 q14 12 28 0" stroke="#9ED3FF" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
"numerals-4":`<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><rect width="320" height="200" fill="#EAF6FF"/><circle cx="160" cy="106" r="58" fill="#6FB3D6"/><g fill="#7BB661"><path d="M122 84 q22 -10 44 2 t36 -2 q-8 20 -30 18 t-44 -8z"/><path d="M132 134 q26 8 54 -4 q-6 18 -30 18 t-30 -8z"/></g><circle cx="160" cy="106" r="58" fill="none" stroke="#4a90c0" stroke-width="2"/><g font-family="sans-serif" font-weight="bold" direction="ltr" text-anchor="start"><text x="64" y="52" font-size="28" fill="#E0566B">1</text><text x="238" y="48" font-size="28" fill="#8B66B8">2</text><text x="40" y="156" font-size="28" fill="#D2941F">3</text><text x="262" y="158" font-size="28" fill="#2F9E92">0</text></g><g stroke="#C7613F" stroke-width="2.5" fill="none" stroke-dasharray="5 4"><path d="M82 56 q40 -8 70 4"/><path d="M236 56 q-18 -6 -38 2"/></g></svg>`
};
