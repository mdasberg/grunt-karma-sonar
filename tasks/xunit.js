/*jshint -W083 */
(function () {
    'use strict';

    var glob = require("glob"),
        path = require('path'),
        _ = require('lodash'),
        fs = require('fs'),
        XmlDocument = require('xmldoc').XmlDocument,
        xmlEntities = new (require('html-entities').XmlEntities)();

    module.exports = function (grunt) {
        var PREFIX = '<?xml version="1.0"?><testsuites>',
            SUFFIX = '</testsuites>',
            JASMINE_TESTCASE_REGEX = /[^\w]x?it\s?\([\'\"](.*)[\'\"]/g,
            resultContent = PREFIX;

        ///**
        // * Merge all the junit xml results.
        // */
        function merge(locations, outputFile, type) {
            var testType = (type === 'itUnit' ? ' integration' : '');

            // #1
            locations.forEach(function (l) {

                var specs = [],
                    cwd = (l.cwd || '.') + path.sep,
                    testDir = cwd + l.test,
                    testDirExists = grunt.file.exists(testDir);

                var report = l.reports[type];
                if (report) {
                    var src = (typeof report === "object") ? report.src : report;
                    glob.sync(src, {cwd: cwd, root: '/'}).forEach(function (file) {
                        grunt.log.ok(file);
                        var reportFile = cwd + file,
                            reportFileExists = grunt.file.exists(reportFile);

                        if (l.test && testDirExists) {
                            if (l.reports[type] && reportFileExists) {

                                // #2
                                glob.sync('**/*.js', {cwd: testDir, root: '/'}).forEach(function (file) {
                                    var tests = [],
                                        content = grunt.file.read(testDir + path.sep + file),
                                        matches = content.match(JASMINE_TESTCASE_REGEX);

                                    if (matches !== null) {
                                        // #3
                                        for (var i = 0, len = matches.length; i < len; i++) {
                                            tests.push(xmlEntities.encode(matches[i].replace(JASMINE_TESTCASE_REGEX, '$1')).replace(/\\/g, '')); // remove escaped characters
                                        }
                                        specs.push({
                                            'name': path.basename(file, path.extname(file)),
                                            'tests': tests
                                        });
                                    }
                                });


                                // #4
                                var content = new XmlDocument(grunt.file.read(reportFile)),
                                    testsuites;
                                if (content.name === 'testsuite') {
                                    testsuites = [content];
                                } else {
                                    testsuites = content.childrenNamed("testsuite");
                                }
                                for (var i = 0; i < testsuites.length; i++) {
                                    testsuites[i].eachChild(function (testcase) {
                                        if (testcase.name === 'testcase') {
                                            var name = xmlEntities.encode(testcase.attr.name);

                                            var matchingSpecs = _.pluck(_.filter(specs, function (spec) {
                                                return _.find(spec.tests, function (test) {
                                                    return test === name || xmlEntities.encode(test) === name;
                                                });
                                            }), 'name');
                                            if (matchingSpecs.length === 0) {
                                                grunt.log.warn('No spec filename found for test [' + name + ']');
                                            } else {
                                                var matchingSpec = matchingSpecs[0];
                                                if (matchingSpecs.length > 1) {
                                                    var m = _.find(specs, function (spec) {
                                                        return spec.name === matchingSpec;
                                                    });
                                                    m.tests = _.without(m.tests, name);
                                                }
                                                testcase.attr.name = name;
                                                testcase.attr.classname = matchingSpec.replace(/\./g, '_');
                                            }
                                        }
                                    });
                                }
                                // #5
                                resultContent = resultContent.concat(testsuites);
                            } else {
                                if (!reportFileExists) {
                                    grunt.log.warn('The specified' + TYPE + ' jUnit report [' + reportFile + '] does not exist');
                                }
                            }
                        }
                    });
                } else {
                    grunt.log.warn('No' + testType + ' jUnit report has been specified');
                }
            });
            // #6
            grunt.log.ok(outputFile); 
            grunt.file.write(outputFile, resultContent.concat(SUFFIX), {encoding: 'utf8'});
            //require(__dirname + '/jasmineJunit')(grunt).merge(locations, outputFile, type)
        }

        return {
            merge: merge
        };
    };
})();
