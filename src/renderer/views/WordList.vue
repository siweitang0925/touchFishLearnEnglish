<template>
  <div class="word-list-page">
    <!-- 测试显示 - 默认隐藏 -->
    <div v-if="showTestInfo" style="background: #4361ee; color: white; padding: 10px; text-align: center;">
      Vue应用已加载 - 英语学习助手正在运行
    </div>
    
    <div class="page-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <h2 class="page-title">生词本</h2>
            <div class="word-count">
              共 {{ wordStore.words.length }} 个单词
              <span v-if="wordStore.wordsForReview.length > 0" class="review-count">
                ({{ wordStore.wordsForReview.length }} 个待复习)
              </span>
            </div>
          </div>
          
          <div class="header-actions">
            <button 
              v-if="!wordStore.initialized || wordStore.words.length === 0" 
              @click="initIeltsWords" 
              class="init-btn"
              :disabled="initializing"
            >
              <i class="fas fa-download"></i>
              {{ initializing ? '初始化中...' : '初始化雅思词汇' }}
            </button>
            
            <button @click="showAddModal = true" class="add-btn">
              <i class="fas fa-plus"></i>
              添加单词
            </button>
          </div>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input 
            v-model="searchKeyword" 
            @input="handleSearch"
            type="text" 
            class="search-input" 
            placeholder="搜索单词、含义或例句..."
          >
          <button 
            v-if="searchKeyword" 
            @click="clearSearch" 
            class="clear-search-btn"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- 单词列表 -->
      <div class="words-section">
        <div v-if="wordStore.loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div v-else-if="wordStore.filteredWords.length === 0" class="empty-container">
          <div class="empty-icon">
            <i class="fas fa-book-open"></i>
          </div>
          <h3>暂无单词</h3>
          <p v-if="searchKeyword">没有找到匹配的单词</p>
          <p v-else>开始添加你的第一个单词吧！</p>
          <button @click="showAddModal = true" class="add-first-btn">
            <i class="fas fa-plus"></i>
            添加单词
          </button>
        </div>

        <div v-else class="words-grid">
          <div 
            v-for="word in wordStore.filteredWords" 
            :key="word.id" 
            class="word-card"
          >
            <div class="word-header">
              <div class="word-text" :title="word.word">{{ word.word }}</div>
              <div class="word-actions">
                <button 
                  @click="editWord(word)" 
                  class="action-btn edit-btn"
                  title="编辑"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="deleteWord(word.id)" 
                  class="action-btn delete-btn"
                  title="删除"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <div class="word-content">
              <div class="meaning">{{ word.meaning }}</div>
              
              <div v-if="word.example" class="example">
                <strong>例句:</strong> {{ word.example }}
              </div>

              <div class="proficiency">
                <div class="proficiency-label">
                  <span>熟练度</span>
                  <span>{{ word.proficiency }}/5</span>
                </div>
                <div class="proficiency-bar">
                  <div 
                    class="proficiency-level" 
                    :style="{ width: `${(word.proficiency / 5) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <span class="created-time">
                创建: {{ formatDate(word.createdAt, 'YYYY-MM-DD') }}
              </span>
              <span class="next-review">
                下次复习: {{ formatDate(word.nextReviewTime, 'MM-DD HH:mm') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑单词模态框 -->
    <div v-if="showAddModal || editingWord" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ editingWord ? '编辑单词' : '添加新单词' }}
          </h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="word-form">
            <div class="form-group">
              <label class="form-label">单词 *</label>
              <input 
                v-model="formData.word" 
                type="text" 
                class="form-input" 
                placeholder="输入英文单词"
                required
              >
            </div>

            <div class="form-group">
              <label class="form-label">中文含义 *</label>
              <textarea 
                v-model="formData.meaning" 
                class="form-textarea" 
                rows="3" 
                placeholder="输入中文含义，支持换行"
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">例句</label>
              <textarea 
                v-model="formData.example" 
                class="form-textarea" 
                rows="3" 
                placeholder="输入例句（可选）"
              ></textarea>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-outline">取消</button>
          <button 
            @click="handleSubmit" 
            class="btn btn-primary"
            :disabled="submitting"
          >
            {{ submitting ? '保存中...' : (editingWord ? '保存' : '添加') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useWordStore } from '../store/wordStore.js'
import { formatDate } from '@shared/utils.js'

export default {
  name: 'WordList',
  setup() {
    const wordStore = useWordStore()

    // 响应式状态
    const showAddModal = ref(false)
    const editingWord = ref(null)
    const searchKeyword = ref('')
    const submitting = ref(false)
    const initializing = ref(false)
    const showTestInfo = ref(false) // 测试信息显示状态，默认隐藏

    const formData = reactive({
      word: '',
      meaning: '',
      example: ''
    })

    // 方法
    const handleSearch = () => {
      wordStore.searchKeyword = searchKeyword.value
    }

    const clearSearch = () => {
      searchKeyword.value = ''
      wordStore.clearSearch()
    }

    const editWord = (word) => {
      editingWord.value = word
      formData.word = word.word
      formData.meaning = word.meaning
      formData.example = word.example || ''
    }

    const closeModal = () => {
      showAddModal.value = false
      editingWord.value = null
      resetForm()
    }

    const resetForm = () => {
      formData.word = ''
      formData.meaning = ''
      formData.example = ''
    }

    const handleSubmit = async () => {
      if (!formData.word.trim() || !formData.meaning.trim()) {
        console.log('表单验证失败：单词或含义为空')
        return
      }

      console.log('开始添加单词，数据:', formData)
      submitting.value = true
      try {
        let result
        if (editingWord.value) {
          console.log('更新单词:', editingWord.value.id, formData)
          result = await wordStore.updateWord(editingWord.value.id, formData)
        } else {
          console.log('添加新单词:', formData)
          result = await wordStore.addWord(formData)
        }

        console.log('操作结果:', result)
        if (result.success) {
          console.log('操作成功，关闭模态框')
          closeModal()
        } else {
          console.error('操作失败:', result.message)
          alert('操作失败: ' + result.message)
        }
      } catch (error) {
        console.error('提交出错:', error)
        alert('提交出错: ' + error.message)
      } finally {
        submitting.value = false
      }
    }

    const deleteWord = async (id) => {
      if (!confirm('确定要删除这个单词吗？')) {
        return
      }

      const result = await wordStore.deleteWord(id)
      if (!result.success) {
        console.error('删除失败:', result.message)
      }
    }

    const initIeltsWords = async () => {
      initializing.value = true
      try {
        const result = await wordStore.initIeltsWords()
        if (result.success) {
          console.log('雅思词汇初始化成功')
        } else {
          console.error('初始化失败:', result.message)
        }
      } catch (error) {
        console.error('初始化出错:', error)
      } finally {
        initializing.value = false
      }
    }



    // 监听搜索关键词变化
    watch(searchKeyword, (newValue) => {
      wordStore.searchKeyword = newValue
    })

    return {
      wordStore,
      showAddModal,
      editingWord,
      searchKeyword,
      submitting,
      initializing,
      showTestInfo,
      formData,
      formatDate,
      handleSearch,
      clearSearch,
      editWord,
      closeModal,
      handleSubmit,
      deleteWord,
      initIeltsWords
    }
  }
}
</script>

<style scoped>
.word-list-page {
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

/* 页面头部 */
.page-header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #2b2d42;
  margin: 0;
}

.word-count {
  color: #6c757d;
  font-size: 14px;
}

.review-count {
  color: #ef476f;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.init-btn, .add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.init-btn {
  background-color: #ffd166;
  color: #2b2d42;
}

.init-btn:hover:not(:disabled) {
  background-color: #ffc233;
  transform: translateY(-1px);
}

.add-btn {
  background-color: #4361ee;
  color: white;
}

.add-btn:hover {
  background-color: #3a56d4;
  transform: translateY(-1px);
}

/* 搜索区域 */
.search-section {
  margin-bottom: 25px;
}

.search-container {
  position: relative;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 14px 20px 14px 48px;
  border: none;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
}

.clear-search-btn {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background-color: #f8f9fa;
  color: #6c757d;
}

/* 单词列表 */
.words-section {
  min-height: 400px;
}

.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4361ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  color: #adb5bd;
  margin-bottom: 20px;
}

