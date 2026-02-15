import http from 'http';
import { Server } from 'socket.io';

// IMPORTANT: named export
import { handler } from './build/handler.js';

// REQUIRED: adapter-node environment setup
import './build/env.js';

import { watchPrnFolder } from './server/prnWatcher.js';

watchPrnFolder('/opt/printqueue/incoming', () => ({
	user: {
		line1: 'Delphic',
		line2: 'test1',
		line3: 'test2'
	},
	vehicle: {
		licence: 'AB12 CDE',
		make: 'Volvo',
		model: 'FH16',
		milage: '123456'
	}
}));

const server = http.createServer((req, res) => {
	handler(req, res);
});

// Socket.IO
const io = new Server(server, {
	cors: { origin: '*' }
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
