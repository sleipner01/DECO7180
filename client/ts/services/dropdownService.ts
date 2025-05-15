import { GeoJSONData } from "../types";

export class DropdownService {
	/**
	 * Extract unique values from feature properties and populate a dropdown
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
