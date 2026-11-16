'use strict';
// جسرٌ ضيّقٌ بين الواجهةِ والعمليّةِ الرئيسيّة (contextIsolation): واجهةُ التحديثِ وحدَها، لا Node.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('mishkatDesktop', {
  updates: {
    check: opts => ipcRenderer.invoke('update:check', opts || {}),
    download: asset => ipcRenderer.invoke('update:download', asset),
    cancel: () => ipcRenderer.invoke('update:cancel'),
    install: file => ipcRenderer.invoke('update:install', file),
    restart: () => ipcRenderer.invoke('update:restart'),
    reveal: file => ipcRenderer.invoke('update:reveal', file),
    openPage: () => ipcRenderer.invoke('update:open-page'),
    onProgress: cb => {
      const h = (_e, p) => cb(p);
      ipcRenderer.on('update:progress', h);
      return () => ipcRenderer.removeListener('update:progress', h);
    },
  },
});
