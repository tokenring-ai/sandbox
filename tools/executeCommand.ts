import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

const name = "sandbox/executeCommand";

async function execute(
  {
    containerId,
    command
  }: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const chat = agent.requireServiceByType(Agent);
  const sandbox = agent.requireServiceByType(SandboxService);

  if (!command) {
    throw new Error(`[${name}] command is required`);
  }

  const targetContainer = containerId || sandbox.getActiveContainer();
  if (!targetContainer) {
    throw new Error(`[${name}] No container specified and no active container`);
  }

  chat.infoLine(`[${name}] Executing in ${targetContainer}: ${command}`);
  const result = await sandbox.executeCommand(targetContainer, command);

  if (result.exitCode !== 0) {
    chat.errorLine(`[${name}] Command failed with exit code ${result.exitCode}`);
  }

  return result;
}

const description = "Execute a command in a sandbox container";

const inputSchema = z.object({
  containerId: z.string().optional().describe("Container ID (uses active container if not specified)"),
  command: z.string().min(1).describe("Command to execute"),
});

export default {
  name, description, inputSchema, execute,
} as TokenRingToolDefinition<typeof inputSchema>;