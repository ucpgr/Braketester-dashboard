import { json } from '@sveltejs/kit';
import { sendTestByte } from '/server/serialPrnBridge.mjs';

export async function POST() {
	return json(await sendTestByte());
}
