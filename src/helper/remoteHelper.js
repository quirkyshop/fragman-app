const { fs, electron, storage, path, remote } = require('./common.js');
const { dialog, Menu, MenuItem } = remote;

function changeStorePath (path) {
	// if (app && app.setPath) {
	// 	try {
	// 		app.setPath('userData', path);	
	// 	} catch (e) {
	// 		console.log('切换storePath失败', e);
	// 	}
	// }
}

function exportData () {
	openFolderDialog((dirPaths) => {
		// remote执行复制远程文件
		if (Array.isArray(dirPaths) && dirPaths.length > 0) {
			electron.ipcRenderer.send('export-data', dirPaths[0]);	
		}
	});
}

function importData (cb) {
	openFileDialog((filePaths) => {
		// 远程执行导入文件
		console.log('远程导入啦;;', filePaths);
		if (Array.isArray(filePaths) && filePaths.length > 0) {
			electron.ipcRenderer.send('import-data', filePaths[0]);
			electron.ipcRenderer.on('import-data-reply', (event, arg) => {
				const { success, data } = arg;
				console.log('执行成功!!!', success, data);
				if (success) {
					cb && cb(data);
				}
			});
		}
	});
}

function openFolderDialog(cb) {
	if (dialog) {
		dialog.showOpenDialog(
			{
				properties: ['openDirectory', 'multiSelections', 'createDirectory', 'promptToCreate']
			},
			function(folderPath) {
				cb && cb(folderPath);
			}
		)	
	} else {
		console.log('不在客户端上，启用测试地址:', '/Users/johnchat/Desktop/workspace/testDir');
		cb && cb('/Users/johnchat/Desktop/workspace/testDir');
	}
}

function openFileDialog(cb) {
	if (dialog) {
		dialog.showOpenDialog(
			{
				properties: ['openFile', 'createDirectory', 'promptToCreate']
			},
			function(filePaths) {
				cb && cb(filePaths);
			}
		)	
	} else {
		console.log('不在客户端上，启用测试地址:', '/Users/johnchat/Desktop/workspace/testDir');
		cb && cb('/Users/johnchat/Desktop/workspace/testDir');
	}
}

function popupFileMenu (index, posX, posY, callbackMap) {
	const { deleteHandler } = callbackMap;
	if (Menu) {
		const menu = new Menu();
		menu.append(new MenuItem({label: 'delete fragment', click() { deleteHandler && deleteHandler(); }}));
		const currentBrowser = remote.getCurrentWindow();
		menu.popup(currentBrowser, posX, posY);	
	}
}

function popupCateMenu (id, posX, posY, callbackMap) {
	const { renameHandler, deleteHandler } = callbackMap;
	if (Menu) {
		const menu = new Menu();
		menu.append(new MenuItem({label: 'rename category', click() { renameHandler && renameHandler(); }}));
		menu.append(new MenuItem({type: 'separator'}));
		menu.append(new MenuItem({label: 'delete category', click() { deleteHandler && deleteHandler(); }}));
		const currentBrowser = remote.getCurrentWindow();
		menu.popup(currentBrowser, posX, posY);	
	}
}

function popupFolderMenu (id, posX, posY, callbackMap) {
	const { renameHandler, deleteHandler } = callbackMap;
	if (Menu) {
		const menu = new Menu();
		menu.append(new MenuItem({label: 'rename folder', click() { renameHandler && renameHandler(); }}));
		menu.append(new MenuItem({type: 'separator'}));
		menu.append(new MenuItem({label: 'delete folder', click() { deleteHandler && deleteHandler(); }}));
		const currentBrowser = remote.getCurrentWindow();
		menu.popup(currentBrowser, posX, posY);	
	}
}

function popupSideListMenu (id, posX, posY, callbackMap) {
	const { renameHandler, deleteHandler } = callbackMap;
	if (Menu) {
		const menu = new Menu();
		menu.append(new MenuItem({label: 'rename', click() { renameHandler && renameHandler(); }}));
		menu.append(new MenuItem({type: 'separator'}));
		menu.append(new MenuItem({label: 'delete', click() { deleteHandler && deleteHandler(); }}));
		const currentBrowser = remote.getCurrentWindow();
		menu.popup(currentBrowser, posX, posY);	
	}
}

module.exports = {
	openFileDialog: openFileDialog,
	popupSideListMenu: popupSideListMenu,
	popupFolderMenu: popupFolderMenu,
	popupCateMenu: popupCateMenu,
	popupFileMenu: popupFileMenu,
	exportData: exportData,
	importData: importData
};