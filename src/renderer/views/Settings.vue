<template>
  <div class="settings-page">
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">设置</h2>
        <p class="page-description">自定义你的学习体验</p>
      </div>

      <div class="settings-content">
        <!-- 个性化设置 -->
        <div class="settings-section">
          <h3 class="section-title">个性化设置</h3>
          
          <!-- 背景设置 -->
          <BackgroundSettings />
          
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">学习间隔</label>
              <p class="setting-description">设置单词复习的时间间隔</p>
            </div>
            <div class="setting-control">
              <div class="interval-input-group">
                <input 
                  v-model.number="settings.studyIntervalMinutes" 
                  @input="updateStudyInterval"
                  type="number" 
                  min="0" 
                  max="120"
                  class="number-input"
                  placeholder="0"
                >
                <span class="unit">分钟</span>
                <input 
                  v-model.number="settings.studyIntervalSeconds" 
                  @input="updateStudyInterval"
                  type="number" 
                  min="0" 
                  max="59"
                  class="number-input"
                  placeholder="0"
                >
                <span class="unit">秒</span>
              </div>
            </div>
          </div>


        </div>

        <!-- 系统设置 -->
        <div class="settings-section">
          <h3 class="section-title">系统设置</h3>
          
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">开机自启</label>
              <p class="setting-description">应用启动时自动开始学习模式</p>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  v-model="settings.autoStart" 
                  @change="autoSaveSettings"
                  type="checkbox"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">声音提醒</label>
              <p class="setting-description">学习提醒时播放提示音</p>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  v-model="settings.soundEnabled" 
                  @change="autoSaveSettings"
                  type="checkbox"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">系统托盘</label>
              <p class="setting-description">关闭窗口时最小化到系统托盘</p>
            </div>
            <div class="setting-control">
              <label class="toggle-switch">
                <input 
                  v-model="settings.trayEnabled" 
                  @change="autoSaveSettings"
                  type="checkbox"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- 数据管理 -->
        <div class="settings-section">
          <h3 class="section-title">数据管理</h3>
          
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">重置学习数据</label>
              <p class="setting-description">清空所有单词和学习记录</p>
            </div>
            <div class="setting-control">
              <button @click="resetData" class="danger-btn">
                重置数据
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">重置复习时间</label>
              <p class="setting-description">将所有单词的复习时间重置为当前时间，可以立即开始复习</p>
            </div>
            <div class="setting-control">
              <button @click="resetReviewTime" class="action-btn">
                重置复习时间
              </button>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">导出数据</label>
              <p class="setting-description">导出单词数据为JSON文件</p>
            </div>
            <div class="setting-control">
              <button @click="exportData" class="export-btn">
                导出数据
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStudyStore } from '../store/studyStore.js'
import BackgroundSettings from '../components/BackgroundSettings.vue'

