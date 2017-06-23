const isBrowser = (typeof window !== "undefined");

let electron = null;
let fs = null;
let path = null;
let storage = null;
let remote = {};

const jsonPath = (obj, path) => {
	var isValid = function (val) {
		return [undefined, null].indexOf(val) === -1;
	};

	if (path) {
		var arr = path.split('.');
		var result = arr.reduce(function(a, b){
			if (a !== null) {
				if (b === undefined) {
					return a;
				} else {
					if (isValid(a[b])) {
						return a[b];
					} else {
						return null;
					}
				}
			} else {
				return null;
			}
		}, obj);
		return result;
	} else {
		return null;
	}
}

if (isBrowser) {
	if (window.require) {
		electron = window.require('electron');
		remote = electron.remote;		
		fs = electron.remote.require('fs');
		path = electron.remote.require('path');
		storage = electron.remote.require('electron-json-storage');
		window.___Storage = storage;
	}
} else {
	electron = require('electron');
	remote = electron.remote;
	fs = require('fs');
	path = require('path');
	storage = require('electron-json-storage');
}



if (storage) {
	storage.getByPath = function(key, cb) {
		storage.getAll(function(err, data) {
			try {
				console.log(err, data);
				const result = jsonPath(data, key);
				cb(err, result);	
			} catch (e) {
				console.log(e);
				cb(e, null);
			}
		});
	}
}

module.exports = {
	fs: fs,
	electron: electron,
	storage: storage,
	path: path,
	remote: remote
};