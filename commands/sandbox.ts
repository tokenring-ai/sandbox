import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import SandboxService from "../SandboxService.js";

const description = "/sandbox - Sandbox container operations";

const help: string = `# 📦 /sandbox [action] - Sandbox Container Operations

Manage and interact with sandbox containers for development and testing.

## Available Actions

### create <label> [image]

Create a new sandbox container
- **<label>** - Container label (required)
- **[image]** - Container image (optional, e.g., 'ubuntu:latest')

**Example:**
/sandbox create myapp ubuntu:22.04

### exec <command>

Execute command in active container
- **<command>** - Command to execute (required)
- **Requires**: Active container must exist

**Example:**
/sandbox exec ls -la /app

### stop [label]

Stop a running container
- **[label]** - Container label (optional, uses active if not specified)

**Examples:**
/sandbox stop
/sandbox stop myapp

### logs [label]

Retrieve container logs
- **[label]** - Container label (optional, uses active if not specified)

**Examples:**
/sandbox logs
/sandbox logs myapp

### remove [label]

Remove a container
- **[label]** - Container label (optional, uses active if not specified)

**Examples:**
/sandbox remove
/sandbox remove myapp

### status

Show current sandbox status
- Displays active container and provider information

**Example:**
/sandbox status

### provider [name]

Manage sandbox provider
- **[name]** - Provider name (optional, shows current if not specified)
- Shows available providers when called without arguments

**Examples:**
/sandbox provider
/sandbox provider docker

## Common Usage Patterns

# Create and start a new Ubuntu container
/sandbox create myapp ubuntu:latest

# List files in the active container
/sandbox exec ls -la

# Stop the active container
/sandbox stop

# View container logs
/sandbox logs

# Check current status
/sandbox status

# Switch to Docker provider
/sandbox provider docker

## Notes

- Actions with optional [label] will use the active container if none is specified
- The 'exec' action requires an active container to be created first
- Container labels are used to reference containers instead of IDs`;

async function execute(remainder: string, agent: Agent): Promise<void> {
  const chat = agent.requireServiceByType(Agent);
  const sandbox = agent.requireServiceByType(SandboxService);

  const [action, ...args] = remainder.trim().split(/\s+/);
  if (!action) {
    agent.chatOutput(help);
    return;
  }

  if (action === "create") {
    const [label, image] = args;
    if (!label) {
      chat.errorLine("Usage: /sandbox create <label> [image]");
      return;
    }
    const result = await sandbox.createContainer({label, image});
    chat.infoLine(`Container created: ${result.containerId} (${result.status})`);
  } else if (action === "exec") {
    const command = args.join(" ");
    if (!command) {
      chat.errorLine("Usage: /sandbox exec <command>");
      return;
    }
    const activeContainer = sandbox.getActiveContainer();
    if (!activeContainer) {
      chat.errorLine("No active container. Create one first with /sandbox create");
      return;
    }
    const result = await sandbox.executeCommand(activeContainer, command);
    if (result.stdout) chat.infoLine(`stdout: ${result.stdout}`);
    if (result.stderr) chat.errorLine(`stderr: ${result.stderr}`);
    chat.infoLine(`Exit code: ${result.exitCode}`);
  } else if (action === "stop") {
    const label = args[0] || sandbox.getActiveContainer();
    if (!label) {
      chat.errorLine("No container specified and no active container");
      return;
    }
    await sandbox.stopContainer(label);
    chat.infoLine(`Container stopped: ${label}`);
  } else if (action === "logs") {
    const label = args[0] || sandbox.getActiveContainer();
    if (!label) {
      chat.errorLine("No container specified and no active container");
      return;
    }
    const result = await sandbox.getLogs(label);
    chat.infoLine(`Logs:\n${result.logs}`);
  } else if (action === "remove") {
    const label = args[0] || sandbox.getActiveContainer();
    if (!label) {
      chat.errorLine("No container specified and no active container");
      return;
    }
    await sandbox.removeContainer(label);
    chat.infoLine(`Container removed: ${label}`);
  } else if (action === "status") {
    const activeContainer = sandbox.getActiveContainer();
    const activeProvider = sandbox.getActiveSandboxProviderName();
    chat.infoLine(`Active container: ${activeContainer || "none"}`);
    chat.infoLine(`Active provider: ${activeProvider || "none"}`);
  } else if (action === "provider") {
    if (args[0]) {
      sandbox.setActiveSandboxProviderName(args[0]);
      chat.infoLine(`Active provider set to: ${args[0]}`);
    } else {
      const active = sandbox.getActiveSandboxProviderName();
      const available = sandbox.getAvailableSandboxProviders();
      chat.infoLine(`Active provider: ${active || "none"}`);
      chat.infoLine(`Available providers: ${available.join(", ")}`);
    }
  } else {
    chat.infoLine("Unknown action. Use: create, exec, stop, logs, remove, status, provider");
  }
}
export default {
  description,
  execute,
  help,
} as TokenRingAgentCommand