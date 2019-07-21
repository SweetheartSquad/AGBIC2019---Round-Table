import Phaser from 'phaser';
import fragShader from '!!raw-loader!./assets/shader.frag.glsl';

var Shader = new Phaser.Class({
	Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
	initialize: function Shader(game) {
			Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
				game: game,
				renderer: game.renderer,
				fragShader,
			});
	},
});

export default Shader;
