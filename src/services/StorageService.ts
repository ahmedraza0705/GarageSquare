import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
    /**
     * Save data to local storage
     * @param key Storage key
     * @param data Data to save (will be JSON stringified)
     */
    async save(key: string, data: any): Promise<boolean> {
        try {
            const jsonValue = JSON.stringify(data);
            await AsyncStorage.setItem(key, jsonValue);
            return true;
        } catch (e) {
            console.error(`Error saving data to ${key}:`, e);
            return false;
        }
    }

    /**
     * Load data from local storage
     * @param key Storage key
     * @returns Parsed data or null if not found
     */
    async load<T>(key: string): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error(`Error loading data from ${key}:`, e);
            return null;
        }
    }

    /**
     * Remove data from local storage
     * @param key Storage key
     */
    async remove(key: string): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`Error removing data from ${key}:`, e);
            return false;
        }
    }

    /**
     * Clear all keys (use with caution)
     */
    async clearAll(): Promise<boolean> {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing storage:', e);
            return false;
        }
    }
}

export const storageService = new StorageService();
