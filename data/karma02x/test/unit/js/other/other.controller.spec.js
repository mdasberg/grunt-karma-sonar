(function () {
    'use strict';

    describe('Controller: other', function () {
        var controller,
            scope,
            service;

        beforeEach(function () {
            module('karma02x');

            inject(function ($rootScope, $controller, other) {
                scope = $rootScope.$new();
                controller = $controller;
                service = {
                    whoIsAwesome: function() {}
                };

                spyOn(service, 'whoIsAwesome').and.callFake(function () {
                    return 'You are if you fix this test';
                });
            });

            controller('OtherController as vm', {
                $scope: scope,
                other: service
            });

            scope.$digest();
        });

        it('should make the model accessible to the view', function () {
            expect(scope.vm.whoIsAwesome).toBe('You are if you fix this test');
        });
    });
})();


