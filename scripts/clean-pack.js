const rimraf = require('rimraf');
const path = require('path');

rimraf.sync(path.join(__dirname, '../dist/*'));
rimraf.sync(path.join(__dirname, '../build/*'));