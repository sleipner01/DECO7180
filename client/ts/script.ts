export interface HeatmapDataPoint {
	latitude: string;
	longitude: string;
	intensity: string;
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

import mapboxgl from "mapbox-gl";
import Papa from "papaparse";
import { ENV } from "./env";

const mapboxToken = ENV.MAPBOX_TOKEN;

// Initialize the map when the page loads
document.addEventListener("DOMContentLoaded", () => {
	// Initialize the map
	mapboxgl.accessToken = mapboxToken;
	const map = new mapboxgl.Map({
		container: "map",
		style: "mapbox://styles/mapbox/light-v11",
		center: [133.7751, -25.2744], // Center of Australia
		zoom: 3.5,
	});

	// Sample data for Australia
	const sampleData = `latitude,longitude,intensity
-33.8688,151.2093,100
-37.8136,144.9631,90
-27.4698,153.0251,80
-31.9505,115.8605,70
-34.9285,138.6007,85
-35.2809,149.1300,75
-42.8821,147.3272,65
-12.4634,130.8456,60
-19.2590,146.8169,55
-23.7000,133.8807,50
-33.7139,150.3114,45
-32.9283,151.7817,40
-34.4278,150.8931,35
-37.5622,143.8503,30
-16.9186,145.7781,25`;

	// Function to parse CSV data and create a GeoJSON feature collection
	function parseCSVToGeoJSON(csvData: string): GeoJSONFeatureCollection {
		const results = Papa.parse<HeatmapDataPoint>(csvData, {
			header: true,
			skipEmptyLines: true,
		});

		const features = results.data.map((row): GeoJSONFeature => {
			const lat = parseFloat(row.latitude);
			const lng = parseFloat(row.longitude);
			const intensity = parseFloat(row.intensity) || 1;

			return {
				type: "Feature",
				properties: {
					intensity: intensity,
				},
				geometry: {
					type: "Point",
					coordinates: [lng, lat] as [number, number],
				},
			};
		});

		return {
			type: "FeatureCollection",
			features: features,
		};
	}

	// Function to add heatmap layer
	function addHeatmapLayer(geojsonData: GeoJSONFeatureCollection): void {
		// Remove existing heatmap layer if it exists
		if (map.getLayer("heatmap-layer")) {
			map.removeLayer("heatmap-layer");
		}

		// Remove existing source if it exists
		if (map.getSource("heatmap-data")) {
			map.removeSource("heatmap-data");
		}

		// Add the data as a source
		map.addSource("heatmap-data", {
			type: "geojson",
			data: geojsonData,
		});

		// Add a heatmap layer
		map.addLayer({
			id: "heatmap-layer",
			type: "heatmap",
			source: "heatmap-data",
			paint: {
				// Increase the heatmap weight based on intensity
				"heatmap-weight": [
					"interpolate",
					["linear"],
					["get", "intensity"],
					0,
					0,
					100,
					1,
				],
				// Increase the heatmap color weight by zoom level
				"heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
				// Color ramp for heatmap
				"heatmap-color": [
					"interpolate",
					["linear"],
					["heatmap-density"],
					0,
					"rgba(0, 0, 255, 0)",
					0.2,
					"rgba(0, 0, 255, 0.5)",
					0.4,
					"rgba(0, 255, 255, 0.5)",
					0.6,
					"rgba(0, 255, 0, 0.5)",
					0.8,
					"rgba(255, 255, 0, 0.5)",
					1,
					"rgba(255, 0, 0, 0.5)",
				],
				// Adjust the heatmap radius by zoom level
				"heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
				// Opacity
				"heatmap-opacity": 0.8,
			},
		});
	}

	// Wait for the map to load
	map.on("load", () => {
		// Load sample data button
		const loadSampleButton = document.getElementById("load-sample");
		if (loadSampleButton) {
			loadSampleButton.addEventListener("click", () => {
				const geojsonData = parseCSVToGeoJSON(sampleData);
				addHeatmapLayer(geojsonData);
			});
		}

		// CSV file input handler
		const csvFileInput = document.getElementById(
			"csv-file"
		) as HTMLInputElement;
		if (csvFileInput) {
			csvFileInput.addEventListener("change", (event) => {
				const target = event.target as HTMLInputElement;
				const file = target.files?.[0];
				if (file) {
					const reader = new FileReader();
					reader.onload = function (e) {
						const csvData = e.target?.result as string;
						const geojsonData = parseCSVToGeoJSON(csvData);
						addHeatmapLayer(geojsonData);
					};
					reader.readAsText(file);
				}
			});
		}
	});
});
