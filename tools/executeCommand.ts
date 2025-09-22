import Agent from "@tokenring-ai/agent/Agent";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

export const name = "sandbox/executeCommand";

export async function execute(
  {
    containerId,
    command
  }: {
    containerId?: string;
    command?: string;
  },
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

export const description = "Execute a command in a sandbox container";

export const inputSchema = z.object({
  containerId: z.string().optional().describe("Container ID (uses active container if not specified)"),
  command: z.string().min(1).describe("Command to execute"),
});