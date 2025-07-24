# GitHub Actions 自动构建设置

## 概述

为英语学习助手应用设置了完整的 GitHub Actions 自动构建和发布流程，支持多平台构建和自动发布。

## 配置内容

### 1. GitHub Actions 工作流文件

#### 基础工作流 (`.github/workflows/build.yml`)
```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Build Electron app
        run: npm run electron-pack
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ runner.os }}-build
          path: release/
          retention-days: 30
```

#### 优化工作流 (`.github/workflows/build-optimized.yml`)
```yaml
name: Build and Release (Optimized)

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Build Windows executable
        run: npm run electron-pack-win
      
      - name: Upload Windows artifacts
        uses: actions/upload-artifact@v4
        with:
          name: windows-build
          path: release/
          retention-days: 30

  build-macos:
    runs-on: macos-latest
    # ... 类似的 macOS 构建步骤

  build-linux:
    runs-on: ubuntu-latest
    # ... 类似的 Linux 构建步骤

  create-release:
    needs: [build-windows, build-macos, build-linux]
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')
    
    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: artifacts
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            artifacts/windows/**/*
            artifacts/macos/**/*
            artifacts/linux/**/*
          draft: false
          prerelease: false
          generate_release_notes: true
```

### 2. 优化的 package.json 构建配置

```json
{
  "build": {
    "appId": "com.learnenglish.v2",
    "productName": "英语学习助手",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "node_modules/**/*",
      "src/main/**/*",
      "src/shared/**/*",
      "assets/**/*",
      "data/**/*"
    ],
    "extraResources": [
      {
        "from": "assets/backgrounds",
        "to": "backgrounds",
        "filter": ["**/*"]
      },
      {
        "from": "data",
        "to": "data",
        "filter": ["**/*"]
      }
    ],
    "mac": {
      "category": "public.app-category.education",
      "icon": "assets/icon.png",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ],
      "icon": "assets/icon.png"
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        }
      ],
      "category": "Education",
      "icon": "assets/icon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### 3. 构建脚本

```json
{
  "scripts": {
    "electron-pack": "npm run build && electron-builder",
    "electron-pack-win": "npm run build && electron-builder --win",
    "electron-pack-mac": "npm run build && electron-builder --mac",
    "electron-pack-linux": "npm run build && electron-builder --linux",
    "test-build": "node scripts/test-build.js"
  }
}
```

### 4. 构建验证脚本

创建了 `scripts/test-build.js` 脚本来验证构建配置：

```javascript
#!/usr/bin/env node

/**
 * 构建配置测试脚本
 * 用于验证构建配置是否正确
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 开始验证构建配置...\n')

// 检查必要文件是否存在
const requiredFiles = [
  'package.json',
  'src/main/index.js',
  'src/renderer/main.js',
  'assets/icon.png',
  'data/ielts-words.json'
]

// 验证文件存在性
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
})

// 验证 package.json 配置
// 验证 GitHub Actions 工作流
// 验证构建输出
```

## 功能特点

### 1. 多平台支持
- ✅ **Windows**: NSIS 安装程序，支持自定义安装目录
- ✅ **macOS**: DMG 文件，支持 Intel 和 Apple Silicon
- ✅ **Linux**: AppImage 文件，便携式运行

### 2. 自动化流程
- ✅ **触发方式**: 推送标签或手动触发
- ✅ **并行构建**: 三个平台同时构建
- ✅ **依赖缓存**: 使用 npm 缓存加速构建
- ✅ **自动发布**: 构建完成后自动创建 GitHub Release

### 3. 构建优化
- ✅ **文件包含**: 确保所有必要文件被包含
- ✅ **资源管理**: 正确处理背景图片和数据文件
- ✅ **图标支持**: 多平台图标配置
- ✅ **安装选项**: Windows 支持自定义安装

## 使用方法

### 1. 触发构建

#### 推送标签（推荐）
```bash
# 创建标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0
```

#### 手动触发
1. 在 GitHub 仓库页面点击 "Actions"
2. 选择 "Build and Release (Optimized)" 工作流
3. 点击 "Run workflow"

### 2. 监控构建
- 在 GitHub 仓库页面查看 Actions 标签页
- 等待所有平台的构建完成
- 检查构建日志确保没有错误

### 3. 下载发布
- 构建完成后会自动创建 GitHub Release
- 在 Release 页面可以下载所有平台的可执行文件
- 可以编辑 Release 说明添加更新内容

## 构建产物

### Windows
- **文件类型**: `.exe` 安装文件
- **安装方式**: NSIS 安装程序
- **特性**: 支持自定义安装目录、创建桌面快捷方式

### macOS
- **文件类型**: `.dmg` 文件
- **架构支持**: Intel (x64) 和 Apple Silicon (arm64)
- **安装方式**: 拖拽安装

### Linux
- **文件类型**: `.AppImage` 文件
- **特性**: 便携式运行，无需安装
- **兼容性**: 支持主流 Linux 发行版

## 验证结果

运行 `npm run test-build` 的验证结果：

```
🔍 开始验证构建配置...

📁 检查必要文件:
  ✅ package.json
  ✅ src/main/index.js
  ✅ src/renderer/main.js
  ✅ assets/icon.png
  ✅ data/ielts-words.json

📦 检查 package.json 配置:
  构建脚本:
    ✅ electron-pack
    ✅ electron-pack-win
    ✅ electron-pack-mac
    ✅ electron-pack-linux

  构建配置:
    ✅ appId: com.learnenglish.v2
    ✅ productName: 英语学习助手
    ✅ output: release
    ✅ files: 6 个文件模式
    ✅ extraResources: 2 个资源

🚀 检查 GitHub Actions 工作流:
  ✅ .github/workflows/build.yml
  ✅ .github/workflows/build-optimized.yml

📂 检查构建输出:
  ✅ dist 目录存在，包含 2 个文件/目录
  ✅ renderer 目录存在

📋 验证总结:
✅ 所有必要文件都存在

✨ 验证完成!
```

## 优势

### 1. 自动化程度高
- 无需手动构建和上传
- 自动处理多平台构建
- 自动创建发布页面

### 2. 可靠性强
- 使用 GitHub Actions 官方运行环境
- 依赖版本锁定确保一致性
- 完善的错误处理和日志记录

### 3. 用户体验好
- 一键触发构建
- 清晰的构建状态反馈
- 便捷的下载方式

### 4. 维护成本低
- 配置集中管理
- 自动化的测试和验证
- 详细的文档说明

## 总结

通过设置 GitHub Actions 自动构建流程，实现了：

1. **完全自动化**: 从代码提交到发布的全流程自动化
2. **多平台支持**: 同时构建 Windows、macOS、Linux 版本
3. **质量保证**: 通过验证脚本确保构建配置正确
4. **用户友好**: 提供清晰的下载和使用说明

现在用户只需要：
- 推送版本标签即可触发自动构建
- 在 GitHub Release 页面下载对应平台的可执行文件
- 享受一键安装和使用的便利

这个设置大大简化了软件的发布流程，提高了开发效率，也为用户提供了更好的使用体验。 