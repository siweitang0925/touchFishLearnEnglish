<template>
  <div class="background-settings">
    <!-- 背景设置按钮 -->
    <div class="settings-button-section">
      <button @click="openBackgroundModal" class="background-settings-btn">
        <i class="fas fa-image"></i>
        背景设置
      </button>
    </div>

    <!-- 背景设置弹框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- 弹框头部 -->
        <div class="modal-header">
          <h3 class="modal-title">
            <i class="fas fa-image"></i>
            背景设置
          </h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- 弹框内容 -->
        <div class="modal-body">
          <!-- 背景切换控制 -->
          <div class="control-section">
            <div class="control-item">
              <label class="control-label">自动切换背景</label>
              <div class="toggle-container">
                <input 
                  type="checkbox" 
                  id="autoSwitch" 
                  v-model="autoSwitchEnabled"
                  @change="toggleAutoSwitch"
                  class="toggle-input"
                >
                <label for="autoSwitch" class="toggle-label"></label>
              </div>
            </div>

            <div class="control-item" v-if="autoSwitchEnabled">
              <label class="control-label">切换间隔 (秒)</label>
              <input 
                type="number" 
                v-model="switchInterval" 
                @change="updateSwitchInterval"
                min="5" 
                max="300"
                class="interval-input"
              >
            </div>
          </div>

          <!-- 主界面透明度设置 -->
          <div class="control-section">
            <div class="control-item">
              <label class="control-label">主界面透明度</label>
              <div class="opacity-control">
                <input 
                  type="range" 
                  v-model="cardOpacity" 
                  @input="updateCardOpacity"
                  min="0.1" 
                  max="1" 
                  step="0.01"
                  class="opacity-slider"
                >
                <span class="opacity-value">{{ Math.round(cardOpacity * 100) }}%</span>
              </div>
            </div>
            <div class="control-item">
              <label class="control-label">毛玻璃效果</label>
              <div class="toggle-container">
                <input 
                  type="checkbox" 
                  id="blurEffect" 
                  v-model="blurEffectEnabled"
                  @change="updateBlurEffect"
                  class="toggle-input"
                >
                <label for="blurEffect" class="toggle-label"></label>
              </div>
            </div>
            <div class="control-item">
              <label class="control-label">预览效果</label>
              <div class="opacity-preview">
                <div 
                  class="preview-card"
                  :style="{ 
                    opacity: cardOpacity,
                    backdropFilter: blurEffectEnabled ? 'blur(10px)' : 'none',
                    WebkitBackdropFilter: blurEffectEnabled ? 'blur(10px)' : 'none'
                  }"
                >
                  <div class="preview-content">
                    <h4>主界面预览</h4>
                    <p>这是主界面内容区域的透明度预览效果</p>
                    <p v-if="blurEffectEnabled" style="color: #4361ee; font-size: 12px;">毛玻璃效果已启用</p>
                    <p v-else style="color: #6c757d; font-size: 12px;">毛玻璃效果已禁用</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

              <!-- 当前背景显示 -->
    <div class="current-background">
      <h4>当前背景</h4>
      <div class="background-preview">
        <div 
          class="preview-item"
          :style="getBackgroundStyle(currentBackground)"
        >
          <span class="background-name">{{ currentBackground.name }}</span>
        </div>
      </div>
      <div class="background-controls">
        <button 
          @click="switchToSystemMode"
          class="control-btn system-btn"
          :class="{ active: isSystemBackground }"
        >
          <i class="fas fa-palette"></i>
          系统预设
        </button>
        <button 
          @click="switchToCustomMode"
          class="control-btn custom-btn"
          :class="{ active: !isSystemBackground }"
        >
          <i class="fas fa-image"></i>
          自定义背景
        </button>
      </div>
    </div>

          <!-- 背景列表 -->
          <div class="backgrounds-section">
            <h4>背景列表</h4>
            <div class="backgrounds-grid">
              <div 
                v-for="background in backgrounds" 
                :key="background.id"
                class="background-item"
                :class="{ active: background.id === currentBackground.id }"
                @click="switchToBackground(background.id)"
              >
                <div 
                  class="background-thumbnail"
                  :style="getBackgroundStyle(background)"
                ></div>
                <div class="background-info">
                  <span class="background-name">{{ background.name }}</span>
                  <span class="background-type">{{ background.type === 'gradient' ? '渐变' : '图片' }}</span>
                </div>
                <button 
                  v-if="!background.id.startsWith('gradient-')"
                  @click.stop="removeBackground(background.id)"
                  class="remove-btn"
                  title="删除背景"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- 添加自定义背景 -->
          <div class="add-background-section">
            <h4>添加自定义背景</h4>
            <div class="add-form">
              <div class="form-group">
                <label>背景名称</label>
                <input 
                  type="text" 
                  v-model="newBackground.name" 
                  placeholder="输入背景名称"
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label>背景类型</label>
                <select v-model="newBackground.type" class="form-select">
                  <option value="image">图片</option>
                  <option value="gradient">渐变</option>
                </select>
              </div>

                      <div class="form-group" v-if="newBackground.type === 'image'">
          <label>图片选择</label>
          <div class="image-input-group">
            <input 
              type="file" 
              @change="handleFileSelect"
              accept="image/*"
              class="file-input"
              ref="fileInput"
            >
            <div class="input-display">
              <input 
                type="text" 
                v-model="newBackground.value" 
                placeholder="选择本地图片或输入图片URL (支持GIF等动态图片)"
                class="form-input"
                readonly
              >
              <button 
                type="button" 
                @click="$refs.fileInput.click()"
                class="file-select-btn"
              >
                <i class="fas fa-folder-open"></i>
                选择文件
              </button>
            </div>
          </div>
        </div>

              <div class="form-group" v-if="newBackground.type === 'gradient'">
                <label>渐变值</label>
                <input 
                  type="text" 
                  v-model="newBackground.value" 
                  placeholder="例如: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  class="form-input"
                >
              </div>

              <button 
                @click="addCustomBackground"
                :disabled="!canAddBackground"
                class="add-btn"
              >
                <i class="fas fa-plus"></i>
                添加背景
              </button>
            </div>
          </div>

          <!-- 预设渐变 -->
          <div class="preset-gradients">
            <h4>预设渐变</h4>
            <div class="gradients-grid">
              <div 
                v-for="gradient in presetGradients" 
                :key="gradient.id"
                class="gradient-item"
                @click="addPresetGradient(gradient)"
              >
                <div 
                  class="gradient-preview"
                  :style="{ background: gradient.value }"
                ></div>
                <span class="gradient-name">{{ gradient.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 弹框底部 -->
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import backgroundManager from '@shared/backgroundManager.js'
import imageStorage from '@shared/imageStorage.js'

export default {
  name: 'BackgroundSettings',
  setup() {
    // 弹框状态
    const showModal = ref(false)
    
    // 响应式状态
    const autoSwitchEnabled = ref(false)
    const switchInterval = ref(10)
    const cardOpacity = ref(0.9)
    const blurEffectEnabled = ref(false) // 新增毛玻璃效果开关
    const backgrounds = ref([])
    const currentBackground = ref({})
    const currentMode = ref('system') // 添加响应式的模式状态
    
    const newBackground = ref({
      name: '',
      type: 'image',
      value: ''
    })

    // 预设渐变
    const presetGradients = ref([
      {
        id: 'preset-1',
        name: '日落渐变',
        value: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)'
      },
      {
        id: 'preset-2',
        name: '海洋渐变',
        value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        id: 'preset-3',
        name: '森林渐变',
        value: 'linear-gradient(135deg, #06d6a0 0%, #4361ee 100%)'
      },
      {
        id: 'preset-4',
        name: '星空渐变',
        value: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
      },
      {
        id: 'preset-5',
        name: '火焰渐变',
        value: 'linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%)'
      },
      {
        id: 'preset-6',
        name: '极光渐变',
        value: 'linear-gradient(135deg, #00bcd4 0%, #4caf50 100%)'
      }
    ])

    // 计算属性
    const canAddBackground = computed(() => {
      return newBackground.value.name.trim() && newBackground.value.value.trim()
    })

    const isSystemBackground = computed(() => {
      console.log('当前模式:', currentMode.value, 'isSystemBackground:', currentMode.value === 'system')
      return currentMode.value === 'system'
    })

    // 弹框方法
    const openBackgroundModal = () => {
      showModal.value = true
      loadSettings()
    }

    const closeModal = () => {
      showModal.value = false
    }

    // 方法
    const loadSettings = () => {
      // 加载背景列表
      backgrounds.value = backgroundManager.getAllBackgrounds()
      currentBackground.value = backgroundManager.getCurrentBackground()
      
      // 加载当前模式
      currentMode.value = backgroundManager.getCurrentMode()
      console.log('加载设置，当前模式:', currentMode.value)
      
      // 加载设置
      const settings = JSON.parse(localStorage.getItem('backgroundSettings') || '{}')
      autoSwitchEnabled.value = settings.autoSwitchEnabled || false
      switchInterval.value = settings.switchInterval || 10
      cardOpacity.value = settings.cardOpacity || 0.9
      blurEffectEnabled.value = settings.blurEffectEnabled || false // 加载毛玻璃效果设置
    }

    const saveSettings = () => {
      const settings = {
        autoSwitchEnabled: autoSwitchEnabled.value,
        switchInterval: switchInterval.value,
        cardOpacity: cardOpacity.value,
        blurEffectEnabled: blurEffectEnabled.value // 保存毛玻璃效果设置
      }
      localStorage.setItem('backgroundSettings', JSON.stringify(settings))
    }

    const toggleAutoSwitch = () => {
      if (autoSwitchEnabled.value) {
        backgroundManager.startAutoSwitch()
      } else {
        backgroundManager.stopAutoSwitch()
      }
      saveSettings()
    }

    const updateSwitchInterval = () => {
      backgroundManager.setSwitchInterval(switchInterval.value * 1000)
      saveSettings()
    }

    const updateCardOpacity = () => {
      // 保存设置
      saveSettings()
      
      // 触发自定义事件，通知其他组件更新透明度
      document.dispatchEvent(new CustomEvent('cardOpacityChange', {
        detail: { opacity: cardOpacity.value }
      }))
    }

    const updateBlurEffect = () => {
      saveSettings()
      document.dispatchEvent(new CustomEvent('blurEffectChange', {
        detail: { enabled: blurEffectEnabled.value }
      }))
    }

    const switchToBackground = (backgroundId) => {
      backgroundManager.switchToBackground(backgroundId)
      currentBackground.value = backgroundManager.getCurrentBackground()
    }

    const removeBackground = (backgroundId) => {
      if (confirm('确定要删除这个背景吗？')) {
        backgroundManager.removeBackground(backgroundId)
        backgrounds.value = backgroundManager.getAllBackgrounds()
        currentBackground.value = backgroundManager.getCurrentBackground()
      }
    }

    const addCustomBackground = async () => {
      if (!canAddBackground.value) return

      // 验证图片URL（只验证网络URL，本地文件不需要验证）
      if (newBackground.value.type === 'image' && 
          newBackground.value.value.startsWith('http')) {
        const isValid = await backgroundManager.validateImage(newBackground.value.value)
        if (!isValid) {
          alert('图片URL无效，请检查链接是否正确')
          return
        }
      }

      const background = backgroundManager.addCustomBackground({
        name: newBackground.value.name,
        type: newBackground.value.type,
        value: newBackground.value.value
      })

      backgrounds.value = backgroundManager.getAllBackgrounds()
      
      // 重置表单
      newBackground.value = {
        name: '',
        type: 'image',
        value: ''
      }

      alert('背景添加成功！')
    }

    const handleFileSelect = async (event) => {
      const file = event.target.files[0]
      if (file) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          alert('请选择图片文件')
          return
        }
        
        // 检查文件大小 (限制为 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert('图片文件大小不能超过 10MB')
          return
        }
        
        try {
          // 将文件转换为base64格式（确保能正常显示）
          const reader = new FileReader()
          reader.onload = (e) => {
            newBackground.value.value = e.target.result
            newBackground.value.name = file.name.replace(/\.[^/.]+$/, '') // 移除文件扩展名
            console.log('图片已转换为base64格式，长度:', e.target.result.length)
          }
          reader.readAsDataURL(file)
          
          // 同时保存到本地目录（可选）
          try {
            const relativePath = await imageStorage.saveImage(file)
            console.log('图片已保存到本地:', relativePath)
          } catch (saveError) {
            console.warn('保存到本地失败，但不影响显示:', saveError.message)
          }
        } catch (error) {
          alert('处理图片失败: ' + error.message)
        }
      }
    }

    const switchToSystemMode = () => {
      console.log('点击系统预设按钮')
      backgroundManager.switchToSystemMode()
      currentBackground.value = backgroundManager.getCurrentBackground()
      currentMode.value = 'system' // 更新响应式状态
      console.log('切换到系统预设模式，当前模式:', currentMode.value)
    }

    const switchToCustomMode = () => {
      console.log('点击自定义背景按钮')
      const success = backgroundManager.switchToCustomMode()
      if (success) {
        currentBackground.value = backgroundManager.getCurrentBackground()
        currentMode.value = 'custom' // 更新响应式状态
        console.log('切换到自定义背景模式，当前模式:', currentMode.value)
      } else {
        alert('请先添加自定义背景')
      }
    }

    const addPresetGradient = (gradient) => {
      const background = backgroundManager.addCustomBackground({
        name: gradient.name,
        type: 'gradient',
        value: gradient.value
      })

      backgrounds.value = backgroundManager.getAllBackgrounds()
      alert('预设渐变添加成功！')
    }

    // 获取背景样式
    const getBackgroundStyle = (background) => {
      if (background.type === 'gradient') {
        return {
          background: background.value,
          backgroundImage: background.value,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      } else if (background.type === 'image') {
        // 处理图片类型的背景
        let imageUrl = background.value
        
        // 如果是base64格式，直接使用
        if (imageUrl && imageUrl.startsWith('data:')) {
          return {
            background: `url('${imageUrl}')`,
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }
        }
        
        // 如果是网络URL，直接使用
        if (imageUrl && imageUrl.startsWith('http')) {
          return {
            background: `url('${imageUrl}')`,
            backgroundImage: `url('${imageUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }
        }
        
        // 如果是本地文件路径，尝试使用 file:// 协议
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          const fileUrl = `file://${imageUrl.replace(/\\/g, '/')}`
          return {
            background: `url('${fileUrl}')`,
            backgroundImage: `url('${fileUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }
        }
        
        // 默认样式
        return {
          background: '#f0f0f0',
          backgroundImage: 'none'
        }
      }
      
      return {}
    }

    // 监听背景切换事件
    const handleBackgroundChange = () => {
      currentBackground.value = backgroundManager.getCurrentBackground()
    }

    // 监听模式变化事件
    const handleModeChange = (event) => {
      const { mode } = event.detail
      console.log('收到模式变化事件:', mode)
      currentMode.value = mode // 更新响应式状态
    }

    // 生命周期
    onMounted(() => {
      document.addEventListener('backgroundChange', handleBackgroundChange)
      document.addEventListener('modeChange', handleModeChange)
    })

    return {
      showModal,
      autoSwitchEnabled,
      switchInterval,
      cardOpacity,
      blurEffectEnabled, // 暴露毛玻璃效果开关
      backgrounds,
      currentBackground,
      newBackground,
      presetGradients,
      canAddBackground,
      isSystemBackground,
      openBackgroundModal,
      closeModal,
      toggleAutoSwitch,
      updateSwitchInterval,
      updateCardOpacity,
      updateBlurEffect, // 暴露毛玻璃效果更新方法
      switchToBackground,
      removeBackground,
      addCustomBackground,
      addPresetGradient,
      handleFileSelect,
      switchToSystemMode,
      switchToCustomMode,
      getBackgroundStyle
    }
  }
}
</script>

<style scoped>
.background-settings {
  width: 100%;
}

/* 设置按钮样式 */
.settings-button-section {
  margin-bottom: 20px;
}

.background-settings-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.background-settings-btn:hover {
  background: #3a56d4;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.2);
}

/* 弹框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  color: #2b2d42;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #e9ecef;
  color: #2b2d42;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #5a6268;
}

/* 内容区域样式 */
.control-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.control-item:last-child {
  margin-bottom: 0;
}

.control-label {
  font-weight: 500;
  color: #2b2d42;
}

.toggle-container {
  position: relative;
}

.toggle-input {
  display: none;
}

.toggle-label {
  display: block;
  width: 44px;
  height: 20px;
  background: #ccc;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: background 0.3s;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-input:checked + .toggle-label {
  background: #4361ee;
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(24px);
}

.interval-input {
  width: 70px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}

/* 透明度控制样式 */
.opacity-control {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.opacity-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4361ee;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.opacity-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4361ee;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.opacity-value {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #4361ee;
  font-size: 14px;
}

.opacity-preview {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.preview-card {
  width: 200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: opacity 0.3s ease;
}

.preview-content {
  padding: 16px;
}

.preview-content h4 {
  margin: 0 0 8px 0;
  color: #2b2d42;
  font-size: 14px;
}

.preview-content p {
  margin: 0;
  color: #6c757d;
  font-size: 12px;
  line-height: 1.4;
}

.current-background {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.current-background h4 {
  margin: 0 0 12px 0;
  color: #2b2d42;
  font-size: 16px;
}

.background-preview {
  display: flex;
  justify-content: center;
}

.preview-item {
  width: 180px;
  height: 100px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-size: 14px;
}

.background-controls {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  justify-content: center;
}

.control-btn {
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: white;
  color: #6c757d;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.control-btn:hover {
  border-color: #4361ee;
  color: #4361ee;
}

.control-btn.active {
  border-color: #4361ee;
  background: #4361ee;
  color: white;
}

.system-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.custom-btn.active {
  background: linear-gradient(135deg, #06d6a0 0%, #4361ee 100%);
  border-color: #06d6a0;
}

.backgrounds-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.backgrounds-section h4 {
  margin: 0 0 12px 0;
  color: #2b2d42;
  font-size: 16px;
}

.backgrounds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.background-item {
  border: 2px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.background-item:hover {
  border-color: #4361ee;
  transform: translateY(-1px);
}

.background-item.active {
  border-color: #4361ee;
  box-shadow: 0 2px 8px rgba(67, 97, 238, 0.2);
}

.background-thumbnail {
  width: 100%;
  height: 80px;
  background-size: cover;
  background-position: center;
}

.background-info {
  padding: 8px;
  background: white;
}

.background-name {
  display: block;
  font-weight: 500;
  color: #2b2d42;
  margin-bottom: 2px;
  font-size: 13px;
}

.background-type {
  font-size: 11px;
  color: #6c757d;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: rgba(239, 71, 111, 0.9);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.3s;
}

.remove-btn:hover {
  background: #ef476f;
  transform: scale(1.1);
}

.add-background-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.add-background-section h4 {
  margin: 0 0 12px 0;
  color: #2b2d42;
  font-size: 16px;
}

.add-form {
  display: grid;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-weight: 500;
  color: #2b2d42;
  font-size: 14px;
}

.form-input, .form-select {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #4361ee;
}

.image-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-input {
  display: none;
}

.input-display {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-display .form-input {
  flex: 1;
  background: #f8f9fa;
  cursor: pointer;
}

.file-select-btn {
  padding: 8px 12px;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
  white-space: nowrap;
}

.file-select-btn:hover {
  background: #3a56d4;
}

.add-btn {
  padding: 10px 16px;
  background: #4361ee;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
}

.add-btn:hover:not(:disabled) {
  background: #3a56d4;
  transform: translateY(-1px);
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.preset-gradients {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.preset-gradients h4 {
  margin: 0 0 12px 0;
  color: #2b2d42;
  font-size: 16px;
}

.gradients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.gradient-item {
  border: 2px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.gradient-item:hover {
  border-color: #4361ee;
  transform: translateY(-1px);
}

.gradient-preview {
  width: 100%;
  height: 60px;
  background-size: cover;
  background-position: center;
}

.gradient-name {
  display: block;
  padding: 8px;
  text-align: center;
  font-weight: 500;
  color: #2b2d42;
  background: white;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .backgrounds-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .gradients-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style> 