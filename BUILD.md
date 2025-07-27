# 英语学习助手 - 构建和打包指南

## 📦 已生成的文件

### Windows 版本
- **安装包**: `release/英语学习助手 Setup 1.0.0.exe` (79MB)
- **可执行文件**: `release/win-unpacked/英语学习助手.exe` (155MB)
- **启动脚本**: `start.bat`

### Linux 版本
- **可执行文件**: `release/linux-unpacked/learn-english-v2` (158MB)

## 🚀 快速启动

### Windows 用户
1. 双击 `start.bat` 启动应用
2. 或者直接运行 `release/win-unpacked/英语学习助手.exe`

### Linux 用户
```bash
chmod +x release/linux-unpacked/learn-english-v2
./release/linux-unpacked/learn-english-v2
```

## 🔧 重新打包

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 构建命令

#### Windows 版本
```bash
npm run electron-pack-win
```

#### Linux 版本
```bash
npm run electron-pack-linux
```

#### macOS 版本
```bash
npm run electron-pack-mac
```

#### 所有平台
```bash
npm run electron-pack
```

## 📁 构建输出

构建完成后，文件将生成在 `release/` 目录下：

- `win-unpacked/` - Windows 可执行文件目录
- `linux-unpacked/` - Linux 可执行文件目录
- `英语学习助手 Setup 1.0.0.exe` - Windows 安装包
- `英语学习助手-1.0.0.AppImage` - Linux AppImage (需要管理员权限)

## ⚠️ 注意事项

1. **Linux AppImage 构建**: 在 Windows 上构建 Linux AppImage 需要管理员权限
2. **macOS 构建**: 只能在 macOS 系统上构建 macOS 版本
3. **文件大小**: 可执行文件较大是因为包含了完整的 Electron 运行时
4. **首次运行**: 应用首次启动可能需要几秒钟时间

## 🐛 故障排除

### 构建失败
1. 确保所有依赖已安装: `npm install`
2. 清理缓存: `npm run build` 然后重新打包
3. 检查 Node.js 版本是否兼容

### 应用无法启动
1. 检查是否缺少必要的 DLL 文件
2. 确保有足够的磁盘空间
3. 检查杀毒软件是否阻止了应用运行

## 📋 版本信息

- **应用名称**: 英语学习助手
- **版本**: 1.0.0
- **构建工具**: electron-builder 24.6.4
- **Electron 版本**: 24.8.8

## 🎯 下一步

1. 测试应用功能是否正常
2. 分发安装包给用户
3. 考虑使用代码签名提高安全性
4. 设置自动更新机制 