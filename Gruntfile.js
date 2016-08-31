module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		clean: {
			dev: {
				src: [ "build" ]
			}
		},
		copy: {
			dev: {
				files: [{
					cwd: 'src',
					src: ['**/*','!**/*{.styl,.pug,.md}', '!**/_*'],
					dest: 'build',
					expand: true
				}]
			}
		},
		stylus: {
			compile: {
				options: {
					linenos: false,
					compress: true,
					use: [
						require('autoprefixer-stylus'),
						require('rupture')
					]
				},
				files: [{
					expand: true,
					cwd: 'src',
					src: [ '**/*.styl', '!**/_*' ],
					dest: 'build/',
					ext: '.css'
				}]
			}
		},
		pug: {
			compile: {
				options: {
					data: {
						linkedin: require('./data/linkedin.json'),
					},
					filters: {
						plain: function(block) {
							return block
						}
					},
					pretty: false
				},
				files: [{
					expand: true,
					cwd: 'src',
					src: [ '*.pug' ], //recursive checks **/*.pug will ignore !**/_*.pug
					dest: 'build',
					ext: '.html'
				}]
			}
		},
		browserSync: {
			dev: {
				bsFiles: {
					src: ['build/*']
				},
				options: {
					watchTask: true,
					open: false,
					server: "build",
					port: 9000
				}
			}
		},
		watch: {
			css: {
				files: 'src/css/**/*.styl',
				tasks: ['stylus'],
			},
			pug: {
				files: 'src/**/*.pug',
				tasks: ['pug']
			},
		},
		'gh-pages': {
			options: {
				base: 'build'
			},
			src: ['**']
		},
		exec: {
			linkedin: 'node linkedin.js'
		}
	});

	// Load plugin(s).
	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-pug');
	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-gh-pages');
	grunt.loadNpmTasks('grunt-html-pdf');
	
	
	

	// Define task(s).
	grunt.registerTask('dev', ['clean', 'copy', 'pug', 'stylus', 'browserSync', 'watch']);
	grunt.registerTask('deploy', ['clean', 'copy', 'pug', 'stylus','gh-pages']);
	grunt.registerTask('update', ['exec:linkedin','clean', 'copy', 'pug', 'stylus']);
};