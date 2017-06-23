const { app, shell, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const $ = require('nodobjc');
const moment = require('moment');

function addShortCutListener () {

}


function addIpcListener({ tray, handleToggle2Fav, handleToggle2WareHouse }) {
    ipcMain.on('change-to-fav-view', (event) => { // 处理切换至气泡模式
      tray.setHighlightMode('always');
      const { x, y, width, height } = tray.getBounds();
      handleToggle2Fav(null, { x, width: 340 });
      event.sender.send('change-to-fav-view-reply');
    });

    ipcMain.on('change-to-ware-house-view', (event) => { // 处理切换至后端处理模式
      handleToggle2WareHouse();
      tray.setHighlightMode('never')
      event.sender.send('change-to-ware-house-view-reply');
    });

    ipcMain.on('db-click-code', (event, code) => { // 处理粘贴复制文本
      $.framework('Foundation')
      $.framework('AppKit')

      var pb = $.NSPasteboard('generalPasteboard');
      var pool = $.NSAutoreleasePool('alloc')('init');
      var changeCount = pb('clearContents');

      var filesToCopy = $.NSMutableArray('alloc')('init');
      var codeStr = $.NSString('stringWithUTF8String', code);
      filesToCopy('addObject', codeStr);
      pb('writeObjects', filesToCopy);

      pool('drain');

      event.sender.send('db-click-code-reply', {
        success: true
      })
    });

    ipcMain.on('import-data', (event, filePath)=> {
      // 录入数据包括（数据解析，数据插入，更新视图）
      let importData = null;

      try {
        const importStr = fs.readFileSync(filePath, { encoding: 'utf-8'});
        const importInstance = JSON.parse(importStr);

        const commonCateGory = importInstance.common;
        const startSepIdx = filePath.lastIndexOf('/');
        const endSepIdx = filePath.lastIndexOf('.');

        // 数据解析
        let cateGoryName = filePath.substring(startSepIdx + 1, endSepIdx);
        cateGoryName = cateGoryName.replace('fragman', 'import');
        
        // 预数据插入
        importData = {
          [cateGoryName]: commonCateGory
        };
      } catch (e) {
        console.log('import-data-failed:', e);
         event.sender.send('import-data-reply', {
          success: false,
          error: e
        });
      }

      // 视图更新（callback完成）
      if (importData) {
        event.sender.send('import-data-reply', {
          success: true,
          data: importData
        });
      }
    });

    ipcMain.on('export-data', (event, dirPath) => {
      const userDir = app.getPath('userData');

      let targetPath = '';
      let sourcePath = '';

      try {
        sourcePath = path.join(userDir, 'storage', 'fileState.json');
        const fileState = fs.readFileSync(sourcePath, { encoding: 'utf-8'});

        const now = moment().format('YYMMDDHHmmss');
        targetPath = path.join(dirPath, `fragman-${now}.json`);
        fs.writeFileSync(targetPath, fileState, { encoding: 'utf-8'});
      } catch (e) {
        console.log('export-data-failed:', e);
        event.sender.send('export-data-reply', {
          success: false,
          error: e
        });
      }      

      event.sender.send('db-click-code-reply', {
        success: true
      });

      shell.openItem(dirPath); // 成功后打开所在文件
    });

    ipcMain.on('init-native-clipboard', () => {
      $.framework('Foundation')
      $.framework('AppKit')

      var pb = $.NSPasteboard('generalPasteboard');
      var pool = $.NSAutoreleasePool('alloc')('init');
      var changeCount = pb('clearContents');
      pool('drain');      
    });

    ipcMain.on('db-click-file', (event, item) => { // 处理粘贴复制文件
      const { path } = item;
      $.framework('Foundation')
      $.framework('AppKit')

      var pb = $.NSPasteboard('generalPasteboard');
      var pool = $.NSAutoreleasePool('alloc')('init');
      var changeCount = pb('clearContents');

      var filesToCopy = $.NSMutableArray('alloc')('init');
      var string = $.NSString('stringWithUTF8String', path);
      filesToCopy('addObject', $.NSURL('alloc')('initFileURLWithPath', string));
      pb('writeObjects', filesToCopy);

      pool('drain');

      event.sender.send('db-click-file-reply', {
        success: true
      })
    });
}

module.exports = {
  addIpcListener: addIpcListener,
  addShortCutListener: addShortCutListener
};