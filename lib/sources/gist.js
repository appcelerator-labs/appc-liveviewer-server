var os = require('os');
var path = require('path');
var child_process = require('child_process');

var fs = require('fs-extra');
var uuid = require('node-uuid');

var utils = require('./../utils');

var REGEXP = /^https:\/\/gist\.github\.com\/([^\/]+)\/([^#\/]+)\/?(?:#file-(.+))?$/;
var REGEXP_LINE = '^x (gist[^\/]+)\/(.+)$';

var Source = exports;

Source.download = function download(url, downloadPath, callback) {
	var matchedUrl = Source.matchUrl(url);

	if (!matchedUrl) {
		return false;
	}

	var downloadUrl = 'https://gist.github.com/' + matchedUrl.user + '/' + matchedUrl.gist + '/download';
	var extractPath = path.join(os.tmpdir(), uuid.v4());

	function onError(err) {
		// return utils.rm(extractPath, function () {
		return callback(err instanceof Error ? err : new Error(err));
		// });
	}

	// tar does not create target dir for us
	fs.ensureDir(extractPath, function (err) {

		if (err) {
			return callback(err);
		}

		// download and extract
		child_process.exec('curl ' + downloadUrl + ' | tar xvz -C ' + extractPath, function (error, stderr, stdout) {

			if (error) {
				return callback(stderr);
			}

			var matches = stdout.match(new RegExp(REGEXP_LINE, 'gm'));

			if (!matches) {
				return onError('Could not find files in gist download.');
			}

			var from, to = downloadPath;

			if (matchedUrl.file) {

				if (!matches.some(function (match) {

						var lineMatch = matches[0].match(new RegExp(REGEXP_LINE));

						if (!lineMatch) {
							return false;
						}

						if (lineMatch[2].replace(/[^a-z0-9]+/g, '-') === matchedUrl.file) {
							from = path.join(extractPath, lineMatch[1], lineMatch[2]);

							return true;
						}

						return false;

					})) {

					return onError('Could not find requested file in gist: ' + matchedUrl.file);
				}

			} else {

				var match = matches[0].match(new RegExp(REGEXP_LINE));

				if (!match) {
					return onError('Could not find extract dir from gist.');
				}

				from = path.join(extractPath, match[1]);
				to += '/';
			}

			var cmd = 'mv ' + from + ' ' + to;

			utils.mv(from, to, function (err) {

				if (err) {
					return onError(err);
				}

				return utils.rm(extractPath, callback);
			});
		});
	});

	return true;
};

Source.matchUrl = function matchUrl(url) {
	var match = url.match(REGEXP);

	if (!match) {
		return false;
	}

	var matchedUrl = {
		user: match[1],
		gist: match[2]
	};

	if (match[3]) {
		matchedUrl.file = match[3];
	}

	return matchedUrl;
};
