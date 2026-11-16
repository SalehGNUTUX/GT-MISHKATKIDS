'use strict';
// مِشكاةُ الطفلِ والآليّ (GT-MISHKATKIDS) — عمليّةُ Electron الرئيسيّة (تحزيمُ سطح المكتب).
// تَلُفُّ تطبيقَ الويب المبنيَّ (dist/) في نافذةٍ محلّيّةٍ تعملُ دون إنترنت. GNU GPL v3.
const { app, BrowserWindow, shell, Menu, session, ipcMain } = require('electron');
const path = require('path');
const updates = require('./updates.cjs'); // التحديثُ من داخلِ التطبيق (فحص/تنزيل/تثبيت)

const APP_ENTRY = path.join(__dirname, '..', 'dist', 'home.html'); // الفهرس/المُشغِّل هو المدخل
// أيقونةُ النافذة = الشعارُ الكامل (dist/icon.png 1024²)، لا الأيقونةَ المحشوّةَ icon-512 (هامشُها كبير
// لقناع PWA فيظهرُ الشعارُ صغيرًا). dist مُضمَّنٌ في asar؛ build/ ليس كذلك.
const APP_ICON = path.join(__dirname, '..', 'dist', 'icon.png');
let win = null;

function createWindow() {
  // السماحُ بالميكروفون/الكاميرا (تسجيلُ نُطق الطفل) — Electron يَحجبُها افتراضًا فيفشلُ getUserMedia.
  session.defaultSession.setPermissionRequestHandler((wc, permission, cb) => {
    cb(['media', 'microphone', 'camera', 'audioCapture', 'videoCapture'].includes(permission));
  });
  try { session.defaultSession.setPermissionCheckHandler(() => true); } catch (e) {}

  win = new BrowserWindow({
    width: 1100, height: 760, minWidth: 360, minHeight: 480,
    backgroundColor: '#FBF7EF',
    title: 'مِشكاةُ الطفلِ والآليّ',
    icon: APP_ICON,
    autoHideMenuBar: true, // لا شريطَ قوائمَ يُربك الطفل
    webPreferences: { contextIsolation: true, nodeIntegration: false, spellcheck: false,
      preload: path.join(__dirname, 'preload.cjs') },
  });
  Menu.setApplicationMenu(null);
  win.loadFile(APP_ENTRY);

  // الروابطُ الخارجيّةُ (إن وُجدت) تُفتَح في المتصفّح لا داخل التطبيق.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) { shell.openExternal(url); return { action: 'deny' }; }
    return { action: 'allow' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (/^https?:/.test(url)) { e.preventDefault(); shell.openExternal(url); }
  });
}

// قنواتُ التحديث — الواجهةُ تطلبُ، والعمليّةُ الرئيسيّةُ تتّصلُ وتنزّلُ وتثبّت.
function registerUpdateIpc() {
  ipcMain.handle('update:check', (_e, opts) => updates.checkForUpdate(opts));
  ipcMain.handle('update:download', (_e, asset) =>
    updates.downloadUpdate(asset, p => { if (win && !win.isDestroyed()) win.webContents.send('update:progress', p); }));
  ipcMain.handle('update:cancel', () => updates.cancelUpdateDownload());
  ipcMain.handle('update:install', (_e, file) => updates.installUpdate(file));
  ipcMain.handle('update:restart', () => updates.restartApp());
  ipcMain.handle('update:reveal', (_e, file) => updates.revealPackage(file));
  ipcMain.handle('update:open-page', () => updates.openReleasePage());
}

app.whenReady().then(() => { registerUpdateIpc(); createWindow(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
