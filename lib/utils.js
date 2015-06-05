var path = require('path');
var fs = require('fs');

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

	return async.series([

		function mkdir(next) {
			exec('mkdir', '-p', path.dirname(to), next);
		},
		function cp(next) {
			Utils.cp(from, to, next);
		},
		function rmFrom(next) {
			Utils.rm(from, next);
		}

	], callback);
};

Utils.isFile = function isFile(path, callback) {

	return fs.stat(path, function (err, stats) {

		if (err) {
			return callback(err);
		}

		return callback(null, stats.isFile());
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
