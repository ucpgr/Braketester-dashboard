import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Database from 'better-sqlite3';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import { patchPrnBuffer } from './prnPatch.js';
import { getPatchData } from './prnData.js';
import { spawnSync } from "child_process";
import { emitPrint } from './printEmitter.js';

/* ===================== DEBUG ===================== */

const debug = false;
const log = (...args) => debug && console.log('[serialPrnBridge]', ...args);

/* ===================== GLOBAL SINGLETON ===================== */

const GLOBAL_KEY = Symbol.for('braketester.serialPrnBridge');

const state =
	globalThis[GLOBAL_KEY] ??
	(globalThis[GLOBAL_KEY] = {
		worker: null,
		activePortId: '',
		status: 'closed', // closed | opening | open | error
		lastError: '',
		buffer: Buffer.alloc(0),
		flushTimer: null,
		lastTestAt: 0,
		ipcQueue: Promise.resolve()
	});

/* ===================== PATHS ===================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DB_PATH = '/opt/braketester/data/braketester.db';
const WORKER_PATH = path.join(PROJECT_ROOT, 'server', 'serial-worker.js');

const SETTING_KEY = 'lpt_serial_port';
const PRN_OUTPUT_DIR = '/opt/printqueue/incoming';
const INACTIVITY_MS = 2000;
const TEST_COOLDOWN_MS = 30_000;


/* ===================== DB ===================== */

function withDb(fn) {
	log('DB open', DB_PATH);
	const db = new Database(DB_PATH);
	try {
		return fn(db);
	} finally {
		db.close();
		log('DB close');
	}
}

function getSavedPort() {
	log('getSavedPort');
	return withDb((db) => {
		const row = db
			.prepare('SELECT value FROM app_settings WHERE key = ?')
			.get(SETTING_KEY);
		return typeof row?.value === 'string' ? row.value.trim() : '';
	});
}

function savePort(portId) {
	log('savePort', portId);
	withDb((db) => {
		db.prepare(
			`INSERT INTO app_settings (key, value)
			 VALUES (?, ?)
			 ON CONFLICT(key) DO UPDATE SET value = excluded.value`
		).run(SETTING_KEY, portId);
	});
}

/* ===================== PRN CAPTURE ===================== */

/*function flushBuffer() {
	log('flushBuffer', state.buffer.length);
	if (!state.buffer.length) return;

	const input = state.buffer;
	state.buffer = Buffer.alloc(0);

	try {
		const patched = patchPrnBuffer(input, getPatchData());

		fs.mkdirSync(PRN_OUTPUT_DIR, { recursive: true });
		const outPath = path.join(
			PRN_OUTPUT_DIR,
			`${crypto.randomUUID()}.pr2`
		);

		fs.writeFileSync(outPath, patched);
		log('PR2 written', outPath);
	}
	catch (err) {
		log('patch failed, buffer dropped', err);
	}
}*/

function flushBuffer() {
	log("flushBuffer", state.buffer.length);
	if (!state.buffer.length) return;

	const input = state.buffer;
	state.buffer = Buffer.alloc(0);

	try {
		emitPrint('converting');
		const patched = patchPrnBuffer(input, getPatchData());

		fs.mkdirSync(PRN_OUTPUT_DIR, { recursive: true });

		const outPath = path.join(
			PRN_OUTPUT_DIR,
			`${crypto.randomUUID()}.tiff`
		);

		// PRN → PNM
		const esc = spawnSync(
			"prnToBMP",
			[],
			{
				input: patched,
				maxBuffer: 50 * 1024 * 1024
			}
		);

		if (esc.status !== 0) {
			throw new Error(`prnToBMP failed: ${esc.stderr?.toString()}`);
		}

		// PNM → 1-bit TIFF (Group 4)
		const magick = spawnSync(
			"magick",
			[
				"pnm:-",
				"-monochrome",
				"-compress", "Group4",
				outPath
			],
			{
				input: esc.stdout,
				maxBuffer: 50 * 1024 * 1024
			}
		);

		if (magick.status !== 0) {
			throw new Error(`magick failed: ${magick.stderr?.toString()}`);
		}

		log("TIFF written", outPath);

		emitPrint('printing');
		// ---- PRINT ----
		/*const lp = spawnSync(
			"lp",
			[
				"-o", "media=A4",
				"-o", "fit-to-page",
				outPath
			],
			{
				stdio: "inherit"
			}
		);

		if (lp.status !== 0) {
			throw new Error("lp failed");
		}*/
		emitPrint('done');
		log("Printed", outPath);
	}
	catch (err) {
		log("render/print failed, buffer dropped", err);
		emitPrint('error');
	}
}




