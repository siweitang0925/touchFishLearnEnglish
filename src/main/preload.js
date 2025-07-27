const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 学习模式控制
  startStudyMode: () => ipcRenderer.invoke('start-study-mode'),
  stopStudyMode: () => ipcRenderer.invoke('stop-study-mode'),
  getSchedulerStatus: () => ipcRenderer.invoke('get-scheduler-status'),
  updateSettings: (settings) => ipcRenderer.invoke('update-settings', settings),
  triggerReview: () => ipcRenderer.invoke('trigger-review'),

  // 复习窗口控制
  closeReviewWindow: () => ipcRenderer.invoke('close-review-window'),
  updateWordReview: (wordId, isCorrect) => 
    ipcRenderer.invoke('update-word-review', { wordId, isCorrect }),
  refreshMainWindowWords: () => ipcRenderer.invoke('refresh-main-window-words'),

  // 数据库操作
  getAllWords: () => ipcRenderer.invoke('db-get-all-words'),
  addWord: (wordData) => ipcRenderer.invoke('db-add-word', wordData),
  updateWord: (id, wordData) => ipcRenderer.invoke('db-update-word', { id, wordData }),
  deleteWord: (id) => ipcRenderer.invoke('db-delete-word', id),
  searchWords: (keyword) => ipcRenderer.invoke('db-search-words', keyword),
  initIeltsWords: () => ipcRenderer.invoke('init-ielts-words'),
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),
  resetWordsReviewTime: () => ipcRenderer.invoke('reset-words-review-time'),

  // 学习统计
  getStudyStats: () => ipcRenderer.invoke('get-study-stats'),
  getDetailedStudyStats: () => ipcRenderer.invoke('get-detailed-study-stats'),

  // 事件监听器
  onShowReviewWindow: (callback) => {
    ipcRenderer.on('show-review-window', (event, data) => callback(data))
  },
  onCreateReviewWindow: (callback) => {
    ipcRenderer.on('create-review-window', (event, data) => callback(data))
  },
  onStudyModeStatusChanged: (callback) => {
    ipcRenderer.on('study-mode-status-changed', (event, data) => callback(data))
  },
  onRefreshWords: (callback) => {
    ipcRenderer.on('refresh-words', (event) => callback())
  },

  // 移除事件监听器
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },

  // 开发者工具
  openDevTools: () => ipcRenderer.invoke('open-dev-tools'),

  // 文件系统操作
  getAppDataPath: () => ipcRenderer.invoke('get-app-data-path'),
  ensureDirectory: (path) => ipcRenderer.invoke('ensure-directory', path),
  saveFile: (filePath, buffer) => ipcRenderer.invoke('save-file', filePath, buffer),
  deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
  fileExists: (filePath) => ipcRenderer.invoke('file-exists', filePath),
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath)
}) 