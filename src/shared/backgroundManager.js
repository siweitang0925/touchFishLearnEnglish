/**
 * 背景图片管理器
 * 支持多个背景图片定时切换和动态图片（如GIF）
 */

import imageStorage from './imageStorage.js'

// 默认背景图片配置
const defaultBackgrounds = [
  {
    id: 'gradient-1',
    name: '渐变蓝紫',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    duration: 10000 // 10秒
  },
  {
    id: 'gradient-2', 
    name: '渐变绿蓝',
    type: 'gradient',
    value: 'linear-gradient(135deg, #06d6a0 0%, #4361ee 100%)',
    duration: 10000
  },
  {
    id: 'gradient-3',
    name: '渐变橙红',
    type: 'gradient', 
    value: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
    duration: 10000
  },
  {
    id: 'gradient-4',
    name: '渐变紫粉',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
    duration: 10000
  }
]

class BackgroundManager {
  constructor() {
    this.backgrounds = [...defaultBackgrounds]
    this.currentIndex = 0
    this.interval = null
    this.isEnabled = false
    this.switchInterval = 10000 // 默认10秒切换一次
    this.mode = 'system' // 'system' 或 'custom'，默认为系统预设模式
  }

  /**
   * 初始化背景管理器
   */
  init() {
    this.loadCustomBackgrounds()
    this.loadMode()
    this.loadAutoSwitchSettings()
    // 确保使用系统预设背景作为默认
    this.currentIndex = 0
    // 触发初始背景事件，让事件系统处理背景应用
    this.emitBackgroundChange(this.getCurrentBackground())
    // 启动自动切换
    this.startAutoSwitch()
  }

  /**
   * 加载自定义背景图片
   */
  loadCustomBackgrounds() {
    try {
      const customBackgrounds = localStorage.getItem('customBackgrounds')
      if (customBackgrounds) {
        const parsed = JSON.parse(customBackgrounds)
        this.backgrounds = [...defaultBackgrounds, ...parsed]
      }
    } catch (error) {
      console.error('加载自定义背景失败:', error)
    }
  }

  /**
   * 保存自定义背景图片
   */
  saveCustomBackgrounds() {
    try {
      const customBackgrounds = this.backgrounds.filter(bg => !bg.id.startsWith('gradient-'))
      localStorage.setItem('customBackgrounds', JSON.stringify(customBackgrounds))
    } catch (error) {
      console.error('保存自定义背景失败:', error)
    }
  }

  /**
   * 加载模式设置
   */
  loadMode() {
    try {
      const savedMode = localStorage.getItem('backgroundMode')
      if (savedMode === 'custom' || savedMode === 'system') {
        this.mode = savedMode
        console.log('加载保存的模式:', this.mode)
      }
    } catch (error) {
      console.error('加载模式设置失败:', error)
    }
  }

  /**
   * 保存模式设置
   */
  saveMode() {
    try {
      localStorage.setItem('backgroundMode', this.mode)
      console.log('保存模式设置:', this.mode)
    } catch (error) {
      console.error('保存模式设置失败:', error)
    }
  }

