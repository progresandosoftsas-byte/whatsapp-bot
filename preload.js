const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onWhatsAppMessage: (callback) => ipcRenderer.on('whatsapp-message', (event, msg) => callback(msg))
});
