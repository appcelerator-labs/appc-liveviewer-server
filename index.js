exports = module.exports = require('./lib/engine');

if (module.id === '.') {
	require('./lib/server');
}
