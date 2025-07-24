const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const Database = require('./database');
const Scheduler = require('./scheduler');

// 设置控制台编码为UTF-8
if (process.platform === 'win32') {
  process.env.LANG = 'zh_CN.UTF-8';
}

// 应用常量
const APP_NAME = '英语学习助手';

class MainProcess {
  constructor() {
    this.mainWindow = null
    this.reviewWindow = null
    this.tray = null
    this.isQuitting = false
  }

  /**
   * 应用启动
   */
  async init() {
    // 等待应用准备就绪
    await app.whenReady()
    
    // 注册自定义协议
    this.registerCustomProtocol()
    
    // 初始化数据库
    await Database.init()
    
    // 创建主窗口
    this.createMainWindow()
    
    // 初始化学习调度器
    await Scheduler.init(this.mainWindow)
    
    // 设置全局引用，让调度器可以访问主进程
    global.mainProcess = this
    global.mainProcess.scheduler = Scheduler
    
    // 检查启动状态
    await Scheduler.checkStartupStatus()
    
    // 设置应用事件监听器
    this.setupAppEventListeners()
    
    // 设置IPC监听器
    this.setupIpcListeners()
    
    console.log('应用初始化完成')
  }

  /**
   * 注册自定义协议
   */
  registerCustomProtocol() {
    const { protocol } = require('electron')
    
    // 注册自定义协议用于访问本地文件
    protocol.registerFileProtocol('local-file', (request, callback) => {
      const filePath = request.url.replace('local-file://', '')
      callback({ path: filePath })
    })
    
    console.log('自定义协议注册完成')
  }

