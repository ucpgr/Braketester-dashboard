import type { Handle } from '@sveltejs/kit';
import { initBrakeTester } from '$lib/bus/brakeTesterService.js';

let started = false;

export const handle: Handle = async ({ event, resolve }) => {
	// Initialise ONCE when the Node server boots
	if (!started) {
		started = true;

		initBrakeTester();
	}


	return resolve(event);
};
