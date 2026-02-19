import fs from 'fs';
import path from 'path';
import { SerialPort } from 'serialport';

/* ===================== STATE ===================== */

let port = null;
let activePath = '';
let isOpeningOrClosing = false;

/* ===================== HELPERS ===================== */

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

/**
 * List serial devices using /dev/serial/by-id
 */
async function listPorts() {
	const base = '/dev/serial/by-id';
	if (!fs.existsSync(base)) return [];
	const entries = await fs.promises.readdir(base);
	return entries.map((e) => path.join(base, e));
}

/**
 * Fully block until port is closed and kernel settles.
 */
async function closePortBlocking() {
	if (!port) return;

	isOpeningOrClosing = true;

	await new Promise((res) => port.close(res));
	port.removeAllListeners();

	port = null;
	activePath = '';

	// allow kernel to release lock
	await sleep(250);

	isOpeningOrClosing = false;
}

/**
 * Fully block until port is open or fails.
 * Idempotent: opening the same already-open port succeeds.
 */
async function openPortBlocking(devicePath, baudRate = 115200) {
	if (isOpeningOrClosing) {
		throw new Error('port-busy');
	}

	// ✅ idempotent open
	if (port && activePath === devicePath && port.isOpen) {
		return;
	}

	isOpeningOrClosing = true;

	// Close current port first (we are the sole owner)
	if (port) {
		await closePortBlocking();
	}

	const nextPort = new SerialPort({
		path: devicePath,
		baudRate,
		autoOpen: false
	});

	// 🔴 THIS WAS MISSING
	// Forward incoming serial data to parent
	nextPort.on('data', (chunk) => {
		process.send({
			event: 'data',
			bytes: chunk
		});
	});

	await new Promise((res, rej) =>
		nextPort.open((err) => (err ? rej(err) : res()))
	);

	port = nextPort;
	activePath = devicePath;

	isOpeningOrClosing = false;
}

/* ===================== IPC ===================== */

process.on('message', async (msg) => {
	try {
		switch (msg.type) {
			case 'list-ports': {
				const ports = await listPorts();
				process.send({ ok: true, ports });
				break;
			}

			case 'status': {
				process.send({
					ok: true,
					open: !!port,
					path: activePath || null
				});
				break;
			}

			case 'open': {
				await openPortBlocking(msg.path, msg.baudRate);
				process.send({ ok: true });
				break;
			}

			case 'close': {
				await closePortBlocking();
				process.send({ ok: true });
				break;
			}

			case 'write': {
				if (!port || !port.isOpen) {
					process.send({ ok: false, reason: 'port-not-open' });
					return;
				}

				await new Promise((res, rej) =>
					port.write(msg.data, (err) => (err ? rej(err) : res()))
				);

				process.send({ ok: true });
				break;
			}

			default:
				process.send({ ok: false, reason: 'unknown-command' });
		}
	} catch (err) {
		process.send({
			ok: false,
			reason: err.message || 'error'
		});
	}
});

/* ===================== CLEAN SHUTDOWN ===================== */

process.on('SIGTERM', async () => {
	try {
		await closePortBlocking();
	} finally {
		process.exit(0);
	}
});
