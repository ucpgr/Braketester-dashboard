<script lang="ts">
	export let label: string;
	export let state: 'ok' | 'warn' | 'error' | 'off' = 'off';
</script>

<div class="flex items-center gap-2 whitespace-nowrap">
  <span
		class="h-2 w-2 rounded-full
           ring-1 ring-black/40
           {state === 'ok' && 'bg-emerald-500 drop-shadow-[0_0_6px_rgba(0,188,125,0.90)]'}
           {state === 'warn' && 'bg-amber-400 drop-shadow-[0_0_6px_rgba(255,185,0,0.90)]'}
           {state === 'error' && 'bg-red-500 drop-shadow-[0_0_6px_rgba(251,44,54,0.90)]' }
           {state === 'off' && 'bg-zinc-600'}"
	></span>
	<span>{label}</span>
</div>