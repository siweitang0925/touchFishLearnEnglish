/**
 * 图片存储管理器
 * 负责将本地图片保存到应用目录并管理图片资源
 */

class ImageStorage {
  constructor() {
    this.storagePath = null
    this.imagesPath = null
  }

  /**
   * 初始化图片存储
   */
  async init() {
    try {
      // 检查 electronAPI 是否可用
      if (!window.electronAPI) {
        console.warn('electronAPI 不可用，跳过图片存储初始化')
        return
      }
      
      // 获取应用数据目录
      const appData = await window.electronAPI.getAppDataPath()
      this.storagePath = appData
      this.imagesPath = `${appData}/backgrounds`
      
      // 确保图片目录存在
      await window.electronAPI.ensureDirectory(this.imagesPath)
      
      console.log('图片存储初始化完成:', this.imagesPath)
    } catch (error) {
      console.error('图片存储初始化失败:', error)
      // 不抛出错误，避免阻止应用启动
    }
  }

  /**
   * 保存图片文件到本地
   * @param {File} file - 图片文件
   * @returns {Promise<string>} 返回图片的相对路径
   */
  async saveImage(file) {
    try {
      // 生成唯一文件名
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const fileName = `bg_${timestamp}.${extension}`
      const filePath = `${this.imagesPath}/${fileName}`
      
      console.log('保存图片:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type
      })
      
      // 将文件保存到本地
      const arrayBuffer = await file.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)
      
      const result = await window.electronAPI.saveFile(filePath, buffer)
      console.log('保存文件结果:', result)
      
      // 返回相对路径，用于在应用中引用
      const relativePath = `backgrounds/${fileName}`
      console.log('返回相对路径:', relativePath)
      return relativePath
    } catch (error) {
      console.error('保存图片失败:', error)
      throw new Error('保存图片失败')
    }
  }

  /**
   * 获取图片的完整路径
   * @param {string} relativePath - 相对路径
   * @returns {string} 完整路径
   */
  getImagePath(relativePath) {
    if (!relativePath) return null
    
    // 如果是网络URL，直接返回
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath
    }
    
    // 如果是相对路径，拼接完整路径
    const fullPath = `${this.storagePath}/${relativePath}`
    
    console.log('获取图片路径:', {
      relativePath,
      storagePath: this.storagePath,
      fullPath
    })
    
    return fullPath
  }

  /**
   * 删除图片文件
   * @param {string} relativePath - 相对路径
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteImage(relativePath) {
    try {
      if (!relativePath || relativePath.startsWith('http')) {
        return true // 网络图片不需要删除文件
      }
      
      const fullPath = this.getImagePath(relativePath)
      await window.electronAPI.deleteFile(fullPath)
      return true
    } catch (error) {
      console.error('删除图片失败:', error)
      return false
    }
  }

  /**
   * 检查图片文件是否存在
   * @param {string} relativePath - 相对路径
   * @returns {Promise<boolean>} 是否存在
   */
  async imageExists(relativePath) {
    try {
      if (!relativePath || relativePath.startsWith('http')) {
        return true // 网络图片假设存在
      }
      
      const fullPath = this.getImagePath(relativePath)
      return await window.electronAPI.fileExists(fullPath)
    } catch (error) {
      console.error('检查图片存在性失败:', error)
      return false
    }
  }

  /**
   * 获取所有本地图片
   * @returns {Promise<string[]>} 图片路径列表
   */
  async getAllLocalImages() {
    try {
      const files = await window.electronAPI.readDirectory(this.imagesPath)
      return files.filter(file => {
        const ext = file.toLowerCase().split('.').pop()
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
      }).map(file => `backgrounds/${file}`)
    } catch (error) {
      console.error('获取本地图片失败:', error)
      return []
    }
  }
}

// 创建单例实例
const imageStorage = new ImageStorage()

export default imageStorage 