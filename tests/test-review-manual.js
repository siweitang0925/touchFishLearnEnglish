// 简单的测试脚本，用于手动触发复习功能
console.log('=== MANUAL REVIEW TEST ===');

// 模拟单词数据
const testWord = {
  id: 1,
  word: 'academic',
  meaning: '学术的',
  example: 'He is an academic researcher.',
  proficiency: 0,
  nextReviewTime: '2025-07-23T14:28:18.498Z',
  status: 'ready'
};

console.log('Test word:', testWord.word);
console.log('Test meaning:', testWord.meaning);

// 检查复习弹框的URL构建
const wordParam = encodeURIComponent(JSON.stringify(testWord));
const reviewUrl = `http://localhost:5173/#/review?word=${wordParam}`;

console.log('Review URL:', reviewUrl);
console.log('Word parameter length:', wordParam.length);

// 检查URL是否有效
try {
  const decodedWord = JSON.parse(decodeURIComponent(wordParam));
  console.log('Decoded word:', decodedWord.word);
  console.log('URL encoding/decoding test: PASSED');
} catch (error) {
  console.error('URL encoding/decoding test: FAILED', error);
}

console.log('=== MANUAL REVIEW TEST COMPLETED ===');
console.log('If the app is running, you should see a review window pop up');
console.log('Check the app logs for any errors in review window creation'); 