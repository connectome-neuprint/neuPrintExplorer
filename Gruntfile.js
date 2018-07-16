module.exports = function(grunt) {
    // load npm modules at runtime
    require('jit-grunt')(grunt);
  
    // Project configuration.
    grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    exec: {
      options: {},
      build_neuroglancer: {
        cwd: './node_modules/neuroglancer/',
        command: 'npm install && npm run build-min',
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
                        src: 'node_modules/react-grid-layout/css/styles.css',
                        dest: 'build/css/grid.min.css'
                    },
                    {
                        src: 'node_modules/react-resizable/css/styles.css',
                        dest: 'build/css/resize.min.css'
                    },
                    {
                        src: 'build/js/bundle.js',
                        dest: 'build/js/bundle.min.js',
                    },
                    {
                        expand: "true",
                        src: 'public/**/*',
                        dest: 'build/'
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/neuroglancer/dist/min',
                        src: '*',
                        dest: 'build/external/neuroglancer'
                    }
                ]
        },
        dist: {
                files: [
                    {
                        expand: "true",
                        src: 'public/**/*',
                        dest: 'dist/'
                    },
                    {
                        src: 'src/index.html',
                        dest: 'dist/index.html'
                    },
                    {
                        src: 'node_modules/react-grid-layout/css/styles.css',
                        dest: 'dist/css/grid.min.css'
                    },
                    {
                        src: 'node_modules/react-resizable/css/styles.css',
                        dest: 'dist/css/resize.min.css'
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/neuroglancer/dist/min',
                        src: '*',
                        dest: 'dist/external/neuroglancer'
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
    grunt.registerTask('serve')
    grunt.registerTask('default', ['exec:build_neuroglancer', 'browserify:app', 'copy:build', 'watch']);
    grunt.registerTask('dist', ['env:dist', 'exec:build_neuroglancer', 'browserify:app', 'uglify', 'copy:dist']);
    grunt.registerTask('jlint', 'Running lint', ['jslint']);
    grunt.registerTask('lint', 'Running eslint', ['eslint']);
};
