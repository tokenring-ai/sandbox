# @tokenring-ai/sandbox

## Overview

The `@tokenring-ai/sandbox` package provides an abstract interface for managing sandboxed environments within the Token Ring AI agent system. It enables the creation, execution, and management of isolated containers (e.g., via Docker or similar providers) to safely run commands or code. The package acts as a service layer that abstracts provider-specific details, allowing multiple sandbox providers to be registered and switched dynamically.

Key features include:
- Abstract provider interface for extensibility (e.g., Docker, Kubernetes)
- Service management for active providers and containers with label-to-container ID mapping
- Integration with Token Ring agents via tools and chat commands
- Agent state management with persistence and transfer capabilities
- Label-based container referencing for easier management

## Package Structure

```
pkg/sandbox/
├── index.ts                 # Package entry point
├── SandboxProvider.ts       # Abstract interface for providers and type definitions
├── SandboxService.ts        # Core service implementation
├── schema.ts                # Schema definitions for validation
├── tools.ts                 # Tool exports
├── commands.ts              # Chat command exports
├── plugin.ts                # Plugin definition and installation logic
├── state/
│   └── SandboxState.ts      # Agent state management for sandbox
├── commands/
│   └── sandbox/
│       ├── create.ts        # create action
│       ├── exec.ts          # exec action
│       ├── stop.ts          # stop action
│       ├── logs.ts          # logs action
│       ├── remove.ts        # remove action
│       ├── status.ts        # status action
│       └── provider/
│           ├── get.ts       # get current provider
│           ├── set.ts       # set provider by name
│           ├── reset.ts     # reset to initial provider
│           └── select.ts    # interactive provider selection
├── tools/
│   ├── createContainer.ts   # sandbox_createContainer tool
│   ├── executeCommand.ts    # sandbox_executeCommand tool
│   ├── stopContainer.ts     # sandbox_stopContainer tool
│   ├── getLogs.ts           # sandbox_getLogs tool
│   └── removeContainer.ts   # sandbox_removeContainer tool
├── package.json
├── LICENSE
└── README.md
```

## Installation

```bash
bun add @tokenring-ai/sandbox
```

## Core Components

### SandboxProvider (Interface)

The `SandboxProvider` interface defines the contract for any concrete sandbox implementation. It defines methods for container lifecycle and execution.

**Interface Definition:**

```typescript
interface SandboxProvider {
  createContainer(options?: SandboxOptions): Promise<SandboxResult>;
  executeCommand(containerId: string, command: string): Promise<ExecuteResult>;
  stopContainer(containerId: string): Promise<void>;
  getLogs(containerId: string): Promise<LogsResult>;
  removeContainer(containerId: string): Promise<void>;
}
```

**Type Definitions:**

```typescript
interface SandboxOptions {
  label?: string;
  image?: string;
  workingDir?: string;
  environment?: Record<string, string>;
  timeout?: number;
}

interface SandboxResult {
  containerId: string;
  status: string;
}

interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

interface LogsResult {
  logs: string;
}
```

### SandboxService

The `SandboxService` manages multiple providers and tracks the active container with label-to-container ID mapping. It implements `TokenRingService` for integration with agents.

**Service Methods:**

- `readonly name: string` - Service name ("SandboxService")
- `readonly description: string` - Service description
- `readonly options: z.output<typeof SandboxServiceConfigSchema>` - Service configuration options
- `registerProvider: (name: string, resource: SandboxProvider) => void`
  - Registers a provider in the internal registry using `KeyedRegistry`

- `getAvailableProviders: () => string[]`
  - Returns names of all registered providers

- `attach(agent: Agent): void`
  - Attaches the service to an agent and initializes agent state with merged configuration

- `requireActiveProvider(agent: Agent): SandboxProvider`
  - Gets the active provider or throws an error if none is set

- `getActiveProvider(agent: Agent): SandboxProvider | null`
  - Gets the active provider or returns null

