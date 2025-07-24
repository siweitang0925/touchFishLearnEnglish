<template>
  <div class="review-page">
    <!-- 关闭按钮（在内容框外面） -->
    <button @click="nextWord" class="close-btn">
      <i class="fas fa-times"></i>
    </button>

    <!-- 自定义悬浮提示 -->
    <div v-if="showTooltip" class="custom-tooltip" :style="tooltipStyle">
      {{ tooltipText }}
    </div>

    <div v-if="currentWord && currentWord.word" class="review-container">
      <!-- 单词显示区域 -->
      <div class="word-section">
        <h1 class="word-text" :title="currentWord.word">{{ currentWord.word }}</h1>
        <p class="word-hint">请选择正确的中文含义</p>
      </div>

      <!-- 例句显示区域（仅在回答错误时显示） -->
      <div v-if="showResult && !isCorrect && currentWord && currentWord.example" class="example-section">
        <div class="example-display">
          <strong>例句:</strong> {{ currentWord.example }}
        </div>
      </div>

      <!-- 选项区域 -->
      <div class="options-section">
        <div class="options-grid">
          <div
            v-for="(option, index) in options"
            :key="index"
            @click="selectAndSubmit(option)"
            @mouseenter="showCustomTooltip($event, option)"
            @mouseleave="hideTooltip"
            :class="[
              'option-card',
              {
                'selected': selectedOption === option,
                'correct': showResult && currentWord && option === currentWord.meaning,
                'wrong': showResult && currentWord && selectedOption === option && option !== currentWord.meaning
              }
            ]"
            :style="{ animationDelay: index * 0.1 + 's' }"
          >
            <div class="card-content">
              <span class="option-text" :title="option">{{ option }}</span>
              <span v-if="showResult" class="result-icon">
                <i v-if="currentWord && option === currentWord.meaning" class="fas fa-check"></i>
                <i v-else-if="currentWord && selectedOption === option && option !== currentWord.meaning" class="fas fa-times"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWordStore } from '../store/wordStore.js'
import { generateRandomOptions } from '@shared/utils.js'

export default {
  name: 'Review',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const wordStore = useWordStore()

    // 响应式状态
    const currentWord = ref(null)
    const options = ref([])
    const selectedOption = ref('')
    const showResult = ref(false)
    const isCorrect = ref(false)
    
    // 悬浮提示状态
    const showTooltip = ref(false)
    const tooltipText = ref('')
    const tooltipStyle = ref({})

    // 计算属性
    const canSubmit = computed(() => selectedOption.value && !showResult.value)

    // 方法
    const initializeReview = () => {
      console.log('=== REVIEW PAGE TRACE: Initializing review ===')
      console.log('Initialize review called at:', new Date().toLocaleString())
      
      try {
        // 从URL参数获取单词数据
        console.log('=== REVIEW PAGE TRACE: Step 1 - Getting word parameter ===')
        const wordParam = route.query.word
        console.log('Word parameter from route:', wordParam ? 'exists' : 'missing')
        console.log('Word parameter length:', wordParam ? wordParam.length : 0)
        
        if (wordParam) {
          console.log('=== REVIEW PAGE TRACE: Step 2 - Parsing word data ===')
          currentWord.value = JSON.parse(decodeURIComponent(wordParam))
          console.log('Parsed word data:', {
            id: currentWord.value?.id,
            word: currentWord.value?.word,
            meaning: currentWord.value?.meaning
          })
        } else {
          // 如果没有单词数据，返回主页面
          console.error('=== REVIEW PAGE TRACE: No word parameter found in URL ===')
          router.push('/')
          return
        }

        // 检查单词数据是否有效
        console.log('=== REVIEW PAGE TRACE: Step 3 - Validating word data ===')
        if (!currentWord.value || !currentWord.value.word || !currentWord.value.meaning) {
          console.error('=== REVIEW PAGE TRACE: Invalid word data ===')
          console.error('Current word:', currentWord.value)
          router.push('/')
          return
        }
        console.log('=== REVIEW PAGE TRACE: Word data validation passed ===')

        // 生成选项
        console.log('=== REVIEW PAGE TRACE: Step 4 - Generating options ===')
        const allMeanings = wordStore.words.map(word => word.meaning)
        console.log('Available meanings count:', allMeanings.length)
        options.value = generateRandomOptions(currentWord.value.meaning, allMeanings, 6)
        console.log('Generated options count:', options.value.length)
        console.log('Generated options:', options.value)
        
        // 重置状态
        console.log('=== REVIEW PAGE TRACE: Step 5 - Resetting state ===')
        selectedOption.value = ''
        showResult.value = false
        isCorrect.value = false
        console.log('=== REVIEW PAGE TRACE: Initialization completed successfully ===')
      } catch (error) {
        console.error('=== REVIEW PAGE TRACE: Initialization failed ===')
        console.error('Error:', error.message)
        console.error('Stack:', error.stack)
        router.push('/')
      }
    }

    const selectAndSubmit = async (option) => {
      if (showResult.value) return
      
      selectedOption.value = option
      const correct = option === currentWord.value.meaning
      isCorrect.value = correct
      showResult.value = true

      // 更新单词学习结果
      try {
        await wordStore.updateWordReview(currentWord.value.id, correct)
      } catch (error) {
        console.error('更新学习结果失败:', error)
      }

      // 答对时，1秒后自动淡出关闭
      if (correct) {
        setTimeout(() => {
          nextWord()
        }, 1000)
      }
      // 答错时，不自动关闭，用户需要手动点击按钮关闭
    }

    const nextWord = () => {
      // 通知主界面刷新单词列表
      window.electronAPI.refreshMainWindowWords()
      // 关闭复习窗口
      window.electronAPI.closeReviewWindow()
    }

    const showCustomTooltip = (event, text) => {
      // 检查文本是否需要显示悬浮提示（超过一定长度）
      if (text.length > 15) {
        tooltipText.value = text
        showTooltip.value = true
        
        // 计算悬浮提示位置
        const rect = event.target.getBoundingClientRect()
        tooltipStyle.value = {
          left: rect.left + rect.width / 2 + 'px',
          top: rect.top - 10 + 'px',
          transform: 'translateX(-50%) translateY(-100%)'
        }
      }
    }

    const hideTooltip = () => {
      showTooltip.value = false
    }

    // 生命周期
    onMounted(() => {
      initializeReview()
    })

    return {
      currentWord,
      options,
      selectedOption,
      showResult,
      isCorrect,
      canSubmit,
      selectAndSubmit,
      nextWord,
      showTooltip,
      tooltipText,
      tooltipStyle,
      showCustomTooltip,
      hideTooltip
    }
  }
}
</script>

