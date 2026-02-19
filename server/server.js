
import { Server } from 'socket.io';

let io = null;

export function initSocketIO(httpServer) {
	if (!io) {
		io = new Server(httpServer, {
			cors: { origin: '*' }
		});
		console.log('Socket.IO attached');
	}
	return io;
}

export function getIO() {
	if (!io) {
		throw new Error('Socket.IO not initialised');
	}
	return io;
}