- `setActiveProvider(name: string, agent: Agent): void`
  - Sets the active provider by name in agent state

- `getActiveContainer(agent: Agent): string | null`
  - Gets the active container label

- `setActiveContainer(containerId: string, agent: Agent): void`
  - Sets the active container label in agent state

- `async createContainer(options: SandboxOptions | undefined, agent: Agent): Promise<SandboxResult>`
  - Creates a container using the active provider
  - Sets the created container as active with label mapping
  - Returns `{ containerId: label, status }` where label is from options or the actual container ID

- `async executeCommand(label: string, command: string, agent: Agent): Promise<ExecuteResult>`
  - Executes a command in the specified container
  - Uses label-to-container ID mapping from state
  - If label is not found in map, uses label as container ID directly

- `async stopContainer(label: string, agent: Agent): Promise<void>`
  - Stops the specified container
  - Clears active container if it matches the stopped container

- `async getLogs(label: string, agent: Agent): Promise<LogsResult>`
  - Retrieves logs from the specified container
  - Uses label-to-container ID mapping

- `async removeContainer(label: string, agent: Agent): Promise<void>`
  - Removes the specified container and its label mapping
  - Clears active container if it matches the removed container

### SandboxState

The `SandboxState` class manages agent state for sandbox operations, implementing `AgentStateSlice`.

**State Properties**:

- `provider: string | null` - Current active provider name
- `activeContainer: string | null` - Current active container label
- `labelToContainerId: Map<string, string>` - Maps labels to container IDs
- `initialConfig: z.output<typeof SandboxAgentConfigSchema>` - Initial configuration (from service options)

**State Methods**:

- `constructor(initialConfig: z.output<typeof SandboxAgentConfigSchema>)`
  - Initializes state with provider from initialConfig or null

- `transferStateFromParent(parent: Agent): void`
  - Transfers state from a parent agent (for agent teams)
  - Copies provider, activeContainer, and labelToContainerId map

- `serialize(): z.output<typeof serializationSchema>`
  - Serializes state for persistence
  - Converts `labelToContainerId` Map to array of tuples

- `deserialize(data: z.output<typeof serializationSchema>): void`
  - Deserializes persisted state
  - Converts array of tuples back to Map

- `show(): string[]`
  - Returns state summary strings for display
  - Returns active provider and active container status

## Tools

Tools are agent-executable functions that wrap service methods, providing logging and validation via Zod schemas. Exported from `tools.ts`.

**Available Tools:**

| Tool Name | Description |
|-----------|-------------|
| `sandbox_createContainer` | Creates a new sandbox container with optional parameters |
| `sandbox_executeCommand` | Executes a command in a container (uses active if unspecified) |
| `sandbox_stopContainer` | Stops a container (uses active if unspecified) |
| `sandbox_getLogs` | Gets container logs (uses active if unspecified) |
| `sandbox_removeContainer` | Removes a container (uses active if unspecified) |

**Tool Input Schemas:**

```typescript
// sandbox_createContainer
z.object({
  label: z.string().describe("Label for the container (required)"),
  image: z.string().optional().describe("Container image to use"),
  workingDir: z.string().optional().describe("Working directory in container"),
  environment: z.record(z.string(), z.string()).optional().describe("Environment variables"),
  timeout: z.number().optional().describe("Timeout in seconds"),
});

// sandbox_executeCommand
z.object({
  label: z.string().optional().describe("Container label (uses active container if not specified)"),
  command: z.string().min(1).describe("Command to execute"),
});

// sandbox_stopContainer
z.object({
  label: z.string().optional().describe("Container label (uses active container if not specified)"),
});

// sandbox_getLogs
z.object({
  label: z.string().optional().describe("Container label (uses active container if not specified)"),
});

// sandbox_removeContainer
z.object({
  label: z.string().optional().describe("Container label (uses active container if not specified)"),
});
```

