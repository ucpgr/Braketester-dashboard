import { EventEmitter } from 'events';
import { BrakeTesterSerial } from './BrakeTesterSerial.js';
import { RegisterBus } from './RegisterBus.js';

let serial = null;
let bus = null;
let connected = false;
let connecting = false;

const state = new EventEmitter();

/**
 * Attempt to connect to the brake tester.
 * Safe to call multiple times.
 */
export async function initBrakeTester({
																				port = '/dev/ttyUSB0',
																				baud = 38400
																			} = {}) {
	if (connected || connecting) return bus;

	connecting = true;

	try {
		serial = new BrakeTesterSerial(port, baud);
		await serial.open();

		bus = new RegisterBus(serial);
		connected = true;

		state.emit('connected');
		console.info(`Brake tester connected on ${port}`);
	} catch (err) {
		connected = false;
		bus = null;
		state.emit('disconnected', err);
		console.warn('Brake tester not connected');
	}

	connecting = false;
	return bus;
}

/**
 * Returns the active bus or null if unavailable.
 */
export function getBrakeTesterBus() {
	return connected ? bus : null;
}

/**
 * Connection state helpers
 */
export function isBrakeTesterConnected() {
	return connected;
}

export function onBrakeTesterState(cb) {
	state.on('connected', () => cb(true));
	state.on('disconnected', err => cb(false, err));
}
