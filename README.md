# Sandbox Package Documentation

## Overview

The `@tokenring-ai/sandbox` package provides an abstract interface for managing sandboxed environments within the Token
Ring AI agent system. It enables the creation, execution, and management of isolated containers (e.g., via Docker or
similar providers) to safely run commands or code. The package acts as a service layer that abstracts provider-specific
details, allowing multiple sandbox providers to be registered and switched dynamically. Its primary role is to
facilitate secure, isolated execution in AI agent workflows, such as running untrusted code or simulating environments.

Key features include:

- Abstract provider interface for extensibility (e.g., Docker, Kubernetes).
- Service management for active providers and containers.
- Integration with Token Ring agents via tools and chat commands.
- Error handling for missing providers/containers and command failures.

## Installation/Setup

This package is designed for use within the Token Ring AI ecosystem. To install:

```bash
npm install @tokenring-ai/sandbox
```

Dependencies:

- `@tokenring-ai/agent@0.1.0` (for agent integration)
- `zod@^4.0.17` (for schema validation)

To build or develop:

- Ensure Node.js (with ES modules support) is installed.
- Run `npm install` in the project root.
- Concrete providers (e.g., Docker-based) must be implemented and registered separately, as this package is abstract.

No additional setup is required beyond registering a `SandboxProvider` implementation with the `SandboxService`.

## Package Structure

The package is organized as follows:

