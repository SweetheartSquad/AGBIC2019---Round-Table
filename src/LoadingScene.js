import Phaser from 'phaser';

import story from './assets/story';
import fragShader from './assets/shader.frag.glsl';
import music from './assets/song_v2.ogg';
import sfxShort1 from './assets/sfx_short_1.ogg';
import sfxShort2 from './assets/sfx_short_2.ogg';
import sfxShort3 from './assets/sfx_short_3.ogg';
import sfxLong from './assets/sfx_long.ogg';

import fontImg from './assets/font/font.png';
import fontXml from '!!file-loader!./assets/font/font.fnt';

import * as images from './assets/images';

export default class LoadingScene extends Phaser.Scene {
	constructor() {
		super({ key: 'loading' });
		window.game.canvas.ariaHidden = true;
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
		this.load.text('story', story);
		this.load.text('fragShader', fragShader);
		this.load.audio('music', [music]);
		this.load.audio('sfxShort1', [sfxShort1]);
		this.load.audio('sfxShort2', [sfxShort2]);
		this.load.audio('sfxShort3', [sfxShort3]);
		this.load.audio('sfxLong', [sfxLong]);
		Object.entries(images).forEach(([key, value]) => this.load.image(key, value));

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
