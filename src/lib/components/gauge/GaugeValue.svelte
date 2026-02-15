<script lang="ts">
	export let value: number;
	export let unit = 'kgf';
</script>

<div class="absolute inset-0 flex flex-col items-center justify-center translate-y-[20%]">
	<div
		class="font-semibold text-zinc-100 leading-none tracking-tight
           drop-shadow-[0_0_6px_rgba(255,255,255,0.90)]
           text-[clamp(0.5rem,3vw,1.5rem)]"
		style="font-variant-numeric: tabular-nums"
	>
		{value.toLocaleString()}
	</div>

	<div
		class="mt-1 tracking-wide text-zinc-400
           text-[clamp(0.3rem,1.0vw,0.6rem)]"
	>
		{unit}
	</div>
</div>
