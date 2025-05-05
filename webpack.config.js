const path = require("path");
const DotenvWebpack = require("dotenv-webpack");

module.exports = {
	mode: "development",
	entry: "./client/ts/script.ts",
	devtool: "inline-source-map",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: "script.js",
		path: path.resolve(__dirname, "client/js"),
	},
	plugins: [
		new DotenvWebpack({
			path: path.resolve(__dirname, "./.env"),
			systemvars: true,
		}),
	],
};
