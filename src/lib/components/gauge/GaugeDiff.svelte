<script lang="ts">
	import GaugeFace from './GaugeFace.svelte';
	import GaugeArcDiff from './GaugeArcDiff.svelte';
	import GaugeNeedle from './GaugeNeedle.svelte';
	import GaugeValue from './GaugeValue.svelte';
	import GaugeGlass from './GaugeGlass.svelte';
	import GaugeScale from './GaugeScale.svelte';

	import { valueToAngle } from './gaugeUtils';

	export let value = 5;
	export let min = -100;
	export let max = 100;
	export let unit = '%';

	$: angle = valueToAngle(value, min, max, -90, 90);
</script>

<div class="relative w-full aspect-square min-w-[140px] max-w-[320px]">
	<GaugeFace />
	<GaugeArcDiff />
	<GaugeScale min={-100} max={100} minAngle={-180} maxAngle={0} />
	<GaugeNeedle angle={angle} />
	<GaugeValue {value} {unit} />
	<GaugeGlass />
</div>
