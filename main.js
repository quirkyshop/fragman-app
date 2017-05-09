const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const $ = require('nodobjc');

let mainWindow;

function initClipboard () {
  $.framework('Foundation')
  $.framework('AppKit')

  var pb = $.NSPasteboard('generalPasteboard');
  var pool = $.NSAutoreleasePool('alloc')('init');
  var changeCount = pb('clearContents');
  pool('drain');
}

function createWindow () {
  initClipboard();
  mainWindow = new BrowserWindow({width: 800, height: 600});

  
  let winUrl = url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  });

  const port = process.env.npm_package_port || 3000;
  if (process.env.ELECTRON_DEV) winUrl = `http://localhost:${port}`;

  console.log('传入的winUrl:', winUrl);

  mainWindow.loadURL(winUrl);

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