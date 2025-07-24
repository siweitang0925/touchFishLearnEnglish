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

async function debugReviewFlow() {
  console.log('=== DEBUG: Review Flow Analysis ===');
  
  // 等待应用准备就绪
  await app.whenReady();
  
  console.log('1. Creating main window...');
  
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

  // 设置IPC监听器
  ipcMain.on('create-review-window', (event, data) => {
    console.log('2. IPC message received:', data);
    createReviewWindow(data.word);
  });

  mainWindow.once('ready-to-show', () => {
    console.log('3. Main window ready, showing...');
    mainWindow.show();
    
    // 等待页面加载完成后测试
    setTimeout(() => {
      console.log('4. Testing review window creation...');
      console.log('Main window state:', {
        isDestroyed: mainWindow.isDestroyed(),
        isVisible: mainWindow.isVisible(),
        isMinimized: mainWindow.isMinimized()
      });
      
      // 发送测试消息
      mainWindow.webContents.send('create-review-window', {
        word: testWord
      });
      console.log('5. Test message sent');
    }, 3000);
  });

  function createReviewWindow(wordData) {
    console.log('6. Creating review window...');
    console.log('Word data:', wordData);
    
    const reviewWindow = new BrowserWindow({
      width: 500,
      height: 600,
      resizable: false,
      minimizable: false,
      maximizable: false,
      closable: true,
      alwaysOnTop: true,
      skipTaskbar: false,
      modal: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'src/main/preload.js')
      },
      show: false
    });

    console.log('7. Review window created');

    // 加载复习页面
    const wordParam = encodeURIComponent(JSON.stringify(wordData));
    const reviewUrl = `http://localhost:5173/#/review?word=${wordParam}`;
    console.log('8. Loading review URL:', reviewUrl);
    
    reviewWindow.loadURL(reviewUrl);

    reviewWindow.once('ready-to-show', () => {
      console.log('9. Review window ready to show');
      reviewWindow.show();
      reviewWindow.focus();
      console.log('10. Review window should be visible now');
    });

    reviewWindow.on('closed', () => {
      console.log('11. Review window closed');
    });
    
    reviewWindow.webContents.on('did-finish-load', () => {
      console.log('12. Review window page loaded successfully');
    });
    
    reviewWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('13. Review window page load failed:', errorCode, errorDescription, validatedURL);
    });
  }

  app.on('window-all-closed', () => {
    app.quit();
  });
}

// 启动调试
debugReviewFlow().catch(console.error); 