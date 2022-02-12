import Phaser from 'phaser';

export class Shader extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
	constructor(game) {
		super({
			game,
			renderer: game.renderer,
			fragShader: game.cache.text.get('fragShader'),
		})
	}
}
