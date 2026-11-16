'use strict';
// التحديثُ من داخلِ التطبيق (سطح المكتب): فحصٌ ← تنزيلٌ ← تحقّقٌ ← تثبيت — بلا انتقالٍ إلى المستودع.
// منقولٌ من نهجِ GT-SALAT (electron/updates.ts) ومكيَّفٌ لـ«مِشكاة». GNU GPL v3.
//
// كلُّ الاتّصالِ هنا في **العمليّة الرئيسيّة** (لا في الواجهة)، والواجهةُ تطلبُ وتتلقّى التقدّمَ بثًّا.
// **التثبيتُ يسلكُ الطريقَ الذي رُكِّبت به هذه النسخةُ فعلًا**: صورةُ AppImage تستبدلُ نفسَها،
// وDEB/RPM تُسلَّمُ لمديرِ حزمِ النظامِ عبر `pkexec`، وشجرةُ التطويرِ تقولُ ذلك صراحةً.
// وإن تعذّر التثبيتُ التلقائيّ تبقى الحزمةُ منزَّلةً مُتحقَّقًا منها ويُعرَضُ أمرُ إتمامِها يدويًّا.
//
// الخصوصيّة: طلبٌ واحدٌ إلى واجهةِ GitHub العامّة لقراءةِ قائمةِ الإصدارات — لا يُرسَلُ أيُّ شيءٍ عن الطفلِ أو الجهاز.

const { app, net, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execFile, spawn } = require('child_process');
const { Readable, Transform } = require('stream');
const { pipeline } = require('stream/promises');

const OWNER_REPO = 'SalehGNUTUX/GT-MISHKATKIDS';
const RELEASES_API = `https://api.github.com/repos/${OWNER_REPO}/releases?per_page=20`;
const RELEASES_PAGE = `https://github.com/${OWNER_REPO}/releases/latest`;
const PKG_NAME = 'tilmithi'; // اسمُ الحزمةِ في dpkg/rpm (حقلُ name في package.json)
const UA = () => `GT-MISHKATKIDS/${app.getVersion()}`;

let cached = null;

