import { derived } from 'svelte/store';
import { telemetry } from './telemetry';

export const imbalance = derived(telemetry, t => {
	if (!t) return 0;
	return t.brakeForceRight - t.brakeForceLeft;
});
