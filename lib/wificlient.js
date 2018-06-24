// Serial port client that opens a connection with 115200 baud
"use strict";

const net = require ("net");
const utils = require('./utils');
 
module.exports = class WifiClient {
	constructor(host, port) {
		this.connected = false;
		this.keepAliveInterval = null;
		this.keepAliveCounter = 0;

		this.connectionParams = { 
			host: host, port: port 
		};

		this.client = new net.Socket();
		this.client.setTimeout(2000);
		this.init();
	};
 
	init() {	

		this.client.on('data', (data) => {
			console.log(data.toString());
		});

		this.client.on('connect', () => {
			console.log("Connected.");
			this.connected = true;
		});

		this.client.on('error', (error) => {
			console.log("ERROR! " + error);
			this.client.destroy();
			// close is called after this event
		});

		this.client.on('end', () => {
			console.log("Connection ended.");
			clearInterval(this.keepAliveInterval);
			this.connected = false;
		});

		this.client.on('close', () => {
			console.log("Connection closed.");
			clearInterval(this.keepAliveInterval);
			this.connected = false;
		});

	}
	
	type() {
		return "wifi";
	}
	
	connect() {
		const that = this;
		return new Promise ((resolve, reject) => {
			try{
				that.client.on('timeout', () => {
					console.log("Socket timeout.");
					this.client.destroy();
					return reject(new Error("Client connection timeout."));
				});
				that.client.connect(that.connectionParams, () => {
					console.log("Connected.");
					//that.client.setKeepAlive(true);
					that.connected = true;
					that.keepAliveInterval = setInterval(() => {
						this.sendKeepAlive(true);
					}, 500);
					return resolve();
				});
			}
			catch (err) {
				console.log("ERROR connecting:" + err);
				return reject(err);
			}
		});
	}


	isConnected() {
		return this.connected;
	}

	disconnect() {
		var that = this;
		return new Promise ((resolve, reject) => {
			try{
				that.client.end();
				that.client.destroy();
				console.log("Disconnected.");
				clearInterval(that.keepAliveInterval);
				that.connected = false;
				return resolve();
			}
			catch (err) {
				console.log("ERROR closing:" + err);
				return reject(err);
			}
		});
	}

	write(data) {
		if (!this.connected) {
			console.log("Not connected. Cannot write data.");
			return;
		}
		const allWritten = this.client.write(data, () => {
			// console.log("Data written.");
		});
		if (!allWritten) {
			console.log("Some data buffered...");
		}
	}
	
	sendCmd(cmd, doLog){
		const doLogFlag = (doLog === undefined) || Boolean(doLog) === true; // default: true
		
		const verifiedCmd = [255]; // cmd separator
		// since 255 is cmd sep we do not allow it as value
		for (let i=0; i< 6; i++) {
			verifiedCmd.push(
				utils.constrain(cmd[i], 0, 254));
		}
		
		if (doLogFlag) {
			console.log("cmd: " + verifiedCmd);
		}
		const buf = new Buffer(verifiedCmd);
		this.client.on('timeout', () => {
			console.log("Socket timeout.");
			this.client.destroy();
		});
		this.write(buf);   
	}

	sendKeepAlive(doLog) {
		const doLogFlag = (doLog === undefined) || Boolean(doLog) === true; // default: true
		this.keepAliveCounter++;

		if (doLogFlag && this.keepAliveCounter%10 === 0) {
			process.stdout.write(".");
			this.keepAliveCounter = 0;
		}
		const verifiedCmd = [255]; // cmd separator
		const buf = new Buffer(verifiedCmd);
		this.write(buf);   
	}

};
