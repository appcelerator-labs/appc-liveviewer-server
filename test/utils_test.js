var os = require('os');
var path = require('path');
var fs = require('fs');

var _ = require('underscore');
var should = require('should');
var uuid = require('node-uuid');

var mod = require('../lib/utils');
var CFG = require('../lib/CFG');

var PATH_FIXTURES = path.join(__dirname, 'fixtures');

describe('lib/utils', function () {

	describe('#cp', function () {
		var to = path.join(os.tmpdir(), uuid.v4());

		it('should copy', function (done) {

			return mod.cp(CFG.PATH_PROJECT, to, function (err) {

				if (err) {
					return done(err);
				}

				return fs.exists(path.join(to, 'tiapp.xml'), function (exists) {
					exists.should.be.True;

					return done();
				});

			});

		});

		after(function () {
			mod.rm(to);
		});

	});

	describe('#mv', function () {

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

					mod.rm(paths);

					return done(err);
				}

				mod.cp(PATH_FIXTURES, fixturesCopy, function (err) {

					if (err) {
						return finish(err);
					}

					mod.mv(path.join(fixturesCopy, test.path), to + test.analysis.path, function (err) {

						if (err) {
							return finish(err);
						}

						return mod.isFile(path.join(to, test.output), function (err, file) {

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

	describe('#isFile', function () {

		var tests = [{
			input: path.join(PATH_FIXTURES, 'supported.js'),
			output: true
		}, {
			input: path.join(PATH_FIXTURES, 'classic'),
			output: false
		}, {
			input: path.join(PATH_FIXTURES, 'does-not-exist.js')
		}];

		tests.forEach(function (test) {

			it('should handle ' + test.input, function (done) {

				mod.isFile(test.input, function (err, res) {

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

});
