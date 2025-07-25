const sqlite3 = require('sqlite3').verbose();
const { app } = require('electron');
const path = require('path');

// 设置控制台编码为UTF-8
if (process.platform === 'win32') {
  process.env.LANG = 'zh_CN.UTF-8';
}

// 应用常量
const DB_NAME = 'learn_english.db';
const DEFAULT_PROFICIENCY = 0;

// 工具函数
function calculateNextReviewTime(proficiency, isCorrect) {
  const intervals = {
    0: 30,    // 0星：30分钟后复习
    1: 60,    // 1星：1小时后复习
    2: 240,   // 2星：4小时后复习
    3: 1440,  // 3星：1天后复习
    4: 4320,  // 4星：3天后复习
    5: 10080  // 5星：1周后复习
  };
  
  const feynmanInterval = 20160; // 2周后复习
  
  let newProficiency = proficiency;
  if (isCorrect) {
    newProficiency = Math.min(proficiency + 1, 5);
  } else {
    newProficiency = Math.max(proficiency - 1, 0);
  }
  
  // 如果熟练度达到5星，使用费曼学习法间隔
  const interval = newProficiency === 5 ? feynmanInterval : intervals[newProficiency];
  
  const nextTime = new Date();
  nextTime.setMinutes(nextTime.getMinutes() + interval);
  
  // 直接返回ISO字符串，避免传递Date对象
  return nextTime.toISOString();
}

class Database {
  constructor() {
    this.db = null;
    this.dbPath = path.join(app.getPath('userData'), DB_NAME);
  }

