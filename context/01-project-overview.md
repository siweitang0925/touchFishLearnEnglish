# 项目概览

## 项目名称
英语学习助手 V2 (Learn English V2)

## 项目简介
一个基于间隔重复算法的智能英语学习桌面应用，帮助用户在摸鱼时间高效学习英语单词。采用Electron + Vue3技术栈，支持Windows、macOS、Linux系统。

## 核心特色
- **智能间隔重复**：基于科学的学习算法，自动安排复习时间
- **摸鱼学习模式**：后台运行，定时弹窗提醒，不影响正常工作
- **强制学习机制**：答错题目无法关闭，必须答对才能继续
- **雅思高频词汇**：内置50个雅思高频词汇，首次启动自动加载
- **精美界面设计**：采用Material Design风格，界面简洁美观

## 技术栈
- **核心框架**: Electron 25.0.0
- **前端框架**: Vue 3 + Vite
- **状态管理**: Pinia
- **数据库**: SQLite3
- **定时任务**: Node Schedule
- **UI设计**: Material Design + 自定义样式
- **打包工具**: electron-builder

## 项目状态
- **开发阶段**: 功能完善，持续优化
- **主要功能**: 已完成
- **测试状态**: 基本测试通过
- **部署状态**: 可正常打包运行

## 最近更新
- 修复了复习弹框时间间隔问题
- 优化了UI/UX设计，支持无边框弹框
- 实现了熟练度自动更新和界面同步
- 添加了英文单词长度兼容处理
- 整理了测试文件到tests目录

## 下一步计划
- 性能优化
- 用户体验改进
- 功能扩展
- 测试覆盖完善 