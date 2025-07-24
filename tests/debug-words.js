const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库路径 - 用户数据目录
const dbPath = path.join(process.env.APPDATA, 'learnEnglishV2', 'learn_english.db');

console.log('=== DEBUG: Checking words review time ===');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

// 获取当前时间
const now = new Date();
const nowISO = now.toISOString();

console.log('Current time (ISO):', nowISO);
console.log('Current time (local):', now.toLocaleString());

// 检查所有单词的复习时间 - 使用ISO字符串比较
const sql = `
  SELECT id, word, nextReviewTime, proficiency,
         ? as currentTime,
         CASE 
           WHEN nextReviewTime <= ? THEN 'ready'
           ELSE 'waiting'
         END as status
  FROM words 
  ORDER BY nextReviewTime ASC
  LIMIT 10
`;

db.all(sql, [nowISO, nowISO], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Words in database:');
    
    if (rows && rows.length > 0) {
      rows.forEach((word, index) => {
        console.log(`  ${index + 1}. ID:${word.id}, Word:${word.word}`);
        console.log(`     NextReview: ${word.nextReviewTime}`);
        console.log(`     Status: ${word.status}`);
        console.log(`     Proficiency: ${word.proficiency}`);
        console.log('');
      });
    } else {
      console.log('No words found in database');
    }
  }
  
  db.close();
}); 