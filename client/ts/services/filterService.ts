import { GeoJSONData } from "../types";
import { showFilterResults } from "../utils/notifications";

export interface FilterOptions {
	intensity: string;
	district: string;
	frequency: string;
	time_period: string;
	weather: string;
}

/**
 * Service class for handling filters on GeoJSON data.
 *
 * This class manages the state of filters, applies them to the data,
 * and notifies the application of changes.
 * It also handles the visibility of filter controls on mobile devices.
 */
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
		this.setupMobileFilterToggle();
		this.initializeFilterVisibility();
		this.setupResizeHandler();
	}

	/**
	 * Set the source data for filtering
	 *
	 * @param data - The GeoJSON data to be filtered
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
	 *
	 * @param count - The number of features after filtering
	 */
	private updateFilterSummary(count: number): void {
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

	/**
	 * Set up mobile filter toggle functionality
	 */
	private setupMobileFilterToggle(): void {
		const filterToggle = document.getElementById("filter-toggle");
		const filterPanel = document.getElementById("map-controls");
		const filterClose = document.getElementById("filter-close");

		if (filterToggle && filterPanel) {
			// Toggle filter panel visibility when button is clicked
			filterToggle.addEventListener("click", () => {
				const isExpanded =
					filterToggle.getAttribute("aria-expanded") === "true";
				filterToggle.setAttribute("aria-expanded", (!isExpanded).toString());

				if (!isExpanded) {
					this.applyCompactModeIfNeeded();
					filterPanel.classList.add("visible");
				} else {
					filterPanel.classList.remove("visible");
				}
			});

			// Close with the dedicated close button
			if (filterClose) {
				filterClose.addEventListener("click", () => {
					filterPanel.classList.remove("visible");
					filterToggle.setAttribute("aria-expanded", "false");
					filterToggle.focus(); // Return focus to toggle for accessibility
				});
			}

			// Close panel when clicking outside
			document.addEventListener("click", (event) => {
				const target = event.target as Element;

				if (
					filterPanel.classList.contains("visible") &&
					!filterPanel.contains(target) &&
					target !== filterToggle &&
					!filterToggle.contains(target)
				) {
					filterPanel.classList.remove("visible");
					filterToggle.setAttribute("aria-expanded", "false");
				}
			});

			// Close panel when pressing Escape key
			document.addEventListener("keydown", (event) => {
				if (
					event.key === "Escape" &&
					filterPanel.classList.contains("visible")
				) {
					filterPanel.classList.remove("visible");
					filterToggle.setAttribute("aria-expanded", "false");
					filterToggle.focus(); // Return focus to toggle for accessibility
				}
			});
		}
	}

	/**
	 * Initialize filter visibility based on screen size
	 */
	private initializeFilterVisibility(): void {
		const filterPanel = document.getElementById("map-controls");
		if (filterPanel) {
			// Check if we're on mobile
			if (window.innerWidth <= 768) {
				filterPanel.classList.remove("visible");
			} else {
				filterPanel.classList.add("visible");
			}
		}
		this.applyCompactModeIfNeeded();
	}

	/**
	 * Set up window resize handler to adjust filter visibility
	 */
	private setupResizeHandler(): void {
		window.addEventListener("resize", () => {
			const filterPanel = document.getElementById("map-controls");
			const filterToggle = document.getElementById("filter-toggle");

			if (filterPanel && filterToggle) {
				if (window.innerWidth > 768) {
					// On desktop, always show filters
					filterPanel.classList.add("visible");
				} else {
					// On mobile, hide filters unless explicitly shown
					if (filterToggle.getAttribute("aria-expanded") !== "true") {
						filterPanel.classList.remove("visible");
					}
				}
			}
			this.applyCompactModeIfNeeded();
		});
	}

	/**
	 * Check and apply compact mode for small screen heights
	 */
	private applyCompactModeIfNeeded(): void {
		const filterPanel = document.getElementById("map-controls");
		if (!filterPanel) return;

		// Consider screens shorter than 600px to be "short screens"
		const isShortScreen = window.innerHeight < 600;

		if (isShortScreen) {
			filterPanel.classList.add("compact-mode");
		} else {
			filterPanel.classList.remove("compact-mode");
		}

		// For extremely small screens, limit the max-height further
		if (window.innerHeight < 500) {
			filterPanel.style.maxHeight = "95vh"; // Allow it to take almost the full height
		} else {
			filterPanel.style.maxHeight = "85vh"; // Default max height
		}
	}
}
