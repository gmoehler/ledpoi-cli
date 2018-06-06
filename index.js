'use strict';

const configFile = "config.json";

const fs = require('fs');
const inquirer = require('inquirer');

const prg = require('./lib/program');
const img = require('./lib/image');
const show = require('./lib/show');
const ctrl = require('./lib/control');
const utils = require('./lib/utils');
const config = fs.existsSync(configFile) 
	? require('./' + configFile) : {};

let client = null;

const mainChoices =  [
	{ 
		name: 'Connect to poi via uart',
	   	value: 'connect'
   	},
   	{ 
		name: 'Connect to poi via wifi',
	   	value: 'wifi_connect'
	},
	{ 
		name: 'Disconnect',
	   	value: 'disconnect'
   	},
   	{
	   	name: 'Upload show', 
		value:'up_show'
	} ,
	{
		name: 'Upload show without images', 
	 	value:'up_show_prog'
 	} ,
   	{
		name: 'Upload image', 
	   	value:'up_image'
	} ,
	{
		name: 'Upload program', 
	   	value:'up_prog'
   	} ,
   	{
		name: 'Start program', 
		value:'start_prog'
   	},
   	{
		name: 'Stop processing', 
	   	value:'stop_proc'
	},
	{
		name: 'Pause/resume processing', 
	   	value:'pause_proc'
	},
	{
		name: 'Set IP increment', 
	   	value:'set_ip_incr'
   	},
	{
		name: 'Send wifi connect', 
	   	value:'ip_connect'
   	},
	   {
		name: 'Send wifi disconnect', 
	   	value:'ip_disconnect'
   	},
	{
		name: 'Send client disconnect', 
	   	value:'client_disconnect'
   	},
   	{
		name: 'Sync', 
	   	value:'sync'
   	},
   	{
		name: 'Status', 
	   	value:'status'
	},
	{
		name: 'Selftest', 
	   	value:'selftest'
   	},
	{
		name: 'Init flash', 
	   	value:'initFlash'
   	},

   	{
	   	name: 'Exit', 
		value:'exit'
	} 
];

var mainMenu = [
  {
    type: 'rawlist',
    name: 'selection',
	message: 'Poi Commander',
	pageSize: 20,
    choices: mainChoices
  },
  {
    type: 'input',
    name: 'filename',
    message: 'Filename:',
    default: getDefaultFilename,
    when: function(answers) {
      return (["up_image", "up_prog", "up_show", "up_show_prog"].includes(answers.selection));
    }
  },
    {
    type: 'input',
    name: 'image_id',
    message: 'Image ID:',
    default: 0,
    when: function(answers) {
      return (answers.selection === "up_image");
    }
  },
  {
    type: 'input',
    name: 'ip_incr',
    message: 'IP increment:',
    default: getDefaultIpIncr,
    when: function(answers) {
      return (answers.selection == "set_ip_incr");
	}
  },
  {
    type: 'input',
    name: 'sync_point',
    message: getSyncs,
    default: '0',
    when: function(answers) {
      return (answers.selection == "sync");
	}
  }
]

function getDefaultFilename(answers) {
	switch (answers.selection) {
		case "up_image":
			return config.image;
		case "up_prog":
			return config.prog;
		case "up_show":
		case "up_show_prog":
			return config.show;
		default:
			return "";
	}
}

function getDefaultIpIncr() {
	return config.ipIncr;
}

function getSyncs(){
	var str = "Choose sync point: \n";
	const syncs = prg.getSyncMap();
	for (let i in syncs) {
		str = str.concat("  " + i + ": " + syncs[i] + " \n");
	}
	
	return str;
}

function handleError(err) {
	console.log("Error: " + err.message);
	main();
}

function main(){
	inquirer.prompt(mainMenu).then(answer => {
		// console.log(answer);
		if (answer.selection === "connect") {
			utils.checkNotConnected(client) 
			.then(() => {
				console.log("Connecting...");
				const SerialClient = require("./lib/serialclient");
				client = new SerialClient("COM4");
				return client.connect();
			})
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "wifi_connect") {
			utils.checkNotConnected(client) 
			.then(() => {
				console.log("Connecting...");
				const WifiClient = require("./lib/wificlient");
				client = new WifiClient("192.168.1.127", 1110);
				return client.connect();
			})
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "disconnect") {
			utils.checkConnected(client) 
			.then((client) => {
				return client.disconnect();
			})
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "up_show" || 
				answer.selection === "up_show_prog") {
			utils.checkConnected(client) 
			.then(() => {
				return show.uploadShow(client, answer.filename, answer.selection === "up_show_prog");
			})
			.then(() => {
				config.show = answer.filename;
			})
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "up_prog") {
			utils.checkConnected(client) 
			.then(() => {
				return prg.uploadPrograms(client, [answer.filename]);
			})
			.then(() => {
				config.prog = answer.filename;
			})
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "up_image") {
			utils.checkConnected(client) 
			.then(() => {
				const id = answer.image_id ? answer.image_id : 0;
				return img.uploadImage(client, id, answer.filename);
			})
			.then(() => {
				config.image = answer.filename;
			})
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "set_ip_incr") {
			utils.checkConnected(client) 
			.then((client) => {
		  		return ctrl.setIpIncr(client, parseInt(answer.ip_incr));
			})
			.then(() => {
				config.ipIncr = answer.ip_incr;
			})
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "ip_connect") {
			utils.checkConnected(client) 
			.then((client) => {
		  		return ctrl.connectWifi(client);
			})
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "ip_disconnect") {
			utils.checkConnected(client) 
			.then(ctrl.disconnectWifi)
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "client_disconnect") {
			utils.checkConnected(client) 
			.then(ctrl.clientDisconnect)
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "start_prog") {
			utils.checkConnected(client) 
			.then(prg.startProgram)
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "stop_proc") {
			utils.checkConnected(client) 
			.then(prg.stopProcessing)
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "pause_proc") {
			utils.checkConnected(client) 
			.then(prg.pauseProcessing)
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "sync") {
			utils.checkConnected(client) 
			.then((client) => prg.syncProgram(client, parseInt(answer.sync_point)))
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "status") {
			utils.checkConnected(client) 
			.then((client) => ctrl.logStatus(client))
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "selftest") {
			utils.checkConnected(client) 
			.then((client) => ctrl.selftest(client))
			.then(main)
			.catch(handleError);
		}
		else if (answer.selection === "initFlash") {
			utils.checkConnected(client) 
			.then((client) => ctrl.initFlash(client))
			.then(main)
			.catch(handleError);
		}

		else {
			utils.saveConfig(configFile, config)
			.then(() => {
				if (client && client.isConnected()) {
					return client.disconnect();
			   }
			   return Promise.resolve();
			})
			.catch(handleError);
		}

	});
}

main();
