import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition, type TokenRingToolJSONResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

const name = "sandbox_removeContainer";
const displayName = "Sandbox/removeContainer";

async function execute(
  {
    label
  }: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolJSONResult<{ success: boolean }>> {
  const sandbox = agent.requireServiceByType(SandboxService);

  const targetLabel = label || sandbox.getActiveContainer(agent);
  if (!targetLabel) {
    throw new Error(`[${name}] No container specified and no active container`);
  }

  agent.infoMessage(`[${name}] Removing container: '${targetLabel}'`);
  await sandbox.removeContainer(targetLabel, agent);

  return {
    type: "json",
    data: {success: true}
  };
}

const description = "Remove a sandbox container";

const inputSchema = z.object({
  label: z.string().optional().describe("Container label (uses active container if not specified)"),
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;