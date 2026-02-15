<script>
	import { onMount } from 'svelte';
	import {
		createVehicleProfile,
		loadVehicleProfiles,
		selectedVehicleId,
		selectedVehicleProfile,
		selectVehicleProfile,
		vehicleProfiles
	} from '$lib/stores/vehicleProfiles';
	import { Card, CardContent } from '$lib/components/ui/card';

	let modalOpen = false;
	let loading = true;
	let selectedId = 0;

	let draft = {
		label: '',
		mileage: '',
		mileageUnit: 'km',
		make: '',
		model: '',
		type: 'Tractor Unit',
		reg: ''
	};

	onMount(async () => {
		await loadVehicleProfiles();
		loading = false;
	});

	$: if ($selectedVehicleId) {
		selectedId = $selectedVehicleId;
	}

	function openModal() {
		draft = {
			label: '',
			mileage: '',
			mileageUnit: 'km',
			make: '',
			model: '',
			type: 'Tractor Unit',
			reg: ''
		};
		modalOpen = true;
	}

	async function saveProfile() {
		if (
			!draft.label ||
			!draft.make ||
			!draft.model ||
			!draft.type ||
			!draft.reg ||
			!draft.mileage
		) {
			return;
		}

		await createVehicleProfile(draft);
		modalOpen = false;
	}
</script>

<Card
	class="mt-6 border border-white/10 bg-gradient-to-br from-zinc-700/40 via-zinc-800/40 to-zinc-900/40 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
>
	<CardContent class="grid gap-8 p-5 md:grid-cols-[1.2fr_1fr] md:items-center">
		<div class="space-y-4">
			<div class="grid w-full grid-cols-[1fr_auto] items-center gap-3 text-zinc-300">
				<div class="flex items-center gap-2">
					<select
						class="h-9 min-w-44 rounded-md border border-white/15 bg-zinc-800/70 px-3 text-sm font-semibold text-zinc-200"
						bind:value={selectedId}
						on:change={() => selectVehicleProfile(Number(selectedId))}
					>
						{#each $vehicleProfiles as profile (profile.id)}
							<option value={profile.id}>{profile.label}</option>
						{/each}
					</select>
					<button
						type="button"
						class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-zinc-800/70 text-lg text-zinc-200"
						on:click={openModal}
					>
						+
					</button>
				</div>
				<p class="w-full text-right text-[11px] tracking-[0.2em] text-zinc-500">
					Test ID: 2024-04-24-027
				</p>
			</div>

			<div class="space-y-3">
				<div class="flex w-fit items-center gap-2">
					<input
						type="text"
						value={$selectedVehicleProfile?.mileage ?? ''}
						class="h-8 w-32 rounded border border-white/15 bg-zinc-800/75 px-2 text-sm text-zinc-200 outline-none"
						readonly
					/>
					<div
						class="inline-flex h-8 min-w-[84px] shrink-0 overflow-hidden rounded border border-white/15 bg-zinc-800/75"
					>
						<button
							type="button"
							class={`h-full w-10 px-2 text-xs leading-none font-semibold ${$selectedVehicleProfile?.mileageUnit === 'km' ? 'bg-sky-500/25 text-zinc-200' : 'text-zinc-400'}`}
						>
							Km
						</button>
						<button
							type="button"
							class={`h-full w-10 px-2 text-xs leading-none font-semibold ${$selectedVehicleProfile?.mileageUnit === 'mi' ? 'bg-sky-500/25 text-zinc-200' : 'text-zinc-400'}`}
						>
							mi
						</button>
					</div>
				</div>

				<div class="space-y-1.5 text-xl text-zinc-300/90">
					<p><span class="text-zinc-500">Make:</span> {$selectedVehicleProfile?.make ?? '-'}</p>
					<p><span class="text-zinc-500">Model:</span> {$selectedVehicleProfile?.model ?? '-'}</p>
					<p><span class="text-zinc-500">Type:</span> {$selectedVehicleProfile?.type ?? '-'}</p>
					<p><span class="text-zinc-500">Reg:</span> {$selectedVehicleProfile?.reg ?? '-'}</p>
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

{#if modalOpen}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm"
		on:click={() => (modalOpen = false)}
		aria-label="Close modal"
	></button>
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="w-full max-w-md rounded-lg border border-white/15 bg-zinc-900 p-4 shadow-2xl">
			<h3 class="mb-4 text-lg font-semibold text-zinc-200">Add Vehicle</h3>
			<div class="space-y-3 text-sm">
				<input
					class="h-9 w-full rounded border border-white/15 bg-zinc-800/75 px-3 text-zinc-200"
					placeholder="Label"
					bind:value={draft.label}
				/>
				<div class="flex gap-2">
					<input
						class="h-9 w-full rounded border border-white/15 bg-zinc-800/75 px-3 text-zinc-200"
						placeholder="Mileage"
						bind:value={draft.mileage}
					/>
					<div
						class="inline-flex h-9 overflow-hidden rounded border border-white/15 bg-zinc-800/75"
					>
						<button
							type="button"
							class={`w-10 ${draft.mileageUnit === 'km' ? 'bg-sky-500/25 text-zinc-200' : 'text-zinc-400'}`}
							on:click={() => (draft.mileageUnit = 'km')}
						>
							Km
						</button>
						<button
							type="button"
							class={`w-10 ${draft.mileageUnit === 'mi' ? 'bg-sky-500/25 text-zinc-200' : 'text-zinc-400'}`}
							on:click={() => (draft.mileageUnit = 'mi')}
						>
							mi
						</button>
					</div>
				</div>
				<input
					class="h-9 w-full rounded border border-white/15 bg-zinc-800/75 px-3 text-zinc-200"
					placeholder="Make"
					bind:value={draft.make}
				/>
				<input
					class="h-9 w-full rounded border border-white/15 bg-zinc-800/75 px-3 text-zinc-200"
					placeholder="Model"
					bind:value={draft.model}
				/>
				<select
					class="h-9 w-full rounded border border-white/15 bg-zinc-800/75 px-3 text-zinc-200"
					bind:value={draft.type}
				>
					<option value="Tractor Unit">Tractor Unit</option>
					<option value="Trailer">Trailer</option>
				</select>
				<input
					class="h-9 w-full rounded border border-white/15 bg-zinc-800/75 px-3 text-zinc-200"
					placeholder="Reg"
					bind:value={draft.reg}
				/>
			</div>
			<div class="mt-4 flex justify-end gap-2">
				<button
					type="button"
					class="rounded border border-white/15 px-3 py-1.5 text-zinc-300"
					on:click={() => (modalOpen = false)}>Cancel</button
				>
				<button
					type="button"
					class="rounded bg-sky-600 px-3 py-1.5 font-semibold text-white disabled:opacity-50"
					on:click={saveProfile}>Save</button
				>
			</div>
		</div>
	</div>
{/if}

{#if loading}
	<p class="mt-2 text-xs text-zinc-500">Loading vehicles…</p>
{/if}
