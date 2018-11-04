// jshint node: true
// jshint mocha: true

var {assert} = require('chai');
var ipcalc = require('../');

describe('argton', function() {
    var netmaskOpts = {
        isNetmask: true
    };

    it('should argton and ntoa', function() {
        var ipstr = '192.168.2.1',
            ipdec = (192 << 24) + (168 << 16) + (2 << 8) + 1,
            i, j;

        assert.strictEqual(ipcalc.argton(ipstr), ipdec);

        for (i = 0; i < 10; i++) {
            ipstr = [];
            ipdec = 0;
            for (j = 0; j < 4; j++) {
                ipstr[j] = 255 * Math.floor(Math.random());
                ipdec += ipstr[j] << (3 - j) * 8;
            }
            ipstr = ipstr.join('.');

            // it should convert string to integer
            assert.strictEqual(ipcalc.argton(ipstr), ipdec);

            // it should convert integer to string
            assert.strictEqual(ipcalc.ntoa(ipdec), ipstr);

            // it should not convert integer
            assert.strictEqual(ipcalc.argton(ipdec), ipdec);
        }
    });

    it('should not convert invalid address', function() {
        var ipstr, i, j;
        assert.strictEqual(ipcalc.argton('192.168.2.'), false);
        assert.strictEqual(ipcalc.argton('192'), false);

        for (i = 0; i < 10; i++) {
            ipstr = [
                Math.round(256 + 255 * Math.random()),
                Math.round(256 + 255 * Math.random()),
                Math.round(256 + 255 * Math.random()),
                Math.round(256 + 255 * Math.random())
            ].join('.');
            assert.strictEqual(ipcalc.argton(ipstr), false);
        }
    });

    it('should argton mask, ntobitcountmask, bitcountmaskton, validate_netmask', function() {
        var mask = (255 << 24) + (255 << 16) + (255 << 8);
        assert.strictEqual(ipcalc.argton('255.255.255.0'), mask);
        assert.strictEqual(ipcalc.argton('255.255.255.0', netmaskOpts), mask);

        for (var i = 0; i <= 32; i++) {
            mask = ipcalc.argton(i, netmaskOpts);

            assert.strictEqual(ipcalc.argton('/' + i, netmaskOpts), mask);
            assert.strictEqual(ipcalc.argton('' + i, netmaskOpts), mask);
            assert.strictEqual(ipcalc.argton(ipcalc.ntoa(mask), netmaskOpts), mask);

            assert.strictEqual(ipcalc.ntobitcountmask(mask), i);
            assert.strictEqual(ipcalc.bitcountmaskton(i), mask);
            assert.strictEqual(ipcalc.validate_netmask(mask), mask);

            // it should not convert integer mask
            assert.strictEqual(ipcalc.argton(mask), mask);
            assert.strictEqual(ipcalc.argton(mask, netmaskOpts), mask);
        }
    });

    it('should getclass', function() {
        var classes = [
                [0, 127, 'A'],
                [128, 191, 'B'],
                [192, 223, 'C'],
                [224, 239, 'D'],
                [240, 255, 'E']
            ],
            args, start, end, letter, address, len, i, j;

        for (i = 0, len = classes.length; i < len; i++) {
            args = classes[i];
            start = args[0];
            end = args[1];
            letter = args[2];

            for (j = 0; j < 10; j++) {
                address = [
                    Math.round(start + (end - start) * Math.random()),
                    Math.round(255 * Math.random()),
                    Math.round(255 * Math.random()),
                    Math.round(255 * Math.random())
                ].join('.');
                assert.strictEqual(ipcalc.getclass(ipcalc.argton(address)), letter);
            }
        }
    });

    it('should convert integer border cases', function() {
        assert.strictEqual(ipcalc.argton(0), 0);
        assert.strictEqual(ipcalc.argton(0, netmaskOpts), 0);
        assert.strictEqual(ipcalc.argton('0.0.0.0'), 0);
        assert.strictEqual(ipcalc.argton('0', netmaskOpts), 0);
    });

    it('should invalidate mask', function() {
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.253')), false);
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.230')), false);
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.225.0')), false);
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.252.190.0')), false);
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.0.255.255')), false);
    });

    it('should deaggregate', function() {
        assertDeaggreate('192.168.2.0', '192.168.2.255', [
            '192.168.2.0/24'
        ]);

        assertDeaggreate('192.168.0.0', '192.168.2.255', [
            '192.168.0.0/23',
            '192.168.2.0/24'
        ]);

        assertDeaggreate('192.168.0.0', '192.168.3.255', [
            '192.168.0.0/22'
        ]);

        assertDeaggreate('192.168.2.1', '192.168.2.255', [
            '192.168.2.1/32',
            '192.168.2.2/31',
            '192.168.2.4/30',
            '192.168.2.8/29',
            '192.168.2.16/28',
            '192.168.2.32/27',
            '192.168.2.64/26',
            '192.168.2.128/25'
        ]);

        assertDeaggreate('10.200.0.0', '10.255.255.255', [
            '10.200.0.0/13',
            '10.208.0.0/12',
            '10.224.0.0/11'
        ]);
    });

    it('should split network', function() {
        assertSplitNetwork('192.168.0.1', 17, [1024, 1024], '192.168.0.0', [
            '192.168.0.0/21',
            '192.168.8.0/21'
        ], [
            '192.168.16.0/20',
            '192.168.32.0/19',
            '192.168.64.0/18'
        ]);

        assertSplitNetwork('192.168.0.1', 17, [2046, 1024], '192.168.0.0', [
            '192.168.0.0/21',
            '192.168.8.0/21'
        ], [
            '192.168.16.0/20',
            '192.168.32.0/19',
            '192.168.64.0/18'
        ]);

        assertSplitNetwork('192.168.0.1', 17, [2046, 1024, 4096], '192.168.0.0', [
            '192.168.32.0/21',
            '192.168.40.0/21',
            '192.168.0.0/19'
        ], [
            '192.168.48.0/20',
            '192.168.64.0/18'
        ]);

        assertSplitNetwork('192.168.0.1', 17, [4094, 8190, 4094, 16382], '192.168.0.0', [
            '192.168.96.0/20',
            '192.168.64.0/19',
            '192.168.112.0/20',
            '192.168.0.0/18'
        ], []);
    });

    it('should give subnets', function() {
        assertGetSubnets('192.168.0.1', 17, 18, 32764, [
            '192.168.0.0/18',
            '192.168.64.0/18'
        ]);

        assertGetSubnets('192.168.0.1', 17, 19, 32760, [
            '192.168.0.0/19',
            '192.168.32.0/19',
            '192.168.64.0/19',
            '192.168.96.0/19'
        ]);

        assertGetSubnets('192.168.0.1', 17, 20, 32752, [
            '192.168.0.0/20',
            '192.168.16.0/20',
            '192.168.32.0/20',
            '192.168.48.0/20',
            '192.168.64.0/20',
            '192.168.80.0/20',
            '192.168.96.0/20',
            '192.168.112.0/20'
        ]);
    });

    it('should contains', function() {
        assert.strictEqual(ipcalc.contains('192.168.0.1/24', '192.168.0.1'), true);
        assert.strictEqual(ipcalc.contains('192.168.0.1/24', '192.168.0.124'), true);
        assert.strictEqual(ipcalc.contains('192.168.0.1/24', '192.168.0.254'), true);
        assert.strictEqual(ipcalc.contains('192.168.0.1/24', '192.168.1.1'), false);
        assert.strictEqual(ipcalc.contains('192.168.0.1/16', '192.168.1.1'), true);
        assert.strictEqual(ipcalc.contains('10.0.0.0/8', '192.168.1.1'), false);
        assert.strictEqual(ipcalc.contains('10.0.0.0/8', '10.220.220.125'), true);
    });
});

