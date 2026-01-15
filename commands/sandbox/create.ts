import Agent from "@tokenring-ai/agent/Agent";
import SandboxService from "../../SandboxService.ts";

export async function create(remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const [label, image] = remainder.trim().split(/\s+/);
  
  if (!label) {
    agent.errorMessage("Usage: /sandbox create <label> [image]");
    return;
  }
  
  const result = await sandbox.createContainer({label, image}, agent);
  agent.infoMessage(`Container created: ${result.containerId} (${result.status})`);
}
