# @tokenring-ai/sandbox

## Overview

The `@tokenring-ai/sandbox` package provides an abstract interface for managing sandboxed environments within the Token Ring AI agent system. It enables the creation, execution, and management of isolated containers (e.g., via Docker or similar providers) to safely run commands or code. The package acts as a service layer that abstracts provider-specific details, allowing multiple sandbox providers to be registered and switched dynamically.

Key features include:
- Abstract provider interface for extensibility (e.g., Docker, Kubernetes)
- Service management for active providers and containers with label-to-container ID mapping
- Integration with Token Ring agents via tools and chat commands
- Agent state management with persistence and transfer capabilities
- Label-based container referencing for easier management

## Installation

```bash
bun install @tokenring-ai/sandbox
```

## Package Structure

```
pkg/sandbox/
├── index.ts                 # Package entry point
├── SandboxProvider.ts       # Abstract interface for providers and type definitions
├── SandboxService.ts        # Core service implementation
├── schema.ts                # Schema definitions for validation
├── tools.ts                 # Tool exports
├── chatCommands.ts          # Chat command exports
├── plugin.ts                # Plugin definition and installation logic
├── state/
│   └── SandboxState.ts      # Agent state management for sandbox
├── tools/
│   ├── createContainer.ts   # sandbox_createContainer tool
│   ├── executeCommand.ts    # sandbox_executeCommand tool
│   ├── stopContainer.ts     # sandbox_stopContainer tool
│   ├── getLogs.ts           # sandbox_getLogs tool
│   └── removeContainer.ts   # sandbox_removeContainer tool
├── commands/
│   └── sandbox/
│       ├── sandbox.ts       # Main command entry with help
│       ├── create.ts        # create action
│       ├── exec.ts          # exec action
│       ├── stop.ts          # stop action
│       ├── logs.ts          # logs action
│       ├── remove.ts        # remove action
│       ├── status.ts        # status action
│       └── provider/        # provider subcommand
│           ├── get.ts       # get current provider
│           ├── set.ts       # set provider by name
│           ├── reset.ts     # reset to initial provider
│           └── select.ts    # interactive provider selection
├── package.json
├── LICENSE
└── README.md
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

- `registerProvider(name: string, resource: SandboxProvider): void`
  - Registers a provider in the internal registry

- `getAvailableProviders(): string[]`
  - Returns names of all registered providers

- `attach(agent: Agent): void`
  - Attaches the service to an agent and initializes agent state

- `requireActiveProvider(agent: Agent): SandboxProvider`
  - Gets the active provider or throws an error if none is set

- `getActiveProvider(agent: Agent): SandboxProvider | null`
  - Gets the active provider or returns null

- `setActiveProvider(name: string, agent: Agent): void`
  - Sets the active provider by name

- `getActiveContainer(agent: Agent): string | null`
  - Gets the active container label or ID

- `setActiveContainer(containerId: string, agent: Agent): void`
  - Sets the active container

- `createContainer(options: SandboxOptions | undefined, agent: Agent): Promise<SandboxResult>`
  - Creates a container using the active provider
  - Sets the created container as active with label mapping

- `executeCommand(label: string, command: string, agent: Agent): Promise<ExecuteResult>`
  - Executes a command in the specified container
  - Uses label-to-container ID mapping

- `stopContainer(label: string, agent: Agent): Promise<void>`
  - Stops the specified container
  - Clears active container if it matches

- `getLogs(label: string, agent: Agent): Promise<LogsResult>`
  - Retrieves logs from the specified container

- `removeContainer(label: string, agent: Agent): Promise<void>`
  - Removes the specified container and its label mapping

### SandboxState

The `SandboxState` class manages agent state for sandbox operations, implementing `AgentStateSlice`.

**State Properties:**

- `provider: string | null` - Current active provider name
- `activeContainer: string | null` - Current active container label
- `labelToContainerId: Map<string, string>` - Maps labels to container IDs

**State Methods:**

- `transferStateFromParent(parent: Agent): void`
  - Transfers state from a parent agent (for agent teams)

- `serialize(): object`
  - Serializes state for persistence

- `deserialize(data: any): void`
  - Deserializes persisted state

- `show(): string[]`
  - Returns state summary strings

### Tools

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
  label: z.string().describe("Label for the container"),
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

// sandbox_stopContainer, sandbox_getLogs, sandbox_removeContainer
z.object({
  label: z.string().optional().describe("Container label (uses active container if not specified)"),
});
```

