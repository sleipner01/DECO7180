import {
	GeoJSONData,
	CSVHeatmapDataPoint,
	GeoJSONFeatureCollection,
} from "../types";
import Papa from "papaparse";

/**
 * Utility class for handling GeoJSON data
 */
export class GeoJsonUtils {
	/**
	 * Clean GeoJSON data by removing invalid features
	 *
	 * This function filters out features that do not have valid coordinates or properties.
	 * It checks for the presence of geometry and ensures that coordinates are valid.
	 *
	 * @param data - The GeoJSON data to be cleaned
	 * @return A new GeoJSON FeatureCollection with valid features
	 */
	static cleanData(data: GeoJSONData): GeoJSONData {
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

	/**
	 * Parse CSV data to GeoJSON format
	 *
	 * This function expects the CSV data to have headers: latitude, longitude, and intensity.
	 * It converts the CSV data into a GeoJSON FeatureCollection.
	 */
	static parseCSVToGeoJSON(csvData: string): GeoJSONFeatureCollection {
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
					// Add other properties from the CSV if available
					...Object.fromEntries(
						Object.entries(row)
							.filter(
								([key]) => !["latitude", "longitude", "intensity"].includes(key)
							)
							.map(([key, value]) => {
								// Try to convert numeric strings to numbers
								const numValue = parseFloat(value);
								return [key, isNaN(numValue) ? value : numValue];
							})
					),
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

	/**
	 * Validate if data is a proper GeoJSON FeatureCollection
	 */
	static isValidGeoJSON(data: any): boolean {
		return (
			data &&
			data.type === "FeatureCollection" &&
			Array.isArray(data.features) &&
			data.features.every(
				(feature: any) =>
					feature.type === "Feature" && feature.geometry && feature.properties
			)
		);
	}

	/**
	 * Count features in GeoJSON data
	 */
	static countFeatures(data: GeoJSONData): number {
		return data.features.length;
	}

	/**
	 * Get unique property values from GeoJSON features
	 */
	static getUniquePropertyValues(
		data: GeoJSONData,
		property: string
	): Set<any> {
		const values = new Set<any>();

		data.features.forEach((feature) => {
			if (feature.properties && feature.properties[property] !== undefined) {
				values.add(feature.properties[property]);
			}
		});

		return values;
	}
}
