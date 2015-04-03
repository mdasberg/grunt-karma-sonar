'use strict';

/* jasmine specs for the y app. */
describe('Project Y', function () {

    it("should return hello y app", function () {
        expect(new App().hello()).toBe('hello y app');
    });
});
