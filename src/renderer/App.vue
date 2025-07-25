<template>
  <div id="app">
    <!-- 主应用布局 -->
    <div class="app-layout" v-if="!isReviewMode" ref="mainLayout">
      <!-- 顶部导航栏 -->
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <i class="fas fa-book-open"></i>
            英语学习助手
          </h1>
          
          <nav class="nav-menu">
            <router-link to="/" class="nav-item" active-class="active">
              <i class="fas fa-list"></i>
              生词本
            </router-link>
            <router-link to="/statistics" class="nav-item" active-class="active">
              <i class="fas fa-chart-bar"></i>
              统计
            </router-link>
            <router-link to="/settings" class="nav-item" active-class="active">
              <i class="fas fa-cog"></i>
              设置
            </router-link>
          </nav>

          <!-- 学习模式控制 -->
          <div class="study-controls">
            <button 
              v-if="!isStudyModeActive" 
              @click="startStudyMode" 
              class="study-btn start-btn"
              :disabled="startingStudy"
            >
              <i class="fas fa-play"></i>
              {{ startingStudy ? '启动中...' : '开始学习' }}
            </button>
            <button 
              v-else 
              @click="stopStudyMode" 
              class="study-btn stop-btn"
              :disabled="stoppingStudy"
            >
              <i class="fas fa-stop"></i>
              {{ stoppingStudy ? '停止中...' : '停止学习' }}
            </button>
          </div>
        </div>
      </header>

      <!-- 主内容区域 -->
      <main class="app-main">
        <router-view />
      </main>
    </div>

    <!-- 复习模式布局 -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useWordStore } from './store/wordStore.js'
