import { GeoJSONData } from "../types";

/**
 * Service class for handling dropdown population from GeoJSON data.
 *
 * Provides utility methods to extract unique property values from GeoJSON features
 * and populate HTML dropdown elements with these values.
 */
export class DropdownService {
	/**
	 * Extracts unique values from a specified property of GeoJSON features and populates
	 * an HTML dropdown element with these values.
	 *
	 * @param data - The GeoJSON data containing features to extract values from.
	 * @param propertyName - The property name within each feature's properties to extract unique values.
	 * @param dropdownId - The ID of the HTML dropdown element to populate.
	 * @returns A set of unique string values extracted from the specified property.
	 */
	static populateDropdown(
		data: GeoJSONData,
		propertyName: string,
		dropdownId: string
	): Set<string> {
		const uniqueValues = new Set<string>();

		// Extract unique values from the data
		data.features.forEach((feature) => {
			if (feature.properties && feature.properties[propertyName]) {
				uniqueValues.add(feature.properties[propertyName]);
			}
		});

		// Populate the dropdown
		const dropdown = document.getElementById(dropdownId);
		if (dropdown) {
			// Sort values alphabetically
			const sortedValues = Array.from(uniqueValues).sort();

			// Clear existing options (except "All")
			const allOption = dropdown.querySelector('option[value="all"]');
			dropdown.innerHTML = "";
			if (allOption) dropdown.appendChild(allOption);

			sortedValues.forEach((value) => {
				const option = document.createElement("option");
				option.value = value;
				option.textContent = value;
				dropdown.appendChild(option);
			});
		}

		return uniqueValues;
	}
}
