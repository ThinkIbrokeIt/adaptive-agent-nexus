# Adaptive Agent Nexus - User Guide v0.7.0-alpha

## Welcome to Adaptive Agent Nexus

Adaptive Agent Nexus is an intelligent multi-agent AI system that learns from interactions and adapts responses based on context. This guide will help you get started and troubleshoot common issues.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Using the Application](#using-the-application)
6. [Commands & Features](#commands--features)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)
9. [Support](#support)

---

## Quick Start

### For New Users (5 minutes)

1. **Download and Install**

   ```bash
   git clone https://github.com/your-username/adaptive-agent-nexus.git
   cd adaptive-agent-nexus
   npm install
   npm run dev
   ```

2. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - The app will load with default settings

3. **Try Your First Command**
   - Type `help` in the command input
   - Say "run workflow" to see the MCP system in action

4. **Explore Features**
   - Check the Knowledge Graph tab
   - Run system tests in the Testing tab
   - Configure LLM settings for AI responses

---

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10+, macOS 10.13+, or Linux (Ubuntu 18.04+)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Internet**: Required for LLM services and external APIs

### Recommended Setup

- **RAM**: 8GB or more
- **Modern browser** with JavaScript enabled
- **Stable internet connection** for real-time features

---

## Installation & Setup

### Option 1: Web Application (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/adaptive-agent-nexus.git
cd adaptive-agent-nexus

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Option 2: Bootstrap from Local Files

If you have workflow JSON files stored locally, you can bootstrap them directly into N8N:

1. **Navigate to Dashboard tab**
2. **Find the "Workflow Bootstrap" card**
3. **Click "Bootstrap Workflows"**
4. **The system will:**
   - Load workflow definitions from `.zenflow/workflows/`
   - Import them into your N8N instance
   - Automatically activate workflows
   - Skip workflows that already exist

This method allows frontend-only users to load workflows without backend access!

### Option 3: Docker (Advanced)

```bash
# Build Docker image
docker build -t adaptive-agent-nexus .

# Run container
docker run -p 5173:5173 adaptive-agent-nexus
```

---

## Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# LLM API Keys (get from providers)
VITE_OPENAI_API_KEY=your-openai-key-here
VITE_ANTHROPIC_API_KEY=your-anthropic-key-here

# MCP Configuration
MCP_SERVER_AUTH_TOKEN=your-mcp-token
MCP_CLIENT_USERNAME=your-username
MCP_CLIENT_PASSWORD=your-password

# Storage (optional)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

### LLM Setup

1. **Navigate to LLM Settings tab**
2. **Choose Provider**:
   - **Mock**: No setup needed (simulated responses)
   - **OpenAI**: Requires API key
   - **Anthropic**: Requires API key
   - **Ollama**: Requires local installation

3. **Test Connection**:
   - Click "Test Connection"
   - Verify API key works

### MCP Configuration

For MCP (Model Context Protocol) integration:

1. **Copy example config**:

   ```bash
   cp config/mcp-config.example.json config/mcp-config.json
   ```

2. **Edit configuration** with your MCP server details

3. **Set environment variables** for sensitive data

---

## Using the Application

### Main Interface

The application has several main tabs:

- **Dashboard**: Overview and quick actions
- **Agent Console**: Command interface and agent communication
- **Knowledge Graph**: Visual agent network representation
- **Agent Truths**: Manage agent personalities and memories
- **LLM Settings**: Configure AI providers
- **System Tests**: Run diagnostics and tests

### Navigation Tips

- Use the tab bar at the top to switch between sections
- Each tab has contextual help and tooltips
- The agent console provides real-time feedback
- Recent triggers show the last 10 system events

---

## Commands & Features

### Basic Commands

| Command        | Description             | Example        |
| -------------- | ----------------------- | -------------- |
| `help`         | Show available commands | `help`         |
| `status`       | System status overview  | `status`       |
| `clear`        | Clear console           | `clear`        |
| `run workflow` | Execute MCP workflow    | `run workflow` |

### Voice Commands

- **Enable Voice**: Click microphone icon or type `voice on`
- **Speak Commands**: Click mic and speak clearly
- **Voice Response**: Toggle speaker icon for voice output

### Workflow Commands

- **Run MCP Workflow**: Click "Run MCP Workflow" button or type `run workflow`
- **Monitor Progress**: Watch real-time phases (Monitor → Contextualize → Personalize)
- **View Results**: Check Recent Triggers panel for outcomes

### Advanced Features

#### Knowledge Graph

- **Interactive Nodes**: Drag agents to reposition
- **Filter Agents**: Filter by status or type
- **Real-time Updates**: See live agent communication
- **Node Details**: Click nodes for information

#### Agent Truth Files

- **Create Truths**: Define agent personalities
- **Memory Anchors**: Add persistent memories
- **Evolution Tracking**: Monitor agent development
- **Export/Import**: Backup and restore data

#### System Testing

- **Run All Tests**: Comprehensive system validation
- **Individual Tests**: Test specific features
- **Performance Monitoring**: Real-time metrics
- **Error Reporting**: Detailed failure logs

---

## Troubleshooting

### Common Issues & Solutions

#### 🔴 Application Won't Start

**Problem**: `npm run dev` fails or browser shows blank page

**Solutions**:

1. **Check Node.js version**: Ensure Node.js 18+ is installed
   ```bash
   node --version
   ```
2. **Clear cache**: Delete node_modules and reinstall
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. **Check port availability**: Ensure port 5173 is free
   ```bash
   netstat -an | grep 5173
   ```

#### 🔴 LLM Connection Failed

**Problem**: "Connection failed" in LLM Settings

**Solutions**:

1. **Verify API key**: Check key format and validity
2. **Check internet connection**: Ensure stable connection
3. **Test with Mock provider**: Switch to Mock for testing
4. **Check API limits**: Verify account has credits/quota

#### 🔴 Voice Recognition Not Working

**Problem**: Microphone doesn't respond or voice commands fail

**Solutions**:

1. **Browser permissions**: Allow microphone access
2. **HTTPS requirement**: Voice requires secure context (localhost is OK)
3. **Clear browser cache**: Clear site data and reload
4. **Test microphone**: Check browser microphone settings

#### 🔴 MCP Workflow Errors

**Problem**: Workflow execution fails or hangs

**Solutions**:

1. **Check MCP configuration**: Verify config/mcp-config.json
2. **Environment variables**: Ensure MCP\_\* variables are set
3. **Network connectivity**: Check MCP server availability
4. **Clear browser data**: Reset local storage

#### 🔴 Data Not Persisting

**Problem**: Settings or data lost after refresh

**Solutions**:

1. **Browser storage**: Check if cookies/localStorage blocked
2. **Incognito mode**: Data doesn't persist in incognito
3. **Browser updates**: Clear cache and reload
4. **Export data**: Use export feature for backup

#### 🔴 No Workflows Available

**Problem**: "Run MCP Workflow" button doesn't work because no workflows are loaded

**Solutions**:

1. **Bootstrap workflows**: Use the "Workflow Bootstrap" card on the Dashboard
2. **Check N8N connection**: Ensure your N8N instance is running and API key is configured
3. **Verify workflow files**: Check that `.zenflow/workflows/mcp-workflow.json` exists
4. **Manual import**: Import workflows directly in N8N web interface if you have access

#### 🔴 Performance Issues

**Problem**: Application is slow or unresponsive

**Solutions**:

1. **Close other tabs**: Free up browser resources
2. **Clear cache**: Clear browser cache and reload
3. **Update browser**: Use latest browser version
4. **Check RAM**: Monitor system memory usage

#### 🔴 Build/Packaging Errors

**Problem**: `npm run build` or electron build fails

**Solutions**:

1. **Dependencies**: Run `npm install` again
2. **Node version**: Ensure Node.js 18+ for electron builds
3. **Platform tools**: Install build tools for your platform
4. **Clean build**: Delete dist/ and rebuild

---

## FAQ

### General Questions

**Q: What is the McP workflow?**
A: McP stands for Monitor-Contextualize-Personalize. It's our core workflow that captures user interactions, adds context through semantic search, and generates personalized AI responses.

**Q: Do I need API keys to use the app?**
A: No, you can use the Mock LLM provider for testing without any API keys. Real AI responses require API keys from OpenAI, Anthropic, or local Ollama setup.

**Q: Is my data stored securely?**
A: Data is stored locally in your browser's localStorage. For production use, configure external databases like Supabase. Never commit sensitive data to version control.

**Q: Can I use this offline?**
A: Basic functionality works offline with Mock LLM. Real LLM features and some integrations require internet connectivity.

**Q: How do workflows get loaded if I don't have backend access?**
A: Use the "Workflow Bootstrap" feature on the Dashboard. It loads workflow definitions from local JSON files and imports them directly into your N8N instance via API, no backend required!

### Technical Questions

**Q: What's the difference between web and desktop versions?**
A: The web version runs in your browser. The desktop version is a native app with additional system integration capabilities.

**Q: How do I backup my data?**
A: Use the export functionality in Agent Truth Files to download your data as JSON. Import the JSON file to restore data.

**Q: Can I customize agent personalities?**
A: Yes, use the Agent Truth Files section to create and modify agent personalities, memories, and behavioral traits.

**Q: How does the learning system work?**
A: The feedback loop analyzes interaction effectiveness and automatically adjusts agent responses and knowledge representation over time.

---

## Support

### Getting Help

1. **Check this guide first** - Most common issues are covered here
2. **Run system tests** - Use the Testing tab to diagnose problems
3. **Check browser console** - Press F12 for developer tools and error messages
4. **Review logs** - Agent console shows detailed operation logs

### Reporting Issues

When reporting problems, please include:

- **Version**: v0.7.0-alpha
- **Browser/OS**: Chrome 120 on Windows 11
- **Steps to reproduce**: Detailed steps that cause the issue
- **Error messages**: Copy from browser console or agent console
- **Expected vs actual behavior**: What should happen vs what does happen

### Community Resources

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check PROJECT_DOCUMENTATION.md for technical details
- **Changelog**: Review recent updates and known issues

---

## Version Information

**Current Version**: v0.7.0-alpha
**Release Date**: February 13, 2026
**Previous Version**: v0.6.0-alpha

### What's New in v0.7.0-alpha

- Enhanced MCP workflow processing
- Improved error handling and recovery
- Better voice recognition reliability
- Expanded testing suite
- Security improvements for configuration management
- Performance optimizations

---

_This guide is updated for v0.7.0-alpha. For the latest information, check the project repository._
