var path = require('path');

var CFG = module.exports = {
	REGEXP_GITHUB: /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/(?:blob|tree)\/([^\/]+)(\/.*)?)?$/,
	DIR_DOWNLOAD: 'download',
	DIR_PROJECT: 'project',
	ZIP_DIRS: ['Resources'],
	BIN_ALLOY: path.join(__dirname, '..', 'node_modules', 'alloy', 'bin', 'alloy'),
	PORT: 8080
};

CFG.PATH_PROJECT = path.join(__dirname, '..', CFG.DIR_PROJECT);
