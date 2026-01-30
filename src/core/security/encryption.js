// Advanced encryption system for Sling Hockey Pro
// Uses AES-256-GCM encryption for secure data storage

class GameEncryption {
  constructor() {
    // Generate or retrieve encryption key
    this.keyMaterial = null;
    this.initializeKey();
  }

  async initializeKey() {
    try {
      // Try to get existing key from localStorage
      const storedKey = localStorage.getItem('sling_hockey_key_material');
      
      if (storedKey) {
        // Import existing key
        const keyData = new Uint8Array(JSON.parse(storedKey));
        this.keyMaterial = await window.crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'PBKDF2' },
          false,
          ['deriveKey']
        );
      } else {
        // Generate new key
        const keyData = window.crypto.getRandomValues(new Uint8Array(32));
        localStorage.setItem('sling_hockey_key_material', JSON.stringify(Array.from(keyData)));
        
        this.keyMaterial = await window.crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'PBKDF2' },
          false,
          ['deriveKey']
        );
      }
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      // Fallback to simple obfuscation if crypto API fails
      this.keyMaterial = null;
    }
  }

  async deriveKey(salt) {
    if (!this.keyMaterial) {
      throw new Error('Key material not initialized');
    }

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      this.keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data) {
    try {
      if (!window.crypto || !window.crypto.subtle) {
        // Fallback to enhanced obfuscation
        return this.fallbackEncrypt(data);
      }

      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const key = await this.deriveKey(salt);
      
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(JSON.stringify(data));
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encodedData
      );
      
      // Combine salt, iv, and encrypted data
      const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
      result.set(salt, 0);
      result.set(iv, salt.length);
      result.set(new Uint8Array(encrypted), salt.length + iv.length);
      
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption failed:', error);
      return this.fallbackEncrypt(data);
    }
  }

  async decrypt(encryptedData) {
    try {
      if (!window.crypto || !window.crypto.subtle) {
        // Fallback to enhanced obfuscation
        return this.fallbackDecrypt(encryptedData);
      }

      const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
      
      const salt = data.slice(0, 16);
      const iv = data.slice(16, 28);
      const encrypted = data.slice(28);
      
      const key = await this.deriveKey(salt);
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decrypted);
      
      return JSON.parse(decryptedText);
    } catch (error) {
      console.error('Decryption failed:', error);
      return this.fallbackDecrypt(encryptedData);
    }
  }

  // Enhanced fallback encryption (better than simple XOR)
  fallbackEncrypt(data) {
    const jsonStr = JSON.stringify(data);
    const key = 'SlingHockey2024SecureKey!@#$%^&*()';
    let encrypted = '';
    
    for (let i = 0; i < jsonStr.length; i++) {
      const charCode = jsonStr.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      const encryptedChar = charCode ^ keyChar ^ (i % 255);
      encrypted += String.fromCharCode(encryptedChar);
    }
    
    // Add random padding and encode
    const padding = Math.random().toString(36).substring(2, 15);
    return btoa(padding + '|' + encrypted + '|' + padding.split('').reverse().join(''));
  }

  fallbackDecrypt(encryptedData) {
    try {
      const decoded = atob(encryptedData);
      const parts = decoded.split('|');
      if (parts.length !== 3) throw new Error('Invalid format');
      
      const encrypted = parts[1];
      const key = 'SlingHockey2024SecureKey!@#$%^&*()';
      let decrypted = '';
      
      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        const decryptedChar = charCode ^ keyChar ^ (i % 255);
        decrypted += String.fromCharCode(decryptedChar);
      }
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Fallback decryption failed:', error);
      return {};
    }
  }

  // Integrity check using hash
  generateHash(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  verifyIntegrity(data, expectedHash) {
    return this.generateHash(data) === expectedHash;
  }
}

// Create singleton instance
export const gameEncryption = new GameEncryption();

// Secure storage wrapper
export const secureStorage = {
  async setItem(key, value) {
    try {
      const encrypted = await gameEncryption.encrypt(value);
      const hash = gameEncryption.generateHash(value);
      
      localStorage.setItem(key, encrypted);
      localStorage.setItem(key + '_hash', hash);
    } catch (error) {
      console.error('Secure storage setItem failed:', error);
      // Fallback to regular storage
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  async getItem(key) {
    try {
      const encrypted = localStorage.getItem(key);
      const hash = localStorage.getItem(key + '_hash');
      
      if (!encrypted) return null;
      
      const decrypted = await gameEncryption.decrypt(encrypted);
      
      // Verify integrity if hash exists
      if (hash && !gameEncryption.verifyIntegrity(decrypted, hash)) {
        console.warn('Data integrity check failed for key:', key);
        // Could implement recovery logic here
      }
      
      return decrypted;
    } catch (error) {
      console.error('Secure storage getItem failed:', error);
      // Fallback to regular storage
      try {
        const fallback = localStorage.getItem(key);
        return fallback ? JSON.parse(fallback) : null;
      } catch {
        return null;
      }
    }
  },

  removeItem(key) {
    localStorage.removeItem(key);
    localStorage.removeItem(key + '_hash');
  }
};