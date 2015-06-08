var http = require('http');
var url = require('url');
var path = require('path');

var send = require('send');

var engine = require('./engine');
var exec = require('./exec');
var CFG = require('./CFG');
var utils = require('./utils');

var server = http.createServer(function (req, res) {
	var parsedUrl = url.parse(req.url, true);

	// compile source
	if (parsedUrl.pathname === '/compile') {

		return engine.run(parsedUrl.query.url, parsedUrl.query.platform, {
			deployType: parsedUrl.query.deployType
		}, function (err, zip) {

			if (err) {
				res.statusCode = err.status || 500;
				return res.end(err.message || err);
			}

			function cleanup() {

				return utils.rm(zip, function (err) {

					if (err) {
						console.error('Error cleaning up: ' + err);
					}

				});
			}

			send(req, path.basename(zip), {
				root: path.dirname(zip)
			}).on('error', function (err) {
				cleanup();

				res.statusCode = err.status || 500;
				res.end('Error sending file: ' + (err.message || err));
			}).on('end', function () {
				cleanup();
			}).pipe(res);
		});

		// redirect to samples
	} else if (parsedUrl.pathname === '/samples.json') {

		// without commit gist URLs cache
		var samplesUrl = CFG.SAMPLES_URL + '?' + Date.now();

		res.statusCode = 302;
		res.setHeader('Location', samplesUrl);

		return res.end(res.statusCode + ' Found ' + samplesUrl);

	} else {
		res.statusCode = 404;
		return res.end(res.statusCode + ' Not Found');
	}

}).listen(CFG.PORT);

var address = server.address();

console.log('Server running on %s:%s', address.address, address.port);
