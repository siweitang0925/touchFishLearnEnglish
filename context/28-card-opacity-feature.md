# 主界面透明度功能

## 功能概述

为了解决自定义背景设置后主界面内容区域遮挡背景图片的问题，新增了主界面透明度设置功能。用户可以通过滑块控制主界面背景框的下一级内容框的透明度，让背景图片更加清晰地显示出来。

## 功能特性

### 1. 透明度控制
- **滑块控制**：提供0.1到1.0的透明度范围（10%-100%）
- **精确调节**：按1%间隔变化（0.01步长）
- **实时预览**：调整滑块时实时显示透明度百分比
- **平滑过渡**：透明度变化有0.3秒的平滑过渡动画

### 2. 影响范围
透明度设置只针对主界面背景框的下一级内容框：
- 页面容器（`.app-main .page-container`）

**不影响的元素**：
- 弹框和模态框
- 单词卡片（`.word-card`）
- 搜索框和按钮
- 设置按钮和控件
- 导航栏和头部

### 3. 设置持久化
- 透明度设置自动保存到 `localStorage`
- 应用重启后自动恢复上次的透明度设置
- 默认透明度为90%（0.9）

## 实现细节

### 1. 背景设置组件增强
在 `BackgroundSettings.vue` 中添加了透明度控制区域：

```vue
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
    <label class="control-label">预览效果</label>
    <div class="opacity-preview">
      <div 
        class="preview-card"
        :style="{ opacity: cardOpacity }"
      >
        <div class="preview-content">
          <h4>主界面预览</h4>
          <p>这是主界面内容区域的透明度预览效果</p>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 2. 主应用透明度管理
在 `App.vue` 中添加了透明度状态管理和事件处理：

```javascript
// 透明度状态
const cardOpacity = ref(0.9)

// 透明度变化事件处理
const handleCardOpacityChange = (event) => {
  const { opacity } = event.detail
  cardOpacity.value = opacity
  applyCardOpacity(opacity)
}

// 应用透明度到主界面内容区域
const applyCardOpacity = (opacity) => {
  // 只针对主界面背景框的下一级内容框应用透明度
  // 即 .app-main 下的 .page-container
  const pageContainers = document.querySelectorAll('.app-main .page-container')
  
  pageContainers.forEach(container => {
    container.style.opacity = opacity
    container.style.transition = 'opacity 0.3s ease'
  })
}
```

### 3. 事件通信机制
使用自定义事件在组件间通信：

```javascript
// 触发透明度变化事件
document.dispatchEvent(new CustomEvent('cardOpacityChange', {
  detail: { opacity: cardOpacity.value }
}))

// 监听透明度变化事件
document.addEventListener('cardOpacityChange', handleCardOpacityChange)
```

### 4. CSS样式增强
为主界面内容区域添加透明度过渡效果：

```css
/* 主界面透明度样式 */
.app-main .page-container {
  transition: opacity 0.3s ease;
}
```

## 使用方法

### 1. 访问透明度设置
1. 打开应用
2. 点击"设置"菜单
3. 在"个性化设置"区域找到"背景设置"按钮
4. 点击"背景设置"按钮打开背景设置弹框
5. 在弹框中找到"主界面透明度"控制区域

### 2. 调整透明度
1. 拖动滑块调整透明度（10%-100%，按1%间隔变化）
2. 实时查看百分比显示
3. 观察预览效果
4. 设置会自动保存

### 3. 查看效果
- 透明度设置会立即应用到主界面内容区域
- 背景图片会透过半透明的内容区域显示
- 弹框、单词卡片、搜索框等元素不受影响
- 所有页面的主内容区域都会受到影响

## 技术要点

### 1. 性能优化
- 使用 `setTimeout` 延迟初始化透明度应用，确保DOM元素已加载
- 使用事件委托减少事件监听器数量
- 透明度变化使用CSS过渡而非JavaScript动画

### 2. 兼容性
- 支持所有现代浏览器
- 滑块样式兼容Webkit和Firefox
- 响应式设计适配不同屏幕尺寸

### 3. 用户体验
- 实时预览效果
- 平滑的过渡动画
- 直观的百分比显示
- 设置自动保存和恢复

## 测试验证

创建了测试页面 `tests/test-opacity.html` 用于验证透明度功能：

- 模拟透明度控制界面
- 测试多个卡片的透明度效果
- 验证localStorage保存和恢复
- 测试平滑过渡动画

## 后续优化建议

1. **选择性透明度**：允许用户为不同类型的卡片设置不同的透明度
2. **透明度预设**：提供几个常用的透明度预设值
3. **键盘快捷键**：添加键盘快捷键快速调整透明度
4. **动画效果**：为透明度变化添加更丰富的动画效果
5. **性能监控**：监控透明度变化对性能的影响

## 文件修改清单

- `src/renderer/components/BackgroundSettings.vue` - 添加透明度控制UI
- `src/renderer/App.vue` - 添加透明度状态管理和事件处理
- `tests/test-opacity.html` - 创建测试页面

## 版本信息

- **功能版本**：v1.0.0
- **实现日期**：2025-07-25
- **兼容性**：Electron 24.8.8, Vue 3.3.8 