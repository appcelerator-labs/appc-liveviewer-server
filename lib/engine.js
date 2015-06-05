var os = require('os');
var path = require('path');
var fs = require('fs');

var uuid = require('node-uuid');
var async = require('async');
var _ = require('underscore');

var CFG = require('./CFG');
var exec = require('./exec');
var utils = require('./utils');

var Engine = exports;

Engine.run = function run(url, platform, callback) {

	if (!url) {
		return callback('Missing URL.');
	}

	platform = utils.normalizePlatformName(platform);

	if (!platform || CFG.PLATFORMS.indexOf(platform) === -1) {
		return callback('Missing or unsupported platform.');
	}

	var downloadPath = path.join(os.tmpdir(), uuid.v4());
	var processPath = path.join(os.tmpdir(), uuid.v4());
	var zipPath = path.join(os.tmpDir(), uuid.v4() + '.zip');

	return async.series({

		download: function (next) {

			var downloading = CFG.SOURCES.some(function (sourceName) {
				var source = require('./sources/' + sourceName);

				return source.download(url, downloadPath, next);
			});

			if (!downloading) {
				return next('Unsupported URL.');
			}

			return;
		},

		process: function (next) {

			return Engine.process(downloadPath, processPath, platform, function (err, res) {

				if (err) {
					return next('Error processing download: ' + err);
				}

				return next();

			});

		},

		zip: function (next) {
			var args = ['--recurse-paths', zipPath].concat(CFG.ZIP_DIRS);

			return exec('zip', args, {
				cwd: processPath
			}, function (err) {

				if (err) {
					return next('Error compressing project: ' + err);
				}

				return next();
			});

		},


	}, function afterSeries(err) {

		utils.rm([downloadPath, processPath], function (rmErr) {

			if (rmErr) {

				if (err) {
					return callback(new Error(err + ', followed by another error cleaning up: ' + rmErr));
				} else {
					return callback(new Error('Error cleaning up: ' + rmErr));
				}
			}

			return callback(null, zipPath);
		});
	});
};

Engine.process = function process(sourcePath, processPath, platform, callback) {

	if (!platform || CFG.PLATFORMS.indexOf(platform) === -1) {
		return callback('Missing or unsupported platform.');
	}

	return Engine.analyze(sourcePath, function (err, analysis) {

		if (err) {
			return callback(err);
		}

		return async.series({

			cpProject: function (next) {

				return utils.cp(CFG.PATH_PROJECT, processPath, function (err) {

					if (err) {
						return next(new Error('Error copying template: ' + err));
					}

					return next();
				});

			},
			mvDownload: function (next) {

				return Engine.move(sourcePath, processPath, analysis, function (err) {

					if (err) {
						return next(new Error('Error moving download: ' + err));
					}

					return next();

				});

			},
			alloyCompile: function (next) {

				if (!analysis.alloy) {
					return next();
				}

				exec(CFG.BIN_ALLOY, 'compile', processPath, '--config', 'platform=' + platform, function (err) {

					if (err) {
						return next(new Error('Error compiling Alloy: ' + err));
					}

					return next();
				});
			}

		}, callback);

	});
};

Engine.analyze = function (sourcePath, callback) {
	var analysis = {};

	return async.series({

		fileOrDir: function (next) {

			utils.isFile(sourcePath, function (err, isFile) {

				if (err) {
					return next(err);
				}

				analysis.file = isFile;

				return next();
			});
		},

		file: function (next) {

			if (!analysis.file) {
				return next();
			}

			return fs.readFile(sourcePath, {
				encoding: 'utf-8'
			}, function (err, data) {

				if (err) {
					return next(err);
				}

				if (!data.match(/Ti(tianium)?\.UI\.create/)) {
					return next(new Error('File does not contains calls Titanium.UI factory methods.'));
				}

				analysis.alloy = false;
				analysis.path = '/Resources/app.js';

				return next();
			});
		},

		dir: function (next) {

			if (analysis.file) {
				return next();
			}

			var tests = [{
				input: path.join(sourcePath, 'app', 'controllers', 'index.js'),
				output: {
					alloy: true,
					path: ''
				}
			}, {
				input: path.join(sourcePath, 'controllers', 'index.js'),
				output: {
					alloy: true,
					path: '/app'
				}
			}, {
				input: path.join(sourcePath, 'Resources', 'app.js'),
				output: {
					alloy: false,
					path: ''
				}
			}, {
				input: path.join(sourcePath, 'app.js'),
				output: {
					alloy: false,
					path: '/Resources'
				}
			}];

			return async.some(tests, function (test, endSome) {

				return fs.stat(test.input, function (err, stats) {

					if (err || !stats.isFile()) {
						return endSome(false);
					}

					_.extend(analysis, test.output);

					return endSome(true);
				});

			}, function afterSome(result) {

				if (!result) {
					return next(new Error('Directory does not Alloy index controller or Classic app.js.'));
				}

				return next();

			});
		}

	}, function afterSeries(err) {

		if (err) {
			return callback(new Error('Error while analyzing download: ' + err));
		}

		return callback(null, analysis);

	});
};

Engine.move = function move(sourcePath, processPath, analysis, callback) {
	var to = path.join(processPath, analysis.path);

	return async.series([

		function mkdir(next) {
			exec('mkdir', '-p', path.dirname(to), next);
		},
		function cp(next) {
			var from = sourcePath;

			if (!analysis.file) {
				from += '/.';
			}

			utils.cp(from, to, next);
		},
		function rmFrom(next) {
			utils.rm(sourcePath, next);
		}

	], callback);
};
