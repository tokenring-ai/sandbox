import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

const name = "sandbox_getLogs";

async function execute(
  {
    label
  }: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<{ logs: string }> {
  const sandbox = agent.requireServiceByType(SandboxService);

  const targetLabel = label || sandbox.getActiveContainer();
  if (!targetLabel) {
    throw new Error(`[${name}] No container specified and no active container`);
  }

  agent.infoLine(`[${name}] Getting logs for container: '${targetLabel}'`);
  return await sandbox.getLogs(targetLabel);
}

const description = "Get logs from a sandbox container";

const inputSchema = z.object({
  label: z.string().optional().describe("Container label (uses active container if not specified)"),
});

export default {
  name, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;