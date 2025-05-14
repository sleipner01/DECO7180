import type {
	Feature,
	FeatureCollection,
	Geometry,
	GeoJsonProperties,
} from "geojson";

// Base GeoJSON interfaces (using standard types)
export type GeoJSONFeatureCollection = FeatureCollection;
export type GeoJSONFeature = Feature;

export interface CSVHeatmapDataPoint {
	latitude: string;
	longitude: string;
	intensity: string;
	[key: string]: string;
}

export interface HeatmapDataPoint {
	latitude: number;
	longitude: number;
	intensity: number;
}

// Extended interfaces with your specific properties
export interface ExtendedGeoJSONFeatureProperties {
	intensity: number; // Make this required to match the base requirement
	location?: string;
	count?: number;
	data_type?: string;
	district?: string;
	region?: string;
	visits?: number | null;
	hours?: number | null;
	checked?: number | null;
	intensity_category?: string;
	frequency?: string;
	weather?: string;
	time_of_day?: string;
	time_period?: string;
	[key: string]: any; // Allow additional properties
}

// Your extended feature
export interface ExtendedGeoJSONFeature extends Omit<Feature, "properties"> {
	properties: ExtendedGeoJSONFeatureProperties; // Make properties required with your extended type
}

// Your extended feature collection
export interface ExtendedGeoJSONFeatureCollection
	extends Omit<FeatureCollection, "features"> {
	features: ExtendedGeoJSONFeature[];
}

// If you need to maintain compatibility with existing code using GeoJSONData
export type GeoJSONData = GeoJSONFeatureCollection; // This makes GeoJSONData an alias for GeoJSONFeatureCollection
