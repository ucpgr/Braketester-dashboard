<script lang="ts">
	export let angle = 0;
</script>

<div
	class="transition-transform duration-300 ease-out
         absolute inset-0 flex items-center justify-center"
	style={`transform: rotate(${angle}deg)`}
>

		<div class="w-[10%] h-[10%] rounded-full bg-zinc-300 shadow-inner"></div>

			<div
				class="absolute bottom-1/2 left-1/2 -translate-x-3/5 -translate-y-1/6 w-[1%] h-[30%] bg-zinc-200 rounded-full shadow-md"
			>
		</div>
</div>