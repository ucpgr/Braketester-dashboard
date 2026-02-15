<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
</script>

<Card
	class="mt-6 border border-white/10 bg-gradient-to-br from-zinc-700/40 via-zinc-800/40 to-zinc-900/40 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
>
	<CardContent class="grid gap-8 p-5 md:grid-cols-[1.2fr_1fr] md:items-center">
		<div class="space-y-4">
			<div class="grid w-full grid-cols-[auto_1fr] items-center gap-3 text-zinc-300">
				<div
					class="inline-flex min-w-44 items-center justify-between gap-3 rounded-md border border-white/15 bg-zinc-800/70 px-3 py-2 text-sm font-semibold"
				>
					<span>DAF 6x2</span>
					<span class="text-xs text-zinc-500">▼</span>
				</div>
				<p class="w-full text-right text-[11px] tracking-[0.2em] text-zinc-500">
					Test ID: 2024-04-24-027
				</p>
			</div>

			<div class="space-y-3">
				<div class="flex w-fit items-center gap-2">
					<input
						type="text"
						value="462,810"
						class="h-8 w-32 rounded border border-white/15 bg-zinc-800/75 px-2 text-sm text-zinc-200 outline-none"
						readonly
					/>
					<div
						class="inline-flex h-8 min-w-[84px] shrink-0 overflow-hidden rounded border border-white/15 bg-zinc-800/75"
					>
						<button
							type="button"
							class="h-full w-10 bg-sky-500/25 px-2 text-xs leading-none font-semibold text-zinc-200"
						>
							Km
						</button>
						<button
							type="button"
							class="h-full w-10 px-2 text-xs leading-none font-semibold text-zinc-400">mi</button
						>
					</div>
				</div>

				<div class="space-y-1.5 text-xl text-zinc-300/90">
					<p><span class="text-zinc-500">Make:</span> DAF</p>
					<p><span class="text-zinc-500">Model:</span> 6x2</p>
					<p><span class="text-zinc-500">Type:</span> Tractor Unit</p>
					<p><span class="text-zinc-500">Reg:</span> AB12 CDE</p>
				</div>
			</div>
		</div>

		<div class="relative mx-auto w-full max-w-[430px]">
			<div class="h-28 rounded-xl border border-sky-400/20 bg-sky-500/5 p-3">
				<div class="grid h-full grid-cols-[0.8fr_2.2fr] items-center gap-3">
					<div class="h-full rounded-lg border border-white/10 bg-zinc-900/60"></div>
					<div class="relative h-full rounded-lg border border-white/10 bg-zinc-900/55">
						<div class="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-white/15"></div>
						<div class="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-white/15"></div>
					</div>
				</div>
			</div>

			<div class="pointer-events-none absolute inset-0">
				<div
					class="absolute top-0 left-[43%] -translate-y-1/2 rounded bg-emerald-500 px-2 py-0.5 text-xs font-bold text-zinc-950"
				>
					PASS
				</div>
				<div
					class="absolute bottom-0 left-[43%] translate-y-1/2 rounded bg-emerald-500 px-2 py-0.5 text-xs font-bold text-zinc-950"
				>
					PASS
				</div>
				<div
					class="absolute top-0 right-0 -translate-y-1/2 rounded bg-rose-500 px-2 py-0.5 text-xs font-bold text-rose-50"
				>
					FAIL
				</div>
				<div
					class="absolute right-0 bottom-0 translate-y-1/2 rounded bg-rose-500 px-2 py-0.5 text-xs font-bold text-rose-50"
				>
					FAIL
				</div>
			</div>

			<div class="absolute inset-x-0 top-1/2 -translate-y-1/2 px-16">
				<div class="grid grid-cols-3 gap-3">
					<div class="flex items-center justify-between">
						<div class="h-5 w-2 rounded-full bg-zinc-500/70"></div>
						<div class="h-5 w-2 rounded-full bg-zinc-500/70"></div>
					</div>
					<div class="flex items-center justify-between">
						<div class="h-5 w-2 rounded-full bg-zinc-500/70"></div>
						<div class="h-5 w-2 rounded-full bg-zinc-500/70"></div>
					</div>
					<div class="flex items-center justify-between">
						<div class="h-5 w-2 rounded-full bg-zinc-500/70"></div>
						<div class="h-5 w-2 rounded-full bg-zinc-500/70"></div>
					</div>
				</div>
			</div>
		</div>
	</CardContent>
</Card>
