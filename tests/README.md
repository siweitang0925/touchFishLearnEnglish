# Tests Directory

这个目录包含了项目的测试和调试文件。

## 文件说明

### 数据库相关测试
- `check-db.js` - 检查数据库连接和基本功能
- `check-db-actual.js` - 检查实际数据库路径和内容
- `create-settings-table.js` - 创建设置表的脚本

### 调试文件
- `debug-frontend.js` - 前端调试脚本
- `debug-review-flow.js` - 复习流程调试脚本
- `debug-settings.js` - 设置相关调试脚本
- `debug-words.js` - 单词数据调试脚本

### 测试文件
- `test-ipc.js` - IPC通信测试
- `test-manual-review.js` - 手动复习测试
- `test-proficiency-update.js` - 熟练度更新测试
- `test-review-manual.js` - 手动复习窗口测试
- `test-review-trigger.js` - 复习触发测试
- `test-review-window.js` - 复习窗口测试
- `test-trigger-review.js` - 触发复习功能测试

### 工具脚本
- `set-interval-1min.js` - 设置学习间隔为1分钟的脚本

## 使用方法

这些文件主要用于开发和调试阶段，可以通过以下方式运行：

```bash
# 在项目根目录下运行
node tests/[文件名].js
```

## 注意事项

- 这些文件仅用于开发和调试，不应在生产环境中使用
- 运行前请确保数据库已正确初始化
- 某些测试文件可能需要应用正在运行才能正常工作 