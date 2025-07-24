const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

// 设置控制台编码为UTF-8
if (process.platform === 'win32') {
  process.env.LANG = 'zh_CN.UTF-8';
}

// 使用用户数据目录
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'learnEnglishV2', 'learn_english.db');

console.log('=== 设置学习间隔为1分钟 ===');
console.log('数据库路径:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err);
    process.exit(1);
  }
  
  console.log('数据库连接成功');
  
  // 设置学习间隔为30秒（用于测试）
  const settings = {
    studyInterval: 30,
    autoStart: false,
    soundEnabled: true,
    trayEnabled: true
  };
  
  const sql = `
    INSERT OR REPLACE INTO settings (key, value, updatedAt)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `;
  
  db.run(sql, ['app_settings', JSON.stringify(settings)], function(err) {
    if (err) {
      console.error('保存设置失败:', err);
    } else {
      console.log('设置保存成功');
      console.log('学习间隔已设置为1分钟');
      console.log('完整设置:', settings);
    }
    
    db.close();
    console.log('=== 设置完成 ===');
  });
}); 