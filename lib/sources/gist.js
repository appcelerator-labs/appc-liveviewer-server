var path = require('path');

var async = require('async');
var Decompress = require('decompress');
var fs = require('fs-extra');
var chmodr = require('chmodr');

var utils = require('./../utils');

var REGEXP = /^https:\/\/gist\.github\.com\/([^\/]+)\/([^#\/]+)\/?(?:#file-(.+))?$/;

var Source = exports;

Source.download = function download(url, downloadPath, callback) {
	var matchedUrl = Source.matchUrl(url);

	if (!matchedUrl) {
		return false;
	}

	var downloadUrl = 'https://codeload.github.com/' + matchedUrl.user + '/' + matchedUrl.gist + '/zip/master';

	var curlPath = utils.tmpdir() + '.zip';
	var decompressPath = utils.tmpdir();

	var moveFrom = path.join(decompressPath, matchedUrl.gist + '-master'),
		moveTo = downloadPath;

	async.series({

		curl: function (next) {
			return utils.curl(downloadUrl, curlPath, function (err) {

				if (err) {
					console.error(err);
					return next('Could not download gist zip file.');
				}

				return next();
			});
		},

		decompress: function (next) {

			var decompress = new Decompress({
					mode: '644'
				})
				.src(curlPath)
				.dest(decompressPath)
				.use(Decompress.zip());

			return decompress.run(function (err) {

				if (err) {
					console.error(err);
					return next('Could not extract gist zip file.');
				}

				return next();
			});

		},

		find: function (next) {

			if (matchedUrl.file) {

				return fs.readdir(moveFrom, function (err, files) {

					if (err) {
						return next(err);
					}

					if (!files.some(function (filename) {

							if (filename.replace(/[^a-z0-9]+/g, '-') === matchedUrl.file) {
								moveFrom = path.join(moveFrom, filename);

								return true;
							}

							return false;

						})) {

						return next('Could not find requested file in gist: ' + matchedUrl.file);
					}

					return next();
				});

			} else {
				moveTo += '/';

				return next();
			}

		},

		move: function (next) {

			return utils.mv(moveFrom, moveTo, function (err) {

				if (err) {
					console.error(err);
					return next('Could not move files to project.');
				}

				return next();
			});
		}

	}, function afterSeries(err) {

		return utils.rm([curlPath, decompressPath], function (rmErr) {

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
