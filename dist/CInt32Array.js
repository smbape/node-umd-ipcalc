// jshint esversion: 6
// jshint node: true

(function(global, factory) {
    if (typeof exports !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        global.CInt32Array = factory();
    }
})(this, function() {
    'use strict';

    class CInt32Array extends Int32Array {
        constructor() {
            switch (arguments.length) {
                case 0:
                    super();
                    break;
                case 1:
                    super(arguments[0]);
                    break;
                case 2:
                    super(arguments[0], arguments[1]);
                    break;
                default:
                    super(arguments[0], arguments[1], arguments[2]);
            }

            // some methods expects Int32Array as the constructor
            // ex: map, slice, splice, forEach
            // this.constructor = Int32Array;
        }
    }

    CInt32Array.create = function() {
        var inst;
        switch (arguments.length) {
            case 0:
                inst = new CInt32Array();
                break;
            case 1:
                inst = new CInt32Array(arguments[0]);
                break;
            case 2:
                inst = new CInt32Array(arguments[0], arguments[1]);
                break;
            default:
                inst = new CInt32Array(arguments[0], arguments[1], arguments[2]);
        }

        return inst;
    };

    module.exports = CInt32Array;

    var hasProp = {}.hasOwnProperty,
        slice = [].slice,
        splice = [].splice,
        map = [].map;

    CInt32Array.prototype.clone = function() {
        return new this.constructor(this);
    };

    CInt32Array.prototype.and = function(int32, copy) {
        var values = this.clone(),
            len1 = values.length,
            len2, len, i;

        if (Number.isInteger(int32)) {
            for (i = 0; i <= len1; i++) {
                values[i] &= int32;
            }
        } else if (int32 instanceof CInt32Array) {
            len2 = int32.length;
            len = len1 < len2 ? len1 : len2;

            for (i = 1; i <= len; i++) {
                values[len1 - i] &= int32[len2 - i];
            }
        }

        if (copy) {
            this.set(values);
            return this;
        }
        return values;
    };

    CInt32Array.prototype.or = function(int32, copy) {
        var values = this.clone(),
            len1 = values.length,
            len2, len, i;

        if (Number.isInteger(int32)) {
            for (i = 0; i <= len1; i++) {
                values[i] |= int32;
            }
        } else if (int32 instanceof CInt32Array) {
            len2 = int32.length;
            len = len1 < len2 ? len1 : len2;

            for (i = 1; i <= len; i++) {
                values[len1 - i] |= int32[len2 - i];
            }

        }

        if (copy) {
            this.set(values);
            return this;
        }
        return values;
    };

    CInt32Array.prototype.xor = function(int32, copy) {
        var values = this.clone(),
            len1 = values.length,
            len2, len, i;

        if (Number.isInteger(int32)) {
            for (i = 0; i <= len1; i++) {
                values[i] ^= int32;
            }
        } else if (int32 instanceof CInt32Array) {
            len2 = int32.length;
            len = len1 < len2 ? len1 : len2;

            for (i = 1; i <= len; i++) {
                values[len1 - i] ^= int32[len2 - i];
            }
        }

        if (copy) {
            this.set(values);
            return this;
        }
        return values;
    };

    CInt32Array.prototype.not = function(copy) {
        var values = this.clone();

        for (var i = 0, len = this.length; i < len; i++) {
            values[i] = ~this[i];
        }

        if (copy) {
            this.set(values);
            return this;
        }

        return values;
    };

    CInt32Array.prototype.rshift = function(nbits, copy) {
        var len = this.length,
            values = new CInt32Array(len),
            last = len - 1,
            start, index, value, i, q;

        values.fill(0);

        if (nbits > 0 && nbits < 32 * len) {
            q = Math.floor(nbits / 32);
            nbits = nbits - q * 32;
            start = last - q;

            index = last;
            for (i = start; i > 0; i--) {
                if (nbits > 0) {
                    if (this[i] === 0 && this[i - 1] === 0) {
                        value = 0;
                    } else {
                        value = this[i] >>> nbits;
                        if (this[i - 1] !== 0) {
                            q = this[i - 1] & (~0 >>> (32 - nbits));
                            value |= (q << (32 - nbits));
                        }
                    }
                } else {
                    value = this[i];
                }
                values[index--] = value;
            }

            values[last - start] = this[0] >>> nbits;

            if (copy) {
                this.set(values);
                return this;
            }
        }

        return values;
    };

    CInt32Array.prototype.lshift = function(nbits, copy) {
        var len = this.length,
            values = new CInt32Array(len),
            last = len - 1,
            start, index, value, i, q;

        values.fill(0);

        if (nbits > 0 && nbits < 32 * len) {
            q = Math.floor(nbits / 32);
            nbits = nbits - q * 32;
            start = q;

            index = 0;
            for (i = start; i < last; i++) {
                if (nbits > 0) {
                    if (this[i] === 0 && this[i + 1] === 0) {
                        value = 0;
                    } else {
                        value = this[i] << nbits;
                        if (this[i + 1] !== 0) {
                            q = this[i + 1] & (~0 << (32 - nbits));
                            value |= (q >>> (32 - nbits));
                        }
                    }
                } else {
                    value = this[i];
                }
                values[index++] = value;
            }
            values[last - start] = this[last] << nbits;

            if (copy) {
                this.set(values);
                return this;
            }
        }

        return values;
    };

    // >, >=, <, <=, ==, +, -
    CInt32Array.prototype.sup = function(int32) {
        // return values;
    };

    CInt32Array.prototype.toString = CInt32Array.prototype.toBase = function(base, digits) {
        // jshint -W018
        if (!(base > 1)) {
            base = 16;
        }

        if (!(digits > 0)) {
            switch (base) {
                case 2:
                    digits = 32;
                    break;
                case 16:
                    digits = 8;
                    break;
            }
        }
        // jshint +W018

        // Int32Aray.prototype.map is not the same as Array.prototype.map
        return map.call(this, function(element) {
            return dec2base(element, base, digits);
        }).join('');
    };

    /**
     * @param  {Integer} dec    decimal to transform
     * @param  {Integer} base   base to use
     * @param  {Integer} digits minimum digits to keep
     * @return {String}         [description]
     */
    function dec2base(dec, base, digits) {
        var res = (dec >>> 0).toString(base).toUpperCase(),
            missing;

        if (digits > res.length) {
            missing = digits - res.length;
            // res = '0'.repeat(missing) + res;
            res = new Array(missing + 1).join('0') + res;
        }
        return res;
    }
    return module.exports;
});