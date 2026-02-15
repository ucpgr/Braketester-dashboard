// src/lib/telemetry.ts
import { writable } from 'svelte/store';
import { socket } from './socket';

export const rawTelemetry = writable(null);

socket.on('telemetry', (data) => {
	rawTelemetry.set(data);
});
