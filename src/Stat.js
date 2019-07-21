import Phaser from "phaser";
import { wrap } from "./utils";

export default class Stat extends Phaser.GameObjects.Container {
	constructor(scene, type) {
		super(scene, 0, 0);
		scene.add.existing(this);
		this.text = new Phaser.GameObjects.DynamicBitmapText(scene, 0, 0, 'font', '0', undefined, 0);
		this.text.x = 11;
		this.icon = scene.add.image(0, -2, type);
		this.icon.setOrigin(0);
		this.add([
			this.text,
			this.icon
		]);
	}

	setCount(count) {
		this.text.setText(count);
	}
}
