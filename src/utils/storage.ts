import { logger } from "./logger";

export const storage = {
  get: <T = string>(key: string): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (error) {
      logger.error(`Error reading from localStorage (key: ${key})`, error);
      return null;
    }
  },

  set: (key: string, value: unknown): void => {
    try {
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      logger.error(`Error writing to localStorage (key: ${key})`, error);
    }
  },

  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Error removing from localStorage (key: ${key})`, error);
    }
  },

  clear: (): void => {
    try {
      window.localStorage.clear();
    } catch (error) {
      logger.error('Error clearing localStorage', error);
    }
  }
};
