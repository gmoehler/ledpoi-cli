"use strict"

const fs = require('fs');
const constants = require('../constants');

function _constrain(val, minval, maxval){
  const val1 = val>maxval ? maxval : val;
  return val1 < minval ? minval : val1;
}

function _isConnected(client) {
	return (client && client.isConnected());
}

function _checkConnected(client) {
	return _isConnected(client) ?
		Promise.resolve(client) :
		Promise.reject(new Error("Not connected."));
}

function _checkNotConnected(client) {
	return _isConnected(client) ?
		Promise.reject(new Error("Already connected.")) : 
		Promise.resolve(client);
}

function _delay (msec) {
	return new Promise((resolve, reject) => {
    	setTimeout(() => { 
        	resolve();
 	   }, msec);
    });
}

function _saveConfig(filename, config) {
	
	return new Promise((resolve, reject) => {
		fs.writeFile(filename, JSON.stringify(config), 'utf8', (err) => {
			if (err) {
				return reject (err);
			}
			console.log('Wrote ' + filename);
			return resolve();
		});
	});
}

function _requireUncached(module){
    delete require.cache[require.resolve(module)];
    return require(module);
}

function _getIp(ipIncr) {
	const ip4 = 127 + ipIncr;
	return `192.168.1.${ip4}`;
}

function _getPort(ipIncr, portVar) {
	return constants.basePort + ipIncr + portVar * constants.N_POIS;
}

module.exports = {
	delay: _delay,
	constrain: _constrain,
    checkConnected: _checkConnected,
    checkNotConnected: _checkNotConnected,
	saveConfig: _saveConfig,
	requireUncached: _requireUncached,
	getIp: _getIp,
	getPort: _getPort
}