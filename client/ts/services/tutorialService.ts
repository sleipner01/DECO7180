export interface TutorialStep {
	element: string; // CSS selector for the target element
	title: string;
	content: string;
	position: "top" | "bottom" | "left" | "right" | "center";
}

/**
 * Service class for handling the tutorial steps
 * and user interactions.
 *
 * This class manages the display of tutorial steps,
 * including highlighting elements, showing tooltips,
 * and handling user navigation through the tutorial.
 * It also manages the visibility of the filter panel
 * on mobile devices.
 */
export class TutorialService {
	private steps: TutorialStep[];
	private currentStep: number = 0;
	private overlay: HTMLElement | null = null;
	private tooltip: HTMLElement | null = null;
	private isActive: boolean = false;
	private filterPanelShownForTutorial: boolean = false;

	constructor(steps: TutorialStep[] = []) {
		this.steps = steps;

		// If no steps are provided, use default tutorial steps
		if (steps.length === 0) {
			this.steps = this.getDefaultSteps();
		}

		this.checkFirstVisit();
	}

	/**
	 * Check if this is the user's first visit and show tutorial if it is
	 */
	private checkFirstVisit(): void {
		const hasSeen = localStorage.getItem("tutorial_seen");

		if (!hasSeen) {
			setTimeout(() => {
				this.start();
			}, 1000);

			// Mark that the user has seen the tutorial
			localStorage.setItem("tutorial_seen", "true");
		}
	}

	/**
	 * Get default tutorial steps
	 */
	private getDefaultSteps(): TutorialStep[] {
		const isMobile = window.innerWidth <= 768; // Standard mobile breakpoint

		const baseSteps: TutorialStep[] = [
			{
				element: "#map",
				title: "Welcome to Traffic Infringement Map",
				content:
					"This interactive map shows traffic infringement data across Australia. Let us show you how to use it!",
				position: "center",
			},
			{
				element: ".mapboxgl-ctrl-zoom-in",
				title: "Navigation",
				content:
					"Use these controls to zoom in and out of the map, or use your mouse wheel.",
				position: "right",
			},
			{
				element: "#map-controls",
				title: "Filter Panel",
				content:
					"Use these filters to narrow down the data by different categories.",
				position: "left",
			},
			{
				element: "#district-filter",
				title: "District Filter",
				content: "Select a specific district to focus on a geographic area.",
				position: "left",
			},
			{
				element: "#intensity-filter",
				title: "Intensity Filter",
				content:
					"Filter by intensity level to see more or less severe infringement areas.",
				position: "left",
			},
			{
				element: "#map",
				title: "Data Points",
				content:
					"When zoomed close in on the map, click on any colored circle to see detailed information about that location.",
				position: "top",
			},
			{
				element: "#help-button",
				title: "Help Button",
				content: "Click this button to restart the tutorial at any time.",
				position: "left",
			},
		];

		// Only add the mobile filter step if we're on a mobile device
		if (isMobile) {
			baseSteps.push({
				element: "#filter-toggle",
				title: "Mobile Filters",
				content:
					"On mobile devices, tap this button to show or hide the filters panel.",
				position: "left",
			});
		}

		baseSteps.push({
			element: "#map",
			title: "Finish",
			content: "Now, you know the basics. Enjoy exploring the map!",
			position: "center",
		});

		return baseSteps;
	}

	/**
	 * Start the tutorial
	 */
	public start(): void {
		if (this.steps.length === 0) return;

		this.isActive = true;
		this.currentStep = 0;
		this.createOverlay();
		this.showStep(this.currentStep);

		// Add tutorial marker to body for CSS targeting
		document.body.classList.add("tutorial-active");

		// Add keyboard handler for escape key
		document.addEventListener("keydown", this.handleKeydown);
	}

	/**
	 * Create the overlay and tooltip elements
	 */
	private createOverlay(): void {
		// Create semi-transparent overlay
		this.overlay = document.createElement("div");
		this.overlay.className = "tutorial-overlay";
		document.body.appendChild(this.overlay);

		// Create tooltip container
		this.tooltip = document.createElement("div");
		this.tooltip.className = "tutorial-tooltip";
		document.body.appendChild(this.tooltip);

		// Close tutorial when clicking overlay
		this.overlay.addEventListener("click", (e) => {
			// Only close if clicking directly on the overlay, not on any child elements
			if (e.target === this.overlay) {
				this.end();
			}
		});
	}

