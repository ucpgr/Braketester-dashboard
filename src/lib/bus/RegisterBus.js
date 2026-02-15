import { EventEmitter } from 'events';

export class RegisterBus extends EventEmitter {
	constructor(serial) {
		super();
		this.serial = serial;
	}

	/* ---------- low-level ---------- */

	async read(address, length) {
		const frame = this.serial.buildFrame(0x82, address);
		try {
			const reply = await this.serial.sendAndWait(frame, 0x83);
			this.emit('read', reply);
			return reply.data;
		} catch (e) {
			this.emit('timeout', { address, type: 'read' });
			throw e;
		}
	}

	async write(address, data) {
		const buf = Buffer.from(data);
		const frame = this.serial.buildFrame(0x84, address, buf);
		try {
			const reply = await this.serial.sendAndWait(frame, 0x85);
			this.emit('write', reply);
		} catch (e) {
			this.emit('timeout', { address, type: 'write' });
			throw e;
		}
	}

	/* ---------- typed helpers (matches C++) ---------- */

	async readU8(addr) {
		return (await this.read(addr, 1))[0];
	}

	async readU16(addr) {
		const b = await this.read(addr, 2);
		return (b[0] << 8) | b[1];
	}

	async readU32(addr) {
		const b = await this.read(addr, 4);
		return (
			(b[0] << 24) |
			(b[1] << 16) |
			(b[2] << 8) |
			b[3]
		) >>> 0;
	}

	async writeU32(addr, value) {
		const b = Buffer.alloc(4);
		b[0] = (value >>> 24) & 0xff;
		b[1] = (value >>> 16) & 0xff;
		b[2] = (value >>> 8) & 0xff;
		b[3] = value & 0xff;
		return this.write(addr, b);
	}
}
