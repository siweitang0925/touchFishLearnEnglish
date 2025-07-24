import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStudyStore = defineStore('study', () => {
  // 状态
  const isStudyModeActive = ref(false)
  const studyStats = ref({
    totalWords: 0,
    masteredWords: 0,
    totalReviews: 0,
    totalCorrect: 0,
    totalWrong: 0,
    accuracy: 0
  })
  const loadingStats = ref(false)

  // 计算属性
  const learningProgress = computed(() => {
    if (studyStats.value.totalWords === 0) return 0
    return Math.round((studyStats.value.masteredWords / studyStats.value.totalWords) * 100)
  })

  const averageAccuracy = computed(() => {
    return studyStats.value.accuracy
  })

  const reviewEfficiency = computed(() => {
    if (studyStats.value.totalReviews === 0) return 0
    return Math.round((studyStats.value.totalCorrect / studyStats.value.totalReviews) * 100)
  })

  // 方法
  const setStudyModeActive = (active) => {
    isStudyModeActive.value = active
  }

  const loadStudyStats = async () => {
    loadingStats.value = true
    try {
      const result = await window.electronAPI.getStudyStats()
      if (result.success) {
        studyStats.value = result.stats
      } else {
        console.error('加载学习统计失败:', result.message)
      }
    } catch (error) {
      console.error('加载学习统计出错:', error)
    } finally {
      loadingStats.value = false
    }
  }

  const refreshStats = async () => {
    await loadStudyStats()
  }

  return {
    // 状态
    isStudyModeActive,
    studyStats,
    loadingStats,
    
    // 计算属性
    learningProgress,
    averageAccuracy,
    reviewEfficiency,
    
    // 方法
    setStudyModeActive,
    loadStudyStats,
    refreshStats
  }
}) 