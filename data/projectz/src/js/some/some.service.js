(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name project-z.some
     * @description
     * # some
     * Factory in the project-z.
     */
    angular.module('project-z')
        .factory('some', function () {
            var awesome = 'You are :)';
            
            return {
                whoIsAwesome: function () {
                    return awesome;
                }
            }
        });

})();

