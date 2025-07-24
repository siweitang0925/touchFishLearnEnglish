// 应用常量定义
export const APP_NAME = '英语学习助手'
export const APP_VERSION = '1.0.0'

// 数据库相关
export const DB_NAME = 'learn_english.db'
export const DB_VERSION = '1.0'

// 学习相关常量
export const MAX_PROFICIENCY = 5
export const MIN_PROFICIENCY = 0
export const DEFAULT_PROFICIENCY = 0

// 间隔重复算法配置
export const SPACED_REPETITION_CONFIG = {
  // 熟练度对应的复习间隔（分钟）
  intervals: {
    0: 30,    // 0星：30分钟后复习
    1: 60,    // 1星：1小时后复习
    2: 240,   // 2星：4小时后复习
    3: 1440,  // 3星：1天后复习
    4: 4320,  // 4星：3天后复习
    5: 10080  // 5星：1周后复习
  },
  // 费曼学习法间隔（熟练度5星后）
  feynmanInterval: 20160 // 2周后复习
}

// 学习模式配置
export const LEARNING_MODES = {
  NORMAL: 'normal',      // 普通模式
  FORCE: 'force'         // 强制学习模式
}

// 通知类型
export const NOTIFICATION_TYPES = {
  WORD_REVIEW: 'word_review',
  STUDY_REMINDER: 'study_reminder',
  ACHIEVEMENT: 'achievement'
}

// UI主题色
export const THEME_COLORS = {
  primary: '#4361ee',
  primaryLight: '#4895ef',
  secondary: '#06d6a0',
  success: '#06d6a0',
  warning: '#ffd166',
  danger: '#ef476f',
  dark: '#2b2d42',
  light: '#f8f9fa',
  gray: '#adb5bd',
  lightGray: '#e9ecef'
}

// 默认设置
export const DEFAULT_SETTINGS = {
  studyInterval: 30,     // 学习间隔（分钟）
  forceMode: false,      // 强制学习模式
  autoStart: false,      // 开机自启
  soundEnabled: true,    // 声音提醒
  trayEnabled: true      // 系统托盘
} 