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
	this.frame = this.add.image(config.scale.width / 2, config.scale.height / 2, "frame");
	this.sword = this.add.image(300, 100, "sword");

	var texture = this.textures.createCanvas('gradient', config.scale.width * 2, config.scale.height);
	var context = texture.getContext();
	var grd = context.createLinearGradient(0, 0, config.scale.width * 2, 0);

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
