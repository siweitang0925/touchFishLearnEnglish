import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWordStore = defineStore('word', () => {
  // 状态
  const words = ref([])
  const loading = ref(false)
  const searchKeyword = ref('')
  const initialized = ref(false)

  // 计算属性
  const filteredWords = computed(() => {
    if (!searchKeyword.value) {
      return words.value
    }
    
    const keyword = searchKeyword.value.toLowerCase()
    return words.value.filter(word => 
      word.word.toLowerCase().includes(keyword) ||
      word.meaning.toLowerCase().includes(keyword) ||
      (word.example && word.example.toLowerCase().includes(keyword))
    )
  })

  const wordsForReview = computed(() => {
    return words.value.filter(word => {
      const now = new Date()
      const nextReview = new Date(word.nextReviewTime)
      return now >= nextReview
    })
  })

  const masteredWords = computed(() => {
    return words.value.filter(word => word.proficiency >= 5)
  })

  const learningWords = computed(() => {
    return words.value.filter(word => word.proficiency < 5)
  })

  // 方法
  const loadWords = async (force = false) => {
    if (initialized.value && !force) return
    
    console.log('=== FRONTEND TRACE: Start loading word list ===')
    const startTime = Date.now()
    loading.value = true
    
    try {
      console.log('Calling window.electronAPI.getAllWords()')
      const result = await window.electronAPI.getAllWords()
      const endTime = Date.now()
      const duration = endTime - startTime
      
      console.log('=== FRONTEND TRACE: Got word list result ===')
      console.log('API result:', result)
      console.log('Frontend processing time:', duration, 'ms')
      
      if (result.success) {
        words.value = result.data || []
        // 只有在首次加载时才设置initialized为true
        if (!initialized.value) {
          initialized.value = true
        }
        console.log('=== FRONTEND TRACE: Word list loaded successfully ===')
        console.log('Word count:', words.value.length)
        console.log('First 3 words:', words.value.slice(0, 3))
        console.log('Total processing time:', duration, 'ms')
      } else {
        console.error('=== FRONTEND TRACE: Failed to load words ===')
        console.error('Error:', result.message)
      }
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      console.error('=== FRONTEND TRACE: Error loading words ===')
      console.error('Error:', error)
      console.error('Processing time:', duration, 'ms')
    } finally {
      loading.value = false
    }
  }

  const addWord = async (wordData) => {
    console.log('wordStore.addWord 被调用，数据:', wordData)
    try {
      // 确保传递的是纯对象，避免Vue响应式对象
      const cleanData = {
        word: wordData.word,
        meaning: wordData.meaning,
        example: wordData.example || ''
      }
      console.log('清理后的数据:', cleanData)
      console.log('调用 window.electronAPI.addWord')
      const result = await window.electronAPI.addWord(cleanData)
      console.log('electronAPI.addWord 返回结果:', result)
      
      if (result.success) {
        console.log('添加成功，重新加载单词列表')
        // 强制重新加载单词列表
        await loadWords(true)
        return { success: true }
      } else {
        console.error('添加失败:', result.message)
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('添加单词出错:', error)
      return { success: false, message: error.message }
    }
  }

  const updateWord = async (id, wordData) => {
    try {
      // 确保传递的是纯对象，避免Vue响应式对象
      const cleanData = {
        word: wordData.word,
        meaning: wordData.meaning,
        example: wordData.example || ''
      }
      const result = await window.electronAPI.updateWord(id, cleanData)
      if (result.success) {
        // 更新本地数据
        const index = words.value.findIndex(word => word.id === id)
        if (index !== -1) {
          words.value[index] = { ...words.value[index], ...cleanData }
        }
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('更新单词出错:', error)
      return { success: false, message: error.message }
    }
  }

  const deleteWord = async (id) => {
    try {
      const result = await window.electronAPI.deleteWord(id)
      if (result.success) {
        // 从本地数据中移除
        words.value = words.value.filter(word => word.id !== id)
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('删除单词出错:', error)
      return { success: false, message: error.message }
    }
  }

  const searchWords = async (keyword) => {
    searchKeyword.value = keyword
    if (!keyword.trim()) {
      return { success: true, data: words.value }
    }

    try {
      const result = await window.electronAPI.searchWords(keyword)
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('搜索单词出错:', error)
      return { success: false, message: error.message }
    }
  }

  const initIeltsWords = async () => {
    try {
      const result = await window.electronAPI.initIeltsWords()
      if (result.success) {
        // 强制重新加载单词列表
        await loadWords(true)
        return { success: true, message: result.message }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('初始化雅思词汇出错:', error)
      return { success: false, message: error.message }
    }
  }

  const updateWordReview = async (wordId, isCorrect) => {
    try {
      const result = await window.electronAPI.updateWordReview(wordId, isCorrect)
      if (result.success) {
        // 更新本地数据
        const word = words.value.find(w => w.id === wordId)
        if (word) {
          word.proficiency = isCorrect 
            ? Math.min(word.proficiency + 1, 5)
            : Math.max(word.proficiency - 1, 0)
          word.reviewCount += 1
          if (isCorrect) {
            word.correctCount += 1
          } else {
            word.wrongCount += 1
          }
          word.lastReviewTime = new Date().toISOString()
        }
        return { success: true }
      } else {
        return { success: false, message: result.message }
      }
    } catch (error) {
      console.error('更新单词学习结果出错:', error)
      return { success: false, message: error.message }
    }
  }

  const clearSearch = () => {
    searchKeyword.value = ''
  }

  const refreshWords = async () => {
    initialized.value = false
    await loadWords()
  }

  return {
    // 状态
    words,
    loading,
    searchKeyword,
    initialized,
    
    // 计算属性
    filteredWords,
    wordsForReview,
    masteredWords,
    learningWords,
    
    // 方法
    loadWords,
    addWord,
    updateWord,
    deleteWord,
    searchWords,
    initIeltsWords,
    updateWordReview,
    clearSearch,
    refreshWords
  }
}) 