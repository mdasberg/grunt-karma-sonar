'use strict';

/* jasmine specs for the first app. */
describe('First app', function () {

    it("should return hello first app", function () {
        expect(new App().hello()).toBe('hello first app');
    });
});
