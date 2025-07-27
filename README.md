# 英语学习助手

一个轻量级的英语学习桌面应用，帮助用户通过卡片式学习提高英语词汇量。

## 🚀 快速开始

### 下载使用（推荐）
1. 下载最新版本的安装包：`release/英语学习助手 Setup 1.0.0.exe`
2. 运行安装程序，按照提示完成安装
3. 从开始菜单或桌面快捷方式启动应用

### 开发模式
```bash
# 安装依赖
npm install

# 启动开发模式
npm run electron-dev
```

## ✨ 主要功能

- 📚 **单词学习**: 卡片式学习界面，支持标记熟悉度
- 🔄 **智能复习**: 基于遗忘曲线的复习提醒
- 📊 **学习统计**: 详细的学习进度和统计数据
- 🎨 **自定义背景**: 支持自定义背景图片
- ⚙️ **个性化设置**: 丰富的个性化配置选项

## 📦 构建和打包

### 环境要求
- Node.js 16+
- npm 或 yarn

### 构建命令
```bash
# Windows 版本
npm run electron-pack-win

# Linux 版本  
npm run electron-pack-linux

# macOS 版本
npm run electron-pack-mac

# 所有平台
npm run electron-pack
```

详细构建说明请参考 [BUILD.md](./BUILD.md)

## 🛠️ 技术栈

- **前端**: Vue 3 + Vite + Naive UI
- **桌面**: Electron 24.8.8
- **数据库**: SQLite3
- **状态管理**: Pinia
- **构建工具**: electron-builder

## 📁 项目结构

```
touchFishLearnEnglish/
├── src/
│   ├── main/          # Electron 主进程
│   ├── renderer/      # Vue 渲染进程
│   └── shared/        # 共享模块
├── assets/            # 静态资源
├── data/              # 数据文件
├── release/           # 构建输出
└── tests/             # 测试文件
```

## 🎯 开发指南

### 开发环境设置
1. 克隆仓库
2. 安装依赖: `npm install`
3. 启动开发模式: `npm run electron-dev`

### 代码结构
- `src/main/`: Electron 主进程代码
- `src/renderer/`: Vue 前端代码
- `src/shared/`: 共享的工具和常量

### 测试
```bash
# 运行测试
npm test

# 构建测试
npm run test-build
```

## 📋 版本历史

### v1.0.0
- ✅ 基础单词学习功能
- ✅ 智能复习系统
- ✅ 学习统计
- ✅ 自定义背景
- ✅ 多平台支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 支持

如果遇到问题，请：
1. 查看 [BUILD.md](./BUILD.md) 中的故障排除部分
2. 提交 GitHub Issue
3. 检查 [context/](./context/) 目录中的开发文档 