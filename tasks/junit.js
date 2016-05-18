/*jshint -W083 */
(function () {
    'use strict';

    var path = require('path'),
        XmlDocument = require('xmldoc').XmlDocument,
        xmlEntities = new (require('html-entities').XmlEntities)();

    module.exports = function (grunt) {
        var PREFIX = '<?xml version="1.0"?><unitTest version="1">',
            SUFFIX = '</unitTest>';

        /**
         * Convert the xunit input file to the junit file.
         *
         * #1 iterate over each test case.
         * #2 add all the testcases to the array.
         * #3 iterate over each file.
         * #4 append the tests to the result.
         * #5 write coverted results to file.
         *
         * @param inputFile The xunit format file.
         * @param outputFile The junit format file.
         */
        function convert(inputFile, outputFile) {
            var resultContent = PREFIX,
                content = new XmlDocument(grunt.file.read(inputFile)),
                testsuites;

            testsuites = content.name === 'testsuite' ? [content] : content.childrenNamed("testsuite");

            var files = [];
            for (var i = 0; i < testsuites.length; i++) {
                // #1
                testsuites[i].eachChild(function (testcase) {
                    if (testcase.name === 'testcase') {
                        var name = xmlEntities.encode(testcase.attr.name),
                            classname = xmlEntities.encode(testcase.attr.classname),
                            dirname = xmlEntities.encode(testcase.attr.dirname),
                            extension = xmlEntities.encode(testcase.attr.extension),
                            duration = (parseFloat(xmlEntities.encode(testcase.attr.time)) * 1000);

                        var match = files.filter(function (file) {
                            return file.name === classname;
                        });

                        var fileMatch;
                        if (match.length === 0) {
                            fileMatch = {
                                path: 'test' + path.sep + dirname + path.sep + classname + extension,
                                testcases: []
                            };
                            files.push(fileMatch);
                        } else {
                            fileMatch = match[0];
                        }

                        var tc = {name: name, duration: duration > 0 ? duration : 0},
                            failure = testcase.childrenNamed('failure'),
                            skipped = testcase.childrenNamed('skipped'),
                            error = testcase.childrenNamed('error');

                        if (failure.length === 1) {
                            tc.failure = failure[0].val;
                        }
                        if (skipped.length === 1) {
                            tc.skipped = skipped[0].val;
                        }
                        if (error.length === 1) {
                            tc.error = error[0].val;
                        }
                        // #2
                        fileMatch.testcases.push(tc);
                    }
                });
            }

            // #3
            files.forEach(function (file) {
                var fileContent = '<file path="' + file.path + '">';
                file.testcases.forEach(function (testcase) {
                    fileContent = fileContent.concat('<testCase name="' + testcase.name + '" duration="' + testcase.duration + '"');
                    if (testcase.failure) {
                        fileContent = fileContent.concat('><failure message="">' + testcase.failure + '</failure></testCase>');
                    } else {
                        fileContent = fileContent.concat('/>');
                    }
                });

                fileContent = fileContent.concat('</file>');
                // #4
                resultContent = resultContent.concat(fileContent);
            });

            // #5
            grunt.file.write(outputFile, resultContent.concat(SUFFIX), {encoding: 'utf8'});
        }

        return {
            convert: convert
        };
    };
})();
