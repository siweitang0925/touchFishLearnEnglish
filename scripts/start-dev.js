#!/usr/bin/env node

const { spawn } = require('child_process')
const http = require('http')

console.log('🚀 手动启动开发环境')
console.log('========================')

// 设置环境变量
process.env.NODE_ENV = 'development'

console.log('NODE_ENV 已设置为:', process.env.NODE_ENV)

// 启动Vite开发服务器
console.log('📦 启动Vite开发服务器...')
const vite = spawn('npm', ['run', 'dev'], { 
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
})

// 等待5秒后启动Electron
setTimeout(() => {
  console.log('⚡ 启动Electron应用...')
  const electron = spawn('electron', ['.'], { 
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  })
  
  electron.on('close', (code) => {
    console.log('Electron应用已退出，代码:', code)
    vite.kill()
  })
}, 3000)

// 处理进程退出
process.on('SIGINT', () => {
  console.log('收到中断信号，正在关闭...')
  vite.kill()
  process.exit(0)
}) 