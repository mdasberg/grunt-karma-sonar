'use strict';

/* jasmine specs for the first app. */
describe('Project X', function () {
    var app;

    beforeEach(function () {
        app = new App();
    });

    it("should say hello app", function () {
        expect(app.hello()).toBe('hello x app');
    });

    describe('And', function () {
        it("should say goodbye \"x\" app", function () {
            expect(app.goodbye()).toBe('hello x app');
        });
    })
});
