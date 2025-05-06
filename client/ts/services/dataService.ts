import { LocalStorageCache } from "../utils/cache";
import { GeoJSONFeatureCollection, CSVHeatmapDataPoint } from "../types";
import Papa from "papaparse";

// 1 hour stale time
const DEFAULT_STALE_TIME = 60 * 60 * 1000;

export class DataService {
	/**
	 * Fetches and processes data from the specified URL
	 */
	static async fetchData(
		url: string,
		cacheKey: string = "heatmap_data",
		staleTime: number = DEFAULT_STALE_TIME
	): Promise<GeoJSONFeatureCollection> {
		// Show loading overlay
		this.showLoading(true);

		try {
			// Try to get data from cache
			const cachedData = LocalStorageCache.get<GeoJSONFeatureCollection>({
				key: cacheKey,
				staleTime,
			});

			if (cachedData) {
				console.log("Using cached data");
				return cachedData;
			}

			// Fetch fresh data
			console.log("Fetching fresh data");
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(
					`Failed to fetch data: ${response.status} ${response.statusText}`
				);
			}

			const contentType = response.headers.get("content-type");
			let data: GeoJSONFeatureCollection;

			// Check if response is JSON or CSV
			if (contentType && contentType.includes("application/json")) {
				const jsonData = await response.json();

				// If already in GeoJSON format
				if (jsonData.type === "FeatureCollection") {
					data = jsonData as GeoJSONFeatureCollection;
				} else {
					throw new Error("JSON is not in GeoJSON FeatureCollection format");
				}
			} else {
				// Assume it's CSV
				const csvText = await response.text();
				data = this.parseCSVToGeoJSON(csvText);
			}

			// Cache the result
			LocalStorageCache.set({ key: cacheKey, staleTime }, data);

			return data;
		} catch (error) {
			this.showError(
				`Failed to load data: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
			throw error;
		} finally {
			// Hide loading overlay
			this.showLoading(false);
		}
	}

	private static parseCSVToGeoJSON(csvData: string): GeoJSONFeatureCollection {
		const results = Papa.parse<CSVHeatmapDataPoint>(csvData, {
			header: true,
			skipEmptyLines: true,
		});

		const features = results.data.map((row) => {
			const lat = parseFloat(row.latitude);
			const lng = parseFloat(row.longitude);
			// Convert intensity to a number
			const intensity = parseFloat(row.intensity);

			return {
				type: "Feature" as const,
				properties: {
					intensity: intensity,
				},
				geometry: {
					type: "Point" as const,
					coordinates: [lng, lat] as [number, number],
				},
			};
		});

		return {
			type: "FeatureCollection",
			features: features,
		};
	}

	private static showLoading(show: boolean): void {
		const loadingOverlay = document.getElementById("loading-overlay");
		if (loadingOverlay) {
			loadingOverlay.style.display = show ? "flex" : "none";
		}
	}

	private static showError(message: string): void {
		const errorElement = document.getElementById("error-message");
		if (errorElement) {
			errorElement.textContent = message;
			errorElement.classList.add("visible");

			// Hide after 5 seconds
			setTimeout(() => {
				errorElement.classList.remove("visible");
			}, 5000);
		}

		console.error(message);
	}
}
