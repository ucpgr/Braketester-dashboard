import http from 'http';

// IMPORTANT: named export
import { handler } from './build/handler.js';
import { initSocketIO } from './server/server.js';
// REQUIRED: adapter-node environment setup
import './build/env.js';

import { startSerialPrnBridge } from './server/serialPrnBridge.mjs';
import { registerPrintEmitter } from './server/printEmitter.js';

startSerialPrnBridge();


const server = http.createServer((req, res) => {
	handler(req, res);
});

// Socket.IO
const io = initSocketIO(server);

registerPrintEmitter((stage) => {
	io.emit('print', { stage });
});


// Fake telemetry @ 30 Hz
let t = 0;
setInterval(() => {
	t += 1 / 30;
	io.emit('telemetry', {
		brakeForceLeft: Math.round((Math.sin(t) * 0.5 + 0.5) * 5000),
		brakeForceRight: Math.round((Math.sin(t + 0.4) * 0.5 + 0.5) * 5000),
		ts: Date.now()
	});
}, 33);

const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, () => {
	console.log(`BrakeTester running on port ${PORT}`);
});
