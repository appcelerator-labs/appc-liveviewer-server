var os = require('os');
var path = require('path');

var uuid = require('node-uuid');
var async = require('async');
var _ = require('underscore');

var CFG = require('./CFG');
var exec = require('./exec');

exports.run = function run(url, platform, callback) {

	if (!platform || ['ios', 'android'].indexOf(platform) === -1) {
		return callback('Missing or unsupported platform.');
	}

	if (!url) {
		return callback('Missing URL.');
	}

	var platformDir = (platform === 'ios') ? 'iphone' : platform;

	// TODO: Add support for gists

	var match = url.match(CFG.REGEXP_GITHUB);

	if (!match) {
		return callback('Unsupport URL');
	}

	var github = {
		user: match[1],
		repo: match[2],
		branch: match[3],
		path: match[4]
	};

	// svn export https://github.com/appcelerator/alloy/trunk/samples/rss

	var svnUrl = 'https://github.com/' + github.user + '/' + github.repo;

	if (github.branch) {
		svnUrl += '/branches/' + github.branch + (github.path || '');
	} else {
		svnUrl += '/trunk';
	}

	var paths = {};
	paths.tmp = path.join(os.tmpdir(), uuid.v4());
	paths.download = path.join(paths.tmp, CFG.DIR_DOWNLOAD);
	paths.project = path.join(paths.tmp, CFG.DIR_PROJECT);
	paths.zip = paths.tmp + '.zip';

	var isAlloy = false;
	var pathPrefix = '';

	async.series({
		svnExport: function (next) {

			exec('svn', 'export', svnUrl, paths.download, function (err, stdout) {

				if (err) {
					return next('Error exporting via SVN: ' + err);
				}

				var files = stdout.split('\n').map(function (file) {
					return file.replace('A    ' + paths.download, '');
				});

				// TODO: Handle cases when  files have /index.xml, /index.tss and/or /index.js

				if (files.indexOf('/controllers/index.js') !== -1 || files.indexOf('/controllers/' + platformDir + '/index.js') !== -1) {
					isAlloy = true;
					pathPrefix = '/app';
				} else if (files.indexOf('/app/controllers/index.js') !== -1 || files.indexOf('/app/controllers/' + platformDir + '/index.js') !== -1) {
					isAlloy = true;
				} else if (files.indexOf('/app.js') !== -1 || files.indexOf('/' + platformDir + '/app.js') !== -1) {
					pathPrefix = '/Resources';
				}

				return next();
			});

		},
		cpProject: function (next) {
			exec('cp', '--recursive', CFG.PATH_PROJECT, paths.tmp, function (err) {

				if (err) {
					return next('Error copying template: ' + err);
				}

				return next();
			});
		},
		mvDownload: function (next) {
			exec('mv', paths.download + '/', paths.project + pathPrefix + '/', function (err) {

				if (err) {
					return next('Error moving download: ' + err);
				}

				return next();
			});
		},
		alloyCompile: function (next) {

			if (!isAlloy) {
				return next();
			}

			exec(CFG.BIN_ALLOY, 'compile', paths.project, '--config', 'platform=' + platform, function (err) {

				if (err) {
					return next('Error compiling Alloy: ' + err);
				}

				return next();
			});
		},
		zipProject: function (next) {
			var args = ['--recurse-paths', paths.zip].concat(CFG.ZIP_DIRS);

			exec('zip', args, {
				cwd: paths.project
			}, function (err) {

				if (err) {
					return next('Error compressing project: ' + err);
				}

				return next();
			});
		},
		rmProject: function (next) {
			exec('rm', '-rf', paths.tmp, function (err) {

				if (err) {
					return next('Error removing project: ' + err);
				}

				return next();
			});
		}
	}, function (err) {

		if (err) {
			return exec('rm', '-rf', paths.tmp, paths.zip, function (rmErr) {

				if (rmErr) {
					return callback(err + ', followed by an error cleaning up: ' + rmErr);
				}

				callback(err);
			});
		}

		return callback(null, paths.zip);
	});
};
