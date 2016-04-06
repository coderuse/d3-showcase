module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');
  for (var taskName in pkg.devDependencies) {
    if (taskName.indexOf('grunt-') > -1) {
      grunt.loadNpmTasks(taskName);
    }
  }

  var config = {
    port: {
      dev: 8090,
      release: 9090,
      livereload: 35729
    }
  };

  //  var util = require('util');
  //  console.log(util.inspect(devDependencies));

  grunt.initConfig({
    pkg: pkg,
    clean: {
      release: ['release']
    },
    connect: {
      options: {
        hostname: '0.0.0.0'
      },
      dev: {
        options: {
          port: config.port.dev,
          livereload: config.port.livereload,
          base: 'src/html',
          open: {
            target: 'http://localhost:<%= connect.dev.options.port %>/index.html'
          }
        }
      }
    },
    copy: {
      release: {
        files: [
          {
            expand: true,
            cwd: 'src/html/',
            src: ['**'],
            dest: 'release/'
          }
        ]
      }
    },
    sass: {
      dev: {
        options: {
          sourcemap: 'none',
          style: 'expanded',
          trace: true
        },
        files: {
          // target.css file: source.scss file
          'src/html/css/app.css': 'src/sass/app.scss'
        }
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      customJS: ['src/html/js/**/*.js']
    },
    watch: {
      styles: {
        files: [
          'src/sass/**/*.scss'
        ],
        tasks: ['sass:dev']
      },
      jsChanges: {
        files: ['src/html/js/**/*.js'],
        tasks: ['jshint']
      },
      sources: {
        options: {
          spawn: false,
          livereload: config.port.livereload
        },
        files: [
          'src/html/js/**/*.js',
          'src/html/css/**/*.css',
          'src/html/*.html'
        ]
      }
    }
  });

  // Development
  grunt.registerTask('default', ['sass', 'jshint', 'connect:dev', 'watch']);

  // Release
  grunt.registerTask('release', ['clean', 'sass', 'jshint', 'copy']);
};