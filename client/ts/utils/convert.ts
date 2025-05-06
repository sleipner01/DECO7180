import { HeatmapDataPoint, GeoJSONFeatureCollection } from "../types";

export function convertToGeoJSON(
	pointsArray: HeatmapDataPoint[]
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
