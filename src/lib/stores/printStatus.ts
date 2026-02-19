// src/lib/stores/printStatus.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { socket } from '$lib/socket/client';

export type PrintStage =
	| 'idle'
	| 'receiving'
	| 'converting'
	| 'printing'
	| 'error';

export const printStage = writable<PrintStage>('idle');

if (browser && socket) {
	socket.on('print', ({ stage }: { stage: PrintStage | 'done' }) => {
		printStage.set(stage === 'done' ? 'idle' : stage);
	});
}