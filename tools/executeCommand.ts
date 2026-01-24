import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/schema";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

const name = "sandbox_executeCommand";
const displayName = "Sandbox/executeCommand";

async function execute(
  {
    label,
    command
  }: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const sandbox = agent.requireServiceByType(SandboxService);

  if (!command) {
    throw new Error(`[${name}] command is required`);
  }

  const targetLabel = label || sandbox.getActiveContainer(agent);
  if (!targetLabel) {
    throw new Error(`[${name}] No container specified and no active container`);
  }

  agent.infoMessage(`[${name}] Executing in '${targetLabel}': ${command}`);
  const result = await sandbox.executeCommand(targetLabel, command, agent);

  if (result.exitCode !== 0) {
    agent.errorMessage(`[${name}] Command failed with exit code ${result.exitCode}`);
  }

  return result;
}

const description = "Execute a command in a sandbox container";

const inputSchema = z.object({
  label: z.string().optional().describe("Container label (uses active container if not specified)"),
  command: z.string().min(1).describe("Command to execute"),
});

export default {
  name, displayName, description, inputSchema, execute,
} satisfies TokenRingToolDefinition<typeof inputSchema>;