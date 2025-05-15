/**
 * UI utilities for managing loading overlays and other UI elements
 */

/**
 * Show or hide the loading overlay
 * @param show Whether to show or hide the loading overlay
 */
export function showLoading(show: boolean): void {
	const loadingOverlay = document.getElementById("loading-overlay");
	if (loadingOverlay) {
		loadingOverlay.style.display = show ? "flex" : "none";
	}
}

/**
 * Setup info panel toggling functionality
 */
export function setupInfoPanel(): void {
	const infoToggle = document.getElementById("info-toggle");
	const infoPanel = document.getElementById("info-panel");
	const closeInfo = document.getElementById("close-info");

	if (infoToggle && infoPanel && closeInfo) {
		infoToggle.addEventListener("click", () => {
			const isExpanded = infoToggle.getAttribute("aria-expanded") === "true";
			infoToggle.setAttribute("aria-expanded", (!isExpanded).toString());
			infoPanel.hidden = isExpanded;
		});

		closeInfo.addEventListener("click", () => {
			infoPanel.hidden = true;
			infoToggle.setAttribute("aria-expanded", "false");
			infoToggle.focus();
		});
	}
}

/**
 * Creates a reusable modal dialog
 * @param id Modal ID
 * @param title Modal title
 * @param content Modal content
 * @returns The created modal element
 */
export function createModal(
	id: string,
	title: string,
	content: string
): HTMLElement {
	// Create modal container
	const modal = document.createElement("div");
	modal.id = id;
	modal.className = "modal";
	modal.setAttribute("role", "dialog");
	modal.setAttribute("aria-modal", "true");
	modal.setAttribute("aria-labelledby", `${id}-title`);
	modal.setAttribute("aria-describedby", `${id}-content`);
	modal.setAttribute("tabindex", "-1");

	// Create modal content
	const modalContent = document.createElement("div");
	modalContent.className = "modal-content";

	// Create header
	const header = document.createElement("div");
	header.className = "modal-header";

	const titleElement = document.createElement("h2");
	titleElement.id = `${id}-title`;
	titleElement.textContent = title;

	const closeButton = document.createElement("button");
	closeButton.className = "close-button";
	closeButton.textContent = "×";
	closeButton.setAttribute("aria-label", "Close");
	closeButton.onclick = () => hideModal(id);

	header.appendChild(titleElement);
	header.appendChild(closeButton);

	// Create body
	const body = document.createElement("div");
	body.className = "modal-body";
	body.id = `${id}-content`;
	body.innerHTML = content;

	// Assemble modal
	modalContent.appendChild(header);
	modalContent.appendChild(body);
	modal.appendChild(modalContent);

	document.body.appendChild(modal);
	return modal;
}

/**
 * Show a modal dialog
 * @param id ID of the modal to show
 */
export function showModal(id: string): void {
	const modal = document.getElementById(id);
	if (!modal) return;

	modal.classList.add("visible");
	modal.focus();

	// Close when clicking outside the modal content
	modal.onclick = (e) => {
		if (e.target === modal) {
			hideModal(id);
		}
	};

	// Add keyboard event for Escape key to close
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			hideModal(id);
		}
	});
}

/**
 * Hide a modal dialog
 * @param id ID of the modal to hide
 */
export function hideModal(id: string): void {
	const modal = document.getElementById(id);
	if (!modal) return;

	modal.classList.remove("visible");
}
