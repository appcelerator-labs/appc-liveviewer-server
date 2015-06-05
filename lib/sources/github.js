var exec = require('./../exec');

var REGEXP_GITHUB = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/(?:blob|tree)\/([^\/]+)(\/.*[^\/])?)?\/?$/;

var Source = exports;

Source.download = function download(url, downloadPath, callback) {
	var matchedGitHubUrl = Source.matchGitHubUrl(url);

	if (!matchedGitHubUrl) {
		return false;
	}

	var svnUrl = Source.buildSvnUrl(matchedGitHubUrl);

	exec('svn', 'export', svnUrl, downloadPath, function (err, stdout) {

		if (err) {
			return callback('Error exporting via SVN: ' + err);
		}

		return callback();
	});

	return true;
};

Source.matchGitHubUrl = function matchGitHubUrl(url) {
	var match = url.match(REGEXP_GITHUB);

	if (!match) {
		return false;
	}

	var matchedGitHubUrl = {
		user: match[1],
		repo: match[2]
	};

	if (match[3]) {
		matchedGitHubUrl.branch = match[3];

		if (match[4]) {
			matchedGitHubUrl.path = match[4];
		}
	}

	return matchedGitHubUrl;
};

Source.buildSvnUrl = function buildSvnUrl(matchedGitHubUrl) {
	var svnUrl = 'https://github.com/' + matchedGitHubUrl.user + '/' + matchedGitHubUrl.repo;

	if (matchedGitHubUrl.branch) {
		svnUrl += '/branches/' + matchedGitHubUrl.branch + (matchedGitHubUrl.path || '');
	} else {
		svnUrl += '/trunk';
	}

	return svnUrl;
};
