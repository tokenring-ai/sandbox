import Agent from "@tokenring-ai/agent/Agent";
import {TokenRingToolDefinition} from "@tokenring-ai/chat/types";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

const name = "sandbox/createContainer";

async function execute(
  {
    image,
    workingDir,
    environment,
    timeout
  }: z.infer<typeof inputSchema>,
  agent: Agent,
): Promise<{ containerId: string; status: string }> {
  const chat = agent.requireServiceByType(Agent);
  const sandbox = agent.requireServiceByType(SandboxService);

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

const description = "Create a new sandbox container using the active sandbox provider";

const inputSchema = z.object({
  image: z.string().optional().describe("Container image to use"),
  workingDir: z.string().optional().describe("Working directory in container"),
  environment: z.record(z.string(), z.string()).optional().describe("Environment variables"),
  timeout: z.number().optional().describe("Timeout in seconds"),
});

export default {
  name, description, inputSchema, execute,
} as TokenRingToolDefinition<typeof inputSchema>;