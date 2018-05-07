
function _connectWifi(client, ipIncr) {
	client.sendCmd([210,  ipIncr,  0,  0,  0,  0]);
	return Promise.resolve(client);    
}

function _disconnectWifi(client) {
	client.sendCmd([211,  0,  0,  0,  0,  0]);
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


module.exports = {
	connectWifi: _connectWifi,
	disconnectWifi: _disconnectWifi,
	logStatus:_logStatus,
	selftest: _selftest
}