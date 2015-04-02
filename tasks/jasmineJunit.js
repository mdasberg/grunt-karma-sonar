'use strict';

(function () {
    var jasmineJUnit = {},
        glob = require("glob"),
        grunt = require('grunt'),
        path = require('path'),
        _ = require('lodash');

    /**
     * Merge all junit results.
     * Because the karma-junit-reporter does not use the name of the spec file for the classname, the
     * results need to be updated with the correct classname.
     *
     * #1 iterate over each location .
     * #2 iterate over each file and check if there are jasmine tests by checking for it().
     * #3 add all the jasmine tests to the array.
     * #4 remove wrapper markup.
     * #5 replace the classname with the spec filename.
     * #6 append the tests to the result.
     * #7 write merged results to file.
     */
    jasmineJUnit.merge = function (locations, outputFile) {
        
        var specs = [],
            CURRENT_PATH = '.',
            PREFIX = '<?xml version="1.0"?><testsuites>',
            SUFFIX = '</testsuites>',
            JASMINE_TESTCASE_REGEX = /it\s?\(\"([^\"]*)\"/g,
            SUREFIRE_TESTCASE_REGEX = /(\<testcase.*)(\bname=\")([^\"]*)(.*)(\bclassname=\")([^\"]*)(.*\">)/g,
            SUREFIRE_TESTCASE_NAME_REGEX = /\bname=\"([^\"]*)/,
            resultContent = PREFIX;

        // #1 
        locations.forEach(function (l) {

            var cwd = (l.cwd || CURRENT_PATH) + path.sep,
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

                        // #3
                        for (var i = 0, len = matches.length; i < len; i++) {
                            tests.push(matches[i].replace(JASMINE_TESTCASE_REGEX, '$1'));
                        }
                        specs.push({
                            'name': path.basename(file, path.extname(file)),
                            'tests': tests
                        });
                    });

                    // #4
                    var content = grunt.file.read(reportFile).
                        replace(/\<\?xml.+\?\>/g, '').
                        replace(/\<testsuites>/g, '').
                        replace(/\<\/testsuites>/g, '');

                    // #5
                    var matches = content.match(SUREFIRE_TESTCASE_REGEX);
                    for (var i = 0, len = matches.length; i < len; i++) {
                        var name = SUREFIRE_TESTCASE_NAME_REGEX.exec(matches[i])[1];
                        var spec = _.pluck(_.filter(specs, function (spec) {
                            return _.find(spec.tests, function (test) {
                                return test === name;
                            })
                        }), 'name');
                        content = content.replace(
                            matches[i],
                            matches[i].replace(SUREFIRE_TESTCASE_REGEX, '$1$2$3$4$5' + spec + '$7')
                        );
                    }
                    // #6
                    resultContent = resultContent.concat(content);
                } else {
                    if (!reportFileExists) {
                        grunt.log.warn('The specified jUnit report [' + reportFile + '] does not exist');
                    } else {
                        grunt.log.warn('No jUnit report has been specified');
                    }
                }
            }
            
        });
        // #7
        grunt.file.write(outputFile, resultContent.concat(SUFFIX));
    }

    module.exports = jasmineJUnit;
})();