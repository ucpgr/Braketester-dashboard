<script lang="ts">
	import Gauge from '$lib/components/gauge/Gauge.svelte';
	import GaugeDiff from '$lib/components/gauge/GaugeDiff.svelte';
	import TextWeight from '$lib/components/TextWeight/TextWeight.svelte';
	import StatusIndicator from '$lib/components/StatusIndicator/StatusIndicator.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { telemetry } from '$lib/stores/telemetry';
	import { imbalance } from '$lib/stores/imbalance';
</script>

<div class="mx-auto mt-10 max-w-6xl">
	<Card
		class="p-0 bg-gradient-to-br from-zinc-700/40 via-zinc-800/40 to-zinc-900/40
           border border-white/10
           shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
	>
		<CardContent class="p-0 w-full aspect-[3/1] max-h-[400px]">
			<div class="flex flex-col h-full">

				<!-- Main gauge area -->
				<div class="flex-1 min-h-0">
					<div class="flex items-stretch gap-8 w-full h-full overflow-hidden">

						<!-- Left gauge -->
						<div class="flex-1 min-w-0 flex items-center justify-center">
							<Gauge value={$telemetry?.brakeForceLeft ?? 0} min={0} max={5000} unit="kgf" />
						</div>

						<!-- Centre column -->
						<div class="flex flex-col flex-1 min-w-0 min-h-0">

							<!-- Top + centre gauge cluster -->
							<div class="shrink-0 pt-2 flex justify-center">
								<div
									class="
										grid
										grid-cols-2
										grid-rows-[auto_auto]
										gap-3
										place-items-center
										w-full
									"
								>
									<!-- Top-left small gauge -->
									<div class="scale-75">
										<GaugeDiff value={-8} />
									</div>

									<!-- Top-right small gauge -->
									<div class="scale-75">
										<GaugeDiff value={12} />
									</div>

									<!-- Centre gauge (spans both columns) -->
									<div class="col-span-2 w-1/2 max-w-[50%]">
										<GaugeDiff value={$imbalance ?? 0} />
									</div>
								</div>
							</div>

							<div class="flex-1 min-h-0"></div>

						</div>

						<!-- Right gauge -->
						<div class="flex-1 min-w-0 flex items-center justify-center">
							<Gauge value={$telemetry?.brakeForceRight ?? 0} min={0} max={5000} unit="kgf" />
						</div>
					</div>
				</div>

				<!-- Footer -->
				<div class="shrink-0">
					<div class="h-px bg-white/10"></div>
					<div
						class="flex items-center justify-between
               px-4 py-2
               text-[clamp(0.7rem,0.9vw,0.85rem)]
               text-zinc-400"
					>
						<div class="flex items-center gap-5">
							<StatusIndicator label="Detected" state="ok" />
							<StatusIndicator label="Rolling" state="ok" />
						</div>

						<TextWeight />

						<div class="flex items-center gap-5">
							<StatusIndicator label="Detected" state="ok" />
							<StatusIndicator label="Motor" state="warn" />
						</div>
					</div>
				</div>

			</div>
		</CardContent>
	</Card>
</div>