  /**
   * 初始化数据库
   */
  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('数据库连接失败:', err);
          reject(err);
        } else {
          console.log('数据库连接成功');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  /**
   * 创建数据表
   */
  async createTables() {
    const createWordsTable = `
      CREATE TABLE IF NOT EXISTS words (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT UNIQUE NOT NULL,
        meaning TEXT NOT NULL,
        example TEXT,
        proficiency INTEGER DEFAULT ${DEFAULT_PROFICIENCY},
        reviewCount INTEGER DEFAULT 0,
        correctCount INTEGER DEFAULT 0,
        wrongCount INTEGER DEFAULT 0,
        lastReviewTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        nextReviewTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        isFavorite BOOLEAN DEFAULT 0
      )
    `;

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createStudyLogTable = `
      CREATE TABLE IF NOT EXISTS study_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wordId INTEGER NOT NULL,
        isCorrect BOOLEAN NOT NULL,
        reviewTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wordId) REFERENCES words (id)
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(createWordsTable, (err) => {
          if (err) {
            console.error('创建单词表失败:', err);
            reject(err);
            return;
          }
        });

        this.db.run(createSettingsTable, (err) => {
          if (err) {
            console.error('创建设置表失败:', err);
            reject(err);
            return;
          }
        });

        this.db.run(createStudyLogTable, (err) => {
          if (err) {
            console.error('创建学习日志表失败:', err);
            reject(err);
            return;
          }
          console.log('所有数据表创建完成');
          resolve();
        });
      });
    });
  }

  /**
   * 添加单词
   */
  async addWord(wordData) {
    const { word, meaning, example } = wordData;
    // 新单词设置为当前时间，可以立即复习
    const nextReviewTime = new Date().toISOString();
    
    const sql = `
      INSERT INTO words (word, meaning, example, nextReviewTime)
      VALUES (?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [word, meaning, example, nextReviewTime], function(err) {
        if (err) {
          console.error('添加单词失败:', err);
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  /**
   * 更新单词
   */
  async updateWord(id, wordData) {
    const { word, meaning, example } = wordData;
    
    const sql = `
      UPDATE words 
      SET word = ?, meaning = ?, example = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [word, meaning, example, id], function(err) {
        if (err) {
          console.error('更新单词失败:', err);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * 删除单词
   */
  async deleteWord(id) {
    const sql = 'DELETE FROM words WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], function(err) {
        if (err) {
          console.error('删除单词失败:', err);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * 获取所有单词
   */
  async getAllWords() {
    console.log('=== DB TRACE: Start getting all words ===');
    const startTime = Date.now();
    const sql = 'SELECT * FROM words ORDER BY createdAt DESC';
    console.log('Execute SQL:', sql);

    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (err) {
          console.error('=== DB TRACE: Failed to get words ===');
          console.error('Error:', err);
          console.error('Duration:', duration, 'ms');
          reject(err);
        } else {
          console.log('=== DB TRACE: Successfully got words ===');
          console.log('Result count:', rows ? rows.length : 0);
          console.log('Duration:', duration, 'ms');
          if (rows && rows.length > 0) {
            console.log('First 3 words:');
            rows.slice(0, 3).forEach((word, index) => {
              console.log(`  ${index + 1}. ID:${word.id}, Word:${word.word}, Meaning:${word.meaning}`);
            });
          } else {
            console.log('No words in database');
          }
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * 搜索单词
   */
  async searchWords(keyword) {
    const sql = `
      SELECT * FROM words 
      WHERE word LIKE ? OR meaning LIKE ? OR example LIKE ?
      ORDER BY createdAt DESC
    `;
    const searchPattern = `%${keyword}%`;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [searchPattern, searchPattern, searchPattern], (err, rows) => {
        if (err) {
          console.error('搜索单词失败:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * 获取需要复习的单词
   */
  async getWordsForReview() {
    console.log('=== DB TRACE: Getting words for review ===');
    const startTime = Date.now();
    
    // 获取当前时间
    const now = new Date();
    const nowISO = now.toISOString();
    console.log('Current time (ISO):', nowISO);
    console.log('Current time (local):', now.toLocaleString());
    
    const sql = `
      SELECT * FROM words 
      WHERE nextReviewTime <= ?
      ORDER BY nextReviewTime ASC
    `;

    return new Promise((resolve, reject) => {
      this.db.all(sql, [nowISO], (err, rows) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (err) {
          console.error('=== DB TRACE: Failed to get words for review ===');
          console.error('Error:', err);
          console.error('Processing time:', duration, 'ms');
          reject(err);
        } else {
          console.log('=== DB TRACE: Successfully got words for review ===');
          console.log('Words count:', rows ? rows.length : 0);
          console.log('Processing time:', duration, 'ms');
          
          if (rows && rows.length > 0) {
            console.log('First 3 words for review:');
            rows.slice(0, 3).forEach((word, index) => {
              console.log(`  ${index + 1}. ID:${word.id}, Word:${word.word}, NextReview:${word.nextReviewTime}`);
            });
          } else {
            console.log('No words found for review');
          }
          
          resolve(rows);
        }
      });
    });
  }

  /**
   * 更新单词学习结果
   */
  async updateWordReview(id, isCorrect) {
    const word = await this.getWordById(id);
    if (!word) return false;

    const newProficiency = isCorrect 
      ? Math.min(word.proficiency + 1, 5)
      : Math.max(word.proficiency - 1, 0);

    const nextReviewTime = calculateNextReviewTime(newProficiency, isCorrect);
    
    const updateSql = `
      UPDATE words 
      SET proficiency = ?, 
          reviewCount = reviewCount + 1,
          correctCount = correctCount + ?,
          wrongCount = wrongCount + ?,
          lastReviewTime = CURRENT_TIMESTAMP,
          nextReviewTime = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const logSql = `
      INSERT INTO study_log (wordId, isCorrect)
      VALUES (?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(updateSql, [
          newProficiency, 
          isCorrect ? 1 : 0, 
          isCorrect ? 0 : 1, 
          nextReviewTime, 
          id
        ], (err) => {
          if (err) {
            console.error('更新单词学习结果失败:', err);
            reject(err);
            return;
          }
        });

        this.db.run(logSql, [id, isCorrect], (err) => {
          if (err) {
            console.error('记录学习日志失败:', err);
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    });
  }

  /**
   * 根据ID获取单词
   */
  async getWordById(id) {
    const sql = 'SELECT * FROM words WHERE id = ?';

    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          console.error('获取单词失败:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * 获取设置
   */
  async getSetting(key) {
    const sql = 'SELECT value FROM settings WHERE key = ?';

    return new Promise((resolve, reject) => {
      this.db.get(sql, [key], (err, row) => {
        if (err) {
          console.error('获取设置失败:', err);
          reject(err);
        } else {
          resolve(row ? JSON.parse(row.value) : null);
        }
      });
    });
  }

  /**
   * 保存设置
   */
  async saveSetting(key, value) {
    const sql = `
      INSERT OR REPLACE INTO settings (key, value, updatedAt)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [key, JSON.stringify(value)], function(err) {
        if (err) {
          console.error('保存设置失败:', err);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  /**
   * 批量插入单词（用于初始化雅思词汇）
   */
  async batchInsertWords(words) {
    const sql = `
      INSERT OR IGNORE INTO words (word, meaning, example, nextReviewTime)
      VALUES (?, ?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        const stmt = this.db.prepare(sql);
        
        words.forEach(word => {
          // 新单词设置为当前时间，可以立即复习
          const nextReviewTime = new Date().toISOString();
          stmt.run([word.word, word.meaning, word.example, nextReviewTime]);
        });
        
        stmt.finalize((err) => {
          if (err) {
            console.error('批量插入单词失败:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  /**
   * 重置所有单词的复习时间为当前时间
   */
  async resetAllWordsReviewTime() {
    const nowISO = new Date().toISOString();
    console.log('=== DB TRACE: Resetting all words review time ===');
    console.log('Setting review time to:', nowISO);
    
    const sql = `
      UPDATE words 
      SET nextReviewTime = ?
    `;

    return new Promise((resolve, reject) => {
      this.db.run(sql, [nowISO], function(err) {
        if (err) {
          console.error('=== DB TRACE: Reset words review time failed ===');
          console.error('Error:', err);
          reject(err);
        } else {
          console.log(`=== DB TRACE: Reset words review time successful ===`);
          console.log(`Reset ${this.changes} words review time`);
          resolve(this.changes);
        }
      });
    });
  }

  /**
   * 检查所有单词的复习时间状态
   */
  async checkAllWordsReviewTime() {
    const nowISO = new Date().toISOString();
    console.log('=== DB TRACE: Checking all words review time status ===');
    console.log('Current time (ISO):', nowISO);
    
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

    return new Promise((resolve, reject) => {
      this.db.all(sql, [nowISO, nowISO], (err, rows) => {
        if (err) {
          console.error('=== DB TRACE: Check words review time failed ===');
          console.error('Error:', err);
          reject(err);
        } else {
          console.log('=== DB TRACE: All words review time status ===');
          if (rows && rows.length > 0) {
            rows.forEach((word, index) => {
              console.log(`  ${index + 1}. ID:${word.id}, Word:${word.word}, NextReview:${word.nextReviewTime}, Status:${word.status}`);
            });
          } else {
            console.log('No words found in database');
          }
          resolve(rows);
        }
      });
    });
  }

  /**
   * 获取学习统计
   */
  async getStudyStats() {
    const sql = `
      SELECT 
        COUNT(*) as totalWords,
        SUM(CASE WHEN proficiency >= 5 THEN 1 ELSE 0 END) as masteredWords,
        SUM(reviewCount) as totalReviews,
        SUM(correctCount) as totalCorrect,
        SUM(wrongCount) as totalWrong
      FROM words
    `;

    return new Promise((resolve, reject) => {
      this.db.get(sql, [], (err, row) => {
        if (err) {
          console.error('获取学习统计失败:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * 清空所有数据
   */
  async clearAllData() {
    console.log('=== DB TRACE: Start clearing all data ===');
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // 清空所有表
        const clearWordsTable = 'DELETE FROM words';
        const clearSettingsTable = 'DELETE FROM settings';
        const clearStudyLogTable = 'DELETE FROM study_log';
        
        this.db.run(clearWordsTable, (err) => {
          if (err) {
            console.error('清空单词表失败:', err);
            reject(err);
            return;
          }
          
          this.db.run(clearSettingsTable, (err) => {
            if (err) {
              console.error('清空设置表失败:', err);
              reject(err);
              return;
            }
            
            this.db.run(clearStudyLogTable, (err) => {
              if (err) {
                console.error('清空学习日志表失败:', err);
                reject(err);
                return;
              }
              
              const endTime = Date.now();
              const duration = endTime - startTime;
              console.log('=== DB TRACE: All data cleared successfully ===');
              console.log('Clear operation duration:', duration, 'ms');
              resolve(true);
            });
          });
        });
      });
    });
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('关闭数据库失败:', err);
        } else {
          console.log('数据库连接已关闭');
        }
      });
    }
  }
}

module.exports = new Database(); 