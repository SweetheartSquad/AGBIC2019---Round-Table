const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

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
				test: [/\.vert$/, /\.frag$/],
				use: "raw-loader"
			},
			{
				test: /\.(gif|png|jpe?g|svg|xml)$/i,
				use: "file-loader"
			},
			{
				test: /\.css$/, // stylesheets
				use: [
					'style-loader',
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
		new HtmlWebpackPlugin({
			template: "./index.html"
		})
	]
};
