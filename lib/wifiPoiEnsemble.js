'use strict';

const constants = require('../constants');
const utils = require('./utils');
const WifiClient = require("./wificlient");
const prg = require('./program');
const ctrl = require('./control');

const clients = [];

function _connectAll() {
	let connectPromises = [];
	for (let ipIncr=0;ipIncr<constants.N_POIS;ipIncr++) {
		const ip = utils.getIp(ipIncr);
		let client = clients[ipIncr];
		
		if (client && client.isConnected()) {
			console.log(`${ip} already connected.`);
		} else {
			client = new WifiClient(ip, 1110);
			clients[ipIncr] = client;
			
			console.log(`Connecting to ${ip}...`);
			// connect promise that always resolves
			const prom = client.connect()
				.catch(e => { 
					console.log(`Connection to ${ip} failed.`);
					return e;
				});
		 	connectPromises.push (prom);
		}
	}
	return Promise.all(connectPromises);
}

function _showStatus() {
	process.stdout.write("Poi Status: ");
	for (let ipIncr=0;ipIncr<constants.N_POIS;ipIncr++) {
		const con = clients[ipIncr].isConnected() ? "*" : ".";
		process.stdout.write(`${ipIncr}${con} `);
	}
	console.log();
}

function _startProgram(ids) {
	var numIds = ids.length;
	for (var i = 0; i < numIds; i++) {
		const idx = ids[i];
		const client = clients[idx];
		if (client && client.isConnected()) {
			prg.startProgram(client);
		}
		else {
			console.log(`Cannot start disconnected client ${idx}`);
		}
	}
	return Promise.resolve();
}

function _stopProcessing(ids) {
	var numIds = ids.length;
	for (var i = 0; i < numIds; i++) {
		const idx = ids[i];
		const client = clients[idx];
		if (client && client.isConnected()) {
			prg.stopProcessing(client);
		}
		else {
			console.log(`Cannot stop disconnected client ${idx}`);
		}
	}
	return Promise.resolve();
}

function _pauseProcessing(ids) {
	var numIds = ids.length;
	for (var i = 0; i < numIds; i++) {
		const idx = ids[i];
		const client = clients[idx];
		if (client && client.isConnected()) {
			prg.pauseProcessing(client);
		}
		else {
			console.log(`Cannot pause disconnected client ${idx}`);
		}
	}
	return Promise.resolve();
}

function _clientReconnect(ids) {
	var numIds = ids.length;
	for (var i = 0; i < numIds; i++) {
		const idx = ids[i];
		const client = clients[idx];
		if (client && client.isConnected()) {
			ctrl.clientDisconnect(client);
		}
		else {
			console.log(`Cannot send reconnect to disconnected client ${idx}`);
		}
	}
	return Promise.resolve();
}



module.exports = {
	connectAll: _connectAll,
	showStatus: _showStatus,
	startProgram: _startProgram,
	stopProcessing: _stopProcessing,
	pauseProcessing: _pauseProcessing,
	clientReconnect: _clientReconnect
}