function assertDeaggreate(start, end, expected) {
    assertSubnets(ipcalc.deaggregate(start, end), expected);
}

function assertSplitNetwork(address, mask, sizes, network, expected, unused) {
    var args = [address, mask].concat(sizes),
        subnets = ipcalc.split_network.apply(ipcalc, args),
        subnet = subnets.used,
        needed_size = 0;

    for (var i = 0, len = sizes.length; i < len; i++) {
        needed_size += ipcalc.round2powerof2(sizes[i] + 2);
    }

    assert.strictEqual(ipcalc.ntoa(subnet.address), address);
    assert.strictEqual(ipcalc.ntoa(subnet.network), network);
    assert.strictEqual(subnet.mask, mask);
    assert.strictEqual(subnets.needed_size, needed_size);
    assertSubnets(subnets, expected);
    assertSubnets(subnets.unused, unused);
}

function assertGetSubnets(address, mask1, mask2, hostn, expected) {
    var subnets = ipcalc.subnets(address, mask1, mask2);
    assertSubnets(subnets, expected);
    assert.strictEqual(subnets.hostn, hostn);
}

function assertSubnets(subnets, expected) {
    var network;
    assert.strictEqual(subnets.length, expected.length);
    for (var i = 0, len = expected.length; i < len; i++) {
        network = expected[i].split('/');
        assert.strictEqual(ipcalc.ntoa(subnets[i].network), network[0]);
        assert.strictEqual(subnets[i].mask, parseInt(network[1], 10));
    }
}