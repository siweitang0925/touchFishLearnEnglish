# 开发指南

## 环境要求
- Node.js 16.0+
- npm 或 yarn
- Git

## 项目启动

### 1. 安装依赖
```bash
npm install
```

### 2. 开发模式
```bash
npm run dev
```
启动开发服务器，支持热重载

### 3. 构建应用
```bash
# 构建前端
npm run build

# 启动Electron应用
npm run electron
```

### 4. 打包应用
```bash
npm run build:electron
```

## 开发规范

### 代码风格
- 使用ESLint进行代码检查
- 遵循Vue3 Composition API规范
- 使用TypeScript类型注解（可选）

### 文件命名
- 组件文件使用PascalCase：`WordList.vue`
- 工具文件使用camelCase：`wordStore.js`
- 常量文件使用camelCase：`constants.js`

### 目录结构
- 按功能模块组织代码
- 共享代码放在shared目录
- 测试文件放在tests目录

## 核心开发流程

### 1. 添加新功能
1. 在renderer/views/创建Vue组件
2. 在store/中添加状态管理
3. 在main/中添加后端逻辑
4. 在preload.js中暴露API
5. 更新路由配置

### 2. 数据库操作
1. 在database.js中添加数据库方法
2. 在index.js中添加IPC处理器
3. 在preload.js中暴露API
4. 在store中调用API

### 3. 窗口管理
1. 在index.js中创建BrowserWindow
2. 配置窗口属性（大小、样式等）
3. 处理窗口事件（关闭、最小化等）
4. 实现IPC通信

## 调试技巧

### 1. 主进程调试
```javascript
// 在main/index.js中添加
console.log('=== DEBUG: 调试信息 ===')
```

### 2. 渲染进程调试
```javascript
// 在Vue组件中添加
console.log('=== FRONTEND DEBUG: 调试信息 ===')
```

### 3. 数据库调试
```javascript
// 在database.js中添加
console.log('=== DB DEBUG: SQL执行 ===')
console.log('SQL:', sql)
console.log('参数:', params)
```

### 4. IPC通信调试
```javascript
// 在preload.js中添加
console.log('=== IPC DEBUG: 通信信息 ===')
```

## 常见问题解决

### 1. 端口占用
```bash
# 查看端口占用
netstat -ano | findstr :5173

# 杀死进程
taskkill /PID <进程ID> /F
```

### 2. 数据库连接问题
- 检查数据库文件路径
- 确保数据库文件存在
- 检查文件权限

### 3. 窗口显示问题
- 检查BrowserWindow配置
- 确认窗口创建成功
- 检查窗口事件处理

### 4. IPC通信问题
- 检查preload.js配置
- 确认API正确暴露
- 检查事件监听器

## 测试指南

### 1. 单元测试
```bash
# 运行测试
npm test
```

### 2. 集成测试
```bash
# 运行集成测试
npm run test:integration
```

### 3. 手动测试
- 启动应用进行功能测试
- 检查各个功能模块
- 验证数据持久化

## 部署指南

### 1. 开发环境
```bash
npm run dev
```

### 2. 生产环境
```bash
npm run build
npm run electron
```

### 3. 打包发布
```bash
npm run build:electron
```

## 性能优化

### 1. 前端优化
- 使用Vue3的响应式优化
- 合理使用computed和watch
- 避免不必要的组件重渲染

### 2. 后端优化
- 优化数据库查询
- 使用索引提高查询速度
- 合理使用缓存

### 3. 内存管理
- 及时清理定时器
- 关闭不需要的窗口
- 释放数据库连接

## 安全考虑

### 1. IPC通信安全
- 使用contextBridge安全暴露API
- 验证输入参数
- 限制API访问权限

### 2. 数据库安全
- 使用参数化查询防止SQL注入
- 验证用户输入
- 限制数据库访问权限

### 3. 文件系统安全
- 限制文件访问路径
- 验证文件类型
- 防止路径遍历攻击 