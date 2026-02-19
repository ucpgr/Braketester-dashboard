// server/printEmitter.js
let emit = null;

export function registerPrintEmitter(fn) {
	emit = fn;
}

export function emitPrint(stage) {
	if (emit)
	{
		emit(stage);
		console.log(`Emitting print stage: ${stage}`);
	}
	else
	{
		console.log(`No print emitter registered`);
	}
}
