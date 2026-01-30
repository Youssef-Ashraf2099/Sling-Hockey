// Initialize the application with proper error handling
import { gameEncryption } from '../core/security/encryption';

export const initializeApp = async () => {
  try {
    console.log('Initializing Sling Hockey Pro...');
    
    // Wait for encryption to initialize
    await gameEncryption.waitForInitialization();
    
    console.log('Encryption system initialized successfully');
    
    // Test encryption/decryption
    const testData = { test: 'initialization', timestamp: Date.now() };
    const encrypted = await gameEncryption.encrypt(testData);
    const decrypted = await gameEncryption.decrypt(encrypted);
    
    if (JSON.stringify(testData) === JSON.stringify(decrypted)) {
      console.log('Encryption test passed');
    } else {
      console.warn('Encryption test failed, using fallback storage');
    }
    
    return true;
  } catch (error) {
    console.error('App initialization failed:', error);
    console.log('Continuing with fallback storage...');
    return false;
  }
};

// Auto-initialize when module is imported
initializeApp();