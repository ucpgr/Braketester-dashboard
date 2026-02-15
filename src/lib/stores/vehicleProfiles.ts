import { writable, derived, get } from 'svelte/store';

export type VehicleType = 'Tractor Unit' | 'Trailer';
export type MileageUnit = 'km' | 'mi';

export type VehicleProfile = {
	id: number;
	label: string;
	mileage: string;
	mileageUnit: MileageUnit;
	make: string;
	model: string;
	type: VehicleType;
	reg: string;
};

type VehicleProfileDraft = Omit<VehicleProfile, 'id'>;

const profiles = writable<VehicleProfile[]>([]);
const selectedId = writable<number | null>(null);

export const vehicleProfiles = derived(profiles, ($profiles) => $profiles);
export const selectedVehicleProfile = derived(
	[profiles, selectedId],
	([$profiles, $selectedId]) => {
		if ($profiles.length === 0) {
			return null;
		}

		const selected = $profiles.find((profile) => profile.id === $selectedId);
		return selected ?? $profiles[0];
	}
);

export const selectedVehicleId = derived(
	[selectedVehicleProfile],
	([$selectedVehicleProfile]) => $selectedVehicleProfile?.id ?? null
);

export async function loadVehicleProfiles() {
	const res = await fetch('/api/vehicle-profiles');
	if (!res.ok) {
		throw new Error('Failed to load vehicle profiles');
	}

	const data = (await res.json()) as { profiles: VehicleProfile[] };
	profiles.set(data.profiles);

	if (data.profiles.length > 0) {
		selectedId.set(data.profiles[0].id);
	}
}

export function selectVehicleProfile(id: number) {
	selectedId.set(id);
}

export async function createVehicleProfile(profile: VehicleProfileDraft) {
	const res = await fetch('/api/vehicle-profiles', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(profile)
	});

	if (!res.ok) {
		throw new Error('Failed to save vehicle profile');
	}

	const data = (await res.json()) as { profile: VehicleProfile };
	profiles.update(($profiles) => [data.profile, ...$profiles]);
	selectedId.set(data.profile.id);
	return data.profile;
}

export function getSelectedVehicleProfile() {
	return get(selectedVehicleProfile);
}
