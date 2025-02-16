// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose the fetchEmails function securely
contextBridge.exposeInMainWorld('electron', {
    fetchEmails: () => ipcRenderer.invoke('fetch-emails'),
    fetchLatest: () => ipcRenderer.invoke('fetch-latest'),
    openBrowser: () => ipcRenderer.invoke('open-browser'),
});
