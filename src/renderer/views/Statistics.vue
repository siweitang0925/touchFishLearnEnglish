<template>
  <div class="statistics-page">
    <div class="page-container">
      <div class="page-header">
        <h2 class="page-title">学习统计</h2>
        <p class="page-description">查看你的学习进度和成果</p>
      </div>

      <div class="stats-content">
        <!-- 概览卡片 -->
        <div class="overview-cards">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-book"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ studyStore.studyStats.totalWords }}</div>
              <div class="stat-label">总单词数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-star"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ studyStore.studyStats.masteredWords }}</div>
              <div class="stat-label">已掌握</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ studyStore.studyStats.totalReviews }}</div>
              <div class="stat-label">总复习次数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-percentage"></i>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ studyStore.studyStats.accuracy }}%</div>
              <div class="stat-label">正确率</div>
            </div>
          </div>
        </div>

        <!-- 进度图表 -->
        <div class="charts-section">
          <div class="chart-card">
            <h3 class="chart-title">学习进度</h3>
            <div class="progress-chart">
              <div class="progress-info">
                <span class="progress-label">掌握进度</span>
                <span class="progress-value">{{ studyStore.learningProgress }}%</span>
              </div>
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${studyStore.learningProgress}%` }"
                ></div>
              </div>
              <div class="progress-stats">
                <span>{{ studyStore.studyStats.masteredWords }} / {{ studyStore.studyStats.totalWords }} 个单词</span>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <h3 class="chart-title">复习效率</h3>
            <div class="efficiency-chart">
              <div class="efficiency-info">
                <span class="efficiency-label">平均正确率</span>
                <span class="efficiency-value">{{ studyStore.averageAccuracy }}%</span>
              </div>
              <div class="efficiency-bar">
                <div 
                  class="efficiency-fill" 
                  :style="{ width: `${studyStore.averageAccuracy}%` }"
                ></div>
              </div>
              <div class="efficiency-stats">
                <span>正确 {{ studyStore.studyStats.totalCorrect }} 次，错误 {{ studyStore.studyStats.totalWrong }} 次</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细统计 -->
        <div class="detailed-stats">
          <div class="stats-card">
            <h3 class="stats-title">学习详情</h3>
            
            <div class="stats-grid">
              <div class="detail-stat">
                <div class="detail-label">今日复习</div>
                <div class="detail-value">{{ studyStore.detailedStats.todayReviews }}</div>
              </div>
              
              <div class="detail-stat">
                <div class="detail-label">本周复习</div>
                <div class="detail-value">{{ studyStore.detailedStats.weekReviews }}</div>
              </div>
              
              <div class="detail-stat">
                <div class="detail-label">本月复习</div>
                <div class="detail-value">{{ studyStore.detailedStats.monthReviews }}</div>
              </div>
              
              <div class="detail-stat">
                <div class="detail-label">学习天数</div>
                <div class="detail-value">{{ studyStore.detailedStats.studyDays }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 刷新按钮 -->
        <div class="refresh-section">
          <button @click="refreshStats" class="refresh-btn" :disabled="studyStore.loadingStats">
            <i class="fas fa-sync-alt"></i>
            {{ studyStore.loadingStats ? '刷新中...' : '刷新统计' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStudyStore } from '../store/studyStore.js'

export default {
  name: 'Statistics',
  setup() {
    const studyStore = useStudyStore()
    const route = useRoute()
    
    // 自动刷新定时器
    let autoRefreshTimer = null

    // 方法
    const refreshStats = async () => {
      await studyStore.refreshStats()
    }

    // 启动自动刷新
    const startAutoRefresh = () => {
      // 每30秒自动刷新一次
      autoRefreshTimer = setInterval(async () => {
        if (route.name === 'Statistics') {
          console.log('自动刷新统计数据...')
          await studyStore.loadStudyStats()
        }
      }, 30000) // 30秒
    }

    // 停止自动刷新
    const stopAutoRefresh = () => {
      if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer)
        autoRefreshTimer = null
      }
    }

    // 监听路由变化
    watch(() => route.name, (newRoute) => {
      if (newRoute === 'Statistics') {
        // 进入统计页面时启动自动刷新
        startAutoRefresh()
        // 立即刷新一次数据
        studyStore.loadStudyStats()
      } else {
        // 离开统计页面时停止自动刷新
        stopAutoRefresh()
      }
    })

    // 生命周期
    onMounted(async () => {
      await studyStore.loadStudyStats()
      // 启动自动刷新
      startAutoRefresh()
    })

    onUnmounted(() => {
      // 清理定时器
      stopAutoRefresh()
    })

    return {
      studyStore,
      refreshStats
    }
  }
}
</script>

<style scoped>
.statistics-page {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  min-height: calc(100vh - 60px);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  /* 毛玻璃效果将通过JavaScript动态控制 */
}

.page-header {
  margin-bottom: 40px;
  text-align: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #2b2d42;
  margin: 0 0 10px 0;
}

.page-description {
  color: #6c757d;
  font-size: 16px;
  margin: 0;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 概览卡片 */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-card:nth-child(1) .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card:nth-child(2) .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) .stat-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2b2d42;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

/* 图表区域 */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.chart-title {
  font-size: 20px;
  font-weight: 600;
  color: #2b2d42;
  margin: 0 0 25px 0;
}

.progress-chart, .efficiency-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.progress-info, .efficiency-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label, .efficiency-label {
  font-size: 16px;
  font-weight: 500;
  color: #2b2d42;
}

.progress-value, .efficiency-value {
  font-size: 24px;
  font-weight: 700;
  color: #4361ee;
}

.progress-bar, .efficiency-bar {
  height: 12px;
  background-color: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill, .efficiency-fill {
  height: 100%;
  background: linear-gradient(90deg, #4361ee, #4895ef);
  border-radius: 6px;
  transition: width 1s ease;
}

.progress-stats, .efficiency-stats {
  font-size: 14px;
  color: #6c757d;
  text-align: center;
}

/* 详细统计 */
.detailed-stats {
  display: flex;
  justify-content: center;
}

.stats-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  min-width: 600px;
}

.stats-title {
  font-size: 20px;
  font-weight: 600;
  color: #2b2d42;
  margin: 0 0 25px 0;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.detail-stat {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
}

.detail-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 10px;
}

.detail-value {
  font-size: 28px;
  font-weight: 700;
  color: #2b2d42;
}

/* 刷新按钮 */
.refresh-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #3a56d4;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 15px;
  }

  .overview-cards {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }

  .chart-card {
    padding: 20px;
  }

  .stats-card {
    min-width: auto;
    width: 100%;
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style> 