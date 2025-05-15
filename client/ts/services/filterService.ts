import { GeoJSONData } from "../types";
import { showFilterResults } from "../utils/notifications";

export interface FilterOptions {
	intensity: string;
	district: string;
	frequency: string;
	time_period: string;
	weather: string;
}

export class FilterService {
	private filters: FilterOptions = {
		intensity: "all",
		district: "all",
		frequency: "all",
		time_period: "all",
		weather: "all",
	};

	private sourceData: GeoJSONData | null = null;
	private onFilterChange: (filteredData: GeoJSONData) => void;

	constructor(onFilterChange: (filteredData: GeoJSONData) => void) {
		this.onFilterChange = onFilterChange;
		this.setupEventListeners();
	}

	/**
	 * Set the source data for filtering
	 */
	public setSourceData(data: GeoJSONData): void {
		this.sourceData = data;

		// Apply any existing filters to the new data
		if (this.hasActiveFilters()) {
			this.triggerFilterUpdate();
		}
	}

	/**
	 * Set up event listeners for filter controls
	 */
	private setupEventListeners(): void {
		document
			.getElementById("intensity-filter")
			?.addEventListener("change", (e) => {
				this.filters.intensity = (e.target as HTMLSelectElement).value;
				this.triggerFilterUpdate();
			});

		document
			.getElementById("district-filter")
			?.addEventListener("change", (e) => {
				this.filters.district = (e.target as HTMLSelectElement).value;
				this.triggerFilterUpdate();
			});

		document
			.getElementById("frequency-filter")
			?.addEventListener("change", (e) => {
				this.filters.frequency = (e.target as HTMLSelectElement).value;
				this.triggerFilterUpdate();
			});

		document
			.getElementById("time-period-filter")
			?.addEventListener("change", (e) => {
				this.filters.time_period = (e.target as HTMLSelectElement).value;
				this.triggerFilterUpdate();
			});

		document
			.getElementById("weather-filter")
			?.addEventListener("change", (e) => {
				this.filters.weather = (e.target as HTMLSelectElement).value;
				this.triggerFilterUpdate();
			});

		document.getElementById("reset-filters")?.addEventListener("click", () => {
			this.resetFilters();
		});
	}

	/**
	 * Reset all filters to their default values
	 */
	public resetFilters(): void {
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

		this.triggerFilterUpdate();
	}

	/**
	 * Check if any filters are active (not set to 'all')
	 */
	private hasActiveFilters(): boolean {
		return Object.values(this.filters).some((value) => value !== "all");
	}

	/**
	 * Apply filters to the data
	 */
	private filterData(): GeoJSONData {
		if (!this.sourceData) {
			console.error("No data available for filtering");
			return { type: "FeatureCollection", features: [] };
		}

		console.log("Filtering data with:", this.filters);

		const filteredFeatures = this.sourceData.features.filter((feature) => {
			const props = feature.properties;
			if (!props) return false;

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

		const filteredData = {
			type: "FeatureCollection" as const,
			features: filteredFeatures,
		};

		this.updateFilterSummary(filteredFeatures.length);
		return filteredData;
	}

	/**
	 * Trigger filter update and notify the callback
	 */
	private triggerFilterUpdate(): void {
		if (!this.sourceData) return;

		const filteredData = this.filterData();
		this.onFilterChange(filteredData);
	}

	/**
	 * Update the filter summary for accessibility and notifications
	 */
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

		// Use the notification utility for visible feedback
		showFilterResults(count, activeFilters);
	}
}
