const fs = require('fs');

// copy file to build
fs.createReadStream('main.js').pipe(fs.createWriteStream('build/main.js'));
fs.createReadStream('menuTemplate.js').pipe(fs.createWriteStream('build/menuTemplate.js'));
fs.createReadStream('lanuchHandler.js').pipe(fs.createWriteStream('build/lanuchHandler.js'));