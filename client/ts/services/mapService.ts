import mapboxgl from "mapbox-gl";
import { GeoJSONData } from "../types";
import { showFilterResults } from "../utils/notifications";
import { ENV } from "../env";

export class MapService {
	private map: mapboxgl.Map;
	private isMapLoaded = false;
	private allData: GeoJSONData | null = null;
	private filters = {
		intensity: "all",
		district: "all",
		frequency: "all",
		time_period: "all",
		weather: "all",
	};
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
		this.setupEventListeners();
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
				// this.allData = null;
			}
			this.map.addControl(new mapboxgl.NavigationControl(), "top-left");
		});

		this.map.on("error", (e) => {
			console.error("Mapbox error:", e);
		});
	}

	private setupEventListeners(): void {
		document
			.getElementById("intensity-filter")
			?.addEventListener("change", (e) => {
				this.filters.intensity = (e.target as HTMLSelectElement).value;
				this.filterData();
			});

		document
			.getElementById("district-filter")
			?.addEventListener("change", (e) => {
				this.filters.district = (e.target as HTMLSelectElement).value;
				this.filterData();
			});

		document
			.getElementById("frequency-filter")
			?.addEventListener("change", (e) => {
				this.filters.frequency = (e.target as HTMLSelectElement).value;
				this.filterData();
			});

		document
			.getElementById("time-period-filter")
			?.addEventListener("change", (e) => {
				this.filters.time_period = (e.target as HTMLSelectElement).value;
				this.filterData();
			});

		document
			.getElementById("weather-filter")
			?.addEventListener("change", (e) => {
				this.filters.weather = (e.target as HTMLSelectElement).value;
				this.filterData();
			});

		document.getElementById("reset-filters")?.addEventListener("click", () => {
			// Reset all filters to 'all'
			this.filters = {
				intensity: "all",
				district: "all",
				frequency: "all",
				time_period: "all",
				weather: "all",
			};

			// Reset all select elements to their default values
			const selects = document.querySelectorAll(".filter-group select");
			selects.forEach((select) => {
				(select as HTMLSelectElement).value = "all";
			});

			this.filterData();
		});
	}

	/**
	 * Display GeoJSON data as a heatmap on the map
	 */
	public displayData(geojsonData: GeoJSONData): void {
		// Always store the original data when it's first passed to the map service
		this.allData = geojsonData;

		// If map is loaded, add the heatmap layer immediately
		if (this.isMapLoaded) {
			this.addHeatmapLayer(geojsonData);
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
		this.map.addLayer({
			id: "heatmap-layer",
			type: "heatmap",
			source: "heatmap-data",
			layout: {
				visibility: "visible",
			},
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
				// Opacity - more gradual fade out
				"heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 6, 1, 9, 0],
			},
		});

		// Add a circle layer for individual points
		this.map.addLayer({
			id: "infringements-point",
			type: "circle",
			source: "heatmap-data",
			minzoom: 5, // Start rendering circles earlier
			paint: {
				// Size circle radius by intensity and zoom level
				"circle-radius": [
					"interpolate",
					["linear"],
					["zoom"],
					5, // Start with smaller circles at lower zoom
					["interpolate", ["linear"], ["get", "intensity"], 0, 0.5, 100, 2],
					7,
					["interpolate", ["linear"], ["get", "intensity"], 0, 1, 100, 4],
					16,
					["interpolate", ["linear"], ["get", "intensity"], 0, 5, 100, 20],
				],
				// Color circle by intensity
				"circle-color": [
					"interpolate",
					["linear"],
					["get", "intensity"],
					0,
					"blue",
					50,
					"yellow",
					100,
					"red",
				],
				"circle-stroke-width": [
					"interpolate",
					["linear"],
					["zoom"],
					6,
					0,
					8,
					1,
				],
				"circle-stroke-color": "white",
				// More gradual opacity transition
				"circle-opacity": [
					"interpolate",
					["linear"],
					["zoom"],
					5,
					0, // Fully transparent at zoom level 5
					7,
					0.3, // Start becoming visible
					9,
					0.8, // Almost fully visible by zoom level 9
				],
			},
		});

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

			// Create popup content
			let popupContent = `<h3>${props.location}</h3>`;
			if (props.district)
				popupContent += `<p><strong>District:</strong> ${props.district}</p>`;
			if (props.region)
				popupContent += `<p><strong>Region:</strong> ${props.region}</p>`;
			if (props.count !== undefined)
				popupContent += `<p><strong>Count:</strong> ${props.count}</p>`;
			if (props.intensity !== undefined)
				popupContent += `<p><strong>Intensity:</strong> ${Math.round(
					props.intensity
				)}%</p>`;
			if (props.frequency)
				popupContent += `<p><strong>Frequency:</strong> ${props.frequency}</p>`;
			if (props.weather)
				popupContent += `<p><strong>Weather:</strong> ${props.weather}</p>`;
			if (props.time_period)
				popupContent += `<p><strong>Time Period:</strong> ${props.time_period}</p>`;
			if (props.time_of_day)
				popupContent += `<p><strong>Time of Day:</strong> ${props.time_of_day}</p>`;

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
		const districtsSet = new Set<string>();

		// Extract unique districts from the data
		data.features.forEach((feature) => {
			if (feature.properties?.district) {
				districtsSet.add(feature.properties.district);
			}
		});

		this.districts = districtsSet;

		// Populate the district dropdown
		const districtFilter = document.getElementById("district-filter");
		if (districtFilter) {
			// Sort districts alphabetically
			const sortedDistricts = Array.from(districtsSet).sort();

			sortedDistricts.forEach((district) => {
				const option = document.createElement("option");
				option.value = district;
				option.textContent = district;
				districtFilter.appendChild(option);
			});
		}
	}

	private filterData(): void {
		if (!this.allData) {
			console.error("No data available for filtering");
			return;
		}

		console.log("Filtering data with:", this.filters);
		console.log("Original data features count:", this.allData.features.length);

		const filteredFeatures = this.allData.features.filter((feature) => {
			const props = feature.properties;
			if (!props) return false;

			// Debug individual properties to see what's going wrong
			if (
				this.filters.intensity !== "all" &&
				props.intensity_category !== this.filters.intensity
			) {
				return false;
			}

			if (
				this.filters.district !== "all" &&
				props.district !== this.filters.district
			) {
				return false;
			}

			if (
				this.filters.frequency !== "all" &&
				props.frequency !== this.filters.frequency
			) {
				return false;
			}

			if (
				this.filters.time_period !== "all" &&
				props.time_period !== this.filters.time_period
			) {
				return false;
			}

			if (
				this.filters.weather !== "all" &&
				props.weather !== this.filters.weather
			) {
				return false;
			}

			return true;
		});

		console.log("Filtered features count:", filteredFeatures.length);

		// Create a new GeoJSON object with the filtered features
		const filteredData = {
			type: "FeatureCollection",
			features: filteredFeatures,
		};

		// Update the map source with the filtered data
		if (this.map.getSource("heatmap-data")) {
			(this.map.getSource("heatmap-data") as mapboxgl.GeoJSONSource).setData(
				filteredData as GeoJSON.FeatureCollection
			);
			console.log("Updated map source with filtered data");
		} else {
			console.error("Map source 'heatmap-data' not found");
		}

		// Add count information to UI for accessibility and user feedback
		this.updateFilterSummary(filteredFeatures.length);
	}

	private updateFilterSummary(count: number): void {
		console.log("Filtered count:", count);

		// Create a summary of active filters for accessibility
		const activeFilters = Object.entries(this.filters)
			.filter(([_, value]) => value !== "all")
			.map(([key, value]) => `${key.replace("_", " ")}: ${value}`)
			.join(", ");

		const summaryText = activeFilters
			? `Showing ${count} results filtered by ${activeFilters}`
			: `Showing all ${count} results, no filters applied`;

		// Update or create a hidden element for screen readers
		let filterSummary = document.getElementById("filter-summary");
		if (!filterSummary) {
			filterSummary = document.createElement("div");
			filterSummary.id = "filter-summary";
			filterSummary.className = "sr-only";
			filterSummary.setAttribute("aria-live", "polite");
			document.body.appendChild(filterSummary);
		}

		filterSummary.textContent = summaryText;

		// Use the new notification utility with the filter results
		showFilterResults(count, activeFilters);
	}
}
