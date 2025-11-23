import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

const name = "sandbox/getLogs";

async function execute(
  {
    containerId
  }: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<{ logs: string }> {
  const chat = agent.requireServiceByType(Agent);
  const sandbox = agent.requireServiceByType(SandboxService);

  const targetContainer = containerId || sandbox.getActiveContainer();
  if (!targetContainer) {
    throw new Error(`[${name}] No container specified and no active container`);
  }

  chat.infoLine(`[${name}] Getting logs for container: ${targetContainer}`);
  const result = await sandbox.getLogs(targetContainer);

  return result;
}

const description = "Get logs from a sandbox container";

const inputSchema = z.object({
  containerId: z.string().optional().describe("Container ID (uses active container if not specified)"),
});

export default {
  name, description, inputSchema, execute,
} as TokenRingToolDefinition<typeof inputSchema>;