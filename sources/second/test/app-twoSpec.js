'use strict';

/* jasmine specs for the second app. */
describe('Second app', function () {

    it("should return hello second app", function () {
        expect(new App().hello()).toBe('hello second app');
    });
});