import { useStudyStore } from './store/studyStore.js'
import backgroundManager from '@shared/backgroundManager.js'
import imageStorage from '@shared/imageStorage.js'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const wordStore = useWordStore()
    const studyStore = useStudyStore()

    // 响应式状态
    const startingStudy = ref(false)
    const stoppingStudy = ref(false)
    const mainLayout = ref(null)
    const cardOpacity = ref(0.9)

    // 计算属性
    const isReviewMode = computed(() => route.name === 'Review')
    const isStudyModeActive = computed(() => studyStore.isStudyModeActive)

    // 方法
    const initBackground = () => {
      // 初始化背景管理器
      backgroundManager.init()
      
      // 监听背景切换事件
      document.addEventListener('backgroundChange', handleBackgroundChange)
      
      // 立即应用当前背景
      const currentBackground = backgroundManager.getCurrentBackground()
      if (currentBackground) {
        handleBackgroundChange({ detail: { background: currentBackground } })
      }
    }

    const handleBackgroundChange = (event) => {
      const { background } = event.detail
      console.log('背景已切换:', background.name)
      
      // 应用背景到主内容区域
      const mainContent = document.querySelector('.app-main')
      if (mainContent) {
        if (background.type === 'gradient') {
          mainContent.style.background = background.value
          mainContent.style.backgroundImage = background.value
        } else if (background.type === 'image') {
          // 使用fullPath（本地图片）或原始value（网络图片）
          const imageUrl = background.fullPath || background.value
          mainContent.style.background = `url('${imageUrl}')`
          mainContent.style.backgroundImage = `url('${imageUrl}')`
        }
        mainContent.style.backgroundSize = 'cover'
        mainContent.style.backgroundPosition = 'center'
        mainContent.style.backgroundRepeat = 'no-repeat'
      }
    }

    const handleCardOpacityChange = (event) => {
      const { opacity } = event.detail
      cardOpacity.value = opacity
      console.log('卡片透明度已更新:', opacity)
      
      // 应用透明度到所有内容卡片
      applyCardOpacity(opacity)
    }

    const applyCardOpacity = (opacity) => {
      // 只针对主界面背景框的下一级内容框应用透明度
      // 即 .app-main 下的 .page-container
      const pageContainers = document.querySelectorAll('.app-main .page-container')
      
      pageContainers.forEach(container => {
        container.style.opacity = opacity
        container.style.transition = 'opacity 0.3s ease'
      })
    }

    const startStudyMode = async () => {
      startingStudy.value = true
      try {
        const result = await window.electronAPI.startStudyMode()
        if (result.success) {
          studyStore.setStudyModeActive(true)
          // 显示成功消息
          console.log('学习模式已启动')
        } else {
          console.error('启动学习模式失败:', result.message)
        }
      } catch (error) {
        console.error('启动学习模式出错:', error)
      } finally {
        startingStudy.value = false
      }
    }

    const stopStudyMode = async () => {
      stoppingStudy.value = true
      try {
        const result = await window.electronAPI.stopStudyMode()
        if (result.success) {
          studyStore.setStudyModeActive(false)
          console.log('学习模式已停止')
        } else {
          console.error('停止学习模式失败:', result.message)
        }
      } catch (error) {
        console.error('停止学习模式出错:', error)
      } finally {
        stoppingStudy.value = false
      }
    }

    // 生命周期
    onMounted(async () => {
      console.log('=== APP TRACE: Vue app mounted, starting initialization ===')
      const appStartTime = Date.now()
      
      // 加载透明度设置
      const settings = JSON.parse(localStorage.getItem('backgroundSettings') || '{}')
      cardOpacity.value = settings.cardOpacity || 0.9
      
      // 监听透明度变化事件
      document.addEventListener('cardOpacityChange', handleCardOpacityChange)
      
      // 初始化时应用透明度设置
      setTimeout(() => {
        applyCardOpacity(cardOpacity.value)
      }, 100)
      
      try {
        // 初始化图片存储系统
        console.log('Initializing image storage system...')
        await imageStorage.init()
      } catch (error) {
        console.error('图片存储初始化失败，继续其他初始化:', error)
      }
      
      try {
        // 初始化背景系统
        console.log('Initializing background system...')
        initBackground()
      } catch (error) {
        console.error('背景系统初始化失败:', error)
      }
      
      try {
        // 初始化数据
        console.log('Start loading word data...')
        await wordStore.loadWords()
      
        // 检查是否需要初始化雅思词汇（仅在首次启动时自动初始化）
        if (wordStore.words.length === 0 && !wordStore.initialized) {
          console.log('=== APP TRACE: Word list is empty and not initialized, auto-initializing IELTS words ===')
          try {
            const result = await wordStore.initIeltsWords()
            if (result.success) {
              console.log('=== APP TRACE: IELTS words auto-initialization successful ===')
            } else {
              console.error('=== APP TRACE: IELTS words auto-initialization failed ===')
              console.error('Error:', result.message)
            }
          } catch (error) {
            console.error('=== APP TRACE: IELTS words auto-initialization error ===')
            console.error('Error:', error)
          }
        } else {
          console.log('=== APP TRACE: Skipping auto-initialization ===')
          console.log('Word count:', wordStore.words.length)
          console.log('Initialized:', wordStore.initialized)
        }
        
        // 检查学习模式状态
        const status = await window.electronAPI.getSchedulerStatus()
        studyStore.setStudyModeActive(status.isRunning)
      } catch (error) {
        console.error('数据初始化失败:', error)
      }
      
      // 设置复习窗口监听器
      window.electronAPI.onCreateReviewWindow((data) => {
        console.log('=== APP TRACE: Received create review window request ===')
        console.log('App received IPC message at:', new Date().toLocaleString())
        console.log('Word data:', data.word)
        console.log('Word data type:', typeof data.word)
        console.log('Word data keys:', Object.keys(data.word || {}))
        
        // 跳转到复习页面
        const wordParam = encodeURIComponent(JSON.stringify(data.word))
        const reviewHash = `/review?word=${wordParam}`
        console.log('=== APP TRACE: Navigating to review page ===')
        console.log('Review hash:', reviewHash)
        console.log('Word parameter length:', wordParam.length)
        window.location.hash = reviewHash
        console.log('=== APP TRACE: Navigation completed ===')
      })
      
      // 监听学习模式状态变化
          window.electronAPI.onStudyModeStatusChanged((data) => {
      console.log('=== APP TRACE: Received study mode status change ===')
      console.log('Study mode status:', data.isRunning)
      studyStore.setStudyModeActive(data.isRunning)
    })

    // 监听刷新单词列表的请求
    window.electronAPI.onRefreshWords(() => {
      console.log('=== APP TRACE: Received refresh words request ===')
      wordStore.refreshWords()
    })
      
      const appEndTime = Date.now()
      const appDuration = appEndTime - appStartTime
      console.log('=== APP TRACE: App initialization completed ===')
      console.log('App initialization total time:', appDuration, 'ms')
    })

    onUnmounted(() => {
      // 清理事件监听器
      window.electronAPI.removeAllListeners('show-review-window')
      window.electronAPI.removeAllListeners('create-review-window')
      document.removeEventListener('cardOpacityChange', handleCardOpacityChange)
    })

    return {
      isReviewMode,
      isStudyModeActive,
      startingStudy,
      stoppingStudy,
      mainLayout,
      cardOpacity,
      startStudyMode,
      stopStudyMode
    }
  }
}
</script>

<style scoped>
/* 应用布局 */
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background 0.5s ease-in-out;
}

/* 顶部导航栏 */
.app-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #2b2d42;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.app-title i {
  color: #4361ee;
}

/* 导航菜单 */
.nav-menu {
  display: flex;
  gap: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #6c757d;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #f8f9fa;
  color: #4361ee;
}

.nav-item.active {
  background-color: #4361ee;
  color: white;
}

.nav-item i {
  font-size: 14px;
}

/* 学习控制按钮 */
.study-controls {
  display: flex;
  gap: 10px;
}

.study-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.start-btn {
  background-color: #06d6a0;
  color: white;
}

.start-btn:hover:not(:disabled) {
  background-color: #05c091;
  transform: translateY(-1px);
}

.stop-btn {
  background-color: #ef476f;
  color: white;
}

.stop-btn:hover:not(:disabled) {
  background-color: #d63d5f;
  transform: translateY(-1px);
}

.study-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 主内容区域 */
.app-main {
  flex: 1;
  overflow: auto;
  min-height: calc(100vh - 60px);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background 0.5s ease-in-out;
}

/* 内容卡片透明度样式 */
.app-main .page-container {
  transition: opacity 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 15px;
    flex-wrap: wrap;
    height: auto;
    min-height: 60px;
    gap: 10px;
  }

  .nav-menu {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 10px;
  }

  .nav-item {
    padding: 6px 12px;
    font-size: 14px;
  }

  .study-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style> 