var os = require('os');
var path = require('path');
var fs = require('fs');

var should = require('should');
var _ = require('underscore');
var uuid = require('node-uuid');

var mod = require('../lib/sources/gist');

describe('lib/sources/gist', function () {

	var userGist = {
		user: 'fokkezb',
		gist: '3dd91b8eb07828b771c0',
	};

	var userGistFile = _.extend({
		file: 'index-js'
	}, userGist);

	describe('#matchUrl', function () {

		var tests = [{
			input: 'https://gist.github.com/' + userGist.user + '/' + userGist.gist,
			output: userGist
		}, {
			input: 'https://gist.github.com/' + userGist.user + '/' + userGist.gist + '/',
			output: userGist
		}, {
			input: 'https://gist.github.com/' + userGistFile.user + '/' + userGistFile.gist + '#file-' + userGistFile.file,
			output: userGistFile
		}, {
			input: 'https://gist.github.com/' + userGistFile.user + '/' + userGistFile.gist + '/#file-' + userGistFile.file,
			output: userGistFile
		}];

		tests.forEach(function (test) {

			it('should handle ' + test.input, function () {
				mod.matchUrl(test.input).should.eql(test.output);
			});

		});

	});

	describe('#download', function () {
		var unsupportedUrl = 'http://www.google.com';

		it('should not handle ' + unsupportedUrl, function () {
			mod.download(unsupportedUrl).should.be.False;
		});

		var suppportedUrl = 'https://gist.github.com/' + userGist.user + '/' + userGist.gist;
		var downloadPath = path.join(os.tmpdir(), uuid.v4());

		it('should handle  ' + suppportedUrl, function (done) {
			mod.download(suppportedUrl, downloadPath, function (err) {

				if (err) {
					return done(err);
				}

				fs.statSync(downloadPath).isDirectory();
				fs.statSync(path.join(downloadPath, 'index.js')).isFile();

				done();

			}).should.be.True;
		});

		var suppportedFileUrl = 'https://gist.github.com/' + userGistFile.user + '/' + userGistFile.gist + '#file-' + userGistFile.file;
		var downloadFilePath = path.join(os.tmpdir(), uuid.v4());

		it('should handle files like ' + suppportedFileUrl, function (done) {
			mod.download(suppportedFileUrl, downloadFilePath, function (err) {

				if (err) {
					return done(err);
				}

				fs.statSync(downloadFilePath).isFile();

				done();

			}).should.be.True;
		});

	});

});
