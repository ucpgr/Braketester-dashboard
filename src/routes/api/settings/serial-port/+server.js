import { json } from '@sveltejs/kit';
import { openPort, sendTestByte, getStatus, getActivePortId, listSerialPorts } from '/server/serialPrnBridge.mjs';

export async function GET() {
	const ports = await listSerialPorts();
	const status = getStatus();

	return json({
		ports,
		selectedPortId: status.activePortId,
		status
	});
}

export async function PUT({ request }) {
	const { selectedPortId } = await request.json();

	if (!selectedPortId) {
		return json({ ok: false, reason: 'missing-port' });
	}

	if (selectedPortId === getActivePortId()) {
		return json({ ok: true, alreadyActive: true });
	}

	await openPort(selectedPortId);
	return json({ ok: true });
}