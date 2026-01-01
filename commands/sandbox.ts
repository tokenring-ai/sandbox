import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import createSubcommandRouter from "@tokenring-ai/agent/util/subcommandRouter";
import {create} from "./sandbox/create.ts";
import {exec} from "./sandbox/exec.ts";
import {logs} from "./sandbox/logs.ts";
import provider from "./sandbox/provider.ts";
import {remove} from "./sandbox/remove.ts";
import {status} from "./sandbox/status.ts";
import {stop} from "./sandbox/stop.ts";

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

const execute = createSubcommandRouter({
  create,
  exec,
  stop,
  logs,
  remove,
  status,
  provider,
});
export default {
  description,
  execute,
  help,
} satisfies TokenRingAgentCommand