**Tool Behavior:**

- **sandbox_createContainer**: Creates a container with the specified label and automatically sets it as the active container. The returned `containerId` is the label provided. All parameters except `label` are optional.

- **sandbox_executeCommand**: Throws an error if no label is specified and no active container exists. Logs command execution and exit code. Non-zero exit codes are logged as errors but the tool still returns the result.

- **sandbox_stopContainer**: Throws an error if no label is specified and no active container exists. Clears the active container state after stopping.

- **sandbox_getLogs**: Throws an error if no label is specified and no active container exists.

- **sandbox_removeContainer**: Throws an error if no label is specified and no active container exists. Removes the label-to-container mapping and clears active container state.

## Chat Commands

The `/sandbox` command provides interactive control in agent chats.

**Syntax:**

```
/sandbox <action> [arguments]
```

**Actions:**

| Action | Description |
|--------|-------------|
| `create <label> [image]` | Create a new container with required label and optional image |
| `exec <command>` | Execute command in active container (requires active container) |
| `stop [label]` | Stop container (uses active if unspecified, requires container) |
| `logs [label]` | Get container logs (uses active if unspecified, requires container) |
| `remove [label]` | Remove container (uses active if unspecified, requires container) |
| `status` | Show active container and provider (no active container required) |
| `provider get` | Show current provider |
| `provider set <name>` | Set provider by name |
| `provider reset` | Reset provider to initial configuration |
| `provider select` | Interactively select provider from available list |

**Usage Examples:**

```bash
/sandbox create myapp ubuntu:22.04
/sandbox exec ls -la /app
/sandbox logs
/sandbox stop
/sandbox status
/sandbox provider set docker
```

### Command Details

#### `/sandbox create <label> [image]`

Create a new sandbox container with an optional image.

**Example:**
```bash
/sandbox create myapp
/sandbox create myapp ubuntu:22.04
```

#### `/sandbox exec <command>`

Execute a command in the active container. Requires an active container to exist.

**Example:**
```bash
/sandbox exec ls -la /app
```

#### `/sandbox stop [label]`

Stop a running container. Uses the active container if no label is specified.

**Example:**
```bash
/sandbox stop
/sandbox stop myapp
```

#### `/sandbox logs [label]`

Retrieve logs from a container. Uses the active container if no label is specified.

**Example:**
```bash
/sandbox logs
/sandbox logs myapp
```

#### `/sandbox remove [label]`

Remove a container. Uses the active container if no label is specified.

**Example:**
```bash
/sandbox remove
/sandbox remove myapp
```

#### `/sandbox status`

Show the current sandbox status including active container and provider.

**Example:**
```bash
/sandbox status
```

#### `/sandbox provider get`

Display the currently active sandbox provider.

**Example:**
```bash
/sandbox provider get
```

#### `/sandbox provider set <name>`

Set the active sandbox provider by name.

**Example:**
```bash
/sandbox provider set docker
```

#### `/sandbox provider reset`

Reset the active sandbox provider to the initial configured value.

**Example:**
```bash
/sandbox provider reset
```

#### `/sandbox provider select`

Interactively select the active sandbox provider. Auto-selects if only one provider is configured.

**Example:**
```bash
/sandbox provider select
```

## Error Handling

The package throws errors in various scenarios:

- **No Active Provider**: When attempting to perform operations without an active provider set
  ```
  [SandboxService] No active provider set
  ```

- **No Container Specified**: When a tool or command requires a container but none is specified and no active container exists
  ```
  [sandbox_executeCommand] No container specified and no active container
  ```

- **Command Failed (Tool)**: When a command executes with a non-zero exit code, the tool logs the error via `agent.errorMessage()` but still returns the result with the exit code. The tool does not throw an exception.

- **Provider Not Found**: When attempting to set a provider that is not registered
  ```
  Provider "docker" not found. Available providers: kubernetes
  ```

