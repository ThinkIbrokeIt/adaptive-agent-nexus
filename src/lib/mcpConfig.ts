import { readFileSync } from 'fs';
import { join } from 'path';

export interface MCPConfig {
  mcp: {
    version: string;
    servers: Array<{
      name: string;
      command: string;
      args: string[];
      env?: Record<string, string>;
    }>;
    clients: Array<{
      name: string;
      type: string;
      endpoint: string;
    }>;
  };
  settings: {
    logLevel: string;
    timeout: number;
    retryAttempts: number;
  };
}

export interface SecretsConfig {
  secrets: {
    apiKeys: {
      openai: string;
      anthropic: string;
      supabase: string;
    };
    database: {
      connectionString: string;
      username: string;
      password: string;
    };
    mcp: {
      serverAuthTokens: Record<string, string>;
      clientCredentials: Record<string, { username: string; password: string }>;
    };
  };
}

/**
 * Load MCP configuration from JSON file
 */
export function loadMCPConfig(configPath?: string): MCPConfig {
  const path = configPath || join(process.cwd(), 'config', 'mcp-config.json');
  try {
    const configData = readFileSync(path, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.warn(`Failed to load MCP config from ${path}, using defaults`);
    return {
      mcp: {
        version: "1.0",
        servers: [],
        clients: []
      },
      settings: {
        logLevel: "info",
        timeout: 30000,
        retryAttempts: 3
      }
    };
  }
}

/**
 * Load secrets from environment variables (secure method)
 */
export function loadSecretsFromEnv(): SecretsConfig {
  return {
    secrets: {
      apiKeys: {
        openai: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
        anthropic: process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '',
        supabase: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
      },
      database: {
        connectionString: process.env.DATABASE_URL || '',
        username: process.env.DB_USERNAME || '',
        password: process.env.DB_PASSWORD || ''
      },
      mcp: {
        serverAuthTokens: {
          'example-server': process.env.MCP_SERVER_AUTH_TOKEN || ''
        },
        clientCredentials: {
          'example-client': {
            username: process.env.MCP_CLIENT_USERNAME || '',
            password: process.env.MCP_CLIENT_PASSWORD || ''
          }
        }
      }
    }
  };
}

/**
 * Combine MCP config with secrets (for runtime use)
 */
export function createFullMCPConfig(configPath?: string): MCPConfig & SecretsConfig {
  const mcpConfig = loadMCPConfig(configPath);
  const secrets = loadSecretsFromEnv();

  return {
    ...mcpConfig,
    ...secrets
  };
}