function updatesDir() {
  const dir = path.join(app.getPath('userData'), 'updates');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ── مقارنةُ النسخ (على نسقِ semver، تقبلُ v1.8.0 و1.8 و1.8.0-beta.1) ──────────────
function parseVersion(str) {
  const m = /(\d+)\.(\d+)(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?/.exec(String(str || ''));
  if (!m) return null;
  return { num: [Number(m[1]), Number(m[2]), Number(m[3] || 0)], pre: m[4] ? m[4].split('.').filter(Boolean) : [] };
}
const versionText = v => v.num.join('.') + (v.pre.length ? `-${v.pre.join('.')}` : '');
function compareVersion(a, b) {
  for (let i = 0; i < 3; i++) if (a.num[i] !== b.num[i]) return a.num[i] - b.num[i];
  if (!a.pre.length && !b.pre.length) return 0;
  if (!a.pre.length) return 1;           // المستقرُّ أحدثُ من تجريبيِّه
  if (!b.pre.length) return -1;
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    if (i >= a.pre.length) return -1;
    if (i >= b.pre.length) return 1;
    const x = a.pre[i], y = b.pre[i], xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
    const c = xn && yn ? Number(x) - Number(y) : xn ? -1 : yn ? 1 : x < y ? -1 : x > y ? 1 : 0;
    if (c) return c;
  }
  return 0;
}
function isNewer(latest, current) {
  const a = parseVersion(latest), b = parseVersion(current);
  return !!(a && b) && compareVersion(a, b) > 0;
}

// ── كيف رُكِّبت هذه النسخة؟ ────────────────────────────────────────────────────
function run(bin, args, timeout = 15000) {
  return new Promise(resolve => execFile(bin, args, { timeout }, (err, out) => resolve(err ? null : String(out))));
}
// السؤالُ باسمِ الحزمةِ أوّلًا (سريع: قاعدةُ الحالةِ وحدها)، ثمّ بالمسار (يمسحُ قوائمَ الملفّات فقد يبطؤ).
async function ownedByName(kind) {
  if (kind === 'deb') {
    const q = await run('dpkg-query', ['-W', '-f=${Status}', PKG_NAME]);
    return !!q && q.includes('installed') && !q.includes('not-installed');
  }
  return !!(await run('rpm', ['-q', PKG_NAME]));
}
async function ownedByPath(kind, exe) {
  return !!(await run(kind === 'deb' ? 'dpkg' : 'rpm', kind === 'deb' ? ['-S', exe] : ['-qf', exe]));
}
// ملاحظة: حزمةُ RPM عندنا مُحوَّلةٌ من الـDEB عبر alien، فعلامةُ resources/package-type (إن وُجدت) لا يُوثَقُ بها
// — لذا يُسألُ rpm أوّلًا حين يوجدُ مديرُه، ثمّ dpkg.
async function detectChannel() {
  const image = process.env.APPIMAGE;
  if (image && fs.existsSync(image)) return { kind: 'appimage', target: image, ext: '.AppImage' };
  if (!app.isPackaged) return { kind: 'dev', target: process.execPath, ext: null };
  const exe = process.execPath;
  for (const kind of ['rpm', 'deb']) if (await ownedByName(kind)) return { kind, target: exe, ext: `.${kind}` };
  for (const kind of ['rpm', 'deb']) if (await ownedByPath(kind, exe)) return { kind, target: exe, ext: `.${kind}` };
  return { kind: 'unknown', target: exe, ext: null };
}

const ARCH_TOKENS = { x64: ['x86_64', 'amd64', 'x64'], arm64: ['arm64', 'aarch64'], arm: ['armv7l', 'armhf', 'armv7'] };
function pickAsset(assets, ext) {
  if (!ext) return null;
  const ofType = assets.filter(a => a.name.toLowerCase().endsWith(ext.toLowerCase()));
  if (!ofType.length) return null;
  const mine = ARCH_TOKENS[process.arch] || [];
  const others = Object.entries(ARCH_TOKENS).filter(([k]) => k !== process.arch).flatMap(([, v]) => v);
  const lc = a => a.name.toLowerCase();
  const chosen = ofType.find(a => mine.some(t => lc(a).includes(t))) || ofType.find(a => !others.some(t => lc(a).includes(t)));
  if (!chosen) return null;
  // GitHub يُرفِقُ بصمةَ كلِّ أصلٍ في حقل digest («sha256:…») — أوثقُ مصدرٍ وأقربُه.
  const d = /^sha256:([0-9a-f]{64})$/.exec(chosen.digest || '');
  return { name: chosen.name, size: chosen.size, url: chosen.browser_download_url, ...(d ? { sha256: d[1] } : {}) };
}

// بصماتُ SHA256SUMS.txt المرفقِ بالإصدار — تحقّقٌ حقيقيّ لا مطابقةُ حجمٍ وحدَها.
async function fetchChecksums(sumsUrl) {
  const map = new Map();
  if (!sumsUrl) return map;
  try {
    const res = await net.fetch(sumsUrl, { headers: { 'User-Agent': UA() } });
    if (!res.ok) return map;
    for (const line of (await res.text()).split('\n')) {
      const m = /^([0-9a-f]{64})\s+\*?(\S+)/.exec(line.trim());
      if (m) map.set(m[2], m[1]);
    }
  } catch (e) { /* بلا بصمة: يبقى فحصُ الحجم */ }
  return map;
}

// ── الفحص ────────────────────────────────────────────────────────────────────
async function checkForUpdate(opts = {}) {
  const current = app.getVersion();
  const channel = await detectChannel();
  const fallback = { current, latest: '', available: false, url: RELEASES_PAGE, notes: '', checked: false,
    tag: '', channel: channel.kind, asset: null };
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const res = await net.fetch(RELEASES_API, { signal: ctrl.signal,
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': UA() } });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();
    if (!Array.isArray(list)) throw new Error('ردٌّ غيرُ متوقَّع');
    // الأحدثُ رقمًا لا الأوّلُ في القائمة (قد يُنشَرُ إصلاحٌ لنسخةٍ قديمةٍ بعد الجديدة).
    const tagOf = r => r.tag_name || r.name || '';
    const usable = list.filter(r => !r.draft && (opts.allowPrerelease || !r.prerelease) && parseVersion(tagOf(r)))
      .sort((a, b) => compareVersion(parseVersion(tagOf(b)), parseVersion(tagOf(a))));
    const rel = usable[0];
    if (!rel) return (cached = { ...fallback, checked: true });
    const tag = tagOf(rel);
    const available = isNewer(tag, current);
    let asset = pickAsset(rel.assets || [], channel.ext);
    if (asset && available && !asset.sha256) { // احتياطٌ: ملفُّ SHA256SUMS.txt المرفق
      const sums = (rel.assets || []).find(a => a.name.toLowerCase() === 'sha256sums.txt');
      const sha256 = (await fetchChecksums(sums && sums.browser_download_url)).get(asset.name);
      if (sha256) asset = { ...asset, sha256 };
    }
    cached = { current, latest: versionText(parseVersion(tag)), available, url: rel.html_url || RELEASES_PAGE,
      notes: (rel.body || '').slice(0, 4000), checked: true, tag, channel: channel.kind, asset };
    return cached;
  } catch (e) {
    return (cached = fallback); // بلا إنترنت مثلًا — لا يستحقُّ إزعاجَ أحد
  }
}

// ── التنزيل (يُستأنَفُ بترويسة Range، ويُتحقَّقُ بالبصمة) ─────────────────────────
let activeDownload = null;
function sha256Of(file) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash('sha256');
    fs.createReadStream(file).on('data', c => h.update(c)).on('error', reject).on('end', () => resolve(h.digest('hex')));
  });
}
function pruneOldPackages(keep) {
  try {
    for (const f of fs.readdirSync(updatesDir())) if (f !== keep && f !== `${keep}.part`) fs.rmSync(path.join(updatesDir(), f), { force: true });
  } catch (e) { /* لا يمنعُ التنزيل */ }
}

