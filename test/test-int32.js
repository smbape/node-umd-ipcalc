// jshint node: true
// jshint mocha: true

var assert = require('assert');
var CInt32Array = require('../dist/CInt32Array');

describe('CInt32Array', function() {
    it('should toString', function() {
        assert.strictEqual(CInt32Array.create([0, 0, 0, 4]) instanceof Int32Array, true);
        assert.strictEqual(CInt32Array.create([0, 0, 0, 4]).length, 4);
        assert.strictEqual(CInt32Array.create([0, 0, 0, 4]).toString(), '00000000000000000000000000000004');
        assert.strictEqual(CInt32Array.create([0, 0, 0, 0xFFFF]).toString(), '0000000000000000000000000000FFFF');
        assert.strictEqual(CInt32Array.create([0x12DE]).toString(), '000012DE');
        assert.strictEqual(CInt32Array.create([0x12DE, 0xE274A714]).toString(), '000012DEE274A714');
        assert.strictEqual(CInt32Array.create([0x12DE, 0xE274A714, 0]).toString(), '000012DEE274A71400000000');
        assert.strictEqual(CInt32Array.create([0x12DE, 0xE274A714, 0, 0xFFFF]).toString(), '000012DEE274A714000000000000FFFF');
    });

    it('should rshift', function() {
        var int32 = new CInt32Array([0x42C80000, 0, 0, 0]),
            mem, i;

        assert.strictEqual(int32.rshift(08).toString(), '0042C800000000000000000000000000');
        assert.strictEqual(int32.rshift(12).toString(), '00042C80000000000000000000000000');
        assert.strictEqual(int32.rshift(16).toString(), '000042C8000000000000000000000000');
        assert.strictEqual(int32.rshift(32).toString(), '0000000042C800000000000000000000');
        assert.strictEqual(int32.rshift(48).toString(), '00000000000042C80000000000000000');
        assert.strictEqual(int32.rshift(60).toString(), '00000000000000042C80000000000000');
        for (i = 1; i <= 28; i++) {
            mem = (new Array(i + 1).join('0')) + '42C8' + (new Array((28 - i) + 1).join('0'));
            assert.strictEqual(int32.rshift(i * 4).toString(), mem);
        };

        assert.strictEqual(int32.rshift(16, true).toString(), '000042C8000000000000000000000000');
        assert.strictEqual(int32.rshift(8, true).toString(), '00000042C80000000000000000000000');
        assert.strictEqual(int32.rshift(8, true).toString(), '0000000042C800000000000000000000');
        assert.strictEqual(int32.rshift(32, true).toString(), '000000000000000042C8000000000000');
        assert.strictEqual(int32.rshift(48, true).toString(), '000000000000000000000000000042C8');

        int32 = new CInt32Array([0x42C80000, 0, 0, 0]);
        assert.strictEqual(int32.rshift(112, true).toString(), '000000000000000000000000000042C8');

        int32 = new CInt32Array([0x42C80000, 0, 0, 0]);
        for (i = 0; i < 28; i++) {
            mem = (new Array(i + 2).join('0')) + '42C8' + (new Array((27 - i) + 1).join('0'));
            assert.strictEqual(int32.rshift(4, true).toString(), mem);
        };
    });

    it('should lshift', function() {
        var int32 = new CInt32Array([0, 0, 0, 0x42C8]),
            mem, i;

        assert.strictEqual(int32.lshift(08).toString(), '0000000000000000000000000042C800');
        assert.strictEqual(int32.lshift(12).toString(), '000000000000000000000000042C8000');
        assert.strictEqual(int32.lshift(16).toString(), '00000000000000000000000042C80000');
        assert.strictEqual(int32.lshift(32).toString(), '0000000000000000000042C800000000');
        assert.strictEqual(int32.lshift(48).toString(), '000000000000000042C8000000000000');
        assert.strictEqual(int32.lshift(60).toString(), '000000000000042C8000000000000000');
        for (i = 1; i <= 28; i++) {
            mem = (new Array((28 - i) + 1).join('0')) + '42C8' + (new Array(i + 1).join('0'));
            assert.strictEqual(int32.lshift(i * 4).toString(), mem);
        };

        assert.strictEqual(int32.lshift(16, true).toString(), '00000000000000000000000042C80000');
        assert.strictEqual(int32.lshift(8, true).toString(), '000000000000000000000042C8000000');
        assert.strictEqual(int32.lshift(8, true).toString(), '0000000000000000000042C800000000');
        assert.strictEqual(int32.lshift(32, true).toString(), '00000000000042C80000000000000000');
        assert.strictEqual(int32.lshift(48, true).toString(), '42C80000000000000000000000000000');

        int32 = new CInt32Array([0, 0, 0, 0x42C8]);
        assert.strictEqual(int32.lshift(112, true).toString(), '42C80000000000000000000000000000');

        int32 = new CInt32Array([0, 0, 0, 0x42C8]);
        for (i = 0; i < 28; i++) {
            mem = (new Array((27 - i) + 1).join('0')) + '42C8' + (new Array(i + 2).join('0'));
            assert.strictEqual(int32.lshift(4, true).toString(), mem);
        };
    });
});

/**
 * @param  {Integer} dec    [description]
 * @param  {Integer} base   [description]
 * @param  {Integer} digits [description]
 * @return {String}         [description]
 */
function dec2base(dec, base, digits) {
    var res = (dec >>> 0).toString(base),
        missing;
    if (digits) {
        missing = digits - res.length;
        if (missing > 0) {
            // res = '0'.repeat(missing) + res;
            res = new Array(missing + 1).join('0') + res;
        }
    }
    return res;
}

function createArray(arr) {
    return new CInt32Array(arr);
}
