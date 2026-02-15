import { browser } from '$app/environment';
import { io, type Socket } from 'socket.io-client';

export let socket: Socket | null = null;

if (browser) {
	socket = io({
		transports: ['websocket']
	});
}
