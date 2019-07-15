import Phaser from "phaser";

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

function wrap(str, max) {
	var words = str.split(' ');
	var s = '';
	var rows = [];
	for (var i = 0; i < words.length; ++i) {
		if (s.length + words[i].length > max) {
			rows.push(s);
			s = '';
		}
		s += words[i] + ' ';
	}
	rows.push(s);
	return rows.join('\n');
}

function characterCallback(data) {
	const duration = 800;
	const offset = 0.08;
	const t = 1.0 - Math.min(1, Math.max(0, (Date.now() - (data.parent.start + data.index * offset * duration)) / duration));
	data.rotation = -t * t * 0.8;
	data.y += t * data.parent.fontData.size;
	data.tint.topLeft = data.tint.topRight = data.tint.bottomLeft = data.tint.bottomRight = (cols[Math.floor(t * (cols.length - 1))]);
	return data;
}

export default class EventText extends Phaser.GameObjects.DynamicBitmapText {
	constructor(scene) {
		super(scene, 35, 35, 'font', '', undefined, 0);
		this.start = Date.now();
		this.setDisplayCallback(characterCallback);
		scene.add.existing(this);
	}

	setText(text) {
		this.start = Date.now();
		super.setText(wrap(text, 27));
	}

	finish() {
		this.start = -Infinity;
	}
}
