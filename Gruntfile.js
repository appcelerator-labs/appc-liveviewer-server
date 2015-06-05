module.exports = function (grunt) {

	var test = grunt.option('test') || '*';

	grunt.initConfig({
		mochaTest: {
			options: {
				timeout: 30000,
				reporter: 'spec',
				ignoreLeaks: true
			},
			src: ['test/**/' + test + '_test.js']
		}
	});

	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('test', 'mochaTest');

	grunt.registerTask('default', 'test');
};
