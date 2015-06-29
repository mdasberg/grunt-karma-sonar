'use strict';

(function () {
    var coverage = {},
        glob = require("glob"),
        grunt = require('grunt'),
        path = require('path');

    /**
     * Merge all coverage results.
     * Because the sources will be copied we need to fix the paths for coverage
     *
     * #1 iterate over each location .
     * #2 replace the suffix
     * #3 append the tests to the result.
     * #4 write merged results to file.
     */
    coverage.merge = function (locations, outputFile, type) {
        var CURRENT_PATH = '.',
            resultContent = '';

        // #1 
        locations.forEach(function (l) {
            var cwd = (l.cwd || CURRENT_PATH) + path.sep;

            if (l.reports[type]) {
                glob.sync(l.reports[type], {cwd: cwd, root: '/'}).forEach(function (file) {
                    // #2
                    var content = grunt.file.read(cwd + file).
                        replace(new RegExp('(SF:)(.*' + l.src + ')(.*)', 'g'), '$1.' + path.sep + 'src$3');
                    
                    // #3
                    resultContent = resultContent.concat(content);
                });
            } else {
                grunt.log.warn('No coverage report has been specified');
            }
        });
        // #4
        grunt.file.write(outputFile, resultContent);
    };

    module.exports = coverage;
})();