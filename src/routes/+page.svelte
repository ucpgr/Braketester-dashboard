<script lang="ts">
	import Gauge from '$lib/components/gauge/Gauge.svelte';
	import GaugeDiff from '$lib/components/gauge/GaugeDiff.svelte';
	import TextWeight from '$lib/components/TextWeight/TextWeight.svelte';
	import StatusIndicator from '$lib/components/StatusIndicator/StatusIndicator.svelte';
	import TestDetailsCard from '$lib/components/TestDetailsCard.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { telemetry } from '$lib/stores/telemetry';
	import { imbalance } from '$lib/stores/imbalance';
</script>

<div class="mx-auto mt-10 max-w-6xl">
	<Card
		class="border border-white/10 bg-gradient-to-br from-zinc-700/40 via-zinc-800/40
           to-zinc-900/40 p-0
           shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
	>
		<CardContent class="aspect-[3/1] max-h-[400px] w-full p-0">
			<div class="flex h-full flex-col">
				<!-- Main gauge area -->
				<div class="min-h-0 flex-1">
					<div class="flex h-full w-full items-stretch gap-8 overflow-hidden">
						<!-- Left gauge -->
						<div class="flex min-w-0 flex-1 items-center justify-center">
							<Gauge value={$telemetry?.brakeForceLeft ?? 0} min={0} max={5000} unit="kgf" />
						</div>

						<!-- Centre column -->
						<div class="flex min-h-0 min-w-0 flex-1 flex-col">
							<!-- Top + centre gauge cluster -->
							<div class="flex shrink-0 justify-center pt-2">
								<div
									class="
										grid
										w-full
										grid-cols-2
										grid-rows-[auto_auto]
										place-items-center
										gap-3
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

							<div class="min-h-0 flex-1"></div>
						</div>

						<!-- Right gauge -->
						<div class="flex min-w-0 flex-1 items-center justify-center">
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

	<TestDetailsCard />
</div>
