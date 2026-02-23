import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import SandboxService from "../../SandboxService.ts";

export async function create(remainder: string, agent: Agent): Promise<string> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const [label, image] = remainder.trim().split(/\s+/);
  
  if (!label) {
    throw new CommandFailedError("Usage: /sandbox create <label> [image]");
  }
  
  const result = await sandbox.createContainer({label, image}, agent);
  return `Container created: ${result.containerId} (${result.status})`;
}
