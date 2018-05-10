"use strict"

// maximum number of pois that can be configured
const N_POIS=10;

// this is int( N_NUM_IMAGE_SECTIONS*4096/(N_PIXELS*3) )
// max is 255 because of uint8_t
const N_FRAMES=227;
const N_PIXELS=60;

// assuming a 2MB flash partition, this is less than
// 2M / ( 4096 * N_NUM_IMAGE_SECTIONS ) = 49
// assuming a 1.5MB flash partition, this is less than
// 1503232 / ( 4096 * N_NUM_IMAGE_SECTIONS ) = 36
const N_SCENES=36 // 49

const N_CMD_FIELDS=6;

// this is due to max NVS length of 1984 bytes
const N_PROG_STEPS=330;

// serial baud rate
//const UART_BAUD=115200
const UART_BAUD=921600

// delay after 100 bytes sent
const pauseAfter100Bytes = 40;
