(function () {
    'use strict';

    describe('Factory: some', function () {
        var service;
        
        beforeEach(function() {
            module('project-z');
            inject(function(some) {
               service = some;
            });    
        });

        it('should tell who is awesome', function () {
            expect(service.whoIsAwesome()).toBe('You are :)');
        });
    });
})();
