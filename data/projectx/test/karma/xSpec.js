'use strict';

/* jasmine specs for the first app. */
describe('Project X', function () {

    it("should say hello x app", function () {
        expect(new App().hello()).toBe('hello x app');
    });

    describe('And', function() {
        it("should say goodbye x app", function () {
            expect(new App().goodbye()).toBe('hello x app');
        });
    })
});
