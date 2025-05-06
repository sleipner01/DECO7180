/**
 * Accessibility utilities for enhancing screen reader and keyboard navigation support
 */

/**
 * Sets up all accessibility features for the application
 */
export function setupAccessibility(): void {
	setupInfoPanel();
	setupLoadingAnnouncements();
	setupKeyboardTraps();
	setupSkipLink();
}

/**
 * Sets up skip link functionality
 */
function setupSkipLink(): void {
	const skipLink = document.querySelector("#skip-link");
	if (!skipLink) return;

	skipLink.addEventListener("click", (e) => {
		e.preventDefault();
		const targetId = skipLink.getAttribute("href")?.substring(1) || "";
		if (!targetId) return;
		const targetElement = document.getElementById(targetId);

		if (targetElement) {
			targetElement.focus();
			targetElement.setAttribute("tabindex", "-1");

			// Scroll to the element
			targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	});
}

/**
 * Sets up the information panel with proper ARIA attributes and keyboard controls
 */
function setupInfoPanel(): void {
	const infoToggle = document.getElementById("info-toggle");
	const infoPanel = document.getElementById("info-panel");
	const closeInfo = document.getElementById("close-info");

	if (infoToggle && infoPanel && closeInfo) {
		infoToggle.addEventListener("click", () => {
			const isExpanded = infoToggle.getAttribute("aria-expanded") === "true";
			infoToggle.setAttribute("aria-expanded", (!isExpanded).toString());
			infoPanel.hidden = isExpanded;

			// Announce change to screen readers
			if (!isExpanded) {
				announceToScreenReader("Information panel opened");
			}
		});

		closeInfo.addEventListener("click", () => {
			infoToggle.setAttribute("aria-expanded", "false");
			infoPanel.hidden = true;
			infoToggle.focus(); // Return focus to toggle button
			announceToScreenReader("Information panel closed");
		});

		infoPanel.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				infoToggle.setAttribute("aria-expanded", "false");
				infoPanel.hidden = true;
				infoToggle.focus();
				announceToScreenReader("Information panel closed");
			}
		});
	}
}

/**
 * Sets up loading state announcements for screen readers
 */
function setupLoadingAnnouncements(): void {
	const loadingOverlay = document.getElementById("loading-overlay");
	if (loadingOverlay) {
		// Update ARIA attributes when loading state changes
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (
					mutation.type === "attributes" &&
					mutation.attributeName === "style"
				) {
					const isLoading =
						window.getComputedStyle(loadingOverlay).display !== "none";
					loadingOverlay.setAttribute("aria-busy", isLoading.toString());

					if (isLoading) {
						announceToScreenReader("Loading map data, please wait");
					} else {
						announceToScreenReader("Map data loaded");
					}
				}
			});
		});

		observer.observe(loadingOverlay, { attributes: true });
	}
}

/**
 * Announces a message to screen readers using aria-live regions
 * @param message The message to announce
 */
export function announceToScreenReader(message: string): void {
	// Create or get the announcer element
	let announcer = document.getElementById("sr-announcer");

	if (!announcer) {
		announcer = document.createElement("div");
		announcer.id = "sr-announcer";
		announcer.setAttribute("aria-live", "polite");
		announcer.setAttribute("aria-atomic", "true");
		announcer.classList.add("sr-only");
		document.body.appendChild(announcer);
	}

	announcer.textContent = message;

	// Clear the announcer after 5 seconds to prevent duplicate announcements
	setTimeout(() => {
		announcer.textContent = "";
	}, 5000);
}

/**
 * Sets up keyboard traps for modal dialogs and other components
 */
function setupKeyboardTraps(): void {
	// Focus trap for modal dialogs
	const trapFocus = (element: HTMLElement): void => {
		const focusableElements = element.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0] as HTMLElement;
		const lastElement = focusableElements[
			focusableElements.length - 1
		] as HTMLElement;

		// Trap focus in the element
		element.addEventListener("keydown", (event) => {
			if (event.key === "Tab") {
				if (event.shiftKey && document.activeElement === firstElement) {
					event.preventDefault();
					lastElement.focus();
				} else if (!event.shiftKey && document.activeElement === lastElement) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		});
	};

	// Apply focus trap to info panel
	const infoPanel = document.getElementById("info-panel");
	if (infoPanel) {
		trapFocus(infoPanel);
	}
}
