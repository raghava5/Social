import { EncryptionKeys } from './types';

class EncryptionService {
  private publicKey: string | null = null;
  private privateKey: string | null = null;
  
  // Initialize with existing keys or generate new ones
  async initialize(): Promise<EncryptionKeys> {
    // Look up stored keys first
    const storedKeys = this.getStoredKeys();
    
    if (storedKeys) {
      this.publicKey = storedKeys.publicKey;
      this.privateKey = storedKeys.privateKey;
      return storedKeys;
    }
    
    // Generate new keys if none exist
    return this.generateNewKeys();
  }
  
  // Generate new encryption keys
  async generateNewKeys(): Promise<EncryptionKeys> {
    try {
      // Use the Web Crypto API to generate a key pair
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true, // extractable
        ['encrypt', 'decrypt']
      );
      
      // Export the keys to storage format
      const publicKeyBuffer = await window.crypto.subtle.exportKey(
        'spki',
        keyPair.publicKey
      );
      
      const privateKeyBuffer = await window.crypto.subtle.exportKey(
        'pkcs8',
        keyPair.privateKey
      );
      
      // Convert to base64 strings for storage
      this.publicKey = this._arrayBufferToBase64(publicKeyBuffer);
      this.privateKey = this._arrayBufferToBase64(privateKeyBuffer);
      
      // Store keys
      this.storeKeys(this.publicKey, this.privateKey);
      
      return {
        publicKey: this.publicKey,
        privateKey: this.privateKey
      };
    } catch (error) {
      console.error('Error generating encryption keys:', error);
      // Fallback to simpler encryption if Web Crypto is not available
      return this.generateFallbackKeys();
    }
  }
  
  // Encrypt a message with recipient's public key
  async encryptMessage(message: string, recipientPublicKey: string): Promise<string> {
    try {
      // Import recipient's public key
      const publicKeyBuffer = this._base64ToArrayBuffer(recipientPublicKey);
      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        false,
        ['encrypt']
      );
      
      // Convert message to buffer and encrypt
      const encodedMessage = new TextEncoder().encode(message);
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        publicKey,
        encodedMessage
      );
      
      // Return as base64 string
      return this._arrayBufferToBase64(encryptedBuffer);
    } catch (error) {
      console.error('Error encrypting message:', error);
      // Fallback to simpler encryption or return original message
      return this.fallbackEncrypt(message, recipientPublicKey);
    }
  }
  
  // Decrypt a message with our private key
  async decryptMessage(encryptedMessage: string): Promise<string> {
    if (!this.privateKey) {
      throw new Error('No private key available for decryption');
    }
    
    try {
      // Import our private key
      const privateKeyBuffer = this._base64ToArrayBuffer(this.privateKey);
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        false,
        ['decrypt']
      );
      
      // Decrypt message
      const encryptedBuffer = this._base64ToArrayBuffer(encryptedMessage);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP',
        },
        privateKey,
        encryptedBuffer
      );
      
      // Decode and return
      const decryptedMessage = new TextDecoder().decode(decryptedBuffer);
      return decryptedMessage;
    } catch (error) {
      console.error('Error decrypting message:', error);
      // Fallback to simpler decryption
      return this.fallbackDecrypt(encryptedMessage);
    }
  }
  
  // Encrypt with AES for message content
  async encryptWithAES(content: string, key: string): Promise<string> {
    try {
      // Derive key from password
      const encoder = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(key),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const derivedKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      
      // Encrypt the content
      const encryptedContent = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        derivedKey,
        encoder.encode(content)
      );
      
      // Combine salt, iv, and encrypted content
      const encryptedArray = new Uint8Array(salt.byteLength + iv.byteLength + encryptedContent.byteLength);
      encryptedArray.set(salt, 0);
      encryptedArray.set(iv, salt.byteLength);
      encryptedArray.set(new Uint8Array(encryptedContent), salt.byteLength + iv.byteLength);
      
      // Return as base64 string
      return this._arrayBufferToBase64(encryptedArray.buffer);
    } catch (error) {
      console.error('Error in AES encryption:', error);
      return content; // Fall back to returning original content
    }
  }
  
  // Decrypt with AES
  async decryptWithAES(encryptedContent: string, key: string): Promise<string> {
    try {
      const encryptedBuffer = this._base64ToArrayBuffer(encryptedContent);
      const encryptedArray = new Uint8Array(encryptedBuffer);
      
      // Extract salt, iv, and encrypted data
      const salt = encryptedArray.slice(0, 16);
      const iv = encryptedArray.slice(16, 16 + 12);
      const data = encryptedArray.slice(16 + 12);
      
      // Derive the key
      const encoder = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(key),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
      
      const derivedKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      
      // Decrypt the content
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        derivedKey,
        data
      );
      
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Error in AES decryption:', error);
      return encryptedContent; // Fall back to returning encrypted content
    }
  }
  
  // Fallback methods for browsers without crypto API
  private generateFallbackKeys(): EncryptionKeys {
    // Generate simple encryption keys as fallback
    const getRandomString = (length: number) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    };
    
    this.publicKey = getRandomString(64);
    this.privateKey = getRandomString(128);
    
    // Store keys
    this.storeKeys(this.publicKey, this.privateKey);
    
    return {
      publicKey: this.publicKey,
      privateKey: this.privateKey
    };
  }
  
  private fallbackEncrypt(message: string, publicKey: string): string {
    // Simple XOR encryption as fallback
    let result = '';
    for (let i = 0; i < message.length; i++) {
      result += String.fromCharCode(message.charCodeAt(i) ^ publicKey.charCodeAt(i % publicKey.length));
    }
    return btoa(result);
  }
  
  private fallbackDecrypt(encryptedMessage: string): string {
    if (!this.privateKey) return encryptedMessage;
    
    try {
      // Simple XOR decryption
      const message = atob(encryptedMessage);
      let result = '';
      for (let i = 0; i < message.length; i++) {
        result += String.fromCharCode(message.charCodeAt(i) ^ this.privateKey.charCodeAt(i % this.privateKey.length));
      }
      return result;
    } catch (error) {
      console.error('Fallback decryption error:', error);
      return encryptedMessage;
    }
  }
  
  // Helper methods for storage
  private storeKeys(publicKey: string, privateKey: string): void {
    try {
      localStorage.setItem('messaging_public_key', publicKey);
      localStorage.setItem('messaging_private_key', privateKey);
    } catch (error) {
      console.error('Error storing encryption keys:', error);
    }
  }
  
  private getStoredKeys(): EncryptionKeys | null {
    try {
      const publicKey = localStorage.getItem('messaging_public_key');
      const privateKey = localStorage.getItem('messaging_private_key');
      
      if (publicKey && privateKey) {
        return { publicKey, privateKey };
      }
    } catch (error) {
      console.error('Error retrieving encryption keys:', error);
    }
    
    return null;
  }
  
  // Helper methods for encoding/decoding
  private _arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
    return btoa(binary);
  }
  
  private _base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  // Get public key for sharing
  getPublicKey(): string | null {
    return this.publicKey;
  }
  
  // Generate a conversation key for symmetric encryption
  generateConversationKey(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();
export default encryptionService; 