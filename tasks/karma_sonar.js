/*
 * grunt-karma-sonar
 * https://github.com/mdasberg/grunt-karma-sonar
 *
 * Copyright (c) 2013 Mischa Dasberg
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    var spawn = require("child_process").spawn, donePromise;

    grunt.registerMultiTask('karma_sonar', 'Grunt plugin for integrating karmma reports with sonar', function () {
        donePromise = this.async();

        var options = this.options({
            dynamicAnalysis: 'reuseReports',
            language: 'js',
            defaultOutputDir: '.tmp/sonar/'
        });

        var data = this.data;

        /**
         * Updates the given lcov file content and returns it.
         * @param source The source.
         * @returns {*}
         */
        function getUpdatedLcovFileContent(source) {
            if (grunt.file.exists(source.coverageReport)) {
                var content = grunt.file.read(source.coverageReport);
                return content.replace(/SF:\./ig, 'SF:' + (source.prefix || '.'));
            } else {
                grunt.log.error(source.coverageReport + " does not exist.");
                return null;
            }
        }

        /**
         * Merge the lcov files.
         * @param sources The sources.
         */
        function mergeLcovFiles(sources) {
            var mergedAndUpdatedContent = '';
            sources.forEach(function (source) {
                if (hasLcovFile(source)) {
                    mergedAndUpdatedContent = mergedAndUpdatedContent.concat(getUpdatedLcovFileContent(source) + '\n');
                }
            });
            grunt.file.write(options.defaultOutputDir + 'coverage_report.lcov', mergedAndUpdatedContent);
        }


        /**
         * Indicates has lcov files.
         * @param sources The sources.
         */
        function hasLcovFiles(sources) {
            var result = false;
            sources.forEach(function (source) {
                if (hasLcovFile(source)) {
                    result = true;
                }
            });
            return result;
        }

        /**
         * Indicates has lcov file.
         * @param source The source.
         */
        function hasLcovFile(source) {
            return source.coverageReport !== undefined;
        }

        /**
         * Updates the given junit file content and returns it.
         * @param source The source.
         * @returns {*}
         */
        function getUpdatedJunitFileContent(source) {
            if (grunt.file.exists(source.testReport)) {
                var content = grunt.file.read(source.testReport);
                content = content.replace(/\<\?xml.+\?\>/g, '');
                content = content.replace(/\<testsuites>/g, '');
                content = content.replace(/\<\/testsuites>/g, '');

                return content;
            } else {
                grunt.log.error(source.testReport + " does not exist.");
                return null;
            }
        }

        /**
         * Merge the junit files.
         * @param sources The sources.
         */
        function mergeJUnitFiles(sources) {
            var mergedAndUpdatedContent = '<?xml version="1.0"?><testsuites>';
            sources.forEach(function (source) {
                if (hasJunitFile(source)) {
                    mergedAndUpdatedContent = mergedAndUpdatedContent.concat(getUpdatedJunitFileContent(source));
                }
            });
            mergedAndUpdatedContent = mergedAndUpdatedContent.concat('</testsuites>');
            grunt.file.write(options.defaultOutputDir + 'TESTS-xunit.xml', mergedAndUpdatedContent);
        }

        /**
         * Indicates has junit files.
         * @param sources The sources.
         */
        function hasJunitFiles(sources) {
            var result = false;
            sources.forEach(function (source) {
                if (hasJunitFile(source)) {
                    result = true;
                }
            });
            return result;
        }

        /**
         * Indicates has junit file.
         * @param source The source.
         */
        function hasJunitFile(source) {
            return source.testReport !== undefined;
        }

        /**
         * Get the source paths from the sources.
         * @param sources The sources.
         * @returns {Array}
         */
        function getSourcePaths(sources) {
            var sourceLocations = [];
            sources.forEach(function (source) {
                sourceLocations.push(source.path);
            });
            return sourceLocations;
        }

        /**
         * Get the sonar arguments.
         * @param data The data.
         * @param options The options.
         * @returns {Array}
         */
        function getSonarArguments(data, options) {
            var args = [];
            args.push('-Dsonar.sourceEncoding=' + 'UTF-8');
            args.push('-Dsonar.language=' + options.language);
            args.push('-Dsonar.dynamicAnalysis=' + options.dynamicAnalysis);
            args.push('-Dsonar.projectKey=' + data.project.key);
            args.push('-Dsonar.projectName=' + data.project.name);
            args.push('-Dsonar.projectVersion=' + data.project.version);
            args.push('-Dsonar.sources=' + getSourcePaths(data.sources));
            if (hasLcovFiles(data.sources)) {
                args.push('-Dsonar.javascript.lcov.reportPath=' + options.defaultOutputDir + 'coverage_report.lcov');
            }
            if (hasJunitFiles(data.sources)) {
                args.push('-Dsonar.javascript.jstest.reportsPath=' + options.defaultOutputDir);
            }
            args.push('-Dsonar.exclusions=' + data.exclusions);

            if (options.instance !== undefined) {
                args.push('-Dsonar.host.url=' + options.instance.hostUrl);
                args.push('-Dsonar.jdbc.url=' + options.instance.jdbcUrl);
                if (options.instance.jdbcUsername !== undefined) {
                    args.push('-Dsonar.jdbc.username=' + options.instance.jdbcUsername);
                }
                if (options.instance.jdbcPassword !== undefined) {
                    args.push('-Dsonar.jdbc.password=' + options.instance.jdbcPassword);
                }
                if (options.instance.profile !== undefined) {
                    args.push('-Dsonar.profile=' + options.instance.profile);
                }
                args.push('-Dsonar.login=' + options.instance.login);
                args.push('-Dsonar.password=' + options.instance.password);
            }
            return args;
        }

        mergeLcovFiles(data.sources);
        mergeJUnitFiles(data.sources);

        function exec() {
            var child = grunt.util.spawn({
                cmd: 'sonar-runner',
                args: getSonarArguments(data, options),
                opts: {
                    stdio: 'inherit'
                }
            }, function (error, result, code) {
                if (code === 1) {
                    return grunt.log.error('Something went wrong while trying to upload to sonar. ');
                } else {
                    grunt.log.writeln('Uploaded information to sonar.');
                }
                donePromise();
            });
        }

        exec();
    });
};
