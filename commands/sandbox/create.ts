import Agent from "@tokenring-ai/agent/Agent";
import SandboxService from "../../SandboxService.ts";

export async function create(remainder: string, agent: Agent): Promise<void> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const [label, image] = remainder.trim().split(/\s+/);
  
  if (!label) {
    agent.errorLine("Usage: /sandbox create <label> [image]");
    return;
  }
  
  const result = await sandbox.createContainer({label, image}, agent);
  agent.infoLine(`Container created: ${result.containerId} (${result.status})`);
}
