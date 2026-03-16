import type {AgentCommandInputSchema, AgentCommandInputType, TokenRingAgentCommand} from "@tokenring-ai/agent/types";
import {CommandFailedError} from "@tokenring-ai/agent/AgentError";
import SandboxService from "../../../SandboxService.ts";

const inputSchema = {
  args: {},
  positionals: [{
    name: "providerName",
    description: "Provider name",
    required: true,
  }],
  allowAttachments: false,
} as const satisfies AgentCommandInputSchema;

export default {
  name: "sandbox provider set",
  description: "Set the active provider",
  help: `Set the active sandbox provider by name.

## Example

/sandbox provider set docker`,
  inputSchema,
  execute: async ({positionals: { providerName }, agent}: AgentCommandInputType<typeof inputSchema>): Promise<string> => {
    const sandbox = agent.requireServiceByType(SandboxService);

    const available = sandbox.getAvailableProviders();
    if (available.includes(providerName)) {
      sandbox.setActiveProvider(providerName, agent);
      return `Provider set to: ${providerName}`;
    }
    return `Provider "${providerName}" not found. Available providers: ${available.join(", ")}`;
  },
} satisfies TokenRingAgentCommand<typeof inputSchema>;
