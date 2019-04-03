/*globals process */
(function () {
    'use strict';

    module.exports = function (grunt) {
        var glob = require('glob'),
            fs = require('fs-extra'),
            path = require('path'),
            async = require('async'),
            _ = require('lodash'),
            xunit = require('./xunit.js')(grunt),
            junit = require('./junit.js')(grunt),
            coverage = require('./coverage.js')(grunt),
            defaultOptions = {
                dynamicAnalysis: 'reuseReports',
                sourceEncoding: 'UTF-8',
                language: 'js',
                defaultOutputDir: '.tmp/sonar/',
                scmDisabled: true,
                excludedProperties: []
            };

        /**
         * Copy files to the temp directory.
         * @param g The glob.
         */
        function copyFiles(g, defaultOutputDir, targetDir) {
            var files = glob.sync(g.src.toString(), {cwd: g.cwd, root: '/'});
            files.forEach(function (file) {
                var destinationDirectory = defaultOutputDir + path.sep + targetDir;
                var fileDirectory = path.dirname(file);
                if (fileDirectory !== '.') {
                    destinationDirectory = destinationDirectory + path.sep + fileDirectory;
                }
                fs.mkdirpSync(destinationDirectory);
                var source = path.resolve(g.cwd, file);
                var extension = path.extname(file);
                var destination;
                if (targetDir === 'test') {
                    var base = path.basename(file, extension);
                    if (extension === '.js') {
                        destination = destinationDirectory + path.sep + path.basename(base.replace(/\./g, '_') + extension);
                    } else if (extension === '.feature') {
                        destination = destinationDirectory + path.sep + path.basename(base.concat(extension).replace(/\./g, '_') + '.js');
                    }
                } else {
                    destination = destinationDirectory + path.sep + path.basename(file);
                }

                fs.copySync(source, destination, {replace: true});
            });
        }

        /**
         * Deep merge json objects.
         * @param original The original object.
         * @param override The override object.
         * @return merged The merged object.
         */
        function mergeJson(original, override) {
            return _.merge(original, override, function (a, b, key, aParent, bParent) {
                if (_.isUndefined(b)) {
                    aParent[key] = undefined;
                    return;
                }
            });
        }

        /**
         * Builds the arguments that need to be sent to sonar-runner.
         *
         * @param sonarOptions The sonar options such as username, password etc.
         * @param data The data such as project name and project version.
         * @returns The array of command line options for sonar-runner.
         */
        function buildArgs(sonarOptions, data) {
            // Default arguments
            var args = [
                '-Dsonar.sources=src',
                '-Dsonar.tests=test',
                '-Dsonar.javascript.jstestdriver.reportsPath=results',
                '-Dsonar.genericcoverage.unitTestReportPaths=' + 'results' + path.sep + 'TESTS-junit.xml',
                '-Dsonar.javascript.jstestdriver.itReportsPath=results',
                '-Dsonar.javascript.lcov.reportPaths=' + 'results' + path.sep + 'coverage_report.lcov' + ',' + 'results' + path.sep + 'it_coverage_report.lcov',
                '-Dsonar.javascript.lcov.reportPath=' + 'results' + path.sep + 'coverage_report.lcov',
                '-Dsonar.javascript.lcov.itReportPath=' + 'results' + path.sep + 'it_coverage_report.lcov'
            ];

            // Add the parameter (-D) only when the 'key' exists in the 'object'
            function addParameter(prop, object, key) {
                var value = _.result(object, key);
                if (value !== undefined && value !== null && sonarOptions.excludedProperties.indexOf(prop) === -1) {
                    args.push('-D' + prop + '=' + value);
                }
            }

            addParameter('sonar.host.url', sonarOptions.instance, 'hostUrl');
            addParameter('sonar.jdbc.url', sonarOptions.instance, 'jdbcUrl');
            addParameter('sonar.jdbc.username', sonarOptions.instance, 'jdbcUsername');
            addParameter('sonar.jdbc.password', sonarOptions.instance, 'jdbcPassword');
            addParameter('sonar.login', sonarOptions.instance, 'login');
            addParameter('sonar.password', sonarOptions.instance, 'password');

            addParameter('sonar.sourceEncoding', sonarOptions, 'sourceEncoding');
            addParameter('sonar.language', sonarOptions, 'language');
            addParameter('sonar.dynamicAnalysis', sonarOptions, 'dynamicAnalysis');
            addParameter('sonar.projectBaseDir', sonarOptions, 'defaultOutputDir');
            addParameter('sonar.scm.disabled', sonarOptions, 'scmDisabled');

            addParameter('sonar.projectKey', data.project, 'key');
            addParameter('sonar.projectName', data.project, 'name');
            addParameter('sonar.projectVersion', data.project, 'version');

            addParameter('sonar.exclusions', data, 'exclusions');
            return args;
        }

        function logArguments(message, opts) {
            grunt.log.writeln(message, opts.args);
            _.each(opts.args, function (arg) {
                grunt.log.writeln(arg);
            });
        }

        return {
            run: function (configuration) {
                var data = configuration.data;

                if (typeof data.project === 'undefined') {
                    grunt.fail.fatal('No project information has been specified.');
                }

                if (typeof data.project.key === 'undefined') {
                    grunt.fail.fatal('Missing project key. Allowed characters are alphanumeric, \'-\', \'_\', \'.\' and \':\', with at least one non-digit.');
                }

                if (typeof data.project.name === 'undefined') {
                    grunt.fail.fatal('Missing project name. Please provide one.');
                }

                if (typeof data.paths === 'undefined' || data.paths.length === 0) {
                    grunt.fail.fatal('No paths provided. Please provide at least one.');
                }

                var sonarOptions = mergeJson(defaultOptions, configuration.options({})),
                    done = configuration.async(),
                    resultsDir = sonarOptions.defaultOutputDir + path.sep + 'results' + path.sep,
                    xUnitResultFile = resultsDir + 'TESTS-xunit.xml',
                    jUnitResultFile = resultsDir + 'TESTS-junit.xml',
                    itJUnitResultFile = resultsDir + 'ITESTS-xunit.xml',
                    coverageResultFile = resultsDir + 'coverage_report.lcov',
                    itCoverageResultFile = resultsDir + 'it_coverage_report.lcov';

                async.series({
                        // #1
                        mergeJUnitReports: function (callback) {
                            grunt.verbose.writeln('Merging JUnit reports');
                            xunit.merge(data.paths, xUnitResultFile, 'unit');
                            junit.convert(xUnitResultFile, jUnitResultFile, 'unit');
                            callback(null, 200);
                        },
                        // #2
                        mergeItJUnitReports: function (callback) {
                            grunt.verbose.writeln('Merging Integration JUnit reports');
                            xunit.merge(data.paths, itJUnitResultFile, 'itUnit');
                            callback(null, 200);
                        },
                        // #3
                        mergeCoverageReports: function (callback) {
                            grunt.verbose.writeln('Merging Coverage reports');
                            coverage.merge(data.paths, coverageResultFile, 'coverage');
                            callback(null, 200);
                        },
                        // #4
                        mergeItCoverageReports: function (callback) {
                            grunt.verbose.writeln('Merging Integration Coverage reports');
                            coverage.merge(data.paths, itCoverageResultFile, 'itCoverage');
                            callback(null, 200);
                        },
                        // #5
                        copy: function (callback) {
                            grunt.verbose.writeln('Copying files to working directory [' + sonarOptions.defaultOutputDir + ']');
                            var sourceGlobs = [],
                                testGlobs = [];

                            data.paths.forEach(function (p) {
                                var cwd = p.cwd ? p.cwd : '.';
                                copyFiles({
                                    cwd: cwd + path.sep + p.src,
                                    src: '**/*.*'
                                }, sonarOptions.defaultOutputDir, p.src);
                                copyFiles({
                                    cwd: cwd + path.sep + p.test,
                                    src: '**/*.js'
                                }, sonarOptions.defaultOutputDir, p.test);
                                copyFiles({
                                    cwd: cwd + path.sep + p.test,
                                    src: '**/*.feature'
                                }, sonarOptions.defaultOutputDir, p.test);
                            });

                            callback(null, 200);
                        },

                        // #6
                        publish: function (callback) {
                            var extension = (/^win/.test(process.platform) ? '.bat' : '');
                            var opts = {
                                cmd: 'sonar-runner' + extension,
                                args: buildArgs(sonarOptions, data),
                                opts: {
                                    stdio: 'inherit'
                                }
                            };

                            var libDir = path.join(__dirname, '..', 'lib');
                            if (grunt.file.exists(libDir)) {

                                glob.sync('**/bin/sonar-runner' + extension, {
                                    cwd: libDir,
                                    root: '/'
                                }).forEach(function (file) {
                                    opts.cmd = libDir + path.sep + file;
                                });
                            }

                            // Add custom properties
                            if (sonarOptions.runnerProperties) {
                                Object.keys(sonarOptions.runnerProperties).forEach(function (prop) {
                                    opts.args.push('-D' + prop + '=' + sonarOptions.runnerProperties[prop]);
                                });
                            }

                            // enable debug
                            if (sonarOptions.debug) {
                                opts.args.push('-X');
                            }

                            if (!sonarOptions.dryRun) {
                                if (sonarOptions.debug) {
                                    logArguments('Sonar will run with the following sonar properties:', opts);
                                }
                                grunt.util.spawn(opts, function (error, result, code) {
                                    if (code !== 0) {
                                        return grunt.warn('The following error occured while trying to upload to sonar: ' + error);
                                    } else {
                                        grunt.log.writeln('Uploaded information to sonar.');
                                    }
                                    callback(null, 200);
                                });
                            } else {
                                grunt.log.subhead('Dry-run');
                                logArguments('Sonar would have been triggered with the following sonar properties:', opts);
                                callback(null, 200);
                            }
                        }
                    },
                    function (err) {
                        if (err !== undefined && err !== null) {
                            grunt.fail.fatal(err);
                        }
                        done();
                    });
            }
        };
    };
})();
