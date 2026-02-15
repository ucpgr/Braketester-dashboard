import { SerialPort } from 'serialport';
import { EventEmitter } from 'events';

const STX = 0x02;
const ETX = 0x03;

export class BrakeTesterSerial extends EventEmitter {
	constructor(path, baud = 38400) {
		super();

		this.port = new SerialPort({
			path,
			baudRate: baud,
			autoOpen: false
		});

		this.rx = Buffer.alloc(0);

		this.port.on('data', d => this._onData(d));
		this.port.on('error', e => this.emit('error', e));
	}

	open() {
		return new Promise((res, rej) =>
			this.port.open(err => (err ? rej(err) : res()))
		);
	}

	/* ---------------- framing ---------------- */

	buildFrame(mid, address, data = Buffer.alloc(0)) {
		const dataLen = data.length;

		const frameLen =
			1 + // MID
			1 + // dataLen
			4 + // address
			dataLen +
			1 + // ETX
			1;  // checksum

		const buf = Buffer.alloc(frameLen + 2);
		let o = 0;

		buf[o++] = STX;
		buf[o++] = frameLen;
		buf[o++] = mid;
		buf[o++] = dataLen;

		buf[o++] = (address >>> 24) & 0xff;
		buf[o++] = (address >>> 16) & 0xff;
		buf[o++] = (address >>> 8) & 0xff;
		buf[o++] = address & 0xff;

		if (dataLen) {
			data.copy(buf, o);
			o += dataLen;
		}

		buf[o++] = ETX;

		let sum = 0;
		for (let i = 0; i < o; i++) sum = (sum + buf[i]) & 0xff;
		buf[o++] = sum;

		return buf;
	}

	/* ---------------- RX ---------------- */

	_onData(chunk) {
		this.rx = Buffer.concat([this.rx, chunk]);

		while (this.rx.length >= 6) {
			if (this.rx[0] !== STX) {
				this.rx = this.rx.slice(1);
				continue;
			}

			const total = this.rx[1] + 2;
			if (this.rx.length < total) return;

			const frame = this.rx.slice(0, total);
			this.rx = this.rx.slice(total);

			if (!this._valid(frame)) continue;

			this.emit('frame', this._parse(frame));
		}
	}

	_valid(buf) {
		if (buf[buf.length - 2] !== ETX) return false;

		let sum = 0;
		for (let i = 0; i < buf.length - 1; i++)
			sum = (sum + buf[i]) & 0xff;

		return sum === buf[buf.length - 1];
	}

	_parse(buf) {
		const dataLen = buf[3];
		const address =
			(buf[4] << 24) |
			(buf[5] << 16) |
			(buf[6] << 8) |
			buf[7];

		return {
			messageId: buf[2],
			address,
			data: buf.slice(8, 8 + dataLen)
		};
	}

	/* ---------------- request / reply ---------------- */

	sendAndWait(frame, replyMid, timeoutMs = 500) {
		return new Promise((resolve, reject) => {
			const t = setTimeout(() => {
				this.off('frame', handler);
				reject(new Error('Timeout'));
			}, timeoutMs);

			const handler = f => {
				if (f.messageId !== replyMid) return;
				clearTimeout(t);
				this.off('frame', handler);
				resolve(f);
			};

			this.on('frame', handler);
			this.port.write(frame);
		});
	}
}
