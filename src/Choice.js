import Phaser from "phaser";
import { wrap } from "./utils";

export default class Choice extends Phaser.GameObjects.DynamicBitmapText {
	constructor(scene, text) {
		super(scene, 0, 0, 'font', '', undefined, 0);
		this.start = Date.now();
		let down = false;
		const cNormal = 0xFFFFFF;
		const cOver = 0xBBBBFF;
		const cActive = 0xBB3300;
		scene.add.existing(this);
		this.setInteractive({
			useHandCursor: true,
		});
		this.on('pointerover', () => {
			this.tint = down ? cActive : cOver;
			scene.sound.play(`sfxShort${Math.floor(Math.random()*3)+1}`);
		});
		this.on('pointerout', () => {
			this.tint = undefined;
		});
		this.on('pointerdown', () => {
			down = true;
			this.tint = cActive;
		});
		this.scene.input.on('pointerup', () => {
			down = false;
			this.tint = cNormal;
		});
		this.on('pointerup', () => {
			if (down) {
				this.emit('click');
			}
		});
		this.setText(text);
	}

	setText(text) {
		this.start = Date.now();
		super.setText(wrap(text, 27));
	}
}
