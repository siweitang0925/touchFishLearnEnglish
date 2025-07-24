const { app, BrowserWindow } = require('electron');
const path = require('path');

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

async function testReviewWindow() {
  console.log('=== TEST: Review Window Creation ===');
  
  // 等待应用准备就绪
  await app.whenReady();
  
  console.log('Creating review window...');
  
  const reviewWindow = new BrowserWindow({
    width: 500,
    height: 600,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    modal: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src/main/preload.js')
    },
    show: false
  });

  // 加载复习页面
  const wordParam = encodeURIComponent(JSON.stringify(testWord));
  console.log('Test word data:', testWord);
  console.log('Word parameter:', wordParam);
  
  const reviewUrl = `http://localhost:5173/#/review?word=${wordParam}`;
  console.log('Review URL:', reviewUrl);
  
  reviewWindow.loadURL(reviewUrl);

  reviewWindow.once('ready-to-show', () => {
    console.log('Review window ready to show, displaying...');
    reviewWindow.show();
    reviewWindow.focus();
  });

  reviewWindow.on('closed', () => {
    console.log('Review window closed');
    app.quit();
  });
  
  // 添加页面加载事件监听器
  reviewWindow.webContents.on('did-finish-load', () => {
    console.log('Review window page loaded successfully');
  });
  
  reviewWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Review window page load failed:', errorCode, errorDescription, validatedURL);
  });
}

// 启动测试
testReviewWindow().catch(console.error); 