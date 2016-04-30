/* jshint node:true */
/* jshint mocha:true */
'use strict';

var assert = require('assert');

var ipcalc = require('../ipcalc');

describe('argton', function() {
    var netmaskOpts = {
        isNetmask: true
    };

    var ip = (192 << 24) + (168 << 16) + (2 << 8) + 1,
        mask = (255 << 24) + (255 << 16) + (255 << 8);

    it('should not convert integer ip', function() {
        assert.strictEqual(ipcalc.argton(ip), ip);
    });

    // it('should not convert hex integer ip', function() {
    //     assert.strictEqual(ip, ipcalc.argton((ip).toString(16)));
    // });

    it('should convert dotted ip to integer', function() {
        assert.strictEqual(ipcalc.argton('192.168.2.1'), ip);
    });

    it('should not convert integer mask', function() {
        assert.strictEqual(ipcalc.argton(mask), mask);
        assert.strictEqual(ipcalc.argton(mask, netmaskOpts), mask);
    });

    it('should convert dotted mask to integer', function() {
        assert.strictEqual(ipcalc.argton('255.255.255.0'), mask);
        assert.strictEqual(ipcalc.argton('255.255.255.0', netmaskOpts), mask);
    });

    it('should convert bitcount mask to integer', function() {
        assert.strictEqual(ipcalc.argton('/24', netmaskOpts), mask);
        assert.strictEqual(ipcalc.argton('24', netmaskOpts), mask);
        assert.strictEqual(ipcalc.argton(24, netmaskOpts), mask);
    });

    it('should convert integer ip to dotted ip', function() {
        assert.strictEqual(ipcalc.ntoa(ip), '192.168.2.1');
        assert.strictEqual(ipcalc.ntoa(mask), '255.255.255.0');
    });

    it('should convert integer border cases', function() {
        assert.strictEqual(ipcalc.argton(0), 0);
        assert.strictEqual(ipcalc.argton(0, netmaskOpts), 0);
        assert.strictEqual(ipcalc.argton('0.0.0.0'), 0);
        assert.strictEqual(ipcalc.argton('0', netmaskOpts), 0);
    });

    it('should not convert invalid address', function() {
        assert.strictEqual(ipcalc.argton('192.168.2.'), false);
        assert.strictEqual(ipcalc.argton('192'), false);
    });

    it('should validate mask', function() {
        assert.strictEqual(ipcalc.validate_netmask(mask), mask);
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('0.0.0.0')), ipcalc.argton('0.0.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('128.0.0.0')), ipcalc.argton('128.0.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('192.0.0.0')), ipcalc.argton('192.0.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('224.0.0.0')), ipcalc.argton('224.0.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('240.0.0.0')), ipcalc.argton('240.0.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('248.0.0.0')), ipcalc.argton('248.0.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('252.0.0.0')), ipcalc.argton('252.0.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('254.0.0.0')), ipcalc.argton('254.0.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.0.0.0')), ipcalc.argton('255.0.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.128.0.0')), ipcalc.argton('255.128.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.192.0.0')), ipcalc.argton('255.192.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.224.0.0')), ipcalc.argton('255.224.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.240.0.0')), ipcalc.argton('255.240.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.248.0.0')), ipcalc.argton('255.248.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.252.0.0')), ipcalc.argton('255.252.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.254.0.0')), ipcalc.argton('255.254.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.0.0')), ipcalc.argton('255.255.0.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.128.0')), ipcalc.argton('255.255.128.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.192.0')), ipcalc.argton('255.255.192.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.224.0')), ipcalc.argton('255.255.224.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.240.0')), ipcalc.argton('255.255.240.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.248.0')), ipcalc.argton('255.255.248.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.252.0')), ipcalc.argton('255.255.252.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.254.0')), ipcalc.argton('255.255.254.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.0')), ipcalc.argton('255.255.255.0'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.128')), ipcalc.argton('255.255.255.128'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.192')), ipcalc.argton('255.255.255.192'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.224')), ipcalc.argton('255.255.255.224'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.240')), ipcalc.argton('255.255.255.240'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.248')), ipcalc.argton('255.255.255.248'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.252')), ipcalc.argton('255.255.255.252'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.254')), ipcalc.argton('255.255.255.254'));
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.255')), ipcalc.argton('255.255.255.255'));

        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.253')), false);
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.255.230')), false);
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.255.225.0')), false);
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.252.190.0')), false);
        assert.strictEqual(ipcalc.validate_netmask(ipcalc.argton('255.0.255.255')), false);
    });

    it('should count bit mask', function() {
        var mask;
        for (var i = 0; i <= 32; i++) {
            mask = ipcalc.argton(i, netmaskOpts);
            assert.strictEqual(ipcalc.ntobitcountmask(mask), i);
            assert.strictEqual(ipcalc.bitcountmaskton(i), mask);
        }
    });

    it('should get class', function() {
        var classes = [
                [0, 127, 'A'],
                [128, 191, 'B'],
                [192, 223, 'C'],
                [224, 239, 'D'],
                [240, 255, 'E']
            ],
            args, start, end, letter, ip, len, i, j;

        for (i = 0, len = classes.length; i < len; i++) {
            args = classes[i];
            start = args[0];
            end = args[1];
            letter = args[2];

            for (j = 0; j < 10; j++) {
                ip = [
                    Math.round(start + (end - start) * Math.random()),
                    Math.round(255 * Math.random()),
                    Math.round(255 * Math.random()),
                    Math.round(255 * Math.random())
                ].join('.');
                assert.strictEqual(ipcalc.getclass(ipcalc.argton(ip)), letter);
            }
        }
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