<style scoped>
.review-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  /* 确保整个窗口都有圆角 */
  -webkit-app-region: no-drag;
}

.review-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2);
  text-align: center;
  border: none;
}

/* 自定义悬浮提示 */
.custom-tooltip {
  position: fixed;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  max-width: 300px;
  word-wrap: break-word;
  word-break: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  animation: tooltipFadeIn 0.2s ease-out;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-100%) scale(1);
  }
}

/* 关闭按钮（在内容框外面） */
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #6c757d;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.close-btn:hover {
  background: rgba(239, 71, 111, 0.1);
  color: #ef476f;
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(239, 71, 111, 0.2);
}

/* 单词显示区域 */
.word-section {
  margin-bottom: 30px;
}

.word-text {
  font-size: 48px;
  font-weight: 700;
  color: #2b2d42;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  line-height: 1.2;
  max-width: 100%;
}

.word-hint {
  color: #6c757d;
  font-size: 16px;
  margin: 0;
}

/* 选项区域 */
.options-section {
  margin-bottom: 40px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
}

.option-card {
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

.option-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 12px 24px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.4);
  border-color: rgba(67, 97, 238, 0.3);
}

.option-card.selected {
  border-color: #4361ee;
  background: rgba(67, 97, 238, 0.1);
  box-shadow: 
    0 8px 16px rgba(67, 97, 238, 0.2),
    0 0 0 1px rgba(67, 97, 238, 0.4);
}

.option-card.correct {
  border-color: #06d6a0;
  background: rgba(6, 214, 160, 0.1);
  box-shadow: 
    0 8px 16px rgba(6, 214, 160, 0.2),
    0 0 0 1px rgba(6, 214, 160, 0.4);
  color: #06d6a0;
  font-weight: 600;
}

.option-card.wrong {
  border-color: #ef476f;
  background: rgba(239, 71, 111, 0.1);
  box-shadow: 
    0 8px 16px rgba(239, 71, 111, 0.2),
    0 0 0 1px rgba(239, 71, 111, 0.4);
  color: #ef476f;
  font-weight: 600;
}

.card-content {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 80px;
  word-wrap: break-word;
  word-break: break-word;
}

.option-text {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: #2b2d42;
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  max-width: 100%;
  display: block;
}

.result-icon {
  margin-left: 12px;
  font-size: 20px;
  opacity: 0.8;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 例句显示区域 */
.example-section {
  margin-bottom: 30px;
  animation: fadeInUp 0.6s ease-out forwards;
}

.example-display {
  margin: 10px 0 20px 0;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  color: #2b2d42;
  text-align: left;
}

.example-display strong {
  color: #4361ee;
  font-weight: 600;
  margin-right: 8px;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .review-container {
    padding: 30px 20px;
    max-width: 100%;
  }

  .close-btn {
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .word-text {
    font-size: 36px;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    line-height: 1.1;
  }

  .options-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .option-card {
    min-height: 70px;
  }

  .card-content {
    padding: 20px 16px;
    min-height: 70px;
  }

  .option-text {
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .review-page {
    padding: 10px;
  }

  .review-container {
    padding: 20px 15px;
  }

  .close-btn {
    top: 10px;
    right: 10px;
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .word-text {
    font-size: 28px;
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
    line-height: 1.1;
  }

  .options-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .option-card {
    min-height: 60px;
  }

  .card-content {
    padding: 16px 14px;
    min-height: 60px;
  }

  .option-text {
    font-size: 14px;
  }
}
</style> 