- **No Initial Provider**: When attempting to reset to an initial provider that was not configured
  ```
  No initial provider configured
  ```

- **Command Failed (Chat Command)**: Chat commands throw `CommandFailedError` with usage information when required arguments are missing.

- **Unknown Provider Type**: When configuring a provider type that is not implemented in `plugin.ts`
  ```
  Unknown sandbox provider type: <type>
  ```

## Usage Examples

### Plugin Registration

The package is designed as a Token Ring plugin. It automatically registers tools and chat commands when installed:

```typescript
import TokenRingApp from "@tokenring-ai/app";
import sandboxPlugin from "@tokenring-ai/sandbox";

const app = new TokenRingApp();
app.install(sandboxPlugin, {
  sandbox: {
    providers: {
      docker: {
        type: "docker",
        // Docker-specific configuration
      }
    },
    agentDefaults: {
      provider: "docker"
    }
  }
});
```

### Using the Service Directly

```typescript
import SandboxService from "@tokenring-ai/sandbox/SandboxService.ts";
import { DockerSandboxProvider } from "@tokenring-ai/docker";
import Agent from "@tokenring-ai/agent";

const sandboxService = new SandboxService({
  providers: {},
  agentDefaults: { provider: "docker" }
});

// Register a provider
sandboxService.registerProvider('docker', new DockerSandboxProvider());

// Attach to an agent (initializes state)
sandboxService.attach(agent);

// Create and use container
const result = await sandboxService.createContainer({
  label: 'myapp',
  image: 'ubuntu:latest'
}, agent);
console.log(`Created: ${result.containerId}`);

const execResult = await sandboxService.executeCommand(
  result.containerId,
  'ls -la',
  agent
);
console.log(`Stdout: ${execResult.stdout}`);
```

### Using Tools in Agent Workflow

```typescript
// Agent invokes tool
await agent.executeTool('sandbox_createContainer', {
  label: 'myapp',
  image: 'node:18'
});
// After container is created, it becomes the active container
await agent.executeTool('sandbox_executeCommand', {
  command: 'node --version'
});
// Or specify a specific container label
await agent.executeTool('sandbox_executeCommand', {
  label: 'myapp',
  command: 'ls -la'
});
```

### Provider Configuration

The plugin supports configuring sandbox providers at installation time. Currently, only the `docker` provider type is implemented:

```typescript
app.install(sandboxPlugin, {
  sandbox: {
    providers: {
      docker: {
        type: "docker",
        // Docker-specific configuration (passed to DockerSandboxProvider)
      }
    },
    agentDefaults: {
      provider: "docker"
    }
  }
});
```

**Note**: The plugin currently only supports the `docker` provider type. Attempting to configure other provider types will result in an error: `Unknown sandbox provider type: <type>`

**Adding new provider types**: To add support for new provider types, modify the switch statement in `plugin.ts` and implement the corresponding provider class.

## Configuration Options

### Plugin Configuration Schema

The plugin accepts a configuration with the following structure:

```typescript
{
  sandbox: {
    providers: Record<string, { type: string; [key: string]: any }>;  // Optional provider configurations
    agentDefaults: {
      provider: string;  // Required default provider for agents
    }
  }
}
```

### Schema Exports

The `schema.ts` file exports the following schemas:

#### SandboxServiceConfigSchema

```typescript
z.object({
  providers: z.record(z.string(), z.any()).optional(),
  agentDefaults: z.object({
    provider: z.string()  // Required
  })
});
```

This schema defines the plugin configuration structure. The `providers` field is optional and allows configuring multiple sandbox providers at installation time. The `agentDefaults` field is required and specifies the default provider for new agents.

#### SandboxAgentConfigSchema

```typescript
z.object({
  provider: z.string().optional()
}).default({})
```

The `SandboxAgentConfigSchema` defines the per-agent configuration. The `provider` field is optional and allows each agent to have its own active provider setting, which defaults to null if not specified.

