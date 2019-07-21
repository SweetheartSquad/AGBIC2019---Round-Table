import { Settings } from "./GameScene";

const cols = [
	0xFFFFFF,
	0xEEEEEE,
	0xDDDDDD,
	0xCCCCCC,
	0xBBBBBB,
	0xAAAAAA,
	0x999999,
	0x888888,
	0x777777,
	0x666666,
	0x555555,
	0x444444,
	0x333333,
	0x222222,
	0x111111,
	0x000000,
];

const speeds = [
	1200,
	800,
	400,
	0,
];

const offset = 0.92;
export function characterCallback(data) {
	const t = 1.0 - Math.min(1, Math.max(0, (Date.now() - (data.parent.start + data.index * speeds[Settings.speed] * (1.0 - offset))) / speeds[Settings.speed]));
	data.rotation = -t * t * 0.8;
	data.y += t * data.parent.fontData.size;
	data.tint.topLeft = data.tint.topRight = data.tint.bottomLeft = data.tint.bottomRight = (cols[Math.floor(t * (cols.length - 1))]);
	return data;
}

export function getTextAnimationLength(text) {
	return text.length * speeds[Settings.speed] * (1.0 - offset);
}

export function wrap(str, max) {
	var words = str.split(/(\s)/);
	var s = '';
	var rows = [];
	for (var i = 0; i < words.length; ++i) {
		if (s.length + words[i].trim().length > max || words[i] === '\n') {
			rows.push(s);
			s = '';
		}
		s += words[i].replace('\n', '');
	}
	rows.push(s.trim());
	return rows.join('\n');
}
