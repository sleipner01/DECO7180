/**
 * Environment variables configuration with validation
 */

// Define the structure of our environment variables
interface EnvironmentVariables {
	MAPBOX_TOKEN: string;
	DEBUG: boolean;
	ENV: "development" | "production";
}

const env: Partial<EnvironmentVariables> = {
	MAPBOX_TOKEN: process.env.MAPBOX_TOKEN || "",
	DEBUG: process.env.DEBUG === "true",
	ENV: (process.env.ENV as "development" | "production") || "development",
	// Add other environment variables here
};

const requiredEnvVars: Array<keyof EnvironmentVariables> = [
	"MAPBOX_TOKEN",
	// Add other required environment variables here
];

const missingEnvVars = requiredEnvVars.filter(
	(varName) => !env[varName] || env[varName] === ""
);

if (missingEnvVars.length > 0) {
	throw new Error(
		`Missing required environment variables: ${missingEnvVars.join(", ")}
    
Please make sure you have the appropriate .env file with the following variables:
${requiredEnvVars.map((v) => `${v}=your_${v.toLowerCase()}_here`).join("\n")}
    
Current environment: ${env.ENV}
If you're seeing this error after setting the variables, make sure you've rebuilt the project.`
	);
}

export const ENV = env as EnvironmentVariables;

if (ENV.DEBUG) {
	console.log(`Running in ${ENV.ENV} mode`);
	console.log(`Debug mode: ${ENV.DEBUG}`);
}