  /**
   * 创建主窗口
   */
  createMainWindow() {
    // 设置应用图标
    let appIcon
    try {
      const iconPath = path.join(__dirname, '../../assets/icon.png')
      appIcon = nativeImage.createFromPath(iconPath)
      console.log('应用图标加载成功:', iconPath)
    } catch (error) {
      console.log('应用图标加载失败，使用默认图标:', error.message)
      appIcon = null
    }

    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      icon: appIcon, // 设置窗口图标
      autoHideMenuBar: true, // 自动隐藏菜单栏
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false // 允许加载本地文件
      },
      show: false,
      titleBarStyle: 'default'
    })

    // 加载应用页面
    if (process.env.NODE_ENV === 'development') {
      console.log('开发模式：加载 http://localhost:5173')
      this.mainWindow.loadURL('http://localhost:5173')
      // 开发模式下不自动打开开发者工具
    } else {
      const filePath = path.join(__dirname, '../../dist/renderer/index.html')
      console.log('生产模式：加载文件', filePath)
      this.mainWindow.loadFile(filePath)
      // 生产模式下不自动打开开发者工具
    }

    // 窗口事件监听器
    this.mainWindow.once('ready-to-show', () => {
      console.log('主窗口准备显示')
      this.mainWindow.show()
    })
    
    // 添加页面加载错误处理
    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('页面加载失败:', errorCode, errorDescription, validatedURL)
    })
    
    this.mainWindow.webContents.on('did-finish-load', () => {
      console.log('页面加载完成')
    })

    this.mainWindow.on('close', (event) => {
      // 直接退出程序，不创建系统托盘
      this.isQuitting = true
      app.quit()
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  /**
   * 创建复习窗口
   */
  createReviewWindow(wordData) {
    console.log('=== MAIN PROCESS TRACE: Creating review window ===')
    console.log('Create review window called at:', new Date().toLocaleString())
    console.log('Word data:', wordData)
    console.log('Word data type:', typeof wordData)
    console.log('Word data keys:', Object.keys(wordData || {}))
    console.log('Current review window exists:', !!this.reviewWindow)
    
    if (!wordData || !wordData.word) {
      console.error('=== MAIN PROCESS TRACE: Invalid word data provided ===')
      console.error('Word data:', wordData)
      return
    }
    
    if (this.reviewWindow) {
      console.log('=== MAIN PROCESS TRACE: Review window already exists, focusing ===')
      this.reviewWindow.focus()
      return this.reviewWindow
    }

    // 设置应用图标
    let appIcon
    try {
      const iconPath = path.join(__dirname, '../../assets/icon.png')
      appIcon = nativeImage.createFromPath(iconPath)
      console.log('复习窗口图标加载成功:', iconPath)
    } catch (error) {
      console.log('复习窗口图标加载失败，使用默认图标:', error.message)
      appIcon = null
    }

    console.log('=== MAIN PROCESS TRACE: Step 1 - Creating BrowserWindow ===')
    console.log('Creating review window with dimensions: 500x600')
    this.reviewWindow = new BrowserWindow({
      width: 500,
      height: 600,
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: true,
      alwaysOnTop: true,
      skipTaskbar: false,
      modal: false,
      center: true,
      frame: false, // 无边框
      titleBarStyle: 'hidden', // 隐藏标题栏
      transparent: true, // 透明背景
      roundedCorners: true, // 启用圆角
      icon: appIcon, // 设置窗口图标
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false // 允许加载本地文件
      },
      show: false
    })
    console.log('=== MAIN PROCESS TRACE: Step 1 completed - BrowserWindow created ===')
    console.log('Review window created successfully')

    // 加载复习页面
    console.log('=== MAIN PROCESS TRACE: Step 2 - Loading review page ===')
    const wordParam = encodeURIComponent(JSON.stringify(wordData))
    console.log('Loading review page with word data:', wordData.word)
    console.log('Word parameter:', wordParam)
    console.log('Word parameter length:', wordParam.length)
    
    if (process.env.NODE_ENV === 'development') {
      const reviewUrl = `http://localhost:5173/#/review?word=${wordParam}`
      console.log('Development review URL:', reviewUrl)
      console.log('=== MAIN PROCESS TRACE: Loading development URL ===')
      this.reviewWindow.loadURL(reviewUrl)
    } else {
      const reviewUrl = `/review?word=${wordParam}`
      console.log('Production review URL:', reviewUrl)
      console.log('=== MAIN PROCESS TRACE: Loading production file ===')
      this.reviewWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'), {
        hash: reviewUrl
      })
    }
    console.log('=== MAIN PROCESS TRACE: Step 2 completed - URL loading initiated ===')

    this.reviewWindow.once('ready-to-show', () => {
      console.log('=== MAIN PROCESS TRACE: Step 3 - Review window ready to show ===')
      console.log('Review window ready to show, displaying...')
      console.log('Review window state before show:', {
        isDestroyed: this.reviewWindow.isDestroyed(),
        isVisible: this.reviewWindow.isVisible(),
        isMinimized: this.reviewWindow.isMinimized()
      })
      this.reviewWindow.show()
      this.reviewWindow.focus()
      console.log('Review window state after show:', {
        isDestroyed: this.reviewWindow.isDestroyed(),
        isVisible: this.reviewWindow.isVisible(),
        isMinimized: this.reviewWindow.isMinimized()
      })
      console.log('=== MAIN PROCESS TRACE: Step 3 completed - Review window should now be visible ===')
    })

    this.reviewWindow.on('closed', () => {
      console.log('=== MAIN PROCESS TRACE: Review window closed ===')
      console.log('Review window closed at:', new Date().toLocaleString())
      
      // 通知调度器复习窗口已关闭，可以开始下一轮
      if (global.mainProcess && global.mainProcess.scheduler) {
        console.log('=== MAIN PROCESS TRACE: Notifying scheduler of review window closure ===')
        global.mainProcess.scheduler.startNextReviewCycle()
      }
      
      this.reviewWindow = null
    })
    
    // 添加页面加载事件监听器
    this.reviewWindow.webContents.on('did-finish-load', () => {
      console.log('=== MAIN PROCESS TRACE: Step 4 - Review window page loaded successfully ===')
      console.log('Page load completed at:', new Date().toLocaleString())
    })
    
    this.reviewWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('=== MAIN PROCESS TRACE: Review window page load failed ===')
      console.error('Error code:', errorCode)
      console.error('Error description:', errorDescription)
      console.error('Failed URL:', validatedURL)
      console.error('Page load failed at:', new Date().toLocaleString())
    })
    
    // 返回窗口对象
    return this.reviewWindow
  }

  /**
   * 创建系统托盘
   */
  createTray() {
    if (this.tray) {
      this.tray.destroy()
    }

    // 创建托盘图标 - 使用应用图标
    let icon
    try {
      // 尝试使用应用图标
      const appIconPath = path.join(__dirname, '../../assets/icon.png')
      icon = nativeImage.createFromPath(appIconPath)
      console.log('使用应用图标作为托盘图标:', appIconPath)
    } catch (error) {
      console.log('应用图标不存在，使用默认图标:', error.message)
      // 使用一个简单的默认图标
      icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    }
    
    console.log('创建托盘实例...')
    this.tray = new Tray(icon)
    console.log('设置托盘提示...')
    this.tray.setToolTip(APP_NAME)

    // 创建托盘菜单
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => {
          this.showMainWindow()
        }
      },
      {
        label: '开始学习',
        click: async () => {
          await this.startStudyMode()
        }
      },
      {
        label: '停止学习',
        click: async () => {
          await this.stopStudyMode()
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          this.quitApp()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)
    
    // 托盘点击事件
    this.tray.on('click', () => {
      this.showMainWindow()
    })
    
    console.log('系统托盘创建成功')
  }

  /**
   * 显示主窗口
   */
  showMainWindow() {
    if (this.mainWindow) {
      this.mainWindow.show()
      this.mainWindow.focus()
      
      // 销毁托盘
      if (this.tray) {
        this.tray.destroy()
        this.tray = null
      }
    }
  }

  /**
   * 设置应用事件监听器
   */
  setupAppEventListeners() {
    // 当所有窗口关闭时退出应用
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.quitApp()
      }
    })

    // macOS 激活事件
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow()
      } else {
        this.showMainWindow()
      }
    })

    // 应用即将退出
    app.on('before-quit', () => {
      this.isQuitting = true
      Scheduler.cleanup()
      Database.close()
    })
  }

  /**
   * 设置IPC监听器
   */
  setupIpcListeners() {
    // 显示复习窗口
    ipcMain.on('show-review-window', (event, data) => {
      this.createReviewWindow(data.word)
    })

    // 创建复习窗口
    ipcMain.on('create-review-window', (event, data) => {
      console.log('=== IPC TRACE: Received create review window request ===')
      console.log('IPC message received at:', new Date().toLocaleString())
      console.log('Word data:', data.word)
      console.log('Word data type:', typeof data.word)
      console.log('Word data keys:', Object.keys(data.word || {}))
      this.createReviewWindow(data.word)
    })

    // 关闭复习窗口
    ipcMain.handle('close-review-window', () => {
      if (this.reviewWindow) {
        this.reviewWindow.close()
      }
      return { success: true }
    })

    // 刷新主窗口单词列表
    ipcMain.handle('refresh-main-window-words', () => {
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('refresh-words')
      }
      return { success: true }
    })

    // 更新单词学习结果
    ipcMain.handle('update-word-review', async (event, { wordId, isCorrect }) => {
      try {
        await Database.updateWordReview(wordId, isCorrect)
        return { success: true }
      } catch (error) {
        console.error('更新单词学习结果失败:', error)
        return { success: false, message: error.message }
      }
    })

    // 获取学习统计
    ipcMain.handle('get-study-stats', async () => {
      return await Scheduler.getStudyStats()
    })

    // 启动学习模式
    ipcMain.handle('start-study-mode', async () => {
      console.log('=== IPC TRACE: Received start study mode request ===')
      return await this.startStudyMode()
    })

    // 停止学习模式
    ipcMain.handle('stop-study-mode', async () => {
      console.log('=== IPC TRACE: Received stop study mode request ===')
      return await this.stopStudyMode()
    })

    // 获取调度器状态
    ipcMain.handle('get-scheduler-status', () => {
      return Scheduler.getStatus()
    })

    // 重置所有单词的复习时间
    ipcMain.handle('reset-words-review-time', async () => {
      console.log('=== IPC TRACE: Received reset words review time request ===')
      try {
        const count = await Database.resetAllWordsReviewTime()
        console.log('=== IPC TRACE: Reset words review time successful ===')
        return { success: true, message: `重置了 ${count} 个单词的复习时间` }
      } catch (error) {
        console.error('=== IPC TRACE: Reset words review time failed ===')
        console.error('Error:', error.message)
        return { success: false, message: '重置失败: ' + error.message }
      }
    })



    // 数据库操作
    ipcMain.handle('db-get-all-words', async () => {
      console.log('=== IPC TRACE: Received get all words request ===')
      const startTime = Date.now()
      
      try {
        const words = await Database.getAllWords()
        const endTime = Date.now()
        const duration = endTime - startTime
        
        console.log('=== IPC TRACE: Successfully got all words ===')
        console.log('Return data count:', words ? words.length : 0)
        console.log('IPC processing time:', duration, 'ms')
        
        return { success: true, data: words }
      } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime
        
        console.error('=== IPC TRACE: Failed to get all words ===')
        console.error('Error:', error.message)
        console.error('IPC processing time:', duration, 'ms')
        
        return { success: false, message: error.message }
      }
    })

    ipcMain.handle('db-add-word', async (event, wordData) => {
      console.log('主进程收到添加单词请求:', wordData)
      try {
        const id = await Database.addWord(wordData)
        console.log('数据库添加单词成功，ID:', id)
        return { success: true, data: { id } }
      } catch (error) {
        console.error('数据库添加单词失败:', error)
        return { success: false, message: error.message }
      }
    })

    ipcMain.handle('db-update-word', async (event, { id, wordData }) => {
      try {
        const success = await Database.updateWord(id, wordData)
        return { success }
      } catch (error) {
        return { success: false, message: error.message }
      }
    })

    ipcMain.handle('db-delete-word', async (event, id) => {
      try {
        const success = await Database.deleteWord(id)
        return { success }
      } catch (error) {
        return { success: false, message: error.message }
      }
    })

    ipcMain.handle('db-search-words', async (event, keyword) => {
      try {
        const words = await Database.searchWords(keyword)
        return { success: true, data: words }
      } catch (error) {
        return { success: false, message: error.message }
      }
    })

    // 初始化雅思词汇
    ipcMain.handle('init-ielts-words', async () => {
      console.log('开始初始化雅思词汇...')
      try {
        const ieltsWords = require('../../data/ielts-words.json')
        console.log('加载雅思词汇文件成功，共', ieltsWords.length, '个单词')
        await Database.batchInsertWords(ieltsWords)
        console.log('雅思词汇批量插入成功')
        return { success: true, message: `雅思词汇初始化完成，共添加${ieltsWords.length}个单词` }
      } catch (error) {
        console.error('初始化雅思词汇失败:', error)
        return { success: false, message: error.message }
      }
    })

    // 清空所有数据
    ipcMain.handle('clear-all-data', async () => {
      console.log('=== IPC TRACE: Received clear all data request ===')
      const startTime = Date.now()
      
      try {
        await Database.clearAllData()
        const endTime = Date.now()
        const duration = endTime - startTime
        
        console.log('=== IPC TRACE: Clear all data successful ===')
        console.log('Clear operation duration:', duration, 'ms')
        
        return { success: true, message: '所有数据已清空' }
      } catch (error) {
        const endTime = Date.now()
        const duration = endTime - startTime
        
        console.error('=== IPC TRACE: Clear all data failed ===')
        console.error('Error:', error.message)
        console.error('Clear operation duration:', duration, 'ms')
        
        return { success: false, message: '清空数据失败: ' + error.message }
      }
    })

    // 打开开发者工具
    ipcMain.handle('open-dev-tools', () => {
      if (this.mainWindow) {
        this.mainWindow.webContents.openDevTools()
      }
      return { success: true }
    })

    // 文件系统操作
    ipcMain.handle('get-app-data-path', () => {
      return app.getPath('userData')
    })

    ipcMain.handle('ensure-directory', async (event, dirPath) => {
      const fs = require('fs').promises
      try {
        await fs.mkdir(dirPath, { recursive: true })
        return { success: true }
      } catch (error) {
        console.error('创建目录失败:', error)
        return { success: false, message: error.message }
      }
    })

    ipcMain.handle('save-file', async (event, filePath, buffer) => {
      const fs = require('fs').promises
      try {
        console.log('主进程保存文件:', {
          filePath,
          bufferLength: buffer.length
        })
        
        await fs.writeFile(filePath, Buffer.from(buffer))
        
        // 验证文件是否保存成功
        const stats = await fs.stat(filePath)
        console.log('文件保存成功:', {
          filePath,
          fileSize: stats.size
        })
        
        return { success: true }
      } catch (error) {
        console.error('保存文件失败:', error)
        return { success: false, message: error.message }
      }
    })

    ipcMain.handle('delete-file', async (event, filePath) => {
      const fs = require('fs').promises
      try {
        await fs.unlink(filePath)
        return { success: true }
      } catch (error) {
        console.error('删除文件失败:', error)
        return { success: false, message: error.message }
      }
    })

    ipcMain.handle('file-exists', async (event, filePath) => {
      const fs = require('fs').promises
      try {
        await fs.access(filePath)
        return { success: true, exists: true }
      } catch (error) {
        return { success: true, exists: false }
      }
    })

    ipcMain.handle('read-directory', async (event, dirPath) => {
      const fs = require('fs').promises
      try {
        const files = await fs.readdir(dirPath)
        return { success: true, files }
      } catch (error) {
        console.error('读取目录失败:', error)
        return { success: false, message: error.message }
      }
    })
  }

  /**
   * 启动学习模式
   */
  async startStudyMode() {
    console.log('=== MAIN PROCESS TRACE: Starting study mode ===')
    const result = await Scheduler.startStudyMode()
    if (result.success) {
      console.log('学习模式启动成功，准备最小化到托盘')
      // 最小化到托盘
      if (this.mainWindow) {
        console.log('隐藏主窗口')
        this.mainWindow.hide()
        console.log('创建系统托盘')
        this.createTray()
      } else {
        console.error('主窗口不存在')
      }
      
      // 通知渲染进程学习模式状态已改变
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('study-mode-status-changed', {
          isRunning: true
        })
      }
    } else {
      console.error('学习模式启动失败:', result.message)
    }
    return result
  }

  /**
   * 停止学习模式
   */
  async stopStudyMode() {
    const result = await Scheduler.stopStudyMode()
    
    // 通知渲染进程学习模式状态已改变
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('study-mode-status-changed', {
        isRunning: false
      })
    }
    
    return result
  }

  /**
   * 退出应用
   */
  quitApp() {
    this.isQuitting = true
    app.quit()
  }
}

// 创建主进程实例并初始化
const mainProcess = new MainProcess()
// 设置为全局对象，供调度器使用
global.mainProcess = mainProcess
mainProcess.init().catch(console.error) 