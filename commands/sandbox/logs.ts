import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import SandboxService from "../../SandboxService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const label = remainder.trim() || sandbox.getActiveContainer(agent);
  if (!label) throw new CommandFailedError("No container specified and no active container");
  const result = await sandbox.getLogs(label, agent);
  return `Logs:\n${result.logs}`;
}

export default {
  name: "sandbox logs", description: "Get container logs", help: `# /sandbox logs [label]

Retrieve logs from a container. Uses the active container if no label is specified.

## Example

/sandbox logs
/sandbox logs myapp`, execute } satisfies TokenRingAgentCommand;
