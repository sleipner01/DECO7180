import mapboxgl from "mapbox-gl";
import { GeoJSONFeatureCollection } from "../types";
import { ENV } from "../env";

export class MapService {
	private map: mapboxgl.Map;
	private isMapLoaded = false;
	private pendingData: GeoJSONFeatureCollection | null = null;

	constructor() {
		mapboxgl.accessToken = ENV.MAPBOX_TOKEN;

		this.map = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/mapbox/light-v11",
			center: [133.7751, -25.2744], // Center of Australia
			zoom: 3.5,
		});

		this.setupEventHandlers();
	}

	/**
	 * Set up map event handlers
	 */
	private setupEventHandlers(): void {
		this.map.on("load", () => {
			this.isMapLoaded = true;

			// If we already have data waiting to be displayed
			if (this.pendingData) {
				this.addHeatmapLayer(this.pendingData);
				this.pendingData = null;
			}
		});

		this.map.on("error", (e) => {
			console.error("Mapbox error:", e);
		});
	}

	/**
	 * Display GeoJSON data as a heatmap on the map
	 */
	public displayData(geojsonData: GeoJSONFeatureCollection): void {
		// If map is loaded, add the heatmap layer immediately
		if (this.isMapLoaded) {
			this.addHeatmapLayer(geojsonData);
		} else {
			// Otherwise, store the data until the map is ready
			this.pendingData = geojsonData;
		}
	}

	/**
	 * Add a heatmap layer to the map
	 */
	private addHeatmapLayer(geojsonData: GeoJSONFeatureCollection): void {
		// Remove existing heatmap layer if it exists
		if (this.map.getLayer("heatmap-layer")) {
			this.map.removeLayer("heatmap-layer");
		}

		// Remove existing source if it exists
		if (this.map.getSource("heatmap-data")) {
			this.map.removeSource("heatmap-data");
		}

		// Add the data as a source
		this.map.addSource("heatmap-data", {
			type: "geojson",
			data: geojsonData,
		});

		// Add a heatmap layer
		this.map.addLayer({
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
}
