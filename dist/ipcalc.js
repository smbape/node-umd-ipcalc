(function(global, factory) {
    if (typeof exports !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        global.ipcalc = factory();
    }
})(this, function() {
    /* jshint immed: false */
    'use strict';

    var exports = ipcalc;

    exports.getclass = getclass;
    exports.deaggregate = deaggregate;
    exports.split_network = split_network;
    exports.subnets = subnets;
    exports.Network = Network;
    exports.argton = argton;
    exports.bitcountmaskton = bitcountmaskton;
    exports.ntobitcountmask = ntobitcountmask;
    exports.validate_netmask = validate_netmask;
    exports.ntoa = ntoa;
    exports.round2powerof2 = round2powerof2;
    exports.dec2base = dec2base;
    exports.contains = contains;

    var slice = [].slice,
        netmaskOpt = {
            isNetmask: true
        };

    var NETWORK_TYPES = {
        '10.0.0.0/8': {
            network: argton('10.0.0.0'),
            mask: argton(8, netmaskOpt),
            label: 'Private Internet',
            link: 'http://www.ietf.org/rfc/rfc1918.txt'
        },
        '127.0.0.0/8': {
            network: argton('127.0.0.0'),
            mask: argton(8, netmaskOpt),
            label: 'Loopback',
            link: 'http://www.ietf.org/rfc/rfc1700.txt'
        },
        '169.254.0.0/16': {
            network: argton('169.254.0.0'),
            mask: argton(16, netmaskOpt),
            label: 'APIPA',
            link: 'http://www.ietf.org/rfc/rfc3330.txt'
        },
        '172.16.0.0/12': {
            network: argton('172.16.0.0'),
            mask: argton(12, netmaskOpt),
            label: 'Private Internet',
            link: 'http://www.ietf.org/rfc/rfc1918.txt'
        },
        '192.168.0.0/16': {
            network: argton('192.168.0.0'),
            mask: argton(16, netmaskOpt),
            label: 'Private Internet',
            link: 'http://www.ietf.org/rfc/rfc1918.txt'
        },
        '224.0.0.0/4': {
            network: argton('224.0.0.0'),
            mask: argton(4, netmaskOpt),
            label: 'Multicast',
            link: 'http://www.ietf.org/rfc/rfc3171.txt'
        }
    };

    /**
     * Create a Network from an address and a netmask
     * @param  {Multiple} address an address as dotted decimals, bit-count-mask, or hex
     * @param  {Multiple} mask    a netmask as dotted decimals, bit-count-mask, or hex
     * @return {Network}
     */
    function ipcalc(address, mask, options) {
        var error;
        if ('string' === typeof address && address.indexOf('/') !== -1) {
            address = address.split('/');
            if (address.length !== 2) {
                error = new Error('Invalid network address ' + address.join('/'));
                error.network = address;
                error.code = 'INVALID_NETWORK';
                throw error;
            }

            options = mask;
            mask = address[1];
            address = address[0];
        }
        return new Network(address, mask, mask);
    }

    /**
     * Return network class from an address
     * https://en.wikipedia.org/wiki/Classful_network
     * @param  {Integer} network network address 
     * @return {String}          class letter
     */
    function getclass(address) {
        address = assert_valid_address(address);

        // class is determined by the 4 first bits
        switch (address >>> 28) {
            case 15:
                // 1111
                return 'E';
            case 14:
                // 1110
                return 'D';
            case 13:
            case 12:
                // 1100
                return 'C';
            case 11:
            case 10:
            case 9:
            case 8:
                // 1000
                return 'B';
            default:
                // 0000
                return 'A';
        }
    }

    /**
     * Deaggregate address range
     * @param  {Address} start  first range address
     * @param  {Address} end    last range address
     * @return {Array}          list of subnets
     */
    function deaggregate(start, end) {
        start = assert_valid_address(start);
        end = assert_valid_address(end);
        var base = start,
            subnets = [],
            step;

        while (base <= end) {
            step = 0;
            while ((base | 1 << step) !== base) {
                if ((base | ~0 >>> (31 - step)) > end) {
                    break;
                }
                step++;
            }

            subnets.push(new Network(base, bitcountmaskton(32 - step)));
            base += 1 << step;
        }

        return subnets;
    }

    /**
     * Split into networks of size n1, n2, n3
     * split_network(address, mask1, mask2, n1, n2, n3)
     * @param  {Address} address
     * @param  {Address} mask1
     * @return {Array}            List of subnets
     */
    function split_network(address, mask1, sizes) {
        address = assert_valid_address(address);
        mask1 = assert_valid_address(mask1, {
            isNetmask: true
        });
        sizes = Array.isArray(sizes) ? sizes : slice.call(arguments, 2);

        var network = address & mask1,
            broadcast = network | ~mask1,
            subnets = new Array(sizes.length),
            needed_addresses = 0,
            net = [],
            mask = [],
            i, nr, needed_size, size, len;

        for (i = 0, len = sizes.length; i < len; i++) {
            needed_size = round2powerof2(sizes[i] + 2);

            sizes[i] = [needed_size, i];
            needed_addresses += needed_size;
        }

        sizes.sort(function(a, b) {
            return a[0] > b[0] ? 1 : a[0] < b[0] ? 1 : 0;
        });

        for (i = 0, len = sizes.length; i < len; i++) {
            size = sizes[i][0];
            nr = sizes[i][1];
            net[nr] = network;
            mask[nr] = 32 - Math.ceil(Math.log(size) / Math.log(2));
            network += size;
        }

        for (i = 0, len = sizes.length; i < len; i++) {
            subnets[i] = new Network(net[i], bitcountmaskton(mask[i]));
        }

        var used_mask = 32 - Math.ceil(Math.log(round2powerof2(needed_addresses)) / Math.log(2)),
            bitcountmask1 = ntobitcountmask(mask1);
        if (used_mask < bitcountmask1) {
            var error = new Error("Network " + ntoa(network) + "/" + bitcountmask1 + " is too small for " + needed_addresses + " hosts");
            error.code = 'NETWORK_SMALL';
            error.network = ntoa(network) + "/" + bitcountmask1;
            error.needed = needed_addresses;
            throw error;
        }

        subnets.needed_size = needed_addresses;
        subnets.used = new Network(address, mask1);
        subnets.unused = deaggregate(network, broadcast);

        return subnets;
    }

    /**
     * Split into networks of mask2 subnet
     * @param  {Address} address
     * @param  {Address} mask1
     * @param  {Address} mask2
     * @param {Integer} limit   maximum number of subnets. Default 1000
     * @return {Array}          List of subnets
     */
    function subnets(address, mask1, mask2, limit) {
        address = assert_valid_address(address);
        mask1 = assert_valid_address(mask1, {
            isNetmask: true
        });
        mask2 = assert_valid_address(mask2, {
            isNetmask: true
        });

        var network = address & mask1,
            bitcountmask1 = ntobitcountmask(mask1),
            bitcountmask2 = ntobitcountmask(mask2);

        if (bitcountmask1 > bitcountmask2) {
            var error = new Error("Network " + ntoa(network) + "/" + bitcountmask1 + " is too small to be splitted in /" + bitcountmask2 + " subnets");
            error.code = 'NETWORK_SMALL';
            error.network = ntoa(network) + "/" + bitcountmask1;
            error.mask = bitcountmask2;
            throw error;
        }

        var subnet = 0,
            nhost = 1 << (bitcountmask2 - bitcountmask1),
            subnets = [],
            net, hostn;

        // jshint -W018
        if (!(limit > 0)) {
            limit = 1000;
        }
        // jshint +W018

        if (nhost < limit) {
            limit = nhost;
        }

        for (subnet = 0; subnet < limit; subnet++) {
            net = network | subnet << (32 - bitcountmask2);
            subnets.push(new Network(net, mask2, mask1));
        }

        subnet = nhost;
        hostn = (network | ~mask2) - network - 1;
        if (hostn < 1) {
            hostn = 1;
        }

        subnets.hostn = hostn * subnet;
        return subnets;
    }

    function contains(network, host) {
        host = assert_valid_address(host);
        if ('string' === typeof network) {
            network = network.split('/');
            var address = assert_valid_address(network[0]),
                mask = assert_valid_address(network[1], {
                    isNetmask: true
                });

            return (address & mask) === (host & mask);
        }

        return false;
    }

    /**
     * [Network description]
     * @param {Integer} network network address
     * @param {Integer} mask1   mask address
     * @param {Integer} mask2   mask address
     */
    function Network(address, mask1, mask2) {
        address = assert_valid_address(address);
        mask1 = assert_valid_address(mask1, {
            isNetmask: true
        });

        var broadcast = address | ~mask1,
            network = address & mask1,
            mask = ntobitcountmask(mask1);

        if (address !== network) {
            this.address = address;
        }

        this.network = network;
        this.className = getclass(network);
        this.mask = mask;
        this.wildcard = ~mask;
        this.shortcode = ntoa(this.network) + '/' + this.mask

        if (mask === 31) {
            this.hmin = network;
            this.hmax = broadcast;
            this.hostn = 2;
        } else if (mask === 32) {
            this.hmin = network;
            this.hmax = network;
            this.hostn = 1;
        } else {
            this.broadcast = broadcast;
            this.hmin = network + 1;
            this.hmax = broadcast - 1;
            this.hostn = this.hmax - this.hmin + 1;
        }

        var bait;
        if (mask >= 4) {
            if ((network & NETWORK_TYPES['224.0.0.0/4'].mask) === NETWORK_TYPES['224.0.0.0/4'].network) {
                this.type = NETWORK_TYPES['224.0.0.0/4'];
            } else if (mask >= 8) {
                bait = network & NETWORK_TYPES['10.0.0.0/8'].mask;
                if (bait === NETWORK_TYPES['10.0.0.0/8'].network) {
                    this.type = NETWORK_TYPES['10.0.0.0/8'];
                } else if (bait === NETWORK_TYPES['127.0.0.0/8'].network) {
                    this.type = NETWORK_TYPES['127.0.0.0/8'];
                } else if (mask >= 12 && (network & NETWORK_TYPES['172.16.0.0/12'].mask) === NETWORK_TYPES['172.16.0.0/12'].network) {
                    this.type = NETWORK_TYPES['172.16.0.0/12'];
                } else if (mask >= 16) {
                    bait = network & NETWORK_TYPES['169.254.0.0/16'].mask;
                    if (bait === NETWORK_TYPES['169.254.0.0/16'].network) {
                        this.type = NETWORK_TYPES['169.254.0.0/16'];
                    } else if (bait === NETWORK_TYPES['192.168.0.0/16'].network) {
                        this.type = NETWORK_TYPES['192.168.0.0/16'];
                    }
                }
            }
        }

        // switch (network & NETWORK_TYPES['192.168.0.0/16'].mask)

    }

    Network.prototype.contains = function(address) {
        address = assert_valid_address(address);
        return this.hmin <= address && address <= this.hmax;
    };

    Network.prototype.split = function() {
        return split_network(this.address, this.mask);
    };

    Network.prototype.subnets = function(mask, limit) {
        return subnets(this.address, this.mask, argton(mask), limit);
    };

    Network.prototype.toString = function(shortFormat) {
        if (shortFormat) {
            return this.shortcode;
        }
        var LF = '\n  ',
            PROP_SEP = ',' + LF,
            str = [],
            props = ['address', 'network', 'wildcard', 'broadcast', 'hmin', 'hmax'],
            prop, value, index;
        for (var i = 0, len = props.length; i < len; i++) {
            prop = props[i];
            value = this[prop];
            if (value) {
                if (str.length) {
                    str.push(PROP_SEP);
                }
                str.push(prop);
                str.push(': ');
                str.push(ntoa(value));
            }
        }

        if (this.className) {
            if (str.length) {
                str.push(PROP_SEP);
            }
            str.push('class');
            str.push(': ');
            str.push(this.className);
        }

        if (this.mask) {
            if (this.address) {
                index = 7;
            } else {
                index = 3;
            }
            str.splice(index, 0, PROP_SEP, 'mask: ', ntoa(bitcountmaskton(this.mask)), ' = ', this.mask);
        }

        if (this.hostn) {
            if (str.length) {
                str.push(PROP_SEP);
            }
            str.push('hostn: ');
            str.push(this.hostn);
        }

        if (this.type) {
            if (str.length) {
                str.push(PROP_SEP);
            }
            str.push('type: ');
            str.push(this.type.label);
        }

        return 'Network {' + LF + str.join('') + '\n}';
    };

    /**
     * Parse and address
     * @param  {Address|Integer|String} address [description]
     * @param  {Object} options {isNetmask, isWildcard}
     * @return {Address}
     */
    function argton(address, options) {
        var network = 0,
            decimals, decimal, i;

        if (options === null || typeof options !== 'object') {
            options = {};
        }

        switch (typeof address) {
            /* jshint boss: true */
            case 'string':
                if (options.isNetmask && (decimals = address.match(/^\/?(\d{1,2})$/))) {
                    // bit-count-mask (24 or /24)
                    network = parseInt(decimals[1], 10);
                    if (network === 0) {
                        return network;
                    }
                    return bitcountmaskton(network);
                }

                if (decimals = address.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)) {
                    // dotted decimals
                    for (i = 1; i < 5; i++) {
                        decimal = parseInt(decimals[i], 10);
                        if (decimal > 255) {
                            // invalid address
                            return false;
                        }

                        network <<= 8;
                        network += decimal;
                    }
                } else {
                    return false;
                }

                if (options.isNetmask) {
                    return validate_netmask(network, options.isWildcard);
                }

                return network;
            case 'number':
                if (options.isNetmask) {
                    if (address >= 0 && address <= 32) {
                        return bitcountmaskton(address);
                    }
                    return validate_netmask(address, options.isWildcard);
                }
                return address;
            default:
                // invalid address
                return false;
        }
    }

    /**
     * Bit count mask to address
     * @param  {Integer} mask bit count mask
     * @return {Address}
     */
    function bitcountmaskton(mask) {
        if (mask < 0 || mask > 32) {
            // invalid address
            return false;
        }

        return mask === 0 ? 0 : ~0 << (32 - mask);
    }

    var MASKS = (function(bitcountmaskton) {
        var dict = {};
        for (var i = 0; i <= 32; i++) {
            dict[bitcountmaskton(i)] = i;
        }
        return dict;
    }(bitcountmaskton));

    /**
     * Address to bit count mask
     * @param  {Address} mask
     * @return {Integer}
     */
    function ntobitcountmask(mask) {
        return MASKS[mask];
    }

    /**
     * Return the mask if it is valid, otherwise return false
     * @param  {Address} mask       ipv4 mask
     * @param  {Boolean} isWildcard negate wildcard
     * @return {Address}            valid netmask or false
     */
    function validate_netmask(mask, isWildcard) {
        var saw_zero = false;

        // negate wildcard
        if (isWildcard) {
            mask = ~mask;
        }

        // find ones following zeros
        for (var i = 0; i < 32; i++) {
            if ((mask & 1 << (31 - i)) === 0) {
                saw_zero = true;
            } else {
                if (saw_zero) {
                    return false;
                }
            }
        }

        return mask;
    }

    /**
     * interger address to dotted decimals
     * @param  {Address} address ipv4 address integer
     * @return {String}
     */
    function ntoa(address) {
        return [
            (address >>> 24) & 0xFF,
            (address >>> 16) & 0xFF,
            (address >>> 8) & 0xFF,
            address & 0xFF,
        ].join('.');
    }

    function round2powerof2(number) {
        var i = 0;
        while (number > 1 << i) {
            i++;
        }
        return 1 << i;
    }

    function assert_valid_address(arg, options) {
        var address = argton(arg, options),
            error;
        if (address === false) {
            if (options && options.isNetmask) {
                error = new Error('Invalid netmask address ' + arg);
                error.address = arg;
                error.code = 'INVALID_NETMASK';
            } else {
                error = new Error('Invalid address ' + arg);
                error.address = arg;
                error.code = 'INVALID_IPV4';
            }

            throw error;
        }

        return address;
    }

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

    return exports;
});