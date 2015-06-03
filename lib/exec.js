var child_process = require('child_process');

module.exports = function exec() {
	var args = Array.prototype.slice.call(arguments);
	var cmd = args.shift();
	var opts = {};
	var callback = args.pop();

	if (_.isObject(args[args.length - 1])) {
		opts = args.pop();
	}

	if (args.length === 1 && _.isArray(args[0])) {
		args = args[0];
	}

	// console.log(cmd + ' ' + args.join(' '));

	child_process.execFile(cmd, args, opts, function (error, stdout, stderr) {
		callback(error ? stderr : null, stdout);
	});
};
