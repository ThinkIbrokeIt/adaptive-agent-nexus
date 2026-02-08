
# Adaptive Agent Nexus

## Introduction

The Adaptive Agent Nexus is an intelligent system designed to bring context-aware, self-learning capabilities to AI agents. By implementing the innovative Monitor-Contextualize-Personalize (McP) workflow architecture, this platform enables agents to:

- **Learn from interactions** through continuous feedback loops
- **Adapt responses** based on contextual understanding
- **Improve over time** by self-optimizing knowledge representation
- **Provide personalized experiences** tailored to specific user needs

The system solves critical challenges in traditional AI implementations, including context amnesia, static knowledge representation, and one-size-fits-all responses. Through its adaptable architecture, the platform bridges the gap between raw data collection and meaningful, personalized agent interactions.

## Architecture

The system is built with a modular architecture that separates concerns:

- **Agent Network**: Manages the coordination between specialized agents
- **Command Processing**: Handles different types of user commands via dedicated processors
- **Workflow Engine**: Implements the McP workflow architecture
- **Voice Interface**: Provides natural language interaction capabilities

### Agent Types

- **Primary Agent**: Handles general conversations and coordinates other agents
- **Research Agent**: Performs search and information gathering
- **Workflow Agent**: Executes the McP workflow processes
- **Data Agent**: Manages database queries and data analysis
- **Learning Agent**: Responsible for adapting the system based on feedback

## Future Roadmap

We're exploring several exciting enhancements to the platform:

- **Multi-agent collaboration** enabling specialized agents to work together
- **Advanced knowledge vector fusion** for more nuanced contextual understanding
- **Expanded self-optimization capabilities** through reinforcement learning
- **Visualization tools** for knowledge graph evolution
- **Enhanced voice interface** with emotion detection and natural conversation

## Setup and Basic Usage

### Installation

1. **Clone the repository:**
   ```
   git clone https://github.com/your-username/adaptive-agent-nexus.git
   cd adaptive-agent-nexus
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Start the development server:**
   ```
   npm run dev
   ```

4. **Open in browser:**
   Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

### Desktop Application Packaging

The application can be packaged as native desktop applications for Windows, macOS, and Linux.

#### Quick Packaging Commands

```bash
# Build for all platforms
npm run dist

# Build for specific platforms
npm run build:electron:win     # Windows
npm run build:electron:mac     # macOS
npm run build:electron:linux   # Linux

# Development mode (web + electron)
npm run electron:dev

# Check build status
npm run package status
```

#### Generated Files

After building, you'll find the packaged applications in the `dist-electron/` directory:

- **Windows**: `.exe` installer and portable executable
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` and `.deb` packages

#### System Requirements

- **Windows**: Windows 10 or later
- **macOS**: macOS 10.13 or later
- **Linux**: Most modern distributions

### Local Storage Mode

This version runs entirely locally using browser localStorage for data persistence. No external databases or authentication services are required.

**Data Storage:**
- Agent identities and truths are stored in your browser's localStorage
- Data persists between sessions but is browser-specific
- You can export/import data as JSON for backup or transfer

**Features Available:**
- Full agent truth file management
- Memory anchor creation
- Principle evolution tracking
- Data export/import functionality

### Data Management

**Export Data:**
- Navigate to the Agent Truth Files page
- Use the export functionality to download your data as JSON

**Import Data:**
- Use the import functionality to restore data from a JSON backup

**Clear Data:**
- Data clearing functionality is available in the truth file management interface

**Browser Storage:**
- Data is stored locally in your browser
- Clearing browser data will remove all stored information
- Use export functionality to backup important data
### LLM Configuration

The system supports multiple LLM providers for enhanced responses:

1. **Navigate to LLM Settings tab** in the main dashboard
2. **Choose your provider:**
   - **Mock**: No API required, uses simulated responses
   - **OpenAI**: GPT-4, GPT-3.5-turbo (requires API key)
   - **Anthropic**: Claude models (requires API key)
   - **Ollama**: Local models (requires Ollama installation)

3. **Configure settings:**
   - API key (for cloud providers)
   - Model selection
   - Temperature and token limits
   - Test connection before saving

4. **Test your setup:**
   - Use the "Test Connection" button to verify LLM connectivity
   - Try commands like "tell me about artificial intelligence" to test real LLM responses

**Getting API Keys:**
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Ollama**: Install from https://ollama.ai/ (local only)
### Testing Real LLM Integration

### ✅ **Infrastructure Now Ready**

The app now includes **real LLM integration** instead of mock responses! Agents will use actual AI models for intelligent responses.

### Quick LLM Test

1. **Open the app** at `http://localhost:8090`
2. **Navigate to LLM Settings** tab
3. **Choose a provider:**
   - **Mock**: No setup required (simulated responses)
   - **OpenAI**: Requires API key from https://platform.openai.com/api-keys
   - **Anthropic**: Requires API key from https://console.anthropic.com/
   - **Ollama**: Requires local Ollama installation

4. **Test the connection:**
   - Click "Test Connection" to verify API connectivity
   - Try commands like "tell me about artificial intelligence"
   - Agents now provide real AI-generated responses!

### Example Commands to Test

```
help
status
run workflow
tell me about machine learning
search for information about climate change
```

## What's New in v0.6.0-alpha

