const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendVideoPath: (path) => ipcRenderer.send('request-play', path),

  onPlayVideo: (callback) => ipcRenderer.on('play-video', (_event, videoPathList) => callback(videoPathList)),

  // 💡 修正箇所：ファイル選択ダイアログを開く関数を追加
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog')
});