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
				path: ''
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
				path: ''
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

		var tests = [{
			path: 'classic',
			analysis: {
				path: '',
				file: false
			},
			output: 'Resources/app.js'
		}, {
			path: 'classic/Resources',
			analysis: {
				path: '/Resources',
				file: false
			},
			output: 'Resources/app.js'
		}, {
			path: 'supported.js',
			analysis: {
				path: '/Resources/app.js',
				file: true
			},
			output: 'Resources/app.js'
		}, {
			path: 'alloy',
			analysis: {
				path: '',
				file: false
			},
			output: 'app/controllers/index.js'
		}, {
			path: 'alloy/app',
			analysis: {
				path: '/app',
				file: false
			},
			output: 'app/controllers/index.js'
		}];

		tests.forEach(function (test) {

			it('should handle ' + test.path, function (done) {
				var fixturesCopy = path.join(os.tmpdir(), uuid.v4());
				var to = path.join(os.tmpdir(), uuid.v4());

				function finish(err) {
					var paths = [fixturesCopy];

					if (err) {
						console.error('CHECK: ' + to);
					} else {
						paths.push(to);
					}

					utils.rm(paths);

					return done(err);
				}

				utils.cp(PATH_FIXTURES, fixturesCopy, function (err) {

					if (err) {
						return finish(err);
					}

					mod.move(path.join(fixturesCopy, test.path), to, test.analysis, function (err) {

						if (err) {
							return finish(err);
						}

						return utils.isFile(path.join(to, test.output), function (err, file) {

							if (err) {
								return finish(err);
							}

							file.should.be.True;

							return finish();
						});

					});
				});
			});
		});
	});

	describe('#process', function () {
		var tests = ['classic', 'alloy'];

		tests.forEach(function (fixture) {

			it('should handle ' + fixture, function (done) {
				var fixturesCopy = path.join(os.tmpdir(), uuid.v4());
				var to = path.join(os.tmpdir(), uuid.v4());

				function finish(err) {
					var paths = [fixturesCopy];

					if (err) {
						console.error('CHECK: ' + to);
					} else {
						paths.push(to);
					}

					utils.rm(paths);

					return done(err);
				}

				utils.cp(PATH_FIXTURES, fixturesCopy, function (err) {

					if (err) {
						return finish(err);
					}

					var sourcePath = path.join(fixturesCopy, fixture);
					var platform = 'ios';

					mod.process(sourcePath, to, platform, null, function (err) {

						if (err) {
							return finish(err);
						}

						return utils.isFile(path.join(to, 'Resources', 'app.js'), function (err, file) {

							if (err) {
								return finish(err);
							}

							file.should.be.True;

							return finish();
						});

					});

				});

			});

		});

	});

	describe('#run', function () {

		it('should get me movies', function (done) {

			mod.run('https://github.com/appcelerator/movies', 'ios', null, function (err, zip) {

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
