import Agent from "@tokenring-ai/agent/Agent";
import SandboxService from "../../SandboxService.ts";

export async function remove(remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const label = remainder.trim() || sandbox.getActiveContainer(agent);
  
  if (!label) {
    agent.errorMessage("No container specified and no active container");
    return;
  }
  
  await sandbox.removeContainer(label, agent);
  agent.infoMessage(`Container removed: ${label}`);
}
