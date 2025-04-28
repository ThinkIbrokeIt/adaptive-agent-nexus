
# Agent Console Commands

The Agent Console provides a powerful interface for interacting with the AI system. Here's a comprehensive guide to the available commands:

## Basic Commands

### `help`
- **Description**: Displays a list of available commands
- **Usage**: Simply type `help`
- **Example**:
  ```
  > help
  Available commands: run workflow, query [db] [params], status, clear, feedback [on|off]
  ```

### `status`
- **Description**: Provides an overview of the system's current state
- **Usage**: Type `status`
- **Example**:
  ```
  > status
  System status: OPERATIONAL
  McP processors: ACTIVE (3/3)
  Memory usage: 1.2GB / 4GB
  Storage status: CONNECTED
  Feedback loop: ENABLED
  ```

### `clear`
- **Description**: Clears the console log
- **Usage**: Type `clear`
- **Example**:
  ```
  > clear
  Console cleared.
  ```

## Workflow Commands

### `run workflow`
- **Description**: Initiates the McP (Monitor-Contextualize-Personalize) workflow
- **Usage**: Type `run workflow`
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

## Database Interaction

### `query`
- **Description**: Executes database queries
- **Usage**: `query [db] [parameters]`
- **Example**:
  ```
  > query interactions limit 5
  Query returned 5 results.
  ```

## Troubleshooting

- If a command is not recognized, the console will return an error message
- Commands are case-insensitive
- Refer to the `help` command for the most up-to-date list of available commands

## Versions

Current Console Version: v0.4.2-alpha

## Quick Tips
- Press Enter to execute a command
- Use the command history for quick access to previous commands
- The console provides real-time feedback for each command execution
- The feedback loop enables continuous agent improvement and adaptation
