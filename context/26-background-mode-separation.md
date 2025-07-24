# 背景模式分离功能实现

## 需求描述

用户希望背景设置中的自动切换功能能够根据当前选择的模式进行分离：
- 当用户选择"系统预设"模式时，自动切换只在系统预设背景间轮换
- 当用户选择"自定义背景"模式时，自动切换只在自定义背景图片间轮换
- 两种模式完全分开，互不干扰

## 技术方案

### 1. 添加模式状态管理

#### 核心状态
```javascript
class BackgroundManager {
  constructor() {
    this.backgrounds = [...defaultBackgrounds]
    this.currentIndex = 0
    this.interval = null
    this.isEnabled = false
    this.switchInterval = 10000 // 默认10秒切换一次
    this.mode = 'system' // 'system' 或 'custom'，默认为系统预设模式
  }
}
```

#### 模式持久化
```javascript
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
```

### 2. 智能背景切换逻辑

#### 下一个背景切换
```javascript
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
```

#### 上一个背景切换
```javascript
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
```

### 3. 模式切换方法

#### 系统预设模式
```javascript
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
```

#### 自定义背景模式
```javascript
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
```

#### 获取当前模式
```javascript
/**
 * 获取当前模式
 */
getCurrentMode() {
  return this.mode
}
```

### 4. 前端界面更新

#### 计算属性优化
```javascript
// BackgroundSettings.vue
const isSystemBackground = computed(() => {
  return backgroundManager.getCurrentMode() === 'system'
})
```

#### 模式切换方法
```javascript
const switchToCustomMode = () => {
  const success = backgroundManager.switchToCustomMode()
  if (success) {
    currentBackground.value = backgroundManager.getCurrentBackground()
  } else {
    alert('请先添加自定义背景')
  }
}
```

## 功能特点

### 1. 智能分离
- ✅ **模式隔离**：系统预设和自定义背景完全分离
- ✅ **自动切换**：根据当前模式在对应背景集合中切换
- ✅ **状态保持**：模式选择会被保存，重启后恢复

### 2. 用户体验
- ✅ **清晰选择**：用户可以明确选择使用哪种背景模式
- ✅ **预期行为**：自动切换行为符合用户预期
- ✅ **无缝切换**：模式切换时自动切换到该模式的第一个背景

### 3. 技术优势
- ✅ **状态管理**：完整的模式状态管理和持久化
- ✅ **错误处理**：完善的边界条件处理
- ✅ **日志记录**：详细的操作日志便于调试

## 使用流程

### 1. 系统预设模式
1. 用户点击"系统预设"按钮
2. 系统切换到系统预设模式
3. 自动切换只在系统预设背景间轮换
4. 模式设置被保存到本地存储

### 2. 自定义背景模式
1. 用户点击"自定义背景"按钮
2. 系统切换到自定义背景模式
3. 自动切换只在自定义背景间轮换
4. 模式设置被保存到本地存储

### 3. 自动切换行为
- **系统预设模式**：只在 `gradient-*` 背景间切换
- **自定义背景模式**：只在非 `gradient-*` 背景间切换
- **单背景情况**：如果当前模式只有一个背景，则不进行切换

## 技术实现细节

### 1. 背景过滤逻辑
```javascript
// 系统预设背景：ID 以 'gradient-' 开头
const systemBackgrounds = this.backgrounds.filter(bg => bg.id.startsWith('gradient-'))

// 自定义背景：ID 不以 'gradient-' 开头
const customBackgrounds = this.backgrounds.filter(bg => !bg.id.startsWith('gradient-'))
```

### 2. 索引计算
```javascript
// 在当前模式背景集合中找到当前背景的索引
const currentIndex = backgroundCollection.findIndex(bg => bg.id === this.backgrounds[this.currentIndex].id)

// 计算下一个索引（循环）
const nextIndex = (currentIndex + 1) % backgroundCollection.length

// 计算上一个索引（循环）
const prevIndex = currentIndex === 0 
  ? backgroundCollection.length - 1 
  : currentIndex - 1
```

### 3. 状态同步
```javascript
// 模式切换时自动保存
this.saveMode()

// 应用启动时自动加载
this.loadMode()
```

## 测试验证

### 1. 构建成功
```
✓ 44 modules transformed.
dist/renderer/index.html                   0.90 kB │ gzip:  0.54 kB
dist/renderer/assets/index-bfe25382.css   31.80 kB │ gzip:  5.35 kB
dist/renderer/assets/main-78c539d6.js    143.20 kB │ gzip: 51.30 kB
✓ built in 1.55s
```

### 2. 功能验证
- ✅ 系统预设模式只在系统背景间切换
- ✅ 自定义背景模式只在自定义背景间切换
- ✅ 模式切换时自动切换到对应模式的第一个背景
- ✅ 模式设置被正确保存和恢复
- ✅ 单背景情况下不进行切换
- ✅ 界面状态正确反映当前模式

## 总结

通过实现背景模式分离功能，成功满足了用户的需求：

1. **需求分析**：理解用户希望系统预设和自定义背景完全分离的需求
2. **架构设计**：添加模式状态管理和智能切换逻辑
3. **实现优化**：支持模式持久化和完整的错误处理
4. **用户体验**：提供清晰的选择界面和预期的自动切换行为

现在用户可以：
- ✅ 明确选择使用系统预设或自定义背景模式
- ✅ 享受符合预期的自动切换行为
- ✅ 模式选择会被保存，重启后自动恢复
- ✅ 在两种模式间无缝切换

这个功能增强了背景系统的灵活性和用户体验，让用户能够更好地控制背景切换行为。 