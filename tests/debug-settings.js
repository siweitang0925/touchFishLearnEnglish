const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

// 设置控制台编码为UTF-8
if (process.platform === 'win32') {
  process.env.LANG = 'zh_CN.UTF-8';
}

// 使用用户数据目录
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'learnEnglishV2', 'learn_english.db');

console.log('=== 调试设置信息 ===');
console.log('数据库路径:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);
  }
  
  console.log('数据库连接成功');
  
  // 检查设置表
  db.all('SELECT * FROM settings', (err, rows) => {
    if (err) {
      console.error('查询设置失败:', err);
    } else {
      console.log('=== 当前设置 ===');
      if (rows.length === 0) {
        console.log('没有找到任何设置');
      } else {
        rows.forEach(row => {
          try {
            const value = JSON.parse(row.value);
            console.log(`${row.key}:`, value);
          } catch (e) {
            console.log(`${row.key}:`, row.value);
          }
        });
      }
    }
    
    // 检查学习模式状态
    db.get('SELECT value FROM settings WHERE key = ?', ['study_mode_active'], (err, row) => {
      if (err) {
        console.error('查询学习模式状态失败:', err);
      } else {
        console.log('=== 学习模式状态 ===');
        if (row) {
          try {
            const value = JSON.parse(row.value);
            console.log('学习模式激活状态:', value);
          } catch (e) {
            console.log('学习模式激活状态:', row.value);
          }
        } else {
          console.log('学习模式状态: 未设置');
        }
      }
      
      // 检查单词数量
      db.get('SELECT COUNT(*) as count FROM words', (err, row) => {
        if (err) {
          console.error('查询单词数量失败:', err);
        } else {
          console.log('=== 单词统计 ===');
          console.log('总单词数:', row.count);
        }
        
        // 检查需要复习的单词
        db.all('SELECT word, nextReviewTime FROM words WHERE nextReviewTime <= ?', [new Date().toISOString()], (err, rows) => {
          if (err) {
            console.error('查询需要复习的单词失败:', err);
          } else {
            console.log('=== 需要复习的单词 ===');
            console.log('数量:', rows.length);
            if (rows.length > 0) {
              rows.slice(0, 5).forEach(row => {
                console.log(`- ${row.word}: ${row.nextReviewTime}`);
              });
              if (rows.length > 5) {
                console.log(`... 还有 ${rows.length - 5} 个单词`);
              }
            }
          }
          
          db.close();
          console.log('=== 调试完成 ===');
        });
      });
    });
  });
}); 