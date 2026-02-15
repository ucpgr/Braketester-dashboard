<script lang="ts">
	import { valueToAngle } from './gaugeUtils';

	export let min = 0;
	export let max = 5000;

	export let minAngle = -225;
	export let maxAngle = 45;
	export let majorTicks = 5;
	export let minorTicks = 4;

	const cx = 100;
	const cy = 100;
	const rOuter = 80;
	const rMajor = 72;
	const rMinor = 76;
	const rLabel = 60;

	function polarToCartesian(
		cx: number,
		cy: number,
		r: number,
		angleDeg: number
	) {
		const rad = (angleDeg - 90) * Math.PI / 180;
		return {
			x: cx + r * Math.cos(rad),
			y: cy + r * Math.sin(rad)
		};
	}


</script>

<svg
	viewBox="0 0 200 200"
	class="absolute inset-0 pointer-events-none"
	style="transform: rotate(90deg); transform-origin: 50% 50%;"
>
	{#each Array(majorTicks + 1) as _, i}
		{@const value = min + (i / majorTicks) * (max - min)}
		{@const angle = valueToAngle(value, min, max, minAngle, maxAngle)}

		{@const p1 = polarToCartesian(cx, cy, rOuter, angle)}
		{@const p2 = polarToCartesian(cx, cy, rMajor, angle)}
		{@const pl = polarToCartesian(cx, cy, rLabel, angle)}

		<line
			x1={p1.x}
			y1={p1.y}
			x2={p2.x}
			y2={p2.y}
			stroke="rgba(255,255,255,0.7)"
			stroke-width="2"
			stroke-linecap="round"
		/>

		<text
			x={pl.x}
			y={pl.y}
			fill="rgba(255,255,255,0.7)"
			font-size="8"
			text-anchor="middle"
			dominant-baseline="middle"
			style="font-variant-numeric: tabular-nums; transform: rotate(-90deg); transform-origin: {pl.x}px {pl.y}px;"
		>
			{Math.round(value)}
		</text>


		{#if i < majorTicks}
			{#each Array(minorTicks) as _, j}
				{@const v =
					value +
					((j + 1) / (minorTicks + 1)) * (max - min) / majorTicks}
				{@const a = valueToAngle(v, min, max, minAngle, maxAngle)}

				{@const m1 = polarToCartesian(cx, cy, rOuter, a)}
				{@const m2 = polarToCartesian(cx, cy, rMinor, a)}

				<line
					x1={m1.x}
					y1={m1.y}
					x2={m2.x}
					y2={m2.y}
					stroke="rgba(255,255,255,0.4)"
					stroke-width="1"
					stroke-linecap="round"
				/>
			{/each}
		{/if}
	{/each}
</svg>
