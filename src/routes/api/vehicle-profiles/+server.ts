import { json } from '@sveltejs/kit';
import { createVehicleProfile, listVehicleProfiles } from '$lib/server/vehicleProfilesDb';
import type { MileageUnit, VehicleType } from '$lib/stores/vehicleProfiles';

function toClientProfile(row: {
	id: number;
	label: string;
	mileage: string;
	mileage_unit: MileageUnit;
	make: string;
	model: string;
	type: VehicleType;
	reg: string;
}) {
	return {
		id: row.id,
		label: row.label,
		mileage: row.mileage,
		mileageUnit: row.mileage_unit,
		make: row.make,
		model: row.model,
		type: row.type,
		reg: row.reg
	};
}

export async function GET() {
	const profiles = await listVehicleProfiles();
	return json({ profiles: profiles.map(toClientProfile) });
}

export async function POST({ request }) {
	const body = (await request.json()) as {
		label?: string;
		mileage?: string;
		mileageUnit?: MileageUnit;
		make?: string;
		model?: string;
		type?: VehicleType;
		reg?: string;
	};

	if (!body.label || !body.make || !body.model || !body.type || !body.reg || !body.mileage) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	if (!['km', 'mi'].includes(body.mileageUnit ?? '')) {
		return json({ error: 'Invalid mileage unit' }, { status: 400 });
	}

	if (!['Tractor Unit', 'Trailer'].includes(body.type)) {
		return json({ error: 'Invalid vehicle type' }, { status: 400 });
	}

	const profile = await createVehicleProfile({
		label: body.label,
		mileage: body.mileage,
		mileage_unit: body.mileageUnit,
		make: body.make,
		model: body.model,
		type: body.type,
		reg: body.reg
	});

	return json({ profile: toClientProfile(profile) }, { status: 201 });
}
