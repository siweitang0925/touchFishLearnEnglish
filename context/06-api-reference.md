# API 参考文档

## IPC 通信 API

### 主进程 → 渲染进程 (事件)

#### 1. study-mode-status-changed
**描述**: 学习模式状态变化通知
**参数**: 
```javascript
{
  isRunning: boolean // 学习模式是否运行中
}
```
**使用示例**:
```javascript
window.electronAPI.onStudyModeStatusChanged((data) => {
  console.log('学习模式状态:', data.isRunning)
})
```

#### 2. refresh-words
**描述**: 刷新单词列表通知
**参数**: 无
**使用示例**:
```javascript
window.electronAPI.onRefreshWords(() => {
  wordStore.refreshWords()
})
```

### 渲染进程 → 主进程 (调用)

#### 1. 学习模式控制

##### startStudyMode()
**描述**: 启动学习模式
**返回**: `Promise<{success: boolean, message?: string}>`
**使用示例**:
```javascript
const result = await window.electronAPI.startStudyMode()
if (result.success) {
  console.log('学习模式已启动')
}
```

##### stopStudyMode()
**描述**: 停止学习模式
**返回**: `Promise<{success: boolean, message?: string}>`
**使用示例**:
```javascript
const result = await window.electronAPI.stopStudyMode()
if (result.success) {
  console.log('学习模式已停止')
}
```

##### getSchedulerStatus()
**描述**: 获取调度器状态
**返回**: `Promise<{isRunning: boolean, nextReview?: string}>`
**使用示例**:
```javascript
const status = await window.electronAPI.getSchedulerStatus()
console.log('调度器状态:', status)
```

#### 2. 复习窗口控制

##### closeReviewWindow()
**描述**: 关闭复习窗口
**返回**: `Promise<{success: boolean}>`
**使用示例**:
```javascript
await window.electronAPI.closeReviewWindow()
```

##### refreshMainWindowWords()
**描述**: 刷新主窗口单词列表
**返回**: `Promise<{success: boolean}>`
**使用示例**:
```javascript
await window.electronAPI.refreshMainWindowWords()
```

#### 3. 单词数据管理

##### getAllWords()
**描述**: 获取所有单词
**返回**: `Promise<{success: boolean, data?: Array<Word>}>`
**使用示例**:
```javascript
const result = await window.electronAPI.getAllWords()
if (result.success) {
  console.log('单词列表:', result.data)
}
```

##### addWord(wordData)
**描述**: 添加单词
**参数**: 
```javascript
{
  word: string,      // 英文单词
  meaning: string,   // 中文含义
  example?: string   // 例句（可选）
}
```
**返回**: `Promise<{success: boolean, data?: {id: number}}>`
**使用示例**:
```javascript
const result = await window.electronAPI.addWord({
  word: 'hello',
  meaning: '你好',
  example: 'Hello, world!'
})
```

##### updateWord(id, wordData)
**描述**: 更新单词
**参数**: 
- `id`: number - 单词ID
- `wordData`: 同addWord参数
**返回**: `Promise<{success: boolean}>`
**使用示例**:
```javascript
const result = await window.electronAPI.updateWord(1, {
  word: 'hello',
  meaning: '你好',
  example: 'Hello, world!'
})
```

##### deleteWord(id)
**描述**: 删除单词
**参数**: `id: number` - 单词ID
**返回**: `Promise<{success: boolean}>`
**使用示例**:
```javascript
const result = await window.electronAPI.deleteWord(1)
```

##### searchWords(keyword)
**描述**: 搜索单词
**参数**: `keyword: string` - 搜索关键词
**返回**: `Promise<{success: boolean, data?: Array<Word>}>`
**使用示例**:
```javascript
const result = await window.electronAPI.searchWords('hello')
```

##### updateWordReview(wordId, isCorrect)
**描述**: 更新单词学习结果
**参数**: 
- `wordId`: number - 单词ID
- `isCorrect`: boolean - 是否答对
**返回**: `Promise<{success: boolean}>`
**使用示例**:
```javascript
const result = await window.electronAPI.updateWordReview(1, true)
```

#### 4. 设置管理

##### updateSettings(settings)
**描述**: 更新应用设置
**参数**: 
```javascript
{
  studyInterval: number,  // 学习间隔（秒）
  autoStart: boolean,     // 自动启动
  soundEnabled: boolean,  // 声音提醒
  trayEnabled: boolean    // 系统托盘
}
```
**返回**: `Promise<{success: boolean}>`
**使用示例**:
```javascript
const result = await window.electronAPI.updateSettings({
  studyInterval: 60,
  autoStart: false,
  soundEnabled: true,
  trayEnabled: true
})
```

#### 5. 数据管理

##### initIeltsWords()
**描述**: 初始化雅思词汇
**返回**: `Promise<{success: boolean, message?: string}>`
**使用示例**:
```javascript
const result = await window.electronAPI.initIeltsWords()
```

##### resetWordsReviewTime()
**描述**: 重置所有单词的复习时间
**返回**: `Promise<{success: boolean, message?: string}>`
**使用示例**:
```javascript
const result = await window.electronAPI.resetWordsReviewTime()
```

##### getStudyStats()
**描述**: 获取学习统计
**返回**: `Promise<{success: boolean, data?: StudyStats}>`
**使用示例**:
```javascript
const result = await window.electronAPI.getStudyStats()
```

## 数据类型定义

### Word 对象
```javascript
{
  id: number,                    // 单词ID
  word: string,                  // 英文单词
  meaning: string,               // 中文含义
  example?: string,              // 例句
  proficiency: number,           // 熟练度（0-5）
  reviewCount: number,           // 复习次数
  correctCount: number,          // 答对次数
  wrongCount: number,            // 答错次数
  lastReviewTime: string,        // 最后复习时间
  nextReviewTime: string,        // 下次复习时间
  createdAt: string,             // 创建时间
  updatedAt: string,             // 更新时间
  isFavorite: boolean            // 是否收藏
}
```

### StudyStats 对象
```javascript
{
  totalWords: number,            // 总单词数
  masteredWords: number,         // 已掌握单词数
  learningWords: number,         // 学习中单词数
  totalReviews: number,          // 总复习次数
  correctRate: number,           // 正确率
  averageProficiency: number     // 平均熟练度
}
```

## 错误处理

### 常见错误类型
1. **数据库错误**: 数据库连接或操作失败
2. **IPC错误**: 进程间通信失败
3. **文件系统错误**: 文件读写失败
4. **窗口错误**: 窗口创建或操作失败

### 错误处理示例
```javascript
try {
  const result = await window.electronAPI.addWord(wordData)
  if (result.success) {
    console.log('操作成功')
  } else {
    console.error('操作失败:', result.message)
  }
} catch (error) {
  console.error('API调用失败:', error)
}
```

## 调试技巧

### 1. 启用调试日志
在preload.js中添加调试日志：
```javascript
console.log('=== IPC DEBUG: API调用 ===')
console.log('方法:', methodName)
console.log('参数:', params)
```

### 2. 检查API可用性
```javascript
if (window.electronAPI && window.electronAPI.addWord) {
  console.log('API可用')
} else {
  console.error('API不可用')
}
```

### 3. 监听所有IPC事件
```javascript
// 在preload.js中添加
ipcRenderer.on('*', (event, ...args) => {
  console.log('收到IPC事件:', event.channel, args)
})
``` 