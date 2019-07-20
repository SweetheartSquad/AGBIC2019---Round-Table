
import Shader from './Shader';
import EventText from "./EventText";

export default class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: 'game' });
	}
	create() {
		// setup post-processing
		this.shader = this.game.renderer.addPipeline('Shader', new Shader(this.game));
		this.shader.setFloat2('resolution', this.scale.width, this.scale.height);
		this.cameras.main.setRenderToTexture(this.shader);

		this.fish = this.add.image(269, 27, "scene1");
		this.fish.setOrigin(0);


		this.eventText = new EventText(this);
		this.frame = this.add.image(this.scale.width / 2, this.scale.height / 2, "frame");
		// this.sword = this.add.image(300, 100, "sword");

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


		this.eventText.setText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla faucibus purus a ultrices vulputate. Mauris pharetra accumsan dui, nec laoreet tellus porta sed.\n\nNunc pharetra sed sem in scelerisque.');
		// 	this.eventText.setText(`The Good Queen has passed, as all must. The burden to rule falls now The Naïve Heir, and their table of knights.

		// That is, to You, and your advisors.`);
		//  Input events
		// this.x = 0;
		// this.y = 0;
		// this.input.on('pointermove', function(pointer) {
		// 	this.x = pointer.x;
		// 	this.y = pointer.y;
		// }, this);

		var keyObj = this.input.keyboard.addKey('S'); // Get key object
		keyObj.on('down', (event) => {
			this.cameras.main.renderToTexture = !this.cameras.main.renderToTexture;
			// if (this.cameras.main.renderToTexture) {
			// 	this.cameras.main.setRenderToTexture();
			// } else {
			// 	this.cameras.main.setRenderToTexture(this.shader);
			// }

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
			this.fish.setTexture(scenes[scene]);
		});
		var keyObj = this.input.keyboard.addKey('A'); // Get key object
		keyObj.on('down', (event) => {
			scene -= 1;
			if (scene < 0) {
				scene += scenes.length;
			}
			this.fish.setTexture(scenes[scene]);
		});
	}
	update(time, delta) {
		this.shader.setFloat1('time', time);
		// this.sword.x = this.x;
		// this.sword.y = this.y;
	}
}