- **SandboxProvider.ts**: Defines the abstract base class for sandbox providers.
- **SandboxService.ts**: Core service implementing `TokenRingService` for managing providers and containers.
- **index.ts**: Package entry point, exporting service, provider, tools, and chat commands.
- **tools.ts**: Exports agent tools for sandbox operations (e.g., `createContainer`, `executeCommand`).
- **tools/**: Individual tool implementations (e.g., `createContainer.ts`, `executeCommand.ts`).
- **chatCommands.ts**: Exports chat command modules.
- **chatCommands/sandbox.ts**: Interactive chat command for sandbox management.
- **package.json**: Metadata and exports configuration.
- **LICENSE**: MIT license file.

Directories like `tools/` and `chatCommands/` contain modular, agent-specific implementations.

## Core Components

### SandboxProvider (Abstract Class)

The `SandboxProvider` is the foundational interface for any concrete sandbox implementation. It defines methods for
container lifecycle and execution.

**Key Methods:**

- `createContainer(options?: SandboxOptions): Promise<SandboxResult>`
 - Creates a new container.
 - Parameters: `SandboxOptions` (image, workingDir, environment, timeout).
 - Returns: `{ containerId: string; status: string }`.

- `executeCommand(containerId: string, command: string): Promise<ExecuteResult>`
 - Runs a command in the specified container.
 - Returns: `{ stdout: string; stderr: string; exitCode: number }`.

- `stopContainer(containerId: string): Promise<void>`
 - Stops the container.

- `getLogs(containerId: string): Promise<LogsResult>`
 - Retrieves logs.
 - Returns: `{ logs: string }`.

- `removeContainer(containerId: string): Promise<void>`
 - Removes the container.

**Interfaces:**

- `SandboxOptions`: `{ image?: string; workingDir?: string; environment?: Record<string, string>; timeout?: number; }`
- `SandboxResult`: `{ containerId: string; status: string; }`
- `ExecuteResult`: `{ stdout: string; stderr: string; exitCode: number; }`
- `LogsResult`: `{ logs: string; }`

Concrete implementations (e.g., DockerProvider) must extend this class.

### SandboxService

The `SandboxService` manages multiple providers and tracks the active container. It implements `TokenRingService` for
integration with agents.

**Key Methods:**

- `registerSandboxProvider(name: string, resource: SandboxProvider): void`
 - Registers a provider; sets as active if none exists.

- `setActiveSandboxProviderName(name: string): void`
 - Switches the active provider (throws if not found).

- `getActiveSandboxProviderName(): string | null`
 - Returns the current active provider.

- `getAvailableSandboxProviders(): string[]`
 - Lists registered providers.

- `setActiveContainer(containerId: string): void` / `getActiveContainer(): string | null`
 - Manages the active container ID.

- `createContainer(options?: SandboxOptions): Promise<SandboxResult>`
 - Delegates to active provider; sets active container.

- `executeCommand(containerId: string, command: string): Promise<ExecuteResult>`
 - Executes via active provider.

- `stopContainer(containerId: string): Promise<void>`
 - Stops and clears active if matching.

- `getLogs(containerId: string): Promise<LogsResult>`
 - Retrieves logs via active provider.

- `removeContainer(containerId: string): Promise<void>`
 - Removes and clears active if matching.

Interactions: The service routes all operations to the active provider. Providers are registered at runtime, enabling
pluggable backends. Active container is auto-set on creation for convenience.

### Tools

Tools are agent-executable functions that wrap service methods, providing logging and validation via Zod schemas.
Exported from `tools.ts`.

Examples:

- `sandbox/createContainer`: Creates a container with optional params.
- `sandbox/executeCommand`: Runs a command (uses active container if unspecified).
- `sandbox/stopContainer`, `sandbox/getLogs`, `sandbox/removeContainer`: Manage containers with optional ID.

Each tool logs actions via the agent's chat service and handles errors (e.g., no active container).

### Chat Commands

The `/sandbox` command provides interactive control in agent chats.

**Actions:**

- `create [image]`: Create container.
- `exec <command>`: Execute in active container.
- `stop [containerId]`: Stop container.
- `logs [containerId]`: Get logs.
- `remove [containerId]`: Remove container.
- `status`: Show active container/provider.
- `provider [name]`: Set/show active provider.

It delegates to the service, with built-in help and error messages.

## Usage Examples

### 1. Registering and Using a Provider in an Agent

Assume a concrete `DockerProvider` extending `SandboxProvider`.

```typescript
import { Agent } from '@tokenring-ai/agent';
import { SandboxService } from '@tokenring-ai/sandbox';
import { DockerProvider } from './DockerProvider'; // Hypothetical implementation

const agent = new Agent();
const sandboxService = new SandboxService();
const dockerProvider = new DockerProvider();

sandboxService.registerSandboxProvider('docker', dockerProvider);
agent.addService(sandboxService);

// Create and use container
const result = await sandboxService.createContainer({ image: 'ubuntu:latest' });
console.log(`Created: ${result.containerId}`);

const execResult = await sandboxService.executeCommand(result.containerId, 'ls -la');
console.log(`Stdout: ${execResult.stdout}`);
```

### 2. Using Tools in Agent Workflow

Tools can be invoked by the agent:

```typescript
// Agent invokes tool
await agent.executeTool('sandbox/createContainer', { image: 'node:18' });
await agent.executeTool('sandbox/executeCommand', { command: 'node --version' });
```

### 3. Chat Command Interaction

In a chat session:

```
/sandbox provider docker
/sandbox create ubuntu:latest
/sandbox exec echo "Hello Sandbox"
/sandbox logs
/sandbox remove
```

## Configuration Options

- **SandboxOptions**: Passed to `createContainer` for customizing images, dirs, env vars, and timeouts.
- **Active Provider/Container**: Managed via service methods; defaults to first registered provider.
- No external configs; all via code/runtime registration.
- Environment variables: None explicitly used; provider implementations may require (e.g., DOCKER_HOST).

## API Reference

### SandboxService

- `registerSandboxProvider(name: string, resource: SandboxProvider): void`
- `setActiveSandboxProviderName(name: string): void`
- `getActiveSandboxProviderName(): string | null`
- `getAvailableSandboxProviders(): string[]`
- `createContainer(options?: SandboxOptions): Promise<SandboxResult>`
- `executeCommand(containerId: string, command: string): Promise<ExecuteResult>`
- `stopContainer(containerId: string): Promise<void>`
- `getLogs(containerId: string): Promise<LogsResult>`
- `removeContainer(containerId: string): Promise<void>`
- `getActiveContainer(): string | null`
- `setActiveContainer(containerId: string): void`

### SandboxProvider (Abstract)

- `createContainer(options?: SandboxOptions): Promise<SandboxResult>`
- `executeCommand(containerId: string, command: string): Promise<ExecuteResult>`
- `stopContainer(containerId: string): Promise<void>`
- `getLogs(containerId: string): Promise<LogsResult>`
- `removeContainer(containerId: string): Promise<void`

### Tools (e.g., sandbox/createContainer)

- `execute(params: { image?: string; ... }, agent: Agent): Promise<Result>`

### Chat Command: /sandbox

- `execute(remainder: string, agent: Agent): Promise<void>`

## Dependencies

- `@tokenring-ai/agent`: For agent integration and service management.
- `zod`: For input validation in tools.

## Contributing/Notes

- **Testing**: Unit tests for service/tools should mock providers. Integration tests require concrete implementations (
  e.g., Docker).
- **Building**: Use `npm run build` if configured; package uses ES modules (`type: module`).
- **Limitations**: Abstract only—no built-in providers. Error handling focuses on missing resources; add
  timeouts/retries in implementations. Binary execution assumes text output; logs are strings.
- **Extending**: Implement `SandboxProvider` for new backends (e.g., AWS Firecracker). Register via `SandboxService`.
- License: MIT (see LICENSE).

For issues or contributions, refer to the Token Ring AI repository guidelines.