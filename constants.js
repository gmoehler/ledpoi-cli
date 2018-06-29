"use strict"

// maximum number of pois that can be configured
exports.N_POIS=10;

// number of different port variations on error per client
exports.N_PORT_VARS_ON_ERROR=5

// this is int( N_NUM_IMAGE_SECTIONS*4096/(N_PIXELS*3) )
// max is 255 because of uint8_t
exports.N_FRAMES=227;
exports.N_PIXELS=60;

// assuming a 2MB flash partition, this is less than
// 2M / ( 4096 * N_NUM_IMAGE_SECTIONS ) = 49
// assuming a 1.5MB flash partition, this is less than
// 1503232 / ( 4096 * N_NUM_IMAGE_SECTIONS ) = 36
exports.N_SCENES=36 // 49

exports.N_CMD_FIELDS=6;

// this is due to max NVS length of 1984 bytes
exports.N_PROG_STEPS=330;

// serial baud rate
//exports.UART_BAUD=115200
exports.UART_BAUD=921600

// delay after 100 bytes sent
exports.pauseAfter100Bytes = 200;

// base port incremented by ip_incr
exports.basePort = 1110;
