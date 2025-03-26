
const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC functions to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Function to check for notifications
  checkNotifications: () => ipcRenderer.invoke('check-notifications'),
  
  // Function to save email configuration
  saveEmailConfig: (config) => ipcRenderer.invoke('save-email-config', config)
});
