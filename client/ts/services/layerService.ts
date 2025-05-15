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
