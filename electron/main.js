
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const { startNotificationService } = require('../server/services/notificationService');

let mainWindow;
let notificationInterval;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the React app
  const startUrl = process.env.ELECTRON_START_URL || 
    `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Start the notification service
  notificationInterval = startNotificationService();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  
  // Clear the notification interval
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }
});

// IPC handlers for electron-to-React communication
ipcMain.handle('check-notifications', async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/reservations');
    return response.data;
  } catch (error) {
    console.error('Error checking notifications:', error);
    return { error: error.message };
  }
});

ipcMain.handle('save-email-config', async (event, config) => {
  try {
    // In a real app, this would securely store the email configuration
    console.log('Email configuration saved:', config);
    return { success: true };
  } catch (error) {
    console.error('Error saving email config:', error);
    return { error: error.message };
  }
});
