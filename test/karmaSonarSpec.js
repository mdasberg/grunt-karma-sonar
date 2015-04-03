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
            expect(mock.logOk.length).toBe(5);
            expect(mock.logOk[0]).toBe('Merging JUnit reports');
            expect(mock.logOk[1]).toBe('Merging Coverage reports');
            expect(mock.logOk[2]).toBe('Copying files to working directory ['+opts.defaultOutputDir+']');
            expect(mock.logOk[3]).toBe('Dry-run');
            expect(mock.logOk[4]).toBe('Sonar would have been triggered with the following sonar properties:');
            expect(fsExtra.existsSync(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'TESTS-xunit.xml')).toBeTruthy();
            expect(fsExtra.existsSync(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'coverage_report.lcov')).toBeTruthy();
            expect(fileContentMatches(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'coverage_report.lcov','test/expected/sonar-one-path' + path.sep + 'coverage_report.lcov')).toBeTruthy();
            expect(fileContentMatches(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'TESTS-xunit.xml','test/expected/sonar-one-path' + path.sep + 'TESTS-xunit.xml')).toBeTruthy();
            done();
        });
    });

    it('should merge and update data from two paths', function (done) {
        var opts = DEFAULT_OPTIONS
        opts.defaultOutputDir = '.tmp/sonar-two-paths';
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
                        }
                    ]
                }
            }
        );
        mock.invoke(karmaSonar, function (err) {
            expect(mock.logError.length).toBe(0);
            expect(mock.logOk.length).toBe(5);
            expect(mock.logOk[0]).toBe('Merging JUnit reports');
            expect(mock.logOk[1]).toBe('Merging Coverage reports');
            expect(mock.logOk[2]).toBe('Copying files to working directory ['+opts.defaultOutputDir+ ']');
            expect(mock.logOk[3]).toBe('Dry-run');
            expect(mock.logOk[4]).toBe('Sonar would have been triggered with the following sonar properties:');
            expect(fsExtra.existsSync(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'TESTS-xunit.xml')).toBeTruthy();
            expect(fsExtra.existsSync(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'coverage_report.lcov')).toBeTruthy();
            expect(fileContentMatches(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'coverage_report.lcov','test/expected/sonar-two-paths' + path.sep + 'coverage_report.lcov')).toBeTruthy();
            expect(fileContentMatches(opts.defaultOutputDir + path.sep + 'results' + path.sep + 'TESTS-xunit.xml','test/expected/sonar-two-paths' + path.sep + 'TESTS-xunit.xml')).toBeTruthy();
            done();
        });
    });
});

