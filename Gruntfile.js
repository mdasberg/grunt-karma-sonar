/*
 * grunt-karma-sonar
 * https://github.com/mdasberg/grunt-karma-sonar
 *
 * Copyright (c) 2013 Mischa Dasberg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['.tmp']
    },

    // Configuration to be run (and then tested).
    karma_sonar: {
        default_options: {
            project: {
                key: 'grunt-sonar',
                name: 'Grunt sonar plugin',
                version: '0.1.0'
            },
            sources: [
                {
                    path: 'sources/first/scripts',
                    prefix: 'sources/first',
                    coverageReport: 'results/first/lcov.info',
                    testReport: 'results/first/junit.xml'
                }
                ,
                {
                    path: 'sources/second/scripts',
                    prefix: 'sources/second',
                    coverageReport: 'results/second/lcov.info',
                    testReport: 'results/second/junit.xml'
                }
            ],
            exclusions: []
        },
        custom_options: {
            options: {
                defaultOutputDir: '.tmp/sonar/custom_options/',
                instance: {
                    hostUrl : 'http://localhost:20001',
                    jdbcUrl : 'jdbc:h2:tcp://localhost:20003/sonar',
                    login: 'admin',
                    password: 'admin'
                }
            },
            project: {
                key: 'grunt-sonar',
                name: 'Grunt sonar plugin',
                version: '0.1.0'
            },
            sources: [
                {
                    path: 'sources/first/scripts',
                    prefix: 'sources/first',
                    testReport: 'results/first/junit.xml'
                },
                {
                    path: 'sources/second/scripts',
                    prefix: 'sources/second',
                    coverageReport: 'results/second/lcov.info'

                }
            ],
            exclusions: []
        }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'karma_sonar', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
