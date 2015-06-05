var os = require('os');
var path = require('path');
var fs = require('fs');

var should = require('should');
var _ = require('underscore');
var uuid = require('node-uuid');

var mod = require('../lib/sources/github');

describe('lib/sources/github', function () {

	var userRepo = {
		user: 'appcelerator',
		repo: 'titanium',
	};

	var userRepoBranch = _.extend({
		branch: '4_0_X'
	}, userRepo);

	var userRepoBranchPath = _.extend({
		path: '/bin'
	}, userRepoBranch);

	var userRepoBranchPathBlob = _.extend({
		path: '/bin/titanium'
	}, userRepoBranch);

	describe('#matchGitHubUrl', function () {

		var tests = [{
			input: 'https://github.com/' + userRepo.user + '/' + userRepo.repo,
			output: userRepo
		}, {
			input: 'https://github.com/' + userRepo.user + '/' + userRepo.repo + '/',
			output: userRepo
		}, {
			input: 'https://github.com/' + userRepoBranch.user + '/' + userRepoBranch.repo + '/tree/' + userRepoBranch.branch + '',
			output: userRepoBranch
		}, {
			input: 'https://github.com/' + userRepoBranch.user + '/' + userRepoBranch.repo + '/tree/' + userRepoBranch.branch + '/',
			output: userRepoBranch
		}, {
			input: 'https://github.com/' + userRepoBranchPath.user + '/' + userRepoBranchPath.repo + '/tree/' + userRepoBranchPath.branch + userRepoBranchPath.path,
			output: userRepoBranchPath
		}, {
			input: 'https://github.com/' + userRepoBranchPath.user + '/' + userRepoBranchPath.repo + '/tree/' + userRepoBranchPath.branch + userRepoBranchPath.path + '/',
			output: userRepoBranchPath
		}, {
			input: 'https://github.com/' + userRepoBranchPathBlob.user + '/' + userRepoBranchPathBlob.repo + '/blob/' + userRepoBranchPathBlob.branch + userRepoBranchPathBlob.path,
			output: userRepoBranchPathBlob
		}];

		tests.forEach(function (test) {

			it('should handle ' + test.input, function () {
				mod.matchGitHubUrl(test.input).should.eql(test.output);
			});

		});

	});

	describe('#buildSvnUrl', function () {

		var tests = [{
			input: userRepo,
			output: 'https://github.com/' + userRepo.user + '/' + userRepo.repo + '/trunk'
		}, {
			input: userRepoBranch,
			output: 'https://github.com/' + userRepoBranch.user + '/' + userRepoBranch.repo + '/branches/' + userRepoBranch.branch
		}, {
			input: userRepoBranchPath,
			output: 'https://github.com/' + userRepoBranchPath.user + '/' + userRepoBranchPath.repo + '/branches/' + userRepoBranchPath.branch + userRepoBranchPath.path
		}];

		tests.forEach(function (test) {

			it('should handle ' + JSON.stringify(test.input), function () {
				mod.buildSvnUrl(test.input).should.eql(test.output);
			});

		});

	});

	describe('#download', function () {
		var unsupportedUrl = 'http://www.google.com';

		it('should not handle ' + unsupportedUrl, function () {
			mod.download(unsupportedUrl).should.be.False;
		});

		var suppportedUrl = 'https://github.com/' + userRepoBranchPath.user + '/' + userRepoBranchPath.repo + '/blob/' + userRepoBranchPath.branch + userRepoBranchPath.path;
		var downloadPath = path.join(os.tmpdir(), uuid.v4());

		it('should handle  ' + suppportedUrl, function (done) {
			mod.download(suppportedUrl, downloadPath, function (err) {

				if (err) {
					return done(err);
				}

				fs.statSync(downloadPath).isDirectory();
				fs.statSync(path.join(downloadPath, path.basename(userRepoBranchPathBlob.path))).isFile();

				done();

			}).should.be.True;
		});

		var suppportedBlobUrl = 'https://github.com/' + userRepoBranchPathBlob.user + '/' + userRepoBranchPathBlob.repo + '/blob/' + userRepoBranchPathBlob.branch + userRepoBranchPathBlob.path;
		var downloadBlobPath = path.join(os.tmpdir(), uuid.v4());

		it('should handle blobs like ' + suppportedBlobUrl, function (done) {
			mod.download(suppportedBlobUrl, downloadBlobPath, function (err) {

				if (err) {
					return done(err);
				}

				fs.statSync(downloadBlobPath).isFile();

				done();

			}).should.be.True;
		});

	});

});
