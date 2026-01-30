// Simple storage fallback for when encryption fails
export const simpleStorage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Simple storage setItem failed:', error);
    }
  },

  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Simple storage getItem failed:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Simple storage removeItem failed:', error);
    }
  }
};

// Storage adapter that uses simple storage
export const simpleStorageAdapter = {
  getItem: async (name) => {
    return simpleStorage.getItem(name);
  },
  setItem: async (name, value) => {
    simpleStorage.setItem(name, value);
  },
  removeItem: (name) => {
    simpleStorage.removeItem(name);
  }
};