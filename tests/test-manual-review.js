const { app, BrowserWindow, ipcMain } = require('electron');
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

async function testManualReview() {
  console.log('=== TEST: Manual Review Trigger ===');
  
  // 等待应用准备就绪
  await app.whenReady();
  
  console.log('Creating main window...');
  
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src/main/preload.js')
    },
    show: false
  });

  // 加载主页面
  mainWindow.loadURL('http://localhost:5173');

  mainWindow.once('ready-to-show', () => {
    console.log('Main window ready to show');
    mainWindow.show();
    
    // 等待页面加载完成后发送复习请求
    setTimeout(() => {
      console.log('Sending create review window request...');
      mainWindow.webContents.send('create-review-window', {
        word: testWord
      });
      console.log('Review request sent successfully');
    }, 3000);
  });

  // 监听复习窗口创建请求
  ipcMain.on('create-review-window', (event, data) => {
    console.log('=== IPC TRACE: Received create review window request ===');
    console.log('Word data:', data.word);
    
    // 创建复习窗口
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
    const wordParam = encodeURIComponent(JSON.stringify(data.word));
    const reviewUrl = `http://localhost:5173/#/review?word=${wordParam}`;
    console.log('Loading review URL:', reviewUrl);
    
    reviewWindow.loadURL(reviewUrl);

    reviewWindow.once('ready-to-show', () => {
      console.log('Review window ready to show, displaying...');
      reviewWindow.show();
      reviewWindow.focus();
    });

    reviewWindow.on('closed', () => {
      console.log('Review window closed');
    });
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
}

// 启动测试
testManualReview().catch(console.error); 