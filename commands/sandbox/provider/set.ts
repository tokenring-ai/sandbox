import Agent from "@tokenring-ai/agent/Agent";
import SandboxService from "../../../SandboxService.ts";

export async function set(remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const providerName = remainder.trim();

  if (!providerName) {
    agent.errorMessage("Usage: /sandbox provider set <name>");
    return;
  }

  const available = sandbox.getAvailableProviders();
  if (available.includes(providerName)) {
    sandbox.setActiveProvider(providerName, agent);
    agent.infoMessage(`Provider set to: ${providerName}`);
  } else {
    agent.infoMessage(`Provider "${providerName}" not found. Available providers: ${available.join(", ")}`);
  }
}
