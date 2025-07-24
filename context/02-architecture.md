# 项目架构

## 整体架构
采用Electron的主进程-渲染进程架构，结合Vue3前端框架和SQLite数据库。

```
learnEnglishV2/
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── index.js         # 主进程入口，窗口管理，IPC通信
│   │   ├── database.js      # SQLite 数据库管理
│   │   ├── scheduler.js     # 定时任务调度，学习算法
│   │   └── preload.js       # 预加载脚本，API暴露
│   ├── renderer/            # 渲染进程 (Vue 3)
│   │   ├── App.vue          # 主应用组件
│   │   ├── main.js          # Vue 应用入口
│   │   ├── store/           # Pinia 状态管理
│   │   │   ├── wordStore.js # 单词数据管理
│   │   │   └── studyStore.js # 学习状态管理
│   │   └── views/           # 页面视图
│   │       ├── WordList.vue # 单词列表页面
│   │       ├── Review.vue   # 复习弹框页面
│   │       ├── Settings.vue # 设置页面
│   │       └── Statistics.vue # 统计页面
│   └── shared/              # 共享代码
│       ├── constants.js     # 常量定义
│       └── utils.js         # 工具函数
├── data/                    # 数据文件
│   └── ielts-words.json     # 雅思高频词汇
├── tests/                   # 测试和调试文件
└── dist/                    # 构建输出
```

## 核心模块

### 1. 主进程 (src/main/)
- **index.js**: 应用入口，窗口管理，IPC通信处理
- **database.js**: SQLite数据库操作，CRUD接口
- **scheduler.js**: 学习调度器，间隔重复算法实现
- **preload.js**: 安全API暴露给渲染进程

### 2. 渲染进程 (src/renderer/)
- **App.vue**: 主应用组件，路由管理
- **store/**: Pinia状态管理
  - **wordStore.js**: 单词数据状态管理
  - **studyStore.js**: 学习模式状态管理
- **views/**: 页面组件
  - **WordList.vue**: 单词列表管理
  - **Review.vue**: 复习弹框界面
  - **Settings.vue**: 设置页面
  - **Statistics.vue**: 学习统计

### 3. 共享模块 (src/shared/)
- **constants.js**: 应用常量定义
- **utils.js**: 通用工具函数

## 数据流

### 单词数据流
1. 用户操作 → Vue组件
2. Vue组件 → Pinia Store
3. Pinia Store → IPC通信
4. IPC → 主进程
5. 主进程 → SQLite数据库
6. 数据库 → 主进程 → IPC → Store → 组件

### 学习流程
1. 调度器定时触发 → 获取待复习单词
2. 创建复习窗口 → 显示单词测试
3. 用户答题 → 更新数据库
4. 关闭窗口 → 通知主界面刷新
5. 启动下一轮计时

## 关键技术点

### IPC通信
- 主进程与渲染进程通过IPC进行通信
- 使用contextBridge安全暴露API
- 支持双向通信和事件监听

### 状态管理
- 使用Pinia进行状态管理
- wordStore管理单词数据
- studyStore管理学习状态

### 数据库设计
- SQLite本地数据库
- 单词表：id, word, meaning, example, proficiency, reviewCount, correctCount, wrongCount, lastReviewTime, nextReviewTime
- 设置表：key-value存储
- 学习日志表：记录每次复习结果

### 学习算法
- 间隔重复算法：根据熟练度调整复习间隔
- 费曼学习法：熟练度5星后采用长期复习策略 