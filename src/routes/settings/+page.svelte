<script lang="ts">
	import { onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	type SerialPortOption = {
		id: string;
	};

	let ports: SerialPortOption[] = [];
	let selectedPortId = '';
	let isLoading = true;
	let error = '';

	$: displayPorts =
		selectedPortId && !ports.some((port) => port.id === selectedPortId)
			? [{ id: selectedPortId }, ...ports]
			: ports;

	async function loadSettings() {
		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/settings/serial-port');
			if (!response.ok) {
				throw new Error('Failed to load serial port settings');
			}

			const payload = (await response.json()) as {
				ports: SerialPortOption[];
				selectedPortId: string;
			};

			ports = payload.ports;
			selectedPortId = payload.selectedPortId;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load settings';
		} finally {
			isLoading = false;
		}
	}

	async function onSerialPortChange(event: Event) {
		const nextValue = (event.currentTarget as HTMLSelectElement).value;
		selectedPortId = nextValue;
		error = '';

		const response = await fetch('/api/settings/serial-port', {
			method: 'PUT',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ selectedPortId: nextValue })
		});

		if (!response.ok) {
			error = 'Failed to save serial port setting';
		}
	}

	onMount(loadSettings);
</script>

<div class="mx-auto mt-10 max-w-4xl px-4">
	<Card
		class="border border-white/10 bg-gradient-to-br from-zinc-700/40 via-zinc-800/40 to-zinc-900/40"
	>
		<CardHeader>
			<CardTitle class="text-zinc-100">Connection</CardTitle>
		</CardHeader>
		<CardContent>
			{#if isLoading}
				<p class="text-sm text-zinc-300">Loading settings...</p>
			{:else}
				<div class="flex items-center gap-4">
					<label for="lpt-serial-port" class="text-sm font-medium text-zinc-200"
						>LPT Serial Port</label
					>
					<select
						id="lpt-serial-port"
						class="min-w-56 rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
						bind:value={selectedPortId}
						on:change={onSerialPortChange}
					>
						<option value="" disabled>Select a serial port</option>
						{#each displayPorts as port}
							<option value={port.id}>{port.id}</option>
						{/each}
					</select>
				</div>
			{/if}

			{#if error}
				<p class="mt-3 text-sm text-rose-300">{error}</p>
			{/if}
		</CardContent>
	</Card>
</div>
