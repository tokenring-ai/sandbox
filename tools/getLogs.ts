import type Agent from "@tokenring-ai/agent/Agent";
import type {TokenRingToolDefinition, TokenRingToolResult} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import SandboxService from "../SandboxService.ts";

const name = "sandbox_getLogs";
const displayName = "Sandbox/getLogs";

async function execute(
  {label}: z.output<typeof inputSchema>,
  agent: Agent,
): Promise<TokenRingToolResult> {
  const sandbox = agent.requireServiceByType(SandboxService);

  const targetLabel = label || sandbox.getActiveContainer(agent);
  if (!targetLabel) {
    throw new Error(`[${name}] No container specified and no active container`);
  }

  agent.infoMessage(`[${name}] Getting logs for container: '${targetLabel}'`);
  const result = await sandbox.getLogs(targetLabel, agent);
  return {
    summary: `Retrieved logs from container ${targetLabel}`,
    result: JSON.stringify(result),
  };
}

const description = "Get logs from a sandbox container";

const inputSchema = z.object({
  label: z
    .string()
    .optional()
    .describe("Container label (uses active container if not specified)"),
});

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
