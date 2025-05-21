import { MapService } from "./services/mapService";
import { DataService } from "./services/dataService";
import { ENV } from "./env";
import { setupAccessibility } from "./utils/accessibility";
import { TutorialService } from "./services/tutorialService";

// Wait for the DOM to load before initializing
document.addEventListener("DOMContentLoaded", async () => {
	try {
		// Set up accessibility features
		setupAccessibility();

		const mapService = new MapService();
		const dataPath = "./data/data.json";
		const data = await DataService.fetchData(
			dataPath,
			"heatmap_data_json",
			ENV.ENV == "development" ? 10 * 1000 : 60 * 60 * 1000 // 10 seconds or 1 hour
		);

		mapService.displayData(data);

		// Initialize the tutorial service
		const tutorialService = new TutorialService();

		// Set up help button to restart tutorial
		document.getElementById("help-button")?.addEventListener("click", () => {
			if (!tutorialService.isTutorialActive()) {
				tutorialService.start();
			}
		});
	} catch (error) {
		console.error("Error initializing application:", error);

		if (ENV.DEBUG) {
			const errorElement = document.getElementById("error-message");
			if (errorElement) {
				errorElement.textContent = `Application error: ${
					error instanceof Error ? error.message : "Unknown error"
				}`;
				errorElement.classList.add("visible");
			}
		}
	}
});