  /**
   * 加载自动切换设置
   */
  loadAutoSwitchSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('backgroundSettings') || '{}')
      if (settings.autoSwitchEnabled !== undefined) {
        this.isEnabled = settings.autoSwitchEnabled
        console.log('加载自动切换设置:', this.isEnabled)
      }
      if (settings.switchInterval) {
        this.switchInterval = settings.switchInterval * 1000 // 转换为毫秒
        console.log('加载切换间隔设置:', this.switchInterval)
      }
    } catch (error) {
      console.error('加载自动切换设置失败:', error)
    }
  }

  /**
   * 添加自定义背景图片
   */
  addCustomBackground(background) {
    const newBackground = {
      id: `custom-${Date.now()}`,
      name: background.name || '自定义背景',
      type: background.type || 'image',
      value: background.value,
      duration: background.duration || this.switchInterval,
      ...background
    }
    
    this.backgrounds.push(newBackground)
    this.saveCustomBackgrounds()
    return newBackground
  }

  /**
   * 移除背景图片
   */
  removeBackground(backgroundId) {
    const index = this.backgrounds.findIndex(bg => bg.id === backgroundId)
    if (index !== -1) {
      this.backgrounds.splice(index, 1)
      this.saveCustomBackgrounds()
      
      // 如果删除的是当前背景，切换到下一个
      if (index === this.currentIndex) {
        this.currentIndex = Math.max(0, this.currentIndex - 1)
      }
      
      return true
    }
    return false
  }

  /**
   * 获取当前背景
   */
  getCurrentBackground() {
    if (this.backgrounds.length === 0) {
      return defaultBackgrounds[0]
    }
    return this.backgrounds[this.currentIndex]
  }

  /**
   * 切换到下一个背景
   */
  nextBackground() {
    if (this.backgrounds.length <= 1) return
    
    if (this.mode === 'system') {
      // 系统预设模式：只在系统预设背景间切换
      const systemBackgrounds = this.backgrounds.filter(bg => bg.id.startsWith('gradient-'))
      if (systemBackgrounds.length <= 1) return
      
      // 找到当前背景在系统背景中的索引
      const currentSystemIndex = systemBackgrounds.findIndex(bg => bg.id === this.backgrounds[this.currentIndex].id)
      const nextSystemIndex = (currentSystemIndex + 1) % systemBackgrounds.length
      
      // 更新当前索引为下一个系统背景
      const nextBackground = systemBackgrounds[nextSystemIndex]
      this.currentIndex = this.backgrounds.findIndex(bg => bg.id === nextBackground.id)
    } else if (this.mode === 'custom') {
      // 自定义背景模式：只在自定义背景间切换
      const customBackgrounds = this.backgrounds.filter(bg => !bg.id.startsWith('gradient-'))
      if (customBackgrounds.length <= 1) return
      
      // 找到当前背景在自定义背景中的索引
      const currentCustomIndex = customBackgrounds.findIndex(bg => bg.id === this.backgrounds[this.currentIndex].id)
      const nextCustomIndex = (currentCustomIndex + 1) % customBackgrounds.length
      
      // 更新当前索引为下一个自定义背景
      const nextBackground = customBackgrounds[nextCustomIndex]
      this.currentIndex = this.backgrounds.findIndex(bg => bg.id === nextBackground.id)
    }
    
    // 触发背景切换事件
    this.emitBackgroundChange(this.getCurrentBackground())
  }

  /**
   * 切换到上一个背景
   */
  previousBackground() {
    if (this.backgrounds.length <= 1) return
    
    if (this.mode === 'system') {
      // 系统预设模式：只在系统预设背景间切换
      const systemBackgrounds = this.backgrounds.filter(bg => bg.id.startsWith('gradient-'))
      if (systemBackgrounds.length <= 1) return
      
      // 找到当前背景在系统背景中的索引
      const currentSystemIndex = systemBackgrounds.findIndex(bg => bg.id === this.backgrounds[this.currentIndex].id)
      const prevSystemIndex = currentSystemIndex === 0 
        ? systemBackgrounds.length - 1 
        : currentSystemIndex - 1
      
      // 更新当前索引为上一个系统背景
      const prevBackground = systemBackgrounds[prevSystemIndex]
      this.currentIndex = this.backgrounds.findIndex(bg => bg.id === prevBackground.id)
    } else if (this.mode === 'custom') {
      // 自定义背景模式：只在自定义背景间切换
      const customBackgrounds = this.backgrounds.filter(bg => !bg.id.startsWith('gradient-'))
      if (customBackgrounds.length <= 1) return
      
      // 找到当前背景在自定义背景中的索引
      const currentCustomIndex = customBackgrounds.findIndex(bg => bg.id === this.backgrounds[this.currentIndex].id)
      const prevCustomIndex = currentCustomIndex === 0 
        ? customBackgrounds.length - 1 
        : currentCustomIndex - 1
      
      // 更新当前索引为上一个自定义背景
      const prevBackground = customBackgrounds[prevCustomIndex]
      this.currentIndex = this.backgrounds.findIndex(bg => bg.id === prevBackground.id)
    }
    
    // 触发背景切换事件
    this.emitBackgroundChange(this.getCurrentBackground())
  }

  /**
   * 切换到指定背景
   */
  switchToBackground(backgroundId) {
    const index = this.backgrounds.findIndex(bg => bg.id === backgroundId)
    if (index !== -1) {
      this.currentIndex = index
      // 不传递元素参数，让事件系统处理背景应用
      this.emitBackgroundChange(this.getCurrentBackground())
      return true
    }
    return false
  }

  /**
   * 应用背景到指定元素
   */
  applyBackground(element = null) {
    const background = this.getCurrentBackground()
    if (!background) return

    const targetElement = element || document.body
    
    if (background.type === 'gradient') {
      targetElement.style.background = background.value
      targetElement.style.backgroundImage = background.value
      targetElement.style.backgroundSize = 'cover'
      targetElement.style.backgroundPosition = 'center'
      targetElement.style.backgroundRepeat = 'no-repeat'
    } else if (background.type === 'image') {
      // 使用fullPath（本地图片）或原始value（网络图片/base64）
      const imageUrl = background.fullPath || background.value
      
      console.log('应用图片背景:', {
        backgroundName: background.name,
        backgroundValue: background.value,
        fullPath: background.fullPath,
        finalImageUrl: imageUrl
      })
      
      // 处理不同类型的图片URL
      let finalUrl = imageUrl
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        // 本地文件路径，尝试使用 file:// 协议
        finalUrl = `file://${imageUrl.replace(/\\/g, '/')}`
      }
      
      console.log('最终图片URL:', finalUrl)
      
      targetElement.style.background = `url('${finalUrl}')`
      targetElement.style.backgroundImage = `url('${finalUrl}')`
      targetElement.style.backgroundSize = 'cover'
      targetElement.style.backgroundPosition = 'center'
      targetElement.style.backgroundRepeat = 'no-repeat'
    }

    // 触发背景切换事件
    this.emitBackgroundChange(background)
  }

  /**
   * 开始自动切换
   */
  startAutoSwitch() {
    if (this.isEnabled) return
    
    this.isEnabled = true
    console.log('启动自动切换，间隔:', this.switchInterval, 'ms')
    this.interval = setInterval(() => {
      this.nextBackground()
    }, this.switchInterval)
  }

  /**
   * 停止自动切换
   */
  stopAutoSwitch() {
    if (!this.isEnabled) return
    
    this.isEnabled = false
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  /**
   * 设置切换间隔
   */
  setSwitchInterval(interval) {
    this.switchInterval = interval
    if (this.isEnabled) {
      this.stopAutoSwitch()
      this.startAutoSwitch()
    }
  }

  /**
   * 获取所有背景
   */
  getAllBackgrounds() {
    return [...this.backgrounds]
  }

  /**
   * 获取默认背景
   */
  getDefaultBackgrounds() {
    return [...defaultBackgrounds]
  }

  /**
   * 获取自定义背景
   */
  getCustomBackgrounds() {
    return this.backgrounds.filter(bg => !bg.id.startsWith('gradient-'))
  }

  /**
   * 获取系统预设背景
   */
  getSystemBackgrounds() {
    return this.backgrounds.filter(bg => bg.id.startsWith('gradient-'))
  }

  /**
   * 切换到系统预设背景模式
   */
  switchToSystemMode() {
    this.mode = 'system'
    this.saveMode()
    const systemBackgrounds = this.getSystemBackgrounds()
    if (systemBackgrounds.length > 0) {
      this.currentIndex = this.backgrounds.findIndex(bg => bg.id === systemBackgrounds[0].id)
      this.emitBackgroundChange(this.getCurrentBackground())
      console.log('已切换到系统预设模式')
      return true
    }
    return false
  }

  /**
   * 切换到自定义背景模式
   */
  switchToCustomMode() {
    this.mode = 'custom'
    this.saveMode()
    const customBackgrounds = this.getCustomBackgrounds()
    if (customBackgrounds.length > 0) {
      this.currentIndex = this.backgrounds.findIndex(bg => bg.id === customBackgrounds[0].id)
      this.emitBackgroundChange(this.getCurrentBackground())
      console.log('已切换到自定义背景模式')
      return true
    }
    return false
  }

  /**
   * 获取当前模式
   */
  getCurrentMode() {
    return this.mode
  }

  /**
   * 检查图片是否有效
   */
  async validateImage(url) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
      
      // 设置超时，避免长时间等待
      setTimeout(() => resolve(false), 5000)
    })
  }

  /**
   * 触发背景切换事件
   */
  emitBackgroundChange(background) {
    try {
      // 如果是本地图片，获取完整路径
      if (background.type === 'image' && !background.value.startsWith('http') && !background.value.startsWith('data:')) {
        background.fullPath = imageStorage.getImagePath(background.value)
      }
      
      const event = new CustomEvent('backgroundChange', {
        detail: { background, index: this.currentIndex }
      })
      document.dispatchEvent(event)
    } catch (error) {
      console.error('触发背景切换事件失败:', error)
    }
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.stopAutoSwitch()
    this.backgrounds = []
    this.currentIndex = 0
  }
}

// 创建全局实例
const backgroundManager = new BackgroundManager()

export default backgroundManager
export { defaultBackgrounds } 