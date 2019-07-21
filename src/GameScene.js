import Phaser from 'phaser';
import Strand from 'strand-core';

import Shader from './Shader';
import EventText from "./EventText";

import source from './assets/story';
import Choice from './Choice';

export class Settings {
	static speed = 1;
};

const initialFlags = {};
const initialStats = {};

let flags = { ...initialFlags };
let stats = { ...initialStats };

class StrandE extends Strand {
	constructor(options) {
		super(options);
		this.scene = options.scene;
	}

	speed(delta) {
		if (delta) {
			Settings.speed += delta;
		}
		return Settings.speed;
	}

	get stat() {
		return stats;
	}

	get plus() {
		return plus;
	}

	flag(flag, value) {
		if (value !== undefined) {
			flags[flag] = value;
		} else {
			return flags[flag];
		}
	}

	reset() {
		flags = { ...initialFlags };
		stats = { ...initialStats };
	}

	image(img) {
		this.scene.portrait.setTexture(img);
	}
}


export default class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: 'game' });
	}
	create() {
		// HACK: there seems to a be a bug where button hit areas aren't respected
		// until the game has been resized; this fixes it
		game.scale.refresh();

		// setup post-processing
		this.shader = this.game.renderer.addPipeline('Shader', new Shader(this.game));
		this.shader.setFloat2('resolution', this.scale.width, this.scale.height);
		this.cameras.main.setRenderToTexture(this.shader);

		this.portrait = this.add.image(269 + 104 / 2, 27 + 170 /2, "scene1");
		this.choicesContainer = new Phaser.GameObjects.Container(this, 35, 155);
		this.add.existing(this.choicesContainer);

		this.eventText = new EventText(this);
		this.frame = this.add.image(this.scale.width / 2, this.scale.height / 2, "frame");

		var texture = this.textures.createCanvas('gradient', this.scale.width * 2, this.scale.height);
		var context = texture.getContext();
		var grd = context.createLinearGradient(0, 0, this.scale.width * 2, 0);

		grd.addColorStop(0, 'rgb(0,0,0)');
		grd.addColorStop(0.5, 'rgb(0,0,0)');
		grd.addColorStop(1, 'rgba(0,0,0,0)');

		context.fillStyle = grd;
		context.fillRect(0, 0, texture.width, texture.height);

		texture.refresh();
		this.gradient = this.add.image(0, 0, 'gradient');
		this.gradient.setOrigin(0);

		this.tweens.add({
			targets: this.gradient,
			x: -texture.width,
			duration: 4000,
			ease: "Power2",
			onComplete: () => {
				this.gradient.destroy();
			},
		});

		let canSkip = false;
		const skip = () => {
			if (canSkip) {
				this.eventText.finish();
				canSkip = false;
			}
		};
		this.input.on('pointerup', skip);
		const choices = [];
		const renderer = {
			displayPassage: async passage => {
				choices.forEach(choice => choice.destroy());
				choices.length = 0;
				const compiledPassage = strand.execute(passage.program);
				const text = compiledPassage
					.filter(({ name }) => name === 'text')
					.map(({ value }) => value).join('').trim();
				const options = compiledPassage.filter(({ name }) => name === 'action');
				canSkip = true;
				await this.eventText.setText(text);
				canSkip = false;
				let yOffset = 0;
				choices.push(...options.map(({ value: { text, action } }, idx) => {
					var c = new Choice(this, `${idx + 1}.${text}`);
					this.choicesContainer.add(c);
					c.setPosition(0, yOffset);
					yOffset += c.height;
					c.on('click', () => {
						strand.eval(action);
					});
					return c;
				}));
			},
		};

		const strand = new StrandE({
			scene: this,
			renderer,
			source: source
				.replace(/\[\+SALT\]/g, '[+SALT]<<do this.plus.salt()>>')
				.replace(/\[\+WINE\]/g, '[+WINE]<<do this.plus.wine()>>')
				.replace(/\[\+BREAD\]/g, '[+BREAD]<<do this.plus.bread()>>'),
		});
		strand.goto('start');

		var keyObj = this.input.keyboard.addKey('S'); // Get key object
		keyObj.on('down', (event) => {
			this.cameras.main.renderToTexture = !this.cameras.main.renderToTexture;
		});
		var scene = 0;
		var scenes = [
			'portrait1',
			'portrait2',
			'portrait3',
		];
		var keyObj = this.input.keyboard.addKey('D'); // Get key object
		keyObj.on('down', (event) => {
			scene += 1;
			scene %= scenes.length;
			this.portrait.setTexture(scenes[scene]);
		});
		var keyObj = this.input.keyboard.addKey('A'); // Get key object
		keyObj.on('down', (event) => {
			scene -= 1;
			if (scene < 0) {
				scene += scenes.length;
			}
			this.portrait.setTexture(scenes[scene]);
		});
	}
	update(time, delta) {
		this.shader.setFloat1('time', time);
		// this.sword.x = this.x;
		// this.sword.y = this.y;
	}
}
