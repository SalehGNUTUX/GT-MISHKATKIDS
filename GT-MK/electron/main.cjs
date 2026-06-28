'use strict';
// مِشكاةُ الطفلِ والآليّ (GT-MISHKATKIDS) — عمليّةُ Electron الرئيسيّة (تحزيمُ سطح المكتب).
// تَلُفُّ تطبيقَ الويب المبنيَّ (dist/) في نافذةٍ محلّيّةٍ تعملُ دون إنترنت. GNU GPL v3.
const { app, BrowserWindow, shell, Menu, session } = require('electron');
const path = require('path');

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
    webPreferences: { contextIsolation: true, nodeIntegration: false, spellcheck: false },
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

app.whenReady().then(createWindow);
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
