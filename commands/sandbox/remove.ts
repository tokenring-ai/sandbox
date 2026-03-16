import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import SandboxService from "../../SandboxService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const label = remainder.trim() || sandbox.getActiveContainer(agent);
  if (!label) throw new CommandFailedError("No container specified and no active container");
  await sandbox.removeContainer(label, agent);
  return `Container removed: ${label}`;
}

export default {
  name: "sandbox remove", description: "Remove a container", help: `# /sandbox remove [label]

Remove a container. Uses the active container if no label is specified.

## Example

/sandbox remove
/sandbox remove myapp`, execute } satisfies TokenRingAgentCommand;
