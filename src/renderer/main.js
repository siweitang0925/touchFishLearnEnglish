import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'

// 导入页面组件
import WordList from './views/WordList.vue'
import Review from './views/Review.vue'
import Settings from './views/Settings.vue'
import Statistics from './views/Statistics.vue'

// 创建路由
const routes = [
  {
    path: '/',
    name: 'WordList',
    component: WordList
  },
  {
    path: '/review',
    name: 'Review',
    component: Review
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 创建Pinia状态管理
const pinia = createPinia()

// 创建Vue应用
const app = createApp(App)

// 使用插件
app.use(router)
app.use(pinia)

// 挂载应用
app.mount('#app') 