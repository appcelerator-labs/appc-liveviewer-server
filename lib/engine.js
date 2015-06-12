var path = require('path');
var fs = require('fs-extra');

var async = require('async');
var _ = require('underscore');

var CFG = require('./CFG');
var exec = require('./exec');
var utils = require('./utils');

var Engine = exports;

Engine.run = function run(url, platform, opts, callback) {

	if (arguments.length === 3) {
		callback = opts;
		opts = {};

	} else {
		opts = opts || {};
	}

	opts.deployType = opts.deployType || CFG.DEPLOY_TYPE;

	platform = utils.normalizePlatformName(platform);

	if (!platform || CFG.PLATFORMS.indexOf(platform) === -1) {
		return callback('Missing or unsupported platform.');
	}

	if (CFG.DEPLOY_TYPES.indexOf(opts.deployType) === -1) {
		return callback('Unsupported deployType: ' + opts.deployType);
	}

	var downloadPath = utils.tmpdir();
	var projectPath = utils.tmpdir();
	var zipPath = utils.tmpdir() + '.zip';

	return async.series({

		download: function (next) {

			var downloading = CFG.SOURCES.some(function (sourceName) {
				var source = require('./sources/' + sourceName);

				return source.download(url, downloadPath, next);
			});

			if (!downloading) {
				return next('Unsupported URL.');
			}
		},

		prepare: function (next) {

			return Engine.prepare(downloadPath, projectPath, platform, function (err) {

				if (err) {
					return next(new Error('Error preparing project: ' + err));
				}

				return next();

			});

		},

		compile: function (next) {

			utils.isFile(path.join(projectPath, 'app', 'controllers', 'index.js'), function (err, isFile) {

				if (!isFile) {
					return next();
				}

				return exec(CFG.BIN_ALLOY, 'compile', projectPath, '--config', 'deployType=' + opts.deployType + ',platform=' + platform, function (err) {

					if (err) {
						return next(new Error('Error compiling Alloy: ' + err));
					}

					return next();
				});
			});
		},

		zip: function (next) {
			var args = ['--recurse-paths', zipPath].concat(CFG.ZIP_DIRS);

			return exec('zip', args, {
				cwd: projectPath
			}, function (err) {

				if (err) {
					return next('Error compressing project: ' + err);
				}

				return next();
			});

		}

	}, function afterSeries(err) {

		utils.rm([downloadPath, projectPath], function (rmErr) {

			if (rmErr) {

				if (err) {
					return callback(new Error(err + ', followed by another error cleaning up: ' + rmErr));
				} else {
					return callback(new Error('Error cleaning up: ' + rmErr));
				}

			} else if (err) {
				return callback(new Error(err));
			}

			return callback(null, zipPath);
		});
	});
};

