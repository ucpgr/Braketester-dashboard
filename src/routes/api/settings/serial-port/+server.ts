import { json } from '@sveltejs/kit';
import { SerialPort } from 'serialport';
import { getLptSerialPortSetting, setLptSerialPortSetting } from '$lib/server/settingsDb';
import { sendSerialBridgeCommand } from '../../../../../server/serialPrnBridge.js';

export async function GET() {
	const selectedPortId = getLptSerialPortSetting();

	try {
		const ports = await SerialPort.list();

		return json({
			ports: ports.map((port) => ({
				id: port.path
			})),
			selectedPortId
		});
	} catch {
		return json({
			ports: [],
			selectedPortId
		});
	}
}

export async function PUT({ request }) {
	const body = (await request.json()) as { selectedPortId?: string };
	const selectedPortId = body.selectedPortId?.trim();

	if (!selectedPortId) {
		return json({ error: 'selectedPortId is required' }, { status: 400 });
	}

	setLptSerialPortSetting(selectedPortId);

	return json({ selectedPortId });
}

export async function POST({ request }) {
	const body = (await request.json()) as { selectedPortId?: string };
	const selectedPortId = body.selectedPortId?.trim() ?? '';

	if (!selectedPortId) {
		return json({ error: 'selectedPortId is required' }, { status: 400 });
	}

	const sentByBridge = await sendSerialBridgeCommand(selectedPortId, 't');
	if (!sentByBridge) {
		return json(
			{ error: 'Failed to send test command over active serial bridge port' },
			{ status: 500 }
		);
	}

	return json({ ok: true });
}