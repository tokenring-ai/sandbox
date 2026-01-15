import Agent from "@tokenring-ai/agent/Agent";
import SandboxService from "../../SandboxService.ts";

export async function stop(remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const label = remainder.trim() || sandbox.getActiveContainer(agent);
  
  if (!label) {
    agent.errorMessage("No container specified and no active container");
    return;
  }
  
  await sandbox.stopContainer(label, agent);
  agent.infoMessage(`Container stopped: ${label}`);
}