### 🚀 Real MCP Workflow Processing
- **Before**: Simulated workflow execution with mock data
- **Now**: Full implementation with actual Monitor → Contextualize → Personalize phases
- **Features**:
  - Real trigger capture and validation
  - Live semantic search for context enrichment
  - LLM-powered personalized responses
  - Real-time workflow statistics

### 🎯 Interactive Knowledge Graph
- **Before**: Static visualization
- **Now**: Fully interactive real-time agent network display
- **Features**:
  - Drag-and-drop node positioning
  - Live agent status updates
  - Advanced filtering and selection
  - Detailed node information panels

### 📊 Real Trigger Data
- **Before**: Mock trigger data in Recent Triggers
- **Now**: Live trigger tracking from actual workflow processing
- **Features**:
  - Automatic trigger logging
  - Rich metadata display (priority, source, timestamp)
  - Real-time trigger history

### 🧪 Enhanced Testing Suite
- **Before**: Basic feature verification
- **Now**: 14 comprehensive system tests
- **Features**:
  - Automated MCP workflow validation
  - Real-time component testing
  - Performance monitoring

### Quick Start with New Features

1. **Run Real MCP Workflows**:
   - Go to Dashboard → Click "Run MCP Workflow"
   - Watch live progress through all phases
   - View real triggers in Recent Triggers panel

2. **Explore Interactive Knowledge Graph**:
   - Navigate to Knowledge Graph tab
   - Drag nodes, filter agents, view real-time updates

3. **Test System Features**:
   - System Tests tab → Run comprehensive validation
   - Monitor real-time test results and performance

---

## Basic Commands

### `help`
- **Description**: Displays a list of available commands
- **Usage**: Simply type `help` or say "help"
- **Example**:
  ```
  > help
  Available commands: run workflow, query [db] [params], status, clear, feedback [on|off], voice [on|off]
  ```

### `status`
- **Description**: Provides an overview of the system's current state
- **Usage**: Type `status` or say "status"
- **Example**:
  ```
  > status
  System status: OPERATIONAL
  McP processors: ACTIVE (3/3)
  Memory usage: 1.2GB / 4GB
  Storage status: CONNECTED
  Feedback loop: ENABLED
  Voice interface: ENABLED
  ```

### `clear`
- **Description**: Clears the console log
- **Usage**: Type `clear` or say "clear"
- **Example**:
  ```
  > clear
  Console cleared.
  ```

## Workflow Commands

### `run workflow`
- **Description**: Initiates the real McP (Monitor-Contextualize-Personalize) workflow with actual data processing
- **Usage**: Type `run workflow` or click "Run MCP Workflow" button in dashboard
- **Real Phases**:
  1. Monitor: Captures and validates real user interaction data
  2. Contextualize: Performs live semantic search and user pattern analysis
  3. Personalize: Generates LLM-powered adaptive responses with personalization
  4. Feedback: Updates agent knowledge based on real response effectiveness
- **Example**:
  ```bash
  > run workflow
  MCP Workflow initiated with real data processing...
  Monitor phase: Captured trigger with 95% confidence
  Contextualize phase: Enriched context with 3 relevant items
  Personalize phase: Generated response with 91% confidence
  Workflow completed in 1.2 seconds
  ```

### `feedback [on|off]`
- **Description**: Controls the agent's self-learning feedback loop
- **Usage**: Type `feedback on` or `feedback off`
- **Example**:
  ```
  > feedback on
  Feedback loop enabled. Agent will continuously learn from interactions.
  
  > feedback off
  Feedback loop disabled. Agent will not adapt from interactions.
  
  > feedback
  Current feedback status: ENABLED
  ```

## Voice Interface

### `voice [on|off]`
- **Description**: Controls the agent's voice response capability
- **Usage**: Type `voice on` or `voice off`
- **Example**:
  ```
  > voice on
  Voice output enabled.
  
  > voice off
  Voice output disabled.
  
  > voice
  Current voice status: ENABLED
  ```

### Using Voice Commands
- Click the microphone button to start voice recognition
- Speak your command clearly
- The agent will process your speech and execute the command
- If voice output is enabled, the agent will also respond using speech synthesis

## Knowledge Queries

### `tell me about [topic]`
- **Description**: Queries the agent's knowledge base about a specific topic
- **Usage**: Type `tell me about [topic]` or ask using voice
- **Example**:
  ```
  > tell me about feedback loops
  Retrieving information about "feedback loops"...
  feedback loops are part of the agent's knowledge base. They relate to adaptive learning systems that continuously evolve through feedback and context-aware interactions.
  ```

## Database Interaction

### `query`
- **Description**: Executes database queries
- **Usage**: `query [db] [parameters]`
- **Example**:
  ```
  > query interactions limit 5
  Query returned 5 results.
  ```

## Conversational Interaction
The agent can also respond to natural language questions and commands that don't match specific command formats. Simply type your question or use voice input to engage in a conversation.

## Troubleshooting

- If a command is not recognized, the console will return an error message
- Commands are case-insensitive
- Refer to the `help` command for the most up-to-date list of available commands
- If voice recognition fails, try speaking more clearly or switch to text input
- If voice output is not working, check your browser's audio settings

## Versions

Current Console Version: v0.6.0-alpha

## Quick Tips
- Press Enter to execute a typed command
- Click the microphone button to use voice commands
- Toggle voice output on/off using the speaker button
- Use the command history for quick access to previous commands
- The console provides real-time feedback for each command execution
- The feedback loop enables continuous agent improvement and adaptation