### Chat Commands

The `/sandbox` command provides interactive control in agent chats.

**Syntax:**

```
/sandbox <action> [arguments]
```

**Actions:**

| Action | Description |
|--------|-------------|
| `create <label> [image]` | Create a new container with label and optional image |
| `exec <command>` | Execute command in active container |
| `stop [label]` | Stop container (uses active if unspecified) |
| `logs [label]` | Get container logs (uses active if unspecified) |
| `remove [label]` | Remove container (uses active if unspecified) |
| `status` | Show active container and provider |
| `provider get` | Show current provider |
| `provider set <name>` | Set provider by name |
| `provider reset` | Reset provider to initial configuration |
| `provider select` | Interactively select provider from available list |

**Usage Examples:**

```
/sandbox create myapp ubuntu:22.04
/sandbox exec ls -la /app
/sandbox logs
/sandbox stop
/sandbox status
/sandbox provider set docker
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
import { SandboxService } from "@tokenring-ai/sandbox";
import { DockerSandboxProvider } from "@tokenring-ai/docker";

const sandboxService = new SandboxService({
  providers: {},
  agentDefaults: { provider: "docker" }
});

// Register a provider
sandboxService.registerProvider('docker', new DockerSandboxProvider());

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
await agent.executeTool('sandbox_executeCommand', { 
  command: 'node --version'
});
```

### Provider Configuration

The plugin supports configuring multiple sandbox providers at installation time:

```typescript
app.install(sandboxPlugin, {
  sandbox: {
    providers: {
      docker: {
        type: "docker",
        // Docker-specific configuration
      },
      kubernetes: {
        type: "kubernetes",
        // Kubernetes-specific configuration
      }
    },
    agentDefaults: {
      provider: "docker"
    }
  }
});
```

## Configuration Options

### Plugin Configuration Schema

The plugin accepts a configuration with the following structure:

```typescript
{
  sandbox: {
    providers: Record<string, { type: string; [key: string]: any }>;  // Optional provider configurations
    agentDefaults: {
      provider?: string;  // Optional default provider for agents
    }
  }
}
```

### SandboxAgentConfigSchema

```typescript
z.object({
  provider: z.string().optional()
}).default({})
```

### SandboxOptions

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Optional label for container reference |
| `image` | `string` | Container image to use (e.g., 'ubuntu:latest') |
| `workingDir` | `string` | Working directory in container |
| `environment` | `Record<string, string>` | Environment variables |
| `timeout` | `number` | Timeout in seconds for operations |

## Development

### Building

```bash
bun run build
```

### Testing

```bash
bun run test
```

### Extending

To add new sandbox providers:

1. Create a class that implements `SandboxProvider` interface
2. Implement all required methods
3. Register the provider with `SandboxService.registerProvider()`

Example:

```typescript
import { SandboxProvider } from "@tokenring-ai/sandbox";

class MyCustomProvider implements SandboxProvider {
  async createContainer(options?: SandboxOptions): Promise<SandboxResult> {
    // Implementation
  }
  
  async executeCommand(containerId: string, command: string): Promise<ExecuteResult> {
    // Implementation
  }
  
  async stopContainer(containerId: string): Promise<void> {
    // Implementation
  }
  
  async getLogs(containerId: string): Promise<LogsResult> {
    // Implementation
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
- `@tokenring-ai/docker`: 0.2.0
- `@tokenring-ai/agent`: 0.2.0
- `@tokenring-ai/utility`: 0.2.0
- `zod`: ^4.3.6

### Development Dependencies

- `vitest`: ^4.0.18
- `typescript`: ^5.9.3

## License

MIT License - see [LICENSE](./LICENSE) file for details.
