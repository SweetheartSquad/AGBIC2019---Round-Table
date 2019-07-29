import Phaser from 'phaser';
import Strand from 'strand-core';

import Shader from './Shader';
import EventText from "./EventText";

import Choice from './Choice';
import Stat from './Stat';

import * as images from './assets/images';

export class Settings {
	static speed = 1;
};

const initialFlags = {};
const initialStats = {
	salt: 0,
	wine: 1,
	bread: 2,
};

let flags = { ...initialFlags };
let stats = { ...initialStats };

class StrandE extends Strand {
	constructor(options) {
		super(options);
		this.scene = options.scene;
		Object.entries(stats).forEach(([key, value]) => {
			this.scene[key].setCount(value);
		});
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

	plus(stat, delta = 1) {
		stats[stat] += delta;
		this.scene[stat].setCount(stats[stat]);
		return stats[stat];
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
		const randomScenes = [
		];
		this.randomScenes = [];
		while(randomScenes.length) {
			this.randomScenes.push(randomScenes.splice(Math.floor(Math.random()*randomScenes.length), 1)[0]);
		}
	}

	setRandom() {
		this.flag('random', this.randomScenes.pop() || 'exhausted');
	}

	image(img) {
		if (this.scene.activePortrait.texture.key === img) {
			return;
		}

		if (this.tweens) {
			this.tweens.forEach(t => t.stop());
		}

		const inactivePortrait = this.scene.inactivePortrait === this.scene.portraitA ? this.scene.portraitA : this.scene.portraitB;
		inactivePortrait.alpha = 0;
		const a = this.scene.add.tween({
			targets: inactivePortrait,
			alpha: 1,
			duration: 500,
			ease: "Sin.easeOut",
		});
		const b = this.scene.add.tween({
			targets: this.scene.activePortrait,
			alpha: 0,
			duration: 300,
			ease: "Sin.easeIn",
		});
		this.tweens = [a, b];
		this.scene.inactivePortrait = this.scene.activePortrait;
		this.scene.activePortrait = inactivePortrait;
		this.scene.activePortrait.setTexture(img);
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

		this.portraitA = this.add.image(269 + 104 / 2, 27 + 170 / 2, "");
		this.portraitB = this.add.image(269 + 104 / 2, 27 + 170 / 2, "");
		this.portraitA.alpha = 0;
		this.portraitB.alpha = 0;
		this.activePortrait = this.portraitA;
		this.choicesContainer = new Phaser.GameObjects.Container(this, 35, 155);
		this.add.existing(this.choicesContainer);

		this.eventText = new EventText(this);
		this.frame = this.add.image(this.scale.width / 2, this.scale.height / 2, "frame");

		this.salt = new Stat(this, 'salt');
		this.wine = new Stat(this, 'wine');
		this.bread = new Stat(this, 'bread');
		this.salt.y = this.wine.y = this.bread.y = 138;
		this.salt.x = 35;
		this.wine.x = 35 + 30;
		this.bread.x = 35 + 30 + 30;

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
			delay: 500,
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
		this.input.keyboard.addKey('SPACE').on('down', skip);
		this.input.keyboard.addKey('ENTER').on('down', skip);
		var keyObj = this.input.keyboard.on('keydown', event => {
			if (choices[event.key - 1]) {
				choices[event.key - 1].emit('click');
			} else if (parseInt(event.key, 10) <= 4) {
				skip();
			}
		});
		keyObj.on('down', (event) => {
			scene -= 1;
			if (scene < 0) {
				scene += scenes.length;
			}
			this.activePortrait.setTexture(scenes[scene]);
		});
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
					c.alpha = 0;
					this.add.tween({
						targets: c,
						alpha: 1,
						delay: idx * (3 - Settings.speed) * 50,
						duration: (3 - Settings.speed) * 500,
						ease: "Power2",
					})
					return c;
				}));
			},
		};

		const strand = new StrandE({
			scene: this,
			renderer,
			source: this.cache.text.get('story')
				.replace(/<<BR(.*?)>>/ig, function(_, text, pos) {
					return `[[${text.trim() || 'Continue'}|this.goto('break:${pos}')]]\n::break:${pos}`;
				})
				.replace(/\[\+SALT\]/g, '[+SALT]<<do this.plus("salt")>>')
				.replace(/\[\+WINE\]/g, '[+WINE]<<do this.plus("wine")>>')
				.replace(/\[\+BREAD\]/g, '[+BREAD]<<do this.plus("bread")>>'),
		});
		strand.goto('start');

		// debug stuff
		var keyObj = this.input.keyboard.addKey('S'); // Get key object
		keyObj.on('down', (event) => {
			this.cameras.main.renderToTexture = !this.cameras.main.renderToTexture;
		});
		var scene = 0;
		var scenes = Object.keys(images);
		var keyObj = this.input.keyboard.addKey('D'); // Get key object
		keyObj.on('down', (event) => {
			scene += 1;
			scene %= scenes.length;
			strand.image(scenes[scene]);
		});
		var keyObj = this.input.keyboard.addKey('A'); // Get key object
		keyObj.on('down', (event) => {
			scene -= 1;
			if (scene < 0) {
				scene += scenes.length;
			}
			strand.image(scenes[scene]);
		});
	}
	update(time, delta) {
		this.shader.setFloat1('time', time);
		// this.sword.x = this.x;
		// this.sword.y = this.y;
	}
}
