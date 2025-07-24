const { ipcRenderer } = require('electron');

// 模拟前端的数据加载过程
async function debugDataLoading() {
  console.log('开始调试数据加载...');
  
  try {
    // 模拟调用 getAllWords
    console.log('调用 getAllWords...');
    const result = await ipcRenderer.invoke('db-get-all-words');
    console.log('getAllWords 结果:', result);
    
    if (result.success) {
      console.log('数据加载成功，单词数量:', result.data.length);
      console.log('前5个单词:', result.data.slice(0, 5));
    } else {
      console.error('数据加载失败:', result.message);
    }
  } catch (error) {
    console.error('调试过程出错:', error);
  }
}

// 执行调试
debugDataLoading(); 