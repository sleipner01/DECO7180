import { CircleLayerSpecification, HeatmapLayerSpecification } from "mapbox-gl";

export class LayerService {
	/**
	 * Create a heatmap layer configuration
	 */
	static createHeatmapLayerConfig(sourceId: string): HeatmapLayerSpecification {
		return {
			id: "heatmap-layer",
			type: "heatmap",
			source: sourceId,
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
		};
	}

	/**
	 * Create a circle layer configuration
	 */
	static createCircleLayerConfig(sourceId: string): CircleLayerSpecification {
		return {
			id: "infringements-point",
			type: "circle",
			source: sourceId,
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
				"circle-color": [
					"interpolate",
					["linear"],
					["get", "intensity"],
					0,
					"#1a73e8", // Bright blue for lowest intensity
					25,
					"#32b47d", // Teal-green for low-medium intensity
					50,
					"#fbb726", // Amber for medium intensity
					75,
					"#f57d00", // Orange for medium-high intensity
					100,
					"#ea4335", // Bright red for highest intensity
				],
				// Increase stroke width for better visibility
				"circle-stroke-width": [
					"interpolate",
					["linear"],
					["zoom"],
					6,
					0.5, // Thin stroke even at lower zoom levels
					8,
					1.5, // Thicker stroke at higher zoom levels
				],
				"circle-stroke-color": "rgba(230, 230, 230, 0.6)",
				"circle-opacity": [
					"interpolate",
					["linear"],
					["zoom"],
					7,
					0.1, // Slightly visible at low zoom
					8,
					0.5, // More visible at medium zoom
					9,
					0.9, // Almost fully visible at high zoom
				],
			},
		};
	}

	/**
	 * Create a popup with feature information
	 */
	static createPopup(feature: any): string {
		const props = feature.properties;
		if (!props) return "";

		let popupContent = `<h3>${props.location || "Location"}</h3>`;
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

		return popupContent;
	}
}
