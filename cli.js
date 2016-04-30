#!/bin/env node

var ipcalc = require('./ipcalc');

var netmaskOpts = {
    isNetmask: true
};

// console.log(ipcalc.argton('192.168.2.1'));
// console.log(ipcalc.ntoa(ipcalc.argton('192.168.2.1')));

// console.log(ipcalc.getclass('0.0.0.0'));
// console.log(ipcalc.getclass('128.0.0.0'));
// console.log(ipcalc.getclass('192.0.0.0'));
// console.log(ipcalc.getclass('224.0.0.0'));
// console.log(ipcalc.getclass('240.0.0.0'));

// console.log(ipcalc.argton('255.255.255.0', netmaskOpts));
// console.log(ipcalc.argton('24', netmaskOpts));
// console.log(ipcalc.argton(24, netmaskOpts));

// console.log(ipcalc.ntobitcountmask(ipcalc.argton('255.255.255.0', netmaskOpts)));
// console.log(ipcalc.ntobitcountmask(ipcalc.argton('24', netmaskOpts)));
// console.log(ipcalc.ntobitcountmask(ipcalc.argton(24, netmaskOpts)));

// console.log(ipcalc.validate_netmask(ipcalc.argton('255.255.255.0', netmaskOpts)));
// console.log(ipcalc.validate_netmask(ipcalc.argton('24', netmaskOpts)));
// console.log(ipcalc.validate_netmask(ipcalc.argton(24, netmaskOpts)));
// console.log(ipcalc.validate_netmask(ipcalc.argton('255.255.253.0', netmaskOpts)));

// console.log('' + new ipcalc.Network(ipcalc.argton('192.168.2.1'), ipcalc.argton('255.255.255.0')));
// console.log('' + ipcalc('10.220.0.0', '255.255.0.0'));
// console.log('[\n' + ipcalc.deaggregate('192.168.2.1', '192.168.2.255').map(function(element, index) {
//     return '  ' + element.toString(true);
// }).join('\n') + '\n]');
var splitted = ipcalc.split_network(ipcalc.argton('192.168.0.1'), ipcalc.argton(17, netmaskOpts), 1024, 1024);
console.log('address', ipcalc.ntoa(splitted.address));
console.log('network', ipcalc.ntoa(splitted.network));
console.log('needed_size', splitted.needed_size);
console.log('[\n' + splitted.map(function(element, index) {
    return '  ' + element.toString(true);
}).join('\n') + '\n]');
console.log('[\n' + splitted.unused.map(function(element, index) {
    return '  ' + element.toString(true);
}).join('\n') + '\n]');
// var subnets = ipcalc.subnets('192.168.0.1', 17, 19);
// console.log('hosts', subnets.hostn);
// console.log('[\n' + subnets.map(function(element, index) {
//     return '  ' + element.toString(true);
// }).join('\n') + '\n]');