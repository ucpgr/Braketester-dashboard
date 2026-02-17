import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dataDir = path.resolve('data');
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'braketester.db');
const db = new Database(dbPath);

const SERIAL_PORT_SETTING_KEY = 'lpt_serial_port';

db.exec(`
	CREATE TABLE IF NOT EXISTS app_settings (
		key TEXT PRIMARY KEY,
		value TEXT NOT NULL
	)
`);

export function getLptSerialPortSetting() {
	const row = db
		.prepare('SELECT value FROM app_settings WHERE key = ?')
		.get(SERIAL_PORT_SETTING_KEY) as { value: string } | undefined;

	return row?.value ?? '';
}

export function setLptSerialPortSetting(value: string) {
	db.prepare(
		`INSERT INTO app_settings (key, value)
		 VALUES (?, ?)
		 ON CONFLICT(key) DO UPDATE SET value = excluded.value`
	).run(SERIAL_PORT_SETTING_KEY, value);
}
