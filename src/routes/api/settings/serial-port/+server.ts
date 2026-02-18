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
	if (sentByBridge) {
		return json({ ok: true });
	}

	const port = new SerialPort({ path: selectedPortId, baudRate: 9600, autoOpen: false });

	try {
		await new Promise<void>((resolve, reject) => {
			port.open((error) => {
				if (error) {
					reject(error);
					return;
				}

				resolve();
			});
		});

		await new Promise<void>((resolve, reject) => {
			port.write('t', (error) => {
				if (error) {
					reject(error);
					return;
				}

				port.drain((drainError) => {
					if (drainError) {
						reject(drainError);
						return;
					}

					resolve();
				});
			});
		});

		return json({ ok: true });
	} catch {
		return json({ error: 'Failed to send test command over serial port' }, { status: 500 });
	} finally {
		if (port.isOpen) {
			await new Promise<void>((resolve) => {
				port.close(() => resolve());
			});
		}
	}
}
