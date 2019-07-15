import Phaser from "phaser";
import frameImg from "./assets/frame.png";
import swordImg from "./assets/sword.png";
import fishImg from "./assets/fish.png";
import fontImg from "./assets/font/font.png";
import fontXml from "!!file-loader!./assets/font/font.fnt";
import './style.css';

import Shader from './Shader';
import EventText from "./EventText";

const config = {
	type: Phaser.AUTO,
	scale: {
		parent: 'phaser-example',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 400,
		height: 225,
	},
	roundPixels: true,
	scene: {
		preload,
		create,
		update,
	}
};

const game = new Phaser.Game(config);

function preload() {
	this.load.bitmapFont('font', fontImg, fontXml);
	this.load.image("frame", frameImg);
	this.load.image("sword", swordImg);
	this.load.image("fish", fishImg);
}

function create() {
	// setup post-processing
	this.shader = this.game.renderer.addPipeline('Shader', new Shader(this.game));
	this.shader.setFloat2('resolution', config.scale.width, config.scale.height);
	this.cameras.main.setRenderToTexture(this.shader);

	this.fish = this.add.image(269, 27, "fish");
	this.fish.setOrigin(0);


	this.eventText = new EventText(this);
	this.frame = this.add.image(config.scale.width/2, config.scale.height/2, "frame");
	this.sword = this.add.image(300, 100, "sword");


	this.tweens.add({
		targets: sword,
		y: 200,
		duration: 2000,
		ease: "Power2",
		yoyo: true,
		loop: -1
	});
	


	this.eventText.setText(`Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Fusce eu tempor elit. Mauris finibus, sapien a aliquam mattis, risus ex semper diam, vitae tincidunt felis mi at augue.

Nulla.`);
	//  Input events
	this.x = 0;
	this.y = 0;
	this.input.on('pointermove', function(pointer) {
		this.x = pointer.x;
		this.y = pointer.y;
	}, this);
}

function update(time, delta) {
	this.shader.setFloat1('time', time);
	this.sword.x = this.x;
	this.sword.y = this.y;
}
