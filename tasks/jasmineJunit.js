/*jshint -W083 */
(function () {
    'use strict';

    module.exports = function (grunt) {
        var glob = require("glob"),
            path = require('path'),
            _ = require('lodash'),
            fs = require('fs'),
            JASMINE_TESTCASE_REGEX = /[^\w]x?it\s?\([\'\"](.*)[\'\"]/g,
            XmlDocument = require('xmldoc').XmlDocument,
            xmlEntities = new (require('html-entities').XmlEntities)();

        /**
         * Merge all junit results.
         * Because the junit-reporter does not use the name of the spec file for the classname, the
         * results need to be updated with the correct classname.
         *
         * #1 iterate over each file and check if there are jasmine tests by checking for it().
         * #2 add all the jasmine tests to the array.
         * #3 replace the classname with the spec filename.
         * #4 append the tests to the result.
         */
        function mergeLocation(source, cwd, testDir, testType) {
            var resultContent = '',
                specs = [];

            // #1
            glob.sync('**/*.js', {cwd: testDir, root: '/'}).forEach(function (file) {
                var tests = [],
                    content = grunt.file.read(testDir + path.sep + file),
                    matches = content.match(JASMINE_TESTCASE_REGEX);

                if (matches !== null) {
                    // #2
                    for (var i = 0, len = matches.length; i < len; i++) {
                        tests.push(xmlEntities.encode(matches[i].replace(JASMINE_TESTCASE_REGEX, '$1')).replace(/\\/g, '')); // remove escaped characters
                    }
                    specs.push({
                        'name': path.basename(file, path.extname(file)),
                        'tests': tests
                    });
                }
            });

            glob.sync(source, {cwd: cwd, root: '/'}).forEach(function (file) {
                var reportFile = cwd + file,
                    reportFileExists = grunt.file.exists(reportFile);

                if (reportFileExists) {
                    // #3
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
                    // #4
                    resultContent = resultContent.concat(testsuites);
                } else {
                    if (!reportFileExists) {
                        grunt.log.warn('The specified' + testType + ' jUnit report [' + reportFile + '] does not exist');
                    }
                }
            });
            return resultContent;
        }

        return {
            mergeLocation: mergeLocation
        };
    };
})();
