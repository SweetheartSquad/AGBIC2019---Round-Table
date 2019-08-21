import Phaser from "phaser";
import 'babel-polyfill';

import LoadingScene from "./LoadingScene";

const config = {
	type: Phaser.AUTO,
	scale: {
		parent: 'phaser-example',
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: 400,
		height: 225,
	},
	autoRound: true,
	roundPixels: true,
	scene: LoadingScene,
};

const game = new Phaser.Game(config);
