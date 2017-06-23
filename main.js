const { app, BrowserWindow, globalShortcut, net, protocol, shell, Tray, Menu, ipcMain } = require('electron')
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
const BIG_SIZE_MAP = { width: 916, height: 715 };
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
  
  mainWindow.setMinimumSize(SMALL_SIZE_MAP.width, SMALL_SIZE_MAP.height);
  mainWindow.setSize(SMALL_SIZE_MAP.width, SMALL_SIZE_MAP.height, true);  
  mainWindow.setResizable(false);
  mainWindow.setPosition(iconPosition, 0, true);
}

// 切换到code代码操作界面
function handleToggle2WareHouse(e) {
  mainWindow.setResizable(true);
  mainWindow.setMinimumSize(BIG_SIZE_MAP.width, BIG_SIZE_MAP.height);
  mainWindow.setSize(BIG_SIZE_MAP.width, BIG_SIZE_MAP.height, true);
  mainWindow.center();  
}


function createWindow () {
  tray = new Tray('/Users/johnchat/Desktop/img/eku-icon.png');
  tray.on('click', (e, bounds) => {
    console.log('click Tray...', e, bounds);
    handleToggle2Fav(e, bounds);
  });

  initClipboard();
  addIpcListener({ tray, handleToggle2Fav, handleToggle2WareHouse });
  mainWindow = new BrowserWindow({
    width: BIG_SIZE_MAP.width, height: BIG_SIZE_MAP.height,
    'titleBarStyle': 'hidden',
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