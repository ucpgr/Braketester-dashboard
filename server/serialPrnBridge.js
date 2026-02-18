import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Database from 'better-sqlite3';
import { SerialPort } from 'serialport';

const SERIAL_PORT_SETTING_KEY = 'lpt_serial_port';
const SETTINGS_POLL_MS = 1000;
const INACTIVITY_MS = 1000;
const PRN_OUTPUT_DIR = '/opt/printqueue/incoming';

const dataDir = path.resolve('data');
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(PRN_OUTPUT_DIR)) {
	fs.mkdirSync(PRN_OUTPUT_DIR, { recursive: true });
}

const dbPath = path.join(dataDir, 'braketester.db');
const db = new Database(dbPath, { readonly: true, fileMustExist: false });

function readConfiguredPortId() {
	try {
		const row = db
			.prepare('SELECT value FROM app_settings WHERE key = ?')
			.get(SERIAL_PORT_SETTING_KEY);
		return typeof row?.value === 'string' ? row.value.trim() : '';
	} catch (error) {
		console.error('Serial PRN bridge failed to read configured port from DB:', error);
		return null;
	}
}

function createRandomPrnPath() {
	const fileName = `${crypto.randomUUID()}.prn`;
	return path.join(PRN_OUTPUT_DIR, fileName);
}

let configuredPortId = '';
let activePort = null;
let activePortId = '';
let pendingBuffer = Buffer.alloc(0);
let inactivityTimer = null;

function writeToActivePort(data) {
	if (!activePort) {
		throw new Error('No active serial port object');
	}

	if (!activePort.isOpen) {
		throw new Error('Active serial port is not open');
	}

	return new Promise((resolve, reject) => {
		activePort.write(data, (error) => {
			if (error) {
				reject(error);
				return;
			}

			activePort.drain((drainError) => {
				if (drainError) {
					reject(drainError);
					return;
				}

				resolve();
			});
		});
	});
}

export async function sendSerialBridgeCommand(portId, data) {
	if (!portId) {
		console.error('Serial PRN bridge test send failed: requested portId was empty');
		return { ok: false, reason: 'missing-port-id' };
	}

	if (activePortId && portId !== activePortId) {
		console.error(
			`Serial PRN bridge test send failed: requested port ${portId} does not match active port ${activePortId}`
		);
		return { ok: false, reason: 'port-mismatch' };
	}

	if (!activePortId && portId !== configuredPortId) {
		console.error(
			`Serial PRN bridge test send failed: requested port ${portId} does not match configured port ${configuredPortId || '(none)'}`
		);
		return { ok: false, reason: 'port-mismatch' };
	}

	if (!activePort) {
		console.error(
			`Serial PRN bridge test send failed: no active port object for configured port ${configuredPortId || '(none)'}`
		);
		return { ok: false, reason: 'no-active-port' };
	}

	if (!activePort.isOpen) {
		console.error(`Serial PRN bridge test send failed: active port ${portId} is not open`);
		return { ok: false, reason: 'port-not-open' };
	}

	try {
		await writeToActivePort(data);
		return { ok: true };
	} catch (error) {
		console.error(`Serial PRN bridge failed to write test data to ${portId}:`, error);
		return { ok: false, reason: 'write-error' };
	}
}

export function startSerialPrnBridge() {
	function clearInactivityTimer() {
		if (!inactivityTimer) {
			return;
		}

		clearTimeout(inactivityTimer);
		inactivityTimer = null;
	}

	async function flushPendingBytes() {
		if (pendingBuffer.length === 0) {
			return;
		}

		const bytesToWrite = pendingBuffer;
		pendingBuffer = Buffer.alloc(0);
		const outputPath = createRandomPrnPath();

		await fs.promises.writeFile(outputPath, bytesToWrite);
		console.log(`Serial PRN bridge wrote ${bytesToWrite.length} bytes to ${outputPath}`);
	}

	function scheduleFlush() {
		clearInactivityTimer();
		inactivityTimer = setTimeout(() => {
			flushPendingBytes().catch((error) => {
				console.error('Serial PRN bridge flush failed:', error);
			});
		}, INACTIVITY_MS);
	}

	async function closePort() {
		clearInactivityTimer();
		await flushPendingBytes();

		if (!activePort) {
			return;
		}

		const portToClose = activePort;
		activePort = null;
		activePortId = '';

		await new Promise((resolve) => {
			portToClose.removeAllListeners();
			if (!portToClose.isOpen) {
				resolve();
				return;
			}

			portToClose.close(() => resolve());
		});
	}

	async function openPort(portId) {
		const port = new SerialPort({ path: portId, baudRate: 9600, autoOpen: false });

		port.on('data', (chunk) => {
			pendingBuffer = Buffer.concat([pendingBuffer, chunk]);
			scheduleFlush();
		});

		port.on('error', (error) => {
			console.error(`Serial PRN bridge error on ${portId}:`, error);
		});

		await new Promise((resolve, reject) => {
			port.open((error) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});

		activePort = port;
		activePortId = portId;
		console.log(`Serial PRN bridge listening on ${portId}`);
	}

	async function reconfigurePort(nextPortId) {
		if (nextPortId === configuredPortId) {
			return;
		}

		configuredPortId = nextPortId;
		await closePort();

		if (!configuredPortId) {
			console.log('Serial PRN bridge idle (no configured serial port)');
			return;
		}

		try {
			await openPort(configuredPortId);
		} catch (error) {
			console.error(`Serial PRN bridge failed to open ${configuredPortId}:`, error);
		}
	}

	const pollTimer = setInterval(() => {
		const nextPortId = readConfiguredPortId();
		if (nextPortId === null) {
			return;
		}

		reconfigurePort(nextPortId).catch((error) => {
			console.error('Serial PRN bridge reconfiguration failed:', error);
		});
	}, SETTINGS_POLL_MS);

	const startupPortId = readConfiguredPortId();
	if (startupPortId !== null) {
		reconfigurePort(startupPortId).catch((error) => {
			console.error('Serial PRN bridge startup failed:', error);
		});
	}

	return async () => {
		clearInterval(pollTimer);
		await closePort();
	};
}
