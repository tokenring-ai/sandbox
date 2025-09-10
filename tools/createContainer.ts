import Agent from "@tokenring-ai/agent/Agent";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

export const name = "sandbox/createContainer";

export async function execute(
  {
    image,
    workingDir,
    environment,
    timeout
  }: {
    image?: string;
    workingDir?: string;
    environment?: Record<string, string>;
    timeout?: number;
  },
  agent: Agent,
): Promise<{ containerId: string; status: string }> {
  const chat = agent.requireFirstServiceByType(Agent);
  const sandbox = agent.requireFirstServiceByType(SandboxService);

  chat.infoLine(`[${name}] Creating container${image ? ` with image: ${image}` : ""}`);
  const result = await sandbox.createContainer({
    image,
    workingDir,
    environment,
    timeout
  });

  chat.infoLine(`[${name}] Container created: ${result.containerId}`);
  return result;
}

export const description = "Create a new sandbox container using the active sandbox provider";

export const inputSchema = z.object({
  image: z.string().optional().describe("Container image to use"),
  workingDir: z.string().optional().describe("Working directory in container"),
  environment: z.record(z.string(), z.string()).optional().describe("Environment variables"),
  timeout: z.number().optional().describe("Timeout in seconds"),
});