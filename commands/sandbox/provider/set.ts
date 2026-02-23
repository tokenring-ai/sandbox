import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import SandboxService from "../../../SandboxService.ts";

export async function set(remainder: string, agent: Agent): Promise<string> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const providerName = remainder.trim();

  if (!providerName) {
    throw new CommandFailedError("Usage: /sandbox provider set <name>");
  }

  const available = sandbox.getAvailableProviders();
  if (available.includes(providerName)) {
    sandbox.setActiveProvider(providerName, agent);
    return `Provider set to: ${providerName}`;
  } else {
    return `Provider "${providerName}" not found. Available providers: ${available.join(", ")}`;
  }
}
