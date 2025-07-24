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

console.log('📁 检查必要文件:')
let allFilesExist = true

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
  if (!exists) {
    allFilesExist = false
  }
})

console.log()

// 检查 package.json 配置
console.log('📦 检查 package.json 配置:')

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  
  // 检查构建脚本
  const buildScripts = [
    'electron-pack',
    'electron-pack-win',
    'electron-pack-mac',
    'electron-pack-linux'
  ]
  
  console.log('  构建脚本:')
  buildScripts.forEach(script => {
    const exists = packageJson.scripts && packageJson.scripts[script]
    console.log(`    ${exists ? '✅' : '❌'} ${script}`)
  })
  
  // 检查构建配置
  console.log('\n  构建配置:')
  if (packageJson.build) {
    console.log(`    ✅ appId: ${packageJson.build.appId}`)
    console.log(`    ✅ productName: ${packageJson.build.productName}`)
    console.log(`    ✅ output: ${packageJson.build.directories?.output}`)
    
    if (packageJson.build.files) {
      console.log(`    ✅ files: ${packageJson.build.files.length} 个文件模式`)
    }
    
    if (packageJson.build.extraResources) {
      console.log(`    ✅ extraResources: ${packageJson.build.extraResources.length} 个资源`)
    }
  } else {
    console.log('    ❌ 缺少 build 配置')
  }
  
} catch (error) {
  console.log(`    ❌ 解析 package.json 失败: ${error.message}`)
}

console.log()

// 检查 GitHub Actions 工作流
console.log('🚀 检查 GitHub Actions 工作流:')
const workflowFiles = [
  '.github/workflows/build.yml',
  '.github/workflows/build-optimized.yml'
]

workflowFiles.forEach(file => {
  const exists = fs.existsSync(file)
  console.log(`  ${exists ? '✅' : '❌'} ${file}`)
})

console.log()

// 检查 dist 目录（如果存在）
console.log('📂 检查构建输出:')
if (fs.existsSync('dist')) {
  const distFiles = fs.readdirSync('dist')
  console.log(`  ✅ dist 目录存在，包含 ${distFiles.length} 个文件/目录`)
  
  if (distFiles.includes('renderer')) {
    console.log('  ✅ renderer 目录存在')
  } else {
    console.log('  ❌ renderer 目录不存在')
  }
} else {
  console.log('  ⚠️  dist 目录不存在（需要先运行 npm run build）')
}

console.log()

// 总结
console.log('📋 验证总结:')
if (allFilesExist) {
  console.log('✅ 所有必要文件都存在')
} else {
  console.log('❌ 部分必要文件缺失')
}

console.log('\n🎯 下一步操作:')
console.log('1. 如果所有检查都通过，可以运行: npm run build')
console.log('2. 然后运行: npm run electron-pack-win (测试 Windows 构建)')
console.log('3. 推送标签触发 GitHub Actions: git tag v1.0.0 && git push origin v1.0.0')

console.log('\n✨ 验证完成!') 