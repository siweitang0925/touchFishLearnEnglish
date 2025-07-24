const Database = require('./src/main/database');

async function testProficiencyUpdate() {
  console.log('=== TEST: Proficiency Update Test ===');
  
  try {
    // 初始化数据库
    await Database.init();
    
    // 获取所有单词
    const allWords = await Database.getAllWords();
    console.log('Total words in database:', allWords.length);
    
    if (allWords.length === 0) {
      console.log('No words found in database');
      return;
    }

    // 选择一个单词进行测试
    const testWord = allWords[0];
    console.log('Testing word:', testWord.word);
    console.log('Current proficiency:', testWord.proficiency);
    console.log('Current review count:', testWord.reviewCount);
    console.log('Current correct count:', testWord.correctCount);
    console.log('Current wrong count:', testWord.wrongCount);
    
    // 模拟答对的情况
    console.log('\n--- Testing correct answer ---');
    const correctResult = await Database.updateWordReview(testWord.id, true);
    console.log('Update result (correct):', correctResult);
    
    // 重新获取单词数据
    const updatedWord = await Database.getWordById(testWord.id);
    console.log('Updated word proficiency:', updatedWord.proficiency);
    console.log('Updated review count:', updatedWord.reviewCount);
    console.log('Updated correct count:', updatedWord.correctCount);
    console.log('Updated wrong count:', updatedWord.wrongCount);
    console.log('Updated next review time:', updatedWord.nextReviewTime);
    
    // 模拟答错的情况
    console.log('\n--- Testing wrong answer ---');
    const wrongResult = await Database.updateWordReview(testWord.id, false);
    console.log('Update result (wrong):', wrongResult);
    
    // 再次获取单词数据
    const finalWord = await Database.getWordById(testWord.id);
    console.log('Final word proficiency:', finalWord.proficiency);
    console.log('Final review count:', finalWord.reviewCount);
    console.log('Final correct count:', finalWord.correctCount);
    console.log('Final wrong count:', finalWord.wrongCount);
    console.log('Final next review time:', finalWord.nextReviewTime);
    
    console.log('\n=== TEST: Proficiency update test completed ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await Database.close();
  }
}

testProficiencyUpdate(); 