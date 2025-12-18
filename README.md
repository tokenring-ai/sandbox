# @tokenring-ai/sandbox

## Overview

The `@tokenring-ai/sandbox` package provides an abstract interface for managing sandboxed environments within the Token Ring AI agent system. It enables the creation, execution, and management of isolated containers (e.g., via Docker or similar providers) to safely run commands or code. The package acts as a service layer that abstracts provider-specific details, allowing multiple sandbox providers to be registered and switched dynamically.

Key features include:
- Abstract provider interface for extensibility (e.g., Docker, Kubernetes)
- Service management for active providers and containers
- Integration with Token Ring agents via tools and chat commands
- Error handling for missing providers/containers and command failures

## Installation

```bash
npm install @tokenring-ai/sandbox
```

### Dependencies

- `@tokenring-ai/agent@0.1.0` - For agent integration and service management
- `zod@^4.1.12` - For schema validation in tools

### Setup

This package is designed for use within the Token Ring AI ecosystem. To set up:

1. Install the package as shown above
2. Ensure you have a concrete sandbox provider implementation (e.g., Docker provider)
3. Register the provider with the SandboxService

## Package Structure

```
pkg/sandbox/
├── index.ts                 # Package entry point and plugin definition
├── SandboxProvider.ts       # Abstract base class and interfaces
├── SandboxService.ts        # Core service implementation
├── tools.ts                 # Tool exports
├── chatCommands.ts          # Chat command exports
├── tools/                   # Individual tool implementations
│   ├── createContainer.ts
│   ├── executeCommand.ts
│   ├── stopContainer.ts
│   ├── getLogs.ts
│   └── removeContainer.ts
├── chatCommands/            # Chat command implementations
│   └── sandbox.ts
├── package.json
└── README.md
```

## Core Components

### SandboxProvider (Abstract Class)

The `SandboxProvider` is the foundational interface for any concrete sandbox implementation. It defines methods for container lifecycle and execution.

**Key Methods:**

- `createContainer(options?: SandboxOptions): Promise<SandboxResult>`
  - Creates a new container
  - Parameters: `SandboxOptions` (image, workingDir, environment, timeout)
  - Returns: `{ containerId: string; status: string }`

- `executeCommand(containerId: string, command: string): Promise<ExecuteResult>`
  - Runs a command in the specified container
  - Returns: `{ stdout: string; stderr: string; exitCode: number }`

- `stopContainer(containerId: string): Promise<void>`
  - Stops the container

- `getLogs(containerId: string): Promise<LogsResult>`
  - Retrieves logs
  - Returns: `{ logs: string }`

- `removeContainer(containerId: string): Promise<void>`
  - Removes the container

**Interfaces:**

```typescript
interface SandboxOptions {
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

The `SandboxService` manages multiple providers and tracks the active container. It implements `TokenRingService` for integration with agents.

**Key Methods:**

- `registerSandboxProvider(name: string, resource: SandboxProvider): void`
  - Registers a provider; sets as active if none exists

- `setActiveSandboxProviderName(name: string): void`
  - Switches the active provider (throws if not found)

- `getActiveSandboxProviderName(): string | null`
  - Returns the current active provider

- `getAvailableSandboxProviders(): string[]`
  - Lists registered providers

- `setActiveContainer(containerId: string): void` / `getActiveContainer(): string | null`
  - Manages the active container ID

- `createContainer(options?: SandboxOptions): Promise<SandboxResult>`
  - Delegates to active provider; sets active container

- `executeCommand(containerId: string, command: string): Promise<ExecuteResult>`
  - Executes via active provider

- `stopContainer(containerId: string): Promise<void>`
  - Stops and clears active if matching

- `getLogs(containerId: string): Promise<LogsResult>`
  - Retrieves logs via active provider

- `removeContainer(containerId: string): Promise<void>`
  - Removes and clears active if matching

### Tools

Tools are agent-executable functions that wrap service methods, providing logging and validation via Zod schemas. Exported from `tools.ts`.

**Available Tools:**

- `sandbox/createContainer`: Creates a container with optional parameters
- `sandbox/executeCommand`: Executes a command (uses active container if unspecified)
- `sandbox/stopContainer`: Stops a container (uses active container if unspecified)
- `sandbox/getLogs`: Gets container logs (uses active container if unspecified)
- `sandbox/removeContainer`: Removes a container (uses active container if unspecified)

Each tool logs actions via the agent's chat service and handles errors (e.g., no active container).

### Chat Commands

The `/sandbox` command provides interactive control in agent chats.

**Actions:**

- `create [image]`: Create a new container
- `exec <command>`: Execute command in active container
- `stop [containerId]`: Stop container
- `logs [containerId]`: Get container logs
- `remove [containerId]`: Remove container
- `status`: Show active container and provider
- `provider [name]`: Show/set active provider

**Usage Examples:**

```
/sandbox provider docker
/sandbox create ubuntu:latest
/sandbox exec echo "Hello Sandbox"
/sandbox logs
/sandbox remove
```

## Usage Examples

### 1. Plugin Registration

The package is designed as a Token Ring plugin. It automatically registers tools and chat commands when installed:

```typescript
import TokenRingApp from "@tokenring-ai/app";
import sandboxPlugin from "@tokenring-ai/sandbox";

