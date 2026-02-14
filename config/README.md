# Configuration Management

This project uses a secure configuration system that separates sensitive secrets from public configuration files.

## File Structure

```
config/
├── mcp-config.example.json    # Template for MCP configuration (safe to commit)
├── secrets.example.json       # Template for secrets structure (safe to commit)
├── mcp-config.json           # Your actual MCP config (create from example)
└── secrets.json              # Your actual secrets (NEVER commit - excluded by .gitignore)
```

## Setup Instructions

### 1. Create Your Configuration Files

1. Copy the example files:

   ```bash
   cp config/mcp-config.example.json config/mcp-config.json
   cp config/secrets.example.json config/secrets.json
   ```

2. Edit `config/mcp-config.json` with your MCP server and client configurations (no secrets).

3. **IMPORTANT**: The `config/secrets.json` file should NEVER be committed to git. Instead, use environment variables.

### 2. Set Environment Variables

Instead of storing secrets in files, use environment variables. The application will automatically load secrets from environment variables.

#### For Local Development (.env)

```bash
# Copy and edit your .env file
cp .env .env.local  # Create a local override file
```

Edit `.env.local` with your actual secrets:

```env
MCP_SERVER_AUTH_TOKEN=your-actual-server-token
MCP_CLIENT_USERNAME=your-actual-username
MCP_CLIENT_PASSWORD=your-actual-password
OPENAI_API_KEY=sk-your-actual-openai-key
# ... other secrets
```

#### For Production

Set environment variables in your deployment platform (Vercel, Netlify, etc.) or use GitHub Secrets for CI/CD.

### 3. GitHub Secrets (for CI/CD)

When deploying via GitHub Actions or similar CI/CD:

1. Go to your GitHub repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `MCP_SERVER_AUTH_TOKEN`
   - `MCP_CLIENT_USERNAME`
   - `MCP_CLIENT_PASSWORD`
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - Any other secrets your app needs

### 4. Using Configuration in Code

```typescript
import {
  createFullMCPConfig,
  loadMCPConfig,
  loadSecretsFromEnv,
} from "@/lib/mcpConfig";

// Load everything (config + secrets from env)
const fullConfig = createFullMCPConfig();

// Load just the public config
const mcpConfig = loadMCPConfig();

// Load secrets from environment variables
const secrets = loadSecretsFromEnv();
```

## Security Best Practices

- ✅ **DO**: Use environment variables for secrets
- ✅ **DO**: Add sensitive files to `.gitignore`
- ✅ **DO**: Use GitHub Secrets for CI/CD deployments
- ❌ **DON'T**: Commit files containing real secrets
- ❌ **DON'T**: Hardcode secrets in source code
- ❌ **DON'T**: Share `.env` files with real values

## Migration from Combined JSON

If you have a JSON file with both MCP config and secrets combined:

1. Extract the non-sensitive MCP configuration to `config/mcp-config.json`
2. Move all secrets to environment variables
3. Delete the original combined file
4. Add the combined file pattern to `.gitignore` if needed

## Environment Variable Reference

| Variable                | Description                            | Required |
| ----------------------- | -------------------------------------- | -------- |
| `MCP_SERVER_AUTH_TOKEN` | Authentication token for MCP servers   | Optional |
| `MCP_CLIENT_USERNAME`   | Username for MCP client authentication | Optional |
| `MCP_CLIENT_PASSWORD`   | Password for MCP client authentication | Optional |
| `OPENAI_API_KEY`        | OpenAI API key                         | Optional |
| `ANTHROPIC_API_KEY`     | Anthropic API key                      | Optional |
| `SUPABASE_ANON_KEY`     | Supabase anonymous key                 | Optional |

All secrets are optional and will use empty strings as defaults if not provided.
