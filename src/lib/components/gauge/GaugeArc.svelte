<script>
	import { arcPath } from './gaugeUtils.ts';
</script>

<svg
	viewBox="0 0 200 200"
	class="absolute inset-0"
>
	<defs>
		<linearGradient id="gaugeArcGradient" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0%" stop-color="#22c55e" />
			<stop offset="60%" stop-color="#eab308" />
			<stop offset="100%" stop-color="#f97316" />
		</linearGradient>
	</defs>

	<!-- Arc correctly centred inside the gauge -->
	<path
		d={arcPath(100, 100, 80, -225, 45)}
		fill="none"
		stroke="url(#gaugeArcGradient)"
		stroke-width="10"
		stroke-linecap="round"
	/>
</svg>
