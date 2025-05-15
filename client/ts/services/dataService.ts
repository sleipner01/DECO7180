import {
	GeoJSONFeatureCollection,
	CSVHeatmapDataPoint,
	GeoJSONData,
} from "../types";
import { showError } from "../utils/notifications";
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
			// Check if we have valid cached data
			const cachedData = this.getFromCache(cacheKey);
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

			// Clean the data
			const cleanedData = this.cleanData(data);

			// Cache the data
			this.saveToCache(cacheKey, cleanedData, staleTime);

			return cleanedData;
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

	private static getFromCache(key: string): GeoJSONData | null {
		try {
			const item = localStorage.getItem(key);
			if (!item) return null;

			const { data, expiry } = JSON.parse(item);

			if (Date.now() > expiry) {
				localStorage.removeItem(key);
				return null;
			}

			return data;
		} catch (error) {
			console.error("Error retrieving from cache:", error);
			return null;
		}
	}

	private static saveToCache(
		key: string,
		data: GeoJSONData,
		expiryTime: number
	): void {
		try {
			const item = {
				data,
				expiry: Date.now() + expiryTime,
			};

			localStorage.setItem(key, JSON.stringify(item));
		} catch (error) {
			console.error("Error saving to cache:", error);
			// If there's an error (like quotas), just continue without caching
		}
	}

	private static cleanData(data: GeoJSONData): GeoJSONData {
		// Filter out features with missing coordinates or properties
		const validFeatures = data.features.filter((feature) => {
			if (!feature.geometry) return false;

			// Check if the geometry is a GeometryCollection (which doesn't have coordinates)
			if (feature.geometry.type === "GeometryCollection") return false;

			// Now TypeScript knows this is a geometry with coordinates
			const coords = feature.geometry.coordinates;
			if (!Array.isArray(coords) || coords.length < 2) return false;

			// Check for valid coordinates (some entries might have empty arrays)
			if (coords[0] === null || coords[1] === null) return false;

			return true;
		});

		return {
			type: "FeatureCollection",
			features: validFeatures,
		};
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
		showError(message);
		console.error(message);
	}
}