const app = new TokenRingApp();
app.install(sandboxPlugin);
```

### 2. Configuration

Configure sandbox providers in your app configuration:

```typescript
// Example configuration
const config = {
  sandbox: {
    providers: {
      docker: {
        type: "docker",
        // Docker-specific configuration
      }
    },
    default: {
      provider: "docker"
    }
  }
};
```

### 3. Using the Service Directly

```typescript
import { SandboxService } from "@tokenring-ai/sandbox";

const sandboxService = new SandboxService();

// Register a provider
sandboxService.registerSandboxProvider('docker', dockerProvider);

// Create and use container
const result = await sandboxService.createContainer({ 
  image: 'ubuntu:latest' 
});
console.log(`Created: ${result.containerId}`);

const execResult = await sandboxService.executeCommand(
  result.containerId, 
  'ls -la'
);
console.log(`Stdout: ${execResult.stdout}`);
```

### 4. Using Tools in Agent Workflow

```typescript
// Agent invokes tool
await agent.executeTool('sandbox/createContainer', { 
  image: 'node:18' 
});
await agent.executeTool('sandbox/executeCommand', { 
  command: 'node --version' 
});
```

## API Reference

### SandboxService

```typescript
class SandboxService implements TokenRingService {
  registerSandboxProvider(name: string, resource: SandboxProvider): void
  setActiveSandboxProviderName(name: string): void
  getActiveSandboxProviderName(): string | null
  getAvailableSandboxProviders(): string[]
  createContainer(options?: SandboxOptions): Promise<SandboxResult>
  executeCommand(containerId: string, command: string): Promise<ExecuteResult>
  stopContainer(containerId: string): Promise<void>
  getLogs(containerId: string): Promise<LogsResult>
  removeContainer(containerId: string): Promise<void>
  getActiveContainer(): string | null
  setActiveContainer(containerId: string): void
}
```

### SandboxProvider (Abstract)

```typescript
abstract class SandboxProvider {
  abstract createContainer(options?: SandboxOptions): Promise<SandboxResult>
  abstract executeCommand(containerId: string, command: string): Promise<ExecuteResult>
  abstract stopContainer(containerId: string): Promise<void>
  abstract getLogs(containerId: string): Promise<LogsResult>
  abstract removeContainer(containerId: string): Promise<void>
}
```

### Exports

```typescript
// Main exports
export default sandboxPlugin satisfies TokenRingPlugin
export { SandboxService }
export { SandboxResource as SandboxProvider }

// Configuration schema
export const SandboxConfigSchema: z.ZodType

// Tools
export * from './tools'

// Chat commands
export * from './chatCommands'
```

## Configuration Options

### SandboxOptions
- `image?`: Container image to use (e.g., 'ubuntu:latest')
- `workingDir?`: Working directory in container
- `environment?`: Environment variables as key-value pairs
- `timeout?`: Timeout in seconds for operations

### Provider Configuration
Providers are configured through the app's sandbox configuration. The package currently supports Docker providers out of the box, with the ability to extend for other providers.

## Dependencies

- `@tokenring-ai/agent@0.1.0` - For agent integration and service management
- `zod@^4.1.12` - For schema validation in tools

## Development

### Building

```bash
npm run build
```

### Testing

Unit tests for the service and tools should mock providers. Integration tests require concrete implementations (e.g., Docker).

### Extending

To add new sandbox providers:

1. Create a class that extends `SandboxProvider`
2. Implement all required abstract methods
3. Register the provider with `SandboxService.registerSandboxProvider()`

Example:

```typescript
class MyCustomProvider extends SandboxProvider {
  async createContainer(options?: SandboxOptions): Promise<SandboxResult> {
    // Implementation
  }
  
  // Implement other methods...
}
```

## License

MIT License - see LICENSE file for details.