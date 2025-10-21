import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'app-builder-form-';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const fullKey = `${STORAGE_KEY_PREFIX}${key}`;
  
  // Get from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(fullKey);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error loading ${fullKey} from localStorage:`, error);
      return initialValue;
    }
  });

  // Save to localStorage whenever value changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(fullKey, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error saving ${fullKey} to localStorage:`, error);
    }
  }, [fullKey, storedValue]);

  // Clear function
  const clearValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(fullKey);
      }
    } catch (error) {
      console.warn(`Error clearing ${fullKey} from localStorage:`, error);
    }
  }, [fullKey, initialValue]);

  return [storedValue, setValue, clearValue];
}
