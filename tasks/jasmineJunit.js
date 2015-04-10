'use strict';

/*jshint -W083 */
(function () {
    var jasmineJUnit = {},
        glob = require("glob"),
        grunt = require('grunt'),
        path = require('path'),
        _ = require('lodash'),
        fs = require('fs'),
        XmlDocument = require('xmldoc').XmlDocument,
        xmlEntities = new (require('html-entities').XmlEntities)();

    /**
     * Merge all junit results.
     * Because the karma-junit-reporter does not use the name of the spec file for the classname, the
     * results need to be updated with the correct classname.
     *
     * #1 iterate over each location .
     * #2 iterate over each file and check if there are jasmine tests by checking for it().
     * #3 add all the jasmine tests to the array.
     * #4 replace the classname with the spec filename.
     * #5 append the tests to the result.
     * #6 write merged results to file.
     */
    jasmineJUnit.merge = function (locations, outputFile) {


        var CURRENT_PATH = '.',
            PREFIX = '<?xml version="1.0"?><testsuites>',
            SUFFIX = '</testsuites>',
            JASMINE_TESTCASE_REGEX = /[^\w]it\s?\([\'\"](.*)[\'\"]/g,
            resultContent = PREFIX;

        // #1 
        locations.forEach(function (l) {
            var specs = [],
                cwd = (l.cwd || CURRENT_PATH) + path.sep,
                testDir = cwd + l.test,
                testDirExists = grunt.file.exists(testDir),
                reportFile = cwd + l.reports.unit,
                reportFileExists = grunt.file.exists(reportFile);
            if (l.test && testDirExists) {
                if (l.reports.unit && reportFileExists) {
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
                    var content = new XmlDocument(grunt.file.read(reportFile));
                    var testsuites = content.childrenNamed("testsuite");
                    for (var i = 0; i < testsuites.length; i++) {
                        testsuites[i].eachChild(function (testcase) {
                            if (testcase.name === 'testcase') {
                                var name = xmlEntities.encode(testcase.attr.name);

                                var matchingSpecs = _.pluck(_.filter(specs, function (spec) {
                                    return _.find(spec.tests, function (test) {
                                        return test === name;
                                    });
                                }), 'name');
                                var matchingSpec = matchingSpecs[0];
                                if (matchingSpecs.length > 1) {
                                    var m = _.find(specs, function (spec) {
                                        return spec.name === matchingSpec;
                                    });
                                    m.tests = _.without(m.tests, name);
                                }
                                testcase.attr.name = xmlEntities.encode(name);
                                testcase.attr.classname = matchingSpec;
                            }
                        });
                    }
                    // #5
                    resultContent = resultContent.concat(testsuites);
                } else {
                    if (!reportFileExists) {
                        grunt.log.warn('The specified jUnit report [' + reportFile + '] does not exist');
                    } else {
                        grunt.log.warn('No jUnit report has been specified');
                    }
                }
            }
        });
        // #6
        grunt.file.write(outputFile, resultContent.concat(SUFFIX));
    };

    module.exports = jasmineJUnit;
})();