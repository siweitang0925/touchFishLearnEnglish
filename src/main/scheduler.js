const schedule = require('node-schedule');
const { ipcMain } = require('electron');
const database = require('./database');

// 设置控制台编码为UTF-8
if (process.platform === 'win32') {
  process.env.LANG = 'zh_CN.UTF-8';
}

// 默认设置
const DEFAULT_SETTINGS = {
  studyInterval: 30,     // 学习间隔（分钟）
  autoStart: false,      // 开机自启
  soundEnabled: true,    // 声音提醒
  trayEnabled: true      // 系统托盘
};

// 工具函数
function shouldReviewWord(word) {
  const now = new Date();
  const nextReviewTime = new Date(word.nextReviewTime);
  return now >= nextReviewTime;
}

class StudyScheduler {
  constructor() {
    this.jobs = new Map()
    this.isRunning = false
    this.settings = DEFAULT_SETTINGS
    this.mainWindow = null
  }

  /**
   * 初始化调度器
   */
  async init(mainWindow) {
    this.mainWindow = mainWindow
    
    // 加载设置
    await this.loadSettings()
    
    // 设置IPC监听器
    this.setupIpcListeners()
    
    console.log('学习调度器初始化完成')
  }

  /**
   * 加载设置
   */
  async loadSettings() {
    console.log('=== SCHEDULER TRACE: Loading settings ===')
    console.log('Default settings:', DEFAULT_SETTINGS)
    
    try {
      const savedSettings = await database.getSetting('app_settings')
      console.log('Saved settings from database:', savedSettings)
      
      if (savedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...savedSettings }
        console.log('Final settings after merge:', this.settings)
      } else {
        console.log('No saved settings found, using defaults')
        this.settings = { ...DEFAULT_SETTINGS }
      }
      
      console.log('=== SCHEDULER TRACE: Settings loaded successfully ===')
    } catch (error) {
      console.error('=== SCHEDULER TRACE: Load settings failed ===')
      console.error('Error:', error.message)
    }
  }

  /**
   * 设置IPC监听器
   */
  setupIpcListeners() {
    // 更新设置
    ipcMain.handle('update-settings', async (event, newSettings) => {
      return await this.updateSettings(newSettings)
    })

    // 手动触发复习
    ipcMain.handle('trigger-review', async () => {
      return await this.triggerReview()
    })
  }

  /**
   * 启动学习模式
   */
  async startStudyMode() {
    if (this.isRunning) {
      return { success: false, message: '学习模式已在运行中' }
    }

    try {
      this.isRunning = true
      
      // 保存状态
      await database.saveSetting('study_mode_active', true)
      
      // 启动第一轮复习（等待设定的时间间隔）
      this.startNextReviewCycle()
      
      console.log('学习模式已启动')
      return { success: true, message: '学习模式已启动' }
    } catch (error) {
      this.isRunning = false
      console.error('启动学习模式失败:', error)
      return { success: false, message: '启动失败: ' + error.message }
    }
  }

  /**
   * 停止学习模式
   */
  async stopStudyMode() {
    if (!this.isRunning) {
      return { success: false, message: '学习模式未在运行' }
    }

    try {
      this.isRunning = false
      
      // 清除所有定时任务
      this.clearAllJobs()
      
      // 保存状态
      await database.saveSetting('study_mode_active', false)
      
      console.log('学习模式已停止')
      return { success: true, message: '学习模式已停止' }
    } catch (error) {
      console.error('停止学习模式失败:', error)
      return { success: false, message: '停止失败: ' + error.message }
    }
  }

  /**
   * 更新设置
   */
  async updateSettings(newSettings) {
    console.log('=== SCHEDULER TRACE: Updating settings ===')
    console.log('New settings:', newSettings)
    console.log('Current settings before update:', this.settings)
    
    try {
      this.settings = { ...this.settings, ...newSettings }
      console.log('Settings after merge:', this.settings)
      
      await database.saveSetting('app_settings', this.settings)
      console.log('Settings saved to database')
      
      // 如果学习模式正在运行，重新调度任务
      if (this.isRunning) {
        console.log('Study mode is running, rescheduling tasks...')
        this.clearAllJobs()
        this.startNextReviewCycle()
      } else {
        console.log('Study mode is not running, no need to reschedule')
      }
      
      console.log('=== SCHEDULER TRACE: Settings updated successfully ===')
      return { success: true, message: '设置已更新' }
    } catch (error) {
      console.error('=== SCHEDULER TRACE: Update settings failed ===')
      console.error('Error:', error.message)
      return { success: false, message: '更新失败: ' + error.message }
    }
  }

  /**
   * 启动下一轮复习周期
   */
  startNextReviewCycle() {
    if (!this.isRunning) {
      console.log('学习模式未运行，不启动复习周期')
      return
    }

    const intervalSeconds = this.settings.studyInterval || 30
    const minutes = Math.floor(intervalSeconds / 60)
    const seconds = intervalSeconds % 60
    
    console.log(`=== SCHEDULER TRACE: Starting next review cycle ===`)
    console.log(`Study interval: ${intervalSeconds} seconds (${minutes}m ${seconds}s)`)
    console.log(`Will trigger review in ${intervalSeconds} seconds`)
    
    // 清除现有任务
    this.clearAllJobs()
    
    // 创建延迟任务，等待设定的时间间隔后触发复习
    const job = schedule.scheduleJob(new Date(Date.now() + intervalSeconds * 1000), async () => {
      console.log(`=== SCHEDULER TRACE: Review cycle triggered at ${new Date().toLocaleString()} ===`)
      await this.triggerReview()
    })
    
    this.jobs.set('review', job)
    
    console.log(`复习周期已启动，将在 ${intervalSeconds} 秒后触发`)
    console.log(`Job created:`, job ? 'success' : 'failed')
    console.log(`Current jobs count:`, this.jobs.size)
  }

  /**
   * 触发复习
   */
  async triggerReview() {
    console.log('=== SCHEDULER TRACE: Triggering review ===')
    console.log('Trigger review called at:', new Date().toLocaleString())
    const startTime = Date.now()
    
    try {
      // 检查所有单词的复习时间状态
      console.log('=== SCHEDULER TRACE: Step 1 - Checking words review time status ===')
      await database.checkAllWordsReviewTime()
      console.log('=== SCHEDULER TRACE: Step 1 completed ===')
      
      // 获取需要复习的单词
      console.log('=== SCHEDULER TRACE: Step 2 - Getting words for review ===')
      const wordsForReview = await database.getWordsForReview()
      console.log('=== SCHEDULER TRACE: Step 2 completed ===')
      console.log('Words for review count:', wordsForReview.length)
      
      if (wordsForReview.length === 0) {
        console.log('=== SCHEDULER TRACE: No words need review ===')
        return { success: true, message: '没有需要复习的单词' }
      }

      // 随机选择一个单词进行复习
      console.log('=== SCHEDULER TRACE: Step 3 - Selecting random word ===')
      const randomIndex = Math.floor(Math.random() * wordsForReview.length)
      const wordToReview = wordsForReview[randomIndex]
      console.log('Selected word for review:', wordToReview.word)
      console.log('Selected word details:', {
        id: wordToReview.id,
        word: wordToReview.word,
        meaning: wordToReview.meaning,
        proficiency: wordToReview.proficiency
      })
      console.log('=== SCHEDULER TRACE: Step 3 completed ===')
      
      // 直接创建复习窗口 - 优先使用全局主进程对象
      console.log('=== SCHEDULER TRACE: Step 4 - Creating review window ===')
      console.log('Global mainProcess available:', !!global.mainProcess)
      console.log('Global mainProcess.createReviewWindow available:', !!(global.mainProcess && global.mainProcess.createReviewWindow))
      console.log('Main window available:', !!(this.mainWindow && !this.mainWindow.isDestroyed()))
      
      if (global.mainProcess && global.mainProcess.createReviewWindow) {
        console.log('=== SCHEDULER TRACE: Using global mainProcess to create review window ===')
        const reviewWindow = global.mainProcess.createReviewWindow(wordToReview)
        console.log('=== SCHEDULER TRACE: Global mainProcess.createReviewWindow called ===')
        
        // 监听复习窗口关闭事件
        if (reviewWindow) {
          reviewWindow.on('closed', () => {
            console.log('=== SCHEDULER TRACE: Review window closed, starting next cycle ===')
            this.startNextReviewCycle()
          })
        }
      } else if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        console.log('=== SCHEDULER TRACE: Creating review window via main window IPC ===')
        console.log('Main window state:', {
          isDestroyed: this.mainWindow.isDestroyed(),
          isVisible: this.mainWindow.isVisible(),
          isMinimized: this.mainWindow.isMinimized()
        })
        
        // 通过IPC调用主进程的createReviewWindow方法
        this.mainWindow.webContents.send('create-review-window', {
          word: wordToReview
        })
        console.log('=== SCHEDULER TRACE: IPC message sent successfully ===')
        
        // 注意：通过IPC创建的窗口关闭事件需要在主进程中处理
        // 这里暂时不处理，依赖主进程的窗口关闭事件
      } else {
        console.error('=== SCHEDULER TRACE: No way to create review window ===')
        console.error('Global mainProcess available:', !!global.mainProcess)
        console.error('Main window available:', !!(this.mainWindow && !this.mainWindow.isDestroyed()))
      }
      console.log('=== SCHEDULER TRACE: Step 4 completed ===')
      
      const endTime = Date.now()
      const duration = endTime - startTime
      console.log(`=== SCHEDULER TRACE: Review triggered successfully ===`)
      console.log(`Triggered word: ${wordToReview.word}`)
      console.log(`Processing time: ${duration} ms`)
      
      return { success: true, word: wordToReview }
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      console.error('=== SCHEDULER TRACE: Trigger review failed ===')
      console.error('Error:', error.message)
      console.error('Processing time:', duration, 'ms')
      return { success: false, message: '触发复习失败: ' + error.message }
    }
  }

  /**
   * 清除所有定时任务
   */
  clearAllJobs() {
    for (const [name, job] of this.jobs) {
      if (job) {
        job.cancel()
        console.log(`定时任务已取消: ${name}`)
      }
    }
    this.jobs.clear()
  }

  /**
   * 获取学习统计
   */
  async getStudyStats() {
    try {
      const stats = await database.getStudyStats()
      return {
        success: true,
        stats: {
          totalWords: stats.totalWords || 0,
          masteredWords: stats.masteredWords || 0,
          totalReviews: stats.totalReviews || 0,
          totalCorrect: stats.totalCorrect || 0,
          totalWrong: stats.totalWrong || 0,
          accuracy: stats.totalReviews > 0 
            ? Math.round((stats.totalCorrect / stats.totalReviews) * 100) 
            : 0
        }
      }
    } catch (error) {
      console.error('获取学习统计失败:', error)
      return { success: false, message: '获取统计失败: ' + error.message }
    }
  }

  /**
   * 检查应用启动时的状态
   */
  async checkStartupStatus() {
    try {
      const wasActive = await database.getSetting('study_mode_active')
      if (wasActive) {
        console.log('检测到上次学习模式未正常关闭，清理状态')
        // 清理上次的学习模式状态，不自动恢复
        await database.saveSetting('study_mode_active', false)
      }
    } catch (error) {
      console.error('检查启动状态失败:', error)
    }
  }

  /**
   * 获取调度器状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      settings: this.settings,
      jobCount: this.jobs.size
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.clearAllJobs()
    this.isRunning = false
    console.log('学习调度器已清理')
  }
}

module.exports = new StudyScheduler(); 