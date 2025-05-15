import mapboxgl from "mapbox-gl";
import { GeoJSONData } from "../types";
import { DropdownService } from "./dropdownService";
import { LayerService } from "./layerService";
import { FilterService } from "./filterService";
import { ENV } from "../env";

export class MapService {
	private map: mapboxgl.Map;
	private isMapLoaded = false;
	private allData: GeoJSONData | null = null;
	private filterService: FilterService | null = null;
	private districts: Set<string> = new Set();

	constructor() {
		mapboxgl.accessToken = ENV.MAPBOX_TOKEN;

		this.map = new mapboxgl.Map({
			container: "map",
			style: "mapbox://styles/mapbox/light-v11",
			center: [133.7751, -25.2744], // Center of Australia
			zoom: 3.5,
		});
		this.setupEventHandlers();
		this.filterService = new FilterService((filteredData: GeoJSONData) => {
			this.updateMapData(filteredData);
		});
	}

	/**
	 * Set up map event handlers
	 */
	private setupEventHandlers(): void {
		this.map.on("load", () => {
			this.isMapLoaded = true;

			// If we already have data waiting to be displayed
			if (this.allData) {
				this.addHeatmapLayer(this.allData);

				// Initialize filter service with the data once it's available
				if (this.filterService) {
					this.filterService.setSourceData(this.allData);
				}
			}

			this.map.addControl(new mapboxgl.NavigationControl(), "top-left");
		});

		this.map.on("error", (e) => {
			console.error("Mapbox error:", e);
		});
	}

	/**
	 * Display GeoJSON data as a heatmap on the map
	 */
	public displayData(geojsonData: GeoJSONData): void {
		// Always store the original data when it's first passed to the map service
		this.allData = geojsonData;

		// Update the filter service with the new data
		if (this.filterService) {
			this.filterService.setSourceData(geojsonData);
		}

		// If map is loaded, add the heatmap layer immediately
		if (this.isMapLoaded) {
			this.addHeatmapLayer(geojsonData);
		}
	}

	/**
	 * Update map data with filtered data
	 */
	private updateMapData(filteredData: GeoJSONData): void {
		if (!this.isMapLoaded) return;

		// Update the map source with the filtered data
		if (this.map.getSource("heatmap-data")) {
			(this.map.getSource("heatmap-data") as mapboxgl.GeoJSONSource).setData(
				filteredData
			);
		}
	}

	/**
	 * Add a heatmap layer to the map
	 */
	private addHeatmapLayer(geojsonData: GeoJSONData): void {
		// Remove existing heatmap layer if it exists
		if (this.map.getLayer("heatmap-layer")) {
			this.map.removeLayer("heatmap-layer");
		}

		if (this.map.getLayer("infringements-point")) {
			this.map.removeLayer("infringements-point");
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

		// Only populate districts dropdown once
		if (this.districts.size === 0) {
			this.populateDistrictsDropdown(geojsonData);
		}

		// Add a heatmap layer
		this.map.addLayer(LayerService.createHeatmapLayerConfig("heatmap-data"));

		// Add a circle layer for individual points
		this.map.addLayer(LayerService.createCircleLayerConfig("heatmap-data"));

		// Add click interaction for points
		this.setupMapInteractions();
	}

	/**
	 * Set up map interactions like popups and hovers
	 */
	private setupMapInteractions(): void {
		// Add click interaction for points
		this.map.on("click", "infringements-point", (e) => {
			if (!e.features || e.features.length === 0) return;

			const feature = e.features[0];
			const props = feature.properties;

			if (!props) return;

			const coordinates =
				feature.geometry.type === "Point"
					? (feature.geometry.coordinates as [number, number])
					: ([0, 0] as [number, number]);

			// Create popup content using LayerService
			const popupContent = LayerService.createPopup(feature);

			new mapboxgl.Popup()
				.setLngLat(coordinates)
				.setHTML(popupContent)
				.addTo(this.map);
		});

		// Change cursor on hover
		this.map.on("mouseenter", "infringements-point", () => {
			this.map.getCanvas().style.cursor = "pointer";
		});

		this.map.on("mouseleave", "infringements-point", () => {
			this.map.getCanvas().style.cursor = "";
		});
	}

	private populateDistrictsDropdown(data: GeoJSONData): void {
		DropdownService.populateDropdown(data, "district", "district-filter");
	}
}
