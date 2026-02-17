<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let { children } = $props();

	const activeClass =
		'bg-sky-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10 hover:bg-sky-500';
	const inactiveClass =
		'bg-zinc-800 text-zinc-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10 hover:bg-zinc-700';

	function isActive(path) {
		if (path === '/') {
			return page.url.pathname === '/';
		}

		return page.url.pathname.startsWith(path);
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-gradient-to-br from-zinc-900/90 via-zinc-900/95 to-zinc-900/90">
	<!-- Top Bar -->
	<header
		class="sticky top-0 z-50 h-14 border-b border-zinc-600 bg-gradient-to-br from-zinc-700/50 via-zinc-800/60 to-zinc-800/70 drop-shadow-[0_2px_8px_rgba(0,0,0,0.60)] backdrop-blur"
	>
		<div class="relative flex h-full items-center px-4">
			<!-- Left -->
			<div class="flex items-center gap-2">
				<Badge class="border border-emerald-500/30 bg-emerald-600/20 text-emerald-400">
					● Connected
				</Badge>

				<Badge variant="secondary" class="bg-zinc-800 text-zinc-300">ID Str1</Badge>

				<Badge variant="secondary" class="bg-zinc-800 text-zinc-300">ID Str2</Badge>
			</div>

			<!-- Center (absolute to stay centered regardless of sides) -->
			<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
				<h1 class="text-xl font-semibold tracking-wide text-sky-400">Brake Tester</h1>
			</div>

			<!-- Right -->
			<div class="ml-auto flex items-center gap-2">
				<Button href="/" size="sm" class={isActive('/') ? activeClass : inactiveClass}>Live</Button>

				<Button
					href="/settings"
					size="sm"
					variant="secondary"
					class={isActive('/settings') ? activeClass : inactiveClass}
				>
					Settings
				</Button>

				<Button
					href="/results"
					size="sm"
					variant="secondary"
					class={isActive('/results') ? activeClass : inactiveClass}
				>
					Results
				</Button>
			</div>
		</div>
	</header>
	<div class="backdrop-brightness-[1.05]">
		{@render children()}
	</div>
</div>
