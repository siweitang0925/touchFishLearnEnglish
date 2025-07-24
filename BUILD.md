# 构建和发布指南

## 本地构建

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run electron-dev
```

### 本地构建
```bash
# 构建所有平台
npm run electron-pack

# 构建特定平台
npm run electron-pack-win    # Windows
npm run electron-pack-mac    # macOS
npm run electron-pack-linux  # Linux
```

## GitHub Actions 自动构建

### 触发构建
有两种方式触发 GitHub Actions 构建：

1. **推送标签**（推荐）
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **手动触发**
   - 在 GitHub 仓库页面点击 "Actions"
   - 选择 "Build and Release (Optimized)" 工作流
   - 点击 "Run workflow"

### 构建流程
1. **并行构建**：Windows、macOS、Linux 三个平台同时构建
2. **依赖安装**：使用 `npm ci` 确保依赖版本一致
3. **应用构建**：使用 Vite 构建前端代码
4. **Electron 打包**：使用 electron-builder 打包成可执行文件
5. **上传制品**：将构建结果上传为 GitHub Actions 制品
6. **创建发布**：自动创建 GitHub Release 并上传所有平台的文件

### 构建产物
- **Windows**: `.exe` 安装文件
- **macOS**: `.dmg` 文件
- **Linux**: `.AppImage` 文件

## 构建配置

### package.json 配置
```json
{
  "build": {
    "appId": "com.learnenglish.v2",
    "productName": "英语学习助手",
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
        "to": "backgrounds"
      },
      {
        "from": "data",
        "to": "data"
      }
    ]
  }
}
```

### 平台特定配置
- **Windows**: NSIS 安装程序，支持自定义安装目录
- **macOS**: DMG 文件，支持 Intel 和 Apple Silicon
- **Linux**: AppImage 文件，便携式运行

## 发布流程

### 1. 准备发布
```bash
# 确保代码已提交
git add .
git commit -m "准备发布 v1.0.0"

# 创建标签
git tag v1.0.0
```

### 2. 推送标签
```bash
git push origin main
git push origin v1.0.0
```

### 3. 监控构建
- 在 GitHub 仓库页面查看 Actions 标签页
- 等待所有平台的构建完成
- 检查构建日志确保没有错误

### 4. 发布完成
- 构建完成后会自动创建 GitHub Release
- 在 Release 页面可以下载所有平台的可执行文件
- 可以编辑 Release 说明添加更新内容

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本是否为 18+
   - 确保所有依赖都已正确安装
   - 查看 GitHub Actions 日志获取详细错误信息

2. **文件缺失**
   - 确保 `package.json` 中的 `files` 配置包含所有必要文件
   - 检查 `extraResources` 配置是否正确

3. **图标问题**
   - 确保 `assets/icon.png` 文件存在
   - 图标文件应该是 PNG 格式，建议尺寸 512x512

4. **权限问题**
   - 确保 GitHub Actions 有足够的权限创建 Release
   - 检查仓库设置中的 Actions 权限

### 调试技巧

1. **本地测试构建**
   ```bash
   # 测试 Windows 构建
   npm run electron-pack-win
   
   # 检查生成的文件
   ls release/
   ```

2. **查看构建日志**
   - 在 GitHub Actions 页面点击具体的构建任务
   - 展开每个步骤查看详细日志

3. **手动触发构建**
   - 使用 `workflow_dispatch` 手动触发构建
   - 可以指定特定的分支或标签

## 版本管理

### 语义化版本
建议使用语义化版本号：
- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 标签命名
```bash
# 正式版本
git tag v1.0.0

# 预发布版本
git tag v1.0.0-beta.1

# 发布候选版本
git tag v1.0.0-rc.1
```

## 自动化建议

### 1. 自动版本号
可以考虑使用 `standard-version` 自动管理版本号：
```bash
npm install --save-dev standard-version
```

在 `package.json` 中添加脚本：
```json
{
  "scripts": {
    "release": "standard-version && git push --follow-tags origin main"
  }
}
```

### 2. 自动更新日志
使用 `conventional-changelog` 自动生成更新日志：
```bash
npm install --save-dev conventional-changelog-cli
```

### 3. 代码质量检查
在构建前添加代码质量检查：
```yaml
- name: Lint code
  run: npm run lint

- name: Run tests
  run: npm test
```

## 安全考虑

### 1. 依赖安全
定期更新依赖以修复安全漏洞：
```bash
npm audit
npm audit fix
```

### 2. 代码签名
对于生产环境，建议对可执行文件进行代码签名：
- **Windows**: 使用代码签名证书
- **macOS**: 使用 Apple Developer 证书
- **Linux**: 使用 GPG 签名

### 3. 发布验证
在发布前验证构建产物的完整性：
- 测试安装过程
- 验证应用功能
- 检查文件完整性

## 总结

通过 GitHub Actions 自动化构建流程，可以：
- ✅ 自动构建多平台可执行文件
- ✅ 确保构建环境的一致性
- ✅ 简化发布流程
- ✅ 提供可靠的构建产物

建议在每次重要更新后都创建新的版本标签，这样可以保持版本历史的清晰性。 