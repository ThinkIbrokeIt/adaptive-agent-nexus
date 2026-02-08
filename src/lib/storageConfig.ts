import { LLMConfig, initializeLLM, generateLLMResponse, createSystemMessage, createUserMessage, AGENT_PROMPTS } from "@/lib/llm";

// Storage Configuration Types
export interface StorageConfig {
  provider: 'localStorage' | 'indexeddb' | 'filesystem' | 'supabase' | 'mock';
  supabaseUrl?: string;
  supabaseKey?: string;
  databaseName?: string;
  enableEncryption?: boolean;
  maxStorageSize?: number; // in MB
  storagePath?: string; // For filesystem provider
}

export interface StorageTestResult {
  success: boolean;
  error?: string;
  storageInfo?: {
    used: number;
    available: number;
    total: number;
  };
}

// Default configurations
export const DEFAULT_STORAGE_CONFIGS: Record<string, Partial<StorageConfig>> = {
  localStorage: {
    enableEncryption: false,
    maxStorageSize: 50, // 50MB default
  },
  indexeddb: {
    enableEncryption: false,
    maxStorageSize: 500, // 500MB default
  },
  filesystem: {
    enableEncryption: true,
    maxStorageSize: 1000, // 1GB default
    storagePath: './adaptive-agent-data', // Relative to app directory
  },
  supabase: {
    enableEncryption: true,
    maxStorageSize: 1000, // 1GB default
  },
  mock: {
    enableEncryption: false,
    maxStorageSize: 10, // 10MB default
  },
};

// Storage Configuration Management
class StorageConfigManager {
  private static instance: StorageConfigManager;
  private config: StorageConfig | null = null;

  private constructor() {}

  static getInstance(): StorageConfigManager {
    if (!StorageConfigManager.instance) {
      StorageConfigManager.instance = new StorageConfigManager();
    }
    return StorageConfigManager.instance;
  }

  // Load configuration from localStorage
  loadConfig(): StorageConfig | null {
    try {
      const stored = localStorage.getItem('adaptive-agent-storage-config');
      if (stored) {
        this.config = JSON.parse(stored);
        return this.config;
      }
    } catch (error) {
      console.error('Error loading storage config:', error);
    }
    return null;
  }

  // Save configuration to localStorage
  saveConfig(config: StorageConfig): void {
    try {
      this.config = config;
      localStorage.setItem('adaptive-agent-storage-config', JSON.stringify(config));
    } catch (error) {
      console.error('Error saving storage config:', error);
    }
  }

  // Get current configuration
  getConfig(): StorageConfig | null {
    return this.config || this.loadConfig();
  }

  // Update configuration
  updateConfig(updates: Partial<StorageConfig>): void {
    const current = this.getConfig();
    if (current) {
      const newConfig = { ...current, ...updates };
      this.saveConfig(newConfig);
    }
  }

  // Test storage connection
  async testConnection(): Promise<StorageTestResult> {
    try {
      const config = this.getConfig();
      if (!config) {
        return { success: false, error: 'No storage configuration found' };
      }

      switch (config.provider) {
        case 'localStorage':
          return await this.testLocalStorage();
        case 'indexeddb':
          return await this.testIndexedDB();
        case 'filesystem':
          return await this.testFileSystem(config);
        case 'supabase':
          return await this.testSupabase(config);
        case 'mock':
          return { success: true, storageInfo: { used: 0, available: 10 * 1024 * 1024, total: 10 * 1024 * 1024 } };
        default:
          return { success: false, error: 'Unknown storage provider' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async testLocalStorage(): Promise<StorageTestResult> {
    try {
      // Test localStorage availability
      const testKey = 'storage-test-' + Date.now();
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);

      // Get storage info
      let used = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate available space (rough approximation)
      const available = 5 * 1024 * 1024; // Assume 5MB available
      const total = used + available;

      return {
        success: true,
        storageInfo: { used, available, total }
      };
    } catch (error) {
      return { success: false, error: 'localStorage not available' };
    }
  }

  private async testSupabase(config: StorageConfig): Promise<StorageTestResult> {
    try {
      if (!config.supabaseUrl || !config.supabaseKey) {
        return { success: false, error: 'Supabase URL and key required' };
      }

      // Test Supabase connection (simplified)
      // In a real implementation, you'd test the actual connection
      return {
        success: true,
        storageInfo: { used: 0, available: 1000 * 1024 * 1024, total: 1000 * 1024 * 1024 }
      };
    } catch (error) {
      return { success: false, error: 'Supabase connection failed' };
    }
  }

  private async testIndexedDB(): Promise<StorageTestResult> {
    try {
      // Test IndexedDB availability
      const testDB = indexedDB.open('storage-test-' + Date.now());
      return new Promise((resolve) => {
        testDB.onsuccess = () => {
          testDB.result.close();
          resolve({
            success: true,
            storageInfo: { used: 0, available: 500 * 1024 * 1024, total: 500 * 1024 * 1024 }
          });
        };
        testDB.onerror = () => {
          resolve({ success: false, error: 'IndexedDB not available' });
        };
      });
    } catch (error) {
      return { success: false, error: 'IndexedDB not available' };
    }
  }

  private async testFileSystem(config: StorageConfig): Promise<StorageTestResult> {
    try {
      // Check if running in Electron (has access to Node.js APIs)
      if (typeof window !== 'undefined' && window.electronAPI) {
        // We're in Electron - can use Node.js file system
        try {
          // For now, simulate file system access
          // In a real implementation, you'd use Node.js fs APIs
          return {
            success: true,
            storageInfo: {
              used: 0,
              available: (config.maxStorageSize || 1000) * 1024 * 1024,
              total: (config.maxStorageSize || 1000) * 1024 * 1024
            }
          };
        } catch (error) {
          return { success: false, error: 'File system access failed' };
        }
      } else {
        // Running in browser - fall back to IndexedDB with note about limitations
        return {
          success: true,
          storageInfo: { used: 0, available: 500 * 1024 * 1024, total: 500 * 1024 * 1024 }
        };
      }
    } catch (error) {
      return { success: false, error: 'File system test failed' };
    }
  }

  // Get available storage types
  getAvailableStorageTypes(): string[] {
    return ['localStorage', 'indexeddb', 'filesystem', 'supabase', 'mock'];
  }
}

// Export singleton instance
export const storageConfigManager = StorageConfigManager.getInstance();