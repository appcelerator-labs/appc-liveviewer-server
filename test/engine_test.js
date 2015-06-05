var os = require('os');
var path = require('path');
var fs = require('fs');

var should = require('should');
var _ = require('underscore');
var uuid = require('node-uuid');

var mod = require('../lib/engine');
var utils = require('../lib/utils');

var PATH_FIXTURES = path.join(__dirname, 'fixtures');

describe('lib/engine', function () {

	describe('#analyze', function () {

		var tests = [{
			input: path.join(PATH_FIXTURES, 'supported.js'),
			output: {
				alloy: false,
				file: true,
				path: '/Resources/app.js'
			}
		}, {
			input: path.join(PATH_FIXTURES, 'alloy'),
			output: {
				alloy: true,
				file: false,
				path: '/'
			}
		}, {
			input: path.join(PATH_FIXTURES, 'alloy/app'),
			output: {
				alloy: true,
				file: false,
				path: '/app'
			}
		}, {
			input: path.join(PATH_FIXTURES, 'classic'),
			output: {
				alloy: false,
				file: false,
				path: '/'
			}
		}, {
			input: path.join(PATH_FIXTURES, 'classic/Resources'),
			output: {
				alloy: false,
				file: false,
				path: '/Resources'
			}
		}, {
			input: path.join(PATH_FIXTURES, 'unsupported.js')
		}];

		tests.forEach(function (test) {

			it('should handle ' + test.input, function (done) {

				mod.analyze(test.input, function (err, res) {

					if (!_.isBoolean(test.output)) {
						should(err).exist;

					} else {

						if (err) {
							return done(err);
						}

						res.should.eql(test.output);
					}

					return done();
				});

			});

		});

	});

	describe('#move', function () {
		var from, to;

		beforeEach(function () {
			from = path.join(os.tmpdir(), uuid.v4());
			to = path.join(os.tmpdir(), uuid.v4());
		});

		it('should handle Classic project', function (done) {

			utils.cp(path.join(PATH_FIXTURES, 'classic'), from, function (err) {

				if (err) {
					return done(err);
				}

				mod.move(from, to, {
					path: '/',
					file: false
				}, function (err) {

					if (err) {
						return done(err);
					}

					return utils.isFile(path.join(to, 'Resources', 'app.js'), function (err, file) {

						if (err) {
							return done(err);
						}

						file.should.be.True;

						done();
					});

				});

			});

		});

		it('should handle Classic Resources folder', function (done) {

			utils.cp(path.join(PATH_FIXTURES, 'classic', 'Resources'), from, function (err) {

				if (err) {
					return done(err);
				}

				mod.move(from, to, {
					path: '/Resources',
					file: false
				}, function (err) {

					if (err) {
						return done(err);
					}

					return utils.isFile(path.join(to, 'Resources', 'app.js'), function (err, file) {

						if (err) {
							return done(err);
						}

						file.should.be.True;

						done();
					});

				});

			});

		});

		it('should handle Classic file', function (done) {

			utils.cp(path.join(PATH_FIXTURES, 'supported.js'), from, function (err) {

				if (err) {
					return done(err);
				}

				mod.move(from, to, {
					path: '/Resources/app.js',
					file: true
				}, function (err) {

					if (err) {
						return done(err);
					}

					return utils.isFile(path.join(to, 'Resources', 'app.js'), function (err, file) {

						if (err) {
							return done(err);
						}

						file.should.be.True;

						done();
					});

				});

			});

		});

		it('should handle Alloy project', function (done) {

			utils.cp(path.join(PATH_FIXTURES, 'alloy'), from, function (err) {

				if (err) {
					return done(err);
				}

				mod.move(from, to, {
					path: '/',
					file: false
				}, function (err) {

					if (err) {
						return done(err);
					}

					return utils.isFile(path.join(to, 'app', 'controllers', 'index.js'), function (err, file) {

						if (err) {
							return done(err);
						}

						file.should.be.True;

						done();
					});

				});

			});

		});

		it('should handle Alloy app folder', function (done) {

			utils.cp(path.join(PATH_FIXTURES, 'alloy', 'app'), from, function (err) {

				if (err) {
					return done(err);
				}

				mod.move(from, to, {
					path: '/app',
					file: false
				}, function (err) {

					if (err) {
						return done(err);
					}

					return utils.isFile(path.join(to, 'app', 'controllers', 'index.js'), function (err, file) {

						if (err) {
							return done(err);
						}

						file.should.be.True;

						done();
					});

				});

			});

		});

		afterEach(function () {
			utils.rm(from);
			utils.rm(to);
		});

	});

	describe('#process', function () {
		var fixturesCopy = path.join(os.tmpdir(), uuid.v4());
		var processPath = path.join(os.tmpdir(), uuid.v4());

		beforeEach(function (done) {
			return utils.cp(PATH_FIXTURES, fixturesCopy, done);
		});

		it('should handle a Classic project', function (done) {
			var sourcePath = path.join(fixturesCopy, 'classic');
			var platform = 'ios';

			mod.process(sourcePath, processPath, platform, function (err) {

				if (err) {
					return done(err);
				}

				return utils.isFile(path.join(processPath, 'Resources', 'app.js'), function (err, file) {

					if (err) {
						return done(err);
					}

					file.should.be.True;

					done();
				});

			});

		});

		it('should handle an Alloy project', function (done) {
			var sourcePath = path.join(fixturesCopy, 'alloy');
			var platform = 'ios';

			mod.process(sourcePath, processPath, platform, function (err) {

				if (err) {
					return done(err);
				}

				return utils.isFile(path.join(processPath, 'Resources', utils.normalizePlatformFolder(platform), 'app.js'), function (err, file) {

					if (err) {
						return done(err);
					}

					file.should.be.True;

					done();
				});

			});

		});

		afterEach(function () {
			utils.rm(fixturesCopy);
			utils.rm(processPath);
		});

	});

	describe('#run', function () {

		it('should get me movies', function (done) {

			mod.run('https://github.com/appcelerator/movies', 'ios', function (err, zip) {

				if (err) {
					return done(err);
				}

				return utils.isFile(zip, function (err, file) {

					// utils.rm(zip);

					if (err) {
						return done(err);
					}

					file.should.be.True;

					done();
				});

			});

		});

	});

});
