
# Agent Console Commands

The Agent Console provides a powerful interface for interacting with the AI system. Here's a comprehensive guide to the available commands:

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
- **Description**: Initiates the McP (Monitor-Contextualize-Personalize) workflow
- **Usage**: Type `run workflow` or say "run workflow"
- **Stages**:
  1. Monitor: Captures user interaction
  2. Contextualize: Retrieves relevant knowledge vectors
  3. Personalize: Generates adaptive response
  4. Feedback: Evaluates effectiveness and updates agent knowledge (when enabled)
- **Example**:
  ```
  > run workflow
  Initiating McP workflow...
  Monitor phase completed. User interaction stored in DuckDB.
  Contextualize phase completed. Knowledge vectors retrieved.
  Personalize phase completed. Response generated.
  Feedback loop activated. Processing response effectiveness...
  Adaptation complete. Agent knowledge graph updated.
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

Current Console Version: v0.5.0-alpha

## Quick Tips
- Press Enter to execute a typed command
- Click the microphone button to use voice commands
- Toggle voice output on/off using the speaker button
- Use the command history for quick access to previous commands
- The console provides real-time feedback for each command execution
- The feedback loop enables continuous agent improvement and adaptation
