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

		engine.run(parsedUrl.query.url, parsedUrl.query.platform, {
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

		// server statics
	} else {
		send(req, req.url, {
			root: path.resolve(__dirname, '..', 'public')
		}).pipe(res);
	}

}).listen(CFG.PORT);

var address = server.address();

console.log('Server running on %s:%s', address.address, address.port);
