const { app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');

let controllerWindow;
let playerWindow;

function createWindows() {
  // --- 1. 操作画面 (コントローラー) ---
    controllerWindow = new BrowserWindow({
        width: 600,
        height: 400,
        title: "操作画面",
        webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        },
    });
    controllerWindow.loadFile('controller.html');

    // --- 2. 映像表示画面 (プレイヤー) ---
    playerWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "サイネージ画面",
        // 実際に使う時は fullscreen: true にします
        // fullscreen: true, 
        webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false, // ローカルファイルの動画再生を許可
        },
    });
    playerWindow.loadFile('player.html');

    // ウィンドウが閉じられた時の処理（開発用）
    controllerWindow.on('closed', () => (controllerWindow = null));
    playerWindow.on('closed', () => (playerWindow = null));
    }

    // アプリ起動時の処理
    app.whenReady().then(() => {
    createWindows();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindows();
    });
    });

    app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
    });

// --- 通信の仲介 (既存のコード) ---
    ipcMain.on('request-play', (event, videoPath) => {
    console.log('受け取った動画パス:', videoPath);
    
    if (playerWindow) {
        playerWindow.webContents.send('play-video', videoPath);
    }
});

ipcMain.handle('open-file-dialog', async (event) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(controllerWindow, {
    properties: ['openFile', 'multiSelections'], // 修正: 複数選択を許可
    filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'mov'] }]
  });

  if (canceled) {
    return null;
  } else {
    return filePaths; // 修正: 複数ファイル対応
  }
});