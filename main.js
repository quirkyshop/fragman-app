const { app, BrowserWindow, globalShortcut, net, protocol, shell, Tray, Menu, ipcMain, MenuItem } = require('electron')
const path = require('path');
const url = require('url');
const fs = require('fs');
const moment = require('moment');
const { getTemplate } = require('./menuTemplate.js');
const { addIpcListener, addShortCutListener } = require('./lanuchHandler.js');

const $ = require('nodobjc');

let mainWindow;
let tray;
let GLOBAL_SHOTCUT_KEY = 'CommandOrControl+E';
const BIG_SIZE_MAP = { width: 960, height: 680 };
const SMALL_SIZE_MAP = { width: 240, height: 400 };

function initClipboard () {
  $.framework('Foundation')
  $.framework('AppKit')

  var pb = $.NSPasteboard('generalPasteboard');
  var pool = $.NSAutoreleasePool('alloc')('init');
  var changeCount = pb('clearContents');
  pool('drain');
}

// 切换到fav界面
function handleToggle2Fav(e, bounds) {
  const { x, width } = bounds;
  const iconPosition = x + 22 - (SMALL_SIZE_MAP.width / 2);
  
  if (!mainWindow) return;

  mainWindow.setMinimumSize(SMALL_SIZE_MAP.width, SMALL_SIZE_MAP.height);
  mainWindow.setSize(SMALL_SIZE_MAP.width, SMALL_SIZE_MAP.height, true);  
  mainWindow.setResizable(false);
  mainWindow.setPosition(iconPosition, 0, true);
}

// 切换到code代码操作界面
function handleToggle2WareHouse(e) {

  if (!mainWindow) return;

  mainWindow.setResizable(true);
  mainWindow.setMinimumSize(BIG_SIZE_MAP.width, BIG_SIZE_MAP.height);
  mainWindow.setSize(BIG_SIZE_MAP.width, BIG_SIZE_MAP.height, true);
  mainWindow.center();
}

function createWindow () {  
  tray = new Tray(path.join(__dirname, 'tray.png'));
  tray.on('click', (e, bounds) => {
    if (mainWindow) {
      const content = mainWindow.webContents;
      let currentURL = content.getURL();
      if (currentURL.indexOf('fav') !== -1) { // 焦点状态
        // 隐藏
        const isVisible = mainWindow.isVisible();
        if (isVisible) {
          tray.setHighlightMode('never');
          mainWindow.hide();
        } else {
          tray.setHighlightMode('always');
          mainWindow.show();
        }
      } else { // 大图状态        
        tray.setHighlightMode('always');
        handleToggle2Fav(e, bounds);
        content.send('change-to-fav-view-reply');
      }
    }        
  });

  tray.on('right-click', (e, bounds) => {
    if (!mainWindow) return;
    const content = mainWindow.webContents;
    let currentURL = content.getURL();
    const menu = new Menu();
    if (currentURL.indexOf('fav') !== -1) { // 焦点状态
      menu.append(new MenuItem({label: 'warehouse', click() {      
        tray.setHighlightMode('never'); 
          handleToggle2WareHouse(e, bounds);
          content.send('change-to-ware-house-view-reply');
      }}));
    }
		menu.append(new MenuItem({type: 'separator'}));
		menu.append(new MenuItem({label: 'quit', click() { app.quit(); }}));
    tray.popUpContextMenu(menu);
  });

  initClipboard();
  addIpcListener({ tray, handleToggle2Fav, handleToggle2WareHouse });
  mainWindow = new BrowserWindow({
    width: BIG_SIZE_MAP.width, height: BIG_SIZE_MAP.height,
    titleBarStyle: 'hidden',
    transparent: true, frame: false,
    minWidth: BIG_SIZE_MAP.width, minHeight: BIG_SIZE_MAP.height
  });

  const userDir = path.join(app.getPath('userData'), 'storage');
  console.log('user data dir is:', userDir);

  app.setName('fragman');
  const menuTemplate = getTemplate(app.getName(), process.platform);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  
  let winUrl = url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  });  

  const port = process.env.npm_package_port || 3000;
  if (process.env.ELECTRON_DEV) winUrl = `http://localhost:${port}`;

  mainWindow.loadURL(winUrl);
  tray.setHighlightMode('never');

  if (process.env.ELECTRON_DEV) mainWindow.webContents.openDevTools();

  app.on('will-quit', () => { // 取消注册
    globalShortcut.unregister(GLOBAL_SHOTCUT_KEY)
    globalShortcut.unregisterAll()
  })

  mainWindow.on('closed', function () {
    mainWindow = null;
  })
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});