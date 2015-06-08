var exec = require('./../exec');

var REGEXP = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/(?:blob|tree)\/([^\/]+)(\/.*[^\/])?)?\/?$/;

var Source = exports;

Source.download = function download(url, downloadPath, callback) {
	var matchedUrl = Source.matchUrl(url);

	if (!matchedUrl) {
		return false;
	}

	var svnUrl = Source.buildSvnUrl(matchedUrl);

	exec('svn', 'export', '--non-interactive', svnUrl, downloadPath, function (err, stdout) {

		if (err) {
			return callback('Error exporting via SVN: ' + err);
		}

		return callback();
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
		repo: match[2]
	};

	if (match[3]) {
		matchedUrl.branch = match[3];

		if (match[4]) {
			matchedUrl.path = match[4];
		}
	}

	return matchedUrl;
};

Source.buildSvnUrl = function buildSvnUrl(matchedUrl) {
	var svnUrl = 'https://github.com/' + matchedUrl.user + '/' + matchedUrl.repo;

	if (matchedUrl.branch) {
		svnUrl += '/branches/' + matchedUrl.branch + (matchedUrl.path || '');
	} else {
		svnUrl += '/trunk';
	}

	return svnUrl;
};
