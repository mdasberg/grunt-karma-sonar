(function () {
    /*
     * grunt-karma-sonar
     * https://github.com/mdasberg/grunt-karma-sonar
     *
     * Copyright (c) 2015 Mischa Dasberg and contributors
     * Licensed under the MIT license.
     */

    'use strict';
    module.exports = function (grunt) {
        /** Sonar karma results. */
        grunt.registerMultiTask('karmaSonar', 'Grunt plugin for integrating karma reports with sonar', function () {
            //grunt.log.warn('log.warn');
            require('./sonar')(grunt).run(this);
        });
    };
})();