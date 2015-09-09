'use script';


/**
 * Tests for the Karma Sonar grunt plugin.
 */
describe('KarmaSonar', function () {
    var gruntMock = require('gruntmock'),
        karmaSonar = require('./../tasks/karmaSonar.js'),
        fs = require('fs'),
        fsExtra = require('fs-extra'),
        path = require('path'),
        bufferEqual = require('buffer-equal');

    /**
     * Indicates if the file content matches.
     * @param actual The actual.
     * @param expected The expected.
     * @returns {*}
     */
    function fileContentMatches(actual, expected) {
        return bufferEqual(fs.readFileSync(actual),fs.readFileSync(expected));
    }

    const DEFAULT_OPTIONS = {
        defaultOutputDir: '.tmp/sonar',
        instance: {
            jdbcUrl: 'jdbc:h2:tcp://localhost:9092/sonar'
        },
        dryRun: true,
        runnerProperties: {
            'sonar.links.homepage': 'https://github.com/mdasberg/grunt-karma-sonar',
            'sonar.branch': 'master'
        }
    };

    it('should fail when no project information has been provided in the configuration', function (done) {
        var mock = gruntMock.create({
                target: 'all', options: DEFAULT_OPTIONS, data: {}
            }
        );
        mock.invoke(karmaSonar, function (err) {
            expect(mock.logError[0]).toBe('No project information has been specified.');
            done();
        });
    });

    it('should fail when no project key has been provided in the configuration', function (done) {
        var mock = gruntMock.create({
                target: 'all', options: DEFAULT_OPTIONS, data: {
                    project: {}
                }
            }
        );
        mock.invoke(karmaSonar, function (err) {
            expect(mock.logError[0]).toBe('Missing project key. Allowed characters are alphanumeric, \'-\', \'_\', \'.\' and \':\', with at least one non-digit.');
            done();
        });
    });

    it('should fail when no project key has been provided in the configuration', function (done) {
        var mock = gruntMock.create({
                target: 'all', options: DEFAULT_OPTIONS, data: {
                    project: {
                        key: 'key'
                    }
                }
            }
        );
        mock.invoke(karmaSonar, function (err) {
            expect(mock.logError[0]).toBe('Missing project name. Please provide one.');
            done();
        });
    });

    it('should fail when no paths have been provided in the configuration', function (done) {
        var mock = gruntMock.create({
                target: 'all', options: DEFAULT_OPTIONS, data: {
                    project: {
                        key: 'key',
                        name: 'name'
                    }
                }
            }
        );
        mock.invoke(karmaSonar, function (err) {
            expect(mock.logError.length).toBe(1);
            expect(mock.logError[0]).toBe('No paths provided. Please provide at least one.');
            done();
        });
    });

    it('should update the data', function (done) {
        var opts = DEFAULT_OPTIONS
        opts.defaultOutputDir = '.tmp/sonar-one-path';
        var mock = gruntMock.create({
                target: 'all', options: DEFAULT_OPTIONS, data: {
                    project: {
                        key: 'key',
                        name: 'name'
                    },
                    paths: [
                        {
                            cwd: 'data/projectx',
                            src: 'src',
                            test: 'test',
                            reports: {
                                unit: 'results/karma/results.xml',
                                coverage: 'results/karma/coverage/**/lcov.info'
                            }
                        }
                    ]
                }
            }
        );
        mock.invoke(karmaSonar, function (err) {
            expect(mock.logError.length).toBe(0);
            expect(mock.logOk.length).toBe(21);
            expect(mock.logOk[0]).toBe('Merging JUnit reports');
            expect(mock.logOk[1]).toBe('Merging Coverage reports');
            expect(mock.logOk[2]).toBe('Merging Integration Coverage reports');
            expect(mock.logOk[3]).toBe('Copying files to working directory [' + opts.defaultOutputDir + ']');
            expect(mock.logOk[4]).toBe('Dry-run');
            expect(mock.logOk[5]).toBe('Sonar would have been triggered with the following sonar properties:');
            expect(fsExtra.existsSync(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'TESTS-xunit.xml')).toBeTruthy();
            expect(fsExtra.existsSync(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'coverage_report.lcov')).toBeTruthy();
            expect(fileContentMatches(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'coverage_report.lcov', 'test/expected/sonar-one-path' + path.sep + 'coverage_report.lcov')).toBeTruthy();
            expect(fileContentMatches(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'TESTS-xunit.xml', 'test/expected/sonar-one-path' + path.sep + 'TESTS-xunit.xml')).toBeTruthy();
            done();
        });
    });

    it('should merge and update data from more paths', function (done) {
        var opts = DEFAULT_OPTIONS
        opts.defaultOutputDir = '.tmp/sonar-dots-in-specs';
        var mock = gruntMock.create({
                target: 'all', options: DEFAULT_OPTIONS, data: {
                    project: {
                        key: 'key',
                        name: 'name'
                    },
                    paths: [
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
                            cwd: 'data/projecty',
                            src: 'app',
                            test: 'tests',
                            reports: {
                                unit: 'results/karma/results.xml',
                                coverage: 'results/karma/coverage/**/lcov.info'
                            }
                        },
                        {
                            cwd: 'data/projectz',
                            src: 'src',
                            test: 'test',
                            reports: {
                                unit: 'results/unit/**/TESTS*.xml',
                                coverage: 'results/unit/coverage/**/lcov.info'
                            }
                        }
                    ]
                }
            }
        );
        mock.invoke(karmaSonar, function (err) {
            expect(mock.logError.length).toBe(0);
            expect(mock.logOk.length).toBe(21);
            expect(mock.logOk[0]).toBe('Merging JUnit reports');
            expect(mock.logOk[1]).toBe('Merging Coverage reports');
            expect(mock.logOk[2]).toBe('Merging Integration Coverage reports');
            expect(mock.logOk[3]).toBe('Copying files to working directory [' + opts.defaultOutputDir + ']');
            expect(mock.logOk[4]).toBe('Dry-run');
            expect(mock.logOk[5]).toBe('Sonar would have been triggered with the following sonar properties:');
            expect(fsExtra.existsSync(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'TESTS-xunit.xml')).toBeTruthy();
            expect(fsExtra.existsSync(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'coverage_report.lcov')).toBeTruthy();
            expect(fileContentMatches(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'coverage_report.lcov', 'test/expected/sonar-dots-in-specs' + path.sep + 'coverage_report.lcov')).toBeTruthy();
            expect(fileContentMatches(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'TESTS-xunit.xml', 'test/expected/sonar-dots-in-specs' + path.sep + 'TESTS-xunit.xml')).toBeTruthy();
            done();
        });
    });

    // Creates mock for testing parameters.
    function getDefaultParameterMock() {
        return gruntMock.create({
                target: 'all', options: DEFAULT_OPTIONS, data: {
                    project: {
                        key: 'key',
                        name: 'name',
                        version: '1.3.37'
                    },
                    exclusions: 'yep',
                    paths: [
                        {
                            cwd: 'data/projectx',
                            src: 'src',
                            test: 'test',
                            reports: {
                                unit: 'results/karma/results.xml',
                                coverage: 'results/karma/coverage/**/lcov.info'
                            }
                        }
                    ]
                }
            }
        );
    }

    it('should set the right default arguments (-D) for sonar-runner', function (done) {
        var opts = DEFAULT_OPTIONS
        opts.defaultOutputDir = '.tmp/sonar/';
        opts.runnerProperties = {};
        opts.instance = undefined;

        var mock = getDefaultParameterMock();

        mock.invoke(karmaSonar, function (err) {
            expect(mock.logError.length).toBe(0);
            expect(mock.logOk.length).toBe(20);
            expect(mock.logOk[4]).toBe('Dry-run');
            expect(mock.logOk[5]).toBe('Sonar would have been triggered with the following sonar properties:');

            // Defaults
            expect(mock.logOk[6]).toBe('-Dsonar.sources=src');
            expect(mock.logOk[7]).toBe('-Dsonar.tests=test');
            expect(mock.logOk[8]).toBe('-Dsonar.javascript.jstestdriver.reportsPath=results');
            expect(mock.logOk[9]).toBe('-Dsonar.javascript.lcov.reportPath=results/coverage_report.lcov');
            expect(mock.logOk[10]).toBe('-Dsonar.javascript.lcov.itReportPath=results/it_coverage_report.lcov');

            // options
            expect(mock.logOk[11]).toBe('-Dsonar.sourceEncoding=UTF-8');
            expect(mock.logOk[12]).toBe('-Dsonar.language=js');
            expect(mock.logOk[13]).toBe('-Dsonar.dynamicAnalysis=reuseReports');
            expect(mock.logOk[14]).toBe('-Dsonar.projectBaseDir=.tmp/sonar/');
            expect(mock.logOk[15]).toBe('-Dsonar.scm.disabled=true');

            // data
            expect(mock.logOk[16]).toBe('-Dsonar.projectKey=key');
            expect(mock.logOk[17]).toBe('-Dsonar.projectName=name');
            expect(mock.logOk[18]).toBe('-Dsonar.projectVersion=1.3.37');
            expect(mock.logOk[19]).toBe('-Dsonar.exclusions=yep');
            done();
        });
    });

    it('should set the credentials when options.instance is defined (-D) for sonar-runner', function (done) {
        var opts = DEFAULT_OPTIONS
        opts.defaultOutputDir = '.tmp/sonar/';
        opts.runnerProperties = {};
        opts.instance = {
            hostUrl: 'http://localhost:9000',
            jdbcUrl: 'jdbc:h2:tcp://localhost:9092/sonar',
            jdbcUsername: 'sonar',
            jdbcPassword: 'sonar',
            login: 'admin',
            password: 'admin'
        };

        var mock = getDefaultParameterMock();

        mock.invoke(karmaSonar, function (err) {
            expect(mock.logError.length).toBe(0);
            expect(mock.logOk.length).toBe(26);
            expect(mock.logOk[4]).toBe('Dry-run');
            expect(mock.logOk[5]).toBe('Sonar would have been triggered with the following sonar properties:');

            // options.instance
            expect(mock.logOk[11]).toBe('-Dsonar.host.url=http://localhost:9000');
            expect(mock.logOk[12]).toBe('-Dsonar.jdbc.url=jdbc:h2:tcp://localhost:9092/sonar');
            expect(mock.logOk[13]).toBe('-Dsonar.jdbc.username=sonar');
            expect(mock.logOk[14]).toBe('-Dsonar.jdbc.password=sonar');
            expect(mock.logOk[15]).toBe('-Dsonar.login=admin');
            expect(mock.logOk[16]).toBe('-Dsonar.password=admin');
            expect(mock.logOk[18]).toBe('-Dsonar.language=js');

            done();
        });
    });

    it('should exclude options that are excluded for sonar-runner', function (done) {
        var opts = DEFAULT_OPTIONS
        opts.defaultOutputDir = '.tmp/sonar/';
        opts.runnerProperties = {};
        opts.instance = {
            hostUrl: 'http://localhost:9000',
            jdbcUrl: 'jdbc:h2:tcp://localhost:9092/sonar',
            jdbcUsername: 'sonar',
            jdbcPassword: 'sonar',
            login: 'admin',
            password: 'admin'
        };
        opts.excludedProperties = ['sonar.language'];

        var mock = getDefaultParameterMock();

        mock.invoke(karmaSonar, function (err) {
            expect(mock.logError.length).toBe(0);
            expect(mock.logOk.length).toBe(25);
            expect(mock.logOk[4]).toBe('Dry-run');
            expect(mock.logOk[5]).toBe('Sonar would have been triggered with the following sonar properties:');

            // options.instance
            expect(mock.logOk[11]).toBe('-Dsonar.host.url=http://localhost:9000');
            expect(mock.logOk[12]).toBe('-Dsonar.jdbc.url=jdbc:h2:tcp://localhost:9092/sonar');
            expect(mock.logOk[13]).toBe('-Dsonar.jdbc.username=sonar');
            expect(mock.logOk[14]).toBe('-Dsonar.jdbc.password=sonar');
            expect(mock.logOk[15]).toBe('-Dsonar.login=admin');
            expect(mock.logOk[16]).toBe('-Dsonar.password=admin');
            expect(mock.logOk[18]).not.toBe('-Dsonar.language=js');

            done();
        });
    });
});

