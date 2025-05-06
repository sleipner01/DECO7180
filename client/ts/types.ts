export interface CSVHeatmapDataPoint {
	latitude: string;
	longitude: string;
	intensity: string;
}

export interface HeatmapDataPoint {
	latitude: number;
	longitude: number;
	intensity: number;
}

export interface GeoJSONFeature {
	type: "Feature";
	properties: {
		intensity: number;
	};
	geometry: {
		type: "Point";
		coordinates: [number, number];
	};
}

export interface GeoJSONFeatureCollection {
	type: "FeatureCollection";
	features: GeoJSONFeature[];
}