### SandboxOptions

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Optional label for container reference |
| `image` | `string` | Container image to use (e.g., 'ubuntu:latest') |
| `workingDir` | `string` | Working directory in container |
| `environment` | `Record<string, string>` | Environment variables |
| `timeout` | `number` | Timeout in seconds for operations |

## Best Practices

- **Always specify a label when creating containers**: Labels provide a consistent way to reference containers across sessions.

- **Check for active container before operations**: Before executing commands, stopping, or removing containers, verify that an active container exists or specify a label explicitly.

- **Use the active container pattern**: After creating a container, it becomes the active container. Subsequent operations without a label will use the active container.

- **Handle provider selection carefully**: When multiple providers are configured, use `/sandbox provider select` for interactive selection or `/sandbox provider set <name>` for programmatic selection.

- **Clean up unused containers**: Regularly remove unused containers to free up resources using `/sandbox remove` or `sandbox_removeContainer` tool.

## Development

### Building

```bash
bun run build
```

### Testing

```bash
bun run test
```

The package uses vitest for testing. Test files should be named `*.test.ts` and placed in the package directory.

### Extending

To add new sandbox providers:

1. Create a class that implements `SandboxProvider` interface
2. Implement all required methods
3. Register the provider with `SandboxService.registerProvider()`
4. Add provider type handling in `plugin.ts` if using plugin registration (switch statement)

**Adding a new provider type to the plugin**:

To add support for a new provider type (e.g., `kubernetes`), modify the `plugin.ts` file:

```typescript
// In plugin.ts, add to the switch statement
case "kubernetes":
  sandboxService.registerProvider(name, new KubernetesSandboxProvider(sandboxConfig));
  break;
```

Example provider implementation:

```typescript
import { SandboxProvider, SandboxOptions, SandboxResult, ExecuteResult, LogsResult } from "@tokenring-ai/sandbox";

class MyCustomProvider implements SandboxProvider {
  async createContainer(options?: SandboxOptions): Promise<SandboxResult> {
    // Implementation
    return { containerId: 'custom-id', status: 'running' };
  }
  
  async executeCommand(containerId: string, command: string): Promise<ExecuteResult> {
    // Implementation
    return { stdout: '', stderr: '', exitCode: 0 };
  }
  
  async stopContainer(containerId: string): Promise<void> {
    // Implementation
  }
  
  async getLogs(containerId: string): Promise<LogsResult> {
    // Implementation
    return { logs: '' };
  }
  
  async removeContainer(containerId: string): Promise<void> {
    // Implementation
  }
}
```

## Exports

### Main Exports

```typescript
export { SandboxService } from "./SandboxService.ts";
export type { SandboxProvider } from "./SandboxProvider.ts";
```

Note: `SandboxService` is exported as the default export from `SandboxService.ts`, so it's imported as `import SandboxService from "./SandboxService.ts"` when used directly.

### Plugin Export

```typescript
export default {
  name: "@tokenring-ai/sandbox",
  version: "0.2.0",
  description: "Abstract sandbox interface for Token Ring",
  install(app, config) {
    // Registers tools, chat commands, and sandbox service
  },
  config: z.object({
    sandbox: SandboxServiceConfigSchema
  })
};
```

## Dependencies

### Production Dependencies

- `@tokenring-ai/app`: 0.2.0
- `@tokenring-ai/chat`: 0.2.0
- `@tokenring-ai/docker`: 0.2.0 (used when docker provider is configured)
- `@tokenring-ai/agent`: 0.2.0
- `@tokenring-ai/utility`: 0.2.0
- `zod`: ^4.3.6

### Development Dependencies

- `vitest`: ^4.1.1
- `typescript`: ^6.0.2

## License

MIT License - see [LICENSE](./LICENSE) file for details.

Copyright (c) 2025 Mark Dierolf
