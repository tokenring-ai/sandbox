import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import SandboxService from "../../SandboxService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const label = remainder.trim() || sandbox.getActiveContainer(agent);
  if (!label) throw new CommandFailedError("No container specified and no active container");
  await sandbox.stopContainer(label, agent);
  return `Container stopped: ${label}`;
}

export default { name: "sandbox stop", description: "/sandbox stop - Stop a container", help: `# /sandbox stop [label]

Stop a running container. Uses the active container if no label is specified.

## Example

/sandbox stop
/sandbox stop myapp`, execute } satisfies TokenRingAgentCommand;
