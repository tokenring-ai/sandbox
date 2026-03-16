import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import SandboxService from "../../SandboxService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const [label, image] = remainder.trim().split(/\s+/);
  if (!label) throw new CommandFailedError("Usage: /sandbox create <label> [image]");
  const result = await agent.requireServiceByType(SandboxService).createContainer({label, image}, agent);
  return `Container created: ${result.containerId} (${result.status})`;
}

export default {
  name: "sandbox create", description: "Create a container", help: `# /sandbox create <label> [image]

Create a new sandbox container with an optional image.

## Example

/sandbox create myapp
/sandbox create myapp ubuntu:22.04`, execute } satisfies TokenRingAgentCommand;
