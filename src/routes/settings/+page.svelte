<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	type SerialPortOption = {
		id: string;
	};

	type TestSendStatus = 'idle' | 'success' | 'failed';

	let ports: SerialPortOption[] = [];
	let selectedPortId = '';
	let isLoading = true;
	let error = '';
	let isTesting = false;
	let testSendStatus: TestSendStatus = 'idle';
	let testCooldownEndsAt = 0;
	let now = Date.now();
	let countdownTimer: ReturnType<typeof setInterval> | null = null;

	$: remainingTestCooldownSeconds = Math.max(0, Math.ceil((testCooldownEndsAt - now) / 1000));
	$: isTestCoolingDown = remainingTestCooldownSeconds > 0;
	$: testButtonLabel = isTesting
		? '...'
		: isTestCoolingDown
			? `${remainingTestCooldownSeconds}s`
			: 'Test';
	$: testSendStatusLabel = testSendStatus === 'success' ? 'Send succeeded' : 'Send failed';

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
		testSendStatus = 'idle';

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

	function startCooldown() {
		testCooldownEndsAt = Date.now() + 30_000;
		now = Date.now();

		if (countdownTimer) {
			clearInterval(countdownTimer);
		}

		countdownTimer = setInterval(() => {
			now = Date.now();

			if (now >= testCooldownEndsAt && countdownTimer) {
				clearInterval(countdownTimer);
				countdownTimer = null;
			}
		}, 250);
	}

	async function onTestSerialPort() {
		if (!selectedPortId || isTestCoolingDown || isTesting) {
			return;
		}

		error = '';
		testSendStatus = 'idle';
		isTesting = true;

		const timeoutController = new AbortController();
		const timeoutHandle = setTimeout(() => {
			timeoutController.abort();
		}, 5000);

		try {
			const response = await fetch('/api/settings/serial-port', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify({ selectedPortId }),
				signal: timeoutController.signal
			});

			if (!response.ok) {
				error = 'Failed to send test command';
				testSendStatus = 'failed';
				return;
			}

			testSendStatus = 'success';
			startCooldown();
		} catch (err) {
			error =
				err instanceof Error && err.name === 'AbortError'
					? 'Test command timed out'
					: 'Failed to send test command';
			testSendStatus = 'failed';
		} finally {
			clearTimeout(timeoutHandle);
			isTesting = false;
		}
	}

	onMount(loadSettings);

	onDestroy(() => {
		if (countdownTimer) {
			clearInterval(countdownTimer);
		}
	});
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
					<Button
						type="button"
						on:click={onTestSerialPort}
						disabled={!selectedPortId || isTestCoolingDown || isTesting}
						variant="secondary"
					>
						{testButtonLabel}
					</Button>
					{#if testSendStatus !== 'idle'}
						<span
							class="text-sm {testSendStatus === 'success' ? 'text-emerald-400' : 'text-rose-400'}"
						>
							{testSendStatusLabel}
						</span>
					{/if}
				</div>
			{/if}

			{#if error}
				<p class="mt-3 text-sm text-rose-300">{error}</p>
			{/if}
		</CardContent>
	</Card>
</div>
