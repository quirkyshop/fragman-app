const { fs, electron, storage, path, remote } = require('./common.js');

const change2Fav = (cb) => {
	electron.ipcRenderer.send('change-to-fav-view');
	electron.ipcRenderer.send('init-native-clipboard');
	electron.ipcRenderer.on('change-to-fav-view-reply', (e) => {	
	  cb && cb();
	});
};

const change2WareHouse = (cb) => {
	electron.ipcRenderer.send('change-to-ware-house-view');	
	electron.ipcRenderer.on('change-to-ware-house-view-reply', (e) => {
	  cb && cb();
	});
};

module.exports = {
	change2Fav,
	change2WareHouse
};