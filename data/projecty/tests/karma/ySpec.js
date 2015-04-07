'use strict';

/* jasmine specs for the y app. */
describe('Project Y', function () {

    it('should say hello \'y\' app', function () {
        expect(new App().hello()).toBe('hello y app');
    });

    it('should say see you later', function () {
        expect(new App().seeYouLater()).toBe('see you later y app');
    });
});
