import {
	HeatmapDataPoint,
	GeoJSONFeatureCollection,
	CSVHeatmapDataPoint,
} from "../types";

/**
 * Convert an array of points to GeoJSON FeatureCollection format
 * This function expects that the input data already contains numbers
 */
export function convertToGeoJSON(
	pointsArray: HeatmapDataPoint[]
): GeoJSONFeatureCollection {
	return {
		type: "FeatureCollection",
		features: pointsArray.map((point) => ({
			type: "Feature" as const,
			properties: {
				intensity: point.intensity,
			},
			geometry: {
				type: "Point" as const,
				coordinates: [point.longitude, point.latitude] as [number, number],
			},
		})),
	};
}

/**
 * Convert CSV-formatted points (with string values) to GeoJSON
 * Use this for raw CSV data that hasn't been pre-processed
 */
export function convertCSVToGeoJSON(
	pointsArray: CSVHeatmapDataPoint[]
): GeoJSONFeatureCollection {
	return {
		type: "FeatureCollection",
		features: pointsArray.map((point) => ({
			type: "Feature" as const,
			properties: {
				intensity: parseFloat(point.intensity) || 0,
			},
			geometry: {
				type: "Point" as const,
				coordinates: [
					parseFloat(point.longitude) || 0,
					parseFloat(point.latitude) || 0,
				] as [number, number],
			},
		})),
	};
}
