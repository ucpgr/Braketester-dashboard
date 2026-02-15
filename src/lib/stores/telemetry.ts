import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { rawTelemetry, type TelemetryFrame } from './telemetry.raw';

export const telemetry = writable<TelemetryFrame | null>(null);

if (browser) {
	let latest: TelemetryFrame | null = null;

	rawTelemetry.subscribe(v => {
		latest = v;
	});

	function pump() {
		if (latest) {
			telemetry.set(latest);
		}
		requestAnimationFrame(pump);
	}

	pump();
}
