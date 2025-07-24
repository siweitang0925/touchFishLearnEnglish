const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径
const dbPath = path.join(process.env.APPDATA, 'learnEnglishV2', 'learn_english.db');

console.log('检查数据库:', dbPath);

const db = new sqlite3.Database(dbPath);

// 检查数据库内容
db.all('SELECT COUNT(*) as count FROM words', (err, rows) => {
  if (err) {
    console.error('查询失败:', err);
    return;
  }
  console.log('单词总数:', rows[0].count);
  
  // 显示前10个单词
  db.all('SELECT id, word, meaning, example FROM words LIMIT 10', (err, words) => {
    if (err) {
      console.error('查询单词失败:', err);
      return;
    }
    console.log('\n前10个单词:');
    words.forEach(word => {
      console.log(`${word.id}. ${word.word} - ${word.meaning}`);
    });
    
    db.close();
  });
}); 