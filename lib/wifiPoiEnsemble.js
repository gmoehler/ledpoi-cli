'use strict';

const constants = require('../constants');
const utils = require('./utils');
const WifiClient = require("./wificlient");
const prg = require('./program');
const ctrl = require('./control');

const clients = [];

function _connectAll(ids) {
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
		const con = clients[ipIncr] && clients[ipIncr].isConnected() ? "*" : ".";
		process.stdout.write(`${ipIncr}${con} `);
	}
	console.log();
	return Promise.resolve();
}

function applyToPois(ids, func, text) {
	var numIds = ids.length;
	for (var i = 0; i < numIds; i++) {
		const idx = ids[i];
		const client = clients[idx];
		if (client && client.isConnected()) {
			func(client);
		}
		else {
			console.log(`${text} ${idx}`);
		}
	}
	return Promise.resolve();	
}

function _startProgram(ids) {
	return applyToPois(ids, prg.startProgram, "Cannot start disconnected client");
}

function _stopProcessing(ids) {
	return applyToPois(ids, prg.stopProcessing, "Cannot stop disconnected client");
}

function _pauseProcessing(ids) {
	return applyToPois(ids, prg.pauseProcessing, "Cannot pause disconnected client");
}

function _clientReconnect(ids) {
	return applyToPois(ids, ctrl.clientDisconnect, "Cannot send reconnect to disconnected client");
}

module.exports = {
	connectAll: _connectAll,
	showStatus: _showStatus,
	startProgram: _startProgram,
	stopProcessing: _stopProcessing,
	pauseProcessing: _pauseProcessing,
	clientReconnect: _clientReconnect
}