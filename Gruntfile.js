// TODO: rename 'main' target to 'publish'
// TODO: http://www.html5rocks.com/en/tutorials/tooling/supercharging-your-gruntfile/


module.exports = function(grunt) {

  // Dependencies
  var path = require('path');

  // Variables
  var bootstrap_path = '../bootstrap';
  var scrollposstyler_path = '../scrollpos-styler';

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      publish: ['publish/*', 'less/variables.less', 'js/options.json', 'js/scrollPosStyler.js']
    },

    xsltproc: {
      options: {
        stylesheet: 'style/main.xsl',
        xinclude: true
      },
      publish: {
        files: {
          'publish/index.html': 'src/main.xml'
        }
      }
    },

    copy: {
      publish: {
        files: [
          {
            expand: true,
            flatten: true,
            nonull: true,
            cwd: bootstrap_path,
            src: '**/bootstrap*.min.css',
            dest: 'publish/css/'
          },
          {
            expand: true,
            flatten: true,
            nonull: true,
            cwd: bootstrap_path,
            src: '**/bootstrap.min.js',
            dest: 'publish/js/'
          },
          {
            expand: true,
            flatten: true,
            nonull: true,
            cwd: scrollposstyler_path,
            src: '**/scrollPosStyler.js',
            dest: 'js/'
          }
        ]
      }
    },

    concat: {
      publish: {
        src: ['js/options.json', 'js/*.js'],
        dest: 'publish/js/script.js',
      },
    },

    less: {
      publish: {
        options: {
          strictMath: true
        },
        files: {
          'publish/css/style.css': 'less/style.less'
        }
      }
    },

    autoprefixer: {
//      options: {
//        'browsers': '> 1%, last 2 versions'
//      },
      publish: {
        src: ['publish/css/style.css']
      }
    },

    csslint: {
      options: {
        'adjoining-classes': false,
        'compatible-vendor-prefixes': false
      },
      publish: {
        src: ['publish/css/style.css']
      }
    },

    cssmin: {
      publish: {
        files: {
          'publish/css/style.css': 'publish/css/style.css'
        }
      }
    },

    htmlmin: {
      publish: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        expand: true,
        nonull: true,
        src: 'publish/**/*.html'
      }
    },

    connect: {
      server: {
        options: {
          port: 8000,
          base: 'publish',
          keepalive: true,
          //open: 'http://localhost:8000/',
        }
      }
    }
  });

  // Load the plugin(s)
  require('load-grunt-tasks')(grunt);

  // Copy sample files
  grunt.registerTask('copy_samples', function() {
    // Recurse samples directory
    grunt.file.recurse('src/sample', function(abspath, rootdir, subdir, filename) {
      var destfile = path.join('src', filename);

      // Check if destination file exists
      if (! grunt.file.exists(destfile)) {
        grunt.log.writeln('Copying sample: ' + filename);

        // Copy sample to destination
        grunt.file.copy(abspath, destfile);
      }
    });
  });

  // Read bootstrap variables.less or config.json
  grunt.registerTask('parse_bootstrap_config', function() {
    // Find variables.less in bootstrap_path
    var bootstrap_config_path = grunt.file.expand({ cwd: bootstrap_path }, '**/variables.less')[0];
    if (bootstrap_config_path) {
      grunt.log.writeln('Copying Bootstrap variables: ' + bootstrap_config_path);

      // Copy variables.less
      grunt.file.copy(path.join(bootstrap_path, bootstrap_config_path), 'less/variables.less');

      return true;
    }
    grunt.log.writeln('Bootstrap variables not found!');

    // Find config.json in bootstrap_path
    var bootstrap_config_path = grunt.file.expand({ cwd: bootstrap_path }, '**/config.json')[0];
    if (! bootstrap_config_path) {
      grunt.log.error('Bootstrap config not found!');

      return false;
    }
    grunt.log.writeln('Parsing Bootstrap config: ' + bootstrap_config_path);

    // Parse config.json
    var bootstrap_config = grunt.file.readJSON(path.join(bootstrap_path, bootstrap_config_path));
    var variables = '';
    for (var key in bootstrap_config.vars) {
      variables += key + ':\t' + bootstrap_config.vars[key] + ';\n';
    }

    // Generate variables.less
    grunt.file.write('less/variables.less', variables);

    return true;
  });

  // Default task including everything
  grunt.registerTask('default', ['clean', 'copy', 'copy_samples', 'xsltproc', 'concat', 'parse_bootstrap_config', 'less', 'autoprefixer', 'csslint', 'cssmin', 'htmlmin', 'connect']);
  // Everything except minification
  grunt.registerTask('debug', ['clean', 'copy', 'copy_samples', 'xsltproc', 'concat', 'parse_bootstrap_config', 'less', 'autoprefixer', 'csslint', 'connect']);
};
