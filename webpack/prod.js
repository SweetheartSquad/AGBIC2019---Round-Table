const merge = require('webpack-merge');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const base = require('./base');

module.exports = merge(base, {
	mode: 'production',
	output: {
		filename: 'bundle.min.js',
	},
	devtool: false,
	performance: {
		maxEntrypointSize: 900000,
		maxAssetSize: 900000,
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					output: {
						comments: false,
					},
				},
			}),
		],
	},
	plugins: [
		new CleanWebpackPlugin(['dist'], {
			root: path.resolve(__dirname, '../'),
		}),
	],
});
