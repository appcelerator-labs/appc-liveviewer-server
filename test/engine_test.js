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

	describe('#run', function () {

		it('should get me movies', function (done) {

			mod.run('https://github.com/appcelerator/movies', 'ios', null, function (err, zip) {

				if (err) {
					return done(err);
				}

				return utils.isFile(zip, function (err, file) {

					utils.rm(zip);

					if (err) {
						return done(err);
					}

					file.should.be.True;

					done();
				});

			});

		});

		it('should get me an Alloy gist', function (done) {

			mod.run('https://gist.github.com/FokkeZB/3dd91b8eb07828b771c0', 'ios', null, function (err, zip) {

				if (err) {
					return done(err);
				}

				return utils.isFile(zip, function (err, file) {

					utils.rm(zip);

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
