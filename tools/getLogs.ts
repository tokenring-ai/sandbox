import ChatService from "@token-ring/chat/ChatService";
import type {Registry} from "@token-ring/registry";
import {z} from "zod";
import SandboxService from "../SandboxService.js";

export const name = "sandbox/getLogs";

export async function execute(
  {
    containerId
  }: {
    containerId?: string;
  },
  registry: Registry,
): Promise<{ logs: string }> {
  const chat = registry.requireFirstServiceByType(ChatService);
  const sandbox = registry.requireFirstServiceByType(SandboxService);

  const targetContainer = containerId || sandbox.getActiveContainer();
  if (!targetContainer) {
    throw new Error(`[${name}] No container specified and no active container`);
  }

  chat.infoLine(`[${name}] Getting logs for container: ${targetContainer}`);
  const result = await sandbox.getLogs(targetContainer);
  
  return result;
}

export const description = "Get logs from a sandbox container";

export const inputSchema = z.object({
  containerId: z.string().optional().describe("Container ID (uses active container if not specified)"),
});