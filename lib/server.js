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
			res.writeHeader(500, {
				'Content-Type': 'text/plain'
			});
			return res.end(err + '\n');
		}

		send(req, path.basename(zip), {
			root: path.dirname(zip)
		}).pipe(res);

		exec('rm', '-rf', zip, function (err) {

			if (err) {
				console.error('Error cleaning up after download: ' + err);
			}

		});
	});

}).listen(CFG.PORT);

var address = server.address();

console.log('Server running on %s:%s', address.address, address.port);