function scheduleFlush() {
	log('scheduleFlush');
	if (state.flushTimer) clearTimeout(state.flushTimer);
	state.flushTimer = setTimeout(flushBuffer, INACTIVITY_MS);
}

/* ===================== WORKER / IPC ===================== */

function ensureWorker() {
	if (state.worker) return;

	log('Spawning serial-worker');
	state.worker = fork(WORKER_PATH);

	state.worker.on('message', (msg) => {
		//log('worker → parent', msg);

		if (msg.event === 'data') {
			if (state.buffer.length === 0) {
				emitPrint('receiving');
			}
			state.buffer = Buffer.concat([state.buffer, Buffer.from(msg.bytes)]);
			scheduleFlush();
		}
	});

	state.worker.on('exit', (code) => {
		log('serial-worker exited', code);
		state.worker = null;
		state.status = 'error';
		state.lastError = 'worker-exited';
	});
}

function sendWorker(msg) {
	log('sendWorker', msg);
	ensureWorker();

	state.ipcQueue = state.ipcQueue.then(
		() =>
			new Promise((resolve, reject) => {
				const onMessage = (reply) => {
					state.worker.off('message', onMessage);
					log('worker reply', reply);
					reply.ok ? resolve(reply) : reject(reply);
				};

				state.worker.on('message', onMessage);
				state.worker.send(msg);
			})
	);

	return state.ipcQueue;
}

/* ===================== SERIAL CONTROL ===================== */

export async function openPort(portId) {
	log('openPort()', portId);

	if (!portId) return;

	state.status = 'opening';
	state.lastError = '';

	try {
		await sendWorker({ type: 'open', path: portId });
		state.activePortId = portId;
		state.status = 'open';
		savePort(portId);
		log('openPort success', portId);
	} catch (err) {
		state.status = 'error';
		state.lastError = err.reason || 'open-failed';
		log('openPort failed', err);
	}
}

export async function closePort() {
	log('closePort()');

	try {
		await sendWorker({ type: 'close' });
		log('closePort success');
	} catch (err) {
		log('closePort error (ignored)', err);
	}

	state.activePortId = '';
	state.status = 'closed';
}

/* ===================== TEST SEND ===================== */

export async function sendTestByte() {
	log('sendTestByte()');

	const now = Date.now();

	if (state.status !== 'open') {
		log('sendTestByte: port not open');
		return { ok: false, reason: 'port-not-open' };
	}

	if (now - state.lastTestAt < TEST_COOLDOWN_MS) {
		const retryAfterMs = TEST_COOLDOWN_MS - (now - state.lastTestAt);
		log('sendTestByte: cooldown', retryAfterMs);
		return {
			ok: false,
			reason: 'cooldown',
			retryAfterMs
		};
	}

	try {
		await sendWorker({ type: 'write', data: 't' });
		state.lastTestAt = now;
		log('sendTestByte success');
		return { ok: true };
	} catch (err) {
		state.status = 'error';
		state.lastError = err.reason || 'write-failed';
		log('sendTestByte failed', err);
		return { ok: false, reason: state.lastError };
	}
}

/* ===================== STATUS ===================== */

export function getStatus() {
	log('getStatus()');
	return {
		status: state.status,
		activePortId: state.activePortId,
		lastError: state.lastError
	};
}

export function getActivePortId() {
	log('getActivePortId()');
	return state.activePortId;
}

/* ===================== STARTUP ===================== */

export async function startSerialPrnBridge() {
	log('startSerialPrnBridge()');

	ensureWorker();

	const savedPort = getSavedPort();
	if (!savedPort) {
		log('no saved port');
		return;
	}

	await openPort(savedPort);
}

export async function listSerialPorts() {
	log('listSerialPorts()');

	try {
		const reply = await sendWorker({ type: 'list-ports' });

		// Worker returns absolute paths
		const ports = reply.ports ?? [];

		log('listSerialPorts result', ports);

		return ports.map((p) => ({ id: p }));
	} catch (err) {
		log('listSerialPorts failed', err);
		return [];
	}
}