	/**
	 * Show a specific tutorial step
	 *
	 * @param index Index of the step to show
	 */
	private showStep(index: number): void {
		if (!this.isActive || !this.tooltip || index >= this.steps.length) return;

		const step = this.steps[index];
		const element = document.querySelector(step.element);

		if (!element) {
			console.warn(`Tutorial element not found: ${step.element}`);
			this.nextStep();
			return;
		}

		// For mobile filter step, ensure the filter panel is visible
		// Check if current step involves a filter element
		const isFilterRelatedStep =
			step.element === "#map-controls" ||
			step.element === "#district-filter" ||
			step.element === "#intensity-filter";

		// Show filters only if the current step is filter-related
		if (isFilterRelatedStep) {
			this.showFiltersIfNeeded();
		} else {
			// Hide filters if this step is not filter-related and we previously showed it for the tutorial
			if (this.filterPanelShownForTutorial && window.innerWidth <= 768) {
				const filterPanel = document.getElementById("map-controls");
				const filterToggle = document.getElementById("filter-toggle");

				if (filterPanel && filterToggle) {
					filterPanel.classList.remove("visible");
					filterToggle.setAttribute("aria-expanded", "false");
				}
			}
		}

		// Highlight the target element
		this.highlightElement(element);

		// Build tooltip content
		this.tooltip.innerHTML = `
      <div class="tutorial-header">
        <h3>${step.title}</h3>
        <span class="tutorial-progress">${index + 1}/${this.steps.length}</span>
      </div>
      <div class="tutorial-content">${step.content}</div>
      <div class="tutorial-footer">
        <button class="tutorial-button skip-button">Skip Tutorial</button>
        <div>
          ${
						index > 0
							? '<button class="tutorial-button prev-button">Previous</button>'
							: ""
					}
          ${
						index < this.steps.length - 1
							? '<button class="tutorial-button next-button">Next</button>'
							: '<button class="tutorial-button finish-button">Finish</button>'
					}
        </div>
      </div>
    `;

		// Position tooltip
		this.positionTooltip(element as HTMLElement, step.position || "center");

		// Add event listeners for buttons
		this.tooltip
			.querySelector(".next-button")
			?.addEventListener("click", () => this.nextStep());
		this.tooltip
			.querySelector(".prev-button")
			?.addEventListener("click", () => this.prevStep());
		this.tooltip
			.querySelector(".finish-button")
			?.addEventListener("click", () => this.end());
		this.tooltip
			.querySelector(".skip-button")
			?.addEventListener("click", () => this.end());
	}

	/**
	 * Highlight an element during the tutorial
	 *
	 * @param element Element to highlight
	 */
	private highlightElement(element: Element): void {
		// First, remove any existing highlights
		this.removeHighlight();

		// Create a highlight effect instead of modifying the element
		const rect = element.getBoundingClientRect();

		// Create a highlight div
		const highlight = document.createElement("div");
		highlight.className = "tutorial-element-highlight";
		highlight.style.position = "absolute";
		highlight.style.top = `${rect.top + window.scrollY}px`;
		highlight.style.left = `${rect.left + window.scrollX}px`;
		highlight.style.width = `${rect.width}px`;
		highlight.style.height = `${rect.height}px`;
		highlight.style.zIndex = "1000"; // Below the tooltip but above the overlay
		highlight.style.pointerEvents = "none"; // Let clicks go through to the actual element
		highlight.style.boxShadow = "0 0 0 4px rgba(74, 144, 226, 0.6)";
		highlight.style.borderRadius = "3px";

		document.body.appendChild(highlight);

		// Add a class to the element for additional styling if needed
		// but don't change its position
		element.classList.add("tutorial-highlighted-element");

		// Make sure the element is clickable through the overlay
		if (this.overlay) {
			// Create a hole in the overlay where this element is
			this.overlay.style.pointerEvents = "auto";
			const overlayRect = this.overlay.getBoundingClientRect();
			this.overlay.style.background = `radial-gradient(
        ellipse at ${rect.left - overlayRect.left + rect.width / 2}px ${
				rect.top - overlayRect.top + rect.height / 2
			}px,
        transparent ${Math.max(rect.width, rect.height) / 2}px,
        rgba(0, 0, 0, 0.5) ${Math.max(rect.width, rect.height) / 2 + 20}px
      )`;
		}
	}

	/**
	 * Remove highlight effect
	 */
	private removeHighlight(): void {
		// Remove highlight div
		const highlights = document.querySelectorAll(".tutorial-element-highlight");
		highlights.forEach((el) => el.remove());

		// Remove class from any previously highlighted elements
		const highlighted = document.querySelectorAll(
			".tutorial-highlighted-element"
		);
		highlighted.forEach((el) =>
			el.classList.remove("tutorial-highlighted-element")
		);

		// Reset overlay background if needed
		if (this.overlay) {
			this.overlay.style.background = "rgba(0, 0, 0, 0.5)";
		}
	}

