import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import SandboxService from "../../SandboxService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const command = remainder.trim();
  if (!command) throw new CommandFailedError("Usage: /sandbox exec <command>");
  const active = sandbox.getActiveContainer(agent);
  if (!active) throw new CommandFailedError("No active container. Create one first with /sandbox create");
  const result = await sandbox.executeCommand(active, command, agent);
  const lines: string[] = [];
  if (result.stdout) lines.push(`stdout: ${result.stdout}`);
  if (result.stderr) lines.push(`stderr: ${result.stderr}`);
  lines.push(`Exit code: ${result.exitCode}`);
  return lines.join("\n");
}

export default {
  name: "sandbox exec", description: "Execute a command in the active container", help: `# /sandbox exec <command>

Execute a command in the active container. Requires an active container to exist.

## Example

/sandbox exec ls -la /app`, execute } satisfies TokenRingAgentCommand;
