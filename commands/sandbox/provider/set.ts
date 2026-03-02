import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import {TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import SandboxService from "../../../SandboxService.ts";

async function execute(remainder: string, agent: Agent): Promise<string> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const providerName = remainder.trim();
  if (!providerName) throw new CommandFailedError("Usage: /sandbox provider set <name>");
  const available = sandbox.getAvailableProviders();
  if (available.includes(providerName)) {
    sandbox.setActiveProvider(providerName, agent);
    return `Provider set to: ${providerName}`;
  }
  return `Provider "${providerName}" not found. Available providers: ${available.join(", ")}`;
}

export default { name: "sandbox provider set", description: "/sandbox provider set - Set the active provider", help: `# /sandbox provider set <name>

Set the active sandbox provider by name.

## Example

/sandbox provider set docker`, execute } satisfies TokenRingAgentCommand;
