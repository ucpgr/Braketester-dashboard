import fs from 'fs';
import path from 'path';
import { patchPrnFile } from './prnPatch.js';

function waitForSizeStability(filePath, intervalMs = 500, stableCount = 3) {
	return new Promise((resolve, reject) => {
		let lastSize = -1;
		let stableTicks = 0;

		const timer = setInterval(() => {
			fs.stat(filePath, (err, stats) => {
				if (err) {
					clearInterval(timer);
					return reject(err);
				}

				if (stats.size === lastSize) {
					stableTicks++;
					if (stableTicks >= stableCount) {
						clearInterval(timer);
						resolve();
					}
				} else {
					lastSize = stats.size;
					stableTicks = 0;
				}
			});
		}, intervalMs);
	});
}

export function watchPrnFolder(folderPath, getPatchData) {
	fs.watch(folderPath, async (eventType, filename) => {
		if (!filename || !filename.endsWith('.prn')) return;

		const prnPath = path.join(folderPath, filename);
		const pr2Path = prnPath.replace(/\.prn$/i, '.pr2');

		try {
			await fs.promises.access(prnPath);
			await waitForSizeStability(prnPath);

			// === PATCH STEP ===
			patchPrnFile(
				prnPath,
				pr2Path,
				getPatchData()
			);

			await fs.promises.unlink(prnPath);

			console.log(`PRN patched → ${path.basename(pr2Path)}`);
		}
		catch (err) {
			if (err.code !== 'ENOENT') {
				console.error('PRN watcher error:', err);
			}
		}
	});
}
