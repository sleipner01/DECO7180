import { announceToScreenReader } from "./accessibility";

export enum NotificationType {
	SUCCESS = "success",
	INFO = "info",
	WARNING = "warning",
	ERROR = "error",
}

interface NotificationOptions {
	type?: NotificationType;
	duration?: number; // in milliseconds
	announceToScreenReader?: boolean;
}

const defaultOptions: NotificationOptions = {
	type: NotificationType.INFO,
	duration: 3000,
	announceToScreenReader: true,
};

/**
 * Shows a notification message to the user
 * @param message The message to display
 * @param options Notification options
 */
export function showNotification(
	message: string,
	options: NotificationOptions = {}
): void {
	const mergedOptions = { ...defaultOptions, ...options };

	// Get or create notification element
	const notificationEl = document.getElementById(
		"notification-message"
	) as HTMLDivElement;

	if (!notificationEl) {
		console.error("Notification element not found in the DOM");
		return;
	}

	// Set the notification content and type
	notificationEl.textContent = message;

	// Remove any existing type classes
	notificationEl.classList.remove(
		"notification-success",
		"notification-info",
		"notification-warning",
		"notification-error"
	);

	// Add the appropriate type class
	notificationEl.classList.add(`notification-${mergedOptions.type}`);

	// Make the notification visible
	notificationEl.classList.add("visible");

	// Announce to screen reader if needed
	if (mergedOptions.announceToScreenReader) {
		announceToScreenReader(message);
	}

	// Automatically hide after duration if specified
	const duration = mergedOptions.duration ?? 0;
	if (duration > 0) {
		// Clear any existing timeout
		const timeoutId = notificationEl.dataset.timeoutId;
		if (timeoutId) {
			clearTimeout(parseInt(timeoutId, 10));
		}

		// Set new timeout
		const newTimeoutId = setTimeout(() => {
			notificationEl.classList.remove("visible");
		}, duration);

		// Store the timeout ID for potential clearing
		notificationEl.dataset.timeoutId = newTimeoutId.toString();
	}
}

/**
 * Show an error message
 * @param message The error message
 * @param duration Optional duration in milliseconds, defaults to 5000ms
 */
export function showError(message: string, duration: number = 5000): void {
	showNotification(message, {
		type: NotificationType.ERROR,
		duration: duration,
		announceToScreenReader: true,
	});
}

/**
 * Show a success message
 * @param message The success message
 * @param duration Optional duration in milliseconds, defaults to 3000ms
 */
export function showSuccess(message: string, duration: number = 3000): void {
	showNotification(message, {
		type: NotificationType.SUCCESS,
		duration: duration,
		announceToScreenReader: true,
	});
}

/**
 * Show an info message
 * @param message The info message
 * @param duration Optional duration in milliseconds, defaults to 3000ms
 */
export function showInfo(message: string, duration: number = 3000): void {
	showNotification(message, {
		type: NotificationType.INFO,
		duration: duration,
		announceToScreenReader: true,
	});
}

/**
 * Show a warning message
 * @param message The warning message
 * @param duration Optional duration in milliseconds, defaults to 4000ms
 */
export function showWarning(message: string, duration: number = 4000): void {
	showNotification(message, {
		type: NotificationType.WARNING,
		duration: duration,
		announceToScreenReader: true,
	});
}

/**
 * Show a filter results notification
 * @param count The number of items found
 * @param activeFilters Description of active filters
 */
export function showFilterResults(
	count: number,
	activeFilters: string = ""
): void {
	const message = activeFilters
		? `Found ${count} locations matching: ${activeFilters}`
		: `Showing all ${count} locations`;

	showNotification(message, {
		type: NotificationType.INFO,
		duration: 3000,
	});
}

/**
 * Hide the currently visible notification
 */
export function hideNotification(): void {
	const notificationEl = document.getElementById("notification-message");
	if (notificationEl) {
		notificationEl.classList.remove("visible");
	}
}
