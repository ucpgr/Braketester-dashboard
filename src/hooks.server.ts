import type { Handle } from '@sveltejs/kit';
import { Server } from 'socket.io';
import { initBrakeTester } from '$lib/bus/brakeTesterService.js';

let io: Server | null = null;
let started = false;

export const handle: Handle = async ({ event, resolve }) => {
	// Initialise ONCE when the Node server boots
	if (!started) {
		started = true;

		initBrakeTester();

		const httpServer = event.platform?.server;

		if (!httpServer) {
			console.warn('Socket.IO not started (non-node adapter)');
		} else {
			io = new Server(httpServer, {
				cors: { origin: '*' }
			});

			console.log('Socket.IO attached');

			// ---- Fake telemetry generator ----
			const FPS = 30;
			const DT = 1 / FPS;
			const MAX = 5000;
			let t = 0;

			setInterval(() => {
				t += DT;

				const left =
					(Math.sin(2 * Math.PI * 0.5 * t) * 0.5 + 0.5) * MAX;

				const right =
					(Math.sin(2 * Math.PI * 0.5 * t + Math.PI / 6) * 0.5 + 0.5) * MAX;

				io!.emit('telemetry', {
					brakeForceLeft: Math.round(left),
					brakeForceRight: Math.round(right),
					ts: Date.now()
				});
			}, 1000 / FPS);

			io.on('connection', (socket) => {
				console.log('Client connected:', socket.id);
				socket.on('disconnect', () => {
					console.log('Client disconnected:', socket.id);
				});
			});
		}
	}

	return resolve(event);
};
