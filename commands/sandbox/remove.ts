import Agent from "@tokenring-ai/agent/Agent";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import SandboxService from "../../SandboxService.ts";

export async function remove(remainder: string, agent: Agent): Promise<string> {
  const sandbox = agent.requireServiceByType(SandboxService);
  const label = remainder.trim() || sandbox.getActiveContainer(agent);
  
  if (!label) {
    throw new CommandFailedError("No container specified and no active container");
  }
  
  await sandbox.removeContainer(label, agent);
  return `Container removed: ${label}`;
}
