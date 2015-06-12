var fs = require('fs');
var path = require('path');

var async = require('async');
var Decompress = require('decompress');

var utils = require('./../utils');

var Source = exports;

Source.download = function download(url, downloadPath, callback) {

	var curlPath = utils.tmpdir();
	var decompressPath = utils.tmpdir();

	async.series({

		curl: function (next) {
			return utils.curl(url, curlPath, function (err) {

				if (err) {
					console.error(err);
					return next('Could not download source.');
				}

				return next();
			});
		},

		decompress: function (next) {

			var decompress = new Decompress()
				.src(curlPath)
				.dest(decompressPath)
				.use(Decompress.tar())
				.use(Decompress.tarbz2())
				.use(Decompress.targz())
				.use(Decompress.zip());

			return decompress.run(function (err) {

				if (err) {
					console.error(err);
					return next('Could not extract source.');
				}

				return next();

			});
		},

		move: function (next) {

			return fs.readdir(decompressPath, function (err, files) {

				if (err) {
					return next(err);
				}

				var from;

				// nothing was decompressed
				if (files.length === 1 && files[0] === path.basename(curlPath)) {
					from = curlPath;

				} else {
					from = decompressPath;
				}

				utils.mv(from, downloadPath, next);
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
