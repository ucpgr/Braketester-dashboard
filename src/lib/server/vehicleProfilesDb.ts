import path from 'path';
import fs from 'fs';
import  Database  from 'better-sqlite3';
import type { MileageUnit, VehicleType } from '$lib/stores/vehicleProfiles';

export type VehicleProfileRow = {
	id: number;
	label: string;
	mileage: string;
	mileage_unit: MileageUnit;
	make: string;
	model: string;
	type: VehicleType;
	reg: string;
};

const dataDir = path.resolve('data');
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'braketester.db');
const db = new Database(dbPath);

db.exec(`
	CREATE TABLE IF NOT EXISTS vehicle_profiles (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		label TEXT NOT NULL,
		mileage TEXT NOT NULL,
		mileage_unit TEXT NOT NULL CHECK(mileage_unit IN ('km', 'mi')),
		make TEXT NOT NULL,
		model TEXT NOT NULL,
		type TEXT NOT NULL CHECK(type IN ('Tractor Unit', 'Trailer')),
		reg TEXT NOT NULL
	)
`);

const existing = db.prepare('SELECT COUNT(*) as count FROM vehicle_profiles').get() as {
	count: number;
};
if ((existing?.count ?? 0) === 0) {
	db.prepare(
		`INSERT INTO vehicle_profiles (label, mileage, mileage_unit, make, model, type, reg)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`
	).run('DAF 6x2', '462,810', 'km', 'DAF', '6x2', 'Tractor Unit', 'AB12 CDE');
}

export async function listVehicleProfiles() {
	const rows = db
		.prepare('SELECT * FROM vehicle_profiles ORDER BY id DESC')
		.all() as VehicleProfileRow[];
	return rows;
}

export async function createVehicleProfile(profile: Omit<VehicleProfileRow, 'id'>) {
	const result = db
		.prepare(
			`INSERT INTO vehicle_profiles (label, mileage, mileage_unit, make, model, type, reg)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		)
		.run(
			profile.label,
			profile.mileage,
			profile.mileage_unit,
			profile.make,
			profile.model,
			profile.type,
			profile.reg
		);

	const row = db
		.prepare('SELECT * FROM vehicle_profiles WHERE id = ?')
		.get(result.lastInsertRowid) as VehicleProfileRow | undefined;

	if (!row) {
		throw new Error('Failed to load created vehicle profile');
	}

	return row;
}
