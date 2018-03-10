module.exports = function(grunt) {
    // load npm modules at runtime
    require('jit-grunt')(grunt);
  
    // Project configuration.
    grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
        server: {
            options: {
              port: 9500,
              base: 'build'
            }
        }
    },
    sass: { 
        dist: {
            options: { 
                style: 'expanded',
                includePaths: ['node_modules/bootstrap/scss/']
            },
            files: {
                'build/css/main.css': 'node_modules/bootstrap/scss/bootstrap.scss'
            }
        }
    },
    cssmin: {
          dist: {
              files: [{
                  expand: true,
                  cwd: 'build/css',
                  src: ['*.css', '!*.min.css'],
                  dest: 'dist/css',
                  ext: '.min.css'
              }]
          }
    },
    browserify: {
        app: {
            options: {
                transform:  [
                    [
                        'babelify', 
                         {
                             presets: ['es2015', 'react'], 
                             plugins: ["transform-class-properties"]
                         }
                    ]
                ],
            },
            src:        'src/js/app.js',
            dest:       'build/js/bundle.js'
        }
    },
    uglify: {
        options: {
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        dist: {
            src: 'build/js/bundle.js',
            dest: 'dist/js/bundle.min.js'
        }
    },
    copy: {
        build: {
                files: [
                    {
                        src: 'src/index.html',
                        dest: 'build/index.html'
                    },
                    {
                        src: 'build/js/bundle.js',
                        dest: 'build/js/bundle.min.js',
                    },
                    {
                        expand: "true",
                        cwd: 'node_modules/bootstrap/',
                        src: 'fonts/*',
                        dest: 'build/'
                    },
                    {
                        src: 'build/css/main.css',
                        dest: 'build/css/main.min.css',
                    }
                ]
        },
        dist: {
                files: [
                    {
                        expand: "true",
                        cwd: 'node_modules/bootstrap/',
                        src: 'fonts/*',
                        dest: 'dist/'
                    },
                    {
                        src: 'src/index.html',
                        dest: 'dist/index.html'
                    }
                ]
        },
    },
    jslint: {
        client: {
            src: [ 'src/**/*.js' ],
            directives: {
                node: true,
                browser: true,
                predef: [
                    '$'
                ]
            }
        }
    },
    eslint: {
        target: [
            'Gruntfile.js',
            'src/**/*.js'
        ]
    },
    watch: {
      scripts: {
        files: ['src/index.html', 'src/**/*.js'],
        tasks: ['browserify', 'copy:build']
      }
    },
    env: {
        dist : {
            NODE_ENV : 'production'
        }
    }
    });

    // Default task(s).
    grunt.registerTask('serve', ['connect'])
    grunt.registerTask('default', ['browserify:app', 'sass', 'copy:build','connect', 'watch']);
    grunt.registerTask('dist', ['env:dist', 'browserify:app', 'sass', 'uglify', 'copy:dist', 'cssmin']);
    grunt.registerTask('jlint', 'Running lint', ['jslint']);
    grunt.registerTask('lint', 'Running eslint', ['eslint']);

};