async function downloadUpdate(asset, onProgress, freshRetry = false) {
  if (activeDownload) return { ok: false, error: 'ثمّةَ تنزيلٌ جارٍ بالفعل' };
  if (!asset || !/^https:\/\/github\.com\//.test(asset.url) || /[\\/]/.test(asset.name)) return { ok: false, error: 'حزمةٌ غيرُ صالحة' };
  const dest = path.join(updatesDir(), asset.name);
  const part = `${dest}.part`;

  if (fs.existsSync(dest) && fs.statSync(dest).size === asset.size) {
    if (!asset.sha256 || (await sha256Of(dest)) === asset.sha256) { pruneOldPackages(asset.name); return { ok: true, file: dest, reused: true }; }
    fs.rmSync(dest, { force: true });
  }
  let from = 0;
  if (freshRetry) fs.rmSync(part, { force: true });
  else if (fs.existsSync(part)) {
    const got = fs.statSync(part).size;
    if (got > 0 && got < asset.size) from = got; else fs.rmSync(part, { force: true });
  }

  const ctrl = new AbortController();
  activeDownload = ctrl;
  const started = Date.now();
  let received = from, resumed = false;
  try {
    const headers = { 'User-Agent': UA() };
    if (from > 0) headers.Range = `bytes=${from}-`;
    const res = await net.fetch(asset.url, { headers, signal: ctrl.signal });
    if (!res.ok || !res.body) return { ok: false, error: `HTTP ${res.status}` };
    if (from > 0 && res.status !== 206) { from = 0; received = 0; } // تُجوهِلَ المدى — من الصفر
    resumed = from > 0;
    const out = fs.createWriteStream(part, { flags: from > 0 ? 'a' : 'w' });
    // العدُّ داخلَ الأنبوبِ **والقطعةُ تُنسَخُ قبل تمريرِها**: قطعُ net.fetch إطلالاتٌ على ذاكرةٍ يُعيدُ
    // كروميوم استعمالَها، فإن تأخّرت الكتابةُ خرجَ ملفٌّ بحجمِه الصحيحِ ومحتوًى تالف (درسُ GT-SALAT).
    let last = 0;
    const meter = new Transform({
      transform(chunk, _e, cb) {
        received += chunk.length;
        const now = Date.now();
        if (now - last >= 250 || received === asset.size) {
          last = now;
          const sec = (now - started) / 1000;
          onProgress({ received, total: asset.size, percent: asset.size ? Math.min(100, received / asset.size * 100) : 0,
            bytesPerSecond: sec > 0 ? Math.round((received - from) / sec) : 0 });
        }
        cb(null, Buffer.from(chunk));
      },
    });
    await pipeline(Readable.fromWeb(res.body), meter, out);

    const size = fs.existsSync(part) ? fs.statSync(part).size : 0;
    if (asset.size && size !== asset.size) return { ok: false, error: `الحجمُ لا يطابق: ${size} بدل ${asset.size}` };
    if (asset.sha256) {
      const got = await sha256Of(part);
      if (got !== asset.sha256) {
        console.warn(`[update] بصمةُ «${asset.name}» لا تطابق — ${got} · المنشورة ${asset.sha256}`);
        fs.rmSync(part, { force: true });
        if (resumed && !freshRetry) { activeDownload = null; return downloadUpdate(asset, onProgress, true); }
        return { ok: false, error: 'البصمةُ لا تطابقُ المنشورة — حُذِفتِ الحزمة' };
      }
    }
    fs.renameSync(part, dest);
    pruneOldPackages(asset.name);
    return { ok: true, file: dest };
  } catch (e) {
    if (ctrl.signal.aborted) return { ok: false, cancelled: true }; // الجزءُ يبقى ليُستأنَف
    return { ok: false, error: e.message };
  } finally {
    activeDownload = null;
  }
}
function cancelUpdateDownload() { if (!activeDownload) return false; activeDownload.abort(); return true; }

// ── التثبيت ──────────────────────────────────────────────────────────────────
function pkexec(bin, args) {
  return new Promise(resolve => execFile('pkexec', [bin, ...args], { timeout: 10 * 60000 }, (err, _o, stderr) =>
    resolve(err ? { ok: false, error: String(stderr || err.message).trim() } : { ok: true })));
}
// يُقبَلُ التثبيتُ لملفٍّ داخلَ مجلّدِ التحديثاتِ وحدَه (لا مسارًا تمرّرُه الواجهةُ إلى أيّ مكان).
function insideUpdates(file) {
  const rel = path.relative(updatesDir(), path.resolve(String(file || '')));
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

async function installUpdate(file) {
  if (!insideUpdates(file) || !fs.existsSync(file)) return { ok: false, error: 'الحزمةُ غيرُ موجودة' };
  const ch = await detectChannel();
  if (ch.kind === 'appimage') {
    const cmd = `install -m755 "${file}" "${ch.target}"`;
    try { fs.accessSync(path.dirname(ch.target), fs.constants.W_OK); }
    catch (e) { return { ok: false, error: 'not-writable', file, manual: true, cmd }; }
    try {
      // تُكتَبُ بجانبِ القديمةِ ثمّ نقلةٌ ذرّيّة — الصورةُ الجاريةُ تبقى عاملةً لأنّها مركّبةٌ من العقدةِ القديمة.
      const staged = `${ch.target}.new`;
      fs.copyFileSync(file, staged); fs.chmodSync(staged, 0o755); fs.renameSync(staged, ch.target);
      return { ok: true, restart: true };
    } catch (e) { return { ok: false, error: e.message, file, manual: true, cmd }; }
  }
  if (ch.kind === 'deb') {
    let r = await pkexec('apt-get', ['install', '-y', '--allow-downgrades', file]);
    if (!r.ok) r = await pkexec('dpkg', ['-i', file]);
    return r.ok ? { ok: true, restart: true } : { ok: false, error: r.error, file, manual: true, cmd: `sudo apt-get install -y "${file}"` };
  }
  if (ch.kind === 'rpm') {
    for (const [bin, args] of [['dnf', ['install', '-y', file]], ['zypper', ['--non-interactive', 'install', '--allow-unsigned-rpm', file]], ['rpm', ['-U', '--force', file]]]) {
      if ((await pkexec(bin, args)).ok) return { ok: true, restart: true };
    }
    return { ok: false, error: 'تعذّرَ التثبيت', file, manual: true, cmd: `sudo rpm -U --force "${file}"` };
  }
  return { ok: false, error: ch.kind === 'dev' ? 'dev-build' : 'unknown-packaging', file, manual: true };
}

// إعادةُ التشغيلِ على النسخةِ الجديدة. AppImage لا تُعادُ بـapp.relaunch (الوسيطُ يموتُ بفكِّ التركيب)
// بل بصدفةٍ من النظامِ خارجَ الصورةِ تنتظرُ خروجَنا ثمّ تُشغِّلُ الجديدة (درسُ GT-SALAT).
function restartApp() {
  const image = process.env.APPIMAGE;
  if (image) {
    spawn('/bin/sh', ['-c', 'while kill -0 "$1" 2>/dev/null; do sleep 0.3; done; shift; exec "$@"', 'mishkat-restart',
      String(process.pid), image, ...process.argv.slice(1)], { detached: true, stdio: 'ignore' }).unref();
  } else app.relaunch();
  app.exit(0);
}
function revealPackage(file) { if (insideUpdates(file)) shell.showItemInFolder(file); }
function openReleasePage() { shell.openExternal((cached && cached.url) || RELEASES_PAGE); }

module.exports = { checkForUpdate, downloadUpdate, cancelUpdateDownload, installUpdate, restartApp, revealPackage,
  openReleasePage, detectChannel, isNewer, _internals: { parseVersion, versionText, compareVersion, pickAsset } };