export default {
  name: 'Settings',
  components: {
    BackgroundSettings
  },
  setup() {
    const studyStore = useStudyStore()

    // 响应式状态
    const saving = ref(false)
    const settings = reactive({
      studyInterval: 30, // 总秒数
      studyIntervalMinutes: 0, // 分钟部分
      studyIntervalSeconds: 30, // 秒部分
      autoStart: false,
      soundEnabled: true,
      trayEnabled: true
    })

    // 方法
    const loadSettings = async () => {
      try {
        const status = await window.electronAPI.getSchedulerStatus()
        if (status.settings) {
          Object.assign(settings, status.settings)
          // 将总秒数转换为分钟和秒
          const totalSeconds = settings.studyInterval || 30
          settings.studyIntervalMinutes = Math.floor(totalSeconds / 60)
          settings.studyIntervalSeconds = totalSeconds % 60
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    }

    const updateStudyInterval = () => {
      // 将分钟和秒转换为总秒数
      const minutes = settings.studyIntervalMinutes || 0
      const seconds = settings.studyIntervalSeconds || 0
      settings.studyInterval = minutes * 60 + seconds
      
      // 确保至少1秒
      if (settings.studyInterval < 1) {
        settings.studyInterval = 1
        settings.studyIntervalSeconds = 1
      }
      
      // 自动保存设置
      autoSaveSettings()
    }

    const autoSaveSettings = async () => {
      try {
        // 创建纯对象，避免Vue响应式对象序列化问题
        const cleanSettings = {
          studyInterval: settings.studyInterval,
          autoStart: settings.autoStart,
          soundEnabled: settings.soundEnabled,
          trayEnabled: settings.trayEnabled
        }
        
        console.log('自动保存设置:', cleanSettings)
        const result = await window.electronAPI.updateSettings(cleanSettings)
        console.log('设置保存结果:', result)
        
        if (result.success) {
          console.log('设置自动保存成功')
        } else {
          console.error('自动保存设置失败:', result.message)
        }
      } catch (error) {
        console.error('自动保存设置出错:', error)
      }
    }

    const saveSettings = async () => {
      saving.value = true
      try {
        // 创建纯对象，避免Vue响应式对象序列化问题
        const cleanSettings = {
          studyInterval: settings.studyInterval,
          autoStart: settings.autoStart,
          soundEnabled: settings.soundEnabled,
          trayEnabled: settings.trayEnabled
        }
        
        console.log('准备保存设置:', cleanSettings)
        const result = await window.electronAPI.updateSettings(cleanSettings)
        console.log('设置保存结果:', result)
        
        if (result.success) {
          console.log('设置保存成功')
        } else {
          console.error('保存设置失败:', result.message)
        }
      } catch (error) {
        console.error('保存设置出错:', error)
        console.error('错误详情:', error.message)
        console.error('错误堆栈:', error.stack)
      } finally {
        saving.value = false
      }
    }

    const resetData = async () => {
      if (!confirm('确定要重置所有学习数据吗？此操作不可恢复！')) {
        return
      }

      try {
        console.log('开始清空所有数据...')
        const result = await window.electronAPI.clearAllData()
        
        if (result.success) {
          console.log('数据清空成功:', result.message)
          alert('所有数据已清空！')
          // 重新加载页面以刷新数据
          window.location.reload()
        } else {
          console.error('清空数据失败:', result.message)
          alert('清空数据失败: ' + result.message)
        }
      } catch (error) {
        console.error('重置数据失败:', error)
        alert('重置数据失败: ' + error.message)
      }
    }

    const exportData = async () => {
      try {
        // 这里需要实现导出数据的逻辑
        console.log('导出数据功能待实现')
      } catch (error) {
        console.error('导出数据失败:', error)
      }
    }

    const resetReviewTime = async () => {
      if (!confirm('确定要重置所有单词的复习时间吗？这将使所有单词可以立即复习。')) {
        return
      }

      try {
        console.log('开始重置单词复习时间...')
        const result = await window.electronAPI.resetWordsReviewTime()
        
        if (result.success) {
          console.log('重置复习时间成功:', result.message)
          alert('复习时间已重置！现在可以开始复习了。')
        } else {
          console.error('重置复习时间失败:', result.message)
          alert('重置失败: ' + result.message)
        }
      } catch (error) {
        console.error('重置复习时间出错:', error)
        alert('重置失败: ' + error.message)
      }
    }

    // 生命周期
    onMounted(() => {
      loadSettings()
    })

    return {
      settings,
      updateStudyInterval,
      autoSaveSettings,
      resetData,
      exportData,
      resetReviewTime
    }
  }
}
</script>

<style scoped>
.settings-page {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.page-header {
  margin-bottom: 40px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #2b2d42;
  margin: 0 0 10px 0;
}

.page-description {
  color: #6c757d;
  font-size: 16px;
  margin: 0;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.settings-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2b2d42;
  margin: 0 0 25px 0;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f8f9fa;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
  margin-right: 20px;
}

.setting-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #2b2d42;
  margin-bottom: 5px;
}

.setting-description {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 数字输入框 */
.number-input {
  width: 80px;
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
  transition: all 0.3s ease;
}

.number-input:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.unit {
  color: #6c757d;
  font-size: 14px;
}

.interval-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interval-input-group .number-input {
  width: 60px;
  text-align: center;
}

.interval-input-group .unit {
  margin-right: 8px;
}

/* 开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e9ecef;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #4361ee;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* 按钮样式 */
.danger-btn, .export-btn, .action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.danger-btn {
  background-color: #ef476f;
  color: white;
}

.danger-btn:hover {
  background-color: #d63d5f;
  transform: translateY(-1px);
}

.export-btn {
  background-color: #06d6a0;
  color: white;
}

.export-btn:hover {
  background-color: #05c091;
  transform: translateY(-1px);
}

.action-btn {
  background-color: #4361ee;
  color: white;
}

.action-btn:hover {
  background-color: #3a56d4;
  transform: translateY(-1px);
}

/* 保存按钮 */
.settings-actions {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.save-btn {
  padding: 15px 40px;
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.save-btn:hover:not(:disabled) {
  background-color: #3a56d4;
  transform: translateY(-2px);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 15px;
  }

  .settings-section {
    padding: 20px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .setting-info {
    margin-right: 0;
  }

  .setting-control {
    width: 100%;
    justify-content: flex-end;
  }

  .save-btn {
    padding: 12px 30px;
    font-size: 16px;
    min-width: 120px;
  }
}
</style> 