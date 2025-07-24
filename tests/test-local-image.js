/**
 * 测试本地图片存储和显示功能
 */

const { app } = require('electron')
const path = require('path')
const fs = require('fs').promises

async function testLocalImage() {
  console.log('=== 测试本地图片功能 ===')
  
  try {
    // 1. 获取应用数据目录
    const appData = app.getPath('userData')
    const imagesPath = path.join(appData, 'backgrounds')
    console.log('应用数据目录:', appData)
    console.log('图片存储目录:', imagesPath)
    
    // 2. 确保目录存在
    await fs.mkdir(imagesPath, { recursive: true })
    console.log('✅ 图片目录创建成功')
    
    // 3. 检查目录中的文件
    const files = await fs.readdir(imagesPath)
    console.log('目录中的文件:', files)
    
    // 4. 测试文件路径转换
    const testFileName = 'bg_1234567890.jpg'
    const testRelativePath = `backgrounds/${testFileName}`
    const testFullPath = path.join(appData, testRelativePath)
    const testFileUrl = `file://${testFullPath.replace(/\\/g, '/')}`
    
    console.log('测试路径转换:')
    console.log('  相对路径:', testRelativePath)
    console.log('  完整路径:', testFullPath)
    console.log('  文件URL:', testFileUrl)
    
    // 5. 检查文件是否存在
    try {
      await fs.access(testFullPath)
      console.log('✅ 测试文件存在')
    } catch (error) {
      console.log('❌ 测试文件不存在 (这是正常的，因为我们没有创建它)')
    }
    
    console.log('=== 测试完成 ===')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testLocalImage()
}

module.exports = { testLocalImage } 