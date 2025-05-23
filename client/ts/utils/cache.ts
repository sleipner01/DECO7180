export interface CacheOptions {
	key: string;
	staleTime: number; // milliseconds
}

export interface CacheData<T> {
	data: T;
	timestamp: number;
}

/**
 * LocalStorageCache class for caching data in localStorage
 * with a specified stale time.
 * The cache is identified by a unique key.
 * The data is stored with a timestamp to determine its freshness.
 */
export class LocalStorageCache {
	/**
	 * Get data from cache if it exists and is not stale
	 *
	 * @param options - CacheOptions containing the key and stale time
	 * @returns Cached data or null if not found or stale
	 */
	static get<T>(options: CacheOptions): T | null {
		try {
			const cacheKey = `heatmap_${options.key}`;
			const cachedData = localStorage.getItem(cacheKey);

			if (!cachedData) {
				return null;
			}

			const parsedCache = JSON.parse(cachedData) as CacheData<T>;
			const now = Date.now();

			if (now - parsedCache.timestamp > options.staleTime) {
				// Data is stale, remove it from cache
				localStorage.removeItem(cacheKey);
				return null;
			}

			return parsedCache.data;
		} catch (error) {
			console.error("Error reading from cache:", error);
			return null;
		}
	}

	/**
	 * Store data in cache
	 *
	 * @param options - CacheOptions containing the key and stale time
	 * @param data - Data to be cached
	 */
	static set<T>(options: CacheOptions, data: T): void {
		try {
			const cacheKey = `heatmap_${options.key}`;
			const cacheData: CacheData<T> = {
				data,
				timestamp: Date.now(),
			};

			localStorage.setItem(cacheKey, JSON.stringify(cacheData));
		} catch (error) {
			console.error("Error writing to cache:", error);
		}
	}

	/**
	 * Clear all cached data
	 */
	static clear(): void {
		const keys: string[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith("heatmap_")) {
				keys.push(key);
			}
		}

		keys.forEach((key) => localStorage.removeItem(key));
	}
}
