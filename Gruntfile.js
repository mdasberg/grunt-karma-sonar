/*
 * grunt-karma-sonar
 * https://github.com/mdasberg/grunt-karma-sonar
 *
 * Copyright (c) 2013 Mischa Dasberg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
            jshint: {
                all: [
                    'Gruntfile.js',
                    'tasks/*.js'
                ],
                options: {
                    jshintrc: '.jshintrc'
                }
            },
            karmaSonar: {
                options: {
                    defaultOutputDir: '.tmp/sonar2',
                    instance: {
                        jdbcUrl: 'jdbc:h2:tcp://localhost:9092/sonar'
                    },
                    dryRun: true,
                    runnerProperties: {
                        'sonar.links.homepage': 'https://github.com/mdasberg/grunt-karma-sonar',
                        'sonar.branch': 'master'
                    }
                },
                all: {
                    project: {
                        key: 'grunt-karma-sonar',
                        name: 'Grunt-karma-sonar plugin',
                        version: '0.2.10'
                    },
                    paths: [
                        {
                            cwd: 'node_modules/angular-test-setup',
                            src: 'src',
                            test: 'test',
                            reports: {
                                unit: 'results/karma/TESTS*.xml',
                                itUnit: {src:'results/protractor/cucumber/chrome/*.xml', framework: 'cucumber'},
                                coverage: 'results/karma/coverage/**/lcov.info',
                                itCoverage: 'results/protractor-coverage/**/lcov.info'
                            }
                        },
                        {
                            cwd: 'node_modules/angular-test-setup',
                            src: 'src',
                            test: 'test',
                            reports: {
                                itUnit: {src:'results/protractor/jasmine2/chrome/*.xml', framework: 'jasmine2'}
                            }
                        },
                        {
                            cwd: 'data/projectx',
                            src: 'src',
                            test: 'test',
                            reports: {
                                unit: 'results/karma/results.xml',
                                coverage: 'results/karma/coverage/**/lcov.info'
                            }
                        },
                        {
                            cwd: 'data/karma02x',
                            src: 'src',
                            test: 'test',
                            reports: {
                                unit: 'results/karma/results.xml',
                                coverage: 'results/unit/coverage/**/lcov.info'
                            }
                        }
                    ]
                }
            },

            // Before generating any new files, remove any previously-created files.
            clean: {
                tests: ['.tmp']
            },

            shell: {
                target: {
                    command: 'node_modules/jasmine-node/bin/jasmine-node test/*Spec.js'
                }
            }
        }
    );

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'shell']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
