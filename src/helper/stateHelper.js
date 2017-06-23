const { fs, electron, storage, path, remote } = require('./common.js');
const FILE_STATE_KEY = 'fileState';
const FAV_STATE_KEY = 'favState';

const generateRandomKey = () => {
	return 'folder-item-' + String(Math.random()).slice(2);
};

const syncFileData = (data, cb) => { // 同步文件状态
	if (storage) {
		storage.set(FILE_STATE_KEY, data, (err) => {
			if (err) throw err;
	  		cb();
		});
	} else {
		cb();
	}
};

const getFileData = (cb) => { // 获取文件
	if (storage) {
		storage.get(FILE_STATE_KEY, (err, data) => {
			if (err) throw err;

			console.log('请求数据:', data);

			if (data && Object.keys(data).length > 0) {
				cb(data);
			} else { // 初始化时
				cb({
					fav: [],
					common: []
				});
			}			
		});
	} else {
		cb({
			fav: [],
			common: []
		});
	}
};

const getFavFileData = (cb) => {
	getFileData((data) => {
		const { fav } = data;
		cb(fav);
	});
};

module.exports = {
	syncFileData,
	getFileData,
	generateRandomKey
};