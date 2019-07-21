import Phaser from "phaser";

import frameImg from "./assets/frame.png";
import swordImg from "./assets/sword.png";
import fishImg from "./assets/fish.png";
import portrait1Img from "./assets/portrait1.png";
import portrait2Img from "./assets/portrait2.png";
import portrait3Img from "./assets/portrait3.png";
import heartImg from "./assets/SweetHeart Squad - icon.png";
import settingsImg from "./assets/settings.png";

import fontImg from "./assets/font/font.png";
import fontXml from "!!file-loader!./assets/font/font.fnt";

export default class LoadingScene extends Phaser.Scene {
	constructor() {
		super({ key: 'loading' });
	}

	preload() {
		const borderOffset = 2;
		const width = this.scale.width * 0.5;;
		const height = 10;
		const x = this.scale.width * 0.25;
		const y = this.scale.height * 0.5 - height / 2;
		const border = this.add.graphics({
			lineStyle: {
				width: borderOffset,
				color: 0xffffff,
			}
		});
		const borderRect = new Phaser.Geom.Rectangle(
			x - borderOffset,
			y - borderOffset,
			width + borderOffset * 2,
			height + borderOffset * 2);
		border.strokeRectShape(borderRect);

		const progressbar = this.add.graphics();
		const updateProgressbar = percent => {
			progressbar.clear();
			progressbar.fillStyle(0xffffff, 1);
			progressbar.fillRect(x, y, percent * width, height);
		};

		this.load.bitmapFont('font', fontImg, fontXml);
		this.load.image("frame", frameImg);
		this.load.image("sword", swordImg);
		this.load.image("fish", fishImg);
		this.load.image("portrait1", portrait1Img);
		this.load.image("portrait2", portrait2Img);
		this.load.image("portrait3", portrait3Img);
		this.load.image("heart", heartImg);
		this.load.image("settings", settingsImg);
		this.load.on('progress', updateProgressbar);
		this.load.once('complete', () => {
			import('./GameScene').then(scene => {
				console.log(scene.default);
				this.scene.add('game', new scene.default(), true);
				this.scene.remove(this.key);
			});
		}, this);
	}
}
