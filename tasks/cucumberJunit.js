/*jshint -W083 */
(function () {
    'use strict';

    module.exports = function (grunt) {
        var glob = require("glob"),
            path = require('path'),
            _ = require('lodash'),
            fs = require('fs'),
            CUCUMBER_FEATURE_REGEX = /.*Feature:\s*?(.*)/g,
            CUCUMBER_SCENARIO_REGEX = /.*Scenario:\s*?(.*)/g,
            CUCUMBER_SCENARIO_OUTLINE_REGEX = /.*Scenario Outline:\s*?(.*)/g,
            XmlDocument = require('xmldoc').XmlDocument,
            xmlEntities = new (require('html-entities').XmlEntities)();

        /**
         * Gets the scenario's tests.
         * @param feature The feature.
         * @param match The match.
         * @param regex The regex.
         * @param tests The tests.
         */
        function addTests(feature, match, regex, tests) {
            for (var i = 0, len = match.length; i < len; i++) {
                var scenario = match[i].replace(regex, '$1').trim().replace(/\s/g, '-');
                tests.push(xmlEntities.encode(feature + ';' + scenario).replace(/\\/g, ''));
            }
        }

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
            glob.sync('**/*.feature', {cwd: testDir, root: '/'}).forEach(function (file) {
                var tests = [],
                    content = grunt.file.read(testDir + path.sep + file),
                    featureMatch = CUCUMBER_FEATURE_REGEX.exec(content);

                if (featureMatch !== null) {
                    var feature = featureMatch[1].trim().replace(/\s/g, '-'),
                        scenarioMatch = content.match(CUCUMBER_SCENARIO_REGEX),
                        scenarioOutlineMatch = content.match(CUCUMBER_SCENARIO_OUTLINE_REGEX);

                    if(scenarioMatch !== null) {
                        addTests(feature, scenarioMatch, CUCUMBER_SCENARIO_REGEX, tests);
                    }
                    if(scenarioOutlineMatch !== null) {
                        addTests(feature, scenarioOutlineMatch, CUCUMBER_SCENARIO_OUTLINE_REGEX, tests);
                    }

                    specs.push({
                        'name': path.basename(file, path.extname(file)) + '.feature',
                        'tests': tests
                    });
                }
                CUCUMBER_FEATURE_REGEX.lastIndex=0; // reset lastIndex so we can reuse.
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
                                var classname = xmlEntities.encode(testcase.attr.classname);

                                var matchingSpecs = _.map(_.filter(specs, function (spec) {
                                    return _.find(spec.tests, function (test) {
                                        return test === classname || xmlEntities.encode(test) === classname;
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
