# 核心功能详解

## 1. 生词本管理

### 功能描述
提供完整的单词管理功能，支持添加、编辑、删除、搜索单词。

### 主要特性
- **添加单词**: 支持英文单词、中文含义、例句
- **编辑单词**: 修改已有单词的信息
- **删除单词**: 删除不需要的单词
- **搜索功能**: 支持单词、含义、例句的模糊搜索
- **批量导入**: 支持雅思高频词汇批量导入

### 技术实现
- 前端：Vue3组件 + Pinia状态管理
- 后端：SQLite数据库CRUD操作
- 通信：IPC双向通信

## 2. 智能学习系统

### 间隔重复算法
基于科学的学习算法，根据熟练度自动调整复习间隔：

| 熟练度 | 复习间隔 | 说明 |
|--------|----------|------|
| 0星 | 30分钟 | 新单词，需要频繁复习 |
| 1星 | 1小时 | 初步掌握 |
| 2星 | 4小时 | 基本掌握 |
| 3星 | 1天 | 较好掌握 |
| 4星 | 3天 | 熟练掌握 |
| 5星 | 1周 | 完全掌握 |

### 费曼学习法
- 熟练度达到5星后，采用2周间隔复习
- 当天已学习过的单词不再重复弹出
- 确保长期记忆效果

### 学习统计
- 总单词数统计
- 已掌握单词数（熟练度5星）
- 学习进度统计
- 正确率统计
- 复习次数统计

## 3. 摸鱼学习模式

### 功能描述
后台运行的学习模式，定时弹出单词测试，不影响正常工作。

### 核心特性
- **定时提醒**: 自定义学习间隔（支持秒级精度）
- **强制学习**: 答错题目时窗口无法关闭，必须答对
- **系统托盘**: 启动学习模式后自动最小化到系统托盘
- **后台运行**: 不影响正常工作，静默学习
- **智能调度**: 基于间隔重复算法的智能复习安排

### 技术实现
- **调度器**: 使用node-schedule实现定时任务
- **窗口管理**: Electron BrowserWindow创建复习窗口
- **状态同步**: IPC通信保持主界面与学习状态同步

## 4. 复习弹框系统

### UI/UX设计
- **无边框设计**: 现代化的无边框弹框
- **毛玻璃效果**: 使用backdrop-filter实现毛玻璃效果
- **卡片布局**: 6个选项以3列卡片形式展示
- **圆角设计**: 整个窗口采用圆角设计
- **响应式**: 支持不同屏幕尺寸

### 交互设计
- **直接提交**: 点击中文卡片直接提交答案
- **即时反馈**: 答对自动关闭，答错保持显示
- **例句展示**: 答错时在英文下方显示例句
- **悬浮提示**: 长文本支持悬浮显示完整内容

### 技术实现
- **窗口配置**: frame: false, transparent: true, roundedCorners: true
- **CSS样式**: backdrop-filter, border-radius, grid布局
- **状态管理**: Vue3响应式状态管理

## 5. 个性化设置

### 可配置项
- **学习间隔**: 支持分钟和秒级精度设置
- **自动保存**: 设置变更自动保存，无需手动保存
- **声音提醒**: 开启/关闭声音提醒
- **系统托盘**: 开启/关闭系统托盘功能
- **开机自启**: 设置开机自动启动

### 技术实现
- **实时更新**: 使用@input事件实现实时更新
- **自动保存**: 设置变更立即调用API保存
- **状态同步**: 学习模式运行时设置变更立即生效

## 6. 数据持久化

### 数据库设计
```sql
-- 单词表
CREATE TABLE words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT UNIQUE NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  proficiency INTEGER DEFAULT 0,
  reviewCount INTEGER DEFAULT 0,
  correctCount INTEGER DEFAULT 0,
  wrongCount INTEGER DEFAULT 0,
  lastReviewTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  nextReviewTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  isFavorite BOOLEAN DEFAULT 0
);

-- 设置表
CREATE TABLE settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学习日志表
CREATE TABLE study_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wordId INTEGER NOT NULL,
  isCorrect BOOLEAN NOT NULL,
  reviewTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wordId) REFERENCES words (id)
);
```

### 数据同步
- **实时同步**: 复习结果立即更新数据库
- **界面刷新**: 复习窗口关闭后自动刷新主界面
- **状态一致**: 确保数据库与界面状态一致 