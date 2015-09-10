(function () {
    'use strict';

    describe('Controller: some', function () {
        var controller,
            scope,
            service;

        beforeEach(function () {
            module('project-z');

            inject(function ($rootScope, $controller, some) {
                scope = $rootScope.$new();
                controller = $controller;
                service = {
                    whoIsAwesome: function() {}
                };

                spyOn(service, 'whoIsAwesome').and.callFake(function () {
                    return 'You are if you fix this test';
                });
            });

            controller('SomeController as vm', {
                $scope: scope,
                some: service
            });

            scope.$digest();
        });

        it('should make the model accessible to the view', function () {
            expect(scope.vm.whoIsAwesome).toBe('You are if you fix this test');
        });
    });
})();


