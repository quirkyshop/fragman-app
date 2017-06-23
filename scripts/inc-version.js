const pkg = require('../package.json');
const semver = require('semver');
const stringify = require("json-stringify-pretty-compact")
const fs = require('fs');
const path = require('path');

const newVer = semver.inc(pkg.version, 'patch');
const newPkg = Object.assign(pkg, { version: newVer });

fs.writeFileSync(path.join(__dirname, '../package.json'), stringify(newPkg));
