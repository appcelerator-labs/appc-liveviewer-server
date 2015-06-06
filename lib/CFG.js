var path = require('path');

var CFG = module.exports = {
	DIR_DOWNLOAD: 'download',
	DIR_PROJECT: 'project',
	ZIP_DIRS: ['Resources'],
	BIN_ALLOY: path.join(__dirname, '..', 'node_modules', 'alloy', 'bin', 'alloy'),
	PORT: process.env.PORT || 8080,
	SOURCES: ['github'],
	PLATFORMS: ['ios', 'android'],
	DEPLOY_TYPES: ['development', 'test', 'production'],
	DEPLOY_TYPE: 'production'
};

CFG.PATH_PROJECT = path.join(__dirname, '..', 'assets', CFG.DIR_PROJECT);
