
function _setIpIncr(client, ipIncr) {
	client.sendCmd([213, ipIncr,  0,  0,  0,  0]);
	return Promise.resolve(client);    
}
function _connectWifi(client) {
	client.sendCmd([210,  0,  0,  0,  0,  0]);
	return Promise.resolve(client);    
}

function _disconnectWifi(client) {
	client.sendCmd([211,  0,  0,  0,  0,  0]);
	return Promise.resolve(client);    
}

function _clientDisconnect(client) {
	client.sendCmd([212,  0,  0,  0,  0,  0]);
	return Promise.resolve(client);    
}

function _logStatus(client) {
	client.sendCmd([231,  0,  0,  0,  0,  0]);
	return Promise.resolve(client);    
}

function _selftest(client) {
	client.sendCmd([232,  0,  0,  0,  0,  0]);
	return Promise.resolve(client);    
}

function _initFlash(client) {
	client.sendCmd([198,  0,  0,  0,  0,  0]);
	return Promise.resolve(client);    
}

function _isValidProgramCommand(cmd) {
	return [199, 200, 201, 202, 203, 204, 214, 215, 216].includes(cmd[0]);
}

module.exports = {
	setIpIncr: _setIpIncr,
	connectWifi: _connectWifi,
	disconnectWifi: _disconnectWifi,
	clientDisconnect: _clientDisconnect,
	logStatus:_logStatus,
	selftest: _selftest,
	initFlash: _initFlash,
	isValidProgramCommand: _isValidProgramCommand
}