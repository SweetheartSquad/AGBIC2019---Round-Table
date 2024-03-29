import Phaser from 'phaser';
import Strand from 'strand-core';
import { Choice } from './Choice';
import { EventText } from './EventText';
import { Shader } from './Shader';

export class Settings {
	static speed = 1;
}

const initialFlags = {};
const initialStats = {
	salt: 3,
	wine: 3,
	bread: 3,
};

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

	plus(stat, delta = 1) {
		stats[stat] += delta;
		stats[stat] = Math.max(0, stats[stat]);
		return stats[stat];
	}

	flag(flag, value) {
		if (value !== undefined) {
			flags[flag] = value;
			return undefined;
		}
		return flags[flag];
	}

	reset() {
		flags = { ...initialFlags };
		stats = { ...initialStats };
	}

	image(img) {
		if (this.scene.activePortrait.texture.key === img) {
			return;
		}

		if (this.tweens) {
			this.tweens.forEach((t) => t.stop());
		}

		const inactivePortrait =
			this.scene.inactivePortrait === this.scene.portraitA
				? this.scene.portraitA
				: this.scene.portraitB;
		inactivePortrait.alpha = 0;
		const a = this.scene.add.tween({
			targets: inactivePortrait,
			alpha: 1,
			duration: 500,
			ease: 'Sin.easeOut',
		});
		const b = this.scene.add.tween({
			targets: this.scene.activePortrait,
			alpha: 0,
			duration: 300,
			ease: 'Sin.easeIn',
		});
		this.tweens = [a, b];
		this.scene.inactivePortrait = this.scene.activePortrait;
		this.scene.activePortrait = inactivePortrait;
		this.scene.activePortrait.setTexture(img);
	}

	wonk() {
		if (this.wonkTween) {
			this.wonkTween.stop();
		}
		this.wonkTween = this.scene.add.tween({
			targets: this.scene.music,
			detune: -220,
			duration: 10000,
			yoyo: true,
			repeat: Infinity,
			ease: 'Cubic.easeInOut',
		});
	}

	unwonk() {
		if (this.wonkTween) {
			this.wonkTween.stop();
		}
		this.wonkTween = this.scene.add.tween({
			targets: this.scene.music,
			detune: 0,
			duration: 10000,
			ease: 'Sin.easeOut',
		});
	}

	textWonk() {
		this.tx = this.scene.add.tween({
			targets: this.scene.eventText,
			scaleX: 0.98,
			duration: 3232,
			ease: 'Back.easeInOut',
			loop: -1,
			yoyo: true,
		});
		this.ty = this.scene.add.tween({
			targets: this.scene.eventText,
			scaleY: 0.96,
			duration: 2323,
			ease: 'Back.easeInOut',
			loop: -1,
			yoyo: true,
		});
	}

	textWonkStop() {
		this.tx.stop();
		this.ty.stop();
		this.scene.eventText.scaleX = 1;
		this.scene.eventText.scaleY = 1;
	}
}

export class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: 'game' });
	}
	create() {
		// HACK: there seems to a be a bug where button hit areas aren't respected
		// until the game has been resized; this fixes it
		this.game.scale.refresh();

		this.sound.pauseOnBlur = false;
		this.music = this.sound.add('music', {
			mute: false,
			volume: 0,
			// rate: 1,
			detune: 0,
			// seek: 0,
			loop: true,
		});
		this.music.play();
		this.add.tween({
			targets: this.music,
			volume: 0.5,
			duration: 8000,
			ease: 'Cubic.easeInOut',
		});

		// setup post-processing
		this.shader = this.game.renderer.addPipeline(
			'Shader',
			new Shader(this.game)
		);
		this.shader.setFloat2('resolution', this.scale.width, this.scale.height);
		this.cameras.main.setRenderToTexture(this.shader);

		this.portraitA = this.add.image(269 + 104 / 2, 27 + 170 / 2, '');
		this.portraitB = this.add.image(269 + 104 / 2, 27 + 170 / 2, '');
		this.portraitA.alpha = 0;
		this.portraitB.alpha = 0;
		this.activePortrait = this.portraitA;
		this.choicesContainer = new Phaser.GameObjects.Container(this, 35, 155);
		this.add.existing(this.choicesContainer);

		this.eventText = new EventText(this);
		this.frame = this.add.image(
			this.scale.width / 2,
			this.scale.height / 2,
			'frame'
		);

		const texture = this.textures.createCanvas(
			'gradient',
			this.scale.width * 2,
			this.scale.height
		);
		const context = texture.getContext();
		const grd = context.createLinearGradient(0, 0, this.scale.width * 2, 0);

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
			ease: 'Power2',
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
		const choices = [];
		this.input.keyboard.on('keydown', (event) => {
			if (choices[event.key - 1]) {
				choices[event.key - 1].emit('click');
			} else if (parseInt(event.key, 10) <= 4) {
				skip();
			}
		});
		const renderer = {
			displayPassage: async (passage) => {
				choices.forEach((choice) => choice.destroy());
				choices.length = 0;
				const compiledPassage = this.strand.execute(passage.program);
				const text = compiledPassage
					.filter(({ name }) => name === 'text')
					.map(({ value }) => value)
					.join('')
					.trim();
				const options = compiledPassage.filter(({ name }) => name === 'action');
				canSkip = true;
				window.a11y.update(
					this.activePortrait.texture.key,
					text,
					options.map(({ value: { text: label } }, idx) => ({
						label,
						action: () => choices[idx].emit('click'),
					}))
				);
				await this.eventText.setText(text);
				canSkip = false;
				let yOffset = 0;
				choices.push(
					...options.map(({ value: { text: label, action } }, idx) => {
						const c = new Choice(this, `${idx + 1}.${label}`);
						this.choicesContainer.add(c);
						c.setPosition(0, yOffset);
						yOffset += c.height;
						c.on('click', () => {
							this.strand.eval(action);
							this.sound.play('sfxLong', {
								detune: Math.random() * 200 + 100,
							});
						});
						c.alpha = 0;
						this.add.tween({
							targets: c,
							alpha: 1,
							delay: idx * (3 - Settings.speed) * 50,
							duration: (3 - Settings.speed) * 500,
							ease: 'Power2',
						});
						return c;
					})
				);
			},
		};

		const strand = new StrandE({
			scene: this,
			renderer,
			source: this.cache.text
				.get('story')
				.replace(
					/<<BR(.*?)>>/gi,
					(_, text, pos) =>
						`[[${
							text.trim() || 'Continue'
						}|this.goto('break:${pos}')]]\n::break:${pos}`
				)
				.replace(/\[\+SALT\]/g, '[+SALT]<<do this.plus("salt")>>')
				.replace(/\[\+WINE\]/g, '[+WINE]<<do this.plus("wine")>>')
				.replace(/\[\+BREAD\]/g, '[+BREAD]<<do this.plus("bread")>>')
				.replace(/\[-SALT\]/g, '[-SALT]<<do this.plus("salt", -1)>>')
				.replace(/\[-WINE\]/g, '[-WINE]<<do this.plus("wine", -1)>>')
				.replace(/\[-BREAD\]/g, '[-BREAD]<<do this.plus("bread", -1)>>'),
		});
		strand.goto('start');
		this.strand = strand;
	}

	update(time) {
		this.shader.setFloat1('time', time);
	}
}
