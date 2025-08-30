# @token-ring/sandbox

Abstract sandbox interface for the Token Ring ecosystem. This package provides a unified interface for container-based sandbox operations that can be implemented by different providers (Docker, Kubernetes, remote sandboxing services, etc.).

## Core Components

### SandboxResource (Abstract Base Class)

The abstract `SandboxResource` class defines a standardized interface for sandbox operations. Concrete implementations should extend this class.

**Key Methods:**
- `createContainer(options?: SandboxOptions): Promise<SandboxResult>` - Create a new container
- `executeCommand(containerId: string, command: string): Promise<ExecuteResult>` - Execute command in container
- `stopContainer(containerId: string): Promise<void>` - Stop a container
- `getLogs(containerId: string): Promise<LogsResult>` - Get container logs
- `removeContainer(containerId: string): Promise<void>` - Remove a container

### SandboxService

Manages multiple sandbox resources and provides a unified interface for sandbox operations. Tracks the currently active container (one at a time).

### Tools

- **`createContainer`** - Create a new sandbox container
- **`executeCommand`** - Execute a command in a container
- **`stopContainer`** - Stop a container
- **`getLogs`** - Get logs from a container
- **`removeContainer`** - Remove a container

### Chat Command

- **`/sandbox`** - Sandbox operations from the CLI

## Usage

Concrete implementations (e.g., Docker, Kubernetes) should extend `SandboxResource` and implement the abstract methods. The service automatically manages provider selection and tracks the active container.

## Examples

```
/sandbox create ubuntu:latest
/sandbox exec ls -la
/sandbox exec "echo 'Hello World' > test.txt"
/sandbox logs
/sandbox stop
/sandbox provider docker
```

## Implementation Example

```typescript
import SandboxResource from "@token-ring/sandbox/SandboxResource";

export class DockerSandboxResource extends SandboxResource {
  async createContainer(options) {
    // Docker-specific implementation
    return { containerId: "abc123", status: "running" };
  }
  
  async executeCommand(containerId, command) {
    // Execute command via Docker API
    return { stdout: "output", stderr: "", exitCode: 0 };
  }
  
  // ... implement other methods
}
```