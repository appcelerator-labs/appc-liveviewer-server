var http = require('http');
var url = require('url');
var path = require('path');

var send = require('send');

var engine = require('./engine');
var exec = require('./exec');
var CFG = require('./CFG');

var server = http.createServer(function (req, res) {
	var query = url.parse(req.url, true).query;

	engine.run(query.url, query.platform, function (err, zip) {

		if (err) {
			res.statusCode = err.status || 500;
			return res.end(err.message || err);
		}

		function cleanup() {
			exec('rm', '-rf', zip, function (err) {

				if (err) {
					console.error('Error removing file: ' + err);
				}

			});
		}

		send(req, path.basename(zip), {
				root: path.dirname(zip)
			})
			.on('error', function (err) {
				cleanup();

				res.statusCode = err.status || 500;
				return res.end('Erorr sending file: ' + (err.message || err));
			})
			.on('end', function () {
				cleanup();
			})
			.pipe(res);
	});

}).listen(CFG.PORT);

var address = server.address();

console.log('Server running on %s:%s', address.address, address.port);
