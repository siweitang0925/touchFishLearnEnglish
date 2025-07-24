const { ipcMain } = require('electron');
const Database = require('./src/main/database.js');

// 测试IPC通信
async function testIPC() {
  console.log('开始测试IPC通信...');
  
  try {
    // 测试获取所有单词
    console.log('测试 getAllWords...');
    const words = await Database.getAllWords();
    console.log('数据库返回单词数量:', words.length);
    console.log('前3个单词:', words.slice(0, 3));
    
    // 测试IPC处理器
    const result = await new Promise((resolve) => {
      ipcMain.handle('test-get-all-words', async () => {
        try {
          const words = await Database.getAllWords();
          return { success: true, data: words };
        } catch (error) {
          return { success: false, message: error.message };
        }
      });
      
      // 模拟调用
      setTimeout(() => {
        ipcMain.removeHandler('test-get-all-words');
        resolve({ success: true });
      }, 1000);
    });
    
    console.log('IPC测试完成');
  } catch (error) {
    console.error('IPC测试失败:', error);
  }
}

testIPC(); 