<script lang="ts">
	import GaugeFace from './GaugeFace.svelte';
	import GaugeArc from './GaugeArc.svelte';
	import GaugeNeedle from './GaugeNeedle.svelte';
	import GaugeValue from './GaugeValue.svelte';
	import GaugeGlass from './GaugeGlass.svelte';
	import GaugeScale from './GaugeScale.svelte';

	import { valueToAngle } from './gaugeUtils';



	export let value = 0;
	export let min = 0;
	export let max = 5000;
	export let unit = 'kgf';

	$: angle = valueToAngle(value, min, max, -135, 135);
</script>

<div class="relative w-full aspect-square min-w-[140px] max-w-[320px]">
	<GaugeFace />
	<GaugeArc />
	<GaugeScale min={0} max={5000} />
	<GaugeNeedle {angle} />
	<GaugeValue {value} {unit} />
	<GaugeGlass />
</div>
