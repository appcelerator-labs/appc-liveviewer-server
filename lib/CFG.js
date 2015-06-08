var path = require('path');

var CFG = module.exports = {
	DIR_DOWNLOAD: 'download',
	DIR_PROJECT: 'project',
	ZIP_DIRS: ['Resources'],
	BIN_ALLOY: path.join(__dirname, '..', 'node_modules', 'alloy', 'bin', 'alloy'),
	PORT: process.env.PORT || 8080,
	SOURCES: ['github', 'gist'],
	PLATFORMS: ['ios', 'android'],
	DEPLOY_TYPES: ['development', 'test', 'production'],
	DEPLOY_TYPE: 'production',
	SAMPLES_URL: 'https://gist.githubusercontent.com/FokkeZB/d69277cbe15103bc0696/raw/samples.json',
	TIAPP: '<?xml version="1.0" encoding="UTF-8" ?><ti:app xmlns:ti="http://ti.appcelerator.org"><sdk-version>4.0.0.GA</sdk-version></ti:app>',
	INDEX_JS: '$.index.open();'
};

CFG.PATH_PROJECT = path.join(__dirname, '..', 'assets', CFG.DIR_PROJECT);
