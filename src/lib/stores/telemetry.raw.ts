import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { socket } from '$lib/socket/client';

export type TelemetryFrame = {
	brakeForceLeft: number;
	brakeForceRight: number;
	ts: number;
};

export const rawTelemetry = writable<TelemetryFrame | null>(null);

if (browser && socket) {
	socket.on('telemetry', (frame: TelemetryFrame) => {
		rawTelemetry.set(frame);
	});
}
