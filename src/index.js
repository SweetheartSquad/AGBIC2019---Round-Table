import Phaser from "phaser";
import swordImg from "./assets/sword.png";
import fishImg from "./assets/fish.png";
import './style.css';

import Shader from './Shader';

const config = {
	type: Phaser.AUTO,
	scale: {
		parent: 'phaser-example',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 400,
		height: 260,
	},
	scene: {
		preload,
		create,
		update,
	}
};

const game = new Phaser.Game(config);

function preload() {
	this.load.image("sword", swordImg);
	this.load.image("fish", fishImg);
}

function create() {
	const fish = this.add.image(200, 100, "fish");
	const sword = this.add.image(300, 100, "sword");

	this.shader = this.game.renderer.addPipeline('Shader', new Shader(this.game));
	this.shader.setFloat2('resolution', config.scale.width, config.scale.height);
	this.cameras.main.setRenderToTexture(this.shader);

	this.tweens.add({
		targets: sword,
		y: 200,
		duration: 2000,
		ease: "Power2",
		yoyo: true,
		loop: -1
	});
	this.t = 0;
}

function update() {
	this.t += 1;
	this.shader.setFloat1('time', this.t);
}
