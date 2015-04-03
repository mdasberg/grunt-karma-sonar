'use strict';

module.exports = function (grunt) {
    var glob = require("glob"),
        fs = require('fs-extra'),
        path = require('path'),
        async = require('async'),
        _ = require('lodash'),
        jasmineJUnit = require('./jasmineJunit.js'),
        coverage = require('./coverage.js'),
        defaultOptions = {
            dynamicAnalysis: 'reuseReports',
            sourceEncoding: 'UTF-8',
            language: 'js',
            defaultOutputDir: '.tmp/sonar/',
            scmDisabled: true,
            instance: {
                hostUrl: 'http://localhost:9000',
                jdbcUrl: 'jdbc:h2:tcp://localhost:9092/sonar',
                jdbcUsername: 'sonar',
                jdbcPassword: 'sonar',
                login: 'admin',
                password: 'admin'
            }
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
            var destination = destinationDirectory + path.sep + path.basename(file);
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
        return _.merge(original, override, function (a, b) {
            if (_.isArray(a)) {
                return a.concat(b);
            }
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
                jUnitResultFile = resultsDir + 'TESTS-xunit.xml',
                coverageResultFile = resultsDir + 'coverage_report.lcov';

            async.series({
                    // #1
                    mergeJUnitReports: function (callback) {
                        grunt.verbose.writeln('Merging JUnit reports');
                        jasmineJUnit.merge(data.paths, jUnitResultFile, callback);
                        callback(null, 200);
                    },
                    // #2
                    mergeCoverageReports: function (callback) {
                        grunt.verbose.writeln('Merging Coverage reports');
                        coverage.merge(data.paths, coverageResultFile);

                        callback(null, 200);
                    },
                    //#3
                    copy: function (callback) {
                        grunt.verbose.writeln('Copying files to working directory [' + sonarOptions.defaultOutputDir + ']');
                        var sourceGlobs = [],
                            testGlobs = [];

                        data.paths.forEach(function (p) {
                            var cwd = p.cwd ? p.cwd : '.';
                            sourceGlobs.push({cwd: cwd + path.sep + p.src, src: '**/*'});
                            testGlobs.push({cwd: cwd + path.sep + p.test, src:'**/*'});
                        });

                        sourceGlobs.forEach(function (g) {
                            copyFiles(g, sonarOptions.defaultOutputDir, 'src');
                        });

                        testGlobs.forEach(function (g) {
                            copyFiles(g, sonarOptions.defaultOutputDir, 'test');
                        });
                        callback(null, 200);
                    },
                    //#4
                    publish: function (callback) {
                        var opts = {
                            cmd: 'sonar-runner',
                            args: [
                                '-Dsonar.sourceEncoding=' + sonarOptions.sourceEncoding,
                                '-Dsonar.language=' + sonarOptions.language,
                                '-Dsonar.dynamicAnalysis=' + sonarOptions.dynamicAnalysis,
                                '-Dsonar.projectKey=' + data.project.key,
                                '-Dsonar.projectName=' + data.project.name,
                                '-Dsonar.projectVersion=' + data.project.version,
                                '-Dsonar.projectBaseDir=' + sonarOptions.defaultOutputDir,
                                '-Dsonar.sources=' + 'src',
                                '-Dsonar.tests=' + 'test',
                                '-Dsonar.exclusions=' + data.exclusions,
                                '-Dsonar.javascript.jstestdriver.reportsPath=' + 'results',
                                '-Dsonar.javascript.lcov.reportPath=' + 'results' + path.sep + 'coverage_report.lcov',
                                '-Dsonar.scm.disabled=' + sonarOptions.scmDisabled,
                                '-Dsonar.host.url=' + sonarOptions.instance.hostUrl,
                                '-Dsonar.jdbc.url=' + sonarOptions.instance.jdbcUrl,
                                '-Dsonar.jdbc.username=' + sonarOptions.instance.jdbcUsername,
                                '-Dsonar.jdbc.password=' + sonarOptions.instance.jdbcPassword,
                                '-Dsonar.login=' + sonarOptions.instance.login,
                                '-Dsonar.password=' + sonarOptions.instance.password
                            ],
                            opts: {
                                stdio: 'inherit'
                            }
                        };

                        // Add custom properties
                        if (sonarOptions.runnerProperties) {

                            Object.keys(sonarOptions.runnerProperties).forEach(function (prop) {
                                opts.args.push('-D' + prop + '=' + sonarOptions.runnerProperties[prop]);
                            });
                        }


                        if (!sonarOptions.dryRun) {
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
                            grunt.log.writeln('Sonar would have been triggered with the following sonar properties:', opts.args);
                            callback(null, 200);
                        }

                    }
                },
                function (err, results) {
                    if (err !== undefined) {
                        grunt.fail.fatal(err);
                    }
                    done();
                });
        }
    };
};