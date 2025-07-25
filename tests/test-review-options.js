// 测试复习选项生成功能
import { generateRandomOptions } from '../src/shared/utils.js'

// 模拟单词数据
const mockWords = [
  { id: 1, word: 'apple', meaning: '苹果' },
  { id: 2, word: 'banana', meaning: '香蕉' },
  { id: 3, word: 'orange', meaning: '橙子' },
  { id: 4, word: 'grape', meaning: '葡萄' },
  { id: 5, word: 'strawberry', meaning: '草莓' },
  { id: 6, word: 'watermelon', meaning: '西瓜' },
  { id: 7, word: 'pineapple', meaning: '菠萝' },
  { id: 8, word: 'mango', meaning: '芒果' },
  { id: 9, word: 'peach', meaning: '桃子' },
  { id: 10, word: 'pear', meaning: '梨' }
]

// 提取所有含义
const allMeanings = mockWords.map(word => word.meaning)

console.log('=== 复习选项生成测试 ===')
console.log('所有单词含义:', allMeanings)

// 测试不同单词的选项生成
const testWords = ['apple', 'banana', 'orange']

testWords.forEach(word => {
  const wordData = mockWords.find(w => w.word === word)
  if (wordData) {
    console.log(`\n--- 测试单词: ${word} ---`)
    console.log('正确答案:', wordData.meaning)
    
    // 生成选项
    const options = generateRandomOptions(wordData.meaning, allMeanings, 6)
    console.log('生成的选项:', options)
    
    // 验证选项
    console.log('选项数量:', options.length)
    console.log('包含正确答案:', options.includes(wordData.meaning))
    console.log('其他选项都来自单词列表:', options.every(option => 
      option === wordData.meaning || allMeanings.includes(option)
    ))
    
    // 检查是否有重复
    const uniqueOptions = new Set(options)
    console.log('选项无重复:', uniqueOptions.size === options.length)
  }
})

// 测试边界情况
console.log('\n=== 边界情况测试 ===')

// 测试单词数量不足的情况
const fewWords = [
  { id: 1, word: 'apple', meaning: '苹果' },
  { id: 2, word: 'banana', meaning: '香蕉' }
]
const fewMeanings = fewWords.map(word => word.meaning)

console.log('单词数量不足时的测试:')
const optionsWithFewWords = generateRandomOptions('苹果', fewMeanings, 6)
console.log('生成的选项:', optionsWithFewWords)
console.log('选项数量:', optionsWithFewWords.length)

// 测试重复含义的情况
const duplicateWords = [
  { id: 1, word: 'apple', meaning: '苹果' },
  { id: 2, word: 'banana', meaning: '香蕉' },
  { id: 3, word: 'red_apple', meaning: '苹果' }, // 重复含义
  { id: 4, word: 'yellow_banana', meaning: '香蕉' } // 重复含义
]
const duplicateMeanings = duplicateWords.map(word => word.meaning)

console.log('\n重复含义时的测试:')
const optionsWithDuplicates = generateRandomOptions('苹果', duplicateMeanings, 6)
console.log('生成的选项:', optionsWithDuplicates)
console.log('选项数量:', optionsWithDuplicates.length)
console.log('包含正确答案:', optionsWithDuplicates.includes('苹果'))

console.log('\n=== 测试完成 ===') 