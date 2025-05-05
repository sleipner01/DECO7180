const path = require("path");
const DotenvWebpack = require("dotenv-webpack");

module.exports = (env, argv) => {
	// Determine which .env file to use based on mode
	const envPath =
		argv.mode === "production"
			? path.resolve(__dirname, ".env.production")
			: path.resolve(__dirname, ".env.development");

	console.log(`Using environment file: ${envPath}`);

	return {
		mode: argv.mode || "development",
		entry: "./client/ts/script.ts",
		devtool: argv.mode === "production" ? false : "inline-source-map",
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
				path: envPath,
				systemvars: true, // Load system environment variables as well
				defaults: false, // Don't use a default .env file as fallback
			}),
		],
	};
};
