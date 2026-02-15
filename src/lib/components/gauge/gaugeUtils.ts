export function valueToAngle(
	value: number,
	minValue: number,
	maxValue: number,
	minAngle: number,
	maxAngle: number
) {
	if (minValue === maxValue) return minAngle;

	const clamped = Math.min(maxValue, Math.max(minValue, value));
	const t = (clamped - minValue) / (maxValue - minValue);
	return minAngle + t * (maxAngle - minAngle);
}

export function arcPath(
	cx: number,
	cy: number,
	r: number,
	startDeg: number,
	endDeg: number
) {
	const rad = (deg: number) => (deg * Math.PI) / 180;

	const x1 = cx + r * Math.cos(rad(startDeg));
	const y1 = cy + r * Math.sin(rad(startDeg));
	const x2 = cx + r * Math.cos(rad(endDeg));
	const y2 = cy + r * Math.sin(rad(endDeg));

	const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
	const sweep = endDeg > startDeg ? 1 : 0;

	return `M${x1} ${y1} A${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
}