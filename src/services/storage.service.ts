import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@flightApp:authToken',
  USER_DATA: '@flightApp:userData',
  RECENT_SEARCHES: '@flightApp:recentSearches',
  FAVORITES: '@flightApp:favorites',
} as const;

class StorageService {
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error reading ${key} from storage:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken(): Promise<string | null> {
    return this.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  async removeAuthToken(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async setUserData<T>(userData: T): Promise<void> {
    return this.setItem(STORAGE_KEYS.USER_DATA, userData);
  }

  async getUserData<T>(): Promise<T | null> {
    return this.getItem<T>(STORAGE_KEYS.USER_DATA);
  }

  async removeUserData(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.USER_DATA);
  }

  async getRecentSearches<T>(): Promise<T[]> {
    const searches = await this.getItem<T[]>(STORAGE_KEYS.RECENT_SEARCHES);
    return searches || [];
  }

  async addRecentSearch<T>(search: T, maxItems: number = 10): Promise<void> {
    const searches = await this.getRecentSearches<T>();
    const updated = [
      search,
      ...searches.filter(s => JSON.stringify(s) !== JSON.stringify(search)),
    ].slice(0, maxItems);
    return this.setItem(STORAGE_KEYS.RECENT_SEARCHES, updated);
  }

  async clearRecentSearches(): Promise<void> {
    return this.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  }

  async getFavorites<T>(): Promise<T[]> {
    const favorites = await this.getItem<T[]>(STORAGE_KEYS.FAVORITES);
    return favorites || [];
  }

  async addFavorite<T>(item: T): Promise<void> {
    const favorites = await this.getFavorites<T>();
    const updated = [...favorites, item];
    return this.setItem(STORAGE_KEYS.FAVORITES, updated);
  }

  async removeFavorite<T>(item: T): Promise<void> {
    const favorites = await this.getFavorites<T>();
    const updated = favorites.filter(
      f => JSON.stringify(f) !== JSON.stringify(item),
    );
    return this.setItem(STORAGE_KEYS.FAVORITES, updated);
  }
}

export const storageService = new StorageService();
