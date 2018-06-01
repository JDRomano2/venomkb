var assert = require('assert');
var expect = require('expect');
var enzyme = require('enzyme');

// Making sure the test library works
describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal([1,2,3].indexOf(4), -1);
        });
    });
});

