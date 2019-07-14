import Phaser from "phaser";
import logoImg from "./assets/logo.png";
import './style.css';

const config = {
	type: Phaser.AUTO,
	scale: {
		parent: 'phaser-example',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 800,
		height: 600,
	},
	scene: {
		preload: preload,
		create: create
	}
};

const game = new Phaser.Game(config);

function preload() {
	this.load.image("logo", logoImg);
}

function create() {
	const logo = this.add.image(400, 150, "logo");

	this.tweens.add({
		targets: logo,
		y: 450,
		duration: 2000,
		ease: "Power2",
		yoyo: true,
		loop: -1
	});
}
