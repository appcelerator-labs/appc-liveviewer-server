var path = require('path');
var fs = require('fs-extra');
var os = require('os');

var uuid = require('node-uuid');
var _ = require('underscore');
var async = require('async');

var exec = require('./exec');

var Utils = exports;

Utils.rm = function rm(paths, callback) {

	if (!_.isFunction(callback)) {
		callback = function (err) {

			if (err) {
				console.error('Error removing: ' + err);
			}

		};
	}

	if (!_.isArray(paths)) {
		paths = [paths];
	}

	return exec('rm', ['-rf'].concat(paths), callback);
};

Utils.cp = function cp(from, to, callback) {
	exec('cp', '-R', from, to, callback);
};

Utils.mv = function mv(from, to, callback) {
	var fromIsFile;

	return async.series([
		function isFile(next) {
			Utils.isFile(from, function (err, res) {

				if (err) {
					return next(err);
				}

				fromIsFile = res;

				return next();
			});
		},
		function mkdir(next) {
			exec('mkdir', '-p', path.dirname(to), next);
		},
		function cp(next) {
			var cpFrom = from;

			if (!fromIsFile) {
				cpFrom += '/.';
			}

			Utils.cp(cpFrom, to, next);
		},
		function rmFrom(next) {
			Utils.rm(from, next);
		}

	], callback);
};

Utils.curl = function curl(from, to, callback) {
	exec('curl', '-o', to, from, callback);
};

Utils.tar = function curl(from, to, callback) {
	exec('tar', '-xvzf', from, '-C', to, callback);
};

Utils.tmpdir = function tmpdir() {
	return path.join(os.tmpdir(), uuid.v4());
};

Utils.isFile = function isFile(file, callback) {

	return fs.stat(file, function (err, stats) {
		return callback(err, !err && stats.isFile());
	});

};

Utils.ensureFileWithData = function ensureFileWithData(file, data, callback) {

	return Utils.isFile(file, function (err, res) {

		if (!res) {
			return fs.outputFile(file, data, callback);
		}

		return callback();
	});

};

Utils.normalizePlatformName = function normalizePlatformName(name) {

	if (['ipad', 'iphone', 'iPhone OS'].indexOf(name) !== -1) {
		return 'ios';
	}

	return name;
};

Utils.normalizePlatformFolder = function normalizePlatformFolder(folder) {

	if (['ipad', 'ios', 'iPhone OS'].indexOf(folder) !== -1) {
		return 'iphone';
	}

	return folder;
};

Utils.redirect = function redirect(res, url) {
	res.statusCode = 302;
	res.setHeader('Location', url);

	return res.end(res.statusCode + ' Found ' + url);
};
