(function () {
    'use strict';

    describe('Some app', function () {

        beforeEach(function () {
            browser.get('/some/some.html');
        });

        it('should show who is awesome', function () {
            expect(element(by.binding('ctrl.whoIsAwesome')).getText()).toEqual('You are :)');
        });

    });
})();