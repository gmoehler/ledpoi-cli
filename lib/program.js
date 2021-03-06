"use strict"
const fs = require('fs');
const parse = require('csv-parse');
const path = require("path");

const constants = require('../constants');
const utils = require('./utils');
const cmd = require("./poiCommands");
const control = require('./control');

let syncMap = {};

function _getSyncMap() {
	return syncMap;
}

function _uploadProgramHeader(client) {

 	// send program tail command
	console.log("Starting program upload....");
	client.sendCmd([195, 0, 0, 0, 0, 0]);   
	return Promise.resolve();
}

function _uploadProgramTailAndSave(client) {

 	// send program tail command
	client.sendCmd([196,  0,  0,  0,  0,  0]);     
	console.log("Saving program....");
	client.sendCmd([197,  0,  0,  0, 0,  0]);     
	return Promise.resolve();
}

function _uploadProgramBody(client, prog) {
	for (let i = 0; prog && i < prog.length; i++) {
		client.sendCmd(prog[i]);         
 	}
	return Promise.resolve();
}

function _checkProgram(prog) {
	if (prog.length > constants.N_PROG_STEPS){
		console.log(`Number of program steps exceeds ${constants.N_PROG_STEPS}`);
		return false;
	}
	for (let i = 0; prog && i < prog.length; i++) {
		if(!control.isValidProgramCommand(prog[i])){
			return false;
		}
 	}
	return true;
}

function _collectProgramCmd(progFileWithPath, i) {

  return new Promise((resolve, reject) => {
	
	//initial sync point
	const prog = [[215, i, 0, 0, 0, 0]];
	
	// todo: do loop incr
		
  	fs.createReadStream(progFileWithPath)
    	.pipe(parse({delimiter: ',', comment: '#'}))
    	.on('data', function(csvrow) {
        	// convert into numbers
        	const cmd=csvrow.map(Number);
        	prog.push(cmd);
    	})
    	.on('end',function() {
			if (!_checkProgram(prog)) {
				return reject(new Error("Error in program."));
			}
			return resolve(prog);
		})
    	.on('error',function(err) {
			console.log(err);
			return reject(err);
    	});
  });
}

async function _collectProgramJs(progFileWithPath, i) {
	
	// get last loop id from previous program (reset for first one)
	const hi = i> 0 ? cmd.getHiCounts() : {loop: 0};
	
	// reset prog cache
	cmd.init(hi);

    // add initial sync point
	cmd.syncPoint(i);
	
	// const thisScriptPath=path.join(process.cwd(), "lib");
	// const pathToMod= "." + path.sep + path.relative(thisScriptPath, progFileWithPath);
	// console.log("program script:" + thisScriptPath);
	// console.log("pro with path   :" + progFileWithPath);
	// console.log("module  path:" + pathToMod);
	
	// uncached load: allow reading a file multiple times
	const prog = utils.requireUncached (progFileWithPath);
	return Promise.resolve(cmd.getProg());
}

async function _doCollectProgram(filename, i) {
	syncMap[i] = filename;
	
	const progFileWithPath = path.join(process.cwd(), filename);
	
	if (!fs.existsSync(progFileWithPath)) {
		return Promise.reject(new Error(`Program file ${progFileWithPath} does not exist.`));
	}
	console.log(`Sending program ${i} from ${progFileWithPath}....`);
	
	// collect cmds from program
	const prog = _isJpoiFile(progFileWithPath)
			? await _collectProgramJs(progFileWithPath, i)
			: await _collectProgramCmd(progFileWithPath, i);
			
	return Promise.resolve(prog);
}

async function _doUpload(client, prog) {
	await _uploadProgramHeader(client);
	await _uploadProgramBody(client, prog);
	await _uploadProgramTailAndSave(client);
}

function _isJpoiFile(filename) {
	const ext = filename.split('.').pop();
	return ext === "jpoi";
}

async function _uploadPrograms(client, programFiles) {
	let prog = [];
	syncMap = {};
	
	if (Array.isArray(programFiles)) {
		for (let i = 0; i < programFiles.length; i++) {
			const subprog = await _doCollectProgram(programFiles[i], i);
			console.log(subprog);
			prog.push(...subprog);
		}
	} 
	else if (programFiles) {
		prog = await _doCollectProgram(programFiles, 0);
	}
	
	await _doUpload(client, prog);

	return Promise.resolve(prog);
}


function _startProgram(client) {
	client.sendCmd([206,  0,  0,  0,  0,  0]);
	console.log("Started.");
	return Promise.resolve();    
}

function _stopProcessing(client) {
	control.logStatus(client);
	client.sendCmd([207,  0,  0,  0,  0,  0]);    
	control.logStatus(client);
}

function _pauseProcessing(client) {
	client.sendCmd([208,  0,  0,  0,  0,  0]);    
}

function _syncProgram(client, i) {
	client.sendCmd([209,  i,  0,  0,  0,  0]);    
}

module.exports = {
	uploadPrograms: _uploadPrograms,
	startProgram: _startProgram,
	stopProcessing: _stopProcessing,
	pauseProcessing: _pauseProcessing,
	syncProgram: _syncProgram,
	getSyncMap: _getSyncMap,
	// export for testing only
	doUpload: _doUpload,
	doCollectProgram: _doCollectProgram,
}
	