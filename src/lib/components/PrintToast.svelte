<script lang="ts">
	import { printStage } from '$lib/stores/printStatus';

	const text = {
		receiving: 'LPT: Receiving print data…',
		converting: 'Converting…',
		printing: 'Printing…',
		error: 'Print error'
	};
</script>

{#if $printStage !== 'idle'}
	<div
		class="fixed top-0 left-1/2 -translate-x-1/2 z-50
	       mt-2 px-4 py-2 rounded-md shadow-lg
	       bg-zinc-900 text-zinc-100
	       flex items-center gap-3
	       transition-all duration-200">

		<!-- spinner -->
		<div
			class="h-4 w-4 rounded-full border-2 border-zinc-400
		       border-t-transparent animate-spin" ></div>

		<span class="text-sm">
		{text[$printStage]}
	</span>
	</div>
{/if}