.empty-container h3 {
  color: #6c757d;
  margin-bottom: 10px;
}

.empty-container p {
  color: #adb5bd;
  margin-bottom: 20px;
}

.add-first-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-first-btn:hover {
  background-color: #3a56d4;
  transform: translateY(-1px);
}

/* 单词网格 */
.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.word-card {
  background: white;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.word-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.word-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  gap: 12px;
}

.word-text {
  font-size: 22px;
  font-weight: 700;
  color: #2b2d42;
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;
}

.word-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  min-width: fit-content;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #adb5bd;
}

.edit-btn:hover {
  background-color: #e3f2fd;
  color: #4361ee;
}

.delete-btn:hover {
  background-color: #ffebee;
  color: #ef476f;
}

.word-content {
  margin-bottom: 20px;
}

.meaning {
  color: #555;
  margin-bottom: 15px;
  font-size: 16px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.example {
  background-color: #f8f9fa;
  border-left: 3px solid #4361ee;
  padding: 12px 15px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 20px;
  font-size: 14px;
  color: #555;
}

.example strong {
  color: #4361ee;
}

.proficiency {
  margin-bottom: 15px;
}

.proficiency-label {
  font-size: 12px;
  color: #adb5bd;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
}

.proficiency-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.proficiency-level {
  height: 100%;
  background: linear-gradient(90deg, #4361ee, #4895ef);
  border-radius: 4px;
  transition: width 0.8s ease;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  color: #adb5bd;
  font-size: 12px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalOpen 0.4s ease;
}

@keyframes modalOpen {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #2b2d42;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #adb5bd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #2b2d42;
}

.modal-body {
  padding: 25px;
}

.word-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 500;
  color: #555;
}

.form-input, .form-textarea {
  padding: 14px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3a56d4;
}

.btn-outline {
  background: transparent;
  border: 1px solid #e9ecef;
  color: #555;
}

.btn-outline:hover {
  background-color: #f8f9fa;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 15px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .words-grid {
    grid-template-columns: 1fr;
  }

  .word-card {
    padding: 18px;
  }

  .modal-content {
    margin: 20px;
    max-width: none;
  }
}
</style> 