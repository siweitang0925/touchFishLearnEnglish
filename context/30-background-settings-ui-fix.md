# 背景设置UI修复 - 按钮状态更新问题

## 问题描述

用户反馈在背景设置中，当前背景选择【系统预设】或者【自定义背景】时，点击的按钮虽然点击到了，但是按钮没变化，看不出来已经切换选择了。

## 问题分析

### 根本原因
Vue 的响应式系统没有检测到 `backgroundManager` 内部状态的变化，导致按钮的激活状态没有正确更新。

### 具体问题
1. **响应式更新问题**：`isSystemBackground` 计算属性基于 `backgroundManager.getCurrentMode()` 方法，但 Vue 无法检测到这个方法返回值的变化
2. **缺少响应式状态**：没有在组件内部维护响应式的模式状态
3. **事件监听不完整**：模式变化事件没有正确更新 UI 状态

## 解决方案

### 1. 添加响应式的模式状态

在 `BackgroundSettings.vue` 中添加响应式的模式状态：

```javascript
// 响应式状态
const currentMode = ref('system') // 添加响应式的模式状态
```

### 2. 修改计算属性基于响应式状态

将 `isSystemBackground` 计算属性改为基于响应式状态：

```javascript
const isSystemBackground = computed(() => {
  console.log('当前模式:', currentMode.value, 'isSystemBackground:', currentMode.value === 'system')
  return currentMode.value === 'system'
})
```

### 3. 在加载设置时初始化模式状态

修改 `loadSettings` 方法，确保加载时设置正确的模式：

```javascript
const loadSettings = () => {
  // 加载背景列表
  backgrounds.value = backgroundManager.getAllBackgrounds()
  currentBackground.value = backgroundManager.getCurrentBackground()
  
  // 加载当前模式
  currentMode.value = backgroundManager.getCurrentMode()
  console.log('加载设置，当前模式:', currentMode.value)
  
  // 加载其他设置...
}
```

### 4. 在模式切换时更新响应式状态

修改模式切换方法，确保它们更新响应式状态：

```javascript
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
```

### 5. 在模式变化事件中更新响应式状态

修改模式变化事件处理器：

```javascript
const handleModeChange = (event) => {
  const { mode } = event.detail
  console.log('收到模式变化事件:', mode)
  currentMode.value = mode // 更新响应式状态
}
```

### 6. 在背景管理器中添加模式变化事件

在 `backgroundManager.js` 中添加模式变化事件：

```javascript
/**
 * 触发模式变化事件
 */
emitModeChange(mode) {
  try {
    const event = new CustomEvent('modeChange', {
      detail: { mode }
    })
    document.dispatchEvent(event)
  } catch (error) {
    console.error('触发模式变化事件失败:', error)
  }
}
```

在模式切换方法中触发事件：

```javascript
switchToSystemMode() {
  this.mode = 'system'
  this.saveMode()
  // ... 其他逻辑
  this.emitModeChange('system') // 添加这行
  return true
}

switchToCustomMode() {
  this.mode = 'custom'
  this.saveMode()
  // ... 其他逻辑
  this.emitModeChange('custom') // 添加这行
  return true
}
```

## 按钮样式逻辑

按钮的样式逻辑保持不变：

```html
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
```

## 修复效果

修复后，当用户点击模式切换按钮时：

1. **按钮状态会立即更新**：
   - 点击"系统预设"按钮时，该按钮会立即显示为激活状态（蓝色渐变背景）
   - 点击"自定义背景"按钮时，该按钮会立即显示为激活状态（绿色渐变背景）

2. **控制台会显示调试信息**：
   - 显示当前模式
   - 显示 `isSystemBackground` 的值
   - 显示模式切换的日志

3. **模式切换会正确保存和应用**：
   - 模式设置会保存到 `localStorage`
   - 重新打开应用时会加载正确的模式

## 技术要点

1. **Vue 响应式系统**：确保状态变化能够触发 UI 更新
2. **事件驱动架构**：使用自定义事件进行组件间通信
3. **状态管理**：在组件内部维护响应式状态，避免直接依赖外部对象
4. **调试支持**：添加详细的日志输出，便于问题排查

## 相关文件

- `src/renderer/components/BackgroundSettings.vue` - 背景设置组件
- `src/shared/backgroundManager.js` - 背景管理器

## 测试方法

1. 打开应用
2. 进入背景设置
3. 点击"系统预设"按钮 - 应该看到按钮立即变为激活状态
4. 点击"自定义背景"按钮 - 应该看到按钮立即变为激活状态
5. 查看浏览器控制台的调试信息 