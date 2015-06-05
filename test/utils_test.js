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

	describe('#mv', function () {
		var fixturesCopy = path.join(os.tmpdir(), uuid.v4());
		var toDir = path.join(os.tmpdir(), uuid.v4());

		beforeEach(function (done) {
			return mod.cp(PATH_FIXTURES, fixturesCopy, done);
		});

		var tests = [{
			from: path.join(fixturesCopy, 'classic') + '/',
			to: toDir + '/'
		}, {
			from: path.join(fixturesCopy, 'supported.js'),
			to: path.join(toDir, 'Resources', 'app.js')
		}];

		tests.forEach(function (test) {

			it('should move ' + test.from, function (done) {

				return mod.mv(test.from, test.to, function (err) {

					if (err) {
						return done(err);
					}

					return mod.isFile(path.join(toDir, 'Resources', 'app.js'), function (err, file) {

						if (err) {
							return done(err);
						}

						file.should.be.True;

						return done();
					});

				});

			});

		});

		afterEach(function () {
			mod.rm(fixturesCopy);
			mod.rm(toDir);
		});

	});

});
