var path = require('path');

var fs = require('fs-extra');

var async = require('async');
var utils = require('./../utils');

var REGEXP = /^https:\/\/gist\.github\.com\/([^\/]+)\/([^#\/]+)\/?(?:#file-(.+))?$/;
var REGEXP_LINE = '^(?:x )?(gist[^\/]+)\/(.+)$';

var Source = exports;

Source.download = function download(url, downloadPath, callback) {
	var matchedUrl = Source.matchUrl(url);

	if (!matchedUrl) {
		return false;
	}

	var downloadUrl = 'https://gist.github.com/' + matchedUrl.user + '/' + matchedUrl.gist + '/download';

	var curlPath = utils.tmpdir() + '.tar.gz';
	var tarPath = utils.tmpdir();

	async.series({

		curl: function (next) {
			return utils.curl(downloadUrl, curlPath, function (err) {

				if (err) {
					console.error(err);
					return next('Could not download gist tar.gz file.');
				}

				return next();
			});
		},

		fs: function (next) {
			return fs.ensureDir(tarPath, function (err) {

				if (err) {
					console.error(err);
					return next('Could not create dir to extract gist.');
				}

				return next();
			});
		},

		tar: function (next) {

			return utils.tar(curlPath, tarPath, function (err, out) {

				if (err) {
					console.error(err);
					return next('Could not extract gist tar.gz file.');
				}

				var matches = out.match(new RegExp(REGEXP_LINE, 'gm'));

				if (!matches) {
					return next('Could not find files in gist.');
				}

				var from, to = downloadPath;

				if (matchedUrl.file) {

					if (!matches.some(function (match) {

							var lineMatch = match.match(new RegExp(REGEXP_LINE));

							if (!lineMatch) {
								return false;
							}

							if (lineMatch[2].replace(/[^a-z0-9]+/g, '-') === matchedUrl.file) {
								from = path.join(tarPath, lineMatch[1], lineMatch[2]);

								return true;
							}

							return false;

						})) {

						return next('Could not find requested file in gist: ' + matchedUrl.file);
					}

				} else {

					var match = matches[0].match(new RegExp(REGEXP_LINE));

					if (!match) {
						return next('Could not find extract dir from gist.');
					}

					from = path.join(tarPath, match[1]);
					to += '/';
				}

				return utils.mv(from, to, function (err) {

					if (err) {
						console.error(err);
						return next('Could not move files to project.');
					}

					return next();
				});
			});
		}

	}, function afterSeries(err) {

		return utils.rm([curlPath, tarPath], function (rmErr) {

			if (rmErr) {
				console.error(rmErr);
			}

			return callback(err);
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