	/**
	 * Show the filters panel if we're on mobile
	 */
	private showFiltersIfNeeded(): void {
		if (window.innerWidth <= 768) {
			const filterPanel = document.getElementById("map-controls");
			const filterToggle = document.getElementById("filter-toggle");

			if (filterPanel && filterToggle) {
				// Make sure filter panel is visible for the tutorial
				if (!filterPanel.classList.contains("visible")) {
					filterPanel.classList.add("visible");
					filterToggle.setAttribute("aria-expanded", "true");
					this.filterPanelShownForTutorial = true;
				}
			}
		}
	}

	/**
	 * Position the tooltip relative to the highlighted element
	 */
	private positionTooltip(
		element: HTMLElement,
		position: Exclude<TutorialStep["position"], undefined>
	): void {
		if (!this.tooltip) return;

		const rect = element.getBoundingClientRect();
		const tooltipRect = this.tooltip.getBoundingClientRect();
		const margin = 15; // Space between element and tooltip

		let top = 0;
		let left = 0;

		// Calculate position based on specified direction
		switch (position) {
			case "top":
				top = rect.top - tooltipRect.height - margin + window.scrollY;
				left =
					rect.left + rect.width / 2 - tooltipRect.width / 2 + window.scrollX;
				break;
			case "bottom":
				top = rect.bottom + margin + window.scrollY;
				left =
					rect.left + rect.width / 2 - tooltipRect.width / 2 + window.scrollX;
				break;
			case "left":
				top =
					rect.top + rect.height / 2 - tooltipRect.height / 2 + window.scrollY;
				left = rect.left - tooltipRect.width - margin + window.scrollX;
				break;
			case "right":
				top =
					rect.top + rect.height / 2 - tooltipRect.height / 2 + window.scrollY;
				left = rect.right + margin + window.scrollX;
				break;
			case "center":
				top =
					rect.top + rect.height / 2 - tooltipRect.height / 2 + window.scrollY;
				left =
					rect.left + rect.width / 2 - tooltipRect.width / 2 + window.scrollX;
				break;
		}

		// Keep tooltip in viewport
		if (left < 10) left = 10;
		if (left + tooltipRect.width > window.innerWidth - 10)
			left = window.innerWidth - tooltipRect.width - 10;

		if (top < 10) top = 10;
		if (top + tooltipRect.height > window.innerHeight - 10)
			top = window.innerHeight - tooltipRect.height - 10;

		// Apply position
		this.tooltip.style.top = `${top}px`;
		this.tooltip.style.left = `${left}px`;

		// Add arrow pointing to element
		this.tooltip.setAttribute("data-position", position);
	}

	/**
	 * Handle keyboard events
	 *
	 * @param e Keyboard event
	 */
	private handleKeydown = (e: KeyboardEvent): void => {
		if (!this.isActive) return;

		if (e.key === "Escape") {
			this.end();
		} else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
			this.nextStep();
		} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
			this.prevStep();
		}
	};

	/**
	 * Go to the next step
	 */
	public nextStep(): void {
		if (this.currentStep < this.steps.length - 1) {
			this.currentStep++;
			this.showStep(this.currentStep);
		} else {
			this.end();
		}
	}

	/**
	 * Go to the previous step
	 */
	public prevStep(): void {
		if (this.currentStep > 0) {
			this.currentStep--;
			this.showStep(this.currentStep);
		}
	}

	/**
	 * End the tutorial
	 */
	public end(): void {
		this.isActive = false;
		document.body.classList.remove("tutorial-active");

		// Clean up any elements we added
		if (this.overlay) {
			document.body.removeChild(this.overlay);
			this.overlay = null;
		}

		if (this.tooltip) {
			document.body.removeChild(this.tooltip);
			this.tooltip = null;
		}

		// Remove keyboard event listener
		document.removeEventListener("keydown", this.handleKeydown);

		this.removeHighlight();

		// Hide filter panel if it was shown specifically for the tutorial
		if (this.filterPanelShownForTutorial && window.innerWidth <= 768) {
			const filterPanel = document.getElementById("map-controls");
			const filterToggle = document.getElementById("filter-toggle");

			if (filterPanel && filterToggle) {
				filterPanel.classList.remove("visible");
				filterToggle.setAttribute("aria-expanded", "false");
				this.filterPanelShownForTutorial = false;
			}
		}
	}

	/**
	 * Check if tutorial is currently active
	 * @returns boolean indicating if tutorial is active
	 */
	public isTutorialActive(): boolean {
		return this.isActive;
	}
}
