const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const package = require("../package.json");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	mode: "development",
	devtool: "eval-source-map",
	module: {
		rules: [{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.(strand|glsl|vert|frag|gif|png|jpe?g|svg|xml|ogg)$/i,
				use: "file-loader"
			},
			{
				test: /\.css$/, // stylesheets
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: [
								require('autoprefixer')(),
								require('postcss-clean')()
							]
						}
					}
				]
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(["dist"], {
			root: path.resolve(__dirname, "../")
		}),
		new webpack.DefinePlugin({
			CANVAS_RENDERER: JSON.stringify(true),
			WEBGL_RENDERER: JSON.stringify(true)
		}),
		new MiniCssExtractPlugin(),
		new HtmlWebpackPlugin({
			title: package.description,
			meta: {
				viewport: 'width=device-width, initial-scale=1',
			},
			favicon: './src/assets/icon.png',
			minify: true,
			chunks: {
				head: {
					css: './src/assets/style.css',
				},
			},
		})
	]
};
