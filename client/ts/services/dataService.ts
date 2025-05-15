import { GeoJSONFeatureCollection, GeoJSONData } from "../types";
import { showError } from "../utils/notifications";
import { GeoJsonUtils } from "../utils/geoJsonUtils";
import { showLoading } from "../utils/uiUtils";
import { LocalStorageCache, CacheOptions } from "../utils/cache";

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
		showLoading(true);

		try {
			// Check if we have valid cached data
			const cacheOptions: CacheOptions = {
				key: cacheKey,
				staleTime: staleTime,
			};

			const cachedData = LocalStorageCache.get<GeoJSONData>(cacheOptions);
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
				if (GeoJsonUtils.isValidGeoJSON(jsonData)) {
					data = jsonData as GeoJSONFeatureCollection;
				} else {
					throw new Error("JSON is not in GeoJSON FeatureCollection format");
				}
			} else {
				// Assume it's CSV
				const csvText = await response.text();
				data = GeoJsonUtils.parseCSVToGeoJSON(csvText);
			}

			// Clean the data
			const cleanedData = GeoJsonUtils.cleanData(data);

			// Cache the data
			LocalStorageCache.set(cacheOptions, cleanedData);

			return cleanedData;
		} catch (error) {
			showError(
				`Failed to load data: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
			throw error;
		} finally {
			// Hide loading overlay
			showLoading(false);
		}
	}
}
