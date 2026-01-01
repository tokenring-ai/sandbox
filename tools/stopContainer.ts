import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

const name = "sandbox_stopContainer";

async function execute(
  {
    label
  }: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<{ success: boolean }> {
  const sandbox = agent.requireServiceByType(SandboxService);

  const targetLabel = label || sandbox.getActiveContainer(agent);
  if (!targetLabel) {
    throw new Error(`[${name}] No container specified and no active container`);
  }

  agent.infoLine(`[${name}] Stopping container: '${targetLabel}'`);
  await sandbox.stopContainer(targetLabel, agent);

  return {success: true};
}

const description = "Stop a sandbox container";

const inputSchema = z.object({
  label: z.string().optional().describe("Container label (uses active container if not specified)"),
});

export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;