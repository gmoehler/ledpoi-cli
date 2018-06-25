const utils = require('./utils');
const WifiClient = require("./wificlient");
const constants = require('../constants');

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

module.exports = {
	connectAll: _connectAll,
	showStatus: _showStatus
}