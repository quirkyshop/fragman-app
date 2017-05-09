const fs = require('fs');

// copy file to build
fs.createReadStream('main.js').pipe(fs.createWriteStream('build/main.js'));