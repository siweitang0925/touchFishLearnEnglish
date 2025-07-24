const Database = require('./src/main/database');

async function testReviewTrigger() {
  console.log('=== TEST: Manual Review Trigger ===');
  
  try {
    // 初始化数据库
    await Database.init();
    
    // 检查所有单词的复习时间状态
    console.log('Checking all words review time status...');
    await Database.checkAllWordsReviewTime();
    
    // 获取需要复习的单词
    console.log('Getting words for review...');
    const wordsForReview = await Database.getWordsForReview();
    console.log('Words for review count:', wordsForReview.length);
    
    if (wordsForReview.length === 0) {
      console.log('No words need review');
      return;
    }

    // 随机选择一个单词进行复习
    const randomIndex = Math.floor(Math.random() * wordsForReview.length);
    const wordToReview = wordsForReview[randomIndex];
    console.log('Selected word for review:', wordToReview.word);
    console.log('Word data:', JSON.stringify(wordToReview, null, 2));
    
    console.log('=== TEST: Review trigger test completed ===');
    console.log('If the app is running, you should see a review window pop up');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await Database.close();
  }
}

testReviewTrigger(); 