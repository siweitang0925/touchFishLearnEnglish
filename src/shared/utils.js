import { SPACED_REPETITION_CONFIG } from './constants.js'

/**
 * 格式化日期时间
 * @param {Date} date - 日期对象
 * @param {string} format - 格式化字符串
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 计算下次复习时间
 * @param {number} proficiency - 当前熟练度
 * @param {Date} lastReviewTime - 上次复习时间
 * @returns {Date} 下次复习时间
 */
export function calculateNextReviewTime(proficiency, lastReviewTime = new Date()) {
  const now = new Date()
  const interval = SPACED_REPETITION_CONFIG.intervals[proficiency] || 30
  
  // 如果是5星熟练度，使用费曼学习法间隔
  if (proficiency >= 5) {
    const feynmanInterval = SPACED_REPETITION_CONFIG.feynmanInterval
    return new Date(now.getTime() + feynmanInterval * 60 * 1000)
  }
  
  return new Date(now.getTime() + interval * 60 * 1000)
}

/**
 * 检查单词是否需要复习
 * @param {Object} word - 单词对象
 * @returns {boolean} 是否需要复习
 */
export function shouldReviewWord(word) {
  const now = new Date()
  const nextReview = new Date(word.nextReviewTime)
  
  // 如果熟练度达到5星，检查是否已经学习过今天
  if (word.proficiency >= 5) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const lastReview = new Date(word.lastReviewTime)
    const lastReviewDay = new Date(lastReview.getFullYear(), lastReview.getMonth(), lastReview.getDate())
    
    // 如果今天已经学习过，则不需要复习
    if (lastReviewDay.getTime() === today.getTime()) {
      return false
    }
  }
  
  return now >= nextReview
}

/**
 * 生成随机选项（用于选择题）
 * @param {string} correctAnswer - 正确答案
 * @param {Array} allMeanings - 所有可能的中文含义
 * @param {number} optionCount - 选项数量
 * @returns {Array} 选项数组
 */
export function generateRandomOptions(correctAnswer, allMeanings, optionCount = 6) {
  const options = [correctAnswer]
  
  // 过滤掉正确答案，避免重复
  const otherMeanings = allMeanings.filter(meaning => meaning !== correctAnswer)
  
  // 随机选择其他选项
  while (options.length < optionCount && otherMeanings.length > 0) {
    const randomIndex = Math.floor(Math.random() * otherMeanings.length)
    options.push(otherMeanings[randomIndex])
    otherMeanings.splice(randomIndex, 1)
  }
  
  // 如果选项不够，用默认选项填充
  const defaultOptions = ['不知道', '忘记了', '不确定']
  while (options.length < optionCount) {
    const defaultOption = defaultOptions[options.length - 3] || `选项${options.length}`
    options.push(defaultOption)
  }
  
  // 打乱选项顺序
  return shuffleArray(options)
}

/**
 * 打乱数组顺序
 * @param {Array} array - 要打乱的数组
 * @returns {Array} 打乱后的数组
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
} 