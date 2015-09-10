(function () {
    'use strict';

    describe('Factory: other', function () {
        var service;
        
        beforeEach(function() {
            module('karma02x');
            inject(function(other) {
               service = other;
            });    
        });

        it('should tell who is awesome', function () {
            expect(service.whoIsAwesome()).toBe('You are :)');
        });
    });
})();
