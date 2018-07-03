// Serial port client that opens a connection with 115200 baud
"use strict";

const net = require ("net");
const utils = require('./utils');
 
module.exports = class WifiClient {
	constructor(host, port) {
		this.connected = false;
		this.keepAliveInterval = null;
		this.keepAliveCounter = 0;
		this.timeoutListenerSet = false;
		this.errorListenerSet = false;

		this.connectionParams = { 
			host: host, port: port 
		};

		this.client = new net.Socket();
		this.client.setTimeout(5000);
		this.init();
	};
 
	init() {	

		this.client.on('data', (data) => {
			console.log(data.toString());
		});

		this.client.on('connect', () => {
			console.log(`Connected to ${this.connectionParams.host}.`);
			this.connected = true;
		});


		this.client.on('end', () => {
			console.log(`Connection ended to ${this.connectionParams.host}.`);
			this.connected = false;
			clearInterval(this.keepAliveInterval);
		});

		this.client.on('close', () => {
			console.log(`Connection closed from to ${this.connectionParams.host}.`);
			this.connected = false;
			clearInterval(this.keepAliveInterval);
			this.client.destroy();
		});

	}
	
	type() {
		return "wifi";
	}

	connect() {
		const that = this;
		return new Promise ((resolve, reject) => {
			if (!this.timeoutListenerSet) {
				this.timeoutListenerSet = true;
				const numListeners =  that.client.listenerCount('timeout');
				if (numListeners > 0) {
					// should not happen
					console.log("Adding timeout listener to %s, num listeners: %d", that.host,numListeners);
				}
				that.client.on('timeout', () => {
					console.log(`Socket timeout from to ${this.connectionParams.host}`);
					that.connected = false;
					clearInterval(this.keepAliveInterval);
					this.client.destroy();
					return reject(new Error("Client connection timeout."));
				});
			}
			if (!this.errorListenerSet) {
				this.errorListenerSet = true;
				const numListeners =  that.client.listenerCount('error');
				if (numListeners > 0) {
					// should not happen
					console.log("Adding error listener to %s, num listeners: %d", that.host,numListeners);
				}
				this.client.on('error', (error) => {
					if (numListeners > 0) {
						console.log("Adding timeout listener to %s, num listeners: %d", that.host,numListeners);
					}
						console.log("ERROR! " + error);
					//this.connected = false;
					clearInterval(this.keepAliveInterval);
					//this.client.destroy();
					// close is called after this event
					return reject(new Error("Client connection error."));
				});
			}
			try {
				that.client.connect(that.connectionParams, () => {
					// console.log("Connected.");
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
				that.connected = false;
				clearInterval(that.keepAliveInterval);
				that.client.end();
				that.client.destroy();
				console.log(`Disconnected from to ${this.connectionParams.host}`);
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