Engine.prepare = function prepare(downloadPath, projectPath, platform, callback) {
	var isAlloy = false;

	return async.series({

		move: function (next) {

			return utils.isFile(downloadPath, function (err, isFile) {

				if (err) {
					return next(err);
				}

				// download was a single file
				if (isFile) {

					return fs.readFile(downloadPath, {
						encoding: 'utf-8'
					}, function (err, data) {

						if (err) {
							return next(err);
						}

						// Alloy View
						if (data.match(/<Alloy>/)) {
							isAlloy = true;

							return fs.move(downloadPath, path.join(projectPath, 'app', 'views', 'index.xml'), next);
						}

						// Classic JS
						if (data.match(/Ti(tianium)?\.UI\.create/)) {
							return fs.move(downloadPath, path.join(projectPath, 'Resources', 'app.js'), next);
						}

						return next('File does not contains calls Titanium.UI factory methods.');
					});

					// download was dir of files
				} else {

					var tests = [{
						input: path.join(downloadPath, 'Resources', platform, 'app.js'),
						isAlloy: false,
						moveUnder: ''
					}, {
						input: path.join(downloadPath, 'Resources', 'app.js'),
						isAlloy: false,
						moveUnder: ''
					}, {
						input: path.join(downloadPath, platform, 'app.js'),
						isAlloy: false,
						moveUnder: 'Resources'
					}, {
						input: path.join(downloadPath, 'app.js'),
						isAlloy: false,
						moveUnder: 'Resources'
					}, {
						input: path.join(downloadPath, 'app', 'controllers', 'index.js'),
						isAlloy: true,
						moveUnder: ''
					}, {
						input: path.join(downloadPath, 'app', 'controllers', platform, 'index.js'),
						isAlloy: true,
						moveUnder: ''
					}, {
						input: path.join(downloadPath, 'controllers', 'index.js'),
						isAlloy: true,
						moveUnder: 'app'
					}, {
						input: path.join(downloadPath, 'controllers', platform, 'index.js'),
						isAlloy: true,
						moveUnder: 'app'
					}, {
						input: path.join(downloadPath, 'app', 'views', 'index.xml'),
						isAlloy: true,
						moveUnder: ''
					}, {
						input: path.join(downloadPath, 'app', 'views', platform, 'index.xml'),
						isAlloy: true,
						moveUnder: ''
					}, {
						input: path.join(downloadPath, 'views', platform, 'index.xml'),
						isAlloy: true,
						moveUnder: 'app'
					}, {
						input: path.join(downloadPath, 'views', 'index.xml'),
						isAlloy: true,
						moveUnder: 'app'
					}];

					// find one of the above
					return async.detect(tests, function (test, detected) {

						return utils.isFile(test.input, function (err, res) {
							return detected(res);
						});

					}, function afterDetect(test) {

						// none found
						if (!test) {

							// support flat-level projects (gists)
							return fs.readdir(downloadPath, function (err, filenames) {
								var foundRequired = false;

								isAlloy = (_.intersection(['index.xml', 'index.tss', 'app.tss'], filenames).length > 0) || (filenames.indexOf('index.js') !== -1 && filenames.indexOf('app.js') === -1);

								return async.each(filenames, function (filename, nextFilename) {
									var moveTo;

									if (isAlloy) {

										if (['alloy.js', 'config.json'].indexOf(filename) !== -1) {
											moveTo = path.join(projectPath, 'app', filename);
										} else if (filename.match(/\.tss$/)) {
											moveTo = path.join(projectPath, 'app', 'styles', filename);
										} else if (filename.match(/\.xml$/)) {
											moveTo = path.join(projectPath, 'app', 'views', filename);
										} else if (filename.match(/\.js$/)) {
											moveTo = path.join(projectPath, 'app', 'controllers', filename);
										} else if (filename.match(/\.(png|jpg)$/)) {
											moveTo = path.join(projectPath, 'app', 'assets', 'images', filename);
										} else {
											moveTo = path.join(projectPath, 'app', 'assets', filename);
										}

										foundRequired = foundRequired || (filename === 'index.js' || filename === 'index.xml');

									} else {

										if (filename.match(/\.(png|jpg)$/)) {
											moveTo = path.join(projectPath, 'Resources', 'images', filename);
										} else {
											moveTo = path.join(projectPath, 'Resources', filename);
										}

										foundRequired = foundRequired || (filename === 'app.js');
									}

									return fs.move(path.join(downloadPath, filename), moveTo, nextFilename);

								}, function afterEach(err) {

									if (!foundRequired) {
										return next(new Error('Directory does not contain an Alloy index controller, view or Classic app.js.'));
									}

									return next();
								});
							});

						} else {
							isAlloy = test.isAlloy;

							return fs.move(downloadPath, path.join(projectPath, test.moveUnder), next);
						}
					});

				}

			});

		},

		complete: function (next) {

			if (isAlloy) {
				return async.series({
					indexJs: function (nextFile) {
						return utils.ensureFileWithData(path.join(projectPath, 'app', 'controllers', 'index.js'), CFG.INDEX_JS, nextFile);
					},
					tiappXml: function (nextFile) {
						return utils.ensureFileWithData(path.join(projectPath, 'tiapp.xml'), CFG.TIAPP, nextFile);
					}
				}, next);

			} else {
				return next();
			}
		}

	}, callback);
};
