import Agent from "@tokenring-ai/agent/Agent";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

export const name = "sandbox/getLogs";

export async function execute(
  {
    containerId
  }: {
    containerId?: string;
  },
  agent: Agent,
): Promise<{ logs: string }> {
  const chat = agent.requireFirstServiceByType(Agent);
  const sandbox = agent.requireFirstServiceByType(SandboxService);

  const targetContainer = containerId || sandbox.getActiveContainer();
  if (!targetContainer) {
    throw new Error(`[${name}] No container specified and no active container`);
  }

  chat.infoLine(`[${name}] Getting logs for container: ${targetContainer}`);
  const result = await sandbox.getLogs(targetContainer);

  return result;
}

export const description = "Get logs from a sandbox container";

export const inputSchema = z.object({
  containerId: z.string().optional().describe("Container ID (uses active container if not specified)"),
});