// 测试实际的复习选项生成功能
const { generateRandomOptions } = require('../src/shared/utils.js')

// 模拟实际的单词数据（从你的应用中获取的）
const actualWords = [
  { id: 224, word: 'academic', meaning: '学术的' },
  { id: 225, word: 'accomplish', meaning: '完成' },
  { id: 226, word: 'accurate', meaning: '准确的' },
  { id: 227, word: 'achieve', meaning: '达到' },
  { id: 228, word: 'acquire', meaning: '获得' },
  { id: 229, word: 'adapt', meaning: '适应' },
  { id: 230, word: 'adequate', meaning: '充足的' },
  { id: 231, word: 'adjust', meaning: '调整' },
  { id: 232, word: 'administer', meaning: '管理' },
  { id: 233, word: 'admit', meaning: '承认' }
]

// 提取所有含义
const allMeanings = actualWords.map(word => word.meaning)

console.log('=== 实际复习选项生成测试 ===')
console.log('单词数量:', actualWords.length)
console.log('所有含义:', allMeanings)

// 测试不同单词的选项生成
const testCases = [
  { word: 'academic', meaning: '学术的' },
  { word: 'accomplish', meaning: '完成' },
  { word: 'accurate', meaning: '准确的' }
]

testCases.forEach((testCase, index) => {
  console.log(`\n--- 测试 ${index + 1}: ${testCase.word} ---`)
  console.log('正确答案:', testCase.meaning)
  
  // 生成选项
  const options = generateRandomOptions(testCase.meaning, allMeanings, 6)
  console.log('生成的选项:', options)
  
  // 验证选项
  console.log('选项数量:', options.length)
  console.log('包含正确答案:', options.includes(testCase.meaning))
  
  // 检查其他选项是否来自单词列表
  const otherOptions = options.filter(option => option !== testCase.meaning)
  const allFromWordList = otherOptions.every(option => allMeanings.includes(option))
  console.log('其他选项都来自单词列表:', allFromWordList)
  
  // 显示其他选项的来源
  console.log('其他选项来源:')
  otherOptions.forEach(option => {
    const sourceWord = actualWords.find(word => word.meaning === option)
    console.log(`  "${option}" -> ${sourceWord ? sourceWord.word : '未知'}`)
  })
  
  // 检查是否有重复
  const uniqueOptions = new Set(options)
  console.log('选项无重复:', uniqueOptions.size === options.length)
})

// 测试边界情况
console.log('\n=== 边界情况测试 ===')

// 测试单词数量刚好够的情况
const justEnoughWords = [
  { word: 'apple', meaning: '苹果' },
  { word: 'banana', meaning: '香蕉' },
  { word: 'orange', meaning: '橙子' },
  { word: 'grape', meaning: '葡萄' },
  { word: 'strawberry', meaning: '草莓' },
  { word: 'watermelon', meaning: '西瓜' }
]
const justEnoughMeanings = justEnoughWords.map(word => word.meaning)

console.log('单词数量刚好够时的测试:')
const optionsJustEnough = generateRandomOptions('苹果', justEnoughMeanings, 6)
console.log('生成的选项:', optionsJustEnough)
console.log('选项数量:', optionsJustEnough.length)
console.log('包含正确答案:', optionsJustEnough.includes('苹果'))

// 测试单词数量不足的情况
const notEnoughWords = [
  { word: 'apple', meaning: '苹果' },
  { word: 'banana', meaning: '香蕉' },
  { word: 'orange', meaning: '橙子' }
]
const notEnoughMeanings = notEnoughWords.map(word => word.meaning)

console.log('\n单词数量不足时的测试:')
const optionsNotEnough = generateRandomOptions('苹果', notEnoughMeanings, 6)
console.log('生成的选项:', optionsNotEnough)
console.log('选项数量:', optionsNotEnough.length)
console.log('包含正确答案:', optionsNotEnough.includes('苹果'))

console.log('\n=== 测试完成 ===') 