import fs from 'fs';

export const FIELDS = {
	userLine1: { offset: 9841,  length: 34 },
	userLine2: { offset: 9925,  length: 34 },
	userLine3: { offset: 10005, length: 34 },

	licence:   { offset: 10052, length: 27 },
	make:      { offset: 10132, length: 27 },
	model:     { offset: 10212, length: 27 },
	mileage:   { offset: 10292, length: 27 },

	testDate:  { offset: 10177, length: 8 },
	testTime:  { offset: 10257, length: 8 }
};

function writeFixed(buf, { offset, length }, value) {
	const text = String(value ?? '').padEnd(length, ' ').slice(0, length);
	buf.write(text, offset, 'ascii');
}

export function patchPrnFile(inputPath, outputPath, data) {
	const buf = fs.readFileSync(inputPath);

	// User info (3 lines)
	writeFixed(buf, FIELDS.userLine1, data.user?.line1);
	writeFixed(buf, FIELDS.userLine2, data.user?.line2);
	writeFixed(buf, FIELDS.userLine3, data.user?.line3);

	// Vehicle info
	writeFixed(buf, FIELDS.licence, data.vehicle?.licence);
	writeFixed(buf, FIELDS.make,    data.vehicle?.make);
	writeFixed(buf, FIELDS.model,   data.vehicle?.model);
	writeFixed(buf, FIELDS.mileage, data.vehicle?.mileage);

	// Date/time (current) — format to match capture: DD/MM/YY and HH:MM:SS
	const now = new Date();
	const dd = String(now.getDate()).padStart(2, '0');
	const mm = String(now.getMonth() + 1).padStart(2, '0');
	const yy = String(now.getFullYear()).slice(-2);
	const date = `${dd}/${mm}/${yy}`;

	const hh = String(now.getHours()).padStart(2, '0');
	const mi = String(now.getMinutes()).padStart(2, '0');
	const ss = String(now.getSeconds()).padStart(2, '0');
	const time = `${hh}:${mi}:${ss}`;

	writeFixed(buf, FIELDS.testDate, date);
	writeFixed(buf, FIELDS.testTime, time);

	fs.writeFileSync(outputPath, buf);
}
