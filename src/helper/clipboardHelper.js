const { fs, electron, storage, path, remote } = require('./common.js');
const { clipboard } = remote;
window.___clipboard = clipboard;

function typeArr (arr, name) {
	return arr.indexOf(name) !== -1;
}

function isImage (name) {
	return typeArr(['jpeg', 'png', 'gif', 'bmp', 'ico'], name);
}

function isVideo (name) {
	return typeArr(['.mp4', '.avi', '.3gp', '.mkv'], name);
}

function isRTF (name) {
	return typeArr(['.pdf', '.doc', '.docx',, '.xls', '.txt', '.ppt'], name);
}

function isHTML (name) {
	return typeArr(['.htm', '.html', '.vm'], name);
}

function saveFile (item, cb) {
	const { path } = item;	

	electron.ipcRenderer.send('db-click-file', item);
	electron.ipcRenderer.on('db-click-file-reply', (event, arg) => {
	  const { success } = arg;
	  if (success) {
	  	cb && cb();
	  }
	})
}

function saveCode (str, cb) {
	electron.ipcRenderer.send('db-click-code', str);
	electron.ipcRenderer.on('db-click-code-reply', (event, arg) => {
	  const { success } = arg;
	  if (success) {
	  	cb && cb();
	  }
	})
}

module.exports = {
	saveFile: saveFile,
	saveCode: saveCode
};