(function () {
    'use strict';

    /**
     * @ngdoc service
     * @name karma02x.other
     * @description
     * # other
     * Factory in the karma02x.
     */
    angular.module('karma02x')
        .factory('other', function () {
            var awesome = 'You are :)';
            
            return {
                whoIsAwesome: function () {
                    return awesome;
                }
            }
        });

})();

