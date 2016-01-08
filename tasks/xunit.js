/*jshint -W083 */
(function () {
    'use strict';

    var glob = require("glob"),
        path = require('path');

    module.exports = function (grunt) {
        var PREFIX = '<?xml version="1.0"?><testsuites>',
            SUFFIX = '</testsuites>',
            jasmineJunit = require(__dirname + '/jasmineJunit')(grunt),
            cucumberJunit = require(__dirname + '/cucumberJunit')(grunt);

        /**
         * Merge all junit results.
         *
         * #1 iterate over each location.
         * #2 check what framework is used (defaults to jasmine)
         * #3 merge the files
         * #4 write merged results to file.
         */
        function merge(locations, outputFile, type) {
            var testType = (type === 'itUnit' ? ' integration' : ''),
                resultContent = PREFIX;

            // #1
            locations.forEach(function (l) {
                var report = l.reports[type],
                    framework = ((report !== undefined && typeof report === 'object') && report.framework ? report.framework : 'jasmine'),
                    source = ((report !== undefined && typeof report === 'object') ? report.src : report),
                    cwd = (l.cwd || '.') + path.sep,
                    testDir = cwd + l.test,
                    testDirExists = grunt.file.exists(testDir);

                if (source) {
                    if (l.test && testDirExists) {
                        // #2
                        if(framework === 'jasmine' || framework === 'jasmine2') {
                            // #3
                            resultContent = resultContent.concat(jasmineJunit.mergeLocation(source, cwd, testDir, type));
                        } else if(framework === 'cucumber') {
                            // #3
                            resultContent = resultContent.concat(cucumberJunit.mergeLocation(source, cwd, testDir, type));
                        }
                    }
                } else {
                    grunt.log.warn('No' + testType + ' jUnit report has been specified');
                }
            });
            // #4
            grunt.file.write(outputFile, resultContent.concat(SUFFIX), {encoding: 'utf8'});
        }

        return {
            merge: merge
        };
    